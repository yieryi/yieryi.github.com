import type { CollectionEntry } from 'astro:content';
import { localizePath, type Lang } from '../i18n/utils';

export function readingTime(body?: string): number {
  if (!body) return 1;
  const chinese = (body.match(/[\u4e00-\u9fa5]/g) ?? []).length;
  const words = (body.replace(/[\u4e00-\u9fa5]/g, ' ').match(/[a-zA-Z0-9_]+/g) ?? []).length;
  return Math.max(1, Math.round(chinese / 300 + words / 200));
}

export function formatDate(date: Date, style: 'short' | 'long' = 'short', lang: Lang = 'zh'): string {
  return new Intl.DateTimeFormat(lang === 'zh' ? 'zh-CN' : 'en', {
    year: 'numeric',
    month: style === 'long' ? 'long' : '2-digit',
    day: '2-digit',
  }).format(date);
}

export function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function tagHref(tag: string, lang: Lang = 'zh'): string {
  return localizePath(`/writing/tag/${encodeURIComponent(tag)}/`, lang);
}

export function seriesHref(series: string, lang: Lang = 'zh'): string {
  return localizePath(`/writing/series/${encodeURIComponent(series)}/`, lang);
}

export function postTitle(post: CollectionEntry<'blog'>, lang: Lang): string {
  return lang === 'en' ? (post.data.titleEn ?? post.data.title) : post.data.title;
}

export function postDescription(post: CollectionEntry<'blog'>, lang: Lang): string {
  return lang === 'en' ? (post.data.descriptionEn ?? post.data.description) : post.data.description;
}

export function postCategory(post: CollectionEntry<'blog'>, lang: Lang): string {
  return lang === 'en' ? (post.data.categoryEn ?? post.data.category) : post.data.category;
}

export function postSeries(post: CollectionEntry<'blog'>, lang: Lang): string | undefined {
  if (lang === 'en') return post.data.seriesEn ?? post.data.series;
  return post.data.series;
}