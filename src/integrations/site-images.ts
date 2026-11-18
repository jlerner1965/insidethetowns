/**
 * Which photographs a build may see, and a last look that none left as it came.
 *
 * `virtual:site-images` (read by src/lib/images.ts) is the image folders of
 * the site being built and nothing else. It was one glob over every town's
 * folder, so each site's /_astro/ carried about 260 MB of the other towns'
 * originals, ten paid stock files among them, at full size and public (the
 * search audit of 17 November 2026). Vite wants a glob's pattern written
 * out, so the patterns are written here, per build:
 *
 * - a guide: its own folder, and the About page's portraits in the hub's;
 * - the hub: its own folder, and the one file of each town page or article
 *   whose photograph is kept in another folder (HubTown.hero.folder, an
 *   article's imageFolder).
 *
 * And the last look, when the build is done: a file in /_astro/ that is
 * byte for byte a file in content/ or src/ is an original (Astro keeps one
 * whenever a page reads a photograph's `src` or never draws it). Pages get
 * resized renditions only, so it is removed; if a built page names it, the
 * build fails and says which, rather than publish it or break the page.
 */
import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync, rmSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { AstroIntegration } from 'astro';
import type { SiteConfig } from '../config/towns/types';
import { HUB_TOWNS, heroOf } from '../config/hub-towns.ts';
import { getNetworkHub } from '../config/index.ts';

const EXTENSIONS = 'jpg,jpeg,png,webp,avif,gif';
const IMAGE = /\.(jpe?g|png|webp|avif|gif|svg)$/i;
const MODULE = 'virtual:site-images';

const folder = (slug: string) => `/content/${slug}/images/*.{${EXTENSIONS}}`;
const file = (slug: string, name: string) => `/content/${slug}/images/${name}`;

/** An article's photograph kept outside the hub's folder: `image` and `imageFolder` in content/hub/curiosity/. */
function articlePhotos(root: string): string[] {
  const dir = join(root, 'content/hub/curiosity');
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((name) => name.endsWith('.md'))
    .flatMap((name) => {
      const text = readFileSync(join(dir, name), 'utf8');
      const image = /^image:\s*"?([^"\n]+?)"?\s*$/m.exec(text)?.[1];
      const from = /^imageFolder:\s*"?([^"\n]+?)"?\s*$/m.exec(text)?.[1];
      return image && from && from !== 'hub' ? [file(from, image)] : [];
    });
}

/** The glob patterns of the photographs the site being built can show. */
export function siteImagePatterns(site: SiteConfig, root: string = process.cwd()): string[] {
  if (site.kind === 'hub') {
    const elsewhere = HUB_TOWNS.flatMap((town) => {
      const hero = heroOf(town);
      return hero?.folder && hero.folder !== 'hub' ? [file(hero.folder, hero.image)] : [];
    });
    return [...new Set([folder('hub'), ...elsewhere, ...articlePhotos(root)])];
  }
  const portraits = [getNetworkHub().editor?.photo, site.about?.photo].filter((name): name is string => !!name);
  return [...new Set([folder(site.slug), ...portraits.map((name) => file('hub', name))])];
}

const sha = (path: string) => createHash('sha256').update(readFileSync(path)).digest('hex');

function imagesUnder(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true, recursive: true })
    .filter((entry) => entry.isFile() && IMAGE.test(entry.name))
    .map((entry) => join(entry.parentPath, entry.name));
}

/** The files in `assets` that are byte for byte a source image under `root`'s content/ or src/. */
export function originalsIn(assets: string, root: string): string[] {
  const sources = [...imagesUnder(join(root, 'content')), ...imagesUnder(join(root, 'src'))];
  const sizes = new Set(sources.map((path) => statSync(path).size));
  const built = existsSync(assets) ? readdirSync(assets).filter((name) => IMAGE.test(name) && sizes.has(statSync(join(assets, name)).size)) : [];
  if (built.length === 0) return [];
  const hashes = new Set(sources.map(sha));
  return built.filter((name) => hashes.has(sha(join(assets, name))));
}

export function siteImages(site: SiteConfig): AstroIntegration {
  return {
    name: 'inside-the-towns:site-images',
    hooks: {
      'astro:config:setup': ({ updateConfig }) => {
        updateConfig({
          vite: {
            plugins: [
              {
                name: 'inside-the-towns:site-images',
                resolveId: (id: string) => (id === MODULE ? `\0${MODULE}` : undefined),
                load: (id: string) =>
                  id === `\0${MODULE}` ? `export default import.meta.glob(${JSON.stringify(siteImagePatterns(site))}, { eager: true, import: 'default' });` : undefined,
              },
            ],
          },
        });
      },
      'astro:build:done': ({ dir, logger }) => {
        const out = fileURLToPath(dir);
        const assets = join(out, '_astro');
        const originals = originalsIn(assets, process.cwd());
        if (originals.length === 0) return;
        const named = new Set<string>();
        for (const entry of readdirSync(out, { withFileTypes: true, recursive: true })) {
          if (!entry.isFile() || !/\.(html|css|js|json|xml|txt)$/.test(entry.name)) continue;
          const text = readFileSync(join(entry.parentPath, entry.name), 'utf8');
          for (const name of originals) if (text.includes(name)) named.add(`${name} (${join(entry.parentPath, entry.name).slice(out.length)})`);
        }
        if (named.size > 0) throw new Error(`A built page names an image original; give it a resized rendition instead:\n${[...named].slice(0, 20).join('\n')}`);
        for (const name of originals) rmSync(join(assets, name));
        logger.info(`${originals.length} image originals removed from /_astro/: pages use resized renditions only`);
      },
    },
  };
}
