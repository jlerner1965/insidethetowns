# The six flagships, read as a reader: 1 November 2026

Inside Berthoud, Inside Erie, Inside Niwot, Inside Lyons, Inside Golden and
Inside Johnstown, read live on the evening of Sunday 1 November 2026: every
main page in full, four articles, and the suspect rows checked in a
phone-width browser. Three passes: what was found, the simple improvements
missed, and the first-impression pass (below). The owner asked for all of
it to be kept; nothing here is done until a row says so.

## Pass 1: what was found

- **The sports strip says "Tue" for games a month away.** Lyons, Niwot and
  Johnstown: "Boys basketball vs Brush · Tue 7 pm" and the like, for games on
  1 December. Football's upcoming list is empty, so `nextGame` reaches for the
  next game in any sport and the strip prints a weekday alone.
- **The hero line promises "what's new in town" on Lyons and Johnstown**,
  which have no updates, so Worth knowing never shows. Both have changes in
  their weekly notes (the Lyons ballot box moved; the Johnstown hospital
  closed) that never became updates.
- **Election Day is Tuesday and only Niwot and Lyons list it.** Berthoud has
  the ballot issue in Worth knowing; Erie, Golden and Johnstown say nothing.
- **This week on a Sunday night is last week**, with "nothing verified for the
  rest of this week" and the roll-over Monday morning.
- **Weekends are thin**: this weekend's tabs held one Sunday event in Erie and
  Lyons, three in Golden, none in Berthoud, Niwot or Johnstown. Weekdays are
  library programs and meetings.
- Johnstown: 50 calendar entries against 90 to 101 elsewhere, 9 of 11
  near-term rows the library, Buc-ee's as the featured Eat & drink card (the
  only place with a photograph), the pick checked 7 October, a barn as the
  hero. Lyons: the pick checked 17 October, a hero with no town in it. Golden:
  24 places on Eat & drink, one Worth knowing item. Erie: the boys' soccer
  state semifinal is Tuesday and nothing on the home treats it as the week's
  event.
- Golden's This week shows Buffalo Bill's winter hours twice (last week's note
  and this week's). "Nothing listed for the weekend yet" on a Sunday night.
  "Nearby this weekend" lists 11 am events at 7 pm.

## Pass 2: simple improvements missed

A correction first: the "time note printed twice" reported in conversation
was not real; the row carries a phone and a desktop version and the text dump
showed both. Place rows and the sports table are fine for the same reason.

Fix once in code, every guide gets it:

1. The sports strip prints the date once a game is beyond this week
   (`SportsBar.astro`, `nextGame`).
    → Done 1 November 2026.
2. "Check current hours" prints under things with no hours by nature: the
   Berthoud mural walk, Erie's and Johnstown's historic walking tours, Niwot's
   gateway sculpture, Niwot Hall, the Old Fire House Museum, "Old Town, Second
   Avenue", "Main Street and the stone town", Planet Bluegrass, the Wildflower
   Pavilion, Miners Alley, the Niwot Inn. `PlaceRow.astro` line 39 applies it
   to anything that is not a park or trail; it should apply to a business with
   a door (restaurant, bar, coffee, shop), and never to lodging.
    → Done 1 November 2026: restaurant, bar, coffee, shop, service only.
3. The hero says "what's new in town" only when Worth knowing has something
   (`TownHome.astro` passes `know.length > 0`, as it passes the pick).
    → Done 1 November 2026.
4. Regulars that clog the morning list: Berthoud's Cribbage Night is staged
   again every week because the published files are "Cribbage Night at City
   Star" and the feed says "Cribbage Night" (three of today's 19 due items);
   Niwot's Wellness Holiday Panel against `wellness-lecture-2026-12-02` the
   same. Retitle the files to the organizer's words, or add the feed's
   `sourceUid`, and they match.
5. "Nothing listed for the weekend yet" keyed to the day: after Sunday's
   listings are over, "Nothing more this weekend".
    → Done 1 November 2026: "Nothing more listed this weekend." on the Sunday.
6. This week on a Sunday always shows "Next on the calendar" (Berthoud's did,
   having no weekend event left; Lyons's and Johnstown's showed only the one
   Sunday event).
    → Done 1 November 2026.
7. New & closed dedupes by name and tag, newest wins.
    → Done 1 November 2026.
8. "Nearby this weekend" on This week drops finished listings in the browser,
   as the home tabs do (`data-end`).
    → Checked 1 November 2026: the block already carries the marks and the script runs on every page; the rows that stood were timed listings with no end, which stay for their day by rule (`listedUntil`). An end time in each file is the fix; not a code change.

Content, a file or two each:

9. An Election Day listing on Berthoud, Erie, Golden and Johnstown, from each
   county's page: ballots due 7 pm Tuesday 3 November, the drop boxes.
10. Doubled events: Berthoud's Sugar Britches on 20 November and 18 December,
    each already inside a release-night listing; Lyons's "Fifth Sunday
    Classics" and "Fifth Sunday Classics pinball tournament" on 29 November.
11. Berthoud's Digital Navigator says "Tuesday to Thursday, 11 to 1" and is
    listed on Tuesdays only.
12. Editor's notes in public fields: Niwot's "Niwot Community Connection"
    shows "Hall booked 9 am to noon; the October session ran 10 to 11:30" as
    its time; the Rebecca Folsom concert shows "Not yet announced" as its
    price; the Scouts entry cites a room booking on 26 October.
13. The Lyons Redstone Museum lists June-to-September hours in November with
    no closed-for-the-season line (Niwot's flower cart has one: `season`).
14. Venue names that do not match the place, so the event and the place page
    stop linking: "The Dugout Grill and Bar" (Erie events) vs "The Dugout
    Grill & Bar"; "Lyons Community Library" vs "Lyons Regional Library".
15. The About pages call every flagship "an independent community and visitor
    guide"; "community guide" on a resident guide.
    → Done 1 November 2026.
16. Berthoud's Cribbage Night is eight one-off files with the cost on some and
    "sign up by 5:45" on one: one biweekly series, or consistent.
17. The Historical Society's 17 November talk names no topic; Erie's
    "Centennial State Ballet presents The Nutcracker" is a 30-minute library
    preview titled as the ballet.

Worth a decision:

18. The phone strip shows the latest result only (rule 8), so Erie's state
    semifinal on Tuesday is invisible on the phone home. Show the next game
    instead when it is within three days or a playoff.
19. Playoff brackets came out after Sunday's 8 am MaxPreps read: Johnstown
    (9-1) and Lyons have empty football lists. A manual run, or a Monday run
    during playoffs.
20. Hero photographs: Johnstown's barn and Lyons's distant view show no town
    (both already on the owner's shoot list).

## Pass 3: first impressions, as a visitor who will leave in ten seconds

Read on the desktop first screen (1366 by 768) of all six homes, the phone
first screen of an event page, a place page, This week and Events, and two
landing pages to the bottom. The sites run above a 70 per cent bounce rate;
this pass asks what the first screen gives a stranger.

What the first screen is, on every home: the nav, the photograph with the
name and the line, the sports strip, "What's happening in <Town>", three
tabs, and one to three rows or "Nothing listed for the weekend yet" over
"Next in <Town>". Nothing else is above the fold on a desktop; on a phone
not even the rows.

21. **The default tab opens on a weekend that is over.** On a Sunday evening
    every home opens on This weekend: Golden's shows an 11 am home show at
    9 pm; Johnstown's, Niwot's and Berthoud's show "Nothing listed for the
    weekend yet". `defaultTab(now)` picks the weekend on Saturday and Sunday;
    after Sunday afternoon it should open on Tomorrow, or on the week.
    → Done 1 November 2026: Tomorrow opens from five on the Sunday afternoon, by the reader's clock.
22. **A thin day shows the thinnest things.** "Next in <Town>" is the next
    three listings in time order, which on a Sunday night are Monday's
    storytimes and a council meeting (Johnstown, Berthoud) or Tuesday's
    trivia and a committee (Niwot). The same guides hold the Parade of
    Lights, Enchanted Evening, the Holiday Market, the Polar Express, all in
    "Big dates ahead" on the Events page and invisible on the home. When the
    tabs are thin, the home should show the next festivals, markets, music
    and the pick, not the next three regulars: rank by kind, meetings and
    storytimes last.
    → Done 1 November 2026: the pick, then one-off outings by date, the regulars and the civic calendar last, the third slot kept for the next festival, market or music.
23. **The best writing is two clicks down.** The desktop nav is This week,
    Events, sports, Eat & drink, Families, Living here, Towns, Thursday
    email. Things to do and Guides (the articles: the dog rules, the county
    line, the fire districts) are reached from a tile or the footer. A
    visitor who leaves from the first screen never learns they exist. One
    nav slot for Things to do or Guides, or the week's article on the home.
24. **Nothing on the first screen says what this is or why to trust it.**
    "Independent", "free", "checked against the source" are in the footer
    and the About page. The Events page carries "Refreshed November 1,
    2026"; the home carries nothing. One line under What's happening, "Every
    listing checked against its source; refreshed November 1", is the
    cheapest trust the page can buy.
    → Done 1 November 2026: one line under What's happening.
25. **This week's first screen leads with its own age.** Lyons: "October 26
    – November 1 · Checked October 17, 2026: the item here was read against
    its own source that day", then one Sunday event under way. The first
    substantive line a visitor reads is a fifteen-day-old check date for a
    week that ends today. The week's dates and the pick first; the check
    line after the content, and never older than the week.
    → Done 1 November 2026: the dates lead and the Checked line follows the week's content. The check dates themselves are what they are; a check older than the week is a thing for the Wednesday editor, not the template.
26. **The Events page's first screen is all controls.** Title, two buttons
    (Submit an event, Subscribe to calendar), "Just the weekend?", the When
    filters, the type filter, the regulars checkbox, Jump to, then
    Highlights. On a phone the first event is below the fold. Submit and
    Subscribe belong at the bottom; the first listing belongs in the first
    screen.
    → Done 1 November 2026: the two buttons are after the list.
27. **The email ask follows an empty list.** On a phone the signup box comes
    straight after What's happening (rule 9); on Johnstown tonight that is
    "Nothing listed for the weekend yet", three library rows, then "Your
    Thursday local: the week's events". A visitor who has just seen none is
    the wrong moment to ask. Worth a decision: on a thin day, the tiles
    before the form.
28. **The hero photograph is the first impression, and two fail it.**
    Johnstown's barn says farm; Lyons's distant hills say nowhere in
    particular. Erie, Niwot, Golden and Berthoud say a town. Both are on the
    owner's shoot list; this pass puts them first on it.
29. **Event pages land well.** Title, day, time, venue, Next, Where, Cost,
    the organizer's button and Add to calendar are all in the first phone
    screen, and "Checked November 1, 2026 against coloradorailroadmuseum.org"
    is the right line to have. Two things a visitor from a search wants and
    does not get: a directions link on the event's Where (the place page has
    one), and, on the Polar Express page tonight, "Also coming up" listing
    three Sunday events that were over (the same pruning as item 8).
    → Done 1 November 2026 for the directions link. "Also coming up" already carries the pruning marks; the three Sunday rows were timed listings with no end, kept for their day by rule (item 8).
30. **Place pages land well.** "Open · closes 9 pm" under the name, then
    address, directions, hours, phone, website, the photograph, the events
    at the place, the articles that mention it. Nothing to add; this is the
    template the event page's first screen should copy for its venue.
31. **The sports strip is the second thing on every page**, above the week,
    for every visitor, and tonight on three guides it is wrong (item 1). For
    a visitor who is not following the team it is a band of someone else's
    news between the photograph and the point of the site. Not a change to
    make now; a thing to measure, since the strip is the one element the
    home cannot hide.

The thread through 21 to 27: the home's first screen is built for a reader
who already knows the site and comes back for this week; a stranger needs
the week's best thing, a reason to trust it and a way to the depth, in the
first screen, on a thin day as much as a full one.
