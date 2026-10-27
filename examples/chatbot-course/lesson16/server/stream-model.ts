import { setTimeout as delay } from "node:timers/promises";
import { readSSE } from "../shared/sse.ts";
import { isRecord } from "../shared/protocol.ts";
import { normalizeResponse } from "./provider.ts";
import type { Frame } from "../shared/events.ts";
import type { TextMessage } from "../shared/history.ts";
import type { Scenario } from "../shared/request.ts";
export type { Scenario } from "../shared/request.ts";

export async function* streamAnswer(
  question: string,
  mode: "mock" | "live",
  signal: AbortSignal,
  scenario: Scenario = "answered",
  history: readonly TextMessage[] = []
): AsyncGenerator<Frame> {
  if (mode === "mock") {
    const joined = history.filter(m => m.role === "user").map(m => m.content).join("\n");
    const names = [...joined.matchAll(/我叫([^，。！？\s]{1,12})/g)];
    const name = names.at(-1)?.[1];
    const content = /我叫(什么|啥)|我的名字/.test(question)
      ? (name ? `你在本次收到的历史中说：你叫${name}。` : "本次收到的历史里没有你的名字。")
      : `收到：${question}。`;
    const pieces = ["【模拟规则，未调用模型】", `收到 ${history.filter(m => m.role === "user").length} 轮历史。\n`, content, "\n", "这只是固定规则，用于检查历史是否正确送达。"];
    if (scenario === "refused") {
      await delay(200, undefined, { signal });
      yield { event: "end", data: { status: "refused", text: "模拟拒绝：未生成普通答案。" } }; return;
    }
    let text = "";
    for (const [i, piece] of pieces.entries()) {
      await delay(200, undefined, { signal });
      if (i === 2 && scenario === "disconnect") return;
      if (i === 2 && scenario === "failed") throw new Error("MOCK_FAILURE");
      if (i === 2 && scenario === "incomplete") {
        yield { event: "end", data: { status: "incomplete", text: "模拟生成上限：先前内容只是草稿。" } }; return;
      }
      text += piece;
      yield { event: "delta", data: { text: piece } };
    }
    yield { event: "end", data: { status: "answered", text } }; return;
  }
  const key = process.env.OPENAI_API_KEY, model = process.env.OPENAI_MODEL;
  if (!key || !model) throw new Error("MISSING_MODEL_CONFIG");
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST", signal,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({ model, store: false, stream: true, max_output_tokens: 1200,
      instructions: "你是中文技术学习助手。不编造接口，不确定就说明。",
      // Fresh text-only context, not a replay of full reasoning/tool output items.
      input: [...history, { role: "user", content: question }] })
  });
  if (!response.ok || !response.body ||
      !response.headers.get("content-type")?.includes("text/event-stream")) {
    throw new Error("UPSTREAM_NOT_SSE");
  }
  let chars = 0;
  for await (const message of readSSE(response.body, signal)) {
    const e: unknown = JSON.parse(message.data);
    if (!isRecord(e)) throw new Error("INVALID_UPSTREAM_EVENT");
    if (e.type === "response.output_text.delta") {
      if (typeof e.delta !== "string") throw new Error("INVALID_DELTA");
      chars += e.delta.length;
      if (chars > 200_000) throw new Error("OUTPUT_TOO_LARGE");
      yield { event: "delta", data: { text: e.delta } };
    } else if (e.type === "response.completed" || e.type === "response.incomplete") {
      const result = normalizeResponse(e.response);
      if (result.status === "failed") throw new Error("INVALID_FINAL_RESPONSE");
      if (result.text.length > 200_000) throw new Error("OUTPUT_TOO_LARGE");
      yield { event: "end", data: { status: result.status, text: result.text } }; return;
    } else if (e.type === "response.failed" || e.type === "error") {
      throw new Error("UPSTREAM_FAILED");
    }
    // Text-part completion is NOT response completion. Refusals are read from final output.
  }
  throw new Error("UPSTREAM_ENDED_WITHOUT_TERMINAL_EVENT");
}
