/**
 * High-school sports on the town guides: which school each guide follows,
 * where its teams live on MaxPreps, which calendar of the school's own the
 * games to come are checked against, and the shape of the data file.
 *
 * Berthoud was the test site (October 2026); Niwot followed. One entry per
 * town, one data file (data/<town>/sports.json), one page (/sports/) and
 * one strip on the home page, all keyed by the town's slug. The Saturday
 * and Wednesday runs (.github/workflows/sports-maxpreps.yml, `npm run
 * sports`) read each team's MaxPreps home page, check the games to come
 * against the school calendar where there is one it may read, and write
 * the file; the pages read it at build. A town without an entry here has
 * no sports page.
 *
 * To follow another team, add it to the town's list: `maxpreps` is the
 * team's path under the school's MaxPreps URL ("football", "soccer"; a
 * girls' team where the boys' is the default is "cross-country/girls", and
 * the other way round "volleyball/boys"), and `calendar` is how the school
 * calendar titles the varsity team's events ("Boys Varsity Football vs …").
 * Winter and spring teams wait until their seasons.
 */
export interface SportConfig {
  /** The key in the data file and the card's anchor: "football". */
  key: string;
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
  /** "Berthoud High School". */
  school: string;
  /** "Spartans": how the pages name the teams. */
  mascot: string;
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
  { key: 'football', name: 'Football', maxpreps: 'football', calendar: { gender: 'Boys', sport: 'Football' } },
  { key: 'boys-soccer', name: 'Boys soccer', maxpreps: 'soccer', calendar: { gender: 'Boys', sport: 'Soccer' } },
  { key: 'volleyball', name: 'Volleyball', maxpreps: 'volleyball', calendar: { gender: 'Girls', sport: 'Volleyball' } },
  // Softball is a fall sport in Colorado, which MaxPreps files under the
  // spring sport's name with the season after it (CHSAA's school pages list
  // it for both schools, 21 October 2026).
  { key: 'softball', name: 'Softball', maxpreps: 'softball/fall', calendar: { gender: 'Girls', sport: 'Softball' }, playoffVenue: 'Aurora Sports Park' },
  { key: 'boys-cross-country', name: 'Boys cross country', maxpreps: 'cross-country', calendar: { gender: 'Boys', sport: 'Cross Country' } },
  { key: 'girls-cross-country', name: 'Girls cross country', maxpreps: 'cross-country/girls', calendar: { gender: 'Girls', sport: 'Cross Country' } },
];

export const SCHOOL_SPORTS: SchoolSports[] = [
  {
    town: 'berthoud',
    school: 'Berthoud High School',
    mascot: 'Spartans',
    maxpreps: 'https://www.maxpreps.com/co/berthoud/berthoud-spartans/',
    maxprepsName: 'Berthoud',
    // Spartan maroon, as MaxPreps's team data gives it (8F0018 on white, 21 October 2026).
    colors: { primary: '#8F0018' },
    // Thompson School District's Finalsite site; `?cal_date=YYYY-MM-01` shows a month.
    calendar: { kind: 'finalsite', url: 'https://bhs.tsd.org/family/calendar', label: 'the Berthoud High calendar' },
    teams: FALL(),
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
    teams: FALL(),
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
    // football, softball, volleyball (and cheer). No boys soccer.
    teams: FALL().filter((t) => t.key !== 'boys-soccer'),
  },
];

export function schoolSportsFor(town: string): SchoolSports | undefined {
  return SCHOOL_SPORTS.find((s) => s.town === town);
}

/** Where a town's run writes, relative to the repo root. */
export function sportsDataFile(town: string): string {
  return `data/${town}/sports.json`;
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
