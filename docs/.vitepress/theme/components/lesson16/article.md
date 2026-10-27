# 📘 第 16 篇：别聊一句忘一句——把聊天气泡变成真正的多轮对话

**消息状态与多轮会话｜第 16 / 40 篇｜第三阶段：工程开发｜阅读约 15–20 分钟**

上一节，文字已经能一段段冒出来，中文也不会因为拆包变乱码了。

你兴冲冲地试了一下：

> 我：我叫小陈。  
> 助手：你好！  
> 我：我叫什么？  
> 助手：抱歉，我不知道。

你看着屏幕上刚刚发出的“我叫小陈”，很想反问一句：**不就在你上面吗？**

问题是：在页面上面，不等于在模型的输入里面。手动管理多轮对话时，需要把相关历史交给下一次请求；服务商也可能提供自己的会话状态机制。[1]

**本篇采用固定 `Turn.id`，由 `status` 驱动消息状态；界面保留全部记录，模型输入选择最近 6 轮，不按状态过滤。网络层检查当前控制器，防止旧请求串话。**

今天我们做两件事：**让模型接上前文，让回复待在正确的气泡里。** 本篇新增的是应用层设计；第 15 篇的 SSE 解码与分帧继续复用，不重写一套。

## 一、先分清三份“聊天记录”

| 放在哪里 | 负责什么 | 本篇是否实现 |
|---|---|---|
| React 状态里的记录 | 让用户看见气泡、草稿和错误 | 实现 |
| 本次模型请求中的历史 | 帮助模型理解“刚才那个” | 实现，限定纯文本 |
| 后端持久化记录 | 刷新、换设备后继续读取 | 留到下一篇 |

本篇采用最容易观察的方案：**历史先放在浏览器内存里，每次发送时选出需要的问答，一起交给后端。** 刷新页面就清空；这不是数据库，也不是长期记忆。

例如，第二次请求给模型的文本输入可以是：

```json
[
  { "role": "user", "content": "我叫小陈。" },
  { "role": "assistant", "content": "你好，小陈！" },
  { "role": "user", "content": "我叫什么？" }
]
```

这才把“上一句”送到了。它提供了回答依据，但不保证模型一定答对。[1]

## 二、给每轮问答一个固定 ID，就够了

不要再让整个聊天窗口只有一个 `answer` 字符串。第二次回答会覆盖第一次；也不要每收到一个 `delta` 就新增一个气泡，否则一句话能长出几十个气泡。

本篇把“一句问题 + 一份回答”放在一个 `Turn` 中：

```typescript
type Turn = {
  id: string;          // 创建这轮问答时生成，停止、重试都不更换
  question: string;
  answer: string;
  status: Status;
  notice: string;      // 错误或未完成说明，不混进答案正文
};
```

`Status` 在下一节展开。整个会话外面仍有一个 `conversationId`：它区分哪场聊天，`Turn.id` 区分哪轮问答。

重试并不是用户又问了一个新问题，所以沿用同一个 `Turn.id` 和原问题，更新回答内容与状态即可。只有真正开始新的一轮问答，才创建新的 Turn。

用户气泡和助手气泡，可以分别用 `turn.id + ":user"`、`turn.id + ":assistant"` 标识。它们不因为文字变长或重新回答就换身份。React 列表应使用稳定的 key，不要每次渲染随机生成，也不要在会插入、删除或调整的列表里只靠数组下标认人。[2]

## 三、由 status 驱动界面，不再叠加生成编号

第一轮已经完成，第二轮正在生成。你不能让第一轮也跟着显示“思考中”。本篇给**每轮的助手回答**设置状态：

```typescript
type Status =
  | "waiting"
  | "streaming"
  | "answered"
  | "stopped"
  | "failed"
  | "incomplete"
  | "refused";
```

流程很直接：

```text
创建问答 → waiting
收到文字 → streaming
正常完成 → answered
主动停止 → stopped
调用失败 → failed
生成截断 → incomplete
拒绝回答 → refused

停止 / 失败 / 截断后重试：
同一个 Turn.id，清空草稿和提示，status 回到 waiting
```

请求可能在第一段文字之前就失败或被拒绝，不必先经过 `streaming`。只有 `waiting`、`streaming` 可以接收流式更新；终态不会被普通增量重新激活，必须经过明确的重试动作。

按钮、等待提示和气泡标签都从这些状态推导，不再额外维护一份容易不同步的 `loading` 状态。例如：

```typescript
const busy = state.turns.some(
  turn => turn.status === "waiting" || turn.status === "streaming"
);
```

**`answered` 只表示本次生成正常完成，不等于答案事实已经核验。** 当前请求控制器只处理取消和旧回调隔离，不承担界面状态。

## 四、状态管进度，控制器挡住旧请求

设想一个很讨厌的时序：请求 A 被停止，同一轮马上重试得到 B。此时 Turn 的状态又变回 `streaming`，A 的某个旧回调才执行。

**固定 ID 没错，状态也没错；但单看它们，无法知道这个回调属于 A 还是 B。** 本版不为此增加生成编号，而是复用本来就要创建的 `AbortController`。

`active.current` 保存当前请求的临时对象。下面是网络回调入口的核心片段，不是独立可运行组件；`active`、`controller` 与 `target` 在工程的 `src/App.tsx` 中创建：

```typescript
const end = await readChat(response, delta => {
  if (!ownsController(active.current, controller) || controller.signal.aborted) return;
  dispatch({ type: "delta", ...target, text: delta });
}, controller.signal);
```

`ownsController` 只是把这个比较抽成一个可复用、可测试的小函数：

```typescript
export type ControllerOwner = { controller: AbortController };

export function ownsController(
  active: ControllerOwner | null,
  controller: AbortController
): boolean {
  return active?.controller === controller;
}
```

换成 B 后，`active.current.controller` 指向 B；A 的闭包仍拿着 A 的控制器，因此进不了更新入口。控制器不是新编号，不写进 Turn，也不发送给后端。使用 ref 保存不参与渲染的请求对象，而用 state 驱动界面，职责正好分开。[8]

**增量、结束、报错都必须先检查归属；`finally` 也只能清理自己。** 被取消的请求不能继续派发普通更新；当前请求自身的超时则仍需要转换为 `failed`，所以错误处理中先检查所有权，再判断取消原因。

通过网络入口后，reducer 就只需要按会话、固定 Turn 和状态更新。下面是工程里完整的 `applyStream` 函数；相关类型在 `shared/chat-state.ts`：

```typescript
export function applyStream(state: ChatState, action: StreamAction): ChatState {
  if (state.conversationId !== action.conversationId) return state;
  const index = state.turns.findIndex(t => t.id === action.turnId);
  const turn = state.turns[index];
  if (!turn || !isPending(turn.status)) return state;

  let next: Turn;
  if (action.type === "delta") {
    next = { ...turn, answer: turn.answer + action.text, status: "streaming" };
  } else if (action.type === "end") {
    next = action.status === "incomplete"
      ? { ...turn, status: "incomplete", notice: action.text }
      : { ...turn, answer: action.text, status: action.status, notice: "" };
  } else {
    next = { ...turn, status: action.status, notice: action.notice };
  }
  return { ...state, turns: state.turns.map((t, i) => i === index ? next : t) };
}
```

函数返回新对象，不直接改原数组。配套 React 页面用 `useReducer` 管理开始、增量、结束、中止和重试，界面由当前状态决定。[3]

**边界要讲清楚：这个 reducer 不再独立识别同一 Turn 的不同请求。所有异步事件都必须经过控制器检查，不能绕开入口直接派发旧事件。** 这是面向“同一时间一个前台请求”的简化设计，不是说共享的 `status` 自己能解决所有竞态。

## 五、保留所有状态的回答，截取最近 6 轮

这里分清两个范围：**界面中保留全部 Turn 及其状态；发送给模型时，只取当前会话中最近 6 轮的用户问题和已有回答，不按 `status` 过滤。**

也就是说，`answered`、`stopped`、`failed`、`incomplete`、`refused` 等状态都不会让一轮被排除；取的是数组末尾 6 个 Turn，不是“最近 6 个成功回答”。先截取轮次，再按原顺序组装消息。

完整的 `shared/history.ts` 如下：

```typescript
import type { Turn } from "./chat-state.ts";
export type TextMessage = { role: "user" | "assistant"; content: string };
export const MAX_HISTORY_TURNS = 6;
export const MAX_HISTORY_CHARS = 24_000;

// 先取最近6轮，不按status过滤；保留问题和已有回答正文。
// 空回答不编造占位消息，notice不冒充助手回答；原始Turn不被修改。
export function buildHistory(turns: readonly Turn[]): TextMessage[] {
  const messages: TextMessage[] = turns
    .slice(-MAX_HISTORY_TURNS)
    .flatMap((turn): TextMessage[] => {
      const pair: TextMessage[] = [
        { role: "user", content: turn.question }
      ];
      if (turn.answer.trim()) {
        pair.push({ role: "assistant", content: turn.answer });
      }
      return pair;
    });
  if (messages.reduce((sum, m) => sum + m.content.length, 0) > MAX_HISTORY_CHARS) {
    throw new Error("最近6轮历史超过长度保护上限；记录未删除，请开始新会话或接入第11篇的预算管理。");
  }
  return messages;
}
```

假设已有 8 轮，第 3～8 轮中有正常回答、停止和失败的草稿，下一次请求仍选择**第 3～8 轮**。如果这 6 轮都有回答正文，就是 **6 轮、12 条历史消息**；第 1～2 轮只是不进入本次请求，仍保留在界面中。当前问题随后另加一次。

**不按状态过滤，不等于凭空补出一个回答。** 某轮尚未收到任何助手正文时，保留它的用户问题，不添加空的助手消息；例如“请用 TypeScript”之后网络立即失败，这句用户要求仍能在最近 6 轮内带入。代码只用 `trim()` 判断是否有内容，实际发送原文，不截断或改写已有答案。

`notice` 是超时、断线等界面说明，不当作助手答案发送。模型返回的实际拒绝文字则保存到 `answer`，与其他状态的正文一样参与窗口选择，不因为拒绝状态被丢掉。

**带入草稿，不等于把它认证为完整或正确。** 停止、失败、截断的回答可以保留已收到的部分；页面上的状态标签不变。本课的纯文本投影只发送 `role` 和 `content`，并不会把 `status` 自动传给模型；需要模型明确知道草稿状态时，应另行设计状态说明，而不是假设模型能看见 UI 标签。

本课仍有 24,000 字符的历史保护和 128 KiB 请求体保护。选出的最近 6 轮仍然超长，就明确报错，不进一步偷偷缩短正文或删除界面记录。字符保护不是模型 Token 预算，实际调用仍需按第 11 篇检查完整请求与输出预留。

这个窗口也有代价：第 1 轮的重要条件可能在第 7 轮以后不再被发送。长期偏好、关键约束和任务依赖仍需要第 10、11 篇介绍的记忆与预算方案。本课实现的是“选择最近 6 轮的可见文本”，不是完整推理状态或工具调用回放，也不是自动断点续写。

## 六、发送顺序：先拍快照，再加新气泡

这一轮最容易多发或漏发的，其实是当前问题。

本篇使用以下顺序：

```typescript
// 发送流程的核心片段；完整实现见 src/App.tsx。
const history = buildHistory(state.turns);
const request = {
  conversationId: state.conversationId,
  turnId: crypto.randomUUID(), // 新问题才创建；重试使用已有 Turn.id
  question: question.trim(),
  history
};

// 接着创建用户气泡与助手占位，再发出 request。
// 后端给模型组装：history + 当前 question，当前问题只加一次。
```

不要先更新 React 状态，再假设当前函数里的 `state` 已同步变新。React 状态是这次渲染的快照，调用更新函数不会立刻替换已经运行中的变量。[4]

后端收到请求后，还要重新检查字段、长度和消息顺序：最多 6 个用户问题，每个问题后可以有一条助手正文。某轮没有回答时，允许两个用户消息相邻，不再强制每轮都凑成一对。本课不接受客户端塞入 `system` 或 `developer` 角色；应用指令由后端设置。

**但检查角色不等于证明历史真实。** 浏览器送来的历史仍可以被修改；本课仅作本机学习实验。正式产品应根据已认证的用户身份，在可信后端读取其有权访问的会话，不能把客户端的 `conversationId` 当权限凭证。

**真实模型接口的边界：** 本课传的是可见的纯文本问答投影，不是完整的服务商响应回放。涉及推理项、工具调用、图片或助手 `phase` 时，不能只存两段字符串；应保留接口要求的输出项，或使用相应服务端会话机制。本例也没有同时使用 `previous_response_id`，避免把两种历史组装方法混在一起。[1][6]

## 七、重新回答：同一个 Turn，重新走一遍状态

用户点击“重新回答这一题”，本篇保留原问题和 `Turn.id`，清空旧草稿与提示，让 `status` 回到 `waiting`，并为新网络请求创建一个新的控制器。

```text
同一轮 T7：streaming → stopped → waiting → streaming → answered

Turn.id：一直是 T7
请求 A：已取消，旧回调不能进入更新入口
请求 B：新控制器，负责这次重新生成
```

这里没有给 Turn 换 ID，也没有新增 `runId`。下面是通过状态检查后重置这一轮的核心操作：

```typescript
const nextTurn = {
  ...turn,
  answer: "",
  notice: "",
  status: "waiting" as const
};
```

为什么重试时用“这一轮之前的历史”？为了让原问题只作为当前问题出现一次，也避免把被重试的草稿当成正式回答。此前历史仍按相同规则取最近 6 轮，不按状态筛选。被重试的这一轮不同时放进历史，原问题只作为当前问题发送一次。

为了让规则简单，本课仍只允许重试**最后一轮**的停止、失败或截断结果。不会自动重试拒绝，也不覆盖已有 `answered` 成功答案；保留多个回答版本或回到更早一轮重写，属于另外的产品功能。

**重新生成不是断点续传。** 它会发起新请求；真实模式下可能再次计费，不承诺接着旧答案的某个字继续。

## 八、停止与新会话：先作废控制器，再处理状态

点击停止，本篇先把 `active.current` 清空，再把对应 Turn 变成 `stopped`，最后取消旧请求。先作废所有权，是为了让旧请求接下来的错误和清理回调知道：自己已经不再是当前请求。

点击“新会话”，先走同样的取消逻辑，再换一个 `conversationId` 并清空当前界面。普通重试不换会话，也不换 Turn；只有真正开始新会话才重置这些记录。

每次新请求使用新控制器，因为一个已经中止的 signal 不能重新用于下一次正常请求。[5] 新建控制器不等于为业务记录增加一层编号。

配套实现还在 `finally` 中检查归属，下面是清理片段：

```typescript
finally {
  clearTimeout(pending.timer); // 只清理本次请求自己的计时器
  if (ownsController(active.current, controller)) {
    active.current = null;
  }
}
```

**A 的旧 `finally` 不能把 B 的控制器清掉。** 即使 A、B 对应同一个 Turn，这个对象比较仍然能把它们区分开。

本篇只允许一个前台请求进行中，没有做多个会话并行生成。新会话是“开始一场新的聊天”，不是把旧聊天放进后台继续运行。

## 九、先做四个实验，看看它到底“记住”了什么

**实验一：前一句真的发出去了吗？** 用默认模拟模式先说“我叫小陈”，再问“我叫什么？”。第二次应显示“小陈”，并报告收到了 1 轮历史。展开页面的“最近一次实际请求”，检查 `history`，不要只凭回答像记得就算验收。

模拟助手通过固定规则读取名字，**没有调用大模型，不代表获得了通用记忆能力**。

**实验二：不同状态的回答有没有保留？** 切换到“流中错误”，发送一个问题。失败后切回正常，再发新问题；只要失败轮次仍在最近 6 轮内，它的用户问题和已有回答就应该进入历史。错误提示不混进正文；如果失败前还没有正文，就只带用户问题。再试一次“拒绝”场景，检查实际拒绝文字也没有被筛掉。

**实验三：旧请求会不会污染新回答？** 生成过程中停止，再点击“重新回答这一题”。问答数量不增加，`Turn.id` 和 React key 都不变；新请求使用新控制器。配套阅读页可以注入旧请求的增量、结束、报错和清理，观察它们被忽略，而不是等网络碰巧触发竞态。

**实验四：窗口是否真的按最近 6 轮计算？** 依次产生 8 轮，其中混入停止、失败和拒绝，再检查下一次请求：应选择第 3～8 轮，不因为状态不同跳过某轮，也不回头补入更早的成功轮次。6 轮都有正文时有 12 条历史消息；某轮没有正文则少一条助手消息，窗口仍然只算 6 个 Turn。界面保留全部 8 轮。

配套工程是独立的第 16 篇项目。解压后进入 `project`，使用 Node.js 22.12 或更新版本，在终端 A 运行：

```bash
npm install
cp .env.example .env
npm run server
```

终端 B 在同一目录运行：

```bash
npm run dev
```

打开 `http://127.0.0.1:5173`。先关闭上一课占用同一端口的服务；PowerShell 用 `Copy-Item .env.example .env` 复制配置。

默认 `MODE=mock`。真实模式仍需在后端配置密钥、账号可用且支持该接口的模型，以及 `MODE=live`；不要把密钥移到带 `VITE_` 前缀的客户端变量中。[7]

这个项目没有数据库、鉴权和用户级限流，不应直接开放为公共服务。真正上线还要补消息真实性、权限、Token 预算及并发控制。

## 十、课后测验：固定 ID 后，谁能更新回答？

### 1. 屏幕有历史气泡，模型就知道上一轮吗？

A. 知道，React 会自动同步。  
B. 不一定，要看请求或会话机制实际提供了什么。  
C. 只要用 SSE 就知道。

### 2. 停止后重新回答，本版应该怎么处理？

A. 保持 Turn.id 不变，重置 status 并新建控制器。  
B. 更换 Turn.id，才允许重试。  
C. 重用已经取消的控制器。

### 3. 旧请求的 end 比新请求晚到，怎么办？

A. 它是结束事件，必须覆盖当前回答。  
B. 哪条长就用哪条。  
C. 在回调入口检查当前控制器，不匹配就忽略。

### 4. 有8轮且包含停止、失败的回答，本版如何组装历史？

A. 筛选 answered 后再取最近6轮。  
B. 直接取第3～8轮，保留用户问题和已有回答，不按状态过滤。  
C. 无论长短都发送全部8轮。

**答案：1B、2A、3C、4B。** 历史要实际送达；重试保持固定 ID；状态驱动界面、控制器隔离旧回调；最近6轮按原顺序保留，不按状态过滤。

**动手练习：** 检查“旧请求报错晚到”“旧 finally 不能清掉新控制器”“已经完成后再收到 delta”“8轮混合状态历史只选第3～8轮”四种情况。不要只测 reducer；网络入口的控制器检查也要测试。测试不能只断言状态，还要断言 ID、问答数量和新回答正文未被旧事件修改。

## 十一、学习疑问与解答

**Q1：为什么不再需要 runId，也不用重建 Turn.id？**  
本课只允许一个前台请求，重试仍属于原问答。固定 Turn.id 定位消息，status 管状态，当前控制器检查旧回调；没有必要再把生成编号存到业务记录里。

**Q2：只靠 status，连控制器检查也不要，行吗？**  
本版不这样实现。同一个 Turn 在重试前后都可能处于 streaming，仅看状态区分不了新旧回调。控制器归属检查很小，但不能在允许立即重试的流程里随意删除。

**Q3：保留所有状态，是不是发送整个会话？**  
不是。界面保留全部记录；请求只取最近6个Turn，不使用answered过滤。每轮保留用户问题和已有回答；尚无回答时只加入用户问题，不拿错误提示冒充正文。

**Q4：最近6轮仍然太长怎么办？**  
完整记录不删；本课达到长度保护时明确拒绝发送，不再偷偷减少轮次或截断某份答案。正式项目结合第11篇做Token预算、摘要或检索。

**Q5：这些检查能保证后台只生成一次吗？**  
不能。它们主要防止前端串话。后端幂等、重复提交、多标签页并发和持久化需要另外设计；Turn.id 和控制器都不是权限凭证或后端锁。

**Q6：停止的草稿与刷新后丢失的记录怎么处理？**  
停止的草稿留在页面，带未完成状态；仍处在最近6轮内时，它的已有正文也会进入历史。本篇只保存浏览器内存，刷新后清空；下一篇再讨论数据库和恢复。

---

## 本篇只带走这一句话

> **固定 Turn.id，status 驱动状态；控制器挡住旧请求；历史取最近6轮，保留所有状态的已有回答。**

第 16 篇结束。进度：**16 / 40 篇，40%**。下一篇：会话与消息持久化——刷新之后，聊天还在。

## 资料依据

本文的状态名称、固定ID方案、最近6轮、不按状态过滤的历史策略、长度保护和模拟名字问答都是教学设计，不是服务商统一规定。官方资料核对日期：2026-10-26。

[1] OpenAI：Conversation state。https://developers.openai.com/api/docs/guides/conversation-state  
[2] React：Rendering Lists。https://react.dev/learn/rendering-lists  
[3] React：useReducer；Updating Arrays in State。https://react.dev/reference/react/useReducer ，https://react.dev/learn/updating-arrays-in-state  
[4] React：useState — state as a snapshot。https://react.dev/reference/react/useState  
[5] MDN：AbortSignal。https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal  
[6] OpenAI：Create a model response。https://developers.openai.com/api/reference/resources/responses/methods/create  
[7] OpenAI：API key safety。https://help.openai.com/en/articles/5112595-best-practices-for-api-key-safety

[8] React：useRef。https://react.dev/reference/react/useRef
