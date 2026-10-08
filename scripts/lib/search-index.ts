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

export async function buildSearchIndex(dist = 'dist'): Promise<{ pages: number; records: number }> {
  const { index, errors } = await pagefind.createIndex({});
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
