# React 是如何渲染的



## React 16 以前
在浏览器中 js 线程与渲染线程是互斥的，如果 js 线程长期占用着浏览器的主线程，那么界面将长时间不更新，在动画等一些场景下会造成卡顿效果。

因为 Stack Reconciler 是一个同步的递归过程，随着业务复杂度增加，Stack Reconciler 需要的调和时间会变长，

这意味着 js 将长时间占用浏览器，进而导致页面卡顿

![Stack Reconciler](./../../public/assets/3.png)


## React 16 以后
将同步执行的 Stack Reconciler 替换成了异步可中断的 Fiber Reconciler

![Fiber Reconciler](./../../public/assets/4.png)

在更新时，每个任务会被赋予一个优先级，当任务抵达调度器时，高优先级的任务会更快抵达协调器，如有新的更高优先级的任务进入调度器时，当前协调器的任务就会被中断，更高优先级的任务将进入 reconciler

![Fiber Reconciler](./../../public/assets/5.png)

新的架构会导致部分生命周期重复执行:
- componentWillMount
- componentWillUpdate
- showComponentUpdate
- componentWillReceiveProps

![Render Performance](./../../public/assets/12.png)

从首次渲染的调用栈来看，React 的渲染过程主要分为以下几个步骤:
- 1. Mount 阶段
- 2. Render 阶段
- 3. Commit 阶段


## Mount 阶段

当执行 ReactDOM.render 时会直接调用 `legacyRenderSubtreeIntoContainer` 方法

### legacyRenderSubtreeIntoContainer 方法

会创建 reactRootContainer 对象（也就是挂载的容器对象）,
reactRootContainer 对象的 _internalRoot 会指向 fiberRoot (FiberRootNode 类)，也就是根节点对象。

`legacyRenderSubtreeIntoContainer` 最终返回挂载组件( App组件 )的实例对象。

![Mount 渲染过程](./../../public/assets/6.png)

![FiberRootNode对象的描述](./../../public/assets/7.png)


在 fiberRoot 对象（ FiberRootNode类 ）中的 current 属性将指向 rootFiber 对象 （根节点Fiber，即 FiberNode 实例）

![fiberRoot对象指向 rootFiber 根节点Fiber](./../../public/assets/8.png)

![挂载创建关系图](./../../public/assets/9.png)


### updateContainer 函数

updateContainer 函数主要有以下 3 件事: 

- 1. 获取当前节点的优先级 lane
- 2. 结合 lane 创建当前 Fiber 节点 update 对象，并将其入队
- 3. 调度当前节点 (rootFiber 节点)

![updateContainer](./../../public/assets/11.png)


### scheduleUpdateOnFiber 函数

scheduleUpdateOnFiber 函数中会获取 Fiber 节点的mode属性判断是否走同步渲染还是异步渲染的逻辑，在 React17 中首次渲染走的是同步渲染的逻辑

![scheduleUpdateOnFiber](./../../public/assets/13.png)


这里可能有小伙伴会问，Fiber架构不就是异步渲染的么？
我想说的是，Fiber架构的设计初衷确实是为了异步渲染而设计的，但是 Fiber 架构并不能和异步渲染画上等号，我们不难发现，Fiber 架构同时兼容了同步渲染和异步渲染，如下图，决定同步还是异步取决于 mode

![mode 决定同步异步](./../../public/assets/14.png)


## Render 阶段

### performSyncWorkOnRoot 函数
核心逻辑在 `renderRootSync` 函数中

### renderRootSync 函数
核心方法有俩个 `prepareFreshStack` 和 `workLoopSync` 函数

![renderRootSync 逻辑](./../../public/assets/16.png)


### prepareFreshStack 函数
主要是有个方法 `createWorkInProgress` , 用来构建 workInProgress 双缓冲树，通过 `alternate` 相互指向

![createWorkInProgress 构建 work-in-progress 树](./../../public/assets/15.png)

当建立好双缓冲树的关系后，我们不难得到以下的关系图

![双缓冲树关系图](./../../public/assets/18.png)

### workLoopSync 函数
当我们构建完 workInProgress Tree 的根节点时，建立 current tree 和 workInProgess Tree 的关联关系后，将进入 workLoopSync 调和阶段。

反复判断 workInProgress 是否为空，如果不为空，就执行 performUnitOfWork 方法
![workLoopSync 逻辑](./../../public/assets/17.png)

### performUnitOfWork 函数
performUnitOfWork 函数的作用是
beginWork 优先创建子节点。
completeUnitOfWork 创建完子节点后判断是否有兄弟节点，有则创建兄弟节点，无则继续向上遍历父节点，直到遍历到根节点为止

![performUnitOfWork 逻辑](./../../public/assets/19.png)


#### beginWork 函数


## 参考文档
1 https://zhuanlan.zhihu.com/p/385319664
2 

