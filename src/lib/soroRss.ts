import { createHash } from 'crypto';

export type SoroRssItem = {
  sourceGuid: string;
  title: string;
  slug: string | null;
  sourceUrl: string | null;
  excerpt: string | null;
  contentHtml: string;
  publishedAt: Date | null;
};

function unwrap(value: string) {
  return value
    .trim()
    .replace(/^<!\[CDATA\[/, '')
    .replace(/\]\]>$/, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

function field(item: string, tag: string) {
  const escaped = tag.replace(':', '\\:');
  const match = item.match(new RegExp(`<${escaped}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${escaped}>`, 'i'));
  return match ? unwrap(match[1]) : '';
}

function plainText(html: string) {
  return html
    // Drop script/style elements together with their contents: tag-stripping
    // alone would leave the script's inner text (e.g. "alert(1)") in the
    // excerpt, which then shows up in the post description and meta tags.
    .replace(/<(script|style)\b[^>]*>[\s\S]*?(<\/\1\s*>|$)/gi, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Parses the small RSS subset Soro exposes. The untrusted HTML is never
 * rendered or published by this importer; it is retained only for owner review.
 */
export function parseSoroRss(xml: string): SoroRssItem[] {
  const itemBlocks = xml.match(/<item(?:\s[^>]*)?>[\s\S]*?<\/item>/gi) || [];

  return itemBlocks.flatMap((item) => {
    const title = field(item, 'title');
    const sourceUrl = field(item, 'link') || null;
    const contentHtml = field(item, 'content:encoded') || field(item, 'description');
    const sourceGuid = field(item, 'guid') || createHash('sha256').update(`${title}|${sourceUrl}|${contentHtml}`).digest('hex');
    if (!title || !contentHtml) return [];

    let slug: string | null = null;
    if (sourceUrl) {
      try {
        slug = new URL(sourceUrl).pathname.split('/').filter(Boolean).pop() || null;
      } catch {}
    }

    const rawDate = field(item, 'pubDate') || field(item, 'published');
    const parsedDate = rawDate ? new Date(rawDate) : null;
    return [{
      sourceGuid,
      title,
      slug,
      sourceUrl,
      excerpt: plainText(contentHtml).slice(0, 280) || null,
      contentHtml,
      publishedAt: parsedDate && !Number.isNaN(parsedDate.getTime()) ? parsedDate : null,
    }];
  });
}
