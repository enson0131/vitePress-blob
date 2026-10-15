<script setup lang="ts">
import { computed, ref } from 'vue'
const pos=ref(5),rope=ref(0),answers=ref<number[]>([]),submitted=ref(false)
const values=computed(()=>Array.from({length:8},(_,i)=>{const a=pos.value/Math.pow(10000,2*Math.floor(i/2)/8);return i%2?Math.cos(a):Math.sin(a)}))
const angle=computed(()=>rope.value*Math.PI/12)
const quiz=[
{q:'为什么需要位置编码？',opts:['Token ID 天然包含位置','普通 Self-Attention 缺少显式顺序信息','减少模型参数'],a:1,ex:'不含位置机制的普通 Self-Attention 具有排列等变性。'},
{q:'经典正弦位置编码如何与 Token Embedding 结合？',opts:['直接相加','替换 Token ID','按字母排序'],a:0,ex:'经典绝对位置编码可以通过 X=E+P 注入位置。'},
{q:'RoPE 通常对哪些向量进行旋转？',opts:['输出文字','Query 和 Key','聊天数据库'],a:1,ex:'RoPE 作用于 Q/K 的成对维度，体现相对位置信息。'},
{q:'Causal Mask 的作用是什么？',opts:['屏蔽未来 Token','计算位置向量','保存历史消息'],a:0,ex:'因果掩码限制信息访问，与位置编码不同。'}
]
const score=computed(()=>quiz.filter((q,i)=>answers.value[i]===q.a).length)
function pick(i:number,j:number){answers.value=[...answers.value];answers.value[i]=j;submitted.value=false}
</script>
<template><article class="lesson">
<div class="meta"><b>第 04 / 40 篇</b> · 第一阶段：AI 与大模型基础 · 阅读约 12 分钟</div>
<h1>位置编码：Transformer 如何知道 Token 的顺序？</h1>
<p>上一篇我们学习了 Transformer 与 Self-Attention。但如果模型主要计算 Token 之间的关系，它怎么知道哪个词在前、哪个词在后？</p>
<p>例如「小明喜欢小红」和「小红喜欢小明」包含几乎相同的词，但语义不同。关键在于 <strong>Positional Encoding（位置编码）</strong>。</p>
<h2>一、为什么 Transformer 需要位置信息？</h2>
<div class="formula">Attention(Q,K,V) = softmax(QKᵀ / √dₖ) V</div>
<p>公式本身没有显式绝对位置编号。不带位置机制的普通 Self-Attention 具有排列等变性：交换输入位置，输出也相应交换，不能凭空识别原始顺序。</p>
<pre><code>小明 → 喜欢 → 小红
小红 → 喜欢 → 小明</code></pre>
<p>GPT 的因果掩码本身也引入一定顺序结构，但不能完全替代专门的位置表示机制。</p>
<h2>二、位置编码是如何工作的？</h2>
<p>一种经典方案是将 Token Embedding 与位置向量相加：</p><div class="formula">Xᵢ = Eᵢ + Pᵢ</div>
<div class="visual"><strong>Token Embedding + Position Embedding</strong><div class="three"><div v-for="(w,i) in ['小明','喜欢','小红']" :key="w"><div class="step">{{w}}<small>Token Embedding</small></div><div class="arrow">＋</div><div class="step">位置 {{i}}<small>Position Embedding</small></div><div class="arrow">↓</div><div class="step">X{{i}}</div></div></div><small>这是经典绝对位置向量相加方案，不是所有模型的实现。</small></div>
<h2>三、绝对位置编码有哪些实现方式？</h2>
<h3>3.1 可学习位置编码</h3><p>定义一张可训练的位置向量表。实现简单，但固定大小的表通常不能直接覆盖未配置的位置。</p><pre><code>位置 0 → [0.12, 0.35, ...]
位置 1 → [0.71, 0.22, ...]
位置 2 → [0.45, 0.91, ...]</code></pre>
<h3>3.2 正弦位置编码</h3>
<div class="formula">PE(pos,2i) = sin(pos / 10000<sup>2i/d</sup>)<div>PE(pos,2i+1) = cos(pos / 10000<sup>2i/d</sup>)</div></div>
<p>不同维度使用不同频率的正弦、余弦波。pos 是位置，i 是维度对索引，d 是维度。</p>
<div class="visual"><strong>交互实验：正弦位置编码</strong><label>Token 位置：{{pos}}<input v-model.number="pos" type="range" min="0" max="100"/></label>
<svg viewBox="0 0 340 190" role="img" aria-label="8维位置编码的数值柱状图"><path d="M25 90 H330" stroke="currentColor" opacity=".3"/><g v-for="(v,i) in values" :key="i"><rect :x="34+i*37" :y="v>=0?90-v*65:90" width="22" :height="Math.max(1,Math.abs(v)*65)" :fill="i%2?'#16a34a':'#3b82f6'" rx="3"/><text :x="45+i*37" y="173" text-anchor="middle" font-size="11" fill="currentColor">{{i}}</text></g></svg>
<div class="four"><div v-for="(v,i) in values" :key="i" class="step"><small>维度 {{i}}</small>{{v.toFixed(3)}}</div></div><small>蓝色是 sin，绿色是 cos。仅为 8 维示例，不保证无限长度泛化。</small></div>
<h2>四、RoPE：现代大模型常见的旋转位置编码</h2>
<p>RoPE（Rotary Position Embedding）通常作用于 Query、Key 的成对维度，对它们施加位置相关的旋转，而不是直接给 Token Embedding 加一个位置向量。</p>
<h3>4.1 用二维向量理解旋转</h3>
<div class="formula">R(θ) = [ cosθ　−sinθ ; sinθ　cosθ ]</div>
<p>旋转会改变向量方向，但保持长度。</p>
<div class="visual"><strong>交互实验：RoPE 二维旋转</strong>
<svg viewBox="0 0 340 240" role="img" aria-label="单位向量随位置旋转"><circle cx="170" cy="116" r="85" fill="none" stroke="currentColor" stroke-opacity=".2" stroke-dasharray="4 4"/><path d="M45 116 H295 M170 10 V225" stroke="currentColor" stroke-opacity=".25"/><line x1="170" y1="116" x2="255" y2="116" stroke="#94a3b8" stroke-dasharray="5 4"/><line x1="170" y1="116" :x2="170+85*Math.cos(angle)" :y2="116-85*Math.sin(angle)" stroke="#2563eb" stroke-width="3"/><circle :cx="170+85*Math.cos(angle)" :cy="116-85*Math.sin(angle)" r="6" fill="#2563eb"/></svg>
<label>Token 位置：{{rope}}<input v-model.number="rope" type="range" min="0" max="24"/></label>
<div class="two"><div class="step">角度：{{(angle*180/Math.PI).toFixed(0)}}°</div><div class="step">长度：1.000</div></div><small>教学用二维单频率旋转；真实 RoPE 使用多组频率。</small></div>
<h3>4.2 为什么 RoPE 能表示相对位置？</h3>
<div class="formula">(Rₘq)ᵀ(Rₙk) = qᵀRₙ₋ₘk</div>
<p>旋转后 Q/K 的点积可以表示为与位置差 n−m 有关的形式。因此模型可以利用相对位置关系。</p>
<pre><code>句子 A：我 喜欢 学习 AI
位置：   0   1    2   3
句子 B：昨天 我 喜欢 学习 AI
位置：     0  1   2    3   4</code></pre>
<p>「喜欢」与「学习」的相对距离仍为 1。RoPE 并不保证任意长上下文的表现不变，扩展上下文通常需要训练或缩放方案。</p>
<h2>五、位置编码与 Causal Mask 有什么区别？</h2>
<table><thead><tr><th>机制</th><th>作用</th></tr></thead><tbody><tr><td>Position Encoding</td><td>表示位置及相对关系</td></tr><tr><td>Causal Mask</td><td>限制可访问的 Token</td></tr><tr><td>Self-Attention</td><td>聚合可访问位置的信息</td></tr></tbody></table>
<p>对于「我 → 喜欢 → 学习 → AI」中的「学习」，位置编码提供顺序信息，因果掩码屏蔽未来的 AI，Self-Attention 聚合前面的信息。</p>
<h2>六、TypeScript 工程实践</h2>
<pre><code>function positionalEncoding(
  position: number,
  dimension: number
): number[] {
  if (!Number.isInteger(position) || position &lt; 0 ||
      !Number.isInteger(dimension) || dimension &lt;= 0 ||
      dimension % 2 !== 0) {
    throw new Error("位置必须非负，维度必须是正偶数");
  }
  return Array.from({ length: dimension }, (_, i) => {
    const frequency = Math.pow(
      10000, 2 * Math.floor(i / 2) / dimension
    );
    const angle = position / frequency;
    return i % 2 === 0 ? Math.sin(angle) : Math.cos(angle);
  });
}
console.log(positionalEncoding(0, 8));
console.log(positionalEncoding(1, 8));
console.log(positionalEncoding(10, 8));</code></pre>
<p>调用现成 LLM API 通常无需手动实现位置编码。理解它有助于研究上下文窗口、长上下文扩展和模型架构差异。</p>
<h2>七、本篇总结</h2>
<table><thead><tr><th>概念</th><th>一句话理解</th></tr></thead><tbody><tr><td>位置编码</td><td>向模型注入顺序信息</td></tr><tr><td>可学习位置向量</td><td>训练得到的绝对位置表示</td></tr><tr><td>正弦位置编码</td><td>多频率 sin/cos 函数</td></tr><tr><td>RoPE</td><td>旋转 Q/K 体现相对位置</td></tr><tr><td>Causal Mask</td><td>控制可访问上下文</td></tr></tbody></table>
<p><strong>位置编码告诉模型「在哪里」，因果掩码规定「能看哪里」，Self-Attention 决定「如何利用信息」。</strong></p>
<h2>八、交互式课后测验</h2>
<div class="visual"><div v-for="(q,i) in quiz" :key="i" class="question"><strong>{{i+1}}. {{q.q}}</strong><label v-for="(o,j) in q.opts" :key="j" class="option"><input type="radio" :name="'q4-'+i" :checked="answers[i]===j" @change="pick(i,j)"/>{{o}}</label><p v-if="submitted" class="feedback">{{answers[i]===q.a?'✓ 回答正确':'正确答案：'+q.opts[q.a]}}。{{q.ex}}</p></div>
<div class="buttons"><button :disabled="quiz.some((_,i)=>answers[i]===undefined)" @click="submitted=true">提交答案</button><button @click="answers=[];submitted=false">重新作答</button></div><div v-if="submitted" class="score">得分：{{score}} / {{quiz.length}}</div></div>
<h3>工程思考题</h3><p>如果聊天机器人要处理超过原始训练长度的文档，为什么不能简单修改 API 的上下文长度参数？</p>
<h2>学习疑问与解答</h2><p>目前暂无新增学习疑问。后续将按问题、结论、解释与复习要点持续补充。</p>
<footer><a href="./03-transformer-attention">← 第 03 篇</a><span>第 04 / 40 篇</span></footer>
</article></template>
<style scoped>
.lesson{font-size:15px;line-height:1.85;color:var(--vp-c-text-1);overflow-wrap:anywhere}h1{font-size:30px;line-height:1.35;margin:16px 0 24px}h2{font-size:23px;margin:36px 0 18px;border-top:1px solid var(--vp-c-divider);padding-top:12px}h3{font-size:17px;margin:20px 0 10px}p{margin:14px 0}.meta{color:var(--vp-c-text-2);font-size:12px}.meta b{color:#16a34a}
.visual{border:1px solid var(--vp-c-divider);border-radius:14px;padding:18px;margin:20px 0}.visual>strong{display:block;margin-bottom:12px}.visual>small{display:block;font-size:12px;color:var(--vp-c-text-2);margin-top:8px}
.step{background:var(--vp-c-bg-soft);border-radius:8px;padding:12px;text-align:center}.step small{display:block;font-size:11px;color:var(--vp-c-text-2)}.arrow{text-align:center;padding:7px;color:var(--vp-c-text-2)}.three{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.two{display:grid;grid-template-columns:repeat(2,1fr);gap:8px}.four{display:grid;grid-template-columns:repeat(4,1fr);gap:6px}.four .step{font-size:12px;padding:8px}
.formula{font-family:Georgia,serif;font-size:18px;text-align:center;padding:18px 8px;background:var(--vp-c-bg-soft);border-radius:9px;overflow-x:auto}
pre{background:var(--vp-code-block-bg);border-radius:10px;padding:18px;overflow:auto}pre code{font-size:13px;white-space:pre;color:var(--vp-c-text-1)}table{display:table;width:100%;font-size:14px}td,th{padding:9px}
svg{display:block;width:100%;max-width:430px;margin:0 auto}label{display:block;margin:12px 0}input[type=range]{display:block;width:100%;accent-color:var(--vp-c-brand-1)}
.option{padding:8px;border:1px solid var(--vp-c-divider);border-radius:8px;cursor:pointer}.option input{margin-right:8px}.question{border-bottom:1px solid var(--vp-c-divider);padding:14px 0}.feedback{background:var(--vp-c-bg-soft);padding:10px;border-radius:8px}.buttons{display:flex;gap:10px;margin-top:15px}.buttons button{background:var(--vp-c-bg-soft);border:1px solid var(--vp-c-divider);border-radius:8px;padding:8px 14px;cursor:pointer}.buttons button:disabled{opacity:.4}.score{text-align:center;font-size:22px;font-weight:bold;margin:15px}
footer{display:flex;justify-content:space-between;border-top:1px solid var(--vp-c-divider);padding-top:16px;margin-top:30px}
@media(max-width:600px){h1{font-size:24px}h2{font-size:20px}.visual{padding:12px}.three{gap:4px}.three .step{padding:8px 4px;font-size:12px}}
</style>