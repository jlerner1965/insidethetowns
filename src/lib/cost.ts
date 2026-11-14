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

/** "1,250.50" as a number. */
const amount = (price: string): number => Number(price.replace(/,/g, ''));

/**
 * A cost line short enough for a row on the hub's home (the viewer review
 * of 14 November 2026: "$115–$125 adults, $80 youth 13–18, $70 children 12
 * and under, plus a $6 reservation fee per ticket; dinner included" took
 * five lines of a phone's weekend list). A line of up to `max` characters
 * is kept as the organizer wrote it. A longer one with prices is the
 * lowest ticket price, "From $70" ("$125" where there is one price), read
 * only from the parts that price a ticket: an aside in brackets, and a
 * part about a fee, an add-on, a member's or a designated driver's price
 * or a later price, are left out. An age limit of 21 is kept, since it
 * decides who can go. A long line with no price above $0 ("Pay what you
 * wish, from $0; reserve a seat …") is its first part. The listing's own
 * page always has the whole line.
 */
export function shortCost(cost: string | undefined | null, max = 42): string | undefined {
  const text = cost?.trim();
  if (!text) return undefined;
  if (text.length <= max) return text;
  const parts = text
    .replace(/\([^)]*\)/g, '')
    .split(/;|,(?!\d{3}\b)/)
    .map((p) => p.trim())
    .filter(Boolean);
  const ticket = parts.filter((p) => !/\b(?:fees?|plus|extra|designated drivers?|members?|deposit|parking|after|rises?)\b/i.test(p));
  const paid = ticket
    .flatMap((p) => [...p.matchAll(/\$\s?(\d{1,3}(?:,\d{3})+(?:\.\d{2})?|\d+(?:\.\d{2})?)/g)].map((m) => m[1]!))
    .filter((p) => amount(p) > 0);
  if (paid.length === 0) return parts[0] ?? text;
  const lowest = paid.reduce((a, b) => (amount(b) < amount(a) ? b : a));
  const one = paid.every((p) => amount(p) === amount(lowest));
  const over21 = /\b21\s*\+|\b21 and (?:over|up|older)\b/i.test(text) ? '; 21+' : '';
  return `${one ? '' : 'From '}$${lowest}${over21}`;
}
