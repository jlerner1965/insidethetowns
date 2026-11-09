/**
 * HOW-IT-WORKS.md is the rulebook, and where it disagrees with another
 * document it wins, so its table of towns cannot be the thing that is out
 * of date. On 9 November 2026 it still listed Carbon Valley and Clear Creek
 * as guides in the weekly email and Evergreen and Manitou Springs as visitor
 * guides, a week after all four were retired. The configs decide what a
 * guide is; this holds the table to them.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { towns } from '../src/config/towns/registry.ts';
import type { TownConfig } from '../src/config/towns/types.ts';

const doc = readFileSync(new URL('../HOW-IT-WORKS.md', import.meta.url), 'utf8');

/** The towns cell of the table row that starts with this kind. */
function row(kind: string): string {
  const line = doc.split('\n').find((l) => l.startsWith(`| ${kind} |`));
  assert.ok(line, `HOW-IT-WORKS.md section 3 has no "${kind}" row`);
  // What is in brackets says where a domain forwards, "Severance (into Windsor)": not a town of this row.
  return line.split('|')[3]!.replace(/\([^)]*\)/g, '');
}

const KINDS: Array<[row: string, is: (t: TownConfig) => boolean]> = [
  ['Resident guide', (t) => t.status === 'live' && !!t.home],
  ['Plain guide', (t) => t.status === 'live' && !t.home && !t.quiet && !t.visitorGuide],
  ['Visitor guide', (t) => t.status === 'live' && !!t.visitorGuide],
  ['Quiet guide', (t) => t.status === 'live' && !!t.quiet],
  ['Folded or retired', (t) => t.status === 'redirect'],
];

const named = (cell: string, t: TownConfig) => new RegExp(`(^|[\\s,;(])${t.name}([\\s,;)]|$)`).test(cell);

test('every town is in the row its config puts it in, and in no other', () => {
  for (const town of towns) {
    const kinds = KINDS.filter(([, is]) => is(town)).map(([kind]) => kind);
    if (town.status !== 'live' && town.status !== 'redirect') continue; // not launched: not in the table
    assert.equal(kinds.length, 1, `${town.slug} is ${kinds.join(' and ') || 'no kind'}: the table has one row per town`);
    for (const [kind] of KINDS) {
      assert.equal(named(row(kind), town), kind === kinds[0], `HOW-IT-WORKS.md section 3: ${town.name} ${kind === kinds[0] ? 'belongs in' : 'does not belong in'} the "${kind}" row`);
    }
  }
});
