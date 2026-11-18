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
 * And the 301s for every address a live guide or the hub would otherwise
 * answer with a redirect page: former and retired slugs, moved index pages,
 * the hub's pages that moved to a guide (scripts/lib/redirect-rules.ts).
 * Run it after a listing is retired, merged or re-filed.
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
import { generatedBlocks, retiredOntoGuideRules, withBlocks, REDIRECT_LIMIT, type HostRule } from './lib/redirect-rules.ts';
import { isMoved, MOVING_GUIDES } from '../src/config/index.ts';

type Rule = HostRule;
const file = new URL('../vercel.json', import.meta.url);
const config = JSON.parse(readFileSync(file, 'utf8')) as { redirects: Rule[]; rewrites?: Array<{ source: string; destination: string; has?: Rule['has'] }>; functions?: Record<string, { includeFiles?: string }> };
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
// A folded guide whose pages live on under its hub page (`section`; the move
// of 17 November 2026) is answered by api/legacy.ts from
// docs/migration/redirect-map.csv, one hop, 301 or 410: vercel.json holds no
// redirect for its host, only the rewrite that sends every path to the
// function (below).
// A guide moved whole (src/config/guide-move.ts) is answered the same way, from the map its own build writes.
const legacy = allTowns.filter((t) => (t.hubPage && t.section) || isMoved(t));
const domains = [
  ...allTowns.filter((t) => t.hubPage && !t.section).map((t) => ({ domain: t.domain, town: t.hubPage!.town })),
  ...HUB_TOWNS.filter((t) => t.domain && published.has(t.slug)).map((t) => ({ domain: t.domain!, town: t.slug })),
];
for (const hubTown of HUB_TOWNS.filter((t) => t.domain && !published.has(t.slug))) {
  console.log(`${hubTown.domain}: no rule, ${hubTown.name}'s page is not published yet.`);
}
// A moving guide's domain (src/config/guide-move.ts) is in the map ahead of its switch: its entries are read by the guide's own build once it is on.
const moving = allTowns.filter((t) => MOVING_GUIDES.includes(t.slug));
for (const host of Object.keys(eventMap)) {
  if (!domains.some((d) => d.domain === host) && !legacy.some((t) => t.domain === host) && !moving.some((t) => t.domain === host)) throw new Error(`data/hub/fold-events.json names ${host}, which is no folded guide's, moving guide's or hub town's domain.`);
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
// The live guides' former and retired addresses and the hub's moved pages
// (scripts/lib/redirect-rules.ts): a 301 each, ahead of the host's other rules.
for (const block of generatedBlocks()) {
  const next = withBlocks(rules, [block]);
  if (JSON.stringify(next) === JSON.stringify(rules)) continue;
  changed++;
  rules = next as Rule[];
  console.log(`${block.host}: ${block.rules.length} rule(s) for its former, retired and moved addresses`);
}
// The three retired domains that forward onto a guide path for path
// (scripts/lib/redirect-rules.ts, RETIRED_ONTO_GUIDES): their hand-written
// rules, home page first and catch-all last, with the guide's own former-slug
// block between; each destination follows the guide's switch.
for (const { host, lead, tail } of retiredOntoGuideRules()) {
  const have = rules.filter((r) => hostOf(r) === host);
  const generated = have.filter((r) => !lead.some((l) => l.source === r.source) && !tail.some((x) => x.source === r.source));
  const want = [...lead, ...generated, ...tail];
  if (JSON.stringify(have) === JSON.stringify(want)) continue;
  changed++;
  const at = rules.findIndex((r) => hostOf(r) === host);
  const rest = rules.filter((r) => hostOf(r) !== host);
  const index = at < 0 ? rest.length : rules.slice(0, at).filter((r) => hostOf(r) !== host).length;
  rules = [...rest.slice(0, index), ...want, ...rest.slice(index)];
  console.log(`${host}: ${have.length} rule(s) replaced by ${want.length}, onto the guide where it is served`);
}
// The folded guides' domains: no redirect rule of their own, and one rewrite
// each to api/legacy.ts. The rewrite names every path (`/:path*`, the root
// included); redirects run first, so none may stay for these hosts.
for (const t of legacy) {
  const had = rules.filter((r) => hostOf(r) === t.domain).length;
  if (had === 0) continue;
  changed++;
  rules = rules.filter((r) => hostOf(r) !== t.domain);
  console.log(`${t.domain}: ${had} redirect rule(s) removed; api/legacy.ts answers every path`);
}
// `/(.*)` and `$1`, the form the old catch-all redirects used on these hosts:
// Vercel matches `/:path*` strictly, so it missed every address ending in a
// slash and the bare `/` (after #459 and #460 those answered 404; only
// /robots.txt and the sitemaps reached the function). The destination is the
// function's slashed address, the only one it is served at with trailingSlash.
const wantRewrites = legacy.map((t) => ({ source: '/(.*)', has: [{ type: 'host', value: t.domain }], destination: '/api/legacy/?legacy_path=/$1' }));
const otherRewrites = (config.rewrites ?? []).filter((r) => !legacy.some((t) => hostOf(r as Rule) === t.domain));
const nextRewrites = [...otherRewrites, ...wantRewrites];
if (JSON.stringify(nextRewrites) !== JSON.stringify(config.rewrites ?? []) || !config.functions?.['api/legacy.ts']) {
  changed++;
  console.log(`rewrites: ${wantRewrites.length} folded domain(s) sent to api/legacy.ts`);
}
// Vercel refuses a deployment with more (vercel.com/docs/redirects/configuration-redirects, "Limits").
if (rules.length > REDIRECT_LIMIT) throw new Error(`vercel.json would hold ${rules.length} redirects; Vercel allows ${REDIRECT_LIMIT}.`);
if (changed === 0) console.log(`vercel.json already carries every rule (${rules.length} of the ${REDIRECT_LIMIT} Vercel allows).`);
else if (process.argv.includes('--write')) {
  config.redirects = rules;
  config.rewrites = nextRewrites;
  // The map ships with the function (api/legacy.ts reads it from disk).
  config.functions = { ...(config.functions ?? {}), 'api/legacy.ts': { includeFiles: 'api/legacy-map.json' } };
  writeFileSync(file, `${JSON.stringify(config, null, 2)}\n`, 'utf8');
  console.log(`vercel.json rewritten: ${changed} domain(s).`);
} else console.log(`${changed} domain(s) differ. Run with --write.`);
