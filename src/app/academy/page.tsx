import React from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { academyLessons } from '@/lib/academyData';
import { BookOpen, Play, ArrowRight } from 'lucide-react';
import { socialFor } from '@/lib/social';

export const metadata = {
  openGraph: socialFor('/academy'),
  alternates: { canonical: '/academy' },
  title: 'Creator Academy - NexusCut',
  description: 'Learn how to grow on TikTok, Shorts, and Reels with advanced editing techniques and viral strategies.',
};

export default function AcademyIndex() {
  return (
    <div className="min-h-screen bg-gray-950 text-white font-sans flex flex-col">
      <Navigation />
      
      <main className="flex-grow pt-32 pb-24 px-4 max-w-7xl mx-auto w-full">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 text-indigo-400 rounded-full text-sm font-bold tracking-wide uppercase mb-6">
            <BookOpen className="w-4 h-4" /> Free Training
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6 tracking-tight">
            NexusCut <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">Creator Academy</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Master the art of short-form content. Learn the exact strategies top creators use to edit faster and grow quicker.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {academyLessons.map((lesson) => (
            <Link 
              key={lesson.slug} 
              href={`/academy/${lesson.slug}`}
              className="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-indigo-500/50 hover:bg-gray-800/50 transition-all group flex flex-col h-full"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">{lesson.category}</span>
                <Play className="w-5 h-5 text-gray-600 group-hover:text-indigo-400 transition-colors" />
              </div>
              <h2 className="text-2xl font-bold mb-3">{lesson.title}</h2>
              <p className="text-gray-400 text-sm mb-6 flex-grow">{lesson.description}</p>
              <div className="flex items-center text-indigo-400 font-bold text-sm">
                Start Lesson <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
