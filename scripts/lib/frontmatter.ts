/**
 * A deliberately small YAML-subset frontmatter parser for the validator and
 * the weekly tooling, so the scripts need no dependencies beyond Astro.
 *
 * Supported (which is all our content uses):
 *   key: value            strings, "quoted strings", numbers, true/false
 *   key: [a, b, "c d"]    inline lists
 *   key:                  block lists
 *     - item
 *   # comments
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

function inlineList(raw: string): unknown[] {
  const inner = raw.trim().slice(1, -1).trim();
  if (inner === '') return [];
  const items: string[] = [];
  let current = '';
  let quote: string | null = null;
  for (const ch of inner) {
    if (quote) {
      current += ch;
      if (ch === quote) quote = null;
    } else if (ch === '"' || ch === "'") {
      quote = ch;
      current += ch;
    } else if (ch === ',') {
      items.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  items.push(current);
  return items.map(scalar);
}

export function parseFrontmatter(source: string): ParsedFile {
  const lines = source.split(/\r?\n/);
  if (lines[0]?.trim() !== '---') {
    throw new Error('File must start with a "---" frontmatter block');
  }
  const end = lines.findIndex((l, i) => i > 0 && l.trim() === '---');
  if (end === -1) throw new Error('Frontmatter block is not closed with "---"');

  const data: Frontmatter = {};
  let listKey: string | null = null;
  for (let i = 1; i < end; i++) {
    const line = lines[i] ?? '';
    if (line.trim() === '' || line.trim().startsWith('#')) continue;
    const listItem = /^\s+-\s*(.*)$/.exec(line);
    if (listItem && listKey) {
      (data[listKey] as unknown[]).push(scalar(listItem[1] ?? ''));
      continue;
    }
    const kv = /^([A-Za-z_][\w-]*):(.*)$/.exec(line);
    if (!kv) throw new Error(`Line ${i + 1}: cannot parse "${line}"`);
    const key = kv[1]!;
    const rest = (kv[2] ?? '').trim();
    listKey = null;
    if (rest === '') {
      data[key] = [];
      listKey = key;
    } else if (rest.startsWith('[') && rest.endsWith(']')) {
      data[key] = inlineList(rest);
    } else {
      data[key] = scalar(rest);
    }
  }
  return { data, body: lines.slice(end + 1).join('\n'), line: 1 };
}
