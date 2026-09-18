#!/usr/bin/env node
/**
 * The weekly update path: turn a CSV of events into markdown files.
 *
 *   npm run import-events -- path/to/events.csv            # write files
 *   npm run import-events -- path/to/events.csv --dry-run  # show what would be written
 *   npm run import-events -- path/to/events.csv --force    # overwrite existing files
 *
 * Required columns: title, start, end, venue, url, category, town
 *   (end and url may be empty). Optional columns: address, cost, description,
 *   source, repeat, until, recurring, allDay, timeNote, verified, slug, image, imageAlt, featured.
 * Dates are Denver wall-clock: "2026-10-03T10:00" or "2026-10-03".
 * `source` defaults to `url`; `verified` defaults to today. Each row is checked
 * against the event schema before anything is written, and a row whose file
 * already exists is skipped unless --force is given.
 * A template lives at scripts/templates/events-template.csv.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'astro/zod';
import { eventSchema } from '../src/content/schemas.ts';
import { dayKey } from '../src/lib/dates.ts';
import { allTowns } from '../src/config/index.ts';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const csvPath = args.find((a) => !a.startsWith('--'));
const dryRun = args.includes('--dry-run');
const force = args.includes('--force');

if (!csvPath) {
  console.error('Usage: npm run import-events -- <file.csv> [--dry-run] [--force]');
  process.exit(2);
}

/** RFC 4180-ish CSV: quoted fields, doubled quotes, CRLF or LF, embedded newlines inside quotes. */
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]!;
    if (quoted) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else quoted = false;
      } else field += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ',') {
      row.push(field);
      field = '';
    } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else field += ch;
  }
  if (field !== '' || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => r.some((c) => c.trim() !== ''));
}

const REQUIRED = ['title', 'start', 'end', 'venue', 'url', 'category', 'town'];
const OPTIONAL = ['address', 'cost', 'description', 'source', 'repeat', 'until', 'recurring', 'allDay', 'timeNote', 'verified', 'slug', 'image', 'imageAlt', 'featured'];
const BOOL = new Set(['allDay', 'featured']);

function slugify(text: string): string {
  return text
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
    .replace(/-+$/g, '');
}

function yamlString(value: string): string {
  return `"${value.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n')}"`;
}

const rows = parseCsv(readFileSync(resolve(csvPath), 'utf8'));
const header = (rows.shift() ?? []).map((h) => h.trim());
const missing = REQUIRED.filter((c) => !header.includes(c));
if (missing.length) {
  console.error(`CSV is missing required column(s): ${missing.join(', ')}. Header must include: ${REQUIRED.join(', ')}`);
  process.exit(2);
}
const unknown = header.filter((h) => h && !REQUIRED.includes(h) && !OPTIONAL.includes(h));
if (unknown.length) console.warn(`warn  ignoring unknown column(s): ${unknown.join(', ')}`);

const townSlugs = new Set(allTowns.map((t) => t.slug));
const today = dayKey(new Date());
const schema = eventSchema(() => z.string());

type Planned = { file: string; content: string; exists: boolean };
const planned: Planned[] = [];
const errors: string[] = [];

rows.forEach((cells, index) => {
  const line = index + 2;
  const rec: Record<string, string> = {};
  header.forEach((h, i) => {
    if (h) rec[h] = (cells[i] ?? '').trim();
  });
  const town = rec.town ?? '';
  if (!townSlugs.has(town)) {
    errors.push(`row ${line}: unknown town "${town}" (known: ${[...townSlugs].join(', ')})`);
    return;
  }
  const fm: Record<string, unknown> = { title: rec.title, start: rec.start, venue: rec.venue, category: rec.category };
  if (rec.end) fm.end = rec.end;
  if (rec.url) fm.url = rec.url;
  for (const key of OPTIONAL) {
    if (key === 'slug' || key === 'description') continue;
    const v = rec[key];
    if (v === undefined || v === '') continue;
    fm[key] = BOOL.has(key) ? /^(true|yes|y|1)$/i.test(v) : v;
  }
  if (!fm.source && rec.url) fm.source = rec.url;
  if (!fm.verified) fm.verified = today;

  const result = schema.safeParse(fm);
  if (!result.success) {
    for (const issue of result.error.issues) {
      errors.push(`row ${line} (${rec.title || 'untitled'}): ${issue.path.join('.') || '(root)'}: ${issue.message}`);
    }
    return;
  }
  const startDay = String(rec.start).slice(0, 10);
  const slug = rec.slug ? slugify(rec.slug) : `${slugify(rec.title ?? '')}-${startDay}`;
  if (!slug || slug === `-${startDay}`) {
    errors.push(`row ${line}: cannot derive a slug from the title`);
    return;
  }
  const order = ['title', 'start', 'end', 'allDay', 'repeat', 'until', 'venue', 'address', 'url', 'cost', 'category', 'image', 'imageAlt', 'recurring', 'timeNote', 'featured', 'source', 'verified'];
  const lines = ['---'];
  for (const key of order) {
    const v = fm[key];
    if (v === undefined || v === '' || v === false) continue;
    lines.push(typeof v === 'boolean' ? `${key}: ${v}` : key === 'category' || key === 'repeat' ? `${key}: ${v}` : key === 'image' ? `${key}: ${v}` : `${key}: ${yamlString(String(v))}`);
  }
  lines.push('---', '', (rec.description ?? '').trim() || `${rec.title} at ${rec.venue}.`, '');
  const file = join(root, 'content', town, 'events', `${slug}.md`);
  planned.push({ file, content: lines.join('\n'), exists: existsSync(file) });
});

if (errors.length) {
  for (const e of errors) console.error(`error ${e}`);
  console.error(`\nimport-events: ${errors.length} error(s); nothing written.`);
  process.exit(1);
}

let written = 0;
let skipped = 0;
for (const p of planned) {
  const rel = relative(root, p.file);
  if (p.exists && !force) {
    console.log(`skip   ${rel} (exists; use --force to overwrite)`);
    skipped++;
    continue;
  }
  if (dryRun) {
    console.log(`would ${p.exists ? 'overwrite' : 'write'} ${rel}\n${p.content.split('\n').map((l) => '    ' + l).join('\n')}`);
  } else {
    mkdirSync(dirname(p.file), { recursive: true });
    writeFileSync(p.file, p.content);
    console.log(`${p.exists ? 'update' : 'write '} ${rel}`);
  }
  written++;
}
console.log(`\nimport-events: ${written} file(s) ${dryRun ? 'would be ' : ''}written, ${skipped} skipped. Run "npm run validate" and commit.`);
