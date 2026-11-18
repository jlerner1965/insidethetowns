#!/usr/bin/env node
/**
 * Reads places against their sources again on a rotation (the owner, 18
 * November 2026): every place on the hub (the four full sections and the
 * places kept page by page) and on the seven guides, each well inside its
 * window. The rule for what is due and what a page says is
 * src/lib/place-recheck.ts; this script fetches and writes.
 *
 *   npm run recheck-places                          # tonight's due places, report only
 *   npm run recheck-places -- --write --report=/tmp/places.md --by="the nightly re-check workflow"
 *   npm run recheck-places -- --pending --write     # every place waiting for a re-check
 *   npm run recheck-places -- --places=black-hawk/bar-8042,lyons/oskar-blues   # these, due or not
 *   npm run recheck-places -- --budget=120          # more than a night's worth
 *
 * How: the place's `source` (the page it was checked against) is fetched
 * with the link checker's honest identification, robots.txt honoured; where
 * that gives no reading, the place's own site (`url`) is tried. A page that
 * answers but shows nothing is opened once more in a headless browser, when
 * one is installed (as the events re-check does). A bot check is reported,
 * never worked around.
 *
 * With --write (the owner's rules of 18 November 2026):
 *   confirmed     → `verified` moves to today, `verifiedBy` says what was read
 *                   where, and a `readBlocked` flag is answered;
 *   changed       → `changeFlag: true` and the evidence in `changeNote`, for
 *                   the weekly editor run (weekly-editor.yml) to update;
 *   closed        → the place's page says it closed for good, naming it:
 *                   `status: closed` quoting the page; the next redirect-map
 *                   rebuild answers its old address with 410;
 *   closure-check → any other sign it may have closed (the page gone, a
 *                   locator that no longer lists it, "Site Closed"):
 *                   `closureCheck`, for a person; nothing hidden, no 410;
 *   blocked       → `readBlocked` on the first blocked read, for a person;
 *                   `verified` stays, and the listing stays visible while it
 *                   is inside its window; past it, the usual rules apply.
 *   A place a person set aside (`recheckPending`) is read and reported, and
 *   nothing is written to it: only `npm run confirm-place` clears it.
 *
 * It never deletes a file. Nothing reaches a site until the nightly pull
 * request (.github/workflows/recheck-events.yml) is merged.
 */
import { execFile } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import { liveTowns, sectionTowns, type TownConfig } from '../src/config/index.ts';
import { dayKey } from '../src/lib/dates.ts';
import { FRESHNESS } from '../src/config/freshness.ts';
import { daysBetween, duePlaces, judgePlace, mainHtml, NIGHTLY_BUDGET, type Fetched, type PlaceJudgement, type RecheckPlace } from '../src/lib/place-recheck.ts';
import { writeChanged, writeClosed, writeClosureCheck, writeConfirmed, writeReadBlocked } from './lib/place-edit.ts';
import { parseFrontmatter } from './lib/frontmatter.ts';
import { robotsFor, TIMEOUT, UA } from './lib/probe.ts';
import { isAllowed } from './lib/robots.ts';
import { pageText } from './lib/recheck.ts';

const run = promisify(execFile);
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const contentDir = join(root, 'content');

const args = process.argv.slice(2);
const opt = (name: string) => args.find((a) => a.startsWith(`--${name}=`))?.split('=').slice(1).join('=');
const write = args.includes('--write');
const pendingOnly = args.includes('--pending');
const only = opt('places')?.split(',').map((s) => s.trim()).filter(Boolean);
const onlyTown = opt('town');
const budget = Number(opt('budget') ?? NIGHTLY_BUDGET);
const reportPath = opt('report');
const by = opt('by') ?? 'run by hand';
const today = dayKey(new Date());

// ---------------------------------------------------------------- which places

/** Every town whose places are on a page: the seven guides, the four full sections, the places kept page by page. */
export function recheckTowns(): TownConfig[] {
  const seen = new Map<string, TownConfig>();
  for (const t of [...liveTowns(), ...sectionTowns()]) seen.set(t.slug, t);
  return [...seen.values()];
}

interface PlaceFile extends RecheckPlace {
  file: string;
}

function placeFiles(town: TownConfig): PlaceFile[] {
  const dir = join(contentDir, town.slug, 'places');
  if (!existsSync(dir)) return [];
  const out: PlaceFile[] = [];
  for (const name of readdirSync(dir).sort()) {
    if (!name.endsWith('.md') || name.startsWith('_')) continue;
    const file = join(dir, name);
    let d: Record<string, unknown>;
    try {
      d = parseFrontmatter(readFileSync(file, 'utf8')).data;
    } catch {
      continue;
    }
    const day = (v: unknown) => (v instanceof Date ? v.toISOString().slice(0, 10) : typeof v === 'string' ? v.slice(0, 10) : undefined);
    out.push({
      file,
      town: town.slug,
      slug: typeof d.slug === 'string' ? d.slug : name.replace(/\.md$/, ''),
      title: String(d.title ?? name),
      variant: town.variant,
      status: typeof d.status === 'string' ? d.status : 'open',
      verified: day(d.verified),
      recheckPending: typeof d.recheckPending === 'string' ? d.recheckPending : undefined,
      readBlocked: typeof d.readBlocked === 'string' ? d.readBlocked : undefined,
      closureCheck: typeof d.closureCheck === 'string' ? d.closureCheck : undefined,
      source: typeof d.source === 'string' ? d.source : undefined,
      url: typeof d.url === 'string' ? d.url : undefined,
      phone: typeof d.phone === 'string' ? d.phone : undefined,
      address: typeof d.address === 'string' ? d.address : undefined,
    });
  }
  return out;
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
async function render(url: string): Promise<string | undefined> {
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
}

const reads = new Map<string, Promise<Fetched>>();
function read(url: string): Promise<Fetched> {
  if (!reads.has(url)) {
    reads.set(
      url,
      (async (): Promise<Fetched> => {
        const { origin, pathname, search } = new URL(url);
        if (!isAllowed(await robotsFor(origin), pathname + search)) return 'robots';
        const got = await fetchText(url);
        let html = got.body;
        // An empty shell: once more as a browser draws it, after robots.txt allowed the plain fetch.
        if (/^2/.test(got.code) && pageText(html).length < 200) {
          const drawn = await render(url);
          if (drawn && pageText(drawn).length > pageText(html).length) html = drawn;
        }
        const ok = /^2/.test(got.code);
        return { ...got, text: ok ? pageText(html) : '', main: ok ? pageText(mainHtml(html)) : '' };
      })(),
    );
  }
  return reads.get(url)!;
}

/** The source first; the place's own site where the source gives no reading. */
async function judge(p: RecheckPlace): Promise<PlaceJudgement & { url?: string }> {
  const tries = [p.source && { url: p.source, where: 'the source page' }, p.url && p.url !== p.source && { url: p.url, where: 'the place’s own site' }].filter(Boolean) as Array<{ url: string; where: string }>;
  if (!tries.length) return { verdict: 'blocked', note: 'no source page or site on the file to read' };
  let first: (PlaceJudgement & { url?: string }) | undefined;
  for (const t of tries) {
    let j: PlaceJudgement;
    try {
      j = judgePlace(p, await read(t.url), t.where);
    } catch {
      j = { verdict: 'blocked', note: `${t.where}: could not be fetched` };
    }
    first ??= { ...j, url: t.url };
    if (j.verdict !== 'blocked') return { ...j, url: t.url };
  }
  return first!;
}

// ---------------------------------------------------------------- main

const all = recheckTowns()
  .filter((t) => !onlyTown || t.slug === onlyTown)
  .flatMap(placeFiles);
const chosen = only
  ? all.filter((p) => only.includes(`${p.town}/${p.slug}`))
  : pendingOnly
    ? all.filter((p) => p.recheckPending || p.readBlocked || p.closureCheck)
    : duePlaces(all, today, budget);
const dueCount = duePlaces(all, today, Infinity).length;

interface Row extends PlaceFile {
  j: PlaceJudgement & { url?: string };
  /** Set aside by a person (`recheckPending`): read and reported, never written. */
  setAside: boolean;
  written?: string;
}

/** Whether the listing is shown: inside its window by `verified` (and not set aside), and the last day it is. */
function shown(p: RecheckPlace): { listed: boolean; until?: string } {
  if (!p.verified) return { listed: false };
  const window = FRESHNESS.listingDays[p.variant];
  const until = new Date(Date.parse(`${p.verified}T12:00:00Z`) + window * 86_400_000).toISOString().slice(0, 10);
  return { listed: !p.recheckPending && daysBetween(p.verified, today) <= window, until };
}
const rows: Row[] = [];
// A few at a time: the places share hosts (a casino's six restaurants), and robots.txt is read once per origin.
const queue = [...chosen];
await Promise.all(
  Array.from({ length: 4 }, async () => {
    while (queue.length) {
      const p = queue.shift()!;
      const j = await judge(p);
      const row: Row = { ...p, j, setAside: !!p.recheckPending };
      // A place a person set aside is only read: the person clears it (npm run confirm-place).
      if (write && !row.setAside) {
        const before = readFileSync(p.file, 'utf8');
        let after = before;
        if (j.verdict === 'confirmed') after = writeConfirmed(before, today, by, j.note, j.url!);
        else if (j.verdict === 'changed') after = writeChanged(before, today, j.note, j.url);
        else if (j.verdict === 'closed') after = writeClosed(before, today, j.quote ?? j.note, j.url!);
        else if (j.verdict === 'closure-check') after = writeClosureCheck(before, today, j.note, j.quote, j.url);
        else after = writeReadBlocked(before, today, j.note);
        if (after !== before) {
          writeFileSync(p.file, after);
          row.written = { confirmed: p.readBlocked ? 'verified stamped; blocked flag answered' : 'verified stamped', changed: 'flagged for the editor run', closed: 'marked closed', 'closure-check': 'possible closure, for a person', blocked: 'read blocked, for a person; still listed while fresh' }[j.verdict];
        }
      }
      rows.push(row);
    }
  }),
);
await (await browser)?.close();

// ---------------------------------------------------------------- report

const rel = (r: Row) => `content/${r.town}/places/${r.file.split('/').pop()}`;
const of = (v: string, list = rows.filter((r) => !r.setAside)) => list.filter((r) => r.j.verdict === v).sort((a, b) => rel(a).localeCompare(rel(b)));
const asideRows = rows.filter((r) => r.setAside).sort((a, b) => rel(a).localeCompare(rel(b)));
const listing = (r: Row) => {
  const s = shown(r);
  return s.listed ? `last verified ${r.verified}; stays listed through ${s.until}` : r.recheckPending ? `last verified ${r.verified ?? 'never'}; set aside` : `last verified ${r.verified ?? 'never'}; past its window since ${s.until ?? '—'}, so the usual rules apply`;
};
const lines: string[] = [];
lines.push(
  `Re-check of places, ${today}: ${chosen.length} read of ${all.length} places on the hub and the guides (${dueCount} due or flagged; a place is due at half its window, 45 days on the Front Range, 30 in the mountains${only || pendingOnly ? '' : `; ${budget} a night, flagged ones on top`}).`,
  '',
  `${of('confirmed').length} confirmed · ${of('changed').length} changed · ${of('closed').length} closed · ${of('closure-check').length} possible closures · ${of('blocked').length} read blocked · ${asideRows.length} set aside (read only)` +
    (write ? ` · ${rows.filter((r) => r.written).length} file${rows.filter((r) => r.written).length === 1 ? '' : 's'} written` : ' · nothing written (no --write)'),
);
const section = (title: string, list: Row[], line: (r: Row) => string) => {
  if (!list.length) return;
  lines.push('', `## ${title} (${list.length})`, '');
  for (const r of list) lines.push(`- ${line(r)}${r.written ? ` *(${r.written})*` : ''}`);
};
section('Closed for good, in the place’s own words (status closed; 410 on the next map rebuild)', of('closed'), (r) => `\`${rel(r)}\` ${r.title}: “${r.j.quote}” (${r.j.url})`);
section('Possible closures, for a person to confirm (closureCheck; nothing hidden, no 410)', of('closure-check'), (r) => `\`${rel(r)}\` ${r.title}: ${r.j.note}${r.j.quote ? ` (“${r.j.quote}”)` : ''}${r.j.url ? ` (${r.j.url})` : ''}`);
section('Changed at the source (flagged for the editor run)', of('changed'), (r) => `\`${rel(r)}\` ${r.title}: ${r.j.note}${r.j.url ? ` (${r.j.url})` : ''}`);
section('Read blocked (readBlocked, on the needs-me list; listed while fresh)', of('blocked'), (r) => `\`${rel(r)}\` ${r.title}: ${r.j.note}${r.j.url ? ` (${r.j.url})` : ''}; ${listing(r)}`);
section('Set aside by a person (read only; npm run confirm-place clears it)', asideRows, (r) => `\`${rel(r)}\` ${r.title}: ${r.j.verdict}, ${r.j.note}${r.j.url ? ` (${r.j.url})` : ''}`);
// Confirmations are counted above and written into each file's verifiedBy; listed only when few.
const confirmed = of('confirmed');
if (confirmed.length && confirmed.length <= 40) section('Confirmed', confirmed, (r) => `\`${rel(r)}\` ${r.title}: ${r.j.note}`);
const report = lines.join('\n') + '\n';
if (reportPath) writeFileSync(reportPath, report);
console.log(report);
