"use client";

import { toast } from '@/lib/toast';
import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Wand2, Scissors, Music, Layers, Type, Image as ImageIcon, FileAudio, X, Shuffle, Type as TypeIcon, Camera, Mic, Square, Volume2, VolumeX } from 'lucide-react';
import { useEditorStore, MediaItem, TrackSegment, TranscriptWord } from '@/store/useEditorStore';
import { get, set } from 'idb-keyval';
import CaptionEditorModal from './CaptionEditorModal';
import CameraRecorderModal from './CameraRecorderModal';
import ScriptCutModal from './ScriptCutModal';
import { trackEvent } from '@/lib/analytics';
import { findSmartCutKeepRanges } from '@/lib/smartCut';
import NextImage from 'next/image';

type VoiceoverCaptionSource = { segment: TrackSegment; file: File };
type DragPayload = { type: string; name?: string; item?: MediaItem; url?: string; duration?: number };
type TimedTranscriptionWord = { word: string; start: number; end: number };
type TranscriptionData = { error?: string; transcription?: { text?: string; words?: TimedTranscriptionWord[] } };
type BrollSuggestion = { videoUrl?: string; start: number; end: number; query?: string };
const getErrorMessage = (error: unknown) => error instanceof Error ? error.message : String(error);

function encodeMonoWav(audio: AudioBuffer) {
  const samples = audio.getChannelData(0);
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);
  const writeString = (offset: number, value: string) => [...value].forEach((character, index) => view.setUint8(offset + index, character.charCodeAt(0)));
  writeString(0, 'RIFF');
  view.setUint32(4, 36 + samples.length * 2, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, audio.sampleRate, true);
  view.setUint32(28, audio.sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(36, 'data');
  view.setUint32(40, samples.length * 2, true);
  samples.forEach((sample, index) => view.setInt16(44 + index * 2, Math.max(-1, Math.min(1, sample)) * 0x7fff, true));
  return buffer;
}

async function buildVoiceoverTimelineForCaptions(sources: VoiceoverCaptionSource[]) {
  const AudioContextConstructor = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextConstructor || typeof OfflineAudioContext === 'undefined') {
    throw new Error('This browser cannot combine multiple voiceovers for captions. Please use the latest Chrome, Edge, or Safari.');
  }

  const decoder = new AudioContextConstructor();
  try {
    const decoded = await Promise.all(sources.map(async ({ segment, file }) => ({
      segment,
      audio: await decoder.decodeAudioData(await file.arrayBuffer()),
    })));
    const sampleRate = 44100;
    const totalDuration = Math.max(...decoded.map(({ segment, audio }) => Math.max(Number(segment.end) || 0, (Number(segment.start) || 0) + audio.duration)), 0.1);
    const offline = new OfflineAudioContext(1, Math.ceil(totalDuration * sampleRate), sampleRate);

    decoded.forEach(({ segment, audio }) => {
      const source = offline.createBufferSource();
      source.buffer = audio;
      source.connect(offline.destination);
      const sourceStart = Math.max(0, Number(segment.sourceStart) || 0);
      const segmentDuration = Math.max(0.01, Number(segment.duration) || Number(segment.end) - Number(segment.start));
      const playableDuration = Math.min(segmentDuration, Math.max(0.01, audio.duration - sourceStart));
      source.start(Math.max(0, Number(segment.start) || 0), sourceStart, playableDuration);
    });

    const rendered = await offline.startRendering();
    return new File([encodeMonoWav(rendered)], 'NexusCut-voiceover-timeline.wav', { type: 'audio/wav' });
  } finally {
    await decoder.close();
  }
}

const TABS = [
  { id: 'media', icon: ImageIcon, label: 'Media' },
  { id: 'magic', icon: Sparkles, label: 'AI Magic' },
  { id: 'text', icon: Type, label: 'Text' },
  { id: 'audio', icon: Music, label: 'Audio' },
  { id: 'transitions', icon: Shuffle, label: 'Trans' },
  { id: 'effects', icon: Wand2, label: 'Effects' },
];

interface SidebarProps {
  onMobileActionComplete?: (action: 'add_media' | 'add_text') => void;
}

export default function Sidebar({ onMobileActionComplete }: SidebarProps) {
  const [activeTab, setActiveTab] = useState('media');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressText, setProgressText] = useState('');
  const [ttsText, setTtsText] = useState('');
  const [ttsVoice, setTtsVoice] = useState('alloy');
  const [isGeneratingTts, setIsGeneratingTts] = useState(false);
  const [isCaptionEditorOpen, setIsCaptionEditorOpen] = useState(false);
  const [isScriptCutOpen, setIsScriptCutOpen] = useState(false);
  const [captionSource, setCaptionSource] = useState<'original' | 'voiceover'>('original');
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
  const [isRecordingVoiceover, setIsRecordingVoiceover] = useState(false);
  const [voiceoverError, setVoiceoverError] = useState('');
  const [audioNotice, setAudioNotice] = useState('');
  const [isTouchWorkspace, setIsTouchWorkspace] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const voiceoverRecorderRef = useRef<MediaRecorder | null>(null);
  const voiceoverStreamRef = useRef<MediaStream | null>(null);
  const voiceoverStartRef = useRef(0);
  const voiceoverStartedAtRef = useRef(0);
  const voiceoverLabelRef = useRef('Voiceover 1');
  const { mediaLibrary, addMediaItem, removeMediaItem, addSegment, setMediaLibrary, tracks, currentTime, isPlaying, setIsPlaying, selectedSegmentId, selectSegment, updateSegment, transcriptionText, setTranscriptionText, setFrameMode } = useEditorStore();
  const selectedVideoClip = tracks
    .filter(track => track.type === 'video')
    .flatMap(track => track.segments.map(segment => ({ trackId: track.id, segment })))
    .find(({ segment }) => segment.id === selectedSegmentId);
  const selectedVideoIsMuted = selectedVideoClip ? (selectedVideoClip.segment.volume ?? 1) === 0 : false;

  // A creator who deliberately clicks an audio action is asking to edit that
  // lane. Restore a previously hidden/locked lane instead of silently dropping
  // the clip, which made Audio FX and voiceovers look broken.
  const prepareAudioTrack = (trackId: 'audio-1' | 'audio-2', label: string) => {
    const state = useEditorStore.getState();
    const track = state.tracks.find(item => item.id === trackId);
    if (!track) {
      setAudioNotice(`${label} is unavailable because its timeline track is missing.`);
      return false;
    }
    const restored: string[] = [];
    if (track.isLocked) {
      state.toggleTrackLock(trackId);
      restored.push('unlocked');
    }
    if (track.isHidden) {
      state.toggleTrackVisibility(trackId);
      restored.push('shown');
    }
    setAudioNotice(restored.length > 0 ? `${label} track ${restored.join(' and ')} so your audio can be added.` : '');
    return true;
  };

  // Narration should build as a sequence. If the playhead is already inside an
  // existing voiceover, place the new recording after the last narration rather
  // than stacking two spoken tracks on top of one another. Empty gaps remain
  // available for intentional placement.
  const resolveVoiceoverStart = (requestedStart: number) => {
    const audioTrack = useEditorStore.getState().tracks.find(track => track.id === 'audio-1');
    const voiceovers = (audioTrack?.segments || []).filter(segment =>
      segment.type === 'audio'
      && (/^Voiceover(?:_|\s|$)/i.test(segment.name || '') || segment.name?.startsWith('NexusCut narration'))
      && Number.isFinite(segment.start)
      && Number.isFinite(segment.end)
    );

    const isOccupied = voiceovers.some(segment =>
      requestedStart >= segment.start && requestedStart < segment.end - 0.02
    );
    if (!isOccupied) return requestedStart;

    return Math.max(requestedStart, ...voiceovers.map(segment => segment.end));
  };

  const getNextVoiceoverLabel = () => {
    const state = useEditorStore.getState();
    const labels = [
      ...state.mediaLibrary.map(item => item.name),
      ...state.tracks.flatMap(track => track.segments.map(segment => segment.name || '')),
    ];
    const highestNumber = labels.reduce((highest, label) => {
      const match = /^Voiceover\s+(\d+)$/i.exec(label);
      return match ? Math.max(highest, Number(match[1])) : highest;
    }, 0);
    return `Voiceover ${highestNumber + 1}`;
  };

  const stopVoiceover = React.useCallback((pausePlayback = true) => {
    const recorder = voiceoverRecorderRef.current;
    if (recorder && recorder.state !== 'inactive') recorder.stop();
    if (pausePlayback) setIsPlaying(false);
  }, [setIsPlaying]);

  const startVoiceover = async () => {
    setVoiceoverError('');
    if (!prepareAudioTrack('audio-1', 'Voiceover')) return;
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      setVoiceoverError('Voice recording is not supported by this browser. Please use the latest Chrome, Edge, or Safari.');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus') ? 'audio/webm;codecs=opus' : '';
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      const chunks: BlobPart[] = [];
      const start = resolveVoiceoverStart(useEditorStore.getState().currentTime);
      voiceoverStartRef.current = start;
      voiceoverLabelRef.current = getNextVoiceoverLabel();
      voiceoverStartedAtRef.current = Date.now();
      voiceoverStreamRef.current = stream;
      voiceoverRecorderRef.current = recorder;
      recorder.ondataavailable = (event) => { if (event.data.size) chunks.push(event.data); };
      recorder.onstop = () => {
        const durationFallback = Math.max(0.1, (Date.now() - voiceoverStartedAtRef.current) / 1000);
        const blob = new Blob(chunks, { type: recorder.mimeType || 'audio/webm' });
        const extension = blob.type.includes('mp4') ? 'm4a' : 'webm';
        const label = voiceoverLabelRef.current;
        const file = new File([blob], `${label}.${extension}`, { type: blob.type || 'audio/webm' });
        const url = URL.createObjectURL(file);
        const addVoiceoverSegment = (duration: number) => {
          const safeDuration = Number.isFinite(duration) && duration > 0 ? duration : durationFallback;
          const item = { id: Math.random().toString(36).slice(2, 11), url, type: 'audio' as const, name: label, file, duration: safeDuration };
          addMediaItem(item);
          addSegment('audio-1', { id: Math.random().toString(36).slice(2, 11), trackId: 'audio-1', start: voiceoverStartRef.current, end: voiceoverStartRef.current + safeDuration, duration: safeDuration, type: 'audio', name: label, src: url, volume: 1 });
          set('nexuscut-media', useEditorStore.getState().mediaLibrary).catch(error => console.error('Failed to preserve recorded voiceover', error));
        };
        const probe = document.createElement('audio');
        probe.preload = 'metadata';
        probe.onloadedmetadata = () => addVoiceoverSegment(probe.duration);
        probe.onerror = () => addVoiceoverSegment(durationFallback);
        probe.src = url;
        voiceoverStreamRef.current?.getTracks().forEach(track => track.stop());
        voiceoverStreamRef.current = null;
        voiceoverRecorderRef.current = null;
        setIsRecordingVoiceover(false);
      };
      setIsPlaying(true);
      recorder.start();
      setIsRecordingVoiceover(true);
    } catch (error: unknown) {
      setVoiceoverError(error instanceof DOMException && error.name === 'NotAllowedError' ? 'Microphone access was blocked. Allow it in your browser, then try again.' : 'Could not start the microphone. Please check your microphone and try again.');
    }
  };

  useEffect(() => () => {
    if (voiceoverRecorderRef.current?.state !== 'inactive') voiceoverRecorderRef.current?.stop();
    voiceoverStreamRef.current?.getTracks().forEach(track => track.stop());
  }, []);

  useEffect(() => {
    if (isRecordingVoiceover && !isPlaying) stopVoiceover(false);
  }, [isRecordingVoiceover, isPlaying, stopVoiceover]);

  useEffect(() => {
    const openTab = (event: Event) => setActiveTab((event as CustomEvent<string>).detail || 'media');
    window.addEventListener('mobile_open_sidebar_tab', openTab);
    return () => window.removeEventListener('mobile_open_sidebar_tab', openTab);
  }, []);

  useEffect(() => {
    const query = window.matchMedia('(pointer: coarse)');
    const update = () => setIsTouchWorkspace(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    get('nexuscut-media').then((files: MediaItem[] | undefined) => {
      if (files && files.length > 0) {
        const hydratedFiles = files
          .filter(item => item.file) // iOS Safari often loses File objects in IndexedDB
          .map(item => ({ ...item, url: URL.createObjectURL(item.file as File) }));
        setMediaLibrary(hydratedFiles);

        // Blob URLs expire when a browser reloads. Reconnect the restored
        // timeline before playback, preserving captions that point to the
        // source video as well as video and audio clips themselves.
        const state = useEditorStore.getState();
        const renewedUrls = new Map<string, string>();
        state.tracks.forEach(track => track.segments.forEach(segment => {
          if (!segment.src || !segment.name) return;
          const media = hydratedFiles.find(item => item.name === segment.name && item.file);
          if (media) renewedUrls.set(segment.src, media.url);
        }));
        if (renewedUrls.size > 0) {
          state.setTracks(state.tracks.map(track => ({
            ...track,
            segments: track.segments.map(segment => segment.src && renewedUrls.has(segment.src)
              ? { ...segment, src: renewedUrls.get(segment.src) }
              : segment)
          })));
        }
      }
    }).catch(err => console.error('Failed to load media from IDB', err));
  }, [setMediaLibrary]);

  const processFile = (file: File, explicitDuration?: number, addToTimeline = false) => {
    const isVideoTemp = file.type.startsWith('video') || file.name.match(/\.(mp4|mov|webm|mkv)$/i) || (!file.type && !file.name.includes('.'));
    
    // iOS Safari refuses to decode blob URLs if the mime type is empty. 
    // If we suspect it's a video but has no type, wrap it in a properly typed File object.
    const patchedFile = (isVideoTemp && !file.type) 
      ? new File([file], file.name || 'video.mp4', { type: 'video/mp4' }) 
      : file;
      
    const url = URL.createObjectURL(patchedFile);
    const isVideo = patchedFile.type.startsWith('video') || patchedFile.name.match(/\.(mp4|mov|webm|mkv)$/i);
    const isAudio = patchedFile.type.startsWith('audio') || patchedFile.name.match(/\.(mp3|wav|m4a|aac)$/i);
    const type = isVideo ? 'video' : isAudio ? 'audio' : 'image';
    
    const finishImport = (duration: number, thumbnailUrl?: string) => {
      const newItem: MediaItem & { thumbnailUrl?: string } = {
        id: Math.random().toString(36).substr(2, 9),
        url,
        type,
        name: patchedFile.name,
        file: patchedFile,
        duration: duration,
        thumbnailUrl: thumbnailUrl
      };

      addMediaItem(newItem);
      const state = useEditorStore.getState();
      const updatedLibrary = state.mediaLibrary;
      set('nexuscut-media', updatedLibrary).catch(err => console.error('Failed to save to IDB', err));

      if (addToTimeline && type === 'video') {
        const videoTrack = state.tracks.find((track) => track.id === 'video-1');
        const start = Math.max(0, ...(videoTrack?.segments.map((segment) => segment.end) ?? []));
        state.addSegment('video-1', {
          id: Math.random().toString(36).substr(2, 9),
          trackId: 'video-1',
          start,
          end: start + duration,
          duration,
          sourceDuration: duration,
          type: 'video',
          src: url,
          name: patchedFile.name,
        });
        onMobileActionComplete?.('add_media');
      }
      
      // Auto-relink any broken segments in the timeline
      state.tracks.forEach(t => {
        state.updateAllSegments(
          t.id, 
          { src: url }, 
          (s) => s.name === file.name && (s.src?.startsWith('blob:') || !s.src)
        );
      });
    };

    if (type === 'video') {
      const media = document.createElement('video');
      media.muted = true;
      media.playsInline = true;
      media.autoplay = true;
      media.style.position = 'fixed';
      media.style.top = '0';
      media.style.left = '0';
      media.style.opacity = '0.01'; // iOS sometimes skips decoding if opacity is exactly 0
      media.style.pointerEvents = 'none';
      document.body.appendChild(media);
      
      media.src = url;
      media.preload = 'auto'; // Force iOS to fetch the whole Blob if needed
      
      let thumbnailGenerated = false;
      
      const cleanup = () => {
        media.pause();
        // Removed src wiping for video to prevent iOS Safari hardware decoder purge for Blob URLs
        if (media.parentNode) {
          media.parentNode.removeChild(media);
        }
      };
      
      media.onloadedmetadata = () => {
        const dur = explicitDuration || media.duration;
        if (!dur || dur === Infinity || isNaN(dur)) {
          media.currentTime = 1000000;
          return;
        }

        // Try to generate thumbnail
        media.currentTime = Math.min(0.5, dur / 2);
      };
      
      media.onseeked = () => {
        if (media.currentTime > 999000) {
           let dur = explicitDuration || media.duration;
           if (!dur || dur === Infinity || isNaN(dur)) dur = 10;
           media.currentTime = Math.min(0.5, dur / 2);
           return;
        }

        if (thumbnailGenerated) return;
        thumbnailGenerated = true;
        try {
          const canvas = document.createElement('canvas');
          canvas.width = media.videoWidth || 320;
          canvas.height = media.videoHeight || 180;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(media, 0, 0, canvas.width, canvas.height);
            const thumbUrl = canvas.toDataURL('image/jpeg', 0.5);
            cleanup();
            finishImport(explicitDuration || media.duration || 10, thumbUrl);
          } else {
            cleanup();
            finishImport(explicitDuration || media.duration || 10);
          }
        } catch {
          cleanup();
          finishImport(explicitDuration || media.duration || 10);
        }
      };
      
      media.onerror = () => {
        cleanup();
        // Fallback if video tag fails to load
        finishImport(explicitDuration || 10);
      };
      
      // Safety timeout in case seek/load fails
      setTimeout(() => {
        if (!thumbnailGenerated) {
          thumbnailGenerated = true;
          cleanup();
          finishImport(explicitDuration || media.duration || 10);
        }
      }, 3000);
      
      media.load();
      // Attempt to play to force loading on iOS
      const playPromise = media.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          // Pause immediately if it actually started playing
          media.pause();
        }).catch(err => {
          // Play might fail if not interacted with, but it might still load
          console.warn('Auto-play prevented, but loading might continue', err);
        });
      }
    } else if (type === 'audio') {
      const media = document.createElement('audio');
      media.src = url;
      media.onloadedmetadata = () => {
        let dur = explicitDuration || media.duration;
        if (!dur || dur === Infinity || isNaN(dur)) {
            dur = 10;
        }
        media.pause();
        media.removeAttribute('src');
        media.load();
        finishImport(dur);
      };
      media.onerror = () => {
        media.pause();
        media.removeAttribute('src');
        media.load();
        finishImport(10);
      };
    } else {
      finishImport(5);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    // Touch devices have no reliable drag-and-drop workflow. Importing there
    // means “add this to my story”, so place the new clip on the timeline
    // immediately and return the user to the editor.
    processFile(file, undefined, window.innerWidth < 1280);
  };

  const handleCameraRecordFinish = (file: File, durationSecs: number) => {
    // Screen and camera recordings must never be cropped merely because their
    // dimensions differ from the project's current canvas.
    setFrameMode('fit');
    processFile(file, durationSecs, true);
  };

  const handleMediaClick = (item: MediaItem) => {
    const duration = item.duration || 10;
    
    const state = useEditorStore.getState();
    const trackId = item.type === 'audio' ? 'audio-1' : 'video-1';
    if (item.type === 'audio' && !prepareAudioTrack('audio-1', 'Audio')) return;
    const targetTrack = state.tracks.find((track) => track.id === trackId);
    const isFirstClip = !state.tracks.some(t => t.segments.length > 0);
    if (window.innerWidth < 768) state.setCurrentTime(0);
    // Clicking an item in the library is an append action. Video and narration
    // clips belong in a sequence; background music and sound effects can still
    // be positioned deliberately with drag-and-drop.
    const isNarration = item.type === 'audio'
      && (/^Voiceover(?:_|\s|$)/i.test(item.name) || /^NexusCut narration/i.test(item.name));
    const start = trackId === 'video-1' || isNarration
      ? Math.max(0, ...(targetTrack?.segments.map((segment) => segment.end) ?? []))
      : state.currentTime;

    addSegment(trackId, {
      id: crypto.randomUUID(),
      trackId,
      start,
      end: start + duration,
      duration: duration,
      sourceDuration: duration,
      type: item.type,
      src: item.url,
      name: item.name
    });
    trackEvent('media_added_to_timeline', { media_type: item.type, device: window.innerWidth < 1280 ? 'responsive' : 'desktop' });

    if (isFirstClip && duration > 0) {
      // Mobile has a compact track header and no fixed sidebars. Using the
      // desktop estimate here was centering the first clip off-screen.
      const isMobile = window.innerWidth < 768;
      const visibleWidth = isMobile ? window.innerWidth - 64 : window.innerWidth - 300 - 300 - 192;
      const safeWidth = Math.max(isMobile ? 220 : 500, visibleWidth);
      const desiredZoom = (safeWidth * 0.9) / duration;
      const finalZoom = Math.min(isMobile ? 100 : 200, Math.max(2, desiredZoom));
      state.setZoomLevel(finalZoom);
    }

    // A tap-to-add action should always leave the user at the beginning of
    // their story, not stranded in a previous horizontal scroll position.
    window.requestAnimationFrame(() => window.dispatchEvent(new Event('timeline_reset_to_start')));
    window.setTimeout(() => window.dispatchEvent(new Event('timeline_reset_to_start')), 120);
    
    if (onMobileActionComplete) {
      onMobileActionComplete('add_media');
    }
  };

  const handleDragStart = (e: React.DragEvent, data: DragPayload) => {
    const jsonStr = JSON.stringify(data);
    e.dataTransfer.setData('application/json', jsonStr);
    e.dataTransfer.setData('text/plain', jsonStr);
    e.dataTransfer.effectAllowed = 'copy';
    
    // Add custom type flag so timeline knows what we're dragging over it
    // Some browsers lowercase this, so we'll use lowercase
    e.dataTransfer.setData(`nexuscut-type-${data.type}`, 'true');
    if (data.name) {
      e.dataTransfer.setData(`nexuscut-name-${data.name.replace(/\s+/g, '-')}`, 'true');
    }
  };

  // AI Function implementations
  const handleSmartCut = async () => {
    const videoTrack = tracks.find(t => t.id === 'video-1');
    if (!videoTrack || videoTrack.segments.length === 0) return toast('Please add a video to the timeline first!');
    
    const firstSeg = videoTrack.segments[0];
    if (videoTrack.isLocked) return toast('The Main Video track is locked. Unlock it before using Smart Cut.');
    const mediaItem = mediaLibrary.find(m => m.url === firstSeg.src)
      || mediaLibrary.find(m => m.name === firstSeg.name && m.file);
    if (!mediaItem || !mediaItem.file) return toast('Cannot find original file for this video segment.');

    setIsProcessing(true);
    setProgressText('Analyzing audio for silence...');
    
    try {
      setProgressText('Decoding this clip’s audio…');
      const sourceStart = firstSeg.sourceStart || 0;
      const sourceEnd = sourceStart + firstSeg.duration;
      const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) throw new Error('This browser does not provide an audio decoder.');
      const audioContext = new AudioContextClass();
      let decodedAudio: AudioBuffer;
      try {
        decodedAudio = await audioContext.decodeAudioData(await mediaItem.file.arrayBuffer());
      } finally {
        await audioContext.close().catch(() => undefined);
      }
      if (decodedAudio.numberOfChannels < 1 || decodedAudio.duration <= 0) {
        throw new Error('The browser decoded no audio channels from this clip.');
      }
      setProgressText('Finding silence while protecting word endings…');
      const channels = Array.from({ length: decodedAudio.numberOfChannels }, (_, index) => decodedAudio.getChannelData(index));
      const newSegments = findSmartCutKeepRanges(channels, decodedAudio.sampleRate, sourceStart, sourceEnd);
      if (newSegments.length === 0) throw new Error('The selected clip has no analyzable duration.');
      
      useEditorStore.getState().removeSegment('video-1', firstSeg.id);
      
      let timelineCursor = firstSeg.start;
      for (const seg of newSegments) {
        const dur = seg.end - seg.start;
        useEditorStore.getState().addSegment('video-1', {
          ...firstSeg,
          id: Math.random().toString(36).substr(2, 9),
          start: timelineCursor,
          end: timelineCursor + dur,
          duration: dur,
          sourceStart: seg.start,
        });
        timelineCursor += dur;
      }
      trackEvent('smart_cut_completed', {
        removed_section_count: Math.max(0, newSegments.length - 1),
        resulting_clip_count: newSegments.length,
        device: window.innerWidth < 1280 ? 'responsive' : 'desktop'
      });
      
    } catch(err) {
      console.error(err);
      const detail = getErrorMessage(err);
      trackEvent('smart_cut_failed', { device: window.innerWidth < 1280 ? 'responsive' : 'desktop', reason: detail.slice(0, 120) });
      toast(`Smart Cut could not decode this clip’s audio. The file is ${mediaItem.file.type || 'an unknown media type'} and ${Math.round(mediaItem.file.size / 1024 / 1024)} MB. Try Chrome with an MP4 (H.264/AAC) or WebM file. Details: ${detail}`);
    } finally {
      setIsProcessing(false);
      setProgressText("");
    }
  };

  const handleAutoCaptions = async () => {
    // On mobile, the recorder can finish while the sidebar sheet is closing.
    // Read the live store rather than this render's earlier Media Library
    // snapshot so a just-recorded File remains available to transcription.
    const liveState = useEditorStore.getState();
    const videoTrack = liveState.tracks.find(t => t.id === 'video-1');
    const audioTrack = liveState.tracks.find(t => t.id === 'audio-1');
    let firstSeg: TrackSegment | null = null;
    let sourceSegments: TrackSegment[] = [];
    let sourceFile: File | null = null;
    let voiceoverSources: VoiceoverCaptionSource[] = [];
    type CaptionSource = { file: File; segments: TrackSegment[]; label: string; src: string };
    let captionSources: CaptionSource[] = [];

    if (captionSource === 'voiceover') {
      const voiceovers = (audioTrack?.segments || [])
        .filter((segment) => segment.type === 'audio' && segment.src)
        .sort((a, b) => a.start - b.start);
      if (voiceovers.length === 0) return toast('Record or add a voiceover first, then choose Voiceover as the caption source.');

      // Treat every voiceover clip as a single timeline source. The previous
      // behavior picked one clip under the playhead, so later narration was
      // silently absent from both the transcript and caption track.
      voiceoverSources = voiceovers.map((segment) => {
        const voiceoverMedia = liveState.mediaLibrary.find(item => item.url === segment.src && item.file);
        return voiceoverMedia?.file ? { segment, file: voiceoverMedia.file } : null;
      }).filter((source): source is VoiceoverCaptionSource => source !== null);
      if (voiceoverSources.length !== voiceovers.length) {
        return toast('Cannot find one or more original voiceover recordings. Please add the missing recording back into Media, then generate captions.');
      }
      // The actual merged file is created after the progress UI is visible.
      sourceFile = voiceoverSources[0].file;
    } else {
      if (!videoTrack || videoTrack.segments.length === 0) return toast('Please add a video to the timeline first!');
      const timelineSegments = [...videoTrack.segments]
        .filter(segment => segment.type === 'video' && segment.src)
        .sort((a, b) => a.start - b.start);
      if (timelineSegments.length === 0) return toast('Please add a video with its original file to the timeline first!');
      firstSeg = timelineSegments[0];
      const groups = new Map<string, TrackSegment[]>();
      timelineSegments.forEach(segment => {
        const key = segment.src as string;
        groups.set(key, [...(groups.get(key) || []), segment]);
      });
      const missing: string[] = [];
      captionSources = [...groups.entries()].map(([src, segments]) => {
        const mediaItem = liveState.mediaLibrary.find(m => m.url === src && m.file)
          || liveState.mediaLibrary.find(m => m.name === segments[0].name && m.file);
        if (!mediaItem?.file) {
          missing.push(segments[0].name || 'video');
          return null;
        }
        return { file: mediaItem.file, segments, label: mediaItem.name || segments[0].name || 'video', src };
      }).filter((source): source is CaptionSource => source !== null);
      if (missing.length > 0) return toast(`Cannot find original file${missing.length === 1 ? '' : 's'} for: ${missing.join(', ')}. Add the original file${missing.length === 1 ? '' : 's'} back into Media, then try again.`);
      sourceSegments = timelineSegments;
    }

    setIsProcessing(true);
    setProgressText('Preparing your video for captions…');
    trackEvent('captions_started', {
      source: captionSource,
      source_count: captionSource === 'voiceover' ? voiceoverSources.length : captionSources.length
    });

    try {
      if (captionSource === 'voiceover') {
        setProgressText(`Combining ${voiceoverSources.length} voiceover recording${voiceoverSources.length === 1 ? '' : 's'}…`);
        sourceFile = await buildVoiceoverTimelineForCaptions(voiceoverSources);
        const timelineEnd = Math.max(...voiceoverSources.map(({ segment }) => Number(segment.end) || 0), 0.1);
        firstSeg = { id: 'voiceover-caption-timeline', trackId: 'audio-1', type: 'audio', start: 0, end: timelineEnd, duration: timelineEnd, sourceStart: 0, src: 'voiceover-timeline' };
        sourceSegments = [firstSeg];
        captionSources = [{ file: sourceFile, segments: sourceSegments, label: 'voiceover timeline', src: firstSeg.src || 'voiceover-timeline' }];
      }

      // Each original file is transcribed separately, then its words are
      // placed on every matching clip in timeline order. This keeps captions
      // working across several uploaded clips without losing trim offsets.
      const maxCaptionUploadBytes = 240 * 1024 * 1024;
      const transcribeSource = async (source: CaptionSource, index: number) => {
        if (source.file.size > maxCaptionUploadBytes) {
          const sizeInGb = (source.file.size / 1024 / 1024 / 1024).toFixed(2);
          throw new Error(`${source.label} is ${sizeInGb} GB. Auto Captions currently supports sources up to 240 MB per video.`);
        }
        const sourceCount = captionSources.length;
        setProgressText(`Preparing clip ${index + 1} of ${sourceCount} for captions…`);
        const formData = new FormData();
        formData.append('file', source.file);
        return await new Promise<TranscriptionData>((resolve, reject) => {
        const request = new XMLHttpRequest();
        request.open('POST', '/api/backend-transcribe');
        request.responseType = 'text';
        request.upload.onprogress = (event) => {
          if (!event.lengthComputable) return;
          const percent = Math.min(100, Math.round((event.loaded / event.total) * 100));
          setProgressText(`Uploading clip ${index + 1} of ${sourceCount} for captions… ${percent}%`);
        };
        request.upload.onload = () => setProgressText(`Clip ${index + 1} of ${sourceCount} uploaded. Transcribing speech…`);
        request.onerror = () => reject(new Error('Caption upload could not reach the server. Please check your connection and try again.'));
        request.onload = () => {
          let response: TranscriptionData | null = null;
          try { response = request.responseText ? JSON.parse(request.responseText) as TranscriptionData : null; } catch {}
          if (request.status < 200 || request.status >= 300) {
            reject(new Error(response?.error || `Caption generation failed (${request.status}). Please try again.`));
            return;
          }
          resolve(response || {});
        };
        request.send(formData);
        });
      };

      const transcriptions: Array<{ source: CaptionSource; data: TranscriptionData }> = [];
      for (let index = 0; index < captionSources.length; index++) {
        const source = captionSources[index];
        const data = await transcribeSource(source, index);
        if (data?.error) throw new Error(data.error);
        transcriptions.push({ source, data });
      }

      if (transcriptions.some(({ data }) => data?.transcription?.words)) {
        const state = useEditorStore.getState();
        
        state.setTranscriptionText(transcriptions.map(({ data }) => data.transcription?.text || '').filter(Boolean).join('\n\n'));

        // Remove existing auto-captions to prevent overlapping duplicates
        const textTrack = state.tracks.find(t => t.id === 'text-1');
        if (textTrack) state.saveHistory();

        // Map words to the edited timeline first, then show short phrases.
        // Rendering every Whisper word as a separate text layer caused adjacent
        // timestamps to overlap and made longer transcripts unreadable.
        const timedWords: TranscriptWord[] = [];

        transcriptions.forEach(({ source, data }) => {
          [...(data.transcription?.words || [])]
            .filter((word) => Number.isFinite(word.start) && Number.isFinite(word.end) && word.word?.trim())
            .sort((a, b) => a.start - b.start)
            .forEach((word) => {
            // Whisper occasionally marks a spoken word with identical start
            // and end values. Keep it visible instead of silently dropping it.
            const wordEnd = Math.max(word.end, word.start + 0.12);
            const segment = source.segments.find(seg => {
              const sourceStart = seg.sourceStart ?? 0;
              const sourceEnd = sourceStart + seg.duration;
              return word.start < sourceEnd + 0.03 && wordEnd > sourceStart - 0.03;
            });
            if (!segment) return; // The word was removed by an edit.

            const sourceStart = segment.sourceStart ?? 0;
            const start = Math.max(segment.start, segment.start + (Math.max(word.start, sourceStart) - sourceStart));
            const end = Math.min(segment.end, segment.start + (Math.min(wordEnd, sourceStart + segment.duration) - sourceStart));
            if (end > start) timedWords.push({ id: crypto.randomUUID(), text: word.word.trim(), start, end, segmentId: segment.id, sourceSrc: source.src });
          });
        });
        timedWords.sort((a, b) => a.start - b.start);
        state.setTranscriptionWords(timedWords);

        type CaptionPhrase = { words: string[]; start: number; end: number; segmentId: string; sourceSrc: string };
        const phrases: CaptionPhrase[] = [];
        let phrase: CaptionPhrase | null = null;
        const finishPhrase = () => { if (phrase) phrases.push(phrase); phrase = null; };

        timedWords.forEach(word => {
          const hasPause = phrase ? word.start - phrase.end > 0.6 : false;
          const startsNewClip = phrase ? word.segmentId !== phrase.segmentId : false;
          if (phrase && (hasPause || startsNewClip || phrase.words.length >= 3)) finishPhrase();
          if (!phrase) phrase = { words: [], start: word.start, end: word.end, segmentId: word.segmentId, sourceSrc: word.sourceSrc };
          phrase.words.push(word.text);
          phrase.end = Math.max(phrase.end, word.end);
          if (/[.!?]$/.test(word.text)) finishPhrase();
        });
        finishPhrase();

        let firstCaptionId: string | null = null;
        let previousEnd = -Infinity;
        const newCaptionSegments: TrackSegment[] = [];
        phrases.forEach((caption, index) => {
          const nextStart = phrases[index + 1]?.start ?? Infinity;
          const start = Math.max(caption.start, previousEnd + 0.02);
          const end = Math.max(start + 0.12, Math.min(caption.end, nextStart - 0.02));
          previousEnd = end;
          const newId = Math.random().toString(36).substr(2, 9);
          if (!firstCaptionId) firstCaptionId = newId;
          newCaptionSegments.push({
            id: newId, trackId: 'text-1', start, end, duration: end - start,
            type: 'text', name: 'Caption', text: caption.words.join(' '), src: caption.sourceSrc,
            color: '#FFD700', fontSize: 48, y: 80
          });
        });

        // Commit captions once. Repeated addSegment calls save an entire undo
        // snapshot each time, which made long-video caption generation slow.
        useEditorStore.setState(current => ({
          tracks: current.tracks.map(track => track.id === 'text-1'
            ? { ...track, segments: [...track.segments.filter(segment => segment.name !== 'Caption'), ...newCaptionSegments] }
            : track)
        }));
        
        if (firstCaptionId) {
          state.selectSegment(firstCaptionId);
        }
        trackEvent('captions_completed', { caption_count: newCaptionSegments.length });
        toast('Transcription completed. Your captions are ready to review.');
      }
    } catch (err: unknown) {
      console.error(err);
      trackEvent('captions_failed', { source: captionSource });
      toast(`Error generating captions: ${getErrorMessage(err)}`);
    } finally {
      setIsProcessing(false);
      setProgressText("");
    }
  };

  const handleBRoll = async () => {
    setIsProcessing(true);
    setProgressText('AI is fetching B-Roll clips...');
    try {
      const state = useEditorStore.getState();
      const textTrack = state.tracks.find(t => t.id === 'text-1');
      const captions = textTrack?.segments.filter(s => s.name === 'Caption').map(s => ({
        word: s.text,
        start: s.start,
        end: s.end
      })) || [];

      if (captions.length === 0) {
        toast("Please generate Auto Captions first so the AI knows what B-Roll to fetch!");
        return;
      }

      const res = await fetch('/api/b-roll', {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ captions })
      });
      
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      if (data.segments && data.segments.length > 0) {
        (data.segments as BrollSuggestion[]).forEach((seg) => {
          if (seg.videoUrl) {
            useEditorStore.getState().addSegment('video-1', {
              id: Math.random().toString(36).substr(2, 9),
              trackId: 'video-1',
              start: seg.start,
              end: seg.end,
              duration: seg.end - seg.start,
              type: 'video',
              name: `B-Roll: ${seg.query}`,
              src: seg.videoUrl
            });
          }
        });
      } else {
        toast("No suitable B-Roll moments found for this script.");
      }
    } catch (err: unknown) {
      console.error(err);
      toast(`B-Roll Error: ${getErrorMessage(err)}`);
    } finally {
      setIsProcessing(false);
      setProgressText("");
    }
  };

  return (
    <div className="w-full md:w-64 bg-neutral-900 border-r border-neutral-800 flex flex-col h-full rounded-l-2xl overflow-hidden shadow-2xl">
      
      {/* Top Nav */}
      <div className="h-16 flex border-b border-neutral-800 bg-neutral-950 px-1 items-center gap-0.5 overflow-hidden">
        {TABS.map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(currentTab => currentTab === tab.id ? '' : tab.id)}
            className={`flex-1 min-w-0 h-12 flex flex-col items-center justify-center rounded-lg transition-colors ${
              activeTab === tab.id 
                ? 'bg-indigo-600/20 text-indigo-400' 
                : 'text-neutral-500 hover:text-neutral-300 hover:bg-white/5'
            }`}
          >
            <tab.icon className="w-5 h-5 mb-1" />
            <span className="text-[8px] font-bold uppercase tracking-wide" title={tab.id === 'transitions' ? 'Transitions' : tab.label}>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Progress Overlay */}
      {isProcessing && (
        <div className="absolute inset-0 z-50 bg-black/80 flex flex-col items-center justify-center p-4 text-center">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-white font-bold">{progressText}</p>
        </div>
      )}

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        {activeTab === 'media' && (
          <div className="space-y-4">
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*,video/*"
              onChange={handleFileUpload} 
              multiple 
            />
            <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">1. SELECT MEDIA</h3>
            <div className="flex gap-2 w-full">
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 p-3 border-2 border-dashed border-neutral-700 hover:border-indigo-500 rounded-xl flex flex-col items-center justify-center gap-1 text-neutral-300 hover:text-indigo-400 transition-colors bg-neutral-950/50"
              >
                <span className="text-xl font-bold leading-none">+</span>
                <span className="text-xs font-bold text-center">Import</span>
              </button>
              <button 
                onClick={() => setIsCameraModalOpen(true)}
                className="flex-1 p-3 border-2 border-dashed border-neutral-700 hover:border-indigo-500 rounded-xl flex flex-col items-center justify-center gap-1 text-neutral-300 hover:text-indigo-400 transition-colors bg-neutral-950/50"
              >
                <Camera className="w-5 h-5" />
                <span className="text-xs font-bold text-center">Record</span>
              </button>
            </div>
            
            {mediaLibrary.length > 0 && (
              <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wider mt-6 mb-2">2. Tap a clip to add it to your timeline</h3>
            )}
            
            <div className="grid grid-cols-2 gap-3">
              {mediaLibrary.map((item) => (
                <div 
                  key={item.id} 
                  draggable={!isTouchWorkspace}
                  onDragStart={(e) => handleDragStart(e, { type: 'media', item })}
                  onClick={() => handleMediaClick(item)}
                  className="aspect-video bg-neutral-800 rounded-lg overflow-hidden relative group cursor-pointer border border-transparent hover:border-indigo-500 transition-colors"
                >
                  <div className="w-full h-full bg-neutral-900 border border-neutral-800 rounded-lg flex items-center justify-center overflow-hidden relative">
                    {item.type === 'video' ? (
                      <>
                        {item.thumbnailUrl ? (
                           <NextImage unoptimized src={item.thumbnailUrl} alt="" width={320} height={180} className="w-full h-full object-cover pointer-events-none" />
                        ) : (
                           <video src={`${item.url}#t=0.1`} preload="metadata" muted playsInline className="w-full h-full object-cover pointer-events-none" />
                        )}
                      </>
                    ) : item.type === 'image' ? (
                      <NextImage unoptimized src={item.url} alt="" width={320} height={180} className="w-full h-full object-cover pointer-events-none" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-neutral-800">
                        <FileAudio className="w-6 h-6 text-neutral-600" />
                      </div>
                    )}
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/40 transition-opacity">
                    <span className="text-xs text-white font-bold bg-indigo-600 px-2 py-1 rounded">Add</span>
                  </div>
                  <button 
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      removeMediaItem(item.id); 
                      const updatedLibrary = useEditorStore.getState().mediaLibrary.filter(i => i.id !== item.id);
                      set('nexuscut-media', updatedLibrary).catch(err => console.error('Failed to update IDB', err));
                    }}
                    className="absolute top-1 right-1 p-1 bg-black/60 rounded text-neutral-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Delete Media"
                  >
                    <X className="w-3 h-3" />
                  </button>
                  <div className="absolute bottom-1 right-1 bg-black/60 px-1.5 py-0.5 rounded text-[10px] text-white font-mono truncate max-w-[80%] pointer-events-none">
                    {item.name}
                  </div>
                </div>
              ))}
              
              {mediaLibrary.length === 0 && (
                <div className="col-span-2 text-center text-xs text-neutral-600 py-4">
                  No media imported yet
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'magic' && (
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-4">AI Tools</h3>
            
            <button 
              onClick={handleSmartCut}
              className="w-full text-left p-4 bg-neutral-950 border border-neutral-800 hover:border-indigo-500 rounded-xl transition-colors group"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <Scissors className="w-4 h-4" />
                </div>
                <span className="font-bold text-white group-hover:text-indigo-400 transition-colors">Smart Cut</span>
              </div>
              <p className="text-xs text-neutral-500">Automatically remove silences and dead space.</p>
            </button>

            <button
              onClick={() => setIsScriptCutOpen(true)}
              className="w-full text-left p-4 bg-neutral-950 border border-neutral-800 hover:border-violet-500 rounded-xl transition-colors group"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center text-violet-400">
                  <FileAudio className="w-4 h-4" />
                </div>
                <span className="font-bold text-white group-hover:text-violet-300 transition-colors">Nexus ScriptCut</span>
                <span className="ml-auto rounded border border-amber-500/30 bg-amber-500/15 px-1.5 py-0.5 text-[9px] font-black tracking-wider text-amber-300">PRO</span>
              </div>
              <p className="text-xs text-neutral-500">Edit video by deleting transcript words, with optional filler and repetition suggestions.</p>
            </button>

            <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-3">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-neutral-500">Caption source</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setCaptionSource('original')}
                  className={`rounded-lg border px-2 py-2 text-xs font-semibold transition-colors ${captionSource === 'original' ? 'border-rose-500 bg-rose-500/15 text-white' : 'border-neutral-800 bg-black text-neutral-400 hover:text-white'}`}
                >
                  Original video
                </button>
                <button
                  onClick={() => setCaptionSource('voiceover')}
                  className={`rounded-lg border px-2 py-2 text-xs font-semibold transition-colors ${captionSource === 'voiceover' ? 'border-rose-500 bg-rose-500/15 text-white' : 'border-neutral-800 bg-black text-neutral-400 hover:text-white'}`}
                >
                  Voiceover
                </button>
              </div>
              {captionSource === 'voiceover' && <p className="mt-2 text-[11px] leading-4 text-neutral-500">All voiceover recordings on the Audio track are combined and captioned in timeline order.</p>}
            </div>

            <button 
              onClick={handleAutoCaptions}
              className="w-full text-left p-4 bg-neutral-950 border border-neutral-800 hover:border-rose-500 rounded-xl transition-colors group"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-rose-500/20 flex items-center justify-center text-rose-400">
                  <Type className="w-4 h-4" />
                </div>
                <span className="font-bold text-white group-hover:text-rose-400 transition-colors">Auto Captions</span>
              </div>
              <p className="text-xs text-neutral-500">Generate subtitles from the selected source.</p>
            </button>

            <button 
              onClick={handleBRoll}
              className="w-full text-left p-4 bg-neutral-950 border border-neutral-800 hover:border-emerald-500 rounded-xl transition-colors group"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Layers className="w-4 h-4" />
                </div>
                <span className="font-bold text-white group-hover:text-emerald-400 transition-colors">Pexels B-Roll Suggestions</span>
              </div>
              <p className="text-xs text-neutral-500">Use captions to search Pexels for suggested portrait stock clips. Review every result before export.</p>
            </button>

            {transcriptionText && (
              <div className="mt-4 p-4 bg-neutral-950 border border-neutral-800 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-2">
                    <FileAudio className="w-4 h-4 text-rose-400" />
                    Raw Transcription
                  </h3>
                </div>
                <textarea 
                  value={transcriptionText}
                  onChange={(e) => setTranscriptionText(e.target.value)}
                  className="w-full h-40 bg-black border border-neutral-800 rounded-lg p-3 text-white text-sm focus:border-rose-500 focus:outline-none resize-y transition-colors custom-scrollbar"
                  placeholder="Transcription text will appear here..."
                />
                <button 
                  onClick={() => {
                    const blob = new Blob([transcriptionText], { type: 'text/plain' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'transcription.txt';
                    a.click();
                  }}
                  className="w-full mt-2 py-2 bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold rounded transition-colors"
                >
                  Download Transcript
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'transitions' && (
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-4">Transitions</h3>
            <div className="grid grid-cols-2 gap-3">
              {['Dip to Black'].map((trans, i) => (
                <div 
                  key={i}
                  draggable
                  onDragStart={(e) => handleDragStart(e, { type: 'transition', name: trans })}
                  onClick={() => {
                    const videoTrack = tracks.find(t => t.id === 'video-1');
                    if (!videoTrack || videoTrack.segments.length === 0) return toast('Add a video segment to apply a transition to.');
                    const target = videoTrack.segments.find(segment => segment.id === selectedSegmentId)
                      || videoTrack.segments.find(segment => currentTime >= segment.start && currentTime < segment.end)
                      || videoTrack.segments[0];
                    useEditorStore.getState().updateSegment('video-1', target.id, { transitionOut: { type: trans, duration: 0.5 } });
                    
                    toast(`Transition "${trans}" applied!`);
                  }}
                  className="p-3 bg-neutral-800 rounded-lg cursor-grab active:cursor-grabbing border border-transparent hover:border-amber-500 text-center transition-colors"
                >
                  <Shuffle className="w-6 h-6 text-amber-400 mx-auto mb-2" />
                  <span className="text-xs font-bold text-white">{trans}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'effects' && (
          <div className="space-y-3">
            <div>
              <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Video effects</h3>
              <p className="mt-2 text-xs leading-5 text-neutral-400">Select a clip, then choose a look. Effects appear in the preview and in your export.</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { name: 'Original', value: 'none', preview: 'bg-neutral-700' },
                { name: 'Black & White', value: 'mono', preview: 'bg-gradient-to-br from-neutral-100 to-neutral-800' },
                { name: 'Warm', value: 'warm', preview: 'bg-gradient-to-br from-orange-300 to-amber-800' },
                { name: 'Cool', value: 'cool', preview: 'bg-gradient-to-br from-cyan-300 to-blue-800' },
                { name: 'High Contrast', value: 'contrast', preview: 'bg-gradient-to-br from-white via-neutral-700 to-black' },
              ].map((effect) => (
                <button
                  key={effect.value}
                  onClick={() => {
                    const videoTrack = tracks.find(track => track.type === 'video');
                    const clip = videoTrack?.segments.find(segment => segment.id === selectedSegmentId)
                      || videoTrack?.segments.find(segment => currentTime >= segment.start && currentTime < segment.end);
                    if (!clip || !videoTrack) return toast('Select a video clip first, then choose an effect.');
                    updateSegment(videoTrack.id, clip.id, { visualEffect: effect.value as 'none' | 'mono' | 'warm' | 'cool' | 'contrast' });
                    selectSegment(clip.id);
                  }}
                  className="overflow-hidden rounded-lg border border-neutral-700 bg-neutral-800 text-left transition-colors hover:border-violet-400"
                >
                  <div className={`h-14 ${effect.preview}`} />
                  <span className="block p-2 text-xs font-bold text-white">{effect.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'text' && (
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-4">Text & Titles</h3>
            <div className="grid grid-cols-3 gap-2">
              {(['Headline', 'Subtitle', 'Body Text'] as const).map((title, i) => (
                <button 
                  key={i}
                  onClick={() => {
                    const defaults = {
                      'Headline': { fontSize: 80, y: 30, text: 'NEW HEADLINE', fontFamily: 'Oswald', bold: true },
                      'Subtitle': { fontSize: 40, y: 50, text: 'Subtitle Text', fontFamily: 'Montserrat', bold: false },
                      'Body Text': { fontSize: 24, y: 70, text: 'Body text goes here...', fontFamily: 'Inter', bold: false }
                    };
                    const settings = defaults[title];
                    
                    const { addSegment, addTrack, tracks, currentTime, selectSegment } = useEditorStore.getState();
                    
                    const trackId = title === 'Headline' ? 'text-1' : title === 'Subtitle' ? 'text-2' : 'text-3';
                    const targetTrack = tracks.find(t => t.id === trackId);
                    
                    if (!targetTrack) {
                      addTrack({ id: trackId, type: 'text', name: title, segments: [] });
                    }
                    
                    const newId = Math.random().toString(36).substr(2, 9);
                    addSegment(trackId, {
                      id: newId,
                      trackId: trackId,
                      start: currentTime,
                      end: currentTime + 5,
                      duration: 5,
                      type: 'text',
                      name: title,
                      ...settings,
                      x: 50,
                    });
                    selectSegment(newId);
                    
                    if (onMobileActionComplete) {
                      onMobileActionComplete('add_text');
                    }
                  }}
                  className="w-full text-center p-3 bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors group flex flex-col items-center gap-1 border border-transparent hover:border-rose-500"
                >
                  <div className="w-8 h-8 bg-rose-500/20 rounded-full flex items-center justify-center text-rose-400 font-bold mb-1">
                    <TypeIcon className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-[10px] text-white group-hover:text-rose-400 transition-colors uppercase tracking-wider">{title}</span>
                </button>
              ))}
            </div>

            <button 
              onClick={() => setIsCaptionEditorOpen(true)}
              className="w-full mt-4 p-4 bg-neutral-950 border border-neutral-800 hover:border-indigo-500 rounded-xl transition-colors group text-left"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <TypeIcon className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-white group-hover:text-indigo-400 transition-colors">Bulk Edit Captions</span>
                  <div className="text-[10px] text-amber-500 font-bold uppercase mt-1">PRO Feature</div>
                </div>
              </div>
              <p className="text-xs text-neutral-500">Review and edit all generated captions in a single spreadsheet view.</p>
            </button>
          </div>
        )}

        {activeTab === 'audio' && (
          <div className="space-y-6">
            {audioNotice && (
              <div className="flex items-start justify-between gap-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs leading-5 text-emerald-100" role="status">
                <span>{audioNotice}</span>
                <button type="button" onClick={() => setAudioNotice('')} className="min-h-8 min-w-8 rounded-md text-emerald-200 hover:bg-emerald-400/10" aria-label="Dismiss audio message"><X className="mx-auto h-4 w-4" /></button>
              </div>
            )}
            <div className="space-y-3">
              <div>
                <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Audio FX</h3>
                <p className="mt-1 text-xs text-neutral-400">Click an effect to add it at the playhead, or drag it onto the Audio track.</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { name: 'Whoosh', src: '/sounds/whoosh.wav', duration: 1.5 },
                  { name: 'Pop', src: '/sounds/pop.wav', duration: 0.5 },
                  { name: 'Ding', src: '/sounds/ding.wav', duration: 1 },
                  { name: 'Boom', src: '/sounds/boom.wav', duration: 2 },
                ].map((sfx, i) => (
                  <div
                    key={i}
                    draggable
                    onDragStart={(e) => handleDragStart(e, { type: 'audio_fx', name: sfx.name, url: sfx.src, duration: sfx.duration })}
                    onClick={() => {
                      if (!prepareAudioTrack('audio-2', 'Audio FX')) return;
                      addSegment('audio-2', {
                        id: Math.random().toString(36).substr(2, 9), trackId: 'audio-2', start: currentTime,
                        end: currentTime + sfx.duration, duration: sfx.duration, type: 'audio', name: sfx.name, src: sfx.src
                      });
                    }}
                    className="p-2 bg-neutral-800 rounded-lg cursor-grab active:cursor-grabbing border border-transparent hover:border-emerald-500 flex items-center gap-2 transition-colors"
                  >
                    <div className="w-6 h-6 bg-neutral-900 rounded flex items-center justify-center text-emerald-400"><Music className="w-3 h-3" /></div>
                    <span className="text-[10px] font-bold text-white">{sfx.name}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-xl border border-indigo-500/30 bg-indigo-500/10 p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-300"><Mic className="h-4 w-4" /></div>
                <div><h3 className="text-sm font-bold text-white">Record voiceover</h3><p className="mt-1 text-xs leading-5 text-neutral-300">Place the playhead where narration should begin, then record while the video plays. Your voiceover is added to the Audio track automatically.</p></div>
              </div>
              <button onClick={() => isRecordingVoiceover ? stopVoiceover() : startVoiceover()} className={`mt-4 flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-bold text-white transition-colors ${isRecordingVoiceover ? 'bg-rose-600 hover:bg-rose-500' : 'bg-indigo-600 hover:bg-indigo-500'}`}>
                {isRecordingVoiceover ? <><Square className="h-4 w-4 fill-current" /> Stop recording</> : <><Mic className="h-4 w-4" /> Record voiceover</>}
              </button>
              <button
                type="button"
                disabled={!selectedVideoClip || isRecordingVoiceover}
                onClick={() => selectedVideoClip && updateSegment(selectedVideoClip.trackId, selectedVideoClip.segment.id, { volume: selectedVideoIsMuted ? 1 : 0 })}
                className={`mt-2 flex w-full items-center justify-center gap-2 rounded-lg border py-2.5 text-sm font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${selectedVideoIsMuted ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-200 hover:bg-emerald-500/25' : 'border-neutral-700 bg-neutral-900 text-neutral-200 hover:border-rose-500/60 hover:bg-rose-500/10 hover:text-rose-200'}`}
              >
                {selectedVideoIsMuted ? <><Volume2 className="h-4 w-4" /> Restore selected video audio</> : <><VolumeX className="h-4 w-4" /> Mute selected video audio</>}
              </button>
              <p className="mt-2 text-center text-[11px] leading-4 text-neutral-400">{selectedVideoClip ? 'This changes the selected clip’s audio in the final export.' : 'Select a video clip on the timeline first, then mute its original audio.'}</p>
              {isRecordingVoiceover && <p className="mt-2 text-center text-xs font-semibold text-rose-300">Recording from the current playhead…</p>}
              {voiceoverError && <p className="mt-2 text-xs leading-5 text-rose-300">{voiceoverError}</p>}
            </div>
            <div className="space-y-3 border-t border-neutral-800 pt-4">
              <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wider">AI Voice (TTS)</h3>
              <textarea 
                value={ttsText}
                onChange={(e) => setTtsText(e.target.value)}
                placeholder="Enter text for AI to speak..."
                className="w-full h-20 bg-black border border-neutral-800 rounded-lg p-2 text-white text-xs focus:border-indigo-500 focus:outline-none resize-none transition-colors"
              />
              <div className="flex items-center gap-2">
                <select 
                  value={ttsVoice}
                  onChange={(e) => setTtsVoice(e.target.value)}
                  className="flex-1 bg-black border border-neutral-800 rounded-lg p-2 text-white text-xs focus:border-indigo-500 outline-none"
                >
                  <option value="alloy">Alloy (Neutral)</option>
                  <option value="echo">Echo (Warm)</option>
                  <option value="fable">Fable (British)</option>
                  <option value="onyx">Onyx (Deep)</option>
                  <option value="nova">Nova (Bright)</option>
                  <option value="shimmer">Shimmer (Soft)</option>
                </select>
                  <button 
                    disabled={isGeneratingTts || !ttsText}
                    onClick={async () => {
                      if (!prepareAudioTrack('audio-1', 'AI voice')) return;
                      setIsGeneratingTts(true);
                    setProgressText('Generating Voice...');
                    try {
                      const res = await fetch('/api/tts', {
                        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: ttsText, voice: ttsVoice })
                      });
                      if (!res.ok) throw new Error("TTS generation failed");
                      const blob = await res.blob();
                      const narrationFile = new File([blob], `NexusCut narration ${Date.now()}.mp3`, { type: blob.type || 'audio/mpeg' });
                      const url = URL.createObjectURL(narrationFile);
                      
                      const audio = new Audio(url);
                      audio.onloadedmetadata = () => {
                        const duration = audio.duration || 5;
                        const narration: MediaItem = {
                          id: Math.random().toString(36).substr(2, 9),
                          url,
                          type: 'audio',
                          name: narrationFile.name,
                          file: narrationFile,
                          duration,
                        };
                        addMediaItem(narration);
                        set('nexuscut-media', [...useEditorStore.getState().mediaLibrary, narration]).catch(err => console.error('Failed to save narration', err));
                        const start = resolveVoiceoverStart(useEditorStore.getState().currentTime);
                        addSegment('audio-1', {
                          id: Math.random().toString(36).substr(2, 9),
                          trackId: 'audio-1',
                          start,
                          end: start + duration,
                          duration: duration,
                          type: 'audio',
                          name: narrationFile.name,
                          src: url
                        });
                      };
                    } catch (err: unknown) {
                      toast("TTS failed: " + getErrorMessage(err));
                    } finally {
                      setIsGeneratingTts(false);
                      setProgressText('');
                    }
                  }}
                  className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white p-2 rounded-lg transition-colors flex items-center justify-center shrink-0"
                >
                  {isGeneratingTts ? <span className="text-xs font-bold px-2">Wait</span> : <Wand2 className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>

      <CaptionEditorModal 
        isOpen={isCaptionEditorOpen} 
        onClose={() => setIsCaptionEditorOpen(false)} 
      />

      <ScriptCutModal
        isOpen={isScriptCutOpen}
        onClose={() => setIsScriptCutOpen(false)}
      />

      <CameraRecorderModal
        isOpen={isCameraModalOpen}
        onClose={() => setIsCameraModalOpen(false)}
        onRecordFinish={handleCameraRecordFinish}
      />
    </div>
  );
}
