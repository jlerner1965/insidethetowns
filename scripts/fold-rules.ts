#!/usr/bin/env node
/**
 * Writes vercel.json's redirect rules for every guide folded into its
 * town's page on the hub (`hubPage` on its config; src/lib/fold.ts). A
 * folded guide's domain carries those rules and no others: whatever
 * in-guide rules it had are replaced, since every one of their targets
 * is gone.
 *
 *   node scripts/fold-rules.ts            # says what would change
 *   node scripts/fold-rules.ts --write    # rewrites vercel.json
 *
 * test/hub-fold.test.ts fails when vercel.json and the configs disagree.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { allTowns, getNetworkHub } from '../src/config/index.ts';
import { foldRules } from '../src/lib/fold.ts';

type Rule = { source: string; destination: string; permanent?: boolean; has?: Array<{ type: string; value?: string }> };
const file = new URL('../vercel.json', import.meta.url);
const config = JSON.parse(readFileSync(file, 'utf8')) as { redirects: Rule[] };
const hub = getNetworkHub();
const hostOf = (r: Rule) => r.has?.find((h) => h.type === 'host')?.value;

let rules = config.redirects;
let changed = 0;
for (const town of allTowns.filter((t) => t.hubPage)) {
  const want = foldRules(town.domain, hub.domain, town.hubPage!.town);
  const have = rules.filter((r) => hostOf(r) === town.domain);
  if (JSON.stringify(have) === JSON.stringify(want)) continue;
  changed++;
  const at = rules.findIndex((r) => hostOf(r) === town.domain);
  const rest = rules.filter((r) => hostOf(r) !== town.domain);
  const index = at < 0 ? rest.length : rules.slice(0, at).filter((r) => hostOf(r) !== town.domain).length;
  rules = [...rest.slice(0, index), ...want, ...rest.slice(index)];
  console.log(`${town.domain}: ${have.length} rule(s) replaced by ${want.length}, to /${town.hubPage!.town}/`);
}
if (changed === 0) console.log('vercel.json already carries every folded guide’s rules.');
else if (process.argv.includes('--write')) {
  config.redirects = rules;
  writeFileSync(file, `${JSON.stringify(config, null, 2)}\n`, 'utf8');
  console.log(`vercel.json rewritten: ${changed} domain(s).`);
} else console.log(`${changed} domain(s) differ. Run with --write.`);
