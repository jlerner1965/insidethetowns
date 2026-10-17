/**
 * Reading a published event against its source again: the judgement a
 * re-check makes from a feed item or a fetched page, kept pure so it can be
 * tested on fixtures. scripts/recheck-events.ts does the fetching and the
 * writing.
 *
 * The standard is the content README's: a listing says only what its source
 * says. So a re-check can confirm (the date and the time are on the source,
 * and the check date moves), find a change (the source gives a different
 * time, an end time, a cancellation, or lists the event on another day), or
 * fail to tell either way (the page is rendered by JavaScript, sits behind a
 * bot challenge, or shows the date but no time). Only the first two write to
 * the file; the third is for a person, in the report.
 */
import { addDays, dayKey, formatTime, parseLocal, toWallClock } from '../../src/lib/dates.ts';
import { titleSimilarity } from './ingest.ts';
import type { FeedEvent } from './feeds/types.ts';

export interface RecheckEvent {
  slug: string;
  title: string;
  start: Date;
  end?: Date;
  allDay: boolean;
  repeat?: 'weekly';
  until?: Date;
  performances?: Date[];
  cost?: string;
  url?: string;
  source?: string;
  sourceId?: string;
  status: string;
}

export type Verdict = 'confirmed' | 'changed' | 'unconfirmed' | 'unreadable';

export interface Judgement {
  verdict: Verdict;
  /** One sentence a person can act on: what was found, where. */
  note: string;
  /** Side findings that do not decide the verdict: "the page does not say it is free". */
  asides: string[];
}

/** A title match loose enough for "Trivia Night" against "Trivia at MainStage", tight enough to pass "Open mic". */
const TITLE_MATCH = 0.4;

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

/**
 * The days an event is on between `from` (inclusive) and `to` (exclusive),
 * each as the occurrence's start: a one-off's day, each week of a repeat
 * through `until`, each performance of a run.
 */
export function occurrences(e: RecheckEvent, from: Date, to: Date): Date[] {
  const inWindow = (d: Date) => dayKey(d) >= dayKey(from) && dayKey(d) < dayKey(to);
  if (e.performances?.length) return e.performances.filter(inWindow);
  if (e.repeat === 'weekly') {
    const out: Date[] = [];
    const last = e.until ? dayKey(e.until) : dayKey(to);
    for (let d = e.start, n = 0; dayKey(d) <= last && dayKey(d) < dayKey(to) && n < 120; d = addDays(d, 7), n++) {
      if (inWindow(d)) out.push(d);
    }
    return out;
  }
  // A multi-day run (a festival with an end date on another day) counts on its first day.
  return inWindow(e.start) ? [e.start] : [];
}

/** The page's visible words: scripts, styles and tags gone, entities decoded, spaces collapsed. */
export function pageText(html: string): string {
  return decode(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ')
      .replace(/<br\s*\/?>|<\/(p|div|li|h[1-6]|tr|td|th)>/gi, ' \n')
      .replace(/<[^>]+>/g, ' '),
  )
    .replace(/[ \t ]+/g, ' ')
    .replace(/\s*\n\s*/g, '\n')
    .trim();
}

function decode(text: string): string {
  return text
    .replace(/&nbsp;|&#160;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;|&#34;/g, '"')
    .replace(/&#0?39;|&apos;|&#8217;|&rsquo;/g, '’')
    .replace(/&#8211;|&ndash;/g, '–')
    .replace(/&#(\d+);/g, (_, n: string) => String.fromCodePoint(Number(n)));
}

export interface LdEvent {
  name: string;
  startDate?: string;
  endDate?: string;
  eventStatus?: string;
}

/** Every schema.org Event in the page's JSON-LD, however nested (@graph, arrays, subtypes such as MusicEvent). */
export function jsonLdEvents(html: string): LdEvent[] {
  const out: LdEvent[] = [];
  const re = /<script[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    let parsed: unknown;
    try {
      parsed = JSON.parse(m[1]!.trim());
    } catch {
      continue;
    }
    walk(parsed, out);
  }
  return out;
}

function walk(node: unknown, out: LdEvent[]): void {
  if (Array.isArray(node)) {
    for (const n of node) walk(n, out);
    return;
  }
  if (!node || typeof node !== 'object') return;
  const o = node as Record<string, unknown>;
  const types = ([] as unknown[]).concat(o['@type'] ?? []).map(String);
  if (types.some((t) => /Event$/.test(t)) && typeof o.name === 'string') {
    out.push({
      name: o.name,
      startDate: typeof o.startDate === 'string' ? o.startDate : undefined,
      endDate: typeof o.endDate === 'string' ? o.endDate : undefined,
      eventStatus: typeof o.eventStatus === 'string' ? o.eventStatus : undefined,
    });
  }
  for (const key of ['@graph', 'itemListElement', 'item', 'subEvent', 'mainEntity']) {
    if (key in o) walk(o[key], out);
  }
}

/** "2026-10-20T15:00:00-06:00" or "2026-10-20T15:00" (no zone: Denver wall clock) as an instant, or undefined. */
export function ldInstant(text: string | undefined): Date | undefined {
  if (!text) return undefined;
  const t = text.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(t)) return parseLocal(t);
  if (/(Z|[+-]\d{2}:?\d{2})$/.test(t)) {
    const d = new Date(t);
    return Number.isNaN(d.getTime()) ? undefined : d;
  }
  try {
    return parseLocal(t.slice(0, 16));
  } catch {
    return undefined;
  }
}

/** The day and the wall-clock minutes a Date falls on in Denver. */
function wall(d: Date): { day: string; hm: string } {
  const w = toWallClock(d);
  return { day: w.slice(0, 10), hm: w.length > 10 ? w.slice(11, 16) : '00:00' };
}

/** A regex for the ways a page writes a day: "October 20, 2026", "Oct. 20", "20 October", "10/20/2026", "2026-10-20". */
export function dateRegex(d: Date): RegExp {
  const { day } = wall(d);
  const [y, mo, da] = day.split('-').map(Number) as [number, number, number];
  const month = MONTHS[mo - 1]!;
  const short = month.slice(0, 3) + (month === 'September' ? '(?:t)?' : '');
  const dayPart = `0?${da}(?:st|nd|rd|th)?`;
  const alts = [
    `\\b(?:${month}|${short}\\.?)\\s+${dayPart}(?!\\d)(?:,?\\s*${y})?`,
    `\\b${dayPart}\\s+(?:${month}|${short}\\.?)(?:,?\\s*${y})?\\b`,
    `\\b0?${mo}/0?${da}(?:/(?:${y}|${String(y).slice(2)}))?(?!\\d)`,
    `\\b${y}-${String(mo).padStart(2, '0')}-${String(da).padStart(2, '0')}\\b`,
  ];
  return new RegExp(alts.join('|'), 'i');
}

/** A regex for the ways a page writes a clock time: "7:00 PM", "7pm", "7 p.m.", "19:00". */
export function timeRegex(d: Date): RegExp {
  const { hm } = wall(d);
  const [h, m] = hm.split(':').map(Number) as [number, number];
  const h12 = h % 12 === 0 ? 12 : h % 12;
  const ampm = h < 12 ? '(?:am|a\\.m\\.?|a)' : '(?:pm|p\\.m\\.?|p)';
  const minutes = m === 0 ? '(?::00)?' : `:${String(m).padStart(2, '0')}`;
  const twelve = `\\b0?${h12}${minutes}\\s*${ampm}\\b`;
  const twentyFour = `\\b${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}\\b(?!\\s*(?:am|pm))`;
  return new RegExp(`${twelve}|${twentyFour}`, 'i');
}

function when(d: Date): string {
  const { day } = wall(d);
  const [, mo, da] = day.split('-').map(Number) as [number, number, number];
  return `${da} ${MONTHS[mo - 1]}`;
}

function costAside(e: RecheckEvent, text: string): string[] {
  if (!e.cost || !/^free\b/i.test(e.cost)) return [];
  return /\bfree\b|no charge|no cost|no cover|\$0\b|complimentary/i.test(text) ? [] : ['the source does not say the event is free; cost should come off unless it does'];
}

/**
 * What a fetched page says about one occurrence. Structured data decides
 * where a page has it; the visible text decides otherwise, and can confirm
 * but never on its own declare a change, since a page shows many times
 * (opening hours, other events) and a mismatch there is for a person.
 */
export function judgePage(e: RecheckEvent, occurrence: Date, html: string): Judgement {
  const text = pageText(html);
  const asides = costAside(e, text);
  if (text.length < 150) {
    return { verdict: 'unreadable', note: 'the page has almost no readable text (rendered by JavaScript, or a bot challenge); check it in a browser', asides };
  }
  const { day, hm } = wall(occurrence);
  const ld = jsonLdEvents(html).filter((x) => titleSimilarity(x.name, e.title) >= TITLE_MATCH);
  const sameDay = ld.map((x) => ({ x, start: ldInstant(x.startDate) })).find(({ start }) => start && wall(start).day === day);
  if (sameDay) {
    const { x, start } = sameDay;
    if (x.eventStatus && /cancel|postpone/i.test(x.eventStatus)) {
      return { verdict: 'changed', note: `the page's structured data lists "${x.name}" on ${when(occurrence)} as ${/cancel/i.test(x.eventStatus) ? 'canceled' : 'postponed'}`, asides };
    }
    if (e.allDay) return { verdict: 'confirmed', note: `"${x.name}" on ${when(occurrence)} in the page's structured data`, asides };
    const found = wall(start!).hm;
    if (found === hm) return { verdict: 'confirmed', note: `"${x.name}" at ${formatTime(start!)} on ${when(occurrence)} in the page's structured data`, asides };
    return { verdict: 'changed', note: `the page's structured data lists "${x.name}" at ${formatTime(start!)} on ${when(occurrence)}, not ${formatTime(occurrence)}`, asides };
  }
  if (ld.length) {
    const days = ld.map((x) => ldInstant(x.startDate)).filter((d): d is Date => !!d).map(when);
    return {
      verdict: 'changed',
      note: `the page's structured data has "${ld[0]!.name}" on ${days.join(', ') || 'no date'}, not ${when(occurrence)}`,
      asides,
    };
  }
  const m = dateRegex(occurrence).exec(text);
  if (!m) return { verdict: 'unconfirmed', note: `the page does not show ${when(occurrence)}`, asides };
  const near = text.slice(Math.max(0, m.index - 400), m.index + 600);
  if (/\b(cancell?ed|postponed)\b/i.test(near)) {
    return { verdict: 'changed', note: `the page says "${/\b(cancell?ed|postponed)\b/i.exec(near)![0]}" near ${when(occurrence)}`, asides };
  }
  if (e.allDay) return { verdict: 'confirmed', note: `${when(occurrence)} on the page`, asides };
  if (timeRegex(occurrence).test(near)) return { verdict: 'confirmed', note: `${when(occurrence)} and ${formatTime(occurrence)} on the page`, asides };
  const times = [...near.matchAll(/\b\d{1,2}(?::\d{2})?\s*(?:am|pm|a\.m\.|p\.m\.)/gi)].map((t) => t[0]).slice(0, 4);
  return {
    verdict: 'unconfirmed',
    note: `the page shows ${when(occurrence)} but not ${formatTime(occurrence)}${times.length ? ` (times near it: ${times.join(', ')})` : ''}`,
    asides,
  };
}

const normUrl = (u: string) => u.replace(/^https?:\/\/(www\.)?/, '').replace(/\/+$/, '').toLowerCase();

/**
 * What the organizer's own feed says about one occurrence. A feed is the
 * organizer's calendar in machine form, so the event on another day, when the
 * feed otherwise carries it, is a change, not a shrug; a title the feed never
 * mentions is left to a person, since organizers word things differently.
 */
export function judgeFeed(e: RecheckEvent, occurrence: Date, items: FeedEvent[], feedName: string): Judgement {
  const { day, hm } = wall(occurrence);
  const matches = (i: FeedEvent) => (i.url && e.url && normUrl(i.url) === normUrl(e.url)) || titleSimilarity(i.title, e.title) >= TITLE_MATCH;
  const onDay = items.filter((i) => wall(i.start).day === day && matches(i));
  const asides = e.cost && /^free\b/i.test(e.cost) && onDay[0] && !onDay[0].cost && !/\bfree\b/i.test(onDay[0].description ?? '') ? ['the feed gives no cost; "Free" should come off unless the organizer says so'] : [];
  if (!onDay.length) {
    const elsewhere = items.filter(matches).map((i) => when(i.start));
    if (elsewhere.length) {
      return { verdict: 'changed', note: `not on ${feedName} on ${when(occurrence)}; it has "${items.find(matches)!.title}" on ${[...new Set(elsewhere)].join(', ')}`, asides };
    }
    // Not on the feed at all: a feed lists what its calendar module holds,
    // and a title the organizer words differently matches nothing, so this
    // is a question for a person, not a flag.
    const last = items.reduce<Date | undefined>((acc, i) => (!acc || i.start > acc ? i.start : acc), undefined);
    const covers = last && wall(last).day >= day;
    return {
      verdict: 'unconfirmed',
      note: covers ? `${feedName} runs past ${when(occurrence)} and has nothing by this title; check the organizer's page` : `${feedName} does not reach ${when(occurrence)} yet`,
      asides,
    };
  }
  const item = onDay.find((i) => i.url && e.url && normUrl(i.url) === normUrl(e.url)) ?? onDay[0]!;
  if (item.status === 'cancelled') return { verdict: 'changed', note: `${feedName} marks "${item.title}" on ${when(occurrence)} cancelled`, asides };
  if (e.allDay || item.allDay) return { verdict: 'confirmed', note: `"${item.title}" on ${when(occurrence)} on ${feedName}`, asides };
  const found = wall(item.start).hm;
  if (found !== hm) {
    return { verdict: 'changed', note: `${feedName} lists "${item.title}" at ${formatTime(item.start)} on ${when(occurrence)}, not ${formatTime(occurrence)}`, asides };
  }
  if (e.end && item.end) {
    // The end time matters too: it is what the page's time range says.
    const ourEnd = wall(e.end).hm;
    const theirEnd = wall(item.end).hm;
    const sameShape = wall(e.end).day === wall(e.start).day && wall(item.end).day === wall(item.start).day;
    if (sameShape && ourEnd !== theirEnd) {
      return { verdict: 'changed', note: `${feedName} lists "${item.title}" ${formatTime(item.start)}–${formatTime(item.end)} on ${when(occurrence)}; the listing ends ${formatTime(e.end)}`, asides };
    }
  }
  return { verdict: 'confirmed', note: `"${item.title}" at ${formatTime(item.start)} on ${when(occurrence)} on ${feedName}`, asides };
}
