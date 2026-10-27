import{d as H,h as k,E as N,g as T,j as U,o as f,c as m,k as s,l as I,t as d,e as A,F as R,D as M,a as L,H as P}from"./chunks/framework.ac6a668e.js";const Q=`<h1>📘 第 16 篇：别聊一句忘一句——把聊天气泡变成真正的多轮对话</h1>
<p><strong>消息状态与多轮会话｜第 16 / 40 篇｜第三阶段：工程开发｜阅读约 15–20 分钟</strong></p>
<p>上一节，文字已经能一段段冒出来，中文也不会因为拆包变乱码了。</p>
<p>你兴冲冲地试了一下：</p>
<blockquote>
<p>我：我叫小陈。<br />
助手：你好！<br />
我：我叫什么？<br />
助手：抱歉，我不知道。</p>
</blockquote>
<p>你看着屏幕上刚刚发出的“我叫小陈”，很想反问一句：<strong>不就在你上面吗？</strong></p>
<p>问题是：在页面上面，不等于在模型的输入里面。手动管理多轮对话时，需要把相关历史交给下一次请求；服务商也可能提供自己的会话状态机制。<a href="#source-1">[1]</a></p>
<p><strong>本篇采用固定 <code>Turn.id</code>，由 <code>status</code> 驱动消息状态；界面保留全部记录，模型输入选择最近 6 轮，不按状态过滤。网络层检查当前控制器，防止旧请求串话。</strong></p>
<p>今天我们做两件事：<strong>让模型接上前文，让回复待在正确的气泡里。</strong> 本篇新增的是应用层设计；第 15 篇的 SSE 解码与分帧继续复用，不重写一套。</p>
<h2>一、先分清三份“聊天记录”</h2>
<table>
<thead>
<tr>
<th>放在哪里</th>
<th>负责什么</th>
<th>本篇是否实现</th>
</tr>
</thead>
<tbody>
<tr>
<td>React 状态里的记录</td>
<td>让用户看见气泡、草稿和错误</td>
<td>实现</td>
</tr>
<tr>
<td>本次模型请求中的历史</td>
<td>帮助模型理解“刚才那个”</td>
<td>实现，限定纯文本</td>
</tr>
<tr>
<td>后端持久化记录</td>
<td>刷新、换设备后继续读取</td>
<td>留到下一篇</td>
</tr>
</tbody>
</table>
<p>本篇采用最容易观察的方案：<strong>历史先放在浏览器内存里，每次发送时选出需要的问答，一起交给后端。</strong> 刷新页面就清空；这不是数据库，也不是长期记忆。</p>
<p>例如，第二次请求给模型的文本输入可以是：</p>
<pre><code class="language-json">[
  { &quot;role&quot;: &quot;user&quot;, &quot;content&quot;: &quot;我叫小陈。&quot; },
  { &quot;role&quot;: &quot;assistant&quot;, &quot;content&quot;: &quot;你好，小陈！&quot; },
  { &quot;role&quot;: &quot;user&quot;, &quot;content&quot;: &quot;我叫什么？&quot; }
]
</code></pre>
<p>这才把“上一句”送到了。它提供了回答依据，但不保证模型一定答对。<a href="#source-1">[1]</a></p>
<h2>二、给每轮问答一个固定 ID，就够了</h2>
<p>不要再让整个聊天窗口只有一个 <code>answer</code> 字符串。第二次回答会覆盖第一次；也不要每收到一个 <code>delta</code> 就新增一个气泡，否则一句话能长出几十个气泡。</p>
<p>本篇把“一句问题 + 一份回答”放在一个 <code>Turn</code> 中：</p>
<pre><code class="language-typescript">type Turn = {
  id: string;          // 创建这轮问答时生成，停止、重试都不更换
  question: string;
  answer: string;
  status: Status;
  notice: string;      // 错误或未完成说明，不混进答案正文
};
</code></pre>
<p><code>Status</code> 在下一节展开。整个会话外面仍有一个 <code>conversationId</code>：它区分哪场聊天，<code>Turn.id</code> 区分哪轮问答。</p>
<p>重试并不是用户又问了一个新问题，所以沿用同一个 <code>Turn.id</code> 和原问题，更新回答内容与状态即可。只有真正开始新的一轮问答，才创建新的 Turn。</p>
<p>用户气泡和助手气泡，可以分别用 <code>turn.id + &quot;:user&quot;</code>、<code>turn.id + &quot;:assistant&quot;</code> 标识。它们不因为文字变长或重新回答就换身份。React 列表应使用稳定的 key，不要每次渲染随机生成，也不要在会插入、删除或调整的列表里只靠数组下标认人。<a href="#source-2">[2]</a></p>
<h2>三、由 status 驱动界面，不再叠加生成编号</h2>
<p>第一轮已经完成，第二轮正在生成。你不能让第一轮也跟着显示“思考中”。本篇给<strong>每轮的助手回答</strong>设置状态：</p>
<pre><code class="language-typescript">type Status =
  | &quot;waiting&quot;
  | &quot;streaming&quot;
  | &quot;answered&quot;
  | &quot;stopped&quot;
  | &quot;failed&quot;
  | &quot;incomplete&quot;
  | &quot;refused&quot;;
</code></pre>
<p>流程很直接：</p>
<pre><code class="language-text">创建问答 → waiting
收到文字 → streaming
正常完成 → answered
主动停止 → stopped
调用失败 → failed
生成截断 → incomplete
拒绝回答 → refused

停止 / 失败 / 截断后重试：
同一个 Turn.id，清空草稿和提示，status 回到 waiting
</code></pre>
<p>请求可能在第一段文字之前就失败或被拒绝，不必先经过 <code>streaming</code>。只有 <code>waiting</code>、<code>streaming</code> 可以接收流式更新；终态不会被普通增量重新激活，必须经过明确的重试动作。</p>
<p>按钮、等待提示和气泡标签都从这些状态推导，不再额外维护一份容易不同步的 <code>loading</code> 状态。例如：</p>
<pre><code class="language-typescript">const busy = state.turns.some(
  turn =&gt; turn.status === &quot;waiting&quot; || turn.status === &quot;streaming&quot;
);
</code></pre>
<p><strong><code>answered</code> 只表示本次生成正常完成，不等于答案事实已经核验。</strong> 当前请求控制器只处理取消和旧回调隔离，不承担界面状态。</p>
<h2>四、状态管进度，控制器挡住旧请求</h2>
<p>设想一个很讨厌的时序：请求 A 被停止，同一轮马上重试得到 B。此时 Turn 的状态又变回 <code>streaming</code>，A 的某个旧回调才执行。</p>
<p><strong>固定 ID 没错，状态也没错；但单看它们，无法知道这个回调属于 A 还是 B。</strong> 本版不为此增加生成编号，而是复用本来就要创建的 <code>AbortController</code>。</p>
<p><code>active.current</code> 保存当前请求的临时对象。下面是网络回调入口的核心片段，不是独立可运行组件；<code>active</code>、<code>controller</code> 与 <code>target</code> 在工程的 <code>src/App.tsx</code> 中创建：</p>
<pre><code class="language-typescript">const end = await readChat(response, delta =&gt; {
  if (!ownsController(active.current, controller) || controller.signal.aborted) return;
  dispatch({ type: &quot;delta&quot;, ...target, text: delta });
}, controller.signal);
</code></pre>
<p><code>ownsController</code> 只是把这个比较抽成一个可复用、可测试的小函数：</p>
<pre><code class="language-typescript">export type ControllerOwner = { controller: AbortController };

export function ownsController(
  active: ControllerOwner | null,
  controller: AbortController
): boolean {
  return active?.controller === controller;
}
</code></pre>
<p>换成 B 后，<code>active.current.controller</code> 指向 B；A 的闭包仍拿着 A 的控制器，因此进不了更新入口。控制器不是新编号，不写进 Turn，也不发送给后端。使用 ref 保存不参与渲染的请求对象，而用 state 驱动界面，职责正好分开。<a href="#source-8">[8]</a></p>
<p><strong>增量、结束、报错都必须先检查归属；<code>finally</code> 也只能清理自己。</strong> 被取消的请求不能继续派发普通更新；当前请求自身的超时则仍需要转换为 <code>failed</code>，所以错误处理中先检查所有权，再判断取消原因。</p>
<p>通过网络入口后，reducer 就只需要按会话、固定 Turn 和状态更新。下面是工程里完整的 <code>applyStream</code> 函数；相关类型在 <code>shared/chat-state.ts</code>：</p>
<pre><code class="language-typescript">export function applyStream(state: ChatState, action: StreamAction): ChatState {
  if (state.conversationId !== action.conversationId) return state;
  const index = state.turns.findIndex(t =&gt; t.id === action.turnId);
  const turn = state.turns[index];
  if (!turn || !isPending(turn.status)) return state;

  let next: Turn;
  if (action.type === &quot;delta&quot;) {
    next = { ...turn, answer: turn.answer + action.text, status: &quot;streaming&quot; };
  } else if (action.type === &quot;end&quot;) {
    next = action.status === &quot;incomplete&quot;
      ? { ...turn, status: &quot;incomplete&quot;, notice: action.text }
      : { ...turn, answer: action.text, status: action.status, notice: &quot;&quot; };
  } else {
    next = { ...turn, status: action.status, notice: action.notice };
  }
  return { ...state, turns: state.turns.map((t, i) =&gt; i === index ? next : t) };
}
</code></pre>
<p>函数返回新对象，不直接改原数组。配套 React 页面用 <code>useReducer</code> 管理开始、增量、结束、中止和重试，界面由当前状态决定。<a href="#source-3">[3]</a></p>
<p><strong>边界要讲清楚：这个 reducer 不再独立识别同一 Turn 的不同请求。所有异步事件都必须经过控制器检查，不能绕开入口直接派发旧事件。</strong> 这是面向“同一时间一个前台请求”的简化设计，不是说共享的 <code>status</code> 自己能解决所有竞态。</p>
<h2>五、保留所有状态的回答，截取最近 6 轮</h2>
<p>这里分清两个范围：<strong>界面中保留全部 Turn 及其状态；发送给模型时，只取当前会话中最近 6 轮的用户问题和已有回答，不按 <code>status</code> 过滤。</strong></p>
<p>也就是说，<code>answered</code>、<code>stopped</code>、<code>failed</code>、<code>incomplete</code>、<code>refused</code> 等状态都不会让一轮被排除；取的是数组末尾 6 个 Turn，不是“最近 6 个成功回答”。先截取轮次，再按原顺序组装消息。</p>
<p>完整的 <code>shared/history.ts</code> 如下：</p>
<pre><code class="language-typescript">import type { Turn } from &quot;./chat-state.ts&quot;;
export type TextMessage = { role: &quot;user&quot; | &quot;assistant&quot;; content: string };
export const MAX_HISTORY_TURNS = 6;
export const MAX_HISTORY_CHARS = 24_000;

// 先取最近6轮，不按status过滤；保留问题和已有回答正文。
// 空回答不编造占位消息，notice不冒充助手回答；原始Turn不被修改。
export function buildHistory(turns: readonly Turn[]): TextMessage[] {
  const messages: TextMessage[] = turns
    .slice(-MAX_HISTORY_TURNS)
    .flatMap((turn): TextMessage[] =&gt; {
      const pair: TextMessage[] = [
        { role: &quot;user&quot;, content: turn.question }
      ];
      if (turn.answer.trim()) {
        pair.push({ role: &quot;assistant&quot;, content: turn.answer });
      }
      return pair;
    });
  if (messages.reduce((sum, m) =&gt; sum + m.content.length, 0) &gt; MAX_HISTORY_CHARS) {
    throw new Error(&quot;最近6轮历史超过长度保护上限；记录未删除，请开始新会话或接入第11篇的预算管理。&quot;);
  }
  return messages;
}
</code></pre>
<p>假设已有 8 轮，第 3～8 轮中有正常回答、停止和失败的草稿，下一次请求仍选择<strong>第 3～8 轮</strong>。如果这 6 轮都有回答正文，就是 <strong>6 轮、12 条历史消息</strong>；第 1～2 轮只是不进入本次请求，仍保留在界面中。当前问题随后另加一次。</p>
<p><strong>不按状态过滤，不等于凭空补出一个回答。</strong> 某轮尚未收到任何助手正文时，保留它的用户问题，不添加空的助手消息；例如“请用 TypeScript”之后网络立即失败，这句用户要求仍能在最近 6 轮内带入。代码只用 <code>trim()</code> 判断是否有内容，实际发送原文，不截断或改写已有答案。</p>
<p><code>notice</code> 是超时、断线等界面说明，不当作助手答案发送。模型返回的实际拒绝文字则保存到 <code>answer</code>，与其他状态的正文一样参与窗口选择，不因为拒绝状态被丢掉。</p>
<p><strong>带入草稿，不等于把它认证为完整或正确。</strong> 停止、失败、截断的回答可以保留已收到的部分；页面上的状态标签不变。本课的纯文本投影只发送 <code>role</code> 和 <code>content</code>，并不会把 <code>status</code> 自动传给模型；需要模型明确知道草稿状态时，应另行设计状态说明，而不是假设模型能看见 UI 标签。</p>
<p>本课仍有 24,000 字符的历史保护和 128 KiB 请求体保护。选出的最近 6 轮仍然超长，就明确报错，不进一步偷偷缩短正文或删除界面记录。字符保护不是模型 Token 预算，实际调用仍需按第 11 篇检查完整请求与输出预留。</p>
<p>这个窗口也有代价：第 1 轮的重要条件可能在第 7 轮以后不再被发送。长期偏好、关键约束和任务依赖仍需要第 10、11 篇介绍的记忆与预算方案。本课实现的是“选择最近 6 轮的可见文本”，不是完整推理状态或工具调用回放，也不是自动断点续写。</p>
<h2>六、发送顺序：先拍快照，再加新气泡</h2>
<p>这一轮最容易多发或漏发的，其实是当前问题。</p>
<p>本篇使用以下顺序：</p>
<pre><code class="language-typescript">// 发送流程的核心片段；完整实现见 src/App.tsx。
const history = buildHistory(state.turns);
const request = {
  conversationId: state.conversationId,
  turnId: crypto.randomUUID(), // 新问题才创建；重试使用已有 Turn.id
  question: question.trim(),
  history
};

// 接着创建用户气泡与助手占位，再发出 request。
// 后端给模型组装：history + 当前 question，当前问题只加一次。
</code></pre>
<p>不要先更新 React 状态，再假设当前函数里的 <code>state</code> 已同步变新。React 状态是这次渲染的快照，调用更新函数不会立刻替换已经运行中的变量。<a href="#source-4">[4]</a></p>
<p>后端收到请求后，还要重新检查字段、长度和消息顺序：最多 6 个用户问题，每个问题后可以有一条助手正文。某轮没有回答时，允许两个用户消息相邻，不再强制每轮都凑成一对。本课不接受客户端塞入 <code>system</code> 或 <code>developer</code> 角色；应用指令由后端设置。</p>
<p><strong>但检查角色不等于证明历史真实。</strong> 浏览器送来的历史仍可以被修改；本课仅作本机学习实验。正式产品应根据已认证的用户身份，在可信后端读取其有权访问的会话，不能把客户端的 <code>conversationId</code> 当权限凭证。</p>
<p><strong>真实模型接口的边界：</strong> 本课传的是可见的纯文本问答投影，不是完整的服务商响应回放。涉及推理项、工具调用、图片或助手 <code>phase</code> 时，不能只存两段字符串；应保留接口要求的输出项，或使用相应服务端会话机制。本例也没有同时使用 <code>previous_response_id</code>，避免把两种历史组装方法混在一起。<a href="#source-1">[1]</a><a href="#source-6">[6]</a></p>
<h2>七、重新回答：同一个 Turn，重新走一遍状态</h2>
<p>用户点击“重新回答这一题”，本篇保留原问题和 <code>Turn.id</code>，清空旧草稿与提示，让 <code>status</code> 回到 <code>waiting</code>，并为新网络请求创建一个新的控制器。</p>
<pre><code class="language-text">同一轮 T7：streaming → stopped → waiting → streaming → answered

Turn.id：一直是 T7
请求 A：已取消，旧回调不能进入更新入口
请求 B：新控制器，负责这次重新生成
</code></pre>
<p>这里没有给 Turn 换 ID，也没有新增 <code>runId</code>。下面是通过状态检查后重置这一轮的核心操作：</p>
<pre><code class="language-typescript">const nextTurn = {
  ...turn,
  answer: &quot;&quot;,
  notice: &quot;&quot;,
  status: &quot;waiting&quot; as const
};
</code></pre>
<p>为什么重试时用“这一轮之前的历史”？为了让原问题只作为当前问题出现一次，也避免把被重试的草稿当成正式回答。此前历史仍按相同规则取最近 6 轮，不按状态筛选。被重试的这一轮不同时放进历史，原问题只作为当前问题发送一次。</p>
<p>为了让规则简单，本课仍只允许重试<strong>最后一轮</strong>的停止、失败或截断结果。不会自动重试拒绝，也不覆盖已有 <code>answered</code> 成功答案；保留多个回答版本或回到更早一轮重写，属于另外的产品功能。</p>
<p><strong>重新生成不是断点续传。</strong> 它会发起新请求；真实模式下可能再次计费，不承诺接着旧答案的某个字继续。</p>
<h2>八、停止与新会话：先作废控制器，再处理状态</h2>
<p>点击停止，本篇先把 <code>active.current</code> 清空，再把对应 Turn 变成 <code>stopped</code>，最后取消旧请求。先作废所有权，是为了让旧请求接下来的错误和清理回调知道：自己已经不再是当前请求。</p>
<p>点击“新会话”，先走同样的取消逻辑，再换一个 <code>conversationId</code> 并清空当前界面。普通重试不换会话，也不换 Turn；只有真正开始新会话才重置这些记录。</p>
<p>每次新请求使用新控制器，因为一个已经中止的 signal 不能重新用于下一次正常请求。<a href="#source-5">[5]</a> 新建控制器不等于为业务记录增加一层编号。</p>
<p>配套实现还在 <code>finally</code> 中检查归属，下面是清理片段：</p>
<pre><code class="language-typescript">finally {
  clearTimeout(pending.timer); // 只清理本次请求自己的计时器
  if (ownsController(active.current, controller)) {
    active.current = null;
  }
}
</code></pre>
<p><strong>A 的旧 <code>finally</code> 不能把 B 的控制器清掉。</strong> 即使 A、B 对应同一个 Turn，这个对象比较仍然能把它们区分开。</p>
<p>本篇只允许一个前台请求进行中，没有做多个会话并行生成。新会话是“开始一场新的聊天”，不是把旧聊天放进后台继续运行。</p>
<h2>九、先做四个实验，看看它到底“记住”了什么</h2>
<p><strong>实验一：前一句真的发出去了吗？</strong> 用默认模拟模式先说“我叫小陈”，再问“我叫什么？”。第二次应显示“小陈”，并报告收到了 1 轮历史。展开页面的“最近一次实际请求”，检查 <code>history</code>，不要只凭回答像记得就算验收。</p>
<p>模拟助手通过固定规则读取名字，<strong>没有调用大模型，不代表获得了通用记忆能力</strong>。</p>
<p><strong>实验二：不同状态的回答有没有保留？</strong> 切换到“流中错误”，发送一个问题。失败后切回正常，再发新问题；只要失败轮次仍在最近 6 轮内，它的用户问题和已有回答就应该进入历史。错误提示不混进正文；如果失败前还没有正文，就只带用户问题。再试一次“拒绝”场景，检查实际拒绝文字也没有被筛掉。</p>
<p><strong>实验三：旧请求会不会污染新回答？</strong> 生成过程中停止，再点击“重新回答这一题”。问答数量不增加，<code>Turn.id</code> 和 React key 都不变；新请求使用新控制器。配套阅读页可以注入旧请求的增量、结束、报错和清理，观察它们被忽略，而不是等网络碰巧触发竞态。</p>
<p><strong>实验四：窗口是否真的按最近 6 轮计算？</strong> 依次产生 8 轮，其中混入停止、失败和拒绝，再检查下一次请求：应选择第 3～8 轮，不因为状态不同跳过某轮，也不回头补入更早的成功轮次。6 轮都有正文时有 12 条历史消息；某轮没有正文则少一条助手消息，窗口仍然只算 6 个 Turn。界面保留全部 8 轮。</p>
<p>配套工程是独立的第 16 篇项目。解压后进入 <code>project</code>，使用 Node.js 22.12 或更新版本，在终端 A 运行：</p>
<pre><code class="language-bash">npm install
cp .env.example .env
npm run server
</code></pre>
<p>终端 B 在同一目录运行：</p>
<pre><code class="language-bash">npm run dev
</code></pre>
<p>打开 <code>http://127.0.0.1:5173</code>。先关闭上一课占用同一端口的服务；PowerShell 用 <code>Copy-Item .env.example .env</code> 复制配置。</p>
<p>默认 <code>MODE=mock</code>。真实模式仍需在后端配置密钥、账号可用且支持该接口的模型，以及 <code>MODE=live</code>；不要把密钥移到带 <code>VITE_</code> 前缀的客户端变量中。<a href="#source-7">[7]</a></p>
<p>这个项目没有数据库、鉴权和用户级限流，不应直接开放为公共服务。真正上线还要补消息真实性、权限、Token 预算及并发控制。</p>
<h2>十、课后测验：固定 ID 后，谁能更新回答？</h2>
<h3>1. 屏幕有历史气泡，模型就知道上一轮吗？</h3>
<p>A. 知道，React 会自动同步。<br />
B. 不一定，要看请求或会话机制实际提供了什么。<br />
C. 只要用 SSE 就知道。</p>
<h3>2. 停止后重新回答，本版应该怎么处理？</h3>
<p>A. 保持 Turn.id 不变，重置 status 并新建控制器。<br />
B. 更换 Turn.id，才允许重试。<br />
C. 重用已经取消的控制器。</p>
<h3>3. 旧请求的 end 比新请求晚到，怎么办？</h3>
<p>A. 它是结束事件，必须覆盖当前回答。<br />
B. 哪条长就用哪条。<br />
C. 在回调入口检查当前控制器，不匹配就忽略。</p>
<h3>4. 有8轮且包含停止、失败的回答，本版如何组装历史？</h3>
<p>A. 筛选 answered 后再取最近6轮。<br />
B. 直接取第3～8轮，保留用户问题和已有回答，不按状态过滤。<br />
C. 无论长短都发送全部8轮。</p>
<p><strong>答案：1B、2A、3C、4B。</strong> 历史要实际送达；重试保持固定 ID；状态驱动界面、控制器隔离旧回调；最近6轮按原顺序保留，不按状态过滤。</p>
<p><strong>动手练习：</strong> 检查“旧请求报错晚到”“旧 finally 不能清掉新控制器”“已经完成后再收到 delta”“8轮混合状态历史只选第3～8轮”四种情况。不要只测 reducer；网络入口的控制器检查也要测试。测试不能只断言状态，还要断言 ID、问答数量和新回答正文未被旧事件修改。</p>
<h2>十一、学习疑问与解答</h2>
<p><strong>Q1：为什么不再需要 runId，也不用重建 Turn.id？</strong><br />
本课只允许一个前台请求，重试仍属于原问答。固定 Turn.id 定位消息，status 管状态，当前控制器检查旧回调；没有必要再把生成编号存到业务记录里。</p>
<p><strong>Q2：只靠 status，连控制器检查也不要，行吗？</strong><br />
本版不这样实现。同一个 Turn 在重试前后都可能处于 streaming，仅看状态区分不了新旧回调。控制器归属检查很小，但不能在允许立即重试的流程里随意删除。</p>
<p><strong>Q3：保留所有状态，是不是发送整个会话？</strong><br />
不是。界面保留全部记录；请求只取最近6个Turn，不使用answered过滤。每轮保留用户问题和已有回答；尚无回答时只加入用户问题，不拿错误提示冒充正文。</p>
<p><strong>Q4：最近6轮仍然太长怎么办？</strong><br />
完整记录不删；本课达到长度保护时明确拒绝发送，不再偷偷减少轮次或截断某份答案。正式项目结合第11篇做Token预算、摘要或检索。</p>
<p><strong>Q5：这些检查能保证后台只生成一次吗？</strong><br />
不能。它们主要防止前端串话。后端幂等、重复提交、多标签页并发和持久化需要另外设计；Turn.id 和控制器都不是权限凭证或后端锁。</p>
<p><strong>Q6：停止的草稿与刷新后丢失的记录怎么处理？</strong><br />
停止的草稿留在页面，带未完成状态；仍处在最近6轮内时，它的已有正文也会进入历史。本篇只保存浏览器内存，刷新后清空；下一篇再讨论数据库和恢复。</p>
<hr />
<h2>本篇只带走这一句话</h2>
<blockquote>
<p><strong>固定 Turn.id，status 驱动状态；控制器挡住旧请求；历史取最近6轮，保留所有状态的已有回答。</strong></p>
</blockquote>
<p>第 16 篇结束。进度：<strong>16 / 40 篇，40%</strong>。下一篇：会话与消息持久化——刷新之后，聊天还在。</p>
<h2>资料依据</h2>
<p>本文的状态名称、固定ID方案、最近6轮、不按状态过滤的历史策略、长度保护和模拟名字问答都是教学设计，不是服务商统一规定。官方资料核对日期：2026-10-26。</p>
<p><a href="#source-1" id="source-1">[1]</a> OpenAI：Conversation state。https://developers.openai.com/api/docs/guides/conversation-state<br/>
<a href="#source-2" id="source-2">[2]</a> React：Rendering Lists。https://react.dev/learn/rendering-lists<br/>
<a href="#source-3" id="source-3">[3]</a> React：useReducer；Updating Arrays in State。https://react.dev/reference/react/useReducer ，https://react.dev/learn/updating-arrays-in-state<br/>
<a href="#source-4" id="source-4">[4]</a> React：useState — state as a snapshot。https://react.dev/reference/react/useState<br/>
<a href="#source-5" id="source-5">[5]</a> MDN：AbortSignal。https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal<br/>
<a href="#source-6" id="source-6">[6]</a> OpenAI：Create a model response。https://developers.openai.com/api/reference/resources/responses/methods/create<br/>
<a href="#source-7" id="source-7">[7]</a> OpenAI：API key safety。https://help.openai.com/en/articles/5112595-best-practices-for-api-key-safety</p>
<p><a href="#source-8">[8]</a> React：useRef。https://react.dev/reference/react/useRef</p>
`,B=[{q:"屏幕有历史气泡，模型就知道上一轮吗？",options:["知道，React 会自动同步。","不一定，要看请求或会话机制实际提供了什么。","只要用 SSE 就知道。"],answer:1,why:"界面记录与模型实际收到的输入是两回事。"},{q:"停止后重新回答，本版应该怎么处理？",options:["保持 Turn.id 不变，重置 status 并新建控制器。","更换 Turn.id，才允许重试。","重用已经取消的控制器。"],answer:0,why:"问答身份固定；新请求使用新控制器，不额外生成 runId。"},{q:"旧请求的 end 比新请求晚到，怎么办？",options:["它是结束事件，必须覆盖当前回答。","哪条长就用哪条。","在回调入口检查当前控制器，不匹配就忽略。"],answer:2,why:"固定 Turn.id 和相同 status 无法区分新旧请求；网络回调先核对控制器。"},{q:"有8轮且包含停止、失败的回答，本版如何组装历史？",options:["筛选answered后再取最近6轮。","直接取第3～8轮，保留用户问题和已有回答，不按状态过滤。","无论长短都发送全部8轮。"],answer:1,why:"先按Turn选最近6轮，不按status过滤；空回答只保留用户问题，界面中的8轮记录不被删除。"}],x=n=>n==="waiting"||n==="streaming",E=n=>["stopped","failed","incomplete"].includes(n),X={waiting:"等待首段",streaming:"生成中 · 草稿",answered:"生成完成 · 非事实认证",stopped:"已停止 · 草稿",failed:"失败 · 草稿",incomplete:"未完整结束 · 草稿",refused:"拒绝"};function Y(n,e){if(n.conversationId!==e.conversationId)return n;const c=n.turns.findIndex(r=>r.id===e.turnId),t=n.turns[c];if(!t||!x(t.status))return n;let i;return e.type==="delta"?i={...t,answer:t.answer+e.text,status:"streaming"}:e.type==="end"?i=e.status==="incomplete"?{...t,status:"incomplete",notice:e.text}:{...t,answer:e.text,status:e.status,notice:""}:i={...t,status:e.status,notice:e.notice},{...n,turns:n.turns.map((r,p)=>p===c?i:r)}}function V(n,e){if(e.type==="reset")return{conversationId:e.conversationId,turns:[]};if(e.conversationId!==n.conversationId)return n;if(e.type==="start")return n.turns.some(c=>x(c.status)||c.id===e.turn.id)||e.turn.status!=="waiting"||!e.turn.question.trim()?n:{...n,turns:[...n.turns,{...e.turn}]};if(e.type==="retry"){const c=n.turns.at(-1);return!c||c.id!==e.turnId||!E(c.status)||n.turns.some(t=>x(t.status))?n:{...n,turns:n.turns.map(t=>t.id===c.id?{...t,answer:"",notice:"",status:"waiting"}:t)}}return Y(n,e)}function $(n,e){return(n==null?void 0:n.controller)===e}function D(){return{chat:{conversationId:"demo-c1",turns:[]},epoch:1,active:null,old:null,logs:[]}}function F(n,e){const c=n.chat.turns.at(-1);let t=n.chat,i=n.epoch,r=n.active,p=n.old,h="忽略：当前状态不允许这个操作";const v=u=>{const l=V(t,u);h=l===t?"忽略：目标或状态不匹配":"已应用",t=l},C=(u,l)=>{if(!$(r,u.controller)||u.controller.signal.aborted){h="忽略：旧控制器的回调无效，固定 Turn.id 不变";return}v(l)};if(e==="sample"){r&&(p=r,r=null,p.controller.abort()),i++;const u=["answered","answered","stopped","failed","incomplete","refused","answered","failed"];t={conversationId:"demo-c"+i,turns:u.map((l,w)=>({id:"T"+(w+1),question:"第"+(w+1)+"轮问题",status:l,answer:w===7?"":"第"+(w+1)+"轮已有回答",notice:l==="failed"?"模拟网络错误（不发给模型）":""}))},h="已载入8轮混合状态；窗口选择第3～8轮，第8轮无助手正文，仅带用户问题"}else if(e==="start"&&!r&&!t.turns.some(u=>x(u.status))){const u="T"+(t.turns.length+1);r={conversationId:t.conversationId,turnId:u,controller:new AbortController},v({type:"start",conversationId:t.conversationId,turn:{id:u,question:t.turns.length===0?"我叫小陈":"我叫什么？",answer:"",status:"waiting",notice:""}})}else if(e==="new")r&&(p=r,r=null,p.controller.abort()),i++,v({type:"reset",conversationId:"demo-c"+i});else if(e==="retry"&&c&&!r&&E(c.status))v({type:"retry",conversationId:t.conversationId,turnId:c.id}),r={conversationId:t.conversationId,turnId:c.id,controller:new AbortController};else if(e==="stop"&&r){const u=r;r=null,p=u,v({type:"interrupt",conversationId:u.conversationId,turnId:u.turnId,status:"stopped",notice:"保留草稿，最近6轮内仍可进入模型历史。"}),u.controller.abort()}else if(e.startsWith("late")&&p){const u={conversationId:p.conversationId,turnId:p.turnId};if(e==="lateFinally")$(r,p.controller)&&(r=null),h="旧 finally 只清理自己的资源，未清掉当前控制器";else{const l=e==="lateDelta"?{type:"delta",...u,text:"【旧请求尾巴】"}:e==="lateEnd"?{type:"end",...u,status:"answered",text:"【旧请求最终结果】"}:{type:"interrupt",...u,status:"failed",notice:"【旧请求报错】"};C(p,l)}}else if(r&&(e==="delta"||e==="complete")){const u={conversationId:r.conversationId,turnId:r.turnId};C(r,e==="delta"?{type:"delta",...u,text:"本次回答的一段。"}:{type:"end",...u,status:"answered",text:"【固定演示】你好，小陈！"}),e==="complete"&&(r=null)}return{chat:t,epoch:i,active:r,old:p,logs:[`${e} → ${h}`,...n.logs].slice(0,12)}}const j=6,J=24e3;function W(n){const e=n.slice(-j).flatMap(c=>{const t=[{role:"user",content:c.question}];return c.answer.trim()&&t.push({role:"assistant",content:c.answer}),t});if(e.reduce((c,t)=>c+t.content.length,0)>J)throw new Error("最近6轮历史超过长度保护上限；记录未删除，请开始新会话或接入第11篇的预算管理。");return e}const z={class:"lesson16"},K=["innerHTML"],G={role:"status"},Z={class:"supplement"},ee=s("h2",null,"配套实验：让旧请求迟到一次",-1),te=s("p",{class:"small"},"本地状态实验，复用固定 Turn.id、status 和控制器检查；不发送网络请求，不调用模型。先开始、接收一段、停止、重试，再注入旧事件。",-1),ne={class:"actions"},oe=["disabled"],se=["disabled"],re=["disabled"],ae=["disabled"],ce=["disabled"],ue=["disabled"],de=["disabled"],ie=["disabled"],le=["disabled"],pe={class:"readout"},ge={class:"terminal"},he={class:"answer"},ve={key:0},fe=s("h3",null,"事件处理记录",-1),me={class:"eventlog","aria-live":"polite"},be=s("h3",null,"界面记录（全部保留）",-1),ye={class:"eventlog"},qe=s("h3",null,"下一次请求可携带的历史",-1),we={class:"small"},_e=s("h2",null,"四道选择题",-1),Te=["name","checked","onChange"],Ie={key:0,class:"feedback"},xe={class:"actions"},Ce=["disabled"],Se={key:0,class:"score",role:"status"},ke=H({__name:"MultiTurnLesson",setup(n){const e=k(null),c=k(""),t=N(D()),i=T(()=>t.value.chat.turns.at(-1)),r=T(()=>i.value?x(i.value.status):!1),p=T(()=>{try{return JSON.stringify(W(t.value.chat.turns),null,2)}catch(g){return g instanceof Error?g.message:"历史组装失败"}}),h=k([]),v=k(!1),C=T(()=>B.every((g,o)=>h.value[o]!==void 0)),u=T(()=>B.filter((g,o)=>h.value[o]===g.answer).length);function l(g){t.value=F(t.value,g)}function w(g,o){h.value[g]=o,v.value=!1}return U(()=>{var g;return(g=e.value)==null?void 0:g.querySelectorAll("pre").forEach(o=>{const b=document.createElement("div");b.className="code-tools",b.dataset.ui="true";const y=document.createElement("button");y.type="button",y.textContent="复制代码",y.onclick=async()=>{var a;try{await navigator.clipboard.writeText(((a=o.querySelector("code"))==null?void 0:a.textContent)??""),c.value="代码已复制"}catch{c.value="复制未成功，请手动选择代码"}};const q=document.createElement("button");q.type="button",q.textContent="切换换行",q.onclick=()=>{o.classList.toggle("wrap")},b.append(y,q),o.before(b)})}),(g,o)=>{var b,y,q;return f(),m("article",z,[s("div",{ref_key:"article",ref:e,class:"original",innerHTML:I(Q)},null,8,K),s("p",G,d(c.value),1),s("section",Z,[ee,te,s("div",ne,[s("button",{disabled:r.value,onClick:o[0]||(o[0]=a=>l("start"))},"开始一轮",8,oe),s("button",{disabled:!r.value,onClick:o[1]||(o[1]=a=>l("delta"))},"收到一段文字",8,se),s("button",{disabled:!r.value,onClick:o[2]||(o[2]=a=>l("stop"))},"停止当前生成",8,re),s("button",{disabled:!i.value||!I(E)(i.value.status),onClick:o[3]||(o[3]=a=>l("retry"))},"重新回答",8,ae),s("button",{disabled:!t.value.old,onClick:o[4]||(o[4]=a=>l("lateDelta"))},"注入旧请求增量",8,ce),s("button",{disabled:!t.value.old,onClick:o[5]||(o[5]=a=>l("lateEnd"))},"注入旧请求结束",8,ue),s("button",{disabled:!t.value.old,onClick:o[6]||(o[6]=a=>l("lateError"))},"注入旧请求报错",8,de),s("button",{disabled:!t.value.old,onClick:o[7]||(o[7]=a=>l("lateFinally"))},"执行旧请求清理",8,ie),s("button",{disabled:!r.value,onClick:o[8]||(o[8]=a=>l("complete"))},"完成当前回答",8,le),s("button",{onClick:o[9]||(o[9]=a=>l("new"))},"新会话"),s("button",{onClick:o[10]||(o[10]=a=>l("sample"))},"载入8轮混合状态"),s("button",{onClick:o[11]||(o[11]=a=>t.value=I(D)())},"重置实验")]),s("div",pe,[s("p",null,"会话："+d(t.value.chat.conversationId)+" · 轮次："+d(((b=i.value)==null?void 0:b.id)??"—")+" · 当前请求："+d(t.value.active?"有效控制器":"无"),1),s("p",ge,d(i.value?I(X)[i.value.status]:"尚未开始"),1),s("div",he,d(((y=i.value)==null?void 0:y.answer)||"（尚无正文）"),1),(q=i.value)!=null&&q.notice?(f(),m("p",ve,d(i.value.notice),1)):A("",!0)]),fe,s("div",me,d(t.value.logs.join(`
`)||"等待操作"),1),be,s("div",ye,[(f(!0),m(R,null,M(t.value.chat.turns,a=>(f(),m("div",{key:a.id},d(a.id)+" · "+d(a.status)+" · "+d(a.question)+" → "+d(a.answer||"（无助手正文）"),1))),128))]),qe,s("pre",null,[s("code",null,d(p.value),1)]),s("p",we,"界面共 "+d(t.value.chat.turns.length)+" 轮；本次选择最近 "+d(Math.min(6,t.value.chat.turns.length))+" 轮。这是本课的文本投影，不是完整服务商响应回放。历史取最近6轮，不按状态过滤；用户问题与已有正文按原顺序保留，空回答不添加占位消息。界面仍保留全部记录。",1),_e,(f(!0),m(R,null,M(I(B),(a,_)=>(f(),m("fieldset",{key:_},[s("legend",null,d(_+1)+". "+d(a.q),1),(f(!0),m(R,null,M(a.options,(O,S)=>(f(),m("label",{key:S,class:"option"},[s("input",{type:"radio",name:"l16-q-"+_,checked:h.value[_]===S,onChange:Re=>w(_,S)},null,40,Te),L(d(String.fromCharCode(65+S))+". "+d(O),1)]))),128)),v.value?(f(),m("p",Ie,d(h.value[_]===a.answer?"✓ 正确。":"再想想。")+"答案："+d(String.fromCharCode(65+a.answer))+"。"+d(a.why),1)):A("",!0)]))),128)),s("div",xe,[s("button",{disabled:!C.value,onClick:o[12]||(o[12]=a=>v.value=!0)},"提交评分",8,Ce),s("button",{onClick:o[13]||(o[13]=a=>{h.value=[],v.value=!1})},"重新作答")]),v.value?(f(),m("p",Se,"得分："+d(u.value)+" / 4",1)):A("",!0)])])}}}),Be=JSON.parse('{"title":"16 · 消息状态与多轮会话","description":"","frontmatter":{"title":"16 · 消息状态与多轮会话","readingTime":"15–20","outline":false},"headers":[],"relativePath":"guide/ai/chatbot-course/16-multiturn-message-state.md","filePath":"guide/ai/chatbot-course/16-multiturn-message-state.md","lastUpdated":1793118415000}'),Ae={name:"guide/ai/chatbot-course/16-multiturn-message-state.md"},Ee=Object.assign(Ae,{setup(n){return(e,c)=>(f(),m("div",null,[P(ke)]))}});export{Be as __pageData,Ee as default};
