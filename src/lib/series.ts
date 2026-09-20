/**
 * Which event page of a recurring series is the one to index.
 *
 * A recurring event is stored as one markdown file per occurrence, so a
 * council meeting that runs twice a month becomes a dozen pages differing only
 * in the date. One of them should be indexed and the rest marked noindex and
 * kept out of the sitemap, so the series is searchable once rather than
 * competing with itself.
 *
 * Which one matters. Picking the earliest file pins the indexed page to an
 * occurrence that recedes further into the past every month, while the
 * occurrence a reader could actually attend carries noindex and is missing
 * from the sitemap. Three series across the network were in that state. The
 * canonical occurrence is therefore the soonest one that has not happened yet,
 * and only when the whole series is over does it fall back to the most recent,
 * so a finished series stays reachable instead of vanishing entirely.
 *
 * The rule lives here, in one place, because two callers need it at different
 * moments: the sitemap integration, while Astro's config is still loading and
 * only the raw markdown is readable, and the event page, which has the parsed
 * collection. Both go through `pickCanonical`.
 */
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { dayKey } from './dates.ts';

export interface Occurrence {
  slug: string;
  /** Title and venue together: what makes two files the same series. */
  key: string;
  /** Denver calendar day the occurrence starts, "2026-10-03". */
  startDay: string;
  /** Last Denver day it is on, inclusive. Equal to startDay for a one-day event. */
  lastDay: string;
}

/**
 * The slug to index for each series, keyed by series.
 *
 * `todayKey` is a Denver day string so it compares directly against
 * `startDay`; an occurrence today still counts as upcoming.
 */
/** Only the three fields the choice actually turns on, so callers that have
 *  parsed entries rather than raw markdown need not synthesise the rest. */
type Candidate = Pick<Occurrence, 'slug' | 'key' | 'startDay'>;

export function pickCanonical(occurrences: Iterable<Candidate>, todayKey: string): Map<string, string> {
  const series = new Map<string, Candidate[]>();
  for (const occurrence of occurrences) {
    const list = series.get(occurrence.key) ?? [];
    list.push(occurrence);
    series.set(occurrence.key, list);
  }

  const canonical = new Map<string, string>();
  for (const [key, list] of series) {
    // Ties broken on slug so the choice is stable between builds.
    list.sort((a, b) => a.startDay.localeCompare(b.startDay) || a.slug.localeCompare(b.slug));
    const next = list.find((o) => o.startDay >= todayKey);
    canonical.set(key, (next ?? list[list.length - 1]!).slug);
  }
  return canonical;
}

/**
 * The last Denver day an entry is on, from its raw frontmatter strings.
 *
 * Mirrors lastDay() in lib/events.ts, which works on parsed Dates: all-day
 * entries store `end` as the last day they run, and a timed entry ending
 * exactly at midnight belongs to the day before. A test cross-checks the two
 * against every event in the repository, because the sitemap uses this one and
 * the page's noindex uses the other, and the pair disagreeing is the whole
 * failure mode.
 */
export function lastDayOf(start: string, end: string, allDay: boolean): string {
  const last = end || start;
  const day = last.slice(0, 10);
  if (allDay) return day;
  // "2026-10-03T00:00" as an end is the close of 2 October.
  const time = last.slice(11, 16);
  if (end && /^00:00/.test(time)) {
    const d = new Date(`${day}T12:00:00Z`);
    d.setUTCDate(d.getUTCDate() - 1);
    return d.toISOString().slice(0, 10);
  }
  return day;
}

function field(frontmatter: string, name: string): string {
  const m = frontmatter.match(new RegExp(`^${name}:\\s*"?([^"\\n]+)"?\\s*$`, 'm'));
  return m ? m[1].trim() : '';
}

/** Every occurrence in a town's events folder, read straight from the markdown. */
export function readOccurrences(town: string, contentRoot = 'content'): Occurrence[] {
  const dir = join(contentRoot, town, 'events');
  if (!existsSync(dir)) return [];

  const all: Occurrence[] = [];
  for (const file of readdirSync(dir)) {
    if (!file.endsWith('.md') || file.startsWith('_')) continue;
    const raw = readFileSync(join(dir, file), 'utf8');
    const fm = raw.match(/^---\n([\s\S]*?)\n---/);
    if (!fm) continue;
    const title = field(fm[1], 'title');
    const venue = field(fm[1], 'venue');
    const start = field(fm[1], 'start');
    if (!title || !start) continue;
    const end = field(fm[1], 'end');
    const allDay = field(fm[1], 'allDay') === 'true';
    all.push({
      slug: file.slice(0, -3),
      key: `${title}|${venue}`,
      startDay: start.slice(0, 10),
      lastDay: lastDayOf(start, end, allDay),
    });
  }
  return all;
}

/** Slugs of every event page that is not the canonical occurrence of its series. */
export function repeatOccurrenceSlugs(town: string, contentRoot = 'content', now = new Date()): Set<string> {
  const all = readOccurrences(town, contentRoot);
  const canonical = new Set(pickCanonical(all, dayKey(now)).values());
  return new Set(all.filter((o) => !canonical.has(o.slug)).map((o) => o.slug));
}

/**
 * Slugs of events that are over.
 *
 * A finished one-day listing is a thin page about something nobody can attend.
 * It stays reachable — a URL that was live should not start 404ing — but it
 * carries noindex and is kept out of the sitemap, which is the expired-event
 * policy this network follows.
 *
 * Note this is a separate question from `repeatOccurrenceSlugs`. That one asks
 * which occurrence represents a series; this one asks whether the thing has
 * happened. A series that is entirely over keeps a canonical occurrence so the
 * series stays reachable, and that occurrence is still past, so it is still
 * not indexed.
 */
export function pastEventSlugs(town: string, contentRoot = 'content', now = new Date()): Set<string> {
  const today = dayKey(now);
  return new Set(
    readOccurrences(town, contentRoot)
      .filter((o) => o.lastDay < today)
      .map((o) => o.slug),
  );
}
