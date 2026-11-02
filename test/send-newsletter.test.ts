/**
 * The Thursday send (scripts/lib/send-newsletter.ts): who an issue goes to,
 * that an audience is never empty (Buttondown reads an empty filter as every
 * subscriber), when an issue is too late to send, and the body Buttondown is
 * given.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { audience, emailBody, recipientTags, sendable } from '../scripts/lib/send-newsletter.ts';
import { towns } from '../src/config/towns/registry.ts';

test('an edition goes to its towns and to the towns folded into them', () => {
  assert.deepEqual(recipientTags(['windsor', 'timnath'], towns, 'all-towns').sort(), ['severance', 'timnath', 'windsor']);
  // Fort Lupton rode on Carbon Valley's edition until both were retired on 2 November 2026; Frederick's goes to Frederick alone.
  assert.deepEqual(recipientTags(['frederick'], towns, 'all-towns'), ['frederick']);
  assert.deepEqual(recipientTags(['lyons'], towns, 'all-towns'), ['lyons']);
});

test('the network issue goes to the all-towns tag, not to everyone', () => {
  assert.deepEqual(recipientTags([], towns, 'all-towns'), ['all-towns']);
});

test('an audience is anyone with any of the tags, and never empty', () => {
  assert.deepEqual(audience(['tag_a', 'tag_b']), {
    filters: [
      { field: 'subscriber.tags', operator: 'contains', value: 'tag_a' },
      { field: 'subscriber.tags', operator: 'contains', value: 'tag_b' },
    ],
    groups: [],
    predicate: 'or',
  });
  assert.throws(() => audience([]), /every subscriber/);
});

test('an issue goes out on its day or the day after, never early or once its weekend has started', () => {
  assert.equal(sendable('2026-10-22', '2026-10-22'), true);
  assert.equal(sendable('2026-10-22', '2026-10-23'), true);
  assert.equal(sendable('2026-10-22', '2026-10-24'), false);
  assert.equal(sendable('2026-10-22', '2026-10-21'), false);
  assert.equal(sendable('2026-10-31', '2026-11-01'), true);
});

test('the body is the Markdown after the frontmatter, marked as Markdown', () => {
  assert.equal(emailBody('\n**Lyons** · October 22\n'), '<!-- buttondown-editor-mode: plaintext -->\n**Lyons** · October 22\n');
});
