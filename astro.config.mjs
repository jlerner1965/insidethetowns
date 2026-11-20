// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { satteri } from '@astrojs/markdown-satteri';
import { getNetworkHub, getSite, isSectionBuild, sectionBase, sectionTowns } from './src/config/index.ts';
import { townRoutes } from './src/integrations/town-routes.ts';
import { hostFiles } from './src/integrations/host-files.ts';
import { heroMap } from './src/integrations/hero-map.ts';
import { siteImages } from './src/integrations/site-images.ts';
import { tableLabels } from './src/integrations/table-labels.ts';
import { pastEventSlugs, repeatOccurrenceSlugs } from './src/lib/series.ts';
import { closedPlaceSlugs, recheckPendingSlugs, stalePlaceSlugs } from './src/lib/raw-places.ts';
import { windowsFor } from './src/config/freshness.ts';
import { contentDates, lastmodFor } from './src/lib/lastmod.ts';
import { formerSlugRedirects } from './src/lib/former-slugs.ts';
import { draftPaths } from './src/lib/curiosity-files.ts';
import { HUB_MOVED } from './src/lib/hub-moved.ts';
import vercelConfig from './vercel.json' with { type: 'json' };
import fixedPageDates from './data/fixed-page-dates.json' with { type: 'json' };

// Which site to build is decided by the TOWN env var (see src/config/index.ts).
// getSite() throws with a helpful message if TOWN is unset or unknown.
const site = getSite();
// A folded guide built as a section of the hub (HUB_SECTION=1, set by
// scripts/run.ts): the same routes under /<town>/ on the hub's domain. The
// build's `base` puts the prefix on every asset; the links the templates
// write by hand get it afterwards (scripts/lib/section-merge.ts).
const section = site.kind === 'town' && isSectionBuild() ? { base: sectionBase(site), origin: `https://${getNetworkHub().domain}` } : undefined;
/** A built page's path as the guide knew it, without the section's prefix. */
const guidePath = (/** @type {string} */ pathname) => (section && pathname.startsWith(`${section.base}/`) ? pathname.slice(section.base.length) : pathname);

// Two kinds of event page carry noindex, so neither belongs in the sitemap:
// repeat occurrences of a series, and events that are simply over. The page
// decides the same two things from src/lib/series.ts and src/lib/events.ts.
const repeats = site.kind === 'town' ? repeatOccurrenceSlugs(site.slug) : new Set();
const expired = site.kind === 'town' ? pastEventSlugs(site.slug) : new Set();
// A permanently closed place keeps its page, noindex, out of the sitemap, and so does one a person set aside
// (recheckPending, on a guide too; a blocked read or a possible closure hides nothing). A section of the hub also keeps a
// stale place as a noindex page (src/lib/content.ts, keepAsRecheck); a guide drops it until it moves into the hub.
const closed = site.kind === 'town' ? new Set([...closedPlaceSlugs(site.slug), ...recheckPendingSlugs(site.slug), ...(isSectionBuild() ? stalePlaceSlugs(site.slug, windowsFor(site.variant).listingDays) : [])]) : new Set();
// A town that has not launched is a holding page: nothing of it is indexable.
const live = site.kind === 'hub' || site.status === 'live';
// A sitemap entry carries lastmod: the listing's check date, an article's
// check or publish date, else the build date; a page of fixed copy the day
// its own files last changed (data/fixed-page-dates.json; src/lib/lastmod.ts).
const buildDate = new Date();
const dates = contentDates(site);
/** @type {Record<string, Record<string, string>>} */
const allFixedDates = fixedPageDates;
const fixedDates = allFixedDates[site.slug];
/** Pages that carry noindex must not be listed in the sitemap either. */
// A draft article drawn by the local preview switch is noindex too (src/lib/curiosity.ts).
const NOINDEX = new Set(['/thanks/', '/message-sent/', '/correct/', '/newsletter/sample/', '/search/', ...(site.kind === 'hub' ? draftPaths() : [])]);

// The hub's page-by-page sections (src/lib/section-index.ts): a carried
// event that has passed, a kept place that has closed and one waiting for a
// re-check are noindex, so none is listed. Keyed by the hub path, read from the markdown as above.
const sectionNoindex = new Set(
  site.kind === 'hub'
    ? sectionTowns('pages').flatMap((t) => {
        const town = t.hubPage?.town ?? t.slug;
        return [
          ...[...pastEventSlugs(t.slug)].map((s) => `/${town}/events/${s}/`),
          ...[...closedPlaceSlugs(t.slug), ...recheckPendingSlugs(t.slug), ...stalePlaceSlugs(t.slug, windowsFor(t.variant).listingDays)].map((s) => `/${town}/places/${s}/`),
        ];
      })
    : [],
);
const indexable = (/** @type {string} */ url) => {
  if (!live) return false;
  const pathname = guidePath(new URL(url).pathname);
  if (NOINDEX.has(pathname) || sectionNoindex.has(pathname)) return false;
  const place = pathname.match(/^\/places\/([^/]+)\/$/);
  if (place) return !closed.has(place[1]);
  const m = pathname.match(/^\/events\/([^/]+)\/$/);
  if (!m) return true;
  return !repeats.has(m[1]) && !expired.has(m[1]);
};

// A listing re-filed under a new slug keeps its old URL as a redirect page
// (src/lib/former-slugs.ts); a static build writes each as a meta-refresh page.
// A guide's places index is /directory/; /places/ alone, the parent of every
// listing's URL, answered 404 on every guide (the search audit of 7 November
// 2026). Sent on, as a former slug is.
// A quiet guide (`lead: 'updates'`) builds no events pages: its old event
// addresses are vercel.json's to send home, not redirect pages to /events/.
const formerRedirects = site.kind === 'town' ? Object.fromEntries(Object.entries(formerSlugRedirects(site.slug)).filter(([from]) => site.lead !== 'updates' || !from.startsWith('/events'))) : {};
// The hub's pages that moved to a guide (src/lib/hub-moved.ts): Severance's, to the Windsor guide.
// /articles/ on a guide: every article lives under it and the index is
// /guides/ (the review of 14 November 2026 found /articles/ a 404).
// A section builds no redirect page at all: a redirect page is a meta
// refresh, and every old address is answered by a 301 in vercel.json.
const redirects = section ? {} : site.kind === 'town' ? { ...formerRedirects, '/places': '/directory/', '/articles': '/guides/' } : { ...HUB_MOVED };

export default defineConfig({
  site: section ? section.origin : `https://${site.domain}`,
  ...(section ? { base: section.base, cacheDir: `./node_modules/.astro-section-${site.slug}` } : {}),
  output: 'static',
  trailingSlash: 'always',
  redirects,
  // Keep HTML-aware whitespace handling (Astro 7 defaults to JSX-style, which
  // drops the space between adjacent inline elements in prose).
  compressHTML: true,
  image: {
    layout: 'constrained',
    responsiveStyles: true,
    // Sharp, with the box, the fallback `src` and the quality set in src/lib/image-service.ts.
    service: { entrypoint: './src/lib/image-service.ts', config: { jpeg: { mozjpeg: true } } },
  },
  // Column names on table cells, for the stacked phone layout (table-labels.ts).
  // Sätteri is Astro's default processor; this only adds a plugin to it.
  markdown: {
    processor: satteri({ hastPlugins: [tableLabels] }),
  },
  // siteImages: the photographs this build may see, and no original left in /_astro/ (src/integrations/site-images.ts).
  // On the hub, /hero-map.json: each town page's photograph, for the links to start early (src/integrations/hero-map.ts).
  integrations: [townRoutes(site), siteImages(site), sitemap({ filter: indexable, serialize: (item) => {
      // A section's dates are keyed by the guide's own paths.
      const lastmod = lastmodFor(section ? `https://${site.domain}${guidePath(new URL(item.url).pathname)}` : item.url, dates, buildDate, fixedDates);
      return { ...item, lastmod };
    } }), ...(section ? [] : [hostFiles(vercelConfig, site.domain)]), ...(site.kind === 'hub' ? [heroMap()] : [])],
  vite: {
    plugins: [tailwindcss()],
    build: {
      // Never inline scripts: the CSP in vercel.json allows script-src 'self' only,
      // so the filter script must ship as a file, however small it is.
      assetsInlineLimit: 0,
    },
  },
});
