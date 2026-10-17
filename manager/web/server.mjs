#!/usr/bin/env node
// The hub: one page that talks to the manager agent.
//
//   ANTHROPIC_API_KEY=... GITHUB_TOKEN=... node web/server.mjs
//   → http://127.0.0.1:8787
//
// Optional:
//   PORT=8787
//   HOST=127.0.0.1          set 0.0.0.0 to reach it from another device on your network
//   HUB_PASSWORD=...        if set, the page asks for it (basic auth). Set this before exposing it anywhere.
//
// The browser never sees the API key or the GitHub token; this server holds
// them and proxies to the Managed Agents API.

import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { client as makeClient, readConfig, sessionResources, HERE } from "../lib.mjs";

const client = makeClient();
const cfg = readConfig();
if (!cfg.agent_id || !cfg.environment_id || !cfg.memory_store_id) {
  throw new Error("Run setup.mjs first; config.json is missing IDs.");
}

const PORT = Number(process.env.PORT ?? 8787);
const HOST = process.env.HOST ?? "127.0.0.1";
const PASSWORD = process.env.HUB_PASSWORD ?? "";
const INDEX = path.join(HERE, "web", "index.html");
const LOCAL_SESSIONS = path.join(HERE, "sessions.json");

// ---- small helpers -------------------------------------------------------

function readLocalSessions() {
  if (!fs.existsSync(LOCAL_SESSIONS)) return [];
  try {
    return JSON.parse(fs.readFileSync(LOCAL_SESSIONS, "utf8"));
  } catch {
    return [];
  }
}
function rememberSession(s) {
  const all = readLocalSessions().filter((x) => x.id !== s.id);
  all.unshift({ id: s.id, title: s.title ?? "", created_at: s.created_at ?? new Date().toISOString() });
  fs.writeFileSync(LOCAL_SESSIONS, JSON.stringify(all.slice(0, 200), null, 2));
}

function json(res, status, body) {
  res.writeHead(status, { "content-type": "application/json" });
  res.end(JSON.stringify(body));
}
function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (c) => (data += c));
    req.on("end", () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch (e) {
        reject(e);
      }
    });
    req.on("error", reject);
  });
}
function authorized(req, res) {
  if (!PASSWORD) return true;
  const h = req.headers.authorization ?? "";
  const ok = h.startsWith("Basic ") && Buffer.from(h.slice(6), "base64").toString() === `hub:${PASSWORD}`;
  if (!ok) {
    res.writeHead(401, { "www-authenticate": 'Basic realm="Inside the Towns manager"' });
    res.end("Password required");
  }
  return ok;
}

// Strip fields the browser doesn't need and that can be large.
function slimEvent(e) {
  const out = { id: e.id, type: e.type, processed_at: e.processed_at ?? null };
  switch (e.type) {
    case "agent.message":
    case "user.message":
      out.content = e.content;
      break;
    case "agent.tool_use":
    case "agent.mcp_tool_use":
    case "agent.custom_tool_use":
      out.name = e.name;
      out.input = e.input;
      out.evaluated_permission = e.evaluated_permission;
      break;
    case "agent.tool_result":
      out.tool_use_id = e.tool_use_id;
      out.is_error = e.is_error ?? false;
      out.content = summarizeToolResult(e.content);
      break;
    case "session.status_idle":
      out.stop_reason = e.stop_reason;
      break;
    case "session.error":
      out.error = e.error;
      break;
    default:
      break;
  }
  return out;
}
function summarizeToolResult(content) {
  if (!Array.isArray(content)) return content;
  return content.map((b) => {
    if (b.type === "text" && typeof b.text === "string" && b.text.length > 4000) {
      return { type: "text", text: b.text.slice(0, 4000) + `\n… (${b.text.length - 4000} more chars)` };
    }
    return b;
  });
}

// ---- API -----------------------------------------------------------------

async function listSessions() {
  // Prefer the API so sessions started by the weekly schedule show up too;
  // fall back to the local file if the list call isn't available.
  try {
    const out = [];
    for await (const s of client.beta.sessions.list()) {
      const agentId = typeof s.agent === "string" ? s.agent : s.agent?.id;
      if (agentId && agentId !== cfg.agent_id) continue;
      out.push({ id: s.id, title: s.title ?? "", status: s.status ?? "", created_at: s.created_at });
      if (out.length >= 50) break;
    }
    return out;
  } catch {
    return readLocalSessions();
  }
}

async function createSession(title) {
  const session = await client.beta.sessions.create({
    agent: cfg.agent_id,
    environment_id: cfg.environment_id,
    title: title || `Manager — ${new Date().toLocaleDateString("en-US")}`,
    resources: sessionResources(cfg),
  });
  rememberSession(session);
  return { id: session.id, title: session.title ?? title, status: session.status ?? "", created_at: session.created_at };
}

async function listEvents(sessionId) {
  const out = [];
  for await (const e of client.beta.sessions.events.list(sessionId)) out.push(slimEvent(e));
  return out;
}

async function streamEvents(sessionId, req, res) {
  res.writeHead(200, {
    "content-type": "text/event-stream",
    "cache-control": "no-cache",
    connection: "keep-alive",
  });
  res.write(": connected\n\n");
  const keepalive = setInterval(() => res.write(": ping\n\n"), 15000);
  let closed = false;
  req.on("close", () => {
    closed = true;
    clearInterval(keepalive);
  });
  try {
    const stream = await client.beta.sessions.events.stream(sessionId);
    for await (const e of stream) {
      if (closed) break;
      if (e.type === "event_start" || e.type === "event_delta") continue; // previews, no id
      res.write(`data: ${JSON.stringify(slimEvent(e))}\n\n`);
    }
  } catch (err) {
    if (!closed) res.write(`data: ${JSON.stringify({ type: "hub.error", message: String(err?.message ?? err) })}\n\n`);
  } finally {
    clearInterval(keepalive);
    if (!closed) res.end();
  }
}

async function send(sessionId, events) {
  await client.beta.sessions.events.send(sessionId, { events });
}

// ---- server --------------------------------------------------------------

const server = http.createServer(async (req, res) => {
  try {
    if (!authorized(req, res)) return;
    const url = new URL(req.url, `http://${req.headers.host}`);
    const parts = url.pathname.split("/").filter(Boolean);

    if (req.method === "GET" && parts.length === 0) {
      res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
      return res.end(fs.readFileSync(INDEX));
    }
    if (parts[0] !== "api") return json(res, 404, { error: "not found" });

    if (parts[1] === "config" && req.method === "GET") {
      return json(res, 200, { agent_id: cfg.agent_id, networking: cfg.networking ?? "unrestricted" });
    }
    if (parts[1] === "sessions" && parts.length === 2) {
      if (req.method === "GET") return json(res, 200, await listSessions());
      if (req.method === "POST") {
        const { title } = await readBody(req);
        return json(res, 200, await createSession(title));
      }
    }
    if (parts[1] === "sessions" && parts.length === 4) {
      const id = parts[2];
      const action = parts[3];
      if (action === "events" && req.method === "GET") return json(res, 200, await listEvents(id));
      if (action === "stream" && req.method === "GET") return streamEvents(id, req, res);
      if (action === "message" && req.method === "POST") {
        const { text } = await readBody(req);
        if (!text?.trim()) return json(res, 400, { error: "empty message" });
        await send(id, [{ type: "user.message", content: [{ type: "text", text }] }]);
        return json(res, 200, { ok: true });
      }
      if (action === "interrupt" && req.method === "POST") {
        await send(id, [{ type: "user.interrupt" }]);
        return json(res, 200, { ok: true });
      }
      if (action === "confirm" && req.method === "POST") {
        const { tool_use_id, result } = await readBody(req);
        if (!tool_use_id || !["allow", "deny"].includes(result)) return json(res, 400, { error: "bad confirm" });
        await send(id, [{ type: "user.tool_confirmation", tool_use_id, result }]);
        return json(res, 200, { ok: true });
      }
    }
    return json(res, 404, { error: "not found" });
  } catch (err) {
    console.error(err);
    const status = err?.status ?? 500;
    return json(res, status, { error: String(err?.message ?? err) });
  }
});

server.listen(PORT, HOST, () => {
  console.log(`Inside the Towns manager hub → http://${HOST}:${PORT}${PASSWORD ? "  (password set)" : ""}`);
  if (HOST !== "127.0.0.1" && !PASSWORD) console.log("Warning: reachable from the network with no HUB_PASSWORD set.");
});
