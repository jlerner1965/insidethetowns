// src/config/towns/elizabeth.ts
import type { TownConfig } from './types.ts';

export const elizabeth = {
  kind: 'town',
  status: 'live',
  // Out of the weekly routine from 12 October 2026 on the owner's word
  // (DECISIONS.md, "Severance and Fort Lupton become sections"). Kept, on
  // the owner's word of 15 October 2026, on its readers: 148 visitors in the
  // four weeks to 15 October, more than Golden, Fort Collins or Timnath
  // (DECISIONS.md, "Elizabeth stays"). It stays quiet, with no weekly
  // promise, because the reason it went quiet (an hour from every other
  // guide, so nothing about it combines) has not changed. What is left to
  // decide on 15 November is only whether it rejoins the weekly email; the
  // date stays before any listing's hours expire (the five checked on 18
  // September lose them on 17 November, and the test holds the order).
  quiet: {
    since: '2026-10-12',
    decideBy: '2026-11-15',
    reason: 'kept on 15 October 2026 on its reader numbers, but an hour from the other guides, so it stays out of the weekly email; 15 November decides whether it rejoins',
  },
  variant: 'front-range',
  region: 'South Metro',
  neighbors: ['castle-rock'],
  slug: "elizabeth",
  name: "Elizabeth",
  domain: "insideelizabeth.com",
  siteTitle: "Inside Elizabeth",
  tagline: "An independent guide to Elizabeth, Colorado: Main Street, the Stampede, the Palmer Divide, and what it’s like to live an hour from Denver on the prairie.",
  shortTagline: 'Main Street, the Stampede, and the Palmer Divide',
  seoTagline: 'Events and things to do in Elizabeth, Colorado',
  counties: ['Elbert'],
  state: "CO",
  lat: 39.3603, lng: -104.5969,
  population: 1675, // 2020 census; 2026 estimates put it nearer 3,100
  elevationFt: 6477,
  incorporated: 1890,
  // The guide's "an hour from Denver"; most commuters are going to the Tech
  // Center, which its Getting around puts at 45 minutes.
  driveToDenver: 'About 1 hr; 45 min to the Tech Center',
  population2010: 1358, // 2010 census, for census-to-census growth
  character: 'Prairie and ponderosa on the Palmer Divide, an hour out and sold five acres at a time.',
  colors: {
    // Cardinal red, the school's colour as the guide's (22 October 2026):
    // the shade Elizabeth High's own site brands with (MaxPreps's CC0022 is
    // Loveland High's too, and a guide's primary is its own).
    primary: '#8D181B',
    accent: "#C7A36A",
    paper: "warm",
  },
  hero: {
    image: "hero.jpg",
    alt: "Main Street in Elizabeth, Colorado: the 1907 First National Bank building with its arched openings and the white false-front store beyond, under a clear winter sky",
    // Attribution required by the photograph's CC BY-SA license; see IMAGE_LICENSES.csv.
    credit: "ERoss99, Wikimedia Commons, CC BY-SA 3.0",
  },
  social: { email: "hello@insideelizabeth.com" },
  // A resident guide (TownConfig.home), since 22 October 2026.
  home: true,
  /**
   * Elizabeth High's colours, read from its own site 25 October 2026
   * (ehs.elizabethschooldistrict.org): the theme's `--primary-color` is
   * #8D181B, the cardinal red, and its `--secondary-color` #000000. Black
   * does not read on the red (2.3:1), so the masthead's eyebrows and pills
   * are white (src/config/school-colors.ts).
   */
  school: { name: "Elizabeth High School", mascot: "Cardinals", teamName: "Elizabeth Cardinals", primary: "#8D181B", secondary: "#000000" },
  families: {
    label: "Elizabeth Families",
    intro: "What Elizabeth kids can join, what closes soon, and the school days off.",
    schools: [
      {
        district: "Elizabeth School District",
        label: "Elizabeth School District: boundary map",
        url: "https://www.elizabethschooldistrict.org/about-us/district-boundaries",
        note: "Running Creek and Singing Hills elementaries, Elizabeth Middle and Elizabeth High; the map draws the line between the two elementaries. Legacy Academy and Independence Classical Academy are the district’s K–8 charters",
      },
    ],
    // The district's own calendar page, read month by month on 22 October
    // 2026; it matches the parent calendar PDF linked there (board-approved
    // revisions of 9 December 2025). The copy the Park and Recreation
    // District links is the January 2025 version, with other break dates.
    breaks: [
      { district: "Elizabeth", label: "Thanksgiving break", from: "2026-11-23", to: "2026-11-30", source: "https://www.elizabethschooldistrict.org/all-events", verified: "2026-10-22" },
      { district: "Elizabeth", label: "Winter break", from: "2026-12-21", to: "2027-01-04", source: "https://www.elizabethschooldistrict.org/all-events", verified: "2026-10-22" },
      { district: "Elizabeth", label: "Martin Luther King Jr. Day", from: "2027-01-18", to: "2027-01-18", source: "https://www.elizabethschooldistrict.org/all-events", verified: "2026-10-22" },
      { district: "Elizabeth", label: "Staff workday (no school)", from: "2027-02-12", to: "2027-02-12", source: "https://www.elizabethschooldistrict.org/all-events", verified: "2026-10-22" },
      { district: "Elizabeth", label: "Presidents’ Day", from: "2027-02-15", to: "2027-02-15", source: "https://www.elizabethschooldistrict.org/all-events", verified: "2026-10-22" },
      { district: "Elizabeth", label: "Spring break", from: "2027-03-12", to: "2027-03-19", source: "https://www.elizabethschooldistrict.org/all-events", verified: "2026-10-22" },
      { district: "Elizabeth", label: "Staff workday (no school)", from: "2027-04-23", to: "2027-04-23", source: "https://www.elizabethschooldistrict.org/all-events", verified: "2026-10-22" },
    ],
  },
  // The Town's own site answers automated requests with 403 (sources.json),
  // so nothing below is read from it: the Town's water, sewer, trash and
  // Board of Trustees pages wait for a check by hand. The sidebar's
  // officialLinks still carry the Town and its police department.
  livingHere: {
    intro: "Who handles what in Elizabeth, with the official page for each.",
    sections: [
      {
        title: "Utilities",
        note: "CORE Electric Cooperative supplies electricity in Elizabeth and Black Hills Energy natural gas, by each company’s own documents; for a particular address, especially outside the town limits, ask the company. A home with no sewer connection is on a septic system the County permits.",
        verified: "2026-10-22",
        items: [
          { label: "CORE Electric Cooperative: service area map", url: "https://core.coop/my-cooperative/service-area/", note: "Enter an address to see whether CORE serves it" },
          { label: "CORE: start, stop or move service", url: "https://core.coop/start-stop-service/", note: "Member Services, (800) 332-9540" },
          { label: "Black Hills Energy: natural gas", url: "https://www.blackhillsenergy.com/customer-service", note: "888-890-5554, weekdays 7 am–5 pm. If you smell gas, leave the building and call 911 first" },
          { label: "Elbert County: septic system permits", url: "https://www.elbertcounty-co.gov/341/Onsite-Wastewater-Treatment-Systems-OWTS", note: "Elbert County Public Health, 75 Ute Ave, Kiowa; 720-595-3620" },
        ],
      },
      {
        title: "Getting around",
        verified: "2026-10-22",
        items: [
          { label: "CDOT road conditions", url: "https://www.cotrip.org/", note: "Closures, conditions and cameras on the state highways, CO 86 among them" },
          { label: "Elbert County Road & Bridge", url: "https://www.elbertcounty-co.gov/234/Public-Works-Road-Bridge", note: "County roads; 303-621-3157, RNB@elbertcounty-co.gov" },
          { label: "Elizabeth School District transportation", url: "https://www.elizabethschooldistrict.org/departments/transportation/transportation-homepage", note: "School buses; main line 303-646-6790" },
        ],
      },
      {
        title: "Parks and recreation",
        note: "The leagues, the school-break camps, before- and after-school care and Casey Jones Park are the Elizabeth Park and Recreation District’s, a special district with its own board.",
        verified: "2026-10-22",
        items: [
          { label: "Register for Park and Recreation programs", url: "https://secure.rec1.com/CO/elizabeth-parks-recreation-district-co/catalog", note: "Create an account, then choose the program; youth fees are due in full at registration", track: "registration" },
          { label: "Elizabeth Park and Recreation District", url: "https://www.elizabethpr.com/contact-us", note: "Park office in Evans Park, 34201 County Road 17; 303-646-3599, weekdays 9–5" },
          { label: "Casey Jones Park", url: "https://www.elizabethpr.com/casey-jones-park", note: "103 acres: the pavilion, a playground, a 1.5-mile soft-surface trail, lit ballfields, the rodeo grounds, four pickleball courts and a fenced off-leash dog park" },
          { label: "Kids Club: before- and after-school care", url: "https://www.elizabethpr.com/kids-club-offered-at-running-creek-singing-hills", note: "At Running Creek and Singing Hills; $13 a morning, $15 an afternoon, booked and paid ahead", track: "registration" },
        ],
      },
      {
        title: "Schools",
        note: "Elizabeth School District serves the town. Its schools start an hour late on Thursdays, and a weather closing or delay is announced by 6 am.",
        verified: "2026-10-22",
        items: [
          { label: "Elizabeth School District: boundary map", url: "https://www.elizabethschooldistrict.org/about-us/district-boundaries", note: "Streets, neighborhoods and the line between Running Creek and Singing Hills" },
          { label: "Enrollment and registration", url: "https://www.elizabethschooldistrict.org/about-us/enroll", note: "Registration line (303) 646-6788; a family outside the district applies for open enrollment first", track: "registration" },
          { label: "District calendar, 2026–27", url: "https://www.elizabethschooldistrict.org/all-events", note: "The parent calendar is linked on the page" },
          { label: "School closings and delays", url: "https://www.elizabethschooldistrict.org/departments/safety-and-security/safety-and-security-homepage/school-closings-delays", note: "A delay is two hours, one hour on a Thursday" },
          { label: "Elizabeth High School", url: "https://ehs.elizabethschooldistrict.org/", note: "34500 County Road 13, 303-646-4616" },
        ],
      },
      {
        title: "Reporting a problem",
        note: "Inside the town limits, policing is the Town’s own Elizabeth Police Department; outside them, the Elbert County Sheriff’s Office. In an emergency, call 911.",
        verified: "2026-10-22",
        items: [
          { label: "Elbert County Sheriff’s Office", url: "https://www.elbertcounty-co.gov/181/Sheriffs-Office", note: "Non-emergency dispatch 303-660-7500; tip line 303-805-6111; crime and incident reports online" },
          { label: "Elizabeth Fire Protection District", url: "https://elizabethfpd.colorado.gov/contact-us", note: "146 N Elbert St, (303) 646-3800, weekdays 8–5; Station 271 is at 155 W Kiowa Ave" },
          { label: "Burn permits and fire restrictions", url: "https://elizabethfpd.colorado.gov/fire-prevention/request-a-burn-permit", note: "By phone, 303-646-3800, no more than 48 hours ahead; a state permit may be needed first" },
          { label: "Report a fire code or fire safety concern", url: "https://elizabethfpd.colorado.gov/fire-code-complaint-or-fire-safety-concern" },
          { label: "School safety: Safe2Tell", url: "https://www.elizabethschooldistrict.org/departments/safety-and-security/reporting-concerns", note: "Anonymous, 24 hours a day, through the state’s tip line" },
        ],
      },
      {
        title: "Meetings and elections",
        verified: "2026-10-22",
        items: [
          { label: "Elbert County elections", url: "https://www.elbertcounty-co.gov/290/Elections", note: "A ballot drop box at the Town of Elizabeth, 151 South Banner Street, until 7 pm November 3; the same address is a voter service center on Election Day only, 7 am–7 pm", track: "participation" },
          { label: "Board of Education meetings", url: "https://www.elizabethschooldistrict.org/board-of-education/board-meetings", note: "Second and/or fourth Tuesdays at 6 pm, with exceptions, at the district offices, 634 S. Elbert St; livestreamed on the district’s YouTube channel", track: "participation" },
          { label: "Park and Recreation District board", url: "https://www.elizabethpr.com/board-meetings", note: "Usually the third Tuesday at 7 pm, at the Casey Jones Pavilion or the park office; the 2027 budget hearing is December 8", track: "participation" },
          { label: "Fire Protection District board", url: "https://elizabethfpd.colorado.gov/about-us/board-of-directors/board-meetings-and-other-documents", note: "Second Tuesdays at 5 pm, 155 W Kiowa Ave, and by video call", track: "participation" },
        ],
      },
    ],
  },
  movingHere: {
    listingsLinks: [
      { label: "Homes for sale on Zillow", url: "https://www.zillow.com/elizabeth-co/" },
      { label: "Homes for sale on Redfin", url: "https://www.redfin.com/city/5866/CO/Elizabeth" },
      { label: "Homes for sale on Realtor.com", url: "https://www.realtor.com/realestateandhomes-search/Elizabeth_CO" },
    ],
    schoolDistrict: "Elizabeth School District C-1: Running Creek and Singing Hills elementaries, Elizabeth Middle School and Elizabeth High School.",
    commuteNotes: "About 45 minutes to the Denver Tech Center via Parker Road."
  },
  officialLinks: {
    townSite: "https://www.townofelizabeth.org",
    townSiteLabel: "the Town of Elizabeth",
    policeNonEmergency: "https://www.townofelizabeth.org/police",
    policeNonEmergencyLabel: "Elizabeth Police Department",
  },
  formspreeId: "xyezejwk",
  plausible: true,
} satisfies TownConfig;

export default elizabeth;
