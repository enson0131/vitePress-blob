import { useEffect, useReducer, useRef, useState } from "react";
import type { FormEvent } from "react";
import { chatReducer, isPending, canRetry, labels } from "../shared/chat-state.ts";
import type { Target, Turn } from "../shared/chat-state.ts";
import { ownsController } from "../shared/active-request.ts";
import { buildHistory } from "../shared/history.ts";
import type { ChatRequest, Scenario } from "../shared/request.ts";
import { readChat } from "./readChat.ts";

type ActiveRequest = Target & { controller: AbortController; timer: number };
export default function App() {
  const [state, dispatch] = useReducer(chatReducer, undefined, () => ({
    conversationId: crypto.randomUUID(), turns: []
  }));
  const [question, setQuestion] = useState("");
  const [scenario, setScenario] = useState("");
  const [notice, setNotice] = useState("");
  const [lastRequest, setLastRequest] = useState<ChatRequest | null>(null);
  const active = useRef<ActiveRequest | null>(null);
  const busy = state.turns.some(t => isPending(t.status));

  useEffect(() => () => {
    const request = active.current; active.current = null;
    if (request) { clearTimeout(request.timer); request.controller.abort("unmount"); }
  }, []);

  function stop(reason = "user") {
    const request = active.current;
    if (!request) return;
    active.current = null; // 先作废所有权，再取消网络。
    clearTimeout(request.timer);
    dispatch({ type: "interrupt", conversationId: request.conversationId, turnId: request.turnId, status: "stopped", notice: "已停止；保留草稿，不进入后续历史。" });
    request.controller.abort(reason);
  }
  function newConversation() {
    stop("switch");
    dispatch({ type: "reset", conversationId: crypto.randomUUID() });
    setQuestion(""); setNotice(""); setLastRequest(null);
  }

  async function generate(retry?: Turn) {
    if (active.current || busy) return;
    const text = retry?.question ?? question.trim();
    if (!text) return;
    if (retry && (state.turns.at(-1)?.id !== retry.id || !canRetry(retry.status))) return;
    let history;
    try { history = buildHistory(retry ? state.turns.slice(0, -1) : state.turns); }
    catch (e) { setNotice(e instanceof Error ? e.message : "历史组装失败。"); return; }
    const target: Target = { conversationId: state.conversationId,
      turnId: retry?.id ?? crypto.randomUUID() };
    const controller = new AbortController();
    const pending: ActiveRequest = { ...target, controller,
      timer: window.setTimeout(() => controller.abort("timeout"), 35_000) };
    active.current = pending;
    const request: ChatRequest = { conversationId: target.conversationId, turnId: target.turnId,
      question: text, history, ...(scenario ? { scenario: scenario as Scenario } : {}) };
    setLastRequest(request); setNotice("");
    if (retry) dispatch({ type: "retry", ...target });
    else {
      dispatch({ type: "start", conversationId: target.conversationId, turn: {
        id: target.turnId, question: text,
        answer: "", status: "waiting", notice: ""
      } });
      setQuestion("");
    }
    try {
      const response = await fetch("/api/chat/stream", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request), signal: controller.signal
      });
      const end = await readChat(response, delta => {
        if (!ownsController(active.current, controller) || controller.signal.aborted) return;
        dispatch({ type: "delta", ...target, text: delta });
      }, controller.signal);
      if (!ownsController(active.current, controller)) return;
      controller.signal.throwIfAborted();
      dispatch({ type: "end", ...target, status: end.status, text: end.text });
    } catch (e) {
      if (!ownsController(active.current, controller)) return;
      dispatch({ type: "interrupt", ...target, status: "failed",
        notice: controller.signal.aborted ? "等待超时，请手动重试。" : e instanceof Error ? e.message : "请求失败。" });
    } finally {
      clearTimeout(pending.timer);
      if (ownsController(active.current, controller)) active.current = null;
    }
  }
  function send(e: FormEvent<HTMLFormElement>) { e.preventDefault(); void generate(); }

  return <main>
    <header><div><h1>接上上一句话</h1><p>第16篇 · 多轮文本聊天与消息状态</p></div>
      <button type="button" onClick={newConversation}>新会话</button></header>
    <p className="hint">仅保留内存中的聊天，刷新会清空。模型输入保留全部 answered 完整问答，不按轮数裁剪；超长会报错而不静默删除。
      停止、失败、截断和拒绝整轮不自动加入历史；本课不是事实检查或权限系统。</p>
    <small>会话：<code data-testid="conversation-id">{state.conversationId}</code></small>
    <section aria-label="消息列表" className="messages">
      {state.turns.length === 0 && <p className="empty">试试：先说“我叫小陈”，再问“我叫什么？”</p>}
      {state.turns.map((t, i) => <section key={t.id} className="turn" data-turn-id={t.id}>
        <article key={`${t.id}:user`} className="user"><b>我</b><p>{t.question}</p></article>
        <article key={`${t.id}:assistant`} className="assistant">
          <b>助手</b><p>{t.answer || "（尚无正文）"}</p>
          <div className="status" data-status={t.status}>{labels[t.status]}</div>
          {t.notice && <p className="notice">{t.notice}</p>}
          {i === state.turns.length - 1 && canRetry(t.status) &&
            <button type="button" disabled={busy} onClick={() => void generate(t)}>重新回答这一题</button>}
        </article>
      </section>)}
    </section>
    <form onSubmit={send}>
      <label htmlFor="q">问题</label>
      <textarea id="q" value={question} disabled={busy} maxLength={2000} onChange={e => setQuestion(e.target.value)} />
      <label htmlFor="scenario">本地模拟场景（真实模式保持默认）</label>
      <select id="scenario" value={scenario} disabled={busy} onChange={e => setScenario(e.target.value)}>
        <option value="">正常完成</option><option value="incomplete">生成上限</option>
        <option value="failed">流中错误</option><option value="refused">拒绝</option><option value="disconnect">无结束事件就断线</option>
      </select>
      <div className="actions"><button disabled={busy || !question.trim()}>发送</button>
        <button type="button" disabled={!busy} onClick={() => stop()}>停止生成</button></div>
    </form>
    {notice && <p role="alert">{notice}</p>}
    <details><summary>最近一次实际请求（不含密钥）</summary>
      <pre data-testid="request">{JSON.stringify(lastRequest, null, 2)}</pre></details>
    <p className="hint">模拟模式通过固定规则读取名字，不是大模型能力演示。客户端历史可被修改；不要直接部署为公共服务。</p>
  </main>;
}
