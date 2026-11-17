/**
 * Hub pages whose place is now a guide's (the owner's Severance decision,
 * 13 November 2026). The Windsor and Severance guide owns Severance; the
 * hub's Severance pages named themselves canonical and competed with it in
 * search. Severance's three records are at home on the guide now (their
 * `town.guide` is `windsor`), so the hub builds no page of its own for
 * them, and each old address is a redirect page (Astro's: a meta refresh,
 * noindex, and a canonical to the guide's page), out of the sitemap.
 *
 * The redirect page is the fallback: vercel.json carries a 301 for each,
 * scoped to the hub's host (hubMovedRules, written by `node
 * scripts/fold-rules.ts --write`; the search audit of 17 November 2026
 * found the pages answering 200 with noindex and a canonical to another
 * domain, which is no move at all). The check of what was built reads
 * each target as a link to the guide (scripts/lib/site-check.ts), and
 * check-network fails if the guide does not build it.
 */
export const HUB_MOVED: Readonly<Record<string, string>> = {
  // A live guide's town at the hub's address for a town: the guide itself
  // (the review of 14 November 2026: insidethetowns.com/erie/ was "page not
  // found" while /golden/ worked). Carbon Valley's three towns go to its home.
  '/berthoud': 'https://insideberthoud.com/',
  '/erie': 'https://insideerie.com/',
  '/johnstown': 'https://insidejohnstown.com/',
  '/windsor': 'https://insidewindsorco.com/',
  '/carbon-valley': 'https://carbonvalleyguide.com/',
  '/frederick': 'https://carbonvalleyguide.com/',
  '/firestone': 'https://carbonvalleyguide.com/',
  '/dacono': 'https://carbonvalleyguide.com/',
  '/lyons': 'https://insidelyons.com/',
  '/niwot': 'https://insideniwot.com/',
  '/severance': 'https://insidewindsorco.com/severance/',
  '/severance/trick-or-treat-parade': 'https://insidewindsorco.com/events/trick-or-treat-parade/',
  // The guide's Town Christmas page carries its date (/events/town-christmas-2026-12-12/);
  // with no lasting page, the old address goes to the guide's Severance section.
  '/severance/town-christmas': 'https://insidewindsorco.com/severance/',
  '/severance/kids-fishing-derby': 'https://insidewindsorco.com/events/kids-fishing-derby/',
};

export interface HubMovedRule {
  source: string;
  has: Array<{ type: 'host'; value: string }>;
  destination: string;
  statusCode: 301;
}

/** The moved pages as vercel.json rules on the hub's host, a 301 each, in the order above. */
export function hubMovedRules(hubDomain: string): HubMovedRule[] {
  return Object.entries(HUB_MOVED).map(([from, to]) => ({ source: `${from}{/}?`, has: [{ type: 'host', value: hubDomain }], destination: to, statusCode: 301 }));
}
