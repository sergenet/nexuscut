import { Platform } from 'react-native';

const frameCache = new Map<string, string[]>();

export class FrameExtractor {
  static async extractFrames(
    uri: string,
    duration: number,
    interval: number = 5,
    quality: number = 0.5
  ): Promise<string[]> {
    if (Platform.OS !== 'web') {
      console.warn("FrameExtractor is currently only implemented for Web.");
      return [];
    }

    const cacheKey = `${uri}_${duration}_${interval}`;
    if (frameCache.has(cacheKey)) {
      return frameCache.get(cacheKey)!;
    }

    return new Promise((resolve) => {
      try {
        const video = document.createElement('video');
        video.src = uri;
        video.crossOrigin = 'anonymous';
        video.muted = true;
        video.playsInline = true;
        
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        const frames: string[] = [];
        
        let currentTime = 0.1; // offset slightly to guarantee first frame isn't black

        video.addEventListener('loadeddata', () => {
          // Low-res extraction for performance
          const targetHeight = 60;
          const targetWidth = Math.floor(video.videoWidth * (targetHeight / video.videoHeight));
          canvas.width = targetWidth || 106;
          canvas.height = targetHeight;
          
          const captureFrame = () => {
            if (currentTime >= duration || currentTime > video.duration) {
              frameCache.set(cacheKey, frames);
              resolve(frames);
              return;
            }
            
            if (ctx) {
              ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
              frames.push(canvas.toDataURL('image/jpeg', quality));
            }
            
            currentTime += interval;
            video.currentTime = currentTime;
          };

          video.addEventListener('seeked', captureFrame);
          
          // Start extraction
          video.currentTime = currentTime;
        });

        video.addEventListener('error', () => {
          console.error("Frame extraction failed for", uri);
          resolve([]);
        });
        
        video.load();

      } catch (e) {
        console.error("Error setting up frame extractor:", e);
        resolve([]);
      }
    });
  }
}
