/**
 * Content collections. Every town's content lives under content/<town>/ and
 * all towns are loaded into the same collections; entry ids are
 * "<town>/<file-name>". Use the helpers in src/lib/content.ts, which filter
 * to the town being built.
 */
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { articleSchema, eventSchema, pageSchema, placeSchema } from './content/schemas';

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

export const collections = { events, places, articles, pages };
