/**
 * Emits `_headers` and `_redirects` next to the built site, generated from
 * `vercel.json`.
 *
 * Those two filenames are the convention Cloudflare Pages and Netlify read;
 * Vercel ignores them entirely. So they cost nothing while the network is on
 * Vercel and mean a move is a dashboard exercise rather than a porting job —
 * which matters, because the Hobby plan is non-commercial use only and this
 * network sells sponsorship.
 *
 * Generated rather than kept as static files in public/ so there is one source
 * of truth. Two copies of a Content-Security-Policy drift, and the copy that
 * drifts is the one nobody is looking at — which would mean the security
 * headers silently weaken on the day the host changes, the one day nobody is
 * reading the CSP.
 */
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import type { AstroIntegration } from 'astro';

interface VercelHeader {
  source: string;
  headers: Array<{ key: string; value: string }>;
}
interface VercelRedirect {
  source: string;
  destination: string;
  permanent?: boolean;
}
interface VercelConfig {
  headers?: VercelHeader[];
  redirects?: VercelRedirect[];
}

/**
 * Vercel's `source` is path-to-regexp; the `_headers`/`_redirects` files take
 * a path with `*` and `:param`. The forms this repo actually uses translate
 * directly, and anything outside them throws rather than being guessed at: a
 * redirect that silently changes meaning between hosts is worse than a build
 * that stops.
 */
function toPath(source: string): string {
  const path = source
    // A trailing "(.*)" or ":param*" both mean "everything under here", which
    // these hosts spell "*". Anchored to the end so it cannot eat a pattern
    // that has more path after the wildcard.
    .replace(/\(\.\*\)$/, '*')
    .replace(/:[A-Za-z_]\w*\*$/, '*')
    // "{/}?" is Vercel's optional trailing slash. These hosts match a path
    // with or without it already, so the marker just comes off.
    .replace(/\{\/\}\?$/, '');
  if (/[()?{}]|\.\*/.test(path)) {
    throw new Error(
      `host-files: cannot translate "${source}" to a _headers/_redirects path. ` +
        'Add a case to toPath() rather than letting the two hosts disagree.',
    );
  }
  return path;
}

export function hostFiles(config: VercelConfig): AstroIntegration {
  return {
    name: 'inside-the-towns:host-files',
    hooks: {
      'astro:build:done': ({ dir, logger }) => {
        const out = fileURLToPath(dir);

        const headerBlocks = (config.headers ?? []).map(
          (block) => `${toPath(block.source)}\n` + block.headers.map((h) => `  ${h.key}: ${h.value}`).join('\n'),
        );
        writeFileSync(join(out, '_headers'), headerBlocks.join('\n\n') + '\n', 'utf8');

        // 301 and 308 both mean "moved permanently, keep the rankings"; 302 is
        // the temporary one. Vercel spells the distinction `permanent`.
        const redirectLines = (config.redirects ?? []).map(
          (r) => `${toPath(r.source)}  ${r.destination}  ${r.permanent === false ? 302 : 301}`,
        );
        writeFileSync(join(out, '_redirects'), redirectLines.join('\n') + '\n', 'utf8');

        logger.info(`_headers (${headerBlocks.length} blocks) and _redirects (${redirectLines.length}) written`);
      },
    },
  };
}
