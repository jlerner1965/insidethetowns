import { test } from 'node:test';
import assert from 'node:assert/strict';
import { directionsUrl } from '../src/lib/places.ts';

test('directions: the town and state are added unless the address has them, and the town only once', () => {
  const to = (address: string, town = 'Johnstown') => decodeURIComponent(directionsUrl(address, town).split('destination=')[1]!);
  assert.equal(to('400 S Parish Ave'), '400 S Parish Ave, Johnstown, CO');
  assert.equal(to('400 S Parish Ave, Johnstown'), '400 S Parish Ave, Johnstown, CO', 'the address ends with the town already');
  assert.equal(to('400 S Parish Ave, Johnstown, CO 80534'), '400 S Parish Ave, Johnstown, CO 80534', 'a full address is sent as it is');
  assert.equal(to('7960 Niwot Road', 'Niwot'), '7960 Niwot Road, Niwot, CO', 'the town in a street name is not the town');
  assert.ok(directionsUrl('1 Main St', 'Erie').startsWith('https://www.google.com/maps/dir/?api=1&destination='));
});

test('a place page lets its first paragraph stand when it says what the summary says (audit, 13 November 2026)', async () => {
  const { repeatsSummary } = await import('../src/lib/places.ts');
  const summary = 'The family-owned coffee house on Mountain Avenue downtown: coffee, breakfast and lunch every day, and an Italian dinner on Thursday evenings.';
  assert.equal(repeatsSummary(summary, 'The family-owned coffee house on the main block: coffee, breakfast and lunch seven days a week. On Thursday evenings it serves an Italian dinner.\n\nCall ahead.'), true);
  assert.equal(repeatsSummary(summary, 'Parking is behind the building, off 3rd Street.\n\nThe coffee house opened in 2019.'), false);
  assert.equal(repeatsSummary(summary, ''), false);
});
