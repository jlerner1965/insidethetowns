#!/usr/bin/env node
/**
 * Prints the slugs of every site that is deployed: the hub plus LIVE_TOWNS.
 * CI uses it to build each one; DEPLOY.md uses it as the list of Vercel
 * projects that must exist.
 *
 *   node scripts/live-towns.ts          # one per line
 *   node scripts/live-towns.ts --json   # ["hub","niwot"]
 */
import { LIVE_TOWNS } from '../src/config/index.ts';

const sites = ['hub', ...LIVE_TOWNS];
console.log(process.argv.includes('--json') ? JSON.stringify(sites) : sites.join('\n'));
