/**
 * Small type on a colour band is full white. The sports band and the home
 * page's strip set eyebrows and game details at white 70% and 80%, which
 * measured under 4.5:1 on seven guides' bands (design audit, 10 November
 * 2026: Niwot 3.42:1). `npm run check-colors` proves white on every band;
 * this keeps a faded white from coming back to the two components.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

for (const file of ['src/components/NextUp.astro', 'src/components/home/SportsBar.astro']) {
  test(`${file}: no faded white text on the band`, () => {
    assert.doesNotMatch(readFileSync(file, 'utf8'), /text-white\/\d/);
  });
}

test('the families page keeps its panels off the accent wash', () => {
  // The primary as an outline button on the wash was 3.96:1 on Golden.
  const page = readFileSync('src/routes/town/families.astro', 'utf8');
  assert.doesNotMatch(page, /id="schools"[^>]*bg-accent-soft/);
});
