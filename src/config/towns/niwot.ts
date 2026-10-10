import { DEFAULT_TOWN_NAV, type TownConfig } from './types.ts';

export const niwot: TownConfig = {
  kind: 'town',
  status: 'live',
  variant: 'front-range',
  region: 'Boulder County',
  neighbors: ['longmont', 'lyons', 'erie', 'nederland'],
  slug: 'niwot',
  name: 'Niwot',
  domain: 'insideniwot.com',
  siteTitle: 'Inside Niwot',
  tagline: 'An independent guide to Niwot, Colorado: what’s on, where to eat, where to walk, and what it’s like to live here.',
  shortTagline: 'Old Town, the trails, and a town that never incorporated',
  seoTagline: 'Old Town, trails and events in Niwot, Colorado',
  counties: ['Boulder'],
  state: 'CO',
  lat: 40.1039,
  lng: -105.1708,
  population: 4306, // 2020 census, Niwot CDP
  elevationFt: 5168,
  // Unincorporated; a CDP under Boulder County. Incorporation went to a vote
  // on 3 November 2026 — if it passed, this becomes the year of incorporation
  // and /articles/2026-incorporation-election/ needs rewriting with the result.
  incorporated: null,
  driveToDenver: '45–50 min',
  population2010: 4006, // 2010 census, for census-to-census growth
  character: 'Deliberately small and still unincorporated — no town hall, and a vote on that in 2026.',
  colors: {
    // Cottonwood green + brick, on warm paper: Color System 2.0, 9 October 2026.
    primary: '#355E46',
    accent: '#A26449',
    paper: 'warm',
  },
  hero: {
    image: 'front-range-from-the-fields.jpg',
    alt: 'Open grassland under a wide Colorado sky near Niwot, the Front Range running along the western horizon',
  },
  social: {
    email: 'hello@insideniwot.com',
  },
  nav: DEFAULT_TOWN_NAV,
  movingHere: {
    listingsLinks: [
      { label: 'Homes for sale on Zillow', url: 'https://www.zillow.com/homes/Niwot,-CO_rb/' },
      { label: 'Homes for sale on Redfin', url: 'https://www.redfin.com/zipcode/80503' },
      { label: 'Homes for sale on Realtor.com', url: 'https://www.realtor.com/realestateandhomes-search/Niwot_CO' },
    ],
    schoolDistrict: 'St. Vrain Valley School District: Niwot Elementary, Sunset Middle (Longmont), Niwot High.',
    commuteNotes:
      'About 20 minutes to Boulder or Longmont on the Diagonal Highway (CO 119); 45–50 to Denver, about 45 to DIA. RTD’s BOLT bus stops at Niwot Road.',
  },
  officialLinks: {
    // Niwot is unincorporated; Boulder County is the local government.
    townSite: 'https://bouldercounty.gov/',
    townSiteLabel: 'Boulder County',
    policeNonEmergency: 'https://bouldercounty.gov/safety/sheriff/',
    policeNonEmergencyLabel: 'Boulder County Sheriff',
  },
  formspreeId: 'xbglgygb',
};
