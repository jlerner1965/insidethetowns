#!/usr/bin/env node
/**
 * Every address a moving guide's domain has ever published (the move of the
 * seven guides, src/config/guide-move.ts): docs/migration/guides/<host>.csv,
 * which the redirect map reads for the addresses the guide no longer builds
 * (scripts/migration/guide-map.ts). Rebuilt from build history, as the first
 * move's inventory was (scripts/migration/inventory.ts):
 *
 *   git        every listing file ever under content/<town>/{events,places,
 *              articles}/, with the former slugs each declared and the
 *              retired.json ledger at every commit; for an event, its series
 *              key (title and venue, src/lib/series.ts), read from the file's
 *              last version, so a past date can follow its series;
 *   sitemap    every address a production deployment's sitemap ever listed
 *              (docs/migration/guides/history/<host>-sitemaps.csv, sampled
 *              from the Vercel deployment history on 18 November 2026);
 *   vercel.json  every fixed address a rule on the host ever named;
 *   qr-card    the printed cards' addresses.
 *
 * An annual event's address in data/hub/fold-events.json takes its
 * tradition page on the hub as its decision.
 *
 * Each row keeps its `decision` and `note` across reruns. A decision is
 * empty (the rules decide: the section's page, a former slug's target, the
 * series' current page), a path on the guide ("/events/x/": wherever that
 * lands), "gone" (410), or an address on the hub. `--decide` writes the
 * default decision for what the rules leave: a past event with no later
 * date of its series and a retired listing with no successor are gone, with
 * the reason; anything else is left for a person and printed.
 *
 *   node scripts/migration/guide-inventory.ts                       # all seven
 *   node scripts/migration/guide-inventory.ts --guide=johnstown
 *   node scripts/migration/guide-inventory.ts --guide=johnstown --decide --out=.sections/johnstown
 */
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { allTowns, getNetworkHub, MOVING_GUIDES } from '../../src/config/index.ts';
import { dayKey } from '../../src/lib/dates.ts';
import { parseFormerSlugs } from '../../src/lib/former-slugs.ts';
import { readOccurrences } from '../../src/lib/series.ts';
import { movedEventPaths } from '../../src/lib/moved-guides.ts';
import { guideMap, type HistoryRow } from './guide-map.ts';
import { csvLine, readCsv } from './shared.ts';

const args = process.argv.slice(2);
const opt = (name: string) => args.find((a) => a.startsWith(`--${name}=`))?.split('=').slice(1).join('=');
const only = opt('guide');
const decide = args.includes('--decide');
const out = opt('out');
const today = dayKey(new Date());
const git = (...a: string[]) => execFileSync('git', a, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 64 << 20 });

/** The printed QR cards: each opens the guide's home page (Niwot's with `?ref=card-<place>`, which the function carries onto the 301). */
const QR_CARDS: Record<string, string[]> = { berthoud: ['/'], erie: ['/'], niwot: ['/'] };

const KINDS = ['events', 'places', 'articles'] as const;
const hub = getNetworkHub();
mkdirSync('docs/migration/guides', { recursive: true });

for (const slug of MOVING_GUIDES.filter((s) => !only || s === only)) {
  const guide = allTowns.find((t) => t.slug === slug)!;
  const file = `docs/migration/guides/${guide.domain}.csv`;
  const kept = new Map<string, Pick<HistoryRow, 'decision' | 'note'>>();
  if (existsSync(file)) for (const r of readCsv(file) as unknown as HistoryRow[]) kept.set(r.old_path, { decision: r.decision, note: r.note });
  const rows = new Map<string, HistoryRow>();
  const add = (path: string, source: string, kind = '', key = '', note = '') => {
    if (!path.startsWith('/') || /^\/(?:_astro|favicons|pagefind)\//.test(path)) return;
    const prior = rows.get(path);
    if (prior) {
      if (!prior.key && key) prior.key = key;
      if (!prior.kind && kind) prior.kind = kind;
      if (!prior.note && note) prior.note = note;
      if (!prior.source.includes(source.split(' ')[0]!)) prior.source += `; ${source}`;
      return;
    }
    const k = kept.get(path);
    rows.set(path, { old_path: path, source, kind, key, decision: k?.decision ?? '', note: k?.note ?? note });
  };

  // 1. git: every listing file ever, its former slugs, and the ledger at every commit.
  for (const kind of KINDS) {
    const dir = `content/${slug}/${kind}/`;
    const files = new Set(git('log', '--all', '--format=', '--name-only', '--', dir).split('\n').filter((f) => f.startsWith(dir) && f.endsWith('.md') && !/\/_/.test(f) && !/\/staging\//.test(f)));
    for (const f of files) {
      const name = f.split('/').pop()!.replace(/\.md$/, '');
      let text: string | undefined;
      if (existsSync(f)) text = readFileSync(f, 'utf8');
      else {
        const last = git('rev-list', '-n', '1', '--all', '--', f).trim();
        try {
          text = last ? git('show', `${last}^:${f}`) : undefined;
        } catch {
          text = undefined;
        }
      }
      const fm = text?.match(/^---\n([\s\S]*?)\n---/)?.[1] ?? '';
      const field = (k: string) => fm.match(new RegExp(`^${k}:\\s*(.*)$`, 'm'))?.[1]?.trim().replace(/^["']|["']$/g, '') ?? '';
      const fileSlug = field('slug') || name;
      const key = kind === 'events' ? `${field('title')}|${field('venue')}` : '';
      const when = existsSync(f) ? 'in the content today' : 'deleted';
      add(`/${kind}/${fileSlug}/`, `git ${when}`, kind, key);
      if (fileSlug !== name) add(`/${kind}/${name}/`, `git ${when} (file name)`, kind, key);
      for (const former of parseFormerSlugs(fm)) add(`/${kind}/${former}/`, `git formerSlugs of ${fileSlug}`, kind, key);
    }
  }
  const ledgerFile = `content/${slug}/retired.json`;
  for (const sha of git('log', '--all', '--format=%H', '--', ledgerFile).split('\n').filter(Boolean)) {
    try {
      const ledger = JSON.parse(git('show', `${sha}:${ledgerFile}`)) as Record<string, Record<string, string | null>>;
      for (const [kind, entries] of Object.entries(ledger)) for (const [from, to] of Object.entries(entries)) add(`/${kind}/${from}/`, `retired.json`, kind, '', to ? `ledger: ${to}` : 'ledger: retired');
    } catch {
      /* not JSON at that commit */
    }
  }

  // 2. Every address a production sitemap ever listed.
  const history = `docs/migration/guides/history/${guide.domain}-sitemaps.csv`;
  if (existsSync(history)) for (const r of readCsv(history)) add(r.path!, `sitemap ${r.first_seen} to ${r.last_seen}`, r.path!.match(/^\/(events|places|articles)\//)?.[1] ?? 'page');

  // 3. Every fixed address a vercel.json rule on the host ever named. A rule
  // in today's vercel.json is the guide's own answer for the address, so its
  // destination is the row's decision unless a person wrote one: where the
  // destination lands on the section (a page, a fragment of one), or on the hub.
  const current = JSON.parse(readFileSync('vercel.json', 'utf8')) as { redirects?: Array<{ source: string; destination: string; has?: Array<{ type: string; value?: string }> }> };
  const ruleAddress = (source: string) => (source.endsWith('/') || /\.[a-z0-9]+$/i.test(source) ? source : `${source}/`);
  for (const r of current.redirects ?? []) {
    if (!r.has?.some((h) => h.type === 'host' && h.value === guide.domain)) continue;
    const source = r.source.replace(/\{\/\}\?$/, '');
    if (/[:(*]/.test(source) || source === '/') continue;
    const path = ruleAddress(source);
    add(path, 'vercel.json (a rule today)', source.match(/^\/(events|places|articles)\//)?.[1] ?? 'page');
    const row = rows.get(path)!;
    const to = r.destination.replace(new RegExp(`^https://(?:www\\.)?${guide.domain.replace(/\./g, '\\.')}`), '');
    // A listing the guide sent to its events list or directory gets no decision from that: the series or a person answers (scripts/migration/guide-map.ts).
    const generic = /^\/(events|directory)\/$/.test(to) && /^\/(events|places|articles)\/[^/]+\/$/.test(path);
    if (!row.decision && !generic) row.decision = to;
    if (!row.note) row.note = `the guide's own rule sends it to ${r.destination}`;
  }
  for (const sha of git('log', '--format=%H', '--', 'vercel.json').split('\n').filter(Boolean)) {
    try {
      const v = JSON.parse(git('show', `${sha}:vercel.json`)) as { redirects?: Array<{ source: string; has?: Array<{ type: string; value?: string }> }> };
      for (const r of v.redirects ?? []) {
        if (!r.has?.some((h) => h.type === 'host' && h.value === guide.domain)) continue;
        const source = r.source.replace(/\{\/\}\?$/, '');
        if (/[:(*]/.test(source) || source === '/') continue;
        add(ruleAddress(source), 'vercel.json', source.match(/^\/(events|places|articles)\//)?.[1] ?? 'page');
      }
    } catch {
      /* not JSON at that commit */
    }
  }

  // 4. The printed cards.
  for (const path of QR_CARDS[slug] ?? []) add(path, 'qr-card', 'page');

  // 5. An annual event's address, dated or not (data/hub/fold-events.json,
  // reviewed by hand): its tradition page on the hub, whatever the guide's
  // own rule or an earlier default said, so the row reads as the map answers.
  for (const [path, to] of Object.entries(movedEventPaths(guide))) {
    const row = rows.get(path);
    if (!row) continue;
    row.decision = `https://${hub.domain}${to}`;
    row.note = 'an annual event: its tradition page on the hub (data/hub/fold-events.json)';
  }

  // --decide: what the rules leave, with the default decision and its reason.
  let undecided: HistoryRow[] = [];
  if (decide) {
    if (!out || !existsSync(join(out, 'sitemap-0.xml'))) throw new Error(`--decide needs --out=<the guide's section build> (HUB_SECTION=1), e.g. .sections/${slug}`);
    const list = [...rows.values()];
    const occurrences = readOccurrences(slug);
    const live = new Set(occurrences.map((o) => o.slug));
    const dated = (p: string) => p.match(/(\d{4})-(\d{2})-(\d{2})\/$/);
    const withHistory = guideMap({ guide, out, hubDomain: hub.domain, now: new Date(), root: process.cwd(), history: list });
    for (const row of withHistory.unmapped) {
      const r = rows.get(row.old_path)!;
      if (r.decision) continue;
      const d = dated(r.old_path);
      const day = d ? `${d[1]}-${d[2]}-${d[3]}` : undefined;
      if (r.kind === 'events' && /\.ics$/.test(r.old_path)) {
        r.decision = 'gone';
        r.note = r.note || 'the calendar file of a listing no longer on the guide';
      } else if (r.kind === 'events' && r.source.includes('retired.json') && r.note.startsWith('ledger: retired')) {
        // Taken off the guide on purpose before its date (retired.json, no successor): its series ended there.
        r.decision = 'gone';
        r.note = `retired from the guide before its date${day ? ` (${day})` : ''}, with no later date of its series; ${r.note}`;
      } else if (r.kind === 'events' && guide.lead === 'updates') {
        // A quiet guide (Niwot) has built no event page since 12 November 2026: the address has had no page since, and none stands for it.
        r.decision = 'gone';
        r.note = r.note || `${guide.siteTitle} lists no events since 12 November 2026 (updates only); the address has had no page since, and none stands for it`;
      } else if (r.kind === 'events' && (day ? day < today : !live.has(r.old_path.split('/')[2]!))) {
        r.decision = 'gone';
        r.note = r.note || (day ? `one-time event on ${day}, passed; no later date of its series is listed` : 'a one-time event no longer listed, and no later date of its series');
      } else if ((r.kind === 'places' || r.kind === 'articles') && !existsSync(`content/${slug}/${r.kind}/${r.old_path.split('/')[2]}.md`)) {
        r.decision = 'gone';
        r.note = r.note || `${r.kind === 'places' ? 'listing' : 'article'} removed from the guide (${r.source.split(';')[0]}), and no page stands for it`;
      } else undecided.push(r);
    }
  }

  const sorted = [...rows.values()].sort((a, b) => a.old_path.localeCompare(b.old_path));
  writeFileSync(file, ['old_path,source,kind,key,decision,note', ...sorted.map((r) => csvLine([r.old_path, r.source, r.kind, r.key, r.decision, r.note]))].join('\n') + '\n');
  const gone = sorted.filter((r) => r.decision === 'gone').length;
  console.log(`${guide.domain}: ${sorted.length} addresses (${sorted.filter((r) => r.source.startsWith('git')).length} from git, ${sorted.filter((r) => r.source.includes('sitemap')).length} in a sitemap, ${sorted.filter((r) => r.source.includes('vercel.json')).length} in vercel.json)${decide ? `; ${gone} gone, ${undecided.length} for a person` : ''}`);
  for (const r of undecided.slice(0, 40)) console.log(`  ?  ${r.old_path}  (${r.kind}; ${r.source})`);
}
