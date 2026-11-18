/**
 * The edits the places re-check (scripts/recheck-places.ts) and a person's
 * confirmation (scripts/confirm-place.ts) make to a place file's front
 * matter, line by line, so the rest of the file stays as it was written.
 * The rules are the owner's of 18 November 2026 (src/lib/place-recheck.ts).
 */
import { yamlString } from './event-files.ts';
import { getField, removeField, setField } from './review.ts';

const q = (s: string) => yamlString(s);

/** Read again by the nightly re-check: a new check date; a blocked-read flag it carried is answered. */
export function writeConfirmed(text: string, today: string, by: string, note: string, url: string): string {
  let out = setField(text, 'verified', q(today));
  out = setField(out, 'verifiedBy', q(`recheck-places (${by}): ${note}, ${url}`));
  out = removeField(out, 'readBlocked');
  if ((getField(out, 'changeNote') ?? '').includes('recheck-places ')) out = removeField(removeField(out, 'changeFlag'), 'changeNote');
  return out;
}

/** Another phone at the source: flagged with the evidence, for the weekly editor run. */
export function writeChanged(text: string, today: string, note: string, url: string | undefined): string {
  if ((getField(text, 'changeNote') ?? '').includes(note)) return text;
  return setField(setField(text, 'changeFlag', 'true'), 'changeNote', q(`recheck-places ${today}: ${note}${url ? `, ${url}` : ''}`));
}

/** The place's own page says it closed for good, naming it: closed (410 at the next map rebuild). */
export function writeClosed(text: string, today: string, quote: string, url: string): string {
  let out = setField(text, 'status', q('closed'));
  out = setField(out, 'closed', q(today));
  out = setField(out, 'statusNote', q(`The source page says it has closed for good, read by the nightly re-check on ${today}: “${quote.replace(/"/g, '”')}”`));
  out = setField(out, 'statusSource', q(url));
  return removeField(removeField(out, 'readBlocked'), 'closureCheck');
}

/**
 * The first blocked read flags the place for a person; `verified` stays,
 * and nothing is hidden while it is inside its window. A later blocked read
 * leaves the flag as it was, with the day it was first set.
 */
export function writeReadBlocked(text: string, today: string, note: string): string {
  if (getField(text, 'readBlocked')) return text;
  return setField(text, 'readBlocked', q(`${today}: ${note}`));
}

/** A sign it may have closed: for a person to confirm. Nothing hidden; never a 410 by itself. */
export function writeClosureCheck(text: string, today: string, note: string, quote?: string, url?: string): string {
  if (getField(text, 'closureCheck')) return text;
  return setField(text, 'closureCheck', q(`${today}: ${note}${quote ? ` (“${quote.replace(/"/g, '”')}”)` : ''}${url ? `, ${url}` : ''}`));
}

export const HAND_METHODS = ['browser', 'phone', 'email', 'in-person'] as const;
export type HandMethod = (typeof HAND_METHODS)[number];

/**
 * A person read the source (or called) on `on`: a verified read dated that
 * day, and every flag for a person cleared: set aside, blocked, possible
 * closure, and a change flag the re-check raised.
 */
export function confirmByHand(text: string, o: { on: string; how: HandMethod; by: string; note?: string }): string {
  let out = setField(text, 'verified', q(o.on));
  out = setField(out, 'verifiedBy', q(`${o.by}, ${o.how === 'browser' ? 'read in a browser' : `by ${o.how}`} on ${o.on}${o.note ? `: ${o.note}` : ''}`));
  for (const key of ['recheckPending', 'readBlocked', 'closureCheck']) out = removeField(out, key);
  if ((getField(out, 'changeNote') ?? '').includes('recheck-places ')) out = removeField(removeField(out, 'changeFlag'), 'changeNote');
  return out;
}

/** A person found it has closed for good: closed, with what they found and where. */
export function closeByHand(text: string, o: { on: string; how: HandMethod; by: string; note: string; source?: string }): string {
  let out = setField(text, 'status', q('closed'));
  out = setField(out, 'closed', q(o.on));
  out = setField(out, 'statusNote', q(o.note));
  if (o.source) out = setField(out, 'statusSource', q(o.source));
  out = setField(out, 'verified', q(o.on));
  out = setField(out, 'verifiedBy', q(`${o.by}, ${o.how === 'browser' ? 'read in a browser' : `by ${o.how}`} on ${o.on}: closed`));
  for (const key of ['recheckPending', 'readBlocked', 'closureCheck']) out = removeField(out, key);
  if ((getField(out, 'changeNote') ?? '').includes('recheck-places ')) out = removeField(removeField(out, 'changeFlag'), 'changeNote');
  return out;
}
