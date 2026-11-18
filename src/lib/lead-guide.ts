/**
 * A town page's lead guide (the owner's brief of 18 November 2026): the
 * article named by `leadGuide` on the town's row (src/config/hub-towns.ts),
 * linked under "Start here" at the top of its page on the hub. The page
 * prints the article's own title and excerpt, so the link cannot say
 * something the article does not.
 *
 * A path names one of two kinds of article:
 *   /<town>/articles/<slug>/  a guide's article in a full section (Estes Park)
 *   /<town>/guides/<slug>/    a guide's article kept page by page (Golden)
 *   /articles/<slug>/         a hub story (Salida, which never had a guide)
 * Plain parsing here; the page looks the article up and stops the build on
 * a path that names none.
 */

export type LeadGuideRef = { kind: 'section'; town: string; segment: 'articles' | 'guides'; slug: string } | { kind: 'hub'; slug: string };

const SECTION = /^\/([a-z0-9]+(?:-[a-z0-9]+)*)\/(articles|guides)\/([a-z0-9]+(?:-[a-z0-9]+)*)\/$/;
const HUB = /^\/articles\/([a-z0-9]+(?:-[a-z0-9]+)*)\/$/;

/** What a `leadGuide` path names, or undefined for one that is neither kind. */
export function parseLeadGuide(href: string): LeadGuideRef | undefined {
  const hub = HUB.exec(href);
  if (hub) return { kind: 'hub', slug: hub[1]! };
  const section = SECTION.exec(href);
  if (section) return { kind: 'section', town: section[1]!, segment: section[2] as 'articles' | 'guides', slug: section[3]! };
  return undefined;
}

/** The path segment a section's articles are built under: a full section keeps the guide's /articles/, a kept one has /guides/. */
export function sectionArticleSegment(mode: 'full' | 'pages'): 'articles' | 'guides' {
  return mode === 'full' ? 'articles' : 'guides';
}
