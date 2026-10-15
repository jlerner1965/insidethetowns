#!/usr/bin/env node
/**
 * The editorial agent: research on the Claude API, drafts into docs/agent/<town>/.
 * It never writes to content/. You review, paste, `npm run validate`, commit.
 *
 *   npm run agent -- weekly lyons                     # weekly notes draft for next Monday
 *   npm run agent -- weekly all                       # every live town
 *   npm run agent -- verify lyons places/a-lodge-lyons.md   # one file, relative to content/lyons/
 *   npm run agent -- verify lyons --stale=60          # places not verified in 60 days (max 8 per run)
 *   npm run agent -- write lyons "Where to park for Folks Fest"
 *
 * Env: ANTHROPIC_API_KEY (required; agent/.env is read when present),
 *      ITT_MODEL (default claude-sonnet-5-5), ITT_MAX_SEARCHES (default 12).
 * The rules it follows live in .claude/skills/inside-the-towns-editor/SKILL.md.
 */

import Anthropic from '@anthropic-ai/sdk';
import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { findTown, liveTowns } from '../src/config/index.ts';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const skillPath = path.join(root, '.claude/skills/inside-the-towns-editor/SKILL.md');

loadDotenv(path.join(here, '.env'));
const MODEL = process.env.ITT_MODEL ?? 'claude-sonnet-5-5';
const MAX_SEARCHES = Number(process.env.ITT_MAX_SEARCHES ?? 12);
const MAX_TURNS = 24;
const STALE_BATCH = 8;

if (!process.env.ANTHROPIC_API_KEY) die('ANTHROPIC_API_KEY is not set (put it in agent/.env).');
const client = new Anthropic();
const skill = await readFile(skillPath, 'utf8');

// ---------- arguments ----------

const [mode, townArg, ...rest] = process.argv.slice(2);
if (!mode || !townArg) printUsage();
const towns = townArg === 'all' ? liveTowns() : [findTown(townArg) ?? die(`Unknown town "${townArg}".`)];

const denver = (opts) => new Date().toLocaleDateString('en-US', { timeZone: 'America/Denver', ...opts });
const today = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Denver' }); // YYYY-MM-DD
const todayLong = denver({ weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

// ---------- run ----------

for (const town of towns) {
  const tasks = await buildTasks(mode, town, rest);
  for (const { label, prompt, outFile } of tasks) {
    console.log(`\n▶ ${mode} · ${town.name} · ${label} · ${MODEL}`);
    const { text, searches, usage } = await runAgent(prompt, town);
    await mkdir(path.dirname(outFile), { recursive: true });
    await writeFile(outFile, text + '\n', 'utf8');
    console.log(`✓ ${path.relative(root, outFile)}  (${searches} lookups, ${usage.input} in / ${usage.output} out tokens)`);
  }
}

// ---------- tasks ----------

async function buildTasks(mode, town, args) {
  const contentDir = path.join(root, 'content', town.slug);
  const outDir = path.join(root, 'docs', 'agent', town.slug);
  const where = `${town.name}, Colorado (${town.counties.join(' / ')} County)`;
  const sources = await trustedSources(contentDir);

  switch (mode) {
    case 'weekly': {
      const weekOf = nextMonday();
      const events = await upcomingEvents(contentDir, 21);
      return [{
        label: `week of ${weekOf}`,
        outFile: path.join(outDir, `weekly-${weekOf}.md`),
        prompt: `Draft the weekly notes file for ${town.name} for the week of Monday ${weekOf} (today is ${todayLong}). Guide domain: ${town.domain}.

Research: search for ${where} news from the past 10 days and events in the next 14 days. Start with these sources the guide already trusts, then widen to local news and business pages:
${sources || '(no source registry yet — find the town site, chamber, library and local paper yourself)'}

Pick: choose from the listings already on the guide (only these qualify for the pick url):
${events || '(no upcoming listings on the guide — leave the pick blank)'}

Produce the "Weekly notes" file format from your instructions, front matter first, then the Editor's notes section. checked: ${today}. expires: 14 days after weekOf unless the item is dated sooner.`,
      }];
    }

    case 'verify': {
      const stale = args.find((a) => a.startsWith('--stale'));
      let files;
      if (stale) {
        const days = Number(stale.split('=')[1] ?? 60);
        files = await staleFiles(contentDir, days);
        if (!files.length) { console.log(`  nothing in ${town.name} older than ${days} days`); return []; }
      } else {
        if (!args[0]) die('verify needs a file (relative to content/<town>/) or --stale=60');
        files = [args[0]];
      }
      const tasks = [];
      for (const rel of files) {
        const page = await readFile(path.join(contentDir, rel), 'utf8');
        const base = path.basename(rel, '.md');
        tasks.push({
          label: rel,
          outFile: path.join(outDir, `verify-${base}-${today}.md`),
          prompt: `Verify every checkable claim in this ${where} content file against primary sources. Today is ${todayLong}. Start from the file's own source URL, then the business's own site and the sources the guide trusts:
${sources}

Use the "Verification report" format from your instructions. The file is content/${town.slug}/${rel}; the public path is /${rel.replace(/\.md$/, '')}/.

<file path="content/${town.slug}/${rel}">
${page}
</file>`,
        });
      }
      return tasks;
    }

    case 'write': {
      const topic = args.join(' ').trim();
      if (!topic) die('write needs a topic in quotes.');
      const slug = topic.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60);
      const places = await listFrontmatter(path.join(contentDir, 'places'), ['title']);
      const categories = [...new Set((await listFrontmatter(path.join(contentDir, 'articles'), ['category'])).map((a) => a.category).filter(Boolean))];
      return [{
        label: slug,
        outFile: path.join(outDir, `article-${slug}.md`),
        prompt: `Write an article for Inside ${town.name} (${town.domain}) on: "${topic}". Setting: ${where}. Today is ${todayLong}.

Research it with search and fetch first. The guide's trusted sources:
${sources}

Existing article categories on this guide: ${categories.join(', ') || '(none yet)'}.
Pages on this guide you may link under "related" (slug — title):
${places.map((p) => `/places/${p.slug}/ — ${p.title}`).join('\n') || '(none)'}

Use the "Article" format from your instructions, slug "${slug}".`,
      }];
    }

    default:
      printUsage();
  }
}

// ---------- the loop: server-side web search + fetch, no client tools ----------

async function runAgent(userPrompt, town) {
  const tools = [
    {
      type: 'web_search_20260318',
      name: 'web_search',
      max_uses: MAX_SEARCHES,
      allowed_callers: ['direct'],
      user_location: { type: 'approximate', country: 'US', region: 'Colorado', timezone: 'America/Denver' },
    },
    { type: 'web_fetch_20260318', name: 'web_fetch', max_uses: MAX_SEARCHES, citations: { enabled: false }, max_content_tokens: 40000 },
  ];
  const system = [
    { type: 'text', text: skill, cache_control: { type: 'ephemeral' } },
    { type: 'text', text: `Current guide: Inside ${town.name} (${town.domain}). Output only the finished document — no preamble, no closing remarks.` },
  ];
  const messages = [{ role: 'user', content: userPrompt }];
  let searches = 0;
  const usage = { input: 0, output: 0 };

  for (let turn = 0; turn < MAX_TURNS; turn++) {
    const res = await client.messages.create({ model: MODEL, max_tokens: 8000, system, tools, messages });
    usage.input += res.usage.input_tokens;
    usage.output += res.usage.output_tokens;
    for (const b of res.content) {
      if (b.type === 'server_tool_use') {
        searches++;
        console.log(`   · ${b.name === 'web_search' ? 'search: ' + b.input.query : 'fetch: ' + b.input.url}`);
      }
    }
    messages.push({ role: 'assistant', content: res.content }); // keep encrypted search content intact
    if (res.stop_reason === 'pause_turn') continue;
    if (res.stop_reason === 'tool_use') die('Model asked for a client tool; none are defined.');
    if (res.stop_reason === 'max_tokens') console.warn('   ! hit max_tokens; draft may be truncated');
    const text = res.content.filter((b) => b.type === 'text').map((b) => b.text).join('\n').trim();
    return { text: stripFence(text), searches, usage };
  }
  die(`Gave up after ${MAX_TURNS} turns.`);
}

// ---------- repo readers (front matter is read with a small line parser; enough for these fields) ----------

async function trustedSources(contentDir) {
  const file = path.join(contentDir, 'sources.json');
  if (!existsSync(file)) return '';
  const { sources = [] } = JSON.parse(await readFile(file, 'utf8'));
  return sources
    .filter((s) => s.status !== 'retired')
    .sort((a, b) => (a.priority === 'core' ? -1 : 1) - (b.priority === 'core' ? -1 : 1))
    .map((s) => `- ${s.name} (${s.category}${s.status === 'confirmed' ? ', confirmed' : ''}): ${s.sampleUrl ?? s.url}`)
    .join('\n');
}

async function upcomingEvents(contentDir, days) {
  const rows = await listFrontmatter(path.join(contentDir, 'events'), ['title', 'start', 'status']);
  const from = new Date(today + 'T00:00');
  const to = new Date(from.getTime() + days * 86400000);
  return rows
    .filter((e) => e.start && (e.status ?? 'scheduled') === 'scheduled')
    .filter((e) => { const d = new Date(e.start); return d >= from && d <= to; })
    .sort((a, b) => a.start.localeCompare(b.start))
    .map((e) => `- ${e.start} — ${e.title} — /events/${e.slug}/`)
    .join('\n');
}

async function staleFiles(contentDir, days) {
  const cutoff = new Date(Date.now() - days * 86400000).toISOString().slice(0, 10);
  const rows = await listFrontmatter(path.join(contentDir, 'places'), ['verified']);
  return rows
    .filter((p) => !p.verified || p.verified < cutoff)
    .sort((a, b) => (a.verified ?? '').localeCompare(b.verified ?? ''))
    .slice(0, STALE_BATCH)
    .map((p) => `places/${p.slug}.md`);
}

async function listFrontmatter(dir, fields) {
  if (!existsSync(dir)) return [];
  const out = [];
  for (const name of await readdir(dir)) {
    if (!name.endsWith('.md')) continue;
    const text = await readFile(path.join(dir, name), 'utf8');
    const fm = text.startsWith('---') ? text.slice(3, text.indexOf('\n---', 3)) : '';
    const row = { slug: name.replace(/\.md$/, '') };
    for (const f of fields) {
      const m = fm.match(new RegExp(`^${f}:\\s*(.+)$`, 'm'));
      if (m) row[f] = m[1].trim().replace(/^["']|["']$/g, '');
    }
    out.push(row);
  }
  return out;
}

// ---------- helpers ----------

function nextMonday() {
  const d = new Date(today + 'T12:00');
  d.setDate(d.getDate() + ((8 - d.getDay()) % 7 || 7));
  return d.toISOString().slice(0, 10);
}

function stripFence(text) {
  const m = text.match(/^```(?:markdown|md|yaml)?\n([\s\S]*?)\n```\s*$/);
  return m ? m[1] : text;
}

function loadDotenv(file) {
  if (!existsSync(file)) return;
  for (const line of readFileSync(file, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*?)\s*$/);
    if (m && !(m[1] in process.env)) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}

function printUsage() {
  console.error(`Usage:
  npm run agent -- weekly <town|all>
  npm run agent -- verify <town> <file relative to content/<town>/> | --stale=60
  npm run agent -- write  <town> "<topic>"`);
  process.exit(1);
}
function die(msg) { console.error(`✗ ${msg}`); process.exit(1); }
