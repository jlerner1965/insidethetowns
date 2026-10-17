#!/usr/bin/env node
/**
 * Reads published events against their sources again every night, the way
 * the weekly routine says a person should (README, "The weekly content
 * session"), writes down what it found, and lists the calls that would settle
 * what no machine can read.
 *
 *   npm run recheck                       # every live town, report only
 *   npm run recheck -- --town=lyons       # one town
 *   npm run recheck -- --write            # stamp confirmations, flag changes
 *   npm run recheck -- --days=14 --report=/tmp/recheck.md --by="the nightly recheck workflow"
 *
 * Which events: everything with a date in the next `--days` (14), and any
 * event whose check is older than ROTATION_DAYS, at its next date however
 * far off, so a confirmation never lapses unread (src/lib/confidence.ts: a
 * series runs FRESHNESS.events.seriesDays past one, a community-calendar
 * listing FRESHNESS.events.calendarDays).
 *
 * How: where the source is an organizer's feed in the town's registry (the
 * Town's RSS, the library's iCal), the item on the day is compared exactly:
 * start, end, cancellation. Otherwise the source page for that date is
 * fetched (robots.txt honoured, the link checker's honest identification)
 * and read: schema.org structured data first, then the visible text. A page
 * that answers but shows nothing (a calendar drawn by JavaScript) is opened
 * once more in a headless browser, when one is installed. A bot challenge is
 * reported, never worked around. A community calendar's page is read the same
 * way, and what it confirms is only that the calendar still lists the event:
 * the event stays listed (src/lib/confidence.ts) until a person confirms it.
 *
 * With --write:
 *   confirmed   → `verified` moves to today, `verifiedBy` says what was read where;
 *   changed     → `changeFlag: true` and a `changeNote` with the evidence, for
 *                 `npm run review`; the site keeps the listing as it was until
 *                 a person decides;
 *   unconfirmed, unreadable → nothing written; the report says what, and the
 *                 call list says whom to ring.
 *
 * It never deletes, never moves a file, and never changes a time on its own.
 * Runs nightly from .github/workflows/recheck-events.yml, which opens a pull
 * request with the report when anything was written.
 */
import { execFile } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import { z } from 'astro/zod';
import { allTowns, LIVE_TOWNS } from '../src/config/index.ts';
import { eventSchema, placeSchema, type Source } from '../src/content/schemas.ts';
import { eventConfidence, eventPresentation } from '../src/lib/confidence.ts';
import { addDays, dayKey, startOfDay } from '../src/lib/dates.ts';
import { communityCalendar, readRegistry } from '../src/lib/sources.ts';
import { readIcal } from './lib/feeds/ical.ts';
import { readRss } from './lib/feeds/rss.ts';
import type { FeedEvent, Horizon } from './lib/feeds/types.ts';
import { parseFrontmatter } from './lib/frontmatter.ts';
import { yamlString } from './lib/event-files.ts';
import { titleTokens } from './lib/ingest.ts';
import { hostOf, robotsFor, TIMEOUT, UA } from './lib/probe.ts';
import { isAllowed } from './lib/robots.ts';
import { judgeFeed, judgePage, occurrences, occurrenceUrl, pageText, type Judgement, type RecheckEvent } from './lib/recheck.ts';
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
/** An event checked longer ago than this is read again at its next date, wherever that falls. */
const ROTATION_DAYS = 21;

const now = new Date();
const today = dayKey(now);
const from = startOfDay(now);
const to = addDays(from, days);
const far = addDays(from, 180);
const schema = eventSchema(() => z.string());

type Verdict = Judgement['verdict'] | 'gone';
interface Row {
  town: string;
  slug: string;
  title: string;
  venue: string;
  day: string;
  verdict: Verdict;
  note: string;
  asides: string[];
  /** The community calendar the event rests on, when it does: a confirmation there keeps it listed, not confirmed. */
  calendar?: string;
  /** Read in the headless browser, after a plain fetch showed nothing. */
  rendered?: boolean;
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
  if (!pages.has(url)) pages.set(url, allowed(url).then((ok): Promise<{ code: string; body: string } | 'robots'> => (ok ? fetchText(url) : Promise.resolve('robots'))));
  return pages.get(url)!;
}

/**
 * A headless browser for the pages that answer with an empty shell and draw
 * their calendar in JavaScript (MainStage's, on 17 October 2026). Optional:
 * the workflow installs one; where none is installed the page is reported as
 * unreadable, as before. Used only after a plain fetch was allowed by
 * robots.txt and answered 2xx, with the same identification.
 */
type Browser = { newPage(o: { userAgent: string }): Promise<{ goto(u: string, o: object): Promise<unknown>; waitForTimeout(ms: number): Promise<void>; content(): Promise<string>; close(): Promise<void> }>; close(): Promise<void> };
let browser: Promise<Browser | undefined> | undefined;
function getBrowser(): Promise<Browser | undefined> {
  browser ??= (async () => {
    try {
      const { chromium } = createRequire(import.meta.url)('playwright') as { chromium: { launch(o?: object): Promise<Browser> } };
      return await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
    } catch {
      return undefined;
    }
  })();
  return browser;
}
const rendered = new Map<string, Promise<string | undefined>>();
function render(url: string): Promise<string | undefined> {
  if (!rendered.has(url)) {
    rendered.set(
      url,
      (async () => {
        const b = await getBrowser();
        if (!b) return undefined;
        const p = await b.newPage({ userAgent: UA });
        try {
          await p.goto(url, { waitUntil: 'networkidle', timeout: 45_000 });
          await p.waitForTimeout(1500);
          return await p.content();
        } catch {
          return undefined;
        } finally {
          await p.close();
        }
      })(),
    );
  }
  return rendered.get(url)!;
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
        const horizon: Horizon = { from, to: far };
        if (/BEGIN:VCALENDAR/.test(body)) return readIcal(body, horizon);
        if (/<rss|<feed/i.test(body)) return readRss(body, horizon).events;
        return 'the feed is neither iCalendar nor RSS';
      })(),
    );
  }
  return feeds.get(url)!;
}

// ---------------------------------------------------------------- events

interface Listing {
  file: string;
  event: RecheckEvent;
  data: z.infer<ReturnType<typeof eventSchema>>;
}

function published(town: string): Listing[] {
  const dir = join(contentDir, town, 'events');
  if (!existsSync(dir)) return [];
  const out: Listing[] = [];
  for (const name of readdirSync(dir).sort()) {
    if (!name.endsWith('.md') || name.startsWith('_')) continue;
    const file = join(dir, name);
    let raw: Record<string, unknown>;
    try {
      raw = parseFrontmatter(readFileSync(file, 'utf8')).data;
    } catch {
      continue;
    }
    const parsed = schema.safeParse(raw);
    if (!parsed.success) continue;
    const d = parsed.data;
    if (d.status !== 'scheduled') continue;
    out.push({
      file,
      data: d,
      event: {
        slug: name.replace(/\.md$/, ''),
        title: d.title,
        venue: d.venue,
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

const feedName = (s: Source) => `the ${s.name} feed`;
const blank = (j: Judgement) => j.verdict === 'unreadable' || (j.verdict === 'unconfirmed' && /does not show/.test(j.note));

async function judge(e: RecheckEvent, occurrence: Date, sources: Source[]): Promise<Judgement & { gone?: boolean; rendered?: boolean }> {
  if (!e.source) return { verdict: 'unconfirmed', note: 'no source page on the file', asides: [] };
  const src = communityCalendar(e.source) ? undefined : feedFor(e, sources);
  let feedNote = '';
  if (src) {
    const items = await feed(src);
    if (typeof items !== 'string') return judgeFeed(e, occurrence, items, feedName(src));
    // The feed could not be read (robots.txt, a dropped connection): the event's own page is the next best thing.
    feedNote = `${feedName(src)}: ${items}; `;
  }
  const url = occurrenceUrl(e.source, occurrence);
  const got = await page(url);
  if (got === 'robots') return { verdict: 'unreadable', note: `${feedNote}robots.txt asks automated clients not to fetch the source page`, asides: [] };
  if (got.code === '404' || got.code === '410') return { verdict: 'changed', note: `the source page${url !== e.source ? ` for ${dayKey(occurrence)}` : ''} answers ${got.code}`, asides: [], gone: true };
  if (!/^2/.test(got.code)) {
    const why = got.code === '000' ? 'no response' : /^(403|429|503)$/.test(got.code) ? `${got.code}, a bot challenge or a refusal` : `answered ${got.code}`;
    return { verdict: 'unreadable', note: `${feedNote}the source page: ${why}`, asides: [] };
  }
  const plain = judgePage(e, occurrence, got.body);
  if (!blank(plain)) return plain;
  // An empty shell, or a page whose calendar did not show the date: once more as a browser draws it.
  const html = await render(url);
  if (!html || pageText(html).length <= pageText(got.body).length) return plain;
  return { ...judgePage(e, occurrence, html), rendered: true };
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

// ---------------------------------------------------------------- the call list

interface Place {
  title: string;
  phone?: string;
  slug: string;
}

function places(town: string): Place[] {
  const dir = join(contentDir, town, 'places');
  if (!existsSync(dir)) return [];
  const ps = placeSchema(() => z.string());
  const out: Place[] = [];
  for (const name of readdirSync(dir)) {
    if (!name.endsWith('.md')) continue;
    try {
      const r = ps.safeParse(parseFrontmatter(readFileSync(join(dir, name), 'utf8')).data);
      if (r.success) out.push({ title: r.data.title, phone: r.data.phone, slug: name.replace(/\.md$/, '') });
    } catch {
      continue;
    }
  }
  return out;
}

/**
 * The guide's own listing for a venue, on the words of its name: "Oskar Blues
 * Grill & Brew" for "Oskar Blues". The town's name is not a match ("Lyons
 * Town Hall" is not "A-Lodge Lyons").
 */
function placeFor(venue: string, list: Place[], townName: string): Place | undefined {
  const skip = titleTokens(townName);
  const words = (s: string) => new Set([...titleTokens(s)].filter((w) => !skip.has(w)));
  const v = words(venue.replace(/\(.*\)/, ''));
  if (!v.size) return undefined;
  let best: { p: Place; score: number } | undefined;
  for (const p of list) {
    const t = words(p.title);
    const shared = [...v].filter((w) => t.has(w)).length;
    const score = shared / Math.min(v.size, t.size || 1);
    if (shared && score >= 0.5 && (!best || score > best.score)) best = { p, score };
  }
  return best?.p;
}

/** The shortest start of a file name that picks out a series: "old-time-jam-at-oskar-blues" for its five dates. */
function prefixOf(slug: string): string {
  return slug.replace(/-\d{4}-\d{2}-\d{2}(-id\d+)?$/, '');
}

// ---------------------------------------------------------------- main

const towns = allTowns.filter((t) => (onlyTown ? t.slug === onlyTown || onlyTown === 'all' : LIVE_TOWNS.includes(t.slug)));
if (!towns.length) {
  console.error(`No town "${onlyTown}".`);
  process.exit(2);
}

const rows: Row[] = [];
interface Call {
  town: string;
  townName: string;
  venue: string;
  phone?: string;
  place?: string;
  /** By the start of the file name, so a series is one line: its title, why it needs a call, its next date. */
  items: Map<string, { title: string; why: string; day: string }>;
}
const calls = new Map<string, Call>();
/** Calls are for what is coming: a date further off than this waits for a later report. */
const CALL_AHEAD = dayKey(addDays(from, 21));
function wantCall(town: string, venue: string, slug: string, title: string, day: string, why: string, list: Place[], townName: string) {
  if (day > CALL_AHEAD) return;
  const place = placeFor(venue, list, townName);
  const key = `${town}|${place?.slug ?? venue}`;
  const entry = calls.get(key) ?? { town, townName, venue: place?.title ?? venue, phone: place?.phone, place: place?.slug, items: new Map() };
  const prefix = prefixOf(slug);
  if (!entry.items.has(prefix) || day < entry.items.get(prefix)!.day) entry.items.set(prefix, { title, why, day });
  calls.set(key, entry);
}

for (const town of towns) {
  const sources = existsSync(join(contentDir, town.slug, 'sources.json')) ? readRegistry(town.slug, contentDir).sources : [];
  const placeList = places(town.slug);
  for (const { file, event, data } of published(town.slug)) {
    const soon = occurrences(event, from, to);
    const checkAge = data.verified ? Math.round((from.getTime() - startOfDay(data.verified).getTime()) / 86_400_000) : Infinity;
    const due = soon.length ? soon : checkAge > ROTATION_DAYS ? occurrences(event, from, far) : [];
    if (!due.length) continue;
    const occurrence = due[0]!;
    const result = await judge(event, occurrence, sources);
    const calendar = communityCalendar(event.source);
    const row: Row = {
      town: town.slug,
      slug: event.slug,
      title: event.title,
      venue: event.venue ?? '',
      day: dayKey(occurrence),
      verdict: result.gone ? 'gone' : result.verdict,
      note: calendar && result.verdict === 'confirmed' ? `still on ${calendar}: ${result.note}` : result.note,
      asides: result.asides,
      calendar,
      rendered: result.rendered,
    };
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
    // Whom to ring: a listing only a call can settle, soonest first. A listed
    // event (a community calendar's, a check gone stale), anything no machine
    // could read, and a series whose confirmed weeks run out within a fortnight.
    const level = eventConfidence(data, now);
    const shown = eventPresentation(data, now);
    const fading = shown.until && dayKey(shown.until) < dayKey(addDays(from, 14));
    const stillListed = level.level === 'listed' && !(row.verdict === 'confirmed' && !calendar);
    // A feed that does not reach the date yet will; that is not a call.
    const early = row.verdict === 'unconfirmed' && /does not reach/.test(row.note);
    if (stillListed || row.verdict === 'unreadable' || (row.verdict === 'unconfirmed' && !early) || fading) {
      const why = stillListed
        ? level.basis === 'calendar' ? 'only on a community calendar' : 'check gone stale'
        : fading ? `series shown only through ${dayKey(shown.until!)}` : row.verdict === 'unreadable' ? 'page cannot be read' : 'page does not show it';
      wantCall(town.slug, event.venue ?? '', event.slug, event.title, row.day, why, placeList, town.name);
    }
  }
  // Staged events a person set aside for a venue to confirm, with a date ahead.
  const stagedDir = join(contentDir, town.slug, 'staging', 'events');
  if (existsSync(stagedDir)) {
    for (const name of readdirSync(stagedDir).sort()) {
      if (!name.endsWith('.md')) continue;
      try {
        const raw = parseFrontmatter(readFileSync(join(stagedDir, name), 'utf8')).data as { review?: { from?: string } };
        if (raw.review?.from !== 'manual') continue;
        const parsed = schema.safeParse(raw);
        if (!parsed.success) continue;
        const d = parsed.data;
        const next = occurrences({ slug: name, title: d.title, start: d.start, end: d.end, allDay: d.allDay, repeat: d.repeat, until: d.until, status: d.status }, from, far)[0];
        if (!next) continue;
        wantCall(town.slug, d.venue, name.replace(/\.md$/, ''), d.title, dayKey(next), 'waiting in staging', placeList, town.name);
      } catch {
        continue;
      }
    }
  }
}
const b = await browser;
await b?.close();

// ---------------------------------------------------------------- report

const order: Verdict[] = ['changed', 'gone', 'unreadable', 'unconfirmed', 'confirmed'];
const label: Record<Verdict, string> = {
  changed: 'Changed at the source (flagged for review)',
  gone: 'Source page gone (flagged for review)',
  unreadable: 'Could not be read by an automated check',
  unconfirmed: 'Reachable, but the date or time was not found on the page',
  confirmed: "Confirmed against the organizer's page or feed",
};
const confirmedOnCalendar = rows.filter((r) => r.verdict === 'confirmed' && r.calendar);
const lines: string[] = [];
lines.push(`Re-check of events, ${today}: the next ${days} days, and anything not checked in ${ROTATION_DAYS}. ${rows.length} event${rows.length === 1 ? '' : 's'} in ${towns.map((t) => t.name).join(', ')}.`);
lines.push('');
lines.push(
  order.map((v) => `${rows.filter((r) => r.verdict === v && !(v === 'confirmed' && r.calendar)).length} ${v}`).join(' · ') +
    ` · ${confirmedOnCalendar.length} still on a community calendar` +
    (write ? ` · ${rows.filter((r) => r.written).length} file${rows.filter((r) => r.written).length === 1 ? '' : 's'} written` : ' · nothing written (no --write)'),
);
if (calls.size) {
  lines.push('', `## Calls to make (${calls.size}), for dates in the next three weeks`, '');
  lines.push('One call settles a venue\'s whole list. Afterwards, `npm run confirm` records it (the line under each venue); if they gave a different time, day or price, edit the file before you push.');
  const first = (c: Call) => [...c.items.values()].map((i) => i.day).sort()[0]!;
  const byTown = new Map<string, Call[]>();
  for (const c of calls.values()) byTown.set(c.townName, [...(byTown.get(c.townName) ?? []), c]);
  for (const [townName, list] of [...byTown.entries()].sort(([a], [b]) => a.localeCompare(b))) {
    lines.push('', `### ${townName}`, '');
    for (const c of list.sort((a, b) => first(a).localeCompare(first(b)))) {
      const items = [...c.items.entries()].sort(([, a], [, b]) => a.day.localeCompare(b.day));
      lines.push(`- **${c.venue}**${c.phone ? `, ${c.phone}` : ', no phone on the guide'}${c.place ? '' : ' (no listing on the guide)'}`);
      for (const [, i] of items) lines.push(`  - ${i.title}, next ${i.day}: ${i.why}`);
      lines.push(`  - \`npm run confirm -- ${c.town} ${items.map(([p]) => p).join(' ')} --how=phone --with="${c.venue}"\``);
    }
  }
}
// Confirmations are counted above and written into each file's verifiedBy; listed one by one they ran the report past what a pull request holds.
for (const v of order.filter((x) => x !== 'confirmed')) {
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
    lines.push(`- \`${path}\` (${r.day}): ${r.note}${r.rendered ? ' (read in a browser)' : ''}${r.asides.length ? ` — ${r.asides.join('; ')}` : ''}${r.written ? ` *(${r.written})*` : ''}`);
  }
}
if (confirmedOnCalendar.length) {
  lines.push('', `## Still on a community calendar, not yet confirmed with the venue (${confirmedOnCalendar.length})`, '');
  lines.push('Shown on the site as listed, with a line saying so; the calls above confirm them.', '');
  for (const r of confirmedOnCalendar) lines.push(`- \`content/${r.town}/events/${r.slug}.md\` (${r.day})${r.written ? ` *(${r.written})*` : ''}`);
}
const asides = rows.filter((r) => r.verdict === 'confirmed' && r.asides.length);
if (asides.length) {
  lines.push('', `## Confirmed, with a note (${asides.length})`, '');
  for (const r of asides) lines.push(`- \`content/${r.town}/events/${r.slug}.md\`: ${r.asides.join('; ')}`);
}
const report = lines.join('\n') + '\n';
if (reportPath) writeFileSync(reportPath, report);
console.log(report);
