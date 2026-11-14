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
