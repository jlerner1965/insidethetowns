/**
 * What the migration scripts share (the move of 17 November 2026):
 * the folded domains, with the commit that last held each guide's content,
 * and a small CSV reader and writer.
 */
import { readFileSync } from 'node:fs';

export interface FoldedDomain {
  /** The last commit that held the guide's content. */
  commit: string;
  /** For a guide retired before the restructure (no build at 7141d032): the fixed pages every guide served. */
  fixedPages?: readonly string[];
}

/** Every guide's fixed pages at 7141d032 (src/integrations/town-routes.ts and src/pages/), for a domain with no build to read them from. */
export const GUIDE_PAGES = ['/', '/events/', '/this-week/', '/this-weekend/', '/events/calendar.ics', '/events.rss', '/rss.xml', '/submit-event/', '/thanks/', '/guides/', '/eat-drink/', '/things-to-do/', '/directory/', '/for-businesses/', '/moving-here/', '/correct/', '/about/', '/contact/', '/privacy/', '/editorial/', '/corrections/', '/credits/', '/search/', '/message-sent/', '/sitemap-index.xml', '/sitemap-0.xml', '/robots.txt'] as const;

/** The pre-restructure commit: the last merge before the restructure's (8e0ebc03), 11 November 2026. */
export const PRE_RESTRUCTURE = '7141d032';

export const FOLDED: Record<string, FoldedDomain> = {
  'insidelongmontco.com': { commit: PRE_RESTRUCTURE },
  'insidelovelandco.com': { commit: PRE_RESTRUCTURE },
  'insidefortcollins.com': { commit: PRE_RESTRUCTURE },
  'insideestespark.com': { commit: PRE_RESTRUCTURE },
  'insidegolden.com': { commit: PRE_RESTRUCTURE },
  'insidecastlerockco.com': { commit: PRE_RESTRUCTURE },
  'insidelafayette.com': { commit: PRE_RESTRUCTURE },
  'insideleadville.com': { commit: PRE_RESTRUCTURE },
  'insidenederland.com': { commit: PRE_RESTRUCTURE },
  'insidetimnath.com': { commit: PRE_RESTRUCTURE },
  'insideelizabeth.com': { commit: PRE_RESTRUCTURE },
  // Retired before the restructure: the last commit with the guide's content.
  'insideidahosprings.com': { commit: 'a030ab9b', fixedPages: GUIDE_PAGES },
  'insideevergreenco.com': { commit: 'a030ab9b', fixedPages: GUIDE_PAGES },
  'insidemanitousprings.com': { commit: 'a030ab9b', fixedPages: GUIDE_PAGES },
  'insidegrandlake.com': { commit: 'f5e52d14', fixedPages: GUIDE_PAGES },
  'insidegeorgetownco.com': { commit: '933267d5', fixedPages: GUIDE_PAGES },
  'insideblackhawk.com': { commit: '933267d5', fixedPages: GUIDE_PAGES },
  'insidefortlupton.com': { commit: '5ce23d48', fixedPages: GUIDE_PAGES },
};

export function csvLine(fields: ReadonlyArray<string | number | undefined>): string {
  return fields.map((f) => {
    const s = String(f ?? '');
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  }).join(',');
}

export function readCsv(file: string): Array<Record<string, string>> {
  const text = readFileSync(file, 'utf8');
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i]!;
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') {
        field += '"';
        i++;
      } else if (c === '"') quoted = false;
      else field += c;
    } else if (c === '"') quoted = true;
    else if (c === ',') {
      row.push(field);
      field = '';
    } else if (c === '\n') {
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else if (c !== '\r') field += c;
  }
  if (field || row.length) {
    row.push(field);
    rows.push(row);
  }
  const [header, ...body] = rows;
  return body.filter((r) => r.some((f) => f !== '')).map((r) => Object.fromEntries(header!.map((h, i) => [h, r[i] ?? ''])));
}
