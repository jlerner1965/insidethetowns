# Newsletter drafts

The drafts of 8 and 15 October 2026, from when an issue was pasted into
Buttondown by hand and filed in the archive afterwards.

From 22 October the Thursday drafts arrive as a pull request instead
(`.github/workflows/newsletter-drafts.yml`), with each edition already in
`content/hub/issues/`, where a file is its archive page at
`/newsletter/<file name>/`. Merging that pull request sends every edition in
it (`.github/workflows/newsletter-send.yml`, `npm run send-newsletter`); close
it and nothing is sent. If a send fails, the run is red and says why: fix it
and re-run the workflow, which sends only what has not gone, or delete the
file, because an issue that was never sent must not stay in
`content/hub/issues/`.
