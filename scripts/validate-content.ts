#!/usr/bin/env node
/**
 * Validates every file under content/<town>/ against the collection schemas.
 * Fails (exit 1) when required frontmatter is missing, an image path does not
 * exist, or a date will not parse. Warns about events that are already past
 * so they can be pruned, and about towns without a config file.
 *
 *   npm run validate
 *
 * Runs automatically before every `npm run build`.
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'astro/zod';
import { COLLECTIONS, schemaFor, type CollectionName } from '../src/content/schemas.ts';
import { allSites, liveTowns } from '../src/config/index.ts';
// Imported directly, not via getHub(): the validator runs without TOWN set.
import { hub } from '../src/config/towns/hub.ts';
import { parseFrontmatter } from './lib/frontmatter.ts';
import { hoursTextByDesign, parseHoursText } from '../src/lib/hours.ts';
import { licenseName, parseLedger, publicCredit, type LedgerRow } from '../src/lib/credits.ts';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const contentDir = join(root, 'content');
const townsDir = join(root, 'src/config/towns');

const errors: string[] = [];
const warnings: string[] = [];
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

function validateFile(collection: CollectionName, file: string) {
  const rel = relative(root, file);
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
    for (const issue of result.error.issues) {
      const path = issue.path.length ? issue.path.join('.') : '(root)';
      errors.push(`${rel}: ${path}: ${issue.message}`);
    }
    return;
  }
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
    for (const collection of COLLECTIONS) {
      const dir = join(townDir, collection);
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
        validateFile(collection, join(dir, name));
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
for (const e of errors) console.error(`error ${e}`);
console.log(`\nvalidate-content: ${checked} entries checked, ${errors.length} errors, ${warnings.length} warnings`);
if (errors.length > 0) process.exit(1);
