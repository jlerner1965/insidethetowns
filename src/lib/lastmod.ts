/**
 * When each page last changed, for the sitemap's lastmod.
 *
 * Read straight from the markdown, like series.ts and raw-places.ts, because
 * the sitemap is built while Astro's config is loading and the collections
 * do not exist yet. An event or place changed when it was last checked; an
 * article when it was last checked, else updated, else published; an issue
 * on its send day. Every other page is as new as the build.
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseLocal } from './dates.ts';

const FIELD = (name: string) => new RegExp(`^${name}:\\s*"?([^"\\n]+?)"?\\s*$`, 'm');

function read(dir: string, fields: string[], path: (slug: string) => string, out: Map<string, string>) {
  if (!existsSync(dir)) return;
  for (const file of readdirSync(dir)) {
    if (!file.endsWith('.md') || file.startsWith('_')) continue;
    const fm = readFileSync(join(dir, file), 'utf8').match(/^---\n([\s\S]*?)\n---/)?.[1];
    if (!fm) continue;
    const slug = fm.match(/^slug:\s*"?([a-z0-9-]+)"?\s*$/m)?.[1] ?? file.slice(0, -3);
    for (const field of fields) {
      const raw = fm.match(FIELD(field))?.[1];
      if (!raw) continue;
      try {
        out.set(path(slug), parseLocal(raw.trim()).toISOString());
        break;
      } catch {
        // an unreadable date is the validator's to report; the page falls back to the build date
      }
    }
  }
}

/** Path ("/events/x/") to the ISO instant that page last changed, for the pages that carry a date. */
export function contentDates(site: { kind: 'town' | 'hub'; slug: string }, contentRoot = 'content'): Map<string, string> {
  const out = new Map<string, string>();
  const root = join(contentRoot, site.slug);
  if (site.kind === 'town') {
    read(join(root, 'events'), ['verified'], (slug) => `/events/${slug}/`, out);
    read(join(root, 'places'), ['verified'], (slug) => `/places/${slug}/`, out);
    read(join(root, 'articles'), ['verified', 'updated', 'date'], (slug) => `/articles/${slug}/`, out);
  } else {
    read(join(root, 'issues'), ['date'], (slug) => `/newsletter/${slug}/`, out);
  }
  return out;
}

/** The lastmod for one sitemap URL: the page's own date, else the build's. */
export function lastmodFor(url: string, dates: Map<string, string>, buildDate: Date): string {
  const { pathname } = new URL(url);
  return dates.get(pathname) ?? buildDate.toISOString();
}
