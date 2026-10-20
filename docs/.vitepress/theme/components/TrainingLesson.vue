<script setup lang="ts">
import { ref, computed } from 'vue'
const probability=ref(20)
const loss=computed(()=>-Math.log(probability.value/100))
const scores=ref<number[]>([])
const submitted=ref(false)
const questions=[
{q:'预训练自回归语言模型主要学习什么？',options:['预测下一个 Token','直接查询数据库','自动验证事实'],answer:0,why:'自回归预训练以预测下一个 Token 为核心目标，训练损失不直接衡量事实正确性。'},
{q:'正确 Token 的预测概率从 0.2 增加到 0.9，交叉熵损失如何变化？',options:['增加','降低','不变'],answer:1,why:'单个目标的损失为 -ln(p)，从约 1.609 降到约 0.105。'},
{q:'SFT 主要帮助模型学习什么？',options:['指令遵循与回答格式','数据库备份','GPU 散热'],answer:0,why:'监督微调使用指令和示范回答，让模型更好地响应用户要求。'},
{q:'企业内部文档频繁变化，通常优先采用什么方案？',options:['每次从零预训练','RAG 检索相关文档','仅提高 Temperature'],answer:1,why:'RAG 适合接入持续变化的外部知识，微调不等于实时更新知识库。'}
]
const total=computed(()=>questions.filter((q,i)=>scores.value[i]===q.answer).length)
function choose(i:number,j:number){scores.value=[...scores.value];scores.value[i]=j;submitted.value=false}
function reset(){scores.value=[];submitted.value=false}
</script>
<template>
<article class="lesson">
<h1>大语言模型是如何训练出来的？</h1>
<p>前四篇，我们学习了 Token、Embedding、Transformer、Attention 和位置编码。但一个刚初始化的 Transformer 并不会写代码。它是如何逐步成为能回答问题的聊天助手的？</p>
<h2>一、模型一开始并不知道正确答案</h2>
<p>假设输入「JavaScript 是一种」，模型可能把「水果」「汽车」「编程」等 Token 都当作候选。训练开始时，参数通常经过随机初始化，预测往往不可靠。</p>
<div class="visual"><strong>语言模型的训练循环</strong><div class="step">输入训练文本</div><div class="arrow">↓</div><div class="step accent">Transformer 预测下一个 Token</div><div class="arrow">↓</div><div class="step">计算 Loss（预测误差）</div><div class="arrow">↓</div><div class="step green">反向传播 + 优化器更新参数</div><div class="arrow">↻ 大量重复训练</div></div>
<p>训练数据的质量、模型架构、训练目标与计算资源都会影响最终能力。</p>
<h2>二、Loss：模型如何知道自己错了？</h2>
<p>自回归语言模型通常采用交叉熵损失。对于一个正确 Token，其负对数损失为：</p>
<div class="formula">L = −ln(p)</div>
<p>当正确 Token 的概率为 0.2 时，Loss 约为 1.609；当概率提升至 0.9，Loss 约为 0.105。</p>
<div class="visual"><strong>交互实验：正确 Token 概率与 Loss</strong>
<label for="training-probability">正确 Token 的预测概率：{{probability}}%</label>
<input id="training-probability" v-model.number="probability" type="range" min="1" max="100" step="1" />
<div class="metric">{{loss.toFixed(3)}}</div>
<small>正确答案概率越高，对应的负对数损失越低。实际训练通常对多个 Token 的损失求平均。</small></div>
<p><strong>注意：</strong>Loss 降低不等于模型自动学会验证事实。它主要反映模型在指定训练目标上的表现。</p>
<h2>三、反向传播如何调整参数？</h2>
<p>模型会计算损失函数对参数的梯度，并通过优化器调整参数。最基础的梯度下降可写为：</p>
<div class="formula">θ_new = θ_old − η ∇θL</div>
<table><thead><tr><th>符号</th><th>含义</th></tr></thead><tbody><tr><td>θ</td><td>模型参数</td></tr><tr><td>η</td><td>学习率</td></tr><tr><td>∇θL</td><td>损失对参数的梯度</td></tr></tbody></table>
<p>真实大模型通常采用 AdamW 等优化器，并结合批训练、学习率调度和混合精度计算。梯度提供局部优化方向，不保证每一步都使全部任务表现提升。</p>
<h2>四、从语言模型到聊天助手的常见训练阶段</h2>
<div class="visual"><strong>训练与对齐流程</strong>
<div class="step"><b>1. Pretraining（预训练）</b><small>大量文本与代码，学习语言、知识和模式</small></div><div class="arrow">↓</div>
<div class="step accent"><b>2. SFT（监督微调）</b><small>指令和示范回答，学习如何响应用户</small></div><div class="arrow">↓</div>
<div class="step green"><b>3. 偏好对齐</b><small>RLHF、DPO 等，改善回答行为</small></div><div class="arrow">↓</div>
<div class="step"><b>4. 评估与迭代</b><small>正确性、安全性、鲁棒性、任务表现</small></div>
<small>这是常见的简化流程，不同模型可能采用不同训练阶段或额外的强化学习、蒸馏等方法。</small></div>
<h3>4.1 预训练：学会预测后续 Token</h3>
<p>预训练不需要人工为每个句子手写问答。训练样本可以从文本序列构造：给定前文，让模型预测后续 Token。训练时通常会同时计算序列中多个位置的预测损失。</p>
<h3>4.2 SFT：学会按要求回答</h3>
<pre><code>用户：用 TypeScript 写一个防抖函数。
示范回答：给出实现、类型、用法和解释。</code></pre>
<p>预训练主要学习语言分布与知识模式；SFT 则进一步让模型学会遵循指令、格式与任务要求。</p>
<h3>4.3 偏好对齐：什么是更好的回答？</h3>
<p>对于同一个问题，可能存在多个合理答案。通过人类偏好反馈、奖励模型、强化学习（RLHF）或直接偏好优化（DPO）等方法，可以让模型倾向更有帮助且符合要求的输出。但偏好优化本身不能保证所有回答都真实。</p>
<h2>五、Training 与 Inference 有什么区别？</h2>
<table><thead><tr><th>训练 Training</th><th>推理 Inference</th></tr></thead><tbody>
<tr><td>通过梯度更新参数</td><td>通常不更新模型参数</td></tr>
<tr><td>需要训练数据和优化器</td><td>输入上下文，生成 Token</td></tr>
<tr><td>计算梯度与反向传播</td><td>主要执行前向计算</td></tr>
<tr><td>整体成本通常很高</td><td>按请求消耗计算资源</td></tr></tbody></table>
<p>你在聊天中纠正一次答案，不意味着模型权重立即改变。应用可以使用聊天历史、记忆或 RAG 利用这些信息，但这些机制与重新训练不同。</p>
<h2>六、TypeScript：实现一个简化版损失函数</h2>
<pre><code>function tokenLoss(probability: number): number {
  if (probability &lt;= 0 || probability > 1) {
    throw new Error('概率必须在 (0, 1] 范围内')
  }
  return -Math.log(probability)
}

function averageLoss(probabilities: number[]) {
  if (!probabilities.length) throw new Error('不能为空')
  return probabilities.reduce(
    (sum, p) => sum + tokenLoss(p), 0
  ) / probabilities.length
}

console.log(tokenLoss(0.2)) // 约 1.609
console.log(tokenLoss(0.9)) // 约 0.105</code></pre>
<p>这只是交叉熵计算示例，不包含真实神经网络的前向传播、自动微分和参数更新。</p>
<h2>七、聊天机器人开发：什么时候需要微调？</h2>
<p>对于 React + Node.js 构建的企业聊天机器人，通常优先使用成熟 LLM API，把精力放在会话管理、RAG、工具调用、权限和评估上。</p>
<table><thead><tr><th>实际问题</th><th>优先考虑</th></tr></thead><tbody>
<tr><td>不知道最新企业文档</td><td>RAG / 工具检索</td></tr>
<tr><td>输出格式不稳定</td><td>结构化输出、Prompt、评估</td></tr>
<tr><td>需要调用业务系统</td><td>Function Calling + 权限控制</td></tr>
<tr><td>特定任务有大量高质量示例</td><td>评估 SFT / 微调</td></tr></tbody></table>
<p>微调更适合改变特定任务行为或风格；RAG 更适合接入持续变化、需要引用来源的知识，两者也可以结合。</p>
<h2>八、本篇总结</h2>
<p><strong>预训练学习语言模式，SFT 改善指令遵循，偏好对齐改善回答行为；推理则使用已训练好的参数生成回答。</strong></p>
<h2>九、交互式课后测验</h2>
<div class="visual"><div v-for="(q,i) in questions" :key="i" class="question"><strong>{{i+1}}. {{q.q}}</strong>
<label v-for="(opt,j) in q.options" :key="j" class="option"><input type="radio" :name="'chapter5-'+i" :checked="scores[i]===j" @change="choose(i,j)"/>{{opt}}</label>
<p v-if="submitted" class="feedback">{{scores[i]===q.answer?'✓ 回答正确':'正确答案：'+q.options[q.answer]}}。{{q.why}}</p></div>
<div class="buttons"><button :disabled="questions.some((_,i)=>scores[i]===undefined)" @click="submitted=true">提交评分</button><button @click="reset">重新作答</button></div>
<div v-if="submitted" class="metric">得分：{{total}} / {{questions.length}}</div></div>
<h2>十、学习疑问与解答</h2>
<h3>Q1：聊天中纠正模型，它会立刻学会吗？</h3><p>通常不会直接改变模型权重。当前会话可以利用纠正信息，应用也可能保存记忆，但不等于重新训练。</p>
<h3>Q2：Loss 越低，模型就一定越好吗？</h3><p>不一定。还需要独立评估事实正确性、推理能力、指令遵循、安全性和真实任务表现。</p>
<h3>Q3：微调能完全替代 RAG 吗？</h3><p>通常不能。RAG 适合更新频繁、需要来源的外部知识；微调更适合改变模型行为和特定任务表现。</p>
<footer><a href="./04-position-encoding">← 第 04 篇</a><a href="./">返回教程目录</a></footer>
</article>
</template>
<style scoped>
.lesson{font-size:15px;line-height:1.85;color:var(--vp-c-text-1);overflow-wrap:anywhere}h1{font-size:30px;line-height:1.35;margin:16px 0 24px}h2{font-size:23px;margin:36px 0 18px;border-top:1px solid var(--vp-c-divider);padding-top:12px}h3{font-size:17px;margin:20px 0 10px}p{margin:14px 0}.meta{font-size:12px;color:var(--vp-c-text-2)}.visual{border:1px solid var(--vp-c-divider);border-radius:14px;padding:18px;margin:20px 0}.visual>strong{display:block;margin-bottom:12px}.visual>small,.step small{display:block;font-size:12px;color:var(--vp-c-text-2);margin-top:8px}.step{background:var(--vp-c-bg-soft);border-radius:8px;padding:12px;text-align:center}.accent{background:rgba(37,99,235,.09)}.green{background:rgba(22,163,74,.09)}.arrow{text-align:center;padding:7px;color:var(--vp-c-text-2)}.formula{text-align:center;font-family:Georgia,serif;font-size:18px;padding:18px;background:var(--vp-c-bg-soft);border-radius:9px;overflow-x:auto}.metric{text-align:center;font-size:25px;font-weight:bold;padding:10px}.visual input[type=range]{display:block;width:100%;accent-color:var(--vp-c-brand-1)}label{display:block;margin:10px 0}pre{background:var(--vp-code-block-bg);border-radius:10px;padding:18px;overflow:auto}pre code{font-size:13px;white-space:pre;color:var(--vp-c-text-1)}table{display:table;width:100%;font-size:14px}td,th{padding:9px}.question{border-bottom:1px solid var(--vp-c-divider);padding:14px 0}.option{padding:8px;border:1px solid var(--vp-c-divider);border-radius:8px;cursor:pointer}.option input{margin-right:8px}.feedback{background:var(--vp-c-bg-soft);padding:10px;border-radius:8px}.buttons{display:flex;gap:10px;margin-top:15px}.buttons button{background:var(--vp-c-bg-soft);border:1px solid var(--vp-c-divider);border-radius:8px;padding:8px 14px;cursor:pointer}.buttons button:disabled{opacity:.4}footer{display:flex;justify-content:space-between;border-top:1px solid var(--vp-c-divider);padding-top:16px;margin-top:30px}@media(max-width:600px){h1{font-size:24px}h2{font-size:20px}.visual{padding:12px}}
</style>
