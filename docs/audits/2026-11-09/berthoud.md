> **Applied the same day, on branch `claude/intelligent-edison-vd0kbl`.** All ten Fix-now items; the dated lines that could be fixed before their day (banners, the 12 November links, the election note, past school days, Election Day's `featured`, the scarecrow tense); every Fix-soon accuracy item except the rec-center pool hours, which need a call; American spelling; nine more no-school dates and the in-town clinic on Living here; the Bells of Berthoud, Danny Shafer and Snowlympics. Photographs: two articles, a venue's photograph on its events (`imageListingOnly` opts a place out), the Recreation Center anniversary as the home's Don't miss card, and `docs/BERTHOUD-PHOTO-PLAN.md` (shot list, agreement, six draft emails). Design: photo credits at 11 px, the home tiles' phone images at half the width, larger footer and contents links, the history article's second source list removed.
>
> **Withdrawn, on reading the code:** the long lines on This week and Events (the text already sits in a reading-width column; the measurement read the card, not the text), the cut filter chips (the row already fades at a scrolled edge), and the 41 long titles (`src/lib/titles.ts` fits them to its own limit by design).
>
> **Second pass, the same evening, on the owner's word ("you can take care of all that"):**
>
> - Families and Get involved: on a phone a program's facts fold under "Who, when and cost"; the page went from about 25,100 px to 17,500. A wide screen reads as before.
> - Events: the mid-page signup is off the phone; the form at the foot stays.
> - Place pages with no photograph draw their own street map with a pin: the Census Bureau's public road lines and geocoder, kept in `data/berthoud/place-map.json` by `scripts/place-maps.ts`, no map service loaded. From 10 November the map is drawn from an OpenStreetMap extract the owner supplied (edited to 2 October 2026): streets under the town's names, building outlines, parks and water, credited to OpenStreetMap under each map. 55 of 60 listings are placed, 22 at the building the extract carries and 33 from the geocoder, which the caption calls approximate; every geocoder pin was checked against its cross streets (Fickel Park, a block off, now sits on the park itself).
> - Decisions taken: the State's 2025 estimate (13,137) beside the census figure; both price tiers on youth sports; Osito's and Jessie's published on Berthoud Main Street's listing, without hours; the futsal clinic removed; the holiday card slug carries the 14th; past events kept, as on 4 November.
> - Events added: the fire district's open house (10 November), Meditation in Everyday Life and Craft & Concoct (12 November), Senior Yoga (28 November).
> - Rec center: 2 and 3 January follow the Town's winter guide; 21–23 and 28–30 December, which the guide lists without hours, send the reader to the Town's schedule rather than show the ordinary day.
>
> **Not done, and why:** Trailhead Cafe's and Brick Oven Pizza's own sites refuse automated reads and were not read around the refusal; the four listings that rest on Main Street's directory alone and Wishful Living need a phone call; the home page's signup stays where the owner's numbered layout of 7 November puts it; Eat & drink gets its photo cards from the listings' own photographs, so it waits for the shoot; City Star's feed text on its cribbage and music listings is quoted as City Star wrote it; the Development Code outcome is not published until after the 10 November meeting.

# Inside Berthoud — full audit, 9 November 2026

Read Monday 9 November 2026 (that day's 23:02 UTC build). Every file under
`content/berthoud/` (58 places, 85 events, 7 articles, 23 programs, 7 updates,
the moving-here page, weekly notes, staging, corrections), `src/config/towns/berthoud.ts`
and `data/berthoud/*` was read in full and checked against the organizer's or
business's own page. All 152 live pages were loaded in a browser at 390 px
(phone) and 1440 px (desktop), with the home page also at 320, 768 and 1024.
Nothing under `content/` was edited; everything below is a proposal.

**Verdict:** The calendar is right and the site is technically clean, but six
published facts are wrong or out of date (two election counts, three lines on
Moving here, one trail), three corrections the guide already printed never
reached the pages they correct, and the design's biggest weakness is that
almost nothing has a photograph.

## Fix now (wrong facts a reader can see)

1. [accuracy] **Revere article prints election-night numbers.** `articles/revere-property-what-the-april-vote-decided.md` L44–51: 1A 1,140 / 2,625, 3A 2,577 / 1,185. The Town's certified abstract (16 April 2026, 3,793 ballots): **1A 1,144 yes / 2,636 no; 3A 2,585 yes / 1,192 no**; Grace 2,065, Murphy 1,940, Anderson 1,878, Olbricht 1,292. Source: berthoud.org/DocumentCenter/View/7436/April-7-2026-Municipal-Election-Results.
2. [accuracy] **Ballot Issue 3G update is two postings behind.** `updates/ballot-issue-3g-mountain-vista-park.md` says 4,513 against / 3,082 for. Larimer's seventh posting (6 Nov, 3:33 pm) is 4,473 / 3,053; Weld 65 / 39; together **4,538 against, 3,092 for** (59%). Larimer expects final unofficial results 13 November and final results by 25 November. Source: larimer.gov/clerk/elections/results.
3. [accuracy] **Moving here repeats a claim the guide retracted.** `pages/moving-here.md` L37: "Berthoud was the first Colorado municipality to ban the retail sale of puppy-mill dogs, in 2019." The guide's own 8 November correction says it was not. Replace with: "In 2019 the Board barred pet shops in town from selling dogs or cats that do not come from a shelter or rescue (Ordinance 1267)."
4. [accuracy] **Moving here says BATS runs to Longmont.** L23. The Town: "Effective August 31, 2023 BATS will no longer provide trips to Longmont." Say Loveland only, and point Longmont riders to RAFT. The link also goes to the Town's home page rather than the BATS page.
5. [accuracy] **Moving here's household income is three surveys old.** L15: $95,872 "as Wikipedia cites it" is the 2017–2021 ACS. The 2020–2024 ACS figure is **$119,385** (data.census.gov, DP03).
6. [accuracy] **Carter Lake's Sundance Trail is on the wrong shore.** `places/carter-lake.md` L19 "along the north shore"; Larimer County says it runs "along the west side of Carter Lake".
7. [accuracy] **McCarty-Fickel Home still reads as open.** `places/mccarty-fickel-home.md` L8, L10, L18: "open by appointment until it closes for the season on November 8." It closed yesterday; reopens spring 2027.
8. [accuracy] **Trailhead Cafe: two articles contradict the guide's own 3 November correction.** The breakfast article's table says "Not confirmed" and "by the bike park"; Berthoud with kids says "next door" to the bike park. The correction and the place file say daily 7 am–2 pm at 375 Meadowlark, about a mile from the bike park (1223 Meadowlark). The Eat & drink page shows the hours; the article says there are none.
9. [accuracy] **Living here says early-bird runs "through November".** `berthoud.ts` L141. The winter guide, the Memberships page and the guide's own update say the $15 increase starts 15 November. The rest of the guide says "by November 14".
10. [accuracy] **La Casita's closed page tells readers to call a number that now belongs to Osito's.** `places/la-casita.md` L6, L13: (970) 344-6448 is listed by Berthoud Main Street for Osito's at the same address. Remove the phone and hours.

## Fix this week (dated lines about to go stale)

- **10 Nov:** the Development Code update expires; `programs/town-boards.md` says "The next are November 10 and November 24". Write the outcome.
- **11 Nov:** "Hometown Heroes banners line the avenue" (`explore-berthoud-in-walking-order.md` L50, `places/downtown-mural-walk.md`); the banners come down on Veterans Day.
- **12 Nov:** three article links to `/events/planning-commission-2026-11-12/` (What's being built L37, L44; Revere L61). Repoint to the 10 December meeting.
- **14 Nov:** early-bird prices end (the `price` lines in `programs/youth-sports.md` are then $15 low); Jr. Spartans tryouts; holiday card deadline; babysitter training.
- **Now:** `berthoud.ts` L229 still speaks of the 3 November election in the future tense; two school breaks (2 and 3 Nov) are past; `programs/youth-futsal-clinic.md` closed 1 November and the winter guide has no futsal; `events/election-day-2026-11-03.md` is still `featured: true`; `events/scarecrow-contest.md` is in the present tense for an October contest.

## Fix soon — accuracy

- `articles/carter-lake-trail-permit-and-launch.md` L81: a one-day fishing licence is not "plus the $12.76 habitat stamp" (CPW exempts the first two). L69: the campground paragraph no longer matches the County page and contradicts itself ("no water spigot; every campground has … drinking water"); spigots are off November to March. L77: "The County's trail list did not load the day this was checked" is a placeholder.
- Town Park is "at 7th and Mountain" in two articles; the Town gives 200 N. 7th St.
- `events/winter-craft-fair.md`: "more than 50 Colorado artists and makers … jewelry, home decor, fine art, candles" is on none of the Town's pages, which say "handmade crafts, unique gifts, and seasonal items from local vendors" and name three food trucks.
- `events/humdinger-trivia-city-star.md`: "A food truck parks out front from 4" — City Star gives no time; trivia is in the beer garden, teams of six.
- `events/a-very-merry-berthoud.md`: blacksmithing is "along Mountain Avenue" by the organizer, not at the museum.
- `events/angie-stevens-and-friends-2026-12-21.md`: the quote is Westword's, not City Star's.
- `events/berthoud-historical-society-fall-speaker-series-2026-11-17.md`: "Community Room" is not named by the source.
- `events/small-business-saturday-2026.md` sends readers to a page still showing 2025's specials.
- Digital Navigator: "Fifteen- to twenty-minute" → the library says 15-minute.
- `data/berthoud/rec-center.json`: 31 Dec open swim starts 12:00 with no source for it; 2 and 3 Jan and 21–23/28–30 Dec are not covered and the winter guide's own text conflicts. Needs a call to 970-532-1600.
- `programs/swim-lessons.md` L15: the $30/$40 December price is Tuesday/Thursday only; Monday/Wednesday stays $50/$60.
- `places/bradfords-grub-and-grog.md`: "rests on one report" understates it; Bradford's announced the closing itself (Retro 102.5, 24 Feb 2026) and its site is gone.
- `places/wishful-living.md`: its web shop returns "This store is unavailable"; Main Street is the only source. Phone (970) 532-9834.
- What's being built L106: the 27 October data-centre item was a consent-agenda summary, not a briefing. Campion (L101) has had no outcome for 14 months.
- Ziggi's: the article says its page shows no hours; the place file says "Daily 6 am–6 pm". One must change.
- The youth body has three names across the guide (Commission / Committee / Board); the Town says Youth Advisory Commission. Moving here also says "Historic Preservation Commission" (it is the Advisory Committee).
- Unsourced lines in place files: Berthoud Brewing "one of the pourers at Oktoberfest"; Grandpa's "the one place in town for Indian food"; Happy Eating "the town's Chinese restaurant"; City Star "a dozen taps … grow their own Centennial hops"; Rec Center "closes for a maintenance week each September"; "Berthoud Reservoir Loop" (the Town says only "a walking trail").

## Design — phone (390 px)

What works: no page scrolls sideways at 320, 390, 768, 1024 or 1440; every page has one h1, ordered headings, a title, description, canonical and share image; no broken images, no console errors, no dead internal links; the menu, search and 404 all work; colours pass AA.

1. **Almost nothing has a photograph.** 51 of 58 places, 84 of 85 events and 5 of 7 articles have none. Eat & drink, Families, Living here, This week and every place page render as text only. This is the single largest gap between this site and what a reader expects of a town guide.
2. **Families is 25,000 px tall on a phone** (about 30 screens); Events 22,000; Get involved 13,500. Every program prints Who / When / Season / Where / Cost / Bring / Registration in full. Collapse each program to its title, age, deadline and a Register button, with the rest behind a "details" toggle.
3. **The signup box interrupts the content.** On Events it sits between Our picks and the calendar; on place pages it is a full screen between the listing and "More in Berthoud"; on the home it comes before Find your next stop. Move it below the main content on phones.
4. **Home tiles download 665 KB for three 44-px strips.** Find your next stop is three thin bars on a phone, but each loads a full 4:3 photograph (200–234 KB each). Either show them as real photo cards or serve a strip-sized image.
5. **Tap targets under 40 px:** footer "nearby guides" links (29 px tall), event-row title links (26 px), article contents links (26 px), the town checkbox in the signup form (21 px).
6. **Filter chips are cut mid-word** at the screen edge ("This weeker", "Co", "A") with no fade or arrow to show the row scrolls.
7. **The photo credit is 8.5 px** (`text-[0.5rem]`), below any readable size; eyebrow labels are 12.75 px.
8. **"Check current hours" and "Hours unknown"** print on Brick Oven Pizza, Joyful Brews, Arcana House and the McCarty-Fickel Home; "Cost: See organizer" on 28 events. Each is a row that tells the reader nothing.
9. **The Blues Bash row has no time in the time column** ("Sat") while its neighbours do; the time sits in the detail text.

## Design — desktop (1440 px)

1. **The hero promises something the first screen does not show.** Desktop reads "What's on in Berthoud this week, what's new in town, and the one we'd go to"; the pick is only visible after clicking the This weekend tab. The phone hero drops that clause altogether. Show the pick beside the listings.
2. **The right third of the home page is empty.** What's happening stops at about 930 px of a 1,206 px column; nothing sits beside it. That space is where the pick, or a photograph, belongs.
3. **Lines are too long to read on This week (about 145–155 characters) and Events (about 100).** 60–80 is comfortable. Cap the text column.
4. **41 page titles exceed 60 characters** and will be cut in search results, mostly event pages ("Historic Preservation in Berthoud: the Historical Society's November talk — Nov 17" is 82) and place pages with "— Shop in Berthoud, CO | Inside Berthoud" appended.
5. **The history article prints its sources twice** (a "Sources" section in the body and the layout's list at the foot).
6. Footer shows hello@insidethetowns.com; the config's address is hello@insideberthoud.com.

## Writing

- British and American spelling are mixed (summarised, organisers, neighbourhood, storey, per cent, grey, "ring ahead" beside center, license, percent). American is the obvious choice for Colorado.
- Hours are written three ways: 14 place files use bare numbers ("Sat 7–8" reads as one hour on the Rec Center and Cocina), four omit closed days.
- Hours are repeated in body prose in 13 place files, so each change needs two edits.
- Four events carry a boilerplate body ("Listed by City Star Brewing; the organizer's page has the details"); Kelly Aspen's is the whole text.
- "Berthoud does breakfast better than dinner" and "the one downtown kitchen that goes on to dinner" (the same table shows two others) are unsupported.
- Slugs: `holiday-card-art-contest-deadline-2026-11-07` is the 14th; one slug is cut off at "-johnny-johnston-a-"; cribbage has three slug patterns.
- City Star's address appears three ways across 35 files; the library's two.

## Coverage (each confirmed on the organizer's page, 9 November)

- **Events in the next 30 days not listed:** library Meditation in Everyday Life and Craft & Concoct (12 Nov), Senior Yoga (28 Nov); fire district open house (10 Nov, 4:30–6, Station 61); Snowlympics at Pioneer Village (5 Dec); Vitalant blood drive (6 Dec); Bells of Berthoud (13, 20, 24 Dec); Danny Shafer at City Star (26 Dec).
- **Places:** Osito's and Jessie's Pub are staged and confirmed by Main Street; Berthoud Dog Park, TPC Colorado, the Chamber, UCHealth Primary Care – Berthoud (Living here lists no in-town clinic).
- **Get involved:** RAFT volunteer drivers, Habitat volunteering, House of Neighborly Service, adult rec leagues, Wellness Wednesday, Golden Links (seniors).
- **School calendar:** nine no-school dates from January to May are missing from Families (MLK Day, 19 Jan, 12 and 15 Feb, 4 and 5 Mar, 30 Apr, 3 May, 27 May).
- Moving here has no `verified` date, no sources and no claims file, unlike seven other towns.

## Couldn't verify

- Trailhead Cafe (trailhead.cafe answers 403), Brick Oven Pizza's own site (403), and the script-loaded hours for Aussie's, Cobblestone Corner, Forbici and Ziggi's.
- The chamber's calendar (berthoudcolorado.com renders nothing to a fetch).
- The 3G ballot wording; the "113 sites" at Carter Lake; drive times and distances.
- Four listings rest on Berthoud Main Street's directory alone (Brick Oven, Indigo Sky, Log Cabin Liquors, Wishful Living), and that directory is wrong today on Cocina's address and four phone numbers.

## Since last audit (4 November)

- Fixed: the 3G result leads Worth knowing; Kofe House's Thursday dinner; the playoff venue.
- Still open: B-Rad's and Ziggi's decisions; Cornerstone's hours source; no farmers market page; photographs.

## Decisions for James

- Population: keep "about 10,300 (2020 census)" or add the State's 2025 estimate of 13,137.
- 3G: refresh now, or wait for 13 or 25 November.
- Early bird: "by November 14" or "through November 15" (the Town prints both).
- Past events (16 files): keep for old email links, or prune.
- City Star Social Run on Thanksgiving, 24 and 31 December: follow the brewery's feed or hold until it confirms.
- Futsal: delete or keep as "returns next fall".
- Main Street-only listings: keep, phone, or move to staging.
- "A real Main Street" in the tagline, when the street is Mountain Avenue.
- Publish Osito's at La Casita's address.
