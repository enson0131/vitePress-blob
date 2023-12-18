import { createRequire } from 'module'
import { defineConfig, type DefaultTheme } from 'vitepress'

console.log(`import.meta.url--->`, import.meta.url);
const require = createRequire(import.meta.url);
const pkg = require('vitepress/package.json')

export default defineConfig({
    base: '/vitePress-blob/',
    title: '前端知识库',
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
          '/reference/': { base: '/reference/', items: sidebarReference() }
        },
    
        editLink: {
          pattern: 'https://github.com/vuejs/vitepress/edit/main/docs/:path',
          text: 'Edit this page on GitHub'
        },
    
        socialLinks: [
          { icon: 'github', link: 'https://github.com/vuejs/vitepress' }
        ],
    
        // search: {
        //   provider: 'algolia',
        //   options: {
        //     appId: '8J64VVRP8K',
        //     apiKey: 'a18e2f4cc5665f6602c5631fd868adfd',
        //     indexName: 'vitepress'
        //   }
        // },
    
        // carbonAds: {
        //   code: 'CEBDT27Y',
        //   placement: 'vuejsorg'
        // }
      }
})


function nav(): DefaultTheme.NavItem[] {
  return [
    {
      text: 'Guide',
      link: '/guide/javaScript相关/index',
      activeMatch: '/guide/'
    },
    {
      text: 'Reference',
      link: '/reference/site-config',
      activeMatch: '/reference/'
    },
    // {
    //   text: pkg.version,
    //   items: [
    //     {
    //       text: 'Changelog',
    //       link: 'https://github.com/vuejs/vitepress/blob/main/CHANGELOG.md'
    //     },
    //     {
    //       text: 'Contributing',
    //       link: 'https://github.com/vuejs/vitepress/blob/main/.github/contributing.md'
    //     }
    //   ]
    // }
  ]
}


/* prettier-ignore */
function sidebarGuide(): DefaultTheme.SidebarItem[] {
    return [
      {
        text: 'JavaScript 笔记',
        collapsed: false,
        items: [
          { text: 'What is VitePress?', link: 'javaScript相关/index' },
          { text: 'Getting Started', link: 'javaScript相关/index' },
          { text: 'Routing', link: 'javaScript相关/index' },
          { text: 'Deploy', link: 'javaScript相关/index' }
        ]
      },
      {
        text: 'CSS 笔记',
        collapsed: false,
        items: [
          { text: 'Markdown Extensions', link: 'markdown' },
          { text: 'Asset Handling', link: 'asset-handling' },
          { text: 'Frontmatter', link: 'frontmatter' },
          { text: 'Using Vue in Markdown', link: 'using-vue' },
          { text: 'Internationalization', link: 'i18n' }
        ]
      },
      {
        text: '网络笔记',
        collapsed: false,
        items: [
          { text: 'Using a Custom Theme', link: 'custom-theme' },
          { text: 'Extending the Default Theme', link: 'extending-default-theme' },
          { text: 'Build-Time Data Loading', link: 'data-loading' },
          { text: 'SSR Compatibility', link: 'ssr-compat' },
          { text: 'Connecting to a CMS', link: 'cms' }
        ]
      },
      {
        text: '浏览器笔记',
        collapsed: false,
        items: [
          { text: 'MPA Mode', link: 'mpa-mode' },
          { text: 'Sitemap Generation', link: 'sitemap-generation' }
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
      {
        text: 'Vue 笔记',
        collapsed: false,
        items: [
          { text: 'MPA Mode', link: 'mpa-mode' },
          { text: 'Sitemap Generation', link: 'sitemap-generation' }
        ]
      },
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
          { text: 'Redux 设计理念', link: 'redux/设计理念' },
          { text: 'Redux 源码解读', link: 'redux/源码解读' },
        ]
      },
      {
        text: 'Vite 笔记',
        collapsed: false,
        items: [
          { text: 'Redux 设计理念', link: 'redux/设计理念' },
          { text: 'Redux 源码解读', link: 'redux/源码解读' },
        ]
      },
      {
        text: 'Canvas 笔记',
        collapsed: false,
        items: [
          { text: 'Canvas 尺寸与分辨率矫正', link: 'canvas/Canvas尺寸及分辨率矫正' },
          { text: '实现一个自由绘制的 Canvas 画板', link: 'canvas/如何在Canvas画板上自由书写' },
          { text: '通过贝塞尔曲线优化 Canvas 书写性能', link: 'canvas/通过贝塞尔曲线优化Canvas书写性能' },
          { text: '通过上下分层优化 Canvas 书写性能', link: 'canvas/通过上下分层优化Canvas书写性能' },
          { text: '通过离屏渲染提高Canvas书写性能', link: 'canvas/通过离屏渲染提高Canvas书写性能' },
        ]
      },
      { text: 'Config & API Reference', base: '/reference/', link: 'site-config' }
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