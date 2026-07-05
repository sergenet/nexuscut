import Link from "next/link";
import { ArrowLeft, Play, Sparkles, Languages, Smile, Video , Scissors, VolumeX} from "lucide-react";

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
            <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <h4 className="font-bold text-yellow-300 mb-1">Pro Tip: Editing Transcripts</h4>
              <p className="text-sm text-neutral-300">
                Notice a typo? Simply <strong>double-click any word</strong> in the interactive transcript below the video to edit it instantly! The on-screen captions will update automatically.
              </p>
            </div>
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

        <section id="timeline" className="scroll-mt-24">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center border border-red-500/20">
              <Scissors className="w-5 h-5 text-red-400" />
            </div>
            <h2 className="text-3xl font-bold">Silence Removal & Timeline Controls</h2>
          </div>
          <p className="text-neutral-300 leading-relaxed text-lg mb-4">
            Make your videos punchier by cutting out dead air, or take full manual control over your video edits.
          </p>
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
            <h3 className="font-bold text-indigo-400 mb-2">How to use Silence Cut:</h3>
            <ul className="list-disc list-inside space-y-2 text-neutral-300">
              <li>Go to <strong>Step 2: Clips & Timing</strong>.</li>
              <li>Adjust the decibel slider and click <strong>Apply Silence Cut</strong>.</li>
              <li>The AI will slice out all the quiet moments in your video.</li>
              <li>If you make a mistake or want the pauses back, simply click the <strong>Revert To Original</strong> button next to it!</li>
            </ul>
            
            <h3 className="font-bold text-indigo-400 mt-6 mb-2">Manual Editing:</h3>
            <ul className="list-disc list-inside space-y-2 text-neutral-300">
              <li>Click anywhere on the green timeline bar to move the video <strong>Playhead</strong>.</li>
              <li>Once the Playhead is positioned where you want to make a cut, click the <strong>✂️ Split</strong> button in the timeline toolbar.</li>
              <li>To delete a mistake, split the video at the start and end of the mistake, select the middle clip, and press the <strong>Delete</strong> key.</li>
              <li>NexusCut will automatically ripple-delete, pulling all subsequent clips to the left to close the gap!</li>
            </ul>
          </div>
        </section>

        <section id="tts" className="scroll-mt-24 pb-20">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-teal-500/10 rounded-xl flex items-center justify-center border border-teal-500/20">
              <VolumeX className="w-5 h-5 text-teal-400" />
            </div>
            <h2 className="text-3xl font-bold">AI Voiceovers (TTS)</h2>
          </div>
          <p className="text-neutral-300 leading-relaxed text-lg mb-4">
            Generate ultra-realistic AI voiceovers in seconds. There are two ways to do this: Per-Slide (for perfect pacing) or Full-Video.
          </p>
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
            <h3 className="font-bold text-indigo-400 mb-2">Method 1: Slide-by-Slide (Recommended)</h3>
            <ul className="list-disc list-inside space-y-2 text-neutral-300">
              <li>In the <strong>Multi-Slide Sequence Generator</strong> (Step 1), click the small 🎙️ (Microphone) icon next to a slide.</li>
              <li>Type the script for that specific slide and click OK.</li>
              <li>The AI instantly generates the audio and attaches it to the slide, guaranteeing perfect pacing and dramatic pauses!</li>
            </ul>

            <h3 className="font-bold text-indigo-400 mt-6 mb-2">Method 2: Full Video Replacement</h3>
            <ul className="list-disc list-inside space-y-2 text-neutral-300">
              <li>In the Video Editor, go to <strong>Step 3: Style & Audio</strong>.</li>
              <li>Click <strong>Copy from Captions</strong> (or type your own script) into the TTS text box.</li>
              <li>Select your preferred voice and click <strong>Add Voice</strong>.</li>
              <li>You can download the MP3 directly, or leave the <strong>"Use this voiceover for Export"</strong> box checked. When you export your video in Step 4, the original audio will be seamlessly replaced by your new AI voice!</li>
            </ul>
          </div>
        </section>

      </div>
    </main>
  );
}
