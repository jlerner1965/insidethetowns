// src/config/towns/elizabeth.ts
import { DEFAULT_TOWN_NAV, type TownConfig } from './types.ts';

export const elizabeth = {
  kind: 'town',
  slug: "elizabeth",
  name: "Elizabeth",
  domain: "insideelizabeth.com",
  siteTitle: "Inside Elizabeth",
  tagline: "An independent guide to Elizabeth, Colorado: Main Street, the Stampede, the Palmer Divide, and what it’s like to live an hour from Denver on the prairie.",
  seoTagline: "Main Street, the Stampede, the Palmer Divide",
  county: "Elbert",
  state: "CO",
  lat: 39.3603, lng: -104.5969,
  colors: { accent: "#B26E2A", accentDark: "#78491A", neutralBg: "#FAF7F2" },
  hero: {
    image: "hero.jpg",
    alt: "Main Street in Elizabeth, Colorado",
    // Attribution required by the photograph's CC BY-SA licence; see IMAGE_LICENSES.csv.
    credit: "ERoss99, Wikimedia Commons, CC BY-SA 3.0",
  },
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
