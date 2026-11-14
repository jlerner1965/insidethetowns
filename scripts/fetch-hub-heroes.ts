/**
 * Brings in the hub town pages' photographs from Wikimedia Commons
 * (14 November 2026). For every town in scripts/hub-heroes.json whose
 * content/hub/images/<slug>.jpg is not there yet, this goes through the
 * candidates in order and takes the first that passes every check:
 *
 *   1. the files named in the list (picked by searching Commons; most were
 *      chosen from their titles, unseen, so the checks below matter);
 *   2. the photograph English Wikipedia leads "<Town>, Colorado" with,
 *      when it is a Commons file;
 *   3. the listed files marked `fallback` (a single building, or a title
 *      that could be a same-named town elsewhere);
 *   4. the files in Commons' "Category:<Town>, Colorado" (and its street,
 *      downtown and historic-district subcategories), best first: street
 *      and town views up, signs, maps, single buildings and events down.
 *
 * The checks, read from the live Commons API at that moment:
 *   - the licence allows commercial use and changes: CC0, public domain,
 *     CC BY or CC BY-SA (any version). NC, ND, GFDL-only, fair use and
 *     anything Commons does not state are refused;
 *   - a JPEG, landscape (at least 1.25 times as wide as tall), at least
 *     1600px wide;
 *   - not already in IMAGE_LICENSES.csv, and not on the town's `rejected`
 *     list.
 *
 * It saves Commons' rendition at up to 2400px wide (thumb.php; Commons
 * rate-limits datacenter addresses on upload.wikimedia.org: docs/PHOTOS.md)
 * and appends the file's row to IMAGE_LICENSES.csv, licence, author and
 * year as Commons states them.
 *
 * It does NOT write the alt text, so nothing it saves is shown yet: the page
 * keeps its horizon, and `npm test` fails, until someone has looked at the
 * photograph and written what is in the frame in src/config/hub-towns.ts.
 * A photograph that is not the town comes out with --reject, which deletes
 * the file and its row, remembers the file in the list and takes the next.
 *
 *   node scripts/fetch-hub-heroes.ts                 every town still waiting
 *   node scripts/fetch-hub-heroes.ts --dry-run       say what it would take
 *   node scripts/fetch-hub-heroes.ts --only ouray,telluride
 *   node scripts/fetch-hub-heroes.ts --list ouray    the eligible files, to choose by hand
 *   node scripts/fetch-hub-heroes.ts --take ouray "File:Ouray, Colorado.JPG"
 *   node scripts/fetch-hub-heroes.ts --reject ouray  not the town: drop it, take the next
 */
import { appendFileSync, existsSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs';
import { parseLedger, sourcePhoto } from '../src/lib/credits.ts';

interface Candidate {
  file: string;
  page?: string;
  license?: string;
  author?: string | null;
  alt?: string;
  why?: string;
  /** Tried after Wikipedia's lead photograph: a single building, or a title that may be another state's town. */
  fallback?: boolean;
}
interface Entry {
  slug: string;
  name: string;
  candidates: Candidate[];
  /** Commons titles looked at and turned down for this page: never taken again. */
  rejected?: string[];
  notes?: string;
}
interface Manifest {
  note?: string;
  towns: Entry[];
}
interface Eligible {
  title: string;
  width: number;
  height: number;
  licence: string;
  author: string;
  year: string;
  description: string;
}

const MANIFEST = 'scripts/hub-heroes.json';
const LEDGER = 'IMAGE_LICENSES.csv';
const UA = 'InsideTheTowns/1.0 (https://insidethetowns.com; hub town photographs)';
const COMMONS = 'https://commons.wikimedia.org/w/api.php';
const WIKIPEDIA = 'https://en.wikipedia.org/w/api.php';
const MIN_WIDTH = 1600;
const MAX_WIDTH = 2400;
const META = 'LicenseShortName|License|Artist|DateTimeOriginal|DateTime|ImageDescription|NonFree';

const args = process.argv.slice(2);
const has = (name: string) => args.includes(name);
const after = (name: string) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
};
const dryRun = has('--dry-run');
const listSlug = after('--list');
const takeSlug = after('--take');
const takeFile = takeSlug ? args[args.indexOf('--take') + 2] : undefined;
const rejectSlugs = after('--reject')?.split(',').map((s) => s.trim());
let only = after('--only') ? new Set(after('--only')!.split(',').map((s) => s.trim())) : undefined;

const manifest: Manifest = JSON.parse(readFileSync(MANIFEST, 'utf8'));
const saveManifest = () => writeFileSync(MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`);
const entryFor = (slug: string) => {
  const e = manifest.towns.find((t) => t.slug === slug);
  if (!e) throw new Error(`${slug} is not in ${MANIFEST}`);
  return e;
};
const imagePath = (slug: string) => `content/hub/images/${slug}.jpg`;
const fileTitle = (f: string) => (f.startsWith('File:') ? f : `File:${f}`).replace(/_/g, ' ');
const commonsKey = (title: string) => sourcePhoto(`https://commons.wikimedia.org/wiki/${fileTitle(title).replace(/ /g, '_')}`);

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const plain = (html = '') =>
  html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

/** "Ken Lund from Reno, Nevada, USA" → "Ken Lund": the credit's name, without what would break the ledger's brackets. */
function authorName(raw: string): string {
  let name = plain(raw);
  const flickr = /^(.+?) from [A-Z][^,]*(,.*)?$/.exec(name);
  if (flickr) name = flickr[1]!;
  return name.replace(/[();]/g, '').replace(/,.*$/, '').trim();
}

/** Commons' licence as the ledger writes it, or undefined when this site may not use it. */
function acceptedLicence(meta: Record<string, { value?: string }>): string | undefined {
  const short = plain(meta.LicenseShortName?.value);
  const code = plain(meta.License?.value).toLowerCase();
  if (meta.NonFree?.value === 'true') return undefined;
  if (/\b(nc|nd)\b|-nc|-nd|noncommercial|noderiv|fair use|^gfdl$/i.test(`${short} ${code}`)) return undefined;
  if (/^cc0\b/i.test(short) || code === 'cc0') return 'CC0';
  if (/^public domain$/i.test(short) || /^pd\b|^pd-/.test(code)) return 'Public domain';
  const cc = /^CC BY(-SA)? (\d\.\d)\b/.exec(short);
  if (cc) return `CC BY${cc[1] ?? ''} ${cc[2]}`;
  return undefined;
}

async function get(base: string, params: Record<string, string>): Promise<any> {
  const url = `${base}?${new URLSearchParams({ format: 'json', formatversion: '2', ...params })}`;
  for (let attempt = 0; attempt < 3; attempt++) {
    const res = await fetch(url, { headers: { 'User-Agent': UA } });
    if (res.ok) return res.json();
    if (res.status !== 429 && res.status < 500) throw new Error(`${new URL(base).host} ${res.status}`);
    await sleep(2000 * (attempt + 1));
  }
  throw new Error(`${new URL(base).host} kept failing`);
}

/** A file page from the API, judged: eligible, or why not. */
function judge(page: any, taken: Set<string | undefined>, rejected: Set<string>): Eligible | { why: string } {
  const info = page?.imageinfo?.[0];
  if (!page || page.missing || !info) return { why: 'no such file on Commons (or a Wikipedia-only file)' };
  const title = fileTitle(page.title);
  if (rejected.has(title)) return { why: 'rejected for this page before' };
  if (info.mime !== 'image/jpeg') return { why: `${info.mime}, not a JPEG` };
  if (info.width < MIN_WIDTH) return { why: `${info.width}px wide, under ${MIN_WIDTH}` };
  if (info.width < info.height * 1.25) return { why: `${info.width}×${info.height}, not landscape enough for the band` };
  const meta = info.extmetadata ?? {};
  const licence = acceptedLicence(meta);
  if (!licence) return { why: `licence "${plain(meta.LicenseShortName?.value) || 'not stated'}" is not one this site may use` };
  if (taken.has(commonsKey(title))) return { why: 'already in IMAGE_LICENSES.csv' };
  const author = authorName(meta.Artist?.value ?? '');
  if (!author && licence !== 'Public domain' && licence !== 'CC0') return { why: 'Commons names no author to credit' };
  const year = /\b(1[89]\d\d|20\d\d)\b/.exec(plain(meta.DateTimeOriginal?.value) || plain(meta.DateTime?.value))?.[1] ?? 'undated';
  return { title, width: info.width, height: info.height, licence, author, year, description: plain(meta.ImageDescription?.value).slice(0, 200) };
}

async function fileInfo(titles: string[]): Promise<any[]> {
  if (!titles.length) return [];
  const data = await get(COMMONS, { action: 'query', titles: titles.map(fileTitle).join('|'), prop: 'imageinfo', iiprop: 'size|mime|extmetadata', iiextmetadatafilter: META, redirects: '1' });
  const pages: any[] = data?.query?.pages ?? [];
  // Back in the order asked, following renames (a file moved to a new title).
  const renamed = new Map<string, string>((data?.query?.redirects ?? []).map((r: any) => [fileTitle(r.from), fileTitle(r.to)]));
  const norm = new Map<string, string>((data?.query?.normalized ?? []).map((n: any) => [fileTitle(n.from), fileTitle(n.to)]));
  return titles.map((t) => {
    let want = fileTitle(t);
    want = norm.get(want) ?? want;
    want = renamed.get(want) ?? want;
    return pages.find((p) => fileTitle(p.title) === want) ?? { title: t, missing: true };
  });
}

/** The photograph Wikipedia leads the town's article with, when it is a Commons file. */
async function wikipediaLead(name: string): Promise<string | undefined> {
  try {
    const data = await get(WIKIPEDIA, { action: 'query', titles: `${name}, Colorado`, prop: 'pageimages', piprop: 'name', redirects: '1' });
    const file = data?.query?.pages?.[0]?.pageimage;
    return file ? fileTitle(file) : undefined;
  } catch {
    return undefined;
  }
}

const GOOD = /main street|downtown|avenue|\bstreet\b|historic district|overview|from above|aerial|panorama|skyline|looking (north|south|east|west)|view of|town of|business district/i;
const BAD = /\bsign\b|signage|\bmap\b|locator|seal|logo|\bflag\b|plaque|marker|grave|cemetery|interior|portrait|parade|festival|rodeo|concert|locomotive|\btrain\b|\bcar\b|truck|\bbus\b|\bschool\b|\bhouse\b|church|museum|depot|bridge|courthouse|post office|\bmine\b|\bmill\b|\bski|snowboard|wildflower|\belk\b|\bdeer\b|\bbird|sunset|reservoir|\blake\b/i;

function score(e: Eligible, name: string): number {
  const text = `${e.title} ${e.description}`;
  let s = 0;
  if (GOOD.test(text)) s += 6;
  if (BAD.test(text)) s -= 6;
  if (text.includes(`${name}, Colorado`) || text.includes(`${name} Colorado`)) s += 2;
  const y = Number(e.year);
  if (y >= 2010) s += 2;
  else if (y && y < 2000) s -= 2;
  if (e.width >= 2400) s += 1;
  return s;
}

/** Files in the town's Commons category and its street-like subcategories, eligible ones only, best first. */
async function fromCategory(name: string, taken: Set<string | undefined>, rejected: Set<string>): Promise<Eligible[]> {
  const cats = [`Category:${name}, Colorado`];
  try {
    const subs = await get(COMMONS, { action: 'query', list: 'categorymembers', cmtitle: cats[0]!, cmtype: 'subcat', cmlimit: '200' });
    for (const c of subs?.query?.categorymembers ?? []) {
      if (/street|avenue|\bway\b|road|boulevard|drive|downtown|main|historic district|views of|aerial|buildings in/i.test(c.title)) cats.push(c.title);
    }
  } catch {
    return [];
  }
  const found: Eligible[] = [];
  for (const cat of cats.slice(0, 6)) {
    try {
      const data = await get(COMMONS, { action: 'query', generator: 'categorymembers', gcmtitle: cat, gcmtype: 'file', gcmlimit: '200', prop: 'imageinfo', iiprop: 'size|mime|extmetadata', iiextmetadatafilter: META });
      for (const p of data?.query?.pages ?? []) {
        const j = judge(p, taken, rejected);
        if ('title' in j && !found.some((f) => f.title === j.title)) found.push(j);
      }
    } catch {
      /* a category that will not load is a category with nothing in it */
    }
    await sleep(300);
  }
  return found.sort((a, b) => score(b, name) - score(a, name));
}

type Found = Eligible & { from: string };

/** Every eligible candidate for a town, in the order they would be taken. */
async function candidatesFor(entry: Entry, all = false): Promise<Found[]> {
  const taken = new Set(parseLedger(readFileSync(LEDGER, 'utf8')).map((r) => sourcePhoto(r.source)));
  const rejected = new Set((entry.rejected ?? []).map(fileTitle));
  const out: Found[] = [];
  const add = (e: Eligible, from: string) => {
    if (!out.some((o) => o.title === e.title)) out.push({ ...e, from });
  };
  const listed = entry.candidates.map((c) => fileTitle(c.file));
  const pages = await fileInfo(listed);
  const fromList = (fallback: boolean) => {
    for (const [i, page] of pages.entries()) {
      if (!!entry.candidates[i]!.fallback !== fallback) continue;
      const j = judge(page, taken, rejected);
      if ('title' in j) add(j, fallback ? 'a listed fallback' : i === 0 ? 'the pick' : 'a listed backup');
      else console.log(`  ${entry.slug}: ${listed[i]}: ${j.why}`);
    }
  };
  fromList(false);
  const lead = await wikipediaLead(entry.name);
  if (lead && !listed.includes(lead)) {
    const j = judge((await fileInfo([lead]))[0], taken, rejected);
    if ('title' in j) add(j, 'Wikipedia’s lead photograph');
    else console.log(`  ${entry.slug}: Wikipedia’s lead ${lead}: ${j.why}`);
  }
  fromList(true);
  for (const e of await fromCategory(entry.name, taken, rejected)) {
    // A category file that reads as a sign, a map, an event or a single building is for choosing by hand (--list), never taken unseen.
    if (score(e, entry.name) > 0 || all) add(e, `the Commons category (score ${score(e, entry.name)})`);
  }
  return out;
}

async function download(title: string, width: number, to: string): Promise<{ width: number; how: string }> {
  const name = fileTitle(title).replace(/^File:/, '');
  // Commons scales down only, so its renditions narrower than the original, widest first, then the original.
  const tries = [MAX_WIDTH, 1920, MIN_WIDTH]
    .filter((w) => w < width)
    .map((w) => ({ width: w, how: `Commons' ${w}px rendition`, url: `https://commons.wikimedia.org/w/thumb.php?${new URLSearchParams({ f: name, w: String(w) })}` }));
  tries.push({ width, how: 'the original file', url: `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(name)}` });
  for (const t of tries) {
    const res = await fetch(t.url, { headers: { 'User-Agent': UA } });
    if (!res.ok) continue;
    const bytes = Buffer.from(await res.arrayBuffer());
    if (bytes[0] !== 0xff || bytes[1] !== 0xd8) continue; // not a JPEG: an error page
    writeFileSync(to, bytes);
    return { width: t.width, how: t.how };
  }
  throw new Error(`could not download ${title} from Commons`);
}

const csvCell = (s: string) => (/[",]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s);

function ledgerRowFor(path: string): string | undefined {
  return readFileSync(LEDGER, 'utf8')
    .split('\n')
    .find((l) => l.startsWith(`${path},`));
}

/** Takes a town's photograph out again: the file, its row, and its Commons title onto the town's rejected list. */
function reject(slug: string) {
  const entry = entryFor(slug);
  const path = imagePath(slug);
  const row = ledgerRowFor(path);
  const source = row ? parseLedger(`header\n${row}`)[0]?.source : undefined;
  const key = source ? sourcePhoto(source) : undefined;
  const title = key?.startsWith('commons:') ? fileTitle(key.slice('commons:'.length)) : undefined;
  if (title) entry.rejected = [...new Set([...(entry.rejected ?? []), title])];
  if (row) writeFileSync(LEDGER, readFileSync(LEDGER, 'utf8').replace(`${row}\n`, ''));
  if (existsSync(path)) unlinkSync(path);
  saveManifest();
  console.log(`${slug}: took out ${title ?? path}`);
}

async function main() {
  if (listSlug) {
    const entry = entryFor(listSlug);
    const all = await candidatesFor(entry, true);
    if (!all.length) console.log(`${listSlug}: nothing on Commons passes the checks`);
    for (const c of all.slice(0, 15)) {
      console.log(`${c.title}\n  ${c.width}×${c.height}, ${c.licence} (${c.author || 'no author'}; ${c.year}); from ${c.from}\n  ${c.description}`);
    }
    return;
  }
  if (takeSlug) {
    if (!takeFile) throw new Error('--take <slug> "File:<title>"');
    const entry = entryFor(takeSlug);
    if (existsSync(imagePath(takeSlug))) reject(takeSlug);
    entry.candidates = [{ file: fileTitle(takeFile), why: 'chosen by hand' }, ...entry.candidates.filter((c) => fileTitle(c.file) !== fileTitle(takeFile))];
    entry.rejected = (entry.rejected ?? []).filter((r) => r !== fileTitle(takeFile));
    saveManifest();
    only = new Set([takeSlug]);
  }
  if (rejectSlugs) {
    for (const slug of rejectSlugs) reject(slug);
    only = new Set(rejectSlugs);
  }

  let saved = 0;
  const report: string[] = [];
  const missed: string[] = [];
  for (const entry of manifest.towns) {
    if (only && !only.has(entry.slug)) continue;
    const path = imagePath(entry.slug);
    if (existsSync(path)) continue;
    let all: Found[];
    try {
      all = await candidatesFor(entry);
    } catch (err) {
      console.log(`${entry.slug}: ${(err as Error).message}; try again later`);
      continue;
    }
    const c = all[0];
    if (!c) {
      console.log(`${entry.slug}: nothing on Commons passes the checks; the page keeps its horizon`);
      missed.push(entry.slug);
      continue;
    }
    if (dryRun) {
      console.log(`${entry.slug}: would take ${c.title}, ${c.width}×${c.height}, ${c.licence} (${c.author || 'no author'}; ${c.year}), from ${c.from}`);
      continue;
    }
    const got = await download(c.title, c.width, path);
    const page = `https://commons.wikimedia.org/wiki/${encodeURI(c.title.replace(/ /g, '_')).replace(/\?/g, '%3F').replace(/#/g, '%23')}`;
    // No named author (public domain, CC0): "Commons uploader", which the credits page leaves unnamed.
    const licence = `${c.licence} (${c.author || 'Commons uploader'}; ${c.year}); ${got.how}; the ${entry.name} page's photograph from 2026-11-14`;
    const credit = c.licence === 'CC0' || c.licence === 'Public domain' ? 'n' : 'y';
    const ledger = readFileSync(LEDGER, 'utf8');
    appendFileSync(LEDGER, `${ledger.endsWith('\n') ? '' : '\n'}${[path, page, licence, credit, 'hub'].map(csvCell).join(',')}\n`);
    const listed = entry.candidates.find((x) => fileTitle(x.file) === c.title);
    console.log(`${entry.slug}: saved ${path}: ${c.title}, from ${c.from}`);
    report.push(
      `- ${entry.slug}: ${path}\n  ${c.title} (${c.licence}, ${c.author || 'no author'}, ${c.year}), from ${c.from}\n  Commons says: ${c.description || '(no description)'}` +
        (listed?.alt ? `\n  draft alt (from the title, unseen): ${listed.alt}` : ''),
    );
    saved++;
    await sleep(500);
  }

  if (dryRun) return;
  console.log(`\n${saved} photograph(s) saved.${missed.length ? ` Nothing usable for: ${missed.join(', ')}.` : ''}`);
  if (report.length) {
    console.log(
      [
        '',
        'None of these shows yet. For each one: look at the photograph. If it is the town (its main street, or',
        'the town in its setting) and no person is its subject, write its alt text in src/config/hub-towns.ts',
        "(hero: { image: '<slug>.jpg', alt: '' }): what is in the frame, where, and when; add a position if",
        'the middle is the wrong crop for the band. If not, run --reject <slug> to take the next candidate,',
        'or --list <slug> and --take <slug> "File:…" to choose one.',
        '',
        ...report,
      ].join('\n'),
    );
  }
}

await main();
