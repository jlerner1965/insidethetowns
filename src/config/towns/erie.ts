import { DEFAULT_TOWN_NAV, type TownConfig } from './types.ts';

export const erie: TownConfig = {
  kind: 'town',
  slug: 'erie',
  name: 'Erie',
  domain: 'insideerie.com',
  siteTitle: 'Inside Erie',
  tagline: 'An independent guide to Erie, Colorado: Briggs Street, the trails, the coal-town history, and what it’s like to move to a town that doubled.',
  // 2020 census: 17,387 residents (58 per cent) in Weld, 12,651 (42 per cent) in Boulder.
  counties: ['Weld', 'Boulder'],
  countySplit: {
    note: 'County Line Road is the boundary: streets west of it are in Boulder County, streets east of it in Weld. It decides your school district, your sheriff and which county you file with — check the address, not the town.',
    source: 'https://erieco.gov/2505/Regional-Partners',
    verified: '2026-09-20',
  },
  state: 'CO',
  lat: 40.0503,
  lng: -105.05,
  population: 30038, // 2020 census
  elevationFt: 5072,
  incorporated: 1874, // 16 November 1874
  driveToDenver: 'About 35 min',
  population2010: 18135, // 2010 census, for census-to-census growth
  character: 'A coal town that became a commuter town, with a downtown that caught up.',
  colors: {
    // Coal-seam indigo on a warm grey paper: the town was Colorado's coal capital for
    // eighty years. Distinct from Niwot's evergreen, Lyons' sandstone and Berthoud's lake blue.
    accent: '#6257C0',
    accentDark: '#3B3480',
    neutralBg: '#F3F1EC',
  },
  hero: {
    image: 'hero.jpg',
    alt: 'Colorado 7 running west out of Erie toward the snow-covered Front Range on a December morning',
    credit: 'Jeffrey Beall, Wikimedia Commons, CC BY 4.0',
  },
  social: {
    email: 'hello@insideerie.com',
  },
  nav: DEFAULT_TOWN_NAV,
  movingHere: {
    listingsLinks: [
      { label: 'Homes for sale on Zillow', url: 'https://www.zillow.com/homes/Erie,-CO_rb/' },
      { label: 'Homes for sale on Redfin', url: 'https://www.redfin.com/zipcode/80516' },
      { label: 'Homes for sale on Realtor.com', url: 'https://www.realtor.com/realestateandhomes-search/Erie_CO' },
    ],
    schoolDistrict:
      'Mostly St. Vrain Valley Schools (Erie, Red Hawk and Black Rock elementaries, Soaring Heights PK-8, Erie Middle, Erie High); the Boulder County side is Boulder Valley (Meadowlark PK-8).',
    commuteNotes:
      'About 20 minutes to Boulder on Arapahoe Road or Colorado 7, 35 to Denver and 35 to Denver International Airport by I-25 and E-470. Most commutes are by car.',
  },
  officialLinks: {
    townSite: 'https://www.erieco.gov/',
    townSiteLabel: 'the Town of Erie',
    policeNonEmergency: 'https://www.erieco.gov/246/Police-Department',
    policeNonEmergencyLabel: 'Erie Police Department',
  },
};
