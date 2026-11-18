/**
 * Every history article on the network has one shape (the history-story
 * template of 15 November 2026, `.claude/skills/inside-the-towns-editor/
 * SKILL.md`, "History stories"): the hub's stories about the past and every
 * guide article in the History category. These are the parts a file can be
 * checked for; the writing itself is the editor's.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { allTowns } from '../src/config/index.ts';

interface Story {
  file: string;
  front: string;
  body: string;
}

function read(file: string): Story {
  const text = readFileSync(file, 'utf8');
  const [, front = '', body = ''] = text.split(/^---$/m);
  return { file, front, body };
}

/** Guide articles filed under History, and hub stories whose eyebrow says History. */
function historyStories(): Story[] {
  const out: Story[] = [];
  // A guide kept page by page on the hub (`section`, 17 November 2026) carries
  // its articles as they were, before the template; they are not held to it.
  const asTheyWere = new Set(allTowns.filter((t) => t.section).map((t) => t.slug));
  for (const town of readdirSync('content').filter((t) => !asTheyWere.has(t))) {
    const dir = join('content', town, 'articles');
    let files: string[] = [];
    try {
      files = readdirSync(dir).filter((f) => f.endsWith('.md'));
    } catch {
      continue;
    }
    for (const f of files) {
      const story = read(join(dir, f));
      if (/^category:\s*"?History"?\s*$/m.test(story.front)) out.push(story);
    }
  }
  for (const f of readdirSync('content/hub/curiosity').filter((f) => f.endsWith('.md'))) {
    const story = read(join('content/hub/curiosity', f));
    if (/^kind:\s*story\s*$/m.test(story.front) && /^eyebrow:\s*"History · /m.test(story.front)) out.push(story);
  }
  return out;
}

test('there are history stories to check, on the hub and on the guides', () => {
  const files = historyStories().map((s) => s.file);
  assert.ok(files.some((f) => f.startsWith('content/hub/')), 'a hub story');
  assert.ok(files.filter((f) => !f.startsWith('content/hub/')).length >= 5, 'the guides’ history articles');
});

test('every history story has the template’s parts, in order', () => {
  for (const { file, front, body } of historyStories()) {
    const headings = [...body.matchAll(/^## (.+)$/gm)].map((m) => m[1]!.trim());
    // The opening comes before any heading.
    const opening = body.split(/^## /m)[0]!.trim();
    assert.ok(opening.split(/\n\s*\n/).filter((p) => p.trim() && !p.trim().startsWith('!')).length >= 2, `${file}: an opening of two or more paragraphs before the first heading`);
    // The ending: Visit these places, last; then the More on the town line.
    assert.equal(headings.at(-1), 'Visit these places', `${file}: ends on "Visit these places"`);
    const last = body.trim().split('\n').at(-1)!.trim();
    assert.match(last, /^More on the town: \[[^\]]+\]\(\/[^)]*\)\.?$/, `${file}: the last line is "More on the town: [Town](…)"`);
    const visit = body.slice(body.lastIndexOf('## Visit these places'));
    const bullets = visit.split('\n').filter((l) => l.startsWith('- **'));
    assert.ok(bullets.length >= 2 && bullets.length <= 7, `${file}: two to seven places to visit (${bullets.length})`);
    // Sections: four to seven before the ending (a photo essay may have one per photograph).
    const sections = headings.length - 1;
    const essay = /in photographs/i.test(front);
    assert.ok(sections >= 4 && (essay || sections <= 7), `${file}: four to seven sections (${sections})`);
    // Plain headings: no year ranges, no questions.
    for (const h of headings) {
      assert.doesNotMatch(h, /\b\d{4}s? to \d{4}s?\b/, `${file}: "${h}" is a year range`);
      assert.doesNotMatch(h, /\?$/, `${file}: "${h}" is a question`);
    }
    // Sources in the front matter, named in the sentence: no Sources section, no bare citations, no "Before you go".
    for (const banned of ['Sources', 'Before you go', 'Who keeps the record']) assert.ok(!headings.includes(banned), `${file}: no "${banned}" section`);
    assert.doesNotMatch(body, /\(\[[^\]]+\]\([^)]+\)\)/, `${file}: a source in parentheses after a sentence; name it in the sentence`);
    assert.match(front, /^sources:/m, `${file}: sources in the front matter`);
  }
});
