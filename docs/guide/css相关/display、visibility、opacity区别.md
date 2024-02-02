# display、visibility、opacity区别

- 占据空间
  - opacity、visibility 占据空间，不会引起回流，但是会重绘
  - display 不占据空间，但会引起页面的回流和重绘
  
- 绑定事件
  - display、visibility 不会触发绑定事件
  - opacity 会触发绑定事件


# display: none 和 visibility: hidden 的区别
  
- 从渲染树上看
  - display: none 不存在渲染树中
  - visibility: hidden 的元素存在渲染树中，还会占据空间
- 从继承上看
  - display 不会被继承
  - visibility 会被继承
- 从渲染上看
  - display 会影响回流重绘
  - visibility 只会引起重绘