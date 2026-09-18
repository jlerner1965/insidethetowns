/**
 * Which event pages are repeat occurrences of a series.
 *
 * A recurring event is stored as one markdown file per occurrence, so a council
 * meeting that runs twice a month becomes a dozen pages differing only in the
 * date. The soonest occurrence of each series is the one worth indexing; the
 * rest are marked noindex and kept out of the sitemap.
 *
 * This reads the markdown directly rather than the content layer, because the
 * sitemap integration needs the answer while Astro's config is still loading.
 */
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

interface Occurrence {
  slug: string;
  key: string;
  start: string;
}

function field(frontmatter: string, name: string): string {
  const m = frontmatter.match(new RegExp(`^${name}:\\s*"?([^"\\n]+)"?\\s*$`, 'm'));
  return m ? m[1].trim() : '';
}

/** Slugs of every event page that is not the soonest occurrence of its series. */
export function repeatOccurrenceSlugs(town: string, contentRoot = 'content'): Set<string> {
  const dir = join(contentRoot, town, 'events');
  if (!existsSync(dir)) return new Set();

  const all: Occurrence[] = [];
  for (const file of readdirSync(dir)) {
    if (!file.endsWith('.md') || file.startsWith('_')) continue;
    const raw = readFileSync(join(dir, file), 'utf8');
    const fm = raw.match(/^---\n([\s\S]*?)\n---/);
    if (!fm) continue;
    const title = field(fm[1], 'title');
    const venue = field(fm[1], 'venue');
    const start = field(fm[1], 'start');
    if (!title || !start) continue;
    all.push({ slug: file.slice(0, -3), key: `${title}|${venue}`, start });
  }

  all.sort((a, b) => a.start.localeCompare(b.start));
  const seen = new Set<string>();
  const repeats = new Set<string>();
  for (const o of all) {
    if (seen.has(o.key)) repeats.add(o.slug);
    else seen.add(o.key);
  }
  return repeats;
}
