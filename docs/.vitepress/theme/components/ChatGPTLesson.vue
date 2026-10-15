<script setup lang="ts">
import LessonQuiz from './LessonQuiz.vue'
</script>
<template>
<article class="lesson">
<header>
<h1>第 01 篇：ChatGPT 到底是如何回答问题的？</h1>
<p class="sub">所属阶段：AI 与大模型基础　｜　阅读时间：约 8 分钟　｜　前置知识：无</p>
</header>
<section><h2>1. 先理解一个关键事实</h2>
<p>当你向 ChatGPT 提问：</p><blockquote>为什么 JavaScript 是单线程的？</blockquote>
<p>你可能认为 ChatGPT 的工作流程是：</p>
<pre><code>接收问题
   ↓
理解问题
   ↓
查找正确答案
   ↓
输出答案</code></pre>
<p>但对于基础的大语言模型而言，更接近真实情况的过程是：</p>
<div class="visual"><strong>大语言模型的自回归生成流程</strong>
<svg viewBox="0 0 400 570" role="img" aria-label="用户输入、Tokenization、Token ID、Transformer、下一个 Token 概率、选择 Token、是否结束及循环">
<defs><marker id="arrow01" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto"><path d="M0 0 L7 3.5 L0 7Z" fill="#64748b"/></marker></defs>
<g v-for="(item,i) in [{label:'用户输入',y:12},{label:'Tokenization（分词）',y:86},{label:'转换成 Token ID',y:160},{label:'Transformer 模型计算',y:234},{label:'预测下一个 Token 的概率',y:308},{label:'选择下一个 Token',y:382}]" :key="i">
<rect x="83" :y="item.y" width="234" height="46" rx="8" fill="#6366f1" fill-opacity=".10" stroke="#8b5cf6" stroke-opacity=".65"/>
<text x="200" :y="item.y+29" text-anchor="middle" font-size="15" fill="currentColor">{{item.label}}</text>
<path v-if="i<5" :d="'M200 '+(item.y+46)+' V'+(item.y+73)" fill="none" stroke="#64748b" stroke-width="1.5" marker-end="url(#arrow01)"/>
</g>
<path d="M200 428 L244 470 L200 512 L156 470 Z" fill="#6366f1" fill-opacity=".1" stroke="#8b5cf6"/>
<text x="200" y="475" text-anchor="middle" font-size="13" fill="currentColor">是否结束？</text>
<path d="M244 470 H365 V257 H317" fill="none" stroke="#64748b" stroke-width="1.5" marker-end="url(#arrow01)"/>
<text x="344" y="455" font-size="13" fill="currentColor">否</text>
<path d="M200 512 V530" fill="none" stroke="#64748b" stroke-width="1.5" marker-end="url(#arrow01)"/>
<rect x="130" y="533" width="140" height="33" rx="7" fill="#6366f1" fill-opacity=".10" stroke="#8b5cf6"/>
<text x="200" y="554" text-anchor="middle" font-size="14" fill="currentColor">输出答案</text>
<text x="211" y="528" font-size="12" fill="currentColor">是</text>
</svg></div>
<p>这里最重要的概念是：<strong>大语言模型的核心生成机制，是根据已有上下文预测接下来应该出现什么 Token。</strong></p>
<p>它不是传统意义上的数据库查询系统。现代 ChatGPT 产品还可能结合搜索、工具调用、记忆等能力，因此完整产品比单纯的大语言模型复杂得多。</p>
</section>
<section><h2>2. Token 是什么？</h2>
<p>Token 是模型处理文本时使用的基本单位。</p><p>例如：</p>
<pre><code>用户输入：
我是一名前端开发工程师</code></pre>
<p>经过 Tokenizer 处理后，可能变成：</p>
<pre><code>["我", "是一名", "前端", "开发", "工程师"]</code></pre>
<p>这里只是示意。不同模型使用不同 Tokenizer，实际切分结果可能不同。</p>
<p>随后，每个 Token 会被转换为数字 ID：</p>
<pre><code>"我"      → 123
"是一名"  → 456
"前端"    → 789
"开发"    → 234
"工程师"  → 567</code></pre>
<p>这些 ID 同样只是示例。</p>
<h3>为什么需要 Token？</h3><p>因为神经网络不能直接对字符串进行数学运算，它需要数值表示。因此文本必须经过编码，才能进入模型。</p></section>
<section><h2>3. 模型如何生成回答？</h2>
<p>假设用户输入：</p><pre><code>JavaScript 是一种</code></pre>
<p>模型会计算不同 Token 作为下一个输出的概率，例如：</p>
<table><thead><tr><th>候选 Token</th><th>假设概率</th></tr></thead><tbody><tr><td>编程</td><td>65%</td></tr><tr><td>脚本</td><td>20%</td></tr><tr><td>动态</td><td>10%</td></tr><tr><td>其他</td><td>5%</td></tr></tbody></table>
<p>假设选中了「编程」，上下文就变成：</p><pre><code>JavaScript 是一种编程</code></pre>
<p>接下来模型再次计算：</p><pre><code>语言 → 85%
工具 → 8%
框架 → 4%
其他 → 3%</code></pre>
<p>最终可能生成：</p><pre><code>JavaScript 是一种编程语言。</code></pre>
<p>这就是自回归生成（Autoregressive Generation）的基本思想。</p>
<p>需要注意，模型并不是每次都简单选择概率最高的 Token。实际生成还可能受到 Temperature、Top-p 等采样参数影响。</p></section>
<section><h2>4. Transformer 在其中负责什么？</h2>
<p>Transformer 是现代大语言模型广泛使用的神经网络架构。它的一个核心机制叫作 <strong>Attention（注意力机制）</strong>。</p>
<p>举个例子：</p><blockquote>小明把电脑放在桌子上，因为它太重了。</blockquote>
<p>这里的「它」指什么？模型需要结合上下文，判断「它」更可能指电脑，而不是桌子。</p>
<p>Attention 可以帮助模型在处理某个位置时，利用其他位置的信息。不过，Attention 不等同于人类的理解能力，也不是简单的关键词匹配。</p>
<p>它通过训练得到的参数，计算不同 Token 表示之间的关联，并利用这些关联构建上下文表示。</p>
<p>在现代生成式语言模型中，通常使用带因果掩码的 Self-Attention，确保生成当前位置时不能直接看到未来尚未生成的 Token。</p></section>
<section><h2>5. 为什么 ChatGPT 能回答编程问题？</h2>
<p>原因主要来自预训练。模型在训练阶段接触大量文本及代码相关数据，通过预测 Token 学习语言、代码和知识中的统计规律。</p>
<p>例如，模型可能在训练过程中学习到：</p>
<pre><code>const sum = (a, b) => a + b;</code></pre>
<p>以及大量类似的代码结构。因此，当你提问「如何使用 JavaScript 实现防抖？」时，模型可以根据训练中学到的规律生成代码。</p>
<p>但需要区分：<strong>能够生成看起来正确的代码，不代表代码一定正确。</strong></p>
<p>这也是为什么 AI 编程需要测试、静态检查和人工审查。</p></section>
<section><h2>6. 从前端开发的角度理解整个流程</h2>
<p>假设我们开发一个 AI 聊天机器人，前端使用 React，后端使用 Node.js。</p>
<div class="visual"><strong>React + Node.js + LLM API 架构</strong>
<svg viewBox="0 0 430 470" role="img" aria-label="React UI 到 Node.js API 再到 LLM API，流式返回 React UI 的架构图">
<defs><marker id="arch01" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto"><path d="M0 0 L7 3.5 L0 7Z" fill="#64748b"/></marker></defs>
<g v-for="(item,i) in [{name:'React UI',detail:'用户输入聊天内容',y:10},{name:'Node.js API',detail:'鉴权、构建 Messages、调用模型',y:126},{name:'LLM API',detail:'Tokenization、Transformer、生成',y:242},{name:'React UI',detail:'实时显示模型回答',y:358}]" :key="i">
<rect x="80" :y="item.y" width="270" height="75" rx="9" fill="#6366f1" fill-opacity=".10" stroke="#8b5cf6" stroke-opacity=".6"/>
<text x="215" :y="item.y+29" text-anchor="middle" font-size="18" fill="currentColor">{{item.name}}</text>
<text x="215" :y="item.y+53" text-anchor="middle" font-size="12" fill="currentColor">{{item.detail}}</text>
<path v-if="i<3" :d="'M215 '+(item.y+75)+' V'+(item.y+110)" stroke="#64748b" fill="none" stroke-width="1.5" marker-end="url(#arch01)"/>
</g>
<text x="228" y="110" font-size="12" fill="currentColor">HTTP Request</text>
<text x="228" y="226" font-size="12" fill="currentColor">API Request</text>
<text x="228" y="342" font-size="12" fill="currentColor">Streaming</text>
</svg></div>
<p>这里有一个非常重要的工程概念：<strong>聊天机器人应用与大语言模型不是同一个东西。</strong></p>
<p>大语言模型负责生成内容，而聊天机器人应用还需要解决身份认证、会话管理、数据存储、流式传输、权限控制等问题。</p></section>
<section><h2>7. 今天需要记住的 5 个概念</h2>
<table><thead><tr><th>概念</th><th>一句话理解</th></tr></thead><tbody><tr><td>LLM</td><td>通过大规模训练获得语言生成能力的模型</td></tr><tr><td>Token</td><td>模型处理文本的基本单位</td></tr><tr><td>Tokenizer</td><td>将文本编码为 Token ID 的组件</td></tr><tr><td>Transformer</td><td>现代大语言模型常用的神经网络架构</td></tr><tr><td>Attention</td><td>让模型在处理 Token 时利用上下文信息的机制</td></tr></tbody></table>
<h3>学习疑问与解答</h3><p>目前暂无本篇新增的学习疑问，后续会持续补充。</p>
<LessonQuiz :chapter="1"/>
<h3>思考题</h3><p>为什么 ChatGPT 有时候会一本正经地给出错误答案？提示：思考一下「预测下一个 Token」和「验证事实是否正确」之间有什么区别。</p>
<p>这道题会在第 13 篇《为什么大语言模型会产生幻觉？》中深入解释。</p></section>
<footer><span>第 01 / 40 篇</span><a href="./02-token-and-embedding">下一篇：Token 与 Embedding →</a></footer>
</article>
</template>
<style scoped>
.lesson blockquote{border-left:3px solid var(--vp-c-divider);padding:6px 14px;color:var(--vp-c-text-2);margin:14px 0}.lesson .sub{color:var(--vp-c-text-2);font-size:13px}.lesson{font-size:15px;line-height:1.85;color:var(--vp-c-text-1)}h1{font-size:30px;line-height:1.35;margin:18px 0}h2{font-size:23px;margin:34px 0 16px;border-top:1px solid var(--vp-c-divider);padding-top:12px}h3{font-size:17px;margin:18px 0 8px}p{margin:14px 0}.meta{display:flex;gap:10px;flex-wrap:wrap;font-size:12px;color:var(--vp-c-text-2)}.tag{border-radius:18px;background:rgba(22,163,74,.12);color:#16a34a;padding:4px 10px}.visual svg{display:block;width:100%;max-width:480px;margin:0 auto}.visual{border:1px solid var(--vp-c-divider);border-radius:14px;padding:18px;margin:20px 0}.step{background:var(--vp-c-bg-soft);border-radius:8px;padding:12px;text-align:center}.arrow{text-align:center;padding:5px;color:var(--vp-c-text-2)}.cols{display:grid;grid-template-columns:1fr 1fr;gap:10px}.panel{background:var(--vp-c-bg-soft);border-radius:8px;padding:12px}pre{background:var(--vp-code-block-bg);border-radius:10px;padding:16px;overflow:auto}pre code{white-space:pre;color:var(--vp-c-text-1)}table{display:table;width:100%}td,th{padding:8px}footer{border-top:1px solid var(--vp-c-divider);margin-top:30px;padding-top:16px;display:flex;justify-content:space-between}.formula{text-align:center;background:var(--vp-c-bg-soft);padding:18px;border-radius:10px;font-size:20px;overflow-x:auto}@media(max-width:600px){h1{font-size:24px}h2{font-size:20px}.cols{grid-template-columns:1fr}}
</style>