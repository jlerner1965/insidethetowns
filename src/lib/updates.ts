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
  return u.data.stage === 'complete' && gap > days;
}
