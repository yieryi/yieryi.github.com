# WANGKANG 个人站使用说明

> 适用版本：Astro 7 重构版（`astro` 分支）
> 最后更新：2026-11-11
>
> 当前状态：MVP 已完成，`astro` 分支可本地运行；合并到 `main` 前，线上仍是旧 Jekyll 站。
>
> 日常写作、加项目、加下载、发布上线，看这一份就够了。
> 设计与重构背景见 [`REFACTOR_PLAN.md`](./REFACTOR_PLAN.md)。

---

## 1. 环境要求

- [Bun](https://bun.sh/) 1.1+（项目使用 Bun，不依赖 Node）
- Git
- 可选：VS Code + Astro 插件

当前机器已安装 Bun，可直接使用。

```bash
bun --version
```

## 2. 本地开发

```bash
# 安装依赖（首次或 package.json 变化后）
bun install

# 启动开发服务器
bun run dev

# 生产构建
bun run build

# 本地预览构建结果
bun run preview

# 类型与内容校验
bun run check
```

开发地址通常是 `http://localhost:4321`。

## 3. 目录速查

```
src/
  content/blog/        文章（Markdown）
  content/projects/    项目案例（MDX）
  data/site.ts         姓名、邮箱、导航、社交链接
  data/downloads.ts    下载资源注册表
  data/legacy.ts       旧站 URL 重定向（补充项）
  scripts/globe.ts     首屏 Three.js 场景
  pages/               路由
  components/          组件
  styles/              全局样式
public/
  assets/images/       文章图片
  assets/videos/       演示视频
  downloads/           可下载文件
  favicon.svg          站点图标
docs/                  方案与使用说明
scripts/               新建内容脚本
```

## 4. 新增一篇文章

### 4.1 推荐方式：脚本

```bash
bun run new:post
```

按提示输入标题、分类、标签、简介，会在 `src/content/blog/` 下生成 Markdown 文件。

也支持参数，方便脚本化：

```bash
bun run new:post --title "标题" --slug my-post --description "摘要" --category Cesium --series "Cesium 实战" --tags "Cesium, 性能"
```

### 4.2 手动方式

在 `src/content/blog/` 新建 `<slug>.md`，`slug` 用英文短横线，例如 `cesium-terrain-lod.md`：

```markdown
---
title: Cesium 地形 LOD 实践
description: 一句话说明这篇文章解决什么问题。
date: 2026-11-11
updated: 2026-11-11
category: Cesium
series: Cesium 实战
tags: [Cesium, 地形, 性能]
draft: false
featured: false
---

正文从这里开始。
```

字段说明：

| 字段 | 必填 | 说明 |
|---|---|---|
| `title` | 是 | 文章标题 |
| `description` | 是 | 列表和 SEO 摘要，建议 40–80 字 |
| `date` | 是 | 发布日期，`YYYY-MM-DD` |
| `updated` | 否 | 最后更新时间 |
| `category` | 是 | 单个分类，用于列表展示 |
| `series` | 否 | 系列名，用于系列聚合 |
| `tags` | 否 | 标签数组 |
| `cover` | 否 | 封面图路径，例如 `/assets/images/...` |
| `draft` | 否 | `true` 时不在生产构建中展示 |
| `featured` | 否 | `true` 时优先出现在首页/列表 |
| `legacy` | 否 | 旧站路径，自动生成跳转页 |

### 4.3 插入图片

把图片放到 `public/assets/images/<分类>/`，正文用绝对路径：

```markdown
![截图](/assets/images/Cesium/terrain-lod.png)
```

建议：

- 宽度压到 1600px 以内
- 优先 WebP/JPG（站点图片已统一转 WebP）
- 文件名用英文短横线，避免中文和空格
- 大图不要直接放仓库根目录
- 单张图建议压到 300KB 以内

### 4.4 插入视频

把视频放到 `public/assets/videos/<分类>/`，用 HTML：

```html
<video controls preload="metadata" poster="/assets/images/Cesium/cover.webp">
  <source src="/assets/videos/Cesium/demo.mp4" type="video/mp4" />
</video>
```

不要用 `autoplay`，避免首屏流量和性能问题。

### 4.5 删除文章

直接删除 `src/content/blog/<slug>.md`，以及它独占的图片/视频（如果不再被其他文章引用），然后构建确认。

## 5. 新增项目案例

项目案例用 MDX，位于 `src/content/projects/`。

### 5.1 脚本

```bash
bun run new:project
```

也支持参数：

```bash
bun run new:project --title "项目名" --slug my-project --summary "摘要" --role "引擎研发" --period "2026" --stack "TypeScript, WebGL" --cover engine --order 10
```

### 5.2 手动方式

新建 `src/content/projects/my-project.mdx`：

```mdx
---
title: 某三维引擎项目
summary: 一句话说明项目价值。
role: 引擎研发
period: 2023.11 – 至今
stack: [C++, WebGL, GLSL, Cesium]
order: 4
cover: engine
featured: false
---

## 背景与约束

……

## 我的角色

……

## 关键设计

……

## 结果与复盘

……
```

`cover` 可选值：`engine` / `gis` / `map` / `data`，对应内置的抽象封面。

**合规提醒**：公司项目只写公开可说的技术方法、架构和个人贡献；不要放未公开数据、内部截图、真实指标。页面会自动带“已脱敏”提示。

## 6. 新增下载资源

### 6.1 小文件（< 20MB）

1. 把文件放到 `public/downloads/`。
2. 编辑 `src/data/downloads.ts`，增加一项：

```ts
{
  id: 'sample-buildings',
  title: '示例建筑白模 GeoJSON',
  description: '用于演示三维建筑拉伸的最小数据集。',
  file: '/downloads/sample-buildings.geojson',
  type: 'GeoJSON',
  size: '12 KB',
  version: '1.0',
  updated: '2026-11-11',
  tags: ['GIS', '示例数据'],
}
```

3. 构建后访问 `/downloads/` 查看。

### 6.2 大文件（> 20MB）

不要把大文件直接提交到 Git。建议：

1. 在 GitHub 仓库的 **Releases** 上传文件。
2. 在 `src/data/downloads.ts` 里把 `file` 写成 Release 的下载地址。
3. 在 `description` 里说明版本和适用平台。

### 6.3 计算 SHA256（可选）

```bash
shasum -a 256 public/downloads/your-file.zip
```

把结果填到 `sha256` 字段，页面会展示。

## 7. 修改个人信息 / 导航

编辑 `src/data/site.ts`：

```ts
export const site = {
  name: 'WANGKANG',
  nameZh: '王康',
  role: '三维地理空间工程师',
  email: 'kang_wang163@163.com',
  github: 'https://github.com/yieryi',
  wechat: 'i4vanky',
  url: 'https://yieryi.github.io',
  nav: [
    { label: 'Work', href: '/work/' },
    { label: 'Writing', href: '/writing/' },
    { label: 'Lab', href: '/lab/' },
    { label: 'Downloads', href: '/downloads/' },
    { label: 'About', href: '/about/' },
  ],
}
```

- 改导航：调整 `nav` 数组
- 改首页文案：`src/pages/index.astro`
- 改页脚：`src/components/Footer.astro`
- 改关于页：`src/pages/about.astro`
- 改简历：`src/pages/resume.astro`

## 8. 首页 3D 说明

- 3D 容器在 `src/components/HeroGlobe.astro`，场景逻辑在 `src/scripts/globe.ts`。
- 使用 Three.js 动态加载，不阻塞首屏文字。
- 页面隐藏、离开视口、`prefers-reduced-motion` 时会暂停或只渲染一帧。
- 如果后续觉得太重，可以：
  1. 降低点数量 / 降低 DPR 上限；
  2. 移动端直接显示静态图；
  3. 替换为视频或纯 CSS 视觉。
- **不要**在 3D 里加后处理、外部模型、大贴图，除非重新评估性能预算。

## 9. 站内搜索

- 搜索数据由 `src/pages/search.json.ts` 在构建时生成（静态 JSON）。
- 前端搜索组件在 `src/components/SearchDialog.astro`。
- 支持 `⌘K` / `Ctrl+K` 打开，输入标题、摘要、标签过滤。
- 新增文章后无需手动维护索引，构建会自动更新。

## 10. 构建与部署

### 10.1 本地构建检查

```bash
bun run check
bun run build
bun run preview
```

构建产物在 `dist/`。

### 10.2 GitHub Pages 自动部署

仓库已配置 `.github/workflows/deploy.yml`：

1. 合并/推送到 `main` 分支
2. GitHub Actions 自动执行 `bun install`、`bun run build`
3. 产物发布到 GitHub Pages

首次切换需要在 GitHub 仓库设置里：

- **Settings → Pages → Build and deployment → Source** 选择 **GitHub Actions**
- 确认自定义域名留空（当前使用 `yieryi.github.io`）

### 10.3 分支预览

- 日常改动推送到 `astro` 分支。
- 本地用 `bun run dev` / `bun run preview` 检查。
- 确认无误后合并到 `main`；`main` 的 push 会触发 GitHub Actions 自动上线。
- 也可以在 Actions 页面手动 `workflow_dispatch`。

### 10.4 回滚

旧站仍在 `main` 的历史中。如果新站出现严重问题：

1. 在 GitHub Pages 设置里把 Source 改回 **Deploy from a branch**，选择旧分支/目录；
2. 或直接 revert 对应 commit。

因此**切换前不要删除 `main` 上的旧 Jekyll 文件**，确认稳定后再清理。

当前 `astro` 分支已经把旧 Jekyll 文件替换为新站；`main` 分支仍保留旧站。合并前请先确认 GitHub Pages 的 Source 已切换为 **GitHub Actions**。

## 11. 常见问题

### Q1：新增文章后列表没有出现？

- 检查 `draft` 是否为 `true`
- 检查 `date` 是否是未来日期
- 运行 `bun run check` 看 frontmatter 是否报错

### Q2：图片 404？

- 确认文件在 `public/assets/images/...`
- 正文路径以 `/assets/...` 开头，不要写 `../`
- 注意大小写，Linux 构建区分大小写

### Q3：构建报 `content collection` 错误？

- 检查 frontmatter 字段类型，尤其是 `tags` 必须是数组
- 日期写成 `YYYY-MM-DD`
- 运行 `bun run check` 查看具体文件

### Q4：3D 首屏不显示？

- 检查浏览器是否禁用 WebGL
- 检查控制台是否有 Three.js 加载错误
- 页面本身有静态兜底，不影响阅读
- 本地 `bun run dev` 下如果热更新异常，重启 dev server

### Q5：旧文章链接 404？

- 在文章 frontmatter 增加 `legacy` 字段（会自动生成跳转页）
- 或者把特殊路径补到 `src/data/legacy.ts`
- 重新构建后会生成跳转页

### Q6：下载文件很大，构建很慢？

- 把文件移到 GitHub Releases
- `public/downloads/` 只保留小文件

## 12. 维护节奏

- **每次发文**：`bun run check` + 本地预览
- **每月**：`bun update` 检查依赖，跑一次构建
- **每季度**：检查失效链接、更新 About/简历
- **每年**：回顾设计 tokens，必要时做一次视觉微调

## 13. 文档更新约定

改动以下内容时，请同步更新本文件：

- 新增/删除内容类型
- 新增/修改脚本命令
- 目录结构变化
- 部署方式变化
- 3D / 搜索 / 下载的实现方式变化

改动完成后，在 `docs/REFACTOR_PLAN.md` 勾选对应阶段。

## 14. 更新记录

| 日期 | 变更 |
|---|---|
| 2026-11-11 | 初版：本地开发、文章/项目/下载维护、3D/搜索说明、部署与回滚 |
