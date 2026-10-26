/**
 * The standing rules under which a staged event or a source's change is
 * approved without a person at the prompt: the organizer's own calendar
 * said it, nothing about it is in doubt, and the file as published states
 * only what the feed stated. Everything else stays in the queue for
 * `npm run review`.
 *
 * Pure decisions over data read elsewhere, so the tests can pin them; the
 * CLI (scripts/auto-review.ts) reads the queue and writes the files. The
 * owner delegated this on 15 October 2026 ("run review automatically if
 * possible"); the rules err towards leaving an item waiting, because a
 * listing that waits a week costs less than a wrong one on the site.
 *
 * What is never approved here: a staged place (its reasons are the editor's
 * and need a site read), an item the editor held back by hand, anything
 * from a source that is not the organizer (a chamber's or a paper's listing
 * of someone else's event), an item whose venue the feed did not name, a
 * change that moves an event to another day or touches one date of a weekly
 * series.
 */
import { z } from 'astro/zod';
import type { TownConfig } from '../../src/config/towns/types.ts';
import { INGEST } from '../../src/config/ingest.ts';
import { eventSchema, type Change, type Source, type SourceCategory } from '../../src/content/schemas.ts';
import { dayKey, formatDayLong, formatTimeRange } from '../../src/lib/dates.ts';
import { parseFrontmatter } from './frontmatter.ts';
import { hostOf, titleSimilarity } from './ingest.ts';
import { applyChangeText, approveText, setField } from './review.ts';

/**
 * The registry categories whose feeds speak for the organizer: a town's,
 * county's or library's calendar lists its own events, a parks department
 * its own programs, a venue its own shows. A chamber or a paper lists other
 * people's events, which it may have copied wrong, so those wait.
 */
export const ORGANIZER_CATEGORIES: readonly SourceCategory[] = ['city-calendar', 'county', 'library', 'parks', 'venue'];

/** Further out than this and the feed is usually a placeholder (a "save the date" with last year's time). */
export const MAX_DAYS_AHEAD = 400;

/** A title that announces the organizer is closed is a notice, not an event; the editor decides what to do with it. */
const CLOSURE_RE = /\b(closed|closure|no (?:storytime|story time|class|school|meeting)|holiday hours)\b/i;

/** A calendar entry that is a service schedule, not something to attend. */
const SERVICE_RE = /\b(trash|recycling|garbage|street sweeping|snow removal|hydrant flushing|water shut-?off|leaf pickup|bulk pickup)\b/i;

/** What a feed puts in "location" when the event is a call or a mailing address, not a place. */
const NOT_A_PLACE_RE = /https?:|www\.|@|\b(?:microsoft teams|zoom|webex|google meet|meeting id|passcode|dial in|conference id|online|virtual|tbd|tba|p\.?o\.? box)\b|_{3,}/i;

/** Words in the organizer's description that mean the listing's `scheduled` may be wrong. */
const CALLED_OFF_RE = /\b(cancell?ed|postponed|rescheduled|sold out|has been moved|new date|new time)\b/i;

/** A title whose "board" is a game or a surfboard, not a body that meets: the civic guess is wrong, and `other` claims nothing. */
const CIVIC_BOARD_RE = /\b(board(?:s)? ?games?|game night|board game|skateboard|snowboard|paddle ?board|charcuterie board|vision board|board books?)\b/i;
const CIVIC_BODY_RE = /\b(board (?:meeting|of|study|work|retreat)|trustees|council|commission|committee|advisory|library board|town board|school board)\b/i;

/** Periods that end an abbreviation, not a sentence, protected before the split. */
const ABBREVIATIONS = /\b(a\.m|p\.m|mt|st|dr|mr|mrs|ms|jr|sr|vs|etc|no|ave|blvd|rd|hwy|ft|inc|co|u\.s|e\.g|i\.e|jan|feb|mar|apr|jun|jul|aug|sept?|oct|nov|dec|mon|tues?|wed|thurs?|fri|sat|sun)\./gi;

export type Verdict = { approve: true; text: string; by: string } | { approve: false; reasons: string[] };

/** A published event as the duplicate check needs it: one entry per date for a weekly series. */
export interface PublishedEvent {
  file: string;
  title: string;
  start: Date;
}

export interface EventContext {
  town: TownConfig;
  source: Source | undefined;
  published: PublishedEvent[];
  /** Today, "YYYY-MM-DD" in Denver. */
  today: string;
  /** Who stands behind the run: named in verifiedBy after the feed. */
  by: string;
  /** The published file that would be written; the decision refuses if it exists. */
  targetExists: boolean;
}

const schema = eventSchema(() => z.string());

/** The decision on one staged event file. */
export function decideEvent(text: string, ctx: EventContext): Verdict {
  const reasons: string[] = [];
  let data: Record<string, unknown>;
  let body: string;
  try {
    ({ data, body } = parseFrontmatter(text));
  } catch (err) {
    return { approve: false, reasons: [`cannot read the file: ${(err as Error).message}`] };
  }
  const review = (data.review ?? {}) as { reason?: string; since?: string; from?: string };
  if (review.from !== 'ingest') reasons.push(review.from ? `held by the editor (${review.from})` : 'not from ingest');
  const { source } = ctx;
  if (!data.sourceId) reasons.push('no sourceId: nothing says which feed it came from');
  else if (!source) reasons.push(`sourceId "${data.sourceId}" is not in the registry`);
  else {
    if (source.status !== 'confirmed') reasons.push(`source ${source.id} is ${source.status}, not confirmed`);
    if (!ORGANIZER_CATEGORIES.includes(source.category)) reasons.push(`source ${source.id} is a ${source.category}, which lists others' events`);
  }
  const parsed = schema.safeParse(data);
  if (!parsed.success) {
    reasons.push(...parsed.error.issues.map((i) => `${i.path.join('.') || '(root)'}: ${i.message}`));
    return { approve: false, reasons };
  }
  const d = parsed.data;
  if (d.status && d.status !== 'scheduled') reasons.push(`arrives ${d.status}; a new listing that is already ${d.status} is the editor's call`);
  if (/the feed gives no venue/.test(review.reason ?? '') || /^venue not given/i.test(d.venue)) reasons.push('the feed gives no venue');
  else if (NOT_A_PLACE_RE.test(d.venue)) reasons.push(`venue "${d.venue.slice(0, 60)}" is not a place`);
  else if (d.venue.length > 80) reasons.push('venue is too long to be a name');
  else if (d.venue.trim().split(/\s+/).length === 1 && !d.address) reasons.push(`venue "${d.venue}" is one word with no address: a room, not a place`);
  if (CLOSURE_RE.test(d.title)) reasons.push('title reads as a closure notice, not an event');
  // The title counts as the organizer's text: a CivicPlus calendar marks a
  // called-off meeting only there ("… - CANCELED"), with no status field and
  // no description, and the Erie feed did so on 12 October 2026.
  const said = `${d.title}\n${body.replace(/<!--[\s\S]*?-->/g, '')}`.match(CALLED_OFF_RE);
  if (said) reasons.push(`the organizer's text says "${said[0]}"; the status is a person's call`);
  if (SERVICE_RE.test(d.title)) reasons.push('title reads as a service schedule, not an event');
  const startDay = dayKey(d.start);
  if (startDay < ctx.today) reasons.push(`starts ${startDay}, already past`);
  const daysAhead = Math.round((d.start.getTime() - new Date(`${ctx.today}T12:00:00Z`).getTime()) / 86_400_000);
  if (daysAhead > MAX_DAYS_AHEAD) reasons.push(`starts ${startDay}, more than ${MAX_DAYS_AHEAD} days out`);
  if (d.repeat) reasons.push('a repeating series from a feed needs a person to set its run');
  if (ctx.town.subTowns && !d.subTown) reasons.push(`a ${ctx.town.name} listing needs a subTown`);
  const dup = ctx.published.find((p) => dayKey(p.start) === startDay && titleSimilarity(p.title, d.title) >= INGEST.titleMatch);
  if (dup) reasons.push(`may be ${dup.file} ("${dup.title}", the same day)`);
  // Ingest's own duplicate check (same place and time, a looser title): a person merges or rejects.
  if (/^Possible duplicate of /.test(review.reason ?? '')) reasons.push('ingest flagged it as a possible duplicate of a published listing');
  if (ctx.targetExists) reasons.push('a published file with this slug already exists');
  if (reasons.length) return { approve: false, reasons };

  const src = source!;
  const by = `auto-review from the ${src.name} feed read ${review.since ?? ctx.today}, ${ctx.by}`;
  let out = approveText(text, ctx.today, by, 'event');
  // Ingest's category is a keyword guess; "board" made a game night civic.
  // The one guess the rules can see through is undone to `other`, which
  // claims nothing; the rest stand as guessed, and the page shows them.
  if (d.category === 'civic' && CIVIC_BOARD_RE.test(d.title) && !CIVIC_BODY_RE.test(d.title)) {
    out = setField(out, 'category', 'other');
    d.category = 'other';
  }
  out = replaceBody(out, publishedBody(d, src, body));
  const check = schema.safeParse(parseFrontmatter(out).data);
  if (!check.success) return { approve: false, reasons: check.error.issues.map((i) => `${i.path.join('.') || '(root)'}: ${i.message}`) };
  return { approve: true, text: out, by };
}

/**
 * The body as published: one sentence in the guide's words, stating only
 * what the feed's fields state, then the organizer's own description as a
 * quotation that says whose words they are. Ingest asks for a rewrite; a
 * rule cannot write, so it quotes, and never passes the organizer's copy
 * off as the guide's.
 */
export function publishedBody(d: z.infer<typeof schema>, source: Source, stagedBody: string): string {
  const when = `${formatDayLong(d.start)}, ${formatTimeRange(d.start, d.end, d.allDay)}`;
  const cost = d.cost && /^free\b/i.test(d.cost) ? ' Free.' : '';
  const lead = `${d.title} at ${d.venue}, ${when}.${cost} Listed by ${source.name}; the organizer's page has the details and any registration.`;
  const quote = quoteFrom(stagedBody);
  return quote ? `${lead}\n\n> ${quote}\n>\n> — ${source.name}, its listing` : lead;
}

/**
 * The organizer's description, fit to quote: comments, tags, links, and
 * the "Sign Up" and dial-in lines gone; the first sentences up to about 300
 * characters, cut at a sentence end. Nothing when what is left is too short
 * to mean anything or has no sentence end to cut at.
 */
export function quoteFrom(stagedBody: string): string | undefined {
  const lines = stagedBody
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<[^>]+>/g, ' ')
    .split(/\n+/)
    .map((l) => l.replace(/https?:\/\/\S+|www\.\S+|\b[a-z0-9-]+(?:\.[a-z0-9-]+)*\.(?:org|com|net|gov|us|edu|info|co)\b\S*/gi, '').replace(/\s+/g, ' ').trim())
    .filter((l) => l && l.split(' ').length >= 3)
    // A line with no sentence end is a label ("For 6th-12th graders", "Registration is required") unless it runs long enough to be prose.
    .filter((l) => /[.!?]["”’)]?$/.test(l) || l.split(' ').length >= 8)
    .map((l) => (/[.!?]["”’)]?$/.test(l) ? l : `${l}.`));
  const text = lines
    .join(' ')
    .replace(/\s+([.,;!?])/g, '$1')
    .replace(ABBREVIATIONS, (m) => m.replace(/\./g, '\u0000'))
    .replace(/\b([A-Z])\./g, '$1\u0000');
  // Cut where a sentence end is followed by a space, so "(bring friends!), ask…"
  // stays inside its sentence instead of a new one starting at the bracket.
  const sentences = text
    .split(/(?<=[.!?]["”’)]?)\s+/)
    .filter((s) => /[.!?]["”’)]?$/.test(s))
    .map((s) => s.replace(/\u0000/g, '.').trim())
    // A fragment: it starts lowercase, or it is a word or two.
    .filter((s) => /^[^a-z]/.test(s) && s.split(' ').length >= 3)
    // A pointer, not a description: where to sign up, where to read more, how to dial in.
    .filter((s) => !/\b(sign ?up|register (?:here|now|online)|click here|learn more|read more|more information|more info|meeting id|passcode|dial in|conference id|find a local number|for organizers)\b/i.test(s));
  const taken: string[] = [];
  for (const s of sentences) {
    if (taken.length === 2) break;
    if (taken.join(' ').length + s.length + 1 > 300) break;
    taken.push(s);
  }
  const quote = taken.join(' ');
  return quote.length >= 40 ? quote : undefined;
}

/** The file with its body (everything after the frontmatter) replaced. */
export function replaceBody(text: string, body: string): string {
  const end = text.indexOf('\n---', 3);
  if (end === -1) throw new Error('frontmatter block is not closed');
  return `${text.slice(0, end)}\n---\n\n${body}\n`;
}

export interface ChangeContext {
  source: Source | undefined;
  today: string;
  by: string;
}

/**
 * The decision on a change file against its published event: applied when
 * the same organizer feed the listing came from moved the time, named the
 * venue or called it off; left when another source says so, when it moves
 * the day, or when the listing is a weekly series (the file holds every
 * date, and the change is about one).
 */
export function decideChange(eventText: string, change: Change, ctx: ChangeContext): Verdict {
  const reasons: string[] = [];
  const parsed = schema.safeParse(parseFrontmatter(eventText).data);
  if (!parsed.success) return { approve: false, reasons: parsed.error.issues.map((i) => `${i.path.join('.') || '(root)'}: ${i.message}`) };
  const d = parsed.data;
  const { source } = ctx;
  if (!source) reasons.push(`sourceId "${change.sourceId}" is not in the registry`);
  else {
    if (source.status !== 'confirmed') reasons.push(`source ${source.id} is ${source.status}, not confirmed`);
    if (!ORGANIZER_CATEGORIES.includes(source.category)) reasons.push(`source ${source.id} is a ${source.category}, which lists others' events`);
  }
  // The same registry entry, or the same site: Longmont's museum and
  // recreation calendars are one City site with one set of ids, and a venue
  // the site changed is the organizer's change whichever feed read it.
  const sameSource = d.sourceId === change.sourceId || (!!hostOf(d.source) && hostOf(d.source) === hostOf(change.sourceUrl));
  if (!sameSource) reasons.push(`the listing came from ${d.sourceId ?? hostOf(d.source) ?? 'no source'}, the change from ${change.sourceId} (${hostOf(change.sourceUrl)})`);
  if (d.repeat) reasons.push('the listing is a weekly series; the change is about one date');
  if (dayKey(d.until ?? d.start) < ctx.today) reasons.push('the event has passed');
  for (const c of change.changes) {
    if (c.field === 'start' || c.field === 'end') {
      if (c.now.slice(0, 10) !== c.was.slice(0, 10)) reasons.push(`${c.field} moves to another day (${c.was} → ${c.now})`);
    } else if (c.field === 'venue') {
      if (NOT_A_PLACE_RE.test(c.now) || c.now.length > 80) reasons.push(`new venue "${c.now.slice(0, 60)}" is not a place`);
    } else if (c.field === 'status') {
      if (c.now !== 'canceled') reasons.push(`status → ${c.now} is not a cancellation`);
    } else reasons.push(`${c.field} is not a field the rules write`);
  }
  if (change.changes.length === 0) reasons.push('the change file lists no change');
  if (reasons.length) return { approve: false, reasons };
  const by = `auto-review from the ${source!.name} feed read ${dayKey(change.detected)}, ${ctx.by}`;
  const out = applyChangeText(eventText, change, source!.name, ctx.today, by);
  const check = schema.safeParse(parseFrontmatter(out).data);
  if (!check.success) return { approve: false, reasons: check.error.issues.map((i) => `${i.path.join('.') || '(root)'}: ${i.message}`) };
  return { approve: true, text: out, by };
}
