/**
 * The photograph policy, in the words every page states it in.
 *
 * Three pages said three things. The editorial policy said businesses' own
 * marketing photographs "are not used"; /for-businesses/ asked owners for "a
 * photograph you own or have the right to give us"; the credits page spoke
 * of "the owner's written consent". The practice behind all three is one
 * rule (docs/PHOTOS.md, PERMISSIONS.md, IMAGE_LICENSES.csv): a photograph is
 * never copied from a business's website, social media or a review site, and
 * a photograph the owner sends with permission is welcome, recorded, and
 * credited. What the editorial page meant was the copying, so it now says
 * that, and the invitation says the same thing from the owner's side.
 *
 * Pages read these lines rather than restating them, and a test holds the
 * editorial, credits and business pages to them (test/photo-policy.test.ts).
 */

/** What may appear at all. */
export const PHOTO_ACCEPTED =
  'Every photograph on these sites is public domain, openly licensed under terms that allow this use, taken by us, or sent to us by whoever holds its rights, with permission to publish it.';

/** The rule that the old "marketing photographs are not used" line was getting at. */
export const PHOTO_NOT_COPIED =
  'We do not copy photographs from a business’s website or social media, or from review sites. A photograph from any of those is used only when its owner sends it to us with that permission.';

/** What permission means, for an owner sending one. */
export const PHOTO_PERMISSION =
  'Permission is in writing: an email from the person who took the photograph, or who holds its rights, saying this guide may publish it and how to credit it. If a photographer took it for you, their agreement may be needed too. We keep that email with the photograph’s record, and take the photograph down whenever its owner asks.';

/** How credit works, everywhere a photograph appears. */
export const PHOTO_CREDIT =
  'Credit goes under the photograph wherever it is shown in full, as the license or the owner asks, and on the photo credits page, which also covers the cards and link previews where a caption will not fit.';

/** What makes a sent photograph usable. */
export const PHOTO_WANTED =
  'It should show the place itself, ideally the front or a detail that says what you do; landscape, at least 1600 pixels on the long side if you have it; and nobody recognizable as its subject unless they have agreed.';

/** The questions a photograph email answers, in order. */
export const PHOTO_EMAIL_FIELDS = [
  'Which listing (its name or link)',
  'Who took the photograph',
  'How to credit it',
  'I took this photograph or hold the rights to it, and this guide may publish it on the listing, on cards and in link previews (yes / no)',
] as const;

/** A mailto: link for sending a photograph, with the permission questions in the body. */
export function photoEmailHref(email: string, siteTitle: string): string {
  // CRLF, as RFC 6068 asks for line breaks in a mailto body (src/lib/submit.ts does the same).
  const body = `${PHOTO_EMAIL_FIELDS.map((f) => `${f}: `).join('\r\n')}\r\n\r\nPlease attach the photograph to this email.\r\n`;
  return `mailto:${email}?subject=${encodeURIComponent(`Photograph for a listing — ${siteTitle}`)}&body=${encodeURIComponent(body)}`;
}
