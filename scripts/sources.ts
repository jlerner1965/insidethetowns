#!/usr/bin/env node
/**
 * The source registry: the places the editor checks each week, one JSON file
 * per town (content/<town>/sources.json; the schema is in
 * src/content/schemas.ts).
 *
 *   npm run sources                          # what waits to be confirmed, core first, every town
 *   npm run sources -- --town=lyons          # one town
 *   npm run sources -- --all                 # every source, whatever its status
 *   npm run sources -- confirm lyons <id>…   # mark sources confirmed (ingest may use them)
 *   npm run sources -- retire lyons <id>…    # mark sources retired (never fetched again)
 *   npm run sources -- seed [--town=lyons]   # propose registry entries from what the content cites
 *   npm run sources -- check [--town=lyons]  # ask the live web whether each confirmed source still answers
 *
 * Status governs ingestion only. A `proposed` source is never fetched by
 * ingest until it is confirmed; the published content that already cites it
 * by URL stays up regardless, because what publishes is decided by the item's
 * own `source` and `verified` (src/lib/freshness.ts), never by this file.
 *
 * Seeding proposes, it does not decide: an entry per host the content cites
 * for an event, or for two or more places, named by its host, with the
 * category guessed from the host name and the guess written down. Existing
 * entries are never overwritten. The editor confirms the core ones (the town
 * calendar, the chamber, the library, the parks department, the venues the
 * calendar leans on); the rest stay proposed until they are needed.
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { allTowns, findTown } from '../src/config/index.ts';
import { CORE_CATEGORIES, type Source } from '../src/content/schemas.ts';
import { dayKey } from '../src/lib/dates.ts';
import { guessCategory, idFromHost, isCore, readRegistry, writeRegistry } from '../src/lib/sources.ts';
import { probe, type Verdict } from './lib/probe.ts';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const contentDir = join(root, 'content');
const args = process.argv.slice(2);
const opt = (name: string) => args.find((a) => a.startsWith(`--${name}=`))?.split('=')[1];
const flag = (name: string) => args.includes(`--${name}`);
const positional = args.filter((a) => !a.startsWith('--'));
const command = positional[0] ?? 'list';
const onlyTown = opt('town');
const today = dayKey(new Date());

const towns = allTowns.filter((t) => !onlyTown || t.slug === onlyTown);
if (onlyTown && towns.length === 0) {
  console.error(`sources: no town "${onlyTown}". Towns: ${allTowns.map((t) => t.slug).join(', ')}`);
  process.exit(2);
}

/** Every `source:` URL in a town's published events and places, by host. */
function citedHosts(town: string): Map<string, { events: number; places: number; sample: string }> {
  const hosts = new Map<string, { events: number; places: number; sample: string }>();
  for (const collection of ['events', 'places'] as const) {
    const dir = join(contentDir, town, collection);
    if (!existsSync(dir)) continue;
    for (const file of readdirSync(dir)) {
      if (!file.endsWith('.md') || file.startsWith('_')) continue;
      const m = readFileSync(join(dir, file), 'utf8').match(/^source:\s*"?(https?:\/\/[^"\s]+)/m);
      if (!m) continue;
      let host: string;
      try {
        host = new URL(m[1]!).hostname.replace(/^www\./, '');
      } catch {
        continue;
      }
      const entry = hosts.get(host) ?? { events: 0, places: 0, sample: m[1]! };
      entry[collection]++;
      hosts.set(host, entry);
    }
  }
  return hosts;
}

function seed() {
  for (const town of towns) {
    const registry = readRegistry(town.slug, contentDir);
    const known = new Set(registry.sources.map((s) => s.id));
    const knownHosts = new Set(registry.sources.map((s) => new URL(s.url).hostname.replace(/^www\./, '')));
    let added = 0;
    for (const [host, cites] of citedHosts(town.slug)) {
      // A business cited once, by its own listing, is that listing's source,
      // not a place the editor checks weekly. Institutions and calendars are.
      if (cites.events === 0 && cites.places < 2) continue;
      const id = idFromHost(host);
      if (known.has(id) || knownHosts.has(host)) continue;
      const category = guessCategory(host, new URL(town.officialLinks.townSite).hostname);
      const source: Source = {
        id,
        name: host,
        url: `https://${host}/`,
        sampleUrl: cites.sample,
        type: 'html',
        category,
        priority: isCore(category, cites) ? 'core' : 'other',
        status: 'proposed',
        checkFrequency: 'weekly',
        robots: 'honor',
        cites: { events: cites.events, places: cites.places },
        notes: `Seeded ${today} from the sources the content cites. Category guessed from the host name; type html until a feed is found.`,
      };
      registry.sources.push(source);
      known.add(id);
      added++;
    }
    if (added > 0 || existsSync(join(contentDir, town.slug, 'sources.json'))) writeRegistry(registry, contentDir);
    console.log(`${town.slug}: ${added} proposed, ${registry.sources.length} in the registry`);
  }
}

function list(all: boolean) {
  let waiting = 0;
  for (const town of towns) {
    const registry = readRegistry(town.slug, contentDir);
    const shown = all ? registry.sources : registry.sources.filter((s) => s.status === 'proposed');
    if (shown.length === 0 && !all) continue;
    const core = shown.filter((s) => s.priority === 'core');
    const rest = shown.filter((s) => s.priority !== 'core');
    console.log(`\n${town.name.toUpperCase()} — ${all ? `${shown.length} sources` : `${shown.length} proposed, ${core.length} core`}`);
    console.log('-'.repeat(72));
    const row = (s: Source) => {
      const cites = s.cites ? `  cited by ${s.cites.events} events, ${s.cites.places} places` : '';
      const checked = s.lastChecked ? `  last check ${dayKey(s.lastChecked)}: ${s.lastStatus}${s.lastNote ? ` (${s.lastNote})` : ''}` : '';
      console.log(`  ${s.status.padEnd(9)} ${s.id.padEnd(34)} ${s.category.padEnd(13)} ${s.type.padEnd(6)}${cites}${checked}`);
      if (s.sampleUrl && s.status === 'proposed') console.log(`            ${s.sampleUrl}`);
    };
    if (core.length) {
      console.log(`  Core (${CORE_CATEGORIES.join(', ')}, and the venues the calendar leans on) — confirm these:`);
      core.forEach(row);
    }
    if (rest.length) {
      if (core.length) console.log(all ? '  Other:' : '  Other — these can wait until they are needed:');
      rest.forEach(row);
    }
    waiting += core.filter((s) => s.status === 'proposed').length;
  }
  if (!all) {
    console.log(
      waiting
        ? `\n${waiting} core source${waiting === 1 ? '' : 's'} waiting. Confirm with: npm run sources -- confirm <town> <id> [<id>…]`
        : '\nNo core sources waiting to be confirmed.',
    );
  }
}

function setStatus(status: 'confirmed' | 'retired') {
  const [, townSlug, ...ids] = positional;
  const town = townSlug ? findTown(townSlug) : undefined;
  if (!town || ids.length === 0) {
    console.error(`Usage: npm run sources -- ${status === 'confirmed' ? 'confirm' : 'retire'} <town> <id> [<id>…]`);
    process.exit(2);
  }
  const registry = readRegistry(town.slug, contentDir);
  for (const id of ids) {
    const source = registry.sources.find((s) => s.id === id);
    if (!source) {
      console.error(`${town.slug}: no source "${id}". Run: npm run sources -- --town=${town.slug} --all`);
      process.exit(2);
    }
    source.status = status;
    console.log(`${town.slug}: ${id} ${status}`);
  }
  writeRegistry(registry, contentDir);
}

/**
 * Ask each confirmed source's page whether it still answers, robots.txt
 * honoured, and record what it said. Proposed and retired sources are left
 * alone: nobody has agreed we should be knocking, or we have agreed to stop.
 */
async function checkAll() {
  const verdictToStatus: Record<Verdict, Source['lastStatus']> = {
    ok: 'ok',
    gone: 'broken',
    moved: 'changed',
    blocked: 'blocked',
    unreachable: 'unreachable',
    skipped: 'skipped',
  };
  for (const town of towns) {
    const registry = readRegistry(town.slug, contentDir);
    const due = registry.sources.filter((s) => s.status === 'confirmed');
    if (due.length === 0) continue;
    console.log(`${town.slug}: checking ${due.length} confirmed source${due.length === 1 ? '' : 's'}`);
    for (const source of due) {
      const result = await probe(source.feedUrl ?? source.url);
      source.lastChecked = new Date();
      source.lastStatus = verdictToStatus[result.verdict];
      source.lastNote = result.note || undefined;
      const mark = result.verdict === 'ok' ? ' ' : '!';
      console.log(`  ${mark} ${source.id.padEnd(34)} ${result.code.padEnd(4)} ${source.lastStatus}${result.note ? ` — ${result.note}` : ''}`);
    }
    writeRegistry(registry, contentDir);
  }
}

switch (command) {
  case 'list':
    list(flag('all'));
    break;
  case 'seed':
    seed();
    break;
  case 'confirm':
    setStatus('confirmed');
    break;
  case 'retire':
    setStatus('retired');
    break;
  case 'check':
    await checkAll();
    break;
  default:
    console.error(`sources: unknown command "${command}". Commands: list, seed, confirm, retire, check.`);
    process.exit(2);
}
