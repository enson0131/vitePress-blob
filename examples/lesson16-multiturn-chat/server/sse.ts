import { once } from "node:events";
import type { ServerResponse } from "node:http";
import type { Frame } from "../shared/events.ts";

export async function sendSSE(
  res: ServerResponse,
  frame: Frame,
  signal: AbortSignal
) {
  signal.throwIfAborted();
  if (res.destroyed || res.writableEnded) throw new Error("CLIENT_CLOSED");
  const block = `event: ${frame.event}\ndata: ${JSON.stringify(frame.data)}\n\n`;
  if (!res.write(block)) {
    await once(res, "drain", { signal });
  }
}
