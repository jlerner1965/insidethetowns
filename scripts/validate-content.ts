#!/usr/bin/env node
/**
 * Validates every file under content/<town>/ against the collection schemas.
 * Fails (exit 1) when required frontmatter is missing, an image path does not
 * exist, or a date will not parse. Warns about events that are already past
 * so they can be pruned, and about towns without a config file.
 *
 *   npm run validate
 *
 * Runs automatically before every `npm run build`.
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'astro/zod';
import { COLLECTIONS, schemaFor, type CollectionName } from '../src/content/schemas.ts';
import { liveTowns } from '../src/config/index.ts';
// Imported directly, not via getHub(): the validator runs without TOWN set.
import { hub } from '../src/config/towns/hub.ts';
import { parseFrontmatter } from './lib/frontmatter.ts';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const contentDir = join(root, 'content');
const townsDir = join(root, 'src/config/towns');

const errors: string[] = [];
const warnings: string[] = [];
let checked = 0;

function imageSchemaFor(file: string) {
  return () =>
    z.string().refine((p) => existsSync(resolve(dirname(file), p)), {
      message: 'image file does not exist (paths are relative to the markdown file, e.g. ../images/photo.jpg)',
    });
}

function validateFile(collection: CollectionName, file: string) {
  const rel = relative(root, file);
  let parsed;
  try {
    parsed = parseFrontmatter(readFileSync(file, 'utf8'));
  } catch (err) {
    errors.push(`${rel}: ${(err as Error).message}`);
    return;
  }
  const schema = schemaFor[collection](imageSchemaFor(file));
  const result = schema.safeParse(parsed.data);
  checked++;
  if (!result.success) {
    for (const issue of result.error.issues) {
      const path = issue.path.length ? issue.path.join('.') : '(root)';
      errors.push(`${rel}: ${path}: ${issue.message}`);
    }
    return;
  }
  if (collection !== 'pages' && parsed.body.trim() === '') {
    warnings.push(`${rel}: body is empty`);
  }
  if (collection === 'events') {
    const data = result.data as { start: Date; end?: Date; until?: Date; title: string };
    const end = data.until ?? data.end ?? data.start;
    if (end.getTime() < Date.now() - 86_400_000) {
      warnings.push(`${rel}: event is in the past (${end.toISOString().slice(0, 10)}); it will be hidden. Delete or update it.`);
    }
  }
}

// The hub publishes "People covered" as the sum across every live guide, so a
// live town with no figure does not just leave a gap — it quietly makes the
// headline number wrong. Elizabeth did exactly that: seven guides, six
// populations, a total that was 1,675 short and looked authoritative.
for (const town of liveTowns()) {
  if (!town.population) {
    errors.push(`src/config/towns/${town.slug}.ts: live town has no population; the network total on the hub would undercount`);
  }
}

/**
 * A form posting to a host the CSP does not list is blocked by the browser,
 * silently, on the reader's machine — nothing in the build or the markup says
 * so. The two are coupled, so check them against each other rather than trust
 * anyone to remember.
 */
function checkFormActions() {
  const vercelJson = join(root, 'vercel.json');
  if (!existsSync(vercelJson)) return;
  const csp = readFileSync(vercelJson, 'utf8');
  const directive = /form-action ([^;"]*)/.exec(csp);
  if (!directive) {
    errors.push('vercel.json: Content-Security-Policy has no form-action directive');
    return;
  }
  const allowed = new Set(directive[1].trim().split(/\s+/));
  const posts: { where: string; url: string }[] = [];
  const action = hub.newsletter?.action;
  if (action) posts.push({ where: 'src/config/towns/hub.ts: newsletter.action', url: action });
  for (const town of liveTowns()) {
    if (town.formspreeId) {
      posts.push({
        where: `src/config/towns/${town.slug}.ts: formspreeId`,
        url: `https://formspree.io/f/${town.formspreeId}`,
      });
    }
  }
  for (const { where, url } of posts) {
    let origin;
    try {
      origin = new URL(url).origin;
    } catch {
      errors.push(`${where}: "${url}" is not an absolute URL`);
      continue;
    }
    if (!allowed.has(origin)) {
      errors.push(
        `${where} posts to ${origin}, which the CSP would block. ` +
          `Add ${origin} to form-action in vercel.json.`,
      );
    }
  }
}

checkFormActions();

if (!existsSync(contentDir)) {
  errors.push('content/ directory does not exist');
} else {
  for (const town of readdirSync(contentDir)) {
    const townDir = join(contentDir, town);
    if (!statSync(townDir).isDirectory()) continue;
    if (town !== 'hub' && !existsSync(join(townsDir, `${town}.ts`))) {
      warnings.push(`content/${town}/ has no src/config/towns/${town}.ts; its content will never be built`);
    }
    for (const collection of COLLECTIONS) {
      const dir = join(townDir, collection);
      if (!existsSync(dir)) continue;
      for (const name of readdirSync(dir)) {
        if (!name.endsWith('.md') || name.startsWith('_')) continue;
        validateFile(collection, join(dir, name));
      }
    }
  }
}

for (const w of warnings) console.warn(`warn  ${w}`);
for (const e of errors) console.error(`error ${e}`);
console.log(`\nvalidate-content: ${checked} entries checked, ${errors.length} errors, ${warnings.length} warnings`);
if (errors.length > 0) process.exit(1);
