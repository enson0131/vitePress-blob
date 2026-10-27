# 第17篇配套工程：前端按检查点 PUT 保存 AI 回答

技术栈：React + TypeScript + Vite + Node.js + `node:sqlite`。

推荐 Node.js 24.15+；Node.js 22.16+ 在本课可用，可能出现实验特性警告。**全部模拟 SSE；不会调用任何付费模型。**

```bash
npm install
npm run server
# 另开一个终端
npm run dev
# http://127.0.0.1:5173
```

## 更新后的真实职责

- `POST /api/conversations` 创建会话；`GET /api/conversations` 列表；`GET /api/conversations/:id` 恢复历史；`PATCH /api/conversations/:id` 改名；`DELETE /api/conversations/:id` 删除。
- `POST /api/conversations/:id/turns` 先插入 waiting，随后 SSE 只发 `meta/delta/end`，**后端不保存 AI 增量正文**。
- `src/draft-save.ts` 在前端接收/累计 delta，达 800ms 或 2KiB 触发 **PUT `/api/conversations/:id/turns/:turnId`**，保存完整 answer 快照、status、notice、revision；串行提交、检查 CAS revision。`end` 后必须等待最终 answered PUT 成功。
- 用户停止：前端先刷 checkpoint PUT，再发 `/stop`；服务端标记 stopped。断线：后端只保留上一次成功 PUT 的快照，标记 incomplete。进程重启：waiting/streaming 恢复 incomplete。
- 刷新时只 GET 数据库，不自动创建新 Turn，不自动开始生成，旧 SSE 不可无缝续传。
- `/retry` 维持固定 Turn.id，但重置 answer 与 revision；`createdAt,id` 稳定排序，没有 position 字段。

**安全限制：** 固定演示用户 `local-demo`，仅监听 `127.0.0.1`，没有真正登录，也不验证浏览器提交的 AI 文本就是模型原文；禁止作为公网多用户服务使用。生产需要登录、任务校验、幂等键等控制。

`npm test` 覆盖数据库授权/版本控制、HTTP 断线及前端检查点；`npm run check && npm run build` 验证 TS/React/Vite（需要依赖安装）。
