import { DEFAULT_TOWN_NAV, type TownConfig } from './types.ts';

/**
 * Three municipalities on one guide: the Town of Frederick, the Town of
 * Firestone and the City of Dacono, the coal towns northeast of Erie that
 * their own pages call the Tri-Towns or the Carbon Valley
 * (firestoneco.gov/281/History-of-Firestone). They share a library (the
 * Carbon Valley Regional Library, High Plains Library District), a parks
 * district (CVPRD), a chamber, a fire district and a holiday festival, and
 * none is large enough for a guide of its own, so every event and place here
 * carries a `subTown` and the site has a section page per town.
 *
 * The name does not follow the "Inside <Town>" pattern: carbonvalleyguide.com
 * is the owner's domain for it. The masthead and the holding page name the
 * network instead (src/components/Header.astro).
 *
 * Figures are each town's own, read 5 October 2026 from the Wikipedia infobox
 * (census and GNIS), and summed where the config wants one number; the
 * comments say which. The retired insidefirestone.com points at /firestone/
 * (docs/REDIRECTS.md).
 */
export const carbonValley: TownConfig = {
  kind: 'town',
  // Live on 5 October 2026, at the owner's direction, after the first review
  // (16 of 15 upcoming events, 27 of 20 listings).
  status: 'live',
  variant: 'front-range',
  subTowns: ['frederick', 'firestone', 'dacono'],
  // Three towns' worth of content before it opens; set with the brief.
  launchThreshold: { events: 15, listings: 20 },
  slug: 'carbon-valley',
  name: 'Carbon Valley',
  domain: 'carbonvalleyguide.com',
  siteTitle: 'Carbon Valley Guide',
  tagline:
    'An independent guide to Frederick, Firestone and Dacono, Colorado: what’s on in the three towns, Fifth Street, the Firestone Trail and St. Vrain State Park, and what it’s like to live in the coal towns that became the Front Range’s fastest-growing corner.',
  seoTagline: 'Frederick, Firestone and Dacono, Colorado',
  // All three are Weld County municipalities; no county line runs through them.
  counties: ['Weld'],
  state: 'CO',
  // Frederick's Town Hall, the middle of the three: GNIS via the Wikipedia
  // infobox, 40°06′50″N 105°00′40″W. Firestone is three miles north, Dacono
  // three miles south.
  lat: 40.1139,
  lng: -105.0111,
  // 2020 census, the three summed: Frederick 14,513 + Firestone 16,381 + Dacono 6,297.
  population: 37191,
  // Frederick's, GNIS via Wikipedia (4,938 ft); Firestone is 4,856 and Dacono 5,112.
  elevationFt: 4938,
  // Frederick 26 December 1907, Firestone 8 October 1908, Dacono 1908 (the
  // State Archives say 23 September, the City's own page 23 January); the
  // earliest, so the comparison reads "since 1907".
  incorporated: 1907,
  // 2010 census, summed: Frederick 8,679 + Firestone 10,147 + Dacono 4,152.
  population2010: 22978,
  character:
    'Three coal towns in a row along I-25 north of Erie, grown from 23,000 to 37,000 people in a decade, with one library, one rec district and one Main Street each.',
  colors: {
    // Coal-seam slate: a cool grey-blue on a cool paper, for the Carbon in the
    // name. Darker and greyer than Berthoud's lake blue, lighter and greyer
    // than Fort Collins' navy; no other guide uses the family.
    // `npm run check-colors` is the gate.
    accent: '#4A6A8C',
    accentDark: '#2F4660',
    neutralBg: '#F4F5F3',
  },
  hero: {
    image: 'hero.jpg',
    alt: 'Bald Eagle Pond at St. Vrain State Park in Firestone on an August afternoon, with a campground loop on the far shore under a wide sky',
    credit: 'Jeffrey Beall, Wikimedia Commons, CC BY 4.0',
  },
  social: {
    email: 'hello@carbonvalleyguide.com',
  },
  nav: DEFAULT_TOWN_NAV,
  movingHere: {
    listingsLinks: [
      { label: 'Homes for sale in Frederick on Zillow', url: 'https://www.zillow.com/homes/Frederick,-CO_rb/' },
      { label: 'Homes for sale in Firestone on Zillow', url: 'https://www.zillow.com/homes/Firestone,-CO_rb/' },
      { label: 'Homes for sale in Dacono on Zillow', url: 'https://www.zillow.com/homes/Dacono,-CO_rb/' },
    ],
    // Frederick and Firestone are wholly in St. Vrain Valley (each Town's own
    // page); Dacono is split between St. Vrain Valley and Weld RE-8, whose
    // Kenneth Homyak PK-8 opened in 2018 (daconoco.gov/881/Education). The
    // comparison table shows only the words before the colon.
    schoolDistrict:
      'Mostly St. Vrain Valley Schools: Frederick and Firestone entirely, with Frederick High the comprehensive high school; part of Dacono is in Weld RE-8 (Kenneth Homyak PK-8), so check the address.',
    commuteNotes:
      'I-25 runs along the east side of all three towns. Frederick puts itself twenty miles north of Denver; Firestone calls itself midway between Denver and Fort Collins. Colorado 52 reaches Boulder to the west, and Longmont is ten minutes up Colorado 119. Everyone drives.',
  },
  officialLinks: {
    // Frederick's, the middle town's; the section pages link each town's own.
    townSite: 'https://www.frederickco.gov/',
    townSiteLabel: 'the Town of Frederick (Firestone: firestoneco.gov; Dacono: daconoco.gov)',
    policeNonEmergency: 'https://www.frederickco.gov/360/Police',
    policeNonEmergencyLabel: 'Frederick Police Department (720-652-4222 dispatches for Firestone too; Dacono Police: 303-833-3095)',
  },
};
