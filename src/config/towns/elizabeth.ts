// src/config/towns/elizabeth.ts
import { DEFAULT_TOWN_NAV, type TownConfig } from './types.ts';

export const elizabeth = {
  kind: 'town',
  status: 'live',
  variant: 'front-range',
  region: 'South Metro',
  neighbors: ['castle-rock'],
  slug: "elizabeth",
  name: "Elizabeth",
  domain: "insideelizabeth.com",
  siteTitle: "Inside Elizabeth",
  tagline: "An independent guide to Elizabeth, Colorado: Main Street, the Stampede, the Palmer Divide, and what it’s like to live an hour from Denver on the prairie.",
  shortTagline: 'Main Street, the Stampede, and the Palmer Divide',
  seoTagline: 'Events and things to do in Elizabeth, Colorado',
  counties: ['Elbert'],
  state: "CO",
  lat: 39.3603, lng: -104.5969,
  population: 1675, // 2020 census; 2026 estimates put it nearer 3,100
  elevationFt: 6477,
  incorporated: 1890,
  // The guide's "an hour from Denver"; most commuters are going to the Tech
  // Center, which its Getting around puts at 45 minutes.
  driveToDenver: 'About 1 hr; 45 min to the Tech Center',
  population2010: 1358, // 2010 census, for census-to-census growth
  character: 'Prairie and ponderosa on the Palmer Divide, an hour out and sold five acres at a time.',
  colors: { accent: "#B26E2A", accentDark: "#78491A", neutralBg: "#FAF7F2" },
  hero: {
    image: "hero.jpg",
    alt: "Main Street in Elizabeth, Colorado: the 1907 First National Bank building with its arched openings and the white false-front store beyond, under a clear winter sky",
    // Attribution required by the photograph's CC BY-SA license; see IMAGE_LICENSES.csv.
    credit: "ERoss99, Wikimedia Commons, CC BY-SA 3.0",
  },
  social: { email: "hello@insideelizabeth.com" },
  nav: DEFAULT_TOWN_NAV, // uses defaults
  movingHere: {
    listingsLinks: [
      { label: "Homes for sale on Zillow", url: "https://www.zillow.com/elizabeth-co/" },
      { label: "Homes for sale on Redfin", url: "https://www.redfin.com/city/5866/CO/Elizabeth" },
      { label: "Homes for sale on Realtor.com", url: "https://www.realtor.com/realestateandhomes-search/Elizabeth_CO" },
    ],
    schoolDistrict: "Elizabeth School District C-1: Running Creek and Singing Hills elementaries, Elizabeth Middle School and Elizabeth High School.",
    commuteNotes: "About 45 minutes to the Denver Tech Center via Parker Road."
  },
  officialLinks: {
    townSite: "https://www.townofelizabeth.org",
    townSiteLabel: "the Town of Elizabeth",
    policeNonEmergency: "https://www.townofelizabeth.org/police",
    policeNonEmergencyLabel: "Elizabeth Police Department",
  },
  formspreeId: "xyezejwk",
} satisfies TownConfig;

export default elizabeth;
