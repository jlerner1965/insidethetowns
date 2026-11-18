#!/usr/bin/env node
/**
 * Runs an Astro command for one site. The site comes from --town=<slug> or the
 * TOWN env var, so both of these work:
 *
 *   npm run dev -- --town=lyons
 *   TOWN=lyons npm run dev
 *
 * `build` validates content first so a bad frontmatter field fails the build
 * before Astro starts, and checks the built site last (scripts/check-site.ts).
 */
import { spawnSync } from 'node:child_process';
import { buildSearchIndex } from './lib/search-index.ts';
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { allSites, domainMoved, getNetworkHub, isMoved, isSectionBuild, sectionBase, sectionTowns, SECTION_ENV } from '../src/config/index.ts';
import { guideMap } from './migration/guide-map.ts';
import { mergeSection, rewriteMovedLinks } from './lib/section-merge.ts';
import { movedEventPaths, movedPath } from '../src/lib/moved-guides.ts';
import { foldEventTargets, type FoldEventMap } from '../src/lib/fold.ts';
import { hubEventPages, publishedHubTowns } from '../src/lib/hub-towns.ts';
import { rawRecords } from '../src/lib/tradition-files.ts';
import foldEvents from '../data/hub/fold-events.json' with { type: 'json' };

const [command = 'dev', ...rest] = process.argv.slice(2);
const args: string[] = [];
let town = process.env.TOWN;
for (let i = 0; i < rest.length; i++) {
  const arg = rest[i]!;
  if (arg.startsWith('--town=')) town = arg.slice('--town='.length);
  else if (arg === '--town') town = rest[++i];
  else args.push(arg);
}
if (!town) {
  console.error('No site selected. Use "npm run dev -- --town=<slug>" or "TOWN=<slug> npm run dev".');
  process.exit(1);
}
const env = { ...process.env, TOWN: town };

// A guide that only redirects (`status: 'redirect'` and not a section
// build): its domain is answered by vercel.json's rules or by api/legacy.ts
// (the move of 17 November 2026), so nothing it would build is ever served.
// No Astro build: an empty dist/ with one 404 page, and the function beside
// it. The site's old pages are in git history.
// A guide moved into the hub (its switch on, src/config/guide-move.ts): its
// own project serves no site, only api/legacy.ts. It builds the guide's
// section exactly as the hub does, from the same content, and writes the
// map the function answers from (scripts/migration/guide-map.ts) into
// api/legacy-map.json, which Vercel bundles with the function after this
// command; dist/ holds one 404 page. Anything published before or after the
// cutover is in the map of the build that serves it. While its domain is
// held (the first of a switch's two steps, DOMAIN_HELD), it builds the guide.
if (command === 'build' && !isSectionBuild(env)) {
  const site = allSites.find((s) => s.slug === town);
  if (site?.kind === 'town' && domainMoved(site, env)) {
    const v = spawnSync(process.execPath, ['scripts/validate-content.ts', '--build'], { stdio: 'inherit', env });
    if (v.status !== 0) process.exit(v.status ?? 1);
    const out = `.sections/${site.slug}`;
    const built = spawnSync('astro', ['build', '--outDir', out, '--force'], { stdio: 'inherit', env: { ...env, [SECTION_ENV]: '1' }, shell: true });
    if (built.status !== 0) process.exit(built.status ?? 1);
    const hub = getNetworkHub();
    const map = guideMap({ guide: site, out, hubDomain: hub.domain });
    const file = 'api/legacy-map.json';
    const table = JSON.parse(readFileSync(file, 'utf8')) as Record<string, unknown>;
    table[site.domain] = map.entry;
    // A domain that forwards to the guide (formerDomains): the same answers, no sitemap of its own to serve.
    for (const alias of site.formerDomains ?? []) table[alias] = { page: map.entry.page, paths: map.entry.paths, moved: map.entry.moved };
    writeFileSync(file, JSON.stringify(table), 'utf8');
    rmSync('dist', { recursive: true, force: true });
    mkdirSync('dist', { recursive: true });
    writeFileSync('dist/404.html', `<!doctype html><html lang="en"><meta charset="utf-8"><title>Not found</title><meta name="robots" content="noindex"><body><p>Not found. <a href="https://${hub.domain}/${site.hubPage!.town}/">${site.siteTitle}</a></p></body></html>\n`, 'utf8');
    const c = map.counts;
    console.log(`${site.domain}: moved to https://${hub.domain}/${site.hubPage!.town}/. ${Object.keys(map.entry.paths).length} addresses mapped (${c.built} built, ${c.events} annual events to their tradition pages, ${c.forwarded} former slugs, ${c.series} past series dates to the series, ${c.history} decided, ${c.gone} gone); api/legacy.ts answers every path. No site build.`);
    if (map.unmapped.length) {
      console.error(`${site.domain}: ${map.unmapped.length} published address(es) with no answer, sent to the section's home until decided (docs/migration/guides/${site.domain}.csv):`);
      for (const row of map.unmapped.slice(0, 40)) console.error(`  ${row.old_path}  (${row.source})`);
    }
    process.exit(0);
  }
  // A redirect-only domain a moved guide names in formerDomains, on a project of its own (insidefrederickco.com,
  // Carbon Valley's): its rewrite sends every path to api/legacy.ts, so its build writes the guide's map for its
  // domain, made the same way the guide's own project makes it.
  const taker = site?.kind === 'town' && site.status === 'redirect' ? allSites.find((g) => g.kind === 'town' && domainMoved(g, env) && g.formerDomains?.includes(site.domain)) : undefined;
  if (site?.kind === 'town' && taker?.kind === 'town') {
    const v = spawnSync(process.execPath, ['scripts/validate-content.ts', '--build'], { stdio: 'inherit', env });
    if (v.status !== 0) process.exit(v.status ?? 1);
    const out = `.sections/${taker.slug}`;
    const built = spawnSync('astro', ['build', '--outDir', out, '--force'], { stdio: 'inherit', env: { ...env, TOWN: taker.slug, [SECTION_ENV]: '1' }, shell: true });
    if (built.status !== 0) process.exit(built.status ?? 1);
    const hub = getNetworkHub();
    const map = guideMap({ guide: taker, out, hubDomain: hub.domain });
    const file = 'api/legacy-map.json';
    const table = JSON.parse(readFileSync(file, 'utf8')) as Record<string, unknown>;
    table[site.domain] = { page: map.entry.page, paths: map.entry.paths, moved: map.entry.moved };
    writeFileSync(file, JSON.stringify(table), 'utf8');
    rmSync('dist', { recursive: true, force: true });
    mkdirSync('dist', { recursive: true });
    writeFileSync('dist/404.html', `<!doctype html><html lang="en"><meta charset="utf-8"><title>Not found</title><meta name="robots" content="noindex"><body><p>Not found. <a href="${map.entry.page}">${taker.siteTitle}</a></p></body></html>\n`, 'utf8');
    console.log(`${site.domain}: forwards to ${taker.siteTitle}, moved to ${map.entry.page}. ${Object.keys(map.entry.paths).length} addresses mapped from its map; api/legacy.ts answers every path. No site build.`);
    process.exit(0);
  }
  if (site?.kind === 'town' && site.status === 'redirect') {
    rmSync('dist', { recursive: true, force: true });
    mkdirSync('dist', { recursive: true });
    writeFileSync('dist/404.html', `<!doctype html><html lang="en"><meta charset="utf-8"><title>Not found</title><meta name="robots" content="noindex"><body><p>Not found. <a href="https://${getNetworkHub().domain}/">Inside the Towns</a></p></body></html>\n`, 'utf8');
    console.log(`${site.domain}: a redirect-only site; dist/ holds one 404 page and the host's requests are answered by vercel.json and api/legacy.ts. No site build.`);
    process.exit(0);
  }
}

// `--build`: an entry that fails its schema is reported and excluded rather
// than failing the build, because a failed build on Vercel leaves the previous
// deployment serving stale events. Anything repo-wide (a CSP mismatch, a
// missing licence row) still fails here. `npm run validate` on its own, and
// in CI, is strict about both.
if (command === 'build') {
  const v = spawnSync(process.execPath, ['scripts/validate-content.ts', '--build'], { stdio: 'inherit', env });
  if (v.status !== 0) process.exit(v.status ?? 1);
}

// `--force` on build and dev: Astro keeps each parsed content entry in a cache
// (node_modules/.astro/data-store.json), which Vercel carries from one build
// to the next, and re-parses only the files that changed. A schema change in a
// module the collection imports (src/lib/curiosity.ts) does not invalidate it,
// so an untouched file keeps the shape it had: on 13 November 2026 the field
// `games` and its default reached the football article but not the Eldora one
// left in the cache, and every hub deploy failed on "games is not iterable"
// while CI, which starts clean, passed. Parsing everything costs a few seconds.
const forced = (command === 'build' || command === 'dev') && !args.includes('--force') ? ['--force'] : [];
const result = spawnSync('astro', [command, ...args, ...forced], { stdio: 'inherit', env, shell: true });
if (result.status !== 0) process.exit(result.status ?? 1);

// The hub's full sections (Longmont, Loveland, Fort Collins, Estes Park;
// the move of 17 November 2026): each folded guide's pages, built from its
// own templates with HUB_SECTION=1 and put under /<town>/ in dist/
// (scripts/lib/section-merge.ts). After the hub's own build, so a path both
// would write is caught, and before the search index and the site check,
// which then read the section's pages as the hub's own. One at a time: the
// builds share Astro's generated files in .astro/.
let deadLinks = 0;
if (command === 'build' && town === 'hub' && !args.includes('--no-sections')) {
  const hub = getNetworkHub();
  // Each old event address with a tradition page (data/hub/fold-events.json), for the links the section's pages still carry to it.
  const records = rawRecords();
  const published = new Set(publishedHubTowns(records).map((t) => t.slug));
  const pages = new Map(hubEventPages(records, published).map((p) => [p.record.slug, { town: p.town, event: p.event }]));
  for (const section of sectionTowns('full')) {
    const events = Object.fromEntries(foldEventTargets(foldEvents as FoldEventMap, section.domain, section.hubPage!.town, (slug) => pages.get(slug)).map((e) => [e.path, `/${e.town ?? section.hubPage!.town}/${e.event}/`]));
    const out = `.sections/${section.slug}`;
    const built = spawnSync('astro', ['build', '--outDir', out, '--force'], { stdio: 'inherit', env: { ...env, TOWN: section.slug, [SECTION_ENV]: '1' }, shell: true });
    if (built.status !== 0) process.exit(built.status ?? 1);
    const merged = mergeSection({ from: out, hub: 'dist', base: sectionBase(section), oldDomain: section.domain, hubDomain: hub.domain, events, carryAll: isMoved(section) });
    console.log(`section ${sectionBase(section)}/: ${merged.pages} pages, ${merged.files} files merged into dist/`);
    if (merged.dangling.length) {
      deadLinks += merged.dangling.length;
      console.error(`section ${sectionBase(section)}/: ${merged.dangling.length} link(s) to a page neither the section nor the hub builds, sent to ${sectionBase(section)}/:`);
      for (const line of [...new Set(merged.dangling.map((d) => d.split(': ')[1]))].slice(0, 40)) console.error(`  ${line}`);
    }
  }
  // Each such link lands on the town's page; the list above is for the editor, not a failed build.
  if (deadLinks) console.error(`sections: ${deadLinks} link(s) sent to a town page; see above.`);
  // The hub's own pages that name a moved guide's domain by hand: each to the guide's place on the hub (src/lib/moved-guides.ts).
  const movedGuides = sectionTowns('full').filter((t) => isMoved(t));
  const movedDomains = movedGuides.map((t) => t.domain);
  // The annual event pages their sections do not carry, by their path on the hub, to the tradition page each stands for.
  const dropped = Object.fromEntries(movedGuides.flatMap((t) => Object.entries(movedEventPaths(t)).map(([path, to]) => [`/${t.hubPage!.town}${path}`, to])));
  const relinked = rewriteMovedLinks('dist', hub.domain, movedDomains, movedPath, dropped);
  if (relinked) console.log(`moved guides: links to ${movedDomains.length} domain${movedDomains.length === 1 ? '' : 's'} rewritten to the hub in ${relinked} file(s)`);
}

// The site search's index; on the hub it also takes in the town pages
// (scripts/lib/search-index.ts).
if (command === 'build') {
  try {
    const { pages, records } = await buildSearchIndex('dist');
    console.log(`search index: ${pages} pages${records ? `, ${records} town pages from the network` : ''}`);
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

// What was built, read the way a crawler reads it: links, canonicals, the
// sitemap, structured data, redirects (scripts/check-site.ts). A problem
// fails the build everywhere but on Vercel, for the reason given above for
// `--build`: CI has already refused the change, and a failed deploy there
// only leaves yesterday's listings serving. The report is in the build log
// either way.
if (command === 'build') {
  const checked = spawnSync(process.execPath, ['scripts/check-site.ts'], { stdio: 'inherit', env });
  if (checked.status !== 0) {
    if (!process.env.VERCEL) process.exit(checked.status ?? 1);
    console.error('check-site: problems found; deploying anyway, because this is Vercel (scripts/run.ts).');
  }
}
process.exit(0);
