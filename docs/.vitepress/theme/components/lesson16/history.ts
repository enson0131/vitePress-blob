import type { Turn } from "./chat-state.ts";
export type TextMessage = { role: "user" | "assistant"; content: string };
export const MAX_HISTORY_TURNS = 6;
export const MAX_HISTORY_CHARS = 24_000;

// 先取最近6轮，不按status过滤；保留问题和已有回答正文。
// 空回答不编造占位消息，notice不冒充助手回答；原始Turn不被修改。
export function buildHistory(turns: readonly Turn[]): TextMessage[] {
  const messages: TextMessage[] = turns
    .slice(-MAX_HISTORY_TURNS)
    .flatMap((turn): TextMessage[] => {
      const pair: TextMessage[] = [
        { role: "user", content: turn.question }
      ];
      if (turn.answer.trim()) {
        pair.push({ role: "assistant", content: turn.answer });
      }
      return pair;
    });
  if (messages.reduce((sum, m) => sum + m.content.length, 0) > MAX_HISTORY_CHARS) {
    throw new Error("最近6轮历史超过长度保护上限；记录未删除，请开始新会话或接入第11篇的预算管理。");
  }
  return messages;
}
