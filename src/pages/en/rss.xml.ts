import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getCollection } from 'astro:content';
import { site } from '../../data/site';
import { postTitle, postDescription } from '../../utils/content';

export async function GET(context: APIContext) {
  const posts = (await getCollection('blog', ({ data }) => !data.draft)).sort(
    (a, b) => b.data.date.valueOf() - a.data.date.valueOf(),
  );

  return rss({
    title: `${site.name} · ${site.roleEn}`,
    description: site.descriptionEn,
    site: context.site ?? site.url,
    items: posts.map((post) => ({
      title: postTitle(post, 'en'),
      description: postDescription(post, 'en'),
      pubDate: post.data.date,
      link: `/en/writing/${post.id}/`,
      categories: [post.data.categoryEn ?? post.data.category, ...post.data.tags],
    })),
    customData: '<language>en</language>',
  });
}