/**
 * SociableKIT's copy of a Facebook page's events, the widget a venue embeds
 * when Facebook is where it keeps its calendar (MainStage Brewing, Lyons and
 * Gunbarrel, 10 November 2026). The widget draws from one JSON file,
 * https://data.accentapi.com/feed/<id>.json, a host with no robots.txt:
 *
 *   { "events": [ { "event_id": "1997929291615838", "name": "MainGrass - 11/27/26",
 *       "event_start_utc": "2026-11-28T01:00:00.000Z", "event_end_utc": "…",
 *       "location": "6035 Longbow Dr, Boulder, CO 80301-3256, United States",
 *       "html_link": "https://www.facebook.com/events/…", "description": "<div>…</div>",
 *       "is_online": "", "event_status": "" } ] }
 *
 * The times are instants. A date the venue files in the title ("MainGrass -
 * 11/27/26") comes off it. An event Facebook holds without an end is written
 * with the end equal to the start, so such an end is dropped. The file
 * reaches about three weeks ahead and is rebuilt as the venue posts.
 */
import { plainText, titleStatus, type FeedEvent, type Horizon } from './types.ts';

export interface SociableKitEvent {
  event_id?: string;
  event_time_id?: string;
  name?: string;
  event_start_utc?: string;
  event_end_utc?: string;
  location?: string;
  html_link?: string;
  description?: string;
  is_online?: string;
  event_status?: string;
}

/** Whether a feed URL is a SociableKIT events file. */
export function isSociableKitFeed(feedUrl: string): boolean {
  return /^https:\/\/data\.accentapi\.com\/feed\/\d+\.json$/i.test(feedUrl);
}

export function readSociableKit(data: { events?: SociableKitEvent[] }, horizon: Horizon): FeedEvent[] {
  const out: FeedEvent[] = [];
  const seen = new Set<string>();
  for (const event of data.events ?? []) {
    const uid = String(event.event_time_id || event.event_id || '').trim();
    // "MainGrass - 11/27/26", "MainJazz 11/29/26": the date is the venue's filing, not the name.
    const name = plainText(event.name ?? '')
      .replace(/\s*[-–]?\s*\d{1,2}\/\d{1,2}\/\d{2,4}\s*$/, '')
      .replace(/\s+/g, ' ')
      .trim();
    const start = event.event_start_utc ? new Date(event.event_start_utc) : undefined;
    if (!uid || !name || !start || Number.isNaN(start.getTime()) || seen.has(uid) || /^(1|true|yes)$/i.test(event.is_online ?? '')) continue;
    const rawEnd = event.event_end_utc ? new Date(event.event_end_utc) : undefined;
    const end = rawEnd && !Number.isNaN(rawEnd.getTime()) && rawEnd.getTime() > start.getTime() ? rawEnd : undefined;
    if ((end ?? start).getTime() < horizon.from.getTime() || start.getTime() >= horizon.to.getTime()) continue;
    seen.add(uid);
    const marked = titleStatus(name);
    const cancelled = /cancel/i.test(event.event_status ?? '');
    out.push({
      uid,
      title: marked.title,
      start,
      end,
      allDay: false,
      location: event.location?.replace(/,?\s*United States(,\s*Colorado\s*\d{5})?\s*$/i, '').trim() || undefined,
      url: event.html_link || undefined,
      description: event.description ? plainText(event.description) || undefined : undefined,
      categories: [],
      status: cancelled ? 'cancelled' : (marked.status ?? 'confirmed'),
    });
  }
  return out.sort((a, b) => a.start.getTime() - b.start.getTime());
}
