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
 *   npm run validate -- --past  # list every event whose last date has passed
 *   npm run validate -- --hours # list every hours line the site cannot read
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
import { COLLECTIONS, FEED_TYPES, STAGED_COLLECTIONS, changeSchema, schemaFor, type CollectionName } from '../src/content/schemas.ts';
import { allSites, deployedTowns, findTown } from '../src/config/index.ts';
import { describeExclusion, eventExclusion, placeExclusion } from '../src/lib/freshness.ts';
import { describeCounts, launchCounts } from './lib/launch.ts';
import { readRegistry, registryIssues } from '../src/lib/sources.ts';
import { eventConfidence } from '../src/lib/confidence.ts';
// Imported directly, not via getHub(): the validator runs without TOWN set.
import { hub } from '../src/config/towns/hub.ts';
import { parseFrontmatter } from './lib/frontmatter.ts';
import { hoursTextByDesign, parseHoursText } from '../src/lib/hours.ts';
import { dayKey } from '../src/lib/dates.ts';
import { licenseName, parseLedger, publicCredit, sourcePhoto, type LedgerRow } from '../src/lib/credits.ts';
import { nextEventIssues, retiredLedgerIssues } from '../src/lib/former-slugs.ts';
import { STANDALONE_GUIDES, findHubTown } from '../src/config/hub-towns.ts';
import { placeKey } from '../src/lib/hub-towns.ts';
import { subTownLabel } from '../src/lib/sub-towns.ts';
import { isGuideSite, townProfileSchema } from '../src/lib/town-profile.ts';
import { STALE_CHECK_DAYS, STALE_WITHIN_DAYS, staleSoon, type TraditionRecord } from '../src/lib/traditions.ts';
import { openItems, reverifyDue } from '../src/lib/curiosity.ts';
import { curiosityFiles } from '../src/lib/curiosity-files.ts';
import { placeName } from '../src/lib/curiosity-places.ts';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const contentDir = join(root, 'content');
const townsDir = join(root, 'src/config/towns');

const buildMode = process.argv.includes('--build');
const errors: string[] = [];
const warnings: string[] = [];
/** Editor's doubt that never belongs on a page: the phrases the 4 November 2026 audit found live. */
const HEDGE_PHRASES = /when this (?:was|listing was) (?:checked|read)|could not be read|for this reader|had not been posted when|not yet posted when|looks? like an error|gives no usable|this guide could not|could not confirm/i;
/** Events whose last date has passed: reported as one count, listed with --past. */
const pastEvents: string[] = [];
/** Per town: what publishes, what the build holds back and why, what waits in staging. */
type TownTally = {
  published: Record<string, number>;
  /** Published events resting on a community calendar or a stale confirmation (src/lib/confidence.ts). */
  listed: number;
  /** Listed events further ahead than they are shown: the normal state, counted, not warned about. */
  held: number;
  excluded: string[];
  staged: Record<string, number>;
  launch?: ReturnType<typeof launchCounts>;
  /** Published events a source or the re-check has contradicted (`changeFlag`), waiting for the review. */
  changes?: number;
};
const tallies = new Map<string, TownTally>();
const tallyFor = (town: string): TownTally => {
  let t = tallies.get(town);
  if (!t) {
    t = { published: { events: 0, places: 0 }, listed: 0, held: 0, excluded: [], staged: { events: 0, places: 0 } };
    tallies.set(town, t);
  }
  return t;
};
/** Reported as one line each, after the warnings; there are dozens and they are all the same kind. */
const unparsedHours: string[] = [];
/** Lines that are text on purpose (see hoursTextByDesign): counted, not flagged. */
const hoursByDesign: string[] = [];
let checked = 0;
/** Every approved tradition record (content/hub/traditions/), for the stale-check list at the end. */
const traditionRecords: TraditionRecord[] = [];

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
  if (collection === 'traditions') {
    const record = data as unknown as TraditionRecord;
    traditionRecords.push(record);
    // The sample records live in test/fixtures/traditions/ and load only
    // behind TRADITIONS_FIXTURES; one in content/ would ship.
    if (record.fixture || record.slug.startsWith('fixture-')) errors.push(`${rel}: a fixture record in content/; fixtures live in test/fixtures/traditions/ and never ship`);
    if (town !== 'hub') errors.push(`${rel}: tradition records live in content/hub/traditions/, shared by every guide`);
    if (`${record.slug}.md` !== rel.split('/').at(-1)) errors.push(`${rel}: the file is named for its slug, ${record.slug}.md`);
    // Every place a record names is one the network has: a hub town's page
    // or a standalone guide (src/config/hub-towns.ts), or, for a guide not
    // yet folded, the live guide itself.
    const guide = record.town?.guide;
    if (guide && !placeKey(guide) && !deployedTowns().some((t) => t.slug === guide)) errors.push(`${rel}: town.guide "${guide}" is not a hub town, a standalone guide or a live guide`);
    const named = guide ? (findHubTown(placeKey(guide) ?? '')?.name ?? findTown(guide)?.name) : undefined;
    // A guide to several towns: the record names the one its event is in,
    // a town the guide names (Carbon Valley's Frederick) or one of its
    // sections (Windsor's Severance, whose records are the guide's since 13
    // November 2026).
    const key = guide ? placeKey(guide) ?? '' : '';
    const covered = guide ? [...(STANDALONE_GUIDES[key]?.towns ?? []), ...(findTown(key)?.subTowns ?? []).map(subTownLabel)] : undefined;
    if (named && named !== record.town!.name && !covered?.includes(record.town!.name)) errors.push(`${rel}: town.name "${record.town!.name}" is not ${guide}'s name, "${named}"`);
    for (const t of record.towns ?? []) if (!placeKey(t.slug)) errors.push(`${rel}: towns names "${t.slug}", which is not a hub town or a standalone guide`);
  }
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
      // Kept by the owner past the window: still worth a person's look.
      if (collection === 'places' && data.alwaysListed === true && !why && placeExclusion({ ...data, alwaysListed: false }, variant)) {
        warnings.push(`${rel}: kept by alwaysListed, but past its re-check window; confirm it by phone or in a browser`);
      }
      if (why?.reason === 'unconfirmed' && /shown from/.test(why.detail)) {
        // A listed event three months out waits its turn; that is the rule working.
        tally.held++;
      } else if (why) {
        tally.excluded.push(`${rel}: ${describeExclusion(why)}`);
        warnings.push(`${rel}: excluded from the build, ${describeExclusion(why)}`);
      } else {
        tally.published[collection] = (tally.published[collection] ?? 0) + 1;
        if (collection === 'events' && eventConfidence(data as unknown as Parameters<typeof eventConfidence>[0]).level === 'listed') tally.listed++;
        // Flagged by ingest (with a change file) or by the re-check (the note alone): either way it waits for npm run review.
        if (collection === 'events' && data.changeFlag === true) tally.changes = (tally.changes ?? 0) + 1;
      }
    }
  }
  if (staged) return;
  // A weekly notes file is all frontmatter; a corrections entry is one line.
  if (!['pages', 'weekly', 'corrections', 'programs', 'updates', 'traditions'].includes(collection) && parsed.body.trim() === '') {
    warnings.push(`${rel}: body is empty`);
  }
  // A published page states facts or leaves them out (HOW-IT-WORKS.md,
  // Accuracy, 3 November 2026). These phrases are the editor talking to
  // the editor, and the flagship audit of 4 November found them in
  // summaries, bodies and hours fields on five guides. A warning, not an
  // error: the pages still build, and the line names the file to fix.
  // The weekly notes are the editor's hand-off, with their own [UNVERIFIED] convention; not scanned.
  if (collection !== 'weekly') {
    const d = result.data as Record<string, unknown>;
    const publicText = [d.summary, d.hours, d.timeNote, d.statusNote, d.action, parsed.body].filter((v): v is string => typeof v === 'string').join('\n');
    const hedge = publicText.match(HEDGE_PHRASES);
    if (hedge) warnings.push(`${rel}: "${hedge[0]}" is a note to the editor on a public page; state the fact or leave it out`);
  }
  // A picks guide names places on its own guide, each published and open
  // (pickSchema): a pick that went to staging, closed or was renamed would
  // otherwise drop off the page without a word (the picks guides, 11
  // November 2026).
  if (collection === 'pages') {
    const picks = (result.data as { picks?: Array<{ place: string }> }).picks ?? [];
    const seen = new Set<string>();
    for (const { place } of picks) {
      if (seen.has(place)) errors.push(`${rel}: "${place}" is picked twice`);
      seen.add(place);
      const file = join(contentDir, town, 'places', `${place}.md`);
      if (!existsSync(file)) {
        errors.push(`${rel}: pick "${place}" is not a published place on this guide (content/${town}/places/${place}.md)`);
        continue;
      }
      const pd = parseFrontmatter(readFileSync(file, 'utf8')).data as Record<string, unknown>;
      if (pd.status === 'closed' || pd.status === 'temporarily-closed') errors.push(`${rel}: pick "${place}" is marked ${pd.status}`);
    }
  }
  // A local change whose stage says "complete" while its own words say the
  // count or the decision is unofficial or pending is two claims at once
  // (Berthoud's Ballot Issue 3G, 6 November 2026: stage complete, "the
  // count is unofficial"). The stage for that is `unofficial`.
  if (collection === 'updates') {
    const d = result.data as { stage: string; summary?: string; title?: string; effectiveNote?: string };
    const words = [d.title, d.summary, d.effectiveNote, parsed.body].filter((v): v is string => typeof v === 'string').join('\n');
    if (d.stage === 'complete' && /\b(unofficial|pending)\b/i.test(words)) {
      errors.push(`${rel}: stage "complete" with text that says unofficial or pending; use stage "unofficial" until it is certified, or "scheduled"/"underway" while it is pending`);
    }
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
    const data = result.data as { start: Date; end?: Date; until?: Date; performances?: { start: Date }[]; title: string; source?: string };
    const end = data.performances?.at(-1)?.start ?? data.until ?? data.end ?? data.start;
    if (end.getTime() < Date.now() - 86_400_000) {
      // Not a call to delete it: the page stays reachable, carries noindex and
      // is out of the sitemap, all of which happens on its own. This is an
      // editorial prompt — an annual worth rolling forward to next year's
      // date, or a one-off that has served its purpose.
      pastEvents.push(`${rel}: event is over (${dayKey(end)})`);
    }
  }
}

// The hub publishes "People covered" as the sum across every live guide, so a
// live town with no figure does not just leave a gap — it quietly makes the
// headline number wrong. Elizabeth did exactly that: seven guides, six
// populations, a total that was 1,675 short and looked authoritative.
for (const town of deployedTowns()) {
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
  for (const town of deployedTowns()) {
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
 * Same coupling for Plausible: its events go to plausible.io, and a CSP that
 * does not list it in connect-src drops every one of them in the reader's
 * browser while the dashboard just shows nobody came.
 */
function checkPlausible() {
  const towns = deployedTowns().filter((town) => town.plausible);
  const vercelJson = join(root, 'vercel.json');
  if (towns.length === 0 || !existsSync(vercelJson)) return;
  const directive = /connect-src ([^;"]*)/.exec(readFileSync(vercelJson, 'utf8'));
  if (!directive?.[1].trim().split(/\s+/).includes('https://plausible.io')) {
    for (const town of towns) {
      errors.push(
        `src/config/towns/${town.slug}.ts: plausible is on, but the CSP would block its events. ` +
          'Add https://plausible.io to connect-src in vercel.json.',
      );
    }
  }
}

checkPlausible();

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
/**
 * The exceptions, as "<town> <photograph>": a hero that is also its
 * listing's picture. Timnath's Old Town Main Street (the owner, 10 November
 * 2026): the only photograph of Old Town there is, so it fronts the guide and
 * stays on the listing. The home page never shows it a second time
 * (NextStop.astro, TownHome.astro).
 */
const SHARED_WITH_HERO = new Set(['timnath old-town.jpg']);

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
  for (const [key, where] of users) {
    const town = key.split(' ')[0];
    const file = /\((\S+)\)$/.exec(where[0]!)?.[1];
    const shared = where.length === 2 && where.some((w) => w.includes('(hero)')) && where.every((w) => w.endsWith(`(${file})`));
    if (shared && SHARED_WITH_HERO.has(`${town} ${file}`)) continue;
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
if (!deployedTowns().some((t) => t.ga4Id) && !hub.ga4Id && hub.analytics !== true) {
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
          // A feed ingest reads on a multi-town guide must say which town its
          // items are in, or every file it stages fails this validator and the
          // run is lost (1 November 2026, the Idaho Springs library).
          if (config?.subTowns && !source.subTown && source.status === 'confirmed' && FEED_TYPES.includes(source.type) && source.feedUrl) {
            errors.push(`content/${town}/sources.json: ${source.id}: a confirmed feed on a multi-town guide needs a subTown (${config.subTowns.join(', ')}), or ingest cannot stage its items`);
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

// The ledger of listings that came off (content/<town>/retired.json,
// src/lib/former-slugs.ts): a slug still live, a target that is not, or a
// file the build could not read would each make a redirect wrong or missing.
for (const town of deployedTowns()) for (const issue of retiredLedgerIssues(town.slug, contentDir)) errors.push(issue);
for (const town of deployedTowns()) for (const issue of nextEventIssues(town.slug, contentDir)) errors.push(`content/${issue}`);

// The hub towns' profiles (data/hub/towns/<slug>.json, src/lib/town-profile.ts):
// every value with its source and check date, no guide or booking site, the
// file named for a town in the registry. And no tradition record read on a
// guide site.
{
  const dir = 'data/hub/towns';
  const files = existsSync(dir) ? readdirSync(dir).filter((f) => f.endsWith('.json')) : [];
  for (const f of files) {
    const rel = `${dir}/${f}`;
    let data: unknown;
    try {
      data = JSON.parse(readFileSync(`${dir}/${f}`, 'utf8'));
    } catch (e) {
      errors.push(`${rel}: not JSON (${(e as Error).message})`);
      continue;
    }
    const parsed = townProfileSchema.safeParse(data);
    if (!parsed.success) {
      for (const i of parsed.error.issues) errors.push(`${rel}: ${i.path.join('.') || '(root)'}: ${i.message}`);
      continue;
    }
    if (`${parsed.data.slug}.json` !== f) errors.push(`${rel}: slug "${parsed.data.slug}" is not the file's name`);
    if (!findHubTown(parsed.data.slug)) errors.push(`${rel}: "${parsed.data.slug}" is not a town in src/config/hub-towns.ts`);
  }
  for (const r of traditionRecords) {
    for (const url of [r.sourceUrl, ...r.years.map((y) => y.sourceUrl)]) {
      if (url && isGuideSite(url)) errors.push(`content/hub/traditions/${r.slug}.md: ${url} is a guide site, not the organizer's page`);
    }
  }
}

// The hub's town-anchored articles (content/hub/curiosity/, src/lib/curiosity.ts):
// every fact with its official source and check date, the file named for
// its slug, every town one the network has. A draft is counted, never
// built; an article due to be read again is listed, never a failure.
{
  const today = dayKey(new Date());
  const files = curiosityFiles(root);
  for (const f of files) {
    for (const issue of f.issues) errors.push(`${f.file}: ${issue}`);
    if (!f.article) continue;
    for (const t of f.article.towns) if (!placeName(t)) errors.push(`${f.file}: "${t}" is not a town page or a guide in src/config/hub-towns.ts`);
    if (reverifyDue(f.article, today)) warnings.push(`${f.file}: due to be read again since ${f.article.reverify!.from} (${f.article.reverify!.why}); read each source and move its \`checked\``);
  }
  const drafts = files.filter((f) => f.article?.status === 'draft');
  if (drafts.length > 0) {
    const open = drafts.reduce((n, f) => n + openItems(f.article!).length, 0);
    console.log(`curiosity: ${drafts.length} draft ${drafts.length === 1 ? 'article' : 'articles'} not on the site, ${open} flagged or empty ${open === 1 ? 'field' : 'fields'}; \`npm run curiosity\` lists them`);
  }
}

// Traditions dated in the next 30 days whose check is over 14 days old: a
// list, never a failure (src/lib/traditions.ts, staleSoon). The date was
// right when it was read; the fix is reading the organizer's page again.
{
  const stale = staleSoon(traditionRecords, dayKey(new Date()));
  if (stale.length > 0) {
    console.warn(`traditions: ${stale.length} dated in the next ${STALE_WITHIN_DAYS} days with a check over ${STALE_CHECK_DAYS} days old; read the source again and move \`checked\`:`);
    for (const s of stale) console.warn(`  stale  content/hub/traditions/${s.slug}.md: ${s.year} on ${s.date}, checked ${s.checked}`);
  }
}

for (const w of warnings) console.warn(`warn  ${w}`);
/**
 * Past events, one line, not one warning each. They are already hidden,
 * noindexed and out of the sitemap, and the weekly report lists them town by
 * town for the editor; as 169 identical warnings they buried the dozen that
 * were not (search-visibility phase 2, 15 October 2026). `--past` lists them.
 */
if (process.argv.includes('--past')) {
  for (const w of pastEvents) console.warn(`past  ${w}. Already hidden, noindexed and out of the sitemap. Roll it forward if it recurs; keep the file either way, so the links readers hold keep working. A listing that must come off goes in content/<town>/retired.json.`);
} else if (pastEvents.length > 0) {
  console.warn(`past  ${pastEvents.length} events are over and already hidden, noindexed and out of the sitemap (run with --past to list them; the weekly report lists them by town)`);
}
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
      `${String(t.excluded.length).padStart(2)} excluded · ${t.staged.events} / ${t.staged.places} staged${t.changes ? ` · ${t.changes} flagged` : ''}${t.listed || t.held ? ` · ${t.listed} listed, ${t.held} waiting to be in range` : ''}${note}`,
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
