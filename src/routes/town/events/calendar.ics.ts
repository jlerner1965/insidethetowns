/**
 * /events/calendar.ics — every upcoming event for this town, weekly repeats
 * expanded for the next 120 days, as an iCalendar feed people can subscribe to.
 */
import type { APIRoute } from 'astro';
import { getTown } from '@/config';
import { getTownEntries } from '@/lib/content';
import { occurrences, upcoming } from '@/lib/events';
import { buildIcs, type IcsEvent } from '@/lib/ics';
import { dayKey } from '@/lib/dates';

export const GET: APIRoute = async ({ site }) => {
  const town = getTown();
  const all = occurrences(await getTownEntries('events'), { horizonDays: 120 });
  const list = upcoming(all);
  const events: IcsEvent[] = list.map((e) => {
    const pageUrl = new URL(`/events/${e.slug}/`, site).toString();
    const location = [e.data.venue, e.data.address].filter(Boolean).join(', ');
    const parts = [e.data.timeNote, e.data.cost ? `Cost: ${e.data.cost}` : undefined, e.data.recurring, `More: ${pageUrl}`].filter(Boolean);
    return {
      uid: `${e.slug}-${dayKey(e.data.start)}@${town.domain}`,
      title: e.data.title,
      start: e.data.start,
      end: e.data.end,
      allDay: e.data.allDay,
      location,
      description: parts.join('\n'),
      url: e.data.url ?? pageUrl,
    };
  });
  const body = buildIcs(events, { name: `${town.siteTitle} events`, domain: town.domain });
  return new Response(body, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': `inline; filename="${town.slug}-events.ics"`,
    },
  });
};
