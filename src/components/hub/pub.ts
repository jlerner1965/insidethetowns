/**
 * The hub's publication look, as class lists (the redesign of 14 November
 * 2026, on the owner's boards for the town page and the home): sections
 * told apart by a heavy rule, a number and a serif heading; italic
 * subheads over a thin ink rule; rows parted by hairlines; dates set in
 * type. No rounded cards, pills, shadows or icon rows.
 *
 * Every value is a token (src/styles/global.css): the colours by role, and
 * the type in rem so a reader's own text size applies. Written out whole so
 * Tailwind finds each class in the source.
 */
export const pub = {
  /** A full-width band, on paper or white; the content sits in `col`. */
  band: 'scroll-mt-4 px-[20px] pb-[48px] pt-[36px]',
  paper: 'bg-paper',
  white: 'bg-raised',
  /** The centred column, about 720px wide on a wide screen. */
  col: 'mx-auto w-full max-w-[720px]',
  /** A section's opening: the 2px ink rule. */
  open: 'border-t-2 border-ink pt-3',
  /** "01", "02". */
  num: 'text-cap font-semibold tracking-[0.14em] text-primary tabular-nums',
  h2: 'mt-1.5 text-section font-medium leading-[1.1] tracking-[-0.015em] text-ink [font-variation-settings:normal]',
  /** The smaller section heading: "On this page", "More in …". */
  h2s: 'text-sub font-medium leading-[1.2] tracking-normal text-ink [font-variation-settings:normal]',
  /** The italic subhead over a 1px ink rule. */
  h3: 'mt-8 scroll-mt-4 border-b border-ink pb-2 text-sub font-normal italic leading-[1.2] tracking-normal text-ink [font-variation-settings:normal]',
  /** A title in a row: an entry's name, a property, a museum. */
  title: 'text-sub font-medium leading-[1.2] tracking-normal text-ink [font-variation-settings:normal]',
  /** Body text. */
  t: 'text-base leading-[1.55] text-ink',
  /** A meta line: sources, checks, notes. */
  meta: 'text-meta leading-[1.5] text-ink-muted',
  /** A caps label of one to three words. */
  cap: 'text-cap font-semibold uppercase tracking-[0.14em]',
  /** An underlined link in the primary. */
  link: 'text-primary underline decoration-1 underline-offset-[3px]',
  /** A title's link, its target 44px tall around a 25px line. */
  titleLink: '-my-[10px] inline-block py-[10px] text-primary underline decoration-1 underline-offset-[3px]',
  /** A row parted from the next by a hairline. */
  rule: 'border-b border-hairline',
  /** A definition row: the term in a narrow column, the value beside it. */
  dl: 'grid grid-cols-[104px_minmax(0,1fr)] gap-x-3 border-b border-hairline py-[13px]',
  dt: 'text-meta font-[650] leading-[1.7] text-ink',
  /** A link that is a whole row, at least 44px tall: "Trinidad →", "Back to contents ↑". */
  go: 'flex min-h-11 items-center text-base font-[650] text-primary underline decoration-1 underline-offset-[3px]',
  /** A two-column list of links, three where the column is wide enough. */
  linkGrid: 'grid grid-cols-2 gap-x-[18px] sm:grid-cols-3',
} as const;
