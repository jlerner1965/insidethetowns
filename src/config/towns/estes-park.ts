import { DEFAULT_TOWN_NAV, type TownConfig } from './types.ts';

/**
 * The network's first mountain guide. A Larimer County statutory town of
 * 5,904 at the 2020 census at the east entrance to Rocky Mountain National
 * Park, 7,743 feet up, where a season closes roads and kitchens: the
 * mountain chassis, with its 30-day freshness windows, seasonal hours and
 * access notes (docs/ACCURACY-SYSTEM.md, phase 9). The road and closure
 * links below are the official pages, linked rather than restated.
 *
 * Figures are from the Wikipedia infobox (census and GNIS), read 6 October
 * 2026, as for every other town; the comments say which. The domain is the
 * one on the owner's Cloudflare nameservers (the same pair as the other
 * thirteen), confirmed 6 October 2026.
 */
export const estesPark: TownConfig = {
  kind: 'town',
  // Live 7 October 2026, on the owner's word, after the first review cleared
  // the launch threshold (docs/ACCURACY-SYSTEM.md).
  status: 'live',
  variant: 'mountain',
  region: 'Mountains & Foothills',
  neighbors: ['lyons', 'loveland'],
  // Set with the brief, 6 October 2026: upcoming events / open listings.
  launchThreshold: { events: 20, listings: 30 },
  slug: 'estes-park',
  name: 'Estes Park',
  domain: 'insideestespark.com',
  siteTitle: 'Inside Estes Park',
  tagline:
    'An independent guide to Estes Park, Colorado: the gateway to Rocky Mountain National Park, Elkhorn Avenue, the trailheads, the elk, and mountain life.',
  shortTagline: 'Elkhorn Avenue, the trailheads, the elk and the national park',
  seoTagline: 'Events and trails in Estes Park, Colorado',
  counties: ['Larimer'],
  state: 'CO',
  // GNIS, via the Wikipedia infobox: 40°22′51″N 105°31′20″W.
  lat: 40.3808,
  lng: -105.5222,
  population: 5904, // 2020 census
  elevationFt: 7743, // GNIS, via Wikipedia
  driveToDenver: 'About 1 hr 30 min',
  character: 'The gateway to Rocky Mountain National Park, at 7,500 feet, with a tourist season and a quiet winter.',
  // 17 April 1917, per the Colorado State Archives' list of municipal incorporations as the Wikipedia infobox cites it (settled 1859).
  incorporated: 1917,
  population2010: 5858, // 2010 census, for census-to-census growth
  /**
   * Where a reader checks the roads before setting out. Official pages,
   * linked live on Things to Do and every trail, trailhead and park page;
   * the guide never restates what they say. Each URL answered 200 to a
   * request on 6 October 2026.
   */
  conditionsLinks: [
    {
      label: 'CDOT road conditions (COtrip)',
      url: 'https://www.cotrip.org/',
      note: 'Live state highway conditions and closures, including US 34 and US 36.',
    },
    {
      label: 'Rocky Mountain National Park: current conditions',
      url: 'https://www.nps.gov/romo/planyourvisit/conditions.htm',
      note: 'The park’s own page for road status, timed entry and trail closures.',
    },
    {
      label: 'Trail Ridge Road and park roads status',
      url: 'https://www.nps.gov/romo/planyourvisit/road_status.htm',
      note: 'Whether Trail Ridge Road (US 34 through the park) is open, and the timed-entry hours; recorded line 970-586-1222.',
    },
    {
      label: 'Arapaho and Roosevelt National Forests: alerts',
      url: 'https://www.fs.usda.gov/r02/arp/alerts',
      note: 'The Forest Service’s fire restrictions and closures on the national forest around the park.',
    },
  ],
  colors: {
    // Alpine lake: a petrol blue-green for Bear Lake and Lake Estes, darker and greener than Berthoud's cerulean, bluer than Windsor's teal. `npm run check-colors` is the gate.
    accent: '#1E6E7E',
    accentDark: '#144B57',
    neutralBg: '#F2F6F7',
  },
  hero: {
    image: 'hero.jpg',
    alt: 'Estes Park from the Gem Lake trail: the town in its valley of pines, with snow on Longs Peak above',
    // Attribution required by the photograph’s licence; see IMAGE_LICENSES.csv. Chosen 7 October 2026.
    credit: 'KimonBerlin, Wikimedia Commons, CC BY-SA 2.0',
  },
  social: {
    email: 'hello@insideestespark.com',
  },
  nav: DEFAULT_TOWN_NAV,
  movingHere: {
    listingsLinks: [
      { label: 'Homes for sale on Zillow', url: 'https://www.zillow.com/homes/Estes-Park,-CO_rb/' },
      { label: 'Homes for sale on Realtor.com', url: 'https://www.realtor.com/realestateandhomes-search/Estes-Park_CO' },
    ],
    // Estes Park School District (estesschools.org, read 6 October 2026; the
    // R-3 suffix was not on the page read). commuteNotes are written at launch.
    schoolDistrict: 'Estes Park School District, the one district for the Estes Valley.',
  },
  officialLinks: {
    townSite: 'https://estespark.colorado.gov/',
    townSiteLabel: 'the Town of Estes Park',
    // The Town's police page, given by the owner on 6 October 2026 (the
    // Town's site answers automated requests with 403, so the number is not
    // read here; the page carries it).
    policeNonEmergency: 'https://estespark.colorado.gov/pd',
    policeNonEmergencyLabel: 'Estes Park Police Department',
  },
};
