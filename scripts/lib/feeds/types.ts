/**
 * One event as every feed reader hands it on, whatever the feed looked like.
 * Instants, not wall-clock strings: the readers own the time zone arithmetic
 * and the normaliser (scripts/lib/ingest.ts) only formats.
 */
export interface FeedEvent {
  /** The feed's own id for the item; with the occurrence date for a recurring one. */
  uid: string;
  title: string;
  start: Date;
  end?: Date;
  allDay: boolean;
  /** Free text: a room, a venue, an address, or all three. */
  location?: string;
  /** The item's own page. */
  url?: string;
  /** Plain text, the feed's words. */
  description?: string;
  categories: string[];
  cost?: string;
  status: 'confirmed' | 'cancelled';
  lastModified?: Date;
}

export interface Horizon {
  /** Inclusive: an occurrence ending before this is dropped. */
  from: Date;
  /** Exclusive: an occurrence starting at or after this is dropped. */
  to: Date;
}

/** Decode the handful of entities feeds use and strip tags, leaving plain text. */
export function plainText(html: string): string {
  // Feeds often ship HTML inside an escaped string ("&lt;br&gt;"), so decode
  // once, strip the tags that appear, and decode what the tags were hiding.
  return strip(decode(decode(html)));
}

function decode(text: string): string {
  return text
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;|&#8217;/g, '’')
    .replace(/&#8211;/g, '–')
    .replace(/&#8212;/g, '—')
    .replace(/&#(\d+);/g, (_, n: string) => String.fromCodePoint(Number(n)))
    // LibCal writes its HTML with hex entities ("&#x3C;p&#x3E;") and the
    // usual named ones inside them.
    .replace(/&#x([0-9a-f]+);/gi, (_, n: string) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&ndash;/g, '–')
    .replace(/&mdash;/g, '—')
    .replace(/&rsquo;/g, '’')
    .replace(/&lsquo;/g, '‘')
    .replace(/&ldquo;/g, '“')
    .replace(/&rdquo;/g, '”')
    .replace(/&hellip;/g, '…')
    .replace(/&reg;/g, '®')
    .replace(/&amp;/g, '&');
}

function strip(html: string): string {
  return html
    // A literal non-breaking space (U+00A0) is a space to every reader and
    // to the title exclusions: LibCal writes "Ageless\u00a0Grace", and an
    // excluded title must not slip through on the byte.
    .replace(/\u00a0/g, ' ')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|li|h[1-6])>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
