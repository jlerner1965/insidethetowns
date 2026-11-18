/**
 * The tradition date watch and the seasonal roundups due (the owner, 18
 * November 2026): src/lib/date-watch.ts, src/lib/roundups.ts,
 * scripts/date-watch.ts, scripts/needs-me.ts.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { candidateDates, deriveDateWindow, watchState, windowCovers } from '../src/lib/date-watch.ts';
import { roundupsDue } from '../src/lib/roundups.ts';
import { rawRecords } from '../src/lib/tradition-files.ts';
import { CURRENT_SEASONS, nextRow, type TraditionRecord } from '../src/lib/traditions.ts';
import { traditionTitle } from '../src/lib/titles.ts';
import { setWindow, setYear } from '../scripts/lib/tradition-edit.ts';

const rec = (years: TraditionRecord['years'], over: Partial<TraditionRecord> = {}): TraditionRecord => ({
  slug: 'lyons-parade-of-lights',
  name: 'Lyons Holiday Parade of Lights',
  town: { name: 'Lyons', guide: 'lyons' },
  type: 'parade-of-lights',
  organizer: 'Town of Lyons',
  sourceUrl: 'https://www.townoflyons.com/354/',
  years,
  ...over,
});

test('every record with a dated year records its typical window, and the window holds every such date', () => {
  const records = rawRecords();
  assert.ok(records.length > 600);
  for (const r of records) {
    const dated = r.years.some((y) => !!y.date);
    assert.equal(!!r.dateWindow, dated, `${r.slug}: dateWindow ${dated ? 'missing' : 'without a dated year'}`);
    if (r.dateWindow) assert.ok(windowCovers(r.dateWindow, r), `${r.slug}: the window misses a date`);
  }
  assert.deepEqual(deriveDateWindow(rec([{ year: 2026, status: 'confirmed', date: '2026-12-05', checked: '2026-11-17' }, { year: 2025, status: 'confirmed', date: '2025-12-06', checked: '2025-11-01' }])), { start: '12-05', end: '12-06' });
});

test('the watch: quiet, then read from eight weeks out, then the owner’s from three weeks out; settled once dated or canceled', () => {
  const r = { ...rec([{ year: 2026, status: 'confirmed', date: '2026-12-05', checked: '2026-11-17' }]), dateWindow: { start: '12-05', end: '12-05' } };
  // This year's is dated: settled until the window closes, then next year's is watched.
  assert.equal(watchState(r, '2026-11-18')!.state, 'settled');
  assert.equal(watchState(r, '2026-12-06')!.year, 2027);
  assert.equal(watchState(r, '2027-08-01')!.state, 'quiet');
  assert.equal(watchState(r, '2027-10-10')!.state, 'watch', 'eight weeks out (Oct 10 → Dec 5 is 56 days)');
  assert.equal(watchState(r, '2027-11-14')!.state, 'needs-me', 'three weeks out');
  assert.equal(watchState({ ...r, years: [{ year: 2027, status: 'canceled', checked: '2027-10-01' }, ...r.years] }, '2027-11-14')!.state, 'settled');
  assert.equal(watchState({ ...r, notAnnual: 'a one-off' }, '2027-11-14'), undefined, 'a one-off is never watched');
});

test('the dates a page gives for the watched year: its JSON-LD and its written dates, in or near the window only', () => {
  const window = { start: '12-05', end: '12-05' };
  assert.deepEqual(candidateDates('The 2027 parade is Saturday, December 4th, 2027 at 6 pm. Last year: December 5, 2026.', [], 2027, window), ['2027-12-04']);
  assert.deepEqual(candidateDates('', ['2027-12-04T18:00:00-07:00'], 2027, window), ['2027-12-04']);
  assert.deepEqual(candidateDates('Save the date: 12/4/2027. Board meeting March 3, 2027.', [], 2027, window), ['2027-12-04'], 'a date far outside the window is not the event’s');
  assert.deepEqual(candidateDates('Dec. 3, 2027 and Dec. 4, 2027', [], 2027, window), ['2027-12-03', '2027-12-04']);
  assert.deepEqual(candidateDates('February 30, 2027', [], 2027, { start: '02-20', end: '02-28' }), [], 'no such day');
});

test('the watch writes a year into the file in its place, newest first, and widens the window', () => {
  const text = `---\nslug: x\nname: "X"\ntype: parade-of-lights\norganizer: "O"\nsourceUrl: "https://example.org/"\ndateWindow:\n  start: "12-05"\n  end: "12-05"\nyears:\n  - year: 2026\n    status: confirmed\n    date: 2026-12-05\n    checked: 2026-11-17\n---\n`;
  const block = '  - year: 2027\n    status: confirmed\n    date: 2027-12-04\n    checked: 2027-10-10\n';
  const out = setWindow(setYear(text, 2027, block), { start: '12-04', end: '12-05' });
  assert.match(out, /dateWindow:\n {2}start: "12-04"\n {2}end: "12-05"\nyears:\n {2}- year: 2027\n {4}status: confirmed\n {4}date: 2027-12-04\n {4}checked: 2027-10-10\n {2}- year: 2026\n/);
  // A not-announced year is replaced in place.
  const again = setYear(out, 2027, '  - year: 2027\n    status: not-announced\n    checked: 2027-10-17\n');
  assert.equal((again.match(/- year: 2027/g) ?? []).length, 1);
  assert.match(again, /\n---\n$/);
});

test('once a year is confirmed, the page’s title, its upcoming row (description and Event JSON-LD) and its lastmod follow from the record', () => {
  const before = rec([{ year: 2027, status: 'not-announced', checked: '2027-10-10' }, { year: 2026, status: 'confirmed', date: '2026-12-05', checked: '2026-11-17' }]);
  const after = rec([{ year: 2027, status: 'confirmed', date: '2027-12-04', checked: '2027-10-17' }, { year: 2026, status: 'confirmed', date: '2026-12-05', checked: '2026-11-17' }]);
  const today = '2027-10-17';
  const rowBefore = nextRow(before, today);
  const rowAfter = nextRow(after, today);
  assert.notEqual(rowBefore.entry.status, 'confirmed');
  assert.equal(rowAfter.entry.date, '2027-12-04', 'the row the description and the Event JSON-LD are built from');
  const title = traditionTitle('Lyons', after.name, 2027, { date: new Date('2027-12-04T12:00:00') });
  assert.match(title, /Dec(ember)? 4/, title);
  assert.notEqual(title, traditionTitle('Lyons', before.name, 2027, {}));
  // lastmod is the newest `checked` among a record's years (src/lib/lastmod.ts): the watch's write moves it.
  const newest = (r: TraditionRecord) => r.years.map((y) => y.checked).sort().pop();
  assert.equal(newest(after), '2027-10-17');
});

test('a roundup records its season and is due from eight weeks before it; report only', () => {
  const spans = Object.entries(CURRENT_SEASONS).filter(([, s]) => s?.span);
  assert.ok(spans.length >= 7);
  for (const [, s] of spans) assert.match(`${s!.span!.opens} ${s!.span!.closes}`, /^\d{2}-\d{2} \d{2}-\d{2}$/);
  const r = { ...rec([{ year: 2027, status: 'not-announced', checked: '2027-09-01' }, { year: 2026, status: 'confirmed', date: '2026-12-05', checked: '2026-11-17' }]), dateWindow: { start: '12-05', end: '12-05' } };
  assert.equal(roundupsDue([r], '2027-09-20').length, 0, 'before eight weeks out');
  const due = roundupsDue([r], '2027-10-01');
  assert.equal(due.length, 1);
  assert.equal(due[0]!.path, '/parades-of-lights/');
  assert.equal(due[0]!.dueFrom, '2027-09-25');
  assert.equal(due[0]!.missing.length, 1);
  const done = { ...r, years: [{ year: 2027, status: 'confirmed' as const, date: '2027-12-04', checked: '2027-10-01' }, ...r.years.slice(1)] };
  assert.equal(roundupsDue([done], '2027-10-01').length, 0, 'every date confirmed: nothing to report');
  // A season that runs into the next year (New Year’s) is found across the turn of the year.
  const nye = { ...rec([{ year: 2026, status: 'not-announced', checked: '2026-11-17' }, { year: 2025, status: 'confirmed', date: '2025-12-31', checked: '2026-11-17' }], { type: 'new-years', slug: 'k' }), dateWindow: { start: '12-31', end: '12-31' } };
  assert.equal(roundupsDue([nye], '2026-11-18')[0]?.path, '/new-years/');
});
