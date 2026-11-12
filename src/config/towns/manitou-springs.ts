import type { TownConfig } from './types.ts';

/**
 * An El Paso County home rule city of 4,858 at the 2020 census, 6,306 feet
 * up at the foot of Pikes Peak on the west edge of Colorado Springs: the
 * mineral springs, Manitou Avenue, the Incline, the cog railway and the
 * Garden of the Gods next door. The lowest of the mountain guides, and the
 * only one south of Denver; the mountain chassis all the same, for the
 * seasons the Peak and the Incline keep.
 *
 * Figures are from the Wikipedia infobox (census and GNIS), read 10 October
 * 2026, as for every other town; the comments say which. The domain,
 * insidemanitousprings.com, is the owner's, named 10 October 2026.
 *
 * Retired on 3 November 2026 on the owner's word (DECISIONS.md, "Evergreen,
 * Manitou Springs and Clear Creek retired"): no guide to fold into, so every
 * path on insidemanitousprings.com redirects to the hub (vercel.json) and
 * its content has left content/manitou-springs/ (git history keeps it). The
 * config stays so the Vercel project keeps building, and keeps serving
 * those redirects.
 */
export const manitouSprings: TownConfig = {
  kind: 'town',
  // Live 10 October 2026, on the owner's word, under its launch threshold:
  // it publishes what is verified, and the validator and the weekly report
  // say what it is short of (docs/archive/ACCURACY-SYSTEM.md).
  // A visitor guide from 12 October 2026; retired 3 November 2026, owner's word.
  status: 'redirect',
  retired: {
    since: '2026-11-03',
    reason: 'The owner closed the guide on 3 November 2026: the network is a set of town guides for the people who live there, and Manitou Springs, an hour or more from the other guides, was read as a visitor guide to the Incline, the springs and the Peak.',
  },
  // Its town page on the hub is published (12 November 2026), so the
  // domain now forwards there, not to the hub's home page.
  hubPage: { town: 'manitou-springs', since: '2026-11-12' },
  variant: 'mountain',
  region: 'Mountains & Foothills',
  // Retired 3 November 2026: it names no neighbour, and Castle Rock, which
  // named it back, no longer does.
  neighbors: [],
  // Set with the brief, 10 October 2026, at Evergreen's level: a town of
  // nearly five thousand with a year-round tourist street.
  launchThreshold: { events: 15, listings: 20 },
  slug: 'manitou-springs',
  name: 'Manitou Springs',
  // Named by the owner on 10 October 2026, and on the owner's Cloudflare
  // nameservers (the same pair as the other guides), checked the same day.
  domain: 'insidemanitousprings.com',
  siteTitle: 'Inside Manitou Springs',
  tagline:
    'An independent guide to Manitou Springs, Colorado: the mineral springs, Manitou Avenue, the Incline, the cog railway and the foot of Pikes Peak.',
  shortTagline: 'The springs, the Incline and the foot of Pikes Peak',
  seoTagline: 'What’s on in Manitou Springs, Colorado',
  counties: ['El Paso'],
  state: 'CO',
  // GNIS, via the Wikipedia infobox: 38.85750, -104.91278.
  lat: 38.8575,
  lng: -104.9128,
  population: 4858, // 2020 census
  elevationFt: 6306, // GNIS, via Wikipedia
  character: 'A home rule city of about 4,900 at 6,300 feet at the foot of Pikes Peak, on the west edge of Colorado Springs, with mineral springs and a tourist avenue.',
  // 1888: the State Demography Office's historical census file
  // (storage.googleapis.com/co-publicdata/historical-census.csv, read 10
  // October 2026) and the Wikipedia infobox (25 January 1888) agree.
  incorporated: 1888,
  population2010: 4992, // 2010 census, State Demography Office file
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
      note: 'Live state highway conditions and closures, including US 24 through Ute Pass.',
    },
    {
      label: 'Pike and San Isabel National Forests: alerts',
      url: 'https://www.fs.usda.gov/r02/psicc/alerts',
      note: 'The Pikes Peak Ranger District’s closures and fire restrictions.',
    },
    {
      label: 'Pikes Peak Highway',
      url: 'https://drivepikespeak.com/',
      note: 'Whether the highway to the summit is open, from the City of Colorado Springs, which runs it.',
    },
  ],
  colors: {
    // Artful plum + mineral teal, on cool paper: Color System 2.0, 9 October 2026.
    primary: '#6D4478',
    accent: '#439590',
    paper: 'cool',
  },
  hero: {
    // Bought from Adobe Stock on 30 October 2026 (docs/HERO-PHOTOS.md), in
    // place of a street-level Manitou Avenue: the town in its canyon. A
    // standard licence, so no credit on the photograph; /credits/ names it.
    image: 'AdobeStock_357829842.jpeg',
    alt: 'Downtown Manitou Springs from the air on a June day in 2020: Manitou Avenue curving between brick and stone blocks and a church, houses among green trees on the slopes, red rock and a highway bridge above, and the mountains under summer cloud',
    credit: 'Jacob Boomsma, Adobe Stock',
    // Wide screen: Manitou Avenue and the downtown blocks, not the sky and the far slopes.
    position: '50% 66%',
  },
  social: {
    email: 'hello@insidemanitousprings.com',
  },
  movingHere: {
    listingsLinks: [
      { label: 'Homes for sale on Zillow', url: 'https://www.zillow.com/homes/Manitou-Springs,-CO_rb/' },
      { label: 'Homes for sale on Realtor.com', url: 'https://www.realtor.com/realestateandhomes-search/Manitou-Springs_CO' },
    ],
    // The district as the guide's Moving Here page names it (13 October
    // 2026, audit F05). The comparison table shows only the words before
    // the colon. commuteNotes waits on a sourced drive time.
    schoolDistrict:
      'Manitou Springs School District 14: it covers more than downtown and confirms school assignment and bus routes by address.',
  },
  officialLinks: {
    // The infobox gives manitouspringsgov.com, which answered 301 to this
    // address on 10 October 2026; the site itself answers automated
    // requests with 403, so nothing here was read from it.
    townSite: 'https://www.manitouspringsco.gov/',
    townSiteLabel: 'the City of Manitou Springs',
  },
  plausible: true,
};
