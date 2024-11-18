---
title: zustand 源码解析
author: xiyue
date: '2024-07-06'
---
官方使用样例：

```ts
import { create } from 'zustand'

const useBearStore = create((set) => ({
  bears: 0,
  increasePopulation: () => set((state) => ({ bears: state.bears + 1 })),
  removeAllBears: () => set({ bears: 0 }),
}))
```

可以看到一个 create 就创建了仓库，传参则是一个回调函数，里面包含我们定义的状态和更改函数。

实际上，回调函数里面有3个参数。

```
// react.ts
export const create = (<T>(createState: StateCreator<T, [], []> | undefined) =>
  createState ? createImpl(createState) : createImpl) as Create

// vanilla.ts
export type StateCreator<
  T,
  Mis extends [StoreMutatorIdentifier, unknown][] = [],
  Mos extends [StoreMutatorIdentifier, unknown][] = [],
  U = T,
> = ((
  setState: Get<Mutate<StoreApi<T>, Mis>, 'setState', never>,
  getState: Get<Mutate<StoreApi<T>, Mis>, 'getState', never>,
  store: Mutate<StoreApi<T>, Mis>,
) => U) & { $$storeMutators?: Mos }
// 去掉部分 ts 定义
export type StateCreator = ((setState, getState, store) => xxx) & {
  $$storeMutators?
}
```

通过定义可以看到回调函数第一个参数是 setState， 第二个参数是 getState，第三个参数是 store。

然后 create 里面又调用了 createImpl 并把参数原封不动传了进去。

## createImpl

createImpl 里面主要调用了 两个函数 createStore 和 useStore

```ts
const createImpl = <T>(createState: StateCreator<T, [], []>) => {
  // ...省略部分无关代码
  const api =
    typeof createState === 'function' ? createStore(createState) : createState

  const useBoundStore: any = (selector?: any, equalityFn?: any) =>
    useStore(api, selector, equalityFn)

  Object.assign(useBoundStore, api)

  return useBoundStore
}
```

createStore 又获取了我们传递的回调函数，按样例就是

```ts
// 防止忘记
(set) => ({
  bears: 0,
  increasePopulation: () => set((state) => ({ bears: state.bears + 1 })),
  removeAllBears: () => set({ bears: 0 }),
})
```

### createStore

createStore 对应调用 createStoreImpl

```ts
// vanilla.ts
export const createStore = ((createState) =>
  createState ? createStoreImpl(createState) : createStoreImpl) as CreateStore
```

在 createStoreImpl 里面是核心实现，实现了一个发布订阅模式

```ts
// vanilla.ts
const createStoreImpl: CreateStoreImpl = (createState) => {
  type TState = ReturnType<typeof createState>
  type Listener = (state: TState, prevState: TState) => void
  let state: TState
  // 存储订阅者
  const listeners: Set<Listener> = new Set()

  const setState: StoreApi<TState>['setState'] = (partial, replace) => {
    // 传参处理，是函数就调用，不是就直接赋值
    const nextState =
      typeof partial === 'function'
        ? (partial as (state: TState) => TState)(state)
        : partial
    // 通过 Object.is 对新state和旧state 进行比较,如果不相等则更新
    if (!Object.is(nextState, state)) {
      const previousState = state
      // 优先赋值 replace, 为空时如果nextState不是引用类型和null就直接复制
      // 否则将对两个state进行浅合并 
      state =
        replace ?? (typeof nextState !== 'object' || nextState === null)
          ? (nextState as TState)
          : Object.assign({}, state, nextState)
      // 通知所有订阅者并调用对应事件
      listeners.forEach((listener) => listener(state, previousState))
    }
  }
  // 包装成函数返回 state
  const getState: StoreApi<TState>['getState'] = () => state
  // 包装成函数返回 initialState
  const getInitialState: StoreApi<TState>['getInitialState'] = () =>
    initialState
  // 添加订阅者到订阅者集合里面，同时返回对应销毁函数
  const subscribe: StoreApi<TState>['subscribe'] = (listener) => {
    listeners.add(listener)
    // Unsubscribe
    return () => listeners.delete(listener)
  }
  // 清除 set 销毁所有订阅者
  const destroy: StoreApi<TState>['destroy'] = () => {
    // ...省略部分代码
    listeners.clear()
  }
  // 所有处理函数挂载对象暴露出去
  const api = { setState, getState, getInitialState, subscribe, destroy }
  const initialState = (state = createState(setState, getState, api))
  return api as any
}
```

所以我们拿到的 api 就包括 setState, getState, getInitialState, subscribe, destroy

### useStore

useStore 接收 api 参数，还有 selector 和 equalityFn

```ts
const useBoundStore: any = (selector?: any, equalityFn?: any) =>
    useStore(api, selector, equalityFn)
```

selector, equalityFn 主要用在 useSyncExternalStoreWithSelector 上面

```ts
const slice = useSyncExternalStoreWithSelector(
    api.subscribe,
    api.getState,
    api.getServerState || api.getInitialState,
    selector,
    equalityFn,
  )
  return slice
```

react [有一个 hook](https://link.juejin.cn/?target=https%3A%2F%2Freact.dev%2Freference%2Freact%2FuseSyncExternalStore) useSyncExternalStore 就是用来定义外部 store 的，store 变化以后会触发 rerender，出于兼容性考虑并没有使用 react 中的这个 hook 而是使用[use-sync-external-store]()（react 团队发版的向后兼容的包）中的 useSyncExternalStoreWithSelector ，是自动支持记忆结果的 API 版本 。

```ts
import useSyncExternalStoreExports from 'use-sync-external-store/shim/with-selector'
const { useSyncExternalStoreWithSelector } = useSyncExternalStoreExports
```

借用这个完成外部存储的订阅，然后把订阅的数据返回

最后我们看下 createImpl 到底返回了什么

```ts
const api =
    typeof createState === 'function' ? createStore(createState) : createState

  const useBoundStore: any = (selector?: any, equalityFn?: any) =>
    useStore(api, selector, equalityFn)

  Object.assign(useBoundStore, api)

  return useBoundStore
```

通过上面的分析我们知道 api 是关于 state 的操作，useBoundStore 是订阅的数据回调函数，useBoundStore这个函数上面挂载了 api 的方法。

搭建一个项目看看分析的正不正确：

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/fdd8e2f6767c4509aa684c4728d5e6ef~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=531&h=357&s=22465&e=png&b=24282f)

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/85f87e183fe84713a2504fcd2ca505d1~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=630&h=115&s=6951&e=png&b=ffffff)

可以看到确实有 api 的方法，调用这个函数之后就是我们的状态了

## 中间件

zustand 中并没有中间件相关代码，而是采用函数组合的方式：

```ts
import { create } from 'zustand'
const middleware1 = (fun) => (set, get, store) => {
  // ......
  return fun(set, get, store)
}
const middleware2 = (fun) => (set, get, store) => {
  // ......
  return fun(set, get, store)
}

const useStore = create(middleware1(middleware2((set, get, store) => {
  // ......
})))
```
