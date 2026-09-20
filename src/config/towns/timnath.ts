import { DEFAULT_TOWN_NAV, type TownConfig } from './types.ts';

export const timnath: TownConfig = {
  kind: 'town',
  slug: 'timnath',
  name: 'Timnath',
  domain: 'insidetimnath.com',
  siteTitle: 'Inside Timnath',
  tagline: 'An independent guide to Timnath, Colorado: Old Town Main Street, the reservoir and the river trail, and what it’s like to move to a farm town that grew tenfold.',
  // 99.9 per cent of the town's population is in Larimer; a sliver of annexed
  // land east of the county line is in Weld, too small to name as a second county.
  counties: ['Larimer'],
  state: 'CO',
  lat: 40.5333,
  lng: -104.9644,
  population: 6487, // 2020 census; 2025 estimate about 11,600
  elevationFt: 4869,
  incorporated: 1920,
  driveToDenver: 'About 1 hr',
  population2010: 625, // 2010 census, for census-to-census growth
  character: 'A farm village of 600 that became a town of 6,000, mostly since the Costco.',
  colors: {
    // Harvest gold on a wheat-white paper: potatoes, alfalfa and sugar beets were the
    // town's business for a century. Distinct from the five other accents.
    accent: '#A67A14',
    accentDark: '#6C4F0C',
    neutralBg: '#F7F4EC',
  },
  hero: {
    image: 'hero.jpg',
    alt: 'Geese over Fossil Creek Reservoir southwest of Timnath, bare cottonwoods and houses along the far shore',
    credit: 'KimonBerlin, Wikimedia Commons, CC BY-SA 2.0',
  },
  social: {
    email: 'hello@insidetimnath.com',
  },
  nav: DEFAULT_TOWN_NAV,
  movingHere: {
    listingsLinks: [
      { label: 'Homes for sale on Zillow', url: 'https://www.zillow.com/homes/Timnath,-CO_rb/' },
      { label: 'Homes for sale on Redfin', url: 'https://www.redfin.com/zipcode/80547' },
      { label: 'Homes for sale on Realtor.com', url: 'https://www.realtor.com/realestateandhomes-search/Timnath_CO' },
    ],
    schoolDistrict:
      'Poudre School District: Timnath Elementary in Old Town, Bethke Elementary, and Timnath Middle-High School on Prospect Road, all in town.',
    commuteNotes:
      'Harmony Road meets I-25 at the west edge of town: about 10 minutes to south Fort Collins, 20 to Loveland or Old Town Fort Collins, 15 to Windsor and about an hour to Denver. Most commutes are by car.',
  },
  officialLinks: {
    townSite: 'https://timnath.org/',
    townSiteLabel: 'the Town of Timnath',
    policeNonEmergency: 'https://timnath.org/public-safety/',
    policeNonEmergencyLabel: 'Timnath public safety',
  },
};
