/**
 * Reading a town's data/<town>/sports.json for the pages: the week's big
 * game, the games to come, and the words for a game. Shared by /sports/
 * and the home page so both lead with the same game.
 */
import { sportsDataFile, type SchoolSports, type SportData, type SportGame, type SportsData } from '../config/school-sports.ts';
import { primaryHover } from '../config/palette.ts';
import { dayKey, formatDayLong, formatTime, fromWallClock } from './dates.ts';

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

/** The most recent result across the teams. */
export function latestResult(data: SportsData): TeamGame | undefined {
  return data.sports
    .flatMap((team) => team.results.slice(0, 1).map((game) => ({ team, game })))
    .sort((a, b) => b.game.date.localeCompare(a.game.date))[0];
}
