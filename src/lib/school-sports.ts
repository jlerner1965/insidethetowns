/**
 * Reading a town's data/<town>/sports.json for the pages: the week's big
 * game, the games to come, and the words for a game. Shared by /sports/
 * and the home page so both lead with the same game.
 */
import { sportsDataFile, type SchoolSports, type SportConfig, type SportData, type SportGame, type SportsData } from '../config/school-sports.ts';
import { primaryHover } from '../config/palette.ts';
import { dayKey, formatDayLong, formatTime, fromWallClock, TIME_ZONE } from './dates.ts';

/**
 * The school's colour as the page's primary, for a `style` on the element
 * that wraps the sports page or the home page's game strip. Base.astro sets
 * the town's on <html>; a custom property is computed where it is declared,
 * so the line colour derived from it in global.css is set here again, or it
 * would stay the town's. Nothing where the school has no colour.
 */
export function schoolCssVars(school: SchoolSports | undefined): string | undefined {
  const primary = school?.colors?.primary;
  if (!primary) return undefined;
  const hover = primaryHover(primary);
  const line = `color-mix(in srgb, ${primary} 25%, #ffffff)`;
  // Both names: Tailwind's utilities read the town's (`bg-primary` is
  // `var(--town-primary)`), the stylesheet's own rules (.btn-primary,
  // .eyebrow) read the theme's, which the root resolved to the town's.
  return [
    `--town-primary:${primary}`,
    `--town-primary-hover:${hover}`,
    `--t-primary-line:${line}`,
    `--color-primary:${primary}`,
    `--color-primary-hover:${hover}`,
    `--color-primary-line:${line}`,
  ].join(';');
}

export interface TeamGame {
  team: SportData;
  game: SportGame;
}

/** The game's instant, from its Denver date and time. */
export function gameDay(g: SportGame): Date {
  const [y, m, d] = g.date.split('-').map(Number) as [number, number, number];
  const [hh, mm] = (g.time ?? '00:00').split(':').map(Number) as [number, number];
  return fromWallClock(y, m, d, hh, mm);
}

/** "at" for an away game, "vs" otherwise. */
export function where(g: SportGame): string {
  return g.site === 'away' ? 'at' : 'vs';
}

/** "22-0 vs Greeley Central", "3rd at the Niwot Invitational", "at Sterling". */
export function outcome(g: SportGame): string {
  if (g.result && g.score) return `${g.score.us}-${g.score.them} ${where(g)} ${g.opponent}`;
  if (g.place) return `${g.place} ${where(g)} ${g.opponent}`;
  return `${where(g)} ${g.opponent}`;
}

export function sitePhrase(g: SportGame): string {
  return g.site === 'home' ? 'Home' : g.site === 'away' ? 'Away' : 'Neutral site';
}

/** Where the game is: the venue where one is known (a playoff site), else "Home", "Away" or "Neutral site". */
export function placeText(g: SportGame): string {
  return g.venue ?? sitePhrase(g);
}

/**
 * A team the pages lay out: read at least once, and not one MaxPreps has
 * nothing for. The same filter decides which teams get a page of their own.
 */
export function hasData(team: SportData): boolean {
  return !!team.fetched && !team.empty;
}

/**
 * The team's place in its league, where it means something: MaxPreps ranks
 * every team that has not played a league game "1st" (Erie basketball,
 * 0-0, "1st in the 6A Front Range", 25 October 2026), so with no league
 * game played there is no place to show.
 */
export function leaguePlace(team: Pick<SportData, 'league'>): string | undefined {
  const league = team.league;
  if (!league?.place) return undefined;
  return /^0-0(?:-0)?$/.test(league.record.trim()) ? undefined : league.place;
}

/** The teams with data, in the config's order. */
export function teamsWithData(data: SportsData | undefined): SportData[] {
  return (data?.sports ?? []).filter(hasData);
}

/** Each team's next game, in the config's order: the home page's sports block. */
export function nextGames(data: SportsData, now = new Date()): TeamGame[] {
  const today = dayKey(now);
  return data.sports.flatMap((team) => {
    const game = team.upcoming.find((g) => g.date >= today);
    return game ? [{ team, game }] : [];
  });
}

/** "7 pm", from the game's Denver time. */
export function formatGameTime(g: SportGame): string {
  return formatTime(gameDay(g));
}

export const RESULT_WORD = { W: 'Won', L: 'Lost', T: 'Tied' } as const;

/** "Today", "Tomorrow", or the day in full. */
export function when(g: SportGame, now = new Date()): string {
  if (g.date === dayKey(now)) return 'Today';
  if (g.date === dayKey(new Date(now.getTime() + 86_400_000))) return 'Tomorrow';
  return formatDayLong(gameDay(g));
}

/**
 * Every game to come, across the teams, soonest first: by day, then by
 * start, a game without a time after the timed ones that day; two at one
 * moment stay in the config's order.
 */
export function coming(data: SportsData): TeamGame[] {
  return data.sports
    .flatMap((team) => team.upcoming.map((game) => ({ team, game })))
    .sort((a, b) => a.game.date.localeCompare(b.game.date) || (a.game.time ?? '99:99').localeCompare(b.game.time ?? '99:99'));
}

/**
 * The next game, whichever team plays it: the sports page's "Next up".
 * It was the first team in the config's order with a game in the week, so
 * Friday's football led while soccer and volleyball both played on
 * Thursday (navigation audit, 22 October 2026); a parent looking for
 * tomorrow's game wants tomorrow's game. Undefined with nothing to come.
 */
export function bigGame(data: SportsData, now = new Date()): TeamGame | undefined {
  const today = dayKey(now);
  return coming(data).find((c) => c.game.date >= today);
}

/**
 * A team's results with a repeated game shown once: MaxPreps listed three
 * of the 17 October softball tournament games twice, the same day, the
 * same opponent and the same score under two contest ids (Carbon Valley,
 * Thompson Valley, Resurrection Christian, 22 October 2026). A
 * doubleheader is two games with two scores and stays two.
 */
export function dedupeResults(results: SportGame[]): SportGame[] {
  const seen = new Set<string>();
  return results.filter((g) => {
    if (!g.score && !g.place) return true;
    const key = `${g.date}|${g.opponent.toLowerCase()}|${g.result ?? ''}|${g.score ? `${g.score.us}-${g.score.them}` : g.place}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/**
 * The week's games, every team, soonest first: the sports page's list and
 * the raw material of the home page's strip. Teams are in the config's order
 * of what the town turns out for, so with two games on one day football's
 * leads; a team out of season has no games to come and never appears.
 */
export function weekGames(data: SportsData, now = new Date(), days = 7): TeamGame[] {
  const today = dayKey(now);
  const until = dayKey(new Date(now.getTime() + days * 86_400_000));
  const order = new Map(data.sports.map((t, i) => [t.key, i]));
  return coming(data)
    .filter((c) => c.game.date >= today && c.game.date <= until)
    .sort((a, b) => a.game.date.localeCompare(b.game.date) || (order.get(a.team.key) ?? 0) - (order.get(b.team.key) ?? 0));
}

/** The team the town turns out for: its game is never cut from a short list of the week. */
export const FLAGSHIP_TEAM = 'football';

/**
 * The week's games as the home page's strip, This week and the Thursday
 * email list them, cut to `limit`: the week's football game first, when
 * there is one, then the rest soonest first. The strip sliced the
 * chronological list to three, so three volleyball matches early in the
 * week pushed Friday's football off it (Berthoud and Lyons, the week of 26
 * October 2026). A second football game in the week (a Saturday playoff
 * after a Friday) takes a slot only by date, as any other game does. With
 * no limit the whole week comes back, football still first.
 */
export function stripGames(data: SportsData, now = new Date(), limit = Infinity, days = 7): TeamGame[] {
  const week = weekGames(data, now, days);
  const football = week.find((c) => c.team.key === FLAGSHIP_TEAM);
  if (!football) return week.slice(0, limit);
  return [football, ...week.filter((c) => c !== football)].slice(0, limit);
}

/**
 * A team's most recent result inside the last `days` days, or nothing: the
 * Thursday email's "last Friday's football".
 */
export function lastResultOf(data: SportsData, key: string, now = new Date(), days = 7): TeamGame | undefined {
  const team = data.sports.find((t) => t.key === key);
  const game = team?.results.find((g) => g.result || g.place);
  if (!team || !game) return undefined;
  const since = dayKey(new Date(now.getTime() - days * 86_400_000));
  return game.date >= since && game.date <= dayKey(now) ? { team, game } : undefined;
}

export interface WeekAhead {
  /** The week's games, football first, then soonest first, cut to the limit (stripGames). */
  games: TeamGame[];
  /** The most recent result of any team, whenever it was. */
  last?: TeamGame;
  /** Football's most recent result when it was in the past week. */
  football?: TeamGame;
}

/**
 * This week's games and the last result, the one reading the home page's
 * strip, "This week in [Town]" and the Thursday email share, so the three
 * agree on which games are the week's and which result is the last.
 */
export function weekAhead(data: SportsData, now = new Date(), limit = Infinity, days = 7): WeekAhead {
  return {
    games: stripGames(data, now, limit, days),
    last: latestResult(data),
    football: lastResultOf(data, FLAGSHIP_TEAM, now, days),
  };
}

/**
 * One game as a plain line, for the email and the research drafts:
 * "Football at Severance · Friday, October 30 · 7 pm · Away", the stage
 * where MaxPreps gives one, the venue for a neutral game that has one.
 */
export function gameText({ team, game }: TeamGame, now = new Date()): string {
  const place = game.venue ?? (game.site === 'home' ? 'Home' : game.site === 'away' ? 'Away' : undefined);
  return [`${team.name} ${where(game)} ${game.opponent}`, when(game, now), game.time ? formatGameTime(game) : undefined, game.stage, place].filter(Boolean).join(' · ');
}

/** "Football won 22-0 vs Greeley Central, 7-2 this season" / "Volleyball lost 1-3 at Windsor". */
export function resultText({ team, game }: TeamGame): string {
  const word = game.result ? RESULT_WORD[game.result].toLowerCase() : 'placed';
  return `${team.name} ${word} ${outcome(game)}${team.overall ? `, ${team.overall} this season` : ''}`;
}

/**
 * The school's data file, from the build's bundle of every town's (the
 * pages glob the data folder for every sports JSON file). Vite reads the
 * glob at build time, so a school without a file simply has no entry.
 */
export function sportsDataFor(school: Pick<SchoolSports, 'town' | 'slug'>, files: Record<string, SportsData>): SportsData | undefined {
  const file = `/${sportsDataFile(school)}`;
  return files[Object.keys(files).find((k) => k.endsWith(file)) ?? ''];
}

/** Every result across the teams, newest first: the scoreboard. */
export function recentResults(data: SportsData, limit = 6): TeamGame[] {
  return data.sports
    .flatMap((team) => dedupeResults(team.results).map((game) => ({ team, game })))
    .sort((a, b) => b.game.date.localeCompare(a.game.date))
    .slice(0, limit);
}

/** A team's season in order, oldest first: the results, then the games to come. */
export function season(team: SportData): SportGame[] {
  return [...dedupeResults(team.results)].reverse().concat(team.upcoming);
}

/**
 * Every team's season is played out: no game to come from today on, and at
 * least one result. The sports page's band then says "Regular season
 * complete" rather than "nothing scheduled yet": a team with nine results
 * and no tenth game listed has finished its regular season (Elizabeth
 * football, 9-0, 25 October 2026); a playoff round not yet on MaxPreps is
 * the same from here. Nothing is said about a team with no results at all.
 */
export function seasonComplete(data: SportsData, now = new Date()): boolean {
  const today = dayKey(now);
  const played = data.sports.filter((t) => t.results.length > 0);
  return played.length > 0 && !data.sports.some((t) => t.upcoming.some((g) => g.date >= today));
}

/**
 * The season the page is in, from the data: the season (SportConfig.season)
 * of the team with the next game to come, else of the team with the latest
 * result, and that game's year. "Fall 2026" while football has a game left;
 * "Winter 2026–27" once the next game listed is basketball's. Nothing to go
 * on (no games at all): the fall of the build's year, which is what the
 * eyebrow said before the winter list existed.
 */
export function seasonOf(data: SportsData, teams: Array<Pick<SportConfig, 'key' | 'season'>>, now = new Date()): { season: 'Fall' | 'Winter'; year: number; years: string; label: string } {
  const seasonOfTeam = (key: string) => teams.find((t) => t.key === key)?.season ?? 'fall';
  const game = bigGame(data, now) ?? latestResult(data);
  const season = game && seasonOfTeam(game.team.key) === 'winter' ? 'Winter' : 'Fall';
  const [y, m] = (game ? game.game.date : dayKey(now)).split('-').map(Number) as [number, number];
  // A winter season runs across the new year and is named for the school
  // year it belongs to: a January game is "Winter 2026–27", not 2027's.
  const year = season === 'Winter' && m < 8 ? y - 1 : y;
  const years = season === 'Winter' ? `${year}–${String(year + 1).slice(-2)}` : String(year);
  return { season, year, years, label: `${season} ${years}` };
}

/** "Boys soccer" as a title writes it: "Boys Soccer". */
export function titleCase(name: string): string {
  return name.replace(/\b[a-z]/g, (c) => c.toUpperCase());
}

/** "Berthoud High", "Resurrection Christian", "Lyons Middle/Senior High": the school without the word "School". */
export function schoolShortName(school: string): string {
  return school.replace(/ School$/, '');
}

/**
 * The sports a school page's title lists, from the teams with data, in
 * the data's order: "Football, Soccer, Volleyball, Softball". A boys' or
 * girls' team drops the gender where it is the only team of its sport
 * ("Boys soccer" is "Soccer"); where both have data both are named ("Boys
 * Basketball, Girls Basketball").
 */
export function sportList(teams: Array<Pick<SportData, 'name'>>): string[] {
  const bare = (name: string) => name.replace(/^(Boys|Girls) /, '');
  const counts = new Map<string, number>();
  for (const t of teams) counts.set(bare(t.name), (counts.get(bare(t.name)) ?? 0) + 1);
  return teams.map((t) => titleCase((counts.get(bare(t.name)) ?? 0) > 1 ? t.name : bare(t.name)));
}

/** "Berthoud High School Spartans Scores & Schedules — Football, Soccer, Volleyball, Softball". */
export function schoolPageTitle(school: Pick<SchoolSports, 'school' | 'mascot'>, teams: Array<Pick<SportData, 'name'>>): string {
  const sports = sportList(teams);
  return `${school.school} ${school.mascot} Scores & Schedules${sports.length ? ` — ${sports.join(', ')}` : ''}`;
}

/** "Berthoud Spartans Football Schedule, Scores & Record 2026". */
export function teamPageTitle(school: Pick<SchoolSports, 'school' | 'mascot'>, team: Pick<SportData, 'name'>, years: string): string {
  return `${school.school.replace(/ (High )?School$/, '')} ${school.mascot} ${titleCase(team.name)} Schedule, Scores & Record ${years}`;
}

/** "Friday Oct 30, 7 pm" / "Saturday Oct 31": the next game's moment, short, for a description. */
export function shortWhen(g: SportGame): string {
  const d = gameDay(g);
  const day = new Intl.DateTimeFormat('en-US', { timeZone: TIME_ZONE, weekday: 'long' }).format(d);
  const date = new Intl.DateTimeFormat('en-US', { timeZone: TIME_ZONE, month: 'short', day: 'numeric' }).format(d);
  return `${day} ${date}${g.time ? `, ${formatTime(d)}` : ''}`;
}

/**
 * The team page's meta description, built from the data: "Berthoud High
 * football is 7-2 this fall. Next: at Severance, Friday Oct 30, 7 pm.
 * Every score and the full schedule, from MaxPreps." With nothing to come
 * and games played, "Regular season complete." stands where the next game
 * would; a stage MaxPreps gives follows the game.
 */
export function teamDescription(school: Pick<SchoolSports, 'school'>, team: SportData, seasonWord: string, now = new Date()): string {
  const today = dayKey(now);
  const next = team.upcoming.find((g) => g.date >= today);
  const name = team.name.toLowerCase();
  const record = team.overall ? `${schoolShortName(school.school)} ${name} is ${team.overall} this ${seasonWord}.` : `${schoolShortName(school.school)} ${name} this ${seasonWord}.`;
  const then = next
    ? `Next: ${where(next)} ${next.opponent}, ${shortWhen(next)}${next.stage ? `, ${next.stage}` : ''}.`
    : team.results.length
      ? 'Regular season complete.'
      : '';
  return [record, then, 'Every score and the full schedule, from MaxPreps.'].filter(Boolean).join(' ');
}

/** The most recent result across the teams. */
export function latestResult(data: SportsData): TeamGame | undefined {
  return data.sports
    .flatMap((team) => team.results.slice(0, 1).map((game) => ({ team, game })))
    .sort((a, b) => b.game.date.localeCompare(a.game.date))[0];
}
