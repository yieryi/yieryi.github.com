import type { Lang } from './utils';

const enTagLabels: Record<string, string> = {
  遮挡: 'Overlap',
  全景: 'Panorama',
  自动化: 'Automation',
  爬虫: 'Crawler',
  瓦片: 'Tiles',
  影像下载: 'Imagery download',
  示例: 'Examples',
  三维引擎: '3D engine',
};

export function tagLabel(tag: string, lang: Lang): string {
  return lang === 'en' ? (enTagLabels[tag] ?? tag) : tag;
}