/**
 * High-school sports on the town guides: which school each guide follows,
 * where its teams live on MaxPreps, which calendar of the school's own the
 * games to come are checked against, and the shape of the data file.
 *
 * Berthoud was the test site (October 2026); Niwot followed, then six more
 * guides on 22 October 2026 (Timnath, Elizabeth, Johnstown, Windsor,
 * Loveland and Carbon Valley, whose Frederick High entry is Frederick's
 * since 2 November), the same page and the same reader. One entry
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
 * teams are followed where the owner has asked (Lyons's baseball and track,
 * Golden's baseball and lacrosse, Roosevelt's baseball and girls' soccer,
 * 9 November 2026); until MaxPreps opens the school year's spring season
 * the run writes them as having nothing yet, whether the page is still
 * last school year's (scripts/lib/maxpreps.ts,
 * staleSeason) or lists no game of this one (scripts/lib/sports-crosscheck.ts,
 * beforeSpringSeason), so last spring's record never shows as this one's
 * and the team joins the page with its first game.
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
  season: 'fall' | 'winter' | 'spring';
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
  /**
   * CHSAA's state championships for the sport this season, where every
   * class plays at one site on set days: any game of the team's on those
   * days is a state game, played there, whatever MaxPreps files it as. The
   * volleyball state openers of 12 November 2026 came through as "at
   * Eaton" (Berthoud), "vs Mullen" and "vs Battle Mountain" (Golden,
   * Windsor), home and away games, when all three are at the Denver
   * Coliseum (audit of 8 November 2026). The page then names the venue and
   * the stage, and never "Home" or "Away". Dated, so a past season's entry
   * touches nothing; replace it each season from CHSAA's own page.
   */
  state?: StateChampionships;
}

/** CHSAA's state championships for one sport and season (SportConfig.state). */
export interface StateChampionships {
  /** The first and last day, Denver dates, inclusive: "2026-11-12", "2026-11-14". */
  from: string;
  to: string;
  /** Where every class plays: "Denver Coliseum". */
  venue: string;
  /** The stage the page names, where MaxPreps gives none of its own: "State Championships". */
  stage: string;
  /** CHSAA's page that says so. */
  source: string;
}

/**
 * A day the school hosted a postseason round, as CHSAA's bracket says
 * ("Hosted by Berthoud • Sat, Nov 7"): the team's games that day were at
 * home, whichever way MaxPreps filed them. MaxPreps had Berthoud's two
 * volleyball regional matches of 7 November 2026, both in Berthoud's gym,
 * one at home and the other at a neutral site.
 */
export interface HostedRound {
  /** The team's key: "volleyball". */
  team: string;
  /** The Denver day: "2026-11-07". */
  date: string;
  /** The stage the page names for each game that day: "Regionals". */
  stage: string;
  /** CHSAA's bracket page that names the host. */
  source: string;
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
   * serves more than the town the guide is named for: Frederick High takes
   * Dacono's and Firestone's students too.
   */
  note?: string;
  /** "Spartans": how the pages name the teams. */
  mascot: string;
  /**
   * The menu's word for the sports page where "<school> athletics"
   * (schoolAthletics) would not do (src/lib/nav.ts). The menu said
   * "<mascot> sports" until 6 November 2026, and Carbon Valley, four towns
   * whose Golden Eagles were Frederick High's, needed "Frederick sports";
   * the school's name says whose the teams are, and no guide needs it today.
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
  /** The postseason rounds the school hosted (HostedRound). */
  hosted?: HostedRound[];
  teams: SportConfig[];
}

/**
 * League names MaxPreps and CHSAA spell more than one way for the same
 * league, to the spelling the page uses. CHSAANow's standings pages, read
 * 8 November 2026, have "4A/3A Patriots Peak" for volleyball and "4A/3A
 * Patriot Peaks" for softball and both basketballs, the same schools
 * (Berthoud and Resurrection Christian among them); the page said both.
 */
export const LEAGUE_SPELLINGS: Record<string, string> = {
  '4A/3A Patriots Peak': '4A/3A Patriot Peaks',
};

/**
 * The 2026 girls' volleyball state championships: the twelve region winners
 * in each class, 5A to 1A, Thursday to Saturday, 12–14 November, at the
 * Denver Coliseum (CHSAANow, "Girls Volleyball: Qualifiers Set For 2026
 * State Championships", 7 November 2026; each class's state bracket names
 * the Coliseum as its neutral site, read 8 November 2026).
 */
const VOLLEYBALL_STATE_2026: StateChampionships = {
  from: '2026-11-12',
  to: '2026-11-14',
  venue: 'Denver Coliseum',
  stage: 'State Championships',
  source: 'https://chsaanow.com/news/2026/11/07/2026-girls-volleyball-state-qualifiers',
};

const FALL = (): SportConfig[] => [
  { key: 'football', season: 'fall', name: 'Football', maxpreps: 'football', calendar: { gender: 'Boys', sport: 'Football' } },
  { key: 'boys-soccer', season: 'fall', name: 'Boys soccer', maxpreps: 'soccer', calendar: { gender: 'Boys', sport: 'Soccer' } },
  { key: 'volleyball', season: 'fall', name: 'Volleyball', maxpreps: 'volleyball', calendar: { gender: 'Girls', sport: 'Volleyball' }, state: VOLLEYBALL_STATE_2026 },
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

/**
 * Girls' flag football, a CHSAA fall sport, followed where the school plays
 * it and the guide has asked: Berthoud, in 4A (CHSAANow's school page, read
 * 8 November 2026, lists Flag Football, 4A, and links MaxPreps's "girls,
 * flag football" fall team; the Berthoud High calendar has "Girls Varsity
 * Flag Football" games from 28 September to 10 October 2026). The path is
 * MaxPreps's for Colorado's teams (".../flag-football/girls/fall", as
 * Monarch's and Legacy's are); Berthoud's own page has not been read from
 * the runner yet, and one that is not there keeps the team off the page and
 * says so in the run's summary.
 */
const GIRLS_FLAG_FOOTBALL: SportConfig = { key: 'girls-flag-football', season: 'fall', name: 'Girls flag football', maxpreps: 'flag-football/girls/fall', calendar: { gender: 'Girls', sport: 'Flag Football' } };

/**
 * Spring teams, followed where a guide has asked: Lyons, on the owner's word
 * of 9 November 2026 (baseball and track, both on the school's athletics
 * list). The paths are MaxPreps's spring defaults ("baseball",
 * "track-field", "track-field/girls"); MaxPreps refuses the cloud address
 * this was written from, so the first Saturday or Wednesday run from the
 * runner is the check, and a path that is not there keeps the team off the
 * page and says so in the run's summary. Track is meets, not games: the
 * reader finds nothing on the cross-country pages, which are meets too, so
 * track may show nothing until the reader learns to read a meet.
 */
const SPRING_BASEBALL: SportConfig = { key: 'baseball', season: 'spring', name: 'Baseball', maxpreps: 'baseball', calendar: { gender: 'Boys', sport: 'Baseball' } };
/**
 * Girls' soccer, a spring sport in Colorado, followed for Roosevelt on the
 * owner's word of 9 November 2026 (the Johnstown gap report found it on
 * MaxPreps with no page here). MaxPreps files Colorado's girls' soccer under
 * its spring season, so the path carries it, as fall softball's does:
 * Roosevelt's `soccer/girls/spring` page answered with its 2026–27 team
 * page on 9 November 2026. Baseball's plain `baseball` answered the same day.
 */
const SPRING_GIRLS_SOCCER: SportConfig = { key: 'girls-soccer', season: 'spring', name: 'Girls soccer', maxpreps: 'soccer/girls/spring', calendar: { gender: 'Girls', sport: 'Soccer' } };
const SPRING_TRACK: SportConfig[] = [
  { key: 'boys-track', season: 'spring', name: 'Boys track and field', maxpreps: 'track-field', calendar: { gender: 'Boys', sport: 'Track & Field' } },
  { key: 'girls-track', season: 'spring', name: 'Girls track and field', maxpreps: 'track-field/girls', calendar: { gender: 'Girls', sport: 'Track & Field' } },
];

/**
 * Boys' golf and boys' tennis, CHSAA fall sports, followed where the guide
 * has asked: Windsor High, both 4A (CHSAANow's school page, read 9 November
 * 2026, at the owner's word on the Windsor gap report). The paths are
 * MaxPreps's Colorado ones (Severance's page links ".../golf/" and
 * ".../tennis/fall/", 9 November 2026); Windsor's own pages refused this
 * reader that day, and one that is not there keeps the team off the page
 * and says so in the run's summary. Both seasons ended in October, so the
 * first run reads a finished season.
 */
const BOYS_GOLF: SportConfig = { key: 'boys-golf', season: 'fall', name: 'Boys golf', maxpreps: 'golf', calendar: { gender: 'Boys', sport: 'Golf' } };
const BOYS_TENNIS: SportConfig = { key: 'boys-tennis', season: 'fall', name: 'Boys tennis', maxpreps: 'tennis/fall', calendar: { gender: 'Boys', sport: 'Tennis' } };

/**
 * Three more of Niwot High's fall teams, followed at the owner's word of
 * 9 November 2026 (the Niwot gap report's finding that the guide carried 6
 * of the school's 20 sports): girls' gymnastics, the 4A team champion of
 * 2024 and 2025 (CHSAANow), boys' golf and boys' tennis, all CHSAA fall
 * sports. Each path is MaxPreps's own team URL for Niwot, as search
 * engines index it on 9 November 2026: ".../gymnastics/fall/" ("Girls
 * Varsity Gymnastics"), ".../golf/" ("Boys Golf", the 2026–27 fall season)
 * and ".../tennis/fall/" ("Boys Tennis"). MaxPreps refuses the cloud
 * address this was written from, so the run reads each page first from the
 * GitHub runner; one that is not there keeps the team off the page and
 * says so in the run's summary. Cheer is not on MaxPreps, and the spring
 * teams wait for their MaxPreps paths (TODO.md); SportConfig has had a
 * spring season since Lyons's baseball and track (above).
 */
const NIWOT_GYMNASTICS: SportConfig = { key: 'girls-gymnastics', season: 'fall', name: 'Girls gymnastics', maxpreps: 'gymnastics/fall', calendar: { gender: 'Girls', sport: 'Gymnastics' } };
const NIWOT_BOYS_GOLF: SportConfig = { key: 'boys-golf', season: 'fall', name: 'Boys golf', maxpreps: 'golf', calendar: { gender: 'Boys', sport: 'Golf' } };
const NIWOT_BOYS_TENNIS: SportConfig = { key: 'boys-tennis', season: 'fall', name: 'Boys tennis', maxpreps: 'tennis/fall', calendar: { gender: 'Boys', sport: 'Tennis' } };

/**
 * Golden High's other teams, at the owner's word (9 November 2026), after
 * the Golden gap report of 8 November found baseball, boys' tennis and
 * lacrosse on MaxPreps with no page on the guide. In Colorado boys' tennis
 * is a fall sport, and MaxPreps files it under the season ("tennis/fall",
 * as Golden's 2023–24 schedule page is; BOYS_TENNIS above, shared with
 * Windsor High); baseball (SPRING_BASEBALL above, as Lyons's) and both
 * lacrosse teams play in spring. The paths are
 * MaxPreps's own for Golden ("baseball", "lacrosse", "lacrosse/girls"), as
 * search results list them on 9 November 2026; MaxPreps refuses the cloud
 * address this was written from, so the first run from the GitHub runner
 * is the first read, and a path that is not there keeps the team off the
 * page and says so in the run's summary.
 */
const BOYS_LACROSSE: SportConfig = { key: 'boys-lacrosse', season: 'spring', name: 'Boys lacrosse', maxpreps: 'lacrosse', calendar: { gender: 'Boys', sport: 'Lacrosse' } };
const GIRLS_LACROSSE: SportConfig = { key: 'girls-lacrosse', season: 'spring', name: 'Girls lacrosse', maxpreps: 'lacrosse/girls', calendar: { gender: 'Girls', sport: 'Lacrosse' } };

/** The fall list without one team, for a school that does not field it. */
const FALL_WITHOUT = (...keys: string[]): SportConfig[] => FALL().filter((t) => !keys.includes(t.key));
/** The winter list without one team, for a school whose MaxPreps page for it does not exist. */
const WINTER_WITHOUT = (...keys: string[]): SportConfig[] => WINTER().filter((t) => !keys.includes(t.key));
/** Every school's teams: the fall list, or a variant of it, then the winter list, then any spring teams the guide follows. */
const TEAMS = (fall: SportConfig[] = FALL(), winter: SportConfig[] = WINTER(), spring: SportConfig[] = []): SportConfig[] => [...fall, ...winter, ...spring];

/**
 * Frederick High's other fall and winter teams, followed at the owner's word
 * (9 November 2026, on the Frederick gap report of 8 November, which counted
 * about 21 programs to the guide's six on the page). CHSAANow's school page
 * (chsaanow.com/schools/frederick, read 9 November 2026) lists Boys Golf and
 * Boys Tennis as 4A fall sports; MaxPreps's school page, read the same day
 * with WebFetch, links boys' `golf`, `tennis/fall` and girls' `wrestling/girls`
 * (the girls' page the winter list's note says MaxPreps keeps for Frederick).
 * The paths have not been read from the runner yet: one that is not there,
 * or a team MaxPreps carries no games for, stays off the page and is named
 * in the run's summary, as cross country and wrestling are today. No school
 * calendar is read for Frederick (calendarNote), so the calendar words are
 * not matched against anything. Its spring teams (baseball, girls' soccer,
 * golf and tennis, and both track teams) wait for the spring season, as
 * every school's do.
 */
const FREDERICK_FALL_EXTRAS = (): SportConfig[] => [
  { key: 'boys-golf', season: 'fall', name: 'Boys golf', maxpreps: 'golf', calendar: { gender: 'Boys', sport: 'Golf' } },
  { key: 'boys-tennis', season: 'fall', name: 'Boys tennis', maxpreps: 'tennis/fall', calendar: { gender: 'Boys', sport: 'Tennis' } },
];
const FREDERICK_WINTER_EXTRAS = (): SportConfig[] => [
  { key: 'girls-wrestling', season: 'winter', name: 'Girls wrestling', maxpreps: 'wrestling/girls', calendar: { gender: 'Girls', sport: 'Wrestling' } },
];


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
    hosted: [
      // CHSAANow's 3A Region 9 bracket: "Hosted by Berthoud • Sat, Nov 7"; Berthoud beat Prospect Ridge Academy and Delta there and won the region.
      { team: 'volleyball', date: '2026-11-07', stage: 'Regionals', source: 'https://chsaanow.com/brackets/girls-volleyball/2026/regional/3a/region-9' },
    ],
    teams: TEAMS([...FALL(), GIRLS_FLAG_FOOTBALL]),
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
    teams: TEAMS([...FALL(), NIWOT_GYMNASTICS, NIWOT_BOYS_GOLF, NIWOT_BOYS_TENNIS]),
  },
  // Elizabeth High left the sports run when its guide was folded into its
  // page on the hub, 12 November 2026.
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
    hosted: [
      // CHSAANow's game page for the 4A second round, read 9 November 2026: "Montbello at Roosevelt", Roosevelt the home team, Fri, Nov 13, 7 pm. MaxPreps filed it as a neutral site.
      { team: 'football', date: '2026-11-13', stage: 'State Football Playoffs', source: 'https://chsaanow.com/sports/football/games/2026/11/13/montbello-at-roosevelt' },
    ],
    // Baseball and girls' soccer in the spring, on the owner's word (9 November 2026).
    teams: TEAMS(FALL(), WINTER(), [SPRING_BASEBALL, SPRING_GIRLS_SOCCER]),
  },
  {
    town: 'windsor',
    // One of Windsor's two schools since 9 November 2026, when the owner
    // added Severance High on the Windsor gap report: the guide covers both
    // towns. Its page moved from /sports/ to /sports/windsor-high/ and its
    // file from sports.json to sports-windsor-high.json; vercel.json sends
    // the old team pages on.
    slug: 'windsor-high',
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
    // Boys' golf and tennis from 9 November 2026 (the owner). Its flag
    // football and ice hockey are co-ops with Poudre School District, not
    // teams of its own (CHSAANow), and its spring teams (girls' soccer,
    // baseball, lacrosse and the rest) wait for a spring season here.
    teams: TEAMS([...FALL(), BOYS_GOLF, BOYS_TENNIS]),
  },
  {
    // Severance High, the Windsor guide's second school (9 November 2026,
    // the owner, on the Windsor gap report of 8 November). The first
    // Saturday or Wednesday run writes data/windsor/sports-severance-high.json,
    // and the page waits for it.
    town: 'windsor',
    slug: 'severance-high',
    // CHSAANow: Severance High School, Weld RE-4, Northern Conference;
    // football 3A, the rest of its fall and winter teams 4A (read 9 November 2026).
    school: 'Severance High School',
    note: 'The Silver Knights play for Severance, which this guide covers with Windsor.',
    mascot: 'Silver Knights',
    maxpreps: 'https://www.maxpreps.com/co/severance/severance-silver-knights/',
    maxprepsName: 'Severance',
    // Silver Knight navy, the theme colour of Severance High's own site
    // (shs.weldre4.org, read 9 November 2026); MaxPreps's 022C66 is Lyons'
    // and Frederick's too.
    colors: { primary: '#1C3C6D' },
    // Severance High's athletics page links each season's sports pages and
    // ArbiterSports, and keeps no calendar of games this reader reads.
    calendarNote: 'Severance High’s own site has no calendar of games this site can read, so games to come are published on MaxPreps’s word alone.',
    // No girls' swimming: CHSAANow lists none for the school, and MaxPreps
    // has no page for it (9 November 2026).
    teams: TEAMS(FALL(), WINTER_WITHOUT('girls-swimming')),
  },
  {
    // The Carbon Valley guide's entry from 22 October 2026, Inside
    // Frederick's from 2 to 12 November, and the Carbon Valley guide's again
    // since (the restructure brief: Frederick is covered by Carbon Valley);
    // the data file moved with it each time (data/carbon-valley/sports.json).
    town: 'carbon-valley',
    // CHSAANow: Frederick Senior High School, St Vrain Valley RE1J; football
    // 4A (2026–28). Its profile named the league 4A Northern on 22 October
    // 2026 and Granite Peaks on 2 November; MaxPreps's data file still
    // carries "4A Northern" as the football league's name, and the page
    // shows what the file says.
    school: 'Frederick High School',
    mascot: 'Golden Eagles',
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
    teams: TEAMS([...FALL(), ...FREDERICK_FALL_EXTRAS()], [...WINTER(), ...FREDERICK_WINTER_EXTRAS()]),
  },
  {
    town: 'erie',
    // CHSAANow: Erie High School, St Vrain Valley RE1J; football 5A, 5A Front Range (2026–28, read 25 October 2026).
    school: 'Erie High School',
    mascot: 'Tigers',
    maxpreps: 'https://www.maxpreps.com/co/erie/erie-tigers/',
    maxprepsName: 'Erie',
    // Tiger orange, from Erie High's own stylesheet (ehs.svvsd.org, theme
    // `--color-primary: #f26b21`, read from the runner 25 October 2026): the
    // brand shade is 2.85:1 on the paper and cannot carry text, so this is
    // the site's own darkest step of it (`--color-primary-700: #983c0e`),
    // 6.6:1 on the paper. MaxPreps's D5350B is 4.5:1 and was not used. The
    // guide's primary is the same (src/config/towns/erie.ts).
    colors: { primary: '#983C0E' },
    // St. Vrain Valley keeps Erie's schedules on ArbiterLive
    // (arbiterlive.com/Teams?entityId=7041, linked from the school's
    // athletics page), whose robots.txt disallows every automated reader,
    // as Niwot's and Frederick's.
    calendarNote: 'Erie’s schedules live on ArbiterLive, which asks automated readers to stay out, so games to come are published on MaxPreps’s word alone.',
    // Every fall and winter path exists on MaxPreps (the runner, 25 October
    // 2026): football 0-9, boys soccer 12-1-2, volleyball 10-11, softball
    // 22-6, both cross country pages with no schedule; basketball's two
    // with schedules, wrestling and girls' swimming without yet.
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
    // swimming page on MaxPreps (HTTP 404, 25 October 2026). Baseball and
    // track in the spring, on the owner's word (9 November 2026).
    teams: TEAMS(FALL_WITHOUT('boys-soccer'), WINTER_WITHOUT('girls-swimming'), [SPRING_BASEBALL, ...SPRING_TRACK]),
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

/**
 * The school as its teams are called: "Berthoud Spartans", "Lyons Lions",
 * "Timnath Cubs". MaxPreps's short name and the mascot, the way people say
 * it and search for it; cutting "High School" off the full name gave
 * "Lyons Middle/Senior Lions" and "Timnath Middle-High Cubs" (25 October 2026).
 */
export function schoolTeamName(school: Pick<SchoolSports, 'maxprepsName' | 'mascot'>): string {
  return `${school.maxprepsName} ${school.mascot}`;
}

/**
 * The school's sports as the guide labels them: "Niwot athletics",
 * "Roosevelt athletics". The menu, the home page's strip and scoreboard
 * band, the share image and the breadcrumb said "<mascot> sports" until 6
 * November 2026 ("Demons sports", "Wizards sports"), which told a newcomer
 * nothing, and two schools followed are Cougars. The school's short name,
 * not the town's (Johnstown's school is Roosevelt), and "athletics" rather
 * than "sports" so it reads as the school's teams and not the rec leagues
 * on the Families page. The mascot stays in the page titles and search
 * text, the words people search for (teamPageTitle), and in the page's own
 * sentences ("The Cougars are 5-3").
 */
export function schoolAthletics(school: Pick<SchoolSports, 'maxprepsName'>): string {
  return `${school.maxprepsName} athletics`;
}

/** The school's page: "/sports/", or "/sports/<slug>/" where the town follows several. */
export function sportsPath(school: SchoolSports): string {
  return school.slug ? `/sports/${school.slug}/` : '/sports/';
}

/**
 * A team's own page: "/sports/football/", or "/sports/<slug>/football/"
 * where the town follows several schools. Built only for a team with data
 * (src/integrations/town-routes.ts), and linked only where it is built.
 */
export function teamPath(school: Pick<SchoolSports, 'slug'>, key: string): string {
  return `${sportsPath(school as SchoolSports)}${key}/`;
}

/**
 * The share card's name under /sports/share/: "school" and "football" for
 * a town's only school; "mountain-view" and "mountain-view-football" for
 * one of several (src/routes/town/sports-share.png.ts).
 */
export function shareImageName(school: Pick<SchoolSports, 'slug'>, teamKey?: string): string {
  if (school.slug) return teamKey ? `${school.slug}-${teamKey}` : school.slug;
  return teamKey ?? 'school';
}

/** The share card's path: "/sports/share/football.png". */
export function shareImagePath(school: Pick<SchoolSports, 'slug'>, teamKey?: string): string {
  return `/sports/share/${shareImageName(school, teamKey)}.png`;
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
  /**
   * Won or lost by forfeit, as MaxPreps's schedule says ("won by forfeit in
   * their away non-conference game", Resurrection Christian softball, 6
   * October 2026): a result with no score, so none is shown.
   */
  forfeit?: boolean;
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
  /** The game's page on MaxPreps, or CHSAA's bracket for a game MaxPreps does not carry yet (`chsaa`). */
  url: string;
  /**
   * A postseason game whose site, time or stage, or the whole game, comes
   * from CHSAA's bracket (src/config/postseason.ts), merged in when the
   * pages read the file, never written to it: the bracket and the day it
   * was read.
   */
  chsaa?: { url: string; read: string };
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
