/**
 * Opening hours: the text a listing carries, read as a schedule, and the
 * open-or-closed status a reader sees.
 *
 * The parser's job is to be right or to say nothing. Every case here is one
 * the content actually has, and the null cases matter as much as the parsed
 * ones: a wrong "Open now" is worse than no badge.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { clockLabel, openingStatus, parseHoursText, parseOpeningHours } from '../src/lib/hours.ts';

test('a plain range with am and pm stated', () => {
  assert.deepEqual(parseHoursText('Mon–Sat 6 am–9 pm, Sun 7 am–8 pm'), ['Mo-Sa 06:00-21:00', 'Su 07:00-20:00']);
});

test('am and pm inferred: morning openings, evening closes, noon and midnight', () => {
  assert.deepEqual(parseHoursText('Tue–Sat 10–5; closed Sun–Mon'), ['Tu-Sa 10:00-17:00']);
  assert.deepEqual(parseHoursText('Sun–Wed 12–8, Thu–Sat 12–9'), ['Su-We 12:00-20:00', 'Th-Sa 12:00-21:00']);
  assert.deepEqual(parseHoursText('Tue–Fri 6–12, Sat–Sun 6–1; closed Mon'), ['Tu-Fr 06:00-12:00', 'Sa,Su 06:00-13:00']);
  assert.deepEqual(parseHoursText('Mon–Thu 11–11, Fri–Sat 11–12'), ['Mo-Th 11:00-23:00', 'Fr,Sa 11:00-24:00']);
  assert.deepEqual(parseHoursText('Daily 6–6'), ['Mo-Su 06:00-18:00']);
});

test('an afternoon opening, unless that would run the place overnight or the line opens earlier with an am', () => {
  assert.deepEqual(parseHoursText('Thu 5–10, Fri 4–10; closed Mon–Wed'), ['Th 17:00-22:00', 'Fr 16:00-22:00']);
  assert.deepEqual(parseHoursText('Mon 5:30–1:30; closed Tue'), ['Mo 05:30-13:30']);
  assert.deepEqual(parseHoursText('Mon–Thu 5 am–9 pm, Fri 5–7, Sat 7–7'), ['Mo-Th 05:00-21:00', 'Fr 05:00-19:00', 'Sa 07:00-19:00']);
});

test('one meridiem stated reads the other end forwards', () => {
  assert.deepEqual(parseHoursText('Tue–Sat 4:30–8:30 pm'), ['Tu-Sa 16:30-20:30']);
  assert.deepEqual(parseHoursText('Sat 9–3 pm'), ['Sa 09:00-15:00']);
  assert.deepEqual(parseHoursText('Fri 11 am–1 am'), ['Fr 11:00-01:00']);
});

test('split days, split shifts, closed days named first or last, "&" and "noon"', () => {
  assert.deepEqual(parseHoursText('Wed–Thu & Sun 5–9 pm, Fri–Sat 5–10 pm'), ['We,Th,Su 17:00-21:00', 'Fr,Sa 17:00-22:00']);
  assert.deepEqual(parseHoursText('Tue–Sat 11–3 & 4–8:30; closed Mon'), ['Tu-Sa 11:00-15:00', 'Tu-Sa 16:00-20:30']);
  assert.deepEqual(parseHoursText('Mon, Tue, Fri 10–6; Wed, Thu 10–8; Sun closed'), ['Mo,Tu,Fr 10:00-18:00', 'We,Th 10:00-20:00']);
  assert.deepEqual(parseHoursText('Mon–Wed noon–8 pm'), ['Mo-We 12:00-20:00']);
  assert.deepEqual(parseHoursText('Wed–Mon 3:30–8:30 pm; closed Tue'), ['We-Mo 15:30-20:30']);
  assert.deepEqual(parseHoursText('Open 24 hours'), ['Mo-Su 00:00-24:00']);
});

test('by appointment is not open to walk in, and a trailing "or by appointment" is a remark', () => {
  assert.deepEqual(parseHoursText('Tue, Wed, Sat 9–12; Mon, Thu, Fri by appointment'), ['Tu,We,Sa 09:00-12:00']);
  assert.deepEqual(parseHoursText('Tue–Sat 10–5, or by appointment'), ['Tu-Sa 10:00-17:00']);
  assert.equal(parseHoursText('By appointment only'), null);
});

test('what it will not read: daylight, seasons, offices, exceptions', () => {
  for (const text of [
    'Open daily, dawn to dusk',
    'Daily 8 am–dusk',
    'Sat 10–2, May–Sep; by appointment',
    'Sun worship 10 am; office Tue–Thu 9–2',
    'Daily 7 am–8 pm, except Tue 7 am–2 pm',
    'Check-in 3 pm, check-out 11 am',
    'Mon–Fri, office hours',
    '',
  ]) {
    assert.equal(parseHoursText(text), null, text);
  }
  assert.equal(parseHoursText(undefined), null);
});

test('spans read back, including a close past midnight', () => {
  assert.deepEqual(parseOpeningHours(['Fr,Sa 11:00-01:00']), [{ days: [5, 6], open: 660, close: 25 * 60 }]);
  assert.deepEqual(parseOpeningHours(['We-Mo 15:30-20:30'])[0]!.days, [3, 4, 5, 6, 0, 1]);
  assert.deepEqual(parseOpeningHours(['nonsense']), []);
});

/** A Denver instant from a wall-clock string, via the offset in force that day. */
const denver = (iso: string, offset: string) => new Date(`${iso}${offset}`);

test('open now, closing time, and the next opening today, tomorrow or later in the week', () => {
  const spec = ['Tu-Sa 10:00-17:00'];
  // Wednesday 1 October 2026, 14:00 MDT.
  assert.deepEqual(openingStatus(spec, denver('2026-10-01T14:00', '-06:00')), { open: true, label: 'Open · closes 5 pm' });
  assert.deepEqual(openingStatus(spec, denver('2026-10-01T08:00', '-06:00')), { open: false, label: 'Closed · opens 10 am' });
  assert.deepEqual(openingStatus(spec, denver('2026-10-01T18:00', '-06:00')), { open: false, label: 'Closed · opens tomorrow 10 am' });
  // Saturday evening: Sunday and Monday are closed, so Tuesday.
  assert.deepEqual(openingStatus(spec, denver('2026-10-03T18:00', '-06:00')), { open: false, label: 'Closed · opens Tue 10 am' });
});

test('a bar still open at half past midnight is open, on the day before', () => {
  const spec = ['Fr,Sa 11:00-01:00', 'Su-Th 11:00-22:00'];
  // Saturday 3 October 2026, 00:30 MDT: Friday's hours are still running.
  assert.deepEqual(openingStatus(spec, denver('2026-10-03T00:30', '-06:00')), { open: true, label: 'Open · closes 1 am' });
  assert.deepEqual(openingStatus(spec, denver('2026-10-03T02:00', '-06:00')), { open: false, label: 'Closed · opens 11 am' });
});

test('always open, and nothing to say', () => {
  assert.deepEqual(openingStatus(['Mo-Su 00:00-24:00'], new Date()), { open: true, label: 'Open · closes midnight' });
  assert.equal(openingStatus([], new Date()), null);
});

test('clock labels', () => {
  assert.equal(clockLabel(0), 'midnight');
  assert.equal(clockLabel(12 * 60), 'noon');
  assert.equal(clockLabel(10 * 60 + 30), '10:30 am');
  assert.equal(clockLabel(19 * 60), '7 pm');
  assert.equal(clockLabel(25 * 60), '1 am');
});
