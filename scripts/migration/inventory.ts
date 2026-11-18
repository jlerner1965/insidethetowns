#!/usr/bin/env node
/**
 * The old URL inventory of every folded guide's domain (the move of 18
 * November 2026, step 1): every address each domain served before the
 * restructure, for docs/migration/redirect-map.csv to give a destination.
 *
 *   node scripts/migration/inventory.ts --old=<folder of pre-restructure builds>
 *
 * The folder holds one built site per config slug (`<folder>/<slug>/`),
 * built from the last pre-restructure commit (7141d032, 11 November 2026)
 * in a separate worktree. From each: every page and file it served, its
 * sitemap's addresses, and every redirect stub (a meta-refresh page) with
 * its target. From git history: every listing deleted before that commit,
 * the retired.json ledger at it, and, for a guide retired before the
 * restructure (no build at that commit), the listings at the last commit
 * that held its content. And the page-by-page decisions
 * (docs/migration/decisions/<town>.csv), whose paths were read from the same
 * history. docs/migration/search-pages.csv, where it exists, adds the
 * addresses search data named.
 *
 * Writes docs/migration/inventory/<host>.csv (old_path, source, note) and
 * copies each built sitemap to data/migration/sitemaps/<host>/ for
 * api/legacy.ts to go on serving.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync, copyFileSync } from 'node:fs';
import { join } from 'node:path';
import { allTowns } from '../../src/config/index.ts';
import { FOLDED, csvLine, readCsv } from './shared.ts';

const args = process.argv.slice(2);
const old = args.find((a) => a.startsWith('--old='))?.slice(6);
if (!old) throw new Error('--old=<folder of pre-restructure builds> is required');

const walk = (dir: string, out: string[] = []): string[] => {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
};
const git = (...a: string[]) => execFileSync('git', a, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });

const SKIP = /^\/(?:_astro|favicons|pagefind)\/|^\/(?:_headers|_redirects|404\.html|favicon\.ico|apple-touch-icon\.png|[0-9a-f]{32}\.txt)$/;

for (const town of allTowns.filter((t) => t.hubPage && FOLDED[t.domain])) {
  const { commit } = FOLDED[town.domain]!;
  const rows = new Map<string, { source: string; note: string }>();
  const add = (path: string, source: string, note = '') => {
    if (!path.startsWith('/') || SKIP.test(path)) return;
    const prior = rows.get(path);
    if (!prior || prior.source === 'decisions' || prior.source === 'history') rows.set(path, { source, note: note || prior?.note || '' });
  };
  // 1. The build at the pre-restructure commit, where the guide was still live.
  const dir = join(old, town.slug);
  if (existsSync(join(dir, 'sitemap-0.xml'))) {
    for (const file of walk(dir)) {
      const rel = `/${file.slice(dir.length + 1).split('\\').join('/')}`;
      if (SKIP.test(rel)) continue;
      if (rel.endsWith('/index.html')) {
        const html = readFileSync(file, 'utf8');
        const stub = html.match(/http-equiv="refresh" content="0;url=([^"]+)"/);
        const path = rel.slice(0, -'index.html'.length);
        if (stub) add(path, 'stub', stub[1]!);
        else add(path, 'build');
      } else add(rel, 'file');
    }
    for (const loc of readFileSync(join(dir, 'sitemap-0.xml'), 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)) {
      const path = new URL(loc[1]!).pathname;
      if (!rows.has(path)) add(path, 'sitemap');
      else rows.get(path)!.note = rows.get(path)!.note || 'in the sitemap';
    }
    const to = join('data/migration/sitemaps', town.domain);
    mkdirSync(to, { recursive: true });
    copyFileSync(join(dir, 'sitemap-0.xml'), join(to, 'sitemap-0.xml'));
    copyFileSync(join(dir, 'sitemap-index.xml'), join(to, 'sitemap-index.xml'));
  } else {
    // A guide retired before the restructure: its last content, from history.
    for (const kind of ['events', 'places', 'articles'] as const) {
      const files = git('ls-tree', '-r', '--name-only', commit, `content/${town.slug}/${kind}/`).split('\n').filter((f) => f.endsWith('.md') && !/\/_/.test(f));
      for (const f of files) add(`/${kind}/${f.split('/').pop()!.replace(/\.md$/, '')}/`, 'history', `at ${commit}`);
    }
    for (const path of FOLDED[town.domain]!.fixedPages ?? []) add(path, 'routes', `a page every guide had, at ${commit}`);
  }
  // 2. Listings gone before that commit: deleted files, and the ledger of retired slugs.
  for (const kind of ['events', 'places', 'articles'] as const) {
    const deleted = git('log', '--diff-filter=D', '--name-only', '--format=', commit, '--', `content/${town.slug}/${kind}/`).split('\n').filter((f) => f.endsWith('.md') && !/\/_/.test(f) && !/\/staging\//.test(f));
    for (const f of new Set(deleted)) add(`/${kind}/${f.split('/').pop()!.replace(/\.md$/, '')}/`, 'history', 'deleted before the restructure');
  }
  try {
    const ledger = JSON.parse(git('show', `${commit}:content/${town.slug}/retired.json`)) as Record<string, Record<string, string | null>>;
    for (const [kind, entries] of Object.entries(ledger)) for (const slug of Object.keys(entries)) add(`/${kind}/${slug}/`, 'retired', 'in retired.json');
  } catch {
    /* no ledger */
  }
  // 3. The page-by-page decisions, read from the same history.
  const decisions = `docs/migration/decisions/${town.slug}.csv`;
  if (existsSync(decisions)) for (const r of readCsv(decisions)) add(r.old_path!, 'decisions');
  // 4. Search data, where a file of it exists.
  if (existsSync('docs/migration/search-pages.csv')) {
    for (const r of readCsv('docs/migration/search-pages.csv')) {
      const url = r.url ?? r.page ?? r.old_url;
      if (!url) continue;
      try {
        const u = new URL(url);
        if (u.hostname.replace(/^www\./, '') === town.domain) add(u.pathname, 'search-pages');
      } catch {
        /* not a URL */
      }
    }
  }
  const out = [...rows.entries()].sort(([a], [b]) => a.localeCompare(b));
  mkdirSync('docs/migration/inventory', { recursive: true });
  writeFileSync(`docs/migration/inventory/${town.domain}.csv`, ['old_path,source,note', ...out.map(([path, r]) => csvLine([path, r.source, r.note]))].join('\n') + '\n');
  console.log(`${town.domain}: ${out.length} addresses`);
}
