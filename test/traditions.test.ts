/**
 * Traditions (src/lib/traditions.ts): the record's schema, the two pages'
 * reading of it, the build's warning list, and the fixtures that must never
 * ship. A wrong date is the one failure that ends this work, so the schema
 * cases are the brief's own: a confirmed or moved year without its date,
 * source or check date is refused.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { traditionSchema } from '../src/content/schemas.ts';
import { parseFrontmatter } from '../scripts/lib/frontmatter.ts';
import { liveTowns, findTown } from '../src/config/index.ts';
import {
  CURRENT_SEASONS,
  FIXTURES_DIR,
  TRADITIONS_DIR,
  TRADITION_STATUSES,
  TRADITION_TYPE_INFO,
  fixturesEnabled,
  lastHeld,
  seasonCounts,
  seasonRows,
  staleSoon,
  townGroups,
  rowState,
  rowsByState,
  type TraditionRecord,
} from '../src/lib/traditions.ts';
import { STANDALONE_GUIDES, findHubTown } from '../src/config/hub-towns.ts';
import { placeKey } from '../src/lib/hub-towns.ts';
import { guidesWithTraditions, seasonTypesWithRecords } from '../src/lib/tradition-files.ts';
import { seasonRoutes, traditionRoutes } from '../src/integrations/town-routes.ts';

const schema = traditionSchema();
const TODAY = '2026-11-12';

function record(over: Partial<Record<string, unknown>> = {}): Record<string, unknown> {
  return {
    slug: 'erie-parade',
    name: 'Erie Parade',
    town: { name: 'Erie', guide: 'erie' },
    type: 'parade-of-lights',
    organizer: 'Town of Erie',
    sourceUrl: 'https://example.com/parade',
    years: [{ year: 2026, status: 'confirmed', date: '2026-12-05', checked: TODAY }],
    ...over,
  };
}
const year = (over: Record<string, unknown>) => record({ years: [{ year: 2026, status: 'confirmed', date: '2026-12-05', checked: TODAY, ...over }] });
const issues = (data: unknown) => {
  const r = schema.safeParse(data);
  return r.success ? [] : r.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`);
};
const parsed = (data: unknown) => schema.parse(data) as TraditionRecord;

function filesIn(dir: string): Array<{ file: string; data: Record<string, unknown> }> {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith('.md') && !f.startsWith('_'))
    .map((f) => ({ file: f, data: parseFrontmatter(readFileSync(join(dir, f), 'utf8')).data }));
}

// ---------- the record ----------

test('a sound record parses, dates kept as YYYY-MM-DD', () => {
  assert.deepEqual(issues(record()), []);
  assert.equal(parsed(record()).years[0]!.date, '2026-12-05');
  // YAML hands an unquoted date over as a Date at UTC midnight.
  assert.equal(parsed(year({ date: new Date('2026-12-05T00:00:00Z') })).years[0]!.date, '2026-12-05');
});

test('the build refuses a confirmed or moved year without a date, a source or a check date', () => {
  assert.notDeepEqual(issues(year({ date: undefined })), [], 'confirmed without a date');
  assert.notDeepEqual(issues(year({ status: 'moved', date: undefined, previousDate: '2026-11-28', reason: 'Weather' })), [], 'moved without a date');
  assert.notDeepEqual(issues(year({ checked: undefined })), [], 'without checked');
  assert.notDeepEqual(issues(record({ sourceUrl: undefined })), [], 'without a source');
  assert.notDeepEqual(issues(record({ sourceUrl: 'not a url' })), [], 'a source that is not a URL');
});

test('a moved year carries the old date and the organizer’s reason', () => {
  assert.notDeepEqual(issues(year({ status: 'moved' })), []);
  assert.notDeepEqual(issues(year({ status: 'moved', previousDate: '2026-11-28' })), []);
  assert.deepEqual(issues(year({ status: 'moved', previousDate: '2026-11-28', reason: 'Snow' })), []);
  assert.notDeepEqual(issues(year({ previousDate: '2026-11-28' })), [], 'previousDate only goes with moved');
});

test('a year not announced shows nothing the organizer has not said', () => {
  assert.deepEqual(issues(record({ years: [{ year: 2026, status: 'not-announced', checked: TODAY }] })), []);
  for (const extra of [{ date: '2026-12-05' }, { startTime: '6 pm' }, { place: 'Main Street' }, { cost: 'Free' }]) {
    assert.notDeepEqual(issues(record({ years: [{ year: 2026, status: 'not-announced', checked: TODAY, ...extra }] })), [], JSON.stringify(extra));
  }
});

test('a canceled year needs no date; a year’s date falls in that year', () => {
  assert.deepEqual(issues(record({ years: [{ year: 2026, status: 'canceled', checked: TODAY }] })), []);
  assert.notDeepEqual(issues(year({ date: '2027-01-02' })), []);
});

test('the slug is permanent: no year in it', () => {
  assert.notDeepEqual(issues(record({ slug: 'erie-parade-2026' })), []);
  assert.notDeepEqual(issues(record({ slug: '2026-erie-parade' })), []);
  assert.deepEqual(issues(record({ slug: 'erie-parade-of-lights' })), []);
});

test('years go newest first, one each; an unknown field or status is refused', () => {
  const y = (n: number) => ({ year: n, status: 'not-announced', checked: TODAY });
  assert.notDeepEqual(issues(record({ years: [y(2025), y(2026)] })), []);
  assert.notDeepEqual(issues(record({ years: [y(2026), y(2026)] })), []);
  assert.notDeepEqual(issues(record({ notes: 'x' })), []);
  assert.notDeepEqual(issues(year({ status: 'postponed' })), []);
  assert.notDeepEqual(issues(year({ predicted: '2026-12-05' })), [], 'no field for a predicted date');
});

// ---------- the pages' reading ----------

const r = (slug: string, town: string, guide: string | undefined, type: TraditionRecord['type'], years: TraditionRecord['years']): TraditionRecord => ({
  slug,
  name: `${town} ${type}`,
  town: guide ? { name: town, guide } : { name: town },
  type,
  organizer: 'Org',
  sourceUrl: `https://example.com/${slug}`,
  years,
});
const RECORDS: TraditionRecord[] = [
  r('windsor-p', 'Windsor', 'windsor', 'parade-of-lights', [{ year: 2026, status: 'not-announced', checked: TODAY }, { year: 2025, status: 'confirmed', date: '2025-12-06', checked: TODAY }]),
  r('berthoud-p', 'Berthoud', 'berthoud', 'parade-of-lights', [{ year: 2026, status: 'confirmed', date: '2026-12-05', checked: TODAY }]),
  r('erie-p', 'Erie', 'erie', 'parade-of-lights', [{ year: 2026, status: 'moved', date: '2026-12-12', previousDate: '2026-12-05', reason: 'Road work', checked: TODAY }]),
  r('aspen-p', 'Aspen', undefined, 'parade-of-lights', [{ year: 2026, status: 'canceled', checked: TODAY }]),
  r('old-p', 'Old Town', undefined, 'parade-of-lights', [{ year: 2025, status: 'confirmed', date: '2025-12-06', checked: '2025-11-01' }]),
  r('berthoud-t', 'Berthoud', 'berthoud', 'tree-lighting', [{ year: 2026, status: 'confirmed', date: '2026-11-28', checked: TODAY }]),
  r('berthoud-t2', 'Berthoud', 'berthoud', 'tree-lighting', [{ year: 2026, status: 'not-announced', checked: TODAY }]),
];

test('the season page: one row per town with an entry for the season, A to Z, and its counts', () => {
  const rows = seasonRows(RECORDS, 'parade-of-lights', TODAY);
  assert.deepEqual(rows.map((x) => x.record.town.name), ['Aspen', 'Berthoud', 'Erie', 'Windsor'], 'a record with no 2026 entry is not listed');
  // Confirmed and moved carry an organizer's date; canceled and not announced do not.
  assert.deepEqual(seasonCounts(rows), { towns: 4, confirmed: 2 });
  assert.deepEqual(seasonRows(RECORDS, 'fireworks', TODAY), [], 'no season set, no page');
});

test('a guide’s page: dated soonest first, then not announced; other guides’ records left out', () => {
  const { dated, waiting } = townGroups(RECORDS, 'berthoud', TODAY);
  assert.deepEqual(dated.map((x) => x.record.slug), ['berthoud-t', 'berthoud-p']);
  assert.deepEqual(waiting.map((x) => x.record.slug), ['berthoud-t2']);
  assert.deepEqual(townGroups(RECORDS, 'lyons', TODAY), { dated: [], canceled: [], waiting: [] });
});

test('a canceled year is its own state: never upcoming, never waiting for a date (audit, 13 November 2026)', () => {
  const canceled = (date?: string) =>
    r('w-p', 'Wellington', 'wellington', 'parade-of-lights', [{ year: 2026, status: 'canceled', ...(date ? { date } : {}), checked: TODAY }]);
  // No date had been set, as Wellington's record has it.
  const [undated] = seasonRows([canceled()], 'parade-of-lights', TODAY);
  assert.equal(rowState(undated!), 'canceled');
  // A date had been set and is still ahead: still canceled, not upcoming.
  const [ahead] = seasonRows([canceled('2026-12-20')], 'parade-of-lights', TODAY);
  assert.equal(rowState(ahead!), 'canceled');
  const groups = rowsByState(seasonRows(RECORDS, 'parade-of-lights', TODAY));
  assert.deepEqual(groups.canceled.map((x) => x.record.slug), ['aspen-p']);
  assert.ok(!groups.waiting.some((x) => x.record.slug === 'aspen-p'));
  const guide = townGroups([canceled('2026-12-20')], 'wellington', TODAY);
  assert.deepEqual([guide.dated.length, guide.canceled.length, guide.waiting.length], [0, 1, 0]);
});

test('"Last held" is an earlier year the organizer dated and that has passed; never a canceled or future one', () => {
  const years: TraditionRecord['years'] = [
    { year: 2026, status: 'not-announced', checked: TODAY },
    { year: 2025, status: 'canceled', date: '2025-12-06', checked: TODAY },
    { year: 2024, status: 'confirmed', date: '2024-12-07', checked: TODAY },
  ];
  assert.equal(lastHeld({ years }, 2026, TODAY), '2024-12-07');
  assert.equal(lastHeld({ years: [years[0]!] }, 2026, TODAY), undefined);
  assert.equal(seasonRows([r('w', 'W', undefined, 'parade-of-lights', years)], 'parade-of-lights', TODAY)[0]!.lastHeld, '2024-12-07');
});

test('the build’s warning list: dated in the next 30 days with a check over 14 days old', () => {
  const at = (date: string, checked: string) => r(`x-${date}-${checked}`, 'X', undefined, 'parade-of-lights', [{ year: Number(date.slice(0, 4)), status: 'confirmed', date, checked }]);
  const list = staleSoon(
    [
      at('2026-12-12', '2026-10-28'), // 30 days ahead, checked 15 days ago: listed
      at('2026-12-13', '2026-10-01'), // 31 days ahead: not yet
      at('2026-12-01', '2026-10-29'), // checked 14 days ago: fine
      at('2026-11-11', '2026-10-01'), // already past
    ],
    TODAY,
  );
  assert.deepEqual(list.map((s) => s.date), ['2026-12-12']);
});

// ---------- fixtures ----------

test('the fixtures switch is off by default and refused on Vercel', () => {
  assert.equal(fixturesEnabled({}), false);
  assert.equal(fixturesEnabled({ TRADITIONS_FIXTURES: '1' }), true);
  assert.throws(() => fixturesEnabled({ TRADITIONS_FIXTURES: '1', VERCEL: '1' }), /never ship/);
  assert.equal(fixturesEnabled({ VERCEL: '1' }), false);
});

test('the fixtures are valid, clearly marked, and show all four statuses', () => {
  const fixtures = filesIn(FIXTURES_DIR);
  assert.ok(fixtures.length >= 2);
  const statuses = new Set<string>();
  for (const { file, data } of fixtures) {
    assert.deepEqual(issues(data), [], file);
    const rec = parsed(data);
    assert.equal(rec.fixture, true, `${file}: fixture: true`);
    assert.ok(rec.slug.startsWith('fixture-'), `${file}: slug starts fixture-`);
    assert.equal(file, `${rec.slug}.md`);
    assert.match(rec.name, /fixture/i, `${file}: the name says fixture`);
    assert.match(rec.sourceUrl, /^https:\/\/example\.com\//, `${file}: links go nowhere real`);
    statuses.add(rec.years[0]!.status);
  }
  // `typical` is an outdoor date's status (a window, never a date); the holiday fixtures show the other four.
  assert.deepEqual([...statuses].sort(), TRADITION_STATUSES.filter((x) => x !== 'typical').sort());
});

test('without the switch, no fixture reaches a route', () => {
  const off = {};
  for (const guide of guidesWithTraditions('.', off)) {
    const files = filesIn(TRADITIONS_DIR).filter(({ data }) => (data.town as { guide?: string })?.guide === guide);
    assert.ok(files.length > 0, `${guide} has /traditions/ only from a record in ${TRADITIONS_DIR}`);
  }
  const on = { TRADITIONS_FIXTURES: '1' };
  assert.ok(guidesWithTraditions('.', on).has('berthoud'));
  // The three holiday seasons, and the five opened with the additions of 12 November 2026.
  assert.deepEqual(seasonTypesWithRecords('.', on).filter((t) => t !== 'outdoor'), ['parade-of-lights', 'tree-lighting', 'turkey-trot', 'rodeo-fair', 'oktoberfest', 'harvest-festival', 'winter-carnival', 'free-day']);
});

test('the routes: /traditions/ only on a guide a record names; a hub page per season type with a record', () => {
  const live = new Set(liveTowns().map((t) => t.slug));
  const withRecords = guidesWithTraditions();
  for (const slug of live) assert.equal(traditionRoutes({ slug }).length, withRecords.has(slug) ? 1 : 0, slug);
  for (const [pattern] of seasonRoutes()) {
    assert.ok(Object.values(TRADITION_TYPE_INFO).some((i) => i.path === `${pattern}/`), pattern);
    assert.doesNotMatch(pattern, /\d{4}/, 'no year in the address');
  }
  // Turkey trots opened on 12 November 2026 with six verified records.
  assert.deepEqual(Object.keys(CURRENT_SEASONS).sort(), ['free-day', 'harvest-festival', 'oktoberfest', 'outdoor', 'parade-of-lights', 'rodeo-fair', 'tree-lighting', 'turkey-trot', 'winter-carnival']);
});

// ---------- approved records and drafts ----------

test('every approved record is valid, named for its slug, real, and names places the network has', () => {
  for (const { file, data } of filesIn(TRADITIONS_DIR)) {
    assert.deepEqual(issues(data), [], file);
    const rec = parsed(data);
    assert.equal(file, `${rec.slug}.md`);
    assert.ok(!rec.fixture && !rec.slug.startsWith('fixture-'), `${file}: a fixture in content/`);
    if (rec.town?.guide) {
      const key = placeKey(rec.town.guide);
      assert.ok(key, `${file}: ${rec.town.guide} is not a hub town or a standalone guide`);
      // The town is the page's or the guide's own, or, on the one guide to
      // three towns, the town of the three the event is held in: Frederick's
      // Festival of Lights says Frederick, not "Carbon Valley"; or one of a
      // guide's sections (Windsor's Severance, since 13 November 2026).
      const guide = findTown(STANDALONE_GUIDES[key!]?.guide ?? '');
      const sections = (guide?.subTowns ?? []).map((t) => t.charAt(0).toUpperCase() + t.slice(1));
      const names = [...(STANDALONE_GUIDES[key!]?.towns ?? [findHubTown(key!)?.name ?? guide!.name]), ...sections];
      assert.ok(names.includes(rec.town.name), `${file}: ${rec.town.name}`);
    }
    for (const t of rec.towns ?? []) assert.ok(placeKey(t.slug), `${file}: towns names ${t.slug}`);
    // Rule 5: every date has a source and a checked date.
    assert.match(rec.sourceUrl, /^https?:\/\//, file);
    for (const y of rec.years) assert.match(y.checked, /^\d{4}-\d{2}-\d{2}$/, `${file}: ${y.year} checked`);
  }
});

test('every draft in docs/agent/traditions/ is a record the owner can approve by moving it', () => {
  for (const { file, data } of filesIn('docs/agent/traditions')) {
    assert.deepEqual(issues(data), [], file);
    const rec = parsed(data);
    assert.equal(file, `${rec.slug}.md`);
    assert.ok(!rec.fixture, file);
    assert.ok(rec.years.some((y) => y.year === 2026), `${file}: a 2026 entry`);
    // As the validator will hold it once moved: a live guide, under its own name.
    assert.ok(rec.town?.guide && placeKey(rec.town.guide), `${file}: names a place the network has`);
  }
});

test('the research agent writes under docs/agent/ only, never to the collection', () => {
  const agent = readFileSync('agent/agent.mjs', 'utf8');
  assert.ok(!agent.includes(TRADITIONS_DIR), 'agent.mjs never names content/hub/traditions');
  for (const m of agent.matchAll(/outFile:\s*path\.join\((\w+)/g)) assert.equal(m[1], 'outDir');
  assert.match(agent, /const outDir = path\.join\(root, 'docs', 'agent'/);
});
