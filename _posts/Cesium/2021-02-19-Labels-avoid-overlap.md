---
layout: post
title:  "Cesium中Label的遮挡检测"
date:   2020-02-20
last_modified_at: 2020-02-20
categories: [Cesium]
tags: [Cesium, Label, Billboard, overlap, '遮盖']
excerpt: 
---



### 问题

在Cesium中，大场景小比例尺情况下POI进行标注会有前后重叠遮盖的问题。如下所示：

<img src="D:\Github\yieryi.github.com\assets\images\Cesium\LabelsOverlap.png" style="zoom:50%;" />

这样密密麻麻的文字标注又重叠，显示效果很不好，如果我们给这些数据进行一个遮挡检测计算，达到更靠近相机的Label优先显示，优先显示的Label遮挡住的文字标注不显示，应当是一个较为合适的效果。此处提出一种cpu通过R树实现遮挡检测的算法。得到效果如下所示：

<img src="D:\Github\yieryi.github.com\assets\images\Cesium\LabelsAvoidOverlap.png" style="zoom:50%;" />