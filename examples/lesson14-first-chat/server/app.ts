import { createServer } from "node:http";
import { randomUUID } from "node:crypto";
import { isRecord } from "../shared/protocol.ts";
import type { Result } from "../shared/protocol.ts";
import { answer } from "./model.ts";
import { InputError, readJson, sendJson } from "./http.ts";

export function makeServer(mode: "mock" | "live") {
  return createServer(async (req, res) => {
    const requestId = randomUUID();
    const send = (code: number, result: Result) =>
      sendJson(res, code, { ...result, requestId, mode });
    const controller = new AbortController();
    res.on("close", () => { if (!res.writableEnded) controller.abort(); });
    try {
      if (req.url !== "/api/chat" || req.method !== "POST") {
        return send(404, { status: "failed", text: "接口不存在。" });
      }
      const allowed = ["http://127.0.0.1:5173", "http://localhost:5173"];
      if (req.headers.origin && !allowed.includes(req.headers.origin)) {
        throw new InputError(403, "不允许该网页来源。" );
      }
      if (req.headers["content-type"]?.split(";")[0].trim() !== "application/json") {
        throw new InputError(415, "请使用 application/json。" );
      }
      const body = await readJson(req);
      if (!isRecord(body) || Object.keys(body).length !== 1 ||
          typeof body.question !== "string" || !body.question.trim() ||
          body.question.length > 2000) {
        throw new InputError(400, "请输入 1–2000 字符的问题。" );
      }
      const signal = AbortSignal.any([controller.signal, AbortSignal.timeout(25_000)]);
      const result = await answer(body.question.trim(), mode, signal);
      send(result.status === "failed" ? 502 : 200, result);
    } catch (error) {
      if (error instanceof InputError) {
        return send(error.status, { status: "failed", text: error.message });
      }
      console.error({ requestId, error: error instanceof Error ? error.message : "unknown" });
      send(502, { status: "failed", text: "模型服务暂时不可用，请检查配置或稍后重试。" });
    }
  });
}
