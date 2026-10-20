/**
 * Slugs of a town's permanently closed places, read straight from the
 * markdown, for the sitemap filter in astro.config.mjs, which runs before the
 * collections exist. The page itself decides the same thing from the parsed
 * entry (`delisted`, src/lib/content.ts); a test keeps the two in step.
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

export function closedPlaceSlugs(town: string, contentRoot = 'content'): Set<string> {
  const dir = join(contentRoot, town, 'places');
  const out = new Set<string>();
  if (!existsSync(dir)) return out;
  for (const file of readdirSync(dir)) {
    if (!file.endsWith('.md') || file.startsWith('_')) continue;
    const fm = readFileSync(join(dir, file), 'utf8').match(/^---\n([\s\S]*?)\n---/);
    if (!fm) continue;
    if (/^status:\s*"?closed"?\s*$/m.test(fm[1]!)) {
      const slug = fm[1]!.match(/^slug:\s*"?([a-z0-9-]+)"?\s*$/m)?.[1] ?? file.slice(0, -3);
      out.add(slug);
    }
  }
  return out;
}

/**
 * How many places of each kind a town lists that are not closed, read the
 * same way, for the route integration (src/integrations/town-routes.ts),
 * which decides before the collections exist whether a kind gets a page of
 * its own (src/lib/place-types.ts). A listing the build later excludes for
 * other reasons (no source, past its freshness window) is counted here and
 * dropped there, so a kind's page can list fewer than this; it is never
 * built for a kind with fewer than the threshold on disk.
 */
export function openPlaceTypeCounts(town: string, contentRoot = 'content'): Partial<Record<string, number>> {
  const dir = join(contentRoot, town, 'places');
  const counts: Partial<Record<string, number>> = {};
  if (!existsSync(dir)) return counts;
  for (const file of readdirSync(dir)) {
    if (!file.endsWith('.md') || file.startsWith('_')) continue;
    const fm = readFileSync(join(dir, file), 'utf8').match(/^---\n([\s\S]*?)\n---/);
    if (!fm) continue;
    if (/^status:\s*"?closed"?\s*$/m.test(fm[1]!)) continue;
    const type = fm[1]!.match(/^type:\s*"?([a-z]+)"?\s*$/m)?.[1];
    if (!type) continue;
    counts[type] = (counts[type] ?? 0) + 1;
  }
  return counts;
}
