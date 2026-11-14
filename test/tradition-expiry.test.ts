/**
 * Dates that pass after the build (src/lib/tradition-expiry.ts, and toRow in
 * src/lib/traditions.ts for the build's own day): a season page expires a
 * date, and the reader's browser does the same for a stale build.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { datePassed, expireRows, fillPastText, type DateNode } from '../src/lib/tradition-expiry.ts';
import { hiddenFaceWords } from '../scripts/lib/site-check.ts';
import { isUpcoming, seasonCounts, seasonRows, townGroups, type TraditionRecord } from '../src/lib/traditions.ts';

const rec = (slug: string, date: string, endDate?: string): TraditionRecord =>
  ({ slug, name: slug, town: { name: slug, guide: 'lyons' }, type: 'tree-lighting', organizer: 'Town', sourceUrl: 'https://example.org/', years: [{ year: 2026, status: 'confirmed', date, endDate, checked: '2026-11-12' }] }) as TraditionRecord;

test('a season page stops calling a passed date confirmed, and stops counting it', () => {
  const records = [rec('early', '2026-11-21'), rec('late', '2026-12-05'), rec('run', '2026-11-20', '2026-11-29')];
  const before = seasonRows(records, 'tree-lighting', '2026-11-12');
  assert.equal(before.filter((r) => r.past).length, 0);
  assert.equal(seasonCounts(before).confirmed, 3);

  const after = seasonRows(records, 'tree-lighting', '2026-11-25');
  const bySlug = Object.fromEntries(after.map((r) => [r.record.slug, r]));
  assert.equal(bySlug.early!.past, true, 'the 21st has passed on the 25th');
  assert.equal(bySlug.early!.lastHeld, '2026-11-21', 'and is given as the last held');
  assert.equal(isUpcoming(bySlug.early!), false);
  assert.equal(bySlug.run!.past, undefined, 'a run still on today has not passed');
  assert.equal(bySlug.late!.past, undefined);
  assert.equal(seasonCounts(after).confirmed, 2);
  // The day itself is not past.
  assert.equal(seasonRows(records, 'tree-lighting', '2026-11-21').find((r) => r.record.slug === 'early')!.past, undefined);
});

test('a guide’s traditions page moves a passed date out of "Date confirmed"', () => {
  const groups = townGroups([rec('early', '2026-11-21'), rec('late', '2026-12-05')], 'lyons', '2026-11-25');
  assert.deepEqual(groups.dated.map((r) => r.record.slug), ['late']);
  assert.deepEqual(groups.waiting.map((r) => r.record.slug), ['early']);
});

test('in the browser a date has passed once its last day is before the reader’s day', () => {
  assert.equal(datePassed('2026-11-21', '2026-11-22'), true);
  assert.equal(datePassed('2026-11-21', '2026-11-21'), false);
  assert.equal(datePassed('2026-11-29', '2026-11-25'), false);
  assert.equal(datePassed(undefined, '2026-11-25'), false);
});

/** A minimal element for the swap: data attributes, hidden, text, and a flat list of descendants. */
function node(attrs: Record<string, string>, children: ReturnType<typeof node>[] = [], text = ''): DateNode & { children: DateNode[] } {
  const el: DateNode & { children: DateNode[]; attrs: Record<string, string> } = {
    attrs,
    children,
    dataset: Object.fromEntries(Object.entries(attrs).filter(([k]) => k.startsWith('data-')).map(([k, v]) => [k.slice(5).replace(/-([a-z])/g, (_, c: string) => c.toUpperCase()), v])),
    hidden: 'hidden' in attrs,
    textContent: text,
    remove() {},
    setAttribute(name, value) { attrs[name] = value; },
    getAttribute(name) { return attrs[name] ?? null; },
    closest() { return null; },
    querySelector(sel) { return [...this.querySelectorAll(sel)][0] ?? null; },
    querySelectorAll(sel) {
      const all = (n: DateNode & { children?: DateNode[] }): DateNode[] => (n.children ?? []).flatMap((c) => [c, ...all(c as DateNode & { children?: DateNode[] })]);
      const want = [...sel.matchAll(/\[([a-z-]+)\]/g)].map((m) => m[1]!);
      return all(this).filter((n) => want.every((a) => a in (n as unknown as { attrs: Record<string, string> }).attrs));
    },
    classList: { add() {}, remove() {} },
  };
  return el;
}

test('a row as built says one thing about its date; the after-the-date words are written in only when the date passes (the owner, 14 November 2026)', () => {
  const pill = node({ 'data-past-text': 'Next date not yet announced' });
  const last = node({ 'data-past-text': 'Last held Saturday, December 5, 2026' });
  const past = node({ 'data-when-past': '', hidden: '' }, [pill, last]);
  const set = node({ 'data-when-set': '' }, [], 'Confirmed · Saturday, December 5, 2026');
  const row = node({ 'data-tradition-row': '', 'data-ends': '2026-12-05', id: 'parade' }, [set, past]);
  const page = node({}, [row]);

  // Before the date: nothing in the hidden face.
  assert.equal(expireRows(page, '2026-12-05').length, 0);
  assert.equal(pill.textContent, '');
  assert.equal(last.textContent, '');
  assert.equal(past.hidden, true);

  // After it: the faces swap and the words are written in.
  assert.deepEqual(expireRows(page, '2026-12-06'), ['parade']);
  assert.equal(set.hidden, true);
  assert.equal(past.hidden, false);
  assert.equal(pill.textContent, 'Next date not yet announced');
  assert.equal(last.textContent, 'Last held Saturday, December 5, 2026');
  assert.equal(row.dataset.status, 'not-announced');

  // fillPastText on an element that carries its own words.
  const note = node({ 'data-held-note': '', hidden: '', 'data-past-text': ' (last held)' });
  fillPastText(note);
  assert.equal(note.textContent, ' (last held)');
});

test('the site check refuses a hidden after-the-date face that carries words, and passes an empty one', () => {
  const built = `<article data-tradition-row data-ends="2026-12-05"><p data-when-set>Confirmed · <time>Saturday, December 5</time></p>
    <div data-when-past hidden><p class="mt-2"><span data-past-text="Next date not yet announced"></span></p><p data-past-text="Last held Saturday, December 5, 2026"></p></div>
    <span data-mark-name="parade"><a href="#parade">Parade</a><span data-held-note hidden data-past-text=" (last held)"></span></span></article>`;
  assert.deepEqual(hiddenFaceWords(built), []);
  const old = `<div data-when-past hidden><p><span>Next date not yet announced</span></p><p>Last held <time>Saturday, December 5</time></p></div><span data-held-note hidden> (last held)</span>`;
  const found = hiddenFaceWords(old);
  assert.equal(found.length, 2, 'the old row face and the old year-list note');
  assert.match(found[0]!, /^Next date not yet announced\s*Last held Saturday, December 5$/);
  assert.equal(found[1], '(last held)');
  // A note shown on purpose (a date already held) is not a hidden face.
  assert.deepEqual(hiddenFaceWords('<span data-held-note> (last held)</span>'), []);
});
