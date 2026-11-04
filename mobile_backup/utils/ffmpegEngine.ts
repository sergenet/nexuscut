let ffmpegInstance: any = null;

export const getFFmpeg = async (onProgress?: (progress: number) => void): Promise<any> => {
  if (ffmpegInstance) {
    if (onProgress) {
      ffmpegInstance.on('progress', ({ progress }: any) => onProgress(progress));
    }
    return ffmpegInstance;
  }

  // Dynamically load the FFmpeg UMD script to bypass Metro bundler dynamic import issues
  if (typeof window !== 'undefined' && !(window as any).FFmpegWASM) {
    await new Promise<void>((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/@ffmpeg/ffmpeg@0.12.10/dist/umd/ffmpeg.js';
      script.onload = () => resolve();
      script.onerror = reject;
      document.head.appendChild(script);
    });
    
    await new Promise<void>((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/@ffmpeg/util@0.12.1/dist/umd/index.js';
      script.onload = () => resolve();
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  const { FFmpeg } = (window as any).FFmpegWASM;
  const { toBlobURL } = (window as any).FFmpegUtil;

  ffmpegInstance = new FFmpeg();

  if (onProgress) {
    ffmpegInstance.on('progress', ({ progress }: any) => onProgress(progress));
  }

  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const cacheBuster = `?t=${Date.now()}`;
  
  await ffmpegInstance.load({
    coreURL: `${origin}/ffmpeg/ffmpeg-core.js${cacheBuster}`,
    wasmURL: `${origin}/ffmpeg/ffmpeg-core.wasm${cacheBuster}`,
    classWorkerURL: `${origin}/ffmpeg/814.ffmpeg.js${cacheBuster}`
  });

  return ffmpegInstance;
};

export const loadMediaToFFmpeg = async (ffmpeg: any, fileName: string, mediaUri: string) => {
  const { fetchFile } = (window as any).FFmpegUtil;
  try {
    const data = await fetchFile(mediaUri);
    await ffmpeg.writeFile(fileName, data);
  } catch (error) {
    console.error(`Failed to load media ${fileName} into FFmpeg:`, error);
    throw error;
  }
};

