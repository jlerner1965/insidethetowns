/**
 * JSON-LD builders. Keep these pure so they are easy to eyeball in tests.
 */
import { hhmm, hoursWithMeridiem, openingHoursOf, parseOpeningHours } from './hours.ts';
import { namesTown } from './titles.ts';
import type { CollectionEntry } from 'astro:content';
// Relative rather than the '@/…' alias so the module loads in plain Node and
// its builders can be unit-tested; Vite resolves both the same way.
import { getNetworkHub, liveTowns, type SiteConfig, type TownConfig } from '../config/index.ts';
import { dayKey, toIsoLocal } from './dates.ts';
import { exportWhen } from './events.ts';
import { isPlaceholder } from './editor.ts';
import { addFirstFitting, clampAtWord, clampText, firstSentence, listWords, markdownToText, sentences } from './plain-text.ts';

/**
 * An Event's `description`: the listing's words as plain text, cut at a
 * sentence or a word. Markdown first becomes text (src/lib/plain-text.ts),
 * so no link, URL or emphasis mark is cut in half. Nothing when the body
 * has no words. Google asks for the event's details and not the date or
 * place again, which have properties of their own; the body is the page's
 * own description of the event, the words a reader sees under its facts.
 */
export const EVENT_DESCRIPTION_LIMIT = 300;
export function eventDescription(body: string | undefined, limit = EVENT_DESCRIPTION_LIMIT): string | undefined {
  const text = clampText(markdownToText(body), limit);
  return text || undefined;
}

/**
 * An event page's meta description: the particulars a searcher needs (the
 * day, the time, the venue and the town, as the page builds them), then
 * the body's first sentence, within the snippet's budget.
 *
 * The page used to hand SEO.astro the two joined and let its clamp cut
 * them, and the clamp cuts at the last sentence end past half the budget,
 * which for a long lead ("Monday, November 2, 1 pm – 2 pm at Glenn A.
 * Jones, M.D. Memorial Library, Johnstown.") is the lead's own full stop:
 * the description was the date and the venue and nothing about the event.
 * So the sentence is cut here, at a word, to what the lead leaves room
 * for; it goes only when the lead leaves no room for a few words of it. A
 * body sentence too short to say anything (under 30 characters, as
 * before) is left off. Nothing when the lead itself is over the budget
 * but what the clamp allows.
 */
export const META_DESCRIPTION_LIMIT = 155;
export function eventPageDescription(lead: string, body: string | undefined, limit = META_DESCRIPTION_LIMIT): string {
  const flatLead = lead.replace(/\s+/g, ' ').trim();
  const sentence = firstSentence(markdownToText(body));
  if (sentence.length <= 30) return clampText(flatLead, limit);
  const whole = `${flatLead} ${sentence}`;
  if (whole.length <= limit) return whole;
  const room = limit - flatLead.length - 1;
  if (room < 16) return clampText(flatLead, limit);
  return `${flatLead} ${clampText(sentence, room)}`;
}

/**
 * The shortest meta description a page should carry. Bing Webmaster Tools
 * flags descriptions as "too short" and asks for more context (Berthoud,
 * 5 November 2026); it publishes no figure, and around 120 characters is
 * the one most often given. Google's snippet runs to about 155, so a page
 * aims between the two.
 */
export const META_DESCRIPTION_MIN = 120;

/**
 * A description under the minimum, given one more sentence: the first of
 * `extras` that fits in the budget. A description already long enough is
 * left as it is, so this only ever adds to the short ones, and only with
 * what the caller knows the page shows.
 *
 * The base is cut to the budget first, as SEO.astro would cut it. A
 * summary of 186 characters is cut at its last full stop inside 155,
 * which can be its first sentence and 81 characters (Rock Cut Brewing,
 * Estes Park), and a description that long was never filled; it is the
 * cut that has to be filled (all-sites check, 5 November 2026).
 */
export function fillDescription(
  base: string,
  extras: ReadonlyArray<string | undefined>,
  limit = META_DESCRIPTION_LIMIT,
  min = META_DESCRIPTION_MIN,
): string {
  const cut = clampText(base, limit);
  if (cut.length >= min) return cut;
  return addFirstFitting(cut, extras, limit);
}

/**
 * Like fillDescription, but the sentences add up: each in turn goes on
 * while the description is still short and the sentence fits. For pages
 * with several true things to say and no one of them long enough alone.
 */
export function topUpDescription(
  base: string,
  sentences: ReadonlyArray<string | ReadonlyArray<string | undefined> | undefined>,
  limit = META_DESCRIPTION_LIMIT,
  min = META_DESCRIPTION_MIN,
): string {
  let out = clampText(base, limit);
  for (const sentence of sentences) {
    if (out.length >= min) break;
    // A slot may offer a longer and a shorter wording: the first that fits.
    out = addFirstFitting(out, typeof sentence === 'string' || sentence === undefined ? [sentence] : sentence, limit);
  }
  return out;
}

/**
 * An event page's meta description, where the particulars and the body's
 * first sentence leave it short. A listing with no body (a theatre's
 * calendar entry: "Friday, November 27, 9 pm at Aggie Theatre, Fort
 * Collins.", 57 characters) never said what the event was. So: the body's
 * next sentence; the event's name, where the description does not have
 * it; and what the page offers besides, as it offers them (Directions
 * where the listing has an address; the calendar links unless the event
 * is called off or postponed).
 */
export function eventMetaDescription(
  event: { title: string; lead: string; body: string | undefined; directions: boolean; calendar: boolean },
  limit = META_DESCRIPTION_LIMIT,
): string {
  const base = eventPageDescription(event.lead, event.body, limit);
  const text = markdownToText(event.body);
  const first = firstSentence(text);
  const second = firstSentence(text.slice(first.length).trim());
  const named = base.toLowerCase().includes(event.title.toLowerCase());
  return topUpDescription(
    base,
    [
      base.includes(first) && second.length > 30 ? second : undefined,
      named ? undefined : `${event.title.replace(/[.!?]+$/, '')}.`,
      [
        event.directions && event.calendar ? 'Directions, and a link to add it to your calendar.' : undefined,
        event.calendar ? 'Add it to your calendar.' : undefined,
        event.directions ? 'Directions to the venue.' : undefined,
      ],
      // Every published listing has a source it was read against (the validator holds back one without).
      'Checked against its source.',
    ],
    limit,
  );
}

/**
 * An article's excerpt, or a page's own description line, as the meta
 * description: its sentences in order, as many as fit the budget. The
 * clamp in SEO.astro cuts at the last sentence that ends past half the
 * budget, and an excerpt written as one short sentence and one long one
 * ("McIntosh Lake is free, has a 3.5-mile loop and takes carry-in boats
 * but no swimmers." and then 132 characters on Union) was cut to the
 * short one, 84 characters, on seven articles across the network (all-
 * sites check, 5 November 2026). Where whole sentences still leave it
 * under the floor, the excerpt is cut at a word with an ellipsis instead:
 * more of the page's own words, which is what the floor is for. An
 * excerpt within the budget is used whole, whatever its length.
 */
export function excerptDescription(text: string, limit = META_DESCRIPTION_LIMIT, min = META_DESCRIPTION_MIN): string {
  const flat = markdownToText(text);
  if (flat.length <= limit) return flat;
  let out = '';
  for (const s of sentences(flat)) {
    const next = out ? `${out} ${s}` : s;
    if (next.length > limit) break;
    out = next;
  }
  return out.length >= min ? out : clampAtWord(flat, limit);
}

/**
 * A place page's meta description: one complete sentence, within the
 * snippet's budget, that leads with the practical fact and promises only
 * what the page shows (the Berthoud owner's brief, 6 November 2026). Until
 * then it was the listing's summary and then a list: "Chinese takeout on
 * Welch Avenue: the standard menu, done quickly, a few tables inside. Happy
 * Eating Asian Cafe in Berthoud, CO: address, hours, phone and
 * directions.", two fragments and the hours themselves nowhere.
 *
 * In order, the first that fits:
 * - a closed place says so first, and that the page keeps what is known;
 * - with the hours printed on the page (not hidden for age or season), the
 *   hours: "Happy Eating Asian Cafe in Berthoud, CO is open Mon, Wed 10:30
 *   am–9:30 pm, Thu–Sun 10:30 am–10:30 pm, closed Tue", with am and pm on
 *   every time as the page prints them (hoursWithMeridiem);
 * - else what is there, read off the summary's own "with" clause: "Pioneer
 *   Park in Berthoud, CO has a playground, a basketball court, a roller
 *   hockey rink, a fishing pond and three large picnic pavilions";
 * - else the summary as a predicate, where it begins with an article:
 *   "Waggener Farm Park in Berthoud, CO is the big park on the north side:
 *   farm-themed playground, ...";
 * - else only what the page gives.
 * Then, while there is room, what else the page has (", with the menu,
 * the address and directions on this page"), the menu, the pool schedule
 * and the prices before the address and the phone; a shorter list where
 * the whole does not fit, none where nothing fits. A name that carries the
 * town's ("Berthoud Town Park") is not placed in it again (namesTown).
 */
export interface PlaceDescriptionFacts {
  title: string;
  summary: string;
  /** "Temporarily closed", "Permanently closed": said first. */
  status?: string;
  address?: string;
  phone?: string;
  url?: string;
  /** Whether the page prints the hours; false when they are hidden for age or season. */
  hoursShown: boolean;
  /** The hours line as the listing carries it, used only when `hoursShown`. */
  hours?: string;
  menu?: boolean;
  poolSchedule?: boolean;
  dayPassPrices?: boolean;
  trailMap?: boolean;
}

export function placeDescription(place: PlaceDescriptionFacts, town: { name: string; state: string }, limit = META_DESCRIPTION_LIMIT): string {
  const subject = namesTown(place.title, town.name) ? place.title : `${place.title} in ${town.name}, ${town.state}`;
  const features = [
    place.menu ? 'the menu' : undefined,
    place.poolSchedule ? 'the pool schedule' : undefined,
    place.dayPassPrices ? 'day pass prices' : undefined,
    place.trailMap ? 'a trail map' : undefined,
    place.address ? 'the address' : undefined,
    place.phone ? 'phone' : undefined,
    place.url ? 'website' : undefined,
    'directions',
  ].filter((f): f is string => !!f);
  // A lead that runs long loses the last of its list, at a comma, and the
  // one before it takes "and": a whole sentence, not a cut one.
  // Only the words after the subject are a list: "Old Town Square in Fort
  // Collins, CO" has a comma of its own, and a shortened lead used to join
  // across it ("in Fort Collins and CO is the pedestrian plaza", on sixteen
  // live pages; the sweep of 10 November 2026).
  const shorten = (lead: string): string | undefined => {
    const head = lead.startsWith(subject) ? subject : '';
    const items = lead.slice(head.length).split(/,\s+/);
    while (lead.length + 1 > limit && items.length > 2) {
      items.pop();
      const last = items[items.length - 1]!;
      lead = `${head}${items.slice(0, -1).join(', ')}${/^and\s/.test(last) ? ', ' : ' and '}${last}`;
    }
    return lead.length + 1 <= limit ? lead : undefined;
  };
  // The lead, then as many of the page's offerings as fit after it.
  const withFeatures = (long: string): string | undefined => {
    const lead = shorten(long);
    if (!lead) return undefined;
    for (let n = features.length; n >= 1; n--) {
      const line = `${lead}, with ${listWords(features.slice(0, n))} on this page.`;
      if (line.length <= limit) return line;
    }
    return `${lead}.`;
  };
  if (place.status) {
    return clampText(`${subject} is ${place.status.toLowerCase()}; this page keeps the address and what is known about it.`, limit);
  }
  if (place.hoursShown && place.hours) {
    const line = hoursWithMeridiem(place.hours).replace(/;\s*/g, ', ').replace(/[.\s]+$/, '');
    // The hours are not shortened: a day dropped is an hour not stated.
    const lead = `${subject} is open ${line}`;
    if (lead.length + 1 <= limit) return withFeatures(lead)!;
  }
  const first = firstSentence(markdownToText(place.summary)).replace(/[.!?]+$/, '');
  // "Neighborhood park on Indiana Avenue with a playground, …": the clause after the first "with".
  const clause = first.match(/^(.{12,}?),?\s+with\s+(.{20,})$/i);
  if (clause) {
    const out = withFeatures(`${subject} has ${clause[2]}`);
    if (out) return out;
  }
  if (/^(the|a|an|this)\s/i.test(first)) {
    const out = withFeatures(`${subject} is ${first.charAt(0).toLowerCase()}${first.slice(1)}`);
    if (out) return out;
  }
  return withFeatures(`${subject} is listed here`) ?? clampText(`${subject}.`, limit);
}

/**
 * A list page's meta description (/parks/, /trails/, /guides/), where the
 * count and the kind leave it short: some of the names on the list, as
 * many as fit, in the list's own order.
 */
export function listDescription(base: string, names: readonly string[], limit = META_DESCRIPTION_LIMIT): string {
  const cut = clampText(base, limit);
  // Names in the list's order, skipping one too long to fit beside the rest.
  const chosen: string[] = [];
  for (const name of names.slice(0, 12)) {
    if (chosen.length === 5) break;
    if (`${cut} Including ${listWords([...chosen, name])}.`.length <= limit) chosen.push(name);
  }
  return fillDescription(cut, [chosen.length ? `Including ${listWords(chosen)}.` : undefined], limit);
}

/** An image as the build knows it: Astro's ImageMetadata has these three. */
export interface ImageCandidate {
  src: string;
  width: number;
  height: number;
}

/** Google's floor for an event image: 720 pixels wide and 50,000 pixels in all. */
export const EVENT_IMAGE_MIN_WIDTH = 720;
const EVENT_IMAGE_MIN_PIXELS = 50_000;

/**
 * The picture an Event's structured data may carry, or none.
 *
 * Google: "Images must represent the marked up content." The town's hero
 * (a view of Main Street, a reservoir at dusk) went on every event without
 * a picture of its own, 960 of them (10 October 2026), which is scenery,
 * not the trivia night. So: the listing's own picture; else the photograph
 * on the venue's own listing in the guide when the venue is a building,
 * the room the event is in (the library, the theatre, the taproom: a
 * venue, restaurant, bar, coffee house, shop, lodging or service), matched
 * by the page on the venue's exact name; else nothing. A park's, a
 * trail's or a trailhead's photograph is landscape, the same fault as the
 * hero: Berthoud Town Park's is its playground, which says nothing about
 * the Oktoberfest held there. The property is recommended, not required,
 * and an Event without one is still an Event. A picture under Google's
 * floor (720 wide, 50,000 pixels) is left out rather than sent to be
 * refused. The share card (og:image) keeps its own fallback to the hero;
 * that is a link preview, not a claim about the event.
 */
const OUTDOOR_PLACES: ReadonlySet<string> = new Set(['park', 'trail', 'trailhead']);
export function eventImage<T extends ImageCandidate>(
  own: T | undefined,
  venue: { image?: T; type: string } | undefined,
): T | undefined {
  const fits = (i: T | undefined): i is T =>
    !!i && i.width >= EVENT_IMAGE_MIN_WIDTH && i.width * i.height >= EVENT_IMAGE_MIN_PIXELS;
  if (fits(own)) return own;
  if (venue && !OUTDOOR_PLACES.has(venue.type) && fits(venue.image)) return venue.image;
  return undefined;
}

/**
 * The publisher graph: who runs this site, and how the domains relate.
 *
 * Separate domains look to a search engine like strangers. The
 * towns declare the hub as their `parentOrganization` and the hub declares
 * them as its `subOrganization`, and that reciprocal pair is what says one
 * publisher rather than a ring of sites linking to each other.
 *
 * At the top of the graph, when the hub config names one, is the publisher
 * (Lerner Works): the hub's `parentOrganization`, so every town leads to
 * the hub and the hub leads to the organisation accountable for it.
 *
 * `logo` is the 180-pixel PNG of the mark every site serves at
 * /apple-touch-icon.png (src/pages/apple-touch-icon.png.ts): a PNG of at
 * least 112 pixels, which is what Google asks of an Organization's logo.
 * It was left out while the only mark was the SVG favicon; the Search
 * Console read of every live site flagged the gap on every page (5
 * November 2026).
 */
export function siteJsonLd(site: SiteConfig) {
  const url = `https://${site.domain}/`;
  const hubUrl = `https://${getNetworkHub().domain}/`;
  const publisher = getNetworkHub().publisher;
  const logo = { '@type': 'ImageObject', url: `${url}apple-touch-icon.png`, width: 180, height: 180 };
  const organization =
    site.kind === 'hub'
      ? {
          '@type': 'Organization',
          '@id': `${url}#org`,
          name: site.siteTitle,
          url,
          description: site.tagline,
          logo,
          ...(publisher ? { parentOrganization: { '@type': 'Organization', name: publisher.name, url: publisher.url } } : {}),
          subOrganization: liveTowns().map((t) => ({
            '@type': 'Organization',
            '@id': `https://${t.domain}/#org`,
            name: t.siteTitle,
            url: `https://${t.domain}/`,
          })),
        }
      : {
          '@type': 'Organization',
          '@id': `${url}#org`,
          name: site.siteTitle,
          url,
          description: site.tagline,
          logo,
          parentOrganization: {
            '@type': 'Organization',
            '@id': `${hubUrl}#org`,
            name: getNetworkHub().siteTitle,
            url: hubUrl,
          },
          areaServed: {
            '@type': 'City',
            name: site.name,
            addressRegion: site.state,
            addressCountry: 'US',
          },
        };
  return {
    '@context': 'https://schema.org',
    '@graph': [
      organization,
      {
        '@type': 'WebSite',
        '@id': `${url}#website`,
        url,
        name: site.siteTitle,
        description: site.tagline,
        publisher: { '@id': `${url}#org` },
        inLanguage: 'en-US',
      },
    ],
  };
}

/**
 * A structured price from a listing's cost line, where one can be read off
 * without guessing. "Free" (and "Free; registration required") is a price
 * of zero. One dollar figure is the price. Several ("$15; seniors $13;
 * under 18 $5", "$40–$98") are a range, lowest to highest, and a tier that
 * is free puts zero at the bottom of it. A line with no figure ("Ticketed",
 * "Tickets from the Rams ticket office") gets no number: the words go in
 * the offer's description either way, so nothing the listing says is lost.
 *
 * Google reads `price` and `priceCurrency` on an Event's offer; a text
 * description alone is not a price to it (follow-up audit, 8 October 2026).
 *
 * A figure that is not a ticket is not a tier. "$30 adults, $25 seniors, $20
 * students, plus a $2 ticketing fee" was published as $2 to $30, so the
 * structured data offered a $2 seat that does not exist (fresh audit, 9
 * October 2026). Anything added on with "plus", a ticketing, service or
 * processing fee, and a suggested donation are dropped before the range is
 * read. A donation is asked, not charged, so a line that names only one is
 * free to get into. An entry or registration fee is the price, and stays.
 */
const SURCHARGE =
  /\bplus\s+(?:an?\s+)?\$\s?\d+(?:\.\d{1,2})?(?:\s+[a-z-]+){0,2}|\$\s?\d+(?:\.\d{1,2})?\s+(?:[a-z-]+\s+)?(?:ticketing|service|processing|booking|convenience|handling|transaction|facility)\s+fees?\b/gi;
const DONATION = /\$\s?\d+(?:\.\d{1,2})?\s+(?:suggested\s+)?donations?\b|\bsuggested\s+donation(?:\s+of)?\s+\$\s?\d+(?:\.\d{1,2})?/gi;

export function offerPrice(
  cost: string,
): { price: string; priceCurrency: 'USD' } | { lowPrice: string; highPrice: string; priceCurrency: 'USD' } | undefined {
  const text = cost.trim();
  if (/^free\b/i.test(text)) return { price: '0', priceCurrency: 'USD' };
  const charged = text.replace(SURCHARGE, ' ');
  const admission = charged.replace(DONATION, ' ');
  const amounts = [...admission.matchAll(/\$\s?(\d+(?:\.\d{1,2})?)/g)].map((m) => Number(m[1]));
  // A suggested-donation figure and nothing else: free to get into.
  if (/\bfree\b/i.test(admission) || (amounts.length === 0 && admission !== charged)) amounts.push(0);
  if (amounts.length === 0) return undefined;
  const low = Math.min(...amounts);
  const high = Math.max(...amounts);
  const money = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(2));
  if (low === high) return { price: money(low), priceCurrency: 'USD' };
  return { lowPrice: money(low), highPrice: money(high), priceCurrency: 'USD' };
}

/**
 * A listing's address line as a PostalAddress, in its parts.
 *
 * Listings write the address the way a reader copies it, "333 E. Wonderview
 * Avenue, Estes Park, CO 80517", and the whole line used to go into
 * `streetAddress`: the town and state said twice, and the ZIP with no field
 * of its own (Search Console, 10 October 2026). A line that ends in a town
 * and the state, with or without a ZIP, is split there. Anything else, a bare
 * street or directions ("Colorado Highway 7, 5.8 miles south of Estes Park"),
 * is the street line as written, in the guide's own town.
 */
/**
 * The town a place is in, for its title and its description: its section's
 * on a guide that covers several (`subTown`), else the town its own address
 * names ("2989 S State Highway 83, Franktown, CO 80116"), else the guide's.
 * The structured data already read the address this way; the title and the
 * description said "in Windsor, CO" of every Severance listing, "in
 * Frederick, CO" of seven in Firestone and "in Castle Rock, CO" of
 * Castlewood Canyon, 27 pages in all (the sweep of 10 November 2026).
 */
export function placeLocality(place: { address?: string; subTown?: string }, town: { name: string; state: string }, subTownName?: (slug: string) => string): string {
  if (place.subTown && subTownName) return subTownName(place.subTown);
  return postalAddress(place.address, town).addressLocality;
}

export function postalAddress(address: string | undefined, town: { name: string; state: string }) {
  const parts = address?.match(/^(.+),\s*([A-Za-z][A-Za-z .'-]*),\s*(?:CO|Colorado),?(?:\s+(\d{5}(?:-\d{4})?))?\s*$/);
  if (parts) {
    return {
      '@type': 'PostalAddress',
      streetAddress: parts[1]!.trim(),
      addressLocality: parts[2]!.trim(),
      addressRegion: town.state,
      ...(parts[3] ? { postalCode: parts[3] } : {}),
    };
  }
  return {
    '@type': 'PostalAddress',
    ...(address ? { streetAddress: address } : {}),
    addressLocality: town.name,
    addressRegion: town.state,
  };
}

export function eventJsonLd(
  town: TownConfig,
  event: CollectionEntry<'events'>,
  url: string,
  imageUrl?: string,
  /** The organizer's site from its own listing in the guide, for when the event does not give one. */
  listedOrganizerUrl?: string,
) {
  const { data } = event;
  // As the .ics and the Google link give it: whole days by date alone, one
  // sitting by its times, and no end the listing does not have.
  const when = exportWhen(event);
  const stamp = (d: Date) => (when.allDay ? dayKey(d) : toIsoLocal(d));
  const organizerUrl = data.organizerUrl ?? listedOrganizerUrl;
  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: data.title,
    startDate: stamp(when.start),
    ...(when.end ? { endDate: stamp(when.end) } : {}),
    eventStatus:
      data.status === 'canceled'
        ? 'https://schema.org/EventCancelled'
        : data.status === 'postponed'
          ? 'https://schema.org/EventPostponed'
          : 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    location: {
      '@type': 'Place',
      name: data.venue,
      address: postalAddress(data.address, town),
    },
    ...(imageUrl ? { image: [imageUrl] } : {}),
    // Only when the listing records who is running it. The venue is not
    // evidence of the organiser, so an unset field emits nothing rather than
    // a guess dressed as structured data.
    //
    // The site is the listing's own, or else the one on the organiser's own
    // listing in the guide (the library's events, the library's site). Not
    // the `source`: that is often a box office or a chamber calendar, and a
    // missing url is better than a wrong one.
    ...(data.organizer
      ? {
          organizer: {
            '@type': 'Organization',
            name: data.organizer,
            ...(organizerUrl ? { url: organizerUrl } : {}),
          },
        }
      : {}),
    ...(data.performers
      ? {
          performer: data.performers.map((p) => ({
            '@type': p.kind === 'person' ? 'Person' : 'PerformingGroup',
            name: p.name,
          })),
        }
      : {}),
    ...(eventDescription(event.body) ? { description: eventDescription(event.body) } : {}),
    url,
    ...(data.cost ? { offers: offer(data.cost, data.url ?? url) } : {}),
  };
}

/** The offer: the cost line as written, and a number where one can be read from it. */
function offer(cost: string, url: string) {
  const price = offerPrice(cost);
  return {
    '@type': price && 'lowPrice' in price ? 'AggregateOffer' : 'Offer',
    url,
    description: cost,
    ...price,
  };
}

/**
 * A listing page — what is on, where to eat, what to do — as a CollectionPage.
 *
 * These pages had no markup of their own at all: they inherited the site's
 * Organization and WebSite from the layout and said nothing about themselves.
 * CollectionPage is what they actually are, and `isPartOf` pointing at the
 * site's WebSite node is the property that ties a page to its publication —
 * which is the relationship the network needs stated, town by town.
 *
 * `mainEntity` carries the list itself, capped, so the markup describes what
 * is on the page rather than asserting a catalogue that is not there. Pass
 * nothing and the property is left off rather than declaring an empty list.
 */
/** Enough to describe the page without shipping a kilobyte of markup. */
const LIST_CAP = 50;

export function collectionPageJsonLd(
  site: SiteConfig,
  page: {
    name: string;
    description: string;
    path: string;
    /** `path` is relative to this site; `url` is absolute, for the hub linking across domains. */
    items?: Array<{ name: string; path?: string; url?: string }>;
    /** When the page's data last changed: the sports pages' run (`generated`). Nothing when unknown. */
    updated?: Date;
  },
) {
  const url = `https://${site.domain}/`;
  const items = page.items ?? [];
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${url}${page.path.replace(/^\//, '')}#page`,
    url: `${url}${page.path.replace(/^\//, '')}`,
    name: page.name,
    description: page.description,
    isPartOf: { '@id': `${url}#website` },
    inLanguage: 'en-US',
    ...(page.updated && !Number.isNaN(page.updated.getTime()) ? { dateModified: toIsoLocal(page.updated) } : {}),
    ...(items.length > 0 && {
      mainEntity: {
        '@type': 'ItemList',
        // What the list actually enumerates, not what the page holds: claiming
        // 169 items and shipping 50 is a catalogue that is not there.
        numberOfItems: Math.min(items.length, LIST_CAP),
        itemListElement: items.slice(0, LIST_CAP).map((item, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: item.name,
          url: item.url ?? `https://${site.domain}${item.path}`,
        })),
      },
    }),
  };
}

export function breadcrumbJsonLd(site: SiteConfig, trail: Array<{ name: string; path: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((step, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: step.name,
      item: `https://${site.domain}${step.path}`,
    })),
  };
}

export function articleJsonLd(
  site: SiteConfig,
  article: CollectionEntry<'articles'>,
  url: string,
  imageUrl?: string,
) {
  const { data } = article;
  const editor = getNetworkHub().editor;
  // A placeholder name is not a person to assert; the organisation stays the author.
  const person = editor && !isPlaceholder(editor.name) ? editor : undefined;
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: data.title,
    description: data.excerpt,
    datePublished: toIsoLocal(data.date),
    // The day the article last changed: an edit, or else the day its facts
    // were last re-checked and the check line on the page moved. A check
    // that confirms every fact still changes the page (search-visibility
    // phase 1, 15 October 2026). Nothing when neither has happened.
    ...(articleModified(data) ? { dateModified: toIsoLocal(articleModified(data)!) } : {}),
    ...(imageUrl ? { image: [imageUrl] } : {}),
    articleSection: data.category,
    isPartOf: { '@id': `https://${site.domain}/#website` },
    /*
     * A named person when the network has one configured, the publication
     * itself otherwise. Both are valid; the difference is that a reader and a
     * search engine can see who stands behind the piece. Never invented — if
     * no editor is set, this stays with the organisation rather than
     * attributing the work to a name nobody chose.
     */
    author: person
      ? { '@type': 'Person', name: person.name, ...(person.url ? { url: person.url } : {}) }
      : { '@id': `https://${site.domain}/#org` },
    publisher: { '@id': `https://${site.domain}/#org` },
    mainEntityOfPage: url,
    url,
  };
}

/**
 * When an article last changed, for `dateModified`: the later of its
 * `updated` and `verified` dates, or nothing when it has neither.
 */
export function articleModified(data: { updated?: Date; verified?: Date }): Date | undefined {
  const dates = [data.updated, data.verified].filter((d): d is Date => d instanceof Date);
  if (dates.length === 0) return undefined;
  return dates.reduce((a, b) => (b.getTime() > a.getTime() ? b : a));
}

/**
 * A free-form page (the Moving Here guide) as a WebPage, with the day it
 * was last updated. These pages carried only the site's Organization and
 * WebSite, so a search engine saw a long guide with no date and no stated
 * place in the publication. `isPartOf` ties it to the site's WebSite node,
 * as the collection pages do.
 */
export function webPageJsonLd(
  site: SiteConfig,
  page: { name: string; description: string; path: string; updated?: Date },
) {
  const url = `https://${site.domain}/`;
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${url}${page.path.replace(/^\//, '')}#page`,
    url: `${url}${page.path.replace(/^\//, '')}`,
    name: page.name,
    description: page.description,
    isPartOf: { '@id': `${url}#website` },
    publisher: { '@id': `${url}#org` },
    inLanguage: 'en-US',
    ...(page.updated ? { dateModified: toIsoLocal(page.updated) } : {}),
  };
}

/**
 * The schema.org type a listing's `type` maps to. A venue is told apart by
 * its tags (6 November 2026): a library, a town hall and a recreation
 * center are not event venues to a search engine, and the types it does
 * read (Library, GovernmentOffice, SportsActivityLocation) are what put
 * "Berthoud Recreation Center hours" in a result with the hours on it.
 * A venue with none of those tags stays an EventVenue, as before.
 */
export function placeSchemaType(type: string, tags: readonly string[] = []): string {
  const typeMap: Record<string, string> = {
    restaurant: 'Restaurant',
    bar: 'BarOrPub',
    coffee: 'CafeOrCoffeeShop',
    shop: 'Store',
    lodging: 'LodgingBusiness',
    park: 'Park',
    trail: 'TouristAttraction',
    trailhead: 'TouristAttraction',
    venue: 'EventVenue',
    service: 'LocalBusiness',
  };
  if (type === 'venue') {
    const has = (word: string) => tags.some((t) => t.toLowerCase() === word);
    if (has('library')) return 'Library';
    if (has('government')) return 'GovernmentOffice';
    if (['pool', 'gym', 'recreation', 'fitness', 'climbing wall'].some(has)) return 'SportsActivityLocation';
    if (has('museum')) return 'Museum';
  }
  return typeMap[type] ?? 'LocalBusiness';
}

const SCHEMA_DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const;

/**
 * The listing's hours as OpeningHoursSpecification nodes, one per run,
 * from the same parsed schedule as the open-now badge (src/lib/hours.ts):
 * nothing when the line cannot be read in full, so no node claims an hour
 * the listing does not state. A run past midnight closes at its clock
 * time ("02:00"), which is how schema.org reads it.
 */
export function openingHoursSpecification(spec: readonly string[]) {
  return parseOpeningHours(spec).map((span) => ({
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: span.days.map((d) => SCHEMA_DAYS[d]),
    opens: hhmm(span.open),
    closes: hhmm(span.close >= 24 * 60 ? span.close - 24 * 60 : span.close),
  }));
}

/** The types that may carry `hasMenu`: schema.org's FoodEstablishment and its kinds. */
const FOOD_TYPES: ReadonlySet<string> = new Set(['restaurant', 'bar', 'coffee']);

/**
 * A listing's structured data. `url` is the place's own site where the
 * listing has one, and this page is `mainEntityOfPage` (6 November 2026;
 * until then the page was `url` and the site `sameAs`, which told a search
 * engine the guide was the business). The hours go out twice, as
 * `openingHours` strings and as OpeningHoursSpecification, both from the
 * one parsed schedule; `hasMenu` only with a menu link and only on a food
 * place, where the vocabulary has it.
 */
export function localBusinessJsonLd(
  town: TownConfig,
  place: CollectionEntry<'places'>,
  url: string,
  imageUrl?: string,
) {
  const { data } = place;
  const hours = openingHoursOf(data);
  const menuUrl = (data as { menuUrl?: string }).menuUrl;
  return {
    '@context': 'https://schema.org',
    '@type': placeSchemaType(data.type, data.tags),
    name: data.title,
    description: data.summary,
    address: postalAddress(data.address, town),
    url: data.url ?? url,
    mainEntityOfPage: url,
    ...(data.phone ? { telephone: data.phone } : {}),
    ...(data.priceRange ? { priceRange: data.priceRange } : {}),
    ...(hours ? { openingHours: hours, openingHoursSpecification: openingHoursSpecification(hours) } : {}),
    ...(menuUrl && FOOD_TYPES.has(data.type) ? { hasMenu: menuUrl } : {}),
    ...(imageUrl ? { image: imageUrl } : {}),
  };
}
