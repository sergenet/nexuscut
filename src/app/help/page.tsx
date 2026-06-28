import Link from "next/link";
import { ArrowLeft, Play, Sparkles, Languages, Smile, Video } from "lucide-react";

export default function HelpPage() {
  return (
    <main className="min-h-screen bg-neutral-950 text-white font-sans p-6 lg:p-12">
      <header className="mb-12 flex items-center justify-between max-w-4xl mx-auto">
        <Link href="/" className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
        <div className="flex items-center gap-2">
          <Play className="w-5 h-5 text-indigo-500" />
          <span className="text-xl font-bold">NexusCut Help Center</span>
        </div>
      </header>

      <div className="max-w-4xl mx-auto space-y-16">
        
        <section id="captions" className="scroll-mt-24">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-yellow-500/10 rounded-xl flex items-center justify-center border border-yellow-500/20">
              <Sparkles className="w-5 h-5 text-yellow-400" />
            </div>
            <h2 className="text-3xl font-bold">AI Auto-Captions</h2>
          </div>
          <p className="text-neutral-300 leading-relaxed text-lg mb-4">
            Auto-captions are the core of NexusCut. We use advanced Whisper AI to perfectly transcribe your video and time the captions on-screen.
          </p>
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
            <h3 className="font-bold text-indigo-400 mb-2">How to use:</h3>
            <ol className="list-decimal list-inside space-y-2 text-neutral-300">
              <li>Upload any standard video file (MP4, MOV, WebM).</li>
              <li>Wait for the video to load, then click the <strong>Captions</strong> button in the top toolbar.</li>
              <li>Wait a few moments while the AI analyzes the audio.</li>
              <li>Once finished, play the video! You'll see dynamic, highlighted words pop up on the screen.</li>
            </ol>
          </div>
        </section>

        <section id="translate" className="scroll-mt-24">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center border border-blue-500/20">
              <Languages className="w-5 h-5 text-blue-400" />
            </div>
            <h2 className="text-3xl font-bold">1-Click Translate</h2>
          </div>
          <p className="text-neutral-300 leading-relaxed text-lg mb-4">
            Reach a global audience by instantly translating your video's captions into over 50+ different languages while preserving the exact on-screen timing.
          </p>
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
            <h3 className="font-bold text-indigo-400 mb-2">How to use:</h3>
            <ol className="list-decimal list-inside space-y-2 text-neutral-300">
              <li>Generate base captions first using the <strong>Captions</strong> button.</li>
              <li>Next to the Captions button, you'll see a language dropdown (defaults to English).</li>
              <li>Select your target language (e.g., Spanish, French, Japanese).</li>
              <li>Click <strong>Translate</strong>. The text on the screen will instantly update to the new language.</li>
            </ol>
          </div>
        </section>

        <section id="emojis" className="scroll-mt-24">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-pink-500/10 rounded-xl flex items-center justify-center border border-pink-500/20">
              <Smile className="w-5 h-5 text-pink-400" />
            </div>
            <h2 className="text-3xl font-bold">Auto-Emojis</h2>
          </div>
          <p className="text-neutral-300 leading-relaxed text-lg mb-4">
            Make your videos feel highly energetic and native to TikTok/Reels by having AI automatically insert context-aware emojis next to key words in your transcript.
          </p>
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
            <h3 className="font-bold text-indigo-400 mb-2">How to use:</h3>
            <ol className="list-decimal list-inside space-y-2 text-neutral-300">
              <li>Generate base captions first using the <strong>Captions</strong> button.</li>
              <li>Click the <strong>Auto-Emojis</strong> button in the top toolbar.</li>
              <li>AI will scan your transcript and strategically place emojis (e.g., 🚀, 🔥, 💡) next to the most impactful words.</li>
            </ol>
          </div>
        </section>

        <section id="broll" className="scroll-mt-24">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-green-500/10 rounded-xl flex items-center justify-center border border-green-500/20">
              <Video className="w-5 h-5 text-green-400" />
            </div>
            <h2 className="text-3xl font-bold">AI B-Roll Generation</h2>
          </div>
          <p className="text-neutral-300 leading-relaxed text-lg mb-4">
            Don't have engaging visuals? Let AI listen to your video, identify the topics, and automatically insert relevant cinematic stock footage from Pexels over your clips.
          </p>
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
            <h3 className="font-bold text-indigo-400 mb-2">How to use:</h3>
            <ol className="list-decimal list-inside space-y-2 text-neutral-300">
              <li>Generate base captions first.</li>
              <li>Click the green <strong>Auto B-Roll</strong> button.</li>
              <li>The AI will segment your video into 3-second chunks and overlay context-matching high-quality videos automatically.</li>
            </ol>
          </div>
        </section>

        <section id="magicclip" className="scroll-mt-24">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center border border-purple-500/20">
              <Sparkles className="w-5 h-5 text-purple-400" />
            </div>
            <h2 className="text-3xl font-bold">Magic Clip</h2>
          </div>
          <p className="text-neutral-300 leading-relaxed text-lg mb-4">
            Have a long, boring video? Magic Clip uses AI to analyze the psychology of your script, find the most engaging 15-30 second "hook", and trim the video down for you automatically.
          </p>
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
            <h3 className="font-bold text-indigo-400 mb-2">How to use:</h3>
            <ol className="list-decimal list-inside space-y-2 text-neutral-300">
              <li>Generate base captions first.</li>
              <li>Click the <strong>Magic Clip</strong> button.</li>
              <li>The AI will automatically trim the timeline to the most viral portion of your video. You can see the new boundaries on the green timeline bar!</li>
            </ol>
          </div>
        </section>

        <section id="saving" className="scroll-mt-24 pb-20">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center border border-indigo-500/20">
              <span className="text-xl">💾</span>
            </div>
            <h2 className="text-3xl font-bold">Saving & Loading Projects</h2>
          </div>
          <p className="text-neutral-300 leading-relaxed text-lg mb-4">
            You can save your current editing session and resume it later without losing your captions, B-roll, or timeline cuts!
          </p>
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
            <h3 className="font-bold text-indigo-400 mb-2">How to Save a Project:</h3>
            <ol className="list-decimal list-inside space-y-2 text-neutral-300 mb-6">
              <li>Click the <strong>Save Project</strong> button in the top toolbar.</li>
              <li>Your browser will automatically download a <code className="bg-neutral-800 px-1 rounded text-sm text-indigo-300">.nxp</code> (NexusCut Project) file to your computer's default <strong>Downloads</strong> folder.</li>
              <li><em>Note: Web browsers cannot automatically save files to specific folders like <code>C:\NexusCut\Projects</code> for security reasons. You can manually move the downloaded file there if you wish to keep them organized!</em></li>
            </ol>
            
            <h3 className="font-bold text-indigo-400 mb-2">How to Load a Project:</h3>
            <ol className="list-decimal list-inside space-y-2 text-neutral-300">
              <li>Open a fresh NexusCut Editor.</li>
              <li>Click the <strong>Load Project</strong> button in the top toolbar.</li>
              <li>Select the <code className="bg-neutral-800 px-1 rounded text-sm text-indigo-300">.nxp</code> file from your computer.</li>
              <li>Re-select the original Video file when prompted (if the browser requires it), and your entire timeline will be instantly restored!</li>
            </ol>
          </div>
        </section>

      </div>
    </main>
  );
}
