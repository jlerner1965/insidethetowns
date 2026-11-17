/**
 * The build's image service: Astro's sharp service, with four rules on what
 * a photograph is asked for (the search audit of 17 November 2026).
 *
 * 1. The box fits the file. A 1200×800 slot over a 1200×771 or a 588×445
 *    source was written with width="1200" height="800" while sharp, which
 *    never enlarges, wrote the smaller file: the page reserved one shape and
 *    drew another. The box is scaled down to the source, shape kept.
 * 2. `src` is one of the srcset's files. With `widths` and no `width`, Astro
 *    points `src` at a rendition the size of the original (5460 px of a
 *    stock photograph, 1.5 MB), read by crawlers and by anything without
 *    srcset. It is now the widest candidate, and on a full-width band the
 *    widest up to FALLBACK_MAX.
 * 3. WebP at quality 72 unless the call says otherwise, the figure the
 *    heroes already used (Astro's default is sharp's 80).
 * 4. The share image (JPEG) at 74, with mozjpeg (astro.config.mjs).
 *
 * The rules change the options, so they are in the file's hash: a cached
 * rendition made under an older rule is never served for a newer one.
 */
import type { ImageMetadata, ImageTransform, LocalImageService } from 'astro';
import sharpService from 'astro/assets/services/sharp';

const FALLBACK_MAX = 1280;
const WEBP_QUALITY = 72;
const JPEG_QUALITY = 74;

const local = (src: ImageTransform['src']): ImageMetadata | undefined =>
  typeof src === 'object' && src !== null && 'width' in src && src.format !== 'svg' ? (src as ImageMetadata) : undefined;

/** `width`×`height` scaled down, shape kept, to fit inside the source. */
export function fitBox(width: number, height: number, source: { width: number; height: number }): { width: number; height: number } {
  // A pixel over in one direction is the rounding of the other, not a different shape.
  if (width <= source.width && height <= source.height + 1) return { width, height: Math.min(height, source.height) };
  if (height <= source.height && width <= source.width + 1) return { width: Math.min(width, source.width), height };
  const scale = Math.min(source.width / width, source.height / height);
  return { width: Math.round(width * scale), height: Math.round(height * scale) };
}

/** The width `src` should have: the widest srcset candidate, and on a full-width band the widest up to FALLBACK_MAX. */
export function fallbackWidth(width: number, widths: readonly number[], sourceWidth: number, fullWidth: boolean): number {
  const candidates = widths.map((w) => Math.min(w, sourceWidth));
  if (candidates.length === 0) return width;
  const widest = Math.min(width, Math.max(...candidates));
  if (!fullWidth || widest <= FALLBACK_MAX) return widest;
  const capped = candidates.filter((w) => w <= FALLBACK_MAX);
  return capped.length > 0 ? Math.max(...capped) : widest;
}

const service: LocalImageService = {
  ...sharpService,
  validateOptions(options, config, logger) {
    const source = local(options.src);
    if (source && options.width && options.height) {
      const box = fitBox(options.width, options.height, source);
      // Rule 2 is for a call that named no size: one that did keeps the width it asked for (or the file's, if smaller).
      const unsized = options.width === source.width && options.height === source.height;
      const width = unsized ? fallbackWidth(box.width, options.widths ?? [], source.width, options.layout === 'full-width') : box.width;
      options.height = Math.round((box.height * width) / box.width);
      options.width = width;
      if (options.format === 'jpg' || options.format === 'jpeg') options.quality ??= JPEG_QUALITY;
      else if (!options.format || options.format === 'webp') options.quality ??= WEBP_QUALITY;
    }
    return sharpService.validateOptions!(options, config, logger);
  },
  // Each candidate's box fits the file too, so no candidate is a different shape from the rest.
  async getSrcSet(options, config, logger) {
    const set = await sharpService.getSrcSet!(options, config, logger);
    const source = local(options.src);
    if (!source) return set;
    const seen = new Set<number>();
    return set.flatMap((entry) => {
      const { width, height } = entry.transform;
      if (!width || !height || !entry.descriptor?.endsWith('w')) return [entry];
      const box = fitBox(width, height, source);
      if (seen.has(box.width)) return [];
      seen.add(box.width);
      return [{ ...entry, transform: { ...entry.transform, ...box }, descriptor: `${box.width}w` }];
    });
  },
};

export default service;
