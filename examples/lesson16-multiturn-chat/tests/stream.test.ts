import test from "node:test";
import assert from "node:assert/strict";
import { once } from "node:events";
import type { AddressInfo } from "node:net";
import { readSSE } from "../shared/sse.ts";
import { readChat } from "../src/readChat.ts";
import { makeServer } from "../server/app.ts";
import { streamAnswer } from "../server/stream-model.ts";
import { parseFrame } from "../shared/events.ts";
import type { Scenario } from "../server/stream-model.ts";

const encode = new TextEncoder();
function chunks(text: string, size = 1) {
  const bytes = encode.encode(text);
  return new ReadableStream<Uint8Array>({ start(c) {
    for (let i = 0; i < bytes.length; i += size) c.enqueue(bytes.slice(i, i + size));
    c.close();
  } });
}
const response = (text: string, size = 1) => new Response(chunks(text, size), { headers: { "Content-Type": "text/event-stream" } });
async function collect<T>(generator: AsyncIterable<T>) { const out: T[] = []; for await (const v of generator) out.push(v); return out; }
const wire = (event: string, data: unknown) => `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;

test("SSE decodes UTF8 split at every byte; merges data lines and ignores comments", async () => {
  for (const eol of ["\n", "\r\n", "\r"]) {
    const text = [": ping", "event: delta", "data: 你好🙂", "data: 第二行", "", "event: end", 'data: {}', "", ""].join(eol);
    const events = await collect(readSSE(chunks(text)));
    assert.deepEqual(events, [{ event: "delta", data: "你好🙂\n第二行" }, { event: "end", data: "{}" }]);
  }
});
test("SSE multiple events per chunk; unfinished final event not dispatched", async () => {
  assert.equal((await collect(readSSE(chunks("data: a\n\ndata: b\n\n", 999)))).length, 2);
  assert.equal((await collect(readSSE(chunks("data: a\n")))).length, 0);
  await assert.rejects(collect(readSSE(chunks("data: " + "a".repeat(132000), 9999))), /TOO_LARGE/);
});
test("SSE abort interrupts a stalled reader", async () => {
  let cancelled = false;
  const stalled = new ReadableStream<Uint8Array>({ cancel() { cancelled = true; } });
  const c = new AbortController();
  const work = collect(readSSE(stalled, c.signal));
  setTimeout(() => c.abort(), 20);
  await assert.rejects(work); assert(cancelled);
});
test("client appends deltas, accepts explicit end, rejects EOF and invalid events", async () => {
  const deltas: string[] = [];
  const c = new AbortController();
  const content = wire("delta", { text: "你" }) + wire("delta", { text: "好🙂" }) + wire("end", { status: "answered", text: "你好🙂" });
  const end = await readChat(response(content), x => deltas.push(x), c.signal);
  assert.equal(deltas.join(""), "你好🙂"); assert.equal(end.text, "你好🙂");
  await assert.rejects(readChat(response(wire("delta", { text: "半截" })), () => {}, c.signal), /未收到结束/);
  await assert.rejects(readChat(response(wire("error", { message: "测试错误" })), () => {}, c.signal), /测试错误/);
  assert.throws(() => parseFrame("end", '{"status":"answered","text":1}'));
  await assert.rejects(readChat(new Response("{}"), () => {}, c.signal), /事件流/);
});
test("real local HTTP mock: success, incomplete, refusal, error, abrupt EOF, input validation", async t => {
  const server = makeServer("mock");server.listen(0, "127.0.0.1");await once(server, "listening");
  t.after(() => { server.closeAllConnections();server.close(); });
  const url = `http://127.0.0.1:${(server.address() as AddressInfo).port}/api/chat/stream`;
  const post = (data: unknown) => fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ conversationId: "c1", turnId: "r1", history: [], ...(data as object) }) });
  for (const scenario of ["answered", "incomplete", "refused"] as Scenario[]) {
    const res = await post({ question: "你好", scenario });
    const parts: string[] = [];
    const end = await readChat(res, d => parts.push(d), new AbortController().signal);
    assert.equal(end.status, scenario);
    if (scenario === "answered") assert.equal(parts.join(""), end.text);
  }
  await assert.rejects(readChat(await post({ question: "hi", scenario: "disconnect" }), () => {}, new AbortController().signal), /未收到结束/);
  await assert.rejects(readChat(await post({ question: "hi", scenario: "failed" }), () => {}, new AbortController().signal), /生成中断/);
  assert.equal((await post({ question: " " })).status, 400);
  assert.equal((await post({ question: "hi", role: "system" })).status, 400);
  assert.equal((await post({ question: "x".repeat(140000) })).status, 413);
});
test("mock generation respects cancellation without model calls", async t => {
  t.mock.method(globalThis, "fetch", async () => { throw new Error("must not call upstream"); });
  const c = new AbortController();const generator = streamAnswer("test", "mock", c.signal);
  assert.equal((await generator.next()).value?.event, "delta");c.abort();
  await assert.rejects(generator.next());
});
test("live adapter maps only full response completion, simulated upstream", async t => {
  const key=process.env.OPENAI_API_KEY, model=process.env.OPENAI_MODEL;
  t.after(()=>{if(key===undefined)delete process.env.OPENAI_API_KEY;else process.env.OPENAI_API_KEY=key;
    if(model===undefined)delete process.env.OPENAI_MODEL;else process.env.OPENAI_MODEL=model;});
  process.env.OPENAI_API_KEY="fake-key";process.env.OPENAI_MODEL="fake-model";
  const completed={type:"response.completed",response:{status:"completed",output:[{type:"message",content:[{type:"output_text",text:"你好"}]}]}};
  t.mock.method(globalThis, "fetch", async () => response(
    wire("response.output_text.delta",{type:"response.output_text.delta",delta:"你好"})+
    wire("response.output_text.done",{type:"response.output_text.done",text:"你好"})+
    wire("response.completed",completed),3));
  const frames=await collect(streamAnswer("hi","live",new AbortController().signal));
  assert.equal(frames.length,2);assert.equal(frames[0].event,"delta");assert.equal(frames[1].event,"end");
});
