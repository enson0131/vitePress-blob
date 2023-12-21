# 可视区域内渲染提高 Canvas 的书写性能

## 前言
上一节我们通过离屏渲染提高了 Canvas 的渲染性能，但是离屏渲染也有一些缺点，比如会增加内存的使用，而且在某些场景下，离屏渲染的性能并不会比直接在 Canvas 上绘制要高。本节我们将介绍如何通过可视区域内渲染提高 Canvas 的书写性能。

## 前提
一般我们说的可视区域内渲染，是指在 Canvas 上只绘制可视区域内的内容，而不是绘制整个 Canvas 的内容。这样做的好处是可以减少 Canvas 的绘制区域，从而提高 Canvas 的渲染性能。

对于 Canvas 而言，无法无限制地扩大 Canvas 的面积，因此浏览器对 Canvas 的大小也有一定的限制。从 [MDN 文档](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/canvas#%E6%9C%80%E5%A4%A7%E7%9A%84%E7%94%BB%E5%B8%83%E5%B0%BA%E5%AF%B8) 可知, 在 Chrome 浏览器中，Canvas 的大小限制为 32767px * 32767px。由于 Canvas 的大小限制，因此我们在实现 `无限画布` 的功能时，不能无限的拓展 Canvas 的大小，而应该通过坐标的切换，来实现无限画布的功能。

## 实现无限画布

### 实现思路

记初始坐标A (x, y), 横向滚动距离为 scrollX, 纵向滚动距离为 scrollY

在初始状态下, scrollX、scrollY 均为 0

![初始状态图](./../../public/assets/canvas/13.png)


假设现在，我们在水平方向向右滚动了scrollX，垂直方向向下滚动scrollY。那么滚动后的坐标就是

x1 = x - scrollX

y1 = y - scrollY

这里大家可能会有疑惑，为什么是减法呢？因为向下滚动后，绘制的图形应该是往上移动的，因此我们需要减去滚动的距离。

![滚动后的状态图](./../../public/assets/canvas/14.png)

### 具体实现
WheelEvent 事件能够监听鼠标滚动。其中的 WheelEvent.deltaX 记录了横向滚动量（也就是我们上面说到的 scrollX），WheelEvent.deltaY 记录了纵向滚动量 （上面说的 scrollY）

我们可以在 Canvas 上监听 WheelEvent 事件，然后根据 WheelEvent.deltaX 和 WheelEvent.deltaY 来计算出滚动后的坐标，从而实现无限画布的功能。

```js

```
### 实现效果

## 可视区域内渲染

### 实现思路

### 具体效果

### 实现效果

## 参考文章
- https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/canvas#%E6%9C%80%E5%A4%A7%E7%9A%84%E7%94%BB%E5%B8%83%E5%B0%BA%E5%AF%B8
