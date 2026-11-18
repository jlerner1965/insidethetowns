#!/usr/bin/env node
/**
 * Rewrites the links in a folded guide's kept pages to their addresses on
 * the hub (the move of 17 November 2026; `section.mode: 'pages'` on the
 * town's config, src/lib/section-pages.ts). The old guide wrote
 * "/places/<slug>/", "/events/<slug>/", "/articles/<slug>/", "/families/"
 * and the like; on the hub a kept place is /<town>/places/<slug>/, a kept
 * guide /<town>/guides/<slug>/, a carried event /<town>/events/<slug>/, an
 * annual event its tradition page, and anything the move did not carry is
 * the town's page. Markdown links, HTML hrefs in the text, and the `href`
 * of an article's `related` entries are all rewritten; a link already on
 * the hub, to another site, or to mail is left alone.
 *
 *   node scripts/section-links.ts            # says what would change
 *   node scripts/section-links.ts --write    # rewrites the files
 *
 * Run it after a page is carried over or re-filed. test/section-pages.test.ts
 * fails when a kept page still links to an address the hub does not have.
 */
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { sectionTowns } from '../src/config/index.ts';
import { hubEventPages, publishedHubTowns, eventPath } from '../src/lib/hub-towns.ts';
import { rawRecords } from '../src/lib/tradition-files.ts';
import { sectionHref, type SectionIndex } from '../src/lib/section-pages.ts';

const write = process.argv.includes('--write');
const records = rawRecords();
const published = new Set(publishedHubTowns(records).map((t) => t.slug));
const pages = new Map(hubEventPages(records, published).map((p) => [p.record.slug, eventPath(p.record, published)!]));
const pageFor = (slug: string) => pages.get(slug);

const slugs = (dir: string) => (existsSync(dir) ? readdirSync(dir).filter((f) => f.endsWith('.md') && !f.startsWith('_')).map((f) => f.replace(/\.md$/, '')) : []);

/** Every link in one file's text and front matter, rewritten. */
export function rewriteFile(text: string, index: SectionIndex, town: Parameters<typeof sectionHref>[2]): string {
  const go = (href: string) => sectionHref(href, index, town, pageFor);
  return text
    // Markdown: ](/path) and ](https://old.domain/path)
    .replace(/\]\((\/[^)\s]*|https?:\/\/[^)\s]+)\)/g, (_m, href: string) => `](${go(href)})`)
    // HTML in the text, and `href: "/path"` in the front matter's related list.
    .replace(/(href(?:=|:\s*)")([^"]+)(")/g, (_m, a: string, href: string, z: string) => `${a}${go(href)}${z}`)
    .replace(/(href:\s*')([^']+)(')/g, (_m, a: string, href: string, z: string) => `${a}${go(href)}${z}`);
}

let changed = 0;
for (const town of sectionTowns('pages')) {
  const root = join('content', town.slug);
  const index: SectionIndex = {
    hubTown: town.hubPage!.town,
    places: new Set(slugs(join(root, 'places'))),
    guides: new Set(slugs(join(root, 'articles'))),
    events: new Set(slugs(join(root, 'events'))),
  };
  for (const kind of ['places', 'articles', 'events'] as const) {
    for (const slug of index[kind === 'articles' ? 'guides' : kind]) {
      const file = join(root, kind, `${slug}.md`);
      const before = readFileSync(file, 'utf8');
      const after = rewriteFile(before, index, town);
      if (after === before) continue;
      changed++;
      if (write) writeFileSync(file, after, 'utf8');
      else console.log(`${file}: links to rewrite`);
    }
  }
}
console.log(changed === 0 ? 'Every kept page already links to the hub.' : write ? `${changed} file(s) rewritten.` : `${changed} file(s) differ. Run with --write.`);
