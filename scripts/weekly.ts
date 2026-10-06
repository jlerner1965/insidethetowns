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
 *   - how far ahead each calendar actually runs, which a raw count hides: a
 *     town with thirty events that all fall inside three weeks is emptier
 *     than one with fifteen spread over three months, and the reader who
 *     comes back in February is the one who decides whether the guide is
 *     worth a bookmark;
 *   - towns with fewer than 5 upcoming events;
 *   - places without an image;
 *   - listings whose `verified` date is more than 30 days old. The October
 *     2026 audit found hours drifted at five of sixteen Erie businesses in
 *     the fortnight after they were checked; ninety days was a quarter of a
 *     year of being wrong. Thirty days across some 330 places is about nine
 *     a town a week, which is the rotation.
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
import { FRESHNESS } from '../src/config/freshness.ts';
import { parseFrontmatter } from './lib/frontmatter.ts';
import { describeCounts, launchCounts } from './lib/launch.ts';
import { readRegistry } from '../src/lib/sources.ts';
import { changeSchema } from '../src/content/schemas.ts';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const contentDir = join(root, 'content');

const args = process.argv.slice(2);
const opt = (name: string) => args.find((a) => a.startsWith(`--${name}=`))?.split('=')[1];
const onlyTown = opt('town');
const windowDays = Number(opt('days') ?? 7);
const asJson = args.includes('--json');
const MIN_UPCOMING = 5;
/**
 * Days of listings a town should have in hand. Below this the calendar is
 * about to run dry, whatever the headline count says.
 */
const MIN_RUNWAY_DAYS = 45;
const STALE_DAYS = FRESHNESS.recheckDays;

const now = new Date();
const today = startOfDay(now);
const windowEnd = addDays(today, windowDays);
const horizon30 = dayKey(addDays(today, 30));
const horizon60 = dayKey(addDays(today, 60));
const horizon90 = dayKey(addDays(today, 90));
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

/** Denver days of each upcoming occurrence of an event, repeats expanded. */
function upcomingDays(e: EventData): string[] {
  const duration = e.end ? e.end.getTime() - e.start.getTime() : e.allDay ? 86_400_000 : 0;
  const days: string[] = [];
  if (e.repeat === 'weekly' && e.until) {
    for (let t = e.start.getTime(); t <= e.until.getTime(); t += WEEK) {
      if (t + duration >= today.getTime()) days.push(dayKey(new Date(t)));
    }
    return days;
  }
  if (e.start.getTime() + duration >= today.getTime()) days.push(dayKey(e.start));
  return days;
}

type TownReport = {
  town: string;
  live: boolean;
  upcoming: number;
  /** Denver day of the last thing on the calendar, or '' if there is nothing. */
  lastDate: string;
  /** Days from today to that date. */
  runwayDays: number;
  /** Upcoming occurrences falling in the next 30 / 60 / 90 days. */
  next30: number;
  next60: number;
  next90: number;
  expiring: Array<{ file: string; title: string; lastDate: string }>;
  past: Array<{ file: string; title: string; lastDate: string }>;
  placesWithoutImage: Array<{ file: string; title: string }>;
  stale: Array<{ file: string; title: string; verified: string }>;
  broken: string[];
  /** Verified, publishable counts against the launch threshold. */
  launch: ReturnType<typeof launchCounts>;
  /** Confirmed sources whose last check did not come back ok. */
  sourcesDown: Array<{ id: string; status: string; note?: string; checked: string }>;
  /** Core sources still waiting to be confirmed before ingest may use them. */
  sourcesWaiting: number;
  /** Events and places in staging, waiting for the review. */
  awaitingReview: { events: number; places: number };
  /** Changes ingest found to published events; cancellations first. */
  flagged: Array<{ slug: string; cancel: boolean; summary: string; detected: string }>;
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
    lastDate: '',
    runwayDays: 0,
    next30: 0,
    next60: 0,
    next90: 0,
    expiring: [],
    past: [],
    placesWithoutImage: [],
    stale: [],
    broken: [],
    launch: launchCounts(town, contentDir, now),
    sourcesDown: [],
    sourcesWaiting: 0,
    awaitingReview: { events: 0, places: 0 },
    flagged: [],
  };
  for (const c of ['events', 'places'] as const) {
    const dir = join(contentDir, town.slug, 'staging', c);
    if (existsSync(dir)) report.awaitingReview[c] = readdirSync(dir).filter((f) => f.endsWith('.md') && !f.startsWith('_')).length;
  }
  const changesDir = join(contentDir, town.slug, 'staging', 'changes');
  if (existsSync(changesDir)) {
    for (const name of readdirSync(changesDir)) {
      if (!name.endsWith('.json')) continue;
      const parsed = changeSchema.safeParse(JSON.parse(readFileSync(join(changesDir, name), 'utf8')));
      if (!parsed.success) continue;
      const c = parsed.data;
      report.flagged.push({ slug: c.slug, cancel: c.cancel, detected: dayKey(c.detected), summary: c.changes.map((x) => `${x.field} ${x.was} → ${x.now}`).join('; ') });
    }
    report.flagged.sort((a, b) => Number(b.cancel) - Number(a.cancel) || a.slug.localeCompare(b.slug));
  }
  try {
    const registry = readRegistry(town.slug, contentDir);
    report.sourcesWaiting = registry.sources.filter((s) => s.status === 'proposed' && s.priority === 'core').length;
    report.sourcesDown = registry.sources
      .filter((s) => s.status === 'confirmed' && s.lastStatus && s.lastStatus !== 'ok')
      .map((s) => ({ id: s.id, status: s.lastStatus!, note: s.lastNote, checked: s.lastChecked ? dayKey(s.lastChecked) : '' }));
  } catch (err) {
    report.broken.push(`content/${town.slug}/sources.json: ${(err as Error).message}`);
  }
  const upcomingTitles = new Set<string>();
  for (const { file, data } of events) {
    if (!data) {
      report.broken.push(file);
      continue;
    }
    const end = lastEnd(data);
    const n = upcomingOccurrences(data);
    if (n > 0) upcomingTitles.add(file);
    for (const day of upcomingDays(data)) {
      if (day > report.lastDate) report.lastDate = day;
      if (day <= horizon30) report.next30++;
      if (day <= horizon60) report.next60++;
      if (day <= horizon90) report.next90++;
    }
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
  report.runwayDays = report.lastDate
    ? Math.round((new Date(`${report.lastDate}T12:00:00Z`).getTime() - new Date(`${dayKey(today)}T12:00:00Z`).getTime()) / 86_400_000)
    : 0;
  for (const { file, data } of places) {
    if (!data) {
      report.broken.push(file);
      continue;
    }
    if (!data.image) report.placesWithoutImage.push({ file, title: data.title });
    if (data.verified && data.verified.getTime() < addDays(today, -STALE_DAYS).getTime()) {
      report.stale.push({ file, title: data.title, verified: dayKey(data.verified) });
    }
    // Access notes carry their own check date: on the rotation by it, not the listing's.
    if (data.access && data.access.verified.getTime() < addDays(today, -STALE_DAYS).getTime()) {
      report.stale.push({ file, title: `${data.title}: access notes`, verified: dayKey(data.access.verified) });
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
  if (!r.launch.meets) {
    line(`  ⚠ Under the launch threshold: ${describeCounts(r.launch)}${r.live ? ' — live, publishing what is verified' : ' — not live; holding page'}`);
  }
  line(
    `  Calendar: ${r.next30} in 30 days, ${r.next60} in 60, ${r.next90} in 90 — ` +
      (r.lastDate ? `runs to ${r.lastDate} (${r.runwayDays} days)` : 'nothing on') +
      (r.runwayDays < MIN_RUNWAY_DAYS ? `  ⚠ under ${MIN_RUNWAY_DAYS} days of runway` : ''),
  );
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
  if (r.flagged.length) {
    line(`  Changes the sources made to published events (${r.flagged.length}; cancellations first):`);
    for (const f of r.flagged) line(`    ${f.cancel ? 'CANCELED ' : '         '}${f.detected}  ${f.slug}: ${f.summary}`);
  }
  if (r.awaitingReview.events || r.awaitingReview.places) {
    line(`  Awaiting review in staging: ${r.awaitingReview.events} events, ${r.awaitingReview.places} places  (npm run review -- --town=${r.town})`);
  }
  if (r.sourcesDown.length) {
    line(`  Sources not answering as they should (${r.sourcesDown.length}):`);
    for (const s of r.sourcesDown) line(`    ${s.checked}  ${s.id}: ${s.status}${s.note ? ` — ${s.note}` : ''}`);
  }
  if (r.sourcesWaiting) {
    line(`  Core sources waiting to be confirmed: ${r.sourcesWaiting}  (npm run sources -- --town=${r.town})`);
  }
  if (r.broken.length) {
    line(`  Files that fail validation (run npm run validate):`);
    for (const b of r.broken) line(`    ${b}`);
  }
  if (!r.expiring.length && !r.past.length && !r.placesWithoutImage.length && !r.stale.length && !r.broken.length && !r.sourcesDown.length && !r.sourcesWaiting && !r.flagged.length && !r.awaitingReview.events && !r.awaitingReview.places) {
    line('  Nothing to do.');
  }
}
line();
const thin = reports.filter((r) => r.upcoming < MIN_UPCOMING).map((r) => r.town);
const dry = reports
  .filter((r) => r.live && r.runwayDays < MIN_RUNWAY_DAYS)
  .sort((a, b) => a.runwayDays - b.runwayDays)
  .map((r) => `${r.town} (${r.runwayDays}d)`);
line(
  `Summary: ${reports.length} towns, ${reports.reduce((n, r) => n + r.expiring.length, 0)} expiring, ${reports.reduce((n, r) => n + r.past.length, 0)} past, ${reports.reduce((n, r) => n + r.placesWithoutImage.length, 0)} places without images` +
    (thin.length ? `; thin calendars: ${thin.join(', ')}` : ''),
);
if (dry.length) {
  line();
  line(`Running dry within ${MIN_RUNWAY_DAYS} days: ${dry.join(', ')}`);
  line('A calendar that empties is the one thing a reader notices before they stop coming back.');
}
