/**
 * The town pages the hub's search should find, as records for its index.
 *
 * Not a page anyone visits: the indexing step (scripts/lib/search-index.ts)
 * reads this file out of dist/, adds each record to the hub's Pagefind index
 * and deletes it before deploy. See src/lib/network-search.ts for why the
 * hub indexes town content this way.
 *
 * What is included is what each town's own search indexes, decided the same
 * way, so the two cannot disagree about a page:
 * - places through the publish gate, less any it delists (a permanently
 *   closed place keeps its page, noindex, and leaves every search);
 * - every article, and each guide's Moving Here page;
 * - events whose page is indexed: the occurrence of a series a reader could
 *   still attend (pickCanonical, as the event page and sitemap use it), and
 *   not one that is over;
 * - each guide's home, so a search for a town or one of its sub-towns finds
 *   the guide itself.
 */
import type { APIRoute } from 'astro';
import { countyLabel, liveTowns, type TownConfig } from '@/config';
import { getNetworkEntries, type NetworkEntry } from '@/lib/content';
import { dayKey, formatDayLong, formatDayRange, formatMonthDay } from '@/lib/dates';
import { finalDay, isCanceled, isInProgress, isMultiDay, isOver, nextOccurrence } from '@/lib/events';
import { escapeHtml, plainText, recordHtml, type NetworkRecord } from '@/lib/network-search';
import { pickCanonical } from '@/lib/series';
import { subTownList } from '@/lib/sub-towns';
import { EVENT_STATUS_LABELS, PLACE_TYPE_LABELS } from '@/content/schemas';

/**
 * An entry's words: the lines that should come first (a card's summary, an
 * article's excerpt), then its rendered HTML when the loader kept it, else
 * its markdown as text, then any that should come last (a place's tags,
 * there to be found, not to lead an excerpt).
 */
function words(
  first: Array<string | undefined>,
  entry: { body?: string; rendered?: { html?: string } },
  last: Array<string | undefined> = [],
): Pick<NetworkRecord, 'html' | 'text'> {
  const lines = (list: Array<string | undefined>) => list.filter((l): l is string => !!l);
  const html = entry.rendered?.html?.trim();
  if (html) {
    const p = (list: Array<string | undefined>) => lines(list).map((l) => `<p>${escapeHtml(l)}</p>`).join('');
    return { html: p(first) + html + p(last) };
  }
  return { text: [...lines(first), plainText(entry.body ?? ''), ...lines(last)].filter(Boolean).join(' ') };
}

function townRecord(town: TownConfig): NetworkRecord {
  const covers = subTownList(town);
  return {
    url: `https://${town.domain}/`,
    kind: 'Town',
    title: town.siteTitle,
    town: town.name,
    domain: town.domain,
    lead: countyLabel(town),
    text: [town.tagline, town.shortTagline, covers && `Covers ${covers}.`].filter(Boolean).join(' '),
  };
}

function movingRecord(page: NetworkEntry<'pages'>): NetworkRecord {
  const { data, town } = page;
  return {
    url: `https://${town.domain}/moving-here/`,
    kind: 'Moving here',
    title: data.title,
    town: town.name,
    domain: town.domain,
    ...words([data.description], page),
  };
}

function placeRecord(place: NetworkEntry<'places'>): NetworkRecord {
  const { data, town } = place;
  return {
    url: `https://${town.domain}/places/${place.slug}/`,
    kind: 'Place',
    title: data.title,
    town: town.name,
    domain: town.domain,
    lead: [PLACE_TYPE_LABELS[data.type], data.area, data.address].filter(Boolean).join(' · '),
    ...words([data.summary], place, [data.tags.join(', ')]),
  };
}

function articleRecord(article: NetworkEntry<'articles'>): NetworkRecord {
  const { data, town } = article;
  return {
    url: `https://${town.domain}/articles/${article.slug}/`,
    kind: 'Guide',
    title: data.title,
    town: town.name,
    domain: town.domain,
    lead: data.category,
    ...words([data.excerpt], article),
  };
}

function eventRecord(event: NetworkEntry<'events'>): NetworkRecord {
  const { data, town } = event;
  // The day line the event page leads with, from the occurrence a reader can still attend.
  const next = nextOccurrence(event);
  const day = isMultiDay(next)
    ? isInProgress(next) ? `Now through ${formatMonthDay(next.data.end!)}` : formatDayRange(next.data.start, next.data.end!)
    : formatDayLong(next.data.start);
  const status = data.status !== 'scheduled' ? EVENT_STATUS_LABELS[data.status] : undefined;
  return {
    url: `https://${town.domain}/events/${event.slug}/`,
    kind: 'Event',
    title: data.title,
    town: town.name,
    domain: town.domain,
    lead: [status, day, data.venue].filter(Boolean).join(' · '),
    ...words([], event),
  };
}

/** The events whose own page is indexed, per town, as the event page decides it. */
function indexedEvents(events: NetworkEntry<'events'>[]): NetworkEntry<'events'>[] {
  const today = dayKey(new Date());
  const byTown = new Map<string, NetworkEntry<'events'>[]>();
  for (const event of events) byTown.set(event.town.slug, [...(byTown.get(event.town.slug) ?? []), event]);
  const out: NetworkEntry<'events'>[] = [];
  for (const list of byTown.values()) {
    const canonical = pickCanonical(
      list.map((e) => ({ slug: e.slug, key: `${e.data.title}|${e.data.venue}`, startDay: dayKey(e.data.start), lastDay: finalDay(e), canceled: isCanceled(e) })),
      today,
    );
    out.push(...list.filter((e) => canonical.get(`${e.data.title}|${e.data.venue}`) === e.slug && !isOver(e)));
  }
  return out;
}

export const GET: APIRoute = async () => {
  const [pages, places, articles, events] = await Promise.all([
    getNetworkEntries('pages'),
    getNetworkEntries('places'),
    getNetworkEntries('articles'),
    getNetworkEntries('events'),
  ]);
  const records: NetworkRecord[] = [
    ...liveTowns().map(townRecord),
    // The one page in the collection a town routes, at /moving-here/ (src/routes/town/moving-here.astro).
    ...pages.filter((p) => p.slug === 'moving-here').map(movingRecord),
    ...places.filter((p) => !p.delisted).map(placeRecord),
    ...articles.map(articleRecord),
    ...indexedEvents(events).map(eventRecord),
  ];
  return new Response(JSON.stringify(records.map((r) => ({ url: r.url, html: recordHtml(r) }))), {
    headers: { 'Content-Type': 'application/json' },
  });
};
