/**
 * /new-and-closed/: what opened, closed, moved or changed its hours in town,
 * and what the guide has added, on one page (the Lafayette gap report's
 * readers' question 16, "What's new in town, and what closed?"; the owner's
 * word, 9 November 2026). Nothing here is new information: the page reads
 * the records the guide already keeps, each with its own source, and keeps
 * them longer than the fortnight /this-week/ shows them for.
 *
 * - The weekly notes' changes (content/<town>/weekly/): an opening, a
 *   closing, a move or new hours, each with the owner's or an official
 *   source. One without a source is left out, as on /this-week/.
 * - Local changes of kind `opening` or `closure` (content/<town>/updates/).
 * - Places marked closed or temporarily closed, by the day the guide
 *   recorded it (`closed`), with their status note.
 * - Places added to the guide (`added`), apart and labelled as additions to
 *   the guide, never as openings.
 *
 * Pure: the page passes the collections in; the tests pass plain objects.
 */
import { CHANGE_TAG_LABELS, SOURCED_CHANGE_TAGS, type ChangeTag } from '../content/schemas.ts';
import { addDays, dayKey } from './dates.ts';

/** How far back the page reaches for openings and closings. */
export const NEW_AND_CLOSED_DAYS = 90;
/** How far back "New on the guide" reaches. */
export const ADDED_DAYS = 30;

export type TownChangeKind = 'opening' | 'closed' | 'temporarily-closed' | 'moved' | 'new-hours' | 'closure';

export const TOWN_CHANGE_LABELS: Record<TownChangeKind, string> = {
  opening: 'Opening',
  closed: 'Closed',
  'temporarily-closed': 'Temporarily closed',
  moved: 'Moved',
  'new-hours': 'New hours',
  closure: 'Closure',
};

export interface TownChange {
  kind: TownChangeKind;
  label: string;
  name: string;
  detail: string;
  /** The day it happened where the record says, else the day the guide recorded it. */
  date: Date;
  /** The listing on this guide it is about, where there is one. */
  href?: string;
  source?: string;
}

type NoteChange = { tag: ChangeTag; name: string; detail: string; source?: string; checked: Date; effective?: Date };
type NotesInput = { data: { changes: readonly NoteChange[] } };
type UpdateInput = { slug?: string; id?: string; data: { kind: string; title: string; summary: string; effective: Date; source?: string; item?: string } };
type PlaceInput = { slug: string; data: { title: string; status?: string; closed?: Date; statusNote?: string; statusSource?: string; added?: Date; summary?: string } };

const sameName = (a: string) => a.trim().toLowerCase().replace(/[’']/g, "'").replace(/\s+/g, ' ');
const isClosing = (k: TownChangeKind) => k === 'closed' || k === 'temporarily-closed' || k === 'closure';

/**
 * Every opening, closing, move and change of hours the guide has a source
 * for in the last `days`, newest first. A place marked closed and a weekly
 * note or a local change about the same closing are one row: the place's,
 * which links its page.
 */
export function townChanges(
  { notes, updates, places }: { notes: readonly NotesInput[]; updates: readonly UpdateInput[]; places: readonly PlaceInput[] },
  now = new Date(),
  days = NEW_AND_CLOSED_DAYS,
): TownChange[] {
  const since = dayKey(addDays(now, -days));
  const today = dayKey(now);
  const inWindow = (d: Date) => dayKey(d) >= since && dayKey(d) <= today;
  const out: TownChange[] = [];

  for (const p of places) {
    if ((p.data.status === 'closed' || p.data.status === 'temporarily-closed') && p.data.closed && inWindow(p.data.closed)) {
      const kind = p.data.status as TownChangeKind;
      out.push({ kind, label: TOWN_CHANGE_LABELS[kind], name: p.data.title, detail: p.data.statusNote ?? '', date: p.data.closed, href: `/places/${p.slug}/`, source: p.data.statusSource });
    }
  }
  for (const u of updates) {
    if (u.data.kind !== 'opening' && u.data.kind !== 'closure') continue;
    if (!inWindow(u.data.effective)) continue;
    const kind: TownChangeKind = u.data.kind === 'opening' ? 'opening' : 'closure';
    out.push({ kind, label: TOWN_CHANGE_LABELS[kind], name: u.data.title, detail: u.data.summary, date: u.data.effective, href: u.data.item ?? `/updates/#${u.slug ?? u.id}`, source: u.data.source });
  }
  for (const n of notes) {
    for (const c of n.data.changes) {
      if (!SOURCED_CHANGE_TAGS.includes(c.tag) || !c.source) continue;
      const date = c.effective ?? c.checked;
      if (!inWindow(date)) continue;
      const kind = c.tag as TownChangeKind;
      out.push({ kind, label: CHANGE_TAG_LABELS[c.tag], name: c.name, detail: c.detail, date, source: c.source });
    }
  }

  // One row per business and kind of change: the place's own first (it
  // links the page), then the newest record.
  const rank = (c: TownChange) => (c.href?.startsWith('/places/') ? 0 : 1);
  const seen = new Set<string>();
  return out
    .sort((a, b) => rank(a) - rank(b) || b.date.getTime() - a.date.getTime())
    .filter((c) => {
      const key = `${sameName(c.name)}|${isClosing(c.kind) ? 'closing' : c.kind}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) => b.date.getTime() - a.date.getTime());
}

/**
 * The open places the guide added in the last `days`, newest first:
 * additions to the guide, not openings. The listings a guide opened with
 * (the earliest `added` day of all its places) are not new to it: on
 * Lafayette, launched 2 November 2026, every listing would have been.
 */
export function addedToGuide<P extends PlaceInput>(places: readonly P[], now = new Date(), days = ADDED_DAYS): P[] {
  const since = dayKey(addDays(now, -days));
  const today = dayKey(now);
  const days0 = places.map((p) => p.data.added).filter((a): a is Date => !!a).map((a) => dayKey(a)).sort();
  const launch = days0[0];
  return places
    .filter((p) => (p.data.status ?? 'open') === 'open' && p.data.added && dayKey(p.data.added) >= since && dayKey(p.data.added) <= today && dayKey(p.data.added) !== launch)
    .sort((a, b) => b.data.added!.getTime() - a.data.added!.getTime() || a.data.title.localeCompare(b.data.title));
}
