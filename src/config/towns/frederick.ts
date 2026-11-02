import type { TownConfig } from './types.ts';

/**
 * A Weld County statutory town of 14,513 at the 2020 census, the middle of
 * the three coal towns of the Carbon Valley, a couple of miles east of I-25
 * on Colorado 52 north of Erie, with a six-block old town on Fifth Street,
 * Milavec Lake and Frederick High's Golden Eagles. Front Range chassis.
 *
 * Covered from 5 October 2026 as a section of Inside Carbon Valley
 * (carbonvalleyguide.com, with Firestone, Dacono and Fort Lupton). A guide
 * of its own, and a flagship, from 2 November 2026 at the owner's word
 * (DECISIONS.md, "Black Hawk and Carbon Valley close; Lafayette and
 * Frederick open"): the Frederick listings, the Frederick High sports file
 * and the Fifth Street hero came over with their slugs, and the rest was
 * read from the Town's, the district's, the library's and the organizers'
 * own pages on 2 November 2026 by the Frederick build agent; each file
 * names its source.
 *
 * Figures are from the Wikipedia infobox (census and GNIS), read 2 November
 * 2026, as for every other town; the comments say which. The domain,
 * insidefrederickco.com, is the owner's (held since 30 October 2026).
 */
export const frederick: TownConfig = {
  kind: 'town',
  // Live 2 November 2026, on the owner's word, with 19 verified upcoming
  // events and 25 checked listings against the default threshold. The Vercel
  // project, DNS and Email Routing are the owner's (DEPLOY.md).
  status: 'live',
  variant: 'front-range',
  region: 'Carbon Valley & I-25',
  // Erie down Colorado 52 and Longmont up 119, as Carbon Valley's were; each
  // names Frederick back.
  neighbors: ['erie', 'longmont'],
  slug: 'frederick',
  name: 'Frederick',
  domain: 'insidefrederickco.com',
  siteTitle: 'Inside Frederick',
  tagline:
    'An independent guide to Frederick, Colorado: Fifth Street, Milavec Lake, the parks and trails, the Golden Eagles and what’s on this week.',
  // A few enduring words, no year, no vote.
  shortTagline: 'Fifth Street, Milavec Lake and the Golden Eagles',
  // Short enough that the state survives the search-result trim (test/towns.test.ts).
  seoTagline: 'Events and places in Frederick, Colorado',
  // One line for the comparison table. Coal camp of 1907: the Town's history
  // page (/674) and Wikipedia; I-25 and CO 52: the Town's community profile.
  // No year in it: the flagship test keeps the one line enduring.
  character: 'A coal town on I-25 and Colorado 52 that doubled between the last two censuses, with a six-block old town on Fifth Street.',
  // Wikipedia infobox, read 2 November 2026: 2020 census 14,513; 2010 census 8,679.
  population: 14513,
  population2010: 8679,
  // GNIS, via the Wikipedia infobox: 4,938 ft (1,505 m).
  elevationFt: 4938,
  // 26 December 1907, per the Wikipedia infobox (State Archives), and the
  // Town's own history page says incorporated in 1907 by Frederick A.
  // Clark's daughters; the State Demography Office's historical census file
  // (read 2 November 2026) says 1908. The Town's own word and the Archives'
  // date agree, so 1907 stands, as the Carbon Valley config had it, with the
  // state file's year noted here as the odd one out.
  incorporated: 1907,
  // GNIS, via the Wikipedia infobox: 40°06′50″N 105°00′40″W (40.11389, -105.01111).
  // The scaffold's -104.937 was the Carbon Valley centroid; this is Frederick's.
  lat: 40.1139,
  lng: -105.0111,
  // The Town's own page "What Matters to You? Find it in Frederick" (/699),
  // read 2 November 2026: about 35 minutes to downtown Denver (33 to DIA).
  driveToDenver: 'About 35 min',
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
    email: 'hello@insidefrederickco.com',
  },
  // A resident guide (TownConfig.home), from the start.
  home: true,
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
    label: 'Frederick Families',
    intro: 'What Frederick kids can join, what closes soon, and the school days off.',
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
    intro: 'Boards, volunteering, clubs and groups in Frederick, and how to join each.',
  },
  // Read 2 November 2026 from the Town's, the rec district's, the library
  // district's, the fire district's and St. Vrain Valley Schools' own pages.
  // The Town's volunteer portal (frederickco.galaxydigital.com) refused the
  // automated reader (403), so that item links the Town's page that describes
  // it; the chamber's calendar refused too (403) and is not linked.
  livingHere: {
    intro: 'Who handles what in Frederick, with the official page for each.',
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
        title: 'Recreation',
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
          { label: 'Weld County emergency alerts', url: 'https://www.fffd.us/weld-county-emergency-notification-system', note: 'Sign up through the fire district’s page for the county’s CodeRED alerts' },
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
          { label: 'Weld County Elections', url: 'https://www.weld.gov/Government/Departments/Clerk-and-Recorder/Elections-Department', note: 'General election November 3, 2026, ballots received by 7 pm; the Carbon Valley Recreation Center, 701 5th St, is a vote center on November 2 and 3 and a 24-hour drop box; 970-304-6525' },
        ],
      },
    ],
  },
  movingHere: {
    listingsLinks: [
      { label: 'Homes for sale on Zillow', url: 'https://www.zillow.com/homes/Frederick,-CO_rb/' },
      { label: 'Homes for sale on Realtor.com', url: 'https://www.realtor.com/realestateandhomes-search/Frederick_CO' },
    ],
    // St. Vrain Valley Schools (svvsd.org school-feeders page, read 2 November 2026).
    schoolDistrict: 'St. Vrain Valley Schools, based in Longmont; the Frederick feeder runs from Spark! Discovery Preschool and three elementaries through Thunder Valley K-8 and Coal Ridge Middle to Frederick High.',
    // From the Town's What Matters page (35 minutes to downtown Denver, 33 to
    // DIA), its 2024/25 community profile (DIA 28 minutes, Boulder 22 miles,
    // I-25 over 100,000 vehicles a day at Colorado 52), its transit study page
    // and its senior resources page (Via Mobility), all read 2 November 2026.
    commuteNotes:
      'About 35 minutes to downtown Denver on I-25, which the Town says carries more than 100,000 vehicles a day past the Colorado 52 interchange; Boulder is 22 miles on Colorado 52 and DIA about half an hour. No bus serves the town: the Town points to Way to Go carpools and vanpools, and Via Mobility rides are for residents 60 and over and others who qualify.',
  },
  officialLinks: {
    townSite: 'https://www.frederickco.gov/',
    townSiteLabel: 'the Town of Frederick',
    // Read 2 November 2026 from the department's page (/360/Police):
    // non-emergency 720-652-4222; the department itself 720-382-5700.
    policeNonEmergency: 'https://www.frederickco.gov/360/Police',
    policeNonEmergencyLabel: 'Frederick Police Department (non-emergency 720-652-4222)',
  },
  plausible: true,
};
