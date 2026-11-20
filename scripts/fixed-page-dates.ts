/**
 * The day each page of fixed copy last changed, for the sitemap's lastmod
 * (the owner, 20 November 2026: the about, contact and policy pages, the
 * forms, the hub's moving pages and its list of towns had none).
 *
 * Such a page has no date in the content, so its date is the last commit
 * that touched the files it is made from: its own template, and for the
 * corrections and moving pages the copy they print. Written to
 * data/fixed-page-dates.json and committed, because the host builds from a
 * shallow clone and cannot ask git. Run it after changing one of these
 * pages: `node scripts/fixed-page-dates.ts`. A page it has no date for takes
 * the build's (src/lib/lastmod.ts); no date is made up.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, writeFileSync } from 'node:fs';

/** Guide path -> the files the page is made from; `<town>` is the site's slug. */
const TOWN_PAGES: Record<string, string[]> = {
  '/about/': ['src/pages/about.astro'],
  '/contact/': ['src/pages/contact.astro'],
  '/corrections/': ['src/pages/corrections.astro', 'content/<town>/corrections'],
  '/credits/': ['src/pages/credits.astro'],
  '/editorial/': ['src/pages/editorial.astro'],
  '/for-businesses/': ['src/routes/town/for-businesses.astro'],
  '/moving-here/': ['src/routes/town/moving-here.astro', 'content/<town>/pages/moving-here.md'],
  '/privacy/': ['src/pages/privacy.astro'],
  '/submit-event/': ['src/routes/town/submit-event.astro'],
};
const HUB_PAGES: Record<string, string[]> = {
  '/about/': ['src/pages/about.astro'],
  '/advertise/': ['src/routes/hub/advertise.astro'],
  '/contact/': ['src/pages/contact.astro'],
  '/corrections/': ['src/pages/corrections.astro', 'content/hub/corrections'],
  '/credits/': ['src/pages/credits.astro'],
  '/editorial/': ['src/pages/editorial.astro'],
  '/moving/': ['src/routes/hub/moving.astro'],
  '/moving/*/': ['src/routes/hub/moving.astro', 'src/routes/hub/moving'],
  '/privacy/': ['src/pages/privacy.astro'],
  '/submit-event/': ['src/routes/hub/submit-event.astro'],
  '/towns/': ['src/routes/hub/towns.astro'],
};

if (execFileSync('git', ['rev-parse', '--is-shallow-repository'], { encoding: 'utf8' }).trim() === 'true') {
  console.error('This clone is shallow, so git cannot say when a file last changed. Run `git fetch --unshallow` first.');
  process.exit(1);
}

function lastChange(files: string[]): string | undefined {
  const present = files.filter((f) => existsSync(f));
  if (present.length === 0) return undefined;
  return execFileSync('git', ['log', '-1', '--format=%cI', '--', ...present], { encoding: 'utf8' }).trim() || undefined;
}

const out: Record<string, Record<string, string>> = {};
const sites = readdirSync('src/config/towns')
  .map((f) => f.replace(/\.ts$/, ''))
  .filter((s) => s !== 'types' && s !== 'registry')
  .sort();
for (const site of sites) {
  const pages = site === 'hub' ? HUB_PAGES : TOWN_PAGES;
  const dates: Record<string, string> = {};
  for (const [path, files] of Object.entries(pages)) {
    const iso = lastChange(files.map((f) => f.replace('<town>', site)));
    if (iso) dates[path] = new Date(iso).toISOString();
  }
  out[site] = dates;
}
writeFileSync('data/fixed-page-dates.json', `${JSON.stringify(out, null, 2)}\n`);
console.log(`data/fixed-page-dates.json: ${sites.length} sites`);
