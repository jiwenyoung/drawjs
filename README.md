# draw.js
This is an object mapping of canvas API

Using canvas API , I frequently found myself in a situation that too much arguments have to be dealed with when using original API system, and to understand an argument clearly is in some way not easy.

So, I make this library in the manner of object orientation, and wish to make canvas API easier to understand, and push some basic shape into it as well.

All the code is written in ES6+ , and if you want to use it, you would better complie it to ES5 by Babel , and compress it through uglify.js.

API Document is on the way, and you could understand it by reading the code since it is not long and complicated. comments might be helpful.

Below is an example of usage :
  
        //Draw a red star in the center of canvas
        draw.init("canvas");
        const star = Object.create(draw.star).make();
        star.color("red")
            .position({ x: canvas.width / 2  , y : canvas.height / 2 })
            .radial({outer : 200, inner : 100})
            .points(5)
            .create()
