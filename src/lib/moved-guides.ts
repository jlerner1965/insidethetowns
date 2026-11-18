/**
 * Where an address on a moved guide's domain lands on the hub, in one hop
 * (the move of the seven guides, src/config/guide-move.ts): the same path
 * under the guide's section, /<town>/<path>, except an annual event's own
 * page, which the hub's tradition page for its record stands for
 * (data/hub/fold-events.json, reviewed by hand, as for the first move).
 *
 * One function for every place that writes such an address: the hub's own
 * forwarding rules (src/lib/hub-moved.ts), the section merge's links
 * (scripts/run.ts), the redirect map the guide's domain answers from
 * (scripts/migration/guide-map.ts), and the rules other domains carry onto
 * the guide (scripts/lib/redirect-rules.ts).
 */
import foldEvents from '../../data/hub/fold-events.json' with { type: 'json' };
import { allTowns, isMoved, type TownConfig } from '../config/index.ts';
import { foldEventTargets, type FoldEventMap } from './fold.ts';
import { hubEventPages, publishedHubTowns } from './hub-towns.ts';
import { rawRecords } from './tradition-files.ts';

/** The moved guide whose domain this is, with or without its www. */
export function movedGuide(domain: string): TownConfig | undefined {
  const host = domain.toLowerCase().replace(/^www\./, '');
  return allTowns.find((t) => (t.domain === host || t.formerDomains?.includes(host)) && isMoved(t) && !!t.hubPage);
}

/** A moved guide's hosts: its own domain and the domains that forward to it (TownConfig.formerDomains). */
export function movedHosts(guide: TownConfig): string[] {
  return [guide.domain, ...(guide.formerDomains ?? [])];
}

let pages: Map<string, { town: string; event: string }> | undefined;
/** Each record's own page on the hub, by record slug. */
function recordPages(): Map<string, { town: string; event: string }> {
  if (pages) return pages;
  const records = rawRecords();
  const published = new Set(publishedHubTowns(records).map((t) => t.slug));
  return (pages = new Map(hubEventPages(records, published).map((p) => [p.record.slug, { town: p.town, event: p.event }])));
}

const eventPaths = new Map<string, Record<string, string>>();
/**
 * A moved guide's annual events, old path to the tradition page:
 * { "/events/holiday-parade-of-lights/": "/lyons/holiday-parade-of-lights/" }.
 * Only records with a page of their own are named; foldEventTargets throws
 * on any other, rather than send an address to a 404.
 */
export function movedEventPaths(guide: TownConfig): Readonly<Record<string, string>> {
  const have = eventPaths.get(guide.slug);
  if (have) return have;
  const out = Object.fromEntries(
    foldEventTargets(foldEvents as FoldEventMap, guide.domain, guide.hubPage!.town, (slug) => recordPages().get(slug)).map((e) => [e.path, `/${e.town ?? guide.hubPage!.town}/${e.event}/`]),
  );
  eventPaths.set(guide.slug, out);
  return out;
}

/**
 * An address on a moved guide's domain as its place on the hub, a path on
 * the hub's host ("/lyons/places/oskar-blues-grill-brew/"), or undefined
 * when the domain is no moved guide's. The query and the fragment ride along.
 */
export function movedPath(domain: string, href: string): string | undefined {
  const guide = movedGuide(domain);
  if (!guide) return undefined;
  const at = href.search(/[?#]/);
  const path = at === -1 ? href : href.slice(0, at);
  const rest = at === -1 ? '' : href.slice(at);
  const slashed = path === '' ? '/' : path.endsWith('/') || /\.[a-z0-9]+$/i.test(path) ? path : `${path}/`;
  const event = movedEventPaths(guide)[slashed];
  if (event) return `${event}${rest}`;
  return `/${guide.hubPage!.town}${slashed}${rest}`;
}
