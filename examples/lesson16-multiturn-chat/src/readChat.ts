import { readSSE } from "../shared/sse.ts";
import { parseFrame } from "../shared/events.ts";
import type { End } from "../shared/events.ts";

export async function readChat(
  response: Response,
  onDelta: (text: string) => void,
  signal: AbortSignal
): Promise<End> {
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  if (!response.body || !response.headers.get("content-type")?.includes("text/event-stream")) {
    throw new Error("后端没有返回事件流。");
  }
  let length = 0;
  for await (const item of readSSE(response.body, signal)) {
    const frame = parseFrame(item.event, item.data);
    if (frame.event === "delta") {
      length += frame.data.text.length;
      if (length > 200_000) throw new Error("回答过长，已停止接收。");
      onDelta(frame.data.text);
    } else if (frame.event === "error") {
      throw new Error(frame.data.message);
    } else {
      return frame.data;
    }
  }
  throw new Error("连接已结束，但未收到结束事件；现有文字只是草稿。");
}
