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
 * Only the team home page is read: the /schedule/ page is bot-blocked and is
 * not tried. robots.txt is read first, as for every other site, and the
 * request identifies honestly (scripts/lib/probe.ts). MaxPreps refuses a
 * request that pretends to be a browser and, after a handful of requests,
 * one from a cloud address; the honest one from a GitHub runner was answered
 * (run 39629133155, 21 October 2026).
 */
import { execFile } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';
import { promisify } from 'node:util';
import { MAXPREPS_TEAM_HOME, type SportGame } from '../../src/config/berthoud-sports.ts';
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

function toGame(c: MpContest, us: string, kickoff?: string): SportGame | undefined {
  const mine = c.teams?.find((t) => t.teamCanonicalUrl?.startsWith(us) || t.schoolName === 'Berthoud');
  const theirs = c.teams?.find((t) => t !== mine);
  const date = dateFromUrl(c.canonicalUrl ?? '') ?? (c.hasResult ? kickoff : c.timestamp)?.slice(0, 10);
  if (!mine || !date || !c.canonicalUrl) return undefined;
  // A meet has no single opponent; MaxPreps names the event in the URL.
  const opponent = theirs?.schoolName ?? c.canonicalUrl.match(/\/game\/([^/]+)\//)?.[1]?.replace(/-/g, ' ') ?? 'meet';
  const game: SportGame = { date, opponent, site: site(c.homeAwayType), url: c.canonicalUrl.split('?')[0]! };
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

export function parseTeamPage(html: string, sport: string): TeamPage {
  const url = `${MAXPREPS_TEAM_HOME}${sport}/`;
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
    const g = toGame(c, url);
    if (g) page.glance.push(g);
    else page.warnings.push(`a game in the glance card could not be read (${c.contestId})`);
  }

  const posts: MpPost[] = pp?.wallPosts ?? [];
  const seen = new Set<string>();
  for (const p of posts) {
    if (p.title !== 'Game Results' || !p.data?.contestId || seen.has(p.data.contestId)) continue;
    seen.add(p.data.contestId);
    const g = toGame(p.data as MpContest, url, p.timeStamp);
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
