/**
 * Street addresses compared as places, not as strings.
 *
 * The same building is written "400 S Parish Ave" by the library's events
 * feed, "400 South Parish Avenue, Johnstown, CO 80534" in its footer and
 * "400 S. Parish Ave" on another page; three listings of one storytime
 * carried all three (audit, 26 October 2026). Duplicate detection needs them
 * to be one address, and needs "400 S Parish Ave" and "401 S Parish Ave" to
 * be two.
 *
 * The street line is what is compared: the first part before a comma, in
 * USPS's short forms (south → s, avenue → ave, fourth → 4th), lowercase,
 * punctuation gone. The city, state and ZIP after it are left out, because
 * one listing gives them and another does not; where both give a ZIP and the
 * ZIPs differ, the addresses differ.
 */

const WORDS: Record<string, string> = {
  north: 'n', south: 's', east: 'e', west: 'w',
  northeast: 'ne', northwest: 'nw', southeast: 'se', southwest: 'sw',
  avenue: 'ave', av: 'ave', street: 'st', road: 'rd', drive: 'dr', boulevard: 'blvd',
  lane: 'ln', court: 'ct', place: 'pl', parkway: 'pkwy', highway: 'hwy', circle: 'cir',
  trail: 'trl', terrace: 'ter', square: 'sq', way: 'way', plaza: 'plz', point: 'pt',
  mount: 'mt', saint: 'st', fort: 'ft', county: 'co', route: 'rte',
  suite: 'unit', ste: 'unit', apt: 'unit', apartment: 'unit',
  first: '1st', second: '2nd', third: '3rd', fourth: '4th', fifth: '5th',
  sixth: '6th', seventh: '7th', eighth: '8th', ninth: '9th', tenth: '10th',
};

/** "400 South Parish Avenue, Johnstown, CO 80534" → "400 s parish ave". Empty when there is no street line. */
export function normalizeStreet(address: string | undefined): string {
  if (!address) return '';
  const line = address.split(',')[0] ?? '';
  return line
    .toLowerCase()
    .replace(/#\s*/g, ' unit ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .split(' ')
    .filter(Boolean)
    .map((w) => WORDS[w] ?? w)
    .join(' ');
}

/** The five-digit ZIP an address ends with, if it gives one. */
export function zipOf(address: string | undefined): string | undefined {
  return address?.match(/\b(\d{5})(?:-\d{4})?\s*$/)?.[1];
}

/**
 * Whether two addresses name the same place. Both need a street line that
 * starts with a number: "Johnstown, CO" is a town, not an address, and two
 * listings that say only that are not thereby at one place.
 */
export function sameAddress(a: string | undefined, b: string | undefined): boolean {
  const x = normalizeStreet(a);
  const y = normalizeStreet(b);
  if (!/^\d/.test(x) || !/^\d/.test(y) || x !== y) return false;
  const za = zipOf(a);
  const zb = zipOf(b);
  return !za || !zb || za === zb;
}
