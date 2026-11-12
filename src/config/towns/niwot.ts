import type { TownConfig } from './types.ts';

export const niwot: TownConfig = {
  kind: 'town',
  status: 'live',
  variant: 'front-range',
  region: 'Boulder County',
  // Lafayette, down the Diagonal's side roads, from 2 November 2026.
  neighbors: ['lyons', 'erie'],
  slug: 'niwot',
  name: 'Niwot',
  domain: 'insideniwot.com',
  siteTitle: 'Inside Niwot',
  tagline: 'An independent guide to Niwot, Colorado: what’s on, where to eat, where to walk, and what it’s like to live here.',
  // An enduring line, since 21 October 2026: the incorporation vote of
  // 3 November 2026 was in this tagline for a month and belongs in dated
  // coverage instead (the election explainer, the local-changes notice and
  // the home page's dated line), where it can be retired the morning after.
  shortTagline: 'Old Town, the trails, and the people who run the place',
  seoTagline: 'Old Town, trails and events in Niwot, Colorado',
  counties: ['Boulder'],
  state: 'CO',
  lat: 40.1039,
  lng: -105.1708,
  population: 4306, // 2020 census, Niwot CDP
  elevationFt: 5168,
  // Unincorporated; a CDP under Boulder County. Incorporation is on the ballot
  // of 3 November 2026 (Boulder County Elections and the Niwot Election
  // Commission, read 26 October 2026). Only if the count certifies a yes and
  // the district court enters its order does this become a year, and
  // /articles/2026-incorporation-election/ is then rewritten with the result.
  incorporated: null,
  driveToDenver: '45–50 min',
  population2010: 4006, // 2010 census, for census-to-census growth
  character: 'Deliberately small and unincorporated: Boulder County and the special districts provide the services, and volunteer groups run the calendar.',
  colors: {
    // Cougar green + brick, on warm paper: the school's colour as the
    // guide's, the owner's call of 22 October 2026 (it was cottonwood green,
    // #355E46, from 9 October); the shade src/config/school-sports.ts names.
    primary: '#007C47',
    accent: '#A26449',
    paper: 'warm',
  },
  // The line under each Find your next stop tile (TownConfig.nextStop), from what
  // the three pages list, 9 November 2026.
  nextStop: { eatDrink: 'Coffee, restaurants, shops', thingsToDo: 'Parks, trails, Old Town', living: 'Water, trash, schools, snow' },
  hero: {
    image: 'second-avenue-street.jpg',
    alt: 'Second Avenue in Old Town Niwot on a summer morning: the Niwot Tribune storefront with its porch and hanging baskets, the brick blocks beyond it, and cars parked along the street',
    credit: 'Jeffrey Beall, Flickr, CC BY-SA 2.0',
  },
  social: {
    email: 'hello@insideniwot.com',
  },
  // A resident guide (TownConfig.home), since 21 October 2026.
  home: true,
  // The restructure of 12 November 2026 (TownConfig.lead).
  lead: 'updates',
  // Quick answers under What's happening (the owner, 8 November 2026).
  quickAnswers: {},
  participation: {
    label: 'Get involved',
    intro: 'The associations, clubs and groups that run Niwot, and how to join each.',
  },
  /**
   * Niwot High's colours, read from its own site 25 October 2026
   * (nhs.svvsd.org): the school's logo (nhs-logo.svg) is the green #008462
   * with white, inside the black ring every St. Vrain school's logo has,
   * and the theme publishes the green as a scale of shades. White is
   * 4.7:1 on #008462, short of the 7:1 the masthead needs, and white
   * cannot be the band, so this is the theme's own darker step
   * (`--color-primary-700`, #126637), 7.04:1. The nearest shade the school
   * publishes, not one picked here.
   */
  school: { name: 'Niwot High School', mascot: 'Cougars', teamName: 'Niwot Cougars', primary: '#126637', secondary: '#FFFFFF' },
  families: {
    label: 'Niwot Families',
    intro: 'What Niwot kids can join, what closes soon, and the St. Vrain school days off.',
    schools: [
      {
        district: 'St. Vrain Valley Schools',
        label: 'St. Vrain Valley: maps and boundaries',
        url: 'https://www.svvsd.org/schools/maps-boundaries/',
        note: 'Niwot Elementary, Sunset Middle (Longmont) and Niwot High; open enrollment across the district is common',
      },
    ],
    // Read again 26 October 2026 against the district's PDF, which marks
    // each of these as schools closed or a non-student contact day; the two
    // Monday holidays and the April days were added then.
    breaks: [
      { district: 'St. Vrain', label: 'Thanksgiving break', from: '2026-11-23', to: '2026-11-27', source: 'https://svvsd.org/wp-content/uploads/2026/06/26-27-SVVSD-4_8_26-2.pdf', verified: '2026-10-26' },
      { district: 'St. Vrain', label: 'Winter break', from: '2026-12-21', to: '2027-01-01', source: 'https://svvsd.org/wp-content/uploads/2026/06/26-27-SVVSD-4_8_26-2.pdf', verified: '2026-10-26' },
      { district: 'St. Vrain', label: 'Non-student contact day', from: '2027-01-04', to: '2027-01-04', source: 'https://svvsd.org/wp-content/uploads/2026/06/26-27-SVVSD-4_8_26-2.pdf', verified: '2026-10-26' },
      { district: 'St. Vrain', label: 'Martin Luther King Jr. Day', from: '2027-01-18', to: '2027-01-18', source: 'https://svvsd.org/wp-content/uploads/2026/06/26-27-SVVSD-4_8_26-2.pdf', verified: '2026-10-26' },
      { district: 'St. Vrain', label: 'Non-student contact day', from: '2027-02-12', to: '2027-02-12', source: 'https://svvsd.org/wp-content/uploads/2026/06/26-27-SVVSD-4_8_26-2.pdf', verified: '2026-10-26' },
      { district: 'St. Vrain', label: 'Presidents’ Day', from: '2027-02-15', to: '2027-02-15', source: 'https://svvsd.org/wp-content/uploads/2026/06/26-27-SVVSD-4_8_26-2.pdf', verified: '2026-10-26' },
      { district: 'St. Vrain', label: 'Spring break', from: '2027-03-15', to: '2027-03-19', source: 'https://svvsd.org/wp-content/uploads/2026/06/26-27-SVVSD-4_8_26-2.pdf', verified: '2026-10-26' },
      { district: 'St. Vrain', label: 'Non-student contact days', from: '2027-04-26', to: '2027-04-27', source: 'https://svvsd.org/wp-content/uploads/2026/06/26-27-SVVSD-4_8_26-2.pdf', verified: '2026-10-26' },
    ],
  },
  livingHere: {
    intro: 'Niwot has no town government: who handles what, with each official page.',
    sections: [
      {
        title: 'Roads, snow and maintenance',
        verified: '2026-10-21',
        items: [
          { label: 'Boulder County road maintenance', url: 'https://bouldercounty.gov/transportation/road-maintenance/', note: 'Snow removal, grading, chip seal on county roads; report a problem through Ask Boulder County, 303-441-3962' },
          { label: 'Ask Boulder County: report a road problem', url: 'https://bouldercountyco.comcate.com/en' },
          { label: 'CDOT: CO 119 Diagonal project', url: 'https://www.codot.gov/projects/co119mobility/about', note: 'The week’s closures on the Diagonal, through spring 2027' },
          { label: 'CDOT road conditions', url: 'https://www.cotrip.org/' },
        ],
      },
      {
        title: 'Getting around',
        verified: '2026-11-09',
        items: [
          { label: 'RTD BOLT: Boulder to Longmont', url: 'https://app.rtd-denver.com/en-US/route/BOLT/schedule', note: 'Stops at CO 119 and Niwot Road both ways, between Downtown Boulder Station and 23rd and Main in Longmont; on New Year’s Day, Memorial Day, Independence Day, Labor Day, Thanksgiving and Christmas, RTD runs its Sunday/holiday schedule' },
        ],
      },
      {
        title: 'Water, sewer, trash',
        note: 'Sewer depends on the address: inside the Niwot Sanitation District’s lines it is the district, elsewhere septic.',
        verified: '2026-10-21',
        items: [
          { label: 'Left Hand Water District', url: 'https://lefthandwater.gov/', note: 'Drinking water, rates and meters' },
          { label: 'Niwot Sanitation District', url: 'https://niwotsd.colorado.gov/', note: 'Sewer, where its lines run; check the address' },
          { label: 'Trash and recycling', url: 'https://bouldercounty.gov/environment/recycle/recycling-center/', note: 'Arranged household by household with a private hauler; the county’s page lists the recycling centers' },
        ],
      },
      {
        title: 'Recycling, yard waste and hazardous waste',
        note: 'The county runs no pickup of its own; it licenses the companies that collect in unincorporated Boulder County.',
        verified: '2026-11-09',
        items: [
          { label: 'Niwot Drop-off Center', url: 'https://bouldercounty.gov/environment/recycle/drop-off-centers/', note: 'North of Highway 52 on North 79th Street; single-stream recycling, open dawn to dusk; 720-564-2757' },
          { label: 'Hazardous Materials Management Facility', url: 'https://bouldercounty.gov/environment/hazardous-waste/management-facility/', note: '1901 63rd St, Boulder, behind the county recycling center; household hazardous waste Wednesday to Saturday, 8:30 am to 4 pm; 720-564-2251' },
          { label: 'Yard waste and wood: Western Disposal', url: 'https://bouldercounty.gov/environment/recycle/drop-off-centers/', note: '2051 63rd St, Boulder, Monday to Saturday 7 am to 5 pm; Boulder County residents get 40% off its yard and wood waste drop-off prices; 303-444-5794' },
          { label: 'Haulers licensed by the county', url: 'https://bouldercounty.gov/environment/trash/hauler-license/', note: 'The list of companies licensed to collect trash, recycling and compost in unincorporated Boulder County, with each one’s phone' },
        ],
      },
      {
        title: 'Safety and permits',
        verified: '2026-10-21',
        items: [
          { label: 'Boulder County Sheriff', url: 'https://bouldercounty.gov/safety/sheriff/', note: 'Law enforcement in unincorporated Niwot; in an emergency call 911' },
          { label: 'Mountain View Fire Rescue', url: 'https://www.mvfpd.org/', note: 'Fire, rescue and emergency medical' },
          { label: 'Boulder County building permits', url: 'https://bouldercounty.gov/property-and-land/land-use/building/building-permits/' },
          { label: 'Boulder County planning and land use', url: 'https://bouldercounty.gov/property-and-land/land-use/planning/' },
        ],
      },
      {
        title: 'Alerts, fire restrictions and animals',
        verified: '2026-11-09',
        items: [
          { label: 'BOCO Alert: emergency alerts', url: 'https://boulderodm.gov/preparedness/emergency-alerts/', note: 'Disaster alerts for unincorporated Boulder County; they reach only people who sign up, at bocoalert.org' },
          { label: 'Boulder County fire restrictions', url: 'https://bouldercounty.gov/safety/fire/fire-restrictions/', note: 'Whether seasonal restrictions are on in unincorporated Boulder County; open burning is not allowed under a Red Flag Warning or in high winds' },
          { label: 'Boulder County Animal Protection', url: 'https://bouldercounty.gov/safety/animals/animal-protection/', note: 'Serves unincorporated Boulder County: injured or sick animals, bites and complaints, through Boulder County Communications, 303-441-4444' },
        ],
      },
      {
        title: 'Health care',
        verified: '2026-11-09',
        items: [
          { label: 'UCHealth Longs Peak Hospital: emergency care', url: 'https://www.uchealth.org/locations/uchealth-longs-peak-hospital/', note: '1750 E. Ken Pratt Boulevard, Longmont; open around the clock; 720-718-7000' },
          { label: 'UCHealth Urgent Care – Main Street', url: 'https://www.uchealth.org/locations/uchealth-urgent-care-longmont/', note: '2101 Main Street, Longmont; walk in or reserve a spot online; Monday to Friday 8 am to 8 pm, weekends 8 am to 6 pm; 720-745-8030' },
        ],
      },
      {
        title: 'Schools',
        verified: '2026-10-21',
        items: [
          { label: 'St. Vrain Valley Schools: maps and boundaries', url: 'https://www.svvsd.org/schools/maps-boundaries/' },
          { label: 'St. Vrain: enrollment and open enrollment', url: 'https://www.svvsd.org/schools/enrollment/', note: 'Open enrollment December 1–15 for 2027–28', track: 'registration' },
          { label: 'St. Vrain: 2026–27 calendar', url: 'https://www.svvsd.org/schools/school-calendar/' },
          { label: 'Niwot High School', url: 'https://nhs.svvsd.org/', note: '8989 East Niwot Road, 303-652-2550' },
        ],
      },
      {
        title: 'Library',
        verified: '2026-11-09',
        items: [
          { label: 'Gunbarrel Library, Boulder Public Library', url: 'https://boulderlibrary.org/locations/gunbarrel/', note: '6500 Lookout Road, Boulder; Monday to Thursday 9 am to 7 pm, Friday 9 to 5, Saturday 10 to 5, Sunday noon to 5; free parking; 303-441-3100' },
        ],
      },
      {
        title: 'Trails and open space',
        verified: '2026-10-21',
        items: [
          { label: 'Boulder County Parks & Open Space: trail closures', url: 'https://bouldercounty.gov/open-space/parks-and-trails/trail-closures/', note: 'Mud, grazing and wildlife closures, updated by the county' },
          { label: 'Parks and trails', url: 'https://bouldercounty.gov/open-space/parks-and-trails/', note: 'The Niwot Loop and the LoBo Trail are the county’s' },
        ],
      },
      {
        title: 'Community organizations',
        verified: '2026-10-21',
        items: [
          { label: 'Get involved in Niwot', url: '/get-involved/', note: 'The associations, the Grange, the Rotary, the Historical Society and the arts group, with how to join each', track: 'participation' },
          { label: 'Niwot Community Association', url: 'https://niwot.org/', note: 'The residents’ voice to the county', track: 'participation' },
          { label: 'Niwot Business Association', url: 'https://niwot.com/', note: 'The merchants, and the downtown events calendar' },
        ],
      },
      {
        title: 'Motor vehicles',
        verified: '2026-11-09',
        items: [
          { label: 'Boulder County Motor Vehicle', url: 'https://bouldercounty.gov/records/motor-vehicle/', note: 'Offices at 529 Coffman St, Longmont; 1750 33rd St, Boulder; and 1755 S. Public Road, Lafayette. Monday to Thursday 7:30 am to 5 pm, closed Fridays, by appointment only; renewals online, by mail, at a 24-hour drop box or at a kiosk, not in person; 303-413-7710' },
        ],
      },
      {
        title: 'Civic developments and official information',
        note: 'Niwot is unincorporated. Whether it becomes a town was on the November 3, 2026 ballot for electors inside the proposed boundary; the count is Boulder County’s to publish and the Election Commission’s to report to the court.',
        verified: '2026-10-21',
        items: [
          { label: 'Boulder County Elections', url: 'https://bouldercounty.gov/elections/', note: 'Registration, drop boxes, vote centers and results' },
          { label: 'Niwot Election Commission', url: 'https://niwotelection.org/', note: 'The certified ballot for the incorporation question' },
          { label: 'Niwot Local Improvement District', url: 'https://bouldercounty.gov/government/boards-and-commissions/niwot-local-improvement-district/', note: 'The 1% business-area sales tax and the committee that recommends how it is spent', track: 'participation' },
          { label: 'Boulder County Commissioners', url: 'https://bouldercounty.gov/government/elected-officials/commissioners/', note: 'The local government for unincorporated Niwot' },
        ],
      },
    ],
  },
  about: {
    who: [
      'Inside Niwot is published by Lerner Works, the small studio James Lerner runs. James grew up in Niwot, and this guide is the one in the network he edits from memory as well as from the sources: the street he knows, read again each week against the organizers’ own pages, the hall’s calendar and the county’s. Every listing still names its source and the day it was checked, because a memory is not a source.',
    ],
  },
  movingHere: {
    listingsLinks: [
      { label: 'Homes for sale on Zillow', url: 'https://www.zillow.com/homes/Niwot,-CO_rb/' },
      { label: 'Homes for sale on Redfin', url: 'https://www.redfin.com/zipcode/80503' },
      { label: 'Homes for sale on Realtor.com', url: 'https://www.realtor.com/realestateandhomes-search/Niwot_CO' },
    ],
    schoolDistrict: 'St. Vrain Valley School District: Niwot Elementary, Sunset Middle (Longmont), Niwot High.',
    commuteNotes:
      'About 20 minutes to Boulder or Longmont on the Diagonal Highway (CO 119); 45–50 to Denver, about 45 to DIA. RTD’s BOLT bus stops at Niwot Road.',
  },
  officialLinks: {
    // Niwot is unincorporated; Boulder County is the local government.
    townSite: 'https://bouldercounty.gov/',
    townSiteLabel: 'Boulder County',
    policeNonEmergency: 'https://bouldercounty.gov/safety/sheriff/',
    policeNonEmergencyLabel: 'Boulder County Sheriff',
  },
  formspreeId: 'xbglgygb',
  plausible: true,
};
