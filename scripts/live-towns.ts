#!/usr/bin/env node
/**
 * Prints the slugs of every site that builds pages: the hub plus LIVE_TOWNS,
 * less any guide moved into the hub (src/config/guide-move.ts), whose own
 * project is a redirect project and builds only when its redirect files
 * change. CI uses it to build each one; the nightly rebuild
 * (.github/workflows/scheduled-rebuild.yml) fires each one's deploy hook, so
 * a moved guide's hook is no longer called and its line comes out of
 * VERCEL_DEPLOY_HOOKS; DEPLOY.md uses it as the list of Vercel projects that
 * must exist.
 *
 *   node scripts/live-towns.ts          # one per line
 *   node scripts/live-towns.ts --json   # ["hub","niwot"]
 *   node scripts/live-towns.ts --moved  # the guides moved into the hub
 */
import { allTowns, domainMoved, LIVE_TOWNS } from '../src/config/index.ts';
// A guide whose domain is held (DOMAIN_HELD) still serves the guide there, so its hook stays.
const moved = allTowns.filter((t) => domainMoved(t)).map((t) => t.slug);
const sites = process.argv.includes('--moved') ? moved : ['hub', ...LIVE_TOWNS.filter((s) => !moved.includes(s))];
console.log(process.argv.includes('--json') ? JSON.stringify(sites) : sites.join('\n'));
