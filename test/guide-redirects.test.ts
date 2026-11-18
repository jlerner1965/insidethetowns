/**
 * The addresses a build would answer with a redirect page (a 200 with a
 * meta refresh and noindex) are answered by the host first, as a 301: a
 * live guide's former and retired slugs (`formerSlugs`,
 * content/<town>/retired.json), its moved index pages, and the hub's
 * pages that moved to a guide (src/lib/hub-moved.ts). The search audit of
 * 17 November 2026 found 238 of them with no rule in vercel.json, filed by
 * Google as "excluded by noindex" while the dated address still held the
 * ranking. vercel.json is written from the same functions the build reads
 * (`node scripts/fold-rules.ts --write`); this fails when it falls behind.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { getNetworkHub, listsEvents } from '../src/config/index.ts';
import { towns } from '../src/config/towns/registry.ts';
import { formerSlugRedirects, guideRedirects, guideRules, GUIDE_MOVED, QUIET_ANNUAL } from '../src/lib/former-slugs.ts';
import { HUB_MOVED, hubMovedRules } from '../src/lib/hub-moved.ts';
import { generatedBlocks, heldEventRedirects, REDIRECT_LIMIT, withBlocks, type HostRule } from '../scripts/lib/redirect-rules.ts';

const root = new URL('..', import.meta.url).pathname;
const rules = (JSON.parse(readFileSync(join(root, 'vercel.json'), 'utf8')) as { redirects: HostRule[] }).redirects;
const live = towns.filter((t) => t.status === 'live');
const hub = getNetworkHub();
const onHost = (domain: string) => rules.filter((r) => r.has?.some((h) => h.type === 'host' && h.value === domain));

/** A source as Vercel reads it, for the forms the file uses. */
function pattern(source: string): RegExp {
  const body = source.replace(/\{\/\}\?|\(\.\*\)|:[a-z]+\*?|[.+^$|[\]\\]/g, (m) => (m === '{/}?' ? '/?' : m === '(.*)' ? '.*' : m.startsWith(':') ? (m.endsWith('*') ? '.*' : '[^/]+') : `\\${m}`));
  return new RegExp(`^${body}$`);
}
/** The rule that answers a path on a host: the first that matches, the host's own or one for every host. */
const answer = (domain: string, path: string) => rules.find((r) => (!r.has || r.has.some((h) => h.type === 'host' && h.value === domain)) && pattern(r.source).test(path));

test('vercel.json carries a 301 for every former, retired and moved address, and it is the rule that answers', () => {
  // Settled for today, and as filed: a rule written while an event was
  // still to come is not stale the morning after, only less good, so the
  // listing as filed is accepted too and the next --write moves it on.
  const today = generatedBlocks();
  const filed = generatedBlocks(null);
  let count = 0;
  for (const [i, block] of today.entries()) {
    assert.equal(filed[i]!.host, block.host);
    const asFiled = new Map(filed[i]!.rules.map((r) => [r.source, r.destination]));
    for (const want of block.rules) {
      count++;
      const path = `${want.source.replace('{/}?', '')}/`;
      const rule = answer(block.host, path);
      const where = `${block.host}${path}`;
      assert.ok(rule, `${where}: no rule in vercel.json; run "node scripts/fold-rules.ts --write"`);
      assert.equal(rule.source, want.source, `${where}: answered by ${rule.source} first; run "node scripts/fold-rules.ts --write"`);
      assert.ok(
        rule.destination === want.destination || rule.destination === asFiled.get(want.source),
        `${where}: goes to ${rule.destination}, not ${want.destination}; run "node scripts/fold-rules.ts --write"`,
      );
      assert.equal(rule.statusCode, 301, `${where}: a 301`);
      assert.equal(rule.permanent, undefined, `${where}: statusCode and permanent are not both set (Vercel refuses the pair)`);
      assert.deepEqual(rule.has, [{ type: 'host', value: block.host }], `${where}: scoped to its own host`);
    }
  }
  assert.ok(count > 300, `${count} addresses checked`);
  // Writing them again changes nothing.
  assert.deepEqual(withBlocks(rules, generatedBlocks(null)).length, rules.length, 'a block would add or drop a rule');
});

test('every live guide and the hub are among them, and the two the audit named go to the event’s page', () => {
  const hosts = new Set(generatedBlocks().map((b) => b.host));
  for (const t of live) assert.ok(hosts.has(t.domain), t.domain);
  assert.ok(hosts.has(hub.domain));
  // The hub's 14 addresses for a guide's town, in one hop to the guide.
  assert.deepEqual(hubMovedRules(hub.domain).map((r) => [r.source, r.destination]), Object.entries(HUB_MOVED).map(([from, to]) => [`${from}{/}?`, to]));
  for (const [from, to] of Object.entries(HUB_MOVED)) assert.equal(answer(hub.domain, `${from}/`)?.destination, to, `${hub.domain}${from}/`);
  // Festival of Lights: the event's page, not the events list, and the same from the domain that forwards to the guide.
  assert.equal(answer('carbonvalleyguide.com', '/events/festival-of-lights-2026-12-05/')?.destination, '/events/festival-of-lights/');
  assert.equal(answer('insidefrederickco.com', '/events/festival-of-lights-2026-12-05/')?.destination, 'https://carbonvalleyguide.com/events/festival-of-lights/');
  // An annual event's dated address, the kind that held the ranking.
  assert.equal(answer('insideerie.com', '/events/parade-of-lights-2026/')?.destination, '/events/parade-of-lights/');
  // The two Lyons addresses Google still showed that were 404s.
  for (const slug of ['art-opening-at-mainstage-brewing-2026-11-06', 'old-time-jam-at-oskar-blues-2026-10-28']) {
    assert.equal(answer('insidelyons.com', `/events/${slug}/`)?.destination, '/events/', slug);
    assert.ok(`/events/${slug}` in heldEventRedirects('lyons', join(root, 'content')), `${slug}: over, and held back by the gate`);
  }
  // A quiet guide's annual events go to its annual-events page; its other events are the host's own rule's.
  const quiet = live.filter((t) => !listsEvents(t));
  assert.ok(quiet.length > 0);
  for (const t of quiet) {
    const own = guideRedirects(t.slug, { listsEvents: false });
    const events = Object.entries(own).filter(([from]) => from.startsWith('/events/'));
    assert.ok(events.length > 0 && events.every(([, to]) => to === QUIET_ANNUAL), `${t.slug}: annual events to ${QUIET_ANNUAL}`);
  }
  for (const t of live) for (const [from, to] of Object.entries(GUIDE_MOVED)) assert.equal(answer(t.domain, `${from}/`)?.destination, to, `${t.domain}${from}/`);
});

test('no rule lands on another rule: one hop, on the same host or across', () => {
  const origins = new Map(towns.map((t) => [`https://${t.domain}`, t.domain]));
  origins.set(`https://${hub.domain}`, hub.domain);
  const chains: string[] = [];
  for (const r of rules) {
    if (/[:$(*]/.test(r.destination.replace(/^https:/, ''))) continue; // carries a parameter: no one path to follow
    const host = r.has?.find((h) => h.type === 'host')?.value;
    const url = new URL(r.destination, `https://${host ?? 'every.host'}`);
    const target = origins.get(url.origin) ?? (r.destination.startsWith('/') ? host : undefined);
    if (!target) continue;
    const next = answer(target, url.pathname);
    if (next) chains.push(`${host ?? 'every host'}${r.source} → ${r.destination} → ${next.destination} (${next.source})`);
  }
  assert.deepEqual(chains, []);
});

test('the file stays inside Vercel’s limit', () => {
  assert.ok(rules.length <= REDIRECT_LIMIT, `${rules.length} redirects; Vercel allows ${REDIRECT_LIMIT}`);
  assert.ok(rules.every((r) => r.source.length <= 4096 && r.destination.length <= 4096));
});

test('a redirect lands on a page that is indexed that day: a series’ current page, or the list once the event is over', () => {
  const dir = mkdtempSync(join(tmpdir(), 'guide-redirects-'));
  const events = join(dir, 'erie', 'events');
  const places = join(dir, 'erie', 'places');
  mkdirSync(events, { recursive: true });
  mkdirSync(places, { recursive: true });
  const event = (slug: string, fm: string) => writeFileSync(join(events, `${slug}.md`), `---\n${fm}\n---\n`);
  event('merged-2026-11-06', 'title: "Merged"\nvenue: "A"\nstart: "2026-11-06T18:00"\nformerSlugs: [first-half-2026-11-06]');
  event('parade', 'title: "Parade"\nvenue: "B"\nstart: "2026-12-04T18:00"\nannual: true\nformerSlugs: [parade-2026]');
  event('jam-2026-11-11', 'title: "Jam"\nvenue: "C"\nstart: "2026-11-11T18:00"\nformerSlugs: [jam-old]');
  event('jam-2026-11-25', 'title: "Jam"\nvenue: "C"\nstart: "2026-11-25T18:00"');
  writeFileSync(join(places, 'shut.md'), '---\ntitle: "Shut"\nstatus: closed\nformerSlugs: [shut-old]\n---\n');
  writeFileSync(join(dir, 'erie', 'retired.json'), JSON.stringify({ events: { gone: null, 'moved-on': 'parade' } }));
  const on = (day: string) => formerSlugRedirects('erie', dir, new Date(`${day}T18:00:00Z`));
  assert.deepEqual(on('2026-11-05'), {
    '/events/first-half-2026-11-06': '/events/merged-2026-11-06/',
    '/events/parade-2026': '/events/parade/',
    '/events/jam-old': '/events/jam-2026-11-11/',
    '/places/shut-old': on('2026-11-05')['/places/shut-old']!,
    '/events/gone': '/events/',
    '/events/moved-on': '/events/parade/',
  });
  const later = on('2026-11-17');
  assert.equal(later['/events/first-half-2026-11-06'], '/events/', 'the merged event is over: the list');
  assert.equal(later['/events/jam-old'], '/events/jam-2026-11-25/', 'the series’ next date, the page that is indexed');
  assert.equal(on('2027-01-10')['/events/parade-2026'], '/events/parade/', 'an annual event’s page is never over');
  assert.equal(formerSlugRedirects('erie', dir, null)['/events/first-half-2026-11-06'], '/events/merged-2026-11-06/', 'as filed, whatever the date');
  // As rules: a 301 each, host-scoped, sorted; onto another origin for a domain that forwards.
  const made = guideRules('insideerie.com', { '/events/b': '/events/', '/events/a': '/events/x/' });
  assert.deepEqual(made, [
    { source: '/events/a{/}?', has: [{ type: 'host', value: 'insideerie.com' }], destination: '/events/x/', statusCode: 301 },
    { source: '/events/b{/}?', has: [{ type: 'host', value: 'insideerie.com' }], destination: '/events/', statusCode: 301 },
  ]);
  assert.equal(guideRules('old.example', { '/events/a': '/events/x/' }, 'https://insideerie.com')[0]!.destination, 'https://insideerie.com/events/x/');
});
