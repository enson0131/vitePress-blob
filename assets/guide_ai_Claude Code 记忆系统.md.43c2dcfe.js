import{_ as s,o as n,c as a,Q as e}from"./chunks/framework.b6910bb2.js";const l="/vitePress-blob/assets/16.f23226af.png",p="/vitePress-blob/assets/17.1eb9214d.png",C=JSON.parse('{"title":"Claude Code 记忆系统与 CLAUDE.md","description":"","frontmatter":{},"headers":[],"relativePath":"guide/ai/Claude Code 记忆系统.md","filePath":"guide/ai/Claude Code 记忆系统.md","lastUpdated":1773659508000}'),o={name:"guide/ai/Claude Code 记忆系统.md"},c=e(`<h1 id="claude-code-记忆系统与-claude-md" tabindex="-1">Claude Code 记忆系统与 CLAUDE.md <a class="header-anchor" href="#claude-code-记忆系统与-claude-md" aria-label="Permalink to &quot;Claude Code 记忆系统与 CLAUDE.md&quot;">​</a></h1><h2 id="前言" tabindex="-1">前言 <a class="header-anchor" href="#前言" aria-label="Permalink to &quot;前言&quot;">​</a></h2><p>上一讲我们介绍了 Claude Code 的技术全景概览，大体了解了 Claude Code 的架构与组成。</p><p>本讲我们主要介绍 Claude Code 的记忆系统，并给出一些如何写好 CLAUDE.md 的个人建议。</p><h2 id="痛点" tabindex="-1">痛点 <a class="header-anchor" href="#痛点" aria-label="Permalink to &quot;痛点&quot;">​</a></h2><p>案例：</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki github-dark vp-code-dark"><code><span class="line"><span style="color:#e1e4e8;">第一次对话：</span></span>
<span class="line"><span style="color:#e1e4e8;">你：帮我写一个用户登录接口</span></span>
<span class="line"><span style="color:#e1e4e8;">Claude：好的，这是一个基础的登录接口...（使用 Express + JavaScript）</span></span>
<span class="line"><span style="color:#e1e4e8;">你：我们项目用的是 Egg 和 TypeScript</span></span>
<span class="line"><span style="color:#e1e4e8;">Claude：好的，让我重新写...</span></span>
<span class="line"><span style="color:#e1e4e8;"></span></span>
<span class="line"><span style="color:#e1e4e8;"></span></span>
<span class="line"><span style="color:#e1e4e8;">（新的窗口）第二次对话：</span></span>
<span class="line"><span style="color:#e1e4e8;">你：帮我写一个登录的页面</span></span>
<span class="line"><span style="color:#e1e4e8;">Claude：好的，这是一个基础的登录接口...（使用传统的 CSS）</span></span>
<span class="line"><span style="color:#e1e4e8;">你: 我们项目有用 tailwindcss...</span></span>
<span class="line"><span style="color:#e1e4e8;">Claude：好的，让我重新写...</span></span></code></pre><pre class="shiki github-light vp-code-light"><code><span class="line"><span style="color:#24292e;">第一次对话：</span></span>
<span class="line"><span style="color:#24292e;">你：帮我写一个用户登录接口</span></span>
<span class="line"><span style="color:#24292e;">Claude：好的，这是一个基础的登录接口...（使用 Express + JavaScript）</span></span>
<span class="line"><span style="color:#24292e;">你：我们项目用的是 Egg 和 TypeScript</span></span>
<span class="line"><span style="color:#24292e;">Claude：好的，让我重新写...</span></span>
<span class="line"><span style="color:#24292e;"></span></span>
<span class="line"><span style="color:#24292e;"></span></span>
<span class="line"><span style="color:#24292e;">（新的窗口）第二次对话：</span></span>
<span class="line"><span style="color:#24292e;">你：帮我写一个登录的页面</span></span>
<span class="line"><span style="color:#24292e;">Claude：好的，这是一个基础的登录接口...（使用传统的 CSS）</span></span>
<span class="line"><span style="color:#24292e;">你: 我们项目有用 tailwindcss...</span></span>
<span class="line"><span style="color:#24292e;">Claude：好的，让我重新写...</span></span></code></pre></div><p>刚开始使用 Claude Code 时，这种情况十分常见。对于小项目，多说几次需求，倒也无所谓。但随着时间推移，项目逐渐复杂，如果每次新对话 Claude 都让你从零开始——它不记得你的项目用什么技术栈、什么代码风格、什么团队规范——这种&quot;失忆症&quot;会让人抓狂。</p><p>而 <strong>CLAUDE.md</strong> 就是治疗这种失忆症的良药。</p><p>它是一份给 Claude 的「项目入职手册」—— Claude 每次开始对话时，都会自动阅读这份手册，了解你的项目背景，明确它在干活时应该遵循的一系列底层规则。</p><h2 id="记忆系统的加载流程" tabindex="-1">记忆系统的加载流程 <a class="header-anchor" href="#记忆系统的加载流程" aria-label="Permalink to &quot;记忆系统的加载流程&quot;">​</a></h2><p>当你在项目目录启动 Claude Code 时，记忆系统的初始化流程如下：</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki github-dark vp-code-dark"><code><span class="line"><span style="color:#e1e4e8;">启动 Claude Code</span></span>
<span class="line"><span style="color:#e1e4e8;">       │</span></span>
<span class="line"><span style="color:#e1e4e8;">       ▼</span></span>
<span class="line"><span style="color:#e1e4e8;">加载企业策略  /etc/claude-code/CLAUDE.md</span></span>
<span class="line"><span style="color:#e1e4e8;">       │</span></span>
<span class="line"><span style="color:#e1e4e8;">       ▼</span></span>
<span class="line"><span style="color:#e1e4e8;">加载用户级    ~/.claude/CLAUDE.md</span></span>
<span class="line"><span style="color:#e1e4e8;">       │</span></span>
<span class="line"><span style="color:#e1e4e8;">       ▼</span></span>
<span class="line"><span style="color:#e1e4e8;">加载项目级    ./CLAUDE.md 或 ./claude/CLAUDE.md</span></span>
<span class="line"><span style="color:#e1e4e8;">       │</span></span>
<span class="line"><span style="color:#e1e4e8;">       ▼</span></span>
<span class="line"><span style="color:#e1e4e8;">加载项目规则  .claude/rules/*.md</span></span>
<span class="line"><span style="color:#e1e4e8;">       │</span></span>
<span class="line"><span style="color:#e1e4e8;">       ▼</span></span>
<span class="line"><span style="color:#e1e4e8;">加载本地级    ./CLAUDE.local.md</span></span>
<span class="line"><span style="color:#e1e4e8;">       │</span></span>
<span class="line"><span style="color:#e1e4e8;">       ▼</span></span>
<span class="line"><span style="color:#e1e4e8;">进入对话，所有规则生效</span></span></code></pre><pre class="shiki github-light vp-code-light"><code><span class="line"><span style="color:#24292e;">启动 Claude Code</span></span>
<span class="line"><span style="color:#24292e;">       │</span></span>
<span class="line"><span style="color:#24292e;">       ▼</span></span>
<span class="line"><span style="color:#24292e;">加载企业策略  /etc/claude-code/CLAUDE.md</span></span>
<span class="line"><span style="color:#24292e;">       │</span></span>
<span class="line"><span style="color:#24292e;">       ▼</span></span>
<span class="line"><span style="color:#24292e;">加载用户级    ~/.claude/CLAUDE.md</span></span>
<span class="line"><span style="color:#24292e;">       │</span></span>
<span class="line"><span style="color:#24292e;">       ▼</span></span>
<span class="line"><span style="color:#24292e;">加载项目级    ./CLAUDE.md 或 ./claude/CLAUDE.md</span></span>
<span class="line"><span style="color:#24292e;">       │</span></span>
<span class="line"><span style="color:#24292e;">       ▼</span></span>
<span class="line"><span style="color:#24292e;">加载项目规则  .claude/rules/*.md</span></span>
<span class="line"><span style="color:#24292e;">       │</span></span>
<span class="line"><span style="color:#24292e;">       ▼</span></span>
<span class="line"><span style="color:#24292e;">加载本地级    ./CLAUDE.local.md</span></span>
<span class="line"><span style="color:#24292e;">       │</span></span>
<span class="line"><span style="color:#24292e;">       ▼</span></span>
<span class="line"><span style="color:#24292e;">进入对话，所有规则生效</span></span></code></pre></div><p><img src="`+l+`" alt="Claude Code 记忆系统与 CLAUDE.md"></p><p>就像新员工的入职手册一样，Claude Code 每次对话时都会完成上述初始化加载，确保它始终&quot;记得&quot;你的项目上下文。</p><h2 id="五层记忆架构" tabindex="-1">五层记忆架构 <a class="header-anchor" href="#五层记忆架构" aria-label="Permalink to &quot;五层记忆架构&quot;">​</a></h2><p>类似于常见的缓存分层设计（内存缓存 → Redis 缓存 → 数据库），Claude Code 的记忆系统支持 <strong>5 层记忆</strong>，按层级结构组织，高层级的文件优先加载，为底层文件提供基础约束。</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki github-dark vp-code-dark"><code><span class="line"><span style="color:#e1e4e8;">┌─────────────────────────────────┐  优先级最高</span></span>
<span class="line"><span style="color:#e1e4e8;">│  企业策略  /etc/claude-code/     │</span></span>
<span class="line"><span style="color:#e1e4e8;">├─────────────────────────────────┤</span></span>
<span class="line"><span style="color:#e1e4e8;">│  用户级    ~/.claude/            │</span></span>
<span class="line"><span style="color:#e1e4e8;">├─────────────────────────────────┤</span></span>
<span class="line"><span style="color:#e1e4e8;">│  项目级    ./CLAUDE.md           │</span></span>
<span class="line"><span style="color:#e1e4e8;">├─────────────────────────────────┤</span></span>
<span class="line"><span style="color:#e1e4e8;">│  项目规则  .claude/rules/        │</span></span>
<span class="line"><span style="color:#e1e4e8;">├─────────────────────────────────┤</span></span>
<span class="line"><span style="color:#e1e4e8;">│  本地级    ./CLAUDE.local.md     │  优先级最低</span></span>
<span class="line"><span style="color:#e1e4e8;">└─────────────────────────────────┘</span></span></code></pre><pre class="shiki github-light vp-code-light"><code><span class="line"><span style="color:#24292e;">┌─────────────────────────────────┐  优先级最高</span></span>
<span class="line"><span style="color:#24292e;">│  企业策略  /etc/claude-code/     │</span></span>
<span class="line"><span style="color:#24292e;">├─────────────────────────────────┤</span></span>
<span class="line"><span style="color:#24292e;">│  用户级    ~/.claude/            │</span></span>
<span class="line"><span style="color:#24292e;">├─────────────────────────────────┤</span></span>
<span class="line"><span style="color:#24292e;">│  项目级    ./CLAUDE.md           │</span></span>
<span class="line"><span style="color:#24292e;">├─────────────────────────────────┤</span></span>
<span class="line"><span style="color:#24292e;">│  项目规则  .claude/rules/        │</span></span>
<span class="line"><span style="color:#24292e;">├─────────────────────────────────┤</span></span>
<span class="line"><span style="color:#24292e;">│  本地级    ./CLAUDE.local.md     │  优先级最低</span></span>
<span class="line"><span style="color:#24292e;">└─────────────────────────────────┘</span></span></code></pre></div><p><img src="`+p+`" alt="Claude Code 记忆系统与 CLAUDE.md"></p><h3 id="企业策略" tabindex="-1">企业策略 <a class="header-anchor" href="#企业策略" aria-label="Permalink to &quot;企业策略&quot;">​</a></h3><ul><li><strong>存放位置</strong>：<code>/etc/claude-code/CLAUDE.md</code></li><li><strong>使用场景</strong>：公司编码标准、安全策略、合规要求</li></ul><p>这一层由公司 IT 或平台团队统一维护，适合在组织层面强制执行的规范，例如禁止提交密钥、代码审查流程要求等。所有成员的 Claude Code 都会自动加载，无需手动配置。</p><h3 id="用户级" tabindex="-1">用户级 <a class="header-anchor" href="#用户级" aria-label="Permalink to &quot;用户级&quot;">​</a></h3><ul><li><strong>存放位置</strong>：<code>~/.claude/CLAUDE.md</code></li><li><strong>使用场景</strong>：个人偏好、通用习惯设置</li></ul><p>无论你在哪个项目工作，这里的配置都会生效，适合放置个人的通用偏好：</p><div class="language-markdown vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">markdown</span><pre class="shiki github-dark vp-code-dark"><code><span class="line"><span style="color:#79B8FF;font-weight:bold;"># 个人偏好</span></span>
<span class="line"></span>
<span class="line"><span style="color:#79B8FF;font-weight:bold;">## 沟通方式</span></span>
<span class="line"><span style="color:#FFAB70;">-</span><span style="color:#E1E4E8;"> 使用中文回复</span></span>
<span class="line"><span style="color:#FFAB70;">-</span><span style="color:#E1E4E8;"> 代码注释使用中文</span></span>
<span class="line"></span>
<span class="line"><span style="color:#79B8FF;font-weight:bold;">## 通用代码风格</span></span>
<span class="line"><span style="color:#FFAB70;">-</span><span style="color:#E1E4E8;"> 优先使用 async/await</span></span>
<span class="line"></span>
<span class="line"><span style="color:#79B8FF;font-weight:bold;">## 注意事项</span></span>
<span class="line"><span style="color:#FFAB70;">-</span><span style="color:#E1E4E8;"> superpowers 相关的能力不主动触发，需要手动触发</span></span></code></pre><pre class="shiki github-light vp-code-light"><code><span class="line"><span style="color:#005CC5;font-weight:bold;"># 个人偏好</span></span>
<span class="line"></span>
<span class="line"><span style="color:#005CC5;font-weight:bold;">## 沟通方式</span></span>
<span class="line"><span style="color:#E36209;">-</span><span style="color:#24292E;"> 使用中文回复</span></span>
<span class="line"><span style="color:#E36209;">-</span><span style="color:#24292E;"> 代码注释使用中文</span></span>
<span class="line"></span>
<span class="line"><span style="color:#005CC5;font-weight:bold;">## 通用代码风格</span></span>
<span class="line"><span style="color:#E36209;">-</span><span style="color:#24292E;"> 优先使用 async/await</span></span>
<span class="line"></span>
<span class="line"><span style="color:#005CC5;font-weight:bold;">## 注意事项</span></span>
<span class="line"><span style="color:#E36209;">-</span><span style="color:#24292E;"> superpowers 相关的能力不主动触发，需要手动触发</span></span></code></pre></div><h3 id="项目级" tabindex="-1">项目级 <a class="header-anchor" href="#项目级" aria-label="Permalink to &quot;项目级&quot;">​</a></h3><ul><li><strong>存放位置</strong>：<code>./CLAUDE.md</code> 或 <code>./claude/CLAUDE.md</code></li><li><strong>使用场景</strong>：项目架构、编码规范、常见工作流</li></ul><p>这是最常用的一层，通常随代码一起提交到版本库，让整个团队共享同一份&quot;项目说明书&quot;。典型内容包括：</p><div class="language-markdown vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">markdown</span><pre class="shiki github-dark vp-code-dark"><code><span class="line"><span style="color:#79B8FF;font-weight:bold;"># 项目说明</span></span>
<span class="line"></span>
<span class="line"><span style="color:#79B8FF;font-weight:bold;">## 技术栈</span></span>
<span class="line"><span style="color:#FFAB70;">-</span><span style="color:#E1E4E8;"> 后端：Egg.js + TypeScript</span></span>
<span class="line"><span style="color:#FFAB70;">-</span><span style="color:#E1E4E8;"> 前端：Vue 3 + Vite + Tailwind CSS</span></span>
<span class="line"><span style="color:#FFAB70;">-</span><span style="color:#E1E4E8;"> 数据库：MySQL + Redis</span></span>
<span class="line"></span>
<span class="line"><span style="color:#79B8FF;font-weight:bold;">## 代码规范</span></span>
<span class="line"><span style="color:#FFAB70;">-</span><span style="color:#E1E4E8;"> 接口统一返回 </span><span style="color:#79B8FF;">\`{ code, message, data }\`</span><span style="color:#E1E4E8;"> 格式</span></span>
<span class="line"><span style="color:#FFAB70;">-</span><span style="color:#E1E4E8;"> 错误处理使用自定义 AppError 类</span></span>
<span class="line"><span style="color:#FFAB70;">-</span><span style="color:#E1E4E8;"> 所有异步函数必须有 try/catch</span></span>
<span class="line"></span>
<span class="line"><span style="color:#79B8FF;font-weight:bold;">## 常用命令</span></span>
<span class="line"><span style="color:#FFAB70;">-</span><span style="color:#E1E4E8;"> 启动开发环境：</span><span style="color:#79B8FF;">\`npm run dev\`</span></span>
<span class="line"><span style="color:#FFAB70;">-</span><span style="color:#E1E4E8;"> 运行测试：</span><span style="color:#79B8FF;">\`npm run test\`</span></span>
<span class="line"><span style="color:#FFAB70;">-</span><span style="color:#E1E4E8;"> 构建：</span><span style="color:#79B8FF;">\`npm run build\`</span></span></code></pre><pre class="shiki github-light vp-code-light"><code><span class="line"><span style="color:#005CC5;font-weight:bold;"># 项目说明</span></span>
<span class="line"></span>
<span class="line"><span style="color:#005CC5;font-weight:bold;">## 技术栈</span></span>
<span class="line"><span style="color:#E36209;">-</span><span style="color:#24292E;"> 后端：Egg.js + TypeScript</span></span>
<span class="line"><span style="color:#E36209;">-</span><span style="color:#24292E;"> 前端：Vue 3 + Vite + Tailwind CSS</span></span>
<span class="line"><span style="color:#E36209;">-</span><span style="color:#24292E;"> 数据库：MySQL + Redis</span></span>
<span class="line"></span>
<span class="line"><span style="color:#005CC5;font-weight:bold;">## 代码规范</span></span>
<span class="line"><span style="color:#E36209;">-</span><span style="color:#24292E;"> 接口统一返回 </span><span style="color:#005CC5;">\`{ code, message, data }\`</span><span style="color:#24292E;"> 格式</span></span>
<span class="line"><span style="color:#E36209;">-</span><span style="color:#24292E;"> 错误处理使用自定义 AppError 类</span></span>
<span class="line"><span style="color:#E36209;">-</span><span style="color:#24292E;"> 所有异步函数必须有 try/catch</span></span>
<span class="line"></span>
<span class="line"><span style="color:#005CC5;font-weight:bold;">## 常用命令</span></span>
<span class="line"><span style="color:#E36209;">-</span><span style="color:#24292E;"> 启动开发环境：</span><span style="color:#005CC5;">\`npm run dev\`</span></span>
<span class="line"><span style="color:#E36209;">-</span><span style="color:#24292E;"> 运行测试：</span><span style="color:#005CC5;">\`npm run test\`</span></span>
<span class="line"><span style="color:#E36209;">-</span><span style="color:#24292E;"> 构建：</span><span style="color:#005CC5;">\`npm run build\`</span></span></code></pre></div><h3 id="项目规则" tabindex="-1">项目规则 <a class="header-anchor" href="#项目规则" aria-label="Permalink to &quot;项目规则&quot;">​</a></h3><ul><li><strong>存放位置</strong>：<code>.claude/rules/*.md</code></li><li><strong>使用场景</strong>：支持条件作用域，适用于 CLAUDE.md 变得太长时、不同文件类型需要不同规范、前后端分离等场景</li></ul><p>当 CLAUDE.md 内容越来越多，开始影响上下文效率时，可以将规则拆分到独立文件中：</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki github-dark vp-code-dark"><code><span class="line"><span style="color:#e1e4e8;">.claude/</span></span>
<span class="line"><span style="color:#e1e4e8;">└── rules/</span></span>
<span class="line"><span style="color:#e1e4e8;">    ├── typescript.md      # TypeScript 规范</span></span>
<span class="line"><span style="color:#e1e4e8;">    ├── testing.md         # 测试规范</span></span>
<span class="line"><span style="color:#e1e4e8;">    ├── api-design.md      # API 设计规范</span></span>
<span class="line"><span style="color:#e1e4e8;">    └── security.md        # 安全规范</span></span></code></pre><pre class="shiki github-light vp-code-light"><code><span class="line"><span style="color:#24292e;">.claude/</span></span>
<span class="line"><span style="color:#24292e;">└── rules/</span></span>
<span class="line"><span style="color:#24292e;">    ├── typescript.md      # TypeScript 规范</span></span>
<span class="line"><span style="color:#24292e;">    ├── testing.md         # 测试规范</span></span>
<span class="line"><span style="color:#24292e;">    ├── api-design.md      # API 设计规范</span></span>
<span class="line"><span style="color:#24292e;">    └── security.md        # 安全规范</span></span></code></pre></div><p><strong>条件作用域</strong>是这一层最关键的特性——通过 <code>paths</code> 字段声明该规则只在特定文件被编辑时才加载，避免无关规则占用上下文空间。</p><p>示例：<code>.claude/rules/testing.md</code></p><div class="language-markdown vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">markdown</span><pre class="shiki github-dark vp-code-dark"><code><span class="line"><span style="color:#E1E4E8;">---</span></span>
<span class="line"><span style="color:#85E89D;">paths</span><span style="color:#E1E4E8;">:</span></span>
<span class="line"><span style="color:#E1E4E8;">  - </span><span style="color:#9ECBFF;">&quot;src/**/*.test.ts&quot;</span></span>
<span class="line"><span style="color:#E1E4E8;">  - </span><span style="color:#9ECBFF;">&quot;tests/**/*.ts&quot;</span></span>
<span class="line"><span style="color:#E1E4E8;">---</span></span>
<span class="line"></span>
<span class="line"><span style="color:#79B8FF;font-weight:bold;"># 测试规范</span></span>
<span class="line"></span>
<span class="line"><span style="color:#79B8FF;font-weight:bold;">## 命名</span></span>
<span class="line"><span style="color:#FFAB70;">-</span><span style="color:#E1E4E8;"> 单元测试: </span><span style="color:#79B8FF;">\`*.test.ts\`</span></span>
<span class="line"><span style="color:#FFAB70;">-</span><span style="color:#E1E4E8;"> 集成测试: </span><span style="color:#79B8FF;">\`*.integration.test.ts\`</span></span>
<span class="line"></span>
<span class="line"><span style="color:#79B8FF;font-weight:bold;">## 结构</span></span>
<span class="line"><span style="color:#E1E4E8;">使用 Arrange-Act-Assert 模式：</span></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"><span style="color:#E1E4E8;">describe(&#39;OrderService&#39;, () =&gt; {</span></span>
<span class="line"><span style="color:#E1E4E8;">  describe(&#39;createOrder&#39;, () =&gt; {</span></span>
<span class="line"><span style="color:#E1E4E8;">    it(&#39;should create order when stock is available&#39;, async () =&gt; {</span></span>
<span class="line"><span style="color:#E1E4E8;">      // Arrange</span></span>
<span class="line"><span style="color:#E1E4E8;">      const mockProduct = createMockProduct({ stock: 10 });</span></span>
<span class="line"></span>
<span class="line"><span style="color:#E1E4E8;">      // Act</span></span>
<span class="line"><span style="color:#E1E4E8;">      const order = await orderService.createOrder(mockProduct.id, 1);</span></span>
<span class="line"></span>
<span class="line"><span style="color:#E1E4E8;">      // Assert</span></span>
<span class="line"><span style="color:#E1E4E8;">      expect(order.status).toBe(&#39;created&#39;);</span></span>
<span class="line"><span style="color:#E1E4E8;">    });</span></span>
<span class="line"><span style="color:#E1E4E8;">  });</span></span>
<span class="line"><span style="color:#E1E4E8;">});</span></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"><span style="color:#79B8FF;font-weight:bold;">## 覆盖率要求</span></span>
<span class="line"><span style="color:#FFAB70;">-</span><span style="color:#E1E4E8;"> 业务逻辑: &gt; 80%</span></span>
<span class="line"><span style="color:#FFAB70;">-</span><span style="color:#E1E4E8;"> 工具函数: &gt; 90%</span></span>
<span class="line"><span style="color:#FFAB70;">-</span><span style="color:#E1E4E8;"> 路由/控制器: 可以较低</span></span></code></pre><pre class="shiki github-light vp-code-light"><code><span class="line"><span style="color:#24292E;">---</span></span>
<span class="line"><span style="color:#22863A;">paths</span><span style="color:#24292E;">:</span></span>
<span class="line"><span style="color:#24292E;">  - </span><span style="color:#032F62;">&quot;src/**/*.test.ts&quot;</span></span>
<span class="line"><span style="color:#24292E;">  - </span><span style="color:#032F62;">&quot;tests/**/*.ts&quot;</span></span>
<span class="line"><span style="color:#24292E;">---</span></span>
<span class="line"></span>
<span class="line"><span style="color:#005CC5;font-weight:bold;"># 测试规范</span></span>
<span class="line"></span>
<span class="line"><span style="color:#005CC5;font-weight:bold;">## 命名</span></span>
<span class="line"><span style="color:#E36209;">-</span><span style="color:#24292E;"> 单元测试: </span><span style="color:#005CC5;">\`*.test.ts\`</span></span>
<span class="line"><span style="color:#E36209;">-</span><span style="color:#24292E;"> 集成测试: </span><span style="color:#005CC5;">\`*.integration.test.ts\`</span></span>
<span class="line"></span>
<span class="line"><span style="color:#005CC5;font-weight:bold;">## 结构</span></span>
<span class="line"><span style="color:#24292E;">使用 Arrange-Act-Assert 模式：</span></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"><span style="color:#24292E;">describe(&#39;OrderService&#39;, () =&gt; {</span></span>
<span class="line"><span style="color:#24292E;">  describe(&#39;createOrder&#39;, () =&gt; {</span></span>
<span class="line"><span style="color:#24292E;">    it(&#39;should create order when stock is available&#39;, async () =&gt; {</span></span>
<span class="line"><span style="color:#24292E;">      // Arrange</span></span>
<span class="line"><span style="color:#24292E;">      const mockProduct = createMockProduct({ stock: 10 });</span></span>
<span class="line"></span>
<span class="line"><span style="color:#24292E;">      // Act</span></span>
<span class="line"><span style="color:#24292E;">      const order = await orderService.createOrder(mockProduct.id, 1);</span></span>
<span class="line"></span>
<span class="line"><span style="color:#24292E;">      // Assert</span></span>
<span class="line"><span style="color:#24292E;">      expect(order.status).toBe(&#39;created&#39;);</span></span>
<span class="line"><span style="color:#24292E;">    });</span></span>
<span class="line"><span style="color:#24292E;">  });</span></span>
<span class="line"><span style="color:#24292E;">});</span></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"><span style="color:#005CC5;font-weight:bold;">## 覆盖率要求</span></span>
<span class="line"><span style="color:#E36209;">-</span><span style="color:#24292E;"> 业务逻辑: &gt; 80%</span></span>
<span class="line"><span style="color:#E36209;">-</span><span style="color:#24292E;"> 工具函数: &gt; 90%</span></span>
<span class="line"><span style="color:#E36209;">-</span><span style="color:#24292E;"> 路由/控制器: 可以较低</span></span></code></pre></div><blockquote><p><strong>提示</strong>：<code>paths</code> 字段让这个规则只在编辑测试文件(<em>.test.ts、tests/**/</em>.ts)时生效，不会浪费其他场景的上下文空间。</p></blockquote><h3 id="个人本地级" tabindex="-1">个人本地级 <a class="header-anchor" href="#个人本地级" aria-label="Permalink to &quot;个人本地级&quot;">​</a></h3><ul><li><strong>存放位置</strong>：<code>./CLAUDE.local.md</code></li><li><strong>使用场景</strong>：个人本地环境配置，不提交到版本库（加入 <code>.gitignore</code>）</li></ul><p>这一层适合存放只与你本地环境相关的内容，例如本地服务地址、调试用的数据库配置等：</p><div class="language-markdown vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">markdown</span><pre class="shiki github-dark vp-code-dark"><code><span class="line"><span style="color:#79B8FF;font-weight:bold;"># 本地开发笔记</span></span>
<span class="line"></span>
<span class="line"><span style="color:#79B8FF;font-weight:bold;">## 我的环境</span></span>
<span class="line"><span style="color:#FFAB70;">-</span><span style="color:#E1E4E8;"> 本地 API: http://localhost:3000</span></span>
<span class="line"><span style="color:#FFAB70;">-</span><span style="color:#E1E4E8;"> 测试数据库: order_service_dev</span></span>
<span class="line"><span style="color:#FFAB70;">-</span><span style="color:#E1E4E8;"> Redis: localhost:6379</span></span></code></pre><pre class="shiki github-light vp-code-light"><code><span class="line"><span style="color:#005CC5;font-weight:bold;"># 本地开发笔记</span></span>
<span class="line"></span>
<span class="line"><span style="color:#005CC5;font-weight:bold;">## 我的环境</span></span>
<span class="line"><span style="color:#E36209;">-</span><span style="color:#24292E;"> 本地 API: http://localhost:3000</span></span>
<span class="line"><span style="color:#E36209;">-</span><span style="color:#24292E;"> 测试数据库: order_service_dev</span></span>
<span class="line"><span style="color:#E36209;">-</span><span style="color:#24292E;"> Redis: localhost:6379</span></span></code></pre></div><h2 id="如何写好-claude-md" tabindex="-1">如何写好 CLAUDE.md <a class="header-anchor" href="#如何写好-claude-md" aria-label="Permalink to &quot;如何写好 CLAUDE.md&quot;">​</a></h2><h3 id="_1-less-is-more" tabindex="-1">1. less is more <a class="header-anchor" href="#_1-less-is-more" aria-label="Permalink to &quot;1. less is more&quot;">​</a></h3><p>CLAUDE.md 的每一行，都会在每一次对话开始时被自动注入上下文。 所以保持 精简 是十分重要的。</p><h3 id="_2-具体优于泛泛" tabindex="-1">2. 具体优于泛泛 <a class="header-anchor" href="#_2-具体优于泛泛" aria-label="Permalink to &quot;2. 具体优于泛泛&quot;">​</a></h3><p>先来看一个非常常见、但几乎没有任何效果的写法。</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki github-dark vp-code-dark"><code><span class="line"><span style="color:#e1e4e8;"># 项目规范</span></span>
<span class="line"><span style="color:#e1e4e8;">## 代码质量</span></span>
<span class="line"><span style="color:#e1e4e8;">请写出高质量的代码。</span></span>
<span class="line"><span style="color:#e1e4e8;">代码应该是可读的。</span></span>
<span class="line"><span style="color:#e1e4e8;">使用有意义的变量名。</span></span>
<span class="line"><span style="color:#e1e4e8;">保持代码整洁。遵循最佳实践。</span></span>
<span class="line"><span style="color:#e1e4e8;">不要写重复的代码。</span></span></code></pre><pre class="shiki github-light vp-code-light"><code><span class="line"><span style="color:#24292e;"># 项目规范</span></span>
<span class="line"><span style="color:#24292e;">## 代码质量</span></span>
<span class="line"><span style="color:#24292e;">请写出高质量的代码。</span></span>
<span class="line"><span style="color:#24292e;">代码应该是可读的。</span></span>
<span class="line"><span style="color:#24292e;">使用有意义的变量名。</span></span>
<span class="line"><span style="color:#24292e;">保持代码整洁。遵循最佳实践。</span></span>
<span class="line"><span style="color:#24292e;">不要写重复的代码。</span></span></code></pre></div><p>这些话虽然没有错，但其实 Claude 模型本身就知道这些。相比起来，明确告诉 Claude 你希望它具体做什么，可能效果更好。</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki github-dark vp-code-dark"><code><span class="line"><span style="color:#e1e4e8;"># 项目规范</span></span>
<span class="line"><span style="color:#e1e4e8;">## TypeScript</span></span>
<span class="line"><span style="color:#e1e4e8;">- 使用 \`interface\` 定义对象结构，\`type\` 用于联合类型</span></span>
<span class="line"><span style="color:#e1e4e8;">- 禁止 \`any\`，使用 \`unknown\` + 类型守卫</span></span>
<span class="line"><span style="color:#e1e4e8;">- 函数参数 &gt; 3 个时，使用对象参数</span></span>
<span class="line"><span style="color:#e1e4e8;"></span></span>
<span class="line"><span style="color:#e1e4e8;">## 错误处理</span></span>
<span class="line"><span style="color:#e1e4e8;">\`\`\`typescript</span></span>
<span class="line"><span style="color:#e1e4e8;">// 业务错误</span></span>
<span class="line"><span style="color:#e1e4e8;">throw new BusinessError(&#39;ORDER_NOT_FOUND&#39;, &#39;订单不存在&#39;);</span></span>
<span class="line"><span style="color:#e1e4e8;"></span></span>
<span class="line"><span style="color:#e1e4e8;">// 验证错误（Zod 自动抛出）</span></span>
<span class="line"><span style="color:#e1e4e8;">const data = orderSchema.parse(input);</span></span>
<span class="line"><span style="color:#e1e4e8;"></span></span>
<span class="line"><span style="color:#e1e4e8;">// controller 中不要 try-catch</span></span>
<span class="line"><span style="color:#e1e4e8;">// 由全局错误中间件统一处理</span></span></code></pre><pre class="shiki github-light vp-code-light"><code><span class="line"><span style="color:#24292e;"># 项目规范</span></span>
<span class="line"><span style="color:#24292e;">## TypeScript</span></span>
<span class="line"><span style="color:#24292e;">- 使用 \`interface\` 定义对象结构，\`type\` 用于联合类型</span></span>
<span class="line"><span style="color:#24292e;">- 禁止 \`any\`，使用 \`unknown\` + 类型守卫</span></span>
<span class="line"><span style="color:#24292e;">- 函数参数 &gt; 3 个时，使用对象参数</span></span>
<span class="line"><span style="color:#24292e;"></span></span>
<span class="line"><span style="color:#24292e;">## 错误处理</span></span>
<span class="line"><span style="color:#24292e;">\`\`\`typescript</span></span>
<span class="line"><span style="color:#24292e;">// 业务错误</span></span>
<span class="line"><span style="color:#24292e;">throw new BusinessError(&#39;ORDER_NOT_FOUND&#39;, &#39;订单不存在&#39;);</span></span>
<span class="line"><span style="color:#24292e;"></span></span>
<span class="line"><span style="color:#24292e;">// 验证错误（Zod 自动抛出）</span></span>
<span class="line"><span style="color:#24292e;">const data = orderSchema.parse(input);</span></span>
<span class="line"><span style="color:#24292e;"></span></span>
<span class="line"><span style="color:#24292e;">// controller 中不要 try-catch</span></span>
<span class="line"><span style="color:#24292e;">// 由全局错误中间件统一处理</span></span></code></pre></div><h3 id="_3-关键三问题-why-what-how" tabindex="-1">3. 关键三问题 WHY / WHAT / HOW <a class="header-anchor" href="#_3-关键三问题-why-what-how" aria-label="Permalink to &quot;3. 关键三问题 WHY / WHAT / HOW&quot;">​</a></h3><p>通过关键三问题 WHY / WHAT / HOW ，可以更好地指导 Claude</p><h4 id="why-为什么要这样做" tabindex="-1">WHY - 为什么要这样做？ <a class="header-anchor" href="#why-为什么要这样做" aria-label="Permalink to &quot;WHY - 为什么要这样做？&quot;">​</a></h4><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki github-dark vp-code-dark"><code><span class="line"><span style="color:#e1e4e8;">## 为什么使用 Zod？</span></span>
<span class="line"><span style="color:#e1e4e8;">- TypeScript 只有编译时类型检查</span></span>
<span class="line"><span style="color:#e1e4e8;">- API 输入需要运行时验证</span></span>
<span class="line"><span style="color:#e1e4e8;">- Zod 可以同时生成 TS 类型和验证逻辑</span></span>
<span class="line"><span style="color:#e1e4e8;">- 错误信息自动生成，对用户友好</span></span></code></pre><pre class="shiki github-light vp-code-light"><code><span class="line"><span style="color:#24292e;">## 为什么使用 Zod？</span></span>
<span class="line"><span style="color:#24292e;">- TypeScript 只有编译时类型检查</span></span>
<span class="line"><span style="color:#24292e;">- API 输入需要运行时验证</span></span>
<span class="line"><span style="color:#24292e;">- Zod 可以同时生成 TS 类型和验证逻辑</span></span>
<span class="line"><span style="color:#24292e;">- 错误信息自动生成，对用户友好</span></span></code></pre></div><p>这一部分的作用，不是让 Claude “记住一个库”，而是让它理解背后的决策逻辑。当 Claude 明白了为什么，它在面对相似但不完全相同的场景时，才更可能做出一致的判断。</p><h4 id="what-具体要做什么-不要做什么" tabindex="-1">WHAT - 具体要做什么，不要做什么？ <a class="header-anchor" href="#what-具体要做什么-不要做什么" aria-label="Permalink to &quot;WHAT - 具体要做什么，不要做什么？&quot;">​</a></h4><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki github-dark vp-code-dark"><code><span class="line"><span style="color:#e1e4e8;">## 秒杀系统的原则</span></span>
<span class="line"><span style="color:#e1e4e8;">- 请求报文、响应报文尽可能小</span></span>
<span class="line"><span style="color:#e1e4e8;">- 请求数量尽可能少</span></span>
<span class="line"><span style="color:#e1e4e8;">- 请求链路尽可能短</span></span>
<span class="line"><span style="color:#e1e4e8;">- 依赖服务尽可能少</span></span>
<span class="line"><span style="color:#e1e4e8;">- 应用服务不要单点</span></span></code></pre><pre class="shiki github-light vp-code-light"><code><span class="line"><span style="color:#24292e;">## 秒杀系统的原则</span></span>
<span class="line"><span style="color:#24292e;">- 请求报文、响应报文尽可能小</span></span>
<span class="line"><span style="color:#24292e;">- 请求数量尽可能少</span></span>
<span class="line"><span style="color:#24292e;">- 请求链路尽可能短</span></span>
<span class="line"><span style="color:#24292e;">- 依赖服务尽可能少</span></span>
<span class="line"><span style="color:#24292e;">- 应用服务不要单点</span></span></code></pre></div><p>这一部分的重点是边界。什么是允许的，什么是禁止的，决策应该发生在哪一层？ 对 Claude 来说，这比“最佳实践”四个字重要得多。</p><h4 id="how-怎么做" tabindex="-1">HOW - 怎么做？ <a class="header-anchor" href="#how-怎么做" aria-label="Permalink to &quot;HOW - 怎么做？&quot;">​</a></h4><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki github-dark vp-code-dark"><code><span class="line"><span style="color:#e1e4e8;">## 创建新 API 端点</span></span>
<span class="line"><span style="color:#e1e4e8;"></span></span>
<span class="line"><span style="color:#e1e4e8;">1. 在 \`src/schemas/\` 创建请求/响应 Zod schema</span></span>
<span class="line"><span style="color:#e1e4e8;">2. 在 \`src/routes/\` 添加路由定义</span></span>
<span class="line"><span style="color:#e1e4e8;">3. 在 \`src/controllers/\` 实现请求处理</span></span>
<span class="line"><span style="color:#e1e4e8;">4. 在 \`src/services/\` 实现业务逻辑</span></span>
<span class="line"><span style="color:#e1e4e8;">5. 在 \`tests/\` 添加测试用例</span></span>
<span class="line"><span style="color:#e1e4e8;"></span></span>
<span class="line"><span style="color:#e1e4e8;">示例参考: \`src/routes/orders.ts\`</span></span></code></pre><pre class="shiki github-light vp-code-light"><code><span class="line"><span style="color:#24292e;">## 创建新 API 端点</span></span>
<span class="line"><span style="color:#24292e;"></span></span>
<span class="line"><span style="color:#24292e;">1. 在 \`src/schemas/\` 创建请求/响应 Zod schema</span></span>
<span class="line"><span style="color:#24292e;">2. 在 \`src/routes/\` 添加路由定义</span></span>
<span class="line"><span style="color:#24292e;">3. 在 \`src/controllers/\` 实现请求处理</span></span>
<span class="line"><span style="color:#24292e;">4. 在 \`src/services/\` 实现业务逻辑</span></span>
<span class="line"><span style="color:#24292e;">5. 在 \`tests/\` 添加测试用例</span></span>
<span class="line"><span style="color:#24292e;"></span></span>
<span class="line"><span style="color:#24292e;">示例参考: \`src/routes/orders.ts\`</span></span></code></pre></div><p>明确路径、步骤清晰，让 Claude 才会稳定复用同一套工作流，而不是每次自由发挥。</p><h3 id="_4-渐进式披露-不要把一切都塞进-claude-md" tabindex="-1">4：渐进式披露：不要把一切都塞进 CLAUDE.md <a class="header-anchor" href="#_4-渐进式披露-不要把一切都塞进-claude-md" aria-label="Permalink to &quot;4：渐进式披露：不要把一切都塞进 CLAUDE.md&quot;">​</a></h3><p><strong>CLAUDE.md 定义默认决策，而不是承载全部知识</strong></p><p>对于非核心、但可能被用到的内容，正确的做法是引用。</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki github-dark vp-code-dark"><code><span class="line"><span style="color:#e1e4e8;"># 项目规范</span></span>
<span class="line"><span style="color:#e1e4e8;"></span></span>
<span class="line"><span style="color:#e1e4e8;">## 核心</span></span>
<span class="line"><span style="color:#e1e4e8;">[精简的核心规范]</span></span>
<span class="line"><span style="color:#e1e4e8;"></span></span>
<span class="line"><span style="color:#e1e4e8;">## 详细文档</span></span>
<span class="line"><span style="color:#e1e4e8;">- 数据库设计: 见 \`docs/database.md\`</span></span>
<span class="line"><span style="color:#e1e4e8;">- API 规范: 见 \`docs/api-spec.md\`</span></span>
<span class="line"><span style="color:#e1e4e8;">- 部署流程: 见 \`docs/deployment.md\`</span></span></code></pre><pre class="shiki github-light vp-code-light"><code><span class="line"><span style="color:#24292e;"># 项目规范</span></span>
<span class="line"><span style="color:#24292e;"></span></span>
<span class="line"><span style="color:#24292e;">## 核心</span></span>
<span class="line"><span style="color:#24292e;">[精简的核心规范]</span></span>
<span class="line"><span style="color:#24292e;"></span></span>
<span class="line"><span style="color:#24292e;">## 详细文档</span></span>
<span class="line"><span style="color:#24292e;">- 数据库设计: 见 \`docs/database.md\`</span></span>
<span class="line"><span style="color:#24292e;">- API 规范: 见 \`docs/api-spec.md\`</span></span>
<span class="line"><span style="color:#24292e;">- 部署流程: 见 \`docs/deployment.md\`</span></span></code></pre></div><p>这样做有两个好处：</p><ol><li>CLAUDE.md 保持精简</li><li>当 Claude 需要进一步的细节信息时，可以按需读取引用文件</li></ol><h2 id="小结" tabindex="-1">小结 <a class="header-anchor" href="#小结" aria-label="Permalink to &quot;小结&quot;">​</a></h2><p>CLAUDE.md 的本质是<strong>将隐性的项目知识显性化</strong>。你越早为项目建立这份手册，Claude Code 就越能像一位真正熟悉项目的团队成员一样工作并决策，而不是每次都需要你从头介绍。</p>`,69),t=[c];function r(i,d,y,h,u,E){return n(),a("div",null,t)}const m=s(o,[["render",r]]);export{C as __pageData,m as default};
