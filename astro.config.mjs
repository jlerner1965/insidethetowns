// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { satteri } from '@astrojs/markdown-satteri';
import { getSite } from './src/config/index.ts';
import { townRoutes } from './src/integrations/town-routes.ts';
import { hostFiles } from './src/integrations/host-files.ts';
import { tableLabels } from './src/integrations/table-labels.ts';
import { pastEventSlugs, repeatOccurrenceSlugs } from './src/lib/series.ts';
import { closedPlaceSlugs } from './src/lib/raw-places.ts';
import { contentDates, lastmodFor } from './src/lib/lastmod.ts';
import { formerSlugRedirects } from './src/lib/former-slugs.ts';
import { draftPaths } from './src/lib/curiosity-files.ts';
import { HUB_MOVED } from './src/lib/hub-moved.ts';
import vercelConfig from './vercel.json' with { type: 'json' };

// Which site to build is decided by the TOWN env var (see src/config/index.ts).
// getSite() throws with a helpful message if TOWN is unset or unknown.
const site = getSite();

// Two kinds of event page carry noindex, so neither belongs in the sitemap:
// repeat occurrences of a series, and events that are simply over. The page
// decides the same two things from src/lib/series.ts and src/lib/events.ts.
const repeats = site.kind === 'town' ? repeatOccurrenceSlugs(site.slug) : new Set();
const expired = site.kind === 'town' ? pastEventSlugs(site.slug) : new Set();
// A permanently closed place keeps its page, noindex, out of the sitemap.
const closed = site.kind === 'town' ? closedPlaceSlugs(site.slug) : new Set();
// A town that has not launched is a holding page: nothing of it is indexable.
const live = site.kind === 'hub' || site.status === 'live';
// Every sitemap entry carries lastmod: the listing's check date, an article's
// check or publish date, else the build date (src/lib/lastmod.ts).
const buildDate = new Date();
const dates = contentDates(site);
/** Pages that carry noindex must not be listed in the sitemap either. */
// A draft article drawn by the local preview switch is noindex too (src/lib/curiosity.ts).
const NOINDEX = new Set(['/thanks/', '/message-sent/', '/correct/', '/newsletter/sample/', '/search/', ...(site.kind === 'hub' ? draftPaths() : [])]);

const indexable = (/** @type {string} */ url) => {
  if (!live) return false;
  const { pathname } = new URL(url);
  if (NOINDEX.has(pathname)) return false;
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
const redirects = site.kind === 'town' ? { ...formerRedirects, '/places': '/directory/' } : { ...HUB_MOVED };

export default defineConfig({
  site: `https://${site.domain}`,
  output: 'static',
  trailingSlash: 'always',
  redirects,
  // Keep HTML-aware whitespace handling (Astro 7 defaults to JSX-style, which
  // drops the space between adjacent inline elements in prose).
  compressHTML: true,
  image: {
    layout: 'constrained',
    responsiveStyles: true,
  },
  // Column names on table cells, for the stacked phone layout (table-labels.ts).
  // Sätteri is Astro's default processor; this only adds a plugin to it.
  markdown: {
    processor: satteri({ hastPlugins: [tableLabels] }),
  },
  integrations: [townRoutes(site), sitemap({ filter: indexable, serialize: (item) => ({ ...item, lastmod: lastmodFor(item.url, dates, buildDate) }) }), hostFiles(vercelConfig, site.domain)],
  vite: {
    plugins: [tailwindcss()],
    build: {
      // Never inline scripts: the CSP in vercel.json allows script-src 'self' only,
      // so the filter script must ship as a file, however small it is.
      assetsInlineLimit: 0,
    },
  },
});
