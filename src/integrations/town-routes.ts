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
  ['/events/calendar.ics', 'events/calendar.ics.ts'],
  ['/rss.xml', 'rss.xml.ts'],
  ['/events.rss', 'events.rss.ts'],
  ['/events/[slug]', 'events/[slug].astro'],
  ['/places/[slug]', 'places/[slug].astro'],
  ['/articles/[slug]', 'articles/[slug].astro'],
  ['/eat-drink', 'eat-drink.astro'],
  ['/things-to-do', 'things-to-do.astro'],
  ['/moving-here', 'moving-here.astro'],
  ['/submit-event', 'submit-event.astro'],
  ['/thanks', 'thanks.astro'],
];

const HUB_ROUTES: Array<[pattern: string, file: string]> = [
  ['/', 'index.astro'],
  ['/this-weekend', 'this-weekend.astro'],
  ['/moving', 'moving.astro'],
  ['/moving/[pair]', 'moving/[pair].astro'],
  ['/newsletter', 'newsletter.astro'],
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
        const routes = site.kind === 'hub' ? HUB_ROUTES : TOWN_ROUTES;
        for (const [pattern, file] of routes) {
          injectRoute({
            pattern,
            entrypoint: new URL(`./src/routes/${site.kind}/${file}`, config.root),
            prerender: true,
          });
        }
        logger.info(`Site: ${site.siteTitle} (${site.domain}) — ${routes.length} ${site.kind} routes injected`);
      },
    },
  };
}
