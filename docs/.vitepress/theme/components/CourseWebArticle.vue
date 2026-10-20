<script setup lang="ts">
import { computed, ref } from 'vue'
import 'katex/dist/katex.min.css'

type Question = { answer: number; explanation: string }
const props = defineProps<{ source: string; chapter: number; questions?: Question[] }>()
const article = ref<HTMLElement | null>(null)
const copyStatus = ref('')
const needsQuizActions = computed(() => props.questions?.length && !props.source.includes('data-web-action="submit-quiz"'))
const needsResetButton = computed(() => props.questions?.length && !needsQuizActions.value && !props.source.includes('data-web-action="reset-quiz"'))

function output(root: Element, name: string, value: string) {
  root.querySelectorAll<HTMLElement>(`[data-web-output="${name}"]`).forEach(node => { node.textContent = value })
}

function refreshLab(lab: HTMLElement) {
  const ranges = Array.from(lab.querySelectorAll<HTMLInputElement>('input[type="range"]'))
  const values = ranges.map(input => Number(input.value))
  for (const input of ranges) {
    const part = input.closest('[data-web-part]') ?? lab
    const label = part.querySelector<HTMLElement>(`[data-web-range-label="${input.dataset.webRange}"]`)
    if (label) {
      const decimals = label.dataset.webFormat?.includes('Tokens/s') ? 0 : (input.step === '0.01' ? 2 : 0)
      const value = Number(input.value).toLocaleString('en-US', { maximumFractionDigits: decimals })
      label.textContent = (label.dataset.webFormat ?? '{value}').replace('{value}', value)
    }
  }
  switch (lab.dataset.webLab) {
    case 'cosine': {
      const [ax, ay, bx, by] = values
      const magnitude = Math.hypot(ax, ay) * Math.hypot(bx, by)
      const similarity = magnitude ? (ax * bx + ay * by) / magnitude : NaN
      output(lab, 'cosine', Number.isFinite(similarity) ? similarity.toFixed(3) : '未定义')
      output(lab, 'cosine-description', !magnitude ? '零向量没有定义余弦相似度' : similarity > 0.8 ? '两个向量方向非常接近' : similarity < -0.8 ? '两个向量方向接近相反' : '两个向量方向存在差异')
      break
    }
    case 'cost': {
      const cost = (values[0] + values[1] * 4) * values[2] / 1_000_000
      output(lab, 'cost', cost.toFixed(2))
      output(lab, 'cost-full', '$' + cost.toFixed(2))
      break
    }
    case 'loss': {
      const probability = values[0] / 100
      output(lab, 'loss', (-Math.log(probability)).toFixed(3))
      output(lab, 'loss-description', probability < 0.5 ? '正确答案概率较低，损失较高' : '正确答案概率较高，损失较低')
      break
    }
    case 'temperature': {
      const logits = [2.5, 1.8, 0.9, 0.1]
      const weights = logits.map(logit => Math.exp((logit - 2.5) / values[0]))
      const sum = weights.reduce((a, b) => a + b, 0)
      weights.forEach((weight, i) => {
        output(lab, `probability-${i}`, (weight / sum * 100).toFixed(1) + '%')
        const bar = lab.querySelector<HTMLElement>(`[data-web-bar="${i}"]`)
        if (bar) bar.style.width = weight / sum * 100 + '%'
      })
      output(lab, 'temperature-description', values[0] < 0.7 ? '低温度：概率更集中' : values[0] > 1.3 ? '高温度：输出更多样' : '中等温度：兼顾集中与多样性')
      break
    }
    case 'attention': {
      const maximum = Math.max(...values)
      const weights = values.map(value => Math.exp(value - maximum))
      const sum = weights.reduce((a, b) => a + b, 0)
      weights.forEach((value, i) => output(lab, `attention-${i}`, (value / sum * 100).toFixed(1) + '%'))
      const winner = ['电脑', '小明', '速度'][values.indexOf(maximum)]
      output(lab, 'attention-description', `当前「${winner}」获得最高的注意力权重。`)
      break
    }
    case 'top-p': {
      let cumulative = 0
      ;[0.5, 0.3, 0.15, 0.05].forEach((probability, i) => {
        const retained = cumulative < values[0] - 1e-9
        cumulative += probability
        output(lab, `top-p-${i}`, retained ? '保留' : '排除')
      })
      break
    }
    case 'latency':
      output(lab, 'ttft', values[0].toFixed(1) + 's')
      output(lab, 'latency', (values[0] + (values[2] - 1) / values[1]).toFixed(1) + 's')
      break
    case 'budget': {
      const total = 5 + values.reduce((a, b) => a + b, 0)
      output(lab, 'budget', total + 'K / 128K')
      output(lab, 'budget-description', total <= 128 ? `剩余 ${128 - total}K Tokens` : `超出 ${total - 128}K Tokens`)
      lab.dataset.overBudget = String(total > 128)
      break
    }
    case 'messages': {
      const fields = Array.from(lab.querySelectorAll<HTMLTextAreaElement>('textarea')).map(input => input.value)
      output(lab, 'messages-json', JSON.stringify([
        { role: 'system', content: fields[0] },
        { role: 'user', content: fields[1] + '。' + fields[2] }
      ], null, 2))
      break
    }
    case 'history-growth': {
      const total = values[0] * (values[1] + values[2])
      output(lab, 'history-total', total.toLocaleString('en-US'))
      output(lab, 'history-budget', `占示例 128K 上下文窗口的 ${(total / 128_000 * 100).toFixed(1)}%`)
      break
    }
    case 'sliding-window': {
      lab.querySelectorAll<HTMLElement>('[data-web-window-row]').forEach((row, i, rows) => {
        const retained = i >= rows.length - values[0]
        row.dataset.webRetained = String(retained)
        output(row, `window-${i}`, retained ? '保留' : '裁剪')
      })
      break
    }
    case 'memory-retrieval': {
      const query = Number(lab.querySelector<HTMLInputElement>('input:checked')?.value ?? 0)
      const matched = [[1, 2], [0], [3]][query] ?? []
      lab.querySelectorAll<HTMLElement>('[data-web-memory-row]').forEach((row, i) => {
        const active = matched.includes(i)
        row.dataset.webMatched = String(active)
        const icon = row.querySelector<SVGElement>('[data-web-memory-icon]')
        if (icon) {
          icon.setAttribute('viewBox', active ? '0 0 24 24' : '0 0 6 6')
          icon.innerHTML = active
            ? '<path fill="currentColor" d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm4.8 6.6-6 8a1 1 0 0 1-1.5.1l-3-3 1.4-1.4 2.2 2.2 5.3-7.1Z"/>'
            : '<rect width="6" height="6" rx="3" fill="currentColor"/>'
        }
      })
      break
    }
  }
}

function clearQuiz() {
  article.value?.querySelectorAll('[data-web-feedback], [data-web-score]').forEach(node => node.remove())
}

function resetQuiz() {
  article.value?.querySelectorAll<HTMLInputElement>('input[type="radio"]').forEach(input => { input.checked = false })
  clearQuiz()
}

function handleInput(event: Event) {
  const target = event.target as HTMLElement
  if (target instanceof HTMLInputElement && target.type === 'radio' && target.closest('[data-web-question]')) {
    clearQuiz()
    return
  }
  const lab = target.closest<HTMLElement>('[data-web-lab]')
  if (lab) refreshLab(lab)
}

async function copy(text: string) {
  try {
    await navigator.clipboard.writeText(text)
    copyStatus.value = '已复制'
  } catch {
    copyStatus.value = '复制失败，请手动选择内容'
  }
}

function submitQuiz() {
  if (!article.value) return
  const groups = Array.from(article.value.querySelectorAll<HTMLElement>('[data-web-question]'))
  if (groups.some(group => !group.querySelector('input:checked'))) {
    copyStatus.value = '请先完成全部题目'
    return
  }
  clearQuiz()
  let score = 0
  groups.forEach((group, i) => {
    const question = props.questions?.[i]
    if (!question) return
    const selected = Number(group.querySelector<HTMLInputElement>('input:checked')!.value)
    const correct = selected === question.answer
    if (correct) score++
    const choices = Array.from(group.querySelectorAll('label'))
    const feedback = document.createElement('div')
    feedback.dataset.webFeedback = ''
    feedback.className = 'web-quiz-feedback'
    const title = document.createElement('strong')
    title.textContent = correct ? '✓ 回答正确' : '正确答案：' + (choices[question.answer]?.textContent ?? '')
    const explanation = document.createElement('p')
    explanation.textContent = question.explanation
    feedback.append(title, explanation)
    group.after(feedback)
  })
  const result = document.createElement('div')
  result.dataset.webScore = ''
  result.className = 'web-quiz-score'
  result.setAttribute('role', 'status')
  result.textContent = `得分：${score} / ${groups.length}`
  groups[groups.length - 1]?.parentElement?.after(result)
}

async function handleClick(event: MouseEvent) {
  const button = (event.target as HTMLElement).closest<HTMLElement>('button')
  if (!button) return
  const action = button.dataset.webAction
  const codeBlock = button.closest<HTMLElement>('[data-web-code]')
  const lab = button.closest<HTMLElement>('[data-web-lab]')
  if (button.dataset.webHref) window.location.assign(button.dataset.webHref)
  if (action === 'copy-code') await copy(codeBlock?.querySelector('code')?.textContent ?? '')
  if (action === 'wrap-code' && codeBlock) {
    const wrapped = codeBlock.dataset.wrapped !== 'true'
    codeBlock.dataset.wrapped = String(wrapped)
    button.setAttribute('aria-pressed', String(wrapped))
    button.setAttribute('aria-label', wrapped ? '禁用自动换行' : '启用自动换行')
  }
  if (action === 'copy-json' && lab) await copy(lab.querySelector('[data-web-output="messages-json"]')?.textContent ?? '')
  if (action === 'reset-lab' && lab) {
    lab.querySelectorAll<HTMLInputElement>('input[type="range"]').forEach(input => { input.value = input.dataset.webInitial ?? input.defaultValue })
    refreshLab(lab)
  }
  if (action === 'submit-quiz') submitQuiz()
  if (action === 'reset-quiz') {
    resetQuiz()
  }
  if ((action === 'next-token' || action === 'reset-tokens') && lab) {
    const tokens = ['JavaScript', ' ', '是', '一', '种', '编程', '语言', '，', '可以', '开发', '应用。']
    const count = action === 'reset-tokens' ? 0 : Math.min(tokens.length, Number(lab.dataset.tokenCount ?? 0) + 1)
    lab.dataset.tokenCount = String(count)
    output(lab, 'tokens', count ? tokens.slice(0, count).join('') : '尚未生成 Token')
    output(lab, 'tokens-progress', `已生成 ${count} / ${tokens.length} 个示意 Token`)
  }
}
</script>

<template>
  <div class="web-course-wrapper">
    <div ref="article" class="web-course-source" :data-chapter="chapter" v-html="source" @input="handleInput" @change="handleInput" @click="handleClick" />
    <div class="web-copy-status" role="status">{{ copyStatus }}</div>
    <div v-if="needsQuizActions" class="web-extra-quiz-actions">
      <button type="button" @click="submitQuiz">提交评分</button>
      <button type="button" @click="resetQuiz">重新作答</button>
    </div>
    <div v-else-if="needsResetButton" class="web-extra-quiz-actions"><button type="button" @click="resetQuiz">重新作答</button></div>
  </div>
</template>

<style>
.web-course-source { min-width: 0; color: var(--vp-c-text-1); font-size: 16px; line-height: 26px; overflow-wrap: anywhere; }
.web-course-source *, .web-course-source *::before, .web-course-source *::after { box-sizing: border-box; }
.web-course-source [data-web-part] { min-width: 0; }
.web-course-source [data-web-part] + [data-web-part] { margin-top: 28px; }
.web-course-source [data-d-component="divider"] { height: 1px !important; min-height: 1px !important; padding: 0 !important; }
.web-course-source svg { max-width: 100%; }
.web-course-source button { cursor: pointer; }
.web-course-source button:focus-visible, .web-course-source input:focus-visible, .web-course-source textarea:focus-visible { outline: 2px solid var(--vp-c-brand-1); outline-offset: 3px; }
.web-course-source [data-web-code][data-wrapped="true"] [data-code-block-source],
.web-course-source [data-web-code][data-wrapped="true"] code,
.web-course-source [data-web-code][data-wrapped="true"] code * { white-space: pre-wrap !important; overflow-wrap: anywhere !important; }
.web-course-source [data-web-code] [data-code-block-source] { max-width: 100%; overflow-x: auto; }
.web-course-source [data-web-lab="messages"] textarea { width: 100%; min-width: 0; resize: vertical; }
.web-course-source [data-web-output="messages-json"] { white-space: pre-wrap; }
.web-course-source [data-over-budget="true"] [data-web-output="budget-description"] { color: var(--vp-c-red-1) !important; }
.web-course-source [data-web-window-row][data-web-retained="true"] { border-color: rgba(22, 163, 74, .45) !important; background-color: rgba(22, 163, 74, .07) !important; }
.web-course-source [data-web-window-row][data-web-retained="false"] { border-color: var(--vp-c-divider) !important; background-color: var(--vp-c-bg-soft) !important; }
.web-course-source [data-web-window-row][data-web-retained="true"] [data-web-output] { color: #16a34a !important; }
.web-course-source [data-web-window-row][data-web-retained="false"] [data-web-output] { color: var(--vp-c-text-2) !important; }
.web-course-source [data-web-memory-row][data-web-matched="true"] p { color: var(--vp-c-text-1) !important; }
.web-course-source [data-web-memory-row][data-web-matched="false"] p { color: var(--vp-c-text-2) !important; }
.web-course-source [data-web-memory-row][data-web-matched="true"] svg { color: #16a34a !important; }
.web-course-source [data-web-memory-row][data-web-matched="false"] svg { color: var(--vp-c-text-3) !important; }
.dark .web-course-source[data-chapter="9"] [data-d-component="badge"] { color: #5cdb9b !important; }
.web-course-source .web-quiz-feedback { margin: 12px 0; padding: 12px; border: 1px solid var(--vp-c-divider); border-radius: 12px; background: var(--vp-c-bg-soft); }
.web-course-source .web-quiz-feedback p { margin: 4px 0 0; }
.web-course-source .web-quiz-score { margin: 16px 0; padding: 16px; border-radius: 12px; background: var(--vp-c-bg-soft); text-align: center; font-size: 20px; font-weight: 600; }
.web-copy-status { min-height: 0; margin-top: 8px; font-size: 13px; color: var(--vp-c-text-2); }
.web-extra-quiz-actions { display: flex; flex-wrap: wrap; gap: 12px; margin: 16px 0; }
.web-extra-quiz-actions button { padding: 8px 16px; border: 1px solid var(--vp-c-divider); border-radius: 20px; background: var(--vp-c-bg-soft); cursor: pointer; }
.web-course-qa { margin-top: 32px; }
@media (max-width: 600px) {
  .web-course-source [data-d-component="grid"] { grid-template-columns: minmax(0, 1fr) !important; }
  .web-course-source [data-d-component="table"] { display: block !important; max-width: 100%; overflow-x: auto; }
  .web-course-source [data-d-component="row"] { max-width: 100%; }
}
</style>
