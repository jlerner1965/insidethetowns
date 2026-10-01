# Adding Windsor and Fort Collins

Plan, written 1 October 2026. Nothing is scaffolded yet. This is the order of
work, what has to change outside the scaffold, the facts the two configs need
(checked where it says so), and the three questions only the owner can settle.
The method is Timnath's and Elizabeth's (DECISIONS.md, Phases 7 and 7b); what
is new is that one of the two is a city.

## The two guides

| | Windsor | Fort Collins |
|---|---|---|
| Domain | insidewindsorco.com | insideftcollins.com or insidefortcollins.com — see below |
| Slug (content folder, `TOWN`, favicon folder, newsletter tag) | `windsor` | `fortcollins` |
| Site title | Inside Windsor | Inside Fort Collins |
| Contact address | hello@insidewindsorco.com | hello@ the domain above |

Both sit beside Timnath: Windsor 4.8 miles to its south-east and Fort Collins
5.4 miles to its north-west, by the configs' own great-circle formula. That is
the network's first real cluster, three guides inside a ten-minute drive, and
several things written for towns an hour apart move because of it.

## Settle these first

### 1. Which Fort Collins domain

Vercel's registrar, asked on 1 October 2026:

| Domain | |
|---|---|
| insidewindsorco.com | registered |
| insidewindsor.com | registered — presumably by someone else, hence the "co" |
| insidefortcollins.com | registered |
| insideftcollins.com | **available: nobody owns it** |

So "inside ft collins.com" is one of two things: insidefortcollins.com is yours
and was written short, or insideftcollins.com was the intention and has not
been bought yet. The config's `domain` is the canonical URL on every page, the
sitemap, the JSON-LD `@id`, the `hello@` address and the `www` redirect, so it
is the one value that cannot change after launch without a migration. Confirm
or register it before the config file is written. If neither is yours yet,
insideftcollins.com is the one to buy: "ft" is how the city's own visitor
bureau writes it (visitftcollins.com), and the other is gone.

`test/towns.test.ts` requires every live domain to match `^inside[a-z]+\.com$`.
Both candidates pass.

### 2. "Small towns"

Fort Collins had 169,810 people at the 2020 census, the fourth-largest city in
Colorado, and it is the city that Timnath's, Berthoud's and Johnstown's guides
measure themselves against ("minutes from Fort Collins without paying for Fort
Collins"). The network calls itself a guide to small towns in four places:

- `src/config/towns/hub.ts`, the tagline: "Independent community guides to the
  small towns of Colorado's Front Range."
- `src/routes/hub/index.astro`: the h1, "Independent guides to the small towns
  worth knowing.", and the meta description.
- `src/pages/about.astro`: "independent community guides for the small towns
  of Colorado's northern Front Range".
- `src/routes/hub/moving.astro`: the `seoTitle`, "… N small towns compared".

Two ways out. (a) Reword: the network is a guide to the northern Front Range,
its towns and the city they look to. (b) Keep "small towns" and let Fort
Collins be the stated exception. Recommendation: (a). The hub's tagline is also
the Organization description in the publisher graph (`src/lib/seo.ts`), and a
description that is untrue of the largest member is the wrong thing to put
there. Suggested tagline: "Independent community guides to Colorado's northern
Front Range: the towns, and the city they look to." The owner's words beat
these; whatever is chosen, `test/towns.test.ts` checks that the hub's home
title still names the state after the search-result trim.

Everything else that counts towns counts them: the fact strips, the map title,
the comparison caption and the network bar all read `live.length`, so nine
appears on its own. "Seven" and "eight" survive only in code comments
(`moving.astro`, `geo.ts`, `seo.ts`, `contact.astro`, `NetworkEventCard.astro`,
`TownMap.astro`) and in DEPLOY.md. The comments can be tidied in the same
commit; DEPLOY.md must be.

### 3. How big the Fort Collins guide is

PLAN.md's minimum of 20 places and 15 events covers Timnath. It does not cover
a city with more restaurants on one block of Old Town than Timnath has places.
The pages are built for a town: the directory lists every place by kind on one
page, the home page features four to six, and `/eat-drink/` is one grid. Sixty
places is where that still works; two hundred is where it stops.

Recommendation: a curated guide, said out loud. Launch at about 60 places and
50 to 60 event files, concentrated on Old Town, the Poudre and the natural
areas, with the `/about/` copy saying it is a selection and `/for-businesses/`
saying how to get in. Put the place `area` field on every Fort Collins listing
(Old Town, Midtown, Campus West, North College, Harmony, the foothills). It is
optional in the schema and most towns skip it, but a city reader navigates by
neighborhood, and if the directory later needs grouping by area that is one
component change made once.

## Scaffold

```
npm run new-town windsor "Windsor"
npm run new-town fortcollins "Fort Collins"
```

Then in each new config, by hand:

- **`domain` and `social.email`.** The script derives `inside<slug>.com`, which
  is wrong for both. Set `insidewindsorco.com` and the Fort Collins domain
  from question 1.
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
doubled on the Fort Collins–Greeley road, with a lake in the middle." Fort
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
6. **Hub copy**, per question 2.
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
question 3.

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

1. The test refactor (code item 3), on its own, so the tests describe the
   network rather than list it.
2. Windsor: scaffold, config, the map and geo changes, content, deploy. It is
   the smaller of the two, and it carries every code change once.
3. Fort Collins: scaffold, config, the "small towns" copy, content at the
   larger scope, deploy. By then it is content, plus question 2.
4. The Timnath–Windsor comparison, once both are live.

PLAN.md's rule stands: do not start Fort Collins until Windsor is live and
populated. Keep each out of `LIVE_TOWNS` until its domain serves over HTTPS.
