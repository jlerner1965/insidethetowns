#!/usr/bin/env node
/**
 * Tells IndexNow (Bing, and the engines that share with it) which pages on
 * each live site changed since the last run.
 *
 *   node scripts/indexnow.ts                    every deployed site, what changed
 *   node scripts/indexnow.ts --town=berthoud    one site
 *   node scripts/indexnow.ts --all              every URL in the sitemaps, not only what changed
 *   node scripts/indexnow.ts --dry-run          print what would be sent; send nothing, record nothing
 *   node scripts/indexnow.ts --state=<dir>      where the last run's sitemaps are kept (.cache/indexnow)
 *
 * It reads the live site, not the build: the sitemap a search engine sees
 * is the one that decides what it should come back for. "Changed" is worked
 * out against the sitemap as the last successful run read it (kept in the
 * state directory, which the workflow carries between runs in the Actions
 * cache; scripts/lib/indexnow.ts says what counts). With no record, every
 * URL goes, which is also what a first run should do.
 *
 * Before sending anything for a site it fetches that site's key file. An
 * engine that cannot read the key discards the batch without saying so, so
 * a site whose deploy does not yet carry public/<key>.txt is reported and
 * skipped, and its record is left alone for the next run. A host whose key
 * IndexNow is still verifying (a 403 that says so) is a warning, not a
 * failure, and is likewise left for the next run.
 *
 * Run by .github/workflows/indexnow.yml twice a day, after the rebuilds.
 * Exits 1 when any site could not be read or was refused.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { allSites, LIVE_TOWNS, type SiteConfig } from '../src/config/index.ts';
import { contentDates } from '../src/lib/lastmod.ts';
import {
  accepted,
  verificationPending,
  INDEXNOW_BATCH,
  INDEXNOW_ENDPOINT,
  INDEXNOW_KEY,
  sitemapEntries,
  sitemapLocs,
  submission,
  urlsToSubmit,
  type Snapshot,
} from './lib/indexnow.ts';

const UA = 'InsideTheTowns-indexnow/1.0 (+https://insidethetowns.com/editorial/)';

const args = process.argv.slice(2);
const flag = (name: string) => args.includes(`--${name}`);
const option = (name: string) => args.find((a) => a.startsWith(`--${name}=`))?.slice(name.length + 3);
const dryRun = flag('dry-run');
const everything = flag('all');
const stateDir = option('state') ?? '.cache/indexnow';
const only = option('town');

const deployed = ['hub', ...LIVE_TOWNS];
if (only && !deployed.includes(only)) {
  console.error(`${only} is not a deployed site. Deployed: ${deployed.join(', ')}.`);
  process.exit(1);
}
const sites = (only ? [only] : deployed).map((slug) => allSites.find((s) => s.slug === slug)!);

async function get(url: string): Promise<string> {
  const res = await fetch(url, { headers: { 'User-Agent': UA }, redirect: 'follow', signal: AbortSignal.timeout(30_000) });
  if (!res.ok) throw new Error(`${url}: HTTP ${res.status}`);
  return res.text();
}

async function readSitemaps(domain: string): Promise<Snapshot> {
  const index = await get(`https://${domain}/sitemap-index.xml`);
  const all: Snapshot = new Map();
  for (const loc of sitemapLocs(index)) for (const [url, lastmod] of sitemapEntries(await get(loc))) all.set(url, lastmod);
  if (all.size === 0) throw new Error(`https://${domain}/sitemap-index.xml lists no pages`);
  return all;
}

function readState(slug: string): Snapshot | undefined {
  const file = join(stateDir, `${slug}.json`);
  if (!existsSync(file)) return undefined;
  try {
    return new Map(Object.entries(JSON.parse(readFileSync(file, 'utf8')) as Record<string, string>));
  } catch {
    return undefined;
  }
}

function writeState(slug: string, snapshot: Snapshot): void {
  mkdirSync(stateDir, { recursive: true });
  writeFileSync(join(stateDir, `${slug}.json`), `${JSON.stringify(Object.fromEntries(snapshot), null, 1)}\n`);
}

async function send(site: string, host: string, urls: string[]): Promise<'sent' | 'pending'> {
  for (let i = 0; i < urls.length; i += INDEXNOW_BATCH) {
    const batch = urls.slice(i, i + INDEXNOW_BATCH);
    const res = await fetch(INDEXNOW_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8', 'User-Agent': UA },
      body: JSON.stringify(submission(host, batch)),
      signal: AbortSignal.timeout(30_000),
    });
    if (!accepted(res.status)) {
      const text = (await res.text()).slice(0, 300).replace(/\s+/g, ' ');
      if (verificationPending(res.status, text)) return 'pending';
      // Any other 403 is the engine saying it could not verify the key for this
      // host, after this script has just read the key file from the host itself
      // (four hosts of nineteen on the second run, 5 November 2026, with the
      // same file every other host passed on). The engine's view, not ours: a
      // warning naming the host, no record kept, and the next run tries again.
      if (res.status === 403) {
        console.warn(`::warning::${site}: IndexNow refused ${host} (${text}). The key file is served; check the site is verified in Bing Webmaster Tools. Tried again next run.`);
        return 'pending';
      }
      throw new Error(`IndexNow refused ${batch.length} URL(s) for ${host}: HTTP ${res.status}${text ? ` (${text})` : ''}`);
    }
    console.log(`  sent ${batch.length} URL(s): HTTP ${res.status}`);
  }
  return 'sent';
}

async function run(site: SiteConfig): Promise<boolean> {
  const host = site.domain;
  console.log(`${site.slug} (${host})`);
  try {
    const keyUrl = `https://${host}/${INDEXNOW_KEY}.txt`;
    const served = (await get(keyUrl).catch(() => '')).trim();
    if (served !== INDEXNOW_KEY) {
      console.error(`::error::${site.slug}: ${keyUrl} does not serve the key yet, so nothing was sent (an engine would discard it). Deploy the site, then run again.`);
      return false;
    }
    const current = await readSitemaps(host);
    const previous = everything ? undefined : readState(site.slug);
    const dated = contentDates(site);
    const urls = urlsToSubmit(previous, current, (path) => dated.has(path));
    console.log(`  ${current.size} page(s) in the sitemap; ${previous ? `${urls.length} changed since the last run` : `no record of a last run, so all ${urls.length}`}`);
    if (dryRun) {
      for (const url of urls) console.log(`  would send ${url}`);
      return true;
    }
    if (urls.length > 0 && (await send(site.slug, host, urls)) === 'pending') {
      // No record written: the next run sends everything for this host again.
      console.warn(`::warning::${site.slug}: IndexNow has not accepted ${host} yet; nothing recorded, so the next run sends everything for it again.`);
      return true;
    }
    writeState(site.slug, current);
    return true;
  } catch (error) {
    console.error(`::error::${site.slug}: ${error instanceof Error ? error.message : error}`);
    return false;
  }
}

let failed = 0;
for (const site of sites) if (!(await run(site))) failed++;
if (failed) console.error(`${failed} of ${sites.length} site(s) not sent; each keeps its last record and is tried again next run.`);
process.exit(failed ? 1 : 0);
