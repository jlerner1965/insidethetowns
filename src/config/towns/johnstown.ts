import { DEFAULT_TOWN_NAV, type TownConfig } from './types.ts';

export const johnstown: TownConfig = {
  kind: 'town',
  slug: 'johnstown',
  name: 'Johnstown',
  domain: 'insidejohnstown.com',
  siteTitle: 'Inside Johnstown',
  tagline: 'An independent guide to Johnstown, Colorado: Parish Avenue, the parks, the sugar-town history, and what it’s like to move to one of the fastest-growing towns in the country.',
  seoTagline: 'Events and things to do in Johnstown, Colorado',
  // 2020 census: about 73 per cent of the town's population in Weld, 27 per cent in Larimer.
  counties: ['Weld', 'Larimer'],
  countySplit: {
    note: 'Most of Johnstown is in Weld County, but the town has annexed west and north-west across the Larimer line, which is why the north-west corner is in a different school district from the rest of town.',
    source: 'https://johnstownco.gov/',
    verified: '2026-09-20',
  },
  state: 'CO',
  lat: 40.3369,
  lng: -104.9119,
  population: 17303, // 2020 census; 2025 estimate 22,433
  elevationFt: 4994,
  incorporated: 1907, // platted 1902
  driveToDenver: 'About 50 min',
  population2010: 9887, // 2010 census, for census-to-census growth
  character: 'Sugar-beet town at the I-25 interchange, filling the gap between Loveland and Greeley.',
  colors: {
    // Sugar-beet burgundy on a sugar-white paper, for the Great Western factory town.
    accent: '#BE3762',
    accentDark: '#7B1F3C',
    neutralBg: '#F5F1EE',
  },
  hero: {
    image: 'hero.jpg',
    alt: 'A county road running west out of Johnstown toward the snow-covered Front Range in April',
    credit: 'Maarten Heerlien, Wikimedia Commons, CC BY 2.0',
  },
  social: {
    email: 'hello@insidejohnstown.com',
  },
  nav: DEFAULT_TOWN_NAV,
  movingHere: {
    listingsLinks: [
      { label: 'Homes for sale on Zillow', url: 'https://www.zillow.com/homes/Johnstown,-CO_rb/' },
      { label: 'Homes for sale on Redfin', url: 'https://www.redfin.com/zipcode/80534' },
      { label: 'Homes for sale on Realtor.com', url: 'https://www.realtor.com/realestateandhomes-search/Johnstown_CO' },
    ],
    schoolDistrict:
      'Mostly Weld County School District RE-5J (Elwell, Letford and Pioneer Ridge elementaries, Roosevelt Middle and Roosevelt High, all in town); the north-west corner, on the Larimer County side, is Thompson R2-J. The town lists both.',
    commuteNotes:
      'I-25 at the US 34 interchange is on the west edge of town: about 10 minutes to Loveland, 15 to Greeley on US 34, 25 to Fort Collins, and 50 to Denver. Most commutes are by car.',
  },
  officialLinks: {
    townSite: 'https://johnstownco.gov/',
    townSiteLabel: 'the Town of Johnstown',
    policeNonEmergency: 'https://johnstownpolice.org/',
    policeNonEmergencyLabel: 'Johnstown Police Department',
  },
};
