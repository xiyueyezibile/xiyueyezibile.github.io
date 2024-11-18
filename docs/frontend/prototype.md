---
title: 尝试一图理清prototype、proto、原型对象之间的关系
author: xiyue
date: '2024-09-25'
---


原型和原型链的关系错综复杂，最近借鉴了网上各位大神的文章，终于感觉搞懂了，于是马上写了这篇文章理清思路。
## 图示
```js
function Foo(){};
let foo = new Foo();
```


![image.png](/images/1.png)

## 概念
在开始讲解之前我们要理清一些概念：

1. **函数即是对象**
2. **原型对象(prototype object)**:顾名思义就是 `prototype` 指向的对象,在 JavaScript 中，每当定义一个对象（函数） 时候，对象中都会包含一些预定义的属性，我们可以想象这些预定义的属性都在一个叫原型对象的地方存着，也就是说把对象当成两块去理解，一块是本体，一块是原型对象。原型对象本身又是一个普通对象，所以它也有自己的原型对象。
3. **`__proto__`和`constructor`属性是对象独有的**。
4. **`prototype` 属性是函数独有的**
5. **构造函数**:用来初始化新创建的对象的函数是构造函数。在例子中，Foo()函数是构造函数
6. **实例对象**:通过构造函数的new操作创建的对象是实例对象。可以用一个构造函数，构造多个实例对象


因此，对象拥有`__proto__`和`constructor`属性。
函数拥有`__proto__`和`constructor`以及`prototype`属性。
关于`__proto__`和`constructor`以及`prototype`属性的作用，可以参考这篇文章里面关于它们的解释
[尝试一篇文章说清JS继承（文字、内存、图片三方面解析__proto__、constructor、prototype） - 掘金 (juejin.cn)](https://juejin.cn/post/7196859948553748539#heading-4)

  
于是我们就可以一点一点的补充出上面的图了。

## 从0绘出关系图
```js
function Foo(){};
let foo = new Foo();
```
### 最初版乞丐图
我们先从**foo实例对象**,以及**Foo构造函数**和**Foo的原型对象**的关系下手:

![image.png](/images/2.png)
验证一下：
```js
function Foo() {}
let foo = new Foo()
console.log(foo.constructor === Foo)
console.log(Foo.prototype === foo.__proto__)
console.log(Foo.prototype.constructor === Foo)
```
结果:

![image.png](/images/3.png)

分析:

第三行中`foo.constructor === Foo`，foo上是没有`constructor`的，它的`constructor`是继承而来的，顺着`__proto__`找到Foo的原型对象，它有`constructor`属性,并且指向Foo构造函数，所以成立。
### 路径完善图
上图离我们最终形态差的还是有点远，前面说到对象应该有`__proto__`和`constructor`,函数应该有`__proto__`和`constructor`和`prototype`属性，现在我们补齐:

![image.png](/images/4.png)
验证一下：
```js
function Foo() {}
let foo = new Foo()
console.log(Foo.__proto__ === Function.prototype)
console.log(Foo.constructor === Function)
console.log(Foo.prototype.__proto__ === Object.prototype)
```
结果:

![image.png](/images/5.png)
分析:

Foo的构造函数是Function函数，所以Foo的`__proto__`指向Function的原型对象,Foo的`constructor`指向Function函数，Foo的原型对象也是一个普通对象，它的构造函数是Object函数，所以Foo的原型对象的`__proto__`指向Object的原型对象。

现在可以看到foo,Foo,Foo原型对象都不差属性了,但又引入了Object和Function函数及其原型对象，接下来画的这部分就是JS规定好了的，无需纠结，记住就行。画的时候记住一点，所有的函数的构造函数源头都是Function函数，所有的对象的原型对象源头都是Object的原型就行。
### 最终实现图
把每个对象和函数需要的属性补齐。

![image.png](/images/6.png)
验证一下:
```js
function Foo() {}
let foo = new Foo()
console.log(Function.constructor === Function)
console.log(Function.prototype === Function.__proto__)
console.log(Function.prototype.__proto__ === Object.prototype)
console.log(Object.prototype.__proto__ === null)
console.log(Object.constructor === Function)
```
结果:

![image.png](/images/7.png)
分析:

Function函数的`constructor`指向它本身。

Function函数的`prototype`和`__proto__`都指向Function 函数的原型对象。

Function函数的原型对象的`__proto__`指向Object的原型对象。

Object函数的原型对象的`__proto__`指向`null`

Object函数的`constructor`指向Function函数

上面的分析一部分是JS规定的，还有一部分就遵循画之前说的的原则了。
## 最后
总之，终于把它们之间的关系理清除了，如果有什么不对的地方欢迎指正。
## 参考资料
[理解prototype、proto和constructor的关系](https://juejin.cn/post/7031748688443768845)

[尝试一篇文章说清JS继承（文字、内存、图片三方面解析__proto__、constructor、prototype）](https://juejin.cn/post/7196859948553748539)