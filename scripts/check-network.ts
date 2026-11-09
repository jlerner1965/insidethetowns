#!/usr/bin/env node
/**
 * Checks what only shows once every live site is built: the links from one
 * site to another (the hub to every guide, a guide to its neighbours, the
 * network bar, a listing filed on the next town's guide) and the redirects
 * in vercel.json that cross from one domain to another.
 *
 *   npm run check-network                reads .cache/manifests/, one file per built site
 *   npm run check-network -- --build     builds every live site first (about a minute each)
 *
 * Each `npm run build` writes its site's manifest (scripts/check-site.ts):
 * the paths it serves and the links it makes to the other sites. CI builds
 * the sites in parallel, collects the manifests and runs this once. A live
 * site with no manifest is a problem too: its links were never checked.
 */
import { spawnSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { allSites, LIVE_TOWNS } from '../src/config/index.ts';
import { checkNetwork, formatProblems, type Manifest, type Problem } from './lib/site-check.ts';
import { MANIFESTS, networkDomains, vercelRedirects } from './lib/network.ts';

const args = process.argv.slice(2);
const dir = args.find((a) => !a.startsWith('--')) ?? MANIFESTS;
const live = allSites.filter((s) => s.kind === 'hub' || LIVE_TOWNS.includes(s.slug));

if (args.includes('--build')) {
  for (const site of live) {
    console.log(`\n— ${site.slug} —`);
    const built = spawnSync(process.execPath, ['scripts/run.ts', 'build', `--town=${site.slug}`], { stdio: 'inherit' });
    if (built.status !== 0) process.exit(built.status ?? 1);
  }
}

const manifests: Manifest[] = existsSync(dir)
  ? readdirSync(dir).filter((f) => f.endsWith('.json')).map((f) => JSON.parse(readFileSync(join(dir, f), 'utf8')) as Manifest)
  : [];
const redirects = vercelRedirects();
const problems: Problem[] = [];
const have = new Set(manifests.map((m) => m.domain));
for (const site of live) {
  if (!have.has(site.domain)) problems.push({ rule: 'not-built', where: site.domain, detail: `no manifest in ${dir}/: build it (TOWN=${site.slug} npm run build), or run this with --build` });
}
problems.push(...checkNetwork(manifests, redirects, networkDomains(redirects)));

const links = manifests.reduce((n, m) => n + m.outbound.length, 0);
if (problems.length === 0) {
  console.log(`check-network: ${manifests.length} sites, ${links} links between them, no problems`);
  process.exit(0);
}
console.error(`check-network: ${problems.length} problem${problems.length === 1 ? '' : 's'} across ${manifests.length} sites`);
console.error(formatProblems(problems, args.includes('--all') ? Infinity : 12));
process.exit(1);
