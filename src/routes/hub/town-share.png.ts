/**
 * /share/<town>.png on the hub: a town page's share card, 1200×630, for a
 * town with no photograph of its own (a town with one shares the
 * photograph; src/routes/hub/town.astro). Text only, drawn at build
 * (src/lib/share-image.ts): the town, its next date where one is set, and
 * its county. Nothing is on the card that is not on the page.
 */
import type { APIRoute } from 'astro';
import { getHub } from '@/config';
import { hubCountyLine, type HubTown } from '@/config/hub-towns';
import { getTraditions } from '@/lib/content';
import { dayKey, formatDayLong, parseLocal } from '@/lib/dates';
import { nextUp, placeRows, publishedHubTowns } from '@/lib/hub-towns';
import { renderShareCard } from '@/lib/share-image';

export async function getStaticPaths() {
  const records = await getTraditions();
  const today = dayKey(new Date());
  return publishedHubTowns(records).map((town) => {
    const { traditions, outdoor } = placeRows(records, town.slug, today);
    const next = nextUp(traditions, outdoor);
    const line = next ? `Next: ${next.record.name}, ${formatDayLong(parseLocal(next.entry.date!))}, ${next.entry.date!.slice(0, 4)}` : 'Annual events and outdoor dates';
    return { params: { town: town.slug }, props: { town, line } };
  });
}

export const GET: APIRoute = async ({ props }) => {
  const hub = getHub();
  const { town, line } = props as { town: HubTown; line: string };
  const body = await renderShareCard({
    color: hub.colors.primary,
    title: `${town.name}, Colorado`,
    record: line,
    footer: `${hubCountyLine(town)} · ${hub.siteTitle}`,
  });
  return new Response(new Uint8Array(body), { headers: { 'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=86400' } });
};
