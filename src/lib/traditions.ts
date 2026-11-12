/**
 * Traditions: the named events a town holds every year (a parade of lights,
 * a tree lighting), one permanent record each, shared by the hub and every
 * guide (content/hub/traditions/, the `traditions` collection). A record's
 * slug has no year in it; each year is an entry inside it, newest first.
 *
 * Two pages read them: the hub's season page, one per type
 * (/parades-of-lights/, /tree-lightings/), every town A to Z; and a guide's
 * /traditions/, "Every year in <Town>". Both are built only where there is
 * a record to show: a guide with none gets no page and no link, and a type
 * with none for its season gets no hub page.
 *
 * The rules are "dates, never rules" (the network's standard): a row shows
 * the date the organizer published for this year, or says it is not
 * announced and when it was last held. Nothing here predicts a date.
 *
 * This file is plain functions over plain data, so the pages, the route
 * integration, the validator and the tests share one reading of a record.
 * It never imports astro:content.
 */
import type { EventCategory } from '../content/schemas.ts';

export const TRADITION_TYPES = ['parade-of-lights', 'tree-lighting', 'turkey-trot', 'trick-or-treat', 'fireworks', 'festival'] as const;
export type TraditionType = (typeof TRADITION_TYPES)[number];

export const TRADITION_STATUSES = ['confirmed', 'not-announced', 'moved', 'canceled'] as const;
export type TraditionStatus = (typeof TRADITION_STATUSES)[number];

/**
 * What each type is called, where its hub page is, and which event
 * category's dot and ink its rows borrow on a guide (no new colours: the
 * category tokens are the ones every event row uses).
 */
export const TRADITION_TYPE_INFO: Record<TraditionType, { label: string; plural: string; path: string; category: EventCategory }> = {
  'parade-of-lights': { label: 'Parade of lights', plural: 'Parades of lights', path: '/parades-of-lights/', category: 'festival' },
  'tree-lighting': { label: 'Tree lighting', plural: 'Tree lightings', path: '/tree-lightings/', category: 'family' },
  'turkey-trot': { label: 'Turkey trot', plural: 'Turkey trots', path: '/turkey-trots/', category: 'sports' },
  'trick-or-treat': { label: 'Trick-or-treat', plural: 'Trick-or-treats', path: '/trick-or-treat/', category: 'family' },
  fireworks: { label: 'Fireworks', plural: 'Fireworks', path: '/fireworks/', category: 'festival' },
  festival: { label: 'Festival', plural: 'Festivals', path: '/festivals/', category: 'festival' },
};

/**
 * The season each type's hub page is showing, set by hand when a season
 * opens. A type not listed here has no hub page, whatever its records say;
 * on a guide its rows show their newest entry. The year is never worked
 * out from the calendar: it changes the day the owner says so.
 */
export const CURRENT_SEASONS: Partial<Record<TraditionType, { season: string; year: number }>> = {
  'parade-of-lights': { season: 'winter', year: 2026 },
  'tree-lighting': { season: 'winter', year: 2026 },
};

/** One year of a tradition, as the schema leaves it: dates as "YYYY-MM-DD". */
export interface TraditionYear {
  year: number;
  status: TraditionStatus;
  date?: string;
  startTime?: string;
  place?: string;
  cost?: string;
  previousDate?: string;
  reason?: string;
  /** The page this year's date was read from, where it is not the record's own source. */
  sourceUrl?: string;
  checked: string;
}

export interface TraditionRecord {
  slug: string;
  name: string;
  town: { name: string; guide?: string };
  type: TraditionType;
  organizer: string;
  sourceUrl: string;
  firstYear?: number;
  years: TraditionYear[];
  /** A sample record for building and checking the pages; never on a live site. */
  fixture?: boolean;
}

/**
 * The environment switch for the sample records in test/fixtures/traditions/.
 * Refused on Vercel outright, so no deployment, preview or production, can
 * ever load them; the collection, the route list and the build's checks all
 * ask this one function.
 */
export const FIXTURES_ENV = 'TRADITIONS_FIXTURES';
export function fixturesEnabled(env: Record<string, string | undefined> = process.env): boolean {
  const on = env[FIXTURES_ENV] === '1';
  if (on && env.VERCEL) {
    throw new Error(`${FIXTURES_ENV}=1 is set on Vercel. The tradition fixtures are for local and CI checks only and never ship.`);
  }
  return on;
}

/** Where the approved records live, and where the sample ones do. */
export const TRADITIONS_DIR = 'content/hub/traditions';
export const FIXTURES_DIR = 'test/fixtures/traditions';

/** The year a record is shown for: its type's season, else its newest entry's. */
export function seasonYear(record: Pick<TraditionRecord, 'type' | 'years'>): number | undefined {
  return CURRENT_SEASONS[record.type]?.year ?? record.years[0]?.year;
}

/** The entry for the year being shown, if the record has one. */
export function currentEntry(record: Pick<TraditionRecord, 'type' | 'years'>): TraditionYear | undefined {
  const year = seasonYear(record);
  return record.years.find((y) => y.year === year);
}

/** Whether an entry carries a date the organizer published for it: confirmed, or moved to it. */
export function isDated(entry: Pick<TraditionYear, 'status'>): boolean {
  return entry.status === 'confirmed' || entry.status === 'moved';
}

/**
 * "Last held": the newest earlier year the organizer gave a date for and
 * that has passed. Never a year that was canceled, and never a guess: a
 * record with no dated earlier year has no "last held" line.
 */
export function lastHeld(record: Pick<TraditionRecord, 'years'>, before: number, today: string): string | undefined {
  return record.years.find((y) => y.year < before && isDated(y) && !!y.date && y.date <= today)?.date;
}

/** The page a row's source link goes to: this year's own, else the record's. */
export function entrySource(record: Pick<TraditionRecord, 'sourceUrl'>, entry: Pick<TraditionYear, 'sourceUrl'>): string {
  return entry.sourceUrl ?? record.sourceUrl;
}

/** A record as a page row: the record, the year shown, and what the status line needs. */
export interface TraditionRow {
  record: TraditionRecord;
  entry: TraditionYear;
  year: number;
  lastHeld?: string;
  source: string;
}

export function toRow(record: TraditionRecord, today: string): TraditionRow | undefined {
  const entry = currentEntry(record);
  if (!entry) return undefined;
  return { record, entry, year: entry.year, lastHeld: lastHeld(record, entry.year, today), source: entrySource(record, entry) };
}

/** A to Z by town, then by event name: the hub's order. */
export function byTown(a: TraditionRow, b: TraditionRow): number {
  return a.record.town.name.localeCompare(b.record.town.name) || a.record.name.localeCompare(b.record.name);
}

/**
 * The hub's page for one type: every record of that type with an entry for
 * the type's season, A to Z by town. Empty when the type has no season set.
 */
export function seasonRows(records: readonly TraditionRecord[], type: TraditionType, today: string): TraditionRow[] {
  const season = CURRENT_SEASONS[type];
  if (!season) return [];
  return records
    .filter((r) => r.type === type)
    .map((r) => toRow(r, today))
    .filter((row): row is TraditionRow => !!row && row.year === season.year)
    .sort(byTown);
}

/** The count line: how many towns the page lists, and how many dates the organizers have published. */
export function seasonCounts(rows: readonly TraditionRow[]): { towns: number; confirmed: number } {
  return {
    towns: new Set(rows.map((r) => r.record.town.name)).size,
    confirmed: rows.filter((r) => isDated(r.entry)).length,
  };
}

/**
 * A guide's page in its two groups. "Date confirmed" is every row with a
 * date from the organizer, soonest first; a canceled year sits there too, at
 * its date where it had one, so the reader who planned on it finds it where
 * the date was. "Not announced yet" is the rest, A to Z.
 */
export function townGroups(records: readonly TraditionRecord[], guide: string, today: string): { dated: TraditionRow[]; waiting: TraditionRow[] } {
  const rows = records
    .filter((r) => r.town.guide === guide)
    .map((r) => toRow(r, today))
    .filter((row): row is TraditionRow => !!row);
  const dated = rows
    .filter((r) => r.entry.status !== 'not-announced')
    .sort((a, b) => (a.entry.date ?? '9999').localeCompare(b.entry.date ?? '9999') || a.record.name.localeCompare(b.record.name));
  const waiting = rows.filter((r) => r.entry.status === 'not-announced').sort((a, b) => a.record.name.localeCompare(b.record.name));
  return { dated, waiting };
}

/** Days from one "YYYY-MM-DD" to another, by the calendar. */
export function daysFrom(from: string, to: string): number {
  return Math.round((Date.parse(`${to}T12:00:00Z`) - Date.parse(`${from}T12:00:00Z`)) / 86_400_000);
}

/**
 * The build's warning list: every entry dated within the next 30 days whose
 * check is more than 14 days old. A warning, not a failure: the date was
 * right when read, and the fix is a person reading the source again.
 */
export const STALE_WITHIN_DAYS = 30;
export const STALE_CHECK_DAYS = 14;
export function staleSoon(records: readonly TraditionRecord[], today: string): Array<{ slug: string; year: number; date: string; checked: string }> {
  const out: Array<{ slug: string; year: number; date: string; checked: string }> = [];
  for (const r of records) {
    for (const y of r.years) {
      if (!y.date || y.status === 'canceled') continue;
      const ahead = daysFrom(today, y.date);
      if (ahead < 0 || ahead > STALE_WITHIN_DAYS) continue;
      if (daysFrom(y.checked, today) > STALE_CHECK_DAYS) out.push({ slug: r.slug, year: y.year, date: y.date, checked: y.checked });
    }
  }
  return out;
}
