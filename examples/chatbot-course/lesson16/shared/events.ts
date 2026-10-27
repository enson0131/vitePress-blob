import { isRecord } from "./protocol.ts";
export type End = { status: "answered" | "refused" | "incomplete"; text: string };
export type Frame =
  | { event: "delta"; data: { text: string } }
  | { event: "end"; data: End }
  | { event: "error"; data: { message: string } };

export function parseFrame(event: string, raw: string): Frame {
  const d: unknown = JSON.parse(raw);
  if (!isRecord(d)) throw new Error("INVALID_STREAM_EVENT");
  if (event === "delta" && typeof d.text === "string") {
    return { event, data: { text: d.text } };
  }
  if (event === "end" && typeof d.text === "string" &&
      (d.status === "answered" || d.status === "refused" || d.status === "incomplete")) {
    return { event, data: { status: d.status, text: d.text } };
  }
  if (event === "error" && typeof d.message === "string") {
    return { event, data: { message: d.message } };
  }
  throw new Error("INVALID_STREAM_EVENT");
}
