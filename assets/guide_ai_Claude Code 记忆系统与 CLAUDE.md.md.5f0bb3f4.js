import{_ as s,o as n,c as a,Q as l}from"./chunks/framework.b6910bb2.js";const h=JSON.parse('{"title":"Claude Code 记忆系统与 CLAUDE.md","description":"","frontmatter":{},"headers":[],"relativePath":"guide/ai/Claude Code 记忆系统与 CLAUDE.md.md","filePath":"guide/ai/Claude Code 记忆系统与 CLAUDE.md.md","lastUpdated":1773395673000}'),p={name:"guide/ai/Claude Code 记忆系统与 CLAUDE.md.md"},e=l(`<h1 id="claude-code-记忆系统与-claude-md" tabindex="-1">Claude Code 记忆系统与 CLAUDE.md <a class="header-anchor" href="#claude-code-记忆系统与-claude-md" aria-label="Permalink to &quot;Claude Code 记忆系统与 CLAUDE.md&quot;">​</a></h1><h2 id="痛点" tabindex="-1">痛点 <a class="header-anchor" href="#痛点" aria-label="Permalink to &quot;痛点&quot;">​</a></h2><p>案例：</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki github-dark vp-code-dark"><code><span class="line"><span style="color:#e1e4e8;">第一次对话：</span></span>
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
<span class="line"><span style="color:#e1e4e8;">加载项目规则  .claude/rules/*.md（条件加载）</span></span>
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
<span class="line"><span style="color:#24292e;">加载项目规则  .claude/rules/*.md（条件加载）</span></span>
<span class="line"><span style="color:#24292e;">       │</span></span>
<span class="line"><span style="color:#24292e;">       ▼</span></span>
<span class="line"><span style="color:#24292e;">加载本地级    ./CLAUDE.local.md</span></span>
<span class="line"><span style="color:#24292e;">       │</span></span>
<span class="line"><span style="color:#24292e;">       ▼</span></span>
<span class="line"><span style="color:#24292e;">进入对话，所有规则生效</span></span></code></pre></div><p>就像新员工的入职手册一样，Claude Code 每次对话时都会完成上述初始化加载，确保它始终&quot;记得&quot;你的项目上下文。</p><h2 id="五层记忆架构" tabindex="-1">五层记忆架构 <a class="header-anchor" href="#五层记忆架构" aria-label="Permalink to &quot;五层记忆架构&quot;">​</a></h2><p>类似于常见的缓存分层设计（内存缓存 → Redis 缓存 → 数据库），Claude Code 的记忆系统支持 <strong>5 层记忆</strong>，按层级结构组织，高层级的文件优先加载，为底层文件提供基础约束。</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki github-dark vp-code-dark"><code><span class="line"><span style="color:#e1e4e8;">┌─────────────────────────────────┐  优先级最高</span></span>
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
<span class="line"><span style="color:#24292e;">└─────────────────────────────────┘</span></span></code></pre></div><h3 id="企业策略" tabindex="-1">企业策略 <a class="header-anchor" href="#企业策略" aria-label="Permalink to &quot;企业策略&quot;">​</a></h3><ul><li><strong>存放位置</strong>：<code>/etc/claude-code/CLAUDE.md</code></li><li><strong>使用场景</strong>：公司编码标准、安全策略、合规要求</li></ul><p>这一层由公司 IT 或平台团队统一维护，适合在组织层面强制执行的规范，例如禁止提交密钥、代码审查流程要求等。所有成员的 Claude Code 都会自动加载，无需手动配置。</p><h3 id="用户级" tabindex="-1">用户级 <a class="header-anchor" href="#用户级" aria-label="Permalink to &quot;用户级&quot;">​</a></h3><ul><li><strong>存放位置</strong>：<code>~/.claude/CLAUDE.md</code></li><li><strong>使用场景</strong>：个人偏好、通用习惯设置</li></ul><p>无论你在哪个项目工作，这里的配置都会生效，适合放置个人的通用偏好：</p><div class="language-markdown vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">markdown</span><pre class="shiki github-dark vp-code-dark"><code><span class="line"><span style="color:#79B8FF;font-weight:bold;"># 个人偏好</span></span>
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
<span class="line"><span style="color:#E36209;">-</span><span style="color:#24292E;"> 构建：</span><span style="color:#005CC5;">\`npm run build\`</span></span></code></pre></div><h3 id="项目规则" tabindex="-1">项目规则 <a class="header-anchor" href="#项目规则" aria-label="Permalink to &quot;项目规则&quot;">​</a></h3><ul><li><strong>存放位置</strong>：<code>.claude/rules/*.md</code></li><li><strong>使用场景</strong>：支持条件作用域，适用于规则文件过长、不同文件类型需要不同规范、前后端分离等场景</li></ul><p>当 CLAUDE.md 内容越来越多，开始影响上下文效率时，可以将规则拆分到独立文件中：</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki github-dark vp-code-dark"><code><span class="line"><span style="color:#e1e4e8;">.claude/</span></span>
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
<span class="line"><span style="color:#E1E4E8;">\`\`\`typescript</span></span>
<span class="line"><span style="color:#B392F0;">describe</span><span style="color:#E1E4E8;">(</span><span style="color:#9ECBFF;">&#39;OrderService&#39;</span><span style="color:#E1E4E8;">, () </span><span style="color:#F97583;">=&gt;</span><span style="color:#E1E4E8;"> {</span></span>
<span class="line"><span style="color:#E1E4E8;">  </span><span style="color:#B392F0;">describe</span><span style="color:#E1E4E8;">(</span><span style="color:#9ECBFF;">&#39;createOrder&#39;</span><span style="color:#E1E4E8;">, () </span><span style="color:#F97583;">=&gt;</span><span style="color:#E1E4E8;"> {</span></span>
<span class="line"><span style="color:#E1E4E8;">    </span><span style="color:#B392F0;">it</span><span style="color:#E1E4E8;">(</span><span style="color:#9ECBFF;">&#39;should create order when stock is available&#39;</span><span style="color:#E1E4E8;">, </span><span style="color:#F97583;">async</span><span style="color:#E1E4E8;"> () </span><span style="color:#F97583;">=&gt;</span><span style="color:#E1E4E8;"> {</span></span>
<span class="line"><span style="color:#E1E4E8;">      </span><span style="color:#6A737D;">// Arrange</span></span>
<span class="line"><span style="color:#E1E4E8;">      </span><span style="color:#F97583;">const</span><span style="color:#E1E4E8;"> </span><span style="color:#79B8FF;">mockProduct</span><span style="color:#E1E4E8;"> </span><span style="color:#F97583;">=</span><span style="color:#E1E4E8;"> </span><span style="color:#B392F0;">createMockProduct</span><span style="color:#E1E4E8;">({ stock: </span><span style="color:#79B8FF;">10</span><span style="color:#E1E4E8;"> });</span></span>
<span class="line"></span>
<span class="line"><span style="color:#E1E4E8;">      </span><span style="color:#6A737D;">// Act</span></span>
<span class="line"><span style="color:#E1E4E8;">      </span><span style="color:#F97583;">const</span><span style="color:#E1E4E8;"> </span><span style="color:#79B8FF;">order</span><span style="color:#E1E4E8;"> </span><span style="color:#F97583;">=</span><span style="color:#E1E4E8;"> </span><span style="color:#F97583;">await</span><span style="color:#E1E4E8;"> orderService.</span><span style="color:#B392F0;">createOrder</span><span style="color:#E1E4E8;">(mockProduct.id, </span><span style="color:#79B8FF;">1</span><span style="color:#E1E4E8;">);</span></span>
<span class="line"></span>
<span class="line"><span style="color:#E1E4E8;">      </span><span style="color:#6A737D;">// Assert</span></span>
<span class="line"><span style="color:#E1E4E8;">      </span><span style="color:#B392F0;">expect</span><span style="color:#E1E4E8;">(order.status).</span><span style="color:#B392F0;">toBe</span><span style="color:#E1E4E8;">(</span><span style="color:#9ECBFF;">&#39;created&#39;</span><span style="color:#E1E4E8;">);</span></span>
<span class="line"><span style="color:#E1E4E8;">    });</span></span>
<span class="line"><span style="color:#E1E4E8;">  });</span></span>
<span class="line"><span style="color:#E1E4E8;">});</span></span>
<span class="line"><span style="color:#E1E4E8;">\`\`\`</span></span>
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
<span class="line"><span style="color:#24292E;">\`\`\`typescript</span></span>
<span class="line"><span style="color:#6F42C1;">describe</span><span style="color:#24292E;">(</span><span style="color:#032F62;">&#39;OrderService&#39;</span><span style="color:#24292E;">, () </span><span style="color:#D73A49;">=&gt;</span><span style="color:#24292E;"> {</span></span>
<span class="line"><span style="color:#24292E;">  </span><span style="color:#6F42C1;">describe</span><span style="color:#24292E;">(</span><span style="color:#032F62;">&#39;createOrder&#39;</span><span style="color:#24292E;">, () </span><span style="color:#D73A49;">=&gt;</span><span style="color:#24292E;"> {</span></span>
<span class="line"><span style="color:#24292E;">    </span><span style="color:#6F42C1;">it</span><span style="color:#24292E;">(</span><span style="color:#032F62;">&#39;should create order when stock is available&#39;</span><span style="color:#24292E;">, </span><span style="color:#D73A49;">async</span><span style="color:#24292E;"> () </span><span style="color:#D73A49;">=&gt;</span><span style="color:#24292E;"> {</span></span>
<span class="line"><span style="color:#24292E;">      </span><span style="color:#6A737D;">// Arrange</span></span>
<span class="line"><span style="color:#24292E;">      </span><span style="color:#D73A49;">const</span><span style="color:#24292E;"> </span><span style="color:#005CC5;">mockProduct</span><span style="color:#24292E;"> </span><span style="color:#D73A49;">=</span><span style="color:#24292E;"> </span><span style="color:#6F42C1;">createMockProduct</span><span style="color:#24292E;">({ stock: </span><span style="color:#005CC5;">10</span><span style="color:#24292E;"> });</span></span>
<span class="line"></span>
<span class="line"><span style="color:#24292E;">      </span><span style="color:#6A737D;">// Act</span></span>
<span class="line"><span style="color:#24292E;">      </span><span style="color:#D73A49;">const</span><span style="color:#24292E;"> </span><span style="color:#005CC5;">order</span><span style="color:#24292E;"> </span><span style="color:#D73A49;">=</span><span style="color:#24292E;"> </span><span style="color:#D73A49;">await</span><span style="color:#24292E;"> orderService.</span><span style="color:#6F42C1;">createOrder</span><span style="color:#24292E;">(mockProduct.id, </span><span style="color:#005CC5;">1</span><span style="color:#24292E;">);</span></span>
<span class="line"></span>
<span class="line"><span style="color:#24292E;">      </span><span style="color:#6A737D;">// Assert</span></span>
<span class="line"><span style="color:#24292E;">      </span><span style="color:#6F42C1;">expect</span><span style="color:#24292E;">(order.status).</span><span style="color:#6F42C1;">toBe</span><span style="color:#24292E;">(</span><span style="color:#032F62;">&#39;created&#39;</span><span style="color:#24292E;">);</span></span>
<span class="line"><span style="color:#24292E;">    });</span></span>
<span class="line"><span style="color:#24292E;">  });</span></span>
<span class="line"><span style="color:#24292E;">});</span></span>
<span class="line"><span style="color:#24292E;">\`\`\`</span></span>
<span class="line"></span>
<span class="line"><span style="color:#005CC5;font-weight:bold;">## 覆盖率要求</span></span>
<span class="line"><span style="color:#E36209;">-</span><span style="color:#24292E;"> 业务逻辑: &gt; 80%</span></span>
<span class="line"><span style="color:#E36209;">-</span><span style="color:#24292E;"> 工具函数: &gt; 90%</span></span>
<span class="line"><span style="color:#E36209;">-</span><span style="color:#24292E;"> 路由/控制器: 可以较低</span></span></code></pre></div><p><code>paths</code> 字段让这个规则<strong>只在编辑测试文件时生效</strong>，不会浪费其他场景的上下文空间。</p><h3 id="个人本地级" tabindex="-1">个人本地级 <a class="header-anchor" href="#个人本地级" aria-label="Permalink to &quot;个人本地级&quot;">​</a></h3><ul><li><strong>存放位置</strong>：<code>./CLAUDE.local.md</code></li><li><strong>使用场景</strong>：个人本地环境配置，不提交到版本库（加入 <code>.gitignore</code>）</li></ul><p>这一层适合存放只与你本地环境相关的内容，例如本地服务地址、调试用的数据库配置等：</p><div class="language-markdown vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">markdown</span><pre class="shiki github-dark vp-code-dark"><code><span class="line"><span style="color:#79B8FF;font-weight:bold;"># 本地开发笔记</span></span>
<span class="line"></span>
<span class="line"><span style="color:#79B8FF;font-weight:bold;">## 我的环境</span></span>
<span class="line"><span style="color:#FFAB70;">-</span><span style="color:#E1E4E8;"> 本地 API: http://localhost:3000</span></span>
<span class="line"><span style="color:#FFAB70;">-</span><span style="color:#E1E4E8;"> 测试数据库: order_service_dev</span></span>
<span class="line"><span style="color:#FFAB70;">-</span><span style="color:#E1E4E8;"> Redis: localhost:6379</span></span></code></pre><pre class="shiki github-light vp-code-light"><code><span class="line"><span style="color:#005CC5;font-weight:bold;"># 本地开发笔记</span></span>
<span class="line"></span>
<span class="line"><span style="color:#005CC5;font-weight:bold;">## 我的环境</span></span>
<span class="line"><span style="color:#E36209;">-</span><span style="color:#24292E;"> 本地 API: http://localhost:3000</span></span>
<span class="line"><span style="color:#E36209;">-</span><span style="color:#24292E;"> 测试数据库: order_service_dev</span></span>
<span class="line"><span style="color:#E36209;">-</span><span style="color:#24292E;"> Redis: localhost:6379</span></span></code></pre></div><h2 id="小结" tabindex="-1">小结 <a class="header-anchor" href="#小结" aria-label="Permalink to &quot;小结&quot;">​</a></h2><table><thead><tr><th>层级</th><th>路径</th><th>作用域</th><th>是否提交 Git</th></tr></thead><tbody><tr><td>企业策略</td><td><code>/etc/claude-code/CLAUDE.md</code></td><td>全公司</td><td>—</td></tr><tr><td>用户级</td><td><code>~/.claude/CLAUDE.md</code></td><td>个人全局</td><td>—</td></tr><tr><td>项目级</td><td><code>./CLAUDE.md</code></td><td>整个项目</td><td>✅</td></tr><tr><td>项目规则</td><td><code>.claude/rules/*.md</code></td><td>条件加载</td><td>✅</td></tr><tr><td>本地级</td><td><code>./CLAUDE.local.md</code></td><td>个人本地</td><td>❌</td></tr></tbody></table><p>CLAUDE.md 的本质是<strong>将隐性的项目知识显性化</strong>。你越早为项目建立这份手册，Claude Code 就越能像一位真正熟悉项目的团队成员一样工作，而不是每次都需要你从头介绍。</p>`,40),o=[e];function c(t,r,i,d,y,E){return n(),a("div",null,o)}const C=s(p,[["render",c]]);export{h as __pageData,C as default};
