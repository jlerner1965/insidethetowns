/**
 * Hub pages whose place is now a guide's (the owner's Severance decision,
 * 13 November 2026). The Windsor and Severance guide owns Severance; the
 * hub's Severance pages named themselves canonical and competed with it in
 * search. Severance's three records are at home on the guide now (their
 * `town.guide` is `windsor`), so the hub builds no page of its own for
 * them, and each old address is a redirect page (Astro's: a meta refresh,
 * noindex, and a canonical to the guide's page), out of the sitemap.
 *
 * A server 301 would be four host-scoped rules in vercel.json, which is
 * deploy configuration and was left alone; the rules are in the pull
 * request for the owner. The check of what was built reads each target as
 * a link to the guide (scripts/lib/site-check.ts), and check-network
 * fails if the guide does not build it.
 */
export const HUB_MOVED: Readonly<Record<string, string>> = {
  '/severance': 'https://insidewindsorco.com/severance/',
  '/severance/trick-or-treat-parade': 'https://insidewindsorco.com/events/trick-or-treat-parade/',
  // The guide's Town Christmas page carries its date (/events/town-christmas-2026-12-12/);
  // with no lasting page, the old address goes to the guide's Severance section.
  '/severance/town-christmas': 'https://insidewindsorco.com/severance/',
  '/severance/kids-fishing-derby': 'https://insidewindsorco.com/events/kids-fishing-derby/',
};
