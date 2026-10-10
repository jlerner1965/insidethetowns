/**
 * Proves the colour system passes WCAG AA, for every site, before it ships.
 *
 * The network uses colour structurally — dark bands, coloured category
 * labels, a shared amber — and a colour that fails contrast is a bug that no
 * build step would otherwise catch. This reads the real town configs and the
 * real palette module, so it cannot drift from what the sites render.
 *
 * The roles are Color System 2.0's (src/config/palette.ts), and the bar each
 * has to clear:
 *   primary     4.5:1 on white and on its paper (it is the town name, links
 *               and eyebrows), and white on it 4.5:1 (buttons, bands,
 *               badges), on its hover shade too.
 *   accent      decoration only, so nothing: it never carries text, an
 *               essential icon or a control's outline.
 *   bands       white text on the primary; on the network strip under the
 *               footer, white at 70% and the hub's name in the amber.
 *   inks        body and supporting text 4.5:1 on white, on both papers and
 *               on the amber wash.
 *   category    dot 3:1 on both papers and white; ink 4.5:1 on all three.
 */
import { allSites } from '../src/config/index.ts';
import { CATEGORY_COLORS, HIGHLIGHT, INK, INK_MUTED, PAPERS, PLACE_TYPE_COLORS, primaryHover } from '../src/config/palette.ts';

const WHITE = '#ffffff';
const HIGHLIGHT_SOFT = '#fdf0d8';
const HIGHLIGHT_INK = '#f8c265';
/** "Open · closes 7 pm" (global.css, .open-status). */
const OPEN_GREEN = '#1f7a45';

function channel(value: number): number {
  const c = value / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

function luminance(hex: string): number {
  const h = hex.replace('#', '');
  const [r, g, b] = [0, 2, 4].map((i) => channel(parseInt(h.slice(i, i + 2), 16)));
  return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!;
}

function ratio(a: string, b: string): number {
  const [x, y] = [luminance(a), luminance(b)].sort((m, n) => n - m);
  return (x! + 0.05) / (y! + 0.05);
}

/**
 * `color-mix(in srgb, a p%, b)`, and also what an `a` at opacity p composites
 * to over `b` (Tailwind's `text-white/70`, `bg-black/30`). A plain channel
 * interpolation is one this script can reproduce exactly, which is why the
 * stylesheet mixes the values that carry text in srgb rather than oklab.
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

const papers = Object.entries(PAPERS);

for (const site of allSites) {
  const { primary, paper } = site.colors;
  const page = PAPERS[paper];
  want(`${site.slug} primary on white`, ratio(primary, WHITE), 4.5);
  want(`${site.slug} primary on its ${paper} paper`, ratio(primary, page), 4.5);
  want(`${site.slug} white on primary`, ratio(WHITE, primary), 4.5);
  want(`${site.slug} white on primary hover`, ratio(WHITE, primaryHover(primary)), 4.5);
  // A link inside a notice, on the amber wash.
  want(`${site.slug} primary on the highlight wash`, ratio(primary, HIGHLIGHT_SOFT), 4.5);
  // The footer wordmark's light "Inside", white at 70% at 30px: display
  // size, so 3:1.
  want(`${site.slug} white/70 display text on primary`, ratio(mix(WHITE, 0.7, primary), primary), 3);
  // The network strip under the footer is the primary under 30% black
  // (NetworkBar.astro, bg-black/30): its labels and taglines are white/70,
  // and the hub's name is in the amber.
  const strip = mix('#000000', 0.3, primary);
  want(`${site.slug} white/70 on the network strip`, ratio(mix(WHITE, 0.7, strip), strip), 4.5);
  want(`${site.slug} highlight-ink on the network strip`, ratio(HIGHLIGHT_INK, strip), 4.5);
}

// Every guide's primary is its own: it is what tells one tab from another.
const seen = new Map<string, string>();
for (const site of allSites) {
  const key = site.colors.primary.toLowerCase();
  const clash = seen.get(key);
  if (clash) failures.push(`${site.slug} has the same primary as ${clash} (${site.colors.primary})`);
  seen.set(key, site.slug);
}

for (const [name, ink] of [['ink', INK], ['ink-muted', INK_MUTED]] as const) {
  want(`${name} on white`, ratio(ink, WHITE), 4.5);
  want(`${name} on the highlight wash`, ratio(ink, HIGHLIGHT_SOFT), 4.5);
  for (const [paper, hex] of papers) want(`${name} on ${paper} paper`, ratio(ink, hex), 4.5);
}
// The status pills ("Canceled", "Permanently closed"): white on the body ink.
want('white on ink', ratio(WHITE, INK), 4.5);
// "Our pick": ink on the amber.
want('ink on highlight', ratio(INK, HIGHLIGHT), 4.5);
want('the highlight wash is visible against white', ratio(HIGHLIGHT_SOFT, WHITE), 1.05);
want('open-status green on white', ratio(OPEN_GREEN, WHITE), 4.5);
for (const [paper, hex] of papers) want(`open-status green on ${paper} paper`, ratio(OPEN_GREEN, hex), 4.5);

const swatches = [
  ...Object.entries(CATEGORY_COLORS).map(([name, c]) => [`category ${name}`, c] as const),
  ...Object.entries(PLACE_TYPE_COLORS).map(([name, c]) => [`place ${name}`, c] as const),
];
for (const [name, { dot, ink }] of swatches) {
  want(`${name} dot on white`, ratio(dot, WHITE), 3);
  want(`${name} ink on white`, ratio(ink, WHITE), 4.5);
  for (const [paper, hex] of papers) {
    want(`${name} dot on ${paper} paper`, ratio(dot, hex), 3);
    want(`${name} ink on ${paper} paper`, ratio(ink, hex), 4.5);
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
