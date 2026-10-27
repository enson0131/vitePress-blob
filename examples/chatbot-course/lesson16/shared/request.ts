import { isRecord } from "./protocol.ts";
import type { TextMessage } from "./history.ts";
import { MAX_HISTORY_CHARS, MAX_HISTORY_TURNS } from "./history.ts";
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
      !Array.isArray(value.history) || value.history.length > MAX_HISTORY_TURNS * 2) {
    throw new Error("请求结构无效：需要问题、会话/固定轮次编号及最近6轮文本历史。");
  }
  let userCount = 0;
  let previousRole: TextMessage["role"] | undefined;
  const history: TextMessage[] = value.history.map((m: unknown) => {
    if (!isRecord(m) || Object.keys(m).some(k => !["role","content"].includes(k)) ||
        (m.role !== "user" && m.role !== "assistant") ||
        typeof m.content !== "string" || !m.content.trim()) {
      throw new Error("历史只能包含user/assistant的非空文本。");
    }
    // 一轮一定有用户问题，但助手可能尚未产生任何正文。
    if (m.role === "user") userCount++;
    else if (previousRole !== "user") throw new Error("助手消息必须紧随对应用户问题。");
    previousRole = m.role;
    return { role: m.role, content: m.content };
  });
  if (userCount > MAX_HISTORY_TURNS) throw new Error("历史最多包含最近6轮用户问题。");
  if (history.reduce((sum, m) => sum + m.content.length, 0) > MAX_HISTORY_CHARS) throw new Error("历史材料过长。");
  if (value.scenario !== undefined && (mode !== "mock" || !scenarios.includes(String(value.scenario)))) {
    throw new Error("scenario 仅供本地模拟。");
  }
  return { conversationId: value.conversationId, turnId: value.turnId,
    question: value.question.trim(), history,
    ...(value.scenario !== undefined ? { scenario: value.scenario as Scenario } : {}) };
}
