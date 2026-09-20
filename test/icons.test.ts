/**
 * The .ico container is written by hand, so it is worth proving it is one.
 *
 * A malformed favicon does not fail a build or a page load; it just quietly
 * does not appear, which is the kind of thing nobody notices for a year.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { faviconSvg, iconIco, iconPng } from '../src/lib/icons.ts';
import { LIVE_TOWNS } from '../src/config/index.ts';

const SITES = ['hub', ...LIVE_TOWNS];
const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

test('every site has a favicon SVG to draw from', () => {
  for (const slug of SITES) {
    const svg = faviconSvg(slug).toString('utf8');
    assert.match(svg, /<svg[^>]*viewBox/, `${slug}: not an SVG`);
    assert.match(svg, /fill="#[0-9A-Fa-f]{6}"/, `${slug}: no colour to distinguish it`);
  }
});

test('the .ico is a well-formed single-image icon wrapping a PNG', async () => {
  const ico = await iconIco('niwot', 32);
  assert.equal(ico.readUInt16LE(0), 0, 'reserved must be 0');
  assert.equal(ico.readUInt16LE(2), 1, 'type 1 = icon');
  assert.equal(ico.readUInt16LE(4), 1, 'one image');

  assert.equal(ico.readUInt8(6), 32, 'width');
  assert.equal(ico.readUInt8(7), 32, 'height');
  assert.equal(ico.readUInt16LE(10), 1, 'colour planes');
  assert.equal(ico.readUInt16LE(12), 32, 'bits per pixel');

  const size = ico.readUInt32LE(14);
  const offset = ico.readUInt32LE(18);
  assert.equal(offset, 22, 'image follows the 6-byte header and one 16-byte entry');
  assert.equal(ico.length, 22 + size, 'declared length matches the file');
  assert.deepEqual(ico.subarray(offset, offset + 8), PNG_SIGNATURE, 'embedded image is a PNG');
});

test('a 256px icon writes its size as 0, which is what the format means by 256', async () => {
  const ico = await iconIco('niwot', 256);
  assert.equal(ico.readUInt8(6), 0);
  assert.equal(ico.readUInt8(7), 0);
});

test('the touch icon is a real 180px PNG', async () => {
  const png = await iconPng('niwot', 180);
  assert.deepEqual(png.subarray(0, 8), PNG_SIGNATURE);
  // IHDR width and height live at bytes 16-23.
  assert.equal(png.readUInt32BE(16), 180);
  assert.equal(png.readUInt32BE(20), 180);
});

test('each site renders a different icon, so the tab shows which town you are on', async () => {
  const seen = new Map<string, string>();
  for (const slug of SITES) {
    const hex = (await iconIco(slug, 32)).toString('hex');
    const clash = seen.get(hex);
    assert.equal(clash, undefined, `${slug} renders the same icon as ${clash}`);
    seen.set(hex, slug);
  }
});
