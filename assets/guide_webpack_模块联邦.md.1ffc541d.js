import{_ as a,o as l,c as p,Q as n,k as s}from"./chunks/framework.b6910bb2.js";const o="/vitePress-blob/assets/3.6834884f.png",e="/vitePress-blob/assets/4.ca1b5ab5.png",t="/vitePress-blob/assets/5.ccaac5d9.png",B=JSON.parse('{"title":"模块联邦","description":"","frontmatter":{},"headers":[],"relativePath":"guide/webpack/模块联邦.md","filePath":"guide/webpack/模块联邦.md","lastUpdated":1708569083000}'),c={name:"guide/webpack/模块联邦.md"},r=n('<h1 id="模块联邦" tabindex="-1">模块联邦 <a class="header-anchor" href="#模块联邦" aria-label="Permalink to &quot;模块联邦&quot;">​</a></h1><h2 id="目的" tabindex="-1">目的 <a class="header-anchor" href="#目的" aria-label="Permalink to &quot;目的&quot;">​</a></h2><p>更好的复用应用块或者库</p><p>每个应用块都是独立构建，被称之为容器</p><p><img src="'+o+'" alt="Module Federation"></p><p>一个被引用的容器被称之为 remote</p><p>引用者被称之为 host</p><h2 id="配置参数" tabindex="-1">配置参数 <a class="header-anchor" href="#配置参数" aria-label="Permalink to &quot;配置参数&quot;">​</a></h2>',8),E=s("table",null,[s("thead",null,[s("tr",null,[s("th",null,"字段"),s("th",null,"类型"),s("th",null,"含义")])]),s("tbody",null,[s("tr",{expose:""},[s("td",null,"name"),s("td",null,"string"),s("td",null,"必传值，即输出的模块名，被远程引用时的路径为 ${name}/$")]),s("tr",null,[s("td",null,"library"),s("td",null,"object"),s("td",null,"声明全局变量的方式，name为 umd 的name")]),s("tr",null,[s("td",null,"filename"),s("td",null,"string"),s("td",null,"构建输出的文件名称")]),s("tr",null,[s("td",null,"remotes"),s("td",null,"object"),s("td",null,"（host 使用）远程引用的应用名及其别名的映射，使用时以 key 值作为 name")]),s("tr",null,[s("td",null,"exposes"),s("td",null,"object"),s("td",null,"（remote 使用）被引用时可暴露的资源路径以其别名")]),s("tr",null,[s("td",null,"shared"),s("td",null,"object"),s("td",null,"与其他应用之间可以共享的第三方依赖，使你的代码中不用重复加载同一份依赖")])])],-1),y=n(`<h2 id="remote-配置" tabindex="-1">remote 配置 <a class="header-anchor" href="#remote-配置" aria-label="Permalink to &quot;remote 配置&quot;">​</a></h2><div class="language-js vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">js</span><pre class="shiki github-dark vp-code-dark"><code><span class="line"><span style="color:#6A737D;">// webpack.config.js</span></span>
<span class="line"><span style="color:#F97583;">const</span><span style="color:#E1E4E8;"> </span><span style="color:#79B8FF;">path</span><span style="color:#E1E4E8;"> </span><span style="color:#F97583;">=</span><span style="color:#E1E4E8;"> </span><span style="color:#B392F0;">require</span><span style="color:#E1E4E8;">(</span><span style="color:#9ECBFF;">&quot;path&quot;</span><span style="color:#E1E4E8;">);</span></span>
<span class="line"><span style="color:#F97583;">const</span><span style="color:#E1E4E8;"> </span><span style="color:#79B8FF;">webpack</span><span style="color:#E1E4E8;"> </span><span style="color:#F97583;">=</span><span style="color:#E1E4E8;"> </span><span style="color:#B392F0;">require</span><span style="color:#E1E4E8;">(</span><span style="color:#9ECBFF;">&quot;webpack&quot;</span><span style="color:#E1E4E8;">);</span></span>
<span class="line"><span style="color:#F97583;">const</span><span style="color:#E1E4E8;"> </span><span style="color:#79B8FF;">HtmlWebpackPlugin</span><span style="color:#E1E4E8;"> </span><span style="color:#F97583;">=</span><span style="color:#E1E4E8;"> </span><span style="color:#B392F0;">require</span><span style="color:#E1E4E8;">(</span><span style="color:#9ECBFF;">&quot;html-webpack-plugin&quot;</span><span style="color:#E1E4E8;">);</span></span>
<span class="line"><span style="color:#F97583;">const</span><span style="color:#E1E4E8;"> </span><span style="color:#79B8FF;">ModuleFederationPlugin</span><span style="color:#E1E4E8;"> </span><span style="color:#F97583;">=</span><span style="color:#E1E4E8;"> </span><span style="color:#B392F0;">require</span><span style="color:#E1E4E8;">(</span><span style="color:#9ECBFF;">&quot;webpack/lib/container/ModuleFederationPlugin&quot;</span><span style="color:#E1E4E8;">);</span></span>
<span class="line"></span>
<span class="line"><span style="color:#79B8FF;">module</span><span style="color:#E1E4E8;">.</span><span style="color:#79B8FF;">exports</span><span style="color:#E1E4E8;"> </span><span style="color:#F97583;">=</span><span style="color:#E1E4E8;"> {</span></span>
<span class="line"><span style="color:#E1E4E8;">  mode: </span><span style="color:#9ECBFF;">&quot;development&quot;</span><span style="color:#E1E4E8;">,</span></span>
<span class="line"><span style="color:#E1E4E8;">  entry: </span><span style="color:#9ECBFF;">&quot;./src/index.js&quot;</span><span style="color:#E1E4E8;">,</span></span>
<span class="line"><span style="color:#E1E4E8;">  output: {</span></span>
<span class="line"><span style="color:#E1E4E8;">    publicPath: </span><span style="color:#9ECBFF;">&quot;http://localhost:3000/&quot;</span><span style="color:#E1E4E8;">,</span></span>
<span class="line"><span style="color:#E1E4E8;">  },</span></span>
<span class="line"><span style="color:#E1E4E8;">  devServer: {</span></span>
<span class="line"><span style="color:#E1E4E8;">    port: </span><span style="color:#79B8FF;">3000</span><span style="color:#E1E4E8;">,</span></span>
<span class="line"><span style="color:#E1E4E8;">  },</span></span>
<span class="line"><span style="color:#E1E4E8;">  module: {</span></span>
<span class="line"><span style="color:#E1E4E8;">    rules: [</span></span>
<span class="line"><span style="color:#E1E4E8;">      {</span></span>
<span class="line"><span style="color:#E1E4E8;">        test:</span><span style="color:#DBEDFF;"> </span><span style="color:#9ECBFF;">/</span><span style="color:#85E89D;font-weight:bold;">\\.</span><span style="color:#DBEDFF;">jsx</span><span style="color:#F97583;">?$</span><span style="color:#9ECBFF;">/</span><span style="color:#E1E4E8;">,</span></span>
<span class="line"><span style="color:#E1E4E8;">        use: {</span></span>
<span class="line"><span style="color:#E1E4E8;">          loader: </span><span style="color:#9ECBFF;">&quot;babel-loader&quot;</span><span style="color:#E1E4E8;">,</span></span>
<span class="line"><span style="color:#E1E4E8;">          options: {</span></span>
<span class="line"><span style="color:#E1E4E8;">            presets: [</span><span style="color:#9ECBFF;">&quot;@babel/preset-react&quot;</span><span style="color:#E1E4E8;">],</span></span>
<span class="line"><span style="color:#E1E4E8;">          },</span></span>
<span class="line"><span style="color:#E1E4E8;">        },</span></span>
<span class="line"><span style="color:#E1E4E8;">        exclude:</span><span style="color:#DBEDFF;"> </span><span style="color:#9ECBFF;">/</span><span style="color:#DBEDFF;">node_modules</span><span style="color:#9ECBFF;">/</span><span style="color:#E1E4E8;">,</span></span>
<span class="line"><span style="color:#E1E4E8;">      },</span></span>
<span class="line"><span style="color:#E1E4E8;">    ],</span></span>
<span class="line"><span style="color:#E1E4E8;">  },</span></span>
<span class="line"><span style="color:#E1E4E8;">  plugins: [</span></span>
<span class="line"><span style="color:#E1E4E8;">    </span><span style="color:#F97583;">new</span><span style="color:#E1E4E8;"> </span><span style="color:#B392F0;">HtmlWebpackPlugin</span><span style="color:#E1E4E8;">({</span></span>
<span class="line"><span style="color:#E1E4E8;">      template: </span><span style="color:#9ECBFF;">&quot;./public/index.html&quot;</span><span style="color:#E1E4E8;">,</span></span>
<span class="line"><span style="color:#E1E4E8;">    }),</span></span>
<span class="line"><span style="color:#E1E4E8;">    </span><span style="color:#F97583;">new</span><span style="color:#E1E4E8;"> </span><span style="color:#B392F0;">ModuleFederationPlugin</span><span style="color:#E1E4E8;">({</span></span>
<span class="line"><span style="color:#E1E4E8;">      filename: </span><span style="color:#9ECBFF;">&quot;remoteEntry.js&quot;</span><span style="color:#E1E4E8;">, </span><span style="color:#6A737D;">// 输出的文件</span></span>
<span class="line"><span style="color:#E1E4E8;">      name: </span><span style="color:#9ECBFF;">&quot;remote&quot;</span><span style="color:#E1E4E8;">, </span><span style="color:#6A737D;">// 被远程引用的路径为 \`\${name}/\${expose}\`, 例如 remote/NewsList</span></span>
<span class="line"><span style="color:#E1E4E8;">      exposes: {</span></span>
<span class="line"><span style="color:#E1E4E8;">        </span><span style="color:#9ECBFF;">&quot;./NewsList&quot;</span><span style="color:#E1E4E8;">: </span><span style="color:#9ECBFF;">&quot;./src/NewsList&quot;</span><span style="color:#E1E4E8;">,</span></span>
<span class="line"><span style="color:#E1E4E8;">      },</span></span>
<span class="line"><span style="color:#E1E4E8;">      shared: [</span><span style="color:#9ECBFF;">&quot;react&quot;</span><span style="color:#E1E4E8;">, </span><span style="color:#9ECBFF;">&quot;react-dom&quot;</span><span style="color:#E1E4E8;">], </span><span style="color:#6A737D;">// 共享代码块</span></span>
<span class="line"><span style="color:#E1E4E8;">    }),</span></span>
<span class="line"><span style="color:#E1E4E8;">  ],</span></span>
<span class="line"><span style="color:#E1E4E8;">};</span></span></code></pre><pre class="shiki github-light vp-code-light"><code><span class="line"><span style="color:#6A737D;">// webpack.config.js</span></span>
<span class="line"><span style="color:#D73A49;">const</span><span style="color:#24292E;"> </span><span style="color:#005CC5;">path</span><span style="color:#24292E;"> </span><span style="color:#D73A49;">=</span><span style="color:#24292E;"> </span><span style="color:#6F42C1;">require</span><span style="color:#24292E;">(</span><span style="color:#032F62;">&quot;path&quot;</span><span style="color:#24292E;">);</span></span>
<span class="line"><span style="color:#D73A49;">const</span><span style="color:#24292E;"> </span><span style="color:#005CC5;">webpack</span><span style="color:#24292E;"> </span><span style="color:#D73A49;">=</span><span style="color:#24292E;"> </span><span style="color:#6F42C1;">require</span><span style="color:#24292E;">(</span><span style="color:#032F62;">&quot;webpack&quot;</span><span style="color:#24292E;">);</span></span>
<span class="line"><span style="color:#D73A49;">const</span><span style="color:#24292E;"> </span><span style="color:#005CC5;">HtmlWebpackPlugin</span><span style="color:#24292E;"> </span><span style="color:#D73A49;">=</span><span style="color:#24292E;"> </span><span style="color:#6F42C1;">require</span><span style="color:#24292E;">(</span><span style="color:#032F62;">&quot;html-webpack-plugin&quot;</span><span style="color:#24292E;">);</span></span>
<span class="line"><span style="color:#D73A49;">const</span><span style="color:#24292E;"> </span><span style="color:#005CC5;">ModuleFederationPlugin</span><span style="color:#24292E;"> </span><span style="color:#D73A49;">=</span><span style="color:#24292E;"> </span><span style="color:#6F42C1;">require</span><span style="color:#24292E;">(</span><span style="color:#032F62;">&quot;webpack/lib/container/ModuleFederationPlugin&quot;</span><span style="color:#24292E;">);</span></span>
<span class="line"></span>
<span class="line"><span style="color:#005CC5;">module</span><span style="color:#24292E;">.</span><span style="color:#005CC5;">exports</span><span style="color:#24292E;"> </span><span style="color:#D73A49;">=</span><span style="color:#24292E;"> {</span></span>
<span class="line"><span style="color:#24292E;">  mode: </span><span style="color:#032F62;">&quot;development&quot;</span><span style="color:#24292E;">,</span></span>
<span class="line"><span style="color:#24292E;">  entry: </span><span style="color:#032F62;">&quot;./src/index.js&quot;</span><span style="color:#24292E;">,</span></span>
<span class="line"><span style="color:#24292E;">  output: {</span></span>
<span class="line"><span style="color:#24292E;">    publicPath: </span><span style="color:#032F62;">&quot;http://localhost:3000/&quot;</span><span style="color:#24292E;">,</span></span>
<span class="line"><span style="color:#24292E;">  },</span></span>
<span class="line"><span style="color:#24292E;">  devServer: {</span></span>
<span class="line"><span style="color:#24292E;">    port: </span><span style="color:#005CC5;">3000</span><span style="color:#24292E;">,</span></span>
<span class="line"><span style="color:#24292E;">  },</span></span>
<span class="line"><span style="color:#24292E;">  module: {</span></span>
<span class="line"><span style="color:#24292E;">    rules: [</span></span>
<span class="line"><span style="color:#24292E;">      {</span></span>
<span class="line"><span style="color:#24292E;">        test:</span><span style="color:#032F62;"> /</span><span style="color:#22863A;font-weight:bold;">\\.</span><span style="color:#032F62;">jsx</span><span style="color:#D73A49;">?$</span><span style="color:#032F62;">/</span><span style="color:#24292E;">,</span></span>
<span class="line"><span style="color:#24292E;">        use: {</span></span>
<span class="line"><span style="color:#24292E;">          loader: </span><span style="color:#032F62;">&quot;babel-loader&quot;</span><span style="color:#24292E;">,</span></span>
<span class="line"><span style="color:#24292E;">          options: {</span></span>
<span class="line"><span style="color:#24292E;">            presets: [</span><span style="color:#032F62;">&quot;@babel/preset-react&quot;</span><span style="color:#24292E;">],</span></span>
<span class="line"><span style="color:#24292E;">          },</span></span>
<span class="line"><span style="color:#24292E;">        },</span></span>
<span class="line"><span style="color:#24292E;">        exclude:</span><span style="color:#032F62;"> /node_modules/</span><span style="color:#24292E;">,</span></span>
<span class="line"><span style="color:#24292E;">      },</span></span>
<span class="line"><span style="color:#24292E;">    ],</span></span>
<span class="line"><span style="color:#24292E;">  },</span></span>
<span class="line"><span style="color:#24292E;">  plugins: [</span></span>
<span class="line"><span style="color:#24292E;">    </span><span style="color:#D73A49;">new</span><span style="color:#24292E;"> </span><span style="color:#6F42C1;">HtmlWebpackPlugin</span><span style="color:#24292E;">({</span></span>
<span class="line"><span style="color:#24292E;">      template: </span><span style="color:#032F62;">&quot;./public/index.html&quot;</span><span style="color:#24292E;">,</span></span>
<span class="line"><span style="color:#24292E;">    }),</span></span>
<span class="line"><span style="color:#24292E;">    </span><span style="color:#D73A49;">new</span><span style="color:#24292E;"> </span><span style="color:#6F42C1;">ModuleFederationPlugin</span><span style="color:#24292E;">({</span></span>
<span class="line"><span style="color:#24292E;">      filename: </span><span style="color:#032F62;">&quot;remoteEntry.js&quot;</span><span style="color:#24292E;">, </span><span style="color:#6A737D;">// 输出的文件</span></span>
<span class="line"><span style="color:#24292E;">      name: </span><span style="color:#032F62;">&quot;remote&quot;</span><span style="color:#24292E;">, </span><span style="color:#6A737D;">// 被远程引用的路径为 \`\${name}/\${expose}\`, 例如 remote/NewsList</span></span>
<span class="line"><span style="color:#24292E;">      exposes: {</span></span>
<span class="line"><span style="color:#24292E;">        </span><span style="color:#032F62;">&quot;./NewsList&quot;</span><span style="color:#24292E;">: </span><span style="color:#032F62;">&quot;./src/NewsList&quot;</span><span style="color:#24292E;">,</span></span>
<span class="line"><span style="color:#24292E;">      },</span></span>
<span class="line"><span style="color:#24292E;">      shared: [</span><span style="color:#032F62;">&quot;react&quot;</span><span style="color:#24292E;">, </span><span style="color:#032F62;">&quot;react-dom&quot;</span><span style="color:#24292E;">], </span><span style="color:#6A737D;">// 共享代码块</span></span>
<span class="line"><span style="color:#24292E;">    }),</span></span>
<span class="line"><span style="color:#24292E;">  ],</span></span>
<span class="line"><span style="color:#24292E;">};</span></span></code></pre></div><h2 id="host-配置" tabindex="-1">host 配置 <a class="header-anchor" href="#host-配置" aria-label="Permalink to &quot;host 配置&quot;">​</a></h2><div class="language-js vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">js</span><pre class="shiki github-dark vp-code-dark"><code><span class="line"><span style="color:#F97583;">const</span><span style="color:#E1E4E8;"> </span><span style="color:#79B8FF;">path</span><span style="color:#E1E4E8;"> </span><span style="color:#F97583;">=</span><span style="color:#E1E4E8;"> </span><span style="color:#B392F0;">require</span><span style="color:#E1E4E8;">(</span><span style="color:#9ECBFF;">&quot;path&quot;</span><span style="color:#E1E4E8;">);</span></span>
<span class="line"><span style="color:#F97583;">const</span><span style="color:#E1E4E8;"> </span><span style="color:#79B8FF;">webpack</span><span style="color:#E1E4E8;"> </span><span style="color:#F97583;">=</span><span style="color:#E1E4E8;"> </span><span style="color:#B392F0;">require</span><span style="color:#E1E4E8;">(</span><span style="color:#9ECBFF;">&quot;webpack&quot;</span><span style="color:#E1E4E8;">);</span></span>
<span class="line"><span style="color:#F97583;">const</span><span style="color:#E1E4E8;"> </span><span style="color:#79B8FF;">HtmlWebpackPlugin</span><span style="color:#E1E4E8;"> </span><span style="color:#F97583;">=</span><span style="color:#E1E4E8;"> </span><span style="color:#B392F0;">require</span><span style="color:#E1E4E8;">(</span><span style="color:#9ECBFF;">&quot;html-webpack-plugin&quot;</span><span style="color:#E1E4E8;">);</span></span>
<span class="line"><span style="color:#F97583;">const</span><span style="color:#E1E4E8;"> </span><span style="color:#79B8FF;">ModuleFederationPlugin</span><span style="color:#E1E4E8;"> </span><span style="color:#F97583;">=</span><span style="color:#E1E4E8;"> </span><span style="color:#B392F0;">require</span><span style="color:#E1E4E8;">(</span><span style="color:#9ECBFF;">&quot;webpack/lib/container/ModuleFederationPlugin&quot;</span><span style="color:#E1E4E8;">);</span></span>
<span class="line"></span>
<span class="line"><span style="color:#79B8FF;">module</span><span style="color:#E1E4E8;">.</span><span style="color:#79B8FF;">exports</span><span style="color:#E1E4E8;"> </span><span style="color:#F97583;">=</span><span style="color:#E1E4E8;"> {</span></span>
<span class="line"><span style="color:#E1E4E8;">  mode: </span><span style="color:#9ECBFF;">&quot;development&quot;</span><span style="color:#E1E4E8;">,</span></span>
<span class="line"><span style="color:#E1E4E8;">  entry: </span><span style="color:#9ECBFF;">&quot;./src/index.js&quot;</span><span style="color:#E1E4E8;">,</span></span>
<span class="line"><span style="color:#E1E4E8;">  output: {</span></span>
<span class="line"><span style="color:#E1E4E8;">    publicPath: </span><span style="color:#9ECBFF;">&quot;http://localhost:3001/&quot;</span><span style="color:#E1E4E8;">,</span></span>
<span class="line"><span style="color:#E1E4E8;">  },</span></span>
<span class="line"><span style="color:#E1E4E8;">  devServer: {</span></span>
<span class="line"><span style="color:#E1E4E8;">    port: </span><span style="color:#79B8FF;">3001</span><span style="color:#E1E4E8;">,</span></span>
<span class="line"><span style="color:#E1E4E8;">  },</span></span>
<span class="line"><span style="color:#E1E4E8;">  module: {</span></span>
<span class="line"><span style="color:#E1E4E8;">    rules: [</span></span>
<span class="line"><span style="color:#E1E4E8;">      {</span></span>
<span class="line"><span style="color:#E1E4E8;">        test:</span><span style="color:#DBEDFF;"> </span><span style="color:#9ECBFF;">/</span><span style="color:#85E89D;font-weight:bold;">\\.</span><span style="color:#DBEDFF;">jsx</span><span style="color:#F97583;">?$</span><span style="color:#9ECBFF;">/</span><span style="color:#E1E4E8;">,</span></span>
<span class="line"><span style="color:#E1E4E8;">        use: {</span></span>
<span class="line"><span style="color:#E1E4E8;">          loader: </span><span style="color:#9ECBFF;">&quot;babel-loader&quot;</span><span style="color:#E1E4E8;">,</span></span>
<span class="line"><span style="color:#E1E4E8;">          options: {</span></span>
<span class="line"><span style="color:#E1E4E8;">            presets: [</span><span style="color:#9ECBFF;">&quot;@babel/preset-react&quot;</span><span style="color:#E1E4E8;">],</span></span>
<span class="line"><span style="color:#E1E4E8;">          },</span></span>
<span class="line"><span style="color:#E1E4E8;">        },</span></span>
<span class="line"><span style="color:#E1E4E8;">        exclude:</span><span style="color:#DBEDFF;"> </span><span style="color:#9ECBFF;">/</span><span style="color:#DBEDFF;">node_modules</span><span style="color:#9ECBFF;">/</span><span style="color:#E1E4E8;">,</span></span>
<span class="line"><span style="color:#E1E4E8;">      },</span></span>
<span class="line"><span style="color:#E1E4E8;">    ],</span></span>
<span class="line"><span style="color:#E1E4E8;">  },</span></span>
<span class="line"><span style="color:#E1E4E8;">  plugins: [</span></span>
<span class="line"><span style="color:#E1E4E8;">    </span><span style="color:#F97583;">new</span><span style="color:#E1E4E8;"> </span><span style="color:#B392F0;">HtmlWebpackPlugin</span><span style="color:#E1E4E8;">({</span></span>
<span class="line"><span style="color:#E1E4E8;">      template: </span><span style="color:#9ECBFF;">&quot;./public/index.html&quot;</span><span style="color:#E1E4E8;">,</span></span>
<span class="line"><span style="color:#E1E4E8;">    }),</span></span>
<span class="line"><span style="color:#E1E4E8;">    </span><span style="color:#F97583;">new</span><span style="color:#E1E4E8;"> </span><span style="color:#B392F0;">ModuleFederationPlugin</span><span style="color:#E1E4E8;">({</span></span>
<span class="line"><span style="color:#E1E4E8;">      name: </span><span style="color:#9ECBFF;">&quot;host&quot;</span><span style="color:#E1E4E8;">,</span></span>
<span class="line"><span style="color:#E1E4E8;">      filename: </span><span style="color:#9ECBFF;">&quot;remoteEntry.js&quot;</span><span style="color:#E1E4E8;">,</span></span>
<span class="line"><span style="color:#E1E4E8;">      remotes: {</span></span>
<span class="line"><span style="color:#E1E4E8;">        remote: </span><span style="color:#9ECBFF;">&quot;remote@http://localhost:3000/remoteEntry.js&quot;</span><span style="color:#E1E4E8;">, </span><span style="color:#6A737D;">// 引用的模块</span></span>
<span class="line"><span style="color:#E1E4E8;">      },</span></span>
<span class="line"><span style="color:#E1E4E8;">      shared: [</span><span style="color:#9ECBFF;">&quot;react&quot;</span><span style="color:#E1E4E8;">, </span><span style="color:#9ECBFF;">&quot;react-dom&quot;</span><span style="color:#E1E4E8;">], </span><span style="color:#6A737D;">// 共享代码块</span></span>
<span class="line"><span style="color:#E1E4E8;">      </span><span style="color:#6A737D;">// or</span></span>
<span class="line"><span style="color:#E1E4E8;">      </span><span style="color:#6A737D;">/**</span></span>
<span class="line"><span style="color:#6A737D;">      shared: { // 如果是存在 shared 共享代码块得通过 bootstrap 动态引入 - https://webpack.js.org/concepts/module-federation/</span></span>
<span class="line"><span style="color:#6A737D;">        react: { singleton: true }, // 单例</span></span>
<span class="line"><span style="color:#6A737D;">        &#39;react-dom&#39;: { singleton: true }, // 单例</span></span>
<span class="line"><span style="color:#6A737D;">      }, // 共享代码块</span></span>
<span class="line"><span style="color:#6A737D;">       */</span></span>
<span class="line"><span style="color:#E1E4E8;">    }),</span></span>
<span class="line"><span style="color:#E1E4E8;">  ],</span></span>
<span class="line"><span style="color:#E1E4E8;">};</span></span></code></pre><pre class="shiki github-light vp-code-light"><code><span class="line"><span style="color:#D73A49;">const</span><span style="color:#24292E;"> </span><span style="color:#005CC5;">path</span><span style="color:#24292E;"> </span><span style="color:#D73A49;">=</span><span style="color:#24292E;"> </span><span style="color:#6F42C1;">require</span><span style="color:#24292E;">(</span><span style="color:#032F62;">&quot;path&quot;</span><span style="color:#24292E;">);</span></span>
<span class="line"><span style="color:#D73A49;">const</span><span style="color:#24292E;"> </span><span style="color:#005CC5;">webpack</span><span style="color:#24292E;"> </span><span style="color:#D73A49;">=</span><span style="color:#24292E;"> </span><span style="color:#6F42C1;">require</span><span style="color:#24292E;">(</span><span style="color:#032F62;">&quot;webpack&quot;</span><span style="color:#24292E;">);</span></span>
<span class="line"><span style="color:#D73A49;">const</span><span style="color:#24292E;"> </span><span style="color:#005CC5;">HtmlWebpackPlugin</span><span style="color:#24292E;"> </span><span style="color:#D73A49;">=</span><span style="color:#24292E;"> </span><span style="color:#6F42C1;">require</span><span style="color:#24292E;">(</span><span style="color:#032F62;">&quot;html-webpack-plugin&quot;</span><span style="color:#24292E;">);</span></span>
<span class="line"><span style="color:#D73A49;">const</span><span style="color:#24292E;"> </span><span style="color:#005CC5;">ModuleFederationPlugin</span><span style="color:#24292E;"> </span><span style="color:#D73A49;">=</span><span style="color:#24292E;"> </span><span style="color:#6F42C1;">require</span><span style="color:#24292E;">(</span><span style="color:#032F62;">&quot;webpack/lib/container/ModuleFederationPlugin&quot;</span><span style="color:#24292E;">);</span></span>
<span class="line"></span>
<span class="line"><span style="color:#005CC5;">module</span><span style="color:#24292E;">.</span><span style="color:#005CC5;">exports</span><span style="color:#24292E;"> </span><span style="color:#D73A49;">=</span><span style="color:#24292E;"> {</span></span>
<span class="line"><span style="color:#24292E;">  mode: </span><span style="color:#032F62;">&quot;development&quot;</span><span style="color:#24292E;">,</span></span>
<span class="line"><span style="color:#24292E;">  entry: </span><span style="color:#032F62;">&quot;./src/index.js&quot;</span><span style="color:#24292E;">,</span></span>
<span class="line"><span style="color:#24292E;">  output: {</span></span>
<span class="line"><span style="color:#24292E;">    publicPath: </span><span style="color:#032F62;">&quot;http://localhost:3001/&quot;</span><span style="color:#24292E;">,</span></span>
<span class="line"><span style="color:#24292E;">  },</span></span>
<span class="line"><span style="color:#24292E;">  devServer: {</span></span>
<span class="line"><span style="color:#24292E;">    port: </span><span style="color:#005CC5;">3001</span><span style="color:#24292E;">,</span></span>
<span class="line"><span style="color:#24292E;">  },</span></span>
<span class="line"><span style="color:#24292E;">  module: {</span></span>
<span class="line"><span style="color:#24292E;">    rules: [</span></span>
<span class="line"><span style="color:#24292E;">      {</span></span>
<span class="line"><span style="color:#24292E;">        test:</span><span style="color:#032F62;"> /</span><span style="color:#22863A;font-weight:bold;">\\.</span><span style="color:#032F62;">jsx</span><span style="color:#D73A49;">?$</span><span style="color:#032F62;">/</span><span style="color:#24292E;">,</span></span>
<span class="line"><span style="color:#24292E;">        use: {</span></span>
<span class="line"><span style="color:#24292E;">          loader: </span><span style="color:#032F62;">&quot;babel-loader&quot;</span><span style="color:#24292E;">,</span></span>
<span class="line"><span style="color:#24292E;">          options: {</span></span>
<span class="line"><span style="color:#24292E;">            presets: [</span><span style="color:#032F62;">&quot;@babel/preset-react&quot;</span><span style="color:#24292E;">],</span></span>
<span class="line"><span style="color:#24292E;">          },</span></span>
<span class="line"><span style="color:#24292E;">        },</span></span>
<span class="line"><span style="color:#24292E;">        exclude:</span><span style="color:#032F62;"> /node_modules/</span><span style="color:#24292E;">,</span></span>
<span class="line"><span style="color:#24292E;">      },</span></span>
<span class="line"><span style="color:#24292E;">    ],</span></span>
<span class="line"><span style="color:#24292E;">  },</span></span>
<span class="line"><span style="color:#24292E;">  plugins: [</span></span>
<span class="line"><span style="color:#24292E;">    </span><span style="color:#D73A49;">new</span><span style="color:#24292E;"> </span><span style="color:#6F42C1;">HtmlWebpackPlugin</span><span style="color:#24292E;">({</span></span>
<span class="line"><span style="color:#24292E;">      template: </span><span style="color:#032F62;">&quot;./public/index.html&quot;</span><span style="color:#24292E;">,</span></span>
<span class="line"><span style="color:#24292E;">    }),</span></span>
<span class="line"><span style="color:#24292E;">    </span><span style="color:#D73A49;">new</span><span style="color:#24292E;"> </span><span style="color:#6F42C1;">ModuleFederationPlugin</span><span style="color:#24292E;">({</span></span>
<span class="line"><span style="color:#24292E;">      name: </span><span style="color:#032F62;">&quot;host&quot;</span><span style="color:#24292E;">,</span></span>
<span class="line"><span style="color:#24292E;">      filename: </span><span style="color:#032F62;">&quot;remoteEntry.js&quot;</span><span style="color:#24292E;">,</span></span>
<span class="line"><span style="color:#24292E;">      remotes: {</span></span>
<span class="line"><span style="color:#24292E;">        remote: </span><span style="color:#032F62;">&quot;remote@http://localhost:3000/remoteEntry.js&quot;</span><span style="color:#24292E;">, </span><span style="color:#6A737D;">// 引用的模块</span></span>
<span class="line"><span style="color:#24292E;">      },</span></span>
<span class="line"><span style="color:#24292E;">      shared: [</span><span style="color:#032F62;">&quot;react&quot;</span><span style="color:#24292E;">, </span><span style="color:#032F62;">&quot;react-dom&quot;</span><span style="color:#24292E;">], </span><span style="color:#6A737D;">// 共享代码块</span></span>
<span class="line"><span style="color:#24292E;">      </span><span style="color:#6A737D;">// or</span></span>
<span class="line"><span style="color:#24292E;">      </span><span style="color:#6A737D;">/**</span></span>
<span class="line"><span style="color:#6A737D;">      shared: { // 如果是存在 shared 共享代码块得通过 bootstrap 动态引入 - https://webpack.js.org/concepts/module-federation/</span></span>
<span class="line"><span style="color:#6A737D;">        react: { singleton: true }, // 单例</span></span>
<span class="line"><span style="color:#6A737D;">        &#39;react-dom&#39;: { singleton: true }, // 单例</span></span>
<span class="line"><span style="color:#6A737D;">      }, // 共享代码块</span></span>
<span class="line"><span style="color:#6A737D;">       */</span></span>
<span class="line"><span style="color:#24292E;">    }),</span></span>
<span class="line"><span style="color:#24292E;">  ],</span></span>
<span class="line"><span style="color:#24292E;">};</span></span></code></pre></div><p>host 和 remote 的区别在于： host 通过 remotes 引入模块 remote 通过 exposes 导出模块</p><p>如果是存在 shared 共享代码块得通过 bootstrap 动态引入 - <a href="https://webpack.js.org/concepts/module-federation/" target="_blank" rel="noreferrer">https://webpack.js.org/concepts/module-federation/</a></p><h2 id="项目应用图" tabindex="-1">项目应用图 <a class="header-anchor" href="#项目应用图" aria-label="Permalink to &quot;项目应用图&quot;">​</a></h2><p><img src="`+e+'" alt="项目应用图"></p><h2 id="案例代码" tabindex="-1">案例代码 <a class="header-anchor" href="#案例代码" aria-label="Permalink to &quot;案例代码&quot;">​</a></h2><p><a href="https://github.com/enson0131/learn/tree/main/%E6%A8%A1%E5%9D%97%E8%81%94%E9%82%A6" target="_blank" rel="noreferrer">案例代码</a></p><h2 id="原理" tabindex="-1">原理 <a class="header-anchor" href="#原理" aria-label="Permalink to &quot;原理&quot;">​</a></h2><p><img src="'+t+'" alt="项目应用图"></p><p>remote 通过 exposes 导出模块 host 通过 remotes 引入远程模块</p><p>若存在共享依赖会存储到同一个变量中（require.S）, 这个变量（require.S） 存放各个作用域下的共享模块， 可以通过 作用域名（scopeName）、包名（key）、版本 (version) 再去获取对应的共享模块合如 modules 中</p><p><a href="https://github.com/enson0131/learn/blob/main/%E6%A8%A1%E5%9D%97%E8%81%94%E9%82%A6/remote/serve/remoteEntry.js" target="_blank" rel="noreferrer">案例代码</a></p>',15),i=[r,E,y];function u(F,d,q,h,m,b){return l(),p("div",null,i)}const g=a(c,[["render",u]]);export{B as __pageData,g as default};
