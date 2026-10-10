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
    // Deep water: the navy-teal of the lake under the Never Summer range, darker and greyer than Estes Park's petrol and greener than Fort Collins' navy. `npm run check-colors` is the gate.
    accent: '#1D4F6B',
    accentDark: '#143A4F',
    neutralBg: '#F2F5F7',
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
    // schoolDistrict and commuteNotes are written at launch, from the
    // district's and the Town's own pages, with the rest of Moving Here.
  },
  officialLinks: {
    // The infobox's official site. It answers automated requests with 403,
    // so nothing here was read from it (10 October 2026).
    townSite: 'https://www.townofgrandlake.com/',
    townSiteLabel: 'the Town of Grand Lake',
  },
};
