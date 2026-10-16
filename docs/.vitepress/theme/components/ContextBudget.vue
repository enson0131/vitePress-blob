<script setup lang="ts">
import {computed,ref} from 'vue'
const history=ref(40),docs=ref(50),output=ref(8)
const total=computed(()=>history.value+docs.value+output.value+5)
</script>
<template><div class="lab">
<strong>128K Token 上下文预算模拟器</strong>
<label>聊天历史：{{history}}K<input v-model.number="history" type="range" min="0" max="100" step="5"/></label>
<label>检索文档：{{docs}}K<input v-model.number="docs" type="range" min="0" max="100" step="5"/></label>
<label>预留输出：{{output}}K<input v-model.number="output" type="range" min="1" max="32"/></label>
<div class="metric">已规划容量（另含 5K 系统提示）：{{total}}K / 128K</div>
<div class="progress"><div :style="{width:Math.min(total/128*100,100)+'%',background:total>128?'#dc2626':'#16a34a'}"></div></div>
<p :style="{color:total>128?'#dc2626':'#16a34a'}">{{total>128?'超出预算 '+(total-128)+'K Tokens':'剩余 '+(128-total)+'K Tokens'}}</p>
<small>教学用共享窗口预算模型；真实 API 可能另有独立输出限制。</small>
</div></template>
<style scoped>.lab{border:1px solid var(--vp-c-divider);border-radius:14px;padding:18px;margin:20px 0}.lab strong{display:block;margin-bottom:12px}label{display:block;margin:12px 0}input{display:block;width:100%;accent-color:var(--vp-c-brand-1)}.metric{font-weight:bold;padding:10px;background:var(--vp-c-bg-soft);border-radius:8px}.progress{height:12px;background:var(--vp-c-bg-soft);border-radius:10px;overflow:hidden;margin-top:10px}.progress>div{height:100%}small{color:var(--vp-c-text-2)}</style>