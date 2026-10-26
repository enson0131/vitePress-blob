import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { readChat } from "./readChat";

type State = "idle" | "waiting" | "streaming" | "answered" | "refused" | "incomplete" | "stopped" | "failed";
const labels: Record<State, string> = {
  idle: "尚未发送", waiting: "正在等待首段文字", streaming: "正在生成（草稿）",
  answered: "生成完成（不代表事实已核验）", refused: "请求被拒绝",
  incomplete: "生成未完整结束", stopped: "已停止，保留未完成草稿", failed: "请求失败，保留未完成草稿"
};
export default function App() {
  const [question, setQuestion] = useState("");
  const [text, setText] = useState("");
  const [state, setState] = useState<State>("idle");
  const [notice, setNotice] = useState("");
  const [scenario, setScenario] = useState("");
  const active = useRef<AbortController | null>(null);
  const busy = state === "waiting" || state === "streaming";
  useEffect(() => () => active.current?.abort("unmount"), []);
  async function send(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (active.current || !question.trim()) return;
    const controller = new AbortController(); active.current = controller;
    const timer = window.setTimeout(() => controller.abort("timeout"), 35_000);
    setText(""); setNotice(""); setState("waiting");
    try {
      const response = await fetch("/api/chat/stream", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: question.trim(), ...(scenario ? { scenario } : {}) }),
        signal: controller.signal
      });
      const end = await readChat(response, delta => {
        if (active.current !== controller || controller.signal.aborted) return;
        setText(prev => prev + delta); setState("streaming");
      }, controller.signal);
      controller.signal.throwIfAborted();
      if (end.status === "answered") setText(end.text);
      else if (end.status === "refused") { setText(""); setNotice(end.text); }
      else setNotice(end.text);
      setState(end.status);
    } catch (error) {
      if (controller.signal.reason === "unmount") return;
      const stopped = controller.signal.aborted && controller.signal.reason === "user";
      setState(stopped ? "stopped" : "failed");
      setNotice(stopped ? "停止请求已发出。" : controller.signal.aborted ? "等待超时。" :
        error instanceof Error ? error.message : "请求失败。");
    } finally {
      window.clearTimeout(timer);
      if (active.current === controller) active.current = null;
    }
  }
  return <main>
    <h1>边生成、边显示</h1><p>单轮 SSE 实验；未接入历史记录、鉴权和数据库。</p>
    <form onSubmit={send}>
      <label htmlFor="q">问题</label>
      <textarea id="q" value={question} disabled={busy} maxLength={2000} onChange={e => setQuestion(e.target.value)} />
      <label htmlFor="scenario">本地模拟场景（真实模式请选择默认）</label>
      <select id="scenario" value={scenario} disabled={busy} onChange={e => setScenario(e.target.value)}>
        <option value="">默认正常完成</option><option value="incomplete">生成上限</option>
        <option value="refused">拒绝</option><option value="failed">流中错误</option><option value="disconnect">无结束事件就断线</option>
      </select>
      <div className="actions"><button disabled={busy || !question.trim()}>发送</button>
        <button type="button" disabled={!busy} onClick={() => active.current?.abort("user")}>停止生成</button></div>
    </form>
    <p role="status" data-state={state}>{labels[state]}</p>
    <article className="assistant"><p style={{ whiteSpace: "pre-wrap" }}>{text || "（尚无正文）"}</p></article>
    {notice && <p role="alert">{notice}</p>}
  </main>;
}
