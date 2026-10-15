<script setup lang="ts">
import AiCourseLab from './AiCourseLab.vue'
</script>
<template><article class="lesson">
<div class="meta"><span class="tag">第 03 / 40 篇</span><span>第一阶段：AI 与大模型基础</span><span>阅读约 12–15 分钟</span></div>
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
<h2>六、Causal Mask：为什么不能看到未来？</h2><p>GPT 类模型使用因果掩码：当前位置只能关注自身和之前的 Token。</p><AiCourseLab type="mask"/>
<h2>七、Transformer Block 还有什么？</h2><p>除了 Attention，还包含前馈网络、残差连接、归一化等结构，具体顺序随模型架构变化。</p><div class="visual"><div class="step">输入隐藏状态</div><div class="arrow">↓</div><div class="step">Attention + 残差连接</div><div class="arrow">↓</div><div class="step">前馈网络 + 残差连接</div><div class="arrow">↓</div><div class="step">下一层隐藏状态</div></div>
<h2>八、工程实践</h2><p>React + Node.js 聊天应用通常不需要手写 Attention。应用层重点是上下文管理、消息持久化、流式输出、RAG 和评估。</p><p><strong>Self-Attention 是模型内部机制，聊天历史管理是应用层职责。</strong></p>
<h2>学习疑问与解答</h2><h3>Q1：Self-Attention 是否根据上下文动态赋予每个 Token 语义？</h3><p>提问日期：2026-10-15</p><p><strong>更准确地说，Self-Attention 动态聚合上下文信息并更新 Token 的向量表示，而不是直接分配语义标签。</strong></p><p>同一个 Token 的初始 Embedding 可以相同，但多层 Transformer 计算后隐藏状态不同。GPT 的因果掩码还限制了当前位置能够访问的上下文。</p><p>复习要点：动态更新的是表示，不是直接给 Token 打标签。</p>
<h2>复习题</h2><ol><li>同一个 Token 为什么会形成不同的上下文表示？</li><li>Q、K、V 分别做什么？</li><li>Softmax 权重有什么特点？</li><li>GPT 为什么需要因果掩码？</li><li>Attention 与应用层聊天记忆有什么区别？</li></ol>
<footer><a href="./02-token-and-embedding">← 上一篇</a><span>第 03 篇</span></footer></article></template><style scoped>
.lesson{font-size:15px;line-height:1.85;color:var(--vp-c-text-1)}h1{font-size:30px;line-height:1.35;margin:18px 0}h2{font-size:23px;margin:34px 0 16px;border-top:1px solid var(--vp-c-divider);padding-top:12px}h3{font-size:17px;margin:18px 0 8px}p{margin:14px 0}.meta{display:flex;gap:10px;flex-wrap:wrap;font-size:12px;color:var(--vp-c-text-2)}.tag{border-radius:18px;background:rgba(22,163,74,.12);color:#16a34a;padding:4px 10px}.visual{border:1px solid var(--vp-c-divider);border-radius:14px;padding:18px;margin:20px 0}.step{background:var(--vp-c-bg-soft);border-radius:8px;padding:12px;text-align:center}.arrow{text-align:center;padding:5px;color:var(--vp-c-text-2)}.cols{display:grid;grid-template-columns:1fr 1fr;gap:10px}.panel{background:var(--vp-c-bg-soft);border-radius:8px;padding:12px}pre{background:var(--vp-code-block-bg);border-radius:10px;padding:16px;overflow:auto}pre code{white-space:pre;color:var(--vp-c-text-1)}table{display:table;width:100%}td,th{padding:8px}footer{border-top:1px solid var(--vp-c-divider);margin-top:30px;padding-top:16px;display:flex;justify-content:space-between}.formula{text-align:center;background:var(--vp-c-bg-soft);padding:18px;border-radius:10px;font-size:20px;overflow-x:auto}@media(max-width:600px){h1{font-size:24px}h2{font-size:20px}.cols{grid-template-columns:1fr}}
</style>