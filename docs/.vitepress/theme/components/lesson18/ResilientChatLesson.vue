<script setup lang="ts">
import {computed,onMounted,ref,nextTick} from 'vue'
import source from './article.html?raw'
import questions from './quiz.json'
import './page.css'

const article=ref<HTMLElement|null>(null)
const copies=ref('')
const answers=ref<Record<number,number>>({})
const graded=ref(false)
const ready=computed(()=>questions.every((_,i)=>answers.value[i]!==undefined))
const score=computed(()=>questions.filter((q,i)=>answers.value[i]===q.a).length)
function resetQuiz(){answers.value={};graded.value=false}
async function copyCode(button:HTMLButtonElement){
 try{
  const code=button.parentElement?.querySelector('code')?.textContent||''
  await navigator.clipboard.writeText(code)
  copies.value='已复制完整代码'
 }catch{copies.value='复制失败，可手动选择代码'}
}
onMounted(()=>void nextTick(()=>article.value?.querySelectorAll('pre').forEach(pre=>{
 if(pre.querySelector('[data-copy18]'))return
 const b=document.createElement('button')
 b.type='button';b.dataset.copy18='1';b.className='copy18';b.textContent='复制代码'
 b.addEventListener('click',()=>void copyCode(b));pre.prepend(b)
})))

type Scenario='rate'|'unavailable'|'partial'|'disconnect'|'save'|'normal'
const scenario=ref<Scenario>('rate')
const state=ref<'waiting'|'streaming'|'answered'|'incomplete'|'failed'>('waiting')
const turnId=ref('T1'),clientKey=ref('K1'),generation=ref(0),attempts=ref(0)
const display=ref(''),persisted=ref(''),gotEnd=ref(false),notice=ref('')
const logs=ref<string[]>([])
function log(value:string){logs.value=[...logs.value,value]}
function clearLab(){scenario.value='rate';state.value='waiting';turnId.value='T1';clientKey.value='K1';generation.value=0;attempts.value=0;display.value='';persisted.value='';gotEnd.value=false;notice.value='';logs.value=[]}
function begin(){
 if(state.value==='streaming')return
 if(state.value==='answered'){notice.value='此轮已完成。想再次生成请选择重置实验。';return}
 generation.value++;attempts.value++;state.value='waiting';notice.value='';gotEnd.value=false
 log(`发起创建：clientKey=${clientKey.value}，Turn.id=${turnId.value}，尝试 ${attempts.value}`)
 if((scenario.value==='rate'||scenario.value==='unavailable')&&attempts.value===1){
  log(`返回 ${scenario.value==='rate'?'429':'503'} + Retry-After: 1；尚无 delta，可带原 key 有限重试`)
 } else {
  state.value='streaming';log('服务端接受请求，开始 SSE（meta / delta）')
 }
}
function simulatedRetry(){
 if(attempts.value!==1||!['rate','unavailable'].includes(scenario.value)){log('现在不是可自动重试的预流式错误');return}
 attempts.value=2;state.value='streaming';log(`使用相同 clientKey=${clientKey.value}，进入第二次尝试；只有一个 ${turnId.value}`)
}
function delta(){
 if(state.value!=='streaming'){log('当前不在 streaming，忽略 delta');return}
 display.value+='正在生成的一段回答。';log('SSE delta：前端显示更新，数据库尚未必然保存')
}
function checkpoint(){
 if(!['streaming','failed','incomplete'].includes(state.value)){log('当前没有待保存的草稿');return}
 persisted.value=display.value;log('前端 PUT 保存检查点成功；数据库已有 '+persisted.value.length+' 字')
}
function breakStream(){
 if(state.value!=='streaming'){log('请先开始 streaming');return}
 if(scenario.value==='normal'){log('正常场景请选择“收到 end”');return}
 if(scenario.value==='save'){gotEnd.value=true;notice.value='最终 PUT 失败，不能显示 answered';state.value='failed';log('SSE end 已收到，但最终 PUT 失败：不能当作成功');return}
 state.value=scenario.value==='partial'?'failed':'incomplete'
 notice.value=scenario.value==='partial'?'收到 error 事件':'流无 end 断开'
 log('流结束但缺少 end；不自动重新 POST，保留已有草稿')
}
function end(){
 if(state.value!=='streaming'){log('当前不是可结束的流');return}
 gotEnd.value=true;persisted.value=display.value;state.value='answered'
 log('SSE end + 最终 PUT 成功 → answered')
}
function refresh(){display.value=persisted.value;if(state.value!=='answered')state.value='incomplete';log(`模拟刷新 GET：从持久化快照恢复 ${persisted.value.length} 字；没有偷偷发模型请求`)}
function manualRetry(){
 if(!['failed','incomplete'].includes(state.value)){log('当前状态不能手动重新回答');return}
 display.value='';persisted.value='';state.value='streaming';gotEnd.value=false;attempts.value=0
 log('用户明确重新回答：Turn.id 仍然是 T1；旧草稿清空，新生成从头开始')
}
</script>

<template>
 <article class="lesson18">
  <div class="original" ref="article" v-html="source"></div>
  <section class="lab" aria-label="自动重试与断线恢复互动实验">
   <h2>🧪 交互实验：什么时候能重试，什么时候不能？</h2>
   <p>这是前端概念模拟，不会连接真实模型或 SQLite。选择故障，观察 <code>Turn.id</code>、<code>clientKey</code>、屏幕草稿与最后保存快照的区别。</p>
   <label>故障类型：<select v-model="scenario" aria-label="选择模拟故障">
     <option value="rate">首次 429 限流</option><option value="unavailable">首次 503 临时不可用</option>
     <option value="partial">流中途 error</option><option value="disconnect">流无 end 断开</option>
     <option value="save">end 后最终 PUT 失败</option><option value="normal">正常完成</option>
   </select></label>
   <div class="columns">
    <div><strong>当前屏幕 · {{state}}</strong><p>{{display||'（尚无正文）'}}</p><small>固定 Turn.id：{{turnId}}</small></div>
    <div><strong>数据库最近一次检查点</strong><p>{{persisted||'（尚未保存）'}}</p><small>创建幂等键：{{clientKey}}</small></div>
   </div>
   <div class="actions">
    <button @click="begin">开始发送</button>
    <button @click="simulatedRetry">429/503 后自动重试</button>
    <button @click="delta">收到 delta</button>
    <button @click="checkpoint">检查点 PUT</button>
    <button @click="breakStream">模拟故障</button>
    <button @click="end">收到 end + 最终 PUT</button>
    <button @click="refresh">模拟刷新 GET</button>
    <button @click="manualRetry">手动重新回答</button>
    <button @click="clearLab">重置实验</button>
   </div>
   <p class="hint">{{notice||'重要：只靠 HTTP 200 不能标记 answered；必须 end + 最终 PUT 均成功。'}}</p>
   <ol class="timeline"><li v-for="(line,i) in logs" :key="i">{{line}}</li></ol>
  </section>
  <section class="quiz" aria-label="第十八篇交互测验">
   <h2>📝 交互测验：四道选择题</h2>
   <fieldset v-for="(q,i) in questions" :key="i">
    <legend>{{i+1}}. {{q.q}}</legend>
    <label v-for="(choice,j) in q.options" :key="j"><input type="radio" :name="`lesson18-${i}`" :checked="answers[i]===j" @change="answers[i]=j;graded=false"> {{'ABC'[j]}}. {{choice}}</label>
    <p v-if="graded" class="hint">{{answers[i]===q.a?'答对了。':'答错了。'}}正确答案：{{'ABC'[q.a]}}。{{q.why}}</p>
   </fieldset>
   <div class="actions"><button :disabled="!ready" @click="graded=true">提交评分</button><button @click="resetQuiz">重新作答</button></div>
   <p v-if="graded" role="status" class="result">得分：{{score}} / {{questions.length}}</p>
  </section>
  <p role="status" class="copy-hint">{{copies}}</p>
 </article>
</template>
