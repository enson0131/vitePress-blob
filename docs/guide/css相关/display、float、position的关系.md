# display、float、position的关系

- 如果元素的 display 为 none 直接隐藏
- 如果元素的 position 为 absolute 或者 fixed 时，float 失效，display 会提升块级元素
- 如果元素的 position 为 relative, 会在浮动后的元素进行定位，display 会被提升成块级元素
- 如果是根元素，display 会被提升为块级元素 
- 浮动元素会将 display 提升为块级元素


```html
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <style>
        /* 如果 float 置为 none，判断元素是否为根元素，如果是根元素，display 会被提升为块级元素 */
        html {
            display: inline;
            width: 500px;
            height: 500px;
        }

        #app {
            display: inline;
            position: relative;
            width: 50px;
            height: 50px;
            background-color: aqua;
            float: left;
        }
    </style>
</head>

<body>
    <div id="app">
    </div>
</body>

</html>

```