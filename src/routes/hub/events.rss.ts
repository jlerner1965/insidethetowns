/**
 * /events.rss — everything coming up across all seven guides.
 *
 * The one feed in this network that no single town site can publish, and the
 * one an aggregator covering the northern Front Range would actually want.
 * Each item links to the town site that owns it.
 */
import type { APIRoute } from 'astro';
import { getHub } from '@/config';
import { getNetworkEntries } from '@/lib/content';
import { occurrences, upcoming } from '@/lib/events';
import { formatDate, formatTimeRange, dayKey } from '@/lib/dates';
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
  const hub = getHub();
  const events = upcoming(occurrences(await getNetworkEntries('events'), { horizonDays: 60 })).slice(0, LIMIT);
  const items: FeedItem[] = events.map((event) => {
    const { data, town } = event;
    const when = `${formatDate(data.start)}, ${data.timeNote ?? formatTimeRange(data.start, data.end, data.allDay)}`;
    return {
      title: `${data.title} — ${town.name}, ${formatDate(data.start)}`,
      link: `https://${town.domain}/events/${event.slug}/`,
      guid: `${town.domain}/events/${event.slug}/${dayKey(data.start)}`,
      description: [when, data.venue, data.cost].filter(Boolean).join(' · '),
      pubDate: data.verified ?? data.start,
      categories: [town.name],
    };
  });
  return rssResponse(
    buildRss({
      title: `${hub.siteTitle} — what’s on across the Front Range`,
      description: 'Every event across the Inside the Towns guides.',
      link: new URL('/this-weekend/', site).toString(),
      self: new URL('/events.rss', site).toString(),
      items,
    }),
  );
};
