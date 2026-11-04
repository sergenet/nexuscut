import { View, Text, StyleSheet, TouchableOpacity, Alert, Animated, ScrollView, TextInput, PanResponder, useWindowDimensions } from 'react-native';
import Timeline from '../components/Timeline/Timeline';
import { User } from '@supabase/supabase-js';
import { useEditorStore, MediaItem, Track } from '../store/useEditorStore';
import { supabase } from '../lib/supabase';
import { saveMediaToDB, getAllMediaFromDB, deleteMediaFromDB } from '../lib/indexedDB';
import React, { useState, useRef, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';

interface SegmentationMask { width: number; height: number; getAsUint8Array: () => Uint8Array }
interface SegmentationResult { categoryMask?: SegmentationMask }
interface ImageSegmenterInstance { segmentForVideo: (video: HTMLVideoElement, timestamp: number, callback: (result: SegmentationResult) => void) => void }
interface MediaPipeModule {
  ImageSegmenter: { createFromOptions: (vision: unknown, options: object) => Promise<ImageSegmenterInstance> };
  FilesetResolver: { forVisionTasks: (url: string) => Promise<unknown> };
}
interface CloudProject { id: string; state_json: string; title?: string; updated_at?: string }
interface SavedEditorState { tracks?: Track[]; timelineScrollX?: number; zoomLevel?: number; videoDuration?: number }
interface CaptionWord { word: string; start: number; end: number }
interface WebSliderProps { value: number; min: number; max: number; step?: number; onChange: (value: number) => void }
interface DraggableLibraryItemProps {
  item: MediaItem; isActive: boolean; onPress: () => void;
  onDragStart: (item: MediaItem, x: number, y: number) => void;
  onDragMove: (x: number, y: number) => void; onDragEnd: (x: number, y: number) => void;
}
let globalSegmenter: ImageSegmenterInstance | null = null;
let isSegmenterInitializing = false;
const initMediaPipe = async () => {
  if (globalSegmenter || isSegmenterInitializing) return;
  isSegmenterInitializing = true;
  try {
    const module = await eval(`import("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/vision_bundle.mjs")`) as MediaPipeModule;
    const { ImageSegmenter, FilesetResolver } = module;
    const vision = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
    );
    globalSegmenter = await ImageSegmenter.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: "https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_segmenter/float16/latest/selfie_segmenter.tflite",
        delegate: "GPU"
      },
      runningMode: "VIDEO",
      outputCategoryMask: true,
      outputConfidenceMasks: false
    });
    console.log("MediaPipe SelfieSegmenter initialized successfully!");
  } catch (err) {
    console.error("Failed to initialize MediaPipe:", err);
  }
};

import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { createVideoPlayer, useVideoPlayer, VideoView } from 'expo-video';
import { useRouter } from 'expo-router';
import { v4 as uuidv4 } from 'uuid';
import { Platform } from 'react-native';
import { File, Paths } from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library/legacy';

const WebSlider = ({ value, min, max, step, onChange }: WebSliderProps) => {
  if (Platform.OS === 'web') {
    return React.createElement('input', {
      type: 'range',
      min,
      max,
      step,
      value,
      onChange: (event: React.ChangeEvent<HTMLInputElement>) => onChange(parseFloat(event.target.value)),
      style: { flex: 1, accentColor: '#38bdf8' }
    });
  }
  return <TextInput value={value?.toString()} onChangeText={(t) => onChange(parseFloat(t) || 0)} style={{ color: '#fff', borderBottomWidth: 1, borderColor: '#38bdf8', flex: 1, textAlign: 'center' }} keyboardType="numeric" />;
};

const LiveFeedBackground = ({ transform }: { transform: string }) => {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  React.useEffect(() => {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices) return;
    let stream: MediaStream | null = null;
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(s => {
        stream = s;
        if (videoRef.current) {
          videoRef.current.srcObject = s;
          videoRef.current.play().catch(() => {});
        }
      })
      .catch(() => {});
    return () => { stream?.getTracks().forEach(track => track.stop()); };
  }, []);
  return (
    <video
      ref={videoRef}
      autoPlay
      muted
      playsInline
      style={{
        position: 'absolute', top: 0, left: 0,
        width: '100%', height: '100%',
        objectFit: 'cover', zIndex: 0,
        transform,
        // Mirror webcam for natural look
        filter: 'scaleX(-1)',
      } as React.CSSProperties}
    />
  );
};

const DraggableLibraryItem = ({ item, isActive, onPress, onDragStart, onDragMove, onDragEnd }: DraggableLibraryItemProps) => {
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false, 
      onMoveShouldSetPanResponder: (evt, gestureState) => Math.abs(gestureState.dx) > 5 || Math.abs(gestureState.dy) > 5,
      onMoveShouldSetPanResponderCapture: (evt, gestureState) => Math.abs(gestureState.dx) > 5 || Math.abs(gestureState.dy) > 5,
      onPanResponderGrant: (evt, gestureState) => {
        onDragStart(item, gestureState.moveX || gestureState.x0, gestureState.moveY || gestureState.y0);
      },
      onPanResponderMove: (evt, gestureState) => {
        onDragMove(gestureState.moveX, gestureState.moveY);
      },
      onPanResponderRelease: (evt, gestureState) => {
        onDragEnd(gestureState.moveX, gestureState.moveY);
      },
      onPanResponderTerminate: () => {
        onDragEnd(0, 0); 
      }
    })
  ).current;

  // Native (iOS/Android/Web) using PanResponderFallback
  return (
    <View {...panResponder.panHandlers} style={[{ marginBottom: 12 }, Platform.OS === 'web' ? ({ touchAction: 'none' } as never) : undefined]}>
      <TouchableOpacity 
        style={[styles.libraryItem, isActive && styles.libraryItemActive]}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <View style={[styles.libraryItemThumb, { backgroundColor: '#000' }]} pointerEvents="none">
          {item.thumbnailUri ? (
            <Animated.Image source={{ uri: item.thumbnailUri }} style={[styles.thumbnail, { resizeMode: 'cover' }]} />
          ) : (
            item.type === 'video' ? (
              <Ionicons name="videocam" size={24} color="#71717a" />
            ) : item.type === 'audio' ? (
              <Ionicons name="musical-notes" size={24} color="#71717a" />
            ) : item.uri === 'LIVE_FEED' ? (
              <Ionicons name="camera" size={24} color="#10b981" />
            ) : (
              <Text style={{ color: '#fff', fontSize: 24, fontWeight: 'bold' }}>T</Text>
            )
          )}
          <View style={styles.durationBadge}>
            <Text style={styles.durationText}>00:{(item.duration).toFixed(0).padStart(2, '0')}</Text>
          </View>
        </View>
        <Text style={styles.libraryItemName} numberOfLines={1}>{item.name}</Text>
        
        {!item.id.startsWith('preset_') && !item.id.startsWith('trans_') && item.uri !== 'LIVE_FEED' && (
          <TouchableOpacity 
            style={{ position: 'absolute', top: 4, right: 4, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 12, width: 24, height: 24, alignItems: 'center', justifyContent: 'center', zIndex: 10 }}
            onPress={(e) => {
              e.stopPropagation();
              if (Platform.OS === 'web') {
                if (window.confirm("Delete this media?")) {
                  deleteMediaFromDB(item.id);
                  useEditorStore.getState().removeMediaFromLibrary(item.id);
                }
              } else {
                Alert.alert("Delete", "Delete this media?", [
                  { text: "Cancel", style: "cancel" },
                  { text: "Delete", onPress: () => {
                    deleteMediaFromDB(item.id);
                    useEditorStore.getState().removeMediaFromLibrary(item.id);
                  }, style: 'destructive'}
                ]);
              }
            }}
          >
            <Ionicons name="close" size={16} color="#fff" />
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    </View>
  );
};

const formatTime = (seconds: number) => {
  if (isNaN(seconds) || seconds < 0) return '00:00:00';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

export default function Editor() {
  const router = useRouter();
  const { width: windowWidth } = useWindowDimensions();
  const isMobile = windowWidth < 768;
  const { 
    tracks, 
    addSegment, 
    isPlaying, 
    setIsPlaying,
    currentTime,
    videoDuration,
    selectedSegmentId,
    removeSegment,
    updateSegment,
    mediaLibrary,
    addMediaToLibrary,
    activePreviewMode,
    setActivePreviewMode,
    activePreviewMediaId,
    draggedMedia,
    undo,
    redo,
    undoStack,
    redoStack
  } = useEditorStore();
  
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [showDemoTooltip, setShowDemoTooltip] = useState(false);
  const [liveLogs, setLiveLogs] = useState<string[]>([]);
  const [exportError, setExportError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showProjectsModal, setShowProjectsModal] = useState(false);
  const [cloudProjects, setCloudProjects] = useState<CloudProject[]>([]);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const exportScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
  }, []);

  const handleAuth = async () => {
    if (!authEmail || !authPassword) {
      Alert.alert("Error", "Please enter both an email and a password.");
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({ email: authEmail, password: authPassword });
    if (error) {
      const { error: signUpError } = await supabase.auth.signUp({ email: authEmail, password: authPassword });
      if (signUpError) {
        Alert.alert("Error", signUpError.message);
      } else {
        Alert.alert("Success", "Account created! Please check your email to verify your account before logging in.");
        setShowAuthModal(false);
      }
    } else {
      setShowAuthModal(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handleSaveToCloud = async () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    
    setIsSaving(true);
    try {
      const state = useEditorStore.getState();
      const stateJson = JSON.stringify({
        tracks: state.tracks,
        timelineScrollX: state.timelineScrollX,
        zoomLevel: state.zoomLevel,
        videoDuration: state.videoDuration
      });
      
      const { error } = await supabase
        .from('projects')
        .insert([{ user_id: user.id, title: 'My Awesome Edit', state_json: stateJson }])
        .select();
        
      if (error) throw error;
      
      Alert.alert("Cloud Sync", "Project mathematical state saved successfully! Media must be re-linked on new devices (Option B).");
      // refresh projects list if open
      if (showProjectsModal) fetchCloudProjects();
    } catch (err: unknown) {
      console.error("Save to cloud failed:", err);
      Alert.alert("Error", err instanceof Error ? err.message : "Failed to save project.");
    } finally {
      setIsSaving(false);
    }
  };

  const fetchCloudProjects = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });
      
    if (error) {
      Alert.alert("Error", "Failed to fetch projects.");
    } else {
      setCloudProjects(data || []);
    }
  };

  const handleOpenProjects = () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    setShowProjectsModal(true);
    fetchCloudProjects();
  };

  const handleLoadProject = (project: CloudProject) => {
    try {
      const state = JSON.parse(project.state_json) as SavedEditorState;
      useEditorStore.setState({
        tracks: state.tracks || [],
        timelineScrollX: state.timelineScrollX || 0,
        zoomLevel: state.zoomLevel || 100,
        videoDuration: state.videoDuration || 0
      });
      setShowProjectsModal(false);
      Alert.alert("Project Loaded", "Timeline restored. Note: Any missing local media files will appear blank and must be re-imported (Option B architecture).");
    } catch {
      Alert.alert("Error", "Corrupted project file.");
    }
  };

  const [showExportSettings, setShowExportSettings] = useState(false);
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16' | '1:1' | 'custom'>('16:9');
  const exportQuality = '1080p' as const;
  const [customWidth, setCustomWidth] = useState('1080');
  const [customHeight, setCustomHeight] = useState('1920');

  // Load Media from IndexedDB on Mount
  useEffect(() => {
    if (Platform.OS === 'web') {
      getAllMediaFromDB().then((dbItems) => {
        const hydratedItems = dbItems.map(item => ({
          ...item,
          uri: URL.createObjectURL(item.blob)
        }));
        useEditorStore.getState().hydrateMediaLibrary(hydratedItems);
      }).catch(err => console.error("Failed to load IndexedDB media:", err));
    }
  }, []);

  const [activeTab, setActiveTab] = useState<'media' | 'audio' | 'text' | 'ai' | 'transitions'>('media');
  const webVideoRef = useRef<HTMLVideoElement | null>(null);
  const aiCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const previewContainerRef = useRef<HTMLDivElement | null>(null);
  const [dragPos, setDragPos] = useState({ x: 0, y: 0 });
  const [isNativeDrag, setIsNativeDrag] = useState(false);
  const liveFeedStreamRef = useRef<MediaStream | null>(null);

  // ── Preview drag-to-position state ──
  const isDraggingPreview = useRef(false);
  const dragStartMouse = useRef({ x: 0, y: 0 });
  const dragStartPos = useRef({ x: 50, y: 50 });
  const [previewDragging, setPreviewDragging] = useState(false);

  const handlePreviewMouseDown = (e: React.MouseEvent) => {
    if (Platform.OS !== 'web') return;
    const seg = selectedSegment || currentSegmentForDerived;
    if (!seg || (seg.type !== 'video' && seg.type !== 'image')) return;
    e.preventDefault();
    isDraggingPreview.current = true;
    dragStartMouse.current = { x: e.clientX, y: e.clientY };
    dragStartPos.current = { x: seg.xPosition ?? 50, y: seg.yPosition ?? 50 };
    setPreviewDragging(true);
  };

  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingPreview.current) return;
      const container = previewContainerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const dx = e.clientX - dragStartMouse.current.x;
      const dy = e.clientY - dragStartMouse.current.y;
      // Convert pixel delta to percentage of container
      const pctX = (dx / rect.width) * 100;
      const pctY = (dy / rect.height) * 100;
      const newX = Math.max(0, Math.min(100, dragStartPos.current.x + pctX));
      const newY = Math.max(0, Math.min(100, dragStartPos.current.y + pctY));
      const selectedId = useEditorStore.getState().selectedSegmentId;
      const seg = useEditorStore.getState().tracks.flatMap(track => track.segments).find(segment => segment.id === selectedId);
      const segForDerived = useEditorStore.getState().tracks.find(t => t.id === 'video-1')?.segments.find(s => {
        const ct = useEditorStore.getState().currentTime;
        return ct >= s.start && ct < s.end;
      });
      const target = seg || segForDerived;
      if (target) {
        useEditorStore.getState().updateSegment(target.trackId, target.id, { 
          xPosition: parseFloat(newX.toFixed(1)), 
          yPosition: parseFloat(newY.toFixed(1)) 
        });
      }
    };
    const handleMouseUp = () => {
      isDraggingPreview.current = false;
      setPreviewDragging(false);
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const videoTrackForDerived = tracks.find(t => t.id === 'video-1');
  const currentSegmentForDerived = videoTrackForDerived?.segments.find(s => currentTime >= s.start && currentTime < s.end);
  const derivedVideoUri = currentSegmentForDerived?.src || null;

  const activeMedia = activePreviewMode === 'source' && activePreviewMediaId
    ? mediaLibrary.find(m => m.id === activePreviewMediaId)?.uri
    : derivedVideoUri;

  const player = useVideoPlayer(activeMedia || 'https://www.w3schools.com/html/mov_bbb.mp4');

  // Sync Video with Timeline (Native and Web)
  useEffect(() => {
    if (Platform.OS === 'web') {
      if (webVideoRef.current) {
        if (!isPlaying) {
          webVideoRef.current.pause();
        }
      }
    } else if (player) {
      if (isPlaying) player.play();
      else player.pause();
    }
  }, [isPlaying, player, activeMedia]);

  // Playhead Animation Loop (Timeline Engine)
  const lastDropTimeRef = useRef(0);
  
  useEffect(() => {
    if (Platform.OS === 'web') {
      document.body.style.overflow = 'hidden';
      document.body.style.overscrollBehavior = 'none'; // Prevents swipe-to-go-back and pull-to-refresh
      document.body.style.touchAction = 'none'; // Prevents default browser panning
      initMediaPipe();
    }
  }, []); 

  useEffect(() => {
    let animationFrameId: number;
    let lastTime = Date.now();

    const loop = () => {
      const state = useEditorStore.getState();
      const now = Date.now();
      const dt = (now - lastTime) / 1000;
      lastTime = now;

      const currentVideoTrack = state.tracks.find(t => t.id === 'video-1');
      const currentSeg = currentVideoTrack?.segments.find(s => state.currentTime >= s.start && state.currentTime < s.end);

      // We remove the readyState checks to prevent the timeline from ever freezing if a video is buffering or missing.
      // The timeline acts as the master clock.
      
      // AI Background Removal Logic
      if (Platform.OS === 'web' && webVideoRef.current && aiCanvasRef.current) {
        const v = webVideoRef.current;
        const cvs = aiCanvasRef.current;
        const isAiEnabled = currentSeg?.aiEffects?.removeBackground;
        
        if (isAiEnabled && globalSegmenter && v.readyState >= 2) {
           v.style.opacity = '0.01';
           cvs.style.display = 'block';
           
           if (v.dataset.lastProcessedTime !== String(v.currentTime)) {
              v.dataset.lastProcessedTime = String(v.currentTime);
              try {
                globalSegmenter.segmentForVideo(v, performance.now(), (result: SegmentationResult) => {
                  const ctx = cvs.getContext('2d', { willReadFrequently: true });
                  if (ctx && result.categoryMask) {
                    const mWidth = result.categoryMask.width;
                    const mHeight = result.categoryMask.height;
                      cvs.width = mWidth;
                      cvs.height = mHeight;
                      
                      // 1. Draw raw video frame first
                      ctx.drawImage(v, 0, 0, mWidth, mHeight);
                      
                      // 2. Extract image data and category mask
                      const mask = result.categoryMask.getAsUint8Array();
                      let imgData;
                      try {
                        imgData = ctx.getImageData(0, 0, mWidth, mHeight);
                      } catch {
                        return; // Handle tainted canvas
                      }
                      
                      // 3. Manually apply alpha mask
                      for (let i = 0; i < mask.length; i++) {
                         // In this model, 0 is the person, >0 is background. 
                         // So we make the background (mask[i] !== 0) transparent!
                         if (mask[i] !== 0) {
                            imgData.data[i * 4 + 3] = 0;
                         }
                      }
                      ctx.putImageData(imgData, 0, 0);
                  }
                });
              } catch {}
           }
        } else {
           v.style.opacity = '1';
           cvs.style.display = 'none';
        }
      }

      if (state.isPlaying) {
        let newTime = state.currentTime + dt;
        
        // Clamp to segment boundaries to ensure transition opacity hits exactly 1.0 on swap
        if (currentVideoTrack) {
          for (const seg of currentVideoTrack.segments) {
            if (state.currentTime < seg.end && newTime >= seg.end) {
              newTime = seg.end;
              break;
            }
          }
        }
        
        if (state.videoDuration > 0 && newTime >= state.videoDuration) {
          state.setCurrentTime(0);
          state.setIsPlaying(false);
        } else {
          state.setCurrentTime(newTime);
        }
      }
      
      animationFrameId = requestAnimationFrame(loop);
    };
    
    animationFrameId = requestAnimationFrame(loop);
    
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  // Dynamic Video Swapping Engine
  useEffect(() => {
    const videoTrack = tracks.find(t => t.id === 'video-1');
    const currentSegment = videoTrack?.segments.find(s => currentTime >= s.start && currentTime < s.end);
    
    if (currentSegment && currentSegment.src) {
      // Sync internal hardware time if drifting or if we just swapped
      if (Platform.OS === 'web' && webVideoRef.current) {
        const localTime = (currentTime - currentSegment.start) + (currentSegment.trimStart || 0);
        if (Math.abs(webVideoRef.current.currentTime - localTime) > 0.1) {
          webVideoRef.current.currentTime = localTime;
        }

        if (isPlaying && webVideoRef.current.paused) {
          const playPromise = webVideoRef.current.play();
          if (playPromise !== undefined) {
            playPromise.catch(() => {});
          }
        }
      }
    } else {
      // We are over a blank spot in the timeline
      if (Platform.OS === 'web' && webVideoRef.current && !webVideoRef.current.paused) {
        webVideoRef.current.pause();
      }
    }
  }, [currentTime, tracks, isPlaying]);

  // Global Web Drop Listener
  useEffect(() => {
    if (Platform.OS !== 'web') return;

    // Helper: detect which track row was dropped on by Y coordinate
    const getDropTrackId = (clientY: number): string | null => {
      const screenH = window.innerHeight;
      const timelineTop = screenH * 0.6; // timeline lives in bottom ~40%
      const toolbarH = 48;
      const rulerH = 28;
      const trackRowH = 76;
      const relY = clientY - timelineTop - toolbarH - rulerH;
      if (relY < 0) return null;
      const trackIndex = Math.floor(relY / trackRowH);
      const allTracks = useEditorStore.getState().tracks;
      return allTracks[trackIndex]?.id || null;
    };

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy';
      const trackId = getDropTrackId(e.clientY);
      useEditorStore.getState().setHighlightedTrackId(trackId);
    };
    const handleDragLeave = () => {
      useEditorStore.getState().setHighlightedTrackId(null);
    };


    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      
      const now = Date.now();
      if (now - lastDropTimeRef.current < 200) return; // Prevent duplicate drops
      lastDropTimeRef.current = now;
      
      let currentDraggedMedia = useEditorStore.getState().draggedMedia;
      let droppedId = e.dataTransfer?.getData('text/plain');
      
      // Fallback: Use dataTransfer if Zustand state was cleared
      if (droppedId === 'Crossfade' || droppedId === 'trans_crossfade') droppedId = 'trans_crossfade';
      if (droppedId === 'Dip to Black' || droppedId === 'trans_black') droppedId = 'trans_black';
      if (droppedId === 'Wipe' || droppedId === 'trans_wipe') droppedId = 'trans_wipe';
      
      if (!currentDraggedMedia && droppedId) {
        if (droppedId.startsWith('trans_')) {
           const name = droppedId === 'trans_crossfade' ? 'Crossfade' : droppedId === 'trans_black' ? 'Dip to Black' : 'Wipe';
           currentDraggedMedia = { id: droppedId, type: 'effect', uri: '', name, duration: 1 };
        } else if (droppedId.startsWith('preset_')) {
           const name = droppedId === 'preset_headline' ? 'Headline' : droppedId === 'preset_subtitle' ? 'Subtitle' : 'Body Text';
           currentDraggedMedia = { id: droppedId, type: 'text', uri: '', name, duration: 5 };
        }
      }
      
      if (!currentDraggedMedia) return;
      
      // The timeline is full-width at the bottom. The track headers are 80px wide.
      const timelineX = e.clientX - 80;
      const currentScroll = useEditorStore.getState().timelineScrollX;
      const currentZoom = useEditorStore.getState().zoomLevel;
      let dropTime = Math.max(0, (timelineX + currentScroll) / currentZoom);
      if (currentDraggedMedia.type === 'video' || currentDraggedMedia.type === 'audio') {
        const track = useEditorStore.getState().tracks.find(t => t.id === `${currentDraggedMedia.type}-1`);
        if (track && track.segments.length === 0) {
          dropTime = 0; // Snap to 0 if it's the first clip
        }
      }

      // Detect which track row was dropped on
      const droppedOnTrackId = getDropTrackId(e.clientY);
      useEditorStore.getState().setHighlightedTrackId(null);

        if (currentDraggedMedia.type === 'effect' && currentDraggedMedia.id.startsWith('trans_')) {

          // Apply to the closest segment automatically to ensure it never misses
          const videoTrack = useEditorStore.getState().tracks.find(t => t.id === 'video-1');
          if (videoTrack && videoTrack.segments.length > 0) {
            let closestSeg = videoTrack.segments[0];
            let minDiff = Math.abs(closestSeg.end - dropTime);
            
            videoTrack.segments.forEach(seg => {
              const diff = Math.abs(seg.end - dropTime);
              if (diff < minDiff) {
                closestSeg = seg;
                minDiff = diff;
              }
            });
            
            const transType = currentDraggedMedia.name === 'Crossfade' ? 'crossfade' : currentDraggedMedia.name === 'Dip to Black' ? 'black' : 'wipe';
            useEditorStore.getState().updateSegment('video-1', closestSeg.id, { transitionOut: transType });
            Alert.alert("Transition Applied!", `Added ${currentDraggedMedia.name} to the clip.`);
          } else {
            Alert.alert("No Videos", "You must have video clips on the timeline to add a transition!");
          }
        } else {
          // Standard Media/Text Drop — route image/live/video to background-1 when dropped on that row
          const isBackgroundDrop = droppedOnTrackId === 'background-1' || currentDraggedMedia.type === 'image' || currentDraggedMedia.type === 'live';
          let trackId: string;
          if (isBackgroundDrop) {
            trackId = 'background-1';
          } else {
            trackId = currentDraggedMedia.type === 'video' ? 'video-1'
              : currentDraggedMedia.type === 'audio' ? 'audio-1'
              : currentDraggedMedia.type === 'text' ? 'text-1'
              : 'video-1';
          }
          
          // SNAP LOGIC
          const track = useEditorStore.getState().tracks.find(t => t.id === trackId);
          if (track) {
            if (track.segments.length === 0) {
              dropTime = 0; // Snap to beginning if first clip
            } else {
              const sortedSegs = [...track.segments].sort((a, b) => a.end - b.end);
              const lastSegment = sortedSegs[sortedSegs.length - 1];
              
              if (trackId === 'video-1' || trackId === 'audio-1' || trackId === 'background-1') {
                // ALWAYS snap to the end for Video/Audio/Background tracks (magnetic timeline)
                dropTime = lastSegment.end;
              } else {
                // Snap to the end of the previous clip if they drop it close (within 10 seconds)
                if (Math.abs(lastSegment.end - dropTime) < 10) {
                  dropTime = lastSegment.end;
                }
              }
            }
          }
          
          // Update global duration if dropped past the end
          const newId = uuidv4();
          addSegment(trackId, {
            id: newId,
            trackId: trackId,
            start: dropTime,
            end: dropTime + currentDraggedMedia.duration,
            duration: currentDraggedMedia.duration,
            type: currentDraggedMedia.type,
            src: currentDraggedMedia.uri,
            text: currentDraggedMedia.type === 'text' ? currentDraggedMedia.name : undefined,
            fontSize: currentDraggedMedia.type === 'text' ? (currentDraggedMedia.name === 'Headline' ? 48 : currentDraggedMedia.name === 'Subtitle' ? 32 : 24) : undefined,
            color: '#ffffff',
            yPosition: currentDraggedMedia.type === 'text' ? (currentDraggedMedia.name === 'Subtitle' ? 80 : 50) : undefined,
          });
          useEditorStore.getState().selectSegment(newId);
        }
        
        useEditorStore.getState().setActivePreviewMode('program');
        useEditorStore.getState().setDraggedMedia(null);
    };

    window.addEventListener('dragenter', handleDragOver, { capture: true });
    window.addEventListener('dragover', handleDragOver, { capture: true });
    window.addEventListener('dragleave', handleDragLeave, { capture: true });
    window.addEventListener('drop', handleDrop, { capture: true });
    
    return () => {
      window.removeEventListener('dragenter', handleDragOver, { capture: true });
      window.removeEventListener('dragover', handleDragOver, { capture: true });
      window.removeEventListener('dragleave', handleDragLeave, { capture: true });
      window.removeEventListener('drop', handleDrop, { capture: true });
    };
  }, [addSegment]);

  const generateWebVideoThumbnail = (fileUrl: string): Promise<string> => {
    return new Promise((resolve) => {
      if (typeof document === 'undefined') return resolve('');
      
      const timeout = setTimeout(() => resolve(''), 1500);

      const video = document.createElement('video');
      video.src = fileUrl;
      video.crossOrigin = 'anonymous';
      video.currentTime = 1; // seek to 1 second
      video.muted = true;
      video.playsInline = true;
      video.load();

      video.onloadeddata = () => {
        clearTimeout(timeout);
        const canvas = document.createElement('canvas');
        canvas.width = 160;
        canvas.height = 120;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL('image/jpeg', 0.7));
        } else {
          resolve('');
        }
      };
      video.onerror = () => {
        clearTimeout(timeout);
        resolve('');
      }
    });
  };

  const pickMedia = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      quality: 1,
      allowsMultipleSelection: true,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      for (let i = 0; i < result.assets.length; i++) {
        const asset = result.assets[i];
        const videoUri = asset.uri;
        const rawDuration = Number(asset.duration);
        let duration = 5; 
        if (!isNaN(rawDuration) && rawDuration > 0) {
          duration = rawDuration > 1000 ? rawDuration / 1000 : rawDuration;
        }

        let thumbnailUri = undefined;
        if (Platform.OS === 'web' && videoUri.startsWith('blob:')) {
          thumbnailUri = await generateWebVideoThumbnail(videoUri);
        }
        
        const newItem: MediaItem = {
          id: Math.random().toString(36).substring(7),
          name: asset.fileName || `Item ${i + 1}`,
          type: asset.type === 'image' ? 'image' : 'video',
          uri: videoUri,
          duration: duration,
          thumbnailUri: thumbnailUri
        };
        
        if (Platform.OS === 'web') {
          // Fetch the blob and save to IndexedDB
          try {
            const response = await fetch(videoUri);
            const blob = await response.blob();
            
            // Re-create object URL for current session
            newItem.uri = URL.createObjectURL(blob);
            
            // Save to DB
            await saveMediaToDB({
              id: newItem.id,
              type: newItem.type === 'image' ? 'image' : 'video',
              name: newItem.name,
              duration: newItem.duration,
              blob: blob,
              thumbnailUri: newItem.thumbnailUri,
              timestamp: Date.now()
            });
          } catch (err) {
            console.error("Failed to save media to IndexedDB", err);
          }
        }
        
        addMediaToLibrary(newItem);
        
        // Auto-preview the newly added media (CapCut Source Monitor behavior)
        setActivePreviewMode('source', newItem.id);
      }
    }
  };

  const pickAudio = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: 'audio/*',
      copyToCacheDirectory: true,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      const audioUri = asset.uri;
      const duration = await new Promise<number>((resolve, reject) => {
        const audioPlayer = createVideoPlayer(audioUri);
        const timer = setTimeout(() => {
          subscription.remove();
          audioPlayer.release();
          reject(new Error('The audio duration could not be read.'));
        }, 10000);
        const subscription = audioPlayer.addListener('statusChange', ({ status, error }) => {
          if (status === 'readyToPlay' && audioPlayer.duration > 0) {
            clearTimeout(timer);
            subscription.remove();
            const detectedDuration = audioPlayer.duration;
            audioPlayer.release();
            resolve(detectedDuration);
          } else if (status === 'error') {
            clearTimeout(timer);
            subscription.remove();
            audioPlayer.release();
            reject(new Error(error?.message || 'The audio file could not be opened.'));
          }
        });
      });
      
      const newMedia = {
        id: `media_${Date.now()}`,
        type: 'audio' as const,
        uri: audioUri,
        name: asset.name || 'Imported Audio',
        duration,
      };
      
      addMediaToLibrary(newMedia);
    }
  };

  const handleSplitSegment = () => {
    if (!selectedSegmentId) return;
    const allSegments = tracks.flatMap(t => t.segments);
    const seg = allSegments.find(s => s.id === selectedSegmentId);
    if (!seg) return;
    
    // Split ONLY if playhead is strictly inside the segment
    if (currentTime > seg.start && currentTime < seg.end) {
      const splitPoint = currentTime;
      const leftDuration = splitPoint - seg.start;
      const rightDuration = seg.end - splitPoint;
      
      // Update original (left) segment
      updateSegment(seg.trackId, seg.id, {
        duration: leftDuration,
        end: splitPoint
      });
      
      // Create new segment for the right half
      addSegment(seg.trackId, {
        ...seg,
        id: uuidv4(),
        start: splitPoint,
        end: splitPoint + rightDuration,
        duration: rightDuration,
        trimStart: (seg.trimStart || 0) + leftDuration
      });
    } else {
      Alert.alert("Move Playhead", "Move the playhead over the selected clip to split it.");
    }
  };

  const handleDeleteSegment = () => {
    if (selectedSegmentId) {
      const trackId = tracks.find(t => t.segments.some(s => s.id === selectedSegmentId))?.id;
      if (trackId) {
        removeSegment(trackId, selectedSegmentId);
      }
    }
  };

  const handleSaveLocal = () => {
    const store = useEditorStore.getState();
    const projectData = {
      tracks: store.tracks,
      mediaLibrary: store.mediaLibrary,
      videoDuration: store.videoDuration
    };
    const jsonStr = JSON.stringify(projectData);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `NexusCut_Project_${Date.now()}.ncp`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleLoadLocal = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.ncp,.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (e2) => {
        try {
          const jsonStr = e2.target?.result as string;
          const parsed = JSON.parse(jsonStr);
          if (parsed.tracks) {
            const currentStoreMedia = useEditorStore.getState().mediaLibrary;
            
            let finalTracksStr = JSON.stringify(parsed.tracks);
            let finalMediaStr = JSON.stringify(parsed.mediaLibrary || []);
            const unresolvedNames: string[] = [];

            if (parsed.mediaLibrary) {
               for (const pm of parsed.mediaLibrary) {
                  if (pm.uri && pm.uri.startsWith('blob:')) {
                     const dbMedia = currentStoreMedia.find(m => m.id === pm.id);
                     if (dbMedia && dbMedia.uri && dbMedia.uri.startsWith('blob:')) {
                        // Auto-relink from IndexedDB
                        finalTracksStr = finalTracksStr.split(pm.uri).join(dbMedia.uri);
                        finalMediaStr = finalMediaStr.split(pm.uri).join(dbMedia.uri);
                     } else {
                        unresolvedNames.push(pm.name || 'video file');
                     }
                  }
               }
            }
            
            useEditorStore.setState({
               tracks: JSON.parse(finalTracksStr),
               mediaLibrary: JSON.parse(finalMediaStr),
               videoDuration: parsed.videoDuration || 0,
               currentTime: 0,
               isPlaying: false
            });

            if (unresolvedNames.length > 0) {
               window.alert(`Project loaded!\n\nNote: The following local files are missing: ${unresolvedNames.join(', ')}.\n\nPlease click the 'Relink' button in the top bar to locate and re-select them.`);
            } else {
               window.alert('Project loaded successfully!');
            }
          }
        } catch {
          window.alert('Failed to parse project file');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const handleExportClick = () => {
    setShowExportSettings(true);
  };

  const handleRenderVideo = async () => {
    setShowExportSettings(false);
    setIsExporting(true);
    setExportError(null);
    setExportProgress(0);
    
    try {
      {
        const apiBase = Platform.OS === 'web' ? '' : (process.env.EXPO_PUBLIC_API_BASE_URL || 'https://nexuscut.io').replace(/\/$/, '');
        const videoTrack = tracks.find(track => track.id === 'video-1');
        const videoSegments = videoTrack?.segments.filter(segment => segment.src && segment.type === 'video') || [];
        if (videoSegments.length === 0) throw new Error('Add at least one video clip before exporting.');

        const formData = new FormData();
        const sourceIndexes = new Map<string, number>();
        for (const segment of videoSegments) {
          if (!segment.src || sourceIndexes.has(segment.src)) continue;
          const index = sourceIndexes.size;
          sourceIndexes.set(segment.src, index);
          if (Platform.OS === 'web') {
            const sourceResponse = await fetch(segment.src);
            formData.append(`videoFile_${index}`, await sourceResponse.blob(), `video-${index}.mp4`);
          } else {
            formData.append(`videoFile_${index}`, {
              uri: segment.src,
              name: `video-${index}.mp4`,
              type: 'video/mp4',
            } as unknown as Blob);
          }
        }

        formData.append('activeSegments', JSON.stringify(videoSegments.map(segment => ({
          start: segment.start,
          end: segment.end,
          sourceStart: segment.trimStart || 0,
          transitionOut: segment.transitionOut,
          volume: 1,
          fileIndex: segment.src ? sourceIndexes.get(segment.src) : undefined,
        }))));

        const captions = tracks.filter(track => track.type === 'text').flatMap(track => track.segments.map(segment => ({
          text: segment.text || '',
          start: segment.start,
          end: segment.end,
          x: segment.xPosition,
          y: segment.yPosition,
          fontSize: segment.fontSize,
          fontFamily: segment.fontFamily,
          color: segment.color,
          isTitle: true,
        })));
        formData.append('captions', JSON.stringify(captions));
        formData.append('audioFx', '[]');
        formData.append('brollSegments', '[]');
        const outputWidth = aspectRatio === 'custom' ? Number(customWidth) : aspectRatio === '9:16' ? 1080 : aspectRatio === '1:1' ? 1080 : 1920;
        const outputHeight = aspectRatio === 'custom' ? Number(customHeight) : aspectRatio === '9:16' ? 1920 : aspectRatio === '1:1' ? 1080 : 1080;
        if (!Number.isFinite(outputWidth) || !Number.isFinite(outputHeight) || outputWidth < 16 || outputHeight < 16) {
          throw new Error('Enter valid export dimensions of at least 16 × 16 pixels.');
        }
        formData.append('vw', String(Math.round(outputWidth)));
        formData.append('vh', String(Math.round(outputHeight)));
        formData.append('exportQuality', 'high');
        formData.append('framingMode', 'fill');

        setLiveLogs(['Uploading media to the NexusCut renderer…']);
        const submission = await fetch(`${apiBase}/api/export`, { method: 'POST', body: formData });
        const submissionData: { jobId?: string; error?: string } = await submission.json();
        if (!submission.ok || !submissionData.jobId) throw new Error(submissionData.error || 'The export could not be queued.');

        for (let attempt = 0; attempt < 180; attempt += 1) {
          await new Promise(resolve => setTimeout(resolve, 2000));
          const statusResponse = await fetch(`${apiBase}/api/export/status?id=${encodeURIComponent(submissionData.jobId)}`);
          const status: { status?: string; progress?: number; stage?: string; error?: string } = await statusResponse.json();
          if (!statusResponse.ok) throw new Error(status.error || 'The export status could not be read.');
          setExportProgress(status.progress || 0);
          setLiveLogs([status.stage || status.status || 'Rendering…']);
          if (status.status === 'error') throw new Error(status.error || 'The export failed.');
          if (status.status === 'completed') {
            const downloadUrl = `${apiBase}/api/export/download?id=${encodeURIComponent(submissionData.jobId)}`;
            if (Platform.OS === 'web') {
              const downloadResponse = await fetch(downloadUrl);
              if (!downloadResponse.ok) throw new Error('The rendered video could not be downloaded.');
              const objectUrl = URL.createObjectURL(await downloadResponse.blob());
              const anchor = document.createElement('a');
              anchor.href = objectUrl;
              anchor.download = `NexusCut_Export_${Date.now()}.mp4`;
              anchor.click();
              URL.revokeObjectURL(objectUrl);
              setIsExporting(false);
              setExportProgress(100);
              Alert.alert('Export Complete', 'The rendered video was downloaded.');
              return;
            }
            const permission = await MediaLibrary.requestPermissionsAsync();
            if (!permission.granted) throw new Error('Photo-library permission is required to save the exported video.');
            const destination = new File(Paths.cache, `NexusCut_Export_${Date.now()}.mp4`);
            const downloaded = await File.downloadFileAsync(downloadUrl, destination, { idempotent: true });
            await MediaLibrary.createAssetAsync(downloaded.uri);
            setIsExporting(false);
            setExportProgress(100);
            Alert.alert('Export Complete', 'The rendered video was saved to your media library.');
            return;
          }
        }
        throw new Error('The export did not finish within six minutes.');
      }

    } catch (e: unknown) {
      console.error("FFMPEG EXPORT ERROR:", e);
      const message = e instanceof Error ? e.message : String(e);
      setLiveLogs(prev => [...prev, "ERROR: " + message]);
      setExportError(message);
      // Do not set isExporting to false, so the user can read the logs!
    }
  };

  const handleRemoveBackground = async (segment: import('../store/useEditorStore').TrackSegment) => {
    if (!segment.src) {
      Alert.alert("Error", "Can only process local media files.");
      return;
    }
    try {
      const response = await fetch(segment.src);
      const blob = await response.blob();
      const formData = new FormData();
      const isImage = segment.type === 'image';
      formData.append(isImage ? 'image' : 'video', blob, isImage ? 'image.jpg' : 'video.mp4');
      const baseUrl = Platform.OS === 'web' ? '' : (process.env.EXPO_PUBLIC_API_BASE_URL || 'https://nexuscut.io').replace(/\/$/, '');
      const apiUrl = `${baseUrl}${isImage ? '/api/smart-tools/remove-bg-image' : '/api/smart-tools/remove-bg'}`;

      const apiResponse = await fetch(apiUrl, {
        method: 'POST',
        body: formData
      });
      
      if (!apiResponse.ok) {
        throw new Error('API failed with status ' + apiResponse.status);
      }
      
      let resultUrl: string;
      if (Platform.OS === 'web') {
        resultUrl = URL.createObjectURL(await apiResponse.blob());
      } else {
        const resultFile = new File(Paths.cache, `nexuscut-background-${Date.now()}.${isImage ? 'png' : 'mp4'}`);
        resultFile.create({ overwrite: true });
        resultFile.write(new Uint8Array(await apiResponse.arrayBuffer()));
        resultUrl = resultFile.uri;
      }
      
      updateSegment(segment.trackId, segment.id, { 
        src: resultUrl,
        aiEffects: { ...segment.aiEffects, removeBackground: true }
      });
      
      Alert.alert("Success", "Background removed successfully!");
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to remove background. Ensure backend is running.");
    }
  };

  // Get active text segments for Live Preview
  const allSegments = tracks.flatMap(t => t.segments);
  const selectedSegment = allSegments.find(s => s.id === selectedSegmentId);

  const handleAutoCaptions = async () => {
    const mediaSegments = allSegments.filter(s => s.type === 'video' || s.type === 'audio');
    if (mediaSegments.length === 0) {
      Alert.alert("No Media", "Please add a video or audio clip to the timeline first.");
      return;
    }
    
    // Find longest media segment
    const sourceMedia = [...mediaSegments].sort((a, b) => b.duration - a.duration)[0];
    
    Alert.alert(
      "Auto Captions",
      "Transcribing audio with Whisper AI...",
      [
        {
          text: "Processing...",
          onPress: () => {}
        }
      ]
    );

    try {
      if (!sourceMedia.src) throw new Error('The selected media has no readable source.');
      const response = await fetch(sourceMedia.src);
      const blob = await response.blob();
      
      const formData = new FormData();
      formData.append('audio', blob, 'audio.webm');
      
      // Use the actual VPS backend origin when running on the web, or fallback to relative
      const apiUrl = typeof window !== 'undefined' && window.location.origin 
        ? `${window.location.origin}/api/transcribe`
        : '/api/transcribe';

      const apiResponse = await fetch(apiUrl, {
        method: 'POST',
        body: formData
      });
      
      if (!apiResponse.ok) {
        throw new Error('API failed with status ' + apiResponse.status);
      }
      
      const data = await apiResponse.json() as { words?: CaptionWord[] };
      const words = data.words || [];
      
      words.forEach((w: CaptionWord) => {
        addSegment('text-1', {
          id: uuidv4(),
          trackId: 'text-1',
          start: sourceMedia.start + w.start,
          end: sourceMedia.start + w.end,
          duration: w.end - w.start,
          type: 'text',
          text: w.word,
          fontSize: 32,
          color: '#ffffff',
          yPosition: 80,
        });
      });
      
      Alert.alert("Success", "Captions generated successfully!");
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to generate captions. Ensure backend is running.");
    }
  };

  // Handle Drag actions
  const handleDragStart = (item: MediaItem, x: number, y: number) => {
    useEditorStore.getState().setDraggedMedia(item);
    if (x === -1 && y === -1) {
      setIsNativeDrag(true);
      setDragPos({ x: -1000, y: -1000 }); // Hide it off-screen just in case
    } else {
      setIsNativeDrag(false);
      setDragPos({ x, y });
    }
  };
  const handleDragMove = (x: number, y: number) => {
    if (!isNativeDrag) setDragPos({ x, y });
  };

  const handleDragEnd = (x: number, y: number) => {
    const currentDraggedMedia = useEditorStore.getState().draggedMedia;
    
    useEditorStore.getState().setDraggedMedia(null);
    setIsNativeDrag(false);
    
    if (!currentDraggedMedia) return;
    
    const now = Date.now();
    if (now - lastDropTimeRef.current < 200) return;
    lastDropTimeRef.current = now;
    
    // Timeline is 40% of screen, min 300px. We use 45% to be generous.
    const screenHeight = typeof window !== 'undefined' ? window.innerHeight : 800;
    // If dropped in the lower half of the screen, assume it's the timeline
    const timelineY = screenHeight * 0.4;
    
    // If dropped in the timeline area
    if (y > timelineY) {
      const timelineX = x - 80;
      const currentScroll = useEditorStore.getState().timelineScrollX;
      const currentZoom = useEditorStore.getState().zoomLevel;
      let dropTime = Math.max(0, (timelineX + currentScroll) / currentZoom);
      if (currentDraggedMedia.type === 'video' || currentDraggedMedia.type === 'audio') {
        const track = useEditorStore.getState().tracks.find(t => t.id === `${currentDraggedMedia.type}-1`);
        if (track && track.segments.length === 0) {
          dropTime = 0; // Snap to 0 if it's the first clip
        }
      }

      if (currentDraggedMedia.type === 'effect' && currentDraggedMedia.id.startsWith('trans_')) {
        const videoTrack = useEditorStore.getState().tracks.find(t => t.id === 'video-1');
        if (videoTrack && videoTrack.segments.length > 0) {
          let closestSeg = videoTrack.segments[0];
          let minDiff = Math.abs(closestSeg.end - dropTime);
          
          videoTrack.segments.forEach(seg => {
            const diff = Math.abs(seg.end - dropTime);
            if (diff < minDiff) {
              minDiff = diff;
              closestSeg = seg;
            }
          });

          // Apply transition to the end of the closest segment
          useEditorStore.getState().updateSegment('video-1', closestSeg.id, {
            transitionOut: {
              type: currentDraggedMedia.id === 'trans_crossfade' ? 'crossfade' : currentDraggedMedia.id === 'trans_dipblack' ? 'fade' : 'zoom',
              duration: 1
            }
          });
        } else {
          Alert.alert("No Videos", "You must have video clips on the timeline to add a transition!");
        }
      } else {
        if (currentDraggedMedia.type === 'effect') {
          Alert.alert("Drag to Timeline", "Please drag transitions directly onto a video clip in the timeline.");
          useEditorStore.getState().setDraggedMedia(null);
          setIsNativeDrag(false);
          return;
        }
        const trackId = currentDraggedMedia.type === 'image' ? 'image-1' : currentDraggedMedia.type === 'video' ? 'video-1' : currentDraggedMedia.type === 'audio' ? 'audio-1' : 'text-1';
        
        // SNAP LOGIC
        const destTrack = useEditorStore.getState().tracks.find(t => t.id === trackId);
        if (destTrack && destTrack.segments.length > 0) {
          const sortedSegs = [...destTrack.segments].sort((a, b) => a.end - b.end);
          const lastSegment = sortedSegs[sortedSegs.length - 1];
          if (trackId === 'video-1' || trackId === 'audio-1') {
            dropTime = lastSegment.end;
          } else if (Math.abs(lastSegment.end - dropTime) < 10) {
            dropTime = lastSegment.end;
          }
        }

        // Update global duration if dropped past the end
        const newId = uuidv4();
        addSegment(trackId, {
          id: newId,
          trackId: trackId,
          start: dropTime,
          end: dropTime + currentDraggedMedia.duration,
          duration: currentDraggedMedia.duration,
          type: currentDraggedMedia.type,
          src: currentDraggedMedia.uri,
          text: currentDraggedMedia.type === 'text' ? currentDraggedMedia.name : undefined,
          fontSize: currentDraggedMedia.type === 'text' ? (currentDraggedMedia.name === 'Headline' ? 48 : currentDraggedMedia.name === 'Subtitle' ? 32 : 24) : undefined,
          color: '#ffffff',
          yPosition: currentDraggedMedia.type === 'text' ? (currentDraggedMedia.name === 'Subtitle' ? 80 : 50) : undefined,
        });
        useEditorStore.getState().selectSegment(newId);
      }
      setActivePreviewMode('program');
      }
    };
    
    // Calculate player transition overlay if any
    let transitionOpacity = 0;
    let transitionColor = '#000'; // dip to black
    const videoTrack = tracks.find(t => t.id === 'video-1');
    if (videoTrack && activePreviewMode !== 'source') {
      for (let i = 0; i < videoTrack.segments.length; i++) {
        const seg = videoTrack.segments[i];
        if (seg.transitionOut) {
          const transition = seg.transitionOut;
          const type = typeof transition === 'object' ? transition.type : transition;
          const duration = typeof transition === 'object' ? (transition.duration || 1) : 1;
          const halfT = duration / 2;
          const transStart = seg.end - halfT;
          const transEnd = seg.end + halfT;
          
          if (currentTime >= transStart && currentTime <= transEnd) {
            const distFromPeak = Math.abs(currentTime - seg.end); 
            transitionOpacity = 1 - (distFromPeak / halfT);
            if (type !== 'fade' && type !== 'black') {
               transitionColor = '#fff'; // wipe or crossfade fallback
            }
            break; 
          }
        }
      }
    }
  
    return (
      <View style={styles.container}>
      {/* Global Drag Ghost Overlay (Native + Mobile Web) */}
      {draggedMedia && !isNativeDrag && (
        <View 
          pointerEvents="none" 
          style={[styles.dragOverlay, { left: dragPos.x - 70, top: dragPos.y - 40 }]}
        >
          <View style={[styles.libraryItemThumb, { marginBottom: 0, flex: 1, backgroundColor: '#000' }]}>
            {draggedMedia.thumbnailUri ? (
              <Animated.Image source={{ uri: draggedMedia.thumbnailUri }} style={[styles.thumbnail, { resizeMode: 'cover' }]} />
            ) : (
              draggedMedia.type === 'video' ? (
                <Ionicons name="videocam" size={24} color="#71717a" />
              ) : draggedMedia.type === 'audio' ? (
                <Ionicons name="musical-notes" size={24} color="#71717a" />
              ) : (
                <Text style={{ color: '#fff', fontSize: 24, fontWeight: 'bold' }}>T</Text>
              )
            )}
          </View>
        </View>
      )}

      {/* Top Bar */}
      <View style={styles.topBar}>
        <Text style={styles.logoText}>NexusCut Pro</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
          <TouchableOpacity 
            style={[styles.saveBtn, { backgroundColor: '#18181b', borderWidth: 1, borderColor: '#3f3f46' }]} 
            onPress={() => {
              const store = useEditorStore.getState();
              const finalMedia = store.mediaLibrary || [];
              const firstMedia = finalMedia.find(m => (m.type === 'video' || m.type === 'audio' || m.type === 'image') && m.uri.startsWith('blob:'));
              const oldBlobUri = firstMedia ? firstMedia.uri : null;
              
              if (!oldBlobUri || !firstMedia) {
                 window.alert('No local videos found to relink.');
                 return;
              }

              const videoInput = document.createElement('input');
              videoInput.type = 'file';
              videoInput.accept = 'video/*,image/*';
              videoInput.onchange = (ve) => {
                 const vFile = (ve.target as HTMLInputElement).files?.[0];
                 if (vFile) {
                    const newUri = URL.createObjectURL(vFile);
                    const finalTracks = store.tracks;
                    const strTracks = JSON.stringify(finalTracks).split(oldBlobUri).join(newUri);
                    const strMedia = JSON.stringify(finalMedia).split(oldBlobUri).join(newUri);
                    useEditorStore.setState({
                       tracks: JSON.parse(strTracks),
                       mediaLibrary: JSON.parse(strMedia)
                    });
                    
                    // Save to IndexedDB so it auto-relinks next time
                    saveMediaToDB({
                      id: firstMedia.id,
                      type: firstMedia.type === 'audio' ? 'audio' : firstMedia.type === 'image' ? 'image' : 'video',
                      name: vFile.name,
                      duration: firstMedia.duration,
                      blob: vFile,
                      thumbnailUri: firstMedia.thumbnailUri,
                      timestamp: Date.now()
                    }).catch(err => console.log(err));

                    window.alert(`Successfully relinked with ${vFile.name}!`);
                 }
              };
              videoInput.click();
            }}
          >
            <Ionicons name="link-outline" size={18} color="#fff" />
            <Text style={styles.saveBtnText}>Relink</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.saveBtn, { backgroundColor: '#18181b', borderWidth: 1, borderColor: '#3f3f46' }]} 
            onPress={handleLoadLocal}
          >
            <Ionicons name="folder-open-outline" size={18} color="#fff" />
            <Text style={styles.saveBtnText}>Open</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.saveBtn, { backgroundColor: '#18181b', borderWidth: 1, borderColor: '#3f3f46' }]} 
            onPress={handleSaveLocal}
          >
            <Ionicons name="save-outline" size={18} color="#fff" />
            <Text style={styles.saveBtnText}>Save</Text>
          </TouchableOpacity>
          <Animated.View style={{ transform: [{ scale: exportScale }] }}>
            <TouchableOpacity 
              style={[styles.exportBtn, isExporting && styles.exportingBtn]} 
              onPress={handleExportClick}
              disabled={isExporting}
            >
              <Text style={styles.exportBtnText}>{isExporting ? 'Exporting...' : 'Export'}</Text>
            </TouchableOpacity>
          </Animated.View>
          <View style={{position: 'relative'}}>
            <TouchableOpacity 
              style={[styles.saveBtn, { backgroundColor: '#8b5cf6', marginRight: 8 }]} 
              onPress={() => {
                useEditorStore.getState().loadDemoProject();
                setShowDemoTooltip(true);
                setTimeout(() => setShowDemoTooltip(false), 5000);
              }}
            >
              <Ionicons name="sparkles" size={18} color="#fff" />
              <Text style={styles.saveBtnText}>Demo</Text>
            </TouchableOpacity>
            {showDemoTooltip && (
              <View style={{
                position: 'absolute', top: 45, left: -20, backgroundColor: '#38bdf8', padding: 10, borderRadius: 8, zIndex: 100, width: 150
              }}>
                <Text style={{color: '#0f172a', fontWeight: 'bold', fontSize: 12}}>Demo Loaded! Press Play or Export.</Text>
                <View style={{
                  position: 'absolute', top: -5, left: 40, width: 10, height: 10, backgroundColor: '#38bdf8', transform: [{rotate: '45deg'}]
                }}/>
              </View>
            )}
          </View>
          <TouchableOpacity 
            style={[styles.saveBtn, { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#3f3f46' }]} 
            onPress={handleOpenProjects}
          >
            <Ionicons name="folder-open-outline" size={18} color="#fff" />
            <Text style={styles.saveBtnText}>Projects</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.saveBtn, isSaving && { opacity: 0.5 }]} 
            onPress={handleSaveToCloud}
            disabled={isSaving}
          >
            <Ionicons name="cloud-upload-outline" size={18} color="#fff" />
            <Text style={styles.saveBtnText}>{isSaving ? 'Saving...' : 'Cloud'}</Text>
          </TouchableOpacity>

          {user ? (
            <TouchableOpacity onPress={handleLogout} style={styles.userBadge}>
              <Ionicons name="person-circle" size={24} color="#38bdf8" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={() => setShowAuthModal(true)} style={styles.loginBtn}>
              <Text style={styles.loginBtnText}>Login</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity onPress={() => router.push('/settings')} activeOpacity={0.7}>
            <Ionicons name="settings-outline" size={24} color="#a1a1aa" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Auth Modal */}
      {showAuthModal && (
        <View style={styles.authModalContainer}>
          <View style={styles.authModal}>
            <View style={styles.authHeader}>
              <Text style={styles.authTitle}>Login to NexusCut</Text>
              <TouchableOpacity onPress={() => setShowAuthModal(false)}>
                <Ionicons name="close" size={24} color="#a1a1aa" />
              </TouchableOpacity>
            </View>
            <TextInput 
              style={styles.authInput} 
              placeholder="Email" 
              placeholderTextColor="#71717a" 
              value={authEmail}
              onChangeText={setAuthEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TextInput 
              style={styles.authInput} 
              placeholder="Password" 
              placeholderTextColor="#71717a"
              secureTextEntry
              value={authPassword}
              onChangeText={setAuthPassword}
            />
            <TouchableOpacity style={styles.authSubmitBtn} onPress={handleAuth}>
              <Text style={styles.authSubmitText}>Sign In / Register</Text>
            </TouchableOpacity>
            <Text style={styles.authHint}>If no account exists, we will securely create one for you.</Text>
          </View>
        </View>
      )}

      {/* Projects Modal */}
      {showProjectsModal && (
        <View style={styles.authModalContainer}>
          <View style={[styles.authModal, { width: 400, maxHeight: '80%' }]}>
            <View style={styles.authHeader}>
              <Text style={styles.authTitle}>My Cloud Projects</Text>
              <TouchableOpacity onPress={() => setShowProjectsModal(false)}>
                <Ionicons name="close" size={24} color="#a1a1aa" />
              </TouchableOpacity>
            </View>
            <ScrollView style={{ maxHeight: 400 }}>
              {cloudProjects.length === 0 ? (
                <Text style={{ color: '#a1a1aa', textAlign: 'center', marginTop: 20 }}>No projects found in the cloud.</Text>
              ) : (
                cloudProjects.map(proj => (
                  <TouchableOpacity 
                    key={proj.id} 
                    style={{ padding: 16, backgroundColor: '#27272a', borderRadius: 8, marginBottom: 12 }}
                    onPress={() => handleLoadProject(proj)}
                  >
                    <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>{proj.title}</Text>
                    <Text style={{ color: '#a1a1aa', fontSize: 12, marginTop: 4 }}>
                      Last saved: {proj.updated_at ? new Date(proj.updated_at).toLocaleString() : 'Unknown'}
                    </Text>
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      )}
      {/* Main Content Area */}
      <View style={[styles.mainContent, { flexDirection: 'row', width: '100%', overflow: 'hidden' }]}>
        
        {/* Page 1: Nav + Context Tools */}
        <View style={[styles.sidebarGroup, isMobile ? { width: windowWidth, flexShrink: 0, height: '100%', flexDirection: 'row' } : { width: 280, flexDirection: 'row', height: '100%' }]}>
          {/* Global Navigation Rail */}
          <View style={[styles.navRail, isMobile && { width: 70 }]}>
            <TouchableOpacity style={[styles.navRailItem, activeTab === 'media' && styles.navRailItemActive]} onPress={() => setActiveTab('media')}>
              <Ionicons name="folder-outline" size={24} color={activeTab === 'media' ? '#fff' : '#a1a1aa'} />
              <Text style={[styles.navRailText, activeTab === 'media' && styles.navRailTextActive]}>Media</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.navRailItem, activeTab === 'audio' && styles.navRailItemActive]} onPress={() => setActiveTab('audio')}>
              <Ionicons name="musical-notes-outline" size={24} color={activeTab === 'audio' ? '#fff' : '#a1a1aa'} />
              <Text style={[styles.navRailText, activeTab === 'audio' && styles.navRailTextActive]}>Audio</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.navRailItem, activeTab === 'text' && styles.navRailItemActive]} onPress={() => setActiveTab('text')}>
              <Ionicons name="text-outline" size={24} color={activeTab === 'text' ? '#fff' : '#a1a1aa'} />
              <Text style={[styles.navRailText, activeTab === 'text' && styles.navRailTextActive]}>Text</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.navRailItem, activeTab === 'transitions' && styles.navRailItemActive]} onPress={() => setActiveTab('transitions')}>
              <Ionicons name="git-compare-outline" size={24} color={activeTab === 'transitions' ? '#fff' : '#a1a1aa'} />
              <Text style={[styles.navRailText, activeTab === 'transitions' && styles.navRailTextActive]}>Trans</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.navRailItem, activeTab === 'ai' && styles.navRailItemActive]} onPress={() => setActiveTab('ai')}>
              <Ionicons name="sparkles-outline" size={24} color={activeTab === 'ai' ? '#fff' : '#a1a1aa'} />
              <Text style={[styles.navRailText, activeTab === 'ai' && styles.navRailTextActive]}>AI Tools</Text>
            </TouchableOpacity>

            <View style={{ flex: 1 }} />
            <TouchableOpacity style={styles.navRailItem}>
              <Ionicons name="settings-outline" size={24} color="#a1a1aa" />
            </TouchableOpacity>
          </View>

          {/* Active Context Tools (Sub-panel) */}
          <View style={[styles.leftPane, isMobile && { width: windowWidth - 70 }]}>
            <View style={styles.paneHeader}>
              <Text style={styles.paneTitle}>
                {activeTab === 'media' ? 'Media Library' : 
                 activeTab === 'audio' ? 'Audio Library' : 
                 activeTab === 'text' ? 'Text Elements' : 
                 activeTab === 'transitions' ? 'Transitions' : 
                 activeTab === 'ai' ? 'AI Tools' : 'Context Pane'}
              </Text>
              {activeTab === 'media' && (
                <TouchableOpacity style={styles.importBtn} onPress={pickMedia}>
                  <Ionicons name="add-circle-outline" size={20} color="#fff" />
                  <Text style={styles.importBtnText}>{isMobile ? 'Add' : 'Add Media'}</Text>
                </TouchableOpacity>
              )}
            </View>

            {activeTab === 'media' && (
              <ScrollView style={styles.libraryContainer}>
                {/* Live Feed Item - always available */}
                <DraggableLibraryItem
                  key="live-feed"
                  item={{ id: 'live-feed-source', type: 'live', uri: 'LIVE_FEED', name: 'Live Feed (Webcam)', duration: 999 }}
                  isActive={false}
                  onPress={() => {
                    // Start webcam preview on click
                    if (typeof navigator !== 'undefined' && navigator.mediaDevices) {
                      navigator.mediaDevices.getUserMedia({ video: true })
                        .then(stream => {
                          liveFeedStreamRef.current = stream;
                        })
                        .catch(() => Alert.alert('Permission Denied', 'Could not access camera.'));
                    }
                  }}
                  onDragStart={(item: MediaItem, x: number, y: number) => {
                    handleDragStart({ ...item, uri: 'LIVE_FEED', type: 'live' }, x, y);
                  }}
                  onDragMove={handleDragMove}
                  onDragEnd={handleDragEnd}
                />
                {mediaLibrary.map(item => (
                  <DraggableLibraryItem 
                    key={item.id} 
                    item={item} 
                    isActive={activePreviewMediaId === item.id && activePreviewMode === 'source'}
                    onPress={() => setActivePreviewMode('source', item.id)}
                    onDragStart={handleDragStart}
                    onDragMove={handleDragMove}
                    onDragEnd={handleDragEnd}
                  />
                ))}
                {mediaLibrary.length === 0 && (
                  <View style={styles.emptyState}>
                    <Ionicons name="images-outline" size={48} color="#27272a" />
                    <Text style={styles.emptyStateSubtext}>No media added.</Text>
                    <Text style={styles.emptyStateSubtext}>Click Add Media to import.</Text>
                  </View>
                )}
              </ScrollView>
            )}


            {activeTab === 'audio' && (
              <View style={styles.emptyState}>
                <Ionicons name="musical-notes-outline" size={48} color="#27272a" />
                <Text style={styles.emptyStateSubtext}>Audio Library</Text>
                <TouchableOpacity style={styles.importBtn} onPress={pickAudio}>
                  <Ionicons name="add-circle-outline" size={20} color="#fff" />
                  <Text style={styles.importBtnText}>Import audio</Text>
                </TouchableOpacity>
              </View>
            )}

            {activeTab === 'text' && (
              <ScrollView style={styles.libraryContainer}>
                <Text style={{ color: '#a1a1aa', fontSize: 12, marginBottom: 16, paddingHorizontal: 16 }}>Click to add text at the playhead.</Text>
                {[
                  { id: 'preset_headline', type: 'text' as const, uri: '', name: 'Headline', duration: 5 },
                  { id: 'preset_subtitle', type: 'text' as const, uri: '', name: 'Subtitle', duration: 5 },
                  { id: 'preset_body', type: 'text' as const, uri: '', name: 'Body Text', duration: 5 }
                ].map(item => (
                  <DraggableLibraryItem 
                    key={item.id} 
                    item={item} 
                    isActive={false}
                    onPress={() => {
                      const store = useEditorStore.getState();
                      const allSegments = store.tracks.flatMap(t => t.segments);
                      const presetId = item.name === 'Headline' ? 'text-preset-headline' : item.name === 'Subtitle' ? 'text-preset-subtitle' : 'text-preset-body';
                      const existingSeg = allSegments.find(s => s.id === presetId);
                      
                      if (existingSeg) {
                        store.selectSegment(presetId);
                      } else {
                        const trackId = 'text-1';
                        const dropTime = store.currentTime;
                        const isHeadline = item.name === 'Headline';
                        const isSubtitle = item.name === 'Subtitle';
                        store.addSegment(trackId, {
                          id: presetId,
                          trackId: trackId,
                          start: dropTime,
                          end: dropTime + 5,
                          duration: 5,
                          type: 'text',
                          text: item.name,
                          fontSize: isHeadline ? 48 : isSubtitle ? 32 : 24,
                          yPosition: isHeadline ? 50 : isSubtitle ? 80 : 90,
                          xPosition: 50,
                          color: '#ffffff',
                          fontFamily: 'sans-serif'
                        });
                        store.selectSegment(presetId);
                      }
                    }}
                    onDragStart={handleDragStart}
                    onDragMove={handleDragMove}
                    onDragEnd={handleDragEnd}
                  />
                ))}
              </ScrollView>
            )}

            {activeTab === 'transitions' && (
              <ScrollView style={styles.libraryContainer}>
                {[
                  { id: 'trans_crossfade', type: 'effect' as const, uri: '', name: 'Crossfade', duration: 1 },
                  { id: 'trans_dipblack', type: 'effect' as const, uri: '', name: 'Dip to Black', duration: 1 },
                  { id: 'trans_zoom', type: 'effect' as const, uri: '', name: 'Zoom Transition', duration: 1 }
                ].map(item => (
                  <DraggableLibraryItem 
                    key={item.id} 
                    item={item} 
                    isActive={false}
                    onPress={() => {}}
                    onDragStart={handleDragStart}
                    onDragMove={handleDragMove}
                    onDragEnd={handleDragEnd}
                  />
                ))}
              </ScrollView>
            )}

            {activeTab === 'ai' && (
              <ScrollView style={styles.libraryContainer}>
                <View style={{ paddingBottom: 16 }}>
                  <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold', marginBottom: 8 }}>Background Removal</Text>
                  <Text style={{ color: '#a1a1aa', fontSize: 13, marginBottom: 16 }}>
                    Select an image or video clip, then use the Inspector to send it to NexusCut&apos;s background-removal service. Images return transparency; videos return an isolated subject on green for compositing.
                  </Text>
                  
                  <View style={{ backgroundColor: '#18181b', padding: 16, borderRadius: 8, borderWidth: 1, borderColor: '#27272a' }}>
                    <Ionicons name="sparkles" size={24} color="#38bdf8" style={{ marginBottom: 12 }} />
                    <Text style={{ color: '#fff', fontWeight: '500', marginBottom: 4 }}>How to use:</Text>
                    <Text style={{ color: '#a1a1aa', fontSize: 12, lineHeight: 18 }}>1. Drag a video onto the timeline.</Text>
                    <Text style={{ color: '#a1a1aa', fontSize: 12, lineHeight: 18 }}>2. Click the video clip to select it.</Text>
                    <Text style={{ color: '#a1a1aa', fontSize: 12, lineHeight: 18 }}>3. In the Inspector, choose Remove Background and wait for processing.</Text>
                  </View>
                  <TouchableOpacity style={[styles.importBtn, { marginTop: 12 }]} onPress={handleAutoCaptions}>
                    <Ionicons name="text-outline" size={20} color="#fff" />
                    <Text style={styles.importBtnText}>Generate captions</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
        
          <View style={[styles.preview, isMobile ? { width: windowWidth, flexShrink: 0, height: '100%' } : { flex: 1, height: '100%' }]}>
          <View style={styles.previewHeader}>
            <Text style={styles.previewTitle}>Previewing — {activePreviewMode === 'source' ? 'Source Media' : 'Program'}</Text>
          </View>
          <View 
            ref={previewContainerRef as unknown as React.Ref<View>}
            style={[styles.videoContainer, Platform.OS === 'web' && ({
            backgroundImage: 'repeating-linear-gradient(45deg, #222 25%, transparent 25%, transparent 75%, #222 75%, #222), repeating-linear-gradient(45deg, #222 25%, #111 25%, #111 75%, #222 75%, #222)',
            backgroundPosition: '0 0, 10px 10px',
            backgroundSize: '20px 20px',
            cursor: (selectedSegment?.type === 'video' || selectedSegment?.type === 'image' || currentSegmentForDerived) ? (previewDragging ? 'grabbing' : 'grab') : 'default'
          } as never)]}
            {...(Platform.OS === 'web' ? { onMouseDown: handlePreviewMouseDown } : {})}
          >
            <TouchableOpacity 
              activeOpacity={1} 
              style={{ width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }} 
              onPress={() => {
                if (activePreviewMode === 'program') {
                  const store = useEditorStore.getState();
                  const videoTrack = store.tracks.find(t => t.id === 'video-1');
                  const currentVideoSegment = videoTrack?.segments.find(s => store.currentTime >= s.start && store.currentTime < s.end);
                  if (currentVideoSegment) {
                    store.selectSegment(currentVideoSegment.id);
                  }
                }
              }}
            >
            {activeMedia ? (
              Platform.OS === 'web' ? (
                <>
                  {/* Background Media (images and videos on background-1 track) */}
                  {activePreviewMode === 'program' && tracks.find(t => t.id === 'background-1')?.segments
                    .filter(s => currentTime >= s.start && currentTime < s.end)
                    .map(bgSeg => {
                      const src = bgSeg.src || bgSeg.uri || '';
                      const xOff = (bgSeg.xPosition || 50) - 50;
                      const yOff = (bgSeg.yPosition || 50) - 50;
                      const scale = bgSeg.scale || 1;
                      const transform = `translateX(${xOff}%) translateY(${yOff}%) scale(${scale})`;

                      // Live Feed (webcam)
                      if (src === 'LIVE_FEED') {
                        return (
                          <LiveFeedBackground key={bgSeg.id} transform={transform} />
                        );
                      }

                      const isVideo = bgSeg.type === 'video' || src.match(/\.(mp4|mov|webm|avi|mkv)$/i);
                      if (isVideo) {
                        return (
                          <video
                            key={bgSeg.id}
                            src={src}
                            autoPlay
                            loop
                            muted
                            playsInline
                            style={{
                              position: 'absolute', top: 0, left: 0,
                              width: '100%', height: '100%',
                              objectFit: 'cover', zIndex: 0,
                              transform,
                            }}
                          />
                        );
                      }
                      return (
                        <img
                          key={bgSeg.id}
                          src={src}
                          alt="Background layer"
                          style={{
                            position: 'absolute', top: 0, left: 0,
                            width: '100%', height: '100%',
                            objectFit: 'cover', zIndex: 0,
                            transform,
                          }}
                        />
                      );
                    })}


                  
                  <video 
                    ref={webVideoRef}
                    src={activeMedia}
                    style={{ 
                      width: '100%', height: '100%', objectFit: 'contain', position: 'relative', zIndex: 1,
                      transform: `translateX(${(currentSegmentForDerived?.xPosition || 50) - 50}%) translateY(${(currentSegmentForDerived?.yPosition || 50) - 50}%) scale(${currentSegmentForDerived?.scale || 1})`
                    }}
                    autoPlay={isPlaying}
                    controls={false}
                  />
                  <View style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 2 }} />
                  <canvas 
                    ref={aiCanvasRef}
                    style={{ 
                      position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'contain', pointerEvents: 'none', display: 'none', zIndex: 3,
                      transform: `translateX(${(currentSegmentForDerived?.xPosition || 50) - 50}%) translateY(${(currentSegmentForDerived?.yPosition || 50) - 50}%) scale(${currentSegmentForDerived?.scale || 1})`
                    }}
                  />
                </>
              ) : (
                <VideoView 
                  player={player}
                  style={{ width: '100%', height: '100%' }} 
                  fullscreenOptions={{ enable: true }}
                  allowsPictureInPicture 
                />
              )
            ) : (
              <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name="film-outline" size={64} color="#27272a" />
                <Text style={{ color: '#fff', fontSize: 24, fontWeight: 'bold', marginTop: 16 }}>Player-Timeline 01</Text>
                <Text style={{ color: '#10b981', fontSize: 14, marginTop: 8, fontWeight: '600' }}>Native GPU Accelerated</Text>
              </View>
            )}
            </TouchableOpacity>

            
              {/* Overlay Text Engine */}
              {activePreviewMode === 'program' && (
                <View style={[StyleSheet.absoluteFill, { overflow: 'hidden' }]} pointerEvents="none">
                  {tracks.map(track => 
                    track.segments.filter(s => s.type === 'text' && currentTime >= s.start && currentTime <= s.end).map(textSeg => (
                      <View 
                        key={textSeg.id} 
                        style={{
                          position: 'absolute',
                          width: '100%',
                          top: `${textSeg.yPosition ?? 50}%`,
                          left: `${(textSeg.xPosition ?? 50) - 50}%`,
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Text style={{
                          color: textSeg.color || '#fff',
                          fontSize: textSeg.fontSize || 32,
                          fontFamily: textSeg.fontFamily || 'sans-serif',
                          fontWeight: 'bold',
                          textAlign: 'center',
                          textShadowColor: 'rgba(0,0,0,0.8)',
                          textShadowOffset: { width: 1, height: 1 },
                          textShadowRadius: 4,
                        }}>
                          {textSeg.text || ''}
                        </Text>
                      </View>
                    ))
                  )}
                </View>
              )}
{/* Simulated Player Transition Overlay */}
            {transitionOpacity > 0 && (
              <View 
                pointerEvents="none" 
                style={{
                  position: 'absolute',
                  top: 0, left: 0, right: 0, bottom: 0,
                  backgroundColor: transitionColor,
                  opacity: transitionOpacity,
                  zIndex: 100
                }} 
              />
            )}
          </View>
          
          <View style={styles.playbackControls}>
            <Text style={styles.timecode}>{formatTime(currentTime)} / {formatTime(videoDuration)}</Text>
            <TouchableOpacity style={styles.playBtn} onPress={() => setIsPlaying(!isPlaying)}>
              <Ionicons name={isPlaying ? "pause" : "play"} size={24} color="#10b981" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.contextBtn}>
              <Text style={styles.contextBtnText}>+ Add Text</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Page 3: Right Pane: Inspector */}
        <View style={[styles.rightPane, isMobile ? { width: windowWidth, flexShrink: 0, height: '100%' } : { width: (selectedSegmentId && selectedSegment?.type === 'text') ? 600 : 300, flexShrink: 0, height: '100%' }]}>
          <View style={styles.paneHeader}>
            <Text style={styles.paneTitle}>{selectedSegmentId ? 'Inspector' : 'Details'}</Text>
          </View>
          <View style={styles.inspectorContent}>
            {selectedSegmentId && selectedSegment ? (
              <ScrollView contentContainerStyle={{ paddingBottom: 40, gap: 24 }}>
                {selectedSegment.type === 'text' && (
                    <View style={{ backgroundColor: '#18181b', borderRadius: 8, padding: 12, borderWidth: 1, borderColor: '#27272a', flexDirection: isMobile ? 'column' : 'row', gap: 24 }}>
                      
                      {/* Left Column: Text Box */}
                      <View style={{ flex: 1, minHeight: 200 }}>
                        <Text style={{ color: '#a1a1aa', fontSize: 12, fontWeight: '600', marginBottom: 8 }}>Text Content</Text>
                        <TextInput 
                          style={{ flex: 1, backgroundColor: '#09090b', color: '#fff', padding: 16, borderRadius: 8, borderWidth: 1, borderColor: '#52525b', textAlignVertical: 'top', fontSize: 16 }}
                          value={selectedSegment.text || ''}
                          onChangeText={(t) => updateSegment(selectedSegment.trackId, selectedSegment.id, { text: t })}
                          placeholder="Enter text..."
                          placeholderTextColor="#52525b"
                          multiline
                        />
                      </View>

                      {/* Right Column: Controls */}
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: '#a1a1aa', fontSize: 12, fontWeight: '600', marginBottom: 8 }}>Vertical Position ({selectedSegment.yPosition ?? 50}%)</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                          <WebSlider 
                            min={0} max={100} 
                            value={selectedSegment.yPosition ?? 50} 
                            onChange={(v: number) => updateSegment(selectedSegment.trackId, selectedSegment.id, { yPosition: v })} 
                          />
                        </View>
                        
                        <Text style={{ color: '#a1a1aa', fontSize: 12, fontWeight: '600', marginBottom: 8 }}>Horizontal Position ({selectedSegment.xPosition ?? 50}%)</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                          <WebSlider 
                            min={0} max={100} 
                            value={selectedSegment.xPosition ?? 50} 
                            onChange={(v: number) => updateSegment(selectedSegment.trackId, selectedSegment.id, { xPosition: v })} 
                          />
                        </View>

                        <Text style={{ color: '#a1a1aa', fontSize: 12, fontWeight: '600', marginBottom: 8 }}>Duration ({(selectedSegment.duration ?? 5).toFixed(1)}s)</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                          <WebSlider 
                            min={1} max={30} 
                            value={selectedSegment.duration ?? 5} 
                            onChange={(v: number) => updateSegment(selectedSegment.trackId, selectedSegment.id, { duration: v, end: selectedSegment.start + v })} 
                          />
                        </View>

                        <Text style={{ color: '#a1a1aa', fontSize: 12, fontWeight: '600', marginBottom: 8 }}>Font Size ({selectedSegment.fontSize ?? 32}px)</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                          <WebSlider 
                            min={10} max={150} 
                            value={selectedSegment.fontSize ?? 32} 
                            onChange={(v: number) => updateSegment(selectedSegment.trackId, selectedSegment.id, { fontSize: v })} 
                          />
                        </View>
                        
                        <Text style={{ color: '#a1a1aa', fontSize: 12, fontWeight: '600', marginBottom: 8 }}>Font Family</Text>
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                          {['sans-serif', 'serif', 'monospace', 'Impact', 'Comic Sans MS'].map(font => (
                            <TouchableOpacity 
                              key={font}
                              onPress={() => updateSegment(selectedSegment.trackId, selectedSegment.id, { fontFamily: font })}
                              style={{ 
                                paddingVertical: 6, paddingHorizontal: 10, 
                                borderRadius: 4, borderWidth: 1, 
                                backgroundColor: (selectedSegment.fontFamily === font || (!selectedSegment.fontFamily && font === 'sans-serif')) ? 'rgba(6,182,212,0.2)' : '#18181b',
                                borderColor: (selectedSegment.fontFamily === font || (!selectedSegment.fontFamily && font === 'sans-serif')) ? '#06b6d4' : '#3f3f46'
                              }}>
                              <Text style={{ color: '#fff', fontSize: 12, fontFamily: font }}>{font.split('-')[0]}</Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      </View>
                    </View>
                  )}
                              {/* VIDEO/IMAGE PROPERTIES */}
                  {(selectedSegment.type === 'video' || selectedSegment.type === 'image') ? (
                    <>
                      <View style={styles.inspectorItem}>
                        <View style={styles.inspectorHeader}>
                          <Ionicons name="move" size={18} color="#a1a1aa" />
                          <Text style={styles.inspectorTitle}>Transform</Text>
                        </View>
                        
                        <View style={{ marginBottom: 16 }}>
                          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                            <Text style={{ color: '#a1a1aa', fontSize: 13 }}>Scale</Text>
                            <Text style={{ color: '#fff', fontSize: 13 }}>{((selectedSegment.scale || 1) * 100).toFixed(0)}%</Text>
                          </View>
                          <WebSlider 
                            min={0.1} max={3} step={0.1}
                            value={selectedSegment.scale || 1} 
                            onChange={(v: number) => updateSegment(selectedSegment.trackId, selectedSegment.id, { scale: v })} 
                          />
                        </View>
                        
                        <View style={{ marginBottom: 12, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#18181b', borderRadius: 8, padding: 10, borderWidth: 1, borderColor: '#27272a' }}>
                          <Ionicons name="move" size={16} color="#06b6d4" />
                          <View style={{ flex: 1 }}>
                            <Text style={{ color: '#e4e4e7', fontSize: 12, fontWeight: '600' }}>Drag to reposition</Text>
                            <Text style={{ color: '#52525b', fontSize: 11 }}>Click &amp; drag the preview to move · X:{((selectedSegment.xPosition || 50) - 50).toFixed(0)} Y:{((selectedSegment.yPosition || 50) - 50).toFixed(0)}</Text>
                          </View>
                          <TouchableOpacity onPress={() => updateSegment(selectedSegment.trackId, selectedSegment.id, { xPosition: 50, yPosition: 50 })}>
                            <Text style={{ color: '#06b6d4', fontSize: 11, fontWeight: '700' }}>Reset</Text>
                          </TouchableOpacity>
                        </View>
                      </View>

                      <View style={styles.inspectorItem}>
                        <View style={styles.inspectorHeader}>
                          <Ionicons name="sparkles" size={18} color="#38bdf8" />
                          <Text style={styles.inspectorTitle}>AI Tools</Text>
                        </View>
                        <Text style={styles.inspectorDesc}>Enhance this clip using local in-browser machine learning.</Text>
                        
                        <TouchableOpacity 
                          style={[styles.inspectorToggle, selectedSegment.aiEffects?.removeBackground && { backgroundColor: '#38bdf8' }]}
                          onPress={async () => {
                            const currentVal = selectedSegment.aiEffects?.removeBackground;
                            if (currentVal) return;
                            await handleRemoveBackground(selectedSegment);
                          }}
                        >
                          <Text style={[styles.inspectorToggleText, selectedSegment.aiEffects?.removeBackground && { color: '#000' }]}>
                            {selectedSegment.aiEffects?.removeBackground ? 'Background Removed' : 'Remove Background'}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </>
                  ) : selectedSegment.type !== 'text' && (
                    <Text style={styles.emptyStateSubtext}>No properties available for {selectedSegment.type} clip.</Text>
                  )}
              </ScrollView>
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="options-outline" size={48} color="#27272a" />
                <Text style={[styles.emptyStateSubtext, { textAlign: 'center', marginTop: 16 }]}>
                  Select a clip on the timeline to inspect its properties and apply AI tools.
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
      {/* Bottom Timeline Area */}
      <View style={styles.timelineArea}>
        {/* Timeline Quick Action Toolbar */}
        <View style={styles.timelineToolbar}>
           <View style={styles.toolbarGroup}>
            <TouchableOpacity 
              style={[styles.iconBtn, undoStack.length === 0 && { opacity: 0.3 }]} 
              onPress={undo}
              disabled={undoStack.length === 0}
            >
              <Ionicons name="arrow-undo-outline" size={18} color="#a1a1aa" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.iconBtn, redoStack.length === 0 && { opacity: 0.3 }]} 
              onPress={redo}
              disabled={redoStack.length === 0}
            >
              <Ionicons name="arrow-redo-outline" size={18} color="#a1a1aa" />
            </TouchableOpacity>
           </View>
           <View style={styles.toolbarDivider} />
           <View style={styles.toolbarGroup}>
             <TouchableOpacity style={styles.iconBtn} onPress={handleSplitSegment} disabled={!selectedSegmentId}>
               <Ionicons name="cut-outline" size={18} color={selectedSegmentId ? "#fff" : "#52525b"} />
             </TouchableOpacity>
             <TouchableOpacity style={styles.iconBtn} onPress={handleDeleteSegment} disabled={!selectedSegmentId}>
               <Ionicons name="trash-outline" size={18} color={selectedSegmentId ? "#fff" : "#52525b"} />
             </TouchableOpacity>
             <TouchableOpacity style={styles.iconBtn} disabled={!selectedSegmentId}>
               <Ionicons name="crop-outline" size={18} color={selectedSegmentId ? "#fff" : "#52525b"} />
             </TouchableOpacity>
           </View>
           <View style={styles.toolbarDivider} />
           <View style={styles.toolbarGroup}>
             <TouchableOpacity style={styles.iconBtn}><Ionicons name="mic-outline" size={18} color="#a1a1aa" /></TouchableOpacity>
           </View>
           
           <View style={{flex: 1}} />

           <View style={styles.toolbarGroup}>
             <TouchableOpacity style={styles.iconBtn}><Ionicons name="magnet-outline" size={18} color="#10b981" /></TouchableOpacity>
             <TouchableOpacity style={styles.iconBtn}><Ionicons name="link-outline" size={18} color="#10b981" /></TouchableOpacity>
           </View>
        </View>
        <View style={styles.timelineWrapper}>
          <Timeline />
        </View>
      </View>

      {/* Export Settings Overlay */}
      {showExportSettings && (
        <View style={styles.commandOverlay}>
          <View style={styles.commandModal}>
            <Text style={styles.commandTitle}>Export Settings</Text>
            <Text style={styles.commandDesc}>Choose your output format before rendering.</Text>
            
            <Text style={styles.settingLabel}>ASPECT RATIO</Text>
            <View style={styles.optionsRow}>
              <TouchableOpacity 
                style={[styles.optionBtn, aspectRatio === '16:9' && styles.optionBtnActive]} 
                onPress={() => setAspectRatio('16:9')}
              >
                <Text style={[styles.optionText, aspectRatio === '16:9' && styles.optionTextActive]}>16:9</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.optionBtn, aspectRatio === '9:16' && styles.optionBtnActive]} 
                onPress={() => setAspectRatio('9:16')}
              >
                <Text style={[styles.optionText, aspectRatio === '9:16' && styles.optionTextActive]}>9:16</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.optionBtn, aspectRatio === 'custom' && styles.optionBtnActive]} 
                onPress={() => setAspectRatio('custom')}
              >
                <Text style={[styles.optionText, aspectRatio === 'custom' && styles.optionTextActive]}>Custom</Text>
              </TouchableOpacity>
            </View>

            {aspectRatio === 'custom' && (
              <View style={{ flexDirection: 'row', gap: 12, marginTop: 16 }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.settingLabel}>WIDTH</Text>
                  <TextInput 
                    style={styles.customInput} 
                    value={customWidth} 
                    onChangeText={setCustomWidth} 
                    keyboardType="number-pad" 
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.settingLabel}>HEIGHT</Text>
                  <TextInput 
                    style={styles.customInput} 
                    value={customHeight} 
                    onChangeText={setCustomHeight} 
                    keyboardType="number-pad" 
                  />
                </View>
              </View>
            )}

            <Text style={styles.settingLabel}>QUALITY</Text>
            <View style={styles.optionsRow}>
              <TouchableOpacity 
                style={[styles.optionBtn, exportQuality === '1080p' && styles.optionBtnActive]} 
                disabled
              >
                <Text style={[styles.optionText, exportQuality === '1080p' && styles.optionTextActive]}>1080p (Free)</Text>
              </TouchableOpacity>
              <View style={styles.optionBtn}>
                <Text style={styles.optionText}>4K (not available)</Text>
              </View>
            </View>

            <View style={{ flexDirection: 'row', gap: 12, marginTop: 20 }}>
              <TouchableOpacity style={[styles.closeBtn, { flex: 1, backgroundColor: '#3f3f46' }]} onPress={() => setShowExportSettings(false)}>
                <Text style={[styles.closeBtnText, { color: '#fff' }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.closeBtn, { flex: 1 }]} onPress={handleRenderVideo}>
                <Text style={styles.closeBtnText}>Render Video</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Export Progress Overlay */}
      {isExporting && (
        <View style={styles.commandOverlay}>
          <View style={styles.commandModal}>
            <Text style={styles.commandTitle}>Rendering Video...</Text>
            <Text style={styles.commandDesc}>
              NexusCut&apos;s renderer is processing your timeline. Longer or more complex projects may take several minutes.
            </Text>
            
            <View style={{ width: '100%', height: 4, backgroundColor: '#27272a', borderRadius: 2, marginVertical: 16, overflow: 'hidden' }}>
              <View style={{ width: `${Math.max(1, exportProgress)}%`, height: '100%', backgroundColor: exportError ? '#ef4444' : '#38bdf8' }} />
            </View>
            <Text style={{ color: exportError ? '#ef4444' : '#38bdf8', fontWeight: 'bold', marginBottom: 12, textAlign: 'center' }}>
              {exportError ? 'Export Failed' : (exportProgress > 0 ? `${exportProgress}% Complete` : 'Initializing Engine...')}
            </Text>

            {exportError && (
              <ScrollView style={[styles.commandScroll, { maxHeight: 150 }]}>
                {liveLogs.map((log, i) => (
                  <Text key={i} style={[styles.commandText, { fontSize: 10, color: '#a1a1aa' }]}>{log}</Text>
                ))}
              </ScrollView>
            )}
            
            {exportError && (
              <TouchableOpacity 
                style={{ marginTop: 16, backgroundColor: '#3f3f46', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 6, alignSelf: 'center' }}
                onPress={() => {
                  setIsExporting(false);
                  setExportError(null);
                }}
              >
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>Close</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: '100%',
    backgroundColor: '#09090b', // Zinc-950
    fontFamily: Platform.OS === 'web' ? 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' : 'System',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    height: 64,
    backgroundColor: 'rgba(9, 9, 11, 0.7)', // Translucent Zinc-950
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
    zIndex: 10,
    ...(Platform.OS === 'web' ? { backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' } : {}),
  },
  logoText: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 18,
    letterSpacing: -0.5,
  },
  logoutText: {
    color: '#a1a1aa', // Zinc-400
    fontWeight: '600',
  },
  mainContent: {
    flex: 1,
  },
  navRail: {
    width: 90,
    minWidth: 90,
    flexShrink: 0,
    zIndex: 100,
    backgroundColor: '#09090b',
    borderRightWidth: 1,
    borderRightColor: '#27272a',
    alignItems: 'center',
    paddingTop: 16,
    gap: 16,
  },
  navRailItem: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 82,
    height: 64,
    borderRadius: 12,
  },
  navRailItemActive: {
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  navRailText: {
    color: '#a1a1aa',
    fontSize: 10,
    fontWeight: '600',
    marginTop: 4,
  },
  navRailTextActive: {
    color: '#fff',
  },
  leftPane: {
    width: 210,
    borderRightWidth: 1,
    borderRightColor: '#27272a',
    backgroundColor: '#0f0f11',
  },
  rightPane: {
    width: 280,
    borderLeftWidth: 1,
    borderLeftColor: '#27272a',
    backgroundColor: '#0f0f11',
  },
  paneHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#27272a',
  },
  paneTitle: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  importSmallBtn: {
    backgroundColor: 'rgba(56,189,248,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  importSmallBtnText: {
    color: '#38bdf8',
    fontWeight: '600',
    fontSize: 12,
  },
  libraryGrid: {
    flex: 1,
  },
  libraryGridContent: {
    padding: 16,
    gap: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  emptyLibrary: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    marginTop: 40,
    width: '100%',
  },
  emptyLibraryText: {
    color: '#71717a',
    textAlign: 'center',
    marginTop: 16,
    fontSize: 13,
  },
  libraryItem: {
    width: '100%',
    backgroundColor: '#18181b',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#27272a',
    overflow: 'hidden',
  },
  libraryItemActive: {
    borderColor: '#38bdf8',
    backgroundColor: 'rgba(56,189,248,0.1)',
  },
  dragOverlay: {
    position: 'absolute',
    zIndex: 9999,
    width: 140,
    height: 80,
    backgroundColor: 'transparent',
    borderRadius: 8,
    shadowColor: '#38bdf8',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 10,
    opacity: 0.8,
  },
  libraryItemThumb: {
    height: 30,
    backgroundColor: '#27272a',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  durationBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  durationText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  libraryItemName: {
    color: '#e4e4e7',
    fontSize: 12,
    padding: 8,
  },
  addToTimelineBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(16,185,129,0.8)',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewHeader: {
    width: '100%',
    paddingVertical: 12,
    alignItems: 'flex-start',
  },
  previewModeText: {
    color: '#a1a1aa',
    fontSize: 14,
    fontWeight: '600',
  },
  preview: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 24,
    backgroundColor: '#09090b',
  },
  videoPlayer: {
    width: '100%',
    height: '70%',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#000',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: '#10b981', 
    marginBottom: 24,
    fontWeight: '600',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
  },
  importBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  importBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  toolBtn: {
    backgroundColor: 'rgba(6,182,212,0.15)', // Electric Cyan tint
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(6,182,212,0.3)',
    justifyContent: 'center',
  },
  exportBtn: {
    backgroundColor: '#06b6d4', // Electric Cyan
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#06b6d4',
    shadowRadius: 12,
    elevation: 6,
  },
  exportingBtn: {
    backgroundColor: '#0891b2', 
    opacity: 0.8,
  },
  btnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
  exportBtnText: {
    color: '#082f49', // Deep contrast
    fontWeight: '800',
    fontSize: 15,
  },
  timelineArea: {
    height: 280,
    backgroundColor: '#09090b',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  timelineToolbar: {
    height: 48, // Taller toolbar for better hit targets
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
    backgroundColor: 'rgba(24, 24, 27, 0.8)', // Zinc-900
    ...(Platform.OS === 'web' ? { backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' } : {}),
  },
  toolbarGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  toolbarDivider: {
    width: 1,
    height: 16,
    backgroundColor: '#3f3f46',
    marginHorizontal: 12,
  },
  iconBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
  },
  timelineWrapper: {
    height: 232,
  },
  commandOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    zIndex: 100,
  },
  commandModal: {
    backgroundColor: '#18181b', // Zinc-900
    width: '100%',
    maxHeight: '80%',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: '#3f3f46', // Zinc-700
  },
  commandTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 8,
  },
  commandDesc: {
    color: '#a1a1aa',
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
  },
  commandScroll: {
    backgroundColor: '#09090b',
    borderRadius: 12,
    padding: 16,
    maxHeight: 300,
    marginBottom: 20,
  },
  commandText: {
    color: '#10b981', // Emerald-500 for matrix hacker vibes
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 12,
  },
  closeBtn: {
    backgroundColor: '#10b981',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  closeBtnText: {
    color: '#022c22',
    fontWeight: '800',
    fontSize: 16,
  },
  settingLabel: {
    color: '#71717a',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 8,
    marginTop: 16,
    letterSpacing: 1,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  optionBtn: {
    flex: 1,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#3f3f46',
    borderRadius: 8,
    alignItems: 'center',
  },
  optionBtnActive: {
    borderColor: '#10b981',
    backgroundColor: 'rgba(16,185,129,0.1)',
  },
  optionText: {
    color: '#a1a1aa',
    fontWeight: '600',
    fontSize: 14,
  },
  optionTextActive: {
    color: '#10b981',
  },
  customInput: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    color: '#fff',
    borderWidth: 1,
    borderColor: '#3f3f46',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    textAlign: 'center',
  },
  inspectorContainer: {
    gap: 16,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#3f3f46',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  userBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  loginBtn: {
    backgroundColor: 'rgba(56,189,248,0.1)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(56,189,248,0.3)',
  },
  loginBtnText: {
    color: '#38bdf8',
    fontSize: 13,
    fontWeight: '600',
  },
  authModalContainer: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  authModal: {
    backgroundColor: '#18181b',
    width: 320,
    borderRadius: 12,
    padding: 24,
    borderWidth: 1,
    borderColor: '#27272a',
  },
  authHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  authTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  authInput: {
    backgroundColor: '#09090b',
    borderWidth: 1,
    borderColor: '#27272a',
    borderRadius: 8,
    color: '#fff',
    padding: 12,
    marginBottom: 12,
  },
  authSubmitBtn: {
    backgroundColor: '#38bdf8',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  authSubmitText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 14,
  },
  authHint: {
    color: '#71717a',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 12,
  },
  inspectorItem: {
    backgroundColor: '#18181b',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#27272a',
  },
  inspectorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  inspectorTitle: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
  inspectorDesc: {
    color: '#a1a1aa',
    fontSize: 12,
    marginBottom: 12,
  },
  inspectorToggle: {
    backgroundColor: 'rgba(56,189,248,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(56,189,248,0.3)',
    borderRadius: 6,
    paddingVertical: 8,
    alignItems: 'center',
  },
  inspectorToggleText: {
    color: '#38bdf8',
    fontWeight: '600',
    fontSize: 13,
  },
  playbackControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 80,
    borderTopWidth: 1,
    borderTopColor: '#27272a',
    backgroundColor: '#09090b',
  },
  timecode: {
    color: '#fff',
    fontFamily: Platform.OS === 'web' ? 'monospace' : 'Courier',
    fontSize: 14,
  },
  playBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(16,185,129,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
  },
  contextBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#27272a',
  },
  contextBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  inspectorContent: {
    flex: 1,
    padding: 24,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
  },
  emptyStateSubtext: {
    borderColor: '#3f3f46',
    borderRadius: 8,
    alignItems: 'center',
  },
  libraryContainer: {
    flex: 1,
    padding: 16,
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#3f3f46',
  },
  sidebarGroup: {
    borderRightWidth: 1,
    borderRightColor: '#27272a',
    backgroundColor: '#09090b',
  },
  previewTitle: {
    color: '#a1a1aa',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    paddingVertical: 12,
  },
  videoContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000',
  },
});
