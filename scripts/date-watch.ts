#!/usr/bin/env node
/**
 * The date watch for traditions (the owner, 18 November 2026): about eight
 * weeks before a record's typical window opens, read the organizer's page
 * again for the next date. The rule for what is watched and what a page
 * says is src/lib/date-watch.ts; this script fetches and writes.
 *
 *   npm run date-watch                                  # report only
 *   npm run date-watch -- --write --report=/tmp/watch.md --by="the nightly re-check workflow"
 *   npm run date-watch -- --windows --write             # record every record's typical window (dateWindow)
 *   npm run date-watch -- --records=lyons-parade-of-lights --today=2027-10-10   # a dry run as of a day
 *
 * With --write:
 *   one date for the watched year on the page, in or within three weeks of
 *               the window → that year's entry is written `confirmed` with
 *               the date (two to four consecutive days: the first and the
 *               last, as `date` and `endDate`), checked today; the title, the
 *               meta description, the Event JSON-LD and the sitemap's lastmod
 *               follow from the record at the next build;
 *   no date     → that year's entry is written `not-announced`, checked today,
 *               so the page says when it was last looked for (once a week at
 *               most: WATCH_REREAD_DAYS);
 *   several, or no reading (a bot check, a refusal, robots.txt) → nothing
 *               written; the report says so, and three weeks before the
 *               window the record is on the needs-me list (docs/needs-me.md).
 *
 * A record's window only grows: --windows sets a missing one from its dated
 * years and widens one a new date falls outside. Nothing reaches a site
 * until the nightly pull request (.github/workflows/recheck-events.yml) is
 * merged.
 */
import { execFile } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import { candidateDates, deriveDateWindow, watchState, WATCH_REREAD_DAYS, type DateWindow } from '../src/lib/date-watch.ts';
import { dayKey } from '../src/lib/dates.ts';
import type { TraditionRecord, TraditionYear } from '../src/lib/traditions.ts';
import { parseFrontmatter } from './lib/frontmatter.ts';
import { robotsFor, TIMEOUT, UA } from './lib/probe.ts';
import { isAllowed } from './lib/robots.ts';
import { jsonLdEvents, pageText } from './lib/recheck.ts';
import { setWindow, setYear, yearBlock } from './lib/tradition-edit.ts';

const run = promisify(execFile);
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DIRS = [join(root, 'content/hub/traditions'), join(root, 'test/fixtures/traditions')];

const args = process.argv.slice(2);
const opt = (name: string) => args.find((a) => a.startsWith(`--${name}=`))?.split('=').slice(1).join('=');
const write = args.includes('--write');
const windowsOnly = args.includes('--windows');
const only = opt('records')?.split(',').map((s) => s.trim()).filter(Boolean);
const reportPath = opt('report');
const by = opt('by') ?? 'run by hand';
const today = opt('today') ?? dayKey(new Date());
const realToday = dayKey(new Date());

interface RecordFile {
  file: string;
  text: string;
  record: TraditionRecord;
}

function records(): RecordFile[] {
  const out: RecordFile[] = [];
  for (const dir of DIRS) {
    if (!existsSync(dir)) continue;
    for (const name of readdirSync(dir).sort()) {
      if (!name.endsWith('.md') || name.startsWith('_')) continue;
      const file = join(dir, name);
      const text = readFileSync(file, 'utf8');
      try {
        const data = parseFrontmatter(text).data as unknown as TraditionRecord;
        if (typeof data.slug === 'string' && Array.isArray(data.years)) out.push({ file, text, record: normalize(data) });
      } catch {
        continue;
      }
    }
  }
  return out;
}

/** Dates as "YYYY-MM-DD" strings, as the schema reads them. */
function normalize(r: TraditionRecord): TraditionRecord {
  const day = (v: unknown) => (v instanceof Date ? v.toISOString().slice(0, 10) : (v as string | undefined));
  return { ...r, years: r.years.map((y) => ({ ...y, date: day(y.date), endDate: day(y.endDate), checked: day(y.checked)! })) };
}

// ---------------------------------------------------------------- reading

async function fetchText(url: string): Promise<{ code: string; body: string }> {
  for (let attempt = 0; ; attempt++) {
    try {
      const { stdout } = await run('curl', ['-sS', '-L', '--max-time', String(TIMEOUT), '-A', UA, '-H', 'Accept: text/html,application/xhtml+xml,*/*', '-w', '\n%{http_code}', url], { maxBuffer: 64 << 20 });
      const nl = stdout.lastIndexOf('\n');
      return { code: stdout.slice(nl + 1).trim(), body: stdout.slice(0, nl) };
    } catch {
      if (attempt >= 1) return { code: '000', body: '' };
    }
  }
}

type Found = { kind: 'dated'; date: string; endDate?: string } | { kind: 'none' } | { kind: 'several'; dates: string[] } | { kind: 'blocked'; why: string };

async function look(url: string, year: number, window: DateWindow): Promise<Found> {
  const { origin, pathname, search } = new URL(url);
  if (!isAllowed(await robotsFor(origin), pathname + search)) return { kind: 'blocked', why: 'robots.txt asks automated clients not to read it' };
  const got = await fetchText(url);
  if (!/^2/.test(got.code)) return { kind: 'blocked', why: got.code === '000' ? 'no answer' : /^(401|403|429|503)$/.test(got.code) ? `${got.code}, a bot check or a refusal` : `answered ${got.code}` };
  const dates = candidateDates(pageText(got.body), jsonLdEvents(got.body).map((e) => e.startDate ?? '').filter(Boolean), year, window);
  if (!dates.length) return { kind: 'none' };
  if (dates.length === 1) return { kind: 'dated', date: dates[0]! };
  // Two to four consecutive days: one event over a weekend, its first and last day.
  const span = Math.round((Date.parse(`${dates.at(-1)}T12:00:00Z`) - Date.parse(`${dates[0]}T12:00:00Z`)) / 86_400_000);
  if (dates.length <= 4 && span === dates.length - 1) return { kind: 'dated', date: dates[0]!, endDate: dates.at(-1) };
  return { kind: 'several', dates };
}

// ---------------------------------------------------------------- main

const files = records().filter((f) => !only || only.includes(f.record.slug));
const lines: string[] = [];
let written = 0;

// 1. Every record keeps its typical window, widened when a date falls outside it.
let windowsSet = 0;
for (const f of files) {
  const derived = deriveDateWindow(f.record);
  if (!derived) continue;
  const have = f.record.dateWindow;
  const next = have ? { start: [have.start, derived.start].sort()[0]!, end: [have.end, derived.end].sort().at(-1)! } : derived;
  if (have && have.start === next.start && have.end === next.end) continue;
  windowsSet++;
  if (write) {
    f.text = setWindow(f.text, next);
    writeFileSync(f.file, f.text);
  }
  f.record = { ...f.record, dateWindow: next };
}
if (windowsOnly) {
  console.log(`dateWindow: ${windowsSet} record${windowsSet === 1 ? '' : 's'} ${write ? 'written' : 'to write (no --write)'}.`);
  process.exit(0);
}

// 2. The watch: every record within eight weeks of its window, its watched year not yet settled.
interface Row {
  slug: string;
  name: string;
  town: string;
  year: number;
  opens: string;
  days: number;
  state: string;
  result: string;
  written?: string;
}
const rows: Row[] = [];
for (const f of files) {
  if (f.record.fixture) continue;
  const w = watchState(f.record, today);
  if (!w || (w.state !== 'watch' && w.state !== 'needs-me')) continue;
  const row: Row = { slug: f.record.slug, name: f.record.name, town: f.record.town?.name ?? (f.record.statewide ? 'Statewide' : '—'), year: w.year, opens: w.opens, days: w.daysToWindow, state: w.state, result: '' };
  rows.push(row);
  if (w.entry?.checked && Math.round((Date.parse(`${today}T12:00:00Z`) - Date.parse(`${w.entry.checked}T12:00:00Z`)) / 86_400_000) < WATCH_REREAD_DAYS) {
    row.result = `read ${w.entry.checked}; not read again before a week has passed`;
    continue;
  }
  if (f.record.sourceOffline) {
    row.result = `its source is offline (${f.record.sourceOffline})`;
    continue;
  }
  const newest = [...f.record.years].sort((a, b) => b.year - a.year)[0] as TraditionYear | undefined;
  const url = newest?.sourceUrl ?? f.record.sourceUrl;
  const found = await look(url, w.year, f.record.dateWindow!).catch((): Found => ({ kind: 'blocked', why: 'could not be fetched' }));
  if (found.kind === 'blocked') row.result = `not read: ${found.why} (${url})`;
  else if (found.kind === 'several') row.result = `several ${w.year} dates on the page (${found.dates.join(', ')}): a person decides (${url})`;
  else if (found.kind === 'none') {
    row.result = `no ${w.year} date on the page yet (${url})`;
    if (write) {
      f.text = setYear(f.text, w.year, yearBlock({ year: w.year, status: 'not-announced', checked: realToday }));
      writeFileSync(f.file, f.text);
      row.written = 'not announced, checked today';
      written++;
    }
  } else {
    row.result = `the page gives ${found.date}${found.endDate ? ` to ${found.endDate}` : ''} (${url})`;
    // Only an entry that says nothing more than "not announced", or none, is written over.
    const carriesMore = !!w.entry && (w.entry.status !== 'not-announced' || !!w.entry.continues);
    if (write && !carriesMore) {
      f.text = setYear(f.text, w.year, yearBlock({ year: w.year, status: 'confirmed', date: found.date, endDate: found.endDate, checked: realToday }));
      const widened = deriveDateWindow({ years: [...f.record.years.filter((y) => y.year !== w.year), { year: w.year, status: 'confirmed', date: found.date, checked: realToday }] });
      const have = f.record.dateWindow!;
      if (widened && (widened.start < have.start || widened.end > have.end)) f.text = setWindow(f.text, { start: [have.start, widened.start].sort()[0]!, end: [have.end, widened.end].sort().at(-1)! });
      writeFileSync(f.file, f.text);
      row.written = 'confirmed';
      written++;
    } else if (carriesMore) row.result += '; its entry carries more than a date, so a person writes it';
  }
}

const label = (s: string) => (s === 'needs-me' ? 'three weeks or less: on the needs-me list until confirmed' : 'eight weeks or less: watched');
lines.push(
  `Date watch, ${today}${today !== realToday ? ` (as of; run on ${realToday})` : ''}, ${by}: ${rows.length} record${rows.length === 1 ? '' : 's'} within eight weeks of its typical window with no confirmed date for that year. ${windowsSet ? `${windowsSet} window${windowsSet === 1 ? '' : 's'} ${write ? 'recorded or widened' : 'to record'}. ` : ''}${write ? `${written} file${written === 1 ? '' : 's'} written.` : 'Nothing written (no --write).'}`,
);
for (const state of ['needs-me', 'watch']) {
  const group = rows.filter((r) => r.state === state).sort((a, b) => a.days - b.days);
  if (!group.length) continue;
  lines.push('', `## ${label(state)} (${group.length})`, '');
  for (const r of group) lines.push(`- \`content/hub/traditions/${r.slug}.md\` ${r.name}, ${r.town}: ${r.year} window opens ${r.opens} (${r.days >= 0 ? `in ${r.days} days` : `${-r.days} days ago`}); ${r.result}${r.written ? ` *(${r.written})*` : ''}`);
}
const report = lines.join('\n') + '\n';
if (reportPath) writeFileSync(reportPath, report);
console.log(report);
