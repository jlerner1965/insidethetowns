/**
 * RSS 2.0, built by hand.
 *
 * A feed is a few hundred bytes of XML with two rules that matter — escape the
 * text, and format the dates as RFC 822 — so it does not need a dependency.
 *
 * Worth publishing because local Facebook groups, Nextdoor aggregators and
 * regional news sites pull feeds, and each pickup is a link. An events feed in
 * particular is more use to an aggregator than an articles feed, and almost
 * nobody publishes one.
 */

export interface FeedItem {
  title: string;
  /** Absolute URL. */
  link: string;
  description: string;
  pubDate: Date;
  /** Defaults to `link`. Give an explicit one where a single page has many items. */
  guid?: string;
  categories?: string[];
}

export interface FeedOptions {
  title: string;
  description: string;
  /** Absolute URL of the page the feed describes. */
  link: string;
  /** Absolute URL of the feed itself, for <atom:link rel="self">. */
  self: string;
  items: FeedItem[];
}

/** The five XML predefined entities. Everything written into the feed goes through this. */
function escape(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/** RFC 822, which toUTCString already produces: "Fri, 18 Sep 2026 10:00:00 GMT". */
function rfc822(date: Date): string {
  return date.toUTCString();
}

export function buildRss({ title, description, link, self, items }: FeedOptions): string {
  const newest = items.reduce<Date | undefined>(
    (latest, item) => (!latest || item.pubDate > latest ? item.pubDate : latest),
    undefined,
  );
  const entries = items.map((item) => {
    const parts = [
      `      <title>${escape(item.title)}</title>`,
      `      <link>${escape(item.link)}</link>`,
      `      <guid isPermaLink="${item.guid ? 'false' : 'true'}">${escape(item.guid ?? item.link)}</guid>`,
      `      <pubDate>${rfc822(item.pubDate)}</pubDate>`,
      `      <description>${escape(item.description)}</description>`,
      ...(item.categories ?? []).map((c) => `      <category>${escape(c)}</category>`),
    ];
    return `    <item>\n${parts.join('\n')}\n    </item>`;
  });
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escape(title)}</title>
    <link>${escape(link)}</link>
    <description>${escape(description)}</description>
    <language>en-us</language>
    <atom:link href="${escape(self)}" rel="self" type="application/rss+xml" />
${newest ? `    <lastBuildDate>${rfc822(newest)}</lastBuildDate>\n` : ''}${entries.join('\n')}
  </channel>
</rss>
`;
}

/** Feeds are XML served as a file, never a page. */
export function rssResponse(body: string): Response {
  return new Response(body, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } });
}
