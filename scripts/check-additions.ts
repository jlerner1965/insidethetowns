/**
 * Checks tradition records and town profiles one file at a time, against
 * the same schemas the build and `npm run validate` use:
 *
 *   node scripts/check-additions.ts content/hub/traditions/vail-oktoberfest.md data/hub/towns/vail.json
 *
 * With no arguments it checks every profile in data/hub/towns/. Exits 1 on
 * any problem, naming the file and the field.
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { basename, join } from 'node:path';
import { traditionSchema } from '../src/content/schemas.ts';
import { findHubTown } from '../src/config/hub-towns.ts';
import { placeKey } from '../src/lib/hub-towns.ts';
import { townProfileSchema } from '../src/lib/town-profile.ts';
import { parseFrontmatter } from './lib/frontmatter.ts';

const PROFILES = 'data/hub/towns';
const files = process.argv.slice(2);
if (files.length === 0 && existsSync(PROFILES)) files.push(...readdirSync(PROFILES).filter((f) => f.endsWith('.json')).map((f) => join(PROFILES, f)));

let bad = 0;
const fail = (file: string, message: string) => {
  bad++;
  console.error(`${file}: ${message}`);
};
const known = (slug: string) => !!placeKey(slug);

for (const file of files) {
  if (!existsSync(file)) {
    fail(file, 'no such file');
    continue;
  }
  const text = readFileSync(file, 'utf8');
  if (file.endsWith('.json')) {
    let data: unknown;
    try {
      data = JSON.parse(text);
    } catch (e) {
      fail(file, `not JSON: ${(e as Error).message}`);
      continue;
    }
    const parsed = townProfileSchema.safeParse(data);
    if (!parsed.success) {
      for (const i of parsed.error.issues) fail(file, `${i.path.join('.') || '(root)'}: ${i.message}`);
      continue;
    }
    if (parsed.data.slug !== basename(file, '.json')) fail(file, `slug "${parsed.data.slug}" is not the file's name`);
    if (!findHubTown(parsed.data.slug)) fail(file, `"${parsed.data.slug}" is not a town in src/config/hub-towns.ts`);
    continue;
  }
  let data: Record<string, unknown>;
  try {
    data = parseFrontmatter(text).data as Record<string, unknown>;
  } catch (e) {
    fail(file, `front matter: ${(e as Error).message}`);
    continue;
  }
  const parsed = traditionSchema().safeParse(data);
  if (!parsed.success) {
    for (const i of parsed.error.issues) fail(file, `${i.path.join('.') || '(root)'}: ${i.message}`);
    continue;
  }
  const r = parsed.data;
  if (r.slug !== basename(file, '.md')) fail(file, `slug "${r.slug}" is not the file's name`);
  if (r.town?.guide && !known(r.town.guide)) fail(file, `town.guide "${r.town.guide}" is not a hub town or a standalone guide`);
  for (const t of r.towns ?? []) if (!known(t.slug)) fail(file, `towns: "${t.slug}" is not a hub town or a standalone guide`);
}
if (bad > 0) process.exit(1);
console.log(`check-additions: ${files.length} file${files.length === 1 ? '' : 's'} checked, no problems`);
