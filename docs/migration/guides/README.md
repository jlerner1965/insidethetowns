# The seven guides' addresses

*The move of the seven standalone guides into insidethetowns.com (the owner's
brief of 18 November 2026; the switches in `src/config/guide-move.ts`).*

One CSV per domain, `<host>.csv`: every address the guide has ever published,
rebuilt from build history by `node scripts/migration/guide-inventory.ts`:

| Column | What it holds |
|---|---|
| `old_path` | The address on the guide's domain, as served |
| `source` | Where it was found: `git in the content today`, `git deleted`, `git formerSlugs of <slug>`, `retired.json`, `sitemap <first> to <last>` (a production deployment's sitemap listed it between those dates), `vercel.json` (a rule once named it), `vercel.json (a rule today)`, `qr-card` |
| `kind` | `events`, `places`, `articles`, or `page` |
| `key` | For an event, its series key (title and venue, `src/lib/series.ts`), so a past date can follow its series to the current page |
| `decision` | Empty: the rules decide (the section's own page, a former slug's target, the series' current page). A path on the guide (`/things-to-do/`): wherever that lands. `gone`: 410, a documented retirement. An address on the hub: as written |
| `note` | Why, in plain words |

`history/<host>-sitemaps.csv` is the record of every production deployment's
sitemap sampled on 18 November 2026 (`path, first_seen, last_seen, samples`),
and `history/deployments.csv` lists every deployment that was there to
sample. Vercel keeps about a month of deployments, so these start on 18
October 2026; git history (every listing file ever) covers the time before.

The redirect map a guide's domain answers from is made at build from its
current content (`scripts/migration/guide-map.ts`): every page the section
builds, then the former slugs, then these CSVs for what the guide no longer
builds. `--decide` writes the default decision for what the rules leave (a
past event with no later date of its series, a listing taken off the guide,
a quiet guide's event addresses) and prints what is left for a person.
`node scripts/migration/check-local.ts` fails on any address with no answer.
