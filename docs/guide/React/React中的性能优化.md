# React 中的性能优化

在 React 中当我们的父组件更新时，将渲染整个子组件树，这样会造成很大的性能开销，所以我们需要对组件进行优化，避免不必要的渲染。

常见的性能优化手段有:

1. 使用 `useMemo` 缓存数据、使用 `useCallback` 缓存函数
2. 使用 `React.memo` 缓存组件
3. 合理的使用 Key
4. 在组件销毁的时候清除定时器/事件
5. 通过 Suspense 和 Lazy 拆分组件
6. 使用 Fragment 避免额外标记
7. 避免使用内联函数
8. 避免使用内联样式
9. 优化渲染条件
10. 避免重复渲染
11. 为组件创建错误边界
  


## 1 使用 useMemo 缓存数据、使用 useCallback 缓存函数
```jsx
/**
 * 使用 useMemo 缓存数据，类似于 Vue 的 computed 计算属性
 * 使用 useCallback 缓存函数
 * @returns
 */
const data = {
  userName: '张三',
  age: 19,
  fav: '篮球、排球',
};

const getUserInfo = () => {
  return {
    ...data,
    random: Math.random(),
  };
};
function Case2() {
  const [count, setCount] = React.useState(0);
  // 因为使用了 useMemo，页面刷新时，只会执行一次，随机数不会变
  const userInfo = useMemo(() => getUserInfo(), []);

  const handleClick = useCallback(() => {
    setCount(count + 1);
  }, [count]);

  return (
    <div className={styles.case2page}>
      <div className={styles.content}>
        <div>姓名：{userInfo.userName}</div>
        <div>年龄：{userInfo.age}</div>
        <div>爱好：{userInfo.fav}</div>
        <div>随机数: {userInfo.random}</div>
        <div>当前页面渲染次数: {count}</div>
        <Button onClick={handleClick}>刷新渲染组件</Button>
      </div>
    </div>
  );
}
```


## 2 使用 React.memo 缓存组件
React.memo 类似于 shouldComponentUpdate，当 props 没有变化时，不会重新渲染组件，从而提高性能。

React.memo 返回 false 的时候，会重新渲染组件，返回 true 的时候，不会重新渲染组件。

shouldComponentUpdate 返回 false 的时候，不会重新渲染组件，返回 true 的时候，会重新渲染组件。

```jsx
import React from 'react';
import { Button } from 'antd';

const BasicButton = (props) => {
  return <Button {...props}></Button>;
};

export default React.memo(BasicButton, (oldProps, newProps) => {
  return oldProps === newProps; // true - 不更新 false - 更新
});
```

React.memo 内部将使用 `Object.is` 来比较 props.

在 `Object.is` 中 NaN 和 NaN 是相等的，+0 与 -0 不相等的

```jsx

function ObjectIs(value1, value2) {
    if (value1 === value2) {
        return value1 !== 0 || 1 / value1 === 1 / value2;
    }

    return value1 !== value1 && value2 !== value2;
}
```

## 3 合理的使用 Key

在 For 循环中尽量使用唯一的标识id作为key，避免使用index作为key，方便复用组件。

```jsx
import React from 'react';

/**
 * for 循环中合理的使用key
 * @returns
 */

const list = [
  {
    id: 1,
    name: '张三',
  },
  {
    id: 2,
    name: '李四',
  },
  {
    id: 3,
    name: '王五',
  },
];
function Case3() {
  return (
    <div>
      {list.map((item) => {
        return <div key={item.id}>{item.name}</div>;
      })}
    </div>
  );
}

export default Case3;

```

## 4 在组件销毁的时候清除定时器/事件

组件卸载的时候清除相关事件、定时器

```jsx
import React, { useEffect, useState } from 'react';

/**
 * 组件卸载的时候清除相关事件、定时器
 * @returns
 */
function Case1() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCount(count + 1);
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, [count]);

  return <div>{count}</div>;
}

export default Case1;
```


## 5 通过 Suspense 和 Lazy 异步加载组件

```jsx
import React, { lazy } from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

const LearnReactOptimize = lazy(() => import('./pages/LearnReactOptimize'));

const LazyBoundary = (WrapComp) => (
  <Suspense fallback={<div>loading....</div>}>
    <WrapComp />
  </Suspense>
);

const routeConfig = createBrowserRouter([
  {
    path: '/LearnReactOptimize',
    element: LazyBoundary(LearnReactOptimize),
  },
  {
    path: '/',
    element: <App />,
  },
]);


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <RouterProvider router={routeConfig} />
  </React.StrictMode>,
);
```

## 6 使用 Fragment 避免额外标记

通过 Fragment 减少不必要的标签

```jsx
import React from 'react';

// bad
function App() {
  return (
    <div>
      <div>1</div>
      <div>2</div>
    </div>
  )
}

// good
function App() {
  return (
    <>
      <div>1</div>
      <div>2</div>
    </>
  )
}
```


## 7 避免使用内联函数

在 React 中每次 render 都会重新生成新的内联函数，导致在 diff 过程中，发现新旧函数不相等，又重新给组件挂载上新的函数，造成不必要的性能开销。

```jsx

// bad
function App() {
  const handleClick = () => {
    console.log('click')
  }

  return <div onClick={() => handleClick()}> App </div>
}

// good
function App() {
  const handleClick = () => {
    console.log('click')
  }

  return <div onClick={handleClick}> App </div>
}
```




## 8 避免使用内联样式属性

当使用内联 style 为元素添加样式时，内联 style 会被编译成 JavaScript 代码，通过 JavaScript 代码将样式规则映射到元素的身上，浏览器就会花费更多的时间执行脚本和渲染UI，从而增加了组件的渲染时间。

```jsx

function App() {
  return <div style={{ backgroundColor: "skyblue" }}>App works</div>
}

```

## 9 优化渲染条件
对于频繁渲染的组件，可以通过 `display: none;` 进行组件的显示隐藏，避免不必要的性能开销。

## 10 避免重复渲染
在函数组件中，避免在函数体中更改状态
在类组件中，避免在 render 函数内更改状态

```jsx
// bad
export default class App extends React.Component {
  constructor() {
    super()
    this.state = {name: "张三"}
  }
  render() {
    this.setState({name: "李四"})
    return <div>{this.state.name}</div>
  }
}


// or
// bad
export default function App() {
  const [count, setCount] = count(0)
  setCount(count++)
  return <div>{count}</div>
}
```

## 11 为组件创建错误边界
当组件发生错误时，可以通过错误边界捕获错误，从而避免整个组件树的崩溃。

```jsx
export default class ErrorBoundary extends React.Component {
  constructor () {
    super();
    this.state = { hasError: false };
  }
  /**
   * 此生命周期在后代组件引发错误后调用
   * 返回的值会更新 state 状态
   */
  static getDerivedStateFromError() {
    // 更新 state 使下一次渲染能够显示降级后的 UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // 捕获错误日志，将错误日志上报到服务器
    console.log(error, errorInfo)
  }

  render () {
    if (this.state.hasError) {
      return <h1>Something went wrong.</h1>;
    }

    return this.props.children;
  }
}
```


# 参考文章
1. https://juejin.cn/post/6965747225154732069#heading-15
2. https://cloud.tencent.com/developer/article/1810002



