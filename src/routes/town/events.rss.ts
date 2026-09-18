/**
 * /events.rss — what is coming up in this town.
 *
 * Each occurrence is its own item, with a guid that carries the date, because
 * a reader that has already seen "Farmers Market" should still be shown next
 * Saturday's. The page it links to is the event's own, which is where the
 * details live and where a correction would land.
 */
import type { APIRoute } from 'astro';
import { getTown } from '@/config';
import { getTownEntries } from '@/lib/content';
import { occurrences, upcoming } from '@/lib/events';
import { formatDate, formatTimeRange, dayKey } from '@/lib/dates';
import { CATEGORY_LABELS } from '@/content/schemas';
import { buildRss, rssResponse, type FeedItem } from '@/lib/rss';

/**
 * `pubDate` is the day the listing was last checked against its source, not the
 * day the event happens. That is what the element means, and a feed full of
 * future pubDates is one some readers quietly suppress. The date of the event
 * is in the title and the description, where a reader will actually see it.
 *
 * Capped at 50: a feed is a notification, not an archive, and ninety days of
 * Front Range events runs past two hundred items.
 */
const LIMIT = 50;

export const GET: APIRoute = async ({ site }) => {
  const town = getTown();
  const events = upcoming(occurrences(await getTownEntries('events'), { horizonDays: 90 })).slice(0, LIMIT);
  const items: FeedItem[] = events.map((event) => {
    const { data } = event;
    const when = `${formatDate(data.start)}, ${data.timeNote ?? formatTimeRange(data.start, data.end, data.allDay)}`;
    return {
      title: `${data.title} — ${formatDate(data.start)}`,
      link: new URL(`/events/${event.slug}/`, site).toString(),
      guid: `${town.domain}/events/${event.slug}/${dayKey(data.start)}`,
      description: [when, data.venue, data.cost].filter(Boolean).join(' · '),
      pubDate: data.verified ?? data.start,
      categories: [CATEGORY_LABELS[data.category]],
    };
  });
  return rssResponse(
    buildRss({
      title: `${town.siteTitle} — what’s on`,
      description: `Upcoming events in ${town.name}, ${town.state}.`,
      link: new URL('/events/', site).toString(),
      self: new URL('/events.rss', site).toString(),
      items,
    }),
  );
};
