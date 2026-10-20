<script setup lang="ts">
import { computed } from 'vue'
import CourseCodeBlock from './CourseCodeBlock.vue'
import CourseSourceTable from './CourseSourceTable.vue'

// Only accepts the checked-in, audited lesson HTML, never external page HTML.
const props = defineProps<{ source: string }>()
type Segment = { type: 'html' | 'code' | 'table'; html: string; language?: string }
const segments = computed(() => {
  const result: Segment[] = []
  const blocks = /<pre><code(?: class="language-([^"]+)")?>([\s\S]*?)<\/code><\/pre>|<table>[\s\S]*?<\/table>/g
  let start = 0
  for (const match of props.source.matchAll(blocks)) {
    const index = match.index!
    if (index > start) result.push({ type: 'html', html: props.source.slice(start, index) })
    result.push(match[0].startsWith('<table>')
      ? { type: 'table', html: match[0] }
      : { type: 'code', html: match[2], language: match[1] === 'javascript' ? 'JavaScript' : '纯文本' })
    start = index + match[0].length
  }
  if (start < props.source.length) result.push({ type: 'html', html: props.source.slice(start) })
  return result
})
</script>

<template>
  <div class="course-source-article">
    <template v-for="(segment, index) in segments" :key="index">
      <CourseCodeBlock v-if="segment.type === 'code'" :code-html="segment.html" :language="segment.language || '纯文本'" />
      <CourseSourceTable v-else-if="segment.type === 'table'" :table-html="segment.html" />
      <div v-else class="source-fragment" v-html="segment.html" />
    </template>
  </div>
</template>

<style scoped>
.course-source-article {
  min-width: 0;
  color: var(--vp-c-text-1);
  font-size: 16px;
  line-height: 1.625;
  overflow-wrap: anywhere;
}
.source-fragment { display: contents; }
.course-source-article :deep(h1) { margin: 16px 0 8px; font-size: 24px; line-height: 32px; letter-spacing: normal; font-weight: 600; }
.course-source-article :deep(h2) { margin: 16px 0 4px; padding: 0; border: 0; font-size: 20px; line-height: 28px; letter-spacing: normal; font-weight: 600; }
.course-source-article :deep(h3) { margin: 16px 0 4px; font-size: 18px; line-height: 28px; letter-spacing: normal; font-weight: 600; }
.course-source-article :deep(p) { margin: 0 0 4px; font-size: 16px; line-height: 26px; }
.course-source-article :deep(strong) { font-weight: 600; }
.course-source-article :deep(blockquote) { margin: 0 0 8px; padding: 8px 0 8px 24px; border-left: 2px solid var(--vp-c-divider); color: inherit; }
.course-source-article :deep(blockquote p) { margin: 0; color: inherit; }
.course-source-article :deep(ul) { margin: 0; padding-left: 26px; list-style: disc; }
.course-source-article :deep(li) { margin: 0; padding-left: 6px; line-height: 26px; }
.course-source-article :deep(hr) { height: 0; margin: 28px 0; border: 0; border-top: 1px solid var(--vp-c-divider); }
.course-source-article :deep(hr + h2) { margin-top: 0; }
.course-source-article :deep(table) { display: table; width: 100%; margin: 0; border-collapse: separate; border-spacing: 0; font-size: 14px; line-height: 26px; }
.course-source-article :deep(tr) { border: 0; background: transparent; }
.course-source-article :deep(th),
.course-source-article :deep(td) { border: 0; padding: 10px 24px 10px 0; vertical-align: top; white-space: normal; text-align: left; }
.course-source-article :deep(th) { border-bottom: 1px solid var(--vp-c-divider); padding-block: 8px; line-height: 16px; font-weight: 600; }
.course-source-article :deep(tbody tr:not(:last-child) td) { border-bottom: 1px solid var(--vp-c-divider); }
.course-source-article :deep(tbody tr:last-child td) { padding-bottom: 24px; }
.course-source-article :deep([align="right"]) { text-align: right; }
</style>
