<script setup lang="ts">
import {computed,onBeforeUnmount,ref} from 'vue'
import source from './article.html?raw'
import questions from './exercise-data.json'
// Preserve canonical bytes. Repair leftover Markdown bold only outside code blocks.
const article=source.split(/(<pre[\s\S]*?<\/pre>)/g).map(s=>s.startsWith('<pre')?s:s.replace(/\*\*([\s\S]+?)\*\*/g,'<strong>$1</strong>')).join('')
const scenario=ref('answered'),state=ref('idle'),detail=ref('尚未发送。')
let timer:ReturnType<typeof setTimeout>|undefined
const messages:Record<string,string>={answered:'本地演示：回答已完成，可以显示文字。事实仍需要核验。',refused:'本地演示：收到拒绝，保留拒绝说明。',incomplete:'本地演示：生成未完成，不冒充成功答案。',failed:'本地演示：请求失败，恢复按钮并显示错误。'}
function run(){state.value='pending';detail.value='正在等待后端（模拟）…';timer=setTimeout(()=>{state.value=scenario.value;detail.value=messages[scenario.value]},650)}
function reset(){clearTimeout(timer);scenario.value='answered';state.value='idle';detail.value='尚未发送。'}
onBeforeUnmount(()=>clearTimeout(timer))
const selected=ref<Record<number,number>>({}),submitted=ref(false)
const ready=computed(()=>questions.every((_,i)=>selected.value[i]!==undefined))
const score=computed(()=>questions.filter((q,i)=>q.a===selected.value[i]).length)
function pick(i:number,j:number){selected.value[i]=j;submitted.value=false}
</script>
<template><article class="lesson14">
<div class="original" v-html="article"></div>
<section class="extras"><h2>配套实验：一轮请求怎么结束？</h2><p>本地流程演示，无网络请求，不是实际 React + Node.js 工程。</p><svg class="flow" viewBox="0 0 660 96" role="img" aria-label="页面、后端和模型的请求流程"><g fill="none" stroke="currentColor"><rect x="5" y="14" width="170" height="52" rx="10"/><rect x="245" y="14" width="170" height="52" rx="10"/><rect x="485" y="14" width="170" height="52" rx="10"/><path d="M180 40h55m-8 -6 8 6-8 6M420 40h55m-8 -6 8 6-8 6"/></g><g fill="currentColor" text-anchor="middle" font-size="16"><text x="90" y="46">React 页面</text><text x="330" y="46">Node.js 后端</text><text x="570" y="46">模型服务</text></g><text fill="currentColor" x="330" y="90" text-anchor="middle" font-size="12">模拟模式在后端返回，不访问模型服务</text></svg>
<label>模拟结果<select v-model="scenario" :disabled="state==='pending'"><option value="answered">正常完成</option><option value="refused">被拒绝</option><option value="incomplete">生成不完整</option><option value="failed">请求失败</option></select></label>
<div class="actions"><button type="button" :disabled="state==='pending'" @click="run">运行演示</button><button type="button" @click="reset">重置演示</button></div><div class="result" role="status"><strong>{{state}}</strong><p>{{detail}}</p></div>
<h2>四道课后选择题</h2><fieldset v-for="(q,i) in questions" :key="i"><legend>{{i+1}}. {{q.q}}</legend><label v-for="(o,j) in q.options" :key="j"><input type="radio" :name="'l14q'+i" :checked="selected[i]===j" @change="pick(i,j)">{{String.fromCharCode(65+j)}}. {{o}}</label><p v-if="submitted" class="feedback">{{selected[i]===q.a?'✓ 回答正确。':'回答错误。'}}正确答案：{{String.fromCharCode(65+q.a)}}。{{q.why}}</p></fieldset>
<div class="actions"><button type="button" :disabled="!ready" @click="submitted=true">提交评分</button><button type="button" @click="selected={};submitted=false">重新作答</button></div><p v-if="submitted" role="status">得分：{{score}} / {{questions.length}}</p>
</section></article></template>
<style scoped>
.lesson14{color:var(--vp-c-text-1);font-size:16px;line-height:1.85;overflow-wrap:anywhere;min-width:0}.original :deep(h1){font-size:30px;line-height:1.45}.original :deep(h2),h2{font-size:23px;line-height:1.5;margin-top:36px;padding-top:20px;border-top:1px solid var(--vp-c-divider)}.original :deep(h3){font-size:18px}.original :deep(p){margin:16px 0}.original :deep(blockquote){padding:1px 18px;border-left:3px solid var(--vp-c-brand-1);background:var(--vp-c-bg-soft)}.original :deep(pre){padding:16px;max-width:100%;overflow:auto;background:var(--vp-c-bg-soft);border-radius:10px;line-height:1.7}.original :deep(pre code){font-size:13px;color:inherit;background:none;white-space:pre}.original :deep(table){display:block;max-width:100%;overflow:auto}.original :deep(a){overflow-wrap:anywhere;color:var(--vp-c-brand-1)}.extras{padding:18px;border:1px solid var(--vp-c-divider);border-radius:12px;margin-top:36px}.flow{display:block;width:100%;height:auto;margin:18px 0}.actions{display:flex;gap:10px;flex-wrap:wrap;margin:15px 0}button,select{border:1px solid var(--vp-c-divider);padding:8px 12px;border-radius:8px;background:var(--vp-c-bg);color:inherit;cursor:pointer}button:disabled{opacity:.45;cursor:not-allowed}select{display:block;width:100%;margin-top:8px}fieldset{min-width:0;padding:14px;border:1px solid var(--vp-c-divider);border-radius:10px;margin:24px 0}legend{max-width:100%;font-weight:600}fieldset label{display:flex;gap:8px;align-items:baseline;margin:9px 0;padding:8px;background:var(--vp-c-bg-soft);border-radius:8px}input{flex-shrink:0}.result,.feedback{padding:12px;background:var(--vp-c-bg-soft);border-radius:8px}@media(max-width:600px){.lesson14{font-size:15px}.original :deep(h1){font-size:25px}.original :deep(h2),h2{font-size:21px}.extras{padding:12px}}
</style>
