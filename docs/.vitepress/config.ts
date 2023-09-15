import { createRequire } from 'module'
import { defineConfig, type DefaultTheme } from 'vitepress'

console.log(`import.meta.url--->`, import.meta.url);
const require = createRequire(import.meta.url);
const pkg = require('vitepress/package.json')

export default defineConfig({
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
          { text: 'MPA Mode', link: 'mpa-mode' },
          { text: 'Sitemap Generation', link: 'sitemap-generation' }
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