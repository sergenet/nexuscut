import { create } from 'zustand';

// Basic interfaces for our Multi-Track Timeline
export interface MediaItem {
  id: string;
  type: 'video' | 'audio' | 'image' | 'live' | 'text' | 'effect';
  uri: string;
  name: string;
  duration: number; // in seconds
  thumbnailUri?: string;
}

export interface TrackSegment {
  id: string;
  trackId: string;
  start: number; // in seconds (position on timeline)
  end: number; // in seconds (position on timeline)
  duration: number; // in seconds
  trimStart?: number; // in seconds (where the cut begins in the source file)
  type: 'video' | 'audio' | 'text' | 'effect' | 'image' | 'live';
  src?: string; // Original media URI
  text?: string;
  color?: string;
  fontSize?: number;
  fontFamily?: string;
  yPosition?: number; // percentage from top (e.g. 80 for bottom)
  xPosition?: number;
  scale?: number;
  uri?: string;
  trimEnd?: number;
  // Smart Tools State
  speed?: number; // e.g. 1.0, 1.5, 2.0
  aiEffects?: {
    removeBackground?: boolean;
    denoiseAudio?: boolean;
  };
  aiErased?: boolean;
  eraserRect?: { x: number; y: number; w: number; h: number };
  
  // Transitions
  transitionOut?: string | { type: string; duration: number };
}

export interface Track {
  id: string;
  type: 'video' | 'audio' | 'text' | 'effect';
  name: string;
  segments: TrackSegment[];
}

interface EditorState {
  // Playback state
  currentTime: number;
  isPlaying: boolean;
  videoDuration: number;
  
  // Timeline zoom
  zoomLevel: number; // Pixels per second
  // Tracks & Library
  mediaLibrary: MediaItem[];
  tracks: Track[];
  selectedSegmentId: string | null;
  
  // Dual-Monitor State
  activePreviewMode: 'source' | 'program'; // 'source' = previewing from library, 'program' = timeline output
  activePreviewMediaId: string | null; // ID of the library item being previewed
  activeVideoUri: string | null; // Currently rendering URI in the player

  // Actions
  setCurrentTime: (time: number) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setVideoDuration: (duration: number) => void;
  setZoomLevel: (zoom: number) => void;
  setActiveVideoUri: (uri: string | null) => void;
  setActivePreviewMode: (mode: 'source' | 'program', mediaId?: string | null) => void;
  
  draggedMedia: MediaItem | null;
  setDraggedMedia: (media: MediaItem | null) => void;
  timelineScrollX: number;
  setTimelineScrollX: (x: number) => void;

  addMediaToLibrary: (media: MediaItem) => void;
  hydrateMediaLibrary: (items: MediaItem[]) => void;
  removeMediaFromLibrary: (id: string) => void;
  
  // Undo/Redo State
  undoStack: Track[][];
  redoStack: Track[][];
  undo: () => void;
  redo: () => void;
  loadDemoProject: () => void;

  addTrack: (track: Track) => void;
  addSegment: (trackId: string, segment: TrackSegment) => void;
  updateSegment: (trackId: string, segmentId: string, updates: Partial<TrackSegment>) => void;
  removeSegment: (trackId: string, segmentId: string) => void;
  selectSegment: (segmentId: string | null) => void;
  moveSegment: (segmentId: string, sourceTrackId: string, targetTrackId: string, newStart: number) => void;

  // Drag-over highlight
  highlightedTrackId: string | null;
  setHighlightedTrackId: (id: string | null) => void;
}

const pushUndo = (state: EditorState) => {
  return {
    undoStack: [...state.undoStack, JSON.parse(JSON.stringify(state.tracks))].slice(-20),
    redoStack: []
  };
};

export const useEditorStore = create<EditorState>((set) => ({
  currentTime: 0,
  isPlaying: false,
  videoDuration: 0,
  zoomLevel: 10, // 10px per second by default
  timelineScrollX: 0,
  draggedMedia: null,
  highlightedTrackId: null,
  setZoomLevel: (zoom) => set({ zoomLevel: Math.max(1, zoom) }),
  setTimelineScrollX: (x) => set({ timelineScrollX: x }),
  setDraggedMedia: (media) => set({ draggedMedia: media }),
  setHighlightedTrackId: (id) => set({ highlightedTrackId: id }),

  // Start with some default tracks
  mediaLibrary: [],
  tracks: [
    { id: 'background-1', type: 'video', name: 'Background', segments: [] },
    { id: 'video-1', type: 'video', name: 'Main Video', segments: [] },
    { id: 'audio-1', type: 'audio', name: 'Audio Track', segments: [] },
    { id: 'text-1', type: 'text', name: 'Captions', segments: [] },
  ],
  
  loadDemoProject: () => set(() => {
    const demoVideoUri = "https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/360/Big_Buck_Bunny_360_10s_1MB.mp4";
    const demoMedia = {
      id: "demo-vid-1",
      type: "video" as const,
      name: "Talking Head (Demo).mp4",
      uri: demoVideoUri,
      duration: 10
    };
    
    const demoVideoSegment = {
      id: "seg-demo-vid-1",
      trackId: "video-1",
      type: "video" as const,
      src: demoVideoUri,
      uri: demoVideoUri,
      start: 0,
      end: 10,
      duration: 10,
      trimStart: 0,
      trimEnd: 10
    };
    
    const demoTextSegment = {
      id: "seg-demo-text-1",
      trackId: "text-1",
      type: "text" as const,
      text: "WOW! I just removed the background",
      start: 0,
      end: 5,
      duration: 5,
      yPosition: 50,
      fontSize: 32,
      fontFamily: "Outfit",
      color: "#ffffff"
    };

    return {
      mediaLibrary: [demoMedia],
      tracks: [
        { id: 'background-1', type: 'video', name: 'Background', segments: [] },
        { id: 'video-1', type: 'video', name: 'Main Video', segments: [demoVideoSegment] },
        { id: 'audio-1', type: 'audio', name: 'Audio Track', segments: [] },
        { id: 'text-1', type: 'text', name: 'Captions', segments: [demoTextSegment] },
      ],
      videoDuration: 10,
      currentTime: 0
    };
  }),

  undoStack: [],
  redoStack: [],
  
  undo: () => set((state) => {
    if (state.undoStack.length === 0) return {};
    const previous = state.undoStack[state.undoStack.length - 1];
    return {
      undoStack: state.undoStack.slice(0, -1),
      redoStack: [JSON.parse(JSON.stringify(state.tracks)), ...state.redoStack].slice(0, 20),
      tracks: previous,
    };
  }),

  redo: () => set((state) => {
    if (state.redoStack.length === 0) return {};
    const next = state.redoStack[0];
    return {
      redoStack: state.redoStack.slice(1),
      undoStack: [...state.undoStack, JSON.parse(JSON.stringify(state.tracks))].slice(-20),
      tracks: next,
    };
  }),

  selectedSegmentId: null,
  activePreviewMode: 'program',
  activePreviewMediaId: null,
  activeVideoUri: null,

  setCurrentTime: (time) => set({ currentTime: time }),
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  setVideoDuration: (duration) => set({ videoDuration: duration }),
  setActiveVideoUri: (uri) => set({ activeVideoUri: uri }),
  setActivePreviewMode: (mode, mediaId = null) => set({ activePreviewMode: mode, activePreviewMediaId: mediaId }),
  
  addMediaToLibrary: (media) => set((state) => ({ mediaLibrary: [...state.mediaLibrary, media] })),
  hydrateMediaLibrary: (items) => set({ mediaLibrary: items }),
  removeMediaFromLibrary: (id) => set((state) => ({ mediaLibrary: state.mediaLibrary.filter(m => m.id !== id) })),
  
  addTrack: (track) => set((state) => ({ ...pushUndo(state), tracks: [...state.tracks, track] })),
  
  addSegment: (trackId, segment) => set((state) => {
    let trackExists = false;
    const newTracks = state.tracks.map(t => {
      if (t.id === trackId) {
        trackExists = true;
        return { ...t, segments: [...t.segments, segment] };
      }
      return t;
    });
    if (!trackExists) {
      newTracks.push({
        id: trackId,
        type: trackId.includes('audio') ? 'audio' : trackId.includes('text') ? 'text' : 'video',
        name: trackId.includes('audio') ? 'Audio Track' : trackId.includes('text') ? 'Captions' : trackId === 'background-1' ? 'Background' : 'Main Video',
        segments: [segment]
      });
    }
    const allSegs = newTracks.flatMap(t => t.segments);
    const maxDur = allSegs.length > 0 ? Math.max(...allSegs.map(s => s.end)) : 0;
    return { ...pushUndo(state), tracks: newTracks, videoDuration: maxDur };
  }),

  updateSegment: (trackId, segmentId, updates) => set((state) => {
    const newTracks = state.tracks.map(t => 
      t.id === trackId ? {
        ...t,
        segments: t.segments.map(s => s.id === segmentId ? { ...s, ...updates } : s)
      } : t
    );
    const allSegs = newTracks.flatMap(t => t.segments);
    const maxDur = allSegs.length > 0 ? Math.max(...allSegs.map(s => s.end)) : 0;
    return { ...pushUndo(state), tracks: newTracks, videoDuration: maxDur };
  }),

  removeSegment: (trackId, segmentId) => set((state) => {
    const newTracks = state.tracks.map(t => 
      t.id === trackId ? {
        ...t,
        segments: t.segments.filter(s => s.id !== segmentId)
      } : t
    );
    const allSegs = newTracks.flatMap(t => t.segments);
    const maxDur = allSegs.length > 0 ? Math.max(...allSegs.map(s => s.end)) : 0;
    return { ...pushUndo(state), tracks: newTracks, videoDuration: maxDur };
  }),

  selectSegment: (segmentId) => set({ selectedSegmentId: segmentId }),

  moveSegment: (segmentId, sourceTrackId, targetTrackId, newStart) => set((state) => {
    let segmentToMove: TrackSegment | undefined;
    
    // Find and remove from source track
    const newTracks = state.tracks.map(t => {
      if (t.id === sourceTrackId) {
        segmentToMove = t.segments.find(s => s.id === segmentId);
        return {
          ...t,
          segments: t.segments.filter(s => s.id !== segmentId)
        };
      }
      return t;
    });

    if (!segmentToMove) return state; // Should not happen

    // Update segment properties
    const updatedSegment = {
      ...segmentToMove,
      trackId: targetTrackId,
      start: newStart,
      end: newStart + segmentToMove.duration
    };

    // Add to target track
    return {
      ...pushUndo(state),
      tracks: newTracks.map(t => {
        if (t.id === targetTrackId) {
          return {
            ...t,
            segments: [...t.segments, updatedSegment]
          };
        }
        return t;
      })
    };
  })
}));
