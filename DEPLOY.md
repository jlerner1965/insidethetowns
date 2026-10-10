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
insidewindsorco.com  TOWN=windsor
insidefortcollins.com TOWN=fortcollins
insidelongmontco.com TOWN=longmont
insidelovelandco.com TOWN=loveland
carbonvalleyguide.com TOWN=carbon-valley   (project `carbonvalleyguide`; Frederick, Firestone and Dacono on one site)
insideseverance.com  TOWN=severance
insidefortlupton.com TOWN=fort-lupton
insidecastlerockco.com TOWN=castle-rock   (not live; holding page; insidecastlerock.com is someone else's)
insideestespark.com  TOWN=estes-park      (mountain variant)
insidegolden.com     TOWN=golden          (mountain variant)
insideevergreenco.com TOWN=evergreen      (mountain variant; insideevergreen.com is someone else's)
insidenederland.com  TOWN=nederland       (mountain variant)
insideidahosprings.com   TOWN=idaho-springs   (mountain variant; not live; no project yet)
insidegeorgetownco.com   TOWN=georgetown      (mountain variant; not live; no project yet)
insidegrandlake.com      TOWN=grand-lake      (mountain variant; not live; no project yet)
insidemanitousprings.com TOWN=manitou-springs (mountain variant; not live; no project yet)
insideleadville.com      TOWN=leadville       (mountain variant; not live; no project yet)
insideblackhawk.com      TOWN=black-hawk      (mountain variant; not live; no project yet)
…
```

The six towns scaffolded on 10 October 2026 build their holding pages until
they launch. The owner named all six domains the same day, each on the
owner's Cloudflare nameservers (the same pair as the other guides). A project for any of the six can only build once the branch that adds the
town is on `main`: until then `TOWN=<slug>` is unknown there and the build
stops. Each domain also needs Cloudflare Email Routing for its `hello@`
address (see "Email"), which the holding page names.

The seven projects after `carbonvalleyguide` were created on 6 October 2026
by the REST API with the same settings (framework, repository, `TOWN`, the
Ignored Build Step, Node 22.x, preview deployments off, one deploy hook on
`main`). Their apex and `www` domains (`www` a 308 to the apex) were
attached later the same day, once the owner said so; DNS at Cloudflare is
the owner's. Six went live on 7 October 2026; Castle Rock still builds its
holding page from `main`, until it clears its events threshold.

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
2. **Project name:** the domain without its `.com`, e.g. `insideniwot`, which is
   how the existing projects are named. The name only affects the `*.vercel.app`
   preview hostname. (The Vercel REST API does the same in one call, which is
   how `carbonvalleyguide` was made on 5 October 2026: `POST /v11/projects`
   with the framework, the repository, the `TOWN` variable, the Ignored Build
   Step and `previewDeploymentsDisabled`, then `PATCH` for Node 22.x, two
   `POST /domains` for the apex and `www`, and `POST /deploy-hooks` for the
   nightly hook. The MCP connector's token could not create projects; the
   environment's `VERCEL_API_TOKEN` could.)
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
8. When the domain serves and the validator says the town is ready (its verified
   counts clear the launch threshold), set `status: 'live'` in
   `src/config/towns/<slug>.ts` and push. The hub, the network bar and CI pick it
   up on their next build.

## What happens on every push

A failed Vercel build leaves the previous deployment serving, with last week's
events and whatever was stale then, so the build is written not to fail over
content: `npm run build` runs the validator in `--build` mode, which reports
every problem and exits 0, and an event or place that fails its schema is
excluded from the build with a line in the log rather than failing it. GitHub
Actions runs the same validator strictly and goes red; Vercel does not wait
for Actions, so red CI never holds a deploy. Fix what CI says; the site is
never stale because of it.

A town whose config is not `status: 'live'` builds one holding page, noindex,
with a robots.txt that disallows everything, so a project can be created and
its domain attached before the guide is ready. Flip the status and push.

- **GitHub Actions** (`.github/workflows/ci.yml`) validates every town's content,
  type-checks, and builds every live site. A push with broken content fails here.
- **Vercel** starts a deployment on every project for every push to `main`, and
  each project's **Ignored Build Step** (Settings → Build and Deployment) runs
  `bash scripts/vercel-ignore.sh <slug>` to decide whether that site actually
  builds. It builds when the push changes `content/<slug>/`,
  `src/config/towns/<slug>.ts`, shared code (the rest of `src/`, `public/`,
  `package.json`, `package-lock.json`, `astro.config.mjs`, `tsconfig.json`,
  `vercel.json`, `scripts/run.ts`) or the site's rows in `IMAGE_LICENSES.csv`,
  and skips otherwise: a Niwot event edit builds Niwot and nothing else. The
  hub's network events and each town's "nearby" block read other towns, so they
  catch up at the nightly rebuild. A skipped deployment shows as Canceled.
  Anything the script cannot work out builds, and a rebuild (the nightly deploy
  hook, the dashboard's Redeploy) always builds: see the script's header for how
  it tells a rebuild from a push.
- **Preview deployments** are off on every project except `insidelyons`
  (Settings → Git → "Preview deployments" disabled), so a branch push builds one
  Lyons preview, subject to the same Ignored Build Step. Branches are checked by
  CI, which builds every live site.

## The plan this runs on

**Vercel Pro, one seat.** Not a preference — Vercel's fair use guidelines
restrict Hobby to non-commercial personal use, and list "advertising the sale
of a product or service" as commercial. `/advertise/` is that. A commercial
network on a Hobby account risks being paused, which takes every site
down at once.

One seat covers every project: the hub and every guide, plus the
retired predecessors' projects. Pro is billed per user, not per project.

The build also writes `_headers` and `_redirects` into the output
(`src/integrations/host-files.ts`), generated from `vercel.json`. Vercel
ignores both files; Cloudflare Pages and Netlify read them. That is the exit,
kept working so it stays cheap — see DECISIONS.md for when it is worth taking.

## Web Analytics

Switch it on per project: **Project → Analytics → Enable**, once per project. The
`analytics` flag in `src/config/towns/hub.ts` only puts the script on the page
and lets `/privacy/` and `/advertise/` say so; it does not enable collection.

**Decline the Web Analytics Plus add-on.** It is $10/month per team and buys a
24-month reporting window instead of 12, UTM parameters, and eight properties
on custom events instead of two. A network that started counting in September
2026 cannot use a 24-month window for two years. Turn it on later if UTM
tracking ever earns it, and off again after.

Enabling costs nothing on top of the plan. The $20/month Pro platform fee
includes $20 of monthly usage credit, events bill against that credit at $0.03
per 1,000, and the credit expires unused at the end of each month. Analytics
would have to collect about 666,000 page views in one month across all ten
sites to spend it. Bandwidth does not compete for it either: Pro includes the
lowest Flat Rate CDN tier, 1 million requests and 1 TB of transfer, separately.

Set up **Spend Management** in the same Billing screen while you are there.
Vercel's default notification threshold is $200 per billing cycle, which this
network should never approach — set it to $5, so an alert means something is
wrong rather than something is busy.

## Redirecting the old sites

Two predecessors have been folded into the network. Both domains stay with
Vercel and keep redirecting: the redirects are what preserve the old site's
search rankings, and a paused or deleted domain hands over nothing.

### explorelyons.com → insidelyons.com

Retired 19 September 2026. Since 4 October 2026 `explorelyons.com` and
`www.explorelyons.com` are domains on the **insidelyons** project, each a 308
redirect to `insidelyons.com` that keeps the path: one hop, no project of its
own. insidelyons.com answers the nine old paths that changed name (`/explore/`,
`/eat-shop/`, `/stay/`, `/outdoors/`, `/itineraries/`, `/plan-a-visit/`,
`/our-story/`, `/civic/`, `/community/`) itself, from `vercel.json`, scoped to
the `insidelyons.com` host so no other town gets them. So `/civic/` goes to
insidelyons.com/civic/ and on to `/articles/who-governs-lyons/`; everything
else lands on the same path. All 16 of the old site's redirects were checked
on both hostnames when the domains moved.

The four old Vercel projects (`explorelyons-com`, `explorelyons`,
`explorelyons-site`, `explorelyons-preview`) were deleted the same day, once
the domains had moved and none held anything live. The `vercel.json` redirects
in the [explorelyons repository](https://github.com/jlerner1965/explorelyons)
are history: nothing deploys that repository now.

To check, follow the whole chain, not the first hop:

```
curl -sS -o /dev/null -L -w '%{http_code} %{url_effective}\n' https://explorelyons.com/civic/
```

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

## Email

Every town config publishes one address, `hello@<domain>`, and every domain
receives it through **Cloudflare Email Routing**, which forwards it to the owner's
inbox. There is no mailbox anywhere: Cloudflare accepts the message and passes it
on. Set up on 27 September 2026 for the first eight domains, on 4 October
for insidewindsorco.com, insidefortcollins.com, insidelongmontco.com and
insidelovelandco.com, and on 5 October for carbonvalleyguide.com.
On 7 October, with a token the owner supplied, the same setup went on the
seven domains added 6 October (insideseverance.com, insidefortlupton.com,
insidecastlerockco.com, insideestespark.com, insidegolden.com,
insideevergreenco.com, insidenederland.com), through the API: routing
enabled (`POST /zones/<id>/email/routing/dns`), one rule per domain
copied from insidelovelandco.com's, catch-all left off, and `_dmarc`.
All twenty guide domains now receive `hello@`.

On each domain (Cloudflare → the domain → Email → Email Routing):

- **Routing on.** Cloudflare adds three MX records (`route1`, `route2` and
  `route3.mx.cloudflare.net`) and a DKIM key at `cf2024-1._domainkey`, both locked
  while routing is on, and the SPF record `v=spf1 include:_spf.mx.cloudflare.net ~all`.
- **One rule:** `hello@<domain>` forwards to the owner's inbox. No catch-all; see
  DECISIONS.md.
- **DMARC**, a TXT record at `_dmarc` added by hand: `v=DMARC1; p=none`.

The inbox is a *destination address*, set once for the Cloudflare account and
verified by a link Cloudflare mails to it; every domain's rule shares it. Changing
inboxes means adding and verifying the new one, then pointing every rule at it.

To check a domain:

```
dig +short MX insideniwot.com           # the three route*.mx.cloudflare.net
dig +short TXT _dmarc.insideniwot.com   # "v=DMARC1; p=none"
```

then send a message to `hello@` **from an account other than the inbox it forwards
to**. Gmail recognises its own sent message coming back and does not show it in
the inbox again, which looks exactly like a failure.

**This only receives.** Sending *as* `hello@` needs an outgoing server that signs
mail for the domain, and Email Routing is not one. When one is added, it brings its
own DKIM record; if it also asks for an SPF entry on the domain itself, add its
`include:` to the existing record — two `v=spf1` records on one name make SPF fail
outright. Once everything sent as `hello@` is signed, raise DMARC to `p=quarantine`.

## Adding a town later

`npm run new-town <slug> "<Name>"`, fill in the config and content, push, then
repeat "Creating a project" above with the new slug. Under an hour. Then turn on
email for the new domain as under *Email* above: `new-town` writes `hello@` into the
config, and that address bounces until the domain has routing and its rule.

## Scheduled rebuilds

The sites are static, so "upcoming" is decided at build time. A daily rebuild
keeps that honest. Once, per Vercel project:

1. Settings → Git → Deploy Hooks → create a hook on the production branch.
2. Collect all ten URLs.
3. In the `insidethetowns` repo: Settings → Secrets and variables → Actions →
   new secret `VERCEL_DEPLOY_HOOKS`, one line per site in the form
   `<slug> <url>`: `hub https://api.vercel.com/v1/integrations/deploy/…`,
   `niwot https://…`, and so on. (A bare URL still fires, but the run can
   then only count hooks against live sites, not name the one that is missing.)

`.github/workflows/scheduled-rebuild.yml` then fires them once a day at
11:10 UTC (5:10 am Denver in summer, 4:10 am in winter), and can be run by
hand from the Actions tab. GitHub starts scheduled runs late, five to six
hours late through early October 2026, and sometimes not at all. Before it
fires, the run waits until `main`'s latest commit is over 30 minutes old,
because that age is how the Ignored Build Step tells a rebuild from a push. Adding a town later means adding its line to that secret;
nothing else. **The run fails until that line exists**: it reads the live
sites from the configs (`node scripts/live-towns.ts`) and reports any live
town without a hook as an error, because a live town that is never rebuilt
is a site whose past events never drop off.

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
