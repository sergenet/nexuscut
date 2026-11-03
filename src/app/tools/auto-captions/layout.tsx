import type { Metadata } from 'next';
import Link from 'next/link';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { socialFor } from '@/lib/social';

export const metadata: Metadata = {
  openGraph: socialFor('/tools/auto-captions'),
  alternates: { canonical: '/tools/auto-captions' },
  title: 'Free AI Auto Captions for Videos — Word-Timed Subtitles | NexusCut',
  description:
    'Turn speech into word-timed captions free. Upload a video, get editable auto-captions in seconds, download an SRT, or burn animated word-by-word captions into your short with the NexusCut editor.',
};

const faqs = [
  {
    question: 'Is the AI auto-caption generator free?',
    answer:
      'Yes. You can transcribe videos and download word-timed SRT files for free, with free usage limits that refresh every day. Paid plans add unlimited editing tools, priority processing, and caption burn-in exports.',
  },
  {
    question: 'How accurate are the auto captions?',
    answer:
      'Accuracy depends on the recording: clear speech in a quiet room transcribes very well, while background music, heavy accents, or overlapping speakers reduce accuracy. Every word stays editable, so you can fix anything the AI gets wrong.',
  },
  {
    question: 'Which languages does it support?',
    answer:
      'The transcription engine handles most major languages, including English, Spanish, French, German, Portuguese, Italian, and more. Set your expectations by testing a short clip of your own audio first.',
  },
  {
    question: 'What file formats can I upload and download?',
    answer:
      'Upload MP4, MOV, or WebM video up to 240 MB. Download your word-timed captions as a standard .srt subtitle file that editors like CapCut, Premiere, and YouTube accept.',
  },
  {
    question: 'How is this different from hard-coded caption apps?',
    answer:
      'Instead of only overlaying text, this tool gives you the raw word-level timing. You can download the SRT, or open the same video in the NexusCut editor to style animated word-by-word captions — fonts, colors, per-word highlight — and export a clean MP4 with no watermark.',
  },
];

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((faq) => ({
    '@type': 'Question',
    name: faq.question,
    acceptedAnswer: { '@type': 'Answer', text: faq.answer },
  })),
};

export default function ToolLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navigation />
      {children}

      <section className="max-w-4xl mx-auto px-6 py-20 text-gray-300">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-8">
          How to add auto captions to a video
        </h2>
        <ol className="mb-12 space-y-6">
          <li>
            <h3 className="text-lg font-bold text-white">1. Upload your clip</h3>
            <p className="leading-relaxed">
              Drop in a talking-head video, podcast clip, or reel with spoken audio. Vertical,
              horizontal, or square — up to 240&nbsp;MB.
            </p>
          </li>
          <li>
            <h3 className="text-lg font-bold text-white">2. Let the AI transcribe every word</h3>
            <p className="leading-relaxed">
              Speech recognition timestamps each individual word, not just each line, so captions
              land exactly when they are spoken.
            </p>
          </li>
          <li>
            <h3 className="text-lg font-bold text-white">3. Edit, download, or burn them in</h3>
            <p className="leading-relaxed">
              Fix any word right in the browser, download a standard <code>.srt</code> subtitle
              file, or take the video into the{' '}
              <Link href="/editor" className="text-indigo-400 font-semibold hover:text-indigo-300">
                full NexusCut editor
              </Link>{' '}
              to style animated word-by-word captions and export a finished MP4 — no watermark on
              free exports.
            </p>
          </li>
        </ol>

        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Why captions matter for short-form video
        </h2>
        <p className="mb-4 leading-relaxed">
          A large share of social video is watched on mute — creator studies have long put it
          around 80%. Captions are how silent scrollers read your hook, and word-by-word
          animation keeps eyes on screen for the full clip. Auto captions turn a one-minute
          recording into an editable transcript in seconds, so the captioning step stops being
          the reason you do not publish.
        </p>

        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 mt-12">
          Auto captions FAQ
        </h2>
        <div className="space-y-8">
          {faqs.map((faq) => (
            <div key={faq.question}>
              <h3 className="text-lg font-bold text-white mb-2">{faq.question}</h3>
              <p className="leading-relaxed">{faq.answer}</p>
            </div>
          ))}
        </div>

        <div className="mt-14 rounded-2xl border border-indigo-500/25 bg-indigo-500/10 p-8 text-center">
          <p className="text-xl font-bold text-white mb-4">
            Ready for captions people actually watch?
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/editor"
              className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-colors"
            >
              Open the editor
            </Link>
            <Link
              href="/tools/animated-subtitles"
              className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold transition-colors"
            >
              See animated subtitle styles
            </Link>
          </div>
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <Footer />
    </>
  );
}
