import{d as x,h as r,g as L,o as f,c as n,k as t,a as i,t as a,Z as M,$ as C,F as _,D as y,e as A,Q as T,n as P,p as Q,m as V,_ as D,H as K}from"./chunks/framework.68eebb55.js";const l=c=>(Q("data-v-f33258fd"),c=c(),V(),c),O={class:"lesson"},B=T(`<div class="meta" data-v-f33258fd>第 09 / 40 篇 · 第二阶段：聊天机器人核心原理 · 阅读约 20 分钟</div><h1 data-v-f33258fd>多轮对话与上下文管理：ChatGPT 为什么能记住我们之前聊过的内容？</h1><p data-v-f33258fd>如果大语言模型本身不会因为普通聊天而持续更新参数，为什么 ChatGPT 能记住前面聊过的内容？答案涉及模型层的上下文计算、应用层的历史管理和记忆层的按需检索。</p><h2 data-v-f33258fd>一、大语言模型本身真的有记忆吗？</h2><p data-v-f33258fd>用户先说「我正在学习 React」，随后问「它和 Vue 有什么区别？」。模型能够理解代词，是因为本次推理可访问的上下文包含了前面的信息。若只发送第二轮问题，模型可能无法确定「它」指什么。</p><table data-v-f33258fd><thead data-v-f33258fd><tr data-v-f33258fd><th data-v-f33258fd>概念</th><th data-v-f33258fd>保存内容</th><th data-v-f33258fd>生命周期</th></tr></thead><tbody data-v-f33258fd><tr data-v-f33258fd><td data-v-f33258fd>模型权重</td><td data-v-f33258fd>训练学到的模式</td><td data-v-f33258fd>随模型版本存在</td></tr><tr data-v-f33258fd><td data-v-f33258fd>当前上下文</td><td data-v-f33258fd>本次可访问的消息</td><td data-v-f33258fd>取决于请求</td></tr><tr data-v-f33258fd><td data-v-f33258fd>KV Cache</td><td data-v-f33258fd>推理时的 K/V 状态</td><td data-v-f33258fd>取决于缓存策略</td></tr><tr data-v-f33258fd><td data-v-f33258fd>聊天历史</td><td data-v-f33258fd>用户与助手消息</td><td data-v-f33258fd>由应用保存</td></tr><tr data-v-f33258fd><td data-v-f33258fd>长期记忆</td><td data-v-f33258fd>偏好和重要事实</td><td data-v-f33258fd>记忆系统管理</td></tr></tbody></table><p data-v-f33258fd><strong data-v-f33258fd>聊天机器人记住对话，不等于模型权重发生了变化。</strong>无状态 API 通常需要重新提供相关历史，某些 API 也提供服务端会话状态。</p><h2 data-v-f33258fd>二、多轮对话如何实现？</h2><div class="visual" data-v-f33258fd><strong data-v-f33258fd>多轮聊天系统架构</strong><div class="step" data-v-f33258fd>React Chat UI</div><div class="arrow" data-v-f33258fd>↓</div><div class="step" data-v-f33258fd>Node.js API：鉴权、读取历史</div><div class="arrow" data-v-f33258fd>↓</div><div class="step" data-v-f33258fd>PostgreSQL / Redis：会话存储与缓存</div><div class="arrow" data-v-f33258fd>↓</div><div class="step blue" data-v-f33258fd>Context Builder：组装 Messages</div><div class="arrow" data-v-f33258fd>↓</div><div class="step green" data-v-f33258fd>LLM API：生成回答</div><div class="arrow" data-v-f33258fd>↓</div><div class="step" data-v-f33258fd>保存回答，供下一轮使用</div></div><p data-v-f33258fd>一次请求包括：校验用户对会话的权限、读取历史、根据 Token 预算裁剪或摘要、组装 Messages、调用 LLM、保存回答。</p><h3 data-v-f33258fd>2.1 TypeScript：组织历史消息</h3><pre data-v-f33258fd><code data-v-f33258fd>type Role = &quot;user&quot; | &quot;assistant&quot;;
interface ChatMessage { role: Role; content: string; }
const history: ChatMessage[] = [
  { role: &quot;user&quot;, content: &quot;我正在学习 React。&quot; },
  { role: &quot;assistant&quot;, content: &quot;React 是一个 UI 库。&quot; }
];
function buildMessages(history: ChatMessage[], question: string) {
  return [
    { role: &quot;system&quot; as const, content: &quot;你是前端技术导师。&quot; },
    ...history,
    { role: &quot;user&quot; as const, content: question }
  ];
}
console.log(buildMessages(history, &quot;它和 Vue 有什么区别？&quot;));</code></pre><h2 data-v-f33258fd>三、为什么不能无限发送聊天历史？</h2><p data-v-f33258fd>每轮用户输入 100 Tokens、AI 回答 400 Tokens，100 轮约为 50,000 Tokens，500 轮约为 250,000 Tokens。历史增长可能增加成本、Prefill 延迟和噪声。</p>`,14),F={class:"visual"},H=l(()=>t("strong",null,"交互实验：聊天历史 Token 增长",-1)),G={class:"metric"},$=l(()=>t("small",null,"仅为累计历史估算，不含系统提示、工具结果和消息开销。",-1)),z=T("<h2 data-v-f33258fd>四、上下文管理的四种策略</h2><table data-v-f33258fd><thead data-v-f33258fd><tr data-v-f33258fd><th data-v-f33258fd>策略</th><th data-v-f33258fd>思路</th><th data-v-f33258fd>适用场景</th></tr></thead><tbody data-v-f33258fd><tr data-v-f33258fd><td data-v-f33258fd>全量历史</td><td data-v-f33258fd>发送全部消息</td><td data-v-f33258fd>短对话</td></tr><tr data-v-f33258fd><td data-v-f33258fd>滑动窗口</td><td data-v-f33258fd>保留最近 N 轮</td><td data-v-f33258fd>普通聊天</td></tr><tr data-v-f33258fd><td data-v-f33258fd>历史摘要</td><td data-v-f33258fd>压缩较早对话</td><td data-v-f33258fd>长时间聊天</td></tr><tr data-v-f33258fd><td data-v-f33258fd>记忆检索</td><td data-v-f33258fd>召回相关事实</td><td data-v-f33258fd>长期助手</td></tr></tbody></table><h3 data-v-f33258fd>4.1 全量历史</h3><p data-v-f33258fd>直接发送全部消息，实现简单但 Token 消耗持续增长。</p><pre data-v-f33258fd><code data-v-f33258fd>const messages = [systemPrompt, ...allHistory, currentMessage];</code></pre><h3 data-v-f33258fd>4.2 滑动窗口</h3><p data-v-f33258fd>只保留最近 N 轮完整问答，较早重要信息可能丢失。</p>",7),W={class:"visual"},Y=l(()=>t("strong",null,"交互实验：滑动窗口裁剪",-1)),Z=l(()=>t("small",null,"实际裁剪需保持工具调用与消息结构完整。",-1)),j=T(`<h3 data-v-f33258fd>4.3 历史摘要</h3><p data-v-f33258fd>将较早对话压缩为「用户开发 React + NestJS 企业系统，偏好 TypeScript 示例，当前讨论统一鉴权」等摘要，结合最近消息发送。摘要可能遗漏信息、过期或错误归纳，需校验和更新。</p><h3 data-v-f33258fd>4.4 记忆检索</h3><p data-v-f33258fd>将重要信息持久化，在当前任务需要时召回相关记忆，而不是无限发送全部历史。例如「教程必须 1:1 还原」就是长期项目偏好。</p><h2 data-v-f33258fd>五、短期记忆与长期记忆有什么区别？</h2><p data-v-f33258fd>短期记忆主要服务于当前会话，保存最近消息、当前任务状态和临时工具结果；长期记忆跨会话保存用户偏好、项目背景和重要事实。</p><table data-v-f33258fd><thead data-v-f33258fd><tr data-v-f33258fd><th data-v-f33258fd>维度</th><th data-v-f33258fd>短期记忆</th><th data-v-f33258fd>长期记忆</th></tr></thead><tbody data-v-f33258fd><tr data-v-f33258fd><td data-v-f33258fd>作用范围</td><td data-v-f33258fd>当前会话</td><td data-v-f33258fd>跨会话</td></tr><tr data-v-f33258fd><td data-v-f33258fd>保存内容</td><td data-v-f33258fd>聊天历史、任务状态</td><td data-v-f33258fd>偏好、重要事实</td></tr><tr data-v-f33258fd><td data-v-f33258fd>存储方式</td><td data-v-f33258fd>会话数据库、缓存</td><td data-v-f33258fd>持久化数据库、向量库</td></tr><tr data-v-f33258fd><td data-v-f33258fd>生命周期</td><td data-v-f33258fd>通常较短</td><td data-v-f33258fd>通常较长</td></tr><tr data-v-f33258fd><td data-v-f33258fd>检索方式</td><td data-v-f33258fd>按会话读取</td><td data-v-f33258fd>关键词、语义、结构化查询</td></tr><tr data-v-f33258fd><td data-v-f33258fd>主要问题</td><td data-v-f33258fd>上下文过长</td><td data-v-f33258fd>记忆过期、冲突、隐私</td></tr></tbody></table><p data-v-f33258fd><strong data-v-f33258fd>长期记忆不是把全部聊天记录永久放进 Prompt，而是在需要时取出相关信息。</strong></p><h2 data-v-f33258fd>六、长期记忆如何存储与检索？</h2><h3 data-v-f33258fd>6.1 记忆的数据结构</h3><pre data-v-f33258fd><code data-v-f33258fd>interface Memory {
  id: string;
  userId: string;
  category: &quot;preference&quot; | &quot;fact&quot; | &quot;project&quot;;
  content: string;
  createdAt: number;
  updatedAt: number;
  sourceConversationId?: string;
}</code></pre><p data-v-f33258fd>记忆可以存储在 PostgreSQL、MySQL 或 MongoDB 中。结构化偏好可直接 SQL 查询；当需要语义相似检索时，可以考虑 PostgreSQL + pgvector、Qdrant 等方案。还需要考虑来源、有效期、用户删除权和敏感信息保护。</p><h3 data-v-f33258fd>6.2 记忆如何进入 Prompt？</h3><div class="visual" data-v-f33258fd><strong data-v-f33258fd>长期记忆检索流程</strong><div class="step" data-v-f33258fd>用户发送问题</div><div class="arrow" data-v-f33258fd>↓</div><div class="step" data-v-f33258fd>Memory Retriever：检索相关记忆</div><div class="arrow" data-v-f33258fd>↓</div><div class="step" data-v-f33258fd>Memory Filter：权限、冲突与有效期</div><div class="arrow" data-v-f33258fd>↓</div><div class="step" data-v-f33258fd>Context Builder：组合记忆、历史与当前问题</div><div class="arrow" data-v-f33258fd>↓</div><div class="step green" data-v-f33258fd>LLM 生成回答</div></div><h3 data-v-f33258fd>6.3 交互实验：记忆检索</h3>`,15),J={class:"visual"},X=l(()=>t("strong",null,"关键词记忆检索模拟器",-1)),tt=["checked","onChange"],dt=l(()=>t("small",null,"教学用关键词规则，并非真实 Embedding 语义检索。",-1)),at=T(`<h2 data-v-f33258fd>七、TypeScript 实现多轮对话管理器</h2><h3 data-v-f33258fd>7.1 定义消息类型</h3><pre data-v-f33258fd><code data-v-f33258fd>type ChatRole = &quot;user&quot; | &quot;assistant&quot;;
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
}</code></pre><h3 data-v-f33258fd>7.2 ConversationManager</h3><pre data-v-f33258fd><code data-v-f33258fd>class ConversationManager {
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
      throw new Error(&quot;Conversation not found&quot;);
    }
    conversation.messages.push(message);
  }

  getHistory(conversationId: string, userId: string) {
    const conversation = this.conversations.get(conversationId);
    if (!conversation || conversation.userId !== userId) {
      throw new Error(&quot;Conversation not found&quot;);
    }
    return [...conversation.messages];
  }
}</code></pre><p data-v-f33258fd>进程内 Map 仅用于教学。生产环境应持久化到数据库，并在读写时检查会话归属，避免跨用户访问。</p><h3 data-v-f33258fd>7.3 根据 Token 预算裁剪消息</h3><pre data-v-f33258fd><code data-v-f33258fd>interface Message {
  role: &quot;user&quot; | &quot;assistant&quot;;
  content: string;
}
function trimHistory(
  history: Message[],
  maxTokens: number,
  countTokens: (text: string) =&gt; number
): Message[] {
  const result: Message[] = [];
  let usedTokens = 0;
  for (let i = history.length - 1; i &gt;= 0; i--) {
    const message = history[i];
    const tokens = countTokens(message.content);
    if (usedTokens + tokens &gt; maxTokens) break;
    result.unshift(message);
    usedTokens += tokens;
  }
  return result;
}</code></pre><p data-v-f33258fd>这里的 countTokens 需使用与模型兼容的 Tokenizer 或计数接口。实际还应计算消息格式开销，并保持工具调用结构完整。</p><h2 data-v-f33258fd>八、React + Node.js 聊天系统架构</h2><div class="visual" data-v-f33258fd><strong data-v-f33258fd>生产级聊天系统架构</strong><div class="step blue" data-v-f33258fd>React Chat UI：聊天列表、输入框、流式渲染</div><div class="arrow" data-v-f33258fd>↓</div><div class="step" data-v-f33258fd>Node.js / NestJS API：鉴权、限流、会话路由</div><div class="arrow" data-v-f33258fd>↓</div><div class="step" data-v-f33258fd>Conversation Service + Memory Service</div><div class="arrow" data-v-f33258fd>↓</div><div class="step green" data-v-f33258fd>LLM API + PostgreSQL / Redis / pgvector</div></div><h3 data-v-f33258fd>8.1 数据库设计</h3><pre data-v-f33258fd><code data-v-f33258fd>CREATE TABLE conversations (
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
ON messages(conversation_id, created_at);</code></pre><p data-v-f33258fd>生产级还应考虑消息状态、顺序、幂等性、工具调用记录、删除策略和多租户隔离。</p><h3 data-v-f33258fd>8.2 为什么要使用 Redis？</h3><p data-v-f33258fd>Redis 适合缓存最近聊天历史、临时任务状态、限流和协调。需要长期保存的重要记录通常应由可靠的持久化数据库承担。初期 MVP 可以先使用 PostgreSQL，等出现性能需求再引入 Redis。</p><h2 data-v-f33258fd>九、生产级上下文管理与性能优化</h2><h3 data-v-f33258fd>9.1 推荐的上下文组织方式</h3><pre data-v-f33258fd><code data-v-f33258fd>System Prompt
      +
相关长期记忆（经过权限与有效期检查）
      +
历史对话摘要
      +
最近几轮完整消息
      +
当前用户问题</code></pre><p data-v-f33258fd>这不是固定公式。代码调试可能更依赖最近错误日志；长期学习助手可能更依赖目标和学习进度。应按任务设计上下文策略。</p><h3 data-v-f33258fd>9.2 重点监控指标</h3><table data-v-f33258fd><thead data-v-f33258fd><tr data-v-f33258fd><th data-v-f33258fd>指标</th><th data-v-f33258fd>作用</th></tr></thead><tbody data-v-f33258fd><tr data-v-f33258fd><td data-v-f33258fd>Input Tokens</td><td data-v-f33258fd>衡量上下文成本</td></tr><tr data-v-f33258fd><td data-v-f33258fd>TTFT</td><td data-v-f33258fd>首 Token 响应延迟</td></tr><tr data-v-f33258fd><td data-v-f33258fd>Memory Hit Rate</td><td data-v-f33258fd>记忆召回情况</td></tr><tr data-v-f33258fd><td data-v-f33258fd>Retrieval Relevance</td><td data-v-f33258fd>检索相关性</td></tr><tr data-v-f33258fd><td data-v-f33258fd>Context Truncation Rate</td><td data-v-f33258fd>历史裁剪频率</td></tr><tr data-v-f33258fd><td data-v-f33258fd>Answer Quality</td><td data-v-f33258fd>回答正确性</td></tr></tbody></table><p data-v-f33258fd>记忆命中率越高不一定越好，错误或过期记忆被频繁召回也会降低回答质量。</p><h3 data-v-f33258fd>9.3 长期记忆的隐私与安全</h3><p data-v-f33258fd>应考虑用户是否同意保存、能否查看和更正、能否删除、敏感信息如何处理、记忆有效期，以及多用户间的数据隔离。长期记忆不仅是产品能力，也是数据治理责任。</p><h2 data-v-f33258fd>十、本篇总结</h2><table data-v-f33258fd><thead data-v-f33258fd><tr data-v-f33258fd><th data-v-f33258fd>概念</th><th data-v-f33258fd>作用</th></tr></thead><tbody data-v-f33258fd><tr data-v-f33258fd><td data-v-f33258fd>Chat History</td><td data-v-f33258fd>保存历史消息</td></tr><tr data-v-f33258fd><td data-v-f33258fd>Context Window</td><td data-v-f33258fd>限制本次推理可处理内容</td></tr><tr data-v-f33258fd><td data-v-f33258fd>Sliding Window</td><td data-v-f33258fd>保留最近对话</td></tr><tr data-v-f33258fd><td data-v-f33258fd>Summarization</td><td data-v-f33258fd>压缩较早历史</td></tr><tr data-v-f33258fd><td data-v-f33258fd>Short-term Memory</td><td data-v-f33258fd>当前会话状态</td></tr><tr data-v-f33258fd><td data-v-f33258fd>Long-term Memory</td><td data-v-f33258fd>跨会话重要信息</td></tr><tr data-v-f33258fd><td data-v-f33258fd>Memory Retrieval</td><td data-v-f33258fd>按需召回记忆</td></tr><tr data-v-f33258fd><td data-v-f33258fd>Conversation Manager</td><td data-v-f33258fd>组织消息与会话状态</td></tr></tbody></table><p data-v-f33258fd><strong data-v-f33258fd>聊天机器人之所以能记住用户，不是因为每次聊天都重新训练模型，而是应用保存、检索并重新提供相关上下文。</strong></p><h2 data-v-f33258fd>十一、交互式课后测验</h2>`,29),et={class:"visual"},st=["name","checked","onChange"],ft={key:0,class:"feedback"},nt={class:"buttons"},ot=["disabled"],vt={key:0,class:"metric"},rt=T('<h2 data-v-f33258fd>十二、学习疑问与解答</h2><h3 data-v-f33258fd>Q1：恢复聊天界面，为什么不等于让模型知道历史？</h3><p data-v-f33258fd>恢复 UI 是从数据库读取消息并渲染 React；让模型利用历史，则需要在推理请求中提供相关消息，或使用支持服务端会话状态的 API。两条流程的服务对象不同。</p><h3 data-v-f33258fd>Q2：短期记忆与长期记忆分别适合什么数据库？</h3><p data-v-f33258fd>会话历史可存 PostgreSQL、MySQL、MongoDB 或 SQLite；Redis 可用于热点会话缓存。长期结构化记忆可存 PostgreSQL，语义检索可用 pgvector、Qdrant、Milvus 等。</p><h3 data-v-f33258fd>Q3：PostgreSQL 是向量数据库吗？</h3><p data-v-f33258fd>PostgreSQL 本质是关系型数据库。安装 pgvector 扩展后，可以在同一数据库中存储 Embedding 向量并执行相似度检索。初期 AI 聊天机器人推荐 PostgreSQL + pgvector；确有性能需求再加 Redis。</p><h3 data-v-f33258fd>Q4：为什么长期记忆不应该直接等于全部聊天记录？</h3><p data-v-f33258fd>聊天历史可能包含无关、过期或敏感内容。长期记忆应按价值、授权、有效期与相关性筛选，并提供查看、更正和删除机制。</p><h3 data-v-f33258fd>Q5：KV Cache 是不是长期记忆？</h3><p data-v-f33258fd>不是。KV Cache 是模型推理时复用的 Key/Value 中间状态，不是面向用户偏好和项目事实的持久化记忆库。</p><footer data-v-f33258fd><a href="./08-prompt-messages" data-v-f33258fd>← 第 08 篇</a><a href="./" data-v-f33258fd>返回课程目录</a></footer>',12),it=x({__name:"ConversationMemoryLesson",setup(c){const u=r(100),h=r(100),b=r(400),p=r(2),E=L(()=>u.value*(h.value+b.value)),o=r("生成下一篇 AI 教程"),k=[["介绍 React","React 是 UI 库"],["Vue 呢？","Vue 是前端框架"],["状态管理怎么做？","有多种方案"],["它们如何比较？","需要结合上下文"]],S=["用户主要使用 TypeScript 和 React","用户喜欢中文文字教程","GitHub 教程必须 1:1 还原","用户正在研究 RAG 和 Embedding"],q=L(()=>S.map((m,e)=>[o.value.includes("React")||o.value.includes("TypeScript"),o.value.includes("教程"),o.value.includes("教程"),o.value.includes("RAG")||o.value.includes("Embedding")][e])),I=[{q:"无状态聊天 API 如何利用历史？",opts:["应用提供相关历史","模型自动修改权重","Tokenizer 自动读取数据库"],a:0,ex:"需要把相关上下文提供给模型。"},{q:"滑动窗口的主要风险？",opts:["不能减少 Token","较早重要信息可能被裁剪","必须使用向量数据库"],a:1,ex:"窗口会丢失更早的消息。"},{q:"长期记忆必须使用向量数据库吗？",opts:["必须","不必，结构化记忆可以用关系数据库","只能存储在模型权重中"],a:1,ex:"PostgreSQL 可以保存结构化记忆；语义检索时再考虑 pgvector。"},{q:"KV Cache 和长期记忆一样吗？",opts:["一样","KV Cache 是推理缓存，长期记忆由应用管理","KV Cache 是数据库"],a:1,ex:"两者用途和生命周期不同。"},{q:"恢复聊天 UI 就代表模型获得历史吗？",opts:["是","不是，仍需将历史提供给模型或使用服务端会话状态","只取决于 React"],a:1,ex:"界面显示与模型推理是两条不同的数据流。"}],v=r([]),g=r(!1),N=L(()=>I.filter((m,e)=>v.value[e]===m.a).length);function U(m,e){const d=[...v.value];d[m]=e,v.value=d,g.value=!1}return(m,e)=>(f(),n("article",O,[B,t("div",F,[H,t("label",null,[i("对话轮数："+a(u.value),1),M(t("input",{"onUpdate:modelValue":e[0]||(e[0]=d=>u.value=d),type:"range",min:"10",max:"500",step:"10"},null,512),[[C,u.value,void 0,{number:!0}]])]),t("label",null,[i("每轮用户输入："+a(h.value)+" Tokens",1),M(t("input",{"onUpdate:modelValue":e[1]||(e[1]=d=>h.value=d),type:"range",min:"50",max:"1000",step:"50"},null,512),[[C,h.value,void 0,{number:!0}]])]),t("label",null,[i("每轮 AI 输出："+a(b.value)+" Tokens",1),M(t("input",{"onUpdate:modelValue":e[2]||(e[2]=d=>b.value=d),type:"range",min:"100",max:"2000",step:"100"},null,512),[[C,b.value,void 0,{number:!0}]])]),t("div",G,a(E.value.toLocaleString("en-US"))+" Tokens",1),$]),z,t("div",W,[Y,t("label",null,[i("保留最近完整轮数："+a(p.value),1),M(t("input",{"onUpdate:modelValue":e[3]||(e[3]=d=>p.value=d),type:"range",min:"1",max:"4",step:"1"},null,512),[[C,p.value,void 0,{number:!0}]])]),(f(),n(_,null,y(k,(d,s)=>t("div",{key:s,class:P(["memory",{kept:s>=k.length-p.value}])},[t("b",null,"第 "+a(s+1)+" 轮 · "+a(s>=k.length-p.value?"保留":"裁剪"),1),t("p",null,"用户："+a(d[0]),1),t("p",null,"AI："+a(d[1]),1)],2)),64)),Z]),j,t("div",J,[X,(f(),n(_,null,y(["生成下一篇 AI 教程","写一段 React TypeScript 代码","解释 RAG 和 Embedding"],d=>t("label",{key:d,class:"option"},[t("input",{type:"radio",name:"memory-query",checked:o.value===d,onChange:s=>o.value=d},null,40,tt),i(a(d),1)])),64)),(f(),n(_,null,y(S,(d,s)=>t("div",{key:s,class:P(["memory",{kept:q.value[s]}])},a(q.value[s]?"✓":"○")+" "+a(d),3)),64)),dt]),at,t("div",et,[(f(),n(_,null,y(I,(d,s)=>t("div",{key:s,class:"question"},[t("b",null,a(s+1)+". "+a(d.q),1),(f(!0),n(_,null,y(d.opts,(w,R)=>(f(),n("label",{key:R,class:"option"},[t("input",{type:"radio",name:"ch9-"+s,checked:v.value[s]===R,onChange:ut=>U(s,R)},null,40,st),i(a(w),1)]))),128)),g.value?(f(),n("p",ft,a(v.value[s]===d.a?"✓ 回答正确":"正确答案："+d.opts[d.a])+"。"+a(d.ex),1)):A("",!0)])),64)),t("div",nt,[t("button",{disabled:I.some((d,s)=>v.value[s]===void 0),onClick:e[4]||(e[4]=d=>g.value=!0)},"提交评分",8,ot),t("button",{onClick:e[5]||(e[5]=d=>{v.value=[],g.value=!1})},"重新作答")]),g.value?(f(),n("div",vt,"得分："+a(N.value)+" / "+a(I.length),1)):A("",!0)]),rt]))}});const lt=D(it,[["__scopeId","data-v-f33258fd"]]),pt=JSON.parse('{"title":"09 · 多轮对话与上下文管理","description":"","frontmatter":{"title":"09 · 多轮对话与上下文管理","outline":"deep"},"headers":[],"relativePath":"guide/ai/chatbot-course/09-conversation-memory.md","filePath":"guide/ai/chatbot-course/09-conversation-memory.md","lastUpdated":1792392467000}'),ct={name:"guide/ai/chatbot-course/09-conversation-memory.md"},gt=Object.assign(ct,{setup(c){return(u,h)=>(f(),n("div",null,[K(lt)]))}});export{pt as __pageData,gt as default};
