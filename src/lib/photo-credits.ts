/**
 * Which photographs the site being built actually shows, and where.
 *
 * /credits/ lists these and only these: the images folders also hold files no
 * page uses yet, and a credits page that thanks a photographer for a picture
 * nobody can find is its own small untruth. A photograph counts as shown if it
 * is the hero, an entry's image (which also appears on cards and share
 * previews) or an inline image in an entry's body.
 */
import { readFileSync } from 'node:fs';
import type { ImageMetadata } from 'astro';
import { getSite } from '@/config';
import { getHubEntries, getTownEntries } from '@/lib/content';
import { resolveSiteImage } from '@/lib/images';
import { captionFrom, parseLedger, publicCredit, type LedgerRow, type PublicCredit } from '@/lib/credits';

export interface PhotoUsage {
  title: string;
  href: string;
}

export interface CreditedPhoto {
  file: string;
  image: ImageMetadata;
  alt: string;
  credit: PublicCredit;
  usedOn: PhotoUsage[];
}

const COLLECTION_PATHS = {
  places: (slug: string) => `/places/${slug}/`,
  events: (slug: string) => `/events/${slug}/`,
  articles: (slug: string) => `/articles/${slug}/`,
  pages: (slug: string) => `/${slug}/`,
  issues: (slug: string) => `/newsletter/${slug}/`,
} as const;

type Collection = keyof typeof COLLECTION_PATHS;

export async function getCreditedPhotos(): Promise<CreditedPhoto[]> {
  const site = getSite();
  // A town that has not launched builds one holding page and nothing of the
  // guide: no listing, no article, no hero band. Its images folder holds the
  // scaffold's stand-in hero, whose ledger row says "placeholder" and which
  // publicCredit refuses by design, so there is nothing here to credit and
  // nothing to throw over. The day the town is flipped, every row counts.
  if (site.kind === 'town' && site.status !== 'live') return [];
  const ledger = new Map<string, LedgerRow>(
    parseLedger(readFileSync('IMAGE_LICENSES.csv', 'utf8')).map((row) => [row.path, row]),
  );
  const photos = new Map<string, CreditedPhoto>();

  const use = (file: string, alt: string, usage: PhotoUsage) => {
    let photo = photos.get(file);
    if (!photo) {
      const row = ledger.get(`content/${site.slug}/images/${file}`);
      // The validator guarantees a row for every file; this guards the build.
      if (!row) throw new Error(`content/${site.slug}/images/${file} has no row in IMAGE_LICENSES.csv`);
      photo = { file, image: resolveSiteImage(site.slug, file), alt, credit: publicCredit(row), usedOn: [] };
      photos.set(file, photo);
    }
    if (!photo.usedOn.some((u) => u.href === usage.href)) photo.usedOn.push(usage);
  };

  // The hero is on the home page and, as the share image every page without
  // a photograph of its own falls back to, on the link preview of all of them.
  use(site.hero.image, site.hero.alt, { title: 'the home page, and the link preview of every page without its own photograph', href: '/' });

  const read = site.kind === 'hub' ? getHubEntries : getTownEntries;
  for (const collection of Object.keys(COLLECTION_PATHS) as Collection[]) {
    for (const entry of await read(collection)) {
      const data = entry.data as { title?: string; imageAlt?: string };
      const usage = { title: data.title ?? entry.slug, href: COLLECTION_PATHS[collection](entry.slug) };
      const source = entry.filePath ? readFileSync(entry.filePath, 'utf8') : '';
      const hero = /^image:\s*\.\.\/images\/(\S+)\s*$/m.exec(source)?.[1];
      if (hero) use(hero, data.imageAlt ?? '', usage);
      for (const m of (entry.body ?? '').matchAll(/!\[([^\]]*)\]\(\.\.\/images\/([^)\s]+)\)/g)) {
        use(m[2]!, m[1]!, usage);
      }
    }
  }

  return [...photos.values()];
}

let ledgerCache: Map<string, LedgerRow> | undefined;
function ledgerRows(): Map<string, LedgerRow> {
  ledgerCache ??= new Map(parseLedger(readFileSync('IMAGE_LICENSES.csv', 'utf8')).map((row) => [row.path, row]));
  return ledgerCache;
}

/**
 * The caption for an entry's lead photograph: its own `imageCredit` when it
 * has one, otherwise the credit read from IMAGE_LICENSES.csv. Undefined when
 * the entry has no photograph or the ledger has no row for it (the validator
 * makes the second impossible on a published entry).
 */
export function imageCaption(entry: { filePath?: string; data: { imageCredit?: string } }): string | undefined {
  if (entry.data.imageCredit) return entry.data.imageCredit;
  const site = getSite();
  const source = entry.filePath ? readFileSync(entry.filePath, 'utf8') : '';
  const file = /^image:\s*\.\.\/images\/(\S+)\s*$/m.exec(source)?.[1];
  if (!file) return undefined;
  const row = ledgerRows().get(`content/${site.slug}/images/${file}`);
  return row ? captionFrom(publicCredit(row)) : undefined;
}
