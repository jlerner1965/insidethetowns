#!/usr/bin/env node
/**
 * The weekly content report. Run it before each content session:
 *
 *   npm run weekly                 # every town
 *   npm run weekly -- --town=lyons # one town
 *   npm run weekly -- --days=14    # widen the "expiring soon" window (default 7)
 *   npm run weekly -- --json       # machine-readable
 *
 * It reports, per town:
 *   - events expiring within the window (last occurrence ends within N days),
 *     so their next dates can be added or the file deleted;
 *   - events already past, which the site hides but which still sit in the repo;
 *   - towns with fewer than 5 upcoming events;
 *   - places without an image;
 *   - listings whose `verified` date is more than 90 days old.
 *
 * Exit code is 0 either way; the report is for a person, not CI.
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'astro/zod';
import { eventSchema, placeSchema } from '../src/content/schemas.ts';
import { addDays, dayKey, startOfDay } from '../src/lib/dates.ts';
import { LIVE_TOWNS, allTowns } from '../src/config/index.ts';
import { parseFrontmatter } from './lib/frontmatter.ts';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const contentDir = join(root, 'content');

const args = process.argv.slice(2);
const opt = (name: string) => args.find((a) => a.startsWith(`--${name}=`))?.split('=')[1];
const onlyTown = opt('town');
const windowDays = Number(opt('days') ?? 7);
const asJson = args.includes('--json');
const MIN_UPCOMING = 5;
const STALE_DAYS = 90;

const now = new Date();
const today = startOfDay(now);
const windowEnd = addDays(today, windowDays);
const WEEK = 7 * 86_400_000;

type EventData = z.infer<ReturnType<typeof eventSchema>>;
type PlaceData = z.infer<ReturnType<typeof placeSchema>>;

const imageExists = (file: string) => () =>
  z.string().refine((p) => existsSync(resolve(dirname(file), p)), { message: 'missing image' });

function readCollection<T>(town: string, collection: string, schema: (file: string) => z.ZodType): Array<{ file: string; data: T }> {
  const dir = join(contentDir, town, collection);
  if (!existsSync(dir)) return [];
  const out: Array<{ file: string; data: T }> = [];
  for (const name of readdirSync(dir)) {
    if (!name.endsWith('.md') || name.startsWith('_')) continue;
    const file = join(dir, name);
    try {
      const parsed = schema(file).safeParse(parseFrontmatter(readFileSync(file, 'utf8')).data);
      if (parsed.success) out.push({ file: relative(root, file), data: parsed.data as T });
      else out.push({ file: relative(root, file), data: null as unknown as T });
    } catch {
      out.push({ file: relative(root, file), data: null as unknown as T });
    }
  }
  return out;
}

/** End of the last occurrence: `until` for repeats (plus the event's duration), else end/start. */
function lastEnd(e: EventData): Date {
  const duration = e.end ? e.end.getTime() - e.start.getTime() : e.allDay ? 86_400_000 : 0;
  if (e.repeat === 'weekly' && e.until) {
    // The last occurrence starts on the last start-weekday at or before `until`.
    let t = e.start.getTime();
    while (t + WEEK <= e.until.getTime()) t += WEEK;
    return new Date(t + duration);
  }
  return new Date(e.start.getTime() + duration);
}

/** Number of occurrences that have not ended yet. */
function upcomingOccurrences(e: EventData): number {
  const duration = e.end ? e.end.getTime() - e.start.getTime() : e.allDay ? 86_400_000 : 0;
  if (e.repeat === 'weekly' && e.until) {
    let n = 0;
    for (let t = e.start.getTime(); t <= e.until.getTime(); t += WEEK) if (t + duration >= today.getTime()) n++;
    return n;
  }
  return e.start.getTime() + duration >= today.getTime() ? 1 : 0;
}

type TownReport = {
  town: string;
  live: boolean;
  upcoming: number;
  expiring: Array<{ file: string; title: string; lastDate: string }>;
  past: Array<{ file: string; title: string; lastDate: string }>;
  placesWithoutImage: Array<{ file: string; title: string }>;
  stale: Array<{ file: string; title: string; verified: string }>;
  broken: string[];
};

const reports: TownReport[] = [];
for (const town of allTowns) {
  if (onlyTown && town.slug !== onlyTown) continue;
  if (!existsSync(join(contentDir, town.slug)) || !statSync(join(contentDir, town.slug)).isDirectory()) continue;
  const events = readCollection<EventData>(town.slug, 'events', (f) => eventSchema(imageExists(f)));
  const places = readCollection<PlaceData>(town.slug, 'places', (f) => placeSchema(imageExists(f)));
  const report: TownReport = {
    town: town.slug,
    live: LIVE_TOWNS.includes(town.slug),
    upcoming: 0,
    expiring: [],
    past: [],
    placesWithoutImage: [],
    stale: [],
    broken: [],
  };
  const upcomingTitles = new Set<string>();
  for (const { file, data } of events) {
    if (!data) {
      report.broken.push(file);
      continue;
    }
    const end = lastEnd(data);
    const n = upcomingOccurrences(data);
    if (n > 0) upcomingTitles.add(file);
    if (end.getTime() < today.getTime()) {
      report.past.push({ file, title: data.title, lastDate: dayKey(end) });
    } else if (end.getTime() < windowEnd.getTime()) {
      report.expiring.push({ file, title: data.title, lastDate: dayKey(end) });
    }
    if (data.verified && data.verified.getTime() < addDays(today, -STALE_DAYS).getTime() && n > 0) {
      report.stale.push({ file, title: data.title, verified: dayKey(data.verified) });
    }
  }
  report.upcoming = upcomingTitles.size;
  for (const { file, data } of places) {
    if (!data) {
      report.broken.push(file);
      continue;
    }
    if (!data.image) report.placesWithoutImage.push({ file, title: data.title });
    if (data.verified && data.verified.getTime() < addDays(today, -STALE_DAYS).getTime()) {
      report.stale.push({ file, title: data.title, verified: dayKey(data.verified) });
    }
  }
  report.expiring.sort((a, b) => a.lastDate.localeCompare(b.lastDate));
  reports.push(report);
}

if (asJson) {
  console.log(JSON.stringify({ generated: now.toISOString(), windowDays, reports }, null, 2));
  process.exit(0);
}

const line = (s = '') => console.log(s);
line(`Weekly content report — ${dayKey(now)} (Denver), window ${windowDays} days`);
line('='.repeat(72));
for (const r of reports) {
  line();
  line(`${r.town.toUpperCase()}${r.live ? '' : '  (not live)'} — ${r.upcoming} upcoming event${r.upcoming === 1 ? '' : 's'}${
    r.upcoming < MIN_UPCOMING ? `  ⚠ fewer than ${MIN_UPCOMING}` : ''
  }`);
  line('-'.repeat(72));
  if (r.expiring.length) {
    line(`  Expiring within ${windowDays} days (add next dates or delete):`);
    for (const e of r.expiring) line(`    ${e.lastDate}  ${e.title}\n              ${e.file}`);
  }
  if (r.past.length) {
    line(`  Already past (hidden on the site; delete or update):`);
    for (const e of r.past) line(`    ${e.lastDate}  ${e.title}\n              ${e.file}`);
  }
  if (r.placesWithoutImage.length) {
    line(`  Places without an image (${r.placesWithoutImage.length}):`);
    for (const p of r.placesWithoutImage) line(`    ${p.title}  —  ${p.file}`);
  }
  if (r.stale.length) {
    line(`  Not re-checked in ${STALE_DAYS}+ days (${r.stale.length}):`);
    for (const s of r.stale) line(`    ${s.verified}  ${s.title}  —  ${s.file}`);
  }
  if (r.broken.length) {
    line(`  Files that fail validation (run npm run validate):`);
    for (const b of r.broken) line(`    ${b}`);
  }
  if (!r.expiring.length && !r.past.length && !r.placesWithoutImage.length && !r.stale.length && !r.broken.length) {
    line('  Nothing to do.');
  }
}
line();
const thin = reports.filter((r) => r.upcoming < MIN_UPCOMING).map((r) => r.town);
line(
  `Summary: ${reports.length} towns, ${reports.reduce((n, r) => n + r.expiring.length, 0)} expiring, ${reports.reduce((n, r) => n + r.past.length, 0)} past, ${reports.reduce((n, r) => n + r.placesWithoutImage.length, 0)} places without images` +
    (thin.length ? `; thin calendars: ${thin.join(', ')}` : ''),
);
