import re

with open(r'C:\NexusCut\src\app\help\page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Add Scissors to lucide-react import
import_regex = r'import \{([^}]+)\} from "lucide-react";'
match = re.search(import_regex, content)
if match:
    icons_str = match.group(1)
    if 'Scissors' not in icons_str:
        new_icons = icons_str + ", Scissors"
        content = content.replace(icons_str, new_icons)

new_section = """
        <section id="timeline" className="scroll-mt-24">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center border border-red-500/20">
              <Scissors className="w-5 h-5 text-red-400" />
            </div>
            <h2 className="text-3xl font-bold">Pro Timeline Controls</h2>
          </div>
          <p className="text-neutral-300 leading-relaxed text-lg mb-4">
            Take full manual control over your video edits. Our playhead-based editing toolbar lets you precision-trim clips, split videos, and cut out mistakes just like you would on TikTok or CapCut.
          </p>
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
            <h3 className="font-bold text-indigo-400 mb-2">How to use manual editing:</h3>
            <ul className="list-disc list-inside space-y-2 text-neutral-300">
              <li>Click anywhere on the visual Timeline below the video to move the red playhead.</li>
              <li><strong>?? Split:</strong> Click the Scissors icon to cut the current clip into two pieces at the playhead.</li>
              <li><strong>?? Trim Start (Set In):</strong> Trims the beginning of the clip so it starts at your playhead.</li>
              <li><strong>?? Trim End (Set Out):</strong> Trims the end of the clip so it ends at your playhead.</li>
              <li><strong>??? Delete:</strong> Click the Trash icon to completely remove the clip that your playhead is inside.</li>
              <li><strong>? Restore/Add:</strong> If you deleted a section by mistake, move your playhead to the blank space and click the Plus icon to restore a clip there.</li>
            </ul>
            <div className="mt-4 p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-lg">
              <h4 className="font-bold text-indigo-300 mb-1">Pro Tip: Editing Magic Clips</h4>
              <p className="text-sm text-neutral-300">
                If the AI Magic Clip feature cuts off a word slightly too early, just click slightly further down the timeline and click <strong>Trim End</strong> to expand the clip manually!
              </p>
            </div>
          </div>
        </section>
"""

# Insert right before the last closing </div>\n    </main>
content = content.replace('      </div>\n    </main>', new_section + '\n      </div>\n    </main>')

with open(r'C:\NexusCut\src\app\help\page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
