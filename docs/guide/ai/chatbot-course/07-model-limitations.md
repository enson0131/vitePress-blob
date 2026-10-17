---
title: "07 · 大模型的能力边界：上下文窗口、幻觉与推理限制"
outline: deep
---

<script setup>
import ContextBudget from "../../../.vitepress/theme/components/ContextBudget.vue"
import Lesson07Quiz from "../../../.vitepress/theme/components/Lesson07Quiz.vue"
</script>

# 第 07 篇：大模型的能力边界——上下文窗口、幻觉与推理限制
> 第 07 / 40 篇 · 第一阶段：AI 与大模型基础 · 阅读约 15 分钟

前六篇，我们已经了解了大语言模型如何将文字转换成 Token、利用 Transformer 处理上下文、通过训练获得能力，以及如何通过 Prefill、Decode 和 KV Cache 生成回答。

但一个能够流畅回答问题的模型，是否就意味着它能够准确回答所有问题？

答案是：**不能。**

例如：

- 为什么 ChatGPT 明明支持很长的上下文，却可能忘记文档中间的信息？
- 为什么 AI 有时候会编造不存在的 API？
- 为什么 Temperature 设置为 0，回答仍然可能出错？
- 为什么一道看似简单的数学题，大模型也可能算错？
- 如何在工程上降低这些问题带来的风险？

今天我们会从模型原理、交互实验和 TypeScript 工程实践三个角度理解这些问题。

## 一、上下文窗口：模型一次能看到多少内容？

Context Window（上下文窗口）是模型单次推理能够处理的上下文容量限制，通常以 Token 为单位衡量。

假设一个模型支持 128K Tokens 的上下文窗口。

这并不意味着你可以输入 128K Tokens 的问题，再让它无限输出回答。

在常见的共享窗口设计中：

$$
T_{\text{input}}+T_{\text{output}}\leq T_{\text{context}}
$$

还可能受到独立的最大输出长度限制。不同模型 API 的计算规则有所差异。

### 1.1 上下文窗口包含什么？

<div class="visual"><strong>上下文窗口容量示意</strong><div class="budget"><span style="flex:12;background:#64748b">系统提示</span><span style="flex:30;background:#2563eb">历史消息</span><span style="flex:38;background:#16a34a">当前输入</span><span style="flex:20;background:#d97706">输出预算</span></div><small>比例仅用于演示，不代表真实模型的固定分配。</small></div>

实际请求还可能包含工具结果、检索文档、消息格式开销等内容。

### 1.2 交互实验：上下文预算

<ContextBudget />

**工程结论：** 上下文窗口是有限资源，聊天历史、RAG 文档和输出预算需要统一管理。

## 二、为什么上下文没有超限，模型仍然可能遗漏信息？

这是比 Token 上限更值得关注的问题。

假设我们向模型输入一篇很长的文档：

```text
文档开头：公司介绍
...
文档中间：某个 API 的重要限制
...
文档结尾：使用示例
```

然后提问：

> 这个 API 有什么限制？

即使重要信息确实存在于上下文中，模型也不一定能够稳定地找到并使用它。

这种现象与长上下文中的信息定位、注意力分配和训练分布等因素有关。

相关研究常将一种典型现象称为 **Lost in the Middle（中间信息遗失）**：某些模型对位于长上下文开头或结尾的信息表现较好，而对中间信息的利用较弱。

但这不是所有模型、所有任务都必然遵循的规律。

### 2.1 信息位置与利用效果示意

<div class="visual"><strong>长上下文中不同位置的信息利用效果</strong><svg viewBox="0 0 340 190" role="img" aria-label="长上下文开头和结尾利用效果较高，中间较低的概念曲线"><path d="M35 12V160H325" fill="none" stroke="currentColor" opacity=".4"/><path d="M38 35 C100 30 110 130 180 135 S270 35 320 32" fill="none" stroke="#2563eb" stroke-width="3"/><text x="38" y="180" fill="currentColor" font-size="12">开头</text><text x="165" y="180" fill="currentColor" font-size="12">中间</text><text x="294" y="180" fill="currentColor" font-size="12">结尾</text></svg><small>概念图，不是某个模型的实测准确率曲线。</small></div>

### 2.2 如何解决？

工程上可以考虑：

- 先检索相关内容，而不是把所有文档直接塞给模型。
- 使用语义切分与重排序，提高关键片段的相关性。
- 对长文档分段提取事实，再进行汇总。
- 为关键事实保留来源、位置与引用。
- 使用专门的长上下文评估集测试不同位置的信息利用情况。

**上下文窗口越大，不等于模型对每一个位置的信息都利用得同样好。**

## 三、幻觉（Hallucination）：为什么 AI 会编造答案？

假设你向聊天机器人提问：

> React 19 是否提供 `useMagicState()` Hook？

模型可能生成：

```typescript
const [value, setValue] = useMagicState(0);
```

然后解释这个 Hook 的用途。

但这里的 `useMagicState()` 是一个人为虚构的 API 名称。

如果模型把它当成 React 官方 API 介绍，就产生了事实性错误。

### 3.1 为什么会发生？

回顾第一篇的核心原理：

**大语言模型通过学习数据中的模式来生成 Token，而不是在每次输出前自动执行事实核验。**

它可能学会了大量类似代码的结构：

```typescript
const [value, setValue] = useState(0);
```

因此，即使遇到不存在的 API 名称，也可能生成语法上合理、但事实不正确的解释。

### 3.2 幻觉不只有一种

| 类型 | 示例 |
|---|---|
| 事实幻觉 | 编造不存在的产品或历史事件 |
| 引用幻觉 | 编造论文标题、URL 或参考文献 |
| 代码幻觉 | 调用不存在的 API |
| 上下文不一致 | 回答与用户提供的文档相矛盾 |
| 推理错误 | 中间步骤或最终结论不成立 |

要特别注意：**模型表达得越自信，不代表答案越可靠。**

## 四、Temperature 设置为 0，能消除幻觉吗？

不能。

第 06 篇我们学过：

$$
P_i=\operatorname{softmax}(z_i/T)
$$

Temperature 主要影响采样分布。

低温度通常让输出更集中，但如果模型最倾向的答案本身就是错的，低温度也无法修正这个错误。

例如：

| 候选回答 | 模型偏好（假设） |
|---|---:|
| 错误答案 A | 75% |
| 正确答案 B | 20% |
| 其他答案 | 5% |

即使使用贪心解码，也可能选择错误答案 A。

因此：

**降低随机性 ≠ 提高事实正确性。**

解决幻觉通常需要结合检索、工具调用、结构化约束和结果验证。

## 五、为什么大模型会在数学和逻辑推理中出错？
模型擅长识别大量模式，但复杂推理需要保持中间状态、执行准确运算并避免步骤传播错误。语言上的连贯不等于逻辑上的有效。

例如：一个商品原价 100 元，先涨价 20%，再降价 20%，最终价格不是 100 元，而是 96 元。

$
100\times1.2\times0.8=96
$

对于金额、日期、统计和其他确定性计算，工程上应优先调用计算器、代码执行器或业务系统，而不是仅依赖自然语言生成。

## 六、RAG 能完全消除幻觉吗？
不能。RAG 通过检索外部知识为回答提供依据，但检索可能遗漏重要文档、召回错误片段，模型也可能误读来源或引用不相关证据。

<div class="visual"><strong>带证据验证的 RAG 流程</strong><div class="step">用户问题</div><div class="arrow">↓</div><div class="step">检索可信文档 + 重排序</div><div class="arrow">↓</div><div class="step">LLM 基于证据生成回答</div><div class="arrow">↓</div><div class="step">核验引用与结论；证据不足则拒答</div></div>

因此，生产级系统需要同时评估检索相关性、引用支持程度、事实正确性和拒答策略。

## 七、TypeScript：让机器人在证据不足时拒答
下面使用一个简单的检索结果判断示例。真实系统应结合多条证据、检索分数校准与模型输出验证，而不是把单一相似度阈值当作事实判定。

```typescript
type Evidence = { text: string; source: string; score: number };

function buildContext(items: Evidence[], threshold = 0.75) {
  const accepted = items.filter(x => x.score >= threshold);
  if (!accepted.length) {
    return { canAnswer: false, context: "", sources: [] as string[] };
  }
  return {
    canAnswer: true,
    context: accepted.map(x => x.text).join("\n\n"),
    sources: accepted.map(x => x.source)
  };
}

const result = buildContext([
  { text: "统一登录 SDK 提供 token 校验方法", source: "sdk.md", score: 0.91 }
]);
console.log(result);
```

这里的 0.75 只是教学阈值，不可直接作为所有 Embedding 模型的通用标准。

## 八、生产级聊天机器人的风险控制
| 风险 | 工程措施 |
| --- | --- |
| 编造 API | 官方文档检索、代码编译与测试 |
| 长上下文遗漏 | 分段处理、检索与重排序 |
| 数值计算错误 | 计算器或代码执行工具 |
| 引用不实 | 引用位置校验、证据支持评估 |
| 过度自信 | 允许拒答、表达不确定性 |
| 提示词注入 | 将外部文本视为不可信数据、最小权限 |

对企业内部机器人，尤其应关注权限边界：即使模型能找到某份文档，也不代表当前用户有权读取它。

## 九、本篇总结
**上下文窗口决定模型可处理多少内容，不保证每段内容都被同样有效地利用；幻觉来自生成机制与知识、证据和验证之间的差距；推理错误需要通过工具、评估和工程控制降低风险。**

## 十、交互式课后测验
<Lesson07Quiz />

## 十一、学习疑问与解答
### Q1：上下文窗口越大，回答一定越准确吗？
不一定。更长上下文可能提供更多证据，也可能带来噪声、成本与信息定位困难。

### Q2：Temperature 为 0，回答就完全确定吗？
不一定。较低随机性不保证事实正确，服务端数值计算和模型版本等因素也可能带来差异。

### Q3：RAG 和微调哪个更适合更新企业知识？
通常优先 RAG，因为知识可更新并保留来源；微调更适合改善特定任务行为。

### Q4：如果模型说“我非常确定”，能当作置信度吗？
不能直接当作经过校准的概率。需要独立评估和外部证据验证。

---
[← 第 06 篇](./06-inference) · [返回课程目录](./)
<style scoped>
.visual{border:1px solid var(--vp-c-divider);border-radius:14px;padding:18px;margin:20px 0}.visual strong{display:block;margin-bottom:12px}.visual small{display:block;color:var(--vp-c-text-2);font-size:12px}.budget{display:flex;min-height:44px;border-radius:8px;overflow:hidden}.budget span{display:flex;justify-content:center;align-items:center;color:white;font-size:10px;text-align:center;min-width:0}.visual svg{display:block;width:100%;max-width:440px;margin:auto}.step{background:var(--vp-c-bg-soft);border-radius:8px;padding:12px;text-align:center}.arrow{text-align:center;padding:8px;color:var(--vp-c-text-2)}
</style>
