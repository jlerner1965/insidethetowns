/**
 * The curiosity articles read straight from disk, for code that runs
 * before Astro's collections exist (the route integration, the sitemap's
 * dates) or outside Astro (the validator, the report). Kept apart from
 * src/lib/curiosity.ts so that file stays free of node:fs, as
 * src/lib/tradition-files.ts is from src/lib/traditions.ts.
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseFrontmatter } from '../../scripts/lib/frontmatter.ts';
import { CURIOSITY_DIR, CURIOSITY_TOPICS, articlePath, curiositySchema, isShown, lastVerified, type CuriosityArticle, type CuriosityTopic } from './curiosity.ts';

export interface CuriosityFile {
  file: string;
  /** The article, where the file passes the schema. */
  article?: CuriosityArticle;
  issues: string[];
}

/** Every article file, parsed and held to the schema; a file that fails says why. */
export function curiosityFiles(root = '.'): CuriosityFile[] {
  const dir = join(root, CURIOSITY_DIR);
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith('.md') && !f.startsWith('_'))
    .sort()
    .map((f) => {
      const file = `${CURIOSITY_DIR}/${f}`;
      let data: unknown;
      try {
        data = parseFrontmatter(readFileSync(join(dir, f), 'utf8')).data;
      } catch (e) {
        return { file, issues: [`unreadable: ${(e as Error).message}`] };
      }
      const parsed = curiositySchema.safeParse(data);
      if (!parsed.success) return { file, issues: parsed.error.issues.map((i) => `${i.path.join('.') || '(root)'}: ${i.message}`) };
      const issues = `${parsed.data.slug}.md` === f ? [] : [`slug "${parsed.data.slug}" is not the file's name`];
      return { file, article: parsed.data, issues };
    });
}

/** The articles a build draws: verified ones, and drafts only under the local preview switch. */
export function shownArticles(root = '.', env: Record<string, string | undefined> = process.env): CuriosityArticle[] {
  return curiosityFiles(root)
    .map((f) => f.article)
    .filter((a): a is CuriosityArticle => !!a && isShown(a, env));
}

/** The topics with an article to list: each gets its index page. No article, no page. */
export function topicsWithArticles(root = '.', env: Record<string, string | undefined> = process.env): CuriosityTopic[] {
  const shown = shownArticles(root, env);
  return CURIOSITY_TOPICS.filter((t) => shown.some((a) => a.kind === t));
}

/** Whether a one-off event article is shown: /articles/<slug>/ is built only then. */
export function hasEventArticle(root = '.', env: Record<string, string | undefined> = process.env): boolean {
  return shownArticles(root, env).some((a) => a.kind === 'event');
}

/** Each shown article's path and the day its facts were last verified, for the sitemap's lastmod. */
export function curiosityDates(root = '.', env: Record<string, string | undefined> = process.env): Map<string, string> {
  return new Map(shownArticles(root, env).map((a) => [articlePath(a), new Date(`${lastVerified(a)}T12:00:00Z`).toISOString()]));
}

/** The drafts a preview build draws, by path: each is noindex, so none belongs in that build's sitemap. */
export function draftPaths(root = '.', env: Record<string, string | undefined> = process.env): string[] {
  return shownArticles(root, env)
    .filter((a) => a.status !== 'verified')
    .map(articlePath);
}
