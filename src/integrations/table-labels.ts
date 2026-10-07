/**
 * A Sätteri hast plugin that gives every body cell of a markdown table its
 * column's name, as data-label. On a phone `.prose` sets each table row out
 * as a card (src/styles/global.css), and the label is what tells a reader
 * that "Agenda Center" is the official page and not the authority. A table
 * without a header row is left alone.
 */
import type { SatteriProcessorOptions } from '@astrojs/markdown-satteri';

type HastPluginDefinition = NonNullable<SatteriProcessorOptions['hastPlugins']>[number];

type Node = { type: string; tagName?: string; value?: string; children?: Node[] };

const text = (n: Node): string => (n.type === 'text' ? n.value ?? '' : (n.children ?? []).map(text).join(''));
/** Descendant elements with this tag, not looking inside a nested table. */
const elements = (n: Node, tag: string): Node[] => {
  const out: Node[] = [];
  for (const c of n.children ?? []) {
    if (c.type !== 'element') continue;
    if (c.tagName === tag) out.push(c);
    else if (c.tagName !== 'table') out.push(...elements(c, tag));
  }
  return out;
};

export const tableLabels: HastPluginDefinition = {
  name: 'table-labels',
  element: {
    filter: ['table'],
    visit(table, ctx) {
      const head = elements(table as Node, 'thead')[0];
      const names = head ? elements(head, 'th').map((th) => text(th).trim()) : [];
      if (names.every((n) => !n)) return;
      for (const body of elements(table as Node, 'tbody')) {
        for (const row of elements(body, 'tr')) {
          const cells = (row.children ?? []).filter((c) => c.type === 'element' && (c.tagName === 'td' || c.tagName === 'th'));
          cells.forEach((cell, i) => {
            if (names[i]) ctx.setProperty(cell as never, 'dataLabel', names[i]);
          });
        }
      }
    },
  },
};
