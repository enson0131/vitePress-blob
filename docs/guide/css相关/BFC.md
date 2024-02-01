# BFC

块级格式化上下文

## 条件

1. 根元素 (html)
2. 浮动元素
3. position 为绝对定位元素 （absolute/fixed）
4. display: inline-block、inline-flex等
5. overflow: auto/scroll/hidden (overflow 值不为 visible 或 clip 的块级元素)


## 特点

1. BFC 内部元素不影响外部元素
2. 计算高度需要计算浮动元素
3. BFC 区域不会与浮动容器发生重叠
4. 在 BFC 中上下相邻的俩个容器的 margin 会重叠
5. 每个元素的左 margin 值和容器的左 border 相接触


## 作用

1. 清除浮动带来的高度塌陷问题
2. 解决俩个元素的 margin 重叠问题
3. 创建自适应的俩栏布局