/**
 * Content collections. Every town's content lives under content/<town>/ and
 * all towns are loaded into the same collections; entry ids are
 * "<town>/<file-name>". Use the helpers in src/lib/content.ts, which filter
 * to the town being built.
 */
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { articleSchema, eventSchema, issueSchema, pageSchema, placeSchema } from './content/schemas';

const base = './content';

/** "niwot/events/farmers-market.md" -> "niwot/farmers-market" */
const generateId = ({ entry }: { entry: string }) => {
  const [town, , ...rest] = entry.replace(/\.(md|mdx)$/i, '').split('/');
  return `${town}/${rest.join('/')}`;
};

const events = defineCollection({
  loader: glob({ pattern: '*/events/[^_]*.md', base, generateId }),
  schema: ({ image }) => eventSchema(image),
});

const places = defineCollection({
  loader: glob({ pattern: '*/places/[^_]*.md', base, generateId }),
  schema: ({ image }) => placeSchema(image),
});

const articles = defineCollection({
  loader: glob({ pattern: '*/articles/[^_]*.md', base, generateId }),
  schema: ({ image }) => articleSchema(image),
});

const pages = defineCollection({
  loader: glob({ pattern: '*/pages/[^_]*.md', base, generateId }),
  schema: ({ image }) => pageSchema(image),
});

/**
 * Sent issues of the weekly email. Hub-owned: content/hub/issues/.
 *
 * Until the first one is sent this logs "No files found matching" on every
 * build, which is accurate and self-resolving. The alternatives were worse:
 * registering the collection conditionally breaks the generated types that
 * `astro check` relies on, and writing a placeholder issue would put an email
 * in the archive that was never sent to anyone.
 */
const issues = defineCollection({
  loader: glob({ pattern: '*/issues/[^_]*.md', base, generateId }),
  schema: ({ image }) => issueSchema(image),
});

export const collections = { events, places, articles, pages, issues };
