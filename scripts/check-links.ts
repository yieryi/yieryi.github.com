import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, extname, join, resolve } from 'node:path';

const dist = resolve('dist');

if (!existsSync(dist)) {
  console.error('未找到 dist/，请先运行 bun run build。');
  process.exit(1);
}

const walk = (dir: string): string[] =>
  readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });

const htmlFiles = walk(dist).filter((file) => extname(file) === '.html');
const checked = new Set<string>();
const missing: Array<{ from: string; link: string; resolved: string }> = [];

const isExternal = (link: string) =>
  /^(https?:)?\/\//.test(link) ||
  /^(mailto:|tel:|data:|javascript:)/.test(link) ||
  link.startsWith('#');

const exists = (target: string): boolean => {
  if (existsSync(target)) {
    const stat = statSync(target);
    if (stat.isFile()) return true;
    if (stat.isDirectory()) return existsSync(join(target, 'index.html'));
  }

  if (existsSync(`${target}.html`)) {
    return true;
  }

  return false;
};

for (const file of htmlFiles) {
  const html = readFileSync(file, 'utf8');
  const relativeFile = file.replace(`${dist}/`, '');

  for (const match of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    const raw = match[1];
    if (isExternal(raw)) continue;

    const pathPart = raw.split('#')[0].split('?')[0];
    if (!pathPart) continue;

    let target: string;
    try {
      target = pathPart.startsWith('/')
        ? join(dist, decodeURIComponent(pathPart))
        : resolve(dirname(file), decodeURIComponent(pathPart));
    } catch {
      missing.push({ from: relativeFile, link: raw, resolved: 'invalid encoding' });
      continue;
    }

    const key = `${file}::${target}`;
    if (checked.has(key)) continue;
    checked.add(key);

    if (!exists(target)) {
      missing.push({ from: relativeFile, link: raw, resolved: target.replace(`${dist}/`, '') });
    }
  }
}

console.log(`检查了 ${htmlFiles.length} 个 HTML 文件，${checked.size} 个内部链接。`);

if (missing.length > 0) {
  console.error(`\n发现 ${missing.length} 个失效链接：`);
  for (const item of missing.slice(0, 50)) {
    console.error(`- ${item.from} -> ${item.link} (${item.resolved})`);
  }
  if (missing.length > 50) {
    console.error(`... 还有 ${missing.length - 50} 个`);
  }
  process.exit(1);
}

console.log('所有内部链接和静态资源均存在。');