/**
 * The school's colours on the flagship home page (TownConfig.school), and
 * which job each does. The page and scripts/check-colors.ts read the same
 * answer from here, so what is proven is what is drawn.
 *
 * - The band: the masthead, the closing band and the Home pill's fill,
 *   with white on it. White has to clear 7:1 on it (the owner's bar for
 *   the home page, 25 October 2026, above the 4.5:1 the rest of the
 *   network meets). The school's primary, unless white does not clear 7:1
 *   on it and does on the secondary: then the two swap, the secondary is
 *   the band and the primary the accent. Erie's orange is the case the rule
 *   was written for.
 * - The mark: the other colour, for the masthead's dot and, where it is
 *   legible, its eyebrows and pills.
 * - The eyebrow: the mark where it clears 4.5:1 on the band, else white.
 * - The pill ("Thursday email", the season record): the mark as the fill
 *   with ink on it where the mark clears 4.5:1 on the band and ink clears
 *   4.5:1 on the mark, else white with ink.
 *
 * Nothing here changes the guide's own palette (TownConfig.colors), which
 * every other page and every other part of the home page keeps.
 */
import { INK } from './palette.ts';
import type { SchoolConfig } from './towns/types.ts';

export const WHITE = '#ffffff';
/** White on the band, at least. */
export const BAND_MIN = 7;
/** The mark as text on the band, and ink on the mark, at least. */
export const MARK_MIN = 4.5;

function channel(value: number): number {
  const c = value / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

function luminance(hex: string): number {
  const h = hex.replace('#', '');
  const [r, g, b] = [0, 2, 4].map((i) => channel(parseInt(h.slice(i, i + 2), 16)));
  return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!;
}

/** WCAG contrast ratio between two hex colours. */
export function contrast(a: string, b: string): number {
  const [x, y] = [luminance(a), luminance(b)].sort((m, n) => n - m);
  return (x! + 0.05) / (y! + 0.05);
}

export interface SchoolTheme {
  /** The masthead and closing band, the Home pill: white on it. */
  band: string;
  /** The other colour: the dot, and the eyebrows and pills where legible. */
  mark: string;
  /** True where the secondary is the band because white does not clear 7:1 on the primary. */
  swapped: boolean;
  /** Eyebrows on the band. */
  eyebrow: string;
  /** The pills on the band: fill and text. */
  pill: { fill: string; text: string };
}

export function schoolTheme(school: Pick<SchoolConfig, 'primary' | 'secondary'>): SchoolTheme {
  const swapped = contrast(WHITE, school.primary) < BAND_MIN && contrast(WHITE, school.secondary) >= BAND_MIN;
  const band = swapped ? school.secondary : school.primary;
  const mark = swapped ? school.primary : school.secondary;
  const legible = contrast(mark, band) >= MARK_MIN;
  return {
    band,
    mark,
    swapped,
    eyebrow: legible ? mark : WHITE,
    pill: legible && contrast(INK, mark) >= MARK_MIN ? { fill: mark, text: INK } : { fill: WHITE, text: INK },
  };
}
