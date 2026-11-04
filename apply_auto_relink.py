import re

with open('C:\\NexusCut\\mobile\\app\\editor.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix handleLoadLocal
load_target = """            if (parsed.tracks) {
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
                 window.alert("Project loaded!\\n\\nNote: Because your browser cleared the temporary video file, the video is missing. Please click the 'Relink' button in the top bar to re-select your video.");
              }
              
              applyState(null);
            }"""

load_replacement = """            if (parsed.tracks) {
              const currentStoreMedia = useEditorStore.getState().mediaLibrary;
              
              let finalTracksStr = JSON.stringify(parsed.tracks);
              let finalMediaStr = JSON.stringify(parsed.mediaLibrary || []);
              let unresolvedNames: string[] = [];

              if (parsed.mediaLibrary) {
                 for (const pm of parsed.mediaLibrary) {
                    if (pm.uri && pm.uri.startsWith('blob:')) {
                       const dbMedia = currentStoreMedia.find(m => m.id === pm.id);
                       if (dbMedia && dbMedia.uri && dbMedia.uri.startsWith('blob:')) {
                          // Auto-relink from IndexedDB
                          finalTracksStr = finalTracksStr.split(pm.uri).join(dbMedia.uri);
                          finalMediaStr = finalMediaStr.split(pm.uri).join(dbMedia.uri);
                       } else {
                          unresolvedNames.push(pm.name || 'video file');
                       }
                    }
                 }
              }
              
              useEditorStore.setState({
                 tracks: JSON.parse(finalTracksStr),
                 mediaLibrary: JSON.parse(finalMediaStr),
                 videoDuration: parsed.videoDuration || 0,
                 currentTime: 0,
                 isPlaying: false
              });

              if (unresolvedNames.length > 0) {
                 window.alert(`Project loaded!\\n\\nNote: The following local files are missing: ${unresolvedNames.join(', ')}.\\n\\nPlease click the 'Relink' button in the top bar to locate and re-select them.`);
              } else {
                 window.alert('Project loaded successfully!');
              }
            }"""

if load_target in content:
    content = content.replace(load_target, load_replacement)
    print("Fixed handleLoadLocal auto-relink!")
else:
    print("Failed to find handleLoadLocal target!")


# Fix Relink button
relink_target = """          <TouchableOpacity 
            style={[styles.saveBtn, { backgroundColor: '#18181b', borderWidth: 1, borderColor: '#3f3f46' }]} 
            onPress={() => {
              const videoInput = document.createElement('input');
              videoInput.type = 'file';
              videoInput.accept = 'video/*,image/*';
              videoInput.onchange = (ve) => {
                 const vFile = (ve.target as HTMLInputElement).files?.[0];
                 if (vFile) {
                    const newUri = URL.createObjectURL(vFile);
                    const store = useEditorStore.getState();
                    let finalTracks = store.tracks;
                    let finalMedia = store.mediaLibrary || [];
                    const firstMedia = finalMedia.find((m: any) => m.uri && m.uri.startsWith('blob:'));
                    const oldBlobUri = firstMedia ? firstMedia.uri : null;
                    if (oldBlobUri) {
                       const strTracks = JSON.stringify(finalTracks).split(oldBlobUri).join(newUri);
                       const strMedia = JSON.stringify(finalMedia).split(oldBlobUri).join(newUri);
                       useEditorStore.setState({
                          tracks: JSON.parse(strTracks),
                          mediaLibrary: JSON.parse(strMedia)
                       });
                       window.alert('Video relinked successfully!');
                    } else {
                       window.alert('No missing video found to relink.');
                    }
                 }
              };
              videoInput.click();
            }}
          >"""

relink_replacement = """          <TouchableOpacity 
            style={[styles.saveBtn, { backgroundColor: '#18181b', borderWidth: 1, borderColor: '#3f3f46' }]} 
            onPress={() => {
              const store = useEditorStore.getState();
              const finalMedia = store.mediaLibrary || [];
              const firstMedia = finalMedia.find((m: any) => m.uri && m.uri.startsWith('blob:'));
              const oldBlobUri = firstMedia ? firstMedia.uri : null;
              
              if (!oldBlobUri) {
                 window.alert('No local videos found to relink.');
                 return;
              }

              const videoInput = document.createElement('input');
              videoInput.type = 'file';
              videoInput.accept = 'video/*,image/*';
              videoInput.onchange = (ve) => {
                 const vFile = (ve.target as HTMLInputElement).files?.[0];
                 if (vFile) {
                    const newUri = URL.createObjectURL(vFile);
                    let finalTracks = store.tracks;
                    const strTracks = JSON.stringify(finalTracks).split(oldBlobUri).join(newUri);
                    const strMedia = JSON.stringify(finalMedia).split(oldBlobUri).join(newUri);
                    useEditorStore.setState({
                       tracks: JSON.parse(strTracks),
                       mediaLibrary: JSON.parse(strMedia)
                    });
                    
                    // Save to IndexedDB so it auto-relinks next time
                    saveMediaToDB({
                      id: firstMedia.id,
                      type: firstMedia.type,
                      name: vFile.name,
                      duration: firstMedia.duration,
                      blob: vFile,
                      thumbnailUri: firstMedia.thumbnailUri,
                      timestamp: Date.now()
                    }).catch(err => console.log(err));

                    window.alert(`Successfully relinked with ${vFile.name}!`);
                 }
              };
              videoInput.click();
            }}
          >"""

if relink_target in content:
    content = content.replace(relink_target, relink_replacement)
    print("Fixed Relink button!")
else:
    print("Failed to find Relink button!")


with open('C:\\NexusCut\\mobile\\app\\editor.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
