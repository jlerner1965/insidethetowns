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
2. "Check current hours" prints under things with no hours by nature: the
   Berthoud mural walk, Erie's and Johnstown's historic walking tours, Niwot's
   gateway sculpture, Niwot Hall, the Old Fire House Museum, "Old Town, Second
   Avenue", "Main Street and the stone town", Planet Bluegrass, the Wildflower
   Pavilion, Miners Alley, the Niwot Inn. `PlaceRow.astro` line 39 applies it
   to anything that is not a park or trail; it should apply to a business with
   a door (restaurant, bar, coffee, shop), and never to lodging.
3. The hero says "what's new in town" only when Worth knowing has something
   (`TownHome.astro` passes `know.length > 0`, as it passes the pick).
4. Regulars that clog the morning list: Berthoud's Cribbage Night is staged
   again every week because the published files are "Cribbage Night at City
   Star" and the feed says "Cribbage Night" (three of today's 19 due items);
   Niwot's Wellness Holiday Panel against `wellness-lecture-2026-12-02` the
   same. Retitle the files to the organizer's words, or add the feed's
   `sourceUid`, and they match.
5. "Nothing listed for the weekend yet" keyed to the day: after Sunday's
   listings are over, "Nothing more this weekend".
6. This week on a Sunday always shows "Next on the calendar" (Berthoud's did,
   having no weekend event left; Lyons's and Johnstown's showed only the one
   Sunday event).
7. New & closed dedupes by name and tag, newest wins.
8. "Nearby this weekend" on This week drops finished listings in the browser,
   as the home tabs do (`data-end`).

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
