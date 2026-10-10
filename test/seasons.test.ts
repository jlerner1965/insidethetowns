/**
 * The season fields a mountain listing may carry (`seasonal.openMonths`,
 * `seasonal.note`, added 10 October 2026 beside `closedMonths`, `opens` and
 * `closes`): how they parse, what the rows say, and when the weekly report
 * asks for a re-check because a season is turning.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { z } from 'astro/zod';
import { placeSchema, seasonalSchema } from '../src/content/schemas.ts';
import { inSeason, lastSeasonTurn, openMonthsLabel, presentation, seasonLabel, seasonRecheck, seasonTurn } from '../src/lib/freshness.ts';
import { dayKey, parseLocal } from '../src/lib/dates.ts';

const d = (s: string) => parseLocal(s);
const summer = { openMonths: ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'] };
const winter = { openMonths: ['Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr'] };
const dated = { opens: d('2026-05-23'), closes: d('2026-10-12') };

test('openMonths and note parse; month names are checked; open and closed months are not both set', () => {
  const ok = seasonalSchema.parse({ season: 'May to October', openMonths: ['May', 'June', 'Jul', 'Aug', 'Sept', 'Oct'], note: 'Closed in mud season' });
  assert.equal(ok.openMonths.length, 6);
  assert.equal(ok.note, 'Closed in mud season');
  assert.deepEqual(ok.closedMonths, []);
  assert.equal(seasonalSchema.safeParse({ season: 'x', openMonths: ['Mayo'] }).success, false);
  assert.equal(seasonalSchema.safeParse({ season: 'x', openMonths: ['May'], closedMonths: ['Jan'] }).success, false);
  assert.equal(seasonalSchema.safeParse({ season: 'x', openMonths: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] }).success, false);
  // The fields are optional: a listing without them, and one with the older closedMonths, parse as before.
  const place = placeSchema(() => z.string());
  const plain = place.parse({ title: 'Cafe', type: 'coffee', address: '1 Main', summary: 'A cafe.', added: '2026-10-10' });
  assert.equal(plain.seasonal, undefined);
  const older = place.parse({ title: 'Lake', type: 'park', address: 'The lake', summary: 'A lake.', added: '2026-10-10', seasonal: { season: 'Summer', closedMonths: ['Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr'] } });
  assert.deepEqual(older.seasonal?.openMonths, []);
});

test('open months decide the season, matched on three letters, and may wrap the year', () => {
  assert.equal(inSeason(summer, d('2026-10-31')), true);
  assert.equal(inSeason(summer, d('2026-11-01')), false);
  assert.equal(inSeason(summer, d('2027-04-30')), false);
  assert.equal(inSeason(summer, d('2027-05-01')), true);
  assert.equal(inSeason(winter, d('2026-10-10')), false);
  assert.equal(inSeason(winter, d('2026-12-25')), true);
  assert.equal(inSeason({ openMonths: ['September'] }, d('2026-09-15')), true);
});

test('the months read as a reader reads them: a run, a wrapped run, a split season', () => {
  assert.equal(openMonthsLabel(summer), 'May–Oct');
  assert.equal(openMonthsLabel(winter), 'Nov–Apr');
  assert.equal(openMonthsLabel({ openMonths: ['May', 'Jun', 'Sep', 'Oct'] }), 'May–Jun, Sep–Oct');
  assert.equal(openMonthsLabel({ openMonths: ['Jul'] }), 'Jul');
  // closedMonths is the complement, so the older listings get the line too.
  assert.equal(openMonthsLabel({ closedMonths: ['Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr'] }), 'May–Oct');
  assert.equal(openMonthsLabel({}), undefined);
});

test('the one line on a row: "Open May–Oct" in season, "Closed for the season" out of it, with the reopening where known', () => {
  assert.equal(seasonLabel(summer, d('2026-10-10')), 'Open May–Oct');
  assert.equal(seasonLabel(summer, d('2026-11-01')), 'Closed for the season; reopens May');
  assert.equal(seasonLabel(dated, d('2026-10-10')), 'Open for the season');
  assert.equal(seasonLabel(dated, d('2026-05-01')), 'Closed for the season; reopens May 23');
  // A dated season that has closed says nothing about next year: the dates are this year's.
  assert.equal(seasonLabel(dated, d('2026-10-13')), 'Closed for the season');
  // A season given only in words cannot be placed on the calendar: no line, the page shows the words.
  assert.equal(seasonLabel({}, d('2026-10-10')), undefined);
  assert.equal(seasonLabel(undefined, d('2026-10-10')), undefined);
});

test('out of season the gate strips the hours and says why, from months as from dates', () => {
  const place = { title: 'Lodge', source: 'https://a.org/', verified: d('2026-10-30'), status: 'open', hours: 'Daily 8–8', seasonal: summer };
  assert.equal(presentation(place, 'mountain', d('2026-10-31')).hideHours, false);
  assert.deepEqual(presentation(place, 'mountain', d('2026-11-01')), { hideHours: true, hoursHidden: 'season', hidePhone: false, delist: false });
});

test('when a season turns: the next turn ahead and the last one behind, from dates and from months', () => {
  const day = (t: { on: Date } | undefined) => t && dayKey(t.on);
  assert.deepEqual(seasonTurn(summer, d('2026-10-10')) && { kind: seasonTurn(summer, d('2026-10-10'))!.kind, on: day(seasonTurn(summer, d('2026-10-10'))) }, { kind: 'closes', on: '2026-11-01' });
  assert.deepEqual({ ...seasonTurn(summer, d('2026-11-10'))!, on: day(seasonTurn(summer, d('2026-11-10'))) }, { kind: 'opens', on: '2027-05-01' });
  assert.deepEqual({ ...seasonTurn(dated, d('2026-05-01'))!, on: day(seasonTurn(dated, d('2026-05-01'))) }, { kind: 'opens', on: '2026-05-23' });
  assert.deepEqual({ ...seasonTurn(dated, d('2026-10-10'))!, on: day(seasonTurn(dated, d('2026-10-10'))) }, { kind: 'closes', on: '2026-10-13' });
  assert.equal(seasonTurn(dated, d('2026-10-13')), undefined);
  assert.deepEqual({ ...lastSeasonTurn(summer, d('2026-11-10'))!, on: day(lastSeasonTurn(summer, d('2026-11-10'))) }, { kind: 'closes', on: '2026-11-01' });
  assert.deepEqual({ ...lastSeasonTurn(summer, d('2026-05-03'))!, on: day(lastSeasonTurn(summer, d('2026-05-03'))) }, { kind: 'opens', on: '2026-05-01' });
  assert.deepEqual({ ...lastSeasonTurn(dated, d('2026-10-20'))!, on: day(lastSeasonTurn(dated, d('2026-10-20'))) }, { kind: 'closes', on: '2026-10-13' });
  assert.equal(lastSeasonTurn(dated, d('2026-05-01')), undefined);
  assert.equal(seasonTurn({}, d('2026-10-10')), undefined);
});

test('the re-check flag: inside the horizon of the turn ahead, and from the turn behind until checked after it', () => {
  const open = (seasonal: object, verified: string) => ({ seasonal, verified: d(verified), status: 'open' });
  // 22 days to the close on 1 November: outside a 14-day horizon, inside a 30-day one.
  assert.equal(seasonRecheck(open(summer, '2026-10-01'), d('2026-10-10'), 14), undefined);
  assert.equal(seasonRecheck(open(summer, '2026-10-01'), d('2026-10-10'), 30)?.inDays, 22);
  assert.deepEqual({ ...seasonRecheck(open(summer, '2026-10-01'), d('2026-10-20'), 14)!, on: '2026-11-01' }, { kind: 'closes', on: '2026-11-01', inDays: 12 });
  // Closed on 1 November, last checked in October: flagged until it is checked again.
  assert.deepEqual({ ...seasonRecheck(open(summer, '2026-10-20'), d('2026-11-05'), 14)!, on: '2026-11-01' }, { kind: 'closes', on: '2026-11-01', inDays: -4 });
  assert.equal(seasonRecheck(open(summer, '2026-11-02'), d('2026-11-05'), 14), undefined);
  // The same from dates: closes 12 October, so the turn is the 13th.
  assert.equal(seasonRecheck(open(dated, '2026-10-01'), d('2026-10-10'), 14)?.inDays, 3);
  assert.equal(seasonRecheck(open(dated, '2026-10-01'), d('2026-10-20'), 14)?.inDays, -7);
  assert.equal(seasonRecheck(open(dated, '2026-10-14'), d('2026-10-20'), 14), undefined);
  // Not for a closed place, a place with no season, or a season in words only.
  assert.equal(seasonRecheck({ seasonal: dated, verified: d('2026-10-01'), status: 'closed' }, d('2026-10-20'), 14), undefined);
  assert.equal(seasonRecheck({ verified: d('2026-10-01'), status: 'open' }, d('2026-10-20'), 14), undefined);
  assert.equal(seasonRecheck({ seasonal: {}, verified: d('2026-10-01'), status: 'open' }, d('2026-10-20'), 14), undefined);
  // Never checked at all, with a turn behind it: flagged from that turn.
  assert.equal(seasonRecheck({ seasonal: summer, status: 'open' }, d('2026-11-05'), 14)?.kind, 'closes');
});
