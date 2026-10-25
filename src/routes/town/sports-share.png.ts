/**
 * The share cards: /sports/share/<image>.png, one per school the town
 * follows and one per team with data, drawn at build (src/lib/share-image.ts)
 * and set as the sports pages' og:image. The image names are
 * shareImagePath's (src/config/school-sports.ts).
 */
import type { APIRoute, GetStaticPaths } from 'astro';
import { getTown } from '@/config';
import { schoolsFor, shareImageName, type SchoolSports, type SportData, type SportsData } from '@/config/school-sports';
import { seasonOf, sportsDataFor, teamsWithData } from '@/lib/school-sports';
import { renderShareCard } from '@/lib/share-image';

const town = getTown();
const files = import.meta.glob<SportsData>('../../../data/*/sports*.json', { eager: true, import: 'default' });
const now = new Date();

interface Card {
  school: SchoolSports;
  data: SportsData;
  team?: SportData;
  /** Astro's props are an open record. */
  [key: string]: unknown;
}

export const getStaticPaths = (() =>
  schoolsFor(town.slug).flatMap((school) => {
    const data = sportsDataFor(school, files) ?? { generated: '', sports: [] };
    const cards: Card[] = [{ school, data }, ...teamsWithData(data).map((team) => ({ school, data, team }))];
    return cards.map((card) => ({ params: { image: shareImageName(card.school, card.team?.key) }, props: card }));
  })) satisfies GetStaticPaths;

const recordLine = (team: SportData, seasonWord: string) =>
  [team.overall ? `${team.overall} this ${seasonWord}` : undefined, team.league ? `${team.league.record} in the ${team.league.name}` : undefined].filter(Boolean).join(' · ');

export const GET: APIRoute = async ({ props }) => {
  const { school, data, team } = props as Card;
  const seasonWord = seasonOf(team ? { generated: data.generated, sports: [team] } : data, school.teams, now).season.toLowerCase();
  const teams = teamsWithData(data);
  const body = await renderShareCard({
    color: school.colors?.primary ?? town.colors.primary,
    title: team ? `${school.mascot} ${team.name.toLowerCase()}` : `${school.mascot} sports`,
    record: team ? recordLine(team, seasonWord) : teams.filter((t) => t.overall).slice(0, 4).map((t) => `${t.name} ${t.overall}`).join(' · ') || undefined,
    footer: `Scores and schedules · ${town.siteTitle}`,
  });
  return new Response(new Uint8Array(body), { headers: { 'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=86400' } });
};
