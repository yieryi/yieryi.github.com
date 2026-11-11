const ogByCategory: Record<string, string> = {
  Cesium: '/og/cesium.png',
  GIS: '/og/gis.png',
  前端工程: '/og/frontend.png',
  'Frontend Engineering': '/og/frontend.png',
};

export function ogImageForCategory(category?: string): string {
  if (!category) return '/og/default.png';
  return ogByCategory[category] ?? '/og/default.png';
}