import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { postTitle, postDescription, postCategory } from '../utils/content';
import { localizePath } from '../i18n/utils';
import { tagLabel } from '../i18n/tags';

export const GET: APIRoute = async () => {
  const posts = (await getCollection('blog', ({ data }) => !data.draft)).sort(
    (a, b) => b.data.date.valueOf() - a.data.date.valueOf(),
  );
  const projects = (await getCollection('projects')).sort((a, b) => a.data.order - b.data.order);
  const projectsEn = (await getCollection('projectsEn')).sort((a, b) => a.data.order - b.data.order);

  const postEntries = (['zh', 'en'] as const).flatMap((lang) =>
    posts.map((post) => {
      const category = postCategory(post, lang);
      return {
        lang,
        title: postTitle(post, lang),
        description: postDescription(post, lang),
        href: localizePath(`/writing/${post.id}/`, lang),
        type: 'article' as const,
        date: post.data.date.toISOString().slice(0, 10),
        tags: [category, ...post.data.tags.filter((tag) => tag !== post.data.category).map((tag) => tagLabel(tag, lang))],
      };
    }),
  );

  const projectEntries = [
    ...projects.map((project) => ({
      lang: 'zh' as const,
      title: project.data.title,
      description: project.data.summary,
      href: `/work/${project.id}/`,
      type: 'project' as const,
      tags: project.data.stack,
    })),
    ...projectsEn.map((project) => ({
      lang: 'en' as const,
      title: project.data.title,
      description: project.data.summary,
      href: `/en/work/${project.id}/`,
      type: 'project' as const,
      tags: project.data.stack,
    })),
  ];

  const pageEntries = [
    {
      lang: 'zh' as const,
      title: '首页',
      description: '王康 · 三维地理空间工程师。',
      href: '/',
      type: 'page' as const,
      tags: ['WANGKANG'],
    },
    {
      lang: 'en' as const,
      title: 'Home',
      description: 'WANGKANG · 3D Geospatial Engineer.',
      href: '/en/',
      type: 'page' as const,
      tags: ['WANGKANG'],
    },
    {
      lang: 'zh' as const,
      title: 'Lab · 空间计算小工具',
      description: '坐标转换、瓦片计算与 Cesium 示例索引。',
      href: '/lab/',
      type: 'page' as const,
      tags: ['坐标转换', '瓦片', 'Cesium'],
    },
    {
      lang: 'en' as const,
      title: 'Lab · Spatial utilities',
      description: 'Coordinate conversion, tile math and a Cesium demo index.',
      href: '/en/lab/',
      type: 'page' as const,
      tags: ['Coordinate', 'Tile', 'Cesium'],
    },
    {
      lang: 'zh' as const,
      title: 'Downloads · 资源下载',
      description: '简历、示例数据、演示视频与工具资源。',
      href: '/downloads/',
      type: 'page' as const,
      tags: ['下载', '简历', '示例数据'],
    },
    {
      lang: 'en' as const,
      title: 'Downloads · Resources',
      description: 'Resume, sample data, demo videos and tools.',
      href: '/en/downloads/',
      type: 'page' as const,
      tags: ['Downloads', 'Resume', 'Sample data'],
    },
    {
      lang: 'zh' as const,
      title: 'About · 关于王康',
      description: '三维地理空间工程师，关注三维渲染、GIS 与高精地图数据生产。',
      href: '/about/',
      type: 'page' as const,
      tags: ['履历', '联系方式'],
    },
    {
      lang: 'en' as const,
      title: 'About · WANGKANG',
      description: '3D geospatial engineer working on rendering, GIS and HD map data production.',
      href: '/en/about/',
      type: 'page' as const,
      tags: ['Experience', 'Contact'],
    },
    {
      lang: 'zh' as const,
      title: 'Resume · 打印版简历',
      description: '王康的个人简历，支持打印和另存为 PDF。',
      href: '/resume/',
      type: 'page' as const,
      tags: ['简历', 'PDF'],
    },
    {
      lang: 'en' as const,
      title: 'Resume · Print version',
      description: 'WANGKANG’s resume, ready to print or save as PDF.',
      href: '/en/resume/',
      type: 'page' as const,
      tags: ['Resume', 'PDF'],
    },
  ];

  const items = [...postEntries, ...projectEntries, ...pageEntries];

  return new Response(JSON.stringify(items), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
  });
};