/**
 * One source of truth for NexusCut's social-preview metadata.
 *
 * Before this existed, no page on the site emitted an `og:image` while every
 * page advertised `twitter:card: summary_large_image`, so every share rendered
 * as a large blank card. Pages that declared their own `openGraph` also replaced
 * the root layout's object wholesale, silently dropping `siteName`, `url` and
 * `type` - which is why 52 URLs used to publish the homepage as their og:url.
 *
 * Next.js already derives `og:title`/`og:description` from a page's own
 * `title`/`description`, so pages only need the parts that do not inherit.
 */

export const OG_IMAGE = {
  url: '/social/nexuscut-og.png',
  width: 1200,
  height: 630,
  alt: 'NexusCut: a glowing cyan and violet film-strip mark on a dark navy background',
} as const;

export const SITE_NAME = 'NexusCut';

/** Applies to every page, so a share never renders without an image. */
export const socialDefaults = {
  type: 'website' as const,
  siteName: SITE_NAME,
  locale: 'en_US',
  images: [OG_IMAGE],
};

/** Root-level social block; `url` is the only part that varies per page. */
export function socialFor(path: string) {
  return { ...socialDefaults, url: path };
}

/** Twitter/X equivalents - the card type is large, so an image is mandatory. */
export const twitterDefaults = {
  card: 'summary_large_image' as const,
  images: [OG_IMAGE.url],
};
