# 📘 第 18 篇：AI 聊天失败了，应该自动重试吗？——错误处理、幂等与断线恢复

**《AI 聊天机器人学习教程》｜第 18 / 40 篇（45%）**  
**第三阶段：聊天机器人工程开发｜预计阅读 18–25 分钟｜React + TypeScript + Node.js + SQLite**

上一节，我们让浏览器能把收到的 SSE 文本拼接起来，按约 **800ms / 2KiB** 发送一次 `PUT` 保存检查点；数据库负责持久化，最后一次 `PUT` 成功之后，界面才显示 `answered`。

可惜，网络和模型服务并不总是配合。假设用户按下发送，可能遇到六种截然不同的情况：还没连上就报错、模型限流、模型生成到一半断线、用户自己点停止、AI 已答完却没有保存成功、用户因网络超时又点了一次发送。

如果我们不加区分地“失败就重新 POST 一次”，轻则出现重复气泡，重则把不完整回答当作成功，甚至触发两次有副作用的工具操作。

**本篇目标：让失败是可理解、可恢复、不会悄悄重复执行的。** 并且继续遵守第 16、17 篇确定的规则：固定 `Turn.id`、`status` 驱动界面、最近六轮历史不按状态过滤、浏览器发起检查点 PUT、后端负责权限与状态兜底。

---

## 一、先分清三个“成功”——否则后续判断都会乱

假设屏幕出现了一整段回答，这只能说明“前端收到了文字”，还不能证明所有流程已经成功。

| 层次 | 判定条件 | 单独成立代表什么 |
| --- | --- | --- |
| HTTP 层成功 | 收到 `200` 和流响应 | 连接已建立，**不代表生成完成** |
| 模型生成成功 | SSE 收到明确的 `end` | 本次生成结束，**不代表写库成功** |
| 持久化成功 | 最终 `PUT` 得到数据库确认 | 正文和 `answered` 状态已被成功存储 |

因此，本篇规定：**只有“收到合法 `end` + 最终 PUT 成功”才能在界面上显示 `answered`。** 如果只收到 `delta` 就断线，保留现有草稿并显示 `incomplete`；如果模型生成完毕但最终 PUT 失败，显示保存失败，重新 GET 核对数据库状态，而不是把它悄悄当作正常完成。

还要区分 `notice` 和 `answer`：前者是“网络中断，请重试”等系统信息，不能混进助手正文。

## 二、不是所有错误都应该自动重试

把问题粗略分为“流开始前”和“流开始后”，比只看 `500` 更有用。

| 故障 | 是否自动重试？ | 正确处理方式 |
| --- | --- | --- |
| 收到 `429 Too Many Requests`，尚未开始 SSE | **可以有限重试** | 尊重 `Retry-After`，相同幂等键，次数上限 |
| 收到 `502/503/504`，尚未开始 SSE | **通常可有限重试** | 退避 + 抖动；重复请求必须可安全去重 |
| `400/401/403/422` | **不要自动重试** | 修正请求、鉴权或权限问题 |
| `409 Conflict` | **不要盲目重试** | 重新 GET，核对状态或版本冲突 |
| `fetch` 在响应头到达前网络失败 | **先核对，不盲发** | 后端可能已创建消息，这是未知结果 |
| 已收到 `delta`，后来突然断线 | **不自动重发整轮** | 保留草稿，恢复并提供手动“重新回答” |
| 用户点击停止 | **不能自动重试** | `AbortController` 取消，上报停止并保留草稿 |
| 最终 `PUT` 保存失败 | **不能认为 answered** | 查询最新状态，解决版本冲突或允许明确重试保存 |

`429` 可携带 `Retry-After` 指示等待时间；其值可以是秒数，也可以是 HTTP 日期。遇到 `503` 时也可使用这个响应头。参考 [MDN：429](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/429) 与 [Retry-After](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Retry-After)。

**注意：上表的“可以”不是 HTTP 协议承诺一定安全。** 如果 POST 已经触发扣款或工具调用，即使收到 `503` 也可能有副作用；只有我们明确做了幂等保护，才能把重试作为默认策略。下面先给聊天问题创建做幂等。

## 三、先解决重复发送：幂等键不是 Turn.id，也不是 runId

场景：用户点击一次“发送”，浏览器网络断开，前端没等到响应。后端可能已经创建了 Turn。如果浏览器又发一遍普通 `POST`，数据库可能出现两条相同问题。

本课给**“新建这一轮问题”**携带一个 `clientKey`：用户发起这次操作时生成一次；如果是同一次操作的网络/限流重试，就使用原来的键。后端用 `(conversationId, clientKey)` 做唯一约束。**同一个键映射同一个 `Turn.id`，不会生成第二个气泡。**

注意三个概念：`conversationId` 表示会话，固定 `Turn.id` 表示这轮问答，`clientKey` 只用于识别“重复提交的同一次创建操作”。它不代表模型生成尝试，也不负责第 16 篇旧流回调的隔离；那件事仍由当前 `AbortController` 负责。

前端新建消息时：

```typescript
const clientKey = crypto.randomUUID();

// 自动重试同一次创建操作时，必须复用这一份 payload。
const payload = {
  question: "解释一下闭包",
  clientKey,
  scenario: "normal" // 本课的故障模拟参数，正式产品不需要
};
```

数据库增加可空 `client_key` 列，旧的聊天数据不受影响，再建立唯一索引：

```sql
ALTER TABLE turns ADD COLUMN client_key TEXT;
CREATE UNIQUE INDEX idx_turn_client_key
  ON turns(conversation_id, client_key)
  WHERE client_key IS NOT NULL;
```

实际工程会先检查表结构，再决定是否执行 `ALTER TABLE`，避免重复迁移。新增 Turn 的事务中先通过键查找现有记录：

```typescript
// 在同一个数据库事务内执行，确保并发请求不会穿透去重。
const existing = db.prepare(`
  SELECT id, question FROM turns
  WHERE conversation_id = ? AND client_key = ?
`).get(conversationId, clientKey);

if (existing) {
  if (existing.question !== question) {
    throw new Error("同一个 clientKey 不能对应不同的问题");
  }
  // 返回已有 Turn；不创建，也不再次调用模型。
  return { turn: existing, created: false };
}

// 否则 INSERT 一条 waiting Turn，并提交事务。
```

本课的模拟服务器对重复提交返回 `409 DUPLICATE_REQUEST`，附上已有 Turn 信息；前端接到后重新 GET 会话，而不是再生成一次。真实产品也可以把重复的已完成创建请求返回为 `200`，但必须明确规定并发中的请求怎么办，以及键什么时候过期。参考 [Stripe 幂等请求设计](https://docs.stripe.com/api/idempotent_requests)；本课只实现局部的创建去重，不冒充支付级幂等系统。

## 四、重试策略：最多两次，尊重 Retry-After，加入抖动

为什么不能每隔 100ms 重试到成功？假设模型服务刚好过载，1000 个客户端同一秒重试，服务端只会更难恢复。这叫“重试风暴”。

常见做法是**指数退避（exponential backoff）+ 随机抖动（jitter）+ 最大重试次数**。例如基准 500ms，下一次上限增加，但真正等待时间在范围内随机选择：

```typescript
export function backoffMs(retryIndex: number): number {
  const cap = Math.min(4000, 500 * 2 ** retryIndex);
  return Math.floor(Math.random() * cap);
}
```

同时，如果服务器提供 `Retry-After`，优先按服务端告知的时间处理：

```typescript
export function parseRetryAfter(
  header: string | null,
  now = Date.now()
): number | null {
  if (header === null) return null;
  const value = header.trim();
  if (/^\d+$/.test(value)) return Math.min(Number(value) * 1000, 60_000);
  const date = Date.parse(value);
  return Number.isNaN(date)
    ? null
    : Math.max(0, Math.min(date - now, 60_000));
}
```

本课为了可演示，把过大的等待封顶为一分钟；正式接入服务时应结合厂商限流规则，遇到很长的 `Retry-After` 可直接提示用户稍后再试，不要擅自提前轰炸接口。

下面是真正的前端请求核心：

```typescript
async function postBeforeStreamWithRetry(
  url: string,
  payload: unknown,
  signal: AbortSignal
): Promise<Response> {
  const body = JSON.stringify(payload); // 始终复用同一份 body / clientKey

  for (let attempt = 0; attempt <= 2; attempt++) {
    let response: Response;
    try {
      response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
        signal
      });
    } catch (error) {
      // 还没有拿到响应头，但服务器可能已收到并执行了 POST。
      // 不自动再发；先重新 GET 当前会话核对。
      throw new Error("NETWORK_UNKNOWN_OUTCOME", { cause: error });
    }

    if (response.ok) return response;

    const temporary = [429, 502, 503, 504].includes(response.status);
    if (!temporary || attempt === 2) {
      throw new Error(`HTTP ${response.status}：请手动处理`);
    }

    const waitMs = parseRetryAfter(response.headers.get("Retry-After"))
      ?? backoffMs(attempt);
    await waitOrAbort(waitMs, signal); // 用户点停止时，等待也必须能取消
  }
  throw new Error("UNREACHABLE");
}
```

`waitOrAbort` 的完整实现见示例 `src/retry-policy.ts`；它会响应 `AbortSignal`，不会在用户停止之后继续自动重试。业界对抖动、次数限制和幂等检查的实践，可参阅 [AWS Well-Architected：控制重试](https://docs.aws.amazon.com/wellarchitected/latest/framework/rel_mitigate_interaction_failure_limit_retries.html)。

特别强调：**这个函数只处理收到 SSE 响应之前的明确临时 HTTP 错误。它一旦返回 `200`，之后读到半截回答的异常不走这里。**

## 五、为什么收到部分回答后不能自动从头重试？

假设你已经看到：

```text
用户：帮我介绍 React Fiber
AI：Fiber 是 React 的一种可中断的协调架构，主要用于……
```

接着 SSE 连接中断。如果前端直接重新 POST 同一个问题，并把第二次 `delta` 追加到旧正文后面，结果可能变成：

```text
Fiber 是 React 的一种可中断的协调架构，主要用于……
Fiber 是 React 中对组件更新工作进行拆分的一种机制……
```

文字重复了，而且两次生成也可能用不同措辞，不能简单拼接。

因此本课做三件事：保留已经收到的可见草稿；通过 PUT 检查点保存（仍接受最多最近一段未保存内容丢失的事实）；标记 `incomplete` 或 `failed`，提供**用户主动点击“重新回答”**。重试固定同一个 `Turn.id`，但清空旧答案重新生成，避免拼接两份不同回答。旧回调由 `active.current === controller` 阻断。

一个不能省略的边界：**TCP 连接自然结束不代表 SSE 已完成。** 只有收到明确的 `end` 事件才说明生成完成。`event: error` 同样不是正常结束信号；HTTP 响应头发送之后，后端无法再修改为 `500`，需要用流内事件传递错误。

例如服务端：

```typescript
// HTTP 200 与 SSE 头已经发出。
sse(res, "meta", { turn });
sse(res, "delta", { text: "已经生成的一部分内容" });

// 上游模型此时发生错误，不能再 writeHead(500)。
sse(res, "error", {
  code: "PROVIDER_STREAM_INTERRUPTED",
  retryable: false,
  message: "生成中断，请手动重新回答"
});
res.end();
```

这个 `retryable:false` 指的是**不能直接自动继续/重发这一条流**，不是说用户永远不能重试。用户主动点击重新回答，代表一次新的生成尝试，原来的 `Turn.id` 仍然不变。

## 六、错误、停止和不完整：状态不是一个泛用的 failed

继续使用第 16 篇的七个状态：

| status | 含义 | 前端建议 |
| --- | --- | --- |
| `waiting` | 问题已创建，生成尚未开始或在等待 | 显示等待；恢复时再 GET 核实 |
| `streaming` | 有内容正在生成 | 显示实时草稿与“停止” |
| `answered` | 已收到 end，且最终保存成功 | 显示完整回答 |
| `stopped` | 用户明确点击停止 | 保留草稿，显示“已停止” |
| `incomplete` | 断线、重启或无法确认完成 | 保留最后成功落库的检查点 |
| `failed` | 明确的生成故障 | 显示错误并允许手动重新回答 |
| `refused` | 模型明确拒绝完成请求 | 展示拒绝正文，不当作网络故障无限重试 |

特别注意：前端 `AbortError` **不等于**服务端必定保存 `stopped`。例如切换会话时主动取消本地读取，服务端可能把它记为 `incomplete`。真正的“停止”应该有明确的 stop API；只有用户明确点击了停止才能赋予 `stopped` 语义。

## 七、刷新时怎么恢复？前端和后端分别做什么？

在第 17 篇我们已经做了“前端 PUT 保存草稿”，第 18 篇专门回答：刷新发生在不同阶段，界面应该显示什么？

| 用户刷新时刻 | 数据库可能保存了什么 | 新页面应当怎样处理 |
| --- | --- | --- |
| 新问题 `POST` 尚未得到响应 | 可能没创建，也可能已创建 Turn | **先 GET 会话核对**，不要盲目重发问题 |
| 收到几个 `delta`，还没到检查点 | 只有上次保存的内容 | 恢复已存快照；未 PUT 的文字可能丢失 |
| 检查点 PUT 已成功 | 当前草稿和 `streaming` | 服务端识别断线后转 `incomplete`；界面保留草稿 |
| SSE 已收到 `end`，最终 PUT 尚未完成 | 生成结束，但持久化结果未确认 | 不显示 `answered`，GET 确认是否落库 |
| 最终 PUT 已确认 | 完整正文、`answered` | 正常恢复完整消息 |

简化为两个职责：**前端加载和展示；后端识别自己知道的真实状态**。前端不应该凭“页面刚刷新过”就把每个 `streaming` 改成 `incomplete`，因为别的设备或后台任务可能还在生成。

前端启动：

```typescript
const selectedId = localStorage.getItem("lesson18:selectedConversation");
if (selectedId) {
  // GET 数据库真实记录，注意 AbortController 隔离旧加载回调。
  await selectConversation(selectedId);
}
```

`selectConversation` 内可以对 `waiting/streaming` 进行有限次数的重新读取（本课最多 4 次，每隔约 300ms），**这只是状态确认，不是重新向模型发问题**。如果服务器没有完成断线清理，界面提示“状态待确认”，允许用户手动刷新。

服务端断线后的处理：

```typescript
res.on("close", () => {
  if (!generationFinished) controller.abort();
});

// 流被中止或发生故障时，后端记录状态兜底。
// 注意：浏览器最后一次 PUT 可能尚未完成。
store.markUnfinished(userId, conversationId, turnId,
  "incomplete", "连接中断；保留已经落库的检查点");
```

上面是示意：真实代码必须区别用户明确停止、网络断线和模型内部错误，并做好和浏览器 PUT 的 `revision` 冲突处理。**后端在断线时不能凭空保存浏览器还没提交的文字**。

## 八、最容易漏掉的一种失败：模型生成完了，最后 PUT 失败

上一节的前端写入器 `BrowserDraftWriter` 会在 SSE 来时拼接正文，每 800ms / 2KiB 保存一次。模型发来 `end` 后：

```typescript
if (!gotEnd) {
  throw new Error("缺少 SSE end；不能标记 answered");
}

// 等待排队中的检查点 PUT 完成，再做最后一次终态 PUT。
await writer.finish("answered");

// 只有服务端确认最后 PUT 成功，React 才进入 answered。
setStatus("answered");
```

为什么需要“串行”保存？假设先发“你好”、又发“你好世界”的快照；第二次请求更快返回，之后第一份旧快照才写入，就可能倒退。第 17 篇已用 `revision` 和队列解决这个问题：`PUT` 携带数据库当前版本，每次等待前一次成功才继续，服务器通过 `WHERE revision = ?` 做乐观锁。

此外，模型生成成功与保存成功是两个独立结果。如果最后一次 `PUT` 因数据库冲突或网络失败未返回成功，前端应该**重新 GET 核对**，而不是自动把整个模型请求重新生成一遍。生产实践还可以用单独的“确认提交” API，让服务端根据可信生成任务结果持久化。

本篇延续第 17 篇的教学限制：浏览器提交的回答正文由服务器校验长度、版本和状态，但**没有验证正文必然来自真实模型**；不能把这个单用户例子直接用于对 AI 输出来源有严格要求的生产系统。

## 九、前端的“重新回答”与“重新发送”根本不是一回事

重新回答：针对已经存在的 Turn，用户手动点击按钮，调用 `POST /api/conversations/:conversationId/turns/:turnId/retry`，问题和 `Turn.id` 不变，原回答草稿清空，再从头生成。

重新发送：用户新建另一轮问题，调用 `POST /api/conversations/:conversationId/turns`，会创建一个新的 Turn；如果只是第一份创建请求丢了响应，必须通过 `clientKey` 去重或先 GET 核对，不能认作全新问题。

因此，本课不会在流中断后弹出一个“自动继续生成”的假按钮。我们只提供“重新回答（从头生成）”，真实续传必须依赖服务端保留的生成任务、事件序号和补发能力，第 18 篇没有实现这些能力。

## 十、动手实验：把四种失败亲自跑一遍

配套工程完全离线模拟，不需要模型密钥。建议 Node.js 24；新终端分别执行：

```bash
cd examples/chatbot-course/lesson18
npm install
npm test
npm run build
npm run server  # 终端 A：127.0.0.1:3002
npm run dev     # 终端 B：127.0.0.1:5173
```

打开 `http://127.0.0.1:5173`，新建会话，在“模拟故障”下拉框选择：

1. **首次 429 / 首次 503：** 第一份请求得到临时 HTTP 错误，UI 显示重试等待，**再次 POST 复用同一个 `clientKey`**，最多两次；数据库只创建一条 Turn。
2. **部分内容后 error：** SSE 先给出 `meta`、`delta`，再发 `event:error`；这不是 `end`。显示失败/草稿，不自动把第二次答案拼进去。
3. **无 end 断开：** 连接突然结束；前端检查 `gotEnd`，失败并重新 GET 会话，数据库恢复最后成功保存的草稿。
4. **正常生成：** 一直收到 `end`，前端等待最后一次 `PUT answered` 成功；刷新后从 SQLite 恢复完整回答。

如果想测试“同一个键不会重复创建”，还可以直接用相同 `clientKey` 重复 POST；服务端会给出包含原 Turn 的冲突响应，数据库中仍只有一轮。注意“临时错误”和“结果未知”是两回事：后者应先 GET 核对，不盲目多发。

## 十一、上线前还有哪些边界要补？

这仍是本地单用户教学工程，不是完整生产系统。至少还需要真正的账号/租户鉴权与数据隔离；幂等键的生存期、参数指纹和跨实例并发一致性；上游模型超时与费用预算；服务端可信的回答签名或生成记录；多副本环境下的任务所有权；日志与监控中的敏感数据处理。

实际排障要记录的是**请求属于哪个会话/Turn、哪个状态、失败在 HTTP/SSE/PUT 哪一层、有没有 delta、是否已经最终保存、重试了几次**。不要为了调试把用户全部聊天内容或 API Key 打印到日志中。

## 十二、学习疑问与解答

**Q1：为什么网络断开不自动重新发 POST？** 断开时前端不知道服务器有没有创建 Turn；盲目重发可能重复执行。同一个操作应先靠幂等键或 GET 核对，再决定动作。

**Q2：既然有 Turn.id，为什么还要 clientKey？** 新 Turn 的 ID 通常是后端创建后才返回的；响应丢失时浏览器可能不知道它是什么。`clientKey` 用于把重发的“创建动作”映射回原 Turn，和固定 `Turn.id` 不冲突。

**Q3：部分回答断了，为何不从断点继续？** 一般 SSE 文本并没有可重放的事件序号或服务端生成任务；重新生成不等于续传。真正的续传需要额外协议，本课只演示保留草稿和从头重新回答。

**Q4：Retry-After 写 30，真的要等 30 秒吗？** 它是服务器建议的等待时间（通常为 30 秒）；客户端应尊重并设置合理上限。如果超出用户可接受的等待，可提示稍后手动尝试，而不是提前密集重试。

**Q5：用户主动停止，要不要让模型自动恢复？** 不要。主动停止是用户意图，必须和网络故障区分；除非用户重新点击按钮，否则不应继续生成。

---

## 本篇总结

> **错误先分类，再决定重试；创建先保证幂等，再考虑自动化；收到半截内容不能算成功；模型完成不等于已经保存。**

至此，我们已经有了一套能解释“为什么失败、能不能安全重试、刷新后怎么恢复”的聊天系统。第 19 篇将继续完善工程中的超时、限流和观测指标，让性能与成本变得可控。

**课程进度：18 / 40 篇（45%）。**

### 参考资料

- [MDN：429 Too Many Requests](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/429)
- [MDN：Retry-After](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Retry-After)
- [MDN：使用 Fetch、AbortController](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch)
- [AWS：控制重试、指数退避与抖动](https://docs.aws.amazon.com/wellarchitected/latest/framework/rel_mitigate_interaction_failure_limit_retries.html)
- [Stripe：Idempotent requests](https://docs.stripe.com/api/idempotent_requests)
