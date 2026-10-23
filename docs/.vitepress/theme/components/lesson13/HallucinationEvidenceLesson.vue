<script setup lang="ts">
import { computed, ref } from 'vue'
import source from './article.html?raw'
import data from './exercise-data.json'
const answers=ref<Record<number,number>>({})
const submitted=ref(false)
const judgments=ref<Record<number,string>>({})
const ready=computed(()=>data.questions.every((_,i)=>answers.value[i]!==undefined))
const score=computed(()=>data.questions.filter((q,i)=>answers.value[i]===q.a).length)
const labels:Record<string,string>={supported:'有依据',contradicted:'冲突',insufficient:'证据不足'}
function choose(i:number,j:number){answers.value[i]=j;submitted.value=false}
function reset(){answers.value={};submitted.value=false}
</script>
<template>
<article class="lesson13">
<div class="original" v-html="source"></div>
<section class="extras">
<h2>配套练习：你来核对证据</h2>
<p>固定样本，本地交互，不调用模型，不自动验证任意文字。</p>
<blockquote><p>S1：本项目 v2 的 Token 校验必须由服务端完成，前端不得保存服务端密钥。</p><p>S2：登录失败后，最多重试 2 次。</p></blockquote>
<div v-for="(item,i) in data.cases" :key="i" class="trial"><strong>{{i+1}}. {{item.claim}}</strong><div class="actions"><button v-for="(label,key) in labels" :key="key" type="button" @click="judgments[i]=key">{{label}}</button></div><p v-if="judgments[i]" role="status" class="feedback">{{judgments[i]===item.answer?'✓ 判断正确。':'还差一步。'}}正确判定：{{labels[item.answer]}}。{{item.why}}</p></div>
<button type="button" @click="judgments={}">重做证据练习</button>
<h2>四道课后选择题</h2>
<fieldset v-for="(q,i) in data.questions" :key="i"><legend>{{i+1}}. {{q.q}}</legend><label v-for="(o,j) in q.options" :key="j"><input type="radio" :name="'l13q'+i" :checked="answers[i]===j" @change="choose(i,j)">{{String.fromCharCode(65+j)}}. {{o}}</label><p v-if="submitted" class="feedback">{{answers[i]===q.a?'✓ 回答正确。':'回答错误。'}}正确答案：{{String.fromCharCode(65+q.a)}}。{{q.why}}</p></fieldset>
<div class="actions"><button type="button" :disabled="!ready" @click="submitted=true">提交评分</button><button type="button" @click="reset">重新作答</button></div><p v-if="submitted" role="status">得分：{{score}} / {{data.questions.length}}</p>
</section>
</article>
</template>
<style scoped>
.lesson13{color:var(--vp-c-text-1,#20262e);font-size:16px;line-height:1.85;overflow-wrap:anywhere;min-width:0}.original :deep(h1){font-size:30px;line-height:1.45;margin:0 0 24px}.original :deep(h2),h2{font-size:23px;line-height:1.55;border-top:1px solid var(--vp-c-divider,#dbe1e8);padding-top:24px;margin:34px 0 16px}.original :deep(h3){font-size:18px;line-height:1.6}.original :deep(p){margin:15px 0}.original :deep(blockquote),blockquote{border-left:3px solid var(--vp-c-brand-1,#28654b);padding:1px 18px;background:var(--vp-c-bg-soft,#f2f5f8);margin:20px 0}.original :deep(pre){padding:16px;max-width:100%;overflow-x:auto;border-radius:10px;background:var(--vp-c-bg-soft,#f2f5f8);line-height:1.7}.original :deep(pre code){font-size:13px;white-space:pre;color:inherit;background:none}.original :deep(table){display:block;max-width:100%;overflow-x:auto;border-collapse:collapse;font-size:14px}.original :deep(th),.original :deep(td){border:1px solid var(--vp-c-divider,#dbe1e8);padding:9px 12px;min-width:70px}.original :deep(a){color:var(--vp-c-brand-1,#28654b);text-decoration:underline}.extras{border:1px solid var(--vp-c-divider,#dbe1e8);padding:18px;border-radius:12px;margin-top:32px}.trial,fieldset{border:1px solid var(--vp-c-divider,#dbe1e8);padding:14px;border-radius:10px;margin:20px 0;min-width:0}.actions{display:flex;gap:8px;flex-wrap:wrap;margin:14px 0}button{border:1px solid var(--vp-c-divider,#dbe1e8);border-radius:8px;padding:7px 12px;background:var(--vp-c-bg,#fff);color:inherit;cursor:pointer}button:disabled{opacity:.45;cursor:not-allowed}button:focus-visible,input:focus-visible{outline:2px solid var(--vp-c-brand-1,#28654b);outline-offset:3px}legend{font-weight:600;max-width:100%}label{display:flex;align-items:baseline;gap:8px;background:var(--vp-c-bg-soft,#f2f5f8);padding:8px;margin:8px 0;border-radius:6px;cursor:pointer}input{flex-shrink:0}.feedback{padding:12px;border-radius:8px;background:var(--vp-c-bg-soft,#f2f5f8)}@media(max-width:600px){.lesson13{font-size:15px}.original :deep(h1){font-size:25px}.original :deep(h2),h2{font-size:21px}.extras{padding:12px}.original :deep(pre){padding:12px}}
</style>
