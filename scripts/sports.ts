/**
 * Berthoud High sports for Inside Berthoud's /sports/ page: each followed
 * team's MaxPreps home page read, the games to come checked against the
 * school's own calendar, and the data file written.
 *
 *   npm run sports                       # read everything, print what would change, write nothing
 *   npm run sports -- --write            # write data/berthoud/sports.json
 *   npm run sports -- --write --summary=/tmp/sports.md   # and the run summary, for the workflow
 *   npm run sports -- --sport=football   # one team's page, read and printed (the step-1 probe)
 *   npm run sports -- --sport=football --html=page.html  # the same from a saved page
 *   npm run sports -- --sport=football --save=page.html  # and keep the page
 *   npm run sports -- --calendar         # one month of the school calendar, read and counted
 *
 * The rules (src/config/berthoud-sports.ts has the teams and the data's shape):
 * - A team whose fetch or parse fails keeps its previous entry, its
 *   `fetched` date included, and the summary says so. Nothing guessed or
 *   partial is written in its place.
 * - A game to come is published only where the school calendar agrees or
 *   says nothing; a disagreement on the day, time or opponent holds the game
 *   off the page and names it in the summary (scripts/lib/sports-crosscheck.ts).
 * - If the school calendar cannot be read at all, no game is held and the
 *   summary says the check did not run.
 * - Requests are spaced: MaxPreps a few seconds apart, the school calendar
 *   five (its robots.txt's crawl-delay).
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { setTimeout as sleep } from 'node:timers/promises';
import { SCHOOL_SPORTS, schoolSportsFor, sportsDataFile, type SchoolSports, type SportsData } from '../src/config/school-sports.ts';
import { dayKey } from '../src/lib/dates.ts';
import { CRAWL_DELAY_MS, fetchMonth, parseMonth, type CalendarEvent } from './lib/finalsite-calendar.ts';
import { fetchPage, parseTeamPage, usable, visibleText, type TeamPage } from './lib/maxpreps.ts';
import { crossCheck, emptyEntry, entryFrom, gamesToCome, keepPrevious } from './lib/sports-crosscheck.ts';

const MAXPREPS_PAUSE_MS = 4000;

const args = new Map(process.argv.slice(2).map((a) => a.replace(/^--/, '').split('=') as [string, string]));

function describe(page: TeamPage): string {
  const line = (g: TeamPage['glance'][number]) => {
    const where = g.site === 'home' ? 'vs' : g.site === 'away' ? '@ ' : 'n ';
    const tail = g.result ? `${g.result} ${g.score!.us}-${g.score!.them}` : g.place ? g.place : (g.time ?? 'time TBA');
    return `  ${g.date}  ${where} ${g.opponent}  ${tail}`;
  };
  return [
    `Overall ${page.overall ?? '(not found)'}; ${page.league ? `${page.league.name} ${page.league.record}${page.league.place ? ` (${page.league.place})` : ''}` : 'no league record'}; MaxPreps updated ${page.updatedOn ?? '(unknown)'}`,
    `Schedule at a Glance (${page.glance.length}):`,
    ...page.glance.map(line),
    `Results (${page.results.length}):`,
    ...page.results.map(line),
    page.warnings.length ? `Warnings:\n${page.warnings.map((w) => `  - ${w}`).join('\n')}` : 'No warnings: the data and the visible page agree.',
  ].join('\n');
}

/** One team's page, read and printed: the probe, for checking a path or a saved page. */
async function probe(school: SchoolSports, sport: string): Promise<number> {
  const url = `${school.maxpreps}${sport}/`;
  let html: string;
  if (args.has('html')) {
    html = readFileSync(args.get('html')!, 'utf8');
    console.log(`Parsing ${args.get('html')} (${html.length} bytes)`);
  } else {
    console.log(`Fetching ${url}`);
    const res = await fetchPage(url);
    if (!res.ok) {
      console.log(`Fetch failed: ${res.reason}`);
      if (res.html) console.log(visibleText(res.html).slice(0, 400));
      return 2;
    }
    html = res.html;
    console.log(`HTTP 200, ${html.length} bytes`);
    if (args.has('save')) writeFileSync(args.get('save')!, html);
  }
  const page = parseTeamPage(html, { url, schoolName: school.maxprepsName });
  console.log(describe(page));
  if (!usable(page) && !page.noSchedule) {
    // What the page carries instead, for working out what to read.
    const raw = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/)?.[1];
    if (raw) {
      try {
        const pp = JSON.parse(raw).props?.pageProps ?? {};
        console.log(`pageProps keys: ${Object.keys(pp).join(', ')}`);
        console.log(`wallCards keys: ${Object.keys(pp.wallCards ?? {}).join(', ')}`);
        for (const [k, v] of Object.entries<any>(pp.wallCards ?? {})) if (v?.data) console.log(`  ${k}: ${JSON.stringify(v.data).slice(0, 800)}`);
        console.log(`wall posts: ${(pp.wallPosts ?? []).map((p: any) => `${p.title} | ${String(p.text).slice(0, 100)}`).join('\n  ')}`);
        console.log(`standings: ${JSON.stringify(pp.teamContext?.standingsData)}`);
      } catch {
        console.log('__NEXT_DATA__ is not JSON');
      }
    }
  }
  if (page.noSchedule) console.log('\nParse: ok, but MaxPreps lists no schedule for this team.');
  else console.log(usable(page) ? '\nParse: ok' : '\nParse: the records or the schedule were not found.');
  return usable(page) || page.noSchedule ? 0 : 3;
}

/** The current month and the next, which is as far as the glance card looks. */
function monthsToRead(today: string): string[] {
  const [y, m] = today.split('-').map(Number) as [number, number];
  const next = m === 12 ? `${y + 1}-01-01` : `${y}-${String(m + 1).padStart(2, '0')}-01`;
  return [`${y}-${String(m).padStart(2, '0')}-01`, next];
}

/** One month of the school calendar, read and counted: for checking the site answers a runner. */
async function probeCalendar(school: SchoolSports): Promise<number> {
  if (!school.calendar) {
    console.log(`${school.school} has no calendar this script may read. ${school.calendarNote ?? ''}`);
    return 2;
  }
  const month = monthsToRead(dayKey(new Date()))[0]!;
  const started = Date.now();
  const res = await fetchMonth(school.calendar.url, month);
  const took = `${((Date.now() - started) / 1000).toFixed(1)}s`;
  if (!res.ok) {
    console.log(`School calendar, ${month.slice(0, 7)}: failed after ${took}: ${res.reason}`);
    return 2;
  }
  const events = parseMonth(res.html);
  console.log(`School calendar, ${month.slice(0, 7)}: ${res.html.length} bytes in ${took}, ${events.length} events, ${events.filter((e) => e.level === 'Varsity').length} varsity.`);
  for (const e of events.filter((e) => e.level === 'Varsity').slice(0, 12)) console.log(`  ${e.date} ${e.time}  ${e.title}`);
  return events.length ? 0 : 3;
}

/** One town: its calendar, its teams, its file. The report for the summary comes back. */
async function runTown(school: SchoolSports): Promise<string> {
  const DATA_FILE = sportsDataFile(school.town);
  const now = new Date();
  const today = dayKey(now);
  const previous: SportsData | undefined = existsSync(DATA_FILE) ? JSON.parse(readFileSync(DATA_FILE, 'utf8')) : undefined;
  const summary: string[] = [];
  const flags: string[] = [];
  console.log(`\n${school.school} (${school.town})`);

  // The school calendar first: two month pages, five seconds apart.
  let calendar: CalendarEvent[] | undefined = [];
  if (!school.calendar) {
    calendar = undefined;
    flags.push(`No school calendar to check against: ${school.calendarNote ?? 'none is configured'}`);
  }
  for (const month of calendar ? monthsToRead(today) : []) {
    if (!calendar) break;
    const res = await fetchMonth(school.calendar!.url, month);
    if (!res.ok) {
      flags.push(`The school calendar's ${month.slice(0, 7)} page could not be read (${res.reason}); upcoming games were not checked against it.`);
      calendar = undefined;
      break;
    }
    const events = parseMonth(res.html);
    if (!events.length) {
      flags.push(`The school calendar's ${month.slice(0, 7)} page had no events in the form this script reads; upcoming games were not checked against it.`);
      calendar = undefined;
      break;
    }
    calendar.push(...events);
    await sleep(CRAWL_DELAY_MS);
  }
  if (calendar) console.log(`School calendar: ${calendar.length} events read for ${monthsToRead(today).map((m) => m.slice(0, 7)).join(' and ')}.`);

  const data: SportsData = { generated: now.toISOString(), sports: [] };
  for (const [i, sport] of school.teams.entries()) {
    if (i > 0) await sleep(MAXPREPS_PAUSE_MS);
    const url = `${school.maxpreps}${sport.maxpreps}/`;
    const res = await fetchPage(url);
    const old = keepPrevious(sport, previous, school.maxpreps);
    const was = old.fetched ? `the entry from ${old.fetched.slice(0, 10)} stays` : 'there is no earlier entry, so the page shows nothing for it';
    if (!res.ok) {
      flags.push(`**${sport.name}**: MaxPreps could not be read (${res.reason}); ${was}.`);
      data.sports.push(old);
      console.log(`${sport.name}: fetch failed (${res.reason}); kept previous.`);
      continue;
    }
    const page = parseTeamPage(res.html, { url, schoolName: school.maxprepsName });
    if (page.noSchedule) {
      data.sports.push(emptyEntry(sport, page, now.toISOString()));
      summary.push(`| ${sport.name} | — | — | — | — | — |`);
      flags.push(`${sport.name}: MaxPreps lists no schedule or results for this team; the card says so.`);
      console.log(`${sport.name}: MaxPreps has nothing for this team.`);
      continue;
    }
    if (!usable(page)) {
      flags.push(`**${sport.name}**: the MaxPreps page came back but could not be read (${page.warnings.join('; ')}); ${was}.`);
      data.sports.push(old);
      console.log(`${sport.name}: parse failed; kept previous.`);
      continue;
    }
    const toCome = gamesToCome(page, today);
    const check = calendar
      ? crossCheck(sport, toCome, calendar)
      : { upcoming: toCome, held: [], notes: [school.calendar ? 'the school calendar was not read, so nothing was checked against it' : 'no school calendar to check against'] };
    const entry = entryFrom(sport, page, check, now.toISOString());
    data.sports.push(entry);
    const last = entry.results[0];
    summary.push(
      `| ${sport.name} | ${entry.overall ?? '—'} | ${entry.league ? `${entry.league.record} ${entry.league.name}` : '—'} | ${last ? `${last.result ?? last.place ?? ''} ${last.score ? `${last.score.us}-${last.score.them} ` : ''}${last.site === 'home' ? 'vs' : 'at'} ${last.opponent}, ${last.date}` : '—'} | ${entry.upcoming[0] ? `${entry.upcoming[0].date} ${entry.upcoming[0].site === 'home' ? 'vs' : 'at'} ${entry.upcoming[0].opponent}` : '—'} | ${entry.held.length} |`,
    );
    for (const h of entry.held) flags.push(`**${sport.name}**, held: ${h.reason}`);
    for (const n of entry.notes) flags.push(`${sport.name}: ${n}`);
    console.log(`${sport.name}: ${entry.overall}, ${entry.results.length} results, ${entry.upcoming.length} upcoming, ${entry.held.length} held.`);
  }

  const report = [
    `## ${school.school} (${school.town})`,
    '',
    `Read ${data.generated.slice(0, 16).replace('T', ' ')} UTC. Nothing a run cannot confirm is written: a team whose page fails keeps its last good entry and date.`,
    '',
    '| Team | Overall | League | Last result | Next game | Held |',
    '|---|---|---|---|---|---|',
    ...summary,
    '',
    flags.length ? `### Flagged\n\n${flags.map((f) => `- ${f}`).join('\n')}` : 'Nothing flagged: every page was read and the school calendar agreed with every game to come.',
    '',
  ].join('\n');
  console.log(`\n${report}`);

  if (args.has('write')) {
    mkdirSync(dirname(DATA_FILE), { recursive: true });
    writeFileSync(DATA_FILE, `${JSON.stringify(data, null, 2)}\n`);
    console.log(`Wrote ${DATA_FILE}.`);
  } else {
    console.log(`Dry run: ${DATA_FILE} not written (pass --write).`);
  }
  return report;
}

async function main(): Promise<number> {
  const townArg = args.get('town');
  const schools = townArg ? [schoolSportsFor(townArg)].filter((s): s is SchoolSports => !!s) : SCHOOL_SPORTS;
  if (townArg && !schools.length) {
    console.error(`No school is configured for "${townArg}" (src/config/school-sports.ts).`);
    return 1;
  }
  if (args.has('sport')) return probe(schools[0]!, args.get('sport')!);
  if (args.has('calendar')) return probeCalendar(schools[0]!);

  const reports: string[] = [];
  for (const [i, school] of schools.entries()) {
    if (i > 0) await sleep(MAXPREPS_PAUSE_MS);
    reports.push(await runTown(school));
  }
  if (args.has('summary')) writeFileSync(args.get('summary')!, reports.join('\n'));
  return 0;
}

main().then(
  (code) => process.exit(code),
  (e) => {
    console.error(e);
    process.exit(1);
  },
);
