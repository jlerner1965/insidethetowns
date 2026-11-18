#!/usr/bin/env node
/**
 * Records that a person read a place's source (or called) and confirmed it:
 * a verified read dated the day they checked, and every flag for a person
 * cleared (the owner, 18 November 2026). Each place's line on the needs-me
 * list (docs/needs-me.md) gives the command to copy.
 *
 *   npm run confirm-place -- black-hawk/bar-8042 --how=browser
 *   npm run confirm-place -- black-hawk/bar-8042 black-hawk/spa-monarch --how=browser --on=2026-11-20
 *   npm run confirm-place -- castle-rock/lost-coffee --how=phone --note="Hours unchanged, 6 am to 4 pm daily"
 *   npm run confirm-place -- idaho-springs/starbucks-colorado-boulevard --closed --how=phone --note="Closed for good on November 1, 2026, the store says" --source=https://…
 *   npm run confirm-place -- black-hawk/bar-8042 --how=browser --dry-run
 *
 * `--how` is browser (you read the source), phone, email or in-person. `--on`
 * defaults to today (Denver); `--note` keeps what you found, where it adds
 * something. It clears `recheckPending`, `readBlocked`, `closureCheck` and a
 * change flag the nightly re-check raised; it never changes hours, a phone or
 * an address. If what you read differs from the file, edit the file too.
 * With `--closed`, `--note` (what happened and how you know) is required:
 * the place is marked closed, and the next redirect-map rebuild answers its
 * old address with 410. Then `npm run validate`, commit and push.
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { getNetworkHub } from '../src/config/index.ts';
import { dayKey } from '../src/lib/dates.ts';
import { closeByHand, confirmByHand, HAND_METHODS, type HandMethod } from './lib/place-edit.ts';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const opt = (name: string) => args.find((a) => a.startsWith(`--${name}=`))?.split('=').slice(1).join('=');
const places = args.filter((a) => !a.startsWith('--'));
const how = opt('how') as HandMethod | undefined;
const on = opt('on') ?? dayKey(new Date());
const note = opt('note');
const closed = args.includes('--closed');
const dryRun = args.includes('--dry-run');
const by = opt('by') ?? getNetworkHub().editor?.name ?? 'the editor';

function fail(message: string): never {
  console.error(message);
  console.error('Usage: npm run confirm-place -- <town>/<place>... --how=browser|phone|email|in-person [--on=YYYY-MM-DD] [--note="What you found"] [--closed --note="What happened and how you know" --source=URL] [--dry-run]');
  process.exit(2);
}

if (!places.length) fail('Name at least one place as <town>/<place>, as the needs-me list gives it.');
if (!how || !(HAND_METHODS as readonly string[]).includes(how)) fail(`--how must be one of ${HAND_METHODS.join(', ')}.`);
if (!/^\d{4}-\d{2}-\d{2}$/.test(on) || on > dayKey(new Date())) fail('--on is the day you checked, 2026-11-20, and not after today.');
if (closed && !note) fail('--closed needs --note: what happened and how you know.');

for (const place of places) {
  const [town, slug] = place.split('/');
  const file = join(root, 'content', town ?? '', 'places', `${slug ?? ''}.md`);
  if (!town || !slug || !existsSync(file)) fail(`No place file content/${town}/places/${slug}.md.`);
  const text = readFileSync(file, 'utf8');
  const out = closed ? closeByHand(text, { on, how, by, note: note!, source: opt('source') }) : confirmByHand(text, { on, how, by, note });
  if (!dryRun) writeFileSync(file, out);
  console.log(`${dryRun ? 'would mark' : 'marked'} ${closed ? 'closed' : 'confirmed'}  ${relative(root, file)}  (${how}, ${on})`);
}
console.log(`\nThen npm run validate, commit and push; the needs-me list drops ${places.length === 1 ? 'it' : 'them'} on the next nightly run (or npm run needs-me now).`);
