/**
 * The move of the seven guides into insidethetowns.com (the owner's brief of
 * 18 November 2026): Berthoud, Erie, Johnstown, Windsor, Carbon Valley, Lyons
 * and Niwot become sections of the hub at /<town>/, each cut over on the
 * owner's word once the preview checks pass (a Friday, after the Thursday
 * email has sent), Johnstown first.
 *
 * One switch per guide domain, here and nowhere else. Everything the move
 * changes is read from it:
 *
 *   off  the guide is built and served exactly as before: its own project
 *        builds the guide at its own domain, vercel.json carries its own
 *        rules, the hub's /<town>/ forwards to it, and the hub builds no
 *        section for it.
 *   on   the town's config gets `hubPage` and a full section that carries
 *        every page (`section.carry: 'all'`: the home page, events, This
 *        Week, updates, sports, places, articles), built from the guide's
 *        current content on every hub build and merged under /<town>/
 *        (scripts/run.ts, scripts/lib/section-merge.ts), under the guide's
 *        own name ("Inside Berthoud"). The guide's own project becomes a
 *        redirect project like the twenty already moved: it builds no site,
 *        only the redirect function and its map, made from the same content
 *        in the same build (scripts/run.ts, scripts/migration/guide-map.ts),
 *        and only when its redirect files change (scripts/vercel-ignore.sh);
 *        the nightly rebuild no longer calls its deploy hook
 *        (scripts/live-towns.ts). vercel.json sends every path on its domain
 *        to that function (scripts/fold-rules.ts). The town stays
 *        `status: 'live'`: its newsletter list, the Thursday email, the
 *        Wednesday notes and editor runs, ingest and the nightly re-checks
 *        go on reading content/<town>/, and every link to it from the rest
 *        of the network names its section (`guideOrigin`).
 *
 * Switch one on by writing the day on its line ("2026-12-04"), off by
 * writing `false`, then `node scripts/fold-rules.ts --write` and merging: a
 * config switch and a redeploy, never Vercel's Instant Rollback, which turns
 * off production domain auto-assignment.
 */
import type { TownConfig } from './towns/types.ts';

/** The switches, by config slug: `false`, or the day the guide was cut over ("YYYY-MM-DD"). */
export const GUIDE_MOVE: Readonly<Record<string, false | string>> = {
  johnstown: '2026-11-18',
  berthoud: false,
  erie: false,
  windsor: false,
  'carbon-valley': false,
  lyons: false,
  niwot: false,
};

/** The seven, in the order above (Johnstown first, as the cutover goes). */
export const MOVING_GUIDES: readonly string[] = Object.keys(GUIDE_MOVE);

/**
 * For a local build or a test only: `GUIDE_MOVE_ON=johnstown,lyons` (or
 * `all`) turns those switches on for that run. Never read on Vercel, where
 * a deployment's switches are exactly the file's, so what is merged is what
 * is served.
 */
export const GUIDE_MOVE_ENV = 'GUIDE_MOVE_ON';

/** Today in Denver, "YYYY-MM-DD": the day a switch turned on for one run is recorded as. */
const denverToday = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Denver', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());

export function moveSwitches(env: Record<string, string | undefined> = process.env): Readonly<Record<string, false | string>> {
  for (const [slug, on] of Object.entries(GUIDE_MOVE)) if (on !== false && !/^\d{4}-\d{2}-\d{2}$/.test(on)) throw new Error(`GUIDE_MOVE.${slug} is "${on}": false, or the day it was cut over as "YYYY-MM-DD".`);
  const given = env.VERCEL ? undefined : env[GUIDE_MOVE_ENV]?.trim();
  if (!given) return GUIDE_MOVE;
  const on = new Set(given === 'all' ? MOVING_GUIDES : given.split(',').map((s) => s.trim()).filter(Boolean));
  for (const slug of on) if (!(slug in GUIDE_MOVE)) throw new Error(`${GUIDE_MOVE_ENV}=${given}: ${slug} is not one of the moving guides (${MOVING_GUIDES.join(', ')}).`);
  return Object.fromEntries(MOVING_GUIDES.map((slug) => [slug, GUIDE_MOVE[slug] || (on.has(slug) ? denverToday() : false)]));
}

/** A config as its switch leaves it: unchanged when off; with its hub page and a full section that carries every page when on. */
export function applyGuideMove(towns: readonly TownConfig[], env: Record<string, string | undefined> = process.env): TownConfig[] {
  const switches = moveSwitches(env);
  return towns.map((t) => {
    const since = switches[t.slug];
    return since ? { ...t, hubPage: { town: t.slug, since }, section: { mode: 'full', since, carry: 'all', neighbors: t.neighbors } } : t;
  });
}

/** Whether a town's guide has moved into the hub: its switch is on. */
export function isMoved(town: { section?: { carry?: string } | undefined }): boolean {
  return town.section?.carry === 'all';
}

/** What a link to a guide needs to know: its domain, and whether its switch is on. */
export type GuidePlace = { domain: string; section?: { carry?: string } | undefined; hubPage?: { town: string } | undefined };
