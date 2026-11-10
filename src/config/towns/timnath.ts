import type { TownConfig } from './types.ts';

export const timnath: TownConfig = {
  kind: 'town',
  status: 'live',
  variant: 'front-range',
  region: 'Northern Colorado',
  neighbors: ['fortcollins', 'windsor'],
  slug: 'timnath',
  name: 'Timnath',
  domain: 'insidetimnath.com',
  siteTitle: 'Inside Timnath',
  tagline: 'An independent guide to Timnath, Colorado: Old Town Main Street, the reservoir and the river trail, and what it’s like to move to a town that grew tenfold.',
  shortTagline: 'Old Town Main Street, the reservoir and the river trail',
  seoTagline: 'Events, the reservoir and trails in Timnath, CO',
  // 99.9 per cent of the town's population is in Larimer; a sliver of annexed
  // land east of the county line is in Weld, too small to name as a second county.
  counties: ['Larimer'],
  state: 'CO',
  lat: 40.5333,
  lng: -104.9644,
  population: 6487, // 2020 census; 2025 estimate about 11,600
  elevationFt: 4869,
  incorporated: 1920,
  driveToDenver: 'About 1 hr',
  population2010: 625, // 2010 census, for census-to-census growth
  character: 'A farm village that grew tenfold in a decade, census to census, mostly since the Costco.',
  colors: {
    // Cub blue, the school's colour as the guide's (22 October 2026, owner's
    // call that a guide matches its high school): MaxPreps's team data gives
    // 1580A5, darkened 10% to clear the warm paper and the amber notice wash. The gold is the Cubs' too.
    primary: '#137495',
    accent: '#C8880A',
    paper: 'warm',
  },
  // The line under each Find your next stop tile (TownConfig.nextStop), from what
  // the three pages list, 9 November 2026.
  nextStop: { eatDrink: 'Coffee, restaurants, a brewery', thingsToDo: 'Parks, the Poudre River Trail', living: 'Housing, schools, getting around' },
  hero: {
    // Old Town Main Street, the owner's call of 10 November 2026, in place
    // of the frozen pond at sunrise, which showed no town (the rule the
    // other guides' heroes were changed by on 1 November). A 717 px
    // snapshot, the only photograph of Old Town there is to use
    // (docs/HERO-PHOTOS.md): an own shot north from the Beerwerks block is
    // still the plan. The sunrise stays on Moving here. The Old Town listing
    // keeps this photograph too, the one exception to "one photograph, one
    // place" (scripts/validate-content.ts, SHARED_WITH_HERO).
    image: 'old-town.jpg',
    alt: 'Main Street in Old Town Timnath on a summer day: a one-storey tan brick storefront on the corner, tall shade trees along the sidewalk, and the street running on past a red-brick building',
    credit: 'Wikimedia Commons, public domain',
  },
  social: {
    email: 'hello@insidetimnath.com',
  },
  // A resident guide (TownConfig.home), since 9 November 2026 (the owner's brief:
  // Timnath to Inside Berthoud's setup). Every link and fact below was read that day.
  home: true,
  // Quick answers under What's happening. Timnath has no recreation center
  // yet (the Town's project page says it is in design), so no rec center link.
  quickAnswers: {},
  /**
   * Timnath Middle-High's colours, read from its own site 9 November 2026
   * (tmh.psdschools.org): the school's logo (tmh_school_logo.png) is navy
   * #00295B, blue #0080C5 and gold #FEC10D, and the site's theme links in
   * #0073CF with a gold #FFB612. White is 4.3:1 on the logo's blue and
   * 4.8:1 on the theme's, short of the 7:1 the band needs, so the band is
   * the logo's navy (14.3:1), the largest colour in it, with its gold.
   * The guide's own Cub blue (`colors`, MaxPreps's) is untouched.
   */
  school: { name: 'Timnath Middle-High School', mascot: 'Cubs', teamName: 'Timnath Cubs', primary: '#00295B', secondary: '#FEC10D' },
  families: {
    label: 'Timnath Families',
    intro: 'What Timnath kids can join, what closes soon, and the Poudre school days off.',
    schools: [
      {
        district: 'Poudre School District',
        label: 'Poudre School District: neighborhood school locator',
        url: 'https://schoolbus.psdschools.org/Eligibility',
        // The locator is the one the district's Find Your School page links; the choice window is from
        // psdschools.org/choose-psd/school-choice-applications. Both read 9 November 2026.
        note: 'Timnath Elementary, Bethke Elementary and Timnath Middle-High; first-round school choice for 2027–28, by lottery, opens November 30 at 8 am and closes December 16 at 4 pm',
      },
    ],
    // The district's 2026–27 student calendar (one page, updated January 21,
    // 2026), read 9 November 2026. It marks each of these "No School - All
    // Grades" and names none of them; the holidays are named here from their
    // dates. May 17, 2027 is "No School - Elementary" only.
    breaks: [
      { district: 'Poudre', label: 'Thanksgiving break', from: '2026-11-23', to: '2026-11-27', source: 'https://www.psdschools.org/fs/resource-manager/view/1253626b-8595-47a1-9aea-5ef9ed3ea8f6', verified: '2026-11-09' },
      { district: 'Poudre', label: 'Winter break', from: '2026-12-21', to: '2027-01-01', source: 'https://www.psdschools.org/fs/resource-manager/view/1253626b-8595-47a1-9aea-5ef9ed3ea8f6', verified: '2026-11-09' },
      { district: 'Poudre', label: 'No school, all grades', from: '2027-01-04', to: '2027-01-04', source: 'https://www.psdschools.org/fs/resource-manager/view/1253626b-8595-47a1-9aea-5ef9ed3ea8f6', verified: '2026-11-09' },
      { district: 'Poudre', label: 'No school: Martin Luther King Jr. Day', from: '2027-01-18', to: '2027-01-18', source: 'https://www.psdschools.org/fs/resource-manager/view/1253626b-8595-47a1-9aea-5ef9ed3ea8f6', verified: '2026-11-09' },
      { district: 'Poudre', label: 'No school, all grades', from: '2027-02-12', to: '2027-02-12', source: 'https://www.psdschools.org/fs/resource-manager/view/1253626b-8595-47a1-9aea-5ef9ed3ea8f6', verified: '2026-11-09' },
      { district: 'Poudre', label: 'No school: Presidents’ Day', from: '2027-02-15', to: '2027-02-15', source: 'https://www.psdschools.org/fs/resource-manager/view/1253626b-8595-47a1-9aea-5ef9ed3ea8f6', verified: '2026-11-09' },
      { district: 'Poudre', label: 'Spring break', from: '2027-03-15', to: '2027-03-19', source: 'https://www.psdschools.org/fs/resource-manager/view/1253626b-8595-47a1-9aea-5ef9ed3ea8f6', verified: '2026-11-09' },
      { district: 'Poudre', label: 'No school, all grades', from: '2027-04-16', to: '2027-04-16', source: 'https://www.psdschools.org/fs/resource-manager/view/1253626b-8595-47a1-9aea-5ef9ed3ea8f6', verified: '2026-11-09' },
    ],
  },
  participation: {
    label: 'Get involved',
    intro: 'Boards, volunteering and public meetings in Timnath, and how to join each.',
  },
  // Berthoud's sections, each from the official page, read 9 November 2026.
  // Left out because no official page for Timnath was found: food help (the
  // county's pantry list names none in Timnath) and a library.
  livingHere: {
    intro: 'Who handles what in Timnath, with the official page for each.',
    sections: [
      {
        title: 'Utilities',
        note: 'The Town provides no electricity: it is Xcel Energy or Poudre Valley REA, and the address decides which. Water and sewer come from districts, each serving part of town.',
        verified: '2026-11-09',
        items: [
          { label: 'Power providers, as the Town lists them', url: 'https://timnath.org/public-works/', note: 'Xcel Energy and Poudre Valley REA; your address determines which can serve you' },
          { label: 'Poudre Valley REA: service territory', url: 'https://pvrea.coop/the-co-op/about-pvrea/service-territory/', note: 'The electric co-op for members across Larimer, Weld and Boulder counties; 1-800-432-1012' },
          { label: 'Fort Collins-Loveland Water District', url: 'https://fclwd.com/', note: 'Drinking water for parts of Timnath; 5150 Snead Drive, Fort Collins; office and 24-hour emergency line 970-226-3104' },
          { label: 'Boxelder Sanitation District', url: 'https://www.boxeldersanitation.org/about-the-district', note: 'Sewer for portions of Timnath; office by appointment, 970-498-0604; after-hours emergencies 970-567-3006' },
          { label: 'Broadband: the Town’s partnership with Pulse', url: 'https://timnath.org/broadband/', note: 'Fiber internet, TV and voice from Pulse, which owns and runs the network; sign up at pulsefiber.org/timnath as service becomes available' },
        ],
      },
      {
        title: 'Trash and recycling',
        verified: '2026-11-09',
        items: [
          { label: 'Solid waste collection: the Town’s survey', url: 'https://yourtimnath.org/single-hauler-study', note: 'Residents choose their own hauler. The Town surveyed residents on a single-hauler model in 2026; most said they were satisfied, wanted to keep the choice and did not support further study' },
          { label: 'Larimer County solid waste', url: 'https://www.larimer.gov/solidwaste', note: 'The county landfill closed on August 3, 2026; the county’s page says where waste goes now. Household hazardous waste is still taken at 5887 S. Taft Hill Road, Fort Collins, closed to the public on Wednesdays; 24-hour information line 970-498-5770' },
        ],
      },
      {
        title: 'Getting around',
        verified: '2026-11-09',
        items: [
          { label: 'Traffic and transportation', url: 'https://timnath.org/traffic-transportation/', note: 'The Town owns and runs its nine traffic signals; the page has the signal-problem form, the neighborhood traffic-calming program and crossing requests' },
          { label: 'Which Wheels Go Where', url: 'https://timnath.org/which-wheels-go-where/', note: 'The Town’s rules for e-bikes and scooters: Class 1 and 2 e-bikes may use trails and parks where posted; Class 3 is limited to streets, bike lanes and sidewalks' },
        ],
      },
      {
        title: 'Parks and recreation',
        verified: '2026-11-09',
        items: [
          { label: 'Timnath Recreation: registration', url: 'https://timnath.recdesk.com/Community/Home', note: 'Leagues, classes, facility rentals and reservoir permits, on the Town’s RecDesk site', track: 'registration' },
          { label: 'Recreation programs by season', url: 'https://timnath.org/recreation/', note: 'Winter brings the youth basketball league, arts and crafts, youth cooking classes, and dance and cheer', track: 'registration' },
          { label: 'Parks, trails and open space', url: 'https://timnath.org/parks/' },
          { label: 'Timnath Reservoir', url: 'https://timnath.org/timnath-reservoir/', note: 'Boating and shore permits; this guide’s explainer is under Guides' },
          { label: 'Timnath Recreation Center project', url: 'https://yourtimnath.org/recreationcenter', note: 'Not built yet. Voters approved measure 3A in 2025 and a 1.25% sales and use tax began January 1, 2026; the center is planned beside Timnath Parkway and 4th Avenue, and design updates are posted here' },
        ],
      },
      {
        title: 'Schools',
        verified: '2026-11-09',
        items: [
          { label: 'Poudre School District: neighborhood school locator', url: 'https://schoolbus.psdschools.org/Eligibility' },
          { label: 'Poudre: school boundaries and maps', url: 'https://www.psdschools.org/our-schools/neighborhood-school-boundaries' },
          { label: 'Poudre: 2026–27 calendars', url: 'https://www.psdschools.org/about/calendars-schedules', note: 'Breaks and no-school days' },
          { label: 'Poudre: school choice applications', url: 'https://www.psdschools.org/choose-psd/school-choice-applications', note: 'First-round applications for 2027–28, by lottery, open November 30 at 8 am and close December 16 at 4 pm; the second round opens in mid-January 2027. Kindergarten registration for 2027–28 opens November 30', track: 'registration' },
          { label: 'Timnath Middle-High School', url: 'https://tmh.psdschools.org/', note: '4700 Prospect Road; main office 970-419-3400' },
        ],
      },
      {
        title: 'Reporting a problem',
        verified: '2026-11-09',
        items: [
          { label: 'Report an issue to Public Works', url: 'https://timnath.org/public-works-contact-form/', note: 'Road maintenance, snow removal and street sweeping' },
          { label: 'A streetlight that is out', url: 'https://timnath.org/streetlights/', note: 'The Town’s map shows whether a light is the Town’s, Xcel Energy’s or Poudre Valley REA’s, and the page links where to report each' },
          { label: 'Report a code violation', url: 'https://timnath.org/code-enforcement/', note: 'For properties inside town limits, on the Town’s form; contact details are required and anonymous complaints are not processed' },
          { label: 'Timnath Police Department', url: 'https://timnath.org/public-safety/', note: '5601 E Harmony Road; non-emergency dispatch 970-416-1985, general inquiries 970-224-3224; in an emergency call 911' },
          { label: 'Town news by email', url: 'https://timnath.org/subscribe/', note: 'The Town’s newsletter, with a weekly “This Week in Timnath”, and a separate list for development updates' },
        ],
      },
      {
        title: 'Health care',
        note: 'In an emergency call 911.',
        verified: '2026-11-09',
        items: [
          { label: 'UCHealth Emergency Room – Harmony Campus', url: 'https://www.uchealth.org/locations/uchealth-emergency-room-harmony/', note: 'A freestanding emergency room, 4630 Snow Mesa Drive, Fort Collins; open all day, every day; 970-237-8100' },
          { label: 'UCHealth Poudre Valley Hospital', url: 'https://www.uchealth.org/locations/uchealth-poudre-valley-hospital/', note: '1024 S. Lemay Avenue, Fort Collins; 970-495-7000' },
        ],
      },
      {
        title: 'Cars and property tax',
        note: 'These are Larimer County’s.',
        verified: '2026-11-09',
        items: [
          { label: 'Larimer County vehicle licensing', url: 'https://www.larimer.gov/clerk/vehiclelicensing', note: 'Registration and titles. Offices in Fort Collins, 200 W. Oak St, first floor (970-498-7878), and Loveland, 200 Peridot Ave, first floor (970-619-4521), Monday to Friday 8 am to 5 pm except holidays; service online, by phone or in person' },
          { label: 'Larimer County Treasurer: property tax', url: 'https://www.larimer.gov/treasurer', note: 'Paid in two halves, by February 28 and June 15, or in full by April 30, moving to the next business day when a date falls on a non-business day; online, or monthly through EquaPay where a mortgage does not pay it; 200 W. Oak St, Suite 2100, Fort Collins, 970-498-7020' },
        ],
      },
      {
        title: 'Streets and snow',
        verified: '2026-11-09',
        items: [
          { label: 'Snow removal', url: 'https://timnath.org/snow-removal/', note: 'The Town plows by priority: Harmony Road and Main Street first, then the other arterials and select collector streets. It does not typically plow local residential streets' },
          { label: 'Street maintenance and sweeping', url: 'https://timnath.org/street-maintenance/', note: 'The Town sweeps each neighborhood quarterly, weather permitting, neighborhood by neighborhood; the page posts each season’s dates' },
        ],
      },
      {
        title: 'Pets and animals',
        verified: '2026-11-09',
        items: [
          { label: 'Animal control: NOCO Humane', url: 'https://www.nocohumane.org/animal-control/timnath/', note: 'The Town’s animal protection and control partner, with full field service Thursday to Monday; dispatch 970-226-3647, ext. 7. Every dog and cat older than four months must be licensed each year, through NOCO Humane' },
        ],
      },
      {
        title: 'Child care and preschool',
        verified: '2026-11-09',
        items: [
          { label: 'Poudre School District Early Childhood', url: 'https://www.psdschools.org/programs-services/early-childhood', note: 'No-cost and tuition-based preschool; the district’s 2026–27 PreK application and the state’s Universal PreK application are open; 970-490-3204', track: 'registration' },
        ],
      },
      {
        title: 'Town meetings and participation',
        verified: '2026-11-09',
        items: [
          { label: 'Town Council', url: 'https://timnath.org/town-council/', note: '2nd and 4th Tuesdays at 6 pm, Town Center, 4750 Signal Tree Drive; three minutes a person at public comment', track: 'participation' },
          { label: 'Agendas, minutes and written comment', url: 'https://timnath.org/agendas-minutes/', note: 'Email a comment by 5 pm the day before a meeting for it to go in the minutes; meetings stream on the Town’s YouTube channel', track: 'participation' },
          { label: 'Boards and commissions', url: 'https://timnath.org/boards-and-commissions-2/', note: 'The Planning Commission, the Finance Committee, the parks, recreation, open space and trails (PROST) committee and the Main Street Board of Directors, all residents', track: 'participation' },
          { label: 'YourTimnath: projects open to comment', url: 'https://yourtimnath.org/', note: 'The Town’s engagement site; register to answer surveys and follow projects', track: 'participation' },
          { label: 'Larimer County elections', url: 'https://www.larimer.gov/clerk/elections', note: 'Voter registration and results; 200 W. Oak St, Suite 5100, Fort Collins, 970-498-7820' },
        ],
      },
    ],
  },
  movingHere: {
    listingsLinks: [
      { label: 'Homes for sale on Zillow', url: 'https://www.zillow.com/homes/Timnath,-CO_rb/' },
      { label: 'Homes for sale on Redfin', url: 'https://www.redfin.com/zipcode/80547' },
      { label: 'Homes for sale on Realtor.com', url: 'https://www.realtor.com/realestateandhomes-search/Timnath_CO' },
    ],
    schoolDistrict:
      'Poudre School District: Timnath Elementary in Old Town, Bethke Elementary, and Timnath Middle-High School on Prospect Road, all in town.',
    commuteNotes:
      'Harmony Road meets I-25 at the west edge of town: about 10 minutes to south Fort Collins, 20 to Loveland or Old Town Fort Collins, 15 to Windsor and about an hour to Denver. Most commutes are by car.',
  },
  officialLinks: {
    townSite: 'https://timnath.org/',
    townSiteLabel: 'the Town of Timnath',
    policeNonEmergency: 'https://timnath.org/public-safety/',
    policeNonEmergencyLabel: 'Timnath public safety',
  },
  formspreeId: 'xzezegre',
  plausible: true,
};
