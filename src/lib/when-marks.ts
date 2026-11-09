/**
 * The days and times in a program's "When" line, marked so the row can set
 * them in bold: "Little Spikers **Wednesdays 4–4:45 pm**; Little Dribblers
 * **Fridays 4–4:45 pm**". The line is the organizer's words, often several
 * groups in one; the days and hours are what a parent scans it for, and set
 * like the rest they read as one block (the owner, 9 November 2026).
 *
 * Only the When line: the program's summary says the same in prose, and
 * bold scattered through a paragraph marks nothing. Nothing is reworded; a
 * line with no day or time in it comes back as one plain segment.
 */

export interface WhenSegment {
  text: string;
  /** A day or a time: drawn in bold. */
  mark: boolean;
}

const MONTHS = 'Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec';
// "Sun" before a capitalised word that is not a month is a name ("Sun Country"), not Sunday.
const SHORT = String.raw`(?:Mon|Tues?|Wed|Thu(?:rs?)?|Fri|Sat|Sun)(?!\s+(?!${MONTHS})[A-Z])`;
const LONG = String.raw`(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)s?`;
const DAY = String.raw`(?:${LONG}|${SHORT}|[Ww]eekdays?|[Ww]eekends?)`;
const ORDINAL = String.raw`(?:1st|2nd|3rd|4th|[Ff]irst|[Ss]econd|[Tt]hird|[Ff]ourth|[Ll]ast)`;
// "1st and 3rd Tuesdays", "third Mondays", "Wed–Sun", "Monday to Friday", "Tuesday".
// Right after a day, a bare range is its hours: "Sat 7–8".
const DAYS = String.raw`(?:${ORDINAL}(?:(?:,\s*|\s+and\s+|\s*&\s*)${ORDINAL})*\s+)?${DAY}(?:\s*(?:[–-]|\s(?:to|through)\s)\s*${DAY})?(?:\s\d{1,2}(?::\d{2})?[–-]\d{1,2}(?::\d{2})?(?![\d:]|\s?(?:am|pm)))?`;
const MERIDIEM = String.raw`\s?(?:am|pm|a\.m\.|p\.m\.|AM|PM)`;
const CLOCK = String.raw`(?:\d{1,2}(?::\d{2})?${MERIDIEM}|\d{1,2}:\d{2}|noon)`;
// "4–4:45 pm", "8 am–4:30 pm", "10 am to noon", "noon–6 pm", "9:30"; a bare "7–8" is not taken for a time.
// "between 4 and 8 pm" is a range too.
const TIME = String.raw`(?:(?:\d{1,2}(?::\d{2})?(?:${MERIDIEM})?|noon)(?:\s*[–-]\s*|\s+to\s+)${CLOCK}|(?<=between\s)\d{1,2}(?::\d{2})?(?:${MERIDIEM})?\s+and\s+${CLOCK}|${CLOCK})`;
// "November 19", "Dec 5", "January 4 to 8": a date is what a parent looks for as much as a weekday.
const MONTH = String.raw`(?:January|February|March|April|May|June|July|August|September|October|November|December|(?:${MONTHS}|Sept)\.?)`;
const DATE = String.raw`${MONTH}\s\d{1,2}(?:st|nd|rd|th)?(?:\s*(?:[–-]|\sto\s|\sand\s)\s*\d{1,2}(?:st|nd|rd|th)?(?![\d:–-]))?`;
const WHEN_RE = new RegExp(String.raw`(?<![\p{L}\d])(?:(${DAYS}|${DATE})|(${TIME}))(?![\p{L}\d])`, 'gu');

export function whenMarks(text: string): WhenSegment[] {
  const out: Array<WhenSegment & { kind?: 'day' | 'time' }> = [];
  let at = 0;
  for (const m of text.matchAll(WHEN_RE)) {
    const start = m.index!;
    const kind = m[1] ? 'day' : 'time';
    const gap = text.slice(at, start);
    const prev = out.at(-1);
    // A day or date and its time with only a space, a comma or "at" between: one bold run, "Mondays at 4 pm", "November 19 at 4:15 pm".
    if (prev?.mark && prev.kind === 'day' && kind === 'time' && start === at + gap.length && /^(?:\s|,\s|\s(?:at|from)\s)$/.test(gap)) {
      prev.text += gap + m[0];
      prev.kind = 'time';
    } else {
      if (gap) out.push({ text: gap, mark: false });
      out.push({ text: m[0], mark: true, kind });
    }
    at = start + m[0].length;
  }
  if (at < text.length) out.push({ text: text.slice(at), mark: false });
  return out.map(({ text, mark }) => ({ text, mark }));
}
