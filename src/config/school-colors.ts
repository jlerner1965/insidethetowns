/**
 * The school's colours on the flagship home page (TownConfig.school), and
 * which job each does. The page and scripts/check-colors.ts read the same
 * answer from here, so what is proven is what is drawn.
 *
 * - The band: the closing band, with white on it.
 * - The ink: the school's colour for words on the paper and on white (the
 *   home score, the scorecard's eyebrows, the Home pill's fill and the Away
 *   pill's outline): the primary where it clears 4.5:1 on white and both
 *   papers and white clears 4.5:1 on it (Roosevelt's red), else the band
 *   (Erie's orange is 3.0:1 on white, so Erie's ink is its black). White has to clear 7:1 on it (the owner's bar for
 *   the home page, 25 October 2026, above the 4.5:1 the rest of the
 *   network meets). The school's primary, unless white does not clear 7:1
 *   on it and does on the secondary: then the two swap, the secondary is
 *   the band and the primary the accent. Erie's orange is the case the rule
 *   was written for.
 * - The rule: the school's own main colour, unswapped, as a 4px line with
 *   no words on it (the top of every page of a flagship guide, and the
 *   scorecard's edge), so Erie's orange and Roosevelt's red are seen even
 *   where black is the band (the owner's "school colour as trim", 26
 *   October 2026).
 * - The mark: the other colour, for the closing band's eyebrows and, where
 *   it is legible, its pills.
 * - The eyebrow: the mark where it clears 4.5:1 on the band, else white.
 * - The pill ("Thursday email", the season record): the mark as the fill
 *   with ink on it where the mark clears 4.5:1 on the band and ink clears
 *   4.5:1 on the mark, else white with ink.
 *
 * Nothing here changes the guide's own palette (TownConfig.colors), which
 * every other page and every other part of the home page keeps.
 */
import { INK, PAPERS } from './palette.ts';
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
  /** The school's colour for words and pills on the paper and on white: the primary where it reads there, else the band. */
  ink: string;
  /** The school's main colour as a line with no words on it. */
  rule: string;
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
  // On the paper and on white: the school's own main colour where it reads
  // at 4.5:1 on both papers and white reads on it (the Home pill), else the band.
  const onLight = (c: string) => Math.min(contrast(c, WHITE), ...Object.values(PAPERS).map((p) => contrast(c, p)));
  const ink = onLight(school.primary) >= MARK_MIN && contrast(WHITE, school.primary) >= MARK_MIN ? school.primary : band;
  return {
    band,
    mark,
    ink,
    rule: school.primary,
    swapped,
    eyebrow: legible ? mark : WHITE,
    pill: legible && contrast(INK, mark) >= MARK_MIN ? { fill: mark, text: INK } : { fill: WHITE, text: INK },
  };
}
