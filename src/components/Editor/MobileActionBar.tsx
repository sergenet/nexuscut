"use client";

import React from 'react';
import { AudioLines, Captions, Scissors, SlidersHorizontal, Sparkles, Trash2, Type } from 'lucide-react';
import { useEditorStore } from '@/store/useEditorStore';

interface MobileActionBarProps {
  onOpenSidebar: () => void;
  onOpenProperties: () => void;
}

export default function MobileActionBar({ onOpenSidebar, onOpenProperties }: MobileActionBarProps) {
  const { selectedSegmentId, tracks, currentTime, splitSegment, removeSegment, selectSegment } = useEditorStore();
  const selected = tracks.flatMap(track => track.segments).find(segment => segment.id === selectedSegmentId);
  const openTab = (tab: string) => {
    onOpenSidebar();
    // The bottom sheet mounts its Sidebar after opening.
    window.setTimeout(() => window.dispatchEvent(new CustomEvent('mobile_open_sidebar_tab', { detail: tab })), 0);
  };

  return (
    <div className="h-[4.75rem] w-full shrink-0 bg-neutral-950 border-t border-neutral-800 z-30 safe-area-pb overflow-x-auto">
      <div className="flex h-16 min-w-max items-center gap-1 px-2">
      {selected ? <>
        <ActionButton label="Add media" icon={<span className="text-xl leading-5">＋</span>} onClick={() => openTab('media')} />
        <ActionButton label="Split" icon={<Scissors className="h-5 w-5" />} onClick={() => { splitSegment(selected.trackId, selected.id, currentTime); selectSegment(null); }} disabled={currentTime <= selected.start || currentTime >= selected.end} />
        <ActionButton label="Audio" icon={<AudioLines className="h-5 w-5" />} onClick={() => openTab('audio')} />
        <ActionButton label="Adjust" icon={<SlidersHorizontal className="h-5 w-5" />} onClick={onOpenProperties} />
        <ActionButton label="Delete" icon={<Trash2 className="h-5 w-5" />} onClick={() => { removeSegment(selected.trackId, selected.id); selectSegment(null); }} danger />
        <ActionButton label="Done" icon={<span className="text-lg leading-5">✓</span>} onClick={() => selectSegment(null)} />
      </> : <>
      <ActionButton label="Add media" icon={<span className="text-xl leading-5">＋</span>} onClick={() => openTab('media')} />
      <ActionButton label="Captions" icon={<Captions className="h-5 w-5" />} onClick={() => openTab('magic')} />
      <ActionButton label="Text" icon={<Type className="h-5 w-5" />} onClick={() => openTab('text')} />
      <ActionButton label="Audio" icon={<AudioLines className="h-5 w-5" />} onClick={() => openTab('audio')} />
      <ActionButton label="Effects" icon={<Sparkles className="h-5 w-5" />} onClick={() => openTab('effects')} />
      </>}
      </div>
    </div>
  );
}

function ActionButton({ label, icon, onClick, disabled = false, danger = false }: { label: string; icon: React.ReactNode; onClick: () => void; disabled?: boolean; danger?: boolean }) {
  return <button onClick={onClick} disabled={disabled} className={`flex h-14 min-w-[68px] flex-col items-center justify-center gap-1 rounded-lg px-2 text-[10px] font-bold transition-colors disabled:opacity-30 ${danger ? 'text-rose-400 hover:bg-rose-500/10 hover:text-rose-300' : 'text-neutral-300 hover:bg-white/10 hover:text-white'}`}>
    {icon}<span className="whitespace-nowrap">{label}</span>
  </button>;
}
