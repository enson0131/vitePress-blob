---
title: AI 聊天机器人学习教程
---

# AI 聊天机器人学习教程

从底层原理到工程实践的 40 篇中文文字教程，以 React、TypeScript、Node.js 为工程技术栈。

## 已完成

1. [第 01 篇：ChatGPT 如何回答问题](./01-how-chatgpt-works)
2. [第 02 篇：Token 与 Embedding](./02-token-and-embedding)
3. [第 03 篇：Transformer 与 Attention](./03-transformer-attention)
4. [第 04 篇：位置编码与 RoPE](./04-position-encoding)
5. [第 05 篇：大语言模型是如何训练出来的？](./05-llm-training)
6. [第 06 篇：模型推理与 KV Cache](./06-inference)
7. [第 07 篇：大模型的能力边界](./07-model-limitations)
8. [第 08 篇：Prompt 与 Messages](./08-prompt-messages)
9. [第 09 篇：多轮对话与上下文管理](./09-conversation-memory)
10. [第 10 篇：聊天机器人的记忆系统](./10-memory-system)

## 学习路线

| 阶段 | 篇数 | 主题 |
| --- | --- | --- |
| 基础原理 | 01–07 | LLM、Token、Embedding、Transformer、训练、推理 |
| 对话系统 | 08–13 | Prompt、Messages、上下文、幻觉 |
| 工程开发 | 14–20 | React、Node.js、SSE、持久化 |
| RAG | 21–27 | 知识库、向量检索、重排序、评估 |
| Agent | 28–33 | Function Calling、MCP、记忆 |
| 生产实践 | 34–40 | 安全、性能、成本、测试、部署 |

每篇文章包含原理、工程案例、复习题，以及持续维护的「学习疑问与解答」。问题按所属知识点回填到对应文章。

## 每篇教程的发布验收标准

- 正文、公式、SVG、TypeScript 代码、交互实验与原始 ChatGPT 教程逐项核对，不得随意压缩或删减。
- **每篇至少 3 道交互式选择题**，每题包含选项、正确答案和解析；必须支持提交评分及重新作答。
- 维护「学习疑问与解答」，将学习过程中提出的问题归档到对应章节。
- Vue 模板内展示源码时必须对 `<`、`&` 等字符进行 HTML 转义，或使用安全的代码渲染组件。
- GitHub PR 构建通过后才能合并；合并后再次确认 GitHub Pages 部署结果，并检查桌面、移动端和交互功能。
- 构建通过不代表视觉 1:1：应以原始 ChatGPT 版本为基准检查，无法完全复现的差异必须明确记录。
