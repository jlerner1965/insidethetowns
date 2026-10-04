/**
 * The source registry: what the editor checks each week, one JSON file per
 * town. Its status governs ingestion only, so nothing here may reach into
 * what publishes; the test for that is that the gate never reads it.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { CORE_CATEGORIES, sourceRegistrySchema, sourceSchema } from '../src/content/schemas.ts';
import { bySeniority, guessCategory, idFromHost, isCore, readRegistry, registryIssues } from '../src/lib/sources.ts';
import { towns } from '../src/config/towns/registry.ts';

test('a feed source must say where its feed is; a page source need not', () => {
  const base = { id: 'town-calendar', name: 'townoflyons.com', url: 'https://www.townoflyons.com/', category: 'city-calendar' };
  assert.equal(sourceSchema.parse({ ...base, type: 'html' }).status, 'proposed');
  assert.throws(() => sourceSchema.parse({ ...base, type: 'ical' }), /feedUrl/);
  assert.equal(sourceSchema.parse({ ...base, type: 'ical', feedUrl: 'https://www.townoflyons.com/calendar.ics' }).type, 'ical');
  assert.throws(() => sourceSchema.parse({ ...base, id: 'Town Calendar', type: 'html' }), /lowercase/);
  assert.throws(() => sourceRegistrySchema.parse({ town: 'lyons', sources: [{ ...base, type: 'html' }, { ...base, type: 'manual' }] }), /unique/);
});

test('seeding guesses a category from the host and says what is core', () => {
  assert.equal(guessCategory('highplains.libcal.com'), 'library');
  assert.equal(guessCategory('lyons.librarycalendar.com'), 'library');
  assert.equal(guessCategory('erieco.gov'), 'city-calendar');
  assert.equal(guessCategory('townoflyons.com'), 'city-calendar');
  assert.equal(guessCategory('recreationliveshere.com'), 'parks');
  assert.equal(guessCategory('members.eriechamber.org'), 'chamber');
  assert.equal(guessCategory('berthoudmainstreet.org'), 'chamber');
  assert.equal(guessCategory('lyonsrecorder.org'), 'news');
  assert.equal(guessCategory('niwothall.org'), 'venue');
  // The town's own site is known from its config, whatever its domain ends in.
  assert.equal(guessCategory('berthoud.org', 'www.berthoud.org'), 'city-calendar');
  assert.equal(guessCategory('niwot.com', 'bouldercounty.gov'), 'venue');
  // A ticketing platform is a fine source for one event and never a place to check weekly.
  assert.equal(guessCategory('tockify.com'), 'other');
  assert.equal(guessCategory('events.humanitix.com'), 'other');
  assert.equal(isCore('other', { events: 50, places: 0 }), false);
  for (const c of CORE_CATEGORIES) assert.equal(isCore(c, { events: 0, places: 0 }), true);
  assert.equal(isCore('venue', { events: 5, places: 0 }), true);
  assert.equal(isCore('venue', { events: 4, places: 0 }), false);
  assert.equal(isCore('news', { events: 44, places: 0 }), false);
  assert.equal(idFromHost('www.Highplains.LibCal.com'), 'highplains-libcal-com');
});

test('core first, then by category, then by name: the order the editor reads', () => {
  const s = (id: string, category: string, priority: 'core' | 'other') =>
    sourceSchema.parse({ id, name: id, url: `https://${id}.org/`, type: 'html', category, priority });
  const sorted = [s('venue-b', 'venue', 'other'), s('library', 'library', 'core'), s('news', 'news', 'other'), s('town', 'city-calendar', 'core'), s('venue-a', 'venue', 'other')].sort(bySeniority);
  assert.deepEqual(sorted.map((x) => x.id), ['town', 'library', 'venue-a', 'venue-b', 'news']);
});

test('every town registry on disk validates, and every sourceId in the content resolves', () => {
  let registries = 0;
  for (const town of towns) {
    assert.deepEqual(registryIssues(town.slug), [], `${town.slug}: sources.json`);
    const registry = readRegistry(town.slug);
    if (registry.sources.length) registries++;
    const ids = new Set(registry.sources.map((s) => s.id));
    for (const collection of ['events', 'places']) {
      const dir = join('content', town.slug, collection);
      if (!existsSync(dir)) continue;
      for (const file of readdirSync(dir)) {
        const m = readFileSync(join(dir, file), 'utf8').match(/^sourceId:\s*"?([^"\n]+)"?/m);
        if (m) assert.ok(ids.has(m[1]!.trim()), `${town.slug}/${collection}/${file}: sourceId ${m[1]} not in the registry`);
      }
    }
    // Seeded entries are never invented: each is named by its host and cites what the content cites.
    for (const s of registry.sources) {
      if (!s.notes?.startsWith('Seeded')) continue;
      assert.equal(s.name, new URL(s.url).hostname.replace(/^www\./, ''), `${town.slug}: ${s.id} seeded with a name that is not its host`);
      assert.ok(s.cites && s.cites.events + s.cites.places > 0, `${town.slug}: ${s.id} seeded without a citation`);
    }
  }
  assert.ok(registries >= 9, 'every live town was seeded');
});

test('the registry has no say in what publishes', () => {
  // The gate's module must not import the registry: a proposed source blocks
  // ingestion, never a listing that already cites it.
  const gate = readFileSync('src/lib/freshness.ts', 'utf8') + readFileSync('src/lib/content.ts', 'utf8');
  assert.equal(/sources\.ts|sources'/.test(gate), false);
});
