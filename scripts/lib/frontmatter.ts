/**
 * A deliberately small YAML-subset frontmatter parser for the validator and
 * the weekly tooling, so the scripts need no dependencies beyond Astro.
 *
 * Supported (which is all our content uses):
 *   key: value            strings, "quoted strings", numbers, true/false
 *   key: [a, b, "c d"]    inline lists
 *   key:                  a map under a key, by indentation
 *     a: 1
 *   key:                  a list of maps, one `- a: 1` per item, the rest of its keys under it
 *   key:                  block lists
 *     - item
 *     - { label: "a", url: "b" }   an inline map as a list item
 *   key: { a: 1, b: [x, y] }       an inline map, one level of lists inside
 *   # comments, at the start of a line or after a space
 *
 * Astro parses the same files with full YAML; everything this accepts, YAML
 * reads the same way. Keep content within this subset.
 */

export type Frontmatter = Record<string, unknown>;

export interface ParsedFile {
  data: Frontmatter;
  body: string;
  /** 1-based line number where frontmatter starts, for error messages. */
  line: number;
}

function scalar(raw: string): unknown {
  const text = raw.trim();
  if (text === '') return '';
  if ((text.startsWith('"') && text.endsWith('"')) || (text.startsWith("'") && text.endsWith("'"))) {
    const inner = text.slice(1, -1);
    return text.startsWith('"') ? inner.replace(/\\"/g, '"').replace(/\\n/g, '\n') : inner.replace(/''/g, "'");
  }
  if (text === 'true') return true;
  if (text === 'false') return false;
  if (text === 'null' || text === '~') return null;
  if (/^-?\d+(\.\d+)?$/.test(text)) return Number(text);
  return text;
}

function inlineList(raw: string, keepRaw = false): unknown[] {
  const inner = raw.trim().slice(1, -1).trim();
  if (inner === '') return [];
  const items: string[] = [];
  let current = '';
  let quote: string | null = null;
  // Brackets nest one level: `{ season: "May–Oct", closedMonths: [Nov, Dec] }`
  // must not be split at the comma inside the list.
  let depth = 0;
  let escaped = false;
  for (const ch of inner) {
    if (quote) {
      current += ch;
      // A backslash-escaped quote inside a double-quoted string does not close it.
      if (escaped) escaped = false;
      else if (ch === '\\' && quote === '"') escaped = true;
      else if (ch === quote) quote = null;
    } else if (ch === '"' || ch === "'") {
      quote = ch;
      current += ch;
    } else if (ch === '[' || ch === '{') {
      depth++;
      current += ch;
    } else if (ch === ']' || ch === '}') {
      depth--;
      current += ch;
    } else if (ch === ',' && depth === 0) {
      items.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  items.push(current);
  return keepRaw ? items : items.map(value);
}

/** A scalar, or an inline list or map where one is written. */
function value(raw: string): unknown {
  const text = raw.trim();
  if (text.startsWith('[') && text.endsWith(']')) return inlineList(text);
  if (text.startsWith('{') && text.endsWith('}')) return inlineMap(text);
  return scalar(text);
}

/** `{ label: "a", url: "b" }` → { label: "a", url: "b" }. Values are scalars, or one inline list or map. */
function inlineMap(raw: string): Record<string, unknown> {
  const inner = raw.trim().slice(1, -1);
  if (inner.trim() === '') return {};
  const out: Record<string, unknown> = {};
  // Reuse the list splitter, which respects quotes and brackets, then split each pair at its first colon.
  for (const pair of inlineList(`[${inner}]`, true).map(String)) {
    const at = pair.indexOf(':');
    if (at === -1) throw new Error(`cannot parse map entry "${pair}"`);
    out[pair.slice(0, at).trim()] = value(pair.slice(at + 1));
  }
  return out;
}

/**
 * The text of a line with a trailing comment cut off: a `#` that opens a
 * comment is one preceded by whitespace (or at the start of the line) and not
 * inside quotes, which is YAML's own rule. `venue: "Suite #4"` keeps its hash.
 */
function stripComment(text: string): string {
  let quote: string | null = null;
  let escaped = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]!;
    if (quote) {
      if (escaped) escaped = false;
      else if (ch === '\\' && quote === '"') escaped = true;
      else if (ch === quote) quote = null;
    } else if (ch === '"' || ch === "'") {
      quote = ch;
    } else if (ch === '#' && (i === 0 || /\s/.test(text[i - 1]!))) {
      return text.slice(0, i).trimEnd();
    }
  }
  return text;
}

interface Line {
  indent: number;
  text: string;
  /** 1-based, for error messages. */
  no: number;
}

const KEY = /^([A-Za-z_][\w-]*):(.*)$/;
const DASH = /^-(?:\s+(.*))?$/;

/**
 * The block forms the weekly notes use, which the inline forms above cannot
 * write readably: a map under a key, and a list of maps under a key.
 *
 *   pick:
 *     title: "…"
 *   changes:
 *     - tag: opening
 *       name: "…"
 *
 * Nesting is by indentation, as in YAML: a key's value is the block of
 * deeper-indented lines that follows it. Astro reads the same files with full
 * YAML; everything this accepts, YAML reads the same way.
 */
function parseMap(lines: Line[], at: number, indent: number): [Record<string, unknown>, number] {
  const out: Record<string, unknown> = {};
  let i = at;
  while (i < lines.length && lines[i]!.indent === indent) {
    const line = lines[i]!;
    const kv = KEY.exec(line.text);
    if (!kv) throw new Error(`Line ${line.no}: cannot parse "${line.text}"`);
    const key = kv[1]!;
    const rest = (kv[2] ?? '').trim();
    i++;
    if (rest !== '') {
      out[key] = value(rest);
      continue;
    }
    const next = lines[i];
    if (next && next.indent > indent) {
      [out[key], i] = DASH.test(next.text) ? parseList(lines, i, next.indent) : parseMap(lines, i, next.indent);
    } else {
      // `key:` with nothing under it, as before: an empty list.
      out[key] = [];
    }
  }
  return [out, i];
}

function parseList(lines: Line[], at: number, indent: number): [unknown[], number] {
  const out: unknown[] = [];
  let i = at;
  while (i < lines.length && lines[i]!.indent === indent && DASH.test(lines[i]!.text)) {
    const line = lines[i]!;
    const item = (DASH.exec(line.text)![1] ?? '').trim();
    i++;
    const next = lines[i];
    if (item === '') {
      // A bare dash: the item is the block under it.
      if (next && next.indent > indent) {
        [out[out.length], i] = DASH.test(next.text) ? parseList(lines, i, next.indent) : parseMap(lines, i, next.indent);
      } else {
        out.push(null);
      }
      continue;
    }
    const kv = KEY.exec(item);
    if (kv && !item.startsWith('{') && !item.startsWith('[')) {
      // `- tag: opening` opens a map whose other keys follow, indented past the dash.
      const first: Record<string, unknown> = {};
      const key = kv[1]!;
      const rest = (kv[2] ?? '').trim();
      // The map's own indent is where its first key sits: past the dash and the space.
      const keyIndent = indent + (line.text.length - line.text.replace(/^-\s*/, '').length);
      if (rest !== '') first[key] = value(rest);
      else if (next && next.indent > keyIndent) {
        [first[key], i] = DASH.test(next.text) ? parseList(lines, i, next.indent) : parseMap(lines, i, next.indent);
      } else first[key] = [];
      const after = lines[i];
      if (after && after.indent > indent && !DASH.test(after.text)) {
        const [more, j] = parseMap(lines, i, after.indent);
        Object.assign(first, more);
        i = j;
      }
      out.push(first);
      continue;
    }
    out.push(value(item));
  }
  return [out, i];
}

export function parseFrontmatter(source: string): ParsedFile {
  const raw = source.split(/\r?\n/);
  if (raw[0]?.trim() !== '---') {
    throw new Error('File must start with a "---" frontmatter block');
  }
  const end = raw.findIndex((l, i) => i > 0 && l.trim() === '---');
  if (end === -1) throw new Error('Frontmatter block is not closed with "---"');

  const lines: Line[] = [];
  for (let i = 1; i < end; i++) {
    const text = stripComment(raw[i] ?? '').replace(/\t/g, '  ');
    if (text.trim() === '') continue;
    lines.push({ indent: text.length - text.trimStart().length, text: text.trim(), no: i + 1 });
  }
  if (lines.length > 0 && lines[0]!.indent !== 0) throw new Error(`Line ${lines[0]!.no}: unexpected indentation`);
  const [data, consumed] = lines.length ? parseMap(lines, 0, 0) : [{}, 0];
  if (consumed < lines.length) {
    const line = lines[consumed]!;
    throw new Error(`Line ${line.no}: cannot parse "${line.text}"`);
  }
  return { data, body: raw.slice(end + 1).join('\n'), line: 1 };
}
