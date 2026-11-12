/**
 * The landscape behind a town page's name on the hub (the design pass of
 * 12 November 2026). Thirty-three of the thirty-five pages have no
 * licensed photograph, and a page about a place opened on a white band
 * like a form. So each draws its horizon: three layered ridgelines, the
 * shape set by where the town is (high peaks, foothills, mesas, or the
 * plains' long low line) and the detail by the town's own slug, so no two
 * pages share one and a page draws the same one at every build.
 *
 * It is a drawing of a kind of country, not of a view: no peak here is a
 * named peak, and nothing on the page says otherwise. A page with a
 * photograph uses the photograph.
 *
 * Pure: a slug and a cluster in, SVG path data out.
 */
import type { HubCluster } from '../config/hub-towns.ts';

export type Terrain = 'peaks' | 'foothills' | 'mesa' | 'plains';

/** The country each cluster is in. */
export const TERRAIN: Record<HubCluster, Terrain> = {
  'Showpiece pages': 'peaks',
  'Park gateway': 'peaks',
  'Front Range cities': 'foothills',
  'Front Range and plains towns': 'plains',
  'I-70 mountain': 'peaks',
  'Summit County': 'peaks',
  'Arkansas valley': 'peaks',
  'Pikes Peak': 'peaks',
  'Yampa valley': 'foothills',
  'Western Slope': 'mesa',
  'Roaring Fork valley': 'peaks',
  'Gunnison valley': 'peaks',
  'Southwest': 'peaks',
};

export const RIDGE_WIDTH = 1200;
export const RIDGE_HEIGHT = 220;

/** A small seeded generator (mulberry32), so a slug always draws the same line. */
function seeded(text: string): () => number {
  let h = 1779033703 ^ text.length;
  for (let i = 0; i < text.length; i++) {
    h = Math.imul(h ^ text.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  let a = h >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** How one layer of a terrain is drawn: points across, how high, how rough, and whether its tops are flat. */
interface Shape {
  points: number;
  base: number;
  relief: number;
  flat: boolean;
}

const SHAPES: Record<Terrain, [far: Shape, mid: Shape, near: Shape]> = {
  peaks: [
    { points: 9, base: 0.5, relief: 0.46, flat: false },
    { points: 13, base: 0.34, relief: 0.34, flat: false },
    { points: 16, base: 0.14, relief: 0.2, flat: false },
  ],
  foothills: [
    { points: 8, base: 0.36, relief: 0.3, flat: false },
    { points: 10, base: 0.22, relief: 0.2, flat: false },
    { points: 12, base: 0.1, relief: 0.1, flat: false },
  ],
  mesa: [
    { points: 7, base: 0.4, relief: 0.24, flat: true },
    { points: 9, base: 0.24, relief: 0.18, flat: true },
    { points: 12, base: 0.1, relief: 0.08, flat: false },
  ],
  plains: [
    { points: 7, base: 0.2, relief: 0.16, flat: false },
    { points: 9, base: 0.12, relief: 0.07, flat: false },
    { points: 11, base: 0.06, relief: 0.04, flat: false },
  ],
};

function layer(shape: Shape, rand: () => number): string {
  const W = RIDGE_WIDTH;
  const H = RIDGE_HEIGHT;
  const y = (height: number) => Math.round((H - height * H) * 10) / 10;
  const step = W / (shape.points - 1);
  const heights = Array.from({ length: shape.points }, () => shape.base + rand() * shape.relief);
  let d = `M0 ${H} L0 ${y(heights[0]!)}`;
  for (let i = 1; i < shape.points; i++) {
    const x = Math.round(i * step);
    const prev = Math.round((i - 1) * step);
    if (shape.flat) {
      // A mesa: level top, a short scarp down or up to the next.
      const edge = Math.round(prev + step * (0.72 + rand() * 0.16));
      d += ` L${edge} ${y(heights[i - 1]!)} L${x} ${y(heights[i]!)}`;
    } else if (shape.relief >= 0.3) {
      // Peaks: straight faces, with a shoulder part-way up.
      const mid = Math.round(prev + step * (0.4 + rand() * 0.2));
      const shoulder = (heights[i - 1]! + heights[i]!) / 2 - rand() * shape.relief * 0.35;
      d += ` L${mid} ${y(Math.max(shape.base * 0.8, shoulder))} L${x} ${y(heights[i]!)}`;
    } else {
      // Hills and plains: a soft curve between points.
      const cx = Math.round(prev + step / 2);
      d += ` Q${cx} ${y((heights[i - 1]! + heights[i]!) / 2 + (rand() - 0.5) * shape.relief * 0.6)} ${x} ${y(heights[i]!)}`;
    }
  }
  return `${d} L${W} ${H} Z`;
}

/** Three closed paths, farthest first, in a 1200 by 220 box. */
export function ridgeline(slug: string, cluster: HubCluster): { terrain: Terrain; layers: [string, string, string] } {
  const terrain = TERRAIN[cluster];
  const rand = seeded(slug);
  const [far, mid, near] = SHAPES[terrain];
  return { terrain, layers: [layer(far, rand), layer(mid, rand), layer(near, rand)] };
}
