import prisma from '@/lib/prisma';

/** A Soro draft row as it exists in the database. */
export type SoroDraft = {
  id: string;
  sourceGuid: string;
  title: string;
  slug: string | null;
  sourceUrl: string | null;
  excerpt: string | null;
  contentHtml: string;
  publishedAt: Date | null;
  importedAt: Date;
  updatedAt: Date;
  status: string; // 'draft' | 'published' | 'archived'
};

export type SoroBlogPost = {
  id: string;
  slug: string;
  title: string;
  description: string;
  content: string;
  publishedAt: Date | null;
  importedAt: Date;
  importedBy: string;
  sourceUrl: string | null;
  category: string;
  image?: string | null;
  imageAlt?: string | null;
};

export type SoroBlogPage = {
  posts: SoroBlogPost[];
  count: number;
  hasMore: boolean;
};

const SANITIZE_RULES: Record<string, boolean> = {
  a: true,
  abbr: true,
  address: true,
  b: true,
  blockquote: true,
  br: true,
  cite: true,
  code: true,
  dd: true,
  del: true,
  div: true,
  dl: true,
  dt: true,
  em: true,
  figcaption: true,
  figure: true,
  h1: true,
  h2: true,
  h3: true,
  h4: true,
  h5: true,
  h6: true,
  hr: true,
  i: true,
  ins: true,
  kbd: true,
  li: true,
  mark: true,
  ol: true,
  p: true,
  pre: true,
  q: true,
  s: true,
  samp: true,
  small: true,
  span: true,
  strong: true,
  sub: true,
  sup: true,
  table: true,
  tbody: true,
  td: true,
  th: true,
  tr: true,
  u: true,
  ul: true,
  var: true,
  img: true,
};

const ALLOWED_ATTRS: Record<string, string[]> = {
  a: ['href', 'title', 'target', 'rel'],
  img: ['src', 'alt', 'loading', 'decoding'],
  td: ['colspan', 'rowspan'],
  th: ['colspan', 'rowspan', 'scope'],
  ol: ['start'],
  br: [],
  wbr: [],
};

const SELF_CLOSING = new Set(['img', 'br', 'wbr']);

// Content inside these tags is executable or non-presentational, so the whole
// element — including its text — is discarded rather than unwrapped.
const DROP_CONTENT_TAGS = new Set(['script', 'style']);

function findTagEnd(html: string, start: number): number {
  let quote: string | null = null;
  for (let j = start + 1; j < html.length; j++) {
    const c = html[j];
    if (quote) {
      if (c === quote) quote = null;
    } else if (c === '"' || c === "'") {
      quote = c;
    } else if (c === '>') {
      return j;
    }
  }
  return -1;
}

/** Decode the entity forms an attacker would use to smuggle a scheme past the
 *  URL check below (`javascript&colon;`, `&#106;avascript:`, embedded tabs). */
function decodeForSchemeCheck(value: string): string {
  return value
    .replace(/&#x([0-9a-f]+);?/gi, (_, hex: string) =>
      String.fromCodePoint(parseInt(hex, 16)),
    )
    .replace(/&#(\d+);?/g, (_, dec: string) =>
      String.fromCodePoint(parseInt(dec, 10)),
    )
    .replace(/&(colon|Tab|NewLine);?/g, (_, name: string) =>
      name === 'colon' ? ':' : name === 'Tab' ? '\t' : '\n',
    )
    .replace(/[\s\u0000-\u001f]+/g, '')
    .toLowerCase();
}

function isSafeUrl(value: string, allowDataImage: boolean): boolean {
  const decoded = decodeForSchemeCheck(value);
  const scheme = decoded.match(/^([a-z][a-z0-9+.-]*):/);
  if (!scheme) return true; // relative URL or in-page anchor
  if (['http', 'https', 'mailto', 'tel'].includes(scheme[1])) return true;
  if (allowDataImage) {
    return /^data:image\/(png|jpe?g|gif|webp|avif);base64,/.test(decoded);
  }
  return false;
}

function sanitizeAttributes(tagName: string, attrSource: string): string {
  const allowed = ALLOWED_ATTRS[tagName] ?? [];
  const attrRe = /([a-zA-Z_:][\w:.-]*)(?:\s*=\s*("[^"]*"|'[^']*'|[^\s"'=<>`]+))?/g;
  let out = '';
  let keptTarget = false;
  let keptRel = false;
  let m: RegExpExecArray | null;

  while ((m = attrRe.exec(attrSource)) !== null) {
    const name = m[1].toLowerCase();
    if (!allowed.includes(name)) continue;
    let value = m[2] ?? '';
    if (value.startsWith('"') || value.startsWith("'")) value = value.slice(1, -1);
    if ((name === 'href' || name === 'src') && !isSafeUrl(value, name === 'src')) {
      continue;
    }
    if (name === 'target') keptTarget = true;
    if (name === 'rel') keptRel = true;
    out += ` ${name}="${value.replace(/"/g, '&quot;')}"`;
  }

  if (tagName === 'a' && keptTarget && !keptRel) {
    out += ' rel="noopener noreferrer"';
  }
  return out;
}

/** Minimal HTML sanitizer: removes scripts, event handlers, javascript:/data:
 *  URLs, style attributes, and any tag not on the allowlist. Keeps the rich
 *  text Soro exports but makes it safe to render via dangerouslySetInnerHTML
 *  without pulling in a sanitizer dependency. */
export function sanitizeHtml(html: string): string {
  let out = '';
  let i = 0;

  while (i < html.length) {
    const start = html.indexOf('<', i);
    if (start === -1) {
      out += html.slice(i);
      break;
    }
    out += html.slice(i, start);

    const end = findTagEnd(html, start);
    if (end === -1) {
      out += html.slice(start);
      break;
    }

    const rawTag = html.slice(start + 1, end);
    const isClosing = rawTag.startsWith('/');
    const nameMatch = (isClosing ? rawTag.slice(1) : rawTag).match(
      /^\s*([a-zA-Z][a-zA-Z0-9-]*)/,
    );
    // Comments, doctypes, CDATA and processing instructions carry no name.
    if (!nameMatch) {
      i = end + 1;
      continue;
    }
    const tagName = nameMatch[1].toLowerCase();

    if (DROP_CONTENT_TAGS.has(tagName)) {
      if (isClosing) {
        i = end + 1;
        continue;
      }
      const close = html.toLowerCase().indexOf(`</${tagName}`, end + 1);
      if (close === -1) break;
      const closeEnd = html.indexOf('>', close);
      i = closeEnd === -1 ? html.length : closeEnd + 1;
      continue;
    }

    // Drop the tag markup but keep whatever text sits inside unknown elements.
    if (!SANITIZE_RULES[tagName]) {
      i = end + 1;
      continue;
    }

    if (isClosing) {
      if (!SELF_CLOSING.has(tagName)) out += `</${tagName}>`;
      i = end + 1;
      continue;
    }

    const attrs = sanitizeAttributes(tagName, rawTag.slice(nameMatch[0].length));
    const selfClosing =
      SELF_CLOSING.has(tagName) || rawTag.trimEnd().endsWith('/');
    out += `<${tagName}${attrs}${selfClosing ? ' />' : '>'}`;
    i = end + 1;
  }

  return out;
}

/** Public "published" Soro drafts, exposed to the blog content layer. */
export async function listPublishedSoroPosts(options?: {
  take?: number;
  publishedSince?: Date;
}) {
  const take = options?.take ?? 20;
  const after = options?.publishedSince
    ? { publishedAt: { lt: options.publishedSince } }
    : {};

  const drafts = await prisma.soroDraft.findMany({
    where: {
      status: 'published',
      ...after,
    },
    orderBy: { importedAt: 'desc' },
    take,
  });

  // Drafts without a slug cannot be routed to /blog/<slug>, so they are
  // excluded instead of being given a placeholder slug that would 404.
  return drafts
    .filter((draft): draft is typeof draft & { slug: string } => draft.slug !== null)
    .map((draft) => ({
      id: draft.id,
      slug: draft.slug,
      title: draft.title,
      description: draft.excerpt || draft.title,
      content: sanitizeHtml(draft.contentHtml),
      publishedAt: draft.publishedAt,
      importedAt: draft.importedAt,
      importedBy: 'soro-import',
      sourceUrl: draft.sourceUrl ?? null,
      category: 'Soro digest',
    }));
}

/** Fetch one Soro draft by slug, for the blog [slug] route. */
export async function getSoroDraftBySlug(slug: string) {
  // slug is a nullable non-unique column, so findFirst is the correct call.
  return prisma.soroDraft.findFirst({
    where: { slug },
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      contentHtml: true,
      publishedAt: true,
      importedAt: true,
      sourceUrl: true,
      status: true,
    },
  });
}

/** Returns the count of published Soro articles. */
export async function countPublishedSoroPosts() {
  return prisma.soroDraft.count({ where: { status: 'published' } });
}
