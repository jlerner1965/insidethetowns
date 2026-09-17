/**
 * Config-referenced images (the hero) live in content/<slug>/images/ and are
 * looked up here so `TownConfig` stays plain data.
 */
import type { ImageMetadata } from 'astro';

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
