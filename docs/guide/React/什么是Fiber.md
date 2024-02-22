# 对 Fiber 的理解


在 React 15 中通过 `递归` 的形式进行对比，找到需要更新的节点，并同步更新它，在这段时间一直占据着浏览器主线程，可能会给用户带来卡顿的感受（在渲染进程中，`js线程和渲染线程是互斥的`）

在 React 15 以后引入了 Fiber 架构，将对比的过程变成了`异步可中断`的过程，让出浏览器的使用权，让浏览器处理更高优先级的事情


Fiber 的调和过程（Reconciler）由分成了 `beginWork` 阶段 和 `completeUnitOfWork` 阶段。

`beginWork` 阶段自顶向下，根据当前工作的 Fiber 节点最新的 React Element 子元素与旧 Fiber 节点进行对比，决定是否需要复用旧 Fiber 节点并标记 Fiber 节点是否有副作用。

`compeleteUnitOfWork` 阶段自底向上构建副作用链表，生成的 DOM 节点挂在 Fiber 的 stateNode 属性