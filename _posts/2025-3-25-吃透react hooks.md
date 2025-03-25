---
layout:     post
title:      吃透react hooks
subtitle:   前端性能优化
date:       2025-3-25
author:     XIY
header-img: img/post-bg-cook.jpg
catalog: true
tags:
    - react
    - frontend
---

（更新中）
## 常见的自定义 hooks

### useLastest 永远返回最新的数据

更改 state 也可以获取到最新的数据

```ts
import { useRef } from "react";

const useLatest = <T>(value: T): { readonly current: T } => {
  const ref = useRef(value);
  ref.current = value;

  return ref;
};

export default useLatest;

```

### useMount 和 useUnmount

两者都是根据 useEffect 演化而来，而 useUnmount 需要注意一下，这里传入的函数需要保持最新值，直接使用 useLatest 即可：

```ts
// useMount
import { useEffect } from "react";

const useMount = (fn: () => void) => {
  useEffect(() => {
    fn?.();
  }, []);
};

export default useMount;

// useUnmount
import { useEffect } from "react";
import useLatest from "../useLatest";

const useUnmount = (fn: () => void) => {
  const fnRef = useLatest(fn);

  useEffect(
    () => () => {
      fnRef.current();
    },
    []
  );
};

export default useUnmount;

```

### useCreation 强化 useMemo 和 useRef，用法与 useMemo 一样，一般用于性能优化

useCreation 如何增强：

useMemo 的第一个参数 fn，会缓存对应的值，那么这个值就有可能拿不到最新的值，而 useCreation 拿到的值永远都是最新值；

useRef 在创建复杂常量的时候，会出现潜在的性能隐患（如：实例化 new Subject），但 useCreation 可以有效地避免。

来简单分析一下如何实现 useCreation:

明确出参入参：useCreation 主要强化的是 useMemo，所以出入参应该保持一致。出参返回对应的值，入参共有两个，第一个对应函数，第二个对应数组（此数组可变触发）；

最新值处理：针对 useMemo 可能拿不到最新值的情况，可直接依赖 useRef 的高级用法来保存值，这样就会永远保存最新值；

触发更新条件：比较每次传入的数组，与之前对比，若不同，则触发、更新对应的函数。
```ts
import { useRef } from "react";
import type { DependencyList } from "react";

const depsAreSame = (
  oldDeps: DependencyList,
  deps: DependencyList
): boolean => {
  if (oldDeps === deps) return true;

  for (let i = 0; i < oldDeps.length; i++) {
    if (!Object.is(oldDeps[i], deps[i])) return false;
  }

  return true;
};

const useCreation = <T,>(fn: () => T, deps: DependencyList) => {
  const { current } = useRef({
    deps,
    obj: undefined as undefined | T,
    initialized: false,
  });

  if (current.initialized === false || !depsAreSame(current.deps, deps)) {
    current.deps = deps;
    current.obj = fn();
    current.initialized = true;
  }

  return current.obj as T;
};

export default useCreation;

```

### useUpdate

useUpdate： 强制组件重新渲染，最终返回一个函数。

```ts
import { useReducer } from "react";

function useUpdate(): () => void {
  const [, update] = useReducer((num: number): number => num + 1, 0);

  return update;
}

export default useUpdate;
```

### useReactive 

当我们开发组件或做功能复杂的页面时，会有大量的变量，再来看看 useState 的结构`const [count, setCount] = useState<number>(0)`，假设要设置 10 个变量，那么我们是不是要设置 10 个这样的结构？

有的小伙伴会说，值设置成对象不就好了吗？但我们设置的时候必须 setCount(v => {...v, count: 7}) 这样去写，也是比较麻烦的。

其次，我们用的值和设置的值分成了两个，这样也带来了不便，因此：useReactive 可以帮我们解决这个问题。

useReactive：一种具备响应式的 useState，用法与 useState 类似，但可以动态地设置值。

useReactive 整体结构：`const state = useReactive({ count: 0 })` 。

使用：`state.count`；
设置：`state.count = 7`。

```ts
import { useUpdate, useCreation, useLatest } from "../index";

const observer = <T extends Record<string, any>>(
  initialVal: T,
  cb: () => void
): T => {
  const proxy = new Proxy<T>(initialVal, {
    get(target, key, receiver) {
      const res = Reflect.get(target, key, receiver);
      return typeof res === "object"
        ? observer(res, cb)
        : Reflect.get(target, key);
    },
    set(target, key, val) {
      const ret = Reflect.set(target, key, val);
      cb();
      return ret;
    },
  });

  return proxy;
};

const useReactive = <T extends Record<string, any>>(initialState: T): T => {
  const ref = useLatest<T>(initialState);
  const update = useUpdate();

  const state = useCreation(() => {
    return observer(ref.current, () => {
      update();
    });
  }, []);

  return state;
};

export default useReactive;
```