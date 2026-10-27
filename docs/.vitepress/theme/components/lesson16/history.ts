import type { Turn } from "./chat-state.ts";
export type TextMessage = { role: "user" | "assistant"; content: string };
export const MAX_HISTORY_CHARS = 24_000;

// 保留全部 answered 问答，不按轮数截取；超出保护上限时明确拒绝发送。
// 这是纯文本投影，不是工具调用或完整推理状态回放。
export function buildHistory(turns: readonly Turn[]): TextMessage[] {
  const messages: TextMessage[] = turns
    .filter(t => t.status === "answered")
    .flatMap(t => [
      { role: "user", content: t.question },
      { role: "assistant", content: t.answer }
    ]);
  if (messages.reduce((sum, m) => sum + m.content.length, 0) > MAX_HISTORY_CHARS) {
    throw new Error("全部已完成历史超过长度保护上限；记录未删除，请开始新会话或接入第11篇的预算管理。");
  }
  return messages;
}
