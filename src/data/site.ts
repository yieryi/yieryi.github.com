export const site = {
  name: 'WANGKANG',
  nameZh: '王康',
  role: '三维地理空间工程师',
  tagline: '把真实世界，变成可计算、可渲染的三维地图。',
  description:
    '王康（WANGKANG）的个人技术主页。关注三维渲染引擎、GIS 几何计算、三维建模与高精地图数据生产。',
  keywords: [
    'WANGKANG',
    '王康',
    '三维 GIS',
    'Cesium',
    'WebGL',
    '三维渲染引擎',
    'GIS 几何计算',
    '高精地图',
    '三维重建',
  ],
  email: 'kang_wang163@163.com',
  github: 'https://github.com/yieryi',
  githubIssues: 'https://github.com/yieryi/yieryi.github.com/issues',
  wechat: 'i4vanky',
  url: 'https://yieryi.github.io',
  locale: 'zh-CN',
  nav: [
    { label: 'Work', href: '/work/' },
    { label: 'Writing', href: '/writing/' },
    { label: 'Lab', href: '/lab/' },
    { label: 'Downloads', href: '/downloads/' },
    { label: 'About', href: '/about/' },
  ],
  stats: [
    { value: '3D', label: '渲染引擎' },
    { value: 'GIS', label: '几何与空间分析' },
    { value: 'HD', label: '高精地图与三维重建' },
  ],
  timeline: [
    {
      period: '2023.11 – 至今',
      company: '高德地图 · 数据中心',
      title: '技术研发 / 协调',
      description:
        '高精地图生产人工编辑器提效，三维模型半自动生产流程建设，负责技术研发与跨团队协调。部分数据成果已上线高德地图 App。',
      tags: ['高精地图', '三维重建', '数据生产'],
    },
    {
      period: '2020.07 – 2023.11',
      company: '正元地信',
      title: 'WebGL 引擎研发',
      description:
        'GClient 数字地球引擎底层研发，深入图形学，扩展数据格式接入，优化性能，建设 GIS 分析与业务渲染管线。',
      tags: ['WebGL', 'GLSL', 'Cesium', '数字孪生'],
    },
    {
      period: '2018 – 2020.07',
      company: '中科图新',
      title: '数字地球引擎研发',
      description:
        'LocaSpace Viewer 引擎功能研发，面向交通规划、工程建设等行业，积累三维 GIS 数据加载、渲染与交互经验。',
      tags: ['C++', 'OpenGL', '数字地球'],
    },
  ],
} as const;

export type Site = typeof site;