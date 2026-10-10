import { DEFAULT_TOWN_NAV, type TownConfig } from './types.ts';

/**
 * A Grand County statutory town of 410 at the 2020 census, 8,439 feet up on
 * the shore of the lake at the west entrance to
 * Rocky Mountain National Park: the boardwalk, the marina and Trail Ridge
 * Road over to Estes Park for the months it is open. Mountain chassis; the
 * default launch threshold.
 *
 * Figures are from the Wikipedia infobox (census and GNIS), read 10 October
 * 2026, as for every other town; the comments say which. The domain is not
 * yet the owner's call: see `domain` below.
 */
export const grandLake: TownConfig = {
  kind: 'town',
  // Not live. The guide builds a holding page until the owner names the
  // domain and the first review clears the launch threshold.
  status: 'wave2',
  variant: 'mountain',
  region: 'Mountains & Foothills',
  // Empty until the owner sets them: neighbours go both ways (test/nearby.test.ts),
  // so naming Estes Park here means naming Grand Lake on its config, which is the
  // owner's call. Proposed: estes-park, the other side of the park, two hours over
  // Trail Ridge Road in summer and a long way round in winter, when the road is
  // closed. Nothing else live is within an afternoon's drive.
  neighbors: [],
  slug: 'grand-lake',
  name: 'Grand Lake',
  /**
   * UNCONFIRMED. The owner has not named this town's domain (10 October
   * 2026), and the brief says to ask rather than guess, so this is a
   * reserved `.invalid` name that cannot resolve. Replace it, and the email
   * below, with the Inside domain the owner owns before creating the Vercel
   * project; nothing links to a town that is not live, so until then it
   * appears nowhere a reader can see.
   */
  domain: 'grand-lake.unconfirmed.invalid',
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
    // The stand-in from scripts/templates/; a photograph is chosen at launch, with its row in IMAGE_LICENSES.csv.
    alt: 'Placeholder: no photograph of Grand Lake has been chosen yet',
  },
  social: {
    // Follows the domain; see the note on `domain`.
    email: 'hello@grand-lake.unconfirmed.invalid',
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
