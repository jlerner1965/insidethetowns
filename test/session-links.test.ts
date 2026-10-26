/**
 * The event page's sessions (audit, 26 October 2026: a Johnstown storytime
 * page linking "2026-10-12 at 13:00", its main button on a session already
 * over, and its sessions called "performances").
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normalizeUrl, organizerLink, readableSessionLinks, sameUrl, sessionLabel, sessionLinks, sittingWord } from '../src/lib/session-links.ts';
import { parseLocal } from '../src/lib/dates.ts';

const BODY = `Stories and songs.

- [2026-10-12 at 13:00](https://library.example/event/mm-8/2026-10-12/2/): buttons
- [2026-10-26 at 13:00](https://library.example/event/mm-10/2026-10-26/2/): pumpkins
- [2026-11-02](https://library.example/event/mm-11/2026-11-02/)
- [not a session](https://library.example/about/)
`;

test('session links are read from the body as Denver times', () => {
  const links = sessionLinks(BODY);
  assert.equal(links.length, 3);
  assert.equal(links[0]!.start.getTime(), parseLocal('2026-10-12T13:00').getTime());
  assert.equal(links[0]!.timed, true);
  assert.equal(links[2]!.timed, false);
  assert.equal(links[1]!.url, 'https://library.example/event/mm-10/2026-10-26/2/');
  assert.deepEqual(sessionLinks(undefined), []);
  assert.deepEqual(sessionLinks('[2026-02-30 at 10:00](https://x.example/)'), [], 'not a date');
});

test('a session link reads as the page writes a session: weekday, date and time, in a <time>', () => {
  assert.equal(sessionLabel(parseLocal('2026-10-26T13:00')), 'Mon, Oct 26, 1 pm');
  assert.equal(sessionLabel(parseLocal('2026-11-02'), false), 'Mon, Nov 2');
  const html = '<ul><li><a href="https://library.example/a">2026-10-26 at 13:00</a>: pumpkins</li><li><a href="https://x.example/">2026-11-02</a></li></ul><p>On 2026-10-26 at 13:00 the <a href="/y/">library</a> opens.</p>';
  const out = readableSessionLinks(html);
  assert.match(out, /<a href="https:\/\/library\.example\/a"><time datetime="2026-10-26T13:00">Mon, Oct 26, 1 pm<\/time><\/a>: pumpkins/);
  assert.match(out, /<time datetime="2026-11-02">Mon, Nov 2<\/time>/);
  assert.match(out, /On 2026-10-26 at 13:00 the/, 'a date in a sentence is the writer\'s');
  assert.doesNotMatch(out, />\s*2026-\d\d-\d\d at/, 'no link text left in the machine form');
});

test("the main button goes to the next session's own page, not to the first session's expired one", () => {
  const links = sessionLinks(BODY);
  const first = 'https://library.example/event/mm-8/2026-10-12/2/';
  assert.equal(organizerLink(first, links, parseLocal('2026-10-26T13:00')), 'https://library.example/event/mm-10/2026-10-26/2/');
  assert.equal(organizerLink(first, links, parseLocal('2026-11-02T13:00')), 'https://library.example/event/mm-11/2026-11-02/', 'a day-only link matches its day');
  assert.equal(organizerLink(first, links, parseLocal('2026-11-09T13:00')), first, 'no page for that session: the listing\'s own link stands');
  const series = 'https://library.example/series/mm/';
  assert.equal(organizerLink(series, links, parseLocal('2026-10-26T13:00')), series, 'a series page is current every week');
  assert.equal(organizerLink(undefined, [], parseLocal('2026-10-26T13:00')), undefined);
  assert.ok(sameUrl('https://www.Library.example/a/', 'http://library.example/a'));
  assert.equal(normalizeUrl('https://www.Library.example/Event/A/'), 'library.example/Event/A');
});

test('sessions for storytimes and classes, performances for shows, meetings for councils, dates for markets', () => {
  assert.equal(sittingWord('family'), 'sessions');
  assert.equal(sittingWord('family', 1), 'session');
  assert.equal(sittingWord('other'), 'sessions');
  assert.equal(sittingWord('food'), 'sessions');
  assert.equal(sittingWord('arts'), 'performances');
  assert.equal(sittingWord('music', 1), 'performance');
  assert.equal(sittingWord('civic'), 'meetings');
  assert.equal(sittingWord('market'), 'dates');
  assert.equal(sittingWord('festival'), 'dates');
});
