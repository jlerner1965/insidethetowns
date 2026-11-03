/**
 * The development tracker's re-check: the Town's map rows shaped the same
 * way every night, a diff that is about facts and not formatting, and a
 * report that names the page to update.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { diffProjects, formatReport, toProject, type Project, type Snapshot } from '../scripts/lib/development.ts';

const row = (over: Partial<Record<string, unknown>> = {}) => ({
  OBJECTID: 2,
  GlobalID: 'g-2',
  Name: 'Harvest West',
  Project_Type: 'Preliminary Plat',
  Project_Type2: null,
  Project_Type3: 'Not Applicable',
  Review_Status: 'IDR',
  Description: 'Preliminary Plat to create 79 single-family residential lots',
  Location: 'West of Harvest Ridge South  between Hwy 287 and S. Berthoud Pkwy ',
  Planning_Comm: 'TBD',
  Board_Trustees: 'TBD',
  Submittal_Number: '3RD',
  Notes: 'Original submittal deemed complete 8/25/25.\r\n3rd submittal received 5/12/2026',
  Developer: '  ',
  ...over,
});

const snap = (projects: Project[], read: string, townEdited = '2026-10-15'): Snapshot => ({
  town: 'berthoud',
  source: { label: 'Town of Berthoud Development Activity Map', page: 'https://berthoud.org/180/Current-Development-Review-Projects', layer: 'https://example.test/FeatureServer/0' },
  article: 'content/berthoud/articles/whats-being-built-in-berthoud.md',
  read,
  townEdited,
  projects,
});

test('a row is shaped: whitespace collapsed, abbreviations spelled out, N/A types dropped, keyed by the Town id', () => {
  const p = toProject(row());
  assert.equal(p.id, 'g-2');
  assert.equal(p.type, 'Preliminary Plat');
  assert.equal(p.status, 'In development review');
  assert.equal(p.location, 'West of Harvest Ridge South between Hwy 287 and S. Berthoud Pkwy');
  assert.equal(p.notes, 'Original submittal deemed complete 8/25/25. 3rd submittal received 5/12/2026');
  assert.equal(p.developer, '');
  assert.equal(toProject(row({ Project_Type: 'NMP', Project_Type2: 'Rezoning' })).type, 'Neighborhood master plan + Rezoning');
  assert.equal(toProject(row({ GlobalID: null })).id, 'objectid:2');
});

test('a diff sees a status change, a new row and a row gone, and nothing in formatting', () => {
  const before = [toProject(row()), toProject(row({ OBJECTID: 9, GlobalID: 'g-9', Name: 'Dollar General', Review_Status: 'Withdrawn' }))];
  const same = diffProjects(before, [toProject(row({ Location: 'West of Harvest Ridge South between Hwy 287 and S. Berthoud Pkwy' })), before[1]!]);
  assert.deepEqual(same, { added: [], removed: [], changed: [] });

  const after = [toProject(row({ Review_Status: 'Approved', Board_Trustees: '11/10/2026' })), toProject(row({ OBJECTID: 60, GlobalID: 'g-60', Name: 'Mountain View', Project_Type: 'Annexation' }))];
  const d = diffProjects(before, after);
  assert.equal(d.changed.length, 1);
  assert.equal(d.changed[0]!.project.name, 'Harvest West');
  assert.deepEqual(d.changed[0]!.fields, [
    { field: 'status', from: 'In development review', to: 'Approved' },
    { field: 'board', from: 'TBD', to: '11/10/2026' },
  ]);
  assert.deepEqual(d.added.map((p) => p.name), ['Mountain View']);
  assert.deepEqual(d.removed.map((p) => p.name), ['Dollar General']);
});

test('the report names what moved and the page that now lags, or says nothing moved', () => {
  const before = [toProject(row())];
  const after = [toProject(row({ Review_Status: 'Approved' }))];
  const prev = snap(before, '2026-11-03');
  const next = snap(after, '2026-11-11', '2026-11-10');
  const r = formatReport(prev, next, diffProjects(before, after), 'Berthoud');
  assert.match(r, /^## Berthoud: the Town's development map/);
  assert.match(r, /the Town edited it 2026-11-10 \(it was 2026-10-15 at the last read\)/);
  assert.match(r, /### Changed \(1\)/);
  assert.match(r, /\*\*Harvest West\*\* \(Approved\)\n  - status: "In development review" → "Approved"/);
  assert.match(r, /`content\/berthoud\/articles\/whats-being-built-in-berthoud.md` says what the map said on 2026-11-03/);

  const quiet = formatReport(prev, snap(before, '2026-11-04'), diffProjects(before, before), 'Berthoud');
  assert.match(quiet, /No row changed since 2026-11-03/);
  assert.doesNotMatch(quiet, /### /);
});
