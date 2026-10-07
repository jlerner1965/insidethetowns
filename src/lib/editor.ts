/**
 * The person behind the guides, as the pages name them.
 *
 * The config may carry a placeholder in brackets ("[FULL NAME]") until the
 * owner supplies the real values; a placeholder is shown as written where a
 * reader would see it, so the gap is visible, and kept out of anything that
 * asserts a fact to a machine (the structured data's author).
 */
import { getNetworkHub, type EditorConfig } from '../config/index.ts';

/** "[FULL NAME]" and the like: a value the owner has not filled in yet. */
export function isPlaceholder(value: string | undefined): boolean {
  return !!value && /^\s*\[/.test(value);
}

/** The first name the check lines carry, or the placeholder for one. */
export function checkerName(editor: EditorConfig | undefined = getNetworkHub().editor): string | undefined {
  if (!editor?.name) return undefined;
  if (isPlaceholder(editor.name)) return '[FIRST NAME]';
  return editor.name.trim().split(/\s+/)[0];
}

/** "Checked by James, October 3, 2026", or "Checked October 3, 2026" with nobody configured. */
export function checkedBy(date: string, by: string | undefined = checkerName()): string {
  return by ? `Checked by ${by}, ${date}` : `Checked ${date}`;
}
