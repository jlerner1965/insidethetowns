/**
 * High-school sports on the town guides: which school each guide follows,
 * where its teams live on MaxPreps, which calendar of the school's own the
 * games to come are checked against, and the shape of the data file.
 *
 * Berthoud was the test site (October 2026); Niwot followed, then six more
 * guides on 22 October 2026 (Timnath, Elizabeth, Johnstown, Windsor,
 * Loveland and Carbon Valley), the same page and the same reader. One entry
 * per school, one data file (data/<town>/sports.json, or
 * data/<town>/sports-<slug>.json where a town follows several schools), one
 * page (/sports/, or /sports/<slug>/ with /sports/ listing the schools) and
 * one strip on the home page, all keyed by the town's slug. The Saturday
 * and Wednesday runs (.github/workflows/sports-maxpreps.yml, `npm run
 * sports`) read each team's MaxPreps home page, check the games to come
 * against the school calendar where there is one it may read, and write
 * the file; the pages read it at build. A town without an entry here has
 * no sports page.
 *
 * To follow another team, add it to the school's list: `maxpreps` is the
 * team's path under the school's MaxPreps URL ("football", "soccer"; a
 * girls' team where the boys' is the default is "cross-country/girls", and
 * the other way round "volleyball/boys"), and `calendar` is how the school
 * calendar titles the varsity team's events ("Boys Varsity Football vs …").
 * The winter list is configured (25 October 2026) and its teams take
 * their place on the pages as MaxPreps fills their schedules in: a team
 * with nothing on MaxPreps is an `empty` entry the page leaves off. Spring
 * teams wait until their season.
 *
 * The school, its mascot, its classification and its league are checked
 * against CHSAANow's member-school profiles and its 2026–28 classification
 * tables (chsaanow.com/schools/<school>, chsaanow.com/data/cloc/classes),
 * read 22 October 2026; the football class and league are noted on each
 * entry. CHSAANow's profiles carry no mascot, so the mascot is MaxPreps's
 * and the school's own.
 */
export interface SportConfig {
  /** The key in the data file and the card's anchor: "football". */
  key: string;
  /** The CHSAA season the team plays in; the page's eyebrow says which season its next game is in. */
  season: 'fall' | 'winter';
  /** As the card names it: "Football", "Boys soccer". */
  name: string;
  /** The team's path under the school's MaxPreps URL: "football", "soccer", "cross-country/girls". */
  maxpreps: string;
  /** The school calendar's words for the varsity team, as they open the event title. */
  calendar: { gender: 'Boys' | 'Girls'; sport: string };
  /**
   * Where this sport's playoff games are played when every class plays at
   * one site: CHSAA's state softball tournament is at Aurora Sports Park.
   * A playoff game MaxPreps files as "home" is still played there, so the
   * page names the park rather than "Home". Unset for a sport whose
   * playoff venues vary; MaxPreps's own venue is used where it gives one.
   */
  playoffVenue?: string;
}

export interface SchoolSports {
  /** The town's slug. */
  town: string;
  /**
   * The school's own slug, only where the town follows several schools
   * (Loveland's four): its page is then /sports/<slug>/ and its file
   * data/<town>/sports-<slug>.json, and /sports/ lists the schools. A
   * town's only school has no slug, and keeps /sports/ and sports.json.
   */
  slug?: string;
  /** "Berthoud High School". */
  school: string;
  /**
   * One line the page says once, under its introduction, where the school
   * serves more than the town the guide is named for: Carbon Valley's
   * Frederick High takes Dacono's and Firestone's students too.
   */
  note?: string;
  /** "Spartans": how the pages name the teams. */
  mascot: string;
  /**
   * The menu's word for the sports page where "<mascot> sports" would not
   * say whose team it is (src/lib/nav.ts): Carbon Valley is four towns and
   * the Golden Eagles are Frederick High's.
   */
  navLabel?: string;
  /** The school's MaxPreps URL; each team's page is `maxpreps` + its path + "/". */
  maxpreps: string;
  /** How MaxPreps names the school in a game's data ("Berthoud"), to tell our side from theirs. */
  maxprepsName: string;
  /**
   * The school's own calendar, for the cross-check. Only a Finalsite month
   * grid is read today (scripts/lib/finalsite-calendar.ts). A school whose
   * calendar may not be read by a machine (a robots.txt that says no, as
   * ArbiterLive's does) has none, and `calendarNote` says why on the page
   * and in the run summary.
   */
  calendar?: { kind: 'finalsite'; url: string; label: string };
  calendarNote?: string;
  /**
   * The school's own colour, for the sports page and the home page's game
   * strip: those are the Spartans' and the Cougars' pages, not the town's,
   * and a maroon-and-white school in a green guide reads wrong. Inside those
   * two it does every job the town's primary does (the records, the dark
   * band, the pills, the links, with white on it), so it has to clear what
   * a primary clears; `npm run check-colors` proves it. Absent, the guide's
   * primary stays.
   */
  colors?: { primary: string };
  teams: SportConfig[];
}

const FALL = (): SportConfig[] => [
  { key: 'football', season: 'fall', name: 'Football', maxpreps: 'football', calendar: { gender: 'Boys', sport: 'Football' } },
  { key: 'boys-soccer', season: 'fall', name: 'Boys soccer', maxpreps: 'soccer', calendar: { gender: 'Boys', sport: 'Soccer' } },
  { key: 'volleyball', season: 'fall', name: 'Volleyball', maxpreps: 'volleyball', calendar: { gender: 'Girls', sport: 'Volleyball' } },
  // Softball is a fall sport in Colorado, which MaxPreps files under the
  // spring sport's name with the season after it (CHSAA's school pages list
  // it for both schools, 21 October 2026).
  { key: 'softball', season: 'fall', name: 'Softball', maxpreps: 'softball/fall', calendar: { gender: 'Girls', sport: 'Softball' }, playoffVenue: 'Aurora Sports Park' },
  { key: 'boys-cross-country', season: 'fall', name: 'Boys cross country', maxpreps: 'cross-country', calendar: { gender: 'Boys', sport: 'Cross Country' } },
  { key: 'girls-cross-country', season: 'fall', name: 'Girls cross country', maxpreps: 'cross-country/girls', calendar: { gender: 'Girls', sport: 'Cross Country' } },
];

/**
 * The winter teams, CHSAA's season: boys' and girls' basketball, wrestling
 * (the boys' team; MaxPreps has a girls' page for Berthoud, Roosevelt,
 * Loveland High and Frederick only, and it is not followed) and girls'
 * swimming (the winter season; the boys swim in spring). Each path was
 * read from the GitHub runner on 25 October 2026 with the run's own fetch
 * and reader (scripts/lib/maxpreps.ts, as `npm run sports -- --town=<town>
 * --sport=<path>` reads a page; MaxPreps refuses the cloud address this
 * was written from): `basketball` and `basketball/girls` exist for every
 * school and already carry a schedule; `wrestling` exists for every school
 * with no schedule yet; `swimming/girls` exists for every school but
 * Elizabeth's and Lyons's (HTTP 404 both, so neither follows it). The
 * calendar words are the Finalsite pattern's ("Boys Varsity Basketball vs
 * …"); swimming's is unverified until the season and a mismatch only
 * notes a game as not on the school calendar.
 */
const WINTER = (): SportConfig[] => [
  { key: 'boys-basketball', season: 'winter', name: 'Boys basketball', maxpreps: 'basketball', calendar: { gender: 'Boys', sport: 'Basketball' } },
  { key: 'girls-basketball', season: 'winter', name: 'Girls basketball', maxpreps: 'basketball/girls', calendar: { gender: 'Girls', sport: 'Basketball' } },
  { key: 'wrestling', season: 'winter', name: 'Wrestling', maxpreps: 'wrestling', calendar: { gender: 'Boys', sport: 'Wrestling' } },
  { key: 'girls-swimming', season: 'winter', name: 'Girls swimming', maxpreps: 'swimming/girls', calendar: { gender: 'Girls', sport: 'Swimming' } },
];

/**
 * Ice hockey, only where CHSAA's 2026–28 alignment lists the school
 * (chsaanow.com/data/cloc/classes, ice hockey, read 25 October 2026): of
 * the schools followed, Resurrection Christian alone (4A Metro); the
 * Poudre School District co-op is listed as the district, not as Timnath.
 * MaxPreps's `ice-hockey` page exists for Resurrection Christian and for no
 * other school followed (HTTP 404, the runner, the same day).
 */
const ICE_HOCKEY: SportConfig = { key: 'ice-hockey', season: 'winter', name: 'Ice hockey', maxpreps: 'ice-hockey', calendar: { gender: 'Boys', sport: 'Ice Hockey' } };

/** The fall list without one team, for a school that does not field it. */
const FALL_WITHOUT = (...keys: string[]): SportConfig[] => FALL().filter((t) => !keys.includes(t.key));
/** The winter list without one team, for a school whose MaxPreps page for it does not exist. */
const WINTER_WITHOUT = (...keys: string[]): SportConfig[] => WINTER().filter((t) => !keys.includes(t.key));
/** Every school's teams: the fall list, or a variant of it, then the winter list. */
const TEAMS = (fall: SportConfig[] = FALL(), winter: SportConfig[] = WINTER()): SportConfig[] => [...fall, ...winter];

/**
 * Thompson School District's Finalsite sites: `?cal_date=YYYY-MM-01` shows a
 * month, and the varsity games are titled "Boys Varsity Football @ …". Each
 * school's robots.txt has its own say: Berthoud's and Mountain View's allow
 * the calendar, Loveland High's and Thompson Valley's do not.
 */
const TSD_CALENDAR = (host: string, label: string): NonNullable<SchoolSports['calendar']> => ({ kind: 'finalsite', url: `https://${host}.tsd.org/family/calendar`, label });

export const SCHOOL_SPORTS: SchoolSports[] = [
  {
    town: 'berthoud',
    school: 'Berthoud High School',
    mascot: 'Spartans',
    maxpreps: 'https://www.maxpreps.com/co/berthoud/berthoud-spartans/',
    maxprepsName: 'Berthoud',
    // Spartan maroon, the shade Berthoud High's own site brands with
    // (bhs.tsd.org, 22 October 2026); MaxPreps's 8F0018 read as red.
    colors: { primary: '#572932' },
    // Thompson School District's Finalsite site; `?cal_date=YYYY-MM-01` shows a month.
    calendar: { kind: 'finalsite', url: 'https://bhs.tsd.org/family/calendar', label: 'the Berthoud High calendar' },
    teams: TEAMS(),
  },
  {
    town: 'niwot',
    school: 'Niwot High School',
    mascot: 'Cougars',
    maxpreps: 'https://www.maxpreps.com/co/niwot/niwot-cougars/',
    maxprepsName: 'Niwot',
    // Cougar green, as MaxPreps's team data gives it (00824B, 21 October
    // 2026), darkened 5%: the exact shade is 4.49:1 on the warm paper and
    // the records are set in it there. The guide's own green is #355E46.
    colors: { primary: '#007C47' },
    // St. Vrain Valley keeps Niwot's schedules on ArbiterLive
    // (arbiterlive.com/School/Calendar/16031), whose robots.txt disallows
    // every automated reader, so there is nothing to check against.
    calendarNote: 'Niwot’s schedules live on ArbiterLive, which asks automated readers to stay out, so games to come are published on MaxPreps’s word alone.',
    teams: TEAMS(),
  },
  // The six guides of 22 October 2026, the Berthoud pattern as it stands.
  // Each school's colour is MaxPreps's first school colour, read by the
  // probe on the GitHub runner that day (`npm run sports -- --sport=football`
  // prints them); one is darkened a step to clear the paper, as Niwot's was.
  {
    town: 'timnath',
    // CHSAANow: Timnath Middle-High School, Poudre R-1; football 3A, Granite Peaks (2026–28).
    school: 'Timnath Middle-High School',
    mascot: 'Cubs',
    maxpreps: 'https://www.maxpreps.com/co/timnath/timnath-cubs/',
    maxprepsName: 'Timnath',
    // Cub blue, as MaxPreps's team data gives it (1580A5, 22 October 2026),
    // darkened 10%: the exact shade is 4.13:1 on the warm paper and 6% short on the amber wash. The guide's
    // primary is the same.
    colors: { primary: '#137495' },
    // Poudre School District keeps Timnath's schedules on ArbiterLive
    // (arbiterlive.com/Teams?entityId=119370, linked from
    // tmh.psdschools.org/athletics), whose robots.txt disallows every
    // automated reader.
    calendarNote: 'Timnath’s schedules live on ArbiterLive, which asks automated readers to stay out, so games to come are published on MaxPreps’s word alone.',
    teams: TEAMS(),
  },
  {
    town: 'elizabeth',
    // CHSAANow: Elizabeth High School, Elizabeth School District; football 2A, 2A Metro (2026–28).
    school: 'Elizabeth High School',
    mascot: 'Cardinals',
    maxpreps: 'https://www.maxpreps.com/co/elizabeth/elizabeth-cardinals/',
    maxprepsName: 'Elizabeth',
    // Cardinal red, the shade the school's own site brands with (MaxPreps's
    // CC0022 is Loveland High's too); the guide's primary is the same.
    colors: { primary: '#8D181B' },
    // The school's athletics page sends schedules to GoBound
    // (gobound.com/co/schools/elizabethhs), which this reader does not read.
    calendarNote: 'Elizabeth’s schedules live on GoBound, which this site does not read yet, so games to come are published on MaxPreps’s word alone.',
    // No girls' swimming page on MaxPreps (HTTP 404, 25 October 2026).
    teams: TEAMS(FALL(), WINTER_WITHOUT('girls-swimming')),
  },
  {
    town: 'johnstown',
    // CHSAANow: Roosevelt High School, Johnstown-Milliken RE-5J; football 4A, 4A Northern (2026–28).
    school: 'Roosevelt High School',
    // "Roughriders", one word, as MaxPreps and the school write it.
    mascot: 'Roughriders',
    maxpreps: 'https://www.maxpreps.com/co/johnstown/roosevelt-roughriders/',
    maxprepsName: 'Roosevelt',
    // Roughrider red, Roosevelt High's own site theme (hsl 350 83% 42%, 22
    // October 2026); MaxPreps's team data carries only a placeholder black.
    // The guide's primary is the same.
    colors: { primary: '#C41230' },
    // Weld RE-5J's Finalsite site; `?cal_date=YYYY-MM-01` shows a month.
    calendar: { kind: 'finalsite', url: 'https://rhs.weldre5j.org/calendar', label: 'the Roosevelt High calendar' },
    teams: TEAMS(),
  },
  {
    town: 'windsor',
    // CHSAANow: Windsor High School, Weld RE-4; football 3A, Cache la Poudre (2026–28).
    school: 'Windsor High School',
    mascot: 'Wizards',
    maxpreps: 'https://www.maxpreps.com/co/windsor/windsor-wizards/',
    maxprepsName: 'Windsor',
    // Wizard maroon, the shade Windsor High's own site brands with (MaxPreps's
    // 8F0018 is Berthoud's too); the guide's primary is the same.
    colors: { primary: '#6A1B32' },
    // Windsor High posts each team's schedule on its own site
    // (whs.weldre4.org, one page per sport), not in a calendar this reader reads.
    calendarNote: 'Windsor High posts its schedules team by team on its own site, in a form this site does not read yet, so games to come are published on MaxPreps’s word alone.',
    teams: TEAMS(),
  },
  {
    town: 'loveland',
    slug: 'loveland-high',
    // CHSAANow: Loveland High School, Thompson R2-J; football 4A, 4A Northern (2026–28).
    school: 'Loveland High School',
    mascot: 'Red Wolves',
    maxpreps: 'https://www.maxpreps.com/co/loveland/loveland-red-wolves/',
    maxprepsName: 'Loveland',
    // Red Wolf red, the shade Loveland High's own site brands with (MaxPreps's
    // CC0022 is Elizabeth's too); the guide's primary is the same.
    colors: { primary: '#BA0C2F' },
    // Loveland High's Finalsite calendar is at lhs.tsd.org/family/calendar,
    // but the site's robots.txt disallows that path to every automated
    // reader (22 October 2026), where Mountain View's allows it.
    calendarNote: 'Loveland High’s calendar asks automated readers to stay out, so games to come are published on MaxPreps’s word alone.',
    teams: TEAMS(),
  },
  {
    town: 'loveland',
    slug: 'thompson-valley',
    // CHSAANow: Thompson Valley High School, Thompson R2-J; football 3A, Cache la Poudre (2026–28).
    school: 'Thompson Valley High School',
    mascot: 'Eagles',
    maxpreps: 'https://www.maxpreps.com/co/loveland/thompson-valley-eagles/',
    maxprepsName: 'Thompson Valley',
    // Eagle black, as MaxPreps's team data gives it (222222, 22 October 2026).
    colors: { primary: '#222222' },
    // As Loveland High: tvhs.tsd.org/robots.txt disallows /family/calendar.
    calendarNote: 'Thompson Valley’s calendar asks automated readers to stay out, so games to come are published on MaxPreps’s word alone.',
    teams: TEAMS(),
  },
  {
    town: 'loveland',
    slug: 'mountain-view',
    // CHSAANow: Mountain View High School, Thompson R2-J; football 3A, Cache la Poudre (2026–28).
    school: 'Mountain View High School',
    mascot: 'Mountain Lions',
    maxpreps: 'https://www.maxpreps.com/co/loveland/mountain-view-mountain-lions/',
    maxprepsName: 'Mountain View',
    // Mountain Lion purple, as MaxPreps's team data gives it (754ACC, 22 October 2026).
    colors: { primary: '#754ACC' },
    calendar: TSD_CALENDAR('mvhs', 'the Mountain View calendar'),
    teams: TEAMS(),
  },
  {
    town: 'loveland',
    slug: 'resurrection-christian',
    // CHSAANow: Resurrection Christian, non-public; football 2A, Patriot (2026–28).
    school: 'Resurrection Christian School',
    mascot: 'Cougars',
    maxpreps: 'https://www.maxpreps.com/co/loveland/resurrection-christian-cougars/',
    maxprepsName: 'Resurrection Christian',
    // Cougar blue, as MaxPreps's team data gives it (034CB2, 22 October 2026).
    colors: { primary: '#034CB2' },
    // The school's Teams & Schedules page sends readers to ArbiterSports
    // (students.arbitersports.com/organizations/resurrection-christian-school),
    // which this reader does not read.
    calendarNote: 'Resurrection Christian’s schedules live on ArbiterSports, which this site does not read yet, so games to come are published on MaxPreps’s word alone.',
    // No boys' soccer: CHSAANow's alignment lists none for the school. Ice
    // hockey: the one school followed that CHSAA lists for it.
    teams: TEAMS(FALL_WITHOUT('boys-soccer'), [...WINTER(), ICE_HOCKEY]),
  },
  {
    town: 'carbon-valley',
    // CHSAANow: Frederick Senior High School, St Vrain Valley RE1J; football 4A, 4A Northern (2026–28).
    school: 'Frederick High School',
    mascot: 'Golden Eagles',
    navLabel: 'Frederick sports',
    note: 'Dacono’s and Firestone’s students attend Frederick High too, so the Golden Eagles are the whole valley’s team.',
    maxpreps: 'https://www.maxpreps.com/co/frederick/frederick-golden-eagles/',
    maxprepsName: 'Frederick',
    // Golden Eagle navy, the shade Frederick High's own site brands with
    // (MaxPreps's 022C66 is Lyons' too); the guide's primary is the same.
    colors: { primary: '#1C2550' },
    // St. Vrain Valley keeps its schools' schedules on ArbiterLive, as it
    // does Niwot's, whose robots.txt disallows every automated reader;
    // Frederick High's own site links no calendar of games.
    calendarNote: 'Frederick’s schedules live on ArbiterLive, which asks automated readers to stay out, so games to come are published on MaxPreps’s word alone.',
    teams: TEAMS(),
  },
  {
    town: 'lyons',
    school: 'Lyons Middle/Senior High School',
    mascot: 'Lions',
    maxpreps: 'https://www.maxpreps.com/co/lyons/lyons-lions/',
    maxprepsName: 'Lyons',
    // Lion navy, as MaxPreps's team data gives it (022C66 on white, 22 October 2026).
    colors: { primary: '#022C66' },
    // The school posts each team's schedule as a Google Sheet
    // (lmshs.svvsd.org/activities-arts-athletics/athletics/high-school-athletics/,
    // 22 October 2026), which the cross-check does not read.
    calendarNote: 'Lyons posts its schedules as spreadsheets on the school site, which the cross-check does not read, so games to come are published on MaxPreps’s word alone.',
    // The fall list at the school site, 22 October 2026: cross country,
    // football, softball, volleyball (and cheer). No boys soccer. No girls'
    // swimming page on MaxPreps (HTTP 404, 25 October 2026).
    teams: TEAMS(FALL_WITHOUT('boys-soccer'), WINTER_WITHOUT('girls-swimming')),
  },
];

/** Every school a town follows, in the config's order. */
export function schoolsFor(town: string): SchoolSports[] {
  return SCHOOL_SPORTS.filter((s) => s.town === town);
}

/**
 * The school a page is about: the one with the slug, or the town's only
 * school. A town that follows several has no single school, so the home
 * page's strip and the guide's one-line sports entry, which name one, show
 * nothing there; /sports/ lists the schools instead.
 */
export function schoolSportsFor(town: string, slug?: string): SchoolSports | undefined {
  const schools = schoolsFor(town);
  if (slug) return schools.find((s) => s.slug === slug);
  return schools.length === 1 ? schools[0] : undefined;
}

/** The school's page: "/sports/", or "/sports/<slug>/" where the town follows several. */
export function sportsPath(school: SchoolSports): string {
  return school.slug ? `/sports/${school.slug}/` : '/sports/';
}

/** Where a school's run writes, relative to the repo root. */
export function sportsDataFile(school: Pick<SchoolSports, 'town' | 'slug'>): string {
  return school.slug ? `data/${school.town}/sports-${school.slug}.json` : `data/${school.town}/sports.json`;
}

/** One game or meet, as the data file holds it. */
export interface SportGame {
  /** The day, Denver wall clock: "2026-10-23". */
  date: string;
  /** Start, Denver wall clock, "19:00", when known and the game is still to come. */
  time?: string;
  opponent: string;
  site: 'home' | 'away' | 'neutral';
  result?: 'W' | 'L' | 'T';
  score?: { us: number; them: number };
  /** A meet's placing, when MaxPreps gives one instead of a score: "3rd". */
  place?: string;
  /**
   * A playoff or tournament game: played at a neutral site whatever side
   * MaxPreps files it on, so the page never says "Home" for it.
   */
  neutral?: boolean;
  /** Where a neutral game is played, when known: MaxPreps's venue, or the sport's playoffVenue. */
  venue?: string;
  /**
   * A postseason or tournament game, as MaxPreps labels it: the tournament's
   * name where it gives one ("State Softball Tournaments", "Class 4A
   * Softball Round of 32", the year and "CHSAA" dropped from the front), else
   * the kind of game its schedule sentence names ("Playoffs", "Tournament").
   * MaxPreps states no round per game (no "semifinal", no "championship"),
   * so none is written; what the page cannot read is left unset.
   */
  stage?: string;
  /** The game's page on MaxPreps. */
  url: string;
}

export interface SportData {
  key: string;
  name: string;
  maxprepsUrl: string;
  /**
   * When this entry was last read successfully, as an ISO instant. A run
   * whose fetch or parse fails keeps the previous entry, this date included,
   * so the page's "updated" line says when the numbers are from.
   */
  fetched?: string;
  /** MaxPreps's own last-updated stamp for the team, as it states it (GMT, no zone). */
  maxprepsUpdated?: string;
  overall?: string;
  league?: { record: string; name: string; place?: string };
  /** This season's results the page reports, newest first. */
  results: SportGame[];
  /** Games to come that the school calendar agrees with, or does not list, soonest first. */
  upcoming: SportGame[];
  /** Games to come the school calendar contradicts: held off the page until a person looks. */
  held: Array<{ game: SportGame; reason: string }>;
  /** Anything a reader of the run summary should know: a game the school calendar does not list, a meet without a score. */
  notes: string[];
  /**
   * MaxPreps has the team but nothing for it: no schedule, no results (the
   * cross country pages, October 2026). The card says so, with the link,
   * rather than a record of 0-0.
   */
  empty?: string;
}

export interface SportsData {
  /** The run that wrote the file, as an ISO instant. */
  generated: string;
  sports: SportData[];
}
