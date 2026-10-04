/**
 * The source registry on disk: content/<town>/sources.json.
 *
 * Plain JSON, hand-editable, read and written here and nowhere else, so the
 * file always comes back in the same shape and order (core first, then by
 * category, then by name), and a `git diff` after a confirmation is one line.
 * Node-only: nothing in the Astro build reads the registry.
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { CORE_CATEGORIES, SOURCE_CATEGORIES, sourceRegistrySchema, type Source, type SourceCategory, type SourceRegistry } from '../content/schemas.ts';

export function registryPath(town: string, contentRoot = 'content'): string {
  return join(contentRoot, town, 'sources.json');
}

/** The registry, or an empty one for a town that has none yet. Throws on a file that does not validate. */
export function readRegistry(town: string, contentRoot = 'content'): SourceRegistry {
  const path = registryPath(town, contentRoot);
  if (!existsSync(path)) return { town, sources: [] };
  const parsed = sourceRegistrySchema.safeParse(JSON.parse(readFileSync(path, 'utf8')));
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => `${i.path.join('.') || '(root)'}: ${i.message}`).join('; ');
    throw new Error(`${path}: ${issues}`);
  }
  return parsed.data;
}

/** Validation issues for a registry file, for the validator to report rather than throw. */
export function registryIssues(town: string, contentRoot = 'content'): string[] {
  const path = registryPath(town, contentRoot);
  if (!existsSync(path)) return [];
  let raw: unknown;
  try {
    raw = JSON.parse(readFileSync(path, 'utf8'));
  } catch (err) {
    return [`not valid JSON: ${(err as Error).message}`];
  }
  const parsed = sourceRegistrySchema.safeParse(raw);
  if (parsed.success) return parsed.data.town === town ? [] : [`town is "${parsed.data.town}", expected "${town}"`];
  return parsed.error.issues.map((i) => `${i.path.join('.') || '(root)'}: ${i.message}`);
}

export function writeRegistry(registry: SourceRegistry, contentRoot = 'content'): void {
  const sources = [...registry.sources].sort(bySeniority);
  const out: SourceRegistry = { town: registry.town, sources: sources.map(serializable) };
  writeFileSync(registryPath(registry.town, contentRoot), `${JSON.stringify(out, null, 2)}\n`);
}

/** Dates back to "YYYY-MM-DD", and the defaults left out so the file stays short. */
function serializable(s: Source): Source {
  const copy: Record<string, unknown> = { ...s };
  if (s.lastChecked) copy.lastChecked = dayString(s.lastChecked);
  if (s.priority === 'other') delete copy.priority;
  if (s.checkFrequency === 'weekly') delete copy.checkFrequency;
  for (const k of Object.keys(copy)) if (copy[k] === undefined) delete copy[k];
  return copy as unknown as Source;
}

function dayString(d: Date): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Denver', year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);
}

/** Core before other, then in category order, then by name: the order the editor reads them in. */
export function bySeniority(a: Source, b: Source): number {
  return (
    Number(b.priority === 'core') - Number(a.priority === 'core') ||
    SOURCE_CATEGORIES.indexOf(a.category) - SOURCE_CATEGORIES.indexOf(b.category) ||
    a.name.localeCompare(b.name)
  );
}

/**
 * A guess at what a host is, from its name alone, for seeding. It is only a
 * guess and the seeded entry says so; the editor corrects it when confirming.
 * The order matters: a library's domain can end in .gov, a parks department
 * is a .gov with "parks" in it.
 */
export function guessCategory(host: string, officialHost?: string): SourceCategory {
  const h = host.toLowerCase();
  // The town's own site is known from its config, whatever the domain ends in.
  if (officialHost && h === officialHost.toLowerCase().replace(/^www\./, '')) return 'city-calendar';
  if (AGGREGATORS.some((a) => h === a || h.endsWith(`.${a}`))) return 'other';
  if (/librar|libcal|libnet/.test(h)) return 'library';
  if (/parks|recreation|openspace|gardens|recreationliveshere/.test(h)) return 'parks';
  if (/chamber|mainstreet|main-street|downtown|visit[a-z]/.test(h)) return 'chamber';
  if (/\.gov$|^townof|^cityof|\.co\.us$/.test(h)) return 'city-calendar';
  if (/recorder|courier|news|times|gazette|press|kunc|broadwayworld|coloradoan/.test(h)) return 'news';
  return 'venue';
}

/**
 * Ticketing and calendar platforms many organizers publish through. A page
 * there is a fine `source` for one event, but the platform is not a place the
 * editor checks weekly, and it is never core.
 */
export const AGGREGATORS = [
  'tockify.com',
  'maxpreps.com',
  'marketspread.com',
  'humanitix.com',
  'lctix.com',
  'runsignup.com',
  'festivalnet.com',
  'broadwayworld.com',
  'eventbrite.com',
  'facebook.com',
  'allevents.in',
] as const;

/** Core: the civic and institutional calendars, and a venue the content leans on. */
export function isCore(category: SourceCategory, cites: { events: number; places: number }): boolean {
  if (CORE_CATEGORIES.includes(category)) return true;
  return category === 'venue' && cites.events >= 5;
}

/** "highplains.libcal.com" -> "highplains-libcal-com" */
export function idFromHost(host: string): string {
  return host
    .toLowerCase()
    .replace(/^www\./, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}
