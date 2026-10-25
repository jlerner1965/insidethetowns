/**
 * A school's sports data read from disk, for the scripts (the pages read
 * the same files through Vite's glob, src/lib/school-sports.ts). A town
 * without a school, or a school whose run has never written, gives nothing.
 */
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { schoolsFor, sportsDataFile, type SchoolSports, type SportsData } from '../../src/config/school-sports.ts';
import { weekAhead, type WeekAhead } from '../../src/lib/school-sports.ts';

export function readSportsData(school: Pick<SchoolSports, 'town' | 'slug'>, root = process.cwd()): SportsData | undefined {
  const file = resolve(root, sportsDataFile(school));
  if (!existsSync(file)) return undefined;
  try {
    return JSON.parse(readFileSync(file, 'utf8')) as SportsData;
  } catch {
    return undefined;
  }
}

export interface SchoolWeek {
  school: SchoolSports;
  week: WeekAhead;
}

/**
 * Each school the town follows with its week, as the strip reads it:
 * football first, then soonest first, and the last results. Schools with no
 * data file are left out.
 */
export function townSportsWeek(town: string, now = new Date(), root = process.cwd(), days = 7): SchoolWeek[] {
  return schoolsFor(town).flatMap((school) => {
    const data = readSportsData(school, root);
    return data ? [{ school, week: weekAhead(data, now, Infinity, days) }] : [];
  });
}
