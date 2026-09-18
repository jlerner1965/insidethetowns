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

## Compare the towns

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
