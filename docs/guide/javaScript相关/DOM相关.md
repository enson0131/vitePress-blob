# DOM 相关

## 如何阻止事件的冒泡和默认事件

```js
event.stopPropagation(); // 阻止事件冒泡
event.preventDefalut(); // 阻止默认事件
event.stopImmediatePropagation(); // 阻止监听同一事件的其他事件监听器被调用
```

## 查找、添加、删除、移动 DOM 节点的方法

- 查询: getElementById、getElementByTagName、getElementByClassName、querySelector、querySelectorAll
- 添加: appendChild、insertBefore、insertAfter
- 删除: removeChild
- 移动: insertBefore、insertAfter

```js
var imooc = document.getElementById('imooc'); // 通过 id 查找

var pList = document.getElementByTagName('p'); // 通过标签名查找 p 标签集合

var imoocList = document.getElementByClassName('imooc'); // 查询类名 imooc 类名集合

var imoocList = docuemnt.querySelectorAll('.imooc'); // 查询类名 imooc 的集合
```


## 高度相关
- offsetHeight: 包含 padding、content、border 和 滚动条
- clientHeight: 包含 padding 和 content
- scrollHeight: 包含 padding 和 内容高度

判断是否有滚动条 scrollHeight >= clientHeight

## 顶部高度
- offsetTop: 元素顶部到最近父元素顶部的距离，和有木有滚动条没有关系
- scrollTop: 滚动条滚动的距离


## 鼠标事件

### 按下
- click: 点击鼠标左键或按下回车键调用
- dblclick: 双击鼠标左键调用
- mousedown: 鼠标被按下（左键/右键）时触发，不能通过键盘触发。
- mouseup: 鼠标按键被松开时触发，不能通过键盘触发。

### 移动
- mouseover: 鼠标移入目标元素。鼠标移入子元素也会触发
- mouseout: 鼠标移出目标元素。鼠标移出子元素也会触发
- mouseenter: 鼠标移入目标元素。鼠标移入子元素不会触发
- mouseleave: 鼠标移出目标元素。鼠标移出子元素不会触发
- mousemove: 鼠标在目标元素内移动时触发，不能通过键盘触发。