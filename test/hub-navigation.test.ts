/**
 * The owner's navigation brief of 18 November 2026, items 13 to 16:
 *
 *   13. The full sections, eleven of them (the seven guides and Estes Park,
 *       Fort Collins, Longmont and Loveland), from one list (fullSections),
 *       listed together on the home's "Find your town" and at the top of
 *       /towns/, and counted in the home's and the search page's
 *       descriptions.
 *   14. A tradition page under a town with a full section carries that
 *       section's masthead ("Inside Erie"), every link where the section's
 *       own pages have it; a town without one keeps the hub's.
 *   15. The masthead's link to the hub's home is named "Inside the Towns home".
 *   16. A season page's pills are one row that scrolls sideways below 900px.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { STANDALONE_GUIDES } from '../src/config/hub-towns.ts';
import { fullSectionAt, fullSections, getNetworkHub, isMoved, liveTowns, sectionHome, sectionTowns } from '../src/config/index.ts';
import { PAPERS, paletteVars, primaryHover } from '../src/config/palette.ts';
import { homeDescription, inSentence } from '../src/lib/hub-home.ts';
import { townNav } from '../src/lib/nav.ts';
import { pagesBeyondSections } from '../src/lib/town-search-index.ts';
import { SECTION_MOVED, sectionHref } from '../src/lib/section.ts';
import { homeLinkLabel } from '../src/lib/titles.ts';
import { SECTION_MOVED as MERGE_MOVED, resolvePath } from '../scripts/lib/section-merge.ts';

const read = (path: string) => readFileSync(path, 'utf8');

test('the full sections are the seven guides and the folded guides kept whole in one A to Z order: eleven, each with a section on the hub', () => {
  const full = fullSections();
  assert.deepEqual(
    full.map((t) => t.name),
    ['Berthoud', 'Carbon Valley', 'Erie', 'Estes Park', 'Fort Collins', 'Johnstown', 'Longmont', 'Loveland', 'Lyons', 'Niwot', 'Windsor'],
  );
  // The seven guides are all there, whatever order STANDALONE_GUIDES and liveTowns() keep them in.
  assert.deepEqual(full.filter((t) => t.status === 'live').map((t) => t.slug).sort(), Object.values(STANDALONE_GUIDES).map((g) => g.guide).sort());
  assert.deepEqual(full.filter((t) => t.status === 'live').map((t) => t.slug).sort(), liveTowns().map((t) => t.slug).sort());
  // With every switch on (src/config/guide-move.ts), the list is exactly the towns with a full section.
  assert.deepEqual(full.map((t) => t.slug).sort(), sectionTowns('full').map((t) => t.slug).sort());
  assert.equal(new Set(full.map((t) => t.slug)).size, full.length, 'no section twice');
});

test('a full section’s front page: a guide’s section home, a folded guide’s town page on the hub', () => {
  const by = (slug: string) => fullSections().find((t) => t.slug === slug)!;
  assert.equal(sectionHome(by('erie')), 'https://insidethetowns.com/erie/');
  assert.equal(sectionHome(by('carbon-valley')), 'https://insidethetowns.com/carbon-valley/');
  assert.equal(sectionHome(by('longmont')), 'https://insidethetowns.com/longmont/');
  // The config is `fortcollins`; its section and town page are /fort-collins/.
  assert.equal(sectionHome(by('fortcollins')), 'https://insidethetowns.com/fort-collins/');
  for (const t of fullSections()) assert.match(sectionHome(t), /^https:\/\/insidethetowns\.com\/[a-z-]+\/$/, `${t.slug}: ${sectionHome(t)}`);
});

test('the home and /towns/ list the eleven together from fullSections(), and their words count sections, not guides', () => {
  const home = read('src/routes/hub/index.astro');
  assert.match(home, /const sectionList = fullSections\(\);/);
  assert.match(home, /\{capitalized\(sectionCount\)\} full sections<\/h3>/);
  assert.match(home, /data-index="sections"/);
  assert.match(home, /href: sectionHome\(t\)/);
  assert.doesNotMatch(home, /local guides<\/h3>/);
  assert.match(home, /homeDescription\(\{ sections: sections\.length/);

  const towns = read('src/routes/hub/towns.astro');
  assert.match(towns, /const full = fullSections\(\)/);
  assert.match(towns, /<h2 id="sections-heading" class=\{h2\}>Full sections<\/h2>/);
  assert.match(towns, /\$\{full\.length\} full town sections/);
  // The sections come first: before the town pages A to Z.
  assert.ok(towns.indexOf('data-index="sections"') < towns.indexOf('data-index="town-pages"'));

  const search = read('src/pages/search.astro');
  assert.match(search, /numberWord\(fullSections\(\)\.length\)\} full town sections/);
  assert.doesNotMatch(search, /on every \$\{site\.siteTitle\} guide/);
});

test('the home and /towns/ count the town pages beyond the sections by one rule, and /towns/ lists no town twice', () => {
  // The review of 19 November 2026: the home said "91 more towns", /towns/ "95 town pages", and listed the four folded sections twice.
  const pages = [{ name: 'Longmont' }, { name: 'Estes Park' }, { name: 'Fort Collins' }, { name: 'Loveland' }, { name: 'Severance' }, { name: 'Brush' }, { name: 'Salida' }];
  assert.deepEqual(pagesBeyondSections(pages, fullSections()).map((p) => p.name), ['Brush', 'Salida']);
  const home = read('src/routes/hub/index.astro');
  assert.match(home, /const moreTowns = pagesBeyondSections\(pages, sectionList\)\.length;/);
  const towns = read('src/routes/hub/towns.astro');
  assert.match(towns, /const pages = pagesBeyondSections\(\[\.\.\.publishedHubTowns\(records\)\], fullSections\(\)\)/);
  assert.match(towns, /\$\{pages\.length\} more town pages/);
});

test('the home’s description counts the sections, fits 155 characters, and keeps a season’s proper noun', () => {
  const seasons = ['Parades of lights', 'Tree lightings', 'Turkey trots', 'New Year’s celebrations'];
  const d = homeDescription({ sections: 11, moreTowns: 80, seasons }, 155);
  assert.ok(d.length <= 155, `${d.length}: ${d}`);
  assert.match(d, /^This weekend’s events, eleven full town sections and annual dates for 80 more Colorado towns/);
  // One season fits whole; four do not, and the description drops them rather than cut a word.
  assert.equal(
    homeDescription({ sections: 11, moreTowns: 80, seasons: ['Parades of lights'] }, 155),
    'This weekend’s events, eleven full town sections and annual dates for 80 more Colorado towns: parades of lights, each checked against its source.',
  );
  assert.equal(
    homeDescription({ sections: 11, moreTowns: 80, seasons: ['Parades of lights', 'Tree lightings'] }, 155),
    'This weekend’s events, eleven full town sections and annual dates for 80 more Colorado towns: parades of lights and tree lightings.',
  );
  assert.equal(d, 'This weekend’s events, eleven full town sections and annual dates for 80 more Colorado towns, each checked against its source.');
  assert.equal(inSentence('Parades of lights'), 'parades of lights');
  assert.equal(inSentence('New Year’s celebrations'), 'New Year’s celebrations');
  assert.equal(inSentence('Easter egg hunts'), 'Easter egg hunts');
});

test('a tradition page under a full section takes that section’s masthead; a town without one keeps the hub’s', () => {
  const erie = fullSectionAt('erie')!;
  assert.equal(erie.site.siteTitle, 'Inside Erie');
  assert.equal(erie.base, '/erie');
  assert.equal(fullSectionAt('estes-park')?.site.siteTitle, 'Inside Estes Park');
  // A folded guide's section is labelled "Inside <Town>", as its own pages are (sectionSite).
  assert.equal(fullSectionAt('longmont')?.site.siteTitle, 'Inside Longmont');
  assert.equal(fullSectionAt('fort-collins')?.base, '/fort-collins');
  // Kept page by page (Golden), or a town page alone (Salida): no section, no masthead of its own.
  assert.equal(fullSectionAt('golden'), undefined);
  assert.equal(fullSectionAt('salida'), undefined);
  for (const t of fullSections()) assert.ok(fullSectionAt(t.hubPage!.town), `${t.slug} has a full section to take a masthead from`);

  const page = read('src/routes/hub/event.astro');
  assert.match(page, /const masthead = fullSectionAt\(town\.slug\);/);
  assert.match(page, /\{masthead\}/);
  assert.match(read('src/layouts/Base.astro'), /<Header section=\{masthead\} \/>/);
});

test('the section’s masthead on a hub page links where the section’s own pages do: the same rewrite as the merge', () => {
  assert.equal(SECTION_MOVED, MERGE_MOVED, 'one list, read by both');
  assert.equal(sectionHref('/this-week/', '/longmont'), '/longmont/events/');
  assert.equal(sectionHref('/this-week/', '/erie', true), '/erie/this-week/');
  assert.equal(sectionHref('/', '/erie', true), '/erie/');
  assert.equal(sectionHref('/', '/longmont'), '/longmont/');
  assert.equal(sectionHref('/eat-drink/', '/loveland'), '/loveland/eat-drink/');
  assert.equal(sectionHref('/longmont/events/', '/longmont'), '/longmont/events/');
  assert.equal(sectionHref('https://insidethetowns.com/#towns', '/erie'), 'https://insidethetowns.com/#towns');
  for (const town of sectionTowns('full')) {
    const section = fullSectionAt(town.hubPage!.town)!;
    const carryAll = isMoved(section.site);
    for (const item of townNav(section.site)) {
      const merged = resolvePath(item.href, section.base, () => true, () => false, {}, carryAll ? [] : SECTION_MOVED);
      assert.equal(sectionHref(item.href, section.base, carryAll), merged, `${town.slug}: ${item.label}`);
    }
  }
});

test('a section’s masthead is in its own colours, scoped to the masthead', () => {
  assert.equal(paletteVars({ primary: '#1F6582', accent: '#B75A3F', paper: 'cool' }), `--town-primary:#1F6582;--town-primary-hover:${primaryHover('#1F6582')};--town-accent:#B75A3F;--town-paper:${PAPERS.cool}`);
  const css = read('src/styles/global.css');
  // Every colour made from the four is declared again inside the scope, or it keeps the page's value.
  for (const v of ['--color-primary', '--color-primary-hover', '--color-primary-line', '--color-accent', '--color-paper', '--color-line', '--color-line-soft', '--t-line-soft', '--t-primary-line']) {
    assert.match(css, new RegExp(`\\[data-palette\\][^}]*${v}:`), `${v} is declared under [data-palette]`);
  }
  assert.match(read('src/components/Header.astro'), /'data-palette': ''/);
});

test('the masthead’s link to the hub’s home is named “Inside the Towns home”, and begins with the words it shows', () => {
  const hub = getNetworkHub();
  assert.equal(homeLinkLabel(hub.siteTitle), 'Inside the Towns home');
  assert.ok(homeLinkLabel(hub.siteTitle).startsWith(hub.siteTitle));
  assert.equal(homeLinkLabel('Inside Erie'), 'Inside Erie home');
  const wordmark = read('src/components/Wordmark.astro');
  assert.match(wordmark, /aria-label=\{homeLinkLabel\(site\.siteTitle\)\}/);
  assert.match(read('src/components/Header.astro'), /<Wordmark [^>]*site=\{site\} href=\{at\('\/'\)\} \/>/);
});

test('a season page’s pills are one row that scrolls sideways below 900px, 44px tall, wrapped from 900px', () => {
  const page = read('src/routes/hub/season.astro');
  const row = /const seasonRow = '([^']+)';/.exec(page)?.[1];
  assert.ok(row, 'season.astro names its pills’ row');
  const classes = row.split(/\s+/);
  for (const c of ['flex', 'overflow-x-auto', 'desk:flex-wrap', 'desk:overflow-visible']) assert.ok(classes.includes(c), `the row has ${c}`);
  // No wrapping below 900px: the only flex-wrap is the desk one.
  assert.ok(!classes.includes('flex-wrap'), 'the row does not wrap on a phone');
  assert.match(page, /<nav aria-label="Other traditions this season" class=\{seasonRow\} data-season-pills>/);
  assert.match(page, /class:list=\{\[pill, 'shrink-0 whitespace-nowrap'\]\}/);
  assert.match(/const pill =\s*'([^']+)'/.exec(page)![1]!, /\bmin-h-11\b/, 'a pill is 44px tall');
});
