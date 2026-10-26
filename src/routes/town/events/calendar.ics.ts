/**
 * /events/calendar.ics — every upcoming occurrence for this town for the next
 * 120 days, as an iCalendar feed people can subscribe to: weekly repeats and
 * productions expanded, a scheduled run on its open days only. The rows are
 * `feedEvents` (src/lib/ics.ts), from the same `occurrences` the pages read.
 */
import type { APIRoute } from 'astro';
import { getTown } from '@/config';
import { getTownEntries } from '@/lib/content';
import { buildIcs, feedEvents } from '@/lib/ics';

export const GET: APIRoute = async ({ site }) => {
  const town = getTown();
  const events = feedEvents(await getTownEntries('events'), { site: site!, domain: town.domain });
  const body = buildIcs(events, { name: `${town.siteTitle} events`, domain: town.domain });
  return new Response(body, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': `inline; filename="${town.slug}-events.ics"`,
    },
  });
};
