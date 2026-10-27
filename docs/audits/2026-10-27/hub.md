# Inside the Towns (the hub) — site audit 27 October 2026

**Verdict:** Clean: every page answers, the redirects hold, the feeds and search work, and the business pages say only what has been counted; the one thing the hub cannot show is a sponsor, and the 90-day scorecard has not been filled since its baseline week.

**Numbers:** 27 HTML pages crawled, all 200, home in 267 ms (69 KB), average 124 ms; sitemap 24 URLs with lastmod; /events.rss 50 items; 160 outbound links checked, none dead; www and http:// land on https://insidethetowns.com/ with 200; /compare/ is a 308 to /moving/ as vercel.json says; CSP, HSTS and X-Frame-Options present on every response.

## Fix now
- Nothing that is wrong for a reader today.

## Fix soon
- [design] 5 of 27 pages carry a title over 70 characters (/this-weekend/ 86, /moving/ 82, the Windsor-vs-Fort Collins comparison 74, the shared-edition newsletter archive 79): a chassis rule, not a hub one; see the network summary.
- [design] /search/ and /newsletter/sample/ are noindex and carry no canonical, by design (SEO.astro); /network-search.json is a build-time file the hub's search reads from /pagefind/, not a page, so its 404 is expected.
- [content] The 20 guides' names in the footer and the town switcher read "Longmont · Inside the Towns" for Longmont alone, because that guide's siteTitle is set that way (src/config/towns/longmont.ts:36); every other guide reads "Inside <Town>". If that is deliberate (the name "Inside Longmont" is someone else's?), leave it; otherwise it is the odd one out in every list on every site.
- [business] /advertise/ still has no rate card (hub.rates unset, the validator's standing warning) and no sponsor line is set on any guide or the hub; docs/SPONSOR-OFFER.md proposes $200 a month and waits on your number. The page's audience figures are correctly withheld until 30 days of counting.
- [business] docs/90-DAY-TEST.md: the week-of-19-October row is empty (sent, subscribers, opens, impressions, clicks) though the first automated send went out on 22 October; the Monday fill from Search Console and Buttondown did not happen on 26 October. Buttondown and Search Console are not reachable from this session, so the numbers are yours to add.

## Since last audit
- The 26 October audit made the business pages lead with what a business can do and removed every unbacked claim; that holds on the live /advertise/ and /for-businesses/ pages.
- The editions list is down to one shared edition (Windsor, Severance and Timnath); the Thursday email of 22 October went out as nine editions through the merge of PR #197.

## Couldn't verify
- Vercel Web Analytics (hub.analytics: true) is enabled per project in the dashboard; the tag is bundled, so the page carries no visible script, and the Vercel connector in this session cannot list deployments (403). Check the Analytics tab once.
- Buttondown subscriber counts and the Formspree inbox: no credentials in this session.

## Proposed changes
- None to content. Two decisions: the Longmont title (above) and the sponsor price.
