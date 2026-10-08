#!/usr/bin/env node
/**
 * Runs an Astro command for one site. The site comes from --town=<slug> or the
 * TOWN env var, so both of these work:
 *
 *   npm run dev -- --town=lyons
 *   TOWN=lyons npm run dev
 *
 * `build` validates content first so a bad frontmatter field fails the build
 * before Astro starts.
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

const result = spawnSync('astro', [command, ...args], { stdio: 'inherit', env, shell: true });
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
process.exit(0);
