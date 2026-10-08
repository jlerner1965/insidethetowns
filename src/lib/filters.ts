/**
 * The decisions behind FilterBar.astro: which rows a filter shows, how many
 * it left out for want of hours, and which of a day's rows sit above "Show N
 * more". Pure functions, so the rules can be tested without a browser; the
 * script in FilterBar applies them to the page.
 *
 * Everything is decided in one pass over the rows, and every count on the
 * page is read from that pass. The directory's name search used to set an
 * attribute of its own that the stylesheet never matched, so "City Star"
 * left all thirty-five rows up; and the hub's town filter counted a match it
 * then left folded inside "Show 20 more".
 */

export interface FilterRow {
  /** What the row is filed under: a place type, or on the hub a town. */
  category?: string;
  /** On a multi-town guide, which of its towns. */
  subTown?: string;
  /** The name a reader would type. */
  name?: string;
  /** Set by OpenStatus.astro from the row's hours: 'true' or 'false'; unset when they cannot be read. */
  open?: string;
  /** A park, a trail or a trailhead: open ground, kept by daylight or not at all. */
  land?: boolean;
}

export interface FilterState {
  /** A category, or 'all'. */
  value: string;
  openOnly: boolean;
  /** A sub-town, or 'all'. */
  where: string;
  /** The name search, as typed. */
  query: string;
}

export interface FilterResult {
  shown: boolean[];
  /** How many rows are shown. */
  count: number;
  /** Under "Open now": businesses left out because their hours are unknown. */
  unknownHours: number;
  /** Under "Open now": parks and trails left out because they keep daylight or no posted hours. */
  unknownLand: number;
}

/** Lower case, accents and curly quotes flattened, runs of space as one: "Catalina’s" finds "catalina's". */
export function normalizeName(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

export function filterRows(rows: readonly FilterRow[], state: FilterState): FilterResult {
  const q = normalizeName(state.query);
  let count = 0;
  let unknownHours = 0;
  let unknownLand = 0;
  const shown = rows.map((row) => {
    const matches =
      (state.value === 'all' || row.category === state.value) &&
      (state.where === 'all' || row.subTown === state.where) &&
      (q === '' || normalizeName(row.name ?? '').includes(q));
    if (!matches) return false;
    if (state.openOnly && row.open !== 'true') {
      // Closed is closed; a row whose hours cannot be read is not, and is
      // counted so the page can say what it left out.
      if (row.open === undefined) row.land ? unknownLand++ : unknownHours++;
      return false;
    }
    count++;
    return true;
  });
  return { shown, count, unknownHours, unknownLand };
}

/** "3 places with unknown hours not shown." and its daylight counterpart, or '' when nothing was left out. */
export function unknownNote({ unknownHours, unknownLand }: Pick<FilterResult, 'unknownHours' | 'unknownLand'>): string {
  const parts: string[] = [];
  if (unknownHours) parts.push(`${unknownHours} ${unknownHours === 1 ? 'place' : 'places'} with unknown hours not shown.`);
  if (unknownLand) {
    parts.push(`${unknownLand} ${unknownLand === 1 ? 'park or trail' : 'parks and trails'} with daylight or no posted hours not shown.`);
  }
  return parts.join(' ');
}

/**
 * Which of a day's rows go above its "Show N more" and which below it,
 * counted among the rows the filter shows: indices into the day's rows, in
 * order. Filtered first and folded second, so a town's only listing that day
 * is never the one behind the fold. A day of `after + 1` shown rows is shown
 * whole, as the server renders it: a "Show 1 more" saves nothing.
 */
export function collapsePlan(shown: readonly boolean[], after: number): { above: number[]; below: number[] } {
  const visible = shown.flatMap((s, i) => (s ? [i] : []));
  if (visible.length <= after + 1) return { above: visible, below: [] };
  return { above: visible.slice(0, after), below: visible.slice(after) };
}

/** "1 result in Estes Park, matching “bruni”", for the screen reader's status line. */
export function statusText(count: number, { label, openOnly, whereLabel, query }: { label?: string; openOnly: boolean; whereLabel?: string; query: string }): string {
  const q = query.trim();
  return [
    `${count} ${count === 1 ? 'result' : 'results'}`,
    label ? ` in ${label}` : '',
    openOnly ? ', open now' : '',
    whereLabel ? `, in ${whereLabel}` : '',
    q ? `, matching “${q}”` : '',
  ].join('');
}

/** What the empty box says: the search and the filters that left nothing. */
export function emptyText({ label, openOnly, whereLabel, query }: { label?: string; openOnly: boolean; whereLabel?: string; query: string }): string {
  const q = query.trim();
  const scope = [label ? `in ${label}` : '', whereLabel ? `in ${whereLabel}` : '', openOnly ? 'open right now' : ''].filter(Boolean).join(', ');
  if (q) return `Nothing matches “${q}”${scope ? ` ${scope}` : ''}.`;
  return `Nothing ${scope || 'listed'}.`;
}
