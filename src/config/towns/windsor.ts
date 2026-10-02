import { DEFAULT_TOWN_NAV, type TownConfig } from './types.ts';

export const windsor: TownConfig = {
  kind: 'town',
  slug: 'windsor',
  name: 'Windsor',
  // insidewindsor.com belongs to someone else; the "co" is the domain's, not the slug's.
  domain: 'insidewindsorco.com',
  siteTitle: 'Inside Windsor',
  tagline:
    'An independent guide to Windsor, Colorado: the lake and Boardwalk Park, Main Street, the Poudre River Trail, and what it’s like to move to a sugar-beet town that doubled.',
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
  character: 'A sugar-beet town between Fort Collins and Greeley that doubled in a decade, with a lake in the middle.',
  colors: {
    // Lake teal on a cool white paper: Windsor Lake and the Poudre. The one
    // hue family none of the other eight accents uses.
    accent: '#0F7C72',
    accentDark: '#0A5650',
    neutralBg: '#F3F7F5',
  },
  hero: {
    image: 'hero.jpg',
    alt: 'Windsor Lake frozen and snow-covered in winter, red sandstone riprap on the near shore and the town’s houses, bare trees and grain elevator along the far one',
    credit: 'Jared Winkler, Wikimedia Commons, CC BY-SA 4.0',
  },
  social: {
    email: 'hello@insidewindsorco.com',
  },
  nav: DEFAULT_TOWN_NAV,
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
