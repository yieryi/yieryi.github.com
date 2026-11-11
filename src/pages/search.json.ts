import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export const GET: APIRoute = async () => {
  const posts = (await getCollection('blog', ({ data }) => !data.draft)).sort(
    (a, b) => b.data.date.valueOf() - a.data.date.valueOf(),
  );
  const projects = (await getCollection('projects')).sort((a, b) => a.data.order - b.data.order);

  const items = [
    ...posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      href: `/writing/${post.id}/`,
      type: '文章' as const,
      date: post.data.date.toISOString().slice(0, 10),
      tags: [post.data.category, ...post.data.tags.filter((tag) => tag !== post.data.category)],
    })),
    ...projects.map((project) => ({
      title: project.data.title,
      description: project.data.summary,
      href: `/work/${project.id}/`,
      type: '项目' as const,
      tags: project.data.stack,
    })),
    {
      title: 'Lab · 空间计算小工具',
      description: '坐标转换、瓦片计算与 Cesium 示例索引。',
      href: '/lab/',
      type: '页面' as const,
      tags: ['坐标转换', '瓦片', 'Cesium'],
    },
    {
      title: 'Downloads · 资源下载',
      description: '简历、示例数据、演示视频与工具资源。',
      href: '/downloads/',
      type: '页面' as const,
      tags: ['下载', '简历', '示例数据'],
    },
    {
      title: 'About · 关于王康',
      description: '三维地理空间工程师，关注三维渲染、GIS 与高精地图数据生产。',
      href: '/about/',
      type: '页面' as const,
      tags: ['履历', '联系方式'],
    },
    {
      title: 'Resume · 打印版简历',
      description: '王康的个人简历，支持打印和另存为 PDF。',
      href: '/resume/',
      type: '页面' as const,
      tags: ['简历', 'PDF'],
    },
  ];

  return new Response(JSON.stringify(items), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
  });
};