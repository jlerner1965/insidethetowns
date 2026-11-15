/**
 * Shorten a sentence to a budget of characters at a phrase or a word, never
 * inside one. CSS line-clamp put its ellipsis wherever the last line ran out
 * ("…the three towns, Fift…", "…districts. W…"); this cuts at the last comma,
 * colon, semicolon or full stop within the budget when that keeps at least
 * half of it, else at the last space. The copy itself is not rewritten. A
 * clamp can stay on the element as a net for a narrower box than expected.
 */
export function shorten(text: string, budget: number): string {
  if (text.length <= budget) return text;
  const cut = text.slice(0, budget);
  // A period after a lone capital is an initial ("Philip S. Miller"), not a sentence's end.
  let stop = cut.lastIndexOf('. ');
  while (stop > 0 && /(^|\s)[A-Z]$/.test(cut.slice(0, stop))) stop = cut.lastIndexOf('. ', stop - 1);
  const phrase = Math.max(cut.lastIndexOf(', '), cut.lastIndexOf(': '), cut.lastIndexOf('; '), stop);
  // A cut that falls exactly at the end of a word keeps the word.
  const end = phrase >= budget * 0.5 ? phrase : /\s/.test(text[budget] ?? '') ? budget : cut.lastIndexOf(' ');
  return `${cut.slice(0, end > 0 ? end : budget).replace(/[\s,;:.]+$/, '')}…`;
}

/**
 * Typographic quotes and apostrophes for words a data file wrote with
 * straight ones (the review of 14 November 2026: "Santa's Lighted Forest",
 * "America's Mountain" and "Mary's Lake" on 64 town pages, and the home's
 * "Leadville's Tabors"): ’ in a word, ‘ ’ and “ ” around a quotation. For a
 * string where it is shown as text only; never a slug, a URL or an
 * attribute, which keep the file's characters. `inner` is for words the
 * page itself sets inside “ ” (an organizer's note): their own double
 * quotes become single ones, as a quotation inside a quotation is set.
 * Nothing else in the string changes.
 */
export function typeset(text: string, options?: { inner?: boolean }): string;
export function typeset(text: string | undefined, options?: { inner?: boolean }): string | undefined;
export function typeset(text: string | undefined, options: { inner?: boolean } = {}): string | undefined {
  if (!text || !/['"]/.test(text)) return text;
  const inner = options.inner ?? false;
  const open = inner ? '‘' : '“';
  const close = inner ? '’' : '”';
  return (
    text
      // An apostrophe for a missing letter or the century: "Loaf 'n Jug", "Beef 'N Bean Day", "the '27 festival".
      .replace(/(^|[\s(])'(?=(?:n|N)'?(?:\s|$)|\d\d\b)/g, '$1’')
      // Inside a word, or after one: "Santa's", "Miners' Day", "Rock 'n' roll".
      .replace(/(?<=[\p{L}\p{N}.])'/gu, '’')
      // What is left opens a quotation at the start or after a space or an opening mark, and closes one elsewhere.
      .replace(/(^|[\s(\[{“‘—–-])'/g, '$1‘')
      .replace(/'/g, '’')
      .replace(/(^|[\s(\[{‘—–-])"/g, `$1${open}`)
      .replace(/"/g, close)
  );
}
