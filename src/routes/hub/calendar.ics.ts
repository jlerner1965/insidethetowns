/**
 * /calendars/<name>.ics on the hub: a calendar a reader subscribes to. One
 * per town page (its traditions and its own outdoor dates, not the
 * statewide ones) and one per season page (every town's date of that
 * kind). Only dates still ahead that the organizer has set
 * (src/lib/tradition-calendar.ts): all-day unless the start time is
 * certain, and never an end that was not published. A feed with nothing
 * ahead is an empty calendar, so a subscription made in spring is still
 * there when autumn's dates are announced.
 */
import type { APIRoute } from 'astro';
import { getHub } from '@/config';
import { getTraditions } from '@/lib/content';
import { dayKey } from '@/lib/dates';
import { placeRows, publishedHubTowns } from '@/lib/hub-towns';
import { buildIcs, type IcsEvent } from '@/lib/ics';
import { traditionCalendarEvent } from '@/lib/tradition-calendar';
import { TRADITION_TYPES, TRADITION_TYPE_INFO, seasonRows, type TraditionRow } from '@/lib/traditions';

export async function getStaticPaths() {
  const hub = getHub();
  const today = dayKey(new Date());
  const records = await getTraditions();
  const events = (rows: readonly TraditionRow[], pageUrl: string): IcsEvent[] =>
    rows.flatMap((row) => traditionCalendarEvent(row, { domain: hub.domain, pageUrl }) ?? []);
  const towns = publishedHubTowns(records).map((town) => {
    const { traditions, outdoor } = placeRows(records, town.slug, today);
    return { params: { name: town.slug }, props: { title: `${town.name}, Colorado: annual events and outdoor dates`, events: events([...traditions, ...outdoor], `https://${hub.domain}/${town.slug}/`) } };
  });
  const seasons = TRADITION_TYPES.flatMap((type) => {
    const rows = seasonRows(records, type, today);
    const info = TRADITION_TYPE_INFO[type];
    return rows.length ? [{ params: { name: info.path.replace(/\//g, '') }, props: { title: `${info.plural} in Colorado`, events: events(rows, `https://${hub.domain}${info.path}`) } }] : [];
  });
  return [...towns, ...seasons];
}

export const GET: APIRoute = ({ props, params }) => {
  const hub = getHub();
  const body = buildIcs(props.events as IcsEvent[], { name: `${props.title} — ${hub.siteTitle}`, domain: hub.domain });
  return new Response(body, {
    headers: { 'Content-Type': 'text/calendar; charset=utf-8', 'Content-Disposition': `inline; filename="${params.name}.ics"` },
  });
};
