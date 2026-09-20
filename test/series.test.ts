/**
 * Which occurrence of a recurring series gets indexed.
 *
 * The rule decides both the page's noindex and the sitemap, so getting it
 * wrong points search engines at an event that has already happened while
 * hiding the one a reader could attend.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { lastDayOf, pastEventSlugs, pickCanonical, readOccurrences, repeatOccurrenceSlugs, type Occurrence } from '../src/lib/series.ts';
import { lastDay } from '../src/lib/events.ts';
import { parseLocal } from '../src/lib/dates.ts';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const o = (slug: string, key: string, startDay: string): Occurrence => ({ slug, key, startDay });

test('the indexed occurrence is the soonest that has not happened', () => {
  const series = [
    o('karaoke-2026-09-04', 'Karaoke|Wayback', '2026-09-04'),
    o('karaoke-2026-09-18', 'Karaoke|Wayback', '2026-09-18'),
    o('karaoke-2026-10-02', 'Karaoke|Wayback', '2026-10-02'),
    o('karaoke-2026-10-16', 'Karaoke|Wayback', '2026-10-16'),
  ];
  // The regression: the earliest file was indexed no matter how old it got.
  assert.equal(pickCanonical(series, '2026-09-20').get('Karaoke|Wayback'), 'karaoke-2026-10-02');
});

test('an occurrence today still counts as upcoming', () => {
  const series = [o('a', 'k', '2026-09-19'), o('b', 'k', '2026-09-20'), o('c', 'k', '2026-09-21')];
  assert.equal(pickCanonical(series, '2026-09-20').get('k'), 'b');
});

test('a series that is entirely over keeps its most recent page indexed', () => {
  // Better one stale page than a whole series that no search engine may list.
  const series = [o('a', 'k', '2026-01-04'), o('b', 'k', '2026-02-01')];
  assert.equal(pickCanonical(series, '2026-09-20').get('k'), 'b');
});

test('a one-off event is its own canonical page', () => {
  assert.equal(pickCanonical([o('solo', 'k', '2026-01-04')], '2026-09-20').get('k'), 'solo');
});

test('different series do not borrow each other’s canonical page', () => {
  const canonical = pickCanonical(
    [o('a1', 'A|X', '2026-10-01'), o('b1', 'B|Y', '2026-10-02')],
    '2026-09-20',
  );
  assert.equal(canonical.get('A|X'), 'a1');
  assert.equal(canonical.get('B|Y'), 'b1');
});

test('the choice is stable when two occurrences share a day', () => {
  const same = [o('zeta', 'k', '2026-10-01'), o('alpha', 'k', '2026-10-01')];
  assert.equal(pickCanonical(same, '2026-09-20').get('k'), 'alpha');
  assert.equal(pickCanonical([...same].reverse(), '2026-09-20').get('k'), 'alpha');
});

test('everything that is not canonical is a repeat, and nothing is both', () => {
  const now = new Date('2026-09-20T18:00:00Z');
  for (const town of ['niwot', 'lyons', 'berthoud', 'erie', 'johnstown', 'timnath', 'elizabeth']) {
    const all = readOccurrences(town);
    const repeats = repeatOccurrenceSlugs(town, 'content', now);
    const canonical = new Set(pickCanonical(all, '2026-09-20').values());
    for (const slug of repeats) assert.ok(!canonical.has(slug), `${town}/${slug} is both canonical and a repeat`);
    assert.equal(repeats.size + canonical.size, all.length, `${town}: every page is one or the other`);
  }
});

test('no town indexes a past occurrence while hiding an upcoming one', () => {
  const today = '2026-09-20';
  for (const town of ['niwot', 'lyons', 'berthoud', 'erie', 'johnstown', 'timnath', 'elizabeth']) {
    const all = readOccurrences(town);
    const canonical = pickCanonical(all, today);
    for (const [key, slug] of canonical) {
      const chosen = all.find((x) => x.slug === slug)!;
      if (chosen.startDay >= today) continue;
      const stillToCome = all.filter((x) => x.key === key && x.startDay >= today);
      assert.equal(stillToCome.length, 0, `${town}: indexes past ${slug} while ${stillToCome.length} upcoming are hidden`);
    }
  }
});

test('the sitemap and the page agree on what "over" means, for every real event', () => {
  // Two implementations, deliberately: the sitemap filter runs while Astro's
  // config is loading and can only read raw markdown, while the page has
  // parsed Dates. They decide the same thing — whether to index a listing —
  // so a disagreement is a page carrying noindex while sitting in the sitemap.
  for (const town of ['niwot', 'lyons', 'berthoud', 'erie', 'johnstown', 'timnath', 'elizabeth']) {
    for (const o of readOccurrences(town)) {
      const raw = readFileSync(join('content', town, 'events', `${o.slug}.md`), 'utf8');
      const fm = raw.match(/^---\n([\s\S]*?)\n---/)![1]!;
      const get = (n: string) => (fm.match(new RegExp(`^${n}:\\s*"?([^"\\n]+)"?\\s*$`, 'm'))?.[1] ?? '').trim();
      const allDay = get('allDay') === 'true';
      const end = get('end');
      const start = get('start');

      // The parsed-Date answer, from lib/events.ts.
      const parsed = lastDay({
        data: {
          title: o.slug,
          start: parseLocal(start),
          end: end ? parseLocal(end) : undefined,
          allDay,
        },
      } as never);

      assert.equal(o.lastDay, parsed, `${town}/${o.slug}: markdown says ${o.lastDay}, parsed says ${parsed}`);
    }
  }
});

test('expired events are excluded, and nothing upcoming is', () => {
  const now = new Date('2026-09-20T18:00:00Z');
  for (const town of ['niwot', 'lyons', 'berthoud', 'erie', 'johnstown', 'timnath', 'elizabeth']) {
    const all = readOccurrences(town);
    const expired = pastEventSlugs(town, 'content', now);
    for (const o of all) {
      const isOver = o.lastDay < '2026-09-20';
      assert.equal(expired.has(o.slug), isOver, `${town}/${o.slug} (last day ${o.lastDay})`);
    }
  }
});

test('lastDayOf reads the conventions the content actually uses', () => {
  assert.equal(lastDayOf('2026-09-20', '', true), '2026-09-20', 'one-day all-day');
  assert.equal(lastDayOf('2026-10-17', '2026-10-31', true), '2026-10-31', 'all-day run, end is the last day on');
  assert.equal(lastDayOf('2026-09-20T19:00', '2026-09-20T22:00', false), '2026-09-20', 'timed');
  assert.equal(lastDayOf('2026-09-20T18:00', '', false), '2026-09-20', 'timed, no end');
  assert.equal(lastDayOf('2026-09-20T21:00', '2026-09-21T00:00', false), '2026-09-20', 'ends at midnight');
});
