---
title: "09 · 多轮对话与上下文管理"
outline: deep
readingTime: "20"
courseMeta: false
---

<script setup>
import CourseWebArticle from '../../../.vitepress/theme/components/CourseWebArticle.vue'
import LessonQuiz from '../../../.vitepress/theme/components/LessonQuiz.vue'
import source from '../../../.vitepress/theme/components/course-sources/09-conversation-memory.web.html?raw'
import '../../../.vitepress/theme/components/course-sources/09-conversation-memory.web.css'
</script>

<CourseWebArticle :source="source" :chapter="9" />

::: info 本地补充练习与解答
提供的 09.htm 在第十一节的测验介绍后结束，没有保存实际题目及第十二节。以下保留原有本地的五道练习题和学习解答，供学习自测与参考。
:::

<LessonQuiz :chapter="9" />

## 学习疑问与解答（本地补充）

### Q1：恢复聊天界面，为什么不等于让模型知道历史？

恢复 UI 是从数据库读取消息并渲染 React；让模型利用历史，则需要在推理请求中提供相关消息，或使用支持服务端会话状态的 API。两条流程的服务对象不同。

### Q2：短期记忆与长期记忆分别适合什么数据库？

会话历史可存 PostgreSQL、MySQL、MongoDB 或 SQLite；Redis 可用于热点会话缓存。长期结构化记忆可存 PostgreSQL，语义检索可用 pgvector、Qdrant、Milvus 等。

### Q3：PostgreSQL 是向量数据库吗？

PostgreSQL 本质是关系型数据库。安装 pgvector 扩展后，可以在同一数据库中存储 Embedding 向量并执行相似度检索。初期 AI 聊天机器人推荐 PostgreSQL + pgvector；确有性能需求再加 Redis。

### Q4：为什么长期记忆不应该直接等于全部聊天记录？

聊天历史可能包含无关、过期或敏感内容。长期记忆应按价值、授权、有效期与相关性筛选，并提供查看、更正和删除机制。

### Q5：KV Cache 是不是长期记忆？

不是。KV Cache 是模型推理时复用的 Key/Value 中间状态，不是面向用户偏好和项目事实的持久化记忆库。
