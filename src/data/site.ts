export const site = {
  name: 'WANGKANG',
  nameZh: '王康',
  role: '三维地理空间工程师',
  roleEn: '3D Geospatial Engineer',
  tagline: '把真实世界，变成可计算、可渲染的三维地图。',
  taglineEn: 'Turning the real world into computable, renderable 3D maps.',
  description:
    '王康（WANGKANG）的个人技术主页。关注三维渲染引擎、GIS 几何计算、三维建模与高精地图数据生产。',
  descriptionEn:
    'WANGKANG — 3D geospatial engineer working on rendering engines, GIS geometry, 3D modeling and HD map data production.',
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
  keywordsEn: [
    'WANGKANG',
    '3D GIS',
    'Cesium',
    'WebGL',
    '3D rendering engine',
    'GIS geometry',
    'HD map',
    '3D reconstruction',
  ],
  email: 'kang_wang163@163.com',
  github: 'https://github.com/yieryi',
  githubIssues: 'https://github.com/yieryi/yieryi.github.com/issues',
  wechat: 'i4vanky',
  url: 'https://yieryi.github.io',
  locale: 'zh-CN',
  localeEn: 'en',
  nav: [
    { label: 'Work', href: '/work/' },
    { label: 'Writing', href: '/writing/' },
    { label: 'Lab', href: '/lab/' },
    { label: 'Downloads', href: '/downloads/' },
    { label: 'About', href: '/about/' },
  ],
  stats: [
    { value: '3D', label: '渲染引擎', labelEn: 'Rendering engine' },
    { value: 'GIS', label: '几何与空间分析', labelEn: 'Geometry & spatial analysis' },
    { value: 'HD', label: '高精地图与三维重建', labelEn: 'HD map & 3D reconstruction' },
  ],
  timeline: [
    {
      period: '2023.11 – 至今',
      periodEn: '2023.11 – Present',
      company: '高德地图 · 数据中心',
      companyEn: 'Amap · Data Center',
      title: '技术研发 / 协调',
      titleEn: 'R&D / Coordination',
      description:
        '高精地图生产人工编辑器提效，三维模型半自动生产流程建设，负责技术研发与跨团队协调。部分数据成果已上线高德地图 App。',
      descriptionEn:
        'Improved the HD map production editor, built a semi-automated 3D model production pipeline, and coordinated R&D across teams. Some data results are now live in the Amap app.',
      tags: ['高精地图', '三维重建', '数据生产'],
      tagsEn: ['HD map', '3D reconstruction', 'Data production'],
    },
    {
      period: '2020.07 – 2023.11',
      periodEn: '2020.07 – 2023.11',
      company: '正元地信',
      companyEn: 'Zhengyuan Geoinformation',
      title: 'WebGL 引擎研发',
      titleEn: 'WebGL Engine R&D',
      description:
        'GClient 数字地球引擎底层研发，深入图形学，扩展数据格式接入，优化性能，建设 GIS 分析与业务渲染管线。',
      descriptionEn:
        'Core R&D on the GClient digital earth engine: graphics, data format integration, performance optimization, GIS analysis and business-specific rendering pipelines.',
      tags: ['WebGL', 'GLSL', 'Cesium', '数字孪生'],
      tagsEn: ['WebGL', 'GLSL', 'Cesium', 'Digital twin'],
    },
    {
      period: '2018 – 2020.07',
      periodEn: '2018 – 2020.07',
      company: '中科图新',
      companyEn: 'Zhongke Tuxin',
      title: '数字地球引擎研发',
      titleEn: 'Digital Earth Engine R&D',
      description:
        'LocaSpace Viewer 引擎功能研发，面向交通规划、工程建设等行业，积累三维 GIS 数据加载、渲染与交互经验。',
      descriptionEn:
        'Developed features for the LocaSpace Viewer engine for transportation planning and engineering projects, building experience in 3D GIS data loading, rendering and interaction.',
      tags: ['C++', 'OpenGL', '数字地球'],
      tagsEn: ['C++', 'OpenGL', 'Digital earth'],
    },
  ],
} as const;

export type Site = typeof site;