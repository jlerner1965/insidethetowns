/**
 * A guide folded into its town's page on the hub (the restructure of 12
 * November 2026; TownConfig.hubPage): where each of its old addresses
 * goes. Rule 8 of the brief: to the matching place on the page, not only
 * to the top, and permanently.
 *
 * - an event address whose record has a page of its own on the hub goes
 *   to that page (FoldEvent; the brief of 13 November 2026);
 * - the other events pages (the list, every other event, This week, This
 *   weekend, /traditions/) go to the page's Traditions section;
 * - the outdoors pages (Things to do, the trails, trailheads and parks)
 *   go to its Outdoor dates section;
 * - the home page and everything else (a listing, an article, a hub
 *   page: none has a counterpart on a page that is dates only) go to the
 *   top of the page.
 *
 * vercel.json holds the rules as written out by this function, host-scoped
 * to the guide's domain; test/hub-fold.test.ts holds the two in step, so a
 * fold is a config change and `node scripts/fold-rules.ts --write`.
 */
export interface FoldRule {
  source: string;
  has: Array<{ type: 'host'; value: string }>;
  destination: string;
  permanent: true;
}

export const TRADITIONS_ANCHOR = 'traditions';
export const OUTDOOR_ANCHOR = 'outdoor-dates';

/** The old addresses that land on the Traditions section. */
export const TO_TRADITIONS = ['/events{/}?', '/events/(.*)', '/this-week{/}?', '/this-weekend{/}?', '/traditions{/}?', '/events.rss'] as const;
/** The old addresses that land on the Outdoor dates section. */
export const TO_OUTDOOR = ['/things-to-do{/}?', '/trails{/}?', '/trailheads{/}?', '/parks{/}?'] as const;

/**
 * One old event address with a page of its own to go to (the brief of 13
 * November 2026): `path` is the address on the guide, with its trailing
 * slash ("/events/olde-golden-candlelight-walk/"), and `event` the second
 * segment of the record's page on the town's page (src/lib/hub-towns.ts,
 * eventSegment). The rules for these come before the events catch-all, so
 * each is one hop to the page that carries the event, and nothing else
 * about the domain's rules changes. data/hub/fold-events.json holds the
 * reviewed map (foldEventTargets).
 */
export interface FoldEvent {
  path: string;
  event: string;
}

/** The map as the data file holds it: host, then old path to record slug. */
export type FoldEventMap = Record<string, Record<string, string>>;

/** An old address as a rule's source: with or without its trailing slash, and nothing after it. */
export function eventSource(path: string): string {
  return `${path.replace(/\/$/, '')}{/}?`;
}

/**
 * A domain's old event addresses, each with its record's page segment,
 * from the reviewed map and the records. Throws on a record the map names
 * that does not exist, or that has no page of its own (its home is not a
 * published hub town page), rather than write a rule to a 404; and on an
 * address that is not an event's.
 */
export function foldEventTargets(
  map: FoldEventMap,
  domain: string,
  town: string,
  pageFor: (slug: string) => { town: string; event: string } | undefined,
): FoldEvent[] {
  return Object.entries(map[domain] ?? {}).map(([path, slug]) => {
    if (!/^\/events\/[a-z0-9-]+\/$/.test(path)) throw new Error(`${domain}${path}: not an event address (/events/<slug>/).`);
    const page = pageFor(slug);
    if (!page) throw new Error(`${domain}${path} → ${slug}: no such record, or it has no page of its own.`);
    if (page.town !== town) throw new Error(`${domain}${path} → ${slug}: the record's page is /${page.town}/, not this domain's town /${town}/.`);
    return { path, event: page.event };
  });
}

export function foldRules(domain: string, hubDomain: string, town: string, events: readonly FoldEvent[] = []): FoldRule[] {
  const page = `https://${hubDomain}/${town}/`;
  const has: FoldRule['has'] = [{ type: 'host', value: domain }];
  const rule = (source: string, destination: string): FoldRule => ({ source, has, destination, permanent: true });
  return [
    rule('/', page),
    // Each old event address with a page of its own, before the events catch-all.
    ...events.map((e) => rule(eventSource(e.path), `${page}${e.event}/`)),
    ...TO_TRADITIONS.map((s) => rule(s, `${page}#${TRADITIONS_ANCHOR}`)),
    ...TO_OUTDOOR.map((s) => rule(s, `${page}#${OUTDOOR_ANCHOR}`)),
    rule('/(.*)', page),
  ];
}
