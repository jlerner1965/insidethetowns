/**
 * The tradition date watch and the seasonal roundups due (the owner, 18
 * November 2026): src/lib/date-watch.ts, src/lib/roundups.ts,
 * scripts/date-watch.ts, scripts/needs-me.ts.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { promisify } from 'node:util';
import { decideDate, deriveDateWindow, openFindings, readDates, watchState, windowCovers, type WatchFinding } from '../src/lib/date-watch.ts';
import { parseFrontmatter } from '../scripts/lib/frontmatter.ts';
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

test('a date is written only where the page states the year, or a weekday that fits, in the future and inside the window', () => {
  const window = { start: '12-03', end: '12-06' };
  const decide = (text: string, today = '2027-10-20', ld: string[] = []) => decideDate(readDates(text, ld, 2027), 2027, window, today);
  // The year stated: confirmed, with the words read; last year's date on the same page is not this year's.
  const stated = decide('The 2027 parade is Saturday, December 4th, 2027 at 6 pm. Last year: December 5, 2026.');
  assert.equal(stated.kind, 'confirm');
  assert.equal(stated.kind === 'confirm' && stated.date, '2027-12-04');
  assert.match(stated.kind === 'confirm' ? stated.text : '', /Saturday, December 4th, 2027/);
  assert.equal(decide('Save the date: 12/4/2027. Board meeting March 3, 2027.').kind, 'confirm', 'a date far from the window is another thing on the page');
  // A weekday that is that date's in the year: 4 December 2027 is a Saturday.
  const weekday = decide('Join us Saturday, December 4 at 6 pm on Main Street.');
  assert.deepEqual(weekday.kind === 'confirm' && [weekday.date, weekday.basis], ['2027-12-04', 'weekday']);
  // Two to four consecutive days: a date and an endDate.
  const weekend = decide('Festival weekend Dec. 4–5, 2027.');
  assert.deepEqual(weekend.kind === 'confirm' && [weekend.date, weekend.endDate], ['2027-12-04', '2027-12-05']);
  // Everything else is a person's.
  const review = (text: string, why: RegExp, today?: string, ld?: string[]) => {
    const d = decide(text, today, ld);
    assert.equal(d.kind, 'review', text);
    assert.match(d.kind === 'review' ? d.why : '', why, text);
  };
  review('Join us December 4 at 6 pm.', /no year/);
  review('Join us Saturday, December 5 at 6 pm.', /no year, and its weekday is not that date’s in 2027/, undefined);
  review('Saturday, December 5, 2027', /weekday that is not that date’s/);
  review('Saturday, December 4, 2027', /not in the future/, '2027-12-04');
  review('Thursday, December 9, 2027', /outside its typical window/);
  review('Dec. 3, 2027 and Dec. 6, 2027', /several 2027 dates/);
  review('Festival December 3 to 10, 2027', /several 2027 dates/, undefined);
  review('Our calendar.', /only in the page’s event data/, undefined, ['2027-12-04T18:00:00-07:00']);
  // Nothing near the window: not announced.
  assert.equal(decide('Board meeting March 3, 2027.').kind, 'none');
  assert.deepEqual(readDates('February 30, 2027', [], 2027), [], 'no such day');
});

test('a date with no year on the organizer’s page goes to the needs-me list, not the page; one with its year is written with the page and the words read', async () => {
  const pages: Record<string, string> = {
    '/parade': '<html><body><main><h1>Holiday Parade of Lights</h1><p>Join us on Main Street December 4 at 6 pm for the parade.</p></main></body></html>',
    '/tree': '<html><body><main><h1>Tree Lighting</h1><p>The tree lighting is Saturday, December 4, 2027, 3–6 pm, with the lighting at 5 pm.</p></main></body></html>',
  };
  const server = createServer((req, res) => {
    const body = pages[req.url ?? ''];
    res.writeHead(body ? 200 : 404, { 'content-type': 'text/html' }).end(body ?? 'not found');
  });
  await new Promise<void>((ok) => server.listen(0, '127.0.0.1', ok));
  const port = (server.address() as { port: number }).port;
  const dir = mkdtempSync(join(tmpdir(), 'watch-'));
  const record = (slug: string, name: string, path: string) =>
    `---\nslug: ${slug}\nname: "${name}"\ntown:\n  name: Lyons\n  guide: lyons\ntype: parade-of-lights\norganizer: "Town of Lyons"\nsourceUrl: "http://127.0.0.1:${port}${path}"\ndateWindow:\n  start: "12-03"\n  end: "12-06"\nyears:\n  - year: 2026\n    status: confirmed\n    date: 2026-12-05\n    checked: 2026-11-17\n---\n`;
  try {
    const parade = join(dir, 'lyons-parade-of-lights.md');
    const tree = join(dir, 'lyons-tree-lighting.md');
    writeFileSync(parade, record('lyons-parade-of-lights', 'Lyons Holiday Parade of Lights', '/parade'));
    writeFileSync(tree, record('lyons-tree-lighting', 'Lyons Tree Lighting', '/tree'));
    const before = readFileSync(parade, 'utf8');
    const findingsFile = join(dir, 'date-watch.json');
    // As of 20 October 2027: both windows open on 4 December, so both are watched.
    await promisify(execFile)('node', ['scripts/date-watch.ts', `--dir=${dir}`, `--findings=${findingsFile}`, '--today=2027-10-20', '--write', '--by=the test']);
    // No year: nothing written to the record, so nothing reaches its page...
    assert.equal(readFileSync(parade, 'utf8'), before);
    const records = [parade, tree].map((f) => parseFrontmatter(readFileSync(f, 'utf8')).data as unknown as Parameters<typeof watchState>[0] & { slug: string });
    assert.equal(watchState(records[0]!, '2027-10-20')!.state, 'watch', 'the page shows no 2027 date');
    // ...and the finding, with the page and the words read, is on the needs-me list.
    const findings = (JSON.parse(readFileSync(findingsFile, 'utf8')) as { findings: WatchFinding[] }).findings;
    const open = openFindings(findings, records, '2027-10-20');
    assert.deepEqual(open.map((f) => f.slug), ['lyons-parade-of-lights']);
    assert.match(open[0]!.why, /no year/);
    assert.match(open[0]!.text!, /December 4 at 6 pm/);
    assert.equal(open[0]!.url, `http://127.0.0.1:${port}/parade`);
    // The year stated: written confirmed, with the page's address and the words read there.
    const written = readFileSync(tree, 'utf8');
    assert.match(written, / {2}- year: 2027\n {4}status: confirmed\n {4}date: 2027-12-04\n {4}sourceUrl: "http:\/\/127\.0\.0\.1:\d+\/tree"\n {4}readText: ".*Saturday, December 4, 2027.*"\n {4}checked: \d{4}-\d{2}-\d{2}\n {2}- year: 2026/);
    assert.equal(watchState(records[1]!, '2027-10-20')!.state, 'settled');
    // The needs-me list reads the findings file the watch keeps.
    const needsMe = readFileSync('scripts/needs-me.ts', 'utf8');
    assert.match(needsMe, /openFindings\(watchFindings, rawRecords\(root\), today\)/);
  } finally {
    server.close();
    rmSync(dir, { recursive: true, force: true });
  }
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
