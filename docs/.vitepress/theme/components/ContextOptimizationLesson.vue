<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import source from './lesson11/article.html?raw'
const article = ref<HTMLElement | null>(null)
const copyStatus = ref('')
const compressed = ref(true)
const initial = { window:16000, fixed:3500, raw:9000, recent:4000, summary:1500, output:4000, margin:1000 }
const values = ref({...initial})
const fields = [
  {key:'window',label:'有效窗口 W',min:8000,max:32000,step:1000},
  {key:'fixed',label:'固定输入 F',min:500,max:7000,step:500},
  {key:'raw',label:'全量历史',min:1000,max:20000,step:500},
  {key:'recent',label:'最近原文',min:0,max:12000,step:500},
  {key:'summary',label:'历史摘要',min:0,max:6000,step:500},
  {key:'output',label:'生成预留 O',min:500,max:8000,step:500},
  {key:'margin',label:'安全余量 M',min:0,max:2000,step:100}
] as const
const history = computed(()=>compressed.value ? values.value.recent + values.value.summary : values.value.raw)
const total = computed(()=>values.value.fixed + history.value + values.value.output + values.value.margin)
const remaining = computed(()=>values.value.window-total.value)
const reduction = computed(()=>(1-history.value/values.value.raw)*100)
const segments = computed(()=>{
  const v=values.value
  const items=[{label:'固定输入',value:v.fixed,color:'#64748b'},{label:'历史材料',value:history.value,color:'#2563eb'},{label:'生成预留',value:v.output,color:'#16a34a'},{label:'安全余量',value:v.margin,color:'#d97706'}]
  const scale=700/Math.max(v.window,total.value);let x=10
  return items.map(item=>{const entry={...item,x,width:item.value*scale};x+=entry.width;return entry})
})
function resetBudget(){values.value={...initial};compressed.value=true}
const questions=[
 {q:'W = 16,000，O = 4,000，M = 1,000，F = 3,500，可用历史预算是多少？',options:['12,000','7,500','11,000'],answer:1,explanation:'16,000 − 4,000 − 1,000 − 3,500 = 7,500。'},
 {q:'哪种压缩最危险？',options:['删除重复引用的同一段文档','将旧历史摘要并保留来源','把“暂不部署”改成“完成后部署”'],answer:2,explanation:'摘要改变了用户意图，不是保真的压缩。'},
 {q:'提示词缓存意味着什么？',options:['可能复用前缀计算，但不扩大上下文窗口','命中缓存的 Token 不占窗口','任何语义相似的段落都必然命中'],answer:0,explanation:'缓存复用计算，不能把费用折扣当成容量折扣。'},
 {q:'固定输入已经超过预算，应怎么做？',options:['从当前问题末尾截断到能发送','明确报错并拆分任务或缩小材料范围','删除权限要求再继续'],answer:1,explanation:'关键输入不能静默裁掉；应走明确的超限处理路径。'}
]
const answers=ref<number[]>([])
const submitted=ref(false)
const ready=computed(()=>questions.every((_,i)=>answers.value[i]!==undefined))
const score=computed(()=>questions.filter((q,i)=>answers.value[i]===q.answer).length)
function choose(i:number,j:number){answers.value[i]=j;submitted.value=false}
function resetQuiz(){answers.value=[];submitted.value=false}
onMounted(()=>{
  article.value?.querySelectorAll('pre').forEach(pre=>{
    const toolbar=document.createElement('div');toolbar.className='l11-code-toolbar';toolbar.dataset.ui='true'
    const copy=document.createElement('button');copy.type='button';copy.textContent='复制代码';copy.dataset.copy='true'
    copy.addEventListener('click',async()=>{try{await navigator.clipboard.writeText(pre.querySelector('code')?.textContent||'');copyStatus.value='代码已完整复制'}catch{copyStatus.value='复制失败，请手动选中代码复制'}})
    const wrap=document.createElement('button');wrap.type='button';wrap.textContent='切换换行';wrap.setAttribute('aria-pressed','false')
    wrap.addEventListener('click',()=>{const on=pre.classList.toggle('l11-wrap');wrap.setAttribute('aria-pressed',String(on))})
    toolbar.append(copy,wrap);pre.before(toolbar)
  })
})
</script>
<template>
<article class="lesson11" data-version="lesson11-v1">
  <div ref="article" class="lesson11-original" v-html="source"></div>
  <p class="copy-status" role="status" aria-live="polite">{{copyStatus}}</p>
  <details class="l11-extras" open>
    <summary>配套交互：预算模拟器与四道选择题</summary>
    <p>与正文第七、十一节配套。以下控件不会调用模型，不会修改正文。</p>
    <section class="l11-panel" aria-labelledby="l11-lab-title">
      <h2 id="l11-lab-title">上下文预算模拟器</h2>
      <label class="l11-toggle"><input v-model="compressed" type="checkbox" name="l11-compressed">使用“摘要 + 最近原文”；取消勾选查看全量历史</label>
      <div class="l11-controls"><label v-for="field in fields" :key="field.key" :for="'l11-'+field.key">{{field.label}}：{{values[field.key].toLocaleString()}} Tokens<input :id="'l11-'+field.key" v-model.number="values[field.key]" type="range" :min="field.min" :max="field.max" :step="field.step"></label></div>
      <div class="l11-total" aria-live="polite">规划总量：{{total.toLocaleString()}} / {{values.window.toLocaleString()}} Tokens</div>
      <svg class="l11-budget-svg" viewBox="0 0 720 65" role="img" aria-label="固定输入、历史材料、生成预留和安全余量的预算分配">
        <rect x="10" y="10" width="700" height="32" rx="6" fill="currentColor" opacity="0.08"/>
        <rect v-for="segment in segments" :key="segment.label" :x="segment.x" y="10" :width="segment.width" height="32" :fill="segment.color"><title>{{segment.label}}：{{segment.value}} Tokens</title></rect>
        <line :x1="10+values.window/Math.max(values.window,total)*700" y1="4" :x2="10+values.window/Math.max(values.window,total)*700" y2="49" stroke="currentColor" stroke-width="2"/>
      </svg>
      <div class="l11-legend"><span v-for="segment in segments" :key="segment.label"><i :style="{background:segment.color}"></i>{{segment.label}} {{segment.value.toLocaleString()}}</span></div>
      <p class="l11-feedback" :class="{over:remaining<0}" role="status">{{remaining<0?'超限 '+(-remaining).toLocaleString()+' Tokens':remaining===0?'刚好用完预算':'剩余 '+remaining.toLocaleString()+' Tokens'}}</p>
      <p>相对全量历史：{{reduction>=0?'缩减':'增长'}} {{Math.abs(reduction).toFixed(1)}}%。这不是事实保留率。</p>
      <button type="button" @click="resetBudget">恢复示例数值</button>
    </section>
    <section class="l11-panel" aria-labelledby="l11-quiz-title">
      <h2 id="l11-quiz-title">交互式课后测验</h2>
      <fieldset v-for="(q,i) in questions" :key="i" class="l11-question">
        <legend>{{i+1}}. {{q.q}}</legend>
        <label v-for="(option,j) in q.options" :key="j" class="l11-option"><input type="radio" :name="'l11-q-'+i" :value="j" :checked="answers[i]===j" @change="choose(i,j)">{{String.fromCharCode(65+j)}}. {{option}}</label>
        <p v-if="submitted" class="l11-explanation">{{answers[i]===q.answer?'✓ 回答正确。':'回答错误。'}}正确答案：{{String.fromCharCode(65+q.answer)}}。{{q.explanation}}</p>
      </fieldset>
      <div class="l11-actions"><button type="button" :disabled="!ready" @click="submitted=true">提交评分</button><button type="button" @click="resetQuiz">重新作答</button></div>
      <p v-if="submitted" class="l11-score" role="status">得分：{{score}} / {{questions.length}}</p>
    </section>
  </details>
  <footer><a href="./10-memory-system">← 第 10 篇</a><a href="./">返回课程目录</a></footer>
</article>
</template>
<style scoped>
.lesson11{color:var(--vp-c-text-1);font-size:16px;line-height:1.85;min-width:0;overflow-wrap:anywhere}.lesson11-original{min-width:0}.lesson11-original :deep(h1){font-size:30px;line-height:1.45;letter-spacing:-.02em;margin:0 0 24px}.lesson11-original :deep(h2){font-size:24px;line-height:1.5;margin:42px 0 18px;padding-top:18px;border-top:1px solid var(--vp-c-divider);scroll-margin-top:100px}.lesson11-original :deep(h3){font-size:19px;line-height:1.55;margin:28px 0 12px;scroll-margin-top:100px}.lesson11-original :deep(p){margin:16px 0}.lesson11-original :deep(blockquote){border-left:3px solid var(--vp-c-brand-1,var(--vp-c-brand));background:var(--vp-c-bg-soft);padding:2px 20px;margin:20px 0;color:inherit}.lesson11-original :deep(table){display:block;width:max-content;max-width:100%;overflow-x:auto;font-size:14px;border-collapse:collapse;margin:22px 0}.lesson11-original :deep(th),.lesson11-original :deep(td){border:1px solid var(--vp-c-divider);padding:10px 13px;line-height:1.75;min-width:70px}.lesson11-original :deep(th){background:var(--vp-c-bg-soft)}.lesson11-original :deep(pre){max-width:100%;overflow-x:auto;white-space:pre;background:var(--vp-c-bg-soft);padding:18px;border-radius:0 0 10px 10px;margin:0 0 22px;line-height:1.65}.lesson11-original :deep(pre code){font-size:13px;background:none;color:var(--vp-c-text-1);padding:0;white-space:inherit;font-family:var(--vp-font-family-mono);display:block}.lesson11-original :deep(pre.l11-wrap){white-space:pre-wrap;overflow-wrap:anywhere}.lesson11-original :deep(.l11-code-toolbar){display:flex;gap:10px;justify-content:flex-end;flex-wrap:wrap;padding:8px 12px;border:1px solid var(--vp-c-divider);border-radius:10px 10px 0 0;background:var(--vp-c-bg-soft);margin-top:18px}.lesson11-original :deep(code){font-family:var(--vp-font-family-mono);font-size:.86em}.lesson11-original :deep(.formula){padding:20px 14px;margin:20px 0;background:var(--vp-c-bg-soft);border:1px solid var(--vp-c-divider);border-radius:12px;text-align:center;font-family:Georgia,serif;font-size:18px;max-width:100%;overflow:auto;white-space:nowrap}.lesson11-original :deep(.formula sub){font-size:.7em}.lesson11-original :deep(.source-ref){margin-left:3px;font-size:.8em}.lesson11-original :deep(ol){padding-left:22px}.lesson11-original :deep(a){color:var(--vp-c-brand-1,var(--vp-c-brand));text-decoration:underline;text-underline-offset:3px}.lesson11-original :deep(button),.lesson11 button{border:1px solid var(--vp-c-divider);background:var(--vp-c-bg);color:var(--vp-c-text-1);border-radius:7px;padding:6px 12px;cursor:pointer;font-size:13px}.lesson11 button:focus-visible,.lesson11-original :deep(button:focus-visible){outline:2px solid var(--vp-c-brand-1,var(--vp-c-brand));outline-offset:3px}.lesson11 button:disabled{opacity:.45;cursor:not-allowed}.copy-status:empty{display:none}.l11-extras{border:1px solid var(--vp-c-divider);padding:18px;border-radius:14px;margin-top:32px}.l11-extras>summary{font-weight:600;cursor:pointer}.l11-panel{border-top:1px solid var(--vp-c-divider);padding-top:20px;margin-top:24px;min-width:0}.l11-panel h2{font-size:21px;line-height:1.5;margin:8px 0 18px;border:0;padding:0}.l11-controls{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px 22px;margin:20px 0}.l11-controls label{font-size:14px;min-width:0}.l11-controls input{display:block;width:100%;accent-color:var(--vp-c-brand-1,var(--vp-c-brand));margin-top:6px}.l11-toggle{display:block;font-size:14px}.l11-toggle input{margin-right:8px}.l11-total{font-size:20px;font-weight:600}.l11-budget-svg{display:block;width:100%;height:auto;margin-top:12px}.l11-legend{display:flex;flex-wrap:wrap;gap:8px 16px;font-size:12px}.l11-legend i{display:inline-block;width:10px;height:10px;border-radius:2px;margin-right:6px}.l11-feedback{font-weight:600}.l11-feedback.over{color:var(--vp-c-danger-1,#d64444)}.l11-question{margin:24px 0;padding:14px;border:1px solid var(--vp-c-divider);border-radius:10px;min-width:0}.l11-question legend{font-weight:600;font-size:15px;max-width:100%;padding:0 5px}.l11-option{display:flex;align-items:baseline;gap:8px;margin:10px 0;padding:8px;border-radius:7px;background:var(--vp-c-bg-soft);font-size:14px;cursor:pointer}.l11-option input{flex-shrink:0}.l11-explanation{font-size:14px;background:var(--vp-c-bg-soft);padding:12px}.l11-actions{display:flex;flex-wrap:wrap;gap:12px}.l11-score{font-size:22px;font-weight:600}footer{display:flex;justify-content:space-between;gap:16px;border-top:1px solid var(--vp-c-divider);padding-top:20px;margin-top:32px;font-size:14px}@media(max-width:600px){.lesson11{font-size:15px}.lesson11-original :deep(h1){font-size:25px}.lesson11-original :deep(h2){font-size:21px}.lesson11-original :deep(h3){font-size:18px}.l11-extras{padding:12px}.l11-controls{grid-template-columns:1fr}.l11-total{font-size:18px}.lesson11-original :deep(pre){padding:12px}.lesson11-original :deep(table){font-size:13px}}
</style>
