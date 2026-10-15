<script setup lang="ts">
import { computed, ref } from 'vue'
const props = defineProps<{ chapter: 1 | 3 }>()
const banks = {
1:[
{q:'基础 LLM 的核心生成机制是什么？',options:['从数据库查找固定答案','根据上下文预测下一个 Token','按字典逐字替换'],answer:1,why:'自回归模型依据已有上下文预测并生成后续 Token。'},
{q:'Token 与汉字或英文单词的关系是什么？',options:['始终一一对应','由 Tokenizer 决定，不一定一一对应','Token 只存在于英文'],answer:1,why:'不同 Tokenizer 的切分规则不同。'},
{q:'ChatGPT 能生成代码，意味着什么？',options:['代码必然正确','模型学习了代码模式，但仍需要测试','模型一定运行过代码'],answer:1,why:'合理的代码文本不代表执行结果和业务逻辑必然正确。'},
{q:'聊天应用与 LLM 的区别是什么？',options:['两者完全相同','应用还负责鉴权、历史、存储与流式传输','LLM 自动持久化所有会话'],answer:1,why:'LLM 负责生成，聊天产品还包含大量应用层能力。'}
],
3:[
{q:'Self-Attention 的核心作用是什么？',options:['将文本切成 Token','聚合上下文信息并更新表示','直接把答案存入数据库'],answer:1,why:'注意力根据 Q/K 匹配权重聚合 V。'},
{q:'Q、K、V 中哪一个承载被聚合的信息？',options:['Query','Key','Value'],answer:2,why:'Query 和 Key 计算匹配程度，Value 是被加权聚合的信息。'},
{q:'GPT 的 Causal Mask 限制什么？',options:['当前位置不能访问未来 Token','当前位置不能访问过去 Token','模型不能看到用户输入'],answer:0,why:'因果掩码屏蔽未来位置，但允许模型使用已提供的用户上下文。'},
{q:'FFN 与残差连接的主要作用是什么？',options:['FFN 进行非线性变换，残差帮助信息与梯度传播','两者只用于 Tokenizer','两者都负责持久化历史'],answer:0,why:'Transformer Block 不只有 Attention，还包含 FFN、残差、归一化等结构。'},
{q:'用户问「它和 Vue 有什么区别」，怎样让模型知道「它」是 React？',options:['Self-Attention 自动读取数据库','把相关历史消息加入当前请求','只提高 Temperature'],answer:1,why:'应用层必须提供相关上下文，模型不能访问未传入的历史。'}
]};
const questions = computed(()=>banks[props.chapter])
const selected=ref<number[]>([])
const submitted=ref(false)
const score=computed(()=>questions.value.filter((q,i)=>selected.value[i]===q.answer).length)
function choose(i:number,j:number){selected.value=[...selected.value];selected.value[i]=j;submitted.value=false}
function reset(){selected.value=[];submitted.value=false}
</script>
<template>
<section class="lesson-quiz" aria-label="交互式课后测验">
<h3>📝 交互式课后测验</h3>
<p class="intro">选择答案后点击提交，即可查看分数、正确答案和知识点解释。</p>
<div v-for="(q,i) in questions" :key="i" class="question">
<strong>{{i+1}}. {{q.q}}</strong>
<label v-for="(option,j) in q.options" :key="j" :class="{chosen:selected[i]===j}">
<input type="radio" :name="'lesson-'+chapter+'-question-'+i" :checked="selected[i]===j" @change="choose(i,j)"/>
<span>{{option}}</span>
</label>
<div v-if="submitted" class="feedback" :class="{correct:selected[i]===q.answer}">
<strong>{{selected[i]===q.answer?'✓ 回答正确':'正确答案：'+q.options[q.answer]}}</strong>
<p>{{q.why}}</p>
</div>
</div>
<div class="actions"><button :disabled="questions.some((_,i)=>selected[i]===undefined)" @click="submitted=true">提交答案</button><button class="secondary" @click="reset">重新作答</button></div>
<div v-if="submitted" class="score" aria-live="polite">得分：{{score}} / {{questions.length}}</div>
</section>
</template>
<style scoped>
.lesson-quiz{border:1px solid var(--vp-c-divider);border-radius:14px;padding:20px;margin:22px 0;background:var(--vp-c-bg)}
.lesson-quiz h3{font-size:18px;margin:0 0 8px}.intro{font-size:13px;color:var(--vp-c-text-2)}
.question{border-bottom:1px solid var(--vp-c-divider);padding:18px 0}
.question>strong{display:block;margin-bottom:10px}
.question label{display:flex;align-items:center;gap:10px;margin:7px 0;padding:9px 12px;border:1px solid var(--vp-c-divider);border-radius:9px;cursor:pointer}
.question label.chosen{border-color:var(--vp-c-brand-1);background:var(--vp-c-brand-soft)}
.question input{accent-color:var(--vp-c-brand-1)}
.feedback{background:var(--vp-c-bg-soft);border-radius:9px;padding:12px;margin-top:10px;font-size:13px}
.feedback.correct{border-left:3px solid #16a34a}
.feedback p{margin:5px 0 0}
.actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:18px}
.actions button{background:var(--vp-c-brand-1);color:white;border-radius:8px;padding:8px 16px;cursor:pointer}
.actions button.secondary{background:var(--vp-c-bg-soft);color:var(--vp-c-text-1);border:1px solid var(--vp-c-divider)}
.actions button:disabled{opacity:.4;cursor:not-allowed}
.score{background:var(--vp-c-bg-soft);text-align:center;border-radius:9px;padding:14px;font-size:20px;font-weight:700;margin-top:14px}
@media(max-width:600px){.lesson-quiz{padding:12px}}
</style>