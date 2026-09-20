/**
 * Writing with a known shelf life.
 *
 * The Niwot incorporation guide is accurate until the polls close on
 * 3 November 2026 and misleading the morning after, and it is the most read,
 * most linked thing on that guide. This checks that it is set up to say so on
 * its own, and that the future-tense phrasing which would go stale around it
 * has not crept back in.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const TOWNS = ['niwot', 'lyons', 'berthoud', 'erie', 'johnstown', 'timnath', 'elizabeth'];

function frontmatter(file: string): Record<string, string> {
  const m = readFileSync(file, 'utf8').match(/^---\n([\s\S]*?)\n---/);
  if (!m) return {};
  const out: Record<string, string> = {};
  for (const line of m[1]!.split('\n')) {
    const f = line.match(/^([A-Za-z][A-Za-z0-9_]*):\s*(.*)$/);
    if (f) out[f[1]!] = f[2]!.trim().replace(/^"(.*)"$/, '$1');
  }
  return out;
}

function articles(town: string): string[] {
  const dir = join('content', town, 'articles');
  if (!existsSync(dir)) return [];
  return readdirSync(dir).filter((f) => f.endsWith('.md')).map((f) => join(dir, f));
}

const allArticles = TOWNS.flatMap(articles);

test('an article that declares a shelf life says what changes, and where the answer is', () => {
  for (const file of allArticles) {
    const fm = frontmatter(file);
    if (!fm.supersededAfter && !fm.supersededNote) continue;
    assert.ok(fm.supersededAfter, `${file}: a note with no date never starts being true`);
    assert.ok(fm.supersededNote, `${file}: a date with no note says nothing`);
    assert.match(fm.supersededAfter, /^\d{4}-\d{2}-\d{2}$/, `${file}: date must be a plain Denver day`);
    if (fm.supersededSource) {
      assert.match(fm.supersededSource, /^https:\/\//, `${file}: source must be a real URL`);
      assert.ok(fm.supersededSourceLabel, `${file}: a bare URL is not link text`);
    }
  }
});

test('the Niwot election guide turns over the morning after the vote', () => {
  const fm = frontmatter('content/niwot/articles/2026-incorporation-election.md');
  // Ballots are due 7pm on the 3rd, so the guidance is live through election
  // day itself. The 4th is the first day it is behind the facts.
  assert.equal(fm.supersededAfter, '2026-11-04');
  assert.match(fm.supersededNote ?? '', /November 3, 2026/);
  assert.match(fm.supersededNote ?? '', /not a result|none of it is a result/i,
    'the note must not be mistaken for reporting the outcome');
  assert.match(fm.supersededSource ?? '', /bouldercounty\.gov/,
    'the official count belongs to the county, not to us');
});

test('the guide claims no outcome, for either side', () => {
  const body = readFileSync('content/niwot/articles/2026-incorporation-election.md', 'utf8');
  for (const claim of [/\bvoters (approved|rejected)\b/i, /\bincorporation (passed|failed)\b/i,
                       /\bNiwot (is now|became) a (town|municipality)\b/i]) {
    assert.doesNotMatch(body, claim, 'the guide must not assert a result it cannot know');
  }
});

test('nothing around it describes the vote as still to come', () => {
  // These are the phrasings that were there before and would read as wrong
  // from 4 November. A date on its own is fine; a promise about the future
  // is not.
  const stale = [
    /voters\s+(?:inside[^.]{0,40})?decide whether/i,
    /will decide whether (?:to )?incorporat/i,
    /on the 2026 ballot that is worth reading/i,
    /upcoming incorporation (?:vote|election)/i,
  ];
  const files = [
    ...TOWNS.flatMap(articles),
    'content/niwot/pages/moving-here.md',
    'src/routes/hub/moving.astro',
    'src/config/towns/niwot.ts',
  ].filter(existsSync);

  for (const file of files) {
    const text = readFileSync(file, 'utf8');
    for (const pattern of stale) {
      assert.doesNotMatch(text, pattern, `${file}: future-tense election phrasing is back`);
    }
  }
});

test('every mention of the election is anchored to its date', () => {
  // A reader landing months later should be able to tell how old the claim is
  // without checking a byline.
  for (const file of ['content/niwot/pages/moving-here.md',
                      'content/niwot/articles/how-niwot-got-here.md',
                      'src/routes/hub/moving.astro']) {
    const text = readFileSync(file, 'utf8');
    if (!/incorporat/i.test(text)) continue;
    assert.match(text, /November 3, 2026|3 November 2026|November 2026/,
      `${file}: names the incorporation vote without saying when it was`);
  }
});
