# 第15篇：React + Node.js 流式聊天与 SSE

这是独立的本地教学项目，不是第14篇的补丁。解压后在本目录运行，不要只复制文章里的局部代码。Node.js 22.12+；前端 React/Vite/TypeScript，后端 Node.js 原生 HTTP/Fetch。默认模拟模式，不需要 API Key，不访问模型。

## 启动

终端 A：

```bash
npm install
cp .env.example .env
npm run server
```

Windows PowerShell 复制命令：`Copy-Item .env.example .env`。
终端 B（同目录）：

```bash
npm run dev
```

打开 http://127.0.0.1:5173 。后端是 http://127.0.0.1:3001 ，路由 POST /api/chat/stream。两者只绑定本机。关闭第14篇占用同端口的服务。开发代理不等于生产部署/鉴权。

```bash
npm test
npm run check
npm run build
```

Node 的 TypeScript 类型剥离不是类型检查。首次安装后建议保存自己的 package-lock.json。本包未包含 node_modules，也没有填写真实密钥。

## 模拟情景

默认 mock 模式每隔约200毫秒发送一段固定文本。下拉框提供正常结束、生成上限、不完整、拒绝、流中错误、没有结束事件就断线（其中“生成上限”对应 incomplete）。这是测试数据，不是真实模型性能。停止按钮应保留现有草稿，并标记停止；结束前保持草稿状态。

通过HTTP模拟断线：

```bash
curl -N http://127.0.0.1:3001/api/chat/stream \
  -H 'Content-Type: application/json' \
  -d '{"question":"你好","scenario":"disconnect"}'
```

模拟模式支持的 scenario：answered（默认）、refused、incomplete、failed、disconnect。真实模式不接受这个模拟字段，页面请选择默认。

## 真实模型

后端 .env 中配置 MODE=live、OPENAI_API_KEY 和账号可用且支持 Responses 文本流的 OPENAI_MODEL，再重启后端。真实调用会把本次问题发送给 OpenAI，并可能收费。不能使用 VITE_ 密钥，也不要提交 .env。这个工程没有数据库、历史上下文、RAG、鉴权或执行型工具，不应直接作为公网收费接口。

## 模块分工

- server/app.ts：请求体16KiB、问题2000字符、来源和类型校验；SSE响应头、25秒总上游时限；流前HTTP错误、流中error事件；断连清理。
- server/stream-model.ts：模拟生成器与真实 Responses 流适配；增量映射；整份响应结束状态映射；无结束事件则失败。
- shared/sse.ts：UTF-8连续解码、CRLF/LF/CR分行、空行分帧、注释、多行data；单个事件/行128KiB字符限制；EOF不提交尾部半截事件。不包含 EventSource 的自动重连、id、retry。
- shared/events.ts：应用 delta/end/error 帧结构校验。
- server/sse.ts：编码event/data并写入，写满缓冲时等待drain。
- src/readChat.ts：检查HTTP和响应类型，读取完整事件，累计文本限制，不把EOF当业务成功。
- src/App.tsx：追加草稿、最终替换文本、拒绝/截断/失败/主动停止的展示；35秒前端总等待上限；卸载时取消。

应用协议中的 end 是自定义事件；answered也不是事实验证。response.output_text.done 不作为全请求完成信号。取消不能保证撤销已发生的计算或费用。JSON序列化避免正文换行误入SSE分隔符。X-Accel-Buffering只是给支持它的代理的提示，不保证CDN等所有环节都关闭缓冲。

## 验证与限制

生成时运行了7组Node自动测试，并完成后端、共享解析器/契约、浏览器readChat与测试代码的TypeScript 5.8.3严格类型检查：UTF-8字节拆分、三种换行、注释与多data、粘包、尾部半帧、限额、读取取消、客户端结束判断、真实本地HTTP模拟路由、模型适配器模拟响应等。没有真实付费模型调用。

React/Vite完整依赖安装与打包未在生成环境执行。请运行 npm run check 和 npm run build；不要把后端测试通过描述成完整生产验收。类型语法与阅读页交互的附加验证见包内 verification。

没有实现自动重连、断点续传、服务端持久化、按用户配额、流内容审核、心跳或生产网关配置。生产环境需补齐这些职责。当前按有限单轮请求设计，不是无限时长事件订阅。

## 2026-10-26 发布补充

正文新增完整 UTF-8 分块解码说明。新增 `tests/utf8.test.ts`，加上原有测试共13组；包含错误解码复现、连续解码、TextDecoderStream、Emoji、尾部字节和SSE任意切分检查。完整React/Vite构建、VitePress页面和线上效果由仓库 `Chapter 15 source fidelity` 工作流核验，以对应运行结果为准；均不进行真实付费模型调用。
