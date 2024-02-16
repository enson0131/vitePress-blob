# Loader

loader 是一个加载器，让 webpack 拥有加载和解析非 JavaScript 文件的能力

## 类型
1. pre - 前置
2. normal - 普通
3. inline - 行内
4. post - 后置

```js
// 定义在 require 请求内部的叫做行内 loader
const a = require('inline1-loader!inline2-loader!a.js');
```

- 如果是 `!` 作为前缀，将禁用 normal loader，例如 `!inline1-loader!inline2-loader!a.js`
- 如果是 `!!` 作为前缀，将禁用所有 loader，例如 `!!inline1-loader!inline2-loader!a.js`
- 如果是 `-!` 作为前缀，将禁用所有 loader 但不包含 post loader，例如 `-!inline1-loader!inline2-loader!a.js`
