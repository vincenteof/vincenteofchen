---
title: HOC 与 Hooks 的互相转化
date: 2023-02-12
description: HOC 与 Hooks 之间进行互相转化的一些方法
meta:
  keywords:
    - react
    - hoc
    - hooks
lang: zh-CN
---

HOC 与 Hooks 是 React 中复用状态逻辑的两种机制，在 React 16.8 之前 HOC 被大量采用，而在之后的版本 Hooks 则更为主流。这篇文章提供一种在两者之间进行互相转化的一种思路。

## 问题定义

因为 HOC 本质与 Hooks 并非完全的等价物，所以需要先定义问题

> 如果一个 HOC 或者 Hooks 的功能是内部处理状态相关的逻辑，HOC 把变量注入到被包裹的组件，Hooks 直接将变量返回给调用方，这种情况如何实现两者的转化？

代码层面可能是这样的

```javascript
// HOC
const Enhanced = Magic(options)(Original);
// Hooks
function Enhanced() {
  useMagic(options);
}
// 如何基于 `Magic` 实现 `useMagic` ?
// 如何基于 `useMagic` 实现 `Magic` ?
```

这个问题存在一些实际意义，针对一些迭代时间较长的老项目，如果整个 codebase 做了 React 版本的升级，一般这种情况下历史代码的 class 实现不会去重构，所以项目会存在历史代码基于 HOC，而新实现的代码则基于 Hooks，有了这种方案可以节省多余的开发成本。

## Hooks to HOC

基于 Hooks 去实现 HOC 是比较容易想到的，我们只需要在实现的 HOC 内部去调用对应的 Hooks 即可，然后将 Hooks 的返回值注入的 HOC 包裹的组件上。

```javascript
function Magic(options) {
  return function (Component) {
    return function (props) {
      const injected = useMagic(options);
      return <Component {...props} {...injected} />;
    };
  };
}
```

## HOC to Hooks

对比之下，基于 HOC 实现 Hooks 则没有那么直观。因为 HOC 返回的是组件，而 Hooks 想要获取的是被注入的变量，然而没有一个方法可以针对任意组件直接获得其内部的变量。
为了解决这个问题，我们需要调整一下期望，只要能通过 Hooks 去调用 HOC 的逻辑即可。我们可以自定义一个组件，在这个组件上包裹 HOC，在它的内部把注入的变量保存起来，只要让某个 Hooks 调用可以拿到这些保存的变量我们就达到了目的。
这很容易让人联想到 `context` 提供的功能，我们先把它定义出来

```javascript
const MagicContext = createContext({});

function MagicProviderInner(props) {
  const { children, ...magicInjected } = props;
  return (
    <MagicContext.Provider value={magicInjected}>
      {children}
    </MagicContext.Provider>
  );
}

function useMagic() {
  return useContext(MagicContext);
}
```

接下来需要思考下如何使用原本的 HOC，因为 HOC 的配置参数几乎都是静态的，所以我们只需要基于配置参数创建出一个 `Provider` 就行了。

```javascript
function createMagicProvider(option) {
  return Magic(option)(MagicProviderInner);
}
```

我们只需要把创建出来的 `Provider` 包裹在业务组件的上层就可以使用对应的钩子调用 HOC 逻辑了

```javascript
const MagicProvider = createMagicProvider(options);
function Demo() {
  return (
    <MagicProvider>
      <Logic />
    </MagicProvider>
  );
}
function Logic() {
  const injected = useMagic();
  console.log(injected);
  return <div></div>;
}
```
