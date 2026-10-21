<script setup lang="ts">
import {computed,onMounted,ref} from 'vue'
import source from './lesson12/article.html?raw'
const article=ref<HTMLElement|null>(null)
const copyStatus=ref('')
const good={answerable:true,answer:'Token 校验由服务端完成，前端不得保存服务端密钥。',sourceIds:['S1'],clarification:null}
const samples=[
 {name:'完整且结构正确',value:good,state:'completed',refusal:false},
 {name:'错误字段类型',value:{...good,answerable:'true'},state:'completed',refusal:false},
 {name:'未知来源 S99',value:{...good,sourceIds:['S99']},state:'completed',refusal:false},
 {name:'材料不足却有答案',value:{...good,answerable:false,clarification:'请补充资料'},state:'completed',refusal:false},
 {name:'正文完整但生成未完成',value:good,state:'incomplete',refusal:false},
 {name:'服务商拒绝',value:good,state:'completed',refusal:true},
 {name:'结构通过但事实错误',value:{...good,answer:'前端可以保存服务端密钥。'},state:'completed',refusal:false}
]
const sampleIndex=ref(0),raw=ref(JSON.stringify(good,null,2)),providerState=ref('completed'),hasRefusal=ref(false)
function loadSample(){const s=samples[sampleIndex.value];raw.value=JSON.stringify(s.value,null,2);providerState.value=s.state;hasRefusal.value=s.refusal}
function resetLab(){sampleIndex.value=0;loadSample()}
const checked=computed(()=>{
 if(hasRefusal.value)return {status:'refused',detail:'保留拒绝状态，不把拒绝解析成普通答案。',stage:0}
 if(providerState.value==='incomplete')return {status:'incomplete',detail:'即使 JSON 完整，也不提交为最终业务结果。',stage:0}
 if(providerState.value!=='completed')return {status:'failed',detail:'provider_not_completed',stage:0}
 if(raw.value.length>20000)return {status:'failed',detail:'local_input_limit：实验输入超过 20,000 字符',stage:1}
 let d:any
 try{d=JSON.parse(raw.value)}catch{return {status:'failed',detail:'invalid_json',stage:1}}
 const keys=['answerable','answer','sourceIds','clarification']
 if(!d||Array.isArray(d)||typeof d!=='object'||Object.keys(d).length!==4||!keys.every(k=>Object.prototype.hasOwnProperty.call(d,k))||typeof d.answerable!=='boolean'||!(typeof d.answer==='string'||d.answer===null)||!Array.isArray(d.sourceIds)||!d.sourceIds.every((s:any)=>typeof s==='string')||!(typeof d.clarification==='string'||d.clarification===null))return {status:'failed',detail:'invalid_schema',stage:1}
 if(d.sourceIds.length>12||new Set(d.sourceIds).size!==d.sourceIds.length||d.sourceIds.some((s:string)=>s!=='S1'))return {status:'failed',detail:'invalid_sources',stage:2}
 if(d.answerable){
  if(!d.answer?.trim()||d.answer.length>8000||d.sourceIds.length===0||d.clarification!==null)return {status:'failed',detail:'inconsistent_fields',stage:2}
  return {status:'answered',detail:'结构与业务检查通过；这不是事实正确性认证。',stage:3}
 }
 if(d.answer!==null||d.sourceIds.length!==0||!d.clarification?.trim()||d.clarification.length>1000)return {status:'failed',detail:'inconsistent_fields',stage:2}
 return {status:'insufficient_evidence',detail:d.clarification,stage:3}
})
const questions=[
 {q:'结构化输出通过 Schema，意味着什么？',options:['字段结构符合约束，但事实仍需验证','引用一定支持结论','后端可以跳过权限校验'],answer:0,why:'结构约束不替代事实和权限检查。'},
 {q:'响应状态是 incomplete，但正文恰好能 JSON.parse，应怎么办？',options:['直接当作成功','补一个“成功”字段','保留 incomplete，不当成最终业务结果'],answer:2,why:'可解析的片段不等于生成已完成。'},
 {q:'哪些字段应该由可信后端负责？',options:['让模型选择当前用户身份','请求 ID、契约版本与授权范围','让模型决定自己有没有管理员权限'],answer:1,why:'可信元数据和授权不能交给模型自我声明。'},
 {q:'模型引用了真实存在的 S1，是否说明答案正确？',options:['是，只要 ID 能找到','不是，还要检查 S1 是否支持结论','把 Temperature 设为 0 就一定正确'],answer:1,why:'来源存在与来源支持答案是不同检查。'}
]
const answers=ref<number[]>([]),submitted=ref(false)
const ready=computed(()=>questions.every((_,i)=>answers.value[i]!==undefined))
const score=computed(()=>questions.filter((q,i)=>answers.value[i]===q.answer).length)
function choose(i:number,j:number){answers.value[i]=j;submitted.value=false}
function resetQuiz(){answers.value=[];submitted.value=false}
onMounted(()=>{
 article.value?.querySelectorAll('pre').forEach(pre=>{
  const toolbar=document.createElement('div');toolbar.className='l12-codebar';toolbar.dataset.ui='true'
  const copy=document.createElement('button');copy.type='button';copy.textContent='复制代码';copy.dataset.copy='true'
  copy.addEventListener('click',async()=>{try{await navigator.clipboard.writeText(pre.querySelector('code')?.textContent||'');copyStatus.value='代码已完整复制'}catch{copyStatus.value='复制失败，请手动选中代码复制'}})
  const wrap=document.createElement('button');wrap.type='button';wrap.textContent='切换换行';wrap.setAttribute('aria-pressed','false')
  wrap.addEventListener('click',()=>{const on=pre.classList.toggle('l12-wrap');wrap.setAttribute('aria-pressed',String(on))})
  toolbar.append(copy,wrap);pre.before(toolbar)
 })
})
</script>
<template><article class="lesson12" data-version="lesson12-v1">
 <div ref="article" class="lesson12-original" v-html="source"></div>
 <p role="status" class="l12-copy-status">{{copyStatus}}</p>
 <details class="l12-extras" open><summary>配套交互：响应检查实验与四道选择题</summary>
  <p>以下为正文第十、十一节的配套控件。不调用模型，不执行回答中的任何操作。</p>
  <section class="l12-panel"><h2>响应检查实验</h2>
   <p class="l12-evidence"><strong>唯一允许资料 S1：</strong>Token 校验由服务端完成，前端不得保存服务端密钥。</p>
   <label for="l12-sample">选择固定样本<select id="l12-sample" v-model.number="sampleIndex" @change="loadSample"><option v-for="(sample,i) in samples" :key="i" :value="i">{{i+1}}. {{sample.name}}</option></select></label>
   <div class="l12-row"><label for="l12-state">服务商完成状态<select id="l12-state" v-model="providerState"><option value="completed">completed</option><option value="incomplete">incomplete</option><option value="failed">failed</option></select></label><label class="l12-refusal"><input v-model="hasRefusal" type="checkbox" id="l12-refusal">含 refusal 拒绝内容</label></div>
   <label for="l12-json">候选 JSON（可编辑）<textarea id="l12-json" v-model="raw" rows="10" maxlength="20000" spellcheck="false"></textarea></label>
   <svg class="l12-flow" viewBox="0 0 700 90" role="img" aria-label="传输与状态、JSON与Schema、业务约束、界面状态四个检查阶段">
    <g v-for="(name,i) in ['传输与状态','JSON / Schema','业务约束','界面状态']" :key="name"><rect :x="i*175+5" y="15" width="150" height="50" rx="9" fill="var(--vp-c-bg-soft)" :stroke="checked.stage===i?'var(--vp-c-brand-1, #3451b2)':'currentColor'" :stroke-width="checked.stage===i?3:1"/><text :x="i*175+80" y="45" text-anchor="middle" fill="currentColor" font-size="15">{{name}}</text><path v-if="i<3" :d="`M${i*175+157} 40h16m-5 -4 5 4-5 4`" fill="none" stroke="currentColor"/></g>
   </svg>
   <div class="l12-result" role="status" aria-live="polite"><strong data-lab-status>{{checked.status}}</strong><p data-lab-detail>{{checked.detail}}</p></div>
   <p class="l12-warning">注意：实验不核验语义事实。第七个样本即使被判为 answered，内容依然是错的。</p>
   <button type="button" @click="resetLab">重置实验</button>
  </section>
  <section class="l12-panel"><h2>交互式课后测验</h2>
   <fieldset v-for="(q,i) in questions" :key="i"><legend>{{i+1}}. {{q.q}}</legend><label v-for="(option,j) in q.options" :key="j" class="l12-option"><input type="radio" :name="'l12-q-'+i" :checked="answers[i]===j" @change="choose(i,j)">{{String.fromCharCode(65+j)}}. {{option}}</label><p v-if="submitted" class="l12-explanation">{{answers[i]===q.answer?'✓ 回答正确。':'回答错误。'}}正确答案：{{String.fromCharCode(65+q.answer)}}。{{q.why}}</p></fieldset>
   <div class="l12-actions"><button type="button" :disabled="!ready" @click="submitted=true">提交评分</button><button type="button" @click="resetQuiz">重新作答</button></div><p v-if="submitted" class="l12-score" role="status">得分：{{score}} / {{questions.length}}</p>
  </section>
 </details>
 <footer><a href="./11-context-optimization">← 第 11 篇</a><a href="./">返回课程目录</a></footer>
</article></template>
<style scoped>
.lesson12{color:var(--vp-c-text-1);font-size:16px;line-height:1.85;min-width:0;overflow-wrap:anywhere}.lesson12-original{min-width:0}.lesson12-original :deep(h1){font-size:30px;line-height:1.45;margin:0 0 24px}.lesson12-original :deep(h2){font-size:24px;line-height:1.5;margin:40px 0 18px;padding-top:18px;border-top:1px solid var(--vp-c-divider);scroll-margin-top:100px}.lesson12-original :deep(h3){font-size:19px;margin:26px 0 12px;line-height:1.5}.lesson12-original :deep(p){margin:16px 0}.lesson12-original :deep(table){display:block;width:max-content;max-width:100%;overflow-x:auto;font-size:14px;border-collapse:collapse;margin:22px 0}.lesson12-original :deep(td),.lesson12-original :deep(th){border:1px solid var(--vp-c-divider);padding:10px 13px;min-width:70px;line-height:1.75}.lesson12-original :deep(th){background:var(--vp-c-bg-soft)}.lesson12-original :deep(pre){max-width:100%;overflow:auto;white-space:pre;background:var(--vp-c-bg-soft);padding:18px;border-radius:0 0 10px 10px;margin:0 0 22px;line-height:1.65}.lesson12-original :deep(pre code){display:block;font-size:13px;white-space:inherit;background:none;color:inherit;padding:0;font-family:var(--vp-font-family-mono)}.lesson12-original :deep(pre.l12-wrap){white-space:pre-wrap;overflow-wrap:anywhere}.lesson12-original :deep(.l12-codebar){display:flex;flex-wrap:wrap;justify-content:flex-end;gap:10px;padding:8px 12px;border:1px solid var(--vp-c-divider);border-radius:10px 10px 0 0;background:var(--vp-c-bg-soft);margin-top:18px}.lesson12-original :deep(code){font-family:var(--vp-font-family-mono);font-size:.86em}.lesson12-original :deep(.source-ref){margin-left:3px;font-size:.8em}.lesson12-original :deep(a){color:var(--vp-c-brand-1,var(--vp-c-brand));text-decoration:underline;text-underline-offset:3px}.lesson12-original :deep(ol){padding-left:22px}.lesson12-original :deep(button),.lesson12 button{border:1px solid var(--vp-c-divider);background:var(--vp-c-bg);color:var(--vp-c-text-1);border-radius:7px;padding:6px 12px;cursor:pointer;font-size:13px}.lesson12 button:focus-visible,.lesson12-original :deep(button:focus-visible){outline:2px solid var(--vp-c-brand-1,var(--vp-c-brand));outline-offset:3px}.lesson12 button:disabled{opacity:.45;cursor:not-allowed}.l12-copy-status:empty{display:none}.l12-extras{border:1px solid var(--vp-c-divider);padding:18px;border-radius:14px;margin-top:32px}.l12-extras>summary{font-weight:600;cursor:pointer}.l12-panel{border-top:1px solid var(--vp-c-divider);padding-top:20px;margin-top:24px;min-width:0}.l12-panel h2{font-size:21px;margin:8px 0 18px;line-height:1.5;border:0;padding:0}.l12-panel label{display:block;font-size:14px;margin:14px 0}.l12-panel select,.l12-panel textarea{display:block;width:100%;max-width:100%;padding:9px;margin-top:6px;border:1px solid var(--vp-c-divider);border-radius:8px;background:var(--vp-c-bg);color:inherit}.l12-panel textarea{font-family:var(--vp-font-family-mono);font-size:13px;line-height:1.65;resize:vertical}.l12-row{display:flex;gap:20px;align-items:center;flex-wrap:wrap}.l12-row>label{flex:1;min-width:170px}.l12-refusal input{margin-right:7px}.l12-evidence,.l12-result{background:var(--vp-c-bg-soft);padding:14px;border-radius:10px}.l12-result strong{font-family:var(--vp-font-family-mono);font-size:19px}.l12-result p{margin:7px 0 0}.l12-flow{display:block;width:100%;height:auto;margin:18px 0}.l12-warning{border-left:3px solid var(--vp-c-brand-1,var(--vp-c-brand));padding-left:12px;font-size:14px}.l12-panel fieldset{margin:24px 0;padding:14px;border:1px solid var(--vp-c-divider);border-radius:10px;min-width:0}.l12-panel legend{font-weight:600;font-size:15px;max-width:100%;padding:0 5px}.l12-panel label.l12-option{display:flex;align-items:baseline;gap:8px;margin:10px 0;padding:8px;border-radius:7px;background:var(--vp-c-bg-soft);cursor:pointer}.l12-option input{flex-shrink:0}.l12-explanation{font-size:14px;background:var(--vp-c-bg-soft);padding:12px}.l12-actions{display:flex;flex-wrap:wrap;gap:12px}.l12-score{font-size:22px;font-weight:600}footer{display:flex;justify-content:space-between;gap:16px;border-top:1px solid var(--vp-c-divider);padding-top:20px;margin-top:32px;font-size:14px}@media(max-width:600px){.lesson12{font-size:15px}.lesson12-original :deep(h1){font-size:25px}.lesson12-original :deep(h2){font-size:21px}.lesson12-original :deep(h3){font-size:18px}.lesson12-original :deep(pre){padding:12px}.lesson12-original :deep(table){font-size:13px}.l12-extras{padding:12px}}
</style>
