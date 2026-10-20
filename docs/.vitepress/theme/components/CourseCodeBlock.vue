<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'

defineProps<{ codeHtml: string; language: string }>()
const codeElement = ref<HTMLElement | null>(null)
const wrapped = ref(false)
const copyStatus = ref('')
let resetTimer: ReturnType<typeof setTimeout> | undefined

async function copyCode() {
  try {
    await navigator.clipboard.writeText(codeElement.value?.textContent ?? '')
    copyStatus.value = '已复制'
  } catch {
    copyStatus.value = '复制失败，请手动选择代码'
  }
  clearTimeout(resetTimer)
  resetTimer = setTimeout(() => { copyStatus.value = '' }, 2000)
}

onBeforeUnmount(() => clearTimeout(resetTimer))
</script>

<template>
  <div class="course-code-block" :class="{ wrapped }">
    <div class="code-toolbar">
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="m7 5-5 5 5 5m6-10 5 5-5 5m-2-13-2 16" /></svg>
      <span class="language">{{ language }}</span>
      <span class="copy-status" role="status">{{ copyStatus }}</span>
      <button type="button" :aria-label="wrapped ? '禁用自动换行' : '启用自动换行'" :aria-pressed="wrapped" :title="wrapped ? '禁用自动换行' : '启用自动换行'" @click="wrapped = !wrapped">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M3 5h14M3 10h11a3 3 0 0 1 0 6h-4m2-2-2 2 2 2M3 15h3" /></svg>
      </button>
      <button type="button" aria-label="复制代码" title="复制代码" @click="copyCode">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="6" y="6" width="11" height="11" rx="2"/><path d="M13 6V4a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h2" /></svg>
      </button>
    </div>
    <pre tabindex="0"><code ref="codeElement" v-html="codeHtml" /></pre>
  </div>
</template>

<style scoped>
.course-code-block {
  min-width: 0;
  margin: 0 0 8px;
  overflow: hidden;
  border: 1px solid var(--vp-c-divider);
  border-radius: 24px;
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
}
.code-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 48px;
  padding: 6px 6px 6px 20px;
  font-size: 14px;
  line-height: 20px;
  font-weight: 500;
}
.language { flex: 1; }
.copy-status { font-size: 12px; }
.code-toolbar button {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  border: 0;
  border-radius: 50%;
  cursor: pointer;
  color: inherit;
}
.code-toolbar button:hover,
.code-toolbar button[aria-pressed="true"] { background: var(--vp-c-default-soft); }
.course-code-block pre {
  margin: 0;
  border: 0;
  border-radius: 0;
  padding: 0 20px 12px;
  overflow-x: auto;
  background: transparent;
  white-space: pre;
  line-height: 21px;
}
.course-code-block code {
  display: block;
  width: max-content;
  min-width: 100%;
  padding: 0;
  border-radius: 0;
  background: transparent;
  font-family: var(--vp-font-family-mono);
  font-size: 14px;
  line-height: 21px;
  color: inherit;
  white-space: inherit;
}
.wrapped pre { white-space: pre-wrap; overflow-wrap: anywhere; }
.wrapped code { width: auto; min-width: 0; }
.course-code-block :deep(.token-keyword) { color: var(--vp-c-purple-1); }
@media (max-width: 639px) {
  .code-toolbar { padding-left: 16px; }
  .course-code-block pre { padding-inline: 16px; }
}
</style>
