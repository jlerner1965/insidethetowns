> Applied on branch `claude/flagship-audit-2026-11-04` (4 November 2026): Chimney Park, the Veterans Day listing (one file with the feed’s ids), the food drive’s second bin, the Art & Heritage Center on three pages, the rec-center hours on Living here, William Oliver’s hours, the Severance parade sentence, Lakeview Park’s date, the Clearview registry URLs, eight re-check dates, the 24 November council as its own canceled listing; two local changes (the 15th Street trail; the leaf and branch drop), the guide’s first. Everything else under Proposed changes below is as the audit proposed; the Decisions for James are open.

# Inside Windsor — site audit 4 November 2026

**Verdict:** Solid on hours and dates; five reader-facing fixes (a canceled council meeting still listed, Chimney Park's reopening now dated, a doubled Veterans Day listing, a hedged Art & Heritage Center page, an unnamed food-drive bin), no dead links, two Worth-knowing drafts.

**Numbers:** all main pages 200. 26 listings past re-check, 40 past events, 41 places without a photo, 8 staged. 15 facts checked at source: 10 match, 4 out of date, 1 inconsistent, 3 unreadable.

## Fix now
- [accuracy] Severance Town Council, Tue 24 Nov: the Town's council calendar marks it CANCELED; the guide lists it. fixes.md §11.
- [accuracy] Chimney Park: the guide says a reopening "estimated but not dated"; chimneypark.com now says "we will be reopening in November of 2026". §1.
- [content] Veterans Day flag placement, Wed 11 Nov, is on /events/ twice (two files). §2.
- [accuracy] Art & Heritage Center shows Thu 3–7 pm and tells the reader to check the exhibition page; the Center's own page and the Town's 26 Oct note give Fri–Sun noon–4. Same hedge in the pick and the walking article. §4.
- [accuracy] Severance Turkey Food Drive (home strip to the 6th) says other drop-off sites are "still to be announced"; the Town names the second bin, the Police Department, 209 1st St. §3.

## Fix soon
- [accuracy] Rec center: /living-here/ says Sat 8–7, Sun noon–6; the place page Sat 8–6:45, Sun noon–6:35, the Town's "current" block. §5.
- [content] William Oliver's shows "Check current hours" while its body gives 11 am–2 am daily (§6); Severance Town Hall still describes "this year's" 30 October parade (§7); Lakeview Park's closure note cites a 10 October read (§8).
- [links] sources.json `clearviewlibrary-org` points at www.clearviewlibrary.org/events, which 301s twice to clearview.libnet.info/events; the `clearview-libnet-info` entry's root URL is a 404. §9.
- [coverage] No page for High Hops Brewery (6461 Hwy 392; highhopsbrewery.com), named on the guide as a brewery, or the farmers market (Saturdays, June–September; recreationliveshere.com/213). Not listed: Dara Weyna retrospective, AHC, 20–29 Nov (recreationliveshere.com/185); Christmas in Windsor craft show, 21–22 Nov (christmasinwindsor.com). 22 listings in the next 45 days; five open restaurants to 16 parks; no coffee shop.
- [content] Eight matched re-checks need only the date (§10); past events, photos, staging as on 27 October.

## Since last audit
- Fixed: This week current, Twilight Tour files gone, the weld.gov link out of the Severance article, Hearth's hours single. Open: the clearviewlibrary.org registry entry. Missed: an Election Day listing.

## Couldn't verify
- windsorco.gov: 403 to curl and WebFetch (20 links, bot-walled, not dead; the reader proxy used on 22 Oct was refused by this session's permissions), so Town Board 9 Nov and the 2027 budget timeline are unread. Vecinos and Mash Lab: 403.
- Severance 2027 budget hearing: the news flash says 6 pm on 11 November; the council calendar shows only 10 Nov.
- Ted's Backyard: not on the guide, nothing to change. VFW bingo 8 Nov: not on the guide, unverified.
- Links: 191 checked, none dead; 403/429 only from bot-walled hosts.

## Proposed changes
All in `fixes.md`, as exact old → new text: §1 Chimney Park status; §2 merge the two Veterans Day files (keep the hand-written one, add `sourceId`/`sourceUid`/`sourceHash` from the ingested one, delete the ingested one); §3 the food drive's second bin; §4 Art & Heritage Center hours on three pages; §5 rec center hours in `src/config/towns/windsor.ts`; §6 William Oliver's `hours`; §7 the parade sentence; §8 Lakeview Park's read date; §9 the two Clearview registry URLs; §10 `verified` dates on eight matched listings; §11 the 24 November council meeting out of the multi-date file and into its own canceled listing.

Drafts for `content/windsor/updates/`: `drafts/15th-street-trail-connection.md` (construction, complete: walkways and safety measures at Harmony Rd and N 15th St, ribbon cutting 26 Oct; PRC news 22 Oct and Project Connect) and `drafts/leaf-and-branch-drop.md` (program, under way: 922 N 15th St, Fri–Sun 8–3 through 15 Nov, card only, fees by vehicle; PRC news 14 Oct).

## Decisions for James
1. AHC Thursdays: the Center's page (Fri–Sun, §4) or keep Thu 3–7 and phone 970-674-3502.
2. Chimney Park as a third update: the source is the restaurant, not official; not drafted.
3. A Severance update once the hearing date is settled, or its 22 Oct Xpress Bill Pay outage notice.
4. The trail draft's `effective`: ribbon cutting (26 Oct) or the August opening.
5. Add the Dara Weyna and craft show events, or not. 6. Merge or drop `clearview-libnet-info`.
