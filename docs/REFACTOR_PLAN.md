# WANGKANG 个人站重构方案

> 状态：MVP + 中英双语 + 日夜主题已完成，等待切换上线
> 开始日期：2026-11-11
> 当前分支：`astro`
> 线上旧站：`main` 分支（Jekyll Paper 模板，保持不动，直到新站验收）
>
> 本文档是重构的主计划，后续每完成一个阶段都在这里更新状态。
> 使用、写作、发布相关操作见 [`USAGE.md`](./USAGE.md)。

---

## 1. 目标

把原来的模板博客，升级为能长期承载个人品牌的技术主页：

1. **个人 IP**：以 `WANGKANG` 为主标识，建立“三维地理空间工程师”的清晰定位。
2. **突出 3D**：首屏用轻量 3D 视觉建立记忆点，同时不牺牲打开速度。
3. **作品导向**：用项目案例讲清楚“做过什么、怎么做的、结果如何”，而不只是罗列技术栈。
4. **长期维护**：内容与代码分离，新增/删除文章、项目、下载资源都有固定流程。
5. **可扩展**：后续可以加小工具、Demo、简历、RSS、搜索等，不需要推翻重来。
6. **不折腾**：纯静态、无数据库、无服务端，继续用 GitHub Pages 免费托管。

## 2. 已确认的决策

| 项目 | 决策 |
|---|---|
| 主标识 | `WANGKANG`，中文名“王康”作为辅助信息 |
| 视觉方向 | 混合式：深色首屏/项目页 + 浅色长文阅读 |
| 自定义域名 | 暂不使用，继续 `https://yieryi.github.io` |
| 首屏 3D | 直接上，但保持简单：低面数线框/点云地球 + 缓慢旋转，懒加载 + 静态兜底 |
| 技术栈 | Astro 7 + MDX + 原生 CSS + Three.js（仅首屏按需加载） |
| 部署 | GitHub Actions 构建，GitHub Pages 托管 |
| 内容语言 | 中文为主（默认 `/`），英文为辅（`/en/`），支持切换 |
| 旧站 | 保留在 `main` 分支，`astro` 分支完成后切换 |
| 主题 | 日夜切换，首次跟随系统，手动选择写入 localStorage |

## 2.1 当前进度

- 已完成：工程骨架、设计系统、首页 3D 与全部内容页、6 篇文章迁移、3 个项目案例、标签/系列、搜索、下载中心、Lab 小工具、简历页、RSS/Sitemap/OG、GitHub Actions 配置、内部链接检查。
- 质量：Lighthouse 桌面/移动端首页与主要内页均为 Performance 100 / Accessibility 100 / Best Practices 100 / SEO 100；axe WCAG A/AA 扫描通过。
- 待完成：合并到 `main`、在 GitHub 仓库设置里把 Pages Source 切到 GitHub Actions、接 Lighthouse CI 实测、提交搜索引擎。
- 旧站：`main` 分支仍保留 Jekyll 版本，可随时回滚。

## 3. 信息架构

```
/                    中文首页（默认）
/work/               中文项目案例列表
/work/<slug>/        中文项目案例详情
/writing/            中文文章列表（搜索、标签、系列）
/writing/<slug>/     中文文章详情
/writing/tag/<tag>/  中文标签聚合
/writing/series/<s>/ 中文系列聚合
/lab/                中文实验与小工具
/downloads/          中文资源下载
/about/              中文关于 / 履历 / 联系方式
/resume/             中文打印友好简历
/en/...              英文对应页面
/404                 自定义 404
/rss.xml             中文 RSS
/en/rss.xml          英文 RSS
/sitemap-index.xml   Sitemap
/search.json         中英双语搜索数据
```

### 导航

`Work / Writing / Lab / Downloads / About`，右侧固定 `⌘K 搜索` 和 GitHub 图标。

### 首页结构

1. **Hero（深色）**：姓名、定位、两个 CTA、轻量 3D 地球、能力标签（3D / GIS / HD）。
2. **能力矩阵（浅色）**：3D 渲染引擎 / GIS 几何 / 高精地图与三维重建 / 全栈交付。
3. **精选项目（浅色）**：3 个旗舰案例，带角色、周期、技术关键词。
4. **最新文章（浅色）**：3 篇 + 系列入口。
5. **Lab（深色）**：坐标转换、瓦片计算等小工具入口。
6. **About 预告（浅色）**：一段自我介绍 + 履历时间轴入口。
7. **Footer（深色）**：邮箱、GitHub、微信、RSS、版权。

## 4. 设计系统

### 4.1 色彩

日间 / 夜间通过 `html[data-theme]` 切换。日间使用浅色纸面 + 深色文字，夜间使用深空墨蓝 + 浅色文字；首屏和页面 Hero 使用独立的 `--hero-*` 令牌，日间为浅色技术图，夜间为深色数字地球。

| Token | 值 | 用途 |
|---|---|---|
| `--bg-deep` | `#070b12` | 深色首屏、页脚 |
| `--bg-deep-2` | `#0b1220` | 深色卡片 |
| `--paper` | `#f7f8fa` | 浅色正文背景 |
| `--paper-2` | `#eef1f5` | 浅色分区背景 |
| `--ink` | `#111827` | 浅色正文 |
| `--ink-soft` | `#4b5563` | 次级正文 |
| `--line-dark` | `rgba(148,163,184,.14)` | 深色边框 |
| `--line-light` | `rgba(17,24,39,.10)` | 浅色边框 |
| `--accent` | `#38e8c6` | 主强调（地表青） |
| `--accent-2` | `#4c8dff` | 次强调（Cesium 蓝） |
| `--warm` | `#ffb86b` | 少量暖色提示 |

### 4.2 主题

- 首次访问：跟随 `prefers-color-scheme`。
- 手动切换：写入 `localStorage`，刷新后保持。
- 切换按钮在 Header：日间显示月亮，夜间显示太阳。
- 3D 场景通过 `MutationObserver` 监听 `data-theme`，同步点云、网格、曲线与 Fresnel 边缘光的颜色和混合模式。
- 文章/项目正文背景、卡片、表格、代码、标签、按钮都使用主题令牌，不写死颜色。

### 4.3 字体

- 展示字体：`"Avenir Next", "Helvetica Neue", "PingFang SC", "Microsoft YaHei", sans-serif`
- 正文字体：`-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif`
- 等宽字体：`"JetBrains Mono", "SFMono-Regular", Consolas, monospace`
- 不加载完整中文字体包，避免首屏被字体拖慢。

### 4.4 版式

- 内容最大宽度：`1200px`
- 长文正文宽度：`720px`
- 大区块间距：`96–160px`
- 标题字重：`600–700`，避免过粗
- 圆角：`12px`（卡片）/ `999px`（标签）
- 边框：`1px` 细线为主，少用阴影

### 4.5 视觉母题

- 等高线、三角网、坐标刻度、图幅编号
- 深色区域使用细网格 + 微弱噪点
- 浅色区域使用大留白 + 细边框
- 动效克制：200–400ms，尊重 `prefers-reduced-motion`

### 4.6 首屏 3D

- 内容：稀疏点云 + 经纬网曲面 + 三条曲线/彗尾 + 轨道节点 + Fresnel 边缘光
- 动效：缓慢自转、曲线彗尾流动、轨道节点移动、镜头推拉（约 2.4s 入场）与呼吸缩放
- 色彩：夜间以地表青 + 浅青白为主，少量暖橙做点缀；日间转为深青/深蓝/琥珀的技术图配色，避免大面积蓝色点云
- 主题：通过 `data-theme` 自动切换材质颜色与混合模式
- 技术：Three.js，动态 `import()`，首屏 HTML 先渲染文字和静态兜底
- 性能：
  - DPR 上限 `1.5`
  - 离开视口或页面隐藏时暂停
  - 移动端降低点数量
  - `prefers-reduced-motion` 下只渲染一帧
  - 不加载后处理、不加载外部模型/贴图
- 目标：3D chunk 懒加载，不阻塞 LCP；首屏文字 2.5s 内可见

## 5. 技术架构

```
Astro 7
├── Content Collections（blog / projects）
├── MDX（项目详情，文章可逐步升级）
├── 原生 CSS + Design Tokens
├── Three.js（仅首页 Hero 动态加载）
├── 客户端原生 JS（搜索、筛选、坐标工具、主题切换）
├── i18n 字典（`src/i18n`）
├── @astrojs/rss
├── @astrojs/sitemap
└── GitHub Actions → GitHub Pages
```

不引入：

- 数据库 / SSR / 登录
- 重型 CMS
- 大型 UI 组件库
- 全站 3D / 全站动画框架
- 完整中文字体包

### 目录结构

```
docs/                    方案与使用说明
public/                  静态资源（图片、视频、下载文件、favicon）
scripts/                 新建文章等维护脚本
src/
  components/            页面组件
  content/
    blog/                中文文章 Markdown（含英文标题/摘要）
    projects/            中文项目案例 MDX
    projects-en/         英文项目案例 MDX
  i18n/                  界面文案、语言与路径工具
  data/                  站点信息、下载注册表、旧链接
  layouts/               基础布局 / 文章布局 / 项目布局
  pages/                 路由
  scripts/               首屏 3D 等客户端逻辑
  styles/                全局样式与 tokens
  utils/                 阅读时间、日期格式化等
.github/workflows/       自动部署
astro.config.mjs
package.json
```

### 内容模型

文章：

```yaml
title: 标题
titleEn: 英文标题（可选）
description: 列表和 SEO 用的一句话摘要
descriptionEn: 英文摘要（可选）
date: 2021-09-06
updated: 2025-05-18
category: Cesium
categoryEn: Cesium
series: Cesium 实战
seriesEn: Cesium in Practice
tags: [Cesium, WebGL]
cover: /assets/images/...   # 可选
draft: false
featured: false
legacy: /2021/09/06/旧标题  # 可选，旧站路径，用于重定向
```

项目：

```yaml
title: GClient WebGL 数字地球引擎
summary: 一句话说明
role: 引擎研发
period: 2020.07 – 2023.11
stack: [C++, WebGL, GLSL, Cesium]
order: 2
cover: engine
```

下载：

```ts
{
  id, title, description, file, type, size, version, updated, sha256?, tags
}
```

## 6. 实施阶段

### Phase 0：准备

- [x] 创建 `astro` 分支，保留 `main` 旧站
- [x] 建立两份维护文档
- [x] 盘点现有文章、图片、视频、失效外链

### Phase 1：工程骨架

- [x] Astro 项目初始化
- [x] 设计 tokens 与全局样式
- [x] 基础布局 / Header / Footer / SEO
- [x] 首页骨架
- [x] 404 / RSS / Sitemap

### Phase 2：内容迁移

- [x] 迁移 6 篇文章并补齐 frontmatter
- [x] 图片、视频路径修正
- [x] 旧 URL 重定向
- [x] About / 简历页
- [x] 标签、系列（归档暂由文章列表承担）

### Phase 3：招牌页面

- [x] 首页 Hero + 轻量 3D
- [x] 能力矩阵
- [x] 3 个项目案例
- [x] 下载中心
- [x] Lab 小工具（坐标转换 / 瓦片计算）

### Phase 4：体验与质量

- [x] 站内搜索（⌘K）
- [x] 文章目录、阅读进度、代码复制
- [x] 移动端适配
- [x] 性能检查（首屏 3D 懒加载、图片转 WebP、视频压缩、Lighthouse 100）
- [x] RSS / Sitemap / OG / robots
- [x] 旧外链清理（示例索引改为存档说明）
- [x] 内部链接静态检查（bun run check:links）
- [x] 分类 OG 图与 Web App Manifest
- [x] 中英双语页面与语言切换
- [x] 日夜主题切换与主题化 3D 场景

### Phase 5：上线

- [x] GitHub Actions 部署配置
- [ ] GitHub Pages 切换为 Actions（需要在仓库 Settings 操作）
- [x] 旧站备份与回滚说明
- [ ] 提交搜索引擎
- [ ] 合并到 main 后观察一周，再清理旧 Jekyll 文件

## 7. 验收标准

### 功能

- [x] 首页、项目、文章、标签、系列、下载、关于、简历、404 均可访问
- [x] 文章可新增/编辑/删除，构建时校验 frontmatter
- [x] 下载文件可新增，列表自动展示
- [x] 旧文章 URL 能跳转到新地址
- [x] 搜索能按标题、摘要、标签过滤
- [x] RSS 和 Sitemap 正常输出

### 性能

- [x] 首页首屏文字 LCP < 2.5s（Lighthouse：桌面 0.2s / 移动 0.8s）
- [x] 3D 资源不阻塞首屏文字（动态 import + idle 加载）
- [x] 移动端 3D 降采样（点数量、DPR、抗锯齿）
- [x] 无布局抖动（固定画布/卡片比例）
- [x] 图片懒加载，视频不自动播放

### 体验

- [x] 375px / 768px / 1440px 三档布局正常
- [x] 键盘可操作搜索与导航
- [x] `prefers-reduced-motion` 下无持续动画
- [x] 文章正文在浅色背景下长时间阅读舒适
- [x] 中英文切换保留当前页面（系列页做中英映射）
- [x] 日夜主题切换、刷新保持、首次跟随系统
- [x] 日间/夜间均通过 axe WCAG A/AA 扫描

### 维护

- [x] `docs/USAGE.md` 能指导新增文章、项目、下载
- [x] 所有内容变更只需改 `src/content`、`src/data`、`public`
- [x] 依赖更新不会影响内容

## 8. 风险与约束

1. **公司内容合规**：高德/正元相关案例只写方法、架构和个人贡献，不上传未公开数据、截图或指标。项目页统一标注“已脱敏”。
2. **旧外链**：`zydlxx.cn:1234` 的示例大概率已下线，保留为“示例索引/已下线”说明，避免死链。
3. **媒体体积**：现有视频约 15MB，继续使用本地文件，但改为点击播放；后续大文件建议放 GitHub Releases。
4. **国内访问**：GitHub Pages 在国内可能偏慢；暂不换域名/备案，先保证静态资源和首屏足够轻。
5. **工具链**：本机使用 Bun，CI 使用 Bun；如果换到 Node，命令需保持一致。
6. **旧站切换**：切换前保留 `main` 分支；如新站异常，GitHub Pages 改回 `main` 即可回滚。

## 9. 后续迭代（不在本次 MVP）

- 英文文章正文全文翻译（当前英文页为英文标题/摘要 + 中文正文）
- giscus 评论
- 文章 OG 图按标题自动生成（当前按分类复用）
- Cesium Demo 在线画廊
- glTF 模型查看器
-  newsletter / 邮件订阅
- 访问统计（Cloudflare Web Analytics / Umami）
- 更多小工具：GeoJSON 校验、投影换算、瓦片拼接

## 10. 文档维护约定

- 每次完成一个阶段，更新本文档对应复选框和“当前状态”。
- 新增/修改内容操作流程时，同步更新 `docs/USAGE.md`。
- 设计 token、目录结构、部署方式发生变化时，两份文档都要检查。
- 文档和代码放在同一个 commit，避免文档落后于实现。

## 11. 更新记录

| 日期 | 变更 |
|---|---|
| 2026-11-11 | 建立方案与使用文档；完成 Astro 重构 MVP：首页 3D、项目案例、文章迁移、标签/系列、搜索、下载、Lab、简历、RSS/Sitemap、GitHub Actions；清理旧 Jekyll 文件并保留 `main` 回滚能力 |
| 2026-11-11 | 补充分类 OG 图、Web App Manifest、内部链接检查；Lighthouse 桌面/移动端主要页面全部 100 分；修复对比度与标题层级问题 |
| 2026-11-11 | 首屏 3D 视觉升级：稀疏点云、经纬网面、曲线彗尾、Fresnel 边缘光、镜头推拉；移除年限与经历数量展示 |
| 2026-11-11 | 完成中英双语：`/en/` 路由、语言切换、英文项目内容、英文 SEO/OG/RSS/搜索；完成日夜主题：浅色 Hero、主题化 3D、localStorage 持久化 |
