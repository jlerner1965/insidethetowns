/**
 * One MaxPreps team home page, fetched and read. No browser, no model.
 *
 * The page is a Next.js render carrying its data in a `__NEXT_DATA__` script:
 * the season's standings (overall and league record, the league's name and
 * the team's place in it), the "Schedule at a Glance" card (the last game
 * and the next two) and one "Game Results" post per game played, with both
 * scores and who was at home. Those are read; the records in the visible
 * text are read too and compared, so a page whose markup changed under us is
 * reported rather than trusted.
 *
 * The team home page is read first, then its /schedule/ page for the whole
 * season (the end of this file). robots.txt is read first, as for every other site, and the
 * request identifies honestly (scripts/lib/probe.ts). MaxPreps refuses a
 * request that pretends to be a browser and, after a handful of requests,
 * one from a cloud address; the honest one from a GitHub runner was answered
 * (run 39629133155, 21 October 2026).
 */
import { execFile } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';
import { promisify } from 'node:util';
import type { SportGame } from '../../src/config/school-sports.ts';
import { isAllowed } from './robots.ts';
import { robotsFor, TIMEOUT, UA } from './probe.ts';

const run = promisify(execFile);
/** Before the one retry after no response. */
const RETRY_MS = 3000;

export interface TeamPage {
  url: string;
  overall?: string;
  league?: { record: string; name: string; place?: string };
  /** When MaxPreps last touched the schedule or the standings, as it states it (GMT, no zone). */
  updatedOn?: string;
  /** The "Schedule at a Glance" card: the last result and the next games, in order. */
  glance: SportGame[];
  /** Every game played this season that the page reports, newest first. */
  results: SportGame[];
  /** The whole season, oldest first, once the /schedule/ page has been read and agreed with (applySchedule). */
  schedule?: SportGame[];
  /** What did not add up: a cross-check that failed, a block that was missing. */
  warnings: string[];
  /** The page says "No Schedule": MaxPreps has the team and nothing for it. */
  noSchedule?: boolean;
}

export type Fetched = { ok: true; html: string } | { ok: false; reason: string; html?: string };

export async function fetchPage(url: string): Promise<Fetched> {
  const { origin, pathname } = new URL(url);
  const rules = await robotsFor(origin);
  if (!isAllowed(rules, pathname)) return { ok: false, reason: 'robots.txt asks automated clients not to fetch it' };
  const args = [
    '-sS', '-L', '--max-time', String(TIMEOUT), '-A', UA,
    '-H', 'Accept: text/html,application/xhtml+xml,*/*;q=0.8',
    '-H', 'Accept-Language: en-US,en;q=0.9',
    '-w', '\n%{http_code}', url,
  ];
  // One more try after no response at all: a blip at either end is the
  // likelier reading, and the first scheduled run met exactly one.
  let last: { ok: false; reason: string } = { ok: false, reason: 'not tried' };
  for (let attempt = 0; attempt < 2; attempt++) {
    if (attempt) await sleep(RETRY_MS);
    try {
      const { stdout } = await run('curl', args, { maxBuffer: 32 << 20 });
      const nl = stdout.lastIndexOf('\n');
      const code = stdout.slice(nl + 1).trim();
      const html = stdout.slice(0, nl);
      if (/^2/.test(code)) return { ok: true, html };
      return { ok: false, reason: `HTTP ${code}`, html };
    } catch (e) {
      const err = e as Error & { stderr?: string };
      const said = (err.stderr ?? '').trim().split('\n').at(-1) || err.message.split('\n')[0];
      last = { ok: false, reason: `no response (${said})` };
    }
  }
  return last;
}

/** The page as a reader sees it: no scripts, no styles, no tags, one space between words. */
export function visibleText(html: string): string {
  return html
    .replace(/<script\b[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[\s\S]*?<\/style>/gi, ' ')
    .replace(/<!--.*?-->/g, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&#x27;|&#39;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

/* The shapes read out of __NEXT_DATA__; only the fields used. */
interface MpTeam {
  schoolName: string;
  score: number | null;
  result: 'W' | 'L' | 'T' | null;
  place?: string | number | null;
  teamCanonicalUrl: string;
}
interface MpContest {
  contestId: string;
  hasResult: boolean;
  canonicalUrl: string;
  /** Kickoff, local wall clock, for a game to come; the score's entry time (GMT) once played. */
  timestamp: string;
  homeAwayType: number;
  isTimeTba: boolean;
  isDateTba: boolean;
  teams: MpTeam[];
}
interface MpPost {
  type: number;
  title: string;
  text: string;
  timeStamp: string;
  data?: Partial<MpContest> & { contestId?: string };
}

function site(homeAwayType: number): SportGame['site'] {
  return homeAwayType === 0 ? 'home' : homeAwayType === 1 ? 'away' : 'neutral';
}

/** The game's own day from its page URL (…/10-9-2026/…): the one date MaxPreps never shifts into GMT. */
function dateFromUrl(url: string): string | undefined {
  const m = url.match(/\/(\d{1,2})-(\d{1,2})-(\d{4})\//);
  return m ? `${m[3]}-${m[1]!.padStart(2, '0')}-${m[2]!.padStart(2, '0')}` : undefined;
}

function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return `${n}${s[(v - 20) % 10] ?? s[v] ?? s[0]}`;
}

function toGame(c: MpContest, us: Team, kickoff?: string): SportGame | undefined {
  const mine = c.teams?.find((t) => t.teamCanonicalUrl?.startsWith(us.url) || t.schoolName === us.schoolName);
  const theirs = c.teams?.find((t) => t !== mine);
  const date = dateFromUrl(c.canonicalUrl ?? '') ?? (c.hasResult ? kickoff : c.timestamp)?.slice(0, 10);
  if (!mine || !date || !c.canonicalUrl) return undefined;
  // A meet has no single opponent; MaxPreps names the event in the URL.
  const opponent = theirs?.schoolName ?? c.canonicalUrl.match(/\/game\/([^/]+)\//)?.[1]?.replace(/-/g, ' ') ?? 'meet';
  // The URL keeps its ?c=: a doubleheader's two games share the path and
  // differ only in that contest id (Niwot softball at Falcon, 17 October
  // 2026, lost 4-15 and 9-17), and it is what tells one from the other.
  const game: SportGame = { date, opponent, site: site(c.homeAwayType), url: c.canonicalUrl };
  if (c.homeAwayType === 2) game.neutral = true;
  if (c.hasResult && mine.result && mine.score != null && theirs?.score != null) {
    game.result = mine.result;
    game.score = { us: mine.score, them: theirs.score };
  } else if (c.hasResult && mine.place != null && mine.place !== '') {
    game.place = typeof mine.place === 'number' ? ordinal(mine.place) : String(mine.place);
  } else if (!c.hasResult && !c.isTimeTba && c.timestamp?.length >= 16) {
    game.time = c.timestamp.slice(11, 16);
  }
  return game;
}

/** The team page being read: its URL, and the school's name as MaxPreps writes it in a game's data. */
export interface Team {
  url: string;
  schoolName: string;
  /** Where the sport's playoff games are played, when one site hosts them all (SportConfig.playoffVenue). */
  playoffVenue?: string;
}

export function parseTeamPage(html: string, us: Team): TeamPage {
  const { url } = us;
  const page: TeamPage = { url, glance: [], results: [], warnings: [] };

  const raw = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/)?.[1];
  if (!raw) {
    page.warnings.push('no __NEXT_DATA__ on the page');
    return page;
  }
  let pp: any;
  try {
    pp = JSON.parse(raw).props?.pageProps;
  } catch {
    page.warnings.push('__NEXT_DATA__ is not JSON');
    return page;
  }
  const ctx = pp?.teamContext;
  const standings = ctx?.standingsData;
  if (standings?.overallStanding?.overallWinLossTies) {
    page.overall = standings.overallStanding.overallWinLossTies;
  } else {
    page.warnings.push('no overall record in the standings data');
  }
  const ls = standings?.leagueStanding;
  if (ls?.conferenceWinLossTies) {
    page.league = { record: ls.conferenceWinLossTies, name: ls.leagueName ?? 'League', place: ls.conferenceStandingPlacement || undefined };
  }
  const stamps = [ctx?.teamSettings?.scheduleUpdatedOn, ctx?.teamSettings?.standingsUpdatedOn, ctx?.tda?.updatedOn].filter(Boolean) as string[];
  if (stamps.length) page.updatedOn = stamps.sort().at(-1);

  const glance: MpContest[] = pp?.wallCards?.schedule?.data ?? [];
  if (!glance.length) {
    if (/\bNo Schedule\b/.test(visibleText(html))) page.noSchedule = true;
    else page.warnings.push('no "Schedule at a Glance" card');
  }
  for (const c of glance) {
    const g = toGame(c, us);
    if (g) page.glance.push(g);
    else page.warnings.push(`a game in the glance card could not be read (${c.contestId})`);
  }

  const posts: MpPost[] = pp?.wallPosts ?? [];
  const seen = new Set<string>();
  for (const p of posts) {
    if (p.title !== 'Game Results' || !p.data?.contestId || seen.has(p.data.contestId)) continue;
    seen.add(p.data.contestId);
    const g = toGame(p.data as MpContest, us, p.timeStamp);
    if (g?.result || g?.place) page.results.push(g);
  }
  // The glance card's own played games, when the posts feed missed them (a meet, say).
  for (const g of page.glance) {
    if ((g.result || g.place) && !page.results.some((r) => r.url === g.url)) page.results.push(g);
  }
  page.results.sort((a, b) => b.date.localeCompare(a.date));

  // The glance card's played games must be among the results, with the same score.
  for (const g of page.glance.filter((x) => x.result)) {
    const r = page.results.find((x) => x.url === g.url);
    if (r && (r.score!.us !== g.score!.us || r.score!.them !== g.score!.them)) page.warnings.push(`scores differ for ${g.date} ${g.opponent}`);
  }

  // The records a reader sees must be the ones in the data.
  const text = visibleText(html);
  const shownOverall = text.match(/\bOverall\s+(\d+-\d+(?:-\d+)?)/)?.[1];
  const shownLeague = text.match(/\bLeague\s+(\d+-\d+(?:-\d+)?)/)?.[1];
  if (!shownOverall) page.warnings.push('no "Overall" record in the visible text');
  else if (page.overall && shownOverall !== page.overall) page.warnings.push(`visible overall record ${shownOverall} differs from the data's ${page.overall}`);
  if (page.league && shownLeague && shownLeague !== page.league.record) page.warnings.push(`visible league record ${shownLeague} differs from the data's ${page.league.record}`);
  if (!/Schedule at a Glance/i.test(text)) page.warnings.push('no "Schedule at a Glance" heading in the visible text');

  return page;
}

/** A page is usable when it has a record and the glance card; the warnings say what else is off. */
export function usable(page: TeamPage): boolean {
  return !!page.overall && page.glance.length > 0;
}

/*
 * The team's /schedule/ page: every game of the season, played and to come,
 * where the home page's wall carries only the recent ones (Berthoud
 * football's 6-2 showed as six games, October 2026). It answers the runner
 * (run 39666831083, 21 October 2026) as the home page does.
 *
 * Its data is `pageProps.contests`, an array of rows with no keys: 41
 * values a row, the teams as 32-value rows inside. The positions below
 * were read off the live page and are what the site's own script reads,
 * but a reshuffle would not announce itself, so every row is checked
 * against the sentence MaxPreps writes beside it ("On 10/9, the Berthoud
 * varsity football team lost their away conference game against Windsor
 * (CO) by a score of 46-0.", winner's score first; "… has an away
 * conference game @ Mountain View (Loveland, CO) on Friday, October 23 @
 * 7p." for one to come). A row the sentence does not bear out fails the
 * whole page, and the run keeps what the home page said.
 */
const ROW = { teams: 0, id: 1, hasResult: 4, venue: 5, kickoff: 11, url: 18, sentence: 29 } as const;
/** `where` is 0 at home, 1 away, 2 at a neutral site (the softball tournament rows, 21 October 2026). */
const TEAM = { result: 5, score: 6, where: 11, url: 13, name: 14 } as const;

export interface SchedulePage {
  url: string;
  /** Every game of the season, oldest first. */
  games: SportGame[];
  warnings: string[];
  /** Rows that are not games: a cancelled one keeps its row with the sentence blank. */
  skipped: number;
}

/** "@ 7p", "@ 6:30p", "@ 11a" → "19:00", "18:30", "11:00". */
function clockFromSentence(sentence: string): string | undefined {
  const m = sentence.match(/@\s*(\d{1,2})(?::(\d{2}))?\s*([ap])\b/i);
  if (!m) return undefined;
  const h = (Number(m[1]) % 12) + (m[3]!.toLowerCase() === 'p' ? 12 : 0);
  return `${String(h).padStart(2, '0')}:${m[2] ?? '00'}`;
}

export function parseSchedulePage(html: string, us: Team): SchedulePage {
  const page: SchedulePage = { url: us.url, games: [], warnings: [], skipped: 0 };
  const raw = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/)?.[1];
  if (!raw) {
    page.warnings.push('no __NEXT_DATA__ on the schedule page');
    return page;
  }
  let rows: unknown;
  try {
    rows = JSON.parse(raw).props?.pageProps?.contests;
  } catch {
    page.warnings.push('the schedule page’s __NEXT_DATA__ is not JSON');
    return page;
  }
  if (!Array.isArray(rows)) {
    page.warnings.push('no contests on the schedule page');
    return page;
  }
  for (const row of rows as unknown[][]) {
    const id = String(row[ROW.id] ?? '');
    const fail = (why: string) => page.warnings.push(`schedule row ${id || '?'}: ${why}`);
    const teams = row[ROW.teams];
    const url = row[ROW.url];
    const kickoff = row[ROW.kickoff];
    const sentence = row[ROW.sentence];
    // A cancelled or placeholder game keeps a row with no sentence, no
    // result and, once, a date in 1900. Not a game; counted, not read.
    if (row[ROW.hasResult] !== true && !sentence) {
      page.skipped++;
      continue;
    }
    if (!Array.isArray(teams) || teams.length !== 2 || typeof url !== 'string' || typeof kickoff !== 'string' || typeof sentence !== 'string') {
      fail(`not the shape this script reads: ${JSON.stringify(row).slice(0, 700)}`);
      continue;
    }
    const sides = (teams as unknown[][]).map((t) => ({
      name: String(t[TEAM.name] ?? ''),
      url: String(t[TEAM.url] ?? ''),
      away: t[TEAM.where] === 1,
      neutral: t[TEAM.where] === 2,
      result: t[TEAM.result] as 'W' | 'L' | 'T' | null,
      score: t[TEAM.score] as number | null,
    }));
    const mine = sides.find((t) => t.url.startsWith(us.url) || t.name === us.schoolName);
    const theirs = sides.find((t) => t !== mine);
    const date = dateFromUrl(url) ?? kickoff.slice(0, 10);
    if (!mine || !theirs || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      fail('could not tell the two teams apart');
      continue;
    }
    // The sentence's subject is the team named first; its "away"/"home" is
    // that team's, and its "won"/"lost" too.
    // "On 8/21, the Berthoud varsity football team won their away …", or
    // softball's "On Saturday, Oct 17, 2026, the Berthoud Varsity Girls
    // Softball team won their game against …".
    const subject = sentence.match(/^(?:On .*?, )?[Tt]he (.+?) [Vv]arsity /)?.[1];
    if (!subject) {
      fail(`the sentence is not in the form this script reads: "${sentence}"`);
      continue;
    }
    const subjectIsUs = subject === mine.name;
    const saidAway = /\b(away)\b/.test(sentence) ? true : /\b(home)\b/.test(sentence) ? false : undefined;
    const saidNeutral = /\bneutral\b/i.test(sentence);
    if (saidNeutral !== mine.neutral) {
      fail(`the sentence ${saidNeutral ? 'says' : 'does not say'} neutral site, the data ${mine.neutral ? 'does' : 'does not'}`);
      continue;
    }
    const site: SportGame['site'] = mine.neutral ? 'neutral' : mine.away ? 'away' : 'home';
    if (!mine.neutral && saidAway !== undefined && (subjectIsUs ? mine.away : !mine.away) !== saidAway) {
      fail(`the sentence puts ${mine.name} ${saidAway === subjectIsUs ? 'away' : 'at home'}, the data the other way`);
      continue;
    }
    const game: SportGame = { date, opponent: theirs.name, site, url };
    // A playoff or tournament game is at a neutral site, whichever side
    // MaxPreps files it on (the state softball opener was "home"). The
    // venue is MaxPreps's where it names one, or the sport's playoff site.
    const playoff = /\bplayoff\b/i.test(sentence);
    if (playoff || mine.neutral || /\btournament\b/i.test(sentence)) {
      game.neutral = true;
      game.site = 'neutral';
      const venue = typeof row[ROW.venue] === 'string' ? (row[ROW.venue] as string).trim() : '';
      if (playoff && us.playoffVenue) game.venue = us.playoffVenue;
      else if (venue) game.venue = venue;
    }
    if (row[ROW.hasResult] === true) {
      if (!mine.result || mine.score == null || theirs.score == null) {
        fail('played, but no score in the data');
        continue;
      }
      // Football's sentence puts the winner's score first, softball's the
      // subject's; the pair has to match either way round.
      const said = sentence.match(/by a score of (\d+)-(\d+)/);
      const tied = /\btied\b/i.test(sentence);
      const pair = said ? [Number(said[1]), Number(said[2])].sort((a, b) => b - a) : [];
      const [hi, lo] = [Math.max(mine.score, theirs.score), Math.min(mine.score, theirs.score)];
      const wordOk = tied ? mine.result === 'T' : subjectIsUs ? (mine.result === 'W') === /\bwon\b/.test(sentence) : (mine.result === 'W') === /\blost\b/.test(sentence);
      if (!said || pair[0] !== hi || pair[1] !== lo || !wordOk) {
        fail(`the sentence says "${sentence}", the data ${mine.result} ${mine.score}-${theirs.score}`);
        continue;
      }
      game.result = mine.result;
      game.score = { us: mine.score, them: theirs.score };
    } else {
      // The kickoff field, unless the sentence names a different hour or
      // says the time is to be announced; a midnight kickoff is no time.
      const said = clockFromSentence(sentence);
      const time = kickoff.slice(11, 16);
      if (said && said !== time) {
        fail(`the sentence says ${said}, the data ${time}`);
        continue;
      }
      if (!/\bTBA\b/i.test(sentence) && time !== '00:00') game.time = time;
    }
    page.games.push(game);
  }
  page.games.sort((a, b) => a.date.localeCompare(b.date));
  return page;
}

/**
 * The schedule page's games in place of the home page's: the results in
 * full, and the games to come for the cross-check. Only where the two
 * agree on every game the home page does report; a score that differs
 * between them is not a page to trust, and the home page's shorter list
 * stays. Returns what stopped it, or nothing.
 */
export function applySchedule(page: TeamPage, schedule: SchedulePage): string | undefined {
  if (schedule.warnings.length) return schedule.warnings.join('; ');
  if (!schedule.games.length) return 'the schedule page lists no games';
  for (const known of [...page.results, ...page.glance]) {
    const g = schedule.games.find((x) => x.url === known.url);
    if (!g) return `the schedule page has no ${known.date} ${known.opponent}`;
    if (known.score && (!g.score || g.score.us !== known.score.us || g.score.them !== known.score.them)) return `scores differ for ${known.date} ${known.opponent}`;
    // The home page's data names a neutral site outright; the schedule's
    // rows only say which side was away, so its word on the site wins,
    // except for a game the schedule knows to be a playoff or tournament.
    if (!g.neutral) g.site = known.site;
  }
  page.results = schedule.games.filter((g) => g.result || g.place).sort((a, b) => b.date.localeCompare(a.date));
  page.schedule = schedule.games;
  return undefined;
}
