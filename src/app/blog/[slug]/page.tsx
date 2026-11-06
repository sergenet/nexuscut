import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { getBlogPostBySlug, getAllBlogSlugs } from '@/lib/blogData';
import { notFound } from 'next/navigation';
import {
  ArrowLeft,
  Sparkles,
  FileText,
  Calendar,
  ExternalLink,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { socialFor } from '@/lib/social';
import AdUnit from '@/components/AdUnit';

// Ad unit ids are created in AdSense and passed in at build time. When they are
// absent the units render nothing, so a build without them is still correct.
const ARTICLE_AD_SLOT = process.env.NEXT_PUBLIC_ADSENSE_SLOT_ARTICLE;
const FOOTER_AD_SLOT = process.env.NEXT_PUBLIC_ADSENSE_SLOT_FOOTER;

export async function generateStaticParams() {
  const slugs = await getAllBlogSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) {
    return { title: 'Post not found — NexusCut' };
  }
  return {
    title: `${post.title} — NexusCut`,
    description: post.description,
    alternates: { canonical: `/blog/${slug}` },
    openGraph: socialFor(`/blog/${slug}`),
  };
}

/**
 * The page already renders the post title as the page's only H1, and every
 * static post also opens its markdown with `# <the same title>`. That shipped
 * two H1 elements on all 27 posts. Drop the markdown one rather than editing
 * every post, so new posts cannot reintroduce it.
 */
function stripLeadingHeading(markdown: string): string {
  const match = markdown.match(/^\s*#\s+[^\n]*\n?/);
  return match ? markdown.slice(match[0].length) : markdown;
}

export const revalidate = 60;

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const date = post.publishedAt ?? post.importedAt;

  return (
    <div className="min-h-screen bg-gray-950 text-white font-sans flex flex-col">
      <Navigation />

      <main className="flex-grow pt-32 pb-24 px-4 max-w-4xl mx-auto w-full">
        <Link
          href="/blog"
          className="inline-flex items-center text-gray-400 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Blog
        </Link>

        <div className="mb-12">
          <div className="flex items-center gap-4 mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-fuchsia-500/10 text-fuchsia-400 rounded-full text-sm font-bold tracking-wide uppercase">
              <FileText className="w-4 h-4" /> {post.category}
            </div>
            <div className="text-gray-500 text-sm font-medium flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {date.toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight">
            {post.title}
          </h1>
          <p className="text-xl text-gray-400">{post.description}</p>
        </div>

        {post.image && (
          <figure className="mb-10 overflow-hidden rounded-2xl border border-gray-800 bg-black shadow-2xl">
            <img
              src={post.image}
              alt={post.imageAlt ?? post.title}
              className="h-auto w-full"
            />
            <figcaption className="border-t border-gray-800 px-4 py-3 text-sm text-gray-400">
              NexusCut’s browser editor: AI tools, preview, and an editable
              multi-track timeline.
            </figcaption>
          </figure>
        )}

        {post.sourceUrl && (
          <div className="mb-8 text-sm text-gray-500 flex items-center gap-2">
            <span>Original source</span>
            <Link
              href={post.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 hover:text-fuchsia-400"
            >
              {post.sourceUrl}
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        )}

        <div className="prose prose-invert prose-lg max-w-none prose-headings:text-fuchsia-400 prose-a:text-fuchsia-500 hover:prose-a:text-fuchsia-400">
          {post.importedBy === 'soro-import' ? (
            // Soro drafts are HTML, sanitized once in blogData before rendering.
            <div dangerouslySetInnerHTML={{ __html: post.content }} />
          ) : (
            <ReactMarkdown>{stripLeadingHeading(post.content)}</ReactMarkdown>
          )}
        </div>

        {/* In-article unit: after the last paragraph, where a reader who has
            finished the post is most likely to be looking. */}
        <AdUnit slot={ARTICLE_AD_SLOT} className="my-10" label="Advertisement" />

        <div className="mt-16 bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-2xl p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-fuchsia-500/10 blur-3xl rounded-full" />
          <Sparkles className="w-10 h-10 text-fuchsia-500 mx-auto mb-4 relative z-10" />
          <h3 className="text-3xl font-extrabold mb-4 relative z-10">
            Stop Reading. Start Creating.
          </h3>
          <p className="text-gray-400 mb-8 max-w-lg mx-auto relative z-10">
            Put these strategies into practice immediately. NexusCut gives you
            the tools to edit faster and grow quicker.
          </p>
          <Link
            href="/editor"
            className="inline-flex px-10 py-4 bg-fuchsia-600 hover:bg-fuchsia-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-fuchsia-500/25 relative z-10"
          >
            Start Editing Free
          </Link>
        </div>

        <AdUnit slot={FOOTER_AD_SLOT} className="mt-10" label="Advertisement" />
      </main>

      <Footer />
    </div>
  );
}
