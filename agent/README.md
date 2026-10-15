# agent/

Research on the Claude API. Reads the repo (town config, `content/<town>/sources.json`, existing listings), searches and fetches the web, and writes a draft to `docs/agent/<town>/`. It never touches `content/`.

```
cd agent && npm install && cp .env.example .env   # then paste your key into .env
cd ..
npm run agent -- weekly lyons                       # content/lyons/weekly/<next Monday>.md, drafted
npm run agent -- weekly all
npm run agent -- verify lyons places/a-lodge-lyons.md
npm run agent -- verify lyons --stale=60            # places not verified in 60 days, 8 per run
npm run agent -- write lyons "Where to park for Folks Fest"
```

Then: read the draft, paste what holds up into `content/<town>/…`, `npm run validate`, commit.

The editorial rules are in `.claude/skills/inside-the-towns-editor/SKILL.md` — one file, used by both this agent and Claude Code. Every draft ends with the URLs read and anything it could not confirm.

Cost: roughly $0.15–0.40 per town per weekly run on Sonnet (web search is $10 per 1,000 queries plus tokens). `.github/workflows/agent-weekly.yml` runs `weekly all` each Wednesday morning (12:20 UTC) and commits the drafts to `docs/agent/` on `main`; it needs `ANTHROPIC_API_KEY` under Settings → Secrets → Actions.
