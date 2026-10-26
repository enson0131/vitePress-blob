import{d as $,h as c,o as l,c as u,k as e,t,a as N,F as I,D as F,e as B,p as J,m as M,_ as j,g as P,Z as Q,l as U,H,$ as K,a2 as X,Q as Y}from"./chunks/framework.ac6a668e.js";const Z=`<h1>📘 第 15 篇：别让用户盯着转圈——让回答边生成、边显示</h1>
<p><strong>流式输出与 SSE｜第 15 / 40 篇｜第三阶段：工程开发｜阅读约 12–18 分钟</strong></p>
<p>上一节，你的网页已经能收到 AI 回复了。</p>
<p>但用户问一个稍长的问题，屏幕就一直显示“正在回答……”——过了几秒，他开始怀疑：是 AI 在思考，还是我家网断了？</p>
<p>今天，我们把“整桌菜做好再上”，改成“做好一道，先上一道”。</p>
<p><strong>不是等答案全部回来，再用定时器假装打字；而是后端收到新内容，就陆续传给页面。</strong> 模型接口的流式模式允许这样增量接收输出，不必等整份回答生成结束。[1]</p>
<h2>一、先把两个“完成”分清楚</h2>
<p>流式聊天里最容易出错的，不是文字显示得慢，而是<strong>把没说完的话，当成已经说完</strong>。</p>
<p>本篇给页面定两条规矩：收到文字，先显示为草稿；收到明确的完成结果，再标记完成。</p>
<pre><code class="language-text">收到 delta：追加一点文字，仍是草稿
收到 end：检查最终状态，再决定是否完成
收到 error：显示错误，不伪装成功
连接结束，却没有 end：保留草稿，提示异常结束
</code></pre>
<p><code>delta</code>、<code>end</code>、<code>error</code> 是<strong>本篇自己设计的事件名字</strong>。尤其是 <code>end</code>，不是 SSE 自动附赠的“成功证明”。</p>
<p>今天仍然只做单轮聊天，不接数据库、历史记忆或工具。先让这条线路能正确开始，也能正确结束。</p>
<h2>二、SSE 长什么样？像一张张连续送来的小纸条</h2>
<p>SSE（Server-Sent Events）用文本格式传递事件。响应类型是 <code>text/event-stream</code>，内容使用 UTF-8；<code>event:</code> 表示事件名，<code>data:</code> 表示数据，空行分隔事件。[2]</p>
<p>例如，本篇后端会发送这样的内容：</p>
<pre><code class="language-text">event: delta
data: {&quot;text&quot;:&quot;你好，&quot;}

event: delta
data: {&quot;text&quot;:&quot;我是你的学习助手。&quot;}

event: end
data: {&quot;status&quot;:&quot;answered&quot;,&quot;text&quot;:&quot;你好，我是你的学习助手。&quot;}

</code></pre>
<p>前两张纸条只负责追加文字。最后一张说明本次结果，并带回最终正文。</p>
<p>为什么最后还带一份完整文字？这是本篇的选择：<strong>用最终正文替换草稿，避免两份结果不一致；不是把完整答案再追加一遍。</strong></p>
<p><code>end</code> 也可能带 <code>refused</code> 或 <code>incomplete</code>。所以，收到结束事件，只说明“拿到最终状态”，不一定是“拿到完整答案”。</p>
<h3>2.1 为什么这里不直接用 EventSource？</h3>
<p>浏览器原生 <code>EventSource</code> 很适合按 URL 订阅事件，但构造接口没有任意 POST 请求体和自定义请求头配置。本篇需要 POST 一个问题，因此采用 <strong>Fetch 发请求，再读取 SSE 响应体</strong>。SSE 数据格式与 <code>EventSource</code> 这个浏览器类，不是一回事。[3]</p>
<p>本篇没有实现自动重连。连接断了就明确告诉用户，不会偷偷重新发起一次可能计费的模型请求。</p>
<h2>三、最大的坑：一块网络数据，不等于一条消息</h2>
<p>后端写了两条事件，不代表浏览器正好读两次。</p>
<p>一次读取可能拿到两条半；也可能只拿到半条。更麻烦的是，一个中文字符的 UTF-8 字节，也可能跨在两次读取之间。[4][5]</p>
<p>所以，不要把每次拿到的数据都直接 <code>JSON.parse</code>，也不要以为每个网络分块就是一个 Token。</p>
<p>正确的接收顺序是：</p>
<pre><code class="language-text">收到字节块
   ↓
TextDecoder 连续解码，处理跨块字符
   ↓
暂存未完整的文本行和事件
   ↓
读到事件分隔空行，才取出完整 data
   ↓
解析 JSON、校验字段、更新界面
</code></pre>
<p><strong>解码解决“字有没有收完整”；分帧解决“事件有没有收完整”。两步不能少。</strong></p>
<p>配套工程的 <code>shared/sse.ts</code> 实现了这层解析：支持常见换行形式、注释行和多行 <code>data</code>，并限制单个事件大小。没有等到分隔空行的尾部事件，不会因为连接关闭就被当成完整消息。这个做法也符合 SSE 的事件分派规则。[5]</p>
<p>它是本课使用的事件解析器，不是包含自动重连、<code>id</code> 和 <code>retry</code> 全套行为的 <code>EventSource</code> 替代品。</p>
<h2>四、后端：不再只调用一次 res.end</h2>
<p>上一节，后端等到完整结果再返回 JSON。这一节，它先发送 SSE 响应头，然后用 <code>res.write()</code> 持续写事件，最后再结束响应。</p>
<p>下面是工程中的完整 <code>server/sse.ts</code>：</p>
<pre><code class="language-typescript">import { once } from &quot;node:events&quot;;
import type { ServerResponse } from &quot;node:http&quot;;
import type { Frame } from &quot;../shared/events.ts&quot;;

export async function sendSSE(
  res: ServerResponse,
  frame: Frame,
  signal: AbortSignal
) {
  signal.throwIfAborted();
  if (res.destroyed || res.writableEnded) throw new Error(&quot;CLIENT_CLOSED&quot;);
  const block = \`event: \${frame.event}\\ndata: \${JSON.stringify(frame.data)}\\n\\n\`;
  if (!res.write(block)) {
    await once(res, &quot;drain&quot;, { signal });
  }
}
</code></pre>
<p><code>JSON.stringify</code> 会把正文里的换行编码进 JSON 字符串，不会因为模型回答换了一段，就误变成 SSE 的事件分隔符。</p>
<p><code>res.write()</code> 返回 <code>false</code> 时，表示需要等写入缓冲恢复，再继续发送。这里等待 <code>drain</code>，而不是无限往内存里塞数据。这叫<strong>背压</strong>：下游吃不下了，上游先慢一点。[6]</p>
<p>路由文件还负责检查输入、发送响应头、设置超时和处理断连。你不用把这些都塞进一个巨大的 <code>for</code> 循环；工程包里已经分成独立文件。</p>
<p><strong>还有一个重要区别：响应头发出后，不能再把这次 HTTP 200 改成 500。</strong> 因此，开流之前的参数错误走普通 HTTP 错误；开流之后的错误，通过本篇的 <code>error</code> 事件告知客户端。[6]</p>
<h2>五、模型侧只加 stream: true？还差一步</h2>
<p>开启模型接口的 <code>stream: true</code>，只是让它开始流式返回。后端仍要把服务商事件，转换成我们前端认识的事件。</p>
<p>配套工程使用 OpenAI Responses 的文本流，并作如下映射：[1][7]</p>
<table>
<thead>
<tr>
<th>模型侧信号</th>
<th>本篇后端怎么处理</th>
</tr>
</thead>
<tbody>
<tr>
<td><code>response.output_text.delta</code></td>
<td>转成 <code>delta</code>，传递新增文字</td>
</tr>
<tr>
<td><code>response.completed</code></td>
<td>检查最终响应，再发 <code>end</code></td>
</tr>
<tr>
<td><code>response.incomplete</code></td>
<td>发 <code>end</code>，状态为 <code>incomplete</code></td>
</tr>
<tr>
<td>失败事件或上游异常</td>
<td>转为受控的 <code>error</code> 提示</td>
</tr>
</tbody>
</table>
<p>拒绝内容也会从最终响应中识别，不会硬塞成普通成功答案。</p>
<p>特别留意 <code>response.output_text.done</code>：它描述的是某个文本部分结束，<strong>不能一看到名字里有 done，就宣布整个请求成功</strong>。我们的适配器等待整份响应的结束状态。[7]</p>
<p>本篇只处理普通文本回答，没有注册工具，也不把其他类型事件冒充文字。以后接工具调用，需要扩展协议，不能把每个事件都直接拼进聊天气泡。</p>
<h2>六、前端：追加草稿，等到 end 再收工</h2>
<p>下面是完整的 <code>src/readChat.ts</code>。它调用工程包里的 SSE 解析器和事件校验器，不需要 React 知道字节怎么拆分。</p>
<pre><code class="language-typescript">import { readSSE } from &quot;../shared/sse.ts&quot;;
import { parseFrame } from &quot;../shared/events.ts&quot;;
import type { End } from &quot;../shared/events.ts&quot;;

export async function readChat(
  response: Response,
  onDelta: (text: string) =&gt; void,
  signal: AbortSignal
): Promise&lt;End&gt; {
  if (!response.ok) throw new Error(\`HTTP \${response.status}\`);
  if (!response.body || !response.headers.get(&quot;content-type&quot;)?.includes(&quot;text/event-stream&quot;)) {
    throw new Error(&quot;后端没有返回事件流。&quot;);
  }
  let length = 0;
  for await (const item of readSSE(response.body, signal)) {
    const frame = parseFrame(item.event, item.data);
    if (frame.event === &quot;delta&quot;) {
      length += frame.data.text.length;
      if (length &gt; 200_000) throw new Error(&quot;回答过长，已停止接收。&quot;);
      onDelta(frame.data.text);
    } else if (frame.event === &quot;error&quot;) {
      throw new Error(frame.data.message);
    } else {
      return frame.data;
    }
  }
  throw new Error(&quot;连接已结束，但未收到结束事件；现有文字只是草稿。&quot;);
}
</code></pre>
<p>最值得记住的是最后一行错误提示：<strong>连接结束，不代表回答完成。</strong></p>
<p>在 React 中，只需把增量交给状态更新。下面是 <code>App.tsx</code> 的核心片段，不是完整组件；完整的输入框、按钮、状态和异常处理都在工程包中：</p>
<pre><code class="language-tsx">const end = await readChat(response, delta =&gt; {
  if (active.current !== controller || controller.signal.aborted) return;
  setText(prev =&gt; prev + delta); setState(&quot;streaming&quot;);
}, controller.signal);
controller.signal.throwIfAborted();
if (end.status === &quot;answered&quot;) setText(end.text);
</code></pre>
<p>这里使用函数式更新来追加文字，并检查回调是否还属于当前请求。最终完成时则替换全文，不再重复追加。</p>
<p>我们保留 <code>waiting</code>、<code>streaming</code>、<code>answered</code>、<code>refused</code>、<code>incomplete</code>、<code>stopped</code>、<code>failed</code> 等界面状态。用户不仅看到字，还能知道这些字是“正在生成”“已完成”还是“半路中断”。</p>
<p><strong>草稿可以显示，不等于已经通过事实、安全或业务验收。</strong> 流式内容在完整输出前就暴露给用户，也会增加内容审核难度；真实产品需要按风险决定哪些内容允许提前展示。[1]</p>
<h2>七、停止按钮：不是只让光标停下来</h2>
<p>假设你点了“停止”，页面不更新了，但后端还在读模型结果。这更像把扬声器关了，而不是挂电话。</p>
<p>本篇的停止路径是：</p>
<pre><code class="language-text">点击停止生成
    ↓
浏览器 AbortController.abort(&quot;user&quot;)
    ↓
中断 Fetch 和响应体读取
    ↓
Node.js 发现下游连接关闭
    ↓
中止上游模型请求，并清理计时器
</code></pre>
<p><code>AbortController</code> 可以中断 Fetch、响应体消费和流读取；后端需要把自己的取消信号继续传给上游请求，而不只是修改一个 React 状态。[8]</p>
<p>我们的组件卸载时也会取消，且保留同一请求的标识，避免已经结束的回调继续写入当前界面。</p>
<p>本课不会把“用户主动停止”显示成“回答完成”。已经收到的文字保留下来，但标为未完成草稿。也<strong>不承诺</strong>取消能撤销服务商已经完成的计算或费用。</p>
<h2>八、先跑模拟流，再连真实模型</h2>
<p>下载文末工程包，进入新的 <code>project</code> 目录；这是独立的第 15 篇项目，不必手动拼接上一节的文件。使用 Node.js 22.12 或更新版本。</p>
<p>在终端 A 中运行：</p>
<pre><code class="language-bash">npm install
cp .env.example .env
npm run server
</code></pre>
<p>在终端 B、同一个目录运行：</p>
<pre><code class="language-bash">npm run dev
</code></pre>
<p>Windows PowerShell 的复制命令是 <code>Copy-Item .env.example .env</code>。浏览器打开 <code>http://127.0.0.1:5173</code>；先关闭上一节占用相同端口的服务。</p>
<p>默认 <code>MODE=mock</code>。输入“你好”，你会看到带有“模拟流，未调用模型”标记的文字分段出现。<strong>这是本地定时发送的测试数据，用来验证网络与界面，不是模型生成效果。</strong></p>
<p>页面下拉框还可以切换“生成上限”“拒绝”“流中错误”“无结束事件就断线”。最后一种故意不发送 <code>end</code>，用来检查页面有没有把断线误判成完成。</p>
<p>真实模式仍然只在后端 <code>.env</code> 配置 <code>MODE=live</code>、<code>OPENAI_API_KEY</code> 和 <code>OPENAI_MODEL</code>，然后重启后端；前端场景选择保持默认。真实调用可能计费。本篇不改变上一节的密钥边界，也不开放公共入口。</p>
<h2>九、文字为什么仍然攒到最后一起出现？</h2>
<p>别马上怪 React。先沿着这条链路看：模型有没有逐步返回，Node.js 有没有逐步写出，代理有没有缓存，浏览器有没有逐步读取。</p>
<p>例如 Nginx 的代理缓冲可能把上游内容暂存起来；它可以通过配置关闭，也可能响应 <code>X-Accel-Buffering: no</code>，但是否生效取决于实际代理配置。<strong>一个响应头，不会自动关闭整条链路上的所有缓冲。</strong>[9]</p>
<p><code>res.flushHeaders()</code> 只负责提前发送响应头，也不能让还没生成的字提前出现，更不能保证每次 <code>write()</code> 都对应浏览器的一次读取。[6]</p>
<p>先做三个小实验：正常结束后应是 <code>answered</code>；中途点击停止应是 <code>stopped</code>；没有结束事件就断线应保留草稿并提示失败。再去比“每秒显示几个字”，才有意义。</p>
<p>工程里前端 35 秒、上游 25 秒的超时都是教学设置，不是性能承诺。它没有自动重连、断点续传、持久化或用户级限流，不能直接作为面向公网的付费服务。</p>
<h2>十、课后测验：你能分清“收到”和“完成”吗？</h2>
<h3>1. reader.read() 返回 done: true，说明什么？</h3>
<p>A. 响应体没有更多数据；仍要检查有没有业务结束事件。<br />
B. 模型回答一定完整。<br />
C. 答案里的事实都正确。</p>
<h3>2. 一个中文字符的字节被拆到两块数据里，怎么办？</h3>
<p>A. 每块单独解码，出现乱码再删除。<br />
B. 用连续解码器处理字节，再缓冲并解析完整事件。<br />
C. 强制每次请求只允许英文。</p>
<h3>3. 这篇为什么用 Fetch 接收 SSE？</h3>
<p>A. SSE 不能在浏览器使用。<br />
B. EventSource 会自动把答案变正确。<br />
C. 本篇需要 POST 问题，并自行管理请求与流读取。</p>
<h3>4. 真正的“停止生成”应做什么？</h3>
<p>A. 只停止更新 React 状态。<br />
B. 中断客户端请求，并让后端把取消传给上游。<br />
C. 把当前草稿标为成功答案。</p>
<p><strong>答案：1A、2B、3C、4B。</strong> 第一题区分连接结束与业务结束；第二题分别解决字符和事件边界；第三题是请求方式的选择；第四题让停止贯穿整条链路。</p>
<p><strong>工程练习：</strong> 在模拟流发出两段文字后结束连接，不发 <code>end</code>。检查正文是否还在、状态是否明确标为未完成，以及发送按钮是否恢复。不要为了“体验顺滑”，偷偷把异常改成成功。</p>
<p>网页配套区还有四题评分、解析与重答，以及可以停止的本地流演示。网页演示不访问模型；真实 HTTP 流请运行工程。</p>
<h2>十一、两个常见问题</h2>
<p><strong>流式输出能让模型总共算得更快吗？</strong></p>
<p>它首先改变的是交付方式：用户不必等全部内容生成完才看到开头。总耗时仍受模型、排队、网络和输出长度等因素影响，不能保证一开流式就整体加速。[1]</p>
<p><strong>既然能边显示，能不能边执行回答里的代码？</strong></p>
<p>本课不这么做。未完成文字既可能被截断，也可能错误；内容完成也不等于获得操作授权。我们只显示文本，不执行模型输出。</p>
<hr />
<h2>本篇只带走这一句话</h2>
<blockquote>
<p><strong>收到一点就展示一点，但只有真正完成，才说“完成”；用户叫停，整条链路都要听见。</strong></p>
</blockquote>
<p>第 15 篇结束。进度：<strong>15 / 40 篇，37.5%</strong>。下一篇继续完善聊天消息状态与多轮会话，让气泡不只是屏幕上的文字。</p>
<h2>资料依据</h2>
<p>接口与协议事实核对日期：2026-10-23。事件名、超时和限制数值、模拟情景与练习为本篇教学设计。</p>
<p>[1] OpenAI：Streaming API responses：https://developers.openai.com/api/docs/guides/streaming-responses</p>
<p>[2] MDN：Using server-sent events：https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events</p>
<p>[3] MDN：EventSource()：https://developer.mozilla.org/en-US/docs/Web/API/EventSource/EventSource</p>
<p>[4] MDN：TextDecoder.decode()：https://developer.mozilla.org/en-US/docs/Web/API/TextDecoder/decode</p>
<p>[5] WHATWG：Server-sent events：https://html.spec.whatwg.org/multipage/server-sent-events.html</p>
<p>[6] Node.js：HTTP：https://nodejs.org/api/http.html</p>
<p>[7] OpenAI：Responses streaming events：https://developers.openai.com/api/reference/resources/responses/streaming-events</p>
<p>[8] MDN：AbortController.abort()：https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort</p>
<p>[9] Nginx：proxy_buffering：https://nginx.org/en/docs/http/ngx_http_proxy_module.html#proxy_buffering</p>
`,ee=`<section id="utf8-supplement" data-user-supplement="true">
<h3>3.1 补充：中文 UTF-8 字节拆开了，怎么正确解码？</h3>
<p>在 AI 聊天场景中，如果使用 <strong>SSE（Server-Sent Events）或 Fetch Stream</strong> 接收流式数据，一个中文字符的 UTF-8 字节可能被拆成两段返回。</p>
<p>例如，中文字符 <code>你</code> 在 UTF-8 中占 <strong>3 个字节</strong>：</p>
<pre><code>你 = E4 BD A0

第一次收到：E4 BD
第二次收到：A0
</code></pre>
<p>如果分别解码，可能出现乱码 <code>�</code>。</p>
<h4>1. 错误实现 ❌</h4>
<pre><code>const reader = response.body!.getReader();

while (true) {
  const { done, value } = await reader.read();

  if (done) break;

  // 每次独立解码，可能导致中文乱码
  const text = new TextDecoder().decode(value);

  console.log(text);
}
</code></pre>
<p>原因：每次创建新的 <code>TextDecoder</code>，无法保留上一次未完成的 UTF-8 字节。</p>
<h4>2. 正确实现 ✅</h4>
<p><strong>使用 <code>TextDecoder</code> 的流式解码模式 <code>{ stream: true }</code>。</strong></p>
<pre><code>const response = await fetch('/api/chat');

const reader = response.body!.getReader();

const decoder = new TextDecoder('utf-8');

while (true) {
  const { done, value } = await reader.read();

  if (done) break;

  // 保留不完整的 UTF-8 字节，等待下一次数据
  const text = decoder.decode(value, {
    stream: true,
  });

  console.log(text);
}

// 处理最后可能残留的字节
const remaining = decoder.decode();

if (remaining) {
  console.log(remaining);
}
</code></pre>
<h5>原理</h5>
<p>假设服务端返回：</p>
<pre><code>Chunk 1: E4 BD
Chunk 2: A0 E5 A5 BD
</code></pre>
<p>执行过程：</p>
<table>
<thead>
<tr>
<th>次数</th>
<th>收到字节</th>
<th>TextDecoder 输出</th>
</tr>
</thead>
<tbody>
<tr>
<td>第一次</td>
<td><code>E4 BD</code></td>
<td><code>&quot;&quot;</code>（缓存不完整字符）</td>
</tr>
<tr>
<td>第二次</td>
<td><code>A0 E5 A5 BD</code></td>
<td><code>&quot;你好&quot;</code></td>
</tr>
</tbody>
</table>
<p><code>TextDecoder</code> 会自动缓存未完成的 UTF-8 字节序列。</p>
<h4>3. 更推荐：TextDecoderStream</h4>
<p>现代浏览器可以直接使用 <code>TextDecoderStream</code>：</p>
<pre><code>const response = await fetch('/api/chat');

const stream = response.body!
  .pipeThrough(new TextDecoderStream());

for await (const text of stream) {
  console.log(text);
}
</code></pre>
<p>这样就不需要手动管理 <code>TextDecoder</code>。</p>
<aside class="integration-note" data-editor-note="true"><p><strong>工程接入说明（新增，以上补充原文和代码保持不变）：</strong>上方代码聚焦解码，使用通用的 GET /api/chat 示例；本课可运行项目使用 POST /api/chat/stream，接入时需沿用工程的请求方式。解码后的字符串还可能是不完整的 SSE 事件，不能直接逐块 JSON.parse；请继续交给事件解析器。项目的 shared/sse.ts 已经在循环外复用 TextDecoder，并在每块解码时设置 stream: true。</p><p>页面末尾有“中文分块解码实验”，可逐步查看相同字节在错误与正确解码方式下的结果。</p></aside>
</section>
`,O=v=>(J("data-v-e4f92559"),v=v(),M(),v),te={id:"utf8-lab",class:"utf8-lab"},ne=O(()=>e("h2",null,"中文分块解码实验",-1)),oe=O(()=>e("p",null,"真实使用浏览器解码器处理固定字节；不发送网络请求。第一次只给“你”的前两个字节，第二次补齐并附上“好”。",-1)),se={class:"actions"},re=["disabled"],ae={class:"comparison"},de={class:"bad-output"},ce={class:"good-output"},pe={key:0},le=O(()=>e("thead",null,[e("tr",null,[e("th",null,"收到的字节"),e("th",null,"独立解码"),e("th",null,"流式解码")])],-1)),ue={class:"utf8-status",role:"status"},ie=["disabled"],he={class:"pipeline-output",role:"status"},ge=O(()=>e("small",null,"实验只负责 UTF-8 解码；SSE 事件仍需等分隔空行后再解析。",-1)),ve=$({__name:"Utf8DecodeDemo",setup(v){const r=c(0),w=c(""),n=c(""),_=c([]),i=c(""),a=c(!1),o=[new Uint8Array([228,189]),new Uint8Array([160,229,165,189])];let f,m=0;function D(){if(r.value>=o.length)return;f??(f=new TextDecoder("utf-8"));const d=o[r.value],E=new TextDecoder("utf-8").decode(d),h=f.decode(d,{stream:!0});w.value+=E,n.value+=h,_.value.push({bytes:Array.from(d,S=>S.toString(16).padStart(2,"0").toUpperCase()).join(" "),bad:JSON.stringify(E),good:JSON.stringify(h)}),r.value++,r.value===o.length&&(n.value+=f.decode())}function A(){m++,r.value=0,w.value="",n.value="",_.value=[],f=void 0,i.value="",a.value=!1}async function b(){const d=m;a.value=!0;try{const h=new ReadableStream({start(p){o.forEach(x=>p.enqueue(x)),p.close()}}).pipeThrough(new TextDecoderStream).getReader();let S="";try{for(;;){const p=await h.read();if(p.done)break;S+=p.value}}finally{h.releaseLock()}d===m&&(i.value=S)}catch{d===m&&(i.value="当前浏览器无法运行 TextDecoderStream 示例。")}finally{d===m&&(a.value=!1)}}return(d,E)=>(l(),u("section",te,[ne,oe,e("div",se,[e("button",{type:"button",disabled:r.value>=2,onClick:D},t(r.value===0?"接收第 1 段 E4 BD":r.value===1?"接收第 2 段 A0 E5 A5 BD":"两段已收齐"),9,re),e("button",{type:"button",onClick:A},"重置解码实验")]),e("div",ae,[e("p",null,[N("每段新建解码器："),e("code",de,t(JSON.stringify(w.value)),1)]),e("p",null,[N("同一实例 + stream: true："),e("code",ce,t(JSON.stringify(n.value)),1)])]),_.value.length?(l(),u("table",pe,[le,e("tbody",null,[(l(!0),u(I,null,F(_.value,(h,S)=>(l(),u("tr",{key:S},[e("td",null,t(h.bytes),1),e("td",null,t(h.bad),1),e("td",null,t(h.good),1)]))),128))])])):B("",!0),e("p",ue,t(r.value===0?"尚未接收数据":r.value===1?"第一段还不能组成完整字符：正确输出为空字符串。":"字节已补齐：正确结果为“你好”。"),1),e("button",{type:"button",disabled:a.value,onClick:b},"运行 TextDecoderStream 对比",8,ie),e("p",he,t(i.value?"TextDecoderStream 结果："+i.value:""),1),ge]))}});const me=j(ve,[["__scopeId","data-v-e4f92559"]]),C=[{q:"reader.read() 返回 done: true，说明什么？",options:["响应体没有更多数据；仍要检查有没有业务结束事件。","模型回答一定完整。","答案里的事实都正确。"],a:0,why:"流结束可能是正常关闭或中途断线，不能代替应用完成信号。"},{q:"一个中文字符的字节被拆到两块数据里，怎么办？",options:["每块单独解码，出现乱码再删除。","用连续解码器处理字节，再缓冲并解析完整事件。","强制每次请求只允许英文。"],a:1,why:"连续解码解决字节边界，事件缓冲解决消息边界，两者都需要。"},{q:"这篇为什么用 Fetch 接收 SSE？",options:["SSE 不能在浏览器使用。","EventSource 会自动把答案变正确。","本篇需要 POST 问题，并自行管理请求与流读取。"],a:2,why:"SSE 是响应格式，本课使用 Fetch 提交 POST 问题并读取它。"},{q:"真正的“停止生成”应做什么？",options:["只停止更新 React 状态。","中断客户端请求，并让后端把取消传给上游。","把当前草稿标为成功答案。"],a:1,why:"只停止显示并不代表上游请求也停止；取消仍不能保证撤销已发生的计算或费用。"}],q=v=>(J("data-v-079953ea"),v=v(),M(),v),_e={class:"lesson15"},fe=["innerHTML"],Se={class:"extras"},be=q(()=>e("h2",null,"配套实验：这一段回答，真的结束了吗？",-1)),xe=q(()=>e("p",null,"本地定时演示，不发送HTTP请求，不调用模型。真正的SSE链路请运行project。",-1)),ye=q(()=>e("svg",{class:"flow",viewBox:"0 0 700 108",role:"img","aria-label":"模型输出经后端转换为SSE事件，前端追加草稿并等待结束信号"},[e("g",{fill:"none",stroke:"currentColor"},[e("rect",{x:"5",y:"12",width:"180",height:"54",rx:"10"}),e("rect",{x:"260",y:"12",width:"180",height:"54",rx:"10"}),e("rect",{x:"515",y:"12",width:"180",height:"54",rx:"10"}),e("path",{d:"M190 40h60m-9-6 9 6-9 6M445 40h60m-9-6 9 6-9 6"})]),e("g",{fill:"currentColor","text-anchor":"middle","font-size":"15"},[e("text",{x:"95",y:"45"},"模型输出"),e("text",{x:"350",y:"45"},"Node.js → SSE"),e("text",{x:"605",y:"45"},"React 草稿"),e("text",{x:"350",y:"95","font-size":"12"},"delta 只追加；end 确认状态；断线不等于成功")])],-1)),we={for:"l15scenario"},Ee=["disabled"],Te=Y('<option value="answered" data-v-079953ea>正常完成</option><option value="incomplete" data-v-079953ea>生成上限：不完整</option><option value="refused" data-v-079953ea>拒绝</option><option value="failed" data-v-079953ea>流中错误</option><option value="disconnect" data-v-079953ea>无结束事件就断线</option>',5),qe=[Te],De={class:"actions"},Ae=["disabled"],ke=["disabled"],Ce=["data-state"],Ne={class:"draft"},Oe={class:"notice",role:"status"},Pe=q(()=>e("summary",null,"查看事件记录",-1)),Ue=q(()=>e("h2",null,"四道课后选择题",-1)),Ie=["name","checked","onChange"],Fe={key:0,class:"feedback"},Be={class:"actions"},Re=["disabled"],$e={key:0,role:"status",class:"score"},Je=q(()=>e("footer",null,[e("p",null,[e("a",{href:"https://github.com/enson0131/vitePress-blob/tree/master/examples/lesson15-streaming-chat"},"查看完整 React + Node.js 工程及运行说明")]),e("p",null,"下载或克隆仓库后进入 examples/lesson15-streaming-chat；这里对应原工程包中的 project 目录。")],-1)),R="<h2>四、后端：不再只调用一次 res.end</h2>",Me=$({__name:"StreamingLesson",setup(v){const r=Z.replace(R,ee+R),w={idle:"尚未发送",waiting:"等待第一段（模拟）",streaming:"正在生成：这是草稿",answered:"已完成（不代表事实已核验）",incomplete:"未完整生成，保留草稿",refused:"请求被拒绝",failed:"异常结束，保留草稿",stopped:"已停止，保留草稿"},n=c("idle"),_=c("answered"),i=c(""),a=c(""),o=c(""),f=P(()=>n.value==="waiting"||n.value==="streaming"),m=[`【本地演示，无网络调用】
`,"收到一小段，就先显示。","没有结束事件，","就不算完成。"];let D,A=0,b=0;function d(){A++,clearTimeout(D)}function E(){d(),n.value="idle",_.value="answered",i.value="",a.value="",o.value=""}function h(){d(),n.value="stopped",a.value="本地演示已停止；不再追加文字。",o.value+=`abort: user → 后端 → 上游（示意）
`}function S(){d();const y=A;b=0,i.value="",a.value="",o.value=`POST /api/chat/stream（仅图解，不发请求）
`,n.value="waiting";const s=_.value;function g(){if(y===A){if(s==="refused"){n.value="refused",a.value="这是固定拒绝样本，不是模型判断。",o.value+=`end: status=refused
`;return}if(b===2&&s!=="answered"){s==="disconnect"?(n.value="failed",a.value="未收到结束事件，不能视为完整回答。",o.value+=`EOF：连接结束；未收到 end
`):s==="incomplete"?(n.value="incomplete",a.value="模拟输出上限。",o.value+=`end: status=incomplete
`):(n.value="failed",a.value="流中错误，不伪装成功。",o.value+=`error: 模拟上游故障
`);return}b<m.length?(n.value="streaming",i.value+=m[b],o.value+="delta: "+JSON.stringify(m[b++])+`
`,D=setTimeout(g,240)):(n.value="answered",i.value=m.join(""),o.value+=`end: status=answered
`)}}D=setTimeout(g,450)}Q(d);const p=c({}),x=c(!1),L=P(()=>C.every((y,s)=>p.value[s]!==void 0)),z=P(()=>C.filter((y,s)=>p.value[s]===y.a).length);function W(y,s){p.value[y]=s,x.value=!1}function V(){p.value={},x.value=!1}return(y,s)=>(l(),u("article",_e,[e("div",{class:"original",innerHTML:U(r)},null,8,fe),e("section",Se,[H(me),be,xe,ye,e("label",we,[N("模拟场景"),K(e("select",{id:"l15scenario","onUpdate:modelValue":s[0]||(s[0]=g=>_.value=g),disabled:f.value},qe,8,Ee),[[X,_.value]])]),e("div",De,[e("button",{type:"button",disabled:f.value,onClick:S},"开始演示",8,Ae),e("button",{type:"button",disabled:!f.value,onClick:h},"停止生成",8,ke),e("button",{type:"button",onClick:E},"重置演示")]),e("p",{class:"demo-state","data-state":n.value,role:"status"},t(w[n.value]),9,Ce),e("div",Ne,t(i.value),1),e("p",Oe,t(a.value),1),e("details",null,[Pe,e("pre",null,t(o.value),1)]),Ue,(l(!0),u(I,null,F(U(C),(g,T)=>(l(),u("fieldset",{key:T},[e("legend",null,t(T+1)+". "+t(g.q),1),(l(!0),u(I,null,F(g.options,(G,k)=>(l(),u("label",{key:k,class:"option"},[e("input",{type:"radio",name:"q15-"+T,checked:p.value[T]===k,onChange:Le=>W(T,k)},null,40,Ie),N(t(String.fromCharCode(65+k))+". "+t(G),1)]))),128)),x.value?(l(),u("p",Fe,t(p.value[T]===g.a?"✓ 回答正确。":"回答错误。")+"正确答案："+t(String.fromCharCode(65+g.a))+"。"+t(g.why),1)):B("",!0)]))),128)),e("div",Be,[e("button",{type:"button",disabled:!L.value,onClick:s[1]||(s[1]=g=>x.value=!0)},"提交评分",8,Re),e("button",{type:"button",onClick:V},"重新作答")]),x.value?(l(),u("p",$e,"得分："+t(z.value)+" / "+t(U(C).length),1)):B("",!0)]),Je]))}});const je=j(Me,[["__scopeId","data-v-079953ea"]]),We=JSON.parse('{"title":"15 · 流式输出与 SSE","description":"","frontmatter":{"title":"15 · 流式输出与 SSE","readingTime":"15–20","outline":false,"prev":{"text":"14 · React + Node.js 第一条聊天链路","link":"./14-first-react-node-chat"}},"headers":[],"relativePath":"guide/ai/chatbot-course/15-streaming-sse-chat.md","filePath":"guide/ai/chatbot-course/15-streaming-sse-chat.md","lastUpdated":1792998910000}'),He={name:"guide/ai/chatbot-course/15-streaming-sse-chat.md"},Ve=Object.assign(He,{setup(v){return(r,w)=>(l(),u("div",null,[H(je)]))}});export{We as __pageData,Ve as default};
