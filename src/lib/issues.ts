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
import { findHubTown } from '../config/hub-towns.ts';

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

/** A guide that has closed since its issues went out: what it was called, its old domain, and where its town is now. */
export interface MovedGuide {
  siteTitle: string;
  domain: string;
  /** "Golden on Inside the Towns", "Inside Carbon Valley". */
  now: string;
  href: string;
}

interface GuideLike {
  status: string;
  name: string;
  siteTitle: string;
  domain: string;
  hubPage?: { town: string };
  retired?: { successor?: string };
}

/**
 * The closed guides an archived issue may name (the audit of 17 November
 * 2026: issues titled "Inside Golden" and signed "Inside Timnath" read as
 * live guides). A guide folded into a hub page that is published, or
 * retired into a successor guide; any other closed guide has nowhere to
 * point and is left out.
 */
export function movedGuides(towns: readonly GuideLike[], hubTitle: string, published: ReadonlySet<string>, find: (slug: string) => GuideLike | undefined): MovedGuide[] {
  const out: MovedGuide[] = [];
  for (const t of towns) {
    if (t.status !== 'redirect') continue;
    const successor = t.retired?.successor ? find(t.retired.successor) : undefined;
    if (t.hubPage && published.has(t.hubPage.town)) out.push({ siteTitle: t.siteTitle, domain: t.domain, now: `${findHubTown(t.hubPage.town)?.name ?? t.name} on ${hubTitle}`, href: `/${t.hubPage.town}/` });
    else if (successor && successor.status === 'live') out.push({ siteTitle: t.siteTitle, domain: t.domain, now: successor.siteTitle, href: `https://${successor.domain}/` });
  }
  return out;
}

/**
 * An archived issue's title on the hub's pages: a closed guide's name at its
 * head becomes its edition ("Inside Golden, the weekend of …" to "Golden
 * edition, the weekend of …"). The email's own text is not touched.
 */
export function archiveTitle(title: string, moved: readonly MovedGuide[]): string {
  const guide = moved.find((m) => title.startsWith(`${m.siteTitle},`));
  return guide ? `${guide.siteTitle.replace(/^Inside /, '')} edition${title.slice(guide.siteTitle.length)}` : title;
}

/** The closed guides an issue's text links to or signs off as. */
export function movedIn(body: string, moved: readonly MovedGuide[]): MovedGuide[] {
  return moved.filter((m) => body.includes(m.domain) || body.includes(m.siteTitle));
}
