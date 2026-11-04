import React, { useEffect, useState } from 'react';
import { useEditorStore } from '@/store/useEditorStore';

interface VideoThumbnailsProps {
  src: string;
  duration: number;
  width: number;
}

export default function VideoThumbnails({ src, duration, width }: VideoThumbnailsProps) {
  const [thumbnails, setThumbnails] = useState<string[]>([]);
  const [isMobile] = useState(() => typeof window !== 'undefined' && window.matchMedia('(max-width: 1023px)').matches);
  const libraryThumbnail = useEditorStore((state) => state.mediaLibrary.find(item => item.url === src)?.thumbnailUrl);
  
  useEffect(() => {
    let active = true;
    if (!src) return;
    
    // A long timeline can otherwise trigger hundreds of seeks and data-URL
    // allocations. Phones get a lightweight visual guide instead.
    const mobile = window.matchMedia('(max-width: 1023px)').matches;
    // iOS/Android can defer or reject repeated off-screen video seeks. Every
    // imported video already gets a cover frame, so use that dependable image
    // for a compact mobile filmstrip instead of leaving the clip blank.
    if (mobile && libraryThumbnail) {
      const count = Math.min(36, Math.max(1, Math.ceil(width / 64)));
      queueMicrotask(() => {
        if (active) setThumbnails(Array.from({ length: count }, () => libraryThumbnail));
      });
      return;
    }
    const numThumbnails = mobile
      ? Math.min(12, Math.max(1, Math.floor(width / 120)))
      : Math.min(80, Math.max(1, Math.floor(width / 50)));
    
    const video = document.createElement('video');
    video.src = src;
    video.muted = true;
    video.playsInline = true;
    video.crossOrigin = 'anonymous';
    
    video.onloadeddata = async () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      // Calculate scaled dimensions for the thumbnail
      const aspect = video.videoWidth / video.videoHeight || 16/9;
      // Generate at a higher resolution than its timeline display. The old
      // 60px source was stretched across very wide phone clips and looked
      // indistinct. The mobile layout below also prevents that stretching.
      canvas.width = 160;
      canvas.height = Math.max(90, Math.round(160 / aspect));
      
      const newThumbnails: string[] = [];
      const interval = duration / numThumbnails;
      
      for (let i = 0; i < numThumbnails; i++) {
        if (!active) break;
        // Seek to the time interval, +0.1 to avoid pure black first frame usually at 0.0s
        video.currentTime = Math.min(i * interval + 0.1, duration - 0.1);
        
        await new Promise(resolve => {
           video.onseeked = resolve;
           video.onerror = resolve;
        });
        
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        newThumbnails.push(canvas.toDataURL('image/jpeg', 0.72));
      }
      
      if (active) {
        setThumbnails(newThumbnails);
      }
    };
    
    return () => {
      active = false;
      // Removed video.src = '' to prevent iOS Safari from destroying the shared Blob URL decoder state
    };
  }, [src, duration, width, libraryThumbnail]);
  
  return (
    <div className="absolute inset-0 flex overflow-hidden pointer-events-none rounded-md bg-neutral-900">
      {thumbnails.map((t, i) => (
        <img key={i} src={t} alt="" className={isMobile ? 'h-full w-16 max-w-full flex-none object-cover opacity-75' : 'h-full object-cover flex-1 min-w-0'} />
      ))}
    </div>
  );
}
