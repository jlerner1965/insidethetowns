/**
 * The email that stands in for the event form.
 *
 * Nine guides have no form switched on yet and send readers to email
 * instead, and the hub takes events for towns we do not cover the same way.
 * A blank email leaves the sender to guess what we need, and one without the
 * date or the organizer's page cannot be checked without a round of replies
 * (audit, 7 October 2026). This one opens with the form's own questions in
 * the body, so the first message can be checked as it stands.
 */

/** What the form asks for, in its order. The email asks the same. */
export const EVENT_EMAIL_FIELDS = [
  'Event name',
  'Date and start time (Mountain Time)',
  'End time, or all day (optional)',
  'Other dates, or how it repeats (optional)',
  'Location (venue or address)',
  'Link to the organizer’s own page',
] as const;

/** A mailto: link with the subject set and the form's questions in the body. */
export function eventEmailHref(email: string, subject: string): string {
  // CRLF, as RFC 6068 asks for line breaks in a mailto body.
  const body = `${EVENT_EMAIL_FIELDS.map((f) => `${f}: `).join('\r\n')}\r\n\r\n`;
  return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
