/**
 * A town's development tracker against the Town's own record.
 *
 * Berthoud publishes its Development Activity Map from an ArcGIS feature
 * layer: one row per application, with the Town's status, the hearing dates
 * and the planners' notes. "What's being built in Berthoud"
 * (content/berthoud/articles/whats-being-built-in-berthoud.md) is written
 * from that layer, so the page is true on the day it is read and drifts
 * from the first meeting after. The nightly re-check reads the layer again,
 * compares it with the snapshot in data/<town>/development.json, and lists
 * every row that changed, so a person updates the page the same morning.
 *
 * This file is the pure part: shaping a row, comparing two snapshots and
 * writing the report. Fetching is in scripts/recheck-development.ts.
 */

/** One application as the guide keeps it: the Town's fields, trimmed, keyed by the Town's stable id. */
export interface Project {
  id: string;
  name: string;
  type: string;
  status: string;
  description: string;
  location: string;
  planningCommission: string;
  board: string;
  submittal: string;
  notes: string;
  developer: string;
}

export interface Snapshot {
  town: string;
  source: { label: string; page: string; layer: string };
  /** The article written from this layer, so the report can name it. */
  article: string;
  /** The day the layer was last read, as a Denver day. */
  read: string;
  /** The day the Town last edited the layer's data, from the service's editingInfo. */
  townEdited: string;
  projects: Project[];
}

/** The ArcGIS field names on the Town's layer, in the order the guide reads them. */
const FIELDS: Record<keyof Omit<Project, 'id' | 'type'>, string> = {
  name: 'Name',
  status: 'Review_Status',
  description: 'Description',
  location: 'Location',
  planningCommission: 'Planning_Comm',
  board: 'Board_Trustees',
  submittal: 'Submittal_Number',
  notes: 'Notes',
  developer: 'Developer',
};

/** The Town's abbreviations, spelled out once so the report reads as the page does. */
const STATUS: Record<string, string> = {
  IDR: 'In development review',
};
const TYPES: Record<string, string> = {
  NMP: 'Neighborhood master plan',
};

const clean = (v: unknown): string => (v == null ? '' : String(v)).replace(/\s+/g, ' ').trim();

/** Shape one feature's attributes. Empty and "N/A"-style fields stay empty strings, so a diff is about facts, not formatting. */
export function toProject(attrs: Record<string, unknown>): Project {
  const types = ['Project_Type', 'Project_Type2', 'Project_Type3']
    .map((k) => clean(attrs[k]))
    .filter((t) => t && !/^not applicable$/i.test(t))
    .map((t) => TYPES[t] ?? t);
  const p: Project = {
    id: clean(attrs.GlobalID) || `objectid:${clean(attrs.OBJECTID)}`,
    type: types.join(' + '),
    name: '',
    status: '',
    description: '',
    location: '',
    planningCommission: '',
    board: '',
    submittal: '',
    notes: '',
    developer: '',
  };
  for (const [key, field] of Object.entries(FIELDS) as [keyof typeof FIELDS, string][]) p[key] = clean(attrs[field]);
  p.status = STATUS[p.status] ?? p.status;
  return p;
}

export interface Change {
  project: Project;
  before: Project;
  fields: { field: keyof Project; from: string; to: string }[];
}
export interface Diff {
  added: Project[];
  removed: Project[];
  changed: Change[];
}

const COMPARED: (keyof Project)[] = ['name', 'type', 'status', 'description', 'location', 'planningCommission', 'board', 'submittal', 'notes', 'developer'];

export function diffProjects(before: Project[], after: Project[]): Diff {
  const was = new Map(before.map((p) => [p.id, p]));
  const now = new Map(after.map((p) => [p.id, p]));
  const added = after.filter((p) => !was.has(p.id));
  const removed = before.filter((p) => !now.has(p.id));
  const changed: Change[] = [];
  for (const p of after) {
    const b = was.get(p.id);
    if (!b) continue;
    const fields = COMPARED.filter((f) => b[f] !== p[f]).map((f) => ({ field: f, from: b[f], to: p[f] }));
    if (fields.length) changed.push({ project: p, before: b, fields });
  }
  const byName = (a: { name: string }, b: { name: string }) => a.name.localeCompare(b.name);
  return { added: added.sort(byName), removed: removed.sort(byName), changed: changed.sort((a, b) => byName(a.project, b.project)) };
}

const LABEL: Record<keyof Project, string> = {
  id: 'id',
  name: 'name',
  type: 'type',
  status: 'status',
  description: 'description',
  location: 'location',
  planningCommission: 'Planning Commission',
  board: 'Board of Trustees',
  submittal: 'submittal',
  notes: 'notes',
  developer: 'developer',
};

const q = (s: string) => (s ? `"${s}"` : 'blank');
const line = (p: Project) => [p.type, p.location, p.description].filter(Boolean).join('; ');

/**
 * The report for the pull request: what moved on the Town's map since the
 * snapshot, and which page says what the map used to say. Nothing moved:
 * one line, so the morning's reader knows it was looked at.
 */
export function formatReport(prev: Snapshot, next: Snapshot, diff: Diff, townName: string): string {
  const out: string[] = [];
  out.push(`## ${townName}: the Town's development map`);
  out.push('');
  const edited = prev.townEdited === next.townEdited ? `the Town last edited it ${next.townEdited}` : `the Town edited it ${next.townEdited} (it was ${prev.townEdited} at the last read)`;
  out.push(`Read ${next.read} from the [${next.source.label}](${next.source.page}); ${edited}. ${next.projects.length} applications on the map${prev.projects.length !== next.projects.length ? ` (${prev.projects.length} at the last read)` : ''}.`);
  const total = diff.added.length + diff.removed.length + diff.changed.length;
  if (!total) {
    out.push('');
    out.push(`No row changed since ${prev.read}. \`${next.article}\` stands.`);
    return out.join('\n') + '\n';
  }
  if (diff.changed.length) {
    out.push('');
    out.push(`### Changed (${diff.changed.length})`);
    out.push('');
    for (const c of diff.changed) {
      out.push(`- **${c.project.name || c.before.name}** (${c.project.status || 'no status'})`);
      for (const f of c.fields) out.push(`  - ${LABEL[f.field]}: ${q(f.from)} → ${q(f.to)}`);
    }
  }
  if (diff.added.length) {
    out.push('');
    out.push(`### New on the map (${diff.added.length})`);
    out.push('');
    for (const p of diff.added) out.push(`- **${p.name}** (${p.status || 'no status'}): ${line(p) || 'no description'}${p.notes ? `. Notes: ${p.notes}` : ''}`);
  }
  if (diff.removed.length) {
    out.push('');
    out.push(`### Gone from the map (${diff.removed.length})`);
    out.push('');
    for (const p of diff.removed) out.push(`- **${p.name}** (last seen as ${p.status || 'no status'}): ${line(p) || 'no description'}`);
  }
  out.push('');
  out.push(`\`${next.article}\` says what the map said on ${prev.read}. Update its rows for the projects above against the Town's record (a row gone from the map is checked against the agenda before it is called withdrawn), move the article's \`verified\` date, and merge. The snapshot in \`data/${next.town}/development.json\` is already the new read.`);
  return out.join('\n') + '\n';
}
