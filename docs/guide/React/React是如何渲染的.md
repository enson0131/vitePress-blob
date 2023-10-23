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


## Mount 阶段

在执行 ReactDOM.render 时去挂载组件，会创建 reactRootContainer 对象（也就是挂载的容器对象）,
reactRootContainer 对象中会创建 FiberRootNode 对象（也就是根节点对象）

最终返回挂载组件( App组件 )的实例对象。

![Mount 渲染过程](./../../public/assets/6.png)

![FiberRootNode对象的描述](./../../public/assets/7.png)


在 fiberRoot 对象（ FiberRootNode ）中的 current 属性将指向 rootFiber 对象 （根节点Fiber，即 FiberNode 实例）

![fiberRoot对象指向 rootFiber 根节点Fiber](./../../public/assets/8.png)

![挂载创建关系图](./../../public/assets/9.png)



