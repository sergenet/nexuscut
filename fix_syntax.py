import re

with open('src/pages/api/export.ts', 'r', encoding='utf-8') as f:
    content = f.read()

start_marker = '// FAST CONCAT TRANSITION LOGIC'
end_marker = 'let lastVideo = _concat;'

start_idx = content.find(start_marker)
end_idx = content.find(end_marker, start_idx)

if start_idx != -1 and end_idx != -1:
    end_idx += len(end_marker)
    # also remove the next line let lastAudio = \_concat\;
    end_idx = content.find(';', end_idx + 1) + 1
    
    clean_block = """
      const concatVideos: string[] = [];
      const concatAudios: string[] = [];
      
      const vLabels = activeSegments.map((_: any, i: number) => _seg);
      const aLabels = activeSegments.map((_: any, i: number) => _seg);
      
      for (let i = 0; i < activeSegments.length; i++) {
        const seg = activeSegments[i];
        const segDuration = seg.end - seg.start;
        
        if (seg.transitionOut && seg.transitionOut.type !== 'None' && i < activeSegments.length - 1) {
            const tDuration = Math.min(seg.transitionOut.duration || 0.5, segDuration / 2, 0.5);
            const fadeOutStart = Math.max(0, segDuration - tDuration);
            
            filterGraph.push([]fade=t=out:st=:d=[v_fout]);
            filterGraph.push([]afade=t=out:st=:d=[a_fout]);
            vLabels[i] = _fout;
            aLabels[i] = _fout;
            
            const nextSeg = activeSegments[i+1];
            const nextDuration = nextSeg.end - nextSeg.start;
            const nextTDur = Math.min(tDuration, nextDuration / 2);
            filterGraph.push([]fade=t=in:st=0:d=[v_fin]);
            filterGraph.push([]afade=t=in:st=0:d=[a_fin]);
            vLabels[i+1] = _fin;
            aLabels[i+1] = _fin;
        }
        
        if (i === activeSegments.length - 1 && seg.transitionOut && seg.transitionOut.type !== 'None') {
            const tDuration = Math.min(seg.transitionOut.duration || 0.5, segDuration / 2, 0.5);
            const fadeOutStart = Math.max(0, segDuration - tDuration);
            filterGraph.push([]fade=t=out:st=:d=[v_fout]);
            filterGraph.push([]afade=t=out:st=:d=[a_fout]);
            vLabels[i] = _fout;
            aLabels[i] = _fout;
        }
      }
      
      const n = activeSegments.length;
      let concatStr = '';
      for (let i = 0; i < n; i++) {
        concatStr += [][];
      }
      filterGraph.push(${concatStr}concat=n=:v=1:a=1[v_concat][a_concat]);
      
      let lastVideo = _concat;
      let lastAudio = _concat;
"""
    new_content = content[:start_idx] + clean_block + content[end_idx:]
    with open('src/pages/api/export.ts', 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("Fixed syntax locally")
else:
    print("Markers not found!")
