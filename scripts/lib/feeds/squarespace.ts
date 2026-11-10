/**
 * A Squarespace site's events page, read as a visitor's browser gets it.
 *
 * Squarespace has no calendar feed a robot may read: its robots.txt, the
 * same on every site, disallows `?format=json`, `?format=ical`, `?view=`
 * and `/api/`. The plain events page is allowed, and where the page is set
 * to the list view it carries every upcoming event in its HTML, one
 * `<article class="eventlist-event …">` each:
 *
 *   <article class="eventlist-event eventlist-event--upcoming …">
 *     <h1 class="eventlist-title"><a href="/events/slug" class="eventlist-title-link">Title</a></h1>
 *     <time class="event-date" datetime="2026-11-14">Saturday, November 14, 2026</time>
 *     <time class="event-time-localized-start" datetime="2026-11-14">6:00 PM</time>
 *     <li class="eventlist-meta-address">Venue <a href="http://maps.google.com?q=350 Terry Street …">(map)</a></li>
 *     <a href="http://www.google.com/calendar/event?action=TEMPLATE&text=…&dates=20261115T010000Z/20261115T030000Z&location=…"
 *        class="eventlist-meta-export-google">Google Calendar</a>
 *     <div class="eventlist-excerpt"><p>…</p></div>
 *   </article>
 *
 * The "Google Calendar" link is the one place every template writes the
 * start and the end, as instants, whether or not the page prints a time
 * (Mountain Toad's prints the day alone). Those instants are in the SITE's
 * time zone setting, and the setting is often wrong: Mountain Toad's site
 * is on America/New_York and Timnath Beerwerks' on
 * America/Kentucky/Monticello (10 November 2026), each with events entered
 * in the taproom's own clock. So the instant is turned back into the clock
 * the site shows (its `"timeZone"` in the page's settings) and that clock
 * is read as Denver's, which is what a visitor to the page reads. Without
 * the link (a template with the export links off) the printed day and time
 * are read instead.
 *
 * A page set to the calendar grid (`sqs-events-collection-calendar`) has no
 * events in its HTML: the grid is filled by script from `/api/`, and the
 * list is at `?view=list`, both disallowed. `squarespaceView` says which
 * kind a page is so ingest can say why nothing was read.
 *
 * Squarespace has no recurrence: a weekly night is one item a week, each
 * with its own page, and the page's path is the item's id.
 */
import { TIME_ZONE, fromWallClock } from '../../../src/lib/dates.ts';
import { plainText, titleStatus, type FeedEvent, type Horizon } from './types.ts';

const ARTICLE = /<article\b[^>]*class="[^"]*\beventlist-event\b[^"]*"[^>]*>[\s\S]*?<\/article>/gi;

/** What the page is: a list of events, the script-filled calendar grid, or not an events page. */
export function squarespaceView(html: string): 'list' | 'calendar' | 'none' {
  if (/class="[^"]*\beventlist-event\b/i.test(html) || /class="[^"]*\beventlist\b[^"]*"/i.test(html)) return 'list';
  if (/sqs-events-collection-calendar/i.test(html)) return 'calendar';
  // The body's class names the collection type even when a list is empty.
  if (/\bcollection-type-events\b[^"]*\bview-list\b/i.test(html)) return 'list';
  return 'none';
}

/** The site's time zone setting, as the page's settings block gives it. */
export function squarespaceTimeZone(html: string): string | undefined {
  const zone = html.match(/"timeZone"\s*:\s*"([A-Za-z_]+(?:\/[A-Za-z_+\-0-9]+)+)"/)?.[1];
  if (!zone) return undefined;
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: zone });
    return zone;
  } catch {
    return undefined;
  }
}

/** The clock `date` shows in `tz`, read as that same clock in Denver. */
function asDenverClock(date: Date, tz: string): Date {
  if (tz === TIME_ZONE) return date;
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).formatToParts(date);
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value ?? '0');
  return fromWallClock(get('year'), get('month'), get('day'), get('hour'), get('minute'), get('second'), TIME_ZONE);
}

/** "20261115T010000Z" -> the instant. */
function parseStamp(stamp: string): Date | undefined {
  const m = stamp.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z$/);
  if (!m) return undefined;
  const date = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]), Number(m[4]), Number(m[5]), Number(m[6])));
  return Number.isNaN(date.getTime()) ? undefined : date;
}

/** "6:00 PM", "6 pm", "18:30" -> hours and minutes. */
function parseClockText(text: string): { hour: number; minute: number } | undefined {
  const twelve = text.match(/\b(\d{1,2})(?::(\d{2}))?\s*([ap])\.?m\b/i);
  if (twelve) {
    let hour = Number(twelve[1]) % 12;
    if (twelve[3]!.toLowerCase() === 'p') hour += 12;
    return { hour, minute: Number(twelve[2] ?? 0) };
  }
  const twentyFour = text.match(/\b([01]?\d|2[0-3]):([0-5]\d)\b/);
  if (twentyFour) return { hour: Number(twentyFour[1]), minute: Number(twentyFour[2]) };
  return undefined;
}

function attr(tag: string, name: string): string | undefined {
  const m = tag.match(new RegExp(`\\b${name}\\s*=\\s*"([^"]*)"`, 'i')) ?? tag.match(new RegExp(`\\b${name}\\s*=\\s*'([^']*)'`, 'i'));
  return m?.[1];
}

/** The first element whose class list holds `name`: its opening tag and what is inside it. */
function element(html: string, name: string, tag = '[a-z0-9]+'): { open: string; inner: string } | undefined {
  const m = html.match(new RegExp(`(<(${tag})\\b[^>]*class="[^"]*\\b${name}\\b[^"]*"[^>]*>)([\\s\\S]*?)</\\2>`, 'i'));
  return m ? { open: m[1]!, inner: m[3]! } : undefined;
}

function decodeParam(value: string): string {
  try {
    return decodeURIComponent(value.replace(/&amp;/g, '&').replace(/\+/g, ' '));
  } catch {
    return value;
  }
}

/** The times the "Google Calendar" link carries, as the site's clock read in Denver. */
function linkTimes(article: string, zone: string): { start: Date; end?: Date } | undefined {
  const href = article.match(/href="([^"]*calendar\/event\?[^"]*)"/i)?.[1];
  const dates = href?.replace(/&amp;/g, '&').match(/[?&]dates=([^&]+)/)?.[1];
  if (!dates) return undefined;
  const [a, b] = decodeParam(dates).split('/');
  const start = a ? parseStamp(a) : undefined;
  if (!start) return undefined;
  const end = b ? parseStamp(b) : undefined;
  return { start: asDenverClock(start, zone), end: end ? asDenverClock(end, zone) : undefined };
}

/** The day and time the page prints, for a template without the export links. */
function printedTimes(article: string): { start: Date; end?: Date; allDay: boolean } | undefined {
  const meta = element(article, 'eventlist-meta-date', 'li')?.inner ?? article;
  const days = [...meta.matchAll(/<time\b[^>]*class="[^"]*\bevent-date\b[^"]*"[^>]*>/gi)].map((m) => attr(m[0], 'datetime')).filter((d): d is string => !!d && /^\d{4}-\d{2}-\d{2}/.test(d));
  if (!days.length) return undefined;
  // The page prints each time twice, in 12 and 24 hours; the 12-hour span comes first.
  const twelve = element(meta, 'event-time-12hr', 'span')?.inner;
  const clocks = [...(twelve ?? meta).matchAll(/<time\b[^>]*class="[^"]*\bevent-time[^"]*"[^>]*>([\s\S]*?)<\/time>/gi)].map((m) => parseClockText(plainText(m[1]!))).filter((c): c is { hour: number; minute: number } => !!c);
  const at = (day: string, clock?: { hour: number; minute: number }) => {
    const [y, mo, d] = day.slice(0, 10).split('-').map(Number);
    return fromWallClock(y!, mo!, d!, clock?.hour ?? 0, clock?.minute ?? 0, 0, TIME_ZONE);
  };
  const first = days[0]!;
  const last = days[days.length - 1]!;
  if (!clocks.length) return { start: at(first), end: last !== first ? at(last) : undefined, allDay: true };
  const start = at(first, clocks[0]);
  const end = clocks.length > 1 ? at(last, clocks[clocks.length - 1]) : undefined;
  return { start, end: end && end.getTime() > start.getTime() ? end : undefined, allDay: false };
}

/**
 * "St. Vrain Cidery" and its street address as one location. The address is
 * the "Google Calendar" link's, "350 Terry Street, Longmont, CO, 80501,
 * United States", which keeps the comma between the street and the town
 * that the map link's "350 Terry Street Longmont, CO, 80501" drops.
 */
function locationOf(article: string): string | undefined {
  const item = element(article, 'eventlist-meta-address', 'li');
  const name = item ? plainText(item.inner.replace(/<a\b[\s\S]*?<\/a>/gi, ' ')).replace(/\s+/g, ' ').trim() : '';
  const param = (href: string | undefined, key: string) => href?.replace(/&amp;/g, '&').match(new RegExp(`[?&]${key}=([^&]*)`))?.[1];
  const calendar = param(article.match(/href="([^"]*calendar\/event\?[^"]*)"/i)?.[1], 'location');
  const map = param(item?.inner.match(/href="([^"]*maps[^"]*)"/i)?.[1], 'q');
  const raw = calendar ?? map;
  const address = raw
    ? plainText(decodeParam(raw))
        .replace(/,?\s*(United States|USA)\s*$/i, '')
        .replace(/\s+/g, ' ')
        .trim()
    : '';
  const parts = [name, address && address.toLowerCase() !== name.toLowerCase() ? address : ''].filter(Boolean);
  return parts.length ? parts.join(', ') : undefined;
}

/** Every event on the page inside the horizon, soonest first. */
export function readSquarespaceEvents(html: string, pageUrl: string, horizon: Horizon): FeedEvent[] {
  const zone = squarespaceTimeZone(html) ?? TIME_ZONE;
  const out: FeedEvent[] = [];
  const seen = new Set<string>();
  for (const [article] of html.matchAll(ARTICLE)) {
    const link = article.match(/<a\b[^>]*class="[^"]*\beventlist-title-link\b[^"]*"[^>]*>([\s\S]*?)<\/a>/i);
    const titleTag = article.match(/<a\b[^>]*class="[^"]*\beventlist-title-link\b[^"]*"[^>]*>/i)?.[0];
    const rawTitle = link ? plainText(link[1] ?? '').replace(/\s+/g, ' ').trim() : '';
    const href = titleTag ? attr(titleTag, 'href') : undefined;
    if (!rawTitle || !href) continue;
    let url: URL;
    try {
      url = new URL(href.replace(/&amp;/g, '&'), pageUrl);
    } catch {
      continue;
    }
    const linked = linkTimes(article, zone);
    const printed = linked ? undefined : printedTimes(article);
    const when = linked ?? printed;
    if (!when) continue;
    const { start, end } = when;
    if ((end ?? start).getTime() < horizon.from.getTime() || start.getTime() >= horizon.to.getTime()) continue;
    const uid = url.pathname.replace(/\/+$/, '') || url.pathname;
    if (seen.has(uid)) continue;
    seen.add(uid);
    const marked = titleStatus(rawTitle);
    const excerpt = element(article, 'eventlist-excerpt', 'div')?.inner;
    const cats = element(article, 'eventlist-cats', 'div')?.inner;
    out.push({
      uid,
      title: marked.title,
      start,
      end: end && end.getTime() > start.getTime() ? end : undefined,
      allDay: printed?.allDay ?? false,
      location: locationOf(article),
      url: url.toString(),
      description: excerpt ? plainText(excerpt) || undefined : undefined,
      categories: cats ? [...cats.matchAll(/<a\b[^>]*>([\s\S]*?)<\/a>/gi)].map((m) => plainText(m[1]!)).filter(Boolean) : [],
      status: marked.status ?? 'confirmed',
    });
  }
  return out.sort((a, b) => a.start.getTime() - b.start.getTime());
}
