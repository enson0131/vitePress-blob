import{d as V,h as d,g as C,j,O as J,o as i,c as u,k as e,l as U,a as y,$ as X,a2 as Y,t as r,F as A,D as R,e as I,Q as Z,H as ee}from"./chunks/framework.ac6a668e.js";const te=`<h1>📘 第 18 篇：AI 聊天失败了，应该自动重试吗？——错误处理、幂等与断线恢复</h1>
<p><strong>《AI 聊天机器人学习教程》｜第 18 / 40 篇（45%）</strong><br />
<strong>第三阶段：聊天机器人工程开发｜预计阅读 18–25 分钟｜React + TypeScript + Node.js + SQLite</strong></p>
<p>上一节，我们让浏览器能把收到的 SSE 文本拼接起来，按约 <strong>800ms / 2KiB</strong> 发送一次 <code>PUT</code> 保存检查点；数据库负责持久化，最后一次 <code>PUT</code> 成功之后，界面才显示 <code>answered</code>。</p>
<p>可惜，网络和模型服务并不总是配合。假设用户按下发送，可能遇到六种截然不同的情况：还没连上就报错、模型限流、模型生成到一半断线、用户自己点停止、AI 已答完却没有保存成功、用户因网络超时又点了一次发送。</p>
<p>如果我们不加区分地“失败就重新 POST 一次”，轻则出现重复气泡，重则把不完整回答当作成功，甚至触发两次有副作用的工具操作。</p>
<p><strong>本篇目标：让失败是可理解、可恢复、不会悄悄重复执行的。</strong> 并且继续遵守第 16、17 篇确定的规则：固定 <code>Turn.id</code>、<code>status</code> 驱动界面、最近六轮历史不按状态过滤、浏览器发起检查点 PUT、后端负责权限与状态兜底。</p>
<hr />
<h2>一、先分清三个“成功”——否则后续判断都会乱</h2>
<p>假设屏幕出现了一整段回答，这只能说明“前端收到了文字”，还不能证明所有流程已经成功。</p>
<table>
<thead>
<tr>
  <th>层次</th>
  <th>判定条件</th>
  <th>单独成立代表什么</th>
</tr>
</thead>
<tbody>
<tr>
  <td>HTTP 层成功</td>
  <td>收到 <code>200</code> 和流响应</td>
  <td>连接已建立，<strong>不代表生成完成</strong></td>
</tr>
<tr>
  <td>模型生成成功</td>
  <td>SSE 收到明确的 <code>end</code></td>
  <td>本次生成结束，<strong>不代表写库成功</strong></td>
</tr>
<tr>
  <td>持久化成功</td>
  <td>最终 <code>PUT</code> 得到数据库确认</td>
  <td>正文和 <code>answered</code> 状态已被成功存储</td>
</tr>
</tbody>
</table>
<p>因此，本篇规定：<strong>只有“收到合法 <code>end</code> + 最终 PUT 成功”才能在界面上显示 <code>answered</code>。</strong> 如果只收到 <code>delta</code> 就断线，保留现有草稿并显示 <code>incomplete</code>；如果模型生成完毕但最终 PUT 失败，显示保存失败，重新 GET 核对数据库状态，而不是把它悄悄当作正常完成。</p>
<p>还要区分 <code>notice</code> 和 <code>answer</code>：前者是“网络中断，请重试”等系统信息，不能混进助手正文。</p>
<h2>二、不是所有错误都应该自动重试</h2>
<p>把问题粗略分为“流开始前”和“流开始后”，比只看 <code>500</code> 更有用。</p>
<table>
<thead>
<tr>
  <th>故障</th>
  <th>是否自动重试？</th>
  <th>正确处理方式</th>
</tr>
</thead>
<tbody>
<tr>
  <td>收到 <code>429 Too Many Requests</code>，尚未开始 SSE</td>
  <td><strong>可以有限重试</strong></td>
  <td>尊重 <code>Retry-After</code>，相同幂等键，次数上限</td>
</tr>
<tr>
  <td>收到 <code>502/503/504</code>，尚未开始 SSE</td>
  <td><strong>通常可有限重试</strong></td>
  <td>退避 + 抖动；重复请求必须可安全去重</td>
</tr>
<tr>
  <td><code>400/401/403/422</code></td>
  <td><strong>不要自动重试</strong></td>
  <td>修正请求、鉴权或权限问题</td>
</tr>
<tr>
  <td><code>409 Conflict</code></td>
  <td><strong>不要盲目重试</strong></td>
  <td>重新 GET，核对状态或版本冲突</td>
</tr>
<tr>
  <td><code>fetch</code> 在响应头到达前网络失败</td>
  <td><strong>先核对，不盲发</strong></td>
  <td>后端可能已创建消息，这是未知结果</td>
</tr>
<tr>
  <td>已收到 <code>delta</code>，后来突然断线</td>
  <td><strong>不自动重发整轮</strong></td>
  <td>保留草稿，恢复并提供手动“重新回答”</td>
</tr>
<tr>
  <td>用户点击停止</td>
  <td><strong>不能自动重试</strong></td>
  <td><code>AbortController</code> 取消，上报停止并保留草稿</td>
</tr>
<tr>
  <td>最终 <code>PUT</code> 保存失败</td>
  <td><strong>不能认为 answered</strong></td>
  <td>查询最新状态，解决版本冲突或允许明确重试保存</td>
</tr>
</tbody>
</table>
<p><code>429</code> 可携带 <code>Retry-After</code> 指示等待时间；其值可以是秒数，也可以是 HTTP 日期。遇到 <code>503</code> 时也可使用这个响应头。参考 <a href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/429">MDN：429</a> 与 <a href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Retry-After">Retry-After</a>。</p>
<p><strong>注意：上表的“可以”不是 HTTP 协议承诺一定安全。</strong> 如果 POST 已经触发扣款或工具调用，即使收到 <code>503</code> 也可能有副作用；只有我们明确做了幂等保护，才能把重试作为默认策略。下面先给聊天问题创建做幂等。</p>
<h2>三、先解决重复发送：幂等键不是 Turn.id，也不是 runId</h2>
<p>场景：用户点击一次“发送”，浏览器网络断开，前端没等到响应。后端可能已经创建了 Turn。如果浏览器又发一遍普通 <code>POST</code>，数据库可能出现两条相同问题。</p>
<p>本课给<strong>“新建这一轮问题”</strong>携带一个 <code>clientKey</code>：用户发起这次操作时生成一次；如果是同一次操作的网络/限流重试，就使用原来的键。后端用 <code>(conversationId, clientKey)</code> 做唯一约束。<strong>同一个键映射同一个 <code>Turn.id</code>，不会生成第二个气泡。</strong></p>
<p>注意三个概念：<code>conversationId</code> 表示会话，固定 <code>Turn.id</code> 表示这轮问答，<code>clientKey</code> 只用于识别“重复提交的同一次创建操作”。它不代表模型生成尝试，也不负责第 16 篇旧流回调的隔离；那件事仍由当前 <code>AbortController</code> 负责。</p>
<p>前端新建消息时：</p>
<pre><code class="language-typescript">const clientKey = crypto.randomUUID();

// 自动重试同一次创建操作时，必须复用这一份 payload。
const payload = {
  question: &quot;解释一下闭包&quot;,
  clientKey,
  scenario: &quot;normal&quot; // 本课的故障模拟参数，正式产品不需要
};
</code></pre>
<p>数据库增加可空 <code>client_key</code> 列，旧的聊天数据不受影响，再建立唯一索引：</p>
<pre><code class="language-sql">ALTER TABLE turns ADD COLUMN client_key TEXT;
CREATE UNIQUE INDEX idx_turn_client_key
  ON turns(conversation_id, client_key)
  WHERE client_key IS NOT NULL;
</code></pre>
<p>实际工程会先检查表结构，再决定是否执行 <code>ALTER TABLE</code>，避免重复迁移。新增 Turn 的事务中先通过键查找现有记录：</p>
<pre><code class="language-typescript">// 在同一个数据库事务内执行，确保并发请求不会穿透去重。
const existing = db.prepare(\`
  SELECT id, question FROM turns
  WHERE conversation_id = ? AND client_key = ?
\`).get(conversationId, clientKey);

if (existing) {
  if (existing.question !== question) {
    throw new Error(&quot;同一个 clientKey 不能对应不同的问题&quot;);
  }
  // 返回已有 Turn；不创建，也不再次调用模型。
  return { turn: existing, created: false };
}

// 否则 INSERT 一条 waiting Turn，并提交事务。
</code></pre>
<p>本课的模拟服务器对重复提交返回 <code>409 DUPLICATE_REQUEST</code>，附上已有 Turn 信息；前端接到后重新 GET 会话，而不是再生成一次。真实产品也可以把重复的已完成创建请求返回为 <code>200</code>，但必须明确规定并发中的请求怎么办，以及键什么时候过期。参考 <a href="https://docs.stripe.com/api/idempotent_requests">Stripe 幂等请求设计</a>；本课只实现局部的创建去重，不冒充支付级幂等系统。</p>
<h2>四、重试策略：最多两次，尊重 Retry-After，加入抖动</h2>
<p>为什么不能每隔 100ms 重试到成功？假设模型服务刚好过载，1000 个客户端同一秒重试，服务端只会更难恢复。这叫“重试风暴”。</p>
<p>常见做法是<strong>指数退避（exponential backoff）+ 随机抖动（jitter）+ 最大重试次数</strong>。例如基准 500ms，下一次上限增加，但真正等待时间在范围内随机选择：</p>
<pre><code class="language-typescript">export function backoffMs(retryIndex: number): number {
  const cap = Math.min(4000, 500 * 2 ** retryIndex);
  return Math.floor(Math.random() * cap);
}
</code></pre>
<p>同时，如果服务器提供 <code>Retry-After</code>，优先按服务端告知的时间处理：</p>
<pre><code class="language-typescript">export function parseRetryAfter(
  header: string | null,
  now = Date.now()
): number | null {
  if (header === null) return null;
  const value = header.trim();
  if (/^\\d+$/.test(value)) return Math.min(Number(value) * 1000, 60_000);
  const date = Date.parse(value);
  return Number.isNaN(date)
    ? null
    : Math.max(0, Math.min(date - now, 60_000));
}
</code></pre>
<p>本课为了可演示，把过大的等待封顶为一分钟；正式接入服务时应结合厂商限流规则，遇到很长的 <code>Retry-After</code> 可直接提示用户稍后再试，不要擅自提前轰炸接口。</p>
<p>下面是真正的前端请求核心：</p>
<pre><code class="language-typescript">async function postBeforeStreamWithRetry(
  url: string,
  payload: unknown,
  signal: AbortSignal
): Promise&lt;Response&gt; {
  const body = JSON.stringify(payload); // 始终复用同一份 body / clientKey

  for (let attempt = 0; attempt &lt;= 2; attempt++) {
    let response: Response;
    try {
      response = await fetch(url, {
        method: &quot;POST&quot;,
        headers: { &quot;Content-Type&quot;: &quot;application/json&quot; },
        body,
        signal
      });
    } catch (error) {
      // 还没有拿到响应头，但服务器可能已收到并执行了 POST。
      // 不自动再发；先重新 GET 当前会话核对。
      throw new Error(&quot;NETWORK_UNKNOWN_OUTCOME&quot;, { cause: error });
    }

    if (response.ok) return response;

    const temporary = [429, 502, 503, 504].includes(response.status);
    if (!temporary || attempt === 2) {
      throw new Error(\`HTTP \${response.status}：请手动处理\`);
    }

    const waitMs = parseRetryAfter(response.headers.get(&quot;Retry-After&quot;))
      ?? backoffMs(attempt);
    await waitOrAbort(waitMs, signal); // 用户点停止时，等待也必须能取消
  }
  throw new Error(&quot;UNREACHABLE&quot;);
}
</code></pre>
<p><code>waitOrAbort</code> 的完整实现见示例 <code>src/retry-policy.ts</code>；它会响应 <code>AbortSignal</code>，不会在用户停止之后继续自动重试。业界对抖动、次数限制和幂等检查的实践，可参阅 <a href="https://docs.aws.amazon.com/wellarchitected/latest/framework/rel_mitigate_interaction_failure_limit_retries.html">AWS Well-Architected：控制重试</a>。</p>
<p>特别强调：<strong>这个函数只处理收到 SSE 响应之前的明确临时 HTTP 错误。它一旦返回 <code>200</code>，之后读到半截回答的异常不走这里。</strong></p>
<h2>五、为什么收到部分回答后不能自动从头重试？</h2>
<p>假设你已经看到：</p>
<pre><code class="language-text">用户：帮我介绍 React Fiber
AI：Fiber 是 React 的一种可中断的协调架构，主要用于……
</code></pre>
<p>接着 SSE 连接中断。如果前端直接重新 POST 同一个问题，并把第二次 <code>delta</code> 追加到旧正文后面，结果可能变成：</p>
<pre><code class="language-text">Fiber 是 React 的一种可中断的协调架构，主要用于……
Fiber 是 React 中对组件更新工作进行拆分的一种机制……
</code></pre>
<p>文字重复了，而且两次生成也可能用不同措辞，不能简单拼接。</p>
<p>因此本课做三件事：保留已经收到的可见草稿；通过 PUT 检查点保存（仍接受最多最近一段未保存内容丢失的事实）；标记 <code>incomplete</code> 或 <code>failed</code>，提供<strong>用户主动点击“重新回答”</strong>。重试固定同一个 <code>Turn.id</code>，但清空旧答案重新生成，避免拼接两份不同回答。旧回调由 <code>active.current === controller</code> 阻断。</p>
<p>一个不能省略的边界：<strong>TCP 连接自然结束不代表 SSE 已完成。</strong> 只有收到明确的 <code>end</code> 事件才说明生成完成。<code>event: error</code> 同样不是正常结束信号；HTTP 响应头发送之后，后端无法再修改为 <code>500</code>，需要用流内事件传递错误。</p>
<p>例如服务端：</p>
<pre><code class="language-typescript">// HTTP 200 与 SSE 头已经发出。
sse(res, &quot;meta&quot;, { turn });
sse(res, &quot;delta&quot;, { text: &quot;已经生成的一部分内容&quot; });

// 上游模型此时发生错误，不能再 writeHead(500)。
sse(res, &quot;error&quot;, {
  code: &quot;PROVIDER_STREAM_INTERRUPTED&quot;,
  retryable: false,
  message: &quot;生成中断，请手动重新回答&quot;
});
res.end();
</code></pre>
<p>这个 <code>retryable:false</code> 指的是<strong>不能直接自动继续/重发这一条流</strong>，不是说用户永远不能重试。用户主动点击重新回答，代表一次新的生成尝试，原来的 <code>Turn.id</code> 仍然不变。</p>
<h2>六、错误、停止和不完整：状态不是一个泛用的 failed</h2>
<p>继续使用第 16 篇的七个状态：</p>
<table>
<thead>
<tr>
  <th>status</th>
  <th>含义</th>
  <th>前端建议</th>
</tr>
</thead>
<tbody>
<tr>
  <td><code>waiting</code></td>
  <td>问题已创建，生成尚未开始或在等待</td>
  <td>显示等待；恢复时再 GET 核实</td>
</tr>
<tr>
  <td><code>streaming</code></td>
  <td>有内容正在生成</td>
  <td>显示实时草稿与“停止”</td>
</tr>
<tr>
  <td><code>answered</code></td>
  <td>已收到 end，且最终保存成功</td>
  <td>显示完整回答</td>
</tr>
<tr>
  <td><code>stopped</code></td>
  <td>用户明确点击停止</td>
  <td>保留草稿，显示“已停止”</td>
</tr>
<tr>
  <td><code>incomplete</code></td>
  <td>断线、重启或无法确认完成</td>
  <td>保留最后成功落库的检查点</td>
</tr>
<tr>
  <td><code>failed</code></td>
  <td>明确的生成故障</td>
  <td>显示错误并允许手动重新回答</td>
</tr>
<tr>
  <td><code>refused</code></td>
  <td>模型明确拒绝完成请求</td>
  <td>展示拒绝正文，不当作网络故障无限重试</td>
</tr>
</tbody>
</table>
<p>特别注意：前端 <code>AbortError</code> <strong>不等于</strong>服务端必定保存 <code>stopped</code>。例如切换会话时主动取消本地读取，服务端可能把它记为 <code>incomplete</code>。真正的“停止”应该有明确的 stop API；只有用户明确点击了停止才能赋予 <code>stopped</code> 语义。</p>
<h2>七、刷新时怎么恢复？前端和后端分别做什么？</h2>
<p>在第 17 篇我们已经做了“前端 PUT 保存草稿”，第 18 篇专门回答：刷新发生在不同阶段，界面应该显示什么？</p>
<table>
<thead>
<tr>
  <th>用户刷新时刻</th>
  <th>数据库可能保存了什么</th>
  <th>新页面应当怎样处理</th>
</tr>
</thead>
<tbody>
<tr>
  <td>新问题 <code>POST</code> 尚未得到响应</td>
  <td>可能没创建，也可能已创建 Turn</td>
  <td><strong>先 GET 会话核对</strong>，不要盲目重发问题</td>
</tr>
<tr>
  <td>收到几个 <code>delta</code>，还没到检查点</td>
  <td>只有上次保存的内容</td>
  <td>恢复已存快照；未 PUT 的文字可能丢失</td>
</tr>
<tr>
  <td>检查点 PUT 已成功</td>
  <td>当前草稿和 <code>streaming</code></td>
  <td>服务端识别断线后转 <code>incomplete</code>；界面保留草稿</td>
</tr>
<tr>
  <td>SSE 已收到 <code>end</code>，最终 PUT 尚未完成</td>
  <td>生成结束，但持久化结果未确认</td>
  <td>不显示 <code>answered</code>，GET 确认是否落库</td>
</tr>
<tr>
  <td>最终 PUT 已确认</td>
  <td>完整正文、<code>answered</code></td>
  <td>正常恢复完整消息</td>
</tr>
</tbody>
</table>
<p>简化为两个职责：<strong>前端加载和展示；后端识别自己知道的真实状态</strong>。前端不应该凭“页面刚刷新过”就把每个 <code>streaming</code> 改成 <code>incomplete</code>，因为别的设备或后台任务可能还在生成。</p>
<p>前端启动：</p>
<pre><code class="language-typescript">const selectedId = localStorage.getItem(&quot;lesson18:selectedConversation&quot;);
if (selectedId) {
  // GET 数据库真实记录，注意 AbortController 隔离旧加载回调。
  await selectConversation(selectedId);
}
</code></pre>
<p><code>selectConversation</code> 内可以对 <code>waiting/streaming</code> 进行有限次数的重新读取（本课最多 4 次，每隔约 300ms），<strong>这只是状态确认，不是重新向模型发问题</strong>。如果服务器没有完成断线清理，界面提示“状态待确认”，允许用户手动刷新。</p>
<p>服务端断线后的处理：</p>
<pre><code class="language-typescript">res.on(&quot;close&quot;, () =&gt; {
  if (!generationFinished) controller.abort();
});

// 流被中止或发生故障时，后端记录状态兜底。
// 注意：浏览器最后一次 PUT 可能尚未完成。
store.markUnfinished(userId, conversationId, turnId,
  &quot;incomplete&quot;, &quot;连接中断；保留已经落库的检查点&quot;);
</code></pre>
<p>上面是示意：真实代码必须区别用户明确停止、网络断线和模型内部错误，并做好和浏览器 PUT 的 <code>revision</code> 冲突处理。<strong>后端在断线时不能凭空保存浏览器还没提交的文字</strong>。</p>
<h2>八、最容易漏掉的一种失败：模型生成完了，最后 PUT 失败</h2>
<p>上一节的前端写入器 <code>BrowserDraftWriter</code> 会在 SSE 来时拼接正文，每 800ms / 2KiB 保存一次。模型发来 <code>end</code> 后：</p>
<pre><code class="language-typescript">if (!gotEnd) {
  throw new Error(&quot;缺少 SSE end；不能标记 answered&quot;);
}

// 等待排队中的检查点 PUT 完成，再做最后一次终态 PUT。
await writer.finish(&quot;answered&quot;);

// 只有服务端确认最后 PUT 成功，React 才进入 answered。
setStatus(&quot;answered&quot;);
</code></pre>
<p>为什么需要“串行”保存？假设先发“你好”、又发“你好世界”的快照；第二次请求更快返回，之后第一份旧快照才写入，就可能倒退。第 17 篇已用 <code>revision</code> 和队列解决这个问题：<code>PUT</code> 携带数据库当前版本，每次等待前一次成功才继续，服务器通过 <code>WHERE revision = ?</code> 做乐观锁。</p>
<p>此外，模型生成成功与保存成功是两个独立结果。如果最后一次 <code>PUT</code> 因数据库冲突或网络失败未返回成功，前端应该<strong>重新 GET 核对</strong>，而不是自动把整个模型请求重新生成一遍。生产实践还可以用单独的“确认提交” API，让服务端根据可信生成任务结果持久化。</p>
<p>本篇延续第 17 篇的教学限制：浏览器提交的回答正文由服务器校验长度、版本和状态，但<strong>没有验证正文必然来自真实模型</strong>；不能把这个单用户例子直接用于对 AI 输出来源有严格要求的生产系统。</p>
<h2>九、前端的“重新回答”与“重新发送”根本不是一回事</h2>
<p>重新回答：针对已经存在的 Turn，用户手动点击按钮，调用 <code>POST /api/conversations/:conversationId/turns/:turnId/retry</code>，问题和 <code>Turn.id</code> 不变，原回答草稿清空，再从头生成。</p>
<p>重新发送：用户新建另一轮问题，调用 <code>POST /api/conversations/:conversationId/turns</code>，会创建一个新的 Turn；如果只是第一份创建请求丢了响应，必须通过 <code>clientKey</code> 去重或先 GET 核对，不能认作全新问题。</p>
<p>因此，本课不会在流中断后弹出一个“自动继续生成”的假按钮。我们只提供“重新回答（从头生成）”，真实续传必须依赖服务端保留的生成任务、事件序号和补发能力，第 18 篇没有实现这些能力。</p>
<h2>十、动手实验：把四种失败亲自跑一遍</h2>
<p>配套工程完全离线模拟，不需要模型密钥。建议 Node.js 24；新终端分别执行：</p>
<pre><code class="language-bash">cd examples/chatbot-course/lesson18
npm install
npm test
npm run build
npm run server  # 终端 A：127.0.0.1:3002
npm run dev     # 终端 B：127.0.0.1:5173
</code></pre>
<p>打开 <code>http://127.0.0.1:5173</code>，新建会话，在“模拟故障”下拉框选择：</p>
<ol>
<li><strong>首次 429 / 首次 503：</strong> 第一份请求得到临时 HTTP 错误，UI 显示重试等待，<strong>再次 POST 复用同一个 <code>clientKey</code></strong>，最多两次；数据库只创建一条 Turn。</li>
<li><strong>部分内容后 error：</strong> SSE 先给出 <code>meta</code>、<code>delta</code>，再发 <code>event:error</code>；这不是 <code>end</code>。显示失败/草稿，不自动把第二次答案拼进去。</li>
<li><strong>无 end 断开：</strong> 连接突然结束；前端检查 <code>gotEnd</code>，失败并重新 GET 会话，数据库恢复最后成功保存的草稿。</li>
<li><strong>正常生成：</strong> 一直收到 <code>end</code>，前端等待最后一次 <code>PUT answered</code> 成功；刷新后从 SQLite 恢复完整回答。</li>
</ol>
<p>如果想测试“同一个键不会重复创建”，还可以直接用相同 <code>clientKey</code> 重复 POST；服务端会给出包含原 Turn 的冲突响应，数据库中仍只有一轮。注意“临时错误”和“结果未知”是两回事：后者应先 GET 核对，不盲目多发。</p>
<h2>十一、上线前还有哪些边界要补？</h2>
<p>这仍是本地单用户教学工程，不是完整生产系统。至少还需要真正的账号/租户鉴权与数据隔离；幂等键的生存期、参数指纹和跨实例并发一致性；上游模型超时与费用预算；服务端可信的回答签名或生成记录；多副本环境下的任务所有权；日志与监控中的敏感数据处理。</p>
<p>实际排障要记录的是<strong>请求属于哪个会话/Turn、哪个状态、失败在 HTTP/SSE/PUT 哪一层、有没有 delta、是否已经最终保存、重试了几次</strong>。不要为了调试把用户全部聊天内容或 API Key 打印到日志中。</p>
<h2>十二、学习疑问与解答</h2>
<p><strong>Q1：为什么网络断开不自动重新发 POST？</strong> 断开时前端不知道服务器有没有创建 Turn；盲目重发可能重复执行。同一个操作应先靠幂等键或 GET 核对，再决定动作。</p>
<p><strong>Q2：既然有 Turn.id，为什么还要 clientKey？</strong> 新 Turn 的 ID 通常是后端创建后才返回的；响应丢失时浏览器可能不知道它是什么。<code>clientKey</code> 用于把重发的“创建动作”映射回原 Turn，和固定 <code>Turn.id</code> 不冲突。</p>
<p><strong>Q3：部分回答断了，为何不从断点继续？</strong> 一般 SSE 文本并没有可重放的事件序号或服务端生成任务；重新生成不等于续传。真正的续传需要额外协议，本课只演示保留草稿和从头重新回答。</p>
<p><strong>Q4：Retry-After 写 30，真的要等 30 秒吗？</strong> 它是服务器建议的等待时间（通常为 30 秒）；客户端应尊重并设置合理上限。如果超出用户可接受的等待，可提示稍后手动尝试，而不是提前密集重试。</p>
<p><strong>Q5：用户主动停止，要不要让模型自动恢复？</strong> 不要。主动停止是用户意图，必须和网络故障区分；除非用户重新点击按钮，否则不应继续生成。</p>
<hr />
<h2>本篇总结</h2>
<blockquote>
<p><strong>错误先分类，再决定重试；创建先保证幂等，再考虑自动化；收到半截内容不能算成功；模型完成不等于已经保存。</strong></p>
</blockquote>
<p>至此，我们已经有了一套能解释“为什么失败、能不能安全重试、刷新后怎么恢复”的聊天系统。第 19 篇将继续完善工程中的超时、限流和观测指标，让性能与成本变得可控。</p>
<p><strong>课程进度：18 / 40 篇（45%）。</strong></p>
<h3>参考资料</h3>
<ul>
<li><a href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/429">MDN：429 Too Many Requests</a></li>
<li><a href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Retry-After">MDN：Retry-After</a></li>
<li><a href="https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch">MDN：使用 Fetch、AbortController</a></li>
<li><a href="https://docs.aws.amazon.com/wellarchitected/latest/framework/rel_mitigate_interaction_failure_limit_retries.html">AWS：控制重试、指数退避与抖动</a></li>
<li><a href="https://docs.stripe.com/api/idempotent_requests">Stripe：Idempotent requests</a></li>
</ul>
`,w=[{q:"收到 HTTP 429，还没开始 SSE；本课允许怎样处理？",options:["立即无限次重试，直到成功","复用同一 clientKey，按 Retry-After 或退避等待，有限重试","直接将 Turn 标记 answered"],a:1,why:"只有明确可重试且具备幂等保护的预流式请求，才适合有上限地自动重试。"},{q:"已收到 delta，随后 SSE 断开且没有 end，下一步是什么？",options:["把现有草稿标记 answered","不改 Turn.id，保留草稿并确认服务端状态，用户手动选择重新回答","把第二次生成从头追加在旧草稿后面"],a:1,why:"没有 end 不能算生成完成；流式中断也不能无条件拼接新一次生成。"},{q:"模型已发出 end，但最终 PUT answered 保存失败，界面该显示什么？",options:["answered，因为用户已经看到完整文字","刷新或 GET 核对持久化状态，不得假报保存成功","马上自动再次调用模型重写整份答案"],a:1,why:"生成完成与持久化确认是两个独立条件。"},{q:"Turn.id 固定不变，为什么还需要 clientKey？",options:["它能代替 AbortController 隔离流回调","用来把丢失响应后的重复创建 POST 映射到原 Turn","让数据库按字母顺序排列消息"],a:1,why:"创建消息的响应丢失时，客户端可能还不知道服务端生成的 Turn.id，因此需要一个提交时就固定的幂等键。"}];const ne={class:"lesson18"},oe=["innerHTML"],re={class:"lab","aria-label":"自动重试与断线恢复互动实验"},de=e("h2",null,"🧪 交互实验：什么时候能重试，什么时候不能？",-1),ae=e("p",null,[y("这是前端概念模拟，不会连接真实模型或 SQLite。选择故障，观察 "),e("code",null,"Turn.id"),y("、"),e("code",null,"clientKey"),y("、屏幕草稿与最后保存快照的区别。")],-1),se=Z('<option value="rate">首次 429 限流</option><option value="unavailable">首次 503 临时不可用</option><option value="partial">流中途 error</option><option value="disconnect">流无 end 断开</option><option value="save">end 后最终 PUT 失败</option><option value="normal">正常完成</option>',6),ce=[se],le={class:"columns"},ie=e("strong",null,"数据库最近一次检查点",-1),ue={class:"hint"},pe={class:"timeline"},ge={class:"quiz","aria-label":"第十八篇交互测验"},he=e("h2",null,"📝 交互测验：四道选择题",-1),ve=["name","checked","onChange"],Te={key:0,class:"hint"},me={class:"actions"},fe=["disabled"],ye={key:0,role:"status",class:"result"},be={role:"status",class:"copy-hint"},Se=V({__name:"ResilientChatLesson",setup(N){const q=d(null),b=d(""),v=d({}),m=d(!1),O=C(()=>w.every((c,a)=>v.value[a]!==void 0)),K=C(()=>w.filter((c,a)=>v.value[a]===c.a).length);function H(){v.value={},m.value=!1}async function M(c){var a,t;try{const l=((t=(a=c.parentElement)==null?void 0:a.querySelector("code"))==null?void 0:t.textContent)||"";await navigator.clipboard.writeText(l),b.value="已复制完整代码"}catch{b.value="复制失败，可手动选择代码"}}j(()=>void J(()=>{var c;return(c=q.value)==null?void 0:c.querySelectorAll("pre").forEach(a=>{if(a.querySelector("[data-copy18]"))return;const t=document.createElement("button");t.type="button",t.dataset.copy18="1",t.className="copy18",t.textContent="复制代码",t.addEventListener("click",()=>void M(t)),a.prepend(t)})}));const s=d("rate"),n=d("waiting"),S=d("T1"),_=d("K1"),k=d(0),g=d(0),h=d(""),p=d(""),f=d(!1),T=d(""),E=d([]);function o(c){E.value=[...E.value,c]}function x(){s.value="rate",n.value="waiting",S.value="T1",_.value="K1",k.value=0,g.value=0,h.value="",p.value="",f.value=!1,T.value="",E.value=[]}function D(){if(n.value!=="streaming"){if(n.value==="answered"){T.value="此轮已完成。想再次生成请选择重置实验。";return}k.value++,g.value++,n.value="waiting",T.value="",f.value=!1,o(`发起创建：clientKey=${_.value}，Turn.id=${S.value}，尝试 ${g.value}`),(s.value==="rate"||s.value==="unavailable")&&g.value===1?o(`返回 ${s.value==="rate"?"429":"503"} + Retry-After: 1；尚无 delta，可带原 key 有限重试`):(n.value="streaming",o("服务端接受请求，开始 SSE（meta / delta）"))}}function L(){if(g.value!==1||!["rate","unavailable"].includes(s.value)){o("现在不是可自动重试的预流式错误");return}g.value=2,n.value="streaming",o(`使用相同 clientKey=${_.value}，进入第二次尝试；只有一个 ${S.value}`)}function G(){if(n.value!=="streaming"){o("当前不在 streaming，忽略 delta");return}h.value+="正在生成的一段回答。",o("SSE delta：前端显示更新，数据库尚未必然保存")}function W(){if(!["streaming","failed","incomplete"].includes(n.value)){o("当前没有待保存的草稿");return}p.value=h.value,o("前端 PUT 保存检查点成功；数据库已有 "+p.value.length+" 字")}function $(){if(n.value!=="streaming"){o("请先开始 streaming");return}if(s.value==="normal"){o("正常场景请选择“收到 end”");return}if(s.value==="save"){f.value=!0,T.value="最终 PUT 失败，不能显示 answered",n.value="failed",o("SSE end 已收到，但最终 PUT 失败：不能当作成功");return}n.value=s.value==="partial"?"failed":"incomplete",T.value=s.value==="partial"?"收到 error 事件":"流无 end 断开",o("流结束但缺少 end；不自动重新 POST，保留已有草稿")}function B(){if(n.value!=="streaming"){o("当前不是可结束的流");return}f.value=!0,p.value=h.value,n.value="answered",o("SSE end + 最终 PUT 成功 → answered")}function Q(){h.value=p.value,n.value!=="answered"&&(n.value="incomplete"),o(`模拟刷新 GET：从持久化快照恢复 ${p.value.length} 字；没有偷偷发模型请求`)}function F(){if(!["failed","incomplete"].includes(n.value)){o("当前状态不能手动重新回答");return}h.value="",p.value="",n.value="streaming",f.value=!1,g.value=0,o("用户明确重新回答：Turn.id 仍然是 T1；旧草稿清空，新生成从头开始")}return(c,a)=>(i(),u("article",ne,[e("div",{class:"original",ref_key:"article",ref:q,innerHTML:U(te)},null,8,oe),e("section",re,[de,ae,e("label",null,[y("故障类型："),X(e("select",{"onUpdate:modelValue":a[0]||(a[0]=t=>s.value=t),"aria-label":"选择模拟故障"},ce,512),[[Y,s.value]])]),e("div",le,[e("div",null,[e("strong",null,"当前屏幕 · "+r(n.value),1),e("p",null,r(h.value||"（尚无正文）"),1),e("small",null,"固定 Turn.id："+r(S.value),1)]),e("div",null,[ie,e("p",null,r(p.value||"（尚未保存）"),1),e("small",null,"创建幂等键："+r(_.value),1)])]),e("div",{class:"actions"},[e("button",{onClick:D},"开始发送"),e("button",{onClick:L},"429/503 后自动重试"),e("button",{onClick:G},"收到 delta"),e("button",{onClick:W},"检查点 PUT"),e("button",{onClick:$},"模拟故障"),e("button",{onClick:B},"收到 end + 最终 PUT"),e("button",{onClick:Q},"模拟刷新 GET"),e("button",{onClick:F},"手动重新回答"),e("button",{onClick:x},"重置实验")]),e("p",ue,r(T.value||"重要：只靠 HTTP 200 不能标记 answered；必须 end + 最终 PUT 均成功。"),1),e("ol",pe,[(i(!0),u(A,null,R(E.value,(t,l)=>(i(),u("li",{key:l},r(t),1))),128))])]),e("section",ge,[he,(i(!0),u(A,null,R(U(w),(t,l)=>(i(),u("fieldset",{key:l},[e("legend",null,r(l+1)+". "+r(t.q),1),(i(!0),u(A,null,R(t.options,(z,P)=>(i(),u("label",{key:P},[e("input",{type:"radio",name:`lesson18-${l}`,checked:v.value[l]===P,onChange:Ee=>{v.value[l]=P,m.value=!1}},null,40,ve),y(" "+r("ABC"[P])+". "+r(z),1)]))),128)),m.value?(i(),u("p",Te,r(v.value[l]===t.a?"答对了。":"答错了。")+"正确答案："+r("ABC"[t.a])+"。"+r(t.why),1)):I("",!0)]))),128)),e("div",me,[e("button",{disabled:!O.value,onClick:a[1]||(a[1]=t=>m.value=!0)},"提交评分",8,fe),e("button",{onClick:H},"重新作答")]),m.value?(i(),u("p",ye,"得分："+r(K.value)+" / "+r(U(w).length),1)):I("",!0)]),e("p",be,r(b.value),1)]))}}),we=JSON.parse('{"title":"18 · 错误处理、幂等与断线恢复","description":"","frontmatter":{"title":"18 · 错误处理、幂等与断线恢复","readingTime":"18–25","outline":false},"headers":[],"relativePath":"guide/ai/chatbot-course/18-error-retry-recovery.md","filePath":"guide/ai/chatbot-course/18-error-retry-recovery.md","lastUpdated":1793118415000}'),_e={name:"guide/ai/chatbot-course/18-error-retry-recovery.md"},qe=Object.assign(_e,{setup(N){return(q,b)=>(i(),u("div",null,[ee(Se)]))}});export{we as __pageData,qe as default};
