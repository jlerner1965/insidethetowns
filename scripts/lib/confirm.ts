/**
 * Writing a person's confirmation into an event file: the `confirmed` block
 * (src/content/schemas.ts), and nothing the confirmation does not settle.
 * Kept pure so it can be tested; scripts/confirm-events.ts finds the files.
 *
 * A call settles three things on the file: that the event is on, a change
 * flag the re-check raised (the organizer has now said), and, for a staged
 * file, the question it was waiting on. It does not touch `verified`, which
 * says when the source page was read, or anything the organizer said
 * differently: a different time or day is the editor's edit to make.
 */
import { removeField, setField } from './review.ts';
import { yamlString } from './event-files.ts';
import type { ConfirmationMethod } from '../../src/lib/confidence.ts';

export interface Confirmation {
  how: ConfirmationMethod;
  with: string;
  /** Denver day, "2026-10-17". */
  on: string;
  note?: string;
}

export function confirmationYaml(c: Confirmation): string {
  const parts = [`how: ${c.how}`, `with: ${yamlString(c.with)}`, `on: ${yamlString(c.on)}`];
  if (c.note) parts.push(`note: ${yamlString(c.note)}`);
  return `{ ${parts.join(', ')} }`;
}

/** The file with the confirmation written in; a staged file's review block goes with it. */
export function confirmText(text: string, c: Confirmation): string {
  let out = setField(text, 'confirmed', confirmationYaml(c));
  out = removeField(removeField(out, 'changeFlag'), 'changeNote');
  return removeField(out, 'review');
}
