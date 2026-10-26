/**
 * The home page's readings of the data (the homepage brief, 25 October
 * 2026; the design pass, 26 October 2026): which result the scoreboard
 * shows, what is next up, the week as seven days, and which of the
 * school's teams get a row. Pure functions over the sports file, the
 * calendar and the clock, so the rules can be tested without Astro. Every
 * line they produce comes from the data; where there is nothing, they
 * return nothing and the page says so.
 */
import type { CollectionEntry } from 'astro:content';
import { HIGHLIGHT } from '../config/palette.ts';
import type { SportGame, SportsData } from '../config/school-sports.ts';
import { addDays, dayKey, formatDayLong, formatTime, formatTimeRange, startOfDay } from './dates.ts';
import { sortByStart } from './events.ts';
import { FLAGSHIP_TEAM, RESULT_WORD, bigGame, dedupeResults, gameDay, stripGames, weekGames, where, type TeamGame } from './school-sports.ts';
import { weekWindow } from './weekly.ts';

type EventLike = { data: CollectionEntry<'events'>['data']; slug?: string; id?: string };

/** The scoreboard's window: a result this many days old or newer leads the masthead. */
export const RESULT_DAYS = 8;

/** "7-2" as a page prints a record or a score: "7–2", with an en dash. */
export function dashed(text: string): string {
  return text.replace(/(\d)-(?=\d)/g, '$1–');
}

/** A result with a score to put on a scoreboard: a forfeit or a meet's placing has none. */
function scored(g: SportGame): boolean {
  return !!g.result && !!g.score;
}

/**
 * The result the masthead's scoreboard shows: football's latest final in
 * the last RESULT_DAYS days, else the most recent final of any team in
 * them (the config's order on a tie), else nothing.
 */
export function scoreboardResult(data: SportsData, now = new Date(), days = RESULT_DAYS): TeamGame | undefined {
  const today = dayKey(now);
  const since = dayKey(addDays(startOfDay(now), -days));
  const inWindow = (g: SportGame) => scored(g) && g.date >= since && g.date <= today;
  const finals = data.sports.flatMap((team) => dedupeResults(team.results).filter(inWindow).slice(0, 1).map((game) => ({ team, game })));
  const football = finals.find((f) => f.team.key === FLAGSHIP_TEAM);
  if (football) return football;
  return [...finals].sort((a, b) => b.game.date.localeCompare(a.game.date))[0];
}

/**
 * The game the masthead's left column shows large when there is no final
 * to show: the week's football game, else the week's first game (the
 * strip's own choice), else the next game whenever it is.
 */
export function leadGame(data: SportsData, now = new Date()): TeamGame | undefined {
  return stripGames(data, now, 1)[0] ?? bigGame(data, now);
}

/** The next game from today, any team, leaving out one the page already shows. */
export function nextGame(data: SportsData, now = new Date(), except?: TeamGame): TeamGame | undefined {
  const today = dayKey(now);
  return data.sports
    .flatMap((team) => team.upcoming.filter((g) => g.date >= today).map((game) => ({ team, game })))
    .filter((c) => !except || c.game !== except.game)
    .sort((a, b) => a.game.date.localeCompare(b.game.date) || (a.game.time ?? '99:99').localeCompare(b.game.time ?? '99:99'))[0];
}

/** "6:30 pm" kept on one line: a heading that broke before "pm" left it alone on the next. */
export function clock(d: Date): string {
  return formatTime(d).replace(/ (am|pm)$/, '\u00a0$1');
}

/** "Friday", "Monday, 6:30 pm": the next game's heading. Never "Today": a page can be older than the day it was built. */
export function gameHeading(g: SportGame): string {
  const weekday = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Denver', weekday: 'long' }).format(gameDay(g));
  return g.time ? `${weekday}, ${clock(gameDay(g))}` : weekday;
}

/** "Won 50–0 at Mountain View, Friday, October 23." */
export function resultSentence(g: SportGame): string {
  const word = g.result ? RESULT_WORD[g.result] : 'Played';
  const score = g.score ? ` ${g.score.us}–${g.score.them}` : g.forfeit ? ' by forfeit' : g.place ? `, ${g.place},` : '';
  return `${word}${score} ${where(g)} ${g.opponent}, ${formatDayLong(gameDay(g))}.`;
}

/** "Home", "Away", "Neutral site": the pill's word. */
export function siteWord(g: SportGame): 'Home' | 'Away' | 'Neutral site' {
  return g.site === 'home' && !g.neutral ? 'Home' : g.site === 'away' && !g.neutral ? 'Away' : 'Neutral site';
}

// ------------------------------------------------------------- the week

export interface DayItem {
  kind: 'event' | 'game' | 'email';
  title: string;
  /**
   * Called off or moved, by the organizer's word (the listing's status):
   * shown with the label, never silently dropped from a day a reader
   * planned around (design pass, 26 October 2026).
   */
  status?: 'canceled' | 'postponed';
  /** The editor's pick for the week: one word beside the title. */
  pick?: boolean;
  /** One line: "6:30 pm · Home", "7 pm · City Star Brewing · Free". */
  meta: string;
  href: string;
  /** A CSS colour for the dot: a category's, or the amber for the email. */
  dot: string;
  /** "HH:MM" for the order within the day; untimed things after the timed ones. */
  time: string;
  /** Which of a full day's items keep their place: football, then the email, then the rest by time. */
  rank: number;
}

export interface WeekDay {
  key: string;
  date: Date;
  /** Before today: what was listed and played, never an invitation to add to it. */
  past: boolean;
  /** "Today" or "Tomorrow" when the day is one of them; the agenda's heading says so. */
  relative?: 'Today' | 'Tomorrow';
  items: DayItem[];
  /** Listed that day beyond the ones shown. */
  more: number;
}

export interface WeekInput<E extends EventLike> {
  events: readonly E[];
  sports?: SportsData;
  /** The team pages that exist, by team key, for the games' links. */
  teamHref?: (key: string) => string;
  /** The email's day ("Thursday") and hour ("7 am"), from the newsletter config; no day, no email item. */
  email?: { day: string; time?: string };
  now?: Date;
  /** Items a day shows before "+N more"; a function gives each day its own. */
  limit?: number | ((dayIndex: number) => number);
  /**
   * Which seven days: the calendar week, Monday to Sunday (`monday`), or
   * the seven from today (`today`), the agenda's choice: a reader on a
   * Saturday wants Saturday first, not a column of days gone by.
   */
  start?: 'monday' | 'today';
  /** The slugs of the editor's picks, for the word beside the title. */
  picked?: ReadonlySet<string>;
}

const WEEKDAY = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Denver', weekday: 'long' });

/** "7 am" as "07:00", "6:30 pm" as "18:30", for the order within a day; anything else first. */
export function clockKey(time: string | undefined): string {
  const m = time?.trim().match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)$/i);
  if (!m) return '00:00';
  const hour = (Number(m[1]) % 12) + (m[3]!.toLowerCase() === 'pm' ? 12 : 0);
  return `${String(hour).padStart(2, '0')}:${m[2] ?? '00'}`;
}
const hhmm = (d: Date) => new Intl.DateTimeFormat('en-GB', { timeZone: 'America/Denver', hour: '2-digit', minute: '2-digit', hour12: false }).format(d);

function eventItem(e: EventLike, picked?: ReadonlySet<string>): DayItem {
  const { title, start, end, allDay, timeNote, venue, cost, category, status } = e.data;
  const when = timeNote ?? formatTimeRange(start, end && dayKey(end) === dayKey(start) ? end : undefined, allDay).replace(/ (am|pm)/g, '\u00a0$1');
  const slug = e.slug ?? e.id ?? '';
  return {
    kind: 'event',
    title,
    meta: [when, venue, cost].filter(Boolean).join(' · '),
    href: `/events/${slug}/`,
    dot: `var(--cat-${category}-dot)`,
    time: allDay ? '99:98' : hhmm(start),
    rank: 2,
    ...(status === 'canceled' || status === 'postponed' ? { status } : {}),
    ...(picked?.has(slug) ? { pick: true } : {}),
  };
}

function gameItem({ team, game }: TeamGame, href: string): DayItem {
  const result = game.result ? `${RESULT_WORD[game.result]}${game.score ? ` ${game.score.us}–${game.score.them}` : game.forfeit ? ' by forfeit' : ''}` : game.place;
  const time = game.time ? clock(gameDay(game)) : undefined;
  const place = game.venue ?? (game.neutral ? undefined : game.site === 'home' ? 'Home' : game.site === 'away' ? 'Away' : undefined);
  return {
    kind: 'game',
    title: `${team.name} ${where(game)} ${game.opponent}`,
    meta: [result ?? time, game.stage, place].filter(Boolean).join(' · '),
    href,
    dot: 'var(--cat-sports-dot)',
    time: game.time ?? '99:99',
    rank: team.key === FLAGSHIP_TEAM ? 0 : 2,
  };
}

/**
 * Seven days (the calendar week Monday to Sunday, or from today, Denver),
 * one entry a day: the events that start that day, a called-off one kept
 * and marked, the school's games that day (the result once it is played,
 * the time before), and the Thursday email on its day from today on. A run
 * that began on an earlier day is filed under its first day only, as the
 * events page files it, so a month-long trail does not fill every day. A
 * day shows `limit` items, football first, then the email, then the rest by
 * time; the rest are counted in `more`.
 */
export function weekDays<E extends EventLike>({ events, sports, teamHref = () => '/sports/', email, now = new Date(), limit = 3, start = 'monday', picked }: WeekInput<E>): WeekDay[] {
  const first = start === 'today' ? startOfDay(now) : weekWindow(now).monday;
  const today = dayKey(now);
  const tomorrow = dayKey(addDays(startOfDay(now), 1));
  const listed = sortByStart([...events]);
  const games: TeamGame[] = (sports?.sports ?? []).flatMap((team) => [...dedupeResults(team.results), ...team.upcoming].map((game) => ({ team, game })));
  const limitFor = typeof limit === 'function' ? limit : () => limit;
  return Array.from({ length: 7 }, (_, i) => {
    const date = addDays(first, i);
    const key = dayKey(date);
    const items: DayItem[] = [
      ...games.filter((g) => g.game.date === key).map((g) => gameItem(g, teamHref(g.team.key))),
      ...listed.filter((e) => dayKey(e.data.start) === key).map((e) => eventItem(e, picked)),
    ];
    if (email && WEEKDAY.format(date) === email.day && key >= today) {
      items.push({ kind: 'email', title: `${email.day} email`, meta: `${email.time ? `${email.time}, in` : 'In'} your inbox`, href: '#signup', dot: HIGHLIGHT, time: clockKey(email.time), rank: 1 });
    }
    // One row per listing a day: a series with two sittings on one day is one thing on.
    const seen = new Set<string>();
    const unique = items.filter((it) => (seen.has(it.href + it.title) ? false : (seen.add(it.href + it.title), true)));
    const kept = [...unique].sort((a, b) => a.rank - b.rank || a.time.localeCompare(b.time)).slice(0, limitFor(i));
    return {
      key,
      date,
      past: key < today,
      ...(key === today ? { relative: 'Today' as const } : key === tomorrow ? { relative: 'Tomorrow' as const } : {}),
      items: kept,
      more: unique.length - kept.length,
    };
  });
}

// ------------------------------------------------------- the school's rows

export interface TeamRow {
  team: SportsData['sports'][number];
  /** Football: its season so far. */
  football?: { record?: string; last?: SportGame };
  /** Every other team: its games in the next seven days. */
  games: SportGame[];
}

/**
 * The school's sports in season, one row each, in the config's order:
 * football while it has a result in the last two weeks or a game in the
 * next two, every other team while it has a game in the next seven days
 * (weekGames, the same week the strip and the Thursday email list).
 */
export function teamRows(data: SportsData, now = new Date()): TeamRow[] {
  const today = dayKey(now);
  const before = dayKey(addDays(startOfDay(now), -14));
  const after = dayKey(addDays(startOfDay(now), 14));
  const week = weekGames(data, now);
  return data.sports.flatMap((team): TeamRow[] => {
    if (team.key === FLAGSHIP_TEAM) {
      const results = dedupeResults(team.results);
      const recent = results.some((g) => g.date >= before && g.date <= today);
      const soon = team.upcoming.some((g) => g.date >= today && g.date <= after);
      if (!recent && !soon) return [];
      return [{ team, football: { record: team.overall ? dashed(team.overall) : undefined, last: results.find((g) => g.result || g.place) }, games: [] }];
    }
    const games = week.filter((c) => c.team === team).map((c) => c.game);
    return games.length > 0 ? [{ team, games }] : [];
  });
}
