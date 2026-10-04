#!/usr/bin/env bash
# Vercel's Ignored Build Step for one site. Each project's setting
# (Settings → Build and Deployment → Ignored Build Step) is
#
#   bash scripts/vercel-ignore.sh <slug>        # hub, niwot, lyons, ...
#
# Vercel reads the exit code the other way round from a test: 1 builds,
# 0 skips. Anything this script cannot work out builds.
#
# A push builds a site only when it changes something the site is made of:
#
#   content/<slug>/                      the site's own content
#   src/config/towns/<slug>.ts           its config
#   the rest of src/, public/,           shared: every site builds
#     package.json, package-lock.json,
#     astro.config.mjs, tsconfig.json,
#     vercel.json, scripts/run.ts
#   IMAGE_LICENSES.csv rows for          its /credits/ page
#     content/<slug>/
#
# Docs, tests, workflows, the offline scripts (ingest, review, weekly, ...)
# and other towns' content and configs change nothing this site serves. Two
# pages do read other towns: the hub's network events and each town's
# "nearby" block on /events/. Those catch up at the nightly rebuild.
#
# Rebuilds always build. The nightly deploy hook and the dashboard's Redeploy
# run this step too, and Vercel tells it nothing about what started the
# deployment. The commit does: a push is deployed within minutes of being
# made, while a rebuild deploys whatever main already was. So a commit that
# is already deployed, or more than 30 minutes old, builds, and the nightly
# workflow waits for main's tip to be at least that old before it fires
# (.github/workflows/scheduled-rebuild.yml).

slug="${1:-${TOWN:-}}"
build() { echo "Ignored Build Step (${slug:-?}): build — $1"; exit 1; }
skip() { echo "Ignored Build Step (${slug:-?}): skip — $1"; exit 0; }

[ -n "$slug" ] || build "no site named"
head="${VERCEL_GIT_COMMIT_SHA:-$(git rev-parse HEAD 2>/dev/null)}"
prev="${VERCEL_GIT_PREVIOUS_SHA:-}"
[ -n "$head" ] || build "cannot tell which commit this is"
[ -n "$prev" ] || build "no earlier successful deployment to compare with"
[ "$prev" != "$head" ] || build "${head:0:7} is already deployed, so this is a rebuild"

# IGNORE_STEP_NOW is for the tests; Vercel never sets it.
now="${IGNORE_STEP_NOW:-$(date +%s)}"
made="$(git log -1 --format=%ct "$head" 2>/dev/null)"
[ -n "$made" ] || build "cannot read ${head:0:7}"
age=$((now - made))
[ "$age" -lt 1800 ] || build "${head:0:7} was made $((age / 60)) minutes ago, so this is a rebuild, not a push"

# Vercel clones ten commits deep; the last deployment can be further back.
if ! git cat-file -e "$prev^{commit}" 2>/dev/null; then
  git fetch --quiet --depth=1 origin "$prev" 2>/dev/null || build "cannot see ${prev:0:7} to compare with"
fi
changed="$(git diff --name-only --no-renames "$prev" "$head")" || build "cannot compare ${prev:0:7} with ${head:0:7}"

while IFS= read -r path; do
  case "$path" in
    "content/$slug/"*)
      build "$path" ;;
    src/config/towns/*.ts)
      name="${path#src/config/towns/}"
      name="${name%.ts}"
      [ "$name" != "$slug" ] || build "$path"
      # Another town's config is that town's; registry.ts and types.ts are everyone's.
      [ -d "content/$name" ] || build "$path (shared)" ;;
    src/* | public/* | package.json | package-lock.json | astro.config.mjs | tsconfig.json | vercel.json | scripts/run.ts)
      build "$path (shared)" ;;
  esac
done <<<"$changed"

if git diff --no-renames "$prev" "$head" -- IMAGE_LICENSES.csv | grep -q "^[-+]content/$slug/"; then
  build "IMAGE_LICENSES.csv rows for content/$slug/"
fi

skip "nothing $slug is built from changed since ${prev:0:7}"
