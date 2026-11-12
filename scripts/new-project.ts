import { existsSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import { createPrompt, getFlag } from './cli';

const prompt = createPrompt();

console.log('\n新建项目案例\n');

const title = await prompt.ask('项目标题', '', getFlag('title'));
if (!title) {
  console.error('标题不能为空。');
  prompt.close();
  process.exit(1);
}

const slug = await prompt.ask(
  '文件名 slug（英文短横线）',
  `project-${Date.now()}`,
  getFlag('slug'),
);
if (!/^[a-z0-9][a-z0-9-]*$/.test(slug)) {
  console.error('slug 只能包含小写字母、数字和短横线。');
  prompt.close();
  process.exit(1);
}

const summary = await prompt.ask('一句话摘要', '一句话说明项目价值。', getFlag('summary'));
const stackRaw = await prompt.ask(
  '技术栈（逗号分隔）',
  'TypeScript, WebGL, Cesium',
  getFlag('stack'),
);
const stack = stackRaw
  .split(/[,，]/)
  .map((item) => item.trim())
  .filter(Boolean);
const cover = await prompt.ask('封面类型 engine / gis / map / data', 'engine', getFlag('cover'));
const order = await prompt.ask('排序（数字越小越靠前）', '99', getFlag('order'));

const stackYaml = `[${stack.map((item) => JSON.stringify(item)).join(', ')}]`;
const coverValue = ['engine', 'gis', 'map', 'data'].includes(cover) ? cover : 'engine';

const content = `---
title: ${JSON.stringify(title)}
summary: ${JSON.stringify(summary)}
stack: ${stackYaml}
order: ${Number(order) || 99}
cover: ${coverValue}
featured: false
---

> 说明：本文仅描述公开可说的技术方向与个人贡献，不包含公司数据、内部截图或未公开指标。

## 背景

## 技术工作

## 关键设计

## 结果

## 复盘
`;

const dir = new URL('../src/content/projects/', import.meta.url);
await mkdir(dir, { recursive: true });
const file = new URL(`${slug}.mdx`, dir);

if (existsSync(file)) {
  console.error(`文件已存在：src/content/projects/${slug}.mdx`);
  prompt.close();
  process.exit(1);
}

await writeFile(file, content, 'utf8');
prompt.close();

console.log(`\n已创建：src/content/projects/${slug}.mdx`);
console.log('完成后运行：bun run check && bun run dev\n');