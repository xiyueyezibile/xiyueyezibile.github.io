---
layout:     post
title:      barrel files的危害
subtitle:   webpack
date:       2025-7-31
author:     XIY
header-img: img/zyh.png
catalog: true
tags:
    - webpack
    - frontend
    - 性能优化
---

## 什么是 barrel files

Barrel files，中文翻译为“桶文件”，是一种在JavaScript项目中常见的文件组织方式。它们通常是一个或多个模块的集合，通过一个入口文件（通常命名为index.js或index.ts）导出。这种组织方式可以提高代码的可维护性和可读性，但也可能带来一些潜在的问题。

Barrel files 本质上就是一种聚合多个模块并统一导出的编码模式，我们可以代码文件夹中创建一个 Barrel File，通过该文件统一导出可用模块，外部模块在消费时只需引用到 Barrel 文件即可，无需关心代码文件夹内部细节，这会带来一些好处：

1. 引用方无需感知依赖模块的具体文件结构，达到简化导入语句，在大型工程中这有利于提升开发效率；
2. Barrel Files 有助于管理模块的可见性，对外屏蔽不必要的细节，从而降低模块间耦合；
3. 模块之间通过 Barrel Files 解耦后，后续更容易做重构，例如重命名、移动文件等，都只需要修改 barrel files 即可；
4. 使用 Barrel Files 可以统一模块的导出方式, 使代码的结构和导入方式更加一致和规范，便于团队协作。

## barrel files 的危害
然而，Barrel files 也有一些潜在的危害：

### tree shaking 失效

Tree shaking 是一种优化技术，用于消除未使用的代码，从而减小最终打包文件的体积。然而，当使用 Barrel files 时，tree shaking 可能会失效。
```js
// ./test.js

export function test() {
  console.log("test1");
}

// ./b.js

export * from "./test";

export function test2() {
  console.log("b.js");
}

// ./index.js

import { test2 } from "./b";

test2();

```
打包结果：

```js
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";

;// ./src/b.js


function test2() {
  console.log("b.js");
}

;// ./src/index.js


test2();

/******/ })()
;
```
看着是不是符合预期的？

那我稍微改动一下`./test.js`文件呢？

```js
console.log("ee");

export function test() {
  console.log("test1");
}
```
打包结果：
```js
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";

;// ./src/test.js
console.log("ee");

function test() {
  console.log("test1");
}

;// ./src/b.js


function test2() {
  console.log("b.js");
}

;// ./src/index.js


test2();

/******/ })()
;
```

为什么两次结果不一样？

原因很简单，构建工具认为 SingleTon 是一段有 `sideEffects` 的代码，出于安全考虑不予删除。在 Barrel Files 模式下，这意味着下游模块所有被判定为带有 `sideEffects` 的代码都会被保留下来，导致最终产物可能被打入许多无用代码。注意，有许多代码模式会被判定为具有 `sideEffects`，包括：

- 顶层函数调用，如：console.log('a')；
- 修改全局状态或对象，如：document.title = 'new Title'；
- IIFE 函数；
- 动态导入语句，如：import('./mod')；
- 原型链污染，如：Array.prototype.xxx = function (){xxx}；
- 非 JS 资源：Tree-shaking 能力仅对 ESM 代码生效，一旦引用非 JS 资源则无法树摇；
- 等等；

严格来说，并不单纯是 Barrel Files 模式导致 tree-shaking 失效，而是 Barrel Files 叠加 sideEffects 的判定逻辑导致部分场景下树摇失败。那么相对的，假如放弃 Barrel Files 模式(虽然这会给损害 DX)，直接引用具体模块代码，必然也就不会带入其他无用模块的 sideEffects。

### 循环引用

循环引用在 barrel files 模式下会引发问题，比如：

```js
// a.js
import { b } from './index.js';
export function a() {
  console.log('a');
  b();
}

// b.js
import { a } from './index.js';
export function b() {
  console.log('b');
  a();
}

// index.js
export { a } from './a.js';
export { b } from './b.js';
```
看似 a 和 b 没有直接引用，但实际只不过绕了一层罢了，最终还是会形成循环引用。

两者的循环依赖从直接变成间接，以人类的认知能力而言变得相对隐晦而难以察觉，这只是一个简单示例，当项目规模增长十倍、百倍时，循环依赖的概率也会相应大幅增长。

### 影响部分工程化工具性能

Barrel Files 模式容易引入无用代码，无用是指代码被定义、导入却从未被业务系统消费，但这些无用代码却是实实在在影响着许多工程工具的执行性能，包括但不限于：Typescript、VS Code、Vitest、Webpack、RSPack、ESLint 等等。

在 Barrel Files 模式下，工程工具需要解析 barrel files 中的所有模块，这会带来额外的性能开销，同时，这些工具还需要解析 barrel files 中的模块依赖关系，这同样会带来额外的性能开销。

而某些模块可能根本没有被消费，这些模块的解析和依赖关系解析都是无用的，它们只会浪费工程工具的性能，而不会带来任何价值。