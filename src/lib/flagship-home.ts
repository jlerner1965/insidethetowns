/**
 * The flagship home page's readings of the data (the homepage brief, 25
 * October 2026): which result the scoreboard shows, what is next up, the
 * week as seven days, and which of the school's teams get a row. Pure
 * functions over the sports file, the calendar and the clock, so the
 * rules can be tested without Astro. Every line they produce comes from
 * the data; where there is nothing, they return nothing and the page says
 * so.
 */
import type { CollectionEntry } from 'astro:content';
import type { SportGame, SportsData } from '../config/school-sports.ts';
import { addDays, dayKey, formatDayLong, formatTime, formatTimeRange, startOfDay, toIsoLocal } from './dates.ts';
import { isCanceled, lastDay, listedUntil, sortByStart } from './events.ts';
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
  kind: 'event' | 'game' | 'deadline';
  /** The title as the agenda sets it: shortened at a natural break when it runs long (displayTitle). */
  title: string;
  /** The listing's own title, whole. */
  fullTitle: string;
  /** "6:30 pm", "All day", the listing's own time note, or a played game's result ("Won 50–0"). */
  when: string;
  /** The venue and the cost, or the game's stage and venue: "City Star Brewing · Free". */
  where: string;
  /** One line, both: "6:30 pm · Home", "7 pm · City Star Brewing · Free". */
  meta: string;
  /** A game's Home, Away or Neutral site pill. */
  site?: 'Home' | 'Away' | 'Neutral site';
  href: string;
  /** A CSS colour for the dot: the category's. */
  dot: string;
  /** "HH:MM" for the order within the day; all-day and untimed things after the timed ones. */
  time: string;
  /** The last Denver day it is on, and the instant it comes off: the marks the browser's pruning reads (src/lib/expiry.ts). */
  eventDay: string;
  end?: string;
  /** A weekly series (the caller's `isSeries`): the first to give up a visible slot on a full day. */
  series?: boolean;
}

/** A registration opening or closing on a day, from the programs (src/lib/programs.ts, upcomingDeadlines). */
export interface WeekDeadline {
  on: Date;
  what: 'opens' | 'closes';
  /** The program's name. */
  title: string;
  /** Where to sign up: the organizer's registration page, else the family hub. */
  href: string;
}

export interface WeekDay {
  key: string;
  date: Date;
  /** Before today: what was listed and played, never an invitation to add to it. */
  past: boolean;
  items: DayItem[];
  /** Listed that day beyond the ones shown. */
  more: number;
}

export interface WeekInput<E extends EventLike> {
  events: readonly E[];
  sports?: SportsData;
  /** The team pages that exist, by team key, for the games' links. */
  teamHref?: (key: string) => string;
  now?: Date;
  /** Items a day shows before "+N more". */
  limit?: number;
  /**
   * The first day: the week's Monday (weekWindow), as the seven columns
   * had it, or today, the agenda's seven days from the day the page was
   * built (the 26 October 2026 audit: on a Sunday six of the Monday week's
   * seven days had gone, and the first screen showed what was over).
   */
  from?: 'monday' | 'today';
  /**
   * Which listings are weekly series (events.ts, weeklyTest, built over the
   * whole calendar). On a day with more than `limit` things, one-off and
   * civic listings, games and sign-up dates take the visible slots first.
   */
  isSeries?: (e: E) => boolean;
  /** Registration openings and deadlines, each on its day. */
  deadlines?: readonly WeekDeadline[];
}

/** "7 am" as "07:00", "6:30 pm" as "18:30", for the order within a day; anything else first. */
export function clockKey(time: string | undefined): string {
  const m = time?.trim().match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)$/i);
  if (!m) return '00:00';
  const hour = (Number(m[1]) % 12) + (m[3]!.toLowerCase() === 'pm' ? 12 : 0);
  return `${String(hour).padStart(2, '0')}:${m[2] ?? '00'}`;
}
const hhmm = (d: Date) => new Intl.DateTimeFormat('en-GB', { timeZone: 'America/Denver', hour: '2-digit', minute: '2-digit', hour12: false }).format(d);

/**
 * A listing's title as the agenda sets it: whole up to `max` characters;
 * past that, cut at the first natural break (a dash, a colon, a comma
 * before "with", an opening bracket) that leaves at least a dozen
 * characters, else whole and left to the stylesheet's two-line clamp.
 * Never cut mid-word and never given an ellipsis that reads as a typo: the
 * whole title is on the listing the row links to.
 */
export function displayTitle(title: string, max = 56): string {
  const t = title.trim();
  if (t.length <= max) return t;
  const m = t.slice(12).match(/\s[—–-]\s|:\s|,\s(?=with\b)|\s\(/);
  return m && m.index !== undefined ? t.slice(0, 12 + m.index).trim() : t;
}

const nbsp = (s: string) => s.replace(/ (am|pm)/g, ' $1');

function eventItem(e: EventLike): DayItem {
  const { title, start, end, allDay, timeNote, venue, cost, category } = e.data;
  const when = timeNote ?? (allDay ? 'All day' : nbsp(formatTime(start)));
  const fullWhen = timeNote ?? nbsp(formatTimeRange(start, end && dayKey(end) === dayKey(start) ? end : undefined, allDay));
  const place = [venue, cost].filter(Boolean).join(' · ');
  return {
    kind: 'event',
    title: displayTitle(title),
    fullTitle: title,
    when,
    where: place,
    meta: [fullWhen, place].filter(Boolean).join(' · '),
    href: `/events/${e.slug ?? e.id}/`,
    dot: `var(--cat-${category}-dot)`,
    time: allDay || timeNote ? '99:98' : hhmm(start),
    eventDay: lastDay(e),
    end: toIsoLocal(listedUntil(e)),
  };
}

function gameItem({ team, game }: TeamGame, href: string): DayItem {
  const result = game.result ? `${RESULT_WORD[game.result]}${game.score ? ` ${game.score.us}–${game.score.them}` : game.forfeit ? ' by forfeit' : ''}` : game.place;
  const time = game.time ? clock(gameDay(game)) : undefined;
  const place = game.venue ?? (game.neutral ? undefined : game.site === 'home' ? 'Home' : game.site === 'away' ? 'Away' : undefined);
  const title = `${team.name} ${where(game)} ${game.opponent}`;
  return {
    kind: 'game',
    title: displayTitle(title),
    fullTitle: title,
    when: result ?? time ?? 'Time to be set',
    where: [game.stage, game.venue].filter(Boolean).join(' · '),
    meta: [result ?? time, game.stage, place].filter(Boolean).join(' · '),
    site: siteWord(game),
    href,
    dot: 'var(--cat-sports-dot)',
    time: game.time ?? '99:99',
    eventDay: game.date,
  };
}

function deadlineItem(d: WeekDeadline): DayItem {
  const when = d.what === 'opens' ? 'Sign-ups open' : 'Last day to sign up';
  return {
    kind: 'deadline',
    title: displayTitle(d.title),
    fullTitle: d.title,
    when,
    where: 'Registration',
    meta: `${when} · Registration`,
    href: d.href,
    dot: 'var(--cat-family-dot)',
    time: '99:97',
    eventDay: dayKey(d.on),
  };
}

/**
 * Seven days, one entry a day: the events that start that day and are not
 * called off, the school's games that day (the result once it is played,
 * the time before), and the registration openings and deadlines that fall
 * on it. A run that began on an earlier day is filed under its first day
 * only, as the events page files it, so a month-long trail does not fill
 * every day.
 *
 * A day shows `limit` things and counts the rest in `more`. Which ones: on a
 * full day the weekly series give way first (a Town Board meeting was hidden
 * behind "+2 more" by two weekly regulars, 26 October 2026), so one-off and
 * civic listings, games and sign-up dates are chosen before them; the chosen
 * ones are then shown in the order of the clock, games and events alike,
 * all-day and untimed last (football had led every day it was played,
 * ahead of a morning story time). The Thursday email is not one of the
 * week's things on: the page promotes it on its own.
 */
export function weekDays<E extends EventLike>({ events, sports, teamHref = () => '/sports/', now = new Date(), limit = 3, from = 'monday', isSeries = () => false, deadlines = [] }: WeekInput<E>): WeekDay[] {
  const first = from === 'today' ? startOfDay(now) : weekWindow(now).monday;
  const today = dayKey(now);
  const listed = sortByStart([...events]).filter((e) => !isCanceled(e));
  const games: TeamGame[] = (sports?.sports ?? []).flatMap((team) => [...dedupeResults(team.results), ...team.upcoming].map((game) => ({ team, game })));
  return Array.from({ length: 7 }, (_, i) => {
    const date = addDays(first, i);
    const key = dayKey(date);
    const items: DayItem[] = [
      ...games.filter((g) => g.game.date === key).map((g) => gameItem(g, teamHref(g.team.key))),
      ...listed.filter((e) => dayKey(e.data.start) === key).map((e) => ({ ...eventItem(e), series: isSeries(e) })),
      ...deadlines.filter((d) => dayKey(d.on) === key).map(deadlineItem),
    ];
    // One row per listing a day: a series with two sittings on one day is one thing on.
    const seen = new Set<string>();
    const unique = items.filter((it) => (seen.has(it.href + it.fullTitle) ? false : (seen.add(it.href + it.fullTitle), true)));
    const byClock = (a: DayItem, b: DayItem) => a.time.localeCompare(b.time);
    const chosen = [...unique].sort((a, b) => Number(!!a.series) - Number(!!b.series) || byClock(a, b)).slice(0, limit);
    const kept = chosen.sort(byClock);
    return {
      key,
      date,
      past: key < today,
      items: kept,
      more: unique.length - kept.length,
    };
  });
}

// ------------------------------------------------------- the school's rows

export interface TeamRow {
  team: SportsData['sports'][number];
  /** Football: its season so far. */
  football?: { record?: string; last?: SportGame; next?: SportGame };
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
      const next = team.upcoming.find((g) => g.date >= today);
      return [{ team, football: { record: team.overall ? dashed(team.overall) : undefined, last: results.find((g) => g.result || g.place), next }, games: [] }];
    }
    const games = week.filter((c) => c.team === team).map((c) => c.game);
    return games.length > 0 ? [{ team, games }] : [];
  });
}
