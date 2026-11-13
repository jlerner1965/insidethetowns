---
# A story for the hub: news worth a reader's time in one or more towns.
# Copy to content/hub/curiosity/<slug>.md (the file's name is the slug), fill
# it in, and leave `status: draft` until every fact is checked against the
# sources below. Merging a draft publishes nothing; `verified` publishes it at
# insidethetowns.com/articles/<slug>/, under "In the towns" on the home page
# (for a fortnight, or until homeUntil), and on each town's page.
slug: town-what-happened
kind: story
# The towns it is about: a hub town page's slug or a guide's key
# (src/config/hub-towns.ts). The first one is the one the home page counts.
towns: [nederland]
title: "Headline in sentence case, a fact, not a tease"
# Optional: the title a search result shows, 70 characters at most.
seoTitle: "Town: what happened, in the words people search with"
# The line under the headline and on the home page, 160 characters at most.
description: "One or two plain sentences: what happened and what comes next."
status: draft
date: 2026-11-13
# Optional: the last day on the home page. Without it, 14 days after `date`.
# homeUntil: 2026-11-30
# Every fact in the story comes from one of these, each read on the day given.
# A named news report counts (the Colorado Sun, BusinessDen); the town need
# not have published its own record first. Never a guide site.
sources:
  - label: "Colorado Sun"
    url: "https://coloradosun.com/…"
    checked: 2026-11-13
  - label: "Town of Nederland: board agenda"
    url: "https://www.nederlandco.org/…"
    checked: 2026-11-13
---

The story in plain Markdown. Say who reports what ("the Colorado Sun
reports") where a fact rests on one report. No opinion and no "best"; quote
people only where the quote is the news.

## A heading where the story has parts
