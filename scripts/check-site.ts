#!/usr/bin/env node
/**
 * Checks a built site for what breaks quietly: links, canonicals, the
 * sitemap, structured data and vercel.json's redirects on that host
 * (scripts/lib/site-check.ts says what each rule is and why).
 *
 *   TOWN=niwot npm run check-site            dist/, after a build
 *   npm run check-site -- --town=hub --dir=out/hub
 *   npm run check-site -- --all              print every problem, not the first dozen of each kind
 *
 * `npm run build` runs it as its last step and CI builds every live site, so
 * a problem here fails the pull request. On Vercel it reports and does not
 * fail (scripts/run.ts): a failed deploy leaves yesterday's events serving,
 * which is the worse outcome, and CI has already refused the change.
 *
 * It also writes the site's manifest (.cache/manifests/, or
 * --manifest=<folder>): what scripts/check-network.ts needs to check the
 * links between sites once every one is built.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { allSites } from '../src/config/index.ts';
import { checkSite, formatProblems, isBuilt, manifestName, type VercelRedirect } from './lib/site-check.ts';
import { MANIFESTS, networkDomains, SENT_ISSUE, vercelRedirects } from './lib/network.ts';
import { fixturesEnabled } from '../src/lib/traditions.ts';

const args = process.argv.slice(2);
const option = (name: string): string | undefined => args.find((a) => a.startsWith(`--${name}=`))?.slice(name.length + 3);
const slug = option('town') ?? process.env.TOWN;
const dir = option('dir') ?? 'dist';
const site = allSites.find((s) => s.slug === slug);
if (!site) {
  console.error(`check-site: no site "${slug ?? ''}". Use TOWN=<slug> or --town=<slug>.`);
  process.exit(2);
}
if (!isBuilt(dir)) {
  console.error(`check-site: ${dir}/ holds no built site. Run "TOWN=${site.slug} npm run build" first.`);
  process.exit(2);
}

const redirects: VercelRedirect[] = vercelRedirects();
const { problems, manifest, pages } = checkSite({
  dir,
  domain: site.domain,
  network: networkDomains(redirects),
  redirects,
  // The hub's archive of sent Thursday emails: /newsletter/2026-10-22-lyons/.
  archive: site.kind === 'hub' ? SENT_ISSUE : undefined,
  fixtures: fixturesEnabled(),
});

const to = option('manifest') ?? MANIFESTS;
mkdirSync(to, { recursive: true });
writeFileSync(join(to, manifestName(site.domain)), JSON.stringify(manifest));

if (problems.length === 0) {
  console.log(`check-site: ${site.domain}: ${pages} pages, ${manifest.outbound.length} links to other guides, no problems`);
  process.exit(0);
}
console.error(`check-site: ${site.domain}: ${problems.length} problem${problems.length === 1 ? '' : 's'} in ${pages} pages`);
console.error(formatProblems(problems, args.includes('--all') ? Infinity : 12));
process.exit(1);
