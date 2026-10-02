# Adding Windsor and Fort Collins

Plan, written 1 October 2026, decisions taken the same day. Nothing is
scaffolded yet. This is the decisions, the order of work, what has to change
outside the scaffold, and the facts the two configs need (checked where it
says so). The method is Timnath's and Elizabeth's (DECISIONS.md, Phases 7 and
7b); what is new is that one of the two is a city.

## Status, 1 October 2026: live

insidewindsorco.com and insidefortcollins.com serve over HTTPS and are in
`LIVE_TOWNS`; the hub, the map, the comparison table, the two comparison
pages, the network bar and Timnath's nearby-weekend block carry them.

**Done.** Both configs with verified facts, colours and Commons heroes; the
tests reading the registry; the map, geo and county tests; the hub copy;
Windsor at 30 places, 38 events, two articles and a moving-here page; Fort
Collins at 60 places, 60 events, two articles and a moving-here page; every
entry sourced and dated; the Timnath–Windsor and Windsor–Fort Collins
comparisons; the two Vercel projects (linked to the repository, `TOWN` set
for all three environments, Node 22.x, apex and `www` domains); the A, `www`
and DMARC records on both Cloudflare zones; DEPLOY.md, DECISIONS.md and the
backlink targets.

**Still to do, none of it blocking.**

1. **Email Routing for `hello@`** on both zones: routing on, the one rule to
   the owner's inbox. The token available had DNS but not Email Routing
   permission. Three clicks per zone in the dashboard, per "Email" in
   DEPLOY.md, or a token with Zone, Email Routing Rules, Edit.
2. **Formspree**: a form per site, its id in each config; until then the
   contact pages fall back to email.
3. **The deploy-hook lines** for the two projects in the `VERCEL_DEPLOY_HOOKS`
   secret, so the daily rebuild covers them; **Analytics** switched on per
   project; **Buttondown tags** `windsor` and `fortcollins` if the embed
   endpoint does not create unknown tags.
4. **Photographs** for the 86 new places that have none; the businesses are
   in docs/PHOTO-CONTACTS.csv.

## The two guides

| | Windsor | Fort Collins |
|---|---|---|
| Domain | insidewindsorco.com | insidefortcollins.com |
| Slug (content folder, `TOWN`, favicon folder, newsletter tag) | `windsor` | `fortcollins` |
| Site title | Inside Windsor | Inside Fort Collins |
| Contact address | hello@insidewindsorco.com | hello@insidefortcollins.com |

Both sit beside Timnath: Windsor 4.8 miles to its south-east and Fort Collins
5.4 miles to its north-west, by the configs' own great-circle formula. That is
the network's first real cluster, three guides inside a ten-minute drive, and
several things written for towns an hour apart move because of it.

## Decisions

Taken on 1 October 2026 so the work can start without a round trip. Each
picks the simpler option, as PLAN.md's conventions ask. Any of them can be
reversed before its town goes into `LIVE_TOWNS`; none can be reversed cheaply
after.

### 1. The Fort Collins domain is insidefortcollins.com

Vercel's registrar, asked on 1 October 2026, showed insidefortcollins.com,
insidewindsorco.com and insidewindsor.com registered and insideftcollins.com
free, and the first draft of this plan read "ft collins" literally and
proposed buying the free one. The owner then confirmed the same day that
insidefortcollins.com and insidewindsorco.com are both theirs, both already
zones on Cloudflare. So the config says `insidefortcollins.com`, there is
nothing to register, and the two zones are where the DNS records and Email
Routing go. (`test/towns.test.ts` requires `^inside[a-z]+\.com$`; both
pass.)

### 2. Drop "small"; keep "towns"

Fort Collins had 169,810 people at the 2020 census, the fourth-largest city in
Colorado, and it is the city that Timnath's, Berthoud's and Johnstown's guides
measure themselves against ("minutes from Fort Collins without paying for Fort
Collins"). "Small towns" becomes untrue of the network's largest member, and
the hub's tagline is also the Organization description in the publisher graph
(`src/lib/seo.ts`), where a false description is the wrong thing to put.
"Towns" stays: the network is named Inside the Towns and that cannot change,
and a reader forgives "towns" for a city sooner than a search engine forgives
a description that is false. Four edits, made in the Fort Collins code step:

- `src/config/towns/hub.ts`, the tagline: "Independent community guides to
  the towns of Colorado's northern Front Range."
- `src/routes/hub/index.astro`: the h1 becomes "Independent guides to the
  towns worth knowing."; the meta description drops "small".
- `src/pages/about.astro`: "for the towns of Colorado's northern Front
  Range", plus one sentence saying that one of them, Fort Collins, is a city
  of 170,000 and is here because it is the city the rest look to.
- `src/routes/hub/moving.astro`: the `seoTitle` becomes "… N Front Range
  towns compared".

The hub's `seoTagline` ("Guides to Colorado's Front Range towns") is already
right and is what the home title uses; `test/towns.test.ts` checks it still
names the state after the search-result trim. Everything else that counts
towns counts them: the fact strips, the map title, the comparison caption and
the network bar all read `live.length`, so nine appears on its own. "Seven"
and "eight" survive only in code comments (`moving.astro`, `geo.ts`,
`seo.ts`, `contact.astro`, `NetworkEventCard.astro`, `TownMap.astro`) and in
DEPLOY.md. The comments are tidied in the same commits; DEPLOY.md must be.

### 3. Fort Collins is a curated guide of about sixty places

PLAN.md's minimum of 20 places and 15 events covers Timnath. It does not cover
a city with more restaurants on one block of Old Town than Timnath has places,
and the pages are built for a town: the directory lists every place by kind
on one page, the home page features four to six, and `/eat-drink/` is one
grid. Sixty places is where that still works; two hundred is where it stops.

So: launch at about 60 places and 50 to 60 event files, concentrated on Old
Town, the Poudre and the natural areas. The `/about/` copy says it is a
selection and `/for-businesses/` says how to get in. Every Fort Collins
listing carries the place `area` field (Old Town, Midtown, Campus West, North
College, Harmony, the foothills): optional in the schema and skipped by most
towns, but a city reader navigates by neighborhood. That rule is written into
`content/fortcollins/README.md`, not into the validator. If the directory
later needs grouping by area, that is one component change made once.

Windsor is a town and gets the town treatment: 30 places and 25 event files,
with the plan's 20 and 15 as the floor.

### 4. Slugs, colours, order

`windsor` and `fortcollins`; lake teal and navy, as under Colours; Windsor
first, Fort Collins only once Windsor is live and populated. Reasons under
each heading.

## Scaffold

```
npm run new-town windsor "Windsor"
npm run new-town fortcollins "Fort Collins"
```

Then in each new config, by hand:

- **`domain` and `social.email`.** The script derives `inside<slug>.com`, which
  is right for Fort Collins and wrong for Windsor. Set `insidewindsorco.com`.
- **`fortcollins`, not `fort-collins`.** The script handles hyphens, but every
  slug so far is one token, and the slug is also the `TOWN` value, the favicon
  folder and the Buttondown tag. `windsor` rather than `windsorco` for the
  same reason: the "co" is the domain's problem, not the folder's.
- **The generated accent.** Both towns hash to one of six preset pairs that
  overlap the existing palette. Replace with the colours below.

## Facts for the configs

Read from the Wikipedia infoboxes on 1 October 2026, which carry the census
and GNIS figures the other seven configs use. Re-read them against the sources
named before committing; the comparison table draws every one of these.

| Field | Windsor | Fort Collins |
|---|---|---|
| `population` (2020 census) | 32,716 | 169,810 |
| `population2010` | 18,644 (+75% to 2020) | 143,986 (+18%) |
| `elevationFt` | 4,797 | 4,997 |
| `incorporated` | 1890 (2 April) | 1883 (12 February) |
| `counties` | `['Weld', 'Larimer']` | `['Larimer']` |
| `lat`, `lng` | 40.4772, −104.9119 | 40.5475, −105.0658 |
| ZIP | 80550 (also 80528, 80551) | 80521–80528 |
| `driveToDenver` | About 1 hr | About 1 hr 10 min |
| `officialLinks.townSite` | https://www.windsorco.gov/ | https://www.fcgov.com/ |
| School district | Mostly Weld RE-4 (Windsor-Severance); the Larimer County side is Poudre or Thompson | Poudre School District |

Windsor is the network's fourth town across a county line, and the tests know
what that means:

- **`countySplit` is required** (`test/towns.test.ts`): a note of more than
  forty characters, an `https://` source and a `verified` date. The Town's own
  page, https://www.windsorco.gov/56/School-Districts, says three districts
  fall inside the town limits, which is the split as a resident meets it; add
  the census municipality-by-county figure for the population share, as Erie's
  note does.
- **`schoolDistrict` must begin "Mostly "**, or the comparison table's short
  form claims one district for a town with three.
- **Add `windsor` to the "most ambiguous names" test** and spell Colorado out
  in its `seoTagline`. Windsor is the most ambiguous name the network has had:
  Ontario, Berkshire, California, Connecticut, Vermont and a dozen more, and
  "CO" is too weak a signal. The same test already holds Erie, Johnstown and
  Elizabeth to it. Fort Collins is unique, but every home title has to name the
  state after trimming, so write "Colorado" into its `seoTagline` too.

Draft `character` lines, for the comparison table, to be rewritten by whoever
writes the guides and checked against the Art & Heritage Center or Wikipedia
first (the sugar factory and the Kodak plant are from memory, not from a
source read for this plan): Windsor, "A sugar-beet and Kodak town that
grew by three-quarters in a decade on the Fort Collins–Greeley road, with a lake in the middle." Fort
Collins, "The city the other towns measure against: Old Town, the Poudre, CSU
and 170,000 people."

## Colours

Taken: Niwot green `#108452`, Lyons red-orange `#CE4A2C`, Berthoud lake blue
`#1587B4`, Erie violet `#6257C0`, Johnstown burgundy `#BE3762`, Timnath gold
`#A67A14`, Elizabeth saddle brown `#B26E2A`, and the hub's blue `#2C74CC`.
Proposals, each run through the same arithmetic as `scripts/check-colors.ts`;
every bar clears:

| | accent | accentDark | neutralBg | tightest ratio |
|---|---|---|---|---|
| Windsor, lake teal | `#0F7C72` | `#0A5650` | `#F3F7F5` | 4.15 (the highlight on accentDark, needs 3) |
| Fort Collins, navy | `#24467A` | `#172E52` | `#F5F6F8` | 6.58 |

Teal for Windsor Lake and the Poudre, and it is the one hue family nobody has.
Navy for Fort Collins rather than a green: CSU's green is the obvious choice
and it would sit next to Niwot's. Forest `#1E6B3C` / `#154A2A` and copper
`#A8502A` / `#73361C` also pass if the owner prefers one of them. `npm run
check-colors` is the gate either way, and CI runs it.

## Code that changes

The scaffold is the easy half. Nine files outside it know the towns by name or
by count, and three of them are tests that fail the moment a town is added.

1. **`src/components/TownMap.astro`.** Fort Collins is drawn today as a faint
   reference city in `CONTEXT`. Remove that entry when it becomes a pin, or the
   map shows two Fort Collinses. Then look at the result: Timnath, Windsor and
   Fort Collins are three labels within about thirty pixels of latitude, the
   crowding rule only moves a label left when something sits to its right, and
   Windsor sits south-east of Timnath. Expect to extend the rule or add a
   per-town label side. The comment about "six of them north-west of Denver"
   goes.
2. **`src/lib/geo.ts` and `test/geo.test.ts`.** The Timnath test asserts
   `['johnstown', 'berthoud']`; with both towns live it is
   `['windsor', 'fortcollins', 'johnstown']` (4.8, 5.4 and 13.8 miles).
   Windsor's neighbours are Timnath, Fort Collins and Johnstown; Fort Collins'
   are Timnath, Windsor and Berthoud (16.3 miles); Berthoud picks up Windsor as
   its third at 13.8. Add those assertions and fix the comment. The "nearby
   this weekend" block on Timnath's events page will now lead with Windsor's
   and Fort Collins' weekends, which is the right answer and the first time the
   block has had a city to draw from. Watch that the one-offs rule keeps Fort
   Collins from filling all three slots every week.
3. **`test/series.test.ts` (four loops) and `test/dated-content.test.ts`**
   hard-code the seven slugs. Replace them with the registry's slugs so the
   tenth town needs no test edit. Do this before the scaffold, as its own
   commit.
4. **`test/towns.test.ts`.** Windsor's split, Fort Collins' single county,
   `windsor` in the ambiguity list. `countiesCovered` stays Boulder, Elbert,
   Larimer and Weld, so that assertion does not move.
5. **`src/routes/hub/moving.astro`.** `SUITS` is a plain record keyed by slug
   and the page prints `SUITS[t.slug]`; a town without a paragraph renders an
   empty paragraph and nothing fails. Write both paragraphs, and consider a
   test that every live slug has one. Fort Collins' row needs care: the table
   is sorted by population and the city now heads a column whose next entry
   is 32,716, which is a fact rather than a layout problem, but its paragraph
   should say who should simply live in the city rather than in one of its
   towns, because that is the question the page exists for. The `seoTitle`
   loses "small".
6. **Hub copy**: the four edits of decision 2, in the Fort Collins step.
7. **`src/content/comparisons.ts`.** "Timnath vs Windsor" is a real search and
   so is "Windsor vs Fort Collins"; write at least the first. The comparison
   pages and `/moving/` are the strongest internal link the network has
   (DECISIONS.md, "The loop back matters more than the page").
8. **DEPLOY.md.** Two rows in the domain table; "eight" under Email, Web
   Analytics and Scheduled rebuilds. The Vercel project names are
   `insidetimnath` and so on, not `insidetimnath-com` as step 2 says; fix that
   line while there.
9. **`src/config/index.ts`.** `LIVE_TOWNS`, last, once each domain serves over
   HTTPS, as Elizabeth was held back until hers did.

## Content

Same method as Timnath (DECISIONS.md, Phase 7): the town's own calendar and
park pages, the library district, the chamber, the businesses' own sites,
Commons for photographs, `source` and `verified` on every entry. The robots
files below were read on 1 October 2026, which matters after the Berthoud
chamber (docs/BACKLINKS.md): nothing here opts out of automated reading, and
reading a calendar by hand is still the rule.

**Windsor.** Target 30 places and 25 event files; the plan's 20 and 15 is the
floor.

- windsorco.gov (robots: blocks only Baidu, Yandex and Siteimprove): the
  calendar, the parks (Boardwalk Park and Windsor Lake, Eastman Park, the
  Poudre River Trail, Main Park), the Town Board schedule, the Art & Heritage
  Center.
- windsorchamber.net (allows all): the Harvest Festival over Labor Day
  weekend, the summer concerts.
- Clearview Library District (allows all): storytimes and the weekly regulars.
- The businesses, each from its own site: the breweries, Main Street.
- Hero: Windsor Lake from Boardwalk Park, if Commons has it at 1920px. Check
  the Commons category before anything is promised; Timnath's turned out to be
  700px snapshots.
- The other Windsors dominate every search. Only sources naming Colorado, Weld
  or Larimer County, or an 80550 address.

**Fort Collins.** Target 60 places and 50 to 60 event files, curated as in
decision 3.

- fcgov.com (robots: blocks only Ahrefs, Baidu and Siteimprove): the events
  calendar, Parks, Natural Areas, the Lincoln Center, the Gardens on Spring
  Creek, the Museum of Discovery, City Council. Horsetooth is Larimer County's
  (larimer.gov), not the city's.
- downtownfortcollins.com and visitftcollins.com (allow all): Old Town Square
  programming and the annual calendar.
- Poudre River Public Library District (allows all); Colorado State University
  for its public events.
- The annuals the city is known for (FoCoMX, the Colorado Brewers' Festival,
  NewWestFest, Tour de Fat, the holiday lights): list each only from its own
  2026 or 2027 page. Several have been retired or renamed since 2019, and a
  past year's date rolled forward is the invention the Elizabeth tree lighting
  was refused for.
- Photographs: Commons is rich for Fort Collins (Old Town, the Avery Block,
  Horsetooth), the first town where it is. But docs/PARK-PHOTO-EMAILS.md:
  commercial photography in a Fort Collins natural area needs a Commercial Use
  Permit, $50 and up to 15 business days. Do not shoot there without it.

Each town also gets two articles in Timnath's shape (a history, a with-kids
guide), a moving-here page, and a row in IMAGE_LICENSES.csv for every image.
Sections in docs/BACKLINKS.md and rows in docs/PHOTO-CONTACTS.csv follow once
the listings exist.

## Deploying

Per domain, in this order, from DEPLOY.md:

1. **Cloudflare.** Add the zone and move the nameservers; the A record
   `76.76.21.21` and the `www` CNAME; Email Routing on, the one `hello@` rule,
   the `_dmarc` record. Email Routing needs the zone at Cloudflare; the
   registrar's own DNS will not do.
2. **Vercel** (team ARProject, where the eight projects are). Import the repo,
   `TOWN=<slug>` for Production, Preview and Development, Node 22.x, the
   domain and `www`, Analytics on, a Deploy Hook on `main`.
3. **The `VERCEL_DEPLOY_HOOKS` secret** gets the hook URL as one more line, or
   the daily rebuild quietly leaves the new site stale.
4. **Formspree.** A new form per site, `formspreeId` in the config. The
   validator cross-checks the posting host against the CSP, and formspree.io is
   already there.
5. **Buttondown.** The signup posts `tag=<slug>`. Check whether the embed
   endpoint creates an unknown tag or drops it, and create `windsor` and
   `fortcollins` first if it is the latter.
6. **`LIVE_TOWNS`, push.** CI builds ten sites; the hub, the map, the
   comparison table, the network bar and the newsletter draft pick the town up
   on the next build.
7. **The launch-audit checks** (docs/LAUNCH-AUDIT.md): headers, robots, the
   sitemap, Lighthouse on `/` and `/events/`.

Both projects fit the one Vercel Pro seat, and analytics events bill against
the plan's included credit. The cost is two domain registrations.

## Order of work

Each numbered item is one commit or one owner action, and the build, the
tests, `npm run validate` and `npm run check-colors` pass at every one.

0. **Done by the owner.** Both domains are zones on Cloudflare, and the
   environment carries a Cloudflare API token, so the DNS records and Email
   Routing in step 4 and step 7 are done from here.
1. **The tests describe the network instead of listing it.**
   `test/series.test.ts` and `test/dated-content.test.ts` take their slugs
   from the registry. One commit, no behaviour change, so the two scaffolds
   that follow fail nothing they should not.
2. **Windsor, the code.** `npm run new-town windsor "Windsor"`; the domain,
   facts, colours and `countySplit` from the sections above; `test/towns.test.ts`
   and `test/geo.test.ts` updated to the Windsor assertions; the `geo.ts`
   comment; the `SUITS` paragraph; DEPLOY.md's table row. And the map:
   Windsor's pin lands about fifteen pixels right of and twenty below
   Timnath's, which trips the crowding rule and flips Timnath's label to the
   left, straight across the Fort Collins reference dot. Fix the label
   placement here, not in step 5, with `TOWN=hub npm run build` and a look at
   the SVG. Not in `LIVE_TOWNS` yet.
3. **Windsor, the content.** The sources under Content: 30 places, 25 event
   files, two articles, the moving-here page, a hero with its licence row.
   `npm run validate` and `npm run weekly -- --town=windsor` before each push.
   Several commits.
4. **Windsor, live.** Deploying, steps 2 to 7: the Vercel project, the hook
   line in the secret, Formspree, the Buttondown tag, then `LIVE_TOWNS` and the
   launch checks. Timnath's events page now ends with Windsor's weekend, and
   Windsor's with Timnath's and Johnstown's.
5. **Fort Collins, the code.** `npm run new-town fortcollins "Fort Collins"`;
   the domain, facts and colours; Fort Collins out of the map's `CONTEXT`
   list; the four edits of decision 2 and the `/about/` sentence;
   `test/geo.test.ts` to the final neighbours; the `SUITS` paragraph;
   DEPLOY.md. Not in `LIVE_TOWNS` yet.
6. **Fort Collins, the content.** Curated per decision 3, the `area` field on
   every listing, the natural-areas permit rule, the annuals only from their
   own 2026 or 2027 pages. The largest block of work in the plan: budget three
   to four Timnaths.
7. **Fort Collins, live.** As step 4.
8. **The comparisons.** Timnath vs Windsor first, then Windsor vs Fort
   Collins, in `src/content/comparisons.ts`.
9. **The follow-on documents.** Sections in docs/BACKLINKS.md, rows in
   docs/PHOTO-CONTACTS.csv, and a launch audit refreshed for ten sites.

Why Windsor first: it is the smaller guide, its code step carries every
structural change once (the tests, the map, the geo assertions), and it leaves
the Fort Collins step nothing but content and copy. Why not both scaffolds at
once: PLAN.md's rule, and a half-populated city guide sitting in the registry
is a `SUITS` paragraph, a map pin and a comparison row waiting to be
forgotten. Steps 1 to 3 can run while step 0's nameservers propagate, and
step 5 can start the day step 4 ships.
