/**
 * A place page's street map, as numbers: the roads within a few blocks of
 * the listing, the names of the longest of them, and the pin
 * (data/<town>/place-map.json, written by scripts/place-maps.ts from the
 * Census Bureau's public-domain road lines and geocoder; drawn by
 * src/components/PlaceMap.astro). Nothing here guesses a location: a
 * listing the file does not place has no map.
 */
export interface PlaceMapData {
  source: string;
  read: string;
  places: Record<string, [number, number]>;
  /** What the town calls a road the Census names by its number ("State Hwy 56": "Mountain Ave"). */
  aliases?: Record<string, string>;
  lines: Array<{ n: string; k: 'highway' | 'road' | 'rail'; p: number[][] }>;
  /** Building outlines, parks and water, from an OpenStreetMap extract where the town has one. */
  areas?: Array<{ k: 'building' | 'park' | 'water'; p: number[][] }>;
  /** Whose data the map is drawn from, for the credit under it. */
  credit?: 'osm' | 'census';
  /** Where each pin came from: the building in the extract, or the geocoder's place on the block. */
  from?: Record<string, 'osm' | 'geocoder'>;
}

export interface PlaceMapView {
  width: number;
  height: number;
  roads: Array<{ d: string; kind: 'highway' | 'road' | 'rail' }>;
  areas: Array<{ d: string; kind: 'building' | 'park' | 'water' }>;
  credit: 'osm' | 'census';
  /** The pin is the building itself, not a place on its block. */
  exact: boolean;
  labels: Array<{ text: string; x: number; y: number; angle: number }>;
  pin: { x: number; y: number };
}

/** The town's file from an `import.meta.glob` over data/*\/place-map.json, or nothing. */
export function placeMapFor(files: Record<string, PlaceMapData>, town: string): PlaceMapData | undefined {
  return Object.entries(files).find(([path]) => path.endsWith(`/${town}/place-map.json`))?.[1];
}

const METERS_PER_DEGREE = 111_320;

/** The part of a segment inside a box (Liang–Barsky), or nothing. */
function clip(ax: number, ay: number, bx: number, by: number, x0: number, y0: number, x1: number, y1: number): [number, number, number, number] | undefined {
  let t0 = 0;
  let t1 = 1;
  const dx = bx - ax;
  const dy = by - ay;
  for (const [p, q] of [[-dx, ax - x0], [dx, x1 - ax], [-dy, ay - y0], [dy, y1 - ay]] as Array<[number, number]>) {
    if (p === 0) {
      if (q < 0) return undefined;
      continue;
    }
    const r = q / p;
    if (p < 0) {
      if (r > t1) return undefined;
      if (r > t0) t0 = r;
    } else {
      if (r < t0) return undefined;
      if (r < t1) t1 = r;
    }
  }
  return [ax + t0 * dx, ay + t0 * dy, ax + t1 * dx, ay + t1 * dy];
}

/** "N 4th St" as a street sign has it; the Census's "State Hwy 56" and "US Hwy 287" as people say them. */
function label(name: string): string {
  return name
    .replace(/^State Hwy /, 'CO ')
    .replace(/^US Hwy /, 'US ')
    .replace(/^Co Rd /, 'County Road ')
    .replace(/^(North|South|East|West) (?=\S+ (Street|Avenue|Drive|Parkway)$)/, (_, d: string) => `${d[0]} `)
    .replace(/ Street$/, ' St')
    .replace(/ Avenue$/, ' Ave')
    .replace(/ Drive$/, ' Dr')
    .replace(/ Parkway$/, ' Pkwy');
}

/**
 * The map around one listing: `halfWidth` meters to each side, drawn into
 * a `width` by `height` box, north up. Labels go on the longest visible
 * stretch of each named road, at most `maxLabels`, none where two would
 * sit on top of each other.
 */
export function placeMap(
  data: PlaceMapData,
  slug: string,
  { width = 420, height = 280, halfWidth = 260, maxLabels = 7 }: { width?: number; height?: number; halfWidth?: number; maxLabels?: number } = {},
): PlaceMapView | undefined {
  const at = data.places[slug];
  if (!at) return undefined;
  const [lat, lng] = at;
  const scale = width / 2 / halfWidth; // pixels per meter
  const perLng = METERS_PER_DEGREE * Math.cos((lat * Math.PI) / 180);
  const x = (lon: number) => width / 2 + (lon - lng) * perLng * scale;
  const y = (la: number) => height / 2 - (la - lat) * METERS_PER_DEGREE * scale;
  const margin = 40;
  const inside = (px: number, py: number) => px >= -margin && px <= width + margin && py >= -margin && py <= height + margin;

  // An area is drawn when any corner of it is in the frame: a building is small, and a park or a lake that only crosses the frame has corners near it.
  const areas: PlaceMapView['areas'] = [];
  for (const area of data.areas ?? []) {
    const points = area.p.map(([lon, la]) => [x(lon!), y(la!)] as [number, number]);
    const reach = area.k === 'building' ? margin : 400;
    if (!points.some(([px, py]) => px >= -reach && px <= width + reach && py >= -reach && py <= height + reach)) continue;
    areas.push({ kind: area.k, d: `${points.map(([px, py], i) => `${i ? 'L' : 'M'}${px.toFixed(1)} ${py.toFixed(1)}`).join('')}Z` });
  }
  const roads: PlaceMapView['roads'] = [];
  // Per name, the line with the longest stretch in view, and the middle of that stretch.
  const longest = new Map<string, { length: number; x: number; y: number; angle: number }>();
  for (const line of data.lines) {
    const points = line.p.map(([lon, la]) => [x(lon!), y(la!)] as [number, number]);
    // Drawn when any stretch of it crosses the frame, not only when a vertex falls inside: a straight county road has few.
    const crosses = points.some(([bx, by], i) => i > 0 && !!clip(points[i - 1]![0], points[i - 1]![1], bx, by, -margin, -margin, width + margin, height + margin));
    if (!crosses && !points.some(([px, py]) => inside(px, py))) continue;
    roads.push({ kind: line.k, d: points.map(([px, py], i) => `${i ? 'L' : 'M'}${px.toFixed(1)} ${py.toFixed(1)}`).join('') });
    if (!line.n || line.k === 'rail') continue;
    const segments: Array<[number, number, number, number, number]> = [];
    let length = 0;
    for (let i = 1; i < points.length; i++) {
      const [ax, ay] = points[i - 1]!;
      const [bx, by] = points[i]!;
      const cut = clip(ax, ay, bx, by, 0, 0, width, height);
      if (!cut) continue;
      const seg: [number, number, number, number, number] = [...cut, Math.hypot(cut[2] - cut[0], cut[3] - cut[1])];
      segments.push(seg);
      length += seg[4];
    }
    const best = longest.get(line.n);
    if (!segments.length || (best && best.length >= length)) continue;
    // Walk to the middle of the visible stretch.
    let walked = 0;
    for (const [ax, ay, bx, by, len] of segments) {
      if (walked + len >= length / 2 && len > 0) {
        const t = (length / 2 - walked) / len;
        let angle = (Math.atan2(by - ay, bx - ax) * 180) / Math.PI;
        if (angle > 90) angle -= 180;
        if (angle < -90) angle += 180;
        // A north-south street reads one way on every map: bottom to top.
        if (Math.abs(angle) > 85) angle = -Math.abs(angle);
        longest.set(line.n, { length, x: ax + (bx - ax) * t, y: ay + (by - ay) * t, angle });
        break;
      }
      walked += len;
    }
  }
  const labels: PlaceMapView['labels'] = [];
  const pinX = width / 2;
  const pinY = height / 2;
  for (const [name, spot] of [...longest].sort((a, b) => b[1].length - a[1].length)) {
    if (labels.length >= maxLabels) break;
    if (spot.length < 70) continue;
    // Keep a label inside the frame and off the pin: slide it along its own road when the middle is under the pin.
    let { x: lx, y: ly } = spot;
    const rad = (spot.angle * Math.PI) / 180;
    const text = data.aliases?.[name] ?? label(name);
    const half = text.length * 3.6;
    const reach = Math.abs(Math.cos(rad)) * half + 18;
    // Under the pin (its head stands 38 above its point): slide the label along its own road, to whichever side clears it.
    const under = (px: number, py: number) => Math.abs(px - pinX) < reach && py > pinY - 50 && py < pinY + 16;
    if (under(lx, ly)) {
      const shift = reach + half * Math.abs(Math.sin(rad)) + 56;
      if (spot.length / 2 < shift) continue;
      const sides = [1, -1]
        .map((side) => ({ x: lx + Math.cos(rad) * shift * side, y: ly + Math.sin(rad) * shift * side }))
        .filter((c) => c.x > half + 6 && c.x < width - half - 6 && c.y > 14 && c.y < height - 12 && !under(c.x, c.y));
      if (!sides.length) continue;
      ({ x: lx, y: ly } = sides[0]!);
    }
    lx = Math.min(width - half - 6, Math.max(half + 6, lx));
    ly = Math.min(height - 12, Math.max(14, ly));
    if (labels.some((l) => Math.hypot(l.x - lx, l.y - ly) < 44)) continue;
    labels.push({ text, x: Math.round(lx), y: Math.round(ly), angle: Math.round(spot.angle) });
  }
  if (roads.filter((r) => r.kind !== 'rail').length < 2) return undefined;
  // A map with no street named on it tells a reader nothing about where the place is (a hotel up its own drive,
  // a park drawn as a green shape): none is drawn.
  if (labels.length === 0) return undefined;
  return { width, height, roads, areas, labels, pin: { x: width / 2, y: height / 2 }, credit: data.credit ?? 'census', exact: data.from?.[slug] === 'osm' };
}
