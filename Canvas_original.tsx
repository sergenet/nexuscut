"use client";

import React, { useEffect, useRef, useState } from 'react';
import { useEditorStore } from '@/store/useEditorStore';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Maximize2, Minimize2 } from 'lucide-react';

export default function Canvas() {
  const { isPlaying, setIsPlaying, currentTime, setCurrentTime, videoDuration, setVideoDuration, tracks, aspectRatio } = useEditorStore();
  const requestRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(err => console.error(err));
    } else {
      document.exitFullscreen();
    }
  };

  // Filter out hidden tracks for rendering
  const visibleTracks = tracks.filter(t => !t.isHidden);

  // Find active video
  const videoTrack = visibleTracks.find(t => t.type === 'video');
  const activeVideo = videoTrack?.segments.find(s => currentTime >= s.start && currentTime < s.end);

  // Find active text segments
  const textTrack = visibleTracks.find(t => t.type === 'text');
  const activeTexts = textTrack?.segments.filter(s => currentTime >= s.start && currentTime < s.end) || [];

  // Gather all audio segments from all tracks to preload them
  const allAudioSegments = visibleTracks.flatMap(t => t.segments.filter(s => s.type === 'audio'));

  // Calculate player transition overlay
  let transitionOpacity = 0;
  let transitionColor = '#000'; // dip to black
  visibleTracks.forEach(t => {
    t.segments.forEach(seg => {
      if (seg.transitionOut) {
        const type = seg.transitionOut.type;
        const duration = seg.transitionOut.duration;
        const peakTime = seg.end;
        const distFromPeak = Math.abs(currentTime - peakTime);
        const halfT = duration / 2;
        
        if (distFromPeak < halfT) {
          transitionOpacity = 1 - (distFromPeak / halfT);
          if (type !== 'Dip to Black') {
            transitionColor = '#fff'; // wipe or crossfade fallback
          }
        }
      }
    });
  });

  // Sync play state with video element
  useEffect(() => {
    if (videoRef.current) {
      if (isPlaying) videoRef.current.play().catch(e => console.log('Playback prevented', e));
      else videoRef.current.pause();
      
      // Sync volume
      if (activeVideo) {
         videoRef.current.volume = isMuted ? 0 : Math.min(1, Math.max(0, activeVideo.volume ?? 1));
      } else {
         videoRef.current.volume = isMuted ? 0 : 1;
      }
    }
  }, [isPlaying, isMuted, activeVideo]);

  // Handle active audio elements play state
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement | null }>({});
  useEffect(() => {
    allAudioSegments.forEach(audio => {
      const el = audioRefs.current[audio.id];
      if (el) {
        const isActive = currentTime >= audio.start && currentTime < audio.end;
        
        if (isActive && isPlaying) {
          el.play().catch(e => console.warn(e));
          el.volume = isMuted ? 0 : Math.min(1, Math.max(0, audio.volume ?? 1));
          
          // Sync time if drastically off
          const expectedTime = currentTime - audio.start + (audio.sourceStart || 0);
          const tolerance = audio.duration < 3 ? 0.5 : 0.2; // Use higher tolerance for short SFX to prevent stuttering
          if (el.readyState >= 1 && Math.abs(el.currentTime - expectedTime) > tolerance) {
             el.currentTime = expectedTime;
          }
        } else {
          el.pause();
        }
      }
    });
  }, [isPlaying, isMuted, currentTime, allAudioSegments]);

  // Sync seek state strictly (handles manual seeks while playing and timeline snaps)
  useEffect(() => {
    if (videoRef.current && activeVideo) {
      // Calculate precise offset into the current video clip
      const offset = currentTime - (activeVideo.start || 0) + (activeVideo.sourceStart || 0);
      
      if (!isPlaying) {
        videoRef.current.currentTime = Math.max(0, offset);
      } else if (Math.abs(videoRef.current.currentTime - offset) > 0.3) {
        // If playing but desynced by more than 300ms, force sync
        videoRef.current.currentTime = Math.max(0, offset);
      }
    }
  }, [currentTime, isPlaying, activeVideo]);

  // Simulate playback loop driving the global time
  const animate = (time: number) => {
    if (lastTimeRef.current !== undefined) {
      const deltaTime = (time - lastTimeRef.current) / 1000;
      useEditorStore.setState((state) => {
        let newTime = state.currentTime + deltaTime;
        
        // Gap skipping logic: if newTime falls into a gap where NO segments are present on ANY track,
        // jump to the start of the next segment.
        let isGap = true;
        let nextSegmentStart = Infinity;
        
        state.tracks.forEach(track => {
          track.segments.forEach(seg => {
            if (newTime >= seg.start && newTime < seg.end) {
              isGap = false; // Something is playing!
            }
            if (seg.start > newTime && seg.start < nextSegmentStart) {
              nextSegmentStart = seg.start;
            }
          });
        });

        if (isGap && nextSegmentStart !== Infinity) {
          newTime = nextSegmentStart;
        }

        if (newTime >= state.videoDuration) {
          // Playback finished, return to start!
          return { currentTime: 0, isPlaying: false };
        }
        return { currentTime: newTime };
      });
    }
    lastTimeRef.current = time;
    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    if (isPlaying) {
      lastTimeRef.current = performance.now();
      requestRef.current = requestAnimationFrame(animate);
    }
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [isPlaying]);

  // Dynamically set video duration based on tracks
  useEffect(() => {
    let max = 0; 
    tracks.forEach(t => t.segments.forEach(s => {
      if (s.end > max) max = s.end;
    }));
    // We set a minimum 5s duration so the timeline isn't tiny
    setVideoDuration(Math.max(max, 5));
  }, [tracks, setVideoDuration]);

  const formatTime = (timeInSeconds: number) => {
    const mins = Math.floor(timeInSeconds / 60);
    const secs = Math.floor(timeInSeconds % 60);
    const frames = Math.floor((timeInSeconds % 1) * 30); // assuming 30fps
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}:${frames.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col h-full bg-neutral-950 border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl" ref={containerRef}>
      {/* Canvas Area */}
      <div className="flex-1 bg-black p-4 flex items-center justify-center relative overflow-hidden group">
        
        {/* Step indicator */}
        <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-md text-white/50 font-bold text-xs uppercase tracking-wider border border-neutral-800 z-10 pointer-events-none">
          3. Play & Preview
        </div>
        
        {/* Actual Video Rendering inside constrained container */}
        <div 
          className="relative flex items-center justify-center overflow-hidden"
          style={{ 
             maxHeight: '100%',
             maxWidth: '100%'
          }}
        >
          {/* This SVG acts as a mathematical spacer that perfectly shrinks and grows while maintaining aspect ratio! */}
          <svg 
            viewBox={aspectRatio === '9:16' ? "0 0 9 16" : (aspectRatio === '1:1' ? "0 0 1 1" : "0 0 16 9")} 
            className="w-[100vw] h-[100vh] max-w-full max-h-full opacity-0 pointer-events-none"
          />
          
          <div className="absolute inset-0 m-auto bg-neutral-900 shadow-2xl border border-neutral-800 flex items-center justify-center overflow-hidden">
            {activeVideo && activeVideo.src ? (
              <video 
                ref={videoRef}
              src={activeVideo.src}
              className="w-full h-full object-contain transition-transform"
              style={{
                 transform: `scale(${activeVideo.scale ?? 1}) translate(${(activeVideo.x || 50) - 50}%, ${(activeVideo.y || 50) - 50}%)`,
                 opacity: activeVideo.opacity ?? 1
              }}
              muted={isMuted}
              playsInline
              onEnded={() => setIsPlaying(false)}
            />
          ) : (
            <div className="text-neutral-600 font-mono text-xl opacity-50 select-none flex flex-col items-center gap-4">
              <div className="w-24 h-24 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center">
                NexusEngine
              </div>
              <p>No Media at {formatTime(currentTime)}</p>
            </div>
          )}

          {activeTexts.map(textSeg => (
            <div 
              key={textSeg.id}
              className="absolute pointer-events-none drop-shadow-2xl whitespace-pre-wrap text-center"
              style={{
                left: `${textSeg.x ?? 50}%`,
                top: `${textSeg.y ?? 50}%`,
                transform: 'translate(-50%, -50%)',
                fontFamily: textSeg.fontFamily ? `"${textSeg.fontFamily}", sans-serif` : '"Inter", sans-serif',
                fontSize: `${textSeg.fontSize || 64}px`,
                color: textSeg.color || '#ffffff',
                zIndex: 20
              }}
            >
              {textSeg.text}
            </div>
          ))}
          
          {/* Legacy Simulated Transition Overlay */}
          {transitionOpacity > 0 && (
            <div 
              className="absolute inset-0 pointer-events-none z-30"
              style={{
                backgroundColor: transitionColor,
                opacity: transitionOpacity
              }}
            />
          )}
          </div>
        </div>

        {/* Audio Elements (Hidden but Preloaded) */}
        {allAudioSegments.map(audioSeg => (
          audioSeg.src ? (
            <audio 
              key={audioSeg.id}
              ref={el => { audioRefs.current[audioSeg.id] = el; }}
              src={audioSeg.src}
              preload="auto"
              className="hidden"
            />
          ) : null
        ))}

        {/* Timecode Overlay */}
        <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-md text-emerald-400 font-mono text-sm border border-neutral-800 z-40">
          {formatTime(currentTime)}
        </div>
      </div>

      {/* Playback Controls */}
      <div className="h-16 bg-neutral-900 border-t border-neutral-800 flex items-center px-4">
        
        <div className="flex-1 flex justify-start items-center gap-4 text-neutral-400 font-mono text-sm">
          <span>{formatTime(currentTime)}</span>
          <span className="text-neutral-600">/</span>
          <span>{formatTime(videoDuration)}</span>
        </div>

        <div className="flex items-center justify-center gap-6">
          <button 
            onClick={() => setCurrentTime(0)}
            className="text-neutral-400 hover:text-white transition-colors"
          >
            <SkipBack className="w-5 h-5" />
          </button>
          
          <button 
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-10 h-10 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-lg shadow-indigo-900/50"
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-1" />}
          </button>

          <button 
            onClick={() => setCurrentTime(videoDuration)}
            className="text-neutral-400 hover:text-white transition-colors"
          >
            <SkipForward className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 flex justify-end items-center gap-4">
          <button 
            onClick={() => setIsMuted(!isMuted)}
            className={`transition-colors ${isMuted ? 'text-rose-500' : 'text-neutral-400 hover:text-white'}`}
          >
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>
          <button 
            onClick={toggleFullscreen}
            className="text-neutral-400 hover:text-white transition-colors"
          >
            {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </button>
        </div>

      </div>
    </div>
  );
}
