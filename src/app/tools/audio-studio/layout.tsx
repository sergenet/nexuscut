import type { Metadata } from 'next';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { socialFor } from '@/lib/social';

export const metadata: Metadata = {
  openGraph: socialFor('/tools/audio-studio'),
  alternates: { canonical: '/tools/audio-studio' },
  title: 'AI Audio Studio & Voiceover - NexusCut',
  description: 'Generate ultra-realistic AI voiceovers and edit audio tracks effortlessly for your videos.',
};

export default function ToolLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navigation />
      {children}
      <section className="max-w-4xl mx-auto px-6 py-24 text-gray-300">
        <h2 className="text-3xl font-bold text-white mb-6">Professional Sound Design with the AI Audio Studio</h2>
                <p className="mb-4 leading-relaxed">Audio Studio converts a written script into downloadable speech using a selection of AI voices. It is useful for narration in YouTube videos, TikTok stories, and marketing edits.</p>
        <p className="mb-4 leading-relaxed">Type a script and choose one of six OpenAI text-to-speech voices: Alloy, Echo, Fable, Onyx, Nova, or Shimmer. The result is generated audio and may sound synthetic. The current tool does not clone voices, remove background noise, or automatically master a mix.</p>
        <p className="mb-4 leading-relaxed">Do not let expensive microphones or a lack of recording space hold you back. With NexusCut's Audio Studio, you can produce broadcast-quality sound directly from your browser. The tool also supports automatic audio ducking—lowering your background music automatically when the voiceover speaks. Level up your production value today and keep your audience fully immersed with pristine, professional-grade audio.</p>
      </section>
      <Footer />
    </>
  );
}
