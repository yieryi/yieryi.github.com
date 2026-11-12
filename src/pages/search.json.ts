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
      description: '萧安 · 三维地理空间工程师，目前在 高德 担任 高级地图工程师。',
      href: '/',
      type: 'page' as const,
      tags: ['WANGKANG'],
    },
    {
      lang: 'en' as const,
      title: 'Home',
      description: 'XIAO AN · 3D Geospatial Engineer, currently a Senior Map Engineer at Amap.',
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
      description: '示例数据、演示视频与工具资源。',
      href: '/downloads/',
      type: 'page' as const,
      tags: ['下载', '示例数据', '工具'],
    },
    {
      lang: 'en' as const,
      title: 'Downloads · Resources',
      description: 'Sample data, demo videos and tools.',
      href: '/en/downloads/',
      type: 'page' as const,
      tags: ['Downloads', 'Sample data', 'Tools'],
    },
    {
      lang: 'zh' as const,
      title: 'About · 关于萧安',
      description: '三维地理空间工程师，目前在 高德 担任 高级地图工程师，关注三维渲染、GIS 与高精地图数据生产。',
      href: '/about/',
      type: 'page' as const,
      tags: ['方向', 'GitHub'],
    },
    {
      lang: 'en' as const,
      title: 'About · XIAO AN',
      description: '3D geospatial engineer, currently a Senior Map Engineer at Amap, focused on rendering, GIS and HD map data production.',
      href: '/en/about/',
      type: 'page' as const,
      tags: ['Focus', 'GitHub'],
    },
  ];

  const items = [...postEntries, ...projectEntries, ...pageEntries];

  return new Response(JSON.stringify(items), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
  });
};