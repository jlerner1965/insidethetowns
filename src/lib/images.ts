/**
 * Config-referenced images (the hero) live in content/<slug>/images/ and are
 * looked up here so `TownConfig` stays plain data.
 */
import type { ImageMetadata } from 'astro';
import { heroOf, type HubTown } from '../config/hub-towns.ts';

const images = import.meta.glob<ImageMetadata>('/content/*/images/*.{jpg,jpeg,png,webp,avif,gif}', {
  eager: true,
  import: 'default',
});

export function resolveSiteImage(siteSlug: string, fileName: string): ImageMetadata {
  const key = `/content/${siteSlug}/images/${fileName}`;
  const image = images[key];
  if (!image) {
    const known = Object.keys(images)
      .filter((k) => k.startsWith(`/content/${siteSlug}/`))
      .join(', ');
    throw new Error(`Image not found: ${key}. Files available for "${siteSlug}": ${known || '(none)'}`);
  }
  return image;
}

/** The same lookup for a picture that may not be there yet (a town page's photograph, awaited): undefined, not an error. */
export function findSiteImage(siteSlug: string, fileName: string): ImageMetadata | undefined {
  return images[`/content/${siteSlug}/images/${fileName}`];
}

/**
 * A hub town page's photograph, ready to draw: its entry (HubTown.hero, or a
 * showpiece's), once the file is on disk and its alt is written. Undefined
 * until then, and the page draws the town's horizon.
 */
export function hubTownPhoto(town: HubTown): { src: ImageMetadata; image: string; folder: string; alt: string; position?: string } | undefined {
  const hero = heroOf(town);
  if (!hero || !hero.alt.trim()) return undefined;
  const folder = hero.folder ?? 'hub';
  const src = findSiteImage(folder, hero.image);
  return src ? { src, image: hero.image, folder, alt: hero.alt, position: hero.position } : undefined;
}
