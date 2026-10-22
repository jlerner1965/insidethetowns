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

/** Every game to come, across the teams, soonest first. */
export function coming(data: SportsData): TeamGame[] {
  return data.sports
    .flatMap((team) => team.upcoming.map((game) => ({ team, game })))
    .sort((a, b) => a.game.date.localeCompare(b.game.date) || (a.game.time ?? '').localeCompare(b.game.time ?? ''));
}

/**
 * The big game of the week, not merely the soonest. The teams are listed
 * in order of what the town turns out for (football first,
 * src/config/school-sports.ts), so the first team with a game in the
 * next seven days leads, and a Tuesday soccer match does not push Friday
 * night off the top. With nothing in the week, the soonest game of any
 * team; with nothing to come at all, undefined.
 */
export function bigGame(data: SportsData, now = new Date()): TeamGame | undefined {
  const weekAhead = dayKey(new Date(now.getTime() + 7 * 86_400_000));
  const today = dayKey(now);
  for (const team of data.sports) {
    const game = team.upcoming.find((g) => g.date >= today && g.date <= weekAhead);
    if (game) return { team, game };
  }
  return coming(data).find((c) => c.game.date >= today);
}

/**
 * The week's games, every team, soonest first: what the home page's compact
 * sports module lists. Teams are in the config's order of what the town
 * turns out for, so with two games on one day football's leads; a team out
 * of season has no games to come and never appears. Nothing is featured for
 * being football: a Tuesday soccer match in the week is here, and in
 * November, when the fall teams are done, the module shows whatever is next
 * or nothing at all.
 */
export function weekGames(data: SportsData, now = new Date(), days = 7): TeamGame[] {
  const today = dayKey(now);
  const until = dayKey(new Date(now.getTime() + days * 86_400_000));
  const order = new Map(data.sports.map((t, i) => [t.key, i]));
  return coming(data)
    .filter((c) => c.game.date >= today && c.game.date <= until)
    .sort((a, b) => a.game.date.localeCompare(b.game.date) || (order.get(a.team.key) ?? 0) - (order.get(b.team.key) ?? 0));
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
    .flatMap((team) => team.results.map((game) => ({ team, game })))
    .sort((a, b) => b.game.date.localeCompare(a.game.date))
    .slice(0, limit);
}

/** A team's season in order, oldest first: the results, then the games to come. */
export function season(team: SportData): SportGame[] {
  return [...team.results].reverse().concat(team.upcoming);
}

/** The most recent result across the teams. */
export function latestResult(data: SportsData): TeamGame | undefined {
  return data.sports
    .flatMap((team) => team.results.slice(0, 1).map((game) => ({ team, game })))
    .sort((a, b) => b.game.date.localeCompare(a.game.date))[0];
}
