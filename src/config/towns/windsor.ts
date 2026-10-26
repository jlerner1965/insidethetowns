import type { TownConfig } from './types.ts';

/**
 * Windsor, and since 12 October 2026 Severance with it: the Weld County town
 * on Windsor's north-east edge, which had its own guide from 7 to 12 October.
 * It shares Windsor's school district (Weld RE-4, Windsor-Severance) and
 * library district (Clearview), and its guide leaned on Windsor in nearly
 * every article, so it is a section of this one, the way Firestone is of
 * Carbon Valley: every event and place carries a `subTown`, and /severance/
 * is its page. The figures below stay Windsor's own; Severance's are in its
 * Moving Here article. The retired insideseverance.com points here
 * (docs/REDIRECTS.md).
 */
export const windsor: TownConfig = {
  kind: 'town',
  status: 'live',
  variant: 'front-range',
  region: 'Northern Colorado',
  neighbors: ['timnath', 'johnstown', 'fortcollins'],
  subTowns: ['windsor', 'severance'],
  slug: 'windsor',
  name: 'Windsor',
  // insidewindsor.com belongs to someone else; the "co" is the domain's, not the slug's.
  domain: 'insidewindsorco.com',
  siteTitle: 'Inside Windsor',
  tagline: 'An independent guide to Windsor and Severance, Colorado: the lake, Boardwalk Park, Main Street, the Poudre River Trail and two beet towns that grew fast.',
  shortTagline: 'The lake, Boardwalk Park, Main Street and the Poudre Trail',
  // "Colorado" spelled out: Windsor is the most ambiguous name in the network
  // (Ontario, Berkshire, California, Connecticut, Vermont), and "CO" is too
  // weak a signal. test/towns.test.ts holds this name to it.
  seoTagline: 'Events, the lake and trails in Windsor, Colorado',
  counties: ['Weld', 'Larimer'],
  countySplit: {
    note: 'Most of Windsor, including Main Street, Windsor Lake and Town Hall, is in Weld County; the neighborhoods west of the county line are in Larimer. The Town’s own page lists three school districts inside the town limits because of it: Weld RE-4 for most of town, Poudre and Thompson on the Larimer County side.',
    source: 'https://www.windsorco.gov/56/School-Districts',
    verified: '2026-10-01',
  },
  state: 'CO',
  lat: 40.4772,
  lng: -104.9119,
  population: 32716, // 2020 census; the Town's 2026 figure is about 48,000
  elevationFt: 4797,
  incorporated: 1890, // 2 April 1890
  driveToDenver: 'About 1 hr',
  population2010: 18644, // 2010 census, for census-to-census growth
  character: 'A sugar-beet town between Fort Collins and Greeley that grew by three-quarters in a decade, with a lake in the middle.',
  colors: {
    // Wizard maroon, the school's colour as the guide's (22 October 2026):
    // the shade Windsor High's own site brands with (MaxPreps's 8F0018 is
    // Berthoud's too, and a guide's primary is its own). The brass stays: it
    // is the Wizards' gold.
    primary: '#6A1B32',
    accent: '#C2A16D',
    paper: 'cool',
  },
  hero: {
    image: 'windsor-lake-aerial.jpg',
    // A June aerial, in place of the frozen lake that fronted the site in
    // October. The winter view now illustrates the lake trail.
    alt: 'Windsor Lake from the air in June: the lake trail and houses along the near shore, downtown Windsor among its trees on the far one, and the Front Range along the horizon',
    credit: 'Ssullivan1564, Wikimedia Commons, CC BY-SA 4.0',
  },
  social: {
    email: 'hello@insidewindsorco.com',
  },
  // The flagship home page (src/components/home/FlagshipHome.astro), since 22 October 2026.
  home: true,
  /**
   * Windsor High's colours, read from its own site 25 October 2026
   * (whs.weldre4.org), which names them "Maroon and Gold": the page's
   * theme colour is #6A1B32 and the theme's gold accent #FFC900.
   */
  school: { name: 'Windsor High School', mascot: 'Wizards', teamName: 'Windsor Wizards', primary: '#6A1B32', secondary: '#FFC900' },
  families: {
    label: 'Windsor Families',
    intro: 'What Windsor and Severance kids can join, what closes soon, and the school days off.',
    schools: [
      {
        district: 'Weld RE-4',
        label: 'Weld RE-4: find your school by address',
        url: 'https://schoolsitelocator.com/apps/weldre4_2526',
        note: 'Most of Windsor and all of Severance: Windsor High and Severance High; Windsor, Severance and Ridgeline middle schools; Grandview, Hollister Lake, Mountain View, Orchard Hill, Range View and Skyview elementaries and Tozer Primary',
      },
      {
        district: 'Poudre School District',
        label: 'Poudre: which school do I attend?',
        url: 'https://schoolbus.psdschools.org/Eligibility',
        note: 'Part of Windsor on the Larimer County side; the address lookup takes Windsor addresses',
      },
      {
        district: 'Thompson School District',
        label: 'Thompson: school locator',
        url: 'https://www.tsd.org/family/school-locator',
        note: 'Part of Windsor on the Larimer County side; 970-613-5663',
      },
    ],
    // Weld RE-4's own 2026–27 student calendar (board approved 17 November
    // 2025), the PDF its calendar-for-print page links; the district's
    // Google calendar feed gives the same days.
    breaks: [
      { district: 'Weld RE-4', label: 'No school, teacher work day', from: '2026-11-06', to: '2026-11-06', source: 'https://drive.google.com/file/d/1vKq9Aiw0od3R5lfbym_o10ujM-HPcYo0/view', verified: '2026-10-22' },
      { district: 'Weld RE-4', label: 'No school for elementary students', from: '2026-11-20', to: '2026-11-20', source: 'https://drive.google.com/file/d/1vKq9Aiw0od3R5lfbym_o10ujM-HPcYo0/view', verified: '2026-10-22' },
      { district: 'Weld RE-4', label: 'Fall break (Thanksgiving week)', from: '2026-11-23', to: '2026-11-27', source: 'https://drive.google.com/file/d/1vKq9Aiw0od3R5lfbym_o10ujM-HPcYo0/view', verified: '2026-10-22' },
      { district: 'Weld RE-4', label: 'No school, teacher work day', from: '2026-12-18', to: '2026-12-18', source: 'https://drive.google.com/file/d/1vKq9Aiw0od3R5lfbym_o10ujM-HPcYo0/view', verified: '2026-10-22' },
      { district: 'Weld RE-4', label: 'Winter break', from: '2026-12-21', to: '2027-01-05', source: 'https://drive.google.com/file/d/1vKq9Aiw0od3R5lfbym_o10ujM-HPcYo0/view', verified: '2026-10-22' },
      { district: 'Weld RE-4', label: 'No school, staff day; students return January 7', from: '2027-01-06', to: '2027-01-06', source: 'https://drive.google.com/file/d/1vKq9Aiw0od3R5lfbym_o10ujM-HPcYo0/view', verified: '2026-10-22' },
      { district: 'Weld RE-4', label: 'Martin Luther King Jr. Day', from: '2027-01-18', to: '2027-01-18', source: 'https://drive.google.com/file/d/1vKq9Aiw0od3R5lfbym_o10ujM-HPcYo0/view', verified: '2026-10-22' },
      { district: 'Weld RE-4', label: 'No school for elementary students', from: '2027-02-05', to: '2027-02-05', source: 'https://drive.google.com/file/d/1vKq9Aiw0od3R5lfbym_o10ujM-HPcYo0/view', verified: '2026-10-22' },
      { district: 'Weld RE-4', label: 'No school, conference comp day', from: '2027-02-12', to: '2027-02-12', source: 'https://drive.google.com/file/d/1vKq9Aiw0od3R5lfbym_o10ujM-HPcYo0/view', verified: '2026-10-22' },
      { district: 'Weld RE-4', label: 'Presidents’ Day', from: '2027-02-15', to: '2027-02-15', source: 'https://drive.google.com/file/d/1vKq9Aiw0od3R5lfbym_o10ujM-HPcYo0/view', verified: '2026-10-22' },
      { district: 'Weld RE-4', label: 'No school for elementary students', from: '2027-03-05', to: '2027-03-05', source: 'https://drive.google.com/file/d/1vKq9Aiw0od3R5lfbym_o10ujM-HPcYo0/view', verified: '2026-10-22' },
      { district: 'Weld RE-4', label: 'No school, teacher work day', from: '2027-03-12', to: '2027-03-12', source: 'https://drive.google.com/file/d/1vKq9Aiw0od3R5lfbym_o10ujM-HPcYo0/view', verified: '2026-10-22' },
      { district: 'Weld RE-4', label: 'Spring break', from: '2027-03-15', to: '2027-03-19', source: 'https://drive.google.com/file/d/1vKq9Aiw0od3R5lfbym_o10ujM-HPcYo0/view', verified: '2026-10-22' },
      { district: 'Weld RE-4', label: 'No school, teacher work day', from: '2027-04-02', to: '2027-04-02', source: 'https://drive.google.com/file/d/1vKq9Aiw0od3R5lfbym_o10ujM-HPcYo0/view', verified: '2026-10-22' },
      { district: 'Weld RE-4', label: 'No school (may move if state testing dates change)', from: '2027-04-23', to: '2027-04-23', source: 'https://drive.google.com/file/d/1vKq9Aiw0od3R5lfbym_o10ujM-HPcYo0/view', verified: '2026-10-22' },
      { district: 'Weld RE-4', label: 'No school for elementary students (may move with state testing)', from: '2027-04-26', to: '2027-04-26', source: 'https://drive.google.com/file/d/1vKq9Aiw0od3R5lfbym_o10ujM-HPcYo0/view', verified: '2026-10-22' },
    ],
  },
  /**
   * Windsor first, then Severance in the same sections as items labelled
   * "Severance: …", since the two towns' services split the same way (each
   * Town's own water, private trash, separate police, one fire district,
   * one school district). windsorco.gov answers every direct request with a
   * Cloudflare block; its pages were read on 22 October through a reader
   * proxy (r.jina.ai), which returned the live page.
   */
  livingHere: {
    intro: 'Who handles what in Windsor and Severance, with the official page for each.',
    sections: [
      {
        title: 'Utilities',
        note: 'Windsor supplies water, sewer and stormwater in the Weld County part of town and only stormwater on the Larimer County side, where the Fort Collins-Loveland Water District supplies the water. Severance supplies its own water, sewer and stormwater to most of town. A few subdivisions in each are on North Weld County Water District. Electricity and gas depend on the address.',
        verified: '2026-10-22',
        items: [
          { label: 'Windsor utility billing (water, sewer, stormwater)', url: 'https://www.windsorco.gov/369/Utility-Services', note: 'Due the 20th of each month; 970-674-2400, option 2; after-hours water leaks and main breaks 970-674-5415' },
          { label: 'Windsor: pay online through Invoice Cloud', url: 'https://www.invoicecloud.com/TownofWindsorCO' },
          { label: 'Windsor: utilities from other agencies', url: 'https://www.windsorco.gov/998/Services-by-other-Agencies', note: 'Electricity and gas from Xcel Energy, Poudre Valley REA or Atmos Energy, depending on the address; water in Harmony Ridge and Alexander Estates from North Weld County Water District' },
          { label: 'Severance: billed utilities and fees', url: 'https://www.townofseverance.org/258/Billed-Utilities-and-Fees', note: 'Water, sewer, stormwater and transportation utility; billed at the end of the month, due the 15th; utilities@townofseverance.org; after-hours public works emergencies 970-350-9600' },
          { label: 'Severance: water, sewer and power from other agencies', url: 'https://www.townofseverance.org/263/Utility-Services-by-Other-Agencies', note: 'The subdivisions on North Weld County Water District, septic or a metro district’s sewer are listed here; electricity is Xcel or Poudre Valley REA and gas Xcel for most addresses' },
        ],
      },
      {
        title: 'Trash and recycling',
        note: 'Neither Town collects trash. Households hire a private hauler, and many HOAs and metro districts have already contracted one, so check before signing up.',
        verified: '2026-10-22',
        items: [
          { label: 'Windsor: trash haulers, as the Town lists them', url: 'https://www.windsorco.gov/998/Services-by-other-Agencies', note: 'Bunting Disposal, Gallegos Sanitation, Ram Waste Systems and Waste Management; the Town endorses none' },
          { label: 'Windsor: Leaf & Branch Drop and the yard-waste rebate', url: 'https://www.windsorco.gov/1306/Yard-Waste-Rebate-Program', note: 'Fridays to Sundays 8 am–3 pm at 922 N 15th St through November 15 this fall, $10 a carload, residents only, card only; Windsor water customers can claim up to $10 a year for recycling yard waste elsewhere' },
          { label: 'Severance: trash and recycling', url: 'https://www.townofseverance.org/266/Trash-and-Recycling', note: 'Independent companies; some subdivisions include service in their HOA or metro district dues' },
        ],
      },
      {
        title: 'Getting around',
        verified: '2026-10-22',
        items: [
          { label: 'Poudre Express: the weekday bus to Fort Collins and Greeley', url: 'https://greeleyco.gov/transit/routes/poudre-express/', note: 'Greeley-Evans Transit; Windsor stops at Eastman Park Dr and Highway 257 and at Main St and 15th St, between Greeley, UNC, the Harmony Transfer Center and CSU' },
          { label: 'RideNoCo: trip planning and ride referrals', url: 'https://rideno.co/', note: 'Free help finding a ride across Larimer and Weld counties, including volunteer drivers and paratransit; it connects riders to providers rather than driving. The Town of Severance’s transportation page points here' },
          { label: 'Windsor trails map', url: 'https://www.recreationliveshere.com/159/Trails', note: 'More than 40 miles of trail, including the Windsor Lake Trail and the Poudre River Trail' },
          { label: 'CDOT road conditions', url: 'https://www.cotrip.org/', note: 'Closures and conditions on I-25 and the state highways' },
        ],
      },
      {
        title: 'Parks and recreation',
        note: 'Windsor’s Parks, Recreation & Culture department runs the recreation center, the youth leagues and the day camps.',
        verified: '2026-10-22',
        items: [
          { label: 'Windsor recreation: register for programs', url: 'https://cowindsorweb.myvscloud.com/webtrac/web/splash.html', note: 'Youth sports, swim lessons, day camps, classes and memberships; or call 970-674-3500', track: 'registration' },
          { label: 'Windsor Activity Guide', url: 'https://www.recreationliveshere.com/160/Activity-Guide', note: 'Each activity’s registration deadline is listed with it', track: 'registration' },
          { label: 'Community Recreation Center', url: 'https://www.recreationliveshere.com/167/Community-Recreation-Center', note: '250 N 11th St; Mon–Fri 5 am–9 pm, Sat 8 am–7 pm, Sun noon–6 pm; closed on major holidays' },
          { label: 'Reduced Fee Program and Severance youth scholarships', url: 'https://www.recreationliveshere.com/172/Reduced-Fee-Program', note: 'Reduced rates for Windsor residents who qualify by income; up to $100 toward youth sports for Severance residents under 18, while funds last', track: 'registration' },
          { label: 'Windsor parks and shelter reservations', url: 'https://www.recreationliveshere.com/27/Parks', note: 'Only shelters can be reserved; 970-674-3500' },
          { label: 'Severance: parks and park reservations', url: 'https://www.townofseverance.org/209/Parks-Recreation', note: 'The Town’s twelve parks and its reservation request form; 970-686-1218' },
        ],
      },
      {
        title: 'Schools',
        note: 'Severance is all Weld RE-4. Most of Windsor is too, but the Larimer County side is in Poudre or Thompson; check the address, not the town.',
        verified: '2026-10-22',
        items: [
          { label: 'Weld RE-4: find your school by address', url: 'https://schoolsitelocator.com/apps/weldre4_2526' },
          { label: 'Weld RE-4: new student registration', url: 'https://weldre4.org/en-US/enrollment-information-35a8a0b4', note: '2026–27 applications opened February 4; registration help desk 970-686-8045', track: 'registration' },
          { label: 'Weld RE-4: 2026–27 calendar', url: 'https://weldre4.org/en-US/calendar-for-print', note: 'Breaks and no-school days; the last day for students is May 26, 2027' },
          { label: 'The three districts inside Windsor, as the Town lists them', url: 'https://www.windsorco.gov/56/School-Districts' },
          { label: 'Poudre School District: which school do I attend?', url: 'https://schoolbus.psdschools.org/Eligibility', note: 'For addresses on the Larimer County side' },
          { label: 'Thompson School District: school locator', url: 'https://www.tsd.org/family/school-locator', note: 'For addresses on the Larimer County side; 970-613-5663' },
        ],
      },
      {
        title: 'Reporting a problem',
        verified: '2026-10-22',
        items: [
          { label: 'Windsor: SeeClickFix requests', url: 'https://www.windsorco.gov/1317/Report-Problems-Ask-a-Question-Comment', note: 'Non-emergency requests to Town staff, who try to answer within two business days; after-hours water or street problems 970-674-5415' },
          { label: 'Windsor Police Department', url: 'https://www.windsorpd.com/', note: '960 N 15th St; non-emergency 970-674-6400; emergency 911' },
          { label: 'Severance: Citizen Request Tracker', url: 'https://www.townofseverance.org/RequestTracker.aspx', note: 'Code compliance, street repair, streetlights, traffic signals, parking and nuisance animals' },
          { label: 'Severance Police Department', url: 'https://www.townofseverance.org/200/Police', note: '209 1st St, 970-685-9708, weekdays 8–5; after hours, Weld County non-emergency dispatch 970-350-9600' },
          { label: 'Windsor Severance Fire Rescue', url: 'https://wsfr.specialdistrict.org/contact-us', note: 'The fire district for both towns, about 100 square miles; non-emergency 970-686-2626, Monday to Thursday 7–5; no open burning inside either town' },
          { label: 'NOCO Alert emergency notifications', url: 'https://www.nocoalert.org/', note: 'The Town of Windsor sends alerts through NOCO Alert (Larimer County) and CodeRED (Weld County)' },
        ],
      },
      {
        title: 'Town meetings and participation',
        verified: '2026-10-22',
        items: [
          { label: 'Windsor Town Board', url: 'https://www.windsorco.gov/81/Town-Board', note: 'Second and fourth Mondays at 7 pm, Town Hall, 301 Walnut St; sign up in the foyer to speak; streamed on WindsorTV', track: 'participation' },
          { label: 'Windsor agendas, minutes and packets', url: 'https://www.windsorco.gov/153/Agendas-and-Minutes', note: 'Packets are usually posted the Friday before a meeting' },
          { label: 'Windsor boards and commissions: openings', url: 'https://www.windsorco.gov/243/Board-Commission-Vacancies', note: 'Seats open on the Housing Authority, the Parks, Recreation and Culture Advisory Board and the Tree Board; young residents can apply for the Youth Advisory Board; Town Clerk 970-674-2404', track: 'participation' },
          { label: 'Windsor municipal elections', url: 'https://www.windsorco.gov/165/Municipal-Elections', note: 'A mayor elected town-wide and six board members by district; candidates petition for 20 days in January of an election year' },
          { label: 'Severance Town Council', url: 'https://www.townofseverance.org/161/Mayor-Town-Council', note: 'Second and fourth Tuesdays: work session at 5 pm, regular meeting by 6 pm, Town Hall, 3 S Timber Ridge Pkwy', track: 'participation' },
          { label: 'Severance agendas and minutes', url: 'https://www.townofseverance.org/129/Agendas-Minutes' },
          { label: 'Severance Youth Council', url: 'https://www.townofseverance.org/413/Youth-Council', note: 'Teens advising the Town Council; first Mondays at 5 pm at Town Hall', track: 'participation' },
          { label: 'Weld County elections', url: 'https://www.weld.gov/Government/Departments/Clerk-and-Recorder/Elections-Department', note: 'The November 3 general election; voting centers and drop boxes on the county’s map; 970-304-6525' },
          { label: 'Larimer County elections', url: 'https://www.larimer.gov/clerk/elections/current-elections/2026', note: 'For Windsor addresses in Larimer County; ballot boxes open until 7 pm on November 3' },
        ],
      },
    ],
  },
  movingHere: {
    listingsLinks: [
      { label: 'Homes for sale on Zillow', url: 'https://www.zillow.com/homes/Windsor,-CO_rb/' },
      { label: 'Homes for sale on Redfin', url: 'https://www.redfin.com/zipcode/80550' },
      { label: 'Homes for sale on Realtor.com', url: 'https://www.realtor.com/realestateandhomes-search/Windsor_CO' },
    ],
    // "Mostly" is load-bearing: the comparison table shows only the words
    // before the colon, and three districts fall inside the town limits.
    schoolDistrict:
      'Mostly Weld RE-4 (Windsor-Severance): Windsor High, Severance High, three middle schools and seven elementaries; the Larimer County side of town is in Poudre or Thompson, so check the address, not the town.',
    commuteNotes:
      'By car. Harmony Road runs west into Fort Collins, about twenty minutes to Old Town; Colorado 392 reaches I-25 in ten minutes and Greeley in twenty; Loveland is twenty minutes down County Road 17; Denver is about an hour on I-25. The Poudre Express, a weekday commuter bus between Greeley and Fort Collins, stops twice in Windsor; there is no bus network inside the town.',
  },
  officialLinks: {
    townSite: 'https://www.windsorco.gov/',
    townSiteLabel: 'the Town of Windsor',
    policeNonEmergency: 'https://www.windsorco.gov/89/Police',
    policeNonEmergencyLabel: 'Windsor Police Department',
  },
  formspreeId: 'mvkgnjrd',
  plausible: true,
};
