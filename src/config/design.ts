/**
 * The flagship home page's fixed values (docs/DESIGN.md, signed off by the
 * owner on 26 October 2026). The stylesheet carries each one beside a
 * `/* spec: <name> *\/` comment (src/components/home/flagship-home.css), and
 * test/design.test.ts reads them there and compares them with this list,
 * so a value changed in one place and not the other fails `npm test`.
 * Changing a value here needs the owner's sign-off and a DECISIONS.md entry.
 */
export const DESIGN_SPEC = {
  'eyebrow': '15px',
  'section phone': '3rem',
  'section desktop': '4.5rem',
  'h1 phone': '2.25rem',
  'h1 desktop': '3rem',
  'h2 phone': '1.75rem',
  'h2 desktop': '2.25rem',
  'top columns': 'minmax(0, 7fr) minmax(0, 5fr)',
  'trim rule': '4px solid var(--fh-rule)',
  'card team phone': '1.25rem',
  'card team desktop': '1.5rem',
  'score phone (56px)': '3.5rem',
  'score desktop (72px)': '4.5rem',
  'next game phone': '2rem',
  'next game desktop': '2.5rem',
  'agenda date column': '3rem minmax(0, 1fr)',
  'agenda time column': '5.5rem minmax(0, 1fr)',
  'band title phone': '2.5rem',
  'band title desktop': '4rem',
} as const;

/** The menu, in order, on every page of a flagship guide (src/lib/nav.ts, townNav). */
export const FLAGSHIP_NAV = ['This week', 'Events', '<Mascot> sports', 'Eat & drink', 'Families', 'Living here'] as const;

/**
 * The only rules in flagship-home.css that may paint a background in the
 * school's colour: the closing band (the page's one full-colour moment) and
 * the Home pill. Everything else uses it as trim: a rule, words, an outline.
 */
export const SCHOOL_BACKGROUNDS = ['.fh-band', '.fh-site-home'] as const;

/** The width breakpoints the design is drawn and checked at, in CSS px. */
export const BREAKPOINTS = { phones: [360, 390, 430], tablet: 768, desktop: [1280, 1440] } as const;
