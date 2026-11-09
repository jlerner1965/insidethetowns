import type { TownConfig } from './types.ts';

export const lyons: TownConfig = {
  kind: 'town',
  status: 'live',
  variant: 'front-range',
  region: 'Boulder County',
  neighbors: ['longmont', 'niwot', 'estes-park', 'nederland'],
  slug: 'lyons',
  name: 'Lyons',
  domain: 'insidelyons.com',
  siteTitle: 'Inside Lyons',
  tagline: 'An independent guide to Lyons, Colorado: the river, the trails, the music, and what it’s like to live at the canyon mouth.',
  shortTagline: 'Sandstone, the river, and a music festival',
  seoTagline: 'River, trails, music and events in Lyons, Colorado',
  counties: ['Boulder'],
  state: 'CO',
  lat: 40.2247,
  lng: -105.2714,
  population: 2209, // 2020 census
  elevationFt: 5341,
  incorporated: 1891, // platted 1881
  driveToDenver: 'About 1 hr',
  population2010: 2033, // 2010 census, for census-to-census growth
  character: 'The canyon mouth: sandstone, the river, the music, and a town that rebuilt after the flood.',
  colors: {
    // Lion navy + sandstone, on warm paper: the school's colour as the
    // guide's, as Berthoud's and Niwot's are (22 October 2026); it was
    // sandstone orange-red, #A3482D, from 9 October, which stays as the
    // accent. The same navy src/config/school-sports.ts names.
    primary: '#022C66',
    accent: '#A3482D',
    paper: 'warm',
  },
  hero: {
    // Main Street again, from 2 November 2026: the Adobe Stock foothills
    // bought on 28 October (docs/HERO-PHOTOS.md, still licensed, in the
    // images folder) showed no town, and a visitor leaving in ten seconds
    // never learned where they were (the reader pass, 1 November 2026).
    // The Main Street listing is a row while this is the hero.
    image: 'downtown.jpg',
    alt: 'Main Street in Lyons looking west on a summer evening: the stone drug-store building and the Lyons banners on the right, parked cars, the highway signs at the junction ahead and the red sandstone hogback above the town',
    credit: 'Billy Hathorn, Wikimedia Commons, CC BY-SA 3.0',
    // Wide screen: the storefronts and the hogback, not the road.
    position: '50% 40%',
  },
  social: {
    email: 'hello@insidelyons.com',
  },
  // A resident guide (TownConfig.home), since 22 October 2026.
  home: true,
  /**
   * Lyons Middle/Senior High's colours, read from its own site 25 October
   * 2026 (lmshs.svvsd.org): the theme's `--color-primary` is #0054A6, the
   * blue of the school's logo (lmshs-logo.svg), whose other colours are
   * white and the black ring every St. Vrain school's logo has, so the
   * second colour is white. MaxPreps's navy (#022C66) stays on /sports/.
   */
  school: { name: 'Lyons Middle/Senior High School', mascot: 'Lions', teamName: 'Lyons Lions', primary: '#0054A6', secondary: '#FFFFFF' },
  families: {
    label: 'Lyons Families',
    intro: 'What Lyons kids can join, what closes soon, and the school days off.',
    schools: [
      {
        district: 'St. Vrain Valley Schools',
        label: 'St. Vrain Valley: maps and boundaries',
        url: 'https://www.svvsd.org/schools/maps-boundaries/',
        note: 'Lyons Elementary (338 High St) and Lyons Middle/Senior High (100 McConnell Dr), both in town; open enrollment across the district is common',
      },
    ],
    breaks: [
      { district: 'St. Vrain', label: 'Thanksgiving break', from: '2026-11-23', to: '2026-11-27', source: 'https://svvsd.org/wp-content/uploads/2026/06/26-27-SVVSD-4_8_26-2.pdf', verified: '2026-10-21' },
      { district: 'St. Vrain', label: 'Winter break', from: '2026-12-21', to: '2027-01-01', source: 'https://svvsd.org/wp-content/uploads/2026/06/26-27-SVVSD-4_8_26-2.pdf', verified: '2026-10-21' },
      { district: 'St. Vrain', label: 'Non-student contact day', from: '2027-01-04', to: '2027-01-04', source: 'https://svvsd.org/wp-content/uploads/2026/06/26-27-SVVSD-4_8_26-2.pdf', verified: '2026-10-21' },
      { district: 'St. Vrain', label: 'Martin Luther King Jr. Day', from: '2027-01-18', to: '2027-01-18', source: 'https://svvsd.org/wp-content/uploads/2026/06/26-27-SVVSD-4_8_26-2.pdf', verified: '2026-11-09' },
      { district: 'St. Vrain', label: 'Non-student contact day', from: '2027-02-12', to: '2027-02-12', source: 'https://svvsd.org/wp-content/uploads/2026/06/26-27-SVVSD-4_8_26-2.pdf', verified: '2026-10-21' },
      { district: 'St. Vrain', label: 'Presidents’ Day', from: '2027-02-15', to: '2027-02-15', source: 'https://svvsd.org/wp-content/uploads/2026/06/26-27-SVVSD-4_8_26-2.pdf', verified: '2026-11-09' },
      { district: 'St. Vrain', label: 'Spring break', from: '2027-03-15', to: '2027-03-19', source: 'https://svvsd.org/wp-content/uploads/2026/06/26-27-SVVSD-4_8_26-2.pdf', verified: '2026-10-21' },
    ],
  },
  livingHere: {
    intro: 'Who handles what in Lyons, with the official page for each.',
    sections: [
      {
        title: 'Utilities',
        note: 'Water, wastewater and electricity inside the town limits are the Town’s own utilities, on one bill.',
        verified: '2026-11-09',
        items: [
          { label: 'Town of Lyons utilities', url: 'https://www.townoflyons.com/174/Utilities', note: 'Utility billing 303-823-6622 ext. 10; new owners file the utility application after closing' },
          { label: 'Online bill pay', url: 'https://www.xpressbillpay.com/' },
          { label: 'Electric utility', url: 'https://www.townoflyons.com/152/Electric-Utility' },
          { label: 'Water utility', url: 'https://www.townoflyons.com/841/Water-Utility', note: 'Rates, conservation and the summer watering guidelines' },
          { label: 'Utility payment assistance', url: 'https://www.townoflyons.com/285/Utility-Payment-Assistance-Options' },
          { label: 'Natural gas: Xcel Energy', url: 'https://townoflyons.com/CivicSend/ViewMessage/message/227599', note: 'The Town’s notice: Xcel is the only natural gas provider in Lyons; the Town’s own bill covers electricity, water, stormwater and wastewater' },
        ],
      },
      {
        title: 'Trash and recycling',
        verified: '2026-11-09',
        items: [
          { label: 'Trash, recycling and compost, as the Town lists them', url: 'https://townoflyons.com/369/Sustainability-Resources-Waste-Reduction', note: 'Private haulers; Western Disposal offers curbside compost for Lyons residents, by signing up with the company' },
          { label: 'Drop-off recycling center, 198 2nd Ave', url: 'https://townoflyons.com/369/Sustainability-Resources-Waste-Reduction', note: 'Free single-stream recycling, open 7 am to 7 pm daily, run with Boulder County' },
          { label: 'Living with bears', url: 'https://www.townoflyons.com/664/Living-with-Bears', note: 'Bear-resistant cans, and trash out the morning of pickup' },
          { label: 'Household hazardous waste', url: 'https://bouldercounty.gov/environment/hazardous-waste/about-household-hazardous-waste/', note: 'Boulder County’s Hazardous Materials Management Facility, 1901 63rd St in Boulder, Wednesday to Saturday 8:30 am to 4 pm: paint, auto fluids, batteries and the like, free for Lyons residents with proof of residency' },
        ],
      },
      {
        title: 'Getting around',
        verified: '2026-11-09',
        items: [
          { label: 'Lyons Flyer: the free weekday bus to Boulder', url: 'https://www.townoflyons.com/370/Sustainability-Resources-Transportation', note: 'Leaves 4th & Main at 6:10 and 7:50 am, 12:50 and 5:15 pm; leaves 20th & Baseline in Boulder at 7 am, noon, 4:30 and 6 pm; no fare, no pass. No service on New Year’s Day, Martin Luther King Jr. Day, Presidents’ Day, Memorial Day, Independence Day, Labor Day, Thanksgiving and Christmas Day' },
          { label: 'Lyons Flyer route map and stops', url: 'https://www.townoflyons.com/DocumentCenter/View/2320/Lyons-Flyer-Route-Map' },
          { label: 'EcoPass and the MyRide app', url: 'https://www.townoflyons.com/415/EcoPass' },
          { label: 'Bustang to Estes: summer weekends to Estes Park and the national park', url: 'https://ridebustang.com/routes/bustang-to-estes/', note: 'CDOT’s seasonal bus between Denver Union Station, Estes Park and Rocky Mountain National Park, on Saturdays, Sundays and holidays; the 2026 season started May 23. It picks up at the Lyons Park-n-Ride, US 36 and Park St, on the way to Estes and drops off there on the way back' },
          { label: 'Snow and ice: the Town’s plan', url: 'https://www.townoflyons.com/393/Snow-Response-Plan', note: 'Property owners clear their sidewalks within 24 hours of the last snow. The Town plows its 9 miles of streets by priority: main streets from 2 inches, collectors from 4, local streets and alleys from 6. CDOT plows US 36, CO 7 and CO 66 through town' },
          { label: 'CDOT road conditions', url: 'https://www.cotrip.org/', note: 'US 36, CO 7 and CO 66' },
        ],
      },
      {
        title: 'Parks and recreation',
        verified: '2026-11-09',
        items: [
          { label: 'Register for recreation programs', url: 'https://www.townoflyons.com/624/Register-for-Recreation-Programs', note: 'Youth and adult programs; scholarships for local youth in need, recreation@townoflyons.com', track: 'registration' },
          { label: 'Parks and Recreation calendar', url: 'https://townoflyons.recdesk.com/Community/Calendar', track: 'registration' },
          { label: 'Parks, trails and hazard notices', url: 'https://www.townoflyons.com/157/Parks-Recreation', note: 'Bohn Park, LaVern M. Johnson Park and the river corridor' },
          { label: 'Senior programming', url: 'https://www.townoflyons.com/845/Senior-Programming' },
          { label: 'Park parking: fees and passes', url: 'https://www.townoflyons.com/575/Parking', note: 'Paid every day at LaVern M. Johnson Park, Bohn Park, Black Bear Hole and the 2nd Avenue lot: $2 an hour on weekdays and on October to April weekends, $3 on May to September weekends. One free annual pass per Lyons household (a Town utility bill is the proof), a second for $40, a third for $55; non-residents $80 at Town Hall. Passes run January 1 to December 31' },
          { label: 'Dog licences and the dog park', url: 'https://www.townoflyons.com/215/Dog-Licensing', note: 'Every dog in town must be licensed: $30 for the first and $20 for each more ($20 and $15 in April); licences run May 1 to April 30. The fenced ten-acre dog park at the south end of Bohn Park is the only off-leash area in Lyons, free, dawn to dusk' },
        ],
      },
      {
        title: 'Schools',
        verified: '2026-11-09',
        items: [
          { label: 'St. Vrain Valley Schools: maps and boundaries', url: 'https://www.svvsd.org/schools/maps-boundaries/' },
          { label: 'St. Vrain: enrollment and open enrollment', url: 'https://www.svvsd.org/schools/enrollment/', track: 'registration' },
          { label: 'St. Vrain: 2026–27 calendar', url: 'https://www.svvsd.org/schools/school-calendar/' },
          { label: 'Lyons Middle/Senior High School', url: 'https://lmshs.svvsd.org/', note: '100 McConnell Drive, 303-823-6631; the only grades 6–12 school in the district' },
          { label: 'Lyons Elementary preschool', url: 'https://lyonses.svvsd.org/academics/preschool/', note: 'At the school, 338 High St: tuition preschool, half days Monday to Friday, mornings or afternoons; Universal Preschool for eligible 4-year-olds, up to 15 free hours a week; special education preschool for ages 3 to 5' },
          { label: 'Lyons Pathfinders after-school care', url: 'https://lyonses.svvsd.org/activities/community-schools-childcare/', note: 'The district’s licensed care at Lyons Elementary, age five through fifth grade, 2:50 to 6 pm on school days; 303-823-6915' },
          { label: 'Childcare and preschool: Colorado Shines', url: 'https://cdec.colorado.gov/for-families/find-child-care', note: 'The state’s free search of licensed child care and preschool programs, by address, ZIP code or provider, with each one’s quality rating and licensing history' },
        ],
      },
      {
        title: 'Reporting a problem',
        verified: '2026-10-22',
        items: [
          { label: 'Citizen Request Tracker: unsafe conditions around town', url: 'https://www.townoflyons.com/RequestTracker.aspx', note: 'Streets, water, parks, hazards' },
          { label: 'Boulder County Sheriff', url: 'https://www.townoflyons.com/171/Public-Safety', note: 'Policing under contract since 1989; Lyons substation at 430 5th Ave; non-emergency 303-441-4444, emergency 911' },
          { label: 'Lyons Fire Protection District', url: 'https://www.lyonsfire.org/', note: '251 Broadway, 303-823-6611; fire restrictions and burn permits' },
          { label: 'Code compliance', url: 'https://www.townoflyons.com/153/Code-Compliance' },
          { label: 'Town news and updates', url: 'https://www.townoflyons.com/civicalerts.aspx', note: 'A website account manages email notifications' },
        ],
      },
      {
        title: 'Health care and groceries',
        note: 'The nearest emergency rooms and urgent care are in Longmont.',
        verified: '2026-11-09',
        items: [
          { label: 'UCHealth Emergency Care at Longs Peak Hospital', url: 'https://www.uchealth.org/locations/uchealth-emergency-care-longs-peak-hospital/', note: '1750 E. Ken Pratt Blvd, Longmont; open around the clock; 720-718-7000' },
          { label: 'Longmont United Hospital Emergency Department', url: 'https://www.commonspirit.org/find-a-location/emergency-department-commonspirit-longmont-united-hospital-2928', note: '1950 Mountain View Ave, Longmont; the emergency department and trauma unit are open around the clock; 303-651-5111' },
          { label: 'UCHealth Urgent Care – Main Street', url: 'https://www.uchealth.org/locations/uchealth-urgent-care-longmont/', note: '2101 Main St, Longmont, near 21st Avenue; walk-ins, Monday to Friday 8 am to 8 pm, weekends 8 am to 6 pm; 720-745-8030' },
          { label: 'St. Vrain Market, 455 Main St', url: 'https://www.stvrainmarket.com/', note: 'The grocery in town: a locally owned market with produce, staples, a deli and a scratch bakery; Tuesday 11 am to 7 pm, Wednesday to Sunday 9 am to 7 pm, closed Monday' },
        ],
      },
      {
        title: 'Motor vehicles and the post office',
        verified: '2026-11-09',
        items: [
          { label: 'Boulder County Motor Vehicle', url: 'https://bouldercounty.gov/records/motor-vehicle/', note: 'The nearest office is in Longmont, 529 Coffman St (others in Boulder and Lafayette): Monday to Thursday 7:30 am to 5 pm, closed Fridays, by appointment only. Renewals go online, by mail, in a 24-hour drop box or at a kiosk, not in person; 303-413-7710' },
          { label: 'Lyons Post Office, 305 Railroad Ave', url: 'https://tools.usps.com/locations/details/1371280', note: 'Counter Monday to Friday 7:30 am to 4:30 pm, Saturday 8 to 11:30 am; passports by appointment; 303-823-9803' },
        ],
      },
      {
        title: 'Town meetings and participation',
        verified: '2026-11-09',
        items: [
          { label: 'Town Hall, 432 5th Ave', url: 'https://www.townoflyons.com/', note: 'Monday to Thursday 8 am to 4:30 pm, Friday 8 am to noon, closed on holidays; 303-823-6622' },
          { label: 'Board of Trustees', url: 'https://www.townoflyons.com/183/Board-of-Trustees', note: '1st and 3rd Mondays at 7 pm, Town Hall, 432 5th Ave; four minutes for anyone at audience business, residents or not', track: 'participation' },
          { label: 'Agendas and minutes', url: 'https://www.townoflyons.com/agendacenter' },
          { label: 'Meeting videos', url: 'https://www.townoflyons.com/588/Board-of-Trustees-Meeting-Videos' },
          { label: 'Public hearings and legal notices', url: 'https://www.townoflyons.com/194/Legal-Notices' },
          { label: 'Elections', url: 'https://www.townoflyons.com/330/Elections', note: 'The Town Clerk runs the Town’s own elections, held in April: the mayor and six trustees were elected to two-year terms on April 7, 2026. Boulder County’s 24-hour ballot box is at the library, 451 4th Ave; register to vote through Boulder County Elections' },
        ],
      },
    ],
  },
  movingHere: {
    listingsLinks: [
      { label: 'Homes for sale on Zillow', url: 'https://www.zillow.com/homes/Lyons,-CO_rb/' },
      { label: 'Homes for sale on Redfin', url: 'https://www.redfin.com/zipcode/80540' },
      { label: 'Homes for sale on Realtor.com', url: 'https://www.realtor.com/realestateandhomes-search/Lyons_CO' },
    ],
    schoolDistrict: 'St. Vrain Valley School District: Lyons Elementary and Lyons Middle/Senior High, both in town.',
    commuteNotes:
      'About 20 minutes to Boulder on US 36 and 15 to Longmont on CO 66; about an hour to Denver and 1¼ hours to DIA. The free Lyons Flyer makes four weekday trips each way between Fourth and Broadway and Boulder; RTD’s own routes start in Boulder and Longmont.',
  },
  officialLinks: {
    townSite: 'https://www.townoflyons.com/',
    townSiteLabel: 'the Town of Lyons',
    policeNonEmergency: 'https://bouldercounty.gov/safety/sheriff/',
    policeNonEmergencyLabel: 'Boulder County Sheriff',
  },
  formspreeId: 'moevewdw',
  plausible: true,
};
