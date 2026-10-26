/**
 * Plain text from a listing's Markdown, and a clamp that cuts it cleanly.
 *
 * The event structured data took `event.body.slice(0, 300)`: the Markdown
 * as written, cut at the 300th character. Niwot's Great Pumpkin Party went
 * out as "…as the [Left Hand Valley Courier](https://www.lhvc.com/story/202"
 * and Berthoud's Neon Nights with its "**Friday, October 23**" (audit, 26
 * October 2026). A description is read by a search engine, a calendar or a
 * search result as text, so the Markdown is turned into the words a reader
 * sees first, and only then shortened, at a sentence or a word.
 *
 * Pure string work, no imports, so the builders, the page head, the hub's
 * search records and the tests all use the same two functions.
 */

/** Backslash escapes CommonMark allows, held aside while the markup is stripped. */
const ESCAPABLE = '\\`*_{}[]()#+-.!|~<>"\'&$%^=:;,?@/';
const HOLD = 0xe000; // private-use code points, one per escapable character

const NAMED_ENTITIES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
  ndash: '–',
  mdash: '—',
  hellip: '…',
  rsquo: '’',
  lsquo: '‘',
  rdquo: '”',
  ldquo: '“',
  middot: '·',
};

function decodeEntities(text: string): string {
  return text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (whole, name: string) => {
    if (name[0] === '#') {
      const code = name[1] === 'x' || name[1] === 'X' ? parseInt(name.slice(2), 16) : parseInt(name.slice(1), 10);
      return Number.isFinite(code) && code > 0 && code < 0x110000 ? String.fromCodePoint(code) : whole;
    }
    return NAMED_ENTITIES[name.toLowerCase()] ?? whole;
  });
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

/**
 * A link's words as a reader would say them. A series lists its sittings
 * as links written `[2026-10-19 at 13:00](url)`, one per occurrence
 * (content/<town>/events/*.md): the machine form is for the file, so in
 * text it reads "October 19 at 1 pm". Any other link keeps its words.
 */
function readableLinkText(words: string): string {
  const m = words.match(/^(\d{4})-(\d{2})-(\d{2}) at (\d{1,2}):(\d{2})$/);
  if (!m) return words;
  const month = MONTHS[Number(m[2]) - 1];
  const day = Number(m[3]);
  const hour = Number(m[4]);
  const minute = m[5];
  if (!month || day < 1 || day > 31 || hour > 23) return words;
  const h12 = hour % 12 || 12;
  const time = hour === 0 && minute === '00' ? 'midnight' : hour === 12 && minute === '00' ? 'noon' : `${h12}${minute === '00' ? '' : `:${minute}`} ${hour < 12 ? 'am' : 'pm'}`;
  return `${month} ${day} at ${time}`;
}

/**
 * The words of a piece of Markdown, as one line of plain text.
 *
 * Links keep their text and lose their URL; images, code fences, HTML tags,
 * reference definitions and table rules go; emphasis, strikethrough and
 * inline code keep their words and lose their marks; a backslash-escaped
 * character is the character; entities are decoded. Each paragraph, list
 * item and heading that does not end in punctuation is closed with a full
 * stop, so a list reads as sentences rather than one run-on line.
 */
export function markdownToText(markdown: string | undefined): string {
  if (!markdown) return '';
  let text = markdown.replace(/\r\n?/g, '\n');
  // 1. Escapes first, so "\*" is never read as emphasis.
  text = text.replace(/\\([\\`*_{}[\]()#+\-.!|~<>"'&$%^=:;,?@/])/g, (_, c: string) => String.fromCharCode(HOLD + ESCAPABLE.indexOf(c)));
  // 2. Blocks that are not words.
  text = text
    .replace(/^\s*(```|~~~)[\s\S]*?^\s*\1[^\n]*$/gm, '\n')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/^\s{0,3}\[[^\]\n]+\]:\s*\S+.*$/gm, '')
    .replace(/^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)*\|?\s*$/gm, '')
    .replace(/^\s{0,3}([-*_])(\s*\1){2,}\s*$/gm, '');
  // 3. Images, then links (inline, reference and auto), keeping the link's words.
  text = text
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/!\[[^\]]*\]\[[^\]]*\]/g, ' ')
    .replace(/\[([^\]]*)\]\((?:[^()\s]|\([^)]*\))*(?:\s+"[^"]*")?\)/g, (_, words: string) => readableLinkText(words))
    .replace(/\[([^\]]+)\]\[[^\]]*\]/g, '$1')
    // A link already cut short (a sentence split inside one): its words, no URL.
    .replace(/\[([^\]\n]*)\]\([^)\n]*$/gm, '$1')
    .replace(/\[(?=[^\]\n]*$)/gm, '')
    .replace(/<((?:https?:\/\/|mailto:)[^>\s]+)>/g, '$1');
  // 4. HTML: a block tag ends a block, a <br> is a space, every other tag goes.
  text = text
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<\/?(?:p|div|li|ul|ol|h[1-6]|tr|table|blockquote)\b[^>]*>/gi, '\n\n')
    .replace(/<\/?[a-z][^>]*>/gi, '');
  // 5. Blocks: a blank line, a heading, a list item or a table row starts
  //    one; any other line continues the block it is in (a soft wrap).
  const blocks: string[] = [];
  let current: string[] = [];
  const flush = () => {
    if (current.length) blocks.push(current.join(' '));
    current = [];
  };
  for (const raw of text.split('\n')) {
    const line = raw.replace(/^\s{0,3}(?:>\s?)+/, '').trim();
    if (!line) {
      flush();
      continue;
    }
    const heading = line.match(/^#{1,6}\s+(.*?)(?:\s+#+)?$/);
    const item = line.match(/^(?:[-*+]|\d{1,3}[.)])\s+(.*)$/);
    const row = line.match(/^\|(.*)\|$/);
    if (heading || row) {
      flush();
      current.push(heading ? heading[1]! : row![1]!.split('|').map((c) => c.trim()).filter(Boolean).join(', '));
      flush();
    } else if (item) {
      flush();
      current.push(item[1]!);
    } else current.push(line);
  }
  flush();
  // 6. Inline marks, the words kept; 7. a block without closing punctuation
  //    is closed with a full stop, so a list reads as sentences.
  const sentences = blocks
    .map((block) =>
      block
        .replace(/`+([^`]+?)`+/g, '$1')
        .replace(/(\*\*|__)(?=\S)(.+?)(?<=\S)\1/g, '$2')
        .replace(/~~(?=\S)(.+?)(?<=\S)~~/g, '$1')
        .replace(/(^|[^\w*])\*(?=\S)([^*]+?)(?<=\S)\*(?!\w)/g, '$1$2')
        .replace(/(^|[^\w])_(?=\S)([^_]+?)(?<=\S)_(?!\w)/g, '$1$2')
        .replace(/[\ue000-\ue0ff]/g, (c) => ESCAPABLE[c.charCodeAt(0) - HOLD] ?? '')
        .replace(/\s+/g, ' ')
        .trim(),
    )
    .filter(Boolean)
    .map((b, i, all) => (i < all.length - 1 && !/[.!?:;,…—–-]["'”’)-]?$/.test(b) ? `${b}.` : b));
  text = sentences.join(' ');
  // 8. The held escapes went back as themselves above; entities last.
  return decodeEntities(text).replace(/\s+/g, ' ').trim();
}

/** A full stop that ends an abbreviation, not a sentence: "St. Vrain", "Mt. Evans", "U.S. 36", an initial. */
const ABBREVIATION = /(?:\b(?:St|Mt|Dr|Mr|Mrs|Ms|Ave|Rd|Blvd|Hwy|No|vs|Co|Inc|Jr|Sr|a\.m|p\.m)|\b[A-Z]|\b[A-Z]\.[A-Z])$/;

/** Where the first sentence of plain text ends, or the whole text when none does. */
export function firstSentence(text: string): string {
  const flat = text.replace(/\s+/g, ' ').trim();
  for (const m of flat.matchAll(/[.!?]["'”’)]?(?= )/g)) {
    if (m[0].startsWith('.') && ABBREVIATION.test(flat.slice(0, m.index))) continue;
    return flat.slice(0, m.index + m[0].length);
  }
  return flat;
}

/**
 * Text cut to a budget of characters, never inside a word.
 *
 * At the end of the last whole sentence when one closes past half the
 * budget, so the result reads as a whole thought; else at the last word
 * that fits, with an ellipsis, and no dangling comma, colon or opening
 * bracket before it. Text within the budget comes back as it is (spaces
 * collapsed). A single word longer than the budget is the one case cut
 * inside a word, since there is nothing else to cut at.
 */
export function clampText(text: string, limit: number): string {
  const flat = text.replace(/\s+/g, ' ').trim();
  if (flat.length <= limit) return flat;
  const cut = flat.slice(0, limit);
  let sentence = -1;
  for (const m of cut.matchAll(/[.!?]["'”’)]?(?= )/g)) {
    if (m[0] === '.' && ABBREVIATION.test(cut.slice(0, m.index))) continue;
    sentence = m.index + m[0].length;
  }
  if (sentence > limit * 0.5) return cut.slice(0, sentence);
  // Room for the ellipsis; a cut that lands on the end of a word keeps it.
  const room = flat.slice(0, limit - 1);
  const space = /\s/.test(flat[limit - 1] ?? '') ? limit - 1 : room.lastIndexOf(' ');
  const words = space > 0 ? room.slice(0, space) : room;
  return `${words.replace(/[\s,;:.([{“‘"'–—-]+$/, '')}…`;
}
