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
