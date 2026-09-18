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

## Phase 2

- **Typography is network-wide, not per-town.** Fraunces (variable, with its optical-size
  axis) for headings and Instrument Sans (variable) for body, self-hosted via
  `@fontsource-variable/*` and imported in `Base.astro`. Town identity comes from colour
  and photography; a shared typographic voice is what makes the sites read as one
  family. `TownConfig.fonts` stays in the type for a future override but is not wired.
- **Tokens live in `src/styles/global.css` under `@theme inline`.** Per-town CSS variables
  (`--town-accent`, `--town-accent-dark`, `--town-neutral-bg`) are set on `<html>` by
  `Base.astro`; derived tints (`accent-soft`, `line`, `line-soft`) are `color-mix()`ed
  from them so a new town only ever supplies three hex values.
- **Wordmark.** `Wordmark.astro` sets "Inside" light-italic and the town name semibold.
  A site title without that shape renders plainly, so the component stays generic.
- **Editorial rows, not boxed cards.** Events are rows separated by hairlines with the
  date (or, under a day heading, the time) in a narrow left column. Places and articles
  are photo-led cards with no border. A place without a photo gets a tinted tile with
  its initial so the grid never shows a hole.
- **Two display optical sizes.** `.display` (opsz 144, hairline serifs) is reserved for
  the hero and the hub statement; `.display-md` (opsz 72) is used for page titles,
  section titles and day headings where the strokes must survive 2–4rem.
- **Hub home is typographic.** The hub has no real photograph yet, so its home opens with
  a statement in Fraunces and lets the map and town cards be the picture. `Hero.astro`
  still works for the hub whenever a photo is chosen. The hub hero image is only used
  for the OpenGraph fallback.
- **Desktop nav from `lg`.** At 768px the five uppercase items plus the wordmark do not
  fit on one line, so tablets get the same horizontal-scroll nav as phones. No hamburger
  and no JavaScript.
- **Hero image height.** Astro's responsive-image styles force `height: auto` on
  `layout="full-width"` images; the hero overrides with `h-full!` so the photo always
  fills the box.
- **`scripts/screenshot.sh`** captures a built site at 375, 768 and 1280px with the
  Playwright-installed Chromium headless shell and Python's static server. The regular
  Chromium binary's new headless mode enforces a minimum window width and silently lays
  out a 375px capture at ~450px, which made phone layouts look broken when they were not.
- **Sample content.** Phase 2 added six sample events and five sample places for Niwot,
  all titled "(sample)", plus the six client-supplied photographs from townofniwot.com,
  so the grids and lists could be designed against realistic density. Phase 3 replaces
  the samples with the real listings; the photographs stay.

## Phase 3

- **No invented events.** Every event has a `source` (the organizer's page or calendar it
  was read from) and a `verified` date, carried over from the old site's discipline.
  Where an organizer's listing had a gap (a time not on the poster, two dates for one
  wine walk) the entry says so rather than guessing. The plan's target of 15 events in
  60 days was not reachable from organizer-published dates on September 17; the calendar
  has 13 distinct dated events in that window plus two weekly regulars, and everything
  the organizers have published through July 2027.
- **Weekly repeats are one file.** `repeat: weekly` + `until` on an event expands at
  build time into one occurrence per week; the events page shows every date for the
  next two weeks and one date after that, and the home page never lists the same event
  twice. An event page shows the next occurrence. This is what keeps trivia night and a
  dance class from needing a weekly content edit.
- **`timeNote`** on events replaces the computed time on cards ("Time to be confirmed",
  "Ballots must be received by 7 pm") for the cases where a clock time would mislead.
- **Places carry `area`, `source` and `verified`.** Area ("Cottonwood Square", "Old Town,
  Second Avenue") shows on the card; the source and check date show on the place page,
  and the page says the business's own site is the record for hours and phone numbers,
  which the old site deliberately did not reproduce and this one does not either.
- **Shops live on Eat & Drink; lodging on Things to Do.** The plan's page set has no
  home for `shop` or `lodging` places, and Old Town is mostly shops, so Eat & Drink gets
  a "Shops" grid under the food and drink, and Things to Do a "Stay the night" section.
  URLs and nav labels are unchanged. Services (dentists, lawyers, salons) from the old
  directory were not ported: they are not visitor-guide material and would be orphaned.
- **The `coffee` type is labelled "Coffee & Sweets"** so the ice cream shop fits without
  widening the enum.
- **Articles replace the old site's standalone pages.** Our Story → "How Niwot got here";
  Explore + Plan a Visit → "Explore Niwot: four places in walking order" (tagged
  `outdoors`, so it appears on Things to Do); Community → "Who runs what in Niwot"; the
  election page → "The 2026 Niwot incorporation election, plainly", held to the old
  page's standard: measures described as filed, campaigns labelled as advocacy, the
  commission never presented as an advocate, and a note that the summary predates the
  commission's printer's-proof review and must be re-checked against the certified text.
- **Redirects live in the old repo.** `vercel.json` on the `townofniwot.com` repository's
  `claude/inside-towns-build-plan-7dupte` branch maps every old URL to its new home and
  everything else to `insideniwot.com/:path*`. It must not be merged until insideniwot.com
  is live with HTTPS (Phase 4).
- **Photographs.** The six client-supplied photos are reused where they show the place
  they show (tavern, Cimmini's patio, the caboose, the Tribune building, the gateway, the
  trail at sunset). Thirty-odd places have no photo yet and show a typographic tile; a
  photo pass is the most valuable content work left for Niwot.

## Phase 4

- **Vercel's Git integration does the deploys; GitHub Actions is the gate.** The plan
  allows either for "every push to main rebuilds all live towns". Vercel's integration
  already rebuilds every linked project on every push, so the Actions workflow is not a
  deployer: it validates content, type-checks, and builds every site in `LIVE_TOWNS`
  plus the hub, and fails the push before Vercel would. `scripts/live-towns.ts` is the
  single list both read.
- **`buildCommand` is `npm run build`, not `TOWN=$TOWN astro build`.** Same result (the
  env var is read either way), but `npm run build` runs `validate-content` first, so a
  broken event fails the Vercel build with a readable message instead of a stack trace.
- **Security headers are copied from the old site**, minus Google Fonts (fonts are
  self-hosted now) and plus `form-action https://formspree.io` for the optional contact
  form. `style-src 'unsafe-inline'` stays because Astro inlines small stylesheets and the
  town tokens are a `style` attribute on `<html>`.
- **The production branch is `main`, which does not exist yet.** The repository was empty
  when this work started, so the working branch became GitHub's default. DEPLOY.md's
  first step is to create `main` from it; this session does not push to other branches.

## Phase 5

- **Lyons was ported from explorelyons.com, not written from scratch.** The account had an
  earlier Lyons guide (`jlerner1965/explorelyons`, a Python static build) with 29 checked
  listings, trail and river pages, a sourced history and 30 Creative Commons photographs
  with credits. Everything usable came across; the listings keep their September 2026
  check dates as `verified`.
- **Events come from the Lyons Recorder's community calendar** (lyonsrecorder.org), the
  library's calendar, the Town calendar, Planet Bluegrass's Wildflower series and the
  venues' own pages. The Recorder is the fullest single source and each entry links to it
  or to the organizer. Weekly regulars (six taproom and library fixtures) are one file
  each with `repeat: weekly`; first-and-third-Monday Board meetings are dated files
  because the repeat model is weekly only.
- **Hero.** The Commons photograph of Colorado 7 in the South St. Vrain canyon (CC BY-SA
  3.0, Footwarrior) at 2000px, credited in the hero and in `IMAGE_LICENSES.csv`. The old
  repo's copies of its photos top out at 700px, fine for cards but not a hero; the
  original was fetched from Commons.
- **Palette.** Lyons Formation sandstone red (`#9A4130` / `#6B2F23`) on a sandstone-dust
  paper, distinct from Niwot's evergreen. The old guide's own palette used the same rock.
- **Two articles, not one.** The plan asks for one; the history and the trails-and-river
  guide were both ready-made from the old site and both earn their place, the second
  tagged `outdoors` so it appears on Things to Do.
- **Tubing and the river path are `trail` places** so they appear on Things to Do with the
  open-space areas; the river gauge thresholds live in the trails article.
- **CC BY-SA photographs.** Several photos are share-alike licensed. Their use here is
  credited on each image's licence row and, for the hero, in the visible credit line; a
  visible per-photo credits page is not built yet and should be before a wider photo pass.

## Phase 6

- **Berthoud is written from sources, not ported.** There was no earlier Berthoud site, so
  the 49 places come from Berthoud Main Street's dine/drink and shop directories, the
  Town's facilities pages, Larimer County Natural Resources (Carter Lake), the Historical
  Society and the library's own pages; each carries its `source` and a September 2026
  `verified` date. Descriptions stick to what those pages say. Businesses without a
  reachable website are listed with the directory as source and no `url`.
- **Events come from five calendars:** the Town calendar and Upcoming Events page (market,
  Rec Center events, Board and commission meetings), Berthoud Main Street / the Chamber
  (Oktoberfest, Trick or Treat Street, Small Business Saturday, A Very Merry Berthoud),
  the library's events page (weekly storytimes and groups as `repeat: weekly`), and City
  Star Brewing's calendar (weekly trivia and run, dated releases and music). Second-and-
  fourth meetings are dated files, as in Lyons. Oktoberfest's start time differs between
  the Chamber (11 am) and the Historical Society (8 am); the entry uses the Chamber's and
  says so.
- **Hero and photographs are Wikimedia Commons.** Carter Lake (CC BY-SA 2.0, KimonBerlin)
  is the hero: the lake is the landscape people associate with Berthoud and Commons has
  no usable Mountain Avenue photograph. The Bimson Blacksmith Shop, the Swanson farm and
  the town-limits sign (CC BY-SA 3.0, Jeffrey Beall) and a CC0 welcome sign illustrate
  the museum, the article and Moving Here. Commons rate-limits original downloads; the
  `Special:FilePath?width=` thumbnails at 2000–2560px are used instead.
- **Palette.** Carter Lake blue (`#2A5D78` / `#1B3F52`) on wheat paper for the Garden
  Spot, distinct from Niwot's evergreen and Lyons' sandstone; 7:1 contrast on white.
- **Config facts.** Larimer County (261 of the 10,332 residents are in Weld, per the 2020
  census); the Larimer County Sheriff's Berthoud Squad is the police link; Thompson
  School District R2-J.
- **Sample content from `new-town` was deleted**, not edited, so the town folder holds
  only sourced entries.
- **Erie (second half of the phase) follows the Berthoud method.** 35 places from the Town's
  Downtown Erie and parks pages, the Chamber's restaurant directory, the businesses' own
  sites and a dated local guide; 34 event files from the Town calendar and event pages,
  the Chamber (Brewfest, Parade of Lights), Anderson Farms and the Old Mine's weekly
  calendar. The High Plains Library District's calendar is JavaScript-only and could not
  be read, so the library is a place with hours but no dated programs yet; the Erie
  Chamber's networking events are omitted as members-facing.
- **Erie hero is Colorado 7 looking west to the Front Range** from Airport Road (CC BY 4.0,
  Jeffrey Beall): Commons has no good Briggs Street streetscape, and the 1889 Davis
  building photo (CC BY-SA 4.0, Erie Bard) illustrates the Old Mine instead. Same
  contributor's photos of the library, Community Center, Town Hall, the 1930 City Hall
  and the miners' memorial illustrate those entries and the history article.
- **Erie palette** is a coal-seam indigo (`#3D3A5C` / `#26243D`) on warm grey paper,
  10:1 on white, chosen so the four town accents read as four different colours in the
  network bar.
- **County for Erie is Weld**, where Town Hall, downtown and 58 percent of residents
  are; the Boulder County side is explained on Moving Here and in the article.
- **Restaurants marked closed on review sites (Injoy, Industrial Revolution Brewing)
  were left out** even though the 2023 magazine list includes them.

## Phase 7

- **Johnstown follows the Berthoud and Erie method.** 29 places and 26 event files from the
  Town calendar and park pages, the Downtown Development Authority, the Historical
  Society, the library's programme list, the businesses' own sites and dated press. Two
  chains at the interchange (Urban Egg, Bad Daddy's, Lazy Dog, Duck Donuts) are listed
  because they are most of what there is to eat at 2534; three restaurants from a 2023
  magazine list turned out to be in Loveland, Greeley and Fort Collins and are omitted.
  Johnson's Corner is listed with its January 2025 closure and Black Bear Diner
  conversion stated plainly rather than pretending it is unchanged. 21 North Brewery is
  omitted: two directories disagree about whether it is open.
- **Beware the other Johnstowns.** discoverjohnstown.org, Central Park, the Zombie Crawl
  and the Christmas Village are Johnstown, Pennsylvania; search results mix them in
  freely. Only sources that name Colorado, Weld County or an 80534 address were used.
- **Hero is a county road west of town** (CC BY 2.0, Maarten Heerlien, geotagged in
  Johnstown), the only Commons landscape of the town; Jeffrey Beall's Town Hall
  (CC BY-SA 3.0) and a Flickr Scheels exterior (CC BY 2.0) illustrate those places, and the
  same Flickr set's pumpjack heads the history article.
- **Palette is sugar-beet burgundy** (`#7A2E4A` / `#521E32`) on a sugar-white paper for the
  Great Western factory town; 9:1 on white and unlike the other four accents.
- **Config county is Weld**, where Old Town, Town Hall and most residents are; the
  Larimer corner and the two school districts are explained on Moving Here.
- **Timnath is thin on sources and it shows.** 20 places and 15 event files, the plan's
  minimums, from the Town's park, reservoir and event pages, the downtown and farmers
  market sites, the businesses' own pages and the chamber directory. The Town's event
  calendar is a PDF poster and downtowntimnath.com's calendar is empty for autumn, so the
  weekly regulars are the brewery's run club and food trucks and the season's last
  markets. Restaurants that review sites list "in Timnath" but that sit across I-25 in
  Fort Collins (Kujira, Jing Dumpling, Genesis) or in Severance and Windsor were left
  out; two Fort Collins natural areas that border the town are included as trails
  because they are where Timnath walks.
- **Timnath's Commons photographs are small.** The only in-town images are public-domain
  snapshots of 400–700px and a 960px USFWS sunrise. The hero is Fossil Creek Reservoir
  (CC BY-SA 2.0, KimonBerlin, 4362px original), the reservoir between Timnath and Fort
  Collins, labelled as such; the small Old Town and Town Square snapshots are used at
  their native size on cards. A real Main Street photograph should replace them.
- **Timnath palette is harvest gold** (`#7D5E17` / `#55400F`) on wheat paper for the
  potato-and-beet farm town, the last distinct hue of the six.

## Phase 8

- **`scripts/weekly.ts` reads content directly**, through the same frontmatter parser
  and Zod schemas as the validator, rather than the Astro content layer, so it runs in
  a second with no build. It re-implements the weekly-repeat expansion in a dozen lines
  instead of importing `src/lib/events.ts`, whose extensionless imports and
  `astro:content` types do not load under plain Node. Beyond the plan's three checks it
  also lists events already past and listings not re-checked in 90 days, because both
  are the first things a weekly session should clear.
- **`scripts/import-events.ts` refuses to write anything if any row fails the schema**,
  and never overwrites an existing file without `--force`, so a bad CSV cannot half-
  update a town. File names are `<title-slug>-<start-date>.md` unless the CSV gives a
  `slug`, which is how a weekly regular is updated in place. It has its own small
  RFC 4180 parser rather than a dependency.
- **The `.ics` feed expands weekly repeats into occurrences** instead of emitting
  RRULEs, so calendar apps show exactly the dates the site shows (including `until`);
  the feed carries a VTIMEZONE for America/Denver and all-day events as DATE values.
  Its UID is `<slug>-<date>@<domain>`, stable across rebuilds. The route is injected
  like the other town routes and is not in the sitemap.
