/**
 * The move of the seven guides into insidethetowns.com (the owner's brief of
 * 18 November 2026; src/config/guide-move.ts): one switch per domain, the
 * section built from the guide's own content with every page carried, the
 * redirect map made in the same build, and every link in the network
 * following the switch. The switches are read from the file; this test
 * turns them all on for its own process (GUIDE_MOVE_ON=all) before the
 * config is loaded, so the committed switches stay off.
 */
process.env.GUIDE_MOVE_ON = 'all';
// Both steps of each switch, whatever the committed DOMAIN_HELD holds (the hub-first step has its own test below).
process.env.GUIDE_DOMAIN_HELD = '';
delete process.env.VERCEL;
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const config = await import('../src/config/index.ts');
const { GUIDE_MOVE, MOVING_GUIDES, allTowns, guideOrigin, guideUrl, isMoved, liveTowns, sectionTowns } = config;
const { HUB_MOVED } = await import('../src/lib/hub-moved.ts');
const { movedEventPaths, movedPath } = await import('../src/lib/moved-guides.ts');
const { eventPath, pageTown } = await import('../src/lib/hub-towns.ts');
const { rawRecords } = await import('../src/lib/tradition-files.ts');
const { mergeSection, resolvePath, rewriteMovedLinks } = await import('../scripts/lib/section-merge.ts');
const { guideMap } = await import('../scripts/migration/guide-map.ts');
const { generatedBlocks, retiredOntoGuideRules } = await import('../scripts/lib/redirect-rules.ts');
const hub = config.getNetworkHub();

const SEVEN = ['johnstown', 'berthoud', 'erie', 'windsor', 'carbon-valley', 'lyons', 'niwot'];

test('each committed switch is off or the day it was cut over; turned on, each guide keeps its status, its name and its lists, and gains a section that carries every page', () => {
  const committed = readFileSync('src/config/guide-move.ts', 'utf8');
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Denver', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
  for (const slug of SEVEN) {
    const m = committed.match(new RegExp(`^\\s*'?${slug}'?: (false|'\\d{4}-\\d{2}-\\d{2}'),$`, 'm'));
    assert.ok(m, `${slug}: false, or the day it was cut over, in the file`);
    if (m![1] !== 'false') assert.ok(m![1]!.slice(1, -1) <= today, `${slug}: cut over on ${m![1]}, a day not after today`);
  }
  assert.deepEqual([...MOVING_GUIDES], SEVEN, 'Johnstown first, as the cutover goes');
  for (const slug of SEVEN) {
    const t = allTowns.find((x) => x.slug === slug)!;
    assert.ok(isMoved(t) && (GUIDE_MOVE[slug] === false || /^\d{4}-\d{2}-\d{2}$/.test(GUIDE_MOVE[slug] as string)), `${slug}: on for this process, or cut over`);
    assert.equal(t.status, 'live', `${slug}: still live, so its newsletter, its weekly routine and its re-checks go on`);
    assert.deepEqual(t.hubPage, { town: slug, since: t.section!.since });
    assert.equal(t.section!.mode, 'full');
    assert.equal(t.section!.carry, 'all');
    assert.equal(config.sectionSite(t).siteTitle, t.siteTitle, `${slug}: the section keeps the guide's own name`);
    assert.equal(guideOrigin(t), `https://${hub.domain}/${slug}`);
    assert.equal(guideUrl(t, '/events/x/'), `https://${hub.domain}/${slug}/events/x/`);
  }
  assert.deepEqual(liveTowns().map((t) => t.slug), ['berthoud', 'erie', 'johnstown', 'windsor', 'carbon-valley', 'lyons', 'niwot'], 'the list every page reads is still the seven');
  for (const slug of SEVEN) assert.ok(sectionTowns('full').some((t) => t.slug === slug), `${slug}: built as a full section of the hub`);
  // Nothing else moves.
  assert.ok(!isMoved(allTowns.find((t) => t.slug === 'longmont')!));
  assert.ok(!isMoved(allTowns.find((t) => t.slug === 'severance')!));
});

test('the hub forwards nothing for a moved guide’s own address, and sends its other addresses straight to their place under the section, one hop', () => {
  for (const slug of SEVEN) assert.equal(HUB_MOVED[`/${slug}`], undefined, `/${slug}/ is the section’s home`);
  assert.equal(HUB_MOVED['/frederick'], '/carbon-valley/');
  assert.equal(HUB_MOVED['/severance'], '/windsor/severance/');
  assert.equal(HUB_MOVED['/severance/kids-fishing-derby'], '/windsor/severance-kids-fishing-derby/', 'an annual event’s old address goes to its tradition page');
  // The retired domains that forward onto Windsor and Carbon Valley follow them onto the hub, patterns kept.
  const rules = Object.fromEntries(retiredOntoGuideRules().map((r) => [r.host, [...r.lead, ...r.tail]]));
  assert.equal(rules['insideseverance.com']![0]!.destination, `https://${hub.domain}/windsor/severance/`);
  assert.equal(rules['insideseverance.com']!.find((r) => r.source === '/events/:slug{/}?')!.destination, `https://${hub.domain}/windsor/events/:slug/`);
  assert.equal(rules['insidefrederickco.com'], undefined, 'Frederick’s domain forwards to Carbon Valley: once that guide has moved, api/legacy.ts answers it from the guide’s map, with no rule of its own');
  // A moved guide's own host carries no rule: api/legacy.ts answers every path from the map its build writes.
  for (const slug of SEVEN) {
    const t = allTowns.find((x) => x.slug === slug)!;
    assert.equal(generatedBlocks().find((b) => b.host === t.domain), undefined, `${t.domain}: no block of its own`);
  }
  // The four domains that forward to a guide today (the owner, 18 November 2026): one hop to the hub once the guide has moved.
  assert.deepEqual(allTowns.find((t) => t.slug === 'lyons')!.formerDomains, ['explorelyons.com']);
  assert.deepEqual(allTowns.find((t) => t.slug === 'carbon-valley')!.formerDomains, ['insidefrederickco.com', 'insidefirestone.com']);
  // explorelyons.com, insidefrederickco.com and insidefirestone.com: no rule of their own, answered by the function from the guide's map.
  for (const host of ['explorelyons.com', 'insidefrederickco.com', 'insidefirestone.com']) {
    assert.equal(generatedBlocks().find((b) => b.host === host), undefined, `${host}: no generated block`);
    assert.equal(retiredOntoGuideRules().find((r) => r.host === host), undefined, `${host}: no hand-written rules`);
  }
  assert.equal(movedPath('explorelyons.com', '/explore/'), '/lyons/explore/', 'the old explorelyons path, as the guide’s own rule sends it (the map carries that decision)');
  assert.equal(movedPath('www.explorelyons.com', '/'), '/lyons/');
  assert.equal(movedPath('insidefrederickco.com', '/events/festival-of-lights-2026-12-05/'), '/carbon-valley/frederick-festival-of-lights/');
  assert.equal(movedPath('insidefirestone.com', '/places/x/'), '/carbon-valley/places/x/');
  const run = readFileSync('scripts/run.ts', 'utf8');
  assert.match(run, /for \(const alias of site\.formerDomains \?\? \[\]\) table\[alias\] = \{ page: map\.entry\.page, paths: map\.entry\.paths/, 'the guide’s build writes the map under each former domain too');
  // insideseverance.com keeps its rules (they carry ?where=severance) and gains the annual events’ addresses ahead of its patterns.
  const severance = retiredOntoGuideRules().find((r) => r.host === 'insideseverance.com')!;
  assert.equal(severance.events.find((r) => r.source === '/events/trick-or-treat-parade{/}?')!.destination, `https://${hub.domain}/windsor/severance-trick-or-treat-parade/`);
  assert.equal(severance.events.find((r) => r.source === '/events/kids-fishing-derby{/}?')!.destination, `https://${hub.domain}/windsor/severance-kids-fishing-derby/`);
  assert.equal(severance.tail.at(-1)!.destination, `https://${hub.domain}/windsor/severance/`, 'the catch-all last');
});

test('an address on a moved guide’s domain lands on its page under the section; an annual event’s on the tradition page that stands for it', () => {
  assert.equal(movedPath('insidelyons.com', '/places/oskar-blues-grill-brew/'), '/lyons/places/oskar-blues-grill-brew/');
  assert.equal(movedPath('www.insidelyons.com', '/events/?when=weekend'), '/lyons/events/?when=weekend');
  assert.equal(movedPath('insidelyons.com', '/'), '/lyons/');
  assert.equal(movedPath('insidelyons.com', '/events/holiday-parade-of-lights-2026/'), '/lyons/parade-of-lights/', 'a dated address to the year-less tradition page');
  assert.equal(movedPath('insidelyons.com', '/events/holiday-parade-of-lights/'), '/lyons/parade-of-lights/');
  assert.equal(movedPath('insidewindsorco.com', '/events/windsor-wonderland-2026-12-05/'), '/windsor/wonderland/');
  assert.equal(movedPath('carbonvalleyguide.com', '/events/festival-of-lights-2026-12-05/'), '/carbon-valley/frederick-festival-of-lights/');
  assert.equal(movedPath('insidegolden.com', '/x/'), undefined, 'a folded domain is not a moved guide’s');
  // Niwot's annual events, dated and undated (the owner's review of #465): each on its own tradition page, never the /traditions/ list.
  const niwot: Record<string, string> = {
    '/events/enchanted-evening/': '/niwot/enchanted-evening/',
    '/events/enchanted-evening-2026/': '/niwot/enchanted-evening/',
    '/events/great-pumpkin-party/': '/niwot/great-pumpkin-party/',
    '/events/great-pumpkin-party-2026/': '/niwot/great-pumpkin-party/',
    '/events/holiday-magic-market-fayre/': '/niwot/holiday-magic-market-fayre/',
    '/events/holiday-magic-market-fayre-2026/': '/niwot/holiday-magic-market-fayre/',
    '/events/holiday-parade/': '/niwot/holiday-parade/',
    '/events/holiday-parade-2026/': '/niwot/holiday-parade/',
    '/events/niwot-trot/': '/niwot/niwot-trot/',
    '/events/niwot-trot-5k-2026/': '/niwot/niwot-trot/',
    '/events/fourth-of-july-2027/': '/niwot/fourth-of-july/',
    '/events/lets-wine-about-winter-2027/': '/niwot/lets-wine-about-winter/',
  };
  for (const [from, to] of Object.entries(niwot)) assert.equal(movedPath('insideniwot.com', from), to, `insideniwot.com${from}`);
  // Every record at home in a moved guide has a page under its section.
  const records = rawRecords();
  const lyons = records.find((r) => r.slug === 'lyons-parade-of-lights')!;
  assert.equal(eventPath(lyons, new Set()), '/lyons/parade-of-lights/');
  assert.deepEqual(pageTown('lyons'), { slug: 'lyons', name: 'Lyons', counties: ['Boulder'] });
  for (const slug of SEVEN) {
    const t = allTowns.find((x) => x.slug === slug)!;
    for (const [path, to] of Object.entries(movedEventPaths(t))) {
      assert.match(path, /^\/events\/[a-z0-9-]+\/$/, `${t.domain}${path}`);
      assert.match(to, new RegExp(`^/${slug}/[a-z0-9-]+/$`), `${t.domain}${path} → ${to}`);
      assert.doesNotMatch(to, /(?:^|-)(?:19|20)\d\d(?:-|\/)/, `${t.domain}${path} → ${to}: a year in a tradition page’s address`);
    }
  }
});

test('the merge carries a moved guide’s home page, This Week, updates and sports at their own paths, and drops only the annual event pages a tradition page stands for', () => {
  // Links are left where they are when every page is carried.
  const inSection = (p: string) => ['/', '/this-week/', '/updates/', '/sports/football/', '/events/', '/events/parade-of-lights/'].includes(p);
  const events = { '/events/parade-of-lights/': '/lyons/parade-of-lights/' };
  assert.equal(resolvePath('/this-week/', '/lyons', inSection, () => false, events, []), '/lyons/this-week/');
  assert.equal(resolvePath('/updates/#x', '/lyons', inSection, () => false, events, []), '/lyons/updates/#x');
  assert.equal(resolvePath('/events/parade-of-lights/', '/lyons', inSection, () => false, events, []), '/lyons/parade-of-lights/');
  assert.equal(resolvePath('/this-week/', '/longmont', inSection, () => false, events), '/longmont/events/', 'a section of the first move still sends This Week to its events page');
  const root = mkdtempSync(join(tmpdir(), 'carry-'));
  try {
    const from = join(root, 'section');
    const hubDir = join(root, 'hub');
    const page = (links: string[]) => `<!doctype html><html><body>${links.map((l) => `<a href="${l}">x</a>`).join('')}</body></html>`;
    for (const [file, text] of Object.entries({
      'index.html': page(['/events/', '/this-week/', '/sports/football/', '/events/parade-of-lights/', 'https://insidelyons.com/updates/']),
      'this-week/index.html': page(['/']),
      'updates/index.html': page(['/updates.rss']),
      'updates.rss': '<rss><link>https://insidelyons.com/updates/</link></rss>',
      'sports/football/index.html': page(['/sports/']),
      'sports/index.html': page([]),
      'events/index.html': page([]),
      'events/parade-of-lights/index.html': page([]),
      'sitemap-0.xml': `<urlset><url><loc>https://${hub.domain}/lyons/</loc><lastmod>2026-11-01T00:00:00.000Z</lastmod></url><url><loc>https://${hub.domain}/lyons/events/parade-of-lights/</loc><lastmod>2026-11-30T00:00:00.000Z</lastmod></url><url><loc>https://${hub.domain}/lyons/this-week/</loc><lastmod>2026-11-18T12:00:00.000Z</lastmod></url></urlset>`,
      'sitemap-index.xml': '<sitemapindex/>',
      '404.html': 'x',
    })) {
      mkdirSync(join(from, file, '..'), { recursive: true });
      writeFileSync(join(from, file), text);
    }
    mkdirSync(hubDir, { recursive: true });
    writeFileSync(join(hubDir, 'sitemap-index.xml'), '<sitemapindex></sitemapindex>');
    mkdirSync(join(hubDir, 'lyons', 'parade-of-lights'), { recursive: true });
    writeFileSync(join(hubDir, 'lyons', 'parade-of-lights', 'index.html'), 'the tradition page');
    const merged = mergeSection({ from, hub: hubDir, base: '/lyons', oldDomain: 'insidelyons.com', hubDomain: hub.domain, events, carryAll: true });
    assert.deepEqual(merged.dangling, []);
    const read = (f: string) => readFileSync(join(hubDir, 'lyons', f), 'utf8');
    assert.match(read('index.html'), /href="\/lyons\/this-week\/"/);
    assert.match(read('index.html'), /href="\/lyons\/sports\/football\/"/);
    assert.match(read('index.html'), /href="\/lyons\/parade-of-lights\/"/, 'the annual event’s link goes to the tradition page');
    assert.match(read('index.html'), new RegExp(`href="https://${hub.domain.replace(/\./g, '\\.')}/lyons/updates/"`));
    assert.equal(read('parade-of-lights/index.html'), 'the tradition page', 'the hub’s tradition page is kept; the guide’s own page for the event is not merged over it');
    assert.match(read('updates.rss'), new RegExp(`https://${hub.domain.replace(/\./g, '\\.')}/lyons/updates/`));
    const sitemap = readFileSync(join(hubDir, 'sitemap-lyons.xml'), 'utf8');
    assert.match(sitemap, /\/lyons\/this-week\//);
    assert.doesNotMatch(sitemap, /\/lyons\/events\/parade-of-lights\//, 'the dropped page is not in the sitemap');
    // The index names the section's sitemap once, dated by the newest page it still lists (the dropped page's later date does not count).
    const index = readFileSync(join(hubDir, 'sitemap-index.xml'), 'utf8');
    assert.equal(index, `<sitemapindex><sitemap><loc>https://${hub.domain}/sitemap-lyons.xml</loc><lastmod>2026-11-18T12:00:00.000Z</lastmod></sitemap></sitemapindex>`);
    // The hub's own pages that name the guide's domain by hand follow it; the email archive only where the page is built.
    mkdirSync(join(hubDir, 'moving'), { recursive: true });
    writeFileSync(join(hubDir, 'moving', 'index.html'), page(['https://insidelyons.com/updates/#x', 'https://insidelyons.com/events/parade-of-lights/']));
    mkdirSync(join(hubDir, 'newsletter', '2026-10-01-lyons'), { recursive: true });
    writeFileSync(join(hubDir, 'newsletter', '2026-10-01-lyons', 'index.html'), page(['https://insidelyons.com/#signup', 'https://insidelyons.com/events/over-2026-09-30/']));
    const where = (domain: string, path: string) => (domain === 'insidelyons.com' ? (events[path.split(/[?#]/)[0]!] ?? `/lyons${path}`) : undefined);
    assert.equal(rewriteMovedLinks(hubDir, hub.domain, ['insidelyons.com'], where, { '/lyons/events/parade-of-lights/': '/lyons/parade-of-lights/' }), 2);
    const moving = readFileSync(join(hubDir, 'moving', 'index.html'), 'utf8');
    assert.match(moving, new RegExp(`href="https://${hub.domain.replace(/\./g, '\\.')}/lyons/updates/#x"`));
    assert.match(moving, new RegExp(`href="https://${hub.domain.replace(/\./g, '\\.')}/lyons/parade-of-lights/"`), 'an annual event’s page to the tradition page that stands for it');
    const archive = readFileSync(join(hubDir, 'newsletter', '2026-10-01-lyons', 'index.html'), 'utf8');
    assert.match(archive, new RegExp(`href="https://${hub.domain.replace(/\./g, '\\.')}/lyons/#signup"`), 'the home is built, so the archive link follows');
    assert.match(archive, /href="https:\/\/insidelyons\.com\/events\/over-2026-09-30\/"/, 'a listing that is over stays as sent');
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('the redirect map: every page the section builds, a former slug’s target, a past date to its series, the history’s decisions, the sitemap and robots.txt as files; nothing left over goes to a generic page', () => {
  const root = mkdtempSync(join(tmpdir(), 'guide-map-'));
  const guide = allTowns.find((t) => t.slug === 'lyons')!;
  try {
    const out = join(root, 'section');
    for (const file of ['index.html', 'events/index.html', 'events/wayback-karaoke-2026-12-11/index.html', 'places/oskar-blues-grill-brew/index.html', 'this-week/index.html', 'directory/index.html', 'guides/index.html', 'search/index.html', '_astro/x.css', 'robots.txt', '404.html']) {
      mkdirSync(join(out, file, '..'), { recursive: true });
      writeFileSync(join(out, file), 'x');
    }
    writeFileSync(join(out, 'sitemap-0.xml'), `<urlset><url><loc>https://${hub.domain}/lyons/</loc></url><url><loc>https://${hub.domain}/lyons/places/oskar-blues-grill-brew/</loc></url></urlset>`);
    // The guide's own content: a series with two dates, the earlier one gone from the files.
    const content = join(root, 'content', 'lyons', 'events');
    mkdirSync(content, { recursive: true });
    writeFileSync(join(content, 'wayback-karaoke-2026-12-11.md'), '---\ntitle: "Wayback Karaoke"\nvenue: "Wayback"\nstart: "2026-12-11T20:00"\nformerSlugs: [wayback-karaoke-dec]\n---\n');
    const history = [
      { old_path: '/events/wayback-karaoke-2026-12-04/', source: 'git deleted', kind: 'events', key: 'Wayback Karaoke|Wayback', decision: '', note: '' },
      { old_path: '/events/one-off-2026-10-01/', source: 'git deleted', kind: 'events', key: 'One Off|Hall', decision: 'gone', note: 'passed' },
      { old_path: '/places/closed-shop/', source: 'sitemap', kind: 'places', key: '', decision: 'https://insidethetowns.com/lyons/directory/', note: 'a person’s decision' },
      { old_path: '/places/renamed/', source: 'git deleted', kind: 'places', key: '', decision: '/places/oskar-blues-grill-brew/', note: 'the same listing, re-filed' },
      { old_path: '/articles/undecided/', source: 'sitemap', kind: 'articles', key: '', decision: '', note: '' },
    ];
    const map = guideMap({ guide, out, hubDomain: hub.domain, root, now: new Date('2026-11-18T12:00:00-07:00'), history });
    const paths = map.entry.paths;
    const to = (p: string) => `https://${hub.domain}/lyons${p}`;
    assert.equal(paths['/'], to('/'));
    assert.equal(paths['/this-week/'], to('/this-week/'), 'carried at its own path');
    assert.equal(paths['/places/oskar-blues-grill-brew/'], to('/places/oskar-blues-grill-brew/'));
    assert.equal(paths['/events/holiday-parade-of-lights-2026/'], `https://${hub.domain}/lyons/parade-of-lights/`, 'an annual event’s dated address to its tradition page, built or not');
    assert.equal(paths['/events/wayback-karaoke-dec/'], to('/events/wayback-karaoke-2026-12-11/'), 'a former slug to its target');
    assert.equal(paths['/events/wayback-karaoke-2026-12-04/'], to('/events/wayback-karaoke-2026-12-11/'), 'a past date of a series that goes on, to the series’ page');
    assert.equal(paths['/events/one-off-2026-10-01/'], 0, 'a documented retirement is 410');
    assert.equal(paths['/places/closed-shop/'], `https://${hub.domain}/lyons/directory/`, 'a person’s decision stands as written');
    assert.equal(paths['/places/renamed/'], to('/places/oskar-blues-grill-brew/'));
    assert.equal(paths['/places'], undefined);
    assert.equal(paths['/places/'], to('/directory/'), 'the moved index page');
    assert.equal(paths['/_astro/x.css'], undefined, 'assets are not addresses');
    assert.equal(paths['/robots.txt'], undefined, 'the function serves robots.txt itself');
    assert.equal(paths['/search/'], `https://${hub.domain}/search/`, 'the guide’s search, which the merge leaves out, to the hub’s, the query carried by the function');
    assert.deepEqual(map.unmapped.map((r) => r.old_path), ['/articles/undecided/'], 'what nothing answers is listed, never sent to the home page by default');
    for (const [p, v] of Object.entries(paths)) if (/^\/events\/[^/]+\/$/.test(p)) assert.notEqual(v, to('/events/'), `${p}: a listing never goes to the events list`);
    // The sitemap the guide serves today, at its old address, and robots.txt pointing to it (api/legacy.ts): the brief's 200s.
    assert.match(map.entry.sitemap!, /<loc>https:\/\/insidelyons\.com\/places\/oskar-blues-grill-brew\/<\/loc>/);
    assert.doesNotMatch(map.entry.sitemap!, /insidethetowns\.com/);
    assert.match(map.entry.sitemapIndex!, /<loc>https:\/\/insidelyons\.com\/sitemap-0\.xml<\/loc>/);
    for (const loc of map.entry.sitemap!.matchAll(/<loc>https:\/\/insidelyons\.com([^<]+)<\/loc>/g)) assert.ok(loc[1]! in paths, `${loc[1]}: in the sitemap, so in the map`);
    assert.deepEqual(map.entry.moved, { name: 'Inside Lyons' });
    assert.equal(map.entry.page, to('/'));
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('the function serves a moved guide’s sitemap and robots.txt with 200 and says on a 410 that the guide moved, not that it closed', async () => {
  const { answer, lookup } = await import('../api/legacy.ts');
  // answer() reads api/legacy-map.json; a moved guide's entry is written there by its own build. The shape is the folded domains', so the same code serves it: checked on one of those.
  const res = answer('insidegolden.com', '/robots.txt');
  assert.equal(res.status, 200);
  assert.equal(lookup({ page: 'x', paths: { '/a/': 'https://insidethetowns.com/lyons/a/' } }, '/a'), 'https://insidethetowns.com/lyons/a/');
  const legacy = readFileSync('api/legacy.ts', 'utf8');
  assert.match(legacy, /moved\s*\?\s*`<p>It was on \$\{moved\.name\}, which is now part of Inside the Towns/, 'the 410 page names the guide that moved');
  assert.match(legacy, /entry\.moved/);
});

test('a moved guide builds no site of its own and leaves the nightly rebuild’s hook list; its project builds for its switch, its rules, the function and its content', () => {
  const run = readFileSync('scripts/run.ts', 'utf8');
  assert.match(run, /domainMoved\(site, env\)\)\s*\{[\s\S]*?guideMap\(/, 'the guide’s project writes the map from its own section build, once its domain is not held');
  assert.match(run, /carryAll: isMoved\(section\)/, 'the hub merges its section with every page carried');
  const live = readFileSync('scripts/live-towns.ts', 'utf8');
  assert.match(live, /LIVE_TOWNS\.filter\(\(s\) => !moved\.includes\(s\)\)/);
  assert.match(live, /--moved/);
  const ignore = readFileSync('scripts/vercel-ignore.sh', 'utf8');
  assert.match(ignore, /src\/config\/guide-move\.ts 2>\/dev\/null; then/, 'the ignore step reads the switch');
  assert.match(ignore, /scripts\/migration\/guide-map\.ts \| "docs\/migration\/guides\/"\* \| data\/hub\/fold-events\.json \| "content\/\$slug\/"\*/, 'and builds for what the map is made of');
  const rebuild = readFileSync('.github/workflows/scheduled-rebuild.yml', 'utf8');
  assert.match(rebuild, /live-towns\.ts --moved/, 'the nightly rebuild names a stale hook line');
  const routes = readFileSync('src/integrations/town-routes.ts', 'utf8');
  assert.match(routes, /sectionBuild && !isMoved\(site\)\s*\?\s*sectionRoutes\(site\)/, 'a moved guide’s section gets every route the guide had');
});

test('Plausible counts every hub page, sections included, as insidethetowns.com; a guide on its own domain as that domain', () => {
  const { plausibleDomain } = config;
  assert.equal(hub.plausible, true);
  assert.equal(plausibleDomain(hub, {}), 'insidethetowns.com');
  for (const slug of [...SEVEN, 'longmont', 'loveland', 'fortcollins', 'estes-park']) {
    const t = allTowns.find((x) => x.slug === slug)!;
    assert.equal(plausibleDomain(t, { HUB_SECTION: '1' }), 'insidethetowns.com', `${slug}'s section`);
  }
  const berthoud = allTowns.find((x) => x.slug === 'berthoud')!;
  assert.equal(plausibleDomain(berthoud, {}), 'insideberthoud.com', 'the guide on its own domain, before its switch');
  const without = allTowns.find((x) => x.kind === 'town' && !x.plausible)!;
  assert.equal(plausibleDomain(without, {}), undefined);
});

test('the hub-first step (DOMAIN_HELD): the section is on the hub and the hub’s /<town>/ is its home, while the guide’s own project builds the guide and its domain keeps its rules', async () => {
  const { applyGuideMove, domainHeld, domainMoved, DOMAIN_HELD } = await import('../src/config/guide-move.ts');
  const { berthoud } = await import('../src/config/towns/berthoud.ts');
  const committed = readFileSync('src/config/guide-move.ts', 'utf8');
  assert.match(committed, /^export const DOMAIN_HELD: readonly string\[\] = \[[^\]]*\];$/m, 'DOMAIN_HELD on one line, as the ignore step reads it');
  for (const slug of DOMAIN_HELD) assert.notEqual(GUIDE_MOVE[slug], undefined, `${slug}: one of the seven`);
  const env = (more: Record<string, string>) => ({ GUIDE_MOVE_ON: 'berthoud', GUIDE_DOMAIN_HELD: 'berthoud', ...more });
  // The hub, and the section build on the hub: moved.
  const [onHub] = applyGuideMove([berthoud], env({ TOWN: 'hub' }));
  assert.ok(isMoved(onHub!) && onHub!.hubPage?.town === 'berthoud');
  assert.equal(domainMoved(onHub!, env({ TOWN: 'hub' })), false, 'its domain is held');
  const [asSection] = applyGuideMove([berthoud], env({ TOWN: 'berthoud', HUB_SECTION: '1' }));
  assert.ok(isMoved(asSection!), 'the hub builds the section');
  // Its own project: the guide, exactly as before.
  const [own] = applyGuideMove([berthoud], env({ TOWN: 'berthoud' }));
  assert.equal(own, berthoud, 'the guide’s own build sees the guide unmoved');
  // Another guide's build links to the section.
  const [fromErie] = applyGuideMove([berthoud], env({ TOWN: 'erie' }));
  assert.ok(isMoved(fromErie!));
  // The second step: held no more, its domain moves.
  assert.equal(domainMoved(onHub!, { GUIDE_MOVE_ON: 'berthoud', GUIDE_DOMAIN_HELD: '' }), true);
  assert.deepEqual([...domainHeld({ GUIDE_DOMAIN_HELD: 'berthoud, erie' })], ['berthoud', 'erie']);
});
