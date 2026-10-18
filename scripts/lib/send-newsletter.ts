/**
 * What the Thursday send makes of one issue file, kept apart from Buttondown
 * so it can be tested without it: who the issue goes to, the body Buttondown
 * is given, and whether the issue is still fresh enough to go out at all.
 * scripts/send-newsletter.ts does the talking.
 */
import type { TownConfig } from '../../src/config/towns/types.ts';

/** One condition on a subscriber, in Buttondown's filter shape. */
export interface AudienceFilter {
  field: 'subscriber.tags';
  operator: 'contains';
  value: string;
}

/** Buttondown's audience: filters and groups combined by the predicate. */
export interface Audience {
  filters: AudienceFilter[];
  groups: Audience[];
  predicate: 'and' | 'or';
}

/**
 * The subscriber tags an issue goes to. An edition goes to every town in it,
 * and to any town folded into one of them, because a reader who ticked
 * Severance before 12 October still carries `severance` and now reads
 * Windsor's guide. The network issue (no towns) goes to the all-towns tag.
 */
export function recipientTags(issueTowns: readonly string[], towns: readonly TownConfig[], allTag: string): string[] {
  if (!issueTowns.length) return [allTag];
  const tags = new Set(issueTowns);
  for (const t of towns) if (t.foldedInto && issueTowns.includes(t.foldedInto.town)) tags.add(t.slug);
  return [...tags];
}

/**
 * Anyone carrying any of the tags. An empty filter in Buttondown is every
 * subscriber, which is the one mistake this must never make, so no tag is
 * an error rather than an audience.
 */
export function audience(tagIds: readonly string[]): Audience {
  if (!tagIds.length) throw new Error('no tag to send to: an empty audience is every subscriber');
  return {
    filters: tagIds.map((value) => ({ field: 'subscriber.tags', operator: 'contains', value })),
    groups: [],
    predicate: 'or',
  };
}

/**
 * An issue goes out on its own day or the day after, so a merge on Friday
 * morning still sends Thursday's. Later than that its weekend has begun and
 * "this weekend" would be wrong; the next Thursday's issue replaces it.
 */
export function sendable(issueDate: string, today: string): boolean {
  const day = (d: string) => Date.UTC(Number(d.slice(0, 4)), Number(d.slice(5, 7)) - 1, Number(d.slice(8, 10)));
  const late = (day(today) - day(issueDate)) / 86_400_000;
  return late >= 0 && late <= 1;
}

/**
 * The Markdown after the frontmatter, which Buttondown refuses to receive,
 * told to read it as Markdown rather than guess.
 */
export function emailBody(body: string): string {
  return `<!-- buttondown-editor-mode: plaintext -->\n${body.replace(/^\s+/, '')}`;
}
