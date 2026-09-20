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
}

/**
 * The slug to index for each series, keyed by series.
 *
 * `todayKey` is a Denver day string so it compares directly against
 * `startDay`; an occurrence today still counts as upcoming.
 */
export function pickCanonical(occurrences: Iterable<Occurrence>, todayKey: string): Map<string, string> {
  const series = new Map<string, Occurrence[]>();
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
    all.push({ slug: file.slice(0, -3), key: `${title}|${venue}`, startDay: start.slice(0, 10) });
  }
  return all;
}

/** Slugs of every event page that is not the canonical occurrence of its series. */
export function repeatOccurrenceSlugs(town: string, contentRoot = 'content', now = new Date()): Set<string> {
  const all = readOccurrences(town, contentRoot);
  const canonical = new Set(pickCanonical(all, dayKey(now)).values());
  return new Set(all.filter((o) => !canonical.has(o.slug)).map((o) => o.slug));
}
