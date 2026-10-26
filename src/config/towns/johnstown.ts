import type { TownConfig } from './types.ts';

export const johnstown: TownConfig = {
  kind: 'town',
  status: 'live',
  variant: 'front-range',
  region: 'Northern Colorado',
  neighbors: ['loveland', 'windsor', 'berthoud'],
  slug: 'johnstown',
  name: 'Johnstown',
  domain: 'insidejohnstown.com',
  siteTitle: 'Inside Johnstown',
  tagline: 'An independent guide to Johnstown, Colorado: Parish Avenue, the parks, the sugar-town history, and what it’s like to move to a fast-growing town.',
  shortTagline: 'Parish Avenue, the parks, and a sugar town growing fast',
  seoTagline: 'Events and things to do in Johnstown, Colorado',
  // 2020 census: about 73 per cent of the town's population in Weld, 27 per cent in Larimer.
  counties: ['Weld', 'Larimer'],
  countySplit: {
    note: 'Most of Johnstown is in Weld County, but the town has annexed west and north-west across the Larimer line, which is why the north-west corner is in a different school district from the rest of town.',
    source: 'https://johnstownco.gov/',
    verified: '2026-09-20',
  },
  state: 'CO',
  lat: 40.3369,
  lng: -104.9119,
  population: 17303, // 2020 census; 2025 estimate 22,433
  elevationFt: 4994,
  incorporated: 1907, // platted 1902
  driveToDenver: 'About 50 min',
  population2010: 9887, // 2010 census, for census-to-census growth
  character: 'Sugar-beet town at the I-25 interchange, filling the gap between Loveland and Greeley.',
  colors: {
    // Roughrider red, the school's colour as the guide's (22 October 2026):
    // Roosevelt High's own site theme (hsl 350 83% 42%); MaxPreps's team
    // data carries only a placeholder black for the school.
    primary: '#C41230',
    accent: '#BAA071',
    paper: 'warm',
  },
  hero: {
    image: 'hero.jpg',
    alt: 'A county road on the northern Colorado plains running west toward the snow-covered Front Range in April',
    credit: 'Maarten Heerlien, Wikimedia Commons, CC BY 2.0',
  },
  social: {
    email: 'hello@insidejohnstown.com',
  },
  // The flagship home page (src/components/home/FlagshipHome.astro), since 22 October 2026.
  home: true,
  /**
   * Roosevelt High's colours, read from its own site 25 October 2026
   * (rhs.weldre5j.org): the theme's `--primary-color` is #C41230, the
   * Roughrider red, and its `--secondary-color` #000000. White is 6.0:1 on
   * the red, short of the 7:1 the masthead needs, so the two swap: the
   * black is the band and the red the accent (src/config/school-colors.ts).
   */
  school: { name: 'Roosevelt High School', mascot: 'Roughriders', teamName: 'Roosevelt Roughriders', primary: '#C41230', secondary: '#000000' },
  families: {
    label: 'Johnstown Families',
    intro: 'What Johnstown kids can join, what closes soon, and the school days off.',
    schools: [
      {
        district: 'Weld RE-5J',
        label: 'Weld RE-5J: our schools and boundaries',
        url: 'https://www.weldre5j.org/about/our-schools',
        note: 'Most of town: Elwell Elementary (155 Silverbell Dr), Pioneer Ridge Elementary (2300 Cinnamon Teal), Roosevelt Middle (North 2nd St) and Roosevelt High (3349 Roosevelt Pkwy)',
      },
      {
        district: 'Thompson School District R2-J',
        label: 'Thompson School District: school locator',
        url: 'https://www.tsd.org/family/school-locator',
        note: 'Serves some Johnstown addresses; its locator names the Overlook apartments, 2530 Bearberry Lane, as Riverview PK-8 and Mountain View High. Check the address with each district',
      },
    ],
    breaks: [
      { district: 'Weld RE-5J', label: 'No school for preschool to 5th grade (teacher workday)', from: '2026-10-30', to: '2026-10-30', source: 'https://www.weldre5j.org/fs/resource-manager/view/a2404edd-b9a0-4b6e-be7a-28e0f805c65b', verified: '2026-10-22' },
      { district: 'Weld RE-5J', label: 'No school (teacher workday)', from: '2026-11-09', to: '2026-11-09', source: 'https://www.weldre5j.org/fs/resource-manager/view/a2404edd-b9a0-4b6e-be7a-28e0f805c65b', verified: '2026-10-22' },
      { district: 'Weld RE-5J', label: 'Thanksgiving break', from: '2026-11-23', to: '2026-11-27', source: 'https://www.weldre5j.org/fs/resource-manager/view/a2404edd-b9a0-4b6e-be7a-28e0f805c65b', verified: '2026-10-22' },
      { district: 'Weld RE-5J', label: 'No school for preschool to 5th grade (teacher workday)', from: '2026-12-04', to: '2026-12-04', source: 'https://www.weldre5j.org/fs/resource-manager/view/a2404edd-b9a0-4b6e-be7a-28e0f805c65b', verified: '2026-10-22' },
      { district: 'Weld RE-5J', label: 'No preschool (teacher workday); end of the semester', from: '2026-12-17', to: '2026-12-17', source: 'https://www.weldre5j.org/fs/resource-manager/view/a2404edd-b9a0-4b6e-be7a-28e0f805c65b', verified: '2026-10-22' },
      { district: 'Weld RE-5J', label: 'No school (teacher workday)', from: '2026-12-18', to: '2026-12-18', source: 'https://www.weldre5j.org/fs/resource-manager/view/a2404edd-b9a0-4b6e-be7a-28e0f805c65b', verified: '2026-10-22' },
      { district: 'Weld RE-5J', label: 'Winter break', from: '2026-12-21', to: '2027-01-01', source: 'https://www.weldre5j.org/fs/resource-manager/view/a2404edd-b9a0-4b6e-be7a-28e0f805c65b', verified: '2026-10-22' },
      { district: 'Weld RE-5J', label: 'No school (teacher workday); school resumes January 5', from: '2027-01-04', to: '2027-01-04', source: 'https://www.weldre5j.org/fs/resource-manager/view/a2404edd-b9a0-4b6e-be7a-28e0f805c65b', verified: '2026-10-22' },
      { district: 'Weld RE-5J', label: 'No school: Martin Luther King Jr. Day', from: '2027-01-18', to: '2027-01-18', source: 'https://www.weldre5j.org/fs/resource-manager/view/a2404edd-b9a0-4b6e-be7a-28e0f805c65b', verified: '2026-10-22' },
      { district: 'Weld RE-5J', label: 'No school (teacher workday)', from: '2027-02-01', to: '2027-02-01', source: 'https://www.weldre5j.org/fs/resource-manager/view/a2404edd-b9a0-4b6e-be7a-28e0f805c65b', verified: '2026-10-22' },
      { district: 'Weld RE-5J', label: 'No school: Presidents’ Day', from: '2027-02-15', to: '2027-02-15', source: 'https://www.weldre5j.org/fs/resource-manager/view/a2404edd-b9a0-4b6e-be7a-28e0f805c65b', verified: '2026-10-22' },
      { district: 'Weld RE-5J', label: 'No school for preschool to 5th grade (teacher workday)', from: '2027-02-26', to: '2027-02-26', source: 'https://www.weldre5j.org/fs/resource-manager/view/a2404edd-b9a0-4b6e-be7a-28e0f805c65b', verified: '2026-10-22' },
      { district: 'Weld RE-5J', label: 'No school (teacher workday)', from: '2027-03-12', to: '2027-03-12', source: 'https://www.weldre5j.org/fs/resource-manager/view/a2404edd-b9a0-4b6e-be7a-28e0f805c65b', verified: '2026-10-22' },
      { district: 'Weld RE-5J', label: 'Spring break', from: '2027-03-15', to: '2027-03-19', source: 'https://www.weldre5j.org/fs/resource-manager/view/a2404edd-b9a0-4b6e-be7a-28e0f805c65b', verified: '2026-10-22' },
      { district: 'Weld RE-5J', label: 'No school (teacher comp day)', from: '2027-03-22', to: '2027-03-22', source: 'https://www.weldre5j.org/fs/resource-manager/view/a2404edd-b9a0-4b6e-be7a-28e0f805c65b', verified: '2026-10-22' },
      { district: 'Weld RE-5J', label: 'No preschool (teacher workday)', from: '2027-04-01', to: '2027-04-01', source: 'https://www.weldre5j.org/fs/resource-manager/view/a2404edd-b9a0-4b6e-be7a-28e0f805c65b', verified: '2026-10-22' },
      { district: 'Weld RE-5J', label: 'No school for preschool to 5th grade (teacher workday)', from: '2027-04-02', to: '2027-04-02', source: 'https://www.weldre5j.org/fs/resource-manager/view/a2404edd-b9a0-4b6e-be7a-28e0f805c65b', verified: '2026-10-22' },
      { district: 'Weld RE-5J', label: 'No school (teacher workday)', from: '2027-05-03', to: '2027-05-03', source: 'https://www.weldre5j.org/fs/resource-manager/view/a2404edd-b9a0-4b6e-be7a-28e0f805c65b', verified: '2026-10-22' },
    ],
  },
  livingHere: {
    intro: 'Who handles what in Johnstown, across two counties, with the official page for each.',
    sections: [
      {
        title: 'Utilities',
        note: 'Water, sewer, trash and recycling come on one Town bill. Electricity depends on the address: Xcel Energy, United Power or Poudre Valley REA. Xcel supplies natural gas.',
        verified: '2026-10-22',
        items: [
          { label: 'Town utility billing: water, sewer, trash and recycling', url: 'https://johnstownco.gov/348/Utility-Billing', note: 'Pay online, by phone, by mail or at Town Hall, 450 S. Parish Ave, 970-587-4664' },
          { label: 'Starting or stopping service', url: 'https://johnstownco.gov/509/Move-in-Move-Out-Utility-Services', note: 'Separate forms for owners and tenants, with ID; a one-time connection fee goes on the first bill' },
          { label: 'Water and sewer: the Town’s Utilities Department', url: 'https://johnstownco.gov/263/Water-Sewer', note: 'After hours (3 pm to 7 am and weekends) the water and sewer on-call line is 970-534-0242' },
          { label: 'Little Thompson Water District', url: 'https://www.littlethompsonwd.gov/about-us', note: 'Lists portions of Johnstown among the places it serves; check the address' },
          { label: 'Electric and gas providers, by area', url: 'https://johnstownco.gov/510/Utility-Service-Providers', note: 'Xcel for central downtown and the 2534 area, United Power for the Pioneer Ridge area and south, Poudre Valley REA north of County Road 48½ and west of I-25' },
        ],
      },
      {
        title: 'Trash and recycling',
        verified: '2026-10-22',
        items: [
          { label: 'Garbage and recycling, through the Town', url: 'https://johnstownco.gov/452/Garbage-and-Recycling', note: 'Waste Connections, under the Town’s contract; Mondays west of Colorado Boulevard, Wednesdays east, carts out by 7 am; a holiday week moves each a day later' },
          { label: 'Cart sizes and monthly rates', url: 'https://johnstownco.gov/452/Garbage-and-Recycling', note: 'Five-year fixed rates: $14.50 a month for two 96-gallon carts, $12.50 with a 64-gallon trash cart; trash only $12.50 or $10.50' },
          { label: 'Waste Connections customer service', url: 'https://www.wasteconnections.com/contact-us/#5311', note: 'Bulk-item pickup ($15 an item, 48 hours’ notice) and extra carts; 303-288-2100' },
          { label: 'Household hazardous waste', url: 'https://johnstownco.gov/452/Garbage-and-Recycling', note: 'The facilities the Town lists: 1311 N. 17th Ave in Greeley (Tue, Thu and Sat 8–5) and 5500 Highway 52 in Dacono (Wed, Fri and Sat 9–4)' },
        ],
      },
      {
        title: 'Getting around',
        verified: '2026-10-22',
        items: [
          { label: 'Cone Zone: this week’s road closures', url: 'https://johnstownco.gov/685/Cone-Zone--Johnstown-Road-Closures', note: 'The Town’s weekly list of closures and lane work' },
          { label: 'Snow removal plan and plow routes', url: 'https://johnstownco.gov/262/Snow-Removal-Plan', note: 'Emergency routes and arterials first; residential streets only after 6 inches in 24 hours; sidewalks are the owner’s to clear within 24 hours of the last snow' },
          { label: 'Via Mobility: free rides at 60 and over', url: 'https://johnstownco.gov/416/Via-Mobility-Services', note: 'Door-to-door rides for residents 60 or older or unable to drive; register with Via, then book up to 7 days ahead, 303-444-3043', track: 'registration' },
          { label: 'CDOT road conditions', url: 'https://www.cotrip.org/', note: 'I-25 and US 34' },
        ],
      },
      {
        title: 'Parks and recreation',
        verified: '2026-10-22',
        items: [
          { label: 'Town parks', url: 'https://johnstownco.gov/240/Parks', note: 'Open 5 am to 10 pm' },
          { label: 'Reserve a park shelter', url: 'https://johnstownco.gov/299/Reserve-a-Park-Shelter', note: '$40 at most parks, $250 damage deposit; the agreement goes to frontdesk@johnstownco.gov', track: 'registration' },
          { label: 'Johnstown YMCA', url: 'https://www.ymcanoco.org/membership/locations/johnstown-ymca', note: 'Pools, gym, track and fields at 165 Settler Way, 720-797-2020; resident rates with proof of an 80534 address' },
          { label: 'Thompson Rivers Parks and Recreation: registration', url: 'https://anc.apm.activecommunities.com/trpr/activity/search?activity_select_param=2&viewMode=list', note: 'Classes and camps at the Johnstown Activity Center and the Milliken Athletic Complex', track: 'registration' },
          { label: 'Johnstown Senior Center', url: 'https://johnstownco.gov/319/Johnstown-Senior-Center', note: '101 Charlotte St; activities, trips and the Friendly Fork meals, 970-587-5251' },
        ],
      },
      {
        title: 'Schools',
        note: 'Most of Johnstown is in Weld RE-5J; some addresses are in Thompson School District R2-J. Check the address, not the town.',
        verified: '2026-10-22',
        items: [
          { label: 'Weld RE-5J: school boundaries', url: 'https://www.schoolsitelocator.com/apps/weldre5j_2526/', note: 'The district’s address lookup, linked from its schools and registration pages' },
          { label: 'Weld RE-5J: registration and open enrollment', url: 'https://www.weldre5j.org/registration', note: 'New students enroll online; families outside the boundaries apply through the school they want', track: 'registration' },
          { label: 'Weld RE-5J: 2026–27 calendar', url: 'https://www.weldre5j.org/calendar' },
          { label: 'Roosevelt High School', url: 'https://rhs.weldre5j.org/', note: '3349 Roosevelt Pkwy, 970-587-6000' },
          { label: 'Thompson School District: school locator', url: 'https://www.tsd.org/family/school-locator', note: 'For Johnstown addresses in Thompson R2-J; questions 970-613-5663' },
        ],
      },
      {
        title: 'Reporting a problem',
        note: 'Two fire districts serve Johnstown, split roughly at the county line, so check the address.',
        verified: '2026-10-22',
        items: [
          { label: 'Report a concern to the Town', url: 'https://johnstownco.gov/259/Report-a-Concern', note: 'Public Works (streets, potholes, parks, graffiti) and Utilities (water, sewer, hydrants); after hours 970-324-4108 for streets and parks, 970-534-0242 for water and sewer' },
          { label: 'Johnstown Police Department', url: 'https://johnstownco.gov/667/Police', note: '430 S. Parish Ave, 970-587-5555; non-emergency dispatch 970-356-1212 ext. 4; in an emergency call 911' },
          { label: 'Police online reports and requests', url: 'https://johnstownco.gov/548/Citizen-Online-Services', note: 'Abandoned vehicles, extra patrols, traffic complaints, minor crashes, police reports' },
          { label: 'Fire districts, by area', url: 'https://johnstownco.gov/408/Fire-Districts', note: 'Front Range Fire Rescue on the Weld County side, 970-587-4464; Loveland Fire Rescue Authority on the Larimer County side, including 2534, Johnstown Plaza, Iron Horse and Thompson River Ranch, 970-962-2471' },
          { label: 'Power outages and street lights', url: 'https://johnstownco.gov/660/Report-a-Concern-To-Electric-Company', note: 'Not the Town’s: report to Xcel, United Power or Poudre Valley REA, whichever is on your bill or the pole' },
          { label: 'Code enforcement', url: 'https://johnstownco.gov/231/Code-Enforcement', note: 'Weeds, property upkeep and nuisances go to the police department’s community service officers, CSO@JohnstownCO.gov' },
          { label: 'Emergency alerts', url: 'https://johnstownco.gov/234/Emergency-Notifications', note: 'Sign up by county: CodeRED for Weld, LETA 911 for Larimer', track: 'registration' },
        ],
      },
      {
        title: 'Town meetings and participation',
        verified: '2026-10-22',
        items: [
          { label: 'Town Council', url: 'https://johnstownco.gov/207/Town-Council', note: '1st and 3rd Mondays at 7 pm, usually moved to the Wednesday after when the Monday is a holiday; the mayor and six council members, elected at large', track: 'participation' },
          { label: 'Attending, watching and commenting', url: 'https://johnstownco.gov/311/Agendas-and-Minutes', note: 'Come in person, watch online, or send a written comment by 6 pm on the meeting day', track: 'participation' },
          { label: 'Agendas and minutes', url: 'https://johnstownco.portal.civicclerk.com/' },
          { label: 'Council meeting livestream', url: 'https://johnstownco.gov/600/Council-Meeting-Livestream' },
          { label: 'Boards and commissions', url: 'https://johnstownco.gov/200/Boards-Commissions', note: 'Apply online for the Cemetery Committee, the Housing Authority or the Planning and Zoning Commission', track: 'participation' },
          { label: 'Town elections', url: 'https://johnstownco.gov/352/Elections', note: 'The first Tuesday in April of even years; the next is April 4, 2028. The Town Clerk, 970-587-4664' },
          { label: 'Weld County elections', url: 'https://www.weld.gov/Government/Departments/Clerk-and-Recorder/Elections-Department', note: 'For Weld County addresses: ballots mailed from October 2, election day November 3' },
          { label: 'Larimer County elections', url: 'https://www.larimer.gov/clerk/elections', note: 'For Larimer County addresses: vote centers, ballot boxes and the mail ballot process' },
        ],
      },
    ],
  },
  movingHere: {
    listingsLinks: [
      { label: 'Homes for sale on Zillow', url: 'https://www.zillow.com/homes/Johnstown,-CO_rb/' },
      { label: 'Homes for sale on Redfin', url: 'https://www.redfin.com/zipcode/80534' },
      { label: 'Homes for sale on Realtor.com', url: 'https://www.realtor.com/realestateandhomes-search/Johnstown_CO' },
    ],
    schoolDistrict:
      'Mostly Weld County School District RE-5J (Elwell and Pioneer Ridge elementaries, Roosevelt Middle and Roosevelt High, all in town); the north-west corner, on the Larimer County side, is Thompson R2-J. The town lists both.',
    commuteNotes:
      'I-25 at the US 34 interchange is on the west edge of town: about 10 minutes to Loveland, 15 to Greeley on US 34, 25 to Fort Collins, and 50 to Denver. Most commutes are by car.',
  },
  officialLinks: {
    townSite: 'https://johnstownco.gov/',
    townSiteLabel: 'the Town of Johnstown',
    policeNonEmergency: 'https://johnstownpolice.org/',
    policeNonEmergencyLabel: 'Johnstown Police Department',
  },
  formspreeId: 'xljdjnbd',
  plausible: true,
};
