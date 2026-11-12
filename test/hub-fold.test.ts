/**
 * A guide folded into its town's page on the hub (the restructure of 12
 * November 2026; TownConfig.hubPage, DECISIONS.md, "Two tiers"). Two tiers
 * and no third: a town is one of the seven standalone guides or a page on
 * insidethetowns.com, and a guide leaves only once its page is there.
 *
 * Nine guides were folded that day: Castle Rock, Estes Park, Fort Collins,
 * Golden, Leadville, Longmont, Loveland, Nederland and Timnath. Five retired
 * earlier (Evergreen, Fort Lupton, Georgetown, Grand Lake and Manitou
 * Springs) carry `hubPage` beside `retired`, so their domains go to their
 * page too and not to the hub's home page (test/retired-towns.test.ts).
 *
 * As with a guide folded into another (test/folded-towns.test.ts), several
 * files have to agree, and a miss in any one is a 404 on an address search
 * engines and sent emails still hold, or a redirect to a page that is not
 * built: the config says which page, the page is published (three verified
 * dated records of the town's own, src/lib/hub-towns.ts), vercel.json holds
 * exactly the rules src/lib/fold.ts writes for the domain
 * (`node scripts/fold-rules.ts --write`), and the guide's content has left
 * its folder.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { emailTowns, findTown, LIVE_TOWNS } from '../src/config/index.ts';
import { towns } from '../src/config/towns/registry.ts';
import { hub } from '../src/config/towns/hub.ts';
import { HUB_TOWNS, STANDALONE_GUIDES, findHubTown, hubTownForGuide } from '../src/config/hub-towns.ts';
import { foldRules, OUTDOOR_ANCHOR, TO_OUTDOOR, TO_TRADITIONS, TRADITIONS_ANCHOR } from '../src/lib/fold.ts';
import { publishedHubTownSlugs } from '../src/lib/tradition-files.ts';

const vercel = JSON.parse(readFileSync(new URL('../vercel.json', import.meta.url), 'utf8')) as {
  redirects: Array<{ source: string; destination: string; permanent?: boolean; has?: Array<{ type: string; value?: string }> }>;
};
const rulesFor = (domain: string) => vercel.redirects.filter((r) => r.has?.some((h) => h.type === 'host' && h.value === domain));

const withPage = towns.filter((t) => t.hubPage);
/** Folded on 12 November 2026, as distinct from a guide retired earlier whose town has since got its page. */
const folded = withPage.filter((t) => !t.retired);
const published = new Set(publishedHubTownSlugs());
const standaloneConfigs = Object.values(STANDALONE_GUIDES).map((g) => g.guide);

test('ten guides were folded into their hub pages on 12 November 2026, and seven retired earlier forward to theirs', () => {
  assert.equal(hub.domain, 'insidethetowns.com');
  assert.deepEqual(folded.map((t) => t.slug).sort(), ['castle-rock', 'estes-park', 'fortcollins', 'golden', 'lafayette', 'leadville', 'longmont', 'loveland', 'nederland', 'timnath']);
  for (const t of folded) assert.equal(t.hubPage!.since, '2026-11-12', `${t.slug}: the day it was folded`);
  assert.deepEqual(withPage.filter((t) => t.retired).map((t) => t.slug).sort(), ['black-hawk', 'evergreen', 'fort-lupton', 'georgetown', 'grand-lake', 'idaho-springs', 'manitou-springs']);
});

test('no fold without a page: a config with `hubPage` redirects, names its own hub town, and that town’s page is published', () => {
  assert.ok(withPage.length > 0);
  for (const t of withPage) {
    assert.equal(t.status, 'redirect', `${t.slug}: a guide with a hub page is a redirect`);
    assert.equal(t.foldedInto, undefined, `${t.slug}: folded into its hub page, not into another guide`);
    assert.match(t.hubPage!.since, /^\d{4}-\d{2}-\d{2}$/, `${t.slug}: since`);
    const hubTown = findHubTown(t.hubPage!.town);
    assert.ok(hubTown, `${t.slug}: "${t.hubPage!.town}" is not a town in HUB_TOWNS`);
    assert.equal(hubTown.guide, t.slug, `${t.slug}: the hub town ${hubTown.slug} names ${hubTown.guide ?? 'no guide'} as its guide`);
    assert.equal(hubTownForGuide(t.slug)?.slug, t.hubPage!.town, `${t.slug}: the registry and the config name the same page`);
    assert.ok(published.has(t.hubPage!.town), `${t.slug}: /${t.hubPage!.town}/ is not published (fewer than three verified dated records of its own), so the domain would redirect to a page that is not built`);
  }
  // And nothing live has one: a live guide stays up unchanged until it is folded.
  for (const t of towns.filter((t) => t.status !== 'redirect')) assert.equal(t.hubPage, undefined, `${t.slug}: hubPage without status redirect`);
  // Nor a standalone guide, live or not: the two tiers do not overlap.
  for (const slug of standaloneConfigs) assert.equal(findTown(slug)?.hubPage, undefined, `${slug}: a standalone guide has no hub page`);
});

test('vercel.json holds exactly the rules src/lib/fold.ts writes for each domain: permanent, the home page first, the catch-all last', () => {
  for (const t of withPage) {
    const rules = rulesFor(t.domain);
    const expected = foldRules(t.domain, 'insidethetowns.com', t.hubPage!.town);
    assert.deepEqual(rules, expected, `${t.domain}: vercel.json and foldRules disagree; run "node scripts/fold-rules.ts --write"`);
    assert.ok(rules.length > 0, `${t.domain}: no rules`);
    for (const r of rules) {
      assert.equal(r.permanent, true, `${t.domain}${r.source}: permanent`);
      assert.deepEqual(r.has, [{ type: 'host', value: t.domain }], `${t.domain}${r.source}: scoped to the guide's own host and nothing else`);
    }
    assert.equal(rules[0]!.source, '/', `${t.domain}: the home page first`);
    assert.equal(rules.at(-1)!.source, '/(.*)', `${t.domain}: the catch-all last, or it would take every path before it`);
    assert.equal(new Set(rules.map((r) => r.source)).size, rules.length, `${t.domain}: no source twice`);
  }
});

test('each old address lands on the matching place on the page: the events on Traditions, the outdoors on Outdoor dates, the rest at the top', () => {
  for (const t of withPage) {
    const page = `https://insidethetowns.com/${t.hubPage!.town}/`;
    const to = (source: string) => rulesFor(t.domain).find((r) => r.source === source)?.destination;
    assert.equal(to('/'), page, `${t.domain}: the home page`);
    assert.equal(to('/(.*)'), page, `${t.domain}: everything else`);
    for (const source of TO_TRADITIONS) assert.equal(to(source), `${page}#${TRADITIONS_ANCHOR}`, `${t.domain}${source}`);
    for (const source of TO_OUTDOOR) assert.equal(to(source), `${page}#${OUTDOOR_ANCHOR}`, `${t.domain}${source}`);
    for (const r of rulesFor(t.domain)) assert.ok(r.destination === page || r.destination.startsWith(`${page}#`), `${t.domain}${r.source}: goes to ${r.destination}, off the town's page`);
  }
  // The addresses a guide's readers hold are among them.
  for (const source of ['/events{/}?', '/events/(.*)', '/this-week{/}?', '/this-weekend{/}?']) assert.ok((TO_TRADITIONS as readonly string[]).includes(source), source);
  assert.ok((TO_OUTDOOR as readonly string[]).includes('/things-to-do{/}?'));
});

test("a folded guide's content has left its folder, and its data with it", () => {
  for (const t of folded) {
    for (const dir of ['events', 'places', 'articles', 'pages', 'staging', 'weekly', 'corrections', 'programs', 'updates']) {
      const path = new URL(`../content/${t.slug}/${dir}/`, import.meta.url);
      assert.ok(!existsSync(path) || readdirSync(path).length === 0, `content/${t.slug}/${dir}/ should be empty`);
    }
    assert.ok(!existsSync(new URL(`../content/${t.slug}/sources.json`, import.meta.url)), `${t.slug}: sources gone`);
    assert.ok(!existsSync(new URL(`../data/${t.slug}/`, import.meta.url)), `data/${t.slug}/ should be gone`);
  }
});

test('a folded guide is out of every list: not live, not in the email, no longer quiet or a visitor guide, and nobody’s neighbour', () => {
  const email = emailTowns().map((e) => e.slug);
  const editions = (hub.newsletter?.editions ?? []).flatMap((e) => e.towns);
  for (const t of folded) {
    assert.ok(!LIVE_TOWNS.includes(t.slug), `${t.slug}: not deployed as a guide`);
    assert.ok(!email.includes(t.slug), `${t.slug}: not in the email`);
    assert.ok(!editions.includes(t.slug), `${t.slug}: in no shared edition`);
    assert.equal(t.quiet, undefined, `${t.slug}: no longer quiet`);
    assert.equal(t.visitorGuide, undefined, `${t.slug}: no longer a visitor guide`);
    assert.deepEqual([...t.neighbors], [], `${t.slug}: names no neighbours`);
    for (const other of towns) assert.ok(!other.neighbors.includes(t.slug), `${other.slug} still lists ${t.slug} as a neighbour`);
    for (const other of towns) assert.ok(!other.subTowns?.includes(t.slug) || other.slug === t.slug, `${other.slug} still lists ${t.slug} as a section`);
  }
});

test('a live guide that is not one of the seven stays up only because its town’s page does not qualify yet', () => {
  const others = towns.filter((t) => t.status === 'live' && !standaloneConfigs.includes(t.slug));
  // Lafayette's page qualified later on 12 November 2026 (an organizer's
  // own word of continuing counts), so Elizabeth is the one left.
  assert.deepEqual(others.map((t) => t.slug).sort(), ['elizabeth']);
  for (const t of others) {
    const hubTown = hubTownForGuide(t.slug);
    assert.ok(hubTown, `${t.slug}: a live guide outside the seven is a hub town`);
    assert.ok(!published.has(hubTown.slug), `${t.slug}: /${hubTown.slug}/ is published, so the guide should be folded into it (hubPage, status 'redirect', fold rules)`);
    assert.equal(t.hubPage, undefined, `${t.slug}: live, so not folded`);
    assert.equal(rulesFor(t.domain).some((r) => r.source === '/' || r.source === '/(.*)'), false, `${t.domain}: a live guide's home page and catch-all are not redirected`);
  }
  // The other way round: a published page whose town has a guide has taken that guide's place.
  for (const hubTown of HUB_TOWNS.filter((h) => h.guide && published.has(h.slug))) {
    const guide = findTown(hubTown.guide!);
    assert.ok(guide, `${hubTown.slug}: no config "${hubTown.guide}"`);
    assert.equal(guide.status, 'redirect', `${hubTown.slug}: its page is published and its guide ${guide.slug} is still ${guide.status}`);
  }
});

test('the seven standalone guides are live, each from its own config, and none is a hub town', () => {
  assert.deepEqual(Object.keys(STANDALONE_GUIDES).sort(), ['berthoud', 'carbon-valley', 'erie', 'johnstown', 'lyons', 'niwot', 'windsor']);
  assert.deepEqual([...standaloneConfigs].sort(), ['berthoud', 'erie', 'frederick', 'johnstown', 'lyons', 'niwot', 'windsor']);
  assert.equal(new Set(standaloneConfigs).size, 7, 'seven configs, none twice');
  for (const [key, { guide, kind }] of Object.entries(STANDALONE_GUIDES)) {
    const t = findTown(guide);
    assert.ok(t, `${key}: no config "${guide}"`);
    assert.equal(t.status, 'live', `${key}: the standalone guide ${guide} is live`);
    assert.ok(LIVE_TOWNS.includes(guide), `${key}: ${guide} is deployed`);
    assert.equal(findHubTown(key), undefined, `${key}: a standalone guide is not also a hub town`);
    assert.equal(hubTownForGuide(guide), undefined, `${key}: no hub town names ${guide} as its guide`);
    // What it leads with (TownConfig.lead): unset on the sports-led guides.
    assert.equal(t.lead, kind === 'sports' ? undefined : kind === 'quiet' ? 'updates' : 'outdoors', `${key}: ${kind}`);
  }
  // "Carbon Valley" is the brief's name for the guide to Frederick: the config of that name is retired and forwards to it.
  assert.equal(STANDALONE_GUIDES['carbon-valley']!.guide, 'frederick');
  assert.equal(findTown('carbon-valley')!.retired?.successor, 'frederick');
});
