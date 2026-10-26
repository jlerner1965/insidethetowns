/**
 * The site search's index, written into dist/pagefind/ from the pages just
 * built. Part of the build, not the deploy, so a preview has search too.
 *
 * Pagefind's Node API rather than its CLI, for one reason: the hub also
 * indexes the town pages it does not build. The hub build leaves their
 * records in dist/network-search.json (src/routes/hub/network-search.json.ts);
 * each is added here as a page at its absolute URL on the town's domain, and
 * the file is deleted so it is not deployed. A town build has no such file
 * and gets exactly what `pagefind --site dist` gave it.
 */
import { existsSync, readFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import * as pagefind from 'pagefind';
import { NETWORK_SEARCH_FILE } from '../../src/lib/network-search.ts';

/**
 * What is never a page's words, on any page, kept out of the index here in
 * one place rather than marked component by component (audit, 26 October
 * 2026: a search for "City Star" on Berthoud returned excerpts that ended
 * "Finish signing up in the new tab, then confirm by email", the signup's
 * hidden panel, on every event).
 *
 * Pagefind already skips <nav>, <footer>, <form>, <script> and <style>, and
 * honours `data-pagefind-ignore` (the site header, footer, ArticleStrip and
 * the "More in …" modules carry it). It does not know what the browser
 * would not show, nor what is interface rather than content, so these go
 * too (Pagefind's `excludeSelectors`, the Node API's form of the CLI's
 * --exclude-selectors; pagefind.app/docs/config-options):
 *
 * - anything `hidden` at build: the signup's "finish in the new tab" panel,
 *   its validation errors, an open-or-closed line the script fills in, the
 *   "nothing matches" lines of the filters, a notice not yet in effect;
 * - live regions and alerts, which hold status and error text;
 * - buttons, which are controls ("Show all towns", "Change your details"),
 *   and links to a place on the same page (the day strip's chips, an
 *   article's contents, the home page's "Thursday email, in your inbox"
 *   that jumps to the signup), which repeat words the page already has;
 * - the correction link and the "opening or closing? Tell us" mail link on
 *   every listing, and the newsletter signup and its privacy line, also
 *   named here in case one is ever rendered outside its <form>.
 *
 * Exported so the test can hold the list to what it says.
 */
export const EXCLUDE_SELECTORS = [
  '[hidden]',
  '[aria-hidden="true"]',
  '[aria-live]',
  '[role="status"]',
  '[role="alert"]',
  'button',
  'a[href^="#"]',
  'nav',
  'footer',
  'form',
  '[data-signup]',
  '[data-signup-done]',
  'a[href^="/correct/"]',
  'a[href^="mailto:"]',
];

export async function buildSearchIndex(dist = 'dist'): Promise<{ pages: number; records: number }> {
  const { index, errors } = await pagefind.createIndex({ excludeSelectors: EXCLUDE_SELECTORS });
  if (!index) throw new Error(`pagefind: ${errors.join('; ')}`);
  try {
    const site = await index.addDirectory({ path: dist });
    if (site.errors.length) throw new Error(`pagefind: ${site.errors.join('; ')}`);

    let records = 0;
    const file = join(dist, NETWORK_SEARCH_FILE);
    if (existsSync(file)) {
      const list = JSON.parse(readFileSync(file, 'utf8')) as Array<{ url: string; html: string }>;
      for (const { url, html } of list) {
        const added = await index.addHTMLFile({ url, content: html });
        if (added.errors.length) throw new Error(`pagefind: ${url}: ${added.errors.join('; ')}`);
        records++;
      }
      rmSync(file);
    }

    const written = await index.writeFiles({ outputPath: join(dist, 'pagefind') });
    if (written.errors.length) throw new Error(`pagefind: ${written.errors.join('; ')}`);
    return { pages: site.page_count, records };
  } finally {
    await pagefind.close();
  }
}
