"use client";

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { toast } from '@/lib/toast';
import Sidebar from './Editor/Sidebar';
import Canvas from './Editor/Canvas';
import Timeline from './Editor/Timeline/Timeline';
import PropertiesPanel from './Editor/PropertiesPanel';
import TransitionModal from './Editor/TransitionModal';
import MobileBottomSheet from './Editor/MobileBottomSheet';
import MobileActionBar from './Editor/MobileActionBar';
import { useEditorStore, Track, TrackSegment, TranscriptWord } from '@/store/useEditorStore';
import { Undo, Redo, UploadCloud, User, Sparkles, Save, Upload, Trash2, BookOpen, Crown, MessageSquare, X, Briefcase } from 'lucide-react';
import GrowthModeWizard from './Editor/GrowthModeWizard';
import FeedbackModal from './Editor/FeedbackModal';
import { trackEvent } from '@/lib/analytics';
import { useRouter } from 'next/navigation';

type ExportSubmission = { jobId?: string; queuePosition?: number; error?: string; code?: string };
type ExportStatus = { status?: string; queuePosition?: number; progress?: number; stage?: string; error?: string };
type SavedGrowthOption = { sourceName?: string; source?: string; [key: string]: unknown };
type SavedEmbeddedMedia = { id: string; name: string; mimeType: string; duration?: number; dataUrl: string };
type SavedProject = { version?: number; tracks?: Track[]; growthOptions?: SavedGrowthOption[]; transcriptionText?: string; transcriptionWords?: TranscriptWord[]; embeddedMedia?: SavedEmbeddedMedia[] };
type AccountSummary = { authenticated: boolean; email: string | null; planTier: string };
const getErrorMessage = (error: unknown) => error instanceof Error ? error.message : String(error);

function ResponsiveCanvas({ mobile }: { mobile: boolean }) {
  const [isMobile, setIsMobile] = useState<boolean | null>(null);
  useEffect(() => {
    // Keep the full desktop workspace for proper desktop widths. iPads in
    // landscape are otherwise just wide enough to trigger the desktop shell,
    // where its panels become too tight to use.
    const query = window.matchMedia('(max-width: 1279px)');
    const update = () => setIsMobile(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);
  // Only mount one Canvas. A CSS-hidden canvas still creates media elements
  // and wastes scarce mobile memory even when it cannot drive playback.
  return isMobile === mobile ? <Canvas /> : null;
}

export default function VideoEditor() {
  const router = useRouter();
  const { 
    undo, redo, past, future, projectName, setProjectName, tracks, mediaLibrary, aspectRatio, setAspectRatio, frameMode, setFrameMode, transcriptionText, transcriptionWords,
    transitionModalOpen, setTransitionModalOpen, transitionModalType, transitionTargetSegmentId, setBrandKit, brandKit,
    brandLogoEnabled, brandLogoPosition, brandLogoSize, brandLogoOpacity,
    setBrandLogoEnabled, setBrandLogoPosition, setBrandLogoSize, setBrandLogoOpacity
  } = useEditorStore();
  const [showGrowthWizard, setShowGrowthWizard] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState<string | null>(null);
  const [exportQuality, setExportQuality] = useState<'fast' | 'high'>('fast');
  const [exportLimitReached, setExportLimitReached] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSidebarSheetOpen, setIsSidebarSheetOpen] = useState(false);
  const [isPropertiesSheetOpen, setIsPropertiesSheetOpen] = useState(false);
  const [isExportSheetOpen, setIsExportSheetOpen] = useState(false);
  const [isShortsSetup, setIsShortsSetup] = useState(() => typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('format') === 'shorts');
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackType, setFeedbackType] = useState<'general' | 'export'>('general');
  const [showStartHere, setShowStartHere] = useState(false);
  const [isSavingLocal, setIsSavingLocal] = useState(false);
  const [projectRestored, setProjectRestored] = useState(false);
  const [account, setAccount] = useState<AccountSummary | null>(null);
  // Non-blocking notifications via the global toast store (replaces alert()).
  const notify = toast;
  const activeUploadRef = useRef<XMLHttpRequest | null>(null);
  const uploadCancelledRef = useRef(false);
  const editorOpenTrackedRef = useRef(false);

  useEffect(() => {
    if (editorOpenTrackedRef.current) return;
    editorOpenTrackedRef.current = true;
    trackEvent('editor_opened', {
      layout: window.matchMedia('(max-width: 1279px)').matches ? 'mobile_tablet' : 'desktop'
    });
  }, []);

  useEffect(() => {
    fetch('/api/user/me', { cache: 'no-store' })
      .then(response => response.json())
      .then(async (data: { authenticated?: boolean; email?: string | null; planTier?: string }) => {
        const summary = { authenticated: Boolean(data.authenticated), email: data.email || null, planTier: data.planTier || 'free' };
        setAccount(summary);
        if (summary.planTier === 'pro' || summary.planTier === 'agency') {
          const response = await fetch('/api/brand-kit', { cache: 'no-store' });
          const result = await response.json();
          setBrandKit(response.ok ? result.brandKit || null : null);
        } else setBrandKit(null);
      })
      .catch(() => setAccount({ authenticated: false, email: null, planTier: 'free' }));
  }, [setBrandKit]);

  const cancelUpload = () => {
    if (!activeUploadRef.current) return;
    uploadCancelledRef.current = true;
    activeUploadRef.current.abort();
    activeUploadRef.current = null;
    setExportStatus(null);
    setIsExporting(false);
  };

  const openGrowthMode = () => {
    if (!account) {
      notify('NexusCut is still checking your membership. Please try again in a moment.', 'error');
      return;
    }
    if (!['pro', 'agency'].includes(account.planTier)) {
      notify(`Growth Mode is a Pro feature. This account is currently on the ${account.planTier} plan.`, 'error');
      router.push('/pricing#pro-tier');
      return;
    }
    setShowGrowthWizard(true);
  };

  // A phone editor must not rely on an easily missed desktop-only save button.
  // Keep the timeline (including captions) safe in this browser after each edit.
  // Source files remain in IndexedDB and are reconnected by the Media library.
  useEffect(() => {
    try {
      const saved = localStorage.getItem('nexuscut-project-autosave-v1');
      if (saved) {
        const data = JSON.parse(saved);
        if (Array.isArray(data.tracks)) {
          useEditorStore.getState().setTracks(data.tracks);
          if (typeof data.transcriptionText === 'string') useEditorStore.getState().setTranscriptionText(data.transcriptionText);
          if (Array.isArray(data.transcriptionWords)) useEditorStore.getState().setTranscriptionWords(data.transcriptionWords);
          if (typeof data.projectName === 'string') setProjectName(data.projectName);
          if (data.aspectRatio === '9:16' || data.aspectRatio === '16:9' || data.aspectRatio === '1:1') setAspectRatio(data.aspectRatio);
          if (data.frameMode === 'fit' || data.frameMode === 'fill') setFrameMode(data.frameMode);
        }
      }
    } catch (error) {
      console.warn('Could not restore the local project backup.', error);
    } finally {
      setProjectRestored(true);
    }
  }, [setAspectRatio, setFrameMode, setProjectName]);

  useEffect(() => {
    if (!projectRestored) return;
    try {
      localStorage.setItem('nexuscut-project-autosave-v1', JSON.stringify({ version: 2, tracks, projectName, aspectRatio, frameMode, transcriptionText, transcriptionWords }));
    } catch (error) {
      console.warn('Could not save the local project backup.', error);
    }
  }, [projectRestored, tracks, projectName, aspectRatio, frameMode, transcriptionText, transcriptionWords]);

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('format') === 'shorts') {
      setAspectRatio('9:16');
    }
  }, [setAspectRatio]);

  useEffect(() => {
    const handleSegmentTap = () => {
      setIsPropertiesSheetOpen(true);
      setIsSidebarSheetOpen(false);
    };
    window.addEventListener('segment_tapped', handleSegmentTap);
    return () => window.removeEventListener('segment_tapped', handleSegmentTap);
  }, []);

  const handleMobileAction = (action: 'add_media' | 'add_text') => {
    if (action === 'add_media') {
      setIsSidebarSheetOpen(false);
    } else if (action === 'add_text') {
      setIsSidebarSheetOpen(false);
      setIsPropertiesSheetOpen(true);
    }
  };

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
      notify("Project successfully synced to the cloud!");
    } catch (err: unknown) {
      notify(getErrorMessage(err), 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleLocalSave = async () => {
    setIsSavingLocal(true);
    try {
      const growthOptions: SavedGrowthOption[] = [];
      for (let index = 0; index < sessionStorage.length; index++) {
        const key = sessionStorage.key(index);
        if (!key?.startsWith('nexuscut-growth-options:')) continue;
        try { growthOptions.push(JSON.parse(sessionStorage.getItem(key) || '') as SavedGrowthOption); } catch {}
      }
      // Original imported media remains external so project files stay small.
      // Voiceovers recorded inside NexusCut have no external original to relink,
      // so embed those assets in the portable project file.
      const recordedVoiceovers = mediaLibrary.filter(item => item.file && item.type === 'audio' && /^Voiceover(?:_|\s|$)/i.test(item.name));
      const embeddedMedia = await Promise.all(recordedVoiceovers.map(item => new Promise<SavedEmbeddedMedia>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve({
          id: item.id,
          name: item.name,
          mimeType: item.file?.type || 'audio/webm',
          duration: item.duration,
          dataUrl: String(reader.result || ''),
        });
        reader.onerror = () => reject(reader.error || new Error(`Could not preserve ${item.name}`));
        reader.readAsDataURL(item.file as File);
      })));
      const data = JSON.stringify({ version: 4, tracks, growthOptions, transcriptionText, transcriptionWords, embeddedMedia });
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${projectName.replace(/\s+/g, '_')}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      notify(`NexusCut could not save this project: ${getErrorMessage(error)}`, 'error');
    } finally {
      setIsSavingLocal(false);
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    // The original video must travel from the creator's device before an
    // export can enter the VPS queue. Calling this "in queue" here was
    // misleading, especially for large phone videos that can take minutes to
    // upload over Wi-Fi.
    setExportStatus('Uploading your original video…');
    try {
      const state = useEditorStore.getState();
      const videoTrack = state.tracks.find(t => t.id === 'video-1' && !t.isHidden);
      if (!videoTrack || videoTrack.segments.length === 0) throw new Error("No video to export");
      
      // Collect unique video sources used in the main track
      const formData = new FormData();
      const uniqueVideoUrls = Array.from(new Set(videoTrack.segments.map(s => s.src).filter((src): src is string => src !== undefined)));
      const videoFilesMap = new Map<string, number>();

      uniqueVideoUrls.forEach((url, index) => {
        const sourceSegment = videoTrack.segments.find(segment => segment.src === url);
        // Blob URLs are renewed after an iPad/iPhone restores the media
        // library. The segment keeps the old URL, so fall back to its stable
        // file name to reconnect it to the preserved File object.
        const mediaItem = state.mediaLibrary.find(m => m.url === url)
          || (sourceSegment?.name ? state.mediaLibrary.find(m => m.name === sourceSegment.name && m.file) : undefined);
        if (!mediaItem || !mediaItem.file) {
          throw new Error(`The original file for “${sourceSegment?.name || 'this video'}” is not available on this device. Please import it again, then export.`);
        }
        formData.append(`videoFile_${index}`, mediaItem.file);
        videoFilesMap.set(url, index);
      });
      
      const activeSegments = videoTrack.segments.map(s => ({
        start: s.start,
        end: s.end,
        sourceStart: s.sourceStart || 0,
        transitionOut: s.transitionOut,
        visualEffect: s.visualEffect,
        volume: s.volume !== undefined ? s.volume : 1.0,
        fileIndex: s.src ? videoFilesMap.get(s.src) : undefined
      }));
      formData.append('activeSegments', JSON.stringify(activeSegments));
      formData.append('applyBrandLogo', brandLogoEnabled ? 'true' : 'false');
      formData.append('brandLogoPosition', brandLogoPosition);
      formData.append('brandLogoSize', String(brandLogoSize));
      formData.append('brandLogoOpacity', String(brandLogoOpacity));

      const textTracks = state.tracks.filter(t => t.type === 'text' && !t.isHidden);
      const textTrack = textTracks.find(t => t.id === 'text-1');
      // Title presets live on separate tracks so they can overlap on screen.
      // Export every visible text track, rather than only the caption track.
      const captions = textTracks.flatMap(track => track.segments.map(s => ({
        text: s.text,
        start: s.start,
        end: s.end,
        x: s.x,
        y: s.y,
        fontSize: s.fontSize,
        fontFamily: s.fontFamily,
        color: s.color,
        bold: s.bold,
        italic: s.italic,
        textAlign: s.textAlign,
        letterSpacing: s.letterSpacing,
        lineHeight: s.lineHeight,
        textShadow: s.textShadow,
        shadowBlur: s.shadowBlur,
        outlineWidth: s.outlineWidth,
        outlineColor: s.outlineColor,
        style: s.style,
        retentionWords: s.retentionWords,
        activeWordIndex: s.activeWordIndex,
        // Any non-caption text is a user title layer. This also supports
        // projects made before title layers were given explicit names.
        isTitle: s.name !== 'Caption'
      })));
      formData.append('captions', JSON.stringify(captions));

      const firstCaption = textTrack?.segments.find(s => s.name === 'Caption');
      if (firstCaption) {
        formData.append('captionFont', firstCaption.fontFamily || 'Roboto-Black');
        formData.append('captionSize', (firstCaption.fontSize || 48).toString());
        formData.append('captionColor', firstCaption.color || '#FFFF00');
      }

      const audioFilesMap = new Map<string, number>();
      const audioFx = state.tracks
        .filter(track => track.type === 'audio' && !track.isHidden)
        .flatMap(track => track.segments)
        .map(s => {
          const mediaItem = state.mediaLibrary.find(m => m.url === s.src)
            || (s.name ? state.mediaLibrary.find(m => m.name === s.name && m.file) : undefined);
          if (mediaItem?.file && s.src) {
            let fileIndex = audioFilesMap.get(s.src);
            if (fileIndex === undefined) {
              fileIndex = audioFilesMap.size;
              formData.append(`audioFile_${fileIndex}`, mediaItem.file);
              audioFilesMap.set(s.src, fileIndex);
            }
            return { fileIndex, start: s.start, duration: s.duration, volume: s.volume !== undefined ? s.volume : 1.0 };
          }
          if (s.src?.startsWith('blob:')) {
            throw new Error(`The original audio for “${s.name || 'this narration'}” is not available on this device. Please import it again, then export.`);
          }
          return { url: s.src, start: s.start, duration: s.duration, volume: s.volume !== undefined ? s.volume : 1.0 };
        });
      formData.append('audioFx', JSON.stringify(audioFx));

      // Fast exports use about one quarter as many pixels as 1080p, making
      // them much friendlier to the entry-level render server.
      const dimensions = exportQuality === 'fast'
        ? aspectRatio === '16:9' ? ['960', '540'] : aspectRatio === '1:1' ? ['540', '540'] : ['540', '960']
        : aspectRatio === '16:9' ? ['1920', '1080'] : aspectRatio === '1:1' ? ['1080', '1080'] : ['1080', '1920'];
      formData.append('vw', dimensions[0]);
      formData.append('vh', dimensions[1]);
      formData.append('exportQuality', exportQuality);
      formData.append('framingMode', frameMode);

      trackEvent('export_started', {
        quality: exportQuality,
        aspect_ratio: aspectRatio,
        video_clip_count: videoTrack.segments.length,
        caption_count: captions.length,
        has_audio_track: audioFx.length > 0
      });

      // Fetch does not expose upload progress. Use XMLHttpRequest only for
      // this submission so creators can see a large phone original moving to
      // the server before it enters the render queue.
      const submission = await new Promise<{ ok: boolean; status: number; data: ExportSubmission }>((resolve, reject) => {
        const request = new XMLHttpRequest();
        request.open('POST', '/api/export');
        activeUploadRef.current = request;
        request.upload.onprogress = (event) => {
          if (!event.lengthComputable) return;
          const percent = Math.min(100, Math.round((event.loaded / event.total) * 100));
          const uploadedMb = (event.loaded / (1024 * 1024)).toFixed(1);
          const totalMb = (event.total / (1024 * 1024)).toFixed(1);
          setExportStatus(`Uploading your original video — ${percent}% (${uploadedMb} MB of ${totalMb} MB)…`);
        };
        request.onerror = () => {
          activeUploadRef.current = null;
          reject(new Error('The video upload was interrupted. Check your connection and try again.'));
        };
        request.onabort = () => {
          activeUploadRef.current = null;
          reject(new Error('The video upload was cancelled before it reached the export server.'));
        };
        request.onload = () => {
          activeUploadRef.current = null;
          let data: ExportSubmission = {};
          try { data = JSON.parse(request.responseText || '{}') as ExportSubmission; } catch {}
          resolve({ ok: request.status >= 200 && request.status < 300, status: request.status, data });
        };
        request.send(formData);
      });

      if (!submission.ok) {
        let errMsg = "Export failed";
        let errorCode = '';
        errMsg = submission.data?.error || errMsg;
        errorCode = submission.data?.code || '';
        if (submission.status === 408) {
          errMsg = 'The video upload took too long to reach the export server. Keep NexusCut open on a stable Wi-Fi connection, then try again.';
        } else if (submission.status === 413) {
          errMsg = 'This original video is larger than the 1 GB upload limit. Please export a smaller source file, then try again.';
        }
        if (submission.status === 403 && errorCode === 'EXPORT_LIMIT') {
          trackEvent('export_limit_reached', { quality: exportQuality });
          setExportLimitReached(true);
          setExportStatus(null);
          setIsExporting(false);
          return;
        }
        throw new Error(errMsg);
      }

      const { jobId, queuePosition = 1 } = submission.data;
      if (!jobId) throw new Error('The export server did not return a job ID.');
      setExportStatus(queuePosition > 1
        ? `Your export is in line — #${queuePosition}. You can keep editing while we hold your place.`
        : 'Your export is starting now. You can keep editing while it renders.');
      
      // Poll for status
      const pollStatus = async () => {
        try {
          const statusRes = await fetch(`/api/export/status?id=${jobId}`);
          if (!statusRes.ok) throw new Error("Failed to get export status");
          
          const statusData = await statusRes.json() as ExportStatus;
          
          if (statusData.status === 'completed') {
            // Trigger download via the download endpoint
            const download = document.createElement('a');
            download.href = `/api/export/download?id=${encodeURIComponent(jobId)}`;
            download.download = '';
            download.click();
            setFeedbackType('export');
            setShowFeedback(true);
            trackEvent('export_completed', { quality: exportQuality, aspect_ratio: aspectRatio });
            setExportStatus(null);
            setIsExporting(false);
          } else if (statusData.status === 'error') {
            throw new Error(statusData.error || "Export failed during processing");
          } else {
            if (statusData.status === 'queued' && (statusData.queuePosition || 0) > 1) {
              setExportStatus(`Your export is in line — #${statusData.queuePosition}. You can keep editing while we hold your place.`);
            } else if (statusData.status === 'processing') {
              const progress = typeof statusData.progress === 'number' && Number.isFinite(statusData.progress) ? ` — ${Math.max(0, Math.min(99, Math.round(statusData.progress)))}%` : '';
              setExportStatus(`${statusData.stage || 'Rendering video'}${progress}. You can keep editing while it finishes.`);
            }
            // Still processing, poll again in 3 seconds
            setTimeout(pollStatus, 3000);
          }
        } catch (e: unknown) {
           trackEvent('export_failed', { stage: 'render_or_download' });
           notify(`Export Error: ${getErrorMessage(e)}`, 'error');
           setExportStatus(null);
           setIsExporting(false);
        }
      };
      
      // Start polling
      setTimeout(pollStatus, 2000);
      // Notice we do NOT set isExporting(false) here, we wait for the polling to finish!
    } catch (err: unknown) {
      if (uploadCancelledRef.current) {
        trackEvent('export_cancelled', { stage: 'upload' });
        uploadCancelledRef.current = false;
        return;
      }
      trackEvent('export_failed', { stage: activeUploadRef.current ? 'upload' : 'preflight_or_submission' });
      notify(`Export Error: ${getErrorMessage(err)}`, 'error');
      setExportStatus(null);
      setIsExporting(false);
    }
  };

  const brandWatermarkControls = account && ['pro', 'agency'].includes(account.planTier) ? <div className="space-y-3 rounded-xl border border-amber-500/25 bg-amber-500/5 p-4">
    <div className="flex items-center justify-between gap-3"><span className="text-xs font-black uppercase tracking-wide text-amber-300">Brand Kit</span><Link href="/brand-kit" className="text-xs font-bold text-amber-200 underline decoration-amber-500/50 underline-offset-4 hover:text-white">Edit Brand Kit</Link></div>
    {brandKit?.logoUrl ? <>
    <label className="flex items-center justify-between gap-3 text-sm font-bold text-amber-100"><span>Apply Brand Kit logo</span><input type="checkbox" checked={brandLogoEnabled} onChange={(event) => setBrandLogoEnabled(event.target.checked)} className="h-4 w-4 accent-amber-500" /></label>
    {brandLogoEnabled && <><label className="block text-xs font-bold uppercase tracking-wide text-neutral-400">Position<select value={brandLogoPosition} onChange={(event) => setBrandLogoPosition(event.target.value as typeof brandLogoPosition)} className="mt-2 w-full rounded-lg border border-neutral-700 bg-black px-3 py-2 text-sm normal-case text-white"><option value="top-left">Top left</option><option value="top-right">Top right</option><option value="bottom-left">Bottom left</option><option value="bottom-right">Bottom right</option></select></label><label className="block text-xs font-bold uppercase tracking-wide text-neutral-400">Size — {brandLogoSize}%<input type="range" min="8" max="35" value={brandLogoSize} onChange={(event) => setBrandLogoSize(Number(event.target.value))} className="mt-2 w-full accent-amber-500" /></label><label className="block text-xs font-bold uppercase tracking-wide text-neutral-400">Opacity — {brandLogoOpacity}%<input type="range" min="20" max="100" value={brandLogoOpacity} onChange={(event) => setBrandLogoOpacity(Number(event.target.value))} className="mt-2 w-full accent-amber-500" /></label></>}
    </> : <p className="text-xs leading-5 text-neutral-400">Add a logo, caption colors, and custom font to unlock brand controls here.</p>}
  </div> : null;

  return (
    <div className="h-full w-full flex flex-col bg-black overflow-hidden font-sans rounded-2xl border border-neutral-800 shadow-2xl relative">
      {isShortsSetup && (
        <div className="absolute left-1/2 top-3 z-[70] flex w-[min(92%,38rem)] -translate-x-1/2 items-center justify-between gap-3 rounded-xl border border-emerald-400/30 bg-emerald-950/95 px-4 py-2.5 text-sm text-emerald-100 shadow-xl backdrop-blur">
          <span><strong>YouTube Shorts setup is ready.</strong> Your canvas is set to vertical 9:16.</span>
          <button onClick={() => setIsShortsSetup(false)} className="text-emerald-200 hover:text-white" aria-label="Dismiss YouTube Shorts setup">×</button>
        </div>
      )}
      
      {/* ---------------- MOBILE LAYOUT ---------------- */}
      <div className="flex xl:hidden flex-col h-full w-full relative">
        
         {/* Compact workspace header: project format, history and export stay available. */}
         <div className="h-14 w-full bg-neutral-950 border-b border-neutral-800 flex items-center gap-1.5 px-2.5 sm:px-4 flex-shrink-0 z-10">
            <Link href="/" aria-label="Return to NexusCut home" title="Return to NexusCut home" className="min-w-0 flex-1 font-bold text-sm bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent truncate hover:opacity-80 transition-opacity">
              NexusCut
            </Link>
            <select aria-label="Video format" value={aspectRatio} onChange={(e) => setAspectRatio(e.target.value as '9:16' | '16:9' | '1:1')} className="w-[62px] sm:w-[78px] rounded-md border border-neutral-700 bg-neutral-900 px-1.5 py-1.5 text-[10px] font-bold text-neutral-200 outline-none">
              <option value="9:16">9:16</option><option value="16:9">16:9</option><option value="1:1">1:1</option>
            </select>
            <button onClick={undo} disabled={past.length === 0} aria-label="Undo" className="grid h-8 w-8 place-items-center rounded-md text-neutral-400 hover:bg-white/10 hover:text-white disabled:opacity-30"><Undo className="h-4 w-4" /></button>
            <button onClick={redo} disabled={future.length === 0} aria-label="Redo" className="grid h-8 w-8 place-items-center rounded-md text-neutral-400 hover:bg-white/10 hover:text-white disabled:opacity-30"><Redo className="h-4 w-4" /></button>
            <button onClick={handleLocalSave} aria-label="Save project" title="Save a project backup" className="grid h-8 w-8 place-items-center rounded-md text-emerald-300 hover:bg-emerald-500/15 hover:text-emerald-100"><Save className="h-4 w-4" /></button>
            <Link href="/account" aria-label={account?.authenticated ? 'Open account' : 'Log in'} className="shrink-0 rounded-md border border-neutral-700 bg-neutral-900 px-2 py-2 text-[10px] font-bold text-neutral-200 transition-colors hover:border-indigo-500 hover:text-white">
              {account?.authenticated ? 'Account' : 'Log in'}
            </Link>
           <button 
             onClick={() => setIsExportSheetOpen(true)} 
             disabled={isExporting} 
             className={`px-3 py-2 rounded-lg ${isExporting ? 'bg-neutral-600' : 'bg-indigo-600'} text-white text-xs font-bold transition-all`}
           >
             {isExporting ? 'In queue…' : 'Export'}
           </button>
        </div>
        
        {/* The preview and timeline are the workspace. On a landscape tablet they
            sit side by side, preventing either from being hidden below the fold. */}
        <div className="min-h-0 flex flex-1 flex-col bg-neutral-950">
        <div className="z-10 h-[32dvh] min-h-[120px] w-full flex-shrink-0 bg-neutral-950 p-2 sm:h-[38dvh] sm:min-h-[210px] sm:p-3 landscape:h-[42dvh] landscape:min-h-[150px]">
          <ResponsiveCanvas mobile />
        </div>

        {/* Timeline */}
        <div className="min-h-0 flex-1 w-full border-t border-neutral-800 relative z-10 overflow-hidden bg-neutral-950">
          <Timeline />
        </div>
        </div>

        {/* Bottom Action Bar */}
        <MobileActionBar 
          onOpenSidebar={() => setIsSidebarSheetOpen(true)}
          onOpenProperties={() => setIsPropertiesSheetOpen(true)}
        />

        {/* Mobile Drawers */}
        <MobileBottomSheet isOpen={isSidebarSheetOpen} onClose={() => setIsSidebarSheetOpen(false)} title="Tools & Media">
          <Sidebar onMobileActionComplete={handleMobileAction} />
        </MobileBottomSheet>

        <MobileBottomSheet isOpen={isPropertiesSheetOpen} onClose={() => setIsPropertiesSheetOpen(false)} title="Properties">
          <PropertiesPanel onDone={() => setIsPropertiesSheetOpen(false)} />
        </MobileBottomSheet>
        <MobileBottomSheet isOpen={isExportSheetOpen} onClose={() => setIsExportSheetOpen(false)} title="Export video">
          <div className="space-y-5 p-5">
            <div><label className="mb-2 block text-xs font-bold uppercase tracking-wide text-neutral-400">Format</label><select value={aspectRatio} onChange={(e) => setAspectRatio(e.target.value as '9:16' | '16:9' | '1:1')} className="w-full rounded-xl border border-neutral-700 bg-black px-4 py-3 text-sm font-semibold text-white"><option value="9:16">9:16 Vertical</option><option value="16:9">16:9 Horizontal</option><option value="1:1">1:1 Square</option></select></div>
            <div><label className="mb-2 block text-xs font-bold uppercase tracking-wide text-neutral-400">Framing</label><select value={frameMode} onChange={(e) => setFrameMode(e.target.value as 'fit' | 'fill')} className="w-full rounded-xl border border-neutral-700 bg-black px-4 py-3 text-sm font-semibold text-white"><option value="fill">Fill screen (crop edges)</option><option value="fit">Fit whole video (black space)</option></select></div>
            <div><label className="mb-2 block text-xs font-bold uppercase tracking-wide text-neutral-400">Export speed</label><select value={exportQuality} onChange={(e) => setExportQuality(e.target.value as 'fast' | 'high')} className="w-full rounded-xl border border-neutral-700 bg-black px-4 py-3 text-sm font-semibold text-white"><option value="fast">Fast — 540p (recommended)</option><option value="high">High quality</option></select></div>
            {brandWatermarkControls}
            <button onClick={() => { setIsExportSheetOpen(false); handleExport(); }} disabled={isExporting} className="w-full rounded-xl bg-indigo-600 px-4 py-4 text-sm font-bold text-white transition-colors hover:bg-indigo-500 disabled:opacity-60">{isExporting ? (exportStatus?.startsWith('Uploading') ? 'Uploading video…' : 'Export in queue…') : 'Start export'}</button>
          </div>
        </MobileBottomSheet>

      </div>

      {/* ---------------- DESKTOP LAYOUT ---------------- */}
      <div className="hidden xl:flex flex-col h-full w-full">
        {/* Top Navbar for Editor */}
        <div className="h-14 w-full bg-neutral-950 border-b border-neutral-800 flex items-center px-4 flex-shrink-0 gap-3">
          <Link href="/" aria-label="Return to NexusCut home" title="Return to NexusCut home" className="flex-shrink-0 text-base font-bold bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent hover:opacity-80 transition-opacity">
            NexusCut
          </Link>
          {/* Keep the two framing controls outside the horizontally scrollable
              project toolbar. They are essential when recording a tutorial and
              must remain completely visible on laptop-sized desktop screens. */}
          <div className="flex shrink-0 items-center gap-2">
            <select
              value={aspectRatio}
              onChange={(e) => setAspectRatio(e.target.value as '9:16' | '16:9' | '1:1')}
              className="rounded-lg border border-neutral-700 bg-neutral-900 px-2 py-1.5 text-xs font-semibold text-neutral-300 hover:border-neutral-500 focus:border-indigo-500 focus:outline-none transition-colors"
              title="Video format"
            >
              <option value="9:16">9:16</option>
              <option value="16:9">16:9</option>
              <option value="1:1">1:1</option>
            </select>
            <select
              value={frameMode}
              onChange={(e) => setFrameMode(e.target.value as 'fit' | 'fill')}
              className="rounded-lg border border-neutral-700 bg-neutral-900 px-2 py-1.5 text-xs font-semibold text-neutral-300 hover:border-neutral-500 focus:border-indigo-500 focus:outline-none transition-colors"
              title="Fill crops the edges to fill the canvas. Fit keeps the complete video with black space."
            >
              <option value="fill">Fill screen</option>
              <option value="fit">Fit whole video</option>
            </select>
          </div>
          <div className="min-w-0 flex-1 flex items-center justify-between gap-4 overflow-x-auto custom-scrollbar">
          <div className="flex items-center gap-4 flex-shrink-0">
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
            <button onClick={() => setShowStartHere((visible) => !visible)} className="px-2.5 py-1.5 rounded-full bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 border border-emerald-500/30 text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" /> Click here to start
            </button>
            <input 
              type="text" 
              value={projectName} 
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="Project name"
              aria-label="Project name"
              title="Project name"
              className="w-36 text-sm font-semibold text-neutral-300 bg-transparent border-b border-transparent hover:border-neutral-700 focus:border-indigo-500 focus:outline-none transition-colors px-1 placeholder:text-neutral-600"
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
                  state.setProjectName("Untitled project");
                }
              }}
              className="ml-2 px-2 py-1 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-medium transition-colors flex items-center gap-1"
            >
              <Trash2 className="w-3 h-3" /> Start Over
            </button>
            <button
              type="button"
              onClick={() => void handleLocalSave()}
              disabled={isSavingLocal}
              className="px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-200 border border-emerald-500/30 text-sm font-bold whitespace-nowrap transition-colors flex items-center gap-2 disabled:cursor-wait disabled:opacity-60"
              title="Save a local project file. Recorded voiceovers are included; keep imported media available to relink."
            >
              <Save className="w-4 h-4" /> {isSavingLocal ? 'Saving…' : 'Save project'}
            </button>
          </div>
          
          <div className="flex items-center gap-3 flex-shrink-0">
            <select
              value={exportQuality}
              onChange={(e) => setExportQuality(e.target.value as 'fast' | 'high')}
              disabled={isExporting}
              className="px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-700 text-neutral-300 text-sm font-semibold hover:border-neutral-500 focus:border-indigo-500 focus:outline-none transition-colors disabled:opacity-60"
              title="Fast 540p exports more quickly; High quality uses the best available resolution."
            >
              <option value="fast">Fast (540p)</option>
              <option value="high">High quality</option>
            </select>

            <Link 
              href="/tutorial"
              className="px-3 py-1.5 rounded-full bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 border border-blue-500/30 text-sm font-bold transition-all flex items-center gap-2"
            >
              <BookOpen className="w-4 h-4" /> Tutorial
            </Link>
            <button onClick={() => { setFeedbackType('general'); setShowFeedback(true); }} className="hidden lg:flex px-3 py-1.5 rounded-full bg-violet-600/20 hover:bg-violet-600/40 text-violet-300 border border-violet-500/30 text-sm font-bold transition-all items-center gap-2">
              <MessageSquare className="w-4 h-4" /> Feedback
            </button>

            <button className="px-3 py-1.5 rounded bg-white/5 hover:bg-white/10 text-neutral-300 text-sm font-medium transition-colors flex items-center gap-2 relative">
              <Upload className="w-4 h-4" /> Load project
              <input 
                id="nexuscut-local-project-loader"
                type="file" 
                accept=".json" 
                aria-label="Choose a NexusCut project file"
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = async (ev) => {
                      try {
                        const projectData = JSON.parse(ev.target?.result as string) as SavedProject | Track[];
                        // Version 1 projects were simply an array of tracks.
                        // Version 2 also preserves Growth Mode hook options.
                        const loadedTracks = Array.isArray(projectData) ? projectData : projectData.tracks;
                        if (!Array.isArray(loadedTracks)) throw new Error('Invalid project tracks');
                        const state = useEditorStore.getState();
                        const embeddedItems = !Array.isArray(projectData) && Array.isArray(projectData.embeddedMedia)
                          ? projectData.embeddedMedia.map((saved) => {
                              const separator = saved.dataUrl.indexOf(',');
                              if (!saved.dataUrl.startsWith('data:') || separator < 0) throw new Error(`Invalid embedded media: ${saved.name}`);
                              const binary = atob(saved.dataUrl.slice(separator + 1));
                              const bytes = new Uint8Array(binary.length);
                              for (let index = 0; index < binary.length; index++) bytes[index] = binary.charCodeAt(index);
                              const file = new File([bytes], saved.name, { type: saved.mimeType || 'audio/webm' });
                              return {
                                id: saved.id,
                                name: saved.name,
                                type: 'audio' as const,
                                duration: saved.duration,
                                file,
                                url: URL.createObjectURL(file),
                              };
                            })
                          : [];
                        const mediaLibrary = [
                          ...state.mediaLibrary.filter(item => !embeddedItems.some(embedded => embedded.name === item.name)),
                          ...embeddedItems,
                        ];
                        if (embeddedItems.length) {
                          state.setMediaLibrary(mediaLibrary);
                          await import('idb-keyval').then(({ set }) => set('nexuscut-media', mediaLibrary));
                        }
                        
                        const remappedTracks = loadedTracks.map((t: Track) => ({
                          ...t,
                          segments: t.segments.map((s: TrackSegment) => {
                            if (s.src && s.src.startsWith('blob:')) {
                              // Generated Growth Mode clips retain the original
                              // file name. Older saved projects called them
                              // "Growth Mode hook"; safely reconnect those when
                              // there is only one video in the library.
                              const videoMedia = mediaLibrary.filter(m => m.type === 'video');
                              const media = mediaLibrary.find(m => m.name === s.name)
                                || (s.type === 'video' && s.name === 'Growth Mode hook' && videoMedia.length === 1 ? videoMedia[0] : undefined);
                              if (media) {
                                return { ...s, src: media.url };
                              }
                            }
                            return s;
                          })
                        }));

                        // Check if any media is still missing (ignore text/effect segments)
                        const missingMedia = new Set<string>();
                        remappedTracks.forEach((t: Track) => t.segments.forEach((s: TrackSegment) => {
                          if (s.type === 'text' || s.type === 'effect' || s.type === 'transition') return;
                          
                          if (s.src && s.src.startsWith('blob:') && !mediaLibrary.some(m => m.url === s.src)) {
                            missingMedia.add(s.name || 'Unknown Media');
                          }
                        }));

                        if (missingMedia.size > 0) {
                          notify(`Warning: Missing media files (${Array.from(missingMedia).join(', ')}). Please drag and drop the original files back into the Media Library sidebar to relink them.`, 'error');
                        }

                        state.setTracks(remappedTracks);
                        if (!Array.isArray(projectData)) {
                          if (typeof projectData.transcriptionText === 'string') state.setTranscriptionText(projectData.transcriptionText);
                          if (Array.isArray(projectData.transcriptionWords)) state.setTranscriptionWords(projectData.transcriptionWords);
                        }
                        if (!Array.isArray(projectData) && Array.isArray(projectData.growthOptions)) {
                          projectData.growthOptions.forEach((savedOption) => {
                            const matchingSegment = remappedTracks
                              .flatMap((track: Track) => track.type === 'video' ? track.segments : [])
                              .find((segment: TrackSegment) => segment.name === savedOption.sourceName && segment.src);
                            if (matchingSegment?.src) {
                              sessionStorage.setItem(
                                `nexuscut-growth-options:${matchingSegment.src}`,
                                JSON.stringify({ ...savedOption, source: matchingSegment.src })
                              );
                            }
                          });
                        }
                      } catch {
                        notify("Invalid project file.", 'error');
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
                    <p className="truncate text-sm font-semibold text-white">{account?.authenticated ? account.email : 'Not signed in'}</p>
                    <p className="text-xs capitalize text-neutral-400">{account?.authenticated ? `${account.planTier} plan` : 'Free local session'}</p>
                  </div>
                  <Link href="/account" className="px-4 py-2 text-left text-sm text-neutral-300 hover:bg-neutral-800 hover:text-white transition-colors">My Account</Link>
                  <Link href="/downloads" className="px-4 py-2 text-left text-sm text-neutral-300 hover:bg-neutral-800 hover:text-white transition-colors">My Downloads</Link>
                  <Link href="/marketplace" className="px-4 py-2 text-left text-sm text-neutral-300 hover:bg-neutral-800 hover:text-white transition-colors">Marketplace</Link>
                  <button onClick={async () => {
                    try {
                      const res = await fetch('/api/stripe/portal', { method: 'POST' });
                      const data = await res.json();
                      if (data.url) {
                        window.location.href = data.url;
                      } else {
                        notify(data.error || 'No active subscription found.', 'error');
                      }
                    } catch {
                      notify('Failed to load billing portal.', 'error');
                    }
                  }} className="px-4 py-2 text-left text-sm text-neutral-300 hover:bg-neutral-800 hover:text-white transition-colors">Manage Subscription</button>
                  <button onClick={() => {
                    fetch('/api/auth/logout', { method: 'POST' }).finally(() => {
                      router.push('/');
                      router.refresh();
                    });
                  }} className="px-4 py-2 text-left text-sm text-rose-400 hover:bg-neutral-800 hover:text-rose-300 transition-colors border-t border-neutral-800">Sign Out</button>
                </div>
              </div>
            </div>
          </div>
          </div>
          <div className="flex flex-shrink-0 items-center gap-2">
            {account && ['pro', 'agency'].includes(account.planTier) && <Link href={account.planTier === 'agency' ? '/agency' : '/brand-kit'} className="flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-sm font-bold text-amber-200 transition-all hover:bg-amber-500/20 hover:text-white"><Briefcase className="h-4 w-4" />{account.planTier === 'agency' ? 'Client Kits' : 'Brand Kit'}</Link>}
            <button 
              onClick={openGrowthMode}
              className="px-3 py-1.5 rounded-full bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 border border-emerald-500/30 text-sm font-bold transition-all flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" /> Growth Mode <span className="text-[10px] uppercase text-amber-300">Pro</span>
            </button>
            <button 
              onClick={() => setIsExportSheetOpen(true)}
              disabled={isExporting}
              className={`px-4 py-1.5 rounded-full ${isExporting ? 'bg-neutral-600 cursor-wait' : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-lg shadow-indigo-900/20'} text-white border border-indigo-500/30 text-sm font-bold transition-all flex items-center gap-2`}
            >
              {isExporting ? 'Export queued…' : 'Export Video'}
            </button>
          </div>
        </div>

        {/* Main Editor Body */}
        <div className="flex-1 flex flex-col md:flex-row overflow-y-auto md:overflow-hidden">
          
          {/* Center Canvas Area (Moved to top on mobile via order) */}
          <div className="order-1 md:order-2 w-full md:flex-1 p-1 bg-neutral-950 flex flex-col min-h-[40vh] md:min-h-0 flex-shrink-0">
            <ResponsiveCanvas mobile={false} />
          </div>

          {/* Left Sidebar Tools */}
          <div className="order-2 md:order-1 w-full md:w-auto flex-shrink-0 h-[50vh] md:h-auto">
            <Sidebar onMobileActionComplete={handleMobileAction} />
          </div>

          {/* Right Properties Panel */}
          <div className="order-3 w-full md:w-auto flex-shrink-0 h-[50vh] md:h-auto">
            <PropertiesPanel />
          </div>
        </div>

        {/* Bottom Timeline */}
        <div className="h-[40vh] md:h-[30%] min-h-[220px] flex-shrink-0 relative z-10 border-t border-neutral-800">
          <Timeline />
        </div>
      </div>

      {/* Desktop export settings: quality must be chosen at the moment a user
          exports, not hidden in an overflowing toolbar. */}
      {isExportSheetOpen && (
        <div className="fixed inset-0 z-[80] hidden lg:flex items-center justify-center bg-black/70 p-5 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="export-settings-title">
          <button className="absolute inset-0 cursor-default" aria-label="Close export settings" onClick={() => setIsExportSheetOpen(false)} />
          <div className="relative w-full max-w-md rounded-2xl border border-neutral-700 bg-neutral-900 p-6 shadow-2xl">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h2 id="export-settings-title" className="text-lg font-bold text-white">Export video</h2>
                <p className="mt-1 text-sm text-neutral-400">Choose your format and quality before rendering.</p>
              </div>
              <button onClick={() => setIsExportSheetOpen(false)} className="rounded-lg p-2 text-neutral-400 hover:bg-neutral-800 hover:text-white" aria-label="Close export settings"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-4">
              <label className="block text-xs font-bold uppercase tracking-wide text-neutral-400">Format
                <select value={aspectRatio} onChange={(e) => setAspectRatio(e.target.value as '9:16' | '16:9' | '1:1')} className="mt-2 w-full rounded-xl border border-neutral-700 bg-black px-4 py-3 text-sm font-semibold text-white">
                  <option value="9:16">9:16 Vertical</option><option value="16:9">16:9 Horizontal</option><option value="1:1">1:1 Square</option>
                </select>
              </label>
              <label className="block text-xs font-bold uppercase tracking-wide text-neutral-400">Framing
                <select value={frameMode} onChange={(e) => setFrameMode(e.target.value as 'fit' | 'fill')} className="mt-2 w-full rounded-xl border border-neutral-700 bg-black px-4 py-3 text-sm font-semibold text-white">
                  <option value="fit">Fit whole video — keeps everything visible</option><option value="fill">Fill screen — crops the edges</option>
                </select>
              </label>
              <label className="block text-xs font-bold uppercase tracking-wide text-neutral-400">Export quality
                <select value={exportQuality} onChange={(e) => setExportQuality(e.target.value as 'fast' | 'high')} className="mt-2 w-full rounded-xl border border-neutral-700 bg-black px-4 py-3 text-sm font-semibold text-white">
                  <option value="fast">Fast — 540p (recommended)</option><option value="high">High quality — 1080p</option>
                </select>
              </label>
              <p className="rounded-lg bg-neutral-950 px-3 py-2 text-xs leading-5 text-neutral-400">Fast is best for drafts. Choose High quality for videos you plan to publish.</p>
              {brandWatermarkControls}
              <button onClick={() => { setIsExportSheetOpen(false); handleExport(); }} disabled={isExporting} className="w-full rounded-xl bg-indigo-600 px-4 py-3.5 text-sm font-bold text-white transition-colors hover:bg-indigo-500 disabled:opacity-60">{isExporting ? (exportStatus?.startsWith('Uploading') ? 'Uploading video…' : 'Export in queue…') : 'Start export'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Export status stays out of the way so the user can continue editing. */}
      {isExporting && (
        <div className="absolute left-1/2 top-16 z-50 w-[min(92%,38rem)] -translate-x-1/2 rounded-xl border border-indigo-400/30 bg-indigo-950/95 px-4 py-3 text-center text-sm text-indigo-100 shadow-xl backdrop-blur" role="status">
          <span className="mr-2 inline-block h-3 w-3 animate-spin rounded-full border-2 border-indigo-300/30 border-t-indigo-200 align-[-1px]" />
          {exportStatus || 'Your export is being prepared. You can keep editing.'}
          {exportStatus?.startsWith('Uploading') && <button onClick={cancelUpload} className="ml-3 rounded-md border border-indigo-300/40 px-2 py-1 text-xs font-bold text-indigo-100 hover:bg-indigo-300/15">Cancel upload</button>}
        </div>
      )}

      {exportLimitReached && (
        <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="export-limit-title">
          <div className="w-full max-w-md rounded-2xl border border-indigo-400/30 bg-neutral-900 p-7 text-center shadow-2xl">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-400/15 text-amber-300">
              <Crown className="h-6 w-6" />
            </div>
            <h2 id="export-limit-title" className="text-xl font-bold text-white">Your free exports are used</h2>
            <p className="mt-2 text-sm leading-6 text-neutral-300">You’ve used this month’s 10 free exports. Upgrade to Creator for unlimited 1080p exports, or wait for the allowance to reset next month.</p>
            <div className="mt-6 flex gap-3">
              <button onClick={() => setExportLimitReached(false)} className="flex-1 rounded-xl border border-neutral-700 px-4 py-3 text-sm font-bold text-neutral-200 transition-colors hover:bg-neutral-800">Not now</button>
              <Link href="/pricing" className="flex-1 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-indigo-500">View Creator plan</Link>
            </div>
          </div>
        </div>
      )}

      {showStartHere && (
        <div className="absolute right-4 top-20 z-40 hidden md:block w-80 rounded-xl border border-indigo-400/25 bg-neutral-900/95 p-4 shadow-xl backdrop-blur">
          <button onClick={() => setShowStartHere(false)} className="absolute right-2 top-2 rounded p-1 text-neutral-500 hover:bg-white/10 hover:text-white" aria-label="Dismiss start guide"><X className="h-4 w-4" /></button>
          <p className="pr-5 text-sm font-bold text-white">Start here</p>
          <ol className="mt-2 space-y-1 text-xs leading-5 text-neutral-300"><li>1. Open Media and upload a video.</li><li>2. Drag it to the timeline. Drag either end of the clip inward to shorten it. Use Split to cut it into two clips.</li><li>3. Use Auto Captions or add text.</li><li>4. Export and check the result.</li></ol>
          <button onClick={() => { setFeedbackType('general'); setShowFeedback(true); }} className="mt-3 text-xs font-bold text-indigo-300 hover:text-indigo-200">Something confusing? Send feedback →</button>
        </div>
      )}

      {showGrowthWizard && <GrowthModeWizard onClose={() => setShowGrowthWizard(false)} />}
      {showFeedback && <FeedbackModal initialType={feedbackType} onClose={() => setShowFeedback(false)} />}
      
      <TransitionModal 
        isOpen={transitionModalOpen}
        onClose={() => setTransitionModalOpen(false)}
        transitionType={transitionModalType}
        onSave={(duration) => {
          if (transitionTargetSegmentId) {
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
