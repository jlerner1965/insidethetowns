# Decisions

Choices not covered by PLAN.md, with the reasoning. Newest first.

## Phase 1

- **Astro 7 / Tailwind 4.** `npm create astro` installs Astro 7.3 today. Tailwind 4 has
  no `tailwind.config.mjs`; tokens are declared in `src/styles/global.css` with `@theme`
  and read per-town CSS variables that `Base.astro` sets on `<html>`. Same outcome as the
  plan's "tailwind.config reads town tokens", one file fewer.
- **Content config location.** Astro 6+ requires `src/content.config.ts` (the plan's
  `src/content/config.ts` is the removed legacy location). Schemas live in
  `src/content/schemas.ts` so `scripts/validate-content.ts` validates with the exact
  same rules Astro uses.
- **One collection per type, all towns loaded, filtered by id.** Entry ids are
  `<town>/<slug>`; `src/lib/content.ts` filters to the current `TOWN`. This keeps the
  content config independent of the env var, so Astro's content cache can never leak
  one town's entries into another's build.
- **Town vs hub routes are injected by an integration.** Astro cannot exclude a file in
  `src/pages/` per build, so town-only pages live in `src/routes/town/` and hub-only
  pages in `src/routes/hub/`; `src/integrations/town-routes.ts` injects the right set.
  `src/pages/` holds only routes every site has (about, contact, 404, robots.txt).
- **Dates are Denver wall-clock strings.** `start: "2026-10-03T10:00"` with no offset;
  `src/lib/dates.ts` converts using `America/Denver` so builds are identical on a
  laptop and on Vercel (UTC). Quoting is recommended so YAML does not pre-parse them.
- **`pages` collection added** for `content/<town>/pages/moving-here.md`, the only
  free-form page the plan calls for. Same glob pattern as the others.
- **`kind` discriminant on configs.** `TownConfig.kind = 'town'`, `HubConfig.kind = 'hub'`.
  `getSite()` returns either; `getTown()` narrows and throws on the hub.
- **`LIVE_TOWNS` added in Phase 1** rather than Phase 4 because `NetworkBar` and the hub
  need it to exist from the first build.
- **No new runtime dependencies.** Scripts run on Node 22's built-in TypeScript support
  and use Astro's bundled Zod (`astro/zod`). Frontmatter for the validator is parsed by
  a small in-repo YAML-subset parser (`scripts/lib/frontmatter.ts`) rather than adding
  `gray-matter`. `typescript` and `@astrojs/check` are dev-only, for `npm run check`.
- **Place pages exist** (`/places/<slug>/`) because the plan asks for `LocalBusiness`
  JSON-LD on place pages; the same for `/articles/<slug>/`.
- **Place grids are filterable with the same tiny script as events.** The plan says
  Eat & Drink is "filterable"; `FilterBar.astro` is the one client-side script and is
  shared by both. It is data-attribute driven and has no framework.
- **Contact page.** Mailto links by default; a Formspree form appears when a town sets
  `formspreeId`. "Submit an event" is a mailto with the subject pre-filled and a deep
  link to `/contact/#submit-event`, so no JS is needed to prefill anything.
- **`trailingSlash: 'always'`** to match the old townofniwot.com URLs and give one
  canonical form per page.
- **Placeholder hero** for new towns is a generated gradient JPEG in
  `scripts/templates/`, logged in `IMAGE_LICENSES.csv`. It must be replaced before a
  town goes into `LIVE_TOWNS`.
- **Niwot has no town government.** It is unincorporated Boulder County (an incorporation
  election is on the 2026 ballot). `officialLinks.townSite` points at Boulder County with
  a `townSiteLabel` so the footer wording stays truthful.
