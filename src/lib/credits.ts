/**
 * IMAGE_LICENSES.csv is written for us: free text that records where a
 * photograph came from, its terms and what was done to it, including notes
 * like "see PERMISSIONS.md" that mean nothing to a reader. This turns each row
 * into the credit a reader sees on /credits/: who took it, under what licence
 * (linked), where it came from and whether we changed it.
 *
 * Plain TypeScript with no Astro imports, so the validator and the tests can
 * use it too. A row it cannot read throws, and the validator runs every row
 * through it, so a ledger entry that would print a wrong or empty credit fails
 * `npm run validate` instead of reaching the page.
 */

export interface LedgerRow {
  /** Repository path, e.g. content/lyons/images/depot.jpg */
  path: string;
  /** Site slug, or "all" for repository-only files such as the placeholder. */
  town: string;
  /** File name within the site's images folder. */
  file: string;
  source: string;
  license: string;
  creditRequired: boolean;
}

export interface PublicCredit {
  /** Photographer or rights holder, when the row names one. */
  author?: string;
  /** "CC BY-SA 3.0", "Public domain", "Used with permission"… */
  license: string;
  licenseUrl?: string;
  /** Where the original lives, when that is a public page. */
  sourceUrl?: string;
  /** What we changed: "resized", "cropped and resized". */
  changes?: string;
}

/** Splits one CSV line. Fields may be quoted and contain commas. */
function splitCsvLine(line: string): string[] {
  const cells: string[] = [];
  let cur = '';
  let quoted = false;
  for (const ch of line) {
    if (ch === '"') quoted = !quoted;
    else if (ch === ',' && !quoted) {
      cells.push(cur);
      cur = '';
    } else cur += ch;
  }
  cells.push(cur);
  return cells.map((c) => c.trim());
}

export function parseLedger(csv: string): LedgerRow[] {
  return csv
    .split('\n')
    .slice(1)
    .filter((line) => line.trim())
    .map((line) => {
      const [path = '', source = '', license = '', credit = '', town = ''] = splitCsvLine(line);
      return {
        path,
        town,
        file: path.split('/').pop() ?? '',
        source,
        license,
        creditRequired: credit.toLowerCase() === 'y',
      };
    });
}

const CC = /^(CC0|CC BY(?:-SA)? \d\.\d|Public Domain Mark 1\.0|Public domain)\b/;

function licenseUrl(name: string): string | undefined {
  if (name === 'CC0') return 'https://creativecommons.org/publicdomain/zero/1.0/';
  if (name === 'Public Domain Mark 1.0') return 'https://creativecommons.org/publicdomain/mark/1.0/';
  const m = /^CC (BY(?:-SA)?) (\d\.\d)$/.exec(name);
  return m ? `https://creativecommons.org/licenses/${m[1]!.toLowerCase()}/${m[2]}/` : undefined;
}

/** "(Maarten Heerlien via Flickr; 2010)" → "Maarten Heerlien". */
function authorFrom(license: string): string | undefined {
  const inner = /\(([^)]+)\)/.exec(license)?.[1];
  if (!inner) return undefined;
  const name = inner.split(';')[0]!.split(',')[0]!.replace(/\s+via Flickr$/i, '').trim();
  // Commons' generic "uploader" is not a name; the source link does the work.
  return name && !/^Commons uploader$/i.test(name) ? name : undefined;
}

function changesFrom(license: string): string | undefined {
  if (/cropped and resized/i.test(license)) return 'cropped and resized';
  if (/cropped/i.test(license)) return 'cropped';
  if (/resized to/i.test(license)) return 'resized';
  return undefined;
}

function sourceUrlFrom(source: string): string | undefined {
  return /^https?:\/\/\S+/.exec(source)?.[0];
}

/** The rights holders who granted written permission, as PERMISSIONS.md names them. */
const GRANTS: Array<[RegExp, string]> = [
  [/^Town of Erie staff photograph/, 'Town of Erie'],
  [/^Boulder County Parks & Open Space/, 'Boulder County Parks & Open Space'],
  [/^Use authorized by Town of Berthoud/, 'Town of Berthoud'],
  [/^Courtesy of the Johnstown Historical Society, Ltd/, 'Johnstown Historical Society, Ltd'],
  [/^Town of Johnstown photograph/, 'Town of Johnstown'],
];

export function publicCredit(row: LedgerRow): PublicCredit {
  const { license } = row;
  const sourceUrl = sourceUrlFrom(row.source);
  const changes = changesFrom(license);

  const cc = CC.exec(license)?.[1];
  if (cc && !/placeholder/i.test(license)) {
    return { author: authorFrom(license), license: cc, licenseUrl: licenseUrl(cc), sourceUrl, changes };
  }
  for (const [pattern, holder] of GRANTS) {
    if (pattern.test(license)) return { author: holder, license: 'Used with permission', sourceUrl, changes };
  }
  if (/^owned by the publisher/i.test(license)) {
    return { author: 'Inside the Towns', license: 'All rights reserved' };
  }
  if (/^client-supplied for townofniwot\.com; use on insideniwot\.com confirmed/i.test(license)) {
    return { author: 'townofniwot.com', license: 'Used with permission' };
  }
  throw new Error(
    `IMAGE_LICENSES.csv: cannot turn the licence for ${row.path} into a public credit: "${license}". ` +
      'Start it with the licence name (e.g. "CC BY-SA 4.0 (Author; year)") or add the grant to GRANTS in src/lib/credits.ts.',
  );
}

/** The one-line form used in captions: "Jeffrey Beall, Wikimedia Commons, CC BY-SA 3.0". */
export function licenseName(row: LedgerRow): string | undefined {
  const cc = CC.exec(row.license)?.[1];
  return cc && cc !== 'Public domain' ? cc : undefined;
}
