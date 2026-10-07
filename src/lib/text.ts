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
  const phrase = Math.max(cut.lastIndexOf(', '), cut.lastIndexOf(': '), cut.lastIndexOf('; '), cut.lastIndexOf('. '));
  // A cut that falls exactly at the end of a word keeps the word.
  const end = phrase >= budget * 0.5 ? phrase : /\s/.test(text[budget] ?? '') ? budget : cut.lastIndexOf(' ');
  return `${cut.slice(0, end > 0 ? end : budget).replace(/[\s,;:.]+$/, '')}…`;
}
