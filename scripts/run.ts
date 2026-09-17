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

if (command === 'build') {
  const v = spawnSync(process.execPath, ['scripts/validate-content.ts'], { stdio: 'inherit', env });
  if (v.status !== 0) process.exit(v.status ?? 1);
}

const result = spawnSync('astro', [command, ...args], { stdio: 'inherit', env, shell: true });
process.exit(result.status ?? 1);
