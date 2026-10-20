<script setup lang="ts">
import { computed } from 'vue'
import { useData } from 'vitepress'

const { page, frontmatter } = useData()
const stages = [
  { end: 7, label: '第一阶段：AI 与大模型基础' },
  { end: 13, label: '第二阶段：聊天机器人核心原理' },
  { end: 20, label: '第三阶段：工程开发' },
  { end: 27, label: '第四阶段：RAG' },
  { end: 33, label: '第五阶段：Agent' },
  { end: 40, label: '第六阶段：生产实践' },
]
const total = stages[stages.length - 1].end
const lesson = computed(() => {
  const match = page.value.relativePath.match(/^guide\/ai\/chatbot-course\/(\d+)-[^/]+\.md$/)
  if (!match) return null

  const number = Number(match[1])
  const stage = stages.find(stage => number <= stage.end)
  if (number < 1 || !stage) return null

  return { number: String(number).padStart(2, '0'), stage: stage.label }
})
</script>

<template>
  <div v-if="lesson && frontmatter.courseMeta !== false" class="course-lesson-meta" role="group" aria-label="教程信息">
    <span class="course-lesson-meta__progress">第 {{ lesson.number }} / {{ total }} 篇</span>
    <span>{{ lesson.stage }}</span>
    <span v-if="frontmatter.readingTime">阅读约 {{ frontmatter.readingTime }} 分钟</span>
  </div>
</template>

<style scoped>
.course-lesson-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
  color: var(--vp-c-text-2);
  font-size: 12px;
  line-height: 1.8;
}

.course-lesson-meta > span {
  white-space: nowrap;
}

.course-lesson-meta__progress {
  padding: 4px 10px;
  border-radius: 30px;
  background: rgba(22, 163, 74, 0.12);
  color: var(--vp-c-green-1, #137e50);
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

</style>
