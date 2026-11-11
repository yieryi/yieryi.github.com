import { defaultLang, languages, ui, type Lang, type UiKey } from './ui';
export type { Lang };

export function getLangFromUrl(url: URL): Lang {
  const [, first] = url.pathname.split('/');
  return first === 'en' ? 'en' : defaultLang;
}

export function useTranslations(lang: Lang) {
  return function t(key: UiKey): string {
    return ui[lang][key] ?? ui[defaultLang][key];
  };
}

export function localizePath(path: string, lang: Lang): string {
  const clean = path.startsWith('/') ? path : `/${path}`;
  if (lang === defaultLang) return clean;
  if (clean === '/') return '/en/';
  return `/en${clean}`;
}

export function stripLocale(pathname: string): string {
  if (pathname === '/en' || pathname === '/en/') return '/';
  if (pathname.startsWith('/en/')) return pathname.slice(3) || '/';
  return pathname;
}

const seriesPairs = [
  { zh: 'Cesium 实战', en: 'Cesium in Practice' },
  { zh: '前端基础', en: 'Frontend Fundamentals' },
  { zh: 'GIS 数据与工具', en: 'GIS Data & Tools' },
];

export function switchLangPath(pathname: string, lang: Lang): string {
  const stripped = stripLocale(pathname);

  if (stripped === '/404/' || stripped === '/404.html') {
    return lang === 'zh' ? '/404.html' : '/en/404/';
  }

  let decoded = stripped;
  try {
    decoded = decodeURIComponent(stripped);
  } catch {
    // Keep the original path if it is not valid percent-encoding.
  }

  const seriesMatch = decoded.match(/^\/writing\/series\/(.+)\/$/);
  if (seriesMatch) {
    const name = seriesMatch[1];
    const pair = seriesPairs.find((item) => item.zh === name || item.en === name);
    if (pair) {
      const target = lang === 'zh' ? pair.zh : pair.en;
      return localizePath(`/writing/series/${encodeURIComponent(target)}/`, lang);
    }
  }

  return localizePath(stripped, lang);
}

export function alternatePaths(pathname: string) {
  return {
    zh: switchLangPath(pathname, 'zh'),
    en: switchLangPath(pathname, 'en'),
  };
}

export function languageName(lang: Lang): string {
  return languages[lang];
}

export function isEnglish(pathname: string): boolean {
  return pathname === '/en' || pathname.startsWith('/en/');
}