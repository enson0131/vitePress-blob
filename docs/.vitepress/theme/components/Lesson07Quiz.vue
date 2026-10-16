<script setup lang="ts">
import {ref,computed} from 'vue'
const selected=ref<number[]>([]),submitted=ref(false)
const questions=[
{q:'128K 上下文是否意味着可输入 128K 再无限输出？',opts:['是','否，通常需要统一预算且可能有独立输出限制','只与网速有关'],a:1,why:'输入输出及消息开销都可能计入窗口。'},
{q:'Lost in the Middle 指什么？',opts:['中间 Token 不参与计算','部分模型利用长上下文中间信息的效果较弱','所有模型只看开头'],a:1,why:'它是部分模型和任务中观察到的现象，不是绝对规律。'},
{q:'Temperature 设为 0 能消除幻觉吗？',opts:['能','不能','会自动联网'],a:1,why:'低随机性无法纠正模型本身偏好的错误答案。'},
{q:'降低企业知识问答幻觉应优先做什么？',opts:['RAG、引用溯源和验证','仅增加输出长度','关闭监控'],a:0,why:'可信证据、验证和拒答机制更有针对性。'}]
const score=computed(()=>questions.filter((q,i)=>selected.value[i]===q.a).length)
function pick(i:number,j:number){const next=[...selected.value];next[i]=j;selected.value=next;submitted.value=false}
function reset(){selected.value=[];submitted.value=false}
</script>
<template><div class="lab"><div v-for="(q,i) in questions" :key="i" class="question"><strong>{{i+1}}. {{q.q}}</strong><label v-for="(opt,j) in q.opts" :key="j"><input type="radio" :name="'ch7-'+i" :checked="selected[i]===j" @change="pick(i,j)"/>{{opt}}</label><p v-if="submitted" class="feedback">{{selected[i]===q.a?'✓ 回答正确':'正确答案：'+q.opts[q.a]}}。{{q.why}}</p></div><div class="buttons"><button :disabled="questions.some((_,i)=>selected[i]===undefined)" @click="submitted=true">提交评分</button><button @click="reset">重新作答</button></div><div v-if="submitted" class="score">得分：{{score}} / {{questions.length}}</div></div></template>
<style scoped>.lab{border:1px solid var(--vp-c-divider);border-radius:14px;padding:18px;margin:20px 0}.question{border-bottom:1px solid var(--vp-c-divider);padding:14px 0}label{display:block;padding:9px;border:1px solid var(--vp-c-divider);border-radius:8px;margin:8px 0;cursor:pointer}input{margin-right:8px}.feedback{background:var(--vp-c-bg-soft);padding:10px;border-radius:8px}.buttons{display:flex;gap:10px;margin-top:16px}.buttons button{border:1px solid var(--vp-c-divider);background:var(--vp-c-bg-soft);padding:9px 14px;border-radius:8px;cursor:pointer}.buttons button:disabled{opacity:.4}.score{text-align:center;font-size:23px;font-weight:bold;margin:15px}</style>