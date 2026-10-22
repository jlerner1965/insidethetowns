/**
 * MaxPreps against the school's own calendar, and what the page may show.
 *
 * A game to come is published only when the two agree, or when the school
 * calendar has nothing to say about it. Where they disagree on the day, the
 * time or the opponent, the game is held: left off the page, named in the
 * run summary for a person to look at. A game the calendar does not list at
 * all is published and noted, since silence is not a contradiction.
 */
import type { SportConfig, SportData, SportGame, SportsData } from '../../src/config/school-sports.ts';
import type { CalendarEvent } from './finalsite-calendar.ts';
import type { TeamPage } from './maxpreps.ts';

/** "Mountain View High School" and "Mountain View" are the same school. */
export function sameSchool(a: string, b: string): boolean {
  const norm = (s: string) =>
    s
      .toLowerCase()
      .replace(/[().,'’]/g, ' ')
      .replace(/\b(junior\/senior|jr\.?\/sr\.?|jr\/sr|high school|high|hs|school|schools|secondary|academy|the)\b/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  const x = norm(a);
  const y = norm(b);
  if (!x || !y) return false;
  return x === y || x.startsWith(`${y} `) || y.startsWith(`${x} `);
}

function daysBetween(a: string, b: string): number {
  return Math.abs((Date.parse(`${a}T12:00:00Z`) - Date.parse(`${b}T12:00:00Z`)) / 86_400_000);
}

function clock(t: string): string {
  const [h, m] = t.split(':').map(Number) as [number, number];
  const hour = h % 12 || 12;
  return `${hour}${m ? `:${String(m).padStart(2, '0')}` : ''} ${h < 12 ? 'am' : 'pm'}`;
}

export interface Check {
  upcoming: SportGame[];
  held: Array<{ game: SportGame; reason: string }>;
  notes: string[];
}

/**
 * The varsity games the calendar lists for this team, and a verdict on each
 * game MaxPreps says is to come.
 */
export function crossCheck(sport: SportConfig, toCome: SportGame[], calendar: CalendarEvent[]): Check {
  const ours = calendar.filter(
    (e) => e.gender === sport.calendar.gender && e.level === 'Varsity' && e.sport.toLowerCase() === sport.calendar.sport.toLowerCase(),
  );
  const out: Check = { upcoming: [], held: [], notes: [] };
  for (const game of toCome) {
    const label = `${game.date} ${game.site === 'home' ? 'vs' : 'at'} ${game.opponent}`;
    const sameDay = ours.filter((e) => e.date === game.date);
    const match = sameDay.find((e) => e.opponent && sameSchool(e.opponent, game.opponent));
    if (match) {
      if (game.time && match.time !== game.time) {
        out.held.push({ game, reason: `${label}: MaxPreps says ${clock(game.time)}, the school calendar says ${clock(match.time)} ("${match.title}")` });
        continue;
      }
      const where = match.where === 'vs' ? 'home' : match.where === '@' ? 'away' : undefined;
      // A playoff or tournament game is at a neutral site whichever side
      // the school files it on (the seeded host is "vs" on its calendar),
      // so a side is not a disagreement there; the day and the time are.
      if (where && where !== game.site && !game.neutral) {
        out.held.push({ game, reason: `${label}: MaxPreps has it ${game.site}, the school calendar ${where} ("${match.title}")` });
        continue;
      }
      if (where && game.neutral) out.notes.push(`${label}: a ${game.venue ? `game at ${game.venue}` : 'neutral-site game'}, which the school calendar files as ${where} ("${match.title}")`);
      out.upcoming.push(game);
      continue;
    }
    if (sameDay.length) {
      out.held.push({ game, reason: `${label}: the school calendar lists ${sameDay.map((e) => `"${e.title}"`).join(' and ')} that day instead` });
      continue;
    }
    const nearby = ours.find((e) => e.opponent && sameSchool(e.opponent, game.opponent) && daysBetween(e.date, game.date) <= 10);
    if (nearby) {
      out.held.push({ game, reason: `${label}: the school calendar has ${nearby.opponent} on ${nearby.date} at ${clock(nearby.time)} ("${nearby.title}")` });
      continue;
    }
    out.notes.push(`${label} is not on the school calendar (published on MaxPreps's word alone)`);
    out.upcoming.push(game);
  }
  return out;
}

/** The games still to come, by the run's own date: the whole schedule's where it was read, else the glance card's, soonest first. */
export function gamesToCome(page: TeamPage, today: string): SportGame[] {
  return dedupeToCome(
    (page.schedule ?? page.glance)
      .filter((g) => !g.result && !g.place && g.date >= today)
      .sort((a, b) => a.date.localeCompare(b.date)),
  );
}

/**
 * One game per opponent per start: MaxPreps carried Niwot volleyball's 30
 * October match against Fossil Ridge twice, at 9:45 am both times, under two
 * contest ids (21 October 2026); a team cannot play the same opponent twice
 * at one moment, and the second page has since gone. A doubleheader is two
 * games at two times, or two games with no time given, and both of those
 * are kept: only a repeat of the same day, the same known time and the same
 * opponent is dropped, the first contest id kept.
 */
export function dedupeToCome(games: SportGame[]): SportGame[] {
  const seen = new Set<string>();
  return games.filter((g) => {
    if (!g.time) return true;
    const key = `${g.date}|${g.time}|${g.opponent.toLowerCase()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/** A fresh entry for the data file, from a page that was read today. */
export function entryFrom(sport: SportConfig, page: TeamPage, check: Check, now: string): SportData {
  return {
    key: sport.key,
    name: sport.name,
    maxprepsUrl: page.url,
    fetched: now,
    maxprepsUpdated: page.updatedOn,
    overall: page.overall,
    league: page.league,
    results: page.results,
    upcoming: check.upcoming,
    held: check.held,
    notes: [...check.notes, ...page.warnings.map((w) => `MaxPreps page: ${w}`)],
  };
}

/** A team MaxPreps has nothing for: read today, with nothing to show but the link. */
export function emptyEntry(sport: SportConfig, page: TeamPage, now: string): SportData {
  return {
    key: sport.key,
    name: sport.name,
    maxprepsUrl: page.url,
    fetched: now,
    maxprepsUpdated: page.updatedOn,
    results: [],
    upcoming: [],
    held: [],
    notes: ['MaxPreps lists no schedule or results for this team'],
    empty: 'MaxPreps has no schedule or results for this team yet.',
  };
}

/** The previous run's entry, kept as it was, when this run could not replace it. */
export function keepPrevious(sport: SportConfig, previous: SportsData | undefined, maxprepsRoot: string): SportData {
  const old = previous?.sports.find((s) => s.key === sport.key);
  if (old) return { ...old, name: sport.name };
  return { key: sport.key, name: sport.name, maxprepsUrl: `${maxprepsRoot}${sport.maxpreps}/`, results: [], upcoming: [], held: [], notes: [] };
}
