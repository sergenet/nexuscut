import re

with open(r'C:\NexusCut\src\components\VideoEditor.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

old_code = """
      try {
        console.log("Mobile device detected. Using native AudioContext chunking.");
        setProgressText("Decoding audio (this takes a few seconds)...");
        
        const arrayBuffer = await videoFile.arrayBuffer();
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const decodedData = await audioCtx.decodeAudioData(arrayBuffer);
"""

new_code = """
      try {
        console.log("Mobile device detected. Using native AudioContext chunking.");
        
        // IMPORTANT: Create AudioContext synchronously BEFORE any awaits to prevent iOS Safari from suspending it!
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        const audioCtx = new AudioContextClass();
        
        setProgressText("Decoding audio (this takes a few seconds)...");
        
        const arrayBuffer = await videoFile.arrayBuffer();
        
        // On iOS, suspended contexts must be resumed
        if (audioCtx.state === 'suspended') {
          await audioCtx.resume();
        }
        
        // Add a safety timeout so it doesn't spin forever silently if decoding fails
        const decodePromise = audioCtx.decodeAudioData(arrayBuffer);
        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("Audio decoding timed out")), 45000));
        const decodedData = await Promise.race([decodePromise, timeoutPromise]) as AudioBuffer;
"""

content = content.replace(old_code.strip(), new_code.strip())

with open(r'C:\NexusCut\src\components\VideoEditor.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
