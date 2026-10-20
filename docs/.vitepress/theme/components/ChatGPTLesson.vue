<script setup lang="ts">
import LessonQuiz from './LessonQuiz.vue'
import CourseSourceArticle from './CourseSourceArticle.vue'
import originalArticle from './course-sources/01-how-chatgpt-works.html?raw'
</script>
<template>
<article class="lesson">
<CourseSourceArticle :source="originalArticle" />
<section class="enrichment" aria-label="补充学习"><h2>补充学习：交互图解与课后测验</h2>
<div class="visual"><strong>大语言模型的自回归生成流程</strong>
<svg viewBox="0 0 400 570" role="img" aria-label="用户输入、Tokenization、Token ID、Transformer、下一个 Token 概率、选择 Token、是否结束及循环">
<defs><marker id="arrow01" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto"><path d="M0 0 L7 3.5 L0 7Z" fill="#64748b"/></marker></defs>
<g v-for="(item,i) in [{label:'用户输入',y:12},{label:'Tokenization（分词）',y:86},{label:'转换成 Token ID',y:160},{label:'Transformer 模型计算',y:234},{label:'预测下一个 Token 的概率',y:308},{label:'选择下一个 Token',y:382}]" :key="i">
<rect x="83" :y="item.y" width="234" height="46" rx="8" fill="#6366f1" fill-opacity=".10" stroke="#8b5cf6" stroke-opacity=".65"/>
<text x="200" :y="item.y+29" text-anchor="middle" font-size="15" fill="currentColor">{{item.label}}</text>
<path v-if="i<5" :d="'M200 '+(item.y+46)+' V'+(item.y+73)" fill="none" stroke="#64748b" stroke-width="1.5" marker-end="url(#arrow01)"/>
</g>
<path d="M200 428 L244 470 L200 512 L156 470 Z" fill="#6366f1" fill-opacity=".1" stroke="#8b5cf6"/>
<text x="200" y="475" text-anchor="middle" font-size="13" fill="currentColor">是否结束？</text>
<path d="M244 470 H365 V257 H317" fill="none" stroke="#64748b" stroke-width="1.5" marker-end="url(#arrow01)"/>
<text x="344" y="455" font-size="13" fill="currentColor">否</text>
<path d="M200 512 V530" fill="none" stroke="#64748b" stroke-width="1.5" marker-end="url(#arrow01)"/>
<rect x="130" y="533" width="140" height="33" rx="7" fill="#6366f1" fill-opacity=".10" stroke="#8b5cf6"/>
<text x="200" y="554" text-anchor="middle" font-size="14" fill="currentColor">输出答案</text>
<text x="211" y="528" font-size="12" fill="currentColor">是</text>
</svg></div>
<div class="visual"><strong>React + Node.js + LLM API 架构</strong>
<svg viewBox="0 0 430 470" role="img" aria-label="React UI 到 Node.js API 再到 LLM API，流式返回 React UI 的架构图">
<defs><marker id="arch01" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto"><path d="M0 0 L7 3.5 L0 7Z" fill="#64748b"/></marker></defs>
<g v-for="(item,i) in [{name:'React UI',detail:'用户输入聊天内容',y:10},{name:'Node.js API',detail:'鉴权、构建 Messages、调用模型',y:126},{name:'LLM API',detail:'Tokenization、Transformer、生成',y:242},{name:'React UI',detail:'实时显示模型回答',y:358}]" :key="i">
<rect x="80" :y="item.y" width="270" height="75" rx="9" fill="#6366f1" fill-opacity=".10" stroke="#8b5cf6" stroke-opacity=".6"/>
<text x="215" :y="item.y+29" text-anchor="middle" font-size="18" fill="currentColor">{{item.name}}</text>
<text x="215" :y="item.y+53" text-anchor="middle" font-size="12" fill="currentColor">{{item.detail}}</text>
<path v-if="i<3" :d="'M215 '+(item.y+75)+' V'+(item.y+110)" stroke="#64748b" fill="none" stroke-width="1.5" marker-end="url(#arch01)"/>
</g>
<text x="228" y="110" font-size="12" fill="currentColor">HTTP Request</text>
<text x="228" y="226" font-size="12" fill="currentColor">API Request</text>
<text x="228" y="342" font-size="12" fill="currentColor">Streaming</text>
</svg></div>
<LessonQuiz :chapter="1" />
</section>
<footer><span>第 01 / 40 篇</span><a href="./02-token-and-embedding">下一篇：Token 与 Embedding →</a></footer>
</article>
</template>
<style scoped>
.lesson { min-width: 0; color: var(--vp-c-text-1); }
.enrichment { margin-top: 36px; font-size: 15px; line-height: 1.85; }
.enrichment > h2 { margin: 34px 0 16px; padding-top: 12px; border-top: 1px solid var(--vp-c-divider); font-size: 23px; }
.visual { margin: 20px 0; padding: 18px; border: 1px solid var(--vp-c-divider); border-radius: 14px; }
.visual svg { display: block; width: 100%; max-width: 480px; margin: 0 auto; }
footer { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 12px; margin-top: 30px; padding-top: 16px; border-top: 1px solid var(--vp-c-divider); }
@media (max-width: 600px) { .enrichment > h2 { font-size: 20px; } }
</style>
