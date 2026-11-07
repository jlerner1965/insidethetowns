/**
 * A listing that comes off keeps its URL working (src/lib/former-slugs.ts,
 * `retired.json`; the owner, 7 November 2026: 103 addresses Google or a
 * sent email still pointed at were 404s, past events deleted once their
 * dates passed). The ledger is read into redirects without ever shadowing a
 * live page, the real ledgers are sound, and no listing file a live guide
 * ever published has gone without something to catch its URL: a file again,
 * a former slug, the ledger, or a host rule in vercel.json. The last check
 * reads git: the working tree against HEAD, so an editor sees a deletion
 * before committing it, and whatever history the checkout has (CI fetches
 * fifty commits for it); it says so when there is none.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { towns } from '../src/config/towns/registry.ts';
import { formerSlugRedirects, liveListings, retiredLedgerIssues, retiredSlugs } from '../src/lib/former-slugs.ts';

const root = new URL('..', import.meta.url).pathname;
const live = towns.filter((t) => t.status === 'live');

test('a retired slug redirects to the list, or to the listing that took its place; a live slug keeps its page', () => {
  const dir = mkdtempSync(join(tmpdir(), 'retired-'));
  mkdirSync(join(dir, 'lyons', 'events'), { recursive: true });
  mkdirSync(join(dir, 'lyons', 'places'), { recursive: true });
  writeFileSync(join(dir, 'lyons', 'events', 'baby-storytime.md'), '---\ntitle: "Baby storytime"\n---\n');
  writeFileSync(join(dir, 'lyons', 'events', 'still-on.md'), '---\ntitle: "Still on"\n---\n');
  writeFileSync(join(dir, 'lyons', 'events', 'merged.md'), '---\ntitle: "Merged"\nformerSlugs: [named-by-both]\n---\n');
  writeFileSync(
    join(dir, 'lyons', 'retired.json'),
    JSON.stringify({
      events: { 'baby-storytime-2026-12-01': 'baby-storytime', 'apple-pressing': null, 'still-on': null, 'moved-nowhere': 'gone-too', 'named-by-both': null },
      places: { 'lyons-dairy-bar': null },
    }),
  );
  const warned: string[] = [];
  const warn = console.warn;
  console.warn = (m: string) => void warned.push(m);
  try {
    assert.deepEqual(formerSlugRedirects('lyons', dir), {
      '/events/named-by-both': '/events/merged/',
      '/events/baby-storytime-2026-12-01': '/events/baby-storytime/',
      '/events/apple-pressing': '/events/',
      '/events/moved-nowhere': '/events/',
      '/places/lyons-dairy-bar': '/directory/',
    });
  } finally {
    console.warn = warn;
  }
  assert.equal(warned.length, 2, warned.join('\n'));
  assert.match(warned[0]!, /still-on/);
  assert.match(warned[1]!, /moved-nowhere.*gone-too/);
  assert.deepEqual(retiredLedgerIssues('lyons', dir).length, 2, 'the same two, as issues for the validator');
  assert.deepEqual(retiredSlugs('nowhere', dir), [], 'a town without a ledger has no retired slugs');
});

test('a malformed ledger is refused by name', () => {
  const dir = mkdtempSync(join(tmpdir(), 'retired-bad-'));
  mkdirSync(join(dir, 'erie'));
  writeFileSync(join(dir, 'erie', 'retired.json'), '{"events": {"ok": null}, ');
  assert.throws(() => retiredSlugs('erie', dir), /erie\/retired\.json: not valid JSON/);
  writeFileSync(join(dir, 'erie', 'retired.json'), '{"articles": {}}');
  assert.throws(() => retiredSlugs('erie', dir), /unknown kind "articles"/);
  writeFileSync(join(dir, 'erie', 'retired.json'), '{"events": {"Not A Slug": null}}');
  assert.throws(() => retiredSlugs('erie', dir), /"Not A Slug" is not a slug/);
  writeFileSync(join(dir, 'erie', 'retired.json'), '{"events": {"fine": "/events/"}}');
  assert.throws(() => retiredSlugs('erie', dir), /must be null or a slug/);
  assert.equal(retiredLedgerIssues('erie', dir).length, 1, 'the validator gets the same message as one issue');
});

test('every live guide’s ledger is sound: no retired slug is a live listing, every target is one', () => {
  const issues = live.flatMap((t) => retiredLedgerIssues(t.slug, join(root, 'content')));
  assert.deepEqual(issues, []);
});

type Rule = { source: string; has?: Array<{ type: string; value: string }> };
const rules = (JSON.parse(readFileSync(join(root, 'vercel.json'), 'utf8')) as { redirects: Rule[] }).redirects;
const hostRule = (domain: string, kind: string, slug: string) =>
  rules.some((r) => r.source === `/${kind}/${slug}{/}?` && (!r.has || r.has.some((h) => h.type === 'host' && h.value.replace(/^www\./, '') === domain)));

test('no listing a live guide published has gone without something to catch its URL', () => {
  // Every path under content/<town>/{events,places}/ deleted or renamed
  // away, in the working tree against HEAD or by a commit in the checkout's
  // history. With neither (a clean shallow clone of one commit) there is
  // nothing to check, and the test says so.
  let log = '';
  try {
    const git = (args: string[]) => execFileSync('git', args, { cwd: root, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
    const paths = ['--', 'content/*/events/*.md', 'content/*/places/*.md'];
    log = git(['diff', '-M', '--name-status', 'HEAD', ...paths]) + git(['log', '-M', '--diff-filter=DR', '--name-status', '--format=', ...paths]);
  } catch {
    console.warn('retired-slugs: git history is not readable here; the deletion check is skipped');
    return;
  }
  const removed = new Set<string>();
  for (const line of log.split('\n')) {
    const m = line.match(/^(?:D|R\d*)\t(content\/[^/\t]+\/(?:events|places)\/[^/\t]+\.md)/);
    if (m) removed.add(m[1]!);
  }
  if (removed.size === 0) {
    console.warn('retired-slugs: no deleted listing in the history this checkout has; nothing to check');
    return;
  }
  const uncovered: string[] = [];
  for (const path of removed) {
    if (existsSync(join(root, path))) continue;
    const [, town, kind, file] = path.match(/^content\/([^/]+)\/(events|places)\/(.+)\.md$/)!;
    const config = live.find((t) => t.slug === town);
    if (!config) continue; // a retired guide's host rules send every path to the hub
    const liveNow = liveListings(town, kind as 'events' | 'places', join(root, 'content'));
    const covered = (slug: string) =>
      liveNow.has(slug) ||
      [...liveNow.values()].some((formers) => formers.includes(slug)) ||
      retiredSlugs(town, join(root, 'content')).some((r) => r.kind === kind && r.from === slug) ||
      hostRule(config.domain, kind!, slug);
    if (covered(file!)) continue;
    // The file may have declared a slug of its own; read the version that was deleted.
    let declared: string | undefined;
    try {
      const commit = execFileSync('git', ['log', '-1', '--format=%H', '--diff-filter=D', '--', path], { cwd: root, encoding: 'utf8' }).trim();
      const text = commit ? execFileSync('git', ['show', `${commit}^:${path}`], { cwd: root, encoding: 'utf8' }) : '';
      declared = text.match(/^slug:\s*"?([a-z0-9-]+)"?\s*$/m)?.[1];
    } catch {
      /* no readable earlier version: the file name is the slug */
    }
    if (declared && covered(declared)) continue;
    uncovered.push(`https://${config.domain}/${kind}/${declared ?? file}/  (${path})`);
  }
  assert.deepEqual(
    uncovered,
    [],
    `${uncovered.length} deleted listing(s) with nothing behind the URL. Put each slug in content/<town>/retired.json ` +
      `(null for the list, or the slug it was re-filed under), or keep the file:\n  ${uncovered.join('\n  ')}`,
  );
});
