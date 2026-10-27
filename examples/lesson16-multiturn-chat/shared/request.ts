import { isRecord } from "./protocol.ts";
import type { TextMessage } from "./history.ts";
import { MAX_HISTORY_CHARS } from "./history.ts";
export type Scenario = "answered" | "incomplete" | "refused" | "failed" | "disconnect";
export type ChatRequest = {
  conversationId: string; turnId: string; question: string;
  history: TextMessage[]; scenario?: Scenario;
};
const validId = (v: unknown): v is string => typeof v === "string" && /^[a-zA-Z0-9_-]{1,100}$/.test(v);
const scenarios = ["answered", "incomplete", "refused", "failed", "disconnect"];
export function parseChatRequest(value: unknown, mode: "mock" | "live"): ChatRequest {
  if (!isRecord(value) || Object.keys(value).some(k => !["conversationId","turnId","question","history","scenario"].includes(k)) ||
      !validId(value.conversationId) || !validId(value.turnId) ||
      typeof value.question !== "string" || !value.question.trim() || value.question.length > 2000 ||
      !Array.isArray(value.history) || value.history.length % 2 !== 0) {
    throw new Error("请求结构无效：需要问题、会话/固定轮次编号及成对文本历史。");
  }
  const history: TextMessage[] = value.history.map((m: unknown, i: number) => {
    if (!isRecord(m) || Object.keys(m).some(k => !["role","content"].includes(k)) ||
        m.role !== (i % 2 === 0 ? "user" : "assistant") ||
        typeof m.content !== "string" || !m.content.trim()) throw new Error("历史必须是 user/assistant 成对的非空文本。");
    return { role: i % 2 === 0 ? "user" : "assistant", content: m.content };
  });
  if (history.reduce((sum, m) => sum + m.content.length, 0) > MAX_HISTORY_CHARS) throw new Error("历史材料过长。");
  if (value.scenario !== undefined && (mode !== "mock" || !scenarios.includes(String(value.scenario)))) {
    throw new Error("scenario 仅供本地模拟。");
  }
  return { conversationId: value.conversationId, turnId: value.turnId,
    question: value.question.trim(), history,
    ...(value.scenario !== undefined ? { scenario: value.scenario as Scenario } : {}) };
}
