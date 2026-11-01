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
  status: 'confirmed' | 'cancelled' | 'postponed';
  lastModified?: Date;
}

/**
 * A cancellation or postponement written into the title, which is how
 * CivicPlus and LibCal calendars say it: "Planning Commission Meeting -
 * CANCELED" (Erie, Johnstown), "Canceled-Board of Trustees Work Session"
 * (Frederick), "Cancelled: Storytime" (LibCal), "**CANCELLED** Aly & AJ"
 * (a box office), "Workshop (Postponed)". The word comes off the title and
 * the status carries it, so the item still matches its listing by title
 * and the listing is flagged. Read as part of the title, Erie's canceled
 * 4 November meeting matched its listing and was "unchanged" (1 November
 * 2026). The word has to stand at the start with a separator after it, or
 * at the end after one, or in brackets: "Cancelled Flights, a talk" is a
 * title.
 */
const MARK_START = /^\W*(cancell?ed|postponed)\s*[:\-–—*]+\s*/i;
const MARK_END = /[\s\-–—:]+(cancell?ed|postponed)[\s*!.]*$/i;
const MARK_BRACKET = /\s*[(\[]\s*(cancell?ed|postponed)\s*[)\]]/i;
export function titleStatus(raw: string): { title: string; status?: 'cancelled' | 'postponed' } {
  const m = raw.match(MARK_START) ?? raw.match(MARK_END) ?? raw.match(MARK_BRACKET);
  if (!m) return { title: raw };
  const title = raw.replace(m[0], ' ').replace(/\s+/g, ' ').trim();
  if (!title) return { title: raw };
  return { title, status: /^postponed$/i.test(m[1]!) ? 'postponed' : 'cancelled' };
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
