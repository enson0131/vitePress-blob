import { createRequire } from 'module'
import { defineConfig, type DefaultTheme } from 'vitepress'

console.log(`import.meta.url--->`, import.meta.url);
const require = createRequire(import.meta.url);
const pkg = require('vitepress/package.json')

export default defineConfig({
    base: '/vitePress-blob/',
    title: '个人知识库',
    description:
        '📝个人平时的学习工作的点点记录',

    lastUpdated: true,
    cleanUrls: true,

    lang: 'zh-CN',
    
    head: [
        ['link', { rel: 'icon', href: '/assets/logo.jpg' }],
        ['meta', { name: 'theme-color', content: '#5f67ee' }],
        ['meta', { name: 'og:type', content: 'website' }],
        ['meta', { name: 'og:locale', content: 'en' }],
        ['meta', { name: 'og:site_name', content: 'VitePress' }],
        [
          'meta',
          { name: 'og:image', content: 'https://vitepress.dev/vitepress-og.jpg' }
        ],
        [
          'meta',
          {
            name: 'twitter:image',
            content: 'https://vitepress.dev/vitepress-og.jpg'
          }
        ],
      ],
    
      themeConfig: {
        logo: { src: '/assets/logo.jpg', width: 24, height: 24 },
    
        nav: nav(),
    
        sidebar: {
          '/guide/': { base: '/guide/', items: sidebarGuide() },
          '/shoot/': { base: '/shoot/', items: shootGuide()},
          '/reference/': { base: '/reference/', items: sidebarReference() }
        },
    
        editLink: {
          pattern: 'https://github.com/enson0131/vitePress-blob',
          text: 'Edit this page on GitHub'
        },
    
        socialLinks: [
          { icon: 'github', link: 'https://github.com/enson0131/vitePress-blob' }
        ],
      }
})


function nav(): DefaultTheme.NavItem[] {
  return [
    {
      text: '首页',
      link: '/',
      activeMatch: '^/$'
    },
    {
      text: '前端笔记',
      link: '/guide/javaScript相关/index',
      activeMatch: '/guide/'
    },
    {
      text: '摄影笔记',
      link: '/shoot/基础概念/光圈',
      activeMatch: '/shoot/'
    },
    {
      text: '关于我',
      link: 'https://github.com/enson0131',
      target: '_blank',
      rel: 'sponsored'
    },
  ]
}


/* prettier-ignore */
function sidebarGuide(): DefaultTheme.SidebarItem[] {
    return [
      {
        text: 'JavaScript 笔记',
        collapsed: false,
        items: [
          { text: '知识图谱', link: 'javaScript相关/index' },
          { text: '定义', link: 'javaScript相关/定义' },
          { text: '数据类型', link: 'javaScript相关/数据类型' },
          { text: '基础概念', link: 'javaScript相关/基础概念' },
          { text: '继承相关', link: 'javaScript相关/继承相关' },
          { text: 'ES6 相关', link: 'javaScript相关/ES6相关' },
          { text: 'Promise 相关', link: 'javaScript相关/Promise' },
          { text: '事件循环机制', link: 'javaScript相关/事件循环机制' },
          { text: 'DOM 相关', link: 'javaScript相关/DOM相关' },
          { text: 'JavaScript编译机制', link: 'javaScript相关/JavaScript编译机制' },
          { text: 'JavaScript执行机制', link: 'javaScript相关/JavaScript执行机制' },
          { text: '垃圾回收机制', link: 'javaScript相关/垃圾回收机制' },
        ]
      },
      {
        text: 'CSS 笔记',
        collapsed: false,
        items: [
          { text: '概要', link: 'css相关/概要' },
          { text: 'display', link: 'css相关/display' },
          { text: 'position', link: 'css相关/position' },
          { text: 'BFC', link: 'css相关/BFC' },
          { text: '隐藏元素的方法', link: 'css相关/隐藏元素的方法' },
          { text: 'display、visibility、opacity区别', link: 'css相关/display、visibility、opacity区别' },
          { text: 'display、float、position的关系', link: 'css相关/display、float、position的关系'},
          { text: '对 line-height 的理解及其赋值方式', link: 'css相关/对 line-height 的理解及其赋值方式'},
          { text: 'link和import的区别', link: 'css相关/link和import的区别'}
        ]
      },
      {
        text: '浏览器笔记',
        collapsed: false,
        items: [
          { text: '概要', link: '浏览器相关/概要' },
          { text: '浏览器进程架构', link: '浏览器相关/浏览器进程架构' },
          { text: '浏览器渲染流程', link: '浏览器相关/浏览器渲染流程' },
          { text: '浏览器安全', link: '浏览器相关/浏览器安全' },
          { text: '浏览器缓存', link: '浏览器相关/浏览器缓存' },
          { text: '浏览器内核', link: '浏览器相关/浏览器内核' },
        ]
      },
      {
        text: '网络笔记',
        collapsed: false,
        items: [
          { text: '概要', link: '网络相关/概要' },
          { text: 'GET 请求和 POST 请求的区别', link: '网络相关/GET请求和POST请求的区别' },
          { text: '请求报文', link: '网络相关/请求报文' },
          { text: '响应报文', link: '网络相关/响应报文' },
          { text: 'HTTP', link: '网络相关/HTTP' },
          { text: 'HTTPS', link: '网络相关/HTTPS' },
          { text: 'DNS', link: '网络相关/DNS' },
          { text: 'CDN', link: '网络相关/CDN' },
          { text: '跨域请求', link: '网络相关/跨域请求'},
          // { text: '常见的问题', link: '网络相关/常见的问题'}
        ]
      },
      {
        text: 'React 笔记',
        collapsed: false,
        items: [
          { text: 'React是什么', link: 'React/React是什么' },
          { text: 'React 为什么要使用 JSX', link: 'React/React为什么要使用JSX' },
          { text: '如何设计 React 组件', link: 'React/如何设计React组件' },
          { text: 'setState 是同步还是异步', link: 'React/setState是同步还是异步的' },
          { text: '什么是Fiber', link: 'React/什么是Fiber' },
          { text: 'React 是如何渲染的', link: 'React/React是如何渲染的' },
          { text: 'React 中的 Diff 算法', link: 'React/diff算法' },
          { text: 'React 中的事件机制', link: 'React/React中的事件机制' },
          { text: 'React 中的异常机制', link: 'React/React中的异常机制' },
          { text: 'React 中的性能优化', link: 'React/React中的性能优化' },
        ]
      },
      // {
      //   text: 'Vue 笔记',
      //   collapsed: false,
      //   items: [
      //     { text: 'MPA Mode', link: 'mpa-mode' },
      //     { text: 'Sitemap Generation', link: 'sitemap-generation' }
      //   ]
      // },
      {
        text: 'Redux 笔记',
        collapsed: false,
        items: [
          { text: 'Redux 设计理念', link: 'redux/设计理念' },
          { text: 'Redux 源码解读', link: 'redux/源码解读' },
        ]
      },
      {
        text: 'webpack 笔记',
        collapsed: false,
        items: [
          { text: '构建流程', link: 'webpack/构建流程' },
          { text: '简易实现', link: 'webpack/构建流程' },
          { text: '源码分析', link: 'webpack/构建流程' },
          { text: 'Tapable', link: 'webpack/构建流程' },
          { text: 'Compiler', link: 'webpack/构建流程' },
          { text: 'Compilation', link: 'webpack/构建流程' },
          { text: 'Loader 机制', link: 'webpack/构建流程' },
          { text: 'Plugin 机制', link: 'webpack/构建流程' },
        ]
      },
      // {
      //   text: 'Vite 笔记',
      //   collapsed: false,
      //   items: [
      //     { text: 'Redux 设计理念', link: 'redux/设计理念' },
      //     { text: 'Redux 源码解读', link: 'redux/源码解读' },
      //   ]
      // },
      {
        text: 'Canvas 笔记',
        collapsed: false,
        items: [
          { text: 'Canvas 尺寸与分辨率矫正', link: 'canvas/Canvas尺寸及分辨率矫正' },
          { text: '实现一个自由绘制的 Canvas 画板', link: 'canvas/如何在Canvas画板上自由书写' },
          { text: '通过贝塞尔曲线优化 Canvas 书写性能', link: 'canvas/通过贝塞尔曲线优化Canvas书写性能' },
          { text: '通过上下分层优化 Canvas 书写性能', link: 'canvas/通过上下分层优化Canvas书写性能' },
          { text: '通过离屏渲染提高Canvas书写性能', link: 'canvas/通过离屏渲染提高Canvas书写性能' },
          { text: '可视区域内渲染提高Canvas书写性能', link: 'canvas/可视区域内渲染提高Canvas书写性能' },
          { text: '通过 OffscreenCanvas + Worker 提高书写性能', link: 'canvas/通过 OffscreenCanvas + Worker 提高书写性能' },
        ]
      },
      {
        text: 'Node 笔记',
        collapsed: false,
        items: [
          { text: '概要', link: 'Node相关/概要' },
          { text: '基本概念', link: 'Node相关/基本概念' },
        ]

      }
    ]
}
  
function sidebarReference(): DefaultTheme.SidebarItem[] {
    return [
      {
        text: 'Reference',
        items: [
          { text: 'Site Config', link: 'site-config' },
          { text: 'Frontmatter Config', link: 'frontmatter-config' },
          { text: 'Runtime API', link: 'runtime-api' },
          { text: 'CLI', link: 'cli' },
          {
            text: 'Default Theme',
            base: '/reference/default-theme-',
            items: [
              { text: 'Overview', link: 'config' },
              { text: 'Nav', link: 'nav' },
              { text: 'Sidebar', link: 'sidebar' },
              { text: 'Home Page', link: 'home-page' },
              { text: 'Footer', link: 'footer' },
              { text: 'Layout', link: 'layout' },
              { text: 'Badge', link: 'badge' },
              { text: 'Team Page', link: 'team-page' },
              { text: 'Prev / Next Links', link: 'prev-next-links' },
              { text: 'Edit Link', link: 'edit-link' },
              { text: 'Last Updated Timestamp', link: 'last-updated' },
              { text: 'Search', link: 'search' },
              { text: 'Carbon Ads', link: 'carbon-ads' }
            ]
          }
        ]
      }
    ]
}

function shootGuide(): DefaultTheme.SidebarItem[] {
  return [
    {
      text: '基础概念',
      collapsed: false,
      items: [
        { text: '光圈', link: '基础概念/光圈' },
        { text: '快门速度', link: '基础概念/快门速度' },
        { text: 'ISO 感光度', link: '基础概念/ISO感光度' },
      ]
    },
    {
      text: '构图形式',
      collapsed: false,
      items: [
        { text: '如何拍花的黑背景', link: '实战技巧/如何拍花的黑背景' },
      ]
    },
    {
      text: '实战技巧',
      collapsed: false,
      items: [
        { text: '如何拍花的黑背景', link: '实战技巧/如何拍花的黑背景' },
        { text: '如何拍雨丝', link: '实战技巧/如何拍雨丝' },
        { text: '拍摄梦幻光斑', link: '实战技巧/拍摄梦幻光斑' },
        { text: '逆光人像', link: '实战技巧/逆光人像' },
        { text: '暗调人像', link: '实战技巧/暗调人像' },
      ]
    },
    {
      text: '自己的实战总结',
      collapsed: false,
      items: [
        { text: '拍摄烟花', link: '自我实战总结/拍摄烟花' },
        { text: '拍摄星空', link: '自我实战总结/拍摄星空' },
        { text: '拍摄月亮', link: '自我实战总结/拍摄月亮' },
      ]
    },
  ]
}