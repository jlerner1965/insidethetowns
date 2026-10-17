#!/usr/bin/env node
// Creates (or reports) the weekly scheduled audit: every Monday morning the
// agent runs the site-audit skill across all live towns and writes the
// reports into the memory store. Run once after setup.mjs.
//
//   ANTHROPIC_API_KEY=... GITHUB_TOKEN=... node schedule.mjs
//
// Optional:
//   AUDIT_CRON="7 6 * * 1"            default: Mondays 6:07am
//   AUDIT_TZ=America/Denver
//   AUDIT_BUDGET_CENTS=1000           per-run cap in US cents (default $10); "0" for no cap
//   --run                             also trigger one run now, to test it

import { client as makeClient, readConfig, writeConfig, sessionResources, env } from "./lib.mjs";

const client = makeClient();
const cfg = readConfig();
if (!cfg.agent_id || !cfg.environment_id || !cfg.memory_store_id) {
  throw new Error("Run setup.mjs first; config.json is missing IDs.");
}

const cron = env("AUDIT_CRON", "7 6 * * 1");
const timezone = env("AUDIT_TZ", "America/Denver");
const budgetCents = env("AUDIT_BUDGET_CENTS", "1000");

const prompt = [
  "Scheduled weekly run. Use the site-audit skill.",
  "Audit every town marked live in manager/towns.json. Write one report per town to audits/<town-slug>/<today>.md in the memory store,",
  "then audits/_network/<today>.md with one line per town and the three most common issues across the network.",
  "Finish with a short plain-text summary James can read on his phone: which towns need attention first, and why.",
  "Nobody is watching this run: take the most reasonable reading of anything ambiguous and note it in the report; do not wait for answers.",
].join(" ");

if (!cfg.weekly_audit_deployment_id) {
  const deployment = await client.beta.deployments.create({
    name: "Inside the Towns — weekly site audit",
    agent: cfg.agent_id,
    environment_id: cfg.environment_id,
    resources: sessionResources(cfg),
    initial_events: [{ type: "user.message", content: [{ type: "text", text: prompt }] }],
    schedule: { type: "cron", expression: cron, timezone },
    ...(budgetCents !== "0"
      ? { budget: { type: "limit", max_list_cost: { amount: budgetCents, currency: "USD" } } }
      : {}),
  });
  cfg.weekly_audit_deployment_id = deployment.id;
  writeConfig(cfg);
  console.log(`deployment    ${deployment.id}`);
  console.log(`schedule      ${cron} ${timezone}`);
  console.log(`next runs     ${(deployment.schedule?.upcoming_runs_at ?? []).slice(0, 3).join(", ")}`);
} else {
  const d = await client.beta.deployments.retrieve(cfg.weekly_audit_deployment_id);
  console.log(`deployment    ${d.id} (existing, ${d.status})`);
  console.log(`schedule      ${d.schedule?.expression} ${d.schedule?.timezone}`);
  console.log(`next runs     ${(d.schedule?.upcoming_runs_at ?? []).slice(0, 3).join(", ")}`);
}

if (process.argv.includes("--run")) {
  const run = await client.beta.deployments.run(cfg.weekly_audit_deployment_id);
  console.log(`manual run    ${run.id} → session ${run.session_id ?? "(pending)"}`);
  console.log("Open the web hub and pick the session to watch it.");
}
