/**
 * The network's colour system.
 *
 * Town accents live in each town's config; these are the colours shared by
 * every site: one warm highlight, and a hue per event category and place type
 * so a list of twenty things reads as twenty different kinds of thing rather
 * than twenty grey rows.
 *
 * Each category carries two values. `dot` is the bright one, used for marks
 * and fills, and clears 3:1 against every town's paper. `ink` is the dark one,
 * used wherever the category is written as words, and clears 4.5:1 against
 * every paper and against white. `npm run check-colors` proves both, for every
 * town, and CI runs it.
 */
import type { EventCategory, PlaceType } from '../content/schemas.ts';

export interface CategoryColor {
  /** Bright: dots, rules, fills. 3:1 on every paper. */
  dot: string;
  /** Dark: the category set as words. 4.5:1 on every paper and on white. */
  ink: string;
  /** The same two on a dark ground, where the light values disappear. */
  dotOnDark: string;
  onDark: string;
}

/** One warm amber for the whole network. A fill, never text: write ink on it. */
export const HIGHLIGHT = '#F0A62E';

export const CATEGORY_COLORS: Record<EventCategory, CategoryColor> = {
  music: { dot: '#7C4DD8', ink: '#4A2A87', dotOnDark: '#865BDB', onDark: '#B094E8' },
  market: { dot: '#19904F', ink: '#0F6036', dotOnDark: '#19904F', onDark: '#75BC95' },
  festival: { dot: '#D25B23', ink: '#8C3A12', dotOnDark: '#D25B23', onDark: '#E49D7B' },
  outdoors: { dot: '#2F8F86', ink: '#17564F', dotOnDark: '#2F8F86', onDark: '#82BCB6' },
  family: { dot: '#C94D8C', ink: '#7C2A55', dotOnDark: '#C94D8C', onDark: '#DF94BA' },
  food: { dot: '#D14545', ink: '#87241F', dotOnDark: '#D14545', onDark: '#E38F8F' },
  arts: { dot: '#B5561F', ink: '#733716', dotOnDark: '#B85D28', onDark: '#D39A79' },
  civic: { dot: '#4E6B8A', ink: '#31465C', dotOnDark: '#5C7793', onDark: '#95A6B9' },
  sports: { dot: '#2C74CC', ink: '#1B4A86', dotOnDark: '#2C74CC', onDark: '#80ACE0' },
  other: { dot: '#6B6F76', ink: '#44484E', dotOnDark: '#71757B', onDark: '#A6A9AD' },
};

/**
 * The colours as CSS custom properties, light values on :root and dark ones
 * under prefers-color-scheme, so a category label can flip with the scheme.
 * Components reference var(--cat-<name>-ink); this module stays the single
 * definition and scripts/check-colors.ts reads the same values.
 */
export function categoryCss(): string {
  const entries = Object.entries(CATEGORY_COLORS) as Array<[string, CategoryColor]>;
  const light = entries.map(([n, c]) => `--cat-${n}-dot:${c.dot};--cat-${n}-ink:${c.ink}`).join(';');
  const dark = entries.map(([n, c]) => `--cat-${n}-dot:${c.dotOnDark};--cat-${n}-ink:${c.onDark}`).join(';');
  return `:root{${light}}@media (prefers-color-scheme:dark){:root{${dark}}}`;
}

/** Places borrow the event hues, matched by what the place is for. */
export const PLACE_HUE: Record<PlaceType, EventCategory> = {
  restaurant: 'food',
  bar: 'festival',
  coffee: 'arts',
  shop: 'music',
  trail: 'outdoors',
  park: 'market',
  venue: 'sports',
  lodging: 'civic',
  service: 'other',
};

export const PLACE_TYPE_COLORS: Record<PlaceType, CategoryColor> = Object.fromEntries(
  Object.entries(PLACE_HUE).map(([type, category]) => [type, CATEGORY_COLORS[category]]),
) as Record<PlaceType, CategoryColor>;
