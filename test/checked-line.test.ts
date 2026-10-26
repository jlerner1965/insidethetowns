/**
 * A list page's "Checked" line (src/lib/checked.ts): the items' own check
 * days, never the build's, and never one day standing for rows read on
 * other days (Lyons audit, 26 October 2026).
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseLocal } from '../src/lib/dates.ts';
import { checkedLineText } from '../src/lib/checked.ts';

test('one day for every item says so, and says it is every item', () => {
  assert.equal(
    checkedLineText(['2026-10-22', parseLocal('2026-10-22'), undefined], { by: undefined }),
    'Checked October 22, 2026: every item here was read against its own source that day.',
  );
  assert.equal(checkedLineText(['2026-10-22'], { by: 'James' }), 'Checked by James, October 22, 2026: the item here was read against its own source that day.');
});

test('items read on different days give the span and say they were not read together, and point to the rows where the rows carry dates', () => {
  const dates = ['2026-10-22', '2026-09-20', '2026-10-03'];
  assert.equal(checkedLineText(dates, { by: undefined }), 'Checked item by item, September 20 to October 22, 2026, not all on one day.');
  assert.equal(
    checkedLineText(dates, { by: undefined, perItem: true }),
    'Checked item by item, September 20 to October 22, 2026, not all on one day; each row gives the day its source was read.',
  );
  assert.equal(checkedLineText(['2026-12-30', '2027-01-04'], { by: undefined }), 'Checked item by item, December 30, 2026 to January 4, 2027, not all on one day.');
});

test('no dates, no line: a page is never dated by the day it was built', () => {
  assert.equal(checkedLineText([undefined], { by: undefined }), undefined);
  assert.equal(checkedLineText([], { by: undefined }), undefined);
});
