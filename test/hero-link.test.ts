/**
 * The home page hero's second button (src/lib/places.ts heroSecondLink):
 * Eat & Drink unless Things to Do lists at least twice as many places.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { heroSecondLink } from '../src/lib/places.ts';

const href = (eatDrink: number, thingsToDo: number) => heroSecondLink({ eatDrink, thingsToDo }).href;

test('a town whose Eat & Drink page is thin sends the button to Things to Do', () => {
  assert.equal(href(4, 23), '/things-to-do/', 'Carbon Valley');
  assert.equal(href(2, 10), '/things-to-do/', 'Severance');
  assert.equal(heroSecondLink({ eatDrink: 4, thingsToDo: 23 }).label, 'Things to do');
});

test('twice as many is the bar, so a near tie keeps Eat & Drink and does not flip', () => {
  assert.equal(href(10, 20), '/things-to-do/', 'exactly twice');
  assert.equal(href(11, 21), '/eat-drink/', 'just under twice');
  assert.equal(href(18, 19), '/eat-drink/', 'a near tie');
  assert.equal(href(34, 8), '/eat-drink/', 'a food town');
});

test('a guide with nothing listed yet keeps the usual button', () => {
  assert.equal(href(0, 0), '/eat-drink/');
  assert.equal(href(0, 3), '/things-to-do/', 'nothing to eat listed, something to do');
});
