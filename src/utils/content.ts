export function readingTime(body?: string): number {
  if (!body) return 1;
  const chinese = (body.match(/[\u4e00-\u9fa5]/g) ?? []).length;
  const words = (body.replace(/[\u4e00-\u9fa5]/g, ' ').match(/[a-zA-Z0-9_]+/g) ?? []).length;
  return Math.max(1, Math.round(chinese / 300 + words / 200));
}

export function formatDate(date: Date, style: 'short' | 'long' = 'short'): string {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: style === 'long' ? 'long' : '2-digit',
    day: '2-digit',
  }).format(date);
}

export function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function tagHref(tag: string): string {
  return `/writing/tag/${encodeURIComponent(tag)}/`;
}

export function seriesHref(series: string): string {
  return `/writing/series/${encodeURIComponent(series)}/`;
}