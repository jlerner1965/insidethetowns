---
name: site-audit
description: Audits one Inside the Towns site (or all of them) for site health — content, design, accuracy, links and coverage — and writes a prioritized findings report. Use when James asks to audit, check, review or "look over" a town site, asks what's wrong with a site, or before he contacts a chamber or sponsor about a town. Also the skill the weekly scheduled audit runs.
---

# Site audit

Check one town site the way James would if he had a free afternoon: read the content in the repo, look at the live pages, and write down what's wrong in order of how much it matters. The point is a short list he can act on, not a long list he has to triage.

## 1. Scope the audit

- **Which town?** Read `manager/towns.json` in the repo for the list of towns, their domains and whether they are live. If James named a town, audit that one. If he said "all" or this is the scheduled run, audit every live town and write one report per town plus a short network-wide summary.
- **Which checks?** All five by default (content, design, accuracy, links, coverage). If James asked for one ("just check the links on Erie"), do only that one.
- **What did the last audit find?** Read `audits/<town>/` in the memory store. Note what was flagged before so the new report can say what's fixed, what's still open, and what's new. Don't re-explain a known open item at length — one line and a pointer to the earlier report.

## 2. Gather, don't guess

Work from two sources and keep them separate in your notes:

- **The repo** (mounted under `/workspace/`): the town's content files, the shared chassis, the per-town config/palette, `docs/agent/` drafts, and whatever accuracy/verification system already exists in the repo — read its docs first and respect its conventions.
- **The live site**: fetch the home page, each section/category page, the current "This Week in [Town]" page, and a sample of articles. Use `curl -sL` or `web_fetch`. Record HTTP status, final URL after redirects, and response time for every page you touch.

If a check needs something you can't reach (a page that won't load, a source site that's down), say so in the report as "couldn't verify" — never fill the gap with an assumption.

## 3. Run the five checks

### Content
- Pages that are thin (a heading and two sentences), duplicated across towns with only the town name swapped, or clearly placeholder.
- Stale time-sensitive content: past events still listed as upcoming, seasonal copy out of season, "This Week" pages older than 10 days.
- Missing basics a visitor expects: how to get there, parking, a contact/about page, the correction-report email.
- Spelling of local names (streets, businesses, people) — check against the live source where possible.

### Design
You can't see the rendered page, so check what can be checked from the HTML:
- Every page has a `<title>`, meta description, canonical URL, viewport meta, and the town's palette tokens applied (compare against the chassis conventions in the repo).
- Heading order is sane (one h1, no skipped levels), images have alt text, no broken image URLs, no mixed-content (http assets on an https page).
- Consistency with sibling towns: same nav structure, same footer, same "This Week" strip and signup form. Differences are findings unless the repo config explains them.
- Note anything that would only be visible rendered (overlap, spacing) as "needs a visual check" rather than guessing.

### Accuracy
This is the check James cares about most. He's fine with the number of towns; he is not fine with inaccuracies.
- Pull every verifiable fact from the town's pages: business names, hours, addresses, phone numbers, event dates, prices, "open/closed" claims.
- Verify each against a primary source (the business's own site, the town or chamber site, an official event listing). Use `web_search` and `web_fetch`.
- Report each mismatch with: what the site says, what the source says, the source URL, and the date you checked.
- If the repo's existing verification system already tracks a fact, use its record rather than re-verifying from scratch, and note any disagreement between the two.
- "Couldn't verify" is a valid result. "Probably fine" is not.

### Links
- Crawl internal links from the home page to depth 3 and every external link on the pages you fetched.
- Report 4xx, 5xx, timeouts, and redirect chains longer than one hop. Note soft 404s (a 200 that says "page not found").
- Check that the alternate domains redirect to the Inside domain (`manager/towns.json` lists them) and that `insidefirestone.com` goes to the Carbon Valley site.
- Flag links to competitors or to dead businesses separately from plain broken links.

### Coverage
- Compare this town's categories and page count against the other live towns. What does every other town have that this one is missing?
- Look at the town itself: are there obvious places, events or services (library, rec center, farmers market, major employers, trailheads) with no page? Use `web_search` for "[town] colorado" basics to spot gaps, but only list a gap if you've confirmed the thing exists.
- Check that the Thursday newsletter signup form and the "This Week" strip are present on article pages.

## 4. Write the report

Save it to the memory store at `audits/<town-slug>/<YYYY-MM-DD>.md` and return the same text in your reply. Keep it under 400 words unless the site has real problems; the summary at the top should fit on a phone screen.

```
# Inside <Town> — site audit <date>

**Verdict:** one sentence. (e.g. "Solid; two accuracy fixes and one dead link.")

## Fix now
- [accuracy] Lyons Dairy Bar hours say 11–8; their site says 11–9 since Sept (source: <url>, checked <date>)
- [links] /eat/ → 3 external links 404 (list)

## Fix soon
- [coverage] No page for the Lyons farmers market (confirmed: runs Sundays through Oct, <url>)
- [design] /this-week/ missing meta description

## Since last audit
- Fixed: …
- Still open: … (see audits/lyons/2026-10-10.md)

## Couldn't verify
- …

## Proposed changes
For each "fix now" item that is a content fix: the file path in the repo and a unified diff or the exact replacement text.
```

Tag every finding with one of `[content] [design] [accuracy] [links] [coverage]`. Sort within each section by reader impact: wrong facts first, broken paths second, polish last.

## 5. Hand off, don't act

- **Never edit files under `content/` or push anything.** Put proposed fixes in the report as diffs; James applies them (usually with Claude Code).
- If a finding needs a judgment call (remove a business that may have closed, rewrite a page's angle), list it under a **Decisions for James** heading with the options, instead of picking one.
- For the network-wide run, finish with `audits/_network/<date>.md`: one line per town with its verdict, then the three most common issues across towns, since those are likely chassis fixes rather than per-town fixes.

## What not to do

- Don't invent a fact, a URL, or a number. If it isn't in the repo, on the live site, or on a source you fetched, it isn't in the report.
- Don't pad. A town with no problems gets a three-line report.
- Don't repeat the whole previous report. Reference it.
- Don't audit towns marked not-live in `manager/towns.json` unless James asks.
- Don't recommend adding phases, dashboards or tooling. Report what's wrong with the site.
