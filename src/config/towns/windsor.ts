import type { TownConfig } from './types.ts';

/**
 * Windsor, and since 12 October 2026 Severance with it: the Weld County town
 * on Windsor's north-east edge, which had its own guide from 7 to 12 October.
 * It shares Windsor's school district (Weld RE-4, Windsor-Severance) and
 * library district (Clearview), and its guide leaned on Windsor in nearly
 * every article, so it is a section of this one, the way Firestone is of
 * Carbon Valley: every event and place carries a `subTown`, and /severance/
 * is its page. The figures below stay Windsor's own; Severance's are in its
 * Moving Here article. The retired insideseverance.com points here
 * (docs/REDIRECTS.md).
 */
export const windsor: TownConfig = {
  kind: 'town',
  status: 'live',
  variant: 'front-range',
  region: 'Northern Colorado',
  neighbors: ['timnath', 'johnstown', 'fortcollins'],
  subTowns: ['windsor', 'severance'],
  slug: 'windsor',
  name: 'Windsor',
  // insidewindsor.com belongs to someone else; the "co" is the domain's, not the slug's.
  domain: 'insidewindsorco.com',
  siteTitle: 'Inside Windsor',
  tagline: 'An independent guide to Windsor and Severance, Colorado: the lake, Boardwalk Park, Main Street, the Poudre River Trail and two beet towns that grew fast.',
  shortTagline: 'The lake, Boardwalk Park, Main Street and the Poudre Trail',
  // "Colorado" spelled out: Windsor is the most ambiguous name in the network
  // (Ontario, Berkshire, California, Connecticut, Vermont), and "CO" is too
  // weak a signal. test/towns.test.ts holds this name to it.
  seoTagline: 'Events, the lake and trails in Windsor, Colorado',
  counties: ['Weld', 'Larimer'],
  countySplit: {
    note: 'Most of Windsor, including Main Street, Windsor Lake and Town Hall, is in Weld County; the neighborhoods west of the county line are in Larimer. The Town’s own page lists three school districts inside the town limits because of it: Weld RE-4 for most of town, Poudre and Thompson on the Larimer County side.',
    source: 'https://www.windsorco.gov/56/School-Districts',
    verified: '2026-10-01',
  },
  state: 'CO',
  lat: 40.4772,
  lng: -104.9119,
  population: 32716, // 2020 census; the Town's 2026 figure is about 48,000
  elevationFt: 4797,
  incorporated: 1890, // 2 April 1890
  driveToDenver: 'About 1 hr',
  population2010: 18644, // 2010 census, for census-to-census growth
  character: 'A sugar-beet town between Fort Collins and Greeley that grew by three-quarters in a decade, with a lake in the middle.',
  colors: {
    // Wizard maroon, the school's colour as the guide's (22 October 2026):
    // the shade Windsor High's own site brands with (MaxPreps's 8F0018 is
    // Berthoud's too, and a guide's primary is its own). The brass stays: it
    // is the Wizards' gold.
    primary: '#6A1B32',
    accent: '#C2A16D',
    paper: 'cool',
  },
  hero: {
    image: 'windsor-lake-aerial.jpg',
    // A June aerial, in place of the frozen lake that fronted the site in
    // October. The winter view now illustrates the lake trail.
    alt: 'Windsor Lake from the air in June: the lake trail and houses along the near shore, downtown Windsor among its trees on the far one, and the Front Range along the horizon',
    credit: 'Ssullivan1564, Wikimedia Commons, CC BY-SA 4.0',
  },
  social: {
    email: 'hello@insidewindsorco.com',
  },
  movingHere: {
    listingsLinks: [
      { label: 'Homes for sale on Zillow', url: 'https://www.zillow.com/homes/Windsor,-CO_rb/' },
      { label: 'Homes for sale on Redfin', url: 'https://www.redfin.com/zipcode/80550' },
      { label: 'Homes for sale on Realtor.com', url: 'https://www.realtor.com/realestateandhomes-search/Windsor_CO' },
    ],
    // "Mostly" is load-bearing: the comparison table shows only the words
    // before the colon, and three districts fall inside the town limits.
    schoolDistrict:
      'Mostly Weld RE-4 (Windsor-Severance): Windsor High, Severance High, three middle schools and seven elementaries; the Larimer County side of town is in Poudre or Thompson, so check the address, not the town.',
    commuteNotes:
      'By car. Harmony Road runs west into Fort Collins, about twenty minutes to Old Town; Colorado 392 reaches I-25 in ten minutes and Greeley in twenty; Loveland is twenty minutes down County Road 17; Denver is about an hour on I-25. The Poudre Express, a weekday commuter bus between Greeley and Fort Collins, stops twice in Windsor; there is no bus network inside the town.',
  },
  officialLinks: {
    townSite: 'https://www.windsorco.gov/',
    townSiteLabel: 'the Town of Windsor',
    policeNonEmergency: 'https://www.windsorco.gov/89/Police',
    policeNonEmergencyLabel: 'Windsor Police Department',
  },
  formspreeId: 'mvkgnjrd',
};
