# draw.js
这是一个canva API 的面向对象映射

当使用canvas的时候，我发现它的函数有太多的参数，并且你并不是总能知道这些参数的意义，这让canvas api在某种程度上不好理解。

所以，我封装了这个库，使用面向对象的思想，每一个形状都是一个对象，它需要被创建，有其方法等等,希望这可以让事情变得简单一些。在这个库中也封装了一些常用的基本图形。

所有代码都是用ES6+写的，你可以用babel把它编译成ES5，并用uglify.js压缩它。

API文档还在路上，但是你可以通过阅读源码理解它的用它，因为它不是很长，也很简单。注释也许会有帮助


This is an object mapping of canvas API

Using canvas API , I frequently found myself in a situation that too much arguments have to be dealed with when using original API system, and to understand an argument clearly is in some way not easy.

So, I make this library in the manner of object orientation, and wish to make canvas API easier to understand, and push some basic shape into it as well. In this library, every shape is an object that needs to be created , and it has its own methods.

All the code is written in ES6+ , and if you want to use it, you would better complie it to ES5 by Babel , and compress it through uglify.js.

API Document is on the way, and you could understand it by reading the code since it is not long and complicated. comments might be helpful.


以下是个例子 / Below is an example of usage  
  
        //Draw a red star in the center of canvas 
        //在画布中心画个红色五角星
        draw.init("canvas");
        const star = Object.create(draw.star).make();
        star.color("red")
            .position({ x: canvas.width / 2  , y : canvas.height / 2 })
            .radial({outer : 200, inner : 100})
            .points(5)
            .create()
