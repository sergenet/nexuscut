import { Track, TrackSegment } from '../store/useEditorStore';

export const buildExportCommand = (
  tracks: Track[], 
  fps: number = 30, 
  resolution: { w: number, h: number } = { w: 1920, h: 1080 }
) => {
  // 1. Gather all video segments ordered by their start time
  const videoTrack = tracks.find(t => t.id === 'video-1');
  if (!videoTrack || videoTrack.segments.length === 0) {
    throw new Error('No video segments found to export.');
  }

  // Sort segments by their start time on the timeline
  const segments = [...videoTrack.segments].sort((a, b) => a.start - b.start);

  const inputFiles: string[] = [];
  const filterParts: string[] = [];
  const concatInputs: string[] = [];

  let inputIndex = 0;

  segments.forEach((seg, idx) => {
    // Determine input filename based on the segment ID to maintain uniqueness if needed, 
    // but typically we load them into FFmpeg VFS as their ID
    const fileName = `${seg.id}.mp4`; 
    inputFiles.push(`-i`);
    inputFiles.push(fileName);

    // Calculate trim values
    const trimStart = seg.trimStart || 0;
    const duration = seg.duration;

    // Normalizing base streams (with blurred background for aspect ratio mismatches)
    const baseRaw = `[v_raw_${idx}]`;
    const bgIn = `[bg_in_${idx}]`;
    const fgIn = `[fg_in_${idx}]`;
    const bgOut = `[bg_out_${idx}]`;
    const fgOut = `[fg_out_${idx}]`;
    const vOut = `[v_base_${idx}]`;
    
    const bgW = Math.round(resolution.w / 6) % 2 === 0 ? Math.round(resolution.w / 6) : Math.round(resolution.w / 6) + 1;
    const bgH = Math.round(resolution.h / 6) % 2 === 0 ? Math.round(resolution.h / 6) : Math.round(resolution.h / 6) + 1;
    
    const filter = `[${inputIndex}:v]trim=start=${trimStart}:duration=${duration},setpts=PTS-STARTPTS${baseRaw};` +
                   `${baseRaw}split${bgIn}${fgIn};` +
                   `${bgIn}scale=${bgW}:${bgH}:force_original_aspect_ratio=increase,crop=${bgW}:${bgH},boxblur=4:4,scale=${resolution.w}:${resolution.h}${bgOut};` +
                   `${fgIn}scale=${resolution.w}:${resolution.h}:force_original_aspect_ratio=decrease${fgOut};` +
                   `${bgOut}${fgOut}overlay=(main_w-overlay_w)/2:(main_h-overlay_h)/2,fps=${fps},format=yuv420p,setsar=1${vOut}`;
    
    // Audio graph for this segment
    const aOut = `[a_base_${idx}]`;
    const aFilter = `[${inputIndex}:a]atrim=start=${trimStart}:duration=${duration},asetpts=PTS-STARTPTS${aOut}`;
    
    filterParts.push(filter);
    filterParts.push(aFilter);

    inputIndex++;
  });

  if (segments.length === 1) {
    // Single segment, just map the normalized streams to output
    filterParts.push(`[v_base_0]null[outv];[a_base_0]anull[outa]`);
  } else {
    // Progressively chain segments
    let currentV = '[v_base_0]';
    let currentA = '[a_base_0]';
    let runningDuration = segments[0].duration;

    for (let i = 1; i < segments.length; i++) {
      const nextV = `[v_base_${i}]`;
      const nextA = `[a_base_${i}]`;
      const trans = segments[i - 1].transitionOut;
      
      const isLast = i === segments.length - 1;
      const outV = isLast ? '[outv]' : `[v_chain_${i}]`;
      const outA = isLast ? '[outa]' : `[a_chain_${i}]`;

      if (trans && trans !== 'none') {
        const tDur = 1.0; // Fixed 1s transition for now
        const offset = Math.max(0, runningDuration - tDur);
        
        let xfadeType = 'fade';
        if (trans === 'black') xfadeType = 'fadeblack';
        if (trans === 'wipe') xfadeType = 'wipeleft';
        
        filterParts.push(`${currentV}${nextV}xfade=transition=${xfadeType}:duration=${tDur}:offset=${offset}${outV}`);
        filterParts.push(`${currentA}${nextA}acrossfade=d=${tDur}${outA}`);
        
        runningDuration = runningDuration + segments[i].duration - tDur;
      } else {
        // Standard Cut
        filterParts.push(`${currentV}${nextV}concat=n=2:v=1:a=0${outV}`);
        filterParts.push(`${currentA}${nextA}concat=n=2:v=0:a=1${outA}`);
        
        runningDuration = runningDuration + segments[i].duration;
      }
      
      currentV = outV;
      currentA = outA;
    }
  }

  const filterComplex = filterParts.join(';');

  return {
    inputs: inputFiles,
    filterComplex,
    output: 'export.mp4'
  };
};
