# Inside Grand Lake — site audit 27 October 2026

**Verdict:** Needs attention: the This Week page for the week of 26 October is blank (the research draft picked an event from the Saturday before the week, and the editor rightly dropped it), the guide is under its launch threshold (6 of 10 events), and three of seven listings checked have wrong hours (the Hub, Rapids Lodge, the Visitor Center, now on winter hours).

**Numbers:** 9 upcoming events; 21 listings; home page 200 in 323 ms, average 78 ms over 79 pages; sitemap 53 URLs; calendar feed 20 events; events page refreshed October 27, 2026.

**Accuracy spot-check (7 listings and up to 3 events, against the business's or organizer's own page, 27 October 2026):** 7 match, 3 mismatch, 3 couldn't verify. Full table: the audit's working file, summarised below.

## Fix now
- [content] content/grand-lake/weekly/2026-10-26.md publishes blank (`changes: []`, no pick): add a pick from the week's listings (the library's Día de los Muertos ofrenda on 28 October or the Raven's Reading Room on 31 October, both on the guide) and the Visitor Center's winter hours as a change, which the draft had and the editor dropped for want of an effective date.
- [accuracy] 3 listings wrong against the business's own page: grand-lake-visitor-center.md, rapids-lodge.md, the-hub.md (replacement text under Proposed changes)

## Fix soon
- [content] Under threshold: 6 upcoming events against 10; the Town's calendar (townofgrandlake.com) answers 403 to every automated read, so the library feed is the one machine-readable source.
- [accuracy] Four access notes (Adams Falls, Arapaho NRA, Gene Stover park, Point Park) go stale in 13 days.
- [content] 11 staged places since 10 October; The World's End Brewpub (staged) has no answering site.
- [coverage] 2 restaurants and no bar for a resort town; Sagebrush and the Hub are checked, the rest of Grand Avenue is not.
- [design] 19/56 pages have a <title> over 70 characters (search results cut at about 60) (a chassis fix: the " | Inside Grand Lake" suffix plus the date; see the network summary)

## Since last audit
- Quiet since 20 October. The research agent's prompt now states the week's date window (this audit's branch), so a pre-week pick should not recur.

## Couldn't verify
- townofgrandlake.com (12 links) and sagebrushbbq.com answer 403; grandlakehub.com 429; the Kawuneeche Visitor Center's hours are script-rendered on nps.gov; Rapids Lodge's site states no phone or address.
- 14 outbound links answered 403 or 429 to the crawler (bot challenges, not dead pages): townofgrandlake.com (9), commons.wikimedia.org (2), bobscottsauthenticindianjewelry.com (1), grandlakehub.com (1), sagebrushbbq.com (1)
- places/sagebrush-bbq-and-grill.md hours, address, phone: Cloudflare block
- places/rapids-lodge.md address, phone: not stated on source pages
- places/kawuneeche-visitor-center.md hours: hours not in page HTML

## Decisions for James
- Keep Grand Lake past 19 November, or let it go.

## Proposed changes
- content/grand-lake/weekly/2026-10-26.md: add `pick` (title, body, url of a listing between 26 October and 1 November) and a `changes` item for the Visitor Center's winter hours (source https://gograndlake.com/grand-lake-visitor-center/, checked 2026-10-27).
- content/grand-lake/places/the-hub.md: `hours: "Daily 6:30 am–4 pm; kitchen closes 3 pm"`
- content/grand-lake/places/rapids-lodge.md: `hours: "Thu–Sat: happy hour 3–5 pm, dinner 5–8 pm; closed Sun–Wed"`
- content/grand-lake/places/grand-lake-visitor-center.md: `hours: "Winter: daily 10 am–3 pm"` and `seasonal: { season: "Winter hours", hours: "Daily 10 am–3 pm" }`
