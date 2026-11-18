/**
 * The owner's brief of 18 November 2026 for five town pages (Estes Park,
 * Golden, Manitou Springs, Evergreen, Salida): one lead guide each, linked
 * under "Start here"; Trails and parks, three to six, every one with its
 * length or size, its start, its season, the dog rule and any fee; Places
 * to know where the brief names them; Estes Park keeps Frozen Dead Guy
 * Days as its spotlight; Salida's comes back only with FIBArk's next date
 * read; and Golden's Trick or Treat Street is complete and on the date
 * watch.
 */
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { test } from 'node:test';
import { HUB_TOWNS, findHubTown } from '../src/config/hub-towns.ts';
import { allTowns } from '../src/config/index.ts';
import { watchState } from '../src/lib/date-watch.ts';
import { pageSections, profileView } from '../src/lib/hub-town-page.ts';
import { parseLeadGuide, sectionArticleSegment } from '../src/lib/lead-guide.ts';
import { townProfileSchema, type TownProfile } from '../src/lib/town-profile.ts';
import { rawRecords } from '../src/lib/tradition-files.ts';
import { parseFrontmatter } from '../scripts/lib/frontmatter.ts';

const FIVE = ['estes-park', 'golden', 'manitou-springs', 'evergreen', 'salida'] as const;
/** The second brief of 18 November 2026: the same for nine more. */
const NINE = ['carbondale', 'nederland', 'buena-vista', 'leadville', 'idaho-springs', 'georgetown', 'crested-butte', 'steamboat-springs', 'durango'] as const;
const BRIEFED = [...FIVE, ...NINE];
const profileOf = (slug: string): TownProfile => townProfileSchema.parse(JSON.parse(readFileSync(`data/hub/towns/${slug}.json`, 'utf8')));
const records = rawRecords('.', {});

test('Places to know and Trails and parks come after the dates, numbered with the rest', () => {
  const s = pageSections('Salida', { events: true, places: true, trails: true, directory: false, stay: true, getting: true, outdoor: true, about: true });
  assert.deepEqual(s.map((x) => [x.number, x.key, x.id]), [
    ['01', 'events', 'traditions'],
    ['02', 'places', 'places-to-know'],
    ['03', 'trails', 'trails-and-parks'],
    ['04', 'stay', 'stay'],
    ['05', 'getting', 'getting-here'],
    ['06', 'outdoor', 'outdoor-dates'],
    ['07', 'about', 'about'],
  ]);
  assert.equal(s[2]!.title, 'Trails and parks in Salida');
  assert.equal(s[1]!.label, 'Places to know');
});

test('a lead guide path is a section article or a hub story, nothing else', () => {
  assert.deepEqual(parseLeadGuide('/estes-park/articles/a-day/'), { kind: 'section', town: 'estes-park', segment: 'articles', slug: 'a-day' });
  assert.deepEqual(parseLeadGuide('/golden/guides/a-day/'), { kind: 'section', town: 'golden', segment: 'guides', slug: 'a-day' });
  assert.deepEqual(parseLeadGuide('/articles/salida-walk/'), { kind: 'hub', slug: 'salida-walk' });
  for (const bad of ['/golden/guides/a-day', 'https://insidethetowns.com/articles/x/', '/golden/places/x/', '/articles/']) assert.equal(parseLeadGuide(bad), undefined, bad);
  assert.equal(sectionArticleSegment('full'), 'articles');
  assert.equal(sectionArticleSegment('pages'), 'guides');
});

test('each briefed town names a lead guide, and every lead guide is a published article where its path says', () => {
  for (const slug of BRIEFED) assert.ok(findHubTown(slug)!.leadGuide, `${slug}: no leadGuide`);
  // The owner's third ask of 18 November 2026: the other towns whose guides
  // left articles in the repo name one of those, so every row with a lead
  // guide is checked, not only the briefed fourteen.
  const named = HUB_TOWNS.filter((t) => t.leadGuide).map((t) => t.slug);
  assert.ok(named.length >= 24, `${named.length} towns name a lead guide`);
  for (const slug of named) {
    const town = findHubTown(slug)!;
    const ref = parseLeadGuide(town.leadGuide!);
    assert.ok(ref, `${slug}: ${town.leadGuide} is not a lead guide path`);
    if (ref!.kind === 'hub') {
      const file = `content/hub/curiosity/${ref!.slug}.md`;
      assert.ok(existsSync(file), file);
      const data = parseFrontmatter(readFileSync(file, 'utf8')).data as { status?: string; kind?: string; towns?: string[] };
      assert.equal(data.status, 'verified', `${file} is not verified, so it builds no page`);
      assert.ok(data.kind === 'story' || data.kind === 'event', `${file}: a lead guide on the hub is a story or an event article`);
      assert.ok(data.towns?.includes(slug), `${file} does not name ${slug}`);
    } else {
      assert.equal(ref!.town, slug, `${slug}: its lead guide is in another town's section`);
      const guide = allTowns.find((t) => t.hubPage?.town === slug && t.section);
      assert.ok(guide?.section, `${slug}: no section to hold ${town.leadGuide}`);
      assert.equal(ref!.segment, sectionArticleSegment(guide!.section!.mode), `${slug}: a ${guide!.section!.mode} section's articles are under /${sectionArticleSegment(guide!.section!.mode)}/`);
      const file = `content/${guide!.slug}/articles/${ref!.slug}.md`;
      assert.ok(existsSync(file), file);
      const data = parseFrontmatter(readFileSync(file, 'utf8')).data as { verified?: string; sources?: unknown[] };
      assert.ok(data.verified, `${file}: no verified date`);
      assert.ok((data.sources?.length ?? 0) >= 3, `${file}: a lead guide lists its sources`);
    }
  }
});

/**
 * Where an entry could not be completed from the land manager's own page,
 * it stays out of the file and the gap is named here (18 November 2026):
 * the town page then shows fewer than three, and this list says why.
 */
const TRAIL_GAPS: Readonly<Record<string, string>> = {
  salida: 'the City of Salida refuses automated readers, so the Riverwalk and Riverside Park have no season or dog rule from the City',
  nederland: 'Boulder County publishes no fee statement for Mud Lake or Caribou Ranch, and the Town gives no hours, dog rule or fee for its parks',
  'idaho-springs': 'the City of Idaho Springs refuses automated readers: Virginia Canyon Mountain Park, read in the owner’s browser, has no published trail mileage on the pages recorded and may close January to March for bighorn sheep; the Forest Service gives the Chicago Lakes Trail no season',
  'steamboat-springs': 'no manager page gives the Yampa River Core Trail or Emerald Mountain a season or a trailhead, and the Spring Creek Trail has a season for only part of its length',
};

test('Trails and parks: three to six on each briefed town, every one with the facts the brief names', () => {
  for (const slug of BRIEFED) {
    const trails = profileOf(slug).trails ?? [];
    const least = TRAIL_GAPS[slug] ? 2 : 3;
    assert.ok(trails.length >= least && trails.length <= 6, `${slug}: ${trails.length} trails and parks${TRAIL_GAPS[slug] ? ` (gap: ${TRAIL_GAPS[slug]})` : ''}`);
    for (const t of trails) {
      assert.ok(t.length || t.size, `${slug} ${t.name}: length or size`);
      assert.ok(t.trailhead || t.address, `${slug} ${t.name}: trailhead or address`);
      for (const k of ['season', 'dogs', 'fee', 'source', 'checked'] as const) assert.ok(t[k], `${slug} ${t.name}: ${k}`);
      if (t.page) assert.ok(pageFile(t.page), `${slug} ${t.name}: ${t.page} is not a page this site builds`);
    }
    assert.equal(new Set(trails.map((t) => t.name)).size, trails.length, `${slug}: a trail is listed once`);
  }
});

test('Places to know: Estes Park has the five the brief names, Salida its three, each with a dated source', () => {
  const estes = (profileOf('estes-park').places ?? []).map((p) => p.name).join(' | ');
  for (const want of [/Rocky Mountain National Park/, /elk/i, /Stanley/, /Riverwalk/, /Lake Estes/]) assert.match(estes, want, `Estes Park: ${want}`);
  const salida = (profileOf('salida').places ?? []).map((p) => p.name).join(' | ');
  for (const want of [/Arkansas/, /Monarch/, /hot springs/i]) assert.match(salida, want, `Salida: ${want}`);
  for (const slug of BRIEFED) {
    for (const p of profileOf(slug).places ?? []) {
      assert.ok(p.source && p.checked && p.facts.length > 0, `${slug} ${p.name}`);
      if (p.page) assert.ok(pageFile(p.page), `${slug} ${p.name}: ${p.page} is not a page this site builds`);
    }
  }
  // The park's entry and permit rules are on its row, dated.
  const park = profileOf('estes-park').places!.find((p) => /Rocky Mountain National Park/.test(p.name))!;
  const labels = park.facts.map((f) => f.label.toLowerCase()).join(' ');
  assert.match(labels, /entr/, 'the park’s entrance pass');
  assert.match(labels, /timed/, 'the park’s timed entry');
});

test('the profile view hands the page each source once, its own page first', () => {
  const view = profileView(findHubTown('estes-park')!, { profile: profileOf('estes-park') });
  for (const p of view.places) {
    assert.equal(p.sources[0]!.url, p.source);
    assert.equal(new Set(p.sources.map((s) => s.host)).size, p.sources.length, "each site once");
  }
  assert.ok(view.trailsChecked && view.placesChecked);
});

test('Estes Park keeps Frozen Dead Guy Days as its spotlight; Salida’s is FIBArk, and only with its next date read', () => {
  assert.equal(findHubTown('estes-park')!.showpiece?.spotlight, 'estes-park-frozen-dead-guy-days');
  const salida = findHubTown('salida')!.showpiece?.spotlight;
  if (salida) {
    assert.equal(salida, 'salida-fibark');
    const fibark = records.find((r) => r.slug === 'salida-fibark')!;
    const next = [...fibark.years].sort((a, b) => b.year - a.year)[0]!;
    assert.ok(next.year >= 2027 && next.status === 'confirmed' && next.date, 'FIBArk’s next year is read on the organizer’s page before it leads the page');
  }
  for (const t of HUB_TOWNS) {
    if (!t.showpiece?.spotlight) continue;
    assert.ok(records.some((r) => r.slug === t.showpiece!.spotlight), `${t.slug}: spotlight ${t.showpiece.spotlight} is not a record`);
  }
});

test('Golden’s Trick or Treat Street is complete and the date watch reads it', () => {
  const r = records.find((x) => x.slug === 'golden-trick-or-treat-street')!;
  assert.ok(r.about?.text && r.about.source && r.about.checked, 'what it is, from the City');
  assert.ok(r.dateWindow, 'a typical window, so the watch knows when to look');
  // The watch reads the newest year's own page, else the record's: neither may be one past day's calendar entry.
  const newest = [...r.years].sort((a, b) => b.year - a.year)[0]!;
  const watched = newest.sourceUrl ?? r.sourceUrl;
  assert.doesNotMatch(watched, /[?&]year=20\d\d|[?&]day=\d/, `the watch would read ${watched}, a page for one past day`);
  const held = r.years.find((y) => y.year === 2026)!;
  assert.ok(held.date && held.startTime && held.place && held.sourceUrl, 'the 2026 year keeps its date, time, place and its own page');
  // Eight weeks before the window it is on the watch; once that year's date is read it is settled.
  const opens = `2027-${r.dateWindow!.start}`;
  const early = new Date(Date.parse(`${opens}T12:00:00Z`) - 50 * 86_400_000).toISOString().slice(0, 10);
  assert.equal(watchState(r, early)?.state, 'watch');
  assert.ok(watchState(r, '2026-11-18'), 'a record the watch knows about');
});

/** A page path on the hub, as a content file: a kept place, a full section's place, or a town page. */
function pageFile(path: string): boolean {
  const m = /^\/([a-z0-9-]+)\/places\/([a-z0-9-]+)\/$/.exec(path);
  if (m) {
    const guide = allTowns.find((t) => t.hubPage?.town === m[1] && t.section);
    return !!guide && existsSync(`content/${guide.slug}/places/${m[2]}.md`);
  }
  const page = /^\/([a-z0-9-]+)\/$/.exec(path);
  return !!page && !!findHubTown(page[1]!);
}
