import { createServer } from "node:http";
import { randomUUID } from "node:crypto";
import { parseChatRequest } from "../shared/request.ts";
import { InputError, readJson, sendJson } from "./http.ts";
import { sendSSE } from "./sse.ts";
import { streamAnswer } from "./stream-model.ts";
import type { Scenario } from "./stream-model.ts";

export function makeServer(mode: "mock" | "live") {
  return createServer(async (req, res) => {
    const requestId = randomUUID();
    const connection = new AbortController();
    res.once("close", () => connection.abort());
    let timer: ReturnType<typeof setTimeout> | undefined;
    let upstream: AbortController | undefined;
    try {
      if (req.method !== "POST" || req.url !== "/api/chat/stream") throw new InputError(404, "接口不存在。");
      if (req.headers.origin && !["http://127.0.0.1:5173", "http://localhost:5173"].includes(req.headers.origin)) {
        throw new InputError(403, "不允许该网页来源。");
      }
      if (req.headers["content-type"]?.split(";")[0].trim() !== "application/json") throw new InputError(415, "请使用 JSON。");
      const raw = await readJson(req, 128 * 1024);
      let body;
      try { body = parseChatRequest(raw, mode); }
      catch (e) { throw new InputError(400, e instanceof Error ? e.message : "输入无效。"); }
      if (mode === "live" && (!process.env.OPENAI_API_KEY || !process.env.OPENAI_MODEL)) {
        throw new InputError(503, "后端尚未配置模型。");
      }
      connection.signal.throwIfAborted();
      res.writeHead(200, {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        "X-Accel-Buffering": "no",
        "X-Request-Id": requestId,
        "X-Content-Type-Options": "nosniff"
      });
      res.flushHeaders();
      upstream = new AbortController();
      timer = setTimeout(() => upstream!.abort(), 25_000);
      const signal = AbortSignal.any([connection.signal, upstream.signal]);
      const scenario = (body.scenario ?? "answered") as Scenario;
      for await (const frame of streamAnswer(body.question.trim(), mode, signal, scenario, body.history)) {
        await sendSSE(res, frame, signal);
      }
      if (!res.destroyed) res.end();
    } catch (error) {
      if (res.destroyed || connection.signal.aborted) return;
      if (!res.headersSent) {
        sendJson(res, error instanceof InputError ? error.status : 502,
          { status: "failed", text: error instanceof InputError ? error.message : "请求失败。", requestId });
      } else {
        // Headers already sent: communicate the failure inside the stream.
        const signal = AbortSignal.any([connection.signal, AbortSignal.timeout(2000)]);
        try {
          await sendSSE(res, { event: "error", data: { message: `生成中断或超时。排查编号：${requestId}` } }, signal);
          res.end();
        } catch { res.destroy(); }
      }
    } finally {
      clearTimeout(timer);
      upstream?.abort();
    }
  });
}
