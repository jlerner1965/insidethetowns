#!/usr/bin/env node
// One-time setup: creates the memory store, the environment and the agent,
// and records their IDs in manager/config.json. Safe to re-run: anything
// already in config.json is kept; the agent is updated in place so edits to
// system-prompt.md take effect.
//
//   ANTHROPIC_API_KEY=... node setup.mjs
//
// Optional:
//   MANAGER_MODEL=claude-sonnet-5-5      (default; use claude-opus-5-5 for harder audits)
//   MANAGER_NETWORKING=unrestricted      (default) | limited  — see README

import {
  client as makeClient,
  readConfig,
  writeConfig,
  readTowns,
  readSystemPrompt,
  allowedHostsFromTowns,
  env,
} from "./lib.mjs";

const client = makeClient();
const cfg = readConfig();
const towns = readTowns();
const model = env("MANAGER_MODEL", "claude-sonnet-5-5");
const networking = env("MANAGER_NETWORKING", "unrestricted");

// 1. Memory store — the agent's long-term memory (audits, drafts, contacts).
if (!cfg.memory_store_id) {
  const store = await client.beta.memoryStores.create({
    name: "Inside the Towns",
    description:
      "Working memory for the Inside the Towns manager: site audit reports under audits/, content drafts under drafts/, and the contact files, log and follow-ups under relationships/.",
  });
  cfg.memory_store_id = store.id;
  writeConfig(cfg);
  console.log(`memory store  ${store.id}`);

  // Seed a short map so the first session knows the layout.
  await client.beta.memoryStores.memories.create(store.id, {
    path: "/README.md",
    content: [
      "# Inside the Towns — memory layout",
      "",
      "- audits/<town-slug>/<YYYY-MM-DD>.md — one site-audit report per run; audits/_network/<date>.md for the all-towns summary",
      "- drafts/<town-slug>/<date>-<slug>.md — content drafts (never published from here)",
      "- relationships/contacts/<slug>.md — one file per chamber, sponsor, business or person",
      "- relationships/log.md — dated one-liners, newest first",
      "- relationships/followups.md — what's owed, by whom, by when",
      "- relationships/drafts/<slug>-<date>.md — outreach drafts (never sent from here)",
      "",
      "Many small files. Read the folder you need before writing.",
    ].join("\n"),
  });
} else {
  console.log(`memory store  ${cfg.memory_store_id} (existing)`);
}

// 2. Environment — the sandbox the agent runs in.
if (!cfg.environment_id) {
  const networkingConfig =
    networking === "limited"
      ? {
          type: "limited",
          allowed_hosts: allowedHostsFromTowns(towns),
          allow_package_managers: true,
        }
      : { type: "unrestricted" };

  const environment = await client.beta.environments.create({
    name: "inside-the-towns-manager",
    config: {
      type: "cloud",
      networking: networkingConfig,
    },
  });
  cfg.environment_id = environment.id;
  cfg.networking = networking;
  writeConfig(cfg);
  console.log(`environment   ${environment.id} (${networking})`);
} else {
  console.log(`environment   ${cfg.environment_id} (existing, ${cfg.networking ?? "?"})`);
}

// 3. Agent — model, system prompt, tools. Skills are NOT attached here: they
// live in the repo at .claude/skills/ and are discovered when the session
// mounts the repo.
const agentDef = {
  name: "Inside the Towns manager",
  model,
  system: readSystemPrompt(),
  tools: [{ type: "agent_toolset_20260401" }],
};

if (!cfg.agent_id) {
  const agent = await client.beta.agents.create(agentDef);
  cfg.agent_id = agent.id;
  cfg.agent_version = agent.version;
  writeConfig(cfg);
  console.log(`agent         ${agent.id} v${agent.version} (${model})`);
} else {
  const agent = await client.beta.agents.update(cfg.agent_id, agentDef);
  cfg.agent_version = agent.version;
  writeConfig(cfg);
  console.log(`agent         ${agent.id} v${agent.version} (updated, ${model})`);
}

console.log("\nDone. Next: GITHUB_TOKEN=... node web/server.mjs   (or node schedule.mjs for the weekly audit)");
