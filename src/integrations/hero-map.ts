/**
 * Writes /hero-map.json next to the built hub: each town page's path with
 * the srcset and sizes of its hero photograph, read from the page as built
 * (src/lib/hero-map.ts). The hub's pages fetch it when idle and start a
 * town's photograph when a link to the town is touched, hovered or focused
 * (src/components/HeroWarm.astro).
 */
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { AstroIntegration } from 'astro';
import { HERO_MAP_FILE, heroOf, type HeroSources } from '../lib/hero-map.ts';

export function heroMap(): AstroIntegration {
  return {
    name: 'inside-the-towns:hero-map',
    hooks: {
      'astro:build:done': ({ dir, logger }) => {
        const out = fileURLToPath(dir);
        const map: Record<string, HeroSources> = {};
        // A town page is /<slug>/; the hub's other pages have no hero photograph and are passed over.
        for (const entry of readdirSync(out, { withFileTypes: true })) {
          if (!entry.isDirectory()) continue;
          const page = join(out, entry.name, 'index.html');
          if (!existsSync(page)) continue;
          const hero = heroOf(readFileSync(page, 'utf8'));
          if (hero) map[`/${entry.name}/`] = hero;
        }
        writeFileSync(join(out, HERO_MAP_FILE), JSON.stringify(map), 'utf8');
        logger.info(`${HERO_MAP_FILE}: ${Object.keys(map).length} town photographs`);
      },
    },
  };
}
