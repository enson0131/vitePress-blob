# LangChain 快速入门

## 安装

要安装这个包，你可以使用 npm 或 yarn：

```bash
yarn add langchain
```

## 安装环境

node >= 18.x

## 什么是 LCEL (LangChain Expression Language)

LangChain Expression Language is a way to create arbitrary custom chains. It is built on the [Runnable](https://v02.api.js.langchain.com/classes/langchain_core_runnables.Runnable.html) protocol.

LCEL 无论是 python 还是 js 版本都在主推的新设计，能创建自定义的链，它是基于 [Runnable](https://v02.api.js.langchain.com/classes/langchain_core_runnables.Runnable.html) 协议构建的。


## LCEL 有什么优势

LCEL 从底层设计的目标就是支持 **从原型到生产** 完整流程不需要修改任何代码，也就是我们在写的任何原型代码不需要太多的改变就能支持生产级别的各种特性（比如并行、steaming 等），具体来说会有这些优势：

- 并行: 只要是整个 chain 中有可以并行的步骤就会自动的并行，来减少使用时的延迟。
- 自动的重试和 fallback: 大部分 chain 的组成部分都有自动的重试（比如因为网络原因的失败）和回退机制，来解决很多请求的出错问题。
- 


# 参考文章
- https://js.langchain.com/v0.2/docs/how_to/
- 