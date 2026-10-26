/**
 * Johnstown's Music & Movement Storytime, merged on 26 October 2026 (audit:
 * the 1 pm session was published twice, both pages on the home page, each
 * recommending the other, one description for both). The library runs it
 * twice each Monday, at 10 and at 1; the guide lists each session once, in
 * two weekly series, and the retired page's address goes to the one kept.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { z } from 'astro/zod';
import { parseFrontmatter } from '../scripts/lib/frontmatter.ts';
import { eventSchema } from '../src/content/schemas.ts';
import { occurrences } from '../src/lib/events.ts';
import { dayKey, toWallClock } from '../src/lib/dates.ts';
import { sessionLinks } from '../src/lib/session-links.ts';

const dir = new URL('../content/johnstown/events/', import.meta.url);
const schema = eventSchema(() => z.string());
const RETIRED = 'music-and-movement-afternoon-sessions-2026';
const KEPT = 'music-and-movement-storytime-afternoon';

const storytimes = readdirSync(dir)
  .filter((n) => n.endsWith('.md'))
  .map((n) => ({ slug: n.slice(0, -3), ...parseFrontmatter(readFileSync(new URL(n, dir), 'utf8')) }))
  .filter((e) => /music\s*(&|and)\s*movement/i.test(String(e.data.title)))
  .map((e) => ({ slug: e.slug, body: e.body, data: schema.parse(e.data) }));

test('each Monday session of Music & Movement is listed once: one at 10, one at 1', () => {
  assert.deepEqual(storytimes.map((e) => e.slug).sort(), ['music-and-movement-storytime', KEPT]);
  const sessions = occurrences(storytimes, { now: new Date('2026-10-26T06:00:00Z'), horizonDays: 60 });
  const byStart = new Map<string, string[]>();
  for (const s of sessions) byStart.set(toWallClock(s.data.start), [...(byStart.get(toWallClock(s.data.start)) ?? []), s.slug]);
  for (const [start, slugs] of byStart) assert.equal(slugs.length, 1, `${start}: ${slugs.join(', ')}`);
  const mondays = ['2026-10-26', '2026-11-02', '2026-11-09', '2026-11-16', '2026-11-23', '2026-11-30'];
  for (const day of mondays) {
    assert.ok(byStart.has(`${day}T10:00`), `${day} 10 am`);
    assert.ok(byStart.has(`${day}T13:00`), `${day} 1 pm`);
  }
  assert.ok(![...byStart.keys()].some((k) => k > '2026-11-30T23:59'), 'nothing after the last date the library lists');
});

test('the retired page is gone and its address goes to the series kept, on Johnstown’s domain only', () => {
  assert.equal(existsSync(new URL(`${RETIRED}.md`, dir)), false);
  const vercel = JSON.parse(readFileSync(new URL('../vercel.json', import.meta.url), 'utf8')) as {
    redirects: Array<{ source: string; destination: string; permanent?: boolean; has?: Array<{ type: string; value: string }> }>;
  };
  const rules = vercel.redirects.filter((r) => r.source.startsWith(`/events/${RETIRED}`));
  assert.ok(rules.length >= 2);
  for (const r of rules) {
    assert.deepEqual(r.has, [{ type: 'host', value: 'insidejohnstown.com' }]);
    assert.equal(r.permanent, true);
    assert.ok(r.destination === `/events/${KEPT}/` || r.destination === `/events/${KEPT}.ics`, r.destination);
  }
  assert.ok(rules.some((r) => r.source === `/events/${RETIRED}{/}?` && r.destination === `/events/${KEPT}/`));
});

test("the series' main link is current and every session page it lists is the library's", () => {
  const kept = storytimes.find((e) => e.slug === KEPT)!;
  assert.match(kept.data.url!, /\/series\/music-movement-storytime\/$/);
  const links = sessionLinks(kept.body);
  assert.ok(links.length >= 6);
  for (const l of links) {
    assert.match(l.url, /^https:\/\/johnstownmillikenpubliclibraries\.us\/event\/music-movement-storytime-\d+\/\d{4}-\d{2}-\d{2}\/2\/$/);
    assert.ok(l.url.includes(dayKey(l.start)), `${l.url} is the page for ${dayKey(l.start)}`);
    assert.equal(toWallClock(l.start).slice(11), '13:00');
  }
});
