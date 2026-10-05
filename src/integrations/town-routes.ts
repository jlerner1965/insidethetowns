/**
 * Injects the page routes that belong to the site being built. Town sites and
 * the hub share layouts and components but have different route sets, and
 * Astro has no way to exclude a file in src/pages per build, so the pages live
 * in src/routes/{town,hub}/ and are injected here. src/pages/ holds only the
 * routes every site has (about, contact, 404, robots.txt).
 */
import type { AstroIntegration } from 'astro';
import type { SiteConfig } from '../config/towns/types';

const TOWN_ROUTES: Array<[pattern: string, file: string]> = [
  ['/', 'index.astro'],
  ['/events', 'events/index.astro'],
  ['/this-weekend', 'this-weekend.astro'],
  ['/events/calendar.ics', 'events/calendar.ics.ts'],
  ['/events/[slug].ics', 'events/[slug].ics.ts'],
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
              ? [...TOWN_ROUTES, ...(site.subTowns?.length ? SUB_TOWN_ROUTES : [])]
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
