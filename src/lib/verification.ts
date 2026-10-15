/**
 * Search-engine site verification, without a token in the repository.
 *
 * Google Search Console and Bing Webmaster Tools each offer an HTML meta tag
 * as one way to prove a site is yours. The token is per property, so per
 * domain, and every domain in the network is its own Vercel project, so the
 * natural place for it is that project's environment variables: the owner
 * pastes the token into the dashboard for insideniwot and nothing changes in
 * this code or in any other town's build (docs/SEARCH-VISIBILITY.md).
 *
 * The variables are read at build time. Unset, nothing is emitted, so a
 * site that has not been verified carries no empty tag. A token is not a
 * secret in the strict sense (it is published in the page), but it is still
 * never written into the repository: this file knows the variable names and
 * nothing else.
 */

/** The environment variables read, and the meta tag name each one fills. */
export const VERIFICATION_VARS = {
  GOOGLE_SITE_VERIFICATION: 'google-site-verification',
  BING_SITE_VERIFICATION: 'msvalidate.01',
} as const;

export interface VerificationTag {
  name: string;
  content: string;
}

/**
 * The meta tags to put in <head>, from an environment. Blank and
 * whitespace-only values are ignored; a value that would break out of an
 * attribute (quotes, angle brackets, whitespace) is refused rather than
 * emitted, since a verification token is a single run of letters, digits,
 * hyphens, underscores and dots and anything else is a paste gone wrong.
 */
export function verificationTags(env: Record<string, string | undefined>): VerificationTag[] {
  const tags: VerificationTag[] = [];
  for (const [variable, name] of Object.entries(VERIFICATION_VARS)) {
    const value = env[variable]?.trim();
    if (!value) continue;
    if (!/^[A-Za-z0-9_.=-]+$/.test(value)) continue;
    tags.push({ name, content: value });
  }
  return tags;
}
