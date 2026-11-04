import re

with open('src/components/Editor/Sidebar.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# We know the first part of handleSmartCut is good up to:
# 134:       for (let i = 0; i < silenceStarts.length; i++) {
# 135:         if (silenceStarts[i] > currentPos) newSegments.push({ start: currentPos, end: silenceStarts[i] });
# 136:         currentPos = silenceEnds[i];
# 137:       }

# Find the exact index of that block
target_idx = -1
for i, line in enumerate(lines):
    if "currentPos = silenceEnds[i];" in line:
        target_idx = i + 1
        break

# The duplication "use client" is around line 138.
# The second `handleSmartCut` starts around line 226.
# We will just rewrite from `target_idx` onwards until we reach the return statement of Sidebar.

rest_of_component = """
      if (currentPos < totalDuration) newSegments.push({ start: currentPos, end: totalDuration });
      if (newSegments.length === 0) newSegments = [{ start: 0, end: totalDuration }];
      
      useEditorStore.getState().removeSegment('video-1', firstSeg.id);
      
      let timelineCursor = firstSeg.start;
      for (const seg of newSegments) {
        const dur = seg.end - seg.start;
        useEditorStore.getState().addSegment('video-1', {
          ...firstSeg,
          id: Math.random().toString(36).substr(2, 9),
          start: timelineCursor,
          end: timelineCursor + dur,
          duration: dur,
        });
        timelineCursor += dur;
      }
      
    } catch(err) {
      console.error(err);
      alert("Silence removal failed.");
    } finally {
      setIsProcessing(false);
      setProgressText("");
    }
  };

  const handleAutoCaptions = async () => {
    const videoTrack = tracks.find(t => t.id === 'video-1');
    if (!videoTrack || videoTrack.segments.length === 0) return alert('Please add a video to the timeline first!');
    const firstSeg = videoTrack.segments[0];
    const mediaItem = mediaLibrary.find(m => m.url === firstSeg.src);
    if (!mediaItem || !mediaItem.file) return alert('Cannot find original file.');

    setIsProcessing(true);
    setProgressText('Uploading and transcribing...');

    try {
      const formData = new FormData();
      formData.append('file', mediaItem.file);

      const res = await fetch('/api/transcribe', { method: 'POST', body: formData });
      const data = await res.json();
      
      if (data.error) throw new Error(data.error);

      if (data.transcription && data.transcription.words) {
        const state = useEditorStore.getState();
        
        // Remove existing auto-captions to prevent overlapping duplicates
        const textTrack = state.tracks.find(t => t.id === 'text-1');
        if (textTrack) {
          textTrack.segments.forEach(seg => {
            if (seg.name === 'Caption') {
              state.removeSegment('text-1', seg.id);
            }
          });
        }

        data.transcription.words.forEach((word: any, i: number) => {
          state.addSegment('text-1', {
            id: Math.random().toString(36).substr(2, 9),
            trackId: 'text-1',
            start: firstSeg.start + word.start,
            end: firstSeg.start + word.end,
            duration: word.end - word.start,
            type: 'text',
            name: 'Caption',
            text: word.word,
            color: '#FFD700',
            fontSize: 48,
            y: 80
          });
        });
      }
    } catch (err: any) {
      console.error(err);
      alert(`Error generating captions: ${err.message}`);
    } finally {
      setIsProcessing(false);
      setProgressText("");
    }
  };

  const handleBRoll = async () => {
    setIsProcessing(true);
    setProgressText('AI is fetching B-Roll clips...');
    try {
      const res = await fetch('/api/b-roll', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ captions: [] })
      });
      const data = await res.json();
      if (data.segments && data.segments.length > 0) {
        let cursor = 0;
        data.segments.forEach((seg: any) => {
          useEditorStore.getState().addSegment('video-1', {
            id: Math.random().toString(36).substr(2, 9),
            trackId: 'video-1',
            start: cursor,
            end: cursor + 3,
            duration: 3,
            type: 'video',
            name: 'AI B-Roll',
            src: seg.videoUrl
          });
          cursor += 3;
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
      setProgressText("");
    }
  };
"""

return_idx = -1
for i in range(target_idx, len(lines)):
    if "return (" in lines[i]:
        return_idx = i
        break

new_lines = lines[:target_idx] + [rest_of_component + "\n"] + lines[return_idx:]

with open('src/components/Editor/Sidebar.tsx', 'w', encoding='utf-8') as f:
    f.writelines(new_lines)
