/**
 * The family and participation hubs' rules (src/lib/programs.ts): which
 * programs belong to which hub, how they group, and which deadlines are
 * still worth telling a reader about. A deadline that has passed is a trap,
 * not a listing.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseLocal } from '../src/lib/dates.ts';
import { ageText, byAudience, byTopic, daysLeft, deadlinePassed, deadlineTitle, familyAgeGroups, familyGroupsOf, familySection, freePrograms, isDropIn, isFree, onePerProgram, familyGroupOf, filedUnder, isForFamilies, isWayIn, splitDeadlines, upcomingDeadlines } from '../src/lib/programs.ts';
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

// ------------------------------------------------- ages, by the organizer's numbers

test('a program with the organizer’s numbers is filed where most of its years fall, and named under every other age it reaches', () => {
  // Scouts BSA Troop 161 said "11 to 17" and sat under "Ages 5–11" by its tags (family audit, 22 October 2026).
  const troop = program('Troop 161', { kind: 'club', audience: ['elementary', 'teens'], ages: '11 to 17', ageFrom: 11, ageTo: 17 });
  assert.equal(familyGroupOf(troop)?.id, 'teens', 'the numbers win over the tags');
  assert.deepEqual(familyGroupsOf(troop).map((g) => g.id), ['5-11', 'teens'], 'an eleven-year-old is still told');
  const league = program('Youth sports', { kind: 'league', audience: ['preschool', 'elementary', 'teens'], ageFrom: 4, ageTo: 18 });
  assert.equal(familyGroupOf(league)?.id, '5-11');
  assert.deepEqual(familyGroupsOf(league).map((g) => g.id), ['under-5', '5-11', 'teens']);
  const story = program('Storytime', { audience: ['babies', 'preschool', 'families'], ageFrom: 0, ageTo: 5 });
  assert.equal(familyGroupOf(story)?.id, 'under-5');
  const older = program('Volleyball', { kind: 'league', audience: ['teens', 'adults'], ageFrom: 16 });
  assert.equal(familyGroupOf(older)?.id, 'teens', '"16 and up" reaches the teens and no younger group');
  assert.deepEqual(familyGroupsOf(older).map((g) => g.id), ['teens']);
  assert.equal(familyGroupOf(program('Adults', { audience: ['adults'], ageFrom: 18 })), undefined);
  const groups = familyAgeGroups([troop, league, story]);
  assert.deepEqual(
    groups.map((g) => [g.group.id, g.programs.map((p) => p.data.title), g.alsoHere.map((p) => p.data.title)]),
    [
      ['under-5', ['Storytime'], ['Youth sports']],
      // A storytime to age five reaches the first school year, so it is named there too.
      ['5-11', ['Youth sports'], ['Storytime', 'Troop 161']],
      ['teens', ['Troop 161'], ['Youth sports']],
    ],
  );
  assert.equal(ageText(troop), '11 to 17', 'the organizer’s own words lead');
  assert.equal(ageText(program('X', { ageFrom: 16 })), '16 and up');
  assert.equal(ageText(program('X', { ageFrom: 4, ageTo: 18 })), '4 to 18');
  assert.equal(ageText(program('X')), undefined, 'nothing is invented');
});

test('a child’s activity, a parent’s way in and an organization are three sections, not one list by age', () => {
  assert.equal(familySection(program('Troop', { kind: 'club', audience: ['teens'] })), 'children');
  assert.equal(familySection(program('PTAC', { kind: 'volunteer', audience: ['families'] })), 'parents');
  assert.equal(familySection(program('Schools', { kind: 'service', audience: ['families', 'teens'] })), 'parents');
  assert.equal(familySection(program('Historical Society', { kind: 'organization', audience: ['adults', 'families'] })), 'organizations');
  assert.equal(familySection(program('Lego club', { kind: 'club', audience: ['families'] })), 'children');
});

// ------------------------------------------------------------- free, honestly

test('free means the activity is free: not volunteering, not a member benefit, not a mixed price line', () => {
  assert.equal(isFree(program('Storytime', { price: 'Free' })), true);
  assert.equal(isFree(program('Passes', { price: 'Free (extra guests $5 each, up to three)' })), true, 'a parenthetical extra does not make it paid');
  assert.equal(isFree(program('Run', { price: 'Free; $3 post-run beer' })), false, 'a paid part after the semicolon');
  assert.equal(isFree(program('Drop-in sports', { price: 'Free; basketball $5 a night, paid to the instructor' })), false);
  assert.equal(isFree(program('PTAC', { price: 'Free to volunteer; the directory and spirit wear are optional purchases' })), false, 'free volunteering is not a free program');
  assert.equal(isFree(program('Society', { price: '$15 single, $25 family, a year; lectures $5 for non-members' })), false, 'a $5 lecture is not free');
  assert.equal(isFree(program('Museum', { price: 'Museum $5 adults, $3 seniors, free 11 and under; the contest is free to enter' })), false);
  assert.equal(isFree(program('Schools', { price: 'Public schools; no charge to tour' })), false, 'nothing is read into a line that does not begin Free');
  assert.equal(isFree(program('Unknown', {})), false, 'no price is not free');
  assert.equal(isFree(program('Said so', { price: 'Free; basketball $5 a night', free: true })), true, 'the file’s own word wins');
  assert.equal(isFree(program('Said not', { price: 'Free', free: false })), false);
});

test('drop in means no sign-up and no date; a file that says nothing is not assumed', () => {
  assert.equal(isDropIn(program('Storytime', { registration: { required: false } })), true);
  assert.equal(isDropIn(program('Club', { registration: { required: true } })), false);
  assert.equal(isDropIn(program('Camp', { registration: { required: false, deadline: at('2026-12-01') } })), false, 'a deadline is a date');
  assert.equal(isDropIn(program('Makerspace', {})), undefined);
  assert.equal(isDropIn(program('Said so', { dropIn: true })), true);
  const free = freePrograms([
    program('Unknown', { price: 'Free' }),
    program('Sign-up', { price: 'Free', registration: { required: true } }),
    program('Drop-in', { price: 'Free', registration: { required: false } }),
    program('Paid', { price: '$5' }),
    program('Library volunteers', { kind: 'volunteer', price: 'Free', registration: { required: true } }),
    program('Society', { kind: 'organization', price: 'Free', registration: { required: false } }),
  ]);
  assert.deepEqual(free.map((p) => p.data.title), ['Drop-in', 'Sign-up', 'Unknown'], 'drop-ins first, the unknown last; the paid, the volunteering and the organization gone');
});

// ----------------------------------------------- soon, later, and whole days

test('closing soon, opening soon and coming up never share an entry, and soon is fourteen Denver days', () => {
  const now = at('2026-10-22T15:30');
  const list = [
    program('Basketball', { registration: { required: true, deadline: at('2026-12-01') } }),
    program('Winter guide', { registration: { required: true, opens: at('2026-11-01') } }),
    program('Open enrollment', { registration: { required: true, opens: at('2026-12-01'), deadline: at('2026-12-15') } }),
    program('Contest', { registration: { required: true, deadline: at('2026-11-05') } }),
    program('Edge', { registration: { required: true, deadline: at('2026-11-05T23:00') } }),
    program('Just past', { registration: { required: true, deadline: at('2026-11-06') } }),
    program('Far', { registration: { required: true, deadline: at('2027-03-01') } }),
  ];
  const { closingSoon, openingSoon, later } = splitDeadlines(list, { now });
  assert.deepEqual(closingSoon.map((d) => d.program.data.title), ['Contest', 'Edge'], 'the fourteenth day counts, late in the day too');
  assert.deepEqual(openingSoon.map((d) => d.program.data.title), ['Winter guide']);
  assert.deepEqual(later.map((d) => `${d.program.data.title}:${d.what}`), ['Just past:closes', 'Basketball:closes', 'Open enrollment:opens']);
  assert.ok(!later.some((d) => d.program.data.title === 'Far'), 'ninety days is the horizon');
  // The same list the night before: nothing moves by the hour.
  const night = splitDeadlines(list, { now: at('2026-10-22T23:59') });
  assert.deepEqual(night.closingSoon.map((d) => d.program.data.title), ['Contest', 'Edge']);
});

test('days left are whole Denver days, so a countdown does not lose a day after lunch or across the clock change', () => {
  const deadline = { on: at('2026-11-05') };
  assert.equal(daysLeft(deadline, at('2026-10-22T00:10')), 14);
  assert.equal(daysLeft(deadline, at('2026-10-22T23:50')), 14, 'still fourteen at bedtime');
  assert.equal(daysLeft(deadline, at('2026-11-05T18:00')), 0, 'today');
  assert.equal(daysLeft(deadline, at('2026-11-04T23:59')), 1, 'tomorrow');
  // The clocks go back on November 1: October 31 to November 2 is two days, not 2.04.
  assert.equal(daysLeft({ on: at('2026-11-02') }, at('2026-10-31T12:00')), 2);
  // A deadline stored as a UTC instant that is still the 4th in Denver.
  assert.equal(daysLeft({ on: new Date('2026-11-05T05:30:00Z') }, at('2026-11-04T20:00')), 0, '11:30 pm Denver on the 4th is the 4th');
});
