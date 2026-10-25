import type { TownConfig } from './types.ts';

export const erie: TownConfig = {
  kind: 'town',
  status: 'live',
  variant: 'front-range',
  region: 'Boulder County',
  neighbors: ['longmont', 'carbon-valley', 'niwot'],
  slug: 'erie',
  name: 'Erie',
  domain: 'insideerie.com',
  siteTitle: 'Inside Erie',
  tagline: 'An independent guide to Erie, Colorado: Briggs Street, the trails, the coal-town history, and what it’s like to move to a town that grew by two-thirds.',
  shortTagline: 'Briggs Street, the trails, and a coal town that grew by two-thirds',
  seoTagline: 'Briggs Street, trails and events in Erie, Colorado',
  // 2020 census: 17,387 residents (58 per cent) in Weld, 12,651 (42 per cent) in Boulder.
  counties: ['Weld', 'Boulder'],
  countySplit: {
    note: 'County Line Road is the boundary: streets west of it are in Boulder County, streets east of it in Weld. It decides your school district, your sheriff and which county you file with — check the address, not the town.',
    source: 'https://erieco.gov/2505/Regional-Partners',
    verified: '2026-09-20',
  },
  state: 'CO',
  lat: 40.0503,
  lng: -105.05,
  population: 30038, // 2020 census
  elevationFt: 5072,
  incorporated: 1874, // 16 November 1874
  driveToDenver: 'About 35 min',
  population2010: 18135, // 2010 census, for census-to-census growth
  character: 'A coal town that became a commuter town, with a downtown that caught up.',
  colors: {
    // Tiger orange + open-sky blue, on warm paper: the school's colour as
    // the guide's, as Berthoud's and the other flagships' are (25 October
    // 2026; it was brick red, #96453C, from 9 October). The darkest step of
    // Erie High's own orange (ehs.svvsd.org's `--color-primary-700`), the
    // same shade src/config/school-sports.ts names, so the sports pages and
    // the rest of the guide are one colour. The blue accent stays: it is
    // decoration only and keeps the guide its own.
    primary: '#983C0E',
    accent: '#6498B2',
    paper: 'warm',
  },
  hero: {
    image: 'hero.jpg',
    alt: 'Baseline Road, Colorado 7, running west toward the snow-covered Front Range on a December morning',
    credit: 'Jeffrey Beall, Wikimedia Commons, CC BY 4.0',
  },
  social: {
    email: 'hello@insideerie.com',
  },
  /**
   * The flagship layout (22 October 2026), as Berthoud's and Lyons's: the
   * week as the page, Families as the signature hub, every other hub one
   * link. The owner's call, for Elizabeth, Windsor, Erie and Johnstown together.
   */
  home: {
    signature: 'families',
    purpose: 'What’s on this week, what your family can join, and who handles what in town.',
    secondary: { label: 'Erie Families', href: '/families/' },
    accentName: 'open-sky blue',
  },
  /**
   * Erie High's colours, read from its own site 25 October 2026
   * (ehs.svvsd.org): the theme's `--color-primary` is #F26B21, the Tiger
   * orange, and the school's logo (ehs-logo.svg) is that orange (#F47421)
   * with black (#231F20). White is 3.0:1 on the orange, short of the 7:1
   * the masthead needs, so the two swap: the black is the band and the
   * orange the accent and the eyebrows (src/config/school-colors.ts). The
   * guide's own primary, the darker #983C0E, stays as it is.
   */
  school: { name: 'Erie High School', mascot: 'Tigers', teamName: 'Erie Tigers', primary: '#F26B21', secondary: '#231F20' },
  families: {
    label: 'Erie Families',
    intro: 'What Erie kids can join, what closes soon, and the school days off.',
    schools: [
      {
        district: 'St. Vrain Valley Schools',
        label: 'St. Vrain Valley: maps and boundaries',
        url: 'https://www.svvsd.org/schools/maps-boundaries/',
        note: 'Most of Erie. The Erie feeder: Black Rock, Erie, Grand View, Highlands and Red Hawk elementaries, Soaring Heights PK-8, Erie Middle and Erie High; a new elementary in Colliers Hill opens fall 2027',
      },
      {
        district: 'Boulder Valley School District',
        label: 'Boulder Valley: K-12 School Finder',
        url: 'https://www.bvsd.org/departments/enrollment/k-12-school-finder',
        note: 'Part of Erie; Meadowlark PK-8, 2300 Meadow Sweet Lane, is the district’s school in town. The finder shows 2027–28 areas; for this year’s, email enrollment.helpdesk@bvsd.org',
      },
    ],
    breaks: [
      { district: 'Boulder Valley', label: 'Boulder Valley: Veterans Day', from: '2026-11-11', to: '2026-11-11', source: 'https://www.bvsd.org/calendar', verified: '2026-10-22' },
      { district: 'St. Vrain', label: 'St. Vrain: Thanksgiving break', from: '2026-11-23', to: '2026-11-27', source: 'https://svvsd.org/wp-content/uploads/2026/06/26-27-SVVSD-4_8_26-2.pdf', verified: '2026-10-22' },
      { district: 'Boulder Valley', label: 'Boulder Valley: conference exchange days, then Thanksgiving break', from: '2026-11-23', to: '2026-11-27', source: 'https://www.bvsd.org/calendar', verified: '2026-10-22' },
      { district: 'St. Vrain', label: 'St. Vrain: Winter break', from: '2026-12-21', to: '2027-01-01', source: 'https://svvsd.org/wp-content/uploads/2026/06/26-27-SVVSD-4_8_26-2.pdf', verified: '2026-10-22' },
      { district: 'Boulder Valley', label: 'Boulder Valley: Winter break', from: '2026-12-21', to: '2027-01-01', source: 'https://www.bvsd.org/calendar', verified: '2026-10-22' },
      { district: 'St. Vrain', label: 'St. Vrain: Non-student contact day', from: '2027-01-04', to: '2027-01-04', source: 'https://svvsd.org/wp-content/uploads/2026/06/26-27-SVVSD-4_8_26-2.pdf', verified: '2026-10-22' },
      { district: 'Boulder Valley', label: 'Boulder Valley: Professional development day', from: '2027-01-04', to: '2027-01-04', source: 'https://www.bvsd.org/calendar', verified: '2026-10-22' },
      { district: 'St. Vrain', label: 'St. Vrain: Martin Luther King Jr. Day', from: '2027-01-18', to: '2027-01-18', source: 'https://svvsd.org/wp-content/uploads/2026/06/26-27-SVVSD-4_8_26-2.pdf', verified: '2026-10-22' },
      { district: 'Boulder Valley', label: 'Boulder Valley: Martin Luther King Jr. Day', from: '2027-01-18', to: '2027-01-18', source: 'https://www.bvsd.org/calendar', verified: '2026-10-22' },
      { district: 'St. Vrain', label: 'St. Vrain: Non-student contact day', from: '2027-02-12', to: '2027-02-12', source: 'https://svvsd.org/wp-content/uploads/2026/06/26-27-SVVSD-4_8_26-2.pdf', verified: '2026-10-22' },
      { district: 'St. Vrain', label: 'St. Vrain: Presidents’ Day', from: '2027-02-15', to: '2027-02-15', source: 'https://svvsd.org/wp-content/uploads/2026/06/26-27-SVVSD-4_8_26-2.pdf', verified: '2026-10-22' },
      { district: 'Boulder Valley', label: 'Boulder Valley: Presidents’ Day, a conference exchange day and a professional development day', from: '2027-02-15', to: '2027-02-17', source: 'https://www.bvsd.org/calendar', verified: '2026-10-22' },
      { district: 'St. Vrain', label: 'St. Vrain: Spring break', from: '2027-03-15', to: '2027-03-19', source: 'https://svvsd.org/wp-content/uploads/2026/06/26-27-SVVSD-4_8_26-2.pdf', verified: '2026-10-22' },
      { district: 'Boulder Valley', label: 'Boulder Valley: Spring break', from: '2027-03-15', to: '2027-03-19', source: 'https://www.bvsd.org/calendar', verified: '2026-10-22' },
      { district: 'St. Vrain', label: 'St. Vrain: Non-student contact days', from: '2027-04-26', to: '2027-04-27', source: 'https://svvsd.org/wp-content/uploads/2026/06/26-27-SVVSD-4_8_26-2.pdf', verified: '2026-10-22' },
    ],
  },
  livingHere: {
    intro: 'Who handles what in Erie, across two counties, with the official page for each.',
    sections: [
      {
        title: 'Utilities',
        note: 'Water, wastewater and storm drainage are the Town’s, on one monthly bill. Electricity is United Power or Xcel Energy, and natural gas Xcel or Black Hills Energy: it depends on the address.',
        verified: '2026-10-22',
        items: [
          { label: 'Who serves your address: the Town’s utility map', url: 'https://www.erieco.gov/1284/Utility-Providers', note: 'Electricity, gas, phone and internet providers, with an interactive map by address' },
          { label: 'Town of Erie utility billing (water and wastewater)', url: 'https://www.erieco.gov/581/Utility-Billing', note: 'Town Hall, 645 Holbrook St, 303-926-2700, utilbilling@erieco.gov; title companies transfer service to new owners' },
          { label: 'Pay the water bill online', url: 'https://erieco.payacp.com/home', note: 'Or pay and review by phone, 855-456-1140' },
          { label: 'United Power', url: 'https://www.unitedpower.com/', note: 'Electricity in parts of Erie' },
          { label: 'Xcel Energy', url: 'https://www.xcelenergy.com/', note: 'Electricity in parts of Erie, and natural gas' },
          { label: 'Black Hills Energy', url: 'https://www.blackhillsenergy.com/', note: 'Natural gas in parts of Erie' },
        ],
      },
      {
        title: 'Trash and recycling',
        note: 'The Town runs no household trash service: each household, or its HOA, contracts with a private hauler. Check the HOA’s rules before signing up.',
        verified: '2026-10-22',
        items: [
          { label: 'Haulers the Town lists', url: 'https://www.erieco.gov/1284/Utility-Providers', note: 'One Way, Republic Services, Waste Connections, Waste Management and Western Disposal; curbside compost from Waste Connections, Western Disposal and Wompost' },
          { label: 'Erie Recycling Center, 1000 Briggs St', url: 'https://www.erieco.gov/282/Recycling-Center', note: 'Free for Erie residents (a Town water bill is proof): single-stream, cardboard, yard waste and food scraps; 8 am to 4 pm daily, holidays and weather permitting; 303-926-2734' },
          { label: 'Household hazardous waste', url: 'https://www.erieco.gov/980/Household-Hazardous-Waste', note: 'Boulder County’s facility at 1901 63rd St takes Erie residents from either county, Wednesday to Saturday 8:30 to 4; Weld County’s are in Greeley and Dacono' },
          { label: 'Eco-Cycle CHaRM: hard-to-recycle items', url: 'https://ecocycle.org/services-and-facilities/charm/', note: 'In Boulder; takes plastic bags, which the Erie center does not' },
        ],
      },
      {
        title: 'Getting around',
        note: 'Erie is split between two counties at County Line Road. The Town plows its own streets; county roads are Boulder County’s to maintain on the west side and Weld County’s on the east.',
        verified: '2026-10-22',
        items: [
          { label: 'The Erie Bee: free rides around town', url: 'https://www.erieco.gov/2626/The-Erie-Bee', note: 'On-demand shared rides within Erie, weekdays 6 am to 8 pm; book in the app or at 720-303-9511; riders 13 and up may ride alone' },
          { label: 'RTD buses from Erie', url: 'https://www.erieco.gov/2513/Transit-Services', note: 'The JUMP to Boulder from the Community Center, which keeps 15 stalls for riders, about 40 minutes; the LD1 and LD3 from the Lafayette Park-n-Ride; the 120X to downtown Denver from Wagon Road' },
          { label: 'Snow removal', url: 'https://www.erieco.gov/546/Snow-Removal-Procedures', note: 'Primary routes and school access first, neighborhood streets after heavier storms; property owners clear their sidewalks within 24 hours' },
          { label: 'CDOT road conditions', url: 'https://www.cotrip.org/', note: 'Colorado 7 and I-25' },
        ],
      },
      {
        title: 'Parks and recreation',
        verified: '2026-10-22',
        items: [
          { label: 'Register for recreation programs', url: 'https://app.amilia.com/store/en/erierec/shop/programs', note: 'An Amilia account is required; registration for winter and spring (January to April) typically opens in mid-December', track: 'registration' },
          { label: 'Erie Community Center, 450 Powers St', url: 'https://www.erieco.gov/172/Erie-Community-Center', note: 'Open to everyone: Mon–Thu 5 am–9 pm, Fri 5–7, Sat 7–7, Sun 8–5; 303-926-2550' },
          { label: 'Recreation scholarships', url: 'https://www.erieco.gov/2605/Recreation-Scholarship-Programs', note: 'Up to $200 a person a year for Erie residents in a federal assistance program; this year’s applications close November 30', track: 'registration' },
          { label: 'Pool schedule', url: 'https://www.erieco.gov/2139/Pool-Schedule', note: 'Open swim and lap swim through December 19' },
          { label: 'Parks', url: 'https://www.erieco.gov/2271/Parks', note: 'Open sunrise to sunset, Erie Community Park 6 am to 10 pm; shelter permits through Amilia' },
          { label: 'Trail maps', url: 'https://www.erieco.gov/205/Trail-Maps' },
        ],
      },
      {
        title: 'Schools',
        note: 'Most of Erie is in St. Vrain Valley Schools and part is in Boulder Valley. The district goes by the address, not the town.',
        verified: '2026-10-22',
        items: [
          { label: 'St. Vrain Valley Schools: maps and boundaries', url: 'https://www.svvsd.org/schools/maps-boundaries/' },
          { label: 'St. Vrain: open enrollment', url: 'https://www.svvsd.org/schools/enrollment/open-enrollment/', note: 'December 1–15 for 2027–28, online', track: 'registration' },
          { label: 'St. Vrain: 2026–27 calendar', url: 'https://www.svvsd.org/schools/school-calendar/' },
          { label: 'Erie High School', url: 'https://ehs.svvsd.org/', note: '3180 County Road 5, 303-828-4213' },
          { label: 'Boulder Valley: K-12 School Finder', url: 'https://www.bvsd.org/departments/enrollment/k-12-school-finder', note: 'Meadowlark PK-8, 2300 Meadow Sweet Lane, 720-561-5403' },
          { label: 'Boulder Valley: choice enrollment', url: 'https://www.bvsd.org/departments/enrollment', note: 'The lottery for 2027–28 takes applications November 1 to December 18', track: 'registration' },
          { label: 'Boulder Valley: 2026–27 calendar', url: 'https://www.bvsd.org/calendar' },
        ],
      },
      {
        title: 'Reporting a problem',
        verified: '2026-10-22',
        items: [
          { label: 'ErieSubmit: report it to the Town', url: 'https://www.erieco.gov/1249/Erie-Submit', note: 'Potholes, traffic signals, sprinkler leaks, streetlights, park damage; on the web or in the app' },
          { label: 'Erie Police Department', url: 'https://www.erieco.gov/2350/Police', note: '1000 Telleen Ave; non-emergency 303-441-4444, the Boulder County dispatch center that answers for Erie; emergency 911' },
          { label: 'Mountain View Fire Rescue', url: 'https://www.mvfpd.org/contact-us', note: 'Fire and emergency medical service for Erie; non-emergency calls through Boulder County, 303-441-4444, or Weld County, 970-350-9600; office 303-772-0710' },
          { label: 'Emergency alerts', url: 'https://www.erieco.gov/370/Emergency-Alerts', note: 'Every Erie resident, on either side of County Line Road, should sign up for Boulder County’s alerts; Weld County’s CodeRED as well' },
          { label: 'Notify Me', url: 'https://www.erieco.gov/list.aspx', note: 'Town news, police advisories, and road, trail and recycling-center closures by email or text' },
        ],
      },
      {
        title: 'Town meetings and participation',
        note: 'The Town holds its elections with both counties, so your ballot comes from Boulder County west of County Line Road and from Weld County east of it.',
        verified: '2026-10-22',
        items: [
          { label: 'Town Council', url: 'https://www.erieco.gov/318/Town-Council', note: '2nd and 4th Tuesdays at 6:30 pm, Council Chambers, Town Hall, 645 Holbrook St; comment in person, on Zoom or in writing to the Town Clerk; sign up to speak online or at the kiosk', track: 'participation' },
          { label: 'Agendas, minutes and recordings', url: 'https://erieco.portal.civicclerk.com/', note: 'Agendas posted at least 24 hours ahead' },
          { label: '2026 Town election', url: 'https://www.erieco.gov/1345/2026-Election', note: 'November 3: Council seats in Districts 1, 2 and 3' },
          { label: 'Boulder County Elections', url: 'https://bouldercounty.gov/elections/', note: 'For addresses west of County Line Road; 303-413-7740' },
          { label: 'Weld County Elections', url: 'https://www.weld.gov/Government/Departments/Clerk-and-Recorder/Elections-Department', note: 'For addresses east of County Line Road; 970-304-6525' },
        ],
      },
    ],
  },
  movingHere: {
    listingsLinks: [
      { label: 'Homes for sale on Zillow', url: 'https://www.zillow.com/homes/Erie,-CO_rb/' },
      { label: 'Homes for sale on Redfin', url: 'https://www.redfin.com/zipcode/80516' },
      { label: 'Homes for sale on Realtor.com', url: 'https://www.realtor.com/realestateandhomes-search/Erie_CO' },
    ],
    schoolDistrict:
      'Mostly St. Vrain Valley Schools (Erie, Red Hawk and Black Rock elementaries, Soaring Heights PK-8, Erie Middle, Erie High); the Boulder County side is Boulder Valley (Meadowlark PK-8).',
    commuteNotes:
      'About 20 minutes to Boulder on Arapahoe Road or Colorado 7, 35 to Denver and 35 to Denver International Airport by I-25 and E-470. Most commutes are by car.',
  },
  officialLinks: {
    townSite: 'https://www.erieco.gov/',
    townSiteLabel: 'the Town of Erie',
    policeNonEmergency: 'https://www.erieco.gov/246/Police-Department',
    policeNonEmergencyLabel: 'Erie Police Department',
  },
  formspreeId: 'maenejow',
  plausible: true,
};
