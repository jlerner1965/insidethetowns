# Deploying

One Git repository, one Vercel project per domain. Every project builds the same
code; the `TOWN` environment variable decides which site it produces.

```
insidethetowns.com   TOWN=hub
insideniwot.com      TOWN=niwot
insidelyons.com      TOWN=lyons     (when it goes into LIVE_TOWNS)
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

## Redirecting the old site

`townofniwot.com` is a separate Vercel project on the
[townofniwot.com repository](https://github.com/jlerner1965/townofniwot.com). The
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
