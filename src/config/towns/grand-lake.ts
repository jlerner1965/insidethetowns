import { DEFAULT_TOWN_NAV, type TownConfig } from './types.ts';

/**
 * A Grand County statutory town of 410 at the 2020 census, 8,439 feet up on
 * the shore of the lake at the west entrance to
 * Rocky Mountain National Park: the boardwalk, the marina and Trail Ridge
 * Road over to Estes Park for the months it is open. Mountain chassis; the
 * default launch threshold.
 *
 * Figures are from the Wikipedia infobox (census and GNIS), read 10 October
 * 2026, as for every other town; the comments say which. The domain,
 * insidegrandlake.com, is the owner's, named 10 October 2026.
 */
export const grandLake: TownConfig = {
  kind: 'town',
  // Live 10 October 2026, on the owner's word, under its launch threshold:
  // it publishes what is verified, and the validator and the weekly report
  // say what it is short of (docs/ACCURACY-SYSTEM.md).
  status: 'live',
  // Quiet from 20 October 2026, owner's word, with the other small mountain
  // guides (DECISIONS.md, "The other mountain guides, 20 October"): pages
  // up, listings checked as the rotation reaches them, no weekly promise.
  // 19 November is before any listing's hours expire (45 days from its check
  // on the mountain chassis; the quiet-towns test holds the order).
  quiet: {
    since: '2026-10-20',
    decideBy: '2026-11-19',
    reason: 'the smallest guide left after the Clear Creek fold, 410 people and sixteen events, with Estes Park a closed pass away for half the year; its readers are visitors, and nothing about it combines',
  },
  variant: 'mountain',
  region: 'Mountains & Foothills',
  // Estes Park, the other side of the national park: two hours over Trail
  // Ridge Road in summer and a long way round in winter, when the road is
  // closed. Nothing else is within an afternoon's drive. Set when the town
  // went live, 10 October 2026; Estes Park names Grand Lake back.
  neighbors: ['estes-park'],
  slug: 'grand-lake',
  name: 'Grand Lake',
  // Named by the owner on 10 October 2026, and on the owner's Cloudflare
  // nameservers (the same pair as the other guides), checked the same day.
  domain: 'insidegrandlake.com',
  siteTitle: 'Inside Grand Lake',
  tagline:
    'An independent guide to Grand Lake, Colorado: the boardwalk, the lake, the west entrance to Rocky Mountain National Park and Trail Ridge Road.',
  shortTagline: 'The boardwalk, the lake and the park’s west entrance',
  seoTagline: 'Events and trails in Grand Lake, Colorado',
  counties: ['Grand'],
  state: 'CO',
  // GNIS, via the Wikipedia infobox: 40.25056, -105.82444.
  lat: 40.2506,
  lng: -105.8244,
  population: 410, // 2020 census
  elevationFt: 8439, // GNIS, via Wikipedia
  character: 'A statutory town of about 400 at 8,400 feet on the lake at the west entrance to Rocky Mountain National Park, with a summer season and a snowed-in winter.',
  // 1885: the State Demography Office's historical census file
  // (storage.googleapis.com/co-publicdata/historical-census.csv, read 10
  // October 2026). The Wikipedia infobox says 23 June 1944. The state file
  // is the official record, as for Nederland; the infobox date is noted
  // here as the odd one out.
  incorporated: 1885,
  population2010: 471, // 2010 census, State Demography Office file
  /**
   * Where a reader checks the roads before setting out. Official pages,
   * linked live on Things to Do and every trail, trailhead and park page;
   * the guide never restates what they say. Each URL answered 200 to a
   * request on 10 October 2026.
   */
  conditionsLinks: [
    {
      label: 'CDOT road conditions (COtrip)',
      url: 'https://www.cotrip.org/',
      note: 'Live state highway conditions and closures, including US 34 and US 40 over Berthoud Pass.',
    },
    {
      label: 'Rocky Mountain National Park: current conditions',
      url: 'https://www.nps.gov/romo/planyourvisit/conditions.htm',
      note: 'The park’s own page for road status, timed entry and trail closures on the west side.',
    },
    {
      label: 'Trail Ridge Road and park roads status',
      url: 'https://www.nps.gov/romo/planyourvisit/road_status.htm',
      note: 'Whether Trail Ridge Road (US 34 through the park to Estes Park) is open; recorded line 970-586-1222.',
    },
    {
      label: 'Arapaho and Roosevelt National Forests: alerts',
      url: 'https://www.fs.usda.gov/r02/arp/alerts',
      note: 'The Sulphur Ranger District’s closures and fire restrictions on the national forest around the lakes.',
    },
  ],
  colors: {
    // Lake blue + cedar, on cool paper: Color System 2.0, 9 October 2026.
    primary: '#225D7A',
    accent: '#A57952',
    paper: 'cool',
  },
  hero: {
    image: 'hero.jpg',
    alt: 'A rainbow over the forested mountains above Grand Lake, with cabins and moored boats along the shore below',
    // Attribution required by the photograph’s licence; see IMAGE_LICENSES.csv. Chosen 10 October 2026.
    credit: 'Muttnick, Wikimedia Commons, CC BY-SA 4.0',
  },
  social: {
    email: 'hello@insidegrandlake.com',
  },
  nav: DEFAULT_TOWN_NAV,
  movingHere: {
    listingsLinks: [
      { label: 'Homes for sale on Zillow', url: 'https://www.zillow.com/homes/Grand-Lake,-CO_rb/' },
      { label: 'Homes for sale on Realtor.com', url: 'https://www.realtor.com/realestateandhomes-search/Grand-Lake_CO' },
    ],
    // The district as the guide's Moving Here page names it (13 October
    // 2026, audit F05). The comparison table shows only the words before
    // the colon. commuteNotes waits on a sourced drive time.
    schoolDistrict:
      'East Grand School District: confirm enrollment and the bus arrangements for the address with the district; in winter the journey can matter as much as the distance.',
  },
  officialLinks: {
    // The infobox's official site. It answered automated requests with 403
    // when the town was scaffolded on 10 October 2026, then 200 to the
    // robots-aware reader later that day, when its park pages were read for
    // the listings.
    townSite: 'https://www.townofgrandlake.com/',
    townSiteLabel: 'the Town of Grand Lake',
  },
};
