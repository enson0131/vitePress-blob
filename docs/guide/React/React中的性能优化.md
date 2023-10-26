# React 中的性能优化

在 React 中当我们的父组件更新时，将渲染整个子组件树，这样会造成很大的性能开销，所以我们需要对组件进行优化，避免不必要的渲染。

常见的性能优化手段有:

- 使用 `useMemo` 缓存数据、使用 `useCallback` 缓存函数
- 使用 `React.memo` 缓存组件
- 合理的使用 Key
- 在组件销毁的时候清除定时器/事件
- 通过 Suspense 和 Lazy 拆分组件
- 避免使用内联函数


## 使用 useMemo 缓存数据、使用 useCallback 缓存函数
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


## 使用 React.memo 缓存组件
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

## 合理的使用 Key

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

## 在组件销毁的时候清除定时器/事件

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


## 通过 Suspense 和 Lazy 异步加载组件

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


## 避免使用内联函数



# 参考文章
1. https://juejin.cn/post/6965747225154732069#heading-15
2. https://cloud.tencent.com/developer/article/1810002



