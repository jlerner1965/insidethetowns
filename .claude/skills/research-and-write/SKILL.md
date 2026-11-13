---
name: research-and-write
description: Two-word article workflow for an Inside the Towns guide. "Write an article about X in [Town]" researches the topic from primary sources, drafts it to the editor skill's Article structure, fact-checks every claim and hands back the draft in chat. "Publish" then puts that draft live (file, checks, pull request, CI, merge) with no repo steps for James. Use when James says "research and write…", "write an article about…", "here is a topic…", gives a topic and a town, or says "publish" / "publish it" / "looks good, publish" about a draft in this conversation.
---

# Research and write, then publish

Two steps for James, nothing else:

1. **"Write an article about X in [Town]."** You research, draft, fact-check and show the draft in chat (steps 0–7).
2. **"Publish."** You put that draft live (step 8). James never opens the repo.

Between the two he may ask for changes ("shorter", "add the trailhead"); edit the same draft and show it again. Run the steps in order without stopping to ask, except where a step says to ask.

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

Pick the template from the editor skill's **Article structure** section (news explainer, service guide, roundup, event guide, history or profile). Then run `content-strategy:content-brief` on the topic, giving it the reader's question, the template, the claims register and the list of existing pages to link to. Keep only these parts of what comes back: one angle, a question-led outline that fits the template, and which internal pages to link. Drop its conversion point, distribution plan and metrics; the guide doesn't sell anything in an article.

## 4. Draft

Write the article yourself in the exact `content/<slug>/articles/<slug>.md` format from `inside-the-towns-editor`, built to its **Article structure** section: headline, top, body, end, template and length all come from there, and that section wins over anything in this skill. Also:

- Plain, warm, local; specific streets, days and hours; none of the hype words; no exclamation points; "the Town" for the municipal government.
- Every fact comes from the claims register. Every source you used goes in `sources:`.
- Link places and pages that exist on the guide. Put at most three entries in `related:`, and only pages that exist.
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

- Run `online-writing:headlines` with the reader's question and the draft. Keep only options that meet the Article structure's headline rules (6 to 11 words, place and searched thing in the first five, no curiosity gaps or superlatives) and pick the plainest. Write `seoTitle` the same way if siblings carry one (70 characters is the schema's limit; aim for 60).
- Run `online-writing:diagnose` on the draft. Act only on real structural flags (slow start, buried answer, a section that repeats another). Ignore its advice on hooks, CTAs, length targets and "rate of revelation".
- Do the Article structure's last check: read only the headline, the first paragraph and the H2s.
- Check that `excerpt` is under 320 characters and gives the answer, not a teaser.

## 7. Hand off the draft

- Save the draft to `docs/agent/<slug>/article-<YYYY-MM-DD>-<article-slug>.md`. Don't commit it yet.
- Don't write into `content/` until James says "publish".
- In the reply, give:
  1. the full draft;
  2. the **`[UNVERIFIED]`** list: each item with what you found and what is missing (or "None");
  3. what the fact-check changed, in one line per change;
  4. the template used, and every URL you read, including ones that yielded nothing;
  5. any sibling article you updated or could update instead;
  6. one last line: **Say "publish" to put it live at `https://<domain>/articles/<article-slug>/`.**

Keep the reply to the draft and these notes. No alternative versions, no proposed follow-up series.

## 8. Publish (only when James says "publish")

"Publish" in this conversation, about a draft shown here, is James's own instruction to put that one article live, merge included (the owner, 13 November 2026). It covers that article only. Do all of this without asking him to touch the repo:

1. **Nothing open.** If the `[UNVERIFIED]` list isn't empty, ask once: cut those lines, or hold? The live file never carries `[UNVERIFIED]`, "reportedly" or any hedge, and it carries no Editor's notes or HTML comments.
2. **The live guide.** Look up the town in `manager/towns.json`. If it isn't `"live": true`, say the article will merge but won't be seen until the guide is live, and ask whether to go ahead.
3. **Fresh branch.** Fetch `origin/main` and start the session's working branch from it, so the pull request holds this article and nothing else.
4. **The file.** Write `content/<slug>/articles/<article-slug>.md`: the draft's front matter and body, with `date` and `verified` set to today. Fix the slug if a file by that name already exists. For a hub story or event article (`content/hub/curiosity/`), set `status: verified` only when it has no open flags.
5. **Checks.** Run `npm run validate`, `npm test`, `npm run check-colors` and `npx astro check`. If one fails, fix the article (not the tests or the validator) and run them again. Never skip a check.
6. **Pull request.** Commit only the article (and remove its draft from `docs/agent/` in the same commit if you committed one), push the working branch, and open a pull request titled `Publish: <title> (<Town>)` whose body is the article's first paragraph, its sources and the checks you ran. Subscribe to its activity.
7. **Wait for CI.** CI builds every live site. Wait for every check run to finish. If one fails, find the cause in the article, fix it, push, and wait again; if the failure is unrelated to the article, say so and ask James what to do. Never merge on red.
8. **Merge.** When every check is green and there is no conflict, merge the pull request (merge commit, as the repo does).
9. **Tell James**, in two lines: it's merged, and it will be live at `https://<domain>/articles/<article-slug>/` in a few minutes once Vercel rebuilds. Then unsubscribe from the pull request.

If James says "publish" with more than one draft in the conversation and it isn't clear which one he means, ask which.
