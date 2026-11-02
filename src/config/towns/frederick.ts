import type { TownConfig } from './types.ts';

// Scaffolded 2 November 2026; the flagship config follows in this branch.
export const frederick: TownConfig = {
  kind: 'town',
  status: 'wave1',
  variant: 'front-range',
  region: 'Carbon Valley & I-25',
  neighbors: ['erie', 'longmont'],
  slug: 'frederick',
  name: 'Frederick',
  domain: 'insidefrederickco.com',
  siteTitle: 'Inside Frederick',
  tagline: 'An independent guide to Frederick, Colorado: Fifth Street, the parks and trails, the Golden Eagles and what’s on this week.',
  counties: ['Weld'],
  state: 'CO',
  lat: 40.1139,
  lng: -104.937,
  colors: { primary: '#1C2550', accent: '#C48B54', paper: 'cool' },
  hero: { image: 'fifth-street-at-oak.jpg', alt: 'TODO' },
  social: { email: 'hello@insidefrederickco.com' },
  movingHere: { listingsLinks: [{ label: 'Homes for sale on Zillow', url: 'https://www.zillow.com/homes/Frederick,-CO_rb/' }] },
  officialLinks: { townSite: 'https://www.frederickco.gov/', townSiteLabel: 'the Town of Frederick' },
};
