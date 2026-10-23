import { setTimeout as delay } from "node:timers/promises";
import { normalizeResponse } from "./provider.ts";
import type { Result } from "../shared/protocol.ts";

export async function answer(
  question: string,
  mode: "mock" | "live",
  signal: AbortSignal
): Promise<Result> {
  if (mode === "mock") {
    await delay(500, undefined, { signal });
    return { status: "answered", text: `【模拟回复，未调用模型】收到：${question}` };
  }
  const key = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL;
  if (!key || !model) throw new Error("MISSING_MODEL_CONFIG");

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    signal,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`
    },
    body: JSON.stringify({
      model,
      store: false,
      max_output_tokens: 1200,
      instructions: "你是中文技术学习助手。解释清楚，不编造接口；不确定就说明。",
      input: [{ role: "user", content: question }]
    })
  });
  if (!response.ok) throw new Error(`UPSTREAM_HTTP_${response.status}`);
  return normalizeResponse(await response.json());
}
