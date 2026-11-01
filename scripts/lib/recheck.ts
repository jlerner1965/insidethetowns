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
import type { ConfidenceBasis, ConfidenceLevel } from '../../src/lib/confidence.ts';
import { addDays, dayKey, formatTime, fromWallClock, parseLocal, toWallClock } from '../../src/lib/dates.ts';
import { titleTokens } from './ingest.ts';
import type { FeedEvent } from './feeds/types.ts';

export interface RecheckEvent {
  slug: string;
  title: string;
  /** The venue, whose words do not count toward a title match. */
  venue?: string;
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

/**
 * Whether two titles name the same event, on the words that are not the
 * venue's. "Karaoke at the Wayback Bar" and "Trivia Game (WayBack Bar)" share
 * two of five words, enough to pass on raw overlap; without the venue they
 * share none.
 */
export function sameTitle(a: string, b: string, venue?: string): boolean {
  const skip = venue ? titleTokens(venue) : new Set<string>();
  const x = [...titleTokens(a)].filter((w) => !skip.has(w));
  const y = new Set([...titleTokens(b)].filter((w) => !skip.has(w)));
  if (!x.length || !y.size) return false;
  const shared = x.filter((w) => y.has(w)).length;
  return shared / (x.length + y.size - shared) >= TITLE_MATCH;
}

/**
 * The source page for one date of a series, where the calendar gives each
 * date its own address ("/event/old-time-jam/2026-10-28/", The Events
 * Calendar's form): a file for 11 November that cites the 28 October page is
 * checked against the 11 November page, not marked as moved.
 */
export function occurrenceUrl(source: string, occurrence: Date): string {
  const day = dayKey(occurrence);
  return source.replace(/\/(\d{4}-\d{2}-\d{2})\/?$/, (m, d: string) => (d === day ? m : `/${day}/`));
}

/** Any date a page might write: "Aug 5, 2026", "October 24th", "10/23/26", "2026-10-21". */
const ANY_DATE = /\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sept?|Oct|Nov|Dec)[a-z]*\.?\s+\d{1,2}(?:st|nd|rd|th)?(?:,?\s*\d{4})?|\b\d{1,2}\/\d{1,2}(?:\/\d{2,4})?\b|\b\d{4}-\d{2}-\d{2}\b/gi;

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

/**
 * A regex for the ways a page writes a clock time. "6:00 PM", "6 pm", "6pm",
 * "6 p.m." and "18:00" are all six o'clock; so are "6:00" on its own, "6 to
 * 8:30 pm" (the am/pm carried by the end of the range), and "doors 6" or
 * "at 6". A bare "6" anywhere else is a number, not a time.
 */
export function timeRegex(d: Date): RegExp {
  const { hm } = wall(d);
  const [h, m] = hm.split(':').map(Number) as [number, number];
  const h12 = h % 12 === 0 ? 12 : h % 12;
  const ampm = h < 12 ? '(?:am|a\\.m\\.?|a)' : '(?:pm|p\\.m\\.?|p)';
  const wrong = h < 12 ? '(?:pm|p\\.m)' : '(?:am|a\\.m)';
  const minutes = m === 0 ? '(?::00)?' : `:${String(m).padStart(2, '0')}`;
  const exact = m === 0 ? ':00' : `:${String(m).padStart(2, '0')}`;
  const hour = `\\b0?${h12}`;
  const alts = [
    `${hour}${minutes}\\s*${ampm}\\b`,
    // "6 to 8:30 pm", "6:00–8:30 PM": the am/pm sits on the end of the range
    `${hour}${minutes}\\s*(?:-|–|—|to|until)\\s*\\d{1,2}(?::\\d{2})?\\s*${ampm}\\b`,
    // "6:00" with no am/pm at all
    `${hour}${exact}\\b(?!\\s*${wrong})(?!\\s*(?:-|–|—|to|until)\\s*\\d{1,2}(?::\\d{2})?\\s*${wrong})`,
    // "doors 6", "at 6", "from 6", "@ 6"
    `\\b(?:at|doors|from|@)\\s*0?${h12}${m === 0 ? '' : exact}\\b(?!:)(?!\\s*${wrong})`,
    `\\b${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}\\b(?!\\s*(?:am|pm))`,
  ];
  return new RegExp(alts.join('|'), 'i');
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
  const ld = jsonLdEvents(html)
    .filter((x) => sameTitle(x.name, e.title, e.venue))
    .map((x) => ({ x, start: ldInstant(x.startDate) }))
    .filter((d): d is { x: LdEvent; start: Date } => !!d.start);
  const sameDay = ld.filter(({ start }) => wall(start).day === day);
  // The visible text, read for the date, the time, and a cancellation next to the event's own name.
  const m = dateRegex(occurrence).exec(text);
  const near = m ? text.slice(Math.max(0, m.index - 400), m.index + 600) : '';
  const textTime = !!m && timeRegex(occurrence).test(near);
  const called = m ? cancellation(text, e.title, e.venue, occurrence) : undefined;

  if (sameDay.length) {
    const off = sameDay.find(({ x }) => x.eventStatus && /cancel|postpone/i.test(x.eventStatus));
    // A show that plays twice in a day is two items; the one at this time is the one that counts.
    const atTime = sameDay.find(({ start }) => wall(start).hm === hm);
    const status = (atTime ?? (e.allDay ? sameDay[0] : undefined))?.x.eventStatus ?? (sameDay.length === 1 ? off?.x.eventStatus : undefined);
    if (status && /cancel|postpone/i.test(status)) {
      return { verdict: 'changed', note: `the page's structured data lists "${sameDay[0]!.x.name}" on ${when(occurrence)} as ${/cancel/i.test(status) ? 'canceled' : 'postponed'}`, asides };
    }
    if (e.allDay) return { verdict: 'confirmed', note: `"${sameDay[0]!.x.name}" on ${when(occurrence)} in the page's structured data`, asides };
    if (atTime) return { verdict: 'confirmed', note: `"${atTime.x.name}" at ${formatTime(atTime.start)} on ${when(occurrence)} in the page's structured data`, asides };
    if (textTime) return { verdict: 'confirmed', note: `${when(occurrence)} and ${formatTime(occurrence)} on the page`, asides };
    // Midnight is a date with no time; a time off by exactly the UTC offset is a site clock set to UTC, not a moved event.
    const timed = sameDay.filter(({ start }) => wall(start).hm !== '00:00' && !utcSlip(start, occurrence));
    if (timed.length) {
      const times = [...new Set(timed.map(({ start }) => formatTime(start)))].join(', ');
      return { verdict: 'changed', note: `the page's structured data lists "${timed[0]!.x.name}" at ${times} on ${when(occurrence)}, not ${formatTime(occurrence)}`, asides };
    }
  }
  if (!m) {
    // Structured data for another date of a series is no evidence about this one; a person looks.
    const other = ld.length ? `; its structured data has "${ld[0]!.x.name}" on ${[...new Set(ld.map(({ start }) => when(start)))].slice(0, 3).join(', ')}` : '';
    return { verdict: 'unconfirmed', note: `the page does not show ${when(occurrence)}${other}`, asides };
  }
  if (called) return { verdict: 'changed', note: `the page says "${called}"`, asides };
  if (e.allDay) return { verdict: 'confirmed', note: `${when(occurrence)} on the page`, asides };
  if (textTime) return { verdict: 'confirmed', note: `${when(occurrence)} and ${formatTime(occurrence)} on the page`, asides };
  const times = [...near.matchAll(/\b\d{1,2}(?::\d{2})?\s*(?:am|pm|a\.m\.|p\.m\.)/gi)].map((t) => t[0]).slice(0, 4);
  return {
    verdict: 'unconfirmed',
    note: `the page shows ${when(occurrence)} but not ${formatTime(occurrence)}${times.length ? ` (times near it: ${times.join(', ')})` : ''}`,
    asides,
  };
}

/** A time off from the listing's by exactly Denver's distance from UTC that day: a site whose clock is set to UTC. */
function utcSlip(found: Date, listed: Date): boolean {
  const diff = Math.abs(found.getTime() - listed.getTime()) / 60_000;
  const offset = Math.abs(new Date(`${toWallClock(listed).slice(0, 10)}T12:00:00Z`).getTime() - parseLocalNoon(listed).getTime()) / 60_000;
  return diff === offset;
}

function parseLocalNoon(d: Date): Date {
  const [y, mo, da] = wall(d).day.split('-').map(Number) as [number, number, number];
  return fromWallClock(y, mo, da, 12, 0, 0);
}

/**
 * "Cancelled" or "postponed" said of this event: the word in the same
 * sentence as most of the event's own words. A page listing a season says it
 * of other events too (Elizabeth's, 17 October 2026: "End of Summer Bash,
 * August 15th, CANCELLED" on the page for Halloween Haven), while a box
 * office puts it in the title ("*CANCELLED* … Journey to the Heart of
 * Zeppelin 10/23/26", the Rialto's, the same day). And it has to be said of
 * this date: Erie's Planning Commission page marks the 5 August meeting
 * "CANCELED" above every meeting to come.
 */
export function cancellation(text: string, title: string, venue: string | undefined, occurrence: Date): string | undefined {
  const skip = venue ? titleTokens(venue) : new Set<string>();
  const words = [...titleTokens(title)].filter((w) => !skip.has(w));
  if (!words.length) return undefined;
  for (const hit of text.matchAll(/\b(cancell?ed|postponed)\b/gi)) {
    const at = hit.index!;
    // The sentence around the word, at most 200 characters each way.
    const before = text.slice(Math.max(0, at - 200), at);
    const start = Math.max(0, at - 200) + Math.max(before.search(/[.!?\n][^.!?\n]*$/) + 1, 0);
    const after = text.slice(at + hit[0].length, at + hit[0].length + 200);
    const stop = after.search(/[.!?\n]/);
    const sentence = text.slice(start, at + hit[0].length + (stop === -1 ? after.length : stop));
    const there = titleTokens(sentence);
    if (words.filter((w) => there.has(w)).length < Math.ceil(words.length / 2)) continue;
    // Whose date: the nearest one before the word, as a listing gives it
    // ("Aug 5, 2026 … Planning Commission Meeting - CANCELED"), or, with none
    // before, the nearest after ("*CANCELLED* … Zeppelin 10/23/26").
    const lo = Math.max(0, at - 200);
    const mentions = [...text.slice(lo, at + hit[0].length + 200).matchAll(ANY_DATE)].map((d) => ({ at: lo + d.index!, said: d[0] }));
    const whose = mentions.filter((d) => d.at < at).at(-1) ?? mentions.find((d) => d.at > at);
    if (whose && dateRegex(occurrence).test(whose.said)) return sentence.replace(/\s+/g, ' ').trim();
  }
  return undefined;
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
  const matches = (i: FeedEvent) => (i.url && e.url && normUrl(i.url) === normUrl(e.url)) || sameTitle(i.title, e.title, e.venue);
  const onDay = items.filter((i) => wall(i.start).day === day && matches(i));
  const asides = e.cost && /^free\b/i.test(e.cost) && onDay[0] && !onDay[0].cost && !/\bfree\b/i.test(onDay[0].description ?? '') ? ['the feed gives no cost; "Free" should come off unless the organizer says so'] : [];
  if (!onDay.length) {
    const last = items.reduce<Date | undefined>((acc, i) => (!acc || i.start > acc ? i.start : acc), undefined);
    const reaches = !!last && wall(last).day >= day;
    const elsewhere = items.filter(matches).map((i) => when(i.start));
    // A town's feed runs a few weeks ahead; a meeting past its end is not missing from it.
    if (elsewhere.length && !reaches) {
      return { verdict: 'unconfirmed', note: `${feedName} does not reach ${when(occurrence)} yet`, asides };
    }
    if (elsewhere.length) {
      return { verdict: 'changed', note: `not on ${feedName} on ${when(occurrence)}; it has "${items.find(matches)!.title}" on ${[...new Set(elsewhere)].join(', ')}`, asides };
    }
    // Not on the feed at all: a feed lists what its calendar module holds,
    // and a title the organizer words differently matches nothing, so this
    // is a question for a person, not a flag.
    return {
      verdict: 'unconfirmed',
      note: reaches ? `${feedName} runs past ${when(occurrence)} and has nothing by this title; check the organizer's page` : `${feedName} does not reach ${when(occurrence)} yet`,
      asides,
    };
  }
  // Which of the day's items is this one: the one at this time; else the
  // one whose page the listing cites; else the one within half an hour. A
  // matinee and an evening show, or two storytimes, share a title and a
  // day, and taking the first in feed order read CSU's 7:30 pm concert as
  // moved to 2 pm (1 November 2026). The time comes before the page because
  // a production's file cites one show's page for every show (that concert
  // cited the matinee's). With several left at other times, the note names
  // them all rather than one of them as the new time.
  const minutes = (d: Date) => {
    const [h, m] = wall(d).hm.split(':').map(Number);
    return h! * 60 + m!;
  };
  const byPage = onDay.find((i) => i.url && e.url && normUrl(i.url) === normUrl(e.url));
  const exact = onDay.find((i) => !i.allDay && wall(i.start).hm === hm);
  const close = onDay.filter((i) => !i.allDay && Math.abs(minutes(i.start) - minutes(occurrence)) <= 30);
  const item = exact ?? byPage ?? (close.length === 1 ? close[0]! : onDay.length === 1 ? onDay[0]! : undefined);
  if (!item) {
    const times = [...new Set(onDay.map((i) => (i.allDay ? 'all day' : formatTime(i.start))))];
    return { verdict: 'changed', note: `${feedName} lists "${onDay[0]!.title}" at ${times.join(' and ')} on ${when(occurrence)}, not ${formatTime(occurrence)}`, asides };
  }
  if (item.status !== 'confirmed') return { verdict: 'changed', note: `${feedName} marks "${item.title}" on ${when(occurrence)} ${item.status}`, asides };
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

/** What the call list decides from: the re-check's verdict on an event and the event's standing today. */
export interface CallInput {
  verdict: Verdict | 'gone';
  note: string;
  /** The event's confidence today (src/lib/confidence.ts): confirmed or listed, and on what. */
  level: ConfidenceLevel;
  basis: ConfidenceBasis;
  /** The community calendar the event rests on, when it does. */
  calendar?: string;
  /** A weekly series' last shown date, when its confirmed weeks stop short of `until`. */
  until?: Date;
  /** Today, the start of the Denver day. */
  from: Date;
}

/** A series whose confirmed weeks run out within this many days is on the call list before its dates go. */
export const FADING_DAYS = 14;

/**
 * Why a venue should be rung about an event, or undefined when no call is
 * due. A listed event (a community calendar's, or a check gone stale) needs
 * one whatever a page says; a series about to run out of confirmed weeks
 * needs one too. Otherwise a call is for what no machine could read, and
 * not when a person has already made it: an event with a recent `confirmed`
 * block (`npm run confirm`) is the organizer's word, and a page that refuses
 * automated reads does not put it back on the list every night.
 */
export function callReason(c: CallInput): string | undefined {
  const stillListed = c.level === 'listed' && !(c.verdict === 'confirmed' && !c.calendar);
  if (stillListed) return c.basis === 'calendar' ? 'only on a community calendar' : 'check gone stale';
  if (c.until && dayKey(c.until) < dayKey(addDays(c.from, FADING_DAYS))) return `series shown only through ${dayKey(c.until)}`;
  if (c.level === 'confirmed' && c.basis !== 'source') return undefined;
  if (c.verdict === 'unreadable') return 'page cannot be read';
  // A feed that does not reach the date yet will; that is not a call.
  if (c.verdict === 'unconfirmed' && !/does not reach/.test(c.note)) return 'page does not show it';
  return undefined;
}

/** A place on the guide, as far as matching a venue to it needs. */
export interface PlaceName {
  title: string;
}

/**
 * The guide's own listing for an event's venue, so the call list can give
 * its phone number, or undefined when the guide has none. One name must hold
 * the other whole: "Oskar Blues" is "Oskar Blues Grill & Brew", and "Lyons
 * Regional Library, Effie Banta Room" is "Lyons Regional Library". A word in
 * common is not enough, since a wrong match prints the wrong number: "Lyons
 * Town Hall" is not "Hall Ranch", "Harmony Library" is not "Austin's
 * American Grill, Harmony". Each part of a venue between commas is tried as
 * a name of its own ("Castorena's Equine Center, The Ranch Events Complex");
 * a parenthesis is set aside on both sides ("Erie Town Hall (Lincoln
 * School)"); the town's own name does not count ("Lyons Town Hall" is not
 * "A-Lodge Lyons"); and a name left with one word matches only that word
 * ("Niwot Hall" is the Niwot Hall listing, "Downtown Fort Collins" no
 * listing at all). The closest fit wins: "Windsor Town Hall" over "Severance
 * Town Hall".
 */
export function placeFor<P extends PlaceName>(venue: string, list: readonly P[], townName: string): P | undefined {
  const skip = titleTokens(townName);
  const words = (s: string) => new Set([...titleTokens(s.replace(/\([^)]*\)/g, ' '))].filter((w) => !skip.has(w)));
  const names = [venue, ...(venue.includes(',') ? venue.split(',') : [])].map(words).filter((s) => s.size);
  let best: { p: P; fit: number } | undefined;
  for (const v of names) {
    for (const p of list) {
      const t = words(p.title);
      if (!t.size) continue;
      const [small, big] = v.size <= t.size ? [v, t] : [t, v];
      if (![...small].every((w) => big.has(w))) continue;
      if (small.size === 1 && big.size > 1) continue;
      const fit = small.size / big.size;
      if (!best || fit > best.fit) best = { p, fit };
    }
  }
  return best?.p;
}
