# Deploying

One Git repository, one Vercel project per domain. Every project builds the same
code; the `TOWN` environment variable decides which site it produces.

```
insidethetowns.com   TOWN=hub
insideniwot.com      TOWN=niwot
insidelyons.com      TOWN=lyons
insideberthoud.com   TOWN=berthoud
insideerie.com       TOWN=erie
insidejohnstown.com  TOWN=johnstown
insidetimnath.com    TOWN=timnath
insideelizabeth.com  TOWN=elizabeth
…
```

`node scripts/live-towns.ts` prints the list of sites that must have a project.

## One-time: the production branch

Vercel deploys to production from the repository's default branch. Create `main`
from the current work and make it the default branch on GitHub before creating
projects, so every project's production branch is `main`:

```
git checkout -b main
git push -u origin main
# then GitHub → Settings → Default branch → main
```

## Creating a project (about five minutes per town)

1. **Vercel → Add New → Project → Import** `jlerner1965/insidethetowns`.
2. **Project name:** the domain without the dot, e.g. `insideniwot-com`. The name
   only affects the `*.vercel.app` preview hostname.
3. **Framework preset:** Astro. **Build command, output directory** and the security
   headers come from `vercel.json`; leave the overrides off.
4. **Environment variables:** add `TOWN` = the slug (`niwot`, `hub`, …) for
   Production, Preview and Development. This is the only setting that differs
   between projects.
5. **Node.js version** (Settings → General): 22.x. `package.json` declares
   `engines.node >= 22.18`; the scripts rely on Node's built-in TypeScript.
6. Deploy. The first build takes about a minute. The preview URL shows the site
   with the town's own config; nothing else needs to change.
7. **Domains** (Settings → Domains): add `insideniwot.com` and `www.insideniwot.com`,
   with `www` redirecting to the apex. Vercel shows the DNS records to set at the
   registrar: an `A` record for the apex (`76.76.21.21`) and a `CNAME` for `www`
   (`cname.vercel-dns.com`), or Vercel's nameservers. HTTPS certificates are issued
   automatically once DNS resolves, usually within minutes.
8. When the domain serves, add the slug to `LIVE_TOWNS` in `src/config/index.ts`
   and push. The hub and the network bar pick it up on their next build.

## What happens on every push

- **GitHub Actions** (`.github/workflows/ci.yml`) validates every town's content,
  type-checks, and builds every live site. A push with broken content fails here.
- **Vercel** rebuilds every project from the production branch. Content lives in
  one repo, so a Niwot event edit also triggers a hub build; builds are static and
  take about a minute, which is fine at this scale. If build minutes ever matter,
  Vercel's *Ignored Build Step* can compare `git diff` against `content/<town>/`.
- Preview deployments are created for every branch and pull request on every
  project, each with its own `TOWN`.

## The plan this runs on

**Vercel Pro, one seat.** Not a preference — Vercel's fair use guidelines
restrict Hobby to non-commercial personal use, and list "advertising the sale
of a product or service" as commercial. `/advertise/` is that. A commercial
network on a Hobby account risks being paused, which takes all eight sites
down at once.

One seat covers every project: the eight guides plus the two retired
predecessors serving redirects. Pro is billed per user, not per project.

The build also writes `_headers` and `_redirects` into the output
(`src/integrations/host-files.ts`), generated from `vercel.json`. Vercel
ignores both files; Cloudflare Pages and Netlify read them. That is the exit,
kept working so it stays cheap — see DECISIONS.md for when it is worth taking.

## Redirecting the old sites

Two predecessors have been folded into the network. Both keep their Vercel
project and their domain: the redirects are what preserve the old site's search
rankings, and a paused or deleted domain hands over nothing.

### explorelyons.com → insidelyons.com

Retired 19 September 2026. `vercel.json` in the
[explorelyons repository](https://github.com/jlerner1965/explorelyons) carries
the redirects on `main`, on the repo's default branch and on
`claude/redirect-to-insidelyons`, all at the same commit, because which branch
that Vercel project treats as production was not verifiable from here.

The redirects were **added to** that file, not written over it. It carries
`buildCommand: python3 build.py`, `outputDirectory`, `cleanUrls`,
`trailingSlash` and three header blocks; drop those and the build fails, and a
failed build means the redirects never deploy at all.

Two gotchas worth keeping, both found by testing the live domain rather than
reading the config:

- The apex 308s to `www` first. Checking only the first hop shows a redirect
  that looks right and proves nothing — follow the whole chain.
- With `trailingSlash: true` the incoming path keeps its slash, so a bare
  `/:path*` never matches `/anything/`, **including `/`**. Every rule needs
  `{/}?`, or a `/:path*/` variant, or the homepage quietly goes on serving the
  old site while the named pages all redirect correctly.

`/civic/` had no counterpart here until its content was ported to
`/articles/who-governs-lyons/`; the redirect points there now.

### townofniwot.com → insideniwot.com

`townofniwot.com` is served by the Vercel project `cityofniwot-com`, which deploys
the [cityofniwot.com repository](https://github.com/jlerner1965/cityofniwot.com)
(not the older `townofniwot.com` repository, whose Vercel project has no domain). The
branch `claude/inside-towns-build-plan-7dupte` there replaces its `vercel.json`
with 301 redirects: every old section URL maps to its new page and everything else
to `https://insideniwot.com/:path*`. Merge that branch **only after** insideniwot.com
serves over HTTPS; from the moment it deploys, townofniwot.com serves nothing of its
own. Keep the old project and its domain: the redirects are what preserve the old
site's search rankings.

## Checking a deployment

```
curl -sI https://insideniwot.com/ | grep -i "strict-transport\|content-security"
curl -s https://insideniwot.com/robots.txt
curl -s https://insideniwot.com/sitemap-index.xml | head -c 300
```

Lighthouse (Chrome DevTools or PageSpeed Insights) on `/` and `/events/` should
score 95+ on Performance, Accessibility and SEO; that is the plan's bar and it has
not been measured on a real deployment yet.

## Adding a town later

`npm run new-town <slug> "<Name>"`, fill in the config and content, push, then
repeat "Creating a project" above with the new slug. Under an hour.

## Scheduled rebuilds

The sites are static, so "upcoming" is decided at build time. A daily rebuild
keeps that honest. Once, per Vercel project:

1. Settings → Git → Deploy Hooks → create a hook on the production branch.
2. Collect all eight URLs.
3. In the `insidethetowns` repo: Settings → Secrets and variables → Actions →
   new secret `VERCEL_DEPLOY_HOOKS`, one URL per line.

`.github/workflows/scheduled-rebuild.yml` then fires them daily at 09:10 UTC
and again 20:10 UTC on Thursdays, and can be run by hand from the Actions tab.
Adding a town later means adding its hook URL to that secret; nothing else.

A hook URL is a credential — anyone holding one can trigger deploys. The
workflow prints only the first eight characters of the project segment.

Note that GitHub disables scheduled workflows in a repository with no activity
for sixty days. The pages are built not to depend on the schedule (see
DECISIONS.md, "Staying current without a server"), but if the Actions tab shows
no recent runs, that is why.

## Turning the newsletter on

Nothing about the weekly email renders until `newsletter` is set on
`src/config/towns/hub.ts`. Two steps, in this order:

1. **Add the provider's origin to the CSP.** In `vercel.json`, append it to
   `form-action` in the `Content-Security-Policy` header, e.g.
   `form-action 'self' https://formspree.io https://buttondown.com`.
2. **Set the config.** Buttondown:

   ```ts
   newsletter: {
     action: 'https://buttondown.com/api/emails/embed-subscribe/<username>',
     emailField: 'email',
     tagField: 'tag',
     allTag: 'all-towns',
     sendDay: 'Thursday',
   },
   ```

   Kit's `fields[town]` takes one value rather than repeating, so a Kit setup
   wants one form per town or a single combined tag — set `tagField` to
   `'fields[town]'` and leave `allTag` unset.

Do them the other way round and `npm run validate` fails with the origin to
add, which is the point. Past issues go in `content/hub/issues/` as markdown
and appear at `/newsletter/<slug>/` and in the archive.
