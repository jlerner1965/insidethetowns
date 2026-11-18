#!/usr/bin/env node
/**
 * Reads docs/migration/redirect-map.csv against the live domains (the move
 * of 17 November 2026, step 7): each old address answers 301 or 308 to its
 * mapped destination within the hop limit, and that destination answers
 * 200; or it answers 410 where the map says so; or, for the sitemap and
 * robots.txt, 200. Host-based answers cannot be tried on a preview address,
 * so this runs after the deploy, against the domains themselves.
 *
 *   node scripts/migration/check-production.ts                 # every host
 *   node scripts/migration/check-production.ts --host=insidegolden.com
 *   node scripts/migration/check-production.ts --report=/tmp/redirects.md --concurrency=8
 *   node scripts/migration/check-production.ts --variants=200   # how many 301s to try in their variants (default 150)
 *   node scripts/migration/check-production.ts --moved=johnstown  # a guide moved into the hub: its map, made from .sections/johnstown
 *
 * A guide moved into the hub (src/config/guide-move.ts) has no rows in the
 * CSV: its map is made from its own content at build
 * (scripts/migration/guide-map.ts). `--moved=<slug>` (or `--moved=all`)
 * makes the same map here from the guide's section build (TOWN=hub npm run
 * build leaves one at .sections/<slug>/) and checks every address of it on
 * the live domain: each 301 to its page, each 410, and the sitemap and
 * robots.txt as 200s.
 *
 * Beyond the map: a sample of the 301s is tried without its trailing slash
 * (Vercel's trailingSlash setting answers that with a 308 to the slash
 * first, so it may take one hop more) and with a query string, and must
 * land on the same page; an address the map does not know must go to the
 * town's page; and a few answers are asked for twice, to read the CDN's
 * cache headers and whether the second came from its cache (x-vercel-cache).
 *
 * The report is Markdown, for the pull request. Exit 1 when anything fails.
 */
import { existsSync, writeFileSync } from 'node:fs';
import { allTowns, isMoved } from '../../src/config/index.ts';
import { guideMap } from './guide-map.ts';
import { readCsv } from './shared.ts';

const args = process.argv.slice(2);
const option = (name: string) => args.find((a) => a.startsWith(`--${name}=`))?.slice(name.length + 3);
const onlyHost = option('host');
const report = option('report');
const concurrency = Number(option('concurrency') ?? 8);
/** One hop, or two where www goes to the apex at the domain level; the trailing-slash 308 Vercel adds is a third. */
const HOP_LIMIT = Number(option('hops') ?? 2);
const UA = 'InsideTheTowns-RedirectCheck/1.0 (+https://insidethetowns.com/editorial/)';

interface Hop { status: number; location?: string }
async function follow(url: string, limit: number): Promise<{ hops: Hop[]; final?: Response; error?: string }> {
  const hops: Hop[] = [];
  let current = url;
  for (let i = 0; i <= limit; i++) {
    let res: Response;
    try {
      res = await fetch(current, { redirect: 'manual', headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(20_000) });
    } catch (e) {
      return { hops, error: e instanceof Error ? e.message : String(e) };
    }
    if (res.status >= 300 && res.status < 400 && res.headers.get('location')) {
      const next = new URL(res.headers.get('location')!, current).toString();
      hops.push({ status: res.status, location: next });
      current = next;
      continue;
    }
    return { hops, final: res };
  }
  return { hops, error: `more than ${limit} hops` };
}

interface Result { host: string; path: string; expected: string; got: string; ok: boolean }
const movedArg = option('moved');
const movedGuides = movedArg ? allTowns.filter((t) => isMoved(t) && (movedArg === 'all' || t.slug === movedArg)) : [];
if (movedArg && !movedGuides.length) throw new Error(`--moved=${movedArg}: no guide with its switch on (src/config/guide-move.ts; GUIDE_MOVE_ON=${movedArg} turns it on for this run)`);
const movedRows = movedGuides.flatMap((guide) => {
  const out = `.sections/${guide.slug}`;
  if (!existsSync(`${out}/sitemap-0.xml`)) throw new Error(`${guide.domain}: no section build at ${out}/ to make its map from (TOWN=hub npm run build leaves one).`);
  const m = guideMap({ guide, out, hubDomain: 'insidethetowns.com' });
  return [
    ...Object.entries(m.entry.paths).map(([old_path, to]) => (to === 0 ? { host: guide.domain, old_path, status: '410', destination: '' } : { host: guide.domain, old_path, status: '301', destination: to })),
    ...['/sitemap-index.xml', '/sitemap-0.xml', '/robots.txt'].map((old_path) => ({ host: guide.domain, old_path, status: '200', destination: '' })),
  ];
});
const rows = [...(movedArg ? [] : readCsv('docs/migration/redirect-map.csv')), ...movedRows].filter((r) => !onlyHost || r.host === onlyHost);
const results: Result[] = [];
let i = 0;
async function worker() {
  while (i < rows.length) {
    const r = rows[i++]!;
    const url = `https://${r.host}${r.old_path}`;
    const want = r.status === '200' ? '200' : r.status === '410' ? '410' : `301/308 → ${r.destination}`;
    const { hops, final, error } = await follow(url, r.status === '301' ? HOP_LIMIT : 0);
    let ok = false;
    let got: string;
    if (error) got = error;
    else if (r.status === '200') {
      ok = final!.status === 200;
      got = String(final!.status);
    } else if (r.status === '410') {
      ok = final!.status === 410 && hops.length === 0;
      got = hops.length ? `${hops.map((h) => h.status).join(' → ')} → ${final!.status}` : String(final!.status);
    } else {
      const wanted = new URL(r.destination!, 'https://insidethetowns.com');
      const landed = hops.at(-1)?.location ? new URL(hops.at(-1)!.location!) : undefined;
      const redirected = hops.length >= 1 && hops.length <= HOP_LIMIT && hops.every((h) => h.status === 301 || h.status === 308);
      const same = !!landed && landed.origin === wanted.origin && landed.pathname === wanted.pathname && landed.search === wanted.search;
      ok = redirected && same && final!.status === 200;
      got = `${hops.map((h) => `${h.status} → ${h.location}`).join(', ')}${final ? ` (${final.status})` : ''}`;
    }
    results.push({ host: r.host!, path: r.old_path!, expected: want, got, ok });
  }
}
await Promise.all(Array.from({ length: concurrency }, worker));

// The variants: no trailing slash, a query string, and an address the map does not know.
const variantCount = Number(option('variants') ?? 150);
const pages301 = rows.filter((r) => r.status === '301' && r.old_path!.endsWith('/') && r.old_path !== '/');
const step = Math.max(1, Math.floor(pages301.length / Math.max(1, variantCount)));
const sample = pages301.filter((_, n) => n % step === 0).slice(0, variantCount);
const variantJobs: Array<{ host: string; path: string; label: string; want: string; limit: number }> = [];
for (const r of sample) {
  const want = new URL(r.destination!, 'https://insidethetowns.com').toString();
  variantJobs.push({ host: r.host!, path: r.old_path!.slice(0, -1), label: 'no slash', want, limit: HOP_LIMIT + 1 });
  variantJobs.push({ host: r.host!, path: `${r.old_path}?utm_source=redirect-check&utm_medium=test`, label: 'query', want, limit: HOP_LIMIT });
}
for (const host of [...new Set(rows.map((r) => r.host!))]) {
  const page = rows.find((r) => r.host === host && r.old_path === '/')?.destination;
  if (page) variantJobs.push({ host, path: '/no-such-address-redirect-check/', label: 'unknown path', want: new URL(page, 'https://insidethetowns.com').toString(), limit: HOP_LIMIT });
}
let v = 0;
async function variantWorker() {
  while (v < variantJobs.length) {
    const j = variantJobs[v++]!;
    const { hops, final, error } = await follow(`https://${j.host}${j.path}`, j.limit);
    const landed = hops.at(-1)?.location ? new URL(hops.at(-1)!.location!) : undefined;
    const want = new URL(j.want);
    // A query string is carried onto the page, as Vercel's own redirect rules carry it.
    const carried = j.label !== 'query' || landed?.searchParams.get('utm_source') === 'redirect-check';
    const ok = !error && !!landed && carried && landed.origin === want.origin && landed.pathname === want.pathname && final?.status === 200 && hops.every((h) => h.status === 301 || h.status === 308);
    results.push({ host: j.host, path: `${j.path} (${j.label})`, expected: `→ ${j.want}`, got: error ?? `${hops.map((h) => `${h.status} → ${h.location}`).join(', ')} (${final?.status})`, ok });
  }
}
await Promise.all(Array.from({ length: concurrency }, variantWorker));

// The CDN: a 301 and a 410 on a few hosts, each asked for twice.
const cacheLines: string[] = [];
for (const host of [...new Set(rows.map((r) => r.host!))].slice(0, 6)) {
  for (const status of ['301', '410']) {
    const r = rows.find((x) => x.host === host && x.status === status && x.old_path !== '/');
    if (!r) continue;
    const url = `https://${host}${r.old_path}`;
    const read = async () => fetch(url, { redirect: 'manual', headers: { 'User-Agent': UA } });
    const first = await read();
    const second = await read();
    const h = (res: Response, k: string) => res.headers.get(k) ?? '–';
    cacheLines.push(`| ${url} | ${second.status} | ${h(second, 'cache-control')} | ${h(second, 'cdn-cache-control')} | ${h(first, 'x-vercel-cache')} → ${h(second, 'x-vercel-cache')} |`);
  }
}

const failed = results.filter((r) => !r.ok);
const byHost = new Map<string, { ok: number; failed: number }>();
for (const r of results) {
  const h = byHost.get(r.host) ?? { ok: 0, failed: 0 };
  if (r.ok) h.ok++;
  else h.failed++;
  byHost.set(r.host, h);
}
const lines = [
  `## Redirect check, ${new Date().toISOString().slice(0, 16).replace('T', ' ')} UTC`,
  '',
  `${rows.length} addresses from docs/migration/redirect-map.csv and ${variantJobs.length} variants of them (no trailing slash, a query string, an unknown path): ${results.length - failed.length} as mapped, ${failed.length} not.`,
  '',
  '| Host | As mapped | Not |',
  '|---|---|---|',
  ...[...byHost.entries()].sort().map(([h, c]) => `| ${h} | ${c.ok} | ${c.failed} |`),
];
lines.push('', '### The CDN', '', 'Each address asked for twice; the last column is `x-vercel-cache` on the first answer, then the second.', '', '| Address | Status | Cache-Control | CDN-Cache-Control | x-vercel-cache |', '|---|---|---|---|---|', ...cacheLines);
if (failed.length) {
  lines.push('', '### Not as mapped', '', '| Address | Expected | Got |', '|---|---|---|');
  for (const f of failed.slice(0, 400)) lines.push(`| https://${f.host}${f.path} | ${f.expected} | ${f.got.replace(/\|/g, '\\|')} |`);
  if (failed.length > 400) lines.push('', `… and ${failed.length - 400} more.`);
}
const text = lines.join('\n') + '\n';
if (report) writeFileSync(report, text);
console.log(text);
process.exit(failed.length ? 1 : 0);
