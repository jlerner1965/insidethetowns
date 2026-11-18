#!/usr/bin/env node
/**
 * The needs-me list (the owner, 18 November 2026): what no machine could
 * settle and a person must, read from the files as they stand, written to
 * docs/needs-me.md. The nightly re-check (.github/workflows/recheck-events.yml)
 * runs it after the places re-check and the date watch, so the list in its
 * pull request is tonight's.
 *
 *   npm run needs-me                   # write docs/needs-me.md
 *   npm run needs-me -- --print        # print it instead
 *
 * The lists:
 *   - places for a person (the owner's rules of 18 November 2026): set aside
 *     (`recheckPending`), the read blocked (`readBlocked`: still listed
 *     while inside its window), a possible closure (`closureCheck`), each
 *     with the `npm run confirm-place` command that records a person's read;
 *   - what the nightly date watch read but could not write
 *     (data/hub/date-watch.json): a date with no year, a weekday that does
 *     not fit, a date past or outside the window, several dates, no reading;
 *   - tradition dates not confirmed three weeks before their window
 *     (src/lib/date-watch.ts);
 *   - seasonal roundups that are due with dates missing (src/lib/roundups.ts).
 */
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { getNetworkHub, liveTowns, sectionTowns, type TownConfig } from '../src/config/index.ts';
import { FRESHNESS } from '../src/config/freshness.ts';
import { openFindings, watchState, WATCH_FINDINGS, type WatchFinding } from '../src/lib/date-watch.ts';
import { dayKey } from '../src/lib/dates.ts';
import { roundupsDue } from '../src/lib/roundups.ts';
import { rawRecords } from '../src/lib/tradition-files.ts';
import { parseFrontmatter } from './lib/frontmatter.ts';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const today = dayKey(new Date());
const hub = getNetworkHub();

/** Where a place's page is: its guide's domain, or its town's section on the hub. */
function pageOf(town: TownConfig, slug: string): string {
  if (town.section && town.hubPage) return `https://${hub.domain}/${town.hubPage.town}/places/${slug}/`;
  return `https://${town.domain}/places/${slug}/`;
}

const day = (v: unknown) => (v instanceof Date ? v.toISOString().slice(0, 10) : typeof v === 'string' ? v.slice(0, 10) : undefined);
const cell = (s: string) => s.replace(/\|/g, '\\|').replace(/\n/g, ' ');

// ---------------------------------------------------------------- places
const towns = new Map<string, TownConfig>();
for (const t of [...liveTowns(), ...sectionTowns()]) towns.set(t.slug, t);
type PlaceRow = { town: string; title: string; row: string };
const aside: PlaceRow[] = [];
const blocked: PlaceRow[] = [];
const closures: PlaceRow[] = [];
/** The last day a place is listed by its `verified`: its window's end. */
const listedThrough = (verified: string | undefined, town: TownConfig) => (verified ? new Date(Date.parse(`${verified}T12:00:00Z`) + FRESHNESS.listingDays[town.variant] * 86_400_000).toISOString().slice(0, 10) : undefined);
for (const town of towns.values()) {
  const dir = join(root, 'content', town.slug, 'places');
  if (!existsSync(dir)) continue;
  for (const name of readdirSync(dir).sort()) {
    if (!name.endsWith('.md') || name.startsWith('_')) continue;
    let d: Record<string, unknown>;
    try {
      d = parseFrontmatter(readFileSync(join(dir, name), 'utf8')).data;
    } catch {
      continue;
    }
    if (d.status === 'closed') continue;
    const flag = (k: string) => (typeof d[k] === 'string' ? (d[k] as string) : undefined);
    if (!flag('recheckPending') && !flag('readBlocked') && !flag('closureCheck')) continue;
    const slug = typeof d.slug === 'string' ? d.slug : name.replace(/\.md$/, '');
    const source = typeof d.source === 'string' ? d.source : typeof d.url === 'string' ? d.url : '';
    const verified = day(d.verified);
    const through = listedThrough(verified, town);
    const shown = flag('recheckPending') ? 'no: set aside' : through && through >= today ? `yes, through ${through}` : `no: past its window since ${through ?? '—'}`;
    const cmd = `\`npm run confirm-place -- ${town.slug}/${name.replace(/\.md$/, '')} --how=browser\``;
    const base = { town: town.name, title: String(d.title) };
    const lead = `| ${town.name} | [${cell(String(d.title))}](${pageOf(town, slug)}) | ${verified ?? 'never'} | ${shown} | ${source ? `<${source}>` : 'none on file'}`;
    if (flag('recheckPending')) aside.push({ ...base, row: `${lead} | ${cell(flag('recheckPending')!)} | ${cmd} |` });
    else if (flag('closureCheck')) closures.push({ ...base, row: `${lead} | ${cell(flag('closureCheck')!)} | ${cmd} |` });
    else blocked.push({ ...base, row: `${lead} | ${cell(flag('readBlocked')!)} | ${cmd} |` });
  }
}
const sorted = (rows: PlaceRow[]) => rows.sort((a, b) => a.town.localeCompare(b.town) || a.title.localeCompare(b.title)).map((p) => p.row);
const places = { aside: sorted(aside), blocked: sorted(blocked), closures: sorted(closures) };
const placeTable = (rows: string[]) => (rows.length ? ['| Town | Place | Last verified | Listed now | Source to read | Why | To confirm it |', '|---|---|---|---|---|---|---|', ...rows] : ['None.']);

// ---------------------------------------------------------------- date watch findings
const findingsFile = join(root, WATCH_FINDINGS);
const watchFindings: WatchFinding[] = existsSync(findingsFile) ? (JSON.parse(readFileSync(findingsFile, 'utf8')) as { findings: WatchFinding[] }).findings : [];
// A finding stands until the record's year is settled (a person wrote the date, or the watch did).
const findings = openFindings(watchFindings, rawRecords(root), today).map((f) => `| ${cell(f.name)} | ${cell(f.town)} | ${f.year} | ${f.opens} | ${cell(f.why)} | ${f.text ? cell(`“${f.text}”`) : '—'} | <${f.url}> | ${f.read} | \`content/hub/traditions/${f.slug}.md\` |`);

// ---------------------------------------------------------------- traditions
const records = rawRecords(root).filter((r) => !r.fixture);
const dates = records
  .map((r) => ({ r, w: watchState(r, today) }))
  .filter(({ w }) => w?.state === 'needs-me')
  .sort((a, b) => a.w!.opens.localeCompare(b.w!.opens))
  .map(({ r, w }) => `| ${cell(r.name)} | ${r.town?.name ?? (r.statewide ? 'Statewide' : '')} | ${w!.year} | ${w!.opens} (${w!.daysToWindow >= 0 ? `in ${w!.daysToWindow} days` : `${-w!.daysToWindow} days ago`}) | ${w!.entry?.checked ?? 'not read for that year'} | <${r.sourceUrl}> | \`content/hub/traditions/${r.slug}.md\` |`);

// ---------------------------------------------------------------- roundups
const roundups = roundupsDue(records, today).map(
  (r) => `- **[${r.plural}](https://${hub.domain}${r.path})**, season ${r.opens} to ${r.closes}, due since ${r.dueFrom}${r.late ? ' (under six weeks to go)' : ''}: ${r.missing.length} of ${r.total} without a confirmed date: ${r.missing.map((m) => `${m.name} (${m.town?.name ?? 'statewide'})`).join('; ')}.`,
);

const out = [
  '# Needs me',
  '',
  `*Written by \`npm run needs-me\` (scripts/needs-me.ts) on ${today}, from the files as they stand. The nightly re-check rewrites it; do not edit it by hand.*`,
  '',
  'What no machine could settle. Each line says where to look; the fix is always a person reading the source (or calling), then the file.',
  '',
  '## How to confirm a place by hand',
  '',
  'Read its source in a browser (or call, email or visit). If it is as the file says, run the command in its row, from the repository:',
  '',
  '```bash',
  'npm run confirm-place -- black-hawk/bar-8042 --how=browser',
  '```',
  '',
  'That records a verified read dated today (`verified`, and `verifiedBy` with your name and how), and clears its flags: set aside, read blocked, possible closure. Add `--on=2026-11-20` for the day you checked if it was not today, `--how=phone` (or `email`, `in-person`) for how, and `--note="Hours unchanged"` to keep what you found. Several places go in one command. If something differs (hours, phone), correct the file too. If it has closed for good: `--closed --note="What happened and how you know" --source=<page>`; its old address becomes 410 at the next redirect-map rebuild. Then `npm run validate`, commit and push (or ask Claude to). The nightly run drops it from this list.',
  '',
  `## Places set aside by you (${places.aside.length})`,
  '',
  'Kept, noindex and off every list, until you confirm them. The nightly re-check reads them but never clears them.',
  '',
  ...placeTable(places.aside),
  '',
  `## Possible closures (${places.closures.length})`,
  '',
  'A sign the place may have closed that does not say so in those words: its page gone, a locator that no longer lists it, "Site Closed", a parked domain. Nothing is hidden and nothing becomes a 410 until you confirm it. While its last verified date is inside the window it stays listed; past it, the usual rules apply.',
  '',
  ...placeTable(places.closures),
  '',
  `## Places whose source blocked the nightly read (${places.blocked.length})`,
  '',
  `Flagged on the first blocked read (a bot check, a refusal, robots.txt, no answer). Each stays listed and indexed while its last verified date is inside its window (${FRESHNESS.listingDays['front-range']} days on the Front Range, ${FRESHNESS.listingDays.mountain} in the mountains); past it, the usual rules apply: a guide drops it, a hub section keeps its page noindex as re-check pending. A later read that works clears the flag by itself.`,
  '',
  ...placeTable(places.blocked),
  '',
  `## Dates the watch read but did not write (${findings.length})`,
  '',
  'The nightly date watch writes a date only where the organizer’s page states the year (or gives a weekday that is that date’s in the year), the date is in the future, and it falls inside the record’s typical window. These did not. **To clear one:** read the page, and write the year `confirmed` with its date, `sourceUrl`, the words you read (`readText`) and `checked`, or `canceled` with the reason in the organizer’s words.',
  '',
  ...(findings.length ? ['| Event | Town | Year | Window opens | Why | Words read | Page | Read | File |', '|---|---|---|---|---|---|---|---|---|', ...findings] : ['None.']),
  '',
  `## Tradition dates not confirmed three weeks before their window (${dates.length})`,
  '',
  'The nightly date watch reads the organizer’s page from eight weeks out; these are three weeks out or less with no date for the year. **To clear one:** read the page (or call), and write the year `confirmed` with its date and `checked`, or `canceled` with the reason in the organizer’s words.',
  '',
  ...(dates.length ? ['| Event | Town | Year | Window opens | Last read | Organizer’s page | File |', '|---|---|---|---|---|---|---|', ...dates] : ['None.']),
  '',
  `## Seasonal roundups due with dates missing (${roundups.length})`,
  '',
  'A roundup is due from eight weeks before its season (src/lib/traditions.ts, CURRENT_SEASONS). Report only: nothing fails a build.',
  '',
  ...(roundups.length ? roundups : ['None.']),
  '',
].join('\n');

if (process.argv.includes('--print')) console.log(out);
else {
  writeFileSync(join(root, 'docs/needs-me.md'), out);
  console.log(`docs/needs-me.md: ${places.aside.length} places set aside, ${places.closures.length} possible closures, ${places.blocked.length} reads blocked, ${findings.length} date-watch findings, ${dates.length} tradition dates, ${roundups.length} roundups.`);
}
