# 从零构建一个基于大模型 Function Calling 的 AI 设计助手

> 本文以 Mini Claude Design 项目为例，深入剖析如何利用大语言模型的 Function Calling 能力，构建一个"对话即设计"的 AI 应用。全文围绕 Agent Loop、工具系统、流式通信、上下文管理四大核心模块展开。



项目地址: [mini-claude-design](https://github.com/enson0131/mini-claude-design)          

在线体验: [体验地址](https://mini-claude-design.vercel.app/)

## 一、项目概览

### 1.1 我们要解决什么问题？

传统的网页设计流程是：设计师在 Figma/Sketch 中出图 → 前端工程师手动编码实现。这个流程存在两个核心痛点：

1. **沟通成本高**：需求方用自然语言描述需求，设计师转译为视觉语言，工程师再转译为代码语言，每一次转译都可能产生信息损耗。
2. **反馈周期长**：从需求到可交互的代码产物，中间需要多轮评审和修改。

这个项目的目标：让用户直接用自然语言描述需求，AI 理解后自动生成高保真、模块化的 HTML/CSS/JS 代码，并实时预览。

### 1.2 核心架构

```
┌──────────────────────────────────────────────────────────────┐
│                         浏览器 (前端)                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐ │
│  │ ChatPanel│  │FilesPanel│  │PreviewPanel│  │  状态管理      │ │
│  │ (对话面板)│  │(文件面板) │  │ (预览面板) │  │ (React State)│ │
│  └─────┬────┘  └─────┬────┘  └─────┬────┘  └──────┬───────┘ │
│        └──────────────┴─────────────┴───────────────┘         │
│                              │                                │
│                    Agent Loop (agent.ts)                       │
│                    ┌─────────┴─────────┐                      │
│                    │  LLM ↔ Tool 循环   │                      │
│                    └─────────┬─────────┘                      │
│                              │ SSE Stream                     │
│                    ┌─────────┴─────────┐                      │
│                    │  API Route (Edge)  │ ← CORS 代理          │
│                    └─────────┬─────────┘                      │
└──────────────────────────────┼────────────────────────────────┘
                               │
                    ┌──────────┴──────────┐
                    │  智谱 AI (GLM) API   │
                    │  Function Calling    │
                    └─────────────────────┘
```

### 1.3 技术选型


| 层级     | 选型                       | 理由                          |
| ------ | ------------------------ | --------------------------- |
| 框架     | Next.js 15 (App Router)  | Edge Runtime、API Routes 一体化 |
| 语言     | TypeScript               | 类型安全，对复杂 Agent 逻辑至关重要       |
| AI API | 智谱 AI (GLM)              | 国内可用，支持 Function Calling    |
| 流式通信   | SSE (Server-Sent Events) | 大模型标准输出方式，用户体验好             |
| 样式     | Tailwind CSS 4           | 快速构建 UI                     |


---

## 二、Agent Loop —— 让 AI "动起来"的关键

### 2.1 什么是 Agent Loop？

普通的 LLM 调用是"一问一答"：用户提问 → 模型回答 → 结束。

Agent Loop 则是"一问多答多操作"：用户提问 → 模型思考 → 调用工具 → 获取结果 → 继续思考 → 再调用工具 → ... → 最终回答。

这正是 Claude Code、ChatGPT with Tools 等产品背后的核心模式。

### 2.2 代码实现解析

核心代码在 `lib/agent.ts` 中，不到 100 行，包含了 Agent Loop 的全部要素：

```typescript
export async function runAgent(
  userInput: string,
  callbacks: AgentCallbacks = {},
  existingMessages: ChatMessage[] = []
): Promise<ChatMessage[]> {
  const messages: ChatMessage[] = [...existingMessages];
  const tools = getToolDefinitions();

  let turnCount = 0;
  const MAX_TURNS = 10; // 安全阀：防止无限循环

  while (turnCount < MAX_TURNS) {
    turnCount++;

    // 1. 添加用户消息（带 ID 标签，后续上下文裁剪用）
    if (userInput) {
      messages.push({ role: "user", content: tagUserMessage(userInput) });
    }

    // 2. 检查上下文长度，必要时裁剪
    if (estimateTokens(messages, SYSTEM_PROMPT) > MAX_TOKENS * 0.8) {
      const idsToRemove = executeSnips(messages);
      // ... 批量裁剪逻辑
    }

    // 3. 调用 LLM（流式），实时回调
    const apiResp = await callZhipuStream(messages, tools, SYSTEM_PROMPT, {
      onTextChunk(chunk) { callbacks.onStreamText?.(chunk); },
    });

    // 4. 没有工具调用，循环结束
    if (finishReason !== "tool_calls" || !msg.tool_calls) {
      callbacks.onDone?.(usage);
      return messages;
    }

    // 5. 依次执行工具，将结果追加到消息中
    for (const tc of msg.tool_calls) {
      const result = await dispatchTool(fn.name, input, {});
      messages.push({ role: "tool", tool_call_id: tc.id, content: result });
    }

    // 6. 后续轮次不再重复推送用户输入
    userInput = "";
  }
}
```

### 2.3 关键设计决策

**为什么是 while 循环？**

Agent Loop 本质上是一个状态机，消息列表是唯一的状态，每轮操作都是对消息列表的追加。while 循环让状态变化清晰可见，比递归更易于调试。

`**MAX_TURNS` 限制的必要性**

LLM 有时会陷入"工具调用死循环"——反复读取同一个文件或反复修改同一行代码。MAX_TURNS 是安全阀，确保 Agent 最终会停下来。

**Callback 模式的解耦设计**

```typescript
export interface AgentCallbacks {
  onStreamText?: (chunk: string) => void;      // 流式文本
  onToolCall?: (name: string, input: object) => void;   // 工具被调用
  onToolResult?: (name: string, result: string) => void; // 工具返回结果
  onAssistantMessage?: (text: string) => void;  // 助手完整消息
  onDone?: (usage: object) => void;            // 完成
  onSnip?: (before: number, after: number) => void;  // 上下文裁剪
}
```

Agent 逻辑与 UI 渲染完全解耦——同一个 `runAgent` 可以用在 CLI、Web、Electron 中，只需提供不同的 callbacks 实现。

---

## 三、工具系统 —— AI 的"手和脚"

### 3.1 注册表模式

工具系统采用经典的 **注册表模式（Registry Pattern）**，每个工具只需声明名称、描述、参数 schema 并实现 `execute` 函数：

```typescript
// lib/tools/index.ts
export const toolRegistry = new Map<string, ToolDefinition>();

export function registerTool(def: ToolDefinition) {
  toolRegistry.set(def.name, def);
}

export async function dispatchTool(toolName: string, input: object) {
  const tool = toolRegistry.get(toolName);
  return tool ? await tool.execute(input, {}) : `Unknown tool: ${toolName}`;
}
```

新增工具零修改成本——只需新建文件并调用 `registerTool`，符合开闭原则。

### 3.2 内存文件系统

项目用 `Map<string, string>` 模拟文件系统，为什么不直接操作真实文件系统？

1. **安全性**：LLM 生成的文件路径不可预测
2. **浏览器限制**：前端无法直接操作文件系统
3. **实时预览**：内存文件可以即时生成 Blob URL 供 iframe 预览

```typescript
// lib/tools/filesystem.ts
const fileStore = new Map<string, string>();

const writeTool: ToolDefinition = {
  name: "write_file",
  input_schema: {
    type: "object",
    properties: {
      path: { type: "string" },
      content: { type: "string" },
    },
    required: ["path", "content"],
  },
  async execute({ path, content }) {
    fileStore.set(path as string, content as string);
    return `Written ${path} (${(content as string).length} chars)`;
  },
};
```

通过 `getFileStore()` 暴露 Map 引用，UI 层可以随时读取文件内容进行预览。

### 3.3 上下文裁剪工具（Snip）

这是项目中最精巧的设计。问题背景：LLM 上下文窗口有限（128K tokens），Agent 多轮对话会快速消耗空间。

Snip 采用 **"延迟裁剪"策略**，而不是简单截断：

```
用户消息 m0001 ─── AI 回复 ─── 工具调用 ─── ...
用户消息 m0002 ─── AI 回复 ─── 工具调用 ─── ...
用户消息 m0003 ─── AI 回复 ─── 工具调用 ─── ...
                              ↑ 上下文即将溢出！
```

工作原理：

1. **打标签**：每条用户消息发送时自动附加 `[id:m0001]` 标记
2. **注册 snip**：AI 可以调用 `snip` 工具标记哪些历史消息不再需要——只是登记，不立即删除
3. **延迟执行**：当 token 数接近阈值（80%）时才批量执行裁剪

```typescript
// 注册 snip（不删除，只入队）
async execute({ from_id, to_id }) {
  registeredSnips.push({ from_id, to_id });
  return `Snip registered (${registeredSnips.length} queued).`;
}

// 当上下文压力增大时，批量执行
export function executeSnips(messages: ChatMessage[]): Set<string> {
  // 根据 from_id/to_id 范围标记要删除的消息
}
```

为什么延迟？因为 **AI 最知道哪些上下文不再需要**——完成一个设计阶段后，AI 会主动标记可裁剪的内容。批量执行也更高效。

---

## 四、流式通信 —— 让 AI 的思考"看得见"

### 4.1 三层流式架构

```
智谱 AI API (SSE Stream)
        │
        ▼
Next.js API Route (Edge Runtime) ← 转发 SSE
        │
        ▼
客户端 callZhipuStream() ← 解析 SSE chunks
        │
        ▼
React State (streamingText) ← UI 实时渲染
```

### 4.2 第一层：Edge Runtime CORS 代理

```typescript
// app/api/chat/route.ts
export const runtime = "edge"; // 低延迟

export async function POST(request: Request) {
  const resp = await fetch(ZHIPU_API_URL, {
    headers: { Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify(body),
  });

  // 直接转发 SSE 流——零拷贝，零缓冲
  return new Response(resp.body, {
    headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache" },
  });
}
```

`resp.body` 是 ReadableStream，直接传给 Response——数据像水管一样流过，中间层不蓄水。

### 4.3 第二层：客户端 SSE 解析

```typescript
// lib/llm.ts
const reader = resp.body?.getReader();
let buffer = "";

while (true) {
  const { done, value } = await reader.read();
  if (done) break;

  buffer += decoder.decode(value, { stream: true });
  const lines = buffer.split("\n");
  buffer = lines.pop() || ""; // 保留不完整的行

  for (const line of lines) {
    if (!line.startsWith("data: ")) continue;
    const chunk = JSON.parse(line.slice(6));

    // 文本 delta
    if (delta.content) {
      accumulated.content += delta.content;
      callbacks.onTextChunk?.(delta.content);
    }

    // 工具调用 delta（增量拼接参数）
    if (delta.tool_calls) {
      accumulated.tool_calls[tc.index].function.arguments += tc.function.arguments;
    }
  }
}
```

三个易错细节：

1. **缓冲区处理**：TCP 分片会导致一行数据跨越多个 chunk，用 `buffer` 保留不完整的行是关键
2. **工具调用增量拼接**：Function Calling 的参数也是流式返回的，需要逐步拼接
3. **accumulated 对象**：流式处理的同时需要累积完整响应，供 Agent Loop 后续使用

### 4.4 第三层：React 实时渲染

```typescript
// 流式输出 + 闪烁光标
{streamingText && (
  <div className="...">
    {streamingText}
    <span className="animate-pulse" /> {/* 闪烁光标 */}
  </div>
)}
```

### 4.5 流式 + Agent Loop 的协作

一个容易忽略的难点：流式输出和 Agent Loop 怎么配合？

```
Turn 1: AI 流式输出 "好的，我来设计..." → 调用 write_file("index.html", "...")
Turn 2: AI 流式输出 "添加样式..."       → 调用 write_file("styles/main.css", "...")
Turn 3: AI 流式输出 "设计完成！"
```

在 `page.tsx` 中，通过 `AgentCallbacks` 将每一步映射到 UI 更新：

```typescript
const callbacks: AgentCallbacks = {
  onStreamText(chunk) { setStreamingText(prev => prev + chunk); },
  onAssistantMessage(text) {
    addEntry("assistant", text);
    setStreamingText(""); // 清空流式文本
  },
  onToolResult(name, result) {
    addEntry("tool-result", result, name);
    refreshFiles(); // 刷新文件列表
  },
};
```

`onStreamText` 和 `onAssistantMessage` 互补：流式过程中显示打字效果，一轮结束后保存完整内容并清空流式状态。

---

## 五、实时预览 —— 从代码到视觉效果

### 5.1 Blob URL 方案

LLM 生成文件后，如何让用户立即看到效果？将内存文件转换为 Blob URL：

```typescript
function getBlobUrl(path: string) {
  const content = store.get(path);
  const mime = { html: 'text/html', css: 'text/css', js: 'application/javascript' }[ext];
  return URL.createObjectURL(new Blob([content], { type: mime }));
}
```

### 5.2 HTML 资源引用解析

生成的 HTML 引用了外部 CSS/JS，但浏览器无法访问内存文件系统。解决：渲染前进行 URL 重写。

```typescript
const resolveHtml = (htmlContent: string, basePath: string) => {
  let resolved = htmlContent;
  const dir = basePath.substring(0, basePath.lastIndexOf('/') + 1);

  // 替换 <link href="styles/main.css"> → <link href="blob:...">
  resolved = resolved.replace(
    /<link\s[^>]*href=["']([^"']+)["'][^>]*>/gi,
    (match, href) => {
      const url = getBlobUrl(dir + href);
      return url ? match.replace(href, url) : match;
    }
  );

  // 同理替换 <script src="...">
  return resolved;
};
```

最终用 iframe `srcDoc` 渲染：

```tsx
<iframe srcDoc={resolvedContent} sandbox="allow-scripts allow-same-origin" />
```

### 5.3 自动预览触发

`write_file` 执行后自动检测并触发预览：

```typescript
if (name === "write_file") {
  const writtenPath = result.match(/Written (.+?) \(/)?.[1];
  if (writtenPath) {
    // 优先预览 index.html
    handleSelectFile(writtenPath === "index.html" ? writtenPath : "index.html");
  }
}
```

---

## 六、System Prompt 工程 —— AI 设计师的"灵魂"

### 6.1 分层约束结构

System Prompt 不只是"角色设定"，而是一套可执行的设计规范体系：

```
System Prompt
├── 身份定位：专家级设计师 + 创意总监
├── 硬性规则（不可违反）
│   ├── 文件结构规范：HTML/CSS/JS 三层分离
│   ├── 排版规范：字号阶梯、字重要求
│   ├── 色彩规范：禁止纯黑纯白、60-30-10 比例
│   ├── 间距规范：4 的倍数、section ≥ 64px
│   └── 动效规范：transition 统一、无障碍支持
├── 工作流程
│   └── 理解需求 → 规划结构 → CSS → HTML → JS → 自检 → 交付
└── 创意鼓励（柔性）
    └── 玻璃拟态、新拟态、渐变 mesh、clip-path
```

### 6.2 为什么超过 3000 字符？

1. **LLM 默认输出质量不够**：不指定字号阶梯，它就会用 13px、17px 不规则值；不指定间距规则，就会出现 7px、11px
2. **"违者必究"标注**：明确硬性规则和建议性规则，让模型在约束和创意之间有清晰边界
3. **负面清单**：列出"绝对禁止"的做法（如默认蓝色链接、emoji 做装饰），比正面要求更有效

### 6.3 工作流程引导

> 理解需求 → 规划文件结构 → 先写 CSS → 再写 HTML → 最后写 JS → read_file 自检 → 交付

这个顺序确保：

- CSS Design Tokens 先于 HTML 写入，避免样式缺失
- 自检步骤让 AI 验证产出是否符合规范
- 鼓励并发写入多个文件，提高效率

---

## 七、总结

### 7.1 关键技术收获


| 技术点              | 核心理解                         |
| ---------------- | ---------------------------- |
| Function Calling | LLM 不只是生成文本，而是生成"意图"，由宿主环境执行 |
| Agent Loop       | LLM + Tool + Loop = 自主决策的行动者 |
| 流式 SSE           | 不是优化，而是必须——用户无法等待 30 秒的黑盒    |
| System Prompt    | 不只是"角色设定"，而是一套可执行的规范系统       |
| 上下文管理            | 上下文窗口是稀缺资源，需要精心管理            |


### 7.2 可以改进的方向

1. **持久化**：刷新页面后文件丢失，可接入 IndexedDB
2. **错误恢复**：Agent 中途出错时保留对话状态
3. **并发处理**：Agent 运行时允许用户继续操作
4. **预览安全**：iframe sandbox 的 `allow-same-origin` 需要重新评估

