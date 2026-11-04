import re

with open('src/components/Editor/Sidebar.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Find the exact bounds of processFile
start_idx = content.find("const processFile = (file: File, explicitDuration?: number) => {")
end_idx = content.find("const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {")

if start_idx != -1 and end_idx != -1:
    new_process_file = """const processFile = (file: File, explicitDuration?: number) => {
    setProgressText('Processing media...');
    setIsProcessing(true);
    
    let type: 'video' | 'audio' | 'image' | 'text' = 'video';
    if (file.type.startsWith('image/')) type = 'image';
    else if (file.type.startsWith('audio/')) type = 'audio';
    else if (!file.type && file.name.match(/\.(mp3|wav|ogg|m4a)$/i)) type = 'audio';
    else if (!file.type && file.name.match(/\.(jpg|jpeg|png|gif|webp)$/i)) type = 'image';
    
    const isVideoTemp = file.type.startsWith('video') || file.name.match(/\.(mp4|mov|webm|mkv)$/i) || (!file.type && !file.name.includes('.'));
    const patchedFile = (isVideoTemp && !file.type) 
      ? new File([file], file.name || 'video.mp4', { type: 'video/mp4' }) 
      : file;
      
    const url = URL.createObjectURL(patchedFile);
    
    const finishImport = (dur: number, thumbUrl?: string) => {
      let finalName = file.name || (type === 'video' ? 'Video' : type === 'audio' ? 'Audio' : 'Image');
      
      const newItem: MediaItem = {
        id: Math.random().toString(36).substr(2, 9),
        name: finalName,
        type,
        url,
        duration: dur,
        thumbnail: thumbUrl || (type === 'audio' ? undefined : undefined)
      };
      
      addMediaItem(newItem);
      setIsProcessing(false);
      setProgressText('');
    };

    if (type === 'video') {
      let thumbnailGenerated = false;
      const media = document.createElement('video');
      media.src = url;
      media.muted = true;
      media.playsInline = true;
      media.preload = 'metadata';
      
      media.onloadedmetadata = () => {
        let dur = explicitDuration || media.duration;
        if (!dur || dur === Infinity || isNaN(dur)) dur = 10;
        
        try {
          media.currentTime = Math.min(0.5, dur / 2);
        } catch (e) {
          if (!thumbnailGenerated) {
            thumbnailGenerated = true;
            finishImport(dur);
          }
        }
      };
      
      media.onseeked = () => {
        if (thumbnailGenerated) return;
        thumbnailGenerated = true;
        
        let dur = explicitDuration || media.duration;
        if (!dur || dur === Infinity || isNaN(dur)) dur = 10;
        
        try {
          const canvas = document.createElement('canvas');
          canvas.width = media.videoWidth || 320;
          canvas.height = media.videoHeight || 180;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(media, 0, 0, canvas.width, canvas.height);
            const thumbUrl = canvas.toDataURL('image/jpeg', 0.5);
            finishImport(dur, thumbUrl);
          } else {
            finishImport(dur);
          }
        } catch (err) {
          finishImport(dur);
        }
      };
      
      media.onerror = () => {
        if (!thumbnailGenerated) {
          thumbnailGenerated = true;
          let dur = explicitDuration || media.duration;
          if (!dur || dur === Infinity || isNaN(dur)) dur = 10;
          finishImport(dur);
        }
      };
      
      setTimeout(() => {
        if (!thumbnailGenerated) {
          thumbnailGenerated = true;
          let dur = explicitDuration || media.duration;
          if (!dur || dur === Infinity || isNaN(dur)) dur = 10;
          finishImport(dur);
        }
      }, 3000);
      
    } else if (type === 'audio') {
      const media = document.createElement('audio');
      media.src = url;
      media.onloadedmetadata = () => {
        let dur = explicitDuration || media.duration;
        if (!dur || dur === Infinity || isNaN(dur)) dur = 10;
        finishImport(dur);
      };
      media.onerror = () => finishImport(10);
    } else {
      finishImport(5);
    }
  };
  
  """
    
    new_content = content[:start_idx] + new_process_file + content[end_idx:]
    
    # Also remove the rogue bracket at the end
    if new_content.rstrip().endswith('}\n}'):
        new_content = new_content.rstrip()[:-1]
        
    with open('src/components/Editor/Sidebar.tsx', 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("Fixed!")
else:
    print("Could not find bounds")
