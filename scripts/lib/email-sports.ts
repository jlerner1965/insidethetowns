/**
 * The Thursday email's games (scripts/newsletter.ts): each school's week,
 * one line a game in the listings' style with the record after it, then
 * "Last week" and the link to the guide's scores. A town's issue heads each
 * school "<School> <Mascot> this week"; a shared edition gives the games one
 * section of their own, split by town like its other sections, so they are
 * not read as part of "This weekend".
 *
 * A game carries its day in full, never "Today" or "Tomorrow": the issue is
 * sent when its pull request is merged, the Thursday or the Friday, read on
 * any day after, and kept in the archive (newsletter-drafts.yml).
 */
import { schoolTeamName } from '../../src/config/school-sports.ts';
import { gameText, resultText } from '../../src/lib/school-sports.ts';
import type { SchoolWeek } from './sports-data.ts';

/**
 * One school's week under no heading: the week's games, football first,
 * then last week's football result where there was one and otherwise the
 * latest result of any team in the past seven days. Nothing for a week with
 * no games and no result.
 */
export function schoolWeekLines({ week }: SchoolWeek, scores: string): string[] {
  // "Last week" is a result from the past seven days, football's first:
  // an older one is not last week's, and is left out.
  const last = week.football ?? week.recent;
  const lastLine = last?.game.result || last?.game.place ? `Last week: ${resultText(last).replace(/^[A-Z]/, (c) => c.toLowerCase())}.` : undefined;
  if (!week.games.length && !lastLine) return [];
  const out = week.games.map((g) => {
    const [what, ...rest] = gameText(g, undefined, { relative: false }).split(' · ');
    return `- **${rest.join(' · ')}** [${what}](${g.game.url})${g.team.overall ? ` · ${g.team.overall} this season` : ''}`;
  });
  if (lastLine) out.push(...(out.length ? [''] : []), lastLine);
  out.push('', `[Scores and schedules](${scores})`, '');
  return out;
}

/** A town's issue: each school the town follows, under "<School> <Mascot> this week". */
export function townGames(sports: SchoolWeek[], scores: string): string[] {
  return sports.flatMap((s) => {
    const body = schoolWeekLines(s, scores);
    return body.length ? [`## ${schoolTeamName(s.school)} this week`, '', ...body] : [];
  });
}

export interface EditionTown {
  /** The town's heading in the edition: "Windsor and Severance". */
  heading: string;
  sports: SchoolWeek[];
  /** The town's own scores page, with the issue's campaign tags. */
  scores: string;
}

/**
 * A shared edition: "## Windsor Wizards and Timnath Cubs this week", then
 * each town's games under the town's heading, as "Still running" and "Next
 * week" are split; a town following more than one school names each. A town
 * with nothing is left out, and with nothing anywhere there is no section.
 */
export function sharedGames(towns: EditionTown[]): string[] {
  const blocks = towns.flatMap(({ heading, sports, scores }) => {
    const live = sports.map((s) => ({ name: schoolTeamName(s.school), body: schoolWeekLines(s, scores) })).filter((b) => b.body.length);
    return live.map((b) => ({ ...b, heading: live.length > 1 ? `${heading}: ${b.name}` : heading }));
  });
  if (!blocks.length) return [];
  const names = blocks.map((b) => b.name);
  const title = names.length === 1 ? names[0] : `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`;
  return [`## ${title} this week`, '', ...blocks.flatMap((b) => [`### ${b.heading}`, '', ...b.body])];
}
