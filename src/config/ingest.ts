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
  /**
   * Whether a cancellation read from a source is written straight into the
   * published file as `status: canceled`, with the feed as the source.
   *
   * Off: nothing published changes without a person approving it, which is
   * the brief's first rule, and a cancellation goes to the top of the review
   * queue instead. On: a called-off meeting leaves the picks and the feeds
   * the night it is read, days before the weekly review. The owner's call.
   */
  autoApplyCancellations: false,
} as const;
