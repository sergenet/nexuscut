"use client";

import { toast } from '@/lib/toast';
import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Crown, Loader2, RotateCcw, Scissors, Sparkles, X } from 'lucide-react';
import { TranscriptWord, useEditorStore } from '@/store/useEditorStore';
import { trackEvent } from '@/lib/analytics';

type Suggestion = { wordIds: string[]; reason: 'filler' | 'repetition'; label: string };
type AnalysisResponse = { suggestions?: Suggestion[]; error?: string; code?: string };

interface ScriptCutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ScriptCutModal({ isOpen, onClose }: ScriptCutModalProps) {
  const words = useEditorStore(state => state.transcriptionWords);
  const applyScriptCuts = useEditorStore(state => state.applyScriptCuts);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'locked' | 'error'>('idle');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    if (words.length === 0) return;
    let active = true;
    fetch('/api/scriptcut/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ words: words.map(({ id, text, start, end }) => ({ id, text, start, end })) }),
    }).then(async response => {
      const data = await response.json() as AnalysisResponse;
      if (!active) return;
      if (response.status === 403 && data.code === 'PRO_REQUIRED') {
        setStatus('locked');
        setMessage(data.error || 'Nexus ScriptCut is available on Pro.');
        return;
      }
      if (!response.ok) throw new Error(data.error || 'ScriptCut could not analyze this transcript.');
      const nextSuggestions = data.suggestions || [];
      setSuggestions(nextSuggestions);
      setSelectedIds(new Set(nextSuggestions.flatMap(suggestion => suggestion.wordIds)));
      setStatus('ready');
      trackEvent('scriptcut_analyzed', { suggestion_count: nextSuggestions.length });
    }).catch(error => {
      if (!active) return;
      setStatus('error');
      setMessage(error instanceof Error ? error.message : 'ScriptCut analysis failed.');
    });
    return () => { active = false; };
  }, [isOpen, words]);

  const selectedWords = useMemo(() => words.filter(word => selectedIds.has(word.id)), [selectedIds, words]);
  const estimatedRemoval = useMemo(() => selectedWords.reduce((total, word) => total + Math.max(0, word.end - word.start), 0), [selectedWords]);
  const suggestedIds = useMemo(() => new Set(suggestions.flatMap(suggestion => suggestion.wordIds)), [suggestions]);

  if (!isOpen) return null;

  const toggleWord = (word: TranscriptWord) => {
    setSelectedIds(current => {
      const next = new Set(current);
      if (next.has(word.id)) next.delete(word.id); else next.add(word.id);
      return next;
    });
  };

  const applyCuts = () => {
    if (selectedIds.size === 0) return;
    const removed = applyScriptCuts([...selectedIds]);
    trackEvent('scriptcut_applied', { word_count: selectedIds.size, seconds_removed: Number(removed.toFixed(2)) });
    toast(`Nexus ScriptCut removed ${selectedIds.size} word${selectedIds.size === 1 ? '' : 's'} and approximately ${removed.toFixed(1)} seconds. Use Undo to restore the edit.`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/85 p-3 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="scriptcut-title">
      <div className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-violet-500/30 bg-neutral-950 shadow-2xl shadow-violet-950/50">
        <header className="flex items-center justify-between border-b border-neutral-800 p-5">
          <div>
            <div className="mb-1 flex items-center gap-2"><Sparkles className="h-5 w-5 text-violet-400" /><span className="text-xs font-black uppercase tracking-[.2em] text-violet-300">Pro</span></div>
            <h2 id="scriptcut-title" className="text-2xl font-black text-white">Nexus ScriptCut</h2>
            <p className="mt-1 text-sm text-neutral-400">Delete spoken words by selecting transcript text. Suggested cuts remain optional.</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-neutral-400 hover:bg-neutral-800 hover:text-white" aria-label="Close ScriptCut"><X className="h-5 w-5" /></button>
        </header>

        {words.length > 0 && status === 'loading' && <div className="grid flex-1 place-items-center p-16 text-neutral-300"><div className="text-center"><Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-violet-400" /><p>Finding filler words and repeated takes…</p></div></div>}

        {words.length === 0 && <div className="grid flex-1 place-items-center p-10"><div className="max-w-lg text-center"><p className="text-neutral-300">Generate Auto Captions first. ScriptCut needs the transcript&apos;s word-level timing data.</p><button onClick={onClose} className="mt-6 rounded-xl bg-neutral-800 px-5 py-3 font-bold text-white">Close</button></div></div>}

        {words.length > 0 && status === 'locked' && <div className="grid flex-1 place-items-center p-10"><div className="max-w-lg text-center"><Crown className="mx-auto mb-4 h-12 w-12 text-amber-300" /><h3 className="text-2xl font-black text-white">Unlock Nexus ScriptCut</h3><p className="mt-3 text-neutral-400">{message}</p><Link href="/pricing#pro-tier" className="mt-6 inline-flex rounded-xl bg-violet-600 px-6 py-3 font-bold text-white hover:bg-violet-500">Upgrade to Pro</Link></div></div>}

        {words.length > 0 && status === 'error' && <div className="grid flex-1 place-items-center p-10"><div className="max-w-lg text-center"><p className="text-neutral-300">{message}</p><button onClick={onClose} className="mt-6 rounded-xl bg-neutral-800 px-5 py-3 font-bold text-white">Close</button></div></div>}

        {words.length > 0 && status === 'ready' && <>
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-800 bg-neutral-900/60 px-5 py-3 text-sm">
            <div className="text-neutral-300"><strong className="text-white">{selectedIds.size}</strong> words selected · approximately <strong className="text-white">{estimatedRemoval.toFixed(1)}s</strong> of speech</div>
            <div className="flex gap-2">
              <button onClick={() => setSelectedIds(new Set(suggestedIds))} className="rounded-lg border border-violet-500/30 px-3 py-2 font-bold text-violet-300 hover:bg-violet-500/10"><Sparkles className="mr-1 inline h-4 w-4" />Select suggestions</button>
              <button onClick={() => setSelectedIds(new Set())} className="rounded-lg border border-neutral-700 px-3 py-2 font-bold text-neutral-300 hover:bg-neutral-800"><RotateCcw className="mr-1 inline h-4 w-4" />Clear</button>
            </div>
          </div>
          <div className="overflow-y-auto p-5">
            <div className="mb-4 rounded-xl border border-neutral-800 bg-neutral-900 p-4 text-sm text-neutral-400">
              Violet words are ScriptCut suggestions. Click any word to include or exclude it. Listen after applying; Undo restores the complete timeline and transcript.
            </div>
            <div className="flex flex-wrap gap-1.5 leading-8">
              {words.map(word => {
                const selected = selectedIds.has(word.id);
                const suggested = suggestedIds.has(word.id);
                return <button key={word.id} onClick={() => toggleWord(word)} title={`${word.start.toFixed(2)}s–${word.end.toFixed(2)}s`} className={`rounded-md border px-2 py-1 text-sm transition ${selected ? 'border-rose-400 bg-rose-500/20 text-rose-100 line-through' : suggested ? 'border-violet-500/50 bg-violet-500/10 text-violet-200' : 'border-neutral-800 bg-neutral-900 text-neutral-200 hover:border-neutral-600'}`}>{word.text}</button>;
              })}
            </div>
          </div>
          <footer className="flex items-center justify-between gap-3 border-t border-neutral-800 p-5">
            <p className="hidden text-xs text-neutral-500 sm:block">No cut is automatic. Review the selected words before applying.</p>
            <div className="ml-auto flex gap-3"><button onClick={onClose} className="rounded-xl border border-neutral-700 px-5 py-3 font-bold text-neutral-300 hover:bg-neutral-800">Cancel</button><button onClick={applyCuts} disabled={selectedIds.size === 0} className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-5 py-3 font-bold text-white hover:bg-rose-500 disabled:cursor-not-allowed disabled:opacity-40"><Scissors className="h-4 w-4" />Apply reversible cuts</button></div>
          </footer>
        </>}
      </div>
    </div>
  );
}
