/**
 * The head-to-head pages under /moving/.
 *
 * Deliberately not generated for all 21 pairs. Twenty-one pages built from the
 * same table and no writing is thin content, and a search engine that decides
 * so about one of them tends to decide it about all of them. A pair gets a
 * page when somebody has written the paragraphs that make it worth reading;
 * adding one here is all it takes.
 */
export interface Comparison {
  /** Town slugs. The URL is /moving/<a>-vs-<b>/ in this order. */
  a: string;
  b: string;
  /** One sentence: the real question behind the search. */
  question: string;
  /** Two or three paragraphs. Honest about who each one is not for. */
  body: string[];
  /** The one-line answer, for people who scrolled to the bottom first. */
  verdict: string;
}

export const COMPARISONS: Comparison[] = [
  {
    a: 'erie',
    b: 'johnstown',
    question:
      'Two Weld County towns that both roughly doubled in a decade, twenty minutes apart. The difference is which way you drive and what you get to walk to.',
    body: [
      'Erie points at Boulder, Johnstown points at I-25. That is the whole comparison, and almost everything else follows from it. Erie sits on the plateau between Coal Creek and the interstate, twenty minutes from Boulder on Arapahoe Road and thirty-five from Denver; the people moving there are largely working in or near Boulder and declining to pay Boulder prices. Johnstown sits on the US 34 interchange itself, ten minutes from Loveland, fifteen from Greeley, twenty-five from Fort Collins and fifty from Denver. It is the better base if your work is in northern Colorado and the worse one if it is in Boulder.',
      'The other real difference is the downtown. Erie has an old coal-town grid on Briggs Street that filled up in the last decade — a cidery in the 1889 Davis building, a Creole café, tapas, a brewery in the old fire station — and it is walkable if you live near it, which most of Erie does not. Johnstown’s Parish Avenue is quieter and its commercial centre of gravity has moved out to the interchange, where the shopping is. If you want to walk to a pint on a Friday, Erie is more likely to deliver it; if you want to be five minutes from a big-box run, Johnstown is.',
      'Schools split them too, and not simply. Most of Erie is St. Vrain Valley, based in Longmont, with the Boulder County side in Boulder Valley — so the district you get depends on which street you buy on. Johnstown is Weld RE-5J throughout, which is one fewer thing to check. Neither is a reason to choose a town on its own, but the Erie split is a reason to ask before you make an offer.',
    ],
    verdict:
      'Boulder commute and a walkable old downtown: Erie. Northern Colorado commute, simpler schools and the interstate at the end of the road: Johnstown.',
  },
];

export const comparisonSlug = (c: Comparison) => `${c.a}-vs-${c.b}`;
