// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { getSite } from './src/config/index.ts';
import { townRoutes } from './src/integrations/town-routes.ts';
import { repeatOccurrenceSlugs } from './src/lib/series.ts';

// Which site to build is decided by the TOWN env var (see src/config/index.ts).
// getSite() throws with a helpful message if TOWN is unset or unknown.
const site = getSite();

// Repeat occurrences of a recurring event are marked noindex on the page, so
// they have no business in the sitemap either.
const repeats = site.kind === 'town' ? repeatOccurrenceSlugs(site.slug) : new Set();
const notARepeatOccurrence = (/** @type {string} */ url) => {
  const m = new URL(url).pathname.match(/^\/events\/([^/]+)\/$/);
  return !m || !repeats.has(m[1]);
};

export default defineConfig({
  site: `https://${site.domain}`,
  output: 'static',
  trailingSlash: 'always',
  // Keep HTML-aware whitespace handling (Astro 7 defaults to JSX-style, which
  // drops the space between adjacent inline elements in prose).
  compressHTML: true,
  image: {
    layout: 'constrained',
    responsiveStyles: true,
  },
  integrations: [townRoutes(site), sitemap({ filter: notARepeatOccurrence })],
  vite: {
    plugins: [tailwindcss()],
    build: {
      // Never inline scripts: the CSP in vercel.json allows script-src 'self' only,
      // so the filter script must ship as a file, however small it is.
      assetsInlineLimit: 0,
    },
  },
});
