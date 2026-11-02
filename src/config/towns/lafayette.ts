import type { TownConfig } from './types.ts';

/**
 * A Boulder County home rule city of 30,411 at the 2020 census, the old
 * coal town east of Boulder on US 287 with an Old Town along Public Road,
 * Waneka Lake and the Coal Creek Trail; Boulder Valley schools. Front Range
 * chassis. A flagship from the day it opened, 2 November 2026, at the
 * owner's word (DECISIONS.md, "Black Hawk and Carbon Valley close;
 * Lafayette and Frederick open"): the one of the five held domains of 30
 * October the owner had already called the real candidate for a guide.
 * Its content was read from the City's, the district's, the library's and
 * the organizers' own pages on 2 November 2026 by the Lafayette build
 * agent; each file names its source.
 *
 * Figures are from the Wikipedia infobox (census and GNIS), read 2 November
 * 2026, as for every other town; the comments say which. The domain,
 * insidelafayette.com, is the owner's (held since 30 October 2026).
 */
export const lafayette: TownConfig = {
  kind: 'town',
  // Live 2 November 2026, on the owner's word, with 33 verified upcoming
  // events and 33 checked listings against a threshold set like Golden's,
  // above the default for a city this size. The Vercel project, DNS and
  // Email Routing are the owner's (DEPLOY.md).
  status: 'live',
  variant: 'front-range',
  region: 'Boulder County',
  // Erie east along Arapahoe (the JUMP runs between them), Longmont up 287,
  // Niwot by the Diagonal's side roads; each names Lafayette back.
  neighbors: ['erie', 'longmont', 'niwot'],
  launchThreshold: { events: 20, listings: 25 },
  slug: 'lafayette',
  name: 'Lafayette',
  domain: 'insidelafayette.com',
  siteTitle: 'Inside Lafayette',
  tagline:
    'An independent guide to Lafayette, Colorado: Old Town and Public Road, Waneka Lake, the Coal Creek Trail, the schools, and what’s on this week.',
  shortTagline: 'Old Town, Waneka Lake and the Coal Creek Trail',
  // Short enough that the state survives the search-result trim (test/seo.test.ts).
  seoTagline: 'Events and places in Lafayette, Colorado',
  character: 'A former coal town of 30,000 in southeast Boulder County, with an old main street, a lake park and Boulder Valley schools.',
  // GNIS, via the Wikipedia infobox: 40°00′12″N 105°06′25″W.
  lat: 40.0033,
  lng: -105.1069,
  population: 30411, // 2020 census
  population2010: 24453, // 2010 census, for census-to-census growth
  elevationFt: 5266, // GNIS, via Wikipedia
  // The Wikipedia infobox says incorporated January 6, 1890, and the State
  // Demography Office's census file gives 1890 too; the City's own "This
  // Date in Lafayette History" page says incorporation papers were filed
  // February 23, 1889 and residents voted 31 to 28 to incorporate on April 2,
  // 1889. The infobox year is used, as for every other town; the history
  // article gives both.
  incorporated: 1890,
  // driveToDenver: left unset. Neither the City's transportation pages nor
  // RTD's give a drive time, and the brief says not to guess one.
  counties: ['Boulder'],
  state: 'CO',
  colors: {
    // Lake teal + old-brick gold, on warm paper, picked 2 November 2026 for
    // distance from Erie's and Longmont's; `npm run check-colors` proves it.
    primary: '#1F5F5B',
    accent: '#B8863B',
    paper: 'warm',
  },
  hero: {
    // Old Town under snow, from Wikimedia Commons (File:Lafayette, CO.jpg,
    // Jared Winkler, February 2018, "Looking East on E Simpson Street toward
    // Iowa Ave"), the 1920px rendition, chosen 2 November 2026 by the rule
    // that the hero is the town itself (docs/HERO-PHOTOS.md). Attribution
    // required by the licence; IMAGE_LICENSES.csv has the row.
    image: 'hero.jpg',
    alt: 'East Simpson Street in Old Town Lafayette under snow in February 2018: a white wooden storefront with a bracketed cornice and a hanging sign on the right, cars parked along the plowed street, bare cottonwoods, and new brick-and-white townhouses on the left',
    credit: 'Jared Winkler, Wikimedia Commons, CC BY-SA 4.0',
  },
  social: {
    email: 'hello@insidelafayette.com',
  },
  // A resident guide (TownConfig.home), from the start.
  home: true,
  /**
   * Centaurus High's colours as the school's own Finalsite theme stylesheet
   * carries them (ceh.bvsd.org/uploaded/themes/madison/css/centaurus-high-school.css,
   * read 2 November 2026): #3a5fcd, the blue the theme uses most (92 rules),
   * #003399, its darker blue, and #e3020e, its red (49 rules). MaxPreps's
   * Centaurus page read with no colour values in it, and a direct request to
   * MaxPreps from the cloud address was refused (403). The lighter blue is
   * 5.7:1 under white and the red about 5:1, and the scoreboard's band needs
   * 7:1 (src/config/school-colors.ts), so the band is the stylesheet's
   * darker blue, 11:1; the sports pages use the same. CHSAANow lists
   * the school in the Granite Peaks league, 4A football and 6A basketball
   * (chsaanow.com/schools/centaurus, read 2 November 2026).
   */
  school: { name: 'Centaurus High School', mascot: 'Warriors', teamName: 'Centaurus Warriors', primary: '#003399', secondary: '#E3020E' },
  // Read 2 November 2026 from BVSD's own pages: the K-12 School Finder
  // (bvsd.org/departments/enrollment/k-12-school-finder, which links
  // bvsd.finder.schoolmint.com), the district's schools list (bvsd.org/schools)
  // and each school's own site for its address (ceh, anm, lae, rye, sae and
  // pie.bvsd.org; peaktopeak.org). The breaks are every no-school day left in
  // 2026–27 as the district's calendar page (bvsd.org/calendar) lists them;
  // the academic-calendar PDF it links was not opened. January 4 and
  // February 17 are district professional-development days and February 16 a
  // conference exchange day, which the calendar lists as days without school.
  families: {
    label: 'Lafayette Families',
    intro: 'What Lafayette kids can join, what closes soon, and the school days off.',
    schools: [
      {
        district: 'Boulder Valley School District',
        label: 'BVSD: K-12 School Finder',
        url: 'https://www.bvsd.org/departments/enrollment/k-12-school-finder',
        note: 'The neighborhood school for an address, by level, with the 2027–28 attendance areas; questions to enrollment.helpdesk@bvsd.org',
      },
      {
        district: 'Boulder Valley School District',
        label: 'BVSD: map of every school',
        url: 'https://bvsd.finder.schoolmint.com/',
        note: 'The district’s SchoolMint map; choice enrollment for 2027–28 is open November 1 to December 18',
      },
      {
        district: 'Boulder Valley School District',
        label: 'Centaurus High School',
        url: 'https://ceh.bvsd.org/',
        note: '10300 S Boulder Road, 720-561-7500',
      },
      {
        district: 'Boulder Valley School District',
        label: 'Angevine Middle School',
        url: 'https://anm.bvsd.org/',
        note: '1150 W South Boulder Road, 720-561-7100',
      },
      {
        district: 'Boulder Valley School District',
        label: 'Lafayette Elementary School',
        url: 'https://lae.bvsd.org/',
        note: '101 N Bermont Avenue, 720-561-8900',
      },
      {
        district: 'Boulder Valley School District',
        label: 'Ryan Elementary STEAM School',
        url: 'https://rye.bvsd.org/',
        note: '1405 Centaur Village Drive, 720-561-7000',
      },
      {
        district: 'Boulder Valley School District',
        label: 'Alicia Sanchez Elementary School',
        url: 'https://sae.bvsd.org/',
        note: '655 Sir Galahad Drive, 720-561-7300',
      },
      {
        district: 'Boulder Valley School District',
        label: 'Escuela Bilingüe Pioneer',
        url: 'https://pie.bvsd.org',
        note: '101 Baseline Road, 720-561-7800',
      },
      {
        district: 'Boulder Valley School District',
        label: 'Peak to Peak Charter School (K–12)',
        url: 'https://www.peaktopeak.org/',
        note: '800 Merlin Drive, 303-453-4600; a BVSD charter, enrolled through the district’s choice-enrollment office',
      },
    ],
    breaks: [
      { district: 'Boulder Valley School District', label: 'Veterans Day', from: '2026-11-11', to: '2026-11-11', source: 'https://www.bvsd.org/calendar', verified: '2026-11-02' },
      { district: 'Boulder Valley School District', label: 'Fall conference exchange days (no school)', from: '2026-11-23', to: '2026-11-24', source: 'https://www.bvsd.org/calendar', verified: '2026-11-02' },
      { district: 'Boulder Valley School District', label: 'Thanksgiving break', from: '2026-11-25', to: '2026-11-27', source: 'https://www.bvsd.org/calendar', verified: '2026-11-02' },
      { district: 'Boulder Valley School District', label: 'Winter break', from: '2026-12-21', to: '2027-01-01', source: 'https://www.bvsd.org/calendar', verified: '2026-11-02' },
      { district: 'Boulder Valley School District', label: 'District professional development day (no students)', from: '2027-01-04', to: '2027-01-04', source: 'https://www.bvsd.org/calendar', verified: '2026-11-02' },
      { district: 'Boulder Valley School District', label: 'Martin Luther King Jr. Day', from: '2027-01-18', to: '2027-01-18', source: 'https://www.bvsd.org/calendar', verified: '2026-11-02' },
      { district: 'Boulder Valley School District', label: 'Presidents’ Day', from: '2027-02-15', to: '2027-02-15', source: 'https://www.bvsd.org/calendar', verified: '2026-11-02' },
      { district: 'Boulder Valley School District', label: 'Conference exchange day and professional development day (no students)', from: '2027-02-16', to: '2027-02-17', source: 'https://www.bvsd.org/calendar', verified: '2026-11-02' },
      { district: 'Boulder Valley School District', label: 'Spring break', from: '2027-03-15', to: '2027-03-19', source: 'https://www.bvsd.org/calendar', verified: '2026-11-02' },
    ],
  },
  participation: {
    label: 'Get involved',
    intro: 'Boards, volunteering, clubs and groups in Lafayette, and how to join each.',
  },
  // Read from the City's, Boulder County's, RTD's and BVSD's own pages on 2
  // November 2026. The City's police pages give the department's line and,
  // for reports, Boulder County dispatch; Xcel Energy's own site is
  // script-only and showed nothing, so the electricity item links the
  // City's Energy page, which names Xcel's programs.
  livingHere: {
    intro: 'Who handles what in Lafayette, with the official page for each.',
    sections: [
      {
        title: 'Utilities',
        note: 'Water, wastewater and stormwater are the City’s, billed with trash on one utility bill. The City’s pages do not name the electric and gas provider; its Energy page points customers to Xcel Energy’s programs.',
        verified: '2026-11-02',
        items: [
          { label: 'City of Lafayette Utility Billing', url: 'https://www.lafayetteco.gov/776/Utility-Billing', note: '303-604-3555, utilitybill@lafayetteco.gov, City Hall, 1290 S Public Rd; renters use the Start and Stop Service forms, a sale is transferred by the title company; $10 late fee once two bills are delinquent, $35 shutoff fee inside city limits; mailed payments to a Dallas lockbox from October 1, 2026' },
          { label: 'Where the water comes from', url: 'https://www.lafayetteco.gov/2780/Water-Resources', note: 'About 80 percent Boulder Creek basin water stored at Goose Haven and Baseline reservoirs, 20 percent Colorado-Big Thompson and Windy Gap water through Northern Water; Waneka Lake is for recreation and irrigation' },
          { label: 'Drought Stage 1', url: 'https://www.lafayetteco.gov/CivicAlerts.aspx?AID=9982', note: 'In effect since April 10, 2026: outdoor watering two days a week at most, none between 10 am and 6 pm, no runoff and no hosing paved areas' },
          { label: 'Energy: Xcel Energy programs and City rebates', url: 'https://www.lafayetteco.gov/1283/Energy', note: 'The City’s page lists Xcel Energy’s income-qualified weatherization and rebates, Boulder County EnergySmart, heat-pump rebates and the state e-bike rebate' },
        ],
      },
      {
        title: 'Trash and recycling',
        note: 'The City contracts Republic Services for its Three Cart Program: you pay by trash-cart size on the City utility bill, and weekly compost and every-other-week recycling come with it.',
        verified: '2026-11-02',
        items: [
          { label: 'Three Cart Program: garbage, recycling and compost', url: 'https://www.lafayetteco.gov/2420/Three-Cart-Program', note: 'Republic Services, 303-286-2400; 2026 monthly rates $19.32 for a 32-gallon trash cart, $30.49 for 64 gallons, $41.67 for 96, each including a $2 administrative fee; 2027: $19.95, $31.53, $43.11; an extra material tag $4; Christmas trees collected January to March; HOAs give three months’ notice to join' },
          { label: 'Fall leaf and branch cleanups', url: 'https://www.lafayetteco.gov/CivicAlerts.aspx?AID=10279', note: 'Republic’s curbside pickups for Three Cart households: November 7 south of South Boulder Road, November 14 north of it and east of US 287, November 21 north of it and west of 287' },
        ],
      },
      {
        title: 'Getting around',
        verified: '2026-11-02',
        items: [
          { label: 'Ride Free Lafayette: the free on-demand shuttle', url: 'https://www.lafayetteco.gov/RideFreeLafayette', note: 'Boulder County’s free door-to-door bus anywhere in the city (and the Kestrel community in Louisville), seven days a week 7 am–8 pm, no service on eight holidays; book at 833-456-3359, in the Ride Free Lafayette app (transit code Lafayette) or at rfl.ecolane.com, up to 30 days ahead' },
          { label: 'RTD buses: the JUMP, 225, DASH and 228', url: 'https://rtd-denver.com/routes-services/find-a-schedule', note: 'RTD’s schedule list names the JUMP (Boulder / Lafayette / Erie, along Arapahoe), the 225 (Boulder / Lafayette via Baseline), the DASH (Boulder / Lafayette via Louisville) and the 228 (Lafayette / Louisville / Broomfield); the JUMP’s timetable ends at the Lafayette Park-n-Ride, 136 spaces' },
          { label: 'RTD fares', url: 'https://www.rtd-denver.com/fares-passes/fares', note: '$2.75 for three hours, $5.50 a day, $88 a month; discount fares $1.35, $2.70 and $27 for 65 and over and riders with disabilities; 19 and under ride free' },
          { label: 'Snow and ice control', url: 'https://www.lafayetteco.gov/222/Snow-and-Ice-Control', note: 'The City plows primary and secondary snow routes, not every street; property owners clear sidewalks within 24 hours of the last measurable snow; Public Works 303-661-1277, Code Enforcement 303-661-1263' },
          { label: 'Fall street sweeping', url: 'https://www.lafayetteco.gov/CivicAlerts.aspx?AID=10279', note: 'October 26 to December 11 in four zones divided by Baseline Road and US 287; keep leaves out of the gutters' },
          { label: 'Parks, open space and trails map (2025)', url: 'https://www.lafayetteco.gov/DocumentCenter/View/44302/Parks-Open-Space-and-Trails-Map-2025', note: 'The City’s map of its 20 parks, 1,640 acres of open space and more than 20 miles of trail, the Coal Creek and Rock Creek regional trails included' },
        ],
      },
      {
        title: 'Recreation',
        note: 'The City runs the recreation center, the parks, the open space, the water park, the lake boathouse and the Senior Center; Boulder County runs the Coal Creek and Rock Creek regional trails.',
        verified: '2026-11-02',
        items: [
          { label: 'Program registration (WebTrac)', url: 'https://www.lafayetteco.gov/1982/Program-Registration', note: 'Online registration for youth sports, swim lessons, camps, fitness, the Senior Center and garden plots; residents usually register a week before non-residents; Lafayette Recreation 303-665-0469', track: 'registration' },
          { label: 'Bob L. Burger Recreation Center, 111 W Baseline Rd', url: 'https://www.lafayetteco.gov/2575', note: 'Mon–Fri 5 am–8 pm, Sat–Sun 8–5; daily admission youth $4, adults $5.75, seniors $4, a $15 family rate on weekend afternoons; monthly pass $38; Reduced Rate Program for residents on assistance; a $34 million renovation starts construction in 2027' },
          { label: 'Senior Services, 103 S Iowa Ave', url: 'https://www.lafayetteco.gov/265/Senior-Services', note: 'Mon–Thu 8:30 am–5 pm, Fri 8:30–4; 303-665-9052; activities, trips, fitness, the Snow Angels program' },
          { label: 'Waneka Lake boathouse, disc golf and pickleball', url: 'https://www.lafayetteco.gov/2647/Waneka-Lake-Boathouse', note: '1600 Caria Dr; paddleboats, kayaks, canoes and paddleboards by the half hour each summer ($10–$18 a paddleboat), nine holes of disc golf, four pickleball courts, park open 6 am–10 pm' },
          { label: 'Park shelter reservations', url: 'https://www.lafayetteco.gov/1555/Park-Shelters', note: 'Lamont Does, Waneka and Whitetail park shelters, $125 each ($225 for both at Waneka), March 1 to October 1, 10 am–6 pm, booked through the recreation center' },
          { label: 'Boulder County Parks & Open Space: Coal Creek Trail', url: 'https://www.bouldercounty.gov/open-space/parks-and-trails/coal-creek-trail/', note: '14 miles from Superior to Erie, soft surface, dogs allowed; trailheads at South Public Road (9 cars) and Flagg Park (18 cars, restroom), which close at sunset' },
        ],
      },
      {
        title: 'Schools',
        note: 'Lafayette is in the Boulder Valley School District. The neighborhood school goes by the address, and choice enrollment lets a family apply to any BVSD school with room.',
        verified: '2026-11-02',
        items: [
          { label: 'BVSD: K-12 School Finder', url: 'https://www.bvsd.org/departments/enrollment/k-12-school-finder', note: 'Lafayette’s schools are Lafayette, Ryan, Alicia Sanchez and Escuela Bilingüe Pioneer elementaries, Angevine Middle and Centaurus High, with Peak to Peak a K–12 charter' },
          { label: 'BVSD: choice enrollment for 2027–28', url: 'https://www.bvsd.org/parents-students/enrollment-center/choice-enrollment', note: 'On-time window November 1 to December 18, 2026 in SchoolMint; lottery offers on or about December 23, accepted within 13 days; late applications to August 31, 2027', track: 'registration' },
          { label: 'BVSD calendar: the days off', url: 'https://www.bvsd.org/calendar', note: 'No school November 11, 23–27, December 21–January 1, January 4 and 18, February 15–17 and March 15–19; last day May 20' },
          { label: 'Centaurus High School', url: 'https://ceh.bvsd.org/', note: '10300 S Boulder Rd, 720-561-7500; a choice-enrollment showcase November 10 and tours November 20, December 4 and 11' },
        ],
      },
      {
        title: 'Reporting a problem',
        verified: '2026-11-02',
        items: [
          { label: 'Report a Concern: potholes, signs, code complaints', url: 'https://lafayetteco.gov/requesttracker.aspx', note: 'The City’s online request tracker; Public Works 303-661-1277 weekdays 8–5, Parks issues 303-661-1306 weekdays 6 am–2:30 pm' },
          { label: 'Lafayette Police Department', url: 'https://www.lafayetteco.gov/1849/File-A-Police-Report', note: '451 N 111th St, 303-665-5571, lobby weekdays 8–5; to file a report or request an officer, Boulder County dispatch 303-441-4444; lost property, theft, harassment and vandalism with no suspect can be reported online; emergency 911' },
          { label: 'Lafayette Fire Department', url: 'https://www.lafayetteco.gov/94/Fire-Department', note: 'Station 1 at 401 N 111th St and Station 2 at 511 Exempla Cir; office 303-665-9661, weekdays 9–4; an ISO Class 2 department with ambulance service' },
          { label: 'Water main break or sewer backup after hours', url: 'https://www.lafayetteco.gov/67/Public-Works', note: 'Boulder County Dispatch, 303-441-4444, on weekends and after hours; Public Works 303-661-1277 in office hours' },
          { label: 'Boulder County emergency alerts', url: 'https://member.everbridge.net/453003085612231/login', note: 'The county’s Everbridge alerts, linked from the City’s home page' },
        ],
      },
      {
        title: 'City meetings and participation',
        note: 'The City elects its Council in odd-numbered years, by mail ballot run with Boulder County; the county runs every election, with a vote center and drive-up drop box at the Southeast County Community Hub and a drop box at the library.',
        verified: '2026-11-02',
        items: [
          { label: 'City Council', url: 'https://www.lafayetteco.gov/247/City-Council', note: '1st and 3rd Tuesdays at 5:30 pm in Council Chambers, City Hall, 1290 S Public Rd; speak at Public Input, send a written comment in English or Spanish by 1 pm on the day, or call 1-877-853-5247, meeting 869 1163 2580', track: 'participation' },
          { label: 'Agendas and minutes', url: 'https://lafayetteco.gov/Archive.aspx', note: 'Council, board and commission packets as they are posted; meetings stream from the City’s video page' },
          { label: 'Serve on a board or commission', url: 'https://www.lafayetteco.gov/245/Boards-Commissions-Committees', note: 'Eleven boards; applications each fall (August 24 to September 18 this year, terms from December 1) and spring; 12 months’ residency and voter registration; ages 11–17 may apply to the Youth Advisory Board', track: 'participation' },
          { label: 'Lafayette Listens: City projects open for comment', url: 'https://lafayette-listens.com/', note: 'The City’s engagement site: the recreation center renovation, the Land Use Code and other projects, with sign-ups for updates', track: 'participation' },
          { label: 'Volunteer with the City (Engage)', url: 'https://engage.lafayetteco.gov/GetInvolved', note: 'Open Space trail ambassadors, stewards, naturalists and Shack volunteers, library Teen Team and adult roles, Snow Angels and event help, all through the City’s Engage site', track: 'participation' },
          { label: 'City of Lafayette elections', url: 'https://www.lafayetteco.gov/424/Elections', note: 'The November 3, 2026 mail-ballot election with Boulder County: Ballot Issue 2A on the Lamont Does Park tax; City Clerk Lynnette Beck, clerks@lafayetteco.gov' },
          { label: 'Boulder County Elections', url: 'https://www.bouldercounty.gov/elections/', note: 'Ballots due by 7 pm on Election Day, November 3; vote centers at the Southeast County Community Hub, 1755 S Public Rd, and the library, 775 W Baseline Rd; 1750 33rd St, Suite 200, Boulder, 303-413-7740' },
        ],
      },
    ],
  },
  movingHere: {
    listingsLinks: [
      { label: 'Homes for sale on Zillow', url: 'https://www.zillow.com/homes/Lafayette,-CO_rb/' },
      { label: 'Homes for sale on Realtor.com', url: 'https://www.realtor.com/realestateandhomes-search/Lafayette_CO' },
    ],
    // Boulder Valley School District (bvsd.org, read 2 November 2026).
    schoolDistrict: 'Boulder Valley School District.',
    // From the Moving Here guide's Getting around section and its sources
    // (RTD's schedule list and fares page, the City's Ride Free Lafayette
    // page, read 2 November 2026). No drive time: no official page gives one.
    commuteNotes:
      'US 287 runs north–south through town and Baseline Road and South Boulder Road west to Boulder. RTD’s JUMP, 225 and DASH buses link Lafayette with Boulder (the JUMP on to Erie) and the 228 with Louisville and Broomfield, from the Lafayette Park-n-Ride; youth 19 and under ride free. Inside the city, Ride Free Lafayette is a free on-demand shuttle, seven days a week, 7 am to 8 pm.',
  },
  officialLinks: {
    // Read 2 November 2026; the home page gives City Hall as 1290 S Public Road, 303-665-5588.
    townSite: 'https://www.lafayetteco.gov/',
    townSiteLabel: 'the City of Lafayette',
    // Read 2 November 2026 from the department's File a Police Report page:
    // "Call our Dispatch Center at 303-441-4444 to file a police report over
    // the phone or request an officer"; the department itself is
    // 303-665-5571 (lafayetteco.gov/police).
    policeNonEmergency: 'https://www.lafayetteco.gov/1849/File-A-Police-Report',
    policeNonEmergencyLabel: 'Lafayette Police Department (non-emergency dispatch 303-441-4444)',
  },
  plausible: true,
};
