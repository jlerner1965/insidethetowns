#!/usr/bin/env node
/**
 * The review without a person at the prompt, under the standing rules in
 * scripts/lib/auto-review.ts: a staged event from the organizer's own
 * confirmed feed, with a venue, a future date and nothing in doubt, is
 * published with its facts as the feed gave them and the organizer's words
 * quoted as its own; a change the same feed made to a listing's time, venue
 * or status is written in. A staged event whose dates have all passed is
 * deleted: it could only go up as over, so there is nothing to rule on, and
 * the report lists it. Everything else stays for `npm run review`, and the
 * run says why, item by item.
 *
 *   npm run auto-review                        # every live town, writes the files
 *   npm run auto-review -- --dry-run           # decide and report, write nothing
 *   npm run auto-review -- --town=lyons
 *   npm run auto-review -- --by="the weekly ingest workflow"   # who stands behind the run (verifiedBy)
 *   npm run auto-review -- --report=/tmp/auto-review.md         # the same report as Markdown, for a pull request
 *   npm run auto-review -- --due=14 --report=/tmp/due.md        # only what waits for a person and is dated in the next 14 days; writes nothing
 *
 * A listing the re-check or the ingest flagged (`changeFlag`) is a
 * person's call and is never touched here. Until 1 November 2026 the queue's
 * flagged listings fell through to the staged-event branch, and a flagged
 * listing whose date had passed was deleted from the published folder (five
 * that day: two Erie meetings, Longmont's Vote Early Day, Windsor's two
 * cemetery tours, each flagged and never ruled on).
 *
 * `--due` is the list the nightly re-check's pull request opens with: every
 * staged event, staged change and flagged listing with a date in the window,
 * soonest first, with the reasons the rules would not approve it. A staged
 * event whose date passes is deleted without ever being listed, and a flag
 * left past its date means the guide showed the old fact on the day, so the
 * list is what a person decides before the date or loses.
 *
 * Staged places are never approved here: each is held for a reason that
 * needs a site read. Then `npm run validate`, commit.
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs';
import { basename, dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'astro/zod';
import { allTowns, LIVE_TOWNS } from '../src/config/index.ts';
import { eventSchema, type Source } from '../src/content/schemas.ts';
import { addDays, dayKey, formatDayLong, parseLocal, startOfDay } from '../src/lib/dates.ts';
import { isOver } from '../src/lib/events.ts';
import { readRegistry } from '../src/lib/sources.ts';
import { decideChange, decideEvent, type PublishedEvent } from './lib/auto-review.ts';
import { parseFrontmatter } from './lib/frontmatter.ts';
import { occurrences } from './lib/recheck.ts';
import { readQueue } from './lib/review.ts';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const contentDir = join(root, 'content');
const args = process.argv.slice(2);
const opt = (name: string) => args.find((a) => a.startsWith(`--${name}=`))?.split('=').slice(1).join('=');
const dryRun = args.includes('--dry-run');
const onlyTown = opt('town');
const by = opt('by') ?? process.env.REVIEWER ?? 'standing rules (scripts/auto-review.ts)';
const reportPath = opt('report');
const dueDays = opt('due') !== undefined ? Number(opt('due')) : undefined;
if (dueDays !== undefined && !(Number.isInteger(dueDays) && dueDays > 0)) {
  console.error('auto-review: --due wants a number of days, as --due=14');
  process.exit(2);
}
// The due list reads; it never writes.
const writing = !dryRun && dueDays === undefined;
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
    // Every show of a production is a date it holds: read as its first show
    // alone, a later show staged from the feed looked new and was published
    // beside the file that lists it (Castle Rock, 1 November 2026).
    if (d.performances?.length) starts.splice(0, starts.length, ...d.performances.map((p) => p.start));
    const seriesUntil = d.repeat === 'weekly' && d.until ? d.until : undefined;
    for (const start of starts) out.push({ file: relative(root, file), title: d.title, start, ...(seriesUntil ? { seriesUntil } : {}) });
  }
  return out;
}

/**
 * Whether every date a staged listing has is behind us, by the site's own
 * expired-event rule (isOver): a weekly series or a run still going is not.
 * A file the schema refuses is judged on its raw dates.
 */
function stagedIsOver(text: string): boolean {
  const raw = parseFrontmatter(text).data as Record<string, unknown>;
  const parsed = schema.safeParse(raw);
  if (parsed.success) return isOver({ data: parsed.data } as never);
  const date = (v: unknown) => (typeof v === 'string' && v ? parseLocal(v) : undefined);
  const start = date(raw.start);
  if (!start) return false;
  return isOver({ data: { start, end: date(raw.end), until: date(raw.until), repeat: raw.repeat, allDay: raw.allDay === true } } as never);
}

/** A thing a person has to rule on before its date, for the due list. */
interface Due {
  day: string;
  town: string;
  what: string;
  why: string;
  file: string;
}
const due: Due[] = [];
const dueFrom = startOfDay(new Date());
const dueTo = addDays(dueFrom, dueDays ?? 0);

/** The listing's first date in the due window, if it has one there. */
function nextDue(text: string): string | undefined {
  if (dueDays === undefined) return undefined;
  const parsed = schema.safeParse(parseFrontmatter(text).data);
  if (!parsed.success) {
    const raw = String(parseFrontmatter(text).data.start ?? '').slice(0, 10);
    return raw >= dayKey(dueFrom) && raw < dayKey(dueTo) ? raw : undefined;
  }
  const d = parsed.data;
  const at = occurrences({ slug: '', title: d.title, start: d.start, end: d.end, allDay: d.allDay, repeat: d.repeat, until: d.until, status: d.status, performances: d.performances?.map((p) => p.start) }, dueFrom, dueTo)[0];
  return at ? dayKey(at) : undefined;
}

interface TownReport {
  name: string;
  dropped: string[];
  approved: string[];
  applied: string[];
  left: Array<{ what: string; why: string[] }>;
  places: number;
}

const reports: TownReport[] = [];
const totals = { dropped: 0, approved: 0, applied: 0, leftEvents: 0, leftChanges: 0, places: 0 };

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
  const report: TownReport = { name: town.name, dropped: [], approved: [], applied: [], left: [], places: 0 };
  for (const item of queue) {
    if (item.kind === 'place') {
      report.places++;
      continue;
    }
    if (item.kind === 'flag') {
      // A person's call: the source said something else (the note says what). Never approved, never deleted here.
      const day = nextDue(readFileSync(item.file, 'utf8'));
      if (day) due.push({ day, town: town.name, what: `flagged listing · ${String(item.data.title ?? basename(item.file))}`, why: item.note || 'flagged for review', file: relative(root, item.file) });
      continue;
    }
    if (item.kind === 'change') {
      const eventText = readFileSync(item.eventFile, 'utf8');
      const title = String(parseFrontmatter(eventText).data.title ?? item.change.slug);
      const what = `${title}: ${item.change.changes.map((c) => `${c.field} ${c.was} → ${c.now}`).join('; ')}`;
      const verdict = decideChange(eventText, item.change, { source: sourceById(item.change.sourceId), today, by });
      if (!verdict.approve) {
        report.left.push({ what: `change · ${what}`, why: verdict.reasons });
        const day = nextDue(eventText);
        if (day) due.push({ day, town: town.name, what: `change waiting · ${what}`, why: verdict.reasons.join('; '), file: relative(root, item.eventFile) });
        continue;
      }
      if (writing) {
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
    if (stagedIsOver(text)) {
      if (writing) unlinkSync(item.file);
      report.dropped.push(`${what} (${relative(root, item.file)})`);
      continue;
    }
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
      const day = nextDue(text);
      if (day) due.push({ day, town: town.name, what: `staged event · ${item.data.title}`, why: verdict.reasons.join('; '), file: relative(root, item.file) });
      continue;
    }
    // Approvable: the rules publish it on a run that writes, so it is not on the due list.
    if (writing) {
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
  totals.dropped += report.dropped.length;
  totals.approved += report.approved.length;
  totals.applied += report.applied.length;
  totals.leftEvents += report.left.filter((l) => l.what.startsWith('event')).length;
  totals.leftChanges += report.left.filter((l) => l.what.startsWith('change')).length;
  totals.places += report.places;
}

// ---- the due list ---------------------------------------------------------

if (dueDays !== undefined) {
  due.sort((a, b) => a.day.localeCompare(b.day) || a.town.localeCompare(b.town) || a.what.localeCompare(b.what));
  const md: string[] = [];
  md.push(`## Waiting for a person, dated in the next ${dueDays} days (${due.length})`, '');
  if (!due.length) md.push('Nothing in staging or flagged has a date in the window.');
  else {
    md.push(
      'Decide each before its date. A staged event whose date passes is deleted without ever being listed; a flagged listing shows its old fact until someone rules. ' +
        'Publish, decline or fix with `npm run review -- --town=<town>`; the reason after each is why the standing rules would not.',
      '',
    );
    // A trash day, a closure, a meeting the feed gave no room for: rarely a listing, and a page of them hid the shows and markets.
    const notice = (d: Due) => d.what.startsWith('staged event') && /service schedule|closure notice|the feed gives no venue|is not a place/.test(d.why) && !/held by the editor/.test(d.why);
    const row = (d: Due) => `- **${formatDayLong(parseLocal(d.day))}**, ${d.town}: ${d.what} — ${d.why} (\`${d.file}\`)`;
    for (const d of due.filter((x) => !notice(x))) md.push(row(d));
    const notices = due.filter(notice);
    if (notices.length) {
      md.push('', `Notices and listings with no place (${notices.length}): the rules let these lapse unless someone gives one a venue.`, '');
      for (const d of notices) md.push(`- ${formatDayLong(parseLocal(d.day))}, ${d.town}: ${d.what.replace(/^staged event · /, '')} (${d.why})`);
    }
  }
  md.push('');
  const out = md.join('\n');
  console.log(out);
  if (reportPath) writeFileSync(reportPath, out);
  process.exit(0);
}

// ---- the report ---------------------------------------------------------

const line = (s = '') => console.log(s);
line(`Auto-review — ${today} (Denver)${dryRun ? ' — dry run, nothing written' : ''}`);
line('='.repeat(72));
for (const r of reports) {
  line(`${r.name}: ${r.dropped.length} past dropped, ${r.approved.length} approved, ${r.applied.length} applied, ${r.left.length} left${r.places ? `, ${r.places} place${r.places === 1 ? '' : 's'} for the review` : ''}`);
  for (const a of r.dropped) line(`  dropped   ${a}`);
  for (const a of r.approved) line(`  approved  ${a}`);
  for (const a of r.applied) line(`  applied   ${a}`);
  for (const l of r.left) line(`  left      ${l.what}\n            ${l.why.join('; ')}`);
}
line();
const left = totals.leftEvents + totals.leftChanges + totals.places;
line(
  `auto-review: ${totals.dropped} past event${totals.dropped === 1 ? '' : 's'} dropped, ${totals.approved} event${totals.approved === 1 ? '' : 's'} approved, ${totals.applied} change${totals.applied === 1 ? '' : 's'} applied; ` +
    `${left} left for npm run review (${totals.leftEvents} events, ${totals.places} places, ${totals.leftChanges} changes).` +
    (dryRun ? ' Dry run: nothing written.' : totals.dropped || totals.approved || totals.applied ? ' Run npm run validate, then commit.' : ''),
);

if (reportPath) {
  const md: string[] = [];
  md.push(`### Auto-review, ${today}`);
  md.push('');
  md.push(
    `${totals.approved} event${totals.approved === 1 ? '' : 's'} approved and ${totals.applied} change${totals.applied === 1 ? '' : 's'} applied under the standing rules (scripts/lib/auto-review.ts): the organizer's own confirmed feed, a named venue, a future date, no duplicate. ` +
      `${left} item${left === 1 ? '' : 's'} left for \`npm run review\`: ${totals.leftEvents} events, ${totals.places} places, ${totals.leftChanges} changes.` +
      (totals.dropped ? ` ${totals.dropped} staged event${totals.dropped === 1 ? '' : 's'} whose dates had all passed ${totals.dropped === 1 ? 'was' : 'were'} deleted.` : ''),
  );
  for (const r of reports) {
    md.push('', `#### ${r.name}`);
    for (const a of r.dropped) md.push(`- dropped (past): ${a}`);
    for (const a of r.approved) md.push(`- approved: ${a}`);
    for (const a of r.applied) md.push(`- applied: ${a}`);
    for (const l of r.left) md.push(`- left: ${l.what} — ${l.why.join('; ')}`);
    if (r.places) md.push(`- ${r.places} staged place${r.places === 1 ? '' : 's'} wait for a person`);
  }
  md.push('');
  writeFileSync(reportPath, md.join('\n'));
}
