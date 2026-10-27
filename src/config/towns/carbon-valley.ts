import type { TownConfig } from './types.ts';

/**
 * Three municipalities on one guide: the Town of Frederick, the Town of
 * Firestone and the City of Dacono, the coal towns northeast of Erie that
 * their own pages call the Tri-Towns or the Carbon Valley
 * (firestoneco.gov/281/History-of-Firestone). They share a library (the
 * Carbon Valley Regional Library, High Plains Library District), a parks
 * district (CVPRD), a chamber and a holiday festival (Frederick and
 * Firestone share a fire district too; Dacono's is Mountain View Fire
 * Rescue), and none is large enough for a guide of its own, so every event and place here
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
 *
 * Fort Lupton, eight miles east across I-25, joined as a fourth section on
 * 12 October 2026 after five days as a guide of its own; the retired
 * insidefortlupton.com points at /fort-lupton/. It is not one of the coal
 * towns and has its own library and school district, so the figures below
 * stay the three Carbon Valley towns' and the name stays; Fort Lupton's
 * figures are in its Moving Here article.
 */
export const carbonValley: TownConfig = {
  kind: 'town',
  // Live on 5 October 2026, at the owner's direction, after the first review
  // (16 of 15 upcoming events, 27 of 20 listings).
  status: 'live',
  variant: 'front-range',
  region: 'Carbon Valley & I-25',
  neighbors: ['erie', 'longmont'],
  subTowns: ['frederick', 'firestone', 'dacono', 'fort-lupton'],
  // Three towns' worth of content before it opens; set with the brief.
  launchThreshold: { events: 15, listings: 20 },
  slug: 'carbon-valley',
  name: 'Carbon Valley',
  domain: 'carbonvalleyguide.com',
  siteTitle: 'Inside Carbon Valley',
  tagline: 'An independent guide to Frederick, Firestone, Dacono and Fort Lupton, Colorado: what’s on, St. Vrain State Park, the coal towns and the old fort.',
  shortTagline: 'Frederick, Firestone, Dacono and Fort Lupton on one guide',
  // The home title's room ends before a fourth name; /fort-lupton/ carries Fort Lupton's own.
  seoTagline: 'Frederick, Firestone and Dacono, Colorado',
  // All three are Weld County municipalities; no county line runs through them.
  counties: ['Weld'],
  state: 'CO',
  // Frederick's GNIS point via the Wikipedia infobox, 40°06′50″N 105°00′40″W,
  // the middle of the three by the network's usual method. It falls west of
  // I-25; the three old centres (the town halls, OpenStreetMap) are about
  // four miles east of it, on the far side of the interstate.
  lat: 40.1139,
  lng: -104.937,
  // 2020 census, the three summed: Frederick 14,513 + Firestone 16,381 + Dacono 6,297.
  population: 37191,
  // Frederick's, GNIS via Wikipedia (4,938 ft); Firestone is 4,856 and Dacono 5,112.
  elevationFt: 4938,
  // Frederick 26 December 1907, Firestone 8 October 1908, Dacono 1908 (the
  // State Archives say 23 September, the City's own page 23 January); the
  // earliest, so the comparison reads "since 1907".
  incorporated: 1907,
  // The Town of Frederick's own figure (frederickco.gov/699). The three
  // centres are within four miles of each other, so one origin stands for all.
  driveToDenver: 'About 35 min from Frederick',
  // 2010 census, summed: Frederick 8,679 + Firestone 10,147 + Dacono 4,152.
  population2010: 22978,
  character:
    'Three coal towns in a row along I-25 north of Erie, grown from 23,000 to 37,000 people between the 2010 and 2020 censuses, with one library, one rec district and one Main Street each.',
  colors: {
    // Golden Eagle navy, Frederick High's colour as the guide's (22 October
    // 2026): the shade the school's own site brands with (MaxPreps's 022C66
    // is Lyons' too, and a guide's primary is its own).
    primary: '#1C2550',
    accent: '#C48B54',
    paper: 'cool',
  },
  hero: {
    image: 'hero-painted.jpg',
    alt: 'An ink-and-watercolour illustration of the Carbon Valley in autumn: Frederick’s red-brick corner building at Fifth and Oak with its stepped parapet, Firestone’s former Town Hall with its blue roof and the mine car in its gable, the stone rotunda of the Carbon Valley Regional Library and Fort Lupton’s Ottesen Grain Co. feed mill with its tile silos, all under gold cottonwoods, and Bald Eagle Pond at St. Vrain State Park in front, with its tall cottonwoods, willows and the park’s sign',
    credit: 'Illustration, Inside the Towns',
    painted: true,
    // Phone: the four towns' buildings in frame; wide screen: their base above the sports strip.
    position: '97% 58%',
  },
  social: {
    email: 'hello@carbonvalleyguide.com',
  },
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
      'I-25 runs a couple of miles west of the three old centers, with Colorado 52 toward Boulder and Colorado 119 (Exit 240) toward Longmont. Frederick counts the airport 28 minutes away and Boulder 22 miles; Firestone calls itself midway between Denver and Fort Collins. Bustang stops at Exit 240; otherwise everyone drives.',
  },
  officialLinks: {
    // Frederick's, the middle town's; the section pages link each town's own.
    townSite: 'https://www.frederickco.gov/',
    townSiteLabel: 'the Town of Frederick',
    also: [
      { label: 'the Town of Firestone', url: 'https://www.firestoneco.gov/' },
      { label: 'the City of Dacono', url: 'https://www.daconoco.gov/' },
    ],
    policeNonEmergency: 'https://www.frederickco.gov/360/Police',
    policeNonEmergencyLabel: 'Frederick Police Department (720-652-4222 dispatches for Firestone too; Dacono Police: 303-833-3095)',
  },
  plausible: true,
};
