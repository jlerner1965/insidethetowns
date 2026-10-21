/**
 * One page per kind of place: /restaurants/, /trails/, /parks/.
 *
 * The route integration decides which pages to build from the raw markdown,
 * the page and the directory headings from the parsed entries, and a link
 * to a page that was never built is a 404 in the one place a reader was
 * promised a list. So the two readings are checked against each other over
 * every listing in the repository, and the paths against every other route
 * a town can have.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { z } from 'astro/zod';
import {
  MIN_PLACES_FOR_TYPE_PAGE,
  PLACE_TYPE_PAGES,
  countByType,
  placeTypeOfPath,
  placeTypePages,
  sectionOf,
  siblingTypePages,
} from '../src/lib/place-types.ts';
import { openPlaceTypeCounts } from '../src/lib/raw-places.ts';
import { placeTypeRoutes } from '../src/integrations/town-routes.ts';
import { PLACE_TYPES, PLACE_TYPE_PLURALS, placeSchema } from '../src/content/schemas.ts';
import { towns } from '../src/config/towns/registry.ts';
import { parseFrontmatter } from '../scripts/lib/frontmatter.ts';

const schema = placeSchema(() => z.string());
const lyons = { name: 'Lyons', state: 'CO' };

test('every kind of place has a page definition, at its own path, under a section the guide has', () => {
  const paths = new Set<string>();
  for (const type of PLACE_TYPES) {
    const page = PLACE_TYPE_PAGES[type];
    assert.match(page.path, /^\/[a-z-]+\/$/, `${type}: a top-level path with a trailing slash`);
    assert.ok(!paths.has(page.path), `${type}: ${page.path} is already another kind's`);
    paths.add(page.path);
    assert.equal(placeTypeOfPath(page.path), type);
    assert.equal(placeTypeOfPath(page.path.replace(/\/$/, '')), type, 'with or without the slash');
    assert.ok(['/eat-drink/', '/things-to-do/', '/directory/'].includes(page.parent.path), `${type}: parent ${page.parent.path}`);
    // The heading is the directory's group label, so the link and its target agree.
    assert.equal(page.heading, PLACE_TYPE_PLURALS[type]);
    assert.match(page.title(lyons), /Lyons, CO$/, `${type}: the title says where`);
    assert.match(page.describe(lyons, 7), /^7 /, `${type}: the description counts`);
  }
});

test('a kind’s path never shadows a route every town has, or a town a guide folds in', () => {
  const fixed = ['events', 'this-weekend', 'this-week', 'rss.xml', 'events.rss', 'places', 'articles', 'guides', 'eat-drink',
    'things-to-do', 'directory', 'for-businesses', 'moving-here', 'submit-event', 'correct', 'thanks', 'about', 'contact',
    'corrections', 'credits', 'editorial', 'message-sent', 'privacy', 'search', 'newsletter', 'moving', 'advertise',
    'families', 'get-involved', 'living-here', 'updates', 'people', 'sports'];
  const subTowns = towns.flatMap((t) => t.subTowns ?? []);
  for (const type of PLACE_TYPES) {
    const segment = PLACE_TYPE_PAGES[type].path.replaceAll('/', '');
    assert.ok(!fixed.includes(segment), `${type}: /${segment}/ is a fixed route`);
    assert.ok(!subTowns.includes(segment), `${type}: /${segment}/ is a sub-town`);
    assert.ok(!towns.some((t) => t.slug === segment), `${type}: /${segment}/ is a town`);
  }
});

test('a kind gets a page at three places, not two', () => {
  assert.equal(MIN_PLACES_FOR_TYPE_PAGE, 3);
  assert.deepEqual(placeTypePages({ restaurant: 3, bar: 2, trail: 12 }), ['restaurant', 'trail']);
  assert.deepEqual(placeTypePages({}), []);
  // PLACE_TYPES order, whatever order the counts came in.
  assert.deepEqual(placeTypePages({ venue: 5, restaurant: 5, coffee: 5 }), ['restaurant', 'coffee', 'venue']);
});

test('sibling links stay inside the kind’s own section', () => {
  const built = placeTypePages({ restaurant: 9, bar: 4, coffee: 3, trail: 8, park: 6, venue: 3, service: 3 });
  assert.deepEqual(siblingTypePages('restaurant', built), ['bar', 'coffee']);
  assert.deepEqual(siblingTypePages('trail', built), ['park', 'venue']);
  assert.deepEqual(siblingTypePages('service', built), []);
  assert.equal(sectionOf('shop'), 'eat-drink');
  assert.equal(sectionOf('lodging'), 'things-to-do');
  assert.equal(sectionOf('service'), 'directory');
});

test('the routes built and the headings linked agree on every town’s counts', () => {
  let checked = 0;
  let pages = 0;
  for (const town of towns) {
    const dir = join('content', town.slug, 'places');
    if (!existsSync(dir)) continue;
    const fromRaw = openPlaceTypeCounts(town.slug);
    const open: Array<{ data: { type: (typeof PLACE_TYPES)[number] } }> = [];
    for (const file of readdirSync(dir)) {
      if (!file.endsWith('.md') || file.startsWith('_')) continue;
      const parsed = schema.safeParse(parseFrontmatter(readFileSync(join(dir, file), 'utf8')).data);
      if (!parsed.success) continue;
      checked++;
      if (parsed.data.status !== 'closed') open.push({ data: { type: parsed.data.type } });
    }
    const fromParsed = countByType(open);
    for (const type of PLACE_TYPES) {
      assert.equal(fromRaw[type] ?? 0, fromParsed[type] ?? 0, `${town.slug}: ${type} counted differently from the markdown and the schema`);
    }
    const routes = placeTypeRoutes(town.slug);
    assert.deepEqual(
      routes.map(([pattern]) => `${pattern}/`),
      placeTypePages(fromParsed).map((t) => PLACE_TYPE_PAGES[t].path),
      `${town.slug}: routes and pages differ`,
    );
    for (const [, file] of routes) assert.equal(file, 'places-by-type.astro');
    pages += routes.length;
  }
  assert.ok(checked > 300, `only ${checked} places checked`);
  assert.ok(pages > 50, `only ${pages} kind pages across the network`);
});
