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
  teams: SportConfig[];
}

const FALL = (): SportConfig[] => [
  { key: 'football', name: 'Football', maxpreps: 'football', calendar: { gender: 'Boys', sport: 'Football' } },
  { key: 'boys-soccer', name: 'Boys soccer', maxpreps: 'soccer', calendar: { gender: 'Boys', sport: 'Soccer' } },
  { key: 'volleyball', name: 'Volleyball', maxpreps: 'volleyball', calendar: { gender: 'Girls', sport: 'Volleyball' } },
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
    // St. Vrain Valley keeps Niwot's schedules on ArbiterLive
    // (arbiterlive.com/School/Calendar/16031), whose robots.txt disallows
    // every automated reader, so there is nothing to check against.
    calendarNote: 'Niwot’s schedules live on ArbiterLive, which asks automated readers to stay out, so games to come are published on MaxPreps’s word alone.',
    teams: FALL(),
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
