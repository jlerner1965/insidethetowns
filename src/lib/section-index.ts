/**
 * What the hub builds for each folded guide kept page by page
 * (`section.mode: 'pages'`): the kept places, guides and carried events,
 * read once per build and shared by the four routes
 * (src/routes/hub/section-*.astro) and the town page's link to the index.
 */
import type { TownConfig } from '../config/towns/types.ts';
import { sectionTowns } from '../config/index.ts';
import { getSectionEntries, getTraditions, type TownEntry } from './content.ts';
import { eventPath, hubEventPages, publishedHubTowns } from './hub-towns.ts';
import type { SectionIndex } from './section-pages.ts';

export interface SectionContent extends SectionIndex {
  town: TownConfig;
  placeEntries: TownEntry<'places'>[];
  guideEntries: TownEntry<'articles'>[];
  eventEntries: TownEntry<'events'>[];
  /** A tradition record's page on the hub, by record slug. */
  pageFor: (record: string) => string | undefined;
}

let cache: Promise<SectionContent[]> | undefined;

/** Every page-by-page section, in registry order. Read once per build. */
export function sectionContents(): Promise<SectionContent[]> {
  cache ??= (async () => {
    const records = await getTraditions();
    const published = new Set(publishedHubTowns(records).map((t) => t.slug));
    const pages = new Map(hubEventPages(records, published).map((p) => [p.record.slug, eventPath(p.record, published)!]));
    const pageFor = (record: string) => pages.get(record);
    const out: SectionContent[] = [];
    for (const town of sectionTowns('pages')) {
      const [placeEntries, guideEntries, eventEntries] = await Promise.all([getSectionEntries('places', town), getSectionEntries('articles', town), getSectionEntries('events', town)]);
      out.push({
        town,
        hubTown: town.hubPage!.town,
        placeEntries,
        guideEntries,
        eventEntries,
        places: new Set(placeEntries.map((p) => p.slug)),
        guides: new Set(guideEntries.map((g) => g.slug)),
        events: new Set(eventEntries.map((e) => e.slug)),
        pageFor,
      });
    }
    return out;
  })();
  return cache;
}

export async function sectionFor(hubTown: string): Promise<SectionContent | undefined> {
  return (await sectionContents()).find((s) => s.hubTown === hubTown);
}
