/** /rss.xml — this town's guides and articles, newest first. */
import type { APIRoute } from 'astro';
import { getTown } from '@/config';
import { getTownEntries } from '@/lib/content';
import { buildRss, rssResponse, type FeedItem } from '@/lib/rss';

export const GET: APIRoute = async ({ site }) => {
  const town = getTown();
  const articles = (await getTownEntries('articles')).sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
  const items: FeedItem[] = articles.map((article) => ({
    title: article.data.title,
    link: new URL(`/articles/${article.slug}/`, site).toString(),
    description: article.data.excerpt,
    pubDate: article.data.updated ?? article.data.date,
    categories: [article.data.category],
  }));
  return rssResponse(
    buildRss({
      title: `${town.siteTitle} — guides`,
      description: town.tagline,
      link: new URL('/', site).toString(),
      self: new URL('/rss.xml', site).toString(),
      items,
    }),
  );
};
