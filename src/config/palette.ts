/**
 * The network's color system.
 *
 * Town accents live in each town's config; these are the colors shared by
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
}

/** One warm amber for the whole network. A fill, never text: write ink on it. */
export const HIGHLIGHT = '#F0A62E';

export const CATEGORY_COLORS: Record<EventCategory, CategoryColor> = {
  music: { dot: '#7C4DD8', ink: '#4A2A87' },
  market: { dot: '#19904F', ink: '#0F6036' },
  festival: { dot: '#D25B23', ink: '#8C3A12' },
  outdoors: { dot: '#2F8F86', ink: '#17564F' },
  family: { dot: '#C94D8C', ink: '#7C2A55' },
  food: { dot: '#D14545', ink: '#87241F' },
  arts: { dot: '#B5561F', ink: '#733716' },
  civic: { dot: '#4E6B8A', ink: '#31465C' },
  sports: { dot: '#2C74CC', ink: '#1B4A86' },
  other: { dot: '#6B6F76', ink: '#44484E' },
};

/**
 * The colors as CSS custom properties. Components reference
 * var(--cat-<name>-ink) rather than an inline hex, so this module stays the
 * single definition and scripts/check-colors.ts reads the same values.
 */
export function categoryCss(): string {
  const entries = Object.entries(CATEGORY_COLORS) as Array<[string, CategoryColor]>;
  return `:root{${entries.map(([n, c]) => `--cat-${n}-dot:${c.dot};--cat-${n}-ink:${c.ink}`).join(';')}}`;
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
