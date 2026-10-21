/**
 * A school's own calendar on a Finalsite site (Berthoud High's bhs.tsd.org
 * was the first), read a month at a time, for the games the school says it
 * is playing. The URL is the town's `calendar.url` in
 * src/config/school-sports.ts.
 *
 * The month grid at <url>?cal_date=YYYY-MM-01 lists each event
 * once as a link whose title is the school's own line ("Boys Varsity
 * Football @ Mountain View High School - FR") and whose `data-occur-id`
 * carries the start and end as UTC instants. That is date, time, team and
 * opponent, which is all the cross-check needs. The site's robots.txt allows
 * the page and asks for five seconds between requests; its iCal export under
 * /fs/ it disallows, so that is not used.
 */
import { execFile } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';
import { promisify } from 'node:util';
import { toIsoLocal } from '../../src/lib/dates.ts';
import { isAllowed } from './robots.ts';
import { robotsFor, TIMEOUT, UA } from './probe.ts';

const run = promisify(execFile);
/** Before the one retry after no response. */
const RETRY_MS = 3000;

export interface CalendarEvent {
  gender?: 'Boys' | 'Girls';
  level?: string;
  sport: string;
  /** "vs" is a home game, "@" is away; a meet or tournament has neither. */
  where?: 'vs' | '@';
  opponent?: string;
  /** The school's full title, for the summary. */
  title: string;
  /** Denver wall clock. */
  date: string;
  time: string;
}

/** Five seconds between requests, as the site's robots.txt asks. */
export const CRAWL_DELAY_MS = 5000;

export async function fetchMonth(calendarUrl: string, firstOfMonth: string): Promise<{ ok: true; html: string } | { ok: false; reason: string }> {
  const url = `${calendarUrl}?cal_date=${firstOfMonth}`;
  const { origin, pathname, search } = new URL(url);
  const rules = await robotsFor(origin);
  if (!isAllowed(rules, pathname + search)) return { ok: false, reason: 'robots.txt asks automated clients not to fetch it' };
  const args = ['-sS', '-L', '--max-time', String(TIMEOUT), '-A', UA, '-H', 'Accept: text/html', '-w', '\n%{http_code}', url];
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
      return { ok: false, reason: `HTTP ${code}` };
    } catch (e) {
      const err = e as Error & { stderr?: string };
      const said = (err.stderr ?? '').trim().split('\n').at(-1) || err.message.split('\n')[0];
      last = { ok: false, reason: `no response (${said})` };
    }
  }
  return last;
}

const LEVELS = ['Varsity', 'JV', 'C-Team', 'C Team', 'Freshman', 'Frosh'];

/** "Boys Varsity Football @ Mountain View High School - FR" into its parts. */
export function parseTitle(title: string): Pick<CalendarEvent, 'gender' | 'level' | 'sport' | 'where' | 'opponent'> {
  let rest = title.replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
  // The site appends a field or venue code: " - FR", " - WHS", " - .".
  rest = rest.replace(/\s+-\s+\S*$/, '');
  let gender: CalendarEvent['gender'];
  const g = rest.match(/^(Boys|Girls)\s+/);
  if (g) {
    gender = g[1] as CalendarEvent['gender'];
    rest = rest.slice(g[0].length);
  }
  let level: string | undefined;
  for (const l of LEVELS) {
    if (rest.startsWith(`${l} `)) {
      level = l === 'C Team' ? 'C-Team' : l;
      rest = rest.slice(l.length + 1);
      break;
    }
  }
  const m = rest.match(/^(.+?)\s+(vs\.?|@)\s+(.+)$/);
  if (!m) return { gender, level, sport: rest };
  return { gender, level, sport: m[1]!, where: m[2]!.startsWith('vs') ? 'vs' : '@', opponent: m[3]!.trim() };
}

/** Every event link on a month page. */
export function parseMonth(html: string): CalendarEvent[] {
  const events: CalendarEvent[] = [];
  const seen = new Set<string>();
  const re = /<a class="fsCalendarTitle fsCalendarEventLink" title="([^"]*)" data-occur-id="(\d+)_(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z)_[^"]*"/g;
  for (const m of html.matchAll(re)) {
    const [, title, id, startUtc] = m;
    const key = `${id}_${startUtc}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const local = toIsoLocal(new Date(startUtc!));
    events.push({ ...parseTitle(title!), title: title!.replace(/&amp;/g, '&'), date: local.slice(0, 10), time: local.slice(11, 16) });
  }
  return events;
}
