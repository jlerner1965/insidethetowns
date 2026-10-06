/**
 * What the weekly email calls new and closed: the places whose own `added`
 * or `closed` date falls in the issue's week, read from the frontmatter, so a
 * shallow clone on Vercel builds the same sample page as a full checkout.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseLocal } from '../src/lib/dates.ts';
import { isNewlyClosed, isNewPlace, issueWindow, nextSendDay, openingDay } from '../src/lib/newsletter.ts';

const day = (s: string) => parseLocal(s);
const send = day('2026-10-08'); // a Thursday

test('the send day is the next Thursday, or today when today is one', () => {
  assert.equal(nextSendDay(day('2026-10-06T09:00'), 'Thursday').getTime(), send.getTime());
  assert.equal(nextSendDay(day('2026-10-08T21:00'), 'Thursday').getTime(), send.getTime());
  assert.equal(nextSendDay(day('2026-10-09T08:00'), 'Thursday').getTime(), day('2026-10-15').getTime());
});

test('an issue reports on the six days after the last send day and the send day itself', () => {
  const { from, until } = issueWindow(send);
  assert.equal(from.getTime(), day('2026-10-02').getTime());
  assert.equal(until.getTime(), day('2026-10-09').getTime());
  // Consecutive issues tile: the next one starts where this one stops.
  assert.equal(issueWindow(day('2026-10-15')).from.getTime(), until.getTime());
});

test('new means added in the window and still open', () => {
  const place = (added: string, status = 'open') => ({ data: { status, added: day(added) } });
  assert.equal(isNewPlace(place('2026-10-05'), send), true);
  assert.equal(isNewPlace(place('2026-10-08'), send), true, 'the send day itself');
  assert.equal(isNewPlace(place('2026-10-01'), send), false, 'last week’s issue had it');
  assert.equal(isNewPlace(place('2026-10-09'), send), false, 'next week’s will');
  assert.equal(isNewPlace(place('2026-10-05', 'closed'), send), false, 'not a new place if it has already shut');
  assert.equal(isNewPlace({ data: { status: 'open' } }, send), false);
});

test('closed means recorded closed in the window, and still closed', () => {
  const place = (closed: string | undefined, status: string) => ({ data: { status, added: day('2026-09-17'), closed: closed ? day(closed) : undefined } });
  assert.equal(isNewlyClosed(place('2026-10-06', 'closed'), send), true);
  assert.equal(isNewlyClosed(place('2026-10-06', 'temporarily-closed'), send), true);
  assert.equal(isNewlyClosed(place('2026-09-30', 'closed'), send), false);
  assert.equal(isNewlyClosed(place(undefined, 'open'), send), false);
});

test('the places a guide opened with are the guide, not new places', () => {
  const places = [
    { data: { status: 'open', added: day('2026-10-04') } },
    { data: { status: 'open', added: day('2026-10-04') } },
    { data: { status: 'open', added: day('2026-10-06') } },
  ];
  const opened = openingDay(places);
  assert.equal(opened?.getTime(), day('2026-10-04').getTime());
  assert.deepEqual(places.map((p) => isNewPlace(p, send, opened)), [false, false, true]);
  assert.equal(openingDay([]), undefined);
});
