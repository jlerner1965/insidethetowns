/**
 * Recommendations across a page and across the network (audit priority 8,
 * 26 October 2026): Lyons' /this-week/ showed the Stanley's DeVotchKa ball
 * both under "Nearby" and under "Day trips", and the hub's six weekend picks
 * were four from Johnstown. And the short titles the list rows print.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseLocal } from '../src/lib/dates.ts';
import { displayTitle, highlights, nearbyPicks, recommendationKeys, upTheHillPicks } from '../src/lib/events.ts';

const at = (s: string) => parseLocal(s);
/** Monday 26 October 2026: the weekend is the 30th to 1 November. */
const MONDAY = at('2026-10-26T09:00');

function ev(town: string, slug: string, title: string, start: string, extra: Record<string, unknown> = {}) {
  return {
    slug,
    town: { slug: town },
    data: { title, start: at(start), allDay: false, venue: `${title} venue`, category: 'music', status: 'scheduled', changeFlag: false, featured: false, ...extra },
  } as never as { slug: string; town: { slug: string }; data: { title: string; venue: string; start: Date } };
}

test('one event is not both a nearby pick and a day trip up the hill', () => {
  // The Stanley's ball is two files, the 30th and the 31st, one title at one venue.
  const ball30 = ev('estes-park', 'devotchka-costume-ball-2026-10-30', 'DeVotchKa: Halloween Costume Ball at the Stanley', '2026-10-30T18:30', { venue: 'The Stanley Hotel' });
  const ball31 = ev('estes-park', 'devotchka-costume-ball-2026-10-31', 'DeVotchKa: Halloween Costume Ball at the Stanley', '2026-10-31T18:30', { venue: 'The Stanley Hotel' });
  const gig = ev('nederland', 'gig', 'Pickin’ party', '2026-10-31T19:00');
  const fair = ev('longmont', 'fair', 'Harvest fair', '2026-10-31T10:00', { category: 'festival' });
  const all = [ball30, ball31, gig, fair] as never[];
  const nearby = nearbyPicks(all, ['longmont', 'niwot', 'estes-park', 'nederland'], { now: MONDAY, limit: 4 }) as typeof all;
  assert.ok(nearby.some((e: { slug: string }) => e.slug.startsWith('devotchka')), 'the ball is a nearby pick');
  const seen = new Set((nearby as never[]).flatMap((e) => recommendationKeys(e)));
  const hill = upTheHillPicks([ball31, gig] as never[], ['estes-park', 'nederland'], { now: MONDAY, exclude: seen }) as Array<{ slug: string }>;
  assert.ok(!hill.some((e) => e.slug.startsWith('devotchka')), 'so not a day trip too, on either night');
  // Without the exclusion it would have been (the bug).
  assert.ok((upTheHillPicks([ball31, gig] as never[], ['estes-park', 'nederland'], { now: MONDAY }) as Array<{ slug: string }>).some((e) => e.slug.startsWith('devotchka')));
});

test('the keys ignore a link’s campaign tags: they are the page and the series, not the URL', () => {
  const e = ev('estes-park', 'devotchka-costume-ball-2026-10-30', 'DeVotchKa', '2026-10-30T18:30', { venue: 'The Stanley Hotel' });
  assert.deepEqual(recommendationKeys(e as never), ['estes-park/events/devotchka-costume-ball-2026-10-30', 'estes-park|DeVotchKa|The Stanley Hotel']);
});

test('the hub’s weekend picks take no more than two from one town while others have something on', () => {
  const johnstown = ['a', 'b', 'c', 'd', 'e'].map((s, i) => ev('johnstown', `j-${s}`, `Johnstown ${s}`, `2026-10-31T1${i}:00`, { featured: true }));
  const others = [ev('erie', 'e-1', 'Erie fair', '2026-10-31T10:00'), ev('lyons', 'l-1', 'Lyons show', '2026-10-30T19:00'), ev('niwot', 'n-1', 'Niwot market', '2026-11-01T09:00'), ev('erie', 'e-2', 'Erie run', '2026-11-01T08:00')];
  const pool = [...johnstown, ...others] as never[];
  const group = (e: { town: { slug: string } }) => e.town.slug;
  const plain = highlights(pool, { now: MONDAY, limit: 6 }) as Array<{ town: { slug: string } }>;
  assert.ok(plain.filter((e) => e.town.slug === 'johnstown').length > 2, 'the old rule: featured Johnstown fills the block');
  const picks = highlights(pool, { now: MONDAY, limit: 6, group }) as Array<{ town: { slug: string } }>;
  assert.equal(picks.length, 6);
  const count = (t: string) => picks.filter((e) => e.town.slug === t).length;
  assert.equal(count('johnstown'), 2);
  assert.equal(count('erie'), 2);
  assert.equal(count('lyons') + count('niwot'), 2);
  // With too few towns on, the rest fill in from the best left, and no card is invented.
  const thin = highlights([...johnstown, others[0]!] as never[], { now: MONDAY, limit: 6, group }) as Array<{ town: { slug: string } }>;
  assert.equal(thin.length, 6);
  const tiny = highlights([johnstown[0]!] as never[], { now: MONDAY, limit: 6, group });
  assert.equal(tiny.length, 1);
});

test('a row’s title drops a closing "at <the venue>" the row prints anyway, and nothing else', () => {
  const t = (title: string, venue: string) => displayTitle({ data: { title, venue } });
  assert.equal(t('Terror in the Corn at Anderson Farms', 'Anderson Farms'), 'Terror in the Corn');
  assert.equal(t('DeVotchKa: Halloween Costume Ball at the Stanley', 'The Stanley Hotel'), 'DeVotchKa: Halloween Costume Ball');
  assert.equal(t('Cribbage Night at City Star', 'City Star Brewing'), 'Cribbage Night');
  // Not the venue: kept.
  assert.equal(t('Murder at Shade Hallow Manor', 'Carbon Valley Regional Library'), 'Murder at Shade Hallow Manor');
  assert.equal(t('Senior yoga at the library', 'Berthoud Community Library'), 'Senior yoga at the library');
  assert.equal(t('Storybook Explorers at the Cubz Den: The Very Hungry Caterpillar', 'Estes Valley Community Center'), 'Storybook Explorers at the Cubz Den: The Very Hungry Caterpillar');
  assert.equal(t('Nightmare at 1520 Haunted House', 'North Buchanan Park'), 'Nightmare at 1520 Haunted House');
  assert.equal(t('Town Council meeting', 'Town Hall'), 'Town Council meeting');
});
