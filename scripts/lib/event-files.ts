/**
 * Writing an event as a markdown file the way the content is written by hand:
 * the frontmatter keys in a fixed order, strings quoted, the body below.
 * Shared by the CSV importer and ingest, so a file made by either reads the
 * same as one typed in.
 */
import { dayKey, toWallClock } from '../../src/lib/dates.ts';

export function slugify(text: string): string {
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

export function yamlString(value: string): string {
  return `"${value.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n')}"`;
}

/** The keys an event file carries, in the order a reader expects them. Also the write allowlist. */
export const EVENT_KEY_ORDER = [
  'title',
  'subTown',
  'review',
  'changeFlag',
  'changeNote',
  'start',
  'end',
  'allDay',
  'repeat',
  'until',
  'venue',
  'address',
  'organizer',
  'organizerUrl',
  'url',
  'cost',
  'category',
  'image',
  'imageAlt',
  'recurring',
  'timeNote',
  'featured',
  'status',
  'statusNote',
  'statusSource',
  'source',
  'sourceId',
  'sourceUid',
  'sourceHash',
  'verified',
  'verifiedBy',
] as const;

const BARE = new Set(['subTown', 'category', 'repeat', 'image', 'status']);


function inlineMap(value: Record<string, unknown>): string {
  const parts = Object.entries(value)
    .filter(([, v]) => v !== undefined && v !== '')
    .map(([k, v]) => `${k}: ${v instanceof Date ? yamlString(dayKey(v)) : typeof v === 'string' ? (/^[a-z][a-z0-9-]*$/.test(v) && k === 'from' ? v : yamlString(v)) : String(v)}`);
  return `{ ${parts.join(', ')} }`;
}

/**
 * Frontmatter plus body. Dates may be Date objects (written as Denver wall
 * clock) or strings already in that form.
 */
export function eventFile(frontmatter: Record<string, unknown>, body: string): string {
  const lines = ['---'];
  for (const key of EVENT_KEY_ORDER) {
    const v = frontmatter[key];
    if (v === undefined || v === '' || v === false || v === null) continue;
    if (v instanceof Date) lines.push(`${key}: ${yamlString(toWallClock(v))}`);
    else if (typeof v === 'boolean') lines.push(`${key}: ${v}`);
    else if (typeof v === 'object') lines.push(`${key}: ${inlineMap(v as Record<string, unknown>)}`);
    else if (BARE.has(key)) lines.push(`${key}: ${v}`);
    else lines.push(`${key}: ${yamlString(String(v))}`);
  }
  lines.push('---', '', body.trim(), '');
  return lines.join('\n');
}
