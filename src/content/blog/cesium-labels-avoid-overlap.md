---
title: Cesium 中 Label 的遮挡检测
description: 在大场景小比例尺下解决 Cesium Label 重叠遮挡问题，按相机距离与屏幕空间做优先级筛选。
date: 2021-02-20
updated: 2025-05-18
category: Cesium
series: Cesium 实战
tags: [Cesium, Label, Billboard, 遮挡]
draft: false
featured: false
legacy: /2021/02/20/Cesium中Label的遮挡检测
---




### 问题

在Cesium中，大场景小比例尺情况下POI进行文字标注时，会发生前后(上下)重叠遮盖的问题。如下所示：

<img src="/assets/images/Cesium/LabelsOverlap.webp" alt="Label 重叠遮挡效果" width="1172" height="863" loading="lazy" />

文字标注过于密集，显示上重叠，难以清晰显示内容。如果我们给这些数据进行一个重叠遮挡检测计算，使得靠近相机的Label优先显示，被遮挡住的文字标注不显示，可以得到如下的清晰显示效果：

<img src="/assets/images/Cesium/LabelsAvoidOverlap.webp" alt="Label 遮挡检测后的清晰效果" width="1172" height="863" loading="lazy" />

### 结果演示录屏

<video id="video" controls preload="metadata" poster="/assets/images/Cesium/avoidLabelOverlap-poster.webp" style="width: 100%;">
<source id="mp4" src="/assets/videos/Cesium/avoidLabelOverlap.mp4" type="video/mp4">
</video>
