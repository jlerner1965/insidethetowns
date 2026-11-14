/**
 * /dates/<slug>.ics on the hub: one tradition's or outdoor date's next date
 * as a calendar entry, for "Add to calendar" on the season and town pages
 * (src/lib/tradition-calendar.ts). Built only for a record with a date
 * still ahead; all-day unless its start time is certain.
 */
import type { APIRoute } from 'astro';
import { getHub } from '@/config';
import { getTraditions } from '@/lib/content';
import { dayKey } from '@/lib/dates';
import { buildIcs } from '@/lib/ics';
import { traditionCalendarEvent } from '@/lib/tradition-calendar';
import { TRADITION_TYPE_INFO, CURRENT_SEASONS, nextRow } from '@/lib/traditions';
import { eventPath, publishedHubTowns } from '@/lib/hub-towns';

export async function getStaticPaths() {
  const hub = getHub();
  const today = dayKey(new Date());
  const records = await getTraditions();
  const published = new Set(publishedHubTowns(records).map((t) => t.slug));
  return records.flatMap((record) => {
    const row = nextRow(record, today);
    const info = TRADITION_TYPE_INFO[record.type];
    // "More:" in the entry: the record's own page where it has one, else its season page, else its source.
    const own = eventPath(record, published);
    const page = own ? `https://${hub.domain}${own}` : CURRENT_SEASONS[record.type] ? `https://${hub.domain}${info.path}` : row.source;
    const event = traditionCalendarEvent(row, { domain: hub.domain, pageUrl: page });
    return event ? [{ params: { slug: record.slug }, props: { event, name: record.name } }] : [];
  });
}

export const GET: APIRoute = ({ props }) => {
  const hub = getHub();
  const body = buildIcs([props.event], { name: `${props.name} — ${hub.siteTitle}`, domain: hub.domain });
  return new Response(body, { headers: { 'Content-Type': 'text/calendar; charset=utf-8' } });
};
