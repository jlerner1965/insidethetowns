/**
 * The town pages on the hub (the restructure of 12 November 2026): every
 * town in the network that is not one of the standalone guides has one
 * page on insidethetowns.com, at /<slug>/, and that page is dates only:
 * its traditions and its outdoor dates, each from one record
 * (src/lib/traditions.ts) with its source and the day it was read.
 *
 * Two tiers, no third: a town is a standalone guide (STANDALONE_GUIDES) or
 * a row here. A row is a page only once the town has three verified dated
 * items of its own (src/lib/hub-towns.ts, MIN_OWN_ITEMS); until then it
 * builds nothing and nothing links to it.
 *
 * `guide` is the slug of the town's config in src/config/towns/, where it
 * has or had a guide: that is where its domain is read from, never from
 * here. A town without one never had a guide or a domain in this repo.
 *
 * Plain data, no imports, so the config, the route integration, the
 * scripts and the tests can all read it.
 */

/** The clusters, in the order the hub lists them. Towns in a cluster link to each other. */
export const HUB_CLUSTERS = [
  'Showpiece pages',
  'Park gateway',
  'Front Range cities',
  'Front Range and plains towns',
  'I-70 mountain',
  'Summit County',
  'Arkansas valley',
  'Pikes Peak',
  'Yampa valley',
  'Western Slope',
  'Roaring Fork valley',
  'Gunnison valley',
  'Southwest',
] as const;
export type HubCluster = (typeof HUB_CLUSTERS)[number];

export interface HubTown {
  /** The page's address on the hub, /<slug>/, and the slug a record names it by. */
  slug: string;
  name: string;
  /** Every county the town is in, the main one first. */
  counties: readonly [string, ...string[]];
  cluster: HubCluster;
  /** The town's config in src/config/towns/, where it has or had a guide of its own. */
  guide?: string;
  /** Clusters whose pages this one also links to, beside its own. */
  alsoLinks?: readonly HubCluster[];
  /**
   * The richer layout (Estes Park and Salida only): a hero photograph, one
   * tradition spotlighted, and the year laid out by season. The photograph
   * is a file in content/hub/images/ with its row in IMAGE_LICENSES.csv; a
   * showpiece without one builds the layout without the picture rather
   * than borrow one. `intro` is one line on what the page is.
   */
  showpiece?: {
    /** The record the spotlight block shows. */
    spotlight: string;
    intro: string;
    hero?: { image: string; alt: string; position?: string };
  };
}

export const HUB_TOWNS: readonly HubTown[] = [
  {
    slug: 'estes-park',
    name: 'Estes Park',
    counties: ['Larimer'],
    cluster: 'Showpiece pages',
    guide: 'estes-park',
    alsoLinks: ['Park gateway'],
    showpiece: {
      spotlight: 'estes-park-frozen-dead-guy-days',
      intro: 'What Estes Park puts on through the year, season by season, and the dates Rocky Mountain National Park sets beside it.',
      hero: {
        // The Estes Park guide's hero, bought from Adobe Stock on 30 October
        // 2026 (PERMISSIONS.md, Stock licences); the same file, on the hub.
        image: 'estes-park-elkhorn-avenue.jpeg',
        alt: 'Elkhorn Avenue in downtown Estes Park from above in autumn: cottonwoods in full yellow along the street, shopfronts and rooftops on both sides, and the avenue running on toward the pine-covered hills',
      },
    },
  },
  {
    slug: 'salida',
    name: 'Salida',
    counties: ['Chaffee'],
    cluster: 'Showpiece pages',
    alsoLinks: ['Arkansas valley'],
    showpiece: {
      spotlight: 'salida-fibark',
      intro: 'Salida’s year on the Arkansas River, season by season: the festivals, the races and the dates the mountains set.',
    },
  },
  { slug: 'grand-lake', name: 'Grand Lake', counties: ['Grand'], cluster: 'Park gateway', guide: 'grand-lake', alsoLinks: ['Showpiece pages'] },
  { slug: 'nederland', name: 'Nederland', counties: ['Boulder'], cluster: 'Park gateway', guide: 'nederland', alsoLinks: ['Showpiece pages'] },
  { slug: 'fort-collins', name: 'Fort Collins', counties: ['Larimer'], cluster: 'Front Range cities', guide: 'fortcollins' },
  { slug: 'longmont', name: 'Longmont', counties: ['Boulder', 'Weld'], cluster: 'Front Range cities', guide: 'longmont' },
  { slug: 'loveland', name: 'Loveland', counties: ['Larimer'], cluster: 'Front Range cities', guide: 'loveland' },
  { slug: 'castle-rock', name: 'Castle Rock', counties: ['Douglas'], cluster: 'Front Range cities', guide: 'castle-rock' },
  { slug: 'golden', name: 'Golden', counties: ['Jefferson'], cluster: 'Front Range cities', guide: 'golden' },
  { slug: 'lafayette', name: 'Lafayette', counties: ['Boulder'], cluster: 'Front Range cities', guide: 'lafayette' },
  { slug: 'louisville', name: 'Louisville', counties: ['Boulder'], cluster: 'Front Range cities' },
  { slug: 'timnath', name: 'Timnath', counties: ['Larimer'], cluster: 'Front Range and plains towns', guide: 'timnath' },
  { slug: 'elizabeth', name: 'Elizabeth', counties: ['Elbert'], cluster: 'Front Range and plains towns', guide: 'elizabeth' },
  { slug: 'severance', name: 'Severance', counties: ['Weld'], cluster: 'Front Range and plains towns', guide: 'severance' },
  { slug: 'mead', name: 'Mead', counties: ['Weld'], cluster: 'Front Range and plains towns' },
  { slug: 'fort-lupton', name: 'Fort Lupton', counties: ['Weld'], cluster: 'Front Range and plains towns', guide: 'fort-lupton' },
  { slug: 'fort-morgan', name: 'Fort Morgan', counties: ['Morgan'], cluster: 'Front Range and plains towns' },
  { slug: 'evergreen', name: 'Evergreen', counties: ['Jefferson'], cluster: 'I-70 mountain', guide: 'evergreen' },
  { slug: 'idaho-springs', name: 'Idaho Springs', counties: ['Clear Creek'], cluster: 'I-70 mountain', guide: 'idaho-springs' },
  { slug: 'georgetown', name: 'Georgetown', counties: ['Clear Creek'], cluster: 'I-70 mountain', guide: 'georgetown' },
  { slug: 'black-hawk', name: 'Black Hawk', counties: ['Gilpin'], cluster: 'I-70 mountain', guide: 'black-hawk' },
  { slug: 'frisco', name: 'Frisco', counties: ['Summit'], cluster: 'Summit County' },
  { slug: 'breckenridge', name: 'Breckenridge', counties: ['Summit'], cluster: 'Summit County' },
  { slug: 'keystone', name: 'Keystone', counties: ['Summit'], cluster: 'Summit County' },
  { slug: 'buena-vista', name: 'Buena Vista', counties: ['Chaffee'], cluster: 'Arkansas valley', alsoLinks: ['Showpiece pages'] },
  { slug: 'leadville', name: 'Leadville', counties: ['Lake'], cluster: 'Arkansas valley', guide: 'leadville', alsoLinks: ['Showpiece pages'] },
  { slug: 'manitou-springs', name: 'Manitou Springs', counties: ['El Paso'], cluster: 'Pikes Peak', guide: 'manitou-springs' },
  { slug: 'steamboat-springs', name: 'Steamboat Springs', counties: ['Routt'], cluster: 'Yampa valley' },
  { slug: 'grand-junction', name: 'Grand Junction', counties: ['Mesa'], cluster: 'Western Slope' },
  { slug: 'palisade', name: 'Palisade', counties: ['Mesa'], cluster: 'Western Slope' },
  { slug: 'fruita', name: 'Fruita', counties: ['Mesa'], cluster: 'Western Slope' },
  { slug: 'carbondale', name: 'Carbondale', counties: ['Garfield'], cluster: 'Roaring Fork valley' },
  { slug: 'glenwood-springs', name: 'Glenwood Springs', counties: ['Garfield'], cluster: 'Roaring Fork valley' },
  { slug: 'crested-butte', name: 'Crested Butte', counties: ['Gunnison'], cluster: 'Gunnison valley' },
  { slug: 'telluride', name: 'Telluride', counties: ['San Miguel'], cluster: 'Southwest' },
  { slug: 'ouray', name: 'Ouray', counties: ['Ouray'], cluster: 'Southwest' },
  { slug: 'durango', name: 'Durango', counties: ['La Plata'], cluster: 'Southwest' },
];

/**
 * The seven standalone guides, by the slug a record names them with, and
 * the config each is built from. `carbon-valley` is the brief's name for
 * the guide to Frederick, Firestone and Dacono; since 2 November 2026 that
 * guide is Inside Frederick (src/config/towns/frederick.ts), and the old
 * carbonvalleyguide.com forwards to it.
 */
export const STANDALONE_GUIDES: Readonly<Record<string, { guide: string; kind: 'sports' | 'outdoors' | 'quiet' }>> = {
  berthoud: { guide: 'berthoud', kind: 'sports' },
  erie: { guide: 'erie', kind: 'sports' },
  johnstown: { guide: 'johnstown', kind: 'sports' },
  windsor: { guide: 'windsor', kind: 'sports' },
  'carbon-valley': { guide: 'frederick', kind: 'sports' },
  lyons: { guide: 'lyons', kind: 'outdoors' },
  niwot: { guide: 'niwot', kind: 'quiet' },
};

export function findHubTown(slug: string): HubTown | undefined {
  return HUB_TOWNS.find((t) => t.slug === slug);
}

/** The hub town a guide's config belongs to: `fortcollins` is Fort Collins' page, `fort-collins`. */
export function hubTownForGuide(guide: string): HubTown | undefined {
  return HUB_TOWNS.find((t) => t.guide === guide);
}

/** "Larimer County", "Boulder and Weld counties". */
export function hubCountyLine(town: Pick<HubTown, 'counties'>): string {
  const c = town.counties;
  if (c.length === 1) return `${c[0]} County`;
  return `${c.slice(0, -1).join(', ')} and ${c.at(-1)} counties`;
}
