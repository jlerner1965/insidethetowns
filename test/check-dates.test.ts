/**
 * No check date in the future (the audit of 13 November 2026): 702
 * `checked` values read 13 November while it was still the 12th in
 * Colorado, written in the evening by runs that took the day from UTC.
 * A source cannot have been read on a day that has not come yet where the
 * site is, so every provenance date in content/ and data/ is on or before
 * today's Denver date.
 */
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';
import { dayKey } from '../src/lib/dates.ts';

const FIELDS = /["']?\b(checked|verified|read|lastChecked|verifiedOn)\b["']?\s*:\s*["']?(\d{4}-\d{2}-\d{2})/g;

function files(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return files(path);
    return /\.(md|json|ya?ml)$/.test(name) ? [path] : [];
  });
}

test('every check, verification and read date is on or before today in Colorado', () => {
  const today = dayKey(new Date());
  const ahead: string[] = [];
  for (const file of [...files('content'), ...files('data')]) {
    for (const m of readFileSync(file, 'utf8').matchAll(FIELDS)) if (m[2]! > today) ahead.push(`${file}: ${m[1]} ${m[2]}`);
  }
  assert.deepEqual(ahead.slice(0, 10), [], `${ahead.length} dates after ${today}, Denver's date; a run took the day from UTC (use dayKey)`);
});
