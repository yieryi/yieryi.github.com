---
title: Cesium 示例录屏索引
titleEn: "Cesium Demo Reel Index"
description: 2021–2023 年 Cesium 三维引擎示例录屏合集：地图绘制、几何编辑、建筑拉伸、管线流向、遮罩、相机可视化、全景融合与城市内涝模拟。
descriptionEn: "A curated reel of early Cesium demos: map drawing, geometry editing, building extrusion, pipeline flow, masking, camera visualization, panorama blending and urban waterlogging simulation."
date: 2025-05-18
updated: 2026-11-13
category: Cesium
categoryEn: "Cesium"
series: Cesium 实战
seriesEn: "Cesium in Practice"
tags: [Cesium, 示例, 三维引擎, 录屏]
draft: false
featured: false
legacy: /2025/05/18/WIP-cesiumjs-汇总-图文版
---

> 2021–2023 年做 Cesium 三维引擎示例时留下的录屏。原演示部署在内部环境 `zydlxx.cn:1234`，目前已经不可访问；这里按主题重新整理成可以在线查看的索引。
>
> 视频均为站内播放，不提供下载按钮和下载链接；默认只加载封面，点击播放后才请求视频。录屏中的地名、数据和界面均为早期测试内容，仅作技术展示。

## 地图交互与几何

### 地图面绘制

<figure class="demo-figure">
<video class="demo-video" controls preload="none" playsinline controlslist="nodownload" disablepictureinpicture poster="/assets/images/Cesium/draw-polygon-poster.webp">
<source src="/assets/videos/Cesium/draw-polygon.mp4" type="video/mp4" />
</video>
<figcaption><span class="demo-meta">54 秒 · 0.9 MB</span>在地图上拾取控制点、实时预览并生成多边形面，包含节点高亮和绘制状态切换。</figcaption>
</figure>

### Primitive 几何绘制

<figure class="demo-figure">
<video class="demo-video" controls preload="none" playsinline controlslist="nodownload" disablepictureinpicture poster="/assets/images/Cesium/primitive-draw-poster.webp">
<source src="/assets/videos/Cesium/primitive-draw.mp4" type="video/mp4" />
</video>
<figcaption><span class="demo-meta">1 分 14 秒 · 0.9 MB</span>使用 Cesium Primitive API 直接绘制三角面和多边形，演示颜色、透明度、轮廓以及显示参数调节。</figcaption>
</figure>

### 建筑拉伸

<figure class="demo-figure">
<video class="demo-video" controls preload="none" playsinline controlslist="nodownload" disablepictureinpicture poster="/assets/images/Cesium/extrude-buildings-poster.webp">
<source src="/assets/videos/Cesium/extrude-buildings.mp4" type="video/mp4" />
</video>
<figcaption><span class="demo-meta">57 秒 · 2.1 MB</span>矢量面按高度拉伸为建筑体块，演示高度控制、侧面材质和顶部纹理。</figcaption>
</figure>

### 几何编辑

<figure class="demo-figure">
<video class="demo-video" controls preload="none" playsinline controlslist="nodownload" disablepictureinpicture poster="/assets/images/Cesium/edit-geometry-poster.webp">
<source src="/assets/videos/Cesium/edit-geometry.mp4" type="video/mp4" />
</video>
<figcaption><span class="demo-meta">2 分 16 秒 · 2.9 MB</span>点、线、面的编辑流程：拖拽控制点，几何和材质实时更新，并同步显示编辑状态。</figcaption>
</figure>

### 中心线拉伸

<figure class="demo-figure">
<video class="demo-video" controls preload="none" playsinline controlslist="nodownload" disablepictureinpicture poster="/assets/images/Cesium/centerline-extrude-poster.webp">
<source src="/assets/videos/Cesium/centerline-extrude.mp4" type="video/mp4" />
</video>
<figcaption><span class="demo-meta">4 秒 · 0.2 MB</span>由中心线计算并拉伸成带状体，适合道路、河道和管线的快速建模，配合渐变材质表达方向。</figcaption>
</figure>

## 场景与渲染

### 遮罩与反遮罩

<figure class="demo-figure">
<video class="demo-video" controls preload="none" playsinline controlslist="nodownload" disablepictureinpicture poster="/assets/images/Cesium/mask-inverse-poster.webp">
<source src="/assets/videos/Cesium/mask-inverse.mp4" type="video/mp4" />
</video>
<figcaption><span class="demo-meta">31 秒 · 1.1 MB</span>基于深度或模板缓冲的区域遮罩与反遮罩，只保留指定范围内的地形和建筑，用于局部场景分析。</figcaption>
</figure>

### 相机可视化

<figure class="demo-figure">
<video class="demo-video" controls preload="none" playsinline controlslist="nodownload" disablepictureinpicture poster="/assets/images/Cesium/camera-visualization-poster.webp">
<source src="/assets/videos/Cesium/camera-visualization.mp4" type="video/mp4" />
</video>
<figcaption><span class="demo-meta">9 秒 · 0.5 MB</span>相机位置、朝向和视锥体的调试可视化，用于检查视角、投影矩阵和视域范围。</figcaption>
</figure>

### 中心线渐变

<figure class="demo-figure">
<video class="demo-video" controls preload="none" playsinline controlslist="nodownload" disablepictureinpicture poster="/assets/images/Cesium/gradient-flow-poster.webp">
<source src="/assets/videos/Cesium/gradient-flow.mp4" type="video/mp4" />
</video>
<figcaption><span class="demo-meta">6 秒 · 0.1 MB</span>沿中心线或管线的渐变流动材质，用颜色和位移表达流向、流量或高度变化。</figcaption>
</figure>

### 夜光呼吸效果

<figure class="demo-figure">
<video class="demo-video" controls preload="none" playsinline controlslist="nodownload" disablepictureinpicture poster="/assets/images/Cesium/glow-breathing-poster.webp">
<source src="/assets/videos/Cesium/glow-breathing.mp4" type="video/mp4" />
</video>
<figcaption><span class="demo-meta">20 秒 · 0.5 MB</span>点要素沿线分布，使用 EDGE 渲染和自定义材质做呼吸式高亮与动态辉光，适合管网、轨迹类数据。</figcaption>
</figure>

### 全景融合

<figure class="demo-figure">
<video class="demo-video" controls preload="none" playsinline controlslist="nodownload" disablepictureinpicture poster="/assets/images/Cesium/panorama-fusion-poster.webp">
<source src="/assets/videos/Cesium/panorama-fusion.mp4" type="video/mp4" />
</video>
<figcaption><span class="demo-meta">16 秒 · 4.7 MB</span>三维地球与全景视图的融合与转场，复用地缘渲染的颜色缓冲区，避免切换时黑屏。实现细节见下方相关文章。</figcaption>
</figure>

## 管线与城市

### 管线流向

<figure class="demo-figure">
<video class="demo-video" controls preload="none" playsinline controlslist="nodownload" disablepictureinpicture poster="/assets/images/Cesium/pipeline-flow-poster.webp">
<source src="/assets/videos/Cesium/pipeline-flow.mp4" type="video/mp4" />
</video>
<figcaption><span class="demo-meta">44 秒 · 3.4 MB</span>地下管线网络的分类高亮、流向箭头和动态流动效果，演示按管线类型切换样式。</figcaption>
</figure>

### 城市内涝模拟

<figure class="demo-figure">
<video class="demo-video" controls preload="none" playsinline controlslist="nodownload" disablepictureinpicture poster="/assets/images/Cesium/jinan-waterlogging-poster.webp">
<source src="/assets/videos/Cesium/jinan-waterlogging.mp4" type="video/mp4" />
</video>
<figcaption><span class="demo-meta">1 分 32 秒 · 4.0 MB</span>城市内涝和水系模拟：降雨、河流与积水分布联动，附带时间轴、统计面板和热力展示。</figcaption>
</figure>

## 相关文章

- [Cesium 文字标注重叠避让](/writing/cesium-labels-avoid-overlap/)：包含 Label 遮挡检测前后的对比录屏。
- [Cesium 三维地球融合全景效果](/writing/cesium-panorama/)：全景融合的实现过程和完整录屏。
- [批量迁移 Cesium Sandcastle 示例](/writing/cesium-sandcastle-migration/)：用 Node.js、Selenium 和正则批量迁移示例。

## 未录制示例

下面这些示例也在早期环境中出现过，但暂时没有合适的公开录屏，保留标题和方向，后续重做在线 Demo 时再补：

| 示例 | 说明 |
|---|---|
| 第一人称视角交互漫游 | 相机碰撞、贴地行走、视角控制 |
| 大规模布告板 | Billboard 渲染与合批 |
| 城市天际线分析 | 基于深度采样的天际线计算 |
| 火焰与喷泉 | 粒子系统与生命周期控制 |
| 抛物线动效 | 轨迹线分段流动与抛物线插值 |
| 行政区划体块 | 径向渐变材质与条纹面 Primitive |
| 建筑局部积雪 | 后处理与法线/高度混合 |
| 地下管线开挖 | 管线剖切、透明与遮挡处理 |
| 北斗卫星运行轨迹 | 卫星轨道、时间轴与位置推演 |

## 技术备注

- 大部分示例基于 Cesium 的 `Primitive`、`Geometry & Appearance` 和自定义 shader，而不是简单的 `Entity`  API。
- 遮罩类效果依赖深度或模板缓冲；流动、呼吸和渐变效果主要靠 `vUv`、时间和自定义材质。
- 全景融合复用 Cesium 的渲染流程和颜色缓冲区，转场在同一个 canvas 内完成。
- 录屏没有音轨，统一转为 H.264 MP4，宽度不超过 1280，开启 `faststart` 以便边下边播；封面使用 WebP。
- 文章中的视频使用 `preload="none"` 和 `controlslist="nodownload"`，不在页面上提供下载入口。