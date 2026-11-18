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
 * Three lists:
 *   - places waiting for a re-check (`recheckPending`): the source refused
 *     the nightly read, or the place went past its window unread;
 *   - tradition dates not confirmed three weeks before their window
 *     (src/lib/date-watch.ts);
 *   - seasonal roundups that are due with dates missing (src/lib/roundups.ts).
 */
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { getNetworkHub, liveTowns, sectionTowns, type TownConfig } from '../src/config/index.ts';
import { watchState } from '../src/lib/date-watch.ts';
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
const placeRows: Array<{ town: string; title: string; row: string }> = [];
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
    if (typeof d.recheckPending !== 'string' || d.status === 'closed') continue;
    const slug = typeof d.slug === 'string' ? d.slug : name.replace(/\.md$/, '');
    const source = typeof d.source === 'string' ? d.source : typeof d.url === 'string' ? d.url : '';
    placeRows.push({ town: town.name, title: String(d.title), row: `| ${town.name} | [${cell(String(d.title))}](${pageOf(town, slug)}) | ${day(d.verified) ?? 'never'} | ${source ? `<${source}>` : 'none on file'} | ${cell(d.recheckPending)} |` });
  }
}

const places = placeRows.sort((a, b) => a.town.localeCompare(b.town) || a.title.localeCompare(b.title)).map((p) => p.row);

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
  `## Places waiting for a re-check (${places.length})`,
  '',
  'The page is kept, noindex and off every list, and says when it was last checked. **To clear one:** read the source in a browser or call, correct the file to what it says, move `verified` (with `verifiedBy`), delete `recheckPending`. Closed for good: `status: closed` with `closed`, `statusNote` and `statusSource`; its old address becomes 410 at the next redirect-map rebuild.',
  '',
  ...(places.length ? ['| Town | Place | Last checked | Source to read | Why |', '|---|---|---|---|---|', ...places] : ['None.']),
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
  console.log(`docs/needs-me.md: ${places.length} places, ${dates.length} tradition dates, ${roundups.length} roundups.`);
}
