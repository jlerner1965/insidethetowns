#!/usr/bin/env node
/**
 * Reads a town's development map again and says what moved.
 *
 *   npm run recheck-development                       # every town with a snapshot, report only
 *   npm run recheck-development -- --town=berthoud    # one town
 *   npm run recheck-development -- --write            # keep the new read as the snapshot
 *   npm run recheck-development -- --write --report=/tmp/development.md
 *
 * Each town with a tracker keeps data/<town>/development.json: where the
 * Town's layer is, which article is written from it, and the rows as they
 * stood at the last read. This fetches the layer (robots.txt honoured, the
 * guide's honest identification), compares, and writes the report that the
 * nightly re-check (.github/workflows/recheck-events.yml) puts in its pull
 * request. With --write the snapshot becomes the new read, so the pull
 * request carries the diff and the report in one place.
 *
 * It never touches the article. A changed row is a person's to write up:
 * the Town's record says a plat was approved, not what to say about it.
 * A layer that cannot be read is reported, never guessed at, and the
 * snapshot is left as it was.
 */
import { execFile } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import { allTowns } from '../src/config/index.ts';
import { dayKey } from '../src/lib/dates.ts';
import { diffProjects, formatReport, toProject, type Snapshot } from './lib/development.ts';
import { robotsFor, TIMEOUT, UA } from './lib/probe.ts';
import { isAllowed } from './lib/robots.ts';

const run = promisify(execFile);
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dataDir = join(root, 'data');

const args = process.argv.slice(2);
const opt = (name: string) => args.find((a) => a.startsWith(`--${name}=`))?.split('=').slice(1).join('=');
const onlyTown = opt('town');
const write = args.includes('--write');
const reportPath = opt('report');

async function getJson(url: string): Promise<unknown> {
  const { origin, pathname, search } = new URL(url);
  if (!isAllowed(await robotsFor(origin), pathname + search)) throw new Error(`robots.txt at ${origin} asks us to stay out`);
  const { stdout } = await run('curl', ['-sS', '-L', '--max-time', String(TIMEOUT), '-A', UA, '-H', 'Accept: application/json', url], { maxBuffer: 16 << 20 });
  return JSON.parse(stdout);
}

/** ArcGIS gives epoch milliseconds; the snapshot keeps a Denver day. */
const dayOf = (ms: unknown): string => (typeof ms === 'number' && ms > 0 ? dayKey(new Date(ms)) : '');

async function readLayer(layer: string): Promise<{ townEdited: string; attrs: Record<string, unknown>[] }> {
  const meta = (await getJson(`${layer}?f=json`)) as { editingInfo?: { dataLastEditDate?: number }; error?: { message?: string } };
  if (meta.error) throw new Error(meta.error.message ?? 'the layer answered with an error');
  const attrs: Record<string, unknown>[] = [];
  for (let offset = 0; ; offset += 1000) {
    const page = (await getJson(`${layer}/query?where=1%3D1&outFields=*&returnGeometry=false&resultOffset=${offset}&resultRecordCount=1000&f=json`)) as {
      features?: { attributes: Record<string, unknown> }[];
      exceededTransferLimit?: boolean;
      error?: { message?: string };
    };
    if (page.error) throw new Error(page.error.message ?? 'the query answered with an error');
    for (const f of page.features ?? []) attrs.push(f.attributes);
    if (!page.exceededTransferLimit) break;
  }
  return { townEdited: dayOf(meta.editingInfo?.dataLastEditDate), attrs };
}

const towns = readdirSync(dataDir).filter((slug) => existsSync(join(dataDir, slug, 'development.json')) && (!onlyTown || slug === onlyTown));
const lines: string[] = [];
let failed = 0;

for (const slug of towns) {
  const file = join(dataDir, slug, 'development.json');
  const prev = JSON.parse(readFileSync(file, 'utf8')) as Snapshot;
  const townName = allTowns.find((t) => t.slug === slug)?.name ?? slug;
  try {
    const { townEdited, attrs } = await readLayer(prev.source.layer);
    const projects = attrs.map(toProject).sort((a, b) => a.name.localeCompare(b.name) || a.id.localeCompare(b.id));
    const next: Snapshot = { ...prev, read: dayKey(new Date()), townEdited: townEdited || prev.townEdited, projects };
    const diff = diffProjects(prev.projects, next.projects);
    lines.push(formatReport(prev, next, diff, townName));
    if (write) writeFileSync(file, JSON.stringify(next, null, 2) + '\n');
  } catch (err) {
    failed++;
    lines.push(`## ${townName}: the Town's development map\n\nCould not be read today (${err instanceof Error ? err.message : String(err)}). The snapshot from ${prev.read} stands and is read again tomorrow; \`${prev.article}\` is not out of date for this.\n`);
  }
}

if (!towns.length) lines.push(`No town keeps a development snapshot${onlyTown ? ` named ${onlyTown}` : ''} (data/<town>/development.json).\n`);
const report = lines.join('\n');
if (reportPath) writeFileSync(reportPath, report);
console.log(report);
process.exitCode = failed ? 1 : 0;
