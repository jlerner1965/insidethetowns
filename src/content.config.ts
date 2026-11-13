/**
 * Content collections. Every town's content lives under content/<town>/ and
 * all towns are loaded into the same collections; entry ids are
 * "<town>/<file-name>". Use the helpers in src/lib/content.ts, which filter
 * to the town being built.
 */
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { articleSchema, correctionSchema, eventSchema, issueSchema, lenient, pageSchema, placeSchema, profileSchema, programSchema, traditionSchema, updateSchema, weeklySchema } from './content/schemas';
import { FIXTURES_DIR, TRADITIONS_DIR, fixturesEnabled } from './lib/traditions';
import { CURIOSITY_DIR, curiositySchema } from './lib/curiosity';

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

/**
 * The editor's weekly notes, one file per town per week (content/<town>/weekly/).
 * Lenient like events and places: a typo in a note must not take the whole
 * network's build down, and src/lib/weekly.ts drops the marker.
 */
const weekly = defineCollection({
  loader: glob({ pattern: '*/weekly/[^_]*.md', base, generateId }),
  schema: () => lenient(weeklySchema()),
});

/** The public corrections log, one file per change: content/<town>/corrections/, content/hub/corrections/. */
const corrections = defineCollection({
  loader: glob({ pattern: '*/corrections/[^_]*.md', base, generateId }),
  schema: () => correctionSchema,
});

/**
 * The resident hubs' collections (programs to join, local changes, people),
 * one folder each under content/<town>/. Lenient like events and places:
 * they carry dated claims, and a bad field in one must not take a build
 * down; src/lib/content.ts drops the marker and holds back anything
 * without a source and a check date.
 */
const programs = defineCollection({
  loader: glob({ pattern: '*/programs/[^_]*.md', base, generateId }),
  schema: ({ image }) => lenient(programSchema(image)),
});

const updates = defineCollection({
  loader: glob({ pattern: '*/updates/[^_]*.md', base, generateId }),
  schema: ({ image }) => lenient(updateSchema(image)),
});

const profiles = defineCollection({
  loader: glob({ pattern: '*/profiles/[^_]*.md', base, generateId }),
  schema: ({ image }) => lenient(profileSchema(image)),
});

/**
 * Traditions (src/lib/traditions.ts): one record per named annual event,
 * network-wide, so they live with the hub's content and both the hub and
 * every guide read them. Strict, not lenient: a confirmed or moved year
 * without its date, source or check date fails the build (the brief's
 * rule), because the one failure this collection exists to prevent is a
 * wrong date on the page.
 *
 * The sample records in test/fixtures/traditions/ load only when
 * TRADITIONS_FIXTURES=1, which fixturesEnabled() refuses on Vercel; the id
 * is the record's slug, which for a fixture always starts "fixture-".
 */
const traditions = defineCollection({
  loader: glob({
    pattern: [`${TRADITIONS_DIR}/[^_]*.md`, ...(fixturesEnabled() ? [`${FIXTURES_DIR}/[^_]*.md`] : [])],
    base: '.',
    generateId: ({ entry, data }) => (typeof data.slug === 'string' ? data.slug : entry.replace(/^.*\//, '').replace(/\.md$/, '')),
  }),
  schema: () => traditionSchema(),
});

/**
 * The hub's town-anchored articles (src/lib/curiosity.ts): Camping, Ghost
 * towns and the one-off event article, one file each in
 * content/hub/curiosity/. Hub-owned and read by the guides too, for the
 * Nearby links, as the traditions are. Strict: a fact without its source
 * and check date, or a source on a guide site, fails the build. A draft
 * loads and is drawn nowhere (getCuriosity in src/lib/content.ts).
 */
const curiosity = defineCollection({
  loader: glob({
    pattern: `${CURIOSITY_DIR}/[^_]*.md`,
    base: '.',
    generateId: ({ entry, data }) => (typeof data.slug === 'string' ? data.slug : entry.replace(/^.*\//, '').replace(/\.md$/, '')),
  }),
  schema: () => curiositySchema,
});

export const collections = { events, places, articles, pages, issues, weekly, corrections, programs, updates, profiles, traditions, curiosity };
