/**
 * The newest sent issue of the weekly email that covers a town, read straight
 * from content/hub/issues/, for the signup on a guide's own pages: "Read
 * last Thursday's issue" is the evidence a form on its own cannot give, and
 * the archive pages are the hub's (insidethetowns.com/newsletter/<slug>/).
 *
 * Read from the files, not the content collection: a town's build may not
 * reach the hub's entries (getHubEntries refuses, on purpose), and all this
 * needs is each file's name, date and `towns` list. A file is an issue once
 * Thursday's pull request merged, which is also what sent it, so a link from
 * here is never to an issue nobody received.
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

export interface SentIssue {
  /** The file's name without its extension: the page's slug on the hub. */
  slug: string;
  /** The send day, "2026-11-05". */
  date: string;
}

/** The newest issue whose `towns` names this town, on or before `today` ("2026-11-10"); none, undefined. */
export function latestIssueFor(town: string, today: string, contentRoot = 'content'): SentIssue | undefined {
  const dir = join(contentRoot, 'hub', 'issues');
  if (!existsSync(dir)) return undefined;
  let latest: SentIssue | undefined;
  for (const file of readdirSync(dir)) {
    if (!file.endsWith('.md') || file.startsWith('_')) continue;
    const fm = readFileSync(join(dir, file), 'utf8').match(/^---\n([\s\S]*?)\n---/);
    if (!fm) continue;
    const date = fm[1]!.match(/^date:\s*"?(\d{4}-\d{2}-\d{2})"?\s*$/m)?.[1];
    const towns = fm[1]!.match(/^towns:\s*\[([^\]]*)\]\s*$/m)?.[1];
    if (!date || towns === undefined || date > today) continue;
    const covered = towns.split(',').map((t) => t.trim().replace(/^["']|["']$/g, '')).filter(Boolean);
    if (!covered.includes(town)) continue;
    if (!latest || date > latest.date) latest = { slug: file.slice(0, -3), date };
  }
  return latest;
}
