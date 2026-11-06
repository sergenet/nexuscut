import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { getBlogPostSummaries, type BlogPostLike } from '@/lib/blogData';
import type { SoroBlogPost } from '@/lib/soroBlog';
import { ArrowRight, Calendar } from 'lucide-react';
import { socialFor } from '@/lib/social';

export const revalidate = 60;

export const metadata = {
  openGraph: socialFor('/blog'),
  alternates: { canonical: '/blog' },
  title: 'Short-Form Video Editing Blog & Tutorials | NexusCut',
  description:
    'Practical guides, retention tactics, and editing workflows for short-form creators.',
};

type BlogPostSummary = {
  slug: string;
  title: string;
  description: string;
  date: Date;
  category: string;
  image?: string | undefined;
  imageAlt?: string | undefined;
};

function normalizePost(post: BlogPostLike | SoroBlogPost): BlogPostSummary {
  const rawDate =
    'date' in post ? post.date : post.publishedAt ?? post.importedAt;
  const date = rawDate instanceof Date ? rawDate : new Date(rawDate);

  return {
    slug: post.slug,
    title: post.title,
    description: post.description,
    date,
    category: post.category,
    image: post.image ?? undefined,
    imageAlt: post.imageAlt ?? undefined,
  };
}

export default async function BlogPage() {
  const posts = await getBlogPostSummaries({ take: 50 });
  const summaries = posts.map(normalizePost);
  const featured =
    summaries.find((p) => p.slug === 'ai-powered-short-form-video-editor') ??
    summaries[0];
  const list = summaries.filter((p) => p.slug !== featured?.slug);

  return (
    <div className="min-h-screen bg-gray-950 text-white font-sans flex flex-col">
      <Navigation />

      <main className="flex-grow">
        <section className="max-w-6xl mx-auto px-4 pt-20 pb-24">
          <div className="max-w-3xl mx-auto text-center mb-20">
            <span className="inline-block px-3 py-1 bg-fuchsia-500/10 text-fuchsia-400 rounded-full text-sm font-bold tracking-wide uppercase mb-4">
              Creator Playbook
            </span>
            <h1 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight leading-tight">
              From raw footage to&nbsp;feed-ready&nbsp;content.
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
              Editing tactics, caption workflows, and retention ideas you can
              apply to TikTok, YouTube Shorts, and Instagram Reels.
            </p>
            <Link
              href="/creator-challenge?utm_source=blog&utm_medium=organic&utm_campaign=three_shorts"
              data-analytics-event="creator_challenge_cta"
              data-analytics-location="blog_hub"
              className="mt-7 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-indigo-500"
            >
              Take the free 7-Day Shorts Challenge{' '}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {featured && (
            <article className="relative mb-24 overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900 via-gray-900 to-gray-950 border border-gray-800 p-8 md:p-12 lg:p-16">
              {featured.slug.includes('ai-powered-short-form') ? (
                <div className="absolute top-0 right-0 -mr-24 -mt-24 w-96 h-96 bg-fuchsia-500/10 blur-3xl rounded-full" />
              ) : (
                <div className="absolute top-0 right-0 -mr-24 -mt-24 w-96 h-96 bg-indigo-500/10 blur-3xl rounded-full" />
              )}

              <div className="relative z-10 flex flex-col lg:flex-row gap-10 items-start">
                <div className="flex-1">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-fuchsia-500/10 text-fuchsia-400 rounded-full text-sm font-bold tracking-wide uppercase mb-6">
                    {featured.category}
                  </div>
                  <h2 className="text-3xl md:text-4xl font-extrabold mb-6 leading-tight">
                    {featured.title}
                  </h2>
                  <p className="text-lg text-gray-400 mb-8 leading-relaxed">
                    {featured.description}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Link
                      href={`/blog/${featured.slug}`}
                      className="inline-flex px-8 py-4 bg-fuchsia-600 hover:bg-fuchsia-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-fuchsia-500/25"
                    >
                      Read the post
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                    <Link
                      href="/editor"
                      className="inline-flex px-8 py-4 border border-gray-700 hover:border-gray-500 text-white rounded-xl font-semibold transition-all"
                    >
                      Try in the editor
                    </Link>
                  </div>
                </div>
                <div className="hidden lg:block flex-none w-48 h-48 rounded-2xl border border-gray-800 bg-gray-950 overflow-hidden shadow-2xl">
                  {featured.image && (
                    <img
                      src={featured.image}
                      alt={featured.imageAlt ?? featured.title}
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>
              </div>
            </article>
          )}

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((post) => (
              <article
                key={post.slug}
                className="group relative flex flex-col bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden hover:border-gray-700 transition-colors"
              >
                <div className="aspect-video bg-gray-950 overflow-hidden">
                  {post.image ? (
                    <img
                      src={post.image}
                      alt={post.imageAlt ?? post.title}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center">
                      <Calendar className="w-8 h-8 text-gray-700" />
                    </div>
                  )}
                </div>
                <div className="flex flex-col flex-grow p-5">
                  <div className="inline-flex items-center px-2 py-1 bg-gray-800 rounded-md text-xs font-bold tracking-wide uppercase text-gray-400 mb-3">
                    {post.category}
                  </div>
                  <h3 className="text-lg font-bold mb-2 leading-snug group-hover:text-fuchsia-400 transition-colors">
                    <Link
                      href={`/blog/${post.slug}`}
                      className="hover:text-fuchsia-400"
                    >
                      {post.title}
                    </Link>
                  </h3>
                  <p className="text-gray-400 text-sm flex-grow mb-4 line-clamp-2">
                    {post.description}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <time dateTime={post.date.toISOString()}>
                      {post.date.toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </time>
                    <Link
                      href={`/blog/${post.slug}`}
                      className="inline-flex items-center gap-1 hover:text-fuchsia-400 transition-colors"
                    >
                      Read
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {summaries.length === 0 && (
            <div className="mt-24 text-center text-gray-500">
              No blog posts yet.
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
