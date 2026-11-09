/**
 * The quick answers under What's happening on the home page
 * (src/components/home/QuickAnswers.astro; the owner, 8 November 2026): the
 * families hub, the rec center's listing and the local changes page, each
 * one tap from the home page where the guide has them.
 *
 * No link repeats one the page already has (the owner, 9 November 2026):
 * Berthoud's "What changed in town" went where Worth knowing says "Every
 * local change". (Its "Rec center hours & swim" stays: the Today tab's rec
 * line links the same listing, but that tab is closed from Friday to
 * Sunday, so the home page does not count it; TownHome.astro.) A link the
 * page carries already gives its
 * place to the town's guides, then to the directory, each only where the
 * guide has an article or a place for that page to list, and neither where
 * the page links it already. The links are derived, never typed, so none
 * points at a page that does not build.
 */
import type { TownConfig } from '../config/towns/types.ts';

export interface QuickAnswer {
  label: string;
  href: string;
  /** The click event's name, after "quick-". */
  track: string;
}

export interface QuickAnswerInputs {
  town: Pick<TownConfig, 'name' | 'quickAnswers' | 'families'>;
  /** The rec center listing's slug from the schedule file, where the town has one. */
  recPlace?: string;
  /** The guide has at least one local change filed. */
  hasUpdates: boolean;
  /** The guide has at least one article, so /guides/ lists something. */
  hasGuides: boolean;
  /** The guide has at least one place, so /directory/ lists something. */
  hasPlaces: boolean;
  /** The pages the rest of the home page already links. */
  linked: ReadonlySet<string>;
}

/** The links, in order; the component shows them only where there are two or more. */
export function quickAnswerLinks({ town, recPlace, hasUpdates, hasGuides, hasPlaces, linked }: QuickAnswerInputs): QuickAnswer[] {
  const config = town.quickAnswers;
  if (!config) return [];
  const rec = config.recCenter ?? (recPlace ? { label: 'Rec center hours & swim', place: recPlace } : undefined);
  const asked: QuickAnswer[] = [];
  if (town.families) asked.push({ label: 'Kids & family plans', href: '/families/', track: 'families' });
  if (rec) asked.push({ label: rec.label, href: `/places/${rec.place}/`, track: 'rec-center' });
  if (hasUpdates) asked.push({ label: 'What changed in town', href: '/updates/', track: 'updates' });
  const spare: QuickAnswer[] = [
    ...(hasGuides ? [{ label: `${town.name} guides`, href: '/guides/', track: 'guides' }] : []),
    ...(hasPlaces ? [{ label: 'Every place, A to Z', href: '/directory/', track: 'directory' }] : []),
  ].filter((l) => !linked.has(l.href));
  return asked.flatMap((l) => (linked.has(l.href) ? spare.splice(0, 1) : [l]));
}
