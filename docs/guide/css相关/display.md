# display

## none

不显示元素，脱离文档流

## inline 行内元素

不能设置宽高、不换行

水平 padding、margin 有效

垂直方向 padding、margin 无效

## line-block

可以设置宽高、不换行

## block

块级元素，可以设置宽高，独占一行

## flex

弹性布局

## table

元素作为块级表格元素使用

## inherit

继承父元素 display 值


## 常见的问题

line-block、inline 都会有空格问题

因为浏览器会将换行符当空格字符处理


解决方案：
1. 使用 font-size 时，可通过设置 font-size: 0、letter-spacing、word-spacing 解决
2. 使用弹性布局
3. 使用 margin 负值

## 浏览器对于空格的默认表现

1. 元素的头尾的空白符会直接忽略
2. 内容中间有多个空格，会被合并成一个空格

```js
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
  <style>
    .inline-block {
      display: inline-block;
      width: 50px;
      height: 50px;
      background-color: aqua;
    }
  </style>
</head>

<body>
  <h2>inline-block的空格问题</h2>
  <p>-------------------------------------------------------</p>
  <p class="inline-block">我我</p>
  <p class="inline-block">我我</p>
  <p>-------------------------------------------------------</p>
  <h2>inline的空格问题</h2>
  <span>我我我我</span>
  <span>我我我我</span>
  <span>我我我我</span>

  <h3>原因</h3>
  <ul>
    <li>换行符会被当做空格字符处理</li>
  </ul>
  <h3>解决方案</h3>
  <ul>
    <li>使用font-size时，可通过设置font-size:0、letter-spacing、word-spacing解决</li>
    <li>使用弹性布局</li>
    <li>使用margin负值</li>
  </ul>
  <p>-------------------------------------------------------</p>
  <p>-------------------------------------------------------</p>
  <h2>浏览器对于空格的默认表现</h2>
  <ul>
    <li>元素的头尾的空白符会直接忽略</li>
    <li>内容中间有多个空格，会被合并成一个空格</li>
  </ul>
</body>
```

