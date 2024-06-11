# 构建可复用的 PromptTemplate

Prompt 是大模型的核心，传统的方式一般是通过字符串或者字符串模版来构建 Prompt，但是这种方式不够灵活，也不够易用。为了解决这个问题，LangChain 引入了 PromptTemplate，它是一个可以复用的 Prompt 模版，可以通过参数化的方式来构建 Prompt。


### 基础的 Prompt 模版使用

```js
// 基础的 Prompt 模版使用
import { PromptTemplate } from "@langchain/core/prompts";

const greetingPrompt = new PromptTemplate({
    inputVariables: [], // 不传入任何变量
    template: 'hello world'
})

const formattedGreetingPrompt = await greetingPrompt.format();

console.log(formattedGreetingPrompt); // Prompt 模版 👉 hello world

// -----------------------------------------------------------------

const personalizedGreetingPrompt = new PromptTemplate({
    inputVariables: ["name"], // 传入一个变量
    template: "hello，{name}",
});

const formattedPersonalizedGreetingPrompt = await personalizedGreetingPrompt.format({
    name: "enson"
});

console.log(formattedPersonalizedGreetingPrompt); // 变量 Prompt 模版 👉 hello，enson

// -----------------------------------------------------------------

// 语法糖模版
const autoInferTemplate = PromptTemplate.fromTemplate("hello，{name}");

const formattedAutoInferTemplate = await autoInferTemplate.format({
    name: "enson",
});
console.log(formattedAutoInferTemplate)
```

基础的 Prompt 模版的使用类似于字符串模版，只是在字符串中加入了变量，然后通过 `format` 方法传入变量的值，就可以得到最终的 Prompt 模版。


### Chat Prompt 模版使用

经过了前面的基础 Prompt 模版的使用，我们可以进一步使用 Chat Prompt 模版，在日常开发中，使用 Chat Prompt 模版的场景更多。

因为在和各种模型聊天交互时，在构建信息不仅需要包含上下文内容，还需要包含对应的角色信息。例如这条信息是由 人类、AI 还是给 ChatBot 指定的 System 信息。

这种结构化的信息有助于模型更好的理解上下文，从而更好的回答问题。

LangChain 提供了几种与聊天相关的提示模版类，如 `SystemMessagePromptTemplate`、`HumanMessagePromptTemplate`、`AIMessagePromptTemplate` 以及 `ChatPromptTemplate` 等。

前面三个对应着不同的角色:

- `system` 角色的消息通常用于设置对话的上下文或指定模型采取特定的行为模式。这些消息不会直接显示在对话中，但它们对模型的行为有指导作用。 可以理解成模型的元信息，权重非常高，在这里有效的构建 prompt 能取得非常好的效果。
- `user` 角色代表真实用户在对话中的发言。这些消息通常是问题、指令或者评论，反映了用户的意图和需求。
- `assistant` 角色的消息代表 AI 模型的回复。这些消息是模型根据 system 的指示和 user 的输入生成的。

接下来我们以 `翻译` 的场景为例，来构建一个 Chat Prompt 模版。

```js
import { SystemMessagePromptTemplate } from '@langchain/core/prompts';
import { HumanMessagePromptTemplate } from "@langchain/core/prompts";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { Ollama } from '@langchain/community/llms/ollama';

const systemTemplate = "你是一个专业的翻译员，你的任务是将文本从{source_lang}翻译成{target_lang}。";
const humanTemplate = "请翻译这句话：{text}";

const chatPrompt2 = ChatPromptTemplate.fromMessages([
  ["system", systemTemplate],
  ["human", humanTemplate],
]);


const outputParser = new StringOutputParser(); // 输出字符串
const chatModel = new Ollama({
    baseUrl: "http://localhost:11434", 
    model: "llama3", 
});

const chain = chatPrompt2.pipe(chatModel).pipe(outputParser);

const res = await chain.invoke({
    source_lang: "中文",
    target_lang: "英语",
    text: "你好，世界",
})

console.log(res);
```


### 组合多个 Prompt 模版

可以通过 `PipelinePromptTemplate` 组合多个 Prompt 模版，这样可以更好的复用和管理 Prompt 模版。


在 PipelinePromptTemplate 有两个核心的概念：

- `pipelinePrompts`，一组 `object`，每个 object 表示 prompt 运行后赋值给 name 变量
- `finalPrompt`，表示最终输出的 prompt