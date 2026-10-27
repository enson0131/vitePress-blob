# 第16篇：消息状态与多轮会话

独立的本地教学项目，承接第15篇SSE解析与取消机制。前端React + TypeScript + Vite，后端Node.js原生HTTP/Fetch。默认mock，不需要密钥，不访问模型。

## 启动

Node.js 22.12+。在本目录运行：

```bash
npm install
cp .env.example .env
npm run server
```

PowerShell使用 `Copy-Item .env.example .env`。另一个终端进入同目录，运行 `npm run dev`。
打开 http://127.0.0.1:5173 。后端只绑定 http://127.0.0.1:3001 ，关闭上一课占用相同端口的服务。

```bash
npm test
npm run check
npm run build
```

`npm test`使用Node的TypeScript类型剥离，并不代替tsc。包中不包含node_modules、真实密钥或生成环境专用绝对路径配置；首次安装后建议保存package-lock.json。

## 先做这三件事

1. 先发送“我叫小陈”，等完成后发送“我叫什么？”。mock使用固定规则提取此前用户消息中的名字，不是通用AI能力。
2. 展开“最近一次实际请求”：第二次应包含一组user/assistant历史，不包含当前助手占位；当前问题在question中只出现一次。
3. 模拟失败，改回正常后重试最后一题。问答槽位与Turn.id均不变；status重置、控制器换新；或生成时点新会话，旧回调不能写入新会话。

携带当前会话全部answered问答，前后端都不再限制最近6轮；仍有24,000字符保护，超限报错，不截断半句话、不静默删除记录。字符限额不是Token预算。停止、失败、拒绝和截断整轮会被排除，可能同时排除用户的重要条件，需要另行保留或重述。后续上下文投影不等于界面记录。

## 模块

- shared/chat-state.ts：固定Turn.id、status驱动、纯reducer、开始/增量/结束/中止/最后一轮重试/新会话。
- shared/active-request.ts：临时控制器归属检查，旧增量/结束/报错/清理不得污染新请求。
- shared/history.ts：选择已完成文本问答，整对保留；不是工具或推理响应完整回放。
- shared/request.ts：后端请求结构、角色配对、长度和字段白名单检查。
- shared/sse.ts：沿用15篇UTF-8连续解码和事件分帧，包含字节拆分测试。
- src/App.tsx：useReducer、请求快照、单前台请求、停止/重试/新会话、请求预览。
- src/readChat.ts：HTTP及SSE读取、明确end检查，EOF不当成功。
- server/app.ts：请求体128KiB、单问题2000字符、来源检查、25秒上游时限。
- server/stream-model.ts：mock和Responses纯文本流适配，将history与当前question组装为input。

## 真实模式与边界

仅在可信后端.env中配置MODE=live、OPENAI_API_KEY和账号可用且支持Responses文本流的OPENAI_MODEL，再重启后端。页面模拟场景保持默认；请求会发送选中的历史与当前问题，可能计费。不要使用VITE_密钥或把.env提交Git。

此适配器把已完成、可见的纯文本作为新的请求上下文，不保存或回放完整推理项、工具项、phase或多模态项。需要这些能力时应遵循服务商的完整output回放或服务端状态机制，而不是把本课历史过滤器直接套上去。

conversationId和固定turnId用于本课定位，不实现后端幂等、权限或并发锁。历史由浏览器提交，能够被修改；生产环境应认证用户并从可信存储读取其有权访问的记录。角色白名单不能证明历史真实性。

本篇只在内存保存会话，刷新后清空；没有数据库、RAG、自动重连、断点续传、并行后台会话、用户级限流或执行型工具。不要直接开放到公网。

## 实际验证范围

本次修订28组Node测试通过，涵盖固定Turn.id重试、旧增量/结束/报错/清理隔离、8/100轮历史完整保留、长度超限不删记录，以及原有SSE/UTF-8和HTTP测试。后端、共享逻辑、readChat和测试严格类型检查通过；App.tsx及Vue script setup语法转译通过。

未调用真实付费模型；React/Vite完整类型检查与打包、Vue SFC完整编译未验证。当前环境不能解析npm registry，请安装依赖后运行npm run check及npm run build。此修改尚未推送GitHub。

离线阅读页检查不能替代React应用端到端测试；剪贴板以模拟对象检查内容，不验证操作系统权限。完整报告见上层verification目录。
