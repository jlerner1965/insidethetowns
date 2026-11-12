/**
 * The tradition records read straight from disk, for code that runs before
 * Astro's collections exist (the route integration) or outside Astro (the
 * validator). Kept apart from src/lib/traditions.ts so that file stays free
 * of node:fs and safe for any page or script to import.
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { CURRENT_SEASONS, FIXTURES_DIR, TRADITION_TYPES, TRADITIONS_DIR, fixturesEnabled, type TraditionRecord, type TraditionType } from './traditions.ts';
import { parseFrontmatter } from '../../scripts/lib/frontmatter.ts';
import { STANDALONE_GUIDES } from '../config/hub-towns.ts';
import { appliesTo, publishedHubTowns } from './hub-towns.ts';

/**
 * Read straight from the markdown, for the route integration, which runs
 * before the collections exist (as src/lib/raw-places.ts does for the
 * place pages): which guides have a record, and which types have one for
 * their season. A record that then fails its schema fails the build, so
 * this can only ever over-promise a page the build refuses.
 */
export function traditionFiles(root = '.', env: Record<string, string | undefined> = process.env): string[] {
  const dirs = [TRADITIONS_DIR, ...(fixturesEnabled(env) ? [FIXTURES_DIR] : [])];
  return dirs.flatMap((dir) => {
    const full = join(root, dir);
    if (!existsSync(full)) return [];
    return readdirSync(full)
      .filter((f) => f.endsWith('.md') && !f.startsWith('_'))
      .map((f) => readFileSync(join(full, f), 'utf8'));
  });
}

function frontmatter(text: string): string {
  return text.match(/^---\n([\s\S]*?)\n---/)?.[1] ?? '';
}

/**
 * The records as data, read with the scripts' small YAML reader: what the
 * route integration, the redirect tests and the scripts decide by before
 * (or outside) Astro's collections. A file the reader cannot parse is left
 * out here and fails the build at its schema.
 */
export function rawRecords(root = '.', env: Record<string, string | undefined> = process.env): TraditionRecord[] {
  const out: TraditionRecord[] = [];
  for (const text of traditionFiles(root, env)) {
    try {
      const data = parseFrontmatter(text).data as unknown as TraditionRecord;
      if (typeof data.slug === 'string' && Array.isArray(data.years) && data.years.length > 0) out.push(data);
    } catch {
      // The schema reports it.
    }
  }
  return out;
}

/**
 * The guides with at least one record, by config slug: each gets
 * /traditions/. A standalone guide counts every record that applies to it
 * (its own traditions, the shared outdoor dates that name it, the
 * statewide ones); any other guide only the records it is the home of.
 */
export function guidesWithTraditions(root = '.', env: Record<string, string | undefined> = process.env): Set<string> {
  const out = new Set<string>();
  const records = rawRecords(root, env);
  for (const r of records) if (r.town?.guide) out.add(r.town.guide);
  for (const [key, { guide }] of Object.entries(STANDALONE_GUIDES)) {
    if (records.some((r) => appliesTo(r, key))) out.add(guide);
  }
  return out;
}

/** The hub towns with a page (three verified dated items of their own), by slug. */
export function publishedHubTownSlugs(root = '.', env: Record<string, string | undefined> = process.env): string[] {
  return publishedHubTowns(rawRecords(root, env)).map((t) => t.slug);
}

/** The types with a season set and at least one record with an entry for it: each gets its hub page. */
export function seasonTypesWithRecords(root = '.', env: Record<string, string | undefined> = process.env): TraditionType[] {
  const found = new Set<TraditionType>();
  for (const text of traditionFiles(root, env)) {
    const fm = frontmatter(text);
    const type = fm.match(/^type:\s*"?([a-z-]+)"?\s*$/m)?.[1] as TraditionType | undefined;
    const season = type ? CURRENT_SEASONS[type] : undefined;
    if (!type || !season) continue;
    // A season with no year (outdoor dates) shows every record of its type.
    if (season.year === undefined || new RegExp(`^\\s*-\\s*year:\\s*${season.year}\\s*$`, 'm').test(fm)) found.add(type);
  }
  return TRADITION_TYPES.filter((t) => found.has(t));
}
