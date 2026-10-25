/**
 * The sports pages' share cards, 1200×630, drawn at build with sharp: the
 * school's colour as the ground, "<Mascot> <team>" or "<Mascot> sports",
 * the record, and "Scores and schedules · Inside <Town>", all set in
 * Instrument Sans from src/assets/fonts/ (sharp's text input takes a font
 * file, so the build depends on no system font). Text only: no logos and
 * no mascot artwork. One card per school and per team with data
 * (src/routes/town/sports-share.png.ts), set as the page's og:image.
 */
import { resolve } from 'node:path';
import sharp from 'sharp';

export const SHARE_WIDTH = 1200;
export const SHARE_HEIGHT = 630;
const MARGIN = 80;
const FONT_FILE = resolve('src/assets/fonts/InstrumentSans-Variable.ttf');

export interface ShareCard {
  /** The school's colour, "#572932": white type goes on it (check-colors proves 4.5:1). */
  color: string;
  /** "Spartans football", "Spartans sports". */
  title: string;
  /** "7-2 this fall · 3-1 in the 3A Cache la Poudre", or the teams' records for the school. */
  record?: string;
  /** "Scores and schedules · Inside Berthoud". */
  footer: string;
}

const escape = (text: string) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function line(markup: string, size: number): Promise<Buffer> {
  return sharp({ text: { text: markup, font: `Instrument Sans ${size}`, fontfile: FONT_FILE, rgba: true, width: SHARE_WIDTH - 2 * MARGIN, dpi: 72 } })
    .png()
    .toBuffer();
}

export async function renderShareCard(card: ShareCard): Promise<Buffer> {
  // The title at 96 fits "Resurrection Christian Cougars sports" on two lines; the record wraps where it must.
  const title = await line(`<span foreground="#ffffff" weight="bold">${escape(card.title)}</span>`, card.title.length > 26 ? 72 : 96);
  const record = card.record ? await line(`<span foreground="#ffffff">${escape(card.record)}</span>`, 44) : undefined;
  const footer = await line(`<span foreground="#ffffff" alpha="80%">${escape(card.footer)}</span>`, 34);
  const titleHeight = (await sharp(title).metadata()).height ?? 0;
  const layers = [
    { input: title, left: MARGIN, top: 120 },
    ...(record ? [{ input: record, left: MARGIN, top: 120 + titleHeight + 40 }] : []),
    { input: footer, left: MARGIN, top: SHARE_HEIGHT - MARGIN - 40 },
  ];
  return sharp({ create: { width: SHARE_WIDTH, height: SHARE_HEIGHT, channels: 4, background: card.color } })
    .composite(layers)
    .png()
    .toBuffer();
}
