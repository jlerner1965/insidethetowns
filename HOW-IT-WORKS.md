# How Inside the Towns works

The rules in force today, in one place. When a rule changes, this file
changes and the old wording goes; the history of why lives in
`DECISIONS.md`, which is a log, not a rulebook. Where this file and any
other document disagree, this file wins. Where this file and a test
disagree, fix one of them the same day.

Last revised: 14 November 2026.

## 1. What this is

A network of independent community guides for Colorado towns, one site per
town, all built from one codebase (`TOWN=<slug> npm run build`), hosted on
Vercel, one project per domain, with insidethetowns.com as the hub. One
person owns it and runs it a few hours a week with an assistant and a set
of scheduled jobs.

The product is the Thursday email. The site's job is to be right about
this week, to rank for the names of events and places, and to turn a
reader into a subscriber. Revenue is one labelled sponsor line per town, in
the email and on the site, three months minimum.

## 2. The decision we are inside

**Building, not testing.** The 90-day test (decided 20 October 2026) is
paused by the owner as of 12 November 2026: the product is still being
made, so it is not yet time to test it. Its rules (no new towns, no new
features, no search-engine projects) are removed, and the 20 January 2027
verdict no longer stands. The test starts again, with a new clock, when
the owner says there is a product worth testing (`DECISIONS.md`, "The
90-day test is paused"). The targets and scorecard it will use are kept
in `docs/90-DAY-TEST.md`. The three towns it chose:

| Town | Why |
|---|---|
| Niwot | The owner lives there; third on search |
| Lyons | The one chamber relationship; where distribution is tested |
| Berthoud | Best search performance in the network; a town of 10,000 with no good calendar |

When the test runs, at its day 90: a sponsor renewal and two of three subscriber targets means
the model repeats in Golden and Erie. Readers but no sponsor means fix the
offer. Neither means the network stays live on automation as a community
project.

## 3. The towns

The config flag decides what a guide is; nothing is per-town in code.

| Kind | Flag | Towns | What it means |
|---|---|---|---|
| Resident guide | `home: true` | Berthoud, Erie, Johnstown, Windsor, Carbon Valley, Lyons, Niwot | Follows a school; has Families, Living here and Updates; gets the Thursday email. Lyons (`lead: 'outdoors'`) leads with the outdoor dates and keeps sports out of its menu; Niwot (`lead: 'updates'`) lists no events, is out of the email and the Wednesday notes run, and posts when there is an update |
| Plain guide | none | — (none today) | In the email and the weekly rotation |
| Visitor guide | `visitorGuide` | — (none today) | Checked on the 60-day cycle; no email, no signup box |
| Quiet guide | `quiet` | — (none today) | Pages up and indexed; listings checked as the rotation reaches them; no email, no signup, no Thursday draft. Each has a decide-by date in its config |
| Folded or retired | `status: 'redirect'` | Severance (into Windsor); Frederick (to Carbon Valley, which covers it); Black Hawk, Castle Rock, Elizabeth, Estes Park, Evergreen, Fort Collins, Fort Lupton, Georgetown, Golden, Clear Creek (Idaho Springs), Lafayette, Grand Lake, Leadville, Longmont, Loveland, Manitou Springs, Nederland and Timnath (to the town's page on the hub, `hubPage`, 12 November 2026) | No guide: every path on the domain redirects (`vercel.json`, `docs/REDIRECTS.md`) |

`test/how-it-works.test.ts` holds this table to the configs.

Two tiers since 12 November 2026: a town is one of the seven standalone
guides (Berthoud, Erie, Johnstown, Windsor, Carbon Valley, Lyons, Niwot) or a
town page on the hub: its traditions and its outdoor
dates, each from one record with its source and check date
(`content/hub/traditions/`, `src/config/hub-towns.ts`), and below them, since
12 November 2026, what the town is: near this town, its facts, getting there,
where to stay and its history (see section 8). A town gets its page once one
named annual event of its own has its next date, or the date it was last
held, read on its organizer's own page (the owner's brief of 12 November
2026; the bar had been three dates of any kind); a live guide is folded
into it only then. Elizabeth's was the last, folded on 12 November 2026.
A town a guide covers as a section has no page on the hub (Severance, the
Windsor and Severance guide's, 14 November 2026): its records are at home on
that guide (`town.guide`), `/towns/` links the guide's section, and the
hub's old addresses are redirect pages to the guide (`src/lib/hub-moved.ts`).

The hub lists the seven guides, in that order on every page that lists them
(`liveTowns()`, from `STANDALONE_GUIDES`), and every town page by cluster, and
carries the network pages: newsletter, advertise, privacy, about.

## 4. Who does what

- **The owner** decides, calls, photographs, meets, shares and merges.
  Phone calls, photographs, sponsor conversations, authorizing accounts and
  anything that puts a name to a person are his alone.
- **The assistant** audits, drafts, fixes code, proposes content changes
  and runs the scheduled checks. It edits `content/` only when asked to
  publish something specific; audit findings are proposals in a report.
  It never sends email, never pushes to `main`, and never adds a town, a
  feature or a per-town variant on its own.
- **"Publish" on an article** (13 November 2026). When the owner says
  "publish" in a session about an article draft shown there, that is his
  instruction to put it live, merge included: the assistant writes the
  file to `content/<town>/articles/`, runs the checks in section 9, opens a
  pull request with that article alone, waits for CI to pass on every
  site and merges it (`.claude/skills/research-and-write/`). It never
  merges on red, and nothing unverified or hedged goes into the file.
- **Automation** (section 9) ingests events, approves the safe ones under
  the standing rules, re-checks listings nightly, reads the scores, drafts
  the email and rebuilds the sites daily. Everything it writes lands as a
  commit or a pull request that can be read.

## 5. Accuracy

One wrong fact costs more than ten missing ones.

- Every date, time, address, price, hours line and open-or-closed claim
  comes from a source read for it, and the file says which (`source`,
  `verified`). A file without both is held back by the validator.
- Primary sources first: the organizer, the business, the town, the
  library, the district, the county. A news story is a lead, not proof. A
  chamber's or a paper's calendar lists other people's events and waits
  for the organizer's own.
- Nothing is guessed. Can't confirm it: leave it out, or mark it
  unverified with what was found, in the draft. A published page states
  facts or leaves them out: no "unverified", "reportedly" or "this guide
  could not confirm" ever goes live, and doubt is settled before
  publishing, not handed to the reader. Attribution is a source at the
  foot of the page, not a hedge in the sentence; the `verified` date is a
  fact about the page, not a doubt about it (3 November 2026).
- A listing is re-checked within 30 days. At 60 days its hours hide. A
  listing whose only source dropped it carries a `changeFlag` and gets a
  call before the hours hide.
- Corrections are shown, not silently fixed: a change found late is a
  correction with both dates, never the week's news.
- A called-off or moved event stays on its day with the word beside it.
- A listing re-filed or merged under a new slug names its old slugs in
  `formerSlugs`, and the build redirects each old URL to it. A published
  listing is never deleted because its date passed; the build hides it.
  One that comes off for any other reason is named in
  `content/<town>/retired.json`, and the build redirects its URL to the
  events page or the directory, or to the listing that took its place; a
  test fails when a published listing is gone with nothing behind its URL.

## 6. Photographs

- Every image has a row in `IMAGE_LICENSES.csv` saying where it came from
  and under what terms. No row, no image; the validator enforces it.
- Acceptable: public domain; an open licence that allows this use; taken
  by us; or sent by whoever holds the rights with written permission,
  recorded in `PERMISSIONS.md` and credited as they ask. A paid stock
  licence, standard or editorial, of a real photograph of the real place,
  credited and with its receipt in `PERMISSIONS.md`, is acceptable too
  (`docs/HERO-PHOTOS.md` is the list for the heroes). Generic stock,
  generated images and drawn or painted heroes are not (28 October 2026).
  An editorial stock licence wants its credit beside the photograph, in
  the agency's own form (iStock's is "iStock.com/<member name>"); the
  hero prints it for those, and only those.
- Never copied from a business's website, its social pages or a review
  site, however good the picture.
- The hero is the town itself, not the county or a lake outside it, and a
  hero photograph is never also a listing's card photograph.
- A card is for a photograph; a place without one is a row, never a
  coloured tile.
- Credit sits under a photograph shown in full and on `/credits/`, which
  the footer links from every page.

## 7. Voice

Plain, warm and local: a neighbour who pays attention, not a tourism
board. Short sentences. The street, the business, the day. No hype words.
The guide never passes an organizer's copy off as its own; quoted text
names who said it. Every page says what it is and when it was checked.

Every article is built to one structure and one of five templates (news
explainer, service guide, roundup, event guide, history or profile): the
answer in the first sentence, headings a scanner looks for, and an ending
a reader needs last. The rules are in the "Article structure" section of
`.claude/skills/inside-the-towns-editor/SKILL.md` (13 November 2026).

## 8. The pages and the design

**The town home** is a front door, not the whole site (27 October 2026).
Top to bottom, the same on a phone and a desktop: nav; the hero as a short
band (photo, county, name, one line: on a town guide, what the guide does this week, "What’s on in Erie this week, what’s new in town, and the one we’d go to", with the pick only in a week that has one and "what's new in town" only when Worth knowing is on the page; on a visitor guide, what the place is); the school's strip in the school's
colours (the next game with its date once it is beyond six days); What's
happening as Today, Tomorrow and This weekend tabs, five rows each, with
one line of trust under the heading ("Every listing checked against its
source · refreshed <date>"); the tab that opens is Today, the weekend from
Friday, and Tomorrow from five on the Sunday afternoon; an empty tab offers
"Next in <Town>": the pick, then the one-off outings by date, the civic
calendar and the regulars last, the last slot kept for the next festival,
market or music; under the tabs, the quick answers where the config has them,
none repeating a link the page has (src/lib/quick-answers.ts); the Thursday
signup; three photo tiles (Eat & drink, Things to do, Living here or Moving
here), each with one line of what its page lists (`nextStop` on the config),
three across, and plain link rows with no photograph on a phone, the tiles
before the signup on a thin day (the tab that opens has fewer than three rows
at the build); Worth knowing, one section and one "Every local change" link,
the timely changes first with their summaries, placed under the tabs when one
is timely (14 November 2026); the footer every page has. A listing's title and a Worth
knowing headline are links in the primary, not underlined. Sections with no
data hide. On a phone
the sports strip shows the latest result only, except when the next game is
within three days or a postseason game, when it shows that instead; nothing
else on the home is hidden on a phone. The menu on every page is This week,
Events, the school's sports, Eat & drink, Families or Things to do, Living
here or Moving here, and Guides (src/lib/nav.ts).

**Every other page** keeps its full content: `/this-week/` the whole week,
`/events/` everything, `/sports/` the full scoreboard with the "checked"
line, `/updates/` every change with its sources, `/guides/` the articles,
`/directory/` every place. Each section page also lists the articles of
its kind under its directory, newest first: Outdoors under Things to do,
Food & drink under Eat & drink, History, Civic, Moving here and Community
under Moving here, every Families article on Families; an article is
never reachable from `/guides/` alone. On `/this-week/` the week's dates lead and the
"Checked" line follows the week's own content; on the Sunday, "Next on the
calendar" is on the page whatever the week still holds; New & closed lists
a change once, at its newest check. On `/events/` the first screen is the
list: Submit an event and Subscribe to calendar are buttons after it. An
event page's Where carries a Directions link, as a place page does.
"Check current hours" is printed only under a business with a door
(restaurant, bar, coffee, shop, service), never under a park, a trail, a
venue, lodging or a landmark. A resident guide's About calls it a
community guide; the other town guides are community and visitor guides.

**A season page** (12 November 2026) lists dates to come first, in date
order or A to Z, then "Not announced yet", then what has passed, each of
the last two folded under its heading past 12 rows (14 November 2026). Each dated
row has "Add to calendar": a one-event file at `/dates/<record>.ics` and a
Google link, all-day unless the record's start time parses with certainty
(`src/lib/tradition-calendar.ts`). The hub's home page shows a collection
only while its records have a date to come. `/this-weekend/` filters by
town, Free and Live music together; the town is kept in the address and in
the browser, the filters in the address.

**Feeds** (12 November 2026). A guide: `/events/calendar.ics` (subscribe
by `webcal://` or Google's add-by-URL from `/events/`), `/events.rss`,
`/rss.xml`, and `/updates.rss` where it has local changes. The hub:
`/calendars/<town>.ics` for each town page and `/calendars/<season>.ics`
for each season page, `/dates/<record>.ics` for one date, and
`/share/<town>.png`, the share card of a town with no photograph. `/towns/`
is the A to Z index of every guide, town page and season page.

**A town page on the hub** (12 November 2026) opens on the town's name over
its landscape: the photograph where one is licensed (Estes Park), otherwise a
drawn horizon for the country it is in (peaks, foothills, mesas or plains,
`src/lib/ridgeline.ts`), with the next date set under the name. Then the
year at a glance, twelve months with a mark for each tradition; Traditions
beside Outdoor dates from the lg breakpoint; the statewide dates folded
under a summary. Every dated row, there and on the season pages and a
guide's `/traditions/`, carries a date block: month, day and year where the
organizer has set a date, "TBA" in outline where it has not, never last
year's date. A showpiece's photograph needs the file in
`content/hub/images/`, its alt text in the config and its licence row, and
no code. A town may carry one **signature** (`signature` in
`src/config/hub-towns.ts`): a block from a public source with its source
link and checked date, read by a scheduled job into `data/hub/` and never
at build time; the first is "Recently stocked near <Town>" from Colorado
Parks and Wildlife's stocking report (`src/lib/fish-stocking.ts`). The others
are the river at the town's gauge (USGS or Colorado DWR) and the snowpack
at its SNOTEL station (`src/lib/town-signals.ts`), each shown only while
its reading is fresh.

**The additions of 12 November 2026** (`docs/additions-report.md`). Below
what a town page already had, in this order: Near <Town>, the nearest four
to six towns with a page by road miles, and the passes and named routes
between them with the usual seasonal closure where the road's agency gives
one and the road's COtrip page (`data/hub/road-miles.json`,
`data/hub/passes.json`; every pair from one router, stored once, so two
pages cannot disagree); the facts strip (elevation, the Census Bureau's
latest estimate with its year, county, the year of incorporation); Getting
there (miles and drive time from Denver, the Bustang family's stops, the
nearest commercial airport by road); Where to stay (the property's own
site, never a booking or affiliate link); and the history card (the name,
the founding, three to five dated facts, museums and landmarks with hours,
cost and season, ghost towns and makers where they apply). The bulk facts
are written by `scripts/town-facts.ts`, run by hand, never at build time;
the rest is one file a town, `data/hub/towns/<slug>.json`, every value with
its source and the day it was read (`src/lib/town-profile.ts`). A value
nobody confirmed is not in the file and a block with nothing in it is not
drawn. A guide site is never a source: the schema refuses the ones named.
Three rules from the owner (13 November 2026): the year of incorporation
comes from the Town, the county or the state and nothing else, so a year
only a historical society gives stays off the page; Where to stay has no
target number, lists only properties inside the town, and a town with one
inn lists one; and where two acceptable sources disagree, the state's
record is taken first, then the Town's, then the National Park Service's
or a historical society's, and a value that only a historical society
holds is left empty.
Items four to six are the hub's only; a standalone guide gets Near <Town>
at the foot of `/things-to-do/` and the open-now view on `/traditions/`.

**The town-anchored articles** (13 November 2026; `src/lib/curiosity.ts`).
The hub has one more kind of page: an article anchored to one town, in two
topics, Camping at `/camping/<town>/` and Ghost towns at
`/ghost-towns/<town>/`, each topic with its index at `/camping/` and
`/ghost-towns/`; and a one-off event article at `/articles/<slug>/`, which
may cover several towns (the first is Sundance from the towns next door).
One file an article, `content/hub/curiosity/<slug>.md`. A campground is its
fee, reservation or first-come, number of sites, season with its year, road
surface and who manages it; a ghost town is its road surface, the vehicle
clearance it takes, the season it can be reached, what still stands, and
who owns it and whether going there is legal. Every one of those is a value
with the official page it was read on (the land manager, the town, the
county, the state park) and the day it was read, both printed beside it;
the day moves only when the fact is read again, and the article's "Last
verified" is the oldest of them. A field no official page gave is left out
of the file and named in `flags`; a "skip it" note needs its source like any
fact. A guide site is never a source. Each article prints its byline (Lerner
Works, for these articles only; no person is named, 13 November 2026), its last verified day and, where the
file says `visited: true`, "Visited"; an article the writer has not visited
says nothing about it (no "Not personally visited", 13 November 2026).
An article is a draft until its file says `status: verified`, which the
schema refuses while a flag is open: a draft builds no page, no index row,
no home row and no Nearby link (`npm run curiosity` lists every flagged or
empty field by article; `CURIOSITY_DRAFTS=1` draws the drafts for a local
read, noindex, and throws on Vercel). The hub's home page has no row for
them since its redesign of 13 November 2026. A town page on the hub, and a standalone guide's
`/things-to-do/`, has a "Nearby" block under Near <Town> that links the
articles naming it: links only, no line of an article repeated.

An event article that follows games (the football playoffs, 13 November
2026) carries them as `games` in its file and draws them first: a table on
a wide screen and a card per game on a phone, by weekend with the newest on
top, so earlier results stay on the page. Each game names the home team, its
kickoff in Mountain Time, the venue only where CHSAA's game page or the
host's ticket listing names one ("Venue not yet confirmed" and a link to
the game page otherwise, never the school's campus by assumption), and the
ticket and stream links CHSAA's game page gives, a paid stream marked as
one. A game is `scheduled`, `postponed` or `final`; there is no "live", and
the schema refuses a score on anything but a final, which is read on
CHSAA's game page. Its update may carry a time (`updated.time`), printed
"Updated … MT" and given as the dateModified, and moved only for a
substantive change such as a final. Such an article may set its own
masthead line, a reporting note in place of the visited label, jump links,
its own closing note and one invitation, and may leave off the towns' links
at the foot when each section links its own town.

Under Outdoor dates, "Open now" and "Opens next" (`src/lib/open-now.ts`)
read the records' own dates: a window in force, an opening with a closing
still ahead, or an opening in the last ninety days where no closing has
been read. A record says what it is the date of in `outdoor` (campground,
booking, timed entry, road, ski area, river; opens, closes or window). The
registry also takes an edition number, sub-events with their times, and
the closed days of a run of several weeks. Five more season pages:
`/rodeos-and-county-fairs/`, `/oktoberfests/`, `/harvest-festivals/`,
`/winter-carnivals/` and `/free-admission-days/`, where a day that has
passed drops off. A place takes `yearRound`, the other half of its season
field, and `details` (reservations, cash only, closed days, dogs, bikes,
fees, tours, tastings, a market's day, hours and season), each shown only
when filled, with the page it was read on.

**A page of dates corrects itself to the reader's day**
(`DateCorrection.astro`): a date that has passed since the build stops
reading "Confirmed". **Free** is one rule, `src/lib/cost.ts`.

**A guide's dates on its home page** are only those with a date set. The
outdoor dates lead when two or more of the guide's own local ones qualify
(a statewide date does not count); otherwise the guide's own
traditions lead and the outdoor dates come second (`guideHomeDates`). The
rest are on `/traditions/`.

**The hub's home page** (13 November 2026) is the approved design in
`docs/design/hub-home-mockup.html`, reordered the same day to lead with
what changes: a compact hero, the guides, this weekend, this season, the
guides' index, the email. It has its own masthead, footer, type
(Newsreader, Inter, the Fraunces wordmark, all self-hosted) and palette
(`HUB_HOME`, one accent, pine), in `src/styles/hub-home.css`; the guides
and the hub's other pages keep theirs. The owner's Flatirons photograph
sits beside the headline (under it on a phone) and is the page's share
image. The rules are `src/lib/hub-home.ts`:

- **This weekend** is one listing a day. Friday's is the high-school
  football game where the scores data has one (the guide's featured
  listing first, then a playoff game), its final once posted. Otherwise a
  guide editor's pick for the week comes first (the weekly notes'
  `picks`), then a one-off the organizer has confirmed, never two from one
  town and never a program's deadline listing.
- **Each pick says why it is there** in a few words, only from fields:
  the guide's pick, an annual event in the registry (its running where
  numbered), free admission, a run of 90 minutes or less, a playoff stage
  the title does not name, the team's league place. No field, no line.
- Beside it, **one date**: the nearest registration deadline; and the
  schools' score pages.
- **In the towns**, after the weekend: the news worth a reader's time, the
  newest first, one per town, three at most (`newsItems`): the hub's
  verified stories (`kind: story` in `content/hub/curiosity/`, each for a
  fortnight or until its `homeUntil`) and the guides' current local
  changes. A story may rest on a named news report such as the Colorado
  Sun; the town need not have published its own record first.
- **This season** is the seasons opened with a year in `CURRENT_SEASONS`
  that still have a date to come, soonest first, each with its count by
  town and next date. The year-round pages are on `/towns/` ("All annual
  events").
- **Words that hold:** the title and description say what the page is
  ("Colorado events this weekend, town by town"); "N more towns" counts
  town pages no guide covers; the email is "every Thursday", no hour (the
  send is the owner's merge of the drafts pull request); a deadline shows
  the organizer's own note where the guide's card does.
- Each row's check line is in its guide page's words. Dated rows leave the
  page once past, and an emptied block goes with them. The sections' links
  carry `data-track` (`home-weekend`, `home-season`, `home-deadline`,
  `home-scores`, `home-guides`, `home-index`), counted by TrackClicks.

**The hub's other pages** share the home's menu (This weekend, Annual
events, Towns, Moving here, Newsletter, How we check; `src/lib/nav.ts`,
`hubNav`; "Annual events" goes to `/annual-events/`, every round-up with
what is next, and "Towns" to `/towns/`, the A to Z, 14 November 2026) and
call the editorial page "How we check listings" in the footer. Their share
image is the same Flatirons photograph; a record's own page shares its
town's photograph or share card, which its Event markup also carries.
`/articles/` lists the guides' articles with the hub's, each linking to
its guide, with no article text copied. A `<title>` runs to 60 characters
at most; the site's name follows only where the whole fits
(`TITLE_LIMIT`, src/lib/titles.ts). In the sitemap a town page and a season page
are dated by the newest check of the records they show
(`src/lib/lastmod.ts`), and every dated town page title says "events".

**Visual rules** (the ten from the 26 October pass, still in force):

1. The accent colour draws the rule under a section heading and the
   masthead stripe; it is never a text colour, a background or a card
   border.
2. The town's colours are the guide's; category dots and eyebrows are the
   listing's, never the town's.
3. The school's colours appear only on the home strip and the sports
   pages, proven 7:1 under white by `npm run check-colors`.
4. "Our pick" is amber; "Canceled" and "Postponed" are an ink-bordered
   label; "Free" and "Away" are plain words. The four are never one slot.
5. Colour never carries meaning alone; every status is a word.
6. Body 17px on articles, 16px elsewhere; supporting text 15px, never
   below 14px; eyebrows 12px uppercase on section heads only.
7. Headings wrap; nothing in a heading is nowrap except the menu row.
8. At most one sticky element per page; the masthead is not sticky.
9. One email form per page, and none on a quiet or visitor guide. On the
   home it stands alone after What's happening. The form never claims a
   subscription it cannot see.
10. The hero's photograph is the town's and keeps its credit.

## 9. The code and the jobs

- One repo, one template. Town differences live in config and content,
  never in code forks. Adding a town is a config file, a content folder
  and a Vercel project.
- Scripts ship as files (`script-src 'self'`); no inline script, no
  framework on the page.
- `npm test`, `npm run validate`, `npm run check-colors` and `astro check`
  pass before anything is pushed, and CI builds every live site on every
  pull request. The tests are the rules that cannot drift.
- A build ends by reading what it built as a crawler would
  (`npm run check-site`): links, canonicals, the sitemap, structured data
  and that host's redirects. CI fails on any problem, then checks the links
  between the sites (`npm run check-network`). The rules are listed in the
  README (9 November 2026).
- Content is Markdown with YAML front matter under `content/<town>/`;
  sports data under `data/<town>/`; the config under
  `src/config/towns/<slug>.ts`; the home under `src/components/home/`.
- Postseason games MaxPreps has not got, or files at the wrong site (a
  state tournament played at one arena, a bye week's playoff game), are
  entered by hand from CHSAA's brackets in `src/config/postseason.ts`,
  each with its bracket and the day it was read. The pages and the
  Thursday email merge them in as they read the data; the MaxPreps file is
  never written with them, and a row whose day has passed is ignored
  (8 November 2026).

Scheduled jobs (Denver time), all in `.github/workflows/`:

| When | Job | Writes |
|---|---|---|
| Daily 05:10 | Rebuild every site; restart a dropped ingest or re-check | nothing; Vercel redeploys |
| Daily 06:10 | Run CI on main with nothing pushed: the tests, the validator, a build of every site and the check of what was built | nothing; a failure opens an issue |
| Daily 05:40 | Re-check the next 14 days of events against their sources; list what waits for a person before its date; re-read each town's development map and list every row that moved | stamps and flags, and `data/<town>/development.json`, as a pull request |
| Monday 07:10 | Ingest the confirmed feeds; auto-review the safe ones | staged and published events, as a pull request |
| Wednesday 06:20 | The research agent: one week's findings per live town, and up to two local changes per resident guide from official pages | drafts in `docs/agent/`; the weekly editor publishes a local change only when it can read its source |
| Thursday 06:10 | Draft the Thursday email from the listings | a draft, as a pull request; merging sends it |
| Sat and Sun 08:00, Wed 06:20 | Read the scores from MaxPreps | `data/<town>/sports.json`, committed straight to main |
| Daily 06:40 and 12:40 | Tell IndexNow (Bing) which pages changed since the last run | nothing; the last run's sitemaps are kept in the Actions cache |

A job that fails opens an issue labelled `automation-failure` (one per
workflow, commented on while it stays open), saying what the failure cost
and how to run it again. The nightly re-check's pull request opens with
every staged event, staged change and flagged listing dated in the next 14
days: a staged event is deleted unlisted once its date passes, and a flag
left past its date means the guide showed the old fact on the day. The
weekly ingest's opens with every feed it could not read. A listing that
has been flagged is ruled on by a person or the Wednesday editor, never by
the standing rules.

The scorecard fill is a scheduled assistant session, Tuesday 11:17, from
3 November 2026 to 19 January 2027: it reads Search Console (GSC Wizard)
and Buttondown, adds the week's three rows to `docs/90-DAY-TEST.md`, and
opens a pull request. The weekly audit is the assistant's, not a
workflow's, until a scheduled session is set up for it.

## 10. Conflicts this file settles

Where the dated documents disagree, this is the reading in force:

- The home page is the 27 October front door, not the 25 or 26 October
  layouts. `docs/archive/DESIGN-PASS-2026-10-26.md` stands for everything but its
  Stage 2 home page and its rule 9's "beside Things to know".
- A paid editorial photograph of the real place is allowed (section 6);
  `docs/PHOTO-PRIORITIES.md`'s "no stock" means generic or generated
  images.
- On a phone the sports strip hides the next game and nothing else on the
  home is hidden (section 8).
- The manager agent in `manager/` is not set up and is not relied on. The
  weekly audit is run by the assistant on request or on a schedule; the
  `npm run weekly` report, the nightly re-check and the Monday ingest
  cover the ground the manager was designed for.

## 11. Open decisions

- The quiet guides' decide-by date is 19 November 2026: keep each, or
  retire it to a holding page.
- Berthoud: B-Rad's Arcade and Trailhead Cafe, dropped by their only
  source on 26 October; keep after a call, re-source, or mark closed.
- Whether to set up a scheduled assistant session for the weekly audit
  (section 4); the scorecard's was set up on 27 October 2026.

## 12. Where things are

| Need | Look in |
|---|---|
| Why a rule is what it is | `DECISIONS.md` (the log; entries run oldest to newest) |
| How to deploy, redirect, verify a domain | `DEPLOY.md` |
| What is open, and whose it is | `TODO.md` |
| Photo permissions and the asks | `PERMISSIONS.md`, `docs/PHOTOS.md`, `docs/PHOTO-CONTACTS.csv` |
| The 90-day test and its scorecard | `docs/90-DAY-TEST.md` |
| The latest audit per town | `docs/audits/<date>/<town>.md` |
| Editorial formats and the voice | `.claude/skills/inside-the-towns-editor/SKILL.md` |
| Dated reports, past designs, sent email drafts | `docs/archive/` |
