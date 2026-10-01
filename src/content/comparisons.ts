/**
 * The head-to-head pages under /moving/.
 *
 * Deliberately not generated for all 21 pairs. Twenty-one pages built from the
 * same table and no writing is thin content, and a search engine that decides
 * so about one of them tends to decide it about all of them. A pair gets a
 * page when somebody has written the paragraphs that make it worth reading;
 * adding one here is all it takes.
 */
import { LIVE_TOWNS } from '../config/index.ts';

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
      'Two towns that both roughly doubled in a decade, twenty minutes apart, and both straddle a county line. The difference is which way you drive and what you get to walk to.',
    body: [
      'Erie points at Boulder, Johnstown points at I-25. That is the whole comparison, and almost everything else follows from it. Erie sits on the plateau between Coal Creek and the interstate, twenty minutes from Boulder on Arapahoe Road and thirty-five from Denver; the people moving there are largely working in or near Boulder and declining to pay Boulder prices. Johnstown sits on the US 34 interchange itself, ten minutes from Loveland, fifteen from Greeley, twenty-five from Fort Collins and fifty from Denver. It is the better base if your work is in northern Colorado and the worse one if it is in Boulder.',
      'The other real difference is the downtown. Erie has an old coal-town grid on Briggs Street that filled up in the last decade — a cidery in the 1889 Davis building, a Creole café, tapas, a brewery in the old fire station — and it is walkable if you live near it, which most of Erie does not. Johnstown’s Parish Avenue is quieter and its commercial center of gravity has moved out to the interchange, where the shopping is. If you want to walk to a pint on a Friday, Erie is more likely to deliver it; if you want to be five minutes from a big-box run, Johnstown is.',
      'Schools split them both, and neither split is simple. Most of Erie is St. Vrain Valley, based in Longmont, with the Boulder County side in Boulder Valley. Most of Johnstown is Weld RE-5J, with the north-west of town — the Larimer County side — in Thompson, which is Loveland’s district; the town’s own schools page lists both. In both towns the district you get depends on which street you buy on, not which town you buy in. Neither is a reason to choose a town on its own, and in both it is a question to ask before you make an offer, against the district’s own boundary lookup rather than a listing.',
    ],
    verdict:
      'Boulder commute and a walkable old downtown: Erie. Northern Colorado commute and the interstate at the end of the road: Johnstown. Check the school district on the address either way.',
  },
  {
    a: 'timnath',
    b: 'windsor',
    question:
      'Two farm villages on Harmony Road that became towns in the same twenty years, five miles apart on either side of the county line, with the same drive to Fort Collins. The difference is what you get for being a few minutes further east.',
    body: [
      'Timnath sits against I-25 at the Harmony Road exit, ten minutes from south Fort Collins and twenty from Old Town. Windsor is five miles further east along Harmony and Colorado 392, which puts Fort Collins at about twenty minutes and Greeley and Loveland at about twenty each. If every drive you make goes west, Timnath saves you ten minutes a day. If your life is spread across northern Colorado — Greeley one way, Fort Collins the other, the interstate for Denver — Windsor is the middle of it, and that is most of why it has grown.',
      'Size is the other difference, and it is not close. Timnath was 625 people in 2010 and 6,487 in 2020, and nearly all of it was built after 2005: a three-block Old Town Main Street, the reservoir, the river trail, and the Costco and Walmart on Harmony that pay for the rest. Windsor was 18,644 in 2010 and 32,716 in 2020, and it was a town before the boom: a Main Street with a century of buildings on it, Windsor Lake and Boardwalk Park in the middle, its own library district and its own school district. It has the things a town of 30,000 has. Timnath has the things a town of 6,000 has, plus the Costco.',
      'Schools are where the two part company. Timnath is Poudre School District, with all three of its schools inside the town. Windsor has three districts inside its limits: most of town is Weld RE-4, the Windsor-Severance district, and the Larimer County side west of the county line is Poudre or Thompson, so two houses a mile apart can be in different districts, different counties and different sheriffs’ jurisdictions. Timnath is simple on that count. Windsor is a question to settle against the districts’ own boundary maps before you make an offer, not after.',
    ],
    verdict:
      'The Fort Collins commute and a simple answer on schools: Timnath. A real town with a lake and a Main Street in the middle of northern Colorado: Windsor, and check the school district on the address.',
  },
  {
    a: 'windsor',
    b: 'fortcollins',
    question:
      'A town of 32,000 and the city of 170,000 it sits twenty minutes east of. Nearly everyone who looks at Windsor is also looking at Fort Collins, and the question is whether the difference is worth the drive.',
    body: [
      'Fort Collins is the destination and Windsor is the commute to it, and that is the honest shape of the choice. Fort Collins has Old Town, the university, the Poudre and Horsetooth inside its limits, Transfort and the MAX line, Bustang to Denver, and most of northern Colorado’s jobs. Windsor has a lake, a Main Street, a recreation center, a library district and one weekday commuter bus, and it is twenty minutes from Fort Collins along Harmony Road and twenty from Greeley and Loveland the other way. If you will be in Fort Collins for work, for dinner and for the weekend anyway, you are paying for Windsor’s house and Fort Collins’ life, and only the house is cheaper.',
      'Growth tells the rest. Fort Collins went from 143,986 people in 2010 to 169,810 in 2020, eighteen per cent, and the neighborhoods within reach of Old Town cost what a university city’s do; most of what is new is on the south and east edges. Windsor went from 18,644 to 32,716, seventy-five per cent, nearly all of it in master-planned neighborhoods with metro districts, east and south of the old town, and the Town’s own count has kept climbing since. Windsor is where the new house is. Fort Collins is where the old one is, at a price.',
      'Schools are simpler in the city. Fort Collins is Poudre School District, with four comprehensive high schools and school choice across them. Windsor has three districts inside its limits — most of town is Weld RE-4, the Windsor-Severance district, and the Larimer County side is Poudre or Thompson — so which district a house is in depends on which side of the county line it stands, and so does the county, the sheriff and the ballot. In Windsor that is a question to settle against the districts’ boundary maps before an offer; in Fort Collins it is a question of which school within one district.',
    ],
    verdict:
      'The city, its downtown, its transit and one school district: Fort Collins. A new house with a lake and a Main Street, twenty minutes from everything in northern Colorado: Windsor, and check the school district on the address.',
  },
];

export const comparisonSlug = (c: Comparison) => `${c.a}-vs-${c.b}`;

/**
 * Only the pairs whose towns are both live. A comparison written before its
 * town launches links to a guide that does not serve yet, so it stays dark
 * until the town is in LIVE_TOWNS, like everything else about that town.
 */
export const liveComparisons = (): Comparison[] =>
  COMPARISONS.filter((c) => LIVE_TOWNS.includes(c.a) && LIVE_TOWNS.includes(c.b));
