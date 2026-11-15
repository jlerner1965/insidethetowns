/**
 * A photograph's stand-in while it loads: the picture itself at 32px wide,
 * as a WebP of a few hundred bytes written into the page, drawn as the
 * <img>'s own background and stretched to fill the frame. The browser
 * smooths it into a soft blur of the picture's colours and shapes, and
 * the photograph paints over it when it arrives.
 *
 * Why (the owner, 15 November 2026: on the hub's pages the picture
 * sometimes came a beat after the page): the hero was already eager and
 * first in line, but the photograph is about 160 KB on a phone and up to
 * 500 KB on a retina laptop, and the first visitor after a deploy fetches
 * it past Vercel's edge cache. Until then the band was the flat primary colour with
 * the words on it, and the picture popped in a beat later. Now the band is
 * the picture, blurred, from the first paint.
 *
 * The hub's home only, since the same day: the owner did not want the blur
 * on the town pages ("like Inside Berthoud"), which start their photograph
 * from the link instead (src/components/HeroWarm.astro).
 *
 * Read from the original in content/<folder>/images/ at build, oriented as
 * Astro's image service orients it (sharp's rotate), so the stand-in and
 * the photograph line up under the same object-position.
 */
import { join } from 'node:path';
import sharp from 'sharp';

/** The stand-in's width in pixels: wide enough to keep the shapes, small enough to be a few hundred bytes. */
const WIDTH = 32;

const made = new Map<string, Promise<string>>();

/** The photograph content/<folder>/images/<file> at 32px, as a data: URL (allowed by img-src in vercel.json's CSP). */
export function photoPlaceholder(folder: string, file: string): Promise<string> {
  const path = join(process.cwd(), 'content', folder, 'images', file);
  let url = made.get(path);
  if (!url) {
    url = sharp(path)
      .rotate()
      .resize(WIDTH)
      .webp({ quality: 60, smartSubsample: true })
      .toBuffer()
      .then((data) => `data:image/webp;base64,${data.toString('base64')}`);
    made.set(path, url);
  }
  return url;
}

/**
 * The style for an object-cover <img> that shows the stand-in until the
 * photograph paints over it: the same cover and the same position, so
 * nothing shifts when it does.
 */
export function placeholderStyle(dataUrl: string, position?: string): string {
  const at = position ?? '50% 50%';
  return [`background-image:url(${dataUrl})`, 'background-size:cover', 'background-repeat:no-repeat', `background-position:${at}`, position && `object-position:${position}`].filter(Boolean).join(';');
}
