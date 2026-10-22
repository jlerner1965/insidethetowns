// src/config/towns/elizabeth.ts
import type { TownConfig } from './types.ts';

export const elizabeth = {
  kind: 'town',
  status: 'live',
  // Out of the weekly routine from 12 October 2026 on the owner's word
  // (DECISIONS.md, "Severance and Fort Lupton become sections"). Kept, on
  // the owner's word of 15 October 2026, on its readers: 148 visitors in the
  // four weeks to 15 October, more than Golden, Fort Collins or Timnath
  // (DECISIONS.md, "Elizabeth stays"). It stays quiet, with no weekly
  // promise, because the reason it went quiet (an hour from every other
  // guide, so nothing about it combines) has not changed. What is left to
  // decide on 15 November is only whether it rejoins the weekly email; the
  // date stays before any listing's hours expire (the five checked on 18
  // September lose them on 17 November, and the test holds the order).
  quiet: {
    since: '2026-10-12',
    decideBy: '2026-11-15',
    reason: 'kept on 15 October 2026 on its reader numbers, but an hour from the other guides, so it stays out of the weekly email; 15 November decides whether it rejoins',
  },
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
  colors: {
    // Cardinal red, the school's colour as the guide's (22 October 2026):
    // the shade Elizabeth High's own site brands with (MaxPreps's CC0022 is
    // Loveland High's too, and a guide's primary is its own).
    primary: '#8D181B',
    accent: "#C7A36A",
    paper: "warm",
  },
  hero: {
    image: "hero.jpg",
    alt: "Main Street in Elizabeth, Colorado: the 1907 First National Bank building with its arched openings and the white false-front store beyond, under a clear winter sky",
    // Attribution required by the photograph's CC BY-SA license; see IMAGE_LICENSES.csv.
    credit: "ERoss99, Wikimedia Commons, CC BY-SA 3.0",
  },
  social: { email: "hello@insideelizabeth.com" },
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
