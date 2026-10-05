/**
 * What the weekly email and its sample page (/newsletter/sample/) share: the
 * send day, and which places are new or newly closed since the last issue.
 *
 * Nothing in a place's frontmatter says when it arrived or when it closed, so
 * both come from the git history: a file added in the window is new, and a
 * file whose `status:` line became closed in the window has closed.
 *
 * A shallow checkout is fine if its history reaches back past the window
 * (scripts/run.ts deepens the hub's build checkout by date for this). If it
 * does not, its oldest commit appears to add every file in the repository,
 * so `listingChanges` returns `null` rather than call every place new.
 */
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { addDays, formatWeekday, startOfDay } from './dates.ts';

/** The next send day on or after `from`, as a Denver day. */
export function nextSendDay(from: Date, sendDay: string): Date {
  let day = startOfDay(from);
  for (let i = 0; i < 7 && formatWeekday(day) !== sendDay; i++) day = addDays(day, 1);
  return day;
}

export interface ListingChanges {
  /** Paths, relative to the repository root, of place files added in the window. */
  added: Set<string>;
  /** Paths of place files whose status became closed or temporarily-closed in the window. */
  closed: Set<string>;
}

/**
 * Places added, and places marked closed, between `since` and `until`, under
 * `dir` (a path relative to `root`, such as "content"). `null` when there is
 * not enough history to read: not a git checkout, git missing, or a shallow
 * clone whose oldest commit is not older than `since`.
 */
export function listingChanges(root: string, dir: string, since: Date, until: Date): ListingChanges | null {
  const git = (args: string[]) => {
    try {
      return execFileSync('git', args, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 64 * 1024 * 1024 }).trim();
    } catch {
      return null;
    }
  };
  const shallow = git(['rev-parse', '--is-shallow-repository']);
  if (shallow === null) return null;
  if (shallow === 'true') {
    const file = git(['rev-parse', '--git-path', 'shallow']);
    const boundary = file ? (git(['show', '-s', '--format=%ct', ...readFileSync(resolve(root, file), 'utf8').split('\n').filter(Boolean)]) ?? '') : '';
    const times = boundary.split('\n').filter(Boolean).map(Number);
    if (times.length === 0 || times.some((t) => t * 1000 >= since.getTime())) return null;
  }
  const range = [`--since=${since.toISOString()}`, `--until=${until.toISOString()}`];
  const isPlace = (path: string) => /\/places\/[^/_][^/]*\.md$/.test(path);
  const added = new Set((git(['log', '--diff-filter=A', ...range, '--name-only', '--format=', '--', dir]) ?? '').split('\n').filter(isPlace));
  const closed = new Set<string>();
  let file = '';
  for (const line of (git(['log', ...range, '-p', '--format=', '--', dir]) ?? '').split('\n')) {
    if (line.startsWith('+++ b/')) file = line.slice('+++ b/'.length);
    else if (isPlace(file) && /^\+status:\s*["']?(closed|temporarily-closed)["']?\s*$/.test(line)) closed.add(file);
  }
  return { added, closed };
}
