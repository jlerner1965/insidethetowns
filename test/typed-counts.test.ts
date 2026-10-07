/**
 * Every number on the sites that counts towns, guides, places or events is
 * computed from the configs or the content at build time. A typed one goes
 * wrong the week after it is typed: the hub said "12 guides" while the
 * newsletter page said nine (the October 2026 audit).
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

function astroFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? astroFiles(path) : name.endsWith('.astro') ? [path] : [];
  });
}

/** The markup a reader sees: the frontmatter, the comments and the expressions taken out. */
function visibleText(source: string): string {
  return source
    .replace(/^---[\s\S]*?\n---/, '')
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<script[\s\S]*?<\/script>/g, '')
    .replace(/\$\{[^}]*\}/g, 'N');
}

// "One guide per town" and "two towns at a time" are prose, not tallies; a
// count of the network starts at three.
const TYPED = /\b(?:three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|\d+)\s+(?:small\s+)?(?:towns?|guides?|places|events|listings)\b/i;

test('no page types a count of towns, guides, places or events into its markup', () => {
  const offenders: string[] = [];
  for (const file of astroFiles('src')) {
    const text = visibleText(readFileSync(file, 'utf8'));
    for (const line of text.split('\n')) {
      const m = TYPED.exec(line);
      if (m) offenders.push(`${file}: "${m[0]}"`);
    }
  }
  assert.deepEqual(offenders, []);
});
