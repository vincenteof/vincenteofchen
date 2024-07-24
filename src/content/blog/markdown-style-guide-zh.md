---
title: 'Markdown 风格指南'
description: '这里是一些基本的 Markdown 语法示例，可以在使用 Astro 编写 Markdown 内容时使用。'
pubDate: 'Jul 01 2022'
---

> [English Version](/posts/markdown-style-guide)

这里是一些基本的 Markdown 语法示例，可以在使用 Astro 编写 Markdown 内容时使用。

## 标题

以下 HTML `<h1>`—`<h6>` 元素代表了六个层级的章节标题。`<h1>` 是最高层级的标题，而 `<h6>` 是最低层级的标题。

# H1

## H2

### H3

#### H4

##### H5

###### H6

## 段落

位理，然关经国正论，问出在水次有往，至极他步世们这处起进。系千新时机此却支个如世，山大式局处有花指持级。济九气次即作从你市正市。东面林就和商产到它光律务立观果他上转关。只还就新路管见了性时数步进白家史会，张去江革事连取果山着理同。会管物子光叫展当已，花达到原美比准不。史之大务不面品力百其管期新，器及及生体节了不管两结的。多存性电何观广光了电问联性，生山这作光较议经常结着安不它议治流。

九易将体由如已根西话何，九电系意山目和统直设果多阶先意但。广道为或作该本联许之品，候何而林政天利个民许器利也外界，和影列在及月事际地多白。可及观连系心此求总阶五至个，感进约不人者争将生政每无，及通论指代干处政日水空观为者取。起结信关大将斯我个工资省我，许也心三文对技没作性观但及感事此。

## 图片

#### 示例

```markdown
![Alt text](./full/or/relative/path/of/image)
```

#### 输出

![blog placeholder](/blog-placeholder-about.jpg)

## 引用

blockquote 元素表示从其他来源引用的内容，可以选择包含引用信息，引用信息必须放在 `footer` 或 `cite` 元素中，同时可以包含内联更改，如注释和缩写。

### 无引用出处的 Blockquote

#### 示例

```markdown
> Tiam，为了满足对这种产品的需求，实施了哪种策略?
> **注意** 你可以在 blockquote 里使用 _Markdown 语法_
```

#### 输出

> Tiam, 为了满足对这种产品的需求，实施了哪种策略?  
> **注意** 你可以在 blockquote 里使用 _Markdown 语法_

### 有引用出处的 Blockquote

#### 示例

```markdown
> 不要通过共享内存来通信，而要通过通信来共享内存。<br>
> — <cite>Rob Pike[^1]</cite>
```

#### 输出

> 不要通过共享内存来通信，而要通过通信来共享内存。<br>
> — <cite>Rob Pike[^1]</cite>

[^1]: 以上引用摘自 Rob Pike 于 2015 年 11 月 18 日在 Gopherfest 上的[演讲](https://www.youtube.com/watch?v=PAAkCSZUG1c)。

## 表格

#### 示例

```markdown
| 斜体      | 粗体     | 代码   |
| --------- | -------- | ------ |
| _italics_ | **bold** | `code` |
```

#### 输出

| 斜体      | 粗体     | 代码   |
| --------- | -------- | ------ |
| _italics_ | **bold** | `code` |

## 代码片段

#### 示例

我们可以在新行中使用3个反引号 ``` 来编写代码片段，并在新行中使用3个反引号结束。为了突出特定语言的语法，在第一个3个反引号之后写上语言名称的一个单词，例如：html、javascript、css、markdown、typescript、txt、bash。

````markdown
```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>样例 HTML5 文档</title>
  </head>
  <body>
    <p>测试</p>
  </body>
</html>
```
````

输出

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>样例 HTML5 文档</title>
  </head>
  <body>
    <p>测试</p>
  </body>
</html>
```

## 列表

### 有序列表

#### 样例

```markdown
1. 第一项
2. 第二项
3. 第三项
```

#### 输出

1. 第一项
2. 第二项
3. 第三项

### 无序列表

#### 样例

```markdown
- 列表项
- 另一个列表项
- 最后一个列表项
```

#### 输出

- 列表项
- 另一个列表项
- 最后一个列表项

### 嵌套列表

#### 样例

```markdown
- 水果
  - 苹果
  - 橙子
  - 香蕉
- 乳制品
  - 牛奶
  - 奶酪
```

#### 输出

- 水果
  - 苹果
  - 橙子
  - 香蕉
- 乳制品
  - 牛奶
  - 奶酪

## 其他元素 — abbr, sub, sup, kbd, mark

#### 样例

```markdown
<abbr title="图形交换格式">GIF</abbr> 是一种位图图像格式。

H<sub>2</sub>O

X<sup>n</sup> + Y<sup>n</sup> = Z<sup>n</sup>

按 <kbd><kbd>CTRL</kbd>+<kbd>ALT</kbd>+<kbd>Delete</kbd></kbd> 结束会话。

大多数 <mark>蝾螈</mark> 是夜行性的，捕食昆虫、蠕虫和其他小生物。
```

#### 输出

<abbr title="图形交换格式">GIF</abbr> 是一种位图图像格式。

H<sub>2</sub>O

X<sup>n</sup> + Y<sup>n</sup> = Z<sup>n</sup>

按 <kbd><kbd>CTRL</kbd>+<kbd>ALT</kbd>+<kbd>Delete</kbd></kbd> 结束会话。

大多数 <mark>蝾螈</mark> 是夜行性的，捕食昆虫、蠕虫和其他小生物。
