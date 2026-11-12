---
title: Cesium 示例索引（存档）
titleEn: "Cesium Demo Index (Archive)"
description: 早期三维引擎示例索引，涵盖第一人称漫游、几何编辑、管线、内涝模拟、卫星轨迹等方向。原演示地址已下线，保留作为技术索引。
descriptionEn: "An index of early 3D engine demos covering first-person navigation, geometry editing, pipelines, flood simulation and satellite trajectories. The original demos are offline; this remains a technical index."
date: 2025-05-18
updated: 2026-11-11
category: Cesium
categoryEn: "Cesium"
series: Cesium 实战
seriesEn: "Cesium in Practice"
tags: [Cesium, 示例, 三维引擎]
draft: false
featured: false
legacy: /2025/05/18/WIP-cesiumjs-汇总-图文版
---

> 这是一份早期示例索引，原演示部署在内部环境 `zydlxx.cn:1234`，目前已不可访问。保留标题和方向，方便后续补充文章、视频或重做在线 Demo。标注“个人实现”的条目为本人负责或重点参与的部分。

## 交互与场景

| 示例 | 说明 | 备注 |
|---|---|---|
| 第一人称视角交互漫游 | 相机碰撞、贴地行走、视角控制 |  |
| 地形、模型的遮罩和反遮罩着色 | 基于深度/模板的场景遮罩 |  |
| 模型要素的交并差框选 | 屏幕矩形拾取与空间查询 |  |
| 立体建筑的绘制 | 矢量面拉伸、侧面材质与顶部纹理 |  |
| 几何编辑 | 点/线/面编辑、拖拽与实时更新 |  |
| 模型编辑 | glTF 模型加载、变换与材质调整 |  |

## 渲染与特效

| 示例 | 说明 | 备注 |
|---|---|---|
| 布告板 | 大规模 Billboard 渲染与合批 | 向 Cesium 提交过 PR |
| 天际线 | 基于深度采样的城市天际线分析 | 个人实现 |
| 火焰与喷泉 | 粒子系统与生命周期控制 | 参考超图实现 |
| 夜光灯呼吸效果 | 点要素 EDGE 渲染与动态高亮 |  |
| 抛物线动效 | 轨迹线分段流动与抛物线插值 |  |
| 3D 过渡动画到全景 | 地球视图与全景视图的无缝切换 |  |
| 行政区划体块 | 径向渐变材质与条纹面 Primitive |  |
| 建筑物局部积雪 | 后处理与法线/高度混合 |  |
| 地下管线开挖 | 管线剖切、透明与遮挡处理 |  |
| 管线流向可视化 | 箭头样式、流向动画与过渡 |  |
| 城市内涝模拟 | 水文模拟热力图、降雨与河流联动 |  |
| 北斗卫星运行轨迹 | 卫星轨道、时间轴与位置推演 |  |

## 后续计划

- 把其中可公开的示例重做成独立 Demo 页，放到 `/lab/`。
- 每个示例配一段 10–20 秒的录屏，避免依赖旧环境。
- 涉及公司业务的部分只保留技术方法，不展示真实数据。
