import { toast } from '@/lib/toast';
import React, { useState } from 'react';
import { Sparkles, X, Wand2, CheckCircle2, Clock } from 'lucide-react';
import { TrackSegment, useEditorStore } from '@/store/useEditorStore';

interface GrowthModeWizardProps { onClose: () => void; }
type HookScores = { curiosity: number; clarity: number; emotion: number; opening: number };
type HookCandidate = { start: number; end: number; title: string; reason: string; scores?: HookScores };
type TimedWord = { word: string; start: number; end: number };
type Analysis = { source: string; sourceName: string; sourceStart: number; sourceDuration: number; words: TimedWord[]; candidates: HookCandidate[] };
type TranscriptionResponse = { error?: string; transcription?: { text?: string; words?: TimedWord[] } };
type HookResponse = { error?: string; candidates?: Array<Partial<HookCandidate>> };
type AccountResponse = { authenticated?: boolean; planTier?: string };
type SpeechBlock = { sourceStart: number; sourceEnd: number; timelineStart: number; timelineEnd: number };
const getErrorMessage = (error: unknown) => error instanceof Error ? error.message : String(error);

const buildSpeechBlocks = (words: TimedWord[], rangeStart: number, rangeEnd: number): SpeechBlock[] => {
  const spoken = words
    .filter(word => Number.isFinite(word.start) && Number.isFinite(word.end) && word.word?.trim())
    .map(word => ({ ...word, end: Math.max(word.end, word.start + 0.12) }))
    .filter(word => word.start < rangeEnd && word.end > rangeStart)
    .sort((a, b) => a.start - b.start);
  if (!spoken.length) return [];

  const sourceRanges: Array<{ start: number; end: number }> = [];
  let first = spoken[0];
  let last = spoken[0];
  for (const word of spoken.slice(1)) {
    if (word.start - last.end > 0.75) {
      sourceRanges.push({ start: Math.max(rangeStart, first.start - 0.12), end: Math.min(rangeEnd, last.end + 0.18) });
      first = word;
    }
    last = word;
  }
  sourceRanges.push({ start: Math.max(rangeStart, first.start - 0.12), end: Math.min(rangeEnd, last.end + 0.18) });

  let timelineCursor = 0;
  return sourceRanges.map(range => {
    const duration = Math.max(0.12, range.end - range.start);
    const block = { sourceStart: range.start, sourceEnd: range.end, timelineStart: timelineCursor, timelineEnd: timelineCursor + duration };
    timelineCursor += duration;
    return block;
  });
};

const getRemovedSeconds = (words: TimedWord[], candidate: HookCandidate) => {
  const kept = buildSpeechBlocks(words, candidate.start, candidate.end).reduce((total, block) => total + block.timelineEnd - block.timelineStart, 0);
  return Math.max(0, candidate.end - candidate.start - kept);
};

const savedOptionsExist = () => {
  if (typeof window === 'undefined') return false;
  const firstSeg = useEditorStore.getState().tracks.find(track => track.id === 'video-1')?.segments[0];
  if (!firstSeg?.src) return false;
  try {
    const saved = JSON.parse(sessionStorage.getItem(`nexuscut-growth-options:${firstSeg.src}`) || '') as Partial<Analysis>;
    return Array.isArray(saved.candidates) && saved.candidates.length > 1;
  } catch {
    return false;
  }
};

const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remaining = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${minutes}:${remaining}`;
};

export default function GrowthModeWizard({ onClose }: GrowthModeWizardProps) {
  const [step, setStep] = useState<'setup' | 'analyzing' | 'choose' | 'applying' | 'success'>('setup');
  const [selectedCandidate, setSelectedCandidate] = useState(0);
  const [progressText, setProgressText] = useState('');
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [hasSavedOptions, setHasSavedOptions] = useState(savedOptionsExist);
  const [createdCaptionCount, setCreatedCaptionCount] = useState(0);
  const [removedSeconds, setRemovedSeconds] = useState(0);

  const restoreSavedOptions = () => {
    const firstSeg = useEditorStore.getState().tracks.find(track => track.id === 'video-1')?.segments[0];
    if (!firstSeg?.src) return false;
    try {
      const savedAnalysis = JSON.parse(sessionStorage.getItem(`nexuscut-growth-options:${firstSeg.src}`) || '') as Analysis;
      if (savedAnalysis.source === firstSeg.src && savedAnalysis.candidates.length >= 1 && savedAnalysis.words?.length) {
        setAnalysis(savedAnalysis);
        setSelectedCandidate(0);
        setStep('choose');
        return true;
      }
    } catch {}
    return false;
  };

  const transcribe = (file: File) => new Promise<TranscriptionResponse>((resolve, reject) => {
    const formData = new FormData();
    formData.append('file', file);
    const request = new XMLHttpRequest();
    request.open('POST', '/api/backend-transcribe');
    request.responseType = 'text';
    request.upload.onprogress = (event) => {
      if (event.lengthComputable) setProgressText(`Uploading video… ${Math.round((event.loaded / event.total) * 100)}%`);
    };
    request.upload.onload = () => setProgressText('Transcribing speech…');
    request.onerror = () => reject(new Error('Could not reach the transcription service. Please check your connection and try again.'));
    request.onload = () => {
      let response: TranscriptionResponse | null = null;
      try { response = request.responseText ? JSON.parse(request.responseText) as TranscriptionResponse : null; } catch {}
      if (request.status < 200 || request.status >= 300) {
        reject(new Error(response?.error || `Growth Mode could not process this video (${request.status}).`));
        return;
      }
      resolve(response || {});
    };
    request.send(formData);
  });

  const startAnalysis = async () => {
    setStep('analyzing');
    try {
      const accessResponse = await fetch('/api/growth/access', { cache: 'no-store' });
      const access = await accessResponse.json() as AccountResponse & { error?: string };
      if (!accessResponse.ok) throw new Error(access.error || 'Growth Mode requires a Pro membership.');
      const state = useEditorStore.getState();
      const videoTrack = state.tracks.find(t => t.id === 'video-1');
      const firstSeg = videoTrack?.segments[0];
      if (!firstSeg) throw new Error('Please add a video to the timeline first.');
      if (restoreSavedOptions()) return;
      const mediaItem = state.mediaLibrary.find(m => m.url === firstSeg.src)
        || (firstSeg.name ? state.mediaLibrary.find(m => m.name === firstSeg.name && m.file) : undefined);
      if (!mediaItem?.file) throw new Error('Cannot find the original video file. Please import it again.');
      if (mediaItem.file.size > 240 * 1024 * 1024) throw new Error('Growth Mode currently supports videos up to 240 MB.');

      // Keep the three options available after one is applied. A Growth Mode
      // hook still references the same original source, so it can safely be
      // replaced by another option during this browser session.
      const data = await transcribe(mediaItem.file);
      const transcription = data.transcription;
      if (!transcription?.words?.length) throw new Error('No spoken words were detected in this video.');

      // A previous Growth pass turns one source into several dead-air-trimmed
      // timeline segments. Re-running Growth must recover the complete source
      // range instead of mistaking the first (sometimes one-word) segment for
      // the whole clip.
      const matchingSourceSegments = (videoTrack?.segments || [])
        .filter(segment => segment.src === firstSeg.src)
        .sort((a, b) => (a.sourceStart ?? 0) - (b.sourceStart ?? 0));
      const sourceStart = Math.min(...matchingSourceSegments.map(segment => segment.sourceStart ?? 0));
      const sourceEnd = Math.max(...matchingSourceSegments.map(segment => (segment.sourceStart ?? 0) + segment.duration));
      const sourceDuration = Math.max(firstSeg.duration, sourceEnd - sourceStart);
      let candidates: HookCandidate[];
      if (sourceDuration <= 60) {
        candidates = [{ start: sourceStart, end: sourceStart + sourceDuration, title: 'Keep the full clip', reason: 'This video is already short, so Growth Mode will preserve its full context.', scores: { curiosity: 70, clarity: 85, emotion: 65, opening: 72 } }];
      } else {
        setProgressText('Finding three promising hook options…');
        const transcript = transcription.words.map((word) => `[${word.start.toFixed(2)}s] ${word.word}`).join(' ');
        const response = await fetch('/api/extract-hook', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ transcript })
        });
        const hookData = await response.json() as HookResponse;
        if (!response.ok || !Array.isArray(hookData.candidates)) throw new Error(hookData.error || 'Could not identify hook options.');
        candidates = hookData.candidates
          .map((candidate, index) => {
            const start = Math.max(sourceStart, Number(candidate.start));
            const suggestedEnd = Math.min(sourceStart + sourceDuration, Number(candidate.end));
            // Keep a hook long enough to make sense even when the model returns
            // only the opening sentence of a thought.
            const end = Math.min(sourceStart + sourceDuration, Math.max(suggestedEnd, start + 8));
            const score = (value: unknown) => Math.max(0, Math.min(100, Number(value) || 0));
            const rawScores = candidate.scores;
            return { start, end, title: candidate.title || `Hook option ${index + 1}`, reason: candidate.reason || 'A concise opening selected from the spoken transcript.', scores: rawScores ? { curiosity: score(rawScores.curiosity), clarity: score(rawScores.clarity), emotion: score(rawScores.emotion), opening: score(rawScores.opening) } : undefined };
          })
          .filter((candidate: HookCandidate) => Number.isFinite(candidate.start) && Number.isFinite(candidate.end) && candidate.end - candidate.start >= 8);
        const timedWords = transcription.words
          .filter((word) => Number.isFinite(word.start) && Number.isFinite(word.end))
          .map((word) => ({ start: word.start, end: Math.max(word.end, word.start + 0.12) }))
          .sort((a, b) => a.start - b.start);
        candidates = candidates.map(candidate => {
          const startWord = timedWords.find((word) => word.start <= candidate.start && word.end > candidate.start)
            || timedWords.find((word) => word.start >= candidate.start);
          const endWord = timedWords.find((word) => word.start < candidate.end && word.end >= candidate.end)
            || [...timedWords].reverse().find((word) => word.end <= candidate.end);
          return {
            ...candidate,
            start: Math.max(sourceStart, startWord?.start ?? candidate.start),
            end: Math.min(sourceStart + sourceDuration, endWord?.end ?? candidate.end),
          };
        }).filter(candidate => candidate.end - candidate.start >= 8);
        if (!candidates.length) throw new Error('No usable hook options were found.');
      }
      const nextAnalysis = { source: firstSeg.src || '', sourceName: firstSeg.name || mediaItem.name, sourceStart, sourceDuration, words: transcription.words, candidates };
      setAnalysis(nextAnalysis);
      sessionStorage.setItem(`nexuscut-growth-options:${firstSeg.src}`, JSON.stringify(nextAnalysis));
      setHasSavedOptions(candidates.length > 1);
      setSelectedCandidate(0);
      setStep('choose');
    } catch (error: unknown) {
      toast(`Growth Mode: ${getErrorMessage(error)}`);
      setStep('setup');
    } finally {
      setProgressText('');
    }
  };

  const applyCandidate = () => {
    if (!analysis) return;
    setStep('applying');
    try {
      const state = useEditorStore.getState();
      const candidate = analysis.candidates[selectedCandidate];
      const videoTrack = state.tracks.find(t => t.id === 'video-1');
      if (!videoTrack) throw new Error('Main video track is unavailable.');

      // Applying is intentionally explicit: the user chose this candidate and
      // can use Undo to return to the previous timeline.
      const speechBlocks = buildSpeechBlocks(analysis.words, candidate.start, candidate.end);
      if (!speechBlocks.length) throw new Error('No timed speech was found inside the selected Short. Please choose another option.');
      const duration = speechBlocks[speechBlocks.length - 1].timelineEnd;
      const videoSegments: TrackSegment[] = speechBlocks.map((block, index) => ({
        id: `gm-vid-${Date.now()}-${index}`, trackId: 'video-1', start: block.timelineStart, end: block.timelineEnd,
        duration: block.timelineEnd - block.timelineStart, sourceStart: block.sourceStart,
        sourceDuration: analysis.sourceStart + analysis.sourceDuration,
        type: 'video', src: analysis.source, name: analysis.sourceName,
      }));

      // Use the same source-to-timeline mapping as the working AI Magic
      // caption flow. Growth replaces the chosen source range with a new clip
      // beginning at timeline 0, so every Whisper timestamp must be clipped to
      // that source range and translated before captions are assembled.
      const timelineWords = analysis.words
        .filter(word => Number.isFinite(word.start) && Number.isFinite(word.end) && word.word?.trim())
        .map(word => ({ ...word, end: Math.max(word.end, word.start + 0.12) }))
        .filter(word => word.start < candidate.end && word.end > candidate.start)
        .map(word => {
          const blockIndex = speechBlocks.findIndex(block => word.start < block.sourceEnd && word.end > block.sourceStart);
          if (blockIndex < 0) return null;
          const block = speechBlocks[blockIndex];
          const start = block.timelineStart + Math.max(0, Math.max(word.start, block.sourceStart) - block.sourceStart);
          const end = Math.min(block.timelineEnd, block.timelineStart + Math.min(word.end, block.sourceEnd) - block.sourceStart);
          return { text: word.word.trim(), start, end, segmentId: videoSegments[blockIndex].id };
        })
        .filter((word): word is { text: string; start: number; end: number; segmentId: string } => word !== null && word.end > word.start)
        .sort((a, b) => a.start - b.start);
      if (!timelineWords.length) throw new Error('No timed speech was found inside the selected Short. Please choose another option.');
      const transcriptionWords = timelineWords.map(word => ({
        id: crypto.randomUUID(), text: word.text, start: word.start, end: word.end,
        sourceSrc: analysis.source, segmentId: word.segmentId,
      }));
      if (candidate.title === 'Keep the full clip' && state.transcriptionWords.length >= 4 && timelineWords.length < state.transcriptionWords.length * 0.6) {
        throw new Error('Growth Mode stopped because this rerun would remove most of the existing transcript. The original timeline was left unchanged.');
      }
      type TimelineWord = { text: string; start: number; end: number };
      const phrases: { words: TimelineWord[]; start: number; end: number }[] = [];
      let phrase: { words: TimelineWord[]; start: number; end: number } | null = null;
      const finishPhrase = () => { if (phrase) phrases.push(phrase); phrase = null; };
      timelineWords.forEach(word => {
        if (phrase && (word.start - phrase.end > 0.6 || phrase.words.length >= 4)) finishPhrase();
        if (!phrase) phrase = { words: [], start: word.start, end: word.end };
        phrase.words.push(word);
        phrase.end = Math.max(phrase.end, word.end);
        if (/[.!?]$/.test(word.text)) finishPhrase();
      });
      finishPhrase();

      const captionSegments: TrackSegment[] = [];
      phrases.forEach((caption, index) => {
        const retentionWords = caption.words.map(word => word.text.toUpperCase());
        caption.words.forEach((word, wordIndex) => {
          const nextWordStart = caption.words[wordIndex + 1]?.start ?? phrases[index + 1]?.start ?? duration;
          const start = word.start;
          const end = Math.min(duration, Math.max(start + 0.12, nextWordStart - 0.02, word.end));
          if (end <= start) return;
          const encodedText = retentionWords.map((captionWord, wordPosition) => wordPosition === wordIndex ? `[[${captionWord}]]` : captionWord).join(' ');
          captionSegments.push({
            id: crypto.randomUUID(), trackId: 'text-1', start, end, duration: end - start,
            type: 'text', name: 'Caption', text: encodedText, src: analysis.source,
            color: '#FFFFFF', fontSize: 48, bold: true, textAlign: 'center', x: 50, y: 80, opacity: 1,
            style: 'growth-retention', retentionWords, activeWordIndex: wordIndex,
          });
        });
      });
      if (!captionSegments.length) throw new Error('Captions could not be created for this Short. Please choose another option.');
      state.saveHistory();
      useEditorStore.setState(current => {
        const hasCaptionTrack = current.tracks.some(track => track.id === 'text-1');
        const nextTracks = current.tracks.map(track => {
          if (track.id === 'video-1') return { ...track, segments: videoSegments };
          if (track.id === 'text-1') return { ...track, isHidden: false, segments: [...track.segments.filter(segment => segment.name !== 'Caption'), ...captionSegments] };
          return track;
        });
        if (!hasCaptionTrack) {
          nextTracks.push({ id: 'text-1', type: 'text', name: 'Captions', isHidden: false, segments: captionSegments });
        }
        return {
          tracks: nextTracks,
          transcriptionWords,
          transcriptionText: transcriptionWords.map(word => word.text).join(' '),
          aspectRatio: '9:16',
          videoDuration: duration,
          // Pause on the first spoken word. This gives an immediate visual
          // confirmation that the selected caption system was applied.
          currentTime: captionSegments[0].start,
          isPlaying: false,
          selectedSegmentId: captionSegments[0].id,
        };
      });
      setCreatedCaptionCount(captionSegments.length);
      setRemovedSeconds(Math.max(0, candidate.end - candidate.start - duration));
      setStep('success');
    } catch (error: unknown) {
      toast(`Growth Mode: ${getErrorMessage(error)}`);
      setStep('choose');
    }
  };

  const undoGrowthChanges = () => {
    const state = useEditorStore.getState();
    state.undo();
    state.setCurrentTime(0);
    state.setIsPlaying(false);
    onClose();
  };

  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
    <div className="flex w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-emerald-500/30 bg-neutral-900 shadow-2xl shadow-emerald-500/10">
      <div className="flex items-center justify-between border-b border-neutral-800 bg-gradient-to-r from-emerald-950/40 to-transparent px-6 py-4">
        <div className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-emerald-400" /><h2 className="text-lg font-bold text-white">Growth Mode <span className="text-sm font-medium text-amber-300">Pro</span></h2></div>
        <button onClick={onClose} className="text-neutral-400 hover:text-white"><X className="h-5 w-5" /></button>
      </div>
      <div className="p-6">
        {step === 'setup' && <div className="space-y-6">
          <div className="text-center"><div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20"><Wand2 className="h-8 w-8 text-emerald-400" /></div><h3 className="mb-2 text-xl font-bold text-white">Turn a talking-head video into a Short</h3><p className="text-sm text-neutral-400">Short clips keep their full context. Longer clips receive three hook options for you to choose from before your timeline changes.</p></div>
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-950/20 p-4 text-sm text-neutral-300"><strong className="text-emerald-300">What Growth Mode changes</strong><ul className="mt-2 space-y-1.5"><li>• Finds and scores selectable hooks in videos over 60 seconds.</li><li>• Builds a tightened 9:16 Short with conservative dead-air removal.</li><li>• Adds synchronized Retention Focus captions.</li><li>• Preserves word timing for later ScriptCut edits.</li></ul></div>
          <div className="rounded-xl border border-yellow-400/25 bg-yellow-400/5 p-4"><span className="block text-sm font-black uppercase tracking-wide text-yellow-300">Retention Focus captions</span><span className="mt-1 block text-xs leading-5 text-neutral-300">Readable phrases stay stable while each spoken word receives synchronized color emphasis.</span></div>
          <div className="space-y-3">{hasSavedOptions && <button onClick={restoreSavedOptions} className="w-full rounded-xl border border-emerald-500/50 bg-emerald-500/10 py-3 font-bold text-emerald-200 hover:bg-emerald-500/20">View saved hook options</button>}<button onClick={startAnalysis} className="w-full rounded-xl bg-emerald-600 py-3 font-bold text-white hover:bg-emerald-500">Analyze video</button></div>
        </div>}
        {step === 'analyzing' && <div className="py-12 text-center"><div className="relative mx-auto mb-6 h-24 w-24"><div className="absolute inset-0 rounded-full border-4 border-neutral-800" /><div className="absolute inset-0 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" /></div><h3 className="mb-2 text-lg font-bold text-white">Analyzing video…</h3><p className="text-sm text-neutral-400">{progressText || 'Preparing your Short.'}</p></div>}
        {step === 'choose' && analysis && <div className="space-y-4"><div><h3 className="text-xl font-bold text-white">Choose your Short</h3><p className="mt-1 text-sm text-neutral-400">Nothing changes until you apply an option. You can Undo afterward.</p></div>{analysis.candidates.map((candidate, index) => { const excerpt = analysis.words.filter(word => word.start < candidate.end && word.end > candidate.start).map(word => word.word.trim()).join(' '); const estimatedRemoved = getRemovedSeconds(analysis.words, candidate); return <button key={`${candidate.start}-${index}`} onClick={() => setSelectedCandidate(index)} className={`w-full rounded-xl border p-4 text-left transition-colors ${selectedCandidate === index ? 'border-emerald-500 bg-emerald-500/10' : 'border-neutral-700 bg-neutral-800 hover:border-neutral-500'}`}><div className="flex items-center justify-between gap-3"><strong className="text-white">{candidate.title}</strong><span className="flex items-center gap-1 text-xs font-semibold text-emerald-300"><Clock className="h-3.5 w-3.5" />{formatTime(candidate.start)}–{formatTime(candidate.end)}</span></div>{candidate.scores && <div className="mt-2 grid grid-cols-4 gap-1 text-center text-[10px]"><span className="rounded bg-neutral-950/70 px-1 py-1 text-neutral-300">Curiosity <b className="text-yellow-300">{candidate.scores.curiosity}</b></span><span className="rounded bg-neutral-950/70 px-1 py-1 text-neutral-300">Clarity <b className="text-emerald-300">{candidate.scores.clarity}</b></span><span className="rounded bg-neutral-950/70 px-1 py-1 text-neutral-300">Emotion <b className="text-pink-300">{candidate.scores.emotion}</b></span><span className="rounded bg-neutral-950/70 px-1 py-1 text-neutral-300">Opening <b className="text-sky-300">{candidate.scores.opening}</b></span></div>}<div className="mt-2 text-xs font-semibold text-emerald-300">Dead-air tightening: {estimatedRemoved >= 0.1 ? `${estimatedRemoved.toFixed(1)}s removed` : 'no cut needed'}</div><p className="mt-2 text-sm text-neutral-400">{candidate.reason}</p><p className="mt-2 line-clamp-2 text-sm leading-5 text-neutral-300">“{excerpt}”</p></button>; })}<button onClick={applyCandidate} className="w-full rounded-xl bg-emerald-600 py-3 font-bold text-white hover:bg-emerald-500">Apply selected Short</button></div>}
        {step === 'applying' && <div className="py-12 text-center"><div className="mx-auto mb-5 h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" /><h3 className="font-bold text-white">Applying your selected Short…</h3></div>}
        {step === 'success' && <div className="py-8 text-center"><div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/20"><CheckCircle2 className="h-10 w-10 text-emerald-400" /></div><h3 className="mb-2 text-2xl font-bold text-white">Short created</h3><div className="mb-6 grid grid-cols-2 gap-3"><div className="rounded-lg bg-neutral-800 p-3"><strong className="block text-xl text-white">{createdCaptionCount}</strong><span className="text-xs text-neutral-400">timed emphasis states</span></div><div className="rounded-lg bg-neutral-800 p-3"><strong className="block text-xl text-emerald-300">{removedSeconds.toFixed(1)}s</strong><span className="text-xs text-neutral-400">dead air removed</span></div></div><div className="space-y-3"><button onClick={onClose} className="w-full rounded-xl bg-emerald-600 py-3 font-bold text-white hover:bg-emerald-500">Back to editor</button><button onClick={undoGrowthChanges} className="w-full rounded-xl border border-red-500/40 bg-red-500/10 py-3 font-bold text-red-200 hover:bg-red-500/20">Undo Growth changes</button><button onClick={() => setStep('choose')} className="w-full rounded-xl border border-neutral-700 bg-neutral-800 py-3 font-bold text-white hover:bg-neutral-700">Try another hook option</button></div></div>}
      </div>
    </div>
  </div>;
}
