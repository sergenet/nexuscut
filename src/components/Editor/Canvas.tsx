/* eslint-disable react-hooks/exhaustive-deps -- playback effects intentionally react to timeline identity changes without restarting on every clock tick. */
"use client";

import React, { useEffect, useRef, useState } from 'react';
import { useEditorStore } from '@/store/useEditorStore';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Maximize2, Minimize2 } from 'lucide-react';
import { TrackVideo, TrackAudio } from './TrackMedia';

export default function Canvas() {
  const { isPlaying, setIsPlaying, currentTime, setCurrentTime, videoDuration, setVideoDuration, tracks, aspectRatio, frameMode, updateSegment, brandKit, brandLogoEnabled, brandLogoPosition, brandLogoSize, brandLogoOpacity } = useEditorStore();
  const requestRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [previewScale, setPreviewScale] = useState(1);

  // VideoEditor keeps desktop and mobile layouts mounted and hides one with
  // CSS. Only the visible canvas may drive the shared Zustand playback clock
  // or audio elements; otherwise both canvases advance the timeline at once.
  const isVisibleCanvas = () => containerRef.current?.offsetParent !== null;

  useEffect(() => {
    const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Text sizes are authored against a 600px-high design canvas. Scale them
  // for the actual preview so a smaller editor panel matches the export's
  // relative layout instead of clipping large captions.
  useEffect(() => {
    const element = previewRef.current;
    if (!element || typeof ResizeObserver === 'undefined') return;
    const updateScale = () => {
      if (element.clientHeight > 0) setPreviewScale(Math.max(0.35, Math.min(1.5, element.clientHeight / 600)));
    };
    updateScale();
    const observer = new ResizeObserver(updateScale);
    observer.observe(element);
    return () => observer.disconnect();
  }, [aspectRatio]);

  useEffect(() => {
    if (!brandKit?.fontUrl) return;
    const style = document.createElement('style');
    style.dataset.nexusBrandFont = 'true';
    style.textContent = `@font-face{font-family:"Nexus Brand";src:url("${brandKit.fontUrl.replace(/["\\]/g, '')}");font-display:swap;}`;
    document.head.appendChild(style);
    return () => style.remove();
  }, [brandKit?.fontUrl]);

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

  function handleDurationResolved(actualSourceDuration: number) {
    if (!activeVideo || !Number.isFinite(actualSourceDuration) || actualSourceDuration <= 0) return;

    const sourceStart = activeVideo.sourceStart ?? 0;
    const availableDuration = Math.max(0, actualSourceDuration - sourceStart);
    const knownSourceDuration = activeVideo.sourceDuration;
    const expectedUntrimmedDuration = Math.max(0, (knownSourceDuration ?? activeVideo.duration) - sourceStart);
    const isUntouchedImport = Math.abs(activeVideo.duration - expectedUntrimmedDuration) < 0.25;

    if (!isUntouchedImport || availableDuration <= activeVideo.duration + 0.1) return;

    updateSegment(activeVideo.trackId, activeVideo.id, {
      duration: availableDuration,
      end: activeVideo.start + availableDuration,
      sourceDuration: actualSourceDuration,
    });
  }

  // Find active text segments across all text tracks
  const activeTexts = visibleTracks
    .filter(t => t.type === 'text')
    .flatMap(t => t.segments)
    .filter(s => currentTime >= s.start && currentTime < s.end);

  // Gather all audio segments from all tracks to preload them
  const allAudioSegments = React.useMemo(() => {
    return tracks.filter(t => !t.isHidden).flatMap(t => t.segments.filter(s => s.type === 'audio'));
  }, [tracks]);

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
      if (isPlaying && isVisibleCanvas()) videoRef.current.play().catch(e => console.log('Playback prevented', e));
      else videoRef.current.pause();
      
      // Sync volume and muted state directly on DOM node
      videoRef.current.muted = isMuted;
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
    if (!isVisibleCanvas()) {
      allAudioSegments.forEach(audio => audioRefs.current[audio.id]?.pause());
      return;
    }

    allAudioSegments.forEach(audio => {
      const el = audioRefs.current[audio.id];
      if (el) {
        const isActive = currentTime >= audio.start && currentTime < audio.end;
        
        if (isActive) {
          const expectedVol = isMuted ? 0 : Math.min(1, Math.max(0, audio.volume ?? 1));
          if (el.volume !== expectedVol) el.volume = expectedVol;
          
          const expectedTime = currentTime - audio.start + (audio.sourceStart || 0);
          // Audio is kept mounted while the timeline moves. Always realign it
          // after a seek or trim; the former condition was unreachable inside
          // the playing branch, leaving the clip at its previous source time.
          if (el.readyState >= 1 && Math.abs(el.currentTime - expectedTime) > 0.2) {
            el.currentTime = Math.max(0, expectedTime);
          }

          if (isPlaying) {
            if (el.paused) el.play().catch(e => console.warn(e));
          } else if (!el.paused) {
            el.pause();
          }
        } else {
          if (!el.paused) el.pause();
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
      }
    }
  }, [currentTime, isPlaying, activeVideo]);

  // A split mounts a new video element for the next segment. Start that new
  // element at its source offset even while the timeline is playing; otherwise
  // the right half briefly starts again from the beginning of the source file.
  useEffect(() => {
    if (!videoRef.current || !activeVideo) return;
    const offset = currentTime - activeVideo.start + (activeVideo.sourceStart ?? 0);
    videoRef.current.currentTime = Math.max(0, offset);
  }, [activeVideo?.id]);

  // Simulate playback loop driving the global time
  const animate = (time: number) => {
    if (!isVisibleCanvas()) return;

    if (lastTimeRef.current !== undefined) {
      const deltaTime = (time - lastTimeRef.current) / 1000;
      useEditorStore.setState((state) => {
        let newTime = state.currentTime + deltaTime;
        
        // The timeline is the single source of truth. Reading an HTML video's
        // source time here can jump across a split boundary, because each
        // segment points into a different offset of the same source file.

        // Gap skipping logic: if newTime falls into a gap where NO segments are present on ANY track,
        // jump to the start of the next segment.
        let isGap = true;
        let nextSegmentStart = Infinity;
        
        state.tracks.forEach(track => {
          track.segments.forEach(seg => {
            // A transition is a visual overlay only. It must not extend a
            // segment or alter the timeline's real clip boundaries.
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
    if (isPlaying && isVisibleCanvas()) {
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
      <div className="flex-1 bg-black flex items-center justify-center relative overflow-hidden group">
        
        {/* Actual Video Rendering */}
        <div 
          className="h-full w-auto max-w-full relative flex items-center justify-center overflow-hidden bg-black"
          ref={previewRef}
          style={{ aspectRatio: aspectRatio.replace(':', ' / ') }}
        >
          {activeVideo && activeVideo.src ? (
            activeVideo.type === 'image' ? (
              <img 
                key={activeVideo.id}
                src={activeVideo.src}
                alt="Media Canvas"
                className="w-full h-full object-contain transition-transform"
                style={{
                   transform: `scale(${activeVideo.scale ?? 1}) translate3d(${(activeVideo.x || 50) - 50}%, ${(activeVideo.y || 50) - 50}%, 0)`,
                   WebkitTransform: `scale(${activeVideo.scale ?? 1}) translate3d(${(activeVideo.x || 50) - 50}%, ${(activeVideo.y || 50) - 50}%, 0)`,
                   opacity: activeVideo.opacity ?? 1
                }}
              />
            ) : (
              <TrackVideo
                key={activeVideo.id}
                ref={videoRef}
                activeVideo={activeVideo}
                isMuted={isMuted}
                frameMode={frameMode}
                onDurationResolved={handleDurationResolved}
              />
            )
          ) : (
            <div className="text-neutral-600 font-mono text-xl opacity-50 select-none flex flex-col items-center gap-4">
              <div className="w-24 h-24 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center">
                NexusEngine
              </div>
              <p>No Media at {formatTime(currentTime)}</p>
            </div>
          )}

          {activeTexts.map(textSeg => {
            const encodedRetentionMatch = textSeg.text?.match(/^(.*)\[\[([^\]]+)\]\](.*)$/);
            const retentionParts = textSeg.retentionWords?.length
              ? textSeg.retentionWords.map((word, index) => ({ word, active: index === textSeg.activeWordIndex }))
              : encodedRetentionMatch
                ? [
                    ...encodedRetentionMatch[1].trim().split(/\s+/).filter(Boolean).map(word => ({ word, active: false })),
                    { word: encodedRetentionMatch[2], active: true },
                    ...encodedRetentionMatch[3].trim().split(/\s+/).filter(Boolean).map(word => ({ word, active: false })),
                  ]
                : null;
            const shadow = textSeg.textShadow
              ? `${textSeg.shadowColor || 'rgba(0,0,0,0.8)'} 0px 2px ${textSeg.shadowBlur ?? 8}px`
              : 'none';
            const textStroke = textSeg.outlineWidth
              ? { WebkitTextStroke: `${textSeg.outlineWidth}px ${textSeg.outlineColor || '#000000'}` }
              : {};
            return (
              <div
                key={textSeg.id}
                className="absolute pointer-events-none whitespace-pre-wrap"
                style={{
                  left: `${textSeg.x ?? 50}%`,
                  top: `${textSeg.y ?? 50}%`,
                  transform: `translate(${textSeg.textAlign === 'left' ? '0%' : textSeg.textAlign === 'right' ? '-100%' : '-50%'}, -50%)`,
                  width: '90%',
                  fontFamily: textSeg.name === 'Caption' && brandKit?.fontUrl ? '"Nexus Brand", sans-serif' : textSeg.fontFamily ? `"${textSeg.fontFamily}", sans-serif` : '"Inter", sans-serif',
                  fontSize: `${Math.round((textSeg.fontSize || 64) * previewScale)}px`,
                  color: textSeg.name === 'Caption' ? (brandKit?.primaryColor || textSeg.color || '#ffffff') : (textSeg.color || '#ffffff'),
                  fontWeight: textSeg.bold ? 'bold' : 'normal',
                  fontStyle: textSeg.italic ? 'italic' : 'normal',
                  textAlign: textSeg.textAlign || 'center',
                  letterSpacing: textSeg.letterSpacing ? `${textSeg.letterSpacing}px` : 'normal',
                  lineHeight: textSeg.lineHeight ?? 1.2,
                  textShadow: shadow,
                  ...textStroke,
                  zIndex: 20,
                  maxWidth: '90%',
                }}
              >
                <span className="inline-block">
                  {retentionParts?.length
                    ? retentionParts.map((part, index) => <React.Fragment key={`${textSeg.id}-${index}`}><span style={{ color: part.active ? (brandKit?.secondaryColor || '#FFD400') : (brandKit?.primaryColor || '#FFFFFF'), fontSize: part.active ? '1.12em' : '1em' }}>{part.word}</span>{index < retentionParts.length - 1 ? ' ' : ''}</React.Fragment>)
                    : textSeg.text}
                </span>
              </div>
            );
          })}
          {brandLogoEnabled && brandKit?.logoUrl && <img src={brandKit.logoUrl} alt="Brand watermark" className="pointer-events-none absolute z-30 object-contain" style={{ width: `${brandLogoSize}%`, maxHeight: `${brandLogoSize}%`, opacity: brandLogoOpacity / 100, top: brandLogoPosition.startsWith('top') ? '4%' : undefined, bottom: brandLogoPosition.startsWith('bottom') ? '4%' : undefined, left: brandLogoPosition.endsWith('left') ? '4%' : undefined, right: brandLogoPosition.endsWith('right') ? '4%' : undefined }} />}
          
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

        {/* Audio Elements (Hidden but Preloaded) */}
        {React.useMemo(() => allAudioSegments.map(audioSeg => (
            <TrackAudio 
              key={audioSeg.id}
              audioSeg={audioSeg}
              onRef={(el) => { audioRefs.current[audioSeg.id] = el; }}
            />
        )), [allAudioSegments])}

        {/* Timecode Overlay */}
        <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-md text-emerald-400 font-mono text-sm border border-neutral-800 z-40">
          {formatTime(currentTime)}
        </div>
      </div>

      {/* Playback Controls */}
      <div className="h-12 bg-neutral-900 border-t border-neutral-800 flex items-center px-2 sm:h-14 md:h-16 md:px-4 max-sm:landscape:h-10">
        
        <div className="flex-1 flex justify-start items-center gap-1 md:gap-4 text-neutral-400 font-mono text-[10px] md:text-sm max-sm:landscape:hidden">
          <span>{formatTime(currentTime)}</span>
          <span className="text-neutral-600">/</span>
          <span>{formatTime(videoDuration)}</span>
        </div>

        <div className="flex items-center justify-center gap-3 md:gap-6 max-sm:landscape:gap-0">
          <button 
            onClick={() => {
              setCurrentTime(0);
              if (window.innerWidth < 1024) window.dispatchEvent(new Event('timeline_reset_to_start'));
            }}
            className="text-neutral-400 hover:text-white transition-colors max-sm:landscape:hidden"
          >
            <SkipBack className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
          
          <button 
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-600 text-white shadow-lg shadow-indigo-900/50 transition-all hover:scale-105 hover:bg-indigo-500 active:scale-95 sm:h-10 sm:w-10 max-sm:landscape:h-9 max-sm:landscape:w-9"
          >
            {isPlaying ? <Pause className="h-4 w-4 sm:h-5 sm:w-5" /> : <Play className="ml-0.5 h-4 w-4 sm:ml-1 sm:h-5 sm:w-5" />}
          </button>

          <button 
            onClick={() => setCurrentTime(videoDuration)}
            className="text-neutral-400 hover:text-white transition-colors max-sm:landscape:hidden"
          >
            <SkipForward className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
        </div>

        <div className="flex-1 flex justify-end items-center gap-2 md:gap-4 max-sm:landscape:hidden">
          <button 
            onClick={() => setIsMuted(!isMuted)}
            className={`transition-colors ${isMuted ? 'text-rose-500' : 'text-neutral-400 hover:text-white'}`}
          >
            {isMuted ? <VolumeX className="h-4 w-4 sm:h-5 sm:w-5" /> : <Volume2 className="h-4 w-4 sm:h-5 sm:w-5" />}
          </button>
          <button 
            onClick={toggleFullscreen}
            className="text-neutral-400 hover:text-white transition-colors"
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4 sm:h-5 sm:w-5" /> : <Maximize2 className="h-4 w-4 sm:h-5 sm:w-5" />}
          </button>
        </div>

      </div>
    </div>
  );
}
