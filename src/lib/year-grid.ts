/**
 * The year at a glance on a hub town page (src/routes/hub/town.astro): what
 * each month's cell says to a screen reader. Pure and free of imports, since
 * the same words are written again in the reader's browser once a date has
 * passed (src/lib/tradition-expiry.ts), so the words never disagree with the
 * dots.
 */
export const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'] as const;

/** One tradition's mark in the month of its date. */
export interface YearMark {
  slug: string;
  /** A date is set (a dot), or the event was last held that month and its next date is not announced (a ring). */
  set: boolean;
  /** For a ring: the year it was last held. */
  heldYear?: string;
  /** For a ring: the year whose date is awaited, where one is on file; none once the last date has passed and no later year is. */
  nextYear?: string;
  /** For a dot: the year of its date, which is the year it was last held once that date has passed. */
  year?: string;
  /** Which list on the page its entry is under: "coming-up" or "not-announced". */
  group: string;
}

/**
 * What a month says to a screen reader: "September: 1 event, date set",
 * "July: 2 events last held in July 2026, 2027 dates not yet announced".
 * The same function runs in the reader's browser once a date has passed
 * (src/lib/tradition-expiry.ts), so the words never disagree with the dots.
 */
export function monthLabel(month: number, marks: ReadonlyArray<Pick<YearMark, 'set' | 'heldYear' | 'nextYear'>>, now = false): string {
  const name = MONTH_NAMES[month]!;
  const count = (n: number) => `${n} ${n === 1 ? 'event' : 'events'}`;
  const parts: string[] = [];
  const set = marks.filter((m) => m.set).length;
  if (set > 0) parts.push(`${count(set)}, ${set === 1 ? 'date' : 'dates'} set`);
  const held = new Map<string, { heldYear: string; nextYear?: string; n: number }>();
  for (const m of marks) {
    if (m.set || !m.heldYear) continue;
    const key = `${m.heldYear}|${m.nextYear ?? ''}`;
    const group = held.get(key) ?? { heldYear: m.heldYear, nextYear: m.nextYear, n: 0 };
    group.n += 1;
    held.set(key, group);
  }
  for (const g of [...held.values()].sort((a, b) => a.heldYear.localeCompare(b.heldYear))) {
    const awaited = g.nextYear ? `${g.nextYear} ${g.n === 1 ? 'date' : 'dates'}` : `next ${g.n === 1 ? 'date' : 'dates'}`;
    parts.push(`${count(g.n)} last held in ${name} ${g.heldYear}, ${awaited} not yet announced`);
  }
  const head = now ? `${name}, this month` : name;
  return parts.length > 0 ? `${head}: ${parts.join('; ')}` : head;
}

