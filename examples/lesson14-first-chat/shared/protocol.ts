export type Status = "answered" | "refused" | "incomplete" | "failed";
export type Result = { status: Status; text: string };
export type Reply = Result & { requestId: string; mode: "mock" | "live" };

export function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

export function isReply(v: unknown): v is Reply {
  return isRecord(v) &&
    ["answered", "refused", "incomplete", "failed"].includes(String(v.status)) &&
    typeof v.text === "string" && typeof v.requestId === "string" &&
    (v.mode === "mock" || v.mode === "live");
}
