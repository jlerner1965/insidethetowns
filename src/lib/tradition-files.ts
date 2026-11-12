/**
 * The tradition records read straight from disk, for code that runs before
 * Astro's collections exist (the route integration) or outside Astro (the
 * validator). Kept apart from src/lib/traditions.ts so that file stays free
 * of node:fs and safe for any page or script to import.
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { CURRENT_SEASONS, FIXTURES_DIR, TRADITION_TYPES, TRADITIONS_DIR, fixturesEnabled, type TraditionType } from './traditions.ts';

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

/** The guides with at least one record: each gets /traditions/. */
export function guidesWithTraditions(root = '.', env: Record<string, string | undefined> = process.env): Set<string> {
  const out = new Set<string>();
  for (const text of traditionFiles(root, env)) {
    const guide = frontmatter(text).match(/^\s+guide:\s*"?([a-z0-9-]+)"?\s*$/m)?.[1];
    if (guide) out.add(guide);
  }
  return out;
}

/** The types with a season set and at least one record with an entry for it: each gets its hub page. */
export function seasonTypesWithRecords(root = '.', env: Record<string, string | undefined> = process.env): TraditionType[] {
  const found = new Set<TraditionType>();
  for (const text of traditionFiles(root, env)) {
    const fm = frontmatter(text);
    const type = fm.match(/^type:\s*"?([a-z-]+)"?\s*$/m)?.[1] as TraditionType | undefined;
    const season = type ? CURRENT_SEASONS[type] : undefined;
    if (!type || !season) continue;
    if (new RegExp(`^\\s*-\\s*year:\\s*${season.year}\\s*$`, 'm').test(fm)) found.add(type);
  }
  return TRADITION_TYPES.filter((t) => found.has(t));
}
