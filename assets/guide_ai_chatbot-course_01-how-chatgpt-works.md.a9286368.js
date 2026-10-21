import{L as M}from"./chunks/LessonQuiz.31ed110c.js";import{d as g,h as _,Z as L,o,c as i,k as e,t as f,n as A,p as T,m as x,_ as m,X as S,g as P,F as k,D as y,b as I,H as v,l as H,Q as z,e as $}from"./chunks/framework.ac6a668e.js";const C=n=>(T("data-v-d823cb59"),n=n(),x(),n),B={class:"code-toolbar"},G=C(()=>e("svg",{width:"20",height:"20",viewBox:"0 0 20 20",fill:"none",stroke:"currentColor","stroke-width":"1.5","aria-hidden":"true"},[e("path",{d:"m7 5-5 5 5 5m6-10 5 5-5 5m-2-13-2 16"})],-1)),q={class:"language"},R={class:"copy-status",role:"status"},V=["aria-label","aria-pressed","title"],j=C(()=>e("svg",{width:"20",height:"20",viewBox:"0 0 20 20",fill:"none",stroke:"currentColor","stroke-width":"1.5","aria-hidden":"true"},[e("path",{d:"M3 5h14M3 10h11a3 3 0 0 1 0 6h-4m2-2-2 2 2 2M3 15h3"})],-1)),D=[j],N=C(()=>e("svg",{width:"20",height:"20",viewBox:"0 0 20 20",fill:"none",stroke:"currentColor","stroke-width":"1.5","aria-hidden":"true"},[e("rect",{x:"6",y:"6",width:"11",height:"11",rx:"2"}),e("path",{d:"M13 6V4a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h2"})],-1)),E=[N],U={tabindex:"0"},J=["innerHTML"],Z=g({__name:"CourseCodeBlock",props:{codeHtml:{},language:{}},setup(n){const c=_(null),l=_(!1),t=_("");let r;async function a(){var s;try{await navigator.clipboard.writeText(((s=c.value)==null?void 0:s.textContent)??""),t.value="已复制"}catch{t.value="复制失败，请手动选择代码"}clearTimeout(r),r=setTimeout(()=>{t.value=""},2e3)}return L(()=>clearTimeout(r)),(s,d)=>(o(),i("div",{class:A(["course-code-block",{wrapped:l.value}])},[e("div",B,[G,e("span",q,f(s.language),1),e("span",R,f(t.value),1),e("button",{type:"button","aria-label":l.value?"禁用自动换行":"启用自动换行","aria-pressed":l.value,title:l.value?"禁用自动换行":"启用自动换行",onClick:d[0]||(d[0]=h=>l.value=!l.value)},D,8,V),e("button",{type:"button","aria-label":"复制代码",title:"复制代码",onClick:a},E)]),e("pre",U,[e("code",{ref_key:"codeElement",ref:c,innerHTML:s.codeHtml},null,8,J)])],2))}});const W=m(Z,[["__scopeId","data-v-d823cb59"]]),w=n=>(T("data-v-7e8fea4d"),n=n(),x(),n),X={class:"course-source-table"},F={class:"table-toolbar"},O={role:"status"},Q=w(()=>e("svg",{width:"20",height:"20",viewBox:"0 0 20 20",fill:"none",stroke:"currentColor","stroke-width":"1.5","aria-hidden":"true"},[e("rect",{x:"6",y:"6",width:"11",height:"11",rx:"2"}),e("path",{d:"M13 6V4a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h2"})],-1)),Y=[Q],K=w(()=>e("svg",{width:"20",height:"20",viewBox:"0 0 20 20",fill:"none",stroke:"currentColor","stroke-width":"1.5","aria-hidden":"true"},[e("path",{d:"M3 8V3h5m4 0h5v5M3 12v5h5m4 0h5v-5"})],-1)),ee=[K],te=["innerHTML"],ne={class:"dialog-toolbar"},oe=w(()=>e("strong",null,"教程表格",-1)),re=["innerHTML"],ae=g({__name:"CourseSourceTable",props:{tableHtml:{}},setup(n){const c=_(null),l=_(null),t=_("");let r;function a(){var d;return Array.from(((d=c.value)==null?void 0:d.querySelectorAll("tr"))??[],h=>Array.from(h.querySelectorAll("th, td"),b=>{var p;return((p=b.textContent)==null?void 0:p.trim())??""}))}async function s(){try{await navigator.clipboard.writeText(a().map(d=>d.join("	")).join(`
`)),t.value="已复制"}catch{t.value="复制失败，请手动选择表格"}clearTimeout(r),r=setTimeout(()=>{t.value=""},2e3)}return L(()=>clearTimeout(r)),(d,h)=>(o(),i("div",X,[e("div",F,[e("span",O,f(t.value),1),e("button",{type:"button","aria-label":"复制表格",title:"复制表格",onClick:s},Y),e("button",{type:"button","aria-label":"展开表格",title:"展开表格",onClick:h[0]||(h[0]=b=>{var p;return(p=l.value)==null?void 0:p.showModal()})},ee)]),e("div",{ref_key:"tableElement",ref:c,class:"table-scroller",innerHTML:d.tableHtml},null,8,te),e("dialog",{ref_key:"expandedTable",ref:l,class:"table-dialog","aria-label":"展开的教程表格",onClick:h[2]||(h[2]=S(b=>{var p;return(p=l.value)==null?void 0:p.close()},["self"]))},[e("div",ne,[oe,e("button",{type:"button","aria-label":"关闭表格",onClick:h[1]||(h[1]=b=>{var p;return(p=l.value)==null?void 0:p.close()})},"关闭 ×")]),e("div",{class:"table-scroller",innerHTML:d.tableHtml},null,8,re)],512)]))}});const se=m(ae,[["__scopeId","data-v-7e8fea4d"]]),le={class:"course-source-article"},ie=["innerHTML"],de=g({__name:"CourseSourceArticle",props:{source:{}},setup(n){const c=n,l=P(()=>{const t=[],r=/<pre><code(?: class="language-([^"]+)")?>([\s\S]*?)<\/code><\/pre>|<table>[\s\S]*?<\/table>/g;let a=0;for(const s of c.source.matchAll(r)){const d=s.index;d>a&&t.push({type:"html",html:c.source.slice(a,d)}),t.push(s[0].startsWith("<table>")?{type:"table",html:s[0]}:{type:"code",html:s[2],language:s[1]==="javascript"?"JavaScript":"纯文本"}),a=d+s[0].length}return a<c.source.length&&t.push({type:"html",html:c.source.slice(a)}),t});return(t,r)=>(o(),i("div",le,[(o(!0),i(k,null,y(l.value,(a,s)=>(o(),i(k,{key:s},[a.type==="code"?(o(),I(W,{key:0,"code-html":a.html,language:a.language||"纯文本"},null,8,["code-html","language"])):a.type==="table"?(o(),I(se,{key:1,"table-html":a.html},null,8,["table-html"])):(o(),i("div",{key:2,class:"source-fragment",innerHTML:a.html},null,8,ie))],64))),128))]))}});const ce=m(de,[["__scopeId","data-v-a4e9d47b"]]),pe=`<h1>第 01 篇：ChatGPT 到底是如何回答问题的？</h1>
<p><strong>所属阶段：</strong> AI 与大模型基础<br>
<strong>阅读时间：</strong> 约 8 分钟<br>
<strong>前置知识：</strong> 无</p>
<h2>1. 先理解一个关键事实</h2>
<p>当你向 ChatGPT 提问：</p>
<blockquote><p>为什么 JavaScript 是单线程的？</p>
</blockquote>
<p>你可能认为 ChatGPT 的工作流程是：</p>
<pre><code>接收问题
   ↓
理解问题
   ↓
查找正确答案
   ↓
输出答案</code></pre>
<p>但对于基础的大语言模型而言，更接近真实情况的过程是：</p>
<pre><code>用户输入
   ↓
Tokenization（分词）
   ↓
转换成 Token ID
   ↓
Transformer 模型计算
   ↓
预测下一个 Token 的概率
   ↓
选择下一个 Token
   ↓
重复生成
   ↓
最终回答</code></pre>
<p>这里最重要的概念是：</p>
<p><strong>大语言模型的核心生成机制，是根据已有上下文预测接下来应该出现什么 Token。</strong></p>
<p>它不是传统意义上的数据库查询系统。</p>
<p>当然，现代 ChatGPT 产品还可能结合搜索、工具调用、记忆等能力，因此完整产品比单纯的大语言模型复杂得多。</p>
<h2>2. Token 是什么？</h2>
<p>Token 是模型处理文本时使用的基本单位。</p>
<p>例如：</p>
<pre><code>用户输入：

我是一名前端开发工程师</code></pre>
<p>经过 Tokenizer 处理后，可能变成：</p>
<pre><code>["我", "是一名", "前端", "开发", "工程师"]</code></pre>
<p>这里只是示意。不同模型使用不同的 Tokenizer，实际切分结果可能不同。</p>
<p>随后，每个 Token 会被转换为数字 ID：</p>
<pre><code>"我"      → 123
"是一名"  → 456
"前端"    → 789
"开发"    → 234
"工程师"  → 567</code></pre>
<p>这些 ID 同样只是示例。</p>
<p>为什么需要 Token？</p>
<p>因为神经网络不能直接对字符串进行数学运算，它需要数值表示。</p>
<p>因此，文本必须经过编码，才能进入模型。</p>
<h2>3. 模型如何生成回答？</h2>
<p>假设用户输入：</p>
<pre><code>JavaScript 是一种</code></pre>
<p>模型会计算不同 Token 作为下一个输出的概率。</p>
<p>例如：</p>
<table><thead><tr><th>候选 Token</th>
<th align="right">假设概率</th>
</tr>
</thead>
<tbody><tr><td>编程</td>
<td align="right">65%</td>
</tr>
<tr><td>脚本</td>
<td align="right">20%</td>
</tr>
<tr><td>动态</td>
<td align="right">10%</td>
</tr>
<tr><td>其他</td>
<td align="right">5%</td>
</tr>
</tbody>
</table>
<p>模型根据生成策略选出一个 Token。</p>
<p>假设选中了「编程」。</p>
<p>那么上下文就变成：</p>
<pre><code>JavaScript 是一种编程</code></pre>
<p>接下来模型再次计算：</p>
<pre><code>语言 → 85%
工具 → 8%
框架 → 4%
其他 → 3%</code></pre>
<p>最终可能生成：</p>
<pre><code>JavaScript 是一种编程语言。</code></pre>
<p>这就是自回归生成（Autoregressive Generation）的基本思想。</p>
<p>需要注意，模型并不是每次都简单选择概率最高的 Token。实际生成还可能受到 Temperature、Top-p 等采样参数影响。</p>
<h2>4. Transformer 在其中负责什么？</h2>
<p>Transformer 是现代大语言模型广泛使用的神经网络架构。</p>
<p>它的一个核心机制叫作：</p>
<p><strong>Attention（注意力机制）。</strong></p>
<p>举个例子：</p>
<blockquote><p>小明把电脑放在桌子上，因为它太重了。</p>
</blockquote>
<p>这里的「它」指什么？</p>
<p>模型需要结合上下文，判断「它」更可能指电脑，而不是桌子。</p>
<p>Attention 可以帮助模型在处理某个位置时，利用其他位置的信息。</p>
<p>不过，Attention 不等同于人类的理解能力，也不是简单的关键词匹配。</p>
<p>它通过训练得到的参数，计算不同 Token 表示之间的关联，并利用这些关联构建上下文表示。</p>
<p>在现代生成式语言模型中，通常使用带因果掩码的 Self-Attention，确保生成当前位置时不能直接看到未来尚未生成的 Token。</p>
<h2>5. 为什么 ChatGPT 能回答编程问题？</h2>
<p>原因主要来自预训练。</p>
<p>模型在训练阶段接触大量文本及代码相关数据，通过预测 Token 学习语言、代码和知识中的统计规律。</p>
<p>例如，模型可能在训练过程中学习到：</p>
<pre><code class="language-javascript"><span class="token-keyword">const</span> sum = (a, b) =&gt; a + b;</code></pre>
<p>以及大量类似的代码结构。</p>
<p>因此，当你提问：</p>
<blockquote><p>如何使用 JavaScript 实现防抖？</p>
</blockquote>
<p>模型可以根据训练中学到的规律，生成符合要求的代码。</p>
<p>但需要区分：</p>
<p><strong>能够生成看起来正确的代码，不代表代码一定正确。</strong></p>
<p>这也是为什么 AI 编程需要测试、静态检查和人工审查。</p>
<h2>6. 从前端开发的角度理解整个流程</h2>
<p>假设我们开发一个 AI 聊天机器人。</p>
<p>前端使用 React，后端使用 Node.js。</p>
<p>整体架构可以简化为：</p>
<pre><code>┌──────────────────────┐
│      React UI        │
│                      │
│ 用户输入聊天内容       │
└──────────┬───────────┘
           │
           │ HTTP Request
           ▼
┌──────────────────────┐
│     Node.js API      │
│                      │
│ 1. 验证用户身份       │
│ 2. 构建 Messages     │
│ 3. 调用模型 API      │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│      LLM API         │
│                      │
│ Tokenization         │
│ Transformer          │
│ Token Generation     │
└──────────┬───────────┘
           │
           │ Streaming
           ▼
┌──────────────────────┐
│      React UI        │
│                      │
│ 实时显示模型回答       │
└──────────────────────┘</code></pre>
<p>这里有一个非常重要的工程概念：</p>
<p><strong>聊天机器人应用与大语言模型不是同一个东西。</strong></p>
<p>大语言模型负责生成内容，而聊天机器人应用还需要解决身份认证、会话管理、数据存储、流式传输、权限控制等问题。</p>
<p>这也是整个系列后续要重点讲解的内容。</p>
<hr>
<h2>7. 今天需要记住的 5 个概念</h2>
<table><thead><tr><th>概念</th>
<th>一句话理解</th>
</tr>
</thead>
<tbody><tr><td>LLM</td>
<td>通过大规模训练获得语言生成能力的模型</td>
</tr>
<tr><td>Token</td>
<td>模型处理文本的基本单位</td>
</tr>
<tr><td>Tokenizer</td>
<td>将文本编码为 Token ID 的组件</td>
</tr>
<tr><td>Transformer</td>
<td>现代大语言模型常用的神经网络架构</td>
</tr>
<tr><td>Attention</td>
<td>让模型在处理 Token 时利用上下文信息的机制</td>
</tr>
</tbody>
</table>
<h3>思考题</h3>
<p>为什么 ChatGPT 有时候会一本正经地给出错误答案？</p>
<p>提示：思考一下「预测下一个 Token」和「验证事实是否正确」之间有什么区别。</p>
<p>这道题会在第 13 篇《为什么大语言模型会产生幻觉？》中深入解释。</p>
<hr>
<h2>后续学习安排</h2>
<p>下一篇是：</p>
<p><strong>第 02 篇：《Token 与 Embedding：为什么 AI 能把文字变成数学？》</strong></p>
<p>我们会进一步研究：</p>
<ul><li>Token ID 与 Embedding 有什么区别？</li>
<li>为什么语义相近的词可以具有相近的向量表示？</li>
<li>Embedding 为什么能够支持语义搜索？</li>
<li>ChatGPT 的上下文窗口为什么有限？</li>
<li>Token 数量如何影响 API 成本？</li>
</ul>
<p>我会继续采用这种<strong>技术文章 + 架构图 + 代码示例 + 思考题</strong>的形式，让你既能在工作间隙阅读，也能逐步建立完整的 AI 聊天机器人知识体系。</p>
`,u=n=>(T("data-v-df38bf69"),n=n(),x(),n),he={class:"lesson"},ue={class:"enrichment","aria-label":"补充学习"},_e=u(()=>e("h2",null,"补充学习：交互图解与课后测验",-1)),fe={class:"visual"},be=u(()=>e("strong",null,"大语言模型的自回归生成流程",-1)),ke={viewBox:"0 0 400 570",role:"img","aria-label":"用户输入、Tokenization、Token ID、Transformer、下一个 Token 概率、选择 Token、是否结束及循环"},ge=u(()=>e("defs",null,[e("marker",{id:"arrow01",markerWidth:"7",markerHeight:"7",refX:"6",refY:"3.5",orient:"auto"},[e("path",{d:"M0 0 L7 3.5 L0 7Z",fill:"#64748b"})])],-1)),me=["y"],ye=["y"],ve=["d"],Te=z('<path d="M200 428 L244 470 L200 512 L156 470 Z" fill="#6366f1" fill-opacity=".1" stroke="#8b5cf6" data-v-df38bf69></path><text x="200" y="475" text-anchor="middle" font-size="13" fill="currentColor" data-v-df38bf69>是否结束？</text><path d="M244 470 H365 V257 H317" fill="none" stroke="#64748b" stroke-width="1.5" marker-end="url(#arrow01)" data-v-df38bf69></path><text x="344" y="455" font-size="13" fill="currentColor" data-v-df38bf69>否</text><path d="M200 512 V530" fill="none" stroke="#64748b" stroke-width="1.5" marker-end="url(#arrow01)" data-v-df38bf69></path><rect x="130" y="533" width="140" height="33" rx="7" fill="#6366f1" fill-opacity=".10" stroke="#8b5cf6" data-v-df38bf69></rect><text x="200" y="554" text-anchor="middle" font-size="14" fill="currentColor" data-v-df38bf69>输出答案</text><text x="211" y="528" font-size="12" fill="currentColor" data-v-df38bf69>是</text>',8),xe={class:"visual"},Ce=u(()=>e("strong",null,"React + Node.js + LLM API 架构",-1)),we={viewBox:"0 0 430 470",role:"img","aria-label":"React UI 到 Node.js API 再到 LLM API，流式返回 React UI 的架构图"},Ie=u(()=>e("defs",null,[e("marker",{id:"arch01",markerWidth:"7",markerHeight:"7",refX:"6",refY:"3.5",orient:"auto"},[e("path",{d:"M0 0 L7 3.5 L0 7Z",fill:"#64748b"})])],-1)),$e=["y"],Le=["y"],Me=["y"],Ae=["d"],Se=u(()=>e("text",{x:"228",y:"110","font-size":"12",fill:"currentColor"},"HTTP Request",-1)),Pe=u(()=>e("text",{x:"228",y:"226","font-size":"12",fill:"currentColor"},"API Request",-1)),He=u(()=>e("text",{x:"228",y:"342","font-size":"12",fill:"currentColor"},"Streaming",-1)),ze=u(()=>e("footer",null,[e("span",null,"第 01 / 40 篇"),e("a",{href:"./02-token-and-embedding"},"下一篇：Token 与 Embedding →")],-1)),Be=g({__name:"ChatGPTLesson",setup(n){return(c,l)=>(o(),i("article",he,[v(ce,{source:H(pe)},null,8,["source"]),e("section",ue,[_e,e("div",fe,[be,(o(),i("svg",ke,[ge,(o(),i(k,null,y([{label:"用户输入",y:12},{label:"Tokenization（分词）",y:86},{label:"转换成 Token ID",y:160},{label:"Transformer 模型计算",y:234},{label:"预测下一个 Token 的概率",y:308},{label:"选择下一个 Token",y:382}],(t,r)=>e("g",{key:r},[e("rect",{x:"83",y:t.y,width:"234",height:"46",rx:"8",fill:"#6366f1","fill-opacity":".10",stroke:"#8b5cf6","stroke-opacity":".65"},null,8,me),e("text",{x:"200",y:t.y+29,"text-anchor":"middle","font-size":"15",fill:"currentColor"},f(t.label),9,ye),r<5?(o(),i("path",{key:0,d:"M200 "+(t.y+46)+" V"+(t.y+73),fill:"none",stroke:"#64748b","stroke-width":"1.5","marker-end":"url(#arrow01)"},null,8,ve)):$("",!0)])),64)),Te]))]),e("div",xe,[Ce,(o(),i("svg",we,[Ie,(o(!0),i(k,null,y([{name:"React UI",detail:"用户输入聊天内容",y:10},{name:"Node.js API",detail:"鉴权、构建 Messages、调用模型",y:126},{name:"LLM API",detail:"Tokenization、Transformer、生成",y:242},{name:"React UI",detail:"实时显示模型回答",y:358}],(t,r)=>(o(),i("g",{key:r},[e("rect",{x:"80",y:t.y,width:"270",height:"75",rx:"9",fill:"#6366f1","fill-opacity":".10",stroke:"#8b5cf6","stroke-opacity":".6"},null,8,$e),e("text",{x:"215",y:t.y+29,"text-anchor":"middle","font-size":"18",fill:"currentColor"},f(t.name),9,Le),e("text",{x:"215",y:t.y+53,"text-anchor":"middle","font-size":"12",fill:"currentColor"},f(t.detail),9,Me),r<3?(o(),i("path",{key:0,d:"M215 "+(t.y+75)+" V"+(t.y+110),stroke:"#64748b",fill:"none","stroke-width":"1.5","marker-end":"url(#arch01)"},null,8,Ae)):$("",!0)]))),128)),Se,Pe,He]))]),v(M,{chapter:1})]),ze]))}});const Ge=m(Be,[["__scopeId","data-v-df38bf69"]]),je=JSON.parse('{"title":"01 · ChatGPT 到底是如何回答问题的？","description":"","frontmatter":{"title":"01 · ChatGPT 到底是如何回答问题的？","outline":"deep","readingTime":"8"},"headers":[],"relativePath":"guide/ai/chatbot-course/01-how-chatgpt-works.md","filePath":"guide/ai/chatbot-course/01-how-chatgpt-works.md","lastUpdated":1792574278000}'),qe={name:"guide/ai/chatbot-course/01-how-chatgpt-works.md"},De=Object.assign(qe,{setup(n){return(c,l)=>(o(),i("div",null,[v(Ge)]))}});export{je as __pageData,De as default};
