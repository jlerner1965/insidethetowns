import { DEFAULT_TOWN_NAV, type TownConfig } from './types.ts';

export const niwot: TownConfig = {
  kind: 'town',
  status: 'live',
  variant: 'front-range',
  region: 'Boulder County',
  neighbors: ['longmont', 'lyons', 'erie', 'nederland'],
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
  // Unincorporated; a CDP under Boulder County. Incorporation went to a vote
  // on 3 November 2026 — if it passed, this becomes the year of incorporation
  // and /articles/2026-incorporation-election/ needs rewriting with the result.
  incorporated: null,
  driveToDenver: '45–50 min',
  population2010: 4006, // 2010 census, for census-to-census growth
  character: 'Deliberately small and unincorporated: Boulder County and the special districts provide the services, and volunteer groups run the calendar.',
  colors: {
    // Cottonwood green + brick, on warm paper: Color System 2.0, 9 October 2026.
    primary: '#355E46',
    accent: '#A26449',
    paper: 'warm',
  },
  hero: {
    image: 'front-range-from-the-fields.jpg',
    alt: 'Open grassland under a wide Colorado sky near Niwot, the Front Range running along the western horizon',
  },
  social: {
    email: 'hello@insideniwot.com',
  },
  /**
   * The flagship layout (21 October 2026): the week first, Around Niwot and
   * Get Involved as the signature sections, Second Avenue beside the
   * introduction. Terracotta is the brick accent the palette already has.
   */
  home: {
    signature: 'get-involved',
    purpose: 'What’s on this week, who runs what, and how to take part.',
    photo: {
      image: 'second-avenue-street.jpg',
      alt: 'Second Avenue in Old Town Niwot: the Niwot Tribune building with its shingled awning and a row of brick and painted storefronts down the block',
      credit: 'Jeffrey Beall, Flickr, CC BY-SA 2.0',
    },
    secondary: { label: 'Get Involved', href: '/get-involved/' },
    accentName: 'terracotta',
  },
  footer: 'compact',
  // Niwot High's scores and schedules (src/config/school-sports.ts).
  nav: [
    DEFAULT_TOWN_NAV[0]!,
    DEFAULT_TOWN_NAV[1]!,
    DEFAULT_TOWN_NAV[2]!,
    { label: 'Get Involved', href: '/get-involved/' },
    { label: 'Living Here', href: '/living-here/' },
    { label: 'Sports', href: '/sports/' },
  ],
  participation: {
    label: 'Get Involved',
    intro: 'Niwot has no town hall, so the organizations are the town: the associations, the Grange, the Rotary, the Historical Society, the arts group and the youth league. Each entry says what it does, who can take part, what it costs, how to make a first inquiry, and the next public date, with the day it was read.',
  },
  families: {
    label: 'Niwot Families',
    intro: 'The verified routes for a Niwot family: youth sports, the schools, what is on for children, and the breaks on the St. Vrain calendar.',
    schools: [
      {
        district: 'St. Vrain Valley Schools',
        label: 'St. Vrain Valley: maps and boundaries',
        url: 'https://www.svvsd.org/schools/maps-boundaries/',
        note: 'Niwot Elementary, Sunset Middle (Longmont) and Niwot High; open enrollment across the district is common',
      },
    ],
    breaks: [
      { district: 'St. Vrain', label: 'Thanksgiving break', from: '2026-11-23', to: '2026-11-27', source: 'https://svvsd.org/wp-content/uploads/2026/06/26-27-SVVSD-4_8_26-2.pdf', verified: '2026-10-21' },
      { district: 'St. Vrain', label: 'Winter break', from: '2026-12-21', to: '2027-01-01', source: 'https://svvsd.org/wp-content/uploads/2026/06/26-27-SVVSD-4_8_26-2.pdf', verified: '2026-10-21' },
      { district: 'St. Vrain', label: 'Non-student contact day', from: '2027-01-04', to: '2027-01-04', source: 'https://svvsd.org/wp-content/uploads/2026/06/26-27-SVVSD-4_8_26-2.pdf', verified: '2026-10-21' },
      { district: 'St. Vrain', label: 'Non-student contact day', from: '2027-02-12', to: '2027-02-12', source: 'https://svvsd.org/wp-content/uploads/2026/06/26-27-SVVSD-4_8_26-2.pdf', verified: '2026-10-21' },
      { district: 'St. Vrain', label: 'Spring break', from: '2027-03-15', to: '2027-03-19', source: 'https://svvsd.org/wp-content/uploads/2026/06/26-27-SVVSD-4_8_26-2.pdf', verified: '2026-10-21' },
    ],
  },
  livingHere: {
    intro: 'Niwot has no town government, so each service comes from a different body. Which one handles what, as links to the page of its site that does the job; the sewer district and the school all depend on the address.',
    sections: [
      {
        title: 'Roads, snow and maintenance',
        verified: '2026-10-21',
        items: [
          { label: 'Boulder County road maintenance', url: 'https://bouldercounty.gov/transportation/road-maintenance/', note: 'Snow removal, grading, chip seal on county roads; report a problem through Ask Boulder County, 303-441-3962' },
          { label: 'Ask Boulder County: report a road problem', url: 'https://bouldercountyco.comcate.com/en' },
          { label: 'CDOT: CO 119 Diagonal project', url: 'https://www.codot.gov/projects/co119-mobility/about', note: 'The week’s closures on the Diagonal, through spring 2027' },
          { label: 'CDOT road conditions', url: 'https://www.cotrip.org/' },
        ],
      },
      {
        title: 'Water, sewer, trash',
        note: 'Sewer depends on the address: inside the Niwot Sanitation District’s lines it is the district, elsewhere septic.',
        verified: '2026-10-21',
        items: [
          { label: 'Left Hand Water District', url: 'https://lefthandwater.gov/', note: 'Drinking water, rates and meters' },
          { label: 'Niwot Sanitation District', url: 'https://niwotsd.colorado.gov/', note: 'Sewer, where its lines run; check the address' },
          { label: 'Trash and recycling', url: 'https://bouldercounty.gov/environment/recycling/', note: 'Arranged household by household with a private hauler; the county’s page lists the recycling centers' },
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
        title: 'Civic developments and official information',
        note: 'Niwot is unincorporated. Whether it becomes a town is on the November 3, 2026 ballot for electors inside the proposed boundary; this guide reports the question and, after the count, the result.',
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
