import re

with open('C:\\NexusCut\\mobile\\app\\editor.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Remove the window.confirm from handleLoadLocal to avoid blocked file pickers
load_target = """            if (oldBlobUri) {
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
            
            applyState(null);"""

load_replacement = """            if (oldBlobUri) {
               window.alert("Project loaded!\\n\\nNote: Because your browser cleared the temporary video file, the video is missing. Please click the 'Relink' button in the top bar to re-select your video.");
            }
            
            applyState(null);"""

if load_target in content:
    content = content.replace(load_target, load_replacement)
    print("Fixed handleLoadLocal confirm!")
else:
    print("Failed to find handleLoadLocal confirm!")

# 2. Add the Relink button to the top bar
topbar_target = """          <TouchableOpacity 
            style={[styles.saveBtn, { backgroundColor: '#18181b', borderWidth: 1, borderColor: '#3f3f46' }]} 
            onPress={handleLoadLocal}
          >
            <Ionicons name="folder-open-outline" size={18} color="#fff" />
            <Text style={styles.saveBtnText}>Open</Text>
          </TouchableOpacity>"""

topbar_replacement = """          <TouchableOpacity 
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
          >
            <Ionicons name="link-outline" size={18} color="#fff" />
            <Text style={styles.saveBtnText}>Relink</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.saveBtn, { backgroundColor: '#18181b', borderWidth: 1, borderColor: '#3f3f46' }]} 
            onPress={handleLoadLocal}
          >
            <Ionicons name="folder-open-outline" size={18} color="#fff" />
            <Text style={styles.saveBtnText}>Open</Text>
          </TouchableOpacity>"""

if topbar_target in content:
    content = content.replace(topbar_target, topbar_replacement)
    print("Added Relink button!")
else:
    print("Failed to find Top Bar Open button!")

with open('C:\\NexusCut\\mobile\\app\\editor.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
