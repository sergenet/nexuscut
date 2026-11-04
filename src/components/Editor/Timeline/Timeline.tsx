"use client";

import { toast } from '@/lib/toast';
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { DndContext, DragEndEvent, useSensor, useSensors, PointerSensor, closestCorners } from '@dnd-kit/core';
import { MediaItem, Track, TrackSegment, useEditorStore } from '@/store/useEditorStore';
import TrackRow from './TrackRow';
import PlayheadController from './PlayheadController';
import { ZoomIn, ZoomOut, Scissors, Trash, Maximize, Plus } from 'lucide-react';

const MIN_TIMELINE_ZOOM = 0.25;
type DropPayload = { type: 'media'; item: MediaItem } | { type: 'transition'; name: string } | { type: Exclude<TrackSegment['type'], 'transition'> | 'audio_fx'; name?: string; url?: string; duration?: number };

export default function Timeline() {
  const { 
    tracks, 
    moveSegment, 
    videoDuration, 
    zoomLevel, 
    setZoomLevel,
    selectedSegmentId,
    selectSegment,
    removeSegment,
    addSegment,
    splitSegment,
    setIsPlaying,
    setTransitionModalOpen,
    setTransitionModalType,
    setTransitionTargetSegmentId
  } = useEditorStore();

  const timelineRef = useRef<HTMLDivElement>(null);
  // Pinch to zoom refs
  const initialPinchDistance = useRef<number | null>(null);
  const initialPinchZoom = useRef<number>(100);
  
  const [dragOverTime, setDragOverTime] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const previousMobileVideoCount = useRef(0);

  useEffect(() => {
    const query = window.matchMedia('(max-width: 1023px)');
    const update = () => setIsMobile(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  // Phone users need the active story, not five empty lanes. Extra tracks
  // appear naturally as soon as the user adds text, audio, or an effect.
  const displayedTracks = isMobile
    ? tracks.filter(track => track.type === 'video' || track.segments.length > 0)
    : tracks;

  const resetMobileTimelineToStart = () => {
    if (!timelineRef.current) return;
    timelineRef.current.scrollTo({ left: 0, behavior: 'auto' });
    timelineRef.current.scrollLeft = 0;
    useEditorStore.getState().setCurrentTime(0);
  };

  // Mobile browsers may restore a nested scroll container after a reload or
  // sheet transition. Always start the editor at the beginning, and do the
  // same whenever a newly added video creates another timeline segment.
  useEffect(() => {
    if (!isMobile) return;
    const videoCount = tracks.find(track => track.id === 'video-1')?.segments.length ?? 0;
    const shouldReset = videoCount > previousMobileVideoCount.current;
    previousMobileVideoCount.current = videoCount;
    if (shouldReset || videoCount === 0) {
      window.requestAnimationFrame(resetMobileTimelineToStart);
      window.setTimeout(resetMobileTimelineToStart, 160);
    }
  }, [isMobile, tracks]);

  const resolveRuntimeAtPlacement = (item: MediaItem): Promise<number> => {
    if (item.type !== 'video' && item.type !== 'audio') {
      return Promise.resolve(item.duration || 5);
    }

    return new Promise((resolve) => {
      const media = document.createElement(item.type === 'video' ? 'video' : 'audio');
      let longestDuration = item.duration || 0;
      let settled = false;

      const recordDuration = () => {
        const reportedDuration = media.duration;
        if (Number.isFinite(reportedDuration) && reportedDuration > longestDuration) {
          longestDuration = reportedDuration;
        }
        if (media.seekable.length > 0) {
          const seekableEnd = media.seekable.end(media.seekable.length - 1);
          if (Number.isFinite(seekableEnd) && seekableEnd > longestDuration) {
            longestDuration = seekableEnd;
          }
        }
      };

      const finish = () => {
        if (settled) return;
        settled = true;
        media.removeEventListener('loadedmetadata', recordDuration);
        media.removeEventListener('durationchange', recordDuration);
        media.removeEventListener('loadeddata', recordDuration);
        media.removeEventListener('canplay', recordDuration);
        media.removeEventListener('progress', recordDuration);
        media.removeAttribute('src');
        media.load();
        resolve(longestDuration || item.duration || 10);
      };

      media.preload = 'auto';
      media.addEventListener('loadedmetadata', recordDuration);
      media.addEventListener('durationchange', recordDuration);
      media.addEventListener('loadeddata', recordDuration);
      media.addEventListener('canplay', recordDuration);
      media.addEventListener('progress', recordDuration);
      media.addEventListener('error', finish, { once: true });
      media.src = item.url;
      media.load();
      window.setTimeout(finish, 1500);
    });
  };
  
  // Setup DndKit sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Preserve taps on small mobile audio clips before dragging.
      },
    })
  );



  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over, delta } = event;

    if (over && active.data.current && over.data.current) {
      const segment = active.data.current.segment as TrackSegment;
      const targetTrack = over.data.current.track as Track;
      
      // Calculate new start time based on pixel movement and zoom level
      let newStart = Math.max(0, segment.start + (delta.x / zoomLevel));
      
      // Snap both clip edges. Previously only the dragged clip's left edge
      // could snap, and overlapping drops were still accepted. That made it
      // far too easy to stack the right half of a split on top of the left.
      const snapThreshold = 28 / zoomLevel;
      const otherSegments = targetTrack.segments.filter((s) => s.id !== segment.id);
      const edgePositions = Array.from(new Set([
        0,
        ...otherSegments.flatMap((s) => [s.end, s.start - segment.duration]),
        ...otherSegments.map((s) => s.end),
      ].filter((position) => position >= 0)));
      const overlaps = (position: number) => otherSegments.some((s) =>
        position < s.end - 0.001 && position + segment.duration > s.start + 0.001
      );
      const nearestPosition = (positions: number[]) => positions.reduce((closest, position) =>
        Math.abs(position - newStart) < Math.abs(closest - newStart) ? position : closest
      , positions[0]);

      if (edgePositions.length) {
        const nearestEdge = nearestPosition(edgePositions);
        if (Math.abs(nearestEdge - newStart) <= snapThreshold) newStart = nearestEdge;
      }

      // A video clip may never land on top of another video clip. If it is
      // dropped over one, choose the nearest available edge instead.
      if (targetTrack.type === 'video' && overlaps(newStart)) {
        const legalPositions = edgePositions.filter((position) => !overlaps(position));
        const trackEnd = otherSegments.reduce((end, s) => Math.max(end, s.end), 0);
        if (!overlaps(trackEnd)) legalPositions.push(trackEnd);
        if (legalPositions.length) newStart = nearestPosition(legalPositions);
      }

      // If the user holds Alt, detach the clip and move it independently
      const activatorEvent = event.activatorEvent as MouseEvent | KeyboardEvent | PointerEvent;
      const moveLinked = !activatorEvent.altKey;

      moveSegment(segment.id, segment.trackId, targetTrack.id, newStart, moveLinked);
    }
  };

  const isScrubbing = useRef(false);

  const updateScrubPosition = (e: React.PointerEvent<HTMLDivElement> | React.MouseEvent<HTMLDivElement>) => {
    if (!timelineRef.current) return;
    const rect = timelineRef.current.getBoundingClientRect();
    const scrollLeft = timelineRef.current.scrollLeft;
    const headerWidth = window.innerWidth < 1024 ? 48 : 192;
    const x = e.clientX - rect.left + scrollLeft - headerWidth;
    
    if (x >= -50) { // Allow slight negative pull to ensure they can snap to 0
      let newTime = Math.max(0, Math.min(x / zoomLevel, videoDuration));
      
      // Magnetic snap to 00.00 for playhead if within 10px
      if (x < 10) {
        newTime = 0;
      }
      
      useEditorStore.getState().setCurrentTime(newTime);
    }
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    isScrubbing.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    updateScrubPosition(e);
    setIsPlaying(false); // Pause when starting to scrub
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isScrubbing.current) return;
    updateScrubPosition(e);
  };

  const handlePointerUp = () => {
    isScrubbing.current = false;
  };

  const handleTimelineClick = () => {
    // Handled by pointer down/move/up for smooth scrubbing
  };

  const handleDelete = useCallback(() => {
    if (selectedSegmentId) {
      // Find the track containing this segment
      const track = tracks.find(t => t.segments.some(s => s.id === selectedSegmentId));
      if (track && !track.isLocked) {
        removeSegment(track.id, selectedSegmentId);
      }
    }
  }, [removeSegment, selectedSegmentId, tracks]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
        handleDelete();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleDelete]);

  const handleSplit = () => {
    const currentStateTime = useEditorStore.getState().currentTime;
    let targetSegment = null;
    let targetTrack = null;

    if (selectedSegmentId) {
      targetTrack = tracks.find(t => t.segments.some(s => s.id === selectedSegmentId));
      if (targetTrack) {
        targetSegment = targetTrack.segments.find(s => s.id === selectedSegmentId);
        
        // If the playhead is outside the selected segment, ignore the selection!
        if (targetSegment && (currentStateTime <= targetSegment.start || currentStateTime >= targetSegment.end)) {
          targetSegment = undefined;
        }
      }
    } 
    
    if (!targetSegment) {
      // If nothing valid is selected, find any segment under the playhead on the video track
      targetTrack = tracks.find(t => t.id === 'video-1');
      if (targetTrack) {
        targetSegment = targetTrack.segments.find(s => currentStateTime > s.start && currentStateTime < s.end);
      }
    }

    if (targetSegment && targetTrack && !targetTrack.isLocked && currentStateTime > targetSegment.start && currentStateTime < targetSegment.end) {
      splitSegment(targetTrack.id, targetSegment.id, currentStateTime);
      // The prominent phone toolbar uses this handler. Clear its temporary
      // selection after a split so playback is never covered by an X badge.
      if (window.innerWidth < 1024) selectSegment(null);
    }
  };

  useEffect(() => {
    const resetToStart = () => {
      useEditorStore.getState().setCurrentTime(0);
      const scrollStart = resetMobileTimelineToStart;
      // Run after the add/zoom layout settles; a synchronous assignment can
      // be overwritten by the browser's recalculated scroll bounds.
      window.requestAnimationFrame(scrollStart);
      window.setTimeout(scrollStart, 80);
    };
    window.addEventListener('timeline_reset_to_start', resetToStart);
    return () => window.removeEventListener('timeline_reset_to_start', resetToStart);
  }, []);
  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';

    if (!timelineRef.current) return;
    const rect = timelineRef.current.getBoundingClientRect();
    const scrollLeft = timelineRef.current.scrollLeft;
    const headerWidth = window.innerWidth < 1024 ? 48 : 192;
    const x = e.clientX - rect.left + scrollLeft - headerWidth;
    const hoverTime = Math.max(0, x / zoomLevel);

    const isTransition = Array.from(e.dataTransfer.types).some(t => t.toLowerCase().includes('transition'));

    if (isTransition) {
      const videoTrack = tracks.find(t => t.id === 'video-1');
      if (videoTrack && videoTrack.segments.length > 0) {
        let minDist = Infinity;
        let targetTime = null;
        
        videoTrack.segments.forEach(seg => {
          const distToEnd = Math.abs(hoverTime - seg.end);
          if (distToEnd < minDist) {
            minDist = distToEnd;
            targetTime = seg.end;
          }
        });
        
        if (targetTime !== null) {
          setDragOverTime(targetTime);
        }
      }
    } else {
      // For Audio FX, Text, Media, show the indicator directly at the mouse position
      setDragOverTime(hoverTime);
    }
  };

  const handleDragLeave = () => {
    setDragOverTime(null);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOverTime(null);
    
    let data = e.dataTransfer.getData('application/json');
    if (!data) data = e.dataTransfer.getData('text/plain');
    
    let item: DropPayload | null = null;
    if (data) {
      try { item = JSON.parse(data) as DropPayload; } catch {}
    }
    
    if (!item) {
      // Ultimate fallback: scan types
      const types = Array.from(e.dataTransfer.types);
      const isTrans = types.some(t => t.toLowerCase().includes('nexuscut-type-transition'));
      if (isTrans) {
        const nameType = types.find(t => t.toLowerCase().includes('nexuscut-name-'));
        const name = nameType ? nameType.split('nexuscut-name-')[1].replace(/-/g, ' ') : 'Cross Dissolve';
        item = { type: 'transition', name };
      }
    }
    
    if (!item) return;

    try {
      if (!timelineRef.current) return;

      const rect = timelineRef.current.getBoundingClientRect();
      const scrollLeft = timelineRef.current.scrollLeft;
      const headerWidth = window.innerWidth < 1024 ? 48 : 192;
      const dropX = e.clientX - rect.left + scrollLeft - headerWidth;
      
      const dropTime = Math.max(0, dropX / zoomLevel);
      
      if (item.type === 'transition') {
        const videoTrack = tracks.find(t => t.id === 'video-1');
        if (!videoTrack || videoTrack.segments.length === 0) {
          toast("You must have video clips on the timeline to add a transition!");
          return;
        }

        // Find the closest segment end to apply the transition to
        let closestSeg = videoTrack.segments[0];
        let minDist = Infinity;
        
        videoTrack.segments.forEach(seg => {
          const distToEnd = Math.abs(dropTime - seg.end);
          if (distToEnd < minDist) {
            minDist = distToEnd;
            closestSeg = seg;
          }
        });

        // Open the modal to configure duration
        setTransitionTargetSegmentId(closestSeg.id);
        setTransitionModalType(item.name || 'Cross Dissolve');
        setTransitionModalOpen(true);
        return;
      }

      let trackId = 'video-1';
      if (item.type === 'media') {
        trackId = item.item.type === 'video' ? 'video-1' : item.item.type === 'audio' ? 'audio-1' : 'video-1';
      } else if (item.type === 'audio') {
        trackId = 'audio-1';
      } else if (item.type === 'audio_fx') {
        trackId = 'audio-2';
      } else if (item.type === 'effect') {
        trackId = 'effect-1';
      } else if (item.type === 'text') {
        trackId = 'text-1';
      }
      
      // Reduced magnetic snap to 15 pixels
      const snapThreshold = 15 / zoomLevel;
      
      // If the target track is empty AND it's the main video track, ALWAYS snap to 0 to save time
      const targetTrack = tracks.find(t => t.id === trackId);
      const isTrackEmpty = !targetTrack || targetTrack.segments.length === 0;
      if (targetTrack?.type === 'audio') {
        const state = useEditorStore.getState();
        if (targetTrack.isLocked) state.toggleTrackLock(targetTrack.id);
        if (targetTrack.isHidden) state.toggleTrackVisibility(targetTrack.id);
      }
      
      let finalDropTime = dropTime;
      if ((isTrackEmpty && trackId === 'video-1') || dropTime < snapThreshold) {
        finalDropTime = 0;
      } else if (targetTrack) {
        // Snap to edges of other segments in the track
        for (const s of targetTrack.segments) {
          if (Math.abs(dropTime - s.end) < snapThreshold) {
            finalDropTime = s.end;
            break;
          }
          if (Math.abs(dropTime - s.start) < snapThreshold) {
            finalDropTime = s.start;
            break;
          }
        }
      }

      const duration = item.type === 'media' ? (item.item.duration || 10) : item.type === 'effect' ? (item.duration || 2) : (item.duration || 10);

      // Keep the main video and recorded/TTS narrations sequential. Music and
      // sound effects are allowed to overlap intentionally.
      const draggedName = item.type === 'media' ? item.item.name : item.name;
      const isNarration = trackId === 'audio-1'
        && typeof draggedName === 'string'
        && (/^Voiceover(?:_|\s|$)/i.test(draggedName) || /^NexusCut narration/i.test(draggedName));
      if (targetTrack && (trackId === 'video-1' || isNarration)) {
        const isOverlapping = targetTrack.segments.some(s => 
          (finalDropTime >= s.start && finalDropTime < s.end) || 
          (finalDropTime + duration > s.start && finalDropTime + duration <= s.end) ||
          (finalDropTime <= s.start && finalDropTime + duration >= s.end)
        );
        
        if (isOverlapping) {
          const trackEnd = targetTrack.segments.reduce((max, s) => Math.max(max, s.end), 0);
          finalDropTime = trackEnd;
        }
      }

      if (item.type === 'media') {
        const segmentId = Math.random().toString(36).substr(2, 9);
        addSegment(trackId, {
          id: segmentId,
          trackId: trackId,
          start: finalDropTime,
          end: finalDropTime + duration,
          duration: duration,
          sourceDuration: duration,
          type: item.item.type,
          src: item.item.url,
          name: item.item.name
        });

        // Drag-and-drop uses the same media library as click-to-add, but it had
        // previously skipped the fresh metadata pass. Correct the new segment
        // once the browser resolves this exact playback source.
        void resolveRuntimeAtPlacement(item.item).then((actualDuration) => {
          if (actualDuration <= duration + 0.1) return;
          useEditorStore.getState().updateSegment(trackId, segmentId, {
            duration: actualDuration,
            end: finalDropTime + actualDuration,
            sourceDuration: actualDuration,
          });
        });
      } else {
        addSegment(trackId, {
          id: Math.random().toString(36).substr(2, 9),
          trackId: trackId,
          start: finalDropTime,
          end: finalDropTime + duration,
          duration: duration,
          type: item.type === 'audio_fx' ? 'audio' : item.type,
          src: item.url,
          name: item.name
        });
      }

      // Auto-fit if this is the very first clip being dropped onto the timeline
      const isFirstClip = !tracks.some(t => t.segments.length > 0);
      if (isFirstClip && timelineRef.current && duration > 0) {
        const visibleWidth = timelineRef.current.clientWidth - 192; // 192px is track header
        const desiredZoom = (visibleWidth * 0.9) / duration;
        const finalZoom = Math.min(300, Math.max(MIN_TIMELINE_ZOOM, desiredZoom));
        useEditorStore.getState().setZoomLevel(finalZoom);
      }

    } catch (err) {
      console.error("Drop error", err);
    }
  };

  const handleTrimExtras = () => {
    // Find the end time of the last video segment
    const videoTrack = tracks.find(t => t.id === 'video-1');
    if (!videoTrack || videoTrack.segments.length === 0) return;
    const videoEnd = Math.max(...videoTrack.segments.map(s => s.end));
    
    // Remove all text and audio segments that start at or after the video end
    tracks.forEach(track => {
      if (track.id === 'video-1') return; // Don't touch video track
      track.segments.forEach(seg => {
        if (seg.start >= videoEnd) {
          removeSegment(track.id, seg.id);
        }
      });
    });
  };

  // Check if there are any segments past the video end (for button state)
  const videoTrack = tracks.find(t => t.id === 'video-1');
  const videoEnd = videoTrack ? Math.max(0, ...videoTrack.segments.map(s => s.end)) : 0;
  const hasExtras = tracks.some(t => t.id !== 'video-1' && t.segments.some(s => s.start >= videoEnd)) && videoEnd > 0;

  return (
    <div className="flex flex-col h-full bg-neutral-950 border-t border-neutral-800">
      
      {/* Timeline Toolbar */}
      <div className="h-12 w-full bg-neutral-900 border-b border-neutral-800 flex items-center justify-between px-4 cursor-default overflow-x-auto custom-scrollbar gap-4">
        <div className="flex items-center gap-2 flex-shrink-0">
          <button 
            onClick={handleSplit}
            className="px-3 py-1.5 flex items-center gap-2 text-sm font-medium text-neutral-400 hover:text-white hover:bg-neutral-800 rounded transition-colors" 
            title="Split Clip at Playhead"
          >
            <Scissors className="w-4 h-4" /> Split
          </button>
          <button 
            onClick={handleDelete}
            disabled={!selectedSegmentId}
            className={`px-3 py-1.5 flex items-center gap-2 text-sm font-medium rounded transition-colors ${selectedSegmentId ? 'text-neutral-400 hover:text-rose-500 hover:bg-neutral-800' : 'text-neutral-500 cursor-not-allowed'}`} 
            title="Delete Selected"
          >
            <Trash className="w-4 h-4" /> Delete
          </button>
          {hasExtras && (
            <button 
              onClick={handleTrimExtras}
              className="px-3 py-1.5 flex items-center gap-2 text-sm font-medium text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 rounded transition-colors border border-amber-500/30" 
              title="Remove all captions and audio FX that extend past the end of the video"
            >
              <Scissors className="w-4 h-4" /> Trim Extras
            </button>
          )}
        </div>

        <div className="flex items-center gap-4 flex-shrink-0">
          <button 
            onClick={() => {
              if (timelineRef.current && videoDuration > 0) {
                const availableWidth = timelineRef.current.clientWidth - 192 - 100;
                const targetZoom = availableWidth / videoDuration;
                setZoomLevel(Math.max(MIN_TIMELINE_ZOOM, Math.min(300, targetZoom)));
                timelineRef.current.scrollLeft = 0;
              }
            }}
            className="text-xs font-bold px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-md transition-colors flex items-center gap-1.5"
          >
            <Maximize className="w-3.5 h-3.5" /> Fit
          </button>

          <div className="flex items-center gap-2 bg-black/40 rounded-lg p-1 border border-neutral-800">
            <button 
              onClick={() => setZoomLevel(Math.max(MIN_TIMELINE_ZOOM, zoomLevel - 10))}
              className="p-1 text-neutral-400 hover:text-white rounded transition-colors"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <div className="w-32 h-1 bg-neutral-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-indigo-500" 
                style={{ width: `${(zoomLevel / 300) * 100}%` }}
              />
            </div>
            <button 
              onClick={() => setZoomLevel(Math.min(300, zoomLevel + 10))}
              className="p-1 text-neutral-400 hover:text-white rounded transition-colors"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>


      {/* Tracks Container */}
      <div 
        ref={timelineRef}
        className="flex-1 overflow-auto relative custom-scrollbar select-none touch-pan-x touch-pan-y"
        onClick={handleTimelineClick}
        onTouchStart={(e) => {
          if (e.touches.length === 2) {
            const touch1 = e.touches[0];
            const touch2 = e.touches[1];
            const distance = Math.hypot(touch2.clientX - touch1.clientX, touch2.clientY - touch1.clientY);
            initialPinchDistance.current = distance;
            initialPinchZoom.current = useEditorStore.getState().zoomLevel;
          }
        }}
        onTouchMove={(e) => {
          if (e.touches.length === 2 && initialPinchDistance.current !== null) {
            const touch1 = e.touches[0];
            const touch2 = e.touches[1];
            const distance = Math.hypot(touch2.clientX - touch1.clientX, touch2.clientY - touch1.clientY);
            const scale = distance / initialPinchDistance.current;
            const newZoom = Math.max(MIN_TIMELINE_ZOOM, Math.min(300, initialPinchZoom.current * scale));
            setZoomLevel(newZoom);
          }
        }}
        onTouchEnd={() => {
          initialPinchDistance.current = null;
        }}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >


        <div 
          className="relative min-w-full"
          style={{ width: `max(100%, ${videoDuration * zoomLevel + (typeof window !== 'undefined' && window.innerWidth < 1024 ? 48 : 192) + 100}px)` }} 
        >
          
          {/* Time Ruler */}
          <div 
            className="h-8 lg:h-6 flex border-b border-neutral-800 bg-neutral-900 sticky top-0 z-40 shadow-sm cursor-ew-resize touch-none"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={(e) => {
              handlePointerUp();
              // Ensure we release capture so they don't get stuck scrubbing
              e.currentTarget.releasePointerCapture(e.pointerId);
            }}
            onPointerCancel={handlePointerUp}
          >
            <div className="w-12 lg:w-48 flex-shrink-0 bg-neutral-900 border-r border-neutral-800 sticky left-0 z-50 shadow-[4px_0_12px_rgba(0,0,0,0.5)]" />
            <div className="flex-1 relative overflow-hidden pointer-events-none">
              {/* Render ruler ticks */}
              {[...Array(Math.ceil(videoDuration) + 1)].map((_, i) => (
                <div 
                  key={i} 
                  className="absolute bottom-0 border-l border-neutral-700"
                  style={{ left: `${i * zoomLevel}px`, height: i % 5 === 0 ? '10px' : '5px' }}
                >
                  {i % 5 === 0 && (
                    <span className="absolute -top-4 -left-2 text-[10px] text-neutral-500 font-mono">
                      00:{i.toString().padStart(2, '0')}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
            {/* Tracks List */}
            <div className="relative pb-8">
              {displayedTracks.map((track) => (
                <TrackRow key={track.id} track={track} />
              ))}
              
              {/* Transition Drop Indicator */}
              {dragOverTime !== null && (
                <div 
                  className="absolute top-0 bottom-0 w-1 bg-amber-400 z-50 animate-pulse pointer-events-none"
                  style={{ 
                    left: `${dragOverTime * zoomLevel + (typeof window !== 'undefined' && window.innerWidth < 1024 ? 48 : 192) - 2}px`, 
                    boxShadow: '0 0 15px 4px rgba(251, 191, 36, 0.6)'
                  }}
                />
              )}
              
              {/* Add Track Button */}
              <div className="hidden lg:block pl-4 pt-4 sticky left-0 w-12 lg:w-48 z-10 overflow-hidden">
                <button 
                  onClick={() => {
                    const audioTracks = tracks.filter(t => t.type === 'audio').length;
                    useEditorStore.getState().addTrack({
                      id: `audio-${Math.random().toString(36).substr(2, 9)}`,
                      type: 'audio',
                      name: `Audio Track ${audioTracks + 1}`,
                      segments: []
                    });
                  }}
                  className="w-full py-2 border border-dashed border-neutral-700 hover:border-indigo-500 rounded-lg text-xs font-bold text-neutral-400 hover:text-indigo-400 bg-neutral-900 hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Audio Track
                </button>
              </div>

              {/* Playhead Cursor */}
              <PlayheadController timelineRef={timelineRef} />
            </div>
          </DndContext>
          
        </div>
      </div>

    </div>
  );
}
