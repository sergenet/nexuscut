import re

with open('C:\\NexusCut\\mobile\\app\\editor.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

target = """    const handleLoadLocal = () => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.ncp,.json';
      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e2) => {
          try {
            const jsonStr = e2.target?.result as string;
            const parsed = JSON.parse(jsonStr);
            if (parsed.tracks) {
              useEditorStore.setState({
                tracks: parsed.tracks,
                mediaLibrary: parsed.mediaLibrary || [],
                videoDuration: parsed.videoDuration || 0
              });
              window.alert('Project loaded successfully!');
            }
          } catch(err) {
            window.alert('Failed to parse project file');
          }
        };
        reader.readAsText(file);
      };
      input.click();
    };"""

replacement = """    const handleLoadLocal = () => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.ncp,.json';
      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e2) => {
          try {
            const jsonStr = e2.target?.result as string;
            const parsed = JSON.parse(jsonStr);
            if (parsed.tracks) {
              let oldBlobUri = null;
              if (parsed.mediaLibrary && parsed.mediaLibrary.length > 0) {
                 const firstMedia = parsed.mediaLibrary.find((m: any) => m.uri && m.uri.startsWith('blob:'));
                 if (firstMedia) {
                    oldBlobUri = firstMedia.uri;
                 }
              }
              
              const applyState = (newUri: string | null) => {
                 let finalTracks = parsed.tracks;
                 let finalMedia = parsed.mediaLibrary || [];
                 if (newUri && oldBlobUri) {
                    const strTracks = JSON.stringify(parsed.tracks).split(oldBlobUri).join(newUri);
                    const strMedia = JSON.stringify(finalMedia).split(oldBlobUri).join(newUri);
                    finalTracks = JSON.parse(strTracks);
                    finalMedia = JSON.parse(strMedia);
                 }
                 
                 useEditorStore.setState({
                    tracks: finalTracks,
                    mediaLibrary: finalMedia,
                    videoDuration: parsed.videoDuration || 0,
                    currentTime: 0,
                    isPlaying: false
                 });
                 window.alert('Project loaded successfully!');
              };

              if (oldBlobUri) {
                 const doRelink = window.confirm("Your web browser cleared the temporary video file for this project.\\n\\nPlease click OK to re-select your original video file so it can play again.");
                 if (doRelink) {
                    const videoInput = document.createElement('input');
                    videoInput.type = 'file';
                    videoInput.accept = 'video/*,image/*';
                    videoInput.onchange = (ve) => {
                       const vFile = (ve.target as HTMLInputElement).files?.[0];
                       if (vFile) {
                          const newUri = URL.createObjectURL(vFile);
                          applyState(newUri);
                       } else {
                          applyState(null);
                       }
                    };
                    videoInput.click();
                    return;
                 }
              }
              
              applyState(null);
            }
          } catch(err) {
            window.alert('Failed to parse project file');
          }
        };
        reader.readAsText(file);
      };
      input.click();
    };"""

if target in content:
    content = content.replace(target, replacement)
    print('Fixed handleLoadLocal successfully!')
else:
    print('Failed to find handleLoadLocal target!')

with open('C:\\NexusCut\\mobile\\app\\editor.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
