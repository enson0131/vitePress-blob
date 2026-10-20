<script setup lang="ts">
import AiCourseLab from './AiCourseLab.vue'
import LessonQuiz from './LessonQuiz.vue'
import CourseWebArticle from './CourseWebArticle.vue'
import qkvSource from './course-sources/03-qkv-follow-up.web.html?raw'
import './course-sources/03-qkv-follow-up.web.css'
</script>
<template><article class="lesson">
<h1>Transformer 与 Attention：ChatGPT 为什么能理解上下文？</h1>
<p>「吃苹果」和「苹果发布 iPhone」中的同一个词，为什么可以呈现不同语义？关键是 Transformer 的上下文计算。</p>
<h2>一、为什么仅有 Embedding 还不够？</h2><p>相同 Token ID 通常对应相同的初始 Token Embedding，但经过 Transformer 后，会形成上下文相关的隐藏状态。</p>
<div class="visual"><div class="step">苹果：相同初始 Embedding</div><div class="arrow">↓ Self-Attention 与 Transformer</div><div class="cols"><div class="panel">🍎 吃苹果：水果相关表示</div><div class="panel">📱 苹果发布 iPhone：公司相关表示</div></div><p>注意：GPT 采用因果掩码，句首「苹果」不能直接关注后面的 iPhone；后续位置可以结合前文。</p></div>
<h2>二、Self-Attention 是什么？</h2><p>Self-Attention 让当前位置根据 Query 与 Key 的匹配程度，对允许访问位置的 Value 进行加权聚合。</p><p>例如「小明把电脑放在桌子上，因为它太重了」，模型需要综合不同位置的信息来判断「它」的可能指代。</p><AiCourseLab type="attention"/><p>注意力权重不是模型决策的完整解释。</p>
<h2>三、Q、K、V</h2><table><thead><tr><th>名称</th><th>作用</th></tr></thead><tbody><tr><td>Query</td><td>我寻找什么信息？</td></tr><tr><td>Key</td><td>我有什么匹配特征？</td></tr><tr><td>Value</td><td>我能提供什么信息？</td></tr></tbody></table>
<div class="visual"><div class="step">输入隐藏状态 X</div><div class="arrow">↓ 可训练线性投影</div><div class="cols"><div class="panel">Q = XW<sub>Q</sub></div><div class="panel">K = XW<sub>K</sub></div></div><div class="step">V = XW<sub>V</sub></div><div class="arrow">↓</div><div class="step">Attention：匹配并聚合信息</div></div>
<h2>四、Attention 数学公式</h2><div class="formula">Attention(Q,K,V) = softmax(QKᵀ / √dₖ) V</div><p>第一步计算 QKᵀ 匹配分数；第二步除以 √dₖ 缩放；第三步 Softmax 转为权重；第四步对 V 加权求和。</p>
<h3>手算示例</h3><p>假设已缩放分数为 [1,2,3]，Softmax 约为 [0.09,0.245,0.665]。</p><pre><code>V1=[1,0], V2=[0,1], V3=[1,1]
0.09×V1 + 0.245×V2 + 0.665×V3
= [0.755, 0.910]</code></pre><p>这是无因果约束的教学示例；GPT 类模型首位置不能看到未来 Token。</p>
<h2>五、Multi-Head Attention</h2><p>多个注意力头各自拥有投影参数，学习不同的关联模式。结果拼接后再经过线性投影。</p><div class="visual"><div class="step">输入 X</div><div class="arrow">↓</div><div class="cols"><div class="panel">Head 1</div><div class="panel">Head 2</div></div><div class="arrow">↓</div><div class="step">Concat + 输出投影</div></div><div class="formula">MultiHead = Concat(head₁, …, headₕ) W<sub>O</sub></div>
<h2>六、为什么 ChatGPT 不能直接看到未来的 Token？</h2>
<p>GPT 类模型通常使用 <strong>Causal Self-Attention（因果自注意力）</strong>。处理序列中的某个位置时，只能关注该位置及之前的位置，不能直接访问未来 Token。</p>
<pre><code>我 → 喜欢 → JavaScript
处理「喜欢」时：可以参考「我」「喜欢」
不能直接参考后面的「JavaScript」</code></pre>
<h3>6.1 Causal Mask 如何实现？</h3>
<p>注意力分数矩阵 S = QKᵀ / √dₖ。Softmax 之前加入掩码 M：当 j ≤ i 时 Mᵢⱼ = 0；当 j > i 时 Mᵢⱼ = −∞。</p>
<div class="formula">Attention Weights = softmax(S + M)</div>
<p>由于 exp(−∞) = 0，未来位置对应的注意力权重为 0。实现时可以采用大负数或专用掩码机制。</p>
<h3>6.2 交互实验：因果注意力矩阵</h3><AiCourseLab type="mask"/>
<h3>6.3 为什么因果掩码重要？</h3>
<p>如果训练时「喜欢」位置可以直接看到需要预测的「JavaScript」，模型就可能偷看答案。因果掩码保证训练目标符合逐 Token 生成的约束。</p>
<p><strong>注意：模型可以看到用户已经发送的完整问题，但不能提前看到自己尚未生成的回答。</strong></p>
<h2>七、Transformer Block 除了 Attention 还有什么？</h2>
<p>典型现代 GPT 类 Transformer Block 还包括前馈网络（FFN）、残差连接、归一化等机制。不同架构的顺序可能不同。</p>
<div class="visual"><strong>Transformer Block（Pre-Norm 概念示意）</strong>
<div class="step">输入隐藏状态 X</div><div class="arrow">↓</div>
<div class="step">Normalization</div><div class="arrow">↓</div>
<div class="step">Causal Self-Attention</div><div class="arrow">↓</div>
<div class="step">Residual Add（加上原始输入）</div><div class="arrow">↓</div>
<div class="step">Normalization + FFN</div><div class="arrow">↓</div>
<div class="step">Residual Add → 输出隐藏状态</div></div>
<h3>7.1 Feed Forward Network</h3>
<p>Attention 主要负责聚合上下文信息，FFN 对每个位置的隐藏状态执行非线性变换。</p>
<div class="formula">FFN(x) = W₂ σ(W₁x + b₁) + b₂</div>
<p>这是经典 FFN 的简化公式。实际现代模型可能使用门控 FFN 等变体。</p>
<h3>7.2 Residual Connection</h3><div class="formula">y = x + F(x)</div>
<p>残差连接让原始信息有直接传播路径，有助于深层网络的梯度传播与训练。</p>
<h3>7.3 Normalization</h3><p>LayerNorm 或 RMSNorm 等归一化操作有助于改善数值尺度和训练稳定性，具体位置随架构变化。</p>
<h2>八、TypeScript 工程实践：Attention 与聊天历史有什么关系？</h2>
<p><strong>Self-Attention 是模型内部机制；聊天历史管理是应用层职责。</strong>模型无法利用未传入的历史消息。</p>
<p>假设用户先说「我正在学习 React」，再问「它和 Vue 有什么区别？」。如果只发送第二句话，模型就可能缺少「它」指 React 的背景。</p>
<h3>8.1 组织多轮 Messages</h3>
<pre><code>import OpenAI from "openai";

const client = new OpenAI();
const messages = [
  { role: "system" as const, content: "你是一名前端技术导师。" },
  { role: "user" as const, content: "我正在学习 React。" },
  { role: "assistant" as const, content: "React 是一个 UI 库。" },
  { role: "user" as const, content: "它和 Vue 有什么区别？" },
];

const response = await client.chat.completions.create({
  model: "gpt-4.1-mini",
  messages,
});
console.log(response.choices[0].message.content);</code></pre>
<h3>8.2 为什么上下文窗口有限？</h3>
<p>模型有上下文长度限制。输入、系统提示词与输出需要符合相应预算；历史越来越长时，应用应裁剪较早消息、摘要或检索相关记忆。</p>
<div class="visual"><strong>上下文管理流程</strong><div class="step">完整聊天历史</div><div class="arrow">↓</div><div class="step">估算 Token 使用量</div><div class="arrow">↓</div><div class="step">保留关键历史，摘要较早消息</div><div class="arrow">↓</div><div class="step">组装 Messages 并调用 LLM</div></div>
<h3>8.3 Attention 的计算成本</h3>
<p>标准全量 Self-Attention 的分数矩阵大小为 n × n，相关计算规模通常随序列长度呈二次增长 O(n²)。实际推理性能还受 KV Cache、FlashAttention、模型结构等影响。</p>
<h2>九、本篇总结</h2>
<table><thead><tr><th>概念</th><th>作用</th></tr></thead><tbody>
<tr><td>Self-Attention</td><td>动态聚合上下文信息</td></tr>
<tr><td>Q / K / V</td><td>匹配与信息聚合</td></tr>
<tr><td>Multi-Head</td><td>从多个表示子空间学习关联</td></tr>
<tr><td>Causal Mask</td><td>禁止关注未来 Token</td></tr>
<tr><td>FFN</td><td>非线性变换隐藏状态</td></tr>
<tr><td>Residual</td><td>改善深层信息与梯度传播</td></tr>
<tr><td>Messages</td><td>应用层提供多轮上下文</td></tr>
</tbody></table>
<h2>学习疑问与解答</h2><h3>Q1：Self-Attention 是否根据上下文动态赋予每个 Token 语义？</h3><p>提问日期：2026-10-15</p><p><strong>更准确地说，Self-Attention 动态聚合上下文信息并更新 Token 的向量表示，而不是直接分配语义标签。</strong></p><p>同一个 Token 的初始 Embedding 可以相同，但多层 Transformer 计算后隐藏状态不同。GPT 的因果掩码还限制了当前位置能够访问的上下文。</p><p>复习要点：动态更新的是表示，不是直接给 Token 打标签。</p>
<h3>Q2：Q、K、V 分别代表什么？为什么要分成三个向量？</h3>
<CourseWebArticle :source="qkvSource" :chapter="3" />
<h2>十、课后练习</h2>
<LessonQuiz :chapter="3" /><ol>
<li>Self-Attention 与 Token Embedding 有什么区别？</li>
<li>Q、K、V 分别负责什么？为什么需要 Softmax？</li>
<li>如果 GPT 没有 Causal Mask，训练时会出现什么问题？</li>
<li>FFN、残差连接和归一化分别有什么作用？</li>
<li>为什么后端只发送「它和 Vue 有什么区别」可能导致回答不准确？</li>
</ol><p><strong>工程思考：</strong>如果聊天历史达到 100,000 Tokens，你会如何设计保留、摘要与检索策略？</p>
<footer><a href="./02-token-and-embedding">← 上一篇</a><span>第 03 篇</span></footer></article></template><style scoped>
.lesson{font-size:15px;line-height:1.85;color:var(--vp-c-text-1)}h1{font-size:30px;line-height:1.35;margin:18px 0}h2{font-size:23px;margin:34px 0 16px;border-top:1px solid var(--vp-c-divider);padding-top:12px}h3{font-size:17px;margin:18px 0 8px}p{margin:14px 0}.meta{display:flex;gap:10px;flex-wrap:wrap;font-size:12px;color:var(--vp-c-text-2)}.tag{border-radius:18px;background:rgba(22,163,74,.12);color:#16a34a;padding:4px 10px}.visual{border:1px solid var(--vp-c-divider);border-radius:14px;padding:18px;margin:20px 0}.step{background:var(--vp-c-bg-soft);border-radius:8px;padding:12px;text-align:center}.arrow{text-align:center;padding:5px;color:var(--vp-c-text-2)}.cols{display:grid;grid-template-columns:1fr 1fr;gap:10px}.panel{background:var(--vp-c-bg-soft);border-radius:8px;padding:12px}pre{background:var(--vp-code-block-bg);border-radius:10px;padding:16px;overflow:auto}pre code{white-space:pre;color:var(--vp-c-text-1)}table{display:table;width:100%}td,th{padding:8px}footer{border-top:1px solid var(--vp-c-divider);margin-top:30px;padding-top:16px;display:flex;justify-content:space-between}.formula{text-align:center;background:var(--vp-c-bg-soft);padding:18px;border-radius:10px;font-size:20px;overflow-x:auto}@media(max-width:600px){h1{font-size:24px}h2{font-size:20px}.cols{grid-template-columns:1fr}}
</style>
