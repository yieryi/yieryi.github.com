# WANGKANG · 三维地理空间工程师

个人技术主页，记录三维渲染引擎、GIS 几何计算、三维建模与高精地图数据生产的工程实践。

- 线上地址：<https://yieryi.github.io>
- 技术栈：Astro + MDX + 原生 CSS + Three.js（首屏按需加载）
- 部署：GitHub Actions → GitHub Pages

## 本地开发

需要 [Bun](https://bun.sh/) 1.1+。

```bash
bun install
bun run dev        # http://localhost:4321
bun run build      # 构建到 dist/
bun run preview    # 预览构建结果
bun run check      # 类型与内容校验
```

## 内容维护

```bash
bun run new:post     # 新建文章
bun run new:project  # 新建项目案例
```

- 文章：`src/content/blog/*.md`
- 项目：`src/content/projects/*.mdx`
- 下载资源：`src/data/downloads.ts` + `public/downloads/`
- 站点信息/导航：`src/data/site.ts`
- 图片：`public/assets/images/`
- 视频：`public/assets/videos/`

详细操作见：

- [重构方案](./docs/REFACTOR_PLAN.md)
- [使用说明](./docs/USAGE.md)

## 目录

```
docs/                  方案与使用说明
public/                静态资源、下载文件、favicon、OG 图
scripts/               新建内容脚本
src/
  components/          组件
  content/             文章与项目内容
  data/                站点信息、下载注册表、旧链接
  layouts/             布局
  pages/               路由
  scripts/             首屏 3D 等客户端逻辑
  styles/              设计 tokens 与全局样式
  utils/               内容工具函数
.github/workflows/     GitHub Pages 自动部署
```

## 部署

推送到 `main` 分支后，GitHub Actions 自动构建并发布到 GitHub Pages。

首次切换需要在仓库 **Settings → Pages → Build and deployment** 中把 Source 设为 **GitHub Actions**。

## 旧站

旧 Jekyll 站点保留在 `main` 分支历史中。新站稳定前不要删除旧分支，出问题可以直接回滚。

## License

代码 MIT。文章与图片内容版权归王康所有，转载请联系。