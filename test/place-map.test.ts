import test from 'node:test';
import assert from 'node:assert/strict';
import { placeMap, placeMapFor, type PlaceMapData } from '../src/lib/place-map.ts';

// A two-street grid around a pin at the crossing's north-east corner.
const data: PlaceMapData = {
  source: 'test',
  read: '2026-11-09',
  places: { cafe: [40.3052, -105.0803] },
  aliases: { 'State Hwy 56': 'Mountain Ave' },
  lines: [
    { n: 'State Hwy 56', k: 'highway', p: [[-105.09, 40.305], [-105.07, 40.305]] },
    { n: 'N 4th St', k: 'road', p: [[-105.079, 40.30], [-105.079, 40.31]] },
    { n: 'Far Rd', k: 'road', p: [[-105.2, 40.4], [-105.19, 40.4]] },
    { n: '', k: 'rail', p: [[-105.078, 40.30], [-105.078, 40.31]] },
  ],
};

test('a listing the file does not place has no map', () => {
  assert.equal(placeMap(data, 'elsewhere'), undefined);
});

test('the pin is the middle of the frame and only nearby roads are drawn', () => {
  const map = placeMap(data, 'cafe')!;
  assert.deepEqual(map.pin, { x: map.width / 2, y: map.height / 2 });
  assert.equal(map.roads.length, 3);
  assert.equal(map.roads.filter((r) => r.kind === 'rail').length, 1);
});

test('a road is labelled by what the town calls it, inside the frame, and a street running north reads bottom to top', () => {
  const map = placeMap(data, 'cafe')!;
  const names = map.labels.map((l) => l.text).sort();
  assert.deepEqual(names, ['Mountain Ave', 'N 4th St']);
  for (const l of map.labels) assert.ok(l.x > 0 && l.x < map.width && l.y > 0 && l.y < map.height);
  assert.equal(map.labels.find((l) => l.text === 'N 4th St')!.angle, -90);
});

test('an extract brings buildings and its credit, and a pin from it is exact', () => {
  const osm: PlaceMapData = {
    ...data,
    credit: 'osm',
    from: { cafe: 'osm' },
    areas: [
      { k: 'building', p: [[-105.0804, 40.3053], [-105.0802, 40.3053], [-105.0802, 40.3051]] },
      { k: 'building', p: [[-105.2, 40.4], [-105.2, 40.41], [-105.19, 40.4]] },
    ],
    lines: [...data.lines, { n: 'North 5th Street', k: 'road', p: [[-105.0815, 40.30], [-105.0815, 40.31]] }],
  };
  const map = placeMap(osm, 'cafe')!;
  assert.equal(map.areas.length, 1);
  assert.equal(map.credit, 'osm');
  assert.equal(map.exact, true);
  assert.ok(map.labels.some((l) => l.text === 'N 5th St'));
  assert.equal(placeMap(data, 'cafe')!.exact, false);
});

test('a frame with fewer than two roads is no map', () => {
  assert.equal(placeMap({ ...data, lines: data.lines.slice(0, 1) }, 'cafe'), undefined);
});

test('the town\'s file is found by its folder', () => {
  assert.equal(placeMapFor({ '../data/berthoud/place-map.json': data }, 'berthoud'), data);
  assert.equal(placeMapFor({ '../data/berthoud/place-map.json': data }, 'niwot'), undefined);
});
