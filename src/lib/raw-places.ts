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
