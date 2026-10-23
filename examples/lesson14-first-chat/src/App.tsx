import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { isReply } from "../shared/protocol";

type Message = { role: "user" | "assistant"; text: string };

export default function App() {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const controller = useRef<AbortController | null>(null);
  useEffect(() => () => controller.current?.abort(), []);

  async function send(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = question.trim();
    if (!text || controller.current) return;
    const current = new AbortController();
    controller.current = current;
    const timer = window.setTimeout(() => current.abort(), 35_000);
    setBusy(true);
    setError("");
    setMessages(old => [...old, { role: "user", text }]);
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: text }),
        signal: current.signal
      });
      const data: unknown = await response.json();
      if (!isReply(data)) throw new Error("后端响应格式不符合约定。");
      if (!response.ok || data.status !== "answered") {
        throw new Error(`${data.text}（编号：${data.requestId}）`);
      }
      setMessages(old => [...old, { role: "assistant", text: data.text }]);
      setQuestion("");
    } catch (cause) {
      setError(current.signal.aborted ? "请求已取消或等待超时。" :
        cause instanceof Error ? cause.message : "网络请求失败。");
    } finally {
      window.clearTimeout(timer);
      if (controller.current === current) {
        controller.current = null;
        setBusy(false);
      }
    }
  }

  return <main>
    <h1>我的第一只聊天机器人</h1>
    <p>单轮实验：界面保留气泡，本次只发送最新问题。</p>
    <section aria-live="polite">
      {messages.map((m, i) => <article key={i} className={m.role}>
        <strong>{m.role === "user" ? "我" : "助手"}</strong>
        <p style={{ whiteSpace: "pre-wrap" }}>{m.text}</p>
      </article>)}
    </section>
    {error && <p role="alert">{error}</p>}
    <form onSubmit={send}>
      <label htmlFor="question">输入问题</label>
      <textarea id="question" value={question} maxLength={2000} disabled={busy}
        onChange={e => setQuestion(e.target.value)} />
      <button disabled={busy || !question.trim()}>{busy ? "正在回答…" : "发送"}</button>
    </form>
  </main>;
}
