/**
 * Content collections. Every town's content lives under content/<town>/ and
 * all towns are loaded into the same collections; entry ids are
 * "<town>/<file-name>". Use the helpers in src/lib/content.ts, which filter
 * to the town being built.
 */
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { articleSchema, eventSchema, issueSchema, lenient, pageSchema, placeSchema } from './content/schemas';

const base = './content';

/** "niwot/events/farmers-market.md" -> "niwot/farmers-market" */
const generateId = ({ entry }: { entry: string }) => {
  const [town, , ...rest] = entry.replace(/\.(md|mdx)$/i, '').split('/');
  return `${town}/${rest.join('/')}`;
};

// Events and places are the two collections that carry the network's
// time-sensitive claims, so they are the two the build must never fail over.
// `lenient` turns a bad entry into a marker that src/lib/content.ts drops with
// a warning, instead of a failed build that leaves last week's deployment up.
// Staging folders (content/<town>/staging/) are not matched: `*` is one path
// segment, so `*/events/` is only ever the published folder.
const events = defineCollection({
  loader: glob({ pattern: '*/events/[^_]*.md', base, generateId }),
  schema: ({ image }) => lenient(eventSchema(image)),
});

const places = defineCollection({
  loader: glob({ pattern: '*/places/[^_]*.md', base, generateId }),
  schema: ({ image }) => lenient(placeSchema(image)),
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
