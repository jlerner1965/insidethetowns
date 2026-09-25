#!/usr/bin/env node
/**
 * Drafts the weekly email from the listings, so Thursday's issue is a read
 * and a paste rather than a blank page.
 *
 *   npm run newsletter                       # every live town, plus the all-towns issue
 *   npm run newsletter -- --town=lyons       # one town
 *   npm run newsletter -- --date=2026-10-01  # for a particular send day (default: the next Thursday)
 *   npm run newsletter -- --number=3         # the issue number, for the archive
 *   npm run newsletter -- --out=drafts       # write one file per issue instead of printing
 *
 * Each draft is Markdown, which Buttondown takes as it is, under a frontmatter
 * block in the shape of content/hub/issues/. Paste the body into the provider
 * and send; then drop the file into content/hub/issues/ and it becomes the
 * archive page at /newsletter/<file name>/.
 *
 * It drafts. It does not send, and it does not decide what is worth saying:
 * the listings are laid out the way the sites lay them out, and any words
 * beyond them are for a person to write. An issue nobody read before it went
 * out is the quickest way to lose the trust the signup box asks for.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'astro/zod';
import { articleSchema, eventSchema, placeSchema } from '../src/content/schemas.ts';
import { liveTowns, type TownConfig } from '../src/config/index.ts';
import { hub } from '../src/config/towns/hub.ts';
import {
  addDays,
  dayKey,
  formatDate,
  formatDayLong,
  formatDayRange,
  formatTimeRange,
  formatWeekday,
  parseLocal,
  startOfDay,
} from '../src/lib/dates.ts';
import { groupByDay, highlights, occurrences, weekendSections, weekendWindow } from '../src/lib/events.ts';
import { parseFrontmatter } from './lib/frontmatter.ts';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const contentDir = join(root, 'content');

const args = process.argv.slice(2);
const opt = (name: string) => args.find((a) => a.startsWith(`--${name}=`))?.split('=')[1];
const onlyTown = opt('town');
const outDir = opt('out');
const issueNumber = opt('number') ? Number(opt('number')) : undefined;
const sendDay = hub.newsletter?.sendDay ?? 'Thursday';

/** The next send day on or after `from`, as a Denver day. */
function nextSendDay(from: Date): Date {
  let day = startOfDay(from);
  for (let i = 0; i < 7 && formatWeekday(day) !== sendDay; i++) day = addDays(day, 1);
  return day;
}

const dateArg = opt('date');
const send = dateArg ? startOfDay(parseLocal(dateArg)) : nextSendDay(new Date());
const { start: weekendStart, sunday } = weekendWindow(send);
const range = formatDayRange(weekendStart, sunday);
// "New this week" means since the previous issue.
const since = addDays(send, -7);

type EventData = z.infer<ReturnType<typeof eventSchema>>;
type PlaceData = z.infer<ReturnType<typeof placeSchema>>;
type ArticleData = z.infer<ReturnType<typeof articleSchema>>;
type Row<T> = { slug: string; file: string; data: T };
/**
 * What the event helpers take. Their type names the collection entry, whose
 * `image` is Astro's resolved metadata; a script reads the same frontmatter
 * with the image as a plain path, so the rows are cast on the way in and the
 * image is the one field this script never touches.
 */
type Listing = Parameters<typeof occurrences>[0][number];

const plainImage = () => z.string();

function readCollection<T>(town: string, collection: string, schema: z.ZodType): Row<T>[] {
  const dir = join(contentDir, town, collection);
  if (!existsSync(dir)) return [];
  const out: Row<T>[] = [];
  for (const name of readdirSync(dir)) {
    if (!name.endsWith('.md') || name.startsWith('_')) continue;
    try {
      const parsed = schema.safeParse(parseFrontmatter(readFileSync(join(dir, name), 'utf8')).data);
      // A file that fails its schema is npm run validate's to report, not this script's.
      if (!parsed.success) continue;
      const data = parsed.data as T & { slug?: string };
      out.push({ slug: data.slug ?? name.replace(/\.md$/, ''), file: `content/${town}/${collection}/${name}`, data });
    } catch {
      continue;
    }
  }
  return out;
}

function git(command: string[]): string {
  try {
    return execFileSync('git', command, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  } catch {
    return '';
  }
}

/**
 * Listings added since the last issue, from the history rather than from a
 * field, because nothing in a place's frontmatter says when it arrived. A
 * shallow checkout — CI's, or a fresh clone with a depth — has no history to
 * ask, and says so rather than report a quiet week.
 */
const shallow = git(['rev-parse', '--is-shallow-repository']) === 'true';
function addedSince(dir: string): Set<string> {
  if (shallow) return new Set();
  const out = git([
    'log',
    '--diff-filter=A',
    `--since=${since.toISOString()}`,
    `--until=${addDays(send, 1).toISOString()}`,
    '--name-only',
    '--format=',
    '--',
    dir,
  ]);
  return new Set(out.split('\n').filter(Boolean));
}

/** Cut at a word so the archive's excerpt stays inside its schema. */
function clamp(text: string, max: number): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  return `${cut.slice(0, Math.max(cut.lastIndexOf(' '), max - 40))}…`;
}

function line(e: Listing, town: TownConfig): string {
  const time = e.data.timeNote ?? formatTimeRange(e.data.start, e.data.end, e.data.allDay);
  const meta = [e.data.venue, e.data.cost].filter(Boolean).join(' · ');
  return `- **${time}** [${e.data.title}](https://${town.domain}/events/${e.slug}/) · ${meta}`;
}

function byDay(list: Listing[], town: TownConfig): string[] {
  const out: string[] = [];
  for (const day of groupByDay(list)) out.push(`**${formatDayLong(day.date)}**`, '', ...day.events.map((e) => line(e, town)), '');
  return out;
}

function frontmatter(title: string, excerpt: string, towns: string[]): string[] {
  return [
    '---',
    `title: ${JSON.stringify(title)}`,
    `date: "${dayKey(send)}"`,
    ...(issueNumber ? [`number: ${issueNumber}`] : []),
    `excerpt: ${JSON.stringify(clamp(excerpt, 320))}`,
    `towns: [${towns.join(', ')}]`,
    '---',
    '',
  ];
}

interface TownWeek {
  town: TownConfig;
  weekend: Listing[];
  running: Listing[];
  next: Listing[];
  newPlaces: Row<PlaceData>[];
  articles: Row<ArticleData>[];
}

function readWeek(town: TownConfig): TownWeek {
  const rows = readCollection<EventData>(town.slug, 'events', eventSchema(plainImage));
  const listings = occurrences(rows as unknown as Listing[], { now: send, horizonDays: 14 });
  // `next` runs to the Thursday after the weekend: the days the following issue will not reach back to.
  const parts = weekendSections(listings, { now: send, horizonDays: 5 });
  const added = addedSince(`content/${town.slug}/places`);
  return {
    town,
    weekend: parts.weekend,
    running: [...parts.now, ...parts.continuing],
    next: parts.next,
    newPlaces: readCollection<PlaceData>(town.slug, 'places', placeSchema(plainImage)).filter((p) => added.has(p.file)),
    articles: readCollection<ArticleData>(town.slug, 'articles', articleSchema(plainImage)).filter(
      (a) => a.data.date.getTime() >= since.getTime() && a.data.date.getTime() <= addDays(send, 1).getTime(),
    ),
  };
}

function townIssue(week: TownWeek): string {
  const { town, weekend, running, next, newPlaces, articles } = week;
  const n = weekend.length;
  const picks = highlights(weekend, { now: send, limit: 3 }).map((e) => e.data.title);
  const excerpt =
    n === 0
      ? `A quiet weekend in ${town.name}, ${range}: nothing listed yet, and what is on in the week after.`
      : `${n} thing${n === 1 ? '' : 's'} on in ${town.name} this weekend, ${range}: ${picks.join(', ')}.`;
  const lines = [
    ...frontmatter(`${town.siteTitle}, the weekend of ${range}`, excerpt, [town.slug]),
    `**${town.siteTitle}** · ${formatDate(send)}`,
    '',
    `## This weekend, ${range}`,
    '',
    ...(n ? byDay(weekend, town) : [`Nothing listed for the weekend yet. Know of something? [Send it in](https://${town.domain}/submit-event/).`, '']),
  ];
  if (running.length) lines.push('## Still running', '', ...running.map((e) => line(e, town)), '');
  if (next.length) lines.push('## Next week', '', ...byDay(next, town));
  if (newPlaces.length) {
    lines.push('## New on the guide', '');
    for (const p of newPlaces) lines.push(`- [${p.data.title}](https://${town.domain}/places/${p.slug}/) — ${p.data.summary}`);
    lines.push('');
  }
  if (articles.length) {
    lines.push('## Worth reading', '');
    for (const a of articles) lines.push(`- [${a.data.title}](https://${town.domain}/articles/${a.slug}/) — ${a.data.excerpt}`);
    lines.push('');
  }
  lines.push(
    '---',
    '',
    `Everything on in ${town.name}: https://${town.domain}/events/  `,
    `Know of something missing? https://${town.domain}/submit-event/`,
    '',
    `_The weekly email from ${town.siteTitle}, part of ${hub.siteTitle}. Listings are editorial; nobody pays to be in them._`,
    '',
  );
  return lines.join('\n');
}

function networkIssue(weeks: TownWeek[]): string {
  const total = weeks.reduce((sum, w) => sum + w.weekend.length, 0);
  const busiest = [...weeks].sort((a, b) => b.weekend.length - a.weekend.length).slice(0, 3).map((w) => w.town.name);
  const excerpt = `${total} things on across ${weeks.length} Front Range towns this weekend, ${range}, with the most in ${busiest.join(', ')}.`;
  const lines = [
    ...frontmatter(`Across the towns, the weekend of ${range}`, excerpt, []),
    `**${hub.siteTitle}** · ${formatDate(send)}`,
    '',
    `${total} things on across ${weeks.length} towns this weekend, ${range}. A few from each; every link opens on that town’s own guide.`,
    '',
  ];
  for (const { town, weekend } of weeks) {
    lines.push(`## ${town.name}`, '');
    if (!weekend.length) {
      lines.push(`Nothing listed for the weekend yet — [what’s on next](https://${town.domain}/events/).`, '');
      continue;
    }
    const picks = highlights(weekend, { now: send, limit: 4 });
    for (const e of picks) lines.push(`- **${formatDayLong(e.data.start).split(',')[0]}** ${line(e, town).slice(2)}`);
    const more = weekend.length - picks.length;
    lines.push(
      more > 0
        ? `- …and ${more} more on [${town.domain}/events](https://${town.domain}/events/)`
        : `- Everything on: [${town.domain}/events](https://${town.domain}/events/)`,
      '',
    );
  }
  lines.push(
    '---',
    '',
    `Everything on, town by town: https://${hub.domain}/this-weekend/`,
    '',
    `_The weekly email from ${hub.siteTitle}, independent guides to ${weeks.length} Front Range towns. Listings are editorial; nobody pays to be in them._`,
    '',
  );
  return lines.join('\n');
}

const towns = liveTowns().filter((t) => !onlyTown || t.slug === onlyTown);
if (!towns.length) {
  console.error(`newsletter: no live town called "${onlyTown}"`);
  process.exit(1);
}
const weeks = towns.map(readWeek);
const drafts = weeks.map((w) => ({ name: `${dayKey(send)}-${w.town.slug}.md`, text: townIssue(w) }));
if (!onlyTown) drafts.push({ name: `${dayKey(send)}-all-towns.md`, text: networkIssue(weeks) });

if (outDir) {
  const dir = resolve(root, outDir);
  mkdirSync(dir, { recursive: true });
  for (const d of drafts) writeFileSync(join(dir, d.name), d.text);
  console.error(`newsletter: ${drafts.length} draft${drafts.length === 1 ? '' : 's'} for ${formatDate(send)} written to ${dir}`);
} else {
  console.log(drafts.map((d) => `<!-- ${d.name} -->\n\n${d.text}`).join('\n\n'));
  console.error(`newsletter: ${drafts.length} draft${drafts.length === 1 ? '' : 's'} for ${formatDate(send)}, the weekend of ${range}`);
}
if (shallow) {
  console.error('newsletter: this checkout has no history (shallow clone), so "New on the guide" could not be filled in.');
}
