/**
 * The network's color system: Color System 2.0, the guide of 9 October 2026.
 *
 * Every guide has three colours of its own, set in its config (TownColors):
 * a primary, which carries the town's identity and every action (the town
 * name, links, active navigation, main buttons, the dark bands, all with
 * white on them); an accent, which is decoration only (small rules,
 * image placeholders, illustration, never text, an essential icon or a
 * control's outline); and one of two shared papers. Everything else is
 * shared, so the guides read as one family: the two papers, white cards,
 * one body ink and one supporting ink, the amber that marks a notice, and a
 * hue per event category and place type so a list of twenty things reads as
 * twenty different kinds of thing rather than twenty grey rows.
 *
 * Each category carries two values. `dot` is the bright one, used for marks
 * and fills, and clears 3:1 against both papers. `ink` is the dark one,
 * used wherever the category is written as words, and clears 4.5:1 against
 * both papers and against white. `npm run check-colors` proves these and
 * every town's primary, and CI runs it.
 */
import type { EventCategory, PlaceType } from '../content/schemas.ts';

export interface CategoryColor {
  /** Bright: dots, rules, fills. 3:1 on every paper. */
  dot: string;
  /** Dark: the category set as words. 4.5:1 on every paper and on white. */
  ink: string;
}

/**
 * The two page backgrounds. A guide sits on one or the other, as its palette
 * assigns, and nothing else is a page surface: cards and panels are white on
 * either.
 */
export const PAPERS = {
  warm: '#F7F5F0',
  cool: '#F2F6F7',
} as const;
export type Paper = keyof typeof PAPERS;

/** Body text, and supporting text (meta lines, captions, labels), on every guide. */
export const INK = '#243137';
export const INK_MUTED = '#526068';

/**
 * A primary's hover and pressed fill: the primary darkened by 12%, as the
 * guide asks, by mixing in 12% black in sRGB. The same arithmetic as CSS
 * `color-mix(in srgb, <primary> 88%, #000)`, done here so the page carries an
 * exact hex and scripts/check-colors.ts can prove white on it.
 */
export function primaryHover(primary: string): string {
  const h = primary.replace('#', '');
  return `#${[0, 2, 4]
    .map((i) => Math.round(parseInt(h.slice(i, i + 2), 16) * 0.88).toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase()}`;
}

/**
 * One warm amber for the whole network, kept for what it means rather than
 * as decoration: a notice that has to be read, and "Our pick". A fill, never
 * text: write ink on it.
 */
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
  trailhead: 'outdoors',
  park: 'market',
  venue: 'sports',
  lodging: 'civic',
  service: 'other',
};

export const PLACE_TYPE_COLORS: Record<PlaceType, CategoryColor> = Object.fromEntries(
  Object.entries(PLACE_HUE).map(([type, category]) => [type, CATEGORY_COLORS[category]]),
) as Record<PlaceType, CategoryColor>;
