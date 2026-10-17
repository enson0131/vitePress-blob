<script setup lang="ts">
import {computed,ref} from 'vue'
const role=ref('你是严谨的前端技术导师。')
const task=ref('解释 React useEffect 的用途')
const format=ref('分三点回答，每点不超过50字')
const messagePreview=computed(()=>[{role:'system',content:role.value},{role:'user',content:task.value+'。'+format.value}])
const answers=ref<number[]>([]),submitted=ref(false)
const questions=[
{q:'System 和 User 消息的主要区别是什么？',opts:['System 通常设置上层行为约束，User 表达具体需求','System 一定包含事实真相','User 永远不能影响回答'],a:0,ex:'角色用于标明指令来源和优先级，不代表内容必然正确。'},
{q:'为什么不能把检索文档直接当作高优先级指令？',opts:['文档太长','检索内容是可能含恶意指令的不可信数据','文档不能包含中文'],a:1,ex:'外部文档应作为数据处理，避免提示词注入越权。'},
{q:'要求模型输出 JSON，最可靠的工程方式通常是什么？',opts:['只说“请输出JSON”','使用支持的结构化输出并校验结果','把 Temperature 调到最高'],a:1,ex:'结构化输出约束与服务端校验比单靠提示词可靠。'},
{q:'历史消息为什么影响“它和 Vue 有什么区别”的理解？',opts:['模型会自动读取全部数据库','代词“它”需要先前上下文才能消歧','历史消息只影响费用'],a:1,ex:'模型只会利用当前请求中实际可用的上下文或已连接的其他机制。'}
]
const score=computed(()=>questions.filter((q,i)=>answers.value[i]===q.a).length)
function pick(i:number,j:number){const a=[...answers.value];a[i]=j;answers.value=a;submitted.value=false}
function reset(){answers.value=[];submitted.value=false}
</script>
<template>
<div class="lab"><strong>交互实验：Messages 组装器</strong>
<label>System 指令<textarea v-model="role" rows="2"/></label>
<label>用户问题<textarea v-model="task" rows="2"/></label>
<label>输出要求<textarea v-model="format" rows="2"/></label>
<div class="preview"><div v-for="(m,i) in messagePreview" :key="i" class="msg"><b>{{m.role}}</b><p>{{m.content}}</p></div></div>
<small>这里只演示如何组装请求，没有实际调用模型。具体 API 角色及优先级规则由模型提供方定义。</small>
</div>
<div class="lab"><strong>交互式课后测验</strong>
<div v-for="(q,i) in questions" :key="i" class="question"><b>{{i+1}}. {{q.q}}</b>
<label v-for="(o,j) in q.opts" :key="j" class="option"><input type="radio" :name="'lesson8-'+i" :checked="answers[i]===j" @change="pick(i,j)"/>{{o}}</label>
<p v-if="submitted" class="feedback">{{answers[i]===q.a?'✓ 回答正确':'正确答案：'+q.opts[q.a]}}。{{q.ex}}</p></div>
<div class="actions"><button :disabled="questions.some((_,i)=>answers[i]===undefined)" @click="submitted=true">提交评分</button><button @click="reset">重新作答</button></div>
<div v-if="submitted" class="score">得分：{{score}} / {{questions.length}}</div>
</div>
</template>
<style scoped>.lab{border:1px solid var(--vp-c-divider);border-radius:14px;padding:18px;margin:20px 0}.lab>strong{display:block;margin-bottom:12px}label{display:block;margin:12px 0}textarea{display:block;width:100%;padding:9px;border:1px solid var(--vp-c-divider);border-radius:8px;background:var(--vp-c-bg);color:var(--vp-c-text-1)}.preview{background:var(--vp-c-bg-soft);border-radius:10px;padding:12px}.msg{padding:8px;border-bottom:1px solid var(--vp-c-divider);overflow-wrap:anywhere}.msg p{margin:5px 0}.msg b{color:var(--vp-c-brand-1)}small{color:var(--vp-c-text-2)}.question{padding:14px 0;border-bottom:1px solid var(--vp-c-divider)}.option{padding:9px;border:1px solid var(--vp-c-divider);border-radius:8px;cursor:pointer}.option input{margin-right:8px}.feedback{background:var(--vp-c-bg-soft);padding:10px;border-radius:8px}.actions{display:flex;gap:10px;margin-top:14px}.actions button{border:1px solid var(--vp-c-divider);background:var(--vp-c-bg-soft);border-radius:8px;padding:9px 14px;cursor:pointer}.actions button:disabled{opacity:.4}.score{text-align:center;font-size:23px;font-weight:bold;margin:15px}</style>