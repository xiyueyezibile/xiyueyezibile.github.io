---
layout:     post
title:      react fiber原理篇
subtitle:   react fiber原理篇
date:       2024-10-17
author:     XIY
header-img: img/post-bg-cook.jpg
catalog: true
tags:
    - react
    - frontend
    - 源码
---
（更新中）
## 为什么会有 fiber 架构？

原架构采用递归遍历方式来更新 DOM 树，一旦开始，即占用主线程，无法中断（微任务也能中断？微任务无法真正中断递归过程，只能在同步任务结束后执行，无法满足 React 对任务优先级和中断恢复的需求），这在页面上会引起问题，如 input 输入后页面卡顿等 。

filer 使用链表结构，将递归遍历更改为循环遍历，实现任务拆分、中断和恢复，从而解决上述问题。

Fiber 实际上是一种**核心算法**，为了解决中断和树庞大的问题

## element、fiber、DOM 元素三者的关系

1. element 对象就是我们的 jsx 代码，上面保存了 props、key、children 等信息；
2. DOM 元素就是最终呈现给用户展示的效果；
3. 而 fiber 就是充当 element 和 DOM 元素的桥梁，简单来说，只要 element 发生改变，就会通过 fiber 做一次调和，使对应的 DOM 元素发生改变。

## fiber 保存了什么信息？

1. 对应 element 的信息；

```ts
export type Fiber = {
  tag: WorkTag,  // 组件的类型，判断函数式组件、类组件等（上述的tag）
  key: null | string, // key
  elementType: any, // 元素的类型
  type: any, // 与fiber关联的功能或类，如<div>,指向对应的类或函数
  stateNode: any, // 真实的DOM节点
  ...
}

```
2. Fiber 链表相关的内容和相关的 props、state。

```ts
export type Fiber = {
  ...
  return: Fiber | null, // 指向父节点的fiber
  child: Fiber | null, // 指向第一个子节点的fiber
  sibling: Fiber | null, // 指向下一个兄弟节点的fiber
  index: number, // 索引，是父节点fiber下的子节点fiber中的下表
  
  ref:
    | null
    | (((handle: mixed) => void) & {_stringRef: ?string, ...})
    | RefObject,  // ref的指向，可能为null、函数或对象
    
  pendingProps: any,  // 本次渲染所需的props
  memoizedProps: any,  // 上次渲染所需的props
  updateQueue: mixed,  // 类组件的更新队列（setState），用于状态更新、DOM更新
  memoizedState: any, // 类组件保存上次渲染后的state，函数组件保存的hooks信息
  dependencies: Dependencies | null,  // contexts、events（事件源） 等依赖

  mode: TypeOfMode, // 类型为number，用于描述fiber的模式 
  ...
}
```
3. 副作用相关的内容

```ts
export type Fiber = {
  ...
   flags: Flags, // 用于记录fiber的状态（删除、新增、替换等）
   subtreeFlags: Flags, // 当前子节点的副作用状态
   deletions: Array<Fiber> | null, // 删除的子节点的fiber
   nextEffect: Fiber | null, // 指向下一个副作用的fiber
   firstEffect: Fiber | null, // 指向第一个副作用的fiber
   lastEffect: Fiber | null, // 指向最后一个副作用的fiber
  ...
}
```
4. 优先级相关的内容。

```ts
export type Fiber = {
  ...
  lanes: Lanes, // 优先级，用于调度
  childLanes: Lanes,
  alternate: Fiber | null,
  actualDuration?: number,
  actualStartTime?: number,
  selfBaseDuration?: number,
  treeBaseDuration?: number,
  ...
}
```


## element 如何转换为 fiber 的？

### react 整个流程的开始：beginWork

beginWork 的入参：

1. current：在视图层渲染的树；
2. workInProgress：这个参数尤为重要，它就是在整个内存中所构建的 Fiber；树，所有的更新都发生在 workInProgress 中，所以这个树是最新状态的，之后它将替换给 current；
3. renderLanes：跟优先级有关。


Fiber 结构的创建和更新都是深度优先遍历，遍历顺序为：

Fiber 的创建在beginWork中，从父节点开始创建，再创建子节点，子节点创建完之后，再创建兄弟节点，依次类推。


## useState 的更新流程


hooks 更新有三个阶段：**初始化阶段**、**更新阶段**、**异常处理**。

### 初始化阶段

所有的 Hooks 都会走 mountIndeterminateComponent 这个函数，只是不同的 Hooks 保存着不同的信息。
mountIndeterminateComponent 获取初始的 hooks

```ts
function mountWorkInProgressHook(): Hook {
  const hook: Hook = {
    memoizedState: null,
    baseState: null,
    baseQueue: null,
    queue: null,
    next: null,
  };

  if (workInProgressHook === null) { // 第一个hooks执行
    currentlyRenderingFiber.memoizedState = workInProgressHook = hook;
  } else { // 之后的hooks
    workInProgressHook = workInProgressHook.next = hook;
  }
  return workInProgressHook;
}
```

- memoizedState：用于保存数据，不同的 Hooks 保存的信息不同，比如 useState 保存 state 信息，useEffect 保存 effect 对象，useRef 保存 ref 对象；
- baseState：当数据发生改变时，保存最新的值；
- baseQueue：保存最新的更新队列；
- queue：保存待更新的队列或更新的函数；
- next：用于指向下一个 hook 对象。

mountWorkInProgressHook 的作用就很明确了，每执行一个 Hooks 函数就会生成一个 hook 对象，然后将每个 hook 串联起来。

### 更新阶段

updateWorkInProgressHook 跟 mountWorkInProgressHook 一样，当函数更新时，所有的 Hooks 都会执行。

updateWorkInProgressHook 会返回更新后的 hook 对象。

updateReducer 的作用是将待更新的队列 pendingQueue 合并到 baseQueue 上，之后进行循环更新，最后进行一次合成更新，也就是批量更新，统一更换节点。

这种行为解释了 useState 在更新的过程中为何传入相同的值，不进行更新，同时多次操作，只会执行最后一次更新的原因了。

```ts
function Index() {
  const [count, setCount] = useState(0);

  return (
    <div style={{ padding: 20 }}>
      <div>数字：{count}</div>
      <Button
        onClick={() => {
          // 第一种方式
          setCount((v) => v + 1);
          setCount((v) => v + 2);
          setCount((v) => v + 3);

          // 第二种方式
          setCount(count + 1);
          setCount(count + 2);
          setCount(count + 3);
        }}
      >
        批量执行
      </Button>
    </div>
  );
}

export default Index;

```
第一种 count 等于：6；

第二种 count 等于：3 。

出现这种原因也非常简单，当 setCount 的参数为函数时，此时的返参 v 就是 baseQueue 链表不断更新的值，所以为 0 + 1 + 2 + 3 = 6。

而第二种的 count 为渲染后的值，也就是说，三个 setCount 全部执行完成，合并之后，count 才会变，在合并前为 0 + 1， 0 + 2， 0 + 3。最后一次为 3，所以 count 为 3。

## useEffect 原理

useEffect 与 useState 的阶段有所不同，共分为：初始化阶段、更新阶段、commit 阶段

### mountEffect（初始化阶段）

```ts
function mountEffect(
  create: () => (() => void) | void, // 回调函数，也是副作用函数
  deps: Array<mixed> | void | null, // 依赖项
): void {
  mountEffectImpl(
    PassiveEffect | PassiveStaticEffect,
    HookPassive,
    create,
    deps,
  );
}

function mountEffectImpl(
  fiberFlags: Flags, // 有副作用的更新标记，用来标记 hook 在 fiber 中的位置
  hookFlags: HookFlags,// 副作用标记；
  create: () => (() => void) | void,
  deps: Array<mixed> | void | null,
): void {
  const hook = mountWorkInProgressHook();
  const nextDeps = deps === undefined ? null : deps;
  currentlyRenderingFiber.flags |= fiberFlags;
  hook.memoizedState = pushEffect(
    HookHasEffect | hookFlags,
    create,
    undefined,
    nextDeps,
  );
}

```

1. 初始化一个 hook 对象，并和 fiber 建立关系；
2. 判断 deps 是否存在，没有的话则是 null（需要注意下这个参数，后续会详细讲解）；
3. 给 hook 所在的 fiber 打上副作用的更新标记；
4. 将副作用的**操作**(没有存放副作用对象)存放到 hook.memoizedState 中。
5. `pushEffect`：创建一个 effect 对象，然后形成一个 effect 链表，通过 next 链接 ，最后绑定在 fiber 中的 updateQueue 上

fiber.updateQueue 保存的是所有副作用，除了包含 useEffect，同时还包含 useLayoutEffect 和 useInsertionEffect。

### updateEffect（更新阶段）

判断 deps 是否发生改变，如果没有发生改变，则直接执行 `pushEffect`，如果发生改变，则附上不同的标签，最后在 commit 阶段，通过这些标签来判断是否执行 effect 函数。

1. 当 deps 不存在时，也就是 undefined，则会当作 null 处理，所以无论发生什么改变，areHookInputsEqual 的值始终为 false，从而每次都会执行；
2. 当 deps 为空数组时，areHookInputsEqual 返回值为 true，此时只更新链表，并没有执行对应的副作用，所以只会走一次；
3. 当 deps 为对象、数组、函数时，虽然保存了，但在 objectIs 做比较时，旧值与新值永远不相等，也就是[1] !== [1]、{a: 1} !== {a: 1}（指向不同），所以只要当 deps 发生变动，都会触发更新。

### commitRoot（commit 阶段）

`scheduleCallback` 是 React 调度器（Scheduler）的一个 API，最终通过一个宏任务来异步调度传入的回调函数，使得该回调在下一轮事件循环中执行，此时浏览器已经绘制过一次。同时可以看出，effectlist 的优先级是：普通优先级。

**effect 的执行需要保证所有组件的 effect 的销毁函数执行完才能够执行。**

因为多个组件可能共用一个 ref，如果不将销毁函数执行，改变 ref 的值，有可能会影响其他 effect 执行。


### 总结

1. useEffect 初始化阶段

建立一个 hook 对象，与 fiber 建立关联，并给 hook 所在的 fiber 打上副作用更新标记，最后存储在 fiber 中的 memoizedState，同时在 fiber 中的 updateQueue 存储了相关的副作用（这些副作用是闭环链表）。

2. useEffect 更新阶段

这个阶段最主要的是：判断 deps 是否发生改变，如果没有改变，则更新副作用链表；如果发生改变，则在更新链表的时候，打上对应的副作用标签。之后在 commit 阶段，根据对应的标签，重新执行对应的副作用。

3. useEffect 执行阶段

在 commit 阶段中，入口为 commitRoot，走到 commitRootImpl，用 scheduleCallback 进行调度，同时 effectlist 属于普通调度，最终走向：commitPassiveMountEffects 和 commitPassiveUnmountEffects，回调和销毁的过程类似。值得注意的是：不同的 effect 通过 effectTag 来判断。