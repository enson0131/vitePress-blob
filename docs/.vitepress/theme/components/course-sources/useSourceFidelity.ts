import { onMounted, onBeforeUnmount, watch } from 'vue'
import { useData } from 'vitepress'
import './source-fidelity.css'

/** Presentation/interaction repairs only. The archived article strings stay unchanged. */
export function useSourceFidelity(chapter: 2 | 5 | 6 | 9) {
  const { isDark } = useData()
  let root: HTMLElement | null = null
  const svgText = (image: HTMLImageElement): string | null => {
    const src = image.getAttribute('src') || ''
    if (!src.startsWith('data:image/svg+xml')) return null
    try { return decodeURIComponent(src.slice(src.indexOf(',') + 1)) } catch { return null }
  }
  function writeSvg(image: HTMLImageElement, source: string) {
    const color = isDark.value ? 'rgb(237, 237, 237)' : 'rgb(13, 13, 13)'
    const themed = source.replace(/(<svg\b[^>]*\bstyle=")[^"]*(")/, '$1color:' + color + '$2')
    image.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(themed)
  }
  function restoreSvgTheme() {
    if (chapter !== 2) return
    root?.querySelectorAll<HTMLImageElement>('img[data-d-component="svg"]').forEach(image => {
      const source = svgText(image)
      if (source) writeSvg(image, source)
    })
  }
  function syncCosine(event: Event) {
    const target = event.target
    if (!(target instanceof HTMLInputElement)) return
    const lab = target.closest<HTMLElement>('[data-web-lab="cosine"]')
    const image = lab?.querySelector<HTMLImageElement>('img[data-d-component="svg"]')
    if (!lab || !image) return
    const values = Array.from(lab.querySelectorAll<HTMLInputElement>('input[type="range"]')).map(input => Number(input.value))
    if (values.length !== 4 || values.some(value => !Number.isFinite(value))) return
    const source = svgText(image)
    if (!source) return
    const doc = new DOMParser().parseFromString(source, 'image/svg+xml')
    if (doc.querySelector('parsererror')) return
    // Coordinates and label offsets are taken from the uploaded original SVG.
    for (const [index, color, dy] of [[0, '#16a34a', -8], [2, '#2563eb', 18]] as const) {
      const x = 160 + values[index] * 18
      const y = 122 - values[index + 1] * 18
      const line = doc.querySelector(`line[stroke="${color}"]`)
      const circle = doc.querySelector(`circle[fill="${color}"]`)
      const label = doc.querySelector(`text[fill="${color}"]`)
      line?.setAttribute('x2', String(x)); line?.setAttribute('y2', String(y))
      circle?.setAttribute('cx', String(x)); circle?.setAttribute('cy', String(y))
      label?.setAttribute('x', String(x + 9)); label?.setAttribute('y', String(y + dy))
    }
    writeSvg(image, new XMLSerializer().serializeToString(doc.documentElement))
  }
  function syncReset(event: MouseEvent) {
    const button = (event.target as Element | null)?.closest('[data-web-action="reset-lab"]')
    const input = button?.closest('[data-web-lab="cosine"]')?.querySelector<HTMLInputElement>('input[type="range"]')
    if (input) queueMicrotask(() => input.dispatchEvent(new Event('input', { bubbles: true })))
  }
  onMounted(() => {
    root = document.querySelector(`.web-course-source[data-chapter="${chapter}"]`)
    restoreSvgTheme()
    root?.addEventListener('input', syncCosine)
    root?.addEventListener('click', syncReset)
  })
  watch(isDark, restoreSvgTheme)
  onBeforeUnmount(() => {
    root?.removeEventListener('input', syncCosine)
    root?.removeEventListener('click', syncReset)
    root = null
  })
}
