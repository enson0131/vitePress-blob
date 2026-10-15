<script setup lang="ts">
import { computed, ref } from 'vue'
const props = defineProps<{ type: 'cosine' | 'cost' | 'mask' | 'attention' | 'quiz' }>()
const ax = ref(3), ay = ref(4), bx = ref(4), by = ref(3)
const input = ref(2000), output = ref(1000), requests = ref(10000)
const position = ref(2)
const selected = ref(6)
const tokens = ['小明','把','电脑','放在','桌子上','因为','它','太重了']
const words = ['我','喜欢','学习','人工智能']
const weights = [
[.52,.05,.12,.05,.08,.04,.10,.04],
[.18,.12,.20,.19,.14,.04,.08,.05],
[.09,.03,.25,.08,.16,.03,.14,.22],
[.08,.12,.25,.18,.20,.04,.08,.05],
[.05,.04,.24,.11,.33,.04,.12,.07],
[.06,.04,.17,.07,.14,.19,.12,.21],
[.06,.02,.40,.04,.14,.04,.10,.20],
[.04,.02,.31,.04,.18,.04,.24,.13]
]
const similarity = computed(() => {
 const denominator = Math.hypot(ax.value,ay.value)*Math.hypot(bx.value,by.value)
 return denominator ? (ax.value*bx.value+ay.value*by.value)/denominator : null
})
const cost = computed(() => requests.value * (input.value/1e6 + output.value*4/1e6))
const answers = ref<number[]>([-1,-1,-1])
const submitted = ref(false)
const quiz = [
{ q:'Token ID 本身包含语义吗？', options:['数字越接近语义越相近','不是，它主要是编号','只有英文 Token 有语义'],correct:1,reason:'Token ID 是离散编号，语义表示主要通过 Embedding 和后续网络学习。'},
{ q:'普通聊天必须单独调用 Embedding API 吗？', options:['必须','通常不需要','每轮必须调用两次'],correct:1,reason:'普通 LLM API 内部已处理 Token Embedding。'},
{ q:'余弦相似度很高说明什么？', options:['事实一定正确','向量方向接近','Token 数量相同'],correct:1,reason:'余弦相似度衡量方向一致性，不能保证事实正确。'}
]
</script>

<template>
  <div class="ai-lab">
    <template v-if="type === 'cosine'">
      <h4>交互实验：余弦相似度</h4>
      <svg class="ai-vectors" viewBox="0 0 320 250" role="img" aria-label="两个二维向量的方向对比">
        <g stroke="currentColor" opacity=".13">
          <line x1="15" y1="125" x2="305" y2="125"/><line x1="160" y1="10" x2="160" y2="240"/>
        </g>
        <line x1="160" y1="125" :x2="160+ax*18" :y2="125-ay*18" stroke="#16a34a" stroke-width="3"/>
        <circle :cx="160+ax*18" :cy="125-ay*18" r="5" fill="#16a34a"/>
        <text :x="160+ax*18+8" :y="125-ay*18-8" fill="#16a34a">A</text>
        <line x1="160" y1="125" :x2="160+bx*18" :y2="125-by*18" stroke="#2563eb" stroke-width="3"/>
        <circle :cx="160+bx*18" :cy="125-by*18" r="5" fill="#2563eb"/>
        <text :x="160+bx*18+8" :y="125-by*18+16" fill="#2563eb">B</text>
      </svg>
      <div class="ai-columns">
        <div><strong>向量 A</strong><label>X：{{ ax }} <input v-model.number="ax" type="range" min="-5" max="5" /></label><label>Y：{{ ay }} <input v-model.number="ay" type="range" min="-5" max="5" /></label></div>
        <div><strong>向量 B</strong><label>X：{{ bx }} <input v-model.number="bx" type="range" min="-5" max="5" /></label><label>Y：{{ by }} <input v-model.number="by" type="range" min="-5" max="5" /></label></div>
      </div>
      <div class="ai-result"><small>Cosine Similarity</small><strong>{{ similarity === null ? '未定义（零向量）' : similarity.toFixed(3) }}</strong></div>
      <button class="ai-button" @click="ax=3;ay=4;bx=4;by=3">恢复初始数值</button>
    </template>
    <template v-else-if="type === 'cost'">
      <h4>交互实验：Token API 成本计算器</h4>
      <label>每次输入 Token：{{ input.toLocaleString() }} <input v-model.number="input" type="range" min="500" max="20000" step="500"/></label>
      <label>每次输出 Token：{{ output.toLocaleString() }} <input v-model.number="output" type="range" min="500" max="10000" step="500"/></label>
      <label>请求次数：{{ requests.toLocaleString() }} <input v-model.number="requests" type="range" min="1000" max="100000" step="1000"/></label>
      <div class="ai-result"><small>假设输入 $1 / 百万 Token、输出 $4 / 百万 Token</small><strong>${{ cost.toFixed(2) }}</strong></div>
      <p class="ai-note">仅为教学假设价格，不包含缓存折扣、工具和其他费用。</p>
    </template>
    <template v-else-if="type === 'mask'">
      <h4>交互实验：因果注意力矩阵</h4>
      <div class="ai-buttons"><button v-for="(w,i) in words" :key="i" :class="{active:position===i}" @click="position=i">{{ w }}</button></div>
      <div class="ai-mask">
        <span></span><span v-for="w in words" :key="'head'+w">{{ w }}</span>
        <template v-for="(w,i) in words" :key="w">
          <span>{{ w }}</span>
          <span v-for="(_,j) in words" :key="j" :class="{allowed:j<=i,highlight:i===position}">{{ j<=i?'✓':'×' }}</span>
        </template>
      </div>
      <p class="ai-note">当前选中「{{ words[position] }}」：只允许关注自身及之前的位置。该矩阵展示可访问性，不是实际注意力权重。</p>
    </template>
    <template v-else-if="type === 'attention'">
      <h4>交互实验：Attention 权重</h4>
      <div class="ai-buttons"><button v-for="(t,i) in tokens" :key="i" :class="{active:selected===i}" @click="selected=i">{{ t }}</button></div>
      <div v-for="(t,i) in tokens" :key="i" class="ai-bar-row">
        <span>{{ t }}</span><div class="ai-bar-bg"><div class="ai-bar" :style="{width:(weights[selected][i]*100)+'%',background:i===selected?'#16a34a':'#3b82f6'}"></div></div>
        <span>{{ Math.round(weights[selected][i]*100) }}%</span>
      </div>
      <p class="ai-note">权重是人为设定的概念数据，并非真实模型输出。为了展示双向上下文，此处没有施加 GPT 的因果掩码。</p>
    </template>
    <template v-else-if="type === 'quiz'">
      <h4>课后小测验</h4>
      <div v-for="(q,i) in quiz" :key="i" class="ai-question">
        <strong>{{ i+1 }}. {{ q.q }}</strong>
        <label v-for="(option,j) in q.options" :key="j"><input type="radio" :name="'quiz-'+i" :checked="answers[i]===j" @change="answers[i]=j;submitted=false"/>{{ option }}</label>
        <p v-if="submitted" class="ai-note">{{ answers[i]===q.correct?'✓ 回答正确':'正确答案：'+q.options[q.correct] }}。{{ q.reason }}</p>
      </div>
      <button class="ai-button" :disabled="answers.includes(-1)" @click="submitted=true">提交答案</button>
      <div v-if="submitted" class="ai-result"><strong>得分：{{ quiz.filter((q,i)=>answers[i]===q.correct).length }} / 3</strong></div>
    </template>
  </div>
</template>

<style scoped>
.ai-lab{border:1px solid var(--vp-c-divider);border-radius:14px;padding:20px;margin:20px 0;background:var(--vp-c-bg);color:var(--vp-c-text-1)}
.ai-lab h4{margin:0 0 16px;font-size:16px}
.ai-vectors{display:block;max-width:420px;width:100%;margin:auto}
.ai-columns{display:grid;grid-template-columns:1fr 1fr;gap:20px}
.ai-lab label{display:block;font-size:14px;margin:12px 0;line-height:1.8}
.ai-lab input[type=range]{display:block;width:100%;accent-color:var(--vp-c-brand-1)}
.ai-result{background:var(--vp-c-bg-soft);border-radius:10px;padding:18px;text-align:center;margin:14px 0}
.ai-result small{display:block;color:var(--vp-c-text-2);font-size:12px}
.ai-result strong{display:block;font-size:28px;margin-top:5px}
.ai-button,.ai-buttons button{cursor:pointer;border:1px solid var(--vp-c-divider);padding:7px 13px;border-radius:8px;background:var(--vp-c-bg-soft)}
.ai-button:disabled{opacity:.4;cursor:not-allowed}
.ai-buttons{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:15px}
.ai-buttons button.active{background:var(--vp-c-brand-1);color:white}
.ai-mask{display:grid;grid-template-columns:90px repeat(4,minmax(0,1fr));gap:4px}
.ai-mask span{display:flex;align-items:center;justify-content:center;min-height:38px;font-size:13px}
.ai-mask span.allowed{background:rgba(59,130,246,.12);border-radius:5px}
.ai-mask span.highlight.allowed{background:rgba(22,163,74,.24)}
.ai-mask span:not(.allowed){color:var(--vp-c-text-3)}
.ai-bar-row{display:flex;gap:10px;align-items:center;margin:8px 0;font-size:13px}
.ai-bar-row>span:first-child{width:60px;flex-shrink:0}
.ai-bar-row>span:last-child{width:36px;text-align:right}
.ai-bar-bg{height:15px;background:var(--vp-c-bg-soft);border-radius:5px;flex:1;overflow:hidden}
.ai-bar{height:100%;border-radius:5px}
.ai-note{font-size:13px;color:var(--vp-c-text-2);margin:12px 0 0!important}
.ai-question{border-bottom:1px solid var(--vp-c-divider);padding:10px 0}
.ai-question label{margin:4px 0}
.ai-question input{margin-right:8px}
@media(max-width:520px){.ai-lab{padding:12px}.ai-columns{gap:10px}.ai-mask{grid-template-columns:65px repeat(4,minmax(0,1fr))}.ai-mask span{font-size:11px}}
</style>