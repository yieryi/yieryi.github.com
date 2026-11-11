import { existsSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import { createPrompt, getFlag } from './cli';

const prompt = createPrompt();
const today = new Date().toISOString().slice(0, 10);

console.log('\n新建文章\n');

const title = await prompt.ask('标题', '', getFlag('title'));
if (!title) {
  console.error('标题不能为空。');
  prompt.close();
  process.exit(1);
}

const slug = await prompt.ask(
  '文件名 slug（英文短横线）',
  `post-${today.replaceAll('-', '')}`,
  getFlag('slug'),
);
if (!/^[a-z0-9][a-z0-9-]*$/.test(slug)) {
  console.error('slug 只能包含小写字母、数字和短横线。');
  prompt.close();
  process.exit(1);
}

const description = await prompt.ask(
  '摘要（列表和 SEO 用）',
  '一句话说明这篇文章解决什么问题。',
  getFlag('description'),
);
const category = await prompt.ask('分类', 'Cesium', getFlag('category'));
const series = await prompt.ask('系列（可留空）', '', getFlag('series'));
const tagsRaw = await prompt.ask('标签（逗号分隔）', category, getFlag('tags'));
const tags = tagsRaw
  .split(/[,，]/)
  .map((tag) => tag.trim())
  .filter(Boolean);

const tagsYaml = `[${tags.map((tag) => JSON.stringify(tag)).join(', ')}]`;
const seriesLine = series ? `series: ${JSON.stringify(series)}\n` : '';

const content = `---
title: ${JSON.stringify(title)}
description: ${JSON.stringify(description)}
date: ${today}
updated: ${today}
category: ${JSON.stringify(category)}
${seriesLine}tags: ${tagsYaml}
draft: true
featured: false
---

## 背景

## 方案

## 实现

## 复盘
`;

const dir = new URL('../src/content/blog/', import.meta.url);
await mkdir(dir, { recursive: true });
const file = new URL(`${slug}.md`, dir);

if (existsSync(file)) {
  console.error(`文件已存在：src/content/blog/${slug}.md`);
  prompt.close();
  process.exit(1);
}

await writeFile(file, content, 'utf8');
prompt.close();

console.log(`\n已创建：src/content/blog/${slug}.md`);
console.log('提示：写完后把 frontmatter 里的 draft 改成 false。');
console.log('然后运行：bun run check && bun run dev\n');