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


以下是个例子，在画布中心画个红色五角星  Below is an example, draw a red star at center
     
    draw.init("canvas");
    let star = Object.create(draw.star).make();
    star.color("red")
        .position({ x: canvas.width / 2  , y : canvas.height / 2 })
        .radial({outer : 200, inner : 100})
        .points(5)
        .create()
        
## 使用说明：
>首先通过

    <script src="./draw.js"></script>
    
>引用这个库, 这时候在全局上下文暴露了一个draw对象，之后的所有操作都来自这个对象。
>比如需要画一个方形，首先创建一个新的方形对象。 
    
    const rect = Object.create(draw.rect).make()
    
>然后在这个方形对象上调用各种设置方法，最后用create方法把它画出来。
    
    rect.color("orange")
        .position({x:100,y:100})
        .size({width:200,height:200})
        .create()
    

## 下面是具体的API

* 通用方法
   
   __init reset clean 和 getCanvas 方法直接在draw对象上调用，其他的放在在图形实例上调用__
   
   + init 初始化，传入的参数是canvas元素的DOM ID，这个方法的返回值是context上下文
   + reset 重置所有样式
   + clean 清空画布
   + getCanvas 返回canvas对象
   + color 设置要创建的图形的填充颜色，参数是CSS颜色字符串
   + gradient 设置渐变样式，参数是一个对象，如下

               {
                    type  : "liner",    线性渐变
                    start : [ x , y ]   起始点
                    end   : [ x , y ]   终点
                    stop  : [ {position , color},{},{} ... ]   渐变位置和颜色
                }
                {
                    type : "radial"              径向渐变
                    inner : [ x , y , radius ]   内圆
                    outer : [ x , y , radius ]   外圆
                    stop  : [ {position , color},{},{} ... ]   渐变位置和颜色
                }
   + pattern设置填充图案，参数是一个对象
   
                {
                    src          图片的路径
                    repeat       重复方式，可选repeat,no-repeat,repeat-x,repeat-y
                 }
                这个方法是异步的，需要用 async / await 调用
   + border设置描边的样式，参数如下

                {
                    width    描边线宽度
                    color    描边颜色，CSS表达式
                }
   + shadow 设置阴影，参数是一个对象，如下

                {
                    blur   高斯模糊系数
                    color  投影颜色
                    offsetX  X轴偏移
                    offsetY  Y轴偏移   
                }
    + compose 设置后画的图形与先画的图形的合成方式，参数是一个字符串
    
               "source-over",	      //后绘制的图形在先绘制的图形的上方，默认。
                "source-in",	      //后绘制的图形与先绘制的图形重叠的部分可见，其他部分透明。
                "source-out",	      //后绘制的图形与先绘制的图形不重叠的部分可见，先绘制的图形透明。
                "source-atop",	      //后绘制的图形与先绘制的图形重叠的部分可见，先绘制的图形不受影响。
                "destination-over",     //后绘制的图形在先绘制的图形的下方，只有先绘制的图形的透明下的部分才可见。
                "destination-in",       //后绘制的图形在先绘制的图形的下方，不重叠的部分透明。
                "destination-out",      //后绘制的图形擦除先绘制图形的重叠部分。
                "destination-atop",     //后绘制的图形在先绘制的图形的下方，不重叠的部分，先绘制的图形透明。
                "lighter",	      //后绘制的图形与先绘制的图形的重叠部分值相加，即变亮。
                "copy",	              //后绘制的图形完全代替先绘制的图形的重叠部分。
                "xor"	              //后绘制的图形与先绘制的图形在重叠部分执行“异或”操作。 
    + clip 使用当前路径作为剪辑区域

* 坐标

  __coordinate对象是静态对象，直接在draw对象上调用__

    * windowToCanvas 将窗口坐标系转换为画布坐标系，接受x,y两个参数，分别是要转换的窗口坐标系的x,y点
    * rotate      旋转坐标系，参数是角度
    * translate   平移坐标系，参数是一个`{x:x,y:y}`的对象
    * scale       缩放坐标系，参数是缩放系数

* 矩形

__每个形状的make方法用来在实例化形状的时候初始化内部变量，是必须调用的，如下__

    const rect = Object.create(draw.rect).make();

__create方法在设置完形状参数后最后调用，实际将形状画在画布上。可以给这个方法传入fill或者stroke，分别代表填充或者描边__

    * position  矩形左上角的坐标, 参数是{x:x,y:y}这样的坐标对象
    * size 矩形的尺寸，参数是{width : width , height:height}这样的尺寸对象

* 圆角矩形
     * position  矩形左上角的坐标, 参数是{ x:x , y:y }这样的坐标对象
     * size 矩形的尺寸，参数是{width : width , height : height}这样的尺寸对象
     * radial 设置圆角半径

* 弧形与圆形

    __弧形和圆形有两种方法，一种是指定圆心和半径，另一种是指定起点、终点和半径__

    __以下是第一种方法__

    * position 指定圆心位置，参数是{ x : x , y : y }这样的坐标对象
    * size 指定半径，参数是半径
    * angle 旋转的角度，画圆形是360度
    * direction  旋转的方向，顺时针还是逆时针，参数是布尔值，true是顺时针  

    __以下是第二种方法__

    * from  指定起点，参数是坐标对象
    * to 指定终点，参数是坐标对象
    * radial  指定半径，默认半径是10px

* 线段
    * dash  设置虚线，参数是一个表示虚线间距的数组
    * cap  设置线段端点样式
          
          参数有三个选项，butt,square,round
          butt   为默认值，不加额外样式
          square 在线段末端加上个方形“帽子”,长度为线段宽度的一半
          round  在线段末端加上个圆角样式，半径为线段宽度

    * join 设置连接点样式

          参数有三个选项， round, bevel , miter
          round  圆角连接
          bevel  斜切连接
          miter  直接连接 （默认值）
    * limit 在miter连接的情况下，limit用来限制斜接线的长度，如果超过了这个值，就用bevel连接，默认为10
    * move 移动到某个坐标上，也就是画线的起始位置 , 参数是一个包含x,y的坐标对象
    * mark 从起始位置向目标位置画线 , 参数是目标位置的坐标对象，包括x,y属性。这个方法可以连续多次被调用，以便连续画折线或者其他各种形状。

* 贝塞尔曲线
    * start  起始点坐标，参数是坐标对象
    * end 结束点坐标，参数是坐标对象
    * control 控制点坐标，参数是坐标对象，调用一次是二次方曲线，调用两次是三次方曲线

* 三角形

* 多边形

* 梯形

* 平行四边形

* 星形

* 网格

* 文本

* 图像

* 动画
