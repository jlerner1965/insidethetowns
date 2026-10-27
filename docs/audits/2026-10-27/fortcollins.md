# Inside Fort Collins — site audit 27 October 2026

**Verdict:** Quiet since 20 October and accurate where checked (17 of 20 facts matched, 0 wrong); two re-check flags on November listings await a ruling, the City's old fcgov.com links still work but redirect, and the decision to keep or drop the guide is due 29 November.

**Numbers:** 55 upcoming events; 67 listings; home page 200 in 308 ms, average 81 ms over 90 pages; sitemap 142 URLs; calendar feed 112 events; events page refreshed October 27, 2026.

**Accuracy spot-check (7 listings and up to 3 events, against the business's or organizer's own page, 27 October 2026):** 17 match, 0 mismatch, 3 couldn't verify. Full table: the audit's working file, summarised below.

## Fix now
- Nothing that is wrong for a reader today.

## Fix soon
- [accuracy] Two flags from the nightly re-check: the Thanksgiving Day Run (listed 8:45 am; the organizer's structured data says 9 am) and the CSU Fall Dance Concert evening file (the department feed lists the 2 pm matinee; the evening 7:30 pm show is confirmed on the department's page today). Rule on both: change the run to 9 am, dismiss the concert flag.
- [links] www.fcgov.com and www.fcgov.com/police/ redirect to fortcollins.gov (home, this-week, about): relink to the new domain; the City's utilities page answers 403.
- [links] JAX Outdoor Gear's store page (stores.jaxgoods.com) has an expired certificate; link jaxgoods.com's store finder instead or hold the listing's hours.
- [content] 16 of 67 listings have no hours line; 22 no phone.
- [links] https://www.aggietheatre.com/ now lands on www.z2ent.com (a rebrand, still answering; relink to the new host) — in content/fortcollins/events/shrek-rave-aggie-theatre-2026-10-16.md, content/fortcollins/events/the-red-jumpsuit-apparatus-aggie-theatre-2026-10-10.md
- [design] 24/72 pages have a <title> over 70 characters (search results cut at about 60) (a chassis fix: the " | Inside Fort Collins" suffix plus the date; see the network summary)

## Since last audit
- Quiet since 20 October (DECISIONS.md, 'The city guides').

## Couldn't verify
- fortcollins.gov, lovgov... n/a. Four City sources refuse automated reads (the City calendar, the library, Larimer County), so the City's own listings are confirmed only by hand.
- The Aggie Theatre's own site now redirects to z2ent.com; its tixr.com ticket pages answer 403.
- no response from https://stores.jaxgoods.com/jax-fort-collins-outdoor-gear (DNS, TLS or timeout; the listing's own site may be down) — content/fortcollins/places/jax-outdoor-gear.md
- 14 outbound links answered 403 or 429 to the crawler (bot challenges, not dead pages): larimer.gov (5), tixr.com (3), csurams.com (2), wildcraftmarkets.com (1), fortcollins.gov (1)
- places/jax-outdoor-gear.md hours; address; phone: curl connection failed (000), WebFetch HTTP 503
- events/halloween-organ-extravaganza-2026-10-31.md end: not stated (end is inferred from the 10 pm show)
- events/fall-dance-concert-csu-2026-11-14-evening.md end: not stated

## Decisions for James
- Keep Fort Collins past 29 November, or let it go (DECISIONS.md, 20 October).

## Proposed changes
- content/fortcollins/events/fort-collins-thanksgiving-day-run-2026-11-26.md: `start: "2026-11-26T09:00"`, drop `changeFlag`/`changeNote`, `verified: "2026-10-27"`.
- content/fortcollins/events/fall-dance-concert-csu-2026-11-14-evening.md: drop `changeFlag`/`changeNote` (the 7:30 pm show is on dance.colostate.edu today); `verified: "2026-10-27"`.
