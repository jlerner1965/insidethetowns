/**
 * The plain-text description builder (src/lib/plain-text.ts) and the event
 * structured data that uses it, with the event image choice (src/lib/seo.ts).
 * Audit of 26 October 2026: Event descriptions carried literal Markdown,
 * escaped formatting and URLs cut mid-link, and every event without a
 * picture of its own carried the town's scenery as its image.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { clampText, firstSentence, markdownToText } from '../src/lib/plain-text.ts';
import { eventDescription, eventImage, eventJsonLd, eventPageDescription, EVENT_DESCRIPTION_LIMIT, META_DESCRIPTION_LIMIT } from '../src/lib/seo.ts';

test('Markdown links keep their words and lose their URLs, whole or already cut short', () => {
  assert.equal(
    markdownToText('The schedule, as the [Left Hand Valley Courier](https://www.lhvc.com/story/2026/10/14/events/x/12649.html) reported it.'),
    'The schedule, as the Left Hand Valley Courier reported it.',
  );
  assert.equal(markdownToText('See [the page](https://example.com/a_(b) "Title") first.'), 'See the page first.');
  assert.equal(markdownToText('A [reference link][ref] here.\n\n[ref]: https://example.com'), 'A reference link here.');
  assert.equal(markdownToText('Mail <mailto:x@example.com> or <https://example.com>.'), 'Mail mailto:x@example.com or https://example.com.');
  assert.equal(markdownToText('as the [Left Hand Valley Courier](https://www.lhvc.com/story/202'), 'as the Left Hand Valley Courier', 'a link cut before its end');
  assert.equal(markdownToText('![A lot](lot.jpg) Park behind the hall.'), 'Park behind the hall.');
});

test('emphasis, code and HTML lose their marks; escaped characters are the characters', () => {
  assert.equal(markdownToText('on **Friday, October 23** and __Saturday__.'), 'on Friday, October 23 and Saturday.');
  assert.equal(markdownToText('an *italic* word, an _underscored_ one, ~~struck~~ and `code`.'), 'an italic word, an underscored one, struck and code.');
  assert.equal(markdownToText('snake_case_name and 2 * 3 stay as written.'), 'snake_case_name and 2 * 3 stay as written.');
  assert.equal(markdownToText('A \\*literal\\* star, \\_under\\_, \\[brackets\\] and 5 \\< 6.'), 'A *literal* star, _under_, [brackets] and 5 < 6.');
  assert.equal(markdownToText('Fish &amp; chips at 6&nbsp;pm &#8212; R&D &rsquo;s'), 'Fish & chips at 6 pm — R&D ’s');
  assert.equal(markdownToText('<p>Doors at <strong>6</strong>.<br>Show at 7.</p>'), 'Doors at 6. Show at 7.');
});

test('headings, list items and paragraphs become sentences; a soft-wrapped line does not', () => {
  assert.equal(
    markdownToText('## Schedule\n\n- **4 p.m.** Kids’ games\n- **6 p.m.** Costume parade\n\nWear something\nvisible after dark.'),
    'Schedule. 4 p.m. Kids’ games. 6 p.m. Costume parade. Wear something visible after dark.',
  );
  assert.equal(markdownToText('| Area | Dogs |\n| --- | --- |\n| Hall Ranch | No |'), 'Area, Dogs. Hall Ranch, No');
  assert.equal(markdownToText('```\ncode block\n```\nAfter.'), 'After.');
  assert.equal(markdownToText(undefined), '');
});

test('a series’ session links read as a day and a time, never as raw Markdown', () => {
  const body =
    'Stories, songs and movement for children at the Johnstown library, Mondays from 1 to 2 pm.\n\n' +
    '- [2026-10-12 at 13:00](https://example.org/event/8/2026-10-12/2/)\n' +
    '- [2026-11-02 at 10:30](https://example.org/event/11/2026-11-02/2/)\n' +
    '- [2026-12-08 at 17:00](https://example.org/calendar.aspx?EID=738)\n' +
    '- [2026-12-22 at 12:00](https://example.org/calendar.aspx?EID=774)';
  assert.equal(
    markdownToText(body),
    'Stories, songs and movement for children at the Johnstown library, Mondays from 1 to 2 pm. October 12 at 1 pm. November 2 at 10:30 am. December 8 at 5 pm. December 22 at noon',
  );
  assert.equal(eventDescription(body)!.includes('](') || eventDescription(body)!.includes('2026-'), false);
  assert.equal(markdownToText('[2026-13-40 at 99:00](u)'), '2026-13-40 at 99:00', 'not a date: the words as written');
});

test('firstSentence stops at the first real sentence end', () => {
  assert.equal(firstSentence('Meet at St. Vrain Market at 9 a.m. sharp. Then the walk.'), 'Meet at St. Vrain Market at 9 a.m. sharp.');
  assert.equal(firstSentence('No end here'), 'No end here');
  assert.equal(firstSentence('Ready?  Then go.'), 'Ready?');
});

test('an event page’s description keeps the body’s first sentence beside a long lead, within the budget', () => {
  const lead = 'Monday, November 2, 1 pm – 2 pm at Glenn A. Jones, M.D. Memorial Library, Johnstown.';
  const body = 'Stories, songs and movement for little ones, Monday afternoons at 1 at the Johnstown library, through November 30. The library also runs the session at 10 am.';
  const out = eventPageDescription(lead, body);
  assert.ok(out.length <= META_DESCRIPTION_LIMIT, out);
  assert.ok(out.startsWith(`${lead} Stories, songs and movement`), out);
  assert.match(out, /…$/, 'the sentence is cut at a word, not dropped');
  // A short lead and sentence fit whole; a trivial sentence is left off; a lead with no room stands alone.
  assert.equal(eventPageDescription('Tuesday, October 27, 6 pm at City Star Brewing, Berthoud.', 'Pub trivia every Tuesday evening in the **City Star** taproom. Free to play.'), 'Tuesday, October 27, 6 pm at City Star Brewing, Berthoud. Pub trivia every Tuesday evening in the City Star taproom.');
  assert.equal(eventPageDescription('Tuesday, October 27, 6 pm at City Star Brewing, Berthoud.', 'Pub trivia.'), 'Tuesday, October 27, 6 pm at City Star Brewing, Berthoud.');
  const huge = `Now through December 31, All day at ${'A very long venue name indeed '.repeat(5).trim()}, Berthoud.`;
  assert.equal(eventPageDescription(huge, body), clampText(huge, META_DESCRIPTION_LIMIT));
  assert.equal(eventPageDescription(lead, undefined), lead);
});

test('clampText cuts at a sentence past half the budget, else at a word, never inside one', () => {
  assert.equal(clampText('Short enough.', 50), 'Short enough.');
  assert.equal(clampText('One sentence that ends here. Then a second one that will not fit at all', 40), 'One sentence that ends here.');
  assert.equal(clampText('one two three four five six seven eight nine ten', 20), 'one two three four…');
  // The cut lands on the end of a word: the word stays.
  assert.equal(clampText('alpha beta gamma delta', 11), 'alpha beta…');
  // No dangling comma or opening bracket before the ellipsis.
  assert.equal(clampText('first, second, third fourth', 16), 'first, second…');
  assert.equal(clampText('first ( second', 9), 'first…');
  // An abbreviation is not the end of a sentence.
  assert.equal(clampText('Meet at St. Vrain Market for the walk to the river and back again', 40), 'Meet at St. Vrain Market for the walk…');
  for (const limit of [30, 57, 80, 155]) {
    const text = 'Halloween morning in Old Town, the Business Association’s annual party: its page lists Saturday, October 31 from 10 am to 1:30 pm, free and open to everyone.';
    const out = clampText(text, limit);
    assert.ok(out.length <= limit, `${limit}: ${out}`);
    const words = out.replace(/…$/, '').split(' ');
    for (const w of words) assert.ok(text.includes(w), `${limit}: “${w}” is a whole word of the text`);
  }
});

test('an Event’s description is the body as plain text, cut at a sentence or a word, never mid-link', () => {
  const town = { kind: 'town', name: 'Niwot', state: 'CO', domain: 'insideniwot.com' } as never;
  const body =
    'Halloween morning in Old Town, the Business Association’s annual party: its page lists Saturday, October 31 from 10 am to 1:30 pm, free and open to everyone.\n\n' +
    'The schedule, as the [Left Hand Valley Courier](https://www.lhvc.com/story/2026/10/14/events/the-great-pumpkin-party-returns-on-halloween/12649.html) reported it on October 14: trick-or-treating on **Second Avenue** from 10 am.';
  const data = { title: 'Niwot Great Pumpkin Party', start: new Date('2026-10-31T16:00:00Z'), end: new Date('2026-10-31T19:30:00Z'), venue: 'Old Town', category: 'family', allDay: false, featured: false, tags: [], status: 'scheduled' };
  const ld = eventJsonLd(town, { data, body } as never, 'https://insideniwot.com/events/great-pumpkin-party-2026/') as { description?: string; startDate: string; endDate?: string };
  assert.ok(ld.description);
  assert.ok(ld.description.length <= EVENT_DESCRIPTION_LIMIT);
  assert.doesNotMatch(ld.description, /\[|\]|\(http|https?:|\*\*|\\/, ld.description);
  assert.match(ld.description, /^Halloween morning in Old Town/);
  assert.equal(ld.startDate, '2026-10-31T10:00:00-06:00', 'Denver on daylight time');
  assert.equal(ld.endDate, '2026-10-31T13:30:00-06:00');
  const november = eventJsonLd(town, { data: { ...data, start: new Date('2026-11-07T17:00:00Z'), end: undefined }, body } as never, 'https://insideniwot.com/events/x/') as { startDate: string };
  assert.equal(november.startDate, '2026-11-07T10:00:00-07:00', 'standard time after 1 November');
  const empty = eventJsonLd(town, { data, body: '' } as never, 'https://insideniwot.com/events/x/');
  assert.equal('description' in empty, false, 'no words, no description');
  assert.equal(eventDescription('**Bold** only.'), 'Bold only.');
});

test('an Event’s image is its own, else its venue’s where the venue is a building, else none: never the town’s scenery', () => {
  const own = { src: '/own.jpg', width: 1600, height: 1067 };
  const photo = { src: '/venue.jpg', width: 1200, height: 800 };
  const small = { src: '/small.jpg', width: 640, height: 480 };
  const library = { type: 'venue', image: photo };
  assert.equal(eventImage(own, library), own, 'the listing’s own picture first');
  assert.equal(eventImage(undefined, library), photo, 'else the venue’s listing photograph: the library for storytime');
  assert.equal(eventImage(undefined, { type: 'bar', image: photo }), photo, 'the taproom for trivia');
  for (const type of ['park', 'trail', 'trailhead']) {
    assert.equal(eventImage(undefined, { type, image: photo }), undefined, `a ${type}’s photograph is landscape, not the event`);
  }
  assert.equal(eventImage(undefined, { type: 'venue' }), undefined, 'a venue without a photograph gives none');
  assert.equal(eventImage(undefined, undefined), undefined, 'no listing, no picture: no fallback to the town’s hero');
  assert.equal(eventImage(small, library), photo, 'an own picture under Google’s 720px floor gives way to the venue’s');
  assert.equal(eventImage(small, undefined), undefined, 'and is not sent on its own');

  const town = { kind: 'town', name: 'Berthoud', state: 'CO', domain: 'insideberthoud.com' } as never;
  const data = { title: 'Trivia', start: new Date('2026-10-27T00:00:00Z'), venue: 'City Star Brewing', category: 'food-drink', allDay: false, featured: false, tags: [], status: 'scheduled' };
  const none = eventJsonLd(town, { data, body: 'Pub trivia.' } as never, 'https://insideberthoud.com/events/trivia/');
  assert.equal('image' in none, false, 'no image property when there is no picture');
  const withImage = eventJsonLd(town, { data, body: 'Pub trivia.' } as never, 'https://insideberthoud.com/events/trivia/', 'https://insideberthoud.com/_astro/venue.jpg') as { image?: string[] };
  assert.deepEqual(withImage.image, ['https://insideberthoud.com/_astro/venue.jpg']);
});
