#!/usr/bin/env node
/**
 * Validates every file under content/<town>/ against the collection schemas.
 * Fails (exit 1) when required frontmatter is missing, an image path does not
 * exist, or a date will not parse. Warns about events that are already past
 * so they can be pruned, and about towns without a config file.
 *
 *   npm run validate            # strict: any invalid entry fails
 *   npm run validate -- --build # what `npm run build` runs: an invalid event
 *                               # or place is reported as excluded, not fatal
 *
 * Runs automatically before every `npm run build`. In `--build` mode nothing
 * here fails the build: an event or place that fails its schema is reported
 * the way the collection will treat it (excluded; src/content.config.ts,
 * `lenient`), and every other error is printed and the build goes on,
 * because a failed build on Vercel leaves the previous, stale deployment
 * serving. The same errors fail `npm run validate` in CI, where red is
 * visible and costs nothing.
 *
 * Beyond the schema, this reports what the build will hold back: entries
 * without a source or a check date, listings past their freshness window,
 * and everything in content/<town>/staging/, which must carry a `review`
 * block saying why it is there. The decision is src/lib/freshness.ts's; the
 * per-town summary at the end is the one the brief asks every build to print.
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'astro/zod';
import { COLLECTIONS, STAGED_COLLECTIONS, changeSchema, schemaFor, type CollectionName } from '../src/content/schemas.ts';
import { allSites, findTown, liveTowns } from '../src/config/index.ts';
import { describeExclusion, eventExclusion, placeExclusion } from '../src/lib/freshness.ts';
import { describeCounts, launchCounts } from './lib/launch.ts';
import { readRegistry, registryIssues } from '../src/lib/sources.ts';
// Imported directly, not via getHub(): the validator runs without TOWN set.
import { hub } from '../src/config/towns/hub.ts';
import { parseFrontmatter } from './lib/frontmatter.ts';
import { hoursTextByDesign, parseHoursText } from '../src/lib/hours.ts';
import { licenseName, parseLedger, publicCredit, sourcePhoto, type LedgerRow } from '../src/lib/credits.ts';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const contentDir = join(root, 'content');
const townsDir = join(root, 'src/config/towns');

const buildMode = process.argv.includes('--build');
const errors: string[] = [];
const warnings: string[] = [];
/** Per town: what publishes, what the build holds back and why, what waits in staging. */
type TownTally = {
  published: Record<string, number>;
  excluded: string[];
  staged: Record<string, number>;
  launch?: ReturnType<typeof launchCounts>;
  /** Changes ingest found to published events, waiting for the review. */
  changes?: number;
};
const tallies = new Map<string, TownTally>();
const tallyFor = (town: string): TownTally => {
  let t = tallies.get(town);
  if (!t) {
    t = { published: { events: 0, places: 0 }, excluded: [], staged: { events: 0, places: 0 } };
    tallies.set(town, t);
  }
  return t;
};
/** Reported as one line each, after the warnings; there are dozens and they are all the same kind. */
const unparsedHours: string[] = [];
/** Lines that are text on purpose (see hoursTextByDesign): counted, not flagged. */
const hoursByDesign: string[] = [];
let checked = 0;

function imageSchemaFor(file: string) {
  return () =>
    z.string().refine((p) => existsSync(resolve(dirname(file), p)), {
      message: 'image file does not exist (paths are relative to the markdown file, e.g. ../images/photo.jpg)',
    });
}

const registryIdCache = new Map<string, Set<string>>();
function registryIds(town: string): Set<string> {
  let ids = registryIdCache.get(town);
  if (!ids) {
    try {
      ids = new Set(readRegistry(town, contentDir).sources.map((s) => s.id));
    } catch {
      ids = new Set();
    }
    registryIdCache.set(town, ids);
  }
  return ids;
}

function validateFile(collection: CollectionName, file: string, town: string, staged = false) {
  const rel = relative(root, file);
  const gated = collection === 'events' || collection === 'places';
  const tally = tallyFor(town);
  let parsed;
  try {
    parsed = parseFrontmatter(readFileSync(file, 'utf8'));
  } catch (err) {
    errors.push(`${rel}: ${(err as Error).message}`);
    return;
  }
  const schema = schemaFor[collection](imageSchemaFor(file));
  const result = schema.safeParse(parsed.data);
  checked++;
  if (!result.success) {
    const issues = result.error.issues.map((issue) => `${issue.path.length ? issue.path.join('.') : '(root)'}: ${issue.message}`);
    // In build mode an invalid event or place is what the collection will
    // exclude, so it is reported the way the build will treat it.
    if (buildMode && gated && !staged) {
      tally.excluded.push(`${rel}: invalid (${issues.join('; ')})`);
      warnings.push(`${rel}: excluded from the build, invalid: ${issues.join('; ')}`);
    } else {
      for (const issue of issues) errors.push(`${rel}: ${issue}`);
    }
    return;
  }
  const data = result.data as Record<string, unknown>;
  // A staged entry must say why it is waiting; a published one must not
  // still be carrying that note.
  if (staged && !data.review) {
    errors.push(`${rel}: a file in staging/ needs a review block (reason, since) saying why it is not published`);
  } else if (!staged && data.review) {
    errors.push(`${rel}: carries a review block but is in the published folder; move it to staging/ or finish the review and remove the block`);
  }
  // An item may name the registry entry it came from; the entry must exist.
  // Its status does not matter here: publishing turns on `source` and
  // `verified`, and a proposed registry entry blocks ingestion only.
  if (typeof data.sourceId === 'string') {
    const ids = registryIds(town);
    if (!ids.has(data.sourceId)) {
      errors.push(`${rel}: sourceId "${data.sourceId}" is not in content/${town}/sources.json`);
    }
  }
  if (typeof data.subTown === 'string') {
    const config = findTown(town);
    if (!config?.subTowns?.includes(data.subTown)) {
      errors.push(`${rel}: subTown "${data.subTown}" is not one of ${town}'s subTowns${config?.subTowns ? ` (${config.subTowns.join(', ')})` : ' (none configured)'}`);
    }
  } else if (gated && findTown(town)?.subTowns) {
    // A guide covering several places (Carbon Valley) files every event and
    // place under one of them; the filters and the section pages read it.
    errors.push(`${rel}: a ${collection === 'events' ? 'event' : 'place'} on a multi-town guide needs a subTown (${findTown(town)!.subTowns!.join(', ')})`);
  }
  if (gated) {
    if (staged) {
      tally.staged[collection] = (tally.staged[collection] ?? 0) + 1;
    } else {
      const variant = findTown(town)?.variant ?? 'front-range';
      const why = collection === 'places' ? placeExclusion(data, variant) : eventExclusion(data);
      if (why) {
        tally.excluded.push(`${rel}: ${describeExclusion(why)}`);
        warnings.push(`${rel}: excluded from the build, ${describeExclusion(why)}`);
      } else {
        tally.published[collection] = (tally.published[collection] ?? 0) + 1;
      }
    }
  }
  if (staged) return;
  if (collection !== 'pages' && parsed.body.trim() === '') {
    warnings.push(`${rel}: body is empty`);
  }
  if (collection === 'places') {
    const data = result.data as { hours?: string; openingHours?: string[]; status: string; featured: boolean; title: string };
    // Not an error: the text still shows. But the page makes no open-or-closed
    // claim for this listing, and the line is worth a look — often a stray
    // word, sometimes hours that genuinely cannot be said in one line. A
    // closed place's hours are not read at all, so they are not reported.
    if (data.status === 'open' && data.hours && !data.openingHours && !parseHoursText(data.hours)) {
      if (hoursTextByDesign(data.hours)) hoursByDesign.push(`${rel}: "${data.hours}"`);
      else unparsedHours.push(`${rel}: hours not read as a schedule ("${data.hours}"); no open-now status. Reword, or set openingHours.`);
    }
    // The pages already ignore it, but a pick that has closed is a listing
    // somebody meant to come back to.
    if (data.status !== 'open' && data.featured) {
      warnings.push(`${rel}: ${data.title} is ${data.status} and still marked featured; the pages will not treat it as a pick`);
    }
  }
  if (collection === 'events') {
    const data = result.data as { start: Date; end?: Date; until?: Date; title: string };
    const end = data.until ?? data.end ?? data.start;
    if (end.getTime() < Date.now() - 86_400_000) {
      // Not a call to delete it: the page stays reachable, carries noindex and
      // is out of the sitemap, all of which happens on its own. This is an
      // editorial prompt — an annual worth rolling forward to next year's
      // date, or a one-off that has served its purpose.
      warnings.push(
        `${rel}: event is over (${end.toISOString().slice(0, 10)}). It is already hidden from listings, noindexed and out of the sitemap. Roll it forward if it recurs.`,
      );
    }
  }
}

// The hub publishes "People covered" as the sum across every live guide, so a
// live town with no figure does not just leave a gap — it quietly makes the
// headline number wrong. Elizabeth did exactly that: seven guides, six
// populations, a total that was 1,675 short and looked authoritative.
for (const town of liveTowns()) {
  if (!town.population) {
    errors.push(`src/config/towns/${town.slug}.ts: live town has no population; the network total on the hub would undercount`);
  }
}

/**
 * A form posting to a host the CSP does not list is blocked by the browser,
 * silently, on the reader's machine — nothing in the build or the markup says
 * so. The two are coupled, so check them against each other rather than trust
 * anyone to remember.
 */
function checkFormActions() {
  const vercelJson = join(root, 'vercel.json');
  if (!existsSync(vercelJson)) return;
  const csp = readFileSync(vercelJson, 'utf8');
  const directive = /form-action ([^;"]*)/.exec(csp);
  if (!directive) {
    errors.push('vercel.json: Content-Security-Policy has no form-action directive');
    return;
  }
  const allowed = new Set(directive[1].trim().split(/\s+/));
  const posts: { where: string; url: string }[] = [];
  const action = hub.newsletter?.action;
  if (action) posts.push({ where: 'src/config/towns/hub.ts: newsletter.action', url: action });
  for (const town of liveTowns()) {
    if (town.formspreeId) {
      posts.push({
        where: `src/config/towns/${town.slug}.ts: formspreeId`,
        url: `https://formspree.io/f/${town.formspreeId}`,
      });
    }
  }
  for (const { where, url } of posts) {
    let origin;
    try {
      origin = new URL(url).origin;
    } catch {
      errors.push(`${where}: "${url}" is not an absolute URL`);
      continue;
    }
    if (!allowed.has(origin)) {
      errors.push(
        `${where} posts to ${origin}, which the CSP would block. ` +
          `Add ${origin} to form-action in vercel.json.`,
      );
    }
  }
}

checkFormActions();

/**
 * Attribution is a licence term, not a courtesy. Every CC BY / CC BY-SA image
 * here legally requires it, and Boulder County asked for it in writing. The
 * editorial page tells readers "credit is shown where the licence asks for
 * it", so the only way that stays true is if a missing credit fails the build.
 *
 * IMAGE_LICENSES.csv is the register; this checks the content against it:
 * every image has a row, every row reads as a public credit for /credits/,
 * and every caption that credits a licensed photo names the licence the
 * register records. That last one is not pedantry — three captions once said
 * CC BY 4.0 for photographs that are CC BY-SA, and one named the wrong
 * photographer.
 */
function checkImageCredits() {
  const csvPath = join(root, 'IMAGE_LICENSES.csv');
  if (!existsSync(csvPath)) return;
  const ledger = new Map<string, LedgerRow>();
  for (const row of parseLedger(readFileSync(csvPath, 'utf8'))) {
    ledger.set(row.path, row);
    if (!row.path.startsWith('content/')) continue;
    // `new-town` copies the stand-in hero and writes a row that says so. A
    // placeholder may never ship, and publicCredit refuses it; a town whose
    // status is not `live` ships nothing but a holding page, so its row is
    // tolerated until the photograph arrives. The day the town is flipped
    // with the placeholder still there, this is an error again.
    if (/placeholder/i.test(row.license) && findTown(row.town)?.status && findTown(row.town)!.status !== 'live') continue;
    try {
      publicCredit(row);
    } catch (err) {
      errors.push((err as Error).message);
    }
  }

  // "No image goes in without a row" (docs/PHOTOS.md).
  if (existsSync(contentDir)) {
    for (const town of readdirSync(contentDir)) {
      const dir = join(contentDir, town, 'images');
      if (!existsSync(dir)) continue;
      for (const name of readdirSync(dir)) {
        const path = `content/${town}/images/${name}`;
        if (!ledger.has(path)) errors.push(`${path}: no row in IMAGE_LICENSES.csv`);
      }
    }
  }

  /** A caption must exist when the licence asks for one, and must name that licence. */
  const checkCaption = (where: string, path: string, caption: string | undefined) => {
    const row = ledger.get(path);
    if (!row) return;
    const file = row.file;
    if (row.creditRequired && !caption) {
      errors.push(`${where}: uses ${file}, whose licence requires attribution, but has no credit`);
      return;
    }
    const name = licenseName(row);
    if (caption && name && !caption.includes(name)) {
      errors.push(`${where}: credits ${file} as "${caption}", but IMAGE_LICENSES.csv records ${name}`);
    }
  };

  for (const file of collectContentFiles()) {
    const rel = relative(root, file);
    const town = relative(contentDir, file).split(sep)[0]!;
    const text = readFileSync(file, 'utf8');
    const image = /^image:\s*\.\.\/images\/(\S+)\s*$/m.exec(text);
    if (image) {
      const credit = /^imageCredit:\s*"?(.*?)"?\s*$/m.exec(text)?.[1] || undefined;
      checkCaption(rel, `content/${town}/images/${image[1]}`, credit);
    }
    // Inline images carry their credit in the italic line that follows them.
    for (const m of text.matchAll(/!\[[^\]]*\]\(\.\.\/images\/([^)\s]+)\)[ \t]*\n(?:[ \t]*\n)?(?:\*([^*\n]+)\*)?/g)) {
      checkCaption(rel, `content/${town}/images/${m[1]}`, m[2]);
    }
  }

  for (const site of allSites) {
    checkCaption(`src/config/towns/${site.slug}.ts (hero)`, `content/${site.slug}/images/${site.hero.image}`, site.hero.credit);
  }
}

function collectContentFiles(): string[] {
  const out: string[] = [];
  if (!existsSync(contentDir)) return out;
  for (const town of readdirSync(contentDir)) {
    const townDir = join(contentDir, town);
    if (!statSync(townDir).isDirectory()) continue;
    const dirs = [
      ...COLLECTIONS.map((c) => join(townDir, c)),
      ...STAGED_COLLECTIONS.map((c) => join(townDir, 'staging', c)),
    ];
    for (const dir of dirs) {
      if (!existsSync(dir)) continue;
      for (const name of readdirSync(dir)) {
        if (name.endsWith('.md') && !name.startsWith('_')) out.push(join(dir, name));
      }
    }
  }
  return out;
}

checkImageCredits();

/**
 * One photograph, one listing. Directory cards sit side by side and the
 * featured ones sit under the hero, so a picture on two of them reads as a
 * mistake. Elizabeth's park and Stampede arena once showed the same Commons
 * file saved under two names, so a repeat is caught by the register's
 * source as well as by the path.
 */
function checkRepeatedPhotos() {
  const csvPath = join(root, 'IMAGE_LICENSES.csv');
  const photoOf = new Map<string, string>();
  if (existsSync(csvPath)) {
    for (const row of parseLedger(readFileSync(csvPath, 'utf8'))) {
      const key = sourcePhoto(row.source);
      if (key) photoOf.set(row.path, key);
    }
  }
  const users = new Map<string, string[]>();
  // Per town: a trail two towns share may fairly carry one picture on both sites.
  const use = (town: string, where: string, file: string) => {
    const path = `content/${town}/images/${file}`;
    const key = `${town} ${photoOf.get(path) ?? path}`;
    users.set(key, [...(users.get(key) ?? []), `${where} (${file})`]);
  };
  for (const site of allSites) use(site.slug, `src/config/towns/${site.slug}.ts (hero)`, site.hero.image);
  for (const file of collectContentFiles()) {
    const [town, collection] = relative(contentDir, file).split(sep);
    if (collection !== 'places') continue;
    const image = /^image:\s*\.\.\/images\/(\S+)\s*$/m.exec(readFileSync(file, 'utf8'));
    if (image) use(town!, relative(root, file), image[1]!);
  }
  for (const where of users.values()) {
    if (where.length > 1) errors.push(`the same photograph is on ${where.join(' and ')}; give it to one of them`);
  }
}

checkRepeatedPhotos();

/**
 * A repeating event is one entry with a repeat rule, expanded at render, so
 * every occurrence links to the same page. That page is correct -- it states
 * the schedule -- but if its slug carries the first occurrence's date, an
 * October listing links to a URL ending in September, which reads like a bug
 * to anyone who looks at the address bar.
 */
function checkRepeatSlugs() {
  for (const file of collectContentFiles()) {
    if (!file.includes(`${sep}events${sep}`)) continue;
    const text = readFileSync(file, 'utf8');
    if (!/^repeat:\s*\S/m.test(text)) continue;
    const name = file.split(sep).pop()!.replace(/\.md$/, '');
    if (/-\d{4}-\d{2}-\d{2}$/.test(name)) {
      errors.push(
        `${relative(root, file)}: a repeating event should not carry a date in its slug — ` +
          'every occurrence links to this one page, so the date is wrong for all but the first',
      );
    }
  }
}

checkRepeatSlugs();



/**
 * Things that are deliberately dark, surfaced once per build so they are a
 * decision rather than an oversight. Warnings, not errors: the sites are
 * correct without them, they are just earning less than they could.
 */
const pending: string[] = [];
if (!hub.rates?.length) pending.push('/advertise/ has no rate card (hub.rates) — it invites founding-partnership enquiries');
if (!hub.newsletter) pending.push('the weekly email is dark (hub.newsletter) — no signup renders anywhere');
if (!liveTowns().some((t) => t.ga4Id) && !hub.ga4Id && hub.analytics !== true) {
  pending.push('no site measures traffic — /advertise/ cannot quote an audience');
}
// An error, not a warning: without a start date /advertise/ has no way to know
// whether the counter has a day behind it or a year, so it would quote an
// audience on the strength of a flag being true.
if ((hub.analytics === true || hub.ga4Id) && !hub.analyticsSince) {
  errors.push('traffic is counted but hub.analyticsSince is unset — set the day counting started (YYYY-MM-DD)');
}
for (const item of pending) warnings.push(`not set yet: ${item}`);


if (!existsSync(contentDir)) {
  errors.push('content/ directory does not exist');
} else {
  for (const town of readdirSync(contentDir)) {
    const townDir = join(contentDir, town);
    if (!statSync(townDir).isDirectory()) continue;
    if (town !== 'hub' && !existsSync(join(townsDir, `${town}.ts`))) {
      warnings.push(`content/${town}/ has no src/config/towns/${town}.ts; its content will never be built`);
    }
    for (const collection of COLLECTIONS) {
      const dir = join(townDir, collection);
      if (!existsSync(dir)) continue;
      for (const name of readdirSync(dir)) {
        if (!name.endsWith('.md') || name.startsWith('_')) continue;
        validateFile(collection, join(dir, name), town);
      }
    }
    for (const collection of STAGED_COLLECTIONS) {
      const dir = join(townDir, 'staging', collection);
      if (!existsSync(dir)) continue;
      for (const name of readdirSync(dir)) {
        if (!name.endsWith('.md') || name.startsWith('_')) continue;
        validateFile(collection, join(dir, name), town, true);
      }
    }
    // The source registry, where the town has one.
    for (const issue of registryIssues(town, contentDir)) errors.push(`content/${town}/sources.json: ${issue}`);
    if (town !== 'hub' && existsSync(join(townDir, 'sources.json'))) {
      try {
        const registry = readRegistry(town, contentDir);
        const config = findTown(town);
        for (const source of registry.sources) {
          if (source.subTown && !config?.subTowns?.includes(source.subTown)) {
            errors.push(`content/${town}/sources.json: ${source.id}: subTown "${source.subTown}" is not one of ${town}'s subTowns`);
          }
        }
      } catch {
        // reported above
      }
    }
    // Changes ingest found to published events, waiting for the review.
    const changesDir = join(townDir, 'staging', 'changes');
    if (existsSync(changesDir)) {
      for (const name of readdirSync(changesDir)) {
        if (!name.endsWith('.json')) continue;
        const rel = `content/${town}/staging/changes/${name}`;
        try {
          const parsed = changeSchema.safeParse(JSON.parse(readFileSync(join(changesDir, name), 'utf8')));
          if (!parsed.success) {
            for (const issue of parsed.error.issues) errors.push(`${rel}: ${issue.path.join('.') || '(root)'}: ${issue.message}`);
          } else if (!existsSync(join(townDir, 'events', `${parsed.data.slug}.md`))) {
            warnings.push(`${rel}: names an event that is no longer published (${parsed.data.slug}); delete the change file`);
          } else {
            tallyFor(town).changes = (tallyFor(town).changes ?? 0) + 1;
          }
        } catch (err) {
          errors.push(`${rel}: ${(err as Error).message}`);
        }
      }
    }
    // A staging folder for anything else is a file put in the wrong place.
    const stagingDir = join(townDir, 'staging');
    if (existsSync(stagingDir)) {
      for (const name of readdirSync(stagingDir)) {
        if (name === 'changes') continue;
        if (!(STAGED_COLLECTIONS as readonly string[]).includes(name)) {
          errors.push(`content/${town}/staging/${name}: only ${STAGED_COLLECTIONS.join(' and ')} have a staging folder`);
        }
      }
    }
  }
}

for (const w of warnings) console.warn(`warn  ${w}`);
if (process.argv.includes('--hours')) {
  for (const w of unparsedHours) console.warn(`hours ${w}`);
  for (const w of hoursByDesign) console.log(`hours (text by design) ${w}`);
} else if (unparsedHours.length > 0) {
  console.warn(`hours ${unparsedHours.length} listings have an hours line the site cannot read as a schedule (run with --hours to list them); ${hoursByDesign.length} more are text by design`);
}
/**
 * The launch threshold. A live town under it is a warning here and in the
 * weekly report, never a failed build (its verified content still publishes,
 * and a failed build would serve last week's). A town that has not launched
 * is told whether it is ready; its site is a holding page until `status` says
 * `live` whatever the count.
 */
for (const town of allSites) {
  if (town.kind !== 'town') continue;
  const counts = launchCounts(town);
  const t = tallyFor(town.slug);
  t.launch = counts;
  if (town.status === 'live' && !counts.meets) {
    warnings.push(`${town.slug} is live and under its launch threshold: ${describeCounts(counts)}`);
  }
}

// GitHub turns these into annotations on the run, so a warning is seen
// without opening the log. Plain `warn` lines everywhere else.
const annotate = (level: 'warning' | 'error', message: string) =>
  process.env.GITHUB_ACTIONS ? console.log(`::${level}::${message}`) : undefined;
for (const w of warnings) if (/launch threshold|excluded from the build/.test(w)) annotate('warning', w);

for (const e of errors) {
  console.error(`error ${e}`);
  annotate('error', e);
}

// The per-town summary: what publishes, what is held back, what waits.
// "0 excluded" on every line is the normal state and worth seeing.
console.log('\nPer town (events / places): published · excluded by the build · in staging');
for (const [town, t] of [...tallies.entries()].sort(([a], [b]) => a.localeCompare(b))) {
  if (town === 'hub') continue;
  const config = findTown(town);
  const note = !config
    ? ''
    : config.status !== 'live'
      ? `  (${config.status}: holding page${t.launch?.meets ? ', ready to launch' : ''})`
      : t.launch && !t.launch.meets
        ? `  ⚠ under launch threshold (${describeCounts(t.launch)})`
        : '';
  console.log(
    `  ${town.padEnd(12)} ${String(t.published.events).padStart(4)} / ${String(t.published.places).padStart(3)} published · ` +
      `${String(t.excluded.length).padStart(2)} excluded · ${t.staged.events} / ${t.staged.places} staged${t.changes ? ` · ${t.changes} flagged` : ''}${note}`,
  );
}
console.log(`\nvalidate-content: ${checked} entries checked, ${errors.length} errors, ${warnings.length} warnings`);
if (errors.length > 0) {
  if (buildMode) {
    console.error(
      `\nvalidate-content: ${errors.length} error(s) reported, not blocking this build. ` +
        'A failed build would leave the previous deployment serving stale listings; CI (npm run validate) is red for these instead.',
    );
  } else {
    process.exit(1);
  }
}
