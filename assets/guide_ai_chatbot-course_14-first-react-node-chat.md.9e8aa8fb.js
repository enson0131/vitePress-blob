import{d as R,h as g,Z as O,g as x,o as r,c as a,k as e,l as y,a as q,$ as M,a2 as j,t as o,F as I,D as w,e as P,p as V,m as B,_ as D,H as F}from"./chunks/framework.ac6a668e.js";const $=`<h1>📘 第 14 篇：终于动手，让你的网页收到第一句 AI 回复</h1>
<p><strong>React + Node.js 的第一条聊天链路｜第 14 / 40 篇｜第三阶段：工程开发｜阅读约 12–18 分钟</strong></p>
<p>前十三篇，我们聊过模型、记忆、上下文、格式和幻觉。</p>
<p>现在，先把这些概念放到旁边。打开一个网页，输入“你好”，点一下按钮，让它真的回一句话。</p>
<p><strong>今天不造一个完整的 ChatGPT。先让第一通电话接通。</strong></p>
<h2>一、这一篇，只接通三个角色</h2>
<pre><code class="language-text">React 页面：收集问题，显示回答
        ↓ POST /api/chat
Node.js 后端：检查请求，保管密钥，调用模型
        ↓ HTTPS 请求
模型服务：生成回答
        ↓
Node.js 整理结果 → React 显示
</code></pre>
<p>这次先做<strong>单轮、非流式</strong>聊天：发一个问题，等一份完整结果。流式输出、多轮记忆和数据库后面再接。</p>
<p>页面可以保留几条聊天气泡，但本次请求只发送最新问题。**界面看得见历史，不代表模型收到了历史。**这也是本篇故意保留的边界，不是记忆功能失灵。</p>
<p>我们还准备了一个“模拟助手”：不用 API Key，只回显问题。它不聪明，但能帮你先确认线路有没有接错。</p>
<h2>二、密钥放后端，不是给前端换个变量名</h2>
<p>你可能很想直接在 React 中调用模型：少写一个服务，多省事。</p>
<p>问题是，浏览器里的密钥可能被取走，用你的额度发请求。模型服务的秘密 API Key 应由后端保管，不能直接放进浏览器，也不要提交到仓库。[1]</p>
<p>尤其别写：</p>
<pre><code class="language-text">VITE_OPENAI_API_KEY=你的真实密钥
</code></pre>
<p>Vite 默认会把带 <code>VITE_</code> 前缀的环境变量暴露给客户端代码。<strong>把密钥搬到这样的环境变量里，并没有把它藏起来。</strong>[2]</p>
<p>本篇的浏览器只认识 <code>/api/chat</code>；模型名称和密钥由 Node.js 读取。</p>
<h2>三、先把工程启动起来</h2>
<p>配套工程已经准备好。下载并解压文末的工程包，进入其中的 <code>project</code> 目录，使用 <strong>Node.js 22.12 或更新版本</strong>。</p>
<p>主要文件分工如下：</p>
<pre><code class="language-text">project/
├── src/App.tsx          # React 输入框、气泡、等待和错误提示
├── server/app.ts        # POST /api/chat 路由与输入检查
├── server/model.ts      # 模拟回复或调用真实模型
├── server/provider.ts   # 识别完成、拒绝、截断等结果
├── server/http.ts       # 限制请求体大小、读取和返回 JSON
├── shared/protocol.ts   # 前后端约定及响应结构检查
├── vite.config.ts      # 开发时把 /api 转给 Node.js
└── .env.example        # 只有空白配置，没有真实密钥
</code></pre>
<p>在 <strong>终端 A</strong> 中执行：</p>
<pre><code class="language-bash">npm install
cp .env.example .env
npm run server
</code></pre>
<p>Windows PowerShell 可以把复制命令换为 <code>Copy-Item .env.example .env</code>。</p>
<p>然后在同一个目录打开 <strong>终端 B</strong>：</p>
<pre><code class="language-bash">npm run dev
</code></pre>
<p>浏览器打开 <code>http://127.0.0.1:5173</code>，输入“你好”。默认 <code>MODE=mock</code>，你应该看到：</p>
<blockquote>
<p>【模拟回复，未调用模型】收到：你好</p>
</blockquote>
<p><strong>这一步成功，说明页面、请求、后端和返回展示接通了。还不能说明真实模型已经接入。</strong></p>
<p>工程的后端直接使用 Node.js 内置 HTTP 与 Fetch，没有额外引入 Web 框架。运行脚本使用 TypeScript 类型剥离；它不是类型检查，所以仍要单独运行 <code>npm run check</code>。[3]</p>
<h2>四、先约定返回什么，前端就不用猜</h2>
<p>浏览器提交的内容只有一个字段：</p>
<pre><code class="language-json">{ &quot;question&quot;: &quot;解释一下闭包&quot; }
</code></pre>
<p>后端返回类似这样的数据。下面的 ID 是示意值：</p>
<pre><code class="language-json">{
  &quot;status&quot;: &quot;answered&quot;,
  &quot;text&quot;: &quot;【模拟回复，未调用模型】收到：解释一下闭包&quot;,
  &quot;requestId&quot;: &quot;示例请求编号&quot;,
  &quot;mode&quot;: &quot;mock&quot;
}
</code></pre>
<p>这里沿用第 12 篇的思路，但换成适合本次纯文本聊天的小契约：<code>answered</code> 表示可以显示回答；<code>refused</code>、<code>incomplete</code>、<code>failed</code> 分别表示拒绝、不完整和失败。<code>text</code> 承载对应文字，<code>requestId</code> 由后端生成，<code>mode</code> 区分模拟和真实调用。</p>
<p>我们暂时没接知识库，所以不加入 <code>sourceIds</code>，也不假装有“证据充分”的判断。<strong><code>answered</code> 是本次链路的状态，不是事实认证。</strong></p>
<p>工程中的路由还会检查 JSON、问题类型、空白输入和长度。2000 字符是本篇的输入限制，不是 Token 计数；完整上下文预算仍要使用第 11 篇的方法。</p>
<h2>五、后端最核心的工作：拿到问题，返回结果</h2>
<p>打开 <code>server/model.ts</code>。这个文件完整如下：</p>
<pre><code class="language-typescript">import { setTimeout as delay } from &quot;node:timers/promises&quot;;
import { normalizeResponse } from &quot;./provider.ts&quot;;
import type { Result } from &quot;../shared/protocol.ts&quot;;

export async function answer(
  question: string,
  mode: &quot;mock&quot; | &quot;live&quot;,
  signal: AbortSignal
): Promise&lt;Result&gt; {
  if (mode === &quot;mock&quot;) {
    await delay(500, undefined, { signal });
    return { status: &quot;answered&quot;, text: \`【模拟回复，未调用模型】收到：\${question}\` };
  }
  const key = ({}).OPENAI_API_KEY;
  const model = ({}).OPENAI_MODEL;
  if (!key || !model) throw new Error(&quot;MISSING_MODEL_CONFIG&quot;);

  const response = await fetch(&quot;https://api.openai.com/v1/responses&quot;, {
    method: &quot;POST&quot;,
    signal,
    headers: {
      &quot;Content-Type&quot;: &quot;application/json&quot;,
      Authorization: \`Bearer \${key}\`
    },
    body: JSON.stringify({
      model,
      store: false,
      max_output_tokens: 1200,
      instructions: &quot;你是中文技术学习助手。解释清楚，不编造接口；不确定就说明。&quot;,
      input: [{ role: &quot;user&quot;, content: question }]
    })
  });
  if (!response.ok) throw new Error(\`UPSTREAM_HTTP_\${response.status}\`);
  return normalizeResponse(await response.json());
}
</code></pre>
<p>上半段是模拟模式，故意等半秒再回显。下半段才调用真实模型。</p>
<p><code>instructions</code> 由后端设置，浏览器不能提交一个 <code>role: &quot;system&quot;</code> 就改变应用的消息结构。这里调用的是 Responses API；<code>input</code> 装当前问题，返回后还需要检查生成状态和输出内容。[4]</p>
<p>工程里的 <code>normalizeResponse</code> 做四件事：识别拒绝，拦住不完整结果，确认生成已完成，再提取文本。它不会执行回答中的代码，也不会判断回答事实正确。</p>
<p>**这里没有注册工具，没有读取你的公司文档，也没有自动联网搜索。**接通模型，不代表它突然拥有你的业务资料。</p>
<h2>六、React 不用变复杂：发送时锁住，结束后解锁</h2>
<p><code>src/App.tsx</code> 的完整代码如下。重点看三件事：提交问题、检查结果、更新界面。</p>
<pre><code class="language-tsx">import { useEffect, useRef, useState } from &quot;react&quot;;
import type { FormEvent } from &quot;react&quot;;
import { isReply } from &quot;../shared/protocol&quot;;

type Message = { role: &quot;user&quot; | &quot;assistant&quot;; text: string };

export default function App() {
  const [question, setQuestion] = useState(&quot;&quot;);
  const [messages, setMessages] = useState&lt;Message[]&gt;([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(&quot;&quot;);
  const controller = useRef&lt;AbortController | null&gt;(null);
  useEffect(() =&gt; () =&gt; controller.current?.abort(), []);

  async function send(event: FormEvent&lt;HTMLFormElement&gt;) {
    event.preventDefault();
    const text = question.trim();
    if (!text || controller.current) return;
    const current = new AbortController();
    controller.current = current;
    const timer = window.setTimeout(() =&gt; current.abort(), 35_000);
    setBusy(true);
    setError(&quot;&quot;);
    setMessages(old =&gt; [...old, { role: &quot;user&quot;, text }]);
    try {
      const response = await fetch(&quot;/api/chat&quot;, {
        method: &quot;POST&quot;,
        headers: { &quot;Content-Type&quot;: &quot;application/json&quot; },
        body: JSON.stringify({ question: text }),
        signal: current.signal
      });
      const data: unknown = await response.json();
      if (!isReply(data)) throw new Error(&quot;后端响应格式不符合约定。&quot;);
      if (!response.ok || data.status !== &quot;answered&quot;) {
        throw new Error(\`\${data.text}（编号：\${data.requestId}）\`);
      }
      setMessages(old =&gt; [...old, { role: &quot;assistant&quot;, text: data.text }]);
      setQuestion(&quot;&quot;);
    } catch (cause) {
      setError(current.signal.aborted ? &quot;请求已取消或等待超时。&quot; :
        cause instanceof Error ? cause.message : &quot;网络请求失败。&quot;);
    } finally {
      window.clearTimeout(timer);
      if (controller.current === current) {
        controller.current = null;
        setBusy(false);
      }
    }
  }

  return &lt;main&gt;
    &lt;h1&gt;我的第一只聊天机器人&lt;/h1&gt;
    &lt;p&gt;单轮实验：界面保留气泡，本次只发送最新问题。&lt;/p&gt;
    &lt;section aria-live=&quot;polite&quot;&gt;
      {messages.map((m, i) =&gt; &lt;article key={i} className={m.role}&gt;
        &lt;strong&gt;{m.role === &quot;user&quot; ? &quot;我&quot; : &quot;助手&quot;}&lt;/strong&gt;
        &lt;p style={{ whiteSpace: &quot;pre-wrap&quot; }}&gt;{m.text}&lt;/p&gt;
      &lt;/article&gt;)}
    &lt;/section&gt;
    {error &amp;&amp; &lt;p role=&quot;alert&quot;&gt;{error}&lt;/p&gt;}
    &lt;form onSubmit={send}&gt;
      &lt;label htmlFor=&quot;question&quot;&gt;输入问题&lt;/label&gt;
      &lt;textarea id=&quot;question&quot; value={question} maxLength={2000} disabled={busy}
        onChange={e =&gt; setQuestion(e.target.value)} /&gt;
      &lt;button disabled={busy || !question.trim()}&gt;{busy ? &quot;正在回答…&quot; : &quot;发送&quot;}&lt;/button&gt;
    &lt;/form&gt;
  &lt;/main&gt;;
}
</code></pre>
<p><code>setMessages(old =&gt; [...old, ...])</code> 使用之前的状态追加气泡；<code>onSubmit</code> 处理表单提交。这些都是普通 React 状态和事件处理，不需要另学一套“AI 前端语法”。[5]</p>
<p>有几个小细节很值得保留：发送中禁用按钮；用 <code>controller.current</code> 防止同时发出重复请求；失败时保留输入，方便修改；把结果当普通文本显示，而不是塞进 <code>dangerouslySetInnerHTML</code>。</p>
<p>还有一个经典坑：**<code>fetch()</code> 不会因为 HTTP 400 或 500 自动进入 catch。**因此代码同时检查 <code>response.ok</code> 和业务 <code>status</code>，再决定是否追加助手气泡。<code>isReply</code> 是工程包里的运行时检查，不是一个单纯的 TypeScript 类型断言。[6]</p>
<p>35 秒的前端等待上限和 25 秒的上游请求上限，是本篇的教学设置，不是服务商承诺的响应时间。遇到取消或超时，我们显示错误，不伪造一条成功回答。</p>
<h2>七、为什么前端访问 /api/chat，不写 3001？</h2>
<p>因为 Vite 开发服务器帮我们转发。完整的 <code>vite.config.ts</code> 如下：</p>
<pre><code class="language-typescript">import { defineConfig } from &quot;vite&quot;;
import react from &quot;@vitejs/plugin-react&quot;;

export default defineConfig({
  plugins: [react()],
  server: {
    host: &quot;127.0.0.1&quot;, port: 5173, strictPort: true,
    proxy: { &quot;/api&quot;: &quot;http://127.0.0.1:3001&quot; }
  }
});
</code></pre>
<p>浏览器请求 5173 端口的 <code>/api/chat</code>，Vite 再把它转给 3001 端口的 Node.js。<code>strictPort</code> 让端口被占用时直接报错，避免悄悄换端口后你还在访问旧地址。[7]</p>
<p>**这只是开发代理，不是生产部署方案。**上线时要由实际网关或托管平台安排同源路由，或正确配置跨域访问。不要为了“先跑起来”，就把允许来源无限放宽。[7]</p>
<p>本篇两个服务都绑定本机地址。这个学习项目没有账号鉴权和用户级配额，不应直接开放成公共的付费模型入口。</p>
<h2>八、把模拟助手换成真实模型</h2>
<p>模拟模式跑通后，编辑后端使用的 <code>.env</code>：</p>
<pre><code class="language-dotenv">MODE=live
OPENAI_API_KEY=填写你自己的密钥
OPENAI_MODEL=填写账号可用且支持Responses接口的模型ID
</code></pre>
<p>上面是占位说明，不能原样当成有效配置。不要加 <code>VITE_</code> 前缀，不要把真实文件提交 Git。</p>
<p>停止并重新运行 <code>npm run server</code>，再发同一个问题。此时才会调用外部模型，可能产生费用；本篇不指定固定价格或保证某个模型在你的账号可用。[1][4]</p>
<p>如果模拟模式成功、真实模式失败，优先看后端日志：模型 ID、密钥、账户权限、网络和输出状态。错误界面会给出请求编号；不要把完整密钥或敏感请求贴进日志。</p>
<p>反过来，如果模拟模式都失败，就先查 3001 服务和 Vite 代理。别在输入框和后端还没连上时，反复修改 Prompt。</p>
<h2>九、三个小实验，比“看起来能用”更有说服力</h2>
<p>**实验一：正常通路。**保持模拟模式，发送“你好”。应该先显示等待，再出现明确标注的模拟回复；浏览器不应收到任何 API Key。</p>
<p>**实验二：断开后端。**停止终端 A，再发送一次。界面应显示错误并恢复可操作状态，而不是永久“正在回答”。实际文案可能由代理错误和响应解析方式决定，不要求固定为某一句话。</p>
<p>**实验三：记忆错觉。**真实模式下先说“我叫小陈”，再问“我叫什么”。观察 Network：本篇第二次请求仍只包含当前问题，不能据此期待模型知道第一句。即使它碰巧猜对，也不能证明实现了记忆。</p>
<p>文末交互网页还有一个<strong>本地流程演示</strong>，可以切换成功、拒绝、截断和失败。它不会发请求或调用模型；真正的前后端连通实验，请使用工程包。</p>
<h2>十、四道小题，检查你有没有接对线</h2>
<h3>1. 模型服务的秘密 API Key 放哪里？</h3>
<p>A. <code>VITE_OPENAI_API_KEY</code>，方便 React 读取。<br />
B. 可信后端的环境配置中。<br />
C. 给前端代码做一次压缩再放进去。</p>
<h3>2. 模拟模式成功，证明什么？</h3>
<p>A. 真实模型已经完成鉴权。<br />
B. 机器人具有长期记忆。<br />
C. 本篇的页面与后端请求链路跑通了。</p>
<h3>3. fetch 收到 HTTP 500，会自动抛异常吗？</h3>
<p>A. 不会仅因 500 自动抛出，需要检查响应状态。<br />
B. 会，所以不需要 <code>response.ok</code>。<br />
C. 不会返回任何 Response。</p>
<h3>4. 页面显示了历史气泡，模型就拥有多轮上下文吗？</h3>
<p>A. 是，React 状态会自动同步给模型。<br />
B. 不一定，要看本次请求或会话机制实际提供了什么。<br />
C. 只要刷新页面就有。</p>
<p>**答案：1B、2C、3A、4B。**密钥属于后端；模拟只验证线路；HTTP 状态要主动检查；界面状态和模型上下文不是一回事。</p>
<p>**课后练习：**给每个失败提示加一个“再次发送”按钮，但仍然只允许一个请求进行中。不要默认循环重试，因为真实模型请求可能计费。</p>
<h2>十一、两个你很可能会问的问题</h2>
<p><strong>为什么这一篇还不是边生成边显示？</strong></p>
<p>我们刻意先完成普通 JSON 请求：一次发送，一次返回。下一篇再把返回方式改成流式，并处理“收到一部分”与“真正完成”的区别。</p>
<p><strong>模型回答错了，是不是前端没写好？</strong></p>
<p>不一定。先区分线路错误和内容错误：线路通了，只说明请求到了、结果回来了。模型有没有足够证据，仍然是第 13 篇讨论的问题。</p>
<hr />
<h2>本篇只带走这一句话</h2>
<blockquote>
<p><strong>前端负责交流，后端守住入口，模型负责生成；先把一句话送到，再谈让它记住一百句话。</strong></p>
</blockquote>
<p>第 14 篇结束。进度：<strong>14 / 40 篇，35%</strong>。下一篇：让回答边生成、边显示——流式输出与 SSE。</p>
<h2>资料依据</h2>
<p>工程分层、限制数值、模拟回复和练习为本篇教学设计。以下官方文档用于核对接口及框架行为，核对日期为 2026-10-23。</p>
<p>[1] OpenAI：Best Practices for API Key Safety — https://help.openai.com/en/articles/5112595-best-practices-for-api</p>
<p>[2] Vite：Env Variables and Modes — https://vite.dev/guide/env-and-mode</p>
<p>[3] Node.js：Modules: TypeScript — https://nodejs.org/api/typescript.html</p>
<p>[4] OpenAI：Create a model response — https://developers.openai.com/api/reference/resources/responses/methods/create</p>
<p>[5] React：useState 与 form — https://react.dev/reference/react/useState 、https://react.dev/reference/react-dom/components/form</p>
<p>[6] MDN：Using the Fetch API — https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch</p>
<p>[7] Vite：Server Options — https://vite.dev/config/server-options</p>
`,f=[{q:"模型服务的秘密 API Key 放哪里？",options:["VITE_OPENAI_API_KEY，方便 React 读取。","可信后端的环境配置中。","给前端代码做一次压缩再放进去。"],a:1,why:"密钥应由可信后端保管，VITE_ 前缀会默认暴露给前端代码。"},{q:"模拟模式成功，证明什么？",options:["真实模型已经完成鉴权。","机器人具有长期记忆。","本篇的页面与后端请求链路跑通了。"],a:2,why:"模拟模式没有访问模型服务，不能证明真实模型可用。"},{q:"fetch 收到 HTTP 500，会自动抛异常吗？",options:["不会仅因 500 自动抛出，需要检查响应状态。","会，所以不需要 response.ok。","不会返回任何 Response。"],a:0,why:"网络错误与 HTTP 错误不同，要主动检查 response.ok 或 status。"},{q:"页面显示了历史气泡，模型就拥有多轮上下文吗？",options:["是，React 状态会自动同步给模型。","不一定，要看本次请求或会话机制实际提供了什么。","只要刷新页面就有。"],a:1,why:"界面状态不会自动成为模型输入；本篇只发送最新问题。"}],c=i=>(V("data-v-f7143c2a"),i=i(),B(),i),H={class:"lesson14"},L=["innerHTML"],K={class:"extras"},z=c(()=>e("h2",null,"配套实验：一轮请求怎么结束？",-1)),U=c(()=>e("p",null,"本地流程演示，无网络请求，不是实际 React + Node.js 工程。",-1)),J=c(()=>e("svg",{class:"flow",viewBox:"0 0 660 96",role:"img","aria-label":"页面、后端和模型的请求流程"},[e("g",{fill:"none",stroke:"currentColor"},[e("rect",{x:"5",y:"14",width:"170",height:"52",rx:"10"}),e("rect",{x:"245",y:"14",width:"170",height:"52",rx:"10"}),e("rect",{x:"485",y:"14",width:"170",height:"52",rx:"10"}),e("path",{d:"M180 40h55m-8 -6 8 6-8 6M420 40h55m-8 -6 8 6-8 6"})]),e("g",{fill:"currentColor","text-anchor":"middle","font-size":"16"},[e("text",{x:"90",y:"46"},"React 页面"),e("text",{x:"330",y:"46"},"Node.js 后端"),e("text",{x:"570",y:"46"},"模型服务")]),e("text",{fill:"currentColor",x:"330",y:"90","text-anchor":"middle","font-size":"12"},"模拟模式在后端返回，不访问模型服务")],-1)),Y=["disabled"],G=c(()=>e("option",{value:"answered"},"正常完成",-1)),W=c(()=>e("option",{value:"refused"},"被拒绝",-1)),Q=c(()=>e("option",{value:"incomplete"},"生成不完整",-1)),Z=c(()=>e("option",{value:"failed"},"请求失败",-1)),X=[G,W,Q,Z],ee={class:"actions"},te=["disabled"],oe={class:"result",role:"status"},ne=c(()=>e("h2",null,"四道课后选择题",-1)),se=["name","checked","onChange"],re={key:0,class:"feedback"},ae={class:"actions"},ce=["disabled"],pe={key:0,role:"status"},ue=R({__name:"FirstChatLesson",setup(i){const b=$.split(/(<pre[\s\S]*?<\/pre>)/g).map(n=>n.startsWith("<pre")?n:n.replace(/\*\*([\s\S]+?)\*\*/g,"<strong>$1</strong>")).join(""),p=g("answered"),u=g("idle"),m=g("尚未发送。");let v;const T={answered:"本地演示：回答已完成，可以显示文字。事实仍需要核验。",refused:"本地演示：收到拒绝，保留拒绝说明。",incomplete:"本地演示：生成未完成，不冒充成功答案。",failed:"本地演示：请求失败，恢复按钮并显示错误。"};function S(){u.value="pending",m.value="正在等待后端（模拟）…",v=setTimeout(()=>{u.value=p.value,m.value=T[p.value]},650)}function k(){clearTimeout(v),p.value="answered",u.value="idle",m.value="尚未发送。"}O(()=>clearTimeout(v));const l=g({}),h=g(!1),A=x(()=>f.every((n,t)=>l.value[t]!==void 0)),E=x(()=>f.filter((n,t)=>n.a===l.value[t]).length);function N(n,t){l.value[n]=t,h.value=!1}return(n,t)=>(r(),a("article",H,[e("div",{class:"original",innerHTML:y(b)},null,8,L),e("section",K,[z,U,J,e("label",null,[q("模拟结果"),M(e("select",{"onUpdate:modelValue":t[0]||(t[0]=s=>p.value=s),disabled:u.value==="pending"},X,8,Y),[[j,p.value]])]),e("div",ee,[e("button",{type:"button",disabled:u.value==="pending",onClick:S},"运行演示",8,te),e("button",{type:"button",onClick:k},"重置演示")]),e("div",oe,[e("strong",null,o(u.value),1),e("p",null,o(m.value),1)]),ne,(r(!0),a(I,null,w(y(f),(s,d)=>(r(),a("fieldset",{key:d},[e("legend",null,o(d+1)+". "+o(s.q),1),(r(!0),a(I,null,w(s.options,(C,_)=>(r(),a("label",{key:_},[e("input",{type:"radio",name:"l14q"+d,checked:l.value[d]===_,onChange:qe=>N(d,_)},null,40,se),q(o(String.fromCharCode(65+_))+". "+o(C),1)]))),128)),h.value?(r(),a("p",re,o(l.value[d]===s.a?"✓ 回答正确。":"回答错误。")+"正确答案："+o(String.fromCharCode(65+s.a))+"。"+o(s.why),1)):P("",!0)]))),128)),e("div",ae,[e("button",{type:"button",disabled:!A.value,onClick:t[1]||(t[1]=s=>h.value=!0)},"提交评分",8,ce),e("button",{type:"button",onClick:t[2]||(t[2]=s=>{l.value={},h.value=!1})},"重新作答")]),h.value?(r(),a("p",pe,"得分："+o(E.value)+" / "+o(y(f).length),1)):P("",!0)])]))}});const le=D(ue,[["__scopeId","data-v-f7143c2a"]]),de=e("h2",{id:"工程源码",tabindex:"-1"},[q("工程源码 "),e("a",{class:"header-anchor",href:"#工程源码","aria-label":'Permalink to "工程源码"'},"​")],-1),ie=e("p",null,[q("完整配套工程位于仓库的 "),e("code",null,"examples/lesson14-first-chat"),q("，不是只展示的代码片段。默认模拟模式不调用付费模型。")],-1),he=e("p",null,[e("a",{href:"https://github.com/enson0131/vitePress-blob/tree/master/examples/lesson14-first-chat",target:"_blank",rel:"noreferrer"},"打开完整工程")],-1),_e=JSON.parse('{"title":"14 · React + Node.js 第一条聊天链路","description":"","frontmatter":{"title":"14 · React + Node.js 第一条聊天链路","readingTime":"12–18","outline":false,"prev":{"text":"13 · 幻觉、证据与答案核验","link":"./13-hallucinations-and-evidence"}},"headers":[],"relativePath":"guide/ai/chatbot-course/14-first-react-node-chat.md","filePath":"guide/ai/chatbot-course/14-first-react-node-chat.md","lastUpdated":1793118415000}'),ge={name:"guide/ai/chatbot-course/14-first-react-node-chat.md"},fe=Object.assign(ge,{setup(i){return(b,p)=>(r(),a("div",null,[F(le),de,ie,he]))}});export{_e as __pageData,fe as default};
