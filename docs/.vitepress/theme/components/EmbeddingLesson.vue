<script setup lang="ts">
import AiCourseLab from './AiCourseLab.vue'
const toc=['Token：AI 眼中的文字','Embedding：把文字转换成向量','为什么向量能够表示语义','Embedding 是如何学习出来的','余弦相似度','TypeScript 工程实践','Token 成本','Embedding 与 Transformer','RAG 应用','学习疑问与解答']
</script>
<template>
<article class="ai-html-lesson">
<header>
  <div class="metadata"><span class="tag">第 02 / 40 篇</span><span>第一阶段：AI 与大模型基础</span><span>阅读约 10 分钟</span></div>
  <h1>Token 与 Embedding：为什么 AI 能把文字变成数学？</h1>
  <p>上一篇我们学习了 ChatGPT 的基本工作流程：用户输入 → Tokenization → Transformer → 预测下一个 Token → 生成回答。</p>
  <p><strong>计算机只认识数字，为什么 ChatGPT 能知道「苹果」和「香蕉」在语义上比较接近？</strong></p>
  <p>答案就在两个核心概念里：Token 与 Embedding。</p>
</header>
<section id="token"><h2>一、Token：AI 眼中的文字</h2><p>模型不会直接处理字符串，而是先通过 Tokenizer 将文本转换为 Token ID。</p>
<div class="visual"><strong>第一步：文本分词（示意）</strong><div class="step">我是一名前端开发工程师</div><div class="arrow">↓</div><div class="chips"><span v-for="w in ['我','是一名','前端','开发','工程师']" :key="w">{{w}}</span></div><div class="arrow">↓</div><div class="chips numbers"><span v-for="n in [123,456,789,234,567]" :key="n">{{n}}</span></div><small>分词和 ID 仅为示意，不是真实 Tokenizer 输出。</small></div>
<h3>为什么不直接按照汉字分词？</h3><p>模型需要处理多种语言、代码和符号，例如 JavaScript、useState、console.log()、日期等。常见的 Tokenizer 使用 BPE 等策略。</p><p><strong>Token 数量不等于字数，也不等于单词数。</strong></p></section>
<section id="embedding"><h2>二、Embedding：把文字转换成向量</h2><p>Token ID 只是编号，例如「苹果 → 1024」并不能直接表达「水果」的含义。Embedding 将离散编号映射为连续向量：</p>
<pre><code>苹果 → [0.82, 0.71, 0.13, ...]
香蕉 → [0.79, 0.75, 0.18, ...]
汽车 → [0.12, 0.09, 0.91, ...]</code></pre>
<p>以上为教学假设。真实向量可能有数百至数千维，单个维度通常没有固定的人类可解释含义。</p></section>
<section id="space"><h2>三、为什么向量能够表示语义？</h2><p>在经过训练的语义 Embedding 空间中，相关文本往往具有较高相似度。例如「苹果」和「香蕉」可能比「苹果」和「汽车」更接近。</p>
<div class="visual"><strong>语义向量空间（概念示意）</strong><svg viewBox="0 0 340 225" aria-label="苹果与香蕉接近，汽车较远的二维概念图" role="img"><g stroke="currentColor" opacity=".1"><path d="M25 15 V202 H330"/></g><ellipse cx="105" cy="75" rx="78" ry="55" fill="#16a34a" fill-opacity=".09" stroke="#16a34a" stroke-opacity=".4" stroke-dasharray="4 4"/><circle cx="76" cy="55" r="7" fill="#16a34a"/><text x="86" y="49">苹果</text><circle cx="135" cy="90" r="7" fill="#16a34a"/><text x="145" y="84">香蕉</text><circle cx="267" cy="156" r="7" fill="#2563eb"/><text x="278" y="150">汽车</text><text x="28" y="14" font-size="10">维度 2</text><text x="290" y="218" font-size="10">维度 1</text></svg><small>人为绘制的二维投影示意，不是真实 Embedding 模型的计算结果。</small></div>
<p>语义信息通常分布在多个维度中，不能简单把某个维度等同于「水果属性」。同一个词还可能有不同含义，例如「苹果」也可能指科技公司。</p></section>
<section id="training"><h2>四、Embedding 是如何学习出来的？</h2><div class="columns"><div class="panel"><strong>Token Embedding</strong><p>LLM 内部的 Token ID 到向量映射，通常随语言模型的训练一起优化。</p></div><div class="panel"><strong>Text Embedding</strong><p>用于句子、文档语义检索，常通过对比学习等方式训练。</p></div></div><p>例如「如何使用 React 管理状态？」和「React 状态管理怎么做？」应比「广州天气如何？」更接近。</p></section>
<section id="cosine"><h2>五、如何计算两个向量的相似度？</h2><p>常用方法是 Cosine Similarity（余弦相似度）。</p>
<div class="formula" role="img" aria-label="余弦相似度等于 A 点乘 B 除以 A 和 B 的模长乘积"><span>sim(A,B) = </span><span class="fraction"><span>A · B</span><span>‖A‖ ‖B‖</span></span></div>
<p>非零向量的余弦相似度范围为 -1 到 1。越接近 1，方向越一致；但这不能保证事实正确。</p><AiCourseLab type="cosine"/><p>在 RAG 中可以用向量相似度检索相关片段，但还需要重排序、过滤和质量评估。</p></section>
<section id="typescript"><h2>六、TypeScript 如何使用 Embedding？</h2><p>通过 Embedding API 将文本转换为向量，示例如下：</p>
<pre><code>import OpenAI from "openai";

const client = new OpenAI();

async function getEmbedding(text: string) {
  const result = await client.embeddings.create({
    model: "text-embedding-3-small",
    input: text,
  });
  return result.data[0].embedding;
}

const vector = await getEmbedding("如何使用 React 管理状态？");
console.log(vector.length); // 默认 1536 维</code></pre>
<p>可以将向量保存到 PostgreSQL + pgvector、Qdrant 等数据库。查询与文档向量必须采用兼容的模型和配置。</p></section>
<section id="cost"><h2>七、Token 为什么会影响聊天机器人的成本？</h2><p>API 往往根据 Token 用量计费。假设输入每百万 Token 为 $1、输出为 $4，下面的计算器可以模拟费用。</p><AiCourseLab type="cost"/><p>多轮对话可能反复传入历史消息，导致同一段上下文多次消耗输入 Token。因此生产系统需要历史裁剪、摘要和长期记忆。</p></section>
<section id="transformer"><h2>八、Embedding 和 Transformer 的关系</h2><div class="visual"><strong>LLM 内部的数据流（简化）</strong><div class="stack"><template v-for="(s,i) in ['用户输入','Tokenizer：文本 → Token ID','Token Embedding：ID → 向量','Transformer：上下文计算','输出层：下一个 Token 概率','生成回答']" :key="s"><div class="step">{{s}}</div><div v-if="i<5" class="arrow">↓</div></template></div></div><p>Embedding 提供初始表示，Transformer 结合上下文不断更新隐藏状态；还会使用位置信息、残差连接等机制。</p></section>
<section id="rag"><h2>九、实际工程中什么时候需要 Embedding？</h2><table><thead><tr><th>场景</th><th>是否需要单独调用 Embedding API</th></tr></thead><tbody><tr><td>普通聊天</td><td>通常不需要</td></tr><tr><td>多轮聊天</td><td>通常不需要</td></tr><tr><td>企业知识库问答（RAG）</td><td>通常需要</td></tr></tbody></table>
<div class="visual"><strong>企业知识库问答</strong><div class="stack"><template v-for="(s,i) in ['员工提问：统一登录 SDK 如何接入？','Text Embedding 生成查询向量','向量数据库检索相关 SDK 文档','相关内容进入 LLM 上下文','生成有文档依据的回答']" :key="s"><div class="step">{{s}}</div><div v-if="i<4" class="arrow">↓</div></template></div></div></section>
<section id="qa"><h2>十、学习疑问与解答</h2><h3>Q1：是不是不同方向的投影，就会有不同的语义？</h3><small>提问日期：2026-10-15</small><p><strong>结论：区分「向量方向」与「投影方向」。</strong></p><ul><li>原始向量的方向可能反映语义关系，但语义分布在多个维度中。</li><li>投影方向只是观察高维向量的方式，不改变原始向量。</li><li>不同投影可能突出不同特征，也可能丢失信息；二维相近不一定代表高维相近。</li></ul><p>类比：三维物体从正面和侧面看轮廓不同，但物体本身没有改变。</p></section>
<section id="summary"><h2>十一、本篇总结与练习</h2><table><thead><tr><th>概念</th><th>作用</th></tr></thead><tbody><tr><td>Token</td><td>文本处理单位</td></tr><tr><td>Token ID</td><td>离散编号</td></tr><tr><td>Token Embedding</td><td>将 Token ID 映射为向量</td></tr><tr><td>Text Embedding</td><td>语义检索向量</td></tr><tr><td>Cosine Similarity</td><td>衡量非零向量方向相似度</td></tr></tbody></table><AiCourseLab type="quiz"/><p><strong>核心记忆：</strong>Token 解决文本如何进入模型，Embedding 解决如何表示成可计算向量，Transformer 利用上下文处理这些表示。</p></section>
<footer><a href="./01-how-chatgpt-works">← 第 01 篇</a><a href="./03-transformer-attention">第 03 篇 →</a></footer>
</article>
</template>
<style scoped>
.ai-html-lesson{font-size:15px;line-height:1.85;color:var(--vp-c-text-1);max-width:100%;overflow-wrap:anywhere}
.ai-html-lesson h1{font-size:30px;line-height:1.35;letter-spacing:-.4px;margin:16px 0 24px}
.ai-html-lesson h2{font-size:23px;line-height:1.4;margin:36px 0 18px;padding-top:12px;border-top:1px solid var(--vp-c-divider)}
.ai-html-lesson h3{font-size:17px;margin:22px 0 10px}
.ai-html-lesson p{margin:14px 0}
.ai-html-lesson section{scroll-margin-top:80px}
.metadata{display:flex;flex-wrap:wrap;gap:10px;color:var(--vp-c-text-2);font-size:12px;align-items:center}
.tag{background:rgba(22,163,74,.12);color:var(--vp-c-green-1,#16a34a);border-radius:30px;padding:4px 10px;font-weight:600}
.visual{border:1px solid var(--vp-c-divider);border-radius:14px;padding:20px;margin:20px 0}
.visual>strong{display:block;font-size:14px;margin-bottom:12px}
.visual>small{display:block;text-align:center;color:var(--vp-c-text-2);font-size:12px}
.visual svg{width:100%;max-width:400px;display:block;margin:0 auto}
.visual svg text{fill:var(--vp-c-text-1);font-size:13px}
.step{background:var(--vp-c-bg-soft);padding:14px 16px;border-radius:8px;text-align:center;border:1px solid var(--vp-c-divider)}
.arrow{text-align:center;color:var(--vp-c-text-2);padding:8px}
.chips{display:flex;flex-wrap:wrap;gap:6px;justify-content:center}
.chips span{padding:8px 12px;border:1px solid rgba(59,130,246,.3);background:rgba(59,130,246,.08);border-radius:7px}
.chips.numbers span{background:var(--vp-c-bg-soft);border-color:var(--vp-c-divider)}
.stack{max-width:360px;margin:auto}
.columns{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.panel{border:1px solid var(--vp-c-divider);border-radius:10px;padding:16px;background:var(--vp-c-bg-soft)}
.panel p{font-size:13px}
.formula{display:flex;justify-content:center;align-items:center;gap:12px;font-family:Georgia,serif;font-size:24px;padding:28px 8px}
.fraction{display:inline-flex;flex-direction:column;text-align:center;line-height:1.4}
.fraction span:first-child{border-bottom:1.5px solid currentColor;padding:0 12px}
.ai-html-lesson pre{background:var(--vp-code-block-bg);padding:20px;overflow:auto;border-radius:12px;line-height:1.65}
.ai-html-lesson pre code{font-size:13px;color:var(--vp-c-text-1);white-space:pre}
.ai-html-lesson table{display:table;width:100%;font-size:14px}
.ai-html-lesson th,.ai-html-lesson td{padding:10px}
.ai-html-lesson footer{display:flex;justify-content:space-between;gap:12px;margin-top:36px;border-top:1px solid var(--vp-c-divider);padding-top:20px}
@media(max-width:600px){.ai-html-lesson h1{font-size:24px}.ai-html-lesson h2{font-size:20px}.columns{grid-template-columns:1fr}.visual{padding:12px}}
</style>