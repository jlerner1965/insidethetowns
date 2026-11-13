---
name: research-and-write
description: One-step article pipeline for an Inside the Towns guide — takes a topic and a town, researches it from primary sources, briefs it, drafts it in the house voice and article format, fact-checks every claim, sharpens the headline, and hands back a ready-to-review draft. Use when James says "here is a topic, research and write an article", "research and write…", "write an article about X in [Town]", or gives a topic and a town and asks for an article. Drafts only; nothing is published.
---

# Research and write

James gives a topic (and usually a town). You hand back one finished, sourced draft article. Run the steps below in order without stopping to ask, except where a step says to ask.

The house rules always win. `inside-the-towns-editor` sets the voice, the accuracy rules and the article file format. `content` sets how to match sibling pages and how to hand off. The plugin skills used below are tools for one step each; when one of them suggests something that breaks a house rule (hype, padding, a fixed word count, a CTA, a hedge on the page), ignore that suggestion.

## 0. Pin down the job

- **Town.** If James named no town and the topic doesn't make it obvious, ask once: "Which town?" Then look the town up in `manager/towns.json` (domain, status) and use its slug for `content/<slug>/`.
- **Topic.** Restate it in one line as the reader's question ("Where can I get breakfast before 7 in Erie?"). That question drives everything after.
- **Already covered?** List `content/<slug>/articles/` and grep the town's `content/<slug>/` for the topic. If an article already answers the question, say so and offer to update that article instead of writing a duplicate. Also check `docs/agent/<slug>/` for an earlier draft, and start from it if there is one.
- **Sponsored?** If the topic is paid for, follow the `content` skill's sponsored rule (ask who is paying and the budget before drafting).

## 1. Read the house rules and the siblings

- Load the `inside-the-towns-editor` and `content` skills (Skill tool) and follow them.
- Read two or three existing articles in `content/<slug>/articles/` (or in a sibling town if this one has none) to match front matter (including `seoTitle`, `updated` and `related` where siblings use them), heading pattern, length, internal links like `/places/<slug>/`, and category names.
- Note which place, event and page files exist on this guide (`content/<slug>/places/`, `events/`, `pages/`). Internal links and `related:` may only point at pages that exist.

## 2. Research

- Search and fetch (WebSearch, WebFetch) **primary sources first**, as the editor skill ranks them: the Town, the county, the chamber, the library, the school district, the business's own site or social page. Local news is a secondary source. Aggregators, SEO listicles, Yelp-style pages and AI-written pages are not sources.
- Use the guide's own place and event files as leads, not as proof; re-check hours and dates on the source.
- While you read, keep a **claims register** in your working notes: every fact you might use (name, address, hours, price, date, open/closed, any number), the URL it came from, and the date you read it. Log URLs that turned up nothing too.
- Stop researching when you can answer the reader's question well. Don't pad the research to fill a word count.

## 3. Brief

Run `content-strategy:content-brief` on the topic, giving it the reader's question, the claims register and the list of existing pages to link to. Keep only these parts of what comes back: one angle, a question-led outline, and which internal pages to link. Drop its conversion point, distribution plan and metrics; the guide doesn't sell anything in an article.

## 4. Draft

Write the article yourself in the exact `content/<slug>/articles/<slug>.md` format from `inside-the-towns-editor`:

- Start with the useful thing: no scene-setting intro. Plain, warm, local; short sentences; specific streets, days and hours; none of the hype words; no exclamation points; "the Town" for the municipal government.
- Every fact comes from the claims register. Every source you used goes in `sources:`.
- Link places and pages that exist on the guide. Put at most three entries in `related:`, and only pages that exist.
- Length fits the topic. Breakfast in Erie is about 400 words; don't stretch.
- Chains: never draft McDonald's, Burger King, Wendy's, Carl's Jr., Taco Bell or Subway as listings.
- Anything you couldn't confirm stays out of the article body. List it under `[UNVERIFIED]` in the hand-off notes.

Do **not** use `online-writing:create-post`, `create-draft` or `improve-writing` for the draft: they bring their own voice and word counts.

## 5. Fact-check

Run `b2b-research-market-and-account:claims-fact-check` on the draft. Name the claims register's URLs as the sources it must use (named sources beat its own search). Then:

- Fix only what it finds wrong, with the smallest change.
- Any claim it can't back with an opened source comes out of the body and goes to `[UNVERIFIED]`.
- Check every date's weekday ("Saturday, November 21") and every "this year" phrase against today's date.
- Set `verified:` to today.

## 6. Headline and structure

- Run `online-writing:headlines` with the reader's question and the draft. Pick the plainest option that says what the article answers (siblings read like "Breakfast in Erie: beignets, burritos, brunch and the 6 am window"). Use it for `title`, and write `seoTitle` with the town and "CO" in it if siblings have one.
- Run `online-writing:diagnose` on the draft. Act only on real structural flags (slow start, buried answer, a section that repeats another). Ignore its advice on hooks, CTAs, length targets and "rate of revelation".
- Check that `excerpt` is under 320 characters and answers the question in one or two sentences.

## 7. Hand off

- Save the draft to `docs/agent/<slug>/article-<YYYY-MM-DD>-<article-slug>.md`. Also save it to the memory store at `drafts/<slug>/…` if one is available.
- **Never write into `content/`. Commit or push only if James asks.** James publishes.
- In the reply, give:
  1. the full draft;
  2. where it goes: `content/<slug>/articles/<article-slug>.md`;
  3. the **`[UNVERIFIED]`** list: each item with what you found and what is missing;
  4. what the fact-check changed, in one line per change;
  5. every URL you read, including ones that yielded nothing;
  6. any sibling article you updated or could update instead.

Keep the reply to the draft and these notes. No alternative versions, no proposed follow-up series.
