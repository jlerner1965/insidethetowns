import { DEFAULT_TOWN_NAV, type TownConfig } from './types.ts';

export const lyons: TownConfig = {
  kind: 'town',
  slug: 'lyons',
  name: 'Lyons',
  domain: 'insidelyons.com',
  siteTitle: 'Inside Lyons',
  tagline: 'An independent guide to Lyons, Colorado: the river, the trails, the music, and what it’s like to live at the canyon mouth.',
  seoTagline: 'River, trails, music and events in Lyons, Colorado',
  counties: ['Boulder'],
  state: 'CO',
  lat: 40.2247,
  lng: -105.2714,
  population: 2209, // 2020 census
  elevationFt: 5341,
  incorporated: 1891, // platted 1881
  driveToDenver: 'About 1 hr',
  population2010: 2033, // 2010 census, for census-to-census growth
  character: 'The canyon mouth: sandstone, the river, the music, and a town that rebuilt after 2013.',
  colors: {
    // Lyons Formation sandstone, on a sandstone-dust paper. The old explorelyons.com
    // palette used the same rock; this is its red-rock accent, lifted a step for links.
    accent: '#CE4A2C',
    accentDark: '#8A2D19',
    neutralBg: '#F5EDE0',
  },
  hero: {
    image: 'hero.jpg',
    alt: 'Colorado 7 winding between red sandstone walls in the South St. Vrain canyon above Lyons',
    credit: 'Footwarrior, Wikimedia Commons, CC BY-SA 3.0',
  },
  social: {
    email: 'hello@insidelyons.com',
  },
  nav: DEFAULT_TOWN_NAV,
  movingHere: {
    listingsLinks: [
      { label: 'Homes for sale on Zillow', url: 'https://www.zillow.com/homes/Lyons,-CO_rb/' },
      { label: 'Homes for sale on Redfin', url: 'https://www.redfin.com/zipcode/80540' },
      { label: 'Homes for sale on Realtor.com', url: 'https://www.realtor.com/realestateandhomes-search/Lyons_CO' },
    ],
    schoolDistrict: 'St. Vrain Valley School District: Lyons Elementary and Lyons Middle/Senior High, both in town.',
    commuteNotes:
      'About 20 minutes to Boulder on US 36 and 15 to Longmont on CO 66; about an hour to Denver and 1¼ hours to DIA. No transit; the nearest RTD service is in Boulder and Longmont.',
  },
  officialLinks: {
    townSite: 'https://www.lyonscolorado.com/',
    townSiteLabel: 'the Town of Lyons',
    policeNonEmergency: 'https://bouldercounty.gov/safety/sheriff/',
    policeNonEmergencyLabel: 'Boulder County Sheriff',
  },
  formspreeId: 'moevewdw',
};
