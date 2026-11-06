import Link from "next/link";
import { ArrowLeft, Play, Sparkles, Languages, Smile, Video , Scissors, VolumeX} from "lucide-react";
import { socialFor } from '@/lib/social';

export const metadata = {
  openGraph: socialFor('/help'),
  title: 'Help & How-To Guides | NexusCut',
  description:
    'Guides for the NexusCut editor: import media, generate auto-captions, style word-by-word text, fix export problems and manage your subscription.',
  alternates: { canonical: '/help' },
};

export default function HelpPage() {
  return (
    <main className="min-h-screen bg-neutral-950 text-white font-sans p-6 lg:p-12">
      <header className="mb-12 flex items-center justify-between max-w-4xl mx-auto">
        <Link href="/" className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
        <div className="flex items-center gap-2">
          <Play className="w-5 h-5 text-indigo-500" />
          <h1 className="text-xl font-bold">NexusCut Help Center</h1>
        </div>
      </header>

      <div className="max-w-4xl mx-auto space-y-16">
        <p className="text-neutral-400 leading-relaxed">
          Short, tested answers for the things that actually go wrong in the editor: media that
          will not relink, captions that land on the wrong word, an export that stalls, or a
          subscription you need to change. Each answer below describes the current build, not a
          planned feature. If your question is not here, the tutorial walks through the whole
          workflow in order, and support@nexuscut.io reaches a human.
        </p>
        <section id="faq" className="scroll-mt-24">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center border border-indigo-500/20"><span className="text-xl">?</span></div>
            <h2 className="text-3xl font-bold">Quick FAQ</h2>
          </div>
          <div className="space-y-3">
            {[
              ['Can I record without another app?', 'Yes. Open Media and choose Record. Select Camera to film yourself, or Screen to capture a tab, window, or display with microphone narration. The clip is added to the project automatically.'],
              ['How do I replace a video’s sound with my voice?', 'Select the video clip, open Audio, choose Mute selected video audio, then place the playhead, press Play, and choose Record voiceover. The narration is added to the Audio track.'],
              ['Does the preview speaker button mute my final video?', 'No. That button only silences your preview. Use Mute selected video audio or the selected clip’s Volume control to change the exported video.'],
              ['Why does Load Local say media is missing?', 'A local project file saves your edits, not a copy of the original video. Drag the same original video or audio files into Media to relink them.'],
              ['Where is my exported file?', 'After export completes, NexusCut downloads the MP4 to your browser’s normal Downloads folder.'],
              ['Which export setting should I use?', 'Use Fast 540p for drafts and testing. Use High quality 1080p for a video you are ready to publish.'],
              ['Where can I see my membership?', 'Sign in from the main navigation. After login, Log In changes to My Account. Open My Account to see whether you are on Free, Creator, or Pro and to access billing controls.'],
              ['What is included in the 7-day Pro trial?', 'New Pro subscribers receive all Pro features for 7 days. Stripe collects a payment method, but the $29 monthly billing begins only after the trial unless you cancel beforehand.'],
              ['What does Growth Mode change?', 'Growth Mode is a Pro workflow that finds and scores hook options for longer videos, builds a tightened 9:16 Short with conservative dead-air removal, and adds synchronized Retention Focus captions.'],
              ['Why does every spoken word change color?', 'That is Retention Focus. The readable caption phrase stays visible while the currently spoken word uses the secondary highlight color. This is intentionally different from standard captions.'],
              ['Can I undo Growth Mode or ScriptCut?', 'Yes. Growth Mode offers Undo Growth changes after applying a Short, and the editor Undo button can restore Growth Mode or ScriptCut timeline changes. Review the result before making more edits.'],
              ['How do I open Brand Kit?', 'Brand Kit is available on Pro and Agency. Open it directly from the editor toolbar. Agency members use Client Kits there to save and switch among as many as five client identities. Saved colors and font apply to captions; a saved logo remains off until you enable it in Export settings.'],
              ['What is the difference between Creator and Pro?', 'Creator provides unlimited exports up to 1080p and the standard editor tools. Pro adds Growth Mode, Retention Focus captions, Nexus ScriptCut, filler and repeated-phrase suggestions, priority exports, and Brand Kit.'],
              ['What does Agency include?', 'Agency includes everything in Pro, five switchable client Brand Kits, the highest export-queue priority, and permission for the account holder to create exports for clients. It is a single-user plan and does not include team seats.'],
            ].map(([question, answer]) => <div key={question} className="rounded-xl border border-neutral-800 bg-neutral-900 p-5"><h3 className="font-bold text-white">{question}</h3><p className="mt-2 text-sm leading-6 text-neutral-300">{answer}</p></div>)}
          </div>
        </section>

        <section id="scriptcut" className="scroll-mt-24">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-violet-500/10 rounded-xl flex items-center justify-center border border-violet-500/20">
              <Scissors className="w-5 h-5 text-violet-400" />
            </div>
            <h2 className="text-3xl font-bold">Nexus ScriptCut (Pro)</h2>
          </div>
          <p className="text-neutral-300 leading-relaxed text-lg mb-4">
            ScriptCut lets Pro members shorten a video by selecting spoken words in its timed transcript. It can highlight filler words and exact repeated words or short phrases, but every suggestion is optional and should be reviewed.
          </p>
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
            <h3 className="font-bold text-indigo-400 mb-2">How to use:</h3>
            <ol className="list-decimal list-inside space-y-2 text-neutral-300">
              <li>Place the source video on the timeline and generate <strong>Auto Captions</strong>.</li>
              <li>Open <strong>AI Magic</strong>, then choose <strong>Nexus ScriptCut</strong>.</li>
              <li>Review the suggestions and click any transcript word to include or exclude it.</li>
              <li>Choose <strong>Apply reversible cuts</strong>, then play the result to check its pacing.</li>
              <li>Use <strong>Undo</strong> if you want to restore the complete timeline and transcript.</li>
            </ol>
          </div>
        </section>
        
        <section id="captions" className="scroll-mt-24">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-yellow-500/10 rounded-xl flex items-center justify-center border border-yellow-500/20">
              <Sparkles className="w-5 h-5 text-yellow-400" />
            </div>
            <h2 className="text-3xl font-bold">AI Auto-Captions</h2>
          </div>
          <p className="text-neutral-300 leading-relaxed text-lg mb-4">
            Auto-captions use OpenAI Whisper to create word-timed text. Always review the transcription because accuracy varies with audio quality, language, and background noise.
          </p>
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
            <h3 className="font-bold text-indigo-400 mb-2">How to use:</h3>
            <ol className="list-decimal list-inside space-y-2 text-neutral-300">
              <li>Upload any standard video file (MP4, MOV, WebM).</li>
              <li>Wait for the video to load, then open <strong>AI Magic</strong> in the left sidebar and select <strong>Auto Captions</strong>.</li>
              <li>Wait while the AI analyzes the audio. Longer videos naturally take longer.</li>
              <li>Once finished, play the video! You'll see dynamic, highlighted words pop up on the screen.</li>
            </ol>
            <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <h4 className="font-bold text-yellow-300 mb-1">Pro Tip: Editing Transcripts</h4>
              <p className="text-sm text-neutral-300">
                Notice a typo? Open <strong>Bulk Edit Captions</strong> from the Text tab to review caption text, or edit the Raw Transcription in AI Magic before creating a revised caption set.
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
            Optionally ask AI to suggest emojis beside selected words in the transcript. Review the suggestions for tone and meaning before export.
          </p>
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
            <h3 className="font-bold text-indigo-400 mb-2">How to use:</h3>
            <ol className="list-decimal list-inside space-y-2 text-neutral-300">
              <li>Generate base captions first using the <strong>Captions</strong> button.</li>
              <li>Click the <strong>Auto-Emojis</strong> button in the top toolbar.</li>
              <li>AI will suggest emoji placements (for example 🚀, 🔥, or 💡) based on the transcript.</li>
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
            Let AI use your captions to propose search terms and request portrait stock clips from Pexels. Availability and relevance depend on the Pexels catalog and configured API access.
          </p>
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
            <h3 className="font-bold text-indigo-400 mb-2">How to use:</h3>
            <ol className="list-decimal list-inside space-y-2 text-neutral-300">
              <li>Generate base captions first.</li>
              <li>Click the green <strong>Auto B-Roll</strong> button.</li>
              <li>The tool proposes short overlay segments. Review every clip, placement, and license before publishing.</li>
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
            Magic Clip asks a language model to suggest a 15–30 second excerpt from the transcript and adjusts the timeline to that range. The suggestion is subjective and does not predict performance.
          </p>
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
            <h3 className="font-bold text-indigo-400 mb-2">How to use:</h3>
            <ol className="list-decimal list-inside space-y-2 text-neutral-300">
              <li>Generate base captions first.</li>
              <li>Click the <strong>Magic Clip</strong> button.</li>
              <li>The suggested range is applied to the timeline. Review the new boundaries and undo or adjust them if needed.</li>
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
              <li>Click the <strong>Save Local</strong> disk icon in the top toolbar.</li>
              <li>Your browser will automatically download a <code className="bg-neutral-800 px-1 rounded text-sm text-indigo-300">.nxp</code> (NexusCut Project) file to your computer's default <strong>Downloads</strong> folder.</li>
              <li><em>Note: Web browsers cannot automatically save files to specific folders like <code>C:\NexusCut\Projects</code> for security reasons. You can manually move the downloaded file there if you wish to keep them organized!</em></li>
            </ol>
            
            <h3 className="font-bold text-indigo-400 mb-2">How to Load a Project:</h3>
            <ol className="list-decimal list-inside space-y-2 text-neutral-300">
              <li>Open a fresh NexusCut Editor.</li>
              <li>Click <strong>Load Local</strong> in the top toolbar.</li>
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
            <h2 className="text-3xl font-bold">Smart Cut & Timeline Controls</h2>
          </div>
          <p className="text-neutral-300 leading-relaxed text-lg mb-4">
            Smart Cut removes detected silence without adding Growth Mode captions or choosing a hook. Use it when you want only dead-air removal, or take full manual control over your edits.
          </p>
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
            <h3 className="font-bold text-indigo-400 mb-2">How to use Smart Cut:</h3>
            <ul className="list-disc list-inside space-y-2 text-neutral-300">
              <li>Place the source clip on the timeline, open <strong>AI Magic</strong>, and choose <strong>Smart Cut</strong>.</li>
              <li>Wait while NexusCut detects silence and rebuilds the timeline from the spoken sections.</li>
              <li>Play the complete result to check that intentional pauses were not removed.</li>
              <li>Use the editor&apos;s <strong>Undo</strong> button if you want the original pacing back.</li>
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
            Add either your own narration or an AI voice, directly on the Audio track.
          </p>
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
            <h3 className="font-bold text-indigo-400 mb-2">Record your own narration</h3>
            <ul className="list-disc list-inside space-y-2 text-neutral-300">
              <li>Select the video clip and open <strong>Audio</strong>.</li>
              <li>Choose <strong>Mute selected video audio</strong> if you want to replace the original sound in the export.</li>
              <li>Place the playhead, press Play, then choose <strong>Record voiceover</strong>. Stop when finished; the clip appears on the Audio track.</li>
            </ul>

            <h3 className="font-bold text-indigo-400 mt-6 mb-2">Generate an AI voice</h3>
            <ul className="list-disc list-inside space-y-2 text-neutral-300">
              <li>In Audio, type the script into the <strong>AI Voice</strong> section and choose a voice.</li>
              <li>Generate the narration, then adjust its position, length, and volume on the Audio track.</li>
              <li>Mute the selected video audio if you do not want the original sound mixed with the AI voice.</li>
            </ul>
          </div>
        </section>

      </div>
    </main>
  );
}
