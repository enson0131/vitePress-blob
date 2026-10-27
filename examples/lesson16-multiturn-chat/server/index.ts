import { makeServer } from "./app.ts";
const mode = process.env.MODE ?? "mock";
if (mode !== "mock" && mode !== "live") throw new Error("MODE 只能是 mock 或 live");
const server = makeServer(mode);
server.requestTimeout = 15_000;
server.headersTimeout = 10_000;
server.listen(3001, "127.0.0.1", () => console.log(`Streaming API at 127.0.0.1:3001 | ${mode}`));
