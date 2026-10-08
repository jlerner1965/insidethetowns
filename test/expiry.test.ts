/**
 * The browser-side expiry rule (src/lib/expiry.ts), replayed against a clock.
 *
 * The follow-up audit of 8 October 2026 replayed the published Freshness
 * script with four controlled clocks and found the one it should not have:
 * an overnight listing taken down at half past midnight, an hour before its
 * end, because the start-day comparison was or-ed with the end. These are
 * those four cases, against the marks the pages really write, plus the
 * pruning that follows a removal.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { listingOver, pruneExpired, type PrunableNode } from '../src/lib/expiry.ts';
import { parseLocal, toIsoLocal } from '../src/lib/dates.ts';
import { lastDay, listedUntil } from '../src/lib/events.ts';

/** The marks a row carries, built the way EventCard and WeekEventRow build them. */
function marks(start: string, end?: string, allDay = false) {
  const event = { data: { start: parseLocal(start), end: end ? parseLocal(end) : undefined, allDay } } as Parameters<typeof lastDay>[0];
  return { end: toIsoLocal(listedUntil(event)), day: lastDay(event) };
}
const at = (local: string) => parseLocal(local).getTime();

test('an ended same-day listing disappears, and one still to come stays', () => {
  const talk = marks('2026-10-08T19:00', '2026-10-08T21:00');
  assert.equal(listingOver(talk, at('2026-10-08T21:00'), '2026-10-08'), true, 'gone at its end');
  assert.equal(listingOver(talk, at('2026-10-08T22:30'), '2026-10-08'), true, 'and after it');
  assert.equal(listingOver(talk, at('2026-10-08T18:00'), '2026-10-08'), false, 'not before it');
  assert.equal(listingOver(talk, at('2026-10-08T20:59'), '2026-10-08'), false, 'nor while it is on');
});

test('an overnight listing stays until its actual end, whatever day it started on', () => {
  // The audit's case: an 8 October start, a 1 am end on the 9th, a clock at 12:30 am.
  const show = marks('2026-10-08T20:00', '2026-10-09T01:00');
  assert.equal(listingOver(show, at('2026-10-09T00:30'), '2026-10-09'), false, 'still on at half past midnight');
  assert.equal(listingOver(show, at('2026-10-09T01:00'), '2026-10-09'), true, 'gone at 1 am');
  // The end decides on its own: even a row marked with its start day stays.
  assert.equal(listingOver({ ...show, day: '2026-10-08' }, at('2026-10-09T00:30'), '2026-10-09'), false);
});

test('the no-end rule is explicit: the day decides only when there is no usable end', () => {
  // A timed listing that gave no end is marked with the next Denver midnight,
  // so on the page it is the end that takes it down, at midnight and not before.
  const talk = marks('2026-10-08T19:00');
  assert.equal(listingOver(talk, at('2026-10-08T23:59'), '2026-10-08'), false);
  assert.equal(listingOver(talk, at('2026-10-09T00:00'), '2026-10-09'), true);
  // A row with no end mark at all, or one that does not parse, falls back to its day.
  assert.equal(listingOver({ day: '2026-10-08' }, at('2026-10-08T23:59'), '2026-10-08'), false);
  assert.equal(listingOver({ day: '2026-10-08' }, at('2026-10-09T00:01'), '2026-10-09'), true);
  assert.equal(listingOver({ day: '2026-10-08', end: 'not a date' }, at('2026-10-09T00:01'), '2026-10-09'), true);
  // And a row with neither is never taken down by guesswork.
  assert.equal(listingOver({}, at('2026-10-09T00:01'), '2026-10-09'), false);
});

test('an all-day run comes off at the midnight after its last day', () => {
  const trail = marks('2026-10-17', '2026-10-31', true);
  assert.equal(listingOver(trail, at('2026-10-31T23:00'), '2026-10-31'), false, 'still on on the 31st');
  assert.equal(listingOver(trail, at('2026-11-01T00:00'), '2026-11-01'), true);
});

/* A stub of the little DOM the pruning reads: attribute selectors, descendants, removal. */
class Node implements PrunableNode {
  hidden = false;
  parent: Node | null = null;
  children: Node[] = [];
  attrs: Record<string, string>;
  constructor(attrs: Record<string, string> = {}) {
    this.attrs = attrs;
  }
  get dataset(): Record<string, string | undefined> {
    const out: Record<string, string> = {};
    for (const [k, v] of Object.entries(this.attrs)) {
      if (k.startsWith('data-')) out[k.slice(5).replace(/-([a-z])/g, (_, c: string) => c.toUpperCase())] = v;
    }
    return out;
  }
  add(...nodes: Node[]) {
    for (const n of nodes) {
      n.parent = this;
      this.children.push(n);
    }
    return this;
  }
  remove() {
    if (this.parent) this.parent.children = this.parent.children.filter((c) => c !== this);
    this.parent = null;
  }
  matches(selector: string) {
    return [...selector.matchAll(/\[([\w-]+)(?:="([^"]*)")?\]/g)].every(([, name, value]) =>
      value === undefined ? name! in this.attrs : this.attrs[name!] === value,
    );
  }
  closest(selector: string): Node | null {
    for (let n: Node | null = this; n; n = n.parent) if (n.matches(selector)) return n;
    return null;
  }
  *descendants(): Generator<Node> {
    for (const c of this.children) {
      yield c;
      yield* c.descendants();
    }
  }
  querySelector(selector: string): Node | null {
    for (const n of this.descendants()) if (n.matches(selector)) return n;
    return null;
  }
  querySelectorAll(selector: string): Node[] {
    return [...this.descendants()].filter((n) => n.matches(selector));
  }
}

/** The events page as built on the 8th: a chip and a day section for the 8th and the 9th. */
function eventsPage() {
  const show = new Node({ 'data-event-day': marks('2026-10-08T20:00', '2026-10-09T01:00').day, 'data-end': marks('2026-10-08T20:00', '2026-10-09T01:00').end });
  const talk = new Node({ 'data-event-day': '2026-10-08', 'data-end': marks('2026-10-08T19:00', '2026-10-08T21:00').end });
  const market = new Node({ 'data-event-day': '2026-10-09', 'data-end': marks('2026-10-09T09:00', '2026-10-09T13:00').end });
  const chips = new Node({ 'data-strip': '' }).add(new Node({ 'data-day-link': '2026-10-08' }), new Node({ 'data-day-link': '2026-10-09' }));
  const day8 = new Node({ 'data-day': '2026-10-08' }).add(talk, show);
  const day9 = new Node({ 'data-day': '2026-10-09' }).add(market);
  const empty = new Node({ 'data-events-empty': '' });
  empty.hidden = true;
  const scope = new Node({ 'data-events-scope': '' }).add(empty, day8, day9);
  const nearby = new Node({ 'data-hide-when-empty': '' }).add(new Node({ 'data-event-day': '2026-10-08', 'data-end': marks('2026-10-08T10:00', '2026-10-08T12:00').end }));
  const root = new Node().add(chips, scope, nearby);
  return { root, chips, day8, day9, show, talk, market, empty, nearby };
}

test('day groups and jump links are rebuilt from the surviving listings, not the calendar', () => {
  const page = eventsPage();
  // Half past midnight on the 9th: the talk and the nearby block have gone,
  // the overnight show is on, so the 8th keeps its heading and its chip.
  pruneExpired(page.root, at('2026-10-09T00:30'), '2026-10-09');
  assert.deepEqual(page.day8.children, [page.show]);
  assert.deepEqual(page.chips.children.map((c) => c.attrs['data-day-link']), ['2026-10-08', '2026-10-09']);
  assert.equal(page.nearby.parent, null, 'a block with no empty state goes once it is empty');
  assert.equal(page.empty.hidden, true);
  // Two in the morning: the show is over, and the 8th goes with its chip.
  pruneExpired(page.root, at('2026-10-09T02:00'), '2026-10-09');
  assert.equal(page.day8.parent, null);
  assert.deepEqual(page.chips.children.map((c) => c.attrs['data-day-link']), ['2026-10-09']);
  assert.deepEqual(page.day9.children, [page.market]);
  // The next evening: nothing left, and the list says so.
  pruneExpired(page.root, at('2026-10-09T20:00'), '2026-10-09');
  assert.deepEqual(page.chips.children, []);
  assert.equal(page.empty.hidden, false);
});

test('the pages run the shared rule rather than a copy of it', () => {
  const freshness = readFileSync('src/components/Freshness.astro', 'utf8');
  assert.match(freshness, /import \{ pruneExpired \} from '@\/lib\/expiry'/);
  assert.doesNotMatch(freshness, /eventDay[^\n]*<[^\n]*today/, 'no day comparison of its own');
  const weekend = readFileSync('src/routes/hub/this-weekend.astro', 'utf8');
  assert.match(weekend, /import \{ listingOver \} from '@\/lib\/expiry'/);
  assert.doesNotMatch(weekend, /lastDay < todayKey/, 'no day comparison of its own');
});
