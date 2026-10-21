/**
 * Reading data/berthoud/sports.json for the pages: the week's big game,
 * the games to come, and the words for a game. Shared by /sports/ and the
 * Berthoud home page so both lead with the same game.
 */
import type { SportData, SportGame, SportsData } from '../config/berthoud-sports.ts';
import { dayKey, formatDayLong, formatTime, fromWallClock } from './dates.ts';

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
 * src/config/berthoud-sports.ts), so the first team with a game in the
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

/** The most recent result across the teams. */
export function latestResult(data: SportsData): TeamGame | undefined {
  return data.sports
    .flatMap((team) => team.results.slice(0, 1).map((game) => ({ team, game })))
    .sort((a, b) => b.game.date.localeCompare(a.game.date))[0];
}
