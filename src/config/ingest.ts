/**
 * How ingest behaves, in one place.
 */
export const INGEST = {
  /** Days ahead to take from a feed: the site's own events horizon (src/lib/events.ts). */
  horizonDays: 120,
  /**
   * A feed item and an existing listing on the same Denver day whose titles
   * share at least this fraction of their words are the same event. Below
   * it, the item is staged as new and the review decides.
   */
  titleMatch: 0.6,
} as const;

/*
 * There is no switch here for applying a cancellation the night it is read.
 * Ingest writes every change a feed makes to a published event, a
 * cancellation included, to staging/changes/ with `changeFlag` on the
 * listing, and touches nothing else. Whether it is then written in without
 * a person is the standing rules' call (scripts/lib/auto-review.ts, the
 * owner's delegation of 15 October 2026): the same organizer feed the
 * listing came from may cancel it, move its time or name its venue; any
 * other change waits for `npm run review`. Until 18 October 2026 an unused
 * `autoApplyCancellations: false` sat here and said the opposite.
 */
