/**
 * The places a multi-town guide covers.
 *
 * Carbon Valley is three municipalities under one domain, and every event
 * and place on such a guide says which one it is in (`subTown`, one of the
 * config's `subTowns`). The config holds slugs; the pages need names, and
 * the three here are one word each, so the label is the slug with its
 * initial raised and hyphens made spaces. Pure string work, no config
 * lookup, so it can be unit-tested.
 */

export interface SubTown {
  slug: string;
  label: string;
}

/** "frederick" -> "Frederick", "fort-lupton" -> "Fort Lupton". */
export function subTownLabel(slug: string): string {
  return slug
    .split('-')
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

/** Just enough of a site config: a town has `subTowns` or not, the hub has neither. */
type HasSubTowns = { subTowns?: readonly string[]; kind?: string };

/** The sub-towns of a site, in config order; empty for a single-town guide or the hub. */
export function subTownsOf(site: HasSubTowns): SubTown[] {
  return (site.subTowns ?? []).map((slug) => ({ slug, label: subTownLabel(slug) }));
}

/** "Frederick, Firestone and Dacono", for a sentence. */
export function subTownList(site: HasSubTowns): string {
  const names = subTownsOf(site).map((t) => t.label);
  if (names.length <= 1) return names.join('');
  return `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`;
}
