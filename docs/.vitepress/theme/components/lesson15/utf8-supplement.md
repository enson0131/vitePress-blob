在 AI 聊天场景中，如果使用 **SSE（Server-Sent Events）或 Fetch Stream** 接收流式数据，一个中文字符的 UTF-8 字节可能被拆成两段返回。

例如，中文字符 `你` 在 UTF-8 中占 **3 个字节**：
```
你 = E4 BD A0

第一次收到：E4 BD
第二次收到：A0
```

如果分别解码，可能出现乱码 `�`。

## 1. 错误实现 ❌
```
const reader = response.body!.getReader();

while (true) {
  const { done, value } = await reader.read();

  if (done) break;

  // 每次独立解码，可能导致中文乱码
  const text = new TextDecoder().decode(value);

  console.log(text);
}
```

原因：每次创建新的 `TextDecoder`，无法保留上一次未完成的 UTF-8 字节。

## 2. 正确实现 ✅

**使用 `TextDecoder` 的流式解码模式 `{ stream: true }`。**
```
const response = await fetch('/api/chat');

const reader = response.body!.getReader();

const decoder = new TextDecoder('utf-8');

while (true) {
  const { done, value } = await reader.read();

  if (done) break;

  // 保留不完整的 UTF-8 字节，等待下一次数据
  const text = decoder.decode(value, {
    stream: true,
  });

  console.log(text);
}

// 处理最后可能残留的字节
const remaining = decoder.decode();

if (remaining) {
  console.log(remaining);
}
```

### 原理

假设服务端返回：
```
Chunk 1: E4 BD
Chunk 2: A0 E5 A5 BD
```

执行过程：

| 次数  | 收到字节          | TextDecoder 输出 |
| --- | ------------- | -------------- |
| 第一次 | `E4 BD`       | `""`（缓存不完整字符）  |
| 第二次 | `A0 E5 A5 BD` | `"你好"`         |

`TextDecoder` 会自动缓存未完成的 UTF-8 字节序列。

## 3. 更推荐：TextDecoderStream

现代浏览器可以直接使用 `TextDecoderStream`：
```
const response = await fetch('/api/chat');

const stream = response.body!
  .pipeThrough(new TextDecoderStream());

for await (const text of stream) {
  console.log(text);
}
```

这样就不需要手动管理 `TextDecoder`。
