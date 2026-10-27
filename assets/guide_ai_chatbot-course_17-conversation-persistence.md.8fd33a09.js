import{d as Q,h as r,g as w,j as B,O as G,o as d,c,k as n,l as f,t,F as A,D as U,e as b,a as j,H}from"./chunks/framework.ac6a668e.js";const F=`<h1>📘 第 17 篇：刷新一下，聊天怎么没了？——会话与消息持久化</h1>
<p><strong>《AI 聊天机器人学习教程》｜第 17 / 40 篇</strong><br />
<strong>第三阶段：聊天机器人工程开发｜阅读约 15–20 分钟｜React + TypeScript + Node.js + SQLite</strong></p>
<p>第 16 篇，我们终于解决了一个让人头疼的问题：每轮问答都有固定的 <code>Turn.id</code>，流式内容更新自己的气泡，停止和重新回答也不会被旧请求串话。</p>
<p>于是你满意地按了浏览器刷新键。</p>
<p><strong>聊天记录，全没了。</strong></p>
<p>不是模型健忘，而是上节的消息只住在 React 内存里。今天要给聊天记录一个真正的住处：<strong>数据库</strong>。</p>
<p>学完本篇，你可以完成：创建会话、写入用户问题、前端批量保存回答、刷新后恢复历史、停止与重试保留状态，以及删除会话。配套工程使用<strong>模拟 SSE</strong>，不调用收费模型；数据库和恢复逻辑才是本篇的主角。</p>
<hr />
<h2>一、先纠正一个误会：显示在屏幕上，不等于已经保存</h2>
<p>假设用户刚刚发出：</p>
<blockquote>
<p>用户：帮我解释一下闭包。<br />
AI：闭包可以理解为……</p>
</blockquote>
<p>React 里有 <code>turns</code>，不代表服务器知道这句话；服务器收到了，不代表数据已写入磁盘；数据写到了磁盘，也不代表这轮回答已经完整结束。</p>
<p>要把这三层分开：</p>
<table>
<thead>
<tr>
<th>层次</th>
<th>主要职责</th>
<th>刷新之后</th>
</tr>
</thead>
<tbody>
<tr>
<td>React 状态</td>
<td>当前气泡、草稿、按钮状态</td>
<td>内存会重建</td>
</tr>
<tr>
<td>Node.js 接口</td>
<td>校验、转发、决定业务状态</td>
<td>进程重启会丢失内存变量</td>
</tr>
<tr>
<td>数据库</td>
<td>保存会话、消息、状态和顺序</td>
<td>文件/数据库仍在时可重新读取</td>
</tr>
</tbody>
</table>
<p><strong>一句话：页面是显示器，数据库才是记录本。</strong></p>
<p>第 10 篇的“长期记忆”又是另一回事：数据库保存了每条聊天，模型也不会自动读到它。模型这次能看见哪些历史，仍需要应用在发送前组织上下文。</p>
<h2>二、保存什么？先把 Conversation 和 Turn 区分开</h2>
<p>继续沿用第 16 篇的结构，但这次把会话也放进数据库。</p>
<pre><code class="language-typescript">// 一场会话
interface Conversation {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

type Status =
  | &quot;waiting&quot; | &quot;streaming&quot; | &quot;answered&quot;
  | &quot;refused&quot; | &quot;incomplete&quot; | &quot;stopped&quot; | &quot;failed&quot;;

// 一轮问答，问题和回答一起保存
interface Turn {
  id: string;              // 重试时不改变
  conversationId: string;  // 属于哪场会话
  question: string;
  answer: string;          // 流式中的草稿也可以存在这里
  status: Status;
  notice: string;          // 错误提示，不冒充回答正文
  revision: number;        // 防止旧版本覆盖新版本
  createdAt: string;
  updatedAt: string;
}
</code></pre>
<p>**这里不额外保存 <code>position</code>。**按 <code>createdAt</code> 升序显示历史；如果创建时间完全相同，再按 <code>id</code> 做稳定排序。这样不受重试后 <code>updatedAt</code> 变化的影响。注意 <code>id</code> 排序并不一定等于同一毫秒内真实插入先后；如果未来需要严格事件顺序，再设计单调序号。</p>
<p>为什么需要 <code>revision</code>？因为后台的旧写入可能在新写入之后到达。它是数据库层面的版本检查；旧网络回调仍要沿用第 16 篇的 <code>AbortController</code> 归属检查。<strong>状态表示进度，ID 表示身份，revision 表示保存版本。</strong></p>
<h2>三、谁负责保存聊天？本篇改为“前端主动写入”</h2>
<p>先给出本篇采用的、与你想法一致的架构：</p>
<blockquote>
<p><strong>前端负责用户操作、接收 SSE 和保存回答快照；后端负责生成、校验写入请求、操作 SQLite，以及断线状态兜底。</strong></p>
</blockquote>
<p>这是一种合理的教学与产品实现选择，并不存在“只有后端保存 AI 答案才是正确”的规定。它的优势是保存时机清晰、前端可以控制草稿同步；代价是浏览器需要承担更多的并发管理和失败补偿工作。</p>
<table>
<thead>
<tr>
<th>场景</th>
<th>前端操作</th>
<th>Node.js / SQLite 行为</th>
</tr>
</thead>
<tbody>
<tr>
<td>新建会话</td>
<td><code>POST /api/conversations</code></td>
<td>验证身份、创建 Conversation</td>
</tr>
<tr>
<td>打开历史</td>
<td><code>GET /api/conversations/:id</code></td>
<td>返回按 <code>createdAt,id</code> 排序的 Turns</td>
</tr>
<tr>
<td>发送问题</td>
<td><code>POST /api/conversations/:id/turns</code></td>
<td>先插入 <code>waiting</code>，然后返回 SSE</td>
</tr>
<tr>
<td>AI 流式生成</td>
<td>接收 <code>delta</code>，立刻更新气泡</td>
<td>后端只生成并向 SSE 推送，不逐段保存 AI 正文</td>
</tr>
<tr>
<td>保存草稿</td>
<td>前端按 <strong>800ms 或累计 2KiB</strong> 调用 <code>PUT /api/conversations/:id/turns/:turnId</code></td>
<td>后端验证身份、状态与版本，保存<strong>完整草稿快照</strong></td>
</tr>
<tr>
<td>正常完成</td>
<td>收到 <code>end</code> 后再发最后一个 <code>PUT</code>，等待成功才显示 <code>answered</code></td>
<td>接受最终正文和状态，成功写入后返回新 revision</td>
</tr>
<tr>
<td>主动停止</td>
<td><strong>先保存已收到的草稿</strong>，再 <code>POST /stop</code></td>
<td>中止生成，保留已有数据库正文并标 <code>stopped</code></td>
</tr>
<tr>
<td>意外断线</td>
<td>浏览器停止发送增量与 PUT</td>
<td>服务端中止当前生成、将最近已保存的正文标为 <code>incomplete</code></td>
</tr>
<tr>
<td>重新回答</td>
<td><code>POST /retry</code></td>
<td>复用固定 <code>Turn.id</code>、清空旧正文、开始新流</td>
</tr>
<tr>
<td>修改标题或删除会话</td>
<td><code>PATCH</code> / <code>DELETE</code></td>
<td>由后端鉴权后执行</td>
</tr>
</tbody>
</table>
<h3>3.1 完整的前后端时序</h3>
<pre><code class="language-text">React（发起和保存）        Node.js（生成/鉴权）        SQLite
      │ POST /turns             │                    │
      ├────────────────────────→│ INSERT waiting ────→│
      │←──────── SSE meta ──────┤                    │
      │←──────── SSE delta ① ───┤                    │
      │    立即显示草稿          │                    │
      │←──────── SSE delta ② ───┤                    │
      │   到 800ms / 2KiB       │                    │
      │ PUT {answer,revision,   │                    │
      │     status:streaming}   │                    │
      ├────────────────────────→│ 验证并 UPDATE ─────→│
      │←─ 200 {revision + 1} ──┤                    │
      │←──────── SSE end ───────┤                    │
      │ PUT {answer:完整正文,   │                    │
      │     status:answered}    │                    │
      ├────────────────────────→│ 验证并 UPDATE ─────→│
      │←───── 200 OK ──────────┤                    │
      │ UI 展示回答已保存完成    │                    │
</code></pre>
<p>这里要纠正一个常见误会：<strong>SSE <code>end</code> 只表示模型生成完成，不表示数据库已保存完成</strong>。在这个设计里，前端还必须等待最终 <code>PUT</code> 成功。如果保存失败，UI 应显示保存失败或待确认，不能假装已经持久化。</p>
<h3>3.2 这种设计的问题，怎么面对？</h3>
<p>假如用户在 800ms 检查点之前刷新，后端数据库可能只有 <code>waiting</code> 或上一段草稿。<strong>最新几个已经出现在屏幕上的字可能丢失</strong>。这不是设计失效，而是需要事先明确的取舍：</p>
<ul>
<li>想减少写库次数，就接受最多一个检查点区间的正常崩溃/刷新损失。</li>
<li>想进一步降低损失，可以缩短间隔或让客户端保存到 IndexedDB 作为额外本地兜底，但仍不能保证 HTTP 请求一定送达服务器。</li>
<li>生产系统还要处理多个标签页同时保存、浏览器伪造 AI 内容、恶意修改状态、请求重放、取消与后台生成等问题。<strong>服务器不能因为前端传来了 <code>status: answered</code> 就无条件认定内容真由模型生成。</strong></li>
</ul>
<p>配套项目是<strong>仅监听 <code>127.0.0.1</code>、固定演示用户</strong>的教学工程：后端验证会话归属、乐观锁及状态流转，但没有用服务器签发的生成凭证验证每个字的来源，<strong>不能直接放到公网</strong>。实际生产可用服务端持久化最终结果、签名完成凭证或生成任务校验等方式强化。</p>
<h3>3.3 为什么不能每段 <code>delta</code> 都直接 <code>PUT</code>？</h3>
<p>原因不是不允许前端写，而是<strong>没有必要放大 HTTP 和 SQLite 压力</strong>。比如 200 次增量就发 200 个保存请求，容易增加延迟和竞态。我们将在第六节实现客户端检查点写入器：不丢 SSE 的即时显示，但减少数据库写入。</p>
<h2>四、为什么先选 SQLite？</h2>
<p>为了学习持久化，不必先搭建一个 PostgreSQL 服务。这里使用 SQLite：数据存放在本机文件中；Node.js 内置 <code>node:sqlite</code> 提供 <code>DatabaseSync</code> 与参数化语句。为减少版本差异，推荐 <strong>Node.js 24.15+</strong>；Node 22.16 也能运行本课，但仍可能显示 SQLite/TypeScript 实验特性警告。请以你实际运行的 Node 版本文档为准。</p>
<p>SQL 表结构如下，和配套工程的 <code>server/store.ts</code> 对应：</p>
<pre><code class="language-sql">CREATE TABLE conversations (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE turns (
  id TEXT PRIMARY KEY,
  conversation_id TEXT NOT NULL
    REFERENCES conversations(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL CHECK (
    status IN ('waiting','streaming','answered',
      'refused','incomplete','stopped','failed')
  ),
  notice TEXT NOT NULL DEFAULT '',
  revision INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX idx_turns_by_conversation
  ON turns(conversation_id, created_at, id);
</code></pre>
<p>两张表而不是把整段会话塞进一大块 JSON，有几个好处：单轮更新不用重写整个会话，顺序明确，也容易查询和删除。<code>ON DELETE CASCADE</code> 表示删除会话时，一并删除归属它的 Turns。注意 SQLite 的外键检查需要<strong>每个数据库连接单独开启</strong>。本课在 <code>server/store.ts</code> 创建 <code>DatabaseSync</code> 后执行 <code>db.exec(&quot;PRAGMA foreign_keys = ON&quot;)</code>，可用 <code>PRAGMA foreign_keys</code> 查询返回 <code>1</code> 进行确认。最好在开始事务之前设置。</p>
<p>本课还开启 <code>WAL</code>（预写式日志）模式。它不是“数据库永久不会坏”的开关，也不是可以忽略备份的理由。SQLite 在 WAL 模式下可能有 <code>-wal</code>、<code>-shm</code> 等关联文件，复制或备份时应按 SQLite 的正规方式处理。<a href="https://sqlite.org/wal.html">SQLite 官方说明</a>。</p>
<h2>五、发送问题：React 接收 SSE，准备保存草稿</h2>
<p>先沿用第 16 篇的 <code>Turn.id</code>：服务端创建一次问答，前端后续所有保存请求都针对这同一个 ID，重试时也不换。</p>
<h3>5.1 React 发一次生成请求</h3>
<pre><code class="language-typescript">async function openGeneration(conversationId: string, question: string) {
  const controller = new AbortController();
  const res = await fetch(\`/api/conversations/\${conversationId}/turns\`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question }),
    signal: controller.signal
  });
  if (!res.ok || !res.body) throw new Error('生成请求失败');
  // 把 res.body 交给第 15 篇的 SSE 解码器。
  // meta 获得固定 Turn.id 和 revision；delta 用于立即展示；
  // end 表示生成完毕，但下一步仍要做最终 PUT。
  return { res, controller };
}
</code></pre>
<h3>5.2 Node.js 先把问题写入数据库</h3>
<pre><code class="language-typescript">// server/index.ts 的核心调用
const turn = store.addTurn(userId, conversationId, question);
streamTurn(res, conversationId, turn); // meta、delta、end
</code></pre>
<p><code>addTurn</code> 在数据库事务里插入 <code>waiting</code>，并检查会话属于当前用户。这样即便接下来的模型调用失败，<strong>这次用户提问依然有机会在刷新后恢复</strong>。SSE 只负责告知客户端模型生成进度：</p>
<pre><code class="language-text">event: meta
data: {&quot;turn&quot;:{&quot;id&quot;:&quot;...&quot;,&quot;revision&quot;:0,&quot;status&quot;:&quot;waiting&quot;}}

event: delta
data: {&quot;text&quot;:&quot;闭包&quot;}

event: end
data: {&quot;status&quot;:&quot;answered&quot;}
</code></pre>
<p>事件仅作示意。<code>end</code> 是生成器的状态，不是前端最终保存请求的成功回执。</p>
<h3>5.3 会话标题和删除仍是普通 API</h3>
<p>用户重命名时前端发送：</p>
<pre><code class="language-typescript">await fetch(\`/api/conversations/\${conversationId}\`, {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ title: 'React 学习笔记' })
});
</code></pre>
<p>后端校验所有权、标题长度并更新 <code>conversations.title</code>。这就是“<strong>前端发起业务动作，后端执行可信的数据库操作</strong>”，与 AI 草稿的检查点 PUT 是同一个设计方向。</p>
<h2>六、常见的实践：前端缓冲 SSE，按时间/大小批量 PUT</h2>
<p>这一节是本次更新的重点。以前的演示由 <code>server/draft-writer.ts</code> 在后端累计增量并保存。<strong>现在改成 <code>src/draft-save.ts</code>：前端合并回答，达到检查点时发一次 <code>PUT</code>；后端只接收、校验并更新数据库。</strong></p>
<pre><code class="language-text">SSE delta「你」 → React 显示「你」          → 暂不发 PUT
SSE delta「好」 → React 显示「你好」        → 暂不发 PUT
SSE delta「！」 → React 显示「你好！」      → 暂不发 PUT
约 800ms 到达   → PUT 完整快照「你好！」     → 数据库保存
SSE delta「再见」→ React 显示「你好！再见」 → 暂不发 PUT
SSE end         → PUT 完整快照 + answered  → 等待成功才标完成
</code></pre>
<p>检查点阈值采用 <strong>800ms 或累计新增 2KiB UTF-8 字节（先满足哪个就写一次）</strong>。这是用于教学的调优起点，不是所有应用必须使用的固定数值。请注意：保存的是<strong>整段已有回答快照</strong>，而不是只传新来的 <code>delta</code>。</p>
<h3>6.1 为什么要串行 PUT，还要带 revision？</h3>
<p>假设先后提交：</p>
<pre><code class="language-text">PUT #1: answer=&quot;你好&quot;，revision=0
PUT #2: answer=&quot;你好世界&quot;，revision=0
</code></pre>
<p>如果两个请求并发、第二个先写成功，第一条可能在晚到时覆盖更新。正确做法是：<strong>把写入放进一个 Promise 队列，等 #1 返回新的 revision，#2 才发起；服务端也用 <code>WHERE revision = ?</code> 乐观锁拒绝过期更新。</strong></p>
<p>配套 <code>BrowserDraftWriter</code> 真正做了这件事：</p>
<pre><code class="language-typescript">// src/draft-save.ts 中的核心机制（与配套实现保持一致）
append(delta: string) {
  this.answer += delta;
  this.pendingBytes += new TextEncoder().encode(delta).byteLength;
  if (this.pendingBytes &gt;= this.maxBytes) {
    void this.checkpoint().catch(() =&gt; {});
  } else if (!this.timer) {
    this.timer = setTimeout(() =&gt; {
      this.timer = undefined;
      void this.checkpoint().catch(() =&gt; {});
    }, this.maxDelayMs);
  }
}

checkpoint(status: DraftStatus = 'streaming', notice = '') {
  const snapshot = this.answer;
  // 真实类中还会取消 timer、复位待保存字节数和记录失败。
  this.chain = this.chain.then(async () =&gt; {
    const saved = await this.put({
      answer: snapshot,
      status,
      revision: this.revision,
      notice
    });
    this.revision = saved.revision;
  });
  return this.chain;
}
</code></pre>
<p>上面只摘出核心方法，省略属性声明与去重错误分支；<strong>可复制的完整类在配套工程 <code>src/draft-save.ts</code></strong>。它使用 <code>TextEncoder</code> 计算新增 UTF-8 字节长度，排队串行保存、记录最后一次成功快照，并在写入失败时拒绝宣称已完成。</p>
<h3>6.2 前端 PUT 的真实数据格式</h3>
<pre><code class="language-typescript">async function saveAnswer(
  conversationId: string,
  turnId: string,
  input: { answer: string; status: 'streaming' | 'answered' | 'incomplete';
           notice: string; revision: number }
) {
  const res = await fetch(\`/api/conversations/\${conversationId}/turns/\${turnId}\`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input)
  });
  if (!res.ok) throw new Error(\`草稿保存失败：HTTP \${res.status}\`);
  return (await res.json()).turn as Turn;
}
</code></pre>
<p>这里用完整 <code>answer</code> 替换可编辑的回答快照，<code>question</code>、<code>id</code>、<code>createdAt</code> 不在这条 PUT 里修改。</p>
<p><strong>后端收到 PUT 后，不能直接 <code>UPDATE turns SET answer = ... WHERE id = ?</code>。</strong> 它至少要验证会话所有权、当前状态允许更新、输入长度、正文不得意外回退、以及 <code>revision</code> 匹配：</p>
<pre><code class="language-sql">UPDATE turns
SET answer = ?, status = ?, notice = ?,
    revision = revision + 1, updated_at = ?
WHERE id = ? AND conversation_id = ? AND revision = ?
  AND EXISTS (
    SELECT 1 FROM conversations c
    WHERE c.id = turns.conversation_id AND c.user_id = ?
  );
</code></pre>
<p>更新影响行数不是 1，就按冲突或无权限处理；配套实现位于 <code>server/store.ts</code> 的 <code>saveBrowserDraft</code> / <code>update</code>。</p>
<h3>6.3 结束时，最后一个 PUT 不能省</h3>
<pre><code class="language-typescript">// UI 先拼接 SSE delta，而不是等待保存才显示
writer.append(delta);
setTurns(prev =&gt; appendDelta(prev, turnId, delta));

// 真的收到 SSE end 后：
await writer.finish('answered');
// 只有此时，才代表完整正文已被数据库确认保存
setTurns(prev =&gt; setAnswered(prev, turnId));
</code></pre>
<p>这里 <code>appendDelta</code> 与 <code>setAnswered</code> 是为解释状态更新而写的示意函数；工程实际在 <code>src/App.tsx</code> 里直接用 <code>setTurns</code> 实现。<code>writer.finish('answered')</code> 是异步等待，确保前面排队中的检查点顺序完成，再提交最终回答。</p>
<p>如果网络在收到 <code>end</code> 之后、最终 PUT 之前失败：<strong>数据库不会自动变成 <code>answered</code>。</strong> 后端有短暂的待确认窗口，超过后会将仍停留在 <code>waiting/streaming</code> 的记录标记为 <code>incomplete</code>；用户刷新时可以看见最后成功的检查点和“未完成”，再手动重新回答。这比“收到 end 就在 UI 直接显示永久完成”更诚实。</p>
<h3>6.4 方案边界：谁是可信的 AI 输出？</h3>
<p>本篇让浏览器提交 <code>answer</code>，确实能实现持久化，<strong>但服务器在数据库里收到这段文字，并不能仅凭它证明文字由模型生成</strong>。用户可以用浏览器开发者工具手动发 PUT，更不能把客户端 <code>answered</code> 当作安全凭据。这个教学版只展示本地单用户应用的数据流和版本控制；生产环境应在后端校验生成任务、完成标记及正文来源，或改为后端持有可信最终结果。这里需要在设计文档中明说，而不是假装风险不存在。</p>
<h2>七、用户正看到 AI 输出时按 F5：前端与后端怎么做？</h2>
<p>先明确：<strong>本课采用“HTTP SSE 断开即终止本次生成”的教学方案，不支持刷新后无缝接上旧流</strong>。刷新后能恢复的是数据库中最近一次<strong>成功 PUT</strong> 的快照，不是已经渲染但还没保存的所有字。</p>
<h3>7.1 场景：已经显示 100 字，但只保存过 80 字</h3>
<pre><code class="language-text">时间       旧 React 页面                         Node.js / SQLite
00:00      POST /turns，收到 meta(turnId=T7)       插入 T7 waiting
00:01      看到 40 字                              尚未写草稿
00:02      800ms 检查点 PUT 完整 80 字             UPDATE T7，revision 0→1
00:03      又显示了 20 字，共 100 字               DB 中仍为 80 字
00:04      用户按 F5 → 旧 SSE Fetch 被取消         旧连接 close → abort
00:04+                                            标记 T7 incomplete（正文 80 字）
00:05      新 React 挂载，GET /conversations/:id   SELECT T7
00:05      页面显示 80 字 + 未完成 + 重试入口        不会自动重新生成
</code></pre>
<p><strong>这次丢掉的 20 字，是客户端尚未成功提交的检查点差额。</strong> 如果旧页面在断开前刚好启动了一条 PUT，它可能成功，也可能失败；新页面必须 GET 才能确定。不要依靠 <code>beforeunload</code> 保证 PUT 一定发完；浏览器在关闭/刷新时并不承诺它一定成功。</p>
<h3>7.2 React 首次挂载：恢复上次打开的会话 ID</h3>
<pre><code class="language-tsx">const LAST_ID = 'lesson17:selectedConversation';

useEffect(() =&gt; {
  let disposed = false;
  void (async () =&gt; {
    const res = await fetch('/api/conversations');
    if (!res.ok) throw new Error('会话列表失败');
    const { conversations } = await res.json();
    if (disposed) return;
    setConversations(conversations);
    const savedId = localStorage.getItem(LAST_ID);
    if (savedId &amp;&amp; conversations.some((c: Conversation) =&gt; c.id === savedId)) {
      await selectConversation(savedId);
    }
  })().catch(e =&gt; { if (!disposed) setError(String(e)); });
  return () =&gt; {
    disposed = true;
    active.current?.abort(); // 取消原 SSE
    loader.current?.abort(); // 取消旧 GET
    draft.current?.writer.cancelTimer(); // 不再排新的检查点任务
  };
}, []);
</code></pre>
<p>注意：<code>cancelTimer()</code> 只能取消<strong>尚未执行的定时器</strong>，不能让已经发出的 PUT 消失；也不能保证一个没有完成的 PUT 最终成功。<strong>React 内存重新建立后，必须以数据库重新 GET 的结果为准。</strong> <code>localStorage</code> 仅保存 conversationId，不把整段 AI 正文复制进本地存储。</p>
<h3>7.3 React 恢复会话：只 GET，不自动 POST</h3>
<pre><code class="language-tsx">async function selectConversation(id: string) {
  loader.current?.abort();
  active.current?.abort();
  draft.current?.writer.cancelTimer();
  const controller = new AbortController();
  loader.current = controller;
  selectedRef.current = id;
  setSelected(id);
  setTurns([]);
  setRestoring(true);

  try {
    for (let attempt = 0; attempt &lt; 4; attempt++) {
      const res = await fetch(\`/api/conversations/\${id}\`, {
        signal: controller.signal, cache: 'no-store'
      });
      if (!res.ok) throw new Error('历史读取失败');
      const { turns } = await res.json();
      if (controller.signal.aborted || selectedRef.current !== id) return;
      setTurns(turns);
      localStorage.setItem(LAST_ID, id);
      if (!turns.some((t: Turn) =&gt;
        t.status === 'waiting' || t.status === 'streaming')) return;
      if (attempt &lt; 3) await delayWithSignal(300, controller.signal);
    }
  } finally {
    if (loader.current === controller) {
      loader.current = null;
      setRestoring(false);
    }
  }
}
</code></pre>
<p>这是为解释流程缩短的代码，<strong>完整的 <code>delayWithSignal</code>、错误处理、不同会话隔离在配套 <code>src/App.tsx</code></strong>。旧会话 A 的 GET 在切换到 B 后不能覆盖 B，所以除了 abort，还要比较 <code>selectedRef.current</code>。</p>
<p>为什么最多查询四次？这是为了等待旧连接的中断清理，<strong>不是为了等待后台模型持续输出</strong>。四次仍没确认，前端显示“状态待确认，请重新加载”，不假装它已完成。</p>
<h3>7.4 旧后端连接断开：不是把所有字都保存下来</h3>
<p>在 <code>server/index.ts</code> 中，<code>res.close</code> 负责中断仍在进行中的生成；后端把<strong>最后成功 PUT 的内容</strong>标成 <code>incomplete</code>：</p>
<pre><code class="language-typescript">res.on('close', () =&gt; {
  if (!generated) controller.abort();
});

// catch 分支（示意）：
store.markUnfinished(
  userId, conversationId, turn.id,
  'incomplete',
  '流式连接中断；只保留已保存的检查点'
);
</code></pre>
<p><code>markUnfinished</code> <strong>只改变状态和提示，不会制造它没收到的 20 字</strong>。用户主动按停止按钮时则优先执行一次客户端检查点 <code>PUT</code>，然后请求后端 <code>/stop</code>，以尽量保留当前已收到的正文；如果检查点失败，至少后端先前成功保存的草稿还在。</p>
<h3>7.5 正常收到了 SSE end，刷新时会怎样？</h3>
<p>这取决于<strong>最终 PUT 有没有成功</strong>，而不是 SSE 有没有发出 <code>end</code>：</p>
<table>
<thead>
<tr>
<th>时机</th>
<th>后端数据库</th>
<th>新页面 GET</th>
</tr>
</thead>
<tbody>
<tr>
<td>模型生成完、前端没来得及 PUT</td>
<td>可能仍为 <code>streaming</code> / 稍后 <code>incomplete</code></td>
<td>显示最后检查点；不可当作完整回答</td>
</tr>
<tr>
<td>最终 PUT 已返回成功</td>
<td><code>answered</code> + 完整正文</td>
<td>显示完成</td>
</tr>
<tr>
<td>最终 PUT 已发送但浏览器丢失响应</td>
<td>可能成功，也可能失败</td>
<td><strong>重新 GET 核对</strong>，不要马上重复创建问答</td>
</tr>
<tr>
<td>服务进程崩溃</td>
<td>最近一次完成的 SQLite 事务</td>
<td>重启时将遗留 <code>waiting/streaming</code> 改成 <code>incomplete</code></td>
</tr>
</tbody>
</table>
<h3>7.6 Node.js 重启时：旧 streaming 不可冒充成功</h3>
<p>仅限本篇本地单进程示例，启动时执行：</p>
<pre><code class="language-typescript">db.prepare(\`
  UPDATE turns
  SET status = 'incomplete',
      notice = '服务重启后恢复：上次生成未确认完成',
      updated_at = ?,
      revision = revision + 1
  WHERE status IN ('waiting', 'streaming')
\`).run(new Date().toISOString());
</code></pre>
<p>生产环境如果多个服务实例同时运行，不能因为其中一个实例重启就把别的实例运行中的任务改成失败；应使用任务所有权、过期检测和协调机制。</p>
<h3>7.7 还能像 ChatGPT 一样刷新后继续生成吗？</h3>
<p><strong>可以，但那属于另一种架构</strong>：生成任务与浏览器 SSE 生命周期解耦，服务端维护任务进度、事件偏移量和可重新订阅的事件流。仅仅增加前端 PUT 或把 GET 轮询次数改成无限，都无法实现可靠的断线续传。这会放到第 18 篇及后续生产工程中讨论。</p>
<h2>八、第 16 篇的“最近 6 轮、所有状态”规则，还能继续用吗？</h2>
<p>可以，本篇不修改你确认的上下文策略。需要把<strong>数据库读取出来的 Turn</strong> 投影为模型输入，而不是让浏览器随意提交一份“自称是真的”的历史。</p>
<pre><code class="language-typescript">type TextMessage = {
  role: &quot;user&quot; | &quot;assistant&quot;;
  content: string;
};

function buildHistory(turns: readonly Turn[]): TextMessage[] {
  return turns.slice(-6).flatMap((turn): TextMessage[] =&gt; {
    const pair: TextMessage[] = [
      { role: &quot;user&quot;, content: turn.question }
    ];

    if (turn.answer.trim()) {
      pair.push({ role: &quot;assistant&quot;, content: turn.answer });
    }

    return pair;
  });
}
</code></pre>
<p>这里<strong>不按 <code>answered</code> 过滤</strong>：已停止、截断、拒绝或失败的轮次，如果存有真实助手正文，也可以被选进最近 6 轮；没有正文则只保留用户问题。<code>notice</code> 不混进模型的助手回答。模型输入仍需遵守第 16 篇的长度保护和第 11 篇的 Token 预算。</p>
<p>注意两个边界：<strong>当前新问题不能重复发送</strong>。如果它已经被插入数据库，就要在取历史时排除当前 Turn，再单独加入当前问题。重新回答旧 Turn 时，还要排除那一轮自身和其后的分支历史。以及：把未完成草稿作为正常 <code>assistant</code> 消息，可能让模型误以为它是完整回复；本篇继承第 16 篇的约定，但实际产品应评估是否附加“未完成”上下文说明。</p>
<h2>九、把所有操作放在一张图里</h2>
<pre><code class="language-text">React 点击新建 → POST /conversations ───────────→ Node INSERT Conversation
React 点击发送 → POST /turns（SSE）────────────→ Node INSERT waiting + 推送 delta
React 追加文本 → 立即更新聊天气泡（不写库）
React 达到检查点 → PUT /turns/:id ─────────────→ Node 校验 revision + 保存草稿
React 收到 end → PUT /turns/:id (answered) ──→ Node 提交最终正文和状态
React 点击停止 → 先 PUT 草稿，再 POST /stop ─→ Node 中止生成、保存 stopped
React 点击重试 → POST /retry ────────────────→ Node 同 Turn.id 清空草稿再生成
React 修改标题 → PATCH /conversations/:id ───→ Node 更新 title
React 刷新页面 → GET /conversations/:id ─────→ Node SELECT 快照
React 删除会话 → DELETE /conversations/:id ──→ Node 校验后删除关联数据
</code></pre>
<p><strong>注意两个不同的“完成”：模型生成完（SSE <code>end</code>）与回答持久化完成（最终 PUT 返回成功）。</strong> 本方案只有两个动作都成功，UI 才显示真正保存完成。</p>
<p>前端不需要每次收到字符就调用保存接口，但需要管理排队的 PUT。后端保存操作不是“照单全收”，仍必须校验身份、数据库版本和状态转换。<strong>用户提供的正文来源可信性是额外的生产安全需求</strong>，本地工程没有证明它是模型原文。</p>
<h2>十、停止、重试和删除，分别是什么数据库操作？</h2>
<table>
<thead>
<tr>
<th>用户操作</th>
<th>数据库该发生什么</th>
<th>特别注意</th>
</tr>
</thead>
<tbody>
<tr>
<td>停止生成</td>
<td>保留目前答案，更新状态为 <code>stopped</code></td>
<td>主动停止和意外断线应区分</td>
</tr>
<tr>
<td>重新回答</td>
<td><strong>同一个 Turn.id</strong>，清空旧草稿并改为 <code>waiting</code></td>
<td>新请求开始前终止旧请求，旧回调不能覆盖新结果</td>
</tr>
<tr>
<td>刷新页面</td>
<td>读取已存的 Turns，不创建新 Turn</td>
<td>没有结束信号的草稿不能变成功</td>
</tr>
<tr>
<td>删除会话</td>
<td>删除会话及其 Turns</td>
<td>必须核对所属用户；进行中的流先停止或拒绝删除</td>
</tr>
</tbody>
</table>
<p>配套工程提供 <code>/retry</code> 和 <code>/stop</code> 两个接口：前者仅对已停止、失败或不完整的 Turn 开放；后者显式告诉服务端是用户主动停止。浏览器连接中断但没有收到主动停止请求时，服务端把状态记为 <code>incomplete</code>，不武断地称为用户点了停止。</p>
<p>如果重试过程中再次失败，<code>Turn.id</code> 仍然不变。这次新的“生成尝试”由当前活动控制器在网络层隔离；没有额外保存一个生成 ID。</p>
<p><strong>一个容易忽略的现实问题：重复提交。</strong> 用户点击“发送”后如果网络断开，可能不知道后端已成功创建 Turn；直接再点一次，可能出现重复问题。本课尚未实现客户端幂等键及去重，它属于生产级需要补齐的能力。</p>
<h2>十一、数据安全：数据库不是只要能查到就够了</h2>
<p>真正的多用户聊天系统，不能只写：</p>
<pre><code class="language-sql">SELECT * FROM turns WHERE conversation_id = ?;
</code></pre>
<p>至少需要确认这场会话属于<strong>当前已认证的用户</strong>。本课在服务端按 <code>user_id</code> 检查归属，并在更新时结合会话归属和行版本条件执行，防止仅凭猜到 ID 就读写他人的聊天记录。但配套示例只有固定本地用户，并无真实登录，这只是演示查询边界。</p>
<p>还有三件事必须在上线前考虑：敏感数据最小化与保留期限；数据库备份、恢复与删除策略；访问日志中避免记录密钥或不必要的私密对话。OWASP 将按对象 ID 越权访问列为 API 的重要风险之一。<a href="https://owasp.org/API-Security/editions/2023/en/0xa1-broken-object-level-authorization/">OWASP API1:2023</a>。</p>
<h2>十二、动手实验：刷新后到底保留了多少？</h2>
<p>下载配套工程，进入 <code>project</code>，推荐 Node.js 24.15+（Node.js 22.16+ 可做基本实验，但可能提示实验特性）。终端 A：</p>
<pre><code class="language-bash">npm install
npm run server
</code></pre>
<p>终端 B：</p>
<pre><code class="language-bash">npm run dev
</code></pre>
<p>打开 <code>http://127.0.0.1:5173</code>。本课默认 <code>127.0.0.1:3001</code> 的 Node API、<code>./data/chats.sqlite</code> 数据库、<strong>模拟生成内容</strong>，不调用付费模型；先关闭占用相同端口的旧服务。</p>
<p><strong>实验 A：正常生成。</strong> 新建会话并提问，打开开发者工具 Network。你会看到 <code>POST /turns</code> SSE 和若干条 <code>PUT /turns/:id</code>。每一个 SSE 增量都出现在页面，但<strong>不会每段都生成一条 PUT</strong>；最后必须有 <code>status: answered</code> 的成功 PUT。</p>
<p><strong>实验 B：800ms / 2KiB 检查点。</strong> 观察 <code>PUT</code> 的 <code>answer</code> 传的是<strong>累计全文</strong>而不是仅上次 <code>delta</code>。连续 PUT 的 <code>revision</code> 应不断递增，旧 revision 写入会被拒绝。</p>
<p><strong>实验 C：生成中按 F5。</strong> 在流式输出时刷新，新页面自动恢复上次会话。它只能显示服务器收到的最后检查点，可能比旧页面短；若生成未完成，最终状态是 <code>incomplete</code>，不自动发起生成。</p>
<p><strong>实验 D：用户主动停止。</strong> 点击停止时，前端先尝试保存当前草稿，然后请求 <code>POST /stop</code>。历史中应是 <code>stopped</code>，继续点击重试时 <code>Turn.id</code> 保持不变。</p>
<p><strong>实验 E：模拟最终 PUT 失败。</strong> 在浏览器开发者工具中阻断保存请求，观察 SSE 即使生成完成，UI 也不能可靠地认定持久化完成；重新 GET 后应以数据库快照为准。</p>
<p><strong>实验 F：修改标题与删除会话。</strong> 前端发送 <code>PATCH</code> / <code>DELETE</code>，后端校验并执行；刷新后仍能看到更新后的标题，删除后不再返回关联 Turns。</p>
<p><strong>实验 G：服务器异常终止。</strong> 生成过程中强制结束 Node 进程再启动；数据库只能恢复上一次成功 PUT 的内容，启动恢复逻辑会把遗留的 <code>waiting/streaming</code> 改为 <code>incomplete</code>。</p>
<p>项目不保证每个已显示字符都持久化，也没有实现多用户登录、客户端幂等键、跨设备同步中的版本协商或真实模型的来源验证。要上线需要继续完善。</p>
<h3>四道选择题</h3>
<p><strong>第 1 题</strong>：本课新的保存方案中，谁负责发送 AI 回答的草稿检查点？</p>
<p>A. 模型服务直接向数据库写入；B. 前端把 SSE 累计答案按阈值 PUT 给后端；C. SQLite 自动从 SSE 抓取。</p>
<p><strong>第 2 题</strong>：前端已经收到 SSE <code>end</code>，为什么还不能立刻认定“回答已持久化”？</p>
<p>A. 还要等最终 PUT 成功；B. 需要强制刷新；C. 必须等下一次用户发问。</p>
<p><strong>第 3 题</strong>：前端刷新后只能看到 80 字，但刷新前显示了 100 字，最可能的解释是？</p>
<p>A. React 自动删掉最后 20 字；B. SQLite 错误裁剪；C. 后 20 字还没成功保存到服务器。</p>
<p><strong>第 4 题</strong>：为什么要串行保存并检查 <code>revision</code>？</p>
<p>A. 提高字体渲染速度；B. 避免迟到的旧快照覆盖新版本；C. 让 SSE 变成 WebSocket。</p>
<p><strong>答案与解析：</strong> 1B，前端管理检查点 PUT；2A，生成完成与持久化完成是两件事；3C，恢复边界是最后成功提交的数据库快照；4B，乐观锁与串行请求共同防止旧写入覆盖新写入。</p>
<h2>十三、学习疑问与解答</h2>
<p><strong>Q1：把 AI 回答交给前端保存，不是更简单吗？</strong><br />
对小型、单用户产品很合理：前端收流并持有完整草稿，按检查点 PUT 给后端即可。它将持久化编排交给浏览器，后端仍负责校验和落库。这个方案不是天然错误，和“服务端自己保存 AI 输出”属于不同权衡。</p>
<p><strong>Q2：那为什么不能每个 Token 都发 PUT？</strong><br />
技术上能，但写入和网络开销大。我们采用 800ms/2KiB 检查点，减少请求数量。阈值越长，刷新丢失未保存尾部的风险越高。</p>
<p><strong>Q3：如果 SSE <code>end</code> 到了，但最终 PUT 失败怎么办？</strong><br />
前端不能显示持久化成功。恢复时 GET 数据库快照，若最终保存未到达，后端会把遗留的进行中记录标为 <code>incomplete</code>；必要时让用户重试。</p>
<p><strong>Q4：浏览器刷新能保证最后一次 PUT 发送成功吗？</strong><br />
不能。即使监听 <code>beforeunload</code>，请求也可能被中断，不能把“尝试发送”当作“服务器确认保存”。需要更强保证时，考虑浏览器端持久草稿、后台任务或由服务端保存权威输出。</p>
<p><strong>Q5：前端能篡改自己保存的 AI 回答吗？</strong><br />
能。浏览器不是可信执行环境，任何用户都可能自行构造请求。后端需要验证身份、版本、状态和业务限制；如果必须证明“原封不动来自模型”，就应增加服务端结果或签发的生成完成凭证。本课仅展示本机单用户流程，不提供该级别的证明。</p>
<p><strong>Q6：为什么仍然保留 <code>revision</code>？</strong><br />
因为两个检查点 PUT 可能发生延迟与竞态。客户端保证串行，并带上后端返回的新版本；后端 CAS 更新，过期版本拒绝覆盖。</p>
<p><strong>Q7：为什么删除了 <code>position</code>？</strong><br />
本课只需要按 <code>createdAt ASC, id ASC</code> 稳定展示，不支持插队和手动排序。相同毫秒内 ID 排序不保证严格真实先后，如需严格顺序再引入单调序号。</p>
<p><strong>Q8：PRAGMA foreign_keys=ON 在哪里开启？</strong><br />
在 Node.js 创建 <code>DatabaseSync</code> 后、开启事务前执行，每个连接都需设置一次；<code>PRAGMA foreign_keys</code> 返回 <code>1</code> 说明已生效。</p>
<p><strong>Q9：刷新后还能继续原来的 SSE 吗？</strong><br />
本篇不能。当前方案断线停止生成，GET 恢复的是最后成功的数据库快照。后台继续生成需要解耦任务、可恢复事件游标和重新订阅能力。</p>
<p><strong>Q10：这套工程能直接部署公网吗？</strong><br />
不能。它没有实际登录、幂等键、模型来源校验和多实例生成协调，客户端可提交自己构造的回答内容。上线前必须完善鉴权和可信状态边界。</p>
<h2>本篇总结</h2>
<blockquote>
<p><strong>前端发起会话动作、接收 SSE、批量 PUT 回答草稿；后端负责生成、鉴权校验与数据库提交。SSE <code>end</code> 不是保存成功，刷新后以最近一次成功写库的数据为准。</strong></p>
</blockquote>
<p>这版让两个方向都能说清楚：<strong>使用后端持久化模型输出可以降低客户端负担；使用前端显式 PUT 也完全可行，只是要承担排队、断线与来源校验问题。</strong> 本课按你提出的前端保存方案实现，不再将其说成错误做法。</p>
<p>第 17 篇结束。课程进度：<strong>17 / 40 篇（42.5%）</strong>。</p>
<p><strong>下一篇：第 18 篇《AI 聊天如何处理失败、重试与断线恢复？》</strong>——继续完善幂等键、失败恢复、后台生成和断线续传。</p>
<h3>参考资料</h3>
<ul>
<li><a href="https://nodejs.org/api/sqlite.html">Node.js 官方 <code>node:sqlite</code></a>：SQLite 连接与参数化语句。</li>
<li><a href="https://sqlite.org/wal.html">SQLite 官方 WAL 说明</a>：预写式日志。</li>
<li><a href="https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API">MDN：Fetch API</a>：请求、AbortSignal 与响应流。</li>
<li><a href="https://owasp.org/API-Security/editions/2023/en/0xa1-broken-object-level-authorization/">OWASP API1:2023</a>：对象级授权。</li>
</ul>
<p><strong>发布注记：本篇以最终 GitHub 合并及线上验收结果为准。</strong></p>
`,m=[{q:"本课新的保存方案中，谁负责发送 AI 回答的草稿检查点？",options:["模型服务直接向数据库写入","前端把 SSE 累计答案按阈值 PUT 给后端","SQLite 自动从 SSE 抓取"],a:1,why:"SSE 到前端后由 BrowserDraftWriter 批量 PUT。"},{q:"前端已经收到 SSE end，为什么还不能立刻认定“回答已持久化”？",options:["还要等最终 PUT 成功","需要强制刷新","必须等下一次用户发问"],a:0,why:"生成完成不等于保存完成，最终 PUT 的成功回执才说明已落库。"},{q:"刷新后只能看到 80 字，刷新前显示了 100 字，最可能的原因是？",options:["React 自动删掉最后 20 字","SQLite 错误裁剪","后 20 字还没成功保存到服务器"],a:2,why:"恢复边界是上一次成功 PUT 的数据库快照。"},{q:"为什么保存请求需要串行并检查 revision？",options:["提高字体渲染速度","避免迟到的旧快照覆盖新版本","让 SSE 变成 WebSocket"],a:1,why:"顺序化请求和数据库 CAS 校验避免过期保存覆盖新内容。"}];const W={class:"lesson17"},M=["innerHTML"],X={class:"lab","aria-label":"浏览器刷新检查点模拟实验"},K=n("h2",null,"🧪 交互实验：刷新会丢掉哪一段？",-1),$=n("p",null,"这里是纯前端模型，不执行真正网络请求。先追加两段内容，再保存检查点；继续追加后点击“模拟刷新”，观察数据库记录与当前显示的区别。",-1),J={class:"lab-panels"},z=n("strong",null,"页面当前显示",-1),V=n("strong",null,"数据库最近一次 PUT",-1),Y={class:"buttons"},Z=["disabled"],nn=n("p",{class:"hint"},"刷新只会恢复数据库最后保存的内容；只有最终 PUT 成功才得到 answered。",-1),en={class:"quiz"},tn=n("h2",null,"📝 交互测验：四道选择题",-1),on=["name","checked","onChange"],sn={key:0,class:"hint"},rn={class:"buttons"},dn=["disabled"],cn={key:0,role:"status"},an={role:"status",class:"hint"},pn=Q({__name:"ConversationPersistenceLesson",setup(y){const a=r({}),l=r(!1),_=w(()=>m.every((p,o)=>a.value[o]!==void 0)),N=w(()=>m.filter((p,o)=>p.a===a.value[o]).length);function I(){a.value={},l.value=!1}const u=r(""),g=r(""),T=r("waiting"),i=r("waiting"),v=["你好，","这是一段","正在生成的","回答内容。"],h=r(0);function q(){h.value>=v.length||(u.value+=v[h.value++],T.value="streaming")}function L(){g.value=u.value,i.value="streaming"}function C(){g.value=u.value,i.value="answered",T.value="answered"}function R(){u.value=g.value,T.value=i.value==="answered"?"answered":"incomplete",i.value!=="answered"&&(i.value="incomplete")}function D(){h.value=0,u.value="",g.value="",T.value="waiting",i.value="waiting"}const E=r("");async function k(p){var e,s;const o=((s=(e=p.parentElement)==null?void 0:e.querySelector("code"))==null?void 0:s.textContent)||"";try{await navigator.clipboard.writeText(o),E.value="代码已复制"}catch{E.value="复制失败，请手动选择"}}function O(p){p.querySelectorAll("pre").forEach(o=>{if(o.querySelector("[data-copy17]"))return;const e=document.createElement("button");e.type="button",e.textContent="复制代码",e.className="copy17",e.dataset.copy17="1",e.addEventListener("click",()=>void k(e)),o.prepend(e)})}const P=r(null);return B(()=>{G(()=>{P.value&&O(P.value)})}),(p,o)=>(d(),c("article",W,[n("div",{ref_key:"articleRef",ref:P,class:"original",innerHTML:f(F)},null,8,M),n("section",X,[K,$,n("div",J,[n("div",null,[z,n("p",null,t(u.value||"（空）"),1),n("small",null,t(T.value),1)]),n("div",null,[V,n("p",null,t(g.value||"（尚无草稿）"),1),n("small",null,t(i.value),1)])]),n("div",Y,[n("button",{onClick:q,disabled:h.value>=v.length},"接收 SSE delta",8,Z),n("button",{onClick:L},"模拟检查点 PUT"),n("button",{onClick:C},"模拟最终 PUT"),n("button",{onClick:R},"模拟刷新 GET"),n("button",{onClick:D},"重置实验")]),nn]),n("section",en,[tn,(d(!0),c(A,null,U(f(m),(e,s)=>(d(),c("fieldset",{key:s},[n("legend",null,t(s+1)+". "+t(e.q),1),(d(!0),c(A,null,U(e.options,(x,S)=>(d(),c("label",{key:S},[n("input",{type:"radio",name:"q17-"+s,checked:a.value[s]===S,onChange:un=>{a.value[s]=S,l.value=!1}},null,40,on),j(t("ABC"[S])+". "+t(x),1)]))),128)),l.value?(d(),c("p",sn,t(a.value[s]===e.a?"答对了。":"答错了。")+"正确答案："+t("ABC"[e.a])+"。"+t(e.why),1)):b("",!0)]))),128)),n("div",rn,[n("button",{disabled:!_.value,onClick:o[0]||(o[0]=e=>l.value=!0)},"提交评分",8,dn),n("button",{onClick:I},"重新作答")]),l.value?(d(),c("p",cn,"得分："+t(N.value)+" / 4",1)):b("",!0)]),n("p",an,t(E.value),1)]))}}),Tn=JSON.parse('{"title":"17 · 会话与消息持久化","description":"","frontmatter":{"title":"17 · 会话与消息持久化","readingTime":"15–20","outline":false},"headers":[],"relativePath":"guide/ai/chatbot-course/17-conversation-persistence.md","filePath":"guide/ai/chatbot-course/17-conversation-persistence.md","lastUpdated":1793116094000}'),ln={name:"guide/ai/chatbot-course/17-conversation-persistence.md"},hn=Object.assign(ln,{setup(y){return(a,l)=>(d(),c("div",null,[H(pn)]))}});export{Tn as __pageData,hn as default};
