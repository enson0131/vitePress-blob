import{d as P,h as r,g as I,o as l,c as d,k as t,l as N,a as x,t as e,Z as g,$ as k,N as G,F as C,D as M,e as V,p as U,m as $,_ as j,H as E}from"./chunks/framework.742c4849.js";const Q=`<h1 data-source-block="0" style="margin-top:0px;margin-bottom:8px">📘 第 10 篇：聊天机器人的记忆系统——短期记忆、长期记忆与语义检索</h1>
<p data-source-block="1" style="margin-top:0px;margin-bottom:4px"><strong>《AI 聊天机器人学习教程》｜第 10 / 40 篇</strong></p>
<p data-source-block="2" style="margin-top:16px;margin-bottom:16px">所属阶段：第二阶段 · 聊天机器人核心原理<br/>阅读时间：约 15 分钟<br/>技术栈：TypeScript + Node.js + Vue 3</p>
<h2 data-source-block="3" style="margin-top:16px;margin-bottom:4px">一、为什么聊天机器人需要记忆？</h2>
<p data-source-block="4" style="margin-top:0px;margin-bottom:4px">假设你今天告诉 AI：</p>
<blockquote data-source-block="5" style="margin-top:0px;margin-bottom:8px"><p>我是一名前端开发工程师，以后给我代码示例时，优先使用 TypeScript。</p></blockquote>
<p data-source-block="6" style="margin-top:8px;margin-bottom:4px">第二天，你打开一个新对话：</p>
<blockquote data-source-block="7" style="margin-top:0px;margin-bottom:8px"><p>帮我实现一个防抖函数。</p></blockquote>
<p data-source-block="8" style="margin-top:8px;margin-bottom:4px">如果聊天机器人具有长期记忆，它就可能主动选择 TypeScript，而不需要你重复说明。</p>
<p data-source-block="9" style="margin-top:16px;margin-bottom:4px">但这里有一个重要问题：</p>
<p data-source-block="10" style="margin-top:16px;margin-bottom:4px"><strong>大语言模型本身并不等于记忆数据库。</strong></p>
<p data-source-block="11" style="margin-top:16px;margin-bottom:4px">聊天机器人能够记住信息，通常依赖应用层的记忆管理系统。</p>
<p data-source-block="12" style="margin-top:16px;margin-bottom:16px">我们可以把记忆分成三类。</p>
<div class="tablewrap" data-source-block="13" style="margin-top:16px;margin-bottom:0px"><table><thead><tr><th>记忆类型</th><th>作用</th><th>存储位置</th></tr></thead><tbody><tr><td>短期记忆</td><td>理解当前对话</td><td>Messages / 上下文</td></tr><tr><td>长期记忆</td><td>跨会话保存偏好和事实</td><td>数据库、向量索引</td></tr><tr><td>KV Cache</td><td>加速模型推理</td><td>推理服务内存或显存</td></tr></tbody></table></div>
<p data-source-block="14" style="margin-top:8px;margin-bottom:4px">需要特别注意：</p>
<p data-source-block="15" style="margin-top:16px;margin-bottom:4px"><strong>KV Cache 不是长期记忆。</strong></p>
<p data-source-block="16" style="margin-top:16px;margin-bottom:16px">它主要用于避免重复计算历史 Token 的 Key 和 Value。</p>
<hr data-source-block="17" style="margin-top:28px;margin-bottom:28px"/>
<h2 data-source-block="18" style="margin-top:0px;margin-bottom:4px">二、记忆系统的核心架构</h2>
<p data-source-block="19" style="margin-top:0px;margin-bottom:4px">一个完整的记忆系统通常包含两条独立流程。</p>
<h3 data-source-block="20" style="margin-top:16px;margin-bottom:4px">2.1 写入记忆</h3>
<div class="codeblock" data-code="0" data-source-block="21" style="margin-top:20px;margin-bottom:20px"><div class="codebar"><span aria-hidden="true" class="codeicon"></span><span class="language">纯文本</span><span class="codeactions"><button aria-label="启用自动换行" aria-pressed="false" data-action="wrap" type="button"></button><button aria-label="复制代码" data-action="copy" type="button"></button></span></div><pre aria-label="纯文本代码或流程" tabindex="0"><code>用户发送消息
     ↓
判断是否值得保存
     ↓
提取候选记忆
     ↓
验证、去重、处理冲突
     ↓
保存数据库
     ↓
更新检索索引</code></pre></div>
<p data-source-block="22" style="margin-top:8px;margin-bottom:4px">例如：</p>
<div class="codeblock" data-code="1" data-source-block="23" style="margin-top:20px;margin-bottom:20px"><div class="codebar"><span aria-hidden="true" class="codeicon"></span><span class="language">纯文本</span><span class="codeactions"><button aria-label="启用自动换行" aria-pressed="false" data-action="wrap" type="button"></button><button aria-label="复制代码" data-action="copy" type="button"></button></span></div><pre aria-label="纯文本代码或流程" tabindex="0"><code>用户：
以后代码示例优先使用 TypeScript。</code></pre></div>
<p data-source-block="24" style="margin-top:8px;margin-bottom:4px">可以提取为：</p>
<div class="codeblock" data-code="2" data-source-block="25" style="margin-top:20px;margin-bottom:20px"><div class="codebar"><span aria-hidden="true" class="codeicon"></span><span class="language">JSON</span><span class="codeactions"><button aria-label="启用自动换行" aria-pressed="false" data-action="wrap" type="button"></button><button aria-label="复制代码" data-action="copy" type="button"></button></span></div><pre aria-label="JSON代码或流程" tabindex="0"><code>{
  "category": <span class="text-codex-syntax-string">"preference"</span>,
  "content": <span class="text-codex-syntax-string">"代码示例优先使用 TypeScript"</span>,
  "scope": <span class="text-codex-syntax-string">"user"</span>
}</code></pre></div>
<p data-source-block="26" style="margin-top:8px;margin-bottom:4px">但不是所有聊天内容都应该保存。</p>
<p data-source-block="27" style="margin-top:16px;margin-bottom:16px">例如临时问题、过期信息、未经验证的推断，以及不必要的敏感信息，都不应该默认永久保存。</p>
<h3 data-source-block="28" style="margin-top:16px;margin-bottom:4px">2.2 读取记忆</h3>
<div class="codeblock" data-code="3" data-source-block="29" style="margin-top:20px;margin-bottom:20px"><div class="codebar"><span aria-hidden="true" class="codeicon"></span><span class="language">纯文本</span><span class="codeactions"><button aria-label="启用自动换行" aria-pressed="false" data-action="wrap" type="button"></button><button aria-label="复制代码" data-action="copy" type="button"></button></span></div><pre aria-label="纯文本代码或流程" tabindex="0"><code>用户提出新问题
     ↓
识别当前任务
     ↓
检索相关记忆
     ↓
检查权限和有效期
     ↓
根据相关性排序
     ↓
注入 Messages
     ↓
LLM 生成回答</code></pre></div>
<p data-source-block="30" style="margin-top:8px;margin-bottom:4px"><strong>长期记忆的关键不是保存所有内容，而是在正确的时候取出正确的信息。</strong></p>
<hr data-source-block="31" style="margin-top:28px;margin-bottom:28px"/>
<h2 data-source-block="32" style="margin-top:0px;margin-bottom:4px">三、短期记忆：Sliding Window 与 Summary</h2>
<p data-source-block="33" style="margin-top:0px;margin-bottom:4px">假设用户与机器人已经进行了 100 轮对话。</p>
<p data-source-block="34" style="margin-top:16px;margin-bottom:16px">如果每次请求都发送全部历史消息，会出现两个问题：</p>
<ol data-source-block="35" style="margin-top:0px;margin-bottom:0px"><li>输入 Token 成本越来越高。</li><li>Prefill 需要处理越来越长的上下文。</li></ol>
<p data-source-block="36" style="margin-top:8px;margin-bottom:4px">因此可以使用滑动窗口。</p>
<div class="codeblock" data-code="4" data-source-block="37" style="margin-top:20px;margin-bottom:20px"><div class="codebar"><span aria-hidden="true" class="codeicon"></span><span class="language">TypeScript</span><span class="codeactions"><button aria-label="启用自动换行" aria-pressed="false" data-action="wrap" type="button"></button><button aria-label="复制代码" data-action="copy" type="button"></button></span></div><pre aria-label="TypeScript代码或流程" tabindex="0"><code><span class="text-codex-syntax-keyword">const</span> <span class="text-codex-syntax-variable">recentMessages</span> <span class="text-codex-syntax-keyword">=</span> <span class="text-codex-syntax-variable">messages</span><span class="text-codex-syntax-keyword">.</span>slice(<span class="text-codex-syntax-keyword">-</span><span class="text-codex-syntax-literal">20</span>);</code></pre></div>
<p data-source-block="38" style="margin-top:8px;margin-bottom:4px">这样只保留最近 20 条消息。</p>
<p data-source-block="39" style="margin-top:16px;margin-bottom:4px">但是，如果用户的重要要求出现在更早的消息中，就可能被丢弃。</p>
<p data-source-block="40" style="margin-top:16px;margin-bottom:16px">另一种方式是历史摘要：</p>
<div class="codeblock" data-code="5" data-source-block="41" style="margin-top:20px;margin-bottom:20px"><div class="codebar"><span aria-hidden="true" class="codeicon"></span><span class="language">纯文本</span><span class="codeactions"><button aria-label="启用自动换行" aria-pressed="false" data-action="wrap" type="button"></button><button aria-label="复制代码" data-action="copy" type="button"></button></span></div><pre aria-label="纯文本代码或流程" tabindex="0"><code>原始历史：
用户介绍了自己的技术背景、
项目情况和代码风格偏好。

压缩摘要：
用户是前端开发工程师，
优先使用 TypeScript，
目前正在学习 AI 聊天机器人开发。</code></pre></div>
<p data-source-block="42" style="margin-top:8px;margin-bottom:4px">摘要能够减少 Token，但属于有损压缩。</p>
<p data-source-block="43" style="margin-top:16px;margin-bottom:4px">例如，把“每月 1 号投入 800 美元”摘要为“每月投资”，就丢失了重要的日期和金额。</p>
<p data-source-block="44" style="margin-top:16px;margin-bottom:16px">因此，关键事实最好保留结构化记录和原始来源。</p>
<hr data-source-block="45" style="margin-top:28px;margin-bottom:28px"/>
`,B=`<h2 data-source-block="46" style="margin-top:0px;margin-bottom:4px">四、长期记忆的数据结构</h2>
<p data-source-block="47" style="margin-top:0px;margin-bottom:4px">实际开发中，不建议只保存一段字符串。</p>
<p data-source-block="48" style="margin-top:16px;margin-bottom:16px">可以使用以下 TypeScript 类型：</p>
<div class="codeblock" data-code="6" data-source-block="49" style="margin-top:20px;margin-bottom:20px"><div class="codebar"><span aria-hidden="true" class="codeicon"></span><span class="language">TypeScript</span><span class="codeactions"><button aria-label="启用自动换行" aria-pressed="false" data-action="wrap" type="button"></button><button aria-label="复制代码" data-action="copy" type="button"></button></span></div><pre aria-label="TypeScript代码或流程" tabindex="0"><code><span class="text-codex-syntax-keyword">type</span> <span class="text-codex-syntax-variable">MemoryRecord</span> <span class="text-codex-syntax-keyword">=</span> {
  id: <span class="text-codex-syntax-variable">string</span>;
  userId: <span class="text-codex-syntax-variable">string</span>;

  scope: <span class="text-codex-syntax-string">"user"</span> <span class="text-codex-syntax-keyword">|</span> <span class="text-codex-syntax-string">"project"</span>;

  content: <span class="text-codex-syntax-variable">string</span>;

  category:
    <span class="text-codex-syntax-keyword">|</span> <span class="text-codex-syntax-string">"preference"</span>
    <span class="text-codex-syntax-keyword">|</span> <span class="text-codex-syntax-string">"fact"</span>
    <span class="text-codex-syntax-keyword">|</span> <span class="text-codex-syntax-string">"task"</span>;

  sourceMessageId?: <span class="text-codex-syntax-variable">string</span>;

  createdAt: <span class="text-codex-syntax-variable">string</span>;
  updatedAt: <span class="text-codex-syntax-variable">string</span>;
  expiresAt?: <span class="text-codex-syntax-variable">string</span>;

  status:
    <span class="text-codex-syntax-keyword">|</span> <span class="text-codex-syntax-string">"active"</span>
    <span class="text-codex-syntax-keyword">|</span> <span class="text-codex-syntax-string">"superseded"</span>
    <span class="text-codex-syntax-keyword">|</span> <span class="text-codex-syntax-string">"deleted"</span>;
};</code></pre></div>
<p data-source-block="50" style="margin-top:8px;margin-bottom:4px">为什么需要 <span class="InlineCode-Cddi3Y">status</span>？</p>
<p data-source-block="51" style="margin-top:16px;margin-bottom:16px">假设用户之前说：</p>
<blockquote data-source-block="52" style="margin-top:0px;margin-bottom:8px"><p>代码示例优先 Python。</p></blockquote>
<p data-source-block="53" style="margin-top:8px;margin-bottom:4px">后来又说：</p>
<blockquote data-source-block="54" style="margin-top:0px;margin-bottom:8px"><p>以后改成 TypeScript。</p></blockquote>
<p data-source-block="55" style="margin-top:8px;margin-bottom:4px">记忆系统不能让两条互相冲突的偏好同时生效。</p>
<p data-source-block="56" style="margin-top:16px;margin-bottom:16px">更合理的方式是让新偏好生效，并将旧记录标记为已被替代。</p>
<hr data-source-block="57" style="margin-top:28px;margin-bottom:28px"/>
<h2 data-source-block="58" style="margin-top:0px;margin-bottom:4px">五、Embedding 如何帮助检索记忆？</h2>
<p data-source-block="59" style="margin-top:0px;margin-bottom:4px">假设数据库保存了一条记忆：</p>
<blockquote data-source-block="60" style="margin-top:0px;margin-bottom:8px"><p>用户喜欢使用 TypeScript 开发前端应用。</p></blockquote>
<p data-source-block="61" style="margin-top:8px;margin-bottom:4px">后来用户问：</p>
<blockquote data-source-block="62" style="margin-top:0px;margin-bottom:8px"><p>我之前说过代码示例用什么语言吗？</p></blockquote>
<p data-source-block="63" style="margin-top:8px;margin-bottom:4px">这两句话并没有完全相同的关键词，但语义相关。</p>
<p data-source-block="64" style="margin-top:16px;margin-bottom:4px">我们可以通过 Embedding 将文本转换成向量，再执行相似度检索。</p>
<p data-source-block="65" style="margin-top:16px;margin-bottom:16px">典型流程：</p>
<div class="codeblock" data-code="7" data-source-block="66" style="margin-top:20px;margin-bottom:20px"><div class="codebar"><span aria-hidden="true" class="codeicon"></span><span class="language">纯文本</span><span class="codeactions"><button aria-label="启用自动换行" aria-pressed="false" data-action="wrap" type="button"></button><button aria-label="复制代码" data-action="copy" type="button"></button></span></div><pre aria-label="纯文本代码或流程" tabindex="0"><code>用户当前问题
     ↓
Embedding
     ↓
生成查询向量
     ↓
向量数据库检索
     ↓
获取相关记忆
     ↓
权限过滤与重排序
     ↓
注入当前上下文</code></pre></div>
<p data-source-block="67" style="margin-top:8px;margin-bottom:4px">不过，向量相似度高不代表信息一定正确。</p>
<p data-source-block="68" style="margin-top:16px;margin-bottom:16px">实际系统还需要考虑记忆来源、时间有效性和用户权限。</p>
<hr data-source-block="69" style="margin-top:28px;margin-bottom:28px"/>
<h2 data-source-block="70" style="margin-top:0px;margin-bottom:4px">六、TypeScript：实现一个简单记忆检索器</h2>
<p data-source-block="71" style="margin-top:0px;margin-bottom:4px">下面先用关键词匹配演示检索流程。</p>
<div class="codeblock" data-code="8" data-source-block="72" style="margin-top:20px;margin-bottom:20px"><div class="codebar"><span aria-hidden="true" class="codeicon"></span><span class="language">TypeScript</span><span class="codeactions"><button aria-label="启用自动换行" aria-pressed="false" data-action="wrap" type="button"></button><button aria-label="复制代码" data-action="copy" type="button"></button></span></div><pre aria-label="TypeScript代码或流程" tabindex="0"><code><span class="text-codex-syntax-keyword">type</span> <span class="text-codex-syntax-variable">Memory</span> <span class="text-codex-syntax-keyword">=</span> {
  id: <span class="text-codex-syntax-variable">string</span>;
  userId: <span class="text-codex-syntax-variable">string</span>;
  projectId?: <span class="text-codex-syntax-variable">string</span>;
  content: <span class="text-codex-syntax-variable">string</span>;
  updatedAt: <span class="text-codex-syntax-variable">number</span>;
  deleted?: <span class="text-codex-syntax-variable">boolean</span>;
};

<span class="text-codex-syntax-keyword">function</span> <span class="text-codex-syntax-variable">retrieve</span>(
  <span class="text-codex-syntax-variable">records</span>: <span class="text-codex-syntax-variable">Memory</span>[],
  <span class="text-codex-syntax-variable">userId</span>: <span class="text-codex-syntax-variable">string</span>,
  <span class="text-codex-syntax-variable">query</span>: <span class="text-codex-syntax-variable">string</span>,
  <span class="text-codex-syntax-variable">projectId</span>?: <span class="text-codex-syntax-variable">string</span>
) {
  <span class="text-codex-syntax-keyword">const</span> <span class="text-codex-syntax-variable">terms</span> <span class="text-codex-syntax-keyword">=</span> <span class="text-codex-syntax-variable">query</span>
    <span class="text-codex-syntax-keyword">.</span>toLowerCase()
    <span class="text-codex-syntax-keyword">.</span>split(<span class="text-codex-syntax-string">/\\s+/</span>)
    <span class="text-codex-syntax-keyword">.</span>filter(<span class="text-codex-syntax-variable">Boolean</span>);

  <span class="text-codex-syntax-keyword">return</span> <span class="text-codex-syntax-variable">records</span>
    <span class="text-codex-syntax-keyword">.</span>filter(<span class="text-codex-syntax-variable">m</span> =&gt;
      <span class="text-codex-syntax-variable">m</span><span class="text-codex-syntax-keyword">.</span>userId <span class="text-codex-syntax-keyword">===</span> <span class="text-codex-syntax-variable">userId</span> <span class="text-codex-syntax-keyword">&amp;&amp;</span>
      <span class="text-codex-syntax-keyword">!</span><span class="text-codex-syntax-variable">m</span><span class="text-codex-syntax-keyword">.</span>deleted
    )
    <span class="text-codex-syntax-keyword">.</span>filter(<span class="text-codex-syntax-variable">m</span> =&gt;
      <span class="text-codex-syntax-keyword">!</span><span class="text-codex-syntax-variable">m</span><span class="text-codex-syntax-keyword">.</span>projectId <span class="text-codex-syntax-keyword">||</span>
      <span class="text-codex-syntax-variable">m</span><span class="text-codex-syntax-keyword">.</span>projectId <span class="text-codex-syntax-keyword">===</span> <span class="text-codex-syntax-variable">projectId</span>
    )
    <span class="text-codex-syntax-keyword">.</span>map(<span class="text-codex-syntax-variable">m</span> =&gt; ({
      record: <span class="text-codex-syntax-variable">m</span>,
      score: <span class="text-codex-syntax-variable">terms</span><span class="text-codex-syntax-keyword">.</span>filter(<span class="text-codex-syntax-variable">t</span> =&gt;
        <span class="text-codex-syntax-variable">m</span><span class="text-codex-syntax-keyword">.</span>content<span class="text-codex-syntax-keyword">.</span>toLowerCase()<span class="text-codex-syntax-keyword">.</span>includes(<span class="text-codex-syntax-variable">t</span>)
      )<span class="text-codex-syntax-keyword">.</span>length
    }))
    <span class="text-codex-syntax-keyword">.</span>filter(<span class="text-codex-syntax-variable">x</span> =&gt; <span class="text-codex-syntax-variable">x</span><span class="text-codex-syntax-keyword">.</span>score <span class="text-codex-syntax-keyword">&gt;</span> <span class="text-codex-syntax-literal">0</span>)
    <span class="text-codex-syntax-keyword">.</span>sort((<span class="text-codex-syntax-variable">a</span>, <span class="text-codex-syntax-variable">b</span>) =&gt;
      <span class="text-codex-syntax-variable">b</span><span class="text-codex-syntax-keyword">.</span>score <span class="text-codex-syntax-keyword">-</span> <span class="text-codex-syntax-variable">a</span><span class="text-codex-syntax-keyword">.</span>score <span class="text-codex-syntax-keyword">||</span>
      <span class="text-codex-syntax-variable">b</span><span class="text-codex-syntax-keyword">.</span>record<span class="text-codex-syntax-keyword">.</span>updatedAt <span class="text-codex-syntax-keyword">-</span> <span class="text-codex-syntax-variable">a</span><span class="text-codex-syntax-keyword">.</span>record<span class="text-codex-syntax-keyword">.</span>updatedAt
    )
    <span class="text-codex-syntax-keyword">.</span>slice(<span class="text-codex-syntax-literal">0</span>, <span class="text-codex-syntax-literal">5</span>)
    <span class="text-codex-syntax-keyword">.</span>map(<span class="text-codex-syntax-variable">x</span> =&gt; <span class="text-codex-syntax-variable">x</span><span class="text-codex-syntax-keyword">.</span>record);
}</code></pre></div>
<p data-source-block="73" style="margin-top:8px;margin-bottom:4px">这是教学实现，并不具备真正的语义检索能力。</p>
<p data-source-block="74" style="margin-top:16px;margin-bottom:4px">生产环境可以使用 PostgreSQL + pgvector 等方案。</p>
<p data-source-block="75" style="margin-top:16px;margin-bottom:16px"><strong>注意：用户权限过滤应在可信数据库查询层完成，而不是先读取全部用户数据再交给模型判断。</strong></p>
<hr data-source-block="76" style="margin-top:28px;margin-bottom:28px"/>
<h2 data-source-block="77" style="margin-top:0px;margin-bottom:4px">七、长期记忆是否应该覆盖用户当前要求？</h2>
<p data-source-block="78" style="margin-top:0px;margin-bottom:4px">不应该。</p>
<p data-source-block="79" style="margin-top:16px;margin-bottom:16px">例如，长期记忆中保存：</p>
<blockquote data-source-block="80" style="margin-top:0px;margin-bottom:8px"><p>用户代码示例优先 TypeScript。</p></blockquote>
<p data-source-block="81" style="margin-top:8px;margin-bottom:4px">但用户这次明确要求：</p>
<blockquote data-source-block="82" style="margin-top:0px;margin-bottom:8px"><p>请使用 Python 实现。</p></blockquote>
<p data-source-block="83" style="margin-top:8px;margin-bottom:4px">机器人就应该优先满足当前明确要求，而不是机械地坚持 TypeScript。</p>
<p data-source-block="84" style="margin-top:16px;margin-bottom:4px">长期记忆应该作为辅助上下文，而不是不可修改的命令。</p>
<p data-source-block="85" style="margin-top:16px;margin-bottom:16px">当然，用户当前要求也不能覆盖更高优先级的安全和权限约束。</p>
<hr data-source-block="86" style="margin-top:28px;margin-bottom:28px"/>
`,D=`<h2 data-source-block="87" style="margin-top:0px;margin-bottom:4px">八、如何实现记忆更新与遗忘？</h2>
<p data-source-block="88" style="margin-top:0px;margin-bottom:4px">一个可靠的记忆系统需要支持更新、过期和删除。</p>
<div class="tablewrap" data-source-block="89" style="margin-top:16px;margin-bottom:0px"><table><thead><tr><th>场景</th><th>处理方式</th></tr></thead><tbody><tr><td>用户修改偏好</td><td>新记录生效，旧记录失效</td></tr><tr><td>临时任务完成</td><td>归档或过期</td></tr><tr><td>用户要求删除记忆</td><td>删除或失效相关记录及索引</td></tr><tr><td>记忆来源不可靠</td><td>降低可信度或不保存</td></tr></tbody></table></div>
<p data-source-block="90" style="margin-top:8px;margin-bottom:4px">不能只在 Prompt 中写一句“忘记这件事”，就认为已经删除了数据库中的信息。</p>
<hr data-source-block="91" style="margin-top:28px;margin-bottom:28px"/>
<h2 data-source-block="92" style="margin-top:0px;margin-bottom:4px">九、如何评估记忆系统？</h2>
<p data-source-block="93" style="margin-top:0px;margin-bottom:4px">生产环境建议关注以下指标：</p>
<div class="tablewrap" data-source-block="94" style="margin-top:16px;margin-bottom:0px"><table><thead><tr><th>指标</th><th>作用</th></tr></thead><tbody><tr><td>记忆召回率</td><td>是否找到真正相关的记忆</td></tr><tr><td>错误注入率</td><td>是否把不相关信息加入上下文</td></tr><tr><td>过期记忆命中率</td><td>是否使用失效信息</td></tr><tr><td>跨用户数据泄漏率</td><td>检查权限隔离</td></tr><tr><td>用户纠错成功率</td><td>修改偏好后能否正确生效</td></tr><tr><td>Token 成本</td><td>记忆注入是否过度消耗上下文</td></tr></tbody></table></div>
<p data-source-block="95" style="margin-top:8px;margin-bottom:4px">其中，跨用户数据泄漏属于高优先级安全问题。</p>
<hr data-source-block="96" style="margin-top:28px;margin-bottom:28px"/>
<h2 data-source-block="97" style="margin-top:0px;margin-bottom:4px">十、本篇总结</h2>
<p data-source-block="98" style="margin-top:0px;margin-bottom:4px">今天需要记住五个概念。</p>
<div class="tablewrap" data-source-block="99" style="margin-top:16px;margin-bottom:0px"><table><thead><tr><th>概念</th><th>核心作用</th></tr></thead><tbody><tr><td>短期记忆</td><td>保留最近对话</td></tr><tr><td>长期记忆</td><td>跨会话持久化信息</td></tr><tr><td>Embedding</td><td>支持语义检索</td></tr><tr><td>记忆注入</td><td>将相关信息加入上下文</td></tr><tr><td>遗忘机制</td><td>允许更新、过期和删除</td></tr></tbody></table></div>
<p data-source-block="100" style="margin-top:8px;margin-bottom:4px"><strong>最重要的一句话：聊天机器人的记忆不是模型自动记住一切，而是应用系统决定保存什么、检索什么，以及何时遗忘。</strong></p>
<hr data-source-block="101" style="margin-top:28px;margin-bottom:28px"/>
<h2 data-source-block="102" style="margin-top:0px;margin-bottom:4px">十一、课后测验</h2>
<p data-source-block="103" style="margin-top:0px;margin-bottom:4px">完整的 GitHub 交互页面包含 <strong>4 道选择题</strong>，支持提交评分、查看正确答案及解析、重新作答。</p>
<p data-source-block="104" style="margin-top:16px;margin-bottom:16px">你可以重点思考：聊天记录已经保存到数据库，为什么模型仍然可能不知道用户之前说过什么？</p>
<hr data-source-block="105" style="margin-top:28px;margin-bottom:28px"/>
<h2 data-source-block="106" style="margin-top:0px;margin-bottom:4px">十二、学习疑问与解答</h2>
<p data-source-block="107" style="margin-top:0px;margin-bottom:4px"><strong>Q1：模型会因为聊天次数增加而自动训练自己吗？</strong></p>
<p data-source-block="108" style="margin-top:16px;margin-bottom:4px">普通聊天推理不会直接修改模型权重。应用可以保存和检索记忆，但这不等于重新训练模型。</p>
<p data-source-block="109" style="margin-top:16px;margin-bottom:4px"><strong>Q2：是否需要保存每一句对话？</strong></p>
<p data-source-block="110" style="margin-top:16px;margin-bottom:4px">不需要。应该根据实际价值、隐私、用户意愿和保留期限决定。</p>
<p data-source-block="111" style="margin-top:16px;margin-bottom:4px"><strong>Q3：记忆是否应该永远覆盖当前指令？</strong></p>
<p data-source-block="112" style="margin-top:16px;margin-bottom:4px">不应该。相关历史偏好通常应该让位于用户当前明确要求。</p>
<p data-source-block="113" style="margin-top:16px;margin-bottom:4px"><strong>Q4：为什么长期记忆需要权限过滤？</strong></p>
<p data-source-block="114" style="margin-top:16px;margin-bottom:16px">因为记忆可能包含用户或项目数据。必须防止跨用户、跨租户和跨项目的数据泄漏。</p>
<hr data-source-block="115" style="margin-top:28px;margin-bottom:28px"/>
<h2 data-source-block="116" style="margin-top:0px;margin-bottom:4px">🚀 GitHub 发布状态</h2>
<p data-source-block="117" style="margin-top:0px;margin-bottom:4px"><strong>第 10 篇已提交到你的 GitHub 仓库。</strong></p>
<p data-source-block="118" style="margin-top:16px;margin-bottom:4px">本次采用约定的 <strong>HTML + Vue 3 组件嵌入</strong>方式，包含完整文章、上下文预算交互实验、TypeScript 示例及 4 道交互式选择题。</p>
<p data-source-block="119" style="margin-top:16px;margin-bottom:4px"><a href="https://enson0131.github.io/vitePress-blob/guide/ai/chatbot-course/10-memory-system" rel="noopener noreferrer" target="_blank">阅读第 10 篇完整交互教程</a></p>
<p data-source-block="120" style="margin-top:16px;margin-bottom:4px"><a href="https://github.com/enson0131/vitePress-blob/commit/83e118891d8156ea22c64eeef26aa9d9a96b18dd" rel="noopener noreferrer" target="_blank">查看 GitHub 最新提交</a></p>
<p data-source-block="121" style="margin-top:16px;margin-bottom:4px"><strong>当前进度：10 / 40 篇（25%）</strong></p>
<p data-source-block="122" style="margin-top:16px;margin-bottom:4px">源码和课程导航已经提交，但 GitHub Pages 的构建、部署及视觉 1:1 还原尚未验证。</p>
<p data-source-block="123" style="margin-top:16px;margin-bottom:0px"><strong>下一篇：第 11 篇《上下文压缩与 Token 优化：如何让聊天机器人记得更多、花费更少？》</strong></p>
`;const b=m=>(U("data-v-348408b7"),m=m(),$(),m),K={class:"memory-lesson-restored",lang:"zh-CN"},O=["innerHTML"],J=b(()=>t("p",{class:"source-provenance"},"原文还原基准：用户上传的 10.htm 与 10_files.zip。上面的「GitHub 发布状态」保留的是原页保存时的文字和链接，不是实时状态。以下交互为原 GitHub 功能的独立保留区，不替代正文。",-1)),F={class:"lesson10-extras"},R=b(()=>t("summary",null,"展开配套交互练习：上下文预算实验与 4 道选择题",-1)),W={class:"exercise","aria-labelledby":"lesson10-budget-title"},Y=b(()=>t("h2",{id:"lesson10-budget-title"},"交互实验：上下文预算分配",-1)),Z={class:"budget-total","aria-live":"polite"},X={class:"budget-bar"},tt={class:"budget-feedback"},at=b(()=>t("small",null,"另固定预留 1200 Tokens 系统提示与格式开销；教学示例。",-1)),st={class:"exercise","aria-labelledby":"lesson10-quiz-title"},et=b(()=>t("h2",{id:"lesson10-quiz-title"},"交互式课后测验",-1)),nt=["name","checked","onChange"],ot={key:0,class:"quiz-feedback"},pt={class:"quiz-actions"},rt=["disabled"],ct={key:0,class:"quiz-score","aria-live":"polite"},lt={class:"copy-status",role:"status","aria-live":"polite"},dt=b(()=>t("footer",null,[t("a",{href:"./09-conversation-memory"},"← 第 09 篇"),t("a",{href:"./"},"返回课程目录")],-1)),it=P({__name:"MemoryLesson",setup(m){const q=(Q+B+D).replace(/<(h[123]) data-source-block="(\d+)"/g,'<$1 id="lesson10-block-$2" data-source-block="$2"'),v=r("");async function A(i){var S;const s=i.target;if(!(s instanceof Element))return;const a=s.closest("button[data-action]"),n=a==null?void 0:a.closest(".codeblock");if(!(!a||!n)){if(a.dataset.action==="wrap"){const p=n.classList.toggle("wrap");a.setAttribute("aria-pressed",String(p)),a.setAttribute("aria-label",p?"关闭自动换行":"启用自动换行");return}if(a.dataset.action==="copy"){const p=((S=n.querySelector("pre code"))==null?void 0:S.textContent)??"";try{await navigator.clipboard.writeText(p),v.value="代码已完整复制",a.setAttribute("aria-label","已复制代码")}catch{v.value="浏览器未授权剪贴板，请选中代码手动复制。"}}}}const o=r(12e3),h=r(4e3),w=r(1200),_=r(1800),f=r(3e3),y=I(()=>h.value+w.value+_.value+f.value+1200),c=r([]),u=r(!1),T=[{q:"聊天记录保存到数据库，模型是否自动拥有长期记忆？",o:["是","否，需要应用检索并注入","只有 Python 才可以"],a:1,e:"存储不等于模型权重更新；需要应用按需检索。"},{q:"摘要压缩最大的风险是什么？",o:["一定更准确","遗漏关键事实","永久修改权重"],a:1,e:"摘要有损，应保留来源与关键结构化事实。"},{q:"KV Cache 与长期记忆的关系是？",o:["相同","前者是推理缓存，后者是应用数据","都永久存储"],a:1,e:"二者作用层次、生命周期不同。"},{q:"用户要求删除记忆时应怎么做？",o:["仅提示模型忘记","在存储和索引层执行删除或失效","只隐藏 UI"],a:1,e:"需要可信后端执行，按策略处理缓存和备份。"}],L=I(()=>T.filter((i,s)=>c.value[s]===i.a).length);function H(i,s){const a=[...c.value];a[i]=s,c.value=a,u.value=!1}function z(){c.value=[],u.value=!1}return(i,s)=>(l(),d("article",K,[t("div",{class:"lesson10-original",onClick:A,innerHTML:N(q)},null,8,O),J,t("details",F,[R,t("section",W,[Y,t("label",null,[x("总预算："+e(o.value)+" Tokens",1),g(t("input",{"onUpdate:modelValue":s[0]||(s[0]=a=>o.value=a),name:"l10-budget",type:"range",min:"4000",max:"24000",step:"1000"},null,512),[[k,o.value,void 0,{number:!0}]])]),t("label",null,[x("最近消息："+e(h.value)+" Tokens",1),g(t("input",{"onUpdate:modelValue":s[1]||(s[1]=a=>h.value=a),name:"l10-history",type:"range",min:"0",max:"12000",step:"500"},null,512),[[k,h.value,void 0,{number:!0}]])]),t("label",null,[x("历史摘要："+e(w.value)+" Tokens",1),g(t("input",{"onUpdate:modelValue":s[2]||(s[2]=a=>w.value=a),name:"l10-summary",type:"range",min:"0",max:"6000",step:"200"},null,512),[[k,w.value,void 0,{number:!0}]])]),t("label",null,[x("检索记忆："+e(_.value)+" Tokens",1),g(t("input",{"onUpdate:modelValue":s[3]||(s[3]=a=>_.value=a),name:"l10-memory",type:"range",min:"0",max:"6000",step:"200"},null,512),[[k,_.value,void 0,{number:!0}]])]),t("label",null,[x("输出预留："+e(f.value)+" Tokens",1),g(t("input",{"onUpdate:modelValue":s[4]||(s[4]=a=>f.value=a),name:"l10-output",type:"range",min:"500",max:"6000",step:"500"},null,512),[[k,f.value,void 0,{number:!0}]])]),t("div",Z,"已规划 "+e(y.value)+" / "+e(o.value)+" Tokens",1),t("div",X,[t("div",{style:G({width:Math.min(100,y.value/o.value*100)+"%",background:y.value>o.value?"#dc2626":"#16a34a"})},null,4)]),t("p",tt,e(y.value>o.value?"超出预算，请减少历史或检索内容":"剩余 "+(o.value-y.value)+" Tokens"),1),at]),t("section",st,[et,(l(),d(C,null,M(T,(a,n)=>t("fieldset",{key:n,class:"quiz-question"},[t("legend",null,e(n+1)+". "+e(a.q),1),(l(!0),d(C,null,M(a.o,(S,p)=>(l(),d("label",{key:p,class:"quiz-option"},[t("input",{type:"radio",name:"q10-"+n,checked:c.value[n]===p,onChange:mt=>H(n,p)},null,40,nt),x(e(S),1)]))),128)),u.value?(l(),d("p",ot,e(c.value[n]===a.a?"✓ 回答正确":"正确答案："+a.o[a.a])+"。"+e(a.e),1)):V("",!0)])),64)),t("div",pt,[t("button",{type:"button",disabled:T.some((a,n)=>c.value[n]===void 0),onClick:s[5]||(s[5]=a=>u.value=!0)},"提交评分",8,rt),t("button",{type:"button",onClick:z},"重新作答")]),u.value?(l(),d("div",ct,"得分 "+e(L.value)+" / "+e(T.length),1)):V("",!0)])]),t("p",lt,e(v.value),1),dt]))}});const xt=j(it,[["__scopeId","data-v-348408b7"]]),ut=JSON.parse('{"title":"10 · 聊天机器人的记忆系统","description":"","frontmatter":{"title":"10 · 聊天机器人的记忆系统","outline":"deep"},"headers":[],"relativePath":"guide/ai/chatbot-course/10-memory-system.md","filePath":"guide/ai/chatbot-course/10-memory-system.md","lastUpdated":1792488830000}'),bt={name:"guide/ai/chatbot-course/10-memory-system.md"},gt=Object.assign(bt,{setup(m){return(q,v)=>(l(),d("div",null,[E(xt)]))}});export{ut as __pageData,gt as default};
