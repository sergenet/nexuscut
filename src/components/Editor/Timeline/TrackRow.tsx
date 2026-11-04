"use client";

import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { useEditorStore } from '@/store/useEditorStore';
import { Track } from '@/store/useEditorStore';
import SegmentItem from './SegmentItem';
import { Video, Music, Type, Wand2, Eye, EyeOff, Lock, Unlock } from 'lucide-react';

interface TrackRowProps {
  track: Track;
}

export default function TrackRow({ track }: TrackRowProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: `track-${track.id}`,
    data: {
      type: 'track',
      track
    },
    disabled: track.isLocked
  });

  const { toggleTrackVisibility, toggleTrackLock } = useEditorStore();

  const getIcon = () => {
    switch (track.type) {
      case 'video': return <Video className="w-4 h-4 text-indigo-400" />;
      case 'audio': return <Music className="w-4 h-4 text-emerald-400" />;
      case 'text': return <Type className="w-4 h-4 text-rose-400" />;
      case 'effect': return <Wand2 className="w-4 h-4 text-amber-400" />;
      default: return <Video className="w-4 h-4" />;
    }
  };

  return (
    <div className={`flex h-16 border-b border-neutral-800 transition-colors group ${track.isLocked ? 'bg-[url("/stripes.png")] bg-neutral-900/80' : 'bg-neutral-900/50'}`}>
      
      {/* Track Header (Sticky Left) */}
      <div className={`w-12 lg:w-48 flex-shrink-0 bg-neutral-900 border-r border-neutral-800 flex items-center px-2 lg:px-3 justify-center lg:justify-between z-30 sticky left-0 shadow-[4px_0_12px_rgba(0,0,0,0.5)] cursor-default ${track.isLocked ? 'opacity-80' : ''}`}>
        <div className="flex items-center gap-2 overflow-hidden">
          {getIcon()}
          <span className="hidden lg:inline-block text-xs font-semibold text-neutral-300 truncate">{track.name}</span>
        </div>
        <div className={`hidden lg:flex items-center gap-1 transition-opacity ${track.isHidden || track.isLocked ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
          <button 
            onClick={(e) => { e.stopPropagation(); toggleTrackVisibility(track.id); }}
            className={`transition-colors p-1 ${track.isHidden ? 'text-rose-500 hover:text-rose-400' : 'text-neutral-500 hover:text-white'}`}
            title={track.isHidden ? "Show Track" : "Hide Track"}
          >
            {track.isHidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); toggleTrackLock(track.id); }}
            className={`transition-colors p-1 ${track.isLocked ? 'text-amber-500 hover:text-amber-400' : 'text-neutral-500 hover:text-white'}`}
            title={track.isLocked ? "Unlock Track" : "Lock Track"}
          >
            {track.isLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Track Canvas (Droppable Area) */}
      <div 
        ref={setNodeRef} 
        className={`flex-1 relative transition-all ${isOver && !track.isLocked ? 'bg-white/5' : ''} ${track.isHidden ? 'opacity-30' : ''} ${track.isLocked ? 'pointer-events-none' : ''}`}
      >
        {/* Render Segments */}
        {track.segments.map(segment => (
          <SegmentItem key={segment.id} segment={segment} />
        ))}
      </div>
      
    </div>
  );
}
