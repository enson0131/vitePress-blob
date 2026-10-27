# 第 18 篇｜错误、重试与断线恢复（可运行示例）

基于第 17 篇的 React + Node + SQLite 教学工程扩展；不连接真实 AI，也不要求 API Key。

```bash
npm install
npm test
npm run build
npm run server  # terminal A, 127.0.0.1:3002
npm run dev     # terminal B, 127.0.0.1:5173
```

新建一场会话，选择“首次 429 / 首次 503 / 部分内容后 error / 无 end 断开”等故障，再发送。

- `src/retry-policy.ts`：明确的 429/502/503/504 预流式自动重试、Retry-After、抖动退避，最多两次。未知网络结果不自动 POST。
- `server/store.ts`：`(conversation_id,client_key)` 唯一约束及事务去重。重复请求仍关联最初 Turn，而不是创建新 Turn。
- `src/draft-save.ts`：前端积累文本，800ms/2KiB 检查点 PUT 串行保存，确认最终 PUT 才展示 `answered`。
- `server/index.ts`：用 SSE 模拟故障；未收到 `end` 的回答不会成为完成态。

**教学边界**：固定本地 demo 用户，没有身份认证；回答文本由浏览器提交，后端仅检查生成结束标志，不能证明其来源。生产系统需验证模型输出来源、服务端任务身份、Redis/数据库幂等键过期处理及跨实例任务协调。服务端错误/断线可能早于前端最后一次 PUT，恢复以成功落库的快照为准。
