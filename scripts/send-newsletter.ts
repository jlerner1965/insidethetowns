#!/usr/bin/env node
/**
 * Sends issues of the weekly email through Buttondown.
 *
 *   npm run send-newsletter -- content/hub/issues/2026-10-22-lyons.md ...
 *   npm run send-newsletter -- --dry-run content/hub/issues/2026-10-22-*.md
 *   npm run send-newsletter -- --dry-run --report=plan.md <files>
 *
 * The owner's word of 18 October 2026: merging the Thursday pull request is
 * the approval to send (DECISIONS.md, "Merging the Thursday email sends
 * it"). .github/workflows/newsletter-send.yml runs this on the issue files a
 * push to main added under content/hub/issues/, which is that merge, so the
 * archive page and the email are the same file read by the same person.
 *
 * Each issue goes to the subscribers tagged with any of its towns (or a town
 * folded into one), the network issue to `all-towns`
 * (scripts/lib/send-newsletter.ts). Buttondown filters by tag id, so the
 * names are looked up first; a tag nobody carries yet has no id and no
 * reader, and an issue with no reader at all is skipped, never sent to an
 * empty filter, which Buttondown reads as everyone.
 *
 * It is safe to run twice. Each email carries its file name in Buttondown's
 * metadata and as its slug, and an issue whose name is already on an email
 * from the last few days is reported as sent and left alone. An issue more
 * than a day past its date is not sent: its weekend has started.
 *
 * Needs BUTTONDOWN_API_KEY (Settings → Secrets and variables → Actions).
 * --dry-run needs nothing and sends nothing; with a key it also says which
 * tags have no subscribers yet.
 */
import { appendFileSync, readFileSync, writeFileSync } from 'node:fs';
import { basename } from 'node:path';
import { allTowns } from '../src/config/index.ts';
import { hub } from '../src/config/towns/hub.ts';
import { addDays, dayKey } from '../src/lib/dates.ts';
import { parseFrontmatter } from './lib/frontmatter.ts';
import { audience, emailBody, recipientTags, sendable } from './lib/send-newsletter.ts';

const API = 'https://api.buttondown.com/v1';
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const report = args.find((a) => a.startsWith('--report='))?.split('=')[1];
const files = args.filter((a) => !a.startsWith('--') && a.endsWith('.md') && basename(a) !== 'README.md');
const key = process.env.BUTTONDOWN_API_KEY ?? '';
const allTag = hub.newsletter?.allTag ?? 'all-towns';
const today = dayKey(new Date());

if (!files.length) {
  console.log('send-newsletter: no issue files given; nothing to send.');
  process.exit(0);
}
if (!key && !dryRun) {
  console.error('send-newsletter: BUTTONDOWN_API_KEY is not set, so nothing was sent. Add it under Settings → Secrets and variables → Actions, then re-run this workflow.');
  process.exit(1);
}

/** A path under the API, or the full URL a list's `next` gives. */
async function api(path: string, init: RequestInit = {}): Promise<Response> {
  for (let attempt = 0; ; attempt++) {
    const res = await fetch(path.startsWith('https://') ? path : `${API}${path}`, {
      ...init,
      headers: {
        Authorization: `Token ${key}`,
        'Content-Type': 'application/json',
        // Drafts by default from this version; the send is asked for by name below.
        'X-API-Version': '2026-04-01',
        ...init.headers,
      },
    });
    if (res.status !== 429 || attempt === 3) return res;
    await new Promise((r) => setTimeout(r, 1000 * Number(res.headers.get('retry-after') ?? 10)));
  }
}

/** Every page of a Buttondown list. */
async function all<T>(path: string): Promise<T[]> {
  const out: T[] = [];
  for (let next: string | null = path; next; ) {
    const res = await api(next);
    if (!res.ok) throw new Error(`GET ${path}: ${res.status} ${await res.text()}`);
    const page = (await res.json()) as { results: T[]; next: string | null };
    out.push(...page.results);
    next = page.next;
  }
  return out;
}

interface Issue {
  file: string;
  name: string;
  title: string;
  date: string;
  excerpt: string;
  number?: number;
  tags: string[];
  body: string;
}

function read(file: string): Issue {
  const { data, body } = parseFrontmatter(readFileSync(file, 'utf8'));
  const towns = Array.isArray(data.towns) ? data.towns.map(String) : [];
  return {
    file,
    name: basename(file, '.md'),
    title: String(data.title ?? ''),
    date: String(data.date ?? ''),
    excerpt: String(data.excerpt ?? ''),
    number: typeof data.number === 'number' ? data.number : undefined,
    tags: recipientTags(towns, allTowns, allTag),
    body,
  };
}

const lines: string[] = [];
const say = (line: string) => {
  console.log(line);
  lines.push(line);
};

const issues = files.map(read);
const tagIds = new Map<string, string>();
const sentBefore = new Set<string>();
if (key) {
  for (const t of await all<{ id: string; name: string }>('/tags?page_size=1000')) tagIds.set(t.name, t.id);
  const since = dayKey(addDays(new Date(), -3));
  for (const e of await all<{ slug?: string | null; metadata?: Record<string, unknown> }>(`/emails?creation_date__start=${since}&excluded_fields=body`)) {
    if (e.slug) sentBefore.add(e.slug);
    if (typeof e.metadata?.issue === 'string') sentBefore.add(e.metadata.issue);
  }
}

say(dryRun ? `## What merging would send (${today})` : `## Sent (${today})`);
say('');
say('| Issue | To subscribers tagged | Result |');
say('|---|---|---|');
let failed = 0;
for (const issue of issues) {
  const cell = (text: string) => text.replace(/\|/g, '\\|');
  const row = (result: string) => say(`| ${cell(issue.title || issue.name)} | ${issue.tags.join(', ')} | ${cell(result)} |`);
  if (!issue.title || !/^\d{4}-\d{2}-\d{2}$/.test(issue.date)) {
    failed++;
    row(`not sent: ${issue.file} has no title or date`);
    continue;
  }
  if (!sendable(issue.date, today)) {
    failed++;
    row(issue.date > today ? `not sent: it is for ${issue.date}, still ahead` : `not sent: dated ${issue.date}, and its weekend has started`);
    continue;
  }
  if (sentBefore.has(issue.name)) {
    row('already sent; left alone');
    continue;
  }
  const ids = issue.tags.map((t) => tagIds.get(t)).filter((id): id is string => !!id);
  const missing = issue.tags.filter((t) => !tagIds.has(t));
  if (key && !ids.length) {
    row('not sent: nobody carries these tags yet');
    continue;
  }
  if (dryRun) {
    row(key && missing.length ? `would send; no subscribers yet for ${missing.join(', ')}` : 'would send');
    continue;
  }
  const res = await api('/emails', {
    method: 'POST',
    // Buttondown asks for this once per key before its first send by API.
    headers: { 'X-Buttondown-Live-Dangerously': 'true' },
    body: JSON.stringify({
      subject: issue.title,
      body: emailBody(issue.body),
      status: 'about_to_send',
      slug: issue.name,
      description: issue.excerpt,
      canonical_url: `https://${hub.domain}/newsletter/${issue.name}/`,
      filters: audience(ids),
      metadata: { issue: issue.name },
      ...(issue.number ? { secondary_id: issue.number } : {}),
    }),
  });
  if (res.ok) {
    row(missing.length ? `sent; no subscribers yet for ${missing.join(', ')}` : 'sent');
  } else {
    failed++;
    row(`not sent: Buttondown said ${res.status} ${(await res.text()).replace(/\s+/g, ' ').slice(0, 200)}`);
  }
}

const summary = `${lines.join('\n')}\n`;
if (report) writeFileSync(report, summary);
if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, summary);
if (failed) {
  console.error(`\nsend-newsletter: ${failed} issue(s) not sent; the table says why.`);
  process.exit(1);
}
