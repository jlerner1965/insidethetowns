#!/usr/bin/env node
/**
 * Ingest: read each confirmed feed source and write what it says into
 * staging, where the review decides.
 *
 *   npm run ingest                         # every live town
 *   npm run ingest -- --town=erie          # one town
 *   npm run ingest -- --source=erieco-gov  # one source
 *   npm run ingest -- --dry-run            # say what would be written, write nothing
 *   npm run ingest -- --report=/tmp/ingest.md   # also write what went wrong, for the pull request
 *   npm run ingest -- --dry-run --explain       # say which file each item was tied to by its title or its page, not the feed's id
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
 * file's facts are touched only by the review: a person at `npm run review`,
 * or the standing rules of `npm run auto-review` (scripts/lib/auto-review.ts),
 * which write in a time, a venue or a cancellation from the same organizer
 * feed the listing came from and leave everything else waiting.
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
import { addDays, dayKey, startOfDay, toWallClock } from '../src/lib/dates.ts';
import { readRegistry } from '../src/lib/sources.ts';
import { parseFrontmatter } from './lib/frontmatter.ts';
import { eventFile } from './lib/event-files.ts';
import { readIcal } from './lib/feeds/ical.ts';
import { readRss } from './lib/feeds/rss.ts';
import { isShowareFeed, readShowarePage, showareHasMore, showarePage, type ShowarePage } from './lib/feeds/showare.ts';
import { readTribePage, tribeFirstPage, type TribePage } from './lib/feeds/tribe.ts';
import type { FeedEvent, Horizon } from './lib/feeds/types.ts';
import { ambiguousNote, detectChanges, elsewhereNote, excludedTitle, excludingEntry, hostOf, matchExisting, passesLocationFilter, possibleDuplicates, sameSite, sameVenue, siblingCounts, toStaged, venueFrom, type ExistingEvent, type Match, passesCategoryFilter } from './lib/ingest.ts';
import { normalizeUrl, sessionLinks } from '../src/lib/session-links.ts';
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
const reportPath = opt('report');
const explain = args.includes('--explain');
/**
 * What kept a feed's events out of this run, each in one line: a feed not
 * read, a source set aside, an item that would not validate. In the log
 * alone these were lines among hundreds; the weekly pull request opens with
 * them, since a feed that stops answering stops its events arriving and
 * nothing else says so (1 November 2026).
 */
const problems: string[] = [];

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
      let body = '';
      try {
        const read = parseFrontmatter(readFileSync(file, 'utf8'));
        body = read.body;
        parsed = schema.safeParse(read.data);
      } catch {
        continue;
      }
      if (!parsed.success) continue;
      const d = parsed.data;
      // A weekly repeat is one file for many dates; the matcher works per
      // date, so expand it the way the site does (src/lib/events.ts): by
      // wall-clock weeks, not 7×24 hours. A fixed-millisecond step read an
      // 11 am Thursday series as 10 am after the November clock change, and
      // the feed's unchanged 11 am was written up as a change (Babytime,
      // Johnstown, 15 October 2026).
      const starts: Date[] = [d.start];
      if (d.repeat === 'weekly' && d.until) {
        const lastStart = addDays(startOfDay(d.until), 1).getTime();
        for (let t = addDays(d.start, 7); t.getTime() < lastStart; t = addDays(t, 7)) starts.push(t);
      }
      // A file of several dates (`performances`) is every one of them. Read
      // as its first date alone, a storytime's afternoon sessions were new
      // to the matcher every week after the first, were staged again, and
      // became a second listing of the same sessions (Johnstown, 15 October
      // 2026; audit, 26 October).
      if (d.performances?.length) starts.splice(0, starts.length, ...d.performances.map((p) => p.start));
      // The organizer's pages the file cites, the feed's link for an item
      // being its id where the file has no sourceUid: the file's own, for
      // every date, and each session's own page for its date.
      const fileUrls = [d.url, d.source].filter((u): u is string => !!u);
      const sessions = sessionLinks(body);
      for (const [i, start] of starts.entries()) {
        out.push({
          ...(d.performances?.length && i > 0 ? { laterShow: true } : {}),
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
          sourceHost: hostOf(d.source ?? d.url),
          address: d.address,
          urls: [...fileUrls, ...sessions.filter((s) => (s.timed ? s.start.getTime() === start.getTime() : dayKey(s.start) === dayKey(start))).map((s) => s.url)],
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
  if (source.type === 'json' && isShowareFeed(feedUrl)) {
    // A ShoWare box office's performance list, fifteen a page.
    const items: FeedEvent[] = [];
    let n = 1;
    let read = 0;
    for (;;) {
      const url = showarePage(feedUrl, n);
      const { code, body } = await fetchText(url);
      if (!/^2/.test(code)) return { error: `${url} answered ${code}` };
      let page: ShowarePage;
      try {
        page = JSON.parse(body) as ShowarePage;
      } catch {
        return { error: `${url} did not return JSON` };
      }
      items.push(...readShowarePage(page, origin, horizon));
      read += page.performance?.length ?? 0;
      if (!showareHasMore(page, read) || n >= 20) break;
      n++;
    }
    return { items, note: `${n} page${n === 1 ? '' : 's'}${robotsNote}` };
  }
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

/**
 * Flag a published file as one of two listings of the same event, for the
 * review's queue of flags (`changeFlag` with the note; no change file, since
 * no fact of the event changed). A flag already there for another reason
 * keeps its note, with this one added. The pair is named once, not once for
 * each week of a series or each run.
 */
function flagDuplicate(file: string, note: string) {
  let current = '';
  try {
    current = String(parseFrontmatter(readFileSync(file, 'utf8')).data.changeNote ?? '');
  } catch {
    // Unreadable now: the note below stands alone.
  }
  if (current.includes(note.split(' are each ')[0]!)) return;
  setFrontmatterLine(file, 'changeFlag', 'true');
  setFrontmatterLine(file, 'changeNote', JSON.stringify(current ? `${current} Also: ${note}` : note));
}

const totals = { sources: 0, items: 0, staged: 0, updated: 0, unchanged: 0, changes: 0, cancellations: 0, ambiguous: 0, skipped: 0 };

for (const town of towns) {
  const registry = readRegistry(town.slug, contentDir);
  const feedSources = registry.sources.filter((s) => s.status === 'confirmed' && ['ical', 'rss', 'json'].includes(s.type) && s.feedUrl);
  const sources = feedSources.filter((s) => !onlySource || s.id === onlySource);
  if (sources.length === 0) continue;
  console.log(`\n${town.name.toUpperCase()}`);
  const existing = existingEvents(town.slug);
  // Every confirmed feed is read before any is matched, so that the ids they
  // carry this run are known: a file one item owns by id is never taken by
  // another item's similar title (lib/ingest.ts, matchExisting). With
  // --source the others are read for their ids only.
  const feeds: Array<[Source, Awaited<ReturnType<typeof readFeed>>]> = [];
  for (const source of feedSources) feeds.push([source, await readFeed(source)]);
  // Each id with its item's title, so a production's later show is known by its first show's title (lib/ingest.ts, Claimed).
  const claimed = new Map<string, string>();
  for (const [, result] of feeds) if (!('error' in result)) for (const item of result.items) claimed.set(item.uid, item.title);
  for (const [source, result] of feeds.filter(([s]) => sources.includes(s))) {
    totals.sources++;
    if ('error' in result) {
      console.log(`  ${source.id}: not read — ${result.error}`);
      problems.push(`${town.name}: \`${source.id}\` not read — ${result.error}`);
      continue;
    }
    // On a multi-town guide every listing names its town, and a staged
    // file without one fails validation; written, it fails the run and the
    // week's staging with it (1 November 2026: sixteen Idaho Springs
    // library items, no subTown on the source). The source is set aside
    // with a line saying what to add; npm run validate says the same.
    if (town.subTowns && !source.subTown) {
      console.log(`  ${source.id}: not staged — ${town.name} covers ${town.subTowns.join(', ')}, and this source has no subTown; set one in content/${town.slug}/sources.json`);
      problems.push(`${town.name}: \`${source.id}\` set aside — no subTown on a ${town.name} source; set one in content/${town.slug}/sources.json`);
      continue;
    }
    const located = result.items.filter((item) => passesLocationFilter(item, source));
    const inScope = located.filter((item) => !excludedTitle(item, source) && passesCategoryFilter(item, source));
    // Every title a rule kept out, once each with the entry that did it, so
    // the weekly log shows a rule that has started catching a real event.
    const keptOut = new Map<string, string>();
    for (const item of located) {
      const entry = excludingEntry(item, source);
      if (entry && !keptOut.has(item.title)) keptOut.set(item.title, `excludeTitles "${entry}"`);
      else if (!entry && !passesCategoryFilter(item, source) && !keptOut.has(item.title)) keptOut.set(item.title, `category ${item.categories.join(', ') || '(none)'}`);
    }
    const filtered = result.items.length - located.length;
    const excluded = located.length - inScope.length;
    console.log(
      `  ${source.id}: ${result.items.length} item${result.items.length === 1 ? '' : 's'} in the next ${INGEST.horizonDays} days` +
        (filtered ? `, ${filtered} outside the location filter` : '') +
        (excluded ? `, ${excluded} excluded by title` : '') +
        (result.note ? ` — ${result.note}` : ''),
    );
    if (keptOut.size) console.log(`    kept out: ${[...keptOut].map(([title, why]) => `"${title}" (${why})`).join('; ')}`);
    let staged = 0;
    let updated = 0;
    let merged = 0;
    let unchanged = 0;
    let changed = 0;
    let ambiguous = 0;
    const siblings = siblingCounts(inScope);
    const thisRun = new Set<ExistingEvent>();
    // An item's link is the organizer's id for it only when no other item in
    // the feed shares it: a feed that gives every item its calendar's front
    // page names no event by it.
    const links = new Map<string, number>();
    for (const item of result.items) if (item.url) links.set(normalizeUrl(item.url), (links.get(normalizeUrl(item.url)) ?? 0) + 1);
    for (const item of inScope) {
      totals.items++;
      const byLink = !!item.url && links.get(normalizeUrl(item.url)) === 1;
      const itemHost = hostOf(item.url ?? source.feedUrl ?? source.url);
      let match: Match = matchExisting(byLink ? item : { ...item, url: undefined }, existing, siblings.get(item), claimed, itemHost);
      // A title match where this calendar is not the listing's source and
      // puts the event somewhere else: not the listing moving, but another
      // event of the same name, or the listing reposted (Estes Park's
      // parade on the library's calendar, 1 November 2026). It is staged
      // with the question, for a person; the listing is not flagged.
      let elsewhere: string | undefined;
      if (match.kind === 'published' && match.how === 'title' && match.existing.sourceHost && itemHost && !sameSite(match.existing.sourceHost, itemHost)) {
        const read = venueFrom(item.location, source);
        if (read.venue && !read.guessed && !read.silent && !sameVenue({ venue: read.venue, address: read.address }, match.existing)) {
          elsewhere = elsewhereNote(match.existing, read.venue, source.name);
          match = { kind: 'none' };
        }
      }
      if (explain && match.kind !== 'none' && match.kind !== 'ambiguous' && match.how !== 'uid') {
        console.log(`    by ${match.how}: "${item.title}" ${toWallClock(item.start)} ↔ ${relative(root, match.existing.file)} ("${match.existing.title}" ${toWallClock(match.existing.start)}, ${match.existing.venue})`);
      }
      if (match.kind === 'ambiguous') {
        // Two published listings are this one item. Neither is compared or
        // merged into: each is flagged, and the review asks a person to keep
        // one (audit, 26 October 2026).
        ambiguous++;
        const note = ambiguousNote(item, match.candidates, match.why, source.name, today);
        for (const c of match.candidates) flagDuplicate(c.file, note);
        console.log(`    POSSIBLE DUPLICATES, flagged for review: ${match.candidates.map((c) => relative(root, c.file)).join(' and ')} are each "${item.title}" ${toWallClock(item.start)} (${match.why})`);
        continue;
      }
      // A new item, or one already staged, that may repeat a published
      // listing it did not match: the review line names the listing, and
      // nothing approves it by rule.
      const place = venueFrom(item.location, source);
      const dupes = match.kind === 'published' ? [] : possibleDuplicates(item, place, existing, claimed);
      if (dupes.length) console.log(`    possible duplicate, staged for review: "${item.title}" ${toWallClock(item.start)} and ${dupes.map((d) => relative(root, d.existing.file)).join(', ')} (${dupes[0]!.why})`);
      if (elsewhere) console.log(`    same name, another place, staged for review: "${item.title}" ${toWallClock(item.start)} at ${place.venue}`);
      const prepared = toStaged(item, source, town.slug, today, dupes, elsewhere);
      // One item the site could not build is set aside with a line saying
      // why; written, it failed the run's validation and took the whole
      // week's staging with it (26 October 2026: a Fort Lupton closure whose
      // feed end came before its start, and no town's new events were
      // staged that week).
      if (match.kind === 'none' || match.kind === 'staged') {
        const check = schema.safeParse(prepared.frontmatter);
        if (!check.success) {
          totals.skipped++;
          const why = check.error.issues.map((i) => `${i.path.join('.') || 'file'}: ${i.message}`).join('; ');
          console.log(`    NOT STAGED, would not validate: "${item.title}" ${toWallClock(item.start)} (${item.uid}): ${why}`);
          problems.push(`${town.name}: "${item.title}" ${toWallClock(item.start)} from \`${source.id}\` not staged — would not validate: ${why}`);
          continue;
        }
      }
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
        const created: ExistingEvent = { file, slug: prepared.slug, staged: true, title: item.title, start: item.start, end: item.end, venue: String(prepared.frontmatter.venue), sourceUid: item.uid, sourceHost: hostOf(item.url ?? source.feedUrl ?? source.url), address: place.address, urls: item.url ? [item.url] : [] };
        existing.push(created);
        thisRun.add(created);
        staged++;
        continue;
      }
      if (match.kind === 'staged') {
        // Refresh the staged file with the feed's current facts; the review
        // block keeps the day it first arrived.
        const review = (() => {
          try {
            return (parseFrontmatter(readFileSync(match.existing.file, 'utf8')).data.review ?? {}) as { since?: string; reason?: string };
          } catch {
            return {};
          }
        })();
        const since = review.since ?? today;
        // Unchanged only if the feed's facts are and the duplicate question is
        // where it was: a listing published since the item was staged puts
        // the question on the staged file; one gone takes it off.
        const flagged = /^Possible duplicate of /.test(review.reason ?? '');
        if (match.existing.sourceHash === prepared.frontmatter.sourceHash && flagged === dupes.length > 0) {
          unchanged++;
          continue;
        }
        (prepared.frontmatter.review as { since: string }).since = since;
        write(match.existing.file, eventFile(prepared.frontmatter, prepared.body));
        updated++;
        continue;
      }
      // Published. Compare, and file the difference for the review.
      const { venue, guessed, silent } = venueFrom(item.location, source);
      const changes = detectChanges(item, match.existing, venue, !guessed && !silent);
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
    totals.ambiguous += ambiguous;
    console.log(
      `    ${staged} new to staging, ${updated} staged files refreshed, ${merged ? `${merged} feed duplicates merged, ` : ''}${unchanged} already known and unchanged, ${changed} published events changed` +
        (ambiguous ? `, ${ambiguous} matching two published listings (flagged)` : ''),
    );
  }
}

console.log(
  `\ningest${dryRun ? ' (dry run, nothing written)' : ''}: ${totals.sources} source${totals.sources === 1 ? '' : 's'}, ${totals.items} items; ` +
    `${totals.staged} staged, ${totals.updated} refreshed, ${totals.unchanged} unchanged, ${totals.changes} changes to published events (${totals.cancellations} cancellations)` +
    `${totals.ambiguous ? `, ${totals.ambiguous} items matching two published listings (flagged as possible duplicates)` : ''}` +
    `${totals.skipped ? `, ${totals.skipped} not staged because the file would not validate (each named above)` : ''}. ` +
    (totals.staged || totals.changes || totals.ambiguous ? 'Next: npm run review.' : ''),
);

if (reportPath) {
  const md = [`### Ingest, ${today}`, ''];
  md.push(`${totals.sources} confirmed feed${totals.sources === 1 ? '' : 's'} read, ${totals.items} items: ${totals.staged} new to staging, ${totals.changes} change${totals.changes === 1 ? '' : 's'} to published events.`);
  if (problems.length) {
    md.push('', `**What kept events out (${problems.length}).** A feed that is not read stages nothing this week; run the workflow again once it answers.`, '');
    for (const p of problems) md.push(`- ${p}`);
  } else md.push('', 'Every confirmed feed was read.');
  md.push('');
  writeFileSync(reportPath, md.join('\n'));
}
