/**
 * Aggregated community calendars: a newspaper's events listing, a "what's on"
 * site. Anyone can submit to them and nobody there checks, which is how a
 * named jam host, a wrong street and a price nobody charges got onto the
 * Lyons guide (the check of 16 October 2026). An event resting on one alone
 * is shown as listed, not confirmed: a line on the page says where it was
 * seen, it appears only three weeks ahead, and it is kept out of the picks
 * (src/lib/confidence.ts). Add a row when a town's calendar turns out to be one.
 *
 * Free of imports, so the Chamber site's sync can load the confidence rule
 * from a checkout of this repository without its dependencies.
 */
export const COMMUNITY_CALENDARS: ReadonlyArray<{ host: string; paths?: string[]; name: string }> = [
  { host: 'lyonsrecorder.org', paths: ['/events', '/event/'], name: "the Lyons Recorder's community calendar" },
  { host: 'patch.com', paths: ['/calendar'], name: "Patch's community calendar" },
  { host: 'eventful.com', name: 'Eventful' },
  { host: '10times.com', name: '10times' },
];

/** The aggregated calendar a URL is on, by name, or undefined when it is not one. */
export function communityCalendar(url: string | undefined): string | undefined {
  if (!url) return undefined;
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return undefined;
  }
  const host = parsed.hostname.replace(/^www\./, '');
  for (const c of COMMUNITY_CALENDARS) {
    if (host !== c.host && !host.endsWith(`.${c.host}`)) continue;
    if (!c.paths || c.paths.some((p) => parsed.pathname.startsWith(p))) return c.name;
  }
  return undefined;
}
