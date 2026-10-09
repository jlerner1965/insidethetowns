/**
 * /events/<slug>.ics — one event, for "add to my calendar".
 *
 * The feed at /events/calendar.ics is a subscription to everything; this is
 * the single entry a reader wants when one listing is the one they care
 * about. It carries the same UID the feed gives that occurrence, so a reader
 * who has both does not get the event twice.
 */
import type { APIRoute } from 'astro';
import { getTown } from '@/config';
import { getTownEntries, type TownEntry } from '@/lib/content';
import { exportWhen, nextOccurrence } from '@/lib/events';
import { buildIcs, occurrenceUid } from '@/lib/ics';

export async function getStaticPaths() {
  const events = await getTownEntries('events');
  return events.map((event) => ({ params: { slug: event.slug }, props: { event } }));
}

export const GET: APIRoute = async ({ props, site }) => {
  const town = getTown();
  const event = props.event as TownEntry<'events'>;
  const next = nextOccurrence(event);
  const { data } = next;
  const pageUrl = new URL(`/events/${event.slug}/`, site).toString();
  const body = buildIcs(
    [
      {
        uid: occurrenceUid(event.slug, data, town.domain),
        title: data.title,
        ...exportWhen(next),
        location: [data.venue, data.address, `${town.name}, CO`].filter(Boolean).join(', '),
        description: [data.timeNote, data.cost ? `Cost: ${data.cost}` : undefined, data.recurring, `More: ${pageUrl}`]
          .filter(Boolean)
          .join('\n'),
        url: data.url ?? pageUrl,
      },
    ],
    { name: `${data.title} — ${town.siteTitle}`, domain: town.domain },
  );
  return new Response(body, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': `attachment; filename="${event.slug}.ics"`,
    },
  });
};
