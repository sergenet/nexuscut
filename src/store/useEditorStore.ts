import { create } from 'zustand';

export interface MediaItem {
  id: string;
  url: string;
  type: 'video' | 'audio' | 'image';
  name: string;
  file?: File;
  duration?: number;
  thumbnailUrl?: string;
}

export interface TrackSegment {
  id: string;
  trackId: string;
  start: number; // in seconds
  end: number; // in seconds
  duration: number; // in seconds
  type: 'video' | 'audio' | 'text' | 'effect' | 'transition' | 'image';
  src?: string;
  text?: string;
  name?: string;
  sourceStart?: number; // the trim offset from the original media file
  sourceDuration?: number; // full duration of the original media file
  // Visual properties
  x?: number; // 0-100 percentage
  y?: number; // 0-100 percentage
  scale?: number;
  opacity?: number;
  // Audio properties
  volume?: number;
  // Text specific
  color?: string;
  fontSize?: number;
  fontFamily?: string;
  bold?: boolean;
  italic?: boolean;
  textAlign?: 'left' | 'center' | 'right';
  letterSpacing?: number; // px
  lineHeight?: number; // multiplier
  textShadow?: boolean;
  shadowColor?: string;
  shadowBlur?: number;
  outlineWidth?: number;
  outlineColor?: string;
  // Effects/Transitions
  transitionOut?: { type: string; duration: number };
  visualEffect?: 'none' | 'mono' | 'warm' | 'cool' | 'contrast';
  style?: string; // e.g. 'hormozi' etc
  retentionWords?: string[];
  activeWordIndex?: number;
}

export interface Track {
  id: string;
  type: 'video' | 'audio' | 'text' | 'effect';
  name: string;
  isHidden?: boolean;
  isLocked?: boolean;
  segments: TrackSegment[];
}

export interface TranscriptWord {
  id: string;
  text: string;
  start: number;
  end: number;
  sourceSrc: string;
  segmentId: string;
}

export interface EditorBrandKit {
  primaryColor?: string | null;
  secondaryColor?: string | null;
  fontUrl?: string | null;
  logoUrl?: string | null;
}

interface EditorSnapshot {
  tracks: Track[];
  transcriptionText: string;
  transcriptionWords: TranscriptWord[];
  aspectRatio: '9:16' | '16:9' | '1:1';
  frameMode: 'fit' | 'fill';
  videoDuration: number;
}

interface EditorState {
  // Playback state
  currentTime: number;
  isPlaying: boolean;
  videoDuration: number;
  
  // Timeline zoom
  zoomLevel: number; // Pixels per second
  
  // Transition Modal State
  transitionModalOpen: boolean;
  transitionModalType: string;
  transitionTargetSegmentId: string | null;

  setTransitionModalOpen: (isOpen: boolean) => void;
  setTransitionModalType: (type: string) => void;
  setTransitionTargetSegmentId: (id: string | null) => void;

  // Media Library
  mediaLibrary: MediaItem[];

  // Project data
  projectName: string;
  setProjectName: (name: string) => void;
  aspectRatio: '9:16' | '16:9' | '1:1';
  setAspectRatio: (ratio: '9:16' | '16:9' | '1:1') => void;
  frameMode: 'fit' | 'fill';
  setFrameMode: (mode: 'fit' | 'fill') => void;

  // Tracks
  tracks: Track[];
  selectedSegmentId: string | null;

  // History
  past: EditorSnapshot[];
  future: EditorSnapshot[];
  saveHistory: () => void;
  undo: () => void;
  redo: () => void;
  setTracks: (tracks: Track[]) => void;

  // Transcription
  transcriptionText: string;
  setTranscriptionText: (text: string) => void;
  transcriptionWords: TranscriptWord[];
  setTranscriptionWords: (words: TranscriptWord[]) => void;
  brandKit: EditorBrandKit | null;
  setBrandKit: (brandKit: EditorBrandKit | null) => void;
  brandLogoEnabled: boolean;
  brandLogoPosition: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  brandLogoSize: number;
  brandLogoOpacity: number;
  setBrandLogoEnabled: (enabled: boolean) => void;
  setBrandLogoPosition: (position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right') => void;
  setBrandLogoSize: (size: number) => void;
  setBrandLogoOpacity: (opacity: number) => void;
  applyScriptCuts: (wordIds: string[]) => number;

  // Actions
  setCurrentTime: (time: number) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setVideoDuration: (duration: number) => void;
  setZoomLevel: (zoom: number) => void;
  addMediaItem: (item: MediaItem) => void;
  removeMediaItem: (id: string) => void;
  setMediaLibrary: (items: MediaItem[]) => void;
  addTrack: (track: Track) => void;
  addSegment: (trackId: string, segment: TrackSegment) => void;
  splitSegment: (trackId: string, segmentId: string, splitTime: number) => string | null;
  updateSegment: (trackId: string, segmentId: string, updates: Partial<TrackSegment>) => void;
  updateSegmentRealtime: (trackId: string, segmentId: string, updates: Partial<TrackSegment>) => void;
  updateAllSegments: (trackId: string, updates: Partial<TrackSegment>, condition?: (s: TrackSegment) => boolean) => void;
  updateAllSegmentsRealtime: (trackId: string, updates: Partial<TrackSegment>, condition?: (s: TrackSegment) => boolean) => void;
  removeSegment: (trackId: string, segmentId: string) => void;
  removeAllCaptions: (trackId: string) => void;
  selectSegment: (segmentId: string | null) => void;
  moveSegment: (segmentId: string, sourceTrackId: string, targetTrackId: string, newStart: number, moveLinked?: boolean) => void;
  toggleTrackVisibility: (trackId: string) => void;
  toggleTrackLock: (trackId: string) => void;
}

export const useEditorStore = create<EditorState>((set, get) => ({
  currentTime: 0,
  isPlaying: false,
  videoDuration: 0,
  zoomLevel: 100, // 100px per second by default
  projectName: "Untitled project",
  aspectRatio: '9:16',
  // Preserve the complete frame by default. Creators can explicitly choose
  // Fill screen when they want a deliberate crop.
  frameMode: 'fit',

  // Transition Modal State
  transitionModalOpen: false,
  transitionModalType: 'Cross Dissolve',
  transitionTargetSegmentId: null,

  setTransitionModalOpen: (isOpen) => set({ transitionModalOpen: isOpen }),
  setTransitionModalType: (type) => set({ transitionModalType: type }),
  setTransitionTargetSegmentId: (id) => set({ transitionTargetSegmentId: id }),

  // Start with some default tracks
  tracks: [
    { id: 'video-1', type: 'video', name: 'Main Video', segments: [] },
    { id: 'audio-1', type: 'audio', name: 'Audio Track', segments: [] },
    { id: 'audio-2', type: 'audio', name: 'Audio FX', segments: [] },
    { id: 'text-1', type: 'text', name: 'Captions', segments: [] },
    { id: 'effect-1', type: 'effect', name: 'Transitions & Effects', segments: [] },
  ],
  selectedSegmentId: null,
  mediaLibrary: [],
  transcriptionText: '',
  transcriptionWords: [],
  brandKit: null,
  brandLogoEnabled: false,
  brandLogoPosition: 'bottom-right',
  brandLogoSize: 18,
  brandLogoOpacity: 85,

  past: [],
  future: [],

  setProjectName: (name) => set({ projectName: name }),
  setAspectRatio: (ratio) => set({ aspectRatio: ratio }),
  setFrameMode: (mode) => set({ frameMode: mode }),
  setCurrentTime: (time) => set({ currentTime: time }),
  // Starting playback exits edit mode so a selected clip, its delete button, and
  // its properties panel do not remain over the playing timeline.
  setIsPlaying: (isPlaying) => set({
    isPlaying,
    ...(isPlaying ? { selectedSegmentId: null } : {}),
  }),
  setVideoDuration: (duration) => set({ videoDuration: duration }),
  setZoomLevel: (zoom) => set({ zoomLevel: zoom }),
  
  setTranscriptionText: (text) => set({ transcriptionText: text }),
  setTranscriptionWords: (words) => set({ transcriptionWords: words }),
  setBrandKit: (brandKit) => set({ brandKit }),
  setBrandLogoEnabled: (brandLogoEnabled) => set({ brandLogoEnabled }),
  setBrandLogoPosition: (brandLogoPosition) => set({ brandLogoPosition }),
  setBrandLogoSize: (brandLogoSize) => set({ brandLogoSize }),
  setBrandLogoOpacity: (brandLogoOpacity) => set({ brandLogoOpacity }),

  addMediaItem: (item) => set((state) => ({ mediaLibrary: [...state.mediaLibrary, item] })),
  removeMediaItem: (id) => set((state) => ({ mediaLibrary: state.mediaLibrary.filter(item => item.id !== id) })),
  setMediaLibrary: (items) => set({ mediaLibrary: items }),

  saveHistory: () => {
    const { tracks, transcriptionText, transcriptionWords, aspectRatio, frameMode, videoDuration, past } = get();
    // Keep max 20 history states
    const snapshot: EditorSnapshot = JSON.parse(JSON.stringify({ tracks, transcriptionText, transcriptionWords, aspectRatio, frameMode, videoDuration }));
    const newPast = [...past, snapshot].slice(-20);
    set({ past: newPast, future: [] });
  },

  undo: () => {
    const { past, future, tracks, transcriptionText, transcriptionWords, aspectRatio, frameMode, videoDuration } = get();
    if (past.length === 0) return;
    const previous = past[past.length - 1];
    const newPast = past.slice(0, past.length - 1);
    set({ 
      past: newPast, 
      future: [JSON.parse(JSON.stringify({ tracks, transcriptionText, transcriptionWords, aspectRatio, frameMode, videoDuration })), ...future],
      tracks: previous.tracks,
      transcriptionText: previous.transcriptionText,
      transcriptionWords: previous.transcriptionWords,
      aspectRatio: previous.aspectRatio,
      frameMode: previous.frameMode,
      videoDuration: previous.videoDuration,
    });
  },

  redo: () => {
    const { past, future, tracks, transcriptionText, transcriptionWords, aspectRatio, frameMode, videoDuration } = get();
    if (future.length === 0) return;
    const next = future[0];
    const newFuture = future.slice(1);
    set({ 
      past: [...past, JSON.parse(JSON.stringify({ tracks, transcriptionText, transcriptionWords, aspectRatio, frameMode, videoDuration }))],
      future: newFuture, 
      tracks: next.tracks,
      transcriptionText: next.transcriptionText,
      transcriptionWords: next.transcriptionWords,
      aspectRatio: next.aspectRatio,
      frameMode: next.frameMode,
      videoDuration: next.videoDuration,
    });
  },

  setTracks: (tracks) => set({ tracks, past: [], future: [] }),

  applyScriptCuts: (wordIds) => {
    const state = get();
    const selected = state.transcriptionWords.filter(word => wordIds.includes(word.id));
    if (selected.length === 0) return 0;

    const rawRanges = selected
      .map(word => ({ start: Math.max(0, word.start - 0.035), end: word.end + 0.035 }))
      .sort((a, b) => a.start - b.start);
    const mergedRanges: Array<{ start: number; end: number }> = [];
    rawRanges.forEach(range => {
      const previous = mergedRanges[mergedRanges.length - 1];
      if (previous && range.start <= previous.end + 0.04) previous.end = Math.max(previous.end, range.end);
      else mergedRanges.push({ ...range });
    });

    state.saveHistory();
    let nextTracks: Track[] = JSON.parse(JSON.stringify(state.tracks));
    let appliedOffset = 0;
    let removedDuration = 0;
    const makeId = () => crypto.randomUUID();

    mergedRanges.forEach(originalRange => {
      const start = originalRange.start - appliedOffset;
      const end = originalRange.end - appliedOffset;
      const cutDuration = Math.max(0, end - start);
      if (cutDuration <= 0) return;

      nextTracks = nextTracks.map(track => {
        const segments = track.segments.flatMap(segment => {
          if (segment.end <= start) return [segment];
          if (segment.start >= end) return [{ ...segment, start: segment.start - cutDuration, end: segment.end - cutDuration }];
          if (track.type === 'text' && segment.name === 'Caption') return [];

          const pieces: TrackSegment[] = [];
          if (segment.start < start) {
            pieces.push({ ...segment, id: makeId(), end: start, duration: start - segment.start, transitionOut: undefined });
          }
          if (segment.end > end) {
            const sourceAdvance = Math.max(0, end - segment.start);
            pieces.push({
              ...segment,
              id: makeId(),
              start,
              end: segment.end - cutDuration,
              duration: segment.end - end,
              sourceStart: (segment.sourceStart ?? 0) + sourceAdvance,
            });
          }
          return pieces;
        });
        return { ...track, segments };
      });
      appliedOffset += cutDuration;
      removedDuration += cutDuration;
    });

    const selectedIds = new Set(wordIds);
    const mapTimelineTime = (time: number) => {
      let mapped = time;
      for (const range of mergedRanges) {
        if (time >= range.end) mapped -= range.end - range.start;
        else if (time > range.start) mapped -= time - range.start;
      }
      return Math.max(0, mapped);
    };
    const remainingWords = state.transcriptionWords
      .filter(word => !selectedIds.has(word.id))
      .map(word => {
        const start = mapTimelineTime(word.start);
        const end = Math.max(start + 0.04, mapTimelineTime(word.end));
        const containing = nextTracks.find(track => track.id === 'video-1')?.segments.find(segment => start >= segment.start - 0.02 && start < segment.end + 0.02);
        return { ...word, start, end, segmentId: containing?.id || word.segmentId };
      });

    const captionTrack = nextTracks.find(track => track.id === 'text-1');
    if (captionTrack) {
      const retainedNonCaptions = captionTrack.segments.filter(segment => segment.name !== 'Caption');
      const captionSegments: TrackSegment[] = [];
      for (let index = 0; index < remainingWords.length; index += 3) {
        const phrase = remainingWords.slice(index, index + 3);
        if (phrase.length === 0) continue;
        captionSegments.push({
          id: makeId(), trackId: 'text-1', type: 'text', name: 'Caption',
          start: phrase[0].start, end: phrase[phrase.length - 1].end,
          duration: phrase[phrase.length - 1].end - phrase[0].start,
          text: phrase.map(word => word.text).join(' '), src: phrase[0].sourceSrc,
          color: '#FFD700', fontSize: 48, y: 80,
        });
      }
      captionTrack.segments = [...retainedNonCaptions, ...captionSegments];
    }

    const nextDuration = nextTracks.reduce((latest, track) => Math.max(latest, ...track.segments.map(segment => segment.end), 0), 0);
    set({
      tracks: nextTracks,
      transcriptionWords: remainingWords,
      transcriptionText: remainingWords.map(word => word.text).join(' '),
      videoDuration: nextDuration,
      selectedSegmentId: null,
      currentTime: 0,
    });
    return removedDuration;
  },

  addTrack: (track) => {
    get().saveHistory();
    set((state) => ({ tracks: [...state.tracks, track] }));
  },
  
  addSegment: (trackId, segment) => {
    const track = get().tracks.find(t => t.id === trackId);
    if (track?.isLocked) return;
    
    get().saveHistory();
    set((state) => ({
      tracks: state.tracks.map(t => 
        t.id === trackId ? { ...t, segments: [...t.segments, segment] } : t
      )
    }));
  },

  splitSegment: (trackId, segmentId, splitTime) => {
    const track = get().tracks.find((item) => item.id === trackId);
    const segment = track?.segments.find((item) => item.id === segmentId);

    if (!track || track.isLocked || !segment || splitTime <= segment.start || splitTime >= segment.end) {
      return null;
    }

    const leftId = Math.random().toString(36).slice(2, 11);
    const rightId = Math.random().toString(36).slice(2, 11);
    const leftDuration = splitTime - segment.start;
    const sourceStart = segment.sourceStart ?? 0;
    // Some older imported segments do not have sourceDuration. Preserve the
    // complete source length on both halves so media metadata cannot later
    // mistake a trimmed half for a fresh, untrimmed import and expand it.
    const sourceDuration = segment.sourceDuration ?? (sourceStart + segment.duration);
    const leftSegment: TrackSegment = {
      ...segment,
      id: leftId,
      start: segment.start,
      end: splitTime,
      duration: leftDuration,
      sourceStart,
      sourceDuration,
      transitionOut: undefined,
    };
    const rightSegment: TrackSegment = {
      ...segment,
      id: rightId,
      start: splitTime,
      end: segment.end,
      duration: segment.end - splitTime,
      sourceStart: sourceStart + leftDuration,
      sourceDuration,
    };

    get().saveHistory();
    set((state) => ({
      tracks: state.tracks.map((item) => item.id === trackId ? {
        ...item,
        segments: item.segments.flatMap((existing) => existing.id === segmentId ? [leftSegment, rightSegment] : [existing]),
      } : item),
      selectedSegmentId: leftId,
    }));

    return leftId;
  },

  updateSegment: (trackId, segmentId, updates) => {
    const track = get().tracks.find(t => t.id === trackId);
    if (track?.isLocked) return;

    get().saveHistory();
    set((state) => ({
      tracks: state.tracks.map(t => 
        t.id === trackId ? {
          ...t,
          segments: t.segments.map(s => s.id === segmentId ? { ...s, ...updates } : s)
        } : t
      )
    }));
  },

  updateSegmentRealtime: (trackId, segmentId, updates) => {
    set((state) => ({
      tracks: state.tracks.map(t => 
        t.id === trackId ? {
          ...t,
          segments: t.segments.map(s => s.id === segmentId ? { ...s, ...updates } : s)
        } : t
      )
    }));
  },

  updateAllSegments: (trackId, updates, condition) => {
    const track = get().tracks.find(t => t.id === trackId);
    if (track?.isLocked) return;

    get().saveHistory();
    set((state) => ({
      tracks: state.tracks.map(t => 
        t.id === trackId ? {
          ...t,
          segments: t.segments.map(s => (!condition || condition(s)) ? { ...s, ...updates } : s)
        } : t
      )
    }));
  },

  updateAllSegmentsRealtime: (trackId, updates, condition) => {
    const track = get().tracks.find(t => t.id === trackId);
    if (track?.isLocked) return;

    set((state) => ({
      tracks: state.tracks.map(t => 
        t.id === trackId ? {
          ...t,
          segments: t.segments.map(s => (!condition || condition(s)) ? { ...s, ...updates } : s)
        } : t
      )
    }));
  },

  removeSegment: (trackId, segmentId) => {
    const track = get().tracks.find(t => t.id === trackId);
    if (track?.isLocked) return;
    const segmentToRemove = track?.segments.find(s => s.id === segmentId);
    const removeLinkedCaptions = track?.type === 'video' && !!segmentToRemove?.src;
    // Video edits use ripple delete: removing a piece of the main timeline
    // closes its gap and keeps captions, audio, and later clips in sync.
    const rippleDuration = track?.type === 'video' ? (segmentToRemove?.duration || 0) : 0;
    const rippleFrom = segmentToRemove?.end || 0;

    get().saveHistory();
    set((state) => {
      const linkedCaptionIds = new Set(
        removeLinkedCaptions
          ? state.tracks
              .filter(t => t.type === 'text')
              .flatMap(t => t.segments)
              .filter(s => s.name === 'Caption' && s.src === segmentToRemove!.src && s.start < segmentToRemove!.end && s.end > segmentToRemove!.start)
              .map(s => s.id)
          : []
      );

      return {
        tracks: state.tracks.map(t => {
          const remainingSegments = t.segments.filter(s => s.id !== segmentId && !linkedCaptionIds.has(s.id));
          if (!rippleDuration) return { ...t, segments: remainingSegments };
          return {
            ...t,
            segments: remainingSegments.map(s => s.start >= rippleFrom
              ? { ...s, start: s.start - rippleDuration, end: s.end - rippleDuration }
              : s
            )
          };
        }),
        selectedSegmentId: state.selectedSegmentId === segmentId || linkedCaptionIds.has(state.selectedSegmentId || '')
          ? null
          : state.selectedSegmentId,
        currentTime: state.currentTime >= rippleFrom ? Math.max(0, state.currentTime - rippleDuration) : state.currentTime
      };
    });
  },

  removeAllCaptions: (trackId) => {
    const track = get().tracks.find(t => t.id === trackId);
    if (track?.isLocked) return;

    get().saveHistory();
    set((state) => ({
      tracks: state.tracks.map(t => 
        t.id === trackId ? {
          ...t,
          segments: t.segments.filter(s => s.name !== 'Caption')
        } : t
      )
    }));
  },

  selectSegment: (segmentId) => {
    set({ selectedSegmentId: segmentId });
    if (segmentId) {
      const state = get();
      let foundSeg = null;
      for (const t of state.tracks) {
        const s = t.segments.find(x => x.id === segmentId);
        if (s) {
          foundSeg = s;
          break;
        }
      }
      
      // Auto-seek the playhead to the segment if it's not currently visible
      if (foundSeg) {
        const { currentTime } = state;
        if (currentTime < foundSeg.start || currentTime >= foundSeg.end) {
          set({ currentTime: foundSeg.start });
        }
      }
    }
  },

  moveSegment: (segmentId, sourceTrackId, targetTrackId, newStart, moveLinked = true) => {
    const state = get();
    const sourceTrack = state.tracks.find(t => t.id === sourceTrackId);
    const targetTrack = state.tracks.find(t => t.id === targetTrackId);
    
    if (sourceTrack?.isLocked || targetTrack?.isLocked) return;

    state.saveHistory();
    set((state) => {
      let segmentToMove: TrackSegment | undefined;
      
      // Find the segment to move
      for (const t of state.tracks) {
        if (t.id === sourceTrackId) {
          segmentToMove = t.segments.find(s => s.id === segmentId);
          break;
        }
      }

      if (!segmentToMove) return state;

      const timeDelta = newStart - segmentToMove.start;
      const srcToLink = segmentToMove.src;
      const shouldMoveLinked = moveLinked && !!srcToLink;

      const updatedSegment = {
        ...segmentToMove,
        trackId: targetTrackId,
        start: newStart,
        end: newStart + segmentToMove.duration
      };

      const newTracks = state.tracks.map(t => {
        // Remove the dragged segment from its source track
        let newSegments = t.segments;
        if (t.id === sourceTrackId) {
          newSegments = newSegments.filter(s => s.id !== segmentId);
        }

        // If moveLinked is true, shift all matching segments that aren't the dragged one
        if (shouldMoveLinked) {
          newSegments = newSegments.map(s => {
            if (s.src === srcToLink && s.id !== segmentId && Math.abs(s.start - segmentToMove!.start) < 0.01) {
              return {
                ...s,
                start: s.start + timeDelta,
                end: s.end + timeDelta
              };
            }
            return s;
          });
        }

        // Add the dragged segment to its target track
        if (t.id === targetTrackId) {
          newSegments = [...newSegments, updatedSegment];
        }

        return {
          ...t,
          segments: newSegments
        };
      });

      return { tracks: newTracks };
    });
  },

  toggleTrackVisibility: (trackId) => set((state) => ({
    tracks: state.tracks.map(t => 
      t.id === trackId ? { ...t, isHidden: !t.isHidden } : t
    )
  })),

  toggleTrackLock: (trackId) => set((state) => ({
    tracks: state.tracks.map(t => 
      t.id === trackId ? { ...t, isLocked: !t.isLocked } : t
    )
  })),
}));
