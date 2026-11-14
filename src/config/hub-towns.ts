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
  { slug: 'louisville', name: 'Louisville', counties: ['Boulder'], cluster: 'Front Range cities', terrain: 'plains', hero: { image: 'louisville.jpg', alt: 'The Tego Brothers Drugstore–State National Bank building at 700 Main Street in Louisville in 2011: a lilac-painted corner block with green awnings, a restaurant in its ground floor, a street lamp and young trees along the sidewalk under a clear sky', position: '50% 65%' }, signature: { kind: 'fish-stocking', waters: [{ name: 'Harper Lake', ids: [523] }] } },
  { slug: 'timnath', name: 'Timnath', counties: ['Larimer', 'Weld'], cluster: 'Front Range and plains towns', guide: 'timnath', hero: { image: 'timnath.jpg', alt: '' }, signature: { kind: 'river-flow', gauge: { agency: 'USGS', id: '06752280', river: 'Cache la Poudre River', where: 'above Boxelder Creek near Timnath', page: 'https://waterdata.usgs.gov/monitoring-location/USGS-06752280/' } } },
  { slug: 'elizabeth', name: 'Elizabeth', counties: ['Elbert'], cluster: 'Front Range and plains towns', guide: 'elizabeth', hero: { image: 'hero.jpg', folder: 'elizabeth', alt: 'Main Street in Elizabeth, Colorado: the 1907 First National Bank building with its arched openings and the white false-front store beyond, under a clear winter sky' } },
  { slug: 'severance', name: 'Severance', counties: ['Weld'], cluster: 'Front Range and plains towns', guide: 'severance', hero: { image: 'hero.jpg', folder: 'severance', alt: 'Blue Spruce Pond in Severance at sunset: a fountain on the water, cottonwoods along the far bank and a pink and orange sky' }, signature: { kind: 'fish-stocking', waters: [{ name: 'Severance City Pond', ids: [824] }] } },
  { slug: 'mead', name: 'Mead', counties: ['Weld'], cluster: 'Front Range and plains towns', domain: 'insidemead.com', hero: { image: 'mead.jpg', alt: 'Main Street in Mead in 2012: a brick bank building with a street clock on the left, a stone “Welcome to Historic Old Town Mead” sign on the right, and a row of low shopfronts with blue awnings further down the street under a grey sky', position: '50% 90%' } },
  { slug: 'fort-lupton', name: 'Fort Lupton', counties: ['Weld'], cluster: 'Front Range and plains towns', guide: 'fort-lupton', hero: { image: 'hero.jpg', folder: 'fort-lupton', alt: 'Denver Avenue in Fort Lupton looking west, a Fort Lupton banner over the road and the snow-covered Front Range beyond the rooftops' }, signature: { kind: 'river-flow', gauge: { agency: 'USGS', id: '06721000', river: 'South Platte River', where: 'at Fort Lupton', page: 'https://waterdata.usgs.gov/monitoring-location/USGS-06721000/' } } },
  { slug: 'fort-morgan', name: 'Fort Morgan', counties: ['Morgan'], cluster: 'Front Range and plains towns', domain: 'insidefortmorgan.com', hero: { image: 'fort-morgan.jpg', alt: 'Aerial view of Fort Morgan in June 2017: the town’s street grid set among square and circular irrigated fields, with the railway, the interstate and the wooded South Platte River running across the top of the frame' }, signature: { kind: 'river-flow', gauge: { agency: 'USGS', id: '06759500', river: 'South Platte River', where: 'at Fort Morgan', page: 'https://waterdata.usgs.gov/monitoring-location/USGS-06759500/' } } },
  { slug: 'evergreen', name: 'Evergreen', counties: ['Jefferson'], cluster: 'I-70 mountain', guide: 'evergreen', hero: { image: 'hero.jpg', folder: 'evergreen', alt: 'Downtown Evergreen on Highway 74: wooden storefronts with tin roofs and awnings, pickups parked along the boardwalk' }, terrain: 'foothills', signature: { kind: 'fish-stocking', waters: [{ name: 'Evergreen Lake', ids: [548] }] } },
  { slug: 'idaho-springs', name: 'Idaho Springs', counties: ['Clear Creek'], cluster: 'I-70 mountain', guide: 'idaho-springs', hero: { image: 'AdobeStock_413103868.jpeg', folder: 'idaho-springs', alt: 'Idaho Springs from the air on a January morning in 2021: the red Argo Gold Mine and Mill on the hillside at the right, Clear Creek and a riverside park below it, the town’s streets and houses climbing the canyon at the left, and dry, pine-dotted mountainsides all around', position: '50% 45%' } },
  { slug: 'georgetown', name: 'Georgetown', counties: ['Clear Creek'], cluster: 'I-70 mountain', guide: 'georgetown', hero: { image: 'hero.jpg', folder: 'georgetown', alt: 'Looking north over Georgetown from the hillside: the town fills the valley floor, with Georgetown Lake and Interstate 70 beyond between steep mountainsides' }, signature: { kind: 'fish-stocking', waters: [{ name: 'Georgetown Lake', ids: [469] }] } },
  { slug: 'black-hawk', name: 'Black Hawk', counties: ['Gilpin'], cluster: 'I-70 mountain', guide: 'black-hawk', hero: { image: 'hero.jpg', folder: 'black-hawk', alt: 'The Lace House in Black Hawk: a small Carpenter Gothic house with lacy white trim along its steep gable and porch, a flag on the porch and pines on the slope behind' } },
  { slug: 'frisco', name: 'Frisco', counties: ['Summit'], cluster: 'Summit County', hero: { image: 'frisco.jpg', alt: 'Tenmile Creek running through Frisco in 2016: dark water over stones between snow-covered banks, bare willows and pines on either side, and two snow-streaked rocky peaks against a clear blue sky', position: '50% 15%' }, signature: { kind: 'fish-stocking', waters: [{ name: 'Dillon Reservoir', ids: [39] }] } },
  { slug: 'breckenridge', name: 'Breckenridge', counties: ['Summit'], cluster: 'Summit County', hero: { image: 'breckenridge.jpg', alt: 'Breckenridge at dusk in 2022 from the top of Bald Mountain: the town’s lights scattered along the dark valley floor, blue mountain ridges beyond, and a sunset sky streaked orange and violet above them', position: '50% 30%' }, signature: { kind: 'snowpack', station: { triplet: '415:CO:SNTL', name: 'Copper Mountain', elevationFt: 10500, page: 'https://wcc.sc.egov.usda.gov/nwcc/site?sitenum=415' } } },
  { slug: 'keystone', name: 'Keystone', counties: ['Summit'], cluster: 'Summit County', hero: { image: 'keystone.jpg', alt: 'Keystone at dusk in winter 2011: snow-covered lodges and townhomes with lit windows and Christmas-lit trees, and the floodlit ski runs climbing the dark mountain behind' } },
  { slug: 'buena-vista', name: 'Buena Vista', counties: ['Chaffee'], cluster: 'Arkansas valley', domain: 'insidebuenavista.com', hero: { image: 'buena-vista.jpg', alt: 'The red-brick Town Hall on the corner in Buena Vista in autumn 2017, beside a two-storey brick block with a saloon sign, under a pale blue sky with a mountain ridge just visible at the far left' }, signature: { kind: 'river-flow', gauge: { agency: 'DWR', id: 'ARKGRNCO', river: 'Arkansas River', where: 'at Granite, about 16 miles upstream', page: 'https://dwr.state.co.us/Tools/Stations/ARKGRNCO' } } },
  { slug: 'leadville', name: 'Leadville', counties: ['Lake'], cluster: 'Arkansas valley', guide: 'leadville', hero: { image: 'AdobeStock_1111460584.jpeg', folder: 'leadville', alt: 'Harrison Avenue in Leadville from above on an October morning in 2023, looking up the street past a green copper cupola: Victorian brick and painted storefronts, aspens turning gold among the houses, and bare mountains on the horizon under white cloud', position: '50% 20%' }, signature: { kind: 'snowpack', station: { triplet: '485:CO:SNTL', name: 'Fremont Pass', elevationFt: 11310, page: 'https://wcc.sc.egov.usda.gov/nwcc/site?sitenum=485' } } },
  { slug: 'manitou-springs', name: 'Manitou Springs', counties: ['El Paso'], cluster: 'Pikes Peak', guide: 'manitou-springs', hero: { image: 'AdobeStock_357829842.jpeg', folder: 'manitou-springs', alt: 'Downtown Manitou Springs from the air on a June day in 2020: Manitou Avenue curving between brick and stone blocks and a church, houses among green trees on the slopes, red rock and a highway bridge above, and the mountains under summer cloud', position: '50% 66%' } },
  { slug: 'steamboat-springs', name: 'Steamboat Springs', counties: ['Routt'], cluster: 'Yampa valley', domain: 'insidesteamboatsprings.com', hero: { image: 'steamboat-springs.jpg', alt: 'Lincoln Avenue in downtown Steamboat Springs in September 2016: brick storefronts on the left, cars along the curbs and traffic lights over the wet street, trees on the right, and the ski runs of Mount Werner lit by low sun above the town', position: '50% 20%' }, signature: { kind: 'fish-stocking', waters: [{ name: 'Casey’s Pond', ids: [18] }, { name: 'Fetcher Pond', ids: [201] }, { name: 'Stagecoach Reservoir', ids: [362] }] } },
  { slug: 'grand-junction', name: 'Grand Junction', counties: ['Mesa'], cluster: 'Western Slope', domain: 'insidegrandjunction.com', hero: { image: 'grand-junction.jpg', alt: 'Grand Junction under storm clouds in 2009, seen across a sandstone bluff and juniper scrub: the city’s tallest buildings rise from the trees of the valley, with a long line of desert cliffs on the horizon' }, signature: { kind: 'river-flow', gauge: { agency: 'USGS', id: '09106485', river: 'Colorado River', where: 'at Grand Junction, above the Gunnison', page: 'https://waterdata.usgs.gov/monitoring-location/USGS-09106485/' } } },
  { slug: 'palisade', name: 'Palisade', counties: ['Mesa'], cluster: 'Western Slope', hero: { image: 'palisade.jpg', alt: 'Palisade and the Colorado River valley from the Palisade Rim Trail in summer 2019: orchards and vineyards on both banks of the river, the town beyond, and sheer tan cliffs rising on the right' } },
  { slug: 'fruita', name: 'Fruita', counties: ['Mesa'], cluster: 'Western Slope', hero: { image: 'fruita.jpg', alt: 'Fruita and the Grand Valley seen from the Colorado National Monument: sandstone towers and canyon walls in front, the town and its farmland spread across the valley floor, and a hazy line of cliffs beyond' }, signature: { kind: 'fish-stocking', waters: [{ name: 'Fruita Red Rocks Lake', ids: [1611] }, { name: 'Snooks Bottom Lake', ids: [1615] }] } },
  { slug: 'carbondale', name: 'Carbondale', counties: ['Garfield'], cluster: 'Roaring Fork valley', hero: { image: 'carbondale.jpg', alt: 'Carbondale from Red Hill in late spring 2013: the town’s streets and rooftops spread among green trees and hayfields on the valley floor, with the snow-capped summit of Mount Sopris rising behind under a clear blue sky', position: '65% 25%' }, signature: { kind: 'fish-stocking', waters: [{ name: 'Crystal River', ids: [1441] }] } },
  { slug: 'glenwood-springs', name: 'Glenwood Springs', counties: ['Garfield'], cluster: 'Roaring Fork valley', hero: { image: 'glenwood-springs.jpg', alt: 'Glenwood Springs from the air on a summer day in 2024: the river, the interstate and the railway curving along the valley floor between green mountain slopes, with neighborhoods and shopping centers along the banks' } },
  { slug: 'crested-butte', name: 'Crested Butte', counties: ['Gunnison'], cluster: 'Gunnison valley', hero: { image: 'crested-butte.jpg', alt: 'Elk Avenue in Crested Butte on a September morning in 2014: Victorian false-front storefronts painted green, cream and red along the street, autumn-yellow trees, and Mount Crested Butte under its first dusting of snow beneath heavy grey clouds' }, signature: { kind: 'snowpack', station: { triplet: '380:CO:SNTL', name: 'Butte', elevationFt: 10190, page: 'https://wcc.sc.egov.usda.gov/nwcc/site?sitenum=380' } } },
  { slug: 'telluride', name: 'Telluride', counties: ['San Miguel'], cluster: 'Southwest', hero: { image: 'telluride.jpg', alt: 'Telluride’s main street in summer 2014: Victorian brick and painted storefronts on both sides, a town shuttle bus among the parked cars, red flowers in the foreground and the steep green and rock walls of the box canyon behind', position: '50% 72%' } },
  { slug: 'ouray', name: 'Ouray', counties: ['Ouray'], cluster: 'Southwest', hero: { image: 'ouray.jpg', alt: 'Ouray from Highway 550 looking north in autumn 2010: the town’s grid of houses and the downtown blocks filling the valley floor among yellowing trees, between steep red-rock canyon walls under a clear blue sky', position: '50% 65%' }, signature: { kind: 'fish-stocking', waters: [{ name: 'Ridgway Reservoir', ids: [62] }] } },
  { slug: 'durango', name: 'Durango', counties: ['La Plata'], cluster: 'Southwest', hero: { image: 'durango.jpg', alt: 'Durango from the air in autumn 2025: the railroad yard and roundhouse beside the highway in the foreground, downtown’s blocks stretching up the valley behind, trees turning red and gold, and mesas and forested hills beyond' }, signature: { kind: 'river-flow', gauge: { agency: 'USGS', id: '09361500', river: 'Animas River', where: 'at Durango', page: 'https://waterdata.usgs.gov/monitoring-location/USGS-09361500/' } } },
  // The towns of the owner's brief of 12 November 2026 (docs/additions-report.md):
  // each is a page from the day one named annual event of its own has a date
  // read on its organizer's page, and builds nothing until then. Counties are
  // the Census Bureau's (Vintage 2025 subcounty file, the county parts of each
  // place, the most populous first); Redstone is a census-designated place.
  { slug: 'vail', name: 'Vail', counties: ['Eagle'], cluster: 'Eagle valley', hero: { image: 'vail.jpg', alt: 'Gore Creek Drive in Vail Village in summer 2009: a pedestrian street of chalet-style buildings hung with flower baskets and flags, people strolling, and the jagged Gore Range peaks rising beyond', position: '50% 30%' } },
  { slug: 'minturn', name: 'Minturn', counties: ['Eagle'], cluster: 'Eagle valley', hero: { image: 'minturn.jpg', alt: 'Pine Street in Minturn looking northwest in autumn: parked cars and houses with red, grey and green roofs along the street, and above them the silver water tank lettered MINTURN on a hillside of bare aspens and pines', position: '50% 35%' } },
  { slug: 'eagle', name: 'Eagle', counties: ['Eagle'], cluster: 'Eagle valley', hero: { image: 'eagle.jpg', alt: 'The Eagle River running shallow and quick over boulders through Chambers Park in the town of Eagle in autumn, with yellow cottonwoods on the banks and a steel railroad bridge across the river behind', position: '50% 30%' } },
  { slug: 'avon', name: 'Avon', counties: ['Eagle'], cluster: 'Eagle valley', hero: { image: 'avon.jpg', alt: 'Nottingham Lake in Avon in autumn: a bench on a flagstone path at the water’s edge, golden grasses on the shore, and condominiums among spruces and yellow trees across the lake below the dry sage-covered hills', position: '50% 42%' } },
  { slug: 'dillon', name: 'Dillon', counties: ['Summit'], cluster: 'Summit County', hero: { image: 'dillon.jpg', alt: 'The renovated Dillon Amphitheater on the shore of Dillon Reservoir in August 2022: the stone-sided stage and curved terraces of seating, with the lake on the left and Buffalo Mountain under a cloudy summer sky', position: '50% 70%' } },
  { slug: 'silverthorne', name: 'Silverthorne', counties: ['Summit'], cluster: 'Summit County', hero: { image: 'silverthorne.jpg', alt: 'Silverthorne from a nearby mountainside in July 2011: houses and condominiums among green meadows and ponds in the valley floor, with snow-streaked peaks under a heavy grey sky beyond', position: '50% 40%' } },
  { slug: 'winter-park', name: 'Winter Park', counties: ['Grand'], cluster: 'Grand County', hero: { image: 'winter-park.jpg', alt: 'Downtown Winter Park on a summer day: Deno’s Mountain Bistro with its patio of striped umbrellas, a liquor store and log-trimmed shops along the highway, with snow-capped peaks under a clear blue sky' } },
  { slug: 'fraser', name: 'Fraser', counties: ['Grand'], cluster: 'Grand County', hero: { image: 'fraser.jpg', alt: 'The Fraser River winding through autumn willows and brush in Fraser, seen from a footbridge near the Cozens Ranch Museum, with spruces, stone pillars and the town’s rooftops on the hillside beyond under a clear sky' } },
  { slug: 'granby', name: 'Granby', counties: ['Grand'], cluster: 'Grand County', hero: { image: 'granby.jpg', alt: 'Agate Avenue, U.S. Route 40, through downtown Granby in late May 2026: shops and fresh green trees along both sides, street lamps and banners, and a forested hill under heavy grey clouds beyond', position: '50% 70%' } },
  { slug: 'kremmling', name: 'Kremmling', counties: ['Grand'], cluster: 'Grand County', hero: { image: 'kremmling.jpg', alt: 'Kremmling from Colorado State Highway 9 just south of town: fenced sage and hay meadows and a bend of river in front, the town spread along the foot of a long pale cliff, and a snow-dusted peak on the right' } },
  { slug: 'aspen', name: 'Aspen', counties: ['Pitkin'], cluster: 'Roaring Fork valley', hero: { image: 'aspen.jpg', alt: 'Galena Street in downtown Aspen in summertime: the red sandstone Brand Building of 1891 with flower boxes and shop awnings on the corner, brick blocks beyond, and the green ski runs of Aspen Mountain rising above' } },
  { slug: 'basalt', name: 'Basalt', counties: ['Eagle', 'Pitkin'], cluster: 'Roaring Fork valley', hero: { image: 'basalt.jpg', alt: 'Midland Avenue in downtown Basalt in summer 2009: a row of brick and clapboard storefronts, among them a red-brick bar and restaurant, with young trees along the curb, cars parked in front and a motorcycle passing' } },
  { slug: 'redstone', name: 'Redstone', counties: ['Pitkin'], cluster: 'Roaring Fork valley', hero: { image: 'redstone.jpg', alt: 'The Redstone Inn on a summer day: the long lodge with red roofs, a clock tower and half-timbered gables among dark evergreens, cars parked along the curving drive in front, the inn’s sign on the lawn at right and white clouds in a deep blue sky' } },
  { slug: 'marble', name: 'Marble', counties: ['Gunnison'], cluster: 'Roaring Fork valley', hero: { image: 'marble.jpg', alt: '' } },
  { slug: 'gunnison', name: 'Gunnison', counties: ['Gunnison'], cluster: 'Gunnison valley', hero: { image: 'gunnison.jpg', alt: 'Main Street in Gunnison just north of Tomichi Avenue in 2019: a row of painted two-storey storefronts on the left, a wide sidewalk with benches on the right and cars parked along the street under a grey sky' } },
  { slug: 'lake-city', name: 'Lake City', counties: ['Hinsdale'], cluster: 'Gunnison valley', hero: { image: 'lake-city.jpg', alt: 'Silver Street in Lake City in 2017: pickups parked along the wide street, old brick and wooden buildings among tall spruce and cottonwood trees, and forested mountains rising at the end of the town' } },
  { slug: 'silverton', name: 'Silverton', counties: ['San Juan'], cluster: 'Southwest', hero: { image: 'silverton.jpg', alt: 'Downtown Silverton in summer 2009: a row of colourful Victorian false-front and brick buildings with parked cars along the wide street, and forested mountainsides and snow-streaked peaks rising right behind the town' } },
  { slug: 'ridgway', name: 'Ridgway', counties: ['Ouray'], cluster: 'Southwest', hero: { image: 'ridgway.jpg', alt: 'Ridgway and the Uncompahgre River valley in spring 2020, seen from State Highway 62 above the town: low roofs and leafing trees on the valley floor, piñon-covered slopes in front and the snowy San Juan peaks behind', position: '50% 57%' } },
  { slug: 'pagosa-springs', name: 'Pagosa Springs', counties: ['Archuleta'], cluster: 'Southwest', hero: { image: 'pagosa-springs.jpg', alt: 'Hot-air balloons from the Colorfest mass ascension rising over the San Juan River in Pagosa Springs on a September morning in 2019: spectators on the gravel bank, a geodesic greenhouse dome in the riverside park, and pine-covered hills under a clear blue sky' } },
  { slug: 'montrose', name: 'Montrose', counties: ['Montrose'], cluster: 'Southwest', terrain: 'mesa', hero: { image: 'montrose.jpg', alt: 'A downtown street in Montrose at dusk in 2013: lamps lit along the sidewalks, leafy trees and brick and pink-painted storefronts on both sides, and the empty road running off under a deep blue sky' } },
  { slug: 'cortez', name: 'Cortez', counties: ['Montezuma'], cluster: 'Southwest', terrain: 'mesa', hero: { image: 'cortez.jpg', alt: 'Main Street (US 160) at Chestnut Street in downtown Cortez in 2010: a row of sandstone and brick storefronts with green and red awnings, traffic lights over the wide street and dark storm clouds building above' } },
  { slug: 'mancos', name: 'Mancos', counties: ['Montezuma'], cluster: 'Southwest', terrain: 'mesa', hero: { image: 'mancos.jpg', alt: 'The 1905 Bauer Bank Block on a corner of downtown Mancos in 2015: a two-storey red brick and sandstone building with green trim, the Bakery Cafe and a gifts and gallery shop at street level, under a blue sky', position: '50% 35%' } },
  { slug: 'dolores', name: 'Dolores', counties: ['Montezuma'], cluster: 'Southwest', terrain: 'mesa', hero: { image: 'dolores.jpg', alt: 'Dolores from the air in 2014: the small town strung along a wooded valley floor, with the highway running through it and patchwork fields and piñon-covered mesas spreading out on every side', position: '50% 72%' } },
  { slug: 'paonia', name: 'Paonia', counties: ['Delta'], cluster: 'North Fork valley', hero: { image: 'paonia.jpg', alt: 'Paonia from the air in spring 2025: the low brick and white-roofed blocks of downtown along the main street, houses among bare cottonwoods around them, and the snow-capped West Elk peaks under a deep blue sky beyond' } },
  { slug: 'hotchkiss', name: 'Hotchkiss', counties: ['Delta'], cluster: 'North Fork valley', hero: { image: 'hotchkiss.jpg', alt: 'East Bridge Street (State Highway 92) in downtown Hotchkiss in early spring 2013: brick storefronts and bare trees on both sides, parked cars along the curb, and snow-covered Mount Lamborn rising at the end of the street', position: '50% 40%' } },
  { slug: 'cedaredge', name: 'Cedaredge', counties: ['Delta'], cluster: 'Western Slope', hero: { image: 'cedaredge.jpg', alt: '' } },
  { slug: 'delta', name: 'Delta', counties: ['Delta'], cluster: 'Western Slope', hero: { image: 'delta.jpg', alt: 'The 1892 Delta County Bank Building with its corner tower at Main and Third streets in downtown Delta in 2013: red brick and stone, green awnings, bare trees and traffic lights over the empty crossing', position: '50% 20%' } },
  { slug: 'olathe', name: 'Olathe', counties: ['Montrose'], cluster: 'Western Slope', hero: { image: 'olathe.jpg', alt: '' } },
  { slug: 'rifle', name: 'Rifle', counties: ['Garfield'], cluster: 'Western Slope', hero: { image: 'rifle.jpg', alt: 'Railroad Avenue in downtown Rifle looking north in 2017: brick and stucco storefronts and traffic lights at Third Street, with part of the Grand Hogback on the horizon under a blue sky' } },
  { slug: 'meeker', name: 'Meeker', counties: ['Rio Blanco'], cluster: 'Western Slope', terrain: 'foothills', hero: { image: 'meeker.jpg', alt: 'Meeker from the air in November 2010: the town’s grid of streets spread at the foot of steep, eroded bluffs, with a river winding through the hayfields in front', position: '50% 62%' } },
  { slug: 'craig', name: 'Craig', counties: ['Moffat'], cluster: 'Yampa valley', hero: { image: 'craig.jpg', alt: 'Yampa Avenue in downtown Craig in fall 2019, seen low from the centre line: pickups parked beneath leafy street trees on both sides and storefronts running off toward a traffic light under a deep blue sky' } },
  { slug: 'creede', name: 'Creede', counties: ['Mineral'], cluster: 'San Luis Valley', hero: { image: 'creede.jpg', alt: 'Main Street in Creede on a summer day in 2017: brightly painted storefronts and parked cars on both sides of the street, which runs straight toward the towering rock cliffs that close off the head of the canyon' } },
  { slug: 'alamosa', name: 'Alamosa', counties: ['Alamosa'], cluster: 'San Luis Valley', hero: { image: 'alamosa.jpg', alt: 'Downtown Alamosa from above in autumn: brick blocks and parking lots beside the railway, a freight train on the tracks, yellowing cottonwoods, and the San Luis Valley stretching to mountains beyond' } },
  { slug: 'monte-vista', name: 'Monte Vista', counties: ['Rio Grande'], cluster: 'San Luis Valley', hero: { image: 'monte-vista.jpg', alt: 'The main street of the Monte Vista Downtown Historic District on a winter evening: stone and brick storefronts with awnings, holiday garlands on the lampposts and snow along the curbs under a pink sky' } },
  { slug: 'del-norte', name: 'Del Norte', counties: ['Rio Grande'], cluster: 'San Luis Valley', hero: { image: 'del-norte.jpg', alt: 'The two-storey brick Windsor Hotel at 605 Grand Avenue in Del Norte, its long rows of arched windows lit by low sun, with pickups parked along the street' } },
  { slug: 'crestone', name: 'Crestone', counties: ['Saguache'], cluster: 'San Luis Valley', hero: { image: 'crestone.jpg', alt: 'Crestone Town Hall on Galena Street, a weathered grey clapboard former bank building with a wooden porch, balcony and flags, under tall trees on a summer day' } },
  { slug: 'fairplay', name: 'Fairplay', counties: ['Park'], cluster: 'South Park', hero: { image: 'fairplay.jpg', alt: 'The historic 1874 Park County Courthouse in Fairplay, a two-storey sandstone building with a stone stair, and the stone jail beside it, on a lawn under a clear autumn sky', position: '70% 20%' } },
  { slug: 'alma', name: 'Alma', counties: ['Park'], cluster: 'South Park', hero: { image: 'alma.jpg', alt: 'Alma Town Hall on East Buckskin Street, a long ochre former school with a red tile roof and central tower, framed by spruce trees below a forested ridge in summer' } },
  { slug: 'canon-city', name: 'Cañon City', counties: ['Fremont'], cluster: 'Arkansas valley', terrain: 'foothills', hero: { image: 'canon-city.jpg', alt: 'The McClure House, also called the Strathmore Hotel, at 331 Main Street in Cañon City in 2012: a three-storey red-brick block with rows of arched windows and shopfronts at street level, under a clear blue sky', position: '50% 10%' } },
  { slug: 'florence', name: 'Florence', counties: ['Fremont'], cluster: 'Arkansas valley', terrain: 'foothills', hero: { image: 'florence.jpg', alt: 'Main Street in Florence’s downtown historic district in late autumn 2017: old brick commercial blocks and pickups parked on the right, traffic lights over the street and bare trees running toward the hills', position: '50% 70%' } },
  { slug: 'westcliffe', name: 'Westcliffe', counties: ['Custer'], cluster: 'Arkansas valley', hero: { image: 'westcliffe.jpg', alt: 'Main Street in Westcliffe looking west from Third Street in September 2006: low wooden storefronts and parked cars under tall trees, with mountains under dark storm clouds at the far left' } },
  { slug: 'cripple-creek', name: 'Cripple Creek', counties: ['Teller'], cluster: 'Pikes Peak', hero: { image: 'cripple-creek.jpg', alt: 'Bennett Avenue in Cripple Creek in January 2009, looking east down the hill into town: red-brick blocks lit by low sun on both sides of the street, parked cars in the foreground, and snow-patched hills rising behind the town under a grey-blue sky' } },
  { slug: 'victor', name: 'Victor', counties: ['Teller'], cluster: 'Pikes Peak', hero: { image: 'victor.jpg', alt: 'Victor’s red-brick City Hall and fire station with its white clock tower, beside a painted ‘Welcome to Victor’ mural, against a pine-dotted hillside under a summer sky in the downtown historic district', position: '50% 12%' } },
  { slug: 'woodland-park', name: 'Woodland Park', counties: ['Teller'], cluster: 'Pikes Peak', terrain: 'foothills', hero: { image: 'woodland-park.jpg', alt: 'West Midland Avenue in Woodland Park looking east in late August: parked cars and tall pines along the street, power poles running downhill to the town centre and forested hills rising behind', position: '50% 75%' } },
  { slug: 'green-mountain-falls', name: 'Green Mountain Falls', counties: ['El Paso', 'Teller'], cluster: 'Pikes Peak', hero: { image: 'green-mountain-falls.jpg', alt: '' } },
  { slug: 'palmer-lake', name: 'Palmer Lake', counties: ['El Paso'], cluster: 'Pikes Peak', terrain: 'foothills', hero: { image: 'palmer-lake.jpg', alt: 'A general view of Palmer Lake in early spring 2023: houses spread up the slopes below brown, pine-dotted hills, with an open field and the railroad tracks running across the foreground under a blue sky' } },
  { slug: 'trinidad', name: 'Trinidad', counties: ['Las Animas'], cluster: 'Southern Colorado', terrain: 'mesa', hero: { image: 'trinidad.jpg', alt: 'Downtown Trinidad from above in early spring: red-brick commercial blocks and a church spire along the main streets, bare trees, and the town spreading out to mesas on the horizon' } },
  { slug: 'la-veta', name: 'La Veta', counties: ['Huerfano'], cluster: 'Southern Colorado', terrain: 'peaks', hero: { image: 'la-veta.jpg', alt: 'La Veta from a rise east of town: houses among green trees and dirt lanes, open grassland beyond, and Mount Mestas rising on the right under a clear blue sky' } },
  { slug: 'central-city', name: 'Central City', counties: ['Gilpin', 'Clear Creek'], cluster: 'I-70 mountain', hero: { image: 'central-city.jpg', alt: 'Main Street in downtown Central City in summer 2023, looking south from Eureka and Lawrence Streets: Victorian brick and painted storefronts on both sides, the Century Casino on the left, flags and lamp posts, and pine-covered hills beyond' } },
  { slug: 'morrison', name: 'Morrison', counties: ['Jefferson'], cluster: 'I-70 mountain', terrain: 'foothills', hero: { image: 'morrison.jpg', alt: 'Morrison from the hillside above in autumn: the main street running through yellow cottonwoods, with the red sandstone fins of the foothills and a dry grassy ridge rising behind the town' } },
  { slug: 'walden', name: 'Walden', counties: ['Jackson'], cluster: 'North Park', hero: { image: 'walden.jpg', alt: 'Main Street in Walden on a summer day: a Goodyear service garage and a blue auto parts store on the left, false-fronted buildings and a moose statue farther down, and white clouds over the open North Park sky' } },
  { slug: 'boulder', name: 'Boulder', counties: ['Boulder'], cluster: 'Front Range cities', hero: { image: 'boulder.jpg', alt: 'Pearl Street in downtown Boulder between 14th and 15th Street on a sunny February day in 2023: brick paving, bare trees, snow heaped in the planters, and two- and three-storey brick shopfronts with globe street lamps and banners' } },
  { slug: 'greeley', name: 'Greeley', counties: ['Weld'], cluster: 'Front Range cities', terrain: 'plains', hero: { image: 'greeley.jpg', alt: 'A street in downtown Greeley on an overcast winter day in 2009: bare trees and grass planters along the road, and a row of old brick and stucco storefronts with red awnings behind a paved crossing' } },
  { slug: 'milliken', name: 'Milliken', counties: ['Weld'], cluster: 'Front Range and plains towns', hero: { image: 'milliken.jpg', alt: 'The main street in Milliken in 2012: a silver water tower lettered MILLIKEN above the brick police station on the left, trucks and cars coming down the tree-lined street, under a cloudy sky', position: '30% 30%' } },
  { slug: 'wellington', name: 'Wellington', counties: ['Larimer'], cluster: 'Front Range and plains towns', hero: { image: 'wellington.jpg', alt: 'Looking west along Cleveland Avenue in Wellington in 2016: a wide street lined with bare trees and low shopfronts, a pickup driving away, and snow-dusted foothills on the horizon under a clear blue sky', position: '50% 80%' } },
  { slug: 'platteville', name: 'Platteville', counties: ['Weld'], cluster: 'Front Range and plains towns', hero: { image: 'platteville.jpg', alt: '' } },
  { slug: 'brush', name: 'Brush', counties: ['Morgan'], cluster: 'Front Range and plains towns', hero: { image: 'brush.jpg', alt: 'Clayton Street in downtown Brush on a snowy morning in 2018: an empty, snow-covered main street running to the horizon between rows of one- and two-storey brick storefronts, a white pickup parked on the left' } },
  { slug: 'sterling', name: 'Sterling', counties: ['Logan'], cluster: 'Front Range and plains towns', hero: { image: 'sterling.jpg', alt: 'The I and M Building at 233 Main Street in Sterling in 2011: a long two-storey brick and stone commercial block behind a row of leafy trees, with US 6 and 138 route signs on the corner and cars parked along the street' } },
  { slug: 'rocky-ford', name: 'Rocky Ford', counties: ['Otero'], cluster: 'Eastern plains', hero: { image: 'rocky-ford.jpg', alt: 'Looking down the main street of downtown Rocky Ford in summer 2010: low brick and painted storefronts including the Heil Bean building on the left, pickups parked along the kerbs and shade trees under a sky of towering white clouds' } },
  { slug: 'la-junta', name: 'La Junta', counties: ['Otero'], cluster: 'Eastern plains', hero: { image: 'la-junta.jpg', alt: 'The brick Amtrak station in La Junta in 2017, with LA JUNTA lettered along its flat roofline, the platform and railroad tracks running across the foreground under a clear blue sky' } },
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
