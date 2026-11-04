import React, { useEffect, useRef } from 'react';
import { TrackSegment } from '@/store/useEditorStore';

interface TrackVideoProps {
  activeVideo: TrackSegment;
  isMuted: boolean;
  frameMode: 'fit' | 'fill';
  onDurationResolved?: (duration: number) => void;
}

export const TrackVideo = React.memo(React.forwardRef<HTMLVideoElement, TrackVideoProps>(({ activeVideo, isMuted, frameMode, onDurationResolved }, ref) => {
  const localRef = useRef<HTMLVideoElement>(null);
  const onDurationResolvedRef = useRef(onDurationResolved);
  const lastResolvedRef = useRef<string | null>(null);

  useEffect(() => {
    onDurationResolvedRef.current = onDurationResolved;
  }, [onDurationResolved]);
  
  useEffect(() => {
    return () => {
      if (localRef.current) {
        localRef.current.pause();
      }
    };
  }, []);

  useEffect(() => {
    if (localRef.current && activeVideo.src) {
      localRef.current.load();
    }
  }, [activeVideo.src]);

  const handleRef = React.useCallback((el: HTMLVideoElement | null) => {
    localRef.current = el;
    if (typeof ref === 'function') ref(el);
    else if (ref) ref.current = el;
  }, [ref]);

  const reportDuration = React.useCallback(() => {
    const media = localRef.current;
    const duration = media?.duration;
    if (!duration || !Number.isFinite(duration) || duration <= 0 || !onDurationResolvedRef.current) return;

    const key = `${activeVideo.id}:${activeVideo.src}:${duration}`;
    if (lastResolvedRef.current === key) return;
    lastResolvedRef.current = key;
    onDurationResolvedRef.current(duration);
  }, [activeVideo.id, activeVideo.src]);

  const visualEffectFilter: Record<string, string> = {
    mono: 'grayscale(1)',
    warm: 'sepia(0.28) saturate(1.18) brightness(1.04)',
    cool: 'saturate(1.08) hue-rotate(8deg) brightness(1.03)',
    contrast: 'contrast(1.2) saturate(1.12)',
  };

  return (
    <video 
      ref={handleRef}
      src={activeVideo.src}
      className={`w-full h-full ${frameMode === 'fill' ? 'object-cover' : 'object-contain'} transition-transform`}
      style={{
         transform: `scale(${activeVideo.scale ?? 1}) translate3d(${(activeVideo.x || 50) - 50}%, ${(activeVideo.y || 50) - 50}%, 0)`,
         WebkitTransform: `scale(${activeVideo.scale ?? 1}) translate3d(${(activeVideo.x || 50) - 50}%, ${(activeVideo.y || 50) - 50}%, 0)`,
         opacity: activeVideo.opacity ?? 1,
         filter: visualEffectFilter[activeVideo.visualEffect || ''] || undefined,
      }}
      muted={isMuted}
      playsInline
      preload="auto"
      onLoadedMetadata={reportDuration}
      onDurationChange={reportDuration}
      onCanPlay={reportDuration}
    />
  );
}));

TrackVideo.displayName = 'TrackVideo';

interface TrackAudioProps {
  audioSeg: TrackSegment;
  onRef: (el: HTMLAudioElement | null) => void;
}

export const TrackAudio: React.FC<TrackAudioProps> = React.memo(({ audioSeg, onRef }) => {
  const localRef = useRef<HTMLAudioElement>(null);
  
  useEffect(() => {
    return () => {
      if (localRef.current) {
        localRef.current.pause();
        localRef.current.removeAttribute('src');
        localRef.current.load();
      }
    };
  }, []);

  const handleRef = React.useCallback((el: HTMLAudioElement | null) => {
    localRef.current = el;
    onRef(el);
  }, [onRef]);

  return (
    <audio 
      ref={handleRef}
      src={audioSeg.src} 
      preload="auto"
      className="hidden"
    />
  );
});

TrackAudio.displayName = 'TrackAudio';
