/**
 * Reads draft records (docs/agent/dates/verified/, docs/agent/traditions/)
 * against the tradition schema and the place registry, and prints what a
 * move into content/hub/traditions/ would be refused for. Reads only.
 *
 *   node scripts/check-drafts.ts docs/agent/dates/verified
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { traditionSchema } from '../src/content/schemas.ts';
import { parseFrontmatter } from './lib/frontmatter.ts';
import { placeKey } from '../src/lib/hub-towns.ts';

const dir = process.argv[2] ?? 'docs/agent/dates/verified';
const schema = traditionSchema();
let bad = 0;
const weekday = (d: string) => new Date(`${d}T12:00:00Z`).toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' });
for (const f of readdirSync(dir).filter((f) => f.endsWith('.md') && !f.startsWith('_')).sort()) {
  const issues: string[] = [];
  let data: Record<string, unknown> = {};
  try {
    data = parseFrontmatter(readFileSync(join(dir, f), 'utf8')).data;
  } catch (e) {
    issues.push(`unreadable: ${(e as Error).message}`);
  }
  const r = schema.safeParse(data);
  if (!r.success) issues.push(...r.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`));
  else {
    const rec = r.data;
    if (`${rec.slug}.md` !== f) issues.push(`file name is not the slug ${rec.slug}`);
    if (rec.town?.guide && !placeKey(rec.town.guide)) issues.push(`unknown town.guide ${rec.town.guide}`);
    for (const t of rec.towns ?? []) if (!placeKey(t.slug)) issues.push(`unknown towns slug ${t.slug}`);
    const y = rec.years[0]!;
    if (process.argv.includes('--list')) console.log(`${(rec.town?.guide ?? (rec.statewide ? 'STATEWIDE' : 'shared')).padEnd(18)} ${rec.type.padEnd(16)} ${rec.slug.padEnd(48)} ${y.year} ${y.status}${y.date ? ` ${weekday(y.date)} ${y.date}` : ''}${y.endDate ? `..${y.endDate}` : ''}`);
  }
  if (issues.length) {
    bad++;
    console.log(`${f}\n  ${issues.join('\n  ')}`);
  }
}
console.log(`${bad} with issues`);
