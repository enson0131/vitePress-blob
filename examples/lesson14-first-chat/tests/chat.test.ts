import test from "node:test";
import assert from "node:assert/strict";
import { once } from "node:events";
import type { AddressInfo } from "node:net";
import { makeServer } from "../server/app.ts";
import { normalizeResponse } from "../server/provider.ts";
import { answer } from "../server/model.ts";
import { isReply } from "../shared/protocol.ts";

const payload = (status: string, content: unknown[]) => ({
  status, output: [{ type: "message", content }]
});
test("provider mapping preserves completed/refused/incomplete/failed", () => {
  assert.deepEqual(normalizeResponse(payload("completed", [{ type: "output_text", text: "你好" }])),
    { status: "answered", text: "你好" });
  assert.equal(normalizeResponse(payload("incomplete", [{ type: "output_text", text: "部分" }])).status, "incomplete");
  assert.equal(normalizeResponse(payload("completed", [{ type: "refusal", refusal: "无法完成" }])).status, "refused");
  assert.equal(normalizeResponse(payload("failed", [])).status, "failed");
  assert.equal(normalizeResponse(payload("completed", [])).status, "failed");
  assert.equal(normalizeResponse(null).status, "failed");
});
test("reply guard rejects missing/wrong fields", () => {
  assert(isReply({ status: "answered", text: "你好", requestId: "r1", mode: "mock" }));
  assert(!isReply({ status: "answered", text: 1, requestId: "r1", mode: "mock" }));
  assert(!isReply({ status: "unknown", text: "x", requestId: "r1", mode: "mock" }));
  assert(!isReply(null));
});
test("real HTTP mock route and input boundaries", async t => {
  const server = makeServer("mock");
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  t.after(() => { server.closeAllConnections(); server.close(); });
  const url = `http://127.0.0.1:${(server.address() as AddressInfo).port}/api/chat`;
  const post = (value: unknown, headers: Record<string, string> = {}) => fetch(url, {
    method: "POST", headers: { "Content-Type": "application/json", ...headers }, body: JSON.stringify(value)
  });
  const good = await post({ question: "你好" });
  assert.equal(good.status, 200);
  const data: unknown = await good.json();
  assert(isReply(data)); assert.equal(data.mode, "mock"); assert.match(data.text, /未调用模型/);
  assert.equal((await post({ question: " " })).status, 400);
  assert.equal((await post({ question: "x".repeat(2001) })).status, 400);
  assert.equal((await post({ question: "x", role: "system" })).status, 400);
  assert.equal((await post({ question: "x".repeat(17000) })).status, 413);
  assert.equal((await post({ question: "x" }, { "Content-Type": "text/plain" })).status, 415);
  assert.equal((await post({ question: "x" }, { Origin: "https://other.example" })).status, 403);
  assert.equal((await fetch(url)).status, 404);
  assert.equal((await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: "{" })).status, 400);
});
test("mock mode never fetches upstream; cancellation works", async t => {
  t.mock.method(globalThis, "fetch", async () => { throw new Error("unexpected upstream call"); });
  const result = await answer("hello", "mock", new AbortController().signal);
  assert.equal(result.status, "answered");
  const c = new AbortController(); c.abort();
  await assert.rejects(answer("hello", "mock", c.signal));
});
test("live adapter uses server config; upstream is simulated, not billed", async t => {
  const beforeKey = process.env.OPENAI_API_KEY, beforeModel = process.env.OPENAI_MODEL;
  t.after(() => {
    if (beforeKey === undefined) delete process.env.OPENAI_API_KEY; else process.env.OPENAI_API_KEY = beforeKey;
    if (beforeModel === undefined) delete process.env.OPENAI_MODEL; else process.env.OPENAI_MODEL = beforeModel;
  });
  process.env.OPENAI_API_KEY = "test-not-a-real-key";
  process.env.OPENAI_MODEL = "test-model";
  t.mock.method(globalThis, "fetch", async (url: string, options: RequestInit) => {
    assert.equal(url, "https://api.openai.com/v1/responses");
    const sent = JSON.parse(options.body as string);
    assert.equal(sent.model, "test-model"); assert.equal(sent.input.length, 1);
    assert.equal(sent.input[0].content, "test question");
    return new Response(JSON.stringify(payload("completed", [{ type: "output_text", text: "测试回答" }])));
  });
  assert.equal((await answer("test question", "live", new AbortController().signal)).text, "测试回答");
  delete process.env.OPENAI_MODEL;
  await assert.rejects(answer("test question", "live", new AbortController().signal), /MISSING_MODEL_CONFIG/);
});
