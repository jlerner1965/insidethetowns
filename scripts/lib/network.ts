/**
 * The network as the checks see it: every domain it owns and whether a guide
 * is served there, and vercel.json's redirects. One place, so the site check
 * and the network check cannot disagree about which domains are ours.
 */
import { readFileSync } from 'node:fs';
import { allSites } from '../../src/config/index.ts';
import type { VercelRedirect } from './site-check.ts';

export function vercelRedirects(file = 'vercel.json'): VercelRedirect[] {
  return (JSON.parse(readFileSync(file, 'utf8')) as { redirects?: VercelRedirect[] }).redirects ?? [];
}

/**
 * Domain to "a guide is served here". The configs' domains, and any host
 * vercel.json redirects that has no config (a domain that only forwards):
 * a link to one of those is a link to a redirect.
 */
export function networkDomains(redirects: VercelRedirect[] = vercelRedirects()): Map<string, boolean> {
  const domains = new Map<string, boolean>();
  for (const rule of redirects) {
    for (const condition of rule.has ?? []) if (condition.type === 'host' && condition.value) domains.set(condition.value, false);
  }
  for (const site of allSites) domains.set(site.domain, site.kind === 'hub' || site.status === 'live');
  return domains;
}

/** The hub's page for one sent issue of the Thursday email (content/hub/issues/). */
export const SENT_ISSUE = /^\/newsletter\/\d{4}-\d{2}-\d{2}-[^/]+\/$/;

/** Where each build leaves its site's manifest for the network check (.cache/ is not committed). */
export const MANIFESTS = '.cache/manifests';
