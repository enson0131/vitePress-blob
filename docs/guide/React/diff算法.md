# 单节点diff算法 （render方法创建的element元素子节点只有一个）


## 1. 旧节点不存在
1. 如果旧节点不存在，则直接新增节点

## 2. 旧节点存在
1 判断 key 和 tag 是否相同，相同则复用节点，更新属性
2 如果 key 相同但 tag 不相同，则删除所有节点
3 如果 key、tag 不同，则不需要复用，旧节点标记为删除



# 多节点diff算法 （render方法创建的element元素子节点有多个）
多节点diff有双层 for 循环, 第一层 for 循环判断元素是否需要更新，第二层 for 循环判断元素是否需要移动位置

## 1 第一层 for 循环比较key和tag, 如果相同则复用, 并用 lastIndex 标记当前可以复用的节点位置 
## 2 遇到不相同时, 跳出第一层 for 循环, 创建一个 Map 对象, 存储旧节点的 key 和 index - 有点类似于找最长公共子序列
   - key不同导致不可复用，立即跳出整个遍历，第一轮遍历结束
   - key 相同 type 不同导致不可复用，会将 oldFiber 标记为 DELETION，并继续遍历
## 3 在 Map 对象中查找新节点的 key, 如果存在, 则说明新节点可以复用旧节点, 并且判断是否需要移动位置
## 4 如果 index > lastIndex, 则不需要移动位置, 更新 lastIndex
## 5 如果 index < lastIndex, 则需要移动位置, 不需要更新 lastIndex



