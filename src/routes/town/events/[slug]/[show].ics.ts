/**
 * /events/<slug>/<show>.ics — one show of a production, for "add to my calendar".
 *
 * A reader goes to Saturday's matinee, not to the run, so each show a
 * production lists gets a file of its own, named by its key
 * ("20261017T1300"). It carries the UID the feed gives that show.
 */
import type { APIRoute } from 'astro';
import { getTown } from '@/config';
import { getTownEntries, type TownEntry } from '@/lib/content';
import { exportWhen, occurrences } from '@/lib/events';
import { buildIcs, occurrenceUid, showKey } from '@/lib/ics';

export async function getStaticPaths() {
  const events = await getTownEntries('events');
  return events
    .filter((event) => event.data.performances)
    .flatMap((event) =>
      occurrences([event], { now: event.data.start, horizonDays: 800 }).map((show) => ({
        params: { slug: event.slug, show: showKey(show.data.start) },
        props: { event, show },
      })),
    );
}

export const GET: APIRoute = async ({ props, params, site }) => {
  const town = getTown();
  const { event, show } = props as { event: TownEntry<'events'>; show: TownEntry<'events'> };
  const { data } = show;
  const pageUrl = new URL(`/events/${event.slug}/`, site).toString();
  const body = buildIcs(
    [
      {
        uid: occurrenceUid(event.slug, data, town.domain),
        title: data.title,
        ...exportWhen(show),
        location: [data.venue, data.address, `${town.name}, CO`].filter(Boolean).join(', '),
        description: [data.timeNote, data.cost ? `Cost: ${data.cost}` : undefined, `More: ${pageUrl}`].filter(Boolean).join('\n'),
        url: data.url ?? pageUrl,
      },
    ],
    { name: `${data.title} — ${town.siteTitle}`, domain: town.domain },
  );
  return new Response(body, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': `attachment; filename="${event.slug}-${params.show}.ics"`,
    },
  });
};
