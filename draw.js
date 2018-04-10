/**
 * 这是canvas API的一个面向对象映射
 * @7Theme Jiwen Young
 * Date 4/10/2018
 */
const draw = (function () {
    let options = {}   //全局状态，每个对象的配置信息都存在这个全局变量里面
    let canvas = {}   //canvas对象，供全局使用
    let context = {}   //上下文对象，供全局使用

    //这个方法用来判断坐标和尺寸等参数是否为数字
    const isNumber = function (...args) {
        let count = 0;
        for (let value of args) {
            if (!isNaN(value)) {
                count = count + 1;
            }
        }
        if (count === args.length) {
            return true;
        } else {
            return false;
        }
    }

    //通用
    const common = {
        /**
         * 初始化画布
         */
        init: function (element) {
            const cvs = document.getElementById(element);
            canvas = cvs;
            const ctx = cvs.getContext('2d');
            context = ctx;
            return context;
        },
        /**
         * 重置属性 
         */
        reset: function () {

            //重置投影
            context.shadowBlur = 0
            context.shadowColor = undefined;
            context.shadowOffsetX = 0;
            context.shadowOffsetY = 0;

            //清理虚线
            context.setLineDash([0]);

            //清理样式
            context.fillStyle = "";
            context.strokeStyle = "";
        },
        /**
         *  清理画布 
         */
        clean: function () {
            canvas.height = canvas.height;
        },
        /**
         * 输出canvas对象 
         */
        getCanvas: function () {
            return canvas;
        },
        /**
         * 设置填充颜色
         * 参数 color 是CSS的颜色表示
         */
        color: function (color) {
            context.fillStyle = color;
            return draw[this.name];
        },
        /**
         设置渐变
         参数 ： type 渐变类型，可选 liner 和 radial
                type 参数为liner
                {
                    type  : "liner",
                    start : [ x , y ]   起始点
                    end   : [ x , y ]   终点
                    stop  : [ {position , color},{},{} ... ]   渐变位置和颜色
                }
                type参数为raidal
                {
                    type : "radial"
                    inner : [ x , y , radius ] 
                    outer : [ x , y , radius ]
                    stop  : [ {position , color},{},{} ... ]   渐变位置和颜色
                }
        **/
        gradient: function (args) {

            let available = ["liner", "radial"];
            if (!available.includes(args.type)) {
                console.error("invalid argument");
                return false;
            } else {
                if (args.type === "liner") {
                    if (!isNumber(...args.start) || !isNumber(...args.end)) {
                        console.error("position must be number")
                        return false;
                    }
                } else if (args.type === "radial") {
                    if (!isNumber(...args.inner) || !isNumber(...args.outer)) {
                        console.error("position must be number")
                        return false;
                    }
                }
                for (let step of args.stop) {
                    if (!isNumber(step.position) || step.position > 1 || step.position < 0) {
                        console.log("stop position must be a number between 0 and 1");
                        return false;
                    }
                }
            }

            let gradientObject;
            if (args.type === "liner") {
                let argument = [...args.start, ...args.end];
                gradientObject = context.createLinearGradient(...argument);
            } else if (args.type === "radial") {
                let argument = [...args.inner, ...args.outer];
                gradientObject = context.createRadialGradient(...argument);
            }

            args.stop.forEach((stop) => {
                gradientObject.addColorStop(stop.position, stop.color);
            });

            context.fillStyle = gradientObject;
            return draw[this.name];
        },
        /**
         * 填充图案模板
         * 参数 src 图案路径
         *     repeat 重复模式
         */
        pattern: async function (args) {
            let available = ["repeat", "repeat-x", "repeat-y", "no-repeat"]
            if (!available.includes(args.repeat)) {
                console.error("invalid arguemnt");
                return false;
            } else {
                let image = new Image();
                image.src = args.src;
                await (function waitForImageLoad() {
                    return new Promise((resolve) => {
                        image.addEventListener("load", resolve);
                    })
                })()
                let pattern = context.createPattern(image, args.repeat);
                context.fillStyle = pattern;
                return draw[this.name];
            }
        },
        /**
         * 设置描边参数
         * 参数  args : {
         *          width  宽度
         *          color  颜色
         *      }
         */
        border: function (args) {
            if (isNumber(args.width)) {
                context.lineWidth = args.width;
                context.strokeStyle = args.color;
                return draw[this.name];
            } else {
                console.error("argument of border function's width must be number");
                return false;
            }
        },
        /**
         * 设置投影
         * 参数 args : {
         *        blur   高斯模糊系数
         *        color  投影颜色
         *        offsetX  X轴偏移
         *        offsetY  Y轴偏移   
         *     }
         */
        shadow: function (args) {
            context.shadowBlur = Number(args.blur) || 2;
            context.shadowColor = args.color || 'grey';
            context.shadowOffsetX = Number(args.offsetX) || 10;
            context.shadowOffsetY = Number(args.offsetY) || 10;
            return draw[this.name];
        },
        /**
         * 设置后画的图形与先画的图形的合成方式
         * 这个属性作用于全局
         */
        compose: function (arg) {
            let available = [
                "source-over",	      //后绘制的图形在先绘制的图形的上方，默认。
                "source-in",	      //后绘制的图形与先绘制的图形重叠的部分可见，其他部分透明。
                "source-out",	      //后绘制的图形与先绘制的图形不重叠的部分可见，先绘制的图形透明。
                "source-atop",	      //后绘制的图形与先绘制的图形重叠的部分可见，先绘制的图形不受影响。
                "destination-over",	  //后绘制的图形在先绘制的图形的下方，只有先绘制的图形的透明下的部分才可见。
                "destination-in",	  //后绘制的图形在先绘制的图形的下方，不重叠的部分透明。
                "destination-out",	  //后绘制的图形擦除先绘制图形的重叠部分。
                "destination-atop",	  //后绘制的图形在先绘制的图形的下方，不重叠的部分，先绘制的图形透明。
                "lighter",	          //后绘制的图形与先绘制的图形的重叠部分值相加，即变亮。
                "copy",	              //后绘制的图形完全代替先绘制的图形的重叠部分。
                "xor"	              //后绘制的图形与先绘制的图形在重叠部分执行“异或”操作。                            
            ]
            if (available.includes(arg)) {
                context.globalCompositeOperation = arg;
                return draw[this.name];
            }
        },
        /**
         * 使用当前路径作为剪辑区域
         */
        clip: function () {
            context.clip();
            return draw[this.name];
        }

    }
    const draw = Object.create(common);

    //坐标
    draw.coordinate = {
        /**
         * 将窗口坐标系转换为画布坐标系
         * 参数x,y是要转换的窗口坐标系
         */
        windowToCanvas: function (x, y) {
            let bbox = canvas.getBoundingClientRect();
            return {
                x: (x - bbox.left) * (canvas.width / bbox.width),
                y: (y - bbox.top) * (canvas.width / bbox.width)
            }
        },
        /**
         * 旋转坐标系，参数为旋转角度
         */
        rotate: function (degree) {
            return context.rotate(degree * Math.PI / 180);
        },
        /**
         * 平移坐标系，参数为平移的目的地坐标对象
         */
        translate: function (args) {
            return context.translate(args.x, args.y)
        },
        /**
         * 缩放坐标系，参数为缩放系数
         */
        scale: function (factor) {
            return context.scale(factor.x, factor.y)
        }
    }

    //方形
    draw.rect = {
        name: "rect",
        make: function () {
            this.reset();
            options.size = {};
            options.position = {};
            return this;
        },
        size: function (args) {
            if (isNumber(args.width, args.height)) {
                options.size = {
                    width: args.width,
                    height: args.height
                }
                return this;
            } else {
                console.error("arguments of size function must be number");
                return false;
            }
        },
        position: function (args) {
            if (isNumber(args.x, args.y)) {
                options.position = {
                    x: args.x,
                    y: args.y
                }
            } else {
                console.error("arguments of position function must be number");
                return false;
            }
            return this;
        },
        create: function (type = "fill") {
            let available = ["fill", "stroke"];
            if (available.includes(type)) {
                let args = [
                    options.position.x,
                    options.position.y,
                    options.size.width,
                    options.size.height
                ];
                context.beginPath();
                context.rect(...args);
                if (type === "fill") {
                    context.fill();
                } else if (type === "stroke") {
                    context.stroke();
                }
                context.closePath();
                return this;
            } else {
                console.error("argument invaild");
                return false;
            }
        }
    }
    Object.setPrototypeOf(draw.rect, common);

    //圆角矩形
    draw.roundRect = {
        name: "roundRect",
        make: function () {
            this.reset();
            options.roundRect = {
                x: 0,
                y: 0,
                width: 0,
                height: 0,
                radial: 0
            }
            return this;
        },
        /**
         * 绘制圆角矩形的位置
         * 参数是一个x,y组成的坐标点对象
         */
        position: function (args) {
            if (isNumber(args.x, args.y)) {
                options.roundRect.x = args.x;
                options.roundRect.y = args.y;
                return this;
            } else {
                console.error("arguments of position function must be number");
                return false;
            }
        },
        /**
         * 圆角矩形的尺寸
         * 参数是宽和高 width和height
         */
        size: function (args) {
            if (isNumber(args.width, args.height)) {
                options.roundRect.width = args.width;
                options.roundRect.height = args.height;
                return this;
            } else {
                console.error("arguments of size function must be number");
                return false;
            }
        },
        /**
         * 圆角半径
         */
        radial: function (radial) {
            if (isNumber(radial)) {
                options.roundRect.radial = radial;
                return this;
            } else {
                console.error("arguments of radial function must be number");
                return false;
            }
        },
        create: function (type = "fill") {
            let available = ["fill", "stroke"];
            if (available.includes(type)) {
                //绘制圆角
                const roundRect = function () {
                    if (options.roundRect.width > 0) {
                        context.moveTo(options.roundRect.x + options.roundRect.radial, options.roundRect.y);
                    } else {
                        context.moveTo(options.roundRect.x - options.roundRect.radial, options.roundRect.y);
                    }
                    context.arcTo(
                        options.roundRect.x + options.roundRect.width,
                        options.roundRect.y,
                        options.roundRect.x + options.roundRect.width,
                        options.roundRect.y + options.roundRect.height,
                        options.roundRect.radial
                    )
                    context.arcTo(
                        options.roundRect.x + options.roundRect.width,
                        options.roundRect.y + options.roundRect.height,
                        options.roundRect.x,
                        options.roundRect.y + options.roundRect.height,
                        options.roundRect.radial
                    )
                    context.arcTo(
                        options.roundRect.x,
                        options.roundRect.y + options.roundRect.height,
                        options.roundRect.x,
                        options.roundRect.y,
                        options.roundRect.radial
                    )
                    if (options.roundRect.width > 0) {
                        context.arcTo(
                            options.roundRect.x,
                            options.roundRect.y,
                            options.roundRect.x + options.roundRect.radial,
                            options.roundRect.y,
                            options.roundRect.radial
                        )
                    } else {
                        context.arcTo(
                            options.roundRect.x,
                            options.roundRect.y,
                            options.roundRect.x - options.roundRect.radial,
                            options.roundRect.y,
                            options.roundRect.radial
                        )
                    }
                }
                //创建路径并填充或者描边
                context.beginPath();
                roundRect(
                    options.roundRect.x,
                    options.roundRect.y,
                    options.roundRect.width,
                    options.roundRect.height,
                    options.roundRect.radial
                )
                if (type === "fill") {
                    context.fill();
                } else if (type === "stroke") {
                    context.stroke();
                }
                context.closePath();
                return this;
            } else {
                console.error("argument invaild");
                return false;
            }
        }
    }
    Object.setPrototypeOf(draw.roundRect, common);

    //弧形与圆形
    draw.arc = {
        name: "arc",
        make: function () {
            this.reset();
            options.arc = {
                position: {},
                size: 0,
                angle: {},
                direction: false,
                use: false
            }
            options.arcTo = {
                from: {},
                to: {},
                radial: 10,
                use: false
            }
            return this;
        },
        /**
         * 以指定圆心，半径的方式绘制圆弧
         */
        position: function (args) {
            if (isNumber(args.x, args.y)) {
                options.arc.position = {
                    x: args.x,
                    y: args.y
                }
                return this;
            } else {
                console.error("arguments of position function must be number");
                return false;
            }
        },
        size: function (radial) {
            if (isNumber(radial)) {
                options.arc.radial = radial;
                return this;
            } else {
                console.error("arguments of size function must be number");
                return false;
            }
        },
        angle: function (args) {
            if (isNumber(args.start, args.end)) {
                options.arc.angle = {
                    start: (Math.PI / 180) * args.start,
                    end: (Math.PI / 180) * args.end
                }
                return this;
            } else {
                console.error("arguments of angle function must be number");
                return false;
            }
        },
        direction: function (direction = false) {
            if (typeof direction === "boolean") {
                if (direction === true) {
                    options.arc.direction = true;
                } else {
                    options.arc.direction = false;
                }
            } else {
                console.error("argument of direction function must be boolean");
                return false;
            }
            return this;
        },
        /**
         * 以指定起点和终点的方式绘制圆弧
         */
        from: function (args) {
            if (isNumber(args.x, args.y)) {
                options.arcTo.use = true;
                options.arcTo.from = {
                    x: args.x,
                    y: args.y
                }
                return this;
            } else {
                console.error("argument of from function must be number");
                return false;
            }
        },
        to: function (args) {
            if (isNumber(args.x, args.y)) {
                options.arcTo.use = true;
                options.arcTo.to = {
                    x: args.x,
                    y: args.y
                }
                return this;
            } else {
                console.error("argument of to function must be number");
                return false;
            }
        },
        radial: function (radial = 10) {
            if (isNumber(radial)) {
                options.arcTo.use = true;
                if (isNumber(radial)) {
                    options.arcTo.radial = radial;
                }
                return this;
            } else {
                console.error("argument of radial function must be number");
                return false;
            }
        },
        create: function (type = "fill") {
            let available = ["fill", "stroke"];
            if (available.includes(type)) {
                context.beginPath();
                let args;
                if (options.arcTo.use === true) {
                    args = [
                        options.arcTo.from.x,
                        options.arcTo.from.y,
                        options.arcTo.to.x,
                        options.arcTo.to.y,
                        options.arcTo.radial
                    ]
                } else {
                    args = [
                        options.arc.position.x,
                        options.arc.position.y,
                        options.arc.radial,
                        options.arc.angle.start,
                        options.arc.angle.end,
                        options.arc.direction
                    ]
                }
                context.arc(...args);

                if (type === "fill") {
                    context.fill();
                } else if (type === "stroke") {
                    context.stroke()
                }
                context.closePath();
                return this;
            } else {
                console.error("invalid argument");
                return false;
            }
        }
    }
    Object.setPrototypeOf(draw.arc, common);

    //线段
    draw.line = {
        name: "line",
        /**
         * 初始化options对象
         */
        make: function () {
            this.reset();
            options.line = {
                dash: [],
                cap: "butt",
                join: "miter",
                limit: 10,
                move: {},
                mark: {}
            }
            return this;
        },
        /**
         * 设置虚线参数
         * args是一个数组，表示虚线的间距
         */
        dash: function (args) {
            if (Array.isArray(args)) {
                if (isNumber(...args)) {
                    options.line.dash = args;
                    return this;
                } else {
                    console.error("arguments of dash function must be number");
                    return false;
                }
            }
        },
        /**
         * 设置线段端点样式
         * arg有三个选项，butt,square,round
         * butt   为默认值，不加额外样式
         * square 在线段末端加上个方形“帽子”,长度为线段宽度的一半
         * round  在线段末端加上个圆角样式，半径为线段宽度
         */
        cap: function (arg = "butt") {
            let available = ['butt', 'square', 'round'];
            if (available.includes(arg)) {
                options.line.cap = arg;
            }
            return this;
        },
        /**
         * 设置连接点样式
         * arg有三个选项， round, bevel , miter
         * round  圆角连接
         * bevel  斜切连接
         * miter  直接连接 （默认值）
         */
        join: function (arg = "miter") {
            let available = ['round', 'bevel', 'miter'];
            if (available.includes(arg)) {
                options.line.join = arg;
            }
            return this;
        },
        /**
         * 在miter连接的情况下，limit用来限制斜接线的长度，
         * 如果超过了这个值，就用bevel连接，默认为10
         */
        limit: function (arg = 10) {
            if (isNumber(arg)) {
                options.line.limit = arg
                return this;
            } else {
                console.error("arguments of limit function must be number");
                return false;
            }
        },
        /**
         * 移动到某个坐标上，
         * 也就是画线的起始位置
         * 参数是一个包含x,y坐标的对象
         */
        move: function (args) {
            if (isNumber(args.x, args.y)) {
                options.line.move = {
                    x: args.x,
                    y: args.y
                }
                return this;
            } else {
                console.error("arguments of move function must be number");
                return false;
            }
        },
        /**
         * 从起始位置向目标位置画线
         * 参数是目标位置的坐标对象，包括x,y属性
         */
        mark: function (args) {
            if (isNumber(args.x, args.y)) {
                if (options.mark && Array.isArray(options.mark)) {
                    options.line.mark.push({
                        x: args.x,
                        y: args.y
                    })
                } else {
                    options.line.mark = [{
                        x: args.x,
                        y: args.y
                    }];
                }
                return this;
            } else {
                console.error("arguments of mark function must be number");
                return false;
            }
        },
        create: function () {

            context.beginPath();
            if (options.line.cap) {
                context.lineCap = options.line.cap;
            }

            if (options.line.join) {
                context.lineJoin = options.line.join;
            }

            if (options.line.limit) {
                context.miterLimit = options.line.limit;
            }

            if (options.line.dash) {
                context.setLineDash(options.line.dash);
            }

            context.moveTo(options.line.move.x, options.line.move.y);

            if (Array.isArray(options.line.mark)) {
                options.line.mark.forEach((coordinate) => {
                    context.lineTo(coordinate.x, coordinate.y);
                })
                options.line.mark = [];
            }

            context.stroke();
            context.closePath();
            return this;
        }
    }
    Object.setPrototypeOf(draw.line, common);

    //贝塞尔曲线
    draw.cruve = {
        name: "cruve",
        make: function () {
            this.reset();
            options.cruve = {
                control: [],
                anchor: {}
            }
            return this;
        },
        control: function (args) {
            if (isNumber(args.x, args.y)) {
                options.cruve.control.push({
                    x: args.x,
                    y: args.y
                })
                return this;
            } else {
                console.error("arguments of control function must be number");
                return false;
            }
        },
        start: function (args) {
            if (isNumber(args.x, args.y)) {
                options.cruve.start = {
                    x: args.x,
                    y: args.y
                }
                return this;
            } else {
                console.error("arguments of start function must be number");
                return false;
            }
        },
        end: function (args) {
            if (isNumber(args.x, args.y)) {
                options.cruve.end = {
                    x: args.x,
                    y: args.y
                }
                return this;
            } else {
                console.error("arguments of end function must be number");
                return false;
            }
        },
        create: function (type = "stroke") {
            let available = ["stroke", "fill"];

            if (available.includes(type)) {
                context.beginPath();
                context.moveTo(
                    options.cruve.start.x,
                    options.cruve.start.y
                );
                if (options.cruve.control.length === 1) {
                    let args = [
                        options.cruve.control[0].x,
                        options.cruve.control[0].y,
                        options.cruve.end.x,
                        options.cruve.end.y
                    ]
                    context.quadraticCurveTo(...args);

                } else if (options.cruve.control.length === 2) {
                    let args = [
                        options.cruve.control[0].x,
                        options.cruve.control[0].y,
                        options.cruve.control[1].x,
                        options.cruve.control[1].y,
                        options.cruve.end.x,
                        options.cruve.end.y
                    ]
                    context.bezierCurveTo(...args);
                }

                if (type === "stroke") {
                    context.stroke();
                } else if (type === "fill") {
                    context.fill();
                }
                context.closePath();
                return this;
            } else {
                console.error("invalid arguments");
                return false;
            }
        }
    }
    Object.setPrototypeOf(draw.cruve, common);

    //三角形
    draw.triangle = {
        name: "triangle",
        make: function () {
            this.reset();
            options.triangle = {
                points: []
            }
            return this;
        },
        point: function (args) {
            if (isNumber(args.x, args.y)) {
                if (options.triangle.points.length <= 3) {
                    options.triangle.points.push({
                        x: args.x,
                        y: args.y
                    })
                    return this;
                } else {
                    console.error("arguments of point function must be number");
                    return false;
                }
            } else {
                console.error("arguments of point function must be number");
                return false;
            }
        },
        create: function (type = "fill") {
            let available = ["fill", "stroke"];
            if (available.includes(type)) {
                context.beginPath();
                context.moveTo(options.triangle.points[0].x, options.triangle.points[0].y);
                options.triangle.points.forEach((point) => {
                    context.lineTo(point.x, point.y);
                })
                context.lineTo(options.triangle.points[0].x, options.triangle.points[0].y);
                if (type === "fill") {
                    context.fill();
                } else if (type === "stroke") {
                    context.stroke();
                }
                context.closePath();
                return this;
            } else {
                console.error("invalid arguments");
                return false;
            }
        }
    }
    Object.setPrototypeOf(draw.triangle, common);

    //多边形
    draw.polygon = {
        name: "polygon",
        make: function () {
            this.reset();
            options.polygon = {
                position: {},
                side: 3,
                radial: 100
            }
            return this;
        },
        position: function (args) {
            if (isNumber(args.x, args.y)) {
                options.polygon.position = {
                    x: args.x,
                    y: args.y
                }
                return this;
            } else {
                console.error("arguments of position function must be number");
                return false;
            }
        },
        side: function (num) {
            if (isNumber(num)) {
                options.polygon.side = num;
                return this;
            } else {
                console.error("arguments of side function must be number");
                return false;
            }
        },
        radial: function (num) {
            if (isNumber(num)) {
                options.polygon.radial = num;
                return this;
            } else {
                console.error("arguments of radial function must be number");
                return false;
            }
        },
        create: function (type = "fill") {
            let available = ["fill", "stroke"];

            if (available.includes(type)) {
                let angle = 0;
                context.beginPath();

                //移动到起始点
                context.moveTo(
                    options.polygon.position.x + Math.cos(angle) * options.polygon.radial,    //X
                    options.polygon.position.y + Math.sin(angle) * options.polygon.radial     //Y  
                );

                //计算每一个点的坐标,开始画线
                //sin(弧度) * 半径 和 cos(弧度) * 半径 可以得到下一个角度对应的坐标值
                //再加上圆心位置的坐标，就可以得到精确的坐标点
                //2π是圆周，再除以有几条边可以得到中心角的弧度             
                for (let i = 0; i < options.polygon.side; ++i) {

                    //计算坐标画线
                    context.lineTo(
                        options.polygon.position.x + Math.cos(angle) * options.polygon.radial,   //X
                        options.polygon.position.y + Math.sin(angle) * options.polygon.radial    //Y
                    );

                    //增加角度
                    angle = angle + (2 * Math.PI / options.polygon.side);
                }

                //填充或者描边
                if (type === "fill") {
                    context.fill();
                } else if (type === "stroke") {
                    context.stroke();
                }

                context.closePath();
                return this;
            } else {
                console.error("invalid arguments");
                return false;
            }

        }
    }
    Object.setPrototypeOf(draw.polygon, common);

    //梯形
    draw.trapezium = {
        name: "trapezium",
        make: function () {
            this.reset();
            options.trapezium = {
                position: {},
                height: 100,
                width: {}
            }
            return this;
        },
        position: function (args) {
            if (isNumber(args.x, args.y)) {
                options.trapezium.position = {
                    x: args.x,
                    y: args.y
                }
                return this;
            } else {
                console.error("arguments of position function must be number");
                return false;
            }
        },
        height: function (height) {
            if (isNumber(height)) {
                options.trapezium.height = height;
                return this;
            } else {
                console.error("arguments of height function must be number");
                return false;
            }
        },
        width: function (args) {
            if (isNumber(args.up, args.down)) {
                options.trapezium.width = {
                    up: args.up,
                    down: args.down
                }
                return this;
            } else {
                console.error("arguments of width function must be number");
                return false;
            }
        },
        create: function (type = "fill") {
            let available = ["fill", "stroke"];

            if (available.includes(type)) {
                context.beginPath();
                context.moveTo(
                    options.trapezium.position.x - (options.trapezium.width.down / 2),
                    options.trapezium.position.y + (options.trapezium.height / 2)
                );

                let points = [
                    {
                        x: options.trapezium.position.x - (options.trapezium.width.up / 2),
                        y: options.trapezium.position.y - (options.trapezium.height / 2)
                    },
                    {
                        x: options.trapezium.position.x + (options.trapezium.width.up / 2),
                        y: options.trapezium.position.y - (options.trapezium.height / 2)
                    },
                    {
                        x: options.trapezium.position.x + (options.trapezium.width.down / 2),
                        y: options.trapezium.position.y + (options.trapezium.height / 2)
                    },
                    {
                        x: options.trapezium.position.x - (options.trapezium.width.down / 2),
                        y: options.trapezium.position.y + (options.trapezium.height / 2)
                    }
                ]

                points.forEach((point) => {
                    context.lineTo(point.x, point.y);
                })

                if (type === "fill") {
                    context.fill();
                } else if (type === "stroke") {
                    context.stroke();
                }

                context.closePath();
            } else {
                console.error("invalid arguments");
                return false;
            }
        }
    }
    Object.setPrototypeOf(draw.trapezium, common);

    //平行四边形
    draw.parallelogram = {
        name: "parallelogram",
        make: function () {
            this.reset();
            options.parallelogram = {
                position: {},
                size: {},
                angle: 45
            }
            return this;
        },
        position: function (args) {
            if (isNumber(args.x, args.y)) {
                options.parallelogram.position = {
                    x: args.x,
                    y: args.y
                }
                return this;
            } else {
                console.error("arguments of position function must be number");
                return false;
            }
        },
        size: function (args) {
            if (isNumber(args.width, args.height)) {
                options.parallelogram.size = {
                    width: args.width,
                    height: args.height
                }
                return this;
            } else {
                console.error("arguments of size function must be number");
                return false;
            }
        },
        angle: function (angle) {
            if (isNumber(angle)) {
                options.parallelogram.radian = Math.PI / 180 * angle;
                return this;
            } else {
                console.error("arguments of angle function must be number");
                return false;
            }
        },
        create: function (type = "fill") {
            let available = ["fill", "stroke"];

            if (available.includes(type)) {
                context.beginPath();

                //写入常量，简化代码长度
                const radian = options.parallelogram.radian,
                    height = options.parallelogram.size.height,
                    width = options.parallelogram.size.width,
                    center = {
                        x: options.parallelogram.position.x,
                        y: options.parallelogram.position.y
                    }

                //计算起始点
                const getStart = function () {
                    let short = Math.sqrt(Math.abs(Math.pow(Math.sin(radian) * (height / 2), 2) - Math.pow((height / 2), 2)));
                    return {
                        x: parseInt(center.x + (width / 2 - short)),
                        y: center.y + height / 2
                    }
                }
                let first = getStart();
                context.moveTo(first.x, first.y);

                //计算其他点并填入points数组
                let short = Math.sqrt(Math.abs(Math.pow(Math.sin(radian) * height, 2) - Math.pow(height, 2)));
                let second = {
                    x: parseInt(short + first.x),
                    y: first.y - height
                }
                let third = {
                    x: second.x - width,
                    y: second.y
                }
                let forth = {
                    x: parseInt(third.x - short),
                    y: first.y
                }
                const points = [second, third, forth, first];

                //开始画线
                points.forEach((point) => {
                    context.lineTo(point.x, point.y);
                })

                //描边或者填充
                context.lineCap = "round";

                if (type === "fill") {
                    context.fill();
                } else {
                    context.stroke();
                }
                context.closePath();
            } else {
                console.error("invalid arguments");
                return false;
            }

        }
    }
    Object.setPrototypeOf(draw.parallelogram, common);

    //星形
    draw.star = {
        name: "star",
        make: function () {
            this.reset();
            options.star = {
                position: {},
                points: 5,
                radial: {}
            }
            return this;
        },
        position: function (args) {
            if (isNumber(args.x, args.y)) {
                options.star.position = {
                    x: args.x,
                    y: args.y
                }
                return this;
            } else {
                console.error("arguments of position function must be number");
                return false;
            }
        },
        points: function (num) {
            if (isNumber(num)) {
                options.star.points = num;
                return this;
            } else {
                console.error("arguments of position function must be number");
                return false;
            }
        },
        radial: function (args) {
            if (isNumber(args.inner, args.outer)) {
                options.star.radial = {
                    inner: args.inner,
                    outer: args.outer
                }
                return this;
            } else {
                console.error("arguments of radial function must be number");
                return false;
            }
        },
        create: function (type = "fill") {
            let available = ["fill", "stroke"];

            if (available.includes(type)) {

                context.beginPath();

                //转存星形的内径和外径
                const outerRadial = options.star.radial.outer;
                const innerRadial = options.star.radial.inner;

                //计算所需要的角度
                const angle = {}
                angle.each = 360 / options.star.points;
                angle.small = 90 - angle.each;
                angle.large = angle.each / 2 + angle.small;

                //循环计算出每一个点，并画点
                //五角星为例，R是外径，r是内径
                //外顶点公式 x : Math.cos( (18+72*i)/180 * Math.PI) * R
                //          y : Math.sin((18+72*i)/180 * Math.PI) * R
                //内顶点公式  x : Math.cos( (54+72*i)/180 * Math.PI) * r
                //          y :  Math.sin((54+72*i)/180 * Math.PI) * r 
                for (let i = 0; i < options.star.points; i++) {
                    let outer = {
                        x: Math.cos((angle.small + angle.each * i) / 180 * Math.PI) * outerRadial + options.star.position.x,
                        y: -Math.sin((angle.small + angle.each * i) / 180 * Math.PI) * outerRadial + options.star.position.y
                    }
                    context.lineTo(outer.x, outer.y);

                    let inner = {
                        x: Math.cos((angle.large + angle.each * i) / 180 * Math.PI) * innerRadial + options.star.position.x,
                        y: -Math.sin((angle.large + angle.each * i) / 180 * Math.PI) * innerRadial + options.star.position.y
                    }
                    context.lineTo(inner.x, inner.y);
                }

                //填充或者描边
                if (type === "fill") {
                    context.fill();
                } else if (type === "stroke") {
                    context.stroke();
                }
                context.closePath();

            } else {
                console.error("invalid arguments");
                return false;
            }

        }
    }
    Object.setPrototypeOf(draw.star, common);

    //网格 
    draw.grid = {
        name: "grid",
        make: function () {
            this.reset();
            options.grid = {
                space: 0,
                close: false
            }
            return this;
        },
        step: function (arg) {
            if (isNumber(arg)) {
                options.grid.space = arg;
                return this;
            } else {
                console.error("arguments of step function must be number");
                return false;
            }
        },
        close: function (bool) {
            if (typeof bool === "boolean") {
                options.grid.close = bool
                return this;
            } else {
                console.error("arguments of close function must be boolean");
                return false;
            }
        },
        create: function () {
            const drawGrid = function (startX, startY, endX, endY) {
                context.beginPath();
                context.moveTo(startX, startY);
                context.lineTo(endX, endY);
                context.stroke();
                context.fill();
                context.closePath();
            }

            if (options.grid.close) {
                let hCount = parseInt(canvas.height / options.grid.space);
                let vCount = parseInt(canvas.width / options.grid.space);

                for (let h = 0; h <= hCount; h++) {
                    drawGrid(0, h * options.grid.space, options.grid.space * vCount, h * options.grid.space);
                }

                for (let v = 0; v <= vCount; v++) {
                    drawGrid(v * options.grid.space, 0, v * options.grid.space, options.grid.space * hCount)
                }

            } else {
                for (let h = 0; h <= canvas.height; h = h + options.grid.space) {
                    drawGrid(0, h, canvas.width, h);
                }

                for (let v = 0; v <= canvas.width; v = v + options.grid.space) {
                    drawGrid(v, 0, v, canvas.height);
                }
            }
            return this;
        }
    }
    Object.setPrototypeOf(draw.grid, common);

    //文本
    draw.text = {
        name: "text",
        make: function () {
            this.reset();
            options.text = {
                position: {},
                write: "",
                align: "",
                baseline: "",
                font: []
            }
            return this;
        },
        position: function (arg) {
            if (isNumber(arg.x, arg.y)) {
                options.text.position = {
                    x: arg.x,
                    y: arg.y
                }
                return this;
            } else {
                console.error("arguments of position function must be number");
                return false;
            }
        },
        write: function (text) {
            options.text.write = text;
            return this;
        },
        align: function (arg) {
            let available = ["start", "center", "end", "left", "right"];
            if (available.includes(arg)) {
                options.text.align = arg;
            }
            return this;
        },
        baseline: function (arg) {
            let available = ["top", "bottom", "middle", "alphabetic", "ideographic", "hanging"];
            if (available.includes(arg)) {
                options.text.baseline = arg;
            }
            return this;
        },
        style: function (arg) {
            let available = ["normal", "italic", "oblique"];
            if (available.includes(arg)) {
                options.text.font.style = arg;
            }
            return this;
        },
        variant: function (arg) {
            let available = ["normal", "small-caps"];
            if (available.includes(arg)) {
                options.text.font.variant = arg;
            }
            return this;
        },
        weight: function (arg) {
            options.text.font.weight = arg
            return this;
        },
        size: function (arg) {
            options.text.font.size = arg
            return this;
        },
        family: function (arg) {
            options.text.font.family = arg;
            return this;
        },
        create: function (type = "fill") {
            let available = ["fill", "stroke"];

            if (available.includes(type)) {
                //构造样式字符串
                {
                    let str = "";
                    let strArr = [
                        options.text.font.style,
                        options.text.font.variant,
                        options.text.font.weight,
                        options.text.font.size,
                        options.text.font.family
                    ];
                    strArr.forEach((property) => {
                        if (property !== undefined) {
                            if (property.includes(" ")) {
                                property = `'${property}'`;
                            }
                            str += property + " ";
                        }
                    })
                    str = str.trim();
                    context.font = str;
                }

                //设置对齐和基线
                context.textAlign = options.text.align;
                context.textBaseline = options.text.baseline;

                //填充或者描边
                if (type === "fill") {
                    context.fillText(options.text.write, options.text.position.x, options.text.position.y);
                } else if (type === "stroke") {
                    context.strokeText(options.text.write, options.text.position.x, options.text.position.y);
                }
                return this;

            } else {
                console.error("invalid arguments");
                return false;
            }
        },
        measure: function (text) {
            return context.measureText(text).width;
        }
    }
    Object.setPrototypeOf(draw.text, common);

    //图像
    draw.image = {
        name: "image",
        make: function () {
            this.reset();
            options.image = {
                position: {},
                size: {},
                sourcePosition: {},
                sourceSize: {},
                object: {},
                data: {},
                isImageData: false
            }
            return this;
        },
        src: async function (src) {
            let image = new Image();
            image.src = src;
            options.image.object = image;

            const event = await (function waitImageLoaded() {
                return new Promise((resolve) => {
                    image.addEventListener("load", resolve)
                })
            })();

            if (event.isTrusted) {
                return this;
            }
        },
        position: function (args) {
            if (isNumber(args.x, args.y)) {
                options.image.position = {
                    x: args.x,
                    y: args.y
                }
                return this;
            } else {
                console.error("arguments of position function must be number");
                return false;
            }
        },
        size: function (args) {
            if (isNumber(args.width, args.height)) {
                options.image.size = {
                    width: args.width,
                    height: args.height
                }
                return this;
            } else {
                console.error("arguments of size function must be number");
                return false;
            }
        },
        sourcePosition: function (args) {
            if (isNumber(args.x, args.y)) {
                options.image.sourcePosition = {
                    x: args.x,
                    y: args.y
                }
                return this;
            } else {
                console.error("arguments of sourcePosition function must be number");
                return false;
            }
        },
        sourceSize: function (args) {
            if (isNumber(args.width, args.height)) {
                options.image.sourceSize = {
                    width: args.width,
                    height: args.height
                }
                return this;
            } else {
                console.error("arguments of sourceSize function must be number");
                return false;
            }
        },
        draw: function () {
            let args = [options.image.object];
            if (options.image.sourcePosition.x && options.image.sourceSize.width) {
                args.push(
                    options.image.sourcePosition.x,
                    options.image.sourcePosition.y,
                    options.image.sourceSize.width,
                    options.image.sourceSize.height,
                    options.image.position.x,
                    options.image.position.y,
                    options.image.size.width,
                    options.image.size.height
                )
            } else {
                args.push(options.image.position.x, options.image.position.y);
                if (options.image.size.width) {
                    args.push(options.image.size.width, options.image.size.height);
                }
            }
            context.drawImage(...args);
            return this;
        },
        get: function () {
            options.image.data = context.getImageData(
                options.image.position.x,
                options.image.position.y,
                options.image.size.width,
                options.image.size.height
            );
            options.image.isImageData = true;
            Object.setPrototypeOf(Object.getPrototypeOf(options.image.data), this);
            return options.image.data;
        },
        put: function (args) {
            if (options.image.isImageData) {
                if (!args.dirtyX) {
                    context.putImageData(options.image.data, args.x, args.y);
                } else {
                    context.putImageData(
                        options.image.data,
                        args.x,
                        args.y,
                        args.dirtyX,
                        args.dirtyY,
                        args.dirtyWidth,
                        args.dirtyHeight
                    );
                }
                return this;
            } else {
                console.error("cannot use put function on non-imageData Object");
                return false;
            }
        },
        open: function () {
            options.image.data = context.createImageData(options.image.size.width, options.image.size.height);
            Object.setPrototypeOf(Object.getPrototypeOf(options.image.data), this);
            return options.image.data;
        }
    }
    Object.setPrototypeOf(draw.image, common);

    //动画
    draw.animate = {
        options: {
            lasttime: 0,
            lastFpsUpdateTime: 0
        },
        fps: function () {
            let now = Number(new Date), fps = 1000 / (now - this.options.lasttime);
            this.options.lasttime = now;
            return parseInt(fps);
        },
        interval: function (speed, callback) {
            let now = Number(new Date);
            let elaspedTime = now - this.options.lastFpsUpdateTime;
            if (elaspedTime >= speed) {
                this.options.lastFpsUpdateTime = now;
                callback();
            }
        }
    }
    return draw;
})()