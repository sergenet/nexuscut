import type { Metadata } from 'next';
import React from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { academyLessons } from '@/lib/academyData';
import { socialDefaults, twitterDefaults } from '@/lib/social';
import { notFound } from 'next/navigation';
import { ArrowLeft, BookOpen, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export async function generateStaticParams() {
  return academyLessons.map((lesson) => ({
    slug: lesson.slug,
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const lesson = academyLessons.find((item) => item.slug === slug);

  if (!lesson) {
    return {
      title: 'Lesson Not Found | NexusCut Academy',
      alternates: { canonical: `/academy/${slug}` },
      robots: { index: false, follow: true },
    };
  }

  // Each lesson needs its own title: without one every page inherits the
  // site-wide default and the whole academy competes for a single result.
  return {
    title: `${lesson.title} | NexusCut Academy`,
    description: lesson.description,
    alternates: { canonical: `/academy/${slug}` },
    openGraph: {
      ...socialDefaults,
      title: `${lesson.title} | NexusCut Academy`,
      description: lesson.description,
      url: `/academy/${slug}`,
      type: 'article',
    },
    twitter: {
      ...twitterDefaults,
      title: `${lesson.title} | NexusCut Academy`,
      description: lesson.description,
    },
  };
}

export default async function AcademyLessonPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const lesson = academyLessons.find((l) => l.slug === slug);

  if (!lesson) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white font-sans flex flex-col">
      <Navigation />
      
      <main className="flex-grow pt-32 pb-24 px-4 max-w-4xl mx-auto w-full">
        <Link href="/academy" className="inline-flex items-center text-gray-400 hover:text-white mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Academy
        </Link>
        
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 text-indigo-400 rounded-full text-sm font-bold tracking-wide uppercase mb-6">
            <BookOpen className="w-4 h-4" /> {lesson.category}
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight">
            {lesson.title}
          </h1>
          <p className="text-xl text-gray-400">
            {lesson.description}
          </p>
        </div>

        <div className="prose prose-invert prose-lg max-w-none prose-headings:text-indigo-400 prose-a:text-indigo-500 hover:prose-a:text-indigo-400">
          <ReactMarkdown>{lesson.content}</ReactMarkdown>
        </div>

        <div className="mt-16 bg-gray-900 border border-gray-800 rounded-2xl p-8 text-center">
          <Sparkles className="w-10 h-10 text-indigo-500 mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-4">Ready to apply this to your videos?</h3>
          <p className="text-gray-400 mb-6">Edit faster and grow quicker with NexusCut's AI tools.</p>
          <Link href="/editor" className="inline-flex px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/25">
            Start Editing Free
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
