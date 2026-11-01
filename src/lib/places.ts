/**
 * The small rules every page that lists places shares.
 *
 * Three pages each carried their own copy of "our picks first, then by name",
 * which was fine until the listings grew a status: a closed restaurant that
 * happened to be a pick was still leading Eat & Drink. One comparator, one
 * notion of "can be visited", used everywhere a place is ordered or chosen.
 */
import type { CollectionEntry } from 'astro:content';

type PlaceLike = { data: Pick<CollectionEntry<'places'>['data'], 'featured' | 'title' | 'status'> };

/** True unless the listing says the place is closed, for good or for now. */
export function isOpen(place: { data: { status?: string } }): boolean {
  return !place.data.status || place.data.status === 'open';
}

/**
 * Open places first, the picks among them before the rest, then by name.
 * A closed place keeps its row (a reader looking for it should find the
 * answer) but goes to the end of its group, and its "Our pick" no longer
 * counts for anything.
 */
export function byProminence(a: PlaceLike, b: PlaceLike): number {
  return (
    Number(isOpen(b)) - Number(isOpen(a)) ||
    Number(b.data.featured && isOpen(b)) - Number(a.data.featured && isOpen(a)) ||
    a.data.title.localeCompare(b.data.title)
  );
}

/**
 * The home page hero's second button: Eat & Drink, unless the town's Things
 * to Do page lists at least twice as many places.
 *
 * Every guide's hero sent its second button to Eat & Drink, which in Carbon
 * Valley and Severance was a page of two to four listings beside twenty-odd
 * trails and parks. The bar is twice, not "more": a town where the two are
 * close keeps the button every other guide has, and does not change it every
 * time a listing is added or closes.
 *
 * Counts are what the two pages list: Eat & Drink's restaurants, bars, coffee
 * and shops, and Things to Do's trails, trailheads, parks, venues and
 * lodging.
 */
export function heroSecondLink({ eatDrink, thingsToDo }: { eatDrink: number; thingsToDo: number }): { label: string; href: string } {
  return thingsToDo > 0 && thingsToDo >= 2 * eatDrink
    ? { label: 'Things to do', href: '/things-to-do/' }
    : { label: 'Eat & drink', href: '/eat-drink/' };
}

/**
 * The hero's third button, the resident's page (design pass, 26 October
 * 2026): Living here on a guide that has the page, Moving here on every
 * other. The two are different pages for different readers and are never
 * swapped for one another; the button is whichever one the guide has.
 */
export function heroThirdLink(town: { livingHere?: unknown }): { label: string; href: string } {
  return town.livingHere ? { label: 'Living here', href: '/living-here/' } : { label: 'Moving here', href: '/moving-here/' };
}

/**
 * Directions without a map: Google's universal directions URL opens the app
 * on a phone that has one and the site on one that does not, and costs the
 * page no script and no third-party embed, which the CSP would refuse anyway.
 * The town and state are appended unless the address already carries a
 * state; the town alone, when the address already ends with it ("400 S
 * Parish Ave, Johnstown"), so Google is not sent "Johnstown, Johnstown".
 * Looking for the town's name anywhere else would not do, since Niwot Road
 * runs through Niwot and "7960 Niwot Road" is not a full address.
 */
export function directionsUrl(address: string, townName: string): string {
  const endsWithTown = new RegExp(`,\\s*${townName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\.?$`, 'i');
  const destination = /,\s*CO\b/.test(address) ? address : endsWithTown.test(address) ? `${address}, CO` : `${address}, ${townName}, CO`;
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`;
}
