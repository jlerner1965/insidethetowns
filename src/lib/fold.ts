/**
 * A guide folded into its town's page on the hub (the restructure of 12
 * November 2026; TownConfig.hubPage): where each of its old addresses
 * goes. Rule 8 of the brief: to the matching place on the page, not only
 * to the top, and permanently.
 *
 * - the events pages (the list, every event, This week, This weekend,
 *   /traditions/) go to the page's Traditions section;
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

export function foldRules(domain: string, hubDomain: string, town: string): FoldRule[] {
  const page = `https://${hubDomain}/${town}/`;
  const has: FoldRule['has'] = [{ type: 'host', value: domain }];
  const rule = (source: string, destination: string): FoldRule => ({ source, has, destination, permanent: true });
  return [
    rule('/', page),
    ...TO_TRADITIONS.map((s) => rule(s, `${page}#${TRADITIONS_ANCHOR}`)),
    ...TO_OUTDOOR.map((s) => rule(s, `${page}#${OUTDOOR_ANCHOR}`)),
    rule('/(.*)', page),
  ];
}
