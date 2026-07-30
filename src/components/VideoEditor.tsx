"use client";

import React, { useEffect } from 'react';
import Link from 'next/link';
import Sidebar from './Editor/Sidebar';
import Canvas from './Editor/Canvas';
import Timeline from './Editor/Timeline/Timeline';
import PropertiesPanel from './Editor/PropertiesPanel';
import TransitionModal from './Editor/TransitionModal';
import { useEditorStore } from '@/store/useEditorStore';
import { Undo, Redo, Layout, UploadCloud, User, Sparkles, Save, Upload, Trash2, BookOpen } from 'lucide-react';
import GrowthModeWizard from './Editor/GrowthModeWizard';

export default function VideoEditor() {
  const { 
    addSegment, undo, redo, past, future, projectName, setProjectName, tracks, mediaLibrary, aspectRatio, setAspectRatio,
    transitionModalOpen, setTransitionModalOpen, transitionModalType, transitionTargetSegmentId
  } = useEditorStore();
  const [showGrowthWizard, setShowGrowthWizard] = React.useState(false);
  const [isExporting, setIsExporting] = React.useState(false);
  const [isSyncing, setIsSyncing] = React.useState(false);

  const handleCloudSync = async () => {
    setIsSyncing(true);
    try {
      const editorState = {
        tracks,
        mediaLibrary
      };
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: projectName, editorState })
      });
      if (!res.ok) throw new Error("Failed to sync project");
      alert("Project successfully synced to the cloud!");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const state = useEditorStore.getState();
      const videoTrack = state.tracks.find(t => t.id === 'video-1' && !t.isHidden);
      if (!videoTrack || videoTrack.segments.length === 0) throw new Error("No video to export");
      
      // Collect unique video sources used in the main track
      const formData = new FormData();
      const uniqueVideoUrls = Array.from(new Set(videoTrack.segments.map(s => s.src).filter((src): src is string => src !== undefined)));
      const videoFilesMap = new Map<string, number>();

      uniqueVideoUrls.forEach((url, index) => {
        const mediaItem = state.mediaLibrary.find(m => m.url === url);
        if (!mediaItem || !mediaItem.file) {
          throw new Error(`Original video file not found in library for URL: ${url}`);
        }
        formData.append(`videoFile_${index}`, mediaItem.file);
        videoFilesMap.set(url, index);
      });
      
      const activeSegments = videoTrack.segments.map(s => ({
        start: s.start,
        end: s.end,
        sourceStart: s.sourceStart || 0,
        transitionOut: s.transitionOut,
        fileIndex: s.src ? videoFilesMap.get(s.src) : undefined
      }));
      formData.append('activeSegments', JSON.stringify(activeSegments));

      const textTrack = state.tracks.find(t => t.id === 'text-1' && !t.isHidden);
      const captions = textTrack?.segments.filter(s => s.name === 'Caption').map(s => ({
        text: s.text,
        start: s.start,
        end: s.end,
        x: s.x,
        y: s.y,
        fontSize: s.fontSize,
        fontFamily: s.fontFamily,
        color: s.color
      })) || [];
      formData.append('captions', JSON.stringify(captions));

      const firstCaption = textTrack?.segments.find(s => s.name === 'Caption');
      if (firstCaption) {
        formData.append('captionFont', firstCaption.fontFamily || 'Roboto-Black');
        formData.append('captionSize', (firstCaption.fontSize || 48).toString());
        formData.append('captionColor', firstCaption.color || '#FFFF00');
      }

      const audioTrack = state.tracks.find(t => t.id === 'audio-1' && !t.isHidden);
      const audioFx = audioTrack?.segments.map(s => ({
        url: s.src,
        start: s.start,
        duration: s.duration,
        volume: s.volume !== undefined ? s.volume : 1.0
      })) || [];
      formData.append('audioFx', JSON.stringify(audioFx));

      // Append resolution dimensions based on selected aspect ratio
      if (aspectRatio === '16:9') {
        formData.append('vw', '1920');
        formData.append('vh', '1080');
      } else if (aspectRatio === '1:1') {
        formData.append('vw', '1080');
        formData.append('vh', '1080');
      } else {
        // default 9:16
        formData.append('vw', '1080');
        formData.append('vh', '1920');
      }

      const res = await fetch('/api/export', {
        method: 'POST',
        body: formData
      });

      if (!res.ok) {
        let errMsg = "Export failed";
        try {
          const err = await res.json();
          errMsg = err.error || errMsg;
        } catch(e) {}
        throw new Error(errMsg);
      }

      const { jobId } = await res.json();
      
      // Poll for status
      const pollStatus = async () => {
        try {
          const statusRes = await fetch(`/api/export/status?id=${jobId}`);
          if (!statusRes.ok) throw new Error("Failed to get export status");
          
          const statusData = await statusRes.json();
          
          if (statusData.status === 'completed') {
            // Trigger download via the download endpoint
            window.location.href = `/api/export/download?id=${jobId}`;
            alert("🎉 Export Complete! Your video is downloading.");
            setIsExporting(false);
          } else if (statusData.status === 'error') {
            throw new Error(statusData.error || "Export failed during processing");
          } else {
            // Still processing, poll again in 3 seconds
            setTimeout(pollStatus, 3000);
          }
        } catch (e: any) {
           alert(`Export Error: ${e.message}`);
           setIsExporting(false);
        }
      };
      
      // Start polling
      setTimeout(pollStatus, 2000);
      // Notice we do NOT set isExporting(false) here, we wait for the polling to finish!
    } catch (err: any) {
      alert(`Export Error: ${err.message}`);
      setIsExporting(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-black overflow-hidden font-sans rounded-2xl border border-neutral-800 shadow-2xl">
      
      {/* Top Navbar for Editor */}
      <div className="h-14 bg-neutral-950 border-b border-neutral-800 flex items-center justify-between px-4 flex-shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <button 
              onClick={undo}
              disabled={past.length === 0}
              className="w-8 h-8 rounded hover:bg-white/10 flex items-center justify-center text-neutral-400 disabled:opacity-30 transition-colors"
            >
              <Undo className="w-4 h-4" />
            </button>
            <button 
              onClick={redo}
              disabled={future.length === 0}
              className="w-8 h-8 rounded hover:bg-white/10 flex items-center justify-center text-neutral-400 disabled:opacity-30 transition-colors"
            >
              <Redo className="w-4 h-4" />
            </button>
          </div>
          <div className="h-4 w-[1px] bg-neutral-800" />
          <input 
            type="text" 
            value={projectName} 
            onChange={(e) => setProjectName(e.target.value)}
            className="text-sm font-semibold text-neutral-300 bg-transparent border-b border-transparent hover:border-neutral-700 focus:border-indigo-500 focus:outline-none transition-colors px-1"
          />
          <button 
            onClick={() => {
              if (window.confirm("Are you sure you want to start over? All unsaved timeline progress will be lost.")) {
                const state = useEditorStore.getState();
                state.setTracks([
                  { id: 'video-1', type: 'video', name: 'Main Video', segments: [] },
                  { id: 'audio-1', type: 'audio', name: 'Audio Track', segments: [] },
                  { id: 'audio-2', type: 'audio', name: 'Audio FX', segments: [] },
                  { id: 'text-1', type: 'text', name: 'Captions', segments: [] },
                  { id: 'effect-1', type: 'effect', name: 'Transitions & Effects', segments: [] },
                ]);
                state.setCurrentTime(0);
                state.setZoomLevel(100);
                state.setProjectName("Project Name:");
              }
            }}
            className="ml-2 px-2 py-1 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-medium transition-colors flex items-center gap-1"
          >
            <Trash2 className="w-3 h-3" /> Start Over
          </button>
        </div>
        
        <div className="flex items-center gap-3">
          <select
            value={aspectRatio}
            onChange={(e) => setAspectRatio(e.target.value as '9:16' | '16:9' | '1:1')}
            className="px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-700 text-neutral-300 text-sm font-semibold hover:border-neutral-500 focus:border-indigo-500 focus:outline-none transition-colors"
          >
            <option value="9:16">9:16 (Vertical)</option>
            <option value="16:9">16:9 (Horizontal)</option>
            <option value="1:1">1:1 (Square)</option>
          </select>

          <Link 
            href="/tutorial"
            className="px-3 py-1.5 rounded-full bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 border border-blue-500/30 text-sm font-bold transition-all flex items-center gap-2"
          >
            <BookOpen className="w-4 h-4" /> Tutorial
          </Link>

          <button 
            onClick={() => setShowGrowthWizard(true)}
            className="px-4 py-1.5 rounded-full bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-400 border border-emerald-500/30 text-sm font-bold transition-all flex items-center gap-2 shadow-lg shadow-emerald-900/20"
          >
            <Sparkles className="w-4 h-4" /> Growth Mode
          </button>
          
          <button 
            onClick={handleExport}
            disabled={isExporting}
            className={`px-4 py-1.5 rounded-full ${isExporting ? 'bg-neutral-600 cursor-wait' : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-lg shadow-indigo-900/20'} text-white border border-indigo-500/30 text-sm font-bold transition-all flex items-center gap-2`}
          >
            {isExporting ? 'Exporting...' : 'Export Video'}
          </button>

          <button 
            onClick={() => {
              const data = JSON.stringify(tracks);
              const blob = new Blob([data], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `${projectName.replace(/\s+/g, '_')}.json`;
              a.click();
            }}
            className="px-3 py-1.5 rounded bg-white/5 hover:bg-white/10 text-neutral-300 text-sm font-medium transition-colors flex items-center gap-2"
          >
            <Save className="w-4 h-4" /> Save Local
          </button>
          
          <button className="px-3 py-1.5 rounded bg-white/5 hover:bg-white/10 text-neutral-300 text-sm font-medium transition-colors flex items-center gap-2 relative">
            <Upload className="w-4 h-4" /> Load Local
            <input 
              type="file" 
              accept=".json" 
              className="absolute inset-0 opacity-0 cursor-pointer"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (ev) => {
                    try {
                      const loadedTracks = JSON.parse(ev.target?.result as string);
                      const state = useEditorStore.getState();
                      const mediaLibrary = state.mediaLibrary;
                      
                      const remappedTracks = loadedTracks.map((t: any) => ({
                        ...t,
                        segments: t.segments.map((s: any) => {
                          if (s.src && s.src.startsWith('blob:')) {
                            const media = mediaLibrary.find(m => m.name === s.name);
                            if (media) {
                              return { ...s, src: media.url };
                            }
                          }
                          return s;
                        })
                      }));

                      // Check if any media is still missing (ignore text/effect segments)
                      const missingMedia = new Set<string>();
                      remappedTracks.forEach((t: any) => t.segments.forEach((s: any) => {
                        if (s.type === 'text' || s.type === 'effect' || s.type === 'transition') return;
                        
                        if (s.src && s.src.startsWith('blob:') && !mediaLibrary.some(m => m.url === s.src)) {
                          missingMedia.add(s.name || 'Unknown Media');
                        }
                      }));

                      if (missingMedia.size > 0) {
                        alert(`Warning: Missing media files (${Array.from(missingMedia).join(', ')}). Please drag and drop the original files back into the Media Library sidebar to relink them.`);
                      }

                      state.setTracks(remappedTracks);
                    } catch (err) {
                      alert("Invalid project file.");
                    }
                  };
                  reader.readAsText(file);
                }
              }}
            />
          </button>
          <button 
            onClick={handleCloudSync}
            disabled={isSyncing}
            className={`px-3 py-1.5 rounded ${isSyncing ? 'bg-indigo-900/50 cursor-wait' : 'bg-indigo-600/20 hover:bg-indigo-600/40'} text-indigo-300 border border-indigo-500/30 text-sm font-medium transition-colors flex items-center gap-2`}
          >
            <UploadCloud className="w-4 h-4" /> {isSyncing ? 'Syncing...' : 'Cloud Sync'}
          </button>
          
          <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white relative group cursor-pointer">
            <User className="w-4 h-4" />
            <div className="absolute top-full right-0 pt-2 w-48 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity z-50 flex flex-col">
              <div className="bg-neutral-900 border border-neutral-800 rounded-lg shadow-xl overflow-hidden flex flex-col">
                <div className="px-4 py-3 border-b border-neutral-800">
                  <p className="text-sm font-semibold text-white">Local User</p>
                  <p className="text-xs text-neutral-400">Pro Plan</p>
                </div>
                <a href="/downloads" className="px-4 py-2 text-left text-sm text-neutral-300 hover:bg-neutral-800 hover:text-white transition-colors">My Downloads</a>
                <a href="/marketplace" className="px-4 py-2 text-left text-sm text-neutral-300 hover:bg-neutral-800 hover:text-white transition-colors">Marketplace</a>
                <button onClick={async () => {
                  try {
                    const res = await fetch('/api/stripe/portal', { method: 'POST' });
                    const data = await res.json();
                    if (data.url) {
                      window.location.href = data.url;
                    } else {
                      alert(data.error || 'No active subscription found.');
                    }
                  } catch (e) {
                    alert('Failed to load billing portal.');
                  }
                }} className="px-4 py-2 text-left text-sm text-neutral-300 hover:bg-neutral-800 hover:text-white transition-colors">Manage Subscription</button>
                <button onClick={() => {
                  document.cookie = 'nexus_session_id=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
                  window.location.href = '/';
                }} className="px-4 py-2 text-left text-sm text-rose-400 hover:bg-neutral-800 hover:text-rose-300 transition-colors border-t border-neutral-800">Sign Out</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Editor Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar Tools */}
        <Sidebar />

        {/* Center Canvas Area */}
        <div className="flex-1 p-2 bg-neutral-950 flex flex-col min-w-0">
          <Canvas />
        </div>

        {/* Right Properties Panel */}
        <PropertiesPanel />
      </div>

      {/* Bottom Timeline */}
      <div className="h-[30%] min-h-[220px] flex-shrink-0 relative z-10 border-t border-neutral-800">
        <Timeline />
      </div>

      {/* Exporting Overlay */}
      {isExporting && (
        <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center">
          <div className="w-96 bg-neutral-900 border border-neutral-800 rounded-xl p-8 flex flex-col items-center shadow-2xl">
            <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mb-6" />
            <h2 className="text-xl font-bold text-white mb-2">Exporting your Video</h2>
            <p className="text-sm text-neutral-400 text-center mb-6">
              This usually takes a minute or two depending on the video length. Please don't close this tab.
            </p>
            <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-500 w-full animate-pulse origin-left" style={{ animationDuration: '3s' }} />
            </div>
          </div>
        </div>
      )}

      {showGrowthWizard && <GrowthModeWizard onClose={() => setShowGrowthWizard(false)} />}
      
      <TransitionModal 
        isOpen={transitionModalOpen}
        onClose={() => setTransitionModalOpen(false)}
        transitionType={transitionModalType}
        onSave={(duration) => {
          if (transitionTargetSegmentId) {
            const videoTrack = tracks.find(t => t.id === 'video-1');
            const targetSeg = videoTrack?.segments.find(s => s.id === transitionTargetSegmentId);
            
            useEditorStore.getState().updateSegment('video-1', transitionTargetSegmentId, {
              transitionOut: { type: transitionModalType, duration }
            });

          }
          setTransitionModalOpen(false);
        }}
      />
    </div>
  );
}
