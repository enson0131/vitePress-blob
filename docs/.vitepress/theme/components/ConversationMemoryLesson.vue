<script setup lang="ts">
import {ref,computed} from 'vue'
const turns=ref(100),userTokens=ref(100),assistantTokens=ref(400),windowSize=ref(2)
const total=computed(()=>turns.value*(userTokens.value+assistantTokens.value))
const memoryQuery=ref('生成下一篇 AI 教程')
const samples=[['介绍 React','React 是 UI 库'],['Vue 呢？','Vue 是前端框架'],['状态管理怎么做？','有多种方案'],['它们如何比较？','需要结合上下文']]
const memories=['用户主要使用 TypeScript 和 React','用户喜欢中文文字教程','GitHub 教程必须 1:1 还原','用户正在研究 RAG 和 Embedding']
const matched=computed(()=>memories.map((_,i)=>[memoryQuery.value.includes('React')||memoryQuery.value.includes('TypeScript'),memoryQuery.value.includes('教程'),memoryQuery.value.includes('教程'),memoryQuery.value.includes('RAG')||memoryQuery.value.includes('Embedding')][i]))
const questions=[
{q:'无状态聊天 API 如何利用历史？',opts:['应用提供相关历史','模型自动修改权重','Tokenizer 自动读取数据库'],a:0,ex:'需要把相关上下文提供给模型。'},
{q:'滑动窗口的主要风险？',opts:['不能减少 Token','较早重要信息可能被裁剪','必须使用向量数据库'],a:1,ex:'窗口会丢失更早的消息。'},
{q:'长期记忆必须使用向量数据库吗？',opts:['必须','不必，结构化记忆可以用关系数据库','只能存储在模型权重中'],a:1,ex:'PostgreSQL 可以保存结构化记忆；语义检索时再考虑 pgvector。'},
{q:'KV Cache 和长期记忆一样吗？',opts:['一样','KV Cache 是推理缓存，长期记忆由应用管理','KV Cache 是数据库'],a:1,ex:'两者用途和生命周期不同。'},
{q:'恢复聊天 UI 就代表模型获得历史吗？',opts:['是','不是，仍需将历史提供给模型或使用服务端会话状态','只取决于 React'],a:1,ex:'界面显示与模型推理是两条不同的数据流。'}]
const answers=ref<number[]>([]),submitted=ref(false)
const score=computed(()=>questions.filter((q,i)=>answers.value[i]===q.a).length)
function choose(i:number,j:number){const a=[...answers.value];a[i]=j;answers.value=a;submitted.value=false}
</script>
<template><article class="lesson">
<div class="meta">第 09 / 40 篇 · 第二阶段：聊天机器人核心原理 · 阅读约 20 分钟</div>
<h1>多轮对话与上下文管理：ChatGPT 为什么能记住我们之前聊过的内容？</h1>
<p>如果大语言模型本身不会因为普通聊天而持续更新参数，为什么 ChatGPT 能记住前面聊过的内容？答案涉及模型层的上下文计算、应用层的历史管理和记忆层的按需检索。</p>
<h2>一、大语言模型本身真的有记忆吗？</h2>
<p>用户先说「我正在学习 React」，随后问「它和 Vue 有什么区别？」。模型能够理解代词，是因为本次推理可访问的上下文包含了前面的信息。若只发送第二轮问题，模型可能无法确定「它」指什么。</p>
<table><thead><tr><th>概念</th><th>保存内容</th><th>生命周期</th></tr></thead><tbody>
<tr><td>模型权重</td><td>训练学到的模式</td><td>随模型版本存在</td></tr>
<tr><td>当前上下文</td><td>本次可访问的消息</td><td>取决于请求</td></tr>
<tr><td>KV Cache</td><td>推理时的 K/V 状态</td><td>取决于缓存策略</td></tr>
<tr><td>聊天历史</td><td>用户与助手消息</td><td>由应用保存</td></tr>
<tr><td>长期记忆</td><td>偏好和重要事实</td><td>记忆系统管理</td></tr>
</tbody></table>
<p><strong>聊天机器人记住对话，不等于模型权重发生了变化。</strong>无状态 API 通常需要重新提供相关历史，某些 API 也提供服务端会话状态。</p>
<h2>二、多轮对话如何实现？</h2>
<div class="visual"><strong>多轮聊天系统架构</strong><div class="step">React Chat UI</div><div class="arrow">↓</div><div class="step">Node.js API：鉴权、读取历史</div><div class="arrow">↓</div><div class="step">PostgreSQL / Redis：会话存储与缓存</div><div class="arrow">↓</div><div class="step blue">Context Builder：组装 Messages</div><div class="arrow">↓</div><div class="step green">LLM API：生成回答</div><div class="arrow">↓</div><div class="step">保存回答，供下一轮使用</div></div>
<p>一次请求包括：校验用户对会话的权限、读取历史、根据 Token 预算裁剪或摘要、组装 Messages、调用 LLM、保存回答。</p>
<h3>2.1 TypeScript：组织历史消息</h3>
<pre v-pre><code>type Role = "user" | "assistant";
interface ChatMessage { role: Role; content: string; }
const history: ChatMessage[] = [
  { role: "user", content: "我正在学习 React。" },
  { role: "assistant", content: "React 是一个 UI 库。" }
];
function buildMessages(history: ChatMessage[], question: string) {
  return [
    { role: "system" as const, content: "你是前端技术导师。" },
    ...history,
    { role: "user" as const, content: question }
  ];
}
console.log(buildMessages(history, "它和 Vue 有什么区别？"));</code></pre>
<h2>三、为什么不能无限发送聊天历史？</h2>
<p>每轮用户输入 100 Tokens、AI 回答 400 Tokens，100 轮约为 50,000 Tokens，500 轮约为 250,000 Tokens。历史增长可能增加成本、Prefill 延迟和噪声。</p>
<div class="visual"><strong>交互实验：聊天历史 Token 增长</strong>
<label>对话轮数：{{turns}}<input v-model.number="turns" type="range" min="10" max="500" step="10"/></label>
<label>每轮用户输入：{{userTokens}} Tokens<input v-model.number="userTokens" type="range" min="50" max="1000" step="50"/></label>
<label>每轮 AI 输出：{{assistantTokens}} Tokens<input v-model.number="assistantTokens" type="range" min="100" max="2000" step="100"/></label>
<div class="metric">{{total.toLocaleString('en-US')}} Tokens</div>
<small>仅为累计历史估算，不含系统提示、工具结果和消息开销。</small></div>
<h2>四、上下文管理的四种策略</h2>
<table><thead><tr><th>策略</th><th>思路</th><th>适用场景</th></tr></thead><tbody>
<tr><td>全量历史</td><td>发送全部消息</td><td>短对话</td></tr>
<tr><td>滑动窗口</td><td>保留最近 N 轮</td><td>普通聊天</td></tr>
<tr><td>历史摘要</td><td>压缩较早对话</td><td>长时间聊天</td></tr>
<tr><td>记忆检索</td><td>召回相关事实</td><td>长期助手</td></tr></tbody></table>
<h3>4.1 全量历史</h3><p>直接发送全部消息，实现简单但 Token 消耗持续增长。</p>
<pre v-pre><code>const messages = [systemPrompt, ...allHistory, currentMessage];</code></pre>
<h3>4.2 滑动窗口</h3><p>只保留最近 N 轮完整问答，较早重要信息可能丢失。</p>
<div class="visual"><strong>交互实验：滑动窗口裁剪</strong>
<label>保留最近完整轮数：{{windowSize}}<input v-model.number="windowSize" type="range" min="1" max="4" step="1"/></label>
<div v-for="(pair,i) in samples" :key="i" class="memory" :class="{kept:i>=samples.length-windowSize}"><b>第 {{i+1}} 轮 · {{i>=samples.length-windowSize?'保留':'裁剪'}}</b><p>用户：{{pair[0]}}</p><p>AI：{{pair[1]}}</p></div>
<small>实际裁剪需保持工具调用与消息结构完整。</small></div>
<h3>4.3 历史摘要</h3>
<p>将较早对话压缩为「用户开发 React + NestJS 企业系统，偏好 TypeScript 示例，当前讨论统一鉴权」等摘要，结合最近消息发送。摘要可能遗漏信息、过期或错误归纳，需校验和更新。</p>
<h3>4.4 记忆检索</h3>
<p>将重要信息持久化，在当前任务需要时召回相关记忆，而不是无限发送全部历史。例如「教程必须 1:1 还原」就是长期项目偏好。</p>
<h2>五、短期记忆与长期记忆有什么区别？</h2>
<p>短期记忆主要服务于当前会话，保存最近消息、当前任务状态和临时工具结果；长期记忆跨会话保存用户偏好、项目背景和重要事实。</p>
<table><thead><tr><th>维度</th><th>短期记忆</th><th>长期记忆</th></tr></thead><tbody>
<tr><td>作用范围</td><td>当前会话</td><td>跨会话</td></tr>
<tr><td>保存内容</td><td>聊天历史、任务状态</td><td>偏好、重要事实</td></tr>
<tr><td>存储方式</td><td>会话数据库、缓存</td><td>持久化数据库、向量库</td></tr>
<tr><td>生命周期</td><td>通常较短</td><td>通常较长</td></tr>
<tr><td>检索方式</td><td>按会话读取</td><td>关键词、语义、结构化查询</td></tr>
<tr><td>主要问题</td><td>上下文过长</td><td>记忆过期、冲突、隐私</td></tr>
</tbody></table>
<p><strong>长期记忆不是把全部聊天记录永久放进 Prompt，而是在需要时取出相关信息。</strong></p>
<h2>六、长期记忆如何存储与检索？</h2>
<h3>6.1 记忆的数据结构</h3>
<pre v-pre><code>interface Memory {
  id: string;
  userId: string;
  category: "preference" | "fact" | "project";
  content: string;
  createdAt: number;
  updatedAt: number;
  sourceConversationId?: string;
}</code></pre>
<p>记忆可以存储在 PostgreSQL、MySQL 或 MongoDB 中。结构化偏好可直接 SQL 查询；当需要语义相似检索时，可以考虑 PostgreSQL + pgvector、Qdrant 等方案。还需要考虑来源、有效期、用户删除权和敏感信息保护。</p>
<h3>6.2 记忆如何进入 Prompt？</h3>
<div class="visual"><strong>长期记忆检索流程</strong><div class="step">用户发送问题</div><div class="arrow">↓</div><div class="step">Memory Retriever：检索相关记忆</div><div class="arrow">↓</div><div class="step">Memory Filter：权限、冲突与有效期</div><div class="arrow">↓</div><div class="step">Context Builder：组合记忆、历史与当前问题</div><div class="arrow">↓</div><div class="step green">LLM 生成回答</div></div>
<h3>6.3 交互实验：记忆检索</h3>
<div class="visual"><strong>关键词记忆检索模拟器</strong>
<label v-for="q in ['生成下一篇 AI 教程','写一段 React TypeScript 代码','解释 RAG 和 Embedding']" :key="q" class="option"><input type="radio" name="memory-query" :checked="memoryQuery===q" @change="memoryQuery=q"/>{{q}}</label>
<div v-for="(m,i) in memories" :key="i" class="memory" :class="{kept:matched[i]}">{{matched[i]?'✓':'○'}} {{m}}</div>
<small>教学用关键词规则，并非真实 Embedding 语义检索。</small></div>
<h2>七、TypeScript 实现多轮对话管理器</h2>
<h3>7.1 定义消息类型</h3>
<pre v-pre><code>type ChatRole = "user" | "assistant";
interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: number;
}
interface Conversation {
  id: string;
  userId: string;
  messages: ChatMessage[];
}</code></pre>
<h3>7.2 ConversationManager</h3>
<pre v-pre><code>class ConversationManager {
  private conversations = new Map&lt;string, Conversation&gt;();

  create(conversationId: string, userId: string) {
    const conversation: Conversation = {
      id: conversationId, userId, messages: []
    };
    this.conversations.set(conversationId, conversation);
    return conversation;
  }

  addMessage(conversationId: string, userId: string, message: ChatMessage) {
    const conversation = this.conversations.get(conversationId);
    if (!conversation || conversation.userId !== userId) {
      throw new Error("Conversation not found");
    }
    conversation.messages.push(message);
  }

  getHistory(conversationId: string, userId: string) {
    const conversation = this.conversations.get(conversationId);
    if (!conversation || conversation.userId !== userId) {
      throw new Error("Conversation not found");
    }
    return [...conversation.messages];
  }
}</code></pre>
<p>进程内 Map 仅用于教学。生产环境应持久化到数据库，并在读写时检查会话归属，避免跨用户访问。</p>
<h3>7.3 根据 Token 预算裁剪消息</h3>
<pre v-pre><code>interface Message {
  role: "user" | "assistant";
  content: string;
}
function trimHistory(
  history: Message[],
  maxTokens: number,
  countTokens: (text: string) => number
): Message[] {
  const result: Message[] = [];
  let usedTokens = 0;
  for (let i = history.length - 1; i >= 0; i--) {
    const message = history[i];
    const tokens = countTokens(message.content);
    if (usedTokens + tokens > maxTokens) break;
    result.unshift(message);
    usedTokens += tokens;
  }
  return result;
}</code></pre>
<p>这里的 countTokens 需使用与模型兼容的 Tokenizer 或计数接口。实际还应计算消息格式开销，并保持工具调用结构完整。</p>
<h2>八、React + Node.js 聊天系统架构</h2>
<div class="visual"><strong>生产级聊天系统架构</strong><div class="step blue">React Chat UI：聊天列表、输入框、流式渲染</div><div class="arrow">↓</div><div class="step">Node.js / NestJS API：鉴权、限流、会话路由</div><div class="arrow">↓</div><div class="step">Conversation Service + Memory Service</div><div class="arrow">↓</div><div class="step green">LLM API + PostgreSQL / Redis / pgvector</div></div>
<h3>8.1 数据库设计</h3>
<pre v-pre><code>CREATE TABLE conversations (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE messages (
  id UUID PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES conversations(id),
  role VARCHAR(20) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_messages_conversation
ON messages(conversation_id, created_at);</code></pre>
<p>生产级还应考虑消息状态、顺序、幂等性、工具调用记录、删除策略和多租户隔离。</p>
<h3>8.2 为什么要使用 Redis？</h3>
<p>Redis 适合缓存最近聊天历史、临时任务状态、限流和协调。需要长期保存的重要记录通常应由可靠的持久化数据库承担。初期 MVP 可以先使用 PostgreSQL，等出现性能需求再引入 Redis。</p>
<!-- CHAPTER09_CONTINUE -->
</article></template>