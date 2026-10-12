/**
 * The weekly email's editions: which guides share an issue.
 *
 * Every guide the email covers is in exactly one edition. Most are an
 * edition of their own; the hub's newsletter config names the few that share
 * one (Windsor, Severance and Timnath; Idaho Springs and Georgetown; Loveland
 * and Johnstown). A shared edition is one issue, one signup box and one
 * sponsor line, sent to every subscriber tagged with any of its towns, so a
 * reader who ticks Windsor and Timnath gets it once. Each guide keeps its
 * own site and its own subscribers' tags. Pure, so it can be tested without
 * a build.
 */
import type { NewsletterEdition, Sponsor, TownConfig } from '../config/towns/types.ts';

export interface Edition {
  /** The draft's file name and the box's id: the town's slug for an edition of one. */
  slug: string;
  /** "Windsor, Severance and Timnath", or the town's name. */
  name: string;
  /** The guides in it, the lead town first. */
  towns: TownConfig[];
  /** A shared edition's own sponsor; an edition of one uses its town's. */
  sponsor?: Sponsor;
  /** More than one guide. */
  shared: boolean;
}

/**
 * The editions for the guides the email covers, A to Z by name. A shared
 * edition keeps the towns of it that are covered, in its own order; one left
 * with a single town is that town's own edition, so a guide going quiet does
 * not leave an edition named for a town it no longer reaches.
 */
export function editionsOf(covered: readonly TownConfig[], shared: readonly NewsletterEdition[] = []): Edition[] {
  const bySlug = new Map(covered.map((t) => [t.slug, t]));
  const placed = new Set<string>();
  const out: Edition[] = [];
  for (const e of shared) {
    const towns = e.towns.map((slug) => bySlug.get(slug)).filter((t): t is TownConfig => !!t && !placed.has(t.slug));
    if (towns.length < 2) continue;
    for (const t of towns) placed.add(t.slug);
    out.push({ slug: e.slug, name: e.name, towns, sponsor: e.sponsor, shared: true });
  }
  for (const t of covered) {
    if (placed.has(t.slug)) continue;
    out.push({ slug: t.slug, name: t.name, towns: [t], sponsor: t.sponsors?.email, shared: false });
  }
  return out.sort((a, b) => a.name.localeCompare(b.name));
}

/** The edition a guide's readers get, or undefined when the email does not cover it. */
export function editionFor(slug: string, editions: readonly Edition[]): Edition | undefined {
  return editions.find((e) => e.towns.some((t) => t.slug === slug));
}
