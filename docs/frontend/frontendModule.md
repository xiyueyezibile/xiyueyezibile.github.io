---
title: 前端模块化
author: xiyue
date: '2023-10-30'
---

## 前端模块化发展史
时间线：
- 2009年 Mozilla 工程师发起了 `CommonJS` 规范制定的提案，同年 Node.js 基于 `CommonJS` 规范应运而生
- 2010年美国程序员开发了 Requirejs, 并同时发布了 `AMD` 规范
- 2011年中国程序支付宝前端大神玉伯开发了Sea.js，并同时发布的 `CMD` 规范
- 2015年ECMAScript 发布了第 6 个版本，同时包含了 `es6 模块化`规范

## 各类模块化适用范围
- `CommonJS` 规范模块加载是**同步**的，服务器端加载的模块从内存或磁盘中加载，耗时基本可以忽略，所以在服务的开发语言 nodejs 中完全是适用的，但到了浏览器端就不行了，由于网络加载存在延迟，多个 js 如果存在前后依赖，则很难保证加载顺序，所以 `CommoneJS`规范不适用于浏览器端
- `AMD` 规范是适用于浏览器端的异步加载规范。
- `CMD` 规范也是适用于浏览器的异步加载规范。
- `ES6` 作为官方标准同样适用于浏览器端的异步加载规范，但目前浏览器还不能完全支持，需要 babel 转换，node.js 中也在逐渐完善对其的支持
## CommonJS规范：

### -引入模块

- 使用`require(“模块的路径”)`函数来引入模块

- 模块名要以`./`或`../`开头

- 在定义模块时，模块中的内容默认是不能被外部看到的。

- 可以通过`exports`来设置要向外部暴露的内容。

- `module.exports`同时导出多个值。

### -引入核心模块

- `require("核心模块名字")`

- `.cjs`为扩展名，表示是一个 `CommonJS` 模块

- 也可以用文件夹作为一个模块，`require("./文件名")`

- 所有`CommonJS`的模块都会包装到一个函数中

```js
(function(exports，require，module，_ _filename,__dirname){
​
})
```

- 默认 nodejs 中的模块化标准是`CommonJS`

### 要变成ES规范，有两种方法：

1.文件后缀名为`.mjs`

2.创建`package.json`文件，修改type属性为 `module`

## AMD

在`CommonJS`规范中，模块是**同步加载的**（毕竟它是设计给服务端nodejs的），也就是说，即使不需要依赖其他模块的代码，依然需要等待前面模块加载完毕之后才能开始执行，在模块越来越大之后无疑会损失更多性能，因此 `AMD`（Asynchronous Module Definition 异步模块定义）便应运而生，顾名思义，这个规范实现了模块的异步加载。

## CMD

`CMD` 的基本逻辑跟 `AMD` 是一致的，只不过在写法上 `CMD` 采用了`cjs`的部分语法，且 `CMD` 仅**支持浏览器端使用**，并在模块加载方面针对浏览器端运行的代码做了些许优化。同样需要引入三方库来支持 CMD 规范，比较常用的是`sea.js`

## ES模块化：

### 通过 `export` 导出变量

```js
export let a  = 10
```

### 导入用 `import`

```js
import "./m3.mjs"
```

- es模块不能省略扩展名

### 导入值

```
import {a,b} from "./m3.mjs"
```

```
import {a as m,b} from "./m3.mjs"
```

`as`把`a`名字改成`m`，`a`就不能用了

```
import * as m4 from "./m3.mjs"
```

`*`表示导入所有，以对象形式，并且改名为`m4`

### 设置默认导出

```
export default function sum(a,b) {
​
  return a + b
​
}
```

### 导入默认导出，默认导出内容可以随便起名，一个模块只有一个默认导出

```js
import asd from "./m3.mjs" 
```

### 可以同时导出

```js
import asd,{a,b} from "./m3.mjs" 
```

**通过ES模块化导入的都是常量（const），es模块运行在严格模式下**

## 总结

-   nodejs 直接支持`commonjs`和`es6模块`，浏览器端直接支持`es6模块`，其余情况下均需要第三方工具预编译或运行时支持
-   `commonjs`采用**同步方式**加载模块，而其余三者则使用异步方式对模块进行加载
-   `commonjs`、`AMD`和`CMD`模块导出的均是**对象值的复制**，而`es6模块`采用`具名方式导出`时**导出的是地址**，后者被导出内容**在模块内发生变化时会反映到外部**。


具名导出：  
根据变量的名字进行导出,这种导出方式可以同时导出多个值，但是需结合{}使用，可以在导出时使用as提供别名，导入后就得根据别名导入

```js
let fol="123";
export {fol};
export {fol as myfol};
```
基本导出
```js
export var color = "red";
```
## 核心模块

nodejs 中自带的模块，可以在 nodejs 中直接使用

`global`是node中的全局对象，作用类似于`window`

ES标准下，全局对象的标准名`globalThis`

### Process

表示当前node的进程

通过该对象可以获取进程的信息，或者对进程做各种操作

`process.exit()` 结束当前进程

`process.nextTick(callback)` 将函数插入到tick队列中

代码执行顺序：

1. 调用栈

2. tick队列，会在微任务队列和宏任务队列中任务之前执行

3. 微任务队列

4. 宏任务队列

```js
require("process")
​
setTimeout(()=>{
    console.log(1);
})
queueMicrotask(()=>{
    console.log(2);
})
process.nextTick(()=>{
    console.log(3);
})
console.log(4);
​
```

### Path

表示的路径

通过path可以获取各种路径

`path.resolve([...paths])`生成一个绝对路径

如果直接调用`resolve`会直接返回当前的工作目录

如果将相对路径作为参数，则`resolve`会自动将其转换为绝对路径

根据工作目录不同，产生的绝对路径不同。

所以一般会将一个绝对路径作为第一个参数，一个相对路径作为第二个参数

这样他会自动计算出对应的路径，但是这样也不推荐，因为换绝对路径就会报错

**最终**

`path.resolve(__dirname,"./m5.js")`

前面用`__dirname`可以直接获取绝对路径，再加上后面的路径。

而且在任何方式去获取路径获取的都是一样的。

### fs

用来帮助node操作磁盘中的文件

文件操作也就是所谓的I/O操作，`input output`

```js
fs.readFileSync（路径）同步读取文件的方法，会阻塞后面代码的执行
```

当我们通过fs模块读取磁盘中的对象时，读取到的数据总以Buffer对象的形式返回

Buffer是一个临时用来存储数据的缓冲区

`fs.readFile(路径，回调函数)` 异步读取文件的方法

数据会以函数的参数传进来，它有两个参数

`(err,buffer)=>{}`

错误信息会传进第一个参数，没用则是`null`

否则会传进`buffer`中。

这个方法不会阻塞后续代码的执行，但是用到了回调函数

所以我们`require("fs/promises")`

获取`promise`版本的`fs`

`fs.readFile(路径)`

```js
const buf = fs.readFile(path.resolve(__dirname,"./m2.js")).then(()=>{
    console.log(buf.toString());
},()=>{
    console.log('出错了');
})
​
```

或者用`async`

```js
;(async () => {
    try{
const buf = await fs.readFile(path.resolve(__dirname,"./m2.js"))
console.log(buf.toString());
    }catch (e) {
        console.log(e);
    }
})()
​
```

`fs.appendFile(路径，写进去的数据)`创建新文件，或者将数据添加到已有文件中

返回值为`undefined`

```js
fs.appendFile(path.resolve(__dirname,"./fs创建的.js"),"我是被m5中fs创建的")
```

`fs.mkdir(路径)`创建目录

`mkdir` 可以接收一个配置对象作为第二个参数，通过该对象，可以对方法的功能进行配置

`recursive` 默认`false`，设置为`true`后，自动创建不存在的上一级目录

`{recursive:true}`

```js
const fs = require("node:fs/promises")
const path = require("node:path")
fs.mkdir(path.resolve(__dirname,"./creatFS")).then(()=>{
    console.log("操作成功");
})
```

`fs.rmdir(路径)` 删除目录

`recursive`对rmdir也同理

`fs.rm()`删除文件

`fs.rename(旧名路径，新名路径)` 重命名（实际是剪切，可以移位置）

`fs.copyFile(复制文件路径，转移路径)`复制文件

`fs.writeFile(文件路径，写入值)`重写文件