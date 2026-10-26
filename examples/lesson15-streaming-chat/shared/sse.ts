export type SSE = { event: string; data: string };

// Parses event/data lines, CRLF/LF/CR, comments and multiple data lines.
// Intentionally does not implement EventSource reconnection, id or retry.
export async function* readSSE(
  body: ReadableStream<Uint8Array>,
  signal?: AbortSignal
): AsyncGenerator<SSE> {
  const reader = body.getReader();
  const decoder = new TextDecoder("utf-8", { fatal: true });
  const LIMIT = 128 * 1024;
  let buffer = "", event = "", data: string[] = [], size = 0;
  const cancel = () => { void reader.cancel().catch(() => {}); };
  signal?.addEventListener("abort", cancel, { once: true });
  function line(text: string): SSE | undefined {
    if (text === "") {
      const message = data.length ? { event: event || "message", data: data.join("\n") } : undefined;
      event = ""; data = []; size = 0;
      return message;
    }
    if (text.startsWith(":")) return;
    const colon = text.indexOf(":");
    const field = colon < 0 ? text : text.slice(0, colon);
    let value = colon < 0 ? "" : text.slice(colon + 1);
    if (value.startsWith(" ")) value = value.slice(1);
    size += text.length;
    if (size > LIMIT) throw new Error("SSE_EVENT_TOO_LARGE");
    if (field === "event") event = value;
    if (field === "data") data.push(value);
  }
  try {
    while (true) {
      signal?.throwIfAborted();
      const { value, done } = await reader.read();
      signal?.throwIfAborted();
      buffer += done ? decoder.decode() : decoder.decode(value, { stream: true });
      while (true) {
        const index = buffer.search(/[\r\n]/);
        if (index < 0) break;
        // Wait if a CRLF may have been split between chunks.
        if (!done && buffer[index] === "\r" && index === buffer.length - 1) break;
        const width = buffer[index] === "\r" && buffer[index + 1] === "\n" ? 2 : 1;
        if (index > LIMIT) throw new Error("SSE_LINE_TOO_LARGE");
        const message = line(buffer.slice(0, index));
        buffer = buffer.slice(index + width);
        if (message) yield message;
      }
      if (buffer.length > LIMIT) throw new Error("SSE_LINE_TOO_LARGE");
      if (done) break; // A partial final event is NOT dispatched at EOF.
    }
  } finally {
    signal?.removeEventListener("abort", cancel);
    await reader.cancel().catch(() => {});
    reader.releaseLock();
  }
}
