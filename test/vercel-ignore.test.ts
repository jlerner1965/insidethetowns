/**
 * scripts/vercel-ignore.sh decides, for every Vercel project on every push,
 * whether that site builds. A wrong "skip" leaves a site serving stale pages
 * until the nightly rebuild; a wrong "build" only costs minutes. These pin
 * the skips to the cases that are safe and everything else to a build.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const script = resolve(dirname(fileURLToPath(import.meta.url)), '../scripts/vercel-ignore.sh');

const repo = mkdtempSync(join(tmpdir(), 'vercel-ignore-'));
const git = (...args: string[]) => {
  const r = spawnSync('git', args, { cwd: repo, encoding: 'utf8' });
  assert.equal(r.status, 0, r.stderr);
  return r.stdout.trim();
};
let clock = 1_790_000_000;
/** Commits the given files, each a second after the last, and returns the SHA. */
const commit = (files: Record<string, string>) => {
  for (const [path, text] of Object.entries(files)) {
    mkdirSync(dirname(join(repo, path)), { recursive: true });
    writeFileSync(join(repo, path), text);
  }
  clock += 1;
  git('add', '-A');
  const date = `@${clock} +0000`;
  spawnSync('git', ['commit', '-q', '-m', 'x'], {
    cwd: repo,
    env: { ...process.env, GIT_AUTHOR_DATE: date, GIT_COMMITTER_DATE: date },
  });
  return git('rev-parse', 'HEAD');
};

git('init', '-q');
git('config', 'user.email', 'test@example.com');
git('config', 'user.name', 'test');
const base = commit({
  'content/niwot/events/a.md': 'a',
  'content/lyons/events/b.md': 'b',
  'content/hub/pages/c.md': 'c',
  'src/config/towns/niwot.ts': 'n',
  'src/config/towns/lyons.ts': 'l',
  'src/config/towns/registry.ts': 'r',
  'src/lib/dates.ts': 'd',
  'IMAGE_LICENSES.csv': 'path,source_url,license,credit_required (y/n),town\ncontent/niwot/images/x.jpg,s,CC0,n,niwot\n',
  'README.md': 'r',
});

/** Runs the script for `slug` as Vercel would, `ageSeconds` after the commit was made. */
const decide = (slug: string, head: string, prev: string | undefined, ageSeconds = 60) => {
  const made = Number(git('log', '-1', '--format=%ct', head));
  const env: NodeJS.ProcessEnv = { ...process.env, VERCEL_GIT_COMMIT_SHA: head, IGNORE_STEP_NOW: String(made + ageSeconds) };
  delete env.VERCEL_GIT_PREVIOUS_SHA;
  delete env.TOWN;
  if (prev) env.VERCEL_GIT_PREVIOUS_SHA = prev;
  const r = spawnSync('bash', [script, slug], { cwd: repo, env, encoding: 'utf8' });
  assert.ok(r.status === 0 || r.status === 1, `unexpected exit ${r.status}: ${r.stderr}`);
  return r.status === 1 ? 'build' : 'skip';
};

test("a town builds for its own content and skips another town's", () => {
  const event = commit({ 'content/niwot/events/a.md': 'a2' });
  assert.equal(decide('niwot', event, base), 'build');
  assert.equal(decide('lyons', event, base), 'skip');
  assert.equal(decide('hub', event, base), 'skip');
});

test("any town's config builds every site", () => {
  // A town goes live by changing its config, and the hub's count of guides,
  // every footer's sister guides and the neighbours' blocks all read it. When
  // only the town itself rebuilt, the hub said "9 guides" after the tenth.
  const prev = git('rev-parse', 'HEAD');
  const config = commit({ 'src/config/towns/niwot.ts': String(clock) });
  for (const slug of ['niwot', 'lyons', 'hub']) assert.equal(decide(slug, config, prev), 'build', slug);
});

test('shared code builds every site, including the hub', () => {
  const head = commit({ 'src/lib/dates.ts': 'd2' });
  for (const slug of ['hub', 'niwot', 'lyons']) assert.equal(decide(slug, head, git('rev-parse', 'HEAD^')), 'build');
  const registry = commit({ 'src/config/towns/registry.ts': 'r2' });
  assert.equal(decide('lyons', registry, head), 'build');
  for (const path of ['package-lock.json', 'astro.config.mjs', 'vercel.json', 'public/favicons/x.svg', 'scripts/run.ts']) {
    const prev = git('rev-parse', 'HEAD');
    assert.equal(decide('lyons', commit({ [path]: String(clock) }), prev), 'build', path);
  }
});

test('docs, tests and offline scripts build nothing', () => {
  const prev = git('rev-parse', 'HEAD');
  const head = commit({ 'README.md': 'r2', 'docs/x.md': 'x', 'test/x.test.ts': 'x', 'scripts/weekly.ts': 'w', '.github/workflows/ci.yml': 'c' });
  for (const slug of ['hub', 'niwot', 'lyons']) assert.equal(decide(slug, head, prev), 'skip');
});

test("a licence row builds only the town whose photo it is", () => {
  const prev = git('rev-parse', 'HEAD');
  const head = commit({
    'IMAGE_LICENSES.csv':
      'path,source_url,license,credit_required (y/n),town\ncontent/niwot/images/x.jpg,s,CC0,n,niwot\ncontent/niwot/images/y.jpg,s,CC0,n,niwot\n',
  });
  assert.equal(decide('niwot', head, prev), 'build');
  assert.equal(decide('lyons', head, prev), 'skip');
});

test('the diff runs from the last deployment, so a skipped push is not lost', () => {
  const lyonsLast = git('rev-parse', 'HEAD');
  commit({ 'content/lyons/events/b.md': 'b2' }); // lyons builds this one...
  const later = commit({ 'content/niwot/events/a.md': 'a3' }); // ...but say its build failed
  assert.equal(decide('lyons', later, lyonsLast), 'build');
});

test('rebuilds always build: a deploy hook, a redeploy, an old tip, no history', () => {
  const head = commit({ 'docs/y.md': 'y' });
  const prev = git('rev-parse', 'HEAD^');
  assert.equal(decide('lyons', head, prev), 'skip'); // the push itself
  assert.equal(decide('lyons', head, prev, 31 * 60), 'build'); // the nightly hook, later
  assert.equal(decide('lyons', head, head), 'build'); // a redeploy of what is live
  assert.equal(decide('lyons', head, undefined), 'build'); // a project's first deployment
  assert.equal(decide('lyons', head, 'f'.repeat(40)), 'build'); // a deployment it cannot see
  assert.equal(decide('', head, prev), 'build'); // no site named
});

test.after(() => rmSync(repo, { recursive: true, force: true }));
