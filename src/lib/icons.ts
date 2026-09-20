/**
 * Raster icons, generated at build time from the site's own favicon SVG.
 *
 * The network ships one SVG favicon per town and nothing else, which leaves
 * two gaps a browser notices. Every browser asks for /favicon.ico whether or
 * not the page links one — that was a 404 on every site — and iOS uses
 * apple-touch-icon when someone saves a page to their home screen, which for
 * a town events guide is a thing people actually do. Without it they get a
 * screenshot of the page.
 *
 * Rasterised from the same SVG rather than drawn again, so there is one mark
 * and the .ico cannot drift from the .svg.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';

/** The SVG this site's icons are drawn from. */
export function faviconSvg(slug: string): Buffer {
  return readFileSync(join('public', 'favicons', slug, 'favicon.svg'));
}

/** A square PNG at `size`, rendered at high density so the curves stay clean. */
export function iconPng(slug: string, size: number): Promise<Buffer> {
  return sharp(faviconSvg(slug), { density: 384 }).resize(size, size).png().toBuffer();
}

/**
 * A single-image .ico wrapping a PNG.
 *
 * ICONDIR (6 bytes) then one ICONDIRENTRY (16), then the PNG itself. PNG
 * inside ICO is understood by every browser still in use, and is far smaller
 * than the equivalent bitmap. A width or height of 256 is written as 0, which
 * is the format's way of saying "256"; at 32 that does not arise, but the
 * clamp is left in so a later size change cannot produce a silently broken
 * file.
 */
export async function iconIco(slug: string, size = 32): Promise<Buffer> {
  const png = await iconPng(slug, size);
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // 1 = icon
  header.writeUInt16LE(1, 4); // one image

  const entry = Buffer.alloc(16);
  entry.writeUInt8(size >= 256 ? 0 : size, 0); // width
  entry.writeUInt8(size >= 256 ? 0 : size, 1); // height
  entry.writeUInt8(0, 2); // palette size: none
  entry.writeUInt8(0, 3); // reserved
  entry.writeUInt16LE(1, 4); // colour planes
  entry.writeUInt16LE(32, 6); // bits per pixel
  entry.writeUInt32LE(png.length, 8);
  entry.writeUInt32LE(header.length + entry.length, 12); // offset of the image

  return Buffer.concat([header, entry, png]);
}
