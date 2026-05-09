import DefaultTheme from 'vitepress/theme'
import { onMounted, watch, nextTick } from 'vue'
import { useRoute } from 'vitepress'
import './zoom.css'

let hasImageViewerListener = false
let viewerScale = 1
let viewerTranslateX = 0
let viewerTranslateY = 0
let viewerImage: HTMLImageElement | null = null
let scaleText: HTMLSpanElement | null = null
let mermaidObserver: MutationObserver | null = null
let initTimer: ReturnType<typeof setTimeout> | null = null

const updateViewerTransform = () => {
  if (!viewerImage) return

  viewerImage.style.transform = `translate(${viewerTranslateX}px, ${viewerTranslateY}px) scale(${viewerScale})`
}

const updateViewerScale = (scale: number) => {
  viewerScale = Math.max(0.05, scale)
  updateViewerTransform()

  if (scaleText) {
    scaleText.textContent = `${Math.round(viewerScale * 100)}%`
  }
}

const resetViewerTransform = () => {
  viewerTranslateX = 0
  viewerTranslateY = 0
  updateViewerScale(1)
}

const closeImageViewer = () => {
  document.body.classList.remove('image-viewer-open')
  document.querySelector('.image-viewer')?.classList.remove('is-open')
  if (viewerImage) viewerImage.src = ''
  resetViewerTransform()
}

const openImageViewer = (image: HTMLImageElement) => {
  if (!viewerImage) return

  viewerImage.src = image.currentSrc || image.src
  viewerImage.alt = image.alt || ''
  document.body.classList.add('image-viewer-open')
  document.querySelector('.image-viewer')?.classList.add('is-open')
  resetViewerTransform()
}

const createImageViewer = () => {
  if (document.querySelector('.image-viewer')) return

  const viewer = document.createElement('div')
  viewer.className = 'image-viewer'
  viewer.innerHTML = `
    <div class="image-viewer__toolbar" aria-label="图片缩放控制">
      <button class="image-viewer__button" type="button" data-action="zoom-out" aria-label="缩小">-</button>
      <span class="image-viewer__scale">100%</span>
      <button class="image-viewer__button" type="button" data-action="zoom-in" aria-label="放大">+</button>
      <button class="image-viewer__button" type="button" data-action="reset" aria-label="重置">1:1</button>
      <button class="image-viewer__button" type="button" data-action="close" aria-label="关闭">×</button>
    </div>
    <div class="image-viewer__stage">
      <img class="image-viewer__image" alt="" />
    </div>
  `

  document.body.appendChild(viewer)
  viewerImage = viewer.querySelector('.image-viewer__image')
  scaleText = viewer.querySelector('.image-viewer__scale')

  let isDragging = false
  let dragStartX = 0
  let dragStartY = 0
  let dragOriginX = 0
  let dragOriginY = 0

  viewer.addEventListener('mousedown', (event) => {
    if (!(event.target instanceof HTMLImageElement)) return

    event.preventDefault()
    isDragging = true
    dragStartX = event.clientX
    dragStartY = event.clientY
    dragOriginX = viewerTranslateX
    dragOriginY = viewerTranslateY
    viewer.classList.add('is-dragging')
  })

  document.addEventListener('mousemove', (event) => {
    if (!isDragging) return

    viewerTranslateX = dragOriginX + event.clientX - dragStartX
    viewerTranslateY = dragOriginY + event.clientY - dragStartY
    updateViewerTransform()
  })

  document.addEventListener('mouseup', () => {
    if (!isDragging) return

    isDragging = false
    viewer.classList.remove('is-dragging')
  })

  viewer.addEventListener('click', (event) => {
    const target = event.target
    if (!(target instanceof HTMLElement)) return

    if (target.classList.contains('image-viewer__stage')) {
      closeImageViewer()
      return
    }

    const action = target.dataset.action
    if (!action) return

    if (action === 'zoom-in') updateViewerScale(viewerScale + 0.25)
    if (action === 'zoom-out') updateViewerScale(viewerScale - 0.25)
    if (action === 'reset') resetViewerTransform()
    if (action === 'close') closeImageViewer()
  })

  viewer.addEventListener(
    'wheel',
    (event) => {
      event.preventDefault()
      updateViewerScale(viewerScale + (event.deltaY < 0 ? 0.15 : -0.15))
    },
    { passive: false }
  )

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeImageViewer()
  })
}

const scheduleInitImageViewer = (initImageViewer: () => void, delay = 100) => {
  if (initTimer) clearTimeout(initTimer)
  initTimer = setTimeout(initImageViewer, delay)
}

const observeMermaidRender = (initImageViewer: () => void) => {
  mermaidObserver?.disconnect()

  const content = document.querySelector('.main')
  if (!content) return

  mermaidObserver = new MutationObserver(() => {
    scheduleInitImageViewer(initImageViewer)
  })

  mermaidObserver.observe(content, { childList: true, subtree: true })
}

export default {
  ...DefaultTheme,
  setup() {
    const route = useRoute()

    // 将 Mermaid SVG 转换为 img，复用图片预览器的缩放和拖拽能力
    const convertMermaidToImg = () => {
      document.querySelectorAll('.mermaid svg').forEach((svg) => {
        const container = svg.parentElement
        if (!container || container.querySelector('img[data-mermaid-img]')) return

        const svgData = new XMLSerializer().serializeToString(svg)
        const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
        const url = URL.createObjectURL(blob)

        const img = document.createElement('img')
        img.src = url
        img.setAttribute('data-mermaid-img', 'true')
        img.classList.add('image-viewer-target')
        img.style.width = '100%'
        img.style.cursor = 'zoom-in'

        // 隐藏原始 SVG，插入 img
        ;(svg as HTMLElement).style.display = 'none'
        container.appendChild(img)
      })
    }

    const initImageViewer = () => {
      convertMermaidToImg()
      createImageViewer()

      document.querySelectorAll('.main img').forEach((image) => {
        image.classList.add('image-viewer-target')
      })

      if (!hasImageViewerListener) {
        document.addEventListener(
          'click',
          (event) => {
            const target = event.target
            if (!(target instanceof HTMLElement)) return

            const image = target.closest('.main img')
            if (!image) return

            event.preventDefault()
            event.stopPropagation()
            openImageViewer(image as HTMLImageElement)
          },
          true
        )

        hasImageViewerListener = true
      }
    }

    onMounted(() => {
      scheduleInitImageViewer(initImageViewer, 1000)
      observeMermaidRender(initImageViewer)
    })

    watch(
      () => route.path,
      () => nextTick(() => {
        scheduleInitImageViewer(initImageViewer, 1000)
        observeMermaidRender(initImageViewer)
      })
    )
  }
}
