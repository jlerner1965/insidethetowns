/**
 * A folded guide built as a section of the hub (src/config/index.ts,
 * `sectionSite`; scripts/run.ts builds it, scripts/lib/section-merge.ts
 * puts it under /<town>/). The build runs with Astro's `base` set to the
 * section's prefix, so every asset the build names carries it; the links a
 * template writes by hand ("/events/") do not, and are prefixed after the
 * build. A template that reads its own address reads it through here, so
 * "/longmont/events/" is "/events/" to it, as it was on the guide's domain.
 */

/** The page's path as the guide knew it: without the section's prefix. */
export function pagePath(url: URL, base: string = import.meta.env.BASE_URL): string {
  const prefix = base.replace(/\/$/, '');
  if (!prefix) return url.pathname;
  if (url.pathname === prefix) return '/';
  return url.pathname.startsWith(`${prefix}/`) ? url.pathname.slice(prefix.length) : url.pathname;
}

/**
 * The guide's paths a folded full section sends elsewhere (the move of 17
 * November 2026), as [path, destination under the section]: This week,
 * This weekend and Updates are the section's events page, and its Every
 * year page is the hub's town page. A guide moved whole (`section.carry:
 * 'all'`) carries every one at its own path. scripts/lib/section-merge.ts
 * rewrites a section's own pages by this list after the build; a hub page
 * that draws a section's links itself, its masthead (Header.astro), goes
 * through `sectionHref`, so the two cannot disagree.
 */
export const SECTION_MOVED: ReadonlyArray<readonly [from: string, to: string]> = [
  ['/this-week/', '/events/'],
  ['/this-weekend/', '/events/'],
  ['/updates/', '/events/'],
  ['/updates.rss', '/events.rss'],
  // The guide's "Every year" page: the hub's town page carries the same records.
  ['/traditions/', '/#traditions'],
];

/**
 * A link a section's template writes by hand ("/this-week/") as it is
 * under the section on the hub: "/longmont/events/" on a folded section,
 * "/erie/this-week/" on a guide moved whole (`carryAll`), and "/longmont/"
 * for the home, as the merge writes them. Anything that is not a path on
 * this host, or is already under the section, is left as it is.
 */
export function sectionHref(href: string, base: string, carryAll = false): string {
  if (!href.startsWith('/') || href.startsWith('//')) return href;
  const at = href.search(/[?#]/);
  const path = at === -1 ? href : href.slice(0, at);
  const rest = at === -1 ? '' : href.slice(at);
  if (path === base || path.startsWith(`${base}/`)) return href;
  if (path === '/') return `${base}/${rest}`;
  if (!carryAll) {
    for (const [from, to] of SECTION_MOVED) {
      if (path === from || path === from.replace(/\/$/, '')) return `${base}${to}${rest.startsWith('?') ? rest.split('#')[0] : ''}`;
    }
  }
  return `${base}${path}${rest}`;
}
