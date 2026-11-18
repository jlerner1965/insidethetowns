/**
 * Edits to a tradition record's front matter that keep the file as a person
 * wrote it: the `dateWindow` block before `years:`, and one year's entry in
 * its place among the years, newest first (scripts/date-watch.ts).
 */
import type { DateWindow } from '../../src/lib/date-watch.ts';

/** The `dateWindow:` block written in, or replaced, just before `years:`. */
export function setWindow(text: string, w: DateWindow): string {
  const block = `dateWindow:\n  start: "${w.start}"\n  end: "${w.end}"\n`;
  if (/^dateWindow:\n(?: {2}.*\n)+/m.test(text)) return text.replace(/^dateWindow:\n(?: {2}.*\n)+/m, block);
  return text.replace(/^years:\n/m, `${block}years:\n`);
}

/** One year's entry as the files write it: with a confirmed date, the page it was read on and the words read there. */
export function yearBlock(y: { year: number; status: string; date?: string; endDate?: string; sourceUrl?: string; readText?: string; checked: string }): string {
  return (
    [
      `  - year: ${y.year}`,
      `    status: ${y.status}`,
      ...(y.date ? [`    date: ${y.date}`] : []),
      ...(y.endDate ? [`    endDate: ${y.endDate}`] : []),
      ...(y.sourceUrl ? [`    sourceUrl: ${JSON.stringify(y.sourceUrl)}`] : []),
      ...(y.readText ? [`    readText: ${JSON.stringify(y.readText)}`] : []),
      `    checked: ${y.checked}`,
    ].join('\n') + '\n'
  );
}

/**
 * That year's entry replaced by `block`, or the block put in its place among
 * the years, newest first. A year that carries more than the watch knows
 * (a place, a time, sub-events) is left to a person: only a not-announced
 * entry, or none, is written over.
 */
export function setYear(text: string, year: number, block: string): string {
  const start = text.indexOf('\nyears:\n');
  const end = text.indexOf('\n---', start + 1);
  if (start === -1 || end === -1) throw new Error('no years list');
  const head = text.slice(0, start + '\nyears:\n'.length);
  const list = text.slice(start + '\nyears:\n'.length, end + 1);
  const tail = text.slice(end + 1);
  const blocks = list.split(/(?=^ {2}- year: )/m).filter((b) => b.trim());
  const yearOf = (b: string) => Number(b.match(/^ {2}- year: (\d+)/)?.[1]);
  const at = blocks.findIndex((b) => yearOf(b) === year);
  if (at >= 0) blocks[at] = block;
  else {
    const before = blocks.findIndex((b) => yearOf(b) < year);
    blocks.splice(before === -1 ? blocks.length : before, 0, block);
  }
  return head + blocks.join('') + tail;
}

