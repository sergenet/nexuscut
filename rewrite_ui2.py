import re

with open(r'C:\NexusCut\src\components\VideoEditor.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# We want to replace the SECOND return block.
# The first return block is at `if (!videoSrc) { return ( ... ) }`
# The second one is the main `return (`.

parts = content.split('  return (\n    <div className="flex flex-col h-full gap-4">')
if len(parts) < 2:
    print("Could not find the target split point!")
    exit(1)

prefix = parts[0]

ui = """  const steps = [
    { id: 1, title: 'Transcribe' },
    { id: 2, title: 'AI Curation' },
    { id: 3, title: 'Style & Audio' },
    { id: 4, title: 'Export' },
  ];

  return (
    <div className="flex flex-col h-full gap-4">
      
      {/* Top Stepper Navigation */}
      <div className="flex items-center justify-between bg-neutral-900 border border-neutral-800 rounded-xl p-4 shadow-sm">
        <div className="flex items-center gap-2">
          {steps.map((step) => (
            <div key={step.id} className="flex items-center">
              <button 
                onClick={() => setActiveStep(step.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${activeStep === step.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-neutral-400 hover:text-white hover:bg-neutral-800'}`}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${activeStep === step.id ? 'bg-white text-indigo-600' : 'bg-neutral-800 text-neutral-400'}`}>
                  {step.id}
                </div>
                {step.title}
              </button>
              {step.id < 4 && <div className="w-8 h-px bg-neutral-700 mx-2" />}
            </div>
          ))}
        </div>
        <div className="flex gap-2">
           <button onClick={startOver} disabled={isProcessing} className="flex items-center gap-2 px-4 py-2 bg-red-900/30 hover:bg-red-900/50 disabled:opacity-50 rounded-lg text-sm font-semibold text-red-400 transition-colors border border-red-900/50">
             <Trash className="w-4 h-4" /> Start Over
           </button>
           <button onClick={handleExport} disabled={isProcessing} className="flex items-center gap-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-lg text-sm font-semibold text-white transition-colors shadow-lg shadow-indigo-500/20">
             {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />} Export
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[55vh]">
        
        {/* Main Video Player (Left 2/3) */}
        <div className="lg:col-span-2 bg-black rounded-2xl border border-neutral-800 overflow-hidden relative group shadow-2xl flex items-center justify-center">
          <video
            ref={videoRef}
            src={videoSrc}
            controls
            className="h-full w-full object-contain"
            onTimeUpdate={handleTimeUpdate}
            onEnded={() => { setIsPlaying(false); audioRef.current?.pause(); }}
            onPlay={() => { setIsPlaying(true); audioRef.current?.play(); }}
            onPause={() => { setIsPlaying(false); audioRef.current?.pause(); }}
          />

          {bgmFile && (
            <audio ref={audioRef} src={URL.createObjectURL(bgmFile)} loop />
          )}

          {/* B-Roll Overlay */}
          {activeBroll && (
            <div className="absolute inset-0 pointer-events-none z-40 bg-transparent flex items-center justify-center overflow-hidden">
              <video src={activeBroll.videoUrl} autoPlay loop muted playsInline className="w-full h-full object-cover" />
              <div className="absolute top-4 left-4 bg-black/70 text-white text-xs px-3 py-1 rounded font-mono border border-neutral-600">
                B-ROLL: {activeBroll.query}
              </div>
            </div>
          )}
          
          <AnimatePresence>
            {activeCaption && (
              <motion.div
                key={activeCaption.word}
                initial={{ scale: 0.8, opacity: 0, y: 10 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: -10 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className="absolute bottom-24 w-full flex justify-center pointer-events-none z-50"
              >
                <span className="text-4xl md:text-5xl font-black uppercase tracking-tight" style={getReactStyle()}>
                  {activeCaption.word}
                  {activeCaption.emoji && <span className="ml-2 drop-shadow-lg">{activeCaption.emoji}</span>}
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {isProcessing && (
            <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-50">
               <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
               <p className="text-white font-medium text-center px-8">{progressText}</p>
            </div>
          )}
        </div>

        {/* Dynamic Sidebar (Right 1/3) */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 flex flex-col h-full overflow-y-auto">
          
          {/* STEP 1: TRANSCRIBE */}
          {activeStep === 1 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col gap-6">
              <div>
                <h3 className="text-lg font-bold text-white mb-3">1. Generate Captions</h3>
                <button onClick={generateCaptions} disabled={isProcessing} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-xl text-white font-semibold transition-all shadow-lg shadow-indigo-500/20">
                  {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Type className="w-5 h-5" />} Auto-Transcribe Audio
                </button>
              </div>
              
              <div className="bg-neutral-800 p-4 rounded-xl border border-neutral-700">
                <h3 className="text-sm font-bold text-neutral-300 uppercase tracking-wider mb-3">Translate (Optional)</h3>
                <div className="flex gap-2">
                  <select value={targetLanguage} onChange={e => setTargetLanguage(e.target.value)} className="bg-neutral-900 text-white flex-1 outline-none border border-neutral-700 rounded-lg p-2">
                    <option value="English">English</option>
                    <option value="Spanish">Spanish</option>
                    <option value="French">French</option>
                    <option value="German">German</option>
                    <option value="Italian">Italian</option>
                    <option value="Japanese">Japanese</option>
                    <option value="Portuguese">Portuguese</option>
                    <option value="Russian">Russian</option>
                    <option value="Chinese">Chinese</option>
                    <option value="Korean">Korean</option>
                    <option value="Arabic">Arabic</option>
                    <option value="Hindi">Hindi</option>
                    <option value="Dutch">Dutch</option>
                    <option value="Turkish">Turkish</option>
                    <option value="Polish">Polish</option>
                    <option value="Swedish">Swedish</option>
                    <option value="Indonesian">Indonesian</option>
                    <option value="Vietnamese">Vietnamese</option>
                    <option value="Thai">Thai</option>
                    <option value="Greek">Greek</option>
                  </select>
                  <button onClick={translateCaptions} disabled={isProcessing || targetLanguage === 'English'} className="bg-neutral-700 hover:bg-neutral-600 disabled:opacity-50 text-white px-4 rounded-lg transition-colors font-semibold">
                    Apply
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-neutral-300 uppercase tracking-wider mb-3">Transcript Viewer</h3>
                <div className="bg-neutral-800 border border-neutral-700 rounded-xl p-4 max-h-[40vh] overflow-y-auto">
                   {captions.length > 0 ? (
                     <div className="flex flex-wrap gap-1 text-base leading-loose">
                       {captions.map((c, i) => {
                         const isCut = !activeSegments.some(seg => c.start >= seg.start && c.end <= seg.end);
                         return (
                           <span 
                             key={i} 
                             className={`cursor-pointer transition-all ${
                               isCut ? 'opacity-20 line-through text-neutral-500' :
                               currentTime >= c.start && currentTime <= c.end 
                                 ? 'text-indigo-400 font-bold bg-indigo-500/10 px-1 rounded' 
                                 : 'text-neutral-300 hover:text-white'
                             }`}
                             onClick={() => { if (videoRef.current) { videoRef.current.currentTime = c.start; videoRef.current.play(); } }}
                           >
                             {c.word}{c.emoji && <span className="ml-1">{c.emoji}</span>}
                           </span>
                         )
                       })}
                     </div>
                   ) : (
                     <div className="text-neutral-500 text-sm text-center py-8">No transcript yet. Generate captions first.</div>
                   )}
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 2: AI CURATION */}
          {activeStep === 2 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col gap-6">
              
              <div className="bg-neutral-800 p-4 rounded-xl border border-neutral-700">
                <h3 className="text-sm font-bold text-red-400 uppercase tracking-wider flex items-center gap-2 mb-3">
                  <VolumeX className="w-4 h-4" /> Cut Silence
                </h3>
                <p className="text-xs text-neutral-400 mb-4">Automatically remove quiet gaps from your video.</p>
                <div className="flex items-center gap-4 mb-4">
                  <input type="range" min="-60" max="-10" step="5" value={silenceThreshold} onChange={(e) => setSilenceThreshold(Number(e.target.value))} className="w-full accent-red-500" />
                  <span className="text-xs font-mono text-neutral-300 bg-neutral-900 px-2 py-1 rounded">{silenceThreshold}dB</span>
                </div>
                <button onClick={removeSilence} disabled={isProcessing} className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-neutral-700 hover:bg-neutral-600 disabled:opacity-50 rounded-lg text-white font-semibold transition-all">
                  Apply Silence Cut
                </button>
              </div>

              <div className="bg-neutral-800 p-4 rounded-xl border border-neutral-700">
                <h3 className="text-sm font-bold text-yellow-500 uppercase tracking-wider flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4" /> Extract Viral Hook
                </h3>
                <p className="text-xs text-neutral-400 mb-4">AI finds the most engaging parts of your video and trims out the rest.</p>
                <button onClick={generateMagicClip} disabled={isProcessing} className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-yellow-600/20 text-yellow-500 hover:bg-yellow-600/30 border border-yellow-500/30 disabled:opacity-50 rounded-lg font-bold transition-all mb-4">
                  Find Magic Clip
                </button>
                {magicClips.length > 0 && (
                  <div className="flex flex-col gap-2 mt-4 max-h-[150px] overflow-y-auto">
                    {magicClips.map((clip, i) => (
                      <div key={i} onClick={() => applyMagicClip(clip)} className="bg-neutral-900 hover:bg-neutral-800 cursor-pointer p-3 rounded-lg border border-neutral-700 transition-colors">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-bold text-white text-sm">{clip.title}</span>
                          <span className="text-xs font-black bg-yellow-500 text-black px-2 py-0.5 rounded-full">{clip.score}/100</span>
                        </div>
                        <div className="text-xs font-mono text-indigo-400">{clip.start.toFixed(1)}s - {clip.end.toFixed(1)}s</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-neutral-800 p-4 rounded-xl border border-neutral-700">
                <h3 className="text-sm font-bold text-green-500 uppercase tracking-wider flex items-center gap-2 mb-3">
                  <Video className="w-4 h-4" /> Auto B-Roll
                </h3>
                <p className="text-xs text-neutral-400 mb-4">AI overlays relevant stock footage on your video.</p>
                <button onClick={generateBRoll} disabled={isProcessing} className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600/20 text-green-500 hover:bg-green-600/30 border border-green-500/30 disabled:opacity-50 rounded-lg font-bold transition-all">
                  Generate B-Roll
                </button>
                {brollSegments.length > 0 && (
                  <div className="flex flex-col gap-2 mt-4 max-h-[150px] overflow-y-auto">
                    {brollSegments.map((b, i) => (
                      <div key={i} className="bg-neutral-900 p-2 rounded-lg border border-neutral-700 flex justify-between items-center cursor-pointer hover:bg-neutral-800 transition-colors"
                           onClick={() => { if (videoRef.current) { videoRef.current.currentTime = b.start; videoRef.current.play(); }}}>
                        <span className="text-sm text-white font-semibold truncate">{b.query}</span>
                        <span className="text-xs font-mono text-green-400">{b.start.toFixed(1)}s - {b.end.toFixed(1)}s</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* STEP 3: STYLE & AUDIO */}
          {activeStep === 3 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col gap-6">
              
              <div className="bg-neutral-800 p-4 rounded-xl border border-neutral-700">
                <h3 className="text-sm font-bold text-neutral-300 uppercase tracking-wider mb-4">Caption Styling</h3>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="text-xs text-neutral-400 block mb-1">Font Family</label>
                    <select value={captionFont} onChange={(e) => setCaptionFont(e.target.value)} className="w-full bg-neutral-900 text-white text-sm rounded-lg px-3 py-2 outline-none border border-neutral-700">
                      <option value="Roboto-Black">Roboto</option>
                      <option value="Montserrat-Bold">Montserrat</option>
                      <option value="BebasNeue-Regular">Bebas Neue</option>
                      <option value="Oswald-Bold">Oswald</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-neutral-400 block mb-1">Font Size</label>
                    <select value={captionSize} onChange={(e) => setCaptionSize(Number(e.target.value))} className="w-full bg-neutral-900 text-white text-sm rounded-lg px-3 py-2 outline-none border border-neutral-700">
                      <option value={24}>Small (24)</option>
                      <option value={36}>Medium (36)</option>
                      <option value={48}>Large (48)</option>
                      <option value={64}>X-Large (64)</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex items-center justify-between bg-neutral-900 p-3 rounded-lg border border-neutral-700 mb-4">
                  <span className="text-sm text-white">Text Color</span>
                  <input type="color" value={captionColor} onChange={(e) => setCaptionColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer bg-transparent border-0 p-0" />
                </div>

                <button onClick={generateEmojis} disabled={isProcessing} className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 border border-blue-500/30 disabled:opacity-50 rounded-lg font-bold transition-all">
                  <Smile className="w-4 h-4" /> Apply Auto-Emojis
                </button>
              </div>

              <div className="bg-neutral-800 p-4 rounded-xl border border-neutral-700">
                <h3 className="text-sm font-bold text-neutral-300 uppercase tracking-wider mb-4">Visual Effects</h3>
                <div className="flex flex-col gap-3">
                  <label className="flex items-center justify-between cursor-pointer bg-neutral-900 p-3 rounded-lg border border-neutral-700">
                    <span className="text-sm text-white flex items-center gap-2"><ZoomIn className="w-4 h-4 text-indigo-400" /> Auto Zoom (Face)</span>
                    <input type="checkbox" checked={autoZoom} onChange={(e) => setAutoZoom(e.target.checked)} className="accent-indigo-500 w-5 h-5" />
                  </label>
                  <label className="flex items-center justify-between cursor-pointer bg-neutral-900 p-3 rounded-lg border border-neutral-700">
                    <span className="text-sm text-white flex items-center gap-2"><Sparkles className="w-4 h-4 text-fuchsia-400" /> Magic Color Grading</span>
                    <input type="checkbox" checked={magicColor} onChange={(e) => setMagicColor(e.target.checked)} className="accent-fuchsia-500 w-5 h-5" />
                  </label>
                </div>
              </div>

              <div className="bg-neutral-800 p-4 rounded-xl border border-neutral-700">
                <h3 className="text-sm font-bold text-neutral-300 uppercase tracking-wider mb-4">Audio & TTS</h3>
                <div className="flex flex-col gap-3 mb-4">
                  <label className="flex items-center justify-between cursor-pointer bg-neutral-900 p-3 rounded-lg border border-neutral-700">
                    <span className="text-sm text-white flex items-center gap-2"><VolumeX className="w-4 h-4 text-green-400" /> Auto Sound Effects</span>
                    <input type="checkbox" checked={autoSfx} onChange={(e) => setAutoSfx(e.target.checked)} className="accent-green-500 w-5 h-5" />
                  </label>
                </div>
                
                <h4 className="text-xs font-bold text-indigo-400 mb-2 mt-4">AI VOICE (TTS)</h4>
                <textarea 
                  className="w-full bg-neutral-900 text-sm text-white p-3 rounded-lg border border-neutral-700 outline-none resize-none mb-2 focus:border-indigo-500" 
                  rows={2} 
                  placeholder="Enter text for AI voice..." 
                  value={ttsText} 
                  onChange={e => setTtsText(e.target.value)}
                />
                <div className="flex gap-2">
                  <select className="bg-neutral-900 text-xs text-white p-2 rounded-lg border border-neutral-700 flex-1 outline-none" value={ttsVoice} onChange={e => setTtsVoice(e.target.value)}>
                    <option value="alloy">Alloy (Neutral)</option>
                    <option value="echo">Echo (Male)</option>
                    <option value="fable">Fable (British Male)</option>
                    <option value="onyx">Onyx (Deep Male)</option>
                    <option value="nova">Nova (Female)</option>
                    <option value="shimmer">Shimmer (Soft Female)</option>
                  </select>
                  <button onClick={generateTTS} disabled={isProcessing} className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors">
                    Add Voice
                  </button>
                </div>
              </div>

            </motion.div>
          )}

          {/* STEP 4: MARKETING & EXPORT */}
          {activeStep === 4 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col gap-6">
              
              <div className="bg-neutral-800 p-5 rounded-xl border border-neutral-700">
                <button onClick={generateMarketingTools} disabled={isProcessing} className="w-full bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-fuchsia-500/20 transition-all flex justify-center items-center gap-2 mb-4">
                  <Sparkles className="w-5 h-5" /> Write Titles & HashTags
                </button>
                
                {marketingData && (
                  <div className="bg-neutral-900 p-4 rounded-xl border border-neutral-700 space-y-4 max-h-[300px] overflow-y-auto">
                    <div>
                      <h4 className="text-xs font-black text-fuchsia-400 uppercase mb-2">Viral Titles</h4>
                      <ul className="text-sm text-white space-y-2 list-disc list-inside">
                        {marketingData.titles?.map((t: string, i: number) => <li key={i}>{t}</li>)}
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-fuchsia-400 uppercase mb-2">Description</h4>
                      <p className="text-sm text-neutral-300 whitespace-pre-wrap">{marketingData.description}</p>
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-fuchsia-400 uppercase mb-2">Hashtags</h4>
                      <p className="text-sm text-blue-400">{marketingData.hashtags?.join(" ")}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-neutral-800 p-5 rounded-xl border border-neutral-700 flex flex-col gap-3">
                <h3 className="text-sm font-bold text-neutral-300 uppercase tracking-wider mb-2">Project Management</h3>
                
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={saveProject} disabled={isProcessing} className="flex items-center justify-center gap-2 px-4 py-3 bg-neutral-900 hover:bg-neutral-700 disabled:opacity-50 rounded-xl text-sm font-semibold text-white transition-colors border border-neutral-600">
                    <Save className="w-4 h-4" /> Save
                  </button>
                  <label className="flex items-center justify-center gap-2 px-4 py-3 bg-neutral-900 hover:bg-neutral-700 disabled:opacity-50 rounded-xl text-sm font-semibold text-white transition-colors border border-neutral-600 cursor-pointer">
                    <Upload className="w-4 h-4" /> Load
                    <input type="file" accept=".nxp" className="hidden" onChange={handleLoadProject} disabled={isProcessing} />
                  </label>
                </div>
                
                {!isPro ? (
                  <button onClick={handleUpgrade} disabled={isProcessing} className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 disabled:opacity-50 rounded-xl text-md font-bold text-white transition-all shadow-lg shadow-orange-500/20 mt-2">
                    <Sparkles className="w-5 h-5" /> Upgrade to Pro
                  </button>
                ) : (
                  <button onClick={handleManageSubscription} disabled={isProcessing} className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-neutral-900 hover:bg-neutral-800 disabled:opacity-50 rounded-xl text-sm font-bold text-amber-500 transition-colors border border-amber-500/30 mt-2">
                    Manage Pro Subscription
                  </button>
                )}
              </div>
              
            </motion.div>
          )}

        </div>
      </div>
      
      {/* Interactive Timeline & Audio Controls */}
      {videoSrc && videoDuration > 0 && (
        <div className="mt-8 space-y-6">
          {/* Audio Controls */}
          <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2 text-white">
              <VolumeX className="text-indigo-500 w-6 h-6" /> Audio Tracks
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm text-neutral-400 font-medium flex justify-between">
                  Main Video Volume <span>{Math.round(mainVolume * 100)}%</span>
                </label>
                <input type="range" min="0" max="1" step="0.05" value={mainVolume} onChange={(e) => setMainVolume(Math.min(1, Math.max(0, Number(e.target.value))))} className="w-full accent-indigo-500 mt-2" />
              </div>
              
              <div>
                <label className="text-sm text-neutral-400 font-medium flex items-center justify-between">
                  <span className="flex items-center gap-2"><Music className="w-4 h-4" /> Background Music</span>
                  <span>{Math.round(bgmVolume * 100)}%</span>
                </label>
                <div className="flex gap-2 mt-2">
                  <label className="flex-1 cursor-pointer bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-lg p-2 flex items-center justify-center transition-colors">
                    <input type="file" accept="audio/*" onChange={handleBgmUpload} className="hidden" />
                    <span className="text-xs font-semibold text-white truncate max-w-[150px]">{bgmFile ? bgmFile.name : 'Upload BGM'}</span>
                  </label>
                </div>
                {bgmFile && (
                  <input type="range" min="0" max="1" step="0.05" value={bgmVolume} onChange={(e) => setBgmVolume(Math.min(1, Math.max(0, Number(e.target.value))))} className="w-full accent-green-500 mt-2" />
                )}
              </div>
            </div>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">Timeline</h3>
            <div 
              className="relative h-24 bg-neutral-800 rounded-xl overflow-hidden cursor-pointer group"
              onClick={handleTimelineClick}
            >
              {/* Active Segments */}
              {activeSegments.map((seg, i) => (
                <div 
                  key={i}
                  className="absolute top-0 bottom-0 bg-indigo-500/40 border-l border-r border-indigo-400/50"
                style={{ 
                  left: `${(seg.start / videoDuration) * 100}%`, 
                  width: `${((seg.end - seg.start) / videoDuration) * 100}%` 
                }}
              />
            ))}
            
            {/* B-Roll Segments */}
            {brollSegments.map((seg, i) => (
              <div 
                key={i}
                className="absolute top-0 h-6 bg-green-500/80 border-l border-green-400 z-10 shadow-sm"
                style={{ 
                  left: `${(seg.start / videoDuration) * 100}%`, 
                  width: `${((seg.end - seg.start) / videoDuration) * 100}%` 
                }}
              >
                <div className="text-[10px] font-bold text-black px-1 truncate leading-6">
                  {seg.query}
                </div>
              </div>
            ))}
            
            {/* Playhead */}
            <div 
              className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-20 pointer-events-none transition-all duration-75"
              style={{ left: `${(currentTime / videoDuration) * 100}%` }}
            >
              <div className="absolute -top-2 -left-1.5 w-3.5 h-3.5 bg-red-500 rounded-full shadow" />
            </div>
          </div>
          <div className="flex justify-between mt-2 text-xs text-neutral-400 font-mono">
            <span>0:00</span>
            <span>{currentTime.toFixed(1)}s / {videoDuration.toFixed(1)}s</span>
          </div>
          </div>
        </div>
      )}

    </div>
  );
}
"""

content = prefix + ui

with open(r'C:\NexusCut\src\components\VideoEditor.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
