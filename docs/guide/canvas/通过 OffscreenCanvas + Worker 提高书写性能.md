# 通过 OffscreenCanvas + Worker 提高书写性能

## 前言
上一节我们通过离屏渲染提高了 Canvas 的渲染性能，但是在绘制的过程中，我们会发现，当绘制的图形越来越多时，Canvas 的渲染性能会越来越差，这是因为我们在绘制图形时，是在主线程中进行的，而主线程中还有其他的任务，因此会导致 Canvas 的渲染性能越来越差。

这节我们将通过 OffscreenCanvas + Worker 将绘制图形的任务放到 Worker 中进行，避免阻塞主线程，从而提高 Canvas 的渲染性能。

## 实现思路

在 worker 线程中是无法操作 DOM 的，但 OffscreenCanvas 可以在 worker 线程中进行操作，因此我们可以通过 OffscreenCanvas 将绘制图形的任务放到 worker 线程中进行。这样可以减少主线程的任务，从而提高书写性能。

## 具体实现

### 创建 OffscreenCanvas

```js

const canvas = document.getElementById('draw');
const offScreenCanvas = canvas.transferControlToOffscreen(); // 将 canvas 转换为 offScreenCanvas
```

### 将 offScreenCanvas 传递给 worker 线程

```js
const worker = new Worker('./worker.js'); // 创建一个 webWorker
const offScreenCanvas = canvas.transferControlToOffscreen(); // 将 canvas 转换为 offScreenCanvas

worker.postMessage({
    type: 'init',
    offScreenCanvas,
    width: width,
    height: height,
    dpr,
}, [offScreenCanvas]); // 将 offScreenCanvas 传递给 webWorker


worker.onmessage = function (e) {
    const type = e.data.type;
    switch (type) {
        case 'init':
            init = true; // 判断是否初始化完毕
            break;
    }
}
```

### 通过监听事件获取书写的坐标点传递给 worker 线程, 然后在 worker 线程中进行绘制

```js

/**
 * 自由画笔的实现思路
 * 1 监听鼠标事件
 * 2 将鼠标移动的轨迹记录下来
 * 3 然后将这些点连接成线
 */
canvas.addEventListener("pointerdown", (e) => {
    if (!init) return;
    start = true; // 通过监听鼠标按下事件，来判断是否开始绘制
    addPoint(e); // 将鼠标按下的点添加到points数组中
});

canvas.addEventListener(
    "pointermove",
    (e) => {
        console.log("e--->throttle", e);
        if (!start) return; // 如果没有按下，则不绘制
        addPoint(e); // 将鼠标移动的点添加到points数组中
        init && worker.postMessage({
            type: 'render',
            points,
        }); // 将 点 传递给 webWorker
    }
);

canvas.addEventListener("pointerup", (e) => {
    start = false;
    points = []; // 绘制完毕后，清空points数组
});


/*
* 将鼠标事件的点转化为相对于canvas的坐标上的点
*/
function addPoint(e) {
    const x = e.clientX;
    const y = e.clientY;
    points.push({
        x,
        y,
    });
}
```

## 实现效果
![初始状态图](./../../public/assets/canvas/19.gif)

[具体代码](https://github.com/enson0131/learn/blob/main/Canvas/%E7%99%BD%E6%9D%BF%E7%9B%B8%E5%85%B3/%E6%80%A7%E8%83%BD%E4%BC%98%E5%8C%96%E4%B9%8BOffscreenCanvas.html)
## 参考文章
- https://mdn.github.io/dom-examples/web-workers/offscreen-canvas-worker/
- https://developer.mozilla.org/zh-CN/docs/Web/API/OffscreenCanvas
- https://developer.mozilla.org/zh-CN/docs/Web/API/ImageBitmap
