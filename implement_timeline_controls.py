import re

with open(r'C:\NexusCut\src\components\VideoEditor.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add icons to the import statement
# import { Upload, Play, Pause, Scissors, Type, Download, Loader2, Sparkles, VolumeX, Smile, Music, ZoomIn, Video, Save, Trash } from "lucide-react";
icon_import_regex = r'import \{([^}]+)\} from "lucide-react";'
match = re.search(icon_import_regex, content)
if match:
    icons_str = match.group(1)
    if 'Plus' not in icons_str:
        new_icons = icons_str + ", Plus, ArrowRightToLine, ArrowLeftToLine"
        content = content.replace(icons_str, new_icons)

# 2. Add the timeline editing logic functions
# We can insert them right before handleExport
logic = """
  // TIMELINE EDITING CONTROLS
  const splitSegment = () => {
    const idx = activeSegments.findIndex(s => currentTime > s.start && currentTime < s.end);
    if (idx === -1) return alert("Playhead is not inside an active clip.");
    const seg = activeSegments[idx];
    const newSegs = [...activeSegments];
    newSegs.splice(idx, 1, { start: seg.start, end: currentTime }, { start: currentTime, end: seg.end });
    setActiveSegments(newSegs);
  };

  const setInPoint = () => {
    const idx = activeSegments.findIndex(s => currentTime > s.start && currentTime < s.end);
    if (idx === -1) return alert("Playhead is not inside an active clip.");
    const newSegs = [...activeSegments];
    newSegs[idx].start = currentTime;
    setActiveSegments(newSegs);
  };

  const setOutPoint = () => {
    const idx = activeSegments.findIndex(s => currentTime > s.start && currentTime < s.end);
    if (idx === -1) return alert("Playhead is not inside an active clip.");
    const newSegs = [...activeSegments];
    newSegs[idx].end = currentTime;
    setActiveSegments(newSegs);
  };

  const deleteSegment = () => {
    const idx = activeSegments.findIndex(s => currentTime >= s.start && currentTime <= s.end);
    if (idx === -1) return alert("Playhead is not inside an active clip.");
    const newSegs = [...activeSegments];
    newSegs.splice(idx, 1);
    setActiveSegments(newSegs);
  };

  const addSegment = () => {
    const idx = activeSegments.findIndex(s => currentTime >= s.start && currentTime <= s.end);
    if (idx !== -1) return alert("Playhead is already inside an active clip.");
    
    // Find next segment to not overlap
    const nextSeg = activeSegments.find(s => s.start > currentTime);
    let end = currentTime + 5;
    if (nextSeg && end > nextSeg.start) end = nextSeg.start;
    if (end > videoDuration) end = videoDuration;
    
    const newSegs = [...activeSegments, { start: currentTime, end }];
    newSegs.sort((a, b) => a.start - b.start);
    setActiveSegments(newSegs);
  };
"""
content = content.replace('  const handleExport = async () => {', logic + '\n  const handleExport = async () => {')


# 3. Add the Toolbar UI
# We need to find the Timeline section.
# <h3 className="text-lg font-bold text-white mb-4">Timeline</h3>
ui_toolbar = """
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Timeline</h3>
              <div className="flex items-center gap-2 bg-neutral-800 p-1.5 rounded-lg border border-neutral-700">
                <button onClick={splitSegment} className="p-2 hover:bg-neutral-700 rounded transition-colors tooltip" title="Split Clip at Playhead">
                  <Scissors className="w-4 h-4 text-white" />
                </button>
                <button onClick={setInPoint} className="p-2 hover:bg-neutral-700 rounded transition-colors tooltip" title="Set In Point (Trim Start)">
                  <ArrowRightToLine className="w-4 h-4 text-white" />
                </button>
                <button onClick={setOutPoint} className="p-2 hover:bg-neutral-700 rounded transition-colors tooltip" title="Set Out Point (Trim End)">
                  <ArrowLeftToLine className="w-4 h-4 text-white" />
                </button>
                <button onClick={deleteSegment} className="p-2 hover:bg-neutral-700 rounded transition-colors tooltip" title="Delete Current Clip">
                  <Trash className="w-4 h-4 text-red-400" />
                </button>
                <button onClick={addSegment} className="p-2 hover:bg-neutral-700 rounded transition-colors tooltip" title="Add Clip at Playhead">
                  <Plus className="w-4 h-4 text-green-400" />
                </button>
              </div>
            </div>
"""
content = content.replace('<h3 className="text-lg font-bold text-white mb-4">Timeline</h3>', ui_toolbar)

with open(r'C:\NexusCut\src\components\VideoEditor.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
