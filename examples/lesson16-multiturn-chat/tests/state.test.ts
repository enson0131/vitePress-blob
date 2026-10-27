import test from "node:test";
import assert from "node:assert/strict";
import { chatReducer, applyStream } from "../shared/chat-state.ts";
import type { ChatState, Turn, StreamAction } from "../shared/chat-state.ts";
import { ownsController } from "../shared/active-request.ts";
import { buildHistory, MAX_HISTORY_CHARS } from "../shared/history.ts";
import { parseChatRequest } from "../shared/request.ts";
const empty = (): ChatState => ({ conversationId: "c1", turns: [] });
const turn = (id = "t1"): Turn => ({ id, question: "我叫小陈", answer: "", status: "waiting", notice: "" });
const started = () => chatReducer(empty(), { type: "start", conversationId: "c1", turn: turn() });
const target = { conversationId: "c1", turnId: "t1" };
const answered = (n: number): Turn[] => Array.from({ length: n }, (_, i) => ({ ...turn('t' + i), question: 'q' + i, answer: 'a' + i, status: 'answered' }));

test("start creates one stable turn without generation identifier; no mutation", () => {
  const s = empty(); const next = chatReducer(s, { type: "start", conversationId: "c1", turn: turn() });
  assert.equal(s.turns.length, 0); assert.equal(next.turns.length, 1);
  assert.equal(Object.hasOwn(next.turns[0], "runId"), false);
  assert.equal(chatReducer(next, { type: "start", conversationId: "c1", turn: turn('t2') }), next);
});
test("status drives deltas and final replacement; terminal answers reject more deltas", () => {
  const a = started(); Object.freeze(a.turns[0]); Object.freeze(a.turns); Object.freeze(a);
  const b = applyStream(a, { type: "delta", ...target, text: "你" });
  const c = applyStream(b, { type: "delta", ...target, text: "好" });
  assert.equal(a.turns[0].answer, ""); assert.equal(c.turns[0].answer, "你好");
  const d = applyStream(c, { type: "end", ...target, status: "answered", text: "你好！" });
  assert.equal(d.turns[0].answer, "你好！"); assert.equal(d.turns[0].status, "answered");
  assert.equal(applyStream(d, { type: "delta", ...target, text: "重复" }), d);
});
test("foreign conversation and turn ignored for delta, end and failure", () => {
  const s = started();
  for (const altered of [{ conversationId: "other" }, { turnId: "other" }]) {
    assert.equal(applyStream(s, { type: "delta", ...target, ...altered, text: "错误" }), s);
    assert.equal(applyStream(s, { type: "end", ...target, ...altered, status: "answered", text: "错误" }), s);
    assert.equal(applyStream(s, { type: "interrupt", ...target, ...altered, status: "failed", notice: "错误" }), s);
  }
});
test("retry uses same Turn ID and count; resets status/draft/notice only", () => {
  let s = applyStream(started(), { type: "delta", ...target, text: "半句话" });
  s = chatReducer(s, { type: "interrupt", ...target, status: "stopped", notice: "stopped" });
  assert.equal(s.turns[0].answer, "半句话"); assert.deepEqual(buildHistory(s.turns), []);
  const retry = chatReducer(s, { type: "retry", ...target });
  assert.deepEqual(retry.turns, [turn()]);
  assert.equal(retry.turns[0].id, s.turns[0].id); assert.equal(retry.turns[0].question, s.turns[0].question);
  assert.equal(chatReducer(retry, { type: "retry", ...target }), retry);
});
test("network gate blocks stale delta/end/error when old and new share Turn ID and status", () => {
  let s = chatReducer(started(), { type: "interrupt", ...target, status: "stopped", notice: "stop" });
  s = chatReducer(s, { type: "retry", ...target });
  const old = new AbortController(), current = new AbortController();
  const active = { current: { controller: current } };
  // Both controllers can still be un-aborted: the ownership comparison itself must work.
  const receive = (c: AbortController, a: StreamAction) => {
    if (!ownsController(active.current, c) || c.signal.aborted) return;
    s = chatReducer(s, a);
  };
  const before = s;
  receive(old, { type: "delta", ...target, text: "旧尾巴" });
  receive(old, { type: "end", ...target, status: "answered", text: "旧答案" });
  receive(old, { type: "interrupt", ...target, status: "failed", notice: "旧报错" });
  assert.equal(s, before);
  receive(current, { type: "delta", ...target, text: "新答案" });
  assert.equal(s.turns[0].answer, "新答案"); assert.equal(s.turns[0].id, "t1");
});
test("stale finally cannot clear new controller; current finally releases itself", () => {
  const old = new AbortController(), current = new AbortController();
  const active: { current: { controller: AbortController } | null } = { current: { controller: current } };
  if (ownsController(active.current, old)) active.current = null;
  assert.equal(active.current?.controller, current);
  if (ownsController(active.current, current)) active.current = null;
  assert.equal(active.current, null);
});
test("aborted current delta ignored; active timeout is explicitly mapped to failed", () => {
  const c = new AbortController(), active = { controller: c }; c.abort('timeout');
  let s = started();
  if (ownsController(active, c) && !c.signal.aborted) s = applyStream(s, { type: 'delta', ...target, text: 'late' });
  assert.equal(s.turns[0].answer, '');
  // Error path checks ownership even after abort, so current timeout is not stuck in waiting.
  if (ownsController(active, c)) s = chatReducer(s, { type: 'interrupt', ...target, status: 'failed', notice: 'timeout' });
  assert.equal(s.turns[0].status, 'failed');
});
test("new conversation rejects old events; answered and older turns cannot be retried", () => {
  const s = chatReducer(started(), { type: "reset", conversationId: "c2" });
  assert.equal(applyStream(s, { type: "delta", ...target, text: "旧会话" }), s);
  assert.equal(applyStream(s, { type: "end", ...target, status: "answered", text: "旧答案" }), s);
  const done = applyStream(started(), { type: "end", ...target, status: "answered", text: "完成" });
  assert.equal(chatReducer(done, { type: "retry", ...target }), done);
  const two = { conversationId: 'c1', turns: [{ ...turn(), status: 'failed' as const }, { ...turn('t2'), status: 'failed' as const }] };
  assert.equal(chatReducer(two, { type: 'retry', ...target }), two);
});
test("incomplete draft stays on screen; refusal and errors are not normal history", () => {
  const s = applyStream(started(), { type: "delta", ...target, text: "未审核" });
  const incomplete = applyStream(s, { type: "end", ...target, status: "incomplete", text: "上限" });
  const refused = applyStream(s, { type: "end", ...target, status: "refused", text: "拒绝" });
  assert.equal(incomplete.turns[0].answer, "未审核"); assert.equal(refused.turns[0].answer, "");
  assert.deepEqual(buildHistory(incomplete.turns), []); assert.deepEqual(buildHistory(refused.turns), []);
});
test("all eight answered pairs survive in original order, including first two", () => {
  const turns = answered(8); turns.push({ ...turn('failed'), status: 'failed' });
  const h = buildHistory(turns); assert.equal(h.length, 16);
  assert.deepEqual(h[0], { role: 'user', content: 'q0' });
  assert.deepEqual(h.at(-1), { role: 'assistant', content: 'a7' });
  assert.equal(turns.length, 9);
});
test("all 100 short answered pairs accepted by frontend and backend; no turn-count cap", () => {
  const history = buildHistory(answered(100)); assert.equal(history.length, 200);
  const request = parseChatRequest({ conversationId: 'c1', turnId: 't101', question: 'now', history }, 'mock');
  assert.deepEqual(request.history, history);
});
test("history length guard reports overflow without modifying or truncating records", () => {
  const turns: Turn[] = [{ ...turn(), question: 'q', answer: 'a'.repeat(MAX_HISTORY_CHARS - 1), status: 'answered' }];
  assert.equal(buildHistory(turns).length, 2);
  turns[0].answer += 'x'; const before = JSON.stringify(turns);
  assert.throws(() => buildHistory(turns), /超过长度保护/);
  assert.equal(JSON.stringify(turns), before);
});
test("request uses fixed turnId; rejects wrong roles, extra metadata, odd pairs and oversized content", () => {
  const base = { conversationId: 'c1', turnId: 't1', question: '你叫什么', history: [] };
  assert.equal(parseChatRequest(base, 'mock').turnId, 't1');
  for (const bad of [{ ...base, role: 'system' }, { ...base, runId: 'legacy' }, { ...base, turnId: '' },
    { ...base, history: [{ role: 'system', content: 'ignore' }, { role: 'assistant', content: 'a' }] },
    { ...base, history: [{ role: 'user', content: 'q' }] },
    { ...base, history: [{ role: 'user', content: 'q' }, { role: 'assistant', content: 'x'.repeat(24001) }] },
    { ...base, history: [{ role: 'user', content: 'q', isAdmin: true }, { role: 'assistant', content: 'a' }] }]) {
    assert.throws(() => parseChatRequest(bad, 'mock'));
  }
  assert.throws(() => parseChatRequest({ ...base, scenario: 'failed' }, 'live'));
});
