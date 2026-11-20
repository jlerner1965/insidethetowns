/**
 * The live town search's list (src/components/FindBar.astro): every full
 * guide, every sub-town page (Severance) and every town page beyond them,
 * each with its county line and what it is, A to Z. The home's hero carries
 * it (the owner, 20 November 2026: no search bar above the page).
 */
import { fullSections, getNetworkHub, sectionHome } from '../config/index.ts';
import { hubCountyLine, type HubTown } from '../config/hub-towns.ts';
import { extraTownPages, pagesBeyondSections } from './town-search-index.ts';

export interface FindEntry {
  /** The town's name. */
  n: string;
  /** Its county line. */
  c: string;
  /** "Full guide" or "Town page". */
  k: string;
  /** Its address. */
  u: string;
}

export function findIndex(hubTowns: readonly HubTown[]): FindEntry[] {
  const hub = getNetworkHub();
  const sections = fullSections();
  return [
    ...sections.map((t) => ({ n: t.name, c: hubCountyLine(t), k: 'Full guide', u: sectionHome(t) })),
    ...extraTownPages(sections).map((s) => ({ n: s.name, c: hubCountyLine(s.guide), k: 'Town page', u: `https://${hub.domain}/${s.slug}/` })),
    ...pagesBeyondSections(hubTowns, sections).map((t) => ({ n: t.name, c: hubCountyLine(t), k: 'Town page', u: `https://${hub.domain}/${t.slug}/` })),
  ].sort((a, b) => a.n.localeCompare(b.n));
}
