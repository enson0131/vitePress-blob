<script setup lang="ts">
import { computed, ref } from 'vue'
import part1 from './memory10/source-1.html?raw'
import part2 from './memory10/source-2.html?raw'
import part3 from './memory10/source-3.html?raw'
import './memory10/source.css'

// Only this reviewed, sanitized, repository-owned HTML is rendered. Never pass
// user input, retrieved content or the full ChatGPT export to v-html.
// The export's 124 ordered content blocks are the single source of truth.
const articleHtml = (part1 + part2 + part3).replace(
  /<(h[123]) data-source-block="(\d+)"/g,
  '<$1 id="lesson10-block-$2" data-source-block="$2"'
)
const copyStatus = ref('')
async function handleSourceAction(event: MouseEvent) {
  const target = event.target
  if (!(target instanceof Element)) return
  const button = target.closest<HTMLButtonElement>('button[data-action]')
  const block = button?.closest<HTMLElement>('.codeblock')
  if (!button || !block) return
  if (button.dataset.action === 'wrap') {
    const enabled = block.classList.toggle('wrap')
    button.setAttribute('aria-pressed', String(enabled))
    button.setAttribute('aria-label', enabled ? '关闭自动换行' : '启用自动换行')
    return
  }
  if (button.dataset.action === 'copy') {
    const text = block.querySelector('pre code')?.textContent ?? ''
    try {
      await navigator.clipboard.writeText(text)
      copyStatus.value = '代码已完整复制'
      button.setAttribute('aria-label', '已复制代码')
    } catch {
      copyStatus.value = '浏览器未授权剪贴板，请选中代码手动复制。'
    }
  }
}

// Keep the original GitHub exercises separately. They are not part of the
// uploaded reply and must not replace or interrupt its text or examples.
const budget = ref(12000), history = ref(4000), summary = ref(1200)
const memory = ref(1800), output = ref(3000)
const used = computed(() => history.value + summary.value + memory.value + output.value + 1200)
const answers = ref<number[]>([]), submitted = ref(false)
const questions = [
  { q: '聊天记录保存到数据库，模型是否自动拥有长期记忆？', o: ['是', '否，需要应用检索并注入', '只有 Python 才可以'], a: 1, e: '存储不等于模型权重更新；需要应用按需检索。' },
  { q: '摘要压缩最大的风险是什么？', o: ['一定更准确', '遗漏关键事实', '永久修改权重'], a: 1, e: '摘要有损，应保留来源与关键结构化事实。' },
  { q: 'KV Cache 与长期记忆的关系是？', o: ['相同', '前者是推理缓存，后者是应用数据', '都永久存储'], a: 1, e: '二者作用层次、生命周期不同。' },
  { q: '用户要求删除记忆时应怎么做？', o: ['仅提示模型忘记', '在存储和索引层执行删除或失效', '只隐藏 UI'], a: 1, e: '需要可信后端执行，按策略处理缓存和备份。' }
]
const score = computed(() => questions.filter((q, i) => answers.value[i] === q.a).length)
function pick(i: number, j: number) {
  const next = [...answers.value]
  next[i] = j
  answers.value = next
  submitted.value = false
}
function resetQuiz() { answers.value = []; submitted.value = false }
</script>

<template>
  <article class="memory-lesson-restored" lang="zh-CN">
    <div class="lesson10-original" @click="handleSourceAction" v-html="articleHtml"></div>
    <p class="source-provenance">原文还原基准：用户上传的 10.htm 与 10_files.zip。上面的「GitHub 发布状态」保留的是原页保存时的文字和链接，不是实时状态。以下交互为原 GitHub 功能的独立保留区，不替代正文。</p>
    <details class="lesson10-extras">
      <summary>展开配套交互练习：上下文预算实验与 4 道选择题</summary>
      <section class="exercise" aria-labelledby="lesson10-budget-title">
        <h2 id="lesson10-budget-title">交互实验：上下文预算分配</h2>
        <label>总预算：{{ budget }} Tokens<input v-model.number="budget" name="l10-budget" type="range" min="4000" max="24000" step="1000"></label>
        <label>最近消息：{{ history }} Tokens<input v-model.number="history" name="l10-history" type="range" min="0" max="12000" step="500"></label>
        <label>历史摘要：{{ summary }} Tokens<input v-model.number="summary" name="l10-summary" type="range" min="0" max="6000" step="200"></label>
        <label>检索记忆：{{ memory }} Tokens<input v-model.number="memory" name="l10-memory" type="range" min="0" max="6000" step="200"></label>
        <label>输出预留：{{ output }} Tokens<input v-model.number="output" name="l10-output" type="range" min="500" max="6000" step="500"></label>
        <div class="budget-total" aria-live="polite">已规划 {{ used }} / {{ budget }} Tokens</div>
        <div class="budget-bar"><div :style="{width: Math.min(100, used / budget * 100) + '%', background: used > budget ? '#dc2626' : '#16a34a'}"></div></div>
        <p class="budget-feedback">{{ used > budget ? '超出预算，请减少历史或检索内容' : '剩余 ' + (budget - used) + ' Tokens' }}</p>
        <small>另固定预留 1200 Tokens 系统提示与格式开销；教学示例。</small>
      </section>
      <section class="exercise" aria-labelledby="lesson10-quiz-title">
        <h2 id="lesson10-quiz-title">交互式课后测验</h2>
        <fieldset v-for="(q, i) in questions" :key="i" class="quiz-question">
          <legend>{{ i + 1 }}. {{ q.q }}</legend>
          <label v-for="(option, j) in q.o" :key="j" class="quiz-option"><input type="radio" :name="'q10-' + i" :checked="answers[i] === j" @change="pick(i, j)">{{ option }}</label>
          <p v-if="submitted" class="quiz-feedback">{{ answers[i] === q.a ? '✓ 回答正确' : '正确答案：' + q.o[q.a] }}。{{ q.e }}</p>
        </fieldset>
        <div class="quiz-actions"><button type="button" :disabled="questions.some((_, i) => answers[i] === undefined)" @click="submitted = true">提交评分</button><button type="button" @click="resetQuiz">重新作答</button></div>
        <div v-if="submitted" class="quiz-score" aria-live="polite">得分 {{ score }} / {{ questions.length }}</div>
      </section>
    </details>
    <p class="copy-status" role="status" aria-live="polite">{{ copyStatus }}</p>
    <footer><a href="./09-conversation-memory">← 第 09 篇</a><a href="./">返回课程目录</a></footer>
  </article>
</template>

<style scoped>
.memory-lesson-restored{min-width:0;max-width:100%}
.source-provenance{margin-top:32px;padding:12px 16px;border-left:3px solid var(--vp-c-divider);font-size:12px;line-height:1.7;color:var(--vp-c-text-2)}
.lesson10-extras{margin:20px 0;border:1px solid var(--vp-c-divider);border-radius:14px;padding:16px}
.lesson10-extras>summary{cursor:pointer;font-weight:600;line-height:1.7}
.exercise{margin:20px 0;padding:16px;border:1px solid var(--vp-c-divider);border-radius:12px}
.exercise h2{font-size:20px;border:0;margin:0 0 16px;padding:0;line-height:1.5}
.exercise label{display:block;margin:12px 0}
.exercise input[type=range]{display:block;width:100%;accent-color:var(--vp-c-brand-1)}
.budget-total,.quiz-score{text-align:center;font-weight:600;margin:16px 0;font-size:20px}
.budget-bar{height:14px;border-radius:9px;background:var(--vp-c-bg-soft);overflow:hidden}.budget-bar>div{height:100%}
.quiz-question{border:0;border-bottom:1px solid var(--vp-c-divider);padding:18px 0;margin:0;min-width:0}
.quiz-question legend{font-weight:600;line-height:1.7}
.quiz-option{padding:10px;border:1px solid var(--vp-c-divider);border-radius:8px;cursor:pointer;line-height:1.7}.quiz-option input{margin-right:8px}
.quiz-feedback{padding:12px;background:var(--vp-c-bg-soft);border-radius:8px;line-height:1.7}
.quiz-actions{display:flex;gap:12px;margin-top:16px}.quiz-actions button{padding:9px 14px;border:1px solid var(--vp-c-divider);border-radius:8px;cursor:pointer}.quiz-actions button:disabled{opacity:.4;cursor:not-allowed}
.copy-status{font-size:12px;color:var(--vp-c-text-2);margin:0}.copy-status:empty{display:none}
footer{display:flex;justify-content:space-between;gap:16px;border-top:1px solid var(--vp-c-divider);padding-top:16px;margin-top:28px;font-size:14px}
@media(max-width:600px){.exercise{padding:12px}.lesson10-extras{padding:12px}}
</style>
