/**
 * The review's edits, as text: approval stamps and moves, a change is
 * written in and the flag cleared, a dismissal clears the flag and nothing
 * else. Byte-for-byte on everything not named, because these files are
 * also written by hand.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { z } from 'astro/zod';
import { applyChangeText, approveText, dismissChangeText, getField, removeField, setField, summarize } from '../scripts/lib/review.ts';
import { parseFrontmatter } from '../scripts/lib/frontmatter.ts';
import { changeSchema, eventSchema } from '../src/content/schemas.ts';
import { towns } from '../src/config/towns/registry.ts';

const STAGED = `---
title: "Toddler Storytime"
review: { reason: "Ingested from library.example; check", since: "2026-10-04", from: ingest }
start: "2026-10-06T10:30"
venue: "Elizabeth Library"
category: family
source: "https://library.example/event/1"
sourceId: "lib"
---

<!-- The organizer's own text. -->

Songs and stories.
`;

const PUBLISHED = `---
title: "Board of Trustees meeting"
start: "2026-10-05T19:00"
end: "2026-10-05T21:00"
venue: "Lyons Town Hall"
category: civic
source: "https://www.townoflyons.com/Calendar.aspx?EID=6676"
verified: "2026-10-03"
changeFlag: true
changeNote: "townoflyons.com now says: end 2026-10-05T21:00 → 2026-10-05T23:00"
---

The regular meeting.
`;

const schema = eventSchema(() => z.string());

test('set, get and remove touch one line and leave the rest alone', () => {
  const set = setField(STAGED, 'verified', '"2026-10-04"');
  assert.equal(getField(set, 'verified'), '"2026-10-04"');
  assert.ok(set.endsWith('Songs and stories.\n'));
  const replaced = setField(set, 'verified', '"2026-10-05"');
  assert.equal((replaced.match(/^verified:/gm) ?? []).length, 1);
  assert.equal(getField(removeField(replaced, 'verified'), 'verified'), undefined);
  assert.equal(removeField(STAGED, 'nothing'), STAGED);
});

test('approval drops the review block and stamps who checked and when; the result is publishable', () => {
  const out = approveText(STAGED, '2026-10-04', 'James');
  assert.equal(getField(out, 'review'), undefined);
  assert.equal(getField(out, 'verified'), '"2026-10-04"');
  assert.equal(getField(out, 'verifiedBy'), '"James"');
  const data = schema.parse(parseFrontmatter(out).data);
  assert.equal(data.review, undefined);
  assert.equal(data.verifiedBy, 'James');
  assert.ok(out.includes("<!-- The organizer's own text. -->"), 'the body is not the review\'s to change');
});

test('applying a change writes the new facts, clears the flag and re-stamps', () => {
  const change = changeSchema.parse({
    slug: 'board-of-trustees-2026-10-05',
    sourceId: 'townoflyons-com',
    sourceUrl: 'https://www.townoflyons.com/Calendar.aspx?EID=6676',
    detected: '2026-10-04',
    changes: [{ field: 'end', was: '2026-10-05T21:00', now: '2026-10-05T23:00' }],
  });
  const out = applyChangeText(PUBLISHED, change, 'townoflyons.com', '2026-10-04', 'James');
  assert.equal(getField(out, 'end'), '"2026-10-05T23:00"');
  assert.equal(getField(out, 'start'), '"2026-10-05T19:00"');
  assert.equal(getField(out, 'changeFlag'), undefined);
  assert.equal(getField(out, 'changeNote'), undefined);
  assert.equal(getField(out, 'verified'), '"2026-10-04"');
  const data = schema.parse(parseFrontmatter(out).data);
  assert.equal(data.changeFlag, false);
  assert.ok(out.endsWith('The regular meeting.\n'));
});

test('a cancellation applied becomes a status with a note naming the source', () => {
  const change = changeSchema.parse({
    slug: 'x',
    sourceId: 'townoflyons-com',
    sourceUrl: 'https://www.townoflyons.com/Calendar.aspx?EID=6676',
    detected: '2026-10-04',
    cancel: true,
    changes: [{ field: 'status', was: 'scheduled', now: 'canceled' }],
  });
  const out = applyChangeText(PUBLISHED, change, 'townoflyons.com', '2026-10-04', 'James');
  const data = schema.parse(parseFrontmatter(out).data);
  assert.equal(data.status, 'canceled');
  assert.match(data.statusNote ?? '', /townoflyons\.com lists this as canceled/);
  assert.equal(data.statusSource, change.sourceUrl);
});

test('dismissing a change clears the flag and changes nothing else', () => {
  const out = dismissChangeText(PUBLISHED);
  assert.equal(getField(out, 'changeFlag'), undefined);
  assert.equal(getField(out, 'changeNote'), undefined);
  assert.equal(getField(out, 'end'), '"2026-10-05T21:00"');
  assert.equal(getField(out, 'verified'), '"2026-10-03"');
});

test('the summary counts what is in staging today', () => {
  const johnstown = towns.find((t) => t.slug === 'johnstown')!;
  const s = summarize(johnstown, 'content');
  assert.ok(s.waiting.changes >= 0 && s.waiting.events >= 0 && s.waiting.places >= 0);
  // Every live town summarises without throwing, with the three parts present.
  for (const t of towns) {
    const x = summarize(t, 'content');
    assert.ok(Array.isArray(x.goingStale) && Array.isArray(x.brokenSources) && typeof x.waiting.events === 'number', t.slug);
  }
});

test('approving a place stamps the day it goes on the guide, and keeps one it already had', () => {
  const staged = `---
title: "Corner Café"
review: { reason: "New on its town's list", since: "2026-10-04", from: ingest }
type: coffee
address: "1 Main St"
summary: "A café."
source: "https://cafe.example/"
---
`;
  assert.equal(getField(approveText(staged, '2026-10-06', 'James', 'place'), 'added'), '"2026-10-06"');
  assert.equal(getField(approveText(staged, '2026-10-06', 'James'), 'added'), undefined, 'an event has no such field');
  const returning = staged.replace('source:', 'added: "2026-09-17"\nsource:');
  assert.equal(getField(approveText(returning, '2026-10-06', 'James', 'place'), 'added'), '"2026-09-17"');
});

// The queue holds what the nightly re-check flags, not only what ingest files a change for.

import { mkdtempSync, mkdirSync, writeFileSync as writeFs } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { clearFlagText, readQueue } from '../scripts/lib/review.ts';

test('a published event flagged by the re-check is in the queue as a flag, with its note, among the changes', () => {
  const lyons = towns.find((t) => t.slug === 'lyons')!;
  const content = mkdtempSync(join(tmpdir(), 'itt-review-'));
  mkdirSync(join(content, 'lyons', 'events'), { recursive: true });
  mkdirSync(join(content, 'lyons', 'staging', 'events'), { recursive: true });
  mkdirSync(join(content, 'lyons', 'staging', 'changes'), { recursive: true });
  const flagged = PUBLISHED.replace('townoflyons.com now says: end 2026-10-05T21:00 → 2026-10-05T23:00', 'recheck 2026-10-18: the source page answers 404');
  writeFs(join(content, 'lyons', 'events', 'board-of-trustees-2026-10-05.md'), flagged);
  // An ingest change on another listing: it keeps its own kind, and is not doubled as a flag.
  writeFs(join(content, 'lyons', 'events', 'market-2026-10-10.md'), PUBLISHED.replace('Board of Trustees meeting', 'Farmers Market'));
  writeFs(
    join(content, 'lyons', 'staging', 'changes', 'market-2026-10-10.json'),
    JSON.stringify({ slug: 'market-2026-10-10', sourceId: 'townoflyons-com', sourceUrl: 'https://www.townoflyons.com/x', detected: '2026-10-18', changes: [{ field: 'start', was: 'a', now: 'b' }] }),
  );
  writeFs(join(content, 'lyons', 'events', 'quiet-2026-10-12.md'), PUBLISHED.replace(/changeFlag: true\nchangeNote: .*\n/, ''));
  writeFs(join(content, 'lyons', 'staging', 'events', 'new-2026-10-20.md'), STAGED);
  const queue = readQueue(lyons, content);
  assert.deepEqual(
    queue.map((i) => i.kind),
    ['change', 'flag', 'event'],
    'cancellations and changes first, a flag with them, then staged places and events',
  );
  const flag = queue.find((i) => i.kind === 'flag')!;
  assert.equal(flag.kind === 'flag' && flag.note, 'recheck 2026-10-18: the source page answers 404');
  assert.equal(queue.filter((i) => i.kind === 'flag').length, 1, 'the listing with a change file is a change, not also a flag');
});

test('answering a flag clears it and stamps the check; the listing is otherwise as the editor left it', () => {
  const out = clearFlagText(PUBLISHED, '2026-10-18', 'James');
  assert.equal(getField(out, 'changeFlag'), undefined);
  assert.equal(getField(out, 'changeNote'), undefined);
  assert.equal(getField(out, 'verified'), '"2026-10-18"');
  assert.equal(getField(out, 'verifiedBy'), '"James"');
  assert.equal(getField(out, 'end'), '"2026-10-05T21:00"');
  assert.ok(out.endsWith('The regular meeting.\n'));
  schema.parse(parseFrontmatter(out).data);
});
