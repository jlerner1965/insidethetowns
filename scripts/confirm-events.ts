#!/usr/bin/env node
/**
 * Records that a person confirmed events with their organizer: a call, an
 * email, a word at the door. What brings back a venue no machine can read
 * (Oskar Blues' page refuses automated requests; the Wayback Bar has none).
 *
 *   npm run confirm -- lyons old-time-jam sunday-serenade --how=phone --with="Oskar Blues"
 *   npm run confirm -- lyons trivia-at-the-wayback-bar --how=phone --with="Wayback Bar" --note="First and third Thursdays, 6 to 9"
 *   npm run confirm -- lyons old-time-jam --how=phone --with="Oskar Blues" --dry-run
 *
 * Each name after the town matches every event file whose name starts with
 * it, published or staged, so one call to a venue covers its series. A staged
 * file is published (moved up to events/, its review block gone): the call
 * answers what it was waiting for. `--on` defaults to today; `--note` keeps
 * what they said, where it adds something.
 *
 * It writes the `confirmed` block and clears a change flag; it never changes
 * a time, a day or a price. If the organizer said something different, edit
 * the file before you push. Then `npm run validate`.
 */
import { existsSync, readdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { CONFIRMATION_METHODS } from '../src/content/schemas.ts';
import { dayKey } from '../src/lib/dates.ts';
import { confirmText, type Confirmation } from './lib/confirm.ts';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const opt = (name: string) => args.find((a) => a.startsWith(`--${name}=`))?.split('=').slice(1).join('=');
const [town, ...prefixes] = args.filter((a) => !a.startsWith('--'));
const how = opt('how') as Confirmation['how'] | undefined;
const who = opt('with');
const dryRun = args.includes('--dry-run');

function fail(message: string): never {
  console.error(message);
  console.error('Usage: npm run confirm -- <town> <file-name-start>... --how=phone|email|in-person --with="Who you spoke to" [--note="What they said"] [--on=YYYY-MM-DD] [--dry-run]');
  process.exit(2);
}

if (!town || !prefixes.length) fail('Name a town and at least one event file (or the start of its name).');
if (!how || !(CONFIRMATION_METHODS as readonly string[]).includes(how)) fail(`--how must be one of ${CONFIRMATION_METHODS.join(', ')}.`);
if (!who) fail('--with says who confirmed it: the venue, or the person and the venue.');
const on = opt('on') ?? dayKey(new Date());
if (!/^\d{4}-\d{2}-\d{2}$/.test(on)) fail('--on is a day, 2026-10-17.');

const confirmation: Confirmation = { how, with: who, on, note: opt('note') };
const dirs = { published: join(root, 'content', town, 'events'), staged: join(root, 'content', town, 'staging', 'events') };
if (!existsSync(dirs.published)) fail(`No events folder for "${town}".`);

const matches: { file: string; staged: boolean }[] = [];
for (const [kind, dir] of Object.entries(dirs)) {
  if (!existsSync(dir)) continue;
  for (const name of readdirSync(dir).sort()) {
    if (name.endsWith('.md') && prefixes.some((p) => name.startsWith(p))) matches.push({ file: join(dir, name), staged: kind === 'staged' });
  }
}
if (!matches.length) fail(`No event file in content/${town}/events or staging/events starts with ${prefixes.map((p) => `"${p}"`).join(' or ')}.`);

for (const { file, staged } of matches) {
  const out = confirmText(readFileSync(file, 'utf8'), confirmation);
  const target = staged ? join(dirs.published, file.split('/').pop()!) : file;
  if (!dryRun) {
    writeFileSync(file, out);
    if (staged) renameSync(file, target);
  }
  console.log(`${dryRun ? 'would confirm' : 'confirmed'}  ${relative(root, target)}${staged ? '  (published from staging)' : ''}`);
}
console.log(
  `\n${matches.length} file${matches.length === 1 ? '' : 's'}: ${how}, ${who}, ${on}.` +
    ' If they gave a different time, day or price, edit the file now. Then npm run validate, commit and push.',
);
