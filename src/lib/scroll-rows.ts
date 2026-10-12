/**
 * The sideways-scrolling filter rows on a phone (.filter-pills: "When",
 * "What", "Where", "Jump to").
 *
 * A row cut off by the edge of its box read as broken: once a reader had
 * swiped the "When" row, a sliver of "Today" sat hard against the label and
 * the chosen "Anytime" was out of sight, with nothing to say either way. So
 * each row says which side has more (`data-more-before`, `data-more-after`),
 * which global.css turns into a fade on that edge only, and the pressed
 * button is scrolled into view on load and whenever the choice changes:
 * a link to ?category=sports, or the "show everything" reset, would
 * otherwise leave it off-screen. From 40rem the rows wrap, nothing
 * overflows, and none of this shows.
 *
 * The arithmetic is pure, so it is tested without a browser.
 */

/** A pixel of slack: scroll positions are fractional on a high-density screen. */
const SLACK = 1;

/** Which sides of a row have something scrolled out of view. */
export function edges(scrollLeft: number, clientWidth: number, scrollWidth: number): { before: boolean; after: boolean } {
  return {
    before: scrollLeft > SLACK,
    after: scrollLeft + clientWidth < scrollWidth - SLACK,
  };
}

/**
 * Where to scroll a row so an item in it is fully in view with `margin` to
 * spare on the side it was hidden past, or null when it already is. An item
 * within `margin` of the start takes the row back to the start, so nothing
 * is left hanging before the first button.
 */
export function reveal(
  row: { scrollLeft: number; clientWidth: number; scrollWidth: number },
  item: { left: number; width: number },
  margin: number,
): number | null {
  const { scrollLeft, clientWidth, scrollWidth } = row;
  const max = Math.max(0, scrollWidth - clientWidth);
  if (item.left - margin < scrollLeft) return Math.max(0, item.left - margin);
  if (item.left + item.width + margin > scrollLeft + clientWidth) return Math.min(max, item.left + item.width + margin - clientWidth);
  return null;
}

/**
 * Wires every .filter-pills row on the page once. Safe to call from each
 * component that has a row: a row already wired is skipped. The first reveal
 * waits a frame, so the filter scripts have set the choice from the URL by then.
 */
export function initScrollRows(doc: Document = document): void {
  // The fade's width (global.css), so a revealed button clears it.
  const margin = 32;
  for (const row of doc.querySelectorAll<HTMLElement>('.filter-pills:not([data-scroll-row])')) {
    row.dataset.scrollRow = '';
    const mark = () => {
      const { before, after } = edges(row.scrollLeft, row.clientWidth, row.scrollWidth);
      row.toggleAttribute('data-more-before', before);
      row.toggleAttribute('data-more-after', after);
    };
    const showPressed = () => {
      const pressed = row.querySelector<HTMLElement>('[aria-pressed="true"]');
      if (!pressed || row.scrollWidth <= row.clientWidth) return;
      // The button's left edge in the row's scrolled content.
      const left = pressed.getBoundingClientRect().left - row.getBoundingClientRect().left + row.scrollLeft;
      const to = reveal(row, { left, width: pressed.offsetWidth }, margin);
      if (to !== null) row.scrollLeft = to;
      mark();
    };
    row.addEventListener('scroll', mark, { passive: true });
    window.addEventListener('resize', mark, { passive: true });
    new MutationObserver(showPressed).observe(row, { subtree: true, attributes: true, attributeFilter: ['aria-pressed'] });
    requestAnimationFrame(() => {
      showPressed();
      mark();
    });
  }
}
