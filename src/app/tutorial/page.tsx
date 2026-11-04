import React from 'react';
import Link from 'next/link';
import { ArrowLeft, BookOpen, Download, Camera } from 'lucide-react';
import { socialFor } from '@/lib/social';

export const metadata = {
  openGraph: socialFor('/tutorial'),
  title: 'Tutorial: Edit Your First Short with Captions | NexusCut',
  description:
    'Learn the NexusCut workflow in minutes: import a clip, cut it on the timeline, add animated word-by-word captions and export for TikTok, Reels and Shorts.',
  alternates: { canonical: '/tutorial' },
};

export default function TutorialPage() {
  return (
    <div className="min-h-screen bg-black text-neutral-300 font-sans">
      {/* Navbar */}
      <nav className="h-16 bg-neutral-950 border-b border-neutral-800 flex items-center px-8 sticky top-0 z-50">
        <Link href="/editor" className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 transition-colors font-medium">
          <ArrowLeft className="w-5 h-5" />
          Back to Editor
        </Link>
        <div className="mx-auto flex items-center gap-3">
          <BookOpen className="w-6 h-6 text-white" />
          <h1 className="text-xl font-bold text-white tracking-tight">NexusCut Beginner's Guide</h1>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        <header className="mb-16 text-center">
          <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6 tracking-tight">
            How to Edit Your First Video with <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500">NexusCut</span>
          </h2>
          <p className="text-xl text-neutral-400">
            Complete newbie? No problem. Follow this step-by-step guide to go from zero to a finished, publish-ready video.
          </p>
        </header>

        <div className="space-y-12">
          
          {/* Step 1 */}
          <section className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8 shadow-2xl">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 bg-indigo-500 text-white rounded-full flex items-center justify-center font-bold text-xl">1</div>
              <h3 className="text-2xl font-bold text-white">Starting Your Project & Setting the Canvas</h3>
            </div>
            <div className="space-y-3 text-lg text-neutral-300 pl-14">
              <p>Before you add any videos, you need to tell NexusCut what kind of video you are making.</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Look at the top bar in the editor. You'll see an aspect ratio dropdown (usually defaults to <strong>9:16</strong>).</li>
                <li><strong>9:16</strong> is perfect for TikTok, YouTube Shorts, and Instagram Reels (tall videos).</li>
                <li><strong>16:9</strong> is for standard YouTube videos or TV (wide videos).</li>
                <li><strong>1:1</strong> is for square Instagram posts.</li>
                <li>Select the one you need. The black Canvas in the center will immediately change its shape to match.</li>
              </ul>
            </div>
          </section>

          {/* Step 2 */}
          <section className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8 shadow-2xl">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 bg-indigo-500 text-white rounded-full flex items-center justify-center font-bold text-xl">2</div>
              <h3 className="text-2xl font-bold text-white">Getting Your Video into NexusCut</h3>
            </div>
            <div className="space-y-3 text-lg text-neutral-300 pl-14">
              <p>You can't edit without footage! In the top-left corner (in the Sidebar), you'll see the <strong>Media</strong> tab.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                <div className="bg-neutral-950 p-5 rounded-2xl border border-neutral-800">
                  <h4 className="font-bold text-white flex items-center gap-2 mb-2"><Download className="w-5 h-5 text-indigo-400" /> Option A: Upload Files</h4>
                  <p className="text-sm">If you already have a video recorded on your phone or computer, simply click the <strong>Upload</strong> area in the Media tab and select your video or audio file.</p>
                </div>
                <div className="bg-neutral-950 p-5 rounded-2xl border border-neutral-800">
                  <h4 className="font-bold text-white flex items-center gap-2 mb-2"><Camera className="w-5 h-5 text-emerald-400" /> Option B: Use Your Camera</h4>
                  <p className="text-sm">Don&apos;t have a video yet? Click <strong>Record</strong> in the Media tab, then choose <strong>Camera</strong> to film yourself or <strong>Screen</strong> to capture a tab, window, or display with microphone narration. Allow access, choose your devices if needed, and click Start Recording. When you stop, the clip is added to your project automatically.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Step 3 */}
          <section className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8 shadow-2xl">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 bg-indigo-500 text-white rounded-full flex items-center justify-center font-bold text-xl">3</div>
              <h3 className="text-2xl font-bold text-white">Building the Timeline (Cutting & Trimming)</h3>
            </div>
            <div className="space-y-3 text-lg text-neutral-300 pl-14">
              <p>The Timeline (the bottom half of the screen) is where the actual editing happens.</p>
              <ul className="list-decimal pl-6 space-y-2">
                <li>Once your video is in the Media Library, click and <strong>drag it down</strong> onto the track labeled <strong>Video 1</strong> in the Timeline.</li>
                <li>Your video is now a "clip" on the timeline. If you press the Play button (or Spacebar), you'll see it play in the Canvas above.</li>
                <li><strong>To trim the beginning or end:</strong> Hover your mouse over the left or right edge of the clip until your cursor changes. Click and drag inwards to trim off the boring parts.</li>
                <li><strong>To split a clip in half:</strong> Click on the spot in the timeline where you want to make a cut to move the red line (the Playhead) there. Then click the <strong>Split (Scissors)</strong> icon on the toolbar just above the timeline. You can now delete one half by selecting it and pressing Backspace/Delete.</li>
              </ul>
            </div>
          </section>

          {/* Step 4 */}
          <section className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8 shadow-2xl">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 bg-indigo-500 text-white rounded-full flex items-center justify-center font-bold text-xl">4</div>
              <h3 className="text-2xl font-bold text-white">Positioning & Resizing</h3>
            </div>
            <div className="space-y-3 text-lg text-neutral-300 pl-14">
              <p>Sometimes your video doesn't perfectly fit the Canvas (for example, if you imported a wide video into a tall 9:16 Canvas).</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Click on your video clip in the Timeline to select it.</li>
                <li>Look at the <strong>Canvas</strong> (the center preview window). You'll see a bounding box around your video.</li>
                <li>Click and drag the video to move it around.</li>
                <li>Grab any of the corner handles and drag to resize the video until it fills the screen perfectly.</li>
              </ul>
            </div>
          </section>

          {/* Step 5 */}
          <section className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8 shadow-2xl">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 bg-indigo-500 text-white rounded-full flex items-center justify-center font-bold text-xl">5</div>
              <h3 className="text-2xl font-bold text-white">Using AI Magic</h3>
            </div>
            <div className="space-y-3 text-lg text-neutral-300 pl-14">
              <p>This is where NexusCut shines. Instead of doing things manually, let our AI help.</p>
              <ul className="list-disc pl-6 space-y-3">
                <li><strong>Auto-Captions:</strong> In the left Sidebar, open <strong>AI Magic</strong> and generate captions. Review and correct the word timing and text, then adjust supported appearance settings.</li>
                <li><strong>Remove an image background:</strong> Use the standalone image-background tool for still images. The current editor does not promise automatic background removal for a timeline video clip.</li>
                <li><strong>Smart Cut:</strong> Choose Smart Cut to detect and remove silence from the timeline. Play the result immediately and use the editor&apos;s <strong>Undo</strong> button if you prefer the original pacing.</li>
                <li><strong>Magic Clip:</strong> After generating captions, Magic Clip can suggest a 15–30 second transcript range. Treat it as a starting point: review the chosen boundaries and adjust or undo them when needed.</li>
              </ul>
            </div>
          </section>

          {/* Step 6 */}
          <section className="bg-neutral-900 border border-emerald-500/30 rounded-3xl p-8 shadow-2xl">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 bg-emerald-600 text-white rounded-full flex items-center justify-center font-bold text-xl">6</div>
              <h3 className="text-2xl font-bold text-white">Growth Mode & Retention Focus Captions (Pro)</h3>
            </div>
            <div className="space-y-3 text-lg text-neutral-300 pl-14">
              <p>Growth Mode creates a tightened vertical Short and gives its captions synchronized active-word emphasis. It is available only on Pro.</p>
              <ol className="list-decimal pl-6 space-y-2">
                <li>Place a talking-head video on the timeline, then click <strong>Growth Mode</strong> in the editor toolbar.</li>
                <li>Choose <strong>Analyze video</strong>. Videos over 60 seconds receive three selectable hook options scored for curiosity, clarity, emotion, and opening strength; short clips keep their full context.</li>
                <li>Review the excerpt and estimated dead-air reduction, select an option, and choose <strong>Apply selected Short</strong>.</li>
                <li>Growth Mode switches the project to 9:16, tightens conservative dead air, and creates <strong>Retention Focus</strong> captions. A readable phrase remains on screen while each spoken word changes to the highlight color.</li>
                <li>Play the result before continuing. Choose <strong>Undo Growth changes</strong> in the confirmation window—or the normal Undo button—to restore the earlier timeline if needed.</li>
              </ol>
            </div>
          </section>

          {/* Step 7 */}
          <section className="bg-neutral-900 border border-violet-500/30 rounded-3xl p-8 shadow-2xl">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 bg-violet-600 text-white rounded-full flex items-center justify-center font-bold text-xl">7</div>
              <h3 className="text-2xl font-bold text-white">Nexus ScriptCut (Pro)</h3>
            </div>
            <div className="space-y-3 text-lg text-neutral-300 pl-14">
              <p>ScriptCut edits a video through its timed transcript and can suggest filler words and exact repeated words or short phrases.</p>
              <ol className="list-decimal pl-6 space-y-2">
                <li>Generate Auto-Captions first, then open <strong>AI Magic → Nexus ScriptCut</strong>.</li>
                <li>Violet words are optional suggestions. Click any transcript word to include or exclude it from removal.</li>
                <li>Apply the selected cuts, listen through the edit, and use <strong>Undo</strong> to restore the complete timeline and transcript if the speech sounds unnatural.</li>
              </ol>
            </div>
          </section>

          {/* Step 8 */}
          <section className="bg-neutral-900 border border-amber-500/30 rounded-3xl p-8 shadow-2xl">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 bg-amber-600 text-white rounded-full flex items-center justify-center font-bold text-xl">8</div>
              <h3 className="text-2xl font-bold text-white">Set Up Your Brand Kit (Pro and Agency)</h3>
            </div>
            <div className="space-y-3 text-lg text-neutral-300 pl-14">
              <ol className="list-decimal pl-6 space-y-2">
                <li>Click <strong>Brand Kit</strong> in the editor toolbar. Save a primary caption color, a secondary active-word color, an optional custom font, and an optional logo.</li>
                <li>Saved colors and typography apply automatically when captions are created. The secondary color is used for Retention Focus word highlighting.</li>
                <li>Your logo is <strong>off by default</strong>. In Export settings, enable <strong>Apply Brand Kit logo</strong>, then choose its position, size, and opacity. It will appear in the preview and final export only when enabled.</li>
                <li>Agency members can open <strong>Client Kits</strong> from the same editor toolbar, save up to five client identities, and activate the correct kit before editing or exporting.</li>
              </ol>
            </div>
          </section>

          {/* Step 9 */}
          <section className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8 shadow-2xl">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 bg-indigo-500 text-white rounded-full flex items-center justify-center font-bold text-xl">9</div>
              <h3 className="text-2xl font-bold text-white">Adding Text & Titles</h3>
            </div>
            <div className="space-y-3 text-lg text-neutral-300 pl-14">
              <p>Want to add a big title or manual text?</p>
              <ul className="list-decimal pl-6 space-y-2">
                <li>Open the <strong>Text</strong> tab in the sidebar (the "T" icon).</li>
                <li>Click <strong>Add Title</strong> or choose a preset style. A text clip will appear on your timeline.</li>
                <li>Look at the <strong>Properties Panel</strong> on the right side of the screen. Here you can change what the text says, pick a font, change colors, and add shadows.</li>
                <li>Drag the text on the Canvas to move it, and drag the text clip's edges on the Timeline to control how long it stays on screen.</li>
              </ul>
            </div>
          </section>

          {/* Step 10 */}
          <section className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8 shadow-2xl">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 bg-indigo-500 text-white rounded-full flex items-center justify-center font-bold text-xl">10</div>
              <h3 className="text-2xl font-bold text-white">Audio & AI Voice Generation (TTS)</h3>
            </div>
            <div className="space-y-3 text-lg text-neutral-300 pl-14">
              <p>Great video needs great audio. Use the Audio tab to add sound effects, replace original sound, or narrate as the video plays.</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Mute the original sound:</strong> Click the video clip you want to replace, open <strong>Audio</strong>, then choose <strong>Mute selected video audio</strong>. This affects the final export. Choose Restore selected video audio to undo it. You can also use the clip&apos;s Volume slider in the Properties panel.</li>
                <li><strong>Record your own voiceover:</strong> Put the playhead where narration should begin, press Play, then click <strong>Record voiceover</strong> in Audio. Click Stop recording when you finish. Your narration is placed on the Audio track at that exact point.</li>
                <li><strong>AI Voice (TTS):</strong> Prefer an AI voice? Enter a script in the AI Voice section of Audio, select a voice, and generate it. It is added to the Audio track so you can position and trim it like any other clip.</li>
              </ul>
            </div>
          </section>
          
          {/* Step 11 */}
          <section className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8 shadow-2xl">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 bg-indigo-500 text-white rounded-full flex items-center justify-center font-bold text-xl">11</div>
              <h3 className="text-2xl font-bold text-white">Transitions & Effects</h3>
            </div>
            <div className="space-y-3 text-lg text-neutral-300 pl-14">
              <p>Add some polish to your video by adding transitions between clips.</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Open the <strong>Transitions</strong> tab in the sidebar.</li>
                <li>If you have two video clips next to each other on the timeline, simply drag a transition (like a Fade or a Wipe) and drop it right between them. If you want audio on your transitions, you can add your choice of audio manually from the Audio tab.</li>
                <li>Open the <strong>Effects</strong> tab to find visual filters like VHS or Glitch, which you can drag onto any video clip to change its look.</li>
              </ul>
            </div>
          </section>

          {/* Step 12 */}
          <section className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8 shadow-2xl">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 bg-indigo-500 text-white rounded-full flex items-center justify-center font-bold text-xl">12</div>
              <h3 className="text-2xl font-bold text-white">Saving and Loading Your Project</h3>
            </div>
            <div className="space-y-3 text-lg text-neutral-300 pl-14">
              <p>Don&apos;t lose your hard work. Save a local project file whenever you want to continue later or keep a backup.</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Click the <strong>Save Local</strong> disk icon at the top of the editor. It downloads a small project file to your Downloads folder; it does not copy the original video files.</li>
                <li>When you return, click <strong>Load Local</strong> and select that project file. If NexusCut asks for missing media, drag the same original video or audio files back into the Media Library to relink them.</li>
              </ul>
            </div>
          </section>

          {/* Step 13 */}
          <section className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8 shadow-2xl">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 bg-indigo-500 text-white rounded-full flex items-center justify-center font-bold text-xl">13</div>
              <h3 className="text-2xl font-bold text-white">Exporting Your Masterpiece</h3>
            </div>
            <div className="space-y-3 text-lg text-neutral-300 pl-14">
              <p>Once you are happy with how your video looks and sounds when you press play, it's time to save it as a final video file!</p>
              <ul className="list-decimal pl-6 space-y-2">
                <li>Look at the top right corner of the screen for the big <strong>Export Video</strong> button.</li>
                <li>Choose <strong>Fast — 540p</strong> for a quick draft. High quality is up to 720p on Free and up to 1080p on Creator and Pro.</li>
                <li>Click Start export. If other creators are exporting, NexusCut shows your place in line and you can keep editing while it renders.</li>
                <li>When complete, your MP4 is placed in your computer&apos;s Downloads folder. Play it once before posting to confirm that captions, audio, and transitions are right.</li>
              </ul>
            </div>
          </section>

          <section className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8 shadow-2xl">
            <h3 className="text-2xl font-bold text-white mb-4">Account, Plans & the Pro Trial</h3>
            <div className="space-y-3 text-lg text-neutral-300">
              <p>Use <strong>Log In</strong> on the main site to sign in with your email and password. After a successful login, that link changes to <strong>My Account</strong>, where you can see your current membership and open billing controls.</p>
              <p>Creator includes unlimited high-quality exports up to 1080p and the standard editor tools. Pro adds Growth Mode, Retention Focus captions, Nexus ScriptCut, filler and repetition suggestions, priority exports, and Brand Kit. Agency adds five switchable client Brand Kits, the highest export-queue priority, and client-use rights for one account holder.</p>
              <p>New Pro subscribers receive full Pro access free for <strong>7 days</strong>. A payment method is collected at signup; billing begins at $29/month when the trial ends unless the subscription is cancelled beforehand.</p>
            </div>
          </section>

        </div>

        <div className="mt-20 text-center pb-20">
          <Link href="/editor" className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-indigo-600 text-white font-bold text-lg hover:bg-indigo-500 transition-all shadow-[0_0_40px_rgba(79,70,229,0.4)] hover:-translate-y-1">
            Start Your First Project
          </Link>
        </div>

      </main>
    </div>
  );
}
