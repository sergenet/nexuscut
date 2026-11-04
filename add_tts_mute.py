import re

# 1. Update VideoEditor.tsx
with open(r'C:\NexusCut\src\components\VideoEditor.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Add state
state_code = """
  const [ttsText, setTtsText] = useState("");
  const [ttsVoice, setTtsVoice] = useState("alloy");
  const [ttsAudioUrl, setTtsAudioUrl] = useState<string | null>(null);
  const [muteOriginalAudio, setMuteOriginalAudio] = useState(true);
"""
content = re.sub(r'  const \[ttsText, setTtsText\] = useState\(""\);[\s\S]*?const \[ttsAudioUrl, setTtsAudioUrl\] = useState<string \| null>\(null\);', state_code.strip(), content)

# Update generateTTS function
generate_tts_code = """
  const generateTTS = async () => {
    if (!ttsText) return alert("Enter some text to speak!");
    
    setIsProcessing(true);
    setProgressText("AI is generating speech...");
    try {
      const res = await fetch('/api/tts', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: ttsText, voice: ttsVoice })
      });
      if (!res.ok) throw new Error("TTS generation failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setTtsAudioUrl(url);
      
      // Auto-play the preview
      const audio = new Audio(url);
      audio.play();
      
      // Set it as BGM so it overlays automatically
      const file = new File([blob], "tts.mp3", { type: "audio/mp3" });
      setBgmFile(file);
      setBgmVolume(1.0);
      
      if (muteOriginalAudio) {
        setMainVolume(0.0);
      }
      
    } catch(err) {
"""
content = re.sub(r'  const generateTTS = async \(\) => \{[\s\S]*?\} catch\(err\) \{', generate_tts_code.strip() + " catch(err) {", content)

# Update UI checkbox
ui_code = """
                <h4 className="text-xs font-bold text-indigo-400 mb-2 mt-4">AI VOICE (TTS)</h4>
                <textarea 
                  className="w-full bg-neutral-900 text-sm text-white p-3 rounded-lg border border-neutral-700 outline-none resize-none mb-2 focus:border-indigo-500" 
                  rows={2} 
                  placeholder="Enter text for AI voice..." 
                  value={ttsText} 
                  onChange={e => setTtsText(e.target.value)}
                />
                <label className="flex items-center gap-2 cursor-pointer mb-3">
                  <input type="checkbox" checked={muteOriginalAudio} onChange={(e) => setMuteOriginalAudio(e.target.checked)} className="accent-indigo-500 w-4 h-4" />
                  <span className="text-xs text-neutral-300">Mute original video audio</span>
                </label>
                <div className="flex gap-2">
"""
content = re.sub(r'                <h4 className="text-xs font-bold text-indigo-400 mb-2 mt-4">AI VOICE \(TTS\)</h4>[\s\S]*?<div className="flex gap-2">', ui_code.strip() + '\n                <div className="flex gap-2">', content)

with open(r'C:\NexusCut\src\components\VideoEditor.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

# 2. Update help page
with open(r'C:\NexusCut\src\app\help\page.tsx', 'r', encoding='utf-8') as f:
    help_content = f.read()

new_help = """
            <ul className="list-disc list-inside space-y-2 text-neutral-300">
              <li>In the Video Editor, click on <strong>Step 3: Style & Audio</strong> in the top navigation bar.</li>
              <li>Scroll down to the <strong>Audio & TTS</strong> section at the bottom of the right panel.</li>
              <li>Type or paste the script you want the AI to read into the text box.</li>
              <li>Leave the <strong>Mute original video audio</strong> box checked if you want to completely replace the video's original sound with the AI voiceover.</li>
              <li>Select your preferred voice from the dropdown menu (e.g. Alloy, Echo, Fable, Onyx, Nova, Shimmer).</li>
              <li>Click the <strong>Add Voice</strong> button.</li>
              <li>The AI will instantly generate the audio, preview it, and set it as your Background Music track!</li>
            </ul>
            <div className="mt-4 p-4 bg-teal-500/10 border border-teal-500/20 rounded-lg">
              <h4 className="font-bold text-teal-300 mb-1">Pro Tip: Volume Mixing</h4>
              <p className="text-sm text-neutral-300">
                You can fine-tune the mix between the AI Voiceover and the original video audio using the <strong>Audio Tracks</strong> volume sliders located right below the video timeline!
              </p>
            </div>
"""
help_content = re.sub(r'            <ul className="list-disc list-inside space-y-2 text-neutral-300">[\s\S]*?</p>\n            </div>', new_help.strip(), help_content)

with open(r'C:\NexusCut\src\app\help\page.tsx', 'w', encoding='utf-8') as f:
    f.write(help_content)
