# 第14篇：React + Node.js 单轮聊天工程

这是本地教学工程，不是生产模板。页面保留聊天气泡，但请求只发送当前问题；没有数据库、鉴权、RAG 或执行型工具。默认 mock 模式只回显文字，不调用模型。

## 运行

使用 Node.js 22.12+。在本目录执行：

```bash
npm install
cp .env.example .env
npm run server
```

Windows PowerShell 复制配置：`Copy-Item .env.example .env`。
在第二个终端、同目录运行 `npm run dev`，打开 http://127.0.0.1:5173 。API 监听 http://127.0.0.1:3001 。两个服务都只绑定本机。端口被占用应先释放，不要随意放开 Host、Origin 或 CORS。

## 检查

```bash
npm test
npm run check
npm run build
```

`npm test` 测试真实本地 HTTP 的模拟路径，真实模型分支的 fetch 被模拟，不会调用付费 API。Node 的类型剥离不等于类型检查。安装完依赖后，应保存 package-lock.json 以固定依赖解析结果。

## 真实调用

编辑 `.env`，将 MODE 改为 live，填写自己账号可用且支持 Responses 接口的 OPENAI_MODEL 和 OPENAI_API_KEY。重启后端。真实调用会发送当前问题给 OpenAI，可能收费。前端不应持有密钥，不要加 VITE_ 前缀，不要提交 .env。

## 边界与实现

- `server/http.ts` 在读取过程中限制请求体至16KiB，返回 JSON，并拒绝无效 JSON。
- `server/app.ts` 检查路由、来源、Content-Type、输入形状和2000字符上限，生成 requestId；外层仅向用户展示受控错误。
- `server/provider.ts` 检查 completed/refusal/incomplete，不将半截响应作为答案；它不是事实校验器。
- 字符上限不等于 Token 预算，迁移到生产前应加总上下文计数、鉴权、限流、配额和受控日志。
- Vite proxy 只用于开发；生产路由需要真实部署配置。
- 浏览器超时会中断 fetch，后端检测断连后中止上游请求；这不保证撤销服务商已经完成的工作或费用。

## 验证记录

原工程包的后端5组自动测试已通过，无真实付费调用。本仓库另外提供 lesson14-fidelity 工作流，检查 React/Vite 类型与构建、原文一致性和线上交互；以实际运行结果为准。
