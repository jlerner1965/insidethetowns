/**
 * The family and participation hubs' rules (src/lib/programs.ts): which
 * programs belong to which hub, how they group, and which deadlines are
 * still worth telling a reader about. A deadline that has passed is a trap,
 * not a listing.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseLocal } from '../src/lib/dates.ts';
import { byAudience, byTopic, deadlinePassed, deadlineTitle, familyAgeGroups, onePerProgram, familyGroupOf, filedUnder, isForFamilies, isWayIn, upcomingDeadlines } from '../src/lib/programs.ts';
import type { ProgramData } from '../src/content/schemas.ts';

const at = (s: string) => parseLocal(s);

function program(title: string, over: Partial<ProgramData> = {}) {
  const data: ProgramData = {
    title,
    kind: 'program',
    topic: 'other',
    audience: ['everyone'],
    organizer: 'Someone',
    summary: 'x',
    access: 'public',
    tags: [],
    featured: false,
    ...over,
  };
  return { slug: title.toLowerCase().replace(/\W+/g, '-'), data };
}

test('a program is for families by its audiences, and a way in by its kind', () => {
  assert.equal(isForFamilies(program('Storytime', { audience: ['babies'] })), true);
  assert.equal(isForFamilies(program('Trivia', { audience: ['adults'] })), false);
  assert.equal(isForFamilies(program('Swim', { audience: ['adults', 'teens'] })), true, 'one family audience is enough');
  assert.equal(isForFamilies(program('Town boards', { kind: 'meeting', audience: ['adults', 'teens'] })), false, 'a public meeting is on /get-involved/');
  assert.equal(isWayIn(program('Rotary', { kind: 'club' })), true);
  assert.equal(isWayIn(program('Soccer', { kind: 'league' })), false, 'a league is the family hub’s, not the participation hub’s');
  assert.equal(isWayIn(program('Board', { kind: 'meeting' })), true);
});

test('grouping by audience files a program once, under the first age it names, and leaves empty ages out', () => {
  const list = [program('Swim', { audience: ['preschool', 'teens'] }), program('Storytime', { audience: ['babies'] }), program('Teens', { audience: ['teens'] })];
  const groups = byAudience(list);
  assert.deepEqual(groups.map((g) => g.audience), ['babies', 'preschool', 'teens']);
  assert.deepEqual(groups[2]!.programs.map((p) => p.data.title), ['Teens'], 'swim lessons are under preschool, not twice');
  assert.deepEqual(byAudience(list, undefined, { once: false })[2]!.programs.map((p) => p.data.title), ['Swim', 'Teens']);
  assert.equal(filedUnder(list[0]!), 'preschool');
  assert.deepEqual(byTopic([program('A', { topic: 'arts' }), program('S', { topic: 'sports' })]).map((g) => g.topic), ['sports', 'arts']);
});

test('a featured program leads its group; the rest are by name', () => {
  const list = [program('Zebra', { audience: ['teens'] }), program('Apple', { audience: ['teens'] }), program('Mid', { audience: ['teens'], featured: true })];
  assert.deepEqual(byAudience(list)[0]!.programs.map((p) => p.data.title), ['Mid', 'Apple', 'Zebra']);
});

test('deadlines: the next few weeks only, soonest first, today still counts, a passed one is gone, an opening is shown until it opens', () => {
  const now = at('2026-10-21T15:00');
  const list = [
    program('Basketball', { registration: { required: true, deadline: at('2026-10-04') } }),
    program('Futsal', { registration: { required: true, deadline: at('2026-11-01') } }),
    program('Winter guide', { registration: { required: true, opens: at('2026-11-01') } }),
    program('Tonight', { registration: { required: true, deadline: at('2026-10-21') } }),
    program('Far off', { registration: { required: true, deadline: at('2027-03-01') } }),
    program('Open enrollment', { registration: { required: true, opens: at('2026-12-01'), deadline: at('2026-12-15') } }),
    program('No dates', { registration: { required: false } }),
  ];
  const out = upcomingDeadlines(list, { now, days: 45 });
  assert.deepEqual(
    out.map((d) => `${d.program.data.title}:${d.what}`),
    ['Tonight:closes', 'Futsal:closes', 'Winter guide:opens', 'Open enrollment:opens'],
  );
  assert.equal(deadlinePassed(list[0]!, now), true);
  assert.equal(deadlinePassed(list[3]!, now), false, 'a deadline today has not passed');
  assert.equal(upcomingDeadlines(list, { now, days: 200 }).some((d) => d.program.data.title === 'Far off'), true);
  // Within the window the open-enrollment close date also shows once its opening has gone by.
  assert.deepEqual(
    upcomingDeadlines(list, { now: at('2026-12-02'), days: 45 }).map((d) => `${d.program.data.title}:${d.what}`),
    ['Open enrollment:closes'],
  );
});

test('the family hub’s three age sections file a program once, a families-only program with the school years', () => {
  const swim = program('Swim', { audience: ['babies', 'preschool', 'elementary', 'teens'] });
  const museum = program('Museum', { audience: ['elementary', 'families'] });
  const passes = program('Passes', { audience: ['families', 'everyone'] });
  const write = program('Just Write', { audience: ['teens'] });
  const story = program('Storytime', { audience: ['babies', 'preschool'] });
  const groups = familyAgeGroups([write, passes, museum, swim, story]);
  // A program made for the age leads its group; one filed there by its youngest audience follows.
  // Swim lessons from six months up are filed with the school years, where most of their ages are.
  assert.deepEqual(groups.map((g) => [g.group.id, g.programs.map((p) => p.data.title)]), [
    ['under-5', ['Storytime']],
    ['5-11', ['Museum', 'Passes', 'Swim']],
    ['teens', ['Just Write']],
  ]);
  assert.equal(familyGroupOf(program('League', { audience: ['preschool', 'elementary', 'teens'] }))?.id, '5-11', 'a league from four to fifteen');
  assert.equal(familyGroupOf(program('Storytime', { audience: ['babies', 'preschool', 'families'] }))?.id, 'under-5', 'families alone does not move it');
  assert.equal(familyGroupOf(passes)?.id, '5-11');
  assert.equal(familyGroupOf(program('Adults', { audience: ['adults'] })), undefined);
});

test('a deadline’s title carries the action: entries due, register by, registration opens; a listing’s own title stands in', () => {
  const contest = program('Pioneer Museum and the contests', { registration: { required: true, how: 'Contest entries in person or online', deadline: at('2026-11-07') } });
  const league = program('Youth sports', { kind: 'league', registration: { required: true, how: 'Online', opens: at('2026-11-01') } });
  const camp = program('Day camp', { registration: { required: true, deadline: at('2026-12-01') } });
  const [c] = upcomingDeadlines([contest], { now: at('2026-10-22'), days: 45 });
  assert.equal(deadlineTitle(c!, 'Sat Nov 7', 'Holiday Card Art Contest deadline'), 'Holiday Card Art Contest: entries due Sat Nov 7');
  const [l] = upcomingDeadlines([league], { now: at('2026-10-22'), days: 45 });
  assert.equal(deadlineTitle(l!, 'Sun Nov 1'), 'Youth sports: registration opens Sun Nov 1');
  const [k] = upcomingDeadlines([camp], { now: at('2026-10-22'), days: 45 });
  assert.equal(deadlineTitle(k!, 'Tue Dec 1'), 'Day camp: register by Tue Dec 1');
});

test('a window that opens and closes within the horizon is one entry, the sooner', () => {
  const schools = program('Schools', { registration: { required: true, opens: at('2026-12-01'), deadline: at('2026-12-15') } });
  const list = onePerProgram(upcomingDeadlines([schools], { now: at('2026-10-22'), days: 60 }));
  assert.deepEqual(list.map((d) => d.what), ['opens']);
});
