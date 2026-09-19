#!/usr/bin/env node
/**
 * Checks every external link in the content against the live web.
 *
 *   npm run check-links            every link
 *   npm run check-links -- niwot   one town
 *
 * A guide is a promise that the links work. They rot quietly: a café
 * redesigns, a town moves a department page, a festival lets its domain go,
 * and nothing in the build notices because the link is still perfectly valid
 * HTML. Only asking the other end finds it.
 *
 * Deliberately NOT part of `npm run build` or the validator. Those must stay
 * offline, fast and deterministic; this one is slow, needs the network, and
 * depends on hundreds of servers we do not control. It also puts a request on
 * every small business in the network, which is fine occasionally and rude
 * daily.
 *
 * Exit code is 1 only for links that are definitely gone (404/410). A 403 is
 * almost always a bot challenge rather than a dead page, and a timeout is
 * usually our end, so both are reported and neither fails the run — a check
 * that cries wolf gets ignored, and then the real 404 gets ignored with it.
 *
 * Uses curl rather than fetch: it honours HTTPS_PROXY, system CA bundles and
 * redirect quirks identically everywhere this might run.
 */
import { execFile } from 'node:child_process';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import { allTowns, LIVE_TOWNS } from '../src/config/index.ts';
import { hub } from '../src/config/towns/hub.ts';

const run = promisify(execFile);
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const only = process.argv.slice(2).filter((a) => !a.startsWith('-'));

/**
 * Identify honestly. It costs a few more bot challenges than pretending to be
 * Chrome would, and those are reported as challenges rather than failures, so
 * the cost is nearly nothing. A publisher that lies about who is knocking has
 * no business lecturing anyone about credibility.
 */
const UA = 'InsideTheTowns-linkcheck/1.0 (+https://insidethetowns.com/editorial/)';
const TIMEOUT = 25;
const CONCURRENCY = 8;
/**
 * Our own domains are checked by the build; asking again proves nothing.
 * Derived from the configs rather than written out, so town number nine does
 * not quietly start getting hammered by our own link checker.
 */
const OURS = new Set([hub.domain, ...allTowns.map((t) => t.domain)]);

interface Hit {
  url: string;
  where: string[];
}

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) {
      walk(full, out);
      // README.md in a content folder is instructions for whoever writes the
      // content, and its example URLs (organizer.example) are meant to be
      // unreachable. Checking them reports a failure every single run, which
      // is the fastest way to train someone to stop reading the output.
    } else if (/\.(md|mdx|ya?ml)$/.test(name) && name !== 'README.md') {
      out.push(full);
    }
  }
  return out;
}

function collect(): Hit[] {
  const files: string[] = [];
  const contentDir = join(root, 'content');
  for (const town of readdirSync(contentDir)) {
    if (only.length && !only.includes(town)) continue;
    const dir = join(contentDir, town);
    if (statSync(dir).isDirectory()) walk(dir, files);
  }
  // Town configs carry the official links — the town hall, the library, the
  // school district — which sit in the footer of every page of that guide.
  if (!only.length) {
    const townsDir = join(root, 'src/config/towns');
    for (const name of readdirSync(townsDir)) if (name.endsWith('.ts')) files.push(join(townsDir, name));
  }

  const found = new Map<string, Set<string>>();
  for (const file of files) {
    const rel = relative(root, file);
    readFileSync(file, 'utf8')
      .split('\n')
      .forEach((line, i) => {
        for (const m of line.matchAll(/https?:\/\/[^\s"'`<>)\]},]+/g)) {
          const url = m[0].replace(/[.,;:]+$/, '').replace(/&amp;/g, '&');
          const host = hostOf(url);
          if (!host || OURS.has(host) || host === 'localhost') continue;
          if (!found.has(url)) found.set(url, new Set());
          found.get(url)!.add(`${rel}:${i + 1}`);
        }
      });
  }
  return [...found].map(([url, where]) => ({ url, where: [...where].sort() })).sort((a, b) => a.url.localeCompare(b.url));
}

function hostOf(url: string): string | null {
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}

async function curl(url: string, method: 'HEAD' | 'GET'): Promise<{ code: string; headers: string }> {
  const args = [
    '-sS', '-L', '--max-time', String(TIMEOUT), '-A', UA,
    '-H', 'Accept: text/html,application/xhtml+xml,*/*',
    '-o', '/dev/null',
    '-D', '-', '-w', '\n%{http_code}', url,
  ];
  if (method === 'HEAD') args.unshift('-I');
  try {
    const { stdout } = await run('curl', args, { maxBuffer: 8 << 20 });
    const nl = stdout.lastIndexOf('\n');
    return { code: stdout.slice(nl + 1).trim(), headers: stdout.slice(0, nl) };
  } catch {
    return { code: '000', headers: '' };
  }
}

type Verdict = 'ok' | 'gone' | 'blocked' | 'unreachable';

async function check(url: string): Promise<{ verdict: Verdict; code: string; note: string }> {
  // HEAD first — cheaper for them and for us. Plenty of servers refuse it, so
  // anything that is not a clean 2xx gets a real GET before we believe it.
  let { code, headers } = await curl(url, 'HEAD');
  if (!/^2/.test(code)) ({ code, headers } = await curl(url, 'GET'));
  if (code === '000') ({ code, headers } = await curl(url, 'GET'));

  const challenged = /cf-mitigated:/i.test(headers);
  if (/^2/.test(code)) return { verdict: 'ok', code, note: '' };
  if (code === '404' || code === '410') return { verdict: 'gone', code, note: '' };
  if (code === '403' || code === '429' || code === '503') {
    return { verdict: 'blocked', code, note: challenged ? 'Cloudflare bot challenge' : 'refused an automated request' };
  }
  if (code === '000') return { verdict: 'unreachable', code, note: 'no response — DNS, TLS or timeout' };
  return { verdict: 'blocked', code, note: 'unexpected status' };
}

/**
 * Work host by host rather than URL by URL. Eight parallel requests spread
 * across eight different servers is polite; eight at one small restaurant's
 * WordPress box is not, and it is also the surest way to get a 429 and
 * mistake it for a dead site.
 */
async function main() {
  const hits = collect();
  if (!hits.length) {
    console.error(only.length ? `check-links: no content for ${only.join(', ')}` : 'check-links: no content found');
    process.exit(1);
  }
  // A URL that will not parse is a content bug, not a crash. Report it with
  // its file and line and carry on; an unattended check that dies on the
  // first malformed link tells you nothing about the other six hundred.
  const malformed: Hit[] = [];
  const byHost = new Map<string, Hit[]>();
  for (const hit of hits) {
    const host = hostOf(hit.url);
    if (!host) {
      malformed.push(hit);
      continue;
    }
    if (!byHost.has(host)) byHost.set(host, []);
    byHost.get(host)!.push(hit);
  }

  const scope = only.length ? only.join(', ') : `${LIVE_TOWNS.length} towns and the hub`;
  console.log(`check-links: ${hits.length} links across ${byHost.size} hosts (${scope})\n`);

  const results = new Map<string, { verdict: Verdict; code: string; note: string }>();
  const queue = [...byHost.values()];
  let done = 0;
  await Promise.all(
    Array.from({ length: Math.min(CONCURRENCY, queue.length) }, async () => {
      for (let group = queue.pop(); group; group = queue.pop()) {
        for (const hit of group) {
          results.set(hit.url, await check(hit.url));
          done += 1;
          if (done % 50 === 0) process.stderr.write(`  ${done}/${hits.length}\n`);
        }
      }
    }),
  );

  const of = (v: Verdict) => hits.filter((h) => results.get(h.url)!.verdict === v);
  const gone = of('gone');
  const unreachable = of('unreachable');
  const blocked = of('blocked');

  const list = (label: string, group: Hit[]) => {
    if (!group.length) return;
    console.log(`${label} (${group.length}):`);
    for (const hit of group) {
      const r = results.get(hit.url)!;
      console.log(`  ${r.code} ${hit.url}${r.note ? `  — ${r.note}` : ''}`);
      for (const w of hit.where) console.log(`      ${w}`);
    }
    console.log('');
  };

  list('MALFORMED — these are not valid URLs', malformed);
  list('DEAD — fix or remove these', gone);
  list('No response — check by hand', unreachable);
  if (blocked.length) {
    console.log(`Refused an automated request (${blocked.length}) — almost always a bot challenge, not a dead page:`);
    const hosts = new Map<string, number>();
    for (const hit of blocked) {
      const host = hostOf(hit.url) ?? hit.url;
      hosts.set(host, (hosts.get(host) ?? 0) + 1);
    }
    for (const [host, n] of [...hosts].sort((a, b) => b[1] - a[1])) console.log(`  ${host} (${n})`);
    console.log('');
  }

  console.log(
    `check-links: ${of('ok').length} ok, ${gone.length} dead, ${unreachable.length} no response, ` +
      `${blocked.length} refused${malformed.length ? `, ${malformed.length} malformed` : ''}`,
  );
  if (gone.length || malformed.length) {
    console.log('\nThe editorial policy tells readers every claim has a source they can follow. Dead links break that.');
    process.exit(1);
  }
}

await main();
