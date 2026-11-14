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
  'Eastern plains',
  'I-70 mountain',
  'Summit County',
  'Eagle valley',
  'Grand County',
  'North Park',
  'South Park',
  'Arkansas valley',
  'Pikes Peak',
  'Southern Colorado',
  'San Luis Valley',
  'Yampa valley',
  'Western Slope',
  'North Fork valley',
  'Roaring Fork valley',
  'Gunnison valley',
  'Southwest',
] as const;
export type HubCluster = (typeof HUB_CLUSTERS)[number];

/**
 * Each cluster as a reader sees it (the publication redesign of 14 November
 * 2026): the home's "Town pages by area" and a town page's "More in …".
 * Display only. The keys above stay as they are, since every town names
 * its cluster by key, the drawn horizons are chosen by it and the search's
 * regions are matched on it; nothing here is in an address.
 */
export const CLUSTER_NAMES: Readonly<Record<HubCluster, string>> = {
  'Park gateway': 'Park gateway towns',
  'Front Range cities': 'Front Range cities',
  'Front Range and plains towns': 'Front Range and plains towns',
  'Eastern plains': 'Eastern Plains',
  'I-70 mountain': 'I-70 mountain towns',
  'Summit County': 'Summit County',
  'Eagle valley': 'Eagle Valley',
  'Grand County': 'Grand County',
  'North Park': 'North Park',
  'South Park': 'South Park',
  'Arkansas valley': 'Arkansas Valley',
  'Pikes Peak': 'Pikes Peak',
  'Southern Colorado': 'Southern Colorado',
  'San Luis Valley': 'San Luis Valley',
  'Yampa valley': 'Yampa Valley',
  'Western Slope': 'Western Slope',
  'North Fork valley': 'North Fork Valley',
  'Roaring Fork valley': 'Roaring Fork Valley',
  'Gunnison valley': 'Gunnison Valley',
  Southwest: 'Southwest',
};

/** A cluster's name for the page: "Arkansas valley" reads "Arkansas Valley". */
export function clusterName(cluster: HubCluster): string {
  return CLUSTER_NAMES[cluster];
}

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
   * The richer page (Estes Park and Salida only): a line of its own under
   * the name, and its photograph here (any town may now have one, as
   * `hero` below). The photograph is a file in content/hub/images/ with
   * its row in IMAGE_LICENSES.csv; a showpiece without one draws the town's
   * horizon rather than borrow one. `intro` is
   * one line on what the page is. Since the publication redesign of 14
   * November 2026 the dates take every town's layout: the spotlight and the
   * year by season are not drawn, and the intros no longer say "season by
   * season". `spotlight` stays on file, unused.
   */
  showpiece?: {
    /** The record the spotlight block showed, before the redesign of 14 November 2026; not drawn now. */
    spotlight: string;
    intro: string;
    /**
     * The photograph, once one is licensed. Three things and no code: the
     * file in content/hub/images/ under the name given here, the alt text
     * here, and the file's row in IMAGE_LICENSES.csv. Until the file is
     * there and the alt is written the page draws the town's horizon
     * (src/routes/hub/town.astro), so the entry can wait for the picture.
     */
    hero?: HubTownHero;
  };
  /**
   * The town page's photograph, for any town (14 November 2026): behind the
   * name, in place of the drawn horizon, and the page's share image. Three
   * things and no code: the file, the alt text here, and the file's row in
   * IMAGE_LICENSES.csv. The file is in content/hub/images/ unless `folder`
   * names another content folder: a town that had a guide shows that
   * guide's own licensed hero from where it already is (content/golden/
   * images/), so the picture and its ledger row are not copied. Until the
   * file is on disk and the alt is written, the page draws the horizon, so
   * an entry can wait for its picture (`alt: ''`), as Salida's does. The
   * alt is written from the photograph once it is here, never before.
   * A showpiece's `showpiece.hero` still works; this wins where both are set.
   */
  hero?: HubTownHero;
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

/** A town page's photograph (HubTown.hero). */
export interface HubTownHero {
  /** The file name, in content/<folder>/images/. */
  image: string;
  /** What is in the frame, where and when; '' while the file is awaited. */
  alt: string;
  /** CSS object-position, where the middle of the picture is the wrong crop for the band. */
  position?: string;
  /** The content folder the file is in, when not `hub`: a former guide's, for its own hero. */
  folder?: string;
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
      intro: 'What Estes Park puts on through the year, and the dates Rocky Mountain National Park sets beside it.',
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
      intro: 'Salida’s year on the Arkansas River: the festivals, the races and the dates the mountains set.',
      // Waiting for the owner's licensed photograph (12 November 2026): put
      // the file at content/hub/images/salida.jpg, write the alt here, add
      // its row to IMAGE_LICENSES.csv. Until then the page draws its peaks.
      hero: { image: 'salida.jpg', alt: '' },
    },
  },
  { slug: 'grand-lake', name: 'Grand Lake', counties: ['Grand'], cluster: 'Park gateway', guide: 'grand-lake', hero: { image: 'hero.jpg', folder: 'grand-lake', alt: 'A rainbow over the forested mountains above Grand Lake, with cabins and moored boats along the shore below' }, signature: { kind: 'fish-stocking', waters: [{ name: 'Grand Lake', ids: [83] }] } },
  { slug: 'nederland', name: 'Nederland', counties: ['Boulder'], cluster: 'Park gateway', guide: 'nederland', hero: { image: 'hero.jpg', folder: 'nederland', alt: 'Mountain People’s Co-op and the Rustic Moose on East First Street in Nederland, under a grey mountain sky', position: '50% 60%' }, signature: { kind: 'snowpack', station: { triplet: '564:CO:SNTL', name: 'Lake Eldora', elevationFt: 9700, page: 'https://wcc.sc.egov.usda.gov/nwcc/site?sitenum=564' } } },
  { slug: 'fort-collins', name: 'Fort Collins', counties: ['Larimer'], cluster: 'Front Range cities', guide: 'fortcollins', hero: { image: 'AdobeStock_419314122.jpeg', folder: 'fortcollins', alt: 'Old Town Square in Fort Collins on a summer afternoon in 2020: sandstone and brick buildings, string lights overhead, orange and blue café umbrellas, a flower bed, and children running through the splash pad', position: '50% 55%' }, signature: { kind: 'fish-stocking', waters: [{ name: 'Sheldon Lake', ids: [550] }, { name: 'Prospect Ponds', ids: [444] }, { name: 'Riverbend Ponds', ids: [437] }] } },
  { slug: 'longmont', name: 'Longmont', counties: ['Boulder', 'Weld'], cluster: 'Front Range cities', guide: 'longmont', hero: { image: 'main-street-at-third-avenue.jpg', folder: 'longmont', alt: 'Main Street at Third Avenue in downtown Longmont: the three-storey brick Imperial block on the corner, the Dickens Opera House on the right and the storefronts running north under a spring sky', position: '50% 45%' }, terrain: 'plains', signature: { kind: 'river-flow', gauge: { agency: 'DWR', id: 'SVCLOPCO', river: 'St. Vrain Creek', where: 'below Ken Pratt Boulevard at Longmont', page: 'https://dwr.state.co.us/Tools/Stations/SVCLOPCO' } } },
  { slug: 'loveland', name: 'Loveland', counties: ['Larimer'], cluster: 'Front Range cities', guide: 'loveland', hero: { image: 'AdobeStock_412335350.jpeg', folder: 'loveland', alt: 'Downtown Loveland from the air on a clear winter day: the brick blocks and new apartment buildings along the downtown streets, houses and bare trees all around, Lake Loveland beyond the rooftops and the foothills on the horizon', position: '50% 22%' }, signature: { kind: 'fish-stocking', waters: [{ name: 'North Lake Park Pond', ids: [794] }, { name: 'Lon Hagler Reservoir', ids: [450] }, { name: 'Jayhawker Ponds', ids: [1342] }] } },
  { slug: 'castle-rock', name: 'Castle Rock', counties: ['Douglas'], cluster: 'Front Range cities', guide: 'castle-rock', hero: { image: 'hero.jpg', folder: 'castle-rock', alt: 'Wilcox Street in downtown Castle Rock in winter: brick storefronts, parked cars and strings of lights crossing the street' }, terrain: 'mesa' },
  { slug: 'golden', name: 'Golden', counties: ['Jefferson'], cluster: 'Front Range cities', guide: 'golden', hero: { image: 'AdobeStock_504466744.jpeg', folder: 'golden', alt: 'Downtown Golden from the air on a hazy August morning in 2021: Washington Avenue running through the brick blocks under the Welcome to Golden arch, the rimrock of North Table Mountain above the town on the right, and the foothills beyond', position: '50% 15%' }, signature: { kind: 'river-flow', gauge: { agency: 'USGS', id: '06719505', river: 'Clear Creek', where: 'at Golden', page: 'https://waterdata.usgs.gov/monitoring-location/USGS-06719505/' } } },
  { slug: 'lafayette', name: 'Lafayette', counties: ['Boulder'], cluster: 'Front Range cities', guide: 'lafayette', hero: { image: 'hero.jpg', folder: 'lafayette', alt: 'East Simpson Street in Old Town Lafayette under snow in February 2018: a white wooden storefront with a bracketed cornice and a hanging sign on the right, cars parked along the plowed street, bare cottonwoods, and new brick-and-white townhouses on the left' }, signature: { kind: 'fish-stocking', waters: [{ name: 'Waneka Lake', ids: [410] }] } },
  { slug: 'louisville', name: 'Louisville', counties: ['Boulder'], cluster: 'Front Range cities', terrain: 'plains', hero: { image: 'louisville.jpg', alt: '' }, signature: { kind: 'fish-stocking', waters: [{ name: 'Harper Lake', ids: [523] }] } },
  { slug: 'timnath', name: 'Timnath', counties: ['Larimer', 'Weld'], cluster: 'Front Range and plains towns', guide: 'timnath', hero: { image: 'timnath.jpg', alt: '' }, signature: { kind: 'river-flow', gauge: { agency: 'USGS', id: '06752280', river: 'Cache la Poudre River', where: 'above Boxelder Creek near Timnath', page: 'https://waterdata.usgs.gov/monitoring-location/USGS-06752280/' } } },
  { slug: 'elizabeth', name: 'Elizabeth', counties: ['Elbert'], cluster: 'Front Range and plains towns', guide: 'elizabeth', hero: { image: 'hero.jpg', folder: 'elizabeth', alt: 'Main Street in Elizabeth, Colorado: the 1907 First National Bank building with its arched openings and the white false-front store beyond, under a clear winter sky' } },
  { slug: 'severance', name: 'Severance', counties: ['Weld'], cluster: 'Front Range and plains towns', guide: 'severance', hero: { image: 'hero.jpg', folder: 'severance', alt: 'Blue Spruce Pond in Severance at sunset: a fountain on the water, cottonwoods along the far bank and a pink and orange sky' }, signature: { kind: 'fish-stocking', waters: [{ name: 'Severance City Pond', ids: [824] }] } },
  { slug: 'mead', name: 'Mead', counties: ['Weld'], cluster: 'Front Range and plains towns', domain: 'insidemead.com', hero: { image: 'mead.jpg', alt: '' } },
  { slug: 'fort-lupton', name: 'Fort Lupton', counties: ['Weld'], cluster: 'Front Range and plains towns', guide: 'fort-lupton', hero: { image: 'hero.jpg', folder: 'fort-lupton', alt: 'Denver Avenue in Fort Lupton looking west, a Fort Lupton banner over the road and the snow-covered Front Range beyond the rooftops' }, signature: { kind: 'river-flow', gauge: { agency: 'USGS', id: '06721000', river: 'South Platte River', where: 'at Fort Lupton', page: 'https://waterdata.usgs.gov/monitoring-location/USGS-06721000/' } } },
  { slug: 'fort-morgan', name: 'Fort Morgan', counties: ['Morgan'], cluster: 'Front Range and plains towns', domain: 'insidefortmorgan.com', hero: { image: 'fort-morgan.jpg', alt: '' }, signature: { kind: 'river-flow', gauge: { agency: 'USGS', id: '06759500', river: 'South Platte River', where: 'at Fort Morgan', page: 'https://waterdata.usgs.gov/monitoring-location/USGS-06759500/' } } },
  { slug: 'evergreen', name: 'Evergreen', counties: ['Jefferson'], cluster: 'I-70 mountain', guide: 'evergreen', hero: { image: 'hero.jpg', folder: 'evergreen', alt: 'Downtown Evergreen on Highway 74: wooden storefronts with tin roofs and awnings, pickups parked along the boardwalk' }, terrain: 'foothills', signature: { kind: 'fish-stocking', waters: [{ name: 'Evergreen Lake', ids: [548] }] } },
  { slug: 'idaho-springs', name: 'Idaho Springs', counties: ['Clear Creek'], cluster: 'I-70 mountain', guide: 'idaho-springs', hero: { image: 'AdobeStock_413103868.jpeg', folder: 'idaho-springs', alt: 'Idaho Springs from the air on a January morning in 2021: the red Argo Gold Mine and Mill on the hillside at the right, Clear Creek and a riverside park below it, the town’s streets and houses climbing the canyon at the left, and dry, pine-dotted mountainsides all around', position: '50% 45%' } },
  { slug: 'georgetown', name: 'Georgetown', counties: ['Clear Creek'], cluster: 'I-70 mountain', guide: 'georgetown', hero: { image: 'hero.jpg', folder: 'georgetown', alt: 'Looking north over Georgetown from the hillside: the town fills the valley floor, with Georgetown Lake and Interstate 70 beyond between steep mountainsides' }, signature: { kind: 'fish-stocking', waters: [{ name: 'Georgetown Lake', ids: [469] }] } },
  { slug: 'black-hawk', name: 'Black Hawk', counties: ['Gilpin'], cluster: 'I-70 mountain', guide: 'black-hawk', hero: { image: 'hero.jpg', folder: 'black-hawk', alt: 'The Lace House in Black Hawk: a small Carpenter Gothic house with lacy white trim along its steep gable and porch, a flag on the porch and pines on the slope behind' } },
  { slug: 'frisco', name: 'Frisco', counties: ['Summit'], cluster: 'Summit County', hero: { image: 'frisco.jpg', alt: '' }, signature: { kind: 'fish-stocking', waters: [{ name: 'Dillon Reservoir', ids: [39] }] } },
  { slug: 'breckenridge', name: 'Breckenridge', counties: ['Summit'], cluster: 'Summit County', hero: { image: 'breckenridge.jpg', alt: '' }, signature: { kind: 'snowpack', station: { triplet: '415:CO:SNTL', name: 'Copper Mountain', elevationFt: 10500, page: 'https://wcc.sc.egov.usda.gov/nwcc/site?sitenum=415' } } },
  { slug: 'keystone', name: 'Keystone', counties: ['Summit'], cluster: 'Summit County', hero: { image: 'keystone.jpg', alt: '' } },
  { slug: 'buena-vista', name: 'Buena Vista', counties: ['Chaffee'], cluster: 'Arkansas valley', domain: 'insidebuenavista.com', hero: { image: 'buena-vista.jpg', alt: '' }, signature: { kind: 'river-flow', gauge: { agency: 'DWR', id: 'ARKGRNCO', river: 'Arkansas River', where: 'at Granite, about 16 miles upstream', page: 'https://dwr.state.co.us/Tools/Stations/ARKGRNCO' } } },
  { slug: 'leadville', name: 'Leadville', counties: ['Lake'], cluster: 'Arkansas valley', guide: 'leadville', hero: { image: 'AdobeStock_1111460584.jpeg', folder: 'leadville', alt: 'Harrison Avenue in Leadville from above on an October morning in 2023, looking up the street past a green copper cupola: Victorian brick and painted storefronts, aspens turning gold among the houses, and bare mountains on the horizon under white cloud', position: '50% 20%' }, signature: { kind: 'snowpack', station: { triplet: '485:CO:SNTL', name: 'Fremont Pass', elevationFt: 11310, page: 'https://wcc.sc.egov.usda.gov/nwcc/site?sitenum=485' } } },
  { slug: 'manitou-springs', name: 'Manitou Springs', counties: ['El Paso'], cluster: 'Pikes Peak', guide: 'manitou-springs', hero: { image: 'AdobeStock_357829842.jpeg', folder: 'manitou-springs', alt: 'Downtown Manitou Springs from the air on a June day in 2020: Manitou Avenue curving between brick and stone blocks and a church, houses among green trees on the slopes, red rock and a highway bridge above, and the mountains under summer cloud', position: '50% 66%' } },
  { slug: 'steamboat-springs', name: 'Steamboat Springs', counties: ['Routt'], cluster: 'Yampa valley', domain: 'insidesteamboatsprings.com', hero: { image: 'steamboat-springs.jpg', alt: '' }, signature: { kind: 'fish-stocking', waters: [{ name: 'Casey’s Pond', ids: [18] }, { name: 'Fetcher Pond', ids: [201] }, { name: 'Stagecoach Reservoir', ids: [362] }] } },
  { slug: 'grand-junction', name: 'Grand Junction', counties: ['Mesa'], cluster: 'Western Slope', domain: 'insidegrandjunction.com', hero: { image: 'grand-junction.jpg', alt: '' }, signature: { kind: 'river-flow', gauge: { agency: 'USGS', id: '09106485', river: 'Colorado River', where: 'at Grand Junction, above the Gunnison', page: 'https://waterdata.usgs.gov/monitoring-location/USGS-09106485/' } } },
  { slug: 'palisade', name: 'Palisade', counties: ['Mesa'], cluster: 'Western Slope', hero: { image: 'palisade.jpg', alt: '' } },
  { slug: 'fruita', name: 'Fruita', counties: ['Mesa'], cluster: 'Western Slope', hero: { image: 'fruita.jpg', alt: '' }, signature: { kind: 'fish-stocking', waters: [{ name: 'Fruita Red Rocks Lake', ids: [1611] }, { name: 'Snooks Bottom Lake', ids: [1615] }] } },
  { slug: 'carbondale', name: 'Carbondale', counties: ['Garfield'], cluster: 'Roaring Fork valley', hero: { image: 'carbondale.jpg', alt: '' }, signature: { kind: 'fish-stocking', waters: [{ name: 'Crystal River', ids: [1441] }] } },
  { slug: 'glenwood-springs', name: 'Glenwood Springs', counties: ['Garfield'], cluster: 'Roaring Fork valley', hero: { image: 'glenwood-springs.jpg', alt: '' } },
  { slug: 'crested-butte', name: 'Crested Butte', counties: ['Gunnison'], cluster: 'Gunnison valley', hero: { image: 'crested-butte.jpg', alt: '' }, signature: { kind: 'snowpack', station: { triplet: '380:CO:SNTL', name: 'Butte', elevationFt: 10190, page: 'https://wcc.sc.egov.usda.gov/nwcc/site?sitenum=380' } } },
  { slug: 'telluride', name: 'Telluride', counties: ['San Miguel'], cluster: 'Southwest', hero: { image: 'telluride.jpg', alt: '' } },
  { slug: 'ouray', name: 'Ouray', counties: ['Ouray'], cluster: 'Southwest', hero: { image: 'ouray.jpg', alt: '' }, signature: { kind: 'fish-stocking', waters: [{ name: 'Ridgway Reservoir', ids: [62] }] } },
  { slug: 'durango', name: 'Durango', counties: ['La Plata'], cluster: 'Southwest', hero: { image: 'durango.jpg', alt: '' }, signature: { kind: 'river-flow', gauge: { agency: 'USGS', id: '09361500', river: 'Animas River', where: 'at Durango', page: 'https://waterdata.usgs.gov/monitoring-location/USGS-09361500/' } } },
  // The towns of the owner's brief of 12 November 2026 (docs/additions-report.md):
  // each is a page from the day one named annual event of its own has a date
  // read on its organizer's page, and builds nothing until then. Counties are
  // the Census Bureau's (Vintage 2025 subcounty file, the county parts of each
  // place, the most populous first); Redstone is a census-designated place.
  { slug: 'vail', name: 'Vail', counties: ['Eagle'], cluster: 'Eagle valley', hero: { image: 'vail.jpg', alt: '' } },
  { slug: 'minturn', name: 'Minturn', counties: ['Eagle'], cluster: 'Eagle valley', hero: { image: 'minturn.jpg', alt: '' } },
  { slug: 'eagle', name: 'Eagle', counties: ['Eagle'], cluster: 'Eagle valley', hero: { image: 'eagle.jpg', alt: '' } },
  { slug: 'avon', name: 'Avon', counties: ['Eagle'], cluster: 'Eagle valley', hero: { image: 'avon.jpg', alt: '' } },
  { slug: 'dillon', name: 'Dillon', counties: ['Summit'], cluster: 'Summit County', hero: { image: 'dillon.jpg', alt: '' } },
  { slug: 'silverthorne', name: 'Silverthorne', counties: ['Summit'], cluster: 'Summit County', hero: { image: 'silverthorne.jpg', alt: '' } },
  { slug: 'winter-park', name: 'Winter Park', counties: ['Grand'], cluster: 'Grand County', hero: { image: 'winter-park.jpg', alt: '' } },
  { slug: 'fraser', name: 'Fraser', counties: ['Grand'], cluster: 'Grand County', hero: { image: 'fraser.jpg', alt: '' } },
  { slug: 'granby', name: 'Granby', counties: ['Grand'], cluster: 'Grand County', hero: { image: 'granby.jpg', alt: '' } },
  { slug: 'kremmling', name: 'Kremmling', counties: ['Grand'], cluster: 'Grand County', hero: { image: 'kremmling.jpg', alt: '' } },
  { slug: 'aspen', name: 'Aspen', counties: ['Pitkin'], cluster: 'Roaring Fork valley', hero: { image: 'aspen.jpg', alt: '' } },
  { slug: 'basalt', name: 'Basalt', counties: ['Eagle', 'Pitkin'], cluster: 'Roaring Fork valley', hero: { image: 'basalt.jpg', alt: '' } },
  { slug: 'redstone', name: 'Redstone', counties: ['Pitkin'], cluster: 'Roaring Fork valley', hero: { image: 'redstone.jpg', alt: '' } },
  { slug: 'marble', name: 'Marble', counties: ['Gunnison'], cluster: 'Roaring Fork valley', hero: { image: 'marble.jpg', alt: '' } },
  { slug: 'gunnison', name: 'Gunnison', counties: ['Gunnison'], cluster: 'Gunnison valley', hero: { image: 'gunnison.jpg', alt: '' } },
  { slug: 'lake-city', name: 'Lake City', counties: ['Hinsdale'], cluster: 'Gunnison valley', hero: { image: 'lake-city.jpg', alt: '' } },
  { slug: 'silverton', name: 'Silverton', counties: ['San Juan'], cluster: 'Southwest', hero: { image: 'silverton.jpg', alt: '' } },
  { slug: 'ridgway', name: 'Ridgway', counties: ['Ouray'], cluster: 'Southwest', hero: { image: 'ridgway.jpg', alt: '' } },
  { slug: 'pagosa-springs', name: 'Pagosa Springs', counties: ['Archuleta'], cluster: 'Southwest', hero: { image: 'pagosa-springs.jpg', alt: '' } },
  { slug: 'montrose', name: 'Montrose', counties: ['Montrose'], cluster: 'Southwest', terrain: 'mesa', hero: { image: 'montrose.jpg', alt: '' } },
  { slug: 'cortez', name: 'Cortez', counties: ['Montezuma'], cluster: 'Southwest', terrain: 'mesa', hero: { image: 'cortez.jpg', alt: '' } },
  { slug: 'mancos', name: 'Mancos', counties: ['Montezuma'], cluster: 'Southwest', terrain: 'mesa', hero: { image: 'mancos.jpg', alt: '' } },
  { slug: 'dolores', name: 'Dolores', counties: ['Montezuma'], cluster: 'Southwest', terrain: 'mesa', hero: { image: 'dolores.jpg', alt: '' } },
  { slug: 'paonia', name: 'Paonia', counties: ['Delta'], cluster: 'North Fork valley', hero: { image: 'paonia.jpg', alt: '' } },
  { slug: 'hotchkiss', name: 'Hotchkiss', counties: ['Delta'], cluster: 'North Fork valley', hero: { image: 'hotchkiss.jpg', alt: '' } },
  { slug: 'cedaredge', name: 'Cedaredge', counties: ['Delta'], cluster: 'Western Slope', hero: { image: 'cedaredge.jpg', alt: '' } },
  { slug: 'delta', name: 'Delta', counties: ['Delta'], cluster: 'Western Slope', hero: { image: 'delta.jpg', alt: '' } },
  { slug: 'olathe', name: 'Olathe', counties: ['Montrose'], cluster: 'Western Slope', hero: { image: 'olathe.jpg', alt: '' } },
  { slug: 'rifle', name: 'Rifle', counties: ['Garfield'], cluster: 'Western Slope', hero: { image: 'rifle.jpg', alt: '' } },
  { slug: 'meeker', name: 'Meeker', counties: ['Rio Blanco'], cluster: 'Western Slope', terrain: 'foothills', hero: { image: 'meeker.jpg', alt: '' } },
  { slug: 'craig', name: 'Craig', counties: ['Moffat'], cluster: 'Yampa valley', hero: { image: 'craig.jpg', alt: '' } },
  { slug: 'creede', name: 'Creede', counties: ['Mineral'], cluster: 'San Luis Valley', hero: { image: 'creede.jpg', alt: '' } },
  { slug: 'alamosa', name: 'Alamosa', counties: ['Alamosa'], cluster: 'San Luis Valley', hero: { image: 'alamosa.jpg', alt: '' } },
  { slug: 'monte-vista', name: 'Monte Vista', counties: ['Rio Grande'], cluster: 'San Luis Valley', hero: { image: 'monte-vista.jpg', alt: '' } },
  { slug: 'del-norte', name: 'Del Norte', counties: ['Rio Grande'], cluster: 'San Luis Valley', hero: { image: 'del-norte.jpg', alt: '' } },
  { slug: 'crestone', name: 'Crestone', counties: ['Saguache'], cluster: 'San Luis Valley', hero: { image: 'crestone.jpg', alt: '' } },
  { slug: 'fairplay', name: 'Fairplay', counties: ['Park'], cluster: 'South Park', hero: { image: 'fairplay.jpg', alt: '' } },
  { slug: 'alma', name: 'Alma', counties: ['Park'], cluster: 'South Park', hero: { image: 'alma.jpg', alt: '' } },
  { slug: 'canon-city', name: 'Cañon City', counties: ['Fremont'], cluster: 'Arkansas valley', terrain: 'foothills', hero: { image: 'canon-city.jpg', alt: '' } },
  { slug: 'florence', name: 'Florence', counties: ['Fremont'], cluster: 'Arkansas valley', terrain: 'foothills', hero: { image: 'florence.jpg', alt: '' } },
  { slug: 'westcliffe', name: 'Westcliffe', counties: ['Custer'], cluster: 'Arkansas valley', hero: { image: 'westcliffe.jpg', alt: '' } },
  { slug: 'cripple-creek', name: 'Cripple Creek', counties: ['Teller'], cluster: 'Pikes Peak', hero: { image: 'cripple-creek.jpg', alt: '' } },
  { slug: 'victor', name: 'Victor', counties: ['Teller'], cluster: 'Pikes Peak', hero: { image: 'victor.jpg', alt: '' } },
  { slug: 'woodland-park', name: 'Woodland Park', counties: ['Teller'], cluster: 'Pikes Peak', terrain: 'foothills', hero: { image: 'woodland-park.jpg', alt: '' } },
  { slug: 'green-mountain-falls', name: 'Green Mountain Falls', counties: ['El Paso', 'Teller'], cluster: 'Pikes Peak', hero: { image: 'green-mountain-falls.jpg', alt: '' } },
  { slug: 'palmer-lake', name: 'Palmer Lake', counties: ['El Paso'], cluster: 'Pikes Peak', terrain: 'foothills', hero: { image: 'palmer-lake.jpg', alt: '' } },
  { slug: 'trinidad', name: 'Trinidad', counties: ['Las Animas'], cluster: 'Southern Colorado', terrain: 'mesa', hero: { image: 'trinidad.jpg', alt: '' } },
  { slug: 'la-veta', name: 'La Veta', counties: ['Huerfano'], cluster: 'Southern Colorado', terrain: 'peaks', hero: { image: 'la-veta.jpg', alt: '' } },
  { slug: 'central-city', name: 'Central City', counties: ['Gilpin', 'Clear Creek'], cluster: 'I-70 mountain', hero: { image: 'central-city.jpg', alt: '' } },
  { slug: 'morrison', name: 'Morrison', counties: ['Jefferson'], cluster: 'I-70 mountain', terrain: 'foothills', hero: { image: 'morrison.jpg', alt: '' } },
  { slug: 'walden', name: 'Walden', counties: ['Jackson'], cluster: 'North Park', hero: { image: 'walden.jpg', alt: '' } },
  { slug: 'boulder', name: 'Boulder', counties: ['Boulder'], cluster: 'Front Range cities', hero: { image: 'boulder.jpg', alt: '' } },
  { slug: 'greeley', name: 'Greeley', counties: ['Weld'], cluster: 'Front Range cities', terrain: 'plains', hero: { image: 'greeley.jpg', alt: '' } },
  { slug: 'milliken', name: 'Milliken', counties: ['Weld'], cluster: 'Front Range and plains towns', hero: { image: 'milliken.jpg', alt: '' } },
  { slug: 'wellington', name: 'Wellington', counties: ['Larimer'], cluster: 'Front Range and plains towns', hero: { image: 'wellington.jpg', alt: '' } },
  { slug: 'platteville', name: 'Platteville', counties: ['Weld'], cluster: 'Front Range and plains towns', hero: { image: 'platteville.jpg', alt: '' } },
  { slug: 'brush', name: 'Brush', counties: ['Morgan'], cluster: 'Front Range and plains towns', hero: { image: 'brush.jpg', alt: '' } },
  { slug: 'sterling', name: 'Sterling', counties: ['Logan'], cluster: 'Front Range and plains towns', hero: { image: 'sterling.jpg', alt: '' } },
  { slug: 'rocky-ford', name: 'Rocky Ford', counties: ['Otero'], cluster: 'Eastern plains', hero: { image: 'rocky-ford.jpg', alt: '' } },
  { slug: 'la-junta', name: 'La Junta', counties: ['Otero'], cluster: 'Eastern plains', hero: { image: 'la-junta.jpg', alt: '' } },
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

/** A town page's photograph entry: its own `hero`, else a showpiece's. Whether the file is there is the caller's question. */
export function heroOf(town: HubTown): HubTownHero | undefined {
  return town.hero ?? town.showpiece?.hero;
}

/** Where a town page's photograph is in the repository, as IMAGE_LICENSES.csv names it. */
export function heroPath(hero: HubTownHero): string {
  return `content/${hero.folder ?? 'hub'}/images/${hero.image}`;
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
