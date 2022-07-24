---
layout: post
title:  "批量迁移Cesium Sandcastle示例到其他示例框架的实践总结"
date:   2022-07-24
last_modified_at: 2022-07-24
categories: [javascript,Cesium]
tags: [javascript, node.js, cesium.js, node-fetch, selenium, '正则表达式', jsdom, '自动化测试', '爬虫']
excerpt: 
typora-root-url: ./
---



### 背景:

Cesium官方示例丰富，代码质量较高，示例代码纯粹和丰富。不少公司都有自己的示例框架，或者叫做`playground`。将这些示例重写一遍必要性不是很大。但是直接拷贝的话示例中使用到的`Cesium.js`等引用路径或许存在问题，页面样式不统一、数据源地址变更，启动入口不一致，数据无法访问、本地化的数据源替换等。本文总结此次批量迁移过程中使用到的技术点，由于技术点多且实践较为完整，此为总结记录。

#### 使用到的技术点：

> 编程语言仅使用`javascript`

`javascript`、正则表达式、`nodejs`、`selenium`、数据爬取、网络服务代理、`express`,`jsdom`

#### 1、`html`内容替换

关于示例的html文件，首先要解决的就是html内容的改造。这一部分主要使用到`jsdom`库。

1. 建立自己示例框架的空模板，尽可能的只保留必要的html节点。
2. 页面分析，提取html的元信息，包括`title`， `descrption`等，便于后期重新调整示例组织布局
3. html和style节点的拷贝和替换。这是因为cesium示例的html节点存在构造的地方，应当在自己的模板html上进行增删
4. 代码脚本的替换。这一部分主要使用正则表达式。正则表达式匹配替换到`SampleData`等相对路径信息，这部分看情况。另外关于影像、地形和`Cesium Ion` 服务的`Asset Id`也应当有所记录或者替换。这部分对正则表达式的要求较高。多行代码的匹配和前向捕捉等正则表达式都很有用。

### 2、代码格式化

使用到了`prettier`库，使用`child_process`模块执行`prettier`格式化命令

#### 3、拷贝改造后的`html`文件到示例框架中。

#### 4、自动化测试，浏览器逐个访问html，存储截图文件

既然批量迁移，示例的截图如果逐个去截图效率必然不高，因为需要手动逐个网页的打开，逐个网页的手动截图，耗时又麻烦。另外为什么需要逐个访问，还是因为批量迁移，逐个示例访问打开可以避免GPU显存崩溃。这部分主要使用了`selenium-webdriver`库实现。

这部分实现细节较多，讲究起来需要做很多东西，在此不为详述。说一个我踩得坑：

selenium自动化打开浏览器以后，使用的时一个`tab`,我在这个`tab`上切换`html`网址，发现后期显存总是崩掉。

表现为：该`tab`虽然切换了另一个网址，但是在切换网址以后，显存并没有立即释放出来。导致后期崩溃。

定位问题以后，解决方式为：截图完当前示例，创建新的`tab`页，切换到当前示例，关闭掉当前示例`tab`页。再次切换到新建的`tab`页，在该新`tab`页上访问下一个示例。有关代码如下：

```javascript
//Store the ID of the original window
const originalWindow = await driver.getWindowHandle();
// Opens a new tab and switches to new tab
await driver.switchTo().newWindow("tab");
const newWindow = await driver.getWindowHandle();
//Switch back to the old tab or window
await driver.switchTo().window(originalWindow);
//Close the tab or window
await driver.close();
await driver.switchTo().window(newWindow);
```

#### 5、截图拷贝，相关处理流程的日志记录

#### 6、数据

数据部分是个大问题。我单独写了一个脚本。因为发现Cesium官网示例使用到的部分数据集，该数据集对于我们开发者无法访问，在`CesiumIon`服务中，申请到的`accesstoken`并没有该数据的权限，另外使用`Cesium`示例官网的`accesstoken`在`Cesium`的服务端又有域名同源限制。同时该部分`https`请求的header信息存在特定字段，会导致浏览器访问时触发`option`跨域请求。针对这些表现。希望能够在本地访问这些数据。我目前试验方式有以下两种,两种方式都不是很理想,有所缺陷。

Cesium的数据访问机制是这样:

- 使用开发者`accesstoken`访问数据的`endpoint`接口，获取该数据的元数据描述，该元数据描述包含了数据的地址和授予的动态`token`，该`token`与前一步的`accesstoken`不一样，是动态生成分发的。
- 使用上一步获得的`token`，在请求头信息上指定`authorization`。`headers.authorization =  "Bearer " + endPointToken`

##### 1、爬虫

总觉得爬虫这个东西有点故作高深。不过大家知道是什么东西就行。网络请求在nodejs中我是使用了`node-fetch`库，纯粹用`fetch`的api用习惯了。

数据爬取过程中存在的一个问题是tileset.jsond的子节点是可以递归存储tileset.json节点的。所以需要递归的去确定该数据的边界，即到底包含了多少、哪些节点、数据地址。该部分难度不大。另一个问题是`3DTiles Next`数据规范支持隐式切分，隐式切分的数据地址是一个模板`url`,无法直接请求，需要配合相关的`.subtree`等编码数据配合去请求。我没有花时间去实现。

关于数据节点树的遍历，因为层级多，节点树较大，建议使用循环而不是递归方式，调试起来更方便。

关于数据访问，最好不好一直爬取，可能回对Cesium服务器造成较大压力，另一方面自身的网络条件也有可能不够稳健，建议做好数据请求调度。比如异步多线程请求，比如随机等待避免频繁访问获取不到数据，比如数据重传和中断位置启动等等。目前爬取到蒙哥马利城市三维点云数据较大，约9G大小。

##### 2、网络代理

设想的方案其实是本地搭建一个http服务，提供对Cesium数据发访问代理，同时动态缓存相关切片数据，实现效率最大花。该技术方案示例后来不理想。主要是Cesium的数据访问机制，在第二步使用的是Cesium网址，除非代理`cesium.com`但是生产环境不现实。开发环境可以考虑。本人使用`express`快速搭建一个服务，本来想查找`node`下的代理服务快速构建方案，可能用法不对，试了两个总感觉不对，所以采用了自己直接搭建接口以后去读取缓存，缓存不存在服务端去访问cesium.com的方式去提供。该方法原理很简单。但是正如上面所说，开发环境还好，生产环境的话，应该去改一下Cesium.js的IONResource相关类的实现，才可以适用