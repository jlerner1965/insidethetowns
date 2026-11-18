/**
 * The seasonal roundups that are due (the owner, 18 November 2026): each
 * season page records when its season runs (CURRENT_SEASONS' `span`, src/lib/traditions.ts)
 * and is due from eight weeks before it opens until it closes. A due page is
 * listed while any of its records has no confirmed date for the season, by
 * the verification report (scripts/validate-content.ts) and on the needs-me
 * list (scripts/needs-me.ts). Report only: nothing here fails a build.
 */
import { watchState, type DateWindow } from './date-watch.ts';
import { CURRENT_SEASONS, TRADITION_TYPE_INFO, type TraditionRecord, type TraditionType } from './traditions.ts';

/** Weeks before a season opens that its roundup is due. */
export const ROUNDUP_DUE_WEEKS = 8;
/** The other end of "6 to 8 weeks": the report says a roundup is late from here. */
export const ROUNDUP_LATE_WEEKS = 6;

export interface RoundupDue {
  type: TraditionType;
  plural: string;
  path: string;
  /** "YYYY-MM-DD", the season's first and last day this time round. */
  opens: string;
  closes: string;
  /** The day the roundup fell due: eight weeks before it opens. */
  dueFrom: string;
  /** Past six weeks before it opens with dates still missing. */
  late: boolean;
  /** The records in the season with no confirmed date for it. */
  missing: TraditionRecord[];
  /** Every record of the type, for the count. */
  total: number;
}

function addDays(day: string, n: number): string {
  return new Date(Date.parse(`${day}T12:00:00Z`) + n * 86_400_000).toISOString().slice(0, 10);
}

/**
 * The roundups due today and missing confirmed dates, soonest season first.
 * A record counts as missing where its next window falls in the season and
 * that year has no date from the organizer yet (src/lib/date-watch.ts). A
 * record with no dated year at all has no window to place it by, and is
 * counted missing while its roundup is due.
 */
export function roundupsDue(records: readonly (TraditionRecord & { dateWindow?: DateWindow })[], today: string): RoundupDue[] {
  const out: RoundupDue[] = [];
  for (const [type, season] of Object.entries(CURRENT_SEASONS) as Array<[TraditionType, (typeof CURRENT_SEASONS)[TraditionType]]>) {
    const span = season?.span;
    if (!span) continue;
    const wraps = span.closes < span.opens;
    const year = Number(today.slice(0, 4));
    // The first season that has not closed: last year's where it runs into this one, else this year's, else next year's.
    const [opens, closes] = [year - 1, year, year + 1].map((y) => [`${y}-${span.opens}`, `${wraps ? y + 1 : y}-${span.closes}`] as const).find(([, c]) => c >= today)!;
    const dueFrom = addDays(opens, -ROUNDUP_DUE_WEEKS * 7);
    if (today < dueFrom || today > closes) continue;
    const ofType = records.filter((r) => r.type === type && !r.fixture && !r.notAnnual);
    const seasonYear = Number(opens.slice(0, 4));
    const missing = ofType.filter((r) => {
      const w = watchState(r, today);
      // No dated year to place it by: missing unless the season's year is settled on the record (Wellington's 2026, canceled).
      if (!w) return !r.years.some((y) => y.year === seasonYear && (y.status === 'canceled' || ((y.status === 'confirmed' || y.status === 'moved') && !!y.date)));
      if (w.state === 'settled') return false;
      return w.opens <= closes;
    });
    if (!missing.length) continue;
    out.push({ type, plural: TRADITION_TYPE_INFO[type].plural, path: TRADITION_TYPE_INFO[type].path, opens, closes, dueFrom, late: today >= addDays(opens, -ROUNDUP_LATE_WEEKS * 7), missing, total: ofType.length });
  }
  return out.sort((a, b) => a.opens.localeCompare(b.opens));
}
