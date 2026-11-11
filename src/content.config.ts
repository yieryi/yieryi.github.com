import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    titleEn: z.string().optional(),
    description: z.string(),
    descriptionEn: z.string().optional(),
    date: z.coerce.date(),
    updated: z.coerce.date().optional(),
    category: z.string(),
    categoryEn: z.string().optional(),
    series: z.string().optional(),
    seriesEn: z.string().optional(),
    tags: z.array(z.string()).default([]),
    cover: z.string().optional(),
    draft: z.boolean().default(false),
    featured: z.boolean().default(false),
    legacy: z.string().optional(),
  }),
});

const projectSchema = z.object({
  title: z.string(),
  titleEn: z.string().optional(),
  summary: z.string(),
  summaryEn: z.string().optional(),
  role: z.string(),
  roleEn: z.string().optional(),
  period: z.string(),
  periodEn: z.string().optional(),
  stack: z.array(z.string()).default([]),
  order: z.number().default(99),
  cover: z.enum(['engine', 'gis', 'map', 'data']).default('engine'),
  featured: z.boolean().default(false),
});

const projects = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/projects' }),
  schema: projectSchema,
});

const projectsEn = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/projects-en' }),
  schema: projectSchema,
});

export const collections = { blog, projects, projectsEn };