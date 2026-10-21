/**
 * Berthoud High School sports on Inside Berthoud: which teams the /sports/
 * page follows, and the shape of the data file it reads.
 *
 * Berthoud is the test site for this, so it is Berthoud's alone: one list,
 * one data file (data/berthoud/sports.json), one page. The Saturday and
 * Wednesday runs (.github/workflows/sports-maxpreps.yml, `npm run sports`)
 * read each team's MaxPreps home page, check the games to come against the
 * school's own calendar, and write the file; the page reads it at build.
 *
 * To follow another team, add it here: `maxpreps` is the sport segment of
 * the team's MaxPreps URL under https://www.maxpreps.com/co/berthoud/berthoud-spartans/,
 * and `calendar` is how the school calendar (bhs.tsd.org) titles the varsity
 * team's events: "Boys Varsity Football vs …", "Girls Varsity Volleyball @ …".
 * Winter and spring teams wait until their seasons.
 */
export interface SportConfig {
  /** The key in the data file and the card's anchor: "football". */
  key: string;
  /** As the card names it: "Football", "Boys soccer". */
  name: string;
  /** The sport segment of the MaxPreps team URL: "football", "soccer", "girls-cross-country". */
  maxpreps: string;
  /** The school calendar's words for the varsity team, as they open the event title. */
  calendar: { gender: 'Boys' | 'Girls'; sport: string };
}

export const BERTHOUD_SPORTS: SportConfig[] = [
  { key: 'football', name: 'Football', maxpreps: 'football', calendar: { gender: 'Boys', sport: 'Football' } },
  { key: 'boys-soccer', name: 'Boys soccer', maxpreps: 'soccer', calendar: { gender: 'Boys', sport: 'Soccer' } },
  { key: 'volleyball', name: 'Volleyball', maxpreps: 'volleyball', calendar: { gender: 'Girls', sport: 'Volleyball' } },
  { key: 'boys-cross-country', name: 'Boys cross country', maxpreps: 'cross-country', calendar: { gender: 'Boys', sport: 'Cross Country' } },
  { key: 'girls-cross-country', name: 'Girls cross country', maxpreps: 'girls-cross-country', calendar: { gender: 'Girls', sport: 'Cross Country' } },
];

export const MAXPREPS_TEAM_HOME = 'https://www.maxpreps.com/co/berthoud/berthoud-spartans/';
/** The school's calendar; `?cal_date=YYYY-MM-01` shows a month. */
export const BHS_CALENDAR = 'https://bhs.tsd.org/family/calendar';

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
}

export interface SportsData {
  /** The run that wrote the file, as an ISO instant. */
  generated: string;
  sports: SportData[];
}
