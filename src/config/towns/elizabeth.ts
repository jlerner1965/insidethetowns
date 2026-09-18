// src/config/towns/elizabeth.ts
import { DEFAULT_TOWN_NAV, type TownConfig } from './types.ts';

export const elizabeth = {
  kind: 'town',
  slug: "elizabeth",
  name: "Elizabeth",
  domain: "insideelizabeth.com",
  siteTitle: "Inside Elizabeth",
  tagline: "Small-town life on the edge of the prairie, an easy drive from Denver.",
  county: "Elbert",
  state: "CO",
  lat: 39.3603, lng: -104.5969,
  colors: { accent: "#8B5E34", accentDark: "#5C3D1F", neutralBg: "#FAF7F2" },
  hero: { image: "hero.jpg", alt: "Main Street in Elizabeth, Colorado" },
  social: { email: "hello@insideelizabeth.com" },
  nav: DEFAULT_TOWN_NAV, // uses defaults
  movingHere: {
    listingsLinks: [
      { label: "Zillow", url: "https://www.zillow.com/elizabeth-co/" },
      { label: "Redfin", url: "https://www.redfin.com/city/5866/CO/Elizabeth" }
    ],
    schoolDistrict: "Elizabeth School District C-1",
    commuteNotes: "About 45 minutes to the Denver Tech Center via Parker Road."
  },
  officialLinks: { townSite: "https://www.townofelizabeth.org" }
} satisfies TownConfig;

export default elizabeth;
