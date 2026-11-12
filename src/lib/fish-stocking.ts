/**
 * "Recently stocked near <Town>": the first signature on the hub's town
 * pages (HubTown.signature; the owner, 12 November 2026).
 *
 * The source is Colorado Parks and Wildlife's trout stocking report, one
 * HTML table on cpw.state.co.us: a water, its region, a report date and a
 * link to the water in CPW's Fishing Atlas. In CPW's words: "The list
 * below identifies where catchable trout (approximately 10") were
 * recently stocked", "updated every Friday during the fishing season",
 * and "The date listed next to the water represents when the water was
 * added to the report. The actual stocking day may have occurred earlier
 * in that week." So the page says "added to the report", never "stocked
 * on", and carries that caveat.
 *
 * A water is matched by the Fishing Atlas id in its link, not its name:
 * the report spells one water several ways and the id does not change.
 *
 * `scripts/fish-stocking.ts` reads the table into data/hub/fish-stocking.json
 * on a schedule; a failed read leaves the last good file. The pages read
 * the file, never the network. Pure: text and plain data in, plain data out.
 */
import type { StockedWater } from '../config/hub-towns.ts';

export const STOCKING_SOURCE = 'https://cpw.state.co.us/fishing/stocking-report';
export const STOCKING_SOURCE_NAME = 'Colorado Parks and Wildlife';

export interface StockingRow {
  /** The Fishing Atlas id from the row's link. */
  id: number;
  /** The water as the report spells it that week. */
  name: string;
  region: string;
  /** The report date, "YYYY-MM-DD": the day the water was added to the report. */
  added: string;
}

export interface StockingData {
  source: string;
  /** The day the report was last read successfully, "YYYY-MM-DD". */
  fetched: string;
  rows: StockingRow[];
}

/** How long after it was added a water is still "recently" stocked. */
export const RECENT_DAYS = 30;
/**
 * How old the report's newest date may be before the season is taken to be
 * over. CPW adds waters every Friday in season; three Fridays with nothing
 * new and the block comes off every page rather than age in place.
 */
export const SEASON_GAP_DAYS = 21;
/** How old the last successful read may be before the file is not trusted. */
export const STALE_READ_DAYS = 14;

const text = (html: string) =>
  html
    .replace(/<span aria-hidden="true">[\s\S]*?<\/span>/g, '')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&#0?39;|&rsquo;/g, '’')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

/** "11/6/2026" to "2026-11-06"; undefined for anything that is not a real date. */
export function reportDay(value: string): string | undefined {
  const m = value.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!m) return undefined;
  const [month, day, year] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return undefined;
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

/**
 * The report's rows from the page's HTML. A row needs a name, a date that
 * parses and an Atlas id; one without is skipped, not guessed at. Throws
 * when the table is not there or yields nothing, so the caller keeps the
 * last good file rather than write an empty one.
 */
export function parseStockingReport(html: string): StockingRow[] {
  const table = html.match(/<table>\s*<caption>\s*Trout Stocking Report\s*<\/caption>[\s\S]*?<\/table>/i)?.[0];
  if (!table) throw new Error('the "Trout Stocking Report" table is not on the page');
  const rows: StockingRow[] = [];
  for (const tr of table.match(/<tr>[\s\S]*?<\/tr>/g) ?? []) {
    const cells = tr.match(/<(?:th|td)[^>]*>[\s\S]*?<\/(?:th|td)>/g) ?? [];
    if (cells.length < 4) continue;
    const id = cells[3]!.match(/[?&;]value=(\d+)/)?.[1];
    const added = reportDay(text(cells[2]!));
    const name = text(cells[0]!);
    if (!id || !added || !name) continue;
    rows.push({ id: Number(id), name, region: text(cells[1]!), added });
  }
  if (rows.length === 0) throw new Error('the stocking table has no row with a water, a date and an Atlas link');
  return rows;
}

const daysBetween = (from: string, to: string) => Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86_400_000);

export interface StockedLine {
  /** The water's name from the town's config. */
  name: string;
  /** The latest day it was added to the report. */
  added: string;
  /** The water in CPW's Fishing Atlas. */
  atlas: string;
}

/**
 * A town's waters on the report lately, newest first; each water once, at
 * its latest date. Empty, and the page draws nothing, when: the town
 * watches no water; there is no data or the last good read is too old; the
 * report's own newest date is weeks old (out of season); or none of the
 * town's waters was added in the last RECENT_DAYS.
 */
export function recentlyStocked(waters: readonly StockedWater[], data: StockingData | undefined, today: string): StockedLine[] {
  if (!data || waters.length === 0 || data.rows.length === 0) return [];
  if (daysBetween(data.fetched, today) > STALE_READ_DAYS) return [];
  const newest = data.rows.reduce((max, r) => (r.added > max ? r.added : max), '');
  if (daysBetween(newest, today) > SEASON_GAP_DAYS) return [];
  const lines: StockedLine[] = [];
  for (const water of waters) {
    const hits = data.rows.filter((r) => water.ids.includes(r.id) && r.added <= today && daysBetween(r.added, today) <= RECENT_DAYS);
    if (hits.length === 0) continue;
    const latest = hits.reduce((a, b) => (b.added > a.added ? b : a));
    lines.push({ name: water.name, added: latest.added, atlas: `https://ndismaps.nrel.colostate.edu/fishingatlas/index.aspx?keyword=fspot&value=${latest.id}` });
  }
  return lines.sort((a, b) => b.added.localeCompare(a.added) || a.name.localeCompare(b.name));
}
