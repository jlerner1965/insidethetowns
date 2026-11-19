---
# A story for the hub: news worth a reader's time in one or more towns.
# Copy to content/hub/curiosity/<slug>.md (the file's name is the slug), fill
# it in, and leave `status: draft` until every fact is checked against the
# sources below. Merging a draft publishes nothing; `verified` publishes it at
# insidethetowns.com/articles/<slug>/, on /articles/ and on each town's page;
# `feature: true` also puts it under "In the towns" on the home page while it
# is one of the five newest featured (or until homeUntil). A story whose only
# town is one of the eleven full sections stays in that section, and is on the
# home page and /articles/ only when featured (it stays in its section too).
slug: town-what-happened
kind: story
# The towns it is about: a hub town page's slug or a guide's key
# (src/config/hub-towns.ts).
towns: [nederland]
title: "Headline in sentence case, a fact, not a tease"
# Optional: the title a search result shows, 70 characters at most.
seoTitle: "Town: what happened, in the words people search with"
# The line under the headline and on the home page, 160 characters at most.
description: "One or two plain sentences: what happened and what comes next."
status: draft
date: 2026-11-13
# Optional: on the hub's home under "In the towns". Off unless the owner sets it.
# feature: true
# Optional, with feature: the last day on the home page. Any featured article
# may carry it, whatever its kind. Without it, the story stays until five
# newer featured articles push it off.
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
