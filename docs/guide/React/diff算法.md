# React 中的 Diff 算法

## 概要
React Diff 算法主要分单节点和多节点 Diff 算法
在单节点 Diff 算法中，会对比 key 和 tag 是否可以复用
如果 key 和 tag 都相同时，复用当前的 Fiber 节点，标记其他 Fiber 节点为删除
如果 key 不相同，标记删除当前的 Fiber 节点，对比下一个节点
如果 key 相同、tag 不同，则标记删除所有 Fiber 节点，生成新的 Fiber 节点

在多节点 Diff 中，有俩个 for 循环，第一个 for 循环判断可以复用的节点，记录最后可复用节点的 lastIndex 位置

通过 Map 建立节点和下标的对应关系，如果新节点的key可以在 Map 中找到，则复用旧节点，并判断新节点下标和 lastIndex 下标的关系，
如果新节点下标 > lastIndex 下标，说明只需要更新节点，不需要移动位置，更新 lastIndex。
如果新节点下标 < lastIndex，说明需要更新移动位置，不需要更新 lastIndex。


# 单节点diff算法 （render方法创建的element元素子节点只有一个）

## 1. 旧节点不存在
1. 如果旧节点不存在，则直接新增节点

## 2. 旧节点存在
1 判断 key 和 tag 是否相同，相同则复用节点，更新属性
2 如果 key 相同但 tag 不相同，则删除所有节点
3 如果 key、tag 不同，则不需要复用，旧节点标记为删除

# 多节点diff算法 （render方法创建的element元素子节点有多个）
多节点diff有俩次 for 循环, 第一次 for 循环判断元素是否需要更新，第二次 for 循环判断元素是否需要移动位置

## 1 第一次 for 循环比较key和tag, 如果相同则复用, 并用 lastIndex 标记当前可以复用的节点位置 
## 2 遇到不相同时, 跳出第一层 for 循环, 创建一个 Map 对象, 存储旧节点的 key 和 index 
   - key不同导致不可复用，立即跳出整个遍历，第一轮遍历结束
   - key 相同 type 不同导致不可复用，会将 oldFiber 标记为 DELETION，并继续遍历
## 3 在 Map 对象中查找新节点的 key, 如果存在, 则说明新节点可以复用旧节点, 并且判断是否需要移动位置
## 4 如果 index > lastIndex, 则不需要移动位置, 更新 lastIndex
## 5 如果 index < lastIndex, 则需要移动位置, 不需要更新 lastIndex

