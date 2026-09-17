# Inside the Towns

One Astro codebase that builds a network of independent community guides for Colorado
Front Range towns, one deployment per domain, selected by the `TOWN` env var.

```
TOWN=niwot npm run dev        # or: npm run dev -- --town=niwot
TOWN=hub   npm run build      # insidethetowns.com
npm run validate              # check every town's content
npm run new-town lyons "Lyons"
scripts/screenshot.sh out/ / /events/   # phone/tablet/desktop captures of dist/
```

- `PLAN.md` — the build plan, phase by phase
- `DECISIONS.md` — choices made along the way
- `src/config/towns/` — one file per town; `index.ts` exports `getSite()` / `getTown()`
- `content/<town>/` — events, places, articles, pages, images (see the README in each)
- `IMAGE_LICENSES.csv` — every image, its source and licence

Requires Node 22.18+ (scripts use Node's built-in TypeScript support).
