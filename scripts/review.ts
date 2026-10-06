#!/usr/bin/env node
/**
 * The review: everything waiting in staging, one item at a time, from one
 * prompt. The last step before anything ingested or held back is published.
 *
 *   npm run review                   # summary, then every live town's queue
 *   npm run review -- --town=lyons   # one town
 *   npm run review -- --summary      # the summary alone
 *   npm run review -- --by="James"   # who is approving (else REVIEWER, else git user.name)
 *
 * The summary first: what is waiting, listings going stale in the next
 * fortnight, sources whose last check failed. Then the queue, cancellations
 * first, then other changes the sources made, then staged places, then
 * staged events by date. At each item:
 *
 *   a  approve   staged: stamp verified and verifiedBy (a place: added), drop the review block,
 *                move the file to the published folder; change: write the
 *                source's new facts into the published file and clear the flag
 *   e  edit      open the file in $EDITOR, then validate it and ask again
 *   r  reject    staged: delete the file; change: clear the flag, keep the listing
 *   o  open      print the source URL (and open it where the OS can)
 *   s  skip      leave it for next time
 *   A  approve the rest of this town's queue
 *   q  quit
 *
 * Nothing is approved without a source. A staged file that lacks one is
 * shown with that said, and `a` refuses until `e` has supplied it.
 */
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, renameSync, unlinkSync, writeFileSync } from 'node:fs';
import { basename, dirname, join, relative, resolve } from 'node:path';
import { createInterface } from 'node:readline/promises';
import { fileURLToPath } from 'node:url';
import { z } from 'astro/zod';
import { allTowns, LIVE_TOWNS } from '../src/config/index.ts';
import { eventSchema, placeSchema } from '../src/content/schemas.ts';
import { dayKey, formatDate } from '../src/lib/dates.ts';
import { readRegistry } from '../src/lib/sources.ts';
import { parseFrontmatter } from './lib/frontmatter.ts';
import { applyChangeText, approveText, dismissChangeText, readQueue, summarize, type QueueItem } from './lib/review.ts';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const contentDir = join(root, 'content');
const args = process.argv.slice(2);
const opt = (name: string) => args.find((a) => a.startsWith(`--${name}=`))?.split('=').slice(1).join('=');
const onlyTown = opt('town');
const summaryOnly = args.includes('--summary');
const today = dayKey(new Date());

const towns = allTowns.filter((t) => (onlyTown ? t.slug === onlyTown : LIVE_TOWNS.includes(t.slug)));
if (onlyTown && towns.length === 0) {
  console.error(`review: no town "${onlyTown}". Towns: ${allTowns.map((t) => t.slug).join(', ')}`);
  process.exit(2);
}

function reviewer(): string {
  const given = opt('by') ?? process.env.REVIEWER;
  if (given) return given;
  const git = spawnSync('git', ['config', 'user.name'], { encoding: 'utf8' });
  return git.status === 0 && git.stdout.trim() ? git.stdout.trim() : 'editor';
}

// ---- the summary --------------------------------------------------------

const line = (s = '') => console.log(s);
line(`Review — ${today} (Denver)`);
line('='.repeat(72));
let anyWaiting = false;
for (const town of towns) {
  const s = summarize(town, contentDir);
  const w = s.waiting;
  const waiting = w.events + w.places + w.changes;
  anyWaiting ||= waiting > 0;
  const parts = [
    waiting
      ? `${waiting} waiting: ${w.events} events, ${w.places} places, ${w.changes} changes${w.cancellations ? ` (${w.cancellations} cancellations)` : ''}`
      : 'nothing waiting',
    s.goingStale.length ? `${s.goingStale.length} listing${s.goingStale.length === 1 ? '' : 's'} going stale in 14 days` : '',
    s.brokenSources.length ? `${s.brokenSources.length} source${s.brokenSources.length === 1 ? '' : 's'} not answering` : '',
  ].filter(Boolean);
  line(`${town.name.padEnd(13)} ${parts.join(' · ')}`);
  for (const g of s.goingStale) line(`               stale ${g.inDays <= 0 ? 'now' : `in ${g.inDays}d`}: ${g.title}  (${relative(root, g.file)})`);
  for (const b of s.brokenSources) line(`               source ${b.id}: ${b.status}${b.note ? ` — ${b.note}` : ''}`);
}
line();
if (summaryOnly || !anyWaiting) {
  if (!anyWaiting) line('Nothing to review.');
  process.exit(0);
}

// ---- the queue ----------------------------------------------------------

const by = reviewer();
const rl = createInterface({ input: process.stdin, output: process.stdout });
// Answers are queued as they arrive rather than read one question at a
// time, which loses a line that comes in before the next question is asked.
// That is how piped input behaves (every line at once), and a run such as
// `printf 'a\ns\n' | npm run review` should do what it says. End of input
// reads as quit.
const answers: string[] = [];
let waiting: ((a: string) => void) | undefined;
let closed = false;
rl.on('line', (l) => {
  if (waiting) {
    const w = waiting;
    waiting = undefined;
    w(l);
  } else answers.push(l);
});
rl.on('close', () => {
  closed = true;
  if (waiting) waiting('q');
});
function ask(prompt: string): Promise<string> {
  if (answers.length) return Promise.resolve(answers.shift()!);
  if (closed) return Promise.resolve('q');
  process.stdout.write(prompt);
  return new Promise((res) => (waiting = res));
}
const schemaFor = { event: eventSchema(() => z.string()), place: placeSchema(() => z.string()) };

function sourceName(town: string, sourceId: string): string {
  try {
    return readRegistry(town, contentDir).sources.find((s) => s.id === sourceId)?.name ?? sourceId;
  } catch {
    return sourceId;
  }
}

function show(item: QueueItem, n: number, total: number) {
  line('-'.repeat(72));
  if (item.kind === 'change') {
    const c = item.change;
    const title = parseFrontmatter(readFileSync(item.eventFile, 'utf8')).data.title;
    line(`[${n}/${total}] ${c.cancel ? 'CANCELLATION' : 'CHANGE'} · ${item.town.name} · ${title}`);
    line(`  published: ${relative(root, item.eventFile)}`);
    for (const ch of c.changes) line(`  ${ch.field}: ${ch.was}  →  ${ch.now}`);
    line(`  says: ${sourceName(item.town.slug, c.sourceId)} on ${dayKey(c.detected)}`);
    line(`  source: ${c.sourceUrl}`);
    return;
  }
  const d = item.data;
  line(`[${n}/${total}] ${item.kind.toUpperCase()} · ${item.town.name} · ${d.title}`);
  if (item.kind === 'event') {
    line(`  when: ${d.start}${d.end ? ` – ${d.end}` : ''}${d.allDay ? ' (all day)' : ''}  at ${d.venue}${d.address ? `, ${d.address}` : ''}`);
    line(`  category: ${d.category}${d.cost ? ` · ${d.cost}` : ''}${d.status && d.status !== 'scheduled' ? ` · ${d.status}` : ''}`);
  } else {
    line(`  ${d.type} · ${d.address}${d.phone ? ` · ${d.phone}` : ''}${d.hours ? ` · ${d.hours}` : ''}${d.status && d.status !== 'open' ? ` · ${d.status}` : ''}`);
  }
  line(`  source: ${d.source ?? '(none — set one with e before approving)'}`);
  if (d.url && d.url !== d.source) line(`  page: ${d.url}`);
  const review = d.review as { reason?: string; since?: string; from?: string } | undefined;
  if (review) line(`  waiting since ${review.since} (${review.from ?? '?'}): ${review.reason}`);
  const excerpt = item.body.replace(/<!--[\s\S]*?-->/g, '').trim().replace(/\s+/g, ' ');
  if (excerpt) line(`  body: ${excerpt.slice(0, 240)}${excerpt.length > 240 ? '…' : ''}`);
  line(`  file: ${relative(root, item.file)}`);
}

function openUrl(url: string) {
  line(`  ${url}`);
  const opener = process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'start' : 'xdg-open';
  spawnSync(opener, [url], { stdio: 'ignore' });
}

/** Approve a staged file: validate it as it will be published, stamp, move. Returns a reason when it cannot. */
function approveStaged(item: Extract<QueueItem, { kind: 'event' | 'place' }>): string | null {
  const text = readFileSync(item.file, 'utf8');
  const stamped = approveText(text, today, by, item.kind);
  const parsed = schemaFor[item.kind].safeParse(parseFrontmatter(stamped).data);
  if (!parsed.success) return parsed.error.issues.map((i) => `${i.path.join('.') || '(root)'}: ${i.message}`).join('; ');
  if (!(parsed.data as { source?: string }).source) return 'no source: nothing says where this was read. Edit (e) and set source first.';
  const target = join(contentDir, item.town.slug, `${item.kind}s`, basename(item.file));
  if (existsSync(target)) return `${relative(root, target)} already exists; edit the slug or reject this one.`;
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(item.file, stamped);
  renameSync(item.file, target);
  line(`  approved → ${relative(root, target)}`);
  return null;
}

function approveChange(item: Extract<QueueItem, { kind: 'change' }>): string | null {
  const text = readFileSync(item.eventFile, 'utf8');
  const applied = applyChangeText(text, item.change, sourceName(item.town.slug, item.change.sourceId), today, by);
  const parsed = schemaFor.event.safeParse(parseFrontmatter(applied).data);
  if (!parsed.success) return parsed.error.issues.map((i) => `${i.path.join('.') || '(root)'}: ${i.message}`).join('; ');
  writeFileSync(item.eventFile, applied);
  unlinkSync(item.file);
  line(`  applied to ${relative(root, item.eventFile)}`);
  return null;
}

function reject(item: QueueItem) {
  if (item.kind === 'change') {
    writeFileSync(item.eventFile, dismissChangeText(readFileSync(item.eventFile, 'utf8')));
    unlinkSync(item.file);
    line(`  dismissed; ${relative(root, item.eventFile)} stands as it was`);
  } else {
    unlinkSync(item.file);
    line(`  rejected; ${relative(root, item.file)} deleted (git has it if that was wrong)`);
  }
}

function edit(file: string) {
  const editor = process.env.VISUAL ?? process.env.EDITOR ?? 'vi';
  const result = spawnSync(editor, [file], { stdio: 'inherit', shell: true });
  if (result.status !== 0) line(`  ${editor} exited ${result.status}`);
}

const totals = { approved: 0, rejected: 0, skipped: 0 };
let quit = false;
for (const town of towns) {
  if (quit) break;
  const queue = readQueue(town, contentDir);
  if (queue.length === 0) continue;
  line(`\n${town.name.toUpperCase()} — ${queue.length} to review`);
  let approveRest = false;
  for (let i = 0; i < queue.length && !quit; i++) {
    let item = queue[i]!;
    if (!approveRest) show(item, i + 1, queue.length);
    let settled = false;
    while (!settled && !quit) {
      const answer = approveRest ? 'a' : (await ask('  [a]pprove  [e]dit  [r]eject  [o]pen  [s]kip  [A]pprove rest  [q]uit > ')).trim();
      switch (answer) {
        case 'a':
        case 'A': {
          if (answer === 'A') approveRest = true;
          const why = item.kind === 'change' ? approveChange(item) : approveStaged(item);
          if (why) {
            line(`  cannot approve: ${why}`);
            if (approveRest) {
              line('  skipped');
              totals.skipped++;
              settled = true;
            }
          } else {
            totals.approved++;
            settled = true;
          }
          break;
        }
        case 'e': {
          edit(item.kind === 'change' ? item.eventFile : item.file);
          // Re-read so the card and the approval see the edited file.
          if (item.kind !== 'change') {
            try {
              const { data, body } = parseFrontmatter(readFileSync(item.file, 'utf8'));
              item = { ...item, data, body };
              queue[i] = item;
              const check = schemaFor[item.kind].safeParse(data);
              if (!check.success) line(`  still invalid: ${check.error.issues.map((x) => `${x.path.join('.')}: ${x.message}`).join('; ')}`);
            } catch (err) {
              line(`  cannot read the file now: ${(err as Error).message}`);
            }
          }
          show(item, i + 1, queue.length);
          break;
        }
        case 'r': {
          const sure = item.kind !== 'change' && (item.data.review as { from?: string } | undefined)?.from === 'migration'
            ? (await ask('  This listing was published before; reject deletes it. Sure? [y/N] > ')).trim().toLowerCase() === 'y'
            : true;
          if (sure) {
            reject(item);
            totals.rejected++;
            settled = true;
          }
          break;
        }
        case 'o': {
          const url = item.kind === 'change' ? item.change.sourceUrl : String(item.data.source ?? item.data.url ?? '');
          if (url) openUrl(url);
          else line('  no URL on this item');
          break;
        }
        case 's':
          totals.skipped++;
          settled = true;
          break;
        case 'q':
          quit = true;
          break;
        default:
          line('  a, e, r, o, s, A or q');
      }
    }
  }
}
rl.close();
line(`\nreview: ${totals.approved} approved, ${totals.rejected} rejected, ${totals.skipped} skipped${by ? ` (as ${by})` : ''}. ` + (totals.approved || totals.rejected ? 'Run npm run validate, then commit.' : ''));
line(`Approved on ${formatDate(new Date())}: every approved file carries verified and verifiedBy, and every approved place added; nothing else was touched.`);
