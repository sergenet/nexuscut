"use client";

import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { useEditorStore, TrackSegment } from '@/store/useEditorStore';
import VideoThumbnails from './VideoThumbnails';

interface SegmentItemProps {
  segment: TrackSegment;
}

export default function SegmentItem({ segment }: SegmentItemProps) {
  const { zoomLevel, selectedSegmentId, selectSegment, updateSegment } = useEditorStore();
  
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: segment.id,
    data: {
      type: 'segment',
      segment
    }
  });

  const width = segment.duration * zoomLevel;
  const left = segment.start * zoomLevel;

  // Visual style based on track type
  const bgColors: Record<string, string> = {
    video: 'bg-indigo-500/20 border-indigo-500/50',
    audio: 'bg-emerald-500/20 border-emerald-500/50',
    text: 'bg-amber-500/20 border-amber-500/50',
    effect: 'bg-rose-500/20 border-rose-500/50',
    transition: 'bg-purple-500/20 border-purple-500/50',
  };

  const isSelected = selectedSegmentId === segment.id;

  const style: React.CSSProperties = {
    width: `${width}px`,
    left: `${left}px`,
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    zIndex: isDragging ? 50 : isSelected ? 10 : 1,
    opacity: isDragging ? 0.8 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      data-draggable="true"
      style={style}
      onClick={(e) => {
        e.stopPropagation();
        selectSegment(segment.id);
        window.dispatchEvent(new CustomEvent('segment_tapped', { detail: segment.id }));
      }}
      aria-label={`${segment.name || segment.type} clip. Tap to select.`}
      className={`group absolute rounded-md shadow-md flex items-center px-2 cursor-grab active:cursor-grabbing hover:brightness-110 transition-[filter,box-shadow] touch-manipulation select-none ${segment.type === 'audio' ? 'top-1 h-14 md:top-2 md:h-10' : 'top-2 h-10'} ${bgColors[segment.type]} ${
        isSelected ? 'ring-2 ring-white ring-offset-2 ring-offset-black z-20' : 'border border-white/10'
      }`}
    >
      {segment.type === 'audio' && <span className="pointer-events-auto absolute left-1/2 top-1/2 z-0 h-14 w-11 -translate-x-1/2 -translate-y-1/2 rounded-lg md:hidden" aria-hidden="true" />}
      {segment.type === 'video' && segment.src && (
        <VideoThumbnails src={segment.src} duration={segment.duration} width={width} />
      )}
      
      <div className="text-xs font-medium text-white truncate drop-shadow-md z-10 pointer-events-none">
        {segment.type === 'text' ? segment.text : `${segment.name || segment.type} clip`}
      </div>
      
      {/* Delete button (visible on hover or when selected) */}
      <button 
        onClick={(e) => {
          e.stopPropagation();
          useEditorStore.getState().removeSegment(segment.trackId, segment.id);
        }}
        className={`absolute -top-1 -right-1 min-h-9 min-w-9 md:min-h-0 md:min-w-0 p-2 md:p-1 bg-black rounded-full border border-neutral-700 text-neutral-300 hover:text-rose-400 hover:bg-neutral-900 transition-colors z-50 ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
        title="Delete Clip"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
      </button>

      {/* Transition Block (if any) */}
      {segment.transitionOut && (
        <div 
          className="absolute top-0 bottom-0 bg-amber-500/80 backdrop-blur-sm border-amber-400 z-30 flex items-center justify-center group/trans cursor-pointer hover:bg-amber-400/90 transition-colors rounded-md"
          style={{ 
            width: `${Math.min(width / 2, segment.transitionOut.duration * zoomLevel)}px`,
            right: `-${Math.min(width / 2, segment.transitionOut.duration * zoomLevel) / 2}px`
          }}
          title={`Transition: ${segment.transitionOut.type} (${segment.transitionOut.duration}s)`}
        >
          <div className="text-[10px] font-black text-amber-950 uppercase tracking-widest truncate px-1 opacity-50 group-hover/trans:opacity-100 transition-opacity">
            {segment.transitionOut.type.split(' ')[0]}
          </div>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              useEditorStore.getState().updateSegment(segment.trackId, segment.id, { transitionOut: undefined });
            }}
            className="absolute top-1 right-1 p-0.5 bg-black/60 rounded-sm text-neutral-300 hover:text-rose-400 hover:bg-black/90 transition-colors opacity-0 group-hover/trans:opacity-100 shadow-xl"
            title="Remove Transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>
      )}

      {/* Handles for resizing */}
      <div className="absolute left-0 w-2 h-full cursor-ew-resize hover:bg-white/20 opacity-0 hover:opacity-100 transition-opacity" />
      <div 
        onPointerDown={(e) => {
          e.stopPropagation();
          const startX = e.clientX;
          const startDuration = segment.duration;
          
          const handlePointerMove = (moveEvent: PointerEvent) => {
            const deltaX = moveEvent.clientX - startX;
            const deltaSeconds = deltaX / useEditorStore.getState().zoomLevel;
            const newDuration = Math.max(0.5, startDuration + deltaSeconds);
            
            updateSegment(segment.trackId, segment.id, {
              duration: newDuration,
              end: segment.start + newDuration
            });
          };

          const handlePointerUp = () => {
            window.removeEventListener('pointermove', handlePointerMove);
            window.removeEventListener('pointerup', handlePointerUp);
          };

          window.addEventListener('pointermove', handlePointerMove);
          window.addEventListener('pointerup', handlePointerUp);
        }}
        className="absolute right-0 w-3 h-full cursor-ew-resize hover:bg-white/40 opacity-0 hover:opacity-100 transition-opacity bg-white/20 z-40" 
      />
    </div>
  );
}
