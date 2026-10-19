<script setup lang="ts">
import {ref,computed} from 'vue'
const budget=ref(12000),history=ref(4000),summary=ref(1200),memory=ref(1800),output=ref(3000)
const used=computed(()=>history.value+summary.value+memory.value+output.value+1200)
const answers=ref<number[]>([]),submitted=ref(false)
const questions=[
{q:'聊天记录保存到数据库，模型是否自动拥有长期记忆？',o:['是','否，需要应用检索并注入','只有 Python 才可以'],a:1,e:'存储不等于模型权重更新；需要应用按需检索。'},
{q:'摘要压缩最大的风险是什么？',o:['一定更准确','遗漏关键事实','永久修改权重'],a:1,e:'摘要有损，应保留来源与关键结构化事实。'},
{q:'KV Cache 与长期记忆的关系是？',o:['相同','前者是推理缓存，后者是应用数据','都永久存储'],a:1,e:'二者作用层次、生命周期不同。'},
{q:'用户要求删除记忆时应怎么做？',o:['仅提示模型忘记','在存储和索引层执行删除或失效','只隐藏 UI'],a:1,e:'需要可信后端执行，按策略处理缓存和备份。'}
]
const score=computed(()=>questions.filter((q,i)=>answers.value[i]===q.a).length)
function pick(i:number,j:number){const a=[...answers.value];a[i]=j;answers.value=a;submitted.value=false}
</script>
<template><article class="lesson">
<div class="meta">第 10 / 40 篇 · 第二阶段：聊天机器人核心原理 · 阅读约 15 分钟</div>
<h1>聊天机器人的记忆系统：短期记忆、长期记忆与语义检索</h1>
<p>第 09 篇讨论了多轮对话和上下文管理。这一篇继续回答：为什么聊天机器人关闭页面后仍可能记得你的偏好？它如何决定保存什么、何时检索、什么时候应该遗忘？</p>
<p><strong>核心观点：模型的上下文不是数据库。长期记忆是应用层围绕提取、存储、检索、注入、更新与删除构建的系统。</strong></p>
<h2>一、先分清三种“记忆”</h2>
<table><thead><tr><th>机制</th><th>所在位置</th><th>主要用途</th></tr></thead><tbody>
<tr><td>短期记忆</td><td>当前 Messages</td><td>理解最近对话</td></tr>
<tr><td>长期记忆</td><td>数据库 / 检索索引</td><td>跨会话保存信息</td></tr>
<tr><td>KV Cache</td><td>推理服务显存/内存</td><td>复用注意力计算</td></tr></tbody></table>
<p>例如用户说“以后代码示例优先 TypeScript”。下一次会话若要遵循，应用必须保存这条偏好，并在合适的请求中取出。保存聊天记录不等于模型自动学习了这条规则。</p>
<h2>二、记忆系统的完整架构</h2>
<div class="visual"><strong>写入路径</strong><div class="step">用户对话事件</div><div class="arrow">↓</div><div class="step">提取候选事实 / 偏好</div><div class="arrow">↓</div><div class="step">验证、去重、权限和有效期</div><div class="arrow">↓</div><div class="step">持久化数据库与检索索引</div></div>
<div class="visual"><strong>读取路径</strong><div class="step">用户当前问题</div><div class="arrow">↓</div><div class="step">权限过滤 + 语义 / 关键词召回</div><div class="arrow">↓</div><div class="step">相关性重排 + Token 预算</div><div class="arrow">↓</div><div class="step">注入 Messages → LLM 回答</div></div>
<p>写入和读取是两条不同链路。不是所有闲聊都值得保存，也不是每次都要把所有记忆发送给模型。</p>
<h2>三、短期记忆：滑动窗口与摘要</h2>
<p>滑动窗口保留最近 N 轮消息，简单且忠实，但较早事实可能被裁剪。历史摘要节省 Token，却可能丢失重要数字、时间和条件。</p>
<div class="visual"><strong>交互实验：上下文预算分配</strong>
<label>总预算：{{budget}} Tokens<input v-model.number="budget" type="range" min="4000" max="24000" step="1000"/></label>
<label>最近消息：{{history}} Tokens<input v-model.number="history" type="range" min="0" max="12000" step="500"/></label>
<label>历史摘要：{{summary}} Tokens<input v-model.number="summary" type="range" min="0" max="6000" step="200"/></label>
<label>检索记忆：{{memory}} Tokens<input v-model.number="memory" type="range" min="0" max="6000" step="200"/></label>
<label>输出预留：{{output}} Tokens<input v-model.number="output" type="range" min="500" max="6000" step="500"/></label>
<div class="score">已规划 {{used}} / {{budget}} Tokens</div><div class="bar"><div :style="{width:Math.min(100,used/budget*100)+'%',background:used>budget?'#dc2626':'#16a34a'}"></div></div>
<p>{{used>budget?'超出预算，请减少历史或检索内容':'剩余 '+(budget-used)+' Tokens'}}</p><small>另固定预留 1200 Tokens 系统提示与格式开销；教学示例。</small></div>
<p>例如“每月 1 号投入 800 美元”被摘要为“每月投资”，就丢失了日期和金额。关键事实最好结构化存储并保留来源。</p>
<h2>四、长期记忆的数据模型</h2>
<p>生产系统需要作用域、来源、更新时间、有效期和删除状态，而不只是一个 content 字符串。</p>
<pre v-pre><code>type MemoryRecord = {
  id: string;
  userId: string;
  scope: "user" | "project";
  content: string;
  category: "preference" | "fact" | "task";
  sourceMessageId?: string;
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
  status: "active" | "superseded" | "deleted";
};</code></pre>
<p>当用户把“优先 Python”更改为“优先 TypeScript”，系统应让新偏好生效、旧偏好失效，避免冲突。</p>
<h2>五、语义检索为什么比关键词更灵活？</h2>
<p>记忆写的是“代码示例优先 TypeScript”，问题是“以后示例用什么语言？”。词面不同但语义相近，可以使用 Embedding 召回候选。实际检索应结合关键词、向量检索、时间和可信度重排。</p>
<div class="visual"><strong>检索的四层过滤</strong><div class="step">用户 / 项目权限范围</div><div class="arrow">↓</div><div class="step">关键词 + Embedding 混合召回</div><div class="arrow">↓</div><div class="step">相关性、时效性、可信度重排</div><div class="arrow">↓</div><div class="step">Token 预算裁剪后注入</div></div>
<p>向量相似度高不代表事实可靠。尤其不能先读取全部用户记忆再仅靠模型自行判断权限。</p>
<h2>六、TypeScript：实现一个最小检索器</h2>
<pre v-pre><code>type Memory = {
  id: string;
  userId: string;
  projectId?: string;
  content: string;
  updatedAt: number;
  deleted?: boolean;
};

function retrieve(
  records: Memory[],
  userId: string,
  query: string,
  projectId?: string
) {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  return records
    .filter(m => m.userId === userId && !m.deleted)
    .filter(m => !m.projectId || m.projectId === projectId)
    .map(m => ({
      record: m,
      score: terms.filter(t =>
        m.content.toLowerCase().includes(t)
      ).length
    }))
    .filter(x => x.score > 0)
    .sort((a,b) => b.score - a.score ||
      b.record.updatedAt - a.record.updatedAt)
    .slice(0,5)
    .map(x => x.record);
}</code></pre>
<p>这是教学用的内存检索器。生产环境必须在数据库查询层进行用户隔离，并使用真正的全文检索或向量索引。</p>
<h2>七、记忆注入如何避免与当前指令冲突？</h2>
<p>历史偏好是辅助上下文。如果用户以前说“代码优先 TypeScript”，这次明确要求 Python，应优先满足本次请求。</p>
<pre v-pre><code>const memoryContext = [
  "以下为可能相关的历史偏好，仅供参考。",
  "如果与当前用户明确要求冲突，以当前要求为准。",
  "偏好：代码示例通常优先 TypeScript。"
].join("\n");</code></pre>
<p>注意：权限、安全和敏感操作仍必须由可信后端控制，不能仅依赖 Prompt。</p>
<h2>八、记忆更新与遗忘</h2>
<table><thead><tr><th>事件</th><th>建议处理</th></tr></thead><tbody>
<tr><td>用户更改偏好</td><td>新记录生效，旧记录标记失效</td></tr>
<tr><td>临时任务完成</td><td>过期或归档</td></tr>
<tr><td>用户要求删除</td><td>存储、索引和缓存按策略处理</td></tr>
<tr><td>事实来源不明</td><td>不保存或降低可信度</td></tr></tbody></table>
<p>删除不能只是往 Prompt 里写“忘记这件事”，必须处理可信存储中的数据及相关索引。</p>
<h2>九、如何评估记忆系统？</h2>
<p>建议监控：相关记忆召回率、错误记忆注入率、过期记忆命中率、跨用户数据泄漏率、纠错成功率、Token 成本和响应延迟。对于敏感数据应最小化收集并明确保留期限。</p>
<h2>十、本篇总结</h2>
<p><strong>短期记忆负责当前上下文，长期记忆负责持久化和检索，KV Cache 负责推理加速。真正好的记忆系统不是存得越多越好，而是安全地在正确时机取出相关信息，并允许用户更正和删除。</strong></p>
<h2>十一、交互式课后测验</h2>
<div class="visual"><div v-for="(q,i) in questions" :key="i" class="question"><strong>{{i+1}}. {{q.q}}</strong><label v-for="(o,j) in q.o" :key="j" class="option"><input type="radio" :name="'q10-'+i" :checked="answers[i]===j" @change="pick(i,j)"/>{{o}}</label><p v-if="submitted" class="feedback">{{answers[i]===q.a?'✓ 回答正确':'正确答案：'+q.o[q.a]}}。{{q.e}}</p></div><div class="actions"><button :disabled="questions.some((_,i)=>answers[i]===undefined)" @click="submitted=true">提交评分</button><button @click="answers=[];submitted=false">重新作答</button></div><div v-if="submitted" class="score">得分 {{score}} / {{questions.length}}</div></div>
<h2>十二、学习疑问与解答</h2>
<h3>Q1：模型会因为聊天次数增加而自动训练自己吗？</h3><p>普通聊天推理不会直接修改模型权重。应用可以保存和检索记忆，但这不是训练。</p>
<h3>Q2：是否需要保存每一句对话？</h3><p>不需要。应根据价值、隐私、用户意愿和保留期限选择保存内容。</p>
<h3>Q3：记忆是否应该永远覆盖当前指令？</h3><p>不应该。相关历史偏好通常应让位于用户当前明确要求，同时仍要遵守更高优先级的安全约束。</p>
<h3>Q4：为什么长期记忆需要权限过滤？</h3><p>避免跨用户、跨租户或跨项目泄露数据。权限应在可信检索层实施。</p>
<footer><a href="./09-conversation-memory">← 第 09 篇</a><a href="./">返回课程目录</a></footer>
</article></template>
<style scoped>
.lesson{font-size:15px;line-height:1.85;color:var(--vp-c-text-1);overflow-wrap:anywhere}.meta{font-size:12px;color:var(--vp-c-text-2)}h1{font-size:30px;line-height:1.4;margin:18px 0 24px}h2{font-size:23px;margin:36px 0 18px;border-top:1px solid var(--vp-c-divider);padding-top:12px}h3{font-size:18px;margin:20px 0 10px}p{margin:14px 0}.visual{border:1px solid var(--vp-c-divider);border-radius:14px;padding:18px;margin:20px 0}.visual>strong{display:block;margin-bottom:12px}.step{background:var(--vp-c-bg-soft);border-radius:9px;padding:12px;text-align:center}.arrow{text-align:center;padding:7px;color:var(--vp-c-text-2)}table{display:table;width:100%;font-size:14px}td,th{padding:9px}pre{background:var(--vp-code-block-bg);border-radius:10px;padding:18px;overflow:auto}pre code{white-space:pre;color:var(--vp-c-text-1);font-size:13px}label{display:block;margin:10px 0}input[type=range]{display:block;width:100%;accent-color:var(--vp-c-brand-1)}.bar{height:14px;background:var(--vp-c-bg-soft);border-radius:9px;overflow:hidden}.bar>div{height:100%}.score{text-align:center;font-size:21px;font-weight:bold;margin:15px}.question{border-bottom:1px solid var(--vp-c-divider);padding:14px 0}.option{border:1px solid var(--vp-c-divider);border-radius:8px;padding:9px;cursor:pointer}.option input{margin-right:8px}.feedback{background:var(--vp-c-bg-soft);padding:10px;border-radius:8px}.actions{display:flex;gap:10px;margin-top:15px}.actions button{background:var(--vp-c-bg-soft);border:1px solid var(--vp-c-divider);border-radius:8px;padding:9px 14px;cursor:pointer}.actions button:disabled{opacity:.4}footer{display:flex;justify-content:space-between;border-top:1px solid var(--vp-c-divider);padding-top:16px;margin-top:30px}@media(max-width:600px){h1{font-size:24px}h2{font-size:20px}.visual{padding:12px}}
</style>