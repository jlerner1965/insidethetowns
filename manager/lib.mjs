// Shared helpers for the Inside the Towns manager agent.
// Plain Node (>=20), ESM. One dependency: @anthropic-ai/sdk.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Anthropic from "@anthropic-ai/sdk";

export const HERE = path.dirname(fileURLToPath(import.meta.url));
export const CONFIG_PATH = path.join(HERE, "config.json");
export const TOWNS_PATH = path.join(HERE, "towns.json");
export const SYSTEM_PROMPT_PATH = path.join(HERE, "system-prompt.md");

// Beta headers. Memory-store endpoints need their own header and reject the
// managed-agents one (see docs/managed-agents/memory). Everything else uses
// managed-agents. The SDK sets managed-agents automatically; we pass the
// memory header explicitly only on memory-store calls.
export const BETA_MANAGED_AGENTS = "managed-agents-2026-04-01";
export const BETA_MEMORY = "agent-memory-2026-07-22";

export function env(name, fallback) {
  const v = process.env[name];
  if (v === undefined || v === "") {
    if (fallback !== undefined) return fallback;
    throw new Error(`Missing environment variable ${name}. See manager/README.md.`);
  }
  return v;
}

export function client() {
  // Reads ANTHROPIC_API_KEY from the environment.
  return new Anthropic();
}

export function readTowns() {
  return JSON.parse(fs.readFileSync(TOWNS_PATH, "utf8"));
}

export function readConfig() {
  if (!fs.existsSync(CONFIG_PATH)) return {};
  return JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8"));
}

export function writeConfig(cfg) {
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(cfg, null, 2) + "\n");
}

export function readSystemPrompt() {
  return fs.readFileSync(SYSTEM_PROMPT_PATH, "utf8");
}

/**
 * Hosts the sandbox may reach when networking is "limited": every town's
 * domain plus www., the alternates, and the network domain. Unused when
 * MANAGER_NETWORKING=unrestricted (the default — accuracy and link checks
 * need to reach arbitrary sites).
 */
export function allowedHostsFromTowns(towns) {
  const hosts = new Set();
  const add = (d) => {
    if (!d) return;
    hosts.add(d);
    hosts.add(`www.${d}`);
  };
  add(towns.network?.domain);
  for (const t of towns.towns) {
    add(t.domain);
    for (const alt of t.alternate_domains ?? []) add(alt);
  }
  return [...hosts].sort();
}

/**
 * The resources every session (and the scheduled run) gets: the repo,
 * mounted read-only in spirit (the agent is told never to push), and the
 * memory store. Both are attached at session creation; they can't be added
 * to a running session.
 */
export function sessionResources(cfg) {
  const towns = readTowns();
  const repoUrl = towns.network?.repo;
  if (!repoUrl) throw new Error("towns.json is missing network.repo");
  return [
    {
      type: "github_repository",
      url: repoUrl,
      mount_path: "/workspace/insidethetowns",
      authorization_token: env("GITHUB_TOKEN"),
    },
    {
      type: "memory_store",
      memory_store_id: cfg.memory_store_id,
      access: "read_write",
      instructions:
        "Inside the Towns working memory: audits/<town>/ (site audit reports), drafts/<town>/ (content drafts), relationships/ (contact files, log, follow-ups). Read the relevant folder before starting; write results back so the next session has them.",
    },
  ];
}

/** Short text of an agent.message event (joins text blocks). */
export function messageText(event) {
  return (event.content ?? [])
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("");
}
