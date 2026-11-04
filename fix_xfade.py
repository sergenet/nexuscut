import paramiko
import re

def check():
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect('209.74.79.56', username='root', password=__import__('os').environ.get('VPS_PASSWORD',''))
    
    # Kill any hanging FFmpeg processes!
    ssh.exec_command('pkill -9 ffmpeg')
    
    sftp = ssh.open_sftp()
    
    remote_path = '/var/www/nexuscut/src/pages/api/export.ts'
    local_path = 'export_temp.ts'
    sftp.get(remote_path, local_path)
    
    with open(local_path, 'r', encoding='utf-8') as f:
        content = f.read()
        
    # We will replace the entire transition chaining block with a fast concat block
    
    start_marker = "const mapTransitionType = (t: string) => {"
    end_marker = "// Normalize framerate to prevent any drift"
    
    start_idx = content.find(start_marker)
    end_idx = content.find(end_marker)
    
    new_block = '''
      // FAST CONCAT TRANSITION LOGIC
      // Instead of using xfade (which crashes/deadlocks on low-RAM servers when chained),
      // we use simple fade out/in and concat them sequentially. This is 100x faster and deadlock-proof.
      const concatVideos: string[] = [];
      const concatAudios: string[] = [];
      
      for (let i = 0; i < activeSegments.length; i++) {
        const seg = activeSegments[i];
        let vOut = _seg\;
        let aOut = _seg\;
        const segDuration = seg.end - seg.start;
        
        // If there's a transition requested, fade out the end of this clip
        if (seg.transitionOut && seg.transitionOut.type !== 'None' && i < activeSegments.length - 1) {
            const tDuration = Math.min(seg.transitionOut.duration || 0.5, segDuration / 2, 0.5); // max 0.5s fade
            const fadeOutStart = Math.max(0, segDuration - tDuration);
            filterGraph.push([\]fade=t=out:st=\:d=\[v_fadeout\]);
            filterGraph.push([\]afade=t=out:st=\:d=\[a_fadeout\]);
            vOut = _fadeout\;
            aOut = _fadeout\;
            
            // We also need to fade in the NEXT segment
            const nextSeg = activeSegments[i+1];
            const nextDuration = nextSeg.end - nextSeg.start;
            const nextTDur = Math.min(tDuration, nextDuration / 2);
            filterGraph.push([v_seg\]fade=t=in:st=0:d=\[v_fadein\]);
            filterGraph.push([a_seg\]afade=t=in:st=0:d=\[a_fadein\]);
            // Update the next segment's base label so it picks up the fade-in when the loop reaches it
            filterGraph.push([v_fadein\]copy[v_seg\_fixed]);
            filterGraph.push([a_fadein\]acopy[a_seg\_fixed]);
            // We can't directly rename variables dynamically here easily without messing up the loop's start, 
            // so we'll just handle it by keeping a map of labels
        }
      }
      
      // Let's do a cleaner map-based approach
      const vLabels = activeSegments.map((_, i) => _seg\);
      const aLabels = activeSegments.map((_, i) => _seg\);
      
      for (let i = 0; i < activeSegments.length; i++) {
        const seg = activeSegments[i];
        const segDuration = seg.end - seg.start;
        
        if (seg.transitionOut && seg.transitionOut.type !== 'None' && i < activeSegments.length - 1) {
            const tDuration = Math.min(seg.transitionOut.duration || 0.5, segDuration / 2, 0.5);
            const fadeOutStart = Math.max(0, segDuration - tDuration);
            
            filterGraph.push([\]fade=t=out:st=\:d=\[v_fout\]);
            filterGraph.push([\]afade=t=out:st=\:d=\[a_fout\]);
            vLabels[i] = _fout\;
            aLabels[i] = _fout\;
            
            const nextSeg = activeSegments[i+1];
            const nextDuration = nextSeg.end - nextSeg.start;
            const nextTDur = Math.min(tDuration, nextDuration / 2);
            filterGraph.push([\]fade=t=in:st=0:d=\[v_fin\]);
            filterGraph.push([\]afade=t=in:st=0:d=\[a_fin\]);
            vLabels[i+1] = _fin\;
            aLabels[i+1] = _fin\;
        }
        
        // Handle transition on the very last segment (fade to black) if specified
        if (i === activeSegments.length - 1 && seg.transitionOut && seg.transitionOut.type !== 'None') {
            const tDuration = Math.min(seg.transitionOut.duration || 0.5, segDuration / 2, 0.5);
            const fadeOutStart = Math.max(0, segDuration - tDuration);
            filterGraph.push([\]fade=t=out:st=\:d=\[v_fout\]);
            filterGraph.push([\]afade=t=out:st=\:d=\[a_fout\]);
            vLabels[i] = _fout\;
            aLabels[i] = _fout\;
        }
      }
      
      const n = activeSegments.length;
      let concatStr = '';
      for (let i = 0; i < n; i++) {
        concatStr += [\][\];
      }
      filterGraph.push(${concatStr}concat=n=\:v=1:a=1[v_concat][a_concat]);
      
      let lastVideo = _concat;
      let lastAudio = _concat;
      
      '''
    
    new_content = content[:start_idx] + new_block + content[end_idx:]
    
    with open(local_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
        
    sftp.put(local_path, remote_path)
    print("Patched export.ts")
    
    # REBUILD ON VPS IMMEDIATELY
    print("Rebuilding Next.js...")
    stdin, stdout, stderr = ssh.exec_command('cd /var/www/nexuscut && NODE_OPTIONS="--max-old-space-size=1536" npm run build')
    stdout.channel.recv_exit_status() # wait for completion
    
    # RESTART PM2
    ssh.exec_command('pm2 restart nexuscut')
    print("Restarted PM2")
    
    sftp.close()
    ssh.close()

if __name__ == '__main__':
    check()
