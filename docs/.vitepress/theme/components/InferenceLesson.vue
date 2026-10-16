<script setup lang="ts">
import { computed, ref } from 'vue'
const temperature = ref(1)
const probabilities = computed(() => {
 const logits=[2.5,1.8,0.9,0.1]
 const e=logits.map(x=>Math.exp((x-Math.max(...logits))/temperature.value))
 const sum=e.reduce((a,b)=>a+b,0)
 return e.map(x=>x/sum)
})
const selected=ref<number[]>([])
const submitted=ref(false)
const questions=[
 {q:'Prefill 阶段主要处理什么？',opts:['整个已有输入上下文','只生成最后一个回答 Token','更新模型参数'],a:0,why:'Prefill 并行处理已有上下文并建立后续解码可复用的 KV Cache。'},
 {q:'Decode 阶段通常每轮生成多少新 Token？',opts:['全部答案同时生成','一个（逐步循环）','固定一千个'],a:1,why:'自回归解码每一步预测下一个 Token，随后继续下一步。'},
 {q:'KV Cache 主要缓存什么？',opts:['每层历史位置的 Key 和 Value','训练数据集','用户浏览器 Cookie'],a:0,why:'缓存历史 K/V，避免后续每一步都重复计算历史位置的投影。'},
 {q:'提高 Temperature 通常会产生什么影响？',opts:['输出分布更平坦，随机性可能增加','模型一定更准确','上下文窗口自动变长'],a:0,why:'Temperature 缩放 logits，较高温度一般让候选概率更均匀，但不保证更好。'}
]
const score=computed(()=>questions.filter((q,i)=>selected.value[i]===q.a).length)
function pick(i:number,j:number){const next=[...selected.value];next[i]=j;selected.value=next;submitted.value=false}
function reset(){selected.value=[];submitted.value=false}
</script>
<template>
<article class="lesson">
<div class="meta">第 06 / 40 篇 · 第一阶段：AI 与大模型基础 · 阅读约 12–15 分钟</div>
<h1>模型推理：ChatGPT 为什么一个 Token 一个 Token 地回答？</h1>
<p>上一篇我们学习了预训练、SFT 和偏好对齐。模型训练好之后，用户输入问题，它是如何在几秒钟内给出回答的？这就是 <strong>Inference（推理）</strong>。本篇重点认识 Prefill、Decode、KV Cache、Temperature、Top-p，以及聊天产品中的流式输出。</p>
<h2>一、推理不是训练</h2>
<p>训练通过梯度更新权重；普通推理使用固定的模型权重，结合当前输入预测后续 Token。你在对话里纠正一次答案，不等于模型权重立刻改变。</p>
<div class="visual"><strong>一次聊天请求的完整路径</strong><div class="step">用户发送消息</div><div class="arrow">↓</div><div class="step">Tokenizer → Token IDs</div><div class="arrow">↓</div><div class="step blue">Prefill：处理已有输入上下文</div><div class="arrow">↓</div><div class="step green">Decode：预测一个新 Token → 重复</div><div class="arrow">↓</div><div class="step">Token 解码为文本 → 流式显示</div></div>
<h2>二、Prefill：先读懂已经给出的上下文</h2>
<p>假设用户输入「请解释 React 的 useEffect」。模型首先处理 System Prompt、历史消息与当前问题等已有输入。这个阶段称为 <strong>Prefill</strong>，它可以对输入中的多个位置进行并行计算，并建立后续可复用的注意力缓存。</p>
<p>Prefill 不等于把整段问题转换为一条人工编写的摘要；它是 Transformer 对输入序列执行计算。已有上下文越长，Prefill 通常越耗时，但性能也取决于硬件、模型结构与服务端优化。</p>
<h2>三、Decode：逐 Token 生成答案</h2>
<p>Prefill 后，模型根据当前上下文预测下一个 Token。选出一个 Token 后，把它加入序列，再预测下一个。直到输出结束标记、达到长度限制或满足其他停止条件。</p>
<div class="visual"><strong>自回归解码过程</strong><div class="step">已有上下文：「React 是」</div><div class="arrow">↓ 预测</div><div class="step blue">生成：「一个」</div><div class="arrow">↓ 再预测</div><div class="step blue">生成：「用于」</div><div class="arrow">↓ 继续</div><div class="step green">生成：「构建 UI 的库……」</div><small>分词结果仅为概念示意，真实 Tokenizer 不一定按这些词切分。</small></div>
<p>这里的「逐 Token」指生成依赖关系，并不意味着所有推理计算都只能串行执行。模型内部的大量矩阵运算仍可并行。</p>
<h2>四、KV Cache：为什么不用每次重新计算全部历史？</h2>
<p>在前面的课程中，我们知道 Attention 使用 Q、K、V。自回归解码时，过去 Token 的 K/V 在标准因果注意力中可复用。因此服务端可以保存各层历史位置的 K 和 V；生成下一个 Token 时，只计算新位置所需的表示并读取历史缓存。</p>
<div class="visual"><strong>KV Cache 的复用示意</strong>
<div class="step">Prefill：计算输入序列的 K / V</div><div class="arrow">↓ 保存</div>
<div class="step blue">缓存：[K₁,V₁] [K₂,V₂] [K₃,V₃]</div><div class="arrow">↓ 生成新 Token</div>
<div class="step green">新增 [K₄,V₄]，复用历史 K/V</div>
<small>缓存按层管理；不同模型的 GQA、MQA、滑动窗口注意力和缓存策略会影响具体内存占用。</small></div>
<p><strong>代价：</strong>KV Cache 占用显存或其他存储资源，长上下文与高并发时可能成为重要瓶颈。缓存不会让注意力计算完全消失。</p>
<h2>五、Temperature：为什么同一个问题会得到不同回答？</h2>
<p>模型先计算候选 Token 的 logits，再通过采样策略选择输出。Temperature（温度）会调整概率分布的平坦程度：较低温度通常更集中，较高温度通常更分散。</p>
<div class="formula">Pᵢ = softmax(logitᵢ / T)</div>
<div class="visual"><strong>交互实验：Temperature 如何影响候选概率？</strong>
<label for="temperature">Temperature：{{temperature.toFixed(1)}}</label>
<input id="temperature" v-model.number="temperature" type="range" min="0.2" max="2" step="0.1"/>
<div v-for="(p,i) in probabilities" :key="i" class="probrow"><span>{{['编程','脚本','动态','其他'][i]}}</span><div class="track"><div class="fill" :style="{width:(p*100)+'%'}"></div></div><span>{{(p*100).toFixed(1)}}%</span></div>
<small>候选 logits 是假设数据。实际 API 的温度范围、默认值和可用性由模型提供方决定。温度趋近零时通常采用贪心式选择，但不保证整个服务完全确定。</small></div>
<h2>六、Top-p 与 Temperature 有什么区别？</h2>
<p><strong>Temperature</strong> 改变候选 Token 的概率分布；<strong>Top-p（核采样）</strong> 则通常按照概率从高到低排列，只保留累计概率达到阈值 p 的最小候选集合，再从中采样。</p>
<table><thead><tr><th>参数</th><th>主要作用</th></tr></thead><tbody><tr><td>Temperature</td><td>调整概率分布的集中程度</td></tr><tr><td>Top-p</td><td>限制参与采样的候选集合</td></tr><tr><td>Max output tokens</td><td>限制最大生成长度</td></tr></tbody></table>
<p>这些参数不会直接让模型学到新知识，也不能保证消除幻觉。很多 API 建议优先调整 Temperature 或 Top-p 中的一个，而不是同时大幅修改。</p>
<h2>七、TTFT、TPS：为什么聊天机器人有时很慢？</h2>
<table><thead><tr><th>指标</th><th>含义</th></tr></thead><tbody><tr><td>TTFT</td><td>Time to First Token，首个输出 Token 的等待时间</td></tr><tr><td>TPS</td><td>Tokens Per Second，每秒生成 Token 数</td></tr><tr><td>端到端延迟</td><td>从发起请求到完整回答结束的时间</td></tr></tbody></table>
<p>TTFT 受到排队、网络、Prefill 等因素影响；TPS 受到 Decode、硬件、并发、缓存和模型大小影响。实际产品还应观察 P95/P99 延迟，而不只是平均值。</p>
<h2>八、TypeScript：如何实现流式聊天？</h2>
<p>在 Node.js 后端调用支持流式输出的模型 API，前端可以逐步渲染内容，而不必等完整回答结束。以下使用 OpenAI Chat Completions 风格的示例：</p>
<pre><code>import OpenAI from 'openai'
const client = new OpenAI()

const stream = await client.chat.completions.create({
  model: 'gpt-4.1-mini',
  messages: [
    { role: 'user', content: '解释什么是 KV Cache' }
  ],
  stream: true
})

for await (const chunk of stream) {
  const text = chunk.choices[0]?.delta?.content
  if (text) process.stdout.write(text)
}</code></pre>
<p>这个示例在 Node.js 终端输出增量文本。真实聊天应用还需要把流传给浏览器，处理用户取消、超时、错误、内容审核和消息持久化。<strong>流式显示不等于模型一次性生成整段回答。</strong></p>
<h2>九、工程实践：如何优化推理体验？</h2>
<p>首先区分首 Token 慢还是持续生成慢。前者可以检查输入上下文长度、请求排队与 Prefill；后者检查 Decode 性能、并发和输出长度。对于业务系统，还可以采用流式渲染、合理的上下文裁剪、提示词缓存和模型分级路由。</p>
<p>优化前应建立基线：记录 TTFT、TPS、错误率、每请求 Token 用量与实际费用，避免只凭体感判断性能。</p>
<h2>十、本篇总结</h2>
<p><strong>Prefill 处理已有上下文，Decode 逐步生成新 Token，KV Cache 复用历史 Key/Value；Temperature 和 Top-p 控制采样行为，流式输出改善用户等待体验。</strong></p>
<h2>十一、交互式课后测验</h2>
<div class="visual"><div v-for="(q,i) in questions" :key="i" class="question"><strong>{{i+1}}. {{q.q}}</strong><label v-for="(o,j) in q.opts" :key="j" class="option"><input type="radio" :name="'chapter6-'+i" :checked="selected[i]===j" @change="pick(i,j)"/>{{o}}</label><p v-if="submitted" class="feedback">{{selected[i]===q.a?'✓ 回答正确':'正确答案：'+q.opts[q.a]}}。{{q.why}}</p></div><div class="buttons"><button :disabled="questions.some((_,i)=>selected[i]===undefined)" @click="submitted=true">提交评分</button><button @click="reset">重新作答</button></div><div v-if="submitted" class="score">得分：{{score}} / {{questions.length}}</div></div>
<h2>十二、学习疑问与解答</h2>
<h3>Q1：有了 KV Cache，Attention 的计算就没有成本了吗？</h3><p>不是。KV Cache 省去历史 K/V 的重复计算，但新 Token 仍需与可访问的历史位置计算注意力，而且缓存需要显存。</p>
<h3>Q2：Temperature 设为零，就一定得到完全相同的回答吗？</h3><p>不一定。贪心选择降低采样随机性，但并行数值计算、服务端实现和模型版本等因素仍可能造成差异。</p>
<h3>Q3：为什么用户已经发出的完整问题不违反 Causal Mask？</h3><p>问题在生成开始前已作为输入上下文存在；因果掩码限制的是模型在某个序列位置访问未来位置，而不是禁止它阅读用户已经提供的内容。</p>
<h3>Q4：SSE 和 Token 生成是一回事吗？</h3><p>不是。Token 生成发生在模型推理层；SSE 等协议负责把服务端的增量事件传给浏览器。一次网络事件也不一定严格对应一个 Token。</p>
<footer><a href="./05-llm-training">← 第 05 篇</a><a href="./">课程目录</a></footer>
</article>
</template>
<style scoped>
.lesson{font-size:15px;line-height:1.85;color:var(--vp-c-text-1);overflow-wrap:anywhere}.meta{font-size:12px;color:var(--vp-c-text-2)}h1{font-size:30px;line-height:1.35;margin:16px 0 24px}h2{font-size:23px;margin:36px 0 18px;border-top:1px solid var(--vp-c-divider);padding-top:12px}h3{font-size:17px;margin:20px 0 10px}p{margin:14px 0}.visual{border:1px solid var(--vp-c-divider);border-radius:14px;padding:18px;margin:20px 0}.visual>strong{display:block;margin-bottom:12px}.visual>small,.step small{display:block;font-size:12px;color:var(--vp-c-text-2);margin-top:8px}.step{background:var(--vp-c-bg-soft);border-radius:8px;padding:12px;text-align:center}.blue{background:rgba(37,99,235,.09)}.green{background:rgba(22,163,74,.09)}.arrow{text-align:center;padding:7px;color:var(--vp-c-text-2)}.formula{text-align:center;background:var(--vp-c-bg-soft);padding:18px;border-radius:9px;font-size:19px;overflow-x:auto}table{display:table;width:100%;font-size:14px}td,th{padding:9px}pre{background:var(--vp-code-block-bg);border-radius:10px;padding:18px;overflow:auto}pre code{font-size:13px;white-space:pre;color:var(--vp-c-text-1)}label{display:block;margin:10px 0}input[type=range]{display:block;width:100%;accent-color:var(--vp-c-brand-1)}.probrow{display:flex;gap:8px;align-items:center;margin:10px 0;font-size:13px}.probrow>span:first-child{width:38px}.probrow>span:last-child{width:55px;text-align:right}.track{flex:1;background:var(--vp-c-bg-soft);border-radius:10px;height:13px;overflow:hidden}.fill{height:100%;background:#2563eb;border-radius:10px}.option{padding:8px;border:1px solid var(--vp-c-divider);border-radius:8px;cursor:pointer}.option input{margin-right:8px}.question{padding:14px 0;border-bottom:1px solid var(--vp-c-divider)}.feedback{background:var(--vp-c-bg-soft);padding:10px;border-radius:8px}.buttons{display:flex;gap:10px;margin-top:15px}.buttons button{background:var(--vp-c-bg-soft);border:1px solid var(--vp-c-divider);border-radius:8px;padding:8px 14px;cursor:pointer}.buttons button:disabled{opacity:.4}.score{text-align:center;font-size:22px;font-weight:bold;margin:15px}footer{display:flex;justify-content:space-between;border-top:1px solid var(--vp-c-divider);padding-top:16px;margin-top:30px}@media(max-width:600px){h1{font-size:24px}h2{font-size:20px}.visual{padding:12px}}
</style>