#!/usr/bin/env node
/**
 * Ingest: read each confirmed feed source and write what it says into
 * staging, where the review decides.
 *
 *   npm run ingest                         # every live town
 *   npm run ingest -- --town=erie          # one town
 *   npm run ingest -- --source=erieco-gov  # one source
 *   npm run ingest -- --dry-run            # say what would be written, write nothing
 *
 * The rules, in the order they bite:
 *
 * 1. Only a source with `status: confirmed` and a feed type (ical, rss,
 *    json) with a `feedUrl` is read. Proposed, retired, html and manual
 *    sources are never fetched.
 * 2. The site's robots.txt is read first, and a feed it disallows for our
 *    user agent is not fetched, with a line saying so, unless the editor has
 *    set `robots: subscribe` on that source (see the schema for when).
 * 3. Every item inside the horizon (src/config/ingest.ts) and the source's
 *    location filter becomes a candidate. One already in the repository is
 *    found by the feed's own id, or by the same day and nearly the same
 *    title (scripts/lib/ingest.ts).
 * 4. New: a file in content/<town>/staging/events/ with a `review` block
 *    saying where it came from and what was guessed. Already staged: the
 *    staged file is rewritten with the feed's current facts; the review
 *    block keeps its date. Already published: nothing in the published
 *    folder changes except `changeFlag`, and the difference is written to
 *    staging/changes/<slug>.json for the review, cancellations first.
 *
 * Nothing here publishes. The build never reads staging, and a published
 * file's facts are touched only by the review (or, if
 * INGEST.autoApplyCancellations is ever switched on, a cancellation).
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { z } from 'astro/zod';
import { allTowns, LIVE_TOWNS } from '../src/config/index.ts';
import { INGEST } from '../src/config/ingest.ts';
import { changeSchema, eventSchema, type Change, type Source } from '../src/content/schemas.ts';
import { addDays, dayKey, startOfDay } from '../src/lib/dates.ts';
import { readRegistry } from '../src/lib/sources.ts';
import { parseFrontmatter } from './lib/frontmatter.ts';
import { eventFile } from './lib/event-files.ts';
import { readIcal } from './lib/feeds/ical.ts';
import { readRss } from './lib/feeds/rss.ts';
import { readTribePage, tribeFirstPage, type TribePage } from './lib/feeds/tribe.ts';
import type { FeedEvent, Horizon } from './lib/feeds/types.ts';
import { detectChanges, excludedTitle, matchExisting, passesLocationFilter, siblingCounts, toStaged, venueFrom, type ExistingEvent } from './lib/ingest.ts';
import { isAllowed } from './lib/robots.ts';
import { robotsFor, TIMEOUT, UA } from './lib/probe.ts';

const run = promisify(execFile);
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const contentDir = join(root, 'content');
const args = process.argv.slice(2);
const opt = (name: string) => args.find((a) => a.startsWith(`--${name}=`))?.split('=')[1];
const dryRun = args.includes('--dry-run');
const onlyTown = opt('town');
const onlySource = opt('source');

const now = new Date();
const today = dayKey(now);
const horizon: Horizon = { from: startOfDay(now), to: addDays(startOfDay(now), INGEST.horizonDays) };
const schema = eventSchema(() => z.string());

const towns = allTowns.filter((t) => (onlyTown ? t.slug === onlyTown : LIVE_TOWNS.includes(t.slug)));
if (onlyTown && towns.length === 0) {
  console.error(`ingest: no town "${onlyTown}". Towns: ${allTowns.map((t) => t.slug).join(', ')}`);
  process.exit(2);
}

/** GET with curl, as everything else here does, returning the body. */
async function fetchText(url: string): Promise<{ code: string; body: string }> {
  try {
    const { stdout } = await run(
      'curl',
      ['-sS', '-L', '--max-time', String(TIMEOUT * 3), '-A', UA, '-H', 'Accept: text/calendar,application/rss+xml,application/json,application/xml,text/xml,*/*', '-w', '\n%{http_code}', url],
      { maxBuffer: 64 << 20 },
    );
    const nl = stdout.lastIndexOf('\n');
    return { code: stdout.slice(nl + 1).trim(), body: stdout.slice(0, nl) };
  } catch {
    return { code: '000', body: '' };
  }
}

/** Every event file of a town, published and staged, as the matcher needs it. */
function existingEvents(town: string): ExistingEvent[] {
  const out: ExistingEvent[] = [];
  for (const [dir, staged] of [
    [join(contentDir, town, 'events'), false],
    [join(contentDir, town, 'staging', 'events'), true],
  ] as const) {
    if (!existsSync(dir)) continue;
    for (const name of readdirSync(dir)) {
      if (!name.endsWith('.md') || name.startsWith('_')) continue;
      const file = join(dir, name);
      let parsed;
      try {
        parsed = schema.safeParse(parseFrontmatter(readFileSync(file, 'utf8')).data);
      } catch {
        continue;
      }
      if (!parsed.success) continue;
      const d = parsed.data;
      // A weekly repeat is one file for many dates; the matcher works per
      // date, so expand it the way the site does.
      const starts: Date[] = [d.start];
      if (d.repeat === 'weekly' && d.until) {
        for (let t = d.start.getTime() + 7 * 86_400_000; t <= d.until.getTime(); t += 7 * 86_400_000) starts.push(new Date(t));
      }
      for (const start of starts) {
        out.push({
          file,
          slug: d.slug ?? name.slice(0, -3),
          staged,
          title: d.title,
          start,
          end: d.end ? new Date(start.getTime() + (d.end.getTime() - d.start.getTime())) : undefined,
          venue: d.venue,
          status: d.status,
          sourceUid: d.sourceUid,
          sourceHash: d.sourceHash,
        });
      }
    }
  }
  return out;
}

async function readFeed(source: Source): Promise<{ items: FeedEvent[]; note: string } | { error: string }> {
  const feedUrl = source.feedUrl!;
  const { origin, pathname, search } = new URL(feedUrl);
  const rules = await robotsFor(origin);
  if (!isAllowed(rules, pathname + search)) {
    if (source.robots !== 'subscribe') {
      return { error: `robots.txt at ${origin} asks automated clients not to fetch this feed; not fetched. If the owner publishes it for calendar subscriptions, the editor can set robots: subscribe on the source.` };
    }
  }
  const robotsNote = !isAllowed(rules, pathname + search) ? ' (robots.txt disallows; read under the editor\'s robots: subscribe)' : '';
  if (source.type === 'json') {
    // The Events Calendar REST API, paginated.
    const items: FeedEvent[] = [];
    let url: string | undefined = tribeFirstPage(feedUrl, horizon.from);
    let pages = 0;
    while (url && pages < 20) {
      const { code, body } = await fetchText(url);
      if (!/^2/.test(code)) return { error: `${url} answered ${code}` };
      let page: TribePage;
      try {
        page = JSON.parse(body) as TribePage;
      } catch {
        return { error: `${url} did not return JSON` };
      }
      items.push(...readTribePage(page, horizon));
      url = page.next_rest_url;
      pages++;
    }
    return { items, note: `${pages} page${pages === 1 ? '' : 's'}${robotsNote}` };
  }
  const { code, body } = await fetchText(feedUrl);
  if (!/^2/.test(code)) return { error: `${feedUrl} answered ${code}` };
  if (source.type === 'ical') {
    if (!/BEGIN:VCALENDAR/.test(body)) return { error: `${feedUrl} is not an iCalendar feed` };
    return { items: readIcal(body, horizon), note: robotsNote.trim() };
  }
  if (source.type === 'rss') {
    if (!/<rss|<feed/i.test(body)) return { error: `${feedUrl} is not an RSS feed` };
    const { events, skipped } = readRss(body, horizon);
    return { items: events, note: `${skipped ? `${skipped} items without an event date skipped` : ''}${robotsNote}`.trim() };
  }
  return { error: `type ${source.type} is not a feed` };
}

function write(file: string, content: string) {
  if (dryRun) return;
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, content);
}

/** Set or replace one scalar line in a published file's frontmatter without touching anything else. */
function setFrontmatterLine(file: string, key: string, value: string) {
  const text = readFileSync(file, 'utf8');
  const end = text.indexOf('\n---', 4);
  const head = text.slice(0, end);
  const rest = text.slice(end);
  const line = `${key}: ${value}`;
  const updated = new RegExp(`^${key}:.*$`, 'm').test(head) ? head.replace(new RegExp(`^${key}:.*$`, 'm'), line) : `${head}\n${line}`;
  write(file, updated + rest);
}

const totals = { sources: 0, items: 0, staged: 0, updated: 0, unchanged: 0, changes: 0, cancellations: 0, skipped: 0 };

for (const town of towns) {
  const registry = readRegistry(town.slug, contentDir);
  const sources = registry.sources.filter(
    (s) => s.status === 'confirmed' && ['ical', 'rss', 'json'].includes(s.type) && s.feedUrl && (!onlySource || s.id === onlySource),
  );
  if (sources.length === 0) continue;
  console.log(`\n${town.name.toUpperCase()}`);
  const existing = existingEvents(town.slug);
  for (const source of sources) {
    totals.sources++;
    const result = await readFeed(source);
    if ('error' in result) {
      console.log(`  ${source.id}: not read — ${result.error}`);
      continue;
    }
    const located = result.items.filter((item) => passesLocationFilter(item, source));
    const inScope = located.filter((item) => !excludedTitle(item, source));
    const filtered = result.items.length - located.length;
    const excluded = located.length - inScope.length;
    console.log(
      `  ${source.id}: ${result.items.length} item${result.items.length === 1 ? '' : 's'} in the next ${INGEST.horizonDays} days` +
        (filtered ? `, ${filtered} outside the location filter` : '') +
        (excluded ? `, ${excluded} excluded by title` : '') +
        (result.note ? ` — ${result.note}` : ''),
    );
    let staged = 0;
    let updated = 0;
    let merged = 0;
    let unchanged = 0;
    let changed = 0;
    const siblings = siblingCounts(inScope);
    const thisRun = new Set<ExistingEvent>();
    for (const item of inScope) {
      totals.items++;
      const match = matchExisting(item, existing, siblings.get(item));
      const prepared = toStaged(item, source, town.slug, today);
      if (match.kind === 'staged' && thisRun.has(match.existing)) {
        // The feed carries the same event twice (two rooms, two listings):
        // one staged file, and a line saying so rather than a silent drop.
        merged++;
        console.log(`    duplicate in the feed merged: "${item.title}" ${dayKey(item.start)} (${item.uid})`);
        continue;
      }
      if (match.kind === 'none') {
        const file = join(contentDir, town.slug, 'staging', 'events', `${prepared.slug}.md`);
        if (existsSync(file)) {
          // Same slug, different id: another occurrence or a near-duplicate
          // title on the same day. Keep both apart rather than overwrite.
          const alt = join(contentDir, town.slug, 'staging', 'events', `${prepared.slug}-${item.uid.replace(/[^a-z0-9]+/gi, '').slice(-6).toLowerCase()}.md`);
          write(alt, eventFile(prepared.frontmatter, prepared.body));
        } else {
          write(file, eventFile(prepared.frontmatter, prepared.body));
        }
        const created: ExistingEvent = { file, slug: prepared.slug, staged: true, title: item.title, start: item.start, end: item.end, venue: String(prepared.frontmatter.venue), sourceUid: item.uid };
        existing.push(created);
        thisRun.add(created);
        staged++;
        continue;
      }
      if (match.kind === 'staged') {
        // Refresh the staged file with the feed's current facts; the review
        // block keeps the day it first arrived.
        const since = (() => {
          try {
            const r = parseFrontmatter(readFileSync(match.existing.file, 'utf8')).data.review as { since?: string } | undefined;
            return r?.since ?? today;
          } catch {
            return today;
          }
        })();
        if (match.existing.sourceHash === prepared.frontmatter.sourceHash) {
          unchanged++;
          continue;
        }
        (prepared.frontmatter.review as { since: string }).since = since;
        write(match.existing.file, eventFile(prepared.frontmatter, prepared.body));
        updated++;
        continue;
      }
      // Published. Compare, and file the difference for the review.
      const { venue, guessed } = venueFrom(item.location, source);
      const changes = detectChanges(item, match.existing, venue, !guessed);
      if (changes.length === 0) {
        unchanged++;
        continue;
      }
      const cancel = changes.some((c) => c.field === 'status' && c.now === 'canceled');
      const change: Change = changeSchema.parse({
        slug: match.existing.slug,
        sourceId: source.id,
        sourceUid: item.uid,
        sourceUrl: item.url ?? source.feedUrl ?? source.url,
        detected: today,
        cancel,
        changes,
      });
      const file = join(contentDir, town.slug, 'staging', 'changes', `${match.existing.slug}.json`);
      write(file, `${JSON.stringify({ ...change, detected: today }, null, 2)}\n`);
      setFrontmatterLine(match.existing.file, 'changeFlag', 'true');
      setFrontmatterLine(
        match.existing.file,
        'changeNote',
        JSON.stringify(`${source.name} now says: ${changes.map((c) => `${c.field} ${c.was} → ${c.now}`).join('; ')} (read ${today}; see staging/changes/${match.existing.slug}.json)`),
      );
      changed++;
      if (cancel) totals.cancellations++;
      console.log(`    ${cancel ? 'CANCELED ' : 'changed  '}${relative(root, match.existing.file)}: ${changes.map((c) => `${c.field} ${c.was} → ${c.now}`).join('; ')}`);
    }
    totals.staged += staged;
    totals.updated += updated;
    totals.unchanged += unchanged;
    totals.changes += changed;
    console.log(
      `    ${staged} new to staging, ${updated} staged files refreshed, ${merged ? `${merged} feed duplicates merged, ` : ''}${unchanged} already known and unchanged, ${changed} published events changed`,
    );
  }
}

console.log(
  `\ningest${dryRun ? ' (dry run, nothing written)' : ''}: ${totals.sources} source${totals.sources === 1 ? '' : 's'}, ${totals.items} items; ` +
    `${totals.staged} staged, ${totals.updated} refreshed, ${totals.unchanged} unchanged, ${totals.changes} changes to published events (${totals.cancellations} cancellations). ` +
    (totals.staged || totals.changes ? 'Next: the review (content/<town>/staging/; npm run review once phase 6 lands).' : ''),
);
