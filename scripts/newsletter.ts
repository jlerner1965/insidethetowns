#!/usr/bin/env node
/**
 * Drafts the weekly email from the listings, so Thursday's issue is a read
 * and a paste rather than a blank page.
 *
 *   npm run newsletter                       # every edition, plus the all-towns issue
 *   npm run newsletter -- --town=lyons       # the edition with that town in it
 *   npm run newsletter -- --date=2026-10-01  # for a particular send day (default: the next Thursday)
 *   npm run newsletter -- --number=3         # the issue number, for the archive
 *   npm run newsletter -- --out=drafts       # write one file per issue instead of printing
 *
 * Each draft is Markdown, which Buttondown takes as it is, under a frontmatter
 * block in the shape of content/hub/issues/. Paste the body into the provider
 * and send; then drop the file into content/hub/issues/ and it becomes the
 * archive page at /newsletter/<file name>/.
 *
 * One draft per edition (src/lib/editions.ts): most are one guide's; a shared
 * edition (Windsor, Severance and Timnath) is one issue with each town's
 * listings under its own heading, sent in Buttondown to every subscriber
 * tagged with any of its towns. Quiet guides and visitor guides have none.
 *
 * It drafts. It does not send, and it does not decide what is worth saying:
 * the listings are laid out the way the sites lay them out, and any words
 * beyond them are for a person to write. An issue nobody read before it went
 * out is the quickest way to lose the trust the signup box asks for.
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'astro/zod';
import { articleSchema, eventSchema, placeSchema } from '../src/content/schemas.ts';
import { editionFor, emailEditions, findTown, type Edition, type TownConfig } from '../src/config/index.ts';
import { hub } from '../src/config/towns/hub.ts';
import {
  addDays,
  dayKey,
  formatDate,
  formatDayLong,
  formatDayRange,
  parseLocal,
  startOfDay,
} from '../src/lib/dates.ts';
import { groupByDay, highlights, isCanceled, occurrences, timeText, weekendSections, weekendWindow } from '../src/lib/events.ts';
import { campaignLink, isNewlyClosed, isNewPlace, nextSendDay, openingDay } from '../src/lib/newsletter.ts';
import { subTownList } from '../src/lib/sub-towns.ts';
import { parseFrontmatter } from './lib/frontmatter.ts';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const contentDir = join(root, 'content');

const args = process.argv.slice(2);
const opt = (name: string) => args.find((a) => a.startsWith(`--${name}=`))?.split('=')[1];
const onlyTown = opt('town');
const outDir = opt('out');
const issueNumber = opt('number') ? Number(opt('number')) : undefined;
const sendDay = hub.newsletter?.sendDay ?? 'Thursday';

const dateArg = opt('date');
const send = dateArg ? startOfDay(parseLocal(dateArg)) : nextSendDay(new Date(), sendDay);
const { start: weekendStart, sunday } = weekendWindow(send);
const range = formatDayRange(weekendStart, sunday);
// "New this week" means since the previous issue.
const since = addDays(send, -7);
// Every site link carries the issue's campaign tags (src/lib/newsletter.ts).
const site = (domain: string, path: string) => campaignLink(`https://${domain}${path}`, send);

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

/** Cut at a word so the archive's excerpt stays inside its schema. */
function clamp(text: string, max: number): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  return `${cut.slice(0, Math.max(cut.lastIndexOf(' '), max - 40))}…`;
}

function line(e: Listing, town: TownConfig): string {
  // A run under way says "Now through October 31", not "All day".
  const time = timeText(e, send);
  const meta = [e.data.venue, e.data.cost].filter(Boolean).join(' · ');
  return `- **${time}** [${e.data.title}](${site(town.domain, `/events/${e.slug}/`)}) · ${meta}`;
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
  closedPlaces: Row<PlaceData>[];
  articles: Row<ArticleData>[];
}

function readWeek(town: TownConfig): TownWeek {
  // The email recommends, so a canceled listing is left out of it; the site
  // keeps it, marked, for whoever already had the date in their diary.
  const rows = readCollection<EventData>(town.slug, 'events', eventSchema(plainImage)).filter((r) => !isCanceled(r));
  const listings = occurrences(rows as unknown as Listing[], { now: send, horizonDays: 14 });
  // `next` runs to the Thursday after the weekend: the days the following issue will not reach back to.
  const parts = weekendSections(listings, { now: send, horizonDays: 5 });
  const places = readCollection<PlaceData>(town.slug, 'places', placeSchema(plainImage));
  return {
    town,
    weekend: parts.weekend,
    running: [...parts.now, ...parts.continuing],
    next: parts.next,
    // Each place's own `added` and `closed` dates (src/lib/newsletter.ts);
    // the places the guide opened with are not new places.
    newPlaces: places.filter((p) => isNewPlace(p, send, openingDay(places))),
    closedPlaces: places.filter((p) => isNewlyClosed(p, send)),
    articles: readCollection<ArticleData>(town.slug, 'articles', articleSchema(plainImage)).filter(
      (a) => a.data.date.getTime() >= since.getTime() && a.data.date.getTime() <= addDays(send, 1).getTime(),
    ),
  };
}

/**
 * "_Sponsor · This week's email is presented by [X](url)._", or nothing. The
 * network sponsor (hub.sponsors.network) fills the line in every issue that
 * has no email sponsor of its own: the founding offer on /advertise/ includes it.
 */
function sponsorLine(sponsor: { name: string; url: string; line?: string } | undefined): string[] {
  if (!sponsor) return [];
  return [`_Sponsor · This week’s email is presented by [${sponsor.name}](${sponsor.url})${sponsor.line ? ` · ${sponsor.line}` : ''}._`, ''];
}

function townIssue(week: TownWeek, sponsor: Edition['sponsor']): string {
  const { town, weekend, running, next, newPlaces, closedPlaces, articles } = week;
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
    // The email's sponsor, labeled, above the listings and never among them.
    ...sponsorLine(sponsor ?? hub.sponsors?.network),
    `## This weekend, ${range}`,
    '',
    ...(n ? byDay(weekend, town) : [`Nothing listed for the weekend yet. Know of something? [Send it in](${site(town.domain, `/submit-event/`)}).`, '']),
  ];
  if (running.length) lines.push('## Still running', '', ...running.map((e) => line(e, town)), '');
  if (next.length) lines.push('## Next week', '', ...byDay(next, town));
  if (newPlaces.length) {
    lines.push('## New on the guide', '');
    for (const p of newPlaces) lines.push(`- [${p.data.title}](${site(town.domain, `/places/${p.slug}/`)}) — ${p.data.summary}`);
    lines.push('');
  }
  if (closedPlaces.length) {
    lines.push('## Closed', '');
    for (const p of closedPlaces) lines.push(`- [${p.data.title}](${site(town.domain, `/places/${p.slug}/`)}) — ${p.data.statusNote ?? (p.data.status === 'closed' ? 'Permanently closed.' : 'Temporarily closed.')}`);
    lines.push('');
  }
  if (articles.length) {
    lines.push('## Worth reading', '');
    for (const a of articles) lines.push(`- [${a.data.title}](${site(town.domain, `/articles/${a.slug}/`)}) — ${a.data.excerpt}`);
    lines.push('');
  }
  lines.push(
    '---',
    '',
    `This week in ${town.name}: ${site(town.domain, `/this-week/`)}  `,
    `Everything on in ${town.name}: ${site(town.domain, `/events/`)}  `,
    `Know of something missing? ${site(town.domain, `/submit-event/`)}`,
    '',
    `_The weekly email from ${town.siteTitle}, part of ${hub.siteTitle}. Listings are editorial; nobody pays to be in them._`,
    '',
  );
  return lines.join('\n');
}

/**
 * A shared edition: one issue, each section split by town under its own
 * heading, a town with nothing in a section left out of it. The links go to
 * each town's own guide, as they do in a town's issue.
 */
function sharedIssue(edition: Edition, weeks: TownWeek[]): string {
  const weekend = weeks.flatMap((w) => w.weekend);
  const n = weekend.length;
  const picks = highlights(weekend, { now: send, limit: 3 }).map((e) => e.data.title);
  const excerpt =
    n === 0
      ? `A quiet weekend in ${edition.name}, ${range}: nothing listed yet, and what is on in the week after.`
      : `${n} thing${n === 1 ? '' : 's'} on in ${edition.name} this weekend, ${range}: ${picks.join(', ')}.`;
  const lines = [
    ...frontmatter(`${edition.name}, the weekend of ${range}`, excerpt, edition.towns.map((t) => t.slug)),
    `**${edition.name}** · ${formatDate(send)}`,
    '',
    ...sponsorLine(edition.sponsor ?? hub.sponsors?.network),
    `## This weekend, ${range}`,
    '',
  ];
  // "Windsor and Severance": a guide with sections is headed with all of them.
  const heading = (town: TownConfig) => subTownList(town) || town.name;
  for (const w of weeks) {
    lines.push(`### ${heading(w.town)}`, '');
    if (w.weekend.length) lines.push(...byDay(w.weekend, w.town));
    else lines.push(`Nothing listed for the weekend yet. Know of something? [Send it in](${site(w.town.domain, `/submit-event/`)}).`, '');
  }
  const section = (title: string, pick: (w: TownWeek) => string[]) => {
    const parts = weeks.map((w) => ({ town: w.town, body: pick(w) })).filter((p) => p.body.length);
    if (!parts.length) return;
    lines.push(`## ${title}`, '');
    for (const { town, body } of parts) lines.push(`### ${heading(town)}`, '', ...body);
  };
  section('Still running', (w) => (w.running.length ? [...w.running.map((e) => line(e, w.town)), ''] : []));
  section('Next week', (w) => (w.next.length ? byDay(w.next, w.town) : []));
  const items = (title: string, rows: Array<{ town: TownConfig; text: string }>) => {
    if (!rows.length) return;
    lines.push(`## ${title}`, '', ...rows.map((r) => `- **${r.town.name}** ${r.text}`), '');
  };
  items('New on the guides', weeks.flatMap((w) => w.newPlaces.map((p) => ({ town: w.town, text: `[${p.data.title}](${site(w.town.domain, `/places/${p.slug}/`)}) — ${p.data.summary}` }))));
  items('Closed', weeks.flatMap((w) => w.closedPlaces.map((p) => ({ town: w.town, text: `[${p.data.title}](${site(w.town.domain, `/places/${p.slug}/`)}) — ${p.data.statusNote ?? (p.data.status === 'closed' ? 'Permanently closed.' : 'Temporarily closed.')}` }))));
  items('Worth reading', weeks.flatMap((w) => w.articles.map((a) => ({ town: w.town, text: `[${a.data.title}](${site(w.town.domain, `/articles/${a.slug}/`)}) — ${a.data.excerpt}` }))));
  lines.push('---', '');
  for (const { town } of weeks) lines.push(`This week in ${town.name}: ${site(town.domain, `/this-week/`)}  `);
  lines.push(
    `Know of something missing? ${site(weeks[0]!.town.domain, `/submit-event/`)}`,
    '',
    `_The weekly email for ${edition.name}, from ${weeks.map((w) => w.town.siteTitle).join(' and ')}, part of ${hub.siteTitle}. Listings are editorial; nobody pays to be in them._`,
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
    ...sponsorLine(hub.sponsors?.email ?? hub.sponsors?.network),
    `**${hub.siteTitle}** · ${formatDate(send)}`,
    '',
    `${total} things on across ${weeks.length} towns this weekend, ${range}. A few from each; every link opens on that town’s own guide.`,
    '',
  ];
  for (const { town, weekend } of weeks) {
    lines.push(`## ${town.name}`, '');
    if (!weekend.length) {
      lines.push(`Nothing listed for the weekend yet — [what’s on next](${site(town.domain, `/events/`)}).`, '');
      continue;
    }
    const picks = highlights(weekend, { now: send, limit: 4 });
    for (const e of picks) lines.push(`- **${formatDayLong(e.data.start).split(',')[0]}** ${line(e, town).slice(2)}`);
    const more = weekend.length - picks.length;
    lines.push(
      more > 0
        ? `- …and ${more} more on [${town.domain}/events](${site(town.domain, `/events/`)})`
        : `- Everything on: [${town.domain}/events](${site(town.domain, `/events/`)})`,
      '',
    );
  }
  const opened = weeks.flatMap((w) => w.newPlaces.map((p) => ({ p, town: w.town })));
  const shut = weeks.flatMap((w) => w.closedPlaces.map((p) => ({ p, town: w.town })));
  if (opened.length) {
    lines.push('## New on the guides', '');
    for (const { p, town } of opened) lines.push(`- **${town.name}** [${p.data.title}](${site(town.domain, `/places/${p.slug}/`)}) — ${p.data.summary}`);
    lines.push('');
  }
  if (shut.length) {
    lines.push('## Closed', '');
    for (const { p, town } of shut) lines.push(`- **${town.name}** [${p.data.title}](${site(town.domain, `/places/${p.slug}/`)}) — ${p.data.statusNote ?? (p.data.status === 'closed' ? 'Permanently closed.' : 'Temporarily closed.')}`);
    lines.push('');
  }
  lines.push(
    '---',
    '',
    `Everything on, town by town: ${site(hub.domain, `/this-weekend/`)}`,
    '',
    `_The weekly email from ${hub.siteTitle}, independent guides to ${weeks.length} Front Range towns. Listings are editorial; nobody pays to be in them._`,
    '',
  );
  return lines.join('\n');
}

// A quiet guide (`quiet`) or a visitor guide (`visitorGuide`) gets no issue
// and no place in the network one: the email is a weekly promise it is not making.
const all = emailEditions();
const editions = onlyTown ? [editionFor(onlyTown, all)].filter((e): e is Edition => !!e) : all;
if (!editions.length) {
  const t = findTown(onlyTown!);
  console.error(
    t?.quiet
      ? `newsletter: ${onlyTown} is quiet until ${t.quiet.decideBy} (${t.quiet.reason}), so it has no issue`
      : t?.visitorGuide
        ? `newsletter: ${onlyTown} is a visitor guide (${t.visitorGuide.reason}), so it has no issue`
        : `newsletter: no live town called "${onlyTown}"`,
  );
  process.exit(1);
}
const issues = editions.map((edition) => ({ edition, weeks: edition.towns.map(readWeek) }));
const drafts = issues.map(({ edition, weeks }) => ({
  name: `${dayKey(send)}-${edition.slug}.md`,
  text: edition.shared ? sharedIssue(edition, weeks) : townIssue(weeks[0]!, edition.sponsor),
}));
if (!onlyTown) drafts.push({ name: `${dayKey(send)}-all-towns.md`, text: networkIssue(issues.flatMap((i) => i.weeks).sort((a, b) => a.town.name.localeCompare(b.town.name))) });

if (outDir) {
  const dir = resolve(root, outDir);
  mkdirSync(dir, { recursive: true });
  for (const d of drafts) writeFileSync(join(dir, d.name), d.text);
  console.error(`newsletter: ${drafts.length} draft${drafts.length === 1 ? '' : 's'} for ${formatDate(send)} written to ${dir}`);
} else {
  console.log(drafts.map((d) => `<!-- ${d.name} -->\n\n${d.text}`).join('\n\n'));
  console.error(`newsletter: ${drafts.length} draft${drafts.length === 1 ? '' : 's'} for ${formatDate(send)}, the weekend of ${range}`);
}
