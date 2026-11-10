/**
 * The plain-text description builder (src/lib/plain-text.ts) and the event
 * structured data that uses it, with the event image choice (src/lib/seo.ts).
 * Audit of 26 October 2026: Event descriptions carried literal Markdown,
 * escaped formatting and URLs cut mid-link, and every event without a
 * picture of its own carried the town's scenery as its image.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { addFirstFitting, clampAtWord, clampText, firstSentence, listWords, markdownToText, sentences } from '../src/lib/plain-text.ts';
import { eventDescription, eventImage, eventJsonLd, eventMetaDescription, eventPageDescription, EVENT_DESCRIPTION_LIMIT, excerptDescription, fillDescription, listDescription, META_DESCRIPTION_LIMIT, META_DESCRIPTION_MIN, placeDescription, topUpDescription } from '../src/lib/seo.ts';

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

/*
 * Bing Webmaster Tools, 5 November 2026, on Berthoud: "Meta descriptions on
 * many pages are too short." 33 of its 138 indexable pages were under 110
 * characters, most of them place pages carrying a one-line summary.
 */
test('a short description takes one more whole sentence, the first that fits; a long enough one is left alone', () => {
  assert.equal(addFirstFitting('Short', ['Too long for the budget at all.', 'Fits.'], 14), 'Short. Fits.', 'a full stop first, then the first extra that fits');
  assert.equal(addFirstFitting('Short.', ['Too long for this.'], 10), 'Short.', 'nothing fits: the base alone');
  assert.equal(listWords(['a']), 'a');
  assert.equal(listWords(['a', 'b', 'c']), 'a, b and c');
  const long = 'x'.repeat(META_DESCRIPTION_MIN) + '.';
  assert.equal(fillDescription(long, ['More.']), long, 'at the minimum already: nothing added');
  assert.equal(fillDescription('A short line.', ['More here.']), 'A short line. More here.');
});

test('a place page is one sentence that leads with the hours and promises only what the page shows', () => {
  // Rewritten 6 November 2026 (the Berthoud owner's brief): the summary and
  // then a list ("Aussie’s Poke Pitstop in Berthoud, CO: address, hours,
  // phone and directions.") was two fragments with the hours nowhere.
  const town = { name: 'Berthoud', state: 'CO' };
  const summary = 'Poke bowls and quick healthy lunches on Mountain Avenue, order at the counter.';
  const full = placeDescription({ title: 'Aussie’s Poke Pitstop', summary, address: '1 Main St', phone: '970', url: 'https://x', hoursShown: true, hours: 'Mon–Sat 11–8; closed Sun' }, town);
  assert.equal(full, 'Aussie’s Poke Pitstop in Berthoud, CO is open Mon–Sat 11 am–8 pm, closed Sun, with the address, phone, website and directions on this page.');
  assert.ok(full.length >= META_DESCRIPTION_MIN && full.length <= META_DESCRIPTION_LIMIT, String(full.length));
  // The menu, the pool schedule and the prices come before the address; a long hours line keeps fewer of them.
  const menu = placeDescription({ title: 'Happy Eating Asian Cafe', summary, address: 'x', phone: 'x', hoursShown: true, hours: 'Mon, Wed 10:30 am–9:30 pm; Thu–Sun 10:30 am–10:30 pm; closed Tue', menu: true }, town);
  assert.equal(menu, 'Happy Eating Asian Cafe in Berthoud, CO is open Mon, Wed 10:30 am–9:30 pm, Thu–Sun 10:30 am–10:30 pm, closed Tue, with the menu on this page.');
  // A name that carries the town is not placed in it again.
  const rec = placeDescription({ title: 'Berthoud Recreation Center', summary, address: 'x', phone: 'x', url: 'x', hoursShown: true, hours: 'Mon–Fri 5 am–9 pm, Sat 7–8, Sun 11–8', poolSchedule: true, dayPassPrices: true }, town);
  assert.equal(rec, 'Berthoud Recreation Center is open Mon–Fri 5 am–9 pm, Sat 7 am–8 pm, Sun 11 am–8 pm, with the pool schedule, day pass prices and the address on this page.');
  // Hours hidden for age or season are not promised, nor stated; a closed place says so first.
  const stale = placeDescription({ title: 'A&W', summary: 'Root beer floats.', address: '1 Main St', phone: '970', url: 'https://x', hoursShown: false, hours: 'Mon–Sun 11–8' }, town);
  assert.equal(stale, 'A&W in Berthoud, CO is listed here, with the address, phone, website and directions on this page.');
  const closed = placeDescription({ title: 'B-Rad’s Arcade', summary: 'Retro arcade.', status: 'Temporarily closed', address: '1 Main St', hoursShown: false }, town);
  assert.equal(closed, 'B-Rad’s Arcade in Berthoud, CO is temporarily closed; this page keeps the address and what is known about it.');
});

test('a shortened place description never joins across the town-and-state comma', () => {
  // "Old Town Square in Fort Collins and CO is the pedestrian plaza": sixteen live pages (10 November 2026).
  const fc = { name: 'Fort Collins', state: 'CO' };
  const out = placeDescription(
    { title: 'Old Town Square', summary: 'The pedestrian plaza at the heart of Old Town, a stage, fountains, patios, shops, restaurants on three sides, a summer concert series on Friday nights and the holiday lights from November to February.', address: 'x', url: 'x', hoursShown: false },
    fc,
  );
  assert.match(out, /^Old Town Square in Fort Collins, CO is the pedestrian plaza/);
  assert.doesNotMatch(out, / and CO /);
  assert.ok(out.length <= META_DESCRIPTION_LIMIT);
});

test('a place with no hours says what is there, from the summary’s own "with" clause or its opening article', () => {
  const town = { name: 'Berthoud', state: 'CO' };
  const park = placeDescription({ title: 'Pioneer Park', summary: 'Neighborhood park on Indiana Avenue with a playground, a basketball court, a roller hockey rink, a fishing pond and three large picnic pavilions.', address: 'x', url: 'x', hoursShown: false }, town);
  assert.equal(park, 'Pioneer Park in Berthoud, CO has a playground, a basketball court, a roller hockey rink, a fishing pond and three large picnic pavilions.');
  // A list too long for the budget loses its last items at a comma and stays a whole sentence; never an ellipsis.
  const bike = placeDescription({ title: 'Berthoud Bike Park', summary: '20-acre bike park with two jump and flow lines, a dual-slalom track, a mile of cross-country trail, a kids’ bicycle playground and a 20,000 sq ft pump track. Dawn to dusk, free.', address: 'x', url: 'x', hoursShown: false }, town);
  assert.equal(bike, 'Berthoud Bike Park has two jump and flow lines, a dual-slalom track and a mile of cross-country trail, with the address and website on this page.');
  const big = placeDescription({ title: 'Waggener Farm Park', summary: 'The big park on the north side: farm-themed playground, full basketball court, skate park, fields, and the Recreation Center on the same site.', address: 'x', url: 'x', hoursShown: false }, town);
  assert.equal(big, 'Waggener Farm Park in Berthoud, CO is the big park on the north side: farm-themed playground, full basketball court, skate park and fields.');
  // Rock Cut Brewing, Estes Park: once cut to its first sentence and never filled (all-sites check, 5 November 2026); now its hours lead.
  const out = placeDescription({ title: 'Rock Cut Brewing Company', summary: 'Brewery and taproom at the foot of Prospect Mountain, an easy walk from downtown.', address: 'x', phone: 'x', url: 'x', hoursShown: true, hours: 'Daily noon–9' }, { name: 'Estes Park', state: 'CO' });
  assert.equal(out, 'Rock Cut Brewing Company in Estes Park, CO is open Daily noon–9 pm, with the address, phone, website and directions on this page.');
  for (const d of [park, bike, big, out]) assert.ok(d.length <= META_DESCRIPTION_LIMIT && /\.$/.test(d) && !d.includes('…'), d);
  // Sentences that add up, each only while still short and only where it fits.
  assert.equal(topUpDescription('Short.', ['One more.', 'x'.repeat(200), 'Last.']), 'Short. One more. Last.');
});

test('an event with no words of its own says what it is and what the page offers', () => {
  const lead = 'Friday, November 27, 9 pm at Aggie Theatre, Fort Collins.';
  const bare = eventMetaDescription({ title: '2000s Rave', lead, body: '', directions: true, calendar: true });
  assert.equal(bare, `${lead} 2000s Rave. Directions, and a link to add it to your calendar.`);
  assert.ok(bare.length >= META_DESCRIPTION_MIN && bare.length <= META_DESCRIPTION_LIMIT, String(bare.length));
  // Called off: no calendar link is promised; the name is not said twice.
  const off = eventMetaDescription({ title: 'Shadow Puppetry Workshop', lead: `Canceled. ${lead}`, body: 'A Shadow Puppetry Workshop for families.', directions: false, calendar: false });
  assert.equal(off, `Canceled. ${lead} A Shadow Puppetry Workshop for families. Checked against its source.`);
  // The body's second sentence comes before anything generic.
  const two = eventMetaDescription({ title: 'Trivia', lead, body: 'Pub trivia in the taproom every Monday at six. Teams of up to six play for a bar tab.', directions: true, calendar: true });
  assert.equal(two, `${lead} Pub trivia in the taproom every Monday at six. Teams of up to six play for a bar tab.`);
  // A name that leaves no room for the longer line takes the shorter one.
  const saturday = 'Saturday, November 21, 9 pm at Aggie Theatre, Fort Collins.';
  const latin = eventMetaDescription({ title: 'Latin Night', lead: saturday, body: 'A Latin dance night at the Aggie.', directions: true, calendar: true });
  assert.equal(latin, `${saturday} A Latin dance night at the Aggie. Latin Night. Add it to your calendar.`);
  // Nothing of its own, and the lead leaves no room for the calendar line: the one thing true of every listing.
  const thin = eventMetaDescription({ title: 'Twin Fin', lead: 'Thursday, January 21, 8 pm at Aggie Theatre, Fort Collins.', body: '', directions: true, calendar: true });
  assert.equal(thin, 'Thursday, January 21, 8 pm at Aggie Theatre, Fort Collins. Twin Fin. Directions, and a link to add it to your calendar. Checked against its source.');
  assert.ok(thin.length >= META_DESCRIPTION_MIN && thin.length <= META_DESCRIPTION_LIMIT, String(thin.length));
  // A description already long enough is the one the page always had.
  const long = 'Saturday, December 5, 9 am – 3 pm at Berthoud Recreation Center, Berthoud. The fair fills the gym with sixty makers, a bake sale and a visit from Santa at noon.';
  assert.equal(eventMetaDescription({ title: 'Winter Craft Fair', lead: long.slice(0, 74), body: long.slice(75), directions: true, calendar: true }), eventPageDescription(long.slice(0, 74), long.slice(75)));
});

test('a list page adds as many of its names as fit', () => {
  const base = '3 trails in and around Berthoud, CO: where each one starts, what it is like and who looks after it.';
  const out = listDescription(base, ['Pelican Trail', 'Lake Loop', 'A Name So Long It Will Not Fit Alongside The Others At All']);
  assert.equal(out, `${base} Including Pelican Trail and Lake Loop.`);
  assert.ok(out.length <= META_DESCRIPTION_LIMIT);
  // A first name too long to fit is skipped, not the end of the list.
  assert.equal(listDescription(base, ['A Name So Long It Will Not Fit Alongside The Base At All', 'Lake Loop']), `${base} Including Lake Loop.`);
});

test('an excerpt is cut at whole sentences as they fit, and at a word only when the sentences leave it short', () => {
  assert.deepEqual(sentences('One here. Two, with St. Vrain in it. Three'), ['One here.', 'Two, with St. Vrain in it.', 'Three']);
  assert.equal(clampAtWord('alpha beta gamma delta', 12), 'alpha beta…');
  // McIntosh versus Union, Longmont: cut to its first sentence, 84 characters, when the second did not fit (all-sites check, 5 November 2026).
  const two = 'McIntosh Lake is free, has a 3.5-mile loop and takes carry-in boats but no swimmers. Union Reservoir charges $10 a vehicle, allows wakeless boating, has a year-round dog beach and closes the water December 1 to February 28.';
  const out = excerptDescription(two);
  assert.ok(out.endsWith('…') && out.length >= META_DESCRIPTION_MIN && out.length <= META_DESCRIPTION_LIMIT, out);
  assert.ok(out.startsWith('McIntosh Lake is free, has a 3.5-mile loop and takes carry-in boats but no swimmers. Union Reservoir charges'), out);
  // Two sentences that fit together are used whole, and a third that does not is left off.
  const three = 'Longmont has two lakes you can put a boat on, and the City runs them differently. One is free and one charges at the gate. The third sentence is long enough that it will not fit inside the budget beside the other two.';
  assert.equal(excerptDescription(three), 'Longmont has two lakes you can put a boat on, and the City runs them differently. One is free and one charges at the gate.');
  // An excerpt within the snippet is used whole, short or not.
  assert.equal(excerptDescription('Short and whole.'), 'Short and whole.');
  // A single sentence over the budget is cut at a word.
  assert.equal(excerptDescription('word '.repeat(40).trim(), 24), 'word word word word…');
});
