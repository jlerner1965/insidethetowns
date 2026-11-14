#!/usr/bin/env node
/**
 * Writes vercel.json's redirect rules for every guide folded into its
 * town's page on the hub (`hubPage` on its config; src/lib/fold.ts), and
 * for every hub town with a domain of its own (`domain` in
 * src/config/hub-towns.ts) whose page is published. A folded guide's
 * domain carries those rules and no others: whatever in-guide rules it
 * had are replaced, since every one of their targets is gone. A hub
 * town's domain gets no rule until its page is published. An old event
 * address with a record of its own on the hub (data/hub/fold-events.json,
 * reviewed by hand) gets a rule of its own to the record's page, ahead of
 * the events catch-all.
 *
 *   node scripts/fold-rules.ts            # says what would change
 *   node scripts/fold-rules.ts --write    # rewrites vercel.json
 *
 * test/hub-fold.test.ts fails when vercel.json and the configs disagree.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { allTowns, getNetworkHub } from '../src/config/index.ts';
import { foldEventTargets, foldRules, type FoldEventMap } from '../src/lib/fold.ts';
import { HUB_TOWNS } from '../src/config/hub-towns.ts';
import { hubEventPages, publishedHubTowns } from '../src/lib/hub-towns.ts';
import { rawRecords } from '../src/lib/tradition-files.ts';
import foldEvents from '../data/hub/fold-events.json' with { type: 'json' };

type Rule = { source: string; destination: string; permanent?: boolean; has?: Array<{ type: string; value?: string }> };
const file = new URL('../vercel.json', import.meta.url);
const config = JSON.parse(readFileSync(file, 'utf8')) as { redirects: Rule[] };
const hub = getNetworkHub();
const hostOf = (r: Rule) => r.has?.find((h) => h.type === 'host')?.value;

let rules = config.redirects;
let changed = 0;
const records = rawRecords();
const published = new Set(publishedHubTowns(records).map((t) => t.slug));
/** A record's page, by slug, for the event map. */
const pages = new Map(hubEventPages(records, published).map((p) => [p.record.slug, { town: p.town, event: p.event }]));
const eventMap = foldEvents as FoldEventMap;
/** Every domain that forwards to a town page: a folded guide's, or a hub town's own. */
const domains = [
  ...allTowns.filter((t) => t.hubPage).map((t) => ({ domain: t.domain, town: t.hubPage!.town })),
  ...HUB_TOWNS.filter((t) => t.domain && published.has(t.slug)).map((t) => ({ domain: t.domain!, town: t.slug })),
];
for (const hubTown of HUB_TOWNS.filter((t) => t.domain && !published.has(t.slug))) {
  console.log(`${hubTown.domain}: no rule, ${hubTown.name}'s page is not published yet.`);
}
for (const host of Object.keys(eventMap)) {
  if (!domains.some((d) => d.domain === host)) throw new Error(`data/hub/fold-events.json names ${host}, which is no folded guide's or hub town's domain.`);
}
for (const town of domains) {
  const want = foldRules(town.domain, hub.domain, town.town, foldEventTargets(eventMap, town.domain, town.town, (slug) => pages.get(slug)));
  const have = rules.filter((r) => hostOf(r) === town.domain);
  if (JSON.stringify(have) === JSON.stringify(want)) continue;
  changed++;
  const at = rules.findIndex((r) => hostOf(r) === town.domain);
  const rest = rules.filter((r) => hostOf(r) !== town.domain);
  const index = at < 0 ? rest.length : rules.slice(0, at).filter((r) => hostOf(r) !== town.domain).length;
  rules = [...rest.slice(0, index), ...want, ...rest.slice(index)];
  console.log(`${town.domain}: ${have.length} rule(s) replaced by ${want.length}, to /${town.town}/`);
}
if (changed === 0) console.log('vercel.json already carries every folded guide’s rules.');
else if (process.argv.includes('--write')) {
  config.redirects = rules;
  writeFileSync(file, `${JSON.stringify(config, null, 2)}\n`, 'utf8');
  console.log(`vercel.json rewritten: ${changed} domain(s).`);
} else console.log(`${changed} domain(s) differ. Run with --write.`);
