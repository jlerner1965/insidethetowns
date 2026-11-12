/**
 * Postseason games from CHSAA's own brackets, for the weeks MaxPreps is
 * behind them. The pages read each school's MaxPreps file and then this
 * list (src/lib/school-sports.ts, `withPostseason`): a game here that
 * MaxPreps also carries takes CHSAA's site, time and stage; a game MaxPreps
 * does not carry yet is added to the team's games to come. A game here whose
 * day has passed is ignored, so the list empties itself; delete the season's
 * rows once its finals are played.
 *
 * Why it exists (network audit, 8 November 2026): the state volleyball
 * championships are three days at the Denver Coliseum, but MaxPreps filed
 * Berthoud's first match as "at Eaton" and Golden's and Windsor's as "Home",
 * and had no state match at all for Niwot, Timnath, Lyons or Resurrection
 * Christian, so four state qualifiers showed nothing next. Football's
 * second round had the same gap where a team had a first-round bye: Timnath
 * read "Season over" with a playoff game to come, and Loveland High
 * showed no game.
 *
 * Every row is CHSAA's, read on the day given, from the bracket linked.
 * Nothing is inferred: no home team where CHSAA names none, no time where
 * it gives none. Volleyball's later start times are CHSAA's own estimates
 * ("all remaining match times are approximate"); only the 8 am starts are
 * firm. A neutral game with no venue shows as a neutral site, as every
 * playoff game from MaxPreps does.
 */
export interface PostseasonGame {
  /** The town's slug. */
  town: string;
  /** The school's slug, where the town follows several (src/config/school-sports.ts). */
  slug?: string;
  /** The team's key: "volleyball", "football". */
  team: string;
  /** Denver day, "2026-11-12". */
  date: string;
  /** Denver wall clock, "08:00", only where CHSAA gives one. */
  time?: string;
  /**
   * As CHSAA names the opponent. Where the opponent is the winner of an
   * earlier match, both names joined by " or ": a MaxPreps game against
   * either is the same game.
   */
  opponent: string;
  /** Where every game of the round is played, when CHSAA names it. */
  venue?: string;
  /** The tournament, as the pages label a postseason game. */
  stage: string;
  /** The CHSAA bracket the row was read from. */
  source: string;
  /** The day it was read. */
  read: string;
}

const VOLLEYBALL_STAGE = 'State Championships';
const FOOTBALL_STAGE = 'State Football Playoffs';
const COLISEUM = 'Denver Coliseum';
const VB = (cls: string) => `https://chsaanow.com/brackets/girls-volleyball/2026/state/${cls}`;
const FB = (cls: string) => `https://chsaanow.com/brackets/football/2026/state/${cls}`;

export const POSTSEASON: PostseasonGame[] = [
  // Girls volleyball state championships, Thursday to Saturday, 12 to 14
  // November 2026, every class at the Denver Coliseum (CHSAA's state
  // qualifiers, 7 November; the brackets, read 8 November). Each school's
  // first match; the rest of the bracket depends on the results.
  { town: 'berthoud', team: 'volleyball', date: '2026-11-12', time: '08:00', opponent: 'Eaton', venue: COLISEUM, stage: VOLLEYBALL_STAGE, source: VB('3a'), read: '2026-11-08' },
  { town: 'niwot', team: 'volleyball', date: '2026-11-12', time: '11:00', opponent: 'Mead', venue: COLISEUM, stage: VOLLEYBALL_STAGE, source: VB('4a'), read: '2026-11-08' },
  { town: 'windsor', slug: 'windsor-high', team: 'volleyball', date: '2026-11-12', time: '12:30', opponent: 'Battle Mountain', venue: COLISEUM, stage: VOLLEYBALL_STAGE, source: VB('4a'), read: '2026-11-08' },
  { town: 'lyons', team: 'volleyball', date: '2026-11-12', time: '11:00', opponent: 'Holyoke', venue: COLISEUM, stage: VOLLEYBALL_STAGE, source: VB('2a'), read: '2026-11-08' },

  // Football's second round. The rows for Timnath, Loveland and Fort
  // Collins High left with their guides on 12 November 2026 (folded
  // into their town pages on the hub).
  // Severance (3A, No. 11) beat No. 22 Lewis-Palmer 47-14 on 6 November and
  // plays No. 6 Pueblo East on 13 November at 7 pm at Dutch Clark (CHSAA's
  // 3A bracket, game 24, read 9 November). Windsor's Severance High file
  // does not exist until the first run after the school was added, so the
  // row waits for it.
  { town: 'windsor', slug: 'severance-high', team: 'football', date: '2026-11-13', time: '19:00', opponent: 'Pueblo East', venue: 'Dutch Clark', stage: FOOTBALL_STAGE, source: FB('3a'), read: '2026-11-09' },
];
