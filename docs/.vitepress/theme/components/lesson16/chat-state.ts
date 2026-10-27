export type Status = "waiting" | "streaming" | "answered" |
  "stopped" | "failed" | "incomplete" | "refused";

export type Turn = {
  id: string;             // 一轮问答的身份；两条气泡可用 id + ":user/assistant"
  question: string;
  answer: string;
  status: Status;
  notice: string;
};
export type ChatState = { conversationId: string; turns: Turn[] };
export type Target = { conversationId: string; turnId: string };
export type StreamAction = Target & (
  | { type: "delta"; text: string }
  | { type: "end"; status: "answered" | "refused" | "incomplete"; text: string }
  | { type: "interrupt"; status: "stopped" | "failed"; notice: string }
);
export type Action = StreamAction
  | { type: "start"; conversationId: string; turn: Turn }
  | { type: "retry"; conversationId: string; turnId: string }
  | { type: "reset"; conversationId: string };

export const isPending = (s: Status) => s === "waiting" || s === "streaming";
export const canRetry = (s: Status) => ["stopped", "failed", "incomplete"].includes(s);
export const labels: Record<Status, string> = {
  waiting: "等待首段", streaming: "生成中 · 草稿", answered: "生成完成 · 非事实认证",
  stopped: "已停止 · 草稿", failed: "失败 · 草稿", incomplete: "未完整结束 · 草稿", refused: "拒绝"
};

// 网络回调必须先通过当前控制器检查；这里仅按会话、固定轮次和 status 更新。
export function applyStream(state: ChatState, action: StreamAction): ChatState {
  if (state.conversationId !== action.conversationId) return state;
  const index = state.turns.findIndex(t => t.id === action.turnId);
  const turn = state.turns[index];
  if (!turn || !isPending(turn.status)) return state;

  let next: Turn;
  if (action.type === "delta") {
    next = { ...turn, answer: turn.answer + action.text, status: "streaming" };
  } else if (action.type === "end") {
    next = action.status === "incomplete"
      ? { ...turn, status: "incomplete", notice: action.text }
      : { ...turn, answer: action.text, status: action.status, notice: "" };
  } else {
    next = { ...turn, status: action.status, notice: action.notice };
  }
  return { ...state, turns: state.turns.map((t, i) => i === index ? next : t) };
}

export function chatReducer(state: ChatState, action: Action): ChatState {
  if (action.type === "reset") return { conversationId: action.conversationId, turns: [] };
  if (action.conversationId !== state.conversationId) return state;
  if (action.type === "start") {
    if (state.turns.some(t => isPending(t.status) || t.id === action.turn.id) ||
        action.turn.status !== "waiting" || !action.turn.question.trim()) return state;
    return { ...state, turns: [...state.turns, { ...action.turn }] };
  }
  if (action.type === "retry") {
    const last = state.turns.at(-1);
    if (!last || last.id !== action.turnId || !canRetry(last.status) ||
        state.turns.some(t => isPending(t.status))) return state;
    return { ...state, turns: state.turns.map(t => t.id === last.id
      ? { ...t, answer: "", notice: "", status: "waiting" } : t) };
  }
  return applyStream(state, action);
}
