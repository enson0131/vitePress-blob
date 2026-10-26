import { isRecord } from "../shared/protocol.ts";
import type { Result } from "../shared/protocol.ts";

// A transport/schema adapter, not a fact checker. No tool execution.
export function normalizeResponse(value: unknown): Result {
  if (!isRecord(value) || !Array.isArray(value.output)) {
    return { status: "failed", text: "模型返回了无法识别的数据。" };
  }
  const parts = value.output.flatMap(item =>
    isRecord(item) && item.type === "message" && Array.isArray(item.content)
      ? item.content.filter(isRecord) : []);
  const refusal = parts.find(p => p.type === "refusal" && typeof p.refusal === "string");
  if (refusal) return { status: "refused", text: String(refusal.refusal) };
  if (value.status === "incomplete") {
    return { status: "incomplete", text: "回答未完整生成，请缩小问题范围或检查输出预算。" };
  }
  if (value.status !== "completed") {
    return { status: "failed", text: "模型请求未正常完成。" };
  }
  const text = parts.filter(p => p.type === "output_text" && typeof p.text === "string")
    .map(p => p.text as string).join("\n");
  return text.trim()
    ? { status: "answered", text }
    : { status: "failed", text: "模型没有返回可显示的文字。" };
}
