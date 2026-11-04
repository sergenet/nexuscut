import re

with open(r'C:\NexusCut\src\app\help\page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Ensure VolumeX is imported
import_regex = r'import \{([^}]+)\} from "lucide-react";'
match = re.search(import_regex, content)
if match:
    icons_str = match.group(1)
    if 'VolumeX' not in icons_str:
        new_icons = icons_str + ", VolumeX"
        content = content.replace(icons_str, new_icons)

tts_section = """
        <section id="tts" className="scroll-mt-24">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-teal-500/10 rounded-xl flex items-center justify-center border border-teal-500/20">
              <VolumeX className="w-5 h-5 text-teal-400" />
            </div>
            <h2 className="text-3xl font-bold">AI Voiceovers (TTS)</h2>
          </div>
          <p className="text-neutral-300 leading-relaxed text-lg mb-4">
            Generate ultra-realistic AI voiceovers in seconds. Perfect for faceless videos, Reddit story times, or adding narration to your B-Roll.
          </p>
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
            <h3 className="font-bold text-indigo-400 mb-2">How to use the TTS tool:</h3>
            <ul className="list-disc list-inside space-y-2 text-neutral-300">
              <li>In the Video Editor, click on <strong>Step 3: Style & Audio</strong> in the top navigation bar.</li>
              <li>Scroll down to the <strong>Audio & TTS</strong> section at the bottom of the right panel.</li>
              <li>Type or paste the script you want the AI to read into the text box.</li>
              <li>Select your preferred voice from the dropdown menu (e.g. Alloy, Echo, Fable, Onyx, Nova, Shimmer).</li>
              <li>Click the <strong>Add Voice</strong> button.</li>
              <li>The AI will instantly generate the audio, preview it, and set it as your Background Music track!</li>
            </ul>
            <div className="mt-4 p-4 bg-teal-500/10 border border-teal-500/20 rounded-lg">
              <h4 className="font-bold text-teal-300 mb-1">Pro Tip: Volume Mixing</h4>
              <p className="text-sm text-neutral-300">
                Once the voiceover is generated, it is added as a background audio track. You can easily balance its volume against the original video's audio by using the <strong>Audio Tracks</strong> volume sliders located right above the timeline!
              </p>
            </div>
          </div>
        </section>
"""

# Insert right before the last closing </div>\n    </main>
content = content.replace('      </div>\n    </main>', tts_section + '\n      </div>\n    </main>')

with open(r'C:\NexusCut\src\app\help\page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
