import type { TownConfig } from './types.ts';

export const berthoud: TownConfig = {
  kind: 'town',
  status: 'live',
  variant: 'front-range',
  region: 'Northern Colorado',
  neighbors: ['loveland', 'longmont', 'johnstown'],
  slug: 'berthoud',
  name: 'Berthoud',
  domain: 'insideberthoud.com',
  siteTitle: 'Inside Berthoud',
  tagline: 'An independent guide to Berthoud, Colorado: the Garden Spot, its Main Street, the lakes, and what it’s like to move here.',
  shortTagline: 'The Garden Spot: a real Main Street and the lakes',
  seoTagline: 'Main Street, the lakes, Berthoud, Colorado',
  // 2020 census: about 97 per cent of the town's population in Larimer, 3 per cent in Weld.
  counties: ['Larimer', 'Weld'],
  countySplit: {
    note: 'Berthoud is overwhelmingly a Larimer County town, but annexations east of the county line put a small part of it in Weld. Worth checking on a specific address rather than assuming.',
    source: 'https://www.berthoud.org/',
    verified: '2026-09-20',
  },
  state: 'CO',
  lat: 40.3122,
  lng: -105.0611,
  population: 10332, // 2020 census
  elevationFt: 5033,
  incorporated: 1888,
  driveToDenver: 'About 50 min',
  population2010: 5105, // 2010 census, for census-to-census growth
  character: 'The Garden Spot: a real Main Street and the lakes, fifteen minutes from Loveland and Longmont.',
  colors: {
    // Spartan maroon + warm gold, on warm paper: the school's colour as the
    // guide's, the owner's call of 22 October 2026 (it was garden green,
    // #3D6041, from 9 October). The same maroon src/config/school-sports.ts
    // names, so the sports pages and the rest of the guide are one colour.
    primary: '#8F0018',
    accent: '#C39B50',
    paper: 'warm',
  },
  hero: {
    image: 'hero.jpg',
    alt: 'Carter Lake, the Larimer County reservoir in the foothills west of Berthoud, on a June afternoon: pines along the near shore, the hogback across the water, and a high cloud sky',
    credit: 'KimonBerlin, Wikimedia Commons, CC BY-SA 2.0',
  },
  social: {
    email: 'hello@insideberthoud.com',
  },
  /**
   * The flagship layout (21 October 2026): the week first, Families as the
   * signature section, the Town's own playground photograph beside the
   * introduction. Gold is the accent the palette already has; the layout
   * uses it as a rule, never as text.
   */
  home: {
    signature: 'families',
    purpose: 'What’s on this week, what your family can join, and who handles what in town.',
    photo: {
      image: 'berthoud-town-park-playground.webp',
      alt: 'Families on the inclusive playground at Berthoud Town Park, on 7th Street downtown',
      credit: 'Town of Berthoud',
    },
    secondary: { label: 'Berthoud Families', href: '/families/' },
    accentName: 'gold',
  },
  families: {
    label: 'Berthoud Families',
    intro: 'What a child can join, what closes soon, and what there is on a school day off: the library, Berthoud Recreation, the schools and the organizers’ own pages, each with the day it was read.',
    schools: [
      {
        district: 'Thompson School District R2-J',
        label: 'Thompson School District: school locator',
        url: 'https://www.tsd.org/family/school-locator',
        note: 'Berthoud Elementary, Ivy Stockwell, Turner Middle and Berthoud High; most of town',
      },
      {
        district: 'Weld RE-5J',
        label: 'Weld RE-5J (Johnstown-Milliken)',
        url: 'https://www.weldre5j.org/',
        note: 'Serves small portions of Berthoud on the Weld County side; check the address with the district',
      },
    ],
    breaks: [
      { district: 'Thompson', label: 'Staff professional day (no students)', from: '2026-11-02', to: '2026-11-02', source: 'https://www.tsd.org/fs/pages/9769', verified: '2026-10-21' },
      { district: 'Thompson', label: 'No K–5 students', from: '2026-11-03', to: '2026-11-03', source: 'https://www.tsd.org/fs/pages/9769', verified: '2026-10-21' },
      { district: 'Thompson', label: 'Thanksgiving break', from: '2026-11-23', to: '2026-11-27', source: 'https://www.tsd.org/fs/pages/9769', verified: '2026-10-21' },
      { district: 'Thompson', label: 'Winter break', from: '2026-12-21', to: '2027-01-04', source: 'https://www.tsd.org/fs/pages/9769', verified: '2026-10-21' },
      { district: 'Thompson', label: 'Staff professional day (no students)', from: '2027-01-05', to: '2027-01-05', source: 'https://www.tsd.org/fs/pages/9769', verified: '2026-10-21' },
      { district: 'Thompson', label: 'Spring break', from: '2027-03-15', to: '2027-03-19', source: 'https://www.tsd.org/fs/pages/9769', verified: '2026-10-21' },
    ],
  },
  participation: {
    // One name for the route on every guide (navigation audit, 22 October
    // 2026): it was "Join Something" here and "Get Involved" on Niwot.
    label: 'Get involved',
    intro: 'The standing ways into Berthoud: a run club that asks nothing but shoes, groups at the library, the Historical Society, the Town’s boards, and the people who put on the downtown year. Each line says what it costs, what to bring and how to make a first inquiry.',
  },
  livingHere: {
    intro: 'Who handles what in Berthoud, as links to the right page of each official site. Two things depend on the address rather than the town: the electric provider and, on the Weld County side, the school district.',
    sections: [
      {
        title: 'Utilities',
        note: 'Water and sewer are the Town’s. Electricity is Xcel Energy in most of town and Poudre Valley REA on parts of the edges; the provider depends on the address.',
        verified: '2026-10-21',
        items: [
          { label: 'Town of Berthoud utility billing (water and sewer)', url: 'https://www.berthoud.org/', note: 'Town Hall, 807 Mountain Avenue, 970-532-2643' },
          { label: 'Trash and utility providers, as the Town lists them', url: 'https://www.berthoud.org/1387/Trash-and-Utility-Providers', note: 'Haulers must be licensed by the Town; some HOAs and metro districts limit you to one' },
          { label: 'Poudre Valley REA: service territory', url: 'https://pvrea.coop/the-co-op/about-pvrea/service-territory/', note: 'The co-op’s map; member services 1-800-432-1012' },
          { label: 'Xcel Energy', url: 'https://www.xcelenergy.com/', note: 'Electricity in most of town, and natural gas' },
        ],
      },
      {
        title: 'Trash and recycling',
        verified: '2026-10-21',
        items: [
          { label: 'Licensed haulers and HOA rules', url: 'https://www.berthoud.org/1387/Trash-and-Utility-Providers', note: 'Private, household by household; the Town’s business directory lists the licensed companies' },
          { label: 'Larimer County Landfill and recycling', url: 'https://www.larimer.gov/solidwaste', note: 'The Town’s spring clean-up vouchers go here' },
        ],
      },
      {
        title: 'Getting around',
        verified: '2026-10-21',
        items: [
          { label: 'BATS: Berthoud Area Transportation Service', url: 'https://berthoud.org/159/Berthoud-Area-Transportation-Service-BAT', note: 'Door-to-door rides in town daily 8–4 and to Loveland on weekday mornings; free over 60, $1 in town, $4 to Loveland; book by 4 pm the business day before, 970-532-3049' },
          { label: 'Transfort FLEX regional bus', url: 'https://www.berthoud.org/162/Transfort-FLEX', note: 'Fort Collins to Loveland, Berthoud, Longmont and Boulder; two stops downtown' },
          { label: 'RAFT (Rural Alternative for Transportation)', url: 'https://berthoudraft.org/', note: 'Where BATS no longer goes, including Longmont' },
          { label: 'CDOT road conditions', url: 'https://www.cotrip.org/', note: 'US 287, CO 56 and I-25' },
        ],
      },
      {
        title: 'Recreation',
        verified: '2026-10-21',
        items: [
          { label: 'Berthoud Recreation: registration', url: 'https://apps.daysmartrecreation.com/dash/x/berthoud/', note: 'Leagues, classes, swim lessons and passes; the activity guide links into it', track: 'registration' },
          { label: 'Recreation Center facility schedules', url: 'https://www.berthoud.org/1521/Facility-Schedules', note: 'Pool, gym and holiday hours' },
          { label: 'Activity guides and registration dates', url: 'https://www.berthoud.org/1598/Activity-Guide', note: 'Winter opens November 1, spring February 1, summer April 1, fall July 1', track: 'registration' },
          { label: 'Town parks', url: 'https://www.berthoud.org/219/Parks', note: 'Pavilion rentals and the park list' },
        ],
      },
      {
        title: 'Schools',
        note: 'Most of Berthoud is in Thompson School District R2-J; a small part on the Weld County side is in Weld RE-5J. Check the address, not the town.',
        verified: '2026-10-21',
        items: [
          { label: 'Thompson School District: school locator', url: 'https://www.tsd.org/family/school-locator' },
          { label: 'Thompson: attendance boundaries', url: 'https://www.tsd.org/departments/operations/planning/attendance-boundaries' },
          { label: 'Thompson: 2026–27 calendar highlights', url: 'https://www.tsd.org/fs/pages/9769', note: 'Breaks and no-school days' },
          { label: 'Weld RE-5J', url: 'https://www.weldre5j.org/', note: 'For addresses on the Weld side; 970-587-6050' },
        ],
      },
      {
        title: 'Reporting a problem',
        verified: '2026-10-21',
        items: [
          { label: 'Report a concern to the Town', url: 'https://survey123.arcgis.com/share/25aa98a9fe18431aa47b7be8bcf1500f?portalUrl=https://berthoudpubworks.maps.arcgis.com', note: 'Public works: streets, water, parks' },
          { label: 'Larimer County Sheriff, Berthoud squad', url: 'https://www.larimer.gov/sheriff/patrol/berthoud-squad', note: 'Non-emergency 970-416-1985; in an emergency call 911' },
          { label: 'Berthoud Fire Protection District', url: 'https://www.berthoudfire.org/', note: 'Non-emergency 970-532-2264' },
          { label: 'Town eNotifications', url: 'https://berthoud.org/list.aspx', note: 'Alerts and news by email' },
        ],
      },
      {
        title: 'Town meetings and participation',
        verified: '2026-10-21',
        items: [
          { label: 'How to participate', url: 'https://www.berthoud.org/258/How-to-Participate', note: 'Board of Trustees 2nd and 4th Tuesdays, 6:30 pm; three minutes for any resident', track: 'participation' },
          { label: 'Agendas and minutes', url: 'https://berthoudco.portal.civicclerk.com/' },
          { label: 'Advisory committee application', url: 'https://www.berthoud.org/FormCenter/General-Forms-4/Advisory-Committee-Application-95', note: 'Parks, planning, trees, preservation and the Youth Advisory Commission', track: 'participation' },
          { label: 'Engage Berthoud: projects open to comment', url: 'https://engage.berthoud.org/', note: 'The stormwater plan, the water efficiency plan, Jaskowski open space, Newell Farm Park', track: 'participation' },
          { label: 'Larimer County elections', url: 'https://www.larimer.gov/clerk/elections/current-elections/2026', note: 'Ballot content, drop boxes and dates for November 3' },
        ],
      },
    ],
  },
  about: {
    who: [
      'Inside Berthoud is published by Lerner Works, the small studio James Lerner runs. James grew up in Niwot, twenty minutes down the Diagonal, and edits this guide from the sources every listing names: the Town’s own pages, the library, the school district, and the businesses’ and organizers’ sites, checked on the dates shown. He is not a Berthoud resident and has no standing with the Town, the chamber or any organization listed here; nothing on the guide is endorsed by any of them.',
    ],
  },
  movingHere: {
    listingsLinks: [
      { label: 'Homes for sale on Zillow', url: 'https://www.zillow.com/homes/Berthoud,-CO_rb/' },
      { label: 'Homes for sale on Redfin', url: 'https://www.redfin.com/zipcode/80513' },
      { label: 'Homes for sale on Realtor.com', url: 'https://www.realtor.com/realestateandhomes-search/Berthoud_CO' },
    ],
    schoolDistrict:
      'Mostly Thompson School District R2-J: Berthoud Elementary, Ivy Stockwell Elementary, Turner Middle and Berthoud High, all in town. Weld RE-5J serves a small part of Berthoud on the Weld County side, so check the district against the address rather than the town.',
    commuteNotes:
      'About 15 minutes to Loveland or Longmont on US 287, 25 to Fort Collins, and about 50 minutes to Denver by I-25. The FLEX bus runs between Fort Collins, Loveland, Berthoud, Longmont and Boulder.',
  },
  officialLinks: {
    townSite: 'https://www.berthoud.org/',
    townSiteLabel: 'the Town of Berthoud',
    policeNonEmergency: 'https://www.larimer.gov/sheriff/patrol/berthoud-squad',
    policeNonEmergencyLabel: 'the Larimer County Sheriff’s Berthoud squad',
  },
  formspreeId: 'xjykyryq',
  plausible: true,
};
