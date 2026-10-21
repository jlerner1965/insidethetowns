/**
 * Berthoud High School (the Spartans) on MaxPreps: one sport's team home page
 * fetched and read, no browser and no model, so the sports page on Inside
 * Berthoud can show a record, the last result and the next game.
 *
 * Step 1 of the sports plan is this script run from GitHub Actions: does
 * MaxPreps answer an honest automated request from a runner, and does the
 * parse find what the page shows a reader? Only the team home page is read
 * (the /schedule/ page is bot-blocked and is not tried); robots.txt is read
 * first, the way scripts/lib/probe.ts does for every other site.
 *
 * What is read: the page is a Next.js render and carries its data in a
 * `__NEXT_DATA__` script: the season's standings (overall and league
 * record, the league's name and the team's place in it), the "Schedule at a
 * Glance" card (the last game and the next two), and one "Game Results" post
 * per game played, with both scores and who was at home. The records in the
 * visible text are read too and compared, so a page whose markup changed
 * under us is reported rather than trusted.
 *
 *   node scripts/sports-maxpreps.ts --sport=football          # fetch, parse, print
 *   node scripts/sports-maxpreps.ts --sport=football --dump   # also print the raw blocks
 *   node scripts/sports-maxpreps.ts --html=page.html          # parse a saved page instead of fetching
 *   node scripts/sports-maxpreps.ts --sport=football --json   # the parse as JSON on stdout
 *
 * Exit 0 when the page came back and the parse found the records and the
 * schedule; 2 when the fetch was refused or failed; 3 when the page came back
 * but the parse did not recognise it.
 */
import { execFile } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { promisify } from 'node:util';
import { isAllowed } from './lib/robots.ts';
import { robotsFor, UA, TIMEOUT } from './lib/probe.ts';

const run = promisify(execFile);

export const TEAM_HOME = 'https://www.maxpreps.com/co/berthoud/berthoud-spartans/';

export interface Game {
  /** The game's day, Denver wall clock, "2026-10-23". */
  date: string;
  /** Kickoff, "19:00", when MaxPreps has one and the game is still to come. */
  time?: string;
  opponent: string;
  /** Where Berthoud plays: at home, away, or on a neutral field. */
  site: 'home' | 'away' | 'neutral';
  /** Set once the game has a result. */
  result?: 'W' | 'L' | 'T';
  score?: { us: number; them: number };
  /** The game's page on MaxPreps. */
  url: string;
}

export interface TeamPage {
  sport: string;
  url: string;
  overall?: string;
  league?: { record: string; name: string; place?: string };
  /** When MaxPreps last touched the schedule or the standings, as it states it (GMT). */
  updatedOn?: string;
  /** The "Schedule at a Glance" card: the last result and the next games, in order. */
  glance: Game[];
  /** Every game played this season that the page reports, newest first. */
  results: Game[];
  /** What did not add up: a cross-check that failed, a block that was missing. */
  warnings: string[];
}

export async function fetchPage(url: string): Promise<{ code: string; html: string }> {
  const { origin, pathname } = new URL(url);
  const rules = await robotsFor(origin);
  if (!isAllowed(rules, pathname)) return { code: 'robots', html: '' };
  const args = [
    '-sS', '-L', '--max-time', String(TIMEOUT), '-A', UA,
    '-H', 'Accept: text/html,application/xhtml+xml,*/*;q=0.8',
    '-H', 'Accept-Language: en-US,en;q=0.9',
    '-w', '\n%{http_code}', url,
  ];
  try {
    const { stdout } = await run('curl', args, { maxBuffer: 32 << 20 });
    const nl = stdout.lastIndexOf('\n');
    return { code: stdout.slice(nl + 1).trim(), html: stdout.slice(0, nl) };
  } catch (e) {
    return { code: '000', html: String((e as Error).message) };
  }
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
  teamCanonicalUrl: string;
}
interface MpContest {
  contestId: string;
  hasResult: boolean;
  canonicalUrl: string;
  /** Kickoff, local wall clock, for a game to come; the score's entry time once played. */
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

function site(homeAwayType: number): Game['site'] {
  return homeAwayType === 0 ? 'home' : homeAwayType === 1 ? 'away' : 'neutral';
}

/** The game's own day from its page URL (…/10-15-2026/…): the one date MaxPreps never shifts into GMT. */
function dateFromUrl(url: string): string | undefined {
  const m = url.match(/\/(\d{1,2})-(\d{1,2})-(\d{4})\//);
  return m ? `${m[3]}-${m[1]!.padStart(2, '0')}-${m[2]!.padStart(2, '0')}` : undefined;
}

function toGame(c: MpContest, us: string, kickoff?: string): Game | undefined {
  const mine = c.teams.find((t) => t.teamCanonicalUrl?.startsWith(us) || t.schoolName === 'Berthoud');
  const theirs = c.teams.find((t) => t !== mine);
  // A played game's `timestamp` is when the score went in, in GMT; the day is in its URL.
  const date = dateFromUrl(c.canonicalUrl) ?? (c.hasResult ? kickoff : c.timestamp)?.slice(0, 10);
  if (!mine || !theirs || !date) return undefined;
  const game: Game = { date, opponent: theirs.schoolName, site: site(c.homeAwayType), url: c.canonicalUrl.split('?')[0]! };
  if (c.hasResult && mine.result && mine.score != null && theirs.score != null) {
    game.result = mine.result;
    game.score = { us: mine.score, them: theirs.score };
  } else if (!c.isTimeTba && c.timestamp?.length >= 16) {
    game.time = c.timestamp.slice(11, 16);
  }
  return game;
}

export function parseTeamPage(html: string, sport: string): TeamPage {
  const url = `${TEAM_HOME}${sport}/`;
  const page: TeamPage = { sport, url, glance: [], results: [], warnings: [] };

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
  if (!glance.length) page.warnings.push('no "Schedule at a Glance" card');
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
    if (g?.result) page.results.push(g);
  }
  page.results.sort((a, b) => b.date.localeCompare(a.date));

  // The glance card's played games must be among the results, with the same score.
  for (const g of page.glance.filter((x) => x.result)) {
    const r = page.results.find((x) => x.date === g.date && x.opponent === g.opponent);
    if (!r) page.warnings.push(`the glance card's ${g.date} ${g.opponent} result is not among the Game Results posts`);
    else if (r.score!.us !== g.score!.us || r.score!.them !== g.score!.them) page.warnings.push(`scores differ for ${g.date} ${g.opponent}`);
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

function line(g: Game): string {
  const where = g.site === 'home' ? 'vs' : g.site === 'away' ? '@ ' : 'n ';
  const tail = g.result ? `${g.result} ${g.score!.us}-${g.score!.them}` : g.time ?? 'time TBA';
  return `${g.date}  ${where} ${g.opponent}  ${tail}`;
}

async function main() {
  const args = new Map(process.argv.slice(2).map((a) => a.replace(/^--/, '').split('=') as [string, string]));
  const sport = args.get('sport') ?? 'football';
  const url = `${TEAM_HOME}${sport}/`;
  const say = (s: string) => { if (!args.has('json')) console.log(s); };

  let html: string;
  const saved = args.get('html');
  if (saved) {
    html = readFileSync(saved, 'utf8');
    say(`Parsing ${saved} (${html.length} bytes)`);
  } else {
    say(`Fetching ${url} as ${UA}`);
    const res = await fetchPage(url);
    if (res.code === 'robots') {
      say('robots.txt asks automated clients not to fetch it; stopping.');
      process.exit(2);
    }
    say(`HTTP ${res.code}, ${res.html.length} bytes`);
    if (!/^2/.test(res.code)) {
      say('Fetch refused or failed. The body, as text:');
      say(visibleText(res.html).slice(0, 600));
      process.exit(2);
    }
    html = res.html;
    if (args.get('save')) writeFileSync(args.get('save')!, html);
  }

  const page = parseTeamPage(html, sport);
  if (args.has('json')) {
    console.log(JSON.stringify(page, null, 2));
  } else {
    console.log(`\nOverall ${page.overall ?? '(not found)'}; ${page.league ? `${page.league.name} ${page.league.record}${page.league.place ? ` (${page.league.place})` : ''}` : 'no league record'}; MaxPreps updated ${page.updatedOn ?? '(unknown)'}`);
    console.log(`\nSchedule at a Glance (${page.glance.length}):`);
    for (const g of page.glance) console.log(`  ${line(g)}`);
    console.log(`\nResults (${page.results.length}):`);
    for (const g of page.results) console.log(`  ${line(g)}`);
    console.log(page.warnings.length ? `\nWarnings:\n${page.warnings.map((w) => `  - ${w}`).join('\n')}` : '\nNo warnings: the data and the visible page agree.');
  }

  if (args.has('dump')) {
    const text = visibleText(html);
    const at = (re: RegExp, n: number) => { const i = text.search(re); return i < 0 ? `(no ${re})` : text.slice(Math.max(0, i - 200), i + n); };
    console.log('\n--- visible text around "Overall" ---\n' + at(/\bOverall\b/, 300));
    console.log('\n--- visible text from "Schedule at a Glance" ---\n' + at(/Schedule at a Glance/i, 600));
  }

  const ok = !!page.overall && page.glance.length > 0;
  say(ok ? '\nParse: ok' : '\nParse: the records or the schedule were not found.');
  process.exit(ok ? 0 : 3);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
