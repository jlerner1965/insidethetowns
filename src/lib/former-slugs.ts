/**
 * The URLs a listing used to have, so a reader or a search engine that
 * still holds the old one lands on the new one.
 *
 * The editor's sweeps merge and re-file listings under new slugs (two
 * beer-release pages and the band playing them became one, 5 November
 * 2026), and the old URL went to a 404 while Google was still sending
 * readers to it (nine such pages had traffic in the Search Console read of
 * the same day). A re-filed listing now carries `formerSlugs` in its front
 * matter, and the build turns each into a redirect page at the old path
 * (astro.config.mjs `redirects`, which a static build writes as a
 * meta-refresh page; Google reads that as a redirect).
 *
 * Read straight from the Markdown, like series.ts and raw-places.ts,
 * because astro.config runs before the collections exist. A former slug
 * that is also a live slug is skipped with a warning rather than shadowing
 * a page: the live page wins, and the validator reports the clash.
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const KINDS = ['events', 'places'] as const;
export type FormerSlugKind = (typeof KINDS)[number];

/** `formerSlugs: [a, b]` on one line, or a block list of `- a` lines; nothing when the field is absent. */
export function parseFormerSlugs(frontmatter: string): string[] {
  const inline = frontmatter.match(/^formerSlugs:\s*\[([^\]]*)\]\s*$/m);
  if (inline) return inline[1]!.split(',').map((s) => s.trim().replace(/^["']|["']$/g, '')).filter(Boolean);
  const block = frontmatter.match(/^formerSlugs:\s*\n((?:[ \t]+-\s*[^\n]*\n?)+)/m);
  if (block) return [...block[1]!.matchAll(/-\s*["']?([a-z0-9-]+)["']?/g)].map((m) => m[1]!);
  return [];
}

export interface FormerSlug {
  kind: FormerSlugKind;
  from: string;
  to: string;
}

/** Every former slug a town's events and places declare, with the slug each now lives at. */
export function formerSlugs(town: string, contentRoot = 'content'): FormerSlug[] {
  const out: FormerSlug[] = [];
  for (const kind of KINDS) {
    const dir = join(contentRoot, town, kind);
    if (!existsSync(dir)) continue;
    const live = new Map<string, string[]>();
    for (const file of readdirSync(dir)) {
      if (!file.endsWith('.md') || file.startsWith('_')) continue;
      const fm = readFileSync(join(dir, file), 'utf8').match(/^---\n([\s\S]*?)\n---/)?.[1];
      if (!fm) continue;
      const slug = fm.match(/^slug:\s*"?([a-z0-9-]+)"?\s*$/m)?.[1] ?? file.slice(0, -3);
      live.set(slug, parseFormerSlugs(fm));
    }
    for (const [to, formers] of live) {
      for (const from of formers) {
        if (from === to) continue;
        if (live.has(from)) {
          console.warn(`former-slugs: ${town}/${kind}/${to} names ${from} as a former slug, but ${from} is a live listing; the live page keeps the URL.`);
          continue;
        }
        out.push({ kind, from, to });
      }
    }
  }
  return out;
}

/** The town's former slugs as Astro `redirects`: `/events/old` to `/events/new/`. */
export function formerSlugRedirects(town: string, contentRoot = 'content'): Record<string, string> {
  const out: Record<string, string> = {};
  for (const { kind, from, to } of formerSlugs(town, contentRoot)) out[`/${kind}/${from}`] = `/${kind}/${to}/`;
  return out;
}
