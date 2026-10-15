#!/usr/bin/env node
/**
 * The review without a person at the prompt, under the standing rules in
 * scripts/lib/auto-review.ts: a staged event from the organizer's own
 * confirmed feed, with a venue, a future date and nothing in doubt, is
 * published with its facts as the feed gave them and the organizer's words
 * quoted as its own; a change the same feed made to a listing's time, venue
 * or status is written in. Everything else stays for `npm run review`, and
 * the run says why, item by item.
 *
 *   npm run auto-review                        # every live town, writes the files
 *   npm run auto-review -- --dry-run           # decide and report, write nothing
 *   npm run auto-review -- --town=lyons
 *   npm run auto-review -- --by="the weekly ingest workflow"   # who stands behind the run (verifiedBy)
 *   npm run auto-review -- --report=/tmp/auto-review.md         # the same report as Markdown, for a pull request
 *
 * Staged places are never approved here: each is held for a reason that
 * needs a site read. Then `npm run validate`, commit.
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, renameSync, unlinkSync, writeFileSync } from 'node:fs';
import { basename, dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'astro/zod';
import { allTowns, LIVE_TOWNS } from '../src/config/index.ts';
import { eventSchema, type Source } from '../src/content/schemas.ts';
import { addDays, dayKey, startOfDay } from '../src/lib/dates.ts';
import { readRegistry } from '../src/lib/sources.ts';
import { decideChange, decideEvent, type PublishedEvent } from './lib/auto-review.ts';
import { parseFrontmatter } from './lib/frontmatter.ts';
import { readQueue } from './lib/review.ts';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const contentDir = join(root, 'content');
const args = process.argv.slice(2);
const opt = (name: string) => args.find((a) => a.startsWith(`--${name}=`))?.split('=').slice(1).join('=');
const dryRun = args.includes('--dry-run');
const onlyTown = opt('town');
const by = opt('by') ?? process.env.REVIEWER ?? 'standing rules (scripts/auto-review.ts)';
const reportPath = opt('report');
const today = dayKey(new Date());

const towns = allTowns.filter((t) => (onlyTown ? t.slug === onlyTown : LIVE_TOWNS.includes(t.slug)));
if (onlyTown && towns.length === 0) {
  console.error(`auto-review: no town "${onlyTown}". Towns: ${allTowns.map((t) => t.slug).join(', ')}`);
  process.exit(2);
}

const schema = eventSchema(() => z.string());

/** Every published event in a town, one entry per date for a weekly series, as the duplicate check needs. */
function publishedEvents(town: string): PublishedEvent[] {
  const dir = join(contentDir, town, 'events');
  if (!existsSync(dir)) return [];
  const out: PublishedEvent[] = [];
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
    const starts = [d.start];
    if (d.repeat === 'weekly' && d.until) {
      // By wall-clock weeks, as the site expands it (src/lib/events.ts), not 7×24 hours.
      const lastStart = addDays(startOfDay(d.until), 1).getTime();
      for (let t = addDays(d.start, 7); t.getTime() < lastStart; t = addDays(t, 7)) starts.push(t);
    }
    for (const start of starts) out.push({ file: relative(root, file), title: d.title, start });
  }
  return out;
}

interface TownReport {
  name: string;
  approved: string[];
  applied: string[];
  left: Array<{ what: string; why: string[] }>;
  places: number;
}

const reports: TownReport[] = [];
const totals = { approved: 0, applied: 0, leftEvents: 0, leftChanges: 0, places: 0 };

for (const town of towns) {
  const queue = readQueue(town, contentDir);
  if (queue.length === 0) continue;
  let sources: Source[] = [];
  try {
    sources = readRegistry(town.slug, contentDir).sources;
  } catch (err) {
    console.error(`  ${town.name}: registry not read (${(err as Error).message}); nothing approved`);
  }
  const sourceById = (id: string | undefined) => (id ? sources.find((s) => s.id === id) : undefined);
  const published = publishedEvents(town.slug);
  const report: TownReport = { name: town.name, approved: [], applied: [], left: [], places: 0 };
  for (const item of queue) {
    if (item.kind === 'place') {
      report.places++;
      continue;
    }
    if (item.kind === 'change') {
      const eventText = readFileSync(item.eventFile, 'utf8');
      const title = String(parseFrontmatter(eventText).data.title ?? item.change.slug);
      const what = `${title}: ${item.change.changes.map((c) => `${c.field} ${c.was} → ${c.now}`).join('; ')}`;
      const verdict = decideChange(eventText, item.change, { source: sourceById(item.change.sourceId), today, by });
      if (!verdict.approve) {
        report.left.push({ what: `change · ${what}`, why: verdict.reasons });
        continue;
      }
      if (!dryRun) {
        writeFileSync(item.eventFile, verdict.text);
        unlinkSync(item.file);
      }
      report.applied.push(`${what} (${relative(root, item.eventFile)})`);
      // The listing now says what the source says; a later staged item on the same day compares against it.
      continue;
    }
    const text = readFileSync(item.file, 'utf8');
    const target = join(contentDir, town.slug, 'events', basename(item.file));
    const what = `${item.data.title} (${String(item.data.start ?? '').slice(0, 10)})`;
    const verdict = decideEvent(text, {
      town,
      source: sourceById(typeof item.data.sourceId === 'string' ? item.data.sourceId : undefined),
      published,
      today,
      by,
      targetExists: existsSync(target),
    });
    if (!verdict.approve) {
      report.left.push({ what: `event · ${what}`, why: verdict.reasons });
      continue;
    }
    if (!dryRun) {
      mkdirSync(dirname(target), { recursive: true });
      writeFileSync(target, verdict.text);
      unlinkSync(item.file);
    }
    report.approved.push(`${what} ← ${item.data.sourceId} → ${relative(root, target)}`);
    // Approved this run: a second staged copy of the same event is now a duplicate.
    const d = schema.safeParse(parseFrontmatter(verdict.text).data);
    if (d.success) published.push({ file: relative(root, target), title: d.data.title, start: d.data.start });
  }
  reports.push(report);
  totals.approved += report.approved.length;
  totals.applied += report.applied.length;
  totals.leftEvents += report.left.filter((l) => l.what.startsWith('event')).length;
  totals.leftChanges += report.left.filter((l) => l.what.startsWith('change')).length;
  totals.places += report.places;
}

// ---- the report ---------------------------------------------------------

const line = (s = '') => console.log(s);
line(`Auto-review — ${today} (Denver)${dryRun ? ' — dry run, nothing written' : ''}`);
line('='.repeat(72));
for (const r of reports) {
  line(`${r.name}: ${r.approved.length} approved, ${r.applied.length} applied, ${r.left.length} left${r.places ? `, ${r.places} place${r.places === 1 ? '' : 's'} for the review` : ''}`);
  for (const a of r.approved) line(`  approved  ${a}`);
  for (const a of r.applied) line(`  applied   ${a}`);
  for (const l of r.left) line(`  left      ${l.what}\n            ${l.why.join('; ')}`);
}
line();
const left = totals.leftEvents + totals.leftChanges + totals.places;
line(
  `auto-review: ${totals.approved} event${totals.approved === 1 ? '' : 's'} approved, ${totals.applied} change${totals.applied === 1 ? '' : 's'} applied; ` +
    `${left} left for npm run review (${totals.leftEvents} events, ${totals.places} places, ${totals.leftChanges} changes).` +
    (dryRun ? ' Dry run: nothing written.' : totals.approved || totals.applied ? ' Run npm run validate, then commit.' : ''),
);

if (reportPath) {
  const md: string[] = [];
  md.push(`### Auto-review, ${today}`);
  md.push('');
  md.push(
    `${totals.approved} event${totals.approved === 1 ? '' : 's'} approved and ${totals.applied} change${totals.applied === 1 ? '' : 's'} applied under the standing rules (scripts/lib/auto-review.ts): the organizer's own confirmed feed, a named venue, a future date, no duplicate. ` +
      `${left} item${left === 1 ? '' : 's'} left for \`npm run review\`: ${totals.leftEvents} events, ${totals.places} places, ${totals.leftChanges} changes.`,
  );
  for (const r of reports) {
    md.push('', `#### ${r.name}`);
    for (const a of r.approved) md.push(`- approved: ${a}`);
    for (const a of r.applied) md.push(`- applied: ${a}`);
    for (const l of r.left) md.push(`- left: ${l.what} — ${l.why.join('; ')}`);
    if (r.places) md.push(`- ${r.places} staged place${r.places === 1 ? '' : 's'} wait for a person`);
  }
  md.push('');
  writeFileSync(reportPath, md.join('\n'));
}
