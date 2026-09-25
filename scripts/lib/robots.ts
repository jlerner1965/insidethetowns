/**
 * Just enough of RFC 9309, the Robots Exclusion Protocol, for the link
 * checker to honour a site's robots.txt.
 *
 * Supported (which is all the protocol defines):
 *   user-agent   groups; consecutive lines share one group, and every group
 *                naming the same agent is merged
 *   allow        the longest matching rule wins; allow wins a tie
 *   disallow     an empty value disallows nothing
 *   * and $      any run of characters, and end of path
 *
 * Other lines (sitemap, crawl-delay, content signals) are ignored, as the RFC
 * says they may be.
 */

export interface RobotsRules {
  allow: string[];
  disallow: string[];
}

interface Group extends RobotsRules {
  agents: string[];
}

/** No robots.txt, or one with nothing to say to us. */
export const NO_RULES: RobotsRules = { allow: [], disallow: [] };

/** What a robots.txt that could not be read safely means under the RFC: stay out. */
export const STAY_OUT: RobotsRules = { allow: [], disallow: ['/'] };

/**
 * A user-agent line names a product token. Some files write the whole
 * user-agent string ("Foo/1.0"); like the major crawlers, match on the token.
 */
const tokenOf = (value: string) => (value.match(/^[A-Za-z_-]+/)?.[0] ?? value).toLowerCase();

/** The rules that apply to `token`: its own groups if any name it, otherwise `*`. */
export function parseRobots(text: string, token: string): RobotsRules {
  const groups: Group[] = [];
  let current: Group | undefined;
  let inRules = false;
  for (const raw of text.split(/\r?\n/)) {
    const m = raw.replace(/#.*/, '').match(/^\s*([A-Za-z-]+)\s*:\s*(.*?)\s*$/);
    if (!m) continue;
    const field = m[1]!.toLowerCase();
    const value = m[2]!;
    if (field === 'user-agent') {
      if (!current || inRules) {
        current = { agents: [], allow: [], disallow: [] };
        groups.push(current);
        inRules = false;
      }
      current.agents.push(tokenOf(value));
    } else if ((field === 'allow' || field === 'disallow') && current) {
      inRules = true;
      if (value) current[field].push(value);
    }
  }
  const own = groups.filter((g) => g.agents.includes(token.toLowerCase()));
  const chosen = own.length ? own : groups.filter((g) => g.agents.includes('*'));
  return { allow: chosen.flatMap((g) => g.allow), disallow: chosen.flatMap((g) => g.disallow) };
}

function matches(rule: string, path: string): boolean {
  const anchored = rule.endsWith('$');
  const pattern = (anchored ? rule.slice(0, -1) : rule)
    .split('*')
    .map((part) => part.replace(/[.+?^${}()|[\]\\]/g, '\\$&'))
    .join('.*');
  return new RegExp(`^${pattern}${anchored ? '$' : ''}`).test(path);
}

/** Whether `path` (pathname plus query string) may be fetched under `rules`. */
export function isAllowed(rules: RobotsRules, path: string): boolean {
  if (path === '/robots.txt') return true;
  let longest = -1;
  let allowed = true;
  for (const rule of rules.disallow) {
    if (rule.length > longest && matches(rule, path)) [longest, allowed] = [rule.length, false];
  }
  for (const rule of rules.allow) {
    if (rule.length >= longest && matches(rule, path)) [longest, allowed] = [rule.length, true];
  }
  return allowed;
}
