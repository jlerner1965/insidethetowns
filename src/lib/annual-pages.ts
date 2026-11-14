/**
 * A guide's annual event pages (`annual: true` in an event's file) beside the
 * registry of traditions (content/hub/traditions/), for "Every year in
 * <Town>" (src/routes/town/traditions.astro).
 *
 * The review of 14 November 2026 found 31 built pages linked from nowhere,
 * Erie's Balloon Festival, Town Fair and Brewfest and Berthoud Day among
 * them: an annual event's permanent page drops out of every list once its
 * date passes, and /traditions/ named the tradition without linking it. So
 * each tradition row links the guide's own page for it, where there is one,
 * and every annual page no tradition record names is listed under it.
 *
 * Pure string work, so it can be unit-tested.
 */

/** One annual event page on a guide: its slug under /events/, its title and its day key. */
export interface AnnualPage {
  slug: string;
  title: string;
  start: string;
}

/** A tradition record as far as matching needs it. */
export interface AnnualRecord {
  slug: string;
  name: string;
  town?: { name: string };
}

const nameKey = (text: string) => text.toLowerCase().replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, ' ').trim();

/** A name's words less the town's name ("Erie Parade of Lights" → "parade of lights"). */
function core(text: string, towns: readonly string[]): string {
  let key = ` ${nameKey(text)} `;
  for (const town of towns) {
    const t = nameKey(town);
    if (t) key = key.replaceAll(` ${t} `, ' ');
  }
  return key.replace(/\s+/g, ' ').trim();
}

/**
 * The guide's page for a tradition: the same slug, the record's slug with
 * the town in front of the page's ("berthoud-parade-of-lights" for
 * "parade-of-lights"), or a name that carries the other's, whole words, the
 * town's name aside ("Severance Kids Fishing Derby" and "Kids Fishing
 * Derby"; "Lyons Parade of Lights" and "Lyons Holiday Parade of Lights").
 * Two words at least, so "Parade" alone never matches.
 */
export function annualPageFor(record: AnnualRecord, pages: readonly AnnualPage[], guideTowns: readonly string[]): AnnualPage | undefined {
  const bySlug = pages.find((p) => p.slug === record.slug) ?? pages.find((p) => record.slug.endsWith(`-${p.slug}`));
  if (bySlug) return bySlug;
  const towns = [...guideTowns, ...(record.town?.name ? [record.town.name] : [])];
  const name = core(record.name, towns);
  if (name.split(' ').length < 2) return undefined;
  return pages.find((p) => {
    const title = core(p.title, towns);
    return title.split(' ').length >= 2 && (` ${title} `.includes(` ${name} `) || ` ${name} `.includes(` ${title} `));
  });
}

/** The guide's annual pages that no tradition record names, by title. */
export function unmatchedAnnualPages(records: readonly AnnualRecord[], pages: readonly AnnualPage[], guideTowns: readonly string[]): AnnualPage[] {
  const matched = new Set(records.map((r) => annualPageFor(r, pages, guideTowns)?.slug).filter(Boolean));
  return pages.filter((p) => !matched.has(p.slug)).sort((a, b) => a.title.localeCompare(b.title));
}
