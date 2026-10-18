---
name: content
description: Drafts or revises content for an Inside the Towns site — a new page, a "This Week in [Town]" update, a rewrite of a thin page, or a fix proposed by a site audit. Use when James asks to write, draft, update, rewrite or improve something on a town site. Drafts only; nothing is published.
---

# Content

Write the way the live sites already read. The chassis, the voice and the conventions are in the repo; this skill's job is to match them, not to bring a new style.

## 1. Know what you're writing into

Before drafting anything:

- Read `manager/towns.json` for the town's domain and status.
- Read two or three existing pages of the same kind for the same town (an article, a category page, a past "This Week") so the draft matches their length, headings, tone and front-matter.
- Check `docs/agent/` in the repo: the existing research agent drafts weekly notes, verifies facts and proposes articles there. If a draft for this topic already exists, start from it instead of starting over, and say so.
- Check the memory store under `drafts/<town-slug>/` for anything you drafted earlier on the same topic.

## 2. Draft

- **Facts come from sources, not from memory.** Every business name, hour, date, address, price and claim in the draft needs a source you fetched (`web_fetch`/`web_search`) or a file in the repo. Put the source URL in an HTML comment or a front-matter `sources:` list, whichever the repo's existing pages use.
- If a fact can't be verified, leave it out or mark it `[UNVERIFIED]` with what you found and what is missing, the marker the editor skill (`inside-the-towns-editor`) uses, so James sees it. Never write around a gap with a plausible guess.
- Match the existing pages: same front-matter fields, same heading pattern, same way of linking to other pages on the site, same image conventions. If the chassis has a component for something (a hours block, an events list), use it rather than hand-writing HTML.
- "This Week in [Town]" updates follow the existing structure exactly: New & closed, then the rest. Short. If nothing happened in a section, say so in one line rather than inventing filler.
- Sponsored content: label it clearly as sponsored and mark links as sponsored, per James's rule. If the brief doesn't say who is paying or what the budget is, stop and ask before drafting.

## 3. Hand off

- Save the draft to the memory store at `drafts/<town-slug>/<YYYY-MM-DD>-<short-slug>.md`.
- In your reply, give the full draft, then a short block:
  - the repo path where it would go (follow the existing content layout)
  - any `[UNVERIFIED]` items, listed out
  - anything you changed from an existing `docs/agent/` draft and why
- **Never write into `content/`, never commit, never push.** James publishes.

## What not to do

- Don't change the voice. If a page reads plain and local, the draft reads plain and local.
- Don't add sections the sibling pages don't have.
- Don't produce three versions unless asked. One good draft.
- Don't write about a business, event or person you couldn't find a source for.
