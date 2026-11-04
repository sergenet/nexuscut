import re

with open('src/pages/api/export.ts', 'r', encoding='utf-8') as f:
    content = f.read()

start_marker = '// FAST CONCAT TRANSITION LOGIC'
end_marker = 'let lastVideo = `v_concat`;'

start_idx = content.find(start_marker)
end_idx = content.find(end_marker, start_idx)

if start_idx != -1 and end_idx != -1:
    end_idx += len(end_marker)
    # also remove the next line `let lastAudio = \`a_concat\`;`
    end_idx = content.find(';', end_idx + 1) + 1
    
    clean_block = """
      // FAST CONCAT TRANSITION LOGIC
      const concatVideos: string[] = [];
      const concatAudios: string[] = [];
      
      const vLabels = activeSegments.map((_: any, i: number) => `v_seg${i}`);
      const aLabels = activeSegments.map((_: any, i: number) => `a_seg${i}`);
      
      for (let i = 0; i < activeSegments.length; i++) {
        const seg = activeSegments[i];
        const segDuration = seg.end - seg.start;
        
        if (seg.transitionOut && seg.transitionOut.type !== 'None' && i < activeSegments.length - 1) {
            const tDuration = Math.min(seg.transitionOut.duration || 0.5, segDuration / 2, 0.5);
            const fadeOutStart = Math.max(0, segDuration - tDuration);
            
            filterGraph.push(`[${vLabels[i]}]fade=t=out:st=${fadeOutStart}:d=${tDuration}[v_fout${i}]`);
            filterGraph.push(`[${aLabels[i]}]afade=t=out:st=${fadeOutStart}:d=${tDuration}[a_fout${i}]`);
            vLabels[i] = `v_fout${i}`;
            aLabels[i] = `a_fout${i}`;
            
            const nextSeg = activeSegments[i+1];
            const nextDuration = nextSeg.end - nextSeg.start;
            const nextTDur = Math.min(tDuration, nextDuration / 2);
            filterGraph.push(`[${vLabels[i+1]}]fade=t=in:st=0:d=${nextTDur}[v_fin${i+1}]`);
            filterGraph.push(`[${aLabels[i+1]}]afade=t=in:st=0:d=${nextTDur}[a_fin${i+1}]`);
            vLabels[i+1] = `v_fin${i+1}`;
            aLabels[i+1] = `a_fin${i+1}`;
        }
        
        if (i === activeSegments.length - 1 && seg.transitionOut && seg.transitionOut.type !== 'None') {
            const tDuration = Math.min(seg.transitionOut.duration || 0.5, segDuration / 2, 0.5);
            const fadeOutStart = Math.max(0, segDuration - tDuration);
            filterGraph.push(`[${vLabels[i]}]fade=t=out:st=${fadeOutStart}:d=${tDuration}[v_fout${i}]`);
            filterGraph.push(`[${aLabels[i]}]afade=t=out:st=${fadeOutStart}:d=${tDuration}[a_fout${i}]`);
            vLabels[i] = `v_fout${i}`;
            aLabels[i] = `a_fout${i}`;
        }
      }
      
      const n = activeSegments.length;
      let concatStr = '';
      for (let i = 0; i < n; i++) {
        concatStr += `[${vLabels[i]}][${aLabels[i]}]`;
      }
      filterGraph.push(`${concatStr}concat=n=${n}:v=1:a=1[v_concat][a_concat]`);
      
      let lastVideo = `v_concat`;
      let lastAudio = `a_concat`;
"""
    new_content = content[:start_idx] + clean_block + content[end_idx:]
    with open('src/pages/api/export.ts', 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("Fixed syntax locally")
else:
    print("Markers not found!")
