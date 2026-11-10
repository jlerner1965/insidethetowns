# Event sources for every live guide, and what to do with them

10 November 2026. The owner's brief asked for one guide; asked which, the
answer was "all guides", so each of the eighteen live guides was searched
for venues whose calendar changes every time. One file per guide in this
folder holds its table, what to turn on first, what was ruled out and what
was fetched despite a robots rule. Every new registry entry is `proposed`;
no status changed, no confirmed source changed type, nothing was ingested.

Counts are of events dated 10 November to 10 December 2026 that pass the
owner's test (a date is worth a row when it differs from the last one).
They are readings of the feeds and pages, not dry runs of ingest.

## The five to turn on first, per guide

"Feed" means ingest can read it today once confirmed; "subscribe" means the
host's robots.txt disallows the feed path and it needs the editor's
`robots: subscribe`; "hand" means a page a person reads.

| Guide | First to turn on | Roughly adds a month |
|---|---|---|
| Berthoud | Wildfire Community Arts Center (Tockify, subscribe); Historical Society's unfiltered iCal; observatory star night (hand) | 7 to 10, half already typed by hand |
| Castle Rock | Live Well Douglas County (feed, filter "Castle Rock"); Castle View High and Douglas County High (subscribe); Castle Rock Dance Academy (hand); Ecclesia Market (already proposed) | 20 to 25, about 30 with Ecclesia |
| Elizabeth | Elizabeth Kitchen + Bar (hand, or a GoDaddy calendar reader); Legacy Academy (subscribe); AllEvents as a weekly lead sheet (hand); chamber (subscribe) | 10 to 15, half by hand |
| Erie | Library LibCal RSS (confirmed entry: owner switches type); The Old Mine (subscribe); Erie High (subscribe); chamber and Briggs Street Books (hand) | about 30, 15 of them new |
| Estes Park | Listening at the Legion (feed); Events Complex calendar (subscribe); school district iCal (feed); The Rock Inn (hand); Avant Garde Aleworks (hand) | 15 to 20, or 35 to 40 with each Rock Inn night a row |
| Frederick | Coal Ridge Middle and Thunder Valley K-8 (subscribe); MeCo Coffee (hand, via Facebook) | 8 to 12, 7 of them school concerts |
| Golden | Golden Today's Live Music, Cultural Alliance and Olde Golden Christmas calendars (subscribe; an aggregator, ask its publisher); New Terrain Brewing (feed); Goosetown Station (subscribe) | about 60 before duplicates, 30 to 35 new |
| Johnstown | Roosevelt High athletics (subscribe); district calendar, Turkey Trot and Candlelight's concerts (hand) | 6 to 9 in winter, mostly games |
| Lafayette | Nissi's (feed); Center for Musical Arts (feed); Muse Performance Space, The Arts Hub, Dog House Music (hand) | 45 to 50, about 20 by feed |
| Leadville | No feed found. Cloud City Conservation Center, Tennessee Pass, Cloud City Wheelers, Ski Joring, Alpine Orchestra (all hand) | 2 to 4 in winter |
| Loveland | Downtown Partnership Tockify (confirmed entry, subscribe); Crooked Beech (subscribe); the three high schools (subscribe); Loveland Museum and Sweet Heart Winery (hand) | 45 to 50 |
| Lyons | Ask the Lyons Recorder for its calendar; Oskar Blues (hand); Lyons Middle Senior High (subscribe); MainStage and the Farmette (hand) | 15 to 20, 2 to 4 by feed |
| Nederland | The Backdoor Theatre (feed); Wild Bear, the Food Pantry page and Bristlecone Bookshop (hand); a Mountain-Ear subscription for the bars' music | 15 to 20, 9 to 12 by feed |
| Niwot | MainStage Gunbarrel and Avery (hand; both are in Gunbarrel, the owner's call); Niwot High orchestra, bands and theatre pages (hand) | 18 to 20 with Gunbarrel, about 5 without |
| Timnath | No feed found. The school theatre's nights, North Forty News search, Colorado Youth Outdoors (hand). The largest gain is still a Squarespace reader for Timnath Beerwerks | 3 to 5 in season |
| Windsor | Windsor Charter Academy and Severance Middle (subscribe); The Lodge's wine dinners (hand) | 6 to 10 |
| Fort Collins | Wolverine Farm (feed); CSU Rams (feed); Poudre Libraries (feed, after a dry run of its exclusions); Maxline Brewing (feed); Ginger and Baker (feed). By hand: Aggie Theatre, Avogadro's Number, The Comedy Fort, Magic Rat | about 55 by feed, about 60 more by hand |
| Longmont | Kuper Wine Bar (feed); Firehouse Art Center (subscribe); Bricks on Main, Left Hand Tasting Room, Dry Land Distillers or Jesters (hand) | about 40, about 10 by feed |

## What the eighteen searches have in common

- **School stages are the commonest unread feed.** Finalsite
  (`/fs/calendar-manager/events.ics`) and Google Calendar feeds exist for
  nearly every high school; all sit behind a robots rule and all need long
  title exclusions. One decision by the owner covers them.
- **The bars that book bands mostly have no feed.** Facebook, a Wix or
  Squarespace block, SociableKit or VenuePilot widgets. Three readers would
  unlock the most: Squarespace event collections (Timnath Beerwerks, The
  Wheel House, Liquid Mechanics, Mountain Toad, MeadKrieger, Artworks, the
  Farmette), Modern Events Calendar RSS (Nissi's, Verboten), and
  ChamberMaster RSS (Erie and Windsor chambers).
- **Aggregators are the fastest fill and the least safe.** Golden Today,
  Live Well Douglas County, Loveland's downtown Tockify and AllEvents list
  other people's events. Treat them like a chamber source: staged for a
  person, never auto-published.
- **Cloudflare walls stand in front of several of the likeliest music
  rooms** (Mash Lab, Windsor Mill Tavern, Oskar Blues Lyons, Scileppi's).
  A person with a browser should look; nothing here went round them.

## Fetched despite a robots rule

Each guide's file names every URL. In summary:

- **Under this repo's precedent, once each, to count:** public Google
  Calendar iCal feeds, Tockify feeds (Wildfire, Loveland downtown), school
  Finalsite `/fs/` calendar feeds, one CivicPlus calendar RSS, and the
  Little Thompson Observatory's calendar export.
- **By mistake, before the host's robots.txt had been read, and not used:**
  thewatervalleycompany.com (home page), coff33.co (one API call),
  c4leadville.org (three `?format=json` calls), leadville.com (home page
  and one feed path), leadvilleloppet.itsyourrace.com (one page, blocked),
  thecarriageshoppes.com, songkick.com and coloradocommunitymedia.com (one
  or two pages each), birdandjim.com and rmconservancy.org (home pages),
  oldfirehousebooks.com, jessupfarm.com and c4fap.org (home pages), sunflowerfarminfo.com (home page),
  timnathchamber.com (sitemap), poudreheritage.org (home page),
  arbiterlive.com (one page), berthoudcolorado.com (home page),
  theoldmine.com (`?format=json`, twice), liquidmechanicsbrewing.com (one
  `?view=calendar` page). The Mountain-Ear served one "subscribers only"
  story in full to a plain request; it was read for leads and no more.
- highplains.libcal.com allows the feed but asks for a ten-second crawl
  delay, which four requests in a row did not keep.

## Part 2: making the events area unlike any other calendar

Read first: the events page, the home page's Today / Tomorrow / This
weekend tabs, and three listings added today. Much of the brief's list is
already built: "Our picks this week", "Don't miss", the three tabs with
"Next in <Town>" under an empty one, a Free filter, and "What's coming up"
on each venue's page. What a resident still notices is that a third of the
listings read like a feed. These five are proposals, not built.

1. **One useful sentence in place of the feed's boilerplate.** 286 of 1,451
   listings say "<Title> at <Venue>, <date>. Listed by <source>; the
   organizer's page has the details and any registration." Replace it at
   review with one sentence that says what it is and one thing a local
   would add ("Open-caption matinee at 2; the 7 pm usually has seats").
   *Fits:* every guide, most of all the ones newly filled by feeds (Windsor,
   Frederick, Leadville, Nederland). *Weekly cost:* the largest here, about
   a minute a listing, so do it for the weekend's rows and the picks only,
   10 to 20 a guide. *Data:* the title, venue and time exist; the sentence
   does not, and must not be machine-written without a person's read.
2. **A reason on every pick.** The picks block shows the listing; it does
   not say why. Add one honest line per pick in the weekly notes ("the only
   night the Messiah is sung here this year"), shown on the events page,
   the Don't miss card and the email. *Fits:* the flagship guides that
   already keep weekly notes. *Cost:* three to five lines a week per guide.
   *Data:* `picks` in `content/<town>/weekly/` holds URLs only; a `why`
   beside each is a small schema addition.
3. **First night, last chance, new venue, just added.** Small flags on a
   row, computed: "Opening night" and "Final weekend" from `performances`
   and a run's `end`; "New here" when the venue's place file was added in
   the last 30 days; "Just added" when the listing is under a week old.
   *Fits:* theatre towns first (Johnstown's Candlelight, Lafayette, Golden,
   Estes Park). *Cost:* none weekly. *Data:* run dates exist; listings have
   no `added` date (0 of 1,451), so "Just added" needs ingest and review to
   stamp one, or the file's first commit date.
4. **Who it is for.** "With kids", "Date night", "Outdoors", "Under $20"
   as pills beside Free. *Fits:* the larger guides, where the fortnight is
   long enough to need narrowing (Fort Collins, Longmont, Loveland, Golden,
   Erie); on a guide with six listings a filter is an empty page. *Cost:*
   a tag or two per listing at review. *Data:* `cost` is on 791 listings as
   free text, so "Under $20" is partly computable; audience is not recorded
   anywhere and would be a new optional field.
5. **What locals know, kept on the venue, shown on its events.** Where to
   park, when it sells out, what is open nearby afterwards: two or three
   lines on the place file, drawn under every listing at that venue.
   *Fits:* venues with ten or more dates a year (Nissi's, the Rialto, Tabor
   Opera House, The Backdoor Theatre, The Wheel House, Candlelight).
   *Cost:* written once per venue, checked twice a year, nothing weekly.
   *Data:* does not exist; it is the one idea that needs someone who has
   been there, which is also why no other calendar has it.

Considered and left out: "tonight" and "this weekend" answers (the tabs,
`/this-weekend/` and the date filters already do it) and the venue page's
next dates (already there under "What's coming up").

## Part 3: turning events into subscribers

Where the signup is now: a strip on the events page between the picks and
the list, a compact form at the foot of each event page, each venue page
and This Weekend, and the home page card. Every form already names the
next send ("Next issue Thursday, November 12 at 7 am"). The email is the
weekend's listings, the school's games, next week day by day (board
meetings included), and what is new or closed on the guide. Quiet guides
(Castle Rock, Elizabeth, Fort Collins, Leadville) and Estes Park have no
email, so none of this applies to them yet.

Measured with what the site already sends: the `newsletter-signup` and
`newsletter-result` events carry the page path (`from`), and every link in
an issue carries `utm_campaign=<send date>`. The one gap is that two forms
on one page are not told apart; adding the form's existing `id` to the
event's properties fixes that and is the only tracking change needed.

Ranked by likely effect:

1. **Ask at the moment of intent, in the reader's words.** Under the
   weekend's list on the home tab and on This Weekend: "Get this list
   every Thursday at 7 am." On an event page, directly under the date and
   venue, not at the foot: "More like this at <Venue>, Thursdays." Under
   "Next in <Town>" on an empty day: "Quiet today. Thursday's email has
   the weekend." *Cost:* copy and placement, once. *Measure:* signups per
   page view by `from` path and form id, before and after, for `/`,
   `/this-weekend/` and `/events/<slug>/`.
2. **Give the email something the site does not have yet.** A "Just
   announced" block (listings added since the last issue, beyond the
   weekend) and the week's pick with its reason leading the issue. Then
   the signup can promise it: "Friday's shows, the weekend, and what was
   just announced." *Cost:* the pick's line is idea 2 above; "Just
   announced" needs the `added` stamp from idea 3, then nothing weekly.
   *Measure:* clicks on that block's links (they carry the campaign tag,
   so add `utm_content=just-announced`), and unsubscribes per issue in
   Buttondown.
3. **Cut the email's civic rows out of "Next week".** Last Thursday's
   Niwot issue listed two board meetings and a business association
   meeting between the music. Keep them on the site and under one line in
   the email ("3 public meetings next week"). An email that reads as worth
   forwarding is how a list this size grows. *Cost:* none weekly.
   *Measure:* click rate per issue and forwards (Buttondown reports both);
   new confirmed subscribers in the two days after each send.
4. **A line and a QR for each venue the guide lists weekly.** "Our shows
   are in Inside Lafayette every Thursday" with a link that opens the
   signup with the town ticked (`/newsletter/?towns=lafayette` already
   works) and a small card for the bar. Start with the venues whose feeds
   were found here: Nissi's, The Backdoor Theatre, The Old Mine, The Wheel
   House, Crooked Beech, Listening at the Legion. *Cost:* one email to
   each venue and a printed card; the relationships skill keeps the list.
   *Measure:* give each venue's link `?ref=<venue>` and count
   `newsletter-signup` by it.
5. **Sell-out and presale warnings, subscribers first.** For ticketed
   rooms only: "Messiah, 4 and 5 December: the Friday is nearly gone."
   *Cost:* the highest of the five, since someone must check box offices
   on Wednesday; try it on one guide (Lafayette or Estes Park, were it not
   a visitor guide) before promising it anywhere. *Measure:* clicks on
   those rows against the issue's average.
