import { chatReducer, isPending, canRetry } from "./chat-state.ts";
import type { ChatState, Action, Target, StreamAction, Turn } from "./chat-state.ts";
import { ownsController } from "./active-request.ts";
export type Pending = Target & { controller: AbortController };
export type Lab = { chat: ChatState; epoch: number; active: Pending | null; old: Pending | null; logs: string[] };
export type Operation = "start" | "delta" | "stop" | "retry" | "lateDelta" | "lateEnd" | "lateError" | "lateFinally" | "complete" | "new" | "sample";
export function initialLab(): Lab {
  return { chat: { conversationId: "demo-c1", turns: [] }, epoch: 1, active: null, old: null, logs: [] };
}
export function labStep(lab: Lab, op: Operation): Lab {
  const last = lab.chat.turns.at(-1);
  let chat = lab.chat, epoch = lab.epoch, active = lab.active, old = lab.old;
  let result = "忽略：当前状态不允许这个操作";
  const reduce = (action: Action) => {
    const next = chatReducer(chat, action);
    result = next === chat ? "忽略：目标或状态不匹配" : "已应用";
    chat = next;
  };
  // 与 React 网络入口相同：先确认控制器，再把事件交给纯 reducer。
  const receive = (request: Pending, event: StreamAction) => {
    if (!ownsController(active, request.controller) || request.controller.signal.aborted) {
      result = "忽略：旧控制器的回调无效，固定 Turn.id 不变";
      return;
    }
    reduce(event);
  };
  if (op === "sample") {
    if (active) { old = active; active = null; old.controller.abort(); }
    epoch++;
    const statuses: Turn["status"][] = ["answered", "answered", "stopped", "failed", "incomplete", "refused", "answered", "failed"];
    chat = { conversationId: "demo-c" + epoch, turns: statuses.map((status, i) => ({
      id: "T" + (i + 1), question: "第" + (i + 1) + "轮问题", status,
      answer: i === 7 ? "" : "第" + (i + 1) + "轮已有回答", notice: status === "failed" ? "模拟网络错误（不发给模型）" : ""
    })) };
    result = "已载入8轮混合状态；窗口选择第3～8轮，第8轮无助手正文，仅带用户问题";
  } else if (op === "start" && !active && !chat.turns.some(t => isPending(t.status))) {
    const id = "T" + (chat.turns.length + 1);
    active = { conversationId: chat.conversationId, turnId: id, controller: new AbortController() };
    reduce({ type: "start", conversationId: chat.conversationId, turn: { id,
      question: chat.turns.length === 0 ? "我叫小陈" : "我叫什么？", answer: "", status: "waiting", notice: "" } });
  } else if (op === "new") {
    if (active) { old = active; active = null; old.controller.abort(); }
    epoch++; reduce({ type: "reset", conversationId: "demo-c" + epoch });
  } else if (op === "retry" && last && !active && canRetry(last.status)) {
    reduce({ type: "retry", conversationId: chat.conversationId, turnId: last.id });
    active = { conversationId: chat.conversationId, turnId: last.id, controller: new AbortController() };
  } else if (op === "stop" && active) {
    const request = active; active = null; old = request;
    reduce({ type: "interrupt", conversationId: request.conversationId, turnId: request.turnId,
      status: "stopped", notice: "保留草稿，最近6轮内仍可进入模型历史。" });
    request.controller.abort();
  } else if (op.startsWith("late") && old) {
    const target = { conversationId: old.conversationId, turnId: old.turnId };
    if (op === "lateFinally") {
      if (ownsController(active, old.controller)) active = null;
      result = "旧 finally 只清理自己的资源，未清掉当前控制器";
    } else {
      const action: StreamAction = op === "lateDelta" ? { type: "delta", ...target, text: "【旧请求尾巴】" }
        : op === "lateEnd" ? { type: "end", ...target, status: "answered", text: "【旧请求最终结果】" }
        : { type: "interrupt", ...target, status: "failed", notice: "【旧请求报错】" };
      receive(old, action);
    }
  } else if (active && (op === "delta" || op === "complete")) {
    const target = { conversationId: active.conversationId, turnId: active.turnId };
    receive(active, op === "delta" ? { type: "delta", ...target, text: "本次回答的一段。" }
      : { type: "end", ...target, status: "answered", text: "【固定演示】你好，小陈！" });
    if (op === "complete") active = null;
  }
  return { chat, epoch, active, old, logs: [`${op} → ${result}`, ...lab.logs].slice(0, 12) };
}
