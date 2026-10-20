<script setup lang="ts">
import { onMounted, ref } from 'vue'
import articleHtml from './fullstack01/article.html?raw'
import manifest from './fullstack01/manifest.json'
import './fullstack01/article.css'

// This is checked-in lesson content, not HTML fetched from an external source.
// Keep the entire article in SSR output; Vue only wires the local exercises.
const article = ref<HTMLElement | null>(null)

type Question = {
  id: number
  title: string
  options: { key: string; text: string }[]
  correct: string
  explanation: string
}

type Scenario = {
  results: [string, string, string, string]
  focus: 'frontend' | 'service' | 'database' | 'notification'
  detail: string
}

const questions = manifest.questions as Question[]
const scenarios: Record<string, Scenario> = {
  normal: {
    results: ['已提交', '校验通过', '工单与审计已提交', '本课尚未接入'],
    focus: 'database',
    detail: '模拟结果：数据库提交后创建成立；通知属于后续工作。'
  },
  invalid: {
    results: ['被绕过', '拒绝：标题为空', '未写入', '未触发'],
    focus: 'service',
    detail: '模拟结果：服务端拦截无效输入；前端校验可被绕过。'
  },
  tenant: {
    results: ['提交了越权请求', '拒绝：无目标项目权限', '未写入', '未触发'],
    focus: 'service',
    detail: '模拟结果：身份有效仍须验证目标租户与项目的操作权限。'
  },
  duplicate: {
    results: ['两个请求同时到达', '均通过格式与权限检查', '1 次成功 · 1 次唯一冲突', '后续仅成功项触发'],
    focus: 'database',
    detail: '模拟结果：唯一约束守住业务编号；重试复用结果仍需幂等协议。'
  },
  email: {
    results: ['收到创建成功', '业务操作已完成', '工单与审计已提交', '发送失败 · 待重试'],
    focus: 'notification',
    detail: '后续方案模拟：邮件失败不撤销已提交工单；可靠重试需 Outbox 等机制。'
  }
}

let hasSubmitted = false

function updateScenario(value: string) {
  const root = article.value
  const scenario = scenarios[value]
  if (!root || !scenario) return

  root.querySelectorAll<HTMLElement>('#fs-boundaries [data-layer]').forEach((row, index) => {
    const result = row.querySelector<HTMLElement>('.fs-result')
    if (result) result.textContent = scenario.results[index] ?? ''
    row.classList.toggle('fs-focus', row.dataset.layer === scenario.focus)
  })

  const detail = root.querySelector<HTMLElement>('#fs-detail')
  if (detail) detail.textContent = scenario.detail
}

function handleChange(event: Event) {
  const target = event.target
  if (target instanceof HTMLSelectElement && target.id === 'fs-scenario') {
    updateScenario(target.value)
    return
  }

  if (hasSubmitted && target instanceof HTMLInputElement && target.type === 'radio' && target.closest('#course-quiz')) {
    const root = article.value
    const score = root?.querySelector<HTMLElement>('#quiz-score')
    if (score) score.textContent = '答案已修改，请重新提交评分'
    root?.querySelectorAll<HTMLElement>('.quiz-verdict').forEach(verdict => { verdict.textContent = '' })
    root?.querySelectorAll<HTMLElement>('[data-quiz-result]').forEach(feedback => { delete feedback.dataset.quizResult })
    hasSubmitted = false
  }
}

function handleSubmit(event: Event) {
  const form = event.target
  if (!(form instanceof HTMLFormElement) || form.id !== 'course-quiz') return
  event.preventDefault()

  const root = article.value
  if (!root) return

  let correctCount = 0
  let answeredCount = 0

  for (const question of questions) {
    const selected = form.querySelector<HTMLInputElement>('input[name="q' + question.id + '"]:checked')
    const correct = selected?.value === question.correct
    if (selected) answeredCount++
    if (correct) correctCount++

    const feedback = root.querySelector<HTMLElement>('#feedback-' + question.id)
    if (!feedback) continue

    feedback.hidden = false
    feedback.dataset.quizResult = !selected ? 'unanswered' : correct ? 'correct' : 'incorrect'
    const details = feedback instanceof HTMLDetailsElement ? feedback : feedback.closest('details')
    if (details) details.open = true

    const verdict = feedback.querySelector<HTMLElement>('.quiz-verdict')
    if (verdict) verdict.textContent = !selected ? '未作答' : correct ? '回答正确' : '本题需要回看'
  }

  const score = root.querySelector<HTMLElement>('#quiz-score')
  if (score) score.textContent = '得分 ' + correctCount + ' / ' + questions.length + ' · 已作答 ' + answeredCount + ' / ' + questions.length
  hasSubmitted = true
}

onMounted(() => {
  const select = article.value?.querySelector<HTMLSelectElement>('#fs-scenario')
  if (select) updateScenario(select.value)
})
</script>

<template>
  <article
    id="fullstack-article"
    ref="article"
    class="fullstack-lesson"
    aria-label="前端转全栈：系列总纲与第 01 篇"
    @change="handleChange"
    @submit="handleSubmit"
    v-html="articleHtml"
  />
</template>
