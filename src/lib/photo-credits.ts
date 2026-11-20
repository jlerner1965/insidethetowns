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
import { getCuriosity, getHubEntries, getTownEntries, getTraditions } from '@/lib/content';
import { articlePath } from '@/lib/curiosity';
import { publishedHubTowns } from '@/lib/hub-towns';
import { hubTownPhoto, resolveSiteImage } from '@/lib/images';
import { sectionContents } from '@/lib/section-index';
import { creditBeside, parseLedger, publicCredit, type LedgerRow, type PublicCredit } from '@/lib/credits';

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

  // `folder` is the content folder the file is in: this site's own, except a
  // hub town page showing its former guide's hero (HubTown.hero.folder).
  const use = (file: string, alt: string, usage: PhotoUsage, folder: string = site.slug) => {
    const path = `content/${folder}/images/${file}`;
    let photo = photos.get(path);
    if (!photo) {
      const row = ledger.get(path);
      // The validator guarantees a row for every file; this guards the build.
      if (!row) throw new Error(`${path} has no row in IMAGE_LICENSES.csv`);
      photo = { file, image: resolveSiteImage(folder, file), alt, credit: publicCredit(row), usedOn: [] };
      photos.set(path, photo);
    }
    if (!photo.usedOn.some((u) => u.href === usage.href)) photo.usedOn.push(usage);
  };

  // An entry's photograph and its inline images, as used on the page at `href`.
  const creditEntry = (entry: { slug: string; data: unknown; filePath?: string; body?: string }, href: string, folder?: string) => {
    const data = entry.data as { title?: string; imageAlt?: string };
    const usage = { title: data.title ?? entry.slug, href };
    const source = entry.filePath ? readFileSync(entry.filePath, 'utf8') : '';
    const hero = /^image:\s*"?\.\.\/images\/([^"\s]+)"?\s*$/m.exec(source)?.[1];
    if (hero) use(hero, data.imageAlt ?? '', usage, folder);
    for (const m of (entry.body ?? '').matchAll(/!\[([^\]]*)\]\(\.\.\/images\/([^)\s]+)\)/g)) {
      use(m[2]!, m[1]!, usage, folder);
    }
  };

  // The hero is on the home page (on a flagship guide, beside the guide's
  // routes, since 26 October 2026) and, as the share image every page
  // without a photograph of its own falls back to, on the link preview of
  // all of them.
  use(site.hero.image, site.hero.alt, { title: 'the home page, and the link preview of every page without its own photograph', href: '/' });

  // The hub's town pages: a photograph behind the name is also the link
  // preview of the page and of its dates' pages.
  if (site.kind === 'hub') {
    for (const town of publishedHubTowns(await getTraditions())) {
      const photo = hubTownPhoto(town);
      if (photo) use(photo.image, photo.alt, { title: `the ${town.name} page`, href: `/${town.slug}/` }, photo.folder);
    }
  }

  // The hub's articles (content/hub/curiosity/): a photograph at the head of
  // one is also its link preview, and may be kept in a town's folder.
  if (site.kind === 'hub') {
    for (const { data } of await getCuriosity()) {
      if (data.image) use(data.image, data.imageAlt ?? '', { title: data.title, href: articlePath(data) }, data.imageFolder ?? 'hub');
    }
  }

  // The folded guides kept page by page (`section.mode: 'pages'`): their
  // places, guides and events are built by the hub (src/routes/hub/section-*.astro),
  // so their photographs are credited here, under the addresses those pages
  // have, from the town's own images folder. Read from the same list the
  // routes build from, so no page is credited that the hub does not build.
  if (site.kind === 'hub') {
    for (const section of await sectionContents()) {
      const base = `/${section.hubTown}`;
      const kept = [
        ...section.placeEntries.map((e) => ({ entry: e, href: `${base}/places/${e.slug}/` })),
        ...section.guideEntries.map((e) => ({ entry: e, href: `${base}/guides/${e.slug}/` })),
        ...section.eventEntries.map((e) => ({ entry: e, href: `${base}/events/${e.slug}/` })),
      ];
      for (const { entry, href } of kept) creditEntry(entry, href, section.town.slug);
    }
  }

  const read = site.kind === 'hub' ? getHubEntries : getTownEntries;
  for (const collection of Object.keys(COLLECTION_PATHS) as Collection[]) {
    for (const entry of await read(collection)) creditEntry(entry, COLLECTION_PATHS[collection](entry.slug));
  }

  return [...photos.values()];
}

/**
 * The credit to print on the hero photograph, when its licence asks for one
 * beside the picture (an editorial stock licence; see creditBeside), and
 * otherwise nothing: every other hero is credited on /credits/ only, as the
 * owner decided on 26 October 2026.
 */
export function heroCreditOnImage(): string | undefined {
  const site = getSite();
  const row = parseLedger(readFileSync('IMAGE_LICENSES.csv', 'utf8')).find((r) => r.path === `content/${site.slug}/images/${site.hero.image}`);
  return row && creditBeside(row) ? site.hero.credit : undefined;
}
