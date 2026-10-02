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
- **`sharp` is declared, not added.** `src/lib/icons.ts` rasterises each site's
  favicon SVG into `/favicon.ico` and `/apple-touch-icon.png`, which browsers ask
  for by name whether or not the page links them. It uses `sharp`, which was
  already in the tree as Astro's image backend — the same reasoning as using
  Astro's bundled Zod. It is listed in `devDependencies` rather than left
  transitive so that an Astro release changing its image backend fails the
  install rather than the build, and it ships nothing to the browser.
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

## Phase 7b — Elizabeth

- **Elizabeth is scaffolded and complete but deliberately not in `LIVE_TOWNS`**, per the
  instruction that added it. Nothing in the network links to it, CI does not build it,
  and no Vercel project exists yet. Adding the string to `src/config/index.ts` is the
  only step between here and live.
- **One line was added to the supplied config**: `hero.credit`. The hero photograph is
  CC BY-SA 3.0, which requires attribution, so the credit renders under the hero and
  matches the row in `IMAGE_LICENSES.csv`. `kind: 'town'` and the `TownConfig` import
  were also added because the type and the registry require them, and `nav` uses
  `DEFAULT_TOWN_NAV` rather than an empty array so the town gets the standard menu.
- **`townofelizabeth.org` is behind Cloudflare** and returns 403 to every fetch, so no
  fact here was read off the Town's own site directly. The Board of Trustees and
  Planning Commission schedules (second and fourth Tuesdays at 7, first and third at
  6:30, Town Hall at 151 S Banner) come from search results quoting those pages, and the
  events still link to `/bt` and `/pc` because that is where a reader gets the agenda.
  Everything else was read from elizabethmainstreet.org, elizabethpr.com,
  pplibraries.org, burbio.com, marketspread.com, historicelizabethco.org,
  brewelizabeth.com, elizabethstampede.com, History Colorado and Wikipedia.
- **Search engines conflate Elizabeth, Colorado with Elizabeth, Illinois and Elizabeth
  City, North Carolina.** Only sources naming Colorado, Elbert County or an 80107
  address were used. The same rule caught Johnstown, Pennsylvania in Phase 7.
- **The Mayor's Tree Lighting has no event file.** A search result gave "December 3rd"
  from a past year's page; December 3, 2026 is a Thursday, not the Wednesday the page
  implied, and no 2026 date is published anywhere readable. It is described in the
  Moving Here guide as an early-December Main Street event instead of being invented as
  a dated listing.
- **Library programmes are written from their stated recurrence.** Burbio lists Story
  Time as Mondays and Wednesdays 10–11, Yarning for All as Thursdays 11–1, Heritage Crew
  as the first Saturday and Joy Seekers as the first Friday, so those generate through
  mid-December; Book Club is listed only as "monthly" with two confirmed dates (Sep 21,
  Oct 19, both third Mondays), so only the October date is written and `recurring` says
  "Monthly". The `until` dates stop before the holiday weeks because no source covers
  them.
- **Elizabeth's palette is saddle brown** (`#8B5E34` / `#5C3D1F`) on warm paper
  `#FAF7F2`, supplied with the config. It is the seventh distinct hue in the network and
  suits a rodeo town.
- **Three Commons photographs**: the hero is ERoss99's Main Street looking at the 1907
  First National Bank (CC BY-SA 3.0, resized to 1920px), plus Jeffrey Beall's Town Hall
  and Huber-Carlson Building (both CC BY 4.0, 1280px). Twenty-five of the twenty-eight
  places have no photograph and fall back to the letter tile; the businesses on Main
  Street are the ones worth shooting first.
- **Casey Jones Park has two addresses.** The Park & Recreation District gives 34201
  County Road 17 and the Marketplace gives 4189 S Highway 86 for the pavilion. Each
  listing uses the address its own source publishes rather than picking one.
- **The pickleball tournament is an all-day entry** because the district publishes the
  date and the $60 team fee but no start time. Writing a plausible time would have been
  invention.

## Weekly session, 18 September 2026

The first run of the process in README's "The weekly content session". Events
across the network went from 245 upcoming to 577.

- **Most of the 32 "expiring" listings needed nothing.** The report flags every
  file whose last date falls inside the window, but nine of them were single
  instances of a series whose later dates already exist as separate files
  (Timnath and Elizabeth council meetings, Erie and Berthoud town boards, Lyons
  trustees, Berthoud cribbage and tree advisory, Johnstown council, Lyons third-
  Friday comedy). Another thirteen were genuine one-offs that will drop off by
  themselves. Only the rest were real gaps.
- **Two series could not be extended and were replaced or left short.** The
  Niwot Election Commission publishes nothing past 18 September, so the civic
  gap is filled with the Local Improvement District advisory committee, whose
  dates Boulder County lists individually. The Berthoud Market has no winter or
  indoor successor: the season simply ends on 26 September and the holiday
  shopping is the Winter Craft Fair and A Very Merry Berthoud, both already
  listed.
- **Stale listings were caught by checking the weekday against the date.** A
  Niwot holiday parade on "Saturday November 29" (a Sunday in 2026), Niwot
  holiday markets on 7 and 14 December (Mondays), a Lyons Parade of Lights on
  "Saturday December 7" (a Monday), a Berthoud Cocoa with Claus on "Sunday
  December 2" (a Wednesday), an Erie Halloween Safety Stop on "Friday October
  31" (a Saturday), and a Berthoud market running "through September 27" (a
  Sunday) were all previous years' pages and were rejected. Every one of them
  would have published a wrong date.
- **Johnstown, Pennsylvania was kept out again**, as in Phase 7. Two stale
  entries on the Colorado town's own calendar, a 2025 Fall Fest and a 2024
  Trick-or-Treat Street, were also rejected.
- **A weekday audit of the whole network** compared every `recurring` note that
  names a weekday against its own start date, across 141 events. One real
  mismatch: the Erie police safety series said "first or second Wednesday" but
  its December session is the third. The date is confirmed on the Town's
  calendar, so the note now reads "Monthly" and the December entry says the
  session moved.
- **A link check of all 292 source and url values** found two dead: A Very Merry
  Berthoud had moved off berthoud.org (the id that now answers is a page about
  winter watering, so the Main Street program's page is used instead) and Moxie
  Bread Co's own mercantile page 404s. Everything else that returned 403 is bot
  blocking on Yelp, TripAdvisor, AllTrails and Cloudflare-fronted town sites,
  which a browser gets through.
- **`timeNote` is not a notes field.** It replaces the time range on a card, so
  three imported rows that put a whole sentence in it wrapped into a tall column
  and pushed the layout around. Anything longer than a few words now goes in the
  body. Worth remembering when writing import CSVs.
- **Two corrections to already-published entries.** Erie's 24 November council
  meeting is marked cancelled on the Town calendar and was deleted. Timnath's
  reservoir listing claimed a last motorized weekend of 29 October; the Town's
  page puts the motorized season at April 1 to October 1, so the entry is now
  the season's end on October 1 with the actual rule.
- **Judgement calls on what is not an event.** Dropped: a divorce support
  programme, a twelve-day polling location, weekly business-advising
  appointments, library tech-help desks, office closures and bin days. They are
  services or courses, not things to turn up to.
- **One flagged uncertainty.** The Lyons women's pinball tournament is listed on
  the Lyons Recorder as a third-Saturday series with dated pages, but the venue's
  own calendar lists no monthly tournament after March 2026. The Recorder rows
  are published; the conflict is worth a phone call to the shop before the
  October date.

## Photographs for the places that had none

Ten of the 212 imageless places now have a photograph. The other 202 cannot be
filled from free sources, and it is worth recording why so nobody repeats the
search.

- **What was added.** Casey Jones Park and the Stampede arena in Elizabeth, the
  Erie Municipal Airport, Anderson Farms' red barn in Erie, Buc-ee's in
  Johnstown, the Eagle Catcher sculpture in Niwot, Button Rock Preserve above
  Lyons, and the Presbyterian church, Poudre River Trail and Arapaho Bend for
  Timnath. Every one is logged in `IMAGE_LICENSES.csv` with its licence and
  author.
- **Only licences that permit commercial use and derivatives were considered**:
  CC0, Public Domain Mark, CC BY and CC BY-SA. The network is commercial and
  every image is resized, so `-NC` and `-ND` photographs are unusable however
  well they match. That single rule removes most of what a naive search returns:
  Button Rock alone has 127 Creative Commons photographs and only 6 of them
  qualify.
- **Wikimedia Commons was already mined in Phases 5 to 7.** Its category for
  each town holds between 7 and 35 files, and most are locator maps, scanned
  archive documents, 2013 flood photographs and welcome signs. What remained
  genuinely unused is what went in above.
- **A search across all 212 places found nothing else.** Commons search had to
  be restricted with `filetype:bitmap` or it matched OCR text inside scanned
  PDFs and returned soil surveys for "Berthoud Pet Supply". Once restricted, and
  once Openverse was queried with the licence filter, the only matches left were
  same-named places elsewhere in the world: Pioneer Park in Bunbury and
  Fairbanks, Roberts Lake in British Columbia, Evans Park in Ohio, and Queen
  Elizabeth II for anything containing "Elizabeth".
- **The 140 restaurants, cafes, bars, shops and lodgings will never be
  covered this way.** Nobody has published a freely licensed photograph of
  Cowgirlz Coffee or Wishful Living, and using a business's own marketing
  photographs would breach their copyright, which is exactly what the
  `IMAGE_LICENSES.csv` rule exists to prevent. These need original photography,
  or written permission from each owner.
- **A practical route for the rest**: an afternoon on each Main Street with a
  phone would cover most of a town's shops and restaurants in one pass, and the
  town parks departments will often grant permission to use their photographs if
  asked. Both produce images the network owns outright.

## Places are a directory, not a photo grid

Eat & Drink and Things to Do were a grid of photo-led cards. With 202 of 240
places unphotographed, and no lawful way to photograph most of them quickly,
the grid read as unfinished on every town but Lyons.

- **The pages are now a directory**, in the shape townofniwot.com already uses:
  the places that have been photographed lead the page as cards, then every
  place is listed as a text row with its name, type, summary, address, area,
  hours and a link out. A directory row does not want a photograph, so a town
  whose shops have not been shot does not look half-built. The filter still
  works across the whole list.
- **`PlaceCard` keeps a fallback tile** for the lead strip: the initial as a
  watermark over the place's tags and price band. It is only reached when a
  featured place has no photograph.
- **`PlaceGrid` is deleted**, since nothing uses it now.
- **This does not reduce the value of photographs.** They still lead both pages
  and fill the place's own page. It changes what the absence of one looks like.

## Opening hours

Hours coverage across the network went from 67 of 240 places to 180 of 240.
113 listings gained hours, each read off the operator's own page.

- **Only the operator's own page counts.** Google Business and Maps hours are
  user-editable and frequently stale, so they were not used. Where a business
  had no site, or a site with no hours, the listing simply has none: 60 places
  still do, and that is the honest state rather than a guess.
- **Parks and trails carry the hours the town actually posts**, and those
  differ more than expected. Erie posts sunrise to sunset for every park except
  Erie Community Park at 6 am to 10 pm. Johnstown posts 5 am to 10 pm for all
  eight of its parks, on the Parks page rather than on any individual park's
  page. Fort Collins posts 5 am to 11 pm for Arapaho Bend but dawn to dusk for
  Fossil Creek. Berthoud posts nothing at all for any of its eight parks, so
  they have no hours.
- **Lyons publishes three conflicting park-hours statements** on its own site:
  dawn to dusk, 8 am to dusk, and, on Bohn Park's own page, 8 am to 8 pm until
  further notice. Each park cites the most specific page for itself.
- **Lodging carries check-in and check-out** rather than opening hours, because
  that is what those operators publish and it is what a reader needs.
- **Two addresses were wrong and are now fixed.** Cocina & Cantina is at 400
  Mountain Avenue, not 316, which is Glass of Art. Joyful Brews is a drive-thru
  on Meadowlark Drive by the Kwik Korner, not a counter at 3rd and Mountain
  sharing a corner with Cornerstone Cafe; its whole entry was rewritten.
- **Hours go stale faster than anything else on these sites.** The weekly report
  already lists entries not re-checked in 90 days, which is the mechanism for
  catching them. Two known to expire: the Redstone Museum's season ends on 30
  September, and WeeCasa has announced it closes for good on 31 October.

## Design pass: blank frames, wordiness, and the empty right column

Five things on the live sites read as unfinished rather than plain, and the
fixes are all structural rather than decorative.

- **A card is the shape a photograph goes in, so a card without one is not
  drawn.** The home page fed the first six places into `PlaceCard` whether or
  not they had an image, and `PlaceCard` filled the empty frame with a tinted
  panel and a large initial. Six towns have fewer than ten licensed
  photographs between thirty and fifty places, so that grid was mostly grey
  rectangles. Cards are now built from photographed places only; the rest of
  the section is `PlaceIndex`, a two-column list of names and types. The same
  rule now applies to `ArticleCard`: a feature with no photograph is set as
  text across the full width under a heavy rule.
- **The lead adapts to how many photographs exist.** Three or more is the card
  grid, two is a two-column grid, one is `PlaceFeature` across the full width,
  and none is no lead at all. A single card in a three-column grid was the
  worst of the lot: two empty thirds read as a page that failed to load.
- **Directory rows are grouped by type, with counts.** Thirty-five identical
  rows in one run is a wall; `Restaurants 6`, `Bars 4`, `Coffee & sweets 3`
  gives it a rhythm and says what the town has. The rows also lost their `area`
  and `phone` lines, which mostly restated the address — that is what the
  listing's own page is for.
- **The column beside long prose holds a contents rail.** Moving Here and the
  articles ran a 40rem measure down a 76rem page, leaving a page-height empty
  margin. Both now carry a numbered contents list built from the markdown's own
  `h2`s, and the aside is sticky, so the column has something in it the whole
  way down.
- **Short pages end in a band, not a gap.** About and the place listings
  stopped a third of the way down the screen. Place pages now close with what
  is on at that venue and the other places of its kind; About closes with a
  `CtaBand`. About and the hub also open with a `FactStrip` of what the guide
  actually holds, which is the one thing an About page can say that no other
  site's can.
- **The hero is capped as well as proportional.** `78svh` on a tall desktop
  monitor is over a thousand pixels of sky before the page starts, so it is now
  `min(78svh, 760px)`.
- **The map labels flip side when crowded.** Berthoud and Johnstown are nine
  miles apart on the same latitude and their labels overlapped; a label whose
  pin has company within 170px to its right is now drawn to the left.

## Colour

The sites were black text on tan with one deep accent used sparingly, which
read as sober rather than as anything. Colour is now structural.

- **Two town colours, doing different jobs.** `accent` is the bright one and is
  only ever a fill, a rule or a mark; `accentDark` is the one words are set in,
  and is also the fill of the dark bands. Splitting them is what let the
  accents get brighter: `accentDark` still has to clear 4.5:1 on paper *and*
  4.5:1 under white, which caps how light it can be, but nothing constrains
  `accent` beyond staying visible. Every town's accent moved up in saturation,
  most of them a long way.
- **One amber for the whole network.** `#F0A62E`, in the top rule of every
  page, the footer eyebrows, the "Our pick" marks. Seven sites with seven
  unrelated colour schemes do not read as a network; one shared colour in the
  same places on all of them does. It is a fill and never text: anything
  written on it is ink, which clears 8.6:1.
- **A hue per event category and place type**, so a list of twenty things reads
  as twenty kinds of thing. Each carries a bright `dot` for marks and a dark
  `ink` for the label as words; place types borrow the event hues by what the
  place is for, rather than inventing nine more. `src/config/palette.ts` is the
  one definition, and components read it rather than restating hex codes.
- **`npm run check-colors` proves all of it**, reading the real town configs and
  the real palette module so it cannot drift from what renders: accent 3:1 on
  its own paper, accentDark 4.5:1 both ways, amber 3:1 on every band, every
  category dot 3:1 and every category ink 4.5:1 against all eight papers and
  white. CI runs it. It is what made brightening the palette safe to do at all
  — the first pass put Timnath's ochre at 2.60:1 and the script caught it.
- **Pages are bands, not one sheet.** Interior pages open on a masthead in the
  accent at 14%, mixed into the town's own paper rather than into white: 9% of
  ochre in white was invisible against Timnath's cream. Listings sit on white
  cards inside the paper. The home page runs white, tint, white, then a full
  band of the accent itself, and the footer is the town's colour rather than
  near-black.

## Dark mode, built and then removed

Dark mode shipped, worked, and came out again the same day: the publisher
does not want these sites turning dark on a reader's phone. It is in the
history if that ever changes.

Two things from it were worth keeping, and stayed:

- **`accent-dark` was doing two jobs**, and the split survives the removal.
  It was both the colour words are set in on a light page and the fill of the
  dark bands. Those pull in opposite directions the moment anything changes,
  so text in the town's colour is now its own token, `accent-text`. The two
  hold the same value today. Naming them separately is what stops the next
  change from using one where it means the other.
- **The derived tokens mix in `srgb`, not `oklab`**, because a plain channel
  interpolation is one `check-colors` can reproduce exactly. That is what lets
  the check cover the masthead band, which is the one surface on a page that
  is neither the paper nor white.

The exercise also proved its own worth on the way through: the check caught a
dark accent rule at 1.45:1, which is not a rule, it is nothing.

## Navigation

The links used to be rendered twice — a row for wide screens and a
horizontally-scrolling strip for narrow ones, each hidden at the other's
breakpoint. That is the ordinary way to do it and it puts every navigation
link in the page twice: duplicate anchor text on four hundred pages, and two
lists to keep in step.

One list now, in two shapes. Below 64rem it is a panel on a button; at and
above it, the row. The details that decide whether this feels right:

- **`display: none` when shut**, not `opacity: 0`, so the links are not
  tabbable behind a closed panel.
- **Positioned against the header** (`top: 100%` on a relative header) rather
  than at a fixed offset, so it cannot land in the wrong place when the header
  changes height between breakpoints.
- **The page is locked while it is open**, or the page scrolls under the panel
  and the whole thing feels broken.
- **Escape closes it and returns focus to the button**; opening moves focus to
  the first link; following a link closes it; and a resize into the wide layout
  releases the lock, which is the case that otherwise leaves a phone rotated
  into landscape with a page it cannot scroll.
- **44x44 on the button**, with the icon a good deal smaller than the target.

Driven in a real browser rather than eyeballed: the panel's top edge lands on
the header's bottom edge to the pixel, the rows measure 61px, and every one of
those behaviours is asserted.

## Which Front Range town? (/moving/)

The parent site's first page that answers something people type: "best small
town near Boulder", "which Front Range town should I move to". Nobody owns
those searches because the answer is spread across seven chamber sites.

- **Every column is a loop over the town configs**, so the table cannot drift
  from the guides and an eighth town appears in it without anyone editing a
  grid. Three facts were missing and were researched rather than estimated:
  elevation and incorporation date for all seven, from the published figures.
  Two of them cross-check against writing already on the sites — Erie's 16
  November 1874 and Elizabeth's 6,477 feet were both already in their own
  content, arrived at independently.
- **There is no median-home-price column**, which the plan that prompted this
  page wanted. It needs a named source and a quarterly re-check, and a figure
  eighteen months stale is worse than no figure. The listings links on each
  Moving Here page show what is actually on the market. A column that cannot be
  filled for all seven is worse than a column that is absent.
- **Drive times are the ones already in each town's guide**, off-peak, and the
  page says so rather than implying a promise about the Diagonal at half five.
  Elizabeth's cell reads "45 min to the Tech Center" instead of a Denver
  figure, because the Tech Center is what its guide actually sources. A precise
  different fact beats a comparable invented one. Elizabeth's own site returns
  403 to an automated fetch, so no better figure was available to confirm.
- **Niwot's empty incorporation cell is the most useful thing on the page.** It
  has never incorporated: county services, no council, no municipal tax, and
  the question on the 2026 ballot. The page says so in its own section rather
  than leaving a reader to wonder whether the cell is a gap in the data.
- **One markup, two shapes.** A seven-column table at 375px is a horizontal
  scroll nobody performs, so below 52rem each row becomes a card and each cell
  takes its label from `data-label`. The table semantics survive, so a screen
  reader still gets headers and rows. Verified: no element overflows the
  viewport at 320, 375 or 412.
- **The loop back matters more than the page.** Each town's Moving Here page
  links to `/compare/`, and `/compare/` links to all seven. That reciprocal
  pair is the strongest internal signal this network can build for itself,
  given seven separate domains that a search engine otherwise reads as
  strangers.

## Feeds, and the event form

- **RSS is hand-built, with no dependency.** A feed is a few hundred bytes of
  XML with two rules that matter: escape the text, and format the dates as
  RFC 822. `src/lib/rss.ts` does both, the way `src/lib/ics.ts` already does
  for the calendar. Verified by parsing the output rather than by reading it:
  "Tails & Ales" survives as `Tails &amp; Ales` and parses back to an
  ampersand.
- **`pubDate` is the day the listing was checked, not the day the event is.**
  That is what the element means, and a feed full of future pubDates is one
  some readers quietly suppress. Every event carries `verified`, so there is a
  real publication date to use; the event's own date is in the title and the
  description, where a reader sees it.
- **Fifty items.** A feed is a notification, not an archive. Ninety days of
  Front Range events ran to 218.
- **The hub publishes a feed no town site can.** Everything upcoming across all
  seven guides, each item linking to the town that owns it. Local groups and
  regional aggregators pull feeds, an events feed is more use to them than an
  articles feed, and almost nobody publishes one.
- **The event form asks for ten things, and the organiser's link is one of
  them.** The editorial policy says every listing is checked against its source
  before it goes up; without a link there is nothing to check it against, so it
  is required rather than optional.
- **No CAPTCHA.** It costs submissions from exactly the people most likely to
  know about the church supper nobody else has listed. Formspree's own `_gotcha`
  honeypot is visible only to something filling in every field.
- **The page works before the form does.** Without `formspreeId` it renders the
  email route and says what to include; the day an id is set it becomes the
  form. `form-action` in the CSP already allowed formspree.io.
- **`/thanks/` is noindex and out of the sitemap**, and says what happens to a
  submission rather than only thanking you, because the usual worry after
  sending something into a form is whether it went anywhere.
- **A stale `.astro` cache will lie to you about a config change.** Verifying
  the no-id branch appeared to fail until a clean build; the check had been
  reading the previous config.

## Staying current without a server

Everything on these sites that says "upcoming" is decided when the page is
built. That is fine on the day of a deploy and quietly wrong a week later: a
stale build shows past events under a page promising they drop off on their
own, and the hub's /this-weekend/ goes on naming the weekend it was built in.
Three layers, because each covers the others' failure mode.

- **A scheduled rebuild** fires a Vercel deploy hook per project, daily at
  03:10 Mountain and again on Thursday afternoon when people start looking at
  the weekend. One repo secret holds every hook URL, one per line, so adding a
  town is a line rather than a workflow edit. It logs eight characters of each
  hook and never the URL, and fails loudly on a missing secret rather than
  reporting a green run that did nothing.
- **Every event carries the day it falls on**, and anything past is removed in
  the reader's browser. A stale build then shows fewer events rather than wrong
  ones, which is the difference between a stale page and a lying one. Removed
  rather than hidden, because FilterBar already drives `hidden` and two
  mechanisms toggling one property would fight.
- **/this-weekend/ bakes three weeks and picks the weekend from the reader's
  clock**, moving day groups between its two sections and rewriting the
  heading. The server still renders the partition for its own build date, so a
  crawler and a reader without JavaScript get a coherent page. Only when all
  three weeks are used up does the page say so, and by then it is true.

The second and third layers exist because the first one has a specific failure
mode worth designing around: GitHub disables scheduled workflows by itself
after sixty days without a push — silently, in exactly the quiet winter when
nobody would notice. A revoked hook fails the same way.

Three weeks of listings is 188 events and 232 KB of HTML, which is 17 KB over
the wire. That is the trade: a page that survives a three-week outage.

### What /moving/ could and could not be filled with

- **Growth is census-to-census, 2010 to 2020, and labelled as such.** The brief
  asked for five-year growth. The Colorado State Demography Office publishes
  annual municipal estimates, which is the right source for that, but it serves
  them from interactive lookup apps rather than a file, so there was no way to
  get a consistent figure for seven towns. Decennial census is authoritative,
  identical in basis across all seven, and already cross-checks three things
  written on the sites: Erie's "grew 66 percent", Elizabeth's "up 23 percent",
  Timnath's "grew tenfold".
- **It turned out to be the most useful column on the page.** It splits the
  seven cleanly: Timnath +938%, Berthoud +102%, Johnstown +75%, Erie +66%
  against Elizabeth +23%, Lyons +9%, Niwot +7%. That is the actual decision
  someone is making.
- **Median home price ships as a column that is not drawn.** The fields are on
  the town config and `/moving/` renders the column the moment every live town
  has a price, a date and a named source — all three or none. A price with a
  gap invites the reader to read the gap as "cheap", and an undated one looks
  authoritative for two years after it stops being true.
- **Commute is one column, not three.** The brief asked for Boulder, Denver and
  Fort Collins. Denver is sourced for all seven from their own guides; Boulder
  and Fort Collins for three each. Filling in the other eight would have meant
  inventing them, so the table carries Denver and each town's paragraph carries
  the full picture in prose, which is where the useful detail was anyway.
- **Twenty-one pair pages were not generated.** Seven towns make twenty-one
  combinations and twenty-one pages built from one table with no argument in
  them is thin content — the same failure as the 329 event pages, and a search
  engine that decides it about one tends to decide it about the set. A pair
  gets a page when somebody has written it; `src/content/comparisons.ts` is the
  list and Erie vs Johnstown is the first.

### The newsletter ships dark

`NewsletterSignup.astro` renders nothing at all until `newsletter` is set on
the hub config. Not a disabled form, not a "coming soon" input — nothing. A
form that takes an address and drops it is worse than no form, and the
provider account is the one part of this that cannot be written in the repo.

What that buys is that the choice of provider is a five-line config change and
nothing else. The component writes `action`, the email field name and the tag
field name from config, so Buttondown and Kit are the same code. The one thing
they do not share is tags: Buttondown accepts repeated `tag` fields, so the
hub's town checkboxes work as-is; Kit's `fields[town]` takes one value, so a
Kit setup wants either one list per town or a single combined tag.

`/newsletter/` itself is not gated, because it is the page that says what the
email is and carries the archive. While the config is unset it says signups
are not open and points at `/contact/`, which is true rather than coy.

### The CSP and the form actions are checked against each other

A form posting to a host the Content-Security-Policy does not list is blocked
by the browser. Not at build time, not in the markup — on the reader's machine,
silently, after they have typed their address. This is exactly the bug that was
sitting in this branch: `form-action 'self' https://formspree.io` with a
newsletter form pointed at a provider.

`validate-content.ts` now reads `form-action` out of `vercel.json` and every
form action out of the configs, and fails the build if one is not in the other.
It caught this one. The message names the origin to add, so the failure tells
you the fix.

The form keeps `target="_blank"` and does not carry `rel="noopener"` — Astro's
`FormHTMLAttributes` has no `rel`, and the only host the form can post to is
one the allowlist already names.

### The empty-collection warning was a wrong diagnosis

`issues` logs "No files found matching" until the first issue exists, which is
accurate and self-resolving. It was worth checking rather than explaining away:
the first fixture written to test it went into `src/content/hub/issues/` and
also produced no match, because `base: './content'` resolves from the project
root, not from `src/content.config.ts`. Put in `content/hub/issues/` the
collection loads, the archive renders and `/newsletter/<slug>/` builds.

### Link rot gets its own check, and it is deliberately hard to trigger

A guide is a promise that the links work, and nothing in a static build can
see when one stops working: the HTML is still valid the day the café's domain
lapses. Asking the other end is the only way to find out, so `check-links.ts`
does, across every outbound URL in the content and the town configs.

It is not wired into the build or the validator. Those stay offline, fast and
deterministic, and this one is none of the three — it depends on several
hundred servers nobody here controls, and it puts a request on every small
business in the network, which is fine monthly and rude on every deploy.

The classification is the part that matters. A first pass over the network
found 32 links answering 403, and every one of them carried
`cf-mitigated: challenge` — Cloudflare turning away a datacenter IP, not a
dead page. A browser user agent did not change the result, because it is the
address being refused, not the name. So 403, 429 and 503 are reported as
refusals and do not fail the run, and neither does a timeout, which is more
often this end than theirs. Only 404, 410 and a URL that will not parse fail.

Of 655 links, exactly one was genuinely dead. A checker tuned to fail on all
33 would have been switched off within a week, and the one real 404 would have
gone with it.

It identifies itself honestly rather than impersonating Chrome. That costs a
few more challenges, which are reported as challenges, so it costs nearly
nothing — and a publisher that lies about who is knocking should not be
lecturing anyone about credibility.

### explorelyons.com is redirected, not paused

The account ran an earlier 13-page Lyons guide, and insidelyons.com was ported
from it. Leaving both up meant two sites owned by one person competing for the
same searches with the same material, while the 217-page one was still trying
to get indexed. Nothing rebuilt the old one either, so its events calendar was
going to start showing past events as upcoming — the failure the new guide
exists to avoid.

Pausing it would have thrown away the rankings and broken every inbound link.
A 301 hands both over, which is why townofniwot.com was handled the same way.

Sections are mapped individually rather than swept to the homepage: Google
reads a blanket homepage redirect as a soft 404 and passes far less. Twelve of
the thirteen pages had a real counterpart. `/civic/` did not, so its content
was ported to `/articles/who-governs-lyons/` and the redirect repointed at it
once that page was live — a redirect to a page that does not exist yet is worse
than the approximation it replaces.

The names in that article were re-verified against the Town's own election page
rather than carried across on trust, and two claims the old page made that the
Town's page does not support — a 2028 election date and two-year terms — were
dropped rather than inherited. Porting content is not a reason to stop checking
it.

### The network runs on Vercel Pro, and Hobby was never an option for it

Vercel's fair use guidelines define commercial usage as any deployment
"used for the purpose of financial gain of anyone involved in any part of the
production of the project", and list "advertising the sale of a product or
service" as an example. `/advertise/` does exactly that. The network is
commercial by their definition from the day that page went up, before any
money changes hands, and Hobby is "non-commercial personal use only".

So the choice was never Vercel against Cloudflare on price. It was $20 a
month, or a migration. Running a commercial network on Hobby is the third
option and it is not one: a policy violation takes all eight sites down at
once, without warning, and nothing about the sites themselves would explain
why.

Pro is per seat, not per project — one seat covers all eight guides, the hub
and both retired predecessors. $240 a year, against a rate card that has not
been printed yet. If the network cannot clear $240 a year the rate card is the
problem, not the host.

Cloudflare Pages is the free alternative and its free tier permits commercial
use: 500 builds a month against the 272 the schedule spends, and 20,000 files
a site against the 519 the largest one has. The reason not to move now is
timing, not fitness — the sites are mid-indexing and the explorelyons Change
of Address is in flight, and DNS is the one change that can break all eight
simultaneously.

That decision is cheap to revisit because the build emits `_headers` and
`_redirects` (see `src/integrations/host-files.ts`), so moving is a dashboard
exercise. Worth reconsidering if sponsorship has not materialised in six
months. Anything that would make the move harder — a Vercel-only runtime
feature, an edge function, image optimisation through their pipeline — should
be weighed against that, and `@vercel/analytics` is already one such thread:
`/privacy/` names Vercel Web Analytics on every site, so a move means changing
the package and the privacy copy on the same day.

## The Berthoud hero, and what the overlay was doing to all eight

The Berthoud home page opened on what read as a flat navy panel. Three things
were doing it, and only one of them was Berthoud's.

### The photograph had no sky in it

`hero.jpg` was KimonBerlin's tighter Carter Lake frame: a horizon in the top
eighth, then water, then a dense bank of scrub filling the bottom half. A hero
box is about 2:1 and the file is 3:2, so `object-cover` takes a centre band and
drops the top and bottom — which on that frame means dropping most of what
little sky there was and keeping water and brush. Every other town's hero is a
wide sky over a horizon; Berthoud's was the one frame with no bright area
anywhere in the crop, so the whole box came out one value.

The same photographer shot the wider frame from the same spot on the same day,
and it was already in the repository as `carter-lake.jpg` on the Carter Lake
place page. The two have swapped: the hero is now the wide frame at 2000px
(sky, the hogback across the water, pines on the near shore), and the place
page has the tighter one at 1600px. Both licence rows already existed in
`IMAGE_LICENSES.csv` and only needed their source URLs exchanged; the credit
line is the same either way, so nothing about attribution changes.

It is also a third lighter to download, which was not the point but is not an
accident either: a sky is smooth and a bank of scrub is not, so at the same
quality the wide frame costs 421 KB against 650 KB at 1920w, and 204 KB against
310 KB at 1280w. The launch audit had the hero down as the largest asset a
desktop visitor fetches; on Berthoud it no longer is.

### The wash was repainting the photograph

`Hero.astro` laid two things over the picture: a black scrim, and the town's
`accentDark` at 35% with `mix-blend-multiply`. Multiply at that strength pulls
every hue in a frame toward one colour — which is the navy. On a photograph
with a bright sky it reads as a tint; on one without, it is the whole picture.
It is 20% now.

The scrim was not simply lightened to match, because the scrim is what makes
the type legible. Its stops were chosen against a constraint that can be
checked rather than eyeballed: `(1 − scrim) × wash` must not be greater at any
height the type reaches than it was before. The type block is bottom-anchored
and its topmost line, the eyebrow, lands about three quarters of the way up, so
the constraint runs from the bottom edge to 74%:

    linear-gradient(to top, rgba(0,0,0,.88) 0%, rgba(0,0,0,.5) 50%,
                    rgba(0,0,0,.36) 74%, transparent 100%)

Checked per channel against all seven town accents, the closest that comes to
violating it is 0.003, at the very bottom edge. Above 74% it clears completely,
which is where the visible change is: the top of the frame now passes through
at 0.82–0.89 of the photograph's own brightness, against 0.65–0.76 before.

### The eyebrow was failing AA on six of the seven towns

Measuring this properly meant rendering each home page three times — as built,
with the hero type hidden, and with each line of type painted a flat marker
colour — so that a full-coverage glyph pixel could be told from an antialiased
edge, and the background under each glyph read off the render that has no type
in it. Antialiasing is why this is worth the trouble: an edge pixel of opaque
white type is indistinguishable, by colour alone, from the middle of a stroke
of `text-white/70`, and counting those edges makes every translucent treatment
look like a failure when it is not.

What that shows, at 1280 and 375, with the new wash and scrim in place:

| line | measured | bar |
| --- | --- | --- |
| `h1`, white, 68–144px | 4.42–15.47 | 3 |
| tagline, white/85 | 5.18–10.03 | 3 wide, 4.5 phone |
| photo credit, white/70, 12px | 8.61–9.71 | 4.5 |
| button label, white, 14px | 11.89–19.35 | 4.5 |
| eyebrow, amber, 12.75px | **2.88–10.18** | 4.5 |

Everything the scrim protects is fine. The eyebrow was not: it is the line that
sits highest, where the scrim is weakest, and in amber it failed on six of the
seven towns. Elizabeth was the only one clear at both widths; Lyons, at 10.18
on a wide screen, dropped to 3.68 on a phone.

It failed on the same six before any of this, between 2.34:1 and 4.04:1, so it
is not something the lighter wash introduced — the new stops lifted every one
of those numbers except Berthoud's, which moved for the other reason, its
photograph having changed under it. `check-colors` had not caught any of it
because what that script proves is that `highlight-ink` clears 4.5:1 on
`accentDark`, which it does; the hero is the one place the amber sits on a
photograph instead of on that flat fill.

Amber cannot be rescued by a darker scrim without giving back everything the
lighter wash just won: the worst case needs the background at 0.76 of its
current value, which is 13 points more black across the middle of every hero.
Nor by going darker — against a background that light, even pure black reaches
only 4.43:1. So the hero eyebrow is white, and re-measured the same way it runs
4.69:1 to 16.57:1, every town and both widths. Every other eyebrow on every
other dark band keeps the amber, which is provably safe there.


## Titles that outran the search result, descriptions that said nothing

Two metadata faults, found by reading the built HTML of all eight sites rather
than the source: `<title>` and `<meta name="description">` for every page, with
the event pages set aside because the launch audit knowingly made those long to
keep them unique.

### The history articles

`pageTitle()` appends `| Inside <Town>`, which is 15 to 19 characters that a
long headline pushes out of the result entirely. Five history articles were
over the 70-character line the launch audit set:

| | before | after |
| --- | --- | --- |
| Elizabeth | 105 | 62 |
| Timnath | 97 | 64 |
| Niwot | 78 | 62 |
| Berthoud | 74 | 62 |
| Johnstown | 71 | 61 |

Shortened in the frontmatter rather than hidden behind a `seoTitle`, because in
each case the long version was a subtitle doing the excerpt's job — "a sawmill
camp, a railroad, and two buildings that were nearly lost" is the excerpt's
first clause, and the excerpt is on the page, in the card and in the snippet.
Nothing was dropped that the reader cannot see one line down. Slugs are
untouched, so no URL moves and nothing needs redirecting.

Six non-event titles still run over 70: four on the hub, where the length comes
from a date or a pair of town names being interpolated into a template
(`/this-weekend/`, `/moving/`, `/moving/erie-vs-johnstown/`, `/newsletter/`),
and two articles whose titles are lists that do not shorten cleanly
(`two-counties-two-fire-districts`, `who-governs-lyons`). Those are copy
decisions for the editor rather than defects to fix in passing.

### The two collection pages

`/eat-drink/` and `/things-to-do/` carried "Restaurants, bars, coffee and shops
in Erie, CO." — 48 to 53 characters, which is the page title with a full stop
after it. A snippet is the one chance to say what a page holds that its title
does not, so both now run 125 to 146 characters and say it. The string is also
the `CollectionPage` description in the JSON-LD, and it was written out twice in
each file; it is one `const` now, so the two cannot drift apart.

### The hub home page

`SEO.astro` falls back to `site.tagline`, and the hub's is 74 characters:
accurate about what the network is, silent about what is on a guide, which is
what someone deciding whether to click wants to know. The hub home now passes
its own 151-character description. The tagline stays short because it is also
the hero line and the `Organization` description in the publisher graph.

## The forms are switched on

Eight Formspree endpoints, one per site: seven towns and the hub. Every form
in the codebase was built behind `formspreeId` and had been shipping its
fallback since launch — `/contact/` rendered no `<form>` at all, and
`/submit-event/` showed the "isn't switched on yet, email it instead" branch.
Setting the id is the whole change; no page needed touching.

One id per site rather than one shared endpoint. A submission carries which
town it came from in the form itself (`submit-event` posts a hidden `town`
field), so a single endpoint would have worked — but Formspree's own inbox,
filters and spam handling are per form, and the sites are meant to be separable.
A town that later moves to its own account, or gets handed to someone else,
takes its endpoint with it instead of needing an inbox untangled first.

`validate-content.ts` already checked every posting host against the
`form-action` directive in `vercel.json`, and that check has been running
against nothing for the whole of the site's life — the loop over
`liveTowns()` had no town with a `formspreeId` to test. It now has eight, and
`https://formspree.io` was already in the CSP, so it passes for real.

The audit line "No contact form ships" in `docs/LAUNCH-AUDIT.md` is no longer
true and has been moved out of **Knowingly left**.

### The contact form's three missing pieces

Switching the ids on made `/contact/` render a `<form>` for the first time,
and it went up with neither of the things the event form had worked out a
year earlier.

**A honeypot, not a CAPTCHA.** `/submit-event/` carries `_gotcha` and a
comment explaining why there is no CAPTCHA: it would cost submissions from
exactly the people most likely to know about the church supper nobody else has
listed. The same argument holds for a correction to a phone number, so the
contact form now carries the same hidden field. It is one line, and without it
the inbox fills with the sort of mail that makes an editor stop opening it —
which costs the real corrections too, just more slowly.

**Somewhere of our own to land.** Formspree's default confirmation is a
stranger's page with a stranger's branding, shown at the one moment a reader
has just trusted us with something. `/submit-event/` had always set `_next` to
the town's `/thanks/`; the contact form now sets it to `/message-sent/`.

A second confirmation page rather than one page hedging. `/thanks/` is written
entirely about events — it promises we will check the submission against the
organizer's own page, which is nonsense in reply to "your opening hours are
wrong". And `/thanks/` lives in `src/routes/town/`, so the hub, which has a
contact form too, had nowhere to send anyone at all. `/message-sent/` is in
`src/pages/` and so ships on all eight sites, branching only on the closing
panel: events and the event form on a town, this weekend and the newsletter on
the hub.

It says what happens next, that silence is not the message being ignored, and
what becomes of the address you gave — which is the same promise `/privacy/`
makes, at the moment someone is actually wondering. It is `noindex` and listed
in `NOINDEX` in `astro.config.mjs`, so the sitemap matches the page, as
`/thanks/` already did.

**A subject line that says which of eight.** `_subject` shipped blank, so the
preview line in the inbox was the sender's own first words — which is the
wrong thing to read when the only question at that moment is which site the
message came from. It now defaults to `Message — <siteTitle>`. It stays a
visible field rather than becoming a hidden one, so anyone with a better
subject can overwrite it, which is the whole point of asking.

The audit's note that "the form's accessibility is untested because there is
nothing to test" is now answerable: every visible control is wrapped in its
own `<label>`, so each is implicitly associated without an `id` to collide
with anything; the honeypot is inside a `display: none` wrapper, so it is not
focusable and its `aria-hidden` cannot hide a focusable node; and the submit
is a real `<button type="submit">`.

## Writing to the trade bodies, and the address that does not exist

`docs/INDUSTRY-EMAILS.md` is the batch route out of the photo problem: twelve
messages — eight emails and four contact forms — to the Main Street programmes,
chambers, downtown associations and two local papers, each asking one
organisation to carry a request that would otherwise be 145 cold emails. `VENUE-PHOTO-EMAILS.md` Part 2 had sketched this
as a table of URLs. What it could not give was somewhere to send anything.

**Three of the seven towns publish no email address at all.** This was
established rather than assumed: `berthoudmainstreet.org` was crawled across
all 46 pages in its sitemap and `niwot.com` across 61, and neither carries an
address anywhere — the only two on niwot.com belong to a pizzeria and a
tree-carving project. `elizabethmainstreet.org` runs a Locable form widget and
prints a phone number. For those three the deliverable is the same body text
with a subject line to paste into the form, not a fabricated address.

**The addresses that do exist were read from page source, not from a rendered
summary, and one of them proves why.** `timnath.org` protects its addresses
with Cloudflare email obfuscation: the page renders the literal words
"[email protected]" and keeps the real address XOR-encoded in a `data-cfemail`
attribute. Read the rendered text and you get nothing; ask a summarising model
to read it and you get `timnath.mainstreet@timnath.org`, which is exactly what
the address ought to be and is not an address. Decoding the attribute gives
**`lgraves@timnathgov.com`** — a different domain from the website, which is
the part no amount of guessing would have reached. Logan Graves is the
Principal Planner who staffs the Main Street programme. The same decode gives
`sbieber@timnathgov.com` and `aadams@timnathgov.com` elsewhere on the site.

Two of the other organisations, Downtown Erie and the Johnstown DDA, are Wix
sites whose contact blocks are rendered client-side, so `curl` alone returns
only Wix's telemetry addresses; both were confirmed against the rendered page
and then against the tokens in the source. The rule that came out of this: an
address goes in the document only if it was seen in the page's own bytes or
confirmed twice by different means.

**The Berthoud chamber was not looked up at all.** Their `robots.txt` disallows
74 named AI and scraper user-agents, this one included, and that opt-out covers
fetching their contact page as much as their calendar. The document carries a
row for them that says to open the site in a browser, as a person, and read the
address off it. Berthoud Main Street is the better route for downtown
businesses anyway, because the downtown programme is theirs.

### What the emails ask for, beyond photographs

Photographs are the headline gap — 139 of 145 business listings have none — but
they are not the only thing these organisations can fix, and an email that asks
for one thing wastes the other two:

- **28 listings have no opening hours** and **53 have no website**, almost all
  of them in Berthoud and Elizabeth, which hold 42 of the 48 listings that have
  no contact detail of any kind. Those two towns cannot be emailed into
  completeness; the Main Street walk is the only route to most of them, and the
  introduction email is what makes the walk expected rather than strange.
- **Six of the seven calendars stop within a fortnight of each other**, between
  17 and 31 December. Niwot, which runs to July 2027, is the exception. Nothing
  is near the 45-day floor `scripts/weekly.ts` warns at, so this is not urgent —
  but the organisations being written to are the ones who already know the 2027
  dates, and asking costs one sentence.

### One stale website, found on the way

`docs/PHOTO-CONTACTS.csv` carried `westernstarsgallery.com` for Western Stars
Gallery & Studio in Lyons. The domain resolves and answers, but 301s to
`caulleycorner.com`, which is NXDOMAIN — a live redirect to a dead target,
which returns a clean failure only if you follow it. The place file had never
had the URL, which is how the discrepancy surfaced: the CSV and the frontmatter
disagreed by exactly one row. The CSV's website column is now empty for that
row, and the "cannot be emailed at all" count moves from 47 to 48 in
`PHOTOS.md` and `VENUE-PHOTO-EMAILS.md`. The listing itself is unaffected; it
never carried the link.

## The reply address that could not receive a reply

The twelve trade-body messages went out asking seven organisations to tell their
members to send photographs to `hello@inside<town>.com`. Checking the network
afterwards for anything the 18 September launch audit had not covered turned up
the thing that would have made all twelve pointless: **none of the eight domains
has an MX record.**

Confirmed against Cloudflare and Google resolvers, both returning NOERROR with an
empty answer section and only an SOA in authority — an absence, not a failed
lookup. No SPF and no DMARC either; the only TXT record on each domain is a
Google Search Console verification token. Mail was never set up on any of them.

Without MX, RFC 5321 has the sender fall back to the A record. That is
`76.76.21.21` — Vercel's anycast edge, which listens on 80 and 443 and not on
25. The message does not fail fast; it sits in the sender's queue through the
retry schedule and bounces a day or two later, which is the worst shape for this
particular failure, because the bounce arrives long after the chamber has
already printed the address.

The address is not hypothetical. Every `/contact/` page publishes it as a live
`mailto:` twice over — "Email hello@…" and "Email a listing or correction" — so
it has been failing for site visitors since launch, silently, with no way for
anyone to report that it fails except by using the form beside it.

The contact form is the exception and now the only working inbound path:
Formspree posts to its own endpoint and delivers to the inbox configured in the
Formspree account, which has nothing to do with these domains' DNS. That is why
the fault survived the launch audit — the audit checked that the form posts, the
CSP allows the host and the confirmation page is `noindex`, all of which pass. It
never checked whether the address printed next to the form could receive
anything, because nothing in the repository says it should be able to.

DNS for all eight is on Cloudflare, so Cloudflare Email Routing is the fix: free,
about ten minutes, `hello@*` forwarded to a real inbox, with SPF and DMARC added
in the same sitting. Recorded as the one open item in `LAUNCH-AUDIT.md` under
*For the owner*, which until now read "Nothing outstanding".

### What the audit had left, and what it had not

The same pass verified live, on all eight, the things that shipped after the
audit and so had never been tested against production: `/contact/` renders a real
`<form>` posting to `formspree.io` with the `_gotcha` honeypot; `/message-sent/`
returns 200, carries `noindex`, and is absent from every sitemap (668 indexable
URLs across the network); and the six security headers are still 6/6 everywhere.
Those were the audit's known gaps, and they are closed.

One thing was deliberately **not** recorded as a fault. Roughly one request in
twelve to the live sites failed from the session container — `SSL_ERROR_SYSCALL`,
and two 25-second timeouts. The container's own egress proxy logs
`ws_closed_mid_exchange` against `insideniwot.com:443`, describing its own tunnel
closing, and control domains over the same proxy were clean across a small
sample. Origin and proxy cannot be separated from inside that container, so it
goes in the record as unconfirmed and worth one look from a normal machine,
rather than as a finding about the sites.

## The link check that could not see a moved meeting, and the site it should not have asked

A network check on 24 September ran `check-links` again. It found eight dead
links, all on event listings. Three were settled from the organisers' own pages:

- The Niwot Trot's race page had moved.
- The Johnstown library had dropped its 10 October D&D session.
- The Town of Lyons had moved its Historic Preservation Commission from
  24 November to 1 December and dropped 22 December.

The Lyons one is worth remembering. The November listing's source still answered
200; it had simply started saying December. No link check can see that. The 404
on its December neighbour is the only reason anyone looked.

The other five dead links point at the Lyons Recorder. Its robots.txt reads
`User-agent: *` / `Disallow: /`, and 65 of Lyons' 163 event files cite it. So
every run of the checker had been putting some twenty requests on a site that asks
every automated client to stay out. The Berthoud chamber entry above already
settled that an opt-out covers this project. The checker was the one place that
had not caught up.

It now reads each origin's robots.txt before the first link there
(`scripts/lib/robots.ts`, RFC 9309):

- It uses its own group if one names it, and otherwise `*`.
- The longest matching rule wins, and allow wins a tie.
- A 4xx robots.txt means no rules; a 5xx means stay out.
- A robots.txt that does not answer at all is read as no rules. This departs
  from the RFC on purpose: the check that follows costs a dead server nothing,
  and a domain that has stopped answering is exactly what the checker is for.

What it will not fetch it lists by host, for a person to check in a browser.

The same opt-out applies to the weekly session. The five Recorder listings were
left for a phone call rather than researched: Spirit Hound's comedy and trivia,
the Oskar Blues and MainStage bluegrass picks, and the third-Saturday women's
pinball. The venues' own pages are fair game. MainStage's page for its bluegrass
night, MainGrass, reads "Oct - May: Friday Nights @ Gunbarrel / May - September:
Thursday Nights @ Lyons", against listings here that run in Lyons on Thursdays
to the end of December. The pinball venue's calendar lists no third-Saturday
women's tournament this autumn, though it does run women's events.

## Making the pages more useful on a phone, and letting the towns lean on each other

A pass over the live sites with a phone in mind, after the 24 September check.
Nothing here changes what the sites are; each item is a place where a reader
had to work harder than they should, or where the network had something and
the page did not show it.

### The home page led with whatever was soonest

"What's on" took the next four listings by date. On a Thursday evening in
Berthoud that was a Planning Commission meeting, a social run and two library
sessions on Friday morning, with the weekend's Oktoberfest and market nowhere
on the page. Date order is the right order to *show* things in and the wrong
order to *choose* them in. `highlights()` ranks before it cuts — featured, then
the coming weekend, then the rest; at each step one-offs before regulars and a
civic meeting last — and puts the chosen six back into date order. The hub's
front page and the new cross-town blocks rank the same way, so the network has
one idea of what leads.

A regular is a weekly repeat, a listing with a "Third Fridays" note, or one of
a series stored as a file per date, which nothing in its own frontmatter
admits to. Those are recognised the way `series.ts` recognises them: another
listing with the same title at the same venue. Without that rule the first
build still led Berthoud with three Friday library sessions, because Friday
comes before Saturday and a date-sorted weekend tier is a Friday tier. Even
with it, Friday filled the weekend's slots whenever it had three one-offs of
its own, so within a tier the picks are taken one from each day in turn:
Saturday's first thing ranks with Friday's first, not after Friday's fourth.

What the rule cannot see is a series stored as a single dated file with no
note and no later dates — Berthoud's knitting drop-in, at the time of writing.
To the data that is a one-off, and it leads as one. The fix is in the content:
a `recurring` note, or the later dates, either of which the weekly session
would add anyway.

### The signup box was the first thing on the events page

On a 390-pixel phone the first event was some 1,200 pixels down, past a whole
screen and more, on the one page a reader opens to see what is on. The box
follows the fortnight's listings now, for the reason the home page already
gave for its own copy: the offer lands once the reader has had the listings
and can tell whether a weekly note of them is worth an address. It is the
email that is the product, so this is a bet that a signup box read after the
events converts better than one scrolled past to reach them.

### Directions, and a way into a reader's own calendar

Every place page carries a Directions row: Google's universal directions URL,
which opens the maps app on a phone that has one and the site on one that
does not. No map embed — the CSP refuses third-party scripts and that is not
changing for a map — and no coordinates in the content, since the address is
what the reader has too. The town and state are appended unless the address
already carries a state. The first version looked for the town's name instead,
and left "7960 Niwot Road, Suite B5" as it was: Niwot Road runs through Niwot,
and that is not a full address.

Every event page offers the event as a single `.ics` (Apple, Outlook) and as
a Google Calendar link, beside the whole-calendar subscription the events
page already had. Both carry the next occurrence, with the feed's UID for it,
so a reader who has both does not get the event twice. Google insists on an
end time; a listing without one is given an hour, the least presumptuous
guess for a talk or a meeting.

### "Nearby this weekend": the one deliberate look over the fence

On 20 September every town page stopped linking to every other town, because
nine thousand cross-domain links whose only reason was that the other domains
existed is the footprint of a link network, not a publication. That decision
stands. What it left out is the case where a reader in Berthoud genuinely
wants Johnstown's Saturday, eight miles away.

Each town's events page now ends with a few weekend picks from its nearest
guides — the nearest three within twenty-five miles, by the coordinates in
the configs — each card badged with its town and crossing to that town's own
page. It is one block on one page per town, contextual in the way the hub's
weekend page and the comparisons are, and it adds a few dozen links across
the network rather than thousands. Elizabeth's nearest guide is fifty-three
miles away, so there the block does not render at all, rather than suggest an
hour each way.

One-offs only. The first build of it led Niwot's block with Berthoud's Friday
toddler storytime, because the weekend tier ranks by date and storytime is at
half past ten. A weekly regular is for the people who live there, and a
council meeting is for its residents; neither is a reason to drive sixteen
miles. `oneOffs()` drops both, and the hub's front page uses the same rule
unless a weekend is so quiet that regulars are nearly all there is.

`getTownEntries` stays strict: no town page can reach another town's content
by accident. The block uses a new accessor that has to be handed the towns it
wants and returns every entry carrying its town, so it cannot be rendered as
if it were ours. Deliberate, twice over.

### The hub led with its own numbers

"7 guides, 4 counties, 72,350 people" is a publisher's fact strip, and it sat
where a reader looks first. The front page now leads with the weekend across
the network, ranked as above, falling back to the week ahead when the weekend
is empty and saying which it is showing. The numbers moved down under the
map, where they read as context rather than as the point.

### A way for the people who know to tell us

Most of the 240 places have no photograph and a quarter have no hours, and the
trade-body emails of 21 September are the batch route to fixing that. The
retail route is the page itself: every place page now ends with "Own or run
X?" — "Know X well?" for a park or a trail — leading to the contact form with
the place already in the subject line and the first line of the message. The
form reads that from the query string as text, never as markup, and leaves
both fields editable.

### A button nobody could read

Found on the way, in a phone capture of `/contact/`: the "Submit an event"
button was a blank pill on every site. `.prose a` sets link text in the
town's accent, and it outranks `.btn-primary`, so a button set inside prose
was accent text on an accent-dark fill. One rule restores the button's own
colours inside prose. The same fault sat latent on the event form's mailto
fallback, which no live site renders since the forms were switched on.

### The email that had never been drafted

Every site carried a signup box promising a Thursday email, and nothing in
the repository could produce one. `scripts/newsletter.ts` drafts it from the
listings: for each town, the weekend by day, anything still running, the week
after up to the next issue's reach, places added since the last issue (from
the git history, which a shallow checkout does not have, and the script says
so rather than report a quiet week) and articles published that week; and one
issue for the whole network with a few picks per town. Each draft is Markdown
under a frontmatter block in the shape of `content/hub/issues/`, so a sent
issue is a file move away from being its own archive page.

It drafts and does not send. The listings are laid out the way the sites lay
them out; any words beyond them are for a person, and an issue nobody read
before it went out is the quickest way to lose the trust the signup box asks
for.

## Search, open-now, a directory, guides, and the slots for a sponsor

The site had listings a reader could trust and no fast way through them. A
reader who wanted pizza browsed; one who wanted "is it open" read a line of
text and did the arithmetic; one who wanted the hardware store looked under
Eat & Drink and did not find it; one who wanted the playgrounds got the
railroad. This pass is about finding things, and about the foundation for
the day someone asks to sponsor a page.

### The events page asks "when" before "what"

The filters were categories: Music, Arts, Civic. The questions readers arrive
with are tonight, this weekend, something free. The first row of pills is now
Anytime, Today, This weekend, Next 7 days and Free, the second is the
category, and the two combine. Today and the weekend are decided in the
reader's browser from the Denver date, for the reason Freshness.astro gives:
the build is a snapshot and the page has to stay right after it. The chosen
filters go into the URL, so "free things this weekend" can be bookmarked,
shared and linked from the email, and survive a reload. A strip of day chips
under the filters jumps down the fortnight, and on a phone the day heading
sticks to the top while its listings scroll under it.

The "nothing matches" line is a reset, not an apology: on a Sunday evening
"This weekend" is empty, correctly, and a dead end there would read as a
broken page.

### Search, static

Pagefind indexes `dist/` after every build and writes a static index under
`/pagefind/` that the browser loads in pieces as it searches, so there is no
search server, no third party and no request that leaves our host. Two
dependencies were the rule and this is a third, the first added since the
plan; it earns its place by being the one feature every other friction on
the list is partly solved by. The CSP gains `'wasm-unsafe-eval'` for the
WebAssembly it runs on and nothing else. The result list is our own markup
rather than Pagefind's bundled UI, in the site's type, with each page's kind
(Event, Place, Guide) from a `data-pagefind-meta` set in Base.astro. Only
pages that are not noindex are indexed, which keeps past events, the
thank-you pages and the search page itself out of the results.

### Hours as a line of text, read as a schedule

Hours stay the one free-text line the weekly session edits; nothing new to
maintain. `src/lib/hours.ts` reads that line into schema.org `openingHours`
at build time and the same code runs in the browser to say "Open · closes
7 pm" or "Closed · opens tomorrow 10 am" on every place row and place page,
and to drive an "Open now" pill on Eat & Drink and the directory. The
structure also goes into the listing's LocalBusiness markup.

It parses only what it is sure of. Of 146 distinct hours lines, 122 read as
a schedule. The rest — dawn to dusk, by appointment, seasonal, an office and
a service on one line — show the text and make no open-now claim, because a
confident wrong "Open now" on a shop that shut at five is worse than no
badge. The heuristics for a line with no am or pm are written down in the
parser: 6 to 11 opens in the morning, 1 to 5 in the afternoon unless that
would run the place overnight or the same line opens earlier with an
explicit am; a close is evening unless it is 12, which is noon before an
eleven o'clock opening and midnight after. The validator reports the lines
it cannot read (`npm run validate -- --hours` lists them) so they can be
reworded, and a listing can set `openingHours` explicitly for the odd case.
One line was found genuinely ambiguous and left as it was: the Dugout's
"Fri 9 am–12", which reads as noon and is probably midnight; that is for the
content, not the parser.

### A directory, and the nav that goes with it

Shops were filed under Eat & Drink and lodging under Things to Do, which is
where the code found it convenient, not where a reader looks. `/directory/`
is every place in the town by kind, counted, with the kind filter, the
open-now pill and a name search that needs no index because the names are on
the page. It went into the primary navigation, as did Guides. To keep the
row to six, About moved out of it: it is in the footer of every page and on
the hub's own nav, and the row is for the things a reader came to do.

### Guides, and where they live

Articles were reachable from the home page while they were one of the two
newest and from Things to Do if they were about the outdoors, and otherwise
from nowhere. `/guides/` lists them by subject, practical subjects first and
history last. Articles gained `sources` and `verified`, shown at the foot,
because a guide to the playgrounds is only worth reading if a reader can see
what it rests on; the validator's frontmatter parser learned an inline map
in a list for it, which is the smallest YAML that carries a label and a URL.

Ten guides went up with this, one "with kids" per town and a food guide for
the three towns with enough breakfast places to fill one. They are assembled
from the listings, which are checked against their sources, and say nothing
the listings do not. Trash day, where to vote and snow routes are the next
subjects and need the official pages read, which is a content session, not a
build.

### A weekend page for each town

The hub has had `/this-weekend/`; each town now has its own. A filter is
not a link: this is the URL the email points at and the one that gets texted
to a friend.

### The slots for a sponsor, built and empty

/advertise/ described three placements. Now they exist in the markup and
render nothing: `sponsors.events` is a labeled "Presented by" line under the
header of the events and weekend pages, `sponsors.movingHere` a labeled
block in the Moving Here sidebar, `sponsors.email` a line at the top of the
weekly draft; the hub has `sponsors.email` for the network issue. Same shape
as the editor and the rate card: the slot is in the config, dark until set,
and appears the day it is sold with no template work. Text only, linked with
`rel="sponsored"`, never inside a listing. `/for-businesses/` on each town
says what a free listing is, how to claim or correct one, and what is for
sale, for the owner of a café rather than a media buyer; the place page's
"Own or run this?" line links to it.

### What this pass did not do

Photographs: fifty of 240 places and six of 575 events have one, and the
route to fixing that is the outreach in docs/, not code. Series pages for
recurring events wait for the first sponsor conversation to show whether
anyone wants to buy one. Phone numbers are on 44 places; tap-to-call is only
as good as that number.

## The reply address receives mail

The open item from "The reply address that could not receive a reply" is
closed. On 27 September all eight domains went onto Cloudflare Email Routing
with one rule each, `hello@<domain>` forwarded to the owner's inbox, and a
DMARC record added by hand. Turning routing on wrote the rest: three MX
records, the SPF record and a DKIM key, the MX and DKIM locked by Cloudflare
while routing is on. Checked the same day on Google's and Cloudflare's public
resolvers — MX, SPF, DKIM and DMARC on all eight domains — and Cloudflare reports
routing enabled, ready and synced on each. What is set, and how to check it, is
under *Email* in DEPLOY.md.

- **One rule, no catch-all.** `hello@` is the only address the network
  publishes. A catch-all turns every guessed address into a forward:
  dictionary spam into the owner's inbox, through the same forwarding path
  whose standing with Gmail is what gets the real mail delivered.
- **DMARC at `p=none`.** The usual advice for a domain that sends no mail is
  `p=reject`. These are meant to send — the outreach documents ask for mail to go out from
  `hello@` — but nothing signs outgoing mail for them yet, so anything sent as
  `hello@`, through Gmail or anything else, fails DMARC, and a strict policy
  would have it junked or refused. `p=none` publishes a policy without
  enforcing it. Raise it to `p=quarantine` once outgoing mail is signed for
  the domain.
- **No reporting address.** An `rua` tag brings a daily XML report from every
  large mailbox provider, per domain: eight streams of attachments into a
  personal inbox about domains that send nothing yet. Add one, pointed at a
  service that reads them, when there is outgoing mail to watch.
- **The eight, and nothing else.** The Cloudflare account holds twenty zones,
  the two retired predecessors among them. Only the network's eight domains
  were changed.

The session that set this up could not test delivery — its container cannot
open port 25 — so the owner did, the same day: a message sent to `hello@` from
a separate account arrived in the owner's inbox.

## Four image catalogs, a credits page, and three captions that were wrong

*30 September–1 October 2026.* The owner supplied four catalogs of Wikimedia
Commons photographs, about 430 entries in all, and a brief asking for a
crawler script and a credits page. Each file was checked against its live
Commons record (author, licence, coordinates, categories) and against
`IMAGE_LICENSES.csv`, and looked at before it went in.

- **Two "client-supplied" Niwot photographs were Commons photographs.** The
  Tribune storefront and the gateway sculpture are crops of Jeffrey Beall's
  `Niwot, Colorado.JPG` (CC BY-SA 4.0) and `Niwot, Colorado sign.JPG`
  (CC BY 4.0), and were live without the credit both licences require. Now
  credited. The other four townofniwot.com photographs are not on Commons;
  the owner confirmed on 1 October that they were supplied with permission
  and may be used on insideniwot.com (PERMISSIONS.md). The sunset trail photo
  among them was on three entries at once, so it showed twice on the home page
  and on nine pages in all; it now belongs to the LoBo Regional Trail only.
- **Added:** the Old Fire House Museum as a Niwot place (its sources disagree
  on what happened on 26 October 1999, a 99-year lease or the landmarking, so
  the page gives no date); photographs for Johnstown's Parish House and
  Elizabeth's 1907 bank, both exact address matches; Russell Lee's 1946
  Puritan Camp house in Erie's history, which already said the camp had been
  photographed for the federal government.
- **The two National Register barns went into Johnstown's history, not the
  places list.** The Brush barn (1865) and the Anderson barn (1913) are on
  private, working farms, and a place listing tells readers to go there. The
  section says they are not open to visitors. Facts are from the two
  nominations.
- **Traps in the catalogs**, for whoever reviews the next one:
  `Historic Briggs Building - panoramio.jpg` is in Raleigh, North Carolina,
  not on Briggs Street; the Buc-ee's file titled Berthoud is the Johnstown
  store; `Niwot, Colorado.JPG` is the Tribune building, not a town view;
  Peaceful Valley's chapel, Lion Gulch and Homestead Meadows are filed under
  Lyons but are miles outside it; the 1937 AIL aerial frames are filed by
  county and cannot be tied to a townsite.
- **Not used, on purpose:** photographs whose subject is identifiable people
  (the RockyGrass performers and jams; the Puritan Camp frames of named
  children inside their homes); the 73 SparkFun headquarters photographs, a
  company's offices rather than a place to visit; and the brief's Unsplash
  and Pexels fillers, which would break the rule that every photograph shows
  the actual place.
- **No crawler script.** Commons had been gone through four times by then;
  the script would write manifests to folders the site does not read, and
  treats a town's whole category as approved, which is exactly what lets
  locator maps, scanned documents and same-named places in.
- **`/credits/` on every site**, linked from the footer and the editorial
  policy. Captions credit a photograph where it is shown in full; the same
  photograph also appears on cards and in link previews with no caption, and
  CC BY and BY-SA still require credit there. The page lists only photographs
  the site actually shows (Lyons keeps 18 unused files; it lists 14, not 32),
  each with author, linked licence, the original, what was changed and where
  it is used. It is built from the register through `src/lib/credits.ts`,
  which turns internal notes into a reader's credit and throws on a row it
  cannot read.
- **The validator now checks captions against the register.** Its first run
  found three wrong ones: Erie Town Hall credited Jeffrey Beall, CC BY 4.0,
  for Erie Bard's CC BY-SA 4.0 photograph, and Johnstown Town Hall said
  CC BY 4.0, on two pages, for a CC BY-SA 3.0 one. Both confirmed on Commons
  and fixed. It also now covers inline images and town heroes, and fails on
  an image with no row.
- **Wikimedia rate-limits the cloud sessions' shared address.** Downloads, and
  later the API itself, returned 429 for over an hour. `E County Line Road
  01.jpg` (Erie Bard, CC BY-SA 4.0), meant as the hero of *Which side of
  County Line Road*, was never downloaded or seen, and is left for a later
  session.

## A correction from Niwot: last year's open house, at someone's home

*1 October 2026.* Kathy Trauner wrote through the Niwot contact form: there
is no open house this Sunday, the information is from 2025, and the address
printed, 9700 Niwot Road, is private property, which put its owners in a
difficult position. She offered her email for confirming Niwot tree carving
events in future.

- **What was published.** `tree-sculptures-open-house-2026-10-04.md`: an
  open house in support of the restoration of Eddie Running Wolf's tree
  carvings, Sunday 4 October 2026, 2 to 5 pm, at 9700 Niwot Road, sourced to
  niwotarts.org and marked verified on 17 September. The file is deleted. The
  address appeared nowhere else in the content, and the event was in no
  newsletter issue.
- **How it got in.** On 1 October 2026 the Association's home page still
  carries the flyer, with no year on it: "Open House, Saturday Oct 4, 2–5 pm,
  9700 Niwot Road". 4 October is a Saturday in 2025 and a Sunday in 2026. The
  weekday check that caught six previous-year pages in the 18 September
  session (above) would have caught this one too; the weekday was dropped on
  the way into the file and the listing went out as a Sunday. A flyer that
  names a weekday has told you its year. And `verified` records the day a
  page was read, not that the page was current.
- **The address.** 9700 Niwot Road is a house. The Association's own project
  page puts the carvings in Left Hand Valley Grange Park, at 83rd Street and
  Niwot Road, on a site leased from Boulder County; the open house address
  was not the project's, and had no venue or business name attached. A flyer
  does not make an address public. The rule that comes out of this: a bare
  house number on a road, with no venue name, is a home until shown
  otherwise, and a home is not printed. If an organiser holds something at a
  home, the listing names the organiser and links to its page, and the
  address is left to them.
- **Confirming Niwot tree carving events.** Kathy Trauner has offered to
  confirm them by email. Her address is on her 1 October submission in the
  Niwot Formspree inbox and is not written here. Future tree carving events
  are checked with her before they go in.

## Phase 9 — Windsor and Fort Collins

The plan is `docs/EXPANSION-WINDSOR-FORT-COLLINS.md`; these are the choices made
while carrying it out, on 1 October 2026.

- **Both towns are scaffolded in one session, not one after the other.** The
  plan's rule stands for the launch — each goes into `LIVE_TOWNS` only when its
  domain serves — but the code changes are shared (the tests, the map, the hub
  copy) and were made once for both, and the content was researched in
  parallel. The registry is not the gate; `LIVE_TOWNS` is.
- **The Fort Collins domain is insidefortcollins.com**, which the owner holds.
  The first draft of the plan read "ft collins" literally, found
  insideftcollins.com unregistered and proposed buying it; the owner
  confirmed the other the same day. Nothing was bought. Slugs are `windsor`
  and `fortcollins`: one token each, like every slug before them, and the
  "co" in Windsor's domain belongs to the domain and not to the folder.
- **Lake teal for Windsor, navy for Fort Collins.** Teal was the one hue family
  none of the eight accents used. CSU's green was the obvious Fort Collins
  choice and would have sat beside Niwot's; nothing else in the network is a
  blue this dark, and the hub's and Berthoud's both read lighter. `npm run
  check-colors` passes at ten sites.
- **"Small towns" is gone from the hub; "towns" stays.** Fort Collins is a city
  of 169,810 and the hub's tagline is also the Organization description in the
  publisher graph, where a false line is the wrong thing to put. The network
  is named Inside the Towns and that cannot change. The about page says which
  member is a city, read off the configs (any live town over 100,000), so the
  component names no town and the sentence stays dark until the city is live.
- **Fort Collins leaves the map's reference cities, and the label rule learns
  to look both ways.** Windsor's pin lands fifteen pixels right of and
  twenty-one below Timnath's, which tripped the crowding rule and sent
  Timnath's label left, straight across the Fort Collins pin five pixels off
  its line on the other side. A label now goes to whichever side has more
  room, measured off its own line; nothing else on the map moved.
- **The tests read the registry.** Four loops in the series tests and the
  dated-content test listed the seven slugs by hand, so every new town began
  by failing tests that had nothing to say about it. They take the slugs from
  `registry.ts` now, live or not. `new-town.ts` still wrote `county`, the field
  renamed to `counties` when the split towns started naming both; a fresh
  scaffold did not type-check. Fixed.
- **A scaffolded town fails `npm run validate` until it has a real hero.** The
  credits parser rejects any licence row containing "placeholder", by design,
  and the scaffold writes one. That is the right gate for a live site and an
  abrupt one for a town an hour old; it is noted here rather than softened.
- **Fort Collins incorporated in 1873, per the City.** Wikipedia's lead says
  the Town of Fort Collins was incorporated on 12 February 1883; the City's
  own history page says it was incorporated as a town on 3 February 1873. The
  City is the primary source and the comparison table follows it.
- **Windsor's county split rests on the Town's own School Districts page**,
  which lists three districts inside the town limits and does not say which
  county each serves. The counties are the districts' own: Weld RE-4 is the
  Windsor-Severance district in Weld; Poudre and Thompson are Larimer County
  districts. The config says so and the test holds the school line to
  "Mostly".
- **Wikimedia rate-limited the session again.** The Commons API returned 429
  for every category and search query after the first few; the file
  description pages and `Special:FilePath` downloads worked with a backoff of
  a few seconds per attempt, and the hero download that landed as an HTML
  error page was caught by the build rather than shipped.
- **Heroes.** Windsor is Jared Winkler's 2018 photograph of the frozen lake
  with the town along the far shore (CC BY-SA 4.0, 5,999px original). Fort
  Collins is the Northern Hotel on College Avenue (Xnatedawgx, 2020, CC BY-SA
  4.0); the alternative, a 2012 phone photograph of the city from Rotary Park,
  was downloaded, looked at, and rejected for its haze and the road across
  its foreground. Old Town Square and Horsetooth Reservoir come with card
  photographs; the 2012 Windsor Mill under reconstruction illustrates the
  history article and not a listing.
- **A comparison stays dark until both its towns are live.** The pair pages
  were built for every entry in the list, so one written ahead of a launch
  would have linked to a domain that does not serve. `liveComparisons()`
  filters by `LIVE_TOWNS`; Timnath–Windsor is written and waits.
- **The deploy ran on tokens the owner handed over, one service at a time.**
  The Vercel connector could read the team but was refused project creation
  on every route, so the owner issued an account token and the two projects
  were created through the REST API: linked to the repository, `TOWN` for all
  three environments, Node 22.x, the apex and `www` domains. The session's
  policy blocked triggering a production deployment directly; it turned out
  not to matter, because linking the repository had Vercel build `main` on
  its own, and both domains were serving their guides before the
  `LIVE_TOWNS` merge, as the plan's rule asks. Cloudflare took three
  attempts — a Vercel token, a value Cloudflare did not recognise, and a
  valid token with no zone resources — before one with DNS edit on every
  zone arrived; the A, `www` and DMARC records went on through the API. It
  had no Email Routing permission, so `hello@` on the two domains is the one
  piece of the launch left for the owner. Every token was held in a
  permission-restricted scratch file, never in a command or a log, and
  deleted when its job was done; the owner was asked to revoke each.
- **Fort Collins is sixty places by selection, and the selection is recorded.**
  Thirty of them eat, drink and shop (twenty in Old Town, the rest spread
  across Midtown, Harmony, Campus West, North College and the south), thirty
  are parks, trails, natural areas, venues, three hotels and two services.
  What is not there, and why, so nobody repeats the search: the Lyric, whose
  site is a script shell with no readable text; Rio Grande, whose page is
  longer than a fetch will return before the hours; five Squarespace sites
  whose robots.txt names ClaudeBot and anthropic-ai with `Disallow: /`
  (Little Bird Bakeshop, the Food Co-op, Trimble Court Artisans, Purpose and
  Gilded Goat), left alone on the same rule as the Berthoud chamber; five
  sites that answered 403, three that answered 503 three times, three that
  render only in a browser (Maxline, Outpost Sunsport, Wolverine Farm), and
  three with no site of their own. So the guide has no food co-op, one
  outfitter and no Midtown brewery, and says nothing it did not read.
- **Old Firehouse Books is the one listing not read from its own site.** Its
  robots.txt asks AI crawlers to stay out, so the listing rests on the
  Downtown Fort Collins Business Association's page: address and phone, no
  hours. A person can read the shop's own hours and add them.
- **csurams.com sits behind an Incapsula challenge**, so Canvas Stadium is
  written from CSU's building and commencement pages, with the 36,000 figure
  labelled as commencement seating rather than football capacity, and no
  street address because none of those pages gives one.
- **Hours that would have lied were written as text.** The recycling center
  changes hours on 1 November; the reservoir's County page gives only the
  information center's; the Gardens label theirs "summer". None of the three
  makes an open-now claim.
- **The Fort Collins history follows the City where the City and Wikipedia
  disagree**, and the article says so: incorporation 3 February 1873, not
  1883. The breweries' own founding years (Odell 1989, New Belgium 1991) win
  over the City timeline's 1990 and 1992. Where the City's own pages disagree
  with each other — the trolley's last year, the 1954 charter election's
  weekday, the 1900 population, the sugar factory's closing year, which
  cavalry unit founded Camp Collins — the article rounds to what both
  support or names neither. Harper Goff and the Disneyland Main Street claim
  are kept to what Wikipedia and Visit Fort Collins actually say.
- **The moving-here page sources each neighborhood to the City's own corridor
  plan** (Midtown 2013, West Central 2015, North College 2007, Harmony 2006)
  and the market to the March 2021 Housing Strategic Plan, dated in the text,
  because the City publishes no fresher figure as a plan. Two plan PDFs were
  past the fetch limit and were read with pdftotext. Poudre Fire Authority's
  own site refuses automated reads, so the page states the City's figures for
  it and links it; Xcel's gas service and Bustang's fares had no readable
  page and are not claimed.
- **Fort Collins has sixty event files and four annuals with none.** FoCoMX
  publishes only its April 2026 dates; the Colorado Brewers' Festival's
  domain no longer resolves and the one directory that mentions it says
  cancelled; Bohemian Nights at NewWestFest was discontinued in 2021; Tour de
  Fat's page gives 29 August 2026 and nothing after. None of the four has a
  file, on the rule that stopped the Elizabeth tree lighting. The holiday
  lighting on 6 November is on the City's own page and is featured. The
  First Friday Art Walk and the Foodie Walk are generated from the stated
  monthly recurrence on the DDA's pages, as the Elizabeth library programmes
  were. The Winter Farmers Market publishes no end date, so its repeat stops
  at 19 December and the body says why.
- **csurams.com answers every automated read with a bot challenge**, so the
  three football home games rest on the Denver Gazette's dated schedule
  report cross-checked against Wikipedia, with the athletics site as the
  link and the bodies saying so; basketball and volleyball, which no dated
  press covered, are left out. The 24 October kickoff is "to be confirmed"
  because the Gazette and Wikipedia disagree.
- **Windsor's thirty places come from the Town's recreation site and the
  businesses' own pages**, with the same gaps reported the same way: Mash
  Lab's site refuses reads, so its listing rests on the chamber's member page
  with no hours and the body says so; Pizza Vino's robots.txt names ClaudeBot
  and Memory Lane Antiques' carries `Content-Signal: ai-input=no`, both
  treated as opt-outs; SpringHill Suites' site blocks reads, so the town has
  one lodging listing; Chimney Park Restaurant is listed as closed after its
  2025 kitchen fire, with its own site's reopening estimate, rather than
  dropped — the Johnson's Corner precedent. Highland Ridge Open Space was
  written and then dropped when its Town page vanished between reads. The
  Art & Heritage Center's hours differ between two of the Town's own pages;
  the listing uses the facility page and says so.
- **The Town's recreation site re-numbers its facility pages.** IDs above
  about sixty pointed at different parks on successive reads; the six
  facility URLs kept were re-fetched and confirmed before the files were
  finished, and the link check should be read with that in mind.
- **Windsor has thirty-eight event files, four of them on a judgment call the
  files explain.** Thirty-five one-offs and three weekly regulars from the
  Town calendar, the Parks site, the chamber calendar, the breweries and the
  library. Four Parks pages give a date without a year (the Floral Alchemy
  reception, Veterans Day flag placing, Windsor Wonderland on 5 December,
  Wreaths Across America on 19 December); they were written because the same
  pages carry 2026 weekdays and a 2026 health fair, so the site had been
  refreshed for the year, and each body says so. The library's weekly
  storytimes were not rolled forward: the only readable listings stop in
  September, so the kids article describes them and links the calendar. The
  farmers market, the Harvest Festival and the summer series are named in the
  articles and the moving-here page and have no files, having no 2027 date.
- **Windsor has a bus after all.** The config said there was no fixed-route
  transit; the moving-here research found the Poudre Express, a weekday
  commuter route between Greeley and Fort Collins with two stops in Windsor,
  on Greeley's own transit page. The config now says that, and that there is
  no network inside the town.
- **The sugar factory's closing year is given as both.** The Town's history
  page says 1966 and Wikipedia's Great Western list says 1968; the article
  gives both with their sources rather than pick.
- **Windsor's history rests on the NPS record and Colorado Preservation
  where History Colorado would have been the source**: historycolorado.org
  renders only in a browser and returned nothing readable, twice.
- **The Town's news alerts answered 429 three times**, so the 2025 Windsor
  Wonderland and cone-tree notices are not cited; the Town calendar for
  November onward renders no events to an automated read and the RSS feed
  carries October only, which is why the later Town Board dates come from the
  Board page's stated schedule and the files say they are not yet on the
  calendar.

## The October audit, and what the build learned from it

`docs/AUDIT-2026-10-02.md` is the record of the audit itself: every finding,
what was done with it, the phone list. These are the decisions behind the
changes that were not simply corrections.

- **Listings carry a status, and a closed one stays.** The audit found a
  restaurant closed since February and a sports complex shut since 2025 in the
  standard open template, with hours and an open-now badge, because nothing
  in the schema could say otherwise. `status` on places (`open`,
  `temporarily-closed`, `closed`) and events (`scheduled`, `postponed`,
  `canceled`) is the fix, and the choice that mattered was what a closed
  listing does. It is not deleted: a URL that was live should keep answering,
  and the reader who searches for the place deserves the answer rather than a
  404. So the page and the directory row stay, labeled, with the hours and the
  badge gone and the place off the home page and out of the picks. A canceled
  event likewise stays on the calendar, struck through, for whoever had the
  date in their diary, and leaves everything that recommends: the picks, the
  feeds, the email, and the indexed page of its series. A bare "canceled" with
  nothing behind it is the kind of claim the network avoids, so the note
  saying who says so is required by the schema, not asked for in a README.
- **The events page opens on the one-offs.** Erie's list ran to two hundred
  rows and Brewfest was in the middle of them. The audit's answer is to take
  the storytimes, clubs, trivia and meetings off the calendar altogether, and
  its standard for what counts as an event is adopted in the README; but
  removing three hundred listings is a judgment per listing, made with the
  organizer's calendar open, not a script. The build's part is a default view
  that hides the regulars and the civic calendar behind one pill, decided the
  same way the home page already decides its picks. The server renders every
  row, so a crawler and a reader without JavaScript see the whole list, and a
  chosen category shows all of itself, since a reader who picks Civic wants
  the meetings.
- **The counts were right; the deployments were not.** "Sister towns" read 6,
  7 and 9 across the network because three sites had been deployed on three
  different days, each computing the number correctly for the day it was
  built. The hub's advertising page served placeholder copy for the same
  reason. The one real fault was the About page counting weekly occurrences
  as events. Nothing here is typed by hand; the lesson is that a change to a
  shared number is a change to every site, and the scheduled rebuild is what
  carries it.
- **The rebuild fires twice overnight.** The schedule was fine and the runs
  were green; they were also five to eight hours late, every day, which
  GitHub's documentation allows for and which nothing had checked. A 09:10
  UTC fire landing at 16:00 UTC is a 10 am rebuild in Denver, after the
  morning reader has seen Thursday's events on Friday's calendar. A second
  fire at 07:10 UTC, the earliest that is past midnight Mountain in both
  halves of the year, costs ten deploys a day and roughly halves the odds of
  a late morning. The browser-side removal of past rows stays as the layer
  under both.
- **A link that lands on another site fails the check.** Cassidy's old domain
  was bought by an online casino and answered 200, so the link checker called
  it fine for weeks and the guide linked to a casino twice as the business's
  own page. The check now compares the host a link names with the host it
  lands on, reports the difference as moved, and fails the run on it, since
  it is sometimes a rebrand and more often a hijack and a person has to look
  either way.
- **Thirty days, not ninety.** Hours had drifted at five of sixteen Erie
  businesses in the fortnight after they were checked. A ninety-day flag is a
  quarter of a year of being wrong on the thing that changes fastest. Thirty
  days across some 330 places is nine a town a week, which is a rotation one
  person can keep.
- **Review-site hours came off rather than the policy changing.** The policy
  says review sites and directories are not used, and four listings cited
  Yelp or Restaurantji for hours because the businesses have no site. The
  audit offered a choice: re-source them or change the policy to say what is
  true. The policy is the right one, so the hours came off and the summaries
  say the business publishes none, which is true, and the phone list has the
  four names. A guide that says "we don't use Yelp" and does is worse than one
  with four blank hours.
- **Misplaced photographs came off rather than being swapped.** Five
  photographs showed somewhere other than the place they were on: a creek in
  the canyon on the park page, the trail twenty miles away in Greeley, a
  carving removed in 2023 and described as on display. There is no licensed
  photograph of any of the five to put in their place, and a wrong picture is
  worse than a typographic tile. The hero captions that placed a reservoir,
  a lake and two roads in towns the source files do not support now describe
  what the photograph shows; the photographs stay, because replacing a hero
  is a photo pass, not a caption. Windsor's was the exception: the
  Commons subcategory for Windsor Lake, which the town's own category does
  not surface, holds a June 2017 drone photograph of the lake with downtown
  on the far shore and the Front Range behind, by the same contributor as
  the Main Park and Poudre River photographs. It is the hero now, and the
  frozen lake illustrates the lake trail, where a winter walk along the
  shore is what the picture shows.
- **"Doubled" became "grew by three-quarters".** Windsor's tagline said the
  town doubled; the hub's own table shows 18,644 to 32,716 between the
  censuses, which is 75 percent. The 2026 estimate of 48,302 would make
  "doubled" true over sixteen years, but the sentence sat next to the decade's
  figures and read as the decade's claim. The hub's tagline lost "northern"
  for the same reason: Elizabeth is on the Palmer Divide, south-east of
  Denver, and a line that puts every guide north of the city is wrong on one.
- **What was declined, and why.** "This Weekend" in the main navigation:
  seven items do not fit the header at tablet width, where six already scroll,
  and the events page links it in its first line. Shops and Stay as their own
  pages, and Parks, Lakes, Trails, Landmarks and Civic in place of Venue and
  Trail: a schema and URL change across 330 listings, worth doing as its own
  pass with redirects. Getting-here pages, schools sections, a share image per
  page, the hub home page: each a design pass. Required phone, website and
  hours: would fail the build on some 180 existing listings, so it is an entry
  rule for new ones until the rotation has filled the old.

## The Johnstown Historical Society answers

*2 October 2026.* Billie, for the museum director, answered C8 (the Parish
House rooms, the meteorite, the walking tour). Four things came out of it.

- **"You can use the photos" is read as the walking tour page's.** The
  sentence names no photographs, but it sits in the paragraph answering the
  walking tour question, about a page whose pictures are the Society's and
  which says "contact us for licensing" under them. The grant is recorded
  verbatim in `PERMISSIONS.md` with that reading stated, and the reply names
  the three photographs used, so the reading is hers to correct. Three rather
  than the whole set: the listing is a card and a page, not a gallery, and
  the Society's page is where the set belongs. The lead is the Charlotte
  Street sidewalk at the Parish House sign, where the walk starts; the two
  inline are a now and a then, the Masonic Temple and the McCormick
  Mercantile in the early 1900s. The attendee photographs on the two event
  pages were not asked for and are not covered.
- **The credit line is hers, "Ltd" included.** Captions say "Courtesy of the
  Johnstown Historical Society, Ltd" verbatim, because that is what was asked
  and because the Ltd is what tells this society from the Pennsylvania one
  the site has had to keep out before ("Beware the other Johnstowns",
  above). On `/credits/` the Society is the rights holder and the licence is
  "used with permission", as for Erie and Berthoud; a `GRANTS` line in
  `src/lib/credits.ts` reads the row.
- **Landscape, for the photographs still to come.** She asked portrait or
  landscape. Every slot a listing photograph fills is landscape: 3:2 on the
  page, 4:3 on cards and the credits grid, 16:10 on article cards. The reply
  says landscape, the largest file she has, and that a portrait would be
  cropped to its middle.
- **The Cemetery Crawl got its times.** Her note that registration had
  opened was checked against the Society's event page, updated the day
  before: tours at 10 am and 12 pm, the same content, about an hour. The
  listing carries the times, links the event page rather than the events
  index, and takes the practical notes (cap per tour, parking inside the
  cemetery, most stops passable with a mobility aid). The Holiday Open House
  page still says "Time: TBA"; its listing is unchanged, re-verified.

## The Town of Johnstown answers on parks

*2 October 2026.* Tim Hoos, Public Works Director, answered B3, copied to
Samantha Knowlton; a second reply said they were looking through their
files, and a playground photograph followed.

- **No permit, and no park users without their permission.** The Town holds
  no current park photographs, so the eight parks are a walk, which needs no
  permit. His one condition becomes the rule for the walk, in Johnstown and
  as the default everywhere: no one in a park photograph unless they have
  said yes, which means empty playgrounds and paths, shot early. Boulder
  County's rule (fewer than 25 people, open hours) was about permits; this
  one is about the people in the frame, and it is the stricter of the two.
- **The photograph is the north playground at Sunrise Park.** The email
  names no park. Three signs pointed to Sunrise: the Town's own aerial of
  the park's north side shows the same rail fence along the same fields;
  the Council awarded a playground equipment contract for Sunrise Park on
  1 June 2026 (The Johnstown Breeze, 2 June 2026); and the Town's pages for
  Clearview and Rolling Hills Ranch, the parks with recent photographs,
  show different playgrounds. The listing went up on that inference, and
  the owner confirmed it the same day ("its north sunrise park"), so the
  listing now says the north side and the reply no longer asks.
- **Permission is implicit, and recorded as such.** A photograph sent in
  reply to a request that said the use and the credit is permission for that
  use with that credit, but it is a thinner grant than a sentence, so the
  reply names both. Credit "Town of Johnstown", as the request promised; a
  `GRANTS` line reads the row.
- **"Several have new playgrounds."** Which ones is the question the reply
  asks, with the seven parks still without a photograph named, so the walk
  can start with the playgrounds they want seen.
