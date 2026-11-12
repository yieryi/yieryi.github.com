export const site = {
  name: '萧安',
  nameEn: 'XIAO AN',
  handle: 'WANGKANG',
  role: '三维地理空间工程师',
  roleEn: '3D Geospatial Engineer',
  tagline: '把真实世界，变成可计算、可渲染的三维地图。',
  taglineEn: 'Turning the real world into computable, renderable 3D maps.',
  description:
    '萧安（WANGKANG）的个人技术主页。关注三维渲染引擎、GIS 几何计算、三维建模与高精地图数据生产。',
  descriptionEn:
    'XIAO AN (WANGKANG) — 3D geospatial engineer working on rendering engines, GIS geometry, 3D modeling and HD map data production.',
  keywords: [
    '萧安',
    'WANGKANG',
    '三维 GIS',
    'Cesium',
    'WebGL',
    '三维渲染引擎',
    'GIS 几何计算',
    '高精地图',
    '三维重建',
  ],
  keywordsEn: [
    'XIAO AN',
    'WANGKANG',
    '3D GIS',
    'Cesium',
    'WebGL',
    '3D rendering engine',
    'GIS geometry',
    'HD map',
    '3D reconstruction',
  ],
  github: 'https://github.com/yieryi',
  githubIssues: 'https://github.com/yieryi/yieryi.github.com/issues',
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

} as const;

export type Site = typeof site;