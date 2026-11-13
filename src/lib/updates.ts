/**
 * Local changes (content/<town>/updates/): which are current, which are
 * archive, and how each is dated. Pure functions over the collection's
 * data, tested without Astro.
 *
 * Three dates, kept apart: `effective` (when the thing happens or happened),
 * `published` (when the guide wrote it up) and `verified` (when the source
 * was last read). A change is current until `expires`: the end of its run
 * where it has one, else sixty days after it took effect. After that it is
 * archive, still reachable, never shown as news.
 */
import { UPDATE_STAGE_LABELS, type UpdateData, type UpdateStage } from '../content/schemas.ts';
import { addDays, dayKey, startOfDay } from './dates.ts';

export type UpdateLike = { data: UpdateData; slug?: string; id?: string };

/** A change with a run shows through its last day; one without shows this many days from when it took effect. */
export const UPDATE_DAYS = 60;

/** The last day an update shows as current, inclusive. */
export function expiresOn(u: UpdateLike): Date {
  const { expires, effectiveEnd, effective } = u.data;
  return expires ?? effectiveEnd ?? addDays(startOfDay(effective), UPDATE_DAYS);
}

export function isCurrent(u: UpdateLike, now = new Date()): boolean {
  return dayKey(expiresOn(u)) >= dayKey(now);
}

/** Current changes, the ones under way or about to start first, then by when they take effect, soonest first; a featured one leads its group. */
export function currentUpdates<T extends UpdateLike>(list: readonly T[], now = new Date()): T[] {
  return [...list].filter((u) => isCurrent(u, now)).sort((a, b) => Number(b.data.featured) - Number(a.data.featured) || b.data.published.getTime() - a.data.published.getTime());
}

/** Everything past its last day, most recent first. */
export function archivedUpdates<T extends UpdateLike>(list: readonly T[], now = new Date()): T[] {
  return [...list].filter((u) => !isCurrent(u, now)).sort((a, b) => b.data.effective.getTime() - a.data.effective.getTime());
}

/**
 * Whether the change is still ahead, under way, or done, decided from the
 * dates on the day the page is built rather than from the stage alone: an
 * `approved` closure whose dates have begun is under way, and a `scheduled`
 * one whose run has ended is over.
 */
export function timing(u: UpdateLike, now = new Date()): 'ahead' | 'now' | 'past' {
  const today = dayKey(now);
  const start = dayKey(u.data.effective);
  const end = u.data.effectiveEnd ? dayKey(u.data.effectiveEnd) : start;
  if (today < start) return 'ahead';
  if (today > end) return 'past';
  return 'now';
}

/** "Proposed", "Under way": the stage as the organizer's record has it. */
export function stageLabel(stage: UpdateStage): string {
  return UPDATE_STAGE_LABELS[stage];
}

/**
 * True when the guide wrote the change up long after it happened (an old
 * closure found this month). The page says "happened on … · noted on …"
 * for these, and never lists them as the week's news.
 */
export function isLateNotice(u: UpdateLike, days = 30): boolean {
  const gap = (startOfDay(u.data.published).getTime() - startOfDay(u.data.effective).getTime()) / 86_400_000;
  // An unofficial result is a thing that happened too (6 November 2026).
  return (u.data.stage === 'complete' || u.data.stage === 'unofficial') && gap > days;
}

/**
 * The rows of a guide's /updates.rss (src/routes/town/updates.rss.ts):
 * newest first by the day the guide published each, at most `limit`. The
 * description is the record's own words, what changed, who it affects and
 * what to do, with nothing added.
 */
export function updateFeedItems(list: readonly UpdateLike[], pageUrl: string, limit = 30) {
  return [...list]
    .sort((a, b) => b.data.published.getTime() - a.data.published.getTime())
    .slice(0, limit)
    .map((u) => {
      const link = `${pageUrl}#${u.slug ?? u.data.slug}`;
      return {
        title: u.data.title,
        link,
        guid: link,
        description: [u.data.summary, `Affects: ${u.data.affects}`, u.data.action ? `What to do: ${u.data.action}` : undefined].filter(Boolean).join(' '),
        pubDate: u.data.published,
        categories: [u.data.kind],
      };
    });
}

/**
 * The hub's "Local changes across the towns": the changes current today in
 * every guide, the most recently published first, at most `perTown` from
 * one guide so a busy town does not fill the strip, and `limit` in all.
 */
export function networkChanges<T extends UpdateLike & { town: { slug: string } }>(list: readonly T[], now = new Date(), { limit = 6, perTown = 2 } = {}): T[] {
  const taken = new Map<string, number>();
  const out: T[] = [];
  for (const u of [...currentUpdates(list, now)].sort((a, b) => b.data.published.getTime() - a.data.published.getTime())) {
    const n = taken.get(u.town.slug) ?? 0;
    if (n >= perTown) continue;
    taken.set(u.town.slug, n + 1);
    out.push(u);
    if (out.length === limit) break;
  }
  return out;
}

/** How many days a change counts as new, and how far ahead a start counts as timely (the audit of 13 November 2026). */
export const NEW_DAYS = 7;
export const TIMELY_DAYS = 14;

const dayNumber = (key: string) => Date.UTC(Number(key.slice(0, 4)), Number(key.slice(5, 7)) - 1, Number(key.slice(8, 10))) / 86_400_000;
const daysFrom = (from: Date, to: Date) => dayNumber(dayKey(to)) - dayNumber(dayKey(from));

/** Published within the last week, in Denver days: "New" on a guide's updates list. */
export function isNew(u: UpdateLike, now = new Date()): boolean {
  const age = daysFrom(u.data.published, now);
  return age >= 0 && age < NEW_DAYS;
}

/**
 * Whether a current change belongs high on a guide's home page now, rather
 * than in Worth knowing at its foot: the editor featured it, it starts
 * within the fortnight, or it is under way and was published within the
 * fortnight. Routine notices that have run for weeks stay below.
 */
export function isTimely(u: UpdateLike, now = new Date()): boolean {
  if (!isCurrent(u, now)) return false;
  if (u.data.featured) return true;
  const when = timing(u, now);
  if (when === 'ahead') return daysFrom(now, u.data.effective) <= TIMELY_DAYS;
  if (when === 'now') return daysFrom(u.data.published, now) <= TIMELY_DAYS;
  return false;
}
