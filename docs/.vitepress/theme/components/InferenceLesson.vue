<script setup lang="ts">
import { computed, ref } from 'vue'
const ttft = ref(4.9)
const tps = ref(50)
const tokens = ref(500)
const estimatedDuration = computed(() => ttft.value + (tokens.value - 1) / tps.value)
const temperature = ref(1)
const probabilities = computed(() => {
 const logits=[2.5,1.8,0.9,0.1]
 const e=logits.map(x=>Math.exp((x-Math.max(...logits))/temperature.value))
 const sum=e.reduce((a,b)=>a+b,0)
 return e.map(x=>x/sum)
})
const selected=ref<number[]>([])
const submitted=ref(false)
const questions=[
 {q:'Prefill 阶段主要处理什么？',opts:['整个已有输入上下文','只生成最后一个回答 Token','更新模型参数'],a:0,why:'Prefill 并行处理已有上下文并建立后续解码可复用的 KV Cache。'},
 {q:'Decode 阶段通常每轮生成多少新 Token？',opts:['全部答案同时生成','一个（逐步循环）','固定一千个'],a:1,why:'自回归解码每一步预测下一个 Token，随后继续下一步。'},
 {q:'KV Cache 主要缓存什么？',opts:['每层历史位置的 Key 和 Value','训练数据集','用户浏览器 Cookie'],a:0,why:'缓存历史 K/V，避免后续每一步都重复计算历史位置的投影。'},
 {q:'提高 Temperature 通常会产生什么影响？',opts:['输出分布更平坦，随机性可能增加','模型一定更准确','上下文窗口自动变长'],a:0,why:'Temperature 缩放 logits，较高温度一般让候选概率更均匀，但不保证更好。'}
]
const score=computed(()=>questions.filter((q,i)=>selected.value[i]===q.a).length)
function pick(i:number,j:number){const next=[...selected.value];next[i]=j;selected.value=next;submitted.value=false}
function reset(){selected.value=[];submitted.value=false}
</script>
<template>
<article class="lesson">
<h1>模型推理：ChatGPT 为什么一个 Token 一个 Token 地回答？</h1>
<p>上一篇我们学习了预训练、SFT 和偏好对齐。模型训练好之后，用户输入问题，它是如何在几秒钟内给出回答的？这就是 <strong>Inference（推理）</strong>。本篇重点认识 Prefill、Decode、KV Cache、Temperature、Top-p，以及聊天产品中的流式输出。</p>
<h2>一、推理不是训练</h2>
<p>训练通过梯度更新权重；普通推理使用固定的模型权重，结合当前输入预测后续 Token。你在对话里纠正一次答案，不等于模型权重立刻改变。</p>
<div class="visual"><strong>一次聊天请求的完整路径</strong><div class="step">用户发送消息</div><div class="arrow">↓</div><div class="step">Tokenizer → Token IDs</div><div class="arrow">↓</div><div class="step blue">Prefill：处理已有输入上下文</div><div class="arrow">↓</div><div class="step green">Decode：预测一个新 Token → 重复</div><div class="arrow">↓</div><div class="step">Token 解码为文本 → 流式显示</div></div>
<h2>二、Prefill：先读懂已经给出的上下文</h2>
<p>假设用户输入「请解释 React 的 useEffect」。模型首先处理 System Prompt、历史消息与当前问题等已有输入。这个阶段称为 <strong>Prefill</strong>，它可以对输入中的多个位置进行并行计算，并建立后续可复用的注意力缓存。</p>
<p>Prefill 不等于把整段问题转换为一条人工编写的摘要；它是 Transformer 对输入序列执行计算。已有上下文越长，Prefill 通常越耗时，但性能也取决于硬件、模型结构与服务端优化。</p>
<h2>三、Decode：逐 Token 生成答案</h2>
<p>Prefill 后，模型根据当前上下文预测下一个 Token。选出一个 Token 后，把它加入序列，再预测下一个。直到输出结束标记、达到长度限制或满足其他停止条件。</p>
<div class="visual"><strong>自回归解码过程</strong><div class="step">已有上下文：「React 是」</div><div class="arrow">↓ 预测</div><div class="step blue">生成：「一个」</div><div class="arrow">↓ 再预测</div><div class="step blue">生成：「用于」</div><div class="arrow">↓ 继续</div><div class="step green">生成：「构建 UI 的库……」</div><small>分词结果仅为概念示意，真实 Tokenizer 不一定按这些词切分。</small></div>
<p>这里的「逐 Token」指生成依赖关系，并不意味着所有推理计算都只能串行执行。模型内部的大量矩阵运算仍可并行。</p>
<h2>四、KV Cache：为什么不用每次重新计算全部历史？</h2>
<p>在前面的课程中，我们知道 Attention 使用 Q、K、V。自回归解码时，过去 Token 的 K/V 在标准因果注意力中可复用。因此服务端可以保存各层历史位置的 K 和 V；生成下一个 Token 时，只计算新位置所需的表示并读取历史缓存。</p>
<div class="visual"><strong>KV Cache 的复用示意</strong>
<div class="step">Prefill：计算输入序列的 K / V</div><div class="arrow">↓ 保存</div>
<div class="step blue">缓存：[K₁,V₁] [K₂,V₂] [K₃,V₃]</div><div class="arrow">↓ 生成新 Token</div>
<div class="step green">新增 [K₄,V₄]，复用历史 K/V</div>
<small>缓存按层管理；不同模型的 GQA、MQA、滑动窗口注意力和缓存策略会影响具体内存占用。</small></div>
<p><strong>代价：</strong>KV Cache 占用显存或其他存储资源，长上下文与高并发时可能成为重要瓶颈。缓存不会让注意力计算完全消失。</p>
<h2>五、Temperature：为什么同一个问题会得到不同回答？</h2>
<p>模型先计算候选 Token 的 logits，再通过采样策略选择输出。Temperature（温度）会调整概率分布的平坦程度：较低温度通常更集中，较高温度通常更分散。</p>
<div class="formula">Pᵢ = softmax(logitᵢ / T)</div>
<div class="visual"><strong>交互实验：Temperature 如何影响候选概率？</strong>
<label for="temperature">Temperature：{{temperature.toFixed(1)}}</label>
<input id="temperature" v-model.number="temperature" type="range" min="0.2" max="2" step="0.1"/>
<div v-for="(p,i) in probabilities" :key="i" class="probrow"><span>{{['编程','脚本','动态','其他'][i]}}</span><div class="track"><div class="fill" :style="{width:(p*100)+'%'}"></div></div><span>{{(p*100).toFixed(1)}}%</span></div>
<small>候选 logits 是假设数据。实际 API 的温度范围、默认值和可用性由模型提供方决定。温度趋近零时通常采用贪心式选择，但不保证整个服务完全确定。</small></div>
<h2>六、Top-p 与 Temperature 有什么区别？</h2>
<p><strong>Temperature</strong> 改变候选 Token 的概率分布；<strong>Top-p（核采样）</strong> 则通常按照概率从高到低排列，只保留累计概率达到阈值 p 的最小候选集合，再从中采样。</p>
<table><thead><tr><th>参数</th><th>主要作用</th></tr></thead><tbody><tr><td>Temperature</td><td>调整概率分布的集中程度</td></tr><tr><td>Top-p</td><td>限制参与采样的候选集合</td></tr><tr><td>Max output tokens</td><td>限制最大生成长度</td></tr></tbody></table>
<p>这些参数不会直接让模型学到新知识，也不能保证消除幻觉。很多 API 建议优先调整 Temperature 或 Top-p 中的一个，而不是同时大幅修改。</p>
<h2>七、推理性能：TTFT、TPS 与延迟</h2>
<h3>7.2 为什么输出到一半时可能变慢？</h3>
<p>首先要理解一个关键区别：</p>
<p><strong>Prefill 通常更偏向计算密集型，而 Decode 在很多部署场景下更容易受到内存带宽限制。</strong></p>
<p>这是因为在 Decode 阶段，模型通常需要逐 Token 执行前向计算，并访问模型权重和 KV Cache。</p>
<p>假设：</p>
<pre><code>用户提问
   ↓
Prefill：处理 2,000 Tokens
   ↓
Decode：生成 1,000 Tokens</code></pre>
<p>Decode 需要执行多轮生成。而且随着生成长度增加，KV Cache 也可能不断增长。</p>
<p>但这里有个容易误解的地方：</p>
<p><strong>生成越往后，并不意味着 TPS 一定持续下降。</strong></p>
<p>真实推理性能还受到批处理策略、注意力实现、硬件、服务端负载以及缓存管理方式影响。</p>
<h3>7.3 如何计算生成速度？</h3>
<p>假设模型在首 Token 之后，用 8 秒生成了 400 个额外 Token。</p>
<p>那么：</p><div class="formula">TPS = 400 / 8 = 50</div>
<p>即每秒生成 50 Tokens。</p>
<p>你可以通过下面的实验理解 TTFT 和 TPS 对用户体验的影响。</p>
<div class="visual"><strong>交互实验：推理延迟计算器</strong>
<label for="ttft-slider">TTFT（首 Token 延迟）：{{ttft.toFixed(1)}} 秒</label>
<input id="ttft-slider" v-model.number="ttft" type="range" min="0.1" max="10" step="0.1"/>
<label for="tps-slider">后续生成速度：{{tps}} Tokens/s</label>
<input id="tps-slider" v-model.number="tps" type="range" min="10" max="200" step="10"/>
<label for="tokens-slider">总输出 Token 数量：{{tokens}}</label>
<input id="tokens-slider" v-model.number="tokens" type="range" min="100" max="2000" step="100"/>
<div class="metrics"><div class="step"><small>首 Token 等待</small><b>{{ttft.toFixed(1)}}s</b></div><div class="step"><small>预计总耗时</small><b>{{estimatedDuration.toFixed(1)}}s</b></div></div>
<small>简化估算：总耗时 ≈ TTFT + (输出 Token 数 − 1) / 后续 TPS，假设生成速度恒定。</small></div>
<p>从这个实验可以得出两个工程结论：</p>
<ul><li>如果用户一直看不到第一个字，应该重点排查 TTFT。</li><li>如果已经开始输出，但生成非常缓慢，应该重点关注 Decode 吞吐量。</li></ul>
<h2>八、TypeScript：如何实现 ChatGPT 式流式聊天？</h2>
<p>这是本篇最重要的工程实践。</p>
<p>假设你的技术栈是：</p>
<ul><li>React：聊天界面。</li><li>Node.js：后端服务。</li><li>OpenAI SDK：调用大语言模型。</li><li>HTTP Streaming：增量传输。</li></ul>
<h3>8.1 整体架构</h3>
<div class="visual"><strong>流式聊天系统架构</strong>
<div class="step"><b>React Chat UI</b><small>用户输入 / 实时渲染 / 停止生成</small></div><div class="arrow">↓</div>
<div class="step blue"><b>Node.js API</b><small>鉴权 / 组装 Messages / 流式转发</small></div><div class="arrow">↓</div>
<div class="step green"><b>LLM API</b><small>Prefill → Decode → 增量事件</small></div><div class="arrow">↕</div>
<div class="step"><b>HTTP 流式响应返回浏览器</b></div></div>
<h3>8.2 Node.js 后端示例</h3>
<p>首先安装：</p>
<pre><code>npm install openai express
npm install -D @types/express typescript tsx</code></pre>
<p>创建 server.ts：</p>
<pre><code>import express from "express";
import OpenAI from "openai";

const app = express();
const client = new OpenAI();

app.use(express.json());

app.post("/api/chat", async (req, res) => {
  const message = req.body?.message;

  if (typeof message !== "string" ||
      !message.trim() ||
      message.length > 10000) {
    res.status(400).json({
      error: "Invalid message"
    });
    return;
  }

  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache");
  res.flushHeaders();

  const controller = new AbortController();

  res.on("close", () => {
    if (!res.writableEnded) controller.abort();
  });

  try {
    const stream = await client.chat.completions.create(
      {
        model: "gpt-4.1-mini",
        messages: [
          { role: "user", content: message }
        ],
        stream: true
      },
      { signal: controller.signal }
    );

    for await (const chunk of stream) {
      if (controller.signal.aborted) break;

      const content =
        chunk.choices[0]?.delta?.content;

      if (content) res.write(content);
    }

    if (!res.writableEnded) res.end();
  } catch (error) {
    console.error(error);
    if (!res.writableEnded) res.end();
  }
});

app.listen(3000);</code></pre>
<p>这个示例使用原始文本流，方便理解原理，并不是严格的 SSE 事件格式。</p>
<p>在生产环境中，还需要增加用户鉴权、请求限流、错误事件协议、日志和持久化等机制。</p>
<p>尤其需要注意：响应头已经发送后，不能再像普通 JSON API 一样随意修改 HTTP 状态码。</p>
<h3>8.3 React 前端实现流式渲染</h3>
<p>接下来，我们使用 Fetch API 的 ReadableStream 读取响应。</p>
<pre><code>import { useRef, useState } from "react";

export function Chat() {
  const [message, setMessage] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  const controllerRef =
    useRef&lt;AbortController | null&gt;(null);

  async function sendMessage() {
    if (!message.trim() || loading) return;

    const controller = new AbortController();
    controllerRef.current = controller;

    setLoading(true);
    setAnswer("");

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ message }),
        signal: controller.signal
      });

      if (!response.ok || !response.body) {
        throw new Error("Request failed");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        const text = decoder.decode(value, {
          stream: true
        });

        setAnswer(prev => prev + text);
      }

      const tail = decoder.decode();
      if (tail) setAnswer(prev => prev + tail);
    } catch (error) {
      if (!controller.signal.aborted) {
        console.error(error);
      }
    } finally {
      setLoading(false);
      controllerRef.current = null;
    }
  }

  function stopGeneration() {
    controllerRef.current?.abort();
  }

  return (
    &lt;div&gt;
      &lt;textarea
        value={message}
        onChange={e => setMessage(e.target.value)}
      /&gt;

      &lt;button onClick={sendMessage}&gt;
        发送
      &lt;/button&gt;

      &lt;button onClick={stopGeneration}&gt;
        停止生成
      &lt;/button&gt;

      &lt;div&gt;{answer}&lt;/div&gt;
    &lt;/div&gt;
  );
}</code></pre>
<p>这里最重要的代码是：</p>
<pre><code>const reader = response.body.getReader();</code></pre>
<p>它允许前端逐块读取响应数据。</p>
<p>每收到一块数据，就更新 React 状态：</p>
<pre><code>setAnswer(prev => prev + text);</code></pre>
<p>因此，用户可以看到文字逐步出现。</p>
<p>但有一个非常重要的区别：</p>
<p><strong>网络 Chunk 不等于 Token。</strong></p>
<p>一次网络 Chunk 可能包含多个 Token，也可能只包含一个 Token 的部分 UTF-8 字节。</p>
<p>这也是为什么我们使用 TextDecoder 并开启 stream: true。</p>
<h2>九、生产级 AI 聊天机器人应该如何优化？</h2>
<p>当用户规模增加后，除了让聊天机器人能够回答问题，还需要关注延迟、成本、并发和稳定性。</p>
<h3>9.1 常见性能问题与优化方向</h3>
<table><thead><tr><th>问题</th><th>可能原因</th><th>优化方向</th></tr></thead><tbody>
<tr><td>首字输出慢</td><td>Prefill、排队、网络</td><td>缩短上下文、缓存提示词</td></tr>
<tr><td>持续生成慢</td><td>Decode 吞吐量不足</td><td>模型选型、推理服务优化</td></tr>
<tr><td>显存不足</td><td>KV Cache、并发过高</td><td>限流、GQA、缓存管理</td></tr>
<tr><td>成本过高</td><td>输入输出 Token 过多</td><td>摘要、缓存、模型分级</td></tr>
<tr><td>前端卡顿</td><td>频繁更新 React 状态</td><td>批量更新、节流渲染</td></tr>
</tbody></table>
<h3>9.2 为什么需要限制上下文长度？</h3>
<p>假设一个聊天机器人有 100 轮历史消息。</p>
<p>如果每次请求都把所有历史消息发送给模型，就可能出现：</p>
<pre><code>第 1 轮：  100 Tokens
第 2 轮：  300 Tokens
第 3 轮：  500 Tokens
...
第 100 轮：20,000 Tokens</code></pre>
<p>这会增加输入 Token 成本和 Prefill 计算负担。</p>
<p>实际应用通常需要结合：</p>
<ul><li>最近消息窗口。</li><li>历史对话摘要。</li><li>相关记忆检索。</li><li>系统提示词缓存。</li></ul>
<p>这些属于应用层上下文管理，与模型内部的 KV Cache 并不是一回事。</p>
<h3>9.3 如何衡量优化是否有效？</h3>
<p>建议至少监控：</p>
<table><thead><tr><th>指标</th><th>目标</th></tr></thead><tbody>
<tr><td>TTFT P50/P95</td><td>观察首字响应延迟</td></tr>
<tr><td>Decode TPS</td><td>观察持续生成速度</td></tr>
<tr><td>输入 / 输出 Token</td><td>分析使用量和成本</td></tr>
<tr><td>错误率</td><td>识别超时与服务失败</td></tr>
<tr><td>取消率</td><td>识别用户主动中止</td></tr>
<tr><td>上下文长度</td><td>识别超长请求</td></tr>
</tbody></table>
<p>对于生产级服务，建议分别观察 P50、P95 和 P99，而不是只看平均值。</p>
<h2>十、本篇总结</h2>
<p>我们把今天学习的知识串联起来：</p>
<div class="visual"><div class="step"><b>1. Prefill</b><small>处理已有输入上下文</small></div><div class="arrow">↓</div>
<div class="step"><b>2. Decode</b><small>逐步生成下一个 Token</small></div><div class="arrow">↓</div>
<div class="step"><b>3. KV Cache</b><small>缓存历史 Key / Value，减少重复计算</small></div><div class="arrow">↓</div>
<div class="step"><b>4. Temperature / Top-p</b><small>控制 Token 采样策略</small></div><div class="arrow">↓</div>
<div class="step"><b>5. Streaming</b><small>把生成内容增量传输给客户端</small></div></div>
<p>最重要的一句话：</p>
<p><strong>模型通过 Prefill 处理已有上下文，通过 Decode 逐 Token 生成内容，通过 KV Cache 提升推理效率，而聊天应用通过 Streaming 将生成结果实时呈现给用户。</strong></p>
<h2>十一、交互式课后测验</h2>
<div class="visual"><div v-for="(q,i) in questions" :key="i" class="question"><strong>{{i+1}}. {{q.q}}</strong><label v-for="(o,j) in q.opts" :key="j" class="option"><input type="radio" :name="'chapter6-'+i" :checked="selected[i]===j" @change="pick(i,j)"/>{{o}}</label><p v-if="submitted" class="feedback">{{selected[i]===q.a?'✓ 回答正确':'正确答案：'+q.opts[q.a]}}。{{q.why}}</p></div><div class="buttons"><button :disabled="questions.some((_,i)=>selected[i]===undefined)" @click="submitted=true">提交评分</button><button @click="reset">重新作答</button></div><div v-if="submitted" class="score">得分：{{score}} / {{questions.length}}</div></div>
<h2>十二、学习疑问与解答</h2>
<h3>Q1：有了 KV Cache，Attention 的计算就没有成本了吗？</h3><p>不是。KV Cache 省去历史 K/V 的重复计算，但新 Token 仍需与可访问的历史位置计算注意力，而且缓存需要显存。</p>
<h3>Q2：Temperature 设为零，就一定得到完全相同的回答吗？</h3><p>不一定。贪心选择降低采样随机性，但并行数值计算、服务端实现和模型版本等因素仍可能造成差异。</p>
<h3>Q3：为什么用户已经发出的完整问题不违反 Causal Mask？</h3><p>问题在生成开始前已作为输入上下文存在；因果掩码限制的是模型在某个序列位置访问未来位置，而不是禁止它阅读用户已经提供的内容。</p>
<h3>Q4：SSE 和 Token 生成是一回事吗？</h3><p>不是。Token 生成发生在模型推理层；SSE 等协议负责把服务端的增量事件传给浏览器。一次网络事件也不一定严格对应一个 Token。</p>
<footer><a href="./05-llm-training">← 第 05 篇</a><a href="./">课程目录</a></footer>
</article>
</template>
<style scoped>
.lesson{font-size:15px;line-height:1.85;color:var(--vp-c-text-1);overflow-wrap:anywhere}.meta{font-size:12px;color:var(--vp-c-text-2)}h1{font-size:30px;line-height:1.35;margin:16px 0 24px}h2{font-size:23px;margin:36px 0 18px;border-top:1px solid var(--vp-c-divider);padding-top:12px}h3{font-size:17px;margin:20px 0 10px}p{margin:14px 0}.visual{border:1px solid var(--vp-c-divider);border-radius:14px;padding:18px;margin:20px 0}.visual>strong{display:block;margin-bottom:12px}.visual>small,.step small{display:block;font-size:12px;color:var(--vp-c-text-2);margin-top:8px}.step{background:var(--vp-c-bg-soft);border-radius:8px;padding:12px;text-align:center}.blue{background:rgba(37,99,235,.09)}.green{background:rgba(22,163,74,.09)}.arrow{text-align:center;padding:7px;color:var(--vp-c-text-2)}.formula{text-align:center;background:var(--vp-c-bg-soft);padding:18px;border-radius:9px;font-size:19px;overflow-x:auto}table{display:table;width:100%;font-size:14px}td,th{padding:9px}pre{background:var(--vp-code-block-bg);border-radius:10px;padding:18px;overflow:auto}pre code{font-size:13px;white-space:pre;color:var(--vp-c-text-1)}label{display:block;margin:10px 0}input[type=range]{display:block;width:100%;accent-color:var(--vp-c-brand-1)}.metrics{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin:14px 0}.metrics b{font-size:22px}.probrow{display:flex;gap:8px;align-items:center;margin:10px 0;font-size:13px}.probrow>span:first-child{width:38px}.probrow>span:last-child{width:55px;text-align:right}.track{flex:1;background:var(--vp-c-bg-soft);border-radius:10px;height:13px;overflow:hidden}.fill{height:100%;background:#2563eb;border-radius:10px}.option{padding:8px;border:1px solid var(--vp-c-divider);border-radius:8px;cursor:pointer}.option input{margin-right:8px}.question{padding:14px 0;border-bottom:1px solid var(--vp-c-divider)}.feedback{background:var(--vp-c-bg-soft);padding:10px;border-radius:8px}.buttons{display:flex;gap:10px;margin-top:15px}.buttons button{background:var(--vp-c-bg-soft);border:1px solid var(--vp-c-divider);border-radius:8px;padding:8px 14px;cursor:pointer}.buttons button:disabled{opacity:.4}.score{text-align:center;font-size:22px;font-weight:bold;margin:15px}footer{display:flex;justify-content:space-between;border-top:1px solid var(--vp-c-divider);padding-top:16px;margin-top:30px}@media(max-width:600px){h1{font-size:24px}h2{font-size:20px}.visual{padding:12px}}
</style>
