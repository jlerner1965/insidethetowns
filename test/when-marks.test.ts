/**
 * The days, dates and times in a program's When line, set in bold on the
 * row (src/lib/when-marks.ts; the owner, 9 November 2026). Lines taken from
 * the programs as filed.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { whenMarks } from '../src/lib/when-marks.ts';

/** The line with its marked runs in brackets. */
const show = (text: string) => whenMarks(text).map((s) => (s.mark ? `[${s.text}]` : s.text)).join('');

test('a day and its hours are one bold run', () => {
  assert.equal(
    show('Little Spikers Wednesdays 4–4:45 pm; youth pickleball Mondays at 4 pm'),
    'Little Spikers [Wednesdays 4–4:45 pm]; youth pickleball [Mondays at 4 pm]',
  );
  assert.equal(show('Museum Wed–Sat 1–4 pm'), 'Museum [Wed–Sat 1–4 pm]');
  assert.equal(show('Mon–Fri 5 am–9 pm, Sat 7–8, Sun 11–8'), '[Mon–Fri 5 am–9 pm], [Sat 7–8], [Sun 11–8]');
});

test('ordinals, ranges and noon', () => {
  assert.equal(show('Board of Trustees 2nd and 4th Tuesdays, 6:30 pm'), 'Board of Trustees [2nd and 4th Tuesdays, 6:30 pm]');
  assert.equal(show('open studio Saturdays 10 am to noon'), 'open studio [Saturdays 10 am to noon]');
  assert.equal(show('Chainsaws & Chuckwagons July 18, noon–6 pm'), 'Chainsaws & Chuckwagons [July 18, noon–6 pm]');
  assert.equal(show('Babytime Thu 11 am–noon'), 'Babytime [Thu 11 am–noon]');
  assert.equal(show('for an hour between 4 and 8 pm'), 'for an hour between [4 and 8 pm]');
});

test('dates, with their times', () => {
  assert.equal(show('Monthly on a Thursday; November 19 at 4:15 pm'), 'Monthly on a [Thursday]; [November 19 at 4:15 pm]');
  assert.equal(show('Teen Clay Sundays, November 8 and 15, 1–3 pm'), 'Teen Clay [Sundays], [November 8 and 15, 1–3 pm]');
});

test('words that only look like days or times are left alone', () => {
  assert.equal(show('Pokémon Club Thu 4–5 pm'), 'Pokémon Club [Thu 4–5 pm]');
  assert.equal(show('Gold Creek, third Mondays; Sun Country, third Wednesdays'), 'Gold Creek, [third Mondays]; Sun Country, [third Wednesdays]');
  assert.equal(show('Toddler Social Time (1–2s) and (3–5s)'), 'Toddler Social Time (1–2s) and (3–5s)');
  assert.equal(show('By event'), 'By event');
});

test('nothing is reworded', () => {
  const line = 'Kids Rock Tue and Wed 4:30 pm; Big Kids Rock Wed and Thu 5:30 pm, Sun noon; 55 minutes each';
  assert.equal(whenMarks(line).map((s) => s.text).join(''), line);
});
