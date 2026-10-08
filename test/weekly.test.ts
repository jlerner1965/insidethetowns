/**
 * "This week in [Town]": which notes file is current, which New & closed
 * items still show, and which listings count as this weekend's. Every case
 * is one a reader would notice: last week's opening still up a month on, a
 * market listed at 3 pm that packed up at 1, a pick from a file dated for
 * next Monday.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { dayKey, parseLocal } from '../src/lib/dates.ts';
import { occurrences } from '../src/lib/events.ts';
import { activeChanges, currentNotes, currentPick, hasEnded, isWeekend, pickSlug, upcomingEvents, weekEvents, weekWindow, weekendEvents } from '../src/lib/weekly.ts';

const at = (s: string) => parseLocal(s);

function notes(weekOf: string, pick?: { title?: string; body?: string; url?: string }, changes: Array<Record<string, unknown>> = []) {
  return {
    data: {
      weekOf: at(weekOf),
      pick: pick ? { title: pick.title || undefined, body: pick.body, url: pick.url } : undefined,
      changes: changes.map((c) => ({
        tag: c.tag as never,
        name: String(c.name ?? 'Place'),
        detail: String(c.detail ?? 'Detail'),
        source: c.source as string | undefined,
        checked: at(String(c.checked ?? '2026-10-13')),
        expires: c.expires ? at(String(c.expires)) : undefined,
      })),
    },
  };
}

function ev(title: string, start: string, end?: string, extra: Record<string, unknown> = {}) {
  return { slug: title.toLowerCase().replace(/\W+/g, '-'), data: { title, start: at(start), end: end ? at(end) : undefined, allDay: false, ...extra } };
}

// ----------------------------------------------------------------- the week

test('this week runs Monday to Sunday in Denver, from any day of it', () => {
  for (const day of ['2026-10-12T00:30', '2026-10-14T12:00', '2026-10-18T23:30']) {
    const { monday, sunday } = weekWindow(at(day));
    assert.equal(monday.getTime(), at('2026-10-12').getTime(), day);
    assert.equal(sunday.getTime(), at('2026-10-18').getTime(), day);
  }
  assert.equal(weekWindow(at('2026-10-19T06:00')).monday.getTime(), at('2026-10-19').getTime());
});

// ----------------------------------------------------------------- the pick

test('the current file is the latest weekOf on or before today; a file for next week waits', () => {
  const files = [notes('2026-10-05', { title: 'Last week' }), notes('2026-10-12', { title: 'This week' }), notes('2026-10-19', { title: 'Next week' })];
  assert.equal(currentNotes(files, at('2026-10-14'))?.data.pick?.title, 'This week');
  assert.equal(currentNotes(files, at('2026-10-12T00:10'))?.data.pick?.title, 'This week', 'from the first minute of Monday');
  assert.equal(currentNotes(files, at('2026-10-11T23:50'))?.data.pick?.title, 'Last week');
  assert.equal(currentNotes(files, at('2026-10-01')), undefined);
});

const listing = (slug: string) => `https://insideberthoud.com/events/${slug}/`;

test('the pick comes only from the current week, and a blank title is no pick', () => {
  const events = [ev('Old pick', '2026-10-09T19:00'), ev('New pick', '2026-10-15T19:00')];
  const files = [notes('2026-10-05', { title: 'Old pick', body: 'b', url: listing('old-pick') }), notes('2026-10-12', { title: '', url: listing('new-pick') })];
  assert.deepEqual(currentPick(files, events, at('2026-10-14')), {}, 'last week’s pick does not carry over');
  assert.equal(currentPick(files, events, at('2026-10-07')).thisWeek?.title, 'Old pick');
  assert.equal(currentPick(files, events, at('2026-10-07')).thisWeek?.body, 'b');
  assert.deepEqual(currentPick([], events, at('2026-10-14')), {}, 'no file at all');
});

test('a file that failed its schema is skipped, not read', () => {
  const files = [{ data: { excluded: true as const } }, notes('2026-10-12', { title: 'Good', url: listing('good') })];
  assert.equal(currentPick(files, [ev('Good', '2026-10-16T19:00')], at('2026-10-14')).thisWeek?.title, 'Good');
});

test('a pick dated after the week is not this week’s pick; it is coming up, with its own date', () => {
  // The October 5–11 home pages picked Berthoud’s talk on the 13th, Carbon
  // Valley’s and Elizabeth’s Saturdays on the 17th and Niwot’s open house on
  // the 16th, all under the heading “October 5–11”.
  const events = [
    ev('Speaker night', '2026-10-13T19:00'),
    ev('Frights on Fifth', '2026-10-17T15:00', '2026-10-17T17:00'),
    ev('Open house', '2026-10-16T16:00', '2026-10-16T19:00'),
  ];
  for (const [slug, day] of [['speaker-night', '2026-10-13'], ['frights-on-fifth', '2026-10-17'], ['open-house', '2026-10-16']] as const) {
    const files = [notes('2026-10-05', { title: slug, url: listing(slug) })];
    for (const now of ['2026-10-05T08:00', '2026-10-07T23:00', '2026-10-11T23:59']) {
      const { thisWeek, comingUp } = currentPick(files, events, at(now));
      assert.equal(thisWeek, undefined, `${slug} is not the pick for October 5–11 (at ${now})`);
      assert.equal(comingUp?.event.data.start && dayKey(comingUp.event.data.start), day, `${slug} is coming up on its real date`);
    }
    // The same file read in the listing's own week: now it is the pick.
    const { thisWeek } = currentPick(files, events, at('2026-10-12T09:00'));
    assert.equal(thisWeek && dayKey(thisWeek.event.data.start), day, `${slug} is the pick in its own week`);
  }
});

test('every pick shown falls inside its heading’s week, Monday 00:00 to the next Monday 00:00, end excluded', () => {
  const events = [
    ev('Sunday late', '2026-10-11T23:00', '2026-10-11T23:30'),
    ev('Next Monday midnight', '2026-10-12T00:00'),
    ev('Last Sunday', '2026-10-04T18:00'),
  ];
  const pickOf = (slug: string, now: string) => currentPick([notes('2026-10-05', { title: slug, url: listing(slug) })], events, at(now));
  assert.equal(pickOf('sunday-late', '2026-10-11T22:00').thisWeek?.title, 'sunday-late');
  assert.equal(pickOf('next-monday-midnight', '2026-10-11T22:00').thisWeek, undefined, 'the next Monday’s first minute is next week');
  assert.ok(pickOf('next-monday-midnight', '2026-10-11T22:00').comingUp);
  assert.deepEqual(pickOf('last-sunday', '2026-10-06T09:00'), {}, 'a pick from before the week is neither');
});

test('in a week with no events, a later pick does not fill the week', () => {
  const events = [ev('Next month', '2026-11-07T10:00')];
  const files = [notes('2026-10-05', { title: 'Next month', url: listing('next-month') })];
  const now = at('2026-10-07T12:00');
  assert.deepEqual(weekEvents(events, now), [], 'nothing on this week');
  assert.equal(currentPick(files, events, now).thisWeek, undefined, 'and no pick under its heading');
});

test('a pick whose listing has ended, been called off or cannot be found is not shown', () => {
  const events = [
    ev('Tuesday talk', '2026-10-06T19:00', '2026-10-06T20:30'),
    ev('Called off', '2026-10-09T19:00', undefined, { status: 'canceled' }),
  ];
  const pickOf = (pick: { title: string; url?: string }) => currentPick([notes('2026-10-05', pick)], events, at('2026-10-08T12:00'));
  assert.deepEqual(pickOf({ title: 'Tuesday talk', url: listing('tuesday-talk') }), {}, 'over by Thursday');
  assert.deepEqual(pickOf({ title: 'Called off', url: listing('called-off') }), {});
  assert.deepEqual(pickOf({ title: 'No link' }), {}, 'nothing to date it by');
  assert.deepEqual(pickOf({ title: 'Elsewhere', url: 'https://example.org/whatever/' }), {});
  assert.deepEqual(pickOf({ title: 'Missing', url: listing('not-a-listing') }), {});
});

test('a weekly regular picked is found on its day this week', () => {
  const trivia = { ...ev('Trivia', '2026-09-03T19:00', '2026-09-03T21:00'), data: { ...ev('Trivia', '2026-09-03T19:00', '2026-09-03T21:00').data, repeat: 'weekly' as const, until: at('2026-12-17') } };
  const now = at('2026-10-06T12:00');
  const { thisWeek } = currentPick([notes('2026-10-05', { title: 'Trivia', url: listing('trivia') })], occurrences([trivia], { now, horizonDays: 30 }), now);
  assert.equal(thisWeek?.event.data.start.getTime(), at('2026-10-08T19:00').getTime());
});

test('the URL a pick links to names its listing', () => {
  assert.equal(pickSlug('https://insideniwot.com/events/open-house-2026-10-16/'), 'open-house-2026-10-16');
  assert.equal(pickSlug('https://insideniwot.com/events/open-house-2026-10-16'), 'open-house-2026-10-16');
  assert.equal(pickSlug('https://insideniwot.com/places/niwot-tavern/'), undefined);
  assert.equal(pickSlug(undefined), undefined);
});

test('across every town’s notes, a pick shown as this week’s is on inside that week', async () => {
  // Over the real files: each notes file, read on every day of its week, morning and night.
  const { readdirSync, readFileSync, existsSync } = await import('node:fs');
  const { join } = await import('node:path');
  const { z } = await import('astro/zod');
  const { eventSchema, weeklySchema } = await import('../src/content/schemas.ts');
  const { parseFrontmatter } = await import('../scripts/lib/frontmatter.ts');
  const { listedUntil } = await import('../src/lib/events.ts');
  const read = (dir: string) => (existsSync(dir) ? readdirSync(dir).filter((f) => f.endsWith('.md') && !f.startsWith('_')) : []);
  let checked = 0;
  for (const town of readdirSync('content')) {
    const files = read(join('content', town, 'weekly')).flatMap((f) => {
      const parsed = weeklySchema().safeParse(parseFrontmatter(readFileSync(join('content', town, 'weekly', f), 'utf8')).data);
      return parsed.success ? [{ data: parsed.data }] : [];
    });
    if (files.length === 0) continue;
    const events = read(join('content', town, 'events')).flatMap((f) => {
      const parsed = eventSchema(() => z.string()).safeParse(parseFrontmatter(readFileSync(join('content', town, 'events', f), 'utf8')).data);
      return parsed.success ? [{ slug: parsed.data.slug ?? f.slice(0, -3), data: parsed.data }] : [];
    });
    for (const file of files) {
      for (let d = 0; d < 7; d++) {
        for (const time of ['T00:00', 'T08:00', 'T23:59']) {
          const now = at(dayKey(new Date(file.data.weekOf.getTime() + (d * 24 + 12) * 3_600_000)) + time);
          const { monday, end } = weekWindow(now);
          const { thisWeek, comingUp } = currentPick(files, occurrences(events as never[], { now, horizonDays: 30 }) as typeof events, now);
          if (thisWeek) {
            checked++;
            assert.ok(thisWeek.event.data.start.getTime() < end.getTime(), `${town}: pick starts inside the week at ${now.toISOString()}`);
            assert.ok(listedUntil(thisWeek.event).getTime() > monday.getTime(), `${town}: pick is on inside the week`);
          }
          if (comingUp) assert.ok(comingUp.event.data.start.getTime() >= end.getTime(), `${town}: a coming-up pick is after the week`);
        }
      }
    }
  }
  assert.ok(checked > 0, 'at least one real pick was checked');
});

// ---------------------------------------------------------- new and closed

test('every unexpired item from any week shows, newest check first', () => {
  const files = [
    notes('2026-10-05', undefined, [{ tag: 'closed', name: 'Old café', source: 'https://x.test/', checked: '2026-10-06' }]),
    notes('2026-10-12', undefined, [{ tag: 'opening', name: 'New bar', source: 'https://x.test/', checked: '2026-10-13' }]),
  ];
  assert.deepEqual(activeChanges(files, at('2026-10-14')).map((c) => c.name), ['New bar', 'Old café']);
});

test('an item hides after its expires date, by default 14 days after its file’s weekOf', () => {
  const files = [
    notes('2026-10-05', undefined, [
      { tag: 'closed', name: 'Default expiry', source: 'https://x.test/' },
      { tag: 'closed', name: 'Own expiry', source: 'https://x.test/', expires: '2026-10-15' },
    ]),
  ];
  const names = (day: string) => activeChanges(files, at(day)).map((c) => c.name);
  assert.deepEqual(names('2026-10-15T23:00'), ['Default expiry', 'Own expiry'], 'shows through the expires day itself');
  assert.deepEqual(names('2026-10-16'), ['Default expiry']);
  assert.deepEqual(names('2026-10-19T23:59'), ['Default expiry'], 'weekOf + 14 is October 19');
  assert.deepEqual(names('2026-10-20'), []);
});

test('an opening, closing, new-hours or move with no source is skipped; a guide addition needs none', () => {
  const files = [
    notes('2026-10-12', undefined, [
      { tag: 'opening', name: 'Unsourced opening' },
      { tag: 'new-hours', name: 'Unsourced hours' },
      { tag: 'moved', name: 'Sourced move', source: 'https://x.test/' },
      { tag: 'added-to-guide', name: 'Guide addition' },
    ]),
  ];
  assert.deepEqual(activeChanges(files, at('2026-10-14')).map((c) => c.name), ['Sourced move', 'Guide addition']);
});

test('added-to-guide is never labelled as an opening', () => {
  const files = [notes('2026-10-12', undefined, [{ tag: 'added-to-guide', name: 'Guide addition' }, { tag: 'opening', name: 'Opening', source: 'https://x.test/' }])];
  const labels = Object.fromEntries(activeChanges(files, at('2026-10-14')).map((c) => [c.name, c.label]));
  assert.equal(labels['Guide addition'], 'Added to the guide');
  assert.equal(labels['Opening'], 'Opening');
});

// ----------------------------------------------------------------- events

test('an event has ended once its end time has passed, or at midnight when it has none', () => {
  const timed = ev('Market', '2026-10-17T09:00', '2026-10-17T13:00');
  assert.equal(hasEnded(timed, at('2026-10-17T12:59')), false);
  assert.equal(hasEnded(timed, at('2026-10-17T13:00')), true, 'gone the minute it ends, not at midnight');
  const open = ev('Talk', '2026-10-17T19:00');
  assert.equal(hasEnded(open, at('2026-10-17T19:00')), false, 'on while it is on');
  assert.equal(hasEnded(open, at('2026-10-17T23:59')), false);
  assert.equal(hasEnded(open, at('2026-10-18T00:00')), true, 'gone at the next midnight');
  const allDay = { ...ev('Fair', '2026-10-17'), data: { ...ev('Fair', '2026-10-17').data, allDay: true } };
  assert.equal(hasEnded(allDay, at('2026-10-17T23:59')), false, 'an all-day listing is on all day');
  assert.equal(hasEnded(allDay, at('2026-10-18T00:00')), true);
});

test('this weekend is Friday to Sunday, with a run that began earlier and is still on; nothing ended or canceled', () => {
  const events = [
    ev('Thursday thing', '2026-10-15T19:00', '2026-10-15T21:00'),
    ev('Friday show', '2026-10-16T19:30'),
    ev('Saturday market', '2026-10-17T09:00', '2026-10-17T13:00'),
    ev('Sunday walk', '2026-10-18T10:00'),
    ev('Monday meeting', '2026-10-19T18:00'),
    ev('Corn maze', '2026-09-25', '2026-10-31', { allDay: true }),
    ev('Called off', '2026-10-17T15:00', undefined, { status: 'canceled' }),
  ];
  assert.deepEqual(weekendEvents(events, at('2026-10-14T12:00')).map((e) => e.data.title), ['Corn maze', 'Friday show', 'Saturday market', 'Sunday walk']);
  assert.deepEqual(weekendEvents(events, at('2026-10-17T14:00')).map((e) => e.data.title), ['Corn maze', 'Sunday walk'], 'on Saturday afternoon the market has ended');
});

test('the rest of the week runs from today to Sunday, so a Wednesday is not told the week is quiet', () => {
  const events = [
    ev('Tuesday talk', '2026-10-13T19:00', '2026-10-13T21:00'),
    ev('Wednesday storytime', '2026-10-14T10:00', '2026-10-14T10:30'),
    ev('Thursday trivia', '2026-10-15T19:00', '2026-10-15T21:00'),
    ev('Saturday market', '2026-10-17T09:00', '2026-10-17T13:00'),
    ev('Monday meeting', '2026-10-19T18:00'),
    ev('Corn maze', '2026-09-25', '2026-10-31', { allDay: true }),
  ];
  assert.deepEqual(weekEvents(events, at('2026-10-14T08:00')).map((e) => e.data.title), ['Corn maze', 'Wednesday storytime', 'Thursday trivia', 'Saturday market']);
  assert.deepEqual(weekEvents(events, at('2026-10-14T12:00')).map((e) => e.data.title), ['Corn maze', 'Thursday trivia', 'Saturday market'], 'the storytime has ended by noon');
  assert.deepEqual(weekEvents(events, at('2026-10-17T14:00')).map((e) => e.data.title), ['Corn maze'], 'on Saturday afternoon only the run is left');
  assert.equal(isWeekend(at('2026-10-14T12:00')), false);
  assert.equal(isWeekend(at('2026-10-16T08:00')), true);
  assert.equal(isWeekend(at('2026-10-18T23:00')), true);
});

test('a weekly regular shows once, on its day this weekend', () => {
  const trivia = { ...ev('Trivia', '2026-09-04T19:00', '2026-09-04T21:00'), data: { ...ev('Trivia', '2026-09-04T19:00', '2026-09-04T21:00').data, repeat: 'weekly' as const, until: at('2026-12-18') } };
  const now = at('2026-10-14T12:00');
  const list = weekendEvents(occurrences([trivia], { now, horizonDays: 30 }), now);
  assert.equal(list.length, 1);
  assert.equal(list[0]!.data.start.getTime(), at('2026-10-16T19:00').getTime());
});

test('the strip under an article takes the next few that have not ended', () => {
  const events = [ev('Over', '2026-10-14T09:00', '2026-10-14T10:00'), ev('Soon', '2026-10-14T18:00'), ev('Later', '2026-10-20T18:00'), ev('Much later', '2026-11-20T18:00')];
  assert.deepEqual(upcomingEvents(events, { now: at('2026-10-14T12:00'), limit: 2 }).map((e) => e.data.title), ['Soon', 'Later']);
});
