<script setup lang="ts">
import {computed, nextTick, onMounted, ref} from 'vue'
import article from './article.html?raw'
import questions from './quiz.json'
import './page.css'
const answers=ref<Record<number,number>>({})
const graded=ref(false)
const ready=computed(()=>questions.every((_,i)=>answers.value[i]!==undefined))
const score=computed(()=>questions.filter((q,i)=>q.a===answers.value[i]).length)
function reset(){answers.value={};graded.value=false}
// Local conceptual lab: this does not touch a real SQLite file.
const uiText=ref(''), dbText=ref(''), uiStatus=ref('waiting'), dbStatus=ref('waiting')
const snippets=['你好，','这是一段','正在生成的','回答内容。']
const nextPiece=ref(0)
function addPiece(){if(nextPiece.value>=snippets.length)return;uiText.value+=snippets[nextPiece.value++];uiStatus.value='streaming'}
function saveCheckpoint(){dbText.value=uiText.value;dbStatus.value='streaming'}
function saveFinal(){dbText.value=uiText.value;dbStatus.value='answered';uiStatus.value='answered'}
function refresh(){uiText.value=dbText.value;uiStatus.value=dbStatus.value==='answered'?'answered':'incomplete';if(dbStatus.value!=='answered')dbStatus.value='incomplete'}
function clear(){nextPiece.value=0;uiText.value='';dbText.value='';uiStatus.value='waiting';dbStatus.value='waiting'}
const copyHint=ref('')
async function copyFrom(el:Element){
 const found=el.parentElement?.querySelector('code')?.textContent||''
 try{await navigator.clipboard.writeText(found);copyHint.value='代码已复制'}catch{copyHint.value='复制失败，请手动选择'}
}
function mountCopy(root:HTMLElement){
 root.querySelectorAll('pre').forEach(pre=>{
  if(pre.querySelector('[data-copy17]'))return
  const b=document.createElement('button');b.type='button';b.textContent='复制代码';b.className='copy17';b.dataset.copy17='1';
  b.addEventListener('click',()=>void copyFrom(b));pre.prepend(b)
 })
}
const articleRef=ref<HTMLElement|null>(null)
onMounted(()=>{void nextTick(()=>{if(articleRef.value)mountCopy(articleRef.value)})})
</script>

<template>
  <article class="lesson17">
    <div ref="articleRef" class="original" v-html="article"></div>
    <section class="lab" aria-label="浏览器刷新检查点模拟实验">
      <h2>🧪 交互实验：刷新会丢掉哪一段？</h2>
      <p>这里是纯前端模型，不执行真正网络请求。先追加两段内容，再保存检查点；继续追加后点击“模拟刷新”，观察数据库记录与当前显示的区别。</p>
      <div class="lab-panels">
        <div><strong>页面当前显示</strong><p>{{uiText||'（空）'}}</p><small>{{uiStatus}}</small></div>
        <div><strong>数据库最近一次 PUT</strong><p>{{dbText||'（尚无草稿）'}}</p><small>{{dbStatus}}</small></div>
      </div>
      <div class="buttons">
        <button @click="addPiece" :disabled="nextPiece>=snippets.length">接收 SSE delta</button>
        <button @click="saveCheckpoint">模拟检查点 PUT</button>
        <button @click="saveFinal">模拟最终 PUT</button>
        <button @click="refresh">模拟刷新 GET</button>
        <button @click="clear">重置实验</button>
      </div>
      <p class="hint">刷新只会恢复数据库最后保存的内容；只有最终 PUT 成功才得到 answered。</p>
    </section>
    <section class="quiz"><h2>📝 交互测验：四道选择题</h2>
      <fieldset v-for="(q,i) in questions" :key="i"><legend>{{i+1}}. {{q.q}}</legend>
        <label v-for="(o,j) in q.options" :key="j">
          <input type="radio" :name="'q17-'+i" :checked="answers[i]===j" @change="answers[i]=j;graded=false">{{'ABC'[j]}}. {{o}}
        </label>
        <p v-if="graded" class="hint">{{answers[i]===q.a?'答对了。':'答错了。'}}正确答案：{{'ABC'[q.a]}}。{{q.why}}</p>
      </fieldset>
      <div class="buttons"><button :disabled="!ready" @click="graded=true">提交评分</button><button @click="reset">重新作答</button></div>
      <p v-if="graded" role="status">得分：{{score}} / 4</p>
    </section><p role="status" class="hint">{{copyHint}}</p>
  </article>
</template>
