/**
 * Where a program stands (src/lib/programs.ts, programStatus): open, not
 * started yet, full, on a break or ended, decided on the day the page is
 * built from the file's own dates and the organizer's word, and never
 * guessed (Lyons audit, 26 October 2026: a football season that ended on
 * October 7 and a storytime break read the same as an open league).
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { z } from 'astro/zod';
import { parseLocal } from '../src/lib/dates.ts';
import { breakAhead, byActionable, isEnded, programStatus } from '../src/lib/programs.ts';
import { programSchema, type ProgramData } from '../src/content/schemas.ts';

const at = (s: string) => parseLocal(s);
const now = at('2026-10-26T09:00');

function program(title: string, over: Partial<ProgramData> = {}) {
  const data: ProgramData = {
    title,
    kind: 'program',
    topic: 'other',
    audience: ['elementary'],
    organizer: 'Someone',
    summary: 'x',
    access: 'public',
    tags: [],
    featured: false,
    ...over,
  };
  return { slug: title.toLowerCase().replace(/\W+/g, '-'), data };
}

test('a season whose last day has gone by is ended, with the day it ended', () => {
  const football = program('Backer football', { starts: at('2026-08-03'), ends: at('2026-10-07') });
  const s = programStatus(football, now);
  assert.equal(s?.state, 'ended');
  assert.equal(s?.label, 'Ended');
  assert.equal(s?.detail, 'Ended October 7');
  assert.equal(isEnded(football, now), true);
  // On its last day it is still running.
  assert.equal(programStatus(football, at('2026-10-07T20:00'))?.state, 'open');
  assert.equal(programStatus(football, at('2026-10-07T20:00'))?.detail, 'Runs through October 7');
});

test('an ended season with the next one’s sign-ups dated ahead is not started yet, not ended', () => {
  const p = program('Rec league', { ends: at('2026-10-14'), registration: { required: true, opens: at('2026-11-20') } });
  assert.equal(programStatus(p, now)?.state, 'upcoming');
  assert.equal(programStatus(p, now)?.detail, 'Sign-ups open November 20');
});

test('the organizer’s word holds between its dates: a notice before a break, the pill during it, nothing after', () => {
  const storytime = program('Storytime', {
    status: 'paused',
    statusFrom: at('2026-10-27'),
    statusUntil: at('2026-11-11'),
    statusNote: 'Storytime takes a break',
  });
  // The day before the break: no pill, a notice that it is coming.
  assert.equal(programStatus(storytime, now), undefined, 'a weekly storytime with no dates is never called open on silence');
  assert.equal(breakAhead(storytime, now), 'Storytime takes a break, October 27 to November 11');
  assert.equal(breakAhead({ ...storytime, data: { ...storytime.data, statusNote: undefined } }, now), 'A break October 27 to November 11');
  // During it.
  const during = programStatus(storytime, at('2026-11-03'));
  assert.equal(during?.state, 'paused');
  assert.equal(during?.label, 'On a break');
  assert.equal(during?.detail, 'Storytime takes a break. Back after November 11');
  assert.equal(breakAhead(storytime, at('2026-11-03')), undefined, 'a break under way is the pill’s, not a notice');
  // After it.
  assert.equal(programStatus(storytime, at('2026-11-12')), undefined);
  // A break more than a fortnight off is not news yet.
  assert.equal(breakAhead(storytime, at('2026-10-01')), undefined);
});

test('full, open and not started yet, each from its own evidence', () => {
  const full = program('Mountain biking', { status: 'full', statusNote: 'The six-week session filled', starts: at('2026-09-11'), ends: at('2026-11-20') });
  assert.equal(programStatus(full, now)?.state, 'full');
  assert.equal(programStatus(full, now)?.detail, 'The six-week session filled');
  assert.equal(programStatus(full, at('2026-11-21'))?.state, 'ended', 'a full session that is over is ended');

  const signUps = program('Camp', { registration: { required: true, deadline: at('2026-11-13') } });
  assert.deepEqual(programStatus(signUps, now), { state: 'open', label: 'Open now', detail: 'Sign up by November 13' });
  assert.equal(programStatus(signUps, at('2026-11-14')), undefined, 'a passed deadline is the row’s to say, not a status');

  const opening = program('Basketball', { registration: { required: true, opens: at('2026-11-02'), deadline: at('2026-11-16') } });
  assert.equal(programStatus(opening, now)?.state, 'upcoming');
  assert.equal(programStatus(opening, now)?.label, 'Not started yet');
  assert.equal(programStatus(opening, at('2026-11-02'))?.state, 'open', 'open from the day sign-ups open');

  const nextYear = program('Winter league', { starts: at('2027-01-11') });
  assert.equal(programStatus(nextYear, now)?.detail, 'Starts January 11, 2027', 'another year’s date carries its year');

  assert.equal(programStatus(program('Drop-in club'), now), undefined, 'nothing on the file, nothing said');
});

test('within a section the full ones follow what a reader can still join, and the ended ones go last', () => {
  const list = [
    program('A full', { status: 'full' }),
    program('B ended', { ends: at('2026-10-01') }),
    program('C open', { registration: { required: true, deadline: at('2026-11-01') } }),
    program('D silent'),
  ];
  assert.deepEqual(byActionable(list, now).map((p) => p.data.title), ['C open', 'D silent', 'A full', 'B ended']);
});

test('the schema refuses a status that cannot be read: a break with no end, a note with no status, a session that ends before it starts', () => {
  const schema = programSchema(() => z.string());
  const base = { title: 'X', kind: 'program', audience: ['elementary'], organizer: 'O', summary: 's' };
  assert.equal(schema.safeParse({ ...base, status: 'paused', statusFrom: '2026-10-27' }).success, false, 'a break says when it is back');
  assert.equal(schema.safeParse({ ...base, status: 'paused', statusFrom: '2026-10-27', statusUntil: '2026-11-11' }).success, true);
  assert.equal(schema.safeParse({ ...base, statusNote: 'Full' }).success, false, 'a note needs a status');
  assert.equal(schema.safeParse({ ...base, starts: '2026-11-01', ends: '2026-10-01' }).success, false);
  assert.equal(schema.safeParse({ ...base, status: 'nearly-full' }).success, false);
});
