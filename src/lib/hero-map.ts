/**
 * The hub's town photographs by page, so a link can start a town's photograph
 * before the page is asked for (src/components/HeroWarm.astro).
 *
 * Why (the owner, 15 November 2026): a guide's home, Inside Berthoud, opens
 * with its photograph already there, and a hub town page did not. The guide's
 * photograph is in the browser from the last visit; each of the hub's 89
 * towns has a photograph of its own that a reader has almost never fetched
 * before, about 160 KB on a phone and up to 500 KB on a retina laptop, and
 * the band showed it blurred until it came (src/lib/placeholder.ts). Now the
 * download starts when a finger or the pointer reaches the link, and the
 * page finds the photograph in the browser's cache, as the guide does.
 *
 * Read from the built pages themselves (src/integrations/hero-map.ts), so
 * the file a link fetches is the file the page asks for, byte for byte:
 * the same srcset and sizes, and so the same choice of width by the browser.
 */

/** The served file, at the hub's root. */
export const HERO_MAP_FILE = 'hero-map.json';

/** What a town page's hero <img> asks for. */
export interface HeroSources {
  srcset: string;
  sizes: string;
}

/** The attribute that marks a hub town page's hero photograph (src/routes/hub/town.astro). */
const HERO_TAG = /<img\b[^>]*\bdata-showpiece-hero\b[^>]*>/i;

function attribute(tag: string, name: string): string | undefined {
  const m = tag.match(new RegExp(`\\s${name}="([^"]*)"`, 'i'));
  return m ? m[1]!.replace(/&amp;/g, '&') : undefined;
}

/** The hero photograph's srcset and sizes in a built page, or undefined where it has none. */
export function heroOf(html: string): HeroSources | undefined {
  const tag = html.match(HERO_TAG)?.[0];
  if (!tag) return undefined;
  const srcset = attribute(tag, 'srcset');
  const sizes = attribute(tag, 'sizes');
  return srcset && sizes ? { srcset, sizes } : undefined;
}
