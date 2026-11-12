/**
 * /updates.rss — this guide's local changes, newest first: what changed,
 * who it affects and what to do, each linking to its row on /updates/ and
 * naming its source. Built for any guide with an updates folder
 * (src/integrations/town-routes.ts). The thirty most recent, current or
 * archived: a feed reader keeps what it has already seen.
 */
import type { APIRoute } from 'astro';
import { getTown } from '@/config';
import { getTownEntries } from '@/lib/content';
import { buildRss, rssResponse } from '@/lib/rss';
import { updateFeedItems } from '@/lib/updates';

export const GET: APIRoute = async ({ site }) => {
  const town = getTown();
  const items = updateFeedItems(await getTownEntries('updates'), new URL('/updates/', site).toString());
  return rssResponse(
    buildRss({
      title: `${town.siteTitle} — local changes`,
      description: `What changed in ${town.name}, Colorado: closures, road and park work, public decisions and openings, each dated and sourced.`,
      link: new URL('/updates/', site).toString(),
      self: new URL('/updates.rss', site).toString(),
      items,
    }),
  );
};
