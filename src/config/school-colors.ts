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
 *   Not drawn since 18 November 2026: the strip's label is white, as a
 *   school's colour is never the colour of words (SportsBar.astro).
 * - The pill ("Thursday email", the season record): the mark as the fill
 *   with ink on it where the mark clears 4.5:1 on the band and ink clears
 *   4.5:1 on the mark, else white with ink.
 *
 * Nothing here changes the guide's own palette (TownConfig.colors), which
 * every other page and every other part of the home page keeps.
 *
 * One source (17 November 2026): a school the guides follow keeps its
 * colours in the sports config (SchoolSports.colors) and the strip reads
 * them there (stripColors), as its sports pages do (schoolTrim); the two
 * files had drifted apart on Erie, Lyons and Niwot. TownConfig.school's
 * colours stand only for a guide whose school has no sports entry.
 */
import { INK, PAPERS } from './palette.ts';
import { SCHOOL_SPORTS, type SchoolColors } from './school-sports.ts';
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

type Pair = Pick<SchoolConfig, 'primary' | 'secondary'>;

/** The two colours the home strip is drawn from: the published main colour (or the band's darker step) and the second, white where none is recorded. */
export function schoolPair(colors: SchoolColors): Pair {
  return { primary: colors.band ?? colors.brand ?? colors.primary, secondary: colors.secondary ?? WHITE };
}

/** The strip's colours for a guide: its one followed school's from the sports config, else TownConfig.school's. */
export function stripColors(town: { slug: string; school?: Pair }): Pair | undefined {
  const followed = SCHOOL_SPORTS.filter((s) => s.town === town.slug);
  const colors = followed.length === 1 ? followed[0]!.colors : undefined;
  return colors ? schoolPair(colors) : town.school;
}

/** A line of the trim has to be seen on white: under this the second colour (a white) gives way to the primary. */
export const TRIM_MIN = 1.3;
/** White on the loss pill, at least. */
export const LOSS_MIN = 7;

/**
 * The trim of a school's sports pages, in place of the guide's accent: the
 * header rules and the tie pill's wash in the published main colour where
 * the pages are set in a darker step of it (Erie's orange), else the second
 * colour, else (a white) the primary; and the loss pill in the second colour
 * where it is dark (Roosevelt's and Erie's black). Nothing where the school
 * has neither recorded: the guide's accent stays.
 */
export function schoolTrim(colors: SchoolColors): { accent: string; loss?: string } | undefined {
  const { primary, brand, secondary } = colors;
  if (!brand && !secondary) return undefined;
  const accent = brand ?? (contrast(secondary!, WHITE) >= TRIM_MIN ? secondary! : primary);
  const loss = secondary && contrast(WHITE, secondary) >= LOSS_MIN ? secondary : undefined;
  return { accent, ...(loss ? { loss } : {}) };
}

export interface SchoolTheme {
  /** The masthead and closing band, the Home pill: white on it. */
  band: string;
  /** The other colour: the eyebrows and pills where legible. (The home strip's dot is the sports config's colour, SchoolSports.colors.) */
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
