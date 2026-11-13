/**
 * The owner's checklist for the hub's town-anchored articles
 * (content/hub/curiosity/, src/lib/curiosity.ts): by article, its status,
 * the day its facts were last verified, and every flagged or empty field.
 * Reads only.
 *
 *   npm run curiosity              the list, as text
 *   npm run curiosity -- --md      the same as Markdown, for a pull request
 *
 * An article goes on the site when its flags are settled and its file says
 * `status: verified`. A flag is settled by filling the field from its
 * official source, or by deleting the flag and leaving the field out.
 */
import { dayKey } from '../src/lib/dates.ts';
import { articlePath, entriesOf, factsOf, lastVerified, openItems, reverifyDue } from '../src/lib/curiosity.ts';
import { curiosityFiles } from '../src/lib/curiosity-files.ts';

const md = process.argv.includes('--md');
const today = dayKey(new Date());
const files = curiosityFiles();
const lines: string[] = [];
let total = 0;
for (const f of files) {
  const a = f.article;
  if (!a) {
    lines.push(md ? `### ${f.file}\n` : f.file, ...f.issues.map((i) => `${md ? '- ' : '  '}does not pass the schema: ${i}`), '');
    continue;
  }
  const items = openItems(a);
  total += items.length;
  const head = `${a.title} (${a.status}; ${articlePath(a)})`;
  lines.push(md ? `### ${head}\n` : head);
  const meta = `${f.file} · ${entriesOf(a).length ? `${entriesOf(a).length} entries, ` : ''}${factsOf(a).length} sourced facts · last verified ${lastVerified(a)} · ${a.visited ? 'Visited' : 'Not personally visited'}`;
  lines.push(md ? `${meta}\n` : `  ${meta}`);
  if (a.reverify) lines.push(`${md ? '- ' : '  '}Read again from ${a.reverify.from}: ${a.reverify.why}${reverifyDue(a, today) ? ' (DUE)' : ''}`);
  if (items.length === 0) lines.push(`${md ? '- ' : '  '}Nothing flagged or empty.`);
  for (const i of items) {
    const where = i.entry ? `${i.entry}: ${i.field}` : 'Article';
    lines.push(`${md ? '- ' : '  '}${i.kind === 'empty' ? `EMPTY  ${where}` : `FLAG   ${where}: ${i.note}`}`);
  }
  lines.push('');
}
console.log(lines.join('\n'));
console.log(`${files.length} ${files.length === 1 ? 'article' : 'articles'}, ${files.filter((f) => f.article?.status === 'verified').length} verified, ${total} flagged or empty ${total === 1 ? 'field' : 'fields'}.`);
