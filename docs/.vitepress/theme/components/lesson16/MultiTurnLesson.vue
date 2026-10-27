<script setup lang="ts">
import { ref, shallowRef, computed, onMounted } from 'vue'
import source from './article.html?raw'
import questions from './exercise-data.json'
import { initialLab, labStep } from './lab-model.ts'
import type { Operation } from './lab-model.ts'
import { buildHistory } from './history.ts'
import { isPending, canRetry, labels } from './chat-state.ts'
import './page.css'
const article=ref<HTMLElement|null>(null), copyStatus=ref('')
const lab=shallowRef(initialLab())
const last=computed(()=>lab.value.chat.turns.at(-1))
const busy=computed(()=>last.value?isPending(last.value.status):false)
const history=computed(()=>{try{return JSON.stringify(buildHistory(lab.value.chat.turns),null,2)}catch(e){return e instanceof Error?e.message:'历史组装失败'}})
const answers=ref<number[]>([]),submitted=ref(false)
const ready=computed(()=>questions.every((_,i)=>answers.value[i]!==undefined))
const score=computed(()=>questions.filter((q,i)=>answers.value[i]===q.answer).length)
function step(op:Operation){lab.value=labStep(lab.value,op)}
function choose(i:number,j:number){answers.value[i]=j;submitted.value=false}
onMounted(()=>article.value?.querySelectorAll('pre').forEach(pre=>{
 const bar=document.createElement('div');bar.className='code-tools';bar.dataset.ui='true'
 const copy=document.createElement('button');copy.type='button';copy.textContent='复制代码'
 copy.onclick=async()=>{try{await navigator.clipboard.writeText(pre.querySelector('code')?.textContent??'');copyStatus.value='代码已复制'}catch{copyStatus.value='复制未成功，请手动选择代码'}}
 const wrap=document.createElement('button');wrap.type='button';wrap.textContent='切换换行';wrap.onclick=()=>{pre.classList.toggle('wrap')}
 bar.append(copy,wrap);pre.before(bar)
}))
</script>
<template>
<article class="lesson16">
<div ref="article" class="original" v-html="source"></div>
<p role="status">{{copyStatus}}</p>
<section class="supplement">
<h2>配套实验：让旧请求迟到一次</h2>
<p class="small">本地状态实验，复用固定 Turn.id、status 和控制器检查；不发送网络请求，不调用模型。先开始、接收一段、停止、重试，再注入旧事件。</p>
<div class="actions">
<button :disabled="busy" @click="step('start')">开始一轮</button>
<button :disabled="!busy" @click="step('delta')">收到一段文字</button>
<button :disabled="!busy" @click="step('stop')">停止当前生成</button>
<button :disabled="!last||!canRetry(last.status)" @click="step('retry')">重新回答</button>
<button :disabled="!lab.old" @click="step('lateDelta')">注入旧请求增量</button>
<button :disabled="!lab.old" @click="step('lateEnd')">注入旧请求结束</button>
<button :disabled="!lab.old" @click="step('lateError')">注入旧请求报错</button>
<button :disabled="!lab.old" @click="step('lateFinally')">执行旧请求清理</button>
<button :disabled="!busy" @click="step('complete')">完成当前回答</button>
<button @click="step('new')">新会话</button>
<button @click="lab=initialLab()">重置实验</button>
</div>
<div class="readout"><p>会话：{{lab.chat.conversationId}} · 轮次：{{last?.id??'—'}} · 当前请求：{{lab.active?'有效控制器':'无'}}</p><p class="terminal">{{last?labels[last.status]:'尚未开始'}}</p><div class="answer">{{last?.answer||'（尚无正文）'}}</div><p v-if="last?.notice">{{last.notice}}</p></div>
<h3>事件处理记录</h3><div class="eventlog" aria-live="polite">{{lab.logs.join('\n')||'等待操作'}}</div>
<h3>下一次请求可携带的历史</h3><pre><code>{{history}}</code></pre>
<p class="small">已完成 {{lab.chat.turns.filter(t=>t.status==='answered').length}} 轮。这是本课的文本投影，不是完整服务商响应回放。全部 answered 问答按原顺序保留，不截取最近6轮；其他状态仍在界面，不自动进入模型历史。</p>
<h2>四道选择题</h2>
<fieldset v-for="(q,i) in questions" :key="i"><legend>{{i+1}}. {{q.q}}</legend><label v-for="(o,j) in q.options" :key="j" class="option"><input type="radio" :name="'l16-q-'+i" :checked="answers[i]===j" @change="choose(i,j)">{{String.fromCharCode(65+j)}}. {{o}}</label><p v-if="submitted" class="feedback">{{answers[i]===q.answer?'✓ 正确。':'再想想。'}}答案：{{String.fromCharCode(65+q.answer)}}。{{q.why}}</p></fieldset>
<div class="actions"><button :disabled="!ready" @click="submitted=true">提交评分</button><button @click="answers=[];submitted=false">重新作答</button></div><p v-if="submitted" class="score" role="status">得分：{{score}} / 4</p>
</section></article>
</template>
