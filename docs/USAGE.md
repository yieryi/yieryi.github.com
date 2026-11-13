# 萧安（WANGKANG）个人站使用说明

> 适用版本：Astro 7 重构版（`astro` 分支）
> 最后更新：2026-11-12
>
> 当前状态：中英双语 + 日夜主题已完成，并已上线 <https://yieryi.github.io>。源码在 `astro`，部署产物在 `main`，旧站备份在 `legacy-jekyll`。
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
bun run check:links # 先 build，再检查内部链接
```

开发地址通常是 `http://localhost:4321`。

## 3. 目录速查

```
src/
  content/blog/        中文文章（Markdown，含英文标题/摘要）
  content/projects/    中文项目案例（MDX）
  content/projects-en/ 英文项目案例（MDX）
  i18n/                界面文案、语言路径、标签翻译
  data/site.ts         主标识、当前角色、联系方式、导航
  data/downloads.ts    下载资源注册表
  data/legacy.ts       旧站 URL 重定向（补充项）
  scripts/hero/        首屏数字地形场景（模块化）
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
| `title` | 是 | 中文文章标题 |
| `titleEn` | 否 | 英文标题；英文页会优先使用 |
| `description` | 是 | 中文列表和 SEO 摘要 |
| `descriptionEn` | 否 | 英文摘要 |
| `date` | 是 | 发布日期，`YYYY-MM-DD` |
| `updated` | 否 | 最后更新时间 |
| `category` | 是 | 单个中文分类 |
| `categoryEn` | 否 | 英文分类 |
| `series` | 否 | 中文系列名 |
| `seriesEn` | 否 | 英文系列名 |
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
bun run new:project --title "项目名" --slug my-project --summary "摘要" --stack "TypeScript, WebGL" --cover engine --order 10
```

### 5.2 手动方式

新建 `src/content/projects/my-project.mdx`：

```mdx
---
title: 某三维引擎项目
summary: 一句话说明项目价值。
stack: [C++, WebGL, GLSL, Cesium]
order: 4
cover: engine
featured: false
---

## 背景与约束

……

## 技术工作

……

## 关键设计

……

## 结果与复盘

……
```

`cover` 可选值：`engine` / `gis` / `map` / `data`，对应内置的抽象封面。

英文项目正文放在 `src/content/projects-en/`，文件名 slug 与中文项目一致。英文页会读取这个集合，中文页读取 `src/content/projects/`。

**隐私与合规提醒**：项目案例只写公开可说的技术方法、架构和工程思路；不要放详细公司历史、任职时间、未公开数据、内部截图或真实指标。当前角色可按需公开。页面会自动带“已脱敏”提示。

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
  name: '萧安',
  nameEn: 'XIAO AN',
  handle: 'WANGKANG',
  role: '三维地理空间工程师',
  currentRole: '高德 · 高级地图工程师',
  email: 'kang_wang163@163.com',
  wechat: 'i4vanky',
  github: 'https://github.com/yieryi',
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

- 改英文角色：`roleEn`
- 改当前角色：`currentRole` / `currentRoleEn`
- 改邮箱/微信：`email` / `wechat`
- 改英文简介：`descriptionEn`
- 改导航：调整 `nav` 数组（Header/Footer 会按语言自动加 `/en` 前缀并翻译标签）
- 改首页文案：`src/components/pages/HomePage.astro`
- 改页脚：`src/components/Footer.astro`
- 改关于页：`src/components/pages/AboutPage.astro`
- 改项目页：`src/components/pages/ProjectPage.astro`
- 改下载页：`src/components/pages/DownloadsPage.astro`

**隐私约定**：站点不展示简历或详细履历/任职时间线；仅公开当前角色「高德 · 高级地图工程师」。邮箱/微信仅用于合作交流；新增项目/文章时不要写入其他公司历史或未公开信息。

## 8. 中英双语与主题

### 8.1 语言

- 中文默认在根路径：`/`、`/work/`、`/writing/`。
- 英文在 `/en/` 下：`/en/`、`/en/work/`、`/en/writing/`。
- Header 右上角的 `EN / 中文` 用于切换，切换时会尽量保留当前页面。
- 系列页会在中英系列名之间映射；标签页沿用原始标签路径，只翻译显示名。
- 文章的英文页目前提供英文标题、摘要、分类、系列和站点导航，正文仍为中文，并在正文前显示说明。**英文正文全文翻译已记为 P2 待做事项，暂时搁置**；恢复时按篇翻译，并在 `/en/writing/<slug>/` 替换中文正文。

英文内容字段：

```yaml
titleEn: English title
descriptionEn: English summary
categoryEn: Frontend Engineering
seriesEn: Frontend Fundamentals
```

项目案例的英文正文位于 `src/content/projects-en/`，文件名与中文项目保持一致，例如 `webgl-digital-earth-engine.mdx`。新增英文项目时复制一个文件并翻译正文即可。

界面文案在 `src/i18n/ui.ts`，语言路径工具在 `src/i18n/utils.ts`，标签翻译在 `src/i18n/tags.ts`。

### 8.2 主题

- 首次访问跟随系统 `prefers-color-scheme`。
- Header 的月亮/太阳按钮切换日夜主题，选择会写入 `localStorage` 的 `wangkang-theme`，刷新后保持。
- 日间：浅色纸面 + 深色文字，首屏/页面 Hero 也是浅色技术图。
- 夜间：深空墨蓝 + 浅色文字，首屏/页面 Hero 为深色数字地形。
- 颜色令牌在 `src/styles/tokens.css`：`--paper`、`--ink`、`--hero-bg`、`--hero-text` 等。
- 3D 场景配色在 `src/scripts/hero/palette.ts` 中，通过 `MutationObserver` 监听 `data-theme` 自动切换。
- 新增组件时不要写死白色/黑色，优先使用现有 token。

### 8.3 检查两种模式

```bash
bun run check
bun run build
bun run check:links
```

手动检查：

- 中文 / 英文各看一遍首页、文章、项目、下载、Lab、关于
- 日间 / 夜间各看一遍，重点看卡片、表格、标签、按钮、代码块
- 移动端 390px 下检查 Header 是否溢出
- 搜索在中文页只返回中文条目，在英文页只返回英文条目

## 9. OG 图与分享卡片

- 默认 OG 图：`public/og/default.png`
- 分类 OG 图：`public/og/cesium.png`、`gis.png`、`frontend.png`
- 项目/写作列表：`project.png`、`writing.png`
- 文章会按分类自动选择 OG 图，项目页使用 `project.png`。
- 新增分类时，在 `src/utils/og.ts` 里补映射；没有映射会回退到默认图。
- 图片尺寸统一为 1200 × 630。

## 10. 首页 3D 说明

> 首屏为「全屏数字地形」。详细方案、决策和待验证问题见 [`HERO_3D_PLAN.md`](./HERO_3D_PLAN.md)。

- 容器：`src/components/HeroScene.astro`
- 入口：`src/scripts/hero/index.ts`
- 模块：
  - `terrain.ts`：程序化 heightfield（120 × 120）、雪线/岩石/雪地颜色、加宽河谷、世界高度等高线
  - `river.ts`：河谷水面、流动高光，远端淡入雾色
  - `sky.ts`：渐变天空、日/月、星点
  - `birds.ts`：桌面端 16 只鸟群，随机巡航并跟随鼠标；移动端不显示
  - `camera.ts`：`rotate_forward` 固定循环 + 地形高度安全距离
  - `trail.ts`：鼠标等高线拖尾
  - `palette.ts`：日/夜配色
  - `quality.ts`：桌面/移动端画质档
- 视觉：风格化数字地形，不是写实喜马拉雅；地形与河流一直延伸到远景雾中，不会在谷口外截断；首屏全屏铺满，文字在左侧渐变遮罩上。
- 相机：约 15 秒 `rotate_forward` 循环，位于谷口外河谷中心线上方，俯看河道，固定注视点，无用户相机控制。
- 交互：桌面端鼠标移动产生等高线笔触，约 1 秒消散，并让鸟群向鼠标方向偏移；触屏不启用。
- 移动端：仍然渲染 3D，但降低地形精度、星点和 DPR；不显示鸟群，避免拥挤。
- 主题：日/夜共享同一场景，只切换光照、天空、地形、水面和鸟群颜色。
- 性能：动态加载、离开视口暂停、DPR 上限、低多边形、无后处理。
- WebGL 不可用时显示 CSS 山脊兜底。

可调参数：

- 相机位置/幅度/周期：`src/scripts/hero/camera.ts`
- 地形高度/河谷/雪线：`src/scripts/hero/terrain.ts`
- 河面宽度/水流：`src/scripts/hero/river.ts`
- 鸟群数量/巡航范围/跟随强度：`src/scripts/hero/birds.ts`、`src/scripts/hero/quality.ts`
- 配色：`src/scripts/hero/palette.ts`
- 画质：`src/scripts/hero/quality.ts`
- 拖尾寿命/线宽：`src/scripts/hero/trail.ts`

## 11. 站内搜索

- 搜索数据由 `src/pages/search.json.ts` 在构建时生成（静态 JSON，中英双语条目）。
- 前端搜索组件在 `src/components/SearchDialog.astro`，会按当前页面语言过滤结果。
- 支持 `⌘K` / `Ctrl+K` 打开，输入标题、摘要、标签过滤。
- 新增文章后无需手动维护索引，构建会自动更新；记得补 `titleEn` / `descriptionEn`，否则英文搜索会回退到中文。

## 12. 构建与部署

### 12.1 本地构建检查

```bash
bun run check
bun run build
bun run check:links
bun run preview
```

构建产物在 `dist/`。

### 12.2 部署结构

当前采用「源码分支 + 部署产物分支」的方式：

| 分支 | 用途 |
|---|---|
| `astro` | Astro 源码、内容、脚本（日常只改这里） |
| `main` | 构建后的静态站点，由 GitHub Actions 自动发布 |
| `legacy-jekyll` | 旧 Jekyll 站点备份，用于回滚 |

GitHub Pages 设置保持：

- **Settings → Pages → Build and deployment → Source**：**Deploy from a branch**
- 分支：`main` / `(root)`

`.github/workflows/publish.yml` 会在推送到 `astro` 后：

1. `bun install --frozen-lockfile`
2. `bun run check`
3. `bun run build`
4. `bun run check:links`
5. 把 `dist/` 强制发布到 `main`（orphan commit）

发布成功后访问 <https://yieryi.github.io> 验证。

> 注意：`main` 是构建产物，不要直接在 `main` 上改源码。所有内容修改都提交到 `astro`。

### 12.3 日常发布

```bash
git checkout astro
# 修改内容
bun run check
bun run build
bun run check:links
git add -A
git commit -m "content: ..."
git push origin astro
```

推送后 GitHub Actions 会自动发布到 `main`。也可以在 Actions 页面手动运行 `Publish to main`（`workflow_dispatch`）。

### 12.4 手动兜底发布

如果 Actions 不可用，可以在本地构建后手动发布：

```bash
bun run build
rm -rf /tmp/wk-deploy
mkdir -p /tmp/wk-deploy
cp -R dist/. /tmp/wk-deploy/
cd /tmp/wk-deploy
git init
git checkout -b main
git add -A
git -c user.name="yieryi" -c user.email="yieryi@users.noreply.github.com" commit -m "deploy: manual"
git remote add origin git@github.com:yieryi/yieryi.github.com.git
git push --force origin main
```

### 12.5 回滚

旧 Jekyll 站备份在 `legacy-jekyll` 分支：

```bash
git push --force origin legacy-jekyll:main
```

GitHub Pages 会重新发布旧站。也可以在 Pages 设置里把 Source 临时指向 `legacy-jekyll` 分支。

如果只是新站某个改动有问题，优先在 `astro` 上 revert 对应 commit，再推送触发重新发布。

## 13. 常见问题

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

## 14. 维护节奏

- **每次发文**：`bun run check` + 本地预览
- **每月**：`bun update` 检查依赖，跑一次构建
- **每季度**：检查失效链接、更新 About/项目
- **每年**：回顾设计 tokens，必要时做一次视觉微调

## 15. 文档更新约定

改动以下内容时，请同步更新本文件：

- 新增/删除内容类型
- 新增/修改脚本命令
- 目录结构变化
- 部署方式变化
- 3D / 搜索 / 下载的实现方式变化

改动完成后，在 `docs/REFACTOR_PLAN.md` 勾选对应阶段。

## 16. 更新记录

| 日期 | 变更 |
|---|---|
| 2026-11-11 | 初版：本地开发、文章/项目/下载维护、3D/搜索说明、部署与回滚 |
| 2026-11-11 | 补充内部链接检查、分类 OG 图、Manifest 与 Lighthouse 结果 |
| 2026-11-11 | 增加中英双语、语言切换、日夜主题与主题化 3D 场景说明 |
| 2026-11-11 | 英文正文全文翻译标记为 P2 搁置事项 |
| 2026-11-12 | 主 IP 改为萧安（WANGKANG 辅助）；移除简历模块与详细履历/时间线；项目案例匿名化；保留当前角色、邮箱和微信用于合作联系 |
