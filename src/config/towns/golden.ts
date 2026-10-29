import type { TownConfig } from './types.ts';

/**
 * The Jefferson County seat, a home-rule city of 20,399 at the 2020 census at
 * the mouth of Clear Creek Canyon: foothills town rather than high country,
 * but a town whose weekends are trailheads, with Jefferson County Open Space
 * on three sides, so it runs on the mountain chassis. The launch threshold is
 * above the default for a city this size.
 *
 * Figures are from the Wikipedia infobox (census and GNIS), read 6 October
 * 2026, as for every other town; the comments say which. The domain is the
 * one on the owner's Cloudflare nameservers (the same pair as the other
 * thirteen), confirmed 6 October 2026.
 */
export const golden: TownConfig = {
  kind: 'town',
  // Live 7 October 2026, on the owner's word, after the first review cleared
  // the launch threshold (docs/archive/ACCURACY-SYSTEM.md).
  status: 'live',
  // A visitor guide from 20 October 2026, and a flagship again from 28
  // October, owner's word ("bring golden back… I believe golden has huge
  // potential"): its first week of Plausible counted 106 visitors, rising
  // to 28 a day, and two readers had signed up for a Golden email that no
  // longer went out (DECISIONS.md, "Golden as a flagship, 28 October").
  variant: 'mountain',
  region: 'Mountains & Foothills',
  neighbors: ['evergreen', 'idaho-springs'],
  // Set with the brief, 6 October 2026: upcoming events / open listings.
  launchThreshold: { events: 20, listings: 25 },
  slug: 'golden',
  name: 'Golden',
  domain: 'insidegolden.com',
  siteTitle: 'Inside Golden',
  tagline:
    'An independent guide to Golden, Colorado: Washington Avenue, Clear Creek, the Table Mountains, Lookout Mountain, and life at the edge of the foothills.',
  shortTagline: 'Washington Avenue, Clear Creek and the Table Mountains',
  seoTagline: 'Events, trails and places in Golden, Colorado',
  counties: ['Jefferson'],
  state: 'CO',
  // GNIS, via the Wikipedia infobox: 39°45′12″N 105°12′55″W.
  lat: 39.7533,
  lng: -105.2153,
  population: 20399, // 2020 census
  elevationFt: 5784, // GNIS, via Wikipedia
  driveToDenver: 'About 25 min',
  character: 'A college, brewery and county-seat town at the canyon mouth, twelve miles from downtown Denver.',
  // 3 January 1871, as Golden City, Colorado Territory, per the Wikipedia infobox (founded 16 June 1859).
  incorporated: 1871,
  population2010: 18867, // 2010 census, for census-to-census growth
  /**
   * Where a reader checks the roads before setting out. Official pages,
   * linked live on Things to Do and every trail, trailhead and park page;
   * the guide never restates what they say. Each URL answered 200 to a
   * request on 6 October 2026.
   */
  conditionsLinks: [
    {
      label: 'CDOT road conditions (COtrip)',
      url: 'https://www.cotrip.org/',
      note: 'Live state highway conditions and closures, including US 6 through Clear Creek Canyon and I-70.',
    },
    {
      label: 'Jeffco Open Space: alerts and closures',
      url: 'https://www.jeffco.us/1531/Alerts-Closures',
      note: 'Trail closures at North Table Mountain, Lookout Mountain, Clear Creek Canyon Park and the county’s other parks, the seasonal wildlife closures included.',
    },
  ],
  colors: {
    // Copper-gold + creek slate, on warm paper: Color System 2.0, 9 October 2026.
    primary: '#94651E',
    accent: '#3D5760',
    paper: 'warm',
  },
  hero: {
    image: 'hero.jpg',
    alt: 'Clear Creek east of the Washington Avenue bridge in Golden, kayakers in the current and North Table Mountain behind the town',
    // Attribution required by the photograph’s licence; see IMAGE_LICENSES.csv. Chosen 7 October 2026.
    credit: 'Dough4872, Wikimedia Commons, CC BY-SA 4.0',
  },
  social: {
    email: 'hello@insidegolden.com',
  },
  // A resident guide (TownConfig.home), since 28 October 2026.
  home: true,
  /**
   * Golden High's colours as MaxPreps carries them (schoolColor1 8F0018,
   * schoolColor2 FFFFFF), read by the sports probe from the GitHub runner
   * on 28 October 2026: crimson and white. Jeffco's school sites did not
   * answer the cloud address, so the school's own hex is not yet checked;
   * src/config/school-sports.ts gives the sports pages the same crimson.
   */
  school: { name: 'Golden High School', mascot: 'Demons', teamName: 'Golden Demons', primary: '#8F0018', secondary: '#FFFFFF' },
  // Read from the City's, the county's, RTD's and Jeffco Public Schools' own
  // pages on 28 October 2026. Rooney Road Recycling Center's robots.txt and
  // the City's Granicus portal ask automated readers to stay out, and the
  // City's Fix It! and registration pages refused them (403), so those items
  // link the City pages that describe them.
  // Read 28 October 2026. The schools are the Golden articulation area as
  // Jeffco lists it (Bell Middle's "Golden Articulation Area" page and the
  // district's articulation-areas page); addresses from each school's own
  // site. The breaks are every no-school day left in 2026–27 on Jeffco
  // Public Schools' District Family Calendar (the English PDF linked from
  // /calendar, dated 5/22/26). February 12, March 29 and April 30 are the
  // calendar's potential snow make-up days, so each says so. Individual
  // schools may add modified contact days on their own calendars; those are
  // not here.
  families: {
    label: 'Golden Families',
    intro: 'What Golden kids can join, what closes soon, and the school days off.',
    schools: [
      {
        district: 'Jeffco Public Schools',
        label: 'Jeffco Public Schools: School Finder',
        url: 'https://enrolljeffco.my.site.com/Find/s/',
        note: 'Find a school by name, by distance or by program; Jeffco also takes choice enrollment at any school with space',
      },
      {
        district: 'Jeffco Public Schools',
        label: 'Jeffco: articulation areas and boundary maps',
        url: 'https://www.jeffcopublicschools.org/about/articulation-areas',
        note: 'The Golden area: a boundary map for each of its seven schools',
      },
      {
        district: 'Jeffco Public Schools',
        label: 'Golden High School',
        url: 'https://golden.jeffcopublicschools.org/',
        note: '701 24th Street',
      },
      {
        district: 'Jeffco Public Schools',
        label: 'Bell Middle School',
        url: 'https://bell.jeffcopublicschools.org/',
        note: '1001 Ulysses Street',
      },
      {
        district: 'Jeffco Public Schools',
        label: 'Kyffin Elementary',
        url: 'https://kyffin.jeffcopublicschools.org/',
        note: '205 Flora Way',
      },
      {
        district: 'Jeffco Public Schools',
        label: 'Mitchell Elementary',
        url: 'https://mitchell.jeffcopublicschools.org/',
        note: '201 Rubey Drive',
      },
      {
        district: 'Jeffco Public Schools',
        label: 'Ralston Elementary',
        url: 'https://ralston.jeffcopublicschools.org/',
        note: '25856 Columbine Glen Avenue',
      },
      {
        district: 'Jeffco Public Schools',
        label: 'Shelton Elementary',
        url: 'https://shelton.jeffcopublicschools.org/',
        note: '420 Crawford Street',
      },
      {
        district: 'Jeffco Public Schools',
        label: 'Welchester Elementary',
        url: 'https://welchester.jeffcopublicschools.org/',
        note: '13000 West 10th Avenue',
      },
    ],
    breaks: [
      { district: 'Jeffco Public Schools', label: 'Thanksgiving break', from: '2026-11-23', to: '2026-11-27', source: 'https://www.jeffcopublicschools.org/fs/resource-manager/view/91311db1-8491-4cca-8464-a9bf419bf216', verified: '2026-10-28' },
      { district: 'Jeffco Public Schools', label: 'Winter break; January 4 and 5 are staff development days, and school resumes January 6', from: '2026-12-21', to: '2027-01-05', source: 'https://www.jeffcopublicschools.org/fs/resource-manager/view/91311db1-8491-4cca-8464-a9bf419bf216', verified: '2026-10-28' },
      { district: 'Jeffco Public Schools', label: 'Martin Luther King Jr. Day', from: '2027-01-18', to: '2027-01-18', source: 'https://www.jeffcopublicschools.org/fs/resource-manager/view/91311db1-8491-4cca-8464-a9bf419bf216', verified: '2026-10-28' },
      { district: 'Jeffco Public Schools', label: 'Staff development day (no students); a snow make-up day if needed', from: '2027-02-12', to: '2027-02-12', source: 'https://www.jeffcopublicschools.org/fs/resource-manager/view/91311db1-8491-4cca-8464-a9bf419bf216', verified: '2026-10-28' },
      { district: 'Jeffco Public Schools', label: 'Presidents’ Day', from: '2027-02-15', to: '2027-02-15', source: 'https://www.jeffcopublicschools.org/fs/resource-manager/view/91311db1-8491-4cca-8464-a9bf419bf216', verified: '2026-10-28' },
      { district: 'Jeffco Public Schools', label: 'Spring break', from: '2027-03-22', to: '2027-03-26', source: 'https://www.jeffcopublicschools.org/fs/resource-manager/view/91311db1-8491-4cca-8464-a9bf419bf216', verified: '2026-10-28' },
      { district: 'Jeffco Public Schools', label: 'Staff development day (no students); a snow make-up day if needed', from: '2027-03-29', to: '2027-03-29', source: 'https://www.jeffcopublicschools.org/fs/resource-manager/view/91311db1-8491-4cca-8464-a9bf419bf216', verified: '2026-10-28' },
      { district: 'Jeffco Public Schools', label: 'No school; a snow make-up day if needed', from: '2027-04-30', to: '2027-04-30', source: 'https://www.jeffcopublicschools.org/fs/resource-manager/view/91311db1-8491-4cca-8464-a9bf419bf216', verified: '2026-10-28' },
    ],
  },
  participation: {
    label: 'Get involved',
    intro: 'Boards, volunteering, clubs and groups in Golden, and how to join each.',
  },
  livingHere: {
    intro: 'Who handles what in Golden, with the official page for each.',
    sections: [
      {
        title: 'Utilities',
        note: 'Water and wastewater are the City’s; electricity is Xcel Energy. Not every Golden mailing address is inside city limits, the City says, so check the address before counting on City services.',
        verified: '2026-10-28',
        items: [
          { label: 'City of Golden water and wastewater billing', url: 'https://www.cityofgolden.gov/services/water_service.php', note: 'Utility Billing, City Hall, 911 10th St, 303-384-8026, weekdays 8–5; to move in or out use the Start, Stop or Transfer form ($25 for a final bill); the title company usually handles it in a sale' },
          { label: 'Xcel Energy', url: 'https://www.xcelenergy.com/', note: 'Electricity; the City’s energy figures for Golden’s natural gas use come from Xcel too' },
        ],
      },
      {
        title: 'Trash and recycling',
        note: 'The City contracts one hauler, 5280 Waste Solutions, for its Pay-As-You-Throw program: you pay by trash-cart size, and recycling and compost carts come with it.',
        verified: '2026-10-28',
        items: [
          { label: 'Trash, recycling and compost: the City’s program', url: 'https://www.cityofgolden.gov/services/trash_recycling_compost/index.php', note: '5280 Waste Solutions, 303-277-8727; $9.24 a month for a 32-gallon trash cart, $18.16 for 64 gallons, $30.06 for 96; carts out by 7 am; one free large-item pickup a year' },
          { label: 'When is trash day?', url: 'https://www.cityofgolden.gov/services/trash_recycling_compost/when_is_trash_day_.php', note: 'Collection-day maps by neighborhood and the 2026 calendar; a holiday moves pickup back one day' },
          { label: 'Yard Waste Collection Days', url: 'https://www.cityofgolden.gov/services/trash_recycling_compost/yard_waste_collection_days.php', note: 'Spring and fall; this fall November 2–6, on your trash day by 7 am, up to 3 cubic yards in the organics cart, bundled or in compostable bags' },
          { label: 'Hard-to-recycle items guide', url: 'https://www.cityofgolden.gov/community/sustainable_golden/waste_diversion/hard_to_recycle_items_guide.php', note: 'Where appliances, batteries, electronics and paint go; household chemicals to the Rooney Road Recycling Center, by appointment, fees may apply' },
        ],
      },
      {
        title: 'Getting around',
        verified: '2026-10-28',
        items: [
          { label: 'Ore Cart: the free shuttle', url: 'https://www.cityofgolden.gov/services/ore_cart_shuttle_service/index.php', note: 'Run by the City with Colorado School of Mines: three routes about every 15 minutes, weekdays 7 am–6:30 pm and Saturdays 8–5, the Tungsten route to the W Line station; no service Sundays or on Mines holidays; 303-384-2278' },
          { label: 'Light rail and buses, as the City lists them', url: 'https://www.cityofgolden.gov/community/getting_around/ride.php', note: 'The W Line to Union Station from Jefferson County Government Center–Golden Station every half hour; bus 17 from 10th & Washington to Federal Center Station daily; RTD’s schedules also list the GS, Golden/Boulder' },
          { label: 'Golden FlexRide', url: 'https://www.rtd-denver.com/routes-services/other-services/flexride/flexride-service-areas/golden', note: 'RTD’s on-demand rides in most of the city, weekdays 5:30 am–7 pm and Saturdays 8–7, none on Sundays or holidays; book at 303-299-6000 or online; Golden Heights, Golden Hills and the Coors Technology Center are outside the area' },
          { label: 'Street maintenance and snow plowing', url: 'https://www.cityofgolden.gov/services/street_maintenance.php', note: 'Snow and ice control on all city streets in a storm, primary roads first and residential last, with a live plow map; fall sweeping October 1 through November' },
          { label: 'CDOT road conditions', url: 'https://www.cotrip.org/', note: 'US 6 through Clear Creek Canyon, CO 93, CO 58 and I-70' },
        ],
      },
      {
        title: 'Recreation',
        note: 'The City runs the Community Center, the parks and the classes; Jefferson County Parks & Open Space runs the mountain parks around the town.',
        verified: '2026-10-28',
        items: [
          { label: 'City recreation: class registration', url: 'https://www.cityofgolden.gov/community/recreation/index.php', note: 'The City’s page links its online registration for classes, camps, dance and pottery; or call the Community Center, 303-384-8100', track: 'registration' },
          { label: 'Golden Community Center, 1470 10th St', url: 'https://www.cityofgolden.gov/community/golden_community_center/index.php', note: 'Pools, gym, track and fitness; Mon–Thu 5:30 am–8 pm, Fri 5:30–7, Sat 7–6, Sun 8–4; Equity & Access financial help with programs for Golden residents: apply at least a month before enrollment opens' },
          { label: 'Front Porch, for older adults', url: 'https://www.cityofgolden.gov/community/golden_community_center/front_porch.php', note: 'Upstairs at the Community Center, weekdays 8 am–2 pm: drop-in activities, clubs and day trips; 303-384-8130' },
          { label: 'City parks and trails', url: 'https://www.cityofgolden.gov/community/parks_trails/index.php', note: '19 parks and 42 miles of paved trails, as the City counts them; pavilion rentals 303-384-8100' },
          { label: 'Jeffco Parks & Open Space', url: 'https://www.jeffco.us/4867/Open-Space', note: '27 county parks, more than 58,000 acres and 275 trail miles; headquarters at 700 Jefferson County Parkway, 303-271-5925' },
        ],
      },
      {
        title: 'Schools',
        note: 'Golden is in Jeffco Public Schools, the county-wide district. The neighborhood school goes by the address, and choice enrollment lets a student apply to any Jeffco school with room.',
        verified: '2026-10-28',
        items: [
          { label: 'Jeffco Public Schools: School Finder and boundary maps', url: 'https://www.jeffcopublicschools.org/about/articulation-areas', note: 'The Golden area is Kyffin, Mitchell, Ralston, Shelton and Welchester elementaries, Bell Middle and Golden High' },
          { label: 'Jeffco: enrollment and choice enrollment', url: 'https://www.jeffcopublicschools.org/enroll', note: 'Round 1 for 2027–28 runs December 1, 2026 to January 15, 2027 in EnrollJeffco, up to three schools a student; results January 26', track: 'registration' },
          { label: 'Golden articulation area', url: 'https://golden.jeffcopublicschools.org/about/articulation-area', note: 'Golden High’s page for the area’s seven schools; the high school is at 701 24th St, 303-982-4200' },
        ],
      },
      {
        title: 'Reporting a problem',
        verified: '2026-10-28',
        items: [
          { label: 'Fix It!: report a problem to the City', url: 'https://www.cityofgolden.gov/services/contact_us.php', note: 'Potholes, streetlights, damaged signs and code enforcement, reported and tracked online; the City’s contact page links it and lists every department’s number' },
          { label: 'Golden Police Department', url: 'https://www.cityofgolden.gov/police/contact_us.php', note: '911 10th St, 303-384-8045; non-emergency dispatch through Jeffcom, 303-980-7300, or its online form; emergency 911' },
          { label: 'Golden Fire Department', url: 'https://www.cityofgolden.gov/services/fire_department/index.php', note: 'A City department of staff and volunteers; administration 303-384-8094, weekdays 8–5; after hours and weekends 303-980-7300' },
          { label: 'Water or sewer emergency', url: 'https://www.cityofgolden.gov/services/water_service.php', note: '303-384-8158, answered around the clock' },
          { label: 'LookoutAlert emergency notifications', url: 'https://www.cityofgolden.gov/community/health_safety/emergency_preparedness.php', note: 'Jefferson County’s alerts by text, email or voice for wildfire, evacuation and other emergencies; sign up from the City’s page' },
        ],
      },
      {
        title: 'City meetings and participation',
        note: 'The City holds its own elections on the first Tuesday of November in odd-numbered years; Jefferson County runs the rest, by mail ballot.',
        verified: '2026-10-28',
        items: [
          { label: 'City Council', url: 'https://www.cityofgolden.gov/government/city_leadership/city_council.php', note: '2nd and 4th Tuesdays in Council Chambers, City Hall, 911 10th St; sign up at the meeting to speak, or email a comment on an agenda item by 3 pm on the day', track: 'participation' },
          { label: 'Agendas, minutes and recordings', url: 'https://www.cityofgolden.gov/government/public_meetings.php', note: 'Council and board meetings, with each agenda once it is posted' },
          { label: 'Serve on a board or commission', url: 'https://www.cityofgolden.gov/government/city_leadership/boards_commissions/vacancies.php', note: 'Applications open early February to mid-March, interviews the last Tuesday of March; most seats are for city residents; City Clerk 303-384-8014', track: 'participation' },
          { label: 'Guiding Golden: City projects open for comment', url: 'https://www.guidinggolden.com/', note: 'The City’s engagement site; register to follow projects and give feedback', track: 'participation' },
          { label: 'Volunteer with the City', url: 'https://www.cityofgolden.gov/community/get_involved/volunteer.php', note: 'Habitat Helpers at DeLong Park, Adopt-A-Street, the History Museum & Park, and a list of local groups that take volunteers', track: 'participation' },
          { label: 'Jefferson County Elections', url: 'https://www.jeffco.us/4947/Elections', note: 'General election November 3, 2026, last day to vote by 7 pm; drop boxes, vote centers and what is on the ballot; 3500 Illinois St, Suite 1100, 303-271-8111' },
        ],
      },
    ],
  },
  movingHere: {
    listingsLinks: [
      { label: 'Homes for sale on Zillow', url: 'https://www.zillow.com/homes/Golden,-CO_rb/' },
      { label: 'Homes for sale on Realtor.com', url: 'https://www.realtor.com/realestateandhomes-search/Golden_CO' },
    ],
    // Jeffco Public Schools (jeffcopublicschools.org, read 6 October 2026).
    schoolDistrict: 'Jeffco Public Schools, the county-wide district.',
    // From the Moving Here guide's Getting around section and its sources
    // (Jefferson County, RTD and City of Golden pages, read 6 October 2026).
    commuteNotes:
      'About 25 minutes to downtown Denver on US 6 or I-70. RTD’s W Line light rail ends at Jefferson County Government Center–Golden Station, trains every half hour; bus 17 links 10th & Washington to Federal Center Station, and the free Ore Cart shuttle joins downtown, the Mines campus and the station.',
  },
  officialLinks: {
    // cityofgolden.net redirects here (read 6 October 2026).
    townSite: 'https://www.cityofgolden.gov/',
    townSiteLabel: 'the City of Golden',
    // Read 6 October 2026 from the department's contact page: non-emergency
    // dispatch through Jeffcom, 303-980-7300; the department itself 303-384-8045.
    policeNonEmergency: 'https://www.cityofgolden.gov/police/contact_us.php',
    policeNonEmergencyLabel: 'Golden Police Department (non-emergency dispatch 303-980-7300)',
  },
  formspreeId: 'xljjlrkd',
  plausible: true,
};
