/**
 * The organizer's own page for each date of a listing, where the body lists
 * them.
 *
 * A library or a town calendar gives every session its own page, and a
 * listing that holds several sessions keeps those pages in its body, one
 * line each, in the form the handoffs and the editors write:
 *
 *     - [2026-10-26 at 13:00](https://library.example/event/storytime/2026-10-26/2/)
 *
 * The date is written that way so a machine can read it back: ingest takes
 * each link as the organizer's id for that session (scripts/lib/ingest.ts),
 * and the event page uses the one for the next session as its main link,
 * where the listing's own `url` is the first session's page and that session
 * is over (audit, 26 October 2026: a storytime's button led to its
 * 12 October page). A reader never sees the machine form: the page shows
 * "Mon, Oct 26, 1 pm" (`readableSessionLinks`).
 */
import { dayKey, formatDayShort, formatTime, parseLocal } from './dates.ts';

export interface SessionLink {
  /** The session's start, Denver wall clock; midnight when the link gives only a day. */
  start: Date;
  /** False when the link gives the day alone. */
  timed: boolean;
  url: string;
}

const pad = (t: string) => (t.length === 4 ? `0${t}` : t);

/** The Denver instant a link's text names, or undefined for one that is no date ("2026-02-30", "25:00"). */
function when(day: string, time: string | undefined): Date | undefined {
  try {
    const start = parseLocal(time ? `${day}T${pad(time)}` : day);
    const [h, m] = (time ?? '0:00').split(':').map(Number);
    return dayKey(start) === day && h! < 24 && m! < 60 ? start : undefined;
  } catch {
    return undefined;
  }
}

/** Every `[YYYY-MM-DD at HH:MM](url)` or `[YYYY-MM-DD](url)` link in a Markdown body, in order. */
export function sessionLinks(body: string | undefined): SessionLink[] {
  const out: SessionLink[] = [];
  for (const m of (body ?? '').matchAll(/\[(\d{4}-\d{2}-\d{2})(?: at (\d{1,2}:\d{2}))?\]\((https?:\/\/[^)\s]+)\)/g)) {
    const [, day, time, url] = m;
    const start = when(day!, time);
    if (start) out.push({ start, timed: !!time, url: url! });
  }
  return out;
}

/** "Mon, Oct 26, 1 pm", or "Mon, Oct 26" for a day alone: the page's own form for a session. */
export function sessionLabel(start: Date, timed = true): string {
  return timed ? `${formatDayShort(start)}, ${formatTime(start)}` : formatDayShort(start);
}

/**
 * Rendered HTML with each session link's text, "2026-10-26 at 13:00",
 * replaced by its label in a <time> element. Only a link whose whole text is
 * such a date is touched; a date inside a sentence is the writer's.
 */
export function readableSessionLinks(html: string): string {
  return html.replace(
    /(<a\b[^>]*>)\s*(\d{4}-\d{2}-\d{2})(?: at (\d{1,2}:\d{2}))?\s*(<\/a>)/g,
    (whole, open: string, day: string, time: string | undefined, close: string) => {
      const start = when(day, time);
      if (!start) return whole;
      const datetime = time ? `${day}T${pad(time)}` : day;
      return `${open}<time datetime="${datetime}">${sessionLabel(start, !!time)}</time>${close}`;
    },
  );
}

/**
 * Where the page's main button should go. A listing whose `url` is one of
 * its own session pages points at the page for `next`, the session a reader
 * can still attend, when the body has it; a series page or any other `url`
 * stands, since it is current whichever week it is.
 */
export function organizerLink(url: string | undefined, links: SessionLink[], next: Date): string | undefined {
  const own = (u: string) => links.some((l) => sameUrl(l.url, u));
  if (url && !own(url)) return url;
  const current = links.find((l) => (l.timed ? l.start.getTime() === next.getTime() : dayKey(l.start) === dayKey(next)));
  return current?.url ?? url;
}

/**
 * What one date of a listing with several is called on its page. A play's or
 * a concert's dates are performances; a storytime's, a class's or a club's
 * are sessions (audit, 26 October 2026: "4 performances" of a toddler
 * storytime); a council's are meetings; a market's or a festival's are
 * dates. Read from the category, the one field every listing has: music and
 * arts are where the shows are filed.
 */
export function sittingWord(category: string, count = 2): string {
  const [one, many] =
    category === 'music' || category === 'arts'
      ? ['performance', 'performances']
      : category === 'civic'
        ? ['meeting', 'meetings']
        : category === 'market' || category === 'festival'
          ? ['date', 'dates']
          : ['session', 'sessions'];
  return count === 1 ? one : many;
}

/** Two links to one page: scheme, "www." and a trailing slash aside. */
export function sameUrl(a: string, b: string): boolean {
  return normalizeUrl(a) === normalizeUrl(b);
}

export function normalizeUrl(u: string): string {
  return u.trim().replace(/^https?:\/\/(www\.)?/i, '').replace(/\/+$/, '').replace(/^[^/]+/, (host) => host.toLowerCase());
}
