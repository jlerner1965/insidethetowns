/**
 * The next issue of the Thursday email, as words (the audit of 13
 * November 2026: a page built on a Thursday morning said "Next issue
 * today" all day, after the 7 am send as before it). The send is an
 * instant, the send day at the send time in Colorado; once it has passed,
 * the next issue is a week on. The build writes the words and the
 * instant, and the page's script writes them again for the reader's
 * moment (NewsletterSignup.astro), so a stale build is right too.
 *
 * Only dates.ts, so it runs in the browser.
 */
import { addDays, dayKey, formatDayLong, parseLocal, startOfDay } from './dates.ts';

/** "07:00" from "7 am", "19:30" from "7:30 pm"; undefined for anything else. */
export function clockOf(sendTime: string | undefined): string | undefined {
  const m = sendTime?.trim().match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)$/i);
  if (!m) return undefined;
  const hour = (Number(m[1]) % 12) + (/pm/i.test(m[3]!) ? 12 : 0);
  return `${String(hour).padStart(2, '0')}:${m[2] ?? '00'}`;
}

/** The instant of a send on `day` (a Denver day): at its time, or the end of the day where no time is set. */
export function sendInstant(day: Date, sendTime?: string): Date {
  return parseLocal(`${dayKey(day)}T${clockOf(sendTime) ?? '23:59'}`);
}

/** The first send at or after `now`: `sendAt` itself, or a week on, as often as it takes, at the same Colorado clock time. */
export function nextIssueAt(sendAt: Date, now: Date, sendTime?: string): Date {
  let at = sendAt;
  for (let i = 0; i < 60 && now.getTime() >= at.getTime(); i++) at = sendInstant(addDays(startOfDay(at), 7), sendTime);
  return at;
}

/** "today, Thursday, November 12 at 7 am" before the send, "Thursday, November 19 at 7 am" after it. */
export function nextIssueWords(sendAt: Date, now: Date, sendTime?: string): string {
  const at = nextIssueAt(sendAt, now, sendTime);
  const when = `${formatDayLong(at)}${sendTime ? ` at ${sendTime}` : ''}`;
  return dayKey(at) === dayKey(now) ? `today, ${when}` : when;
}
