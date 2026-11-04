import React, { useEffect } from 'react';
import { useEditorStore } from '@/store/useEditorStore';

interface PlayheadControllerProps {
  timelineRef: React.RefObject<HTMLDivElement | null>;
}

export default function PlayheadController({ timelineRef }: PlayheadControllerProps) {
  const { currentTime, zoomLevel, isPlaying } = useEditorStore();

  // Auto-scroll timeline to keep playhead in view
  useEffect(() => {
    if (timelineRef.current) {
      const container = timelineRef.current;
      const headerWidth = typeof window !== 'undefined' && window.innerWidth < 1024 ? 48 : 192;
      const playheadX = currentTime * zoomLevel + headerWidth;
      const scrollLeft = container.scrollLeft;
      const containerWidth = container.clientWidth;
      
      // If playing, we want to smoothly scroll as it approaches the right edge.
      // If paused, we only jump if the playhead is completely off-screen (like clicking "Back to beginning")
      if (isPlaying) {
        if (playheadX > scrollLeft + containerWidth - 50) {
          container.scrollLeft = playheadX - containerWidth + 50;
        } else if (playheadX < scrollLeft + headerWidth) {
          container.scrollLeft = Math.max(0, playheadX - headerWidth);
        }
      } else {
        // When paused, only scroll if playhead is totally invisible
        if (playheadX > scrollLeft + containerWidth || playheadX < scrollLeft + headerWidth) {
          if (currentTime === 0) {
            container.scrollLeft = 0; // Snap exactly to start if at 0
          } else {
            container.scrollLeft = Math.max(0, playheadX - (containerWidth / 2)); // Center it
          }
        }
      }
    }
  }, [currentTime, zoomLevel, isPlaying, timelineRef]);

  const headerWidth = typeof window !== 'undefined' && window.innerWidth < 1024 ? 48 : 192;

  return (
    <div 
      className="absolute top-0 bottom-0 w-0 border-l-2 border-rose-500 z-50 pointer-events-none"
      style={{ left: `${(currentTime * zoomLevel) + headerWidth}px` }}
    >
      <div className="absolute -top-3 -left-[5px] w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[6px] border-t-rose-500" />
      <div className="absolute -top-[18px] -left-[1.5px] w-[3px] h-[6px] bg-rose-500" />
    </div>
  );
}
