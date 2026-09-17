#!/usr/bin/env node
/**
 * Scaffolds a new town: config file, registry entry, content folder with one
 * sample event, place, article and moving-here page, a favicon, and a
 * placeholder hero. Prints what to do next.
 *
 *   npm run new-town lyons "Lyons"
 */
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync, appendFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const [slug, ...nameParts] = process.argv.slice(2);
const name = nameParts.join(' ');

if (!slug || !name) {
  console.error('Usage: npm run new-town <slug> "<Town Name>"   e.g. npm run new-town lyons "Lyons"');
  process.exit(1);
}
if (!/^[a-z][a-z0-9-]*$/.test(slug)) {
  console.error(`Slug "${slug}" must be lowercase letters, numbers and hyphens.`);
  process.exit(1);
}

const configFile = join(root, 'src/config/towns', `${slug}.ts`);
const contentDir = join(root, 'content', slug);
const faviconDir = join(root, 'public/favicons', slug);
const registryFile = join(root, 'src/config/towns/registry.ts');
for (const p of [configFile, contentDir]) {
  if (existsSync(p)) {
    console.error(`${p} already exists. Refusing to overwrite.`);
    process.exit(1);
  }
}

// A distinct starting accent per town, picked by slug so re-runs are stable.
const palette = [
  ['#9A3B2E', '#6E281F'], // brick
  ['#2F6B5E', '#1F4A41'], // spruce
  ['#8A6A1F', '#5F4915'], // wheat
  ['#3E5C8A', '#2A3F5F'], // slate blue
  ['#7A4E8A', '#54365F'], // plum
  ['#B4562A', '#7D3B1D'], // sandstone
];
const hash = [...slug].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);
const [accent, accentDark] = palette[hash % palette.length]!;
const ident = slug.replace(/-([a-z0-9])/g, (_, c: string) => c.toUpperCase());

const configSource = `import { DEFAULT_TOWN_NAV, type TownConfig } from './types';

// TODO: fill in the real values (lat/lng, county, population, links) before launch.
export const ${ident}: TownConfig = {
  kind: 'town',
  slug: '${slug}',
  name: '${name}',
  domain: 'inside${slug.replace(/-/g, '')}.com',
  siteTitle: 'Inside ${name}',
  tagline: 'An independent guide to ${name}, Colorado: events, food, trails and moving here.',
  county: 'TODO',
  state: 'CO',
  lat: 40.0,
  lng: -105.0,
  colors: {
    accent: '${accent}',
    accentDark: '${accentDark}',
    neutralBg: '#F7F5F0',
  },
  hero: {
    image: 'hero.jpg',
    alt: 'TODO: describe the hero photo of ${name}',
  },
  social: {
    email: 'hello@inside${slug.replace(/-/g, '')}.com',
  },
  nav: DEFAULT_TOWN_NAV,
  movingHere: {
    listingsLinks: [
      { label: 'Homes for sale on Zillow', url: 'https://www.zillow.com/homes/${encodeURIComponent(name)},-CO_rb/' },
      { label: 'Homes for sale on Redfin', url: 'https://www.redfin.com/city/TODO/CO/${encodeURIComponent(name)}' },
    ],
    schoolDistrict: 'TODO',
    commuteNotes: 'TODO',
  },
  officialLinks: {
    townSite: 'https://TODO.gov',
    townSiteLabel: 'the Town of ${name}',
  },
};
`;

const iso = (d: Date) => d.toISOString().slice(0, 10);
const daysOut = (n: number) => new Date(Date.now() + n * 86_400_000);

const sampleEvent = `---
title: "${name} Farmers Market (sample)"
start: "${iso(daysOut(10))}T09:00"
end: "${iso(daysOut(10))}T13:00"
venue: "Main Street"
address: "Main Street, ${name}, CO"
cost: "Free"
category: market
recurring: "Every Saturday through October"
featured: true
---

This is a sample event created by \`npm run new-town\`. Replace it with a real one.

Write the description here in Markdown. Keep the first sentence useful on its own; it is used as the summary in search results.
`;

const samplePlace = `---
title: "Main Street Cafe (sample)"
type: coffee
address: "100 Main Street, ${name}, CO"
url: "https://example.com"
hours: "Mon–Sun 7am–3pm"
priceRange: "$"
tags: [breakfast, patio]
featured: true
summary: "A sample place created by the new-town script. Replace it with a real listing."
---

Longer description in Markdown. What it is, who it suits, what to order, when it is busy.
`;

const sampleArticle = `---
title: "Welcome to Inside ${name} (sample)"
date: "${iso(new Date())}"
excerpt: "A sample article. Say what this guide is, who makes it, and how to get an event or business listed."
category: "Community"
tags: [outdoors]
---

Write the article body in Markdown. Articles tagged \`outdoors\` also appear on the Things to Do page.
`;

const movingHere = `---
title: "Moving to ${name}"
description: "Schools, commutes, housing and what to expect when you move to ${name}, Colorado."
---

## Who moves here

Sample copy from \`npm run new-town\`. Replace with the real guide.

## Housing

What the market looks like, typical price bands, how fast homes move.

## Getting around

Commutes to the nearest cities, transit, and the roads that matter.
`;

const readme = readFileSync(join(root, 'scripts/templates/CONTENT_README.md'), 'utf8')
  .replaceAll('__NAME__', name)
  .replaceAll('__SLUG__', slug);

const favicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="12" fill="${accent}"/>
  <text x="32" y="44" font-family="Georgia, serif" font-size="36" font-weight="700" fill="#fff" text-anchor="middle">${name.charAt(0).toUpperCase()}</text>
</svg>
`;

// --- write everything ---
mkdirSync(join(contentDir, 'events'), { recursive: true });
mkdirSync(join(contentDir, 'places'), { recursive: true });
mkdirSync(join(contentDir, 'articles'), { recursive: true });
mkdirSync(join(contentDir, 'pages'), { recursive: true });
mkdirSync(join(contentDir, 'images'), { recursive: true });
mkdirSync(faviconDir, { recursive: true });

writeFileSync(configFile, configSource);
writeFileSync(join(contentDir, 'events', 'sample-farmers-market.md'), sampleEvent);
writeFileSync(join(contentDir, 'places', 'sample-main-street-cafe.md'), samplePlace);
writeFileSync(join(contentDir, 'articles', 'welcome.md'), sampleArticle);
writeFileSync(join(contentDir, 'pages', 'moving-here.md'), movingHere);
writeFileSync(join(contentDir, 'README.md'), readme);
writeFileSync(join(faviconDir, 'favicon.svg'), favicon);
copyFileSync(join(root, 'scripts/templates/placeholder-hero.jpg'), join(contentDir, 'images', 'hero.jpg'));

const registry = readFileSync(registryFile, 'utf8');
if (!registry.includes('// new-town:imports') || !registry.includes('// new-town:entries')) {
  console.error('registry.ts is missing the // new-town markers; add the town by hand.');
  process.exit(1);
}
writeFileSync(
  registryFile,
  registry
    .replace('// new-town:imports', `import { ${ident} } from './${slug}';\n// new-town:imports`)
    .replace('  // new-town:entries', `  ${ident},\n  // new-town:entries`),
);

appendFileSync(
  join(root, 'IMAGE_LICENSES.csv'),
  `content/${slug}/images/hero.jpg,generated (scripts/templates/placeholder-hero.jpg),CC0 placeholder — replace before launch,n,${slug}\n`,
);

console.log(`
Created Inside ${name}:
  src/config/towns/${slug}.ts        ← fill in the TODOs
  content/${slug}/                    ← sample event, place, article, moving-here; README explains the format
  content/${slug}/images/hero.jpg     ← placeholder; replace with a real photo and update IMAGE_LICENSES.csv
  public/favicons/${slug}/favicon.svg

Next:
  TOWN=${slug} npm run dev
  Add the slug to LIVE_TOWNS in src/config/index.ts when the domain is live.
  Create the Vercel project with TOWN=${slug} (see DEPLOY.md).
`);
