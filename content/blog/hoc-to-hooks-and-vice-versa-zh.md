---
title: HOC 与 hooks 的互相转化
date: 2023-02-12
description: HOC 与 hooks 之间进行互相转化的一些方法
meta:
  keywords:
    - react
    - hoc
    - hooks
lang: zh-CN
---

HOC 与 hooks 是 React 中状态逻辑复用的两种机制，在 React 16.8 之前 HOC 被大量采用，而在之后的版本 hooks 则更为主流。本文提供一种如何在两者之间进行互相转化的一种思路。

## 问题定义

因为 HOC 本质与 hooks 并非完全等价的，所以需要把问题定义清楚

> 如果一个 HOC 或者 hooks 的功能是内部处理状态相关的逻辑，HOC 把变量注入到被包裹的组件，hooks 直接将变量返回给调用方，这种情况一种实践如何转化为另一种？

代码层面可能是这样的

```javascript
// HOC api
const Enhanced = Magic(options)(Original);
// hooks api
function Enhanced() {
  useMagic(options);
}
// 当实现了一种 api，如何快速得到另一种？
```

这个问题存在一些实际意义，主要是针对一些迭代时间较长的项目，如果整个 codebase 做了 React 版本的升级，一般这种情况下历史代码的 class 实现不会去重构，所以项目会存在历史代码是 class，新实现的代码是 hooks，这种情况下如果能将 HOC 与 hooks 快速互相转化的话，一定程度上能提高代码复用性。
