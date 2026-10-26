<script setup lang="ts">
import {computed,onBeforeUnmount,ref} from 'vue'
import original from './article.html?raw'
import supplement from './utf8-supplement.html?raw'
import Utf8DecodeDemo from './Utf8DecodeDemo.vue'
import questions from './exercise-data.json'
const anchor='<h2>四、后端：不再只调用一次 res.end</h2>'
const source=original.replace(anchor,supplement+anchor)
type State='idle'|'waiting'|'streaming'|'answered'|'incomplete'|'refused'|'failed'|'stopped'
const labels:Record<State,string>={idle:'尚未发送',waiting:'等待第一段（模拟）',streaming:'正在生成：这是草稿',answered:'已完成（不代表事实已核验）',incomplete:'未完整生成，保留草稿',refused:'请求被拒绝',failed:'异常结束，保留草稿',stopped:'已停止，保留草稿'}
const state=ref<State>('idle'),scenario=ref('answered'),text=ref(''),notice=ref(''),log=ref('')
const busy=computed(()=>state.value==='waiting'||state.value==='streaming')
const pieces=['【本地演示，无网络调用】\n','收到一小段，就先显示。','没有结束事件，','就不算完成。']
let timer:ReturnType<typeof setTimeout>|undefined,epoch=0,index=0
function clear(){epoch++;clearTimeout(timer)}
function resetDemo(){clear();state.value='idle';scenario.value='answered';text.value='';notice.value='';log.value=''}
function stop(){clear();state.value='stopped';notice.value='本地演示已停止；不再追加文字。';log.value+='abort: user → 后端 → 上游（示意）\n'}
function run(){clear();const token=epoch;index=0;text.value='';notice.value='';log.value='POST /api/chat/stream（仅图解，不发请求）\n';state.value='waiting'
 const mode=scenario.value
 function tick(){if(token!==epoch)return
  if(mode==='refused'){state.value='refused';notice.value='这是固定拒绝样本，不是模型判断。';log.value+='end: status=refused\n';return}
  if(index===2&&mode!=='answered'){
   if(mode==='disconnect'){state.value='failed';notice.value='未收到结束事件，不能视为完整回答。';log.value+='EOF：连接结束；未收到 end\n'}
   else if(mode==='incomplete'){state.value='incomplete';notice.value='模拟输出上限。';log.value+='end: status=incomplete\n'}
   else{state.value='failed';notice.value='流中错误，不伪装成功。';log.value+='error: 模拟上游故障\n'}return
  }
  if(index<pieces.length){state.value='streaming';text.value+=pieces[index];log.value+='delta: '+JSON.stringify(pieces[index++])+'\n';timer=setTimeout(tick,240)}
  else{state.value='answered';text.value=pieces.join('');log.value+='end: status=answered\n'}
 }timer=setTimeout(tick,450)
}
onBeforeUnmount(clear)
const answers=ref<Record<number,number>>({}),submitted=ref(false)
const ready=computed(()=>questions.every((_,i)=>answers.value[i]!==undefined))
const score=computed(()=>questions.filter((q,i)=>answers.value[i]===q.a).length)
function choose(i:number,j:number){answers.value[i]=j;submitted.value=false}
function resetQuiz(){answers.value={};submitted.value=false}
</script>
<template><article class="lesson15"><div class="original" v-html="source"></div><section class="extras"><Utf8DecodeDemo /><h2>配套实验：这一段回答，真的结束了吗？</h2><p>本地定时演示，不发送HTTP请求，不调用模型。真正的SSE链路请运行project。</p><svg class="flow" viewBox="0 0 700 108" role="img" aria-label="模型输出经后端转换为SSE事件，前端追加草稿并等待结束信号"><g fill="none" stroke="currentColor"><rect x="5" y="12" width="180" height="54" rx="10"/><rect x="260" y="12" width="180" height="54" rx="10"/><rect x="515" y="12" width="180" height="54" rx="10"/><path d="M190 40h60m-9-6 9 6-9 6M445 40h60m-9-6 9 6-9 6"/></g><g fill="currentColor" text-anchor="middle" font-size="15"><text x="95" y="45">模型输出</text><text x="350" y="45">Node.js → SSE</text><text x="605" y="45">React 草稿</text><text x="350" y="95" font-size="12">delta 只追加；end 确认状态；断线不等于成功</text></g></svg>
<label for="l15scenario">模拟场景<select id="l15scenario" v-model="scenario" :disabled="busy"><option value="answered">正常完成</option><option value="incomplete">生成上限：不完整</option><option value="refused">拒绝</option><option value="failed">流中错误</option><option value="disconnect">无结束事件就断线</option></select></label>
<div class="actions"><button type="button" :disabled="busy" @click="run">开始演示</button><button type="button" :disabled="!busy" @click="stop">停止生成</button><button type="button" @click="resetDemo">重置演示</button></div>
<p class="demo-state" :data-state="state" role="status">{{labels[state]}}</p><div class="draft">{{text}}</div><p class="notice" role="status">{{notice}}</p><details><summary>查看事件记录</summary><pre>{{log}}</pre></details>
<h2>四道课后选择题</h2><fieldset v-for="(q,i) in questions" :key="i"><legend>{{i+1}}. {{q.q}}</legend><label v-for="(o,j) in q.options" :key="j" class="option"><input type="radio" :name="'q15-'+i" :checked="answers[i]===j" @change="choose(i,j)">{{String.fromCharCode(65+j)}}. {{o}}</label><p v-if="submitted" class="feedback">{{answers[i]===q.a?'✓ 回答正确。':'回答错误。'}}正确答案：{{String.fromCharCode(65+q.a)}}。{{q.why}}</p></fieldset><div class="actions"><button type="button" :disabled="!ready" @click="submitted=true">提交评分</button><button type="button" @click="resetQuiz">重新作答</button></div><p v-if="submitted" role="status" class="score">得分：{{score}} / {{questions.length}}</p></section><footer><p><a href="https://github.com/enson0131/vitePress-blob/tree/master/examples/lesson15-streaming-chat">查看完整 React + Node.js 工程及运行说明</a></p><p>下载或克隆仓库后进入 examples/lesson15-streaming-chat；这里对应原工程包中的 project 目录。</p></footer></article></template>
<style scoped>
.lesson15{font-size:16px;line-height:1.85;color:var(--vp-c-text-1);overflow-wrap:anywhere;min-width:0}.original :deep(h1){font-size:30px;line-height:1.45;margin:20px 0 26px}.original :deep(h2),h2{font-size:24px;line-height:1.5;border-top:1px solid var(--vp-c-divider);padding-top:24px;margin:36px 0 16px}.original :deep(h3){font-size:19px;line-height:1.6}.original :deep(h4){font-size:17px;margin:24px 0 12px}.original :deep(h5){font-size:16px;margin:18px 0}.original :deep(.integration-note){border-left:3px solid var(--vp-c-brand-1);padding:2px 16px;background:var(--vp-c-bg-soft);margin:20px 0}.original :deep(p){margin:16px 0}.original :deep(blockquote){padding:1px 18px;border-left:3px solid var(--vp-c-brand-1);background:var(--vp-c-bg-soft);margin:20px 0}.original :deep(pre),details pre{max-width:100%;overflow:auto;background:var(--vp-c-bg-soft);border-radius:10px;padding:16px;line-height:1.7}.original :deep(pre code){white-space:pre;font-size:13px;color:inherit;background:none}.original :deep(table){display:block;max-width:100%;overflow:auto;font-size:14px}.original :deep(td),.original :deep(th){padding:10px 12px;min-width:100px}.original :deep(a){color:var(--vp-c-brand-1)}.extras{border:1px solid var(--vp-c-divider);padding:20px;border-radius:14px;margin-top:36px}.flow{width:100%;height:auto;display:block;margin:20px 0}.actions{display:flex;gap:10px;flex-wrap:wrap;margin:15px 0}button,select{border:1px solid var(--vp-c-divider);border-radius:8px;background:var(--vp-c-bg);color:inherit;padding:8px 12px;cursor:pointer;font-size:14px}button:disabled{opacity:.45;cursor:not-allowed}select{display:block;width:100%;margin:8px 0}.demo-state,.score{font-weight:650;font-size:19px}.draft{background:var(--vp-c-bg-soft);padding:16px;min-height:110px;white-space:pre-wrap;border-radius:10px}.notice{color:var(--vp-c-danger-1)}fieldset{min-width:0;border:1px solid var(--vp-c-divider);border-radius:10px;padding:14px;margin:22px 0}legend{font-weight:600;max-width:100%;font-size:15px}.option{display:flex;align-items:baseline;gap:8px;background:var(--vp-c-bg-soft);padding:9px;margin:9px 0;border-radius:8px;cursor:pointer;font-size:14px}.option input{flex-shrink:0}.feedback{padding:12px;border-left:3px solid var(--vp-c-brand-1)}button:focus-visible,input:focus-visible,select:focus-visible{outline:2px solid var(--vp-c-brand-1);outline-offset:3px}footer{margin-top:24px;font-size:14px}@media(max-width:600px){.lesson15{font-size:15px}.original :deep(h1){font-size:25px}.original :deep(h2),h2{font-size:21px}.extras{padding:12px}.original :deep(pre){padding:12px}}
</style>
