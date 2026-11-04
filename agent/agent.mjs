#!/usr/bin/env node
/**
 * The editorial agent: research on the Claude API, drafts into docs/agent/<town>/.
 * It never writes to content/. You review, paste, `npm run validate`, commit.
 *
 *   npm run agent -- weekly lyons                     # weekly notes draft for next Monday
 *   npm run agent -- weekly all                       # every live town
 *   npm run agent -- changes berthoud                 # up to two local changes (updates/) drafted from official pages
 *   npm run agent -- changes all                      # every resident guide (the ones whose home shows Worth knowing)
 *   npm run agent -- verify lyons places/a-lodge-lyons.md   # one file, relative to content/lyons/
 *   npm run agent -- verify lyons --stale=60          # places not verified in 60 days (max 8 per run)
 *   npm run agent -- write lyons "Where to park for Folks Fest"
 *
 * Env: ANTHROPIC_API_KEY (required; agent/.env is read when present),
 *      ITT_MODEL (default claude-sonnet-5-5), ITT_MAX_SEARCHES (10), ITT_MAX_FETCHES (20), ITT_CONCURRENCY (4),
 *      ITT_DRY_RUN=1 (print each task's prompt and write nothing).
 * The rules it follows live in .claude/skills/inside-the-towns-editor/SKILL.md.
 */

import Anthropic from '@anthropic-ai/sdk';
import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { findTown, liveTowns } from '../src/config/index.ts';
import { townSportsWeek } from '../scripts/lib/sports-data.ts';
import { gameText, resultText } from '../src/lib/school-sports.ts';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const skillPath = path.join(root, '.claude/skills/inside-the-towns-editor/SKILL.md');

loadDotenv(path.join(here, '.env'));
const MODEL = process.env.ITT_MODEL ?? 'claude-sonnet-5-5';
const MAX_SEARCHES = Number(process.env.ITT_MAX_SEARCHES ?? 10);
const MAX_FETCHES = Number(process.env.ITT_MAX_FETCHES ?? 20); // the first run ran out of fetches before searches
const CONCURRENCY = Number(process.env.ITT_CONCURRENCY ?? 4);
const MAX_TURNS = 24;
const STALE_BATCH = 8;

const DRY_RUN = process.env.ITT_DRY_RUN === '1';
if (!DRY_RUN && !process.env.ANTHROPIC_API_KEY) die('ANTHROPIC_API_KEY is not set (put it in agent/.env).');
const client = DRY_RUN ? null : new Anthropic();
const skill = await readFile(skillPath, 'utf8');

// ---------- arguments ----------

const [mode, townArg, ...rest] = process.argv.slice(2);
if (!mode || !townArg) printUsage();
const towns = townArg === 'all' ? liveTowns() : [findTown(townArg) ?? die(`Unknown town "${townArg}".`)];

const denver = (opts) => new Date().toLocaleDateString('en-US', { timeZone: 'America/Denver', ...opts });
const today = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Denver' }); // YYYY-MM-DD
const todayLong = denver({ weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

// ---------- run ----------

// Towns run CONCURRENCY at a time: the first full run took 67 minutes one town after another.
const queue = [];
for (const town of towns) for (const task of await buildTasks(mode, town, rest)) queue.push({ town, ...task });
let failed = 0;
await Promise.all(Array.from({ length: Math.min(CONCURRENCY, queue.length) }, async () => {
  for (let job; (job = queue.shift()); ) {
    const { town, label, prompt, outFile } = job;
    console.log(`▶ ${mode} · ${town.name} · ${label} · ${MODEL}`);
    if (DRY_RUN) { console.log(`--- ${path.relative(root, outFile)}\n${prompt}\n---`); continue; }
    try {
      const { text, searches, usage } = await runAgent(prompt, town);
      await mkdir(path.dirname(outFile), { recursive: true });
      await writeFile(outFile, text + '\n', 'utf8');
      console.log(`✓ ${town.name}: ${path.relative(root, outFile)}  (${searches} lookups, ${usage.input} in / ${usage.output} out tokens)`);
    } catch (err) {
      failed++;
      console.error(`✗ ${town.name}: ${err?.message ?? err}`);
    }
  }
}));
if (failed) process.exitCode = 1;

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
      const sports = schoolSports(town, weekOf);
      return [{
        label: `week of ${weekOf}`,
        outFile: path.join(outDir, `weekly-${weekOf}.md`),
        prompt: `Draft the weekly notes file for ${town.name} for the week of Monday ${weekOf} (today is ${todayLong}). Guide domain: ${town.domain}. The pick must be a listing that happens between Monday ${weekOf} and the Sunday after it, never before ${weekOf}: a weekend already past when the notes publish is dropped by the editor and the page goes out blank (Grand Lake, 26 October 2026).

Research: search for ${where} news from the past 10 days and events in the next 14 days. Start with these sources the guide already trusts, then widen to local news and business pages:
${sources || '(no source registry yet — find the town site, chamber, library and local paper yourself)'}

Pick: choose from the listings already on the guide (only these qualify for the pick url):
${events || '(no upcoming listings on the guide — leave the pick blank)'}
${sports ? `
High-school sports, from the guide's own data (MaxPreps, read by the sports run; the notes may mention a game or a result in these words and numbers only, never a score, date or opponent not listed here; the guide's page is https://${town.domain}/sports/):
${sports}
` : ''}
Produce the "Weekly notes" file format from your instructions, front matter first, then the Editor's notes section. checked: ${today}. expires: 14 days after weekOf unless the item is dated sooner.`,
      }];
    }

    case 'changes': {
      // Worth knowing on a resident guide's home is the two newest current
      // local changes (content/<town>/updates/). The flagship audit of 4
      // November 2026 found six of ten homes with one item or none while the
      // Towns' own pages held twenty; nothing in the automation wrote them.
      // This drafts up to two per week from official pages, into docs/, for
      // the Wednesday editor to publish when it can read the source itself.
      if (!town.home) { console.log(`  ${town.name}: no Worth knowing on its home; skipped`); return []; }
      const current = await currentChanges(contentDir);
      return [{
        label: `local changes, ${today}`,
        outFile: path.join(outDir, `changes-${today}.md`),
        prompt: `Find up to TWO real local changes for Inside ${town.name} (${town.domain}) and draft each as a complete local-change file. Today is ${todayLong}. Setting: ${where}.

A local change is something a resident needs to know that an official body has published: a decision or vote (council, board, the county, the school district), a road or trail closure, a park or facility opening or closing, a programme or registration with dates, a notice (holiday hours, a rate change, a permit rule). It took effect or was decided in the last 30 days, or is scheduled in the next 60. A change written up more than 30 days after it happened is not news and must not be drafted. Election results are stated as the county's unofficial count, labelled so, until certified.

Read these first, official pages before anything else (the Town's news and agendas, the county, the library, the school district, CDOT, the parks and recreation department); a news story is a lead, never the source of a fact. The registry below lists the pages the guide reads for events; a Town's news page, its agenda portal (CivicClerk, CivicPlus or Granicus) and its public-works or road-closure notices are often not in it and are where decisions and closures appear, so find them on the Town's own site:
${sources || '(no source registry yet — find the Town, county, library and school district pages yourself)'}

Already on the guide (do not draft these again, or anything that only restates them):
${current || '(none current)'}

Use the "Local change" format from your instructions for each file, published "${today}" and verified the day you read the source. Output one <file path="content/${town.slug}/updates/<slug>.md"> block per change, the whole file inside it, then an "Editor's notes" section: what you read (every URL, including those that gave nothing), what you considered and left out and why, and anything a person must check before publishing. Two is the most; one, or none with a note saying the official pages carried nothing new, is a fine answer. Never pad, never guess, and never write a doubt into the file itself: a fact you cannot read on the source stays out of the file and goes in the notes.`,
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
    { type: 'web_fetch_20260318', name: 'web_fetch', max_uses: MAX_FETCHES, citations: { enabled: false }, max_content_tokens: 40000 },
  ];
  const system = [
    { type: 'text', text: skill, cache_control: { type: 'ephemeral' } },
    { type: 'text', text: `Current guide: Inside ${town.name} (${town.domain}). Output only the finished document — no preamble, no closing remarks.` },
  ];
  const messages = [{ role: 'user', content: userPrompt }];
  let searches = 0;
  let clientToolAsks = 0;
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
    if (res.stop_reason === 'tool_use') {
      // The model now and then answers with a tool_use for a tool it was
      // not given (Windsor, 21 October 2026: the run threw here, the guide
      // had no draft that week, and the Wednesday editor published nothing
      // for it). Say there is no such tool and let it carry on with the
      // server tools; only a model that keeps asking ends the run.
      const asked = res.content.filter((b) => b.type === 'tool_use');
      const names = asked.map((b) => b.name).join(', ') || '(unnamed)';
      if (++clientToolAsks > 3) throw new Error(`model kept asking for a client tool (${names}); none are defined`);
      console.warn(`   ! model asked for a client tool (${names}); told it there is none`);
      messages.push({
        role: 'user',
        content: asked.map((b) => ({ type: 'tool_result', tool_use_id: b.id, is_error: true, content: `No tool named "${b.name}" is available here. Use web_search and web_fetch only, then write the finished document.` })),
      });
      continue;
    }
    if (res.stop_reason === 'max_tokens') console.warn('   ! hit max_tokens; draft may be truncated');
    const text = res.content.filter((b) => b.type === 'text').map((b) => b.text).join('').trim();
    return { text: stripFence(text), searches, usage };
  }
  throw new Error(`gave up after ${MAX_TURNS} turns`);
}

// ---------- repo readers (front matter is read with a small line parser; enough for these fields) ----------

/**
 * The school's games from today to the end of the week being drafted, and
 * each team's last result, as the home page's strip and the Thursday email
 * read them (src/lib/school-sports.ts weekAhead): football first. Nothing
 * where the town follows no school or its data file has not been written.
 */
function schoolSports(town, weekOf) {
  const now = new Date();
  const sunday = new Date(`${weekOf}T23:59`);
  sunday.setDate(sunday.getDate() + 6);
  const days = Math.max(7, Math.ceil((sunday - now) / 86400000));
  const lines = [];
  for (const { school, week } of townSportsWeek(town.slug, now, root, days)) {
    lines.push(`- ${school.school} ${school.mascot} (${school.maxpreps}):`);
    const games = week.games.length ? week.games : [];
    for (const g of games) lines.push(`  - ${gameText(g, now)}${g.team.overall ? ` (${g.team.overall} this season)` : ''}`);
    if (!games.length) lines.push('  - no games listed this week');
    if (week.last?.game.result) lines.push(`  - last out: ${resultText(week.last)} (${week.last.game.date})`);
  }
  return lines.join('\n');
}

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

/** The guide's local changes still current, so the draft does not repeat one: title, when, and when it leaves the home. */
async function currentChanges(contentDir) {
  const rows = await listFrontmatter(path.join(contentDir, 'updates'), ['title', 'effective', 'effectiveEnd', 'expires', 'published']);
  return rows
    .filter((u) => u.effective)
    .filter((u) => {
      const end = u.expires ?? u.effectiveEnd ?? new Date(new Date(u.effective + 'T12:00').getTime() + 60 * 86400000).toISOString().slice(0, 10);
      return end >= today;
    })
    .sort((a, b) => (b.published ?? '').localeCompare(a.published ?? ''))
    .map((u) => `- ${u.title} (effective ${u.effective}${u.expires ? `, until ${u.expires}` : u.effectiveEnd ? `, until ${u.effectiveEnd}` : ''}) — /updates/#${u.slug}`)
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
  npm run agent -- changes <town|all>
  npm run agent -- verify <town> <file relative to content/<town>/> | --stale=60
  npm run agent -- write  <town> "<topic>"`);
  process.exit(1);
}
function die(msg) { console.error(`✗ ${msg}`); process.exit(1); }
