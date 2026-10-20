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
<h3>4.3 历史摘要（Conversation Summarization）</h3>
<p>滑动窗口的问题是：重要信息可能被裁剪。例如用户在第一轮说「我正在开发一个 React + NestJS 的企业系统」，后面聊天了 100 轮。如果只保留最近 10 轮，这条背景就可能丢失。</p>
<p>历史摘要可以把较早的对话转换为简短的状态说明：</p>
<pre v-pre><code>对话摘要：
用户正在开发 React + NestJS 企业管理系统。
用户偏好 TypeScript 示例。
当前主要讨论统一鉴权和微前端架构。</code></pre>
<p>后续请求可以组合 System Prompt、历史摘要、最近几轮完整消息和当前用户问题。</p>
<p>但摘要也存在信息丢失、错误归纳和过期的问题，因此需要定期更新、校验和管理。</p>
<h3>4.4 记忆检索（Memory Retrieval）</h3>
<p>另一种方案是将重要信息存储在外部记忆系统中。例如：</p>
<pre v-pre><code>Memory 1：用户主要使用 TypeScript
Memory 2：用户正在学习 AI 聊天机器人
Memory 3：教程需要包含交互式练习
Memory 4：GitHub 页面需要 1:1 还原</code></pre>
<p>当用户说「继续生成下一篇教程」，应用可以检索与「教程」相关的记忆，而不是发送所有历史对话。</p>
<p>不过，记忆的存储、更新和检索都需要独立设计，不能假设模型天然拥有无限长期记忆。</p>
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
<p>Redis 可以用于缓存最近聊天历史、保存临时任务状态、请求限流、分布式锁或其他协调机制。</p>
<p>但 Redis 不一定要承担全部持久化职责。对于需要长期保存的聊天记录，通常应使用可靠的持久化存储。</p>
<p>初期 MVP 可以先使用 PostgreSQL，等真正出现缓存和高并发需求后再引入 Redis。</p>
<h3>8.3 恢复聊天界面与让模型利用历史的区别</h3>
<div class="visual"><strong>两条不同的数据流</strong>
<div class="step blue">流程 A：PostgreSQL → Node.js GET /messages → React 渲染历史</div>
<p>这只是恢复聊天界面，不需要调用 LLM。</p>
<div class="step green">流程 B：用户新问题 → Node.js 读取相关历史 → 组装 Messages → LLM</div>
<p>这才是让模型利用之前的对话。前端能够显示历史，并不代表模型自动获得了历史。</p></div>
<h2>九、生产级上下文管理与性能优化</h2>
<h3>9.1 推荐的上下文组织方式</h3>
<pre v-pre><code>System Prompt
      +
相关长期记忆（经过权限与有效期检查）
      +
历史对话摘要
      +
最近几轮完整消息
      +
当前用户问题</code></pre>
<p>这不是固定公式。代码调试可能更依赖最近错误日志；长期学习助手可能更依赖目标和学习进度。应按任务设计上下文策略。</p>
<h3>9.2 重点监控指标</h3>
<table><thead><tr><th>指标</th><th>作用</th></tr></thead><tbody>
<tr><td>Input Tokens</td><td>衡量上下文成本</td></tr>
<tr><td>TTFT</td><td>首 Token 响应延迟</td></tr>
<tr><td>Memory Hit Rate</td><td>记忆召回情况</td></tr>
<tr><td>Retrieval Relevance</td><td>检索相关性</td></tr>
<tr><td>Context Truncation Rate</td><td>历史裁剪频率</td></tr>
<tr><td>Answer Quality</td><td>回答正确性</td></tr>
</tbody></table>
<p>记忆命中率越高不一定越好，错误或过期记忆被频繁召回也会降低回答质量。</p>
<h3>9.3 长期记忆的隐私与安全</h3>
<p>应考虑用户是否同意保存、能否查看和更正、能否删除、敏感信息如何处理、记忆有效期，以及多用户间的数据隔离。长期记忆不仅是产品能力，也是数据治理责任。</p>
<h2>十、本篇总结</h2>
<table><thead><tr><th>概念</th><th>作用</th></tr></thead><tbody>
<tr><td>Chat History</td><td>保存历史消息</td></tr>
<tr><td>Context Window</td><td>限制本次推理可处理内容</td></tr>
<tr><td>Sliding Window</td><td>保留最近对话</td></tr>
<tr><td>Summarization</td><td>压缩较早历史</td></tr>
<tr><td>Short-term Memory</td><td>当前会话状态</td></tr>
<tr><td>Long-term Memory</td><td>跨会话重要信息</td></tr>
<tr><td>Memory Retrieval</td><td>按需召回记忆</td></tr>
<tr><td>Conversation Manager</td><td>组织消息与会话状态</td></tr>
</tbody></table>
<p><strong>聊天机器人之所以能记住用户，不是因为每次聊天都重新训练模型，而是应用保存、检索并重新提供相关上下文。</strong></p>
<h2>十一、交互式课后测验</h2>
<div class="visual"><div v-for="(q,i) in questions" :key="i" class="question"><b>{{i+1}}. {{q.q}}</b>
<label v-for="(opt,j) in q.opts" :key="j" class="option"><input type="radio" :name="'ch9-'+i" :checked="answers[i]===j" @change="choose(i,j)"/>{{opt}}</label>
<p v-if="submitted" class="feedback">{{answers[i]===q.a?'✓ 回答正确':'正确答案：'+q.opts[q.a]}}。{{q.ex}}</p></div>
<div class="buttons"><button :disabled="questions.some((_,i)=>answers[i]===undefined)" @click="submitted=true">提交评分</button><button @click="answers=[];submitted=false">重新作答</button></div>
<div v-if="submitted" class="metric">得分：{{score}} / {{questions.length}}</div></div>
<h2>十二、学习疑问与解答</h2>
<h3>Q1：恢复聊天界面，为什么不等于让模型知道历史？</h3>
<p>恢复 UI 是从数据库读取消息并渲染 React；让模型利用历史，则需要在推理请求中提供相关消息，或使用支持服务端会话状态的 API。两条流程的服务对象不同。</p>
<h3>Q2：短期记忆与长期记忆分别适合什么数据库？</h3>
<p>会话历史可存 PostgreSQL、MySQL、MongoDB 或 SQLite；Redis 可用于热点会话缓存。长期结构化记忆可存 PostgreSQL，语义检索可用 pgvector、Qdrant、Milvus 等。</p>
<h3>Q3：PostgreSQL 是向量数据库吗？</h3>
<p>PostgreSQL 本质是关系型数据库。安装 pgvector 扩展后，可以在同一数据库中存储 Embedding 向量并执行相似度检索。初期 AI 聊天机器人推荐 PostgreSQL + pgvector；确有性能需求再加 Redis。</p>
<h3>Q4：为什么长期记忆不应该直接等于全部聊天记录？</h3>
<p>聊天历史可能包含无关、过期或敏感内容。长期记忆应按价值、授权、有效期与相关性筛选，并提供查看、更正和删除机制。</p>
<h3>Q5：KV Cache 是不是长期记忆？</h3>
<p>不是。KV Cache 是模型推理时复用的 Key/Value 中间状态，不是面向用户偏好和项目事实的持久化记忆库。</p>
<footer><a href="./08-prompt-messages">← 第 08 篇</a><a href="./">返回课程目录</a></footer>

</article></template><style scoped>
.lesson{font-size:15px;line-height:1.85;color:var(--vp-c-text-1);overflow-wrap:anywhere}.meta{font-size:12px;color:var(--vp-c-text-2)}h1{font-size:30px;line-height:1.35;margin:16px 0 24px}h2{font-size:23px;margin:36px 0 18px;border-top:1px solid var(--vp-c-divider);padding-top:12px}h3{font-size:18px;margin:22px 0 12px}p{margin:14px 0}.visual{border:1px solid var(--vp-c-divider);border-radius:14px;padding:18px;margin:20px 0}.visual>strong{display:block;margin-bottom:12px}.step{background:var(--vp-c-bg-soft);border-radius:9px;padding:12px;text-align:center}.blue{background:rgba(37,99,235,.09)}.green{background:rgba(22,163,74,.09)}.arrow{text-align:center;padding:6px;color:var(--vp-c-text-2)}pre{background:var(--vp-code-block-bg);padding:18px;border-radius:10px;overflow:auto}pre code{white-space:pre;color:var(--vp-c-text-1);font-size:13px}table{display:table;width:100%;font-size:14px}td,th{padding:9px}label{display:block;margin:10px 0}input[type=range]{display:block;width:100%;accent-color:var(--vp-c-brand-1)}.metric{text-align:center;font-size:23px;font-weight:bold;background:var(--vp-c-bg-soft);border-radius:8px;padding:12px}.visual small{display:block;color:var(--vp-c-text-2);font-size:12px}.memory{padding:10px;border-radius:8px;background:var(--vp-c-bg-soft);margin:8px 0;opacity:.55}.memory.kept{background:rgba(22,163,74,.10);opacity:1}.memory p{margin:4px 0}.option{padding:9px;border:1px solid var(--vp-c-divider);border-radius:8px;cursor:pointer}.option input{margin-right:8px}.question{padding:14px 0;border-bottom:1px solid var(--vp-c-divider)}.feedback{background:var(--vp-c-bg-soft);padding:10px;border-radius:8px}.buttons{display:flex;gap:10px;margin-top:14px}.buttons button{border:1px solid var(--vp-c-divider);background:var(--vp-c-bg-soft);border-radius:8px;padding:9px 14px;cursor:pointer}.buttons button:disabled{opacity:.4}footer{display:flex;justify-content:space-between;border-top:1px solid var(--vp-c-divider);margin-top:30px;padding-top:16px}@media(max-width:600px){h1{font-size:24px}h2{font-size:20px}.visual{padding:12px}}
</style>
