---
layout: post
title:  "在WebGL中如调试指定像素在Shader的计算过程"
date:  2025-06-16
last_modified_at: 2025-06-16
categories: [Graphics]
tags: [WebGL, shader,debug,graphic,rendering]
excerpt: 
typora-root-url: ./
---

## 背景
本文提到的`WebGL`,特指就是PC的浏览器环境。不包括`Windows`环境下DX、`OpenGL`、 `Vulkan`或`MAC`下的图形接口的。

`WebGL`中调试`Shader`常见的思路有几种（快速简单）：

- 代码注释（删除部分代码）
- 将过程的结果以特定颜色进行输出（使用颜色标记检验)
- 使用`Spector.js`等浏览器插件抓帧，人工读取draw call的shader自行脑部GPU计算过程

其中前两种方法较为常见，第三种方法一般用于逆向或者检验。大部分需求或者诉求是能满足的。但是还有一些设计在`Shader`中进行了复杂计算的，`Shader`代码量较大，或者最终渲染结果出现部分像素着色结果不符合预期，如果想用常见代码调试步进的方式来检查指定像素在`Shader`中的计算过程和结果的。那么本文就提供一种可以参考的工程实践方法。我愿称之复杂度满星，涉及操作系统上`Chrome进程hook`，熟悉渲染管线，`DXBC`字节码的阅读能力（现在好像可以转成`Shader`方便阅读一些。当然这套思路确实也很强，之前用来解过自研渲染引擎的问题，最近也在用这套思路研究、学习苹果地图网页端的一些实现，这些以后可以再写一篇文章。



## 具体步骤

TODO

