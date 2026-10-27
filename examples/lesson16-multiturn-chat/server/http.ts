import type { IncomingMessage, ServerResponse } from "node:http";

export class InputError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

// Limit bytes while reading, rather than trusting Content-Length.
// After rejecting an oversized body, discard further bytes instead of retaining them.
export function readJson(req: IncomingMessage, limit = 16 * 1024): Promise<unknown> {
  return new Promise((resolve, reject) => {
    let chunks: Buffer[] = [];
    let bytes = 0;
    let settled = false;
    const fail = (error: Error) => {
      if (settled) return;
      settled = true;
      chunks = [];
      reject(error);
    };
    req.on("error", fail);
    req.on("aborted", () => fail(new InputError(400, "请求已中断。")));
    req.on("data", (chunk: Buffer) => {
      if (settled) return;
      bytes += chunk.length;
      if (bytes > limit) return fail(new InputError(413, "请求内容太大。"));
      chunks.push(chunk);
    });
    req.on("end", () => {
      if (settled) return;
      try {
        const value: unknown = JSON.parse(Buffer.concat(chunks).toString("utf8"));
        settled = true;
        chunks = [];
        resolve(value);
      } catch {
        fail(new InputError(400, "请求必须是合法 JSON。"));
      }
    });
  });
}

export function sendJson(res: ServerResponse, status: number, body: unknown) {
  if (res.destroyed || res.writableEnded) return;
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff"
  });
  res.end(JSON.stringify(body));
}
