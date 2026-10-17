#!/usr/bin/env node
/**
 * Reads every published event due in the next two weeks against its source
 * again, the way the weekly routine says a person should (README, "The
 * weekly content session"), and writes down what it found:
 *
 *   npm run recheck                       # every live town, report only
 *   npm run recheck -- --town=lyons       # one town
 *   npm run recheck -- --write            # stamp confirmations, flag changes
 *   npm run recheck -- --days=14 --report=/tmp/recheck.md --by="the nightly recheck workflow"
 *
 * Where the source is an organizer's feed in the town's registry (the
 * library's iCal, the Town's RSS), the event is matched against the feed
 * item on its day: the exact time, the end time, a cancellation. Otherwise
 * the source page is fetched (robots.txt honoured, the same identification
 * as the link checker) and read: schema.org structured data first, then the
 * visible text (scripts/lib/recheck.ts).
 *
 * With --write:
 *   confirmed   → `verified` moves to today, `verifiedBy` says what was read where;
 *   changed     → `changeFlag: true` and a `changeNote` with the evidence, for
 *                 `npm run review` (the ingest's own convention; nothing else
 *                 on the file is touched, and the site keeps showing the
 *                 listing as it was until a person decides);
 *   unconfirmed → nothing written; the report says what could not be read.
 *   unreadable  → nothing written; the report names the page for a browser check.
 *
 * It never deletes, never moves a file to staging, and never changes a time
 * on its own: the evidence goes in the note, the decision stays with a person.
 * Runs nightly from .github/workflows/recheck-events.yml, which opens a pull
 * request with the report when anything was written.
 */
import { execFile } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import { z } from 'astro/zod';
import { allTowns, LIVE_TOWNS } from '../src/config/index.ts';
import { eventSchema, type Source } from '../src/content/schemas.ts';
import { addDays, dayKey, startOfDay } from '../src/lib/dates.ts';
import { communityCalendar, readRegistry } from '../src/lib/sources.ts';
import { readIcal } from './lib/feeds/ical.ts';
import { readRss } from './lib/feeds/rss.ts';
import type { FeedEvent, Horizon } from './lib/feeds/types.ts';
import { parseFrontmatter } from './lib/frontmatter.ts';
import { yamlString } from './lib/event-files.ts';
import { hostOf, robotsFor, TIMEOUT, UA } from './lib/probe.ts';
import { isAllowed } from './lib/robots.ts';
import { judgeFeed, judgePage, occurrences, type Judgement, type RecheckEvent } from './lib/recheck.ts';
import { getField, removeField, setField } from './lib/review.ts';

const run = promisify(execFile);
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const contentDir = join(root, 'content');

const args = process.argv.slice(2);
const opt = (name: string) => args.find((a) => a.startsWith(`--${name}=`))?.split('=').slice(1).join('=');
const onlyTown = opt('town');
const days = Number(opt('days') ?? 14);
const write = args.includes('--write');
const reportPath = opt('report');
const by = opt('by') ?? 'run by hand';

const now = new Date();
const today = dayKey(now);
const from = startOfDay(now);
const to = addDays(from, days);
const schema = eventSchema(() => z.string());

interface Row {
  town: string;
  slug: string;
  day: string;
  verdict: Judgement['verdict'] | 'gone' | 'aggregator';
  note: string;
  asides: string[];
  written?: string;
}

// ---------------------------------------------------------------- fetching

async function fetchText(url: string): Promise<{ code: string; body: string }> {
  // A dropped connection gets one more try: the Town's server resets one request in several.
  for (let attempt = 0; ; attempt++) {
    try {
      const { stdout } = await run(
        'curl',
        ['-sS', '-L', '--max-time', String(TIMEOUT), '-A', UA, '-H', 'Accept: text/html,application/xhtml+xml,text/calendar,application/rss+xml,application/xml,*/*', '-w', '\n%{http_code}', url],
        { maxBuffer: 64 << 20 },
      );
      const nl = stdout.lastIndexOf('\n');
      return { code: stdout.slice(nl + 1).trim(), body: stdout.slice(0, nl) };
    } catch {
      if (attempt >= 1) return { code: '000', body: '' };
    }
  }
}

async function allowed(url: string): Promise<boolean> {
  const { origin, pathname, search } = new URL(url);
  return isAllowed(await robotsFor(origin), pathname + search);
}

const pages = new Map<string, Promise<{ code: string; body: string } | 'robots'>>();
function page(url: string) {
  if (!pages.has(url)) pages.set(url, allowed(url).then((ok) => (ok ? fetchText(url) : 'robots')));
  return pages.get(url)!;
}

const feeds = new Map<string, Promise<FeedEvent[] | string>>();
function feed(source: Source): Promise<FeedEvent[] | string> {
  const url = source.feedUrl!;
  if (!feeds.has(url)) {
    feeds.set(
      url,
      (async () => {
        if (!(await allowed(url)) && source.robots !== 'subscribe') return 'robots.txt asks automated clients not to read this feed';
        const { code, body } = await fetchText(url);
        if (!/^2/.test(code)) return `the feed answered ${code}`;
        const horizon: Horizon = { from, to: addDays(to, 1) };
        if (/BEGIN:VCALENDAR/.test(body)) return readIcal(body, horizon);
        if (/<rss|<feed/i.test(body)) return readRss(body, horizon).events;
        return 'the feed is neither iCalendar nor RSS';
      })(),
    );
  }
  return feeds.get(url)!;
}

// ---------------------------------------------------------------- events

function published(town: string): { file: string; event: RecheckEvent; text: string }[] {
  const dir = join(contentDir, town, 'events');
  if (!existsSync(dir)) return [];
  const out: { file: string; event: RecheckEvent; text: string }[] = [];
  for (const name of readdirSync(dir).sort()) {
    if (!name.endsWith('.md') || name.startsWith('_')) continue;
    const file = join(dir, name);
    const text = readFileSync(file, 'utf8');
    let data: Record<string, unknown>;
    try {
      data = parseFrontmatter(text).data;
    } catch {
      continue;
    }
    const parsed = schema.safeParse(data);
    if (!parsed.success) continue;
    const d = parsed.data;
    if (d.status !== 'scheduled') continue;
    out.push({
      file,
      text,
      event: {
        slug: name.replace(/\.md$/, ''),
        title: d.title,
        start: d.start,
        end: d.end,
        allDay: d.allDay,
        repeat: d.repeat,
        until: d.until,
        performances: d.performances?.map((p) => (p instanceof Date ? p : (p as { start: Date }).start)),
        cost: d.cost,
        url: d.url,
        source: d.source,
        sourceId: d.sourceId,
        status: d.status,
      },
    });
  }
  return out;
}

/** The registry feed this event's source is read from, by id or by host. */
function feedFor(e: RecheckEvent, sources: Source[]): Source | undefined {
  const withFeed = sources.filter((s) => s.feedUrl && s.status === 'confirmed');
  if (e.sourceId) {
    const byId = withFeed.find((s) => s.id === e.sourceId);
    if (byId) return byId;
  }
  const host = e.source ? hostOf(e.source)?.replace(/^www\./, '') : undefined;
  if (!host) return undefined;
  return withFeed.find((s) => [s.url, s.feedUrl].some((u) => u && hostOf(u)?.replace(/^www\./, '') === host));
}

function feedName(s: Source): string {
  return `the ${s.name} feed`;
}

async function judge(e: RecheckEvent, occurrence: Date, sources: Source[]): Promise<Row['verdict'] | Judgement> {
  if (!e.source) return { verdict: 'unconfirmed', note: 'no source on the file', asides: [] };
  if (communityCalendar(e.source)) return 'aggregator';
  const src = feedFor(e, sources);
  let feedNote = '';
  if (src) {
    const items = await feed(src);
    if (typeof items !== 'string') return judgeFeed(e, occurrence, items, feedName(src));
    // The feed could not be read (robots.txt, a dropped connection): the event's own page is the next best thing.
    feedNote = `${feedName(src)}: ${items}; `;
  }
  const got = await page(e.source);
  if (got === 'robots') return { verdict: 'unreadable', note: `${feedNote}robots.txt asks automated clients not to fetch the source page`, asides: [] };
  if (got.code === '404' || got.code === '410') return 'gone';
  if (!/^2/.test(got.code)) {
    const why = got.code === '000' ? 'no response' : /^(403|429|503)$/.test(got.code) ? `${got.code}, a bot challenge or a refusal` : `answered ${got.code}`;
    return { verdict: 'unreadable', note: `${feedNote}the source page: ${why}`, asides: [] };
  }
  return judgePage(e, occurrence, got.body);
}

// ---------------------------------------------------------------- writing

function stampConfirmed(text: string, note: string): string {
  let out = setField(text, 'verified', yamlString(today));
  out = setField(out, 'verifiedBy', yamlString(`recheck-events (${by}): ${note}`));
  // A flag an earlier re-check raised is answered by this confirmation; a person's or the ingest's stays.
  if ((getField(out, 'changeNote') ?? '').includes('"recheck ')) out = removeField(removeField(out, 'changeFlag'), 'changeNote');
  return out;
}

function flagChanged(text: string, note: string): string {
  let out = setField(text, 'changeFlag', 'true');
  out = setField(out, 'changeNote', yamlString(`recheck ${today}: ${note}`));
  return out;
}

// ---------------------------------------------------------------- main

const towns = allTowns.filter((t) => (onlyTown ? t.slug === onlyTown || onlyTown === 'all' : LIVE_TOWNS.includes(t.slug)));
if (!towns.length) {
  console.error(`No town "${onlyTown}".`);
  process.exit(2);
}

const rows: Row[] = [];
for (const town of towns) {
  const sources = existsSync(join(contentDir, town.slug, 'sources.json')) ? readRegistry(town.slug, contentDir).sources : [];
  for (const { file, event, text } of published(town.slug)) {
    const due = occurrences(event, from, to);
    if (!due.length) continue;
    // The first occurrence in the window is the one the organizer's page shows soonest.
    const occurrence = due[0]!;
    const result = await judge(event, occurrence, sources);
    const row: Row = typeof result === 'string'
      ? { town: town.slug, slug: event.slug, day: dayKey(occurrence), verdict: result, note: result === 'gone' ? 'the source page answers 404' : `source is ${communityCalendar(event.source!)}; cite the organizer's page`, asides: [] }
      : { town: town.slug, slug: event.slug, day: dayKey(occurrence), ...result };
    if (write) {
      const current = readFileSync(file, 'utf8');
      if (row.verdict === 'confirmed' && getField(current, 'verified') !== yamlString(today)) {
        writeFileSync(file, stampConfirmed(current, row.note));
        row.written = 'verified stamped';
      } else if ((row.verdict === 'changed' || row.verdict === 'gone') && !(getField(current, 'changeNote') ?? '').includes(row.note)) {
        writeFileSync(file, flagChanged(current, row.note));
        row.written = 'flagged for review';
      }
    }
    rows.push(row);
    void text;
  }
}

// ---------------------------------------------------------------- report

const order: Row['verdict'][] = ['changed', 'gone', 'aggregator', 'unreadable', 'unconfirmed', 'confirmed'];
const label: Record<Row['verdict'], string> = {
  changed: 'Changed at the source (flagged for review)',
  gone: 'Source page gone (flagged for review)',
  aggregator: 'Source is an aggregated calendar (validation rejects these)',
  unreadable: 'Could not be read by an automated check',
  unconfirmed: 'Reachable, but the date or time was not found on the page',
  confirmed: 'Confirmed against the source',
};
const lines: string[] = [];
lines.push(`Re-check of events in the next ${days} days, ${today}: ${rows.length} event${rows.length === 1 ? '' : 's'} in ${towns.map((t) => t.name).join(', ')}.`);
lines.push('');
lines.push(order.map((v) => `${rows.filter((r) => r.verdict === v).length} ${v}`).join(' · ') + (write ? ` · ${rows.filter((r) => r.written).length} file${rows.filter((r) => r.written).length === 1 ? '' : 's'} written` : ' · nothing written (no --write)'));
for (const v of order) {
  const group = rows.filter((r) => r.verdict === v);
  if (!group.length) continue;
  lines.push('', `## ${label[v]} (${group.length})`, '');
  if (v === 'unreadable') {
    // One reason, one line: a robots.txt that says no covers a whole calendar's worth.
    const byReason = new Map<string, Row[]>();
    for (const r of group) byReason.set(`${r.town}: ${r.note}`, [...(byReason.get(`${r.town}: ${r.note}`) ?? []), r]);
    for (const [reason, rs] of byReason) lines.push(`- ${reason} (${rs.length}): ${rs.map((r) => `\`${r.slug}\` (${r.day})`).join(', ')}`);
    continue;
  }
  for (const r of group) {
    const path = relative(root, join(contentDir, r.town, 'events', `${r.slug}.md`));
    lines.push(`- \`${path}\` (${r.day}): ${r.note}${r.asides.length ? ` — ${r.asides.join('; ')}` : ''}${r.written ? ` *(${r.written})*` : ''}`);
  }
}
const asides = rows.filter((r) => r.verdict === 'confirmed' && r.asides.length);
if (asides.length) {
  lines.push('', `## Confirmed, with a note (${asides.length})`, '');
  for (const r of asides) lines.push(`- \`content/${r.town}/events/${r.slug}.md\`: ${r.asides.join('; ')}`);
}
const report = lines.join('\n') + '\n';
if (reportPath) writeFileSync(reportPath, report);
console.log(report);
