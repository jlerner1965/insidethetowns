/**
 * Slugs of a town's permanently closed places, read straight from the
 * markdown, for the sitemap filter in astro.config.mjs, which runs before the
 * collections exist. The page itself decides the same thing from the parsed
 * entry (`delisted`, src/lib/content.ts); a test keeps the two in step.
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { dayKey } from './dates.ts';

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
 * A town's open places past their listing window on the day of the build:
 * what placeExclusion (src/lib/freshness.ts) cuts for age, read from the
 * markdown with the same rule (Denver days since `verified`, more than
 * `listingDays`; not a closed or temporarily closed place, nor one the
 * owner marked `alwaysListed`, nor one already waiting for a re-check). A
 * section of the hub keeps these as re-check pending, noindex
 * (src/lib/content.ts, keepAsRecheck), so the sitemap leaves them out.
 */
export function stalePlaceSlugs(town: string, listingDays: number, contentRoot = 'content', now = new Date()): Set<string> {
  const dir = join(contentRoot, town, 'places');
  const out = new Set<string>();
  if (!existsSync(dir)) return out;
  const today = Date.parse(`${dayKey(now)}T12:00:00Z`);
  for (const file of readdirSync(dir)) {
    if (!file.endsWith('.md') || file.startsWith('_')) continue;
    const fm = readFileSync(join(dir, file), 'utf8').match(/^---\n([\s\S]*?)\n---/)?.[1];
    if (!fm) continue;
    const status = fm.match(/^status:\s*"?([a-z-]+)"?\s*$/m)?.[1];
    if ((status && status !== 'open') || /^alwaysListed:\s*true/m.test(fm) || /^recheckPending:\s*\S/m.test(fm)) continue;
    const verified = fm.match(/^verified:\s*"?(\d{4}-\d{2}-\d{2})/m)?.[1];
    if (!verified) continue;
    const age = Math.round((today - Date.parse(`${verified}T12:00:00Z`)) / 86_400_000);
    if (age > listingDays) out.add(fm.match(/^slug:\s*"?([a-z0-9-]+)"?\s*$/m)?.[1] ?? file.slice(0, -3));
  }
  return out;
}

/** A town's places waiting for a re-check (`recheckPending`): noindex, so out of the sitemap. Read from the markdown, as closedPlaceSlugs is. */
export function recheckPendingSlugs(town: string, contentRoot = 'content'): Set<string> {
  const dir = join(contentRoot, town, 'places');
  const out = new Set<string>();
  if (!existsSync(dir)) return out;
  for (const file of readdirSync(dir)) {
    if (!file.endsWith('.md') || file.startsWith('_')) continue;
    const fm = readFileSync(join(dir, file), 'utf8').match(/^---\n([\s\S]*?)\n---/);
    if (fm && /^recheckPending:\s*\S/m.test(fm[1]!)) out.add(fm[1]!.match(/^slug:\s*"?([a-z0-9-]+)"?\s*$/m)?.[1] ?? file.slice(0, -3));
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
