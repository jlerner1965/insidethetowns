/**
 * ShoWare, the box-office system behind tickets.rialtotheatercenter.org (the
 * City of Loveland's Rialto Theater Center). The ticket site's own event
 * list is drawn by script from
 * /include/widgets/events/performancelist.asp?action=perf&page=N, fifteen
 * performances a page with `perfCount` for the total, so that endpoint is
 * what a visitor sees and is read here as the feed.
 *
 * Each row is one performance: `PerformanceDateTime` and
 * `PerformanceEndDateTime` as "Sunday, October 25, 2026 5:00:00 PM" in the
 * venue's own clock (America/Denver; the row's `TimeZone` says MST all
 * year), `Venue`, `VenueAddress` and `VenueCity`, `PerformanceMinPrice` and
 * `PerformanceMaxPrice`, and `Event`, the series title as the box office
 * writes it: "RIALTO PRESENTS Stray Cat Lee Rocker", "BACKSTAGE RIALTO
 * PRESENTS 2026 Rialto Theater Ghost Tours", "Mom's Unhinged Stand-Up Comedy
 * Show (rental) 10/2026", "*CANCELLED* Dreamboat Annie presents…". The
 * presenter prefix and suffix, the rental tag and the month come off the title;
 * a cancelled marker, or `ManualStatus` 4 (the value the cancelled row
 * carried on 20 October 2026), is read as the status.
 */
import { TIME_ZONE, fromWallClock } from '../../../src/lib/dates.ts';
import { plainText, type FeedEvent, type Horizon } from './types.ts';

export interface ShowarePerformance {
  PerformanceID?: number | string;
  EventID?: number | string;
  Event?: string;
  PerformanceName?: string;
  PerformanceDateTime?: string;
  PerformanceEndDateTime?: string;
  Venue?: string;
  VenueAddress?: string;
  VenueCity?: string;
  Description?: string;
  Organizer?: string;
  PerformanceMinPrice?: number | string;
  PerformanceMaxPrice?: number | string;
  ManualStatus?: number | string;
}

export interface ShowarePage {
  performance?: ShowarePerformance[];
  perfCount?: number | string;
}


/** Whether a feed URL is a ShoWare performance list, the one JSON shape read here. */
export function isShowareFeed(feedUrl: string): boolean {
  return /\/include\/widgets\/events\/performancelist\.asp/i.test(feedUrl);
}

/** The list's page `n`, with the action the site's own script sends. */
export function showarePage(base: string, n: number): string {
  const url = new URL(base);
  url.searchParams.set('action', 'perf');
  url.searchParams.set('page', String(n));
  return url.toString();
}

/**
 * Whether more pages remain after `readSoFar` rows, by the feed's own count.
 * The page size is the site's (the Rialto sends fifteen, the Lincoln Center
 * twenty), so the rows read are counted rather than assumed.
 */
export function showareHasMore(page: ShowarePage, readSoFar: number): boolean {
  const total = Number(page.perfCount ?? 0);
  const got = page.performance?.length ?? 0;
  return got > 0 && readSoFar < total;
}

const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];

/** "Sunday, October 25, 2026 5:00:00 PM" in the venue's clock -> an instant. */
export function parseShowareDate(text: string | undefined): Date | undefined {
  const m = text?.trim().match(/^(?:[A-Za-z]+,\s*)?([A-Za-z]+)\s+(\d{1,2}),\s*(\d{4})\s+(\d{1,2}):(\d{2})(?::(\d{2}))?\s*([AP])M$/i);
  if (!m) return undefined;
  const month = MONTHS.indexOf(m[1]!.toLowerCase());
  if (month === -1) return undefined;
  let hour = Number(m[4]) % 12;
  if (m[7]!.toUpperCase() === 'P') hour += 12;
  return fromWallClock(Number(m[3]), month + 1, Number(m[2]), hour, Number(m[5]), Number(m[6] ?? 0), TIME_ZONE);
}

const CANCELLED_RE = /\*?\s*cancell?ed\s*\*?/i;

/** The series title without the box office's labels: the presenter, the rental tag, the month. */
export function showareTitle(event: string): string {
  return plainText(event)
    .replace(CANCELLED_RE, ' ')
    .replace(/^\s*(?:backstage\s+)?rialto\s+presents\s+/i, '')
    // "2026 Rialto Theater Ghost Tours": the year is the box office's filing, not the name.
    .replace(/^\s*20\d{2}\s+(?=[A-Za-z])/, '')
    .replace(/^\s*film\s+/i, '')
    .replace(/\(rental\)/gi, ' ')
    // "… | Presented by The Lincoln Center": the house's credit, not the name.
    .replace(/\s*\|\s*presented by\b.*$/i, '')
    // "11/2026", "11/07/26", "5/8/27": the box office's filing date, not the name.
    .replace(/\s+\d{1,2}\/(?:\d{1,2}\/)?\d{2,4}\s*$/, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function price(min: number | string | undefined, max: number | string | undefined): string | undefined {
  const lo = Number(min);
  const hi = Number(max);
  if (!Number.isFinite(lo) || lo <= 0) return undefined;
  const fmt = (n: number) => (Number.isInteger(n) ? `$${n}` : `$${n.toFixed(2)}`);
  return Number.isFinite(hi) && hi > lo ? `${fmt(lo)}–${fmt(hi).slice(1)}` : fmt(lo);
}

export function readShowarePage(page: ShowarePage, origin: string, horizon: Horizon): FeedEvent[] {
  const out: FeedEvent[] = [];
  for (const p of page.performance ?? []) {
    const rawTitle = p.Event ?? p.PerformanceName ?? '';
    const start = parseShowareDate(p.PerformanceDateTime);
    if (!rawTitle || !start || p.PerformanceID == null) continue;
    const endParsed = parseShowareDate(p.PerformanceEndDateTime);
    const end = endParsed && endParsed.getTime() > start.getTime() ? endParsed : undefined;
    if (start.getTime() >= horizon.to.getTime() || (end ?? start).getTime() < horizon.from.getTime()) continue;
    // The address field repeats itself ("228 E 4th St 228 E 4th St").
    const address = (p.VenueAddress ?? '').trim().replace(/^(.+?)\s+\1$/, '$1');
    const location = [p.Venue, address, p.VenueCity].map((s) => (s ?? '').trim()).filter(Boolean).join(', ') || undefined;
    const cancelled = CANCELLED_RE.test(rawTitle) || Number(p.ManualStatus) === 4;
    out.push({
      uid: `showare:${p.PerformanceID}`,
      title: showareTitle(rawTitle),
      start,
      end,
      allDay: false,
      location,
      url: p.EventID != null ? `${origin}/eventperformances.asp?evt=${p.EventID}` : undefined,
      description: p.Description
        ? plainText(p.Description)
            .split('\n')
            .map((l) => l.trim())
            .join('\n') || undefined
        : undefined,
      categories: [],
      cost: price(p.PerformanceMinPrice, p.PerformanceMaxPrice),
      status: cancelled ? 'cancelled' : 'confirmed',
    });
  }
  return out;
}
