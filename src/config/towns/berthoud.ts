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
    // #3D6041, from 9 October). The shade Berthoud High's own site brands
    // with (bhs.tsd.org's primary colour), in place of MaxPreps's 8F0018,
    // which read as red. The same maroon src/config/school-sports.ts names,
    // so the sports pages and the rest of the guide are one colour.
    primary: '#572932',
    accent: '#C39B50',
    paper: 'warm',
  },
  // The line under each Find your next stop tile (TownConfig.nextStop), the owner’s, 9 November 2026.
  nextStop: { eatDrink: 'Coffee, restaurants, breweries', thingsToDo: 'Parks, trails, Carter Lake', living: 'Utilities, schools, who to call' },
  hero: {
    // Bought from iStock on 28 October 2026 (docs/HERO-PHOTOS.md). Its
    // editorial licence wants this credit beside the photograph, so the
    // hero prints it (PERMISSIONS.md, Stock licences).
    image: 'iStock-1417954947.jpg',
    alt: 'Downtown Berthoud on a sunny July morning in 2021: flower planters on a street corner, a stone-and-brick storefront and the brick block beside it, and the old grain elevator, painted with a mural of a farm family, at the end of the street',
    credit: 'iStock.com/JuniperCreek',
  },
  social: {
    email: 'hello@insideberthoud.com',
  },
  // A resident guide (TownConfig.home), since 21 October 2026.
  home: true,
  // Quick answers under What's happening (the owner, 8 November 2026).
  quickAnswers: {},
  /**
   * Berthoud High's colours, read from its own site 25 October 2026
   * (bhs.tsd.org): the theme's `--primary-color` is #572932, the maroon
   * the guide's primary already is. The theme's `--secondary-color` is a
   * second maroon (#7F3035), a web shade rather than a school colour, and
   * the school's logo (bhs-both.png) is maroon, white and black, so the
   * second colour is white.
   */
  school: { name: 'Berthoud High School', mascot: 'Spartans', teamName: 'Berthoud Spartans', primary: '#572932', secondary: '#FFFFFF' },
  families: {
    label: 'Berthoud Families',
    intro: 'What Berthoud kids can join, what closes soon, and the school days off.',
    schools: [
      {
        district: 'Thompson School District R2-J',
        label: 'Thompson School District: school locator',
        url: 'https://www.tsd.org/family/school-locator',
        // Choice window from Thompson's School of Choice page (tsd.org/enroll/choice), read 9 November 2026.
        note: 'Berthoud Elementary, Ivy Stockwell, Turner Middle and Berthoud High; most of town; choice enrollment for 2027–28, by lottery, is open November 3, 2026 to January 29, 2027',
      },
      {
        district: 'Weld RE-5J',
        label: 'Weld RE-5J (Johnstown-Milliken)',
        url: 'https://www.weldre5j.org/',
        note: 'Serves small portions of Berthoud on the Weld County side; check the address with the district',
      },
    ],
    breaks: [
      { district: 'Thompson', label: 'Thanksgiving break', from: '2026-11-23', to: '2026-11-27', source: 'https://www.tsd.org/fs/pages/9769', verified: '2026-10-21' },
      { district: 'Thompson', label: 'Winter break', from: '2026-12-21', to: '2027-01-04', source: 'https://www.tsd.org/fs/pages/9769', verified: '2026-10-21' },
      { district: 'Thompson', label: 'Staff professional day (no students)', from: '2027-01-05', to: '2027-01-05', source: 'https://www.tsd.org/fs/pages/9769', verified: '2026-10-21' },
      { district: 'Thompson', label: 'Martin Luther King Jr. Day (district closed)', from: '2027-01-18', to: '2027-01-18', source: 'https://www.tsd.org/fs/pages/9769', verified: '2026-11-09' },
      { district: 'Thompson', label: 'No K–5 students', from: '2027-01-19', to: '2027-01-19', source: 'https://www.tsd.org/fs/pages/9769', verified: '2026-11-09' },
      { district: 'Thompson', label: 'Staff professional day (no students)', from: '2027-02-12', to: '2027-02-12', source: 'https://www.tsd.org/fs/pages/9769', verified: '2026-11-09' },
      { district: 'Thompson', label: 'Presidents Day (district closed)', from: '2027-02-15', to: '2027-02-15', source: 'https://www.tsd.org/fs/pages/9769', verified: '2026-11-09' },
      { district: 'Thompson', label: 'No school for students', from: '2027-03-04', to: '2027-03-04', source: 'https://www.tsd.org/fs/pages/9769', verified: '2026-11-09' },
      { district: 'Thompson', label: 'Conferences (no students)', from: '2027-03-05', to: '2027-03-05', source: 'https://www.tsd.org/fs/pages/9769', verified: '2026-11-09' },
      { district: 'Thompson', label: 'Spring break', from: '2027-03-15', to: '2027-03-19', source: 'https://www.tsd.org/fs/pages/9769', verified: '2026-10-21' },
      { district: 'Thompson', label: 'Teacher work day (no students)', from: '2027-04-30', to: '2027-04-30', source: 'https://www.tsd.org/fs/pages/9769', verified: '2026-11-09' },
      { district: 'Thompson', label: 'No K–5 students', from: '2027-05-03', to: '2027-05-03', source: 'https://www.tsd.org/fs/pages/9769', verified: '2026-11-09' },
    ],
  },
  participation: {
    // One name for the route on every guide (navigation audit, 22 October
    // 2026): it was "Join Something" here and "Get Involved" on Niwot.
    label: 'Get involved',
    intro: 'Clubs, boards, volunteering and groups in Berthoud, and how to join each.',
  },
  livingHere: {
    intro: 'Who handles what in Berthoud, with the official page for each.',
    sections: [
      {
        title: 'Utilities',
        note: 'Water and sewer are the Town’s. Electricity is Xcel Energy in most of town and Poudre Valley REA on parts of the edges; the provider depends on the address.',
        verified: '2026-11-06',
        items: [
          // The Town's Utility Billing page, read 8 November 2026; the link was the Town's home page until then (audit of 8 November 2026).
          { label: 'Town of Berthoud utility billing (water and sewer)', url: 'https://www.berthoud.org/193/Utility-Billing', note: 'Town Hall, 807 Mountain Avenue, 970-532-2643 (option 1); water and sewer emergencies, any hour, 970-556-6184' },
          { label: 'Trash and utility providers, as the Town lists them', url: 'https://www.berthoud.org/1387/Trash-and-Utility-Providers', note: 'Haulers must be licensed by the Town; some HOAs and metro districts limit you to one' },
          { label: 'Poudre Valley REA: service territory', url: 'https://pvrea.coop/the-co-op/about-pvrea/service-territory/', note: 'The co-op’s map; member services 1-800-432-1012' },
          { label: 'Xcel Energy', url: 'https://www.xcelenergy.com/', note: 'Electricity in most of town, and natural gas' },
        ],
      },
      {
        title: 'Trash and recycling',
        verified: '2026-11-06',
        items: [
          { label: 'Licensed haulers and HOA rules', url: 'https://www.berthoud.org/1387/Trash-and-Utility-Providers', note: 'Private, household by household; the Town’s business directory lists the licensed companies' },
          { label: 'Larimer County solid waste and recycling', url: 'https://www.larimer.gov/solidwaste', note: 'The county landfill has closed; the county’s page says where household waste, recycling and hazardous waste now go' },
        ],
      },
      {
        title: 'Getting around',
        verified: '2026-11-06',
        items: [
          { label: 'BATS: Berthoud Area Transportation Service', url: 'https://berthoud.org/159/Berthoud-Area-Transportation-Service-BAT', note: 'Door-to-door rides in town daily 8–4 and to Loveland on weekday mornings (Thursday afternoons too); free over 60, $1 in town, $4 to Loveland; book by 4 pm the business day before, 970-532-3049' },
          { label: 'Transfort FLEX regional bus', url: 'https://www.berthoud.org/162/Transfort-FLEX', note: 'Fort Collins to Loveland, Berthoud, Longmont and Boulder; two stops downtown' },
          { label: 'RAFT (Rural Alternative for Transportation)', url: 'https://berthoudraft.org/', note: 'Door-to-door rides to Berthoud, Loveland and Longmont for riders 60 and over and adults with a disability who live in the Berthoud Fire Protection District; no set fare, donations; 970-532-0808' },
          { label: 'CDOT road conditions', url: 'https://www.cotrip.org/', note: 'US 287, CO 56 and I-25' },
        ],
      },
      {
        title: 'Parks and recreation',
        verified: '2026-11-06',
        items: [
          { label: 'Berthoud Recreation: registration', url: 'https://apps.daysmartrecreation.com/dash/x/berthoud/', note: 'Leagues, classes, swim lessons and passes; the activity guide links into it', track: 'registration' },
          { label: 'Recreation Center facility schedules', url: 'https://www.berthoud.org/1521/Facility-Schedules', note: 'Pool, gym and holiday hours' },
          { label: 'Activity guides and registration dates', url: 'https://www.berthoud.org/1598/Activity-Guide', note: 'Winter opened November 1 (early-bird prices for registrations by November 14); spring opens February 1, summer April 1, fall July 1', track: 'registration' },
          { label: 'Town parks', url: 'https://www.berthoud.org/219/Parks', note: 'Town Park’s rentable pavilions and the Town’s park pages' },
        ],
      },
      {
        title: 'Schools',
        note: 'Most of Berthoud is in Thompson School District R2-J; a small part on the Weld County side is in Weld RE-5J. Check the address, not the town.',
        verified: '2026-11-06',
        items: [
          { label: 'Thompson School District: school locator', url: 'https://www.tsd.org/family/school-locator' },
          { label: 'Thompson: attendance boundaries', url: 'https://www.tsd.org/departments/operations/planning/attendance-boundaries' },
          { label: 'Thompson: 2026–27 calendar highlights', url: 'https://www.tsd.org/fs/pages/9769', note: 'Breaks and no-school days' },
          // Read 9 November 2026 (gap report of the same day).
          { label: 'Thompson: School of Choice', url: 'https://www.tsd.org/enroll/choice', note: 'Choice enrollment for 2027–28, to ask for a school other than the assigned one, is open November 3, 2026 to January 29, 2027; eligible applications go into a lottery. Families outside the district apply through open enrollment, November 3, 2026 to August 18, 2027', track: 'registration' },
          { label: 'Weld RE-5J', url: 'https://www.weldre5j.org/', note: 'For addresses on the Weld side; 970-587-6050' },
        ],
      },
      {
        title: 'Reporting a problem',
        verified: '2026-11-06',
        items: [
          { label: 'Report a concern to the Town', url: 'https://survey123.arcgis.com/share/25aa98a9fe18431aa47b7be8bcf1500f?portalUrl=https://berthoudpubworks.maps.arcgis.com', note: 'Public works: streets, water, parks' },
          { label: 'Larimer County Sheriff: non-emergency dispatch', url: 'https://www.larimer.gov/sheriff', note: 'Non-emergency and dispatch 970-416-1985; in an emergency call 911' },
          { label: 'Larimer County Sheriff, Berthoud squad', url: 'https://www.larimer.gov/sheriff/patrol/berthoud-squad', note: 'The squad that polices the town, based at Town Hall; its sergeant’s email is on the page' },
          { label: 'Berthoud Fire Protection District', url: 'https://www.berthoudfire.org/', note: 'Main number 970-532-2264; in an emergency call 911' },
          { label: 'Town eNotifications', url: 'https://berthoud.org/list.aspx', note: 'Alerts and news by email' },
        ],
      },
      // The sections below fill the gaps in the gap report of 9 November 2026
      // (M1, M3, M4, M5); every link was read that day.
      {
        title: 'Health care',
        note: 'In an emergency call 911.',
        verified: '2026-11-09',
        items: [
          { label: 'UCHealth Primary Care – Berthoud', url: 'https://www.uchealth.org/locations/uchealth-primary-care-berthoud/', note: 'The clinic in town, 1335 Grand Market Avenue, Suite 110; Monday to Friday 8 am to 5 pm; 970-674-4920' },
          { label: 'UCHealth Medical Center of the Rockies', url: 'https://www.uchealth.org/locations/uchealth-medical-center-of-the-rockies/', note: 'Emergency department and a Level I trauma center, 2500 Rocky Mountain Ave, Loveland; 970-624-2500' },
          { label: 'UCHealth Longs Peak Hospital', url: 'https://www.uchealth.org/locations/uchealth-longs-peak-hospital/', note: 'Emergency department, 1750 E. Ken Pratt Blvd, Longmont; 720-718-7000' },
          { label: 'UCHealth Urgent Care – Johnstown', url: 'https://www.uchealth.org/locations/uchealth-urgent-care-johnstown/', note: '4846 Larimer Parkway, Johnstown; Monday to Friday 8 am to 8 pm, weekends 8 am to 6 pm; 970-624-2834' },
          { label: 'UCHealth Urgent Care – Main Street, Longmont', url: 'https://www.uchealth.org/locations/uchealth-urgent-care-longmont/', note: '2101 Main St, Longmont; Monday to Friday 8 am to 8 pm, weekends 8 am to 6 pm; 720-745-8030' },
        ],
      },
      {
        title: 'Cars and property tax',
        note: 'These are Larimer County’s; an address on the Weld County side goes to Weld County instead.',
        verified: '2026-11-09',
        items: [
          { label: 'Larimer County vehicle licensing', url: 'https://www.larimer.gov/clerk/vehiclelicensing', note: 'Registration and titles. Offices in Loveland, 200 Peridot Ave, first floor (970-619-4521), and Fort Collins, 200 W. Oak St (970-498-7878), Monday to Friday 8 am to 5 pm except holidays; renew online, by phone, in person or at a self-service kiosk' },
          { label: 'Larimer County Treasurer: property tax', url: 'https://www.larimer.gov/treasurer', note: 'Paid in two halves, by February 28 and June 15, or in full by April 30, moving to the next business day when a date falls on a weekend or holiday; online, or monthly through EquaPay where a mortgage does not pay it; 200 W. Oak St, Suite 2100, Fort Collins, 970-498-7020' },
        ],
      },
      {
        title: 'Streets, snow and leaves',
        verified: '2026-11-09',
        items: [
          { label: 'Town streets and drainage', url: 'https://berthoud.org/241/Streets-Drainage', note: 'The Town plows its streets by priority, by how much snow has fallen and how much traffic a street carries; property and business owners clear their own snow and ice. Sweepers run the second week of each month from April through November, weekdays 7 am to 3 pm, so move cars, trash cans and basketball hoops off the street that week. Leaves are the owner’s to clear: sweepers leave piles of leaves, and blowing leaves or grass into the street is illegal. Streets Department, for road and sidewalk work, 970-532-2210' },
        ],
      },
      {
        title: 'Pets and animals',
        verified: '2026-11-09',
        items: [
          { label: 'Pet licenses', url: 'https://berthoud.org/1398/Pet-License', note: 'Every dog and cat in town needs a Town license, from Town Hall with a rabies certificate: $10 spayed or neutered, $20 intact, no fee for seniors; each is good for the calendar year' },
          { label: 'Animal control: NOCO Humane', url: 'https://www.nocohumane.org/animal-control/berthoud/', note: 'The Town’s animal protection and control partner, with full field service Thursday to Monday; dispatch 970-226-3647, ext. 7' },
        ],
      },
      {
        title: 'Food help',
        verified: '2026-11-09',
        items: [
          { label: 'Larimer County’s list of food pantries', url: 'https://larimer.gov/extension/larimer-county-farmers-market/marketdays/foodpantries', note: 'In Berthoud: House of Neighborly Service, 375 Meadowlark Drive, Tuesday and Thursday 9 am to 5 pm, and Grace Place’s mobile pantry at the same address on the second and fourth Saturdays, 10:30 to 11:30 am; both 970-532-0161' },
        ],
      },
      {
        title: 'Child care and preschool',
        verified: '2026-11-09',
        items: [
          { label: 'Thompson Early Childhood: preschool registration', url: 'https://preschool.tsd.org/register', note: 'The district’s preschool, with sites in Berthoud. New families fill in the interest form and register online, and the team then schedules a screening; returning families re-register from February. tsdearlychildhood@tsd.org, 970-613-5052', track: 'registration' },
          { label: 'The Learning Experience, 1144 Lake Ave', url: '/places/the-learning-experience-berthoud/', note: 'Child care and preschool for ages six weeks to five years, weekdays 6:30 am to 6 pm' },
        ],
      },
      {
        title: 'Town meetings and participation',
        verified: '2026-11-06',
        items: [
          { label: 'How to participate', url: 'https://www.berthoud.org/258/How-to-Participate', note: 'Board of Trustees 2nd and 4th Tuesdays, 6:30 pm; three minutes for any resident', track: 'participation' },
          { label: 'Agendas and minutes', url: 'https://berthoudco.portal.civicclerk.com/' },
          { label: 'Advisory committee application', url: 'https://www.berthoud.org/FormCenter/General-Forms-4/Advisory-Committee-Application-95', note: 'Parks and trails, planning, trees, historic preservation, public art, the Local Licensing Authority and the Youth Advisory Commission', track: 'participation' },
          { label: 'Engage Berthoud: projects open to comment', url: 'https://engage.berthoud.org/', note: 'The stormwater master plan, the water efficiency plan and Jaskowski open space; Mountain Vista Park is listed as in development and closed to feedback', track: 'participation' },
          { label: 'Larimer County elections', url: 'https://www.larimer.gov/clerk/elections/current-elections/2026', note: 'The November 3 election: unofficial results; signatures can be cured until November 12, final unofficial results are expected November 13 and final results by November 25' },
        ],
      },
    ],
  },
  about: {
    who: [
      'Inside Berthoud is published by Lerner Works, the small studio James Lerner runs. James grew up in Niwot, in Boulder County, and edits this guide from the sources every listing names: the Town’s own pages, the library, the school district, and the businesses’ and organizers’ sites, checked on the dates shown. He is not a Berthoud resident and has no standing with the Town, the chamber or any organization listed here; nothing on the guide is endorsed by any of them.',
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
