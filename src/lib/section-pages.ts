/**
 * The folded guides kept page by page on the hub (`section.mode: 'pages'`;
 * the move of 17 November 2026): what each has, where it is, and how a
 * link written for the old guide reads on the hub.
 *
 * A kept place is /<town>/places/<slug>/, a kept guide (the old
 * /articles/<slug>/) is /<town>/guides/<slug>/, a carried one-time event is
 * /<town>/events/<slug>/, and /<town>/places/ lists the kept pages. The
 * old guide's other pages (its home, Things to do, the events index,
 * Families, Moving here) are the town's page on the hub. An annual event
 * is the hub's tradition page for its record, by data/hub/fold-events.json.
 */
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import type { TownConfig } from '../config/towns/types.ts';
import { allTowns } from '../config/index.ts';
import foldEvents from '../../data/hub/fold-events.json' with { type: 'json' };

export interface SectionIndex {
  /** The hub town slug: "fort-collins" for the config `fortcollins`. */
  hubTown: string;
  places: ReadonlySet<string>;
  guides: ReadonlySet<string>;
  events: ReadonlySet<string>;
}

/** Where the old guide's event address goes: the tradition record's page, by the hand-reviewed map. */
export function traditionPathFor(town: TownConfig, eventSlug: string, pageFor: (record: string) => string | undefined): string | undefined {
  const map = (foldEvents as Record<string, Record<string, string>>)[town.domain] ?? {};
  const record = map[`/events/${eventSlug}/`];
  return record ? pageFor(record) : undefined;
}

/** The hub's pages that are the same site from the section's point of view, left as they are. */
const HUB_PAGES = new Set(['/about/', '/contact/', '/privacy/', '/editorial/', '/corrections/', '/credits/', '/search/', '/newsletter/', '/advertise/', '/towns/', '/annual-events/', '/articles/']);

/**
 * One old link's address on the hub. Kept pages keep their slugs; a link
 * to anything the move did not carry goes to the town's page, so no
 * kept page sends a reader to a 410.
 */
export function sectionHref(href: string, index: SectionIndex, town: TownConfig, pageFor: (record: string) => string | undefined): string {
  const base = `/${index.hubTown}/`;
  const at = href.search(/[?#]/);
  const path = at === -1 ? href : href.slice(0, at);
  const rest = at === -1 ? '' : href.slice(at);
  // The same link spelled out on the old domain.
  const own = path.match(new RegExp(`^https?://(?:www\\.)?${town.domain.replace(/\./g, '\\.')}(/.*)?$`));
  // A link to another folded guide's domain: where that guide's page went (Timnath's guides named Fort Collins' places).
  if (!own) {
    const other = path.match(/^https?:\/\/(?:www\.)?([a-z0-9.-]+)(\/.*)?$/);
    const target = other && allTowns.find((t) => t.domain === other[1] && t.hubPage && t.section);
    if (target) return `${crossHref(other![2] || '/', target, pageFor)}${rest}`;
  }
  const local = own ? own[1] || '/' : path;
  if (/^(?:https?:)?\/\//.test(local) || /^(?:mailto|tel|webcal):/.test(local)) return href;
  if (!local.startsWith('/')) return href;
  if (local.startsWith(base)) return `${local}${rest}`;
  if (HUB_PAGES.has(local)) return `${local}${rest}`;
  const m = local.match(/^\/(places|articles|events)\/([a-z0-9-]+)\/?$/);
  if (m) {
    const [, kind, slug] = m;
    if (kind === 'places' && index.places.has(slug!)) return `${base}places/${slug}/${rest}`;
    if (kind === 'articles' && index.guides.has(slug!)) return `${base}guides/${slug}/${rest}`;
    if (kind === 'events') {
      if (index.events.has(slug!)) return `${base}events/${slug}/${rest}`;
      const tradition = traditionPathFor(town, slug!, pageFor);
      if (tradition) return `${tradition}${rest}`;
    }
  }
  if (local === '/places/' || local === '/directory/' || local === '/guides/') return `${base}places/${rest}`;
  return base;
}

/**
 * Where a link into another folded guide goes: a listing the hub carries
 * (its file is in content/<slug>/, so the section or the kept page builds
 * it), an annual event's tradition page, or that town's page.
 */
function crossHref(path: string, target: TownConfig, pageFor: (record: string) => string | undefined, contentRoot = 'content'): string {
  const base = `/${target.hubPage!.town}/`;
  const m = path.match(/^\/(places|articles|events)\/([a-z0-9-]+)\/?$/);
  if (!m) return base;
  const [, kind, slug] = m;
  if (kind === 'events') {
    const tradition = traditionPathFor(target, slug!, pageFor);
    if (tradition) return tradition;
  }
  if (!existsSync(join(contentRoot, target.slug, kind!, `${slug}.md`))) return base;
  const folder = target.section!.mode === 'full' ? kind : kind === 'articles' ? 'guides' : kind;
  return `${base}${folder}/${slug}/`;
}

/** Rewrites every root-relative or old-domain href and src in rendered HTML. */
export function rewriteSectionHtml(html: string, index: SectionIndex, town: TownConfig, pageFor: (record: string) => string | undefined): string {
  return html.replace(/(\shref=")([^"]*)(")/g, (_m, a: string, href: string, z: string) => `${a}${sectionHref(href.replace(/&amp;/g, '&'), index, town, pageFor).replace(/&/g, '&amp;')}${z}`);
}
