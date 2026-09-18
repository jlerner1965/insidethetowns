/**
 * Proves the colour system passes WCAG AA, for every site, before it ships.
 *
 * The network uses colour structurally — coloured bands, coloured category
 * labels, a shared amber — and a colour that fails contrast is a bug that no
 * build step would otherwise catch. This reads the real town configs and the
 * real palette module, so it cannot drift from what the sites render.
 *
 * Roles and the bar each has to clear:
 *   accent      3:1 on its own paper. A rule or dot has to be visible.
 *   accentDark  4.5:1 on its own paper (it is text) and 4.5:1 under white
 *               (it is also the fill of the dark bands).
 *   highlight   3:1 on every accentDark band, and ink on it clears 4.5:1.
 *   category    dot 3:1 on every paper; ink 4.5:1 on every paper and on white.
 */
import { allSites } from '../src/config/index.ts';
import { CATEGORY_COLORS, HIGHLIGHT, PLACE_TYPE_COLORS } from '../src/config/palette.ts';


const INK = '#17181A';

function channel(value: number): number {
  const c = value / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

function luminance(hex: string): number {
  const h = hex.replace('#', '');
  const [r, g, b] = [0, 2, 4].map((i) => channel(parseInt(h.slice(i, i + 2), 16)));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function ratio(a: string, b: string): number {
  const [x, y] = [luminance(a), luminance(b)].sort((m, n) => n - m);
  return (x + 0.05) / (y + 0.05);
}

/**
 * `color-mix(in srgb, a p%, b)`, which is why the stylesheet uses srgb rather
 * than oklab for the values that carry text: a plain channel interpolation is
 * one that this script can reproduce exactly, and an unverifiable colour is
 * not worth the slightly nicer gradient.
 */
function mix(a: string, part: number, b: string): string {
  const channels = (hex: string) => [0, 2, 4].map((i) => parseInt(hex.replace('#', '').slice(i, i + 2), 16));
  const [ar, ag, ab] = channels(a);
  const [br, bg, bb] = channels(b);
  const blend = (x: number, y: number) => Math.round(x * part + y * (1 - part));
  return `#${[blend(ar!, br!), blend(ag!, bg!), blend(ab!, bb!)].map((n) => n.toString(16).padStart(2, '0')).join('')}`;
}

const failures: string[] = [];

function want(name: string, got: number, min: number): void {
  if (got + 1e-9 < min) failures.push(`${name}: ${got.toFixed(2)}, needs ${min}`);
}

const papers = allSites.map((s) => ({ slug: s.slug, paper: s.colors.neutralBg }));

for (const site of allSites) {
  const { accent, accentDark, neutralBg } = site.colors;
  want(`${site.slug} accent on paper`, ratio(accent, neutralBg), 3);
  want(`${site.slug} accentDark on paper`, ratio(accentDark, neutralBg), 4.5);
  want(`${site.slug} white on accentDark`, ratio('#ffffff', accentDark), 4.5);
  want(`${site.slug} highlight on accentDark`, ratio(HIGHLIGHT, accentDark), 3);
}

want('ink on highlight', ratio(INK, HIGHLIGHT), 4.5);

// The masthead band carries body ink, and it is the one surface on the page
// that is neither the paper nor white.
for (const site of allSites) {
  const tint = mix(site.colors.accent, 0.14, site.colors.neutralBg);
  want(`${site.slug} ink on its masthead tint`, ratio(INK, tint), 4.5);
}

const swatches = [
  ...Object.entries(CATEGORY_COLORS).map(([name, c]) => [`category ${name}`, c] as const),
  ...Object.entries(PLACE_TYPE_COLORS).map(([name, c]) => [`place ${name}`, c] as const),
];
for (const [name, { dot, ink }] of swatches) {
  want(`${name} ink on white`, ratio(ink, '#ffffff'), 4.5);
  for (const { slug, paper } of papers) {
    want(`${name} dot on ${slug} paper`, ratio(dot, paper), 3);
    want(`${name} ink on ${slug} paper`, ratio(ink, paper), 4.5);
  }
}

if (failures.length > 0) {
  console.error(`check-colors: ${failures.length} contrast failure(s)`);
  for (const f of failures) console.error(`  ${f}`);
  process.exit(1);
}
console.log(
  `check-colors: ${allSites.length} sites, ${Object.keys(CATEGORY_COLORS).length} categories, ` +
    `${Object.keys(PLACE_TYPE_COLORS).length} place types — all pairs pass AA`,
);
