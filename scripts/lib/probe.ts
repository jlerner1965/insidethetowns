/**
 * Asking the live web whether a page is still there, the way the link checker
 * and the source check both need to: with curl (it honours HTTPS_PROXY,
 * system CA bundles and redirect quirks identically everywhere this runs),
 * identifying honestly, and reading each site's robots.txt before the first
 * request there.
 *
 * Shared so there is one verdict table. A 200 from a different host is
 * "moved", not "ok", because that is what a lapsed domain bought by a casino
 * looks like; a 403 is nearly always a bot challenge, not a dead page.
 */
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { isAllowed, NO_RULES, parseRobots, STAY_OUT, type RobotsRules } from './robots.ts';

const run = promisify(execFile);

/**
 * Identify honestly. It costs a few more bot challenges than pretending to be
 * Chrome would, and those are reported as challenges rather than failures, so
 * the cost is nearly nothing. A publisher that lies about who is knocking has
 * no business lecturing anyone about credibility.
 */
export const UA = 'InsideTheTowns-linkcheck/1.0 (+https://insidethetowns.com/editorial/)';
/** The product token in UA: the name a robots.txt group would address us by. */
export const TOKEN = UA.split('/')[0]!;
export const TIMEOUT = 25;

export function hostOf(url: string): string | null {
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}

export async function curl(url: string, method: 'HEAD' | 'GET'): Promise<{ code: string; headers: string; landed: string }> {
  const args = [
    '-sS', '-L', '--max-time', String(TIMEOUT), '-A', UA,
    '-H', 'Accept: text/html,application/xhtml+xml,text/calendar,application/rss+xml,application/atom+xml,*/*',
    '-o', '/dev/null',
    '-D', '-', '-w', '\n%{http_code} %{url_effective}', url,
  ];
  if (method === 'HEAD') args.unshift('-I');
  try {
    const { stdout } = await run('curl', args, { maxBuffer: 8 << 20 });
    const nl = stdout.lastIndexOf('\n');
    const [code = '000', landed = url] = stdout.slice(nl + 1).trim().split(' ', 2);
    return { code, headers: stdout.slice(0, nl), landed };
  } catch {
    return { code: '000', headers: '', landed: url };
  }
}

export type Verdict = 'ok' | 'moved' | 'gone' | 'blocked' | 'unreachable' | 'skipped';
export interface Probe {
  verdict: Verdict;
  code: string;
  note: string;
}

/**
 * A 200 from a different site is not a working link. A restaurant's lapsed
 * domain was bought by an online casino, and for weeks the guide linked to it
 * twice as the business's own page, with every check reporting it fine
 * because the casino answered 200. The host the link lands on is compared
 * with the host it names; a redirect within a site (http to https, a moved
 * page) is still ok, and a change of host is reported for a person to look
 * at, since it is sometimes a rebrand and sometimes a hijack.
 */
export function hostChanged(from: string, to: string): boolean {
  const a = hostOf(from)?.replace(/^www\./, '');
  const b = hostOf(to)?.replace(/^www\./, '');
  return !!a && !!b && a !== b;
}

export async function check(url: string): Promise<Probe> {
  // HEAD first — cheaper for them and for us. Plenty of servers refuse it, so
  // anything that is not a clean 2xx gets a real GET before we believe it.
  let { code, headers, landed } = await curl(url, 'HEAD');
  if (!/^2/.test(code)) ({ code, headers, landed } = await curl(url, 'GET'));
  if (code === '000') ({ code, headers, landed } = await curl(url, 'GET'));

  const challenged = /cf-mitigated:/i.test(headers);
  if (/^2/.test(code) && hostChanged(url, landed)) return { verdict: 'moved', code, note: `now lands on ${hostOf(landed)}` };
  if (/^2/.test(code)) return { verdict: 'ok', code, note: '' };
  if (code === '404' || code === '410') return { verdict: 'gone', code, note: '' };
  if (code === '403' || code === '429' || code === '503') {
    return { verdict: 'blocked', code, note: challenged ? 'Cloudflare bot challenge' : 'refused an automated request' };
  }
  if (code === '000') return { verdict: 'unreachable', code, note: 'no response — DNS, TLS or timeout' };
  return { verdict: 'blocked', code, note: 'unexpected status' };
}

/** The probe, after robots.txt: skipped, with the reason, where the site asks us not to. */
export async function probe(url: string): Promise<Probe> {
  const { origin, pathname, search } = new URL(url);
  const rules = await robotsFor(origin);
  return isAllowed(rules, pathname + search)
    ? check(url)
    : { verdict: 'skipped', code: '', note: 'robots.txt asks automated clients not to fetch it' };
}

/**
 * One robots.txt per origin, read before the first link there. RFC 9309 on a
 * robots.txt that cannot be read: a 4xx means there are no rules, a 5xx means
 * stay out. No response at all is read as no rules, departing from the RFC on
 * purpose: the check that follows costs a dead server nothing, and a domain
 * that has stopped answering is exactly what this script exists to find.
 */
const robots = new Map<string, Promise<RobotsRules>>();

export function robotsFor(origin: string): Promise<RobotsRules> {
  if (!robots.has(origin)) robots.set(origin, readRobots(origin));
  return robots.get(origin)!;
}

async function readRobots(origin: string): Promise<RobotsRules> {
  const args = ['-sS', '-L', '--max-time', String(TIMEOUT), '-A', UA, '-w', '\n%{http_code}', `${origin}/robots.txt`];
  let code = '000';
  let body = '';
  // A 5xx or no response gets one more try: either can be a blip at our end.
  for (let attempt = 0; attempt < 2 && (code === '000' || /^5/.test(code)); attempt++) {
    try {
      const { stdout } = await run('curl', args, { maxBuffer: 8 << 20 });
      const nl = stdout.lastIndexOf('\n');
      [code, body] = [stdout.slice(nl + 1).trim(), stdout.slice(0, nl)];
    } catch {
      code = '000';
    }
  }
  if (/^2/.test(code)) return parseRobots(body, TOKEN);
  if (/^5/.test(code)) {
    process.stderr.write(`  ${origin}/robots.txt answered ${code}, which RFC 9309 reads as stay out\n`);
    return STAY_OUT;
  }
  return NO_RULES;
}
