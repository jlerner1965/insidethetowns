/**
 * Injects the page routes that belong to the site being built. Town sites and
 * the hub share layouts and components but have different route sets, and
 * Astro has no way to exclude a file in src/pages per build, so the pages live
 * in src/routes/{town,hub}/ and are injected here. src/pages/ holds only the
 * routes every site has (about, contact, 404, robots.txt).
 */
import type { AstroIntegration } from 'astro';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { SiteConfig, TownConfig } from '../config/towns/types';
import { PLACE_TYPE_PAGES, placeTypePages } from '../lib/place-types.ts';
import { openPlaceTypeCounts } from '../lib/raw-places.ts';
import { schoolsFor, sportsDataFile, sportsPath, teamPath, type SportsData } from '../config/school-sports.ts';
import { teamsWithData } from '../lib/school-sports.ts';

const TOWN_ROUTES: Array<[pattern: string, file: string]> = [
  ['/', 'index.astro'],
  ['/events', 'events/index.astro'],
  ['/this-weekend', 'this-weekend.astro'],
  ['/this-week', 'this-week.astro'],
  ['/events/calendar.ics', 'events/calendar.ics.ts'],
  ['/events/[slug].ics', 'events/[slug].ics.ts'],
  ['/events/[slug]/[show].ics', 'events/[slug]/[show].ics.ts'],
  ['/rss.xml', 'rss.xml.ts'],
  ['/events.rss', 'events.rss.ts'],
  ['/events/[slug]', 'events/[slug].astro'],
  ['/places/[slug]', 'places/[slug].astro'],
  ['/articles/[slug]', 'articles/[slug].astro'],
  ['/guides', 'guides.astro'],
  ['/eat-drink', 'eat-drink.astro'],
  ['/things-to-do', 'things-to-do.astro'],
  ['/directory', 'directory.astro'],
  ['/for-businesses', 'for-businesses.astro'],
  ['/moving-here', 'moving-here.astro'],
  ['/submit-event', 'submit-event.astro'],
  ['/correct', 'correct.astro'],
  ['/thanks', 'thanks.astro'],
];

/**
 * A town that has not launched. Its Vercel project may exist before its
 * content does; until the config says `status: 'live'` the site is one
 * holding page, noindex, and nothing of the guide is served. The routes in
 * src/pages/ (about, contact, privacy) still build and are noindex too
 * (src/layouts/Base.astro), and robots.txt asks crawlers to stay out.
 */
const HOLDING_ROUTES: Array<[pattern: string, file: string]> = [['/', 'coming-soon.astro']];

/**
 * A guide covering several places (Carbon Valley: Frederick, Firestone and
 * Dacono) gets one section page per place, at the place's slug. Only such a
 * guide: on every other town the pattern would match nothing and Astro would
 * still try to build it.
 */
const SUB_TOWN_ROUTES: Array<[pattern: string, file: string]> = [['/[subTown]', 'sub-town/[subTown].astro']];

/**
 * High-school sports (data/<town>/sports*.json, `npm run sports`): one page
 * per school the town follows (src/config/school-sports.ts), at /sports/
 * for a town's only school and at /sports/<slug>/ for each of several, with
 * /sports/ then the list of them; and one page per team that has data
 * (read at least once, and not empty on MaxPreps), at /sports/<team>/ or
 * /sports/<slug>/<team>/. The data file is read from disk here, as the
 * content folders are, because this runs before the build's bundle exists;
 * a school whose run has never written has no team pages, and the pages
 * link only to the team pages that exist (src/lib/school-sports.ts).
 */
export function sportsRoutes(town: string, root = '.'): Array<[pattern: string, file: string]> {
  const schools = schoolsFor(town);
  if (schools.length === 0) return [];
  const teams = (school: (typeof schools)[number]): Array<[string, string]> => {
    const file = join(root, sportsDataFile(school));
    let data: SportsData | undefined;
    try {
      data = existsSync(file) ? (JSON.parse(readFileSync(file, 'utf8')) as SportsData) : undefined;
    } catch {
      data = undefined;
    }
    return teamsWithData(data).map((t) => [teamPath(school, t.key).replace(/\/$/, ''), 'sports-team.astro']);
  };
  if (schools.length === 1) return [['/sports', 'sports.astro'], ...teams(schools[0]!)];
  return [
    ['/sports', 'sports-index.astro'],
    ...schools.flatMap((s): Array<[string, string]> => [[sportsPath(s).replace(/\/$/, ''), 'sports.astro'], ...teams(s)]),
  ];
}

/**
 * One page per kind of place the town has enough of: /restaurants/,
 * /trails/, /parks/ (src/lib/place-types.ts). Each is the same component
 * at a fixed path, which reads the kind off its own URL; a dynamic
 * `/[type]` route would sit beside `/[subTown]` on a multi-town guide with
 * nothing to say which pattern a path belongs to. The count is read from
 * the markdown, as the sitemap filter reads closed places, because this
 * runs before the collections exist.
 */
export function placeTypeRoutes(town: string, contentRoot = 'content'): Array<[pattern: string, file: string]> {
  return placeTypePages(openPlaceTypeCounts(town, contentRoot)).map((type) => [
    PLACE_TYPE_PAGES[type].path.replace(/\/$/, ''),
    'places-by-type.astro',
  ]);
}

/**
 * The resident hubs, each injected only for a guide whose config switches
 * it on (TownConfig.families, .participation, .livingHere); the local
 * changes page for any guide that has an updates folder; the people pages
 * only where a published profile exists, so no guide carries an empty
 * page. The folders are read from the markdown, as the sitemap filter
 * reads closed places, because this runs before the collections exist.
 */
export function hubRoutes(site: TownConfig, contentRoot = 'content'): Array<[pattern: string, file: string]> {
  const routes: Array<[pattern: string, file: string]> = [];
  if (site.families) routes.push(['/families', 'families.astro']);
  if (site.participation) routes.push(['/get-involved', 'get-involved.astro']);
  if (site.livingHere) routes.push(['/living-here', 'living-here.astro']);
  if (hasFiles(join(contentRoot, site.slug, 'updates'))) routes.push(['/updates', 'updates.astro']);
  if (hasPublishedProfile(join(contentRoot, site.slug, 'profiles'))) {
    routes.push(['/people', 'people/index.astro'], ['/people/[slug]', 'people/[slug].astro']);
  }
  return routes;
}

function hasFiles(dir: string): boolean {
  return existsSync(dir) && readdirSync(dir).some((f) => f.endsWith('.md') && !f.startsWith('_'));
}

/** A profile builds only when its file says `status: published`. */
function hasPublishedProfile(dir: string): boolean {
  if (!existsSync(dir)) return false;
  return readdirSync(dir)
    .filter((f) => f.endsWith('.md') && !f.startsWith('_'))
    .some((f) => /^status:\s*"?published"?\s*$/m.test(readFileSync(join(dir, f), 'utf8')));
}

const HUB_ROUTES: Array<[pattern: string, file: string]> = [
  ['/', 'index.astro'],
  ['/this-weekend', 'this-weekend.astro'],
  ['/moving', 'moving.astro'],
  ['/moving/[pair]', 'moving/[pair].astro'],
  ['/newsletter', 'newsletter.astro'],
  ['/newsletter/sample', 'newsletter/sample.astro'],
  ['/newsletter/[slug]', 'newsletter/[slug].astro'],
  ['/submit-event', 'submit-event.astro'],
  ['/events.rss', 'events.rss.ts'],
  ['/advertise', 'advertise.astro'],
  // Read and deleted by the indexing step; never deployed (src/lib/network-search.ts).
  ['/network-search.json', 'network-search.json.ts'],
];

export function townRoutes(site: SiteConfig): AstroIntegration {
  return {
    name: 'inside-the-towns:routes',
    hooks: {
      'astro:config:setup': ({ config, injectRoute, logger }) => {
        const routes =
          site.kind === 'hub'
            ? HUB_ROUTES
            : site.status === 'live'
              ? [
                  ...TOWN_ROUTES,
                  ...(site.subTowns?.length ? SUB_TOWN_ROUTES : []),
                  ...sportsRoutes(site.slug),
                  ...hubRoutes(site),
                  ...placeTypeRoutes(site.slug),
                ]
              : HOLDING_ROUTES;
        for (const [pattern, file] of routes) {
          injectRoute({
            pattern,
            entrypoint: new URL(`./src/routes/${site.kind}/${file}`, config.root),
            prerender: true,
          });
        }
        logger.info(
          `Site: ${site.siteTitle} (${site.domain}) — ${routes.length} ${site.kind} routes injected` +
            (site.kind === 'town' && site.status !== 'live' ? ` (status ${site.status}: holding page only)` : ''),
        );
      },
    },
  };
}
