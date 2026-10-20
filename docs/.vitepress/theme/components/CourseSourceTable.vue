<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'

defineProps<{ tableHtml: string }>()
const tableElement = ref<HTMLElement | null>(null)
const expandedTable = ref<HTMLDialogElement | null>(null)
const copyStatus = ref('')
let resetTimer: ReturnType<typeof setTimeout> | undefined

function rows() {
  return Array.from(tableElement.value?.querySelectorAll('tr') ?? [], row =>
    Array.from(row.querySelectorAll('th, td'), cell => cell.textContent?.trim() ?? '')
  )
}

async function copyTable() {
  try {
    await navigator.clipboard.writeText(rows().map(row => row.join('\t')).join('\n'))
    copyStatus.value = '已复制'
  } catch {
    copyStatus.value = '复制失败，请手动选择表格'
  }
  clearTimeout(resetTimer)
  resetTimer = setTimeout(() => { copyStatus.value = '' }, 2000)
}

onBeforeUnmount(() => clearTimeout(resetTimer))
</script>

<template>
  <div class="course-source-table">
    <div class="table-toolbar">
      <span role="status">{{ copyStatus }}</span>
      <button type="button" aria-label="复制表格" title="复制表格" @click="copyTable">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="6" y="6" width="11" height="11" rx="2"/><path d="M13 6V4a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h2" /></svg>
      </button>
      <button type="button" aria-label="展开表格" title="展开表格" @click="expandedTable?.showModal()">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M3 8V3h5m4 0h5v5M3 12v5h5m4 0h5v-5" /></svg>
      </button>
    </div>
    <div ref="tableElement" class="table-scroller" v-html="tableHtml" />
    <dialog ref="expandedTable" class="table-dialog" aria-label="展开的教程表格" @click.self="expandedTable?.close()">
      <div class="dialog-toolbar"><strong>教程表格</strong><button type="button" aria-label="关闭表格" @click="expandedTable?.close()">关闭 ×</button></div>
      <div class="table-scroller" v-html="tableHtml" />
    </dialog>
  </div>
</template>

<style scoped>
.course-source-table { position: relative; min-width: 0; margin-top: 16px; }
.table-scroller { overflow-x: auto; }
.table-toolbar {
  position: absolute;
  top: 0;
  right: 0;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 2px;
  border-radius: 24px;
  background: var(--vp-c-bg);
  font-size: 12px;
  opacity: 0;
  pointer-events: none;
}
.course-source-table:hover .table-toolbar,
.course-source-table:focus-within .table-toolbar { opacity: 1; pointer-events: auto; }
.table-toolbar button { display: grid; place-items: center; width: 36px; height: 36px; border-radius: 50%; cursor: pointer; }
.table-toolbar button:hover { background: var(--vp-c-default-soft); }
.table-dialog { position: fixed; inset: 0; width: min(1000px, calc(100vw - 32px)); max-height: calc(100dvh - 48px); margin: auto; padding: 24px; overflow: auto; border: 1px solid var(--vp-c-divider); border-radius: 20px; background: var(--vp-c-bg); color: var(--vp-c-text-1); }
.table-dialog:not([open]) { display: none; }
.table-dialog::backdrop { background: rgb(0 0 0 / 45%); }
.dialog-toolbar { display: flex; justify-content: space-between; align-items: center; gap: 16px; margin-bottom: 16px; }
.dialog-toolbar button { padding: 6px 12px; border-radius: 20px; background: var(--vp-c-bg-soft); cursor: pointer; }
@media (hover: none) {
  .course-source-table { padding-top: 40px; }
  .table-toolbar { opacity: 1; pointer-events: auto; }
}
</style>
