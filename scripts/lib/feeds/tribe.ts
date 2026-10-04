/**
 * The Events Calendar's REST API (WordPress; "tribe"), which the Johnstown
 * Milliken libraries and Boulder County both expose at
 * /wp-json/tribe/events/v1/events. Paginated; the caller fetches, this maps.
 *
 * Times come as wall clock plus the site's time zone, and as UTC. The UTC
 * pair is taken when present, because it is the one the site computed with
 * its own zone rules; the wall clock is the fallback.
 */
import { TIME_ZONE, fromWallClock } from '../../../src/lib/dates.ts';
import { plainText, type FeedEvent, type Horizon } from './types.ts';

interface TribeEvent {
  id: number;
  status?: string;
  title?: string;
  url?: string;
  start_date?: string;
  end_date?: string;
  utc_start_date?: string;
  utc_end_date?: string;
  timezone?: string;
  all_day?: boolean;
  modified?: string;
  cost?: string;
  description?: string;
  venue?: { venue?: string; address?: string; city?: string; state_province?: string; zip?: string } | unknown[];
  categories?: Array<{ name?: string }>;
}

export interface TribePage {
  events?: TribeEvent[];
  next_rest_url?: string;
  total?: number;
}

function wall(text: string, tz: string): Date | undefined {
  const m = text.match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?$/);
  if (!m) return undefined;
  return fromWallClock(Number(m[1]), Number(m[2]), Number(m[3]), Number(m[4]), Number(m[5]), Number(m[6] ?? 0), tz);
}

function instant(local: string | undefined, utc: string | undefined, tz: string): Date | undefined {
  if (utc) {
    const d = wall(utc, 'UTC');
    if (d) return d;
  }
  return local ? wall(local, tz) : undefined;
}

/** The first page URL for events from `from` onward, with the largest page the API allows. */
export function tribeFirstPage(base: string, from: Date): string {
  const url = new URL(base);
  url.searchParams.set('per_page', '50');
  url.searchParams.set('start_date', from.toISOString().slice(0, 10));
  url.searchParams.set('status', 'publish');
  return url.toString();
}

export function readTribePage(page: TribePage, horizon: Horizon): FeedEvent[] {
  const out: FeedEvent[] = [];
  for (const e of page.events ?? []) {
    if (!e.title || !e.start_date) continue;
    const tz = e.timezone && e.timezone !== 'UTC' ? e.timezone : TIME_ZONE;
    const allDay = e.all_day === true;
    const start = allDay ? wall(`${e.start_date.slice(0, 10)} 00:00`, TIME_ZONE) : instant(e.start_date, e.utc_start_date, tz);
    if (!start) continue;
    const end = allDay
      ? e.end_date
        ? wall(`${e.end_date.slice(0, 10)} 00:00`, TIME_ZONE)
        : undefined
      : instant(e.end_date, e.utc_end_date, tz);
    if (start.getTime() >= horizon.to.getTime() || (end ?? start).getTime() < horizon.from.getTime()) continue;
    const venue = Array.isArray(e.venue) ? undefined : e.venue;
    const location = venue
      ? [venue.venue, venue.address, venue.city].filter((x) => typeof x === 'string' && x.trim()).join(', ') || undefined
      : undefined;
    out.push({
      uid: String(e.id),
      title: plainText(e.title),
      start,
      end,
      allDay,
      location,
      url: e.url,
      description: e.description ? plainText(e.description) : undefined,
      categories: (e.categories ?? []).map((c) => plainText(c.name ?? '')).filter(Boolean),
      cost: e.cost?.trim() || undefined,
      status: e.status && e.status !== 'publish' ? 'cancelled' : 'confirmed',
      lastModified: e.modified ? wall(e.modified, tz) : undefined,
    });
  }
  return out;
}
