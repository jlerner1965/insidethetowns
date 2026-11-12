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

/**
 * The clusters, in the order the hub lists them. Towns in a cluster link to
 * each other. Every cluster is a place: "Showpiece pages", which named a
 * layout and not a place, went on 12 November 2026, and Estes Park and
 * Salida are listed where they are (the park's gateway, the Arkansas
 * valley). The richer layout is still `showpiece` on the town.
 */
export const HUB_CLUSTERS = [
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

/** The country a town page's drawn horizon is in (src/lib/ridgeline.ts). */
export type Terrain = 'peaks' | 'foothills' | 'mesa' | 'plains';

export interface HubTown {
  /** The page's address on the hub, /<slug>/, and the slug a record names it by. */
  slug: string;
  name: string;
  /** Every county the town is in, the main one first. */
  counties: readonly [string, ...string[]];
  cluster: HubCluster;
  /** The town's config in src/config/towns/, where it has or had a guide of its own. */
  guide?: string;
  /**
   * A domain the owner holds for a town that never had a guide here
   * (the owner, 12 November 2026): once the town's page is published,
   * every path on it redirects to the page (vercel.json, written by
   * scripts/fold-rules.ts from src/lib/fold.ts). The rules are host-scoped
   * and deploy with every site, so the domain works from whichever Vercel
   * project it is attached to; the hub's is the natural one (DEPLOY.md).
   * A town with a guide keeps its domain on that guide's config instead.
   */
  domain?: string;
  /**
   * The town's own country, where it is not its cluster's: Evergreen is in
   * the foothills though its cluster is the I-70 mountains, Castle Rock
   * sits under its mesa, and Longmont and Louisville are out on the plains
   * (the owner, 12 November 2026). Unset, the cluster decides.
   */
  terrain?: Terrain;
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
    /**
     * The photograph, once one is licensed. Three things and no code: the
     * file in content/hub/images/ under the name given here, the alt text
     * here, and the file's row in IMAGE_LICENSES.csv. Until the file is
     * there and the alt is written the page draws the town's horizon
     * (src/routes/hub/town.astro), so the entry can wait for the picture.
     */
    hero?: { image: string; alt: string; position?: string };
  };
  /**
   * The one thing this page has that no other kind of page does (the
   * owner, 12 November 2026): a block drawn from a public source, shown
   * with its source link and the day it was read, like every row. A town
   * without one shows nothing.
   *
   * `fish-stocking`: the waters near the town that Colorado Parks and
   * Wildlife's weekly trout stocking report may list, mapped by hand, each
   * by the id or ids CPW's own Fishing Atlas link gives it (the report
   * spells a water several ways, "Lon Hagler reservoir", "Evergreen Res",
   * and the id does not change). src/lib/fish-stocking.ts.
   *
   * `river-flow`: the river at the town's gauge, in cubic feet a second,
   * from the U.S. Geological Survey or the Colorado Division of Water
   * Resources, whichever has a gauge at or nearest the town that reports
   * all year. `snowpack`: snow water equivalent at the nearest NRCS SNOTEL
   * station, beside the station's median for the day. Each id was checked
   * against the agency's own service on 12 November 2026 (DECISIONS.md has
   * the list and why each was chosen). src/lib/town-signals.ts.
   */
  signature?:
    | { kind: 'fish-stocking'; waters: readonly StockedWater[] }
    | { kind: 'river-flow'; gauge: RiverGauge }
    | { kind: 'snowpack'; station: SnotelStation };
}

/** A stream gauge a town page reads its river at. */
export interface RiverGauge {
  agency: 'USGS' | 'DWR';
  /** The USGS site number ("09361500") or DWR's station abbreviation ("ARKSALCO"). */
  id: string;
  /** "Arkansas River". */
  river: string;
  /** Where the gauge is, after the river's name: "at Salida", "at Granite, about 16 miles upstream". */
  where: string;
  /** The agency's own page for the gauge. */
  page: string;
}

/** A SNOTEL station a town page reads its snowpack at. */
export interface SnotelStation {
  /** NRCS's station triplet, "485:CO:SNTL". */
  triplet: string;
  /** "Fremont Pass". */
  name: string;
  elevationFt: number;
  /** NRCS's own page for the station. */
  page: string;
}

/** A water a town's page watches for on CPW's stocking report. */
export interface StockedWater {
  /** The name the page prints: the water's usual one, not the report's spelling of the week. */
  name: string;
  /** The Fishing Atlas ids CPW's report links it by (`…fspot&value=<id>`). */
  ids: readonly number[];
}

export const HUB_TOWNS: readonly HubTown[] = [
  {
    slug: 'estes-park',
    name: 'Estes Park',
    counties: ['Larimer'],
    cluster: 'Park gateway',
    guide: 'estes-park',
    signature: { kind: 'fish-stocking', waters: [{ name: 'Lake Estes', ids: [795] }] },
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
    domain: 'insidesalida.com',
    name: 'Salida',
    counties: ['Chaffee'],
    cluster: 'Arkansas valley',
    signature: { kind: 'river-flow', gauge: { agency: 'DWR', id: 'ARKSALCO', river: 'Arkansas River', where: 'at Salida', page: 'https://dwr.state.co.us/Tools/Stations/ARKSALCO' } },
    showpiece: {
      spotlight: 'salida-fibark',
      intro: 'Salida’s year on the Arkansas River, season by season: the festivals, the races and the dates the mountains set.',
      // Waiting for the owner's licensed photograph (12 November 2026): put
      // the file at content/hub/images/salida.jpg, write the alt here, add
      // its row to IMAGE_LICENSES.csv. Until then the page draws its peaks.
      hero: { image: 'salida.jpg', alt: '' },
    },
  },
  { slug: 'grand-lake', name: 'Grand Lake', counties: ['Grand'], cluster: 'Park gateway', guide: 'grand-lake', signature: { kind: 'fish-stocking', waters: [{ name: 'Grand Lake', ids: [83] }] } },
  { slug: 'nederland', name: 'Nederland', counties: ['Boulder'], cluster: 'Park gateway', guide: 'nederland', signature: { kind: 'snowpack', station: { triplet: '564:CO:SNTL', name: 'Lake Eldora', elevationFt: 9700, page: 'https://wcc.sc.egov.usda.gov/nwcc/site?sitenum=564' } } },
  { slug: 'fort-collins', name: 'Fort Collins', counties: ['Larimer'], cluster: 'Front Range cities', guide: 'fortcollins', signature: { kind: 'fish-stocking', waters: [{ name: 'Sheldon Lake', ids: [550] }, { name: 'Prospect Ponds', ids: [444] }, { name: 'Riverbend Ponds', ids: [437] }] } },
  { slug: 'longmont', name: 'Longmont', counties: ['Boulder', 'Weld'], cluster: 'Front Range cities', guide: 'longmont', terrain: 'plains', signature: { kind: 'river-flow', gauge: { agency: 'DWR', id: 'SVCLOPCO', river: 'St. Vrain Creek', where: 'below Ken Pratt Boulevard at Longmont', page: 'https://dwr.state.co.us/Tools/Stations/SVCLOPCO' } } },
  { slug: 'loveland', name: 'Loveland', counties: ['Larimer'], cluster: 'Front Range cities', guide: 'loveland', signature: { kind: 'fish-stocking', waters: [{ name: 'North Lake Park Pond', ids: [794] }, { name: 'Lon Hagler Reservoir', ids: [450] }, { name: 'Jayhawker Ponds', ids: [1342] }] } },
  { slug: 'castle-rock', name: 'Castle Rock', counties: ['Douglas'], cluster: 'Front Range cities', guide: 'castle-rock', terrain: 'mesa' },
  { slug: 'golden', name: 'Golden', counties: ['Jefferson'], cluster: 'Front Range cities', guide: 'golden', signature: { kind: 'river-flow', gauge: { agency: 'USGS', id: '06719505', river: 'Clear Creek', where: 'at Golden', page: 'https://waterdata.usgs.gov/monitoring-location/USGS-06719505/' } } },
  { slug: 'lafayette', name: 'Lafayette', counties: ['Boulder'], cluster: 'Front Range cities', guide: 'lafayette', signature: { kind: 'fish-stocking', waters: [{ name: 'Waneka Lake', ids: [410] }] } },
  { slug: 'louisville', name: 'Louisville', counties: ['Boulder'], cluster: 'Front Range cities', terrain: 'plains', signature: { kind: 'fish-stocking', waters: [{ name: 'Harper Lake', ids: [523] }] } },
  { slug: 'timnath', name: 'Timnath', counties: ['Larimer'], cluster: 'Front Range and plains towns', guide: 'timnath', signature: { kind: 'river-flow', gauge: { agency: 'USGS', id: '06752280', river: 'Cache la Poudre River', where: 'above Boxelder Creek near Timnath', page: 'https://waterdata.usgs.gov/monitoring-location/USGS-06752280/' } } },
  { slug: 'elizabeth', name: 'Elizabeth', counties: ['Elbert'], cluster: 'Front Range and plains towns', guide: 'elizabeth' },
  { slug: 'severance', name: 'Severance', counties: ['Weld'], cluster: 'Front Range and plains towns', guide: 'severance', signature: { kind: 'fish-stocking', waters: [{ name: 'Severance City Pond', ids: [824] }] } },
  { slug: 'mead', name: 'Mead', counties: ['Weld'], cluster: 'Front Range and plains towns', domain: 'insidemead.com' },
  { slug: 'fort-lupton', name: 'Fort Lupton', counties: ['Weld'], cluster: 'Front Range and plains towns', guide: 'fort-lupton', signature: { kind: 'river-flow', gauge: { agency: 'USGS', id: '06721000', river: 'South Platte River', where: 'at Fort Lupton', page: 'https://waterdata.usgs.gov/monitoring-location/USGS-06721000/' } } },
  { slug: 'fort-morgan', name: 'Fort Morgan', counties: ['Morgan'], cluster: 'Front Range and plains towns', domain: 'insidefortmorgan.com', signature: { kind: 'river-flow', gauge: { agency: 'USGS', id: '06759500', river: 'South Platte River', where: 'at Fort Morgan', page: 'https://waterdata.usgs.gov/monitoring-location/USGS-06759500/' } } },
  { slug: 'evergreen', name: 'Evergreen', counties: ['Jefferson'], cluster: 'I-70 mountain', guide: 'evergreen', terrain: 'foothills', signature: { kind: 'fish-stocking', waters: [{ name: 'Evergreen Lake', ids: [548] }] } },
  { slug: 'idaho-springs', name: 'Idaho Springs', counties: ['Clear Creek'], cluster: 'I-70 mountain', guide: 'idaho-springs' },
  { slug: 'georgetown', name: 'Georgetown', counties: ['Clear Creek'], cluster: 'I-70 mountain', guide: 'georgetown', signature: { kind: 'fish-stocking', waters: [{ name: 'Georgetown Lake', ids: [469] }] } },
  { slug: 'black-hawk', name: 'Black Hawk', counties: ['Gilpin'], cluster: 'I-70 mountain', guide: 'black-hawk' },
  { slug: 'frisco', name: 'Frisco', counties: ['Summit'], cluster: 'Summit County', signature: { kind: 'fish-stocking', waters: [{ name: 'Dillon Reservoir', ids: [39] }] } },
  { slug: 'breckenridge', name: 'Breckenridge', counties: ['Summit'], cluster: 'Summit County', signature: { kind: 'snowpack', station: { triplet: '415:CO:SNTL', name: 'Copper Mountain', elevationFt: 10500, page: 'https://wcc.sc.egov.usda.gov/nwcc/site?sitenum=415' } } },
  { slug: 'keystone', name: 'Keystone', counties: ['Summit'], cluster: 'Summit County' },
  { slug: 'buena-vista', name: 'Buena Vista', counties: ['Chaffee'], cluster: 'Arkansas valley', domain: 'insidebuenavista.com', signature: { kind: 'river-flow', gauge: { agency: 'DWR', id: 'ARKGRNCO', river: 'Arkansas River', where: 'at Granite, about 16 miles upstream', page: 'https://dwr.state.co.us/Tools/Stations/ARKGRNCO' } } },
  { slug: 'leadville', name: 'Leadville', counties: ['Lake'], cluster: 'Arkansas valley', guide: 'leadville', signature: { kind: 'snowpack', station: { triplet: '485:CO:SNTL', name: 'Fremont Pass', elevationFt: 11310, page: 'https://wcc.sc.egov.usda.gov/nwcc/site?sitenum=485' } } },
  { slug: 'manitou-springs', name: 'Manitou Springs', counties: ['El Paso'], cluster: 'Pikes Peak', guide: 'manitou-springs' },
  { slug: 'steamboat-springs', name: 'Steamboat Springs', counties: ['Routt'], cluster: 'Yampa valley', domain: 'insidesteamboatsprings.com', signature: { kind: 'fish-stocking', waters: [{ name: 'Casey’s Pond', ids: [18] }, { name: 'Fetcher Pond', ids: [201] }, { name: 'Stagecoach Reservoir', ids: [362] }] } },
  { slug: 'grand-junction', name: 'Grand Junction', counties: ['Mesa'], cluster: 'Western Slope', domain: 'insidegrandjunction.com', signature: { kind: 'river-flow', gauge: { agency: 'USGS', id: '09106485', river: 'Colorado River', where: 'at Grand Junction, above the Gunnison', page: 'https://waterdata.usgs.gov/monitoring-location/USGS-09106485/' } } },
  { slug: 'palisade', name: 'Palisade', counties: ['Mesa'], cluster: 'Western Slope' },
  { slug: 'fruita', name: 'Fruita', counties: ['Mesa'], cluster: 'Western Slope', signature: { kind: 'fish-stocking', waters: [{ name: 'Fruita Red Rocks Lake', ids: [1611] }, { name: 'Snooks Bottom Lake', ids: [1615] }] } },
  { slug: 'carbondale', name: 'Carbondale', counties: ['Garfield'], cluster: 'Roaring Fork valley', signature: { kind: 'fish-stocking', waters: [{ name: 'Crystal River', ids: [1441] }] } },
  { slug: 'glenwood-springs', name: 'Glenwood Springs', counties: ['Garfield'], cluster: 'Roaring Fork valley' },
  { slug: 'crested-butte', name: 'Crested Butte', counties: ['Gunnison'], cluster: 'Gunnison valley', signature: { kind: 'snowpack', station: { triplet: '380:CO:SNTL', name: 'Butte', elevationFt: 10190, page: 'https://wcc.sc.egov.usda.gov/nwcc/site?sitenum=380' } } },
  { slug: 'telluride', name: 'Telluride', counties: ['San Miguel'], cluster: 'Southwest' },
  { slug: 'ouray', name: 'Ouray', counties: ['Ouray'], cluster: 'Southwest', signature: { kind: 'fish-stocking', waters: [{ name: 'Ridgway Reservoir', ids: [62] }] } },
  { slug: 'durango', name: 'Durango', counties: ['La Plata'], cluster: 'Southwest', signature: { kind: 'river-flow', gauge: { agency: 'USGS', id: '09361500', river: 'Animas River', where: 'at Durango', page: 'https://waterdata.usgs.gov/monitoring-location/USGS-09361500/' } } },
];

/**
 * The seven standalone guides, by the slug a record names them with, and
 * the config each is built from, in the order of the owner's brief: the
 * five sports-led guides, then Lyons, then Niwot. This is the one list of
 * guides, and its order is the order every page lists them in
 * (`liveTowns()` in src/config/index.ts reads it). A guide that is live
 * but not here (Elizabeth, until its page on the hub qualifies) still
 * builds and is listed nowhere.
 *
 * `carbon-valley` is the guide to Frederick, Firestone and Dacono.
 * Frederick is not a guide of its own: insidefrederickco.com forwards to
 * Carbon Valley (src/config/towns/frederick.ts).
 */
export const STANDALONE_GUIDES: Readonly<
  Record<
    string,
    {
      guide: string;
      kind: 'sports' | 'outdoors' | 'quiet';
      /**
       * The towns a guide to more than one covers, by name: a record at
       * home there names the town its event is held in ("Frederick"), not
       * the guide. Absent on a guide to one town, whose name is the town's.
       */
      towns?: readonly string[];
    }
  >
> = {
  berthoud: { guide: 'berthoud', kind: 'sports' },
  erie: { guide: 'erie', kind: 'sports' },
  johnstown: { guide: 'johnstown', kind: 'sports' },
  windsor: { guide: 'windsor', kind: 'sports' },
  'carbon-valley': { guide: 'carbon-valley', kind: 'sports', towns: ['Frederick', 'Firestone', 'Dacono'] },
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
