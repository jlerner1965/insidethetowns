/**
 * Eventbrite, read from the pages a visitor's browser gets.
 *
 * Eventbrite shut its public event search API in 2020, and what is left of
 * the API lists only the events of the account whose token asks. The site
 * itself is open to ordinary robots (its robots.txt disallows its internal
 * /api/v3/destination/ search and a few parameters, not these pages) and
 * each page carries the events it shows as data:
 *
 * - An organizer's page, eventbrite.com/o/<name>-<id>: a Next.js page whose
 *   `__NEXT_DATA__` holds `props.pageProps.upcomingEvents`. One organizer,
 *   their own events: the nearest thing Eventbrite has to a venue's feed.
 * - A place's page, eventbrite.com/d/co--niwot/all-events/: `window.
 *   __SERVER_DATA__` holds `search_data.events.results`, twenty a page. It
 *   is a search of the region, not the town (4,910 results in 49 pages for
 *   Niwot on 10 November 2026, twelve of the first twenty in Boulder), and
 *   lists everyone's events, so it wants a `locationFilter` and a person's
 *   review. `?page=2` is the next twenty.
 *
 * Both write an event the same way: `start_date` "2026-11-14" and
 * `start_time` "18:30" (or "18:30:00") as the clock in `timezone`,
 * `primary_venue` with a name and an address, `is_cancelled`,
 * `is_online_event`, `summary`, and on an organizer's page
 * `ticket_availability` with the lowest price and whether it has sold out.
 * An organizer's page gives the end as the start again (Streetside Dance,
 * 14 November 2026: 18:30 to 18:30 where the search page says 20:30), so
 * an end that is not after the start is dropped.
 *
 * Eventbrite's terms of service restrict automated collection; a source of
 * this type is the owner's decision, one organizer or one place at a time,
 * like any other (DECISIONS.md, "Eventbrite", 10 November 2026).
 */
import { TIME_ZONE, fromWallClock } from '../../../src/lib/dates.ts';
import { plainText, titleStatus, type FeedEvent, type Horizon } from './types.ts';

export interface EventbriteEvent {
  id?: string;
  eid?: string;
  name?: string;
  url?: string;
  summary?: string | null;
  start_date?: string;
  start_time?: string;
  end_date?: string;
  end_time?: string;
  timezone?: string;
  is_cancelled?: boolean | null;
  is_online_event?: boolean | null;
  primary_venue?: {
    name?: string;
    address?: { address_1?: string; city?: string; region?: string; postal_code?: string; localized_address_display?: string };
  } | null;
  ticket_availability?: {
    is_free?: boolean;
    is_sold_out?: boolean;
    minimum_ticket_price?: { major_value?: string; currency?: string } | null;
    maximum_ticket_price?: { major_value?: string; currency?: string } | null;
  } | null;
}

/** Whether a URL is one of the two Eventbrite pages read here. */
export function eventbritePageKind(url: string): 'organizer' | 'place' | undefined {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return undefined;
  }
  if (!/(^|\.)eventbrite\.(com|co\.uk|ca|com\.au)$/i.test(parsed.hostname)) return undefined;
  if (/^\/o\/[^/]+\/?$/.test(parsed.pathname)) return 'organizer';
  if (/^\/d\/[^/]+\/[^/]+\/?$/.test(parsed.pathname)) return 'place';
  return undefined;
}

/** A place page's page `n`: the same address with `?page=n`. */
export function eventbritePlacePage(base: string, n: number): string {
  const url = new URL(base);
  if (n > 1) url.searchParams.set('page', String(n));
  else url.searchParams.delete('page');
  return url.toString();
}

/** The JSON object that starts at the first "{" at or after `from`, by counting braces outside strings. */
function objectAt(text: string, from: number): unknown {
  const start = text.indexOf('{', from);
  if (start === -1) return undefined;
  let depth = 0;
  let inString = false;
  for (let i = start; i < text.length; i++) {
    const ch = text[i];
    if (inString) {
      if (ch === '\\') i++;
      else if (ch === '"') inString = false;
    } else if (ch === '"') inString = true;
    else if (ch === '{') depth++;
    else if (ch === '}' && --depth === 0) {
      try {
        return JSON.parse(text.slice(start, i + 1));
      } catch {
        return undefined;
      }
    }
  }
  return undefined;
}

export interface EventbritePage {
  events: EventbriteEvent[];
  /** A place page: how many pages the search has. */
  pageCount?: number;
  /** An organizer's page: more events than the page holds. */
  more?: boolean;
}

/** The events a page carries, or undefined if it is neither kind of page. */
export function eventbritePageData(html: string): EventbritePage | undefined {
  const next = html.match(/<script\b[^>]*id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/i)?.[1];
  if (next) {
    try {
      const props = (JSON.parse(next) as { props?: { pageProps?: { upcomingEvents?: EventbriteEvent[]; hasMoreUpcoming?: boolean } } }).props?.pageProps;
      if (props && Array.isArray(props.upcomingEvents)) return { events: props.upcomingEvents, more: !!props.hasMoreUpcoming };
    } catch {
      /* not this page */
    }
  }
  const at = html.indexOf('window.__SERVER_DATA__');
  if (at !== -1) {
    const data = objectAt(html, at) as { search_data?: { events?: { results?: EventbriteEvent[]; pagination?: { page_count?: number } } } } | undefined;
    const found = data?.search_data?.events;
    if (found && Array.isArray(found.results)) return { events: found.results, pageCount: found.pagination?.page_count };
  }
  return undefined;
}

/** "2026-11-14" and "18:30" or "18:30:00" in the event's zone -> the instant. */
function clock(date: string | undefined, time: string | undefined, zone: string): Date | undefined {
  const d = date?.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!d) return undefined;
  const t = time?.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
  return fromWallClock(Number(d[1]), Number(d[2]), Number(d[3]), t ? Number(t[1]) : 0, t ? Number(t[2]) : 0, 0, zone);
}

function validZone(zone: string | undefined): string {
  if (!zone) return TIME_ZONE;
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: zone });
    return zone;
  } catch {
    return TIME_ZONE;
  }
}

function costOf(event: EventbriteEvent): string | undefined {
  const tickets = event.ticket_availability;
  if (!tickets) return undefined;
  const sold = tickets.is_sold_out ? ' (sold out when read)' : '';
  if (tickets.is_free) return `Free${sold}`;
  const low = Number(tickets.minimum_ticket_price?.major_value);
  const high = Number(tickets.maximum_ticket_price?.major_value);
  if (!Number.isFinite(low) || low <= 0) return sold ? `Sold out when read` : undefined;
  const money = (n: number) => `$${Number.isInteger(n) ? n : n.toFixed(2)}`;
  return `${Number.isFinite(high) && high > low ? `${money(low)} to ${money(high)}` : `From ${money(low)}`}, fees included${sold}`;
}

/** The page's events inside the horizon, in person only, soonest first. */
export function readEventbriteEvents(events: EventbriteEvent[], horizon: Horizon): FeedEvent[] {
  const out: FeedEvent[] = [];
  const seen = new Set<string>();
  for (const event of events) {
    const uid = String(event.id ?? event.eid ?? '').trim();
    const name = plainText(event.name ?? '').replace(/\s+/g, ' ').trim();
    if (!uid || !name || seen.has(uid) || event.is_online_event) continue;
    const zone = validZone(event.timezone);
    const start = clock(event.start_date, event.start_time, zone);
    if (!start) continue;
    const rawEnd = clock(event.end_date, event.end_time, zone);
    const end = rawEnd && rawEnd.getTime() > start.getTime() ? rawEnd : undefined;
    if ((end ?? start).getTime() < horizon.from.getTime() || start.getTime() >= horizon.to.getTime()) continue;
    seen.add(uid);
    const venue = event.primary_venue;
    const address = venue?.address;
    const street = address?.address_1?.trim();
    const town = [address?.city, [address?.region, address?.postal_code].filter(Boolean).join(' ')].filter(Boolean).join(', ');
    const where = [venue?.name?.trim(), street && street !== venue?.name?.trim() ? street : '', town].filter(Boolean).join(', ');
    const marked = titleStatus(name);
    let url: string | undefined;
    try {
      // The ticket page without the tracking a search result adds to it.
      const parsed = new URL(event.url ?? '');
      url = `${parsed.origin}${parsed.pathname}`;
    } catch {
      url = undefined;
    }
    out.push({
      uid,
      title: marked.title,
      start,
      end,
      allDay: !event.start_time,
      location: where || undefined,
      url,
      description: event.summary ? plainText(event.summary) || undefined : undefined,
      categories: [],
      cost: costOf(event),
      status: event.is_cancelled ? 'cancelled' : (marked.status ?? 'confirmed'),
    });
  }
  return out.sort((a, b) => a.start.getTime() - b.start.getTime());
}
