/**
 * Which occurrence of a recurring series gets indexed.
 *
 * The rule decides both the page's noindex and the sitemap, so getting it
 * wrong points search engines at an event that has already happened while
 * hiding the one a reader could attend.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { finalDayOf, lastDayOf, pastEventSlugs, performanceStarts, pickCanonical, readOccurrences, repeatOccurrenceSlugs, type Occurrence } from '../src/lib/series.ts';
import { finalDay } from '../src/lib/events.ts';
import { parseLocal } from '../src/lib/dates.ts';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { towns } from '../src/config/towns/registry.ts';

/** Every configured town, live or not: a town's series rules hold before it launches. */
const TOWN_SLUGS = towns.map((t) => t.slug);

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
  for (const town of TOWN_SLUGS) {
    const all = readOccurrences(town);
    const repeats = repeatOccurrenceSlugs(town, 'content', now);
    const canonical = new Set(pickCanonical(all, '2026-09-20').values());
    for (const slug of repeats) assert.ok(!canonical.has(slug), `${town}/${slug} is both canonical and a repeat`);
    assert.equal(repeats.size + canonical.size, all.length, `${town}: every page is one or the other`);
  }
});

test('no town indexes a past occurrence while hiding an upcoming one', () => {
  for (const today of ['2026-09-20', '2026-10-09', '2026-11-20']) {
    for (const town of TOWN_SLUGS) {
      const all = readOccurrences(town);
      const canonical = pickCanonical(all, today);
      for (const [key, slug] of canonical) {
        const chosen = all.find((x) => x.slug === slug)!;
        if (chosen.lastDay >= today) continue;
        const stillOn = all.filter((x) => x.key === key && x.lastDay >= today);
        assert.equal(stillOn.length, 0, `${town} on ${today}: indexes past ${slug} while ${stillOn.length} still on are hidden`);
      }
    }
  }
});

test('a file still running is indexed ahead of a later one in the same series', () => {
  // Lyons' Wayback karaoke: one file every Friday through December 4, the
  // next from December 11. The first was the repeat while it was running.
  const series: Occurrence[] = [
    { slug: 'karaoke-wayback-bar', key: 'k', startDay: '2026-09-18', lastDay: '2026-12-04' },
    { slug: 'karaoke-at-the-wayback-bar', key: 'k', startDay: '2026-12-11', lastDay: '2026-12-25' },
  ];
  assert.equal(pickCanonical(series, '2026-10-09').get('k'), 'karaoke-wayback-bar');
  assert.equal(pickCanonical(series, '2026-12-05').get('k'), 'karaoke-at-the-wayback-bar');
});

test('the sitemap and the page agree on what "over" means, for every real event', () => {
  // Two implementations, deliberately: the sitemap filter runs while Astro's
  // config is loading and can only read raw markdown, while the page has
  // parsed Dates. They decide the same thing — whether to index a listing —
  // so a disagreement is a page carrying noindex while sitting in the sitemap.
  for (const town of TOWN_SLUGS) {
    for (const o of readOccurrences(town)) {
      const raw = readFileSync(join('content', town, 'events', `${o.slug}.md`), 'utf8');
      const fm = raw.match(/^---\n([\s\S]*?)\n---/)![1]!;
      const get = (n: string) => (fm.match(new RegExp(`^${n}:\\s*"?([^"\\n]+)"?\\s*$`, 'm'))?.[1] ?? '').trim();
      const allDay = get('allDay') === 'true';
      const end = get('end');
      const start = get('start');
      const until = get('until');
      const performances = performanceStarts(fm);

      // The parsed-Date answer, from lib/events.ts, across every date the
      // file has: the page's noindex asks it, and the sitemap the markdown's.
      const parsed = finalDay({
        data: {
          title: o.slug,
          start: parseLocal(start),
          end: end ? parseLocal(end) : undefined,
          allDay,
          repeat: get('repeat') || undefined,
          until: until ? parseLocal(until) : undefined,
          performances: performances.length ? performances.map((p) => ({ start: parseLocal(p) })) : undefined,
        },
      } as never);

      assert.equal(o.lastDay, parsed, `${town}/${o.slug}: markdown says ${o.lastDay}, parsed says ${parsed}`);
    }
  }
});

test('expired events are excluded, and nothing upcoming is', () => {
  const now = new Date('2026-09-20T18:00:00Z');
  for (const town of TOWN_SLUGS) {
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

test('finalDayOf runs to a weekly repeat’s last week and a production’s closing show', () => {
  // Tuesdays from September 22; December 15 is a Tuesday, December 16 is not.
  assert.equal(finalDayOf('2026-09-22T18:00', '', false, { repeat: 'weekly', until: '2026-12-15' }), '2026-12-15');
  assert.equal(finalDayOf('2026-09-22T18:00', '', false, { repeat: 'weekly', until: '2026-12-16' }), '2026-12-15');
  // An evening that ends after midnight ends on the next day, every week.
  assert.equal(finalDayOf('2026-09-25T21:00', '2026-09-26T01:00', false, { repeat: 'weekly', until: '2026-10-09' }), '2026-10-10');
  assert.equal(finalDayOf('2026-10-09T19:00', '', false, { performances: ['2026-10-09T19:00', '2026-10-24T19:00'] }), '2026-10-24');
});

test('performanceStarts reads a list, plain or with notes, and an inline array', () => {
  const block = 'title: "X"\nperformances:\n  - { start: "2026-10-09T19:00", note: "sold out" }\n  - "2026-10-10T19:00"\nvenue: "Y"\nend: "2026-10-30T19:00"';
  assert.deepEqual(performanceStarts(block), ['2026-10-09T19:00', '2026-10-10T19:00']);
  assert.deepEqual(performanceStarts('performances: ["2026-12-18T19:30", "2026-12-19T14:00"]\ncost: "$5"'), ['2026-12-18T19:30', '2026-12-19T14:00']);
  assert.deepEqual(performanceStarts('title: "X"'), []);
});
