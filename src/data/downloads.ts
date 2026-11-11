export interface DownloadItem {
  id: string;
  title: string;
  description: string;
  file: string;
  type: string;
  size: string;
  version: string;
  updated: string;
  tags: string[];
  sha256?: string;
  actionLabel?: string;
}

export const downloads: DownloadItem[] = [
  {
    id: 'resume',
    title: '个人简历（打印 / PDF）',
    description:
      '在线简历页，按 A4 排版。打开后使用浏览器“打印 → 另存为 PDF”即可导出。',
    file: '/resume/',
    type: 'HTML / Print',
    size: '—',
    version: '2026.11',
    updated: '2026-11-11',
    tags: ['简历', 'PDF'],
    actionLabel: '打开简历',
  },
  {
    id: 'sample-buildings',
    title: '示例建筑白模 GeoJSON',
    description:
      '包含 3 个建筑面要素和高度字段，可用于演示三维拉伸、空间查询或数据加载流程。',
    file: '/downloads/sample-buildings.geojson',
    type: 'GeoJSON',
    size: '1.4 KB',
    version: '1.0',
    updated: '2026-11-11',
    tags: ['GIS', '示例数据', 'GeoJSON'],
    sha256: '5f8ac2a7d9aa68f9469ed2b447416a5e94092ec195827b3f678efd5f69169553',
  },
  {
    id: 'cesium-demo-index',
    title: 'Cesium / GClient 示例索引',
    description:
      '早期三维引擎示例的结构化索引，包含交互、渲染、管线与内涝模拟等方向，适合做 Demo 重做清单。',
    file: '/downloads/cesium-demo-index.json',
    type: 'JSON',
    size: '2.4 KB',
    version: '2026.11',
    updated: '2026-11-11',
    tags: ['Cesium', 'GClient', '索引'],
    sha256: '7f034be330a0e603423b12c8894877554f011ed0ee8db5de69a88cff6eb2a2a7',
  },
  {
    id: 'cesium-panorama-video',
    title: 'Cesium 三维地球融合全景 · 演示视频',
    description:
      '对应文章《Cesium 三维地球融合全景效果》的演示录屏，展示三维地球与全景视图的无缝过渡。',
    file: '/assets/videos/Cesium/cesiumPanorama.mp4',
    type: 'MP4',
    size: '4.0 MB',
    version: '1.0',
    updated: '2021-09-06',
    tags: ['Cesium', '全景', '视频'],
    sha256: '5b4d6f8b3f07daa2eeef6077d3a41df58acb14cec44587ab14fd0544e24f0e14',
  },
  {
    id: 'cesium-label-video',
    title: 'Cesium Label 遮挡检测 · 演示视频',
    description:
      '对应文章《Cesium 中 Label 的遮挡检测》的演示录屏，对比遮挡处理前后的显示效果。',
    file: '/assets/videos/Cesium/avoidLabelOverlap.mp4',
    type: 'MP4',
    size: '3.6 MB',
    version: '1.0',
    updated: '2021-02-20',
    tags: ['Cesium', 'Label', '视频'],
    sha256: 'c779b62dfa1a4c991177ef3ffa3f8e7cabf5f56eb9bd8f24da326af0730b0767',
  },
];