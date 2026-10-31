# Decisions

*This file is the log, not the rulebook. Every entry stays as it was written,
including the ones later entries undid. The rules in force today are in
`HOW-IT-WORKS.md`; where an entry here and that file disagree, that file
wins. Add an entry when a rule changes and change the rule there the same
day.*

Choices not covered by PLAN.md, with the reasoning. Entries run oldest to newest.

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

The audit line "No contact form ships" in `docs/archive/LAUNCH-AUDIT.md` is no longer
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

`docs/archive/emails/INDUSTRY-EMAILS.md` is the batch route out of the photo problem: twelve
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

The plan is `docs/archive/EXPANSION-WINDSOR-FORT-COLLINS.md`; these are the choices made
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

`docs/archive/AUDIT-2026-10-02.md` is the record of the audit itself: every finding,
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

## Erie's last five parks, and the Singletrack

*2 October 2026.* Ashley Burger answered D2 the morning after it was sent:
the five parks now have photographs on their own erieco.gov pages, which the
18 September grant covers as written, and five Singletrack photographs came
by Google Drive folder ahead of the Town's own page.

- **One photograph from each park page, chosen by what the listing says.**
  Arapahoe Ridge's tables under its shade trees; Lehigh's playground; Longs
  Peak's playground with the scavenger-hunt panel the listing mentions;
  Serene's wooden treehouse with the Flatirons behind it; Star Meadows'
  shelter at dusk with the moon-phase sundial. Each listing also gained its
  Town page as `url` and `source`, which the earlier Erie park listings
  already had, and Star Meadows gained its street number, 777, from that
  page. She changes the pages' photographs periodically; the ledger records
  which page each came from, not which photograph the page shows today.
- **The Singletrack leads with the shelter, with the trail and the kiosk
  inline.** The shelter photograph is the largest and shows what the place
  is: the open space, the town below, the Front Range, and a rider. The rider
  wears a full-face helmet and the Town chose to share the photograph; this
  is not Johnstown's park-users condition, which binds our own photographs.
  The summer trail shot is the only one of the five that shows the
  singletrack itself, so it goes inline at its 960px, square; the kiosk
  photograph goes inline because its map is the one on the Town's page,
  readable. The fall sunrise shot is portrait, and the small rider shot is
  640px; neither is used.
- **Drive photographs are recorded as supplied, not as published.** The
  grant's scope is "published on erieco.gov", and these are not yet. They
  were supplied in answer to a request made "on the same terms as before"
  under her own offer to find unpublished photographs, so the ledger says
  "supplied by Ashley Burger by email" and PERMISSIONS.md says the same,
  rather than stretching the published-on-the-site wording to cover them.
- **Erie is complete.** Every Town of Erie park and open space listing has a
  photograph. Tracking rows B2 and D2 say so.

## The re-check, and a third fire

*3 October 2026.* The audit's own re-check, a day on, was checked against
main (`docs/archive/AUDIT-2026-10-02.md`, last section). Two decisions came out of
it.

- **A rebuild fire sized to the lateness, not the schedule.** The two
  overnight fires are five to eight hours late every day, and on 2 October
  landed at 7:49 and 9:42 am Mountain, so a reader without JavaScript saw
  Thursday's events on Friday morning, as the re-check says. A 04:10 UTC
  fire lands between 2 and 5 am Mountain at that lateness. If GitHub ever
  runs it on time it is a 10 pm rebuild the evening before, which changes
  nothing and costs ten deploys, and the 07:10 fire still covers the night;
  either way the morning is fresh. Thirty deploys a day on a hundred-a-day
  allowance leaves room for pushes.
- **Two sources, two numbers, no ordinal.** The Niwot Trot is "21st annual"
  in the Courier's headline and "17th Annual" on the organizer's own page.
  The organizer is the source the policy prefers, but a PTAC page can carry
  last year's template as easily as a newspaper can miscount, and the
  ordinal is decoration. The listing says "the annual Niwot Trot" and cites
  both.

## Colorado State, as a Campus area

*3 October 2026.* The audit's one structural recommendation that was taken
up: the university is the largest thing in Fort Collins and the guide had
one listing and three football games for it, with the stadium filed under
"Campus West", which the guide's own Moving Here page defines as the
shopping district on West Elizabeth.

- **An area, not a menu item.** "Campus" joins Old Town, Midtown and the
  rest as an `area`, with six listings, an article and the events that pass
  the four-part test. The shared navigation stays shared; a Colorado State
  page can be promoted to it once it holds enough, as the audit said. The
  guide's promise becomes "Old Town and Campus", in the tagline.
- **Six listings, not seven.** The Oval has no page of its own on the
  university's visitor site, so it is in the article and the Moving Here
  entry rather than a thin listing; the rest come from the institutions'
  own pages, with hours and phones. The Lory Student Center publishes only
  its summer hours as of October; the listing carries them and says so.
- **Venue names match, so venue pages list their events.** The place page
  lists events whose `venue` equals its title, so Canvas Stadium's title lost
  "and the CSU campus", the football events name "Canvas Stadium", the
  basketball events name "Moby Arena" and the shows name "University Center
  for the Arts". The audit's "Canvas Stadium links to none of its games" is
  fixed by that rather than by code.
- **What was held.** Men's basketball: eight home dates on the Rams' page,
  none with a time, so none is listed. Volleyball: the Rams' schedule page
  refused every automated read (the basketball and football pages answered
  on retry), so the seven home matches the audit saw are not listed until
  the page can be read. The All-Choral Holiday Concert is off campus, at
  First United Methodist, and is listed with that venue.
- **The shows chosen by the test, not the calendar.** The UCA's October and
  November calendar runs to forty rows. Listed: the University Symphony, the
  free *Peter and the Wolf*, the Menotti one-acts, the Halloween Organ
  Extravaganza, *Alice by Heart*, the Fall Dance Concert and the holiday
  choral concert. Studio recitals, area recitals and ensemble showcases are
  on the UCA's own calendar, which the listing links.
- **No photographs yet.** Commons has Oval, Moby and stadium photographs
  worth a look; that is a licensing pass of its own.

## The open-licence photo search, and what it could not find

*3 October 2026.* Every listing without a photograph was searched against
Commons and Flickr's Creative Commons corner (`docs/archive/PHOTO-SEARCH-2026-10-03.md`).
Sixteen photographs went in, fifteen of them on Fort Collins; the rest of
the network's 257 came back empty.

- **The matching rule was the audit's, applied by eye.** A photograph had
  to show the listed place itself, viewed before choosing and again before
  going in. Nineteen candidates the matchers rated plausible were rejected
  on the second look, most for the reasons the audit gave for the five
  misplaced photographs it found: a previous tenant's sign, an unplaced
  stretch of river, a neighbour's building, a duplicate. The guide would
  rather show a typographic tile than any of those.
- **Why Fort Collins and nobody else.** Commons' coverage follows
  photographers, and Fort Collins has had several: the NRHP houses, the
  campus, the museums and the natural areas are there; the small towns have
  one contributor each, from around 2010 to 2017, who shot the landmarks the
  guide already uses. Flickr's open corner adds natural areas and breweries.
  No source adds a storefront with its present sign, in any town.
- **The remaining 257 are a walk and asks, not a search.** The one large
  unasked library is the City of Fort Collins (parks, trails, natural
  areas, 14 listings); the second is CSU Photography (3). Both are added to
  the ask list in spirit; the emails are the next session's.
- **Commons throttles.** Four matchers reading thumbnails at once, plus the
  pool build, drew HTTP 429 from Commons for about an hour. The thumbnail
  endpoint answered when the file endpoint did not, and downloads were
  spaced; a future run should read one town at a time.


## The first weekly pass across all nine towns

*3 October 2026.* The weekly routine (`npm run weekly`, then the organizers'
own pages) ran for every town in one day, Johnstown first and the other
eight in parallel, one worker a town, each confined to its town's events
folder and each handing back a report. Across the eight: a hundred past
one-offs deleted, sixty-five events added, some 130 files corrected or
re-sourced, 327 organizer pages read and 36 found unreachable. Johnstown's
pass, earlier the same day, added fourteen library events and deleted
eleven.

- **The organizer's page is the source, not the aggregator.** Most
  corrections were re-sourcing: a listing that cited a library's "upcoming"
  index or the Lyons Recorder now cites the event's own page, and the
  `verified` date says when it was read. Where the organizer's page and an
  aggregator disagreed, the organizer won: the Lyons ukulele group moved to
  the library's dates (13 October, 10 November, 8 December), and the three
  "Afternoon Art" files went, because the library lists no such programme,
  only Monday Makerspace in the same slot.
- **Series end where the calendar ends.** The barre3 class at New Belgium
  was a weekly file implying a date the brewery does not list; it is three
  dated files now. The Niwot Rotary's series runs to 15 October, where the
  club's own calendar stops, with the November mornings in a second file.
  The Lyons storytimes stop at the library's last listed date and resume in
  a November file, because the library skips four Tuesdays.
- **Members-only goes nowhere, as the audit said.** Erie's six Business
  Connections mornings were listed as "open to Chamber members"; the Chamber
  page says you must be a member to join. They are gone.
- **Unreadable pages are left alone, not guessed at.** Spirit Hound and
  MainStage in Lyons render their calendars in scripts; Washington's in Fort
  Collins answers with a captcha; Oskar Blues and csurams.com refuse
  automated reads. Those listings keep their earlier `verified` dates and
  the reports name them, 32 listings in all.
- **The Beerwerks feed is in Eastern time.** Timnath Beerwerks' Squarespace
  calendar can be read as JSON (`?format=json`), and its epoch times are two
  hours ahead of Denver: a truck the brewery's page puts at 12 to 8 reads as
  10 to 6. The audit's "correction" of the Cousins Maine Lobster truck on
  31 October was made from the feed and was wrong; the Timnath worker put
  the brewery's 12 to 8 back and the audit note now says so. Read the
  brewery's event pages for times; use the feed only for which days.
- **What a parallel pass costs.** Eight workers read some 330 pages in
  about twenty minutes each. The trade is review: every report was checked
  for weekday against date, venue against the place titles the venue pages
  match on, and source against the organizer, before its town was committed.
  The Lyons and Niwot workers each flagged their own doubtful calls, which
  is the behaviour to keep.

## The first listings rotation, and what a business's own site turns out to say

*3 October 2026.* The other half of the weekly routine ran for the first
time: 99 listings across seven towns, the ones verified on or before
18 September, checked for hours, phone, website and address against the
business's own site, one worker a town. Windsor and Fort Collins were
checked at entry this week and wait their turn. Of the 99: 21
confirmed as they stood, 53 corrected, 15 with no site of their own to
check against, 10 behind a captcha or bot check.

- **Phones were the gap, not hours.** Most corrections were a phone number
  the business publishes and the listing lacked; 110 of 337 listings had
  one at the start of the day. Hours drifted at a handful: Berthoud
  Brewing's taproom was wrong on every day, Duck Donuts closes at noon on
  weekdays, Piripi opens Mondays at 11, Cellar West had no hours at all.
  Four listings cited a magazine listicle or a Chamber directory for a
  restaurant's hours; they cite the restaurant now.
- **A directory is where to find the site, never the fact.** The Main
  Street, Chamber and niwot.com directories were used to find a business's
  own page and for nothing else. Where the only web presence is such a
  directory, or Facebook, the listing is unchanged and goes on the call
  list (`docs/archive/CALL-LIST.md`): 26 businesses whose hours only a phone
  call or a visit can confirm. The audit's rule for new listings, that
  nothing publishes without hours from the business itself, was not
  applied backwards to these; that is a decision for the publisher, listing
  by listing, with the call list in hand.
- **Stale is not confirmed.** Briggs Street Books posts hours only as an
  image headed "Spring/Summer", uploaded in April; in October those are
  not printed. Powder River's own site gives 211 Main St while the 2026
  Main Street directory gives 232; the listing follows the site, and the
  question is on the call list.
- **Bot checks are the new unreadable.** Seven sites answered curl and
  WebFetch alike with a captcha or a security checkpoint (SiteGround,
  Cloudflare, Vercel, Toast). Those listings keep their September date and
  a line in the report; a browser session or a phone call is the only way
  through, and the rotation should not pretend otherwise.

## Hours that are text on purpose

*3 October 2026.* The validator's warning about hours lines the site cannot
read as a schedule had stood at 43 for a week, and a warning that never
moves stops being read. Thirty-nine of the 43 were never going to be a
schedule: daylight hours for parks and trails, a lodging's check-in, by
appointment, a season ("May–Sep", "April to October"), a box office, a
church's worship and office, an airport's runway. The parser refuses those
on purpose; a schedule would put "Open now" on the Candlelight while its
box office keeps the afternoon and the show runs at night, or on a park
after dark in December.

- **Counted, not flagged.** `hoursTextByDesign` in `src/lib/hours.ts`
  recognises those lines, and the validator reports them as a count beside
  the warning, so the warning names only the lines that could be a
  schedule and are not. `--hours` lists both. Tests pin the cases the
  content has, and the ones that must stay flagged: a town hall's
  "Mon–Fri, office hours", a restaurant's "Closed Mondays and Tuesdays".
- **Three remain, and each has a reason.** Elizabeth Town Hall's line is
  vague and its check is in this week's rotation. Sachi Sushi's and Happy
  Eating's are on the call list: Sachi's page no longer gives days, and
  Happy Eating's ordering page carries two hours tables that disagree.
- **One reworded.** Grandpa's Cafe's "Daily 7 am–8 pm, except Tue
  7 am–2 pm" is now "Mon & Wed–Sun 7 am–8 pm, Tue 7 am–2 pm", the same
  facts in a form the parser reads, so the page shows whether it is open.

## The rotation's second batch: the public places, and what the blogs had added

*3 October 2026.* The other 93 listings verified in mid-September went the
same way as the first 99: the owner's own page, one worker a town. Most
were parks, trails, town halls, libraries and museums, where the owner is
a Town, a County or a District, and the rest were Main Street shops.
Thirty-eight were confirmed as they stood, 40 corrected, and 15 could not
be checked online and went on the call list, which now has 42 rows in
three groups: still open, call for hours, and sites that only need a
browser. Forty listings still carry a September date; nearly all of them
are rows on that list.

- **A third party's details do not survive the owner's page.** Pioneer
  Park in Berthoud had a spaceship play structure, a rock wall and a
  winter rink, all from a playground blog; the Town's page lists a pond,
  roller hockey, bocce and three pavilions, and the listing now says
  those. Bein Park's "two dog parks" were the Town's separate dog park on
  10th Street. Lake Park in Johnstown was at the Public Works office's
  address in Old Town, copied from the Town's parks index; it is on the
  reservoir off Highway 60, at the address the Town's own Lake Park page
  gives. Each park now cites its own page, not the index.
- **The owner's current notice beats the listing's season.** Erie Lake's
  listing advertised fishing; the Town asks anglers to wait until the lake
  refills after the dam repair, and the Highway 287 entrance is closed for
  good. Rabbit Mountain's hunting closures ended with the County's hunting
  program. The Town of Lyons opens its parks dawn to dusk, so Bohn,
  Sandstone and LaVern M. Johnson parks say so; Bohn's "8 to 8" was a 2022
  notice the Town has since hidden in its page's code.
- **A source must support the body, not just the hours.** Where a
  listing's source changed from a news story or a blog to the owner's
  page, sentences only the old source supported were cut: the month the
  Elizabeth bank building was listed on the National Register, Pioneer
  Park's play structure. The page footer says "Checked against" the
  source, and every sentence above it should be on that page.

## The accuracy system, phase 2: a gate, a staging folder, and a build that does not fail

*3 October 2026.* The accuracy brief's second phase, on the answers in
`docs/archive/ACCURACY-SYSTEM.md` section 7. Five choices worth recording.

- **The build excludes a bad entry rather than failing.** Every town loads
  into one collection, so one bad frontmatter field in Erie used to fail the
  Niwot build, and a failed build on Vercel leaves the previous deployment
  serving, with last week's events and whatever was stale then. That is the
  one outcome the freshness work exists to prevent, so events and places now
  load through a schema that turns a failure into a marker, the content
  helper drops the marker with a line saying which file and why, and
  `npm run build` runs the validator in a mode that reports the same thing
  as a warning. `npm run validate` on its own, and in CI, still fails on it,
  so the error is red where someone is looking and never a stale site.
  Articles, pages and issues are unchanged: they carry no dates that expire,
  and a broken one is rare and hand-written.
- **Publishable is decided in one function, applied in one place.** A
  source, a check date, and for an open listing a check inside its window
  (`src/lib/freshness.ts`). The one place is `src/lib/content.ts`, which is
  already the only door to the collections, so the rule cannot be forgotten
  by a new page. Events do not go stale; they end, and `src/lib/events.ts`
  already decides that.
- **Staging is a folder, not a field.** `content/<town>/staging/` is
  outside the collection globs by construction (`*` is one path segment), so
  the build cannot see it however a file is written, which beats a `status:
  staged` that one filter somewhere forgets to check. Approval is a move
  plus two stamped fields, which git records. A staged file carries a
  `review` line saying why it is waiting; the validator requires it there and
  rejects it in the published folders, so a half-finished review cannot
  publish by accident.
- **A closed listing does not go stale.** Its claim is that the place is
  shut, which ninety days do not make less true, and the page exists for the
  reader who goes looking. It still needs its source and date. What a closed
  page shows, and that it leaves the directory and the search index, is
  phase 3.
- **`LIVE_TOWNS` is derived.** Each town config now says `status: 'live'`
  (or its wave), and the list is computed from that, so there is one place
  that says what is live and `new-town` writes it. The variant lives beside
  it; all nine are `front-range`.

The eight listings that had no source went to staging, each with the
question the call list already asks. One article linked one of them and
repeated its hours; the link and the hours came out. Field names are the
repo's, mapped to the brief's in `docs/archive/ACCURACY-SYSTEM.md` section 8.

## The accuracy system, phase 3: what a stale or closed listing may still show

*3 October 2026.* The build gates and the reader-facing side of the brief,
on three conditions from the owner first: the daily rebuild is in place and
running (21 of 21 scheduled runs green), a red validator in CI cannot hold
a Vercel deploy and the validator in the build path now exits 0 whatever it
finds, and phases 2 and 3 go to production together.

- **Stripping, not hiding.** A listing past its hours window loses `hours`
  and `openingHours` in the gate, before any component sees it, rather than
  each component deciding whether to show them. Four places render hours
  (the row, the feature card, the page, the structured data); one of them
  forgetting is exactly how an "Open now" badge outlives the hours behind
  it. The page and the row then say the hours are not shown and why, since
  a blank reads as "never had any".
- **Permanently closed is said in those words.** "Closed" beside a café
  reads as closed for the day. The page stays for the reader who went
  looking, noindex and out of every list and the search index, with hours
  and phone gone; a temporarily closed place keeps its row and its phone,
  because it means to reopen and someone may ring to ask when.
- **Corrections ride the forms that exist.** Each town already has a
  Formspree form with the CSP, the honeypot and the privacy page written
  for it; `/correct/` posts to the same one with the item in the subject, so
  nothing new has to be set up or explained. The destination stays a
  dashboard setting on Formspree; the config names the address only for the
  `mailto:` fallback.
- **The threshold warns; the status gates.** Counting verified content
  cannot be allowed to fail a build, so it does not: a live town under its
  threshold publishes what it has and is flagged three ways. Whether a site
  is a guide or a holding page is `status` alone, so a project created early
  serves one noindex page and a robots.txt that says wait, and flipping to
  `live` is one word in one file.

## The accuracy system, phase 4: a source registry that proposes and never decides

*4 October 2026.* One JSON file per town naming the places checked each
week, seeded from what the content already cites.

- **Status is about fetching, not publishing.** A `proposed` source means
  ingest may not read it yet; it says nothing about the events and places
  that already cite the host, which publish on their own `source` and
  `verified`. The gate does not import the registry and a test fails if it
  ever does. Confirming is therefore never urgent for the sites, only for
  ingest, which is what lets the editor confirm a few at a time.
- **84, not 260.** The content cites 260 hosts, but most are a business's
  own site cited once by its own listing, which the thirty-day rotation
  covers. The registry is for the calendars and institutions: a host cited
  by any event, or by two or more places. Within that, the civic and
  institutional categories and the venues the calendar leans on are `core`
  and come first; the rest are listed as able to wait.
- **Seeded entries are facts, not guesses, except where they say so.** The
  name is the host, the sample page is one the content cited, the counts
  are counted. The category is a guess from the host name and the entry's
  note says so; the type is `html` until someone finds a feed. No feed URL
  is proposed that was not seen.
- **JSON, written by one module.** Hand-editable, no parser to maintain,
  and `writeRegistry` sorts and strips defaults so that confirming a source
  is a one-line diff.
- **The rebuild workflow names the missing hook.** The secret's lines take
  a slug, the live sites come from the configs, and a live town with no
  hook fails the run with its name, so a town cannot be flipped live and
  quietly never rebuilt.

## The accuracy system, phase 5: feeds in, staging out, nothing published

*4 October 2026.* Ingest for the confirmed feed sources.

- **ical.js for iCalendar, the rest in the repo.** The plan's rule is to ask
  before a dependency; the owner's answer was that recurrence, time zones and
  exceptions are exactly where a hand-written parser produces wrong dates,
  and accuracy outranks the rule. ical.js parses and expands; it ships no
  time zone table, so every occurrence's wall clock is converted by the
  repo's own Denver date code, which is what every other date here goes
  through. RSS (CivicPlus's structured calendar items) and The Events
  Calendar's REST JSON are small and plain and are read here.
- **robots.txt is honoured for feeds too, by default.** Two of the best
  feeds, the Lyons library's iCal and Pines & Plains' Google calendars, sit
  behind a robots.txt that disallows unlisted agents, though both are
  offered to readers as subscriptions. The rule that settled the Berthoud
  chamber and the Lyons Recorder applies until the editor says otherwise,
  per source, with `robots: subscribe`; ingest prints which rule it applied.
- **A guessed venue is never a change.** The first dry run flagged five Erie
  meetings as moved because the feed named the room and the address where
  the guide names the building. A venue counts as changed only when the feed
  names it through the editor's own alias or default venue.
- **Alone on its day, a moved time is the same event.** Two storytimes with
  one title on one day are told apart by time; one listing with that title
  on that day is that event, whatever time the feed now gives, which is how
  a moved meeting is caught instead of staged as a second one.
- **Cancellations are not applied automatically.** The brief's first rule is
  that nothing publishes without a person; a cancellation read from a feed
  goes to the top of the review with the feed as its source. The switch to
  apply them on the night they are read exists (`INGEST.autoApplyCancellations`)
  and is off.
- **LibCal's public iCal was not usable.** Five hundred district-wide events
  from a month back, under every parameter tried. The finding is in the
  source's note so nobody tries again without a new idea.

## The accuracy system, phase 6: the review, and where it stops

*4 October 2026.* The owner's call: phase 6 is the last. The review CLI's
summary stands in for the weekly report the brief planned as phase 7, the
redirects are a record rather than code (two are live elsewhere, one has no
domain yet), and the mountain pages wait for a mountain town. The schema
fields for all of it exist; nothing further is built without asking.

- **One prompt, one line at a time.** The review edits a file by replacing
  or removing single frontmatter lines and never rewrites the file, because
  these files are also written by hand and a rewrite would reorder and
  requote them. Approval is three lines (`review` out, `verified` and
  `verifiedBy` in) and a move; a change applied is the changed fields plus
  the same three; a dismissal is two lines out.
- **Approval validates what will be published, not what was staged.** The
  stamped text is parsed with the published schema before the move, and a
  missing `source` refuses, so the one door to the published folder is also
  the one place the rule cannot be stepped around.
- **The second question before deleting a listing that was once live.** The
  eight places moved to staging in phase 2 are real businesses; `r` on one
  asks again, because the alternative was a key pressed one too many times.

## The events page: two lists instead of a switch

*4 October 2026.* The owner's call. The "Show" row that switched between the
one-offs and everything is gone. The date list holds the one-time events and
the town meetings, each on its date, with the meetings under Civic; the
weekly regulars are a fact about the town's week rather than a date, and sit
once each in "Every week in [Town]" below the list, by weekday, with time
and venue, each linking to its page. "Free" moves from the When row to the
end of the What row, where it combines with both.

- **Weekly is narrower than regular.** `weeklyTest` takes a `repeat: weekly`
  rule, a `recurring` note, or a series stored as dated files with three or
  more dates on one Denver weekday. Two dates on a Thursday stay in the date
  list as a pair; a three-day residency stays as three days; a council
  series is civic and stays by date whatever its rhythm. On Erie the date
  list went from about two hundred rows to 88, 42 of them meetings.
- **Nothing is hidden by script any more.** The old view hid rows in the
  browser; a crawler and a reader without JavaScript saw all two hundred.
  The split is made at build, so every reader sees the same page.

## One photograph, one listing

*4 October 2026.* The owner saw Casey Jones Park and the Elizabeth Stampede
rodeo grounds side by side on Elizabeth's home page with the same picture.
The photo search of 3 October had given the park
`elizabeth-casey-jones-park.jpg`, which is the Commons file
`Casey_Jones_Park_Announcer.jpg` that the arena already carried as
`stampede-arena.jpg`, saved again under a new name at a different size. It
also undid the audit's call of 2 October, which had taken the rodeo
photograph off the park and left the arena its own.

- **The park has no photograph again**, as the audit left it, and the copy
  and its register row are gone. The arena keeps the picture: it shows the
  arena, not the ball fields, trail and dog park the park listing describes.
- **Historic Main Street gives up the hero.** It used `hero.jpg`, so the home
  page showed the same street under the masthead and again in the first row
  of cards. The hero keeps it; the listing falls back to its letter tile.
- **`npm run validate` now refuses a repeat.** Within a town, no two places,
  and no place and the hero, may show the same photograph. "The same" is the
  same file, or two files whose `IMAGE_LICENSES.csv` source names the same
  Commons file or Flickr photo (`sourcePhoto` in `src/lib/credits.ts`), which
  is how this one got past a path check. A perceptual hash of all 127 images
  found no other repeats on a listing; the only other pair is Lyons'
  `highway-7-canyon.jpg`, an unused copy of its hero. Articles and events may
  still borrow a place's photograph: they sit on their own pages.

## Longmont and Loveland

*4 October 2026.* The owner's brief: two new guides, Longmont first, each
scaffolded with `new-town`, not live (the holding page), `front-range`, its
own palette, and a launch threshold of 25 upcoming events and 30 listings
because both are large; a curated scope (the confirmed feeds' events, and
places on Main Street and downtown, food and drink, breweries, parks and
outdoors); no new phases or features.

- **Longmont's domain is insidelongmontco.com, slug `longmont`.** Registered
  at Cloudflare on 30 September 2026 and delegated to the same Cloudflare
  nameserver pair as every other guide, so it is the owner's. The "co" is the
  domain's, as with Windsor.
- **Status `wave1`, the scaffold's default.** The brief's wave for each town
  is not written down in the repo, and any non-live status builds the same
  holding page; the hub lists the town under "Coming next" and the map draws
  an outlined pin, as it was built to.
- **Olive for Longmont** (`#6B7A1E` / `#4A5514` on `#F6F6EF`): the one hue
  family between Timnath's gold and Niwot's green that no guide uses.
  `npm run check-colors` passes at eleven sites.
- **The facts follow the repo's sources.** Population, 2010 population,
  elevation and coordinates from the Wikipedia infobox (census and GNIS);
  incorporation 15 November 1885, per the State Archives list Wikipedia cites,
  with the City's 1871 as the founding; the county split from the City's own
  pages. The Census API now wants a key, so the split note gives no share
  figure, as Berthoud's and Johnstown's do not. No drive time to Denver: the
  City gives miles, not minutes, and the field waits for a source.
- **One district across two counties.** The test that holds every
  two-county town's school line to "Mostly" assumes the county line splits
  the schools. St. Vrain Valley takes in parts of both Boulder and Weld and
  lists Longmont among its communities, and nothing read puts any of the city
  in another district, so Longmont's line names the one district and the
  test carries a named exception rather than a hedge with nothing behind it.
- **Longmont leaves the map's reference cities**, as Fort Collins did, or the
  hub would draw two. Berthoud's three nearest configured towns become
  Johnstown, Longmont and Lyons; the live pages read live towns only, so no
  nearby block changes until Longmont launches.
- **The hero is McIntosh Lake at sunset**, Tyler Cipriani, 2017, CC BY-SA
  4.0, 6,030px original, resized to 1920. The Unsplash files in the Commons
  category are close-ups of leaves and bark. Commons' robots.txt disallows
  `/w/api.php`, so the category and file pages were read under `/wiki/`.
- **The samples are gone.** The scaffold's sample event, place, article and
  moving-here copy were deleted, not edited: nothing in the guide is written
  until there is a source for it.
- **Loveland's domain is insidelovelandco.com, slug `loveland`.** The brief
  named insideloveland.com; that domain has been held at Directnic since 2021,
  is on client hold, does not resolve and is not on the owner's Cloudflare.
  insidelovelandco.com was registered at Cloudflare on 1 October 2026 on the
  owner's nameserver pair, and the owner confirmed it on 4 October.
- **Plum for Loveland** (`#8A3D86` / `#5F2A5C` on `#F8F5F7`): between Erie's
  blue-violet and Johnstown's burgundy, further from each than either is from
  its neighbour. Rose, the obvious Sweetheart City choice, sat on top of
  Johnstown. `npm run check-colors` passes at twelve sites.
- **Loveland joins the ambiguous names.** There is a Loveland in Ohio, whose
  museum holds lovelandmuseum.org (it nearly went into the registry), and a
  Loveland Pass a hundred miles away; the test that holds Erie, Johnstown,
  Elizabeth and Windsor to "Colorado" in their search tagline now holds it.
- **Loveland moves three neighbours.** Among configured towns it is
  Berthoud's nearest (5.5 miles) and Timnath's and Fort Collins' third; the
  geo tests follow. The map's crowding rule puts its label on the left, clear
  of Berthoud and Fort Collins, with no change to the component.
- **The hero is Lake Loveland at sunset**, Paul Dineen, imported to Commons
  from 500px, CC BY 3.0, 2,048px original. The 4th Street photograph was
  mostly parked cars and a van. Wikimedia's media host rate-limited the
  session for a stretch after one non-standard thumbnail size, which its
  robot policy forbids; previews since are at its standard sizes.
- **Loveland has no readable feed.** The City's site (lovgov.org) and the
  library's answer every automated request, robots.txt included, with an
  Akamai 403; Larimer County's site answered with a Cloudflare challenge on
  the day. The Chamber's and the Rialto's WordPress iCal feeds answer empty
  (their events live in ChamberMaster and a ticketing system), and Downtown
  Loveland's Tockify calendar serves its feed from a path Tockify's robots.txt
  disallows to everyone. So every Loveland source is `html` or `manual`; the
  registry says which and why, entry by entry.

### Content, 4 October 2026

The owner confirmed every core source in both registries, that Loveland's
events come from its confirmed sources read by hand (it has no readable
feed), and the DNS and email changes; the DNS could not be made (below).

- **Longmont's events are the feeds', and wait for the review.** Ingest staged
  65; nothing it writes publishes, as designed. Before staging, the event
  standard (docs/archive/AUDIT-2026-10-02.md) was applied through each source's
  `excludeTitles`: storytimes, clubs, drop-ins, classes, pre-sessions, the
  museum's Discovery Days, the recreation centre's preschool playtime and
  fitness, club horse shows and gymkhanas, the Agricultural Heritage Center's
  ordinary open days. Each exclusion is listed in the source's notes so it can
  be undone. Every staged description is rewritten in the guide's words, and
  each review note says what is left to check (the fairgrounds' renters give
  the County no description; three prices are not in the feed).
- **An ingest matching flaw, worked around, not fixed.** "Council at Longmont
  Farmers Market" and the market itself share a Saturday and most of a title,
  so ingest treated the second as a refresh of the first and overwrote it. The
  file is renamed for the market and the council title excluded. Same-day
  matching on 60% of the words will do this again wherever a civic item is
  named after the event it attends; the fix belongs to ingest and is the
  owner's call, since no new features were asked for.
- **Loveland's sourced events publish; the doubtful ones wait.** Hand-checked
  events with a source and a check date go into the published folder, as every
  hand-written file in the repo does; the town is a holding page until the
  owner flips it. The Rialto's own shows are read off each show's ticket page.
  Its rental shows are dated only by the July brochure, which is already wrong
  once (it has Midnight Hour Band on 14 November; the ticketing system now has
  Petty Nicks that night and Midnight Hour in May 2027), so they are staged.
  Downtown Loveland's dated events live in a Tockify calendar whose feed path
  Tockify's robots.txt disallows, and its signature-events page carries last
  year's Small Business Saturday, so none is listed.
- **Places were researched in parallel and written by one script.** Six
  research passes, three a town, each held to a written rulebook (the
  business's own site only, the repo's robots-aware fetch, verbatim evidence
  for address, phone and hours), returned records rather than files; a sample
  of every batch was re-read before anything was written, and one listing
  whose hours exist only in hidden Squarespace settings (Loveland Aleworks)
  was moved to staging. Two phones read from a business's own embedded site
  data (Grimm Brothers, Dark Heart) stand.
- **Loveland's City parks wait.** lovgov.org answers every automated request
  with 403, so Benson Sculpture Garden, North Lake Park, the Recreation Trail,
  Viestenz-Smith and the Loveland Museum are staged for a person with a
  browser. Boyd Lake State Park (Colorado Parks and Wildlife) and the High
  Plains Environmental Center are the published outdoors.
- **"InsideLongmont" is the City's.** The City of Longmont's site footer links
  an "InsideLongmont" site (insidelongmont.longmontcolorado.gov, closed to
  robots, most likely its staff intranet). Inside Longmont at
  insidelongmontco.com is a different thing with nearly the same name; the
  network's rule is never to look like the official source, so this is for the
  owner to weigh before launch.
- **DNS was added by the owner; email followed.** The environment's Cloudflare
  token, and the one offered in the session, were rejected by Cloudflare as
  invalid on every endpoint (the session's copy was deleted), so the owner
  added the apex A records (76.76.21.21) and the `www` CNAMEs to Vercel's
  per-project targets in the dashboard on 4 October. Vercel reports all four
  hostnames configured, both domains serve the holding page over HTTPS with
  the network's headers, and `www` redirects to the apex. A working token
  the owner supplied later the same day added the `_dmarc` record
  (`v=DMARC1; p=none`, as on insideniwot.com) to both zones; it carried no
  Email Routing permission, and a third token that did switched routing on for
  both (Cloudflare's three MX records, SPF and the `cf2024-1` DKIM key) and
  added the one rule, `hello@<domain>` forwarded to the same verified inbox as
  insideniwot.com's, with the catch-all left off as it is there. Each token
  was held in a permission-restricted scratch file and deleted after use.
  Windsor's and Fort Collins' domains had had no MX records since they were
  added; the third token, supplied again that evening, switched routing on for
  both and added the same `hello@` rule, catch-all off. Both already carried
  the `_dmarc` record, so routing's own MX, SPF and DKIM records were the only
  change to their DNS.

### Live, 5 October 2026

- **Both guides are live, on the owner's word.** The first review was worked
  through item by item with the owner in the session and applied with the
  review script, every approval stamped with the owner's name. Longmont
  published 41 events and 34 listings against 25 and 30; Loveland 34 and 36.
  The owner rejected Longmont's eight routine council meetings and three Art
  & Sip classes under the event standard, and both are now in their feeds'
  `excludeTitles`. Three businesses reported closed or moved were rejected.
  The 58 items left in staging need a check in a browser: sites that block
  automated reads, and the Rialto's rental shows, dated only by a brochure.
- **Fairground shows keep one file per day.** Ingest matches a feed item by
  its UID, or by title on the same day, so merging a multi-day show into its
  first day's file would restage the other days at every run. Each day is on
  the County's calendar, which is what the event standard asks of a series.
- **A start time ingest would undo is kept as the feed's.** Niwot Auction
  gives 11 am for its 1 November sale; the County books the barn from 9 to
  6. Ingest compares start times on every run, so 11 am in `start` would be
  flagged weekly, and approving that flag would publish the wrong time. The
  file keeps the County's times and says "Auction at 11 am" in `timeNote`,
  which is what the card shows.
- **Berthoud's nearest guide is now Loveland**, five and a half miles off,
  not Johnstown; the geo test says so.

### Completed, 5 October 2026

- **No placeholder left.** Both guides went live with "Guide coming soon."
  on Moving here and "Guides are on their way." on Guides, which the owner
  rightly called unfinished. Each now has a Moving here page and two guides
  (history, and with kids), modelled on Windsor's and Fort Collins', every
  fact from a page read that day and linked to it. A built-site search finds
  no placeholder text; the home pages now show "From the guide".
- **Where the City cannot be read, the page says less.** The City of
  Loveland's and its library's sites refuse automated reads, so Loveland's
  pages state City facts only where another readable source supports them
  (Platte River for power, Pulse for fiber, the fire authority for fire),
  attribute the council's officers to Wikipedia, and point to the City's
  site for trash, police and meeting times rather than guessing.
- **Dated passages to refresh.** Longmont's Moving here describes the City's
  questions on the 3 November 2026 ballot, the October council calendar, the
  museum's 17 October reopening and the farmers market season; Loveland's
  gives the fire authority's October meetings and an interim chief. Each is
  dated in the text; the weekly session should update them as they pass.
- **No photographs centred on sculpture.** The US has no freedom-of-panorama
  exception for sculpture, so a photograph of a modern work by a living
  artist carries that artist's copyright as well as the photographer's
  licence. Two Commons views of the Benson Sculpture Garden and a 4th Street
  scene centred on a bronze were left out for that reason; the arts council
  is the one to ask for photographs of the garden. A 2017 view of the First
  National Bank building was left out too: taken mid-renovation, before
  Sandos moved in.
- **Commons is thin for these two.** Five places in all have photographs
  (Sandstone Ranch, McIntosh Lake, the Rialto, Boyd Lake, Henry's Pub).
  Commons has nothing usable for the other parks, the businesses' current
  frontages, or the Longmont Museum since its expansion; the photo walk and
  permission requests in docs/PHOTOS.md are the way to more.
- **The ingest matching flaw is fixed, and a venue one with it.** Ingest now
  reads every confirmed feed before matching any item, and a file whose own
  feed id is still in the run cannot be taken by another item's similar
  title: the council's visit to the market and the market itself stay two
  files. Ids that have left the feed (the County's change when a time moves)
  still match by title, which is how a moved event is noticed. Separately, a
  department feed's `defaultVenue` no longer overrides a location that names
  another place: the library's film at the museum read, with confidence, as
  a move to the library. Both have tests; a dry run of every town's feeds
  shows the same results as before apart from those two cases.
  "Council at Longmont Farmers Market" is no longer excluded: it stages for
  the editor to judge on the event standard, as anything else does.
- **Places whose sites block tools are dropped, not chased.** The owner
  checked the first round by hand in a browser and found it too slow to
  repeat. Fifteen places were then dropped on 5 October: twelve whose sites
  (or the City of Loveland's and Larimer County's) answer automated readers
  with a bot challenge, one whose robots.txt opts out of Claude, and two
  with no website. Each would also need checking by hand at every
  freshness check. Both guides were already over target without them. Three
  were published on the owner's word with a gap the README rule would
  otherwise hold back: Left Hand's tasting room and Big Thompson Brewery
  print no phone, and Loveland Aleworks shows no hours (the hours its site
  holds sit only in hidden settings, so the listing says to call ahead
  instead). Big Thompson's address is the one its own footer map shows.

## Carbon Valley

*5 October 2026.* The owner's brief: one guide for Frederick, Firestone and
Dacono at carbonvalleyguide.com, scaffolded with `new-town`, not live, `front-range`,
its own palette, sub-towns on every item with a filter and a section page each,
a launch threshold of 15 upcoming events and 20 listings, the Vercel project,
the insidefirestone.com redirect per docs/REDIRECTS.md, and the source registry
seeded and stopped at "confirm these"; no new phases or features.

- **Slug `carbon-valley`, domain carbonvalleyguide.com, title "Carbon Valley
  Guide".** The one guide whose name is not "Inside <Town>", so the masthead
  carries "An Inside the Towns guide" under the wordmark on every page, linking
  the hub, and the holding page says whose guide it is in its first line. The
  towns test that holds every live domain to `inside*.com` carries this one
  domain as its named exception.
- **The three are in Weld County only**, so no county split; the schools line
  is hedged "Mostly" because Dacono is in two districts (St. Vrain Valley and
  Weld RE-8, per the City's own Education page). The config's one number for
  each of population, 2010 population, elevation and incorporation is the
  three summed or Frederick's, each saying which in its comment; Frederick's
  Town Hall is the coordinate. The GNIS figures follow the Wikipedia infobox as
  every other town's do; the Town of Frederick's own page gives 4,972 feet
  where GNIS says 4,938, and the City of Dacono's history page says 23 January
  1908 where the State Archives say 23 September, so the config says "1908".
- **Coal-seam slate** (`#4A6A8C` / `#2F4660` on `#F4F5F3`): a grey-blue no
  guide uses, between Berthoud's lake blue and Fort Collins' navy and greyer
  than both. `npm run check-colors` passes at thirteen sites.
- **The hero is St. Vrain State Park's Bald Eagle Pond**, Jeffrey Beall,
  2017, CC BY 4.0, the one scenic photograph Commons holds for the three
  towns; the park is inside Firestone's limits. Taken at Commons' own 1920px
  rendition, because its media host answers a direct request for the original
  with an error page. The other Commons files are a Frederick street corner,
  the two town halls and the library.
- **The samples are gone**, as for Longmont: nothing is written until it has
  a source.
- **`subTown` is required, not optional, on a multi-town guide.** The schema
  field already existed; the validator now refuses an event or place on a
  guide with `subTowns` that lacks one, in the published folders and in
  staging, and ingest stamps a source's `subTown` on what it stages. The
  events page's filters gain a "Where" row (`?where=firestone` in the URL)
  and the places filter bar the same, with each row and card carrying
  `data-sub-town`; the list pages carry a "By town" line; and `/frederick/`,
  `/firestone/` and `/dacono/` are one injected route (only on a site with
  `subTowns`) that filters the same collections: the next two months of
  dated events, the weekly regulars and the places of that town. Checked by
  building the guide as live with three fixture files, then removing them.
- **Carbon Valley is now Longmont's and Erie's nearest configured guide**
  (5.1 and 4.9 miles) and Niwot's third; the geo test follows. The live
  pages read live towns only, so no nearby block changes until it launches.
- **The Vercel project** is `carbonvalleyguide`, made through the REST API
  (the MCP connector's token may not create projects): Astro, Node 22,
  `TOWN=carbon-valley` on every target, the Ignored Build Step
  `bash scripts/vercel-ignore.sh carbon-valley`, preview deployments off,
  carbonvalleyguide.com and `www` attached (both reported verified, `www`
  a 308 to the apex), and a deploy hook on `main` whose line goes into the
  `VERCEL_DEPLOY_HOOKS` secret. DNS at the registrar was not touched. Its
  first build on `main` fails until this branch merges, because the config
  does not exist there yet; a failed build deploys nothing.
- **The Firestone redirect is written, not switched on.** Three rules in
  `vercel.json` scoped to the `insidefirestone.com` host: `/` and any
  unknown path to `/firestone/`, `/events/` to `/events/?where=firestone`.
  They apply the day insidefirestone.com is attached to the
  `carbonvalleyguide` project, which with its DNS is the owner's call and was
  not done. The section page is the one Firestone page that exists, so it is
  the "home page" the rule sends an unmatched path to.
- **Sources: seventeen proposed, thirteen core, found by reading each site
  once.** All three town sites are CivicPlus and publish iCal (Frederick's
  events and meetings calendars; Firestone's main and special-events
  calendars; Dacono's main calendar and a two-item police one), each read
  once and described in its notes with what it held on 5 October. The
  calendars are mostly meetings; the towns' signature events (Miners Day,
  Frederick in Flight, 4th at Firestone, Halloween Safe Night, Boot Scoot'n
  Bash, the Fall Fiesta, the Carbon Valley Holiday Festival that all three
  hold on 5 December at three venues) live on pages under each site's events
  hub and reach the calendars late or not at all, so the hubs are proposed
  as `html` sources beside the feeds. The shared institutions have no
  readable feed: the library's LibCal iCal is the same stale 500-item export
  Windsor's and Johnstown's registries record, and its RSS does carry the
  fortnight but with the dates inside each item's description, which the
  repo's RSS reader does not read (a LibCal reader would be a new feature);
  the chamber's site answers every request, robots.txt included, with a
  captcha; the parks district's Streamline site has no events module; Weld
  County's OpenCities listing filters by town only through a form post. The
  Times-Call's main feed answers 403 and its robots.txt forbids text and data
  mining, so it is link-only. Nothing is confirmed: that list is the owner's.
- **Not done, by the brief's order:** content. Events wait for the confirmed
  feeds; places (food and drink, parks and outdoors, each town's main street)
  are the next step after confirmation.

### Content, 5 October 2026

The owner's answer to the three questions above was that the choices were
the editor's, to be made as well as possible. What was decided, and done:

- **Eleven sources confirmed, six left proposed.** Confirmed: each town's
  events calendar (Frederick's events calendar; Firestone's main calendar,
  which carries the special events and the Town's smaller days; Dacono's
  main calendar), each town's events hub and parks pages, the library, the
  parks district, the chamber (manual, so it sits on the weekly check and
  reports blocked until the site admits readers) and the county. Left
  proposed, each saying why: Frederick's meetings calendar (meetings only),
  Firestone's special-events calendar (its three items are in the main one),
  Dacono's police calendar, the state park and the two papers. The event
  standard is applied through `excludeTitles` on the three town feeds
  (routine meetings, the court, office closures, election day) and the
  library's (storytimes, clubs, drop-ins, the English class), each listed
  in the source's notes so it can be undone.
- **A LibCal reader, after all.** The brief said no new features and the
  question was asked; the answer handed the call back. The library is the
  one institution the three towns share and the steadiest source of dated
  events they have, and its RSS carries LibCal's own elements per item
  (`libcal:date`, `start`, `end`, `location`, `campus`, `eventid`), so
  `scripts/lib/feeds/rss.ts` reads them in about fifty lines beside the
  CivicPlus branch, with a test. Erie's library is in the same district, so
  Erie's registry can use it too. "Cancelled:" on a title is read as a
  cancellation, as it should have been for CivicPlus.
- **Three CivicPlus iCal quirks fixed in the reader**, each found on the
  first Carbon Valley run and each with a test: the URL property is a
  relative path to the feed, while the event's page is in the description
  (promoted, and taken out of the text); a one-day entry's DTEND is the
  start day, which the exclusive-end rule turned into the day before (now no
  end); and LOCATION is "Name - 170 Grant Ave.   Firestone CO 80520",
  sometimes with pasted HTML, now split into the comma form the venue guess
  reads. A dry run of every other town's feeds showed the same results as
  before.
- **A site's ids are its own.** CivicPlus numbers events from 1 on every
  site, so Firestone's 2690 and Dacono's 2690 are two events on one guide,
  and the matcher took them for one. Ids now match within the site the file
  was read from (its `source` host); a first version scoped them to the
  registry entry and broke the merge of an item Longmont's council and
  library feeds share, which the Longmont dry run caught.
- **Ingest staged nineteen, each rewritten from the organizer's page.** The
  feed's dates and hours stay in `start` and `end` so the weekly run does
  not flag the editor's own edits; where the Town's page disagrees with its
  calendar (Paint the Plows is noon to 2 on the page and 2 to 5 in the feed;
  Halloween Safe Night is at the Sports Complex on the page and Miners Park
  in the feed) the review note says so and `timeNote` or the venue carries
  the page's version. The Carbon Valley Holiday Festival is three listings
  on one day, one per town, as the three towns stage it. Nothing ingest
  wrote was published; the review is the owner's.
- **Places: 26 published, 6 staged, from three research passes** held to the
  rulebook used for Longmont and Loveland (the business's or the Town's own
  page, verbatim evidence for address, phone and hours; a sample of each
  batch re-read). Frederick: Georgia Boys, Gabe's, Bella Rosa, the rec
  centre, the Recreation Area, the museum, Bulrush, Centennial and Crist
  parks. Firestone: St. Vrain State Park, Saddleback, the library, Marco's,
  the Firestone Trail, Miners, Hart and Settlers parks, the sports complex,
  the bike park, the disc golf course. Dacono: the Speedway, IMI, Blitz,
  Wing Shack, Clem DuFour Park, Centennial Field. Town parks whose town
  publishes no hours are listed without hours, as twenty-nine parks across
  the network already are, with the parks department's phone and a line
  saying the Town posts none. Staged, each with its question: a cafe whose
  site states no phone, a drive-through with no hours on its page, a brewery
  and a grill whose sites block readers, a trail with no address, a BMX
  track with no phone, all to be checked by a person.
- **What was not listed, and why.** Fifth Street's other restaurants, a
  bakery and the salons, Dacono's old-town Mexican restaurants and its bar,
  and Firestone's sports grille have no sites of their own; the rule is a
  listing stands on the business's own page, and the Loveland decision was
  to drop rather than chase such places. The Home Depot has a page and was
  left out as not the kind of place the guides list.
- **insidefirestone.com was not attached.** The owner handed the choice over,
  the attach was attempted, and the session's permission rules refused a
  domain change; the rules in `vercel.json` wait for the owner to add the
  domain to the `carbonvalleyguide` project in the dashboard.
- **Counts at the end of the day**, against 15 upcoming events and 20
  listings: 3 events published (an art show running to 22 October, a
  painting party, the holiday market) and 22 in staging for the review; 26
  listings published. Frederick 2 events and 9 places published, 5 and 2
  staged; Firestone 1 and 11, 15 and 2; Dacono 0 and 6, 2 and 2. The
  guide clears the listings threshold now and the events threshold once the
  review approves a dozen of the staged ones.

### Live, 5 October 2026

The owner's direction was "you do all of these": run the review, set the
guide live, attach insidefirestone.com, and set up mail for
hello@carbonvalleyguide.com. What was done:

- **The review.** Every staged item's source page was read again on the
  day. Thirteen events passed in the first round and five library events in
  a second, once the feed was narrowed. Four events were rejected under the
  event standard, and so were two places whose sites refuse readers, as
  Loveland's were. Eight items stay staged, each with the fact it still
  needs: Paint the Plows (the Town's page and calendar give different hours),
  two events with no venue yet, two the district has not detailed, and three
  places. Approvals carry `verifiedBy: "Claude Code, delegated by James
  Lerner"`, so the record shows who decided and on whose authority.
- **The library feed narrowed to its branch.** High Plains' RSS takes a
  building filter (`cam=4554`). With it, the registry entry carries only
  Carbon Valley's events, rather than the district's with a location filter
  on top.
- **Two ingest fixes, each with a test:**
  - Feed text now treats a non-breaking space as a space. LibCal's "Ageless
    Grace" had slipped past its exclusion on the byte.
  - The event writer now keeps `subTown`, which its key list had dropped. On
    a multi-town guide every staged library event came out without its town,
    and the validator caught all five at approval.
- **Live.** `status: 'live'` at 21 of 15 upcoming events and 27 of 20
  listings. By town, events are Firestone 16, Frederick 4 and Dacono 1;
  places are Firestone 11, Frederick 9 and Dacono 7. Firestone leads on
  events because the library is there. Frederick's and Dacono's calendars
  carry mostly meetings, which the event standard keeps out. Live means the
  guide's own pages are written:
  - Moving here, from a research pass on the three towns' own pages.
  - A history.
  - A with-kids guide.
- **Corrections found in writing them:**
  - Dacono's fire service is Mountain View Fire Rescue, not the
    Frederick-Firestone district.
  - I-25 runs along the west side of the three old centers, not the east;
    the commute note had it backwards. OpenStreetMap puts the three town
    halls about four miles east of the GNIS point the config uses.
  - St. Vrain State Park is on Firestone's northwest edge, just west of
    I-25, not its east edge.
  - British spellings in five Carbon Valley files are now American, per the
    2 October audit.
- **insidefirestone.com attached.** With the owner's go-ahead the apex and
  www were added to the `carbonvalleyguide` project; www redirects to the
  apex, where the `vercel.json` host rules send it to `/firestone/`. The
  domain's nameservers are Cloudflare's, but it has no A or CNAME record
  yet, so nothing resolves.
- **Cloudflare not done.** The Email Routing rule for hello@ and the two
  DNS records for insidefirestone.com need Cloudflare, and the
  environment's `CLOUDFLARE_API_TOKEN` is rejected as invalid. Both wait
  for the owner, in the dashboard or with a working token.

### The name, 5 October 2026

The owner's direction, once the guide was live: the domain is different, but
the guide is still titled "Inside Carbon Valley". That reverses the first
choice above:

- `siteTitle` is "Inside Carbon Valley". The wordmark, page titles, footer,
  feeds and structured data all read it from the config.
- The domain stays carbonvalleyguide.com, and stays the towns test's one
  named exception to `inside*.com`.
- The masthead's "An Inside the Towns guide" line existed only because this
  guide's name did not begin with "Inside". The wordmark now says it, as on
  every other guide, so the header is back to what it was before Carbon
  Valley.
- The towns test now holds every live guide's title to `Inside <name>`,
  whatever its domain.

### Mail and the Firestone domain, 5 October 2026

The owner did the Cloudflare side in the dashboard, since the session's
token was invalid and a token pasted into chat is not one the session may
use:

- **Email Routing on carbonvalleyguide.com.** It is on, with Cloudflare's
  three MX records, its SPF record and its DKIM key all public. The one rule
  forwards `hello@` to the inbox every other guide forwards to. The
  network's `_dmarc` record (`v=DMARC1; p=none`) was not there when this was
  written; it is one TXT record for the owner to add.
- **insidefirestone.com DNS.** The apex `A` record is `216.150.1.1` and
  `www` is a CNAME to Vercel, both DNS only. The certificate was issued
  within minutes.
- **The catch-all redirect was fixed on its first day.** `/`, `/events/`
  and `www` went where they should, but `/:path*` does not match a URL
  ending in `/`, and with `trailingSlash` on every page URL does. So
  insidefirestone.com/about/ served Carbon Valley's About page on the
  Firestone domain, and other paths 404ed. The source is now `/(.*)`, which
  exports to `_redirects` as `/*`. A host-files test now fails any redirect
  whose source ends in a bare `:param*`.

## The hub home page on a phone

Owner's brief, 5 October 2026: help a visitor reach their town faster,
especially on a phone, where the first town card sat about 2,570px down,
behind six events and the map. Home page only.

- **A town picker ends the hero.** Every live guide by its short name, A to
  Z, drawn from the same list as the cards. Three across below 640px, four
  from 640px, six (two rows, the headline's width) from 1024px. Every chip
  is at least 44px tall.
- **The hero is set a little tighter below 640px** (top padding, headline
  2.75rem rather than 3.25rem, intro at body size). This was the one change
  the brief did not list. Without it the picker's last row ended at 921px,
  below a 375×812 screen. Now it ends at 749px. From 640px up the hero
  measures exactly as before.
- **"The towns" is grouped by `region`,** a new required field on every
  town config (`TOWN_REGIONS` in `types.ts`), A to Z within each group. It
  is a reader's grouping, not a county one: Erie and Carbon Valley are
  mostly Weld but sit under Boulder County & St. Vrain. The county line on
  each card is unchanged. `new-town` writes a placeholder region, and the
  towns test holds every guide to the owner's grouping.
- **Below 640px** the cards show only the county and the town's name, two
  across, with no map. The "This weekend" block shows three events and then
  "Everything on", which moves from the header to the end of the list. The
  other three events are hidden with CSS, not dropped from the HTML, so the
  Freshness script can still remove a past event and let the next one move
  up.
- Page height at 375px went from 8,884px to 5,186px.

## Sideways scroll on phones and tablets

Found while checking the hub home page, 5 October 2026. Every case on a
phone came from one of the first two places; the last two are tablets.

- **The masthead.** The wordmark sits on one line beside the search and menu
  buttons, at 1.75rem whatever the title. "Inside Carbon Valley" was wider
  than a 375px screen leaves, so the page scrolled 36px sideways and the
  menu button sat entirely off-screen. Fort Collins was 3px over at 375px,
  and ten of the thirteen sites were over at 320–360px. Below 40rem the
  wordmark is now sized to the room it has: 1.75rem where it fits, smaller
  where it does not. The width is estimated from the title's length (half
  an em a character, just over the widest measured), so a new town needs
  nothing. At 375px Carbon Valley's wordmark is 22.6px and Fort Collins'
  23.8px; the other eleven are 28px or more. From 640px up the masthead is
  unchanged.
- **Tables in articles.** `.prose td:last-child` was `nowrap`, for a date
  or a price. Three of the four tables in the content put sentences there
  (the Lyons river flows, Johnstown's electricity providers, the Lyons
  trustees), and one page scrolled up to 778px sideways. Cells now wrap.
  Who Governs Lyons has three columns of long words and is still wider
  than a phone, so below 40rem a table scrolls in its own box. That is
  `display: block` on the table, the same change of display the comparison
  on /moving/ makes. The cost is that Niwot's election dates wrap onto two
  lines on a phone ("October 2, / 2026").
- Astro 7's default Markdown processor (Sätteri) ignores
  `markdown.rehypePlugins`, so wrapping each table in a scrolling `div` at
  build time would need Sätteri's own plugin API and a direct dependency.
  The CSS above does the same job.
- **The nav row waits for 1280px.** At 1024px (iPad landscape) the row,
  with a long title beside it, was wider than the screen on ten sites and
  pushed the search button off the edge; Inside Carbon Valley's needs about
  1,150px. The owner chose the menu button up to 1280px over a tighter row,
  which would only just have fitted Carbon Valley and broken on the next
  long name. Everything that knew the old breakpoint moved with it: the
  `xl:` classes, the panel's media query and the script's `matchMedia`.
- **The /moving/ comparison becomes a table at 960px, not 832px.** A media
  query's rem is the browser's 16px, not the page's 17, so `52rem` was
  832px, and the table cannot be narrower than about 875px, since its
  headers and town names do not wrap. It pushed the page up to 75px
  sideways between 832 and 906px. Below 60rem it is the cards it already
  is on a phone; above, if it ever outgrows the page, it scrolls in its own
  box.

## Tying the network together

Owner's brief, 5 October 2026: make the guides work as one network, give it
an owner and a sellable sponsor slot, and close the open display fixes.

- **Nearby this weekend is one block, from a list.** Each town config now has
  `neighbors`, the owner's list, and `NearbyWeekend.astro` reads the
  neighbours' Friday-to-Sunday listings from it. It sits on each guide's home
  page, its /this-weekend/ page and, replacing the old distance-based block,
  its /events/ page, so a guide never shows two "nearby" blocks with
  different towns. `src/lib/geo.ts` went with the old block. The picks
  (`nearbyPicks`) are one-offs only, at most two per neighbour, every
  neighbour's best before anyone's second, plan-your-day categories first.
  "Regular" here means `weeklyTest`, not `regularTest`: Loveland's three
  nights of Die Fledermaus, stored a file per date, count once instead of
  being dropped as a series. No neighbours or nothing on, and the block is
  not there at all.
- **One network sponsor value** (`hub.sponsors.network`) drives "Nearby this
  weekend, presented by" on that block, "This weekend, presented by" on
  every /this-weekend/ page, the hub's included, and the email's sponsor
  line where no email sponsor is set. Unset, all three render nothing.
  /advertise/ makes the founding offer on it, with no price: the owner has
  not set one.
- **"Still running" is runs.** `weekendSections` used to file anything that
  started before Friday there, so Niwot's one-off meetings of October 6 to 8
  sat under it. A multi-day event lasting into the weekend is `continuing`;
  a one-day listing before the weekend is `before`, which no weekend page
  shows.
- **Runs under way show their range everywhere.** Day-grouped lists put them
  in a "Now on" group instead of under the day they opened, the event page's
  When line says "Now through October 31", and the email draft does too.
- **The publisher is unnamed on purpose.** The owner asked not to be named;
  the About page says the network is independently owned and gives the
  corrections address, and invents nothing. The footer strip carries "Site
  by Lerner Works" from `hub.credit`.
- **Sister guides** are listed in every guide's footer strip, reversing the
  earlier one-link strip at the owner's direction. "This Weekend" is in every
  guide's navigation; at 1280px the row now needs a tighter gap (restored
  from 1536px) to fit Inside Carbon Valley.
- **/newsletter/sample/** renders this week's network issue from the
  listings, labeled as a sample and out of the index. New and closed places
  come from the git history, shared with the email script
  (`src/lib/newsletter.ts`). Vercel and CI build from a shallow clone, so
  `scripts/run.ts` deepens the hub's checkout to the last three weeks first
  (about two seconds). A shallow history is trusted only when its oldest
  commit predates the week, because that commit looks as if it added every
  file; otherwise, or if the fetch fails, the two sections are left out
  rather than shown wrong. Chosen over `added` and `closed` dates on every
  place, which would have meant 436 files and the tooling to stamp them.
- **Cache-Control on HTML** is now explicit in vercel.json. Vercel already
  sent `public, max-age=0, must-revalidate` on HTML, so it changes nothing
  there. The stale "9 guides" was the hub not rebuilding: the Ignored Build
  Step skipped a site when only another town's config changed, and a town
  goes live by changing its config. Any town config now builds every site,
  since every site shows something from every town's config.
- **Content checks.** Berthoud's Neon Nights dodgeball (October 23) and
  cosmic pickleball (October 24) are on the Town's Upcoming Events page and
  stay. The Lazy Dog's own site is behind a bot challenge, as it was for the
  October audit, so its title is unchanged rather than guessed.

## The October audit

An outside audit of the live network (5 October 2026) found the faults below
still open after the network work above. Fixed here; what it proposed beyond
fixing (a hero rewrite, a new navigation, a two-town picker, featured
articles on the hub, wider search, naming the publisher, card descriptions on
phones) was left alone, because it is new work or contradicts the owner's
earlier briefs.

- **Search showed every result twice.** Typing searches after a pause and
  Enter searches at once, so a search typed and then submitted ran twice, and
  both runs appended to the cleared list. Each search now takes a number and
  one that a later search has overtaken drops its results; Enter also cancels
  the pending typed search.
- **Labels that said more than the list.** The hub's "Coming next week" held
  two weeks; it is now "Coming up" with the dates it holds, renamed in the
  browser for the days actually left. "This week in Niwot" over the town home
  page's events could show November; it says "Coming up in Niwot". Filtered
  to one town, the hub's weekend page hides sections with nothing of that
  town's in them, and says in words when the town has nothing for the weekend.
- **Counts and geography.** "See all seven side by side" is "Compare every
  town side by side"; /advertise/ no longer says "small towns of the northern
  Front Range". The /moving/ caption is built from the columns, so it cannot
  promise elevation and incorporation again, and the population column says
  2020.
- **The newsletter** is described the same way everywhere: the weekend's
  events, places new to the guides or closed, and a new article when there
  is one — which is what the drafting script produces. "New" means new to
  the guide, not newly opened, and the copy says so. "Nothing else" went.
- **Facts.** Lyons has a bus: the free Lyons Flyer, four weekday trips each
  way to Boulder (Boulder County's and the Town's schedule pages); the hub and
  the Lyons config said "no transit". Berthoud is no longer "the only town
  here" without a car. Horsetooth Reservoir is "just west" of Fort Collins,
  as Larimer County describes it, not "inside its limits". The Windsor and
  Timnath price conclusions ("only the house is cheaper", "without paying for
  Fort Collins") had nothing behind them and went. So, after the owner
  agreed, did the rest of the same kind: Erie's "Boulder prices" (on /moving/
  and the Erie–Johnstown page), Berthoud's "short of Fort Collins" (its
  one-line description and /moving/), Lyons's "which means it is expensive",
  and the Elizabeth history's "cheaper than anything comparable closer in".
  Each now says something its own guide supports: a drive time, the size of
  the market, the parcel sizes. The CSU visitor article no longer says Old Town restaurants
  "take no walk-ins at seven".
- **Longmont, Loveland and Carbon Valley** now have "Who each one suits"
  paragraphs, drawn only from what their own Moving Here guides source, and
  Denver drive times. Frederick's 35 minutes is the Town's own figure.
  Longmont's 45 and Loveland's 55 are estimates: OSRM route times from the
  town centre to the State Capitol, which run five to fifteen per cent over
  the times the other nine guides give, rounded down to match. Both guides
  now give the time in Getting around, beside the distances they already
  gave.
  Elizabeth's cell gives downtown (an hour, as its guide says) and the Tech
  Center, so every row has the same destination.

## Dates on places

The sample issue's "New on the guides" and "Closed" never appeared on the
live hub. They read the git history, Vercel builds from a shallow clone, and
the fetch that `scripts/run.ts` added to deepen it evidently fails there: the
hub rebuilt after #66 and the two sections still did not appear. So the history approach chosen under "Tying the network together" is
reversed: each place now carries its own dates, and nothing reads git at
build time.

- **`added`** is the day the place went on the guide. Required on every
  published place; `npm run review` stamps it when a staged place is
  approved, and keeps one a returning place already has. A place written by
  hand needs it, and `npm run validate` says so. It is not the day the
  business opened, and the email's copy says "new to the guide".
- **`closed`** is the day the guide recorded a status other than open.
  Required with any such status and dropped when the place reopens; when the
  business actually closed belongs in `statusNote`, as before.
- **Backfill.** All 436 places got `added` from the main line's history
  (`git log --first-parent`): the day the merge that first put the file in a
  `places/` folder landed, counting an approval out of staging as the day it
  went on. The three places that are not open got `closed` from the merge
  that introduced their current status. Dates are Denver days.
- **A guide's opening day is not news about places.** Longmont and Loveland
  opened with about forty places each this week; listing all of them as new
  would bury the six Fort Collins added after its launch. The places a town
  has on its first `added` day are left out of "New".
- **The week** an issue reports on is the six days after the previous send
  day and the send day itself, so consecutive issues tile and nothing is new
  twice.
- `scripts/run.ts` no longer fetches history before the hub build, and
  `listingChanges` is gone with it.

## Ten more towns, five regions, the mountain fields

*6 October 2026.* The owner's brief: the remaining ten towns in one run,
with regions on the hub. Longmont, Loveland and Carbon Valley were already
live from earlier prompts, so seven were scaffolded (Severance, Fort Lupton,
Castle Rock on the Front Range chassis; Estes Park, Golden, Evergreen,
Nederland on the mountain one), each a noindex holding page until the owner
flips it.

- **The mountain fields are the schema's existing `seasonal` and `access`
  blocks, now rendered, plus three additions.** `seasonal` gains `opens`
  and `closes`, the current season's dates from the operator's page; between
  them and the next opening the gate strips the hours and the page says
  "Closed for the season". In season, the seasonal hours *are* the hours:
  `shape()` in `src/lib/content.ts` swaps them in once, so the row, the
  page, the open-now badge and the structured data cannot disagree. The
  seasonal block has no window of its own: it follows the listing's
  `verified` and the mountain windows, as the owner asked. `trailhead` is a
  place type (Things to Do, the outdoors hue, `TouristAttraction`, no
  operator to write in, and `access` may sit on it as on a trail or a park;
  `LAND_TYPES` names the three). A town config may carry `conditionsLinks`,
  the official road and closure pages (CDOT's COtrip on every mountain
  guide, the park's conditions page on Estes Park), shown on Things to Do
  and on every trail, trailhead and park page and never restated.
- **Regions are the owner's five**, in the order the hub lists them: Boulder
  County; Northern Colorado; Carbon Valley & I-25; Mountains & Foothills;
  South Metro. `TOWN_REGIONS` holds the names, each config its own region,
  and the hub groups by the field with no list of towns and no counts of its
  own. Erie moves from "Boulder County & St. Vrain" to "Boulder County",
  Carbon Valley to its own region with Fort Lupton, Elizabeth to South
  Metro with Castle Rock. The towns test pins every town's region.
- **A town that is not live is not on the hub at all.** The dashed "Coming
  next" box that named unlaunched towns is gone and the map now takes the
  live list, like the picker, the cards and the counts. Until today no
  configured town was unlaunched, so the box had never rendered.
- **The owned domain was confirmed from the nameservers**, not guessed:
  every one of the thirteen existing domains sits on the same Cloudflare
  nameserver pair, and exactly one candidate per new town does too
  (insidecastlerockco.com and insideevergreenco.com, not the plain names,
  which belong to others; the Cloudflare token in the environment was
  rejected, so the zone list could not be read).
- **Vercel projects were created without their domains.** Attaching a
  production domain is the owner's call under the brief, and the session's
  permission classifier refused the domain step besides. Each new project
  has `TOWN`, the Ignored Build Step, Node 22.x, previews off and a deploy
  hook; the apex and `www` wait for the owner (DEPLOY.md).
- **Neighbours are symmetric, so the new towns were appended to the lists
  of the guides they name.** `neighborsOf` leaves an unlaunched town out,
  so nothing shows on a live guide until its neighbour is flipped.
- **The scaffold's placeholder hero row is tolerated while a town is not
  live.** `publicCredit` still refuses a placeholder; the validator and the
  credits test skip the row only on a holding-page town, and it is an error
  again the day the town is flipped (docs/archive/CHASSIS_TWEAKS.md, row 5, the one
  fix in that log). The scaffold's invented sample event, place and article
  were deleted from each new town rather than left for the gate to exclude.
- **Sources were seeded, all proposed, from a robots-honouring read of each
  site**, core first, with the visitor center and the land agencies as core
  on the mountain guides; nothing is ingested until the owner confirms them.

## The seven new towns, step 6: sources, events and places

*6 October 2026.* The owner's answers, and what was built on them.

- **Sources.** Every core source was confirmed except one whose feed is a
  listings site: Visit Estes Park's RSS (the local marketing district's
  calendar, which takes business submissions). Every other feed is the
  town's, the county's, the library's, a venue's or a land agency's own. Two
  library feeds are hosted by the library's software vendor (BiblioCommons,
  LibCal, Communico); they are the library's own calendars, not
  aggregators, and were confirmed. Golden's city calendar is read by hand
  (the owner: no new reader for its Revize JSON), and so, for the same
  reason, are the Jefferson County Public Library's BiblioCommons feeds,
  whose items carry no date the RSS reader can read.
- **Events: feeds only, the event standard applied.** Ingest staged 387
  items. Title exclusions from the event standard (storytimes, clubs,
  regular classes and open hours, routine meetings, a Town service day)
  took 236 back out; 151 wait in staging for the owner's review. Each
  source's note lists its exclusions and how to undo them. No event is
  published: approval is the owner's (`npm run review`).
- **Places: own pages only, three judgment calls reversed.** Researchers
  wrote listings only from the business's or the agency's own pages, and
  staged what they could not settle. Three published listings were moved
  back to staging because their sources were unclear: the Great Western
  Trail (the Authority's map and home page disagree on a closed segment),
  Bentgate Mountaineering (its page says closed on Saturdays; a call
  settles it), and Brownfield's year-round hours line was removed (its own
  page says the shop is seasonal and gives no dates).
- **Season hours apply only to a season with dates.** The first cut swapped
  a place's season hours in whenever the season could not be placed on the
  calendar, which would have shown a year-round shop's summer schedule in
  January. `seasonalHoursApply` in `src/lib/freshness.ts` now requires
  dates or closed months; an undated season's hours show as text on the
  place page's Season line. Tested.
- **Castle Rock's Town site refuses automated reads,** so every Town-run
  park waits in staging, and seven of its 32 published places are county
  and state land addressed in Larkspur or Franktown.
- **A placeholder hero cannot go live.** A render-test build of Estes Park
  as live (not committed) built all 65 pages once a real licence line
  stood in for the placeholder's, and failed at `/credits/` without one,
  as designed. Each town needs its hero photograph before it is flipped.

## The owner's decisions of 6 October, applied

*6 October 2026, later the same day.* Eleven decisions on the step 8 table.

- **Events from hand-read pages.** The brief's "feeds only" rule was lifted
  for the confirmed sources that have no feed (chamber, recreation district,
  venues, the Town's own pages), under the same rules: the organizer's page
  is the source, nothing is published, the owner reviews. Evergreen went
  from 2 staged to 58, Nederland 1 to 17, Castle Rock 14 to 41, Severance 5
  to 10. Castle Rock's Town site stays the owner's to read.
- **One run, one event.** Golden's sixteen Polar Express evenings are one
  staged event with its date range, and the museum's feed no longer
  re-stages them (title exclusion, noted on the source).
- **Castle Rock is Castle Rock.** The seven county and state properties in
  Larkspur and Franktown are gone; the fill from staged and new places got
  the town to 30, and one of the three settled items (Sudden Fiction Books,
  whose own pages still disagree on hours) went back to staging, so it
  stands at 29 of 30 with a phone call outstanding.
- **The Severance map has no addresses.** The Town's Parks & Trails map
  gives each park a number, an acreage and a position; four parks publish on
  that (the position as the address, the map as the source, the body saying
  so), and the two Hidden Valley parks stay staged because the map names
  four Hidden Valley parks where the Town's page names two.
- **Moving Here, from sourced facts only.** All seven pages are rewritten,
  every claim an inline link to an official page, with a claims table per
  town in docs/moving-here-claims/ for the owner's read. What could not be
  sourced is out: home prices everywhere (no dated government figure on an
  HTML page), elevations (GNIS is not on an official HTML page; Visit
  Golden's figure disagreed with GNIS and was cut), and the Town-run
  services of Castle Rock (crgov.com) and Estes Park (403). Two config
  facts now have a rival: Nederland's incorporation (the Town says 1874,
  the archives 1885) and the 2020 populations, where DOLA's estimates differ
  by a few dozen from the census counts; the configs keep the census and
  archives figures and say so.
- **Carbon Valley's two remaining core calendars are confirmed**, both
  official; the meetings calendar excludes its routine meetings by title,
  and the special-events calendar's three items were already known to
  ingest from the main calendar, so nothing was staged twice.
- **Hero photographs** were found on Wikimedia Commons, one per town, each
  showing the town, with licence and author recorded; they wait for the
  owner's pick and are not installed.
- **Estes Park's timed-entry lines** describe a season that ends 18 October;
  a reminder is set for 19 October to replace them with an out-of-season
  note linking the park's page.

## Six towns live, Castle Rock held

*7 October 2026.* The owner's words: get the remaining towns live, merge
when done, and then "launch 6 now keep castle rock on hold" until it
clears its threshold.

- **The review, delegated as for Carbon Valley.** One agent per town
  re-read every staged event on the organizer's own page that day, applied
  the event standard (docs/archive/AUDIT-2026-10-02.md), rewrote each body in the
  guide's words and approved through the review's own `approveText`, so
  every approval carries `verifiedBy: "Claude Code, delegated by James
  Lerner"`. Where staging ran short, more events were hand-read from the
  town's confirmed sources only, never a proposed one. Rejected: what was
  over, storytimes and clubs, school-team competitions, members-only and
  sold-out events, a dealer's sales event, a brand promotion, opening hours
  billed as an event. Held in staging, each with the one fact it needs:
  anything whose site refused a reader (403, a bot wall, a robots
  disallow) and anything a page left without a time or a venue.
- **A run is one listing.** A play's nine nights, a haunted house's
  eleven, a two-day show at the fairgrounds and a season of carriage rides
  are one file each with their date range, as Golden's Polar Express was.
  Longmont's fairground shows kept a file per day (5 October) because each
  day sat on the County's calendar as its own item; that is still the rule
  where ingest would otherwise restage the other days.
- **Counts at the flip** (upcoming events, open listings, against each
  threshold): Severance 11 of 10 and 12 of 12; Fort Lupton 13 of 10 and
  18 of 15; Estes Park 23 of 20 and 46 of 30; Golden 24 of 20 and 31 of
  25; Evergreen 26 of 15 and 26 of 20; Nederland 15 of 10 and 25 of 15.
  Severance's events are bunched in October and dip under 10 on 14
  October; the weekly session is where that is made up.
- **Castle Rock stays a holding page at 19 of 25.** Every staged item and
  every confirmed source that answers a reader was used. The Town's site
  (crgov.com) still answers 403, and two fairground organizers answer
  "Blacklisted bot". Three items wait on a phone call. The owner then
  confirmed the Castle Rock Historical Society as a source: its October
  ghost walks are nine dates of one tour, so one listing as one run, and
  with Santa at the museum the guide stands at 21 of 25.
- **Two guides per town**, a history and a with-kids guide, every fact
  linked to a page read that day and listed under its sources, and both
  versions given wherever sources disagree. No new photographs: the guides
  carry none. Golden's and Fort Lupton's followed the launch.
- **Chassis, found by flipping the seven in a trial build:**
  - The scaffold had drawn each favicon in a color the config no longer
    used, so Nederland's tab icon was Niwot's. Each now takes its accent.
  - All seven taglines ran past the 155 characters a search snippet shows,
    and none had a `shortTagline`. Cut to fit; the elevations are out, as
    they were cut from Moving Here.
  - The hub map's left-or-right label rule ran out of room once Severance
    sat beside Timnath and Fort Lupton beside Carbon Valley. Labels now try
    right, left, above and below against every pin and label already
    placed, the most crowded pins first, and a reference city drops out
    once it has a guide (Castle Rock's faint label would otherwise sit
    under its own pin).
  - The county test now counts Jefferson.
- **Infrastructure was already in place.** All seven projects had their
  domains attached and verified and their hooks in `VERCEL_DEPLOY_HOOKS`
  (the 7 October nightly run fired all twenty). Web Analytics on Golden
  and Nederland was never switched on, and is the owner's in the
  dashboard.
- **Mail on the seven new domains, the same evening.** None had MX
  records, so every `hello@` on them bounced. With a Cloudflare token the
  owner supplied, each got Email Routing (Cloudflare's MX, SPF and DKIM
  records, locked), a `hello@` rule forwarding to the inbox every other
  guide forwards to (copied from Loveland's, catch-all off) and the
  network's `_dmarc` record (`v=DMARC1; p=none`). All seven read back
  ready, and public DNS shows the records. Every guide domain in the
  network now has MX and DMARC, Carbon Valley's DMARC included.
- **Things the agents found for the owner:**
  - The Estes Valley Library's robots.txt now disallows Claude's agents on
    its main site (its calendar subdomain allows them). The library listing
    and Moving Here cite that site from a 6 October read.
  - enosmills.com now redirects to an unrelated gambling-type domain;
    nothing on the guides links to it.
  - The Severance Town Council's one-off budget town hall (13 October) was
    approved from a calendar not in the registry, as a civic event people
    act on; delete the file to reverse it.
  - Evergreen events that rest only on a chamber listing stayed staged
    wherever the organizer's own site was blocked. Erie and Windsor have
    published chamber-sourced events before; the owner may allow it here.

## The October content pack, read against the guides

*7–8 October 2026.* The owner supplied a "visitor content expansion" pack
(a Markdown guide, the same guide as a static HTML viewer, a JSON data
file of 116 place records across the 18 live guides, 24 corrections, 18
one-line outings, 54 article ideas, and a brief), the product of an online
review dated 7 October with no field visits. It was read in full and
matched record by record against the repo before anything changed.

- **What it was worth.** Six to eight real hours corrections; the facts to
  unblock two staged listings; seven new places with operator sources; the
  "before you go" notes, where they were specific; and about a dozen
  article ideas that were not already written. Its 101 "enrich existing"
  records were otherwise weaker than what the guides already say.
- **What was not taken, and why.** Its one-line `copy` (60 to 107
  characters, "a familiar breakfast stop") would have replaced better
  summaries. Its accessibility, parking, cost and dog fields were
  boilerplate on 110 or more of 116 records; the schema has no such fields
  and a card that prints "not independently established" says nothing.
  Its reformatted hours lines (spaced dashes, semicolons) still parse, but
  six of them, the split-service ones, would have cost the Open-now badge;
  those were written the repo's way, text plus `openingHours`. Castlewood
  Canyon is in Franktown, which the 6 October "Castle Rock is Castle Rock"
  decision rules out for Elizabeth too. Five of its corrections were
  already done or wrong: 1914 House (Taverna Laudisio is live), Chimney
  Park Restaurant (already temporarily closed, and the label could be read
  as the Town park), Johnson's Corner (filed under Loveland and called
  closed; it is Johnstown's Black Bear Diner, verified 2 October), Abejas
  (staged, so nothing to hold), the Longmont Museum (the listing already
  says the galleries reopen 17 October). Its `review_date` was not copied
  into `verified`: only the records a person re-read moved.
- **Each correction was re-read on the operator's page before it was
  written.** Timnath Beerwerks closes 9 pm Sunday; Elizabeth Kitchen +
  Bar's kitchen closes before its bar; Ginger and Baker's The Cache has its
  own hours. The pack's "CooperSmith's Thursday conflict" was the billiards
  hall's separate schedule, already in the body; Decent Bagel and Woody's
  already said what it asked. Oskar Blues Lyons (later closing times,
  per the pack) was not changed: its site answers 403 to the robots-aware
  reader, so it needs a browser or a call.
- **Sites that would not answer went to staging, not to the guide.**
  Pepper's Fireside Grille, The Roost, Jefes, Lucile's Longmont and Windsor
  Mill Tavern answered 403 or a bot check; Willow Creek's own pages
  disagree on the weekend brunch start (10:30 or 11 am), the Sudden
  Fiction rule. Each staged file carries what the pack reported, marked
  unconfirmed, for whoever calls. Sherpa House and Muddy Buck, which the
  pack said it had read, still did not answer; their staging notes carry
  the pack's figures the same way. Devil's Backbone Open Space published
  for Loveland from Larimer County's page, the one new place whose manager
  could be read.
- **Three dated facts read the same day** went into bodies: Evergreen
  Lake's boating and parking shuttle closed for the season, the 2026
  Hessie Shuttle's dates, Union Reservoir's 14 October early close. The
  Evergreen Lake `seasonal` block still has no `closes` date because the
  district publishes none; the page says it in prose instead.
- **Twelve guides**, one per town where the pack's idea was not already
  written and the sources were official pages that answer: Timnath
  Reservoir's permits, Hessie before you drive, Lyons hikes by dog rule,
  McIntosh or Union, a first RMNP visit (with `supersededAfter` 19 October,
  when the 2026 timed-entry season ends), Horsetooth's routes, Golden's
  mesa or canyon, Evergreen Lake through the seasons, Erie's paved or
  singletrack, Windsor's Poudre Trail from Eastman Park, Carter Lake, and
  Loveland's sculpture parks. Every fact from a page read that day and
  listed under sources; where official pages disagree (Sundance Trail 3 or
  3.5 miles, Benson's sculpture count, Evergreen's private-boat limit)
  both figures are given. The pack's other 42 ideas duplicated the history
  and with-kids guides every town already has, or rested on restaurants.
  The outings and town intros were seeds, not content, and were not used.
- **Found along the way, for the owner:** lovgov.org (the City of
  Loveland) answers 403 to every reader, so the sculpture guide rests on
  the arts council's and Centerra's pages and says so; poudretrail.org's
  home page carries injected casino spam, though its trail pages are
  clean (the Windsor guide cites only those); the Forest Service gives the
  Hessie shuttle a different season than the county that runs it; Union
  Reservoir's fees table still prints last year's Thanksgiving dates.
- **The HTML viewer stays out of the repo**: a review tool, not content.

## Seventeen "Explore" guides, from the pack's outings

*8 October 2026.* The content pack's eighteen one-line outings were seeds,
not content; Niwot already had the form they wanted, "Explore Niwot: four
places in walking order". Every other live town now has one, on that
model: park once, four to six numbered stops, a simple first visit, how to
get here, and what can be confirmed about access.

- **Stops are published listings only.** Nothing from staging, nothing
  closed: Pepper's, The Roost, Jefes, Lucile's Longmont, Willow Creek,
  Muddy Buck, Sherpa House, Coors, Buffalo Rose, Abejas, Chimney Park
  Restaurant and the Lake Estes trail are absent or named only as having
  no listing yet. Castlewood Canyon stays out of Elizabeth. Fort Collins
  and Longmont are their downtowns on foot, since a city is not a walk.
- **Walking or driving, by the title.** Where the stops are not reachable
  from one parking spot (Carbon Valley, Estes Park, Evergreen, Loveland,
  Nederland, Severance, Timnath) the title and the file name say driving
  order; two files were renamed to match their titles.
- **Facts beyond the listings come from official pages read that day**
  and listed under sources; where a site refused (larimer.gov, lovgov.org,
  coloradocandlelight.com, the Lyons dog park page, windsorco.gov), the
  stop restates its listing and adds nothing. Day-of-week cautions come
  from the listings' hours lines. Transit is claimed only where an
  official page names the town (Transfort's FLEX for Berthoud, Longmont
  and Loveland; the Town of Golden's Ride page; Estes Park's The Peak).
  The arts council's site asks Anthropic's crawlers to stay out, so the
  Loveland guide uses the Benson listing and links the sculpture guide.
- **Noticed, not resolved:** Catrina's suite (its site says A, the listing
  Unit 101); the Homesteaders mural's address (224 or 226 Mountain Ave);
  the Art & Heritage Center's Thursday hours (the Town's page no longer
  shows them); Estes Park's Town site answered today though the config
  records a 403.

## No named editor; Lerner Works only

*8 October 2026.* At the owner's direction, James Lerner is no longer named
as editor: `hub.editor` is removed, reversing the pre-launch audit's fix of
7 October. With the slot dark, every "Checked by James" line reads "Checked
<date>", no About page has a "Who runs it" section, and an article's
structured-data author is the publication. The one name left on the sites is
the "Site by Lerner Works" credit in every footer strip (`hub.credit`).

## The updated audit of 7 October

*8 October 2026.* An outside audit of the live network after the week's
updates (`Inside-the-Towns-Updated-Audit-2026-10-07.md`, not in the repo)
proposed a 30-day plan. What could be done in code and was supported by the
audit's own evidence is done here; the rest is listed below with why.

- **The hub's search finds the network.** A search on insidethetowns.com for
  "Niwot Tavern" returned six hub pages that mention Niwot and not the
  tavern; "dogs" found nothing of the Lyons dog guide. The hub build now
  writes one record per town page each guide's own search would find
  (`src/routes/hub/network-search.json.ts`): live towns' places less any
  delisted, every article, each Moving Here page, the event occurrences
  whose pages are indexed (`pickCanonical`, and not past), and each guide's
  home. They go through the same gate as every other page
  (`getNetworkEntries`), so a stale or closed listing is not findable from
  the hub when it is not findable on its own guide. `scripts/run.ts` now
  builds the index with Pagefind's Node API (`scripts/lib/search-index.ts`)
  so the records can be added as pages at their absolute URLs; the records
  file is deleted before deploy. A town build's index is unchanged: the
  Node API and `pagefind --site dist` give the same 123 pages on Lyons.
  1,274 town pages on the hub today. Each result says what it is, which
  town, and the guide's domain. Ranking is Pagefind's default: on ten
  decision queries ("Horsetooth permit", "Lyons Flyer", "Berthoud
  breakfast", "patio Niwot", "Carter Lake"…) eight put the right page
  first; a gentler length penalty lifted "dogs" but made "Estes Park" lead
  with its Moving Here page rather than the guide, so it was left alone.
  Pagefind matches every word, so "dog friendly hikes Lyons" finds nothing
  of the dog guide, which never says "friendly"; the town sites behave the
  same. Like the hub's network events, the hub's search catches up with
  other towns' content at the nightly rebuild.
- **Sponsorship says the same thing in both places.** Every guide's
  /for-businesses/ said prices and audience figures were on /advertise/,
  which publishes neither. It now says prices are quoted on request until
  `hub.rates` is set, and that /advertise/ says what has been measured and
  since when. It also says the most sponsor lines a page carries: the
  town's own and the network's (/this-weekend/ and the Nearby block can
  show both). /advertise/ now says the network line carries one sponsor at
  a time, which is all `hub.sponsors.network` can hold. It also said the
  founding offer was "open to the first three sponsors only", which with
  one line at a time could only mean three quarters in turn: nine months of
  the network's one placement sold before there are audience figures to
  price it by. The owner left the call to us, and it now says the founding
  rate is offered until the network publishes a rate card, which is when
  the page stops showing it (`hub.rates`). Rate, reporting and cancellation
  terms were not invented.
- **Event submission says form or email per town.** Nine guides have no
  form switched on (no `formspreeId`); the hub's chooser said "each guide
  has its own form" and the contact pages said "there is a form" on every
  guide. The chooser now labels each town "Online form" or "By email for
  now" from the config, and every email route (a town's fallback, the hub's
  "Not one of those towns?", the hub contact page) opens with the form's
  four questions in the body (`src/lib/submit.ts`). The email fallback
  carries the same "usually within a couple of days" as the form.
- **The hub's opening is shorter.** At the audit's 1348×926 the weekend's
  heading sat at 1,114px; it is at 843px. From 640px up the headline is a
  size smaller with less padding above, the intro is one sentence (the
  tagline before it all but repeated the headline), and the weekend band
  has less padding above it. Below 640px the picker, six rows now there are
  eighteen guides, had been cut off at 375×812 (its last row ended at
  859px; it was 749px when this was last measured, with fewer towns) and
  on every tablet size tried. It now fits the first screen at 375×812,
  390×844, 640×900 and 768×1024, every chip still at least 44px.
- **Left, and why.**
  - *Naming the publisher*: the owner asked not to be named (above).
  - *An inline newsletter signup*: Buttondown's embed form cannot be
    finished inline; it needs its own "Verify and Subscribe" page. Inline
    means a server function holding an API key, and the audit's own test
    for it (an owner-controlled address reaching confirmed status with the
    right town tags) is the owner's to run. The new-tab flow and its
    "one more step" message stay.
  - *Photographs on ten articles*: real, credited, permitted photographs
    are a walk and asks (`docs/PHOTOS.md`); nothing here can supply them
    and nothing should be made up.
  - *Four new decision-led guides*: reporting, not code.
  - *A maintenance queue*: the freshness windows, `npm run weekly`, `npm
    run review` and the source registry already are one, per field type.
  - *A rate card, a four-week pilot, Search Console*: the owner's.

## An hour's cache for built files, none for the search index

*8 October 2026.* Fort Lupton showed one visitor its HTML with no
stylesheet while it rendered for everyone else. The 04:31 UTC deploy
(PR #92) had renamed `Base.css` (`dsmGYlsi` to `DLI4aUY1`), and Vercel puts
a path's headers on every response for it, a 404 included: a stylesheet
missed during the switch came back as a 404 marked `public,
max-age=31536000, immutable`, which the browser keeps for a year and does
not ask about again. Vercel's Skew Protection, which keeps the old files
reachable through a switch, needs the Astro adapter; the build has none.

- **`/_astro/`** is now `public, max-age=3600`, not immutable. The names
  are hashed, so a stale copy is never wrong; a missed one now comes back
  within the hour. A returning visitor revalidates after an hour, a 304.
- **`/pagefind/`** loses its own rule and takes the site's `max-age=0,
  must-revalidate`. It had the same year-long, immutable header, and
  `pagefind.js` and `pagefind-entry.json` are not hashed: the entry file
  names the current index by hash, so a kept copy outlives its index and
  the next search asks for files that are gone.
- `test/cache-headers.test.ts` holds both, and no `immutable` anywhere.
- `www.insidefortlupton.com` was found serving the site itself instead of
  redirecting, the only one of the twenty `www` domains to do so; it is now
  a 308 to the apex like the rest.

## The October 7 public audit: one fix pass

*8 October 2026.* A public audit of the network on 7 October found the
faults below. Each was reproduced in the code or the content before it was
fixed; nothing outside the list was taken on.

- **This week's pick is dated by its listing.** The notes for the week of
  October 5 picked Berthoud's talk on the 13th, Carbon Valley's and
  Elizabeth's Saturdays on the 17th and Niwot's open house on the 16th, all
  under "October 5–11". `currentPick` now reads the event page the pick's
  URL names and shows it as Our pick only when that listing is on between
  Monday 00:00 and the next Monday 00:00, Denver, not ended and not called
  off. A pick for a later date goes under "Coming up" with its real date;
  one with no listing to date it by is not shown. A week with no pick and no
  listings says so in words whatever New & closed holds, and a stale build
  that has cleared everything says so too. The pick now prints its own day
  and time. The newsletter never read the editor's pick; its picks are the
  weekend's listings, which were already inside the weekend.
- **A listing comes off at its end.** `isPast` compared a listing's end with
  the start of today, so a 7 pm talk was "coming up" at 11 pm. It now uses
  `listedUntil`: a timed event's end time, the midnight after an all-day
  run's last day, and for a listing with no end the next Denver midnight.
  That midnight is a display rule only; nothing exports it. Every row
  carries the instant as `data-end`, and Freshness.astro removes a finished
  row on load as the hub's weekend page already did. Six runs stored the
  start of their last session as their `end` (Applewood's Sunday opening,
  the last show of two theatre runs, the Polar Express's 8 pm train, the
  library book sale, the home show), so they would have dropped off as that
  day began: they are now whole-day runs (`allDay`), times in the note.
- **One listing, three exports that agree.** The .ics files, the Google
  link and the structured data all read `exportWhen`: a sitting by its
  start and its own end, never a guessed one (the Google link's made-up
  hour is gone), and a timed listing that runs 24 hours or more across days
  as whole days, with its times in the description. An overnight sitting
  (the Crystal Ball, 8 pm to 12:30 am) stays timed.
- **A show on separate nights is a file per night.** Amy Bruni's two
  separately ticketed nights were one listing exported as 7:30 pm Thursday
  to 7:30 pm Friday. Eleven listings of two to four performances (Amy
  Bruni, Budos Band, DeVotchKa, the monster trucks, the PRCA finals, the
  Rialto ghost tours, the Nutcracker, CSU's dance concert and Menotti,
  Mystic Pizza, Willy Wonka) are now one file per performance, as Die
  Fledermaus already was. The first keeps its URL; two on one day are
  `-matinee` and `-evening`; each names the others. An end is kept only
  where the listing stated one for that performance.
- **One filter.** The directory's name search set `data-name-miss`, which
  the page's scoped style never matched on rows rendered by PlaceRow, so it
  hid nothing. Name, category, town and Open now are now one pass in
  `src/lib/filters.ts`, run by FilterBar; the group counts, the empty box
  (with a reset) and the status line come from that pass, and the status
  names the town rather than its slug. On the hub, the day's fold is redone
  over the rows a filter shows, so a town's only listing that day is never
  behind "Show 20 more"; All restores the fold as built.
- **Hours read with am and pm.** `hoursWithMeridiem` writes am or pm on
  every time of a line the parser reads in full, with the interpretation
  the open-now badge already used, so the two cannot disagree; a line the
  parser will not read is left as written, and the five of those without
  am/pm were given it in the content. A business with no hours says
  "Hours unknown"; a park or trail, which keeps daylight or none, does not.
  Open now leaves out what it cannot decide and says how many, businesses
  and parks apart, rather than treating them as closed.
- **The signup says what it can see.** It opens the provider's tab itself
  from the button press, so a blocked tab is known before anything is sent
  and the reader is offered this tab instead; it then says "Finish signing
  up in the new tab, then confirm by email", with links to open the tab
  again or change the details. A second press is refused. Every form needs
  at least one town now, the hub's rule; the town's own is ticked.
- **The event form can describe a schedule**: date, start time (Mountain
  Time), an optional end time, all day, and a line for other dates or a
  repeat. The source link stays required. The email fallback asks the same.
- **Privacy wording.** The pages promised an address was never shared
  while naming the two services it goes to. One sentence now, in
  `src/lib/privacy.ts`, on the privacy page, the signup, the event form and
  the page after a message: not sold, not shared for advertising, processed
  by Buttondown and Formspree only to do what was asked. No retention period
  added. Waiting on the owner's sign-off before merge.
- **Explore dates.** The seventeen Explore guides were dated 2026-10-08:
  they were committed between 00:26 and 00:31 UTC on the 8th, 6:26 to 6:31
  pm on the 7th in Denver, by a session whose clock was UTC. The pages
  already format in Denver, so the stored days were what was wrong; they
  are now 2026-10-07. `new-town` and the validator's "event is over" line
  now use Denver days too.
- **Contents numbers once.** A guide that numbers its own headings ("01 ·
  Elkhorn Avenue") keeps its numbers in the contents list; the list adds
  none of its own there.
- **Text.** /moving/ no longer ranks Elizabeth highest (it is a Palmer
  Divide community; Evergreen, Estes Park and Nederland are all higher), says
  Evergreen is unincorporated as well as Niwot (Niwot's wording untouched
  while its vote is pending), and calls Carbon Valley a guide to three
  municipalities. "Doubled" is now what the census figures on the comparison
  pages say: Erie grew by about two-thirds and Johnstown by about
  three-quarters, 2010 to 2020. Every population figure in prose names its
  year and source; the 2020 census table is unchanged, the Moving Here
  sidebar says "at the 2020 census", and the comparison table "Population
  2020". Figures with no source on the sites were taken out rather than
  guessed at: Elizabeth's "nearer 3,100" for 2026 (and the "nearly doubled"
  and "fastest-growing" claims resting on it) and Erie's "38,594 in 2024".
  Frederick's own page gives 16,873 with no year, and the text says so.
  WildWing is listed once. British spellings in original prose are
  American (license, center, percent, jewelry); street names such as Centre
  Avenue, quotations and source titles are as written.
- **Lyons: seven occurrences back to staging.** The five Lyons Recorder
  links the audit found dead (the Oskar Blues pick, MainStage's open pick,
  the women's pinball tournament, Spirit Hound's trivia and comedy) had no
  working organizer or venue page showing those dates, so each occurrence
  went to `content/lyons/staging/events/` with a `review` line saying why:
  seven files, since the pinball listing's November and December files
  cited the same dead page. Any can come back when its organizer lists it.
- **Timnath photographs.** The Arapaho Bend photograph's Flickr record is
  live at the photographer's numeric address (Seth Anthony, CC BY-SA 2.0);
  the ledger and the caption now point there. The hero showed Fossil Creek
  Reservoir in Fort Collins; it is now the USFWS "Sunrise in Timnath"
  photograph already in the repo (CC BY 2.0), which is small (960px) and
  shows no landmark: a better licensed Old Town photograph is the owner's
  to find. Fossil Creek stays as its own listing.
- **Facts checked.** Timnath Reservoir's articles now say what the Town's
  Colorado Anglers page says: resident anglers with a Colorado license, and
  a shore permit on top, so a license alone does not get you on. Carter
  Lake carries the dated August 2026 mudsnail note wherever Berthoud
  covers it. Hall Ranch and Heil Valley Ranch's no-dogs rule and the RMNP
  timed-entry dates were already right. Catalina's Diner is not listed on
  the Elizabeth guide, so there were no hours to change.

## A fifth catalog: four photo galleries, sixteen photographs

*8 October 2026.* The owner supplied four photo-gallery PDFs: 1,594
candidates, about 1,530 from Wikimedia Commons and the rest from Flickr,
every one CC BY, CC BY-SA, public domain or CC0. None was already on the
sites. They cover ten towns very unevenly: Estes Park 836, Elizabeth 419,
Evergreen 131, Fort Collins 114, and a handful each for Carbon Valley, Erie,
Johnstown, Berthoud, Fort Lupton and Niwot. The other nine towns have none.

- **Added: sixteen places that had no photograph.** In Evergreen,
  Alderfer/Three Sisters Park, the Buchanan Park Recreation Center,
  Evergreen Lake and the Hiwan Homestead. In Estes Park, the Aerial Tramway,
  Rocky Mountain National Park (Moraine Park) and nine trailheads and
  trails: Bear Lake (Nymph Lake), Cub Lake, Fern Lake, Glacier Gorge (Mills
  Lake), Lily Lake, Lily Mountain, Longs Peak, Lumpy Ridge (the Gem Lake
  Trail) and Wild Basin (Copeland Lake). In Carbon Valley, St. Vrain State
  Park. Each was looked at, checked against its live Commons record
  (author, licence, date, coordinates where it has them), cropped to 3:2
  where needed and saved at 1,600px or less with no camera metadata. A
  trailhead's photograph is of where its trail goes, and the alt text says
  so rather than calling a lake the trailhead.
- **Traps**, for the next review: `Spring Creek valley.jpg` is a foothills
  canyon, not Fort Collins's paved Spring Creek Trail; "Big Horn Restaurant"
  and "Rock Cut Brewing" match bighorn sheep and Rock Cut on Trail Ridge
  Road; every Elizabeth and Fort Lupton "town" photograph is an aerial from
  an airliner; most of Elizabeth's 419 are car interiors at Rambler Ranch;
  the AboutMyTrip Carbon Valley and Johnstown frames are I-25 from a car.
- **Not used, on purpose:** the Taffy Shop (an identifiable worker is the
  subject); Lawn Lake, Thunder Lake and the Poudre in Fort Collins (600px
  NPS and 2004 frames); the Colorado National Speedway panorama (1,024px
  and too thin to crop); the 2003 smoke over Elk Meadow.
- **Left for the owner:** the Evergreen Library photograph is from February
  2020, before the branch's 2024 redesign; Brownfield's Trading Post is a
  2009 storefront; `Stanley Park, Colorado.jpg` may or may not show the
  Events Complex.

## The 8 October follow-up audit: the expiry defect, the picks, the openings

*8 October 2026.* The follow-up public review (Inside the Towns Follow-Up
Audit, 8 October 2026) retested the seven immediate findings of the 7 October
audit and found six corrected and one partly: the browser-side expiry. It then
set five remaining priorities and a short list of design and search items.
This pass takes the ones that are code or content in this repository; the
rest are the owner's, and are listed at the end.

- **Expiry: a known end decides; the day stands in only without one.** The
  Freshness script removed a row when its day was before today *or* its end
  had passed. An 8 pm show running to 1 am has an end in the future and a
  start day in the past, and at half past midnight the day comparison took
  it down while it was still on. The rule is now one function
  (`src/lib/expiry.ts`, `listingOver`): an end that parses is the whole
  answer; a row with no usable end goes once its last day is behind today's.
  `pruneExpired` then rebuilds what hung off the removals from what
  survives: a day heading with nothing under it goes, and a jump chip goes
  when its day's section is gone rather than when the calendar says the day
  is past, so a day whose last listing is an overnight show keeps its chip.
  Freshness.astro and the hub's weekend page both run it; a test replays the
  audit's four clocks (ended same-day, future same-day, overnight at 12:30
  and at 1:00, no end) against the marks the pages really write, and asserts
  the pages import the rule rather than a copy of it.
- **Home page picks: a two-night show is a one-off.** Estes Park's "What's
  on" led with October 31 while Amy Bruni's October 15 and 16 nights were on
  its calendar, because two files with one title at one venue were counted a
  regular (the storytime rule) and ranked below every one-off in November.
  `regularTest` now calls a series stored as a file per date a regular only
  when its dates fall on the same weekday: a knitting drop-in on two Fridays
  is a regular; a show on a Thursday and a Friday is a one-off that happens
  twice, shown once at its next date. The hub's weekend block (`oneOffs`)
  reads the same test, so such a run is now a reason to cross a county line
  there too. The nearby block already used the narrower weekly test.
- **Hub opening.** Under the headline: one line saying where the towns are,
  read from the live configs (the northernmost and southernmost by latitude,
  the mountain guides by name), and three task links ahead of the eighteen
  pills: find weekend plans, choose a town guide, compare a move. A
  hierarchy change inside the existing design, as the audit asked.
- **Town switcher.** The last item in a guide's primary navigation is "Other
  towns": a native disclosure with the neighbouring guides (the config's
  `neighbors`, live ones only) and a link to the hub's full list. It opens
  without the script; the script only closes it (Escape, a click or a tab
  elsewhere, a width change). In the phone menu it opens in place. The
  footer's sister-guide list, which ran to several screens of taglines on a
  phone, sits there behind a disclosure that says how many it holds; the
  markup ships open and the script closes it on a narrow screen, so a reader
  without the script sees the list as before, and from `sm` up nothing
  changes.
- **Itineraries at a glance.** Every first-visit itinerary now opens with a
  compact block in its masthead: where it starts and where to leave the car,
  how long, on foot or by car, the day that suits it, and the one caveat.
  The lines were extracted from each article's own text, a field left out
  wherever the article does not say (eleven of eighteen give no length for
  the day; three give no day guidance), and read back against the body
  before they went in. Two were tightened on that reading: Timnath's
  duration restates the article's own shape of the day rather than calling
  it "a full day", and Erie's Monday list no longer names the Erie Social
  Club, which the article says is closed on Monday. The block is a
  summary, not a second source; the schema's comment says so.
- **Structured prices.** An event's offer now carries `price` and
  `priceCurrency` where the cost line gives one figure ("$20", "$25 per
  person"), `lowPrice`/`highPrice` as an AggregateOffer where it gives
  several ("$40–$98", "$15; seniors $13; under 18 $5; CSU students free",
  where a free tier puts zero at the bottom), and zero for "Free" in any of
  its spellings. A line with no figure ("Ticketed", "Tickets from the Rams
  ticket office") gets no number. The words go in the offer's description
  every time, so nothing the listing says is lost. The audit's other markup
  note, an Event with no image, is left as it is: a listing without a
  photograph of its own gets none, rather than the town's hero as a stand-in.
- **The publisher is Lerner Works.** The owner's answer, 8 October 2026,
  to the audit's third priority: the guides are published by Lerner Works,
  an organisation, and no person is named, so `editor` stays unset and the
  check lines still read "Checked <date>". The name goes where a reader
  looks for who is accountable: the About page's "Who's behind this", the
  editorial policy's Independence section, the footer strip ("Published
  by" in place of "Site by") and the top of the structured-data graph, as
  the hub's parentOrganization. The editorial policy also now says what
  the audit asked it to: a page rests on checked sources, not a visit,
  unless it says so in its own words, and a recommendation is an editorial
  choice, never a paid rank.
- **Signed off.** The owner signed off the whole of this pass and the
  privacy wording of 7 October (above) on 8 October 2026, and left the
  remaining calls to the editor.
- **Left to the owner, and why.** *Photographs for Golden, Fort Lupton,
  Nederland and Severance:* the one-photo coverage is a rights and sourcing job, as the
  photo catalogs above record. *The authorized newsletter test, subscriber
  counts, sponsor placement and reporting sample, and audience measurement:*
  none can be done from the repository. *Johnstown's theater season:* the
  Candlelight run is listed as whole days with "see box office for times",
  which is honest about what the source gives; the split-performance
  treatment waits on dated performances from the box office.

## A Commons pass for the four one-photo towns

*8 October 2026.* The follow-up audit's fourth priority: Golden, Fort Lupton,
Nederland and Severance each showed one photo record on their credits pages,
the hero. The owner gave the go-ahead the same day. One session per town
swept its Wikimedia Commons category tree and ran targeted searches for
every listing, under the catalog rules: CC BY, CC BY-SA, CC0 or public
domain read from the live file record; the actual place, recognisable
today; nothing older than about 2012 without a reason; no identifiable
person as the subject; a trailhead shown by where its trail goes, with the
alt text saying so; the file looked at and read against the listing before
use; cropped to 3:2, saved at 1,600px or less with no camera metadata; one
ledger row each. Every adopted file was then looked at again by the editor,
and the twenty-one ledger rows re-read against Commons in one pass.

- **Golden, fourteen.** Clear Creek Whitewater Park (tubers below the
  Washington Avenue bridge, South Table Mountain behind), the Clear Creek
  Trail and Clear Creek Canyon Park in the canyon (both Jeffrey Beall,
  2026), North Table Mountain's basalt cliffs and South Table Mountain's
  Castle Rock (Georgialh, 2014, the only open views of either mesa newer
  than 2007), Buffalo Bill's grave, the Lookout Mountain Nature Center, the
  Colorado Railroad Museum's rotary snowplow, the Guy Hill schoolhouse in
  Golden History Park, Old Capitol Grill & Smokehouse with its name readable
  over the windows, the Mines Museum's entrance, the Mount Galbraith
  trailhead itself, Centennial Cone from Camino Perdido, and for Windy
  Saddle the Mount Zion slope its trails climb, said so in the alt text.
- **Nederland, five.** Barker Meadow Reservoir looking west to the town and
  Eldora, Brainard Lake under the Indian Peaks, Jasper Lake for the Hessie
  trailhead and the Arapaho Pass basin for Fourth of July (each named as the
  destination, not the trailhead), and the mining museum's 1923 Bucyrus
  steam shovel (Grey3k, 2009, kept despite its age: a permanent exhibit and
  the only open photograph of the museum). Lost Lake exists on Commons under
  CC0 but with a heavy colour filter, so Jasper Lake stands for Hessie.
- **Fort Lupton, one.** The Public & School Library (Erie Bard, 2019; the
  description says High Plains Library District, which ran it then, and
  the building is the same). Nothing open exists of the rebuilt fort (only
  a 1913 scan of the original adobe wall, 751px), Denver Avenue, the museum,
  any park, the golf course or any business. The Ottesen Grain Co. mill at
  815 7th Street has four open photographs and no listing.
- **Severance, one.** Bruce's Bar, from a 2018 1st Street scene (Jared
  Winkler) cropped to the building. No sign is readable, so the match was
  made on position (the west side of 1st Street opposite the post office,
  at the bar's own map pin) and on the exterior murals its own About page
  describes, and confirmed against the bar's own banner photograph of the
  same tan side wall and covered porch. Nothing open exists of Town Hall,
  the library or any park; the Windsor Lake photographs on Commons are of
  the lake in Windsor, not Windsor Reservoir.
- **Not used, on purpose:** the Foothills Art Center's one photograph (the
  old church at 15th and Washington, today's Creative Campus, not the 1133
  Arapahoe address the listing gives); Golden History Museum's 2009–2011
  frames; a "Sunset on Diamond Lake" that is Diamond Lake, Oregon; two CC0
  "Eldora" lakes with no stated location; "Nederland – panoramio" (an
  unidentifiable creek); Fort Lupton's Heartland Story statue on its own
  (it is in the library photograph); the 2008 Nederland downtown pair (one
  is the hero's subject, one the Pioneer Inn).
- **Still without a photograph**, for the walk with a camera that
  docs/PHOTOS.md describes: every Golden brewery, café and restaurant but
  one, Apex and White Ranch, Parfet, Lions and Vanover parks; Nederland's
  downtown businesses, the Carousel of Happiness, Chipeta Park, Mud Lake and
  West Magnolia; everything in Fort Lupton but the library; everything in
  Severance but Bruce's.

## Pre-launch audit of the hub and the eighteen guides

*8 October 2026.* The owner's last ask of the day: one pass through every
site to make sure nothing was missed. The method and the findings are in
`docs/archive/PRELAUNCH-AUDIT-2026-10-08.md`: every built page read by a script
(1,986 pages, every internal and cross-domain link resolved in the sister
builds, every image, every JSON-LD block, the day's features present), all
nineteen live domains fetched, and a sample screenshotted and measured for
overflow.

- **Found and fixed:** the morning's "Other towns" item made the
  navigation row wider than a 1280px screen on twelve guides, pushing the
  search button off the edge; the row now reads "Towns" with a tighter gap
  at that breakpoint, and the phone menu keeps "Other towns". Same-day
  matinee and evening listings (four pairs in Fort Collins, one in
  Loveland) shared one page title and now carry their start time. Eight
  outbound links moved from http to https where the site serves it.
- **Checked and sound:** everything else in the table there, including the
  hub's search index 404 (by design) and the noindex counts.

## The favicons, redrawn to read in a browser tab

*8 October 2026.* The owner asked for a review of the softened favicon set.
At 64px it is a good system: one tile, one cream ink, one gold baseline,
each town's colour. A tab draws it at 16px, or 32px on a high-density
screen, and there six marks turned to smudges because they relied on
hairline detail, and every mark lost size to a 90 per cent inset and its
baseline to grey.

- **All twenty:** the mark is drawn at full size in its tile, and the gold
  baseline is 3 units rather than 2.2, so it stays gold at 16px.
- **Redrawn, same ideas:** Elizabeth's windmill has six solid blades with
  open gaps instead of twelve hairline spokes; Johnstown's compass rose has
  four broad half-shaded points and four short ones; Nederland's snowflake
  has six heavy arms with one pair of branches each; Windsor has two broad
  waves instead of three fine ones; Fort Collins's bicycle keeps its shape
  with a heavier pen; Timnath's wheat is one solid ear of broad grains.
- **Unchanged:** the hub's I, Loveland's heart, Severance's sprout, the
  castle, mesa, sunrise, mountains, evergreen, arch, barn, headframe, tree
  and Lyons's sandstone, which all hold at 16px once the frame is fixed.
  Loveland and Nederland keep their marks without a baseline, as before.
- The favicon link moves to `?v=3`, so a browser that cached the set this
  morning fetches the new one on its next page view rather than up to a
  week later. The softening at 02:46 UTC had changed the files without
  changing the version.

## A sixth catalog: the eighteen-guide photo library, thirty-one photographs

*8 October 2026.* The owner supplied a photo library for the eighteen live
guides, one ZIP per town: 1,424 photographs from Wikimedia Commons, Flickr
and NPGallery, each with its licence, credit and download URL, and a
`missing_photo_register` matching them to pages. Every photograph was looked
at. Each one used was read against its live source page (Commons, Flickr or
NPGallery), checked against `IMAGE_LICENSES.csv` and a perceptual hash of
every image in the repository, cropped to 3:2, saved at 1,600px or less with
no metadata, and given one ledger row. The owner approved every proposal and
left the open calls to the editor.

- **Added: thirty-one photographs.** Six places that had none: White Ranch
  Park in Golden, the Stanley Hotel and Lion Gulch Trailhead in Estes Park,
  Devil's Backbone Open Space in Loveland, Left Hand Brewing's tasting room
  in Longmont and the Evergreen Lake Trail. Twenty-one articles, and the
  Moving here pages of Evergreen, Golden, Niwot and Estes Park. Each article
  shows one of its own stops or subjects: Erie's County Line Road article
  gets `E County Line Road 01.jpg`, the hero chosen for it on 30 September
  and never downloaded then.
- **Moving here now shows its photograph.** The template never rendered
  the page's `image`: eight towns' Moving here photographs sat in the
  frontmatter and on `/credits/` ("used on Moving here") without appearing,
  and the share preview fell back to the hero. The page now shows it as an
  article does, under the masthead with its caption, and uses it as the
  share image. That puts the four new ones and the eight existing ones in
  front of readers, and makes the credits pages true.
- **White Ranch was hiding under a generic name.** Three files are titled
  only "Jefferson County, CO, USA - panoramio"; their camera positions are
  within 20 m of the West Trailhead on Belcher Hill Road (OpenStreetMap), and
  the one used shows the Rawhide Trail sign. The Golden pass that morning
  searched by name and could not have found them.
- **Two archival photographs, labelled as such** in the alt text and the
  caption: the June 1929 aerial of downtown Fort Collins (CSU University
  Historic Photograph Collection, UHPC 5969, glass-plate border trimmed) on
  the history article, and Arundel C. Hull's 1868 Golden on Golden's
  (871px, kept at its own size).
- **Licence notes.** Trail Ridge Road is a National Park Service photograph,
  public domain with "Full Granting Rights" on NPGallery. Lion Gulch is both
  CC BY 2.0 (Flickr-reviewed) and a USDA work; it is credited as CC BY 2.0,
  which satisfies either. Niwot's Second Avenue is Jeffrey Beall's Flickr
  original at 2,048px; the library listed only 1,024px. The Stanley Hotel's
  Commons geotag is about 15 km off, so that match rests on the building.
- **The library's own checks were not enough.** Its "already used" filter
  missed seventeen photographs already on the sites (the St. Vrain State
  Park sign, Evergreen Lake, Hiwan Homestead 2, five Lyons files, the
  Nederland steam shovel, Severance's 1st Street, the Fort Lupton library,
  Mount Zion, the Clear Creek tubers, Golden (16), Mount Galbraith, the
  tramway and the Lily Mountain reflection), and its register listed pages
  that already had photographs as gaps. Every match was re-read against the
  repository, not the register.
- **Traps, for the next review:** "Parfet-Preserve" is the dinosaur-track
  preserve, not Parfet Park on 10th Street; "Old Fort Vasquez" is in
  Platteville; the "Lookout Mountain Park" file is a Mount Zion hillside
  with radio towers; the Foothills Art Center file is the old church again;
  the file titled "Nederland" is on South Boulder Creek about 7 km
  southwest; "McCall Lake" is not McIntosh or Union; Austin's Old Town
  frame is not the Harmony listing; Windsor's First Methodist Episcopal
  Church is at 503 Walnut, not Town Hall at 301; the second Elizabeth bank
  frame was taken minutes from the one already used. The bighorn rams, Rock
  Cut and `Spring Creek valley.jpg` came round again.
- **Declined, on the owner's delegation:** the Evergreen Library (February
  2020, before the 2024 redesign); paddleboarders for Evergreen with kids
  (the article says boating is closed for 2026); the Longmont Theatre
  Company (a 2010 marquee advertising that summer's shows); City Park in
  Fort Collins (2004, 1,355px); the Front Range from Niwot for Who runs
  what (it repeats the hero); the Cardinal Mill for Nederland's history
  (the article does not name Cardinal, and the file is heavily processed);
  Benson Sculpture Garden's entrance sign (the arts council ask of 4
  October stands). Estes Park's Moving here takes the Big Thompson River
  downtown rather than the Gateway monument, a designed work the US gives
  no freedom of panorama.
- **Held:** a 2015 exterior of the Longmont Museum, until the expanded
  building reopens on 17 October and can be compared.
- **Nothing usable for** Carbon Valley, Johnstown, Timnath, Severance,
  Lyons, Elizabeth or Windsor: highway signs, airliner aerials, 1937 survey
  frames, disaster photographs, people as the subject, and close-ups.
- **Left for the owner:** two pages could borrow a photograph the
  repository already holds, which the one-photograph rule allows for
  articles. The Carbon Valley Regional Library listing has none while
  `carbon-valley-regional-library.jpg` sits on the kids' article, and
  Patios in Niwot has none while two patio photographs sit on one listing
  each.

## The 9 October fresh audit: the Hessie season, productions, one rule for "over"

*9 October 2026.* The fresh public audit (Inside the Towns Fresh Network
Audit, 9 October 2026, crawled the day before) rechecked the forty-three
findings of 7 October, found most corrected, and raised nine new ones,
N01–N09. The owner left the calls in this pass to the editor. It takes the
seven that are code or content (N01–N07); N08 and N09 are the owner's.
Each was traced to its cause in the repository first, and two causes turned
out to reach further than the audit could see from outside.

- **N01, Hessie.** "Before you drive to Hessie" said on 7 October that the
  2026 season had ended. Boulder County's page, read again today, runs the
  free shuttle Fridays to Sundays through October 11, so the article was
  sending readers away from its last weekend. The shuttle section is back
  in the present tense and names October 9 to 11 as the last weekend, and
  the article carries `supersededAfter: 2026-10-12` with a note that the
  season ended on the 11th, so the change of state happens on the day
  without an edit or a rebuild. The mechanism already existed (the Niwot
  election guide uses it); the article had been written as if the date had
  passed. The Hessie listing already said "through October 11" and stands.
- **N02 and N06, productions: one file, one page, every show.** A play's
  nine shows were stored as one span, start to end, and exported as one
  block: Sleepy Hollow as sixteen all-day days, Evergreen's Dracula as
  seventeen, and the regional weekend list showed Dracula on its opening
  Friday only. Events now take `performances`, every show's start in order,
  `start` the first, with an optional note per show ("sold out").
  `occurrences` expands them exactly as it expands a weekly repeat, so the
  day lists, the weekend pages, the newsletter and the calendar feed carry
  each show on its own day at its own time, sharing the page. The page
  lists the shows still to come, each with its own Apple/Outlook file
  (`/events/<slug>/<show>.ics`) and Google link, and its structured data is
  an Event per show, as Google asks of separately ticketed performances.
  The feed's UID for a show carries its time, because a matinee and an
  evening show are two events on one day; every other listing keeps its
  day-based UID so subscribers' calendars see no churn. Five runs are
  converted from their box offices, read today: Sleepy Hollow (nine, with
  opening night sold out), OpenStage's Dracula (twelve), Alice by Heart
  (seven), Evergreen's Dracula (nine) and A Christmas Carol (four). Les
  Misérables stays a run of whole days, because Candlelight publishes no
  show times. The schema refuses a production with `allDay`, `repeat`,
  `recurring` or a run-wide `timeNote`, a `start` that is not its first
  show, shows out of order, or an `end` that spans the run.
  *The N06 call:* separately ticketed nights of one show are performances
  of one indexed page, not files competing as a "series" whose indexed URL
  moves every night. Amy Bruni's two Stanley nights stay two files for now:
  the shows are a week away, the second page becomes the indexed one after
  the 15th on its own, and merging them would retire a URL that is live.
  The next touring pair goes in as one file.
- **N03, a fee is not a seat.** The price reader took every dollar figure
  in a cost line, so "$30 adults, $25 seniors, $20 students, plus a $2
  ticketing fee" was published as an offer from $2. Figures added with
  "plus", ticketing, service, processing, booking and similar fees, and
  suggested donations are now set aside before the range is read; an entry
  or registration fee is still the price, and a free tier still puts zero
  at the bottom of a range, as before. A line whose only figure is a
  suggested donation is free to enter. Run against every cost line in the
  repository, exactly three offers change: the two Evergreen Players shows
  ($20–30 and $15–25) and Nederland's "$5 suggested donation" choir (now 0).
- **N04, and the defect behind it: one rule for "over".** The page and the
  sitemap disagreed about when an event is finished. The page's noindex
  asked whether its end time had passed; the sitemap asked whether its last
  day was before today. A class that ended at 11:45 was noindexed on the
  page and still in that day's sitemap, which is the pair the audit found.
  Behind that, both answered for the *first* date of a file only: a weekly
  repeat's file is its first week, so each of the network's fifty-three
  weekly series (storytimes, trivia, run clubs, bluegrass picks, all running
  into late October or December) was taken for over once its first week had
  passed, noindexed and missing from its sitemap; the hub's search left
  them out too. And
  `pickCanonical` chose the first file of a series that had not *started*,
  so in Lyons the karaoke file running now through December 4 was the
  noindexed repeat of the one starting December 11. Now `finalDay` reads
  the last day of everything a file holds (a repeat's last week, a
  production's closing show), `isOver` asks it by the Denver day, and the
  page, the hub's search and the sitemap all use it; the sitemap's
  raw-markdown reader (`finalDayOf`) is cross-checked against it for every
  event in the repository, as before. The canonical file of a series is the
  first one still on or to come. The audit's other instruction stands:
  deliberate noindex pages stay out of the sitemap, and none were indexed
  to make counts match. Checked in builds of Lyons, Fort Collins and
  Evergreen: every event page's noindex agrees with its sitemap (267 pages,
  no exceptions), and Lyons' sitemap gains the ten weekly series running
  now, four of them in place of a later file of the same series.
- **N05, the civic promise.** The About page and the editorial policy said
  civic information is linked rather than paraphrased, while the Niwot and
  Lyons civic guides summarize it. Both now say what the guides do: a
  summary written here from the official records, linked to each, with the
  record controlling wherever the two differ; notices, agendas and
  official text are linked rather than reproduced.
- **N07, the Census source.** The Fort Collins history cites the 1910
  census for 8,210. The cited page (Volume 1, the national report) answers
  200 today, so the audit's 404 did not reproduce; but the figure is in
  Volume 2, Colorado, page 230, Table IV (places of 2,500 to 10,000), read
  in the PDF today. The link now goes to Volume 2.
- **Left to the owner, and why.** *N08, photographs* for the weakest
  towns' promoted places: a rights and sourcing job, as the catalogs above
  record. *N09, audience and sponsor proof*: Search Console, analytics,
  confirmed-signup rate and a placement mockup cannot be made from the
  repository. *Editorial recommendations not taken here*: shorter
  headlines (Severance's history), one spelling style, lighter hero
  overlays per image, the per-town content assignments and the pilot
  cohort. These are judgment and production calls for the owner, not
  defects.

## A mountain cluster: six towns scaffolded, seasons as months, "Up the hill this weekend"

10 October 2026. The brief: ten mountain towns on the chassis, seasonal
fields on the listing schema, and a strip of the mountain guides' weekend on
the Front Range guides' This Week pages, in one pass. Four of the ten (Estes
Park, Golden, Evergreen, Nederland) were already live; the other six are
new.

- **The six towns are scaffolded, not launched.** Black Hawk, Idaho Springs,
  Georgetown, Grand Lake, Manitou Springs and Leadville each have a config
  (mountain variant, its own palette, census and GNIS figures from the
  Wikipedia infobox and the State Demography Office's historical census
  file, official road and closure links that answered 200 today), a content
  folder, a favicon and a registry entry. Their status is `wave2`: each
  builds a holding page. The brief said to use the Inside domains the owner
  already owns and to ask rather than guess where a domain is not in the
  config; none of the six is, so each config carries a reserved
  `<slug>.unconfirmed.invalid` domain that cannot resolve, with a note to
  replace it before any Vercel project is created. The scaffold's own guess
  (`inside<slug>.com`) was not used: Evergreen and Castle Rock show the
  obvious name is sometimes someone else's.
- **Where the state file and the infobox disagree on incorporation**, the
  state file wins, as for Nederland, and the infobox date is noted in the
  config: Black Hawk 1864 (not 1886), Idaho Springs 1878 (not 1885),
  Georgetown 1868 (not 1885), Grand Lake 1885 (not 1944).
- **Content was gathered under the accuracy rule, not the coverage one.**
  Five of the six towns' official sites (and Gilpin and Lake counties')
  answer automated readers with 403 or reset the connection; only
  Georgetown's answers. Every published file carries a source that was read
  today and the facts on it; anything short of that waits in staging with a
  review line, and a section with nothing verified stays empty. Moving Here
  pages were written only where every claim could be sourced.
- **Seasons as months.** `seasonal` already took `season` text, `hours`,
  `opens`, `closes` and `closedMonths`. It now also takes `openMonths` (the
  months a place is open, three letters or the full name, which may wrap
  the year) and `note` (one line in the operator's words). Set open or
  closed months, not both. Rows, cards and the place page say "Open
  May–Oct" from either, and "Closed for the season; reopens May" out of
  season; the gate already stripped the hours. All of it optional: every
  existing listing parses and renders as before.
- **A season turning is a re-check.** `seasonRecheck` (src/lib/freshness.ts)
  flags a seasonal listing within 14 days of the turn ahead (the report
  horizon) and from the turn behind until `verified` is on or after it.
  The weekly report prints a "Seasons turning" list per town and the
  review's summary counts them, beside the listings going stale. The
  listing's own window is untouched; this is a second reason to look.
- **"Up the hill this weekend"** (src/components/UpTheHill.astro) sits at
  the foot of /this-week/ on a Front Range guide: at most three of the
  live mountain guides' weekend one-offs, one per town (`upTheHillPicks`,
  the Nearby rule with `perTown: 1`), plus a place whose season opens that
  week where there is room, each linking to its page on the mountain
  guide's own domain. The towns are decided by `variant`, not a list, so a
  mountain guide joins the strip when it goes live. Nothing on, nothing
  rendered; the browser prunes what has passed and removes the strip when
  it is empty, as the Nearby block does. Clicks are counted with what the
  sites already use: campaign tags on every link (`utm_source` the guide,
  `utm_medium=up-the-hill`), as the weekly email carries, and one custom
  event per click through the `@vercel/analytics` module Base.astro loads,
  a no-op where analytics is off. No new tool.
- **Domains, the same day.** The owner named five: insideidahosprings.com,
  insidegeorgetownco.com, insidegrandlake.com, insidemanitousprings.com and
  insideleadville.com. Each answered on the owner's Cloudflare nameservers
  (donna and fonzie, the pair every other guide uses) and is now in its
  town's config, with its `hello@` address. Black Hawk's followed:
  insideblackhawk.com, on the same pair.
- **Not done, for the owner.** Vercel projects, DNS and
  deploy hooks for them once named; the hero photographs (the placeholder
  is tolerated while a town is not live); the Moving Here pages where the
  official sources could not be read; and whether the existing mountain
  guides' `neighbors` should name the new towns once they launch.

## The six mountain guides go live

10 October 2026, the same night they were scaffolded, on the owner's word.
None clears its launch threshold; a live town under it publishes what is
verified, and the validator and the weekly report say what it is short of,
as the 3 October rule has it. What going live took:

- **Status and neighbours.** `status: 'live'` on Black Hawk, Idaho Springs,
  Georgetown, Grand Lake, Manitou Springs and Leadville. Every live guide
  but Elizabeth had to have a live neighbour, so the pairs each config had
  proposed were set, both ways: Black Hawk with Nederland, Golden, Idaho
  Springs and Georgetown; Idaho Springs and Georgetown with each other,
  Evergreen, Golden and Black Hawk; Grand Lake with Estes Park; Manitou
  Springs with Castle Rock, which has not launched. Leadville names nobody,
  nothing in the network being an afternoon's drive away. Manitou and
  Leadville join Elizabeth in the test of guides whose Nearby block is
  never built.
- **Hero photographs** from Wikimedia Commons, each read against its file
  page (licence, author, date, categories) and looked at before use: the
  Lace House (Black Hawk; the file's title says Central City, its category
  is Black Hawk's), the Argo mill (Idaho Springs), the town from the
  hillside to the north (Georgetown), a rainbow over the lakeshore (Grand
  Lake), Manitou Avenue (Manitou Springs; the photographer notes the City's
  master plan uses it) and the town in autumn with Turquoise Lake
  (Leadville). Declined: Georgetown from I-70 (a strip whose town sits
  under the hero's crop) and Wolfgang Moroder's 1867 building on Taos
  Street, whose page asks to be told of each use and excludes social
  media. Rows are in IMAGE_LICENSES.csv, credits on the heroes.
- **Favicons** redrawn in the house style, each on the town's accentDark:
  a gulch with a building (Black Hawk), hot-spring steam (Idaho Springs),
  a Victorian gable (Georgetown), peaks over water (Grand Lake), a spring
  and its ripple (Manitou Springs), a headframe (Leadville).
- **The hub's comparison** prints a town's "who it suits" paragraph only
  where one has been written; the six have none yet, so their entry is the
  link to their own Moving Here page.
- **Not done here.** Web Analytics on the six projects (Vercel requires a
  person to confirm it); Moving Here pages for five towns and the
  comparison paragraphs for six; the staged listings.


## Color System 2.0

*10 October 2026.* The owner supplied *Inside the Towns Color System 2.0*
(release 2.0, 9 October 2026): final palettes for the hub and all 24 town
guides, two shared page backgrounds, two shared inks, and a job for each
colour. It is applied as written; no hex was tuned here.

- **Three roles, renamed to match.** `TownColors` is now `primary`,
  `accent` and `paper`. The primary is identity and action: the town name,
  links, eyebrows, active navigation, buttons, the dark bands and the town
  badges, always with white on it. The accent is decoration only: section
  rules, the six-pixel strip at the top of the page, image placeholders,
  blockquote and table rules. It never carries text, an essential icon or a
  control's edge, so it has no contrast to meet. The old `accentDark` is the
  primary's job and the old bright `accent` mostly the new accent's; the
  utilities follow (`text-primary`, `bg-primary`, `border-accent`), so the
  next change cannot use one where it means the other.
- **Two papers, white cards, two inks.** `paper` is `'warm'` (#F7F5F0) or
  `'cool'` (#F2F6F7), as each palette assigns, and nothing else is a page
  surface. The tinted bands and panels (the interior masthead, the home
  page's alternate bands, the hub's town section, the signup box, Moving
  Here's "Still deciding") become the paper or white. That was also
  forced: Golden's primary is 4.66:1 on its paper and the eyebrow in it
  could not sit on anything darker. Body text is #243137 and supporting
  text #526068 everywhere; the old third, lighter ink is folded into the
  supporting one.
- **Interaction.** Buttons darken by 12% on hover (`primaryHover()` in
  `src/config/palette.ts`, 12% black mixed in sRGB, so the page carries an
  exact hex and the check can prove white on it). The guide points to a
  companion stylesheet for exact hover values. The companion reference the
  owner supplied the same day (prepared 10 October 2026) lists the 25
  palettes and the shared neutrals, unchanged from 2.0 and matching the
  configs value for value, and gives no hover values, so the 12% mix
  stands; exact values, if they ever arrive, replace that one function. Focus is a primary
  outline with a white ring, except on the dark bands, which keep their
  white outline. Map pins, filter pills and focused fields use the primary,
  not the accent. Checkboxes take the primary through `accent-color`.
- **Text on the bands is white.** The 2.0 primaries include lighter ones
  (Golden 5.07:1 under white, Lyons 5.96:1), and white at 70–85% fails on
  them; the guide's own checks are white on the primary. The bands'
  eyebrows were the amber and are white too. The network strip under the
  footer keeps white/70 and the amber hub link, both proven on every strip.
- **Links are underlined**, as both documents ask. Only links inside
  `.prose` were: Tailwind's reset leaves an `<a>` undecorated, so the 48
  links set in the primary outside it ("See the full week →", "All events
  →", the official-sources list, and links inside sentences such as "See
  what's on now", where a dark primary was hard to tell from the text) had
  no underline, twenty of them only on hover. Each now carries `underline`.
  Navigation, buttons, whole-card links, the footer's lists and the
  ink-coloured lists of towns are left as they were.
- **The amber stays for meaning, not decoration**: dated notices, "Our
  pick", and the hub's name in the strip. It is gone from the top strip and
  the eyebrows, where it would have been a 26th colour on every guide.
- **`npm run check-colors`** is rewritten for these roles: each primary on
  white and on its paper (it reproduces the guide's table exactly), white
  on each primary and on its hover shade, the primary on the amber wash,
  both inks on both papers, white and the wash, the strip, the category
  hues on both papers and white, and no two guides sharing a primary. All
  26 configs pass.
- **Favicons** keep their marks; each tile, and the tint derived from it, is
  repainted in the new primary, and the link moves to `?v=4`. Golden's tile
  is now gold itself, and its gold baseline and arch band fell to 2.35:1
  against it, the only one under 2.5:1; on Golden both are the lighter
  amber #F8C265 (3.16:1), so the gold stays gold and stays visible.
- **Castle Rock is in neither the guide nor the companion sheet.** It is
  wave 2 and not live; it keeps
  its rose in the new roles (its old dark shade as primary) as a
  placeholder, flagged in its config, and needs a palette before launch.

## A shorter town menu (10 October 2026)

- **Five sections, then Towns.** The owner found eight items in the row too
  many. Events, Eat & Drink, Things to Do, Guides and Moving Here stay. This
  Week and Directory leave the row, not the site: the home page opens on the
  week ("See the full week") and links "All places", every article ends on
  "This week in [Town]", the Thursday email links /this-week/, and the
  events page has its own "This weekend" filter. Both are also linked under
  the tagline in every guide's footer. URLs are unchanged.
- **"Towns" stays, set apart.** It is the only way from one guide's header
  to the others, so it keeps its place but sits at the far end of the row
  beside search, where it reads as the way out rather than a sixth section.
  The phone menu is unchanged: "Other towns" is still its last row.

## The launch handoff, read against the guides

*10 October 2026.* The owner supplied *Inside the Towns Launch Handoff*
(a Word document prepared the same day): original copy for 261 places, 33
itineraries and 55 FAQs across the six new mountain guides and the five
guides with the fewest places (Severance, Fort Lupton, Timnath,
Nederland, Elizabeth), 29 photo records, per-town private notes on
address conflicts, and instructions for Claude Code. Its own first
instruction is to follow the project's rules, and the 7 October content
pack set the method: the packet is a set of leads, not a source.

- **Every place was read again on its own page.** One researcher per
  town worked from a shared brief, matched each record to the published
  and staged files, and wrote nothing that a business's or agency's own
  page, read that day, did not say. Robots.txt and `Content-Signal`
  opt-outs were honoured as before (coloradosprings.gov for the Incline,
  pplibraries.org, the Leadville Herald, FareHarbor). Nothing from the
  packet went into `verified`, and its copy was not used: bodies are in
  the house voice, from the operator's page, ending on what was read
  where.
- **What changed.** Published places on the eleven guides went from 147
  to 221; staged from 52 to 96. Idaho Springs (24), Manitou Springs (24)
  and Grand Lake (19) now clear their listing thresholds; Georgetown has
  17, Leadville 21, Black Hawk 11. Nederland, Timnath and Elizabeth had
  every packet place already; 17 of their listings were corrected
  (Brainard Lake's 2026 timed entry and its October 2–16 road closure,
  Timnath Reservoir's resident-only permits, Catrina's suite, Mountain
  Man's source, which had become a password page, Running Creek Park now
  read from the Town's own page). Lakeview Park in Severance is
  temporarily closed on the Town's 19 August notice. Eight articles:
  Explore guides for the six mountain towns, from the packet's
  itineraries with published stops only, and "out of season" guides for
  Leadville and Georgetown with `supersededAfter` dates in 2027. The
  Front Range guides got none: every packet itinerary repeated an
  existing Explore, history or with-kids guide.
- **Second sources.** Where an operator's page carried nothing dated
  within the year, the README's second source was used: the town's or
  City's business directory (Idaho Springs' visitor site, Leadville's
  Restaurants & Bars and Retail Merchants pages, Georgetown's Where to
  Eat) or the chamber's member listing (Grand Lake, Manitou Springs, Fort
  Lupton). A directory page that shows its own date more than a year old
  was not counted: Buckskin Trading (Georgetown) went back to staging and
  out of the Explore guide. A site that has visibly not been kept up was
  not trusted for hours even with a directory behind it: Main Street
  Restaurant (Idaho Springs; Covid notice, 2019–24 footer) is staged.
  Catrina's unit and phone were corrected from its own page but its
  check date stays at 2 October, since nothing dated or independent says
  it is open. A weekday and month with no year ("Friday, October 30") is
  not a date: the Black Hawk casinos stay staged, and Adam's Mountain
  Cafe rests on the chamber, not on its "closed Tuesday, September 8"
  notice. Leadville's five businesses on the City's undated lists are
  published on that list; the owner may want them called.
- **Not listed, on the 6 October rule.** The Central City Opera House and
  the Gilpin History Museum (Central City). The Census geocoder settled
  two borders: Windsong Estate (2901 Saddler Blvd) is inside Severance;
  Arapaho Bend's address is inside Fort Collins (see below). The packet's
  "nearby excursions" that are federal, state or county land reached from
  the town are listed with `area: "Nearby: …"`.
- **The packet's errors**, each against the page that says otherwise:
  Treeline Kitchen is 615 Harrison, not 615A; Mein House has no suite;
  Point Park's 1121 Third Street is a tourism site's (the Town gives two
  other numbers); Columbine Corner's own page says 614 Sixth St; the
  South Platte Valley Historic Park is in Fort Lupton, not nearby; the
  Argo now sells from mightyargo.com at $32.95; Barr Trail's figures and
  Red Mountain's length trace to aggregators; Timnath Beverage, which the
  packet doubted, has an October 2026 tasting list; Windsong Estate is in
  Severance's slice, not Timnath's. Several of its sources cite this
  network's own pages.
- **Photographs.** Of nine exact-place photos, four went on published
  listings after a read of the Commons file page and a look: the Argo
  mill (public domain), the Hamill House and the Tom Bennhoff Lake Trail
  (Jeffrey Beall, CC BY 4.0) and Leadville's depot (Larry Lamsa, CC BY
  2.0). The Steamshovel and the Elizabeth bank were already on their
  listings; the Hotel de Paris and the Penny Arcade wait with their
  staged listings; Beau Jo's 2012 interior, dim and full of diners'
  faces, was declined. The twenty town-context photos were not used: the
  heroes chosen this morning stand.
- **Sites that answer now.** The official sites of Idaho Springs, Grand
  Lake, Black Hawk and Leadville refused automated reads this morning and
  answered this afternoon; their configs say so, and Leadville's
  `leadville-co.gov` is confirmed as the City's by its own footer. Lake
  County's site answered too, which published the Mineral Belt Trail.
- **For the owner.** `docs/archive/CALL-LIST.md` has a new section: every staged
  listing from this import with its number and question, and the
  published ones left with a question. Decisions only the owner can make:
  whether a business with no phone may publish (World's End Brewpub, the
  Folk School, the South Platte Valley Historic Park); whether a weekday
  date without a year counts (it would release Ameristar, the Lodge,
  Bally's and their restaurants once hours are confirmed); and three
  border cases already published before this rule was tested on them:
  Arapaho Bend (Timnath, inside Fort Collins), Two Bridges Trail
  (Elizabeth, in Franktown) and Garden of the Gods (Manitou Springs, a
  Colorado Springs park). The Gilpin History Museum's staged file is
  marked not to be promoted; delete it if preferred.
- **The handoff document stays out of the repo**, like the content pack's
  viewer: a brief, not content.

## The owner's answers on the handoff's open questions

*10 October 2026, the same evening.* The owner answered two questions and
left two to the editor.

- **No phone is not a bar to listing** (the owner). A business or agency
  that publishes no phone may be listed without one; its website, address
  and hours must still come from it, and the evidence rule is unchanged.
  The Rocky Mountain Folk School (a class-only venue, like FREIGHT, with
  no hours line), the South Platte Valley Historic Park, City on a Hill
  Coffee and the Outlets at Castle Rock (re-read today; its hours page
  dates the 2026 holiday closures) moved up. World's End Brewpub (no
  weekly hours), Mod Mountain Boutique, the ECR Cafe and Inkwell & Brew
  (nothing dated, no second source; each re-read today) stay staged with
  their reasons rewritten.
- **A weekday and date with no year count** (the owner) when they fall
  on that weekday in the current year, as "Friday, October 30" does in
  2026. Ameristar and its Fireside Kitchen and Timberline Grill, Bally's,
  and the Lodge and its White Buffalo Grille moved up, the casinos
  without an hours line as the Monarch's published listing has none.
  Black Hawk now has 17 places and clears its listing threshold. Saratoga
  and its Main Street Cafe stay staged: an "October Special" names no day.
  The README's rules at entry and the content README say both rulings.
- **Places across a town line follow the 6 October rule** (the editor).
  "Castle Rock is Castle Rock" already kept Castlewood Canyon (Franktown)
  off Elizabeth, so the three listings published before it was tested on
  them follow it too, and no URL breaks:
  - Arapaho Bend Natural Area, whose address the Census geocoder puts
    inside Fort Collins, moved to the Fort Collins guide, which did not
    list it, with its photograph and ledger row. insidetimnath.com's old
    URL 301s to insidefortcollins.com's page, and Timnath's Explore and
    with-kids guides link there. Fossil Creek's entrance is unincorporated
    and stays in Timnath.
  - Two Bridges Trail (8038 Bayou Gulch Road, Franktown) and Garden of
    the Gods (the City of Colorado Springs' park, published that morning)
    are in staging, marked not to be promoted, and their URLs 301 to
    Things to Do. Elizabeth's with-kids guide still names Two Bridges as
    a longer walk outside town, linked to Douglas County's page, beside
    the Town's own Running Creek trail; its Running Creek lines now follow
    the Town's page. Two Bridges' permissioned photograph stays in the
    folder with its ledger row. Manitou's Trunk or Treat event at the
    Garden of the Gods visitor center (25 October) was left as it is.
  - The rule as applied: a place inside another municipality or named
    community belongs to that town; where it has a live guide the listing
    moves there, otherwise it waits in staging. Unincorporated federal,
    state and county land reached from the town stays, labelled Nearby.
- **Leadville's City lists stand as a second source** (the editor). The
  README names the town's business directory, the City keeps these
  lists, and the mountain window brings all five businesses back for a
  re-check within thirty days; a call before then is welcome, not
  required.

## Event structured data, read against Search Console

*10 October 2026.* Search Console listed Events notices on Estes Park (7),
Fort Lupton (6) and Severance (1), and a note proposed five template rules.
All the notices are warnings, and the pages stay eligible. The markup comes
from one builder, `eventJsonLd`, so what changed, changed for every town.

- **An address in its parts.** The whole line, town, state and ZIP
  included, went into `streetAddress`. A line that ends in a town and the
  state is now split, with the ZIP as `postalCode` (520 of 891 address
  lines). A bare street or a set of directions stays the street line in
  the guide's town, as before. Place pages use the same helper.
- **Every event has a picture.** Four listings in 964 had one. The rest now
  give the town's hero, the file their share card already used.
- **The organizer's site from its own listing.** Where an event names an
  organizer with no site and the guide lists a place by that exact name
  (Estes Valley Library, Tabor Opera House), the place's site is used: 54
  events. Not the `source` link, which is often a box office (lctix.com)
  or a chamber calendar, and not the venue as the organizer, which the
  schema already rules out as a guess. The other 152 need each site looked
  up and added as `organizerUrl`.
- **Not done, on purpose.** No `validFrom` from the publication date: it
  means the day tickets went on sale, which no listing records. No
  `availability` claimed for ticketed events nobody checked. No offer for
  a listing with no cost line: Severance's listings say "Free" when the
  source does, and the existing price rule then gives a zero price. A
  "Ticketed" line still gives an offer without a price until the price is
  read off the ticket page. `endDate` was already emitted wherever a
  listing has an end. A `performer` field waits for a decision on whether
  to record it.

## The listings behind the event structured data

*10 October 2026, later.* The owner asked for the rest of the Search
Console work done, so the gaps the code could not fill were researched
listing by listing on the organizers' own pages and applied in one pass.
Every value has a page behind it, and where none was found the field
stays empty.

- **Cost lines.** 254 lines across upcoming events, from 437 with no cost
  down to 194. "Free" only where the organizer says so, on the event's
  page or in a policy on its own site: the High Plains, Poudre River,
  Clearview and Longmont library policies ("All library-sponsored
  activities are free and open to the public") cover their programs.
  **A public meeting of a government body is "Free"** (a ruling made
  here, for the owner to overrule): council, trustee, commission and
  board meetings are open to the public at no charge under Colorado's
  open meetings law, and the listing already says what the meeting is.
  Prices are copied from the ticket page, tiers and fees as the page gives
  them. Where a fee would read as a ticket ("$2.05 fee", "$2 off"), the
  line was reworded so `offerPrice` does not offer a seat that does not
  exist. "Free before 9 pm for 21+" was left out: as a price it says free
  to everyone. A "price: 0" in a page's hidden data, with no word on the
  page, was not taken as free. Severance has 7 of its 8 upcoming events
  priced; Town Christmas says nothing about cost and stays empty.
- **Organizer sites.** 151 events, 76 organizers, as `organizerUrl`, each
  loaded and checked against the organization's name; a department's own
  page where the organizer is a department (Firestone Police, Fort Collins
  Natural Areas). Olde Golden Holiday Committee has no site of its own and
  has none.
- **Performers.** A `performers` list (name; person or group) on 100 event
  files, 85 series, from the listing's own words: concerts, plays by their
  company, talks by their speaker. None for festivals, open mics, classes,
  screenings, exhibitions or anything whose act is not named. An act whose
  kind could not be told (Revital, an opener) was left off.
- **What the research turned up.** Two cancellations confirmed on the
  organizer's page are marked canceled: Berthoud's Historic Preservation
  Advisory Committee on 12 October and Boulder County's Las Barracas tour
  on 10 October. Fort Lupton's ofrenda viewing night moved to 2 November
  and was corrected from the library's page. Ten conflicts between
  sources (a date, a time, a venue, a page gone) carry `changeFlag` and a
  `changeNote` for the weekly review, and nothing else about them changed.
- **Not done.** `validFrom` and ticket `availability`, as before. The 194
  events still without a cost have no published price that could be
  found; most are weekly programs and meetings whose pages say nothing.

## The owner's rules of 11 October

*11 October 2026.* The owner supplied a second content handoff (prepared by
Codex against 56c0021: a patch, 18 photographs and a review report) and,
reading it against the guides, found the entry rules "hurdle after hurdle to
finish adding content even when it is accurate". The owner agreed this set the same
morning; the README's rules at entry and the content READMEs say it.

- **Loosened.** A business's own Facebook or Instagram page counts as its own
  page. Google Maps showing a place open is a second source that it is open,
  never for its hours, prices or phone. A series the organizer states as a rule
  ("the second and fourth Wednesday") may be listed on the organizer's word. A
  mountain listing stays up 60 days from its check and its hours 45
  (`src/config/freshness.ts`; it was 30 and 30, which hid accurate listings
  faster than the rotation reached them); the Front Range stays at 90 and 60,
  and the rotation at 30. A place in a neighbouring town with no guide of its
  own may be listed as `area: "Nearby: <town>"`. An article publishes once it
  is accurate and sourced, to be deepened later. A content handoff is
  spot-checked, about one item in five against its source and every photo
  licence, and accepted on its own reading when no more than one checked item
  in ten has a material error; its wording stays after an edit for voice, and
  `verifiedBy` names who read it. Where a source refuses automated reads, a
  handoff's recent reading stands until the weekly rotation reaches it.
- **Kept.** A source and a check date on every item; never a review site or an
  aggregator for hours or prices; expiry; staging with a reason; marking, not
  deleting; a parked or hijacked domain read as closed; strict photo licences;
  and no working around a site's bot check (a headless browser was tried
  against Black Hawk's Cloudflare check this morning and stopped at the owner's
  word).

## The 11 October handoff, spot-checked

*11 October 2026.* The handoff's 221 changes: 48 event files, 15 new places
(four from staging, seven lodgings), additions to 63 existing listings, 12
history and with-kids articles for the six mountain guides, five Moving Here
pages (Georgetown, Grand Lake, Idaho Springs, Leadville, Manitou Springs) and
Black Hawk's revised, 11 calendar sources, 18 photographs, and 24 staging
files resolved.

- **The check.** 73 text items (16 mountain events, 12 Front Range events, 15
  new places, 19 expanded listings, six articles and the five Moving Here
  pages) and all 18 photographs, against their sources. Eleven text items
  could not be read: the City and Town sites of Black Hawk, Grand Lake,
  Leadville, Manitou Springs and Elizabeth, and the Ameristar, Toast and Mash
  Lab pages, answered with Cloudflare's 403. Of the 80 readable checks, five
  were material errors, about one in sixteen, under the threshold, so the rest
  was accepted on the handoff's reading.
- **The errors, fixed.** Beau Jo's Evergreen's Prairie Pie is not "thinner"
  on its menu; Golden Gate Canyon's campground office is closed for the season
  (older text gave 10 to 5); the Georgetown history called the 1874 school the
  Heritage Center, which it has not been since 2023 (it is The Old School);
  the Manitou history cited a mineral-springs URL that now redirects to an
  image; and the Kauffman House photograph is CC BY-SA 3.0, not 4.0. Smaller
  corrections: the Lyons artisan market's address (338 High St, the north gym
  entrance), the book groups' pages name no title, the Columbine Garden Club's
  November page says Tommyknockers, not its back room, and the Heritage
  Museum's Sunday films are free.
- **Photographs.** Sixteen kept, each with alt text redone from the Commons
  page's date and what is in the frame (a Georgetown Loop coach, not the
  Devil's Gate depot; the Hidden Treasure Trailhead bridge, which the City's
  page gives as Maryland Mountain's access). Two declined: Beau Jo's Idaho
  Springs interior is the dim, crowded 2012 photograph already declined on 10
  October, and the Grand Lake Lodge entrance is washed out with two visitors
  as its subject (and was 2010, not 2012). The "Photograph:" lines the handoff
  added to bodies are gone; the credit is shown with the image and on
  /credits/, as on every other listing.
- **Calendar sources.** The handoff marked eight feeds confirmed. Two answer:
  the Clear Creek County library district (Georgetown and Idaho Springs) and
  the Manitou Springs Heritage Center. The City and Town calendars of Black
  Hawk, Grand Lake, Idaho Springs, Leadville, Manitou Springs and Windsor
  answered 403 to our check, so they are back to `proposed` with the feed URL
  kept and the call list asking for a look in a browser.
- **Staging.** Cooper's on the Creek published with its hours block (Sunday
  included) and a line that the footer leaves Sunday out; it is on the call
  list. The Manitou Incline published on the handoff's reading of the City's
  page, which opts out of automated reads, with Visit Colorado Springs and the
  Cog Railway confirming the reservation, hours, no-pets rule and parking.
  Before & After and Bar 8042 rest on pages that now block automated reads.
  The other deletions were past dates, Johnstown storytimes folded into one
  series file, a Messy Art already published, and trash pickup notices.
- **Edited for voice.** Research notes and defensive asides were cut from the
  handoff's prose ("This is the dated event window, not a claim about…",
  "Visit details: the operator's page", a clinician disclaimer on a Moving
  Here page); the frontmatter reformatting on existing listings was undone
  where the value had not changed. `verifiedBy` reads "Claude Code, delegated
  by James Lerner" on the 33 items re-read today and "Codex, for James Lerner"
  on the rest.
- **Not taken.** The handoff's own report (`docs/CONTENT-COMPLETION-2026-10-11.md`)
  stays out of the repo, like the earlier briefs. Its verification register
  (`docs/archive/VERIFICATION-QUEUE-2026-10-11.csv`), the rebuilt photo contacts sheet
  (now every open listing without a photograph) and its call-list rows are
  kept, the call list rewritten for the new rules.

## Severance and Fort Lupton become sections

*12 October 2026.* The owner brought an outside recommendation to narrow the
network: pause Severance, Fort Lupton and Elizabeth, put Black Hawk lower,
and put the effort into eight guides, Niwot, Longmont, Erie and Lyons first.
Read against the guides, the editor proposed folding the two thinnest into
the neighbours they already lean on, keeping Elizabeth up but quiet with a
date to decide, and keeping everything else. The owner's answer: "do all of
the ones that would make sense."

- **What the guides showed on 11 October.** Severance: 16 open places, 3 of
  them businesses, 9 events in the next 30 days, and articles that name
  Windsor 49 times. Fort Lupton: 20 places, 8 businesses, 11 events, 7 of them
  at the library. Elizabeth: 25 places, 15 businesses, 24 events; thin on
  nothing but distance. There were no traffic figures to weigh against this:
  Vercel Web Analytics is not on for the guide projects (the API answered
  "Web Analytics not found" for Severance and Lyons), and Search Console is
  the owner's to read.
- **Severance is a section of Inside Windsor.** Windsor's config lists
  `subTowns: ['windsor', 'severance']`, which gives it /severance/ and a
  "Where" filter on its events and place lists, as Carbon Valley has. The
  validator wants a `subTown` on every event and place of a multi-town guide,
  so every Windsor item, staged item and source now says `windsor`. Severance's
  16 places, 12 events, 8 staged items, 3 articles and 13 sources moved into
  `content/windsor/` with `subTown: severance` and their slugs unchanged, and
  Bruce's Bar's photograph with its ledger row. Its Moving Here page is now
  the article *Moving to Severance*, with a line on where it sits and the
  sidebar's listings named in the text, and Windsor's own Moving Here page
  links it. The driving-order article called Windsor "the sister guide"; it
  now points at Eat & Drink on the same guide. The tagline names both towns;
  the figures stay Windsor's.
- **Fort Lupton is a section of Inside Carbon Valley**, a fourth, rather than
  "Nearby" listings as first proposed: every item on a multi-town guide needs
  a `subTown` whatever it is labelled, and the old domain needs a page to send
  its home to. 20 places, 14 events, 5 staged items, 3 articles, 11 sources and
  2 photographs moved; two sources were renamed where Carbon Valley already
  had the id (`weld-gov-fort-lupton`, `highplains-libcal-com-fort-lupton`,
  with the `sourceId` lines that cite them). It is not a coal town and has
  its own library and school district, so the name and the figures stay the
  three Carbon Valley towns'; the tagline and short tagline add Fort Lupton,
  and the SEO line keeps three names because a home title has no room for a
  fourth (the towns test caught it). Its Moving Here page is now *Moving to
  Fort Lupton*.
- **The two domains redirect, path for path.** Each config is
  `status: 'redirect'` with a new `foldedInto` (guide, section page, date).
  Thirteen host-scoped rules per domain in `vercel.json` keep the path for
  events, places and articles, filter the list pages to the town, send
  Moving Here to the new article and the calendar and RSS feeds to the new
  guide's, and send `/` and the rest to the section page
  (docs/REDIRECTS.md). Unlike insidefirestone.com, each domain stays on its
  own Vercel project, which goes on building from this repo and serves the
  rules before its one page is reached, so nothing changes in the dashboard;
  both projects' `www` already 308s to the apex (read from Vercel today).
  That page, the holding page, now says where the guide went, and each old
  folder keeps its hero and a README for it. `test/folded-towns.test.ts` holds
  config, sections, content and rules in step.
- **Across the network.** Nobody lists the two as neighbours any more
  (Windsor, Timnath, Fort Collins, Longmont and Carbon Valley did), and the
  hub and every guide's sister links count 22 guides. The hub's Moving page says
  where Severance's and Fort Lupton's figures went. The "Where" filters said
  "All three", true only of Carbon Valley; they say "All". The weekly report
  skips a folded town.
- **Elizabeth is quiet until 15 November.** A new `quiet` on the config (since,
  decide by, why) keeps a live guide out of the weekly routine: no email
  signup on its pages, no box for it on any other guide's or the hub's
  (`emailTowns()`), no Thursday draft, and one line in the weekly report with
  the days left. Its pages stay up and its listings stay accurate as far as
  the rotation reaches. 15 November is before any of them loses its hours:
  the five checked on 18 September lose them on 17 November and drop off on
  17 December, the rest in December and January. Keep it, and the field comes
  off; fold or retire it, and the Severance pattern applies, though no live
  guide is near enough to take it.
- **Not done, and why.** Black Hawk's lower priority is the order of the
  weekly session, not code. Castle Rock stays `wave2`: opening it would undo
  the reason Elizabeth went quiet. The "every Thursday" signup stays on the
  other 21 guides: no issue is in `content/hub/issues/` yet, and whether the
  email is going out is the owner's to say. Buttondown may hold subscribers
  tagged `severance`, `fort-lupton` or `elizabeth`; moving them to `windsor`
  and `carbon-valley`, and telling Elizabeth's, is the owner's in Buttondown.

## Regional editions and visitor guides

*12 October 2026.* The owner brought a second recommendation: combine the
work, not the coverage. Shared email, calendar and advertising for Timnath
with Windsor, for Idaho Springs with Georgetown and, more tentatively, for
Johnstown with Loveland; Black Hawk a focused visitor guide with no weekly
publication; Leadville and Manitou Springs lower-priority visitor guides;
Estes Park and Grand Lake kept apart. Read against the guides, the editor
agreed with all of it but one reading (Timnath shares an email with Windsor
but keeps its site: its schools are Poudre, Fort Collins' district, and its
config names Fort Collins first) and proposed the build below. The owner:
"Yes."

- **What the guides showed.** Black Hawk: 14 of its 20 listings belong to four
  casino companies (Monarch 7, Ameristar 4, the Lodge 2, Bally's 1), so few
  separate buyers for a placement, and none of its 16 sources is confirmed.
  Idaho Springs and Georgetown: their source registries share the county, the
  library district, the recreation district, the school district and the
  Forest Service ranger district, and Visit Clear Creek is proposed in Idaho
  Springs'. Windsor (with Severance) 45 places, Timnath 18.
- **Editions.** `newsletter.editions` on the hub config names three shared
  editions; every other guide the email covers is an edition of its own
  (`src/lib/editions.ts`, `emailEditions()`), fifteen in all. A shared
  edition is one Thursday draft with each town's listings under its own
  heading ("Windsor and Severance" for a guide with sections), one signup
  box and one sponsor line (`sponsor` on the edition, else the network's).
  Subscribers stay tagged by town, which Buttondown can already filter on,
  so an edition goes to every tag in it and a reader who ticks two of its
  towns gets one email. On a guide the box for its edition is ticked and
  posts that guide's own tag, so the tags still say where readers came from;
  on the hub a shared box posts its lead town's tag. The hub's `?towns=`
  link ticks an edition box when any of its towns is named (`data-towns`).
  An edition whose other towns stop being covered falls back to its one
  remaining town, so nobody is sent an email named for a town it no longer
  reaches.
- **Visitor guides.** A new `visitorGuide` on the config (since, why) for
  Black Hawk, Leadville and Manitou Springs: no weekly email, signup box or
  draft, and no thin-calendar warning, but unlike `quiet` they stay in the
  weekly report, labeled, because a mountain listing expires sixty days from
  its check.
- **Advertising.** /advertise/ names the shared editions and says each is one
  email slot while on-site placements stay by town; a guide's /for-businesses/
  names its edition, and a guide with no email no longer offers an email line.
- **Not done.** No sites or domains merged, and no shared calendar page: each
  guide's /events/ already reads its own listings, and the hub's This Weekend
  already reads all of them. No sponsor or price was set. Sending is the
  owner's in Buttondown: fifteen editions a week is still a lot for one
  person, and starting with fewer (the four priority guides, say) needs no
  code, only fewer sends.

## The filter rows on a phone fade where they are cut

*12 October 2026.* The owner sent a phone screenshot of Erie's events page:
the "When" row had been swiped, so a sliver of "Today" sat hard against the
label and the chosen "Anytime" was out of sight, and every row ended in a
button cut in half at the screen edge. The rows stay one sideways-scrolling
line on a phone (wrapping put seven lines and more before the first listing,
and the day strip alone would take five), but they now say where they are
cut: a row fades on an edge only when there is more beyond it, and the
chosen button is scrolled into view on load and whenever the choice changes,
so a link to `?category=sports` opens with Sports showing
(`src/lib/scroll-rows.ts`, `.filter-pills` in global.css). Without the
script the rows are the plain scrollers they were; from 40rem they wrap and
none of it applies.

## A correction from Lyons Classic Pinball: last Sundays, no women's league

*13 October 2026.* The owner wrote on 12 October (hello@lyonsclassicpinball.com):
the monthly tournament moved to the last Sunday of the month almost a year
ago, there is no women's league and no monthly women's tournament, nothing is
on 14 November, and the shop's events page (lyonsclassicpinball.com/events)
is the record. The 15 October league night and the 25 October tournament
were right, and so were the hours.

- **What changed.** The listing's lead loses the women's league; its body now
  reads "a monthly tournament on the last Sunday and a Thursday-night league".
  Hours, holidays and phone were re-read on the shop's hours page the same
  day and match, so it carries a 13 October check and now its phone. The
  three second-Saturday tournament files (10 October, 14 November, 12
  December) are deleted: the owner says those dates are not theirs, and the
  events page lists none of them. One entry in the public corrections log.
- **Where it came from.** The listing was written on 17 September from the
  town's visitor site, in the same session that took the tournaments from
  the Lyons Recorder's community calendar; the event files cited the
  Recorder. On 13 October the Recorder still shows a "Monthly Pinball
  Tournament" series on Saturday 10 October. Pinside's venue page reportedly
  carries the same second- and third-Saturday pair and may be where the
  Recorder got it; that page refuses automated reads, so it was not checked
  here. The three women's tournament files already in staging stay there.
- **For next time.** A Recorder series at a venue that has its own events
  page is a lead, not a source: the venue's page decides.

## Two reviews of 13 October: what was taken, what was not

*13 October 2026.* The owner handed over two documents, an independent
network review (16 findings, 14 copy edits and a set of search titles) and
an implementation brief (trust fixes, mobile layout, new listings), with the
instruction to decide item by item and change only what stands up. Every
factual change below was re-read against the source the same day; a source
that refused the robots-aware reader was left alone, as the 11 October rule
says.

- **Taken, and re-checked.** The Museum of Discovery's youth ticket is ages
  2 to 12 on the museum's admission table (its sidebar still says 2 to 18),
  and its old `/visit/` link now points at the admission page. LaVern M.
  Johnson Park is sourced to the Town's own park page, loses "the best
  picnic spot in town", and carries the Town's winterization notice and
  capacity rule as a dated `access` block. Niwot's 2027 Fourth of July says
  its organizer's page still describes the 2026 program. Hall Ranch no
  longer says its lot is full by nine: the County's page says 64 spaces and
  nothing about when they fill. Timnath's 11,600 is attributed to Wikipedia,
  where the citation actually is, on three pages. The Black Hawk Moving Here
  page names its public lands instead of calling "the land around town"
  public, and its research notes are cut to what a reader can act on.
- **Events.** Home-page highlights now rank every one-off, however far off,
  ahead of any regular; a weekend storytime used to outrank a festival three
  weeks out. Georgetown's three book-group files carry one title and
  "Monthly", so they read as the series they are. Twelve school-team games
  (Berthoud, Niwot, Timnath) are deleted under the brief's rule that
  school-team competitions are not events; the college games stay as
  "qualifying big home games". "Daily, 24 hours" reads "Open 24 hours"
  instead of "closes midnight". The editorial page describes how repeats
  are actually stored.
- **The hub.** The six mountain guides have their "who it suits" paragraph
  and their school district, written from their own Moving Here pages; the
  table has the elevation column every guide's Moving Here page promised,
  and says what a dash means. The network calls itself Colorado's Front
  Range *and* mountain towns, and "one site per town" is gone, since two
  guides cover a few towns each. The advertiser page says the Nearby block
  is on the guides with a neighbouring guide, on weekends with something
  on, instead of "all 22", and quotes the audience the way the review
  suggested; the newsletter page says which guides have no edition and why.
  Windsor's directory counts "Windsor and Severance".
- **Listings.** Five places added from their own pages: Nederland Community
  Center, Leadville's Community Park & Fairgrounds, Una Vida in Niwot, Muddy
  Buck Coffee House in Evergreen and the Estes Valley Community Center
  (whose Sunday hours its page gives two ways, so it carries none). The
  Carousel of Happiness, the Wheel House and the two Niwot trails carry what
  their operators publish on access, the bike shop and the County's trail
  rules. Dutch Henry Sledding Hill waits in staging; Caribou Ranch already
  did, since 6 October, with a closure-date question the brief did not know
  about, and that file stands.
- **Search titles.** Articles may carry a `seoTitle` for the `<title>` and
  share card when the headline leaves out the town or the question; 26 do.
  Home-page titles and H1s are unchanged: every live guide's title already
  names the town and the state, and the review's "Your guide to X,
  Colorado" would flatten the voice the brief asked to keep. Carbon
  Valley's title still omits Fort Lupton: four names and a state do not fit
  65 characters, and `/fort-lupton/` carries its own.
- **Not taken.** Oskar Blues' hours: the brief reports new closing times,
  but oskarbluesfooderies.com answers 403 to every automated read, so the
  listing keeps its 17 September hours and the owner should check by eye
  or phone. The Little Thompson Observatory (starkids.org answered 503) and
  the Manitou Creek Walk (the City's page answered 403) were not added. The
  photo finding (585 place pages with no image) needs photographs, not
  code. The brief's mobile redesign of the directory and home page is not
  done: the hub home was reworked for the phone on 7 October and the
  directory's introduction is already one sentence. The family-guide
  decision boxes and the relocation-slogan rewrites beyond the two
  verdicts changed here are editorial work for a session with the sources
  open.

## The network audit of 14 October: what it saw, what was wrong, what changed

*14 October 2026.* The owner handed over a 23-site network audit written
the same day from pages read as extracted text, with a scorecard, fourteen
network-wide issues, a table of about forty fact findings and a "what to do
first" list. Each item was checked against the repository, the live sites
and the primary sources before anything moved.

- **The audit read old builds.** About a third of its findings were already
  fixed on `main` by the 13 October commits: the Timnath growth figure, the
  Centennial Cone season, the newsletter typo, the Georgetown multi-day
  listings, "Every restaurants" in the directory description, the Oct 6
  Elizabeth meeting, the Windsor stop count, the Rocky Horror dates. The
  live pages fetched today are current (Lyons and the hub built at 03:49 UTC
  on 14 October, Timnath and Elizabeth at the 13 October nightly, the hub's
  weekend page reads 16–18 October), the scheduled rebuild has succeeded
  every day since 5 October, and Vercel serves every HTML page with
  `max-age=0, must-revalidate`. Nothing in the repository or the deploy
  settings reproduces the week-old pages the audit describes; the likeliest
  cause is the audit tool's own cache. The Vercel deployment list could not
  be read from this session (403), so the dashboard is where to confirm.
- **Already there, invisible to a text reader.** Organization, WebSite,
  Event, LocalBusiness, Article, BreadcrumbList and CollectionPage JSON-LD
  are on every page (three `ld+json` scripts on a Lyons place page); the
  `&amp;` in a title is correct HTML escaping; the "doubled" hero tagline,
  nav label, teasers, day chips and contents lists are the phone/desktop
  pairs (`sm:hidden` / `hidden sm:inline`), of which a browser and a screen
  reader see one; the Estes meta tags carry no prefix. No template change
  for any of these.
- **Owner decisions the audit asked to revisit, left standing.** No named
  editor (8 October); "Longmont · Inside the Towns" (a magazine already
  publishes as Inside Longmont); fifteen signup boxes (the editions, with
  the quiet and visitor guides out by the 12 October rules); a production's
  shows and a council's meetings listed on their days.
- **Template changes.** Check dates on rows and cards and About's "Last
  checked" carry the year ("Checked Oct 3, 2026"). Meta descriptions end
  at a sentence when one closes past the halfway mark instead of "…"
  mid-phrase. The footer carries the network's address, and a multi-town
  guide's footer and About link every government (`officialLinks.also`:
  Carbon Valley now links Frederick, Firestone and Dacono). An imported or
  ingested event whose title ends in the start year no longer doubles it
  in the slug (`eventSlug`); existing slugs are URLs and are not renamed.
  Leadville's tagline says what the town is known for, the highest
  incorporated city in the US at about 10,150 feet (GNIS 10,154, the City
  10,152). Niwot's config carries the two post-vote taglines as a comment.
- **Facts changed, each re-read today.** Loveland: the authority's board
  offered the chief's post to Paul Claflin on 22 September (Fire
  Engineering). Erie: median household income $173,349, 2020–2024 ACS;
  the coal era is "a century" (1876–1978), not eighty years. Evergreen
  Lake is 55 acres on the district's own page, not 40. Longmont Museum
  carries its regular hours from the 17 October reopening and the
  admission from the City's fall brochure. Estes Park's Bustang line says
  the route is seasonal and resumed for 2026. Windsor's three districts
  read as three. Nederland's carousel line no longer implies the carving
  ended before the opening. Berthoud's and Timnath's income lines say
  which survey they come from; Timnath's is the 2009–2013 ACS, flagged as
  old (the Census API wants a key and QuickFacts blocks automated reads,
  so no newer figure is given). The Stampede grounds' area line says Hwy
  86. Dominic's is "at the same address as" Black Sheep, since both
  businesses' own pages give 19 South Parish.
- **Findings checked and found sound as written.** Berthoud Brewing's
  Berthoud taproom is 450 8th St with hours on the brewery's site; Kofe
  House and the Source Zero share 434 Mountain (the Source Zero is Unit D,
  added); City Star and Wishful Living share 321 Mountain; the Leadville
  Railroad's own page says "October–April we run weekly rides"; Timnath's
  11,600 is Wikipedia's 2025 figure, cited to the Census Bureau; the Estes
  spirits festival's $53.16 and $5.91 child ticket are the Town's own
  page's, so they stay (Visit Estes Park says $53.17); Black Hawk's two
  Halloween Saturdays are two dates on the City's calendar; Golden's
  Monster Mash page already states the hosts' conflicting hours.
- **Three listings out of staging.** Indian Hot Springs, Two Mile Brewing
  and the Cog Railway publish with address, phone and hours read from
  their own sites, opened in a headless browser because the pages render
  only with scripts; none refused the reader, so the 11 October rule on
  sources that refuse automated reads does not apply. Hotel de Paris
  timed out again; Eldora, the Energy Museum, Saratoga, World's End, the
  Nordic Center and Little Bear keep their staging reasons.
- **Not done here.** Search Console and Bing verification and sitemap
  submission for 23 domains are account work the owner does once. The
  rest of the mountain additions (the Black Hawk casinos, Georgetown's
  museums, Grand Lake's winter calendar) and the big-city restaurant depth
  are content sessions with the sources open.

## The footer, 14 October

The owner, looking at Longmont's footer, said it needed work. What was
wrong with it, and what changed:

- **Sister guides in columns.** From `sm` up the 21 sister guides ran as
  one "name · tagline" per line, a single column down the left half of the
  strip, taller than the footer above it, with each town's name the same
  white/70 as its tagline so nothing said which words were the links. Each
  guide is now its name, in white, over its tagline in white/70, in columns
  A to Z down each: three from `lg`, two from `sm`. At 1280px the list is
  seven rows instead of twenty-one. The list itself stays, as the owner
  chose on 5 October; the colours are the strip's own (white/70 and the
  amber hub link are unchanged, and the names in full white only raise the
  contrast, which `check-colors` still passes).
- **No triangle where the list cannot close.** The summary is not
  clickable from `sm` up, but Chrome and Firefox still drew its disclosure
  triangle there; it is hidden from `sm` up. On a phone the list still
  ships open and the script closes it, as on 8 October, and the triangle
  now shows there in Safari too, which had hidden it at every width.
- **"Get in touch" holds what it says.** It ran to ten links, the last four
  of them (About, Editorial policy, Photo credits, Privacy) not ways of
  getting in touch. Those four have their own column, "This guide" ("This
  site" on the hub). The footer is four columns from `lg`, two from `sm`.

## Elizabeth stays, 15 October

The quiet of 12 October set 15 November as the day to decide whether to
keep the guide. The owner decided on 15 October, on the one number that
had not been looked at: Vercel Web Analytics counts 148 visitors and 308
pageviews on insideelizabeth.com in the four weeks to 15 October, more than
Golden (84), Fort Collins (101) or Timnath (104) and in Longmont's band
(123). The reason it went quiet was about selling, not reading: an hour
from every other guide, so a visit, a photograph or an advertiser there
combines with nothing. That is still true, so it stays quiet, with no
weekly email and no signup box, and its listings are kept by the monthly
pass like a visitor guide's. There is also nowhere to fold it: Castle Rock
is a holding page, so "fold" would have meant "close", and closing a guide
with a hundred and fifty readers a month to save a monthly check is the
wrong trade.

What is left to decide, on 15 November, is only whether it rejoins the
weekly email. `decideBy` stays at that date, which is before the
first of its listings loses its hours (17 November). Two stale pull
requests were closed the same day: #13 (Codex, 22 September, no common
history with main, everything it proposed since built differently) and
#34 (2 October, whose facts about Bradford's and Cassidy's had already
landed).

## The review runs on its own, 15 October

The owner asked for this week's queue to be reviewed and for the review to
run by itself from here on ("run review automatically if possible"). The
standing rules are in `scripts/lib/auto-review.ts`, pinned by
`test/auto-review.test.ts`, and the Monday workflow runs them after ingest.

**What approves without a person.** A staged event from the organizer's own
confirmed feed (a town, county, library or parks calendar, or a venue's own;
a chamber's or a paper's calendar lists other people's events and waits),
with a venue that is a place (not a PO box, a Teams link or a one-word room
with no address), a date ahead and within 400 days, no word of cancellation
or postponement in the organizer's own text, no published listing with the
same title that day, and not held back by the editor. A change the same feed
made to a listing's time, venue or status is written in; a change to the day,
to a weekly series, or from another site waits. Staged places never approve
here: every one is held for a reason that needs a site read.

**What the published file says.** Ingest asks for the organizer's
description to be rewritten in the guide's words. A rule cannot write, so the
body is one sentence built from the feed's fields (title, venue, day, time,
free or not, who listed it) and then the organizer's first sentences as a
quotation that names the organizer. The guide never passes the organizer's
copy off as its own, and never adds a fact the feed did not carry.
`verifiedBy` names the feed, the day it was read, and the run.

**One guess undone.** Ingest's category is a keyword guess; "board" made a
game night civic. A civic guess on a title whose board is a game is set to
`other`, which claims nothing. Every other guess stands and the page shows it.

**The 15 October run.** 58 events approved and one change applied (the City
of Longmont's own site moved its Day of the Dead celebration from downtown to
the Longmont Museum; the listing came from the recreation calendar and the
change from the museum's, one site, so the rules count it as the organizer's).
By hand, as the owner's delegate: the Town of Lyons's calendar times applied
to two of its meetings; the Babytime change dismissed because the listing
already says 11 am; twelve staged copies of Johnstown's Music & Movement
Storytime replaced by one afternoon series file (the feed lists a 1 pm
session on seven Mondays; the 10 am copies were the published series again);
four trash-pickup schedules, a library closure notice, a past second session
and an owl walk the County had already canceled rejected. What waits is in
the pull request body and in `npm run review -- --summary`.

**Why not an LLM rewrite.** The research agent (`agent/`) could rewrite each
description on the Claude API. It would read better and cost a few cents an
item, and it would also be a second author whose sentences nobody checks
before they publish. The quotation is dull and honest; the agent can be added
later as a step the owner reads.

## Niwot's tagline, 16 October

- **"A town that never incorporated" is gone.** It was the Niwot hero subtitle
  and its line in the network bar, and with incorporation on the November 3,
  2026 ballot it read as a settled fact the vote could overturn. The tagline
  now names the vote and its date, which stays true after the count: "Old
  Town, the trails, and the incorporation vote of November 3, 2026". The two
  pre-written lines for the result are unchanged.
- **/moving/ says "Niwot is unincorporated"**, not "has never incorporated",
  and its ballot link names the date instead of "in 2026". This reverses the
  14 October choice to leave Niwot's wording untouched while the vote is
  pending. "How Niwot got here" keeps "It has never been an incorporated
  municipality": it is history, and the next sentence says November 2026 may
  change it.

## The rules read against each other, 18 October

The owner asked for the whole repository read through once, every rule,
automatic check and workflow against the others, before more is built on
it. Every check was green at the start (382 tests, the validator at 0
errors, the colour check, `astro check`, the manager's syntax check) and
the rules themselves agree with each other; what did not agree was the
machinery in four places, each fixed here.

- **The re-check's flags never reached the review.** The README and the
  nightly workflow's pull request both say a listing the source contradicts
  carries `changeFlag` with the evidence in `changeNote`, "which `npm run
  review` walks". The review read only `staging/changes/*.json`, which
  ingest writes and the re-check does not, so the Pumpkin Plunge's 404 of
  17 October, and the two flags a person wrote by hand on 10 October, were
  in no queue and no report: a flagged listing stayed out of the picks and
  the email until somebody happened on the file. The queue now carries a
  `flag` item for a published event with the flag and no change file,
  sorted with the changes; the card shows the note; `a` says the listing
  now reads as the source does (edit it first with `e` if not) and clears
  the flag with today's check; `r` clears the flag and touches nothing
  else; `A` skips a flag, since it is evidence against the listing and not
  a read of it. The review's summary, the weekly report and the validator's
  per-town line count them (`flagged`). `test/review.test.ts` pins it.
- **The call list rang venues a person had just rung.** The re-check put a
  venue on the pull request's call list whenever its page refused a
  machine or did not show the date, including an event already carrying
  the `confirmed` block that `npm run confirm` writes for exactly that
  call. Oskar Blues, whose site answers 403, would have been on the list
  the night after every call. The decision is now one function
  (`callReason`, scripts/lib/recheck.ts): a listed event is a call, a
  series about to run out of confirmed weeks is a call, and otherwise a
  page no machine can read is a call only when no person has confirmed
  the event inside the sixty-day window. Tested.
- **A switch that said the opposite of the rules.** `INGEST.
  autoApplyCancellations: false` (4 October: "nothing publishes without a
  person") was read by nothing, and since 15 October the standing rules do
  write a cancellation in when the listing's own organizer feed makes it.
  The flag is gone; the ingest script's header and the config say where
  that decision lives. The dated entries above stand as history.
- **The manager's list of towns was a copy with no check.** `manager/
  towns.json` says "if the two disagree, the repo config wins" and nothing
  made sure they did not. `test/manager-towns.test.ts` holds it to the
  configs: every live guide listed live with its domain, a folded town's
  domain an alternate of the guide that took it, a quiet or visitor guide
  said so in its notes. The notes themselves were wrong on one point: they
  told the audit agent to expect no This Week on Elizabeth, Black Hawk,
  Leadville or Manitou Springs, when the 19 October weekly notes were
  published on all 22 live guides the day before. Quiet and visitor guides
  drop the email and the signup box, not the week; the notes say so.
- **Smaller.** The content skill marked an unverifiable fact `[VERIFY: …]`
  where the editor skill, which the same agent reads, says `[UNVERIFIED]`;
  one marker now. The Front Range content READMEs listed the place types
  without `trailhead`, which every guide may use. An unused import in
  `scripts/auto-review.ts`.
- **Read and left alone.** The six workflows agree with the scripts they
  run and with DEPLOY.md (the rebuild's 32-minute wait against the Ignored
  Build Step's 30; the ingest and re-check pull requests; the Thursday and
  Wednesday drafts). `manager/schedule.mjs`'s budget shape
  (`max_list_cost`) matches the Managed Agents documentation read today.
  The freshness windows, the confidence levels, the standing rules of
  auto-review and the owner's rules of 11 October are consistent with one
  another and with the README. The two hand-written flags of 10 October
  (Longmont's fire station open house, Niwot's artist-in-residence) and the
  Pumpkin Plunge are all for dates now past; their flags were cleared the
  same day at the owner's word, with nothing else on the files touched.


## Merging the Thursday email sends it, 18 October

*18 October 2026.* The owner: "I want it to be so I don't have to remember to
run anything just merge the pulls", and, asked whether that should take in
the email, which was still pasted into Buttondown by hand, "ok I will add key
to GitHub for butto[ndown]". So the send is a merge, as the ingest, the re-check and the
weekly editor already are, and nothing goes out on a timer.

- **The pull request is the issue.** The Thursday drafts workflow now writes
  each edition straight into `content/hub/issues/`, validates it, and opens a
  pull request on `automation/newsletter` instead of committing to `main`.
  Its body is `npm run send-newsletter -- --dry-run`: every edition and the
  subscriber tags it goes to. Reading it there, or on the hub's preview
  deployment, is the read before sending that `scripts/newsletter.ts` asks
  for; an opening line is an edit on the branch.
- **The merge sends.** `.github/workflows/newsletter-send.yml` runs on the
  push to `main` and hands `npm run send-newsletter` the issue files that
  push added (an edit to a sent issue's page is not a second email). Each
  goes through Buttondown's API with `status: about_to_send`, to subscribers
  carrying any of the edition's town tags, a town folded into one included
  (`severance` gets Windsor's), the network issue to `all-towns`.
- **What it will not do.** Send to an empty audience: Buttondown reads an
  empty filter as every subscriber, so an edition whose tags nobody carries
  yet is skipped and said to be. Send an issue more than a day past its
  date, when "this weekend" has started. Send twice: each email carries its
  file name as slug and metadata, and a re-run leaves those alone. Without
  `BUTTONDOWN_API_KEY` it sends nothing and the run fails; the Thursday pull
  request opens as a draft until the key is set, so no unsent issue can be
  merged into the archive. The weekly editor cannot write under
  `content/hub/`, so a page it reads cannot slip an issue into its pull
  request.
- **Not done.** Issue numbers stay optional and unset: fifteen editions and
  a network issue a week do not share one count, and the archive orders by
  date. Buttondown's own archive is left at its default.

## The Niwot Business Association's calendar is a source, 20 October

The owner asked why the arts association's tree-carving appeal on niwot.com
was not on Inside Niwot, then asked for niwot.com, the Niwot Business
Association's site, to be a source, on the editor's judgment.

- **Why the appeal stays off.** It is a donation drive for the carvings'
  shelter on the Lobo Trail, which the calendar repeats every Tuesday as an
  all-day entry with no time or place. That is not an event under the
  standard (docs/archive/AUDIT-2026-10-02.md). It is excluded by title.
- **The feed.** The calendar is Modern Events Calendar. Its site-wide iCal
  feed is switched off, but /events/feed/ is RSS with the plugin's own
  elements (`mec:startDate`, `mec:startHour`, `mec:endDate`, `mec:endHour`,
  `mec:location`, `mec:category`), one item per event at its next date.
  The RSS reader now reads that dialect beside CivicPlus and LibCal, with a
  test. The feed holds ten items; on 20 October they reached July 2027, so
  it is the whole calendar for now.
- **Filed as chamber, not venue.** The board carries other groups' events
  too, and the unattended review approves only organizer categories, so
  nothing from it publishes without a person. Another group's event is
  confirmed on that group's own page, as before.
- **Also excluded:** Trivia Night (The Wheel House's weekly regular, listed
  from the venue) and the Hormone Health Small Group Medical Program (an
  enrollment clinic program at a day spa: a promotion).
- **Duplicates.** Enchanted Evening, the First Friday Art Walk and the
  Holiday Magic Market Fayre matched their listings by title. The Holiday
  Parade did not ("Niwot's Annual Holiday Parade"), so its listing now
  carries the feed's id; the feed agrees with it on day and time, and its
  "Downtown Niwot" is read as a guess, which flags nothing.
  The 21 October cemetery talk was rejected once: its listing is from the
  Historical Society's own page (to 8:30; the board says 8), and it is past
  before the next Monday ingest.

## Sources with events to pull from, across the towns, 20 October

The owner asked for a search across the towns for sources that carry many
events and qualify as niwot.com did: the organizer's own calendar, or a
community board filed as one, with a feed the robots-aware reader may read.
Five researchers probed 45 hosts on 20 October, each host through the
helper and never past a bot check, and the editor read the town
calendars left proposed on 11 October. What came of it:

- **Twelve feeds confirmed.** Black Hawk's City calendar (CivicPlus iCal,
  catID 24; the path the 11 October handoff recorded answers 404, the site's
  own iCalendar page gives the real one); Berthoud's City Star Brewing
  (tribe REST, 133 occurrences a season, the food-truck rota and the weekly
  regulars excluded); Fort Collins' Lincoln Center (ShoWare, 132
  performances), CSU Music, Theatre and Dance (Events Manager iCal; the
  studio recitals, webinars and college cross-posts excluded) and Bohemian
  Live Music (tribe REST; its iCal is 410); Loveland's Rialto (ShoWare, 55
  performances; the hourly ghost-tour slots excluded); Niwot Hall's rental
  calendar (Modern Events Calendar RSS, the hall's "Featured Event" category
  only); Windsor's parks department on recreationliveshere.com (CivicPlus
  iCal; closures and the leaf drop excluded) and Peculier Ales (MEC RSS, the
  Fort Collins taproom and the regulars excluded). Dry runs after linking
  the listings each feed already covers: Lincoln Center 55 new, City Star
  27, Bohemian 21, CSU Music 17, Rialto 15, Windsor parks 2, Dance 2,
  Theatre 1, Niwot Hall 1, Peculier 1, Black Hawk 0; one change to a
  published event (the dance concert's end time, the department's). The Monday ingest stages them; the venue feeds are
  organizer feeds, so the unattended review may approve from them.
- **Two readers and two filters added.** `scripts/lib/feeds/showare.ts`
  reads a ShoWare box office's performance list, the JSON the ticket site's
  own page loads (the Rialto and the Lincoln Center; each site's page size
  is counted, not assumed). A source may now carry `includeCategories` and
  `excludeCategories`, the feed's own category names, because a hall's
  public events and a brewery's food trucks are marked by category, not
  title. Ids are matched on the registrable domain, so tickets.lctix.com and
  www.lctix.com are one site.
- **Linked, not duplicated.** The Rialto's 16 future listings, the Lincoln
  Center's 16 and Black Hawk's two festival days carry their feed ids, found
  by matching start times; the feed now tracks them. The Rialto feed marks
  the 23 October Zeppelin show cancelled, which the listing already says.
- **Blocked, and left alone.** Five town sites behind Cloudflare: Grand
  Lake, Idaho Springs, Leadville, Manitou Springs and Windsor (windsorco.gov);
  the 11 October handoff's "read and parsed" notes on their feeds came from
  a read that got past the check, which the owner's rule forbids. Also
  csurams.com (Incapsula), larimer.gov, and three robots refusals: the
  Lyons Recorder (44 listings cite it; nothing from it can be refreshed by
  machine), Poudre Libraries' calendar and downtownfortcollins.com's data
  host. Tockify's and Squarespace's feed paths are disallowed where their
  pages are allowed, which rules out Wildfire Community Arts Center, Mighty
  River Brewing, Timnath Beerwerks, The Rock Garden and The Old Mine (whose
  Google Calendar is on a disallowed host); seven Windsor and two Timnath
  listings cite those disallowed URLs and want re-sourcing by hand.
- **Readable but not worth a reader now.** The City of Fort Collins'
  OpenCities JSON (titles and times, no place or page, and 110 of 177
  entries are board meetings), the Aggie Theatre's Webflow page (45 shows;
  Fort Collins is over target), the Windsor and Erie chambers' GrowthZone
  boards (one fetch per event), Elizabeth Main Street's Locable board (the
  library's programmes), New Belgium's Humanitix page. Anderson Farms' iCal
  lists the festival's daily entertainers, which the festival listing
  covers; the Elbert County Marketplace iCal titles every date "2026 Season"
  and the eight dates are listed already; Clear Creek County's calendars
  hold closures; the Niwot Rotary's iCal is club meetings. Each is noted in
  its registry entry or here for the next pass.
- **lyonscolorado.com is retired:** an alias of the Town of Lyons' site,
  not a chamber.

## A seventh catalog: three photographs from four lists, 20 October

The owner supplied four photo lists for Niwot, Lyons, Golden and Erie: a
Flickr report (eighteen photographs cleared on licence and place, fourteen
for Golden and four for Lyons, none seen by its author) and three Wikimedia
Commons spreadsheets with a README (Erie 33, Golden 93, Niwot 9, each looked
at and rated). The README also describes a Lyons spreadsheet that was not
among the files. Every entry was read against `IMAGE_LICENSES.csv` by
Commons file and Flickr photo id, and against the places, articles and
Moving here pages that have no photograph. Each one used was read on its
live source page, looked at, cropped to 3:2 and saved at 1,600px with no
metadata, with one ledger row.

- **Most of it was already here.** Nine of Erie's 33 files, nine of
  Golden's 93 and three of Niwot's nine are on the sites. Three of the
  Flickr report's four Lyons photographs were already in the repository as
  unused files (the post office, the National Guard evacuation and the
  Planet Bluegrass grounds): the report checked the `/credits/` pages,
  which list only photographs in use. Check the ledger, not the credits
  pages.
- **Added: three.** Lions Park in Golden, which had none: the park's sign,
  a bronze lion on a brick pillar with a plaque to Roy Claar of the Golden
  Lions Club (Billy Hathorn, CC BY-SA 3.0). It is from July 2010, kept for
  a reason: a permanent monument with the park's name on it, still at the
  southeast corner in a Golden Today photograph of 2 May 2023, and the only
  open photograph of the park. Lookout Mountain Park, which had none:
  "Buffalo Bill's view looking down to Golden" (Cathy Cline, CC BY-SA 3.0,
  June 2010), downtown and the brewery between the two mesas, the view
  docs/PHOTO-PRIORITIES.md asks for. Its companion frame, taken two minutes
  later, is described as from the top of Lookout Mountain, and the alt text
  says that much and no more. Golden's Moving here shows a similar view from
  Lookout Mountain Road; a page may, and the two are different photographs.
  And Lyons's Moving here, the one flagship Moving here page without a
  photograph: the post office behind its red sandstone sign (Shannon McGee,
  CC BY-SA 2.0, July 2013). The repository's 700px copy, `post-office.jpg`,
  was replaced in place with Flickr's 1,600px copy rather than saved twice;
  the post office reopened after the 2013 flood (USPS, 31 October 2013).
  The same photographer's Oskar Blues photograph was credited to the
  account name, ShanMcG213; all three credits now read Shannon McGee, the
  name the account gives.
- **Traps**, for the next review: the Foothills Art Center file is the old
  church at Washington Avenue and 15th Street, with 809 15th Street on the
  sign, the Creative Campus and not the 1133 Arapahoe Street address the
  listing gives (the third catalog to offer it). Chris Light's 2017
  "Lookout Mountain" views were taken at the Nature Center, as two of the
  file names say, not in the park.
  Steven Miller's 2015 "Lookout Mountain" frames look west into the
  foothills; two are geotagged 300 and 900 m west of the museum, and
  nothing in any frame ties them to the park. Golden (5) by Michael Stokes is on both
  lists, once from Commons and once from Flickr.
- **Not used, on purpose.** The National Guard evacuation photograph (Lyons
  2 on the Flickr report): the evacuees, a baby and small children among
  them, are its subject. The Planet Bluegrass grounds and Ralph Price
  Reservoir: both pages have a photograph. Ralph Price is Button Rock's
  reservoir, as the dog-hikes article's City of Longmont source says, but
  Button Rock bans dogs, so it does not lead that article either. All
  fourteen Golden Flickr photographs: each would go on a page that has a
  photograph, or on Things to do, Eat & drink or Guides, which have no
  photograph slot. In Niwot, the Front Range from Niwot repeats the hero
  (declined 8 October); The Eagle Catcher is a 750px silhouette from 2015
  that says only "in Niwot", three years before the sculpture park opened;
  the rest is an aerial, a creek outside Boulder, a 2013 flood scene,
  SparkFun's offices and a 2005 basement. Erie and the rest of Golden are
  alternates of places with a photograph, subjects with no page (Lincoln
  School, the 1888 church, the Vaughn house, the cemetery, Marfell Lakes,
  the Astor House, the Mines buildings, the Cabrini Shrine), the Puritan
  Camp kitchen and children (declined 30 September), and historic prints
  and postcards.
- **Still without a photograph:** in Golden, Apex, Parfet and Vanover, the
  Golden History Museum, the Foothills Art Center and every business but
  one; Erie's businesses and the Wise Homestead; Niwot as before. The
  Flickr report's ten unread Niwot leads were opened afterwards: eight are
  all rights reserved and two are CC BY-NC-ND (Wally Gobetz's Arapaho
  monument, which is in Boulder, and a lightning shot), and the one CC BY
  Niwot Market photograph is a blurred frame of basement pipes. Ken Lund's
  38 Golden photographs and Jeffrey Beall's Clear Creek were not opened.

## The eighteen-town Commons lists, the other fifteen towns, 20 October

The owner supplied the rest of the Commons spreadsheets behind the seventh
catalog's README: one list per guide, eighteen in all (Niwot's was sent
twice, identical). Erie, Golden and Niwot were reviewed under *A seventh
catalog*; this pass covers the other fifteen, about 400 rows, under the
same rules. Each row was read against `IMAGE_LICENSES.csv`; each one that
could fill a page without a photograph was read on its live Commons page,
looked at, and compared with every image in the repository; each one used
was cropped to 3:2, saved at 1,600px with no metadata and given one row.

- **Already on the sites:** sixty-three rows, most of all in Johnstown (6
  of 10), Berthoud (5 of 8), Elizabeth (4 of 7) and Lyons (9 of 33). Estes
  Park's rows 8 and 9 are the same file.
- **Added: twenty-four.** Manitou Springs, six: the Cog Railway (a 2024
  train below the summit station, CC0), the Cliff Dwellings, the Incline
  from the Barr Trail bailout, Williams Canyon for Cave of the Winds, the
  Cliff House and its drive, and the 700 block of Manitou Avenue for the
  walking article. Idaho Springs, seven, where only the Argo had one: the
  Charlie Tayler Waterwheel for Water Wheel Park, the Citizens Park
  fountain, the library's Carnegie building, the Beau Jo's building, Echo
  Lake for the Mount Blue Sky byway, Miner Street for Moving here and the
  Hanchett Building for the walking article. Grand Lake, six, where only
  the Kauffman House had one: the Visitor Center (2024), the north-shore
  beach for Lakefront Park (its geotag is on that shore), Shadow Mountain
  Lake from Green Ridge Campground for the Arapaho National Recreation
  Area, the Grand Lake Lodge entrance arch, the waterfront from the air
  for Moving here and Grand Avenue for the walking article. Leadville,
  two: Harrison Avenue at Seventh Street for the walking article and at
  Fourth Street for Moving here. Estes Park's history gets the USGS
  photograph of its main street in 1912; Nederland's, the 1939 Army aerial
  of Barker Dam, cropped to the print; Lyons's, the National Guard
  checkpoint at the St. Vrain bridge on 16 September 2013, set in the
  flood section with its caption. The archival frames say so in their alt
  text and credit.
- **Older than 2012, kept for a reason:** the Cliff Dwellings (2007,
  rebuilt stone that does not change, and the only open photograph of the
  dwellings themselves; the 2026 file is a view out of a doorway), the
  Cliff House (2007, the only open photograph of the hotel's front),
  Williams Canyon (2009, a canyon), the waterwheel and the Citizens Park
  fountain (2010, fixed structures), the Grand Lake Lodge arch (2010, the
  same entrance), and Manitou Avenue and Grand Avenue (2010) on walking
  articles, dated in the alt text.
- **Traps**, for the next review: Windsor's "West ariel" was taken on the
  same flight as the Windsor hero and looks the same; its "Windsor Town
  Hall" files are the old town hall, now the Art & Heritage Center, not
  301 Walnut. Fort Collins's "North Fork Cache la Poudre" is at Dale Creek,
  far upstream of Gateway Natural Area. Loveland's events center still
  reads "Budweiser Events Center" on its front (2008), and its 4th Street
  scene is the one centred on a bronze, left out on 4 October. The Estes
  Park Taffy Shop file's subject is the staff at the wrapping machine, as
  in the fifth catalog. Leadville's "visitor center" file shows a house
  whose sign names something else. "Mount Elbert from the valley" names its
  author only as "me", which a BY-SA credit cannot carry.
- **Not used, on purpose:** Benson Sculpture Garden (copyrighted
  sculpture, the rule of 4 October); the Armstrong Hotel
  (behind its street trees); the Incline's base and bailout frames (people
  as the subject) and the 2013 summit train (a different train from the
  one in the 2024 photograph); the Echo Lake Lodge (a
  business; the lake stands for the byway); Leadville's 1896 Ice Palace
  (a place listing shows the place now, and no article is about it);
  RockyGrass performers, the Lyons flood-recovery frames with named
  people, Homestead Meadows (11 miles out) and Peaceful Valley; 1937
  survey aerials, low-resolution Timnath frames and Garden of the Gods,
  which is not in Manitou Springs.
- **Left for a check:** the Great Western Sugar effluent flume (Jeffrey
  Beall, 2016) stands on the Poudre half a mile west of Timberline Road;
  if the Poudre River Trail passes it, it can be that listing's photograph.
  The Longmont Museum's 2015 exterior stays held: the expanded building
  reopened on 17 October and there is still no current photograph to
  compare it with.
- **Nothing usable for** Windsor, Loveland, Longmont, Johnstown, Berthoud,
  Elizabeth, Timnath or Fort Collins beyond what the guides already show.

## A per-place search of nine guides, 20 October

*20 October 2026.* The owner supplied a search made outside the repository:
259 places across Niwot, Lyons, Golden, Erie, Berthoud, Estes Park,
Longmont, Loveland and Nederland, each looked up on Wikimedia Commons and
in Wikipedia page images, with a CSV of the result per place and a summary
that offered five photographs as usable and three as weak. It was made
without this repository, so it could not see the rulings above; each
candidate was read against them and against the live Commons record.

- **Added: two trailheads**, under the fifth catalog's rule that a
  trailhead's photograph is of where its trail goes. Sprague Lake, beside
  its own parking area (Axan77, CC BY 4.0, July 2022, cropped from a
  portrait frame), and Bierstadt Lake, where the 1.5-mile climb from its
  trailhead ends (K. Lee, CC BY-SA 4.0, August 2005; a lake, which does
  not change, dated in the alt text). Elmschrat's 2010 view from the
  Bierstadt Lake trail was the alternative: it shows the Glacier Creek
  valley from the climb, not the lake the trail goes to.
- **Already ruled on, and the rulings stand:** the Foothills Art Center
  file (the fourth catalog to offer it; the frame shows the Washington
  Avenue and 15th Street sign, the Creative Campus, not 1133 Arapahoe
  Street); the Longmont Museum's 2015 exterior (held until it can be
  compared with the expanded building); Benson Sculpture Garden
  (copyrighted sculpture, the rule of 4 October); the Taffy Shop (a
  worker is the subject); Lawn Lake (declined 8 October); the Blue Arena
  (Budweiser signage); the Lyons Depot Library, which is already on the
  Lyons guide for Sandstone Park and Who governs Lyons and is not the
  library at 451 4th Avenue.
- **Not used, on purpose:** Vanover Park's sign (800 × 600, undated, the
  sign alone); Parfet Park (a Clear Creek view from the Washington Avenue
  bridge that does not show the park); Golden History Museum (History
  Park's cabins, as before).
- **Still left for the owner:** Brownfield's 2009 storefront, offered a
  second time; nothing newer is on Commons.
- **No free photograph for the other 246**, which agrees with what the
  searches above found. The routes the report suggests (permission
  emails, a walk with a camera, the towns' parks departments) are already
  written up in docs/PHOTOS.md and the email drafts beside it.

## Search Console, 20 October 2026

- **Annual-event pages stay on the expired-event rule, for now.** The first
  Search Console read (docs/archive/SEARCH-CONSOLE-2026-10-20.md) showed that the
  name of an annual event is the biggest single query on most guides, and
  that the page is noindexed the day after. A permanent page per festival
  would carry its ranking from year to year, but the numbers do not yet earn
  the change: festival-name queries were about 1,650 of the guides' 26,081
  impressions and about 55 of 614 clicks over 28 days, and most of what they
  would gain is next year's. The clean fix is not cheap either: `category`
  does not mark the annual ones (Pumpkin Pie Days is a `market`, Boo on
  Briggs a `festival`), the schema has no annual flag, an indexed past page
  needs a visible "this edition is over" notice, and the expired-event rule
  is an acceptance criterion in docs/archive/ACCURACY-SYSTEM.md. Revisit with a year
  of data, when the second edition of each festival can be compared with the
  first. Until then the interim is editorial: file next year's occurrence as
  soon as the organizer names the date, and `src/lib/big-dates.ts` links it
  from `/events/` so the "[festival] 2027" searches land.
- **Cassidy's Sports Grill is back on the Johnstown guide.** Its former
  website now redirects elsewhere, so the listing sat in staging while its
  page drew 270 impressions and returned 404. The owner confirmed it is open
  on 20 October 2026; its own Instagram is the `source`, which the content
  rule allows, and the hours stay as they were read on 18 September 2026,
  with the page saying so and asking readers to call. `added` is today, the
  day it went back on the guide, as `npm run review` would have stamped it.

## The 90-day test, 20 October 2026

- **Expansion and technical work stop; three guides get the next 90 days.**
  The network has 22 live guides, 614 search clicks in the 28 days to 17
  October, two issues pasted into Buttondown by hand (8 and 15 October), no sponsor asked, no partner agreed. The code is
  not the constraint; the human work that has not started is. The decision,
  taken by the owner on 20 October 2026: no new towns, no new features and
  no SEO work for 90 days, except the one rule that drops a place page
  entirely when its check is overdue, if the owner asks for it. The other
  guides stay live on the ingest, the nightly recheck and the standing
  automation, with no hand work.
- **The three towns, chosen on evidence.** Niwot: the owner lives there, and
  it is third on search. Lyons: the one chamber relationship that exists,
  so the one place distribution can be tested. Berthoud: the best search
  performance in the network (133 clicks, 3,571 impressions in 28 days)
  and a town of 10,000 with no good calendar of its own. Golden and Erie
  are next, on automation until one of the three proves the model.
- **The product is the Thursday email; the site collects the address.**
  Search Console says readers arrive by the name of an event or a place,
  so the site's job is to rank for those and turn the reader into a
  subscriber. One labeled sponsor line per town, in the email and on the
  site, three-month minimum, at a founding price with a number in it.
  Sponsors get a plain monthly report of sends, opens and clicks. Nothing
  else is for sale until a sponsor renews.
- **The clock starts with the first automated send, not today.** The
  Thursday drafts arrive as a pull request from 22 October
  (`.github/workflows/newsletter-drafts.yml`); merging it sends. Day 90 is
  counted from the first Thursday a Niwot edition goes out that way,
  22 October 2026 if that one is merged, so day 90 is 20 January 2027. Targets at day 90:
  12 consecutive weekly editions per town; 200 confirmed subscribers in
  Niwot, 150 in Lyons, 150 in Berthoud; one institution per town sharing
  the email; two paid sponsor pilots; one renewal. Workload capped at ten
  hours a week. The scorecard is docs/90-DAY-TEST.md, one row a week.
- **The decision at day 90.** A renewal and two of three subscriber
  targets: repeat the model in Golden and Erie. Readers but no sponsor:
  fix the offer, with a budget and a deadline. Neither: the network stays
  live as a portfolio and community project at zero marginal hours, and
  stops being run as a business. The search question is separate and
  earlier to answer: three months of Search Console data, so late January
  2026, with a holiday season in it, says which guides rank for what
  matters.
- **What the assistant does and does not do.** Drafts every email, every
  outreach message and the sponsor offer; keeps the contact record; pulls
  the search numbers each Monday; fills the scorecard. Sends nothing,
  publishes nothing, prices nothing. The send, the call, the meeting and
  the price are the owner's.

## The signup's tab is the browser's, 20 October

*20 October 2026.* The owner put an address into the signup at the foot of a
page and got an empty tab; back on the page it said "Finish signing up in the
new tab". Since 13 October ("The signup says what it can see", above) the
script had opened that tab itself, empty, cleared its opener, and then posted
the form into it by name, so that a blocked tab would be known before
anything was sent. Chromium carries the post into the tab; the empty tab
says at least one browser did not, while the page went ahead as if it had.

- **The form posts with its own `target="_blank"`**, as Buttondown's embed
  does, and the browser opens the tab the way it opens a link's. A tab the
  reader asked for with a press is not a pop-up, so the blocked-tab notice
  and its "Continue in this tab" are gone with the code that needed them.
  Buttondown's page sends `Cross-Origin-Opener-Policy: same-origin`, so it
  still gets no handle on this page.
- **Kept:** a town is still required on every form, a double click still
  sends once, and the page still says what is left to do in the tab, with
  "Open the signup tab again" (a fresh press of the same form) and "Change
  your details".
- **Checked** in Chromium against the built component, with Buttondown's
  address answered locally: one tab with the provider's page in it and the
  address and town tag posted, the reopen link, the town rule, a double
  click. Not checked in Safari, which this container does not have; the
  owner's next signup there is the test.

## Georgetown and Black Hawk join Idaho Springs on one Clear Creek guide, 20 October

*20 October 2026.* The owner, having set the goal as becoming each town's
go-to resource rather than monetising, asked which guides to drop. The
editor's sort put the six smallest mountain guides (Black Hawk, Georgetown,
Idaho Springs, Grand Lake, Leadville, Nederland) as coverage for coverage's
sake, twelve to seventeen events apiece, and proposed that the three on the
I-70 corridor fold into one guide the way Carbon Valley covers three towns.
The owner: "first do the clear creek combo."

- **What the three showed on 20 October.** Idaho Springs 12 events, 27
  places, 3 articles; Georgetown 14, 20, 4; Black Hawk 17, 20, 3. Idaho
  Springs and Georgetown already shared a county, a library district
  (cccld.org), a recreation district, a school district, the Clear Creek
  Ranger District and, since 12 October, an email edition. Black Hawk had
  been a visitor guide since the same day. Together: 43 events, 67 places,
  12 articles, 35 staged items and 39 sources, which is a guide.
- **The Idaho Springs guide is the one that stays**, as Windsor's did for
  Severance: its slug, folder, Vercel project and domain
  (insideidahosprings.com) are unchanged, since it is the largest of the
  three and the one with the search history. Its config lists
  `subTowns: ['idaho-springs', 'georgetown', 'black-hawk']`, which gives it
  /idaho-springs/, /georgetown/ and /black-hawk/ and a "Where" filter on its
  lists, and every Idaho Springs event and place now says
  `subTown: idaho-springs`. Unlike Windsor the guide takes a new name, the
  corridor's: `name: 'Clear Creek'`, `siteTitle: 'Inside Clear Creek'`, on
  the owner's words, with a tagline, short tagline and SEO line naming all
  three towns (the home title fits with exactly three names and "CO"). The
  domain is a mismatch the owner can end by naming a Clear Creek domain;
  until then nothing else changes.
- **Figures are summed, as Carbon Valley's are**: 3,027 people at the 2020
  census (1,782 + 1,118 + 127), 2,869 at the 2010 (State Demography Office
  file), incorporated 1864 (Black Hawk's, the earliest). The point,
  elevation, colours and hero stay Idaho Springs's. The guide covers two
  counties, Clear Creek and Gilpin, so it carries a `countySplit` note (the
  towns test wants one wherever a config names two) sourced to the state
  census file read today, and its school line is hedged "Mostly Clear Creek
  RE-1" with Black Hawk's Gilpin RE-1 after the colon. The conditions links
  are the three lists made one; `officialLinks.also` names the Town of
  Georgetown and the City of Black Hawk.
- **Content moved with its slugs.** Georgetown's and Black Hawk's events,
  places, staged items, articles, photographs (every one but the hero, which
  the holding page uses) and Black Hawk's one correction are in
  `content/idaho-springs/`, each event and place stamped with its town after
  the title; no slug collided. The two Moving Here pages are the articles
  *Moving to Georgetown* and *Moving to Black Hawk*, with a line on where
  they sit, and Idaho Springs's own Moving Here page links them. The image
  ledger's rows follow the files. Georgetown's blank weekly note and Black
  Hawk's are deleted; the guide's weekly file is Idaho Springs's.
- **One source registry.** The three merged into
  `content/idaho-springs/sources.json`: a town's own sources carry its
  `subTown`; the nine county- and district-wide ones (the library district,
  the recreation district, the county calendar and site, Visit Clear Creek,
  the ranger district, COtrip, the school district, the census file) carry
  none, so ingest stages their events without a town and the editor sets
  it. Four sources were in two registries (the library district, the
  recreation district, COtrip, the ranger district, the last under two ids);
  one entry each is kept, `fs-usda-gov-arp` for the ranger district. Every
  `sourceId` in the moved content still resolves.
- **The two domains redirect, path for path**, the thirteen host-scoped
  rules of the Severance pattern each, in vercel.json (docs/REDIRECTS.md);
  the projects keep building from their configs, now `status: 'redirect'`
  with `foldedInto`, and serve one holding page saying where the guide went.
  Nobody lists the two as neighbours: Golden and Evergreen name the Idaho
  Springs guide, and Nederland's Peak to Peak neighbour is that guide now
  in Black Hawk's place. Black Hawk's `visitorGuide` went with the fold,
  since the guide it joined is in the email. The hub's Idaho Springs and
  Georgetown edition is gone from the config; the guide is an edition of
  one, so the count of fifteen holds. The hub's Moving page compares the
  three as one row and says so; manager/towns.json lists one guide with two
  alternate domains; DEPLOY.md's list says which project serves what.
- **Tests.** `test/folded-towns.test.ts` names four folded guides and checks
  `corrections/` has moved too; the nearby, editions and manager tests
  follow the configs; the mountain strip test sorted its expectation by
  slug, which was name order until a guide's name stopped matching its slug.
- **Not done, and the owner's.** Buttondown may hold subscribers tagged
  `georgetown` or `black-hawk`; the send script already adds a folded town's
  tag to its guide's issue, so they are reached, but moving them to
  `idaho-springs` is the owner's in Buttondown. The Search Console and Bing
  properties for the two retired domains stay as they are, so the redirects
  can be seen to take; nothing else in the two dashboards changes. A Clear
  Creek domain, if the owner wants one, is a config change and one more row
  of redirects. The other three small mountain guides (Grand Lake,
  Leadville, Nederland) and the four city guides are the next decision, not
  this one.

## The other mountain guides, 20 October

*20 October 2026.* After the Clear Creek fold the owner said to do the other
mountain towns. Asked how, with the choices and a recommendation for each,
the owner took both recommendations: quiet the three that have no guide to
fold into, and make the four visitor towns visitor guides, Golden included.

- **Quiet: Grand Lake, Leadville and Nederland.** Each gets a `quiet` block
  (since, decide by, why), as Elizabeth has: pages up and indexed, listings
  checked as the rotation reaches them, but no weekly email, no signup box
  on its pages or anyone else's, no Thursday draft, and one line in the
  weekly report with the days left. Leadville's `visitorGuide` is replaced,
  since quiet is the stronger step. The decide-by date is 19 November, not
  the 20 January first offered: the quiet-towns test wants the decision
  before any listing's hours expire, forty-five days from its check on the
  mountain chassis, which is 20 November for Nederland (checked 6 October)
  and 24 November for the other two. Keep a guide, and the field comes off;
  retire it, and the Severance pattern applies, with no neighbour to take
  it, so a holding page and a redirect to the hub would be the shape.
- **Visitor guides: Estes Park, Golden and Evergreen**, joining Manitou
  Springs: kept current on the sixty-day check, in the weekly report, but
  with no weekly email. Golden stops being treated as a flagship for the
  weekly routine; its site, its search phases (docs/SEARCH-VISIBILITY.md)
  and its outreach list stand, since none of those depends on the email.
- **What follows from the configs.** `emailTowns()` now covers twelve
  guides in ten editions (two shared), down from fifteen; the hub's signup,
  the newsletter page, the Thursday drafts and the weekly report read the
  same fields and need no change. manager/towns.json says which guides are
  out of the email and why, as its test requires.
- **Not done, and the owner's.** Buttondown subscribers tagged with the six
  towns stay tagged; nothing is sent to them until a guide rejoins, and
  telling them is the owner's call. The four city guides (Fort Collins,
  Longmont, Loveland, and Castle Rock before it opens) are the next
  decision; this one touched only the mountains.

## The city guides, 20 October

*20 October 2026.* After the mountain guides, the owner said to do the city
guides. Read against the 90-day test decided the same day (Niwot, Lyons and
Berthoud get the effort; "the other guides stay live on the ingest, the
nightly recheck and the standing automation, with no hand work"), the same
step as the small mountain guides: quiet, not retire.

- **Quiet: Fort Collins, Longmont and Loveland.** Each is a city with a
  daily paper, a tourism office and a city government behind the official
  sites, which the editor's sort of 20 October called the wrong fight: a
  town guide can become the go-to resource for a town of 10,000 with no
  good calendar, not for a city of 76,000 to 170,000 with three. Each gets
  a `quiet` block: pages up and indexed, listings checked as the rotation
  reaches them, no weekly email, no signup box on its pages or anyone
  else's, no Thursday draft, one line in the weekly report. Decide by 29
  November, before any listing's hours expire (sixty days from its check on
  the Front Range chassis: Fort Collins's earliest is 1 October, so 30
  November; the other two 3 December). Longmont was named a priority on 12
  October; the 90-day test replaced that list, and its reason stands in
  the config.
- **Castle Rock stays `wave2`**, as it has been: a holding page, nothing
  live, nothing to quiet. Opening it was already ruled out on 12 October.
- **The Loveland and Johnstown edition ends**, Loveland being out of the
  email; Johnstown is an edition of its own. The email now covers nine
  guides in eight editions, one shared (Windsor, Severance and Timnath).
  The hub's signup, the newsletter page, the drafts and the weekly report
  read the configs and need no change; manager/towns.json says which guides
  are out of the email and why.
- **Where the network stands after the day's three decisions.** In the
  weekly email: Niwot, Lyons, Berthoud, Erie, Johnstown, Timnath, Windsor
  (with Severance), Carbon Valley (with Fort Lupton) and Clear Creek (Idaho
  Springs, Georgetown and Black Hawk). Visitor guides: Estes Park, Golden,
  Evergreen, Manitou Springs. Quiet, with a date: Elizabeth (15 November),
  Grand Lake, Leadville and Nederland (19 November), Fort Collins, Longmont
  and Loveland (29 November). Folded: Severance, Fort Lupton, Georgetown,
  Black Hawk. Not open: Castle Rock.
- **Not done, and the owner's.** Buttondown subscribers tagged with the
  three cities stay tagged and get nothing until a guide rejoins. On each
  decide-by date a quiet guide either rejoins (the field comes off) or
  goes (a holding page and redirects, with no neighbour to take a city).

## Plausible on Berthoud, Lyons and Niwot, 21 October 2026

- **Plausible Analytics counts the three guides**, the owner's request,
  beside the network's Vercel Web Analytics rather than instead of it.
  `plausible: true` in a town's config switches it on; each guide reports
  under its own domain, so each needs to be a site in the Plausible account.
- **From the npm package, not Plausible's snippet.** The snippet is a script
  on plausible.io plus an inline one, and the CSP allows neither; bundled,
  the script is served from the guide itself and only `connect-src` widens,
  to https://plausible.io, for the events. `npm run validate` fails if a
  guide has it on and the CSP does not list it. The options are the ones
  the Berthoud snippet had on: outbound links, downloads, form submissions.
  Previews on vercel.app send nothing.
- **/privacy/ names it** on those three guides. Still no cookie banner:
  Plausible sets no cookies either.

## The whole season on /sports/, and softball, 21 October 2026

- **The sources for a complete schedule.** MaxPreps's team home page
  carries only the recent games on its wall (Berthoud football's 6-2 showed
  as six), so each team's `/schedule/` page is read too: every game of the
  season with the score, and it answers the GitHub runner as the home page
  does (run 39666831083). Its data has no keys, 41 values a row, so every
  row is checked against the sentence MaxPreps writes beside it and a page
  with one row the sentence does not bear out is not used; the home page's
  shorter list stays and the run summary says why. Also looked at:
  CHSAANow (chsaanow.com), the association's own site, which has a page
  per game for every Berthoud and Niwot team with the score and the time,
  found through its per-sport sitemaps, and whose robots.txt allows us.
  Not used today, since MaxPreps already carries the records and the
  cross-check machinery, but it is the authority and the fallback if
  MaxPreps closes its door. The Berthoud school calendar lists the past
  games too, without scores. ArbiterLive (Niwot's schedules) still asks
  automated readers to stay out.
- **Softball joins the fall teams** on both guides: a fall sport in
  Colorado, which MaxPreps files at `softball/fall`. Berthoud's girls flag
  football, which CHSAA lists as a MaxPreps sport, is not on MaxPreps under
  any of four spellings tried, so it waits; CHSAANow has its 15 games if
  it is ever read from there.

## The two flagships: Berthoud and Niwot, 21 October 2026

*21 October 2026.* The owner's brief for the two flagship guides, worked
as one project in the order it gave: the trust fixes, then the resident
hubs, then the design, then the validation. Everything town-specific is
in the two configs and under `content/berthoud/` and `content/niwot/`;
the routes, components and schemas are shared, and every other guide
renders exactly as it did (the old home page is `ClassicHome.astro`,
unchanged; a guide gets the flagship layout only with `home` on its
config, and the hub routes only with `families`, `participation`,
`livingHere`, an `updates/` folder or a published profile).

- **Neon Nights.** The Town's Upcoming Events page and its home-page
  calendar, read today, give cosmic pickleball on Friday October 23 and
  the dodgeball tournament on Saturday October 24; the printed fall guide
  has them the other way round, and the guide had followed the print. The
  two listings now follow the Town's current pages, say so, keep the
  print's times and fees with a line to call, and a corrections entry
  logs the change.
- **Niwot volleyball, 30 October.** MaxPreps carried the Fossil Ridge
  match twice at 9:45 am under two contest ids; the second answered 404
  today. A duplicate, not a doubleheader: `dedupeToCome` drops a repeat of
  the same day, the same known time and the same opponent, keeps the first
  id, and leaves a doubleheader (two times, or no times) alone. The data
  file is corrected by the same rule and says why in the team's notes.
- **Weekly nearby.** The town's own content comes first on every "This
  week" page; the neighbours' weekend follows it (now on the full page too,
  limited to four), and the mountain guides' strip is labelled "Day trips:
  up the hill this weekend". Niwot's page had led with Evergreen, Manitou
  Springs and Golden on a one-listing week.
- **When a business changed versus when the guide noticed.** A weekly
  change takes `effective`; one more than fourteen days before its check
  is a backlog item, shown as "Corrections to the guide" with both dates,
  off the week's news. Fly Away Home (closed December 2024, found October
  2026) and Niles Family Dentistry (moved September 1, found October 17)
  are the two. The same two are in the new local-changes collection with
  "noted" dates.
- **One count.** `src/lib/event-totals.ts` is the one definition: listings
  (dated events plus weekly series, each once) and dates in the fortnight.
  About, its closing band and the home page read it and say which they
  count.
- **Nothing twice on the home page.** The pick's listing is left out of
  the rows under it, "Coming up" leaves out what the week showed, and the
  masthead's dated notice is left out of "Things to know".
- **Three collections, one gate.** `programs/` (what to join, by audience,
  kind, topic and access, with the organizer's deadline), `updates/` (what
  changed, who it affects, when, what to do, the original; three dates
  kept apart; current until `expires`, then archive) and `profiles/`
  (draft until an interview or supplied words, consent and a date exist;
  the schema refuses to publish without them, and the route builds only
  where one is published). A program or an update needs `source` and
  `verified`, like a place.
- **Who runs it.** At the owner's direction in this brief, James Lerner is
  named on the two About pages through a per-town `about` block, in
  verified words only: he runs Lerner Works and grew up in Niwot; the
  Berthoud page says he is not a Berthoud resident and that nothing is
  endorsed. `hub.editor` stays unset, so the check lines and the other
  nineteen About pages are as they were (8 October). No portrait exists in
  the repository; none was generated.
- **Niwot's tagline.** The November 3 vote came out of the permanent
  short tagline and the comparison line and into dated coverage: the
  election explainer, a local-changes notice that expires on election day,
  and a dated line under the masthead that goes with it.
- **The home page.** A split masthead at about a third of the old hero's
  height (the Town's own playground photograph on Berthoud, Second Avenue
  on Niwot, both licensed in IMAGE_LICENSES.csv); the week in a main
  column (pick, rows, coming up) and a supporting column (things to know,
  deadlines, new & closed, the week's games in the school's colour, with
  no team featured out of season); the signature section (Berthoud
  Families; Around Niwot and Get Involved); the places; the email once;
  Living Here; the neighbours, four at most; a footer strip naming the
  neighbours and the hub. Six navigation items; Guides and Moving Here
  move to the footer and Living Here.
- **Clicks.** `data-track` on registration, participation and
  resident-service links, and the signup's submit, go as custom events
  through the Vercel and Plausible scripts the sites already load. No new
  vendor.
- **Withheld.** Two profile drafts (Steve Hensley, Pat Murphy) with their
  open questions; Halloween in the Hall (no description on the hall's
  calendar); Troop 161's own meeting hours (no troop page could be read);
  the Berthoud Chamber (its site returned nothing); Niwot Pizza's move
  date (the owner's page gives none); the LID's November 17 date (the
  Courier's report; the county's calendar still says the 3rd).

## The home page as option B, and Lyons as the third flagship, 22 October 2026

*22 October 2026.* The first flagship home page of the day (the masthead,
today, the week, the school's games, the family cards, who handles what,
open now, the email) was, in the owner's words, "way too overwhelming".
Three simpler mockups at phone width went to the owner as a design
canvas; the choice was **B, "the week, then links"**, with the guide in
the school's colour throughout.

- **The home page.** The header is the masthead (the town's colour, the
  wordmark, search, five pills, the sister-guide switcher); then today in
  one line; "This week" as one list, the pick as its first row with the
  amber tag and up to five dated rows, then the week's count and the
  calendar's; "On this guide", one link per hub with one line of reason
  from the hub's own data (the records, the next family deadline, the
  Living Here sections, the current decision, the places count); the email
  as a dark panel; one sentence on independence. The sports, families,
  who-handles-what, open-now and trust blocks of the morning came off and
  their components are deleted; the hubs behind them are unchanged. The
  photograph the compact hero drew is no longer drawn, and `home.photo`
  is optional.
- **The school's colour as the guide's.** Berthoud is the Spartans'
  maroon (`#8F0018`), Niwot the Cougars' green (`#007C47`, the exact
  shade darkened 5% to clear the warm paper), Lyons the Lions' navy
  (`#022C66`), each as MaxPreps's team data gives it, header to favicon.
  The old primaries (garden green, the Niwot green, sandstone) go; on
  Lyons the sandstone stays as the accent. `check-colors` holds every pair.
- **Lyons.** The third flagship, at the owner's "do the same for Lyons":
  the same masthead and pills (the week, Families, Lions, Living here, Eat
  & drink), the same home page, a Families hub of thirteen programs read
  from the library's calendar, the Town's recreation pages and the
  school's athletics pages on this date, the St. Vrain breaks, and a
  Living Here of seven sections (the Town's own water, sewer and electric
  utilities; trash as private haulers and the free recycling center; the
  free Lyons Flyer to Boulder; parks and recreation; schools; the
  Sheriff's contract, the fire district and the request tracker; the
  Board of Trustees, first and third Mondays). No participation hub yet:
  the flagship test lets a flagship go without one. No photograph was
  chosen, so none is invented. The character line lost its "2013" (the
  flood is still there, undated) because the masthead test refuses a year.
- **The Lions on MaxPreps.** Football (eight-man), volleyball, softball
  and both cross country teams, no boys' soccer, as the school's athletics
  page lists them; the school keeps each schedule as a spreadsheet, so
  games to come are on MaxPreps's word alone, as Niwot's are. Volleyball's
  full schedule page carried a row for a match MaxPreps had deleted (the
  teams and a result still there, no URL, no sentence, "ContestState is
  Deleted." where the state goes), which the reader refused the whole
  page over, leaving the card with the team page's five games against a
  14-5 record. A row marked deleted is skipped and counted like a
  cancelled one; the re-run reads all nineteen. The probe now reads the
  schedule page too, prints a refused row's fields, and lists the page's
  colour fields, which is where the navy came from.

## Plausible on every live guide, 22 October 2026

- **The other seventeen live guides count to Plausible too**, the owner's
  request, with Plausible's dashboard already holding them as sites
  ("Setup pending" until a first page view lands): Carbon Valley, Elizabeth,
  Erie, Estes Park, Evergreen, Fort Collins, Golden, Grand Lake, Idaho
  Springs, Johnstown, Leadville, Longmont, Loveland, Manitou Springs,
  Nederland, Timnath and Windsor, each with `plausible: true` beside
  Berthoud, Lyons and Niwot. Same tracker, same events, same CSP; /privacy/
  on each now names it. Not the folded guides (they only redirect), not
  Castle Rock's holding page, not the hub.

## Berthoud in the school's own maroon, 22 October 2026

- **`#572932`, from Berthoud High's own site**, in place of MaxPreps's
  `#8F0018`, at the owner's "Berthoud is maroon": MaxPreps's shade read as
  red. bhs.tsd.org's theme names `#572932` its primary colour (the nav tab,
  the buttons, the headings and the footer band on its athletics page) and
  `#7f3035` its secondary; the primary is the one that does the jobs the
  guide's primary does. The town config, the school's sports entry and the
  favicon change together (favicon cache to v7); the gold accent stays.
  `check-colors` passes. Windsor, Elizabeth, Johnstown, Loveland and Carbon
  Valley already took their school's own site over MaxPreps; Berthoud now
  does too.

## The email's closing links as words, 22 October 2026

- **The footer of every edition links words, not addresses.** The first
  issue as it landed on a phone (Inside Niwot, 22 October) ended in three
  raw URLs, each carrying its utm string across four lines. "This week in
  Niwot", "Everything on in Niwot" and "Know of something missing? Send
  it in" are now the links, as the multi-town and all-towns footers'
  lines are. Same addresses and campaign tags; the archive pages render
  the same Markdown.
- **The blue dates and times are Apple Mail's**, not the issue's: iOS
  turns a future date or time into a calendar link in its own colour. The
  cure is a stylesheet rule in the email's `<head>`
  (`a[x-apple-data-detectors]`), which belongs in Buttondown's custom CSS,
  not in the issue body. Left to the owner.

## Elizabeth, Windsor, Erie and Johnstown as flagships, 22 October 2026

- **Four more flagships**, at the owner's "make all flagship design with
  extra page same as Berthoud and Niwot and Lyons": each gets `home` (the
  masthead in the town's colour with the pills, the option-B home with no
  photograph), a Families hub and a Living Here, as Lyons did. Families is
  the signature hub on all four; none has a participation hub yet.
  `test/flagships.test.ts` now holds seven. Erie follows no school, so its
  menu is This week, Events, Eat & drink, Families, Living here, with no
  sports pill.
- **Every fact read on 22 October** from the Town, the county, the
  district, the library and the organizer: 9 programs for Elizabeth, 13
  each for Windsor, Erie and Johnstown; each district's 2026–27 calendar
  for the breaks (Erie lists St. Vrain's and Boulder Valley's, each row
  named for its district; Windsor's are Weld RE-4's, Johnstown's Weld
  RE-5J's, Elizabeth's the district's revised calendar).
- **What the sources would not give.** townofelizabeth.org still refuses
  every automated request, so Elizabeth's Living Here has no Town items:
  no utility billing, trash or Board of Trustees; the county, CORE, Black
  Hills, the park district, the fire district and the schools are there,
  and the section is "Meetings and elections" until the Town's own pages
  can be read. The library (pplibraries.org) disallows the fetcher, so no
  Elizabeth library programs. windsorco.gov refuses direct requests too;
  its pages were read through a reader service (r.jina.ai), said in a
  comment in windsor.ts, which is not how the network reads a refusing
  site elsewhere: the owner's call whether those items stay.
- **Conflicts left for a person.** Windsor's recreation center place file
  gives weekend hours the Town's page no longer does (Saturday 8–7, Sunday
  12–6 today). Erie's `countySplit` note says County Line Road decides the
  school district; Boulder Valley says only "parts of Erie". St. Vrain's
  calendar also marks MLK Day, Presidents' Day and April 26–27, which
  Lyons's and Niwot's break lists leave out.

## The family hub's classifications, the weekly briefing and the signup's promise, 22 October 2026

- **Ages by the organizer's numbers.** A program may carry `ageFrom` and
  `ageTo` (whole years); where it does, the family hub files it under the
  age group most of its years fall in and names it again, with its real
  range, under every other group it reaches ("Also for this age"). Scouts
  BSA Troop 161, "11 to 17", had sat under "Ages 5–11" by its audience
  tags. Child activities, the parents' side (schools, passes, volunteering)
  and organizations with a family membership are three sections, not one
  list by age.
- **Free means the activity is free.** `free` on the file decides; without
  it, only a price line that begins "Free" with no paid part after it
  counts, so "Free to volunteer", "$15 a year; lectures $5" and "Free;
  basketball $5" are not free things to do, and a volunteer role or a
  membership organization never is. "Drop in" is said only where the
  organizer's page says no sign-up; a cost the organizer did not publish
  is "Not stated", never blank.
- **Soon is fourteen Denver days** (`SOON_DAYS`). Closing soon and opening
  soon are separate sections; everything later is "Coming up" with its
  date; countdowns are whole calendar days (`daysBetween`), never rounded
  milliseconds. The school-break rows say "Browse family events": the
  calendar cannot be filtered to a break's dates, so the link no longer
  implies it answers what is open that week.
- **An old change is a correction, not the week's news.** A local change
  published more than thirty days after it happened (`isLateNotice`) is
  kept out of "Things to know this week" however recently its source was
  read, and listed once under "Corrections to the guide" with the day it
  happened, the day it was noticed, the day the source was read and what
  to do now; a notes item naming the same business is folded into it.
  The archive on /updates/ keeps every one.
- **"Clearly labeled sponsors", not "No ads".** The flagship signup
  promised no ads while /advertise/ sold a labeled line in the Thursday
  email. The one line (`EMAIL_PROMISE`) now says what the partnership
  page, the business page and the privacy page say; a test keeps "no ads"
  out of the source.
- **The partner page has a community side**: what a chamber or a community
  organization and a guide each bring (verified events with their source,
  corrections and closures, seasonal guides, a first small collaboration
  by email), with the editorial rules restated. No partner, figure, price
  or result is named, because none exists.
- **The flagship introduction is a third shorter**, with one line on the
  week's lead (the featured change, else the pick), one button to the
  signature hub and a text link to the week, and on a desktop the town's
  own photograph from the project's licensed assets (`home.photo`:
  Second Avenue by Jeffrey Beall, CC BY-SA 2.0; the Town of Berthoud's
  playground), credited under it, never on a phone. The week begins at
  595px of a 900px desktop screen on both, from 811px.
- **"20 guides", not "20 towns"**, wherever the hub counts the live list;
  the hub's headline now has one line and the picker under it, with where
  the towns are and the task buttons below the names.

## Signing up in one press, 25 October

*25 October 2026.* The owner: the signup is "complicated, too many steps,
lose people". It was: tick a town, type the address, press, a new tab on
Buttondown's page, "Verify and Subscribe" there, then the confirmation
email. The 8 October audit asked for an inline signup and it was left,
because Buttondown's embed form cannot be finished from the page and the
only other way is a function holding the API key.

- **A function at `/api/subscribe`** (`api/subscribe.ts`, the rules in
  `src/lib/subscribe.ts`), deployed with every site. It takes the form's
  address and towns, checks them (an address, at least one town, only towns
  the email covers), and hands them to Buttondown's API. No subscriber type
  is sent, so double opt-in stays: Buttondown sends its confirmation email
  and nobody is on the list until they click it. The page says "One last
  step: check your email", with the address it went to. Only the site's own
  pages may post; the reader's IP goes to Buttondown for its firewall; the
  address is in no log.
- **It switches on with the key.** A build that sees `BUTTONDOWN_API_KEY`
  marks its forms to post to the function; one that does not keeps the new
  tab, so nothing changes until the owner adds the key in Vercel, once, as a
  shared variable (DEPLOY.md, "Signing up without leaving the page").
- **Nothing is lost when it fails.** No key, Buttondown down, or its limit
  of 100 subscriber requests a day reached: the page offers "Continue on
  Buttondown", the old new-tab form, from the reader's own press. An address
  already on the list is told so and offered the same, since adding towns to
  an existing address, or resubscribing someone who left, is Buttondown's
  form's to do with its own checks, not a public page's.
- **On a guide the address comes first.** The town is ticked already, so
  it follows the address; the usual signup is an address and a press. The
  hub keeps the towns first, since there is no town to assume.
- **Caught on the way.** The form first carried `data-day`, which the
  freshness script (`src/lib/expiry.ts`) reads as a day of listings and
  removed as empty: the signup vanished from /this-week/ in the browser
  before it shipped. It is `data-send-day`, and a test keeps the form clear
  of the attributes the pruning reads. And on a Lyons preview the function
  crashed on load: Vercel compiles it to JavaScript but kept its
  `../src/config/index.ts` import, so `tsconfig.json` now has
  `rewriteRelativeImportExtensions`, which Vercel's compile honours; the
  preview then answered as the tests do (a refusal for another site, a
  bad town or a bad address; "unavailable" with no key). The page calls
  `/api/subscribe/` with the slash, which the sites redirect to.
- **Not changed.** Double opt-in: the confirmation email is what makes the
  list a list of real, willing readers, which is what a sponsor pays for.
  Turning it off is a Buttondown setting and the owner's call.

## Search engine verification reads the build's environment, 25 October

*25 October 2026.* `src/layouts/Base.astro` handed `import.meta.env` to
`verificationTags`, and Astro's object holds only the variables it knows
of, so a `GOOGLE_SITE_VERIFICATION` or `BING_SITE_VERIFICATION` set in a
Vercel project never reached the page (found while building the signup's
key switch, which met the same wall). It reads `process.env` now; a build
with both set carries both tags, one without carries neither, and a test
holds the layout to it. No guide's project had either code set yet, so
nothing had been relying on it; docs/SEARCH-VISIBILITY.md's steps stand
as written.

## The scoreboard-led home page for the flagships, 25 October 2026

*25 October 2026.* The owner's brief: one home page for the seven
flagships, built for the parent or student back for the scores and the
week, and for the reader who should be on the Thursday email. The calls
made inside it:

- **Its own route, its own stylesheet.** A guide with `home` is built from
  `src/routes/town/home-flagship.astro`; every other guide's home is
  `index.astro`, which no longer imports the flagship at all. The page's
  look is plain CSS (`src/components/home/flagship-home.css`) imported only
  there, with the italic Fraunces it needs, so a classic guide's build is
  byte for byte what it was (every file compared against main, with only
  the build's own clock masked: the calendar's DTSTAMP, the feeds'
  lastBuildDate, the events page's "Listings refreshed" stamp and the
  sitemap's build-time lastmod). The shared stylesheet keeps the handful of
  utilities only the old flagship used, named in one `@source inline` line
  at the top of `global.css`, for the same reason; dropping that line
  changes every guide's stylesheet and is best done on its own.
- **The school's colours, from the schools' own sites.** `school` on each
  flagship's config, each colour read on 25 October from the school's site
  or its logo, with the comment saying where. They are the masthead, the
  closing band and the Home and Away pills, and nothing else; the guide's
  palette is untouched. `npm run check-colors` proves white at 7:1 on the
  band, and the secondary at 4.5:1 on it before it carries words.
  - **Erie and Johnstown swap.** White is 3.0:1 on Erie High's orange and
    6.0:1 on Roosevelt's red, short of 7:1, and both schools publish black
    as their second colour, so black is their band and the orange and the
    red are the accent (the dot; on Erie, the eyebrows too, 5.4:1).
  - **Niwot takes its site's darker step.** White is 4.7:1 on Niwot High's
    green (#008462); its other colour is white, which cannot be a band. Its
    site publishes the green as a scale, and the 700 step, #126637, is
    7.04:1. The nearest shade the school publishes, not one picked here.
  - **Berthoud is maroon and white**, as the brief had it: the site's
    `--secondary-color` is a second maroon, a web shade, and the logo is
    maroon, white and black.
  - **Lyons's band is its site's blue, #0054A6**, not MaxPreps's navy,
    which stays on /sports/.
- **"Town" in the home menu is Things to do.** The brief's menu named
  This week, the mascot, Town, Eat & drink, Families and Living here; Town
  had no page of its own, and Things to do (the parks, trails and places in
  and around it) is the one every guide has. The home menu is the home
  page's only: every other page keeps the shared one.
- **The card's small print is the true one.** The brief's "We don't sell or
  share your address" is the promise the privacy line was rewritten to stop
  making (src/lib/privacy.ts: the address goes to Buttondown); the card says
  "We don't sell your address or share it for advertising".
- **The schedule line says where the schedules come from.** The brief's
  "Schedules from <School>, cross-checked against MaxPreps" is the other
  way round from the pipeline: the schedules are MaxPreps's, checked against
  the school's calendar where one may be read. The line says so, school by
  school.
- **7 am is in the config.** `sendTime` on the newsletter config, the
  owner's word in the brief. The send is the merge of Thursday's pull
  request, so the hour is a promise to keep; without the field the page
  names the day alone.
- **The week is the week.** Monday to Sunday (weekWindow), so on a Sunday
  six of the seven days have gone: they show what was listed and played,
  with the scores, and never "Add an event". The Thursday email is on its
  day from that day on, not on a Thursday gone by.
- **The old home's fields stay in the configs.** `signature`, `purpose`,
  `secondary` and `photo` are read by nothing on the new page; the credits
  page no longer says the photograph is on the home page.

## The old flagship home page's leftovers removed, 26 October 2026

*26 October 2026.* The scoreboard home page (25 October) left three things
from the page it replaced, kept so that change could leave every classic
guide byte for byte as it was:

- **The safelist line** at the top of `global.css`, which kept nine
  utilities only the old page used. Gone, with them; every guide's
  stylesheet is smaller by those rules and nothing else.
- **The primary wash** (`band-tint`, `--color-primary-soft`,
  `--t-primary-soft`), the old page's third surface. Nothing used it, so it
  and its two check-colors proofs are gone.
- **`home`'s fields.** `signature`, `purpose`, `secondary`, `accentName` and
  `photo` were read by nothing. `home` is now `true` on the seven flagships,
  the switch for the flagship route and the inner pages' banded header. The
  two photographs stay in `content/` with their licence rows; the guide no
  longer shows them, so /credits/ no longer lists them.

## The 26 October audit: the five flagships made dependable, 26 October 2026

*26 October 2026.* An outside audit of insideberthoud.com, insideniwot.com,
insidelyons.com, insideerie.com and insidejohnstown.com, with the hub where
the three share code, listed eleven priorities. Each was reproduced on a
build of main at 274fcb86 before anything changed, fixed centrally where the
code is shared, and checked on the other guides. The findings and the rules
they settled, in the audit's order.

### 1. The calendar tells series from occurrences

Erie's "Today" on Monday 26 October showed Terror in the Corn, a run that is
open Thursday to Sunday, and left out the Monday chess club, which sat under
"Every week" and on the home page but not in the dated list. The cause was
the event model: a run was a start and an end with its open days only in
prose, and the "Every week" directory took any note that sounded weekly.

- **Three optional fields on an event** (`src/lib/schedule.ts`, the schema):
  `schedule`, the weekdays a run is open, with that day's hours where the
  source gives them; `except`, dates a run or weekly series is not on; and
  `timeTbd`, a date whose time is not announced, which goes with `allDay`.
  The schema refuses an `except` day the series could not have had, and a
  run whose first or last open day does not match its `start` and `end`.
- **`occurrences()` expands a scheduled run into one entry per open day**,
  with that day's hours, skipping `except` days and never past `until` or
  `end`. A run with no schedule stays one "Now through…" row: the engine
  never guesses open days from prose. An overnight close counts to the next
  morning. Nothing is extrapolated past a verified bound.
- **"Weekly" needs a weekly repeat or three dated files a week apart.** A
  note like "Second Mondays" or "Every Friday" on a single file no longer
  makes it weekly: it shows on its one verified date. Erie's directory went
  from 22 entries to 5; 102 monthly and fortnightly files in seven towns now
  show on their own dates.
- **Each day is in clock order**: timed events, then all-day, then time to
  be announced. No category outranks an earlier start, so a game never sits
  above the morning's events.
- **One occurrence logic everywhere.** `agenda()` builds the events page,
  `eventRowShown()` is the one filter rule for the server render and the
  browser script, `feedEvents()` the calendar feed; the home page's week
  calls the same `occurrences()` and `weekEvents()` with unchanged
  signatures. `test/calendar-reliability.test.ts` holds the audit's eight
  cases on a fixed clock (the Erie Monday; a daily-except-Tuesdays festival
  on a Tuesday; a verified Monday series in Monday's results; a
  second-Monday series on other Mondays; cancelled and excluded dates;
  overnight; the 1 November clock change; home, agenda and feed agreeing)
  and passes under UTC and Pacific/Auckland too.
- **Re-encoded from their own prose, `verified` unchanged:** Erie's Terror
  in the Corn and Anderson Farms Fall Festival; Castle Rock's winter
  trolley, carriage rides (four excepted dates) and Ghostly Stories;
  Evergreen's Nightmare at 1520; Fort Collins's Garden of Lights (24 and 25
  December excepted, time to be announced); `timeTbd` on Timnath's Magic on
  Main, Carbon Valley's Festival of Lights and Johnstown's Holiday Open
  House. Left as they are because the prose is ambiguous: Golden's Polar
  Express ("several evenings a week"), Johnstown's two Candlelight runs
  ("see box office"), Berthoud's rec-center anniversary ("all day", no
  schedule posted).
- **The feed's IDs changed** for the re-encoded runs: one per night instead
  of one per run, so a subscriber's calendar sees the run replaced by its
  nights once.

### 2. Johnstown's afternoon storytime is one record

Two files described the same Monday 1 pm Music and Movement session at the
library, recommended each other and shared a meta description. The weekly
series file (`music-and-movement-storytime-afternoon`) is canonical: it
matches the library's own weekly rule, its address does not go stale, and it
has the shape of the 10 am listing. The dated file's organizer, address,
status and weekly themes (through 30 November, each session's library page)
moved into it; the dated file is gone and `vercel.json` sends its page, its
`.ics` and its per-session `.ics` files to the series, on insidejohnstown.com
only. The 10 am listing was corrected to the library's page: weekly, through
30 November, and without "Free" and "No registration", which the library
does not say. Messy Art went the other way, since the library lists each
session on its own: the series file is gone and `/events/messy-art/` goes to
the 28 October session.

- **Session links stay in the content as `[YYYY-MM-DD at HH:MM](url)`**, so
  ingest can read them as organizer IDs; the page shows "Mon, Oct 12, 1 pm"
  in a `<time>` (`ReadableSessionLinks.astro`), which also fixed ten files in
  Grand Lake, Manitou Springs and Windsor.
- **The word for a date comes from the category:** performances for music
  and arts, meetings for civic, dates for markets and festivals, sessions for
  everything else. No new field.
- **The main button never lands on an expired session page.** When a
  listing's `url` is one of its own session pages, the button follows the
  body's link for the next session; a series page is left alone.
- **The detail page's source order is facts, button, calendar links, check
  date, description, recommendations, signup**, so a screen reader and the
  keyboard meet the date before the signup form. The screen order was
  already right; the source was not.
- **Ingest matches every date of a file, not only the first.** That was the
  root cause of the re-staging. Organizer IDs come first (the feed's own ID,
  then the organizer's session page). When two published files both match a
  feed item, both get `changeFlag` and a note; nothing is merged. A looser
  match (same day, start within 30 minutes, same venue by name or address,
  titles 30–60% alike) is staged as "Possible duplicate of …", which the
  automatic review holds. `src/lib/address.ts` treats "400 S Parish Ave" and
  "400 South Parish Avenue" as the same.

### 3. The search index holds page copy, not interface text

On Berthoud, nine of the top fifteen "City Star" excerpts carried the
signup's hidden "Finish signing up in the new tab" panel, which sits outside
the `<form>`, and the venue's excerpt was its event list. Search is Pagefind
1.5.2 through its Node API in `scripts/lib/search-index.ts`.

- **The exclusions live in one place**, Pagefind's `excludeSelectors`:
  `[hidden]`, `aria-hidden`, live regions, status and alert roles, buttons,
  in-page links, nav, footer, forms, the signup and its done panel, the
  correction and mail links, and the mountain guides' weekend strip.
- **A typed result shows the page's own description** (the meta description,
  carried as `summary`): a place its description, an event its day, time,
  venue and first sentence, a guide its excerpt. List pages keep Pagefind's
  excerpt so the match is visible.
- **A place's name outweighs titles** (`metaWeights` title 5, name 15,
  summary 0), so City Star Brewing stays first for "City Star" once its
  event list is out of its text. The summary is shown, not searched.

Proof: 788 snippets over about fifty queries on the five guides and the hub's
1,438 records; the only flags are genuine copy on untyped pages.

### 4. Structured data describes the event, in plain text

Event descriptions were the body's first 300 raw characters, Markdown and
all; the Niwot Great Pumpkin Party and the Johnstown storytime showed it.

- **`src/lib/plain-text.ts`** turns Markdown into text (links to their words,
  session links to "October 19 at 1 pm", emphasis, code, HTML, entities and
  escapes resolved, list items closed as sentences) and clamps at a sentence
  or a word, never inside one. Every Event description and every meta
  description goes through it. An event's meta description keeps at least
  part of the body's first sentence beside a long date-and-place lead.
- **An Event's image is its own picture, else its venue's photograph when
  the venue is a building** (not a park, trail or trailhead, whose photos
  are landscape), else none; anything under Google's 720 px / 50,000-pixel
  floor is skipped. The town hero is never an event image. This replaces the
  10 October rule that every event gets a picture; `og:image` keeps the hero
  as a link preview.
- **SportsEvent markup is gone** from both sports routes, reversing 25
  October: Google's event guidance (8 September 2026) wants one event per
  page and names school spectator events among minors as ineligible, and a
  page per game would be the thin pages the audit rules out.
- **Sports titles are short:** the school page "Berthoud High School
  Spartans Scores & Schedules", a team "Berthoud Spartans Football Scores &
  Schedule 2026", the guide's name only when the whole fits in 70
  characters. The longest went from 91 to 73.
- Checked on 450 event pages across the five guides: every offset matches
  America/Denver on both sides of 1 November, canonical and `url` match,
  every location has a name and address, no description holds Markdown,
  HTML or a cut URL. The noindex on correction and utility routes is
  unchanged and nothing was padded.

### 5 and 6. The flagship home page and one header, and the design frozen

The desktop masthead ran about 724 px on a saturated school-colour band,
half of it empty, with 140 px scores; on a phone it filled the whole first
screen. The owner had already said the colour was too much. The scores-first
page stays; the colour becomes trim.

- **The masthead and hero are the guide's paper.** The school colour is
  trim: the 6 px rule above every page's header, the card's 4 px rule and
  eyebrow, the home side's score, the Home and Away pills. The closing band
  is the page's one full-colour moment.
- **The scoreboard card** (`Scorecard.astro`) is two rows, scores 56 px on
  a phone and 72 px from 64rem, "Next up" one line inside it. Both scores
  the same size and the result said in a word ("Won", "Lost", "Tied"): a
  loss is never dimmed. The team rows under it no longer repeat the card's
  score. With no score and no game the card is not drawn.
- **The page's order**: town and purpose (H1 "This week in <Town>" and the
  tagline), the card, the pick and the agenda, the email on its own with
  the latest issue sent to that town where one exists, "Worth knowing",
  sports in season, the routes beside the town's licensed photograph, the
  closing band. At 1440 × 900 the first screen holds the purpose, the card
  and the week (which starts at y=291; it was 731); on a 390 px phone the
  week starts at y≈751 (was 873).
- **The agenda runs seven days from today**, not Monday to Sunday: past
  days wasted the first screen. Three a day in clock order; on a full day
  the weekly series give up their slots first, so a one-off civic listing,
  a game or a sign-up date is never hidden behind "+2 more" by a regular.
  Registration openings and deadlines sit on their day, so a day with one
  is never "Nothing listed". The Thursday email is not a week item. A
  quiet week says so, with the two links. A row's title follows the events
  page's rule (`agendaTitle`): a closing "at <the venue>" goes when the
  venue line under it says the venue.
- **"Three things to know" is "Worth knowing in <Town>"** (or the notes'
  `knowTitle`), left off when empty. Nothing is manufactured to fill it.
- **One header on every page of every guide.** The per-template colour
  switch, the home-only menu ("Town", mascot-only) and the home footer are
  gone: the complaint was the jump between templates, so the switch went
  rather than being restyled. The menu is **This week, Events, <Mascot>
  sports, Eat & drink, Families, Living here**; "More" is a native
  disclosure with Things to do, Get involved, This weekend, Local changes
  and the nearby guides (eight items and the email button do not fit at
  1280 px). The current page is in the primary with an underline and
  `aria-current`. Search and the email button sit in the same place on
  every page. The phone menu opens to its first link, closes on Escape with
  focus back on the button, on a link and on tabbing out; its label becomes
  "Close menu". Classic guides show "More" where they showed "Towns".
- **School ink.** Text and pills on light grounds use the school's primary
  where it reads at 4.5:1 (Johnstown's red), else the band colour (Erie's
  orange is 3:1 on white, so Erie's ink is black); the top rule is the
  unswapped primary, so Erie's orange and Roosevelt's red still show.
  `check-colors` proves every pair.
- **The design is frozen in `docs/DESIGN.md`**: type, colour roles, space,
  breakpoints, the header, the card, the agenda, tiles, buttons and the
  band, with exact values and the file each lives in, ending with
  "Changing this": a change needs the owner's sign-off and an entry here
  first. `test/design.test.ts` enforces it: the nav order and labels for
  flagship and classic guides, one `<header>` and no colour switch, the
  school colour as a background only on the band, every `/* spec */` value
  in the stylesheet matching `DESIGN_SPEC` in `src/config/design.ts`, and
  DESIGN.md carrying those values.
- **Photographs.** Each town's licensed hero sits beside the routes with
  its credit; nothing was fabricated. Wanted from the owner or the Towns,
  with written permission: a Main Street or community-event photograph for
  each of the five (Niwot's hero is fields, Johnstown's and Erie's roads,
  Lyons's the canyon), and a school-supplied sports photo for any of them.

### 7 and 8. Presentation, and recommendations that do not repeat

- On `/events/`, the next fourteen days hold every occurrence in clock
  order. Unfiltered, weekly regulars and a run's later nights are rendered
  hidden, so the page opens on the one-offs as before and a reader without
  JavaScript sees that view; "Today", "This weekend" and "Next 7 days" show
  every occurrence in the window and the "Every week" directory steps
  aside. The status line counts dates, not series. An unknown time reads
  "Time to be announced", not "All day". A row drops its closing "at
  <venue>" when the line under it prints the venue. An empty section is
  left out rather than announced.
- `ThisWeek.astro` chooses the Nearby picks and hands their keys (page path
  plus title-and-venue series, so tracking parameters do not matter) to the
  day-trips strip, which leaves them out: Lyons showed the Stanley's
  DeVotchKa night twice.
- The hub's weekend six take at most two per town when there is enough
  inventory (`highlights`' per-town cap); the best of the rest fill in,
  never a blank card. Before: Johnstown four times. After: Johnstown 2, Fort
  Collins 2, Carbon Valley, Longmont. The whole list stays on
  `/this-weekend/`.

### 9. The towns' content

- **Unknown hours are never "Closed."** A listing with an editor-set
  `openingHours` over an hours line the parser cannot read counted the days
  it leaves out as closed, and so did "by appointment" days. The badge now
  makes no claim on a day the listing does not settle, and never names a
  "next opening" past an unknown day. A line the parser reads in full keeps
  the usual convention: "Wed–Sat 1–4 pm" means closed Sunday to Tuesday.
- **Program status is never assumed.** Programs carry optional `starts`,
  `ends`, `status`, `statusFrom`, `statusUntil` and `statusNote`;
  `programStatus()` works it out from the dates and says nothing when the
  file says nothing. Ended programs leave the age sections for one "Ended
  for now" list; full ones sort last; a break within fourteen days is a
  notice. Lyons: Backer Football ended 7 October, the Town's youth
  recreation 18 October, the storytime break 27 October to 11 November.
- **A page's "Checked" line says every item was read that day only when
  that is true**; otherwise it gives the range and says they were not all
  read together, and each program, update, Living Here section and district
  calendar shows its own read date (`src/lib/checked.ts`).
- **A nearby town's program is labelled in its title** ("(in Longmont)"),
  since programs have no area field. **An event's timetable is a Markdown
  table in its body**, because `SeasonTable` is for games. **When a
  directory drops a listing's only source**, the listing gets `changeFlag`
  and the evidence, not a closed status (Berthoud's Trailhead Cafe and
  B-Rad's Arcade). **Breaks take the district's schools-closed holidays as
  well as its breaks.**
- Berthoud: the futsal clinic's 1 November registration deadline is the
  next actionable one, from the Town's fall guide; the About page no longer
  says "twenty minutes down the Diagonal", and a test keeps the shorthand
  out. Niwot: the under-fives section has the St. Vrain preschool at Niwot
  Elementary, the Longmont library's storytimes and the school's care, from
  their own pages; the incorporation explainer was re-read against the
  election commission, the county and the Secretary of State with no
  outcome assumed, and Moving Here no longer says the vote "could change
  all of it". Erie: the two-county note no longer says County Line Road
  decides the school district or the sheriff, which the Town's page does
  not say; an `updates/` folder with the 2027 budget and the Briggs and
  Maxwell building; Cristos Coffee and Bridge Refill Market. Johnstown: Wing
  Shack and Animal Crackers Feed on Parish Avenue; Old Town leads the
  featured places; the school-day-off guide is linked from the kids' guide
  and the family hub.

### 10. The business pages lead with what a business can do

`/for-businesses/` opens with three actions: correct a listing, submit an
event, send a photograph (by email, with the permission questions already in
it, because the forms take no files). Editorial independence is four
bullets. The photo policy is written once (`src/lib/photo-policy.ts`) and
used by the editorial, credits and business pages, which had contradicted
each other: the rule is about copying, and an owner's own photograph is
welcome with written permission on file. The claims with nothing behind them
are gone, "media kit" among them: `/advertise/` offers what has actually
been counted, dated, nothing projected. Its pilot example is labelled twice
as an illustration, names no organization, money or result.

The signup reads Buttondown's answer by its error code, not its wording:
only `email_already_exists` and `subscriber_already_exists` are "already",
only `email_invalid` and `email_empty` are "invalid", anything else hands
the reader to Buttondown's own form. "Done" is said only when Buttondown
reports the subscriber active; an `unactivated` answer still says "check
your email"; a press or an opened tab never counts as a subscription.
Double opt-in is unchanged.

### 11. Speed

Lighthouse on the live sites, phone settings: largest paint 1.5–1.6 s on
every page tested, lab blocking time 0–180 ms (not INP), server first byte
0.2–0.5 s. The largest paint is a line of text that redraws when the 67 KB
Fraunces opsz file arrives: without the fonts it is 1.1 s, without the
stylesheets 1.4 s. A tighter character subset saves 5 KB; the size is the
two axes. The choice between keeping it, `font-display: optional`, and the
36 KB file without the optical-size axis is the owner's, since each changes
how the type looks.
## Lyons's lodging page unblocked, and two listings made one, 26 October 2026

*26 October 2026, from the weekly site health check.*

- **The `/stay/` rule on insidelyons.com is gone.** It was one of the nine
  explorelyons.com paths insidelyons.com answers itself (4 October), sending
  `/stay/` to `/things-to-do/`. Since 20 October every guide with lodging
  builds a `/stay/` page, and Lyons listed its own in the sitemap, but a
  host-scoped rule in `vercel.json` is applied by Vercel before any page is
  served, so the page could not be reached and its sitemap entry answered
  308 with Things to Do's title. The other eight rules stay;
  `test/host-files.test.ts` now holds that `/stay/` is not among them. The
  old explorelyons.com/stay/ lands on the lodging page, which is the better
  answer anyway.
- **One file per event.** The Fort Lupton library's Día de los Muertos on
  2 November had three files on the Carbon Valley guide: the handoff's
  (11 October), the Town page's ofrenda viewing night (10 October, same
  evening since its move) and the LibCal feed's (15 October). The feed's
  file is the one kept, because the ingest matches on its `sourceUid` and
  would stage the event again without it; the address, organizer and the
  other two bodies' details (the fifth year of community ofrendas, the
  candlelight, the altars on display 26 October to 9 November, the Town's
  page) are folded into it. Johnstown's Monday 1 pm Music & Movement
  storytime likewise had the handoff's per-date file beside the weekly
  series; the series stays, with the themes carried over. The ingest's
  title match did not catch either because the files came from different
  sources, and the nightly re-check confirmed both copies against the same
  page. Deleted files stay in git history, as the accuracy system says.

## The 27 October audit: every guide, the hub, and the checks that run on their own, 27 October 2026

*27 October 2026, the first full network audit since 2 October: content, design,
accuracy, links, coverage, the business side and the automation, one report per
guide under docs/audits/2026-10-27/ and a network summary beside them.*

- **Two of the eight scheduled runs had failed and nobody had been told.** The
  Monday ingest of 26 October died on one LibCal item (the Fort Lupton library's
  Thanksgiving closure, entered as 9 pm to 8 pm): the reader wrote an end before
  the start, the strict validate refused it, and the 164 events the run had
  approved were never pushed. The LibCal reader now drops an end before its
  start, as the iCal reader does; `toStaged` guards every feed the same way and
  says so on the review line; a test holds the case. The Wednesday research run
  of 21 October threw on Windsor when the model asked for a tool it had not been
  given, so Windsor had no draft, the editor published nothing for it, and its
  This Week page stayed on the week of 19 October. The agent now answers such a
  call with "no such tool" and carries on, and its prompt states the week's date
  window, because Grand Lake's draft picked the Saturday before the week and the
  editor rightly dropped it, which left that page blank.
- **The manager's weekly audit was never created**, as far as the repo can tell:
  `manager/config.json`, which setup writes, does not exist. Whether it should is
  the owner's call; `npm run weekly`, the nightly re-check and an audit in this
  form cover the same ground.
- **Accuracy held.** 293 facts read against the business's or organizer's own
  page: 269 matched, 13 wrong (hours that changed with the season on the
  mountain guides, Birdhouse's closed day in Erie, the Argo Mill's phone), 44
  unreadable because the source blocks machines. Every wrong fact has its
  replacement text in the guide's report; nothing under `content/` was changed by
  the audit.
- **What is chassis-wide:** page titles over 70 characters on a fifth of pages;
  forty mountain access notes going stale together in the next fortnight; a
  staging queue of 233 items the weekly automation cannot drain at ten places a
  week. Each is argued in the network summary.

## The hero photographs: the town, not the county, 27 October 2026

*27 October 2026, the owner's word after the audit: keep the hero, make the
photograph the town's.*

The hero stays on every guide at the size the 26 October pass gave it (328 px
on a phone, 330 on a desktop, the week a scroll below), because it is the one
photograph most home pages have. What changed is the picture on the four
guides whose hero was not the town. Niwot's grassland "near Niwot" is Second
Avenue, the Niwot Tribune storefront (Jeffrey Beall, CC BY-SA 2.0). Berthoud's
Carter Lake is the stone water feature at Town Park (the Town's own
photograph, permission of 21 September). Johnstown's 2010 "road in the
Colorado heartland", which is not in Johnstown, is the Jared L. Brush Barn of
1865, on the National Register a mile northeast of town (Jeffrey Beall,
CC BY-SA 3.0). Erie's Baseline Road is Town Hall, the 1906 Lincoln School on
Holbrook Street (Erie Bard, CC BY-SA 4.0). Each photograph was already
licensed and in `IMAGE_LICENSES.csv`; the old heroes stay in the folders. The
share image of every page without a photograph of its own changes with the
hero.

The validator's rule that a hero and a listing's card never share a
photograph decided three of the four: the Town Park playground, the Parish
House and The Old Mine's 1889 block, each the better picture, are the cards
of their own listings, and a listing keeps its photograph. The barn is a
judgement; the Parish House is the alternative if its listing gives the
photograph up.

Not changed: Timnath, whose only photograph of the town itself is 717 px wide
(a full-width hero would be soft at any desktop width), keeps Fossil Creek
Reservoir until the Town or a resident sends one, which docs/PHOTO-PRIORITIES.md
already asks for; Longmont (McIntosh Lake), Loveland (Lake Loveland) and Carbon
Valley (St. Vrain State Park in Firestone), whose photographs are in the town
even if not on Main Street.

## The home page is a front door, not the whole site, 27 October 2026

*The owner's brief of 27 October 2026: "Sites are way too overwhelming, too
much info at once." The shared town home now shows each thing two or three
times at most and sends the reader on; its two jobs are this week's events
and the Thursday email.*

Measured before the change on a 390 px phone, the Berthoud home was 11,643 px
tall, fourteen screens, with 49 event rows, 66 links and about a thousand
words; Golden was ten screens. After it Berthoud is 2,974 px, three and a
half screens, and What's happening begins 608 px down, inside the first
screen. The brief asked for about five.

The page, top to bottom, the same on every guide and on a phone as on a
desktop: the hero as a short band (the photograph at a fixed height with the
name under it on a phone; the type over the picture from a tablet up), the
three buttons gone and the town's one line kept; the school's strip, one bar
in the school's own colours with the mark, the nickname, the latest result,
the next game and "Scores & schedules" (a phone sees the result alone; a
guide that follows several schools keeps the shared strip; a guide with no
scores or schedule has none); What's happening, three tabs, Today, Tomorrow
and This weekend, up to five listings each with the games among them, "All
events" and "Add an event" under them; the Thursday email, "Your Thursday
local.", one line, the field, the button, "Free. Unsubscribe anytime." with
the word Privacy linked and the privacy paragraph left to the privacy page;
Find your next stop, three photographs for Eat & drink, Things to do and
Living here (Moving here on a guide without a residents' page), each the
best-placed listing's photograph of that kind and the hero where none has
one; Worth knowing, the two newest local changes as titles and "Every local
change"; and the footer as one block, the links in a row, the sections the
menu leaves out in a second row, the independence line and "Part of Inside
the Towns · 20 guides". The neighbours are in the menu's Towns list and not
in the footer again.

Off the home, and on their own pages still: the seven-day agenda
(/this-week/, /events/), the scoreboard (/sports/), the changes' summaries
and sources (/updates/), the three place cards and the list of eight
(/directory/, /eat-drink/, /things-to-do/), From the guide (/guides/),
Nearby this weekend (the Towns menu and /this-weekend/), the "More of"
grid, the "kept by the people who use it" band (Add an event is under the
events; Suggest an update is in the footer) and the network strip. Every
link the removed sections carried resolves from the menu or the footer.

The tabs are built from the same `weekDays` reading the Thursday email and
the events page use (src/lib/home-tabs.ts), so the three never disagree with
either about a day. The weekend is `weekendWindow`'s: the one under way on a
Friday, Saturday or Sunday, else the one coming. A full tab gives the weekly
series up first, as a full day does on the events page. The tab that opens
is Today, or This weekend from Friday to Sunday; the page is built once and
read for days, so a few lines of script (no framework, bundled as a file for
the CSP) choose the tab again by the reader's own day in Denver, and the
freshness pruning takes a row off once its day is over, with "Nothing listed
for today" standing in. An empty tab keeps its tab.

Not changed: any other page, the newsletter wiring, the sports data, the
verification system, and no per-town variant. Where a guide has no
photograph of a kind, the tile shows the hero, as the brief says; Berthoud's
Eat & drink tile is the Town Park water feature until a restaurant or bar
listing carries a photograph. Berthoud screenshots before and after, phone
and desktop, are in docs/screenshots/2026-10-27-home/.

## Title tags fit in 70 characters, and the past one-offs come off, 27 October 2026

*The 27 October audit's two network findings the assistant could act on
alone, done the evening the owner said "start on yours".*

- **The guide's name rides on a title only where it fits.** 163 of 531
  event titles and 31 of 259 place titles across seven guides ran past 70
  characters as "[Page] — October 13, 2026 | Inside Berthoud"; search
  results cut at about 60, so the guide's name was what got cut, after the
  date. The sports pages had settled this on 21 October (`sportsFullTitle`,
  70): the full form where it fits, the page's own title alone where it
  does not. `pageTitle` now does the same for every page (`fitTitle`,
  `TITLE_LIMIT` in `src/lib/titles.ts`), and an event's title date is
  "Oct 13", with the year only when it is another year (`titleDate`). On
  Berthoud: 2 of 139 title tags over 70, both the page's own long words,
  from 20 of 75. The name is still in `og:site_name` and the wordmark.
- **96 past one-off event files deleted** in Berthoud (31), Lyons (51)
  and Niwot (13), the ones `npm run weekly` had listed as "already past"
  for a week or more; the four program pages and one correction that
  linked to them say the same thing without the link. Three weekly series
  whose last date passed (the Lyons library's two storytimes, Niwot's
  Rotary breakfast) stay, on the to-do list to re-list once the organizer
  gives the next dates: a series is not over because its calendar ran out.
- **Lyons's election-day listing** points at the county's own vote-centers
  page (bouldercountyvotes.gov now redirects there); the hours it gives
  match the listing.

## The scorecard fills itself on Tuesdays; the audit's link list, 27 October 2026

*The owner connected GSC Wizard and put Buttondown's key in the cloud
environment the same afternoon, and said yes to a scheduled scorecard
session and to the assistant's share of the audit's link fixes.*

- **The scorecard is a scheduled session, Tuesday 11:17 Denver, 3 November
  to 19 January.** Tuesday rather than Monday because Search Console
  settles a Sunday about two days later; a week not yet settled is not
  written half-filled. It reads GSC Wizard and Buttondown (GET only),
  writes counts and never an address, and opens a pull request. It runs in
  the session that holds the GSC Wizard connection, because a fresh
  session started by a schedule does not carry connectors. Buttondown's
  subscriber objects come back with an empty `tags` list, so subscribers
  are counted by filtering on each town's tag id.
- **Erie:** the 3 November Town Council study session is gone from the
  Town's calendar feed (which lists a liquor-license hearing that day) and
  its event page now sends readers to a login, so the listing is removed;
  the two 7 October files behind the same login go too.
- **Evergreen:** the Chamber's Santa Breakfast page now lists two dates,
  not four: Sunday 6 December at Hiwan Barn and Saturday 19 December at
  The Wild Game, two seatings each, $28. The 28 November, 5 and 12
  December listings are removed (the 28 November detail page still
  answers, but the Chamber's own series page says "both dates"); 19
  December is corrected and 6 December added, from the four seating pages.
- **Fort Collins:** the City link and the police link in the guide's
  config move to fortcollins.gov. Jax Outdoor Gear stays as it is: the
  only page with its hours has an expired certificate.
- **Johnstown:** Thanksgiving Place Cards (24 November) is removed; the
  library's API says the event is no longer available. The Weld RE-5J
  calendar keeps the district's own link, which redirects to a versioned
  file on finalsite's CDN: the district's link survives a re-upload, the
  CDN's does not.
- **Windsor:** the Severance article's Property Portal link goes straight
  to apps.weld.gov.
- **Idaho Springs:** the two staged Black Hawk places whose City sources
  are now 404s say so in their review note; they wait on a call.
- **Left, and why:** Golden's history article still cites the museum's
  walking tour, which is gone; an archived copy of 22 June 2026 exists but
  could not be read from the assistant's container, and a citation is not
  moved to a page nobody has read. Estes Park's Whiskey Vault page is a 404
  that the hotel's own dining page and sitemap still link, so the listing
  stays and the call goes on the list.

## The three heroes are paintings, 27 October 2026

*The owner's word, after three rounds of mock-ups the same day: "keep
current for find picture or use the storybook feel for all towns", the
assistant's call asked for and given, and "fix on desktop and mobile for
all then PR".*

- **Why a painting.** The heroes were 2010 to 2014 Wikimedia photographs,
  Lyons's of the highway canyon rather than the town, against the rule that
  the hero is the town itself. A current, licensable photograph of each town
  on a good day is the job that never gets done; a painting gets done, makes
  the guides one family, and costs nothing per town after the first.
- **Why drawn in code and not generated.** An image generator invents the
  buildings and storefronts of the place it claims to show, which breaks the
  guide's one promise. The paintings are composed from the guide's own
  reference photographs: the Lyons church, depot and sandstone band; the
  Niwot Tribune and Second Avenue, with the range traced from the owner's
  photo from the fields; the Bimson Blacksmith Shop and Pioneer Park in
  Berthoud. Each is a composition, not a single view, and its alt text says
  "illustration". `scripts/heroes/` holds the scripts and how to render them.
- **Photographs everywhere else.** Listings, the home tiles and articles
  keep photographs; people choosing where to go need the real place.
- **The hero band for a painting.** `painted: true` drops the photograph's
  full-width scrim and town-colour wash, which turned a painting to mud, for
  a soft shade behind the words only. White type on it measured at least
  6.2:1 at 768, 1,024, 1,280, 1,440 and 1,920 px on all three. `position`
  sets each painting's focus: the town in frame on a phone, and on a wide
  screen, where the band shows only a third of the picture's height, the
  town's buildings above the sports strip.
- **The other guides** keep their photographs until the 90-day test ends on
  20 January 2027.

## Every guide's hero is a painting, 27 October 2026

*The owner's word, on the Lyons, Niwot and Berthoud paintings:
"Looks really good do for all towns so brand is consistent."*

- **The other seventeen live guides get one now**, not after the 90-day
  test. That bullet in the entry above is superseded: the paintings are
  the network's look, and one family of three among twenty read as an
  experiment rather than a brand. Castle Rock, on hold, is not live and
  gets its painting before it launches; the four redirect guides have no
  home page to put one on.
- **Same rules as the three.** Each scene is composed from the guide's own
  reference photographs in `content/<town>/images/`, and its script's
  docstring and alt text say what is in it and that it is a composition.
  Where the guide has no photograph of a landmark, the landmark is left
  out rather than invented: Nederland's Carousel of Happiness, Timnath's
  grain elevator and reservoir, Leadville's Mount Elbert and Mount
  Massive, Dacono and the rebuilt fort in Carbon Valley, Pikes Peak in
  Elizabeth, and every elk in a tagline. A licensed photograph of any of
  them lets the script add it later. Golden's painting leaves out the
  Coors brewery on purpose: it is a brand, and a big pale block where the
  type sits.
- **The type.** Measured on the built pages at 768, 1,024, 1,280, 1,440
  and 1,920 px, against all but the brightest 5% of the painting behind
  each line, the pool alone left four of the seventeen taglines under
  4.5:1 and six more under the 6.2:1 the first three had. The pool is
  centred on the name, and the longer tagline ran past its edge onto gold
  trees and pale meadows (Erie 3.86:1 at 1,024 px, Golden 4.32:1 at 1,920).
  A bigger pool fixed the numbers and darkened Lyons's church and Erie's
  Town Hall, which is the mud the painted hero exists to avoid. Instead the
  eyebrow and the tagline each carry a soft shade the width of their words
  (`src/components/Hero.astro`), and every line of all twenty paintings,
  the first three included, now measures at least 6.37:1 at every width.
- **The hub** keeps its aerial photograph: it is the network, not a town.

## The heroes are photographs again, 28 October 2026

*The owner's word, the morning after: the painted heroes "turned out to be
eh not great"; use the photograph plan instead (`docs/HERO-PHOTOS.md`, the
owner's research of the same day).*

- **The two entries above are undone.** Every guide's hero is a
  photograph again: the seventeen that had one on 27 October go back to
  it, and Lyons, Niwot and Berthoud go back to theirs, with the two
  changes below. The paintings, `scripts/heroes/` and their twenty rows
  in `IMAGE_LICENSES.csv` are removed; they are in the history at
  838d5b5 if a painting is ever wanted for something other than a hero.
  `Hero.astro` drops the painted band (no scrim, the pool, the line
  shade) and keeps `position`, which works for a photograph too.
- **Two free swaps from the plan, now that Commons answers.** The plan
  could not open Commons; it does open through `thumb.php`, as
  `docs/PHOTOS.md` says. Carbon Valley's hero is Jared Winkler's Fifth
  Street at Oak in old-town Frederick (2018, CC BY-SA 4.0), at 2,400 px,
  in place of St. Vrain State Park's pond. Lyons's is Billy Hathorn's
  Main Street looking west to the hogback (2010, CC BY-SA 3.0), at
  2,400 px, in place of the Colorado 7 canyon, which was not the town.
  The Main Street listing gives that photograph up, as Elizabeth's Main
  Street did on 4 October, until the hero the plan picks for Lyons is
  bought; then the listing gets it back.
- **Looked at and left.** Longmont's Main Street at 5th (Billy Hathorn,
  2010, 4,000 px) has a median tree in the middle of the frame and a
  Winchell's sign. Loveland's Rialto and 4th Street photographs, and
  Windsor's Town Hall, are listing cards. Niwot's hero, Second Avenue and
  the Niwot Tribune under CC BY-SA 2.0, is the Old Town photograph the
  plan says does not exist, and stays.
- **Bought photographs have a ledger shape.** A row that starts with the
  agency and the kind of licence (`iStock editorial licence (John M.
  Chase; 2021); bought … — see PERMISSIONS.md, section: Stock licences`)
  reads as "John M. Chase, iStock editorial licence" on `/credits/`, and
  the caption must name the agency (`src/lib/credits.ts`). The rule in
  `HOW-IT-WORKS.md` now says a standard licence is as acceptable as an
  editorial one for a real photograph of the real place, and that drawn
  or painted heroes are out. The public policy line (`PHOTO_ACCEPTED`)
  and the credits page say so too, so they stay true the day the first
  one is bought. `PERMISSIONS.md` has an empty *Stock licences* section
  for the receipts.
- **What is left is the owner's:** about $190 of iStock, Adobe Stock and
  Shutterstock downloads, and the shots for Johnstown, Timnath, Niwot
  and Berthoud. `docs/HERO-PHOTOS.md` says which, town by town, and how
  each goes in.

## Creative Grounds: a confirmed source for Lyons, its classes and its photographs, 28 October 2026

*The owner's word, forwarding Casey's reply and three photographs: "add to
Lyons and include all events from their website and in rules allow the
site to be a source for events."*

- **The source.** `creativegroundslyons-com` is in `content/lyons/sources.json`
  as a confirmed, core venue source. Its class calendar is a Squarespace
  events list; the site's robots.txt disallows `?format=ical` and
  `?format=json` for every agent, so there is no feed to read and the
  type is html, read by hand and by the nightly re-check.
- **Every class is listed**, 11 files for the 33 dates from 28 October to
  18 December. The four five-week courses and the Friday wheel class are
  weekly series with the weeks off in `except`; the Friday handbuilding
  nights change theme (sculpting, trays, ornaments), so each is its own
  listing. The Wednesday course is listed though Creative Grounds marks it
  sold out, with the words in its cost line.
- **Where the site disagrees with itself, the listing says so.** The
  Thursday course takes Casey's 1:30 to 4:30 (`confirmed`, by email), not
  the 1:30 to 4 its pages still show. The Sunday course takes the calendar
  and sign-up's 2:30 to 5 with a "to be confirmed" time note, because the
  description says 2 to 4:30 and December 13's entry 2 to 5:30. The Friday
  handbuilding nights give both age ranges their page does (12–21 in the
  title, 14–21 in the description). Both questions are on Casey's
  follow-up.
- **The café is a listing** (coffee, so it is on Eat & drink), with the
  building front as its card and the studio and the patio in the page.
  Casey's photographs are recorded under *Creative Grounds* in
  `PERMISSIONS.md` and credited "Creative Grounds" through a new grant in
  `src/lib/credits.ts`, with Casey's email quoted in full. Casey offered
  them "for the Creative Grounds page", so they are on that page and
  nowhere else: not on the class listings, and not in the Thursday email
  until Casey says yes. Casey calls Creative Grounds "the client", so the
  contact record now has Casey as probably an agency or publicist.
- **Not changed:** Western Stars Gallery & Studio's listing has the same
  address, 160 E Main St, and its signs are in the windows of Casey's
  photograph of the building. Whether it is still there is a question for
  Casey, not a guess.

## The first bought heroes: Berthoud, Loveland and Lyons, 28 October 2026

*The owner bought iStock 1417954947 and Adobe Stock 412335350 and 754641294
and uploaded them to `main`, and sent iStock's Content License Agreement.*

- **The photographs.** Berthoud: John M. Chase's "Downtown Berthoud
  Colorado", 17 July 2021, Mountain Avenue with its planters, the
  storefronts and the grain elevator painted with a farm family, under
  iStock's licence marked "Editorial use only". Loveland: Jacob Boomsma's
  winter aerial of downtown with Lake Loveland and the foothills beyond,
  under Adobe's standard licence. Lyons: LD Productions' view across the
  valley to the foothills, 8 March 2024, under Adobe's standard licence;
  it shows the town's setting more than the town, which the owner has
  seen, and the Main Street listing gets its photograph back. All three
  are the plan's picks
  (`docs/HERO-PHOTOS.md`). The uploads had no rows in
  `IMAGE_LICENSES.csv`, which fails the validator and every build on
  `main`; this change adds them.
- **The files stay as the agencies delivered them.** Section 11(d) of
  iStock's agreement asks that the embedded record (the photographer,
  iStock's name, the content's identification number) stay in the file,
  so no file is renamed, resized or stripped; the site makes its own
  renditions at build. A first pass had resized and stripped the
  Berthoud file; it was replaced before merging.
- **The credit goes on the photograph when the licence says so.** iStock's
  section 7: editorial use "must include the following credit adjacent to
  the content", "iStock.com/Artist's Member Name"; the photographer's
  member name is JuniperCreek. The hero has carried no caption since 26
  October, so `creditBeside` in `src/lib/credits.ts` names the licences
  that need one (an editorial stock licence) and `Hero.astro` prints that
  credit, small, in the photograph's corner, for those heroes only. The
  two Adobe photographs' standard licence asks for none.
- **The Berthoud crop stays centred.** Higher, to take in the whole
  mural, the dentist's sign sat behind the town's name on a wide screen.
- **The repository is private now.** iStock's 3(c) forbids use "that
  allows others to download, extract, or redistribute content as a
  standalone file", and its section 5 storage "on a server" that more than
  one person can reach, and the repository was public when the files were
  uploaded. The owner made it private the same day.
- **Not in:** the Bimson Blacksmith Shop, which is the Pioneer Museum
  listing's free Commons photograph.

## The heroes at full colour, shaded only behind the words, 28 October 2026

*The owner: "would hero images look better if more bright less of black
gloss over? your call."*

- **What was over every photograph.** A black scrim across the whole band
  (0.88 at the foot, 0.5 at 55%, 0.36 at 86%) and the town's colour at 20%
  multiplied over every pixel. The type read at 9:1 to 15:1 on most guides,
  well past the 4.5:1 it needs, and the photographs read as dusk.
- **What is there now** (`Hero.astro`): the tint is gone; a light shade
  along the foot (0.35, gone by 40% of the height) where the band meets the
  sports strip; a pool behind the text column, darkest behind the name and
  clear well before the middle of the picture; and a soft shade the width
  of its words under the eyebrow and the tagline. On a phone the type is on
  the town's colour under the photograph, as before, and none of it shows.
- **Measured, not judged.** Every live guide's home page was built and
  rendered at 768, 1,024, 1,280, 1,440 and 1,920 px; for each line of type
  the contrast was taken against all but the brightest 5% of the picture
  behind it. Before: eyebrow at least 4.66:1 (Niwot, 1,024 px), name 5.90,
  tagline 8.58, and the picture away from the type at a mean relative
  luminance of 0.057. After: eyebrow at least 6.11:1, name 4.95 (Carbon
  Valley's long name over its snowy sky; large type needs 3:1), tagline
  6.24, and the picture at 0.150, about two and a half times as bright. A
  lighter setting (pool 0.5, line shade 0.38) added almost no brightness
  (0.160) and took the eyebrow to 4.82 and the name to 3.70, so it was not
  used.
- **The phone tagline is full white.** The same measurement on a phone
  found the tagline, white at 85% on the town's colour, under 4.5:1 on
  three guides: Golden 4.17, Niwot 4.27, Timnath 4.31. On the phone band it
  is full white now, 5.07:1 or more on every guide.

## The hero's photo credit without its box, 28 October 2026

*The owner: the credit on the hero "looks bad"; make it not visible.*

It cannot go: the Berthoud photograph's editorial licence requires
"iStock.com/Artist's Member Name" adjacent to it (iStock's agreement,
section 7), and a credit nobody can see is no credit. The owner chose a
subtler one. The dark box is gone; the words sit on a soft, blurred
shade with a faint shadow, the way a magazine credits a photograph.
Measured against all but the brightest 5% of the picture behind it, with
the shadow left out: 5.22:1 at 1,280 px and 5.55:1 at 1,920 (the box gave
8.96 and 9.44), and 4.65:1 on a phone, over the light road, where the shade
is darker.

Later the same day the owner asked for it half the size. Half is 7px, which
reads as a smudge rather than a credit, and the licence needs a credit; it
is 10px instead (from 14, under the 14px floor for supporting text by the
owner's call), letter-spaced a little, with the shade a touch darker on a
phone: 5.27:1 on a phone, 5.08 at 1,280 px, 5.31 at 1,920.

Then smaller again, at the owner's word: 8px, with a tighter shade. 4.52:1
on a phone, 4.95 at 1,280 px, 5.25 at 1,920. That is the floor; smaller
than this it stops reading as the credit the licence asks for.

## No new tab for an address Buttondown already has, 28 October 2026

*The owner, urgently: the newsletter signup "opens new window", needs a
confirmation there, and "has too many steps".*

The in-page signup (25 October) handled a new address on the page, but an
address Buttondown already had was told "Buttondown already has that
address" and offered "Continue on Buttondown": a new tab, its "Verify and
Subscribe" page, then the email. The live function, tried with an address
on the list, answered `already`, which is that panel. A second way to the
same tab: Buttondown's firewall scoring the reader's IP as spammy, which a
shared or relayed IP (iCloud Private Relay on an iPhone, a VPN) can do.

- **An address already on the list is settled on the page**
  (`src/lib/subscribe.ts`, `existing`). The function looks the address up
  and acts on its state. Active: the form's towns are added
  (`X-Buttondown-Collision-Behavior: add`, which Buttondown documents as
  combining tags), and the page says "You're already on the list" with no
  button. Never confirmed: Buttondown sends the confirmation email again
  and the page says to check it. Unsubscribed: resubscribed as
  `unactivated`, so they are back only once they click a new confirmation
  email. Blocked, complained, undeliverable or removed: untouched, and the
  page offers Buttondown's form as before.
- **This reverses one line of 25 October**, which left adding towns to an
  existing address to Buttondown's own form. A stranger can now add towns
  to someone's subscription from a public page; towns are only ever added,
  never removed, to an email that person already takes, and every issue
  carries the link to leave. Tags are not sent with a PATCH: Buttondown's
  subscriber objects come back with an empty tag list, so a list sent that
  way would replace the reader's towns.
- **A spam-scored IP is tried once more past the firewall**
  (`X-Buttondown-Bypass-Firewall`, five an hour per newsletter), still with
  no subscriber type, so the confirmation email stands between the address
  and the list. A blocked address is not retried.
- **Not changed.** The confirmation email for a new address: double opt-in
  is Buttondown's setting and the owner's call (25 October). Buttondown's
  own form in a new tab stays as the last resort, when the page's call
  cannot settle it.

## Golden as a flagship, 28 October 2026

*The owner, after Golden's first week in Plausible (106 visitors, rising
from about 10 a day to 28): "bring golden back and enhance anything
needed I want flagship such as berthoud… I believe golden has huge
potential."*

Golden had been a visitor guide since 20 October ("The other mountain
guides"): no email, no signup box. Two readers had signed up for it on 17
and 20 October and were tagged `golden` in Buttondown, so nothing went to
them on Thursdays; they get the Golden edition again from its next send.

- **The same flagship as the others.** `visitorGuide` comes off and `home`
  goes on; Golden gets a Families hub (fifteen programs, Jeffco Public
  Schools' days off for 2026–27), Living here (seven sections) and Get
  involved (eleven ways in), every item from the City's, the county's,
  RTD's, Jeffco's or the organizer's own page, read 28 October. Its first
  local update is the City's scam alert. `test/flagships.test.ts` holds
  eight.
- **Golden High, the Demons.** Followed on MaxPreps with the default fall
  and winter teams (CHSAANow lists them all). MaxPreps refuses the cloud
  address, so the colour and the first data file came from the runner: the
  sports probe on this branch (run 40789110242) read MaxPreps's school
  colours, crimson 8F0018 and white, and the full run wrote
  data/golden/sports.json (football 8-1, boys soccer 12-1-2, volleyball
  18-1). The scoreboard band is the crimson, 9.6:1 under white; the guide
  keeps its copper. No school calendar is checked yet (Jeffco's school
  sites did not answer the cloud address), so games to come are on
  MaxPreps's word, and the page says so.
- **Its own edition again**, nine in all. The mountain chassis stays: Golden
  is still "up the hill" for the Front Range guides' day trips.
- **What the sources would not give.** The City's Fix It! and registration
  pages refused automated readers (403), so their items link the City
  pages that describe them; swim-lesson and class fees are "Not stated".
  Rooney Road Recycling Center's and the City's Granicus portal's
  robots.txt ask readers to stay out. Kiwanis of Golden refused (403) and
  has no entry; Golden Youth Football's league site refused too. Jeffco's
  online school calendar is disallowed; the breaks are from the district's
  family-calendar PDF. Summer break is not listed: the calendar gives the
  last day of school, May 27, but no end to the summer.
- **Conflicts left for a person.** The City's trash pages name 5280 Waste
  Solutions as its hauler, its water page and contact list Republic
  Services with the same phone number; the guide follows the trash pages.
  The Parks page counts 19 parks and 42 miles of paved trail, the New
  Resident Guide 21 and 24. The Ore Cart page says it doesn't run on Mines
  holidays, the City's Ride page says federal holidays.
- **The owner's.** A Formspree form for insidegolden.com (its contact and
  event forms are email until then), and the photographs on the
  photo-priority list.

*The same day, the events.* Golden's calendar went from 12 upcoming
events to 79, each read from its organizer's page on 28 October: City
Council meetings and Cookies with Councilors, the museums, the library's
one-off programs, the Buffalo Rose, Miners Alley, Foothills Art Center,
Mines home games and talks, the Home and Mineral shows, the Great Turkey
Chase and the holiday season; nine listed ones were corrected or
re-checked. The library's weekly storytimes were written as repeating
listings and then left out, as Golden's launch review and the 2 October
rule on regulars say; the Families hub carries them in full. Miners
Alley's box office refuses automated readers, so its dates are Visit
Golden's; the Buffalo Rose is read at buffalorosegolden.com, since
buffalorose.net resets the connection. **For the owner:** Jefferson
County's robots.txt added, on 21 October, a disallow for its iCal feed
path written in lowercase; the ingest's check matches paths by case, as
the robots standard does, so it still reads the feed. Whether to stop
reading it is a call about what the county meant.

## CivicPlus's calendar feeds: read as meant, and subscribed to on purpose, 29 October 2026

*The owner, on Jefferson County's new robots.txt rule: "not sure, decision
yours."*

The rule was not the county's alone. On 20 and 21 October CivicPlus
added the same block to every town site it hosts ("# added 2026-10-21 by
Add-RobotsRules": Berthoud, Erie, Frederick, Windsor's recreation site,
Jefferson County and more): `Disallow: /rss.aspx` beside the old
`/RSS.aspx`, and `Disallow: /common/modules/icalendar/`. The feeds live at
`/common/modules/iCalendar/`, on servers that ignore case. Read by the
letter of RFC 9309, the rule kept nobody out, and the import had gone on
reading thirteen of these feeds on eight sites without anyone deciding it
should.

- **A disallow is now read whatever its case** (`scripts/lib/robots.ts`),
  for every script that asks: the import, the nightly re-check, the link
  checker, the source check, the sports reader. Allow rules still match
  exactly, so case never opens more than a site wrote. Measured first
  against every registered feed: the only ones it closes are these
  thirteen.
- **Those thirteen are read on purpose, under `robots: subscribe`.** Each
  is the feed the site itself offers residents as a calendar subscription
  ("Subscribe to iCalendar"), and one nightly read is what any subscribed
  phone calendar does, which is the case the 2026-10 rule on
  `robots: subscribe` was written for. Carbon Valley's eight (Dacono,
  Firestone, Frederick, Fort Lupton), Windsor's four (Severance, Windsor's
  recreation calendar), Black Hawk's for Clear Creek, and Jefferson
  County's Open Space calendar for Golden and Evergreen. Each source's
  notes say so, and ingest prints "read under the editor's robots:
  subscribe" whenever it uses one. The weekly source check now checks such
  a feed as ingest reads it, rather than reporting it skipped.
- **Undoing it** is one field per source: `robots: honor` and the feed is
  left alone. If CivicPlus or a town says it means the subscription links
  too, that is the answer, and the events come from the sites' own
  calendar pages, which their robots.txt still allows.

## Golden's review queue, 28 October 2026

*The owner: "review golden's queue".* Fifteen items were waiting: thirteen
staged places from 6 October, the choir's concert from the day before, and
one flagged event. Each was re-read on its own site the same evening, under
the event standard and the entry rule (a phone, a website and hours from the
business itself), and approved through the review's own `approveText`.

- **Approved: three places.** Bentgate Mountaineering, whose hours page now
  gives new weekday hours and says "Closed Saturdays" twice, in the table and
  in its description, so the closure is meant rather than a slip. The
  Buffalo Rose, read at buffalorosegolden.com (as its events are since 28
  October), which gives the address, the phone and the hours; filed as a
  restaurant, since its hours are the kitchen's and its shows are on the
  calendar. Miners Alley, whose site now answers: address, phone, history and
  parking from its own pages. It posts no box office hours, so the listing
  has none and says so, as the Fort Collins theaters' do.
- **Removed: the past Yoga with a Ranger** (24 October), as the 27 October
  audit proposed; the 21 November session is listed.
- **Held, each with what it needs:** the choir's concert (its pages still
  give December 12 and December 26); Coors (now 403); Golden City Brewery
  (address now from its own site, hours still summer last calls); the
  Golden Mill (hours now agree, still no phone); Peak Cycles, Sherpa House,
  Table Mountain Grill and YoColorado (no store hours of their own); Abejas
  (403); Red Silo (the domain no longer serves a site); Windy Saddle (the
  name does not resolve). YoColorado's body loses its airport store: its
  About page calls Basecamp its one and only.

## Golden Hour Pilates on Inside Golden, 29 October 2026

*The owner passed on Bailey and Christy's reply to his request for the
studio's details, with three photographs, and no instruction beyond it; read
as: list the studio on Inside Golden.*

- **The listing** is `content/golden/places/golden-hour-pilates.md`, read
  against the studio's own site (the FAQ, pricing, method and about pages,
  rendered in a browser, since the Canva-built site serves an empty shell to
  a plain fetch) and the owners' email. The address takes the owners' Suite
  114, which the site leaves out; the site disagrees with itself on the rest
  (its footer reads "10 Golden Ridge Rd" on two pages and 710 on the
  others, and its FAQ gives the ZIP as 80439 against the footer's 80401),
  so the listing says 710 and no ZIP, as Golden's other listings do.
- **A service.** It is the first `service` in Golden: a studio is neither
  a venue in the guide's sense (a room where the town's events happen) nor
  a shop. It is in the directory; Golden gets a Services page at three.
- **The hours line is the owners' pattern, not times.** The owners: "up
  to 3 classes per day, 7 days a week. The times change." There are no
  fixed times that would stay true, so `hours` reads "Up to three classes a
  day, seven days a week; times change" (left empty, the page said "Hours
  unknown", which was less true), and the page sends the reader to the
  schedule. The parser cannot read it as a schedule, so the page claims no
  open-or-closed status and the validator counts it with the other text
  lines, as it does the Caribou Room's "Show nights only". The Walla
  schedule widget renders nothing to a headless browser, so no class times
  were read and none are listed; the classes are not events.
- **The photographs.** The owners' line, "All pictures we have sent may be
  used in the publication of Inside Golden", is recorded under *Golden Hour
  Pilates* in `PERMISSIONS.md` and credited "Golden Hour Pilates" through a
  new grant in `src/lib/credits.ts`. The empty studio is the card; the two
  class frames, which came as phone screenshots, are cropped to the
  picture, not enlarged, and sit in the page. The scope is Inside Golden,
  the site and its email, as their words say.
- **Not done.** No source registry entry: their events will come through
  the event form, which is what they said they would do.

## Golden Hour Pilates, re-filed and announced, 29 October 2026

*The owner, after the listing went live: "I don't see any update on them
on site".* The page was live, but only the directory, the search and the
sitemap linked it: a `service` is listed under the directory alone, and the
27 October home page shows no new places.

- **A venue, not a service.** Every recreation and community center on the
  network is a `venue` (Berthoud, Carbon Valley, Erie, Estes Park,
  Evergreen's two), and `service` holds visitor centers, libraries, town
  offices and transit. The studio is now a venue, so it is on Things to do
  and the Venues page. This undoes the "A service" bullet of the entry
  above.
- **Added to the guide.** Golden's notes for the week of 26 October carry
  an `added-to-guide` item for the studio, so it is under New & closed on
  This week until 9 November (the default fourteen days from the week).
- **Not changed: `added`.** The listing went on the guide on the evening of
  29 October, after that morning's email, whose window ran 23 to 29
  October; the next issue's starts on 30 October, so as dated the studio is
  in neither issue's New on the guide. Moving `added` to 30 October would
  put it in the 5 November issue at the cost of a date that is a few hours
  wrong; that is the owner's call.

## Golden Hour Pilates dated into the 5 November email, 29 October 2026

*The owner: "yes", to moving the studio's `added` to 30 October so it is
in the next Thursday email.* The listing went on the guide on the evening
of 29 October, after that morning's issue (window 23 to 29 October), so
as dated it was in neither issue. `added` now reads 30 October, a few
hours later than the truth, and `npm run newsletter -- --town=golden
--date=2026-11-05` lists it under New on the guide. Nothing else reads the
field.

## Erie's bought hero: Briggs Street from above, 30 October 2026

*The owner bought Adobe Stock 511199397 and uploaded it to `main` with no
row in `IMAGE_LICENSES.csv`, which failed the validator and every build.*

- **The photograph.** Noel's drone frame of Briggs Street, Old Town Erie's
  main street, from about 14 m up on 6 June 2022, looking south: a brick
  two-storey building and a patio on the left, houses and tall trees on
  the right, the street running out to the plains. It replaces Town Hall
  (the 1906 Lincoln School), one building, with the street; the Town Hall
  photograph stays on the Explore Erie article.
- **Not the wrong place.** The hero plan set this asset aside because
  Adobe keywords it church, castle, cathedral, europa. The file's GPS
  record (40.0511° N, 105.0474° W) is 660 Briggs Street by OpenStreetMap,
  and the drone faced south (yaw 180°), which is what the frame shows.
  `docs/HERO-PHOTOS.md` says so now.
- **Kept as delivered**, as Berthoud's, Loveland's and Lyons's: the file's
  own name, full size, its embedded record kept; the site makes its own
  renditions at build. Credited "Noel, Adobe Stock" on /credits/ only.
- **The licence is standard.** Adobe's page answers 403 to the assistant;
  the owner sent Adobe's licence record the same day, which lists asset
  #511199397 at 5460 × 3637 under the "Standard" licence, 30 October 2026,
  4:44 pm. So nothing goes on the photograph. The record has no order
  number or price; `PERMISSIONS.md` says so.

## Five more bought heroes: Clear Creek, Leadville, Manitou Springs, Fort Collins and Golden, 30 October 2026

*The owner bought Adobe Stock 413103868, 1111460584, 357829842, 419314122
and 504466744, five of the seven credits' worth suggested that afternoon, and
uploaded them to `main` with no rows in `IMAGE_LICENSES.csv`, which failed
the validator again.*

- **Clear Creek:** Jacob Boomsma's aerial of Idaho Springs on 25 January
  2021: the Argo Gold Mine and Mill on its hillside, Clear Creek and the
  riverside park, the town climbing the canyon. The hero was the mill
  alone; now it is the mill with the town. GPS: the Argo Mill on Miner
  Street. Cropped at 50% 45% for the wide band.
- **Leadville:** Joe Sohm's drone frame up Harrison Avenue on 2 October
  2023, from above a copper cupola: the brick blocks, the aspens turning,
  the mountains. The hero was the town among aspens from a distance. GPS:
  the 300 block of Harrison Avenue. Cropped high, at 50% 20%, so the band
  keeps the mountains and the blocks rather than the cupola.
- **Manitou Springs:** Jacob Boomsma's aerial of 12 June 2020: Manitou
  Avenue curving through the downtown blocks, the slopes, the red rock and
  the mountains. The hero was Manitou Avenue at street level, which was
  already the town; this is the town in its canyon. GPS: over Pawnee
  Avenue, above downtown. Cropped at 50% 66%, on the street and the blocks.
- **Fort Collins:** Schrodington, LLC's Old Town Square, 24 July 2020: the
  splash pad, the string lights, the café umbrellas and the sandstone
  blocks. The hero was the Northern Hotel, one building. The file has no
  GPS; the square is identified by what is in the frame. Cropped at 50% 55%.
- **Golden:** Jacob Boomsma's aerial of 30 August 2021 from above the
  Table Mountain Inn: Washington Avenue under the Welcome to Golden arch,
  North Table Mountain's rimrock, the foothills. The hero was Clear Creek
  and its kayakers. Cropped high, at 50% 15%, for the mesa and the
  foothills over downtown; the arch is lower in the frame and shows where
  the band is taller.
- **Kept as delivered**, as the other bought heroes; credited on /credits/
  only, under the standard licence the plan read on each page.
- **The licences are standard.** The owner sent Adobe's licence records for
  all five the same day: each says "Standard", Leadville's too, though its
  caption is dated the way editorial photographs are. Nothing goes on any
  photograph.
- **Estes Park, the same afternoon:** Josh-Lehew's aerial of Elkhorn Avenue
  in autumn (Adobe 2151219980), in place of the town from the Gem Lake
  trail. The file has no date and no GPS; the avenue is identified by The
  Wheel Bar's sign (132 East Elkhorn) and the street itself. Cropped at
  50% 28%, along the avenue to the hills. Its licence record, sent the
  same afternoon, says Standard.
  Lyons keeps its hero: the owner looked at Adobe 636832312 and it has no
  street in it.
- **A credit fixed:** the ledger reads a photographer's name up to the first
  comma, so Fort Collins's "Schrodington, LLC" showed on /credits/ as
  "Schrodington". The row and the config now read "Schrodington LLC".

## Five domains held, 30 October 2026

*The owner holds insidemead.com, insidelafayette.com,
insidesteamboatsprings.com, insidesalida.com and insidefrederickco.com and
asked whether any were worth an exception to the 90-day test. The answer,
which the owner shared: hold all five. No new guide, and no redirect, before
the test's verdict on 20 January 2027.*

- **Why.** The test puts the hand work into Niwot, Lyons and Berthoud
  under a ten-hour weekly cap; the city and small mountain guides were
  quieted on 20 October, and a pass means repeating the model in Golden
  and Erie, not opening towns. A guide is not a config file: it opens with
  fifteen events and twenty checked listings and is kept accurate after.
- **For the January decision**, as discussed:
  - Lafayette is the one real candidate for a guide: a sizeable town next
    to Erie with an Old Town and a civic calendar, which suits an
    Erie-and-Lafayette edition if the test passes.
  - Frederick is already covered by Carbon Valley; the domain would
    redirect there, as Fort Lupton's does.
  - Mead sits between the Johnstown, Berthoud and Longmont guides; if it
    is added, it is a sub-town of one of them, with its domain redirected.
  - Steamboat Springs and Salida are off the model: hours from the Front
    Range, resort towns with established papers and tourism bureaus, and
    the kind of small mountain guide just quieted. Renew if cheap, or let
    them lapse.
- **Nothing in the repository** names the five yet: no config, no
  redirect, no row in manager/towns.json.

## Six quiet guides kept; Grand Lake open, 30 October 2026

*Asked ahead of the 19 November decision, the owner kept Elizabeth, Fort
Collins, Leadville, Longmont, Loveland and Nederland, and is not sure about
Grand Lake.*

- **Kept means quiet until the 90-day verdict, and accurate meanwhile.**
  They stay out of the weekly email and the weekly session, as since 12
  and 20 October; nothing about the test changes. But a quiet guide's
  decide-by must come before its listings lose their hours
  (`test/quiet-towns.test.ts`), so each guide's 2026 listings are
  re-checked against their own sites before its first expiry, and only
  then does its `decideBy` move to 20 January 2027. The dates, from the
  oldest `verified` plus 60 days (Front Range) or 45 (mountain): Elizabeth
  17 November; Nederland 21 November; Leadville 24 November; Fort Collins
  30 November; Longmont and Loveland 3 December. 226 listings in all; the
  mountain two need a second pass in early January. The assistant does the
  checks; a listing whose site refuses automated reads goes to the owner as
  a call, or shows without hours.
- **Grand Lake is the owner's call by 19 November.** The case against it:
  the smallest guide (410 people), under its launch threshold (6 events
  against 10 at the 27 October audit), the Town's site refuses automated
  reads, three of seven listings checked that day had the wrong (summer)
  hours, and its readers are visitors to a resort whose season turns over
  with Trail Ridge Road. The case for: the domain and 21 checked listings
  cost little to keep, and the summer visitor is real. Retiring it would be
  the Severance shape with no neighbour: a holding page and a redirect to
  the hub, the domain kept.

## Grand Lake retired, 30 October 2026

*Given the case each way (the entry above), the owner retired Grand Lake the
same day rather than wait for 19 November.*

- **The shape.** No neighbouring guide could take it, so it is not a fold:
  a new `retired` field on the config (since, reason), beside `foldedInto`,
  with `status: 'redirect'`. A redirect guide is folded or retired, one of
  the two, and `test/retired-towns.test.ts` holds the rest: no neighbours
  either way (Estes Park drops it), out of every list the email and the
  scripts read, its content gone, and every path on its domain sent to the
  hub.
- **The redirects.** Two rules in vercel.json, host-scoped to
  insidegrandlake.com: `/` and `/(.*)` to insidethetowns.com/, permanent.
  Nothing on the hub matches a Grand Lake path, so the home page it is.
  docs/REDIRECTS.md and DEPLOY.md list it.
- **The content is removed, not moved.** Its events, places, staged items,
  articles, pages, weekly notes and sources.json are deleted; git history
  keeps them should it reopen, which is a decision first and then a revert.
  `images/` stays with its rows, the hero because the config names it.
- **The holding page** the `insidegrandlake` project still builds says the
  guide has closed and points to the hub, noindex; the rules answer first.
- **What follows.** The hub's Moving page loses its Grand Lake paragraph;
  the network now covers nine counties, Grand gone; manager/towns.json keeps
  an entry, not live, "retired 2026-10-30", which its test checks.
- **The owner's, and not done:** the Search Console property is a
  URL-prefix one verified by a tag on a page that is no longer served, so
  it will lose verification (docs/SEARCH-VISIBILITY.md); Buttondown
  subscribers tagged `grand-lake` stay tagged, and nothing was ever sent to
  them while it was quiet. The domain stays the owner's.

## Elizabeth re-checked, 30 October 2026

The first of the six kept quiet guides (the entry above). All 25 listings
were read against their own sources the same day, in three parallel passes,
and the editor checked the passes' biggest claims before any edit.

- **21 re-checked and stamped 30 October**, with what changed: Small Town
  Mini Donuts has new owners and new hours (a correction); Antelope Alpacas
  no longer teaches (a correction); the Stampede's 2027 dates are out and
  the Chamber now hosts the parade; the tea room is 392-B; and wording no
  source supports came out (the library's Friday evenings, Evans Park's
  "square feet", the bank's January 2023 date and its Elbert County Bank
  line, three shops' unconfirmed descriptions).
- **86 & Main is staged:** the directory confirms a name and an address,
  nothing says what it sells or that it is open.
- **Three wait for a call:** Catrina's (nothing dated shows it open), Town
  Hall and Running Creek Park (the Town's site refuses automated reads).
  Catrina's, last checked 2 October, loses its hours on 1 December, so the
  decide-by moves from 15 to 30 November, not to 20 January; the calls move
  it the rest of the way.
- **Found on the way:** The Carriage Shoppes' site has a spam page in place
  of its About page, which is worth telling them; Powder River's address is
  211 on its own site and 232 in the directory.

## Nederland re-checked in part, 30 October 2026

A mountain guide's listings keep their hours for 45 days, so a check made
now lasts to mid-December whatever is done; reaching 20 January needs a
pass on or after 7 December regardless. So this pass took only what could
not wait: the 11 listings last checked 7–13 October and all 8 trail-access
notes, which hide after 30 days (Hessie's on 5 November) and carry the
winter closures. 15 files, read against their own sources.

- **Changed:** Busey Brews closes at 5 pm Monday to Wednesday and starts
  happy hour at 2, and Crosscut closes at 8 pm on its early-close days (a
  correction each); the Hessie Shuttle has ended for 2026 and resumes
  Memorial Day weekend 2027; Brainard's October road closure has passed and
  the road past the entrance gate is closed to cars for the season; the
  Community Center's page no longer posts separate weekday office hours.
- **Confirmed:** the other nine, among them NedRink (still "closed for the
  season", schedule coming) and the West Magnolia gates, which the Forest
  Service's August road table still shows open.
- **The decide-by** moves from 19 November to 3 December, the day before
  the three listings checked on 20 October lose their hours. The full pass
  in the week of 7 December moves it to 20 January.

## Leadville re-checked, 30 October 2026

All 26 listings and the six trail-access notes, since 21 listings lost
their hours on 24 November and every access note on 9 November; three
parallel passes, the biggest claims checked again before editing.

- **Changed:** the visitor center is on winter hours (Thursday to Monday,
  10 to 4); FREIGHT's Boxcar Bar posts Thursday to Sunday, 5 to 9, and the
  Motherlode Holiday Market has dates; the railroad's ride lengths were
  swapped and the Holiday Express starts 14 November; the Tabor's
  calendar and the ranger district's alerts are current again; Ice Palace
  Park is dog-free; the Elbert, Massive and Turquoise Lake notes carry the
  Forest's winter road facts (North Elbert's road snowmobiles, hikers and
  skiers only; Forest Road 125.B impassable; the Halfmoon Road unmaintained;
  campgrounds May to September).
- **Confirmed:** the rest, among them Ski Cooper's 9 December opening.
- **Two wait for a call:** Healy House (History Colorado's page refused the
  read) and the fish hatchery, where the Service's page shows it open and
  the county tourism site says it remains closed for the Willow Fire; the
  listing now shows both. So the decide-by moves only from 19 to 23
  November; the calls take it to 13 December, and the full pass in the
  week of 7 December to 20 January.
- **The City's merchant pages** (leadville-co.gov) refused automated reads,
  so the sentences citing them keep their 10 October date.

## The re-check timing, corrected, 30 October 2026

A listing's hours last 60 days on a Front Range guide and 45 on a mountain
one, so a check reaches 20 January only if it is made on or after 21
November (Front Range) or 7 December (mountain). The Elizabeth entry above
said its three calls would move its decide-by to 20 January; they cannot,
since its 30 October checks run out on 29 December. The plan, then:

- **Week of 23 November:** Fort Collins, Longmont and Loveland in one pass
  each, and Elizabeth a second time. None of the three city guides loses
  hours before 30 November, so starting them sooner would mean doing them
  twice.
- **Week of 7 December:** Nederland and Leadville in full.
- **Owner calls before then:** Elizabeth's three by 30 November, Leadville's
  two by 23 November.

## Castle Rock live, quiet, 31 October 2026

*The owner's words: "lets get castle rock off staged". Asked which they
meant, the holding page or the staged queue, they chose to launch it quiet.*

- **The shape.** `status: 'live'` with a `quiet` block, like Fort Collins,
  Longmont and Loveland since 20 October: pages up and indexed, listings
  checked as the rotation reaches them, no weekly email, no signup box on
  its pages or anyone else's, no Thursday draft, out of the weekly report.
  This supersedes the 12 and 20 October entries that kept it `wave2`:
  quiet makes no weekly promise, so it does not undo the reason Elizabeth
  went quiet, and the 90-day test's three towns keep the hand work.
- **Under its threshold, on the owner's word**, as the six of 10 October
  were: 18 of 25 upcoming events and 30 of 29 listings on the day. The
  validator says so on every run.
- **Decide by 29 November**, with the other city guides. All 30 listings
  but one were checked on 6 October, so their hours go on 5 December (60
  days, Front Range); the re-check belongs in the week of 23 November with
  Fort Collins, Longmont and Loveland, which is what moves the date on.
- **What it changes elsewhere.** Elizabeth and Manitou Springs each name
  Castle Rock as a neighbour, so their Nearby block now builds; Leadville is
  the one live guide with none. Douglas becomes the tenth county the network
  covers, and the hub map drops Castle Rock's faint reference label for its
  pin. `plausible: true`, as on every live guide since 22 October.
- **Left as it was.** The colours are still the placeholder rhyolite rose
  (no palette was chosen in Color System 2.0) and the hero is still the
  Wikimedia photograph of Wilcox Street; neither blocks a launch. The
  staged queue (3 events, 21 places, most waiting on crgov.com, which
  refuses automated reads, or on a call) stays staged.
- **The owner's, and not done:** add insidecastlerockco.com as a site in
  Plausible; resubmit its sitemap in Search Console as
  `/sitemap-index.xml` (it was submitted as `/site.xml`); switch on Vercel
  Web Analytics in the `insidecastlerockco` project if it is not already.
  The Vercel project, domain, `hello@` routing and deploy hook were set up
  on 6 and 7 October, so merging to `main` is the launch.

## Castle Rock completed before launch, 31 October 2026

*The owner, after the flip above: "What are your thoughts on completing the
page like the others rather then test it", and then "yes go ahead and start
your part". The guide was two pages thinner than any other live guide and
seven events short of its threshold, so the assistant's part was done the
same day, on the branch, before anything was merged.*

- **Events, 18 to 27 upcoming (30 published).** Ingest was run on the
  guide's two feeds for the first time since 7 October (23 items staged),
  and every confirmed source re-read by hand. Published, each from its
  organizer's own page read that day: the County's Veterans Day Tribute
  and the Heroes Hall groundbreaking with its World Trade Center steel
  (both 7 November); the Outlets' tree lighting, concert and drone show
  (14 November); the library's Jingle Jam sing-along (29 November), its
  embroidery workshop (21 January) and its cuff-bracelet workshop (25
  January, two sessions as one listing); and Sudden Fiction Books' book
  bingo at Sinners & Saints (11 November), holiday book wrapping (7
  December) and release party (11 January). The library's three Santa
  sessions on 10 December, two of them newly staged, became `performances`
  on the listing already published. Starlighting, the carriage rides, the
  trolley and the museum's Santa were re-read and re-dated.
- **Out, under the event standard:** Battle of the Books (ten dates, a
  school-team competition), Epic Reads and the bookshop's Final Draft club
  (book clubs), a library teardown entry, the Windish RV show (a dealer's
  sale), the Outlets' Black Friday and Jingle Bucks (a sales day and a
  promotion), and the Chamber's leads groups, ribbon cuttings and
  seminars. Held: the Colorado Classic gymnastics meet (no hours), the
  Chamber's Veterans Alliance talk (not said to be public), and St.
  Francis's Christmas Eve service, still without a time. Two past expos
  were removed from staging. The queue went from 3 to 1.
- **Sudden Fiction Books is not a confirmed source**, and three of its
  events are published. The README's rule is that a listing publishes on
  its own `source` and `verified` whatever the registry says, and the
  shop's own events page is the organizer's own page; the 7 October launch
  review had kept to confirmed sources as a way of avoiding aggregators,
  which this is not. It is in sources.json as `proposed`, with the three
  listings named, for the owner to confirm or to say otherwise.
- **Places, 30 to 33; staged 21 to 18.** Castle Cafe's site, a Cloudflare
  wall on 6 October, now answers, and gave hours and phone; B&B Cafe's
  contact page gave 324 Wilcox (the Chamber directory had said 322), a
  phone and hours; Sudden Fiction's own events, dated November to January,
  show it open, so it is published without hours, which its site no longer
  states. Every other staged place was re-read or re-probed and its review
  note dated: six Town facilities still behind crgov.com's 403; Alidade,
  Lost Coffee and Scileppi's still 403; Guadalajara's robots.txt still 500;
  Hideaway's certificate does not match its hostname; Crowfoot Valley
  answered with an empty page; Castle View Cafe, Cuba Cuba, Iron Mule,
  Ecclesia Market, Glacier and Mod Mountain still lack hours or a dated
  sign of being open on their own pages. All go to the owner as browser
  reads or calls (TODO.md).
- **Config.** `character` and `commuteNotes` written from the Moving Here
  page's sources; `plausible` was set that morning. No `driveToDenver`: no
  official page read gives one and the Town's site cannot be read, so the
  cell is left empty rather than guessed. The hero stays the Wikimedia
  photograph of Wilcox Street and the colours the placeholder rose, both
  the owner's to change; no Formspree form yet.
- **The first weekly notes** (`weekly/2026-11-02.md`): the Veterans Day
  Tribute as the pick, three additions to the guide, and editor's notes
  listing what was found and not listed, what is unverified (whether
  Bustang stops in town) and every page read. **A third article**, the
  holiday season in date order, every fact from a page read that day.
- **Still the owner's:** the six Town pages read in a browser (Philip S.
  Miller Park, Festival Park, Rock Park, Ridgeline, the Recreation Center,
  the MAC), the calls and browser reads above, St. Francis's service time,
  the palette, a bought hero, a Formspree id, and the Plausible, Search
  Console and Web Analytics steps from the entry above.

## The six Town pages, read by the owner, 31 October 2026

crgov.com refuses every automated request, so the owner opened the Town's
pages in a browser the same evening and pasted their text, and the six
listings the tagline depends on went up from the Town's own words: Philip
S. Miller Park (300 acres, 8 miles of single-track, Challenge Hill's 200
steps and 178 feet), the Miller Activity Complex, Rock Park (1.5 miles,
difficult, no bikes, the Town's trail map linked), the Recreation Center
(hours, holiday hours, child-watch; no phone yet), Festival Park (its
amenities and the Town's 2026 event dates, including the Season of the
Star to 23 January) and Ridgeline (13.5 miles, moderate). Each file says
in a comment that the owner read the page and the assistant wrote it up,
and `verifiedBy` says the same. The chamber's draft figures were wrong
in places (270 acres and 7.4 miles for Philip S. Miller), which is why the
parks had waited. Castle Rock stands at 30 events (27 upcoming) and 38
listings, 1 and 13 staged, with every listing on the guide checked on
6 or 31 October.

## The call list's venue match, and the contest's date, 31 October 2026

A 21-day re-check run for the owner's November calls listed the Lyons
trustees' meetings under Hall Ranch. The call list finds a venue's phone
number by matching the venue to a listing on the guide, and it matched
when half the words of the shorter name were shared: "Lyons Town Hall"
(the town's name set aside) and "Hall Ranch" share "hall". Run over every
venue in every guide (316 on 31 October), the old rule tied 213 to a
listing, and most of the ones it should not have print the wrong number:
Harmony Library as Austin's American Grill, Windsor Town Hall as Severance
Town Hall, Golden Community Center as Foothills Art Center, Fort Collins's
Council Chambers as City Park. The rule now (`placeFor`, moved to
`scripts/lib/recheck.ts` with its tests): one name must hold the other
whole, each part of a venue between commas counts as a name of its own, a
parenthesis is set aside on both sides, a name left with one word matches
only that word, and the closest fit wins. It ties 156. Eight venues move
to a closer listing (Erie Town Hall for its Community Room, Windsor's own
Town Hall, the Wildflower Pavilion's own listing, Evergreen Lake rather
than its trail). Of the 57 it lets go, about ten were probably right and
now say "no listing on the guide" (the Niwot Inn's conference room, Niwot
Hall and Downtown Niwot, the Castle Rock Museum, the Evergreen Lake House,
the Fort Lupton high school's library, the Manitou Springs Heritage
Museum, the corner outside Tommyknocker, Boardwalk Community Park). A
number left for the owner to look up is better than a wrong one; allowing
one-word names back would recover four of those and add five wrong ones
(three "Downtown" venues among them).

The same run found that the Berthoud Historical Society's pages now give
14 November for the Holiday Card Art Contest's artwork, not 7 November,
and that entries in person go to the Society at 228 Mountain Ave, not the
museum at 224. The event and the Society's family program were corrected
from the Society's event and contest pages, with an entry on Berthoud's
corrections log; the event keeps its file name, since a slug is a URL.
"Free to enter" came off both, since no page of the Society's says it.

## An empty home tab says what is next, 31 October 2026

The owner sent a screenshot of Niwot's home page on the Saturday
afternoon: "Nothing listed for today", and the same on Tomorrow and This
weekend, with 22 events on the calendar from Tuesday. Nothing was broken.
The Great Pumpkin Party (10 am to 2 pm) was the day's one listing, the
browser's pruning took it off at 2 pm as it should, and Niwot has nothing
listed for Saturday evening, Sunday or Monday. But the page stopped there,
and on a quiet guide all three tabs can be empty at once, which reads as a
guide with no events.

An empty tab keeps its tab and its "Nothing listed" line, as decided on
27 October, and now goes on to "Next in <Town>": up to three listings after
the tab's last day (after today, after tomorrow, after Sunday), each at its
next date with the date before the time, one row a listing (a weekly series
once), nothing canceled or postponed, drawn from the next 60 days
(`laterRows` and `nextAfter` in src/lib/home-tabs.ts). Every panel carries
its block, and the stylesheet shows it only while the panel's empty line
is showing, so it appears whether the tab was built empty or was emptied in
the browser after the build, which is what happened in Niwot. Its rows
carry the same `data-end` marks, so they come off when they end, and the
block goes once none are left. With nothing in the next 60 days a tab says
only "Nothing listed", as before. Every guide's home page, not only
Niwot's.
