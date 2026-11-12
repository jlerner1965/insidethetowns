/**
 * Whether a cost line means free. One rule, used by the event cards and
 * their "Free" filter, the weekly regulars, the Event markup's price, the
 * family pages and the programs (the reviews of 12 November 2026 found
 * four rules that disagreed: a card's filter and the structured data
 * called "Free; costume contest $5" free, the family page did not).
 *
 * Free is the organizer's word, and only when nothing paid follows it:
 * - no cost line at all is never free: nobody said so;
 * - the line begins "Free": "Free", "Free; registration required",
 *   "Free with library card";
 * - and nothing after it is priced: "Free; costume contest $5", "Free for
 *   members, $10 for guests", "Free; $3 post-run beer" and "Free to
 *   volunteer; the directory is a purchase" are not free;
 * - a price inside brackets is an aside and does not count: "Free (extra
 *   guests $5)".
 */
export function isFreeCost(cost: string | undefined | null): boolean {
  const text = cost?.trim() ?? '';
  if (!/^free\b/i.test(text)) return false;
  if (/^free\s+(?:to|for)\s+(?:volunteer|members?|apply|tour)/i.test(text)) return false;
  const rest = text.replace(/^free\b/i, '').replace(/\([^)]*\)/g, '');
  return !/\$|\bfees?\b|\bdues\b/i.test(rest);
}
