<template><article class="lesson">
<div class="meta"><span class="tag">第 01 / 40 篇</span><span>第一阶段：AI 与大模型基础</span><span>阅读约 8 分钟</span></div>
<h1>ChatGPT 到底是如何回答问题的？</h1>
<p>当你向 ChatGPT 提问「为什么 JavaScript 是单线程的？」时，模型不是简单查询固定答案，而是根据上下文预测下一个 Token。</p>
<h2>一、ChatGPT 的生成流程</h2>
<div class="visual"><strong>自回归生成（简化）</strong><template v-for="(s,i) in ['用户输入','Tokenization：文本切分','Token ID 与向量表示','Transformer 模型计算','计算下一个 Token 的概率','选择下一个 Token','重复生成直到结束']" :key="s"><div class="step">{{s}}</div><div v-if="i<6" class="arrow">↓</div></template></div>
<p>这个过程叫 Autoregressive Generation。现代聊天产品还可能结合搜索、工具调用和记忆等能力。</p>
<h2>二、Token 是什么？</h2><p>Token 是模型处理文本的基本单位，不一定等于一个汉字或英文单词。</p><pre><code>输入：我是一名前端开发工程师
示意分词：["我","是一名","前端","开发","工程师"]
示意 ID：[123,456,789,234,567]</code></pre><p>以上仅为示意。Token ID 是编号，本身不直接表达语义。</p>
<h2>三、模型如何生成回答？</h2><p>假设输入「JavaScript 是一种」，模型可能计算以下候选 Token 概率：</p>
<table><thead><tr><th>候选</th><th>假设概率</th></tr></thead><tbody><tr><td>编程</td><td>65%</td></tr><tr><td>脚本</td><td>20%</td></tr><tr><td>动态</td><td>10%</td></tr><tr><td>其他</td><td>5%</td></tr></tbody></table>
<p>选中「编程」后，模型继续预测「语言」等后续 Token。Temperature、Top-p 等参数影响选择策略，模型并非每次都取概率最大的 Token。</p>
<h2>四、Transformer 与 Attention</h2><p>Transformer 是现代大语言模型常用架构。Attention 让模型处理一个位置时可以利用上下文。</p>
<div class="visual"><strong>上下文指代示意</strong><p>小明把电脑放在桌子上，因为它太重了。</p><div class="cols"><div class="panel">电脑：候选指代对象</div><div class="panel">桌子：候选指代对象</div></div><p>模型结合上下文学习关联，而不是执行硬编码关键词规则。</p></div>
<h2>五、为什么模型能回答编程问题？</h2><p>模型在训练中学习了大量语言和代码模式，因此可以生成：</p><pre><code>const sum = (a: number, b: number) => a + b;</code></pre><p><strong>生成看起来正确的代码，不代表代码一定正确。</strong>实际工程仍需测试和人工审查。</p>
<h2>六、React + Node.js 聊天系统</h2><div class="visual"><template v-for="(s,i) in ['React UI：用户输入','Node.js API：鉴权与组装 Messages','LLM API：Tokenization 与生成','Node.js：转发流式响应','React UI：实时展示回答']" :key="s"><div class="step">{{s}}</div><div v-if="i<4" class="arrow">↓</div></template></div><p>聊天应用还需要会话存储、流式输出、权限、限流和安全机制。<strong>聊天机器人应用不等于 LLM 本身。</strong></p>
<h2>七、知识总结</h2><table><thead><tr><th>概念</th><th>作用</th></tr></thead><tbody><tr><td>LLM</td><td>语言生成模型</td></tr><tr><td>Token</td><td>文本处理单位</td></tr><tr><td>Tokenizer</td><td>文本转 Token ID</td></tr><tr><td>Transformer</td><td>序列上下文计算</td></tr><tr><td>Attention</td><td>聚合相关上下文信息</td></tr></tbody></table>
<h2>学习疑问与解答</h2><p>本篇暂无新增问题，后续持续补充。</p>
<h3>思考题</h3><p>为什么 ChatGPT 有时会一本正经地给出错误答案？提示：预测高概率 Token 和验证事实真实性之间有什么区别？</p>
<footer><span>第 01 篇</span><a href="./02-token-and-embedding">下一篇 →</a></footer></article></template><style scoped>
.lesson{font-size:15px;line-height:1.85;color:var(--vp-c-text-1)}h1{font-size:30px;line-height:1.35;margin:18px 0}h2{font-size:23px;margin:34px 0 16px;border-top:1px solid var(--vp-c-divider);padding-top:12px}h3{font-size:17px;margin:18px 0 8px}p{margin:14px 0}.meta{display:flex;gap:10px;flex-wrap:wrap;font-size:12px;color:var(--vp-c-text-2)}.tag{border-radius:18px;background:rgba(22,163,74,.12);color:#16a34a;padding:4px 10px}.visual{border:1px solid var(--vp-c-divider);border-radius:14px;padding:18px;margin:20px 0}.step{background:var(--vp-c-bg-soft);border-radius:8px;padding:12px;text-align:center}.arrow{text-align:center;padding:5px;color:var(--vp-c-text-2)}.cols{display:grid;grid-template-columns:1fr 1fr;gap:10px}.panel{background:var(--vp-c-bg-soft);border-radius:8px;padding:12px}pre{background:var(--vp-code-block-bg);border-radius:10px;padding:16px;overflow:auto}pre code{white-space:pre;color:var(--vp-c-text-1)}table{display:table;width:100%}td,th{padding:8px}footer{border-top:1px solid var(--vp-c-divider);margin-top:30px;padding-top:16px;display:flex;justify-content:space-between}.formula{text-align:center;background:var(--vp-c-bg-soft);padding:18px;border-radius:10px;font-size:20px;overflow-x:auto}@media(max-width:600px){h1{font-size:24px}h2{font-size:20px}.cols{grid-template-columns:1fr}}
</style>