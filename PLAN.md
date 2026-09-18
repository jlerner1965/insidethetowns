# Inside the Towns — Build Plan for Claude Code

Paste this file into the repo root as `PLAN.md` and tell Claude Code: "Read PLAN.md and work through it phase by phase. Stop and show me the result after each phase before continuing."

## Project summary

A network of independent community/visitor guide sites for Colorado Front Range towns, all built from ONE codebase and deployed as separate sites per domain.

Parent hub: insidethetowns.com. Town sites (wave order):

1. insideniwot.com (also owns townofniwot.com — will 301 to insideniwot.com)
2. insidelyons.com
3. insideberthoud.com
4. insideerie.com
5. insidejohnstown.com
6. insidetimnath.com
7. insideelizabeth.com
8. carbonvalleyguide.com (later — Frederick/Firestone/Dacono)

## Non-negotiables

* One repo. One template. Town differences live in config and content, never in code forks.
* Adding a new town must take under one hour: add a config file, a content folder, and a deploy target.
* Weekly events updates must be a content edit, not a code change.
* Sites must look professionally designed, not like a template. Distinct per-town accent colors and photography, shared structure.
* Static output, fast, no database at launch.

## Stack

* Astro (static, content collections, multi-page) with TypeScript
* Tailwind CSS with design tokens driven by town config
* Content: Markdown/MDX + JSON in the repo (events, places, articles)
* Deploy: Vercel — one Vercel project per domain, all pointing at this repo, selected by env var `TOWN`
* Images: Astro `<Image>` with local assets in `/content/<town>/images`; every image logged in `IMAGE_LICENSES.csv`
* No CMS at launch. Revisit after wave 2 if content editing gets painful.

## Repo structure (target)

```
inside-the-towns/
  PLAN.md
  IMAGE_LICENSES.csv
  package.json
  astro.config.mjs        # reads process.env.TOWN
  tailwind.config.mjs     # reads town tokens
  src/
    config/
      towns/
        niwot.ts
        lyons.ts
        berthoud.ts
        erie.ts
        johnstown.ts
        timnath.ts
        elizabeth.ts
        hub.ts            # insidethetowns.com
      index.ts            # exports getTown() from TOWN env var
    layouts/
      Base.astro
      Page.astro
    components/
      Header.astro
      Footer.astro
      Hero.astro
      EventCard.astro
      EventList.astro
      PlaceCard.astro
      PlaceGrid.astro
      TownMap.astro       # hub only
      NetworkBar.astro    # thin "Part of Inside the Towns" bar, links to sibling sites
      SEO.astro
    pages/
      index.astro
      events/index.astro
      events/[slug].astro
      eat-drink/index.astro
      things-to-do/index.astro
      moving-here/index.astro
      about.astro
      contact.astro
      404.astro
    content/
      config.ts           # Astro content collections schema
    lib/
      events.ts           # filtering, sorting, upcoming/past
      dates.ts
  content/
    niwot/
      events/*.md
      places/*.md
      articles/*.md
      pages/moving-here.md
      images/
    lyons/
      ...
    (one folder per town, same shape)
  public/
    favicons/<town>/
  scripts/
    new-town.ts           # scaffolds config + content folder for a new town
    validate-content.ts   # checks required frontmatter, dead links, past events
```

## Town config schema

`src/config/towns/<town>.ts` exports a `TownConfig`:

```ts
export interface TownConfig {
  slug: string;               // "lyons"
  name: string;               // "Lyons"
  domain: string;             // "insidelyons.com"
  siteTitle: string;          // "Inside Lyons"
  tagline: string;            // one sentence
  county: string;
  state: "CO";
  lat: number; lng: number;
  population?: number;
  colors: {
    accent: string;           // hex, unique per town
    accentDark: string;
    neutralBg: string;
  };
  fonts?: { heading?: string; body?: string };
  hero: { image: string; alt: string; credit?: string };
  social: { facebook?: string; instagram?: string; email: string };
  nav: Array<{ label: string; href: string }>;   // default nav, overridable
  movingHere: {
    listingsLinks: Array<{ label: string; url: string }>;  // Zillow/Redfin/etc. link-outs
    schoolDistrict?: string;
    commuteNotes?: string;
  };
  officialLinks: {            // always link to, never impersonate
    townSite: string;
    policeNonEmergency?: string;
  };
  ga4Id?: string;
}
```

`hub.ts` is a variant with `towns: TownConfig[]` (imported from the others) and no events/places.

## Content collection schemas (`src/content/config.ts`)

events

```
title, slug, start (ISO datetime), end?, allDay?, venue, address?,
url?, cost? ("Free" | string), category (enum: music|market|festival|
outdoors|family|food|arts|civic|sports|other), image?, imageAlt?,
description (body), recurring? (string, e.g. "Every Saturday through Oct"),
featured? (bool)
```

places

```
title, slug, type (enum: restaurant|bar|coffee|shop|trail|park|
venue|lodging|service), address, url?, phone?, hours?, priceRange?,
image?, imageAlt?, tags?[], featured?, summary (1–2 sentences), body
```

articles

```
title, slug, date, updated?, image?, imageAlt?, excerpt, body, category
```

All collections are scoped by town folder. `getCollection` calls must filter by the current `TOWN`.

## Page requirements

Home

* Hero with town photo, name, tagline
* "This week in [Town]": next 4 upcoming events
* Featured places (4–6)
* Latest article (1–2)
* Moving Here teaser
* NetworkBar in footer

Events (`/events`)

* Upcoming events grouped by day, default view = next 14 days
* Filter by category (client-side, no framework needed)
* Past events automatically hidden (build-time filter, `start < today`)
* Each event has its own page with JSON-LD `Event` schema
* "Submit an event" link → contact page with prefilled subject

Eat & Drink (`/eat-drink`) — PlaceGrid of type restaurant|bar|coffee, filterable
Things to Do (`/things-to-do`) — PlaceGrid of trail|park|venue + articles tagged outdoors
Moving Here (`/moving-here`) — Markdown page + listings link-out buttons + schools/commute block from config
About — what this site is, that it is independent and not the town government, link to official site
Contact — simple mailto or Formspree form (no backend)

Hub (insidethetowns.com)

* Map (static SVG or Leaflet) of Front Range with pins per town
* One card per live town → links to its domain
* About the network
* Advertise/partner page (placeholder copy)

## SEO / technical requirements

* Unique `<title>` and meta description per page, pattern: `"[Page] | Inside [Town]"`
* Canonical URLs using the town's domain
* OpenGraph + Twitter card tags with per-page image fallback to hero
* JSON-LD: `WebSite` on home, `Event` on event pages, `LocalBusiness` on place pages
* Auto-generated `sitemap.xml` and `robots.txt` per site
* Lighthouse ≥ 95 on Performance/Accessibility/SEO for home and events pages
* All images: explicit width/height, lazy-loaded below the fold, WebP/AVIF output
* No client-side JS except the event category filter and (hub only) the map

## Phases — do these in order

### Phase 1 — Skeleton

1. `npm create astro@latest` with TypeScript strict, add Tailwind.
2. Create `src/config/` with `TownConfig` type and `getTown()` reading `process.env.TOWN` (fail loudly if unset or unknown).
3. Create `content/config.ts` with the three collection schemas above.
4. Build `Base.astro`, `Header`, `Footer`, `NetworkBar`, `SEO`.
5. Build all pages with placeholder content so every route renders.
6. Add `scripts/new-town.ts`: given a slug and name, creates config file + content folder with one sample event, place, and article, plus README on how to add content.
7. Add `scripts/validate-content.ts`: fails build if required frontmatter is missing, an image path doesn't exist, or a date won't parse.
8. Wire `npm run dev -- --town=lyons` style convenience (or `TOWN=lyons npm run dev`).

Done when: `TOWN=niwot npm run build` and `TOWN=hub npm run build` both succeed with placeholder content.

### Phase 2 — Design system

1. Tailwind theme reads accent colors from `getTown().colors` via CSS variables set on `<html>`.
2. Typography: choose one distinctive heading font + one readable body font (Google Fonts, self-hosted via `@fontsource`). Not Inter. Not the defaults.
3. Design the Hero, EventCard, PlaceCard, and PlaceGrid with real attention — generous whitespace, strong photography, restrained accent use. Reference: high-end city magazine sites, not municipal sites.
4. Dark mode not required at launch.
5. Mobile first. Test at 375px, 768px, 1280px.

Done when: Niwot renders with real hero image and looks like a designed site, not a starter.

### Phase 3 — Niwot content migration

1. Port existing townofniwot.com content into `content/niwot/`.
2. Populate at least: 15 events (next 60 days), 20 places, 2 articles, moving-here page.
3. Set Niwot accent color and hero.
4. Add `townofniwot.com` → `insideniwot.com` 301 redirect (Vercel `redirects` in `vercel.json` on the old project, or DNS-level).

### Phase 4 — Deploy pipeline

1. `vercel.json` with build command `TOWN=$TOWN astro build`.
2. Document in `DEPLOY.md`: create one Vercel project per domain, all on this repo, each with env var `TOWN=<slug>`, attach custom domain.
3. GitHub Actions (or Vercel's native) so every push to `main` rebuilds all live towns.
4. Add a `LIVE_TOWNS` list in `src/config/index.ts`; the hub only shows towns in that list.

Done when: insideniwot.com and insidethetowns.com are live on Vercel with HTTPS.

### Phase 5 — Lyons

1. `npm run new-town lyons "Lyons"`.
2. Populate content: 15 events, 20 places (Main Street restaurants, Planet Bluegrass, Hall Ranch, Heil Valley, Button Rock, St. Vrain tubing spots), moving-here page, 1 article.
3. Accent color: distinct from Niwot. Hero: river/sandstone.
4. Deploy insidelyons.com. Add to `LIVE_TOWNS`.

### Phase 6 — Berthoud, then Erie

Same as Phase 5, one town at a time. Do not start Erie until Berthoud is live and its events are populated.

### Phase 7 — Johnstown, then Timnath

Same process.

### Phase 7b — Elizabeth

Same process, after Timnath. Elizabeth (Elbert County, insideelizabeth.com) is the
network's first town south of Denver. Scaffold it with `npm run new-town elizabeth
"Elizabeth"`, keep it out of `LIVE_TOWNS` until its content is populated and the
domain is live, then deploy it like the others (Vercel project with
`TOWN=elizabeth`, see DEPLOY.md).

### Phase 8 — Operations tooling

1. `scripts/weekly.ts`: prints a report — events expiring in 7 days, towns with fewer than 5 upcoming events, places missing images. Run before each weekly content session.
2. `scripts/import-events.ts`: accepts a CSV (title, start, end, venue, url, category, town) and writes markdown event files. This is the weekly update path.
3. Optional: an `.ics` export per town at `/events/calendar.ics`.

## Conventions Claude Code must follow

* Never hard-code a town name, color, or domain in a component. Read from config.
* Never put content in `.astro` files. Content lives in `content/<town>/`.
* Every new image gets a row in `IMAGE_LICENSES.csv`: `path, source_url, license, credit_required (y/n), town`.
* Commit after each numbered step with a message like `phase2: event card design`.
* If a decision isn't covered here, pick the simpler option and note it in `DECISIONS.md`.
* Ask before adding any dependency beyond Astro, Tailwind, @fontsource, and a sitemap integration.
