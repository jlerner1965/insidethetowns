import { test } from 'node:test';
import assert from 'node:assert/strict';
import { annualPageFor, unmatchedAnnualPages, type AnnualPage } from '../src/lib/annual-pages.ts';

const page = (slug: string, title: string, start = '2026-07-10'): AnnualPage => ({ slug, title, start });

test('each tradition finds the guide’s own page for it: by slug, by the slug with the town in front, or by name less the town (review of 14 November 2026)', () => {
  const erie = [page('erie-balloon-festival', 'Erie Balloon Festival'), page('parade-of-lights', 'Erie Parade of Lights and Country Christmas'), page('erie-fest', 'Erie Fest')];
  assert.equal(annualPageFor({ slug: 'erie-balloon-festival', name: 'Erie Balloon Festival' }, erie, ['Erie'])?.slug, 'erie-balloon-festival');
  assert.equal(annualPageFor({ slug: 'erie-parade-of-lights', name: 'Erie Parade of Lights' }, erie, ['Erie'])?.slug, 'parade-of-lights');
  const lyons = [page('holiday-parade-of-lights', 'Lyons Holiday Parade of Lights'), page('tree-lighting-and-caroling', 'Lyons Tree Lighting and Caroling')];
  assert.equal(annualPageFor({ slug: 'lyons-parade-of-lights', name: 'Lyons Parade of Lights' }, lyons, ['Lyons'])?.slug, 'holiday-parade-of-lights');
  assert.equal(annualPageFor({ slug: 'lyons-tree-lighting', name: 'Lyons Tree Lighting' }, lyons, ['Lyons'])?.slug, 'tree-lighting-and-caroling');
  // A Severance record on the Windsor and Severance guide.
  const windsor = [page('kids-fishing-derby', 'Kids Fishing Derby')];
  assert.equal(annualPageFor({ slug: 'severance-kids-fishing-derby', name: 'Severance Kids Fishing Derby', town: { name: 'Severance' } }, windsor, ['Windsor'])?.slug, 'kids-fishing-derby');
  // One word left after the town's name is not enough to call it the same event.
  assert.equal(annualPageFor({ slug: 'erie-parade', name: 'Erie Parade' }, [page('holiday-parade', 'Holiday Parade')], ['Erie']), undefined);
});

test('the annual pages no tradition names are listed under them, so none is linked from nowhere: Erie Fest', () => {
  const erie = [page('erie-balloon-festival', 'Erie Balloon Festival'), page('erie-fest', 'Erie Fest'), page('erie-town-fair', 'Erie Town Fair')];
  const records = [{ slug: 'erie-balloon-festival', name: 'Erie Balloon Festival' }, { slug: 'erie-town-fair', name: 'Erie Town Fair' }];
  assert.deepEqual(unmatchedAnnualPages(records, erie, ['Erie']).map((p) => p.slug), ['erie-fest']);
});

test('the hub’s address for each live guide’s town goes to the guide, and Carbon Valley’s three towns to its home (review of 14 November 2026)', async () => {
  const { HUB_MOVED } = await import('../src/lib/hub-moved.ts');
  const { liveTowns } = await import('../src/config/index.ts');
  const { STANDALONE_GUIDES } = await import('../src/config/hub-towns.ts');
  for (const t of liveTowns()) assert.equal(HUB_MOVED[`/${t.slug}`], `https://${t.domain}/`, `/${t.slug}/`);
  for (const [key, g] of Object.entries(STANDALONE_GUIDES)) {
    const guide = liveTowns().find((t) => t.slug === g.guide)!;
    for (const name of g.towns ?? []) assert.equal(HUB_MOVED[`/${name.toLowerCase()}`], `https://${guide.domain}/`, `${key}: /${name.toLowerCase()}/`);
  }
});

test('a closed guide’s readers are told it closed, with the nearest full guide where one is within reach', async () => {
  const { closedGuideNotes } = await import('../src/lib/closed-guides.ts');
  const golden = { slug: 'golden', name: 'Golden', siteTitle: 'Inside Golden', domain: 'insidegolden.com', lat: 39.7533, lng: -105.2153 };
  const leadville = { slug: 'leadville', name: 'Leadville', siteTitle: 'Inside Leadville', domain: 'insideleadville.com', lat: 39.2508, lng: -106.2925 };
  const erie = { slug: 'erie', name: 'Erie', siteTitle: 'Inside Erie', domain: 'insideerie.com', lat: 40.0503, lng: -105.0499 };
  const notes = closedGuideNotes([golden, leadville], [erie]);
  assert.deepEqual(notes['insidegolden.com'], { guide: 'Inside Golden', town: 'Golden', nearest: { name: 'Inside Erie', url: 'https://insideerie.com/' } });
  assert.equal(notes['insideleadville.com']?.nearest, undefined, 'two hours away is not nearby');
});
