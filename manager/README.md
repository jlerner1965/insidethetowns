# Inside the Towns — manager agent

One agent on the Claude Platform (Managed Agents) that knows the whole network, keeps its own memory, and does three jobs through skills that live in this repo:

- **site-audit** — content, design, accuracy, links, coverage; one prioritized report per town. Runs weekly on its own and whenever you ask.
- **content** — drafts or revises a page or a "This Week" update in the site's existing voice. Drafts only.
- **relationships** — contact files for chambers, sponsors and businesses, a log, follow-ups, and outreach drafts. Nothing is sent.

It proposes; you act. It never edits `content/`, never pushes, never sends email.

## Layout

```
.claude/skills/            the three skills (picked up automatically when the agent mounts the repo)
manager/
  towns.json               source of truth: towns, domains, live or not  ← keep this current
  system-prompt.md         who the agent is and how it works for you
  setup.mjs                creates memory store + environment + agent, writes config.json
  schedule.mjs             creates the Monday-morning audit run
  web/server.mjs           the hub: one page, talks to the agent
  web/index.html
  config.json              written by setup.mjs (IDs; safe to commit, holds no secrets)
  sessions.json            written by the hub (fallback list of sessions)
```

## Setup (one time, ~5 minutes)

1. **Check `towns.json`.** Windsor and the not-yet-live towns have domains filled in from the naming pattern — fix any that are wrong and flip `live` as sites go up.

2. **Tokens.**
   - `ANTHROPIC_API_KEY` from the Console.
   - `GITHUB_TOKEN`: a **fine-grained personal access token, read-only, scoped to only `jlerner1965/insidethetowns`**. The agent has open network access (it has to, to check facts and external links), so don't give it a token that can write or that reaches other repos.

3. **Install and run setup.**
   ```bash
   cd manager
   npm install
   export ANTHROPIC_API_KEY=...
   node setup.mjs
   ```
   This creates the memory store, the sandbox environment and the agent, and writes their IDs to `config.json`. Re-run it any time you edit `system-prompt.md`; it updates the agent in place.

4. **Start the hub.**
   ```bash
   export GITHUB_TOKEN=...
   node web/server.mjs
   ```
   Open http://127.0.0.1:8787. Click **New session**, then try one of the quick buttons or just type. Each session mounts the repo and attaches the memory store, so it can read the sites and remember what it found.

5. **Schedule the weekly audit** (optional, recommended):
   ```bash
   node schedule.mjs --run
   ```
   Creates a Monday 6:07am (Denver) run of the site-audit skill over every live town, capped at $10 per run, and triggers one run now so you can watch it in the hub. Reports land in the memory store under `audits/`.

## Using it

Talk to it like you'd talk to someone who runs the network with you:

- "Audit Erie." / "Just check the links on Timnath." / "Audit all."
- "Draft this week's Lyons notes." / "Rewrite the Berthoud parks page, it's thin."
- "Log: talked to Marily today, she wants to send over their events calendar." / "Where are we with Lyons?" / "Who's gone quiet?"
- "Draft a follow-up to the Lyons Chamber with two concrete options."

Audit reports end with **Proposed changes** — file paths plus diffs. Apply those with Claude Code or by hand; the manager won't touch `content/`.

Sessions persist. Come back to one and it picks up where it left off (the sandbox is kept ~30 days; the memory store is kept indefinitely).

## Cost and safety notes

- **Model:** defaults to `claude-sonnet-5-5`. Set `MANAGER_MODEL=claude-opus-5-5` before `setup.mjs` if audits need to be sharper; it costs more per run.
- **Networking:** the environment is `unrestricted` by default so accuracy checks and link checks can reach any site. The trade-off is that web content the agent reads could try to steer it, and anything in the sandbox (the GitHub token) could in principle leave. That's why the token must be read-only and single-repo. If you'd rather lock it down, run setup with `MANAGER_NETWORKING=limited`: the sandbox then reaches only the town domains in `towns.json` plus package registries, and the audit will report external links and off-site facts as "couldn't verify".
- **Budget:** the weekly run is capped per run (`AUDIT_BUDGET_CENTS`, default 1000 = $10). On-demand sessions from the hub have no cap; watch the Console if you leave one running.
- **The hub** binds to localhost. If you put it on a server, set `HUB_PASSWORD` and `HOST=0.0.0.0`; the API key and GitHub token stay on the server, never in the browser.

## Where things are in the Console

Sessions, the memory store (you can read and edit memories directly), the environment and the deployment all appear at https://platform.claude.com under your workspace.

## Known rough edges

- This folder was written against the Managed Agents docs but couldn't be run end-to-end where it was written (no npm access there). The calls match the documented SDK; if `setup.mjs` or `schedule.mjs` complains about a parameter name, the docs pages are: managed-agents/quickstart, /memory, /environments, /scheduled-deployments, /events-and-streaming.
- Design checks are HTML-level (titles, metas, headings, alt text, palette tokens, consistency across towns). The agent can't see a rendered page, and says so when a finding would need eyes.
- Pull requests aren't wired up. When you want the agent to open PRs for audit fixes instead of handing you diffs, add the GitHub MCP server to the agent per managed-agents/github — that's a small, separate change.
