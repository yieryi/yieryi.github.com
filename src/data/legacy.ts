export interface LegacyRedirect {
  from: string;
  to: string;
}

/**
 * 旧 Jekyll 站点使用 /:year/:month/:day/:title 作为永久链接。
 * 这里保留旧地址，生成静态跳转页，避免已有外链失效。
 */
export const legacyRedirects: LegacyRedirect[] = [
  { from: '/work/gclient-webgl-engine', to: '/work/webgl-digital-earth-engine/' },
  { from: '/en/work/gclient-webgl-engine', to: '/en/work/webgl-digital-earth-engine/' },
  { from: '/work/amap-hd-map-3d-platform', to: '/work/hd-map-3d-platform/' },
  { from: '/en/work/amap-hd-map-3d-platform', to: '/en/work/hd-map-3d-platform/' },
  { from: '/work/lsv-digital-earth-engine', to: '/work/desktop-digital-earth-engine/' },
  { from: '/en/work/lsv-digital-earth-engine', to: '/en/work/desktop-digital-earth-engine/' },
  {
    from: '/2021/02/20/Labels-avoid-overlap',
    to: '/writing/cesium-labels-avoid-overlap/',
  },
  {
    from: '/2021/09/06/Cesium三维地球融合全景效果',
    to: '/writing/cesium-panorama/',
  },
  {
    from: '/2022/07/24/批量迁移Cesium Sandcastle示例到其他示例框架的实践总结',
    to: '/writing/cesium-sandcastle-migration/',
  },
  {
    from: '/2021/03/19/CommonJS.AMD.CMD.UMD.ES6模块规范',
    to: '/writing/js-module-specs/',
  },
  {
    from: '/2021/08/16/下载谷歌地球卫星影像地图',
    to: '/writing/google-earth-satellite-download/',
  },
  {
    from: '/2025/05/18/WIP-cesiumjs-汇总-图文版',
    to: '/writing/cesium-demo-index/',
  },
];