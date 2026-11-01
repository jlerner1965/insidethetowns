/**
 * The one line under a town guide's name in the hero: what the guide does for
 * the reader this week, in the reader's terms, rather than facts about the
 * town (the owner, 1 November 2026: a town guide's hero should not say
 * "random things on the town"; that is a visitor guide's job). Every part
 * names something the home page below it has, so the line is a promise the
 * page keeps:
 *
 * - "What's on in <Town> this week": What's happening (Today, Tomorrow, This
 *   weekend) and /this-week/, on every guide.
 * - "what's new in town": Worth knowing and /updates/, which only a resident
 *   guide (`home`) has.
 * - "the one we'd go to": the week's pick, "Our pick" in What's happening,
 *   from the resident guides' weekly notes. Only in a week that has one:
 *   the editor leaves the pick out when nothing holds up, and the line
 *   never promises what the page below it does not show.
 * - "where to eat and drink": the Eat & drink tile, on the other town guides.
 *
 * A visitor guide keeps its place line (`shortTagline`): a visitor wants to
 * know what the place is. So does every other use of `shortTagline`, beside a
 * guide's name in another guide's footer or in Nearby this weekend.
 *
 * Two lengths, because the hero has two budgets (src/components/Hero.astro):
 * 64 characters on a phone and 88 from the small breakpoint up. Each is
 * written whole for its budget, so neither is cut with an ellipsis, which
 * read as a truncation error on the first line of the site.
 */
import type { TownConfig } from '@/config/towns/types';

export interface HeroLine {
  /** For a phone: at most 64 characters. */
  short: string;
  /** From the small breakpoint up: at most 88 characters. */
  long: string;
}

export const HERO_LINE_SHORT = 64;
export const HERO_LINE_LONG = 88;

export function heroLine(town: Pick<TownConfig, 'name' | 'home' | 'visitorGuide'>, { pick = false }: { pick?: boolean } = {}): HeroLine | undefined {
  if (town.visitorGuide) return undefined;
  const on = `What’s on in ${town.name} this week`;
  if (town.home) {
    const short = `${on}, and what’s new in town`;
    return { short, long: pick ? `${on}, what’s new in town, and the one we’d go to` : short };
  }
  const line = `${on}, and where to eat and drink`;
  return { short: line, long: line };
}
