import type { TownConfig } from './types.ts';

/**
 * The Carbon Valley: the Town of Frederick, the Town of Firestone and the
 * City of Dacono, the three coal towns east of I-25 on Colorado 52, north of
 * Erie, that their own pages call the Tri-Towns or the Carbon Valley
 * (firestoneco.gov/281/History-of-Firestone). One guide for the three, one
 * of the seven standalone guides (src/config/hub-towns.ts), and sports-led:
 * Frederick High's Golden Eagles are the three towns' high school. Front
 * Range chassis. The name never followed the "Inside <Town>" pattern in its
 * address: carbonvalleyguide.com is the owner's domain for it.
 *
 * Its history, shortest first: a guide to the three towns from 5 October
 * 2026 (Fort Lupton a fourth section from 12 October); closed on 2 November
 * 2026, when Frederick alone went on as Inside Frederick at
 * insidefrederickco.com and the Firestone, Dacono and Fort Lupton listings
 * left (git history keeps them); and the guide again from 12 November 2026.
 * The owner's restructure brief of that day lists Carbon Valley as the
 * standalone guide, with Frederick covered by it and insidefrederickco.com
 * and insidefirestone.com forwarding to it; the first pass of the
 * restructure had it the other way round, and the owner's QA brief of the
 * same day said so again (DECISIONS.md, "Carbon Valley is the guide;
 * Frederick is covered by it"). Fort Lupton is not part of it: it has its
 * own page on the hub.
 *
 * What is here is what Inside Frederick held on 12 November 2026, moved with
 * its slugs (content/carbon-valley/, data/carbon-valley/): the Frederick
 * listings, the ones in Firestone it already carried (the library, the
 * Community Center, St. Vrain State Park, the grocery and the pharmacy), the
 * rec district's programs for all three towns, and the Frederick High sports
 * file. Each file names its source. Nothing was added for Firestone or
 * Dacono in the move; what the closed guide listed for them is the owner's
 * to bring back or not.
 *
 * The figures below are still Frederick's own (the Wikipedia infobox, census
 * and GNIS, read 2 November 2026), and the comments say so: whether the
 * guide should give the three towns' summed figures, as it did until 2
 * November, is the owner's call.
 */
export const carbonValley: TownConfig = {
  kind: 'town',
  // Live again 12 November 2026 (the owner's restructure brief), with what
  // Inside Frederick held that day. The Vercel project `carbonvalleyguide`,
  // DNS and Email Routing are the owner's (DEPLOY.md).
  status: 'live',
  variant: 'front-range',
  region: 'Carbon Valley & I-25',
  // Erie, down Colorado 52; it names Carbon Valley back. (Longmont, up 119,
  // was the other until its guide was folded on 12 November 2026.)
  neighbors: ['erie'],
  slug: 'carbon-valley',
  name: 'Carbon Valley',
  domain: 'carbonvalleyguide.com',
  siteTitle: 'Inside Carbon Valley',
  tagline:
    'An independent guide to Frederick, Firestone and Dacono, Colorado: Fifth Street, Milavec Lake, the parks and trails, the Golden Eagles and what’s on.',
  // A few enduring words, no year, no vote.
  shortTagline: 'Frederick, Firestone and Dacono on one guide',
  // Short enough that the state survives the search-result trim (test/towns.test.ts).
  // The three towns by name, as the guide had it until 2 November 2026.
  seoTagline: 'Frederick, Firestone and Dacono, Colorado',
  // One line for the comparison table, as the three-town guide had it until
  // 2 November 2026, less its census years: the flagship test keeps the one
  // line enduring.
  character: 'Three coal towns in a row along I-25 north of Erie that grew by more than half between the last two censuses, with one library, one rec district and one Main Street each.',
  // The three towns summed, as this config had them until 12 November 2026
  // (the Wikipedia infobox, read 5 October 2026). 2020 census: Frederick
  // 14,513 + Firestone 16,381 + Dacono 6,297. 2010 census: Frederick 8,679 +
  // Firestone 10,147 + Dacono 4,152.
  population: 37191,
  population2010: 22978,
  // Frederick's, GNIS via the Wikipedia infobox: 4,938 ft (1,505 m);
  // Firestone is 4,856 and Dacono 5,112.
  elevationFt: 4938,
  // 26 December 1907, per the Wikipedia infobox (State Archives), and the
  // Town's own history page says incorporated in 1907 by Frederick A.
  // Clark's daughters; the State Demography Office's historical census file
  // (read 2 November 2026) says 1908. The Town's own word and the Archives'
  // date agree, so 1907 stands, as the Carbon Valley config had it, with the
  // state file's year noted here as the odd one out. Frederick's is the
  // earliest of the three (Firestone 8 October 1908, Dacono 1908), so the
  // comparison reads "since 1907".
  incorporated: 1907,
  // Frederick's, the middle town of the three: GNIS, via the Wikipedia
  // infobox, 40°06′50″N 105°00′40″W (40.11389, -105.01111).
  lat: 40.1139,
  lng: -105.0111,
  // The Town of Frederick's own page "What Matters to You? Find it in
  // Frederick" (/699), read 2 November 2026: about 35 minutes to downtown
  // Denver (33 to DIA). The three centres are within four miles of each
  // other, so one origin stands for all.
  driveToDenver: 'About 35 min from Frederick',
  counties: ['Weld'],
  state: 'CO',
  colors: {
    // Golden Eagle navy, Frederick High's colour, the Carbon Valley guide's
    // since 22 October 2026 and Frederick's own since 2 November: the shade
    // the school's own site brands with (`--color-primary: #1c2550`).
    primary: '#1C2550',
    accent: '#C48B54',
    paper: 'cool',
  },
  // The line under each Find your next stop tile (TownConfig.nextStop), from what
  // the three pages list, 9 November 2026.
  nextStop: { eatDrink: 'Coffee, restaurants, a brewery', thingsToDo: 'Parks, Milavec Lake, golf', living: 'Utilities, schools, who to call' },
  hero: {
    // Old-town Frederick, the Carbon Valley guide's hero from 28 October 2026
    // (docs/HERO-PHOTOS.md), moved here with the town on 2 November. Also the
    // Moving here guide's photograph. Attribution required by the licence;
    // IMAGE_LICENSES.csv has the row.
    image: 'fifth-street-at-oak.jpg',
    alt: 'Fifth Street in old-town Frederick at Oak Street under snow in 2018: a two-story red-brick corner building with a stepped parapet, frosted bare trees, a black lamppost and a few cars on the plowed street',
    credit: 'Jared Winkler, Wikimedia Commons, CC BY-SA 4.0',
  },
  social: {
    email: 'hello@carbonvalleyguide.com',
  },
  // A resident guide (TownConfig.home), from the start.
  home: true,
  // Quick answers under What's happening (parity with Berthoud, 9 November 2026).
  // The rec center link comes from data/frederick/rec-center.json (Carbon Valley Recreation Center).
  quickAnswers: {},
  /**
   * Frederick High School's colours as the school's own site sets them
   * (fhs.svvsd.org stylesheet, read 2 November 2026 from this container with
   * curl: `--color-primary: #1c2550`, `--color-secondary: #efc867`). MaxPreps
   * answered 200 to WebFetch with no colour values in the rendered page and
   * 403 to curl, so its schoolColor fields were not read. Mascot: "Home of the
   * Golden Eagles" on the school's site and MaxPreps' school path
   * (frederick-golden-eagles); MaxPreps' About blurb also says "home of the
   * Warriors", which the school's site does not.
   */
  school: { name: 'Frederick High School', mascot: 'Golden Eagles', teamName: 'Frederick Golden Eagles', primary: '#1C2550', secondary: '#EFC867' },
  // Read 2 November 2026 from St. Vrain Valley Schools' school-feeders page
  // (the Frederick feeder, Area 1), each school's own site for its address,
  // the district's maps-boundaries page for the lookup, and CDE's SchoolView
  // profile for Carbon Valley Academy (its own site answered 503). Grand View
  // Elementary has a Frederick address (6601 Aggregate Blvd) but its site says
  // "Erie Feeder Strong", so it is listed with that note. The breaks are every
  // no-school day left in 2026-27 on the district's one-page calendar PDF
  // (dated 8 April 2026, linked from /schools/school-calendar/), read locally
  // with pdftotext after WebFetch could not read the compressed stream.
  families: {
    label: 'Carbon Valley Families',
    intro: 'What Carbon Valley kids can join, what closes soon, and the school days off.',
    schools: [
      {
        district: 'St. Vrain Valley Schools',
        label: 'St. Vrain Valley Schools: boundary and address lookup',
        url: 'https://svvsdk12.maps.arcgis.com/apps/instant/lookup/index.html?appid=3d31949198604ad69e90303122023d0b',
        note: 'Enter an address to see its neighborhood schools; boundaries do not follow town lines, and open enrollment into any St. Vrain school with room runs December 1 to 15',
      },
      {
        district: 'St. Vrain Valley Schools',
        label: 'St. Vrain: school feeders (the Frederick feeder)',
        url: 'https://www.svvsd.org/schools/school-feeders/',
        note: 'Frederick High, Coal Ridge Middle, Thunder Valley K-8, Centennial, Legacy and Prairie Ridge elementaries and Spark! Discovery Preschool',
      },
      {
        district: 'St. Vrain Valley Schools',
        label: 'Frederick High School',
        url: 'https://fhs.svvsd.org/',
        note: '5690 Tipple Parkway, 303-833-3533',
      },
      {
        district: 'St. Vrain Valley Schools',
        label: 'Coal Ridge Middle School',
        url: 'https://crms.svvsd.org/',
        note: '6201 Booth Drive, Firestone',
      },
      {
        district: 'St. Vrain Valley Schools',
        label: 'Thunder Valley K-8',
        url: 'https://tvk8.svvsd.org/',
        note: '600 5th Street',
      },
      {
        district: 'St. Vrain Valley Schools',
        label: 'Legacy Elementary',
        url: 'https://legacyes.svvsd.org/',
        note: '7701 Eagle Boulevard',
      },
      {
        district: 'St. Vrain Valley Schools',
        label: 'Centennial Elementary',
        url: 'https://centenniales.svvsd.org/',
        note: '10290 Neighbors Parkway, Firestone',
      },
      {
        district: 'St. Vrain Valley Schools',
        label: 'Prairie Ridge Elementary',
        url: 'https://pres.svvsd.org/',
        note: '6632 St. Vrain Ranch Boulevard, Firestone',
      },
      {
        district: 'St. Vrain Valley Schools',
        label: 'Spark! Discovery Preschool',
        url: 'https://sdpk.svvsd.org/',
        note: '555 8th Street',
      },
      {
        district: 'St. Vrain Valley Schools',
        label: 'Grand View Elementary',
        url: 'https://gves.svvsd.org/',
        note: '6601 Aggregate Boulevard, a Frederick address in the Erie feeder',
      },
      {
        district: 'St. Vrain Valley Schools',
        label: 'Carbon Valley Academy (charter, pre-K to 8)',
        url: 'https://carbonvalleyacademy.org/',
        note: '4040 Coriolis Way; address and grades from the Colorado Department of Education, the school’s site being down on 2 November',
      },
    ],
    breaks: [
      { district: 'St. Vrain Valley Schools', label: 'Thanksgiving break', from: '2026-11-23', to: '2026-11-27', source: 'https://svvsd.org/wp-content/uploads/2026/06/26-27-SVVSD-4_8_26-2.pdf', verified: '2026-11-02' },
      { district: 'St. Vrain Valley Schools', label: 'Winter break; January 4 is a non-student contact day, and school resumes January 5', from: '2026-12-21', to: '2027-01-04', source: 'https://svvsd.org/wp-content/uploads/2026/06/26-27-SVVSD-4_8_26-2.pdf', verified: '2026-11-02' },
      { district: 'St. Vrain Valley Schools', label: 'Martin Luther King Jr. Day', from: '2027-01-18', to: '2027-01-18', source: 'https://svvsd.org/wp-content/uploads/2026/06/26-27-SVVSD-4_8_26-2.pdf', verified: '2026-11-02' },
      { district: 'St. Vrain Valley Schools', label: 'Non-student contact day', from: '2027-02-12', to: '2027-02-12', source: 'https://svvsd.org/wp-content/uploads/2026/06/26-27-SVVSD-4_8_26-2.pdf', verified: '2026-11-02' },
      { district: 'St. Vrain Valley Schools', label: 'Presidents’ Day', from: '2027-02-15', to: '2027-02-15', source: 'https://svvsd.org/wp-content/uploads/2026/06/26-27-SVVSD-4_8_26-2.pdf', verified: '2026-11-02' },
      { district: 'St. Vrain Valley Schools', label: 'Spring break', from: '2027-03-15', to: '2027-03-19', source: 'https://svvsd.org/wp-content/uploads/2026/06/26-27-SVVSD-4_8_26-2.pdf', verified: '2026-11-02' },
      { district: 'St. Vrain Valley Schools', label: 'Non-student contact days', from: '2027-04-26', to: '2027-04-27', source: 'https://svvsd.org/wp-content/uploads/2026/06/26-27-SVVSD-4_8_26-2.pdf', verified: '2026-11-02' },
    ],
  },
  participation: {
    label: 'Get involved',
    intro: 'Boards, volunteering, clubs and groups in the Carbon Valley, and how to join each.',
  },
  // Read 2 November 2026 from the Town's, the rec district's, the library
  // district's, the fire district's and St. Vrain Valley Schools' own pages.
  // The Town's volunteer portal (frederickco.galaxydigital.com) refused the
  // automated reader (403), so that item links the Town's page that describes
  // it; the chamber's calendar refused too (403) and is not linked.
  livingHere: {
    // Frederick's alone: nothing here was read for Firestone or Dacono, and
    // the line says so rather than let the guide's name imply it.
    intro: 'Who handles what in Frederick; for Firestone and Dacono, see each town’s own site.',
    sections: [
      {
        title: 'Utilities',
        note: 'Water east of I-25 is the Town’s; west of I-25 it is the Left Hand Water District’s, with the Town supplying only raw water. Sewer is the St. Vrain Sanitation District, electricity United Power and natural gas Black Hills Energy.',
        verified: '2026-11-02',
        items: [
          { label: 'Town of Frederick utility billing', url: 'https://www.frederickco.gov/276/Utility-Billing', note: 'Water, trash and stormwater on one bill; Finance office at 311 Fifth St, weekdays 8–5, 720-382-5500; online pay, phone, drive-thru and drop box; usage rates rose about 9 percent for average users in February 2025' },
          { label: 'Start, transfer or stop service', url: 'https://www.frederickco.gov/277/Connecting-Disconnecting-Service', note: 'Buyers file the Residential Utility Billing Agreement; renters’ bills go to the landlord ($2 a month for a copy); transfers $10, at 311 Fifth St weekdays 9–4; title companies use the Final Utility Request form' },
          { label: 'Left Hand Water District', url: 'https://lefthandwater.gov/', note: 'Drinking water for homes west of I-25, with its own Stage 1 drought guidance; the district’s pages did not render for this guide’s reader, so call the district for service' },
          { label: 'St. Vrain Sanitation District', url: 'https://www.stvrainsdco.gov/', note: 'Sewer for the whole town; 303-776-9570, sewer emergencies 303-994-7572; move-in and move-out forms on the site' },
          { label: 'United Power', url: 'https://www.unitedpower.com/', note: 'Electricity; street-light outages are reported to United Power, not the Town' },
          { label: 'Black Hills Energy', url: 'https://www.blackhillsenergy.com/', note: 'Natural gas' },
          { label: 'Fiber internet: Intrepid and ALLO', url: 'https://www.frederickco.gov/1164/Fiber-Internet', note: 'A town-wide fiber network under construction since 2025, due to finish in late 2026; check an address with ALLO (866-481-2556); construction questions to Intrepid, 844-380-8090' },
        ],
      },
      {
        title: 'Trash and recycling',
        note: 'The Town contracts Waste Connections for every home: one 96-gallon trash cart weekly and one 96-gallon recycling cart every other week, billed on the Town’s utility bill.',
        verified: '2026-11-02',
        items: [
          { label: 'Garbage and recycling: the Town’s program', url: 'https://www.frederickco.gov/372/Garbage-Recycling', note: 'Waste Connections, 303-288-2100; trash Fridays east of I-25 and Tuesdays west of it, recycling every other week on the same day; in a holiday week pickup slips a day; carts covered and out of sight except on collection day' },
          { label: 'Waste Connections pickup schedule', url: 'https://www.wasteconnections.com/pickup-schedule/', note: 'Which recycling week your neighborhood is on (the Town’s page lists Schedule A and B by subdivision)' },
          { label: 'Clean-Up Days', url: 'https://www.frederickco.gov/235/Clean-Up-Days', note: 'The Town’s spring and fall drop-off days; extra bags, branches and bulk items otherwise go through Waste Connections at special rates' },
          { label: 'Household hazardous waste', url: 'https://www.frederickco.gov/372/Garbage-Recycling', note: 'Weld County’s facility takes paint, batteries, oil, antifreeze and pesticides free; 970-304-6415' },
          // Added 12 November 2026 (the holiday pass), read that day from the
          // Town of Frederick's Community Programs page and the City of
          // Dacono's Utilities page. The tree drop-off line prints no year:
          // the years are from the page's own "2026/27" heading on the list
          // above it and the weekdays it gives. Firestone says only
          // "Annually, in January" with no dates yet, and Dacono's site says
          // nothing about trees, so neither is listed.
          { label: 'Frederick: holiday tree recycling', url: 'https://www.frederickco.gov/226/Community-Programs', note: 'Live trees only, Monday, December 21, 2026 to Friday, January 22, 2027: inside the fenced area at 602 Maple Street, on the southeast corner of Eighth Street and Maple Avenue by the entrance to Centennial Park; plastic bags, stands, decorations and lights off; no trees on the sidewalk or outside the fence' },
          { label: 'Frederick: holiday trash drop-off', url: 'https://www.frederickco.gov/226/Community-Programs', note: 'For households that pay for trash on the Town utility bill: extra holiday waste to Public Works, 7301 Eagle Blvd., south gate, 7 am to 2:30 pm on December 21, 22, 28, 29 and 30, 2026 and January 4 to 8, 2027, and 7 am to noon on December 23 and 31; bring ID; wrapping paper, packaging, artificial trees, holiday lights and food waste are accepted' },
          { label: 'Dacono: trash and recycling', url: 'https://www.daconoco.gov/868/Utilities', note: 'Waste Connections of Colorado, weekly trash and recycling every other week, on the City water bill; a pickup that falls on Thanksgiving, Christmas Day or New Year’s Day is a day late, and the normal schedule resumes the next week; 303-288-2100' },
        ],
      },
      {
        title: 'Getting around',
        note: 'No bus serves Frederick. The Town points residents to carpools and vanpools and pays Via Mobility for rides for residents who qualify.',
        verified: '2026-11-02',
        items: [
          { label: 'Via Mobility rides', url: 'https://www.frederickco.gov/623/Senior-Resources', note: 'Free door-to-door rides for residents 60 and over, people with disabilities and some others who qualify, weekdays 8 am–3 pm, within Frederick, Firestone and Dacono and to Longmont, Boulder, Louisville and Lafayette; 303-444-3043' },
          { label: 'Carbon Valley transit study and Way to Go', url: 'https://www.frederickco.gov/464/Carbon-Valley-Transit-Feasibility-Study', note: 'The three towns’ CDOT-funded study; the first step is carpools and vanpools through DRCOG’s Way to Go (waytogo.org)' },
          { label: 'Roadwork and construction updates', url: 'https://www.frederickco.gov/716/Current-Construction-Update', note: 'CDOT’s Colorado 52 resurfacing from I-25 to US 85 runs through December 2026 with overnight lane closures; the Town’s own projects are listed with dates' },
          { label: 'Snow and ice control', url: 'https://www.frederickco.gov/387/Snow-and-Ice-Control', note: 'Four tiers: emergency routes and arterials first, collectors second, residential streets only after more than six inches in 24 hours, one pass down the middle; live plow map on the page' },
          { label: 'CDOT road conditions', url: 'https://www.cotrip.org/', note: 'I-25, its frontage roads and Colorado 52, which CDOT plows, not the Town' },
        ],
      },
      {
        title: 'Parks and recreation',
        note: 'The Carbon Valley Parks and Recreation District runs the rec center, the gymnastics center, the leagues and the classes for the three towns; the Town runs the parks, the trails and Bella Rosa Golf Course.',
        verified: '2026-11-02',
        items: [
          { label: 'CVPRD registration (CivicRec)', url: 'https://secure.rec1.com/CO/carbon-valley-park-recreation-district-co/catalog', note: 'Classes, camps, leagues and lessons; district residents register first, non-residents a week or two later; 303-833-3660', track: 'registration' },
          { label: 'Carbon Valley Recreation Center, 701 5th St', url: 'https://www.cvprd.com/hours-of-operation', note: 'Mon–Fri 5:30 am–9 pm, Sat 7:30–5, Sun 10–5; a visit $5.50 for district adults and $8 for others, youth $4 and $6; check your address under “Carbon Valley Rec” on the Weld property portal' },
          { label: 'Pool schedule', url: 'https://www.cvprd.com/pool-schedule', note: 'Open swim Mon/Wed/Fri 1–8:30 pm, Tue/Thu 1–4:15, Sat 11–4:30, Sun 10–4:30 through January 3; school-break days from 11 am' },
          { label: 'Town parks and facilities', url: 'https://www.frederickco.gov/Facilities', note: '26 developed parks and 21 miles of trails, as the Town counts them; shelter reservations at Crist Park, Centennial Park and the Frederick Recreation Area close September 30 to February 1; Parks and Open Space 720-382-5805' },
          { label: 'Bella Rosa Golf Course', url: 'https://bellarosagolf.com/course-rates/', note: 'The Town’s nine-hole course, 5830 Bella Rosa Pkwy; $19 for nine holes walking on weekdays, $24 Friday to Sunday; 303-678-2940' },
          { label: 'Active adults, 55 and over', url: 'https://www.cvprd.com/active-adults-community-center', note: 'The district’s Community Center, 151 Grant Ave, Firestone, weekdays 8–4: drop-ins, day trips and the Friendly Fork lunch Tuesdays and Thursdays at noon; 303-833-3660 x123' },
        ],
      },
      {
        title: 'Schools',
        note: 'Frederick is in St. Vrain Valley Schools, based in Longmont. The neighborhood school goes by the address, boundaries do not follow town lines, and open enrollment lets a student apply to any St. Vrain school with room.',
        verified: '2026-11-02',
        items: [
          { label: 'St. Vrain: boundary lookup by address', url: 'https://www.svvsd.org/schools/maps-boundaries/', note: 'The district’s ArcGIS address lookup; planning department 303-682-7229 for boundary questions' },
          { label: 'St. Vrain: open enrollment', url: 'https://www.svvsd.org/schools/enrollment/open-enrollment/', note: 'Applications December 1–15, 2026; space-available offers by January 8 and confirmation by January 21, 2027; later applications go on a waitlist', track: 'registration' },
          { label: 'The Frederick feeder', url: 'https://www.svvsd.org/schools/school-feeders/', note: 'Frederick High (5690 Tipple Pkwy, 303-833-3533), Coal Ridge Middle, Thunder Valley K-8, Centennial, Legacy and Prairie Ridge elementaries, Spark! Discovery Preschool' },
          { label: '2026–27 district calendar', url: 'https://svvsd.org/wp-content/uploads/2026/06/26-27-SVVSD-4_8_26-2.pdf', note: 'Thanksgiving break November 23–27, winter break December 21–January 1 (January 4 a non-student day), spring break March 15–19, last day May 27' },
        ],
      },
      {
        title: 'Reporting a problem',
        verified: '2026-11-02',
        items: [
          { label: 'Submit a Report to the Town', url: 'https://www.frederickco.gov/1004/Submit-a-Report', note: 'Potholes, plowing, code and other issues, routed to staff and trackable with a login; also in the Town of Frederick app' },
          { label: 'Frederick Police Department', url: 'https://www.frederickco.gov/360/Police', note: '333 Fifth St, 720-382-5700; non-emergency dispatch 720-652-4222; emergency 911; lobby weekdays 8–5' },
          { label: 'Frederick-Firestone Fire District', url: 'https://www.fffd.us/about-us', note: '8426 Kosmerl Place, 303-833-2742 for anything that is not an emergency' },
          { label: 'Oil and gas wells: who to call', url: 'https://www.frederickco.gov/1199/Oil-Gas-Operations-in-Frederick', note: 'Fires or explosions 911; leaks and spills to the fire district, the state’s Energy & Carbon Management Commission (303-894-2100, complaints 888-235-1101) or the operator named on the site sign' },
          { label: 'Street light out', url: 'https://unitedpower.smarthub.coop/Login.html#', note: 'Reported to United Power, the Town’s street-maintenance page says' },
        ],
      },
      // Added 9 November 2026 from the gap report of 8 November: each item
      // read that day from the provider's own page (CommonSpirit, UCHealth,
      // Safeway, Walgreens). King Soopers was listed at the owner's word the
      // same day: kingsoopers.com answered 503 to the reader, so its address
      // and phone are as the store's pages give them in search, and the rest
      // is the Town's Silverstone Marketplace page (/places/ has the detail).
      {
        title: 'Health care, groceries and pharmacies',
        verified: '2026-11-09',
        items: [
          { label: 'CommonSpirit Emergency & Urgent Care Indian Peaks, 4943 Hwy 52', url: 'https://mountain.commonspirit.org/node/440356', note: 'A freestanding emergency room open around the clock, with urgent care every day 7 am to 9 pm; CT, ultrasound, lab and X-ray on site; 303-925-4840' },
          { label: 'UCHealth Urgent Care – Firestone, 5965 Firestone Blvd', url: 'https://www.uchealth.org/locations/uchealth-urgent-care-carbon-valley', note: 'In the Carbon Valley Medical Center, Building B; Monday to Friday 8 am to 8 pm, weekends 8 am to 6 pm; 720-652-7055' },
          { label: 'King Soopers Marketplace, 5801 Silverstone Dr', url: 'https://www.kingsoopers.com/stores/grocery/co/frederick', note: 'Frederick’s own supermarket, at Colorado Blvd and Hwy 52, with a drive-thru pharmacy and a fuel center; 303-327-1090' },
          { label: 'Safeway, 8134 Colorado Blvd, Firestone', url: 'https://local.safeway.com/safeway/co/firestone/8134-colorado-blvd.html', note: 'Store daily 6 am to 11 pm; pharmacy Monday to Friday 9 am to 8 pm, Saturday 9 to 5, Sunday 10 to 5, closed 1:30 to 2 for lunch; 303-833-2844' },
          { label: 'Walgreens, 5962 Firestone Blvd', url: 'https://www.walgreens.com/locator/walgreens-5962+firestone+blvd-firestone-co-80504/id=9315', note: 'Store Monday to Friday 7 am to 11 pm, weekends 7 to 10; pharmacy Monday to Friday 9 am to 9 pm, Saturday 9 to 6, Sunday 10 to 6, closed 1:30 to 2 for lunch; 303-532-8069' },
        ],
      },
      // Added 9 November 2026 from the gap report of 8 November, read that
      // day from Weld County's motor vehicle contact page and CodeRED page
      // (and its 30 April 2026 news release) and the Town's pet-license
      // (/218) and animals-at-large (/311) pages. The alerts item moved here
      // from Reporting a problem, whose other links were read on 2 November.
      {
        title: 'Cars, pets and emergency alerts',
        verified: '2026-11-09',
        items: [
          { label: 'Southwest Weld motor vehicle office', url: 'https://www.weld.gov/Government/Departments/Clerk-and-Recorder/Motor-Vehicle-Department/Contact-Us', note: 'Weld County’s office nearest Frederick, at 4209 County Road 24.5 by Del Camino, in the county’s Southwest Service Complex; Monday to Friday 8 am to 5 pm; 720-652-4201' },
          { label: 'Pet licenses', url: 'https://www.frederickco.gov/218/Pet-License', note: 'Dogs $5, cats free, with a current rabies vaccination: fill in the Town’s online form, then pay at the Police Department, 333 Fifth St, or by card at 720-382-5700' },
          { label: 'A dog at large', url: 'https://www.frederickco.gov/311/Animals-at-Large', note: 'Call the Community Service Officer or officer on duty at 720-652-4222. Dogs not claimed within a few hours go to the Humane Society of Boulder Valley; the police’s Community Services Unit does not take in stray cats' },
          { label: 'Weld County emergency alerts: CodeRED by Crisis24', url: 'https://www.weld.gov/Government/Departments/Public-Information-Office/Emergency-Preparation/CodeRED-by-Crisis24', note: 'Weld County’s alerts now run on CodeRED by Crisis24, and the county asks residents to make a new account even though earlier sign-ups were carried over; help at 1-866-939-0911' },
        ],
      },
      // Added 9 November 2026 at the owner's word (the gap report's M6), read
      // that day from the Town's Home Improvement (/242), Building Department
      // (/416), Permits (/1064), inspection (/105) and Fireworks (/955) pages.
      // Burn and fire-pit rules are left out: the fire district's site has no
      // current page on them (its burn-permit sheet is dated 2011), and the
      // Town's site has no short-term rental page.
      {
        title: 'Permits and home projects',
        verified: '2026-11-09',
        items: [
          { label: 'What needs a permit', url: 'https://www.frederickco.gov/242/Home-Improvement', note: 'Decks and porches, additions, accessory dwelling units, basement finishes and detached garages need one; a one-story shed of 200 square feet or less, a fence up to 6 feet (chain link is not allowed), a retaining wall up to 4 feet and finish work such as painting and tiling do not. Call Colorado 811 before you dig' },
          { label: 'Building permits and inspections', url: 'https://www.frederickco.gov/416/Building-Department', note: 'Apply through the Town’s Accela portal; request inspections with the Town’s online form. No inspections on Town holidays, Veterans Day and the two Thanksgiving days among them' },
          { label: 'Fireworks', url: 'https://www.frederickco.gov/955/Fireworks', note: 'If it goes up or blows up, it is illegal in Frederick: anything that leaves the ground or explodes, outside a permitted public display' },
        ],
      },
      {
        title: 'City meetings and participation',
        note: 'The Town holds its own elections in November of even-numbered years (the next is November 7, 2028); Weld County runs the rest, by mail ballot.',
        verified: '2026-11-02',
        items: [
          { label: 'Mayor and Board of Trustees', url: 'https://www.frederickco.gov/406/Mayor-Board-of-Trustees', note: 'First and third Wednesdays at 7 pm at Town Hall, 401 Locust St, work sessions at 5:30; email the Board at BOTInfo@frederickco.gov; the Town Clerk is 720-382-5500', track: 'participation' },
          { label: 'Agendas and minutes', url: 'https://www.frederickco.gov/1100/Agenda-Portal', note: 'The Board, the Planning Commission and every committee, with each agenda once posted' },
          { label: 'Serve on a board, commission or committee', url: 'https://www.frederickco.gov/281/Boards-Commissions', note: 'Residents apply online; the Board considers applications in May and October after panel interviews; two parks-commission seats and one historic-preservation seat were open on November 2', track: 'participation' },
          { label: 'Frederick Youth Commission', url: 'https://www.frederickco.gov/1001/Frederick-Youth-Commission', note: 'Grades 8 to 12; ten seats open; apply online with the release form; 720-382-5553', track: 'participation' },
          { label: 'Volunteer with the Town', url: 'https://www.frederickco.gov/345/Volunteer-Opportunities', note: 'Event shifts through the Frederick Volunteer Portal, a volunteer newsletter, beer-garden shifts for TIPS-trained adults 21 and over, and one-time service projects; volunteers 14 and up on their own', track: 'participation' },
          // Reworded after the election, from the page as read 9 November 2026 (cleanup pass).
          { label: 'Weld County Elections', url: 'https://www.weld.gov/Government/Departments/Clerk-and-Recorder/Elections-Department', note: 'The county’s page links the unofficial results of the November 3, 2026 general election; 970-304-6525' },
        ],
      },
    ],
  },
  movingHere: {
    // One search per town, as the guide had them until 2 November 2026.
    listingsLinks: [
      { label: 'Homes for sale in Frederick on Zillow', url: 'https://www.zillow.com/homes/Frederick,-CO_rb/' },
      { label: 'Homes for sale in Firestone on Zillow', url: 'https://www.zillow.com/homes/Firestone,-CO_rb/' },
      { label: 'Homes for sale in Dacono on Zillow', url: 'https://www.zillow.com/homes/Dacono,-CO_rb/' },
    ],
    // As this config had it until 12 November 2026. Frederick and Firestone
    // are wholly in St. Vrain Valley (each Town's own page); Dacono is split
    // between St. Vrain Valley and Weld RE-8, whose Kenneth Homyak PK-8
    // opened in 2018 (daconoco.gov/881/Education). The comparison table
    // shows only the words before the colon.
    schoolDistrict:
      'Mostly St. Vrain Valley Schools: Frederick and Firestone entirely, with Frederick High the comprehensive high school; part of Dacono is in Weld RE-8 (Kenneth Homyak PK-8), so check the address.',
    // Frederick's, and worded so: from the Town's What Matters page (35 minutes to downtown Denver, 33 to
    // DIA), its 2024/25 community profile (DIA 28 minutes, Boulder 22 miles,
    // I-25 over 100,000 vehicles a day at Colorado 52), its transit study page
    // and its senior resources page (Via Mobility), all read 2 November 2026.
    commuteNotes:
      'From Frederick, about 35 minutes to downtown Denver on I-25, which the Town of Frederick says carries more than 100,000 vehicles a day past the Colorado 52 interchange; Boulder is 22 miles on Colorado 52 and DIA about half an hour. No bus serves Frederick: the Town points to Way to Go carpools and vanpools, and Via Mobility rides are for residents 60 and over and others who qualify.',
  },
  officialLinks: {
    townSite: 'https://www.frederickco.gov/',
    townSiteLabel: 'the Town of Frederick',
    // The other two towns' own sites, as the guide linked them until 2 November 2026.
    also: [
      { label: 'the Town of Firestone', url: 'https://www.firestoneco.gov/' },
      { label: 'the City of Dacono', url: 'https://www.daconoco.gov/' },
    ],
    // Read 2 November 2026 from the department's page (/360/Police):
    // non-emergency 720-652-4222; the department itself 720-382-5700.
    policeNonEmergency: 'https://www.frederickco.gov/360/Police',
    policeNonEmergencyLabel: 'Frederick Police Department (non-emergency 720-652-4222)',
  },
  plausible: true,
};
